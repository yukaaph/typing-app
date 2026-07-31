/**
 * One-time bootstrap. Open this project's editor, select "setupSpreadsheet"
 * in the function dropdown, and click Run once (before the first deploy,
 * and again any time you want to wipe the demo data back to its defaults).
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var users = ss.getSheetByName('Users') || ss.insertSheet('Users');
  users.clear();
  users.appendRow(['id', 'passwordHash', 'role', 'displayName']);
  users.appendRow(['customer-demo', hashPassword_('demo1234'), 'customer', 'お客様 デモ担当者']);
  users.appendRow(['staff-demo', hashPassword_('demo1234'), 'staff', '弊社 デモ担当者']);
  users.setFrozenRows(1);

  var stateSheet = ss.getSheetByName('ContractState') || ss.insertSheet('ContractState');
  stateSheet.clear();
  stateSheet.appendRow(['contractId', 'stateJson', 'updatedAt']);
  stateSheet.appendRow([DEFAULT_CONTRACT_ID, JSON.stringify(defaultState_()), new Date()]);
  stateSheet.setFrozenRows(1);

  SpreadsheetApp.flush();
  Logger.log('セットアップ完了：Users / ContractState シートを初期化しました。');
  Logger.log('デモアカウント: customer-demo / staff-demo （パスワードはどちらも demo1234）');
}
