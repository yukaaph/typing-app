# 設定確認表 GAS版プロトタイプ

`settings-checklist/`（localStorageのみで動く静的プロトタイプ）と同じ画面・機能を、Google Apps Script（GAS）+ Google Sheetsで動かす版です。認証（ログイン）とデータ保存をSheetsで行います。

## 構成

| ファイル | 役割 |
|---|---|
| `appsscript.json` | プロジェクトのマニフェスト（Webアプリの公開設定など） |
| `Code.gs` | `doGet` エントリポイント、HTML部品の読み込み |
| `Auth.gs` | ログイン／ログアウト、セッション管理（CacheService） |
| `DataService.gs` | Sheets（ContractStateシート）への状態の読み書き |
| `Api.gs` | クライアントから呼ばれるAPI関数（`google.script.run` 経由） |
| `Setup.gs` | 初回セットアップ用（Users/ContractStateシートの初期化） |
| `Index.html` | 画面全体のHTML（ログイン画面＋メイン画面） |
| `Stylesheet.html` | CSS（`settings-checklist/style.css` と同内容） |
| `JavaScriptClient.html` | クライアント側JS（元プロトタイプの画面ロジック＋サーバー呼び出し） |

## データの持ち方

- **Users シート**：`id / passwordHash / role / displayName` の4列。ログイン時にここと照合します（パスワードはSHA-256でハッシュ化して保存・比較。ソルトや多要素認証はありません）。
- **ContractState シート**：`contractId / stateJson / updatedAt` の3列。契約1件分の設定内容（元プロトタイプの `state` とほぼ同じ形）をJSON文字列としてまるごと1セルに保存します。複数契約に対応した正規化スキーマではなく、デモ用に契約1件（`C-2026-0001`）を共有する前提です。

## デプロイ手順

1. **Google Sheetsを新規作成**します（例：「設定確認表_DB」）。
2. そのシートのメニューから **拡張機能 > Apps Script** を開きます（このシートに紐づいたスクリプトプロジェクトが作られます）。
3. エディタで、このフォルダ内の各ファイルと同じ名前・内容のファイルを作成します。
   - `appsscript.json` は、エディタ左の歯車アイコン「プロジェクトの設定」で「`appsscript.json`マニフェストファイルをエディタで表示する」をONにすると編集できるようになります。
   - `.gs` ファイル（`Code.gs` `Auth.gs` `DataService.gs` `Api.gs` `Setup.gs`）は「ファイル > 新規 > スクリプト」で作成し、中身をコピーします。
   - `.html` ファイル（`Index.html` `Stylesheet.html` `JavaScriptClient.html`）は「ファイル > 新規 > HTML」で作成し、中身をコピーします（拡張子`.html`は自動で付きます）。
   - `clasp` (`npm install -g @google/clasp`) をお使いの場合は、このフォルダをそのまま `clasp push` していただいても構いません。
4. 関数選択のプルダウンで **`setupSpreadsheet`** を選び、▶実行します。初回は権限の承認を求められるので許可してください。
   - 実行後、シートに `Users` と `ContractState` の2つのタブが作成されます。
   - `Users` シートには、デモアカウント `customer-demo` / `staff-demo`（パスワードはどちらも `demo1234`）が登録されます。
5. **デプロイ > 新しいデプロイ** を開き、種類で「ウェブアプリ」を選択します。
   - **実行するユーザー**：自分（オーナー）
   - **アクセスできるユーザー**：全員
   - この組み合わせが必要です。「全員」にするのは、お客様が社外の方でGoogleアカウントを持たない前提のためです（ログインはGoogleアカウントではなく、Usersシートで管理する独自ID/パスワードで行います）。
6. デプロイ後に発行される **ウェブアプリのURL**（`.../exec` で終わるURL）を開くと、ログイン画面が表示されます。

## デモアカウント

| ユーザーID | パスワード | ロール |
|---|---|---|
| `customer-demo` | `demo1234` | お客様 |
| `staff-demo` | `demo1234` | 社内担当者 |

アカウントの追加・変更は `Users` シートを直接編集してください（`passwordHash` 列には平文ではなく、`hashPassword_()` で生成したSHA-256ハッシュを入れる必要があります。Apps Scriptエディタで以下のようなヘルパー関数を一時的に実行してハッシュ値を確認できます）。

```js
function debugHashPassword() {
  Logger.log(hashPassword_('新しいパスワード'));
}
```

## 元プロトタイプとの主な違い

- ログイン中のロール（お客様／社内担当者）でできることが**サーバー側でも**強制されます（元の静的プロトタイプはブラウザ側のチェックのみでした）。
- 「デモデータをリセット」は、お客様・社内担当者で共有している契約データだけを初期化します。ログイン状態はそのまま維持されます（静的プロトタイプではリセット時にログアウトもしていました）。
- データはブラウザのlocalStorageではなく、Google Sheets上に保存されます。複数人が同時に開いても同じデータを見ます。

## 制限・注意点

- **本番グレードの認証ではありません。** パスワードのハッシュ化はしていますが、ソルト・ログイン試行制限・多要素認証・監査ログなどはありません。実際の顧客データを扱う本番環境では、Google Identity Platform や外部の認証基盤（Auth0, Firebase Authなど）の採用を推奨します。
- セッションは `CacheService` を使っており、最大6時間で自動的に切れます（Apps Scriptの仕様上の上限です）。
- このリポジトリの環境ではApps Scriptの実行・デプロイができないため、**実機での動作確認は行っていません。** デプロイ後にエラーが出た場合は、エラーメッセージ（Apps Scriptエディタの「実行数」ログ、またはブラウザのコンソール）を共有してください。
