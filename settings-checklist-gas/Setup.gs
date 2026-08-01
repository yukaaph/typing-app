/**
 * One-time bootstrap. Open this project's editor, select "setupSpreadsheet"
 * in the function dropdown, and click Run once (before the first deploy,
 * and again any time you want to wipe the demo data back to its defaults).
 *
 * Demo passwords are fixed strings (not randomly generated) so the login
 * screen's one-click demo buttons keep working. Real customer/staff
 * passwords should be issued via the "設定確認表 管理" spreadsheet menu
 * (see Admin.gs), which generates a random 15-character password.
 */
var DEMO_CUSTOMER_PASSWORD = 'demoCustomer123'; // 15 chars
var DEMO_STAFF_PASSWORD = 'demoStaff123456'; // 15 chars

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var users = ss.getSheetByName('Users') || ss.insertSheet('Users');
  users.clear();
  users.appendRow(['passwordHash', 'role', 'displayName', 'createdAt']);
  users.appendRow([hashPassword_(DEMO_CUSTOMER_PASSWORD), 'customer', 'お客様 デモ担当者', new Date()]);
  users.appendRow([hashPassword_(DEMO_STAFF_PASSWORD), 'staff', '弊社 デモ担当者', new Date()]);
  users.setFrozenRows(1);

  var stateSheet = ss.getSheetByName('ContractState') || ss.insertSheet('ContractState');
  stateSheet.clear();
  stateSheet.appendRow(['contractId', 'stateJson', 'updatedAt']);
  stateSheet.appendRow([DEFAULT_CONTRACT_ID, JSON.stringify(defaultState_()), new Date()]);
  stateSheet.setFrozenRows(1);

  SpreadsheetApp.flush();
  Logger.log('セットアップ完了：Users / ContractState シートを初期化しました。');
  Logger.log('デモパスワード（お客様）: ' + DEMO_CUSTOMER_PASSWORD);
  Logger.log('デモパスワード（社内担当者）: ' + DEMO_STAFF_PASSWORD);
  Logger.log('新しいパスワードの発行は、スプレッドシートのメニュー「設定確認表 管理」から行えます。');
}
