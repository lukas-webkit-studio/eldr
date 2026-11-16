/* ==========================================================================
   Pás recenzí — plynulý posun, zpomalení při hoveru, tah myší a prstem
   (#26 a #54, dočasně z custom code homepage)
   ==========================================================================
   Dočasná kopie modulu src/modules/45-testimonial-marquee.js. Načítá se
   z custom code homepage, dokud Cloudflare worker (eldr-web) neservíruje
   bundle s tímto modulem. Po nasazení workeru řádek z homepage i tenhle
   soubor smazat.

   Popis chování, markup a zdůvodnění, proč to není ve Webflow, jsou
   v hlavičce modulu. Kód mezi "var SPEED" a koncem init() je s modulem
   shodný do znaku, hlídá to test/smoke.js. Upravuj vždy oba soubory.

   data-marquee-ready: pojistka proti dvojímu spuštění. Stejný kód je
   i v bundlu; kdo je první, ten pás řídí.
   ========================================================================== */

(function () {
  'use strict';

  var SPEED = 40; // px za sekundu, běžný posun doleva
  var EASE = 2.5; // jak rychle se dorovná cílová rychlost (1/s), ~1 s na zastavení
  var FRICTION = 4; // brzdění setrvačnosti po puštění (1/s), dojezd = rychlost / 4
  var RESUME_DELAY = 2000; // ms od puštění nebo dojezdu do rozjezdu
  var DRAG_THRESHOLD = 6; // px, od kdy je pohyb tah, a ne klik
  var COAST_MIN = 30; // px/s, pomalejší puštění je bez setrvačnosti
  var MAX_FLING = 3000; // px/s, strop rychlosti po puštění

  function init(root) {
    var track = root.firstElementChild;
    if (!track || root.hasAttribute('data-marquee-ready')) return;
    root.setAttribute('data-marquee-ready', '');

    // Ořez jen při animaci, jinak má jít pás posunout ručně.
    root.style.overflow = 'hidden';
    // Svislé scrollování stránky nechává prohlížeči, vodorovný tah je náš.
    root.style.touchAction = 'pan-y';
    root.style.userSelect = 'none';
    root.style.webkitUserSelect = 'none';
    setCursor('grab');

    var x = 0; // posun pásu v px, drží se v rozsahu (-half, 0]
    var v = -SPEED; // okamžitá rychlost v px/s, záporná = doleva
    var last = null;
    var visible = true;
    var raf = null;

    var hovered = false;
    var focused = false;
    var pressed = false; // stisknuto, o tahu se ještě nerozhodlo
    var dragging = false;
    var coasting = false; // dojezd setrvačností
    var holdUntil = 0; // do kdy pás po interakci stojí (čas z performance.now)
    var suppressClick = false;

    var pointerId = null;
    var downX = 0;
    var downY = 0;
    var originX = 0; // pozice ukazatele ve chvíli, kdy tah začal
    var originOffset = 0; // posun pásu ve stejné chvíli
    var samples = []; // poslední polohy ukazatele pro výpočet rychlosti
    var lastEvent = null; // poslední událost ukazatele, kvůli hoveru po puštění

    function clock() {
      return window.performance && window.performance.now ? window.performance.now() : Date.now();
    }

    // Odkazy mají vlastní cursor: pointer, proto se nastavují zvlášť.
    function setCursor(value) {
      root.style.cursor = value;
      var links = root.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) links[i].style.cursor = value;
    }

    function goal(now) {
      var held = hovered || focused || pressed || coasting || now < holdUntil;
      return held ? 0 : -SPEED;
    }

    function render() {
      // Polovina pásu = jeden Collection List včetně mezery za ním.
      var half = track.scrollWidth / 2;
      // Normalizace oběma směry: tah doprava dává kladný posun.
      if (half > 0) x = ((x % half) - half) % half;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px, 0, 0)';
    }

    function frame(now) {
      raf = null;
      if (last === null) last = now;
      // Strop 100 ms: po návratu do záložky pás neposkočí o kus dál.
      var dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      var target = goal(now);
      if (!dragging) {
        v += (target - v) * (1 - Math.exp(-(coasting ? FRICTION : EASE) * dt));
        x += v * dt;
        if (coasting && Math.abs(v) < 5) {
          coasting = false;
          holdUntil = now + RESUME_DELAY;
        }
      }
      render();

      var busy = dragging || coasting || now < holdUntil || target !== 0 || Math.abs(v) > 0.5;
      if (busy && visible && !document.hidden) {
        raf = requestAnimationFrame(frame);
      } else {
        last = null;
      }
    }

    function run() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    /* --- hover a fokus --------------------------------------------------- */

    // Pointer Events kvůli dotyku: po ťuknutí prstem prohlížeč posílá
    // náhradní mouseenter a pás by zůstal stát až do ťuknutí jinam.
    var pointers = 'PointerEvent' in window;
    root.addEventListener(pointers ? 'pointerenter' : 'mouseenter', function (e) {
      if (pointers && e.pointerType !== 'mouse') return;
      hovered = true;
    });
    root.addEventListener(pointers ? 'pointerleave' : 'mouseleave', function (e) {
      if (pointers && e.pointerType !== 'mouse') return;
      hovered = false;
      run();
    });

    // Klávesnice: karta s fokusem nesmí odjet z obrazovky. Fokus po kliknutí
    // myší se nepočítá, jinak by pás po tahu zůstal stát.
    root.addEventListener('focusin', function (e) {
      var keyboard = true;
      try {
        keyboard = e.target.matches(':focus-visible');
      } catch (err) {
        // Prohlížeč bez :focus-visible: ber každý fokus jako klávesnici.
      }
      focused = keyboard;
    });
    root.addEventListener('focusout', function (e) {
      if (root.contains(e.relatedTarget)) return;
      focused = false;
      run();
    });

    /* --- tah --------------------------------------------------------------- */

    function endDrag(fling) {
      var now = clock();
      if (dragging) {
        dragging = false;
        suppressClick = true;
        // Klik přichází hned po pointerup; kdyby nepřišel, příští klik nesmí zmizet.
        setTimeout(function () {
          suppressClick = false;
        }, 0);
        track.style.pointerEvents = '';
        setCursor('grab');
        root.removeAttribute('data-marquee-dragging');

        v = fling ? releaseVelocity(now) : 0;
        if (Math.abs(v) > COAST_MIN) {
          coasting = true;
        } else {
          v = 0;
          holdUntil = now + RESUME_DELAY;
        }
      }
      // Tah mohl skončit mimo pás. Zachycený ukazatel pointerleave neposlal.
      if (lastEvent && lastEvent.pointerType === 'mouse') {
        var box = root.getBoundingClientRect();
        hovered =
          lastEvent.clientX >= box.left &&
          lastEvent.clientX <= box.right &&
          lastEvent.clientY >= box.top &&
          lastEvent.clientY <= box.bottom;
      }
      pressed = false;
      pointerId = null;
      samples = [];
      lastEvent = null;
      run();
    }

    // Rychlost z posledních 100 ms tahu. Kdo před puštěním zastavil, nehodil.
    function releaseVelocity(now) {
      var lastSample = samples[samples.length - 1];
      if (!lastSample || now - lastSample.t > 80) return 0;
      var first = lastSample;
      for (var i = samples.length - 1; i >= 0 && lastSample.t - samples[i].t <= 100; i--) {
        first = samples[i];
      }
      var span = lastSample.t - first.t;
      if (span <= 0) return 0;
      var speed = ((lastSample.x - first.x) / span) * 1000;
      return Math.max(-MAX_FLING, Math.min(MAX_FLING, speed));
    }

    root.addEventListener('pointerdown', function (e) {
      if (pointerId !== null || e.isPrimary === false) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      pressed = true;
      coasting = false;
      suppressClick = false;
      downX = e.clientX;
      downY = e.clientY;
      samples = [];
      lastEvent = e;
      run();
    });

    root.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pointerId) return;
      lastEvent = e;

      if (!dragging) {
        var dx = e.clientX - downX;
        var dy = e.clientY - downY;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          // Svislý pohyb: stránka scrolluje, pás jede dál.
          endDrag(false);
          return;
        }
        dragging = true;
        originX = e.clientX;
        originOffset = x;
        root.setAttribute('data-marquee-dragging', '');
        // Zachycení: tah pokračuje, i když ukazatel vyjede z pásu.
        try {
          root.setPointerCapture(e.pointerId);
        } catch (err) {
          // Bez zachycení tah skončí na okraji pásu, nic dalšího se nestane.
        }
        // Při tahu nesmí reagovat karty pod ukazatelem (hover, cursor).
        track.style.pointerEvents = 'none';
        setCursor('grabbing');
      }

      x = originOffset + (e.clientX - originX);
      samples.push({ t: clock(), x: e.clientX });
      if (samples.length > 20) samples.shift();
      if (e.cancelable) e.preventDefault();
      run();
    });

    root.addEventListener('pointerup', function (e) {
      if (e.pointerId !== pointerId) return;
      lastEvent = e;
      endDrag(true);
    });
    // pointercancel: prohlížeč si gesto vzal pro svislý scroll stránky.
    root.addEventListener('pointercancel', function (e) {
      if (e.pointerId === pointerId) endDrag(false);
    });
    // Jen ztráta zachycení na pásu. Dotyk je nejdřív zachycený na kartě
    // a její lostpointercapture sem probublá ve chvíli, kdy tah začíná.
    root.addEventListener('lostpointercapture', function (e) {
      if (e.target === root && e.pointerId === pointerId && dragging) endDrag(false);
    });

    // Po tahu se nesmí otevřít odkaz na kartě. Capture fáze, aby se klik
    // nedostal ani k měření v GTM.
    root.addEventListener(
      'click',
      function (e) {
        if (!suppressClick) return;
        suppressClick = false;
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );

    // Obrázky a odkazy se nesmí chytat nativním přetahováním.
    root.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    /* --- viditelnost ------------------------------------------------------- */

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
