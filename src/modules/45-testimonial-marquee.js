/* ==========================================================================
   Pás recenzí — plynulý posun, zpomalení při hoveru, tah myší a prstem
   (homepage, #26 a #54)
   ==========================================================================
   Proč ne Webflow: nativní slider neumí nekonečný plynulý posun. IX3 umí
   timeline jen přehrát nebo pozastavit, rychlost plynule měnit neumí,
   a tah se setrvačností a plynulým rozjezdem zpět neumí vůbec. Pauza přes
   IX3 hover navíc v testu na stagingu nezabrala (hover řídí vlastní
   instanci timeline, ne tu spuštěnou při načtení).

   Markup (Webflow):
     .testimonial21_marquee    obal, ve Webflow overflow-x: auto
       > první potomek         pás, display: flex, width: max-content
         > 2× Collection List  druhý je kopie s aria-hidden="true",
                               díky ní smyčka navazuje bez skoku

   Chování:
     - pás jede sám doleva (SPEED), při hoveru myší a při fokusu
       z klávesnice plynule zastaví
     - tah myší nebo prstem posouvá pás 1 : 1 oběma směry
     - o směru gesta rozhoduje modul z prvních pixelů: do 45° od vodorovné
       je to tah a drží až do puštění, i když prst ujede nahoru nebo dolů;
       strmější pohyb je scroll stránky a pás se nehne
     - po hození pás nezastavuje: rychlost puštění plynule přejde rovnou
       do běžného posunu (hození doprava projde nulou a rozjede se doleva)
     - po puštění bez hození pás RESUME_DELAY stojí a pak se plynule rozjede
     - dokud je nad pásem myš nebo fokus z klávesnice, stojí dál
     - po tahu se nespustí klik na kartu

   Dotyk jde přes Touch Events, myš a pero přes Pointer Events. Důvod:
   iOS Safari předá gesto scrollu stránky podle vlastní, úzké tolerance
   a pošle pointercancel. Zabránit tomu jde jen voláním preventDefault()
   v nepasivním touchmove hned u prvního pohybu vyhodnoceného jako
   vodorovný. touch-action: pan-y zůstává jako nápověda pro ostatní.

   Proč jsou cursor, touch-action a user-select tady, a ne na třídě ve
   Webflow: platí jen tehdy, když pás řídí tenhle modul. Bez JS a při
   prefers-reduced-motion se pás posouvá nativně (overflow-x: auto)
   a touch-action: pan-y na třídě by tam vodorovný posun prstem zakázal.
   Style panel selektor [data-marquee-ready] zapsat neumí. Kombo třída
   přepínaná z JS by šla, ale stav by žil na dvou místech a třídu, kterou
   v Designeru žádný prvek nenese, smaže úklid stylů. cursor: grabbing
   a user-select se navíc mění za běhu.

   Karty jsou odkazy a mají vlastní cursor: pointer. Protože zabírají skoro
   celý pás, dostávají grab i ony; že jdou otevřít, ukazuje rámeček při
   hoveru (rozhodnutí v docs/decisions.md, 16. 11. 2026).

   data-marquee-dragging: obal ho nese po dobu tahu. Čtou ho jen testy.

   prefers-reduced-motion: modul nic nespustí, pás stojí a jde posouvat
   ručně (overflow-x: auto). Bez JS platí totéž.
   Mimo viewport a ve skryté záložce smyčka neběží.

   data-marquee-ready: pojistka proti dvojímu spuštění. Do nasazení
   workeru s tímhle bundlem běží na homepage stejný kód i z custom code
   stránky (src/dev/testimonial-marquee.js); kdo je první, ten pás řídí.
   ========================================================================== */

