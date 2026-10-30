/* ==========================================================================
   Pás recenzí — plynulý posun se zpomalením při hoveru (#26, dočasně z custom code homepage)
   ==========================================================================
   Proč ne Webflow Interactions: IX3 umí timeline jen přehrát nebo
   pozastavit, rychlost plynule měnit neumí. Lukáš 30. 10. chce, aby se pás
   při najetí myší plynule zpomalil a po odjetí zase rozjel. Navíc pauza
   přes IX3 hover v testu na stagingu vůbec nezabrala (hover řídí vlastní
   instanci timeline, ne tu spuštěnou při načtení).

   Dočasná kopie modulu src/modules/45-testimonial-marquee.js. Načítá se
   z custom code homepage, dokud Cloudflare worker (eldr-web) neservíruje
   bundle s tímto modulem. Po nasazení workeru řádek z homepage i tenhle
   soubor smazat.

   Markup (Webflow):
     .testimonial21_marquee    ořezový obal (třída, ne atribut: zápis atributu
                               přes API na stránce vracel konflikt)
       > první potomek         pás, display: flex, width: max-content
         > 2× Collection List  druhý je kopie s aria-hidden="true",
                               díky ní smyčka navazuje bez skoku

   prefers-reduced-motion: skript nic nespustí, pás stojí a jde posouvat
   ručně (overflow-x: auto na obalu ve Webflow).
   Mimo viewport a ve skryté záložce smyčka neběží.
   ========================================================================== */

(function () {
  'use strict';

  var SPEED = 40; // px za sekundu
  var EASE = 2.5; // jak rychle se dorovná cílová rychlost (1/s), ~1 s na zastavení

  function init(root) {
    var track = root.firstElementChild;
    // Stejný kód je i v bundlu (src/modules/45-testimonial-marquee.js);
    // kdo je první, ten pás řídí.
    if (!track || root.hasAttribute('data-marquee-ready')) return;
    root.setAttribute('data-marquee-ready', '');

    // Ve Webflow má obal overflow-x: auto, takže bez JS a při reduced motion
    // jde pás posunout ručně (prstem, trackpadem). Ořez jen při animaci.
    root.style.overflow = 'hidden';

    var x = 0;
    var speed = SPEED;
    var target = SPEED;
    var last = null;
    var visible = true;
    var raf = null;

    function frame(now) {
      raf = null;
      if (last === null) last = now;
      // Strop 100 ms: po návratu do záložky pás neposkočí o kus dál.
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      speed += (target - speed) * (1 - Math.exp(-EASE * dt));
      x -= speed * dt;

      // Polovina pásu = jeden Collection List včetně mezery za ním.
      var half = track.scrollWidth / 2;
      if (half > 0 && -x >= half) x += half;

      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px, 0, 0)';

      var moving = speed > 0.5 || target > 0;
      if (moving && visible && !document.hidden) {
        raf = requestAnimationFrame(frame);
      } else {
        last = null;
      }
    }

    function run() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    function slowDown() {
      target = 0;
    }

    function speedUp() {
      target = SPEED;
      run();
    }

    root.addEventListener('mouseenter', slowDown);
    root.addEventListener('mouseleave', function () {
      if (!root.contains(document.activeElement)) speedUp();
    });
    // Klávesnice: karta s fokusem nesmí odjet z obrazovky.
    root.addEventListener('focusin', slowDown);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget) && !root.matches(':hover')) speedUp();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        run();
      }).observe(root);
    }
    document.addEventListener('visibilitychange', run);

    run();
  }

  function start() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    Array.prototype.forEach.call(document.querySelectorAll('.testimonial21_marquee'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
