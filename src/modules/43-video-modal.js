/* ==========================================================================
   Vimeo modal
   Původně: inline v patičce Domovské stránky
   Jazyk videa se řídí URL, jinak čeština.
   ========================================================================== */

(function () {
  var VIDEOS = {
    cs: 'https://player.vimeo.com/video/899657075',
    en: 'https://player.vimeo.com/video/950910184',
    de: 'https://player.vimeo.com/video/950909097'
  };

  function detectLocale() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('/en') !== -1) return 'en';
    if (path.indexOf('/de') !== -1) return 'de';
    return 'cs';
  }

  onReady(function () {
    var wrapper = $1(SEL.videoWrapper);
    var backdrop = $1(SEL.videoBackdrop);
    var closeBtn = $1(SEL.videoClose);
    var trigger = $1(SEL.videoTrigger);
    var modalFrame = $1('#vimeo-player');
    var inlineFrame = $1('#vimeo-player-tablet-mobile');

    if (!wrapper && !inlineFrame) return;

    var locale = detectLocale();
    if (inlineFrame) inlineFrame.src = VIDEOS[locale] + '?autoplay=0';

    function open() {
      if (modalFrame) modalFrame.src = VIDEOS[locale] + '?autoplay=1';
      if (wrapper) wrapper.style.display = 'flex';
    }

    function close() {
      if (wrapper) wrapper.style.display = 'none';
      if (modalFrame) modalFrame.src = '';
    }

    if (trigger && wrapper && modalFrame) trigger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });
})();
