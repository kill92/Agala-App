package com.liad.agala;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONObject;

import java.util.ArrayList;

/**
 * הכתבה רציפה: מאזין עד שהמשתמשת לוחצת "סיום" (מופעל מחדש אוטומטית אחרי כל שתיקה).
 * כל הקריאות חייבות להגיע ב-thread הראשי. אירועים לצד ה-JS: ready / partial / final / end / error.
 */
public class LiveSpeech {
    private final Context ctx;
    private final Handler h = new Handler(Looper.getMainLooper());
    private SpeechRecognizer rec;
    private CallbackContext cb;
    private String lang = "he-IL";
    private boolean active, stopping, inSession, readySent;
    private int busyStreak;

    public LiveSpeech(Context ctx) { this.ctx = ctx; }

    public static boolean available(Context ctx) {
        try { return SpeechRecognizer.isRecognitionAvailable(ctx); } catch (Exception e) { return false; }
    }

    public void start(String language, CallbackContext callback) {
        destroy();
        h.removeCallbacksAndMessages(null);
        lang = (language == null || language.length() == 0) ? "he-IL" : language;
        cb = callback;
        active = true; stopping = false; inSession = false; readySent = false; busyStreak = 0;
        begin();
    }

    public void stop() {
        if (!active) return;
        stopping = true;
        if (!inSession) { finish(); return; }
        try { if (rec != null) rec.stopListening(); } catch (Exception e) { finish(); return; }
        h.postDelayed(new Runnable() { public void run() { finish(); } }, 1800);
    }

    public void cancel() {
        if (!active) { destroy(); return; }
        finish();
    }

    private Intent intent() {
        Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        it.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        it.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, ctx.getPackageName());
        it.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2500L);
        it.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L);
        return it;
    }

    private void begin() {
        if (!active) return;
        try {
            if (rec == null) {
                rec = SpeechRecognizer.createSpeechRecognizer(ctx);
                rec.setRecognitionListener(listener);
            }
            inSession = true;
            rec.startListening(intent());
        } catch (Exception e) {
            fail("start");
        }
    }

    private void again(long delay) {
        if (!active || stopping) { if (stopping) finish(); return; }
        inSession = false;
        h.postDelayed(new Runnable() { public void run() { begin(); } }, delay);
    }

    private final RecognitionListener listener = new RecognitionListener() {
        public void onReadyForSpeech(Bundle params) {
            if (!readySent) { readySent = true; send("ready", null, null, true); }
        }
        public void onBeginningOfSpeech() { }
        public void onRmsChanged(float rmsdB) { }
        public void onBufferReceived(byte[] buffer) { }
        public void onEndOfSpeech() { }
        public void onEvent(int eventType, Bundle params) { }
        public void onPartialResults(Bundle b) {
            String t = first(b);
            if (t != null) send("partial", t, null, true);
        }
        public void onResults(Bundle b) {
            busyStreak = 0;
            String t = first(b);
            if (t != null) send("final", t, null, true);
            inSession = false;
            if (stopping) { finish(); return; }
            again(250);
        }
        public void onError(int error) {
            inSession = false;
            if (stopping) { finish(); return; }
            if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) { again(250); return; }
            if (error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY && ++busyStreak < 6) {
                try { if (rec != null) rec.cancel(); } catch (Exception e) { }
                again(600);
                return;
            }
            if (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS) { fail("perm"); return; }
            fail("err" + error);
        }
    };

    private static String first(Bundle b) {
        if (b == null) return null;
        ArrayList<String> l = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (l == null || l.isEmpty()) return null;
        String t = l.get(0);
        return (t == null || t.trim().length() == 0) ? null : t;
    }

    private void send(String type, String text, String code, boolean keep) {
        if (cb == null) return;
        try {
            JSONObject o = new JSONObject();
            o.put("t", type);
            if (text != null) o.put("text", text);
            if (code != null) o.put("code", code);
            PluginResult pr = new PluginResult(PluginResult.Status.OK, o);
            pr.setKeepCallback(keep);
            cb.sendPluginResult(pr);
        } catch (Exception e) { }
    }

    private void finish() {
        if (!active) return;
        active = false;
        h.removeCallbacksAndMessages(null);
        send("end", null, null, false);
        cb = null;
        destroy();
    }

    private void fail(String code) {
        boolean was = active;
        active = false;
        h.removeCallbacksAndMessages(null);
        if (was) send("error", null, code, false);
        cb = null;
        destroy();
    }

    private void destroy() {
        SpeechRecognizer r = rec;
        rec = null;
        inSession = false;
        if (r != null) {
            try { r.cancel(); } catch (Exception e) { }
            try { r.destroy(); } catch (Exception e) { }
        }
    }
}
