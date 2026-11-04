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
  isLiveSpeechAvailable: function () { return call('isLiveSpeechAvailable'); },
  /* הכתבה רציפה: onEvent מקבל {t:'ready'|'partial'|'final'|'end'|'error', text, code} */
  startListening: function (lang, onEvent) {
    exec(function (ev) { try { onEvent(ev); } catch (e) {} }, function (e) { try { onEvent({ t: 'error', code: String(e) }); } catch (x) {} }, 'AgalaNative', 'startListening', [lang || 'he-IL']);
  },
  stopListening: function () { return call('stopListening'); },
  cancelListening: function () { return call('cancelListening'); },
  isSpeechAvailable: function () { return call('isSpeechAvailable'); },
  openNotificationSettings: function () { return call('openNotificationSettings'); },
  openExactAlarmSettings: function () { return call('openExactAlarmSettings'); },
  requestIgnoreBattery: function () { return call('requestIgnoreBattery'); }
};
