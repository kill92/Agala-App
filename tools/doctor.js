'use strict';
/* בדיקת סביבת Windows: node, java, cordova, Android SDK, git */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
function out(cmd) { const r = cp.spawnSync(cmd, { shell: true, encoding: 'utf8' }); return r.status === 0 ? ((r.stdout || '') + (r.stderr || '')).trim().split(/\r?\n/)[0] : null; }
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || (process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : '');
const rows = [
  ['Node.js', out('node -v'), 'להתקין מ-https://nodejs.org (גרסת LTS)'],
  ['npm', out('npm -v'), 'מגיע עם Node.js'],
  ['Java (JDK 17 ומעלה)', out('java -version'), 'להתקין JDK 17: https://adoptium.net'],
  ['Cordova', out('cordova --version'), 'להריץ: npm install -g cordova  (לא חובה – אפשר גם בלי)'],
  ['Git', out('git --version'), 'להתקין מ-https://git-scm.com/download/win'],
  ['Android SDK', sdk && fs.existsSync(sdk) ? sdk : null, 'להתקין Android Studio: https://developer.android.com/studio ולהגדיר ANDROID_HOME'],
  ['google-services.json', fs.existsSync(path.join(__dirname, '..', 'google-services.json')) ? 'נמצא' : null, 'להוריד מ-Firebase ולהניח בתיקיית AgalaApp'],
  ['firebase-web-config.txt (מולא)', /apiKey/.test(fs.readFileSync(path.join(__dirname, '..', 'firebase-web-config.txt'), 'utf8')) && !/AIza\.\.\.\./.test(fs.readFileSync(path.join(__dirname, '..', 'firebase-web-config.txt'), 'utf8')) ? 'מולא' : null, 'להדביק את בלוק firebaseConfig מ-Firebase']
];
let bad = 0;
rows.forEach((r) => { console.log((r[1] ? '✓ ' : '✗ ') + r[0] + (r[1] ? ' – ' + r[1] : '   <- ' + r[2])); if (!r[1] && r[0] !== 'Cordova') bad++; });
console.log(bad ? '\nיש ' + bad + ' דברים להשלים.' : '\n✅ הכול מוכן.');
