/* ==========================================================================
   Rozbalení dlouhého textu ("Zobrazit více")
   Původně: inline v patičce stránky Reference (a mrtvý show-mode.js)
   ========================================================================== */

(function () {
  if (!has(SEL.longTextButton)) return;

  var MAX_MOBILE = 180;
  var COLLAPSED_MOBILE = '220px';
  var MAX_DESKTOP = 160;
  var COLLAPSED_DESKTOP = '160px';

  window.addEventListener('load', function () {
    var buttons = $$(SEL.longTextButton);
    var texts = $$(SEL.longText);
    var isMobile = window.innerWidth < 992;

    buttons.forEach(function (button, i) {
      var text = texts[i];
      if (!text) return;

      var height = text.offsetHeight;
      var overflows = isMobile ? height >= MAX_MOBILE : height > MAX_DESKTOP;

      if (!overflows) { button.style.display = 'none'; return; }

      text.style.height = isMobile ? COLLAPSED_MOBILE : COLLAPSED_DESKTOP;
      button.style.display = 'block';

      button.addEventListener('click', function () {
        text.style.height = 'auto';
        button.style.display = 'none';
      }, { once: true });
    });
  });
})();
