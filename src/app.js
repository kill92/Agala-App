/* עגלה – לוגיקת האפליקציה (נטענת על ידי הקליפה; ניתנת לעדכון OTA חתום) */
(function () {
  'use strict';

  var FBM, SH, NS, NA;

  /* ---------- קבועים ---------- */
  var DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  var DAYNAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  var ACCENTS = { green: ['#12805c', '#4ade9a'], blue: ['#2563eb', '#7aa7ff'], purple: ['#7c3aed', '#b69cff'], orange: ['#c2570c', '#ffa65c'], pink: ['#c0266b', '#ff8fc0'] };
  var ACCENT_NAMES = { green: 'ירוק', blue: 'כחול', purple: 'סגול', orange: 'כתום', pink: 'ורוד' };
  var FONTS = { m: 18, l: 22, xl: 26 };
  var DEFAULT_QUICK = ['חלב', 'לחם', 'ביצים', 'גבינה צהובה', 'עגבניות', 'מלפפונים', 'בננות', 'עוף', 'שמן', 'אורז'];
  var DEFAULT_MSG = 'בוקר טוב! זה הזמן לרשום מה חסר בבית לקניות 🛒';
  var MAX_ITEMS = 150;

  var ICONS = {
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    save: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    wa: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'
  };

  /* ---------- עזרים ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ico(n, cls) { return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + '</svg>'; }
  function noop() {}
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function rid() {
    var a = new Uint8Array(6); crypto.getRandomValues(a);
    var s = ''; for (var i = 0; i < a.length; i++) s += 'abcdefghijkmnpqrstuvwxyz23456789'[a[i] % 32];
    return s;
  }
  function gen8() {
    var a = new Uint32Array(2); crypto.getRandomValues(a);
    return String(10000000 + (a[0] % 90000000));
  }
  function fmtCode(c) { return c ? c.slice(0, 4) + '-' + c.slice(4) : ''; }
  function normQ(v) { var q = +v; if (!(q >= 0.5)) return 1; q = Math.round(q * 2) / 2; return Math.min(99, q); }
  function fmtQ(q) { return Number.isInteger(q) ? String(q) : q.toFixed(1); }
  function tsMs(x) {
    if (!x) return 0;
    if (typeof x === 'number') return x;
    if (typeof x.toMillis === 'function') return x.toMillis();
    return 0;
  }
  function withTimeout(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { var e = new Error('timeout'); e.code = 'timeout'; rej(e); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }
  function errKind(e) {
    var c = e && e.code ? String(e.code) : '';
    if (c.indexOf('permission-denied') >= 0) return 'denied';
    if (c === 'timeout' || c.indexOf('unavailable') >= 0 || c.indexOf('network') >= 0 || c.indexOf('deadline') >= 0) return 'offline';
    return 'other';
  }
  function relTime(ms) {
    if (!ms) return '';
    var now = new Date(), d = new Date(ms), diff = now - d;
    if (diff < 60000) return 'ממש עכשיו';
    if (diff < 3600000) { var m = Math.round(diff / 60000); return m === 1 ? 'לפני דקה' : 'לפני ' + m + ' דקות'; }
    var hm = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    var sameDay = now.toDateString() === d.toDateString();
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay) return 'היום ב-' + hm;
    if (y.toDateString() === d.toDateString()) return 'אתמול ב-' + hm;
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + ' ב-' + hm;
  }
  function hexRgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* ---------- אחסון מקומי ---------- */
  function lsGet(k) { try { return localStorage.getItem(NS + '.' + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(NS + '.' + k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(NS + '.' + k); } catch (e) {} }
  function lsJson(k, def) { try { var v = JSON.parse(lsGet(k)); return v && typeof v === 'object' ? v : def; } catch (e) { return def; } }

  /* ---------- מצב ---------- */
  var P = { theme: 'auto', accent: 'green', font: null };
  var C = { role: null, code: null };
  var S = {
    phase: 'init', tab: 'list', uid: null, db: null, auth: null, token: null,
    family: null, famMissing: false,
    mom: { items: [], meta: {}, pending: false, fromCache: true },
    liad: { items: [], meta: {}, pending: false, fromCache: true },
    unsubs: [], perm: null, online: navigator.onLine !== false, speech: false,
    backup: null, serverSeen: false, retriedJoin: false, pendingRestore: null,
    updateMsg: '', sheet: false, onboarding: null
  };

  /* ---------- מראה ---------- */
  function applyPrefs() {
    var role = C.role;
    var fk = P.font || (role === 'mom' ? 'l' : 'm');
    var root = document.documentElement;
    root.style.setProperty('--fs', (FONTS[fk] || 22) + 'px');
    var dark = P.theme === 'dark' || (P.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.setAttribute('data-role', role || '');
    var a = ACCENTS[P.accent] || ACCENTS.green;
    var col = dark ? a[1] : a[0];
    root.style.setProperty('--accent', col);
    root.style.setProperty('--on-accent', dark ? '#06130d' : '#ffffff');
    root.style.setProperty('--accent-soft', hexRgba(col, dark ? 0.18 : 0.12));
  }
  function savePrefs() { lsSet('prefs', JSON.stringify(P)); applyPrefs(); }

  /* ---------- Toast / Sheet ---------- */
  var toastTimer;
  function toast(msg, opt) {
    opt = opt || {};
    var el = $('#toast');
    el.innerHTML = '<div class="toast"><span>' + esc(msg) + '</span>' + (opt.label ? '<button type="button" id="toastBtn">' + esc(opt.label) + '</button>' : '') + '</div>';
    if (opt.label) {
      $('#toastBtn').onclick = function () { el.innerHTML = ''; clearTimeout(toastTimer); if (opt.fn) opt.fn(); };
    }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.innerHTML = ''; }, opt.ms || (opt.label ? 6500 : 3200));
  }
  function openSheet(html, mount) {
    var sh = $('#sheet');
    sh.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    sh.hidden = false; S.sheet = true;
    sh.onclick = function (e) { if (e.target === sh) closeSheet(); };
    if (mount) mount(sh);
    var f = $('input.field', sh) || $('button.primary', sh);
    if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 60);
  }
  function closeSheet() { var sh = $('#sheet'); sh.hidden = true; sh.innerHTML = ''; S.sheet = false; }
  function confirmSheet(o) {
    return new Promise(function (res) {
      openSheet('<h3>' + esc(o.title) + '</h3><p>' + esc(o.body || '') + '</p>' +
        '<div class="two"><button class="btn ' + (o.danger ? 'danger' : 'primary') + '" id="cfOk">' + esc(o.ok || 'אישור') + '</button><button class="btn" id="cfNo">' + esc(o.cancel || 'חזרה') + '</button></div>',
        function (sh) {
          $('#cfOk', sh).onclick = function () { closeSheet(); res(true); };
          $('#cfNo', sh).onclick = function () { closeSheet(); res(false); };
          sh.onclick = function (e) { if (e.target === sh) { closeSheet(); res(false); } };
        });
    });
  }
  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); return ok;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  }

  /* ---------- Firebase ---------- */
  function initFirebase() {
    if (S.db) return;
    var app = FBM.initializeApp(SH.fb);
    S.auth = FBM.initializeAuth(app, { persistence: FBM.indexedDBLocalPersistence });
    S.db = FBM.initializeFirestore(app, {
      localCache: FBM.persistentLocalCache({ tabManager: FBM.persistentSingleTabManager(undefined) })
    });
  }
  function ensureAuth() {
    return S.auth.authStateReady().then(function () {
      if (S.auth.currentUser) return;
      return withTimeout(FBM.signInAnonymously(S.auth), 15000);
    }).then(function () { S.uid = S.auth.currentUser.uid; });
  }
  function famRef() { return FBM.doc(S.db, 'families', C.code); }
  function momRef() { return FBM.doc(S.db, 'families', C.code, 'lists', 'mom'); }
  function liadRef() { return FBM.doc(S.db, 'families', C.code, 'private', 'liad'); }
  function memberRef() { return FBM.doc(S.db, 'families', C.code, 'members', S.uid); }
  function listRef(key) { return key === 'mom' ? momRef() : liadRef(); }
  function listOf(key) { return key === 'mom' ? S.mom : S.liad; }

  function getToken(ms) {
    if (S.token) return Promise.resolve(S.token);
    var FP = window.FirebasePlugin;
    if (!FP || !FP.getToken) return Promise.resolve(null);
    return withTimeout(new Promise(function (res) {
      FP.getToken(function (t) { S.token = t || null; res(S.token); }, function () { res(null); });
    }), ms).catch(function () { return null; });
  }
  function registerMember() {
    return getToken(4000).then(function (tok) {
      var d = { role: C.role, platform: 'android', updatedAt: FBM.serverTimestamp() };
      if (tok) d.token = tok;
      return FBM.setDoc(memberRef(), d, { merge: true });
    });
  }

  function parseList(snap) {
    var d = snap.exists() ? snap.data({ serverTimestamps: 'estimate' }) : {};
    var m = d.items || {}, items = [];
    Object.keys(m).forEach(function (id) {
      var v = m[id];
      if (v && typeof v.t === 'string' && v.t) items.push({ id: id, t: v.t, q: normQ(v.q), d: !!v.d, c: +v.c || 0, by: v.by || '' });
    });
    items.sort(function (a, b) { return a.c - b.c || (a.id < b.id ? -1 : 1); });
    return {
      items: items,
      meta: { sentAt: tsMs(d.sentAt), mAt: tsMs(d.mAt), sendSeq: d.sendSeq || 0, orderedAt: tsMs(d.orderedAt) },
      pending: !!snap.metadata.hasPendingWrites,
      fromCache: !!snap.metadata.fromCache
    };
  }

  function unsub() { S.unsubs.forEach(function (u) { try { u(); } catch (e) {} }); S.unsubs = []; }
  function subscribe() {
    unsub();
    var opt = { includeMetadataChanges: true };
    S.unsubs.push(FBM.onSnapshot(famRef(), opt, function (s) {
      S.family = s.exists() ? s.data() : null;
      if (!s.metadata.fromCache) S.serverSeen = true;
      S.famMissing = !s.exists() && !s.metadata.fromCache;
      onData('fam');
    }, onSnapErr));
    S.unsubs.push(FBM.onSnapshot(momRef(), opt, function (s) {
      S.mom = parseList(s); if (!S.mom.fromCache) S.serverSeen = true; onData('mom');
    }, onSnapErr));
    if (C.role === 'liad') {
      S.unsubs.push(FBM.onSnapshot(liadRef(), opt, function (s) {
        S.liad = parseList(s); onData('liad');
      }, onSnapErr));
    }
  }
  function onSnapErr(e) {
    if (errKind(e) === 'denied' && !S.retriedJoin) {
      S.retriedJoin = true;
      registerMember().then(subscribe).catch(function () { drawReconnect(); });
      return;
    }
    if (errKind(e) === 'denied') drawReconnect();
  }

  /* ---------- פעולות רשימה ---------- */
  function cleanText(t) { return String(t || '').replace(/\s+/g, ' ').trim().slice(0, 60); }
  function writeList(key, patch) {
    return FBM.setDoc(listRef(key), patch, { merge: true }).catch(function () { toast('לא הצלחתי לשמור. נסי שוב.'); });
  }
  function stampFor(key) { return (key === 'mom' && C.role === 'mom') ? { mAt: FBM.serverTimestamp() } : {}; }
  function addItem(key, text, forceId, extra) {
    text = cleanText(text);
    if (!text) return 'empty';
    var list = listOf(key);
    var low = text.toLowerCase();
    for (var i = 0; i < list.items.length; i++) if (list.items[i].t.toLowerCase() === low) return 'dup:' + list.items[i].id;
    if (list.items.length >= MAX_ITEMS) return 'full';
    var id = forceId || rid();
    var it = { t: text, q: 1, d: false, c: Date.now(), by: C.role };
    if (extra) for (var k in extra) it[k] = extra[k];
    var p = { items: {} }; p.items[id] = it;
    var st = stampFor(key); for (var s in st) p[s] = st[s];
    writeList(key, p);
    return id;
  }
  function patchItem(key, id, fields) {
    var p = { items: {} }; p.items[id] = fields;
    var st = stampFor(key); for (var s in st) p[s] = st[s];
    writeList(key, p);
  }
  function deleteItem(key, id) {
    var p = { items: {} }; p.items[id] = FBM.deleteField();
    var st = stampFor(key); for (var s in st) p[s] = st[s];
    writeList(key, p);
  }
  function findItem(key, id) {
    var a = listOf(key).items; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null;
  }
  function flashItem(id) {
    var el = $('li[data-id="' + id + '"]'); if (!el) return;
    el.classList.add('flash'); try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    setTimeout(function () { el.classList.remove('flash'); }, 1400);
  }
  function addAndReport(key, text) {
    var r = addItem(key, text);
    if (r === 'empty') return false;
    if (r === 'full') { toast('הרשימה מלאה (' + MAX_ITEMS + ' מוצרים).'); return false; }
    if (r.indexOf('dup:') === 0) { toast('"' + cleanText(text) + '" כבר ברשימה'); flashItem(r.slice(4)); return false; }
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) {}
    return r;
  }
  function removeWithUndo(key, id) {
    var it = findItem(key, id); if (!it) return;
    var copy = { t: it.t, q: it.q, d: it.d, c: it.c, by: it.by };
    deleteItem(key, id);
    toast('נמחק: ' + it.t, { label: 'ביטול', fn: function () { var p = { items: {} }; p.items[id] = copy; writeList(key, p); } });
  }

  function sendList() {
    var n = S.mom.items.length;
    FBM.setDoc(momRef(), { sendSeq: FBM.increment(1), sentAt: FBM.serverTimestamp(), sentCount: n, mAt: FBM.serverTimestamp() }, { merge: true })
      .catch(function () { toast('לא הצלחתי לשלוח. נסי שוב.'); });
    toast(S.online ? 'הרשימה נשלחה ליעד ✓' : 'אין אינטרנט כרגע. הרשימה תישלח לבד כשהחיבור יחזור.', { ms: 4500 });
  }
  function markOrdered() {
    FBM.setDoc(momRef(), {
      items: {}, orderedSeq: FBM.increment(1), orderedAt: FBM.serverTimestamp(),
      sentAt: FBM.deleteField(), sentCount: 0, mAt: FBM.deleteField()
    }, { mergeFields: ['items', 'orderedSeq', 'orderedAt', 'sentAt', 'sentCount', 'mAt'] })
      .catch(function () { toast('לא הצלחתי לעדכן. נסה שוב.'); });
    toast('מצוין! הרשימה נוקתה ואמא קיבלה הודעה שההזמנה בוצעה ✓', { ms: 4200 });
  }
  function listText(key) {
    var items = listOf(key).items.filter(function (i) { return !i.d; });
    return (key === 'mom' ? 'רשימת קניות – אמא' : 'רשימת קניות') + ':\n' +
      items.map(function (i) { return '• ' + i.t + (i.q !== 1 ? ' ×' + fmtQ(i.q) : ''); }).join('\n');
  }
  function saveQuick(arr) {
    FBM.setDoc(famRef(), { quick: arr }, { merge: true }).catch(function () { toast('לא הצלחתי לשמור.'); });
  }
  function saveReminder(r) {
    FBM.setDoc(famRef(), { reminder: r }, { merge: true }).catch(function () { toast('לא הצלחתי לשמור.'); });
  }
  function reminder() {
    var r = (S.family && S.family.reminder) || {};
    return { enabled: !!r.enabled, days: Array.isArray(r.days) ? r.days.slice() : [], time: r.time || '18:00', msg: r.msg || DEFAULT_MSG };
  }

  /* ---------- נייטיב: התראות, גיבוי, קול ---------- */
  function refreshPerm() {
    var FP = window.FirebasePlugin;
    if (!FP || !FP.hasPermission) { S.perm = null; return; }
    FP.hasPermission(function (ok) { S.perm = !!ok; refresh(); });
  }
  function askPerm() {
    var FP = window.FirebasePlugin; if (!FP) return;
    FP.grantPermission(function (ok) { S.perm = !!ok; lsSet('permAsked', '1'); refresh(); if (S.tab === 'settings') drawSettings(); }, noop);
  }
  function onPush(m) {
    if (!m) return;
    if (m.tap) { S.tab = 'list'; if (S.phase === 'main') renderMain(); return; }
    var text = (m.title ? m.title + ' – ' : '') + (m.body || '');
    if (text) toast(text, { ms: 6000 });
  }
  function setupNative() {
    var FP = window.FirebasePlugin;
    if (FP) {
      try {
        FP.createChannel({ id: 'agala_main', name: 'התראות עגלה', description: 'תזכורות ועדכוני רשימת קניות', importance: 4, sound: true, vibration: true, light: true, visibility: 1 }, noop, noop);
        FP.onMessageReceived(onPush, noop);
        FP.onTokenRefresh(function (t) { S.token = t; if (S.uid && S.db) registerMember().catch(noop); }, noop);
      } catch (e) {}
      refreshPerm();
      setTimeout(function () {
        if (S.perm === false && !lsGet('permAsked') && S.phase === 'main') {
          openSheet('<h3>' + ico('bell') + ' התראות</h3><p>' + (C.role === 'mom' ? 'כדי שאוכל להזכיר לך לרשום קניות, צריך לאשר התראות. בחלון שיקפוץ לחצי "אפשר".' : 'כדי לקבל התראה כשאמא שולחת רשימה, צריך לאשר התראות.') + '</p><button class="btn primary block" id="permGo">אישור התראות</button><div class="spacer"></div><button class="btn ghost block" id="permNo">אחר כך</button>', function (sh) {
            $('#permGo', sh).onclick = function () { closeSheet(); askPerm(); };
            $('#permNo', sh).onclick = function () { closeSheet(); lsSet('permAsked', '1'); };
          });
        }
      }, 1800);
    }
    if (NA) {
      NA.isSpeechAvailable().then(function (v) {
        S.speech = !!v;
        if (S.speech && S.phase === 'main' && (S.tab === 'list' || S.tab === 'mine') && !focusInScreen()) renderMain();
      }, noop);
      NA.init(23, 50).then(loadBackupInfo, noop);
    }
  }
  function loadBackupInfo() {
    if (!NA) return Promise.resolve();
    return NA.getBackupInfo().then(function (i) { S.backup = i; if (S.tab === 'settings' && !focusInScreen()) drawSettings(); }, noop);
  }
  function buildSnapshot() {
    function obj(items) { var o = {}; items.forEach(function (i) { o[i.id] = { t: i.t, q: i.q, d: i.d, c: i.c, by: i.by }; }); return o; }
    return {
      app: 'agala', schema: 1, savedAt: Date.now(), role: C.role, code: C.code, prefs: P,
      quick: (S.family && S.family.quick) || [], reminder: (S.family && S.family.reminder) || null,
      mom: obj(S.mom.items), liad: obj(S.liad.items)
    };
  }
  var snapTimer;
  function scheduleSnapshot() {
    if (!NA || S.phase !== 'main') return;
    if (!S.serverSeen && !S.mom.items.length && !S.liad.items.length) return; // לא דורסים גיבוי טוב בנתון ריק מהמטמון
    clearTimeout(snapTimer);
    snapTimer = setTimeout(function () { NA.saveSnapshot(JSON.stringify(buildSnapshot())).catch(noop); }, 1500);
  }
  function applyRestore(data) {
    if (!data || data.app !== 'agala') return Promise.reject(new Error('bad'));
    if (data.prefs && typeof data.prefs === 'object') {
      ['theme', 'accent', 'font'].forEach(function (k) { if (data.prefs[k] !== undefined) P[k] = data.prefs[k]; });
      savePrefs();
    }
    var jobs = [];
    function sane(o) {
      var out = {}, n = 0;
      Object.keys(o || {}).forEach(function (id) {
        var v = o[id]; if (n >= MAX_ITEMS || !/^[a-z0-9]{3,20}$/i.test(id) || !v || typeof v.t !== 'string') return;
        out[id] = { t: cleanText(v.t), q: normQ(v.q), d: !!v.d, c: +v.c || Date.now(), by: v.by === 'liad' ? 'liad' : 'mom' }; n++;
      });
      return out;
    }
    var m = sane(data.mom), l = sane(data.liad);
    if (Object.keys(m).length) jobs.push(FBM.setDoc(momRef(), { items: m }, { merge: true }));
    if (C.role === 'liad' && Object.keys(l).length) jobs.push(FBM.setDoc(liadRef(), { items: l }, { merge: true }));
    if (Array.isArray(data.quick) && data.quick.length) {
      var cur = (S.family && S.family.quick) || [], merged = cur.slice();
      data.quick.forEach(function (q) { q = cleanText(q); if (q && merged.indexOf(q) < 0 && merged.length < 40) merged.push(q); });
      jobs.push(FBM.setDoc(famRef(), { quick: merged }, { merge: true }));
    }
    return Promise.all(jobs);
  }
  function readBackupFile(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { try { var d = JSON.parse(String(fr.result)); if (!d || d.app !== 'agala') throw 0; res(d); } catch (e) { rej(new Error('bad')); } };
      fr.onerror = function () { rej(new Error('read')); };
      fr.readAsText(file);
    });
  }
  function pickBackup(handler) {
    var inp = $('#restoreFile'); inp.value = '';
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      readBackupFile(f).then(handler, function () { toast('הקובץ לא נראה כמו גיבוי של עגלה.'); });
    };
    inp.click();
  }

  /* ---------- ניווט ופריסה ---------- */
  function tabsFor() {
    var t = [{ id: 'list', label: 'רשימת קניות', icon: 'cart' }];
    if (C.role === 'liad') t.push({ id: 'mine', label: 'רשימה ליעד', icon: 'user' });
    t.push({ id: 'settings', label: 'הגדרות', icon: 'gear' });
    return t;
  }
  function renderNav() {
    var nav = $('#nav');
    nav.innerHTML = tabsFor().map(function (t) {
      var dot = (t.id === 'settings' && C.role === 'liad' && !reminder().enabled && S.family) ? '<i class="dot" aria-hidden="true"></i>' : '';
      return '<button class="tab" data-act="tab" data-v="' + t.id + '"' + (S.tab === t.id ? ' aria-current="page"' : '') + '>' + ico(t.icon) + '<span>' + t.label + '</span>' + dot + '</button>';
    }).join('');
  }
  function focusInScreen() {
    var a = document.activeElement;
    return !!(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') && $('#screen').contains(a));
  }
  function renderMain() {
    S.phase = 'main';
    var scr = $('#screen'); scr.className = '';
    $('#bars').style.display = '';
    renderNav();
    if (S.tab === 'list') drawListTab();
    else if (S.tab === 'mine' && C.role === 'liad') drawMineTab();
    else { S.tab = 'settings'; drawSettings(); }
    renderSendBar();
    scr.scrollTop = 0; window.scrollTo(0, 0);
  }
  function onData() {
    if (S.phase !== 'main') return;
    if (S.famMissing) { drawReconnect(); return; }
    refresh();
    scheduleSnapshot();
  }
  function refresh() {
    if (S.phase !== 'main') return;
    renderNav();
    if (S.tab === 'list') updateListParts();
    else if (S.tab === 'mine') updateMineParts();
    else if (!focusInScreen() && !S.sheet) drawSettings();
    renderSendBar();
  }

  /* ----- טאב רשימה (אמא) ----- */
  function addCard(key) {
    var mom = C.role === 'mom';
    return '<form class="card add" id="addForm" data-key="' + key + '" autocomplete="off">' +
      '<input type="text" id="addInput" maxlength="60" enterkeyhint="done" aria-label="שם המוצר" placeholder="' + (mom ? 'מה חסר בבית?' : 'הוספת מוצר…') + '">' +
      '<div class="actions">' +
      (S.speech ? '<button type="button" class="btn mic" data-act="mic" data-key="' + key + '" aria-label="הזנה בקול">' + ico('mic', 'lg') + (mom ? '<span>דיבור</span>' : '') + '</button>' : '') +
      '<button type="submit" class="btn primary">' + ico('plus') + ' הוספה</button></div></form>';
  }
  function drawListTab() {
    var mom = C.role === 'mom';
    $('#screen').innerHTML =
      '<div class="top"><h1>' + (mom ? 'הרשימה שלי' : 'הרשימה של אמא') + '</h1><span id="stChip"></span></div>' +
      '<div id="banners"></div>' + addCard('mom') + '<div id="quick"></div><div id="listWrap"></div>';
    bindAdd();
    updateListParts();
  }
  function bindAdd() {
    var f = $('#addForm'); if (!f) return;
    f.onsubmit = function (e) {
      e.preventDefault();
      var inp = $('#addInput'), key = f.getAttribute('data-key');
      var r = addAndReport(key, inp.value);
      if (r) { inp.value = ''; }
      inp.focus();
    };
  }
  function updateListParts() {
    if (!$('#listWrap')) return;
    renderChip(); renderBanners(); renderQuick(); renderItems('mom', '#listWrap');
  }
  function renderChip() {
    var el = $('#stChip'); if (!el) return;
    var m = S.mom.meta, n = S.mom.items.length, changed = m.sentAt && (m.mAt > m.sentAt);
    var h = '';
    if (C.role === 'mom') {
      if (m.sentAt) h = changed ? '<span class="chip warn">יש שינויים שלא נשלחו</span>' : '<span class="chip">' + ico('check') + ' נשלחה ליעד</span>';
      else if (n) h = '<span class="chip mute">טרם נשלחה</span>';
    } else {
      if (m.sentAt) h = '<span class="chip">' + ico('check') + ' נשלחה ' + esc(relTime(m.sentAt)) + '</span>';
      else if (n) h = '<span class="chip warn">טיוטה – טרם נשלחה</span>';
      else h = '<span class="chip mute">ריקה</span>';
    }
    el.innerHTML = h;
  }
  function renderBanners() {
    var el = $('#banners'); if (!el) return;
    var h = '';
    if (!S.online) h += '<div class="banner info">' + ico('info') + '<div>אין חיבור לאינטרנט. ' + (C.role === 'mom' ? 'אפשר להמשיך לרשום, והכול יישלח לבד כשהחיבור יחזור.' : 'מוצג המידע האחרון ששמור.') + '</div></div>';
    if (S.perm === false) h += '<div class="banner">' + ico('bell') + '<div class="grow">ההתראות כבויות, ' + (C.role === 'mom' ? 'לכן לא אוכל להזכיר לך.' : 'לכן לא תקבל התראה כשאמא שולחת.') + '</div><button class="btn sm primary" data-act="perm">הפעלה</button></div>';
    if (C.role === 'liad' && S.family && !reminder().enabled) h += '<div class="banner">' + ico('clock') + '<div class="grow">עוד לא הגדרת תזכורת שבועית לאמא.</div><button class="btn sm" data-act="goremind">להגדרה</button></div>';
    el.innerHTML = h;
  }
  function renderQuick() {
    var el = $('#quick'); if (!el) return;
    var q = (S.family && S.family.quick) || [];
    if (!q.length) { el.innerHTML = ''; return; }
    var have = {}; S.mom.items.forEach(function (i) { have[i.t.toLowerCase()] = 1; });
    var left = q.filter(function (t) { return !have[t.toLowerCase()]; });   // מוצר שנוסף לרשימה "עובר" מהכפתורים לרשימה
    if (!left.length) { el.innerHTML = ''; return; }
    el.className = 'quick';
    el.innerHTML = '<h3>מוצרים קבועים – לחיצה מוסיפה לרשימה</h3><div class="chips">' + left.map(function (t) {
      return '<button type="button" class="qchip" data-act="quick" data-t="' + esc(t) + '">' + ico('plus') + esc(t) + '</button>';
    }).join('') + '</div>';
  }
  function itemRow(key, it) {
    var chk = C.role === 'liad';
    return '<li class="item' + (it.d ? ' done' : '') + '" data-id="' + it.id + '" data-key="' + key + '">' +
      (chk ? '<button class="chk' + (it.d ? ' on' : '') + '" data-act="tick" aria-label="סימון ' + esc(it.t) + '" aria-pressed="' + (it.d ? 'true' : 'false') + '">' + ico('check') + '</button>' : '') +
      '<button class="name" data-act="edit" aria-label="עריכת ' + esc(it.t) + '"><span class="t">' + esc(it.t) + '</span>' + (it.q !== 1 ? '<span class="qty">×' + fmtQ(it.q) + '</span>' : '') + '</button>' +
      '<button class="icon-btn danger" data-act="del" aria-label="מחיקת ' + esc(it.t) + '">' + ico('trash') + '</button></li>';
  }
  function renderItems(key, sel) {
    var el = $(sel); if (!el) return;
    var items = listOf(key).items, mom = C.role === 'mom';
    if (!items.length) {
      el.innerHTML = '<div class="empty"><div class="big">' + ico('cart') + '</div><b>' +
        (key === 'liad' ? 'הרשימה שלך ריקה' : mom ? 'הרשימה ריקה' : 'אמא עוד לא הוסיפה מוצרים') + '</b>' +
        (mom ? 'כתבי כאן מה חסר בבית' + (S.speech ? ', או לחצי על "דיבור" ואמרי.' : '.') : '') + '</div>';
      return;
    }
    el.innerHTML = '<div class="count">' + items.length + (items.length === 1 ? ' מוצר' : ' מוצרים') + '</div><ul class="list">' + items.map(function (i) { return itemRow(key, i); }).join('') + '</ul>';
  }
  function renderSendBar() {
    var el = $('#sendbar'); if (!el) return;
    var h = '', m = S.mom.meta, n = S.mom.items.length;
    if (S.phase !== 'main' || S.tab === 'settings') { el.innerHTML = ''; return; }
    if (S.tab === 'list' && C.role === 'mom') {
      var changed = m.sentAt && (m.mAt > m.sentAt);
      if (!n) h = '';
      else if (!m.sentAt) h = '<button class="btn primary block sendbtn" data-act="send">' + ico('send') + ' סיימתי – שליחה ליעד</button>';
      else if (changed) h = '<button class="btn primary block sendbtn" data-act="send">' + ico('send') + ' עדכנתי – שליחת עדכון</button>';
      else h = '<div class="sent-card">' + ico('check', 'lg') + '<div>הרשימה נשלחה ליעד<small>' + esc(relTime(m.sentAt)) + (S.mom.pending ? ' · ממתין לחיבור…' : '') + '</small></div></div>';
    } else if (S.tab === 'list' && C.role === 'liad') {
      if (n) h = '<div class="two"><button class="btn block" data-act="copy" data-key="mom">' + ico('copy') + ' העתקה</button><button class="btn primary block" data-act="ordered">' + ico('check') + ' הוזמן</button></div>';
    } else if (S.tab === 'mine') {
      if (S.liad.items.length) h = '<div class="two"><button class="btn block" data-act="copy" data-key="liad">' + ico('copy') + ' העתקה</button><button class="btn block" data-act="cleardone">' + ico('trash') + ' ניקוי מסומנים</button></div>';
    }
    el.innerHTML = h;
  }

  /* ----- טאב רשימה ליעד ----- */
  function drawMineTab() {
    $('#screen').innerHTML = '<div class="top"><h1>רשימה ליעד</h1></div><div id="banners"></div>' + addCard('liad') + '<div id="listWrap"></div>';
    bindAdd(); updateMineParts();
  }
  function updateMineParts() { renderItems('liad', '#listWrap'); }

  /* ----- חלונות עריכה ----- */
  function openEdit(key, id) {
    var it = findItem(key, id); if (!it) return;
    var q = it.q;
    openSheet('<h3>עריכת מוצר</h3><input class="field" id="eName" maxlength="60" value="' + esc(it.t) + '" aria-label="שם המוצר">' +
      '<div class="stepper"><button class="btn" id="qMinus" aria-label="פחות">' + ico('minus', 'lg') + '</button><b id="qVal" aria-live="polite">' + fmtQ(q) + '</b><button class="btn" id="qPlus" aria-label="יותר">' + ico('plus', 'lg') + '</button></div>' +
      '<div class="two"><button class="btn primary" id="eSave">שמירה</button><button class="btn" id="eCancel">ביטול</button></div><div class="spacer"></div>' +
      '<button class="btn danger block" id="eDel">' + ico('trash') + ' מחיקת המוצר</button>', function (sh) {
      function upd() { $('#qVal', sh).textContent = fmtQ(q); }
      $('#qMinus', sh).onclick = function () { q = Math.max(0.5, q - 0.5); upd(); };
      $('#qPlus', sh).onclick = function () { q = Math.min(99, q + 0.5); upd(); };
      $('#eCancel', sh).onclick = closeSheet;
      $('#eDel', sh).onclick = function () { closeSheet(); removeWithUndo(key, id); };
      $('#eSave', sh).onclick = function () {
        var t = cleanText($('#eName', sh).value);
        if (!t) { toast('אי אפשר להשאיר שם ריק.'); return; }
        var f = { q: q }; if (t !== it.t) f.t = t;
        patchItem(key, id, f); closeSheet();
      };
      $('#eName', sh).onkeydown = function (e) { if (e.key === 'Enter') $('#eSave', sh).click(); };
    });
  }
  function dictate(key) {
    NA.startSpeech('he-IL').then(function (text) {
      var parts = String(text || '').split(/[,،\n]+/).map(cleanText).filter(Boolean);
      var added = [], dup = 0;
      parts.forEach(function (p) {
        var r = addItem(key, p);
        if (r === 'empty' || r === 'full') return;
        if (r.indexOf('dup:') === 0) { dup++; return; }
        added.push({ id: r, t: p });
      });
      if (added.length) {
        toast('נוסף: ' + added.map(function (a) { return a.t; }).join(', '), { label: 'ביטול', fn: function () { added.forEach(function (a) { deleteItem(key, a.id); }); } });
      } else if (dup) toast('כבר ברשימה');
      else toast('לא שמעתי. אפשר לנסות שוב או להקליד.');
    }, function (e) {
      if (e && (e.cancelled || e === 'cancelled' || e.message === 'cancelled')) return;
      toast('הזנה בקול לא עבדה. אפשר להקליד.');
    });
  }

  /* ----- הגדרות ----- */
  function card(title, icon, body) { return '<section class="card"><h2>' + ico(icon) + esc(title) + '</h2>' + body + '</section>'; }
  function seg(act, cur, opts) {
    return '<div class="seg" role="group">' + opts.map(function (o) { return '<button data-act="' + act + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0] ? 'true' : 'false') + '">' + o[1] + '</button>'; }).join('') + '</div>';
  }
  function drawSettings() {
    var scr = $('#screen'), st = scr.scrollTop, mom = C.role === 'mom';
    var fk = P.font || (mom ? 'l' : 'm');
    var h = '<div class="top"><h1>הגדרות</h1></div>';

    if (!mom) {
      var r = reminder();
      h += '<section class="card" id="remCard"><h2>' + ico('clock') + 'תזכורת שבועית לאמא</h2>' +
        '<div class="row"><div class="grow"><b>שליחת תזכורת להזין רשימה</b><div class="muted small">אמא תקבל התראה בימים ובשעה שתבחר</div></div><label class="switch"><input type="checkbox" id="remOn" aria-label="תזכורת שבועית"' + (r.enabled ? ' checked' : '') + '><i></i></label></div>' +
        '<div class="spacer"></div><div class="muted small" style="margin-bottom:6px">ימים</div><div class="days" id="remDays">' + DAYS.map(function (d, i) { return '<button data-act="rday" data-v="' + i + '" aria-pressed="' + (r.days.indexOf(i) >= 0 ? 'true' : 'false') + '" aria-label="יום ' + DAYNAMES[i] + '">' + d + '</button>'; }).join('') + '</div>' +
        '<div class="spacer"></div><div class="muted small" style="margin-bottom:6px">שעה</div><input class="field" type="time" id="remTime" value="' + esc(r.time) + '" aria-label="שעת התזכורת">' +
        '<div class="spacer"></div><div class="muted small" style="margin-bottom:6px">נוסח ההתראה</div><textarea class="field" id="remMsg" maxlength="120">' + esc(r.msg) + '</textarea>' +
        '<div class="muted small" style="margin-top:8px">אם אמא כבר שלחה רשימה ב-20 השעות האחרונות, לא תישלח תזכורת.</div></section>';
    }

    h += card('מראה', 'sun',
      '<div class="muted small" style="margin-bottom:6px">ערכת נושא</div>' + seg('theme', P.theme, [['auto', 'אוטומטי'], ['light', 'בהיר'], ['dark', 'כהה']]) +
      '<div class="spacer"></div><div class="muted small" style="margin-bottom:6px">גודל כתב</div>' + seg('font', fk, [['m', 'רגיל'], ['l', 'גדול'], ['xl', 'ענק']]) +
      '<div class="spacer"></div><div class="muted small" style="margin-bottom:8px">צבע</div><div class="swatches">' + Object.keys(ACCENTS).map(function (k) {
        return '<button class="sw" data-act="accent" data-v="' + k + '" style="background:' + ACCENTS[k][0] + '" aria-label="' + ACCENT_NAMES[k] + '" aria-pressed="' + (P.accent === k ? 'true' : 'false') + '">' + ico('check') + '</button>';
      }).join('') + '</div>');

    var q = (S.family && S.family.quick) || [];
    h += card('מוצרים קבועים', 'star',
      '<div class="muted small" style="margin-bottom:10px">כפתורים לבחירה מהירה במסך הרשימה</div><div class="chips">' +
      q.map(function (t, i) { return '<span class="qchip edit">' + esc(t) + '<button class="x" data-act="qdel" data-i="' + i + '" aria-label="הסרת ' + esc(t) + '">' + ico('x') + '</button></span>'; }).join('') +
      '</div><div class="spacer"></div><form id="qForm" class="row"><input class="field grow" id="qNew" maxlength="30" placeholder="מוצר חדש" aria-label="מוצר קבוע חדש"><button class="btn primary" type="submit" aria-label="הוספה">' + ico('plus') + '</button></form>');

    var permTxt = S.perm === true ? '<span class="chip">' + ico('check') + ' פעילות</span>' : S.perm === false ? '<span class="chip warn">כבויות</span>' : '<span class="chip mute">לא ידוע</span>';
    h += card('התראות', 'bell',
      '<div class="row"><div class="grow">התראות במכשיר</div>' + permTxt + '</div><div class="spacer"></div>' +
      (S.perm === false ? '<button class="btn primary block" data-act="perm">אישור התראות</button><div class="spacer"></div>' : '') +
      (NA ? '<button class="btn block" data-act="notifSettings">הגדרות התראות במכשיר</button>' : ''));

    var b = S.backup;
    h += card('גיבוי במכשיר', 'save',
      (NA ?
        '<div class="muted small" style="margin-bottom:8px">גיבוי אוטומטי כל לילה ב-23:50 לתיקייה Documents/Agala (נשמרים 14 הימים האחרונים). הגיבוי נשמר רק במכשיר, לא ברשת.</div>' +
        '<div class="kv"><span>גיבוי אחרון</span><span>' + (b && b.lastAt ? esc(relTime(b.lastAt)) : 'עדיין לא בוצע') + '</span></div>' +
        '<div class="kv"><span>הרצה אוטומטית בלילה</span><span>' + (b ? (b.ignoringBattery ? 'מאושר ✓' : 'נדרש אישור') : '…') + '</span></div><div class="spacer"></div>' +
        '<div class="two"><button class="btn" data-act="backupnow">' + ico('save') + ' גבה עכשיו</button><button class="btn" data-act="restore">שחזור מקובץ</button></div>' +
        (b && !b.ignoringBattery ? '<div class="spacer"></div><button class="btn primary block" data-act="battery">אישור הרצה ברקע</button><div class="muted small" style="margin-top:6px">כדי שהגיבוי ירוץ בדיוק בלילה גם כשהאפליקציה סגורה, צריך לאשר "ללא הגבלות סוללה".</div>' : '') +
        (b && b.exactAllowed === false ? '<div class="spacer"></div><button class="btn block" data-act="exact">אישור התראות מדויקות</button>' : '')
        : '<div class="muted">הגיבוי זמין רק באפליקציה המותקנת במכשיר.</div>'));

    if (!mom) {
      h += card('חיבור לאמא', 'link',
        '<div class="muted small">קוד החיבור (להקלדה בטלפון של אמא):</div><div class="code" id="codeShow">' + esc(fmtCode(C.code)) + '</div>' +
        '<div class="two"><button class="btn" data-act="copycode">' + ico('copy') + ' העתקה</button><a class="btn" style="text-decoration:none;color:inherit" href="' + waLink() + '">' + ico('wa') + ' וואטסאפ</a></div>');
    }
    h += card('אפליקציה', 'info',
      '<div class="kv"><span>גרסה</span><span>' + SH.bundleVersion + '.' + SH.apkVersion + (SH.source === 'ota' ? ' (עדכון)' : '') + '</span></div>' +
      '<div class="kv"><span>מחובר/ת כ</span><span>' + (mom ? 'אמא' : 'ליעד') + (C.code ? ' · ' + '••••' + esc(C.code.slice(4)) : '') + '</span></div><div class="spacer"></div>' +
      (SH.hasUpdates ? '<button class="btn block" data-act="update">בדיקת עדכון</button><div class="muted small" id="updMsg" style="margin-top:8px">' + esc(S.updateMsg) + '</div><div class="spacer"></div>' : '') +
      '<button class="btn danger block" data-act="disconnect">ניתוק והתחלה מחדש</button>');

    scr.innerHTML = h;
    scr.scrollTop = st;
    var rOn = $('#remOn'); if (rOn) rOn.onchange = saveReminderFromUi;
    var rt = $('#remTime'); if (rt) rt.onchange = saveReminderFromUi;
    var rm = $('#remMsg'); if (rm) rm.onchange = saveReminderFromUi;
    var qf = $('#qForm'); if (qf) qf.onsubmit = function (e) {
      e.preventDefault();
      var v = cleanText($('#qNew').value); if (!v) return;
      var cur = ((S.family && S.family.quick) || []).slice();
      if (cur.some(function (x) { return x.toLowerCase() === v.toLowerCase(); })) { toast('כבר קיים'); return; }
      if (cur.length >= 40) { toast('אפשר עד 40 מוצרים קבועים.'); return; }
      cur.push(v); saveQuick(cur); $('#qNew').value = '';
    };
  }
  function waLink() {
    var msg = 'שלום אמא! 🛒 להתקנת אפליקציית עגלה: פתחי אותה, לחצי על "אני אמא" והקלידי את קוד החיבור: ' + fmtCode(C.code);
    return 'https://wa.me/?text=' + encodeURIComponent(msg);
  }
  function saveReminderFromUi() {
    var days = $$('#remDays button[aria-pressed=true]').map(function (b) { return +b.getAttribute('data-v'); });
    var on = $('#remOn').checked;
    var time = $('#remTime').value || '18:00';
    var msg = String($('#remMsg').value || '').trim().slice(0, 120) || DEFAULT_MSG;
    if (on && !days.length) {
      $('#remOn').checked = false;
      saveReminder({ enabled: false, days: days, time: time, msg: msg });
      toast('בחר לפחות יום אחד לתזכורת.');
      return;
    }
    saveReminder({ enabled: on, days: days, time: time, msg: msg });
    toast(on ? 'התזכורת נשמרה ✓' : 'התזכורת כבויה');
  }

  /* ---------- מסכי פתיחה ---------- */
  function setFull(html) {
    var scr = $('#screen'); scr.className = 'full'; scr.innerHTML = html;
    $('#nav').innerHTML = ''; $('#sendbar').innerHTML = ''; S.phase = 'onboarding';
    scr.scrollTop = 0;
  }
  function hero(sub) { return '<div class="hero"><img src="img/icon.png" alt=""><h1>עגלה</h1><p>' + sub + '</p></div>'; }
  function drawWelcome() {
    setFull(hero('רשימת הקניות של המשפחה') + '<div class="stack" style="margin-top:22px">' +
      '<button class="rolebtn" data-act="ob" data-v="mom">' + ico('cart') + '<div><b>אני אמא</b><span>רושמת קניות ושולחת ליעד</span></div></button>' +
      '<button class="rolebtn" data-act="ob" data-v="liad">' + ico('user') + '<div><b>אני ליעד</b><span>רואה את הרשימה ומזמין</span></div></button>' +
      '<button class="btn ghost block" data-act="ob" data-v="restore">שחזור מקובץ גיבוי</button></div>');
  }
  function drawMomCode(msg) {
    var sub = S.onboarding === 'liad' ? 'נא להקליד את קוד החיבור שנוצר בהתקנה הראשונה' : 'נא להקליד את קוד החיבור שליעד שלח לך';
    setFull('<button class="btn sm ghost back" data-act="ob" data-v="welcome">→ חזרה</button>' + hero(sub) +
      '<form id="codeForm" class="stack" style="margin-top:18px" autocomplete="off"><input class="field codeinput" id="codeIn" inputmode="numeric" pattern="[0-9\\-]*" maxlength="9" placeholder="0000-0000" aria-label="קוד חיבור">' +
      '<div class="muted" id="obMsg" role="alert" style="text-align:center;min-height:1.4em;color:var(--danger)">' + esc(msg || '') + '</div>' +
      '<button class="btn primary block" type="submit" id="codeGo" style="min-height:64px">התחברות</button></form>');
    var inp = $('#codeIn'); inp.focus();
    inp.oninput = function () { var d = inp.value.replace(/\D/g, '').slice(0, 8); inp.value = d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d; };
    $('#codeForm').onsubmit = function (e) {
      e.preventDefault();
      var d = inp.value.replace(/\D/g, '');
      if (d.length !== 8) { $('#obMsg').textContent = 'הקוד צריך להיות בן 8 ספרות.'; return; }
      connectWithCode(S.onboarding || 'mom', d);
    };
  }
  function drawLiadChoice() {
    setFull('<button class="btn sm ghost back" data-act="ob" data-v="welcome">→ חזרה</button>' + hero('חיבור לאמא') + '<div class="stack" style="margin-top:22px">' +
      '<button class="rolebtn" data-act="ob" data-v="liad-new">' + ico('plus') + '<div><b>יצירת חיבור חדש</b><span>אם זו הפעם הראשונה</span></div></button>' +
      '<button class="rolebtn" data-act="ob" data-v="liad-code">' + ico('link') + '<div><b>יש לי כבר קוד</b><span>התקנה מחדש או מכשיר חדש</span></div></button></div>');
  }
  function drawBusy(msg) {
    setFull('<div class="hero" style="padding-top:90px"><span class="spin" style="width:44px;height:44px;color:var(--accent)"></span><p style="margin-top:20px">' + esc(msg) + '</p></div>');
  }
  function drawBootError(kind) {
    setFull(hero(kind === 'config' ? 'האפליקציה עוד לא הוגדרה (חסר חיבור ל-Firebase).' : 'צריך חיבור לאינטרנט להפעלה הראשונה.') +
      '<div class="stack" style="margin-top:22px"><button class="btn primary block" data-act="retry">ניסיון חוזר</button></div>');
  }
  function drawReconnect() {
    unsub();
    setFull(hero('החיבור למשפחה כבר לא תקף.') + '<div class="stack" style="margin-top:22px"><button class="btn primary block" data-act="disconnect-now">התחברות מחדש</button></div>');
  }
  function drawLiadNew() {
    setFull(hero('החיבור נוצר! 🎉') +
      '<div class="card" style="margin-top:16px"><div class="muted small">קוד החיבור:</div><div class="code">' + esc(fmtCode(C.code)) + '</div>' +
      '<div class="muted small" style="margin-bottom:12px">בטלפון של אמא: להתקין את עגלה, ללחוץ "אני אמא" ולהקליד את הקוד.</div>' +
      '<div class="two"><button class="btn" data-act="copycode">' + ico('copy') + ' העתקה</button><a class="btn" style="text-decoration:none;color:inherit" href="' + waLink() + '">' + ico('wa') + ' וואטסאפ</a></div></div>' +
      '<button class="btn primary block" data-act="ob" data-v="liad-done" style="min-height:64px;margin-top:6px">המשך להגדרת תזכורת</button>');
  }

  function connectWithCode(role, code) {
    drawBusy('מתחבר…');
    C.role = role; C.code = code;
    Promise.resolve().then(function () {
      if (!SH.fb || !SH.fb.apiKey || !FBM) { var e = new Error('config'); e.code = 'config'; throw e; }
      initFirebase(); return ensureAuth();
    }).then(function () { return withTimeout(registerMember(), 15000); })
      .then(function () { lsSet('conn', JSON.stringify(C)); applyPrefs(); boot(); })
      .catch(function (e) {
        var k = errKind(e); C.role = null; C.code = null;
        var msg = e && e.code === 'config' ? 'האפליקציה לא הוגדרה כראוי (Firebase).' : k === 'denied' ? 'הקוד לא נכון. כדאי לבדוק מול ליעד.' : 'אין חיבור לאינטרנט. נסי שוב כשיש חיבור.';
        if (role === 'mom') { S.onboarding = 'mom'; drawMomCode(msg); } else { S.onboarding = 'liad'; drawLiadCode(msg); }
      });
  }
  function drawLiadCode(msg) { drawMomCode(msg); S.onboarding = 'liad'; }
  function createFamily(attempt) {
    drawBusy('יוצר חיבור…');
    C.role = 'liad'; C.code = gen8();
    Promise.resolve().then(function () {
      if (!SH.fb || !SH.fb.apiKey || !FBM) { var e = new Error('config'); e.code = 'config'; throw e; }
      initFirebase(); return ensureAuth();
    }).then(function () {
      return withTimeout(FBM.setDoc(famRef(), {
        ownerUid: S.uid, createdAt: FBM.serverTimestamp(), quick: DEFAULT_QUICK,
        reminder: { enabled: false, days: [], time: '18:00', msg: DEFAULT_MSG }
      }), 15000);
    }).then(function () { return withTimeout(registerMember(), 15000); })
      .then(function () { lsSet('conn', JSON.stringify(C)); drawLiadNew(); })
      .catch(function (e) {
        if (errKind(e) === 'denied' && (attempt || 0) < 3) { createFamily((attempt || 0) + 1); return; }
        C.role = null; C.code = null;
        setFull(hero(e && e.code === 'config' ? 'האפליקציה לא הוגדרה כראוי (Firebase).' : 'לא הצלחתי ליצור חיבור. צריך אינטרנט.') + '<div class="stack" style="margin-top:22px"><button class="btn primary block" data-act="ob" data-v="liad">ניסיון חוזר</button></div>');
      });
  }

  /* ---------- הפעלה ---------- */
  function boot() {
    drawBusy('טוען…');
    Promise.resolve().then(function () {
      if (!SH.fb || !SH.fb.apiKey || !FBM) { var e = new Error('config'); e.code = 'config'; throw e; }
      initFirebase(); return ensureAuth();
    }).then(function () {
      registerMember().catch(noop);
      subscribe(); setupNative();
      renderMain();
      if (S.pendingRestore) {
        var d = S.pendingRestore; S.pendingRestore = null;
        applyRestore(d).then(function () { toast('הנתונים שוחזרו מהגיבוי ✓'); }, function () { toast('השחזור נכשל.'); });
      }
      startupUpdateCheck();
    }).catch(function (e) { drawBootError(e && e.code === 'config' ? 'config' : 'net'); });
  }
  function startupUpdateCheck() {
    if (!SH.hasUpdates) return;
    setTimeout(function () {
      SH.checkUpdate().then(function (r) {
        if (r.status === 'installed') toast('התקבל עדכון חדש לאפליקציה', { label: 'הפעלה מחדש', fn: SH.reload, ms: 9000 });
      }, noop);
    }, 5000);
  }

  /* ---------- אירועים ---------- */
  function doUpdateCheck() {
    S.updateMsg = 'בודק…'; var m = $('#updMsg'); if (m) m.textContent = S.updateMsg;
    SH.checkUpdate().then(function (r) {
      if (r.status === 'installed') { S.updateMsg = ''; openSheet('<h3>הגיע עדכון</h3><p>העדכון הותקן. צריך להפעיל מחדש כדי להשתמש בו.</p><button class="btn primary block" id="upGo">הפעלה מחדש</button>', function (sh) { $('#upGo', sh).onclick = SH.reload; }); return; }
      S.updateMsg = r.status === 'uptodate' ? 'האפליקציה מעודכנת ✓' : r.status === 'needs-apk' ? 'יש גרסה חדשה שדורשת התקנת APK חדש.' : r.status === 'bad-signature' ? 'העדכון נדחה (חתימה לא תקינה).' : 'עדכונים כבויים.';
      var mm = $('#updMsg'); if (mm) mm.textContent = S.updateMsg;
    }, function () { S.updateMsg = 'לא הצלחתי לבדוק (אין אינטרנט?).'; var mm = $('#updMsg'); if (mm) mm.textContent = S.updateMsg; });
  }

  function onClick(e) {
    var t = e.target.closest('[data-act]'); if (!t) return;
    var act = t.getAttribute('data-act'), v = t.getAttribute('data-v');
    var li = t.closest('li.item'), key = (li && li.getAttribute('data-key')) || t.getAttribute('data-key'), id = li && li.getAttribute('data-id');
    switch (act) {
      case 'tab': S.tab = v; renderMain(); break;
      case 'quick': addAndReport('mom', t.getAttribute('data-t')); break;
      case 'mic': dictate(key); break;
      case 'edit': openEdit(key, id); break;
      case 'del': removeWithUndo(key, id); break;
      case 'tick': var it = findItem(key, id); if (it) patchItem(key, id, { d: !it.d }); break;
      case 'send':
        confirmSheet({ title: 'לשלוח את הרשימה ליעד?', body: 'יש בה ' + S.mom.items.length + (S.mom.items.length === 1 ? ' מוצר.' : ' מוצרים.'), ok: 'כן, שליחה', cancel: 'חזרה' }).then(function (ok) { if (ok) sendList(); });
        break;
      case 'ordered':
        confirmSheet({ title: 'ההזמנה בוצעה?', body: 'הרשימה של אמא תתנקה, ואמא תקבל הודעה שההזמנה בוצעה.', ok: 'כן, בוצעה', cancel: 'עוד לא' }).then(function (ok) { if (ok) markOrdered(); });
        break;
      case 'copy': copyText(listText(key)).then(function (ok) { toast(ok ? 'הרשימה הועתקה ✓' : 'ההעתקה נכשלה'); }); break;
      case 'cleardone':
        var done = S.liad.items.filter(function (i) { return i.d; });
        if (!done.length) { toast('אין מוצרים מסומנים.'); break; }
        var p = { items: {} }; done.forEach(function (i) { p.items[i.id] = FBM.deleteField(); }); writeList('liad', p);
        toast('נוקו ' + done.length + ' מוצרים'); break;
      case 'perm': if (window.FirebasePlugin) { if (lsGet('permAsked') && NA) NA.openNotificationSettings().catch(noop); else askPerm(); } break;
      case 'notifSettings': if (NA) NA.openNotificationSettings().catch(noop); break;
      case 'goremind': S.tab = 'settings'; renderMain(); setTimeout(function () { var c = $('#remCard'); if (c) c.scrollIntoView({ behavior: 'smooth' }); }, 60); break;
      case 'theme': P.theme = v; savePrefs(); drawSettings(); break;
      case 'font': P.font = v; savePrefs(); drawSettings(); break;
      case 'accent': P.accent = v; savePrefs(); drawSettings(); break;
      case 'rday': t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); saveReminderFromUi(); break;
      case 'qdel': var q = ((S.family && S.family.quick) || []).slice(); q.splice(+t.getAttribute('data-i'), 1); saveQuick(q); break;
      case 'copycode': copyText(fmtCode(C.code)).then(function () { toast('הקוד הועתק ✓'); }); break;
      case 'backupnow':
        if (!NA) break;
        NA.saveSnapshot(JSON.stringify(buildSnapshot())).then(function () { return NA.backupNow(); })
          .then(function (r) { toast('הגיבוי נשמר: ' + (r && r.name ? r.name : '✓')); return loadBackupInfo(); }, function () { toast('הגיבוי נכשל.'); });
        break;
      case 'restore':
        pickBackup(function (d) {
          confirmSheet({ title: 'לשחזר מהגיבוי?', body: 'מוצרים שנמחקו מאז הגיבוי יחזרו לרשימה. מוצרים שנוספו מאז לא יימחקו.', ok: 'שחזור', cancel: 'ביטול' }).then(function (ok) {
            if (ok) applyRestore(d).then(function () { toast('שוחזר ✓'); }, function () { toast('השחזור נכשל.'); });
          });
        }); break;
      case 'battery': if (NA) NA.requestIgnoreBattery().then(function () { setTimeout(loadBackupInfo, 1500); }, noop); break;
      case 'exact': if (NA) NA.openExactAlarmSettings().catch(noop); break;
      case 'update': doUpdateCheck(); break;
      case 'disconnect':
        confirmSheet({ title: 'לנתק ולהתחיל מחדש?', body: 'האפליקציה תתנתק מהחיבור הנוכחי ותחזור למסך הפתיחה. הרשימות עצמן נשמרות בענן.', ok: 'ניתוק', cancel: 'ביטול', danger: true }).then(function (ok) { if (ok) hardReset(); });
        break;
      case 'disconnect-now': hardReset(); break;
      case 'retry': SH.reload(); break;
      case 'ob': onboardStep(v); break;
    }
  }
  function hardReset() { unsub(); lsDel('conn'); lsDel('permAsked'); SH.reload(); }
  function onboardStep(v) {
    S.onboarding = v;
    if (v === 'welcome') drawWelcome();
    else if (v === 'mom') drawMomCode();
    else if (v === 'liad') drawLiadChoice();
    else if (v === 'liad-new') createFamily(0);
    else if (v === 'liad-code') { S.onboarding = 'liad'; drawLiadCode(); }
    else if (v === 'liad-done') { S.tab = 'settings'; lsSet('conn', JSON.stringify(C)); boot(); S.tab = 'settings'; }
    else if (v === 'restore') {
      pickBackup(function (d) {
        if (!d.code || (d.role !== 'mom' && d.role !== 'liad')) { toast('בגיבוי הזה אין פרטי חיבור.'); return; }
        S.pendingRestore = d;
        if (d.prefs) { ['theme', 'accent', 'font'].forEach(function (k) { if (d.prefs[k] !== undefined) P[k] = d.prefs[k]; }); savePrefs(); }
        connectWithCode(d.role, String(d.code));
      });
    }
  }

  function start(shell) {
    SH = shell; NS = shell.ns; FBM = window.FB; NA = window.AgalaNative || null;
    P = lsJson('prefs', P); C = lsJson('conn', { role: null, code: null });
    if (!C.role || !C.code) { C = { role: null, code: null }; }
    applyPrefs();
    document.addEventListener('click', onClick);
    // כשהמקלדת פתוחה (גובה החלון מתכווץ) מסתירים את סרגל הניווט וכפתור השליחה, כדי שלא יכסו את הרשימה
    var baseH = window.innerHeight;
    window.addEventListener('resize', function () {
      if (window.innerHeight > baseH) baseH = window.innerHeight;
      document.body.classList.toggle('kbd', window.innerHeight < baseH * 0.78);
    });
    window.addEventListener('online', function () { S.online = true; refresh(); });
    window.addEventListener('offline', function () { S.online = false; refresh(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && S.phase === 'main') { refreshPerm(); loadBackupInfo(); renderChip(); } });
    document.addEventListener('backbutton', function () {
      if (S.sheet) { closeSheet(); return; }
      if (S.phase === 'main' && S.tab !== 'list') { S.tab = 'list'; renderMain(); return; }
      if (S.phase === 'onboarding' && S.onboarding && S.onboarding !== 'welcome' && !C.role) { drawWelcome(); S.onboarding = 'welcome'; return; }
      if (navigator.app && navigator.app.exitApp) navigator.app.exitApp();
    }, false);
    if (window.matchMedia) { try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (P.theme === 'auto') applyPrefs(); }); } catch (e) {} }
    setInterval(function () { if (S.phase === 'main' && !document.hidden && S.tab !== 'settings') renderChip(); }, 60000);
    if (C.role && C.code) boot(); else drawWelcome();
    shell.ready();
  }

  window.AgalaApp = { start: start };
})();
