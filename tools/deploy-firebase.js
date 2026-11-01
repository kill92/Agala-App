'use strict';
/* מעלה חוקי אבטחה ופונקציות ענן ל-Firebase */
const fs = require('fs');
const path = require('path');
const { run } = require('./run');
const root = path.join(__dirname, '..');
if (!fs.existsSync(path.join(root, '.firebaserc'))) { console.error('\n❌ קודם להריץ: npm run setup\n'); process.exit(1); }
if (!run('npm --prefix functions install')) process.exit(1);
if (!run('npx --yes firebase-tools@latest deploy --only firestore,functions')) {
  console.error('\nאם ההודעה הייתה על התחברות: להריץ  npx firebase-tools login  ולנסות שוב.');
  console.error('אם ההודעה הייתה על חיוב (Blaze): לשדרג את הפרויקט לתוכנית Blaze (ראה הוראות) ולנסות שוב.');
  process.exit(1);
}
console.log('\n✅ Firebase מוכן.');
