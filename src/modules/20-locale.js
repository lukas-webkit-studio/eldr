/* ==========================================================================
   Jazyk stránky a překladové popisky u referencí
   Původně: index.js
   ========================================================================== */

(function () {
  var LABELS = {
    'lang-cs': { de: 'Přeloženo z němčiny',            en: 'Přeloženo z angličtiny' },
    'lang-de': { cs: 'Aus dem Tschechischen übersetzt', en: 'Aus dem Englischen übersetzt' },
    'lang-en': { cs: 'Translated from Czech',           de: 'Translated from German' }
  };

  onReady(function () {
    var own = locale();               // sdílená detekce z jádra
    var langClass = 'lang-' + own;
    document.body.classList.add(langClass);

    if (!has(SEL.refLanguage)) return;

    var map = LABELS[langClass];

    $$(SEL.refLanguage).forEach(function (el) {
      var lang = el.textContent.trim().toLowerCase();
      if (lang === own) {
        el.style.display = 'none';
      } else if (map[lang]) {
        el.textContent = map[lang];
      }
    });
  });
})();
