/**
 * google.script.run entry points called from the client. Every function
 * here re-validates the session token and enforces the same role/status
 * rules the original prototype only enforced in the browser, so a client
 * that bypasses the UI still can't write data it shouldn't be able to.
 * Every read-modify-write against ContractState is wrapped in a script
 * lock so two people saving at once can't clobber each other's write.
 */

function apiGetState(token) {
  var session = requireSession_(token);
  var state = loadContractState_(DEFAULT_CONTRACT_ID);
  return { ok: true, state: state, session: session };
}

/**
 * Full-state sync used for section saves (media / organizations /
 * categories / tags / autoDelivery) and contract edits. The server only
 * applies the parts of the incoming payload the caller's role is allowed
 * to touch, ignoring the rest, so the persisted state can't be corrupted
 * by a client sending fields it isn't permitted to edit.
 */
function apiSaveState(token, incoming) {
  var session = requireSession_(token);
  return withStateLock_(function () {
    var current = loadContractState_(DEFAULT_CONTRACT_ID);

    if (session.role === 'staff') {
      if (!incoming || !incoming.contract) {
        throw new Error('INVALID_PAYLOAD');
      }
      current.contract = {
        contractId: String(incoming.contract.contractId || current.contract.contractId),
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

    saveContractState_(DEFAULT_CONTRACT_ID, current);
    return { ok: true, state: current };
  });
}

function apiSubmit(token) {
  var session = requireSession_(token);
  if (session.role !== 'customer') throw new Error('PERMISSION_DENIED');
  return withStateLock_(function () {
    var state = loadContractState_(DEFAULT_CONTRACT_ID);
    if (state.status !== 'draft' && state.status !== 'rejected') {
      throw new Error('LOCKED: すでに提出済みです。');
    }
    state.status = 'submitted';
    state.rejectComment = '';
    saveContractState_(DEFAULT_CONTRACT_ID, state);
    return { ok: true, state: state };
  });
}

function apiConfirm(token) {
  var session = requireSession_(token);
  if (session.role !== 'staff') throw new Error('PERMISSION_DENIED');
  return withStateLock_(function () {
    var state = loadContractState_(DEFAULT_CONTRACT_ID);
    if (state.status !== 'submitted') throw new Error('INVALID_STATE: 提出済みの内容がありません。');
    state.status = 'confirmed';
    saveContractState_(DEFAULT_CONTRACT_ID, state);
    return { ok: true, state: state };
  });
}

function apiReject(token, comment) {
  var session = requireSession_(token);
  if (session.role !== 'staff') throw new Error('PERMISSION_DENIED');
  comment = String(comment || '').trim();
  if (!comment) throw new Error('COMMENT_REQUIRED: 差し戻しコメントを入力してください。');
  return withStateLock_(function () {
    var state = loadContractState_(DEFAULT_CONTRACT_ID);
    if (state.status !== 'submitted') throw new Error('INVALID_STATE: 提出済みの内容がありません。');
    state.status = 'rejected';
    state.rejectComment = comment;
    saveContractState_(DEFAULT_CONTRACT_ID, state);
    return { ok: true, state: state };
  });
}

/** Resets the shared demo contract data. Does not affect login sessions. */
function apiResetDemo(token) {
  requireSession_(token);
  return withStateLock_(function () {
    var state = defaultState_();
    saveContractState_(DEFAULT_CONTRACT_ID, state);
    return { ok: true, state: state };
  });
}
