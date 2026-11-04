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
    checksq: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    play: '<polygon points="5 3 19 12 5 21 5 3"/>',
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
  /* כמות: יחידות (מספר שלם, קפיצות של 1) או ק"ג (u='k', קפיצות של 0.1; מותר גם 0.25 וכד' מהכתבה) */
  function normU(u, q) { return (u === 'k' || (+q > 0 && !Number.isInteger(+q))) ? 'k' : ''; }
  function normQ(v, u) {
    var q = +v;
    if (normU(u, q) === 'k') { if (!(q >= 0.05)) return 1; return Math.min(99, Math.round(q * 1000) / 1000); }
    if (!(q >= 1)) return 1; return Math.min(99, Math.round(q));
  }
  function trimNum(q) { return String(+(+q).toFixed(3)); }
  function fmtQ(q) { return trimNum(q); }
  /* תווית כמות לתצוגה ברשימה; ריק כשזה יחידה אחת */
  function qtyLabel(it) {
    if (it.u === 'k') return it.q < 1 ? Math.round(it.q * 1000) + ' גרם' : trimNum(it.q) + ' ק״ג';
    return it.q !== 1 ? '×' + fmtQ(it.q) : '';
  }
  function qtyHtml(it) { var l = qtyLabel(it); return l ? '<span class="qty' + (it.u === 'k' ? ' w' : '') + '">' + esc(l) + '</span>' : ''; }
  function qtyFields(q, u) { return u === 'k' ? { q: q, u: 'k' } : { q: q }; }
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
    mom: { items: [], sent: [], meta: {}, pending: false, fromCache: true },
    liad: { items: [], sent: [], meta: {}, pending: false, fromCache: true },
    unsubs: [], perm: null, online: navigator.onLine !== false, speech: false,
    backup: null, serverSeen: false, retriedJoin: false, pendingRestore: null,
    updateMsg: '', updPending: 0, sheet: false, onboarding: null, tour: null, tourBar: null, tourSheet: false
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
  function openSheet(html, mount, noFocus) {
    var sh = $('#sheet');
    sh.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    sh.hidden = false; S.sheet = true;
    sh.onclick = function (e) { if (e.target === sh) closeSheet(); };
    if (mount) mount(sh);
    var f = noFocus ? null : ($('input.field', sh) || $('button.primary', sh));
    if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 60);
  }
  function closeSheet() {
    var sh = $('#sheet'); sh.hidden = true; sh.innerHTML = ''; S.sheet = false;
    if (S.dict && S.dict.live && NA && NA.cancelListening) { try { NA.cancelListening().catch(noop); } catch (e) {} }
    S.dict = null;
  }
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
  function listOf(key) { return key === 'mom' ? S.mom : key === 'sent' ? { items: S.mom.sent || [] } : S.liad; }

  function getToken(ms, fresh) {
    if (S.token && !fresh) return Promise.resolve(S.token);
    var FP = window.FirebasePlugin;
    if (!FP || !FP.getToken) { S.tokErr = 'no-plugin'; return Promise.resolve(null); }
    return withTimeout(new Promise(function (res) {
      FP.getToken(function (t) { S.token = t || null; S.tokErr = t ? '' : 'empty'; res(S.token); }, function (e) { S.tokErr = String((e && e.message) || e || 'error'); res(null); });
    }), ms).catch(function () { S.tokErr = 'timeout'; return null; });
  }
  function registerMember() {
    return getToken(4000).then(function (tok) {
      var d = { role: C.role, platform: 'android', updatedAt: FBM.serverTimestamp() };
      if (tok) d.token = tok;
      return FBM.setDoc(memberRef(), d, { merge: true }).then(function () { if (tok) lsSet('tokSaved', tok + '|' + C.code + '|' + C.role); });
    });
  }
  /* מוודא שהטוקן של המכשיר שמור בשרת (בלעדיו אין התראות). מנסה שוב ושוב עד שמצליח, ובכל חזרה לאפליקציה */
  function syncToken(force) {
    if (!window.FirebasePlugin || !S.uid || !S.db || !C.code || !C.role) return Promise.resolve(false);
    return getToken(10000, force).then(function (tok) {
      if (!tok) return false;
      var mark = tok + '|' + C.code + '|' + C.role;
      if (!force && lsGet('tokSaved') === mark) return true;
      return FBM.setDoc(memberRef(), { role: C.role, platform: 'android', token: tok, updatedAt: FBM.serverTimestamp() }, { merge: true })
        .then(function () { lsSet('tokSaved', mark); return true; });
    }).catch(function () { return false; });
  }
  var tokTries = 0;
  function tokenLoop() {
    syncToken(tokTries === 0).then(function (ok) {
      if (ok || ++tokTries > 30) { tokTries = ok ? 1 : tokTries; return; }
      setTimeout(tokenLoop, Math.min(60000, 5000 * tokTries));
    });
  }

  function parseMap(m) {
    var items = [];
    Object.keys(m || {}).forEach(function (id) {
      var v = m[id];
      if (v && typeof v.t === 'string' && v.t) items.push({ id: id, t: v.t, q: normQ(v.q, v.u), u: normU(v.u, v.q), d: !!v.d, o: !!v.o, g: +v.g || 0, c: +v.c || 0, by: v.by || '', n: typeof v.n === 'string' ? v.n : '' });
    });
    items.sort(function (a, b) { return a.c - b.c || (a.id < b.id ? -1 : 1); });
    return items;
  }
  function parseList(snap) {
    var d = snap.exists() ? snap.data({ serverTimestamps: 'estimate' }) : {};
    return {
      items: parseMap(d.items),
      sent: parseMap(d.sent),
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
    if (it.u !== 'k') delete it.u;
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
    var copy = { t: it.t, q: it.q, d: it.d, c: it.c, by: it.by }; if (it.u === 'k') copy.u = 'k'; if (it.n) copy.n = it.n;
    deleteItem(key, id);
    toast('נמחק: ' + it.t, { label: 'ביטול', ms: 7000, fn: function () { var p = { items: {} }; p.items[id] = copy; writeList(key, p); } });
  }

  function sendList() {
    var n = S.mom.items.length, prev = {}, snap = {};
    (S.mom.sent || []).forEach(function (i) { prev[i.id] = i; });
    var active = !!S.mom.meta.sentAt, seq = (S.mom.meta.sendSeq || 0) + 1;
    S.mom.items.forEach(function (i) {
      var p = prev[i.id], o = { t: i.t, q: i.q, c: i.c }; if (i.u === 'k') o.u = 'k'; if (i.n) o.n = i.n; if (p && p.d) o.d = true;   // סימוני "התקבל" של אמא נשמרים בשליחת עדכון
      if (active) {   // עדכון: מה שחדש/שונה מסומן (g) לליעד; סימוני "הוזמן" (o) נשמרים רק למה שלא השתנה
        var changed = !p || p.t !== i.t || p.q !== i.q || (p.u || '') !== (i.u || '') || (p.n || '') !== (i.n || '');
        if (changed) o.g = seq; else { if (p.g) o.g = p.g; if (p.o) o.o = true; }
      }
      snap[i.id] = o;
    });
    FBM.setDoc(momRef(), { sent: snap, sendSeq: FBM.increment(1), sentAt: FBM.serverTimestamp(), sentCount: n, mAt: FBM.serverTimestamp() },
      { mergeFields: ['sent', 'sendSeq', 'sentAt', 'sentCount', 'mAt'] })
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
  function clearMomList() {
    FBM.setDoc(momRef(), { items: {}, sentAt: FBM.deleteField(), sentCount: 0, mAt: FBM.deleteField() }, { mergeFields: ['items', 'sentAt', 'sentCount', 'mAt'] })
      .then(function () { toast('הרשימה נוקתה'); }, function () { toast('לא הצלחתי לנקות.'); });
  }
  function tickSent(id) {
    var it = findItem('sent', id); if (!it) return;
    var p = { sent: {} }; p.sent[id] = { d: !it.d };
    FBM.setDoc(momRef(), p, { merge: true }).catch(function () { toast('לא הצלחתי לשמור.'); });
  }
  function listText(key) {
    var items = (key === 'sent' ? orderItems().filter(function (i) { return !i.o; }) : listOf(key).items.filter(function (i) { return !i.d; }));
    return (key === 'liad' ? 'רשימת קניות' : key === 'sent' ? 'רשימה להזמנה' : 'רשימת קניות – אמא') + ':\n' +
      items.map(function (i) { return '• ' + i.t + (qtyLabel(i) ? ' ' + qtyLabel(i) : '') + (i.n ? ' (' + i.n + ')' : ''); }).join('\n');
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
    FP.grantPermission(function (ok) { S.perm = !!ok; lsSet('permAsked', '1'); refresh(); syncToken(true); if (S.tab === 'settings') drawSettings(); }, noop);
  }
  function onPush(m) {
    if (!m) return;
    if (m.tap) { S.tab = (C.role === 'mom' && m.type === 'ordered') ? 'check' : (C.role === 'liad' && m.type === 'sent') ? 'order' : 'list'; if (S.phase === 'main') renderMain(); return; }
    S.pushSeen = Date.now();
    var text = (m.title ? m.title + ' – ' : '') + (m.body || '');
    if (text) toast(text, { ms: 6000 });
  }
  function askPermSheet() {
    if (S.perm !== false || lsGet('permAsked') || S.phase !== 'main' || S.sheet || S.tour) return;
    openSheet('<h3>' + ico('bell') + ' התראות</h3><p>' + (C.role === 'mom' ? 'כדי שאוכל להזכיר לך לרשום קניות, צריך לאשר התראות. בחלון שיקפוץ לחצי "אפשר".' : 'כדי לקבל התראה כשאמא שולחת רשימה, צריך לאשר התראות.') + '</p><button class="btn primary block" id="permGo">אישור התראות</button><div class="spacer"></div><button class="btn ghost block" id="permNo">אחר כך</button>', function (sh) {
      $('#permGo', sh).onclick = function () { closeSheet(); askPerm(); };
      $('#permNo', sh).onclick = function () { closeSheet(); lsSet('permAsked', '1'); };
    });
  }
  function setupNative() {
    var FP = window.FirebasePlugin;
    if (FP) {
      try {
        FP.createChannel({ id: 'agala_main', name: 'התראות עגלה', description: 'תזכורות ועדכוני רשימת קניות', importance: 4, sound: true, vibration: true, light: true, visibility: 1 }, noop, noop);
        FP.onMessageReceived(onPush, noop);
        FP.onTokenRefresh(function (t) { S.token = t; syncToken(false); }, noop);
      } catch (e) {}
      refreshPerm(); tokTries = 0; tokenLoop();
      setTimeout(function () { if (!S.tour) askPermSheet(); }, 1800);
    }
    if (NA) {
      var micRefresh = function () {
        if (canDictate() && S.phase === 'main' && (S.tab === 'list' || S.tab === 'mine') && !focusInScreen()) renderMain();
      };
      if (NA.isLiveSpeechAvailable) NA.isLiveSpeechAvailable().then(function (v) { S.live = !!v; micRefresh(); }, function () { S.live = false; });
      NA.isSpeechAvailable().then(function (v) { S.speech = !!v; micRefresh(); }, noop);
      NA.init(23, 50).then(loadBackupInfo, noop);
    }
  }
  function resolveNA() {
    if (window.AgalaNative) return window.AgalaNative;
    try { if (window.cordova && window.cordova.require) return window.cordova.require('cordova-plugin-agala-native.AgalaNative') || null; } catch (e) {}
    return null;
  }
  function nativeDiag() {
    var ids = '?';
    try { ids = Object.keys(window.cordova.require('cordova/plugin_list').metadata || {}).map(function (k) { return k.replace('cordova-plugin-', ''); }).join(','); } catch (e) { ids = 'err'; }
    return 'cordova=' + !!window.cordova + ' firebase=' + !!window.FirebasePlugin + ' agala=' + !!window.AgalaNative + ' plugins=' + ids;
  }
  function canDictate() { return true; }   // הכפתור תמיד מוצג; אם אין זיהוי דיבור במכשיר – מוצגת הודעה ברורה
  var DIAG_HINT = {
    'no-token': 'למכשיר אין טוקן התראות. ודא/י שיש אינטרנט ושההתקנה הושלמה, וסגור/י ופתח/י את האפליקציה.',
    'messaging/registration-token-not-registered': 'הטוקן לא תקף (כנראה אחרי התקנה מחדש). סגור/י ופתח/י את האפליקציה ונסה/י שוב.',
    'messaging/invalid-registration-token': 'הטוקן לא תקף. סגור/י ופתח/י את האפליקציה ונסה/י שוב.',
    'messaging/third-party-auth-error': 'בעיית הרשאות של Firebase Cloud Messaging. יש לבדוק ב-Firebase: Project settings ← Cloud Messaging ← "Firebase Cloud Messaging API (V1)" צריך להיות Enabled.',
    'messaging/mismatched-credential': 'הטוקן שייך לפרויקט Firebase אחר. צריך להתקין APK שנבנה עם google-services.json של הפרויקט הנכון.',
    'messaging/sender-id-mismatch': 'הטוקן שייך לפרויקט Firebase אחר. צריך להתקין APK שנבנה עם google-services.json של הפרויקט הנכון.'
  };
  function openNotifTest() {
    var FP = window.FirebasePlugin; if (!FP) return;
    openSheet('<h3>' + ico('bell') + ' בדיקת התראות</h3><ul class="diag" id="dgList"></ul><div class="muted small" id="dgNote" style="margin:10px 0"></div>' +
      '<button class="btn primary block" id="dgSend" disabled>שליחת התראת בדיקה אליי</button><div class="spacer"></div><button class="btn block" id="dgClose">סגירה</button>', function (sh) {
      var rows = [['perm', 'הרשאת התראות במכשיר'], ['tok', 'מזהה התראות של המכשיר'], ['srv', 'נשמר בשרת'], ['cloud', 'הענן שלח התראה']], st = {}, unsub = null, timer = null;
      function draw() {
        $('#dgList', sh).innerHTML = rows.map(function (r) {
          var v = st[r[0]] || ['…', ''];
          return '<li class="dg"><span class="dgi ' + v[0] + '">' + (v[0] === 'ok' ? '✓' : v[0] === 'bad' ? '✗' : v[0] === 'wait' ? '…' : '–') + '</span><div><b>' + r[1] + '</b><div class="muted small">' + esc(v[1] || '') + '</div></div></li>';
        }).join('');
      }
      function set(k, ok, t) { st[k] = [ok, t]; draw(); }
      function close() { if (unsub) { try { unsub(); } catch (e) {} } clearTimeout(timer); closeSheet(); }
      $('#dgClose', sh).onclick = close;
      st.perm = ['wait', '']; st.tok = ['wait', '']; st.srv = ['wait', '']; st.cloud = ['none', 'לחצו על "שליחת התראת בדיקה"']; draw();
      FP.hasPermission(function (ok) { S.perm = !!ok; set('perm', ok ? 'ok' : 'bad', ok ? 'מאושרת' : 'כבויה – יש לאשר בהגדרות התראות של המכשיר'); }, function () { set('perm', 'bad', 'לא ידוע'); });
      syncToken(true).then(function (ok) {
        if (S.token) set('tok', 'ok', S.token.slice(0, 10) + '…'); else set('tok', 'bad', 'לא התקבל (' + (S.tokErr || '?') + '). בדקו אינטרנט, הפעלה מחדש של האפליקציה, ושקובץ google-services.json נכון.');
        set('srv', ok ? 'ok' : 'bad', ok ? 'הטוקן רשום בענן' : 'לא נשמר – אין חיבור לשרת?');
        $('#dgSend', sh).disabled = !ok;
      });
      $('#dgSend', sh).onclick = function () {
        var btn = this; btn.disabled = true; var seq = Date.now();
        set('cloud', 'wait', 'שולח… (עד 20 שניות)');
        $('#dgNote', sh).textContent = 'ההתראה אמורה להופיע בעוד כמה שניות. אם האפליקציה פתוחה היא תופיע כהודעה למעלה; אפשר גם לצאת למסך הבית ולראות אותה בשורת ההתראות.';
        if (unsub) { try { unsub(); } catch (e) {} }
        unsub = FBM.onSnapshot(memberRef(), function (snap) {
          var d = snap.exists() ? snap.data() : null, r = d && d.testResult;
          if (!r || r.seq !== seq) return;
          clearTimeout(timer);
          if (r.ok) set('cloud', 'ok', 'נשלחה בהצלחה מהענן. אם לא הופיעה במכשיר – בדקו חיסכון בסוללה / "הגדרות התראות במכשיר".');
          else set('cloud', 'bad', (DIAG_HINT[r.code] || 'שגיאה: ' + r.code) + (r.msg ? ' [' + r.msg.slice(0, 80) + ']' : ''));
          btn.disabled = false;
        }, noop);
        FBM.setDoc(memberRef(), { role: C.role, platform: 'android', token: S.token || '', updatedAt: FBM.serverTimestamp(), testSeq: seq }, { merge: true }).catch(function () { set('cloud', 'bad', 'לא הצלחתי לכתוב לשרת'); btn.disabled = false; });
        timer = setTimeout(function () { set('cloud', 'bad', 'הענן לא הגיב. כנראה שהפונקציות לא הותקנו בגרסה האחרונה: להריץ npm run deploy:firebase'); btn.disabled = false; }, 20000);
      };
    }, true);
  }
  function loadBackupInfo() {
    if (!NA) return Promise.resolve();
    return NA.getBackupInfo().then(function (i) { S.backup = i; if (S.tab === 'settings' && !focusInScreen()) drawSettings(); }, noop);
  }
  function buildSnapshot() {
    function obj(items) { var o = {}; items.forEach(function (i) { o[i.id] = { t: i.t, q: i.q, d: i.d, c: i.c, by: i.by }; if (i.u === 'k') o[i.id].u = 'k'; if (i.n) o[i.id].n = i.n; }); return o; }
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
        out[id] = { t: cleanText(v.t), q: normQ(v.q, v.u), d: !!v.d, c: +v.c || Date.now(), by: v.by === 'liad' ? 'liad' : 'mom' };
        if (normU(v.u, v.q) === 'k') out[id].u = 'k';
        if (typeof v.n === 'string' && v.n.trim()) out[id].n = v.n.trim().slice(0, 120);
        n++;
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
    if (C.role === 'mom') t.push({ id: 'check', label: 'רשימה', icon: 'checksq' });      // אמא: סימון מה שהגיע במשלוח
    if (C.role === 'liad') { t.push({ id: 'order', label: 'רשימה להזמנה', icon: 'send' }); t.push({ id: 'mine', label: 'רשימה ליעד', icon: 'user' }); t.push({ id: 'mychk', label: 'הרשימה שלי', icon: 'checksq' }); }
    t.push({ id: 'settings', label: 'הגדרות', icon: 'gear' });
    return t;
  }
  function renderNav() {
    var nav = $('#nav');
    nav.innerHTML = tabsFor().map(function (t) {
      var dot = ((t.id === 'settings' && C.role === 'liad' && !reminder().enabled && S.family) || (t.id === 'order' && S.tab !== 'order' && orderUnseen())) ? '<i class="dot" aria-hidden="true"></i>' : '';
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
    else if (S.tab === 'check' && C.role === 'mom') drawCheckTab();
    else if (S.tab === 'mine' && C.role === 'liad') drawMineTab();
    else if (S.tab === 'mychk' && C.role === 'liad') drawMyChkTab();
    else if (S.tab === 'order' && C.role === 'liad') drawOrderTab();
    else { S.tab = 'settings'; drawSettings(); }
    renderSendBar();
    scr.scrollTop = 0; window.scrollTo(0, 0);
  }
  /* רשימה שנשלחה לפני שהיה צ'ק ליסט: הטלפון של אמא יוצר לה צילום פעם אחת, כדי שתופיע בלשונית "רשימה" */
  function migrateLegacySent() {
    if (C.role !== 'mom' || S.mom.fromCache || lsGet('sentMig')) return;
    lsSet('sentMig', '1');
    if (S.mom.meta.sentAt && !S.mom.sent.length && S.mom.items.length) {
      var snap = {}; S.mom.items.forEach(function (i) { var o = { t: i.t, q: i.q, c: i.c }; if (i.u === 'k') o.u = 'k'; if (i.n) o.n = i.n; if (i.d) o.d = true; snap[i.id] = o; });
      FBM.setDoc(momRef(), { sent: snap }, { mergeFields: ['sent'] }).catch(noop);
    }
  }
  function onData(kind) {
    if (kind === 'mom') migrateLegacySent();
    if (S.phase !== 'main') return;
    if (S.famMissing) { drawReconnect(); return; }
    refresh();
    scheduleSnapshot();
  }
  function refresh() {
    if (S.phase !== 'main') return;
    renderNav();
    if (S.tab === 'list') updateListParts();
    else if (S.tab === 'check') updateCheckParts();
    else if (S.tab === 'mine') updateMineParts();
    else if (S.tab === 'mychk') updateMyChkParts();
    else if (S.tab === 'order') updateOrderParts();
    else if (!focusInScreen() && !S.sheet) drawSettings();
    renderSendBar();
  }

  /* ----- טאב רשימה (אמא) ----- */
  function addCard(key) {
    var mom = C.role === 'mom';
    return '<form class="card add" id="addForm" data-key="' + key + '" autocomplete="off">' +
      '<input type="text" id="addInput" maxlength="60" enterkeyhint="done" aria-label="שם המוצר" placeholder="' + (mom ? 'מה חסר בבית?' : 'הוספת מוצר…') + '">' +
      '<div class="actions">' +
      (canDictate() ? '<button type="button" class="btn mic" data-act="mic" data-key="' + key + '" aria-label="הזנה בקול">' + ico('mic', 'lg') + (mom ? '<span>דיבור</span>' : '') + '</button>' : '') +
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
    var chk = C.role === 'liad' && key === 'mom';
    return '<li class="item' + (it.d ? ' done' : '') + '" data-id="' + it.id + '" data-key="' + key + '">' +
      (chk ? '<button class="chk' + (it.d ? ' on' : '') + '" data-act="tick" aria-label="סימון ' + esc(it.t) + '" aria-pressed="' + (it.d ? 'true' : 'false') + '">' + ico('check') + '</button>' : '') +
      '<button class="name" data-act="edit" aria-label="עריכת ' + esc(it.t) + '"><span class="tx"><span class="t">' + esc(it.t) + '</span>' + (it.n ? '<span class="nt">' + esc(it.n) + '</span>' : '') + '</span>' + qtyHtml(it) + '</button>' +
      '<button class="icon-btn danger" data-act="del" aria-label="מחיקת ' + esc(it.t) + '">' + ico('trash') + '</button></li>';
  }
  /* ----- צ'ק ליסט: ריבוע ריק; נגיעה במוצר מסמנת V ומוסיפה קו על הכיתוב ----- */
  function ckRows(items, act, key) {
    return '<ul class="list">' + items.map(function (i) {
      return '<li class="item ck' + (i.d ? ' done' : '') + '" data-id="' + i.id + '" data-key="' + key + '"><button class="ckrow" data-act="' + act + '" aria-pressed="' + (i.d ? 'true' : 'false') + '" aria-label="' + esc(i.t) + '">' +
        '<span class="box">' + ico('check') + '</span><span class="tx"><span class="t">' + esc(i.t) + '</span>' + (i.n ? '<span class="nt">' + esc(i.n) + '</span>' : '') + '</span>' + qtyHtml(i) + '</button></li>';
    }).join('') + '</ul>';
  }
  function ckChipHtml(items, word) {
    var done = items.filter(function (i) { return i.d; }).length;
    if (!items.length) return '';
    return '<span class="chip' + (done === items.length ? '' : ' mute') + '">' + (done === items.length ? ico('check') + ' ' : '') + done + ' מתוך ' + items.length + ' ' + word + '</span>';
  }
  /* אמא: "רשימה" – מה ששלחה, לסימון אחרי שהמשלוח מגיע */
  function drawCheckTab() {
    $('#screen').innerHTML = '<div class="top"><h1>הרשימה שנשלחה</h1><span id="ckChip"></span></div><div id="ckWrap"></div>';
    updateCheckParts();
  }
  function updateCheckParts() {
    var wrap = $('#ckWrap'); if (!wrap) return;
    var items = S.mom.sent || [], m = S.mom.meta, chip = $('#ckChip');
    if (chip) chip.innerHTML = ckChipHtml(items, 'התקבלו');
    if (!items.length) {
      wrap.innerHTML = '<div class="empty"><div class="big">' + ico('checksq') + '</div><b>עוד לא נשלחה רשימה</b>אחרי "שליחה", הרשימה תופיע כאן, ואפשר לסמן כל מוצר שהגיע במשלוח.</div>';
      return;
    }
    wrap.innerHTML = '<div class="count">נשלחה ' + esc(relTime(m.sentAt)) + ' · נוגעים במוצר שהגיע</div>' + ckRows(items, 'cktick', 'sent') +
      '<div class="spacer"></div><button type="button" class="btn sm danger block" data-act="ckclear">' + ico('trash') + ' ניקוי הרשימה</button>';
  }
  /* ליעד: "הרשימה שלי" – הרשימה האישית כצ'ק ליסט */
  /* ליעד: "רשימה להזמנה" – מה שאמא שלחה (כולל עדכונים), צ'ק ליסט להזמנה; מוצרים שאמא עדכנה בכחול עד שנצפו פעם אחת */
  function orderItems() { return S.mom.meta.sentAt ? (S.mom.sent || []) : []; }
  function orderUnseen() {
    var seen = +lsGet('ordSeen') || 0;
    return orderItems().some(function (i) { return i.g > seen; });
  }
  function drawOrderTab() {
    S.orderBase = +lsGet('ordSeen') || 0;
    $('#screen').innerHTML = '<div class="top"><h1>רשימה להזמנה</h1><span id="orChip"></span></div><div id="orWrap"></div>';
    updateOrderParts();
  }
  function updateOrderParts() {
    var wrap = $('#orWrap'); if (!wrap) return;
    var items = orderItems(), m = S.mom.meta, chip = $('#orChip'), base = S.orderBase || 0;
    var done = items.filter(function (i) { return i.o; }).length;
    if (chip) chip.innerHTML = items.length ? '<span class="chip' + (done === items.length ? '' : ' mute') + '">' + (done === items.length ? ico('check') + ' ' : '') + done + ' מתוך ' + items.length + ' סומנו</span>' : '';
    if (!items.length) {
      wrap.innerHTML = '<div class="empty"><div class="big">' + ico('send') + '</div><b>אין הזמנה פעילה</b>כשאמא תשלח רשימה, היא תופיע כאן.</div>';
      return;
    }
    var upd = items.filter(function (i) { return i.g > base; }).length;
    wrap.innerHTML = '<div class="ordbar"><span class="muted small ordmeta">נשלחה ' + esc(relTime(m.sentAt)) + '</span><button type="button" class="btn sm" data-act="ordfit">התאמת גודל</button></div>' +
      (upd ? '<div class="updnote">' + upd + (upd === 1 ? ' מוצר עודכן' : ' מוצרים עודכנו') + ' – מסומנים בכחול</div>' : '') +
      '<ul class="list dense" style="--oz:' + ordZoom() / 100 + '">' + items.map(function (i) {
        return '<li class="item ck' + (i.o ? ' done' : '') + (i.g > base ? ' upd' : '') + '" data-id="' + i.id + '" data-key="sent"><button class="ckrow" data-act="ordtick" aria-pressed="' + (i.o ? 'true' : 'false') + '" aria-label="' + esc(i.t) + (i.g > base ? ' (עודכן)' : '') + '">' +
          '<span class="box">' + ico('check') + '</span><span class="tx"><span class="t">' + esc(i.t) + '</span>' + (i.n ? '<span class="nt">' + esc(i.n) + '</span>' : '') + '</span>' + qtyHtml(i) + '</button></li>';
      }).join('') + '</ul>';
    lsSet('ordSeen', String(Math.max(+lsGet('ordSeen') || 0, m.sendSeq || 0)));
  }
  function ordZoom() { var z = +lsGet('ordZoom'); return z >= 50 && z <= 170 ? z : 85; }
  function openOrdFit() {
    openSheet('<h3>התאמת גודל הרשימה</h3><div class="muted small" style="margin-bottom:8px">מקטינים כדי שיותר מוצרים ייכנסו במסך, או מגדילים לקריאה נוחה.</div>' +
      '<div class="fitrow"><button class="btn" id="fMinus" aria-label="הקטנה">−</button><input type="range" id="fRange" min="50" max="170" step="5" aria-label="גודל"><button class="btn" id="fPlus" aria-label="הגדלה">+</button></div>' +
      '<div id="fVal" style="text-align:center;font-weight:800;margin:6px 0 12px"></div>' +
      '<div class="t-btns"><button class="btn ghost" id="fReset">ברירת מחדל</button><button class="btn primary" id="fOk">סגירה</button></div>', function (sh) {
      var r = $('#fRange', sh);
      function set(v) {
        v = Math.max(50, Math.min(170, Math.round(v / 5) * 5)); r.value = v; $('#fVal', sh).textContent = v + '%';
        lsSet('ordZoom', String(v));
        var ul = $('#orWrap ul'); if (ul) ul.style.setProperty('--oz', v / 100);
      }
      r.oninput = function () { set(+r.value); };
      $('#fMinus', sh).onclick = function () { set(+r.value - 5); };
      $('#fPlus', sh).onclick = function () { set(+r.value + 5); };
      $('#fReset', sh).onclick = function () { set(85); };
      $('#fOk', sh).onclick = closeSheet;
      set(ordZoom());
    }, true);
  }
  function tickOrder(id) {
    var it = findItem('sent', id); if (!it) return;
    var p = { sent: {} }; p.sent[id] = { o: !it.o };
    FBM.setDoc(momRef(), p, { merge: true }).catch(function () { toast('לא הצלחתי לשמור.'); });
  }
  function drawMyChkTab() {
    $('#screen').innerHTML = '<div class="top"><h1>הרשימה שלי</h1><span id="mkChip"></span></div><div id="mkWrap"></div>';
    updateMyChkParts();
  }
  function updateMyChkParts() {
    var wrap = $('#mkWrap'); if (!wrap) return;
    var items = S.liad.items || [], chip = $('#mkChip');
    if (chip) chip.innerHTML = ckChipHtml(items, 'סומנו');
    if (!items.length) {
      wrap.innerHTML = '<div class="empty"><div class="big">' + ico('checksq') + '</div><b>הרשימה שלך ריקה</b>מוסיפים מוצרים בלשונית "רשימה ליעד".</div>';
      return;
    }
    wrap.innerHTML = ckRows(items, 'mktick', 'liad') + '<div class="spacer"></div><button type="button" class="btn sm danger block" data-act="mkclearall">' + ico('trash') + ' ניקוי כל הרשימה</button>';
  }
  function renderItems(key, sel) {
    var el = $(sel); if (!el) return;
    var items = listOf(key).items, mom = C.role === 'mom';
    if (!items.length) {
      el.innerHTML = '<div class="empty"><div class="big">' + ico('cart') + '</div><b>' +
        (key === 'liad' ? 'הרשימה שלך ריקה' : mom ? 'הרשימה ריקה' : 'אמא עוד לא הוסיפה מוצרים') + '</b>' +
        (mom ? 'כתבי כאן מה חסר בבית' + (canDictate() ? ', או לחצי על "דיבור" ואמרי.' : '.') : '') + '</div>';
      return;
    }
    el.innerHTML = '<div class="count">' + items.length + (items.length === 1 ? ' מוצר' : ' מוצרים') + '</div><ul class="list">' + items.map(function (i) { return itemRow(key, i); }).join('') + '</ul>' +
      (key === 'mom' && C.role === 'liad' ? '<div class="spacer"></div><button type="button" class="btn sm danger block" data-act="momclear">' + ico('trash') + ' ניקוי הרשימה</button>' : '');
  }
  function renderSendBar() {
    var el = $('#sendbar'); if (!el) return;
    if (S.tourBar !== null) { el.innerHTML = S.tourBar; return; }
    var h = '', m = S.mom.meta, n = S.mom.items.length;
    if (S.phase !== 'main' || S.tab === 'settings') { el.innerHTML = ''; return; }
    if (S.tab === 'list' && C.role === 'mom') {
      var changed = m.sentAt && (m.mAt > m.sentAt);
      if (!n) h = '';
      else if (!m.sentAt) h = '<button class="btn primary block sendbtn" data-act="send">' + ico('send') + ' שליחה</button>';
      else if (changed) h = '<button class="btn primary block sendbtn" data-act="send">' + ico('send') + ' שליחת עדכון</button>';
      else h = '<div class="sent-card">' + ico('check', 'lg') + '<div>הרשימה נשלחה ליעד<small>' + esc(relTime(m.sentAt)) + (S.mom.pending ? ' · ממתין לחיבור…' : '') + '</small></div></div>';
    } else if (S.tab === 'list' && C.role === 'liad') {
      if (n) h = '<div class="two"><button class="btn block" data-act="copy" data-key="mom">' + ico('copy') + ' העתקה</button><button class="btn primary block" data-act="ordered">' + ico('check') + ' הוזמן</button></div>';
    } else if (S.tab === 'order') {
      if (orderItems().length) h = '<div class="two"><button class="btn block" data-act="copy" data-key="sent">' + ico('copy') + ' העתקה</button><button class="btn primary block" data-act="ordered">' + ico('check') + ' הוזמן</button></div>';
    } else if (S.tab === 'mychk') {
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
  function bindHold(btn, fn) {
    var t1, t2, held = false;
    function stop() { clearTimeout(t1); clearInterval(t2); }
    btn.addEventListener('pointerdown', function () { held = false; stop(); t1 = setTimeout(function () { held = true; fn(); t2 = setInterval(fn, 120); }, 450); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { btn.addEventListener(ev, stop); });
    btn.addEventListener('click', function (e) { if (held) { held = false; e.preventDefault(); return; } fn(); });
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }
  function openEdit(key, id) {
    var it = findItem(key, id); if (!it) return;
    var q = it.q, u = it.u === 'k' ? 'k' : '';
    openSheet('<h3>עריכת מוצר</h3><input class="field" id="eName" maxlength="60" value="' + esc(it.t) + '" aria-label="שם המוצר">' +
      '<div class="seg unitseg" role="group" aria-label="סוג כמות"><button type="button" id="uK">קילו</button><button type="button" id="uU">יחידות</button></div>' +
      '<div class="stepper"><button class="btn" id="qMinus" aria-label="פחות">' + ico('minus', 'lg') + '</button><b id="qVal" aria-live="polite"></b><button class="btn" id="qPlus" aria-label="יותר">' + ico('plus', 'lg') + '</button></div>' +
      (it.n ? '' : '<button type="button" class="btn block" id="eNoteBtn">✎ כתיבת הערה</button>') +
      '<textarea class="field" id="eNote" maxlength="120" rows="2" placeholder="הערה (לא חובה)" aria-label="הערה"' + (it.n ? '' : ' hidden') + '>' + esc(it.n || '') + '</textarea><div class="spacer"></div>' +
      '<div class="two"><button class="btn primary" id="eSave">שמירה</button><button class="btn" id="eCancel">ביטול</button></div><div class="spacer"></div>' +
      '<button class="btn danger block" id="eDel">' + ico('trash') + ' מחיקת המוצר</button>', function (sh) {
      function upd() {
        $('#qVal', sh).textContent = u === 'k' ? trimNum(q) : String(q);
        $('#uK', sh).setAttribute('aria-pressed', u === 'k' ? 'true' : 'false');
        $('#uU', sh).setAttribute('aria-pressed', u === 'k' ? 'false' : 'true');
      }
      function step(dir) {
        if (u === 'k') q = Math.min(99, Math.max(0.1, Math.round((q + dir * 0.1) * 1000) / 1000));
        else q = Math.min(99, Math.max(1, Math.round(q) + dir));
        upd();
      }
      $('#uK', sh).onclick = function () { if (u !== 'k') { u = 'k'; if (q === 1) q = 0.5; } upd(); };
      $('#uU', sh).onclick = function () { if (u === 'k') { u = ''; q = Math.max(1, Math.round(q)); } upd(); };
      bindHold($('#qMinus', sh), function () { step(-1); });
      bindHold($('#qPlus', sh), function () { step(1); });
      var nb = $('#eNoteBtn', sh);
      if (nb) nb.onclick = function () { nb.hidden = true; var ta = $('#eNote', sh); ta.hidden = false; ta.focus(); };
      upd();
      $('#eCancel', sh).onclick = closeSheet;
      $('#eDel', sh).onclick = function () { closeSheet(); removeWithUndo(key, id); };
      $('#eSave', sh).onclick = function () {
        var t = cleanText($('#eName', sh).value);
        if (!t) { toast('אי אפשר להשאיר שם ריק.'); return; }
        var f = { q: q }; if (u === 'k') f.u = 'k'; else if (it.u === 'k') f.u = FBM.deleteField();
        if (t !== it.t) f.t = t;
        var note = String($('#eNote', sh).value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
        if (note !== (it.n || '')) f.n = note ? note : FBM.deleteField();
        patchItem(key, id, f); closeSheet();
      };
      $('#eName', sh).onkeydown = function (e) { if (e.key === 'Enter') $('#eSave', sh).click(); };
    }, true);
  }
  /* ----- הכתבה בקול: ניתוח "מוצר + כמות" ----- */
  var NUMW = { 'אחד': 1, 'אחת': 1, 'שניים': 2, 'שנים': 2, 'שתיים': 2, 'שתים': 2, 'שני': 2, 'שתי': 2, 'שלושה': 3, 'שלוש': 3, 'ארבעה': 4, 'ארבע': 4, 'חמישה': 5, 'חמש': 5, 'שישה': 6, 'שש': 6, 'שבעה': 7, 'שבע': 7, 'שמונה': 8, 'תשעה': 9, 'תשע': 9, 'עשרה': 10, 'עשר': 10, 'עשרים': 20, 'שלושים': 30, 'ארבעים': 40, 'חמישים': 50, 'שישים': 60, 'שבעים': 70, 'שמונים': 80, 'תשעים': 90, 'מאה': 100, 'מאתיים': 200 };
  var FRACW = { 'חצי': 0.5, 'רבע': 0.25 };
  var KG_RE = /^(קילו|קילוגרם|קילוגרמים|קילוים|קג|ק"ג|ק״ג|kg)$/i;
  var G_RE = /^(גרם|גרמים|גר|g)$/i;
  var NOQ_RE = /^(ליטר|ליטרים|מל|מ"ל|מ״ל|מיליליטר|אחוז|אחוזים|%|סמ|ס"מ|ס״מ|מטר|מטרים)$/;
  var PACK_RE = /^(יחידות|יחידה|חבילות|חבילה|קרטונים|קרטון|בקבוקים|בקבוק|שקיות|שקית|קופסאות|קופסה|פחיות|פחית|ארגזים|ארגז|צנצנות|צנצנת|מארזים|מארז|שישיות|שישייה|גלילים|גליל|חתיכות|חתיכה)$/;
  function numTok(w) {
    if (/^\d+(\.\d+)?$/.test(w)) return { v: +w, k: 'd' };
    if (NUMW.hasOwnProperty(w)) return { v: NUMW[w], k: 'w' };
    if (w === 'מאות') return { k: 'm' };
    if (FRACW.hasOwnProperty(w)) return { v: FRACW[w], k: 'f' };
    if (w.length > 2 && w.charAt(0) === 'ו') {
      var r = w.slice(1);
      if (NUMW.hasOwnProperty(r)) return { v: NUMW[r], k: 'w', and: true };
      if (FRACW.hasOwnProperty(r)) return { v: FRACW[r], k: 'f', and: true };
    }
    return null;
  }
  /* מזהה ביטוי כמות שמתחיל במקום i. מחזיר {q,u,len} או null (אז המילה היא חלק משם המוצר) */
  function parseQty(t, i) {
    var j = i, total = 0, has = false, prev = '';
    for (; j < t.length; j++) {
      var x = numTok(t[j]); if (!x) break;
      if (x.k === 'd') { if (has) break; total = x.v; has = true; }
      else if (x.k === 'm') { if (!has || prev !== 'w') break; total = total * 100; }
      else if (x.k === 'f') { if (prev === 'f' || (has && !x.and)) break; total += x.v; has = true; }
      else { if (prev === 'd' || prev === 'f' || (has && prev === 'w' && x.v >= 10 && !x.and && total % 10 !== 0 && total < 100)) break; total += x.v; has = true; }
      prev = x.k;
    }
    var w = t[j] || '', kg = KG_RE.test(w), gr = G_RE.test(w);
    if (!has) { if (!kg) return null; total = 1; has = true; }
    if (kg || gr) {
      j++;
      if (kg && t[j]) { var y = numTok(t[j]); if (y && y.k === 'f' && y.and) { total += y.v; j++; } }
      var q = kg ? total : total / 1000;
      if (!(q > 0)) return null;
      return { q: Math.min(99, Math.round(q * 1000) / 1000), u: 'k', len: j - i };
    }
    if (NOQ_RE.test(w)) return null;
    if (!Number.isInteger(total) || total < 1 || total > 99) return null;
    if (PACK_RE.test(w)) j++;
    return { q: total, u: '', len: j - i };
  }
  /* "גבינה צהובה 200 גרם חלב 2 לחם" => [{t:'גבינה צהובה',q:0.2,u:'k'},{t:'חלב',q:2},{t:'לחם',q:1}] */
  function parseSpoken(text, withQty) {
    var out = [];
    String(text || '').replace(/(\d),(\d)/g, '$1.$2').replace(/(\d)([א-תa-z])/gi, '$1 $2')
      .replace(/(^|\s)(?:פסיקים?|פסיק)(?=\s|$)/g, ',').split(/[,،;\n]+/).forEach(function (seg) {
        var t = seg.split(/\s+/).filter(function (w) { return w && !/^[-–—־:.]+$/.test(w); });
        if (!withQty) { var nm = cleanText(t.join(' ')); if (nm) out.push({ t: nm, q: 1, u: '' }); return; }
        var buf = [], pend = null;
        function push(q) { var nm = cleanText(buf.join(' ')); buf = []; if (nm) out.push({ t: nm, q: q ? q.q : 1, u: q ? q.u : '' }); }
        for (var i = 0; i < t.length;) {
          var q = parseQty(t, i);
          if (q) {
            if (buf.length) { if (pend) { push(pend); pend = q; } else { push(q); } }
            else pend = q;
            i += q.len;
          } else { buf.push(t[i]); i++; }
        }
        if (buf.length) push(pend);
      });
    return out;
  }

  /* ----- הכתבה בקול: מסך "הכתבה" עם כפתור סיום ----- */
  /* מצב רציף (APK חדש): מאזין עד "סיום". אחרת: חלון הקול של גוגל + "עוד מוצר" + "סיום". */
  function dictate(key) {
    if (!NA) { NA = resolveNA(); if (NA) { try { setupNative(); } catch (e) {} } }
    if (!NA) { openSheet('<h3>הכתבה לא זמינה</h3><p>רכיב ההכתבה לא נטען באפליקציה.</p><p class="muted small" dir="ltr" style="text-align:left;overflow-wrap:anywhere">' + esc(nativeDiag()) + '</p><button class="btn primary block" id="ndOk">סגירה</button>', function (sh) { $('#ndOk', sh).onclick = closeSheet; }, true); return; }
    if (!S.live && !S.speech) {   // המכשיר לא דיווח על זיהוי דיבור: מנסים בכל זאת, ואם נכשל – הסבר
      S.noSpeechTry = true;
    }
    var live = !!S.live;
    S.dict = { key: key, parts: [], rows: [], busy: false, live: live, partial: '', stopping: false, state: live ? 'starting' : 'idle' };
    var fem = C.role === 'mom';
    openSheet('<h3>' + ico('mic') + ' הכתבה</h3>' +
      '<p class="small" style="margin-bottom:10px">' + (fem ? 'אמרי' : 'אמור') + ' שם מוצר וכמות, ואז <b>"פסיק"</b>, ואז המוצר הבא. למשל: <b>חלב 2 פסיק גבינה צהובה 200 גרם פסיק לחם 3</b>. ' + (live ? 'כשמסיימים – ' + (fem ? 'לחצי' : 'לחץ') + ' על <b>סיום</b>.' : '') + '</p>' +
      '<div class="row" style="margin-bottom:8px"><div class="grow"><b>לרשום גם כמויות</b></div><label class="switch"><input type="checkbox" id="dQty" aria-label="לרשום גם כמויות"' + (P.vq === 0 ? '' : ' checked') + '><i></i></label></div>' +
      '<div id="dLive" class="dlive" aria-live="polite"><span class="pulse"></span><span id="dLiveTx"></span></div>' +
      '<ul class="drows" id="dRows"></ul>' +
      '<button class="btn block" id="dMore">' + ico('mic', 'lg') + ' <span id="dMoreTx">דברי</span></button><div class="spacer"></div>' +
      '<button class="btn primary block big" id="dDone">סיום</button><div class="spacer"></div>' +
      '<button class="btn ghost block" id="dCancel">ביטול</button>' +
      '<div id="dSure" hidden><p style="margin:0 0 10px"><b>לבטל את ההכתבה?</b> המוצרים שהוכתבו לא יתווספו לרשימה.</p><div class="two"><button class="btn danger" id="dSureYes">ביטול ההכתבה</button><button class="btn" id="dSureNo">חזרה</button></div></div>', function (sh) {
      sh.onclick = null;   // לא נסגר בלחיצה בחוץ, כדי לא לאבד מה שהוכתב
      $('#dQty', sh).onchange = function () { P.vq = this.checked ? 1 : 0; savePrefs(); reparse(); };
      $('#dMore', sh).onclick = listen;
      $('#dDone', sh).onclick = function () { finish(false); };
      $('#dCancel', sh).onclick = dictCancel;
      $('#dSureYes', sh).onclick = closeSheet;
      $('#dSureNo', sh).onclick = function () { $('#dSure', sh).hidden = true; $('#dCancel', sh).hidden = false; };
      drawRows();
      if (live) liveStart(); else listen();
    }, true);
  }
  function dictRows() {
    var d = S.dict, wq = P.vq !== 0; d.rows = [];
    d.parts.forEach(function (p) { parseSpoken(p, wq).forEach(function (r) { d.rows.push(r); }); });
  }
  function reparse() { if (!S.dict) return; dictRows(); drawRows(); }
  function drawRows() {
    var d = S.dict, ul = $('#dRows'); if (!d || !ul) return;
    ul.innerHTML = d.rows.map(function (r, i) {
      return '<li class="drow"><span class="t">' + esc(r.t) + '</span>' + qtyHtml(r) + '<button type="button" class="x" data-i="' + i + '" aria-label="הסרת ' + esc(r.t) + '">' + ico('x') + '</button></li>';
    }).join('');
    $$('.x', ul).forEach(function (b) { b.onclick = function () { d.rows.splice(+b.getAttribute('data-i'), 1); drawRows(); }; });
    var fem = C.role === 'mom';
    $('#dMore').hidden = d.live;
    $('#dLive').hidden = !d.live;
    if (d.live) {
      var tx = d.stopping ? 'מסיימת…' : d.state === 'starting' ? 'מתחילה להקשיב…' : d.state === 'listening' ? (fem ? 'מקשיבה… אפשר לדבר' : 'מקשיב… אפשר לדבר') : 'ההקלטה נעצרה';
      $('#dLiveTx').textContent = d.partial ? '“' + d.partial + '”' : tx;
      $('#dLive').classList.toggle('on', d.state === 'listening' && !d.stopping);
      $('#dDone').disabled = d.stopping;
      $('#dDone').textContent = d.rows.length ? 'סיום – הוספה לרשימה (' + d.rows.length + ')' : 'סיום';
    } else {
      $('#dDone').disabled = !d.rows.length;
      $('#dDone').textContent = d.rows.length ? 'סיום – הוספה לרשימה (' + d.rows.length + ')' : 'סיום';
      $('#dMoreTx').textContent = d.rows.length ? 'עוד מוצר' : 'דברי';
    }
  }
  function addParts(text) {
    var d = S.dict, add = parseSpoken(text, P.vq !== 0);
    d.parts.push(String(text || ''));
    add.forEach(function (r) { d.rows.push(r); });
    return add.length;
  }
  function liveStart() {
    var d = S.dict;
    NA.startListening('he-IL', function (ev) {
      if (S.dict !== d || !ev) return;
      if (ev.t === 'ready') { d.state = 'listening'; drawRows(); }
      else if (ev.t === 'partial') { d.partial = ev.text || ''; drawRows(); }
      else if (ev.t === 'final') { d.partial = ''; addParts(ev.text); drawRows(); }
      else if (ev.t === 'end') {
        d.state = 'ended'; d.partial = '';
        if (d.stopping) finish(true); else { d.live = false; drawRows(); toast('ההקלטה נעצרה. אפשר להמשיך או ללחוץ סיום.'); }
      } else if (ev.t === 'error') {
        d.partial = '';
        if (!d.rows.length && !d.parts.length) {   // אין הרשאה / אין שירות: עוברים לחלון הקול הרגיל
          d.live = false; d.state = 'idle'; drawRows(); listen();
        } else { d.live = false; d.state = 'ended'; drawRows(); toast('ההקלטה נעצרה. אפשר להמשיך או ללחוץ סיום.'); }
      }
    });
  }
  function listen() {
    var d = S.dict; if (!d || d.busy) return;
    d.busy = true;
    NA.startSpeech('he-IL').then(function (text) {
      if (S.dict !== d) return;
      d.busy = false;
      var n = addParts(text);
      drawRows();
      if (!n) toast('לא שמעתי. אפשר ללחוץ שוב ולדבר.');
    }, function (e) {
      if (S.dict !== d) return;
      d.busy = false;
      var cancelled = e && (e.cancelled || e === 'cancelled' || e.message === 'cancelled');
      if (!cancelled) toast(S.noSpeechTry && !S.speech && !S.live ? 'אין במכשיר זיהוי דיבור. ודא/י שאפליקציית Google מותקנת ומעודכנת, ושהותקן ה-APK החדש.' : 'הזנה בקול לא עבדה. אפשר להקליד.');
      if (!d.rows.length && !cancelled) closeSheet();
    });
  }
  function finish(ended) {
    var d = S.dict; if (!d) return;
    if (d.live && !ended) {   // מצב רציף: מבקשים מהמערכת לסיים, ומחכים לתוצאה האחרונה
      if (d.stopping) return;
      d.stopping = true; drawRows();
      try { NA.stopListening().catch(noop); } catch (e) {}
      setTimeout(function () { if (S.dict === d) finish(true); }, 2600);
      return;
    }
    if (!d.rows.length) { closeSheet(); if (d.live || ended) toast('לא שמעתי מוצרים.'); return; }
    var key = d.key, added = [], dup = 0, full = false;
    d.rows.forEach(function (r) {
      var r2 = addItem(key, r.t, null, { q: normQ(r.q, r.u), u: r.u });
      if (r2 === 'empty') return;
      if (r2 === 'full') { full = true; return; }
      if (r2.indexOf('dup:') === 0) { dup++; return; }
      added.push({ id: r2, t: r.t });
    });
    closeSheet();
    if (added.length) {
      toast('נוסף: ' + added.map(function (a) { return a.t; }).join(', ') + (dup ? ' (' + dup + ' כבר היו ברשימה)' : ''), { ms: 7000, label: 'ביטול', fn: function () { added.forEach(function (a) { deleteItem(key, a.id); }); } });
    } else if (full) toast('הרשימה מלאה (' + MAX_ITEMS + ' מוצרים).');
    else if (dup) toast('כבר ברשימה');
  }
  function dictCancel() {
    var d = S.dict; if (!d || !d.rows.length) { closeSheet(); return; }
    var sure = $('#dSure'); if (!sure) { closeSheet(); return; }
    if (!sure.hidden) { $('#dSureNo').click(); return; }   // לחיצה נוספת על "חזרה" של המכשיר = חזרה להכתבה
    sure.hidden = false; $('#dCancel').hidden = true;
  }

  /* ----- הגדרות ----- */
  function card(title, icon, body, id) { return '<section class="card"' + (id ? ' id="' + id + '"' : '') + '><h2>' + ico(icon) + esc(title) + '</h2>' + body + '</section>'; }
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

    if (!mom) {
      var rs = resetCfg();
      h += '<section class="card" id="resetCard"><h2>' + ico('trash') + 'איפוס שבועי של רשימת אמא</h2>' +
        '<div class="row"><div class="grow"><b>ניקוי אוטומטי</b><div class="muted small">הרשימה שאמא מכינה מתנקה, והרשימה שנשלחה אליך נשארת עד "הוזמן"</div></div><label class="switch"><input type="checkbox" id="rsOn" aria-label="איפוס שבועי"' + (rs.enabled ? ' checked' : '') + '><i></i></label></div>' +
        '<div class="spacer"></div><div class="muted small" style="margin-bottom:6px">יום</div><select class="field" id="rsDay" aria-label="יום האיפוס">' + DAYNAMES.map(function (d, i) { return '<option value="' + i + '"' + (rs.day === i ? ' selected' : '') + '>יום ' + d + '</option>'; }).join('') + '</select>' +
        '<div class="spacer"></div><div class="muted small" style="margin-bottom:6px">שעה</div><input class="field" type="time" id="rsTime" value="' + esc(rs.time) + '" aria-label="שעת האיפוס"></section>';
    }
    h += card('מדריך שימוש', 'help',
      '<div class="muted small" style="margin-bottom:10px">סיור קצר בכל הכפתורים, שלב אחר שלב</div><button class="btn primary block" data-act="tour">' + ico('play') + ' הפעלת המדריך</button>', 'tourCard');

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
      (NA ? '<button class="btn block" data-act="notifSettings">הגדרות התראות במכשיר</button><div class="spacer"></div>' : '') +
      (window.FirebasePlugin ? '<button class="btn block" data-act="notiftest">' + ico('bell') + ' בדיקת התראות</button>' : ''));

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
        '<div class="two"><button class="btn" data-act="copycode">' + ico('copy') + ' העתקה</button><a class="btn" style="text-decoration:none;color:inherit" href="' + waLink() + '">' + ico('wa') + ' וואטסאפ</a></div>', 'codeCard');
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
    ['#rsOn', '#rsDay', '#rsTime'].forEach(function (q) { var e = $(q); if (e) e.onchange = saveResetFromUi; });
    var qf = $('#qForm'); if (qf) qf.onsubmit = function (e) {
      e.preventDefault();
      var v = cleanText($('#qNew').value); if (!v) return;
      var cur = ((S.family && S.family.quick) || []).slice();
      if (cur.some(function (x) { return x.toLowerCase() === v.toLowerCase(); })) { toast('כבר קיים'); return; }
      if (cur.length >= 40) { toast('אפשר עד 40 מוצרים קבועים.'); return; }
      cur.push(v); saveQuick(cur); $('#qNew').value = '';
    };
  }
  function resetCfg() {
    var r = (S.family && S.family.reset) || {};
    return { enabled: r.enabled !== false, day: typeof r.day === 'number' ? r.day : 4, time: r.time || '05:00' };
  }
  function saveResetFromUi() {
    var r = { enabled: $('#rsOn').checked, day: +$('#rsDay').value, time: $('#rsTime').value || '05:00' };
    FBM.setDoc(famRef(), { reset: r }, { merge: true }).catch(function () { toast('לא הצלחתי לשמור.'); });
    toast(r.enabled ? 'האיפוס השבועי נשמר ✓' : 'האיפוס השבועי כבוי');
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
        reminder: { enabled: false, days: [], time: '18:00', msg: DEFAULT_MSG },
        reset: { enabled: true, day: 4, time: '05:00' }
      }), 15000);
    }).then(function () { return withTimeout(registerMember(), 15000); })
      .then(function () { lsSet('conn', JSON.stringify(C)); drawLiadNew(); })
      .catch(function (e) {
        if (errKind(e) === 'denied' && (attempt || 0) < 3) { createFamily((attempt || 0) + 1); return; }
        C.role = null; C.code = null;
        setFull(hero(e && e.code === 'config' ? 'האפליקציה לא הוגדרה כראוי (Firebase).' : 'לא הצלחתי ליצור חיבור. צריך אינטרנט.') + '<div class="stack" style="margin-top:22px"><button class="btn primary block" data-act="ob" data-v="liad">ניסיון חוזר</button></div>');
      });
  }

  /* ---------- מדריך מודרך ---------- */
  function tourSteps() {
    var item = function () { return $('li.item') || $('#listWrap'); };
    var bar = function () { return $('#sendbar button') || $('#sendbar'); };
    if (C.role === 'mom') return [
      { title: 'ברוכה הבאה 👋', text: 'בדקה נלמד איך רושמים קניות.' },
      { tab: 'list', sel: '#addInput', title: 'כתיבה', text: 'כותבים כאן מה חסר בבית.' },
      { tab: 'list', sel: '#addForm button[type=submit]', title: 'הוספה', text: 'לוחצים "הוספה" והמוצר עולה לרשימה.' },
      { tab: 'list', sel: 'button[data-act=mic]', optional: true, title: 'דיבור', text: 'או לוחצים "דיבור" ואומרים שם וכמות, "פסיק", ועוד מוצר. בסוף לוחצים "סיום".' },
      { tab: 'list', sel: '#quick', optional: true, title: 'מוצרים קבועים', text: 'לחיצה אחת על מוצר קבוע מוסיפה אותו.' },
      { tab: 'list', sel: item, title: 'הרשימה', text: 'נגיעה במוצר פותחת עריכה. הפח האדום מוחק, ואפשר לבטל.' },
      { tab: 'list', demo: 'edit', sel: '.sheet .stepper', title: 'כמות והערה', text: 'בעריכה בוחרים "יחידות" (קפיצות של 1) או "קילו" (קפיצות של 100 גרם), ואפשר ללחוץ "כתיבת הערה".' },
      { tab: 'list', demo: 'send', sel: bar, title: 'שליחה', text: 'בסיום לוחצים "שליחה". הוא מקבל התראה.' },
      { tab: 'check', sel: function () { return $('#ckWrap li.item') || $('#ckWrap'); }, title: 'קבלת המשלוח', text: 'כשהקניות מגיעות, נוגעים במוצר כדי לסמן: V וקו על הכיתוב.' },
      { sel: '.tab[data-v=settings]', title: 'הגדרות', text: 'גודל כתב, צבעים, התראות וגיבוי. גם המדריך הזה נמצא שם.' },
      { title: 'זהו! 🛒', text: 'בהצלחה. אפשר להתחיל לרשום.' }
    ];
    return [
      { title: 'ברוך הבא 👋', text: 'סיור קצר של חצי דקה.' },
      { tab: 'list', sel: '#nav', title: 'חמש לשוניות', text: 'רשימת אמא, רשימה להזמנה, רשימה אישית, הרשימה שלי והגדרות.' },
      { tab: 'list', sel: '.top', title: 'סטטוס', text: 'כאן רואים אם אמא שלחה, ומתי. תקבל גם התראה.' },
      { tab: 'list', sel: '#addForm', title: 'הוספה', text: 'אפשר להוסיף מוצרים גם אתה.' },
      { tab: 'list', sel: function () { return $('li.item .chk') || $('#listWrap'); }, title: 'הרשימה של אמא', text: 'מסמנים ✓ תוך כדי הזמנה. נגיעה בשם: עריכה, כמות והערה.' },
      { tab: 'list', demo: 'liadbar', sel: '#sendbar', title: 'העתקה והזמנה', text: '"העתקה" להדבקה באתר הסופר. "הוזמן" מנקה ושולח לאמא הודעה. "ניקוי הרשימה" למטה מנקה בלי הודעה.' },
      { tab: 'order', sel: function () { return $('#orWrap li.item') || $('#orWrap'); }, title: 'רשימה להזמנה', text: 'מה שאמא שלחה, בצ\'ק ליסט להזמנה. מוצרים שאמא עדכנה בכחול, עד שראית אותם פעם אחת.' },
      { tab: 'mine', sel: '#addForm', title: 'רשימה ליעד', text: 'הרשימה האישית שלך. אמא לא רואה אותה.' },
      { tab: 'mychk', sel: function () { return $('#mkWrap li.item') || $('#mkWrap'); }, title: 'הרשימה שלי', text: 'הרשימה האישית כצ\'ק ליסט. נוגעים במוצר: V וקו.' },
      { tab: 'settings', sel: '#remCard', title: 'תזכורת לאמא', text: 'בוחרים ימים ושעה, ואמא מקבלת תזכורת.' },
      { tab: 'settings', sel: '#resetCard', title: 'איפוס שבועי', text: 'הרשימה של אמא מתנקה לבד, כברירת מחדל ביום חמישי.' },
      { tab: 'settings', sel: '#codeCard', title: 'קוד חיבור', text: 'הקוד של אמא. אפשר לשלוח בוואטסאפ.' },
      { tab: 'settings', sel: '#tourCard', title: 'המדריך', text: 'המדריך תמיד זמין כאן.' },
      { title: 'זהו! 🛒', text: 'בהצלחה בהזמנות.' }
    ];
  }
  function tourFlag() { return 'tour.v1.' + C.role; }
  function maybeAutoTour() {
    if (S.phase !== 'main' || S.tour || S.sheet || lsGet(tourFlag())) return;
    startTour();
  }
  function tourCleanup() {
    if (S.tourSheet) { S.tourSheet = false; closeSheet(); }
    if (S.tourBar !== null) { S.tourBar = null; renderSendBar(); }
  }
  function startTour() {
    if (S.tour || S.phase !== 'main') return;
    closeSheet();
    var steps = tourSteps();
    S.tour = { steps: steps, i: 0, token: 0 };
    if (S.tab !== 'list') { S.tab = 'list'; renderMain(); }
    var root = document.createElement('div');
    root.id = 'tour'; root.className = 'on';
    root.innerHTML = '<div class="t-dim"></div><div class="t-spot" hidden></div><div class="t-card" role="dialog" aria-live="polite"></div>';
    document.body.appendChild(root);
    document.body.classList.add('touring');                       // נועל גלילה
    try { $('#app').inert = true; } catch (e) {}                  // נועל לחיצות ומיקוד באפליקציה עצמה
    ['touchmove', 'wheel'].forEach(function (ev) { root.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false }); });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tour]'); if (!b) return;
      var a = b.getAttribute('data-tour');
      if (a === 'next') { if (S.tour.i >= S.tour.steps.length - 1) endTour(false); else { S.tour.i++; showStep(1); } }
      else if (a === 'back') { if (S.tour.i > 0) { S.tour.i--; showStep(-1); } }
      else if (a === 'skip') endTour(true);
    });
    window.addEventListener('resize', onTourResize);
    showStep(1);
  }
  function onTourResize() { if (S.tour) placeSpot(S.tour.curEl); }
  function showStep(dir) {
    var T = S.tour; if (!T) return;
    var st = T.steps[T.i], my = ++T.token;
    tourCleanup();
    if (st.tab && S.tab !== st.tab) { S.tab = st.tab; renderMain(); }
    if (st.demo === 'edit') {
      S.tourSheet = true;
      openSheet('<h3>עריכת מוצר</h3><input class="field" value="חלב" disabled aria-label="שם המוצר"><div class="seg unitseg"><button type="button" aria-pressed="false" tabindex="-1">קילו</button><button type="button" aria-pressed="true" tabindex="-1">יחידות</button></div><div class="stepper"><button class="btn" tabindex="-1">' + ico('minus', 'lg') + '</button><b>2</b><button class="btn" tabindex="-1">' + ico('plus', 'lg') + '</button></div><button type="button" class="btn block" tabindex="-1">✎ כתיבת הערה</button><div class="spacer"></div><div class="two"><button class="btn primary" tabindex="-1">שמירה</button><button class="btn" tabindex="-1">ביטול</button></div>', null, true);
    }
    if (st.demo === 'send' && !$('#sendbar button')) S.tourBar = '<button class="btn primary block sendbtn" tabindex="-1">' + ico('send') + ' שליחה</button>';
    if (st.demo === 'liadbar' && !$('#sendbar button')) S.tourBar = '<div class="two"><button class="btn block" tabindex="-1">' + ico('copy') + ' העתקה</button><button class="btn primary block" tabindex="-1">' + ico('check') + ' הוזמן</button></div>';
    if (S.tourBar !== null) renderSendBar();
    setTimeout(function () {
      if (!S.tour || S.tour.token !== my) return;
      var el = st.sel ? (typeof st.sel === 'function' ? st.sel() : $(st.sel)) : null;
      if (st.sel && !el && st.optional) {
        var n = T.i + dir;
        if (n < 0 || n >= T.steps.length) n = T.i + 1;
        T.i = n; showStep(dir); return;
      }
      T.curEl = el;
      renderCard(st);
      if (el) { try { el.scrollIntoView({ block: 'center' }); } catch (e) {} }
      setTimeout(function () { if (S.tour && S.tour.token === my) placeSpot(el); }, 70);
    }, 90);
  }
  function renderCard(st) {
    var T = S.tour, last = T.i === T.steps.length - 1, card = $('#tour .t-card');
    card.innerHTML = '<div class="t-step">שלב ' + (T.i + 1) + ' מתוך ' + T.steps.length + '</div><h3>' + esc(st.title) + '</h3><p>' + esc(st.text) + '</p><div class="t-btns">' +
      '<button class="btn primary" data-tour="next">' + (last ? 'סיום' : 'הבא') + '</button>' +
      (T.i > 0 ? '<button class="btn ghost" data-tour="back">חזרה</button>' : '') +
      (last ? '' : '<button class="btn ghost" data-tour="skip">דלג</button>') + '</div>';
    var nb = $('[data-tour=next]', card); if (nb) { try { nb.focus(); } catch (e) {} }
  }
  function placeSpot(el) {
    var root = $('#tour'); if (!root) return;
    var spot = $('.t-spot', root), dim = $('.t-dim', root), card = $('.t-card', root), H = window.innerHeight, W = window.innerWidth, top;
    var ch = card.offsetHeight;
    if (el) {
      var r = el.getBoundingClientRect(), pad = 8;
      var t = Math.max(r.top - pad, 4), b = Math.min(r.bottom + pad, H - 4), l = Math.max(r.left - pad, 4), rr = Math.min(r.right + pad, W - 4);
      spot.hidden = false; dim.classList.add('hole');
      spot.style.top = t + 'px'; spot.style.left = l + 'px'; spot.style.width = Math.max(rr - l, 20) + 'px'; spot.style.height = Math.max(b - t, 20) + 'px';
      if (H - b - 14 >= ch) top = b + 14;
      else if (t - 14 >= ch) top = t - 14 - ch;
      else top = (t + b) / 2 < H / 2 ? H - ch - 12 : 12;
    } else {
      spot.hidden = true; dim.classList.remove('hole'); top = (H - ch) / 2;
    }
    card.style.top = Math.max(10, Math.min(top, H - ch - 10)) + 'px';
  }
  function endTour(skipped) {
    var T = S.tour; if (!T) return;
    S.tour = null;
    window.removeEventListener('resize', onTourResize);
    document.body.classList.remove('touring');
    try { $('#app').inert = false; } catch (e) {}
    var root = $('#tour'); if (root) root.parentNode.removeChild(root);
    tourCleanup();
    lsSet(tourFlag(), '1');
    if (S.phase === 'main') { renderMain(); }
    if (skipped) {
      openSheet('<h3>בסדר 👍</h3><p>אפשר לחזור למדריך בכל רגע: <b>הגדרות ← מדריך שימוש</b>.</p><button class="btn primary block" id="skOk">הבנתי</button>', function (sh) {
        $('#skOk', sh).onclick = function () { closeSheet(); setTimeout(askPermSheet, 400); };
      });
    } else setTimeout(askPermSheet, 400);
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
      setTimeout(maybeAutoTour, 900);
    }).catch(function (e) { drawBootError(e && e.code === 'config' ? 'config' : 'net'); });
  }
  /* בדיקת עדכון אוטומטית: בהפעלה, כל 3 דקות, ובחזרה מהרקע. עדכון שהותקן מוצג בסרגל קבוע ומופעל בחזרה הבאה לאפליקציה */
  var lastUpdCheck = 0;
  function startupUpdateCheck() { if (SH.hasUpdates) setTimeout(function () { autoUpdateCheck(0); }, 4000); }
  function autoUpdateCheck(minGap) {
    if (!SH.hasUpdates || S.updPending || document.hidden || S.phase === 'init') return;
    var now = Date.now();
    if (now - lastUpdCheck < minGap) return;
    lastUpdCheck = now;
    SH.checkUpdate().then(function (r) {
      if (r.status === 'installed') { S.updPending = r.version; showUpdBar(); }
    }, noop);
  }
  function showUpdBar() {
    var el = $('#updbar'); if (!el) return;
    el.innerHTML = '<div class="updbar" role="status">' + ico('alert') + '<span class="grow">יש עדכון חדש לאפליקציה</span><button type="button" id="updGo">הפעלה מחדש</button></div>';
    document.body.classList.add('hasupd');
    $('#updGo').onclick = SH.reload;
  }
  function safeToReload() { return S.phase === 'main' && !S.sheet && !S.tour && !focusInScreen(); }

  /* ---------- אירועים ---------- */
  function doUpdateCheck() {
    if (S.updPending) { SH.reload(); return; }
    S.updateMsg = 'בודק…'; var m = $('#updMsg'); if (m) m.textContent = S.updateMsg;
    SH.checkUpdate().then(function (r) {
      if (r.status === 'installed') { S.updateMsg = ''; S.updPending = r.version; showUpdBar(); openSheet('<h3>הגיע עדכון</h3><p>העדכון הותקן. צריך להפעיל מחדש כדי להשתמש בו.</p><button class="btn primary block" id="upGo">הפעלה מחדש</button>', function (sh) { $('#upGo', sh).onclick = SH.reload; }); return; }
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
      case 'cktick': tickSent(id); break;
      case 'ordtick': tickOrder(id); break;
      case 'ordfit': openOrdFit(); break;
      case 'ckclear':
        confirmSheet({ title: 'לנקות את הרשימה?', body: 'כל המוצרים והסימונים ברשימה שנשלחה יימחקו. הרשימה שאת מכינה לא תיפגע.', ok: 'כן, ניקוי', cancel: 'חזרה', danger: true }).then(function (ok) {
          if (!ok) return;
          FBM.setDoc(momRef(), { sent: {} }, { mergeFields: ['sent'] }).then(function () { toast('הרשימה נוקתה'); }, function () { toast('לא הצלחתי לנקות.'); });
        });
        break;
      case 'momclear':
        confirmSheet({ title: 'לנקות את הרשימה של אמא?', body: 'כל המוצרים ברשימה ימחקו. אמא לא תקבל הודעה (לשליחת הודעה "ההזמנה בוצעה" לחץ "הוזמן").', ok: 'כן, ניקוי', cancel: 'חזרה', danger: true }).then(function (ok) { if (ok) clearMomList(); });
        break;
      case 'mktick': var mi = findItem('liad', id); if (mi) patchItem('liad', id, { d: !mi.d }); break;
      case 'mkclearall':
        confirmSheet({ title: 'לנקות את כל הרשימה שלך?', body: 'כל המוצרים ברשימה האישית יימחקו.', ok: 'כן, ניקוי', cancel: 'חזרה', danger: true }).then(function (ok) {
          if (ok) FBM.setDoc(liadRef(), { items: {} }, { mergeFields: ['items'] }).then(function () { toast('הרשימה נוקתה'); }, function () { toast('לא הצלחתי לנקות.'); });
        });
        break;
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
      case 'notiftest': openNotifTest(); break;
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
      case 'tour': startTour(); break;
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
    // התוספים המודולריים של Firebase חושפים FirebasexMessaging במקום FirebasePlugin
    if (!window.FirebasePlugin && window.FirebasexMessaging) window.FirebasePlugin = window.FirebasexMessaging;
    SH = shell; NS = shell.ns; FBM = window.FB; NA = resolveNA();
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
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) return;
      if (S.updPending && safeToReload()) { SH.reload(); return; }   // חזרה לאפליקציה אחרי שהותקן עדכון: מפעילים אותו
      autoUpdateCheck(45000);
      if (S.phase === 'main') { refreshPerm(); loadBackupInfo(); renderChip(); syncToken(false); }
    });
    setInterval(function () { autoUpdateCheck(170000); }, 180000);
    document.addEventListener('backbutton', function () {
      if (S.tour) { endTour(true); return; }
      if (S.sheet) { if (S.dict) dictCancel(); else closeSheet(); return; }
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
