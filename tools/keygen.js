'use strict';
/* מפתח חתימה לעדכונים (ECDSA P-256). המפתח הפרטי נשאר אצלך בלבד בתיקייה keys/ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dir = path.join(__dirname, '..', 'keys');
const privPath = path.join(dir, 'update-private.pem');
const pubPath = path.join(dir, 'update-public.jwk.json');

function ensureKeys() {
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
    return { created: false, jwk: JSON.parse(fs.readFileSync(pubPath, 'utf8')) };
  }
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
  fs.writeFileSync(privPath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  const jwk = publicKey.export({ format: 'jwk' });
  fs.writeFileSync(pubPath, JSON.stringify(jwk, null, 2));
  return { created: true, jwk };
}
function signText(text) {
  const key = crypto.createPrivateKey(fs.readFileSync(privPath));
  return crypto.sign('sha256', Buffer.from(text, 'utf8'), { key, dsaEncoding: 'ieee-p1363' }).toString('base64');
}
module.exports = { ensureKeys, signText, privPath, pubPath };