(function () {
  if (!has(SEL.testimonialMarquee)) return;

  var SPEED = 40; // px za sekundu, běžný posun doleva
  var EASE = 2.5; // jak rychle se dorovná cílová rychlost (1/s), ~1 s na zastavení
  var FRICTION = 2; // útlum hození (1/s), zhruba jako nativní scroll na iOS
  var RESUME_DELAY = 1000; // ms, jak dlouho pás stojí po puštění bez hození
  var LOCK_THRESHOLD = 5; // px, po kolika se rozhodne o směru gesta
  var FLING_MIN = 50; // px/s, pomalejší puštění se bere jako puštění bez hození
  var MAX_FLING = 3000; // px/s, strop rychlosti po puštění
  var VELOCITY_WINDOW = 100; // ms, z jak dlouhého konce tahu se počítá rychlost

  function init(root) {
    var track = root.firstElementChild;
    if (!track || root.hasAttribute('data-marquee-ready')) return;
    root.setAttribute('data-marquee-ready', '');

    // Ořez jen při animaci, jinak má jít pás posunout ručně.
    root.style.overflow = 'hidden';
    // Nápověda prohlížeči: svislý scroll a zoom dvěma prsty jsou jeho,
    // vodorovný tah náš. O směru na dotyku rozhoduje touchmove níž.
    root.style.touchAction = 'pan-y pinch-zoom';
    // Pás se hýbe pořád, vlastní vrstva ušetří překreslování karet.
    track.style.willChange = 'transform';
    setCursor('grab');

    var x = 0; // posun pásu v px, drží se v rozsahu (-half, 0]
    var v = -SPEED; // okamžitá rychlost v px/s, záporná = doleva
    var half = 0; // šířka jednoho seznamu = délka smyčky
    var last = null;
    var visible = true;
    var raf = null;

    var hovered = false;
    var focused = false;
    var coasting = false; // dobíhá hození
    var holdUntil = 0; // do kdy pás po puštění stojí (čas z performance.now)
    var suppressClick = false;
    var suppressUntil = 0;

    // Jedno gesto: od stisku do puštění.
    var active = false;
    var source = ''; // 'mouse', 'pen' nebo 'touch'
    var pointerId = null;
    var axis = ''; // '' = nerozhodnuto, 'x' = tah pásu, 'y' = scroll stránky
    var caught = false; // stisk zastavil dobíhající pás
    var downX = 0;
    var downY = 0;
    var lastX = 0;
    var lastY = 0;
    var originX = 0; // pozice ukazatele ve chvíli, kdy tah začal
    var originOffset = 0; // posun pásu ve stejné chvíli
    var samples = []; // poslední polohy ukazatele pro výpočet rychlosti

    function clock() {
      return window.performance && window.performance.now ? window.performance.now() : Date.now();
    }

    // Odkazy mají vlastní cursor: pointer, proto se nastavují zvlášť.
    function setCursor(value) {
      root.style.cursor = value;
      var links = root.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) links[i].style.cursor = value;
    }

    // Výběr textu se vypíná jen po dobu stisku, jinak jde recenze označit.
    function setSelectable(on) {
      root.style.userSelect = on ? '' : 'none';
      root.style.webkitUserSelect = on ? '' : 'none';
    }

    // Polovina pásu = jeden Collection List včetně mezery za ním.
    function measure() {
      half = track.scrollWidth / 2;
    }

    function goal(now) {
      var pressed = active && axis !== 'y';
      return hovered || focused || pressed || now < holdUntil ? 0 : -SPEED;
    }

    function applyDrag() {
      x = originOffset + (lastX - originX);
    }

    function render() {
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
      if (axis === 'x') {
        // Poloha se zapisuje tady, jednou za snímek, ne v každém pohybu prstu.
        applyDrag();
      } else {
        // Hození dobíhá pomaleji a míří rovnou na cílovou rychlost,
        // takže pás mezi dojezdem a rozjezdem nezastaví.
        v += (target - v) * (1 - Math.exp(-(coasting ? FRICTION : EASE) * dt));
        x += v * dt;
        if (coasting && Math.abs(v - target) < 2) coasting = false;
      }
      render();

      var busy = active || coasting || now < holdUntil || Math.abs(v - target) > 0.5 || target !== 0;
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

    /* --- gesto: stisk, pohyb, puštění --------------------------------------- */

    // Klik přichází hned po puštění. Kdyby nepřišel, příští klik nesmí zmizet,
    // proto má potlačení i časový strop.
    function swallowClick(now) {
      suppressClick = true;
      suppressUntil = now + 300;
    }

    // Rychlost puštění: vážený průměr úseků z posledních VELOCITY_WINDOW ms,
    // novější úseky váží víc. Kdo před puštěním zastavil, nehodil.
    function releaseVelocity(now) {
      var n = samples.length;
      if (n < 2 || now - samples[n - 1].t > VELOCITY_WINDOW) return 0;
      var sum = 0;
      var weight = 0;
      for (var i = n - 1; i > 0; i--) {
        var age = now - samples[i].t;
        if (age > VELOCITY_WINDOW) break;
        var dt = samples[i].t - samples[i - 1].t;
        if (dt <= 0) continue;
        var w = dt * Math.exp(-age / (VELOCITY_WINDOW / 2));
        sum += ((samples[i].x - samples[i - 1].x) / dt) * 1000 * w;
        weight += w;
      }
      if (!weight) return 0;
      // Delší mezera mezi posledním pohybem a puštěním se počítá jako stání:
      // do 30 ms nic, pak rychlost plynule klesá k nule.
      var idle = now - samples[n - 1].t;
      var fade = idle <= 30 ? 1 : 1 - (idle - 30) / (VELOCITY_WINDOW - 30);
      var speed = (sum / weight) * fade;
      return Math.max(-MAX_FLING, Math.min(MAX_FLING, speed));
    }

    function press(kind, id, px, py) {
      if (active) return;
      active = true;
      source = kind;
      pointerId = id;
      axis = '';
      // Chycení dobíhajícího pásu ho zastaví hned.
      caught = coasting;
      if (coasting) v = 0;
      coasting = false;
      suppressClick = false;
      downX = lastX = px;
      downY = lastY = py;
      samples = [];
      if (kind !== 'touch') setSelectable(false);
      run();
    }

    // Vrací true, když gesto patří pásu (tah je zamčený vodorovně).
    function move(px, py) {
      if (!active) return false;
      lastX = px;
      lastY = py;

      if (!axis) {
        var dx = px - downX;
        var dy = py - downY;
        if (Math.abs(dx) < LOCK_THRESHOLD && Math.abs(dy) < LOCK_THRESHOLD) return false;
        // Zámek směru: do 45° od vodorovné je to tah pásu. Platí až do
        // puštění, ať prst pak ujede kamkoli.
        if (Math.abs(dx) < Math.abs(dy)) {
          axis = 'y';
          run();
          return false;
        }
        axis = 'x';
        originX = px;
        originOffset = x;
        samples = [{ t: clock(), x: px }];
        root.setAttribute('data-marquee-dragging', '');
        if (source !== 'touch') {
          // Zachycení: tah pokračuje, i když ukazatel vyjede z pásu.
          try {
            root.setPointerCapture(pointerId);
          } catch (err) {
            // Bez zachycení tah skončí na okraji pásu, nic dalšího se nestane.
          }
          // Při tahu nesmí reagovat karty pod ukazatelem (hover, cursor).
          track.style.pointerEvents = 'none';
          setCursor('grabbing');
        }
        run();
        return true;
      }
      if (axis !== 'x') return false;

      samples.push({ t: clock(), x: px });
      if (samples.length > 30) samples.shift();
      run();
      return true;
    }

    function release(fling) {
      if (!active) return;
      var now = clock();
      if (axis === 'x') {
        applyDrag();
        swallowClick(now);
        root.removeAttribute('data-marquee-dragging');
        if (source !== 'touch') {
          track.style.pointerEvents = '';
          setCursor('grab');
        }
        // Rychlost puštění si pás nese dál, nikdy neskočí na nulu.
        v = fling ? releaseVelocity(now) : 0;
        if (Math.abs(v) > FLING_MIN) {
          coasting = true;
        } else {
          holdUntil = now + RESUME_DELAY;
        }
      } else if (caught) {
        // Stisk jen zastavil dojezd: karta pod prstem se nemá otevřít.
        swallowClick(now);
        holdUntil = now + RESUME_DELAY;
      }
      if (source !== 'touch') setSelectable(true);
      // Tah myší mohl skončit mimo pás. Zachycený ukazatel pointerleave neposlal.
      if (source === 'mouse') {
        var box = root.getBoundingClientRect();
        hovered = lastX >= box.left && lastX <= box.right && lastY >= box.top && lastY <= box.bottom;
      }
      active = false;
      axis = '';
      caught = false;
      pointerId = null;
      samples = [];
      run();
    }

    /* --- myš a pero: Pointer Events ------------------------------------------ */

    // Dotyk má vlastní cestu přes Touch Events (viz hlavička). Kde je prohlížeč
    // nemá, jde i dotyk tudy.
    var touchEvents = 'ontouchstart' in window;
    function viaPointer(e) {
      return !(touchEvents && e.pointerType === 'touch');
    }

    root.addEventListener('pointerdown', function (e) {
      if (!viaPointer(e) || e.isPrimary === false) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      press(e.pointerType || 'mouse', e.pointerId, e.clientX, e.clientY);
    });

    root.addEventListener('pointermove', function (e) {
      if (!active || source === 'touch' || e.pointerId !== pointerId) return;
      // Puštění tlačítka se k nám nedostalo (kontextové menu, puštění mimo pás).
      if (e.pointerType === 'mouse' && e.buttons === 0) {
        release(false);
        return;
      }
      if (move(e.clientX, e.clientY) && e.cancelable) e.preventDefault();
    });

    // Na window: před zachycením ukazatele může puštění přijít mimo pás.
    window.addEventListener('pointerup', function (e) {
      if (!active || source === 'touch' || e.pointerId !== pointerId) return;
      lastX = e.clientX;
      lastY = e.clientY;
      release(true);
    });
    window.addEventListener('pointercancel', function (e) {
      if (active && source !== 'touch' && e.pointerId === pointerId) release(false);
    });
    // Jen ztráta zachycení na pásu, lostpointercapture z karet sem probublává.
    root.addEventListener('lostpointercapture', function (e) {
      if (active && source !== 'touch' && e.target === root && e.pointerId === pointerId && axis === 'x') {
        release(false);
      }
    });
    window.addEventListener('blur', function () {
      release(false);
    });

    /* --- dotyk: Touch Events ---------------------------------------------------- */

    function ourTouch(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].identifier === pointerId) return list[i];
      }
      return null;
    }

    root.addEventListener(
      'touchstart',
      function (e) {
        // Druhý prst: zoom nebo jiné gesto, tah končí.
        if (e.touches.length !== 1) {
          if (active && source === 'touch') release(false);
          return;
        }
        var t = e.touches[0];
        press('touch', t.identifier, t.clientX, t.clientY);
      },
      { passive: true }
    );

    // Nepasivní: preventDefault() u vodorovného tahu je jediný způsob, jak
    // iOS Safari zabránit, aby gesto předal scrollu stránky. Musí zaznít
    // hned u prvního pohybu, potom už scroll zrušit nejde.
    root.addEventListener(
      'touchmove',
      function (e) {
        if (!active || source !== 'touch') return;
        var t = ourTouch(e.touches);
        if (!t || e.touches.length !== 1) {
          release(false);
          return;
        }
        if (move(t.clientX, t.clientY) && e.cancelable) e.preventDefault();
      },
      { passive: false }
    );

    function touchEnd(e) {
      if (!active || source !== 'touch' || ourTouch(e.touches)) return;
      release(e.type === 'touchend');
    }
    root.addEventListener('touchend', touchEnd);
    root.addEventListener('touchcancel', touchEnd);

    /* --- klik a nativní přetahování ------------------------------------------ */

    // Po tahu se nesmí otevřít odkaz na kartě. Capture fáze, aby se klik
    // nedostal ani k měření v GTM.
    root.addEventListener(
      'click',
      function (e) {
        if (!suppressClick) return;
        suppressClick = false;
        if (clock() > suppressUntil) return;
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );

    // Obrázky a odkazy se nesmí chytat nativním přetahováním.
    root.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    /* --- rozměry a viditelnost ------------------------------------------------ */

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if ('ResizeObserver' in window) new window.ResizeObserver(measure).observe(track);

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
