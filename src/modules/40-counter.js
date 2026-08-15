/* ==========================================================================
   Počítadlo let praxe
   Původně: inline v patičce Domovské stránky
   Knihovnu PureCounter si modul donese sám a jen tehdy, když je na stránce
   prvek s odpovídající třídou — na ostatních stránkách se nic nestahuje.
   Spustí se až po zavření cookie lišty, aby animace neproběhla mimo obraz.
   ========================================================================== */

(function () {
  if (!has(SEL.counter)) return;

  var LIB = 'https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js';
  var started = false;
  var loading = null;

  function loadLib() {
    if (typeof window.PureCounter === 'function') return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = LIB;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return loading;
  }

  function start() {
    if (started) return;
    started = true;
    loadLib().then(function () {
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
    }).catch(function () {
      // Knihovna se nenačetla — číslo zůstane staticky vypsané, nic se nerozbije.
      started = false;
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
