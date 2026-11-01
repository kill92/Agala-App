'use strict';
/* מאגד את ה-SDK של Firebase לקובץ אחד: www/js/firebase.js */
const path = require('path');
const root = path.join(__dirname, '..');
let esbuild;
try { esbuild = require('esbuild'); } catch (e) { console.error('חסר esbuild. להריץ קודם: npm install'); process.exit(1); }
esbuild.build({
  entryPoints: [path.join(__dirname, 'fb-entry.js')],
  outfile: path.join(root, 'www', 'js', 'firebase.js'),
  bundle: true, minify: true, format: 'iife', platform: 'browser', target: ['chrome90'],
  legalComments: 'none', logLevel: 'warning',
  define: { 'process.env.NODE_ENV': '"production"' }
}).then(() => console.log('נבנה www/js/firebase.js')).catch((e) => { console.error(e); process.exit(1); });
