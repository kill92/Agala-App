'use strict';
/* בונה APK ומעתיק אותו לתיקיית הפרויקט */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { run, cordovaCmd } = require('./run');
const { build } = require('./bundle');
const root = path.join(__dirname, '..');
const release = process.argv.indexOf('--release') >= 0;

build();
let cmd = cordovaCmd() + ' build android ' + (release ? '--release' : '--debug');
if (release) {
  const bj = path.join(root, 'build.json');
  if (!fs.existsSync(bj)) {
    const ks = path.join(root, 'keys', 'agala-release.keystore');
    const pass = require('crypto').randomBytes(12).toString('hex');
    if (!fs.existsSync(ks)) {
      const r = cp.spawnSync('keytool', ['-genkeypair', '-v', '-keystore', ks, '-alias', 'agala', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-storepass', pass, '-keypass', pass, '-dname', 'CN=Agala'], { stdio: 'inherit', shell: true });
      if (r.status !== 0) { console.error('יצירת keystore נכשלה (keytool חסר?).'); process.exit(1); }
    }
    fs.writeFileSync(bj, JSON.stringify({ android: { release: { keystore: ks, storePassword: pass, alias: 'agala', password: pass, keystoreType: '' } } }, null, 2));
    console.log('נוצר keystore ו-build.json (לשמור גיבוי של keys/ ושל build.json – בלעדיהם אי אפשר לעדכן את האפליקציה על גבי הקיימת).');
  }
  cmd += ' --buildConfig=build.json';
}
if (!run(cmd)) { console.error('\n❌ הבנייה נכשלה. אפשר להעתיק לי את השגיאה האחרונה ואתקן.'); process.exit(1); }

const plj = path.join(root, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'www', 'cordova_plugins.js');
if (!fs.existsSync(plj) || fs.readFileSync(plj, 'utf8').indexOf('agala-native') < 0) {
  console.error('\n❌ הרכיב cordova-plugin-agala-native לא נכנס ל-APK (גיבוי והכתבה לא יעבדו). קודם להריץ: npm run native, ולוודא שהוא מסתיים ב-✅. ה-APK לא הועתק.');
  process.exit(1);
}
const dir = path.join(root, 'platforms', 'android', 'app', 'build', 'outputs', 'apk', release ? 'release' : 'debug');
const apk = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.apk$/.test(f) && !/unaligned/.test(f))[0] : null;
if (!apk) { console.error('לא נמצא קובץ APK בתיקייה ' + dir); process.exit(1); }
const dst = path.join(root, 'agala' + (release ? '-release' : '-debug') + '.apk');
fs.copyFileSync(path.join(dir, apk), dst);
console.log('\n✅ ה-APK מוכן: ' + dst);
