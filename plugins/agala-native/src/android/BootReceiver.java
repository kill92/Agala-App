package com.liad.agala;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** מתזמן מחדש את הגיבוי אחרי הפעלה מחדש, עדכון האפליקציה או שינוי שעה/אזור זמן. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        final String a = intent.getAction();
        boolean ok = Intent.ACTION_BOOT_COMPLETED.equals(a)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)
                || Intent.ACTION_TIME_CHANGED.equals(a)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(a);
        if (!ok) return;
        final PendingResult pr = goAsync();
        final Context app = context.getApplicationContext();
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    BackupCore.schedule(app);
                    if (Intent.ACTION_BOOT_COMPLETED.equals(a) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(a)) {
                        BackupCore.catchUp(app);
                    }
                } finally {
                    pr.finish();
                }
            }
        }).start();
    }
}
