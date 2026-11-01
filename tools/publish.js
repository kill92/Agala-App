'use strict';
/* מפרסם עדכון ממשק חתום: node tools/publish.js  (או: npm run publish-update) */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { build } = require('./bundle');
const { signText, privPath, pubPath } = require('./keygen');
const root = path.join(__dirname, '..');

if (!fs.existsSync(privPath) || !fs.existsSync(pubPath)) {
  console.error('חסר מפתח חתימה. להריץ קודם: npm run setup');
  process.exit(1);
}
const keep = process.argv.indexOf('--keep') >= 0;   // --keep = לפרסם את הגרסה הנוכחית בלי להעלות מספר גרסה
const { text, bundle } = build({ bump: !keep });
const sig = signText(text);

// בדיקה עצמית: החתימה חייבת להיות תקפה מול המפתח הציבורי שמוטמע באפליקציה
const pub = crypto.createPublicKey({ key: JSON.parse(fs.readFileSync(pubPath, 'utf8')), format: 'jwk' });
const ok = crypto.verify('sha256', Buffer.from(text, 'utf8'), { key: pub, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64'));
if (!ok) { console.error('אימות החתימה נכשל – העדכון לא פורסם.'); process.exit(1); }

const out = path.join(root, 'update');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'bundle.json'), text, 'utf8');
fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify({
  version: bundle.version, minApi: bundle.minApi, sig,
  sha256: crypto.createHash('sha256').update(text).digest('hex'), size: text.length, date: new Date().toISOString()
}, null, 2));
console.log('פורסם עדכון חתום גרסה ' + bundle.version + ' בתיקייה update/');
if (!keep) {
  console.log('\nעכשיו להעלות ל-GitHub:');
  console.log('  git add -A');
  console.log('  git commit -m "update ' + bundle.version + '"');
  console.log('  git push');
}
