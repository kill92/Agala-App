package com.liad.agala;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** מופעל על ידי AlarmManager ב-23:50: מגבה ומתזמן את הלילה הבא. */
public class BackupAlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(final Context context, Intent intent) {
        if (intent == null || !BackupCore.ACTION_ALARM.equals(intent.getAction())) return;
        final PendingResult pr = goAsync();
        final Context app = context.getApplicationContext();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    try {
                        BackupCore.runBackup(app);
                    } catch (Exception ignored) {
                        // השגיאה נשמרת ב-SharedPreferences ומוצגת בהגדרות
                    }
                    BackupCore.schedule(app);
                } finally {
                    pr.finish();
                }
            }
        }).start();
    }
}
