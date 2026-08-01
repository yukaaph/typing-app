/**
 * Storage layer. Each municipality's app state (mirroring the client-side
 * shape used by the original static prototype) is kept as one JSON blob
 * per contract in the "ContractState" sheet — one row per 自治体, keyed
 * by contractId — rather than a fully normalized schema. This keeps the
 * port close to the original prototype's data model while still being
 * backed by a real spreadsheet "database" with real data separation.
 */

var DEFAULT_CONTRACT_ID = 'C-2026-0001'; // seeded by setupSpreadsheet() for the demo customer account

function defaultState_(customerName) {
  return {
    contract: {
      contractId: DEFAULT_CONTRACT_ID,
      customerName: customerName || '',
      plan: 'スタンダードプラン',
      startDate: '2026-04-01',
      staffName: '山田 太郎（弊社担当）'
    },
    media: { managerName: '', managerEmail: '', fromEmail: '', lineToken: '' },
    organizations: [],
    categories: [],
    tags: [],
    autoDelivery: { categoryId: '', tagIds: [], level: '' },
    status: 'draft',
    rejectComment: ''
  };
}

function getStateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('ContractState');
  if (!sheet) {
    throw new Error('ContractState シートが見つかりません。先に setupSpreadsheet() を実行してください。');
  }
  return sheet;
}

function findStateRow_(sheet, contractId) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === contractId) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

/** Throws if the contract doesn't exist — contracts are only created
 * explicitly via createContractState_ (at password-issuance time), never
 * silently on read, so a bad/stale contractId can't spawn a blank row. */
function loadContractState_(contractId) {
  var sheet = getStateSheet_();
  var rowIndex = findStateRow_(sheet, contractId);
  if (rowIndex === -1) {
    throw new Error('CONTRACT_NOT_FOUND: 指定された契約が見つかりません。');
  }
  var json = sheet.getRange(rowIndex, 2).getValue();
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new Error('CONTRACT_STATE_CORRUPT: 契約データの読み込みに失敗しました。');
  }
}

function saveContractState_(contractId, state) {
  var sheet = getStateSheet_();
  var rowIndex = findStateRow_(sheet, contractId);
  var json = JSON.stringify(state);
  if (rowIndex === -1) {
    sheet.appendRow([contractId, json, new Date()]);
  } else {
    sheet.getRange(rowIndex, 2, 1, 2).setValues([[json, new Date()]]);
  }
}

/** Creates a brand-new, empty contract. Called once per 自治体 when a
 * customer password is issued (see Admin.gs / issueAccessPassword_). */
function createContractState_(contractId, customerName) {
  var state = defaultState_(customerName);
  state.contract.contractId = contractId;
  saveContractState_(contractId, state);
  return state;
}

/** Generates the next "C-YYYY-NNNN" contract id, skipping any collision. */
function generateContractId_() {
  var sheet = getStateSheet_();
  var count = Math.max(sheet.getLastRow() - 1, 0);
  var year = new Date().getFullYear();
  var candidate;
  do {
    count++;
    candidate = 'C-' + year + '-' + ('0000' + count).slice(-4);
  } while (findStateRow_(sheet, candidate) !== -1);
  return candidate;
}

/** Summary list of all contracts, for the staff "契約一覧" screen. */
function listContracts_() {
  var sheet = getStateSheet_();
  var rows = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var contractId = String(rows[i][0]);
    var updatedAt = rows[i][2];
    try {
      var state = JSON.parse(rows[i][1]);
      result.push({
        contractId: contractId,
        customerName: state.contract.customerName || '',
        status: state.status,
        updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : String(updatedAt)
      });
    } catch (e) {
      result.push({ contractId: contractId, customerName: '(読み込みエラー)', status: 'unknown', updatedAt: '' });
    }
  }
  return result;
}

/**
 * Serializes read-modify-write access to a ContractState row so two people
 * saving the same contract at the same moment can't clobber each other's
 * write. (Different contracts don't contend with each other in practice,
 * but a single script-wide lock is simplest and the hold time is short.)
 */
function withStateLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}
