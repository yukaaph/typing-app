/**
 * ID/password auth backed by a "Users" sheet, with session tokens kept in
 * CacheService (max TTL 6 hours). This is a prototype-grade auth layer:
 * passwords are SHA-256 hashed (not salted/bcrypt), and there is no
 * lockout/throttling. It is not a substitute for a real auth provider,
 * but it is enough to demonstrate role-gated access without a database.
 */

var SESSION_TTL_SECONDS = 6 * 60 * 60; // CacheService max TTL is 6 hours

function hashPassword_(password) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function getUsersSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  if (!sheet) {
    throw new Error('Users シートが見つかりません。先に setupSpreadsheet() を実行してください。');
  }
  return sheet;
}

/**
 * Called from the client login form.
 * Returns { ok, token, role, displayName, username } or { ok:false, message }.
 */
function login(username, password) {
  username = String(username || '').trim();
  password = String(password || '');
  if (!username || !password) {
    return { ok: false, message: 'ユーザーIDとパスワードを入力してください。' };
  }

  var sheet = getUsersSheet_();
  var rows = sheet.getDataRange().getValues();
  var passwordHash = hashPassword_(password);

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[0]).trim() === username) {
      if (String(row[1]) !== passwordHash) {
        return { ok: false, message: 'ユーザーIDまたはパスワードが正しくありません。' };
      }
      var role = String(row[2]);
      var displayName = String(row[3]);
      var token = Utilities.getUuid();
      CacheService.getScriptCache().put(
        'session:' + token,
        JSON.stringify({ username: username, role: role, displayName: displayName }),
        SESSION_TTL_SECONDS
      );
      return { ok: true, token: token, role: role, displayName: displayName, username: username };
    }
  }
  return { ok: false, message: 'ユーザーIDまたはパスワードが正しくありません。' };
}

/** Called from the client logout button. */
function logout(token) {
  if (token) {
    CacheService.getScriptCache().remove('session:' + token);
  }
  return { ok: true };
}

/** Returns { username, role, displayName } or null if the token is missing/expired. */
function getSession_(token) {
  if (!token) return null;
  var raw = CacheService.getScriptCache().get('session:' + token);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/** Throws if the token is invalid/expired; otherwise returns the session. */
function requireSession_(token) {
  var session = getSession_(token);
  if (!session) {
    throw new Error('SESSION_EXPIRED: セッションの有効期限が切れました。再度ログインしてください。');
  }
  return session;
}
