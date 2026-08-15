/* ==========================================================================
   Záložky na Domovské stránce
   Původně: inline v patičce Domovské stránky
   Desktop: automatické přepínání + přepnutí při najetí myší. Mobil: nic.
   ========================================================================== */

(function () {
  if (!has(SEL.tabLink)) return;

  var INTERVAL = 2000;
  var mq = window.matchMedia('(max-width: 991px)');
  var timer = null;
  var auto = true;

  function links() { return $$(SEL.tabLink); }
  function images() { return $$(SEL.tabImage); }

  function activate(index) {
    $$('.active').forEach(function (el) { el.classList.remove('active'); });
    var l = links()[index];
    var i = images()[index];
    if (l) l.classList.add('active');
    if (i) i.classList.add('active');
  }

  function scheduleNext(current) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var next = (current + 1) % links().length;
      activate(next);
      if (auto) scheduleNext(next);
    }, INTERVAL);
  }

  function stop() {
    clearTimeout(timer);
    links().forEach(function (el) { el.classList.remove('active'); });
  }

  onReady(function () {
    if (mq.matches) { auto = false; stop(); } else { scheduleNext(0); }

    window.addEventListener('resize', function () {
      if (mq.matches) { auto = false; clearTimeout(timer); }
      else if (!auto) { auto = true; scheduleNext(0); }
    });

    links().forEach(function (link, index) {
      link.addEventListener('mouseenter', function () {
        if (mq.matches) return;
        activate(index);
        clearTimeout(timer);
        auto = false;
      });
      link.addEventListener('mouseleave', function () {
        if (mq.matches) return;
        auto = true;
        scheduleNext(index);
      });
    });
  });
})();
