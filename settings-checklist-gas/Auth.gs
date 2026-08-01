/**
 * Password-only auth, modeled on "share a link with a password" (e.g.
 * SharePoint password-protected links): there is no separate username/ID.
 * The password itself is the credential — each row in the "Users" sheet
 * maps one issued password to a role + display name. Session tokens are
 * kept in CacheService (max TTL 6 hours). This is a prototype-grade auth
 * layer: passwords are SHA-256 hashed (not salted/bcrypt), and there is
 * no lockout/throttling. It is not a substitute for a real auth provider,
 * but is reasonable given each password is a high-entropy random secret
 * (15 alphanumeric characters, issued per customer) rather than a
 * user-chosen one.
 */

var SESSION_TTL_SECONDS = 6 * 60 * 60; // CacheService max TTL is 6 hours

function hashPassword_(password) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8);
  return bytes.map(function (b) {
    return ('0' + (b & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/** Generates a random alphanumeric password. Default length 15. */
function generateRandomPassword_(length) {
  length = length || 15;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
 * Issues a new password for the given role, stores its hash in the Users
 * sheet, and returns the plaintext password. The plaintext is not stored
 * anywhere — this is the only moment it exists, so the caller (an admin,
 * via the issueCustomerAccessUi_ / issueStaffAccessUi_ menu items) must
 * hand it to the recipient right away (e.g. paste it into the link/email
 * sent to the municipality). Losing it means issuing a new one.
 *
 * contractId ties a customer password to exactly one municipality's data.
 * Pass '' for staff passwords, which get access to every contract (they
 * pick which one to work on from the "契約一覧" screen).
 */
function issueAccessPassword_(role, displayName, contractId) {
  var password = generateRandomPassword_(15);
  var sheet = getUsersSheet_();
  sheet.appendRow([hashPassword_(password), role, displayName, contractId || '', new Date()]);
  return password;
}

/**
 * Called from the client login form. Password-only: no username.
 * Returns { ok, token, role, displayName, contractId } or { ok:false, message }.
 * contractId is '' for staff (all-contract access).
 */
function login(password) {
  password = String(password || '');
  if (!password) {
    return { ok: false, message: 'パスワードを入力してください。' };
  }

  var sheet = getUsersSheet_();
  var rows = sheet.getDataRange().getValues();
  var passwordHash = hashPassword_(password);

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[0]) === passwordHash) {
      var role = String(row[1]);
      var displayName = String(row[2]);
      var contractId = String(row[3] || '');
      var token = Utilities.getUuid();
      CacheService.getScriptCache().put(
        'session:' + token,
        JSON.stringify({ role: role, displayName: displayName, contractId: contractId }),
        SESSION_TTL_SECONDS
      );
      return { ok: true, token: token, role: role, displayName: displayName, contractId: contractId };
    }
  }
  return { ok: false, message: 'パスワードが正しくありません。' };
}

/** Called from the client logout button. */
function logout(token) {
  if (token) {
    CacheService.getScriptCache().remove('session:' + token);
  }
  return { ok: true };
}

/** Returns { role, displayName, contractId } or null if the token is missing/expired. */
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
