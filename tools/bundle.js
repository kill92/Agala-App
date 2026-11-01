'use strict';
/* בונה את חבילת הממשק (www/app/bundle.json) מתוך src/ */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/^﻿/, '');

function build(opts) {
  const bump = !!(opts && opts.bump);
  const vp = path.join(root, 'src', 'version.json');
  const v = JSON.parse(rd('src/version.json'));
  if (bump) { v.version += 1; fs.writeFileSync(vp, JSON.stringify(v, null, 2) + '\n'); }
  const bundle = { version: v.version, minApi: v.minApi, css: rd('src/app.css'), html: rd('src/app.html'), js: rd('src/app.js') };
  const text = JSON.stringify(bundle);
  fs.mkdirSync(path.join(root, 'www', 'app'), { recursive: true });
  fs.writeFileSync(path.join(root, 'www', 'app', 'bundle.json'), text, 'utf8');
  return { text, bundle };
}
module.exports = { build };

if (require.main === module) {
  const r = build();
  console.log('נבנתה חבילת ממשק גרסה ' + r.bundle.version + ' (' + r.text.length + ' בתים)');
}
