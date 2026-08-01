/**
 * Adds a menu to the bound Spreadsheet so staff can issue new access
 * passwords without opening the Apps Script editor — the "SharePoint
 * password-protected link" style workflow: click, name the recipient,
 * get a one-time password to paste into the link/email you send them.
 * Issuing a customer password also creates that municipality's own
 * ContractState row, so their data is separated from every other 自治体.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('設定確認表 管理')
    .addItem('お客様用パスワードを発行（自治体を新規登録）', 'issueCustomerAccessUi_')
    .addItem('社内担当者用パスワードを発行', 'issueStaffAccessUi_')
    .addToUi();
}

function issueCustomerAccessUi_() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('お客様用パスワードの発行', '自治体名（表示名）を入力してください', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var displayName = response.getResponseText().trim();
  if (!displayName) {
    ui.alert('表示名が入力されていません。もう一度実行してください。');
    return;
  }

  var contractId = generateContractId_();
  createContractState_(contractId, displayName);
  var password = issueAccessPassword_('customer', displayName, contractId);

  ui.alert(
    '発行完了',
    '自治体名: ' + displayName + '\n' +
    '契約ID: ' + contractId + '\n' +
    'パスワード: ' + password + '\n\n' +
    'このパスワードは今だけ表示されます（Usersシートにはハッシュ化されたものしか残りません）。' +
    'リンクを送る相手にこのパスワードを控えて伝えてください。この自治体専用の新しいデータ領域が作成されました。',
    ui.ButtonSet.OK
  );
}

function issueStaffAccessUi_() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('社内担当者用パスワードの発行', '担当者名（表示名）を入力してください', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var displayName = response.getResponseText().trim();
  if (!displayName) {
    ui.alert('表示名が入力されていません。もう一度実行してください。');
    return;
  }

  var password = issueAccessPassword_('staff', displayName, ''); // '' = access to every contract
  ui.alert(
    '発行完了',
    '担当者名: ' + displayName + '\n' +
    'パスワード: ' + password + '\n\n' +
    'このパスワードは今だけ表示されます。社内担当者はログイン後、契約一覧からすべての自治体のデータを確認できます。',
    ui.ButtonSet.OK
  );
}
