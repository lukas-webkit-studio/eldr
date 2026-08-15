/* ==========================================================================
   Jazyk do skrytého pole formuláře
   Původně: inline v patičce stránky Kontakty
   Vyplní #jazyk podle atributu lang na <html>.
   ========================================================================== */

(function () {
  document.addEventListener('submit', function (e) {
    var form = e.target && e.target.closest('form');
    if (!form) return;
    var input = form.querySelector('#jazyk');
    if (input) input.value = locale();   // sdílená detekce z jádra
  }, true);
})();
