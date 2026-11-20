/* ==========================================================================
   Horní pruh s akcí — rotace zpráv, zavření, konec akce, odsazení (#62)
   ==========================================================================
   Vzhled, texty, překlady a odkaz jsou ve Webflow (komponenta
   Navbar_2024-12, třídy announcement_*). Tenhle modul dělá jen to,
   co Webflow neumí:

   Proč ne Webflow:
     - IX2 neumí zapamatovat zavření (sessionStorage) ani pruh po datu
       sám vypnout. Interakce navíc API nečte ani nezapisuje.
     - Rotace s pauzou při hoveru i fokusu z klávesnice je stav, který
       IX2 neudrží (timeline jde jen přehrát nebo pozastavit, ne „po
       zastavení pokračovat od zprávy, kde byla“).
     - Výška pruhu se mění podle délky textu a jazyka (na mobilu jeden
       nebo dva řádky). Odsazení obsahu pod fixním navbarem proto musí
       odpovídat změřené výšce, ne pevnému číslu. Po zavření nebo po
       konci akce musí spadnout na 0.
     - Odkaz typu „stránka“ s kotvou API nezapíše (kotvu tiše zahodí),
       viz níž.

   Markup (Webflow, první potomek .navbar_component):
     .announcement_component     data-announcement="zima-2026" (klíč kampaně)
                                 data-announcement-end="2026-12-31T23:59:59+01:00"
       a.announcement_link       odkaz na stránku Kontakty, data-gtm = hook pro GTM
         .announcement_messages  grid, všechny zprávy v jedné buňce
           p.announcement_text   ×N, bez JS je vidět jen první (:first-child)
         .announcement_cta
       button.announcement_close ve Webflow display: none, ukáže ho modul

   Chování:
     - zprávy se střídají po INTERVAL, přechod je prolnutí s krátkým
       posunem nahoru. Při hoveru myší a při fokusu uvnitř pruhu rotace
       stojí, ve skryté záložce taky. Hover se bere jen z myši a pera,
       dotyk posílá pointerenter bez pointerleave
     - prefers-reduced-motion: zprávy se střídají okamžitě, bez pohybu
       a bez prolnutí
     - křížek pruh skryje a do zavření prohlížeče (sessionStorage, klíč
       z data-announcement) se znovu neukáže. Fokus přejde na logo
     - po data-announcement-end se pruh neukáže (kontrola při načtení
       a při každém střídání zpráv). Datum jde změnit ve
       Webflow bez zásahu do kódu. Neplatné nebo chybějící datum = bez
       konce
     - body.style.paddingTop drží změřenou výšku pruhu, po skrytí 0.
       Ve Webflow má body padding-top 44 px (mobil 48 px) jako zálohu
       bez JS. Zdůvodnění v docs/decisions.md (20. 11. 2026)
     - k odkazu doplní #formular, pokud kotvu nemá. Webflow API u odkazu
       typu „stránka“ kotvu zahodí (ověřeno 20. 11. 2026 čtením zpět),
       odkaz na URL by se nepřepnul do /en a /de. V Designeru jde kotva
       nastavit (Page section). Kdo ji tam nastaví, tahle větev nic
       neudělá.

   Proč jsou opacity, transform a display zpráv tady, a ne na třídě:
   jsou to stavy rotace, mění se za běhu a bez JS mají platit hodnoty
   z Webflow (první zpráva vidět, ostatní skryté). Kombo třída
   přepínaná z JS by šla, ale třídu bez prvku v Designeru smaže úklid
   stylů.

   data-announcement-ready: pojistka proti dvojímu spuštění. Do nasazení
   workeru s tímhle bundlem běží stejný kód i z custom code webu
   (src/dev/announcement-bar.js); kdo je první, ten pruh řídí.
   ========================================================================== */

(function () {
  if (!has('.announcement_component')) return;

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

  onReady(function () {
    $$('.announcement_component').forEach(init);
  });
})();
