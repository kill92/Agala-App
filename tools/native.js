'use strict';
/* מוסיף את פלטפורמת Android ואת הפלאגינים */
const fs = require('fs');
const path = require('path');
const { run, cordovaCmd } = require('./run');
const root = path.join(__dirname, '..');
const cdv = cordovaCmd();

if (!fs.existsSync(path.join(root, 'www', 'js', 'config.js')) || !fs.existsSync(path.join(root, 'www', 'js', 'firebase.js'))) {
  console.error('\n❌ קודם להריץ: npm run setup\n'); process.exit(1);
}
if (!fs.existsSync(path.join(root, 'google-services.json'))) { console.error('\n❌ חסר google-services.json\n'); process.exit(1); }

if (!fs.existsSync(path.join(root, 'platforms', 'android'))) {
  if (!run(cdv + ' platform add android')) process.exit(1);
}
const hasFirebasex = ['cordova-plugin-firebasex', 'cordova-plugin-firebasex-core', 'cordova-plugin-firebasex-messaging']
  .some(function (n) { return fs.existsSync(path.join(root, 'plugins', n)); });
if (!hasFirebasex) {
  if (!run(cdv + ' plugin add cordova-plugin-firebasex --variable FIREBASE_ANALYTICS_COLLECTION_ENABLED=false --variable FIREBASE_PERFORMANCE_COLLECTION_ENABLED=false --variable FIREBASE_CRASHLYTICS_COLLECTION_ENABLED=false --variable ANDROID_ICON_ACCENT=#12805C')) process.exit(1);
}
// הפלאגין שלנו תמיד מותקן מחדש מהמקור, כדי ששינויי קוד נייטיב (למשל הכתבה רציפה) ייכנסו ל-APK
if (fs.existsSync(path.join(root, 'plugins', 'cordova-plugin-agala-native'))) {
  run(cdv + ' plugin rm cordova-plugin-agala-native');
}
if (!run(cdv + ' plugin add ./plugins/agala-native')) process.exit(1);
console.log('\n✅ פלטפורמה ופלאגינים מוכנים. השלב הבא: npm run apk');
