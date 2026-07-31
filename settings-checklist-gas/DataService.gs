/**
 * Storage layer. The whole app state (mirroring the client-side shape used
 * by the original static prototype) is kept as one JSON blob per contract
 * in the "ContractState" sheet, rather than a fully normalized schema.
 * This keeps the port close to the original prototype's data model while
 * still being backed by a real spreadsheet "database".
 */

var DEFAULT_CONTRACT_ID = 'C-2026-0001';

function defaultState_() {
  return {
    contract: {
      contractId: DEFAULT_CONTRACT_ID,
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

function loadContractState_(contractId) {
  var sheet = getStateSheet_();
  var rowIndex = findStateRow_(sheet, contractId);
  if (rowIndex === -1) {
    var state = defaultState_();
    sheet.appendRow([contractId, JSON.stringify(state), new Date()]);
    return state;
  }
  var json = sheet.getRange(rowIndex, 2).getValue();
  try {
    return JSON.parse(json);
  } catch (e) {
    var fallback = defaultState_();
    sheet.getRange(rowIndex, 2, 1, 2).setValues([[JSON.stringify(fallback), new Date()]]);
    return fallback;
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

/**
 * Serializes read-modify-write access to the shared ContractState row so
 * two people saving at the same moment (e.g. the demo customer and staff
 * accounts both editing) can't silently clobber each other's write.
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
