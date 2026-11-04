'use strict';
/* מתקן את פלטפורמת אנדרואיד: מסיר את חבילת Firebase הכללית שנכשלת, ומתקין מחדש רק את מה שצריך */
const fs = require('fs');
const path = require('path');
const { run, cordovaCmd } = require('./run');
const root = path.join(__dirname, '..');
const cdv = cordovaCmd();
const plj = path.join(root, 'platforms', 'android', 'app', 'src', 'main', 'assets', 'www', 'cordova_plugins.js');

const pj = path.join(root, 'package.json');
const p = JSON.parse(fs.readFileSync(pj, 'utf8'));
const drop = /^cordova-plugin-firebasex(-(inappmessaging|analytics|crashlytics|performance|config|functions|firestore|auth|core))?$/;
['dependencies', 'devDependencies'].forEach(function (k) {
  if (!p[k]) return;
  Object.keys(p[k]).forEach(function (n) { if (drop.test(n)) { console.log('מסיר מ-package.json: ' + n); delete p[k][n]; } });
});
p.cordova = p.cordova || {}; p.cordova.plugins = p.cordova.plugins || {};
Object.keys(p.cordova.plugins).forEach(function (n) { if (drop.test(n)) delete p.cordova.plugins[n]; });
p.cordova.plugins['cordova-plugin-firebasex-messaging'] = { ANDROID_ICON_ACCENT: '#12805C' };
p.cordova.plugins['cordova-plugin-agala-native'] = {};
p.devDependencies = p.devDependencies || {};
p.devDependencies['cordova-plugin-firebasex-messaging'] = p.devDependencies['cordova-plugin-firebasex-messaging'] || '^2.0.3';
p.devDependencies['cordova-plugin-agala-native'] = 'file:plugins/agala-native';
fs.writeFileSync(pj, JSON.stringify(p, null, 2) + '\n');

// ב-platform add, Cordova מתקין את כל התיקיות שב-plugins/. לכן מוחקים משם את החבילה הכללית ואת המודולים שלא בשימוש.
const unused = ['', '-analytics', '-auth', '-config', '-crashlytics', '-firestore', '-functions', '-performance', '-inappmessaging'];
unused.forEach(function (suf) {
  const d = path.join(root, 'plugins', 'cordova-plugin-firebasex' + suf);
  if (fs.existsSync(d)) { console.log('מוחק תיקייה: plugins\\cordova-plugin-firebasex' + suf); fs.rmSync(d, { recursive: true, force: true }); }
});
const fj = path.join(root, 'plugins', 'fetch.json');
if (fs.existsSync(fj)) {
  try {
    const f = JSON.parse(fs.readFileSync(fj, 'utf8'));
    unused.forEach(function (suf) { delete f['cordova-plugin-firebasex' + suf]; });
    fs.writeFileSync(fj, JSON.stringify(f, null, 2));
  } catch (e) { console.log('fetch.json: ' + e.message); }
}
['android.json'].forEach(function (n) { try { fs.unlinkSync(path.join(root, 'plugins', n)); } catch (e) {} });
run(cdv + ' platform rm android');
if (!run(cdv + ' platform add android')) { console.error('\n❌ platform add נכשל. להעתיק לי את הפלט.'); process.exit(1); }
run(cdv + ' prepare android');
function ok() { const t = fs.existsSync(plj) ? fs.readFileSync(plj, 'utf8') : ''; return t.indexOf('agala-native') >= 0 && t.indexOf('firebasex-messaging') >= 0; }
if (!ok()) { run(cdv + ' plugin add ./plugins/agala-native'); run(cdv + ' prepare android'); }
if (!ok()) { console.error('\n❌ הרכיבים עדיין לא בפלטפורמה. להעתיק לי את כל הפלט.'); process.exit(1); }
console.log('\n✅ הפלטפורמה תוקנה: Firebase Messaging והרכיב של עגלה מותקנים. עכשיו: npm run apk');
