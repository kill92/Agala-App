package com.liad.agala;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.MediaStore;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Locale;

/** לוגיקת הגיבוי המקומי: צילום מצב אחרון + כתיבה ל-Documents/Agala + תזמון יומי. */
final class BackupCore {
    static final String PREFS = "agala_backup";
    static final String ACTION_ALARM = "com.liad.agala.BACKUP_ALARM";
    static final String REL_PATH = "Documents/Agala/";
    static final String PREFIX = "agala-backup-";
    static final int KEEP = 14;
    private static final int REQ_ALARM = 4711;
    private static final Object LOCK = new Object();

    private BackupCore() {}

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static File snapshotFile(Context c) {
        return new File(c.getFilesDir(), "agala_snapshot.json");
    }

    static void saveSnapshot(Context c, String json) throws IOException {
        synchronized (LOCK) {
            File tmp = new File(c.getFilesDir(), "agala_snapshot.tmp");
            FileOutputStream fo = new FileOutputStream(tmp);
            try {
                fo.write(json.getBytes("UTF-8"));
                fo.getFD().sync();
            } finally {
                fo.close();
            }
            File dst = snapshotFile(c);
            if (!tmp.renameTo(dst)) {
                if (dst.exists() && !dst.delete()) throw new IOException("cannot replace snapshot");
                if (!tmp.renameTo(dst)) throw new IOException("cannot move snapshot");
            }
        }
    }

