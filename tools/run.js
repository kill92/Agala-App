'use strict';
const cp = require('child_process');
function run(cmd, opts) {
  console.log('\n> ' + cmd);
  const r = cp.spawnSync(cmd, Object.assign({ stdio: 'inherit', shell: true }, opts || {}));
  return r.status === 0;
}
function cordovaCmd() {
  const r = cp.spawnSync('cordova --version', { shell: true, encoding: 'utf8' });
  return r.status === 0 ? 'cordova' : 'npx --yes cordova';
}
module.exports = { run, cordovaCmd };
