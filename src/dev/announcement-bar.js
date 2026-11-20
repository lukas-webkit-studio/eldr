/* ==========================================================================
   Horní pruh s akcí — rotace zpráv, zavření, konec akce, odsazení
   (#62, dočasně ze Site settings → Custom code → Footer)
   ==========================================================================
   Dočasná kopie modulu src/modules/46-announcement-bar.js. Načítá se
   z patičky custom code celého webu, dokud Cloudflare worker (eldr-web)
   neservíruje bundle s tímto modulem. Po nasazení workeru řádek z custom
   code i tenhle soubor smazat.

   Popis chování, markup a zdůvodnění, proč to není ve Webflow, jsou
   v hlavičce modulu. Kód mezi "var INTERVAL" a koncem init() je s modulem
   shodný do znaku, hlídá to test/smoke.js. Upravuj vždy oba soubory.

   data-announcement-ready: pojistka proti dvojímu spuštění. Stejný kód je
   i v bundlu; kdo je první, ten pruh řídí.
   ========================================================================== */

(function () {
  'use strict';

  var INTERVAL = 5000; // ms, jak dlouho je vidět jedna zpráva
  var FADE = 400; // ms, délka přechodu mezi zprávami
  var SHIFT = 6; // px, posun zprávy při přechodu
  var HASH = 'formular'; // kotva formuláře na stránce Kontakty
  var STORAGE_PREFIX = 'eldr-announcement-closed:';

  function storageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key) {
    try {
      window.sessionStorage.setItem(key, '1');
    } catch (e) {
      /* privátní režim nebo zakázané úložiště: zavře se jen na téhle stránce */
    }
  }

  function expired(bar) {
    var end = Date.parse(bar.getAttribute('data-announcement-end') || '');
    return !isNaN(end) && Date.now() > end;
  }

  function init(bar) {
    if (bar.hasAttribute('data-announcement-ready')) return;
    bar.setAttribute('data-announcement-ready', '');

    var key = STORAGE_PREFIX + (bar.getAttribute('data-announcement') || 'default');
    var body = document.body;

    function hide() {
      bar.style.display = 'none';
      body.style.paddingTop = '0px';
      stop();
    }

    function sync() {
      if (bar.style.display === 'none') return;
      body.style.paddingTop = bar.offsetHeight + 'px';
    }

    if (expired(bar) || storageGet(key)) {
      hide();
      return;
    }

    /* --- odkaz ------------------------------------------------------------- */

    var link = bar.querySelector('.announcement_link');
    if (link) {
      var href = link.getAttribute('href') || '';
      if (href && href.indexOf('#') === -1) link.setAttribute('href', href + '#' + HASH);
    }

    /* --- rotace ------------------------------------------------------------ */

    var messages = Array.prototype.slice.call(bar.querySelectorAll('.announcement_text'));
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var timer = null;
    var hovered = false;
    var focused = false;

    function setState(el, on, animate) {
      var t = FADE + 'ms ease';
      el.style.transition = animate && !reduce
        ? 'opacity ' + t + ', transform ' + t + ', visibility 0s linear ' + (on ? '0s' : FADE + 'ms')
        : 'none';
      el.style.opacity = on ? '1' : '0';
      el.style.visibility = on ? 'visible' : 'hidden';
      el.style.transform = on || reduce ? 'none' : 'translateY(-' + SHIFT + 'px)';
      if (on) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
    }

    function show(next) {
      if (next === current) return;
      var prev = messages[current];
      var el = messages[next];
      // Nová zpráva přijíždí zespodu: bez přechodu ji postavit dolů,
      // vynutit layout a teprve pak spustit přechod do klidu.
      if (!reduce) {
        el.style.transition = 'none';
        el.style.transform = 'translateY(' + SHIFT + 'px)';
        void el.offsetWidth;
      }
      setState(prev, false, true);
      setState(el, true, true);
      current = next;
    }

    function paused() {
      return hovered || focused || document.hidden;
    }

    function stop() {
      if (timer) window.clearTimeout(timer);
      timer = null;
    }

    function schedule() {
      stop();
      if (messages.length < 2 || paused() || bar.style.display === 'none') return;
      timer = window.setTimeout(function () {
        // Záložka otevřená přes konec akce: pruh zmizí při příštím střídání.
        if (expired(bar)) return hide();
        show((current + 1) % messages.length);
        schedule();
      }, INTERVAL);
    }

    if (messages.length > 1) {
      // Všechny zprávy do jedné buňky gridu; výška pruhu = nejvyšší zpráva,
      // takže se při střídání nehýbe navigace ani obsah.
      messages.forEach(function (el, i) {
        el.style.display = 'block';
        setState(el, i === 0, false);
      });

      // Jen myš a pero: dotyk posílá pointerenter bez pointerleave
      // a rotace by po klepnutí bez přechodu zůstala stát.
      bar.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        hovered = true;
        stop();
      });
      bar.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch') return;
        hovered = false;
        schedule();
      });
      bar.addEventListener('focusin', function () {
        focused = true;
        stop();
      });
      bar.addEventListener('focusout', function (e) {
        if (e.relatedTarget && bar.contains(e.relatedTarget)) return;
        focused = false;
        schedule();
      });
      document.addEventListener('visibilitychange', schedule);
    }

    /* --- zavření ----------------------------------------------------------- */

    var close = bar.querySelector('.announcement_close');
    if (close) {
      close.style.display = 'flex';
      close.addEventListener('click', function () {
        storageSet(key);
        hide();
        var logo = document.querySelector('.navbar_logo-link');
        if (logo) logo.focus();
      });
    }

    /* --- odsazení obsahu --------------------------------------------------- */

    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    if ('ResizeObserver' in window) new window.ResizeObserver(sync).observe(bar);

    schedule();
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('.announcement_component'), init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
