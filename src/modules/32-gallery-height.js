/* ==========================================================================
   Výška galerie podle volby v CMS
   Původně: gallery-option.js
   Skrytý prvek #gallery-option nese textovou volbu z CMS.
   ========================================================================== */

(function () {
  var HEIGHT = '236px';

  onReady(function () {
    var option = document.getElementById('gallery-option');
    if (!option || option.textContent.trim() !== 'Vysoká fotogalerie') return;

    /* Volba z CMS platí pro celou stránku, takže se výška nastaví všem
       galeriím na ní. Původní kód i jeho náhrada používaly $1(), což vrací
       jen první nalezený prvek — komentář u toho tvrdil, že se to opravilo,
       ale neopravilo. Na stránce s druhou galerií by ta druhá zůstala nízká. */
    [SEL.galleryCollection, SEL.sliderRoot].forEach(function (sel) {
      $$(sel).forEach(function (el) { el.style.height = HEIGHT; });
    });
  });
})();
