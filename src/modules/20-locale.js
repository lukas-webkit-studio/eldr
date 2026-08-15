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

  function detectLangClass() {
    var url = window.location.href;
    if (url.indexOf('/de') !== -1) return 'lang-de';
    if (url.indexOf('/en') !== -1) return 'lang-en';
    return 'lang-cs';
  }

  onReady(function () {
    var langClass = detectLangClass();
    document.body.classList.add(langClass);

    if (!has(SEL.refLanguage)) return;

    var map = LABELS[langClass];
    var own = langClass.slice(5); // "lang-cs" -> "cs"

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
