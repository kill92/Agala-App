/* קליפת האפליקציה (חלק מה-APK): טוענת את חבילת הממשק, בודקת עדכונים חתומים מ-GitHub ומאמתת חתימה. */
(function () {
  'use strict';
  var CFG = window.AGALA_CONFIG || {};
  var NS = window.__AGALA_NS || 'agala';
  var API = CFG.apiLevel || 1;

  function lsGet(k) { try { return localStorage.getItem(NS + '.' + k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(NS + '.' + k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(NS + '.' + k); } catch (e) {} }

  var bootEl = document.getElementById('boot');
  var bootMsg = document.getElementById('bootMsg');
  var current = { version: 0, source: 'embedded' };

  function b64ToBytes(b) {
    var s = atob(b), a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
    return a;
  }

  function verify(text, sigB64) {
    try {
      if (!CFG.pub || !window.crypto || !crypto.subtle || !sigB64) return Promise.resolve(false);
      return crypto.subtle.importKey('jwk', CFG.pub, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify'])
        .then(function (key) {
          return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, b64ToBytes(sigB64), new TextEncoder().encode(text));
        })
        .catch(function () { return false; });
    } catch (e) { return Promise.resolve(false); }
  }

  function fetchText(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }

  function parseBundle(text) {
    var b = JSON.parse(text);
    if (!b || typeof b.version !== 'number' || typeof b.js !== 'string' || typeof b.html !== 'string' || typeof b.css !== 'string') throw new Error('bad bundle');
    return b;
  }

  function pickBundle() {
    return fetchText('app/bundle.json').then(function (embText) {
      var emb = parseBundle(embText);
      var out = { bundle: emb, source: 'embedded' };
      // הגנה מקריסה: אם ההפעלה הקודמת עם חבילת OTA לא הסתיימה בהצלחה – זורקים אותה
      var pending = lsGet('boot.pending');
      if (pending) {
        lsSet('ota.bad', pending);
        lsDel('ota.bundle'); lsDel('ota.sig'); lsDel('boot.pending');
      }
      var otaText = lsGet('ota.bundle'), otaSig = lsGet('ota.sig');
      if (!otaText || !otaSig) return out;
      return verify(otaText, otaSig).then(function (ok) {
        if (!ok) { lsDel('ota.bundle'); lsDel('ota.sig'); return out; }
        try {
          var ota = parseBundle(otaText);
          if (ota.version > emb.version && (ota.minApi || 1) <= API) return { bundle: ota, source: 'ota' };
        } catch (e) {}
        lsDel('ota.bundle'); lsDel('ota.sig');
        return out;
      });
    });
  }

  function checkUpdate() {
    if (!CFG.ghOwner || !CFG.ghRepo) return Promise.resolve({ status: 'disabled' });
    var base = 'https://raw.githubusercontent.com/' + CFG.ghOwner + '/' + CFG.ghRepo + '/' + (CFG.ghBranch || 'main') + '/update/';
    return fetchText(base + 'manifest.json?t=' + Date.now()).then(function (t) {
      var m = JSON.parse(t);
      if (!m || typeof m.version !== 'number') throw new Error('bad manifest');
      if ((m.minApi || 1) > API) return { status: 'needs-apk', version: m.version };
      if (m.version <= current.version) return { status: 'uptodate', version: current.version };
      if (lsGet('ota.bad') === String(m.version)) return { status: 'uptodate', version: current.version };
      return fetchText(base + 'bundle.json?v=' + m.version).then(function (text) {
        return verify(text, m.sig).then(function (ok) {
          if (!ok) return { status: 'bad-signature', version: m.version };
          var b = parseBundle(text);
          if (b.version !== m.version) return { status: 'bad-signature', version: m.version };
          lsSet('ota.bundle', text); lsSet('ota.sig', m.sig);
          return { status: 'installed', version: m.version };
        });
      });
    });
  }

  function showBoot(msg, withReset) {
    bootEl.classList.remove('gone');
    bootMsg.textContent = msg;
    if (withReset && !document.getElementById('bootReset')) {
      var b = document.createElement('button');
      b.id = 'bootReset'; b.textContent = 'ניסיון חוזר';
      b.onclick = function () { var bad = lsGet('boot.pending'); if (bad) lsSet('ota.bad', bad); lsDel('ota.bundle'); lsDel('ota.sig'); lsDel('boot.pending'); location.reload(); };
      bootEl.appendChild(b);
    }
  }

  function fail(e) {
    try { console.error('agala boot error', e); } catch (x) {}
    showBoot('משהו השתבש בטעינה. אפשר לנסות שוב.', true);
  }

  function run(picked) {
    var bundle = picked.bundle;
    current = { version: bundle.version, source: picked.source };
    if (picked.source === 'ota') lsSet('boot.pending', String(bundle.version));
    document.getElementById('app-css').textContent = bundle.css;
    document.getElementById('app').innerHTML = bundle.html;
    var url = URL.createObjectURL(new Blob([bundle.js], { type: 'text/javascript' }));
    var s = document.createElement('script');
    s.src = url;
    s.onload = function () {
      URL.revokeObjectURL(url);
      try {
        window.AgalaApp.start({
          ns: NS,
          fb: CFG.fb,
          apkVersion: CFG.apkVersion || 1,
          apiLevel: API,
          bundleVersion: bundle.version,
          source: picked.source,
          hasUpdates: !!(CFG.ghOwner && CFG.ghRepo),
          checkUpdate: checkUpdate,
          reload: function () { location.reload(); },
          ready: function () {
            lsDel('boot.pending');
            bootEl.classList.add('gone');
          }
        });
      } catch (e) { fail(e); }
    };
    s.onerror = fail;
    document.body.appendChild(s);
  }

  function go() { pickBundle().then(run).catch(fail); }

  if (window.cordova) document.addEventListener('deviceready', go, { once: true });
  else go();
})();
