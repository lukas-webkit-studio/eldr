/* ==========================================================================
   Počítadlo let praxe
   Původně: inline v patičce Domovské stránky
   Spustí se až po zavření cookie lišty, aby animace nešla mimo obraz.
   ========================================================================== */

(function () {
  if (!has(SEL.counter)) return;

  var started = false;

  function start() {
    if (started || typeof window.PureCounter !== 'function') return;
    started = true;
    new PureCounter({
      selector: SEL.counter,
      start: 20,
      end: (window.GLOBAL_VARS && window.GLOBAL_VARS.YOE) || 35,
      duration: 0.8,
      delay: 10,
      once: true,
      repeat: false,
      decimals: 0,
      legacy: true,
      filesizing: false,
      currency: false,
      separator: false
    });
  }

  window.addEventListener('load', function () {
    var banners = $$('[fs-cc="banner"]');

    // Bez cookie lišty spustíme rovnou.
    if (!banners.length) { start(); return; }

    banners.forEach(function (banner) {
      if (getComputedStyle(banner).display === 'none') {
        start();
      } else {
        new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            if (m.attributeName === 'style' && getComputedStyle(m.target).display === 'none') start();
          });
        }).observe(banner, { attributes: true });
      }
    });
  });
})();
