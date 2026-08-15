/* ==========================================================================
   Historie na stránce O nás — ovládání slideru
   Původně: dva samostatné inline skripty v patičce stránky O nás.
   --------------------------------------------------------------------------
   Slider je nativní Webflow (.w-slider, 10 slidů, data-hide-arrows="true",
   data-infinite="false"). Vzhled ani animaci nesaháme — přechody dál dělá
   Webflow. Přidává se jen ovládání, protože skryté šipky znamenají, že se
   slider dal posunout prakticky jen tahem prstu:

   1. Klávesnice — šipky vlevo/vpravo, Home/End na první a poslední slide.
      Slider je nově dosažitelný tabem, takže se dá projít i bez myši.
   2. Trackpad / kolečko — vodorovné gesto listuje. Svislé se nechává
      stránce, aby se scroll nekradl.
   3. Tah prstem — směr se rozhodne jednou na začátku gesta a pak drží.
      Původní kód volal preventDefault() jen na prvním snímku tahu
      (bylo pod `if (!horizontal)`), takže svislý scroll se mohl uprostřed
      vodorovného tahu znovu chytit a slider „ujel".

   Posun se dělá klikem na Webflow šipky, které v DOMu existují a jsou jen
   vizuálně schované. Díky tomu zůstává veškerý stav slideru (aktivní tečka,
   dojezd na konci, směr animace) na Webflow a nemůže se rozejít.

   Lottie animace mizí při prvním posunu jakýmkoliv způsobem, ne jen tahem.
   ========================================================================== */

(function () {
  if (!has(SEL.historySlider)) return;

  var FADE_MS = 800;
  var LOTTIE_THRESHOLD = 30;   // px tahu, po kterých Lottie mizí
  var AXIS_LOCK = 8;           // px, než se rozhodne o směru gesta
  var WHEEL_COOLDOWN = 350;    // ms mezi listováním kolečkem

  var LABELS = {
    cs: 'Historie vývoje firmy',
    en: 'Company history',
    de: 'Geschichte des Unternehmens'
  };

  onReady(function () {
    var slider = $1(SEL.historySlider);
    if (!slider) return;

    var lottie = $1(SEL.lottie);
    var prevArrow = $1('.w-slider-arrow-left', slider);
    var nextArrow = $1('.w-slider-arrow-right', slider);
    var dots = $$('.w-slider-dot', slider);

    /* --- Lottie ---------------------------------------------------------- */

    var faded = false;
    function fadeOutLottie() {
      if (!lottie || faded) return;
      faded = true;
      lottie.style.transition = 'opacity ' + FADE_MS + 'ms linear';
      lottie.style.opacity = 0;
      setTimeout(function () { lottie.style.display = 'none'; }, FADE_MS);
    }

    /* --- posun ----------------------------------------------------------- */

    function go(direction) {
      var arrow = direction > 0 ? nextArrow : prevArrow;
      if (!arrow) return;
      arrow.click();
      fadeOutLottie();
    }

    function goToEdge(last) {
      var dot = dots[last ? dots.length - 1 : 0];
      if (!dot) return;
      dot.click();
      fadeOutLottie();
    }

    /* --- klávesnice ------------------------------------------------------ */

    if (!slider.hasAttribute('tabindex')) slider.setAttribute('tabindex', '0');
    slider.setAttribute('aria-roledescription', 'carousel');
    if (!slider.getAttribute('aria-label')) {
      slider.setAttribute('aria-label', LABELS[locale()] || LABELS.cs);
    }

    slider.addEventListener('keydown', function (e) {
      var handled = true;
      switch (e.key) {
        case 'ArrowRight': go(1); break;
        case 'ArrowLeft':  go(-1); break;
        case 'Home':       goToEdge(false); break;
        case 'End':        goToEdge(true); break;
        default:           handled = false;
      }
      if (handled) e.preventDefault();
    });

    /* --- trackpad a kolečko ---------------------------------------------- */

    var lastWheel = 0;
    slider.addEventListener('wheel', function (e) {
      // Svislé rolování patří stránce — nesaháme na něj.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      e.preventDefault();
      var now = new Date().getTime();
      if (now - lastWheel < WHEEL_COOLDOWN) return;   // setrvačnost trackpadu
      lastWheel = now;
      go(e.deltaX > 0 ? 1 : -1);
    }, { passive: false });

    /* --- tah prstem ------------------------------------------------------ */

    var startX = 0, startY = 0, axis = null;   // null | 'x' | 'y'

    slider.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      axis = null;
    }, { passive: true });

    slider.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;

      if (axis === null) {
        // Dokud je gesto kratší než práh, ještě nevíme, kam míří.
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }

      if (axis !== 'x') return;   // svislý tah necháme stránce
      e.preventDefault();         // vodorovný blokujeme po CELÝ tah
      if (Math.abs(dx) > LOTTIE_THRESHOLD) fadeOutLottie();
    }, { passive: false });

    slider.addEventListener('touchend', function () { axis = null; }, { passive: true });
    slider.addEventListener('touchcancel', function () { axis = null; }, { passive: true });
  });
})();