    static byte[] readAll(File f) throws IOException {
        InputStream in = new FileInputStream(f);
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return out.toByteArray();
        } finally {
            in.close();
        }
    }

    /* ---------- תזמון ---------- */

    static int hour(Context c) { return prefs(c).getInt("hour", 23); }
    static int minute(Context c) { return prefs(c).getInt("minute", 50); }

    static long slotOnDay(Calendar base, int hour, int minute) {
        Calendar cal = (Calendar) base.clone();
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, minute);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTimeInMillis();
    }

    static long nextTrigger(int hour, int minute) {
        Calendar now = Calendar.getInstance();
        long t = slotOnDay(now, hour, minute);
        if (t <= System.currentTimeMillis() + 1000L) {
            Calendar tomorrow = (Calendar) now.clone();
            tomorrow.add(Calendar.DAY_OF_YEAR, 1);
            t = slotOnDay(tomorrow, hour, minute);
        }
        return t;
    }

    /** מועד הגיבוי המתוזמן האחרון שכבר עבר. */
    static long lastSlot(int hour, int minute) {
        Calendar now = Calendar.getInstance();
        long t = slotOnDay(now, hour, minute);
        if (t > System.currentTimeMillis()) {
            Calendar yesterday = (Calendar) now.clone();
            yesterday.add(Calendar.DAY_OF_YEAR, -1);
            t = slotOnDay(yesterday, hour, minute);
        }
        return t;
    }

    static boolean canExact(Context c) {
        if (Build.VERSION.SDK_INT < 31) return true;
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        return am != null && am.canScheduleExactAlarms();
    }

    static boolean ignoringBattery(Context c) {
        if (Build.VERSION.SDK_INT < 23) return true;
        PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
        return pm != null && pm.isIgnoringBatteryOptimizations(c.getPackageName());
    }

    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Intent i = new Intent(c, BackupAlarmReceiver.class);
        i.setAction(ACTION_ALARM);
        PendingIntent pi = PendingIntent.getBroadcast(c, REQ_ALARM, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        long t = nextTrigger(hour(c), minute(c));
        try {
            if (canExact(c)) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
        } catch (SecurityException e) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, pi);
        }
    }

    /** אם הגיבוי המתוזמן האחרון הוחמץ (הטלפון כבוי / הסוללה חנקה את ההתראה) – מבצע אותו עכשיו. */
    static void catchUp(Context c) {
        try {
            if (!snapshotFile(c).exists()) return;
            long last = prefs(c).getLong("lastAt", 0L);
            if (last < lastSlot(hour(c), minute(c))) runBackup(c);
        } catch (Exception e) {
            prefs(c).edit().putString("lastError", String.valueOf(e.getMessage())).apply();
        }
    }

    /* ---------- כתיבת הגיבוי ---------- */

    static String runBackup(Context c) throws IOException {
        synchronized (LOCK) {
            File snap = snapshotFile(c);
            if (!snap.exists()) throw new IOException("no snapshot yet");
            byte[] data = readAll(snap);
            String name = PREFIX + new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()) + ".json";
            try {
                if (Build.VERSION.SDK_INT >= 29) writeMediaStore(c, name, data);
                else writeLegacy(c, name, data);
                prune(c);
            } catch (IOException e) {
                prefs(c).edit().putString("lastError", String.valueOf(e.getMessage())).apply();
                throw e;
            } catch (RuntimeException e) {
                prefs(c).edit().putString("lastError", String.valueOf(e.getMessage())).apply();
                throw new IOException(String.valueOf(e.getMessage()));
            }
            prefs(c).edit().putLong("lastAt", System.currentTimeMillis()).putString("lastName", name).remove("lastError").apply();
            return name;
        }
    }

    private static void writeMediaStore(Context c, String name, byte[] data) throws IOException {
        ContentResolver r = c.getContentResolver();
        Uri coll = MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        Cursor q = r.query(coll, new String[]{MediaStore.MediaColumns._ID},
                MediaStore.MediaColumns.DISPLAY_NAME + "=? AND " + MediaStore.MediaColumns.RELATIVE_PATH + "=?",
                new String[]{name, REL_PATH}, null);
        if (q != null) {
            try {
                while (q.moveToNext()) r.delete(ContentUris.withAppendedId(coll, q.getLong(0)), null, null);
            } finally {
                q.close();
            }
        }
        ContentValues v = new ContentValues();
        v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
        v.put(MediaStore.MediaColumns.MIME_TYPE, "application/json");
        v.put(MediaStore.MediaColumns.RELATIVE_PATH, REL_PATH);
        v.put(MediaStore.MediaColumns.IS_PENDING, 1);
        Uri u = r.insert(coll, v);
        if (u == null) throw new IOException("MediaStore insert failed");
        OutputStream os = r.openOutputStream(u, "wt");
        if (os == null) throw new IOException("cannot open output");
        try {
            os.write(data);
            os.flush();
        } finally {
            os.close();
        }
        ContentValues done = new ContentValues();
        done.put(MediaStore.MediaColumns.IS_PENDING, 0);
        r.update(u, done, null, null);
    }

    private static File legacyDir(Context c) {
        File d = c.getExternalFilesDir("backups");
        if (d == null) d = new File(c.getFilesDir(), "backups");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private static void writeLegacy(Context c, String name, byte[] data) throws IOException {
        FileOutputStream fo = new FileOutputStream(new File(legacyDir(c), name));
        try {
            fo.write(data);
        } finally {
            fo.close();
        }
    }

    private static void prune(Context c) {
        if (Build.VERSION.SDK_INT >= 29) {
            ContentResolver r = c.getContentResolver();
            Uri coll = MediaStore.Files.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
            Cursor q = r.query(coll, new String[]{MediaStore.MediaColumns._ID, MediaStore.MediaColumns.DISPLAY_NAME},
                    MediaStore.MediaColumns.RELATIVE_PATH + "=? AND " + MediaStore.MediaColumns.DISPLAY_NAME + " LIKE ?",
                    new String[]{REL_PATH, PREFIX + "%"}, MediaStore.MediaColumns.DISPLAY_NAME + " DESC");
            if (q == null) return;
            try {
                int idx = 0;
                while (q.moveToNext()) {
                    idx++;
                    if (idx > KEEP) r.delete(ContentUris.withAppendedId(coll, q.getLong(0)), null, null);
                }
            } finally {
                q.close();
            }
        } else {
            File[] files = legacyDir(c).listFiles();
            if (files == null) return;
            List<File> list = new ArrayList<File>(Arrays.asList(files));
            Collections.sort(list, Collections.reverseOrder());
            for (int i = KEEP; i < list.size(); i++) list.get(i).delete();
        }
    }

    /* ---------- מידע ל-UI ---------- */

    static JSONObject info(Context c) throws JSONException {
        SharedPreferences p = prefs(c);
        JSONObject o = new JSONObject();
        o.put("lastAt", p.getLong("lastAt", 0L));
        o.put("lastName", p.getString("lastName", ""));
        o.put("lastError", p.getString("lastError", ""));
        o.put("hasSnapshot", snapshotFile(c).exists());
        o.put("exactAllowed", canExact(c));
        o.put("ignoringBattery", ignoringBattery(c));
        o.put("hour", hour(c));
        o.put("minute", minute(c));
        o.put("folder", REL_PATH);
        return o;
    }
}
