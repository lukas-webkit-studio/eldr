/* ==========================================================================
   Historie na stránce O nás — vodorovný swipe
   Původně: dva samostatné inline skripty v patičce stránky O nás.
   Sloučeno do jednoho posluchače: blokuje svislý scroll při vodorovném tahu
   a zároveň nechá zmizet Lottie animaci.
   ========================================================================== */

(function () {
  if (!has(SEL.historySlider)) return;

  var FADE_MS = 800;
  var LOTTIE_THRESHOLD = 30;

  onReady(function () {
    var slider = $1(SEL.historySlider);
    var lottie = $1(SEL.lottie);
    if (!slider) return;

    var startX = 0, startY = 0, horizontal = false, faded = false;

    function fadeOutLottie() {
      if (!lottie || faded) return;
      faded = true;
      lottie.style.transition = 'opacity ' + FADE_MS + 'ms linear';
      lottie.style.opacity = 0;
      setTimeout(function () { lottie.style.display = 'none'; }, FADE_MS);
    }

    slider.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      horizontal = false;
    }, { passive: true });

    slider.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if (Math.abs(dx) <= Math.abs(dy)) return;

      if (!horizontal) {
        e.preventDefault();  // zabrání svislému scrollu při vodorovném tahu
        horizontal = true;
      }
      if (Math.abs(dx) > LOTTIE_THRESHOLD) fadeOutLottie();
    });

    slider.addEventListener('touchend', function () { horizontal = false; }, { passive: true });
  });
})();
