/* ==========================================================================
   Zámek scrollu — popup, mobilní menu, Webflow nav overlay
   Původně: sliders.js
   ========================================================================== */

(function () {
  var WATCHED = SEL.popup + ', ' + SEL.navOverlay + ', ' + SEL.wfNavOverlay;

  function isOpen(el) {
    var d = getComputedStyle(el).display;
    return d === 'flex' || d === 'block';
  }

  function update() {
    var locked = $$(WATCHED).some(isOpen);
    document.body.classList.toggle('no-scroll', locked);
    document.body.style.overflow = locked ? 'hidden' : 'auto';
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
