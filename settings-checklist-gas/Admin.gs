/**
 * Adds a menu to the bound Spreadsheet so staff can issue new access
 * passwords without opening the Apps Script editor — the "SharePoint
 * password-protected link" style workflow: click, name the recipient,
 * get a one-time password to paste into the link/email you send them.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('設定確認表 管理')
    .addItem('お客様用パスワードを発行', 'issueCustomerAccessUi_')
    .addItem('社内担当者用パスワードを発行', 'issueStaffAccessUi_')
    .addToUi();
}

function issueCustomerAccessUi_() {
  issueAccessUi_('customer', '自治体名（表示名）を入力してください');
}

function issueStaffAccessUi_() {
  issueAccessUi_('staff', '担当者名（表示名）を入力してください');
}

function issueAccessUi_(role, promptText) {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('パスワードの発行', promptText, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;

  var displayName = response.getResponseText().trim();
  if (!displayName) {
    ui.alert('表示名が入力されていません。もう一度実行してください。');
    return;
  }

  var password = issueAccessPassword_(role, displayName);
  ui.alert(
    '発行完了',
    '表示名: ' + displayName + '\n' +
    'パスワード: ' + password + '\n\n' +
    'このパスワードは今だけ表示されます（Usersシートにはハッシュ化されたものしか残りません）。' +
    'リンクを送る相手にこのパスワードを控えて伝えてください。',
    ui.ButtonSet.OK
  );
}
