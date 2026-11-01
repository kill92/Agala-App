package com.liad.agala;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.speech.RecognizerIntent;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;

public class AgalaNative extends CordovaPlugin {
    private static final int REQ_SPEECH = 7421;
    private CallbackContext speechCb;

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext cb) throws JSONException {
        final Context ctx = cordova.getActivity().getApplicationContext();

        if ("init".equals(action)) {
            final int h = args.optInt(0, 23);
            final int m = args.optInt(1, 50);
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        BackupCore.prefs(ctx).edit().putInt("hour", h).putInt("minute", m).apply();
                        BackupCore.schedule(ctx);
                        BackupCore.catchUp(ctx);
                        cb.success(BackupCore.info(ctx));
                    } catch (Exception e) {
                        cb.error(String.valueOf(e.getMessage()));
                    }
                }
            });
            return true;
        }

        if ("saveSnapshot".equals(action)) {
            final String json = args.optString(0, "");
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        if (json.length() < 2) { cb.error("empty"); return; }
                        BackupCore.saveSnapshot(ctx, json);
                        cb.success();
                    } catch (Exception e) {
                        cb.error(String.valueOf(e.getMessage()));
                    }
                }
            });
            return true;
        }

        if ("backupNow".equals(action)) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        String name = BackupCore.runBackup(ctx);
                        JSONObject o = new JSONObject();
                        o.put("name", name);
                        o.put("at", System.currentTimeMillis());
                        cb.success(o);
                    } catch (Exception e) {
                        cb.error(String.valueOf(e.getMessage()));
                    }
                }
            });
            return true;
        }

        if ("getBackupInfo".equals(action)) {
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    try {
                        cb.success(BackupCore.info(ctx));
                    } catch (Exception e) {
                        cb.error(String.valueOf(e.getMessage()));
                    }
                }
            });
            return true;
        }

        if ("isSpeechAvailable".equals(action)) {
            PackageManager pm = ctx.getPackageManager();
            boolean ok = !pm.queryIntentActivities(new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH), 0).isEmpty();
            cb.success(ok ? 1 : 0);
            return true;
        }

        if ("startSpeech".equals(action)) {
            String lang = args.optString(0, "he-IL");
            Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
            it.putExtra(RecognizerIntent.EXTRA_PROMPT, "מה להוסיף לרשימה?");
            it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            speechCb = cb;
            try {
                cordova.startActivityForResult(this, it, REQ_SPEECH);
            } catch (ActivityNotFoundException e) {
                speechCb = null;
                cb.error("unavailable");
            }
            return true;
        }

        if ("openNotificationSettings".equals(action)) {
            Intent it = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
            it.putExtra(Settings.EXTRA_APP_PACKAGE, ctx.getPackageName());
            return launch(it, cb);
        }

        if ("openExactAlarmSettings".equals(action)) {
            Intent it;
            if (Build.VERSION.SDK_INT >= 31) {
                it = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:" + ctx.getPackageName()));
            } else {
                it = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + ctx.getPackageName()));
            }
            return launch(it, cb);
        }

        if ("requestIgnoreBattery".equals(action)) {
            if (BackupCore.ignoringBattery(ctx)) { cb.success(); return true; }
            Intent it = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + ctx.getPackageName()));
            try {
                cordova.getActivity().startActivity(it);
                cb.success();
            } catch (Exception e) {
                return launch(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS), cb);
            }
            return true;
        }

        return false;
    }

    private boolean launch(Intent it, CallbackContext cb) {
        try {
            cordova.getActivity().startActivity(it);
            cb.success();
        } catch (Exception e) {
            cb.error(String.valueOf(e.getMessage()));
        }
        return true;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQ_SPEECH) return;
        CallbackContext cb = speechCb;
        speechCb = null;
        if (cb == null) return;
        if (resultCode == Activity.RESULT_OK && data != null) {
            ArrayList<String> r = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (r != null && !r.isEmpty()) { cb.success(r.get(0)); return; }
        }
        cb.error("cancelled");
    }
}
