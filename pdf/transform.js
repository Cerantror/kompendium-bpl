/* Turns the interactive Kompendium page into a print document (run inside the loaded page). */
(function () {
  var PAGES = window.__PAGES || {};
  var D = JSON.parse(document.getElementById('qdata').textContent);
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  document.documentElement.setAttribute('data-theme', 'light');
  $$('.topbar,#nav,#backdrop,#quiz,.block-foot,.toc,.check-reset,#results').forEach(function (e) { e.remove(); });
  $$('.block').forEach(function (b) { b.classList.add('on'); });
  $$('details').forEach(function (d) { d.open = true; });
  $$('.block button').forEach(function (b) { b.remove(); });

  /* calculators -> worked examples with the start values */
  $$('.calc').forEach(function (c) {
    $$('input', c).forEach(function (inp) {
      var b = document.createElement('b');
      b.className = 'calc-val';
      var v = parseFloat(inp.value);
      b.textContent = isFinite(v) ? v.toLocaleString('pl-PL', { maximumFractionDigits: 2 }) : inp.value;
      inp.replaceWith(b);
    });
    var t = c.querySelector('.calc-t');
    if (t) t.insertAdjacentHTML('beforeend', ' <span class="calc-note">· przykład dla wartości startowych</span>');
    if (c.id === 'calc-conv') {
      var s = c.querySelector('.small');
      if (s) s.textContent = 'Przykład dla 5 m/s, 300 m i 10 km. W wersji HTML wpisujesz dowolną wartość, a pozostałe pola w wierszu przeliczają się same.';
    }
  });
  $$('ul.check input').forEach(function (i) {
    var s = document.createElement('span'); s.className = 'box'; s.setAttribute('aria-hidden', 'true'); i.replaceWith(s);
  });

  /* ---------- question appendices ---------- */
  var ORDER = ['start', 'prawo', 'czlowiek', 'meteo', 'lacznosc', 'zasady', 'procedury', 'planowanie', 'wiedza', 'nawigacja'];
  var TITLE = {};
  $$('.block').forEach(function (b) { TITLE[b.id] = b.getAttribute('data-title'); });
  function fnv(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function order(key, n) {
    var seed = fnv(key) || 1, idx = [];
    for (var i = 0; i < n; i++) idx.push(i);
    for (var j = n - 1; j > 0; j--) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; var k = seed % (j + 1); var t = idx[j]; idx[j] = idx[k]; idx[k] = t; }
    return idx;
  }
  function qhtml(q, tag, key) {
    var h = '<div class="pq"><p class="pq-q"><span class="pq-id">' + esc(tag) + '</span>' + esc(q.q) + '</p><ol class="pq-a">';
    order(key, q.a.length).forEach(function (i) {
      h += i === 0 ? '<li class="ok"><b>' + esc(q.a[i]) + '</b> <span class="tick">✓</span></li>' : '<li>' + esc(q.a[i]) + '</li>';
    });
    h += '</ol>';
    if (q.e) h += '<p class="pq-e">' + esc(q.e) + '</p>';
    if (q.adn) h += '<p class="pq-old"><b>Adnotacja:</b> ' + esc(q.adn) + '</p>';
    return h + '</div>';
  }
  var main = document.getElementById('main');

  var a = '<section class="block on appx" id="dodatek-a" data-title="Pytania kontrolne z odpowiedziami"><header class="block-head">' +
    '<p class="eyebrow">Dodatek A · sprawdź się</p><h2>Pytania kontrolne z odpowiedziami</h2>' +
    '<p class="lead">' + D.own.length + ' pytań napisanych do tego kompendium. Poprawna odpowiedź jest pogrubiona i oznaczona ✓, pod nią krótkie wyjaśnienie. Najlepiej zasłoń odpowiedzi kartką i sprawdzaj się po kolei.</p></header>';
  var n = 0;
  ORDER.forEach(function (b) {
    var list = D.own.filter(function (q) { return q.b === b; });
    if (!list.length) return;
    a += '<h3>' + esc(TITLE[b]) + ' <span class="cnt">' + list.length + '</span></h3><div class="pq-cols pq-own">';
    list.forEach(function (q) { n++; a += qhtml(q, n + '.', 'own' + n + q.q); });
    a += '</div>';
  });
  a += '</section>';

  var counts = {};
  D.bank.forEach(function (q) { counts[q.b] = (counts[q.b] || 0) + 1; });
  var nOld = D.bank.filter(function (q) { return q.adn; }).length;
  var bsec = '<section class="block on appx" id="dodatek-b" data-title="Baza pytań ULC (2025)"><header class="block-head">' +
    '<p class="eyebrow">Dodatek B · oficjalna baza ULC</p><h2>Baza przykładowych pytań ULC (2025)</h2>' +
    '<p class="lead">Wszystkie ' + D.bank.length + ' pytania z pliku ULC „bpl.pdf” z 4.04.2025, pogrupowane według przedmiotów. Poprawna odpowiedź według klucza ULC jest pogrubiona i oznaczona ✓. W pliku ULC poprawna jest zawsze pierwsza; tu kolejność odpowiedzi jest przemieszana. ' +
    'Odpowiedź z klucza ULC jest uznawana za poprawną; przy ' + nOld + ' pytaniach, w których klucz jest nieaktualny lub wątpliwy, pod odpowiedziami jest adnotacja.</p></header>';
  ORDER.forEach(function (b) {
    var list = D.bank.filter(function (q) { return q.b === b; });
    if (!list.length) return;
    bsec += '<h3>' + esc(TITLE[b]) + ' <span class="cnt">' + list.length + ' pytań</span></h3><div class="pq-cols">';
    list.forEach(function (q) { bsec += qhtml(q, q.id, q.id); });
    bsec += '</div>';
  });
  bsec += '</section>';
  main.insertAdjacentHTML('beforeend', a + bsec);
  var kt = document.getElementById('kontakt'); if (kt) main.appendChild(kt);

  /* ---------- cover with contents ---------- */
  var groups = [];
  $$('.block').forEach(function (b) {
    var g = b.classList.contains('appx') ? 'Dodatki' : (b.getAttribute('data-group') === 'Przedmioty' ? 'Przedmioty egzaminu ULC' : b.getAttribute('data-group'));
    var last = groups[groups.length - 1];
    if (!last || last.name !== g) groups.push(last = { name: g, items: [] });
    last.items.push(b);
  });
  var num = 0;
  var toc = groups.map(function (g) {
    return '<div class="ct-g"><p class="ct-gt">' + esc(g.name) + '</p>' + g.items.map(function (b) {
      var appx = b.classList.contains('appx');
      var mark = appx ? (b.id === 'dodatek-a' ? 'A' : 'B') : (b.id === 'kontakt' ? '@' : String(++num));
      var title = b.getAttribute('data-title');
      return '<a class="ct-i" href="#' + b.id + '"><span class="ct-n">' + mark + '</span><span class="ct-t">' + esc(title) + '</span><span class="ct-d"></span><span class="ct-p">' + (PAGES[b.id] || '') + '</span></a>';
    }).join('') + '</div>';
  }).join('');
  var cover = '<section class="cover" id="okladka">' +
    '<div class="cv-top"><span class="brand-mark">BPL</span><span class="cv-kick">Kurs pilota balonowego · FBSN</span></div>' +
    '<p class="cv-title">Kompendium pilota balonowego</p>' +
    '<p class="cv-sub">Materiały z kursu zebrane w jednym miejscu: wszystko do egzaminu teoretycznego BPL w ULC i do praktyki na balonie SP-BFN, z pytaniami kontrolnymi i pełną bazą pytań ULC.</p>' +
    '<div class="cv-meta"><span><b>' + (D.bank.length) + '</b> pytań ULC (plik z 4.04.2025)</span><span><b>' + D.own.length + '</b> pytań kontrolnych</span><span><b>12</b> bloków wiedzy</span></div>' +
    '<p class="ct-h">Spis treści</p><div class="ct">' + toc + '</div>' +
    '<p class="cv-foot">Wersja z ' + esc((document.getElementById('wersja') || {}).textContent || '') + '. Wersja interaktywna z quizem, egzaminem próbnym, kalkulatorami i checklistami: strona HTML kompendium. Kompendium jest pomocą do nauki – rozstrzygają aktualne przepisy, AIP i instrukcja użytkowania balonu (AFM).</p>' +
    '</section>';
  main.insertAdjacentHTML('afterbegin', cover);
  window.scrollTo(0, 0);
})();
