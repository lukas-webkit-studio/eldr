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
   2. Animace se spustí, až je prvek opravdu vidět A cookie lišta je pryč.
   3. Hodnota se dopočítá z GLOBAL_VARS, takže v HTML může být klidně starý rok.
   4. Bez JS nebo při chybě CSS číslo po 3 s samo odkryje (failsafe v eldr.css).
   5. Respektuje prefers-reduced-motion — tam se číslo jen dosadí.

   Volitelné atributy na prvku: data-counter-start, data-counter-end.
   ========================================================================== */

(function () {
  if (!has(SEL.counter)) return;

  var DURATION = 1200;
  var DEFAULT_START = 20;
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

  /* Cubic ease-out — rychlý rozjezd, měkké dojetí. */
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

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
          animate(el, from, end);
        });
      });
    });
  });
})();
