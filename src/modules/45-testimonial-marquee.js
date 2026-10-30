/* ==========================================================================
   Pás recenzí — plynulý posun se zpomalením při hoveru (homepage, #26)
   ==========================================================================
   Proč ne Webflow Interactions: IX3 umí timeline jen přehrát nebo
   pozastavit, rychlost plynule měnit neumí. Lukáš chce, aby se pás při
   najetí myší plynule zpomalil a po odjetí zase rozjel. Pauza přes IX3
   hover navíc v testu na stagingu nezabrala (hover řídí vlastní instanci
   timeline, ne tu spuštěnou při načtení).

   Markup (Webflow):
     .testimonial21_marquee    obal, ve Webflow overflow-x: auto
       > první potomek         pás, display: flex, width: max-content
         > 2× Collection List  druhý je kopie s aria-hidden="true",
                               díky ní smyčka navazuje bez skoku

   prefers-reduced-motion: modul nic nespustí, pás stojí a jde posouvat
   ručně (overflow-x: auto). Bez JS platí totéž.
   Mimo viewport a ve skryté záložce smyčka neběží.

   data-marquee-ready: pojistka proti dvojímu spuštění. Do nasazení
   workeru s tímhle bundlem běží na homepage stejný kód i z custom code
   stránky (src/dev/testimonial-marquee.js); kdo je první, ten pás řídí.
   ========================================================================== */

(function () {
  if (!has(SEL.testimonialMarquee)) return;

  var SPEED = 40; // px za sekundu
  var EASE = 2.5; // jak rychle se dorovná cílová rychlost (1/s), ~1 s na zastavení

  function init(root) {
    var track = root.firstElementChild;
    if (!track || root.hasAttribute('data-marquee-ready')) return;
    root.setAttribute('data-marquee-ready', '');

    // Ořez jen při animaci, jinak má jít pás posunout ručně.
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

      if ((speed > 0.5 || target > 0) && visible && !document.hidden) {
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

  onReady(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    $$(SEL.testimonialMarquee).forEach(init);
  });
})();
