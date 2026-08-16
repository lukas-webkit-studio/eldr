/* ==========================================================================
   Zámek scrollu — popup, mobilní menu, Webflow nav overlay
   Původně: sliders.js
   ========================================================================== */

(function () {
  /* Video modal je tu nově. Dřív se při jeho otevření stránka pod ním dál
     rolovala, zatímco popupy galerie zamykaly — nekonzistence. */
  var WATCHED = SEL.popup + ', ' + SEL.navOverlay + ', ' + SEL.wfNavOverlay +
                ', ' + SEL.videoWrapper;

  function isOpen(el) {
    var d = getComputedStyle(el).display;
    return d === 'flex' || d === 'block';
  }

  function update() {
    var locked = $$(WATCHED).some(isOpen);
    document.body.classList.toggle('no-scroll', locked);

    /* Odemknutí musí inline styl SMAZAT, ne nastavit na 'auto'.
       `overflow: auto` je shorthand — přepsalo by i osu X, a tím i
       `body { overflow-x: hidden }` z eldr.css. Protože update() běží hned
       při inicializaci, dělo se to na každé stránce s popupem (60 z 87)
       ještě předtím, než návštěvník cokoliv otevřel. */
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  /** Barva prohlížečové lišty — tmavá při otevřeném popupu. */
  window.eldrSetThemeColor = function (dark) {
    var meta = $1('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#272727' : '#fcfcfc');
  };

  onReady(function () {
    var targets = $$(WATCHED);
    if (!targets.length) return;

    var observer = new MutationObserver(update);
    targets.forEach(function (el) { observer.observe(el, { attributes: true }); });
    update();
  });
})();
