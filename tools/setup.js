'use strict';
/* הכנה חד-פעמית: מפתחות חתימה, הגדרות Firebase/GitHub, SDK ואריזת הממשק */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const cp = require('child_process');
const { ensureKeys } = require('./keygen');
const { build } = require('./bundle');
const root = path.join(__dirname, '..');
const P = (...a) => path.join(root, ...a);
const PKG = 'com.liad.agala';

let rl = null, lines = null;
async function ask(q) {
  if (!rl) { rl = readline.createInterface({ input: process.stdin }); lines = rl[Symbol.asyncIterator](); }
  process.stdout.write(q);
  const r = await lines.next();
  return r.done ? '' : String(r.value || '').trim();
}
function die(msg) { console.error('\n❌ ' + msg + '\n'); process.exit(1); }

function parseWebConfig() {
  const f = P('firebase-web-config.txt');
  if (!fs.existsSync(f)) die('חסר הקובץ firebase-web-config.txt');
  const txt = fs.readFileSync(f, 'utf8');
  const cfg = {};
  const re = /["']?(apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId)["']?\s*:\s*["']([^"']+)["']/g;
  let m; while ((m = re.exec(txt))) cfg[m[1]] = m[2];
  ['apiKey', 'projectId', 'appId'].forEach((k) => { if (!cfg[k]) die('בקובץ firebase-web-config.txt חסר השדה ' + k + '. יש להדביק את בלוק firebaseConfig המלא מ-Firebase.'); });
  if (!cfg.authDomain) cfg.authDomain = cfg.projectId + '.firebaseapp.com';
  return cfg;
}

function checkGoogleServices(projectId) {
  const f = P('google-services.json');
  if (!fs.existsSync(f)) die('חסר הקובץ google-services.json בתיקיית AgalaApp (מורידים אותו מ-Firebase – ראה הוראות).');
  let j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { die('google-services.json לא תקין.'); }
  const pkgs = (j.client || []).map((c) => c.client_info && c.client_info.android_client_info && c.client_info.android_client_info.package_name);
  if (pkgs.indexOf(PKG) < 0) die('ב-google-services.json שם החבילה הוא "' + pkgs.join(', ') + '" ואילו צריך להיות ' + PKG + '. יש להוסיף ב-Firebase אפליקציית Android בשם החבילה הנכון ולהוריד קובץ חדש.');
  const pid = j.project_info && j.project_info.project_id;
  if (pid && pid !== projectId) die('google-services.json שייך לפרויקט "' + pid + '" ואילו הגדרות הווב שייכות ל-"' + projectId + '". חייבים להיות אותו פרויקט.');
}

(async function main() {
  console.log('=== הכנת האפליקציה "עגלה" ===\n');
  if (!fs.existsSync(P('node_modules', 'firebase')) || !fs.existsSync(P('node_modules', 'esbuild'))) die('חסרות חבילות. להריץ קודם: npm install');

  const web = parseWebConfig();
  checkGoogleServices(web.projectId);
  console.log('✓ הגדרות Firebase נקראו (פרויקט: ' + web.projectId + ')');

  let gh = { ghOwner: '', ghRepo: '', ghBranch: 'main' };
  const ghFile = P('agala.config.json');
  if (fs.existsSync(ghFile) && process.argv.indexOf('--reset') < 0) gh = Object.assign(gh, JSON.parse(fs.readFileSync(ghFile, 'utf8')));
  else {
    console.log('\nעדכונים אוטומטיים מ-GitHub (כמו באפליקציית התקציב).');
    gh.ghOwner = await ask('שם המשתמש שלך ב-GitHub (Enter לדלג ולהשבית עדכונים): ');
    if (gh.ghOwner) gh.ghRepo = (await ask('שם ה-repository (לדוגמה agala-app): ')) || 'agala-app';
    fs.writeFileSync(ghFile, JSON.stringify(gh, null, 2));
  }

  const keys = ensureKeys();
  console.log(keys.created ? '✓ נוצר מפתח חתימה חדש בתיקייה keys/ (לשמור עותק בטוח שלה!)' : '✓ מפתח חתימה קיים');

  const config = { apkVersion: 1, apiLevel: 1, ghOwner: gh.ghOwner, ghRepo: gh.ghRepo, ghBranch: gh.ghBranch || 'main', pub: keys.jwk, fb: web };
  fs.writeFileSync(P('www', 'js', 'config.js'), '/* נוצר אוטומטית על ידי: npm run setup */\nwindow.AGALA_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n');
  fs.writeFileSync(P('.firebaserc'), JSON.stringify({ projects: { default: web.projectId } }, null, 2));
  console.log('✓ נכתבו www/js/config.js ו-.firebaserc');

  console.log('… מאגד את Firebase SDK');
  const r = cp.spawnSync(process.execPath, [P('tools', 'build-fb.js')], { stdio: 'inherit' });
  if (r.status !== 0) die('בניית ה-SDK נכשלה.');
  const b = build();
  console.log('✓ חבילת ממשק גרסה ' + b.bundle.version);
  const pr = cp.spawnSync(process.execPath, [P('tools', 'publish.js'), '--keep'], { stdio: 'inherit' });
  if (pr.status !== 0) die('חתימת חבילת העדכון הראשונית נכשלה.');

  if (rl) rl.close();
  console.log('\n✅ ההכנה הושלמה. השלב הבא: npm run native');
})();
