// المصادقة: SHA-256 لكلمة المرور + HMAC token مع timestamp مضمَّن
// نفس النموذج تماماً المستخدم في admin/server.js لتسهيل التوحيد لاحقاً.

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const hex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const enc = (s) => new TextEncoder().encode(s);

export async function sha256Hex(s) {
  return hex(await crypto.subtle.digest('SHA-256', enc(s)));
}

async function hmacHex(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return hex(await crypto.subtle.sign('HMAC', key, enc(msg)));
}

// token = `${ts}.${hmac(AUTH_SECRET, "gt-admin-v1-" + ts)}`
export async function makeToken(env) {
  const ts = Date.now();
  const sig = await hmacHex(env.AUTH_SECRET, `gt-admin-v1-${ts}`);
  return `${ts}.${sig}`;
}

export async function verifyToken(env, token) {
  if (!token || !token.includes('.')) return false;
  const [tsStr, sig] = token.split('.');
  const ts = +tsStr;
  if (!Number.isFinite(ts)) return false;
  if (Date.now() - ts > SESSION_TTL_MS) return false;
  const expected = await hmacHex(env.AUTH_SECRET, `gt-admin-v1-${ts}`);
  // مقارنة ثابتة الزمن
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function validatePassword(env, password) {
  if (!password || !env.ADMIN_PASS_HASH) return false;
  const hash = await sha256Hex(password);
  // مقارنة ثابتة الزمن
  if (hash.length !== env.ADMIN_PASS_HASH.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ env.ADMIN_PASS_HASH.charCodeAt(i);
  return diff === 0;
}

// Middleware: يُرجع true إن كانت الجلسة سليمة، وإلا يُرسل 401
export async function requireAuth(req, env) {
  const auth = req.headers.get('x-admin-token') || '';
  return verifyToken(env, auth);
}

// ── تأكيد كلمة المرور للعمليات الحساسة ─────────────────────
// مطابق لـ confirmRequired في admin/server.js (alwaysRequire=true)
const CONFIRM_TTL_MS = 30 * 1000; // 30 ثانية

// إنشاء confirmToken (يُسلَّم بعد التحقق من كلمة المرور)
export async function makeConfirmToken(env) {
  const exp = Date.now() + CONFIRM_TTL_MS;
  const sig = await hmacHex(env.ADMIN_PASS_HASH, `confirm-${exp}`);
  return `${exp}.${sig}`;
}

export async function verifyConfirmToken(env, token) {
  if (!token || !token.includes('.')) return false;
  const idx = token.indexOf('.');
  const exp = parseInt(token.slice(0, idx), 10);
  const sig = token.slice(idx + 1);
  if (!exp || Date.now() > exp) return false;
  const expected = await hmacHex(env.ADMIN_PASS_HASH, `confirm-${exp}`);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// requireConfirm: يفحص header x-admin-confirm، يُرجع true لو سليم
export async function requireConfirm(req, env) {
  const ct = req.headers.get('x-admin-confirm') || '';
  return verifyConfirmToken(env, ct);
}

// ── مهلة التراجع عن حذف قسم ───────────────────────────────
// نسخة مطابقة لـ makeUndoToken/verifyUndoToken في admin/server.js.
// الرمز يحمل بيانات القسم موقَّعة مع تاريخ انتهاء، فلا نحتاج حالة في
// الخادم — وهو شرط أساسي هنا لأن كل طلب قد يصل إلى isolate مختلف.
export const UNDO_WINDOW_MS = 30 * 1000;

const b64urlEncode = (s) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const b64urlDecode = (s) => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - pad.length % 4) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
};

export async function makeUndoToken(env, cat) {
  const payload = b64urlEncode(JSON.stringify(cat));
  const exp = Date.now() + UNDO_WINDOW_MS;
  const sig = await hmacHex(env.AUTH_SECRET, `catundo-${payload}-${exp}`);
  return { token: `${payload}.${exp}.${sig}`, expiresAt: exp };
}

export async function verifyUndoToken(env, token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [payload, expStr, sig] = parts;
  const exp = parseInt(expStr, 10);
  if (!exp || Date.now() > exp) return null;

  const expected = await hmacHex(env.AUTH_SECRET, `catundo-${payload}-${exp}`);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;

  try { return JSON.parse(b64urlDecode(payload)); } catch { return null; }
}
