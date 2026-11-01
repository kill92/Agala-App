var exec = require('cordova/exec');

function call(action, args) {
  return new Promise(function (resolve, reject) {
    exec(resolve, reject, 'AgalaNative', action, args || []);
  });
}

module.exports = {
  init: function (hour, minute) { return call('init', [hour, minute]); },
  saveSnapshot: function (json) { return call('saveSnapshot', [json]); },
  backupNow: function () { return call('backupNow'); },
  getBackupInfo: function () { return call('getBackupInfo'); },
  startSpeech: function (lang) { return call('startSpeech', [lang || 'he-IL']); },
  isSpeechAvailable: function () { return call('isSpeechAvailable'); },
  openNotificationSettings: function () { return call('openNotificationSettings'); },
  openExactAlarmSettings: function () { return call('openExactAlarmSettings'); },
  requestIgnoreBattery: function () { return call('requestIgnoreBattery'); }
};
