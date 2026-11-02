'use strict';
/**
 * עגלה – פונקציות ענן
 *  1. onMomListWrite  – אמא שלחה/עדכנה רשימה => התראה לליעד; ליעד סימן "הוזמן" => התראה לאמא
 *  2. weeklyReminders – כל 15 דקות בודקת אם הגיע הזמן להזכיר לאמא להזין רשימה
 */
const { setGlobalOptions } = require('firebase-functions/v2');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const TZ = 'Asia/Jerusalem';
const REGION = 'europe-west1'; // חייב להתאים למיקום ה-Firestore שנבחר
const DEFAULT_MSG = 'בוקר טוב! זה הזמן לרשום מה חסר בבית לקניות 🛒';
const SKIP_IF_SENT_WITHIN_MS = 20 * 3600 * 1000;
const WINDOW_MIN = 90;

setGlobalOptions({ region: REGION, maxInstances: 3 });

/* ---------- עזרים (נבדקים בבדיקות אוטומטיות) ---------- */
const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function tzParts(date, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz || TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const g = (t) => parts.find((p) => p.type === t).value;
  return {
    date: g('year') + '-' + g('month') + '-' + g('day'),
    dow: WEEKDAYS[g('weekday')],
    minutes: (parseInt(g('hour'), 10) % 24) * 60 + parseInt(g('minute'), 10)
  };
}

function shouldRemind(r, lastDate, now, tz) {
  if (!r || !r.enabled || !Array.isArray(r.days) || !r.days.length) return false;
  const m = /^(\d{1,2}):(\d{2})$/.exec(r.time || '');
  if (!m) return false;
  const want = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const p = tzParts(now, tz);
  if (r.days.indexOf(p.dow) < 0) return false;
  if (lastDate === p.date) return false;
  return p.minutes >= want && p.minutes < want + WINDOW_MIN;
}

function summarize(items) {
  const names = Object.keys(items || {}).map((k) => items[k]).filter((i) => i && i.t).map((i) => i.t);
  const n = names.length;
  const shown = names.slice(0, 4).join(', ');
  const more = n > 4 ? ' ועוד ' + (n - 4) : '';
  return { n, text: n ? shown + more : '' };
}

/* ---------- שליחה ---------- */
async function push(fid, role, notification, data) {
  const snap = await db.collection('families/' + fid + '/members').where('role', '==', role).get();
  const targets = snap.docs.map((d) => ({ ref: d.ref, token: d.get('token') })).filter((t) => t.token);
  if (!targets.length) { logger.info('no tokens', { fid, role }); return 0; }
  const res = await admin.messaging().sendEachForMulticast({
    tokens: targets.map((t) => t.token),
    notification,
    data: data || {},
    android: {
      priority: 'high',
      ttl: 6 * 3600 * 1000,
      notification: { channelId: 'agala_main', icon: 'notification_icon', color: '#12805C', sound: 'default' }
    }
  });
  await Promise.all(res.responses.map((r, i) => {
    if (r.success) return null;
    const code = (r.error && r.error.code) || '';
    logger.warn('push failed', { code });
    if (/registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) {
      return targets[i].ref.update({ token: admin.firestore.FieldValue.delete() }).catch(() => null);
    }
    return null;
  }));
  return res.successCount;
}

/* ---------- טריגרים ---------- */
exports.onMomListWrite = onDocumentWritten('families/{fid}/lists/mom', async (event) => {
  const before = event.data.before.exists ? event.data.before.data() : {};
  const after = event.data.after.exists ? event.data.after.data() : null;
  if (!after) return;
  const fid = event.params.fid;

  if ((after.sendSeq || 0) > (before.sendSeq || 0)) {
    const isUpdate = !!before.sentAt;
    const s = summarize(after.items);
    await push(fid, 'liad', {
      title: isUpdate ? 'אמא עדכנה את רשימת הקניות' : 'אמא שלחה רשימת קניות',
      body: s.n ? s.n + (s.n === 1 ? ' מוצר: ' : ' מוצרים: ') + s.text : 'הרשימה ריקה'
    }, { type: 'sent', count: String(s.n) });
  }

  if ((after.orderedSeq || 0) > (before.orderedSeq || 0)) {
    await push(fid, 'mom', {
      title: 'ההזמנה בוצעה! 🎉',
      body: 'הקניות בדרך אלייך. אפשר להתחיל רשימה חדשה מתי שנוח.'
    }, { type: 'ordered' });
  }
});

async function runReminders(now) {
  const snap = await db.collection('families').where('reminder.enabled', '==', true).get();
  let sent = 0;
  for (const doc of snap.docs) {
    const r = doc.get('reminder') || {};
    if (!shouldRemind(r, doc.get('lastReminderDate'), now, TZ)) continue;
    const today = tzParts(now, TZ).date;
    const mom = await doc.ref.collection('lists').doc('mom').get();
    const sentAt = mom.exists && mom.get('sentAt');
    if (sentAt && now.getTime() - sentAt.toMillis() < SKIP_IF_SENT_WITHIN_MS) {
      await doc.ref.update({ lastReminderDate: today }); // כבר שלחה לאחרונה – לא מטרידים
      continue;
    }
    const ok = await push(doc.id, 'mom', { title: 'עגלה 🛒', body: r.msg || DEFAULT_MSG }, { type: 'reminder' });
    if (ok > 0) { await doc.ref.update({ lastReminderDate: today }); sent++; }
  }
  return sent;
}

/* איפוס שבועי: מנקה את הרשימה שאמא מכינה (לא את "הרשימה שנשלחה" של ליעד – היא נשארת עד "הוזמן").
   ברירת מחדל: יום חמישי 05:00. נשלט מההגדרות (families/{id}.reset). */
const DEFAULT_RESET = { enabled: true, day: 4, time: '05:00' };
async function runWeeklyReset(now) {
  const snap = await db.collection('families').get();
  let n = 0;
  for (const doc of snap.docs) {
    const r = Object.assign({}, DEFAULT_RESET, doc.get('reset') || {});
    if (!shouldRemind({ enabled: r.enabled, days: [r.day], time: r.time }, doc.get('lastResetDate'), now, TZ)) continue;
    const today = tzParts(now, TZ).date;
    const ref = doc.ref.collection('lists').doc('mom');
    const mom = await ref.get();
    if (mom.exists) {
      await ref.update({ items: {}, sentCount: 0, sentAt: admin.firestore.FieldValue.delete(), mAt: admin.firestore.FieldValue.delete() });
      n++;
    }
    await doc.ref.update({ lastResetDate: today });
  }
  return n;
}

exports.weeklyReminders = onSchedule({ schedule: 'every 15 minutes', timeZone: TZ }, async () => {
  const n = await runReminders(new Date());
  const r = await runWeeklyReset(new Date());
  logger.info('scheduled run', { reminders: n, resets: r });
});

exports._test = { tzParts, shouldRemind, summarize, runReminders, runWeeklyReset, push };
