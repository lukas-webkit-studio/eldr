/* ==========================================================================
   Výška galerie podle volby v CMS
   Původně: gallery-option.js
   Skrytý prvek #gallery-option nese textovou volbu z CMS.
   ========================================================================== */

(function () {
  onReady(function () {
    var option = document.getElementById('gallery-option');
    if (!option || option.textContent.trim() !== 'Vysoká fotogalerie') return;

    // Původní kód nastavoval výšku jen prvnímu nalezenému prvku od každého typu.
    [SEL.galleryCollection, SEL.sliderRoot].forEach(function (sel) {
      var el = $1(sel);
      if (el) el.style.height = '236px';
    });
  });
})();
