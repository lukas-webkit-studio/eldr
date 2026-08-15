/* ==========================================================================
   Rozbalení dlouhého textu ("Zobrazit více")
   Původně: inline v patičce stránky Reference (a mrtvý show-mode.js)
   ========================================================================== */

(function () {
  if (!has(SEL.longTextButton)) return;

  /* ==== FUNKCE JE DOČASNĚ VYPNUTÁ =========================================
     Kód zůstává, jen se nespouští. Zapne se přepnutím ENABLED na true.

     Než se zapne, je potřeba srovnat prahy na mobilu: tlačítko se ukazovalo
     už při výšce >= MAX_MOBILE (180 px), ale text se sbalil na
     COLLAPSED_MOBILE (220 px). Text vysoký třeba 190 px tedy dostal
     tlačítko, které nic neskrývalo — klik neudělal nic viditelného.
     Na desktopu jsou prahy shodné (160/160) a chová se to správně.

     Při vypnuté funkci se tlačítka schovají, aby na stránce nezůstal
     ovládací prvek bez funkce, a text se nechá v přirozené výšce. */
  var ENABLED = false;

  var MAX_MOBILE = 180;
  var COLLAPSED_MOBILE = '220px';
  var MAX_DESKTOP = 160;
  var COLLAPSED_DESKTOP = '160px';

  if (!ENABLED) {
    onReady(function () {
      $$(SEL.longTextButton).forEach(function (b) { b.style.display = 'none'; });
      $$(SEL.longText).forEach(function (t) { t.style.height = 'auto'; });
    });
    return;
  }

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
