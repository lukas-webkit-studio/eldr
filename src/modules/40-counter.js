/* ==========================================================================
   Počítadlo let praxe
   --------------------------------------------------------------------------
   Proč vlastní implementace místo PureCounteru:
   V HTML je natvrdo zapsané finální číslo, takže se vykreslí hned. Knihovna
   ho pak přepsala zpět na startovní hodnotu a teprve začala animovat —
   návštěvník tedy viděl výsledek dřív než animaci, a přes cookie lištu ještě
   jednou. Tenhle modul místo toho:

   1. Finální číslo se nikdy nezobrazí předčasně. CSS ho schová (viditelnost,
      ne display — layout se nehne), modul hned dosadí startovní hodnotu.
   2. Animace se spustí, až je prvek opravdu vidět A cookie lišta je pryč,
      a ještě chvilku počká — viz START_DELAY níž.
   3. Hodnota se dopočítá z GLOBAL_VARS, takže v HTML může být klidně starý rok.
   4. Bez JS nebo při chybě CSS číslo po 3 s samo odkryje (failsafe v eldr.css).
   5. Respektuje prefers-reduced-motion — tam se číslo jen dosadí.

   Volitelné atributy na prvku:
   data-counter-start, data-counter-end, data-counter-delay (prodleva v ms).
   ========================================================================== */

(function () {
  if (!has(SEL.counter)) return;

  var DURATION = 1600;
  var DEFAULT_START = 20;

  /* Prodleva mezi „prvek je vidět" a prvním tiknutím. Bez ní se počítání
     rozjede ještě než stránka vizuálně dosedne (fonty, obrázky, dojezd
     cookie lišty) a začátek řady se prokliká mimo pozornost. */
  var START_DELAY = 400;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function targetValue(el) {
    var attr = parseInt(el.getAttribute('data-counter-end'), 10);
    if (!isNaN(attr)) return attr;
    if (window.GLOBAL_VARS && window.GLOBAL_VARS.YOE) return window.GLOBAL_VARS.YOE;
    var fromHtml = parseInt((el.textContent || '').replace(/\D/g, ''), 10);
    return isNaN(fromHtml) ? 0 : fromHtml;
  }

  function startValue(el, end) {
    var attr = parseInt(el.getAttribute('data-counter-start'), 10);
    if (!isNaN(attr)) return attr;
    return Math.min(DEFAULT_START, end);
  }

  function delayValue(el) {
    var attr = parseInt(el.getAttribute('data-counter-delay'), 10);
    if (isNaN(attr) || attr < 0) return START_DELAY;
    return attr;
  }

  /* Smoothstep. Dřív tu byl cubic ease-out a ten měl u počítadla nepříjemnou
     vlastnost: 54 % času prostál na posledních třech číslech, zatímco třináct
     ze sedmnácti čísel problikne pod čtyři snímky. Právě proto to vypadalo,
     že počítadlo ukazuje jen konec řady.

     Číselná řada potřebuje rovnoměrnější tempo než posuv prvku. Smoothstep
     na 1600 ms drží každé číslo aspoň 67 ms (čtyři snímky při 60 fps),
     nejdelší 170 ms, a na poslední tři čísla padne jen 25 % času — pořád se
     tedy měkce rozjíždí i dosedá, ale celá řada je čitelná. */
  function ease(t) {
    return t * t * (3 - 2 * t);
  }

  /** Spustí fn až po vykreslení stránky a po zadané prodlevě. */
  function afterPaint(delay, fn) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (delay > 0) setTimeout(fn, delay); else fn();
      });
    });
  }

  function animate(el, from, to) {
    if (REDUCED || from === to) { el.textContent = String(to); return; }

    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min((now - t0) / DURATION, 1);
      el.textContent = String(Math.round(from + (to - from) * ease(p)));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /** Je cookie lišta pryč? Bez lišty na stránce vracíme rovnou true. */
  function bannerGone() {
    return $$('[fs-cc="banner"]').every(function (b) {
      return getComputedStyle(b).display === 'none';
    });
  }

  /** Zavolá fn, jakmile cookie lišta zmizí. */
  function whenBannerGone(fn) {
    if (bannerGone()) { fn(); return; }
    var banners = $$('[fs-cc="banner"]');
    var observer = new MutationObserver(function () {
      if (!bannerGone()) return;
      observer.disconnect();
      fn();
    });
    banners.forEach(function (b) { observer.observe(b, { attributes: true, attributeFilter: ['style', 'class'] }); });
  }

  /** Zavolá fn, jakmile je prvek v zorném poli. */
  function whenVisible(el, fn) {
    if (typeof IntersectionObserver !== 'function') { fn(); return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        observer.disconnect();
        fn();
      });
    }, { threshold: 0.4 });
    observer.observe(el);
  }

  onReady(function () {
    $$(SEL.counter).forEach(function (el) {
      var end = targetValue(el);
      var from = startValue(el, end);

      // Startovní hodnota se dosadí okamžitě a prvek se odkryje.
      // Finální číslo se tím pádem nikdy neukáže před animací.
      el.textContent = String(from);
      el.classList.add('is-counter-ready');

      var done = false;
      whenBannerGone(function () {
        whenVisible(el, function () {
          if (done) return;
          done = true;
          // Bez prodlevy u reduced-motion — tam se hodnota jen dosadí.
          if (REDUCED) { animate(el, from, end); return; }
          afterPaint(delayValue(el), function () { animate(el, from, end); });
        });
      });
    });
  });
})();
