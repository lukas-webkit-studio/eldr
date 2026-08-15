/* ==========================================================================
   Jazyk do skrytého pole formuláře
   Původně: inline v patičce stránky Kontakty
   Vyplní #jazyk podle atributu lang na <html>.
   ========================================================================== */

(function () {
  var ALLOWED = ['cs', 'en', 'de'];

  function detectLocale() {
    var lang = (document.documentElement.getAttribute('lang') || '').trim().toLowerCase();
    return ALLOWED.indexOf(lang) !== -1 ? lang : 'cs';
  }

  document.addEventListener('submit', function (e) {
    var form = e.target && e.target.closest('form');
    if (!form) return;
    var input = form.querySelector('#jazyk');
    if (input) input.value = detectLocale();
  }, true);
})();
