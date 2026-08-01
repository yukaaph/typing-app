/**
 * google.script.run entry points called from the client. Every function
 * here re-validates the session token and enforces the same role/status
 * rules the original prototype only enforced in the browser, so a client
 * that bypasses the UI still can't write data it shouldn't be able to.
 * Every read-modify-write against a ContractState row is wrapped in a
 * script lock so two people saving at once can't clobber each other.
 *
 * Data separation: a customer session is hard-pinned to the contractId
 * baked into their password at issuance time — whatever contractId the
 * client sends is ignored for customers, so one municipality can never
 * read or write another's data even by tampering with the request. Staff
 * sessions have no fixed contractId and must explicitly pick one (via
 * apiListContracts / the "契約一覧" screen) for every call.
 */

/** Resolves which contract a call may act on, enforcing the role rule above. */
function resolveContractId_(session, requestedContractId) {
  if (session.role === 'customer') {
    if (!session.contractId) {
      throw new Error('CONTRACT_NOT_ASSIGNED: このアカウントには契約が紐づいていません。');
    }
    return session.contractId;
  }
  if (session.role === 'staff') {
    requestedContractId = String(requestedContractId || '');
    if (!requestedContractId) {
      throw new Error('CONTRACT_ID_REQUIRED: 契約を選択してください。');
    }
    return requestedContractId;
  }
  throw new Error('PERMISSION_DENIED');
}

/** Lightweight session check used on page load, before any contract is picked. */
function apiWhoAmI(token) {
  var session = requireSession_(token);
  return { ok: true, session: session };
}

/** Staff-only: list every municipality's contract for the "契約一覧" screen. */
function apiListContracts(token) {
  var session = requireSession_(token);
  if (session.role !== 'staff') throw new Error('PERMISSION_DENIED');
  return { ok: true, contracts: listContracts_() };
}

function apiGetState(token, contractId) {
  var session = requireSession_(token);
  var resolvedId = resolveContractId_(session, contractId);
  var state = loadContractState_(resolvedId);
  return { ok: true, state: state, session: session, contractId: resolvedId };
}

/**
 * Full-state sync used for section saves (media / organizations /
 * categories / tags / autoDelivery) and contract edits. The server only
 * applies the parts of the incoming payload the caller's role is allowed
 * to touch, ignoring the rest, so the persisted state can't be corrupted
 * by a client sending fields it isn't permitted to edit. contractId is
 * always taken from resolveContractId_, never from incoming.contract, so
 * a contract's id can't be changed out from under its Users-sheet rows.
 */
function apiSaveState(token, contractId, incoming) {
  var session = requireSession_(token);
  var resolvedId = resolveContractId_(session, contractId);
  return withStateLock_(function () {
    var current = loadContractState_(resolvedId);

    if (session.role === 'staff') {
      if (!incoming || !incoming.contract) {
        throw new Error('INVALID_PAYLOAD');
      }
      current.contract = {
        contractId: resolvedId,
        customerName: String(incoming.contract.customerName || current.contract.customerName || ''),
        plan: String(incoming.contract.plan || current.contract.plan),
        startDate: String(incoming.contract.startDate || current.contract.startDate),
        staffName: String(incoming.contract.staffName || current.contract.staffName)
      };
    } else if (session.role === 'customer') {
      if (current.status !== 'draft' && current.status !== 'rejected') {
        throw new Error('LOCKED: 提出済みのため編集できません。');
      }
      current.media = incoming.media || current.media;
      current.organizations = Array.isArray(incoming.organizations) ? incoming.organizations : current.organizations;
      current.categories = Array.isArray(incoming.categories) ? incoming.categories : current.categories;
      current.tags = Array.isArray(incoming.tags) ? incoming.tags : current.tags;
      current.autoDelivery = incoming.autoDelivery || current.autoDelivery;
    } else {
      throw new Error('PERMISSION_DENIED');
    }

    saveContractState_(resolvedId, current);
    return { ok: true, state: current, contractId: resolvedId };
  });
}

function apiSubmit(token, contractId) {
  var session = requireSession_(token);
  if (session.role !== 'customer') throw new Error('PERMISSION_DENIED');
  var resolvedId = resolveContractId_(session, contractId);
  return withStateLock_(function () {
    var state = loadContractState_(resolvedId);
    if (state.status !== 'draft' && state.status !== 'rejected') {
      throw new Error('LOCKED: すでに提出済みです。');
    }
    state.status = 'submitted';
    state.rejectComment = '';
    saveContractState_(resolvedId, state);
    return { ok: true, state: state, contractId: resolvedId };
  });
}

function apiConfirm(token, contractId) {
  var session = requireSession_(token);
  if (session.role !== 'staff') throw new Error('PERMISSION_DENIED');
  var resolvedId = resolveContractId_(session, contractId);
  return withStateLock_(function () {
    var state = loadContractState_(resolvedId);
    if (state.status !== 'submitted') throw new Error('INVALID_STATE: 提出済みの内容がありません。');
    state.status = 'confirmed';
    saveContractState_(resolvedId, state);
    return { ok: true, state: state, contractId: resolvedId };
  });
}

function apiReject(token, contractId, comment) {
  var session = requireSession_(token);
  if (session.role !== 'staff') throw new Error('PERMISSION_DENIED');
  var resolvedId = resolveContractId_(session, contractId);
  comment = String(comment || '').trim();
  if (!comment) throw new Error('COMMENT_REQUIRED: 差し戻しコメントを入力してください。');
  return withStateLock_(function () {
    var state = loadContractState_(resolvedId);
    if (state.status !== 'submitted') throw new Error('INVALID_STATE: 提出済みの内容がありません。');
    state.status = 'rejected';
    state.rejectComment = comment;
    saveContractState_(resolvedId, state);
    return { ok: true, state: state, contractId: resolvedId };
  });
}

/** Resets one contract's data back to defaults. Does not affect login sessions. */
function apiResetDemo(token, contractId) {
  var session = requireSession_(token);
  var resolvedId = resolveContractId_(session, contractId);
  return withStateLock_(function () {
    var existing = loadContractState_(resolvedId);
    var state = defaultState_(existing.contract.customerName);
    state.contract.contractId = resolvedId;
    saveContractState_(resolvedId, state);
    return { ok: true, state: state, contractId: resolvedId };
  });
}
