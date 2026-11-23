/* ==========================================================================
   Horní pruh s akcí — rotace zpráv, zavření, konec akce, odsazení (#62)
   ==========================================================================
   Vzhled, texty, překlady a odkaz jsou ve Webflow (komponenta
   Navbar_2024-12, třídy announcement_*). Tenhle modul dělá jen to,
   co Webflow neumí:

   Proč ne Webflow:
     - IX2 neumí zapamatovat zavření (localStorage) ani pruh po datu
       sám vypnout. Interakce navíc API nečte ani nezapisuje.
     - Odjetí pruhu při scrollu (#66): navbar je fixed a pruh je jeho
       součástí. Posun o výšku pruhu závisí na tom, jestli pruh vůbec je
       (zavřený, po konci akce) a jak je vysoký (jazyk, šířka okna).
       Scroll interakce by posouvala o pevnou hodnotu i po zavření a uřízla
       by navigaci. Sticky místo fixed by znamenalo přestavět odsazení
       na všech stránkách (každá počítá s fixed navbarem jinak).
       Rozhodnutí v docs/decisions.md (20. 11. 2026, S12).
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
         .announcement_messages  grid, všechny zprávy v jedné buňce (≥ 768 px)
           p.announcement_text   ×N, bez JS je vidět jen první (:first-child)
         .announcement_messages.is-short  totéž kratšími texty, jen ≤ 767 px
                                 (obě sady rotují spolu, CSS ukáže jednu)
         .announcement_cta
       button.announcement_close ve Webflow display: none, ukáže ho modul

   Chování:
     - zprávy se střídají po INTERVAL, nová vyjede zespodu, stará odjede
       nahoru (návrh agentury). Při hoveru myší a při fokusu uvnitř pruhu rotace
       stojí, ve skryté záložce taky. Hover se bere jen z myši a pera,
       dotyk posílá pointerover bez pointerout
     - prefers-reduced-motion: zprávy se střídají okamžitě, bez pohybu
       a bez prolnutí
     - křížek pruh skryje a natrvalo se neukáže (localStorage, klíč
       z data-announcement; nová kampaň = nový klíč). Fokus přejde na logo
     - při scrollu dolů pruh odjede: navbar se posune nahoru o odscrollovanou
       vzdálenost, nejvýš o výšku pruhu (transform, bez CLS). Nahoře na
       stránce je pruh zpátky, uprostřed stránky se neukazuje
     - po data-announcement-end se pruh neukáže (kontrola při načtení
       a při každém střídání zpráv). Datum jde změnit ve
       Webflow bez zásahu do kódu. Neplatné nebo chybějící datum = bez
       konce
     - body.style.paddingTop drží změřenou výšku pruhu, po skrytí 0.
       Ve Webflow má body padding-top 44 px (mobil 77 px) jako zálohu
       bez JS. Zdůvodnění v docs/decisions.md (20. 11. 2026)
     - k odkazu doplní #formular, pokud kotvu nemá. Webflow API u odkazu
       typu „stránka“ kotvu zahodí (ověřeno 20. 11. 2026 čtením zpět),
       odkaz na URL by se nepřepnul do /en a /de. V Designeru jde kotva
       nastavit (Page section). Kdo ji tam nastaví, tahle větev nic
       neudělá.
     - měření (#69): před kotvu doplní ?pruh=<data-announcement>
       (/kontakty?pruh=zima-2026#formular). V GA4 je klik vidět
       v page_location i bez GTM. Proč ne Webflow: odkaz typu „stránka“
       parametr neumí a odkaz na URL se nepřepne do /en a /de (viz výš).
       Žádné UTM: na interním odkazu by přepsalo zdroj návštěvy.
     - klik (i prostředním tlačítkem) pushne do dataLayer
       { event: 'announcement_click', announcement, locale }. Webflow
       dataLayer neplní. Push je synchronní, klik neblokuje, bez GTM
       nic nespadne. Postup pro GTM a GA4 v docs/decisions.md (S13).

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
  // Přechod podle návrhu agentury (23. 11.): nová zpráva vyjede zespodu,
  // stará odjede nahoru. Posun v % výšky zprávy, pruh má overflow: hidden.
  var FADE = 450; // ms, prolnutí
  var MOVE = 500; // ms, posun
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var SHIFT = '70%'; // posun zprávy při přechodu
  var HASH = 'formular'; // kotva formuláře na stránce Kontakty
  var STORAGE_PREFIX = 'eldr-announcement-closed:';
  var PARAM = 'pruh'; // parametr v odkazu, měření v GA4 bez GTM (#69)
  var EVENT = 'announcement_click'; // událost do dataLayer pro GTM (#69)
  // Lukáš 21. 11.: pruh zůstává nahoře i při scrollu. false vrátí odjíždění z #66.
  var STICKY = true;
  // Jazyk stránky: lang na <html>, záložně první segment cesty. Vlastní
  // funkce, ne locale() z 00-core: dev kopie běží bez bundlu.
  function pageLocale() {
    var lang = (document.documentElement.getAttribute('lang') || '').trim().toLowerCase().slice(0, 2);
    if (lang === 'cs' || lang === 'en' || lang === 'de') return lang;
    var seg = window.location.pathname.split('/')[1];
    return seg === 'en' || seg === 'de' ? seg : 'cs';
  }

  // Push do dataLayer je synchronní a klik neblokuje. Bez GTM (blokovaný,
  // bez souhlasu) zůstane jen v poli, nic nespadne.
  function track(campaign) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: EVENT, announcement: campaign, locale: pageLocale() });
    } catch (e) {
      /* měření nesmí rozbít odkaz */
    }
  }

  // ?pruh=<kampaň> před kotvu, #formular, když kotva chybí. Existující
  // parametr nezdvojí, jen mu dá hodnotu aktuální kampaně. Odkaz jen
  // s kotvou (href="#", nenastavený cíl v locale) a mailto/tel nechá být:
  // jinak by klik znovu načetl stránku a zapsal falešné zobrazení.
  function linkHref(href, campaign) {
    if (href.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(href)) return href;
    var cut = href.indexOf('#');
    var path = cut === -1 ? href : href.slice(0, cut);
    var hash = cut === -1 ? '#' + HASH : href.slice(cut);
    var value = PARAM + '=' + encodeURIComponent(campaign);
    var re = new RegExp('([?&])' + PARAM + '=[^&]*');
    path = re.test(path) ? path.replace(re, '$1' + value) : path + (path.indexOf('?') === -1 ? '?' : '&') + value;
    return path + hash;
  }

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key) {
    try {
      window.localStorage.setItem(key, '1');
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

    var campaign = bar.getAttribute('data-announcement') || 'default';
    var key = STORAGE_PREFIX + campaign;
    var body = document.body;
    // Navbar (rodič pruhu) je fixed. Při scrollu se posouvá nahoru o výšku
    // pruhu, takže pruh odjede a navigace zůstane u horní hrany.
    var nav = bar.parentNode && bar.parentNode !== body ? bar.parentNode : null;
    var lifted = 0;
    var liftQueued = false;
    var focusInside = false;

    function hide() {
      bar.style.display = 'none';
      body.style.paddingTop = '0px';
      stop();
      lift();
    }

    function sync() {
      if (bar.style.display === 'none') return;
      body.style.paddingTop = bar.offsetHeight + 'px';
      lift();
    }

    // Posun navbaru: o tolik, kolik je odscrollováno, nejvýš o výšku pruhu.
    // Pruh tak odjíždí s obsahem a nahoře se zase ukáže. Uprostřed stránky
    // se při scrollu nahoru neukazuje. transform nehýbe layoutem (bez CLS).
    // Fokus z klávesnice uvnitř pruhu ho ukáže celý.
    function lift() {
      liftQueued = false;
      if (!nav) return;
      var y = STICKY || bar.style.display === 'none' || focusInside
        ? 0
        : Math.min(Math.max(window.pageYOffset || 0, 0), bar.offsetHeight);
      if (y === lifted) return;
      lifted = y;
      nav.style.transform = y ? 'translateY(-' + y + 'px)' : '';
    }

    function queueLift() {
      if (liftQueued) return;
      liftQueued = true;
      if (window.requestAnimationFrame) window.requestAnimationFrame(lift);
      else lift();
    }

    if (expired(bar) || storageGet(key)) {
      hide();
      return;
    }

    /* --- odkaz ------------------------------------------------------------- */

    var link = bar.querySelector('.announcement_link');
    if (link) {
      var href = link.getAttribute('href') || '';
      if (href) link.setAttribute('href', linkHref(href, campaign));
      // click i prostřední tlačítko (nová záložka). Ctrl/Cmd+klik je click.
      link.addEventListener('click', function () {
        track(campaign);
      });
      link.addEventListener('auxclick', function (e) {
        if (e.button === 1) track(campaign);
      });
    }

    /* --- rotace ------------------------------------------------------------ */

    // Sady zpráv: každá .announcement_messages je jedna (dlouhé texty,
    // krátké pro mobil). Ve Webflow je vidět vždy jen jedna sada, rotují
    // spolu, takže po změně šířky okna sedí stejná zpráva.
    var lists = Array.prototype.slice.call(bar.querySelectorAll('.announcement_messages')).map(function (box) {
      return Array.prototype.slice.call(box.querySelectorAll('.announcement_text'));
    });
    if (!lists.length) lists = [Array.prototype.slice.call(bar.querySelectorAll('.announcement_text'))];
    var count = Math.max.apply(null, lists.map(function (l) { return l.length; }));

    function each(i, fn) {
      lists.forEach(function (l) {
        if (l[i]) fn(l[i]);
      });
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var timer = null;
    var hovered = false;
    var focused = false;

    function setState(el, on, animate) {
      el.style.transition = animate && !reduce
        ? 'opacity ' + FADE + 'ms ease, transform ' + MOVE + 'ms ' + EASE + ', visibility 0s linear ' + (on ? '0s' : MOVE + 'ms')
        : 'none';
      el.style.opacity = on ? '1' : '0';
      el.style.visibility = on ? 'visible' : 'hidden';
      el.style.transform = on || reduce ? 'none' : 'translateY(-' + SHIFT + ')';
      if (on) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
    }

    function show(next) {
      if (next === current) return;
      var prev = current;
      // Nová zpráva přijíždí zespodu: bez přechodu ji postavit dolů,
      // vynutit layout a teprve pak spustit přechod do klidu.
      if (!reduce) {
        each(next, function (el) {
          el.style.transition = 'none';
          el.style.transform = 'translateY(' + SHIFT + ')';
          void el.offsetWidth;
        });
      }
      each(prev, function (el) { setState(el, false, true); });
      each(next, function (el) { setState(el, true, true); });
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
      if (count < 2 || paused() || bar.style.display === 'none') return;
      timer = window.setTimeout(function () {
        // Záložka otevřená přes konec akce: pruh zmizí při příštím střídání.
        if (expired(bar)) return hide();
        show((current + 1) % count);
        schedule();
      }, INTERVAL);
    }

    if (count > 1) {
      // Všechny zprávy do jedné buňky gridu; výška pruhu = nejvyšší zpráva,
      // takže se při střídání nehýbe navigace ani obsah.
      lists.forEach(function (l) {
        l.forEach(function (el, i) {
          el.style.display = 'block';
          setState(el, i === 0, false);
        });
      });

      // pointerover/pointerout, ne pointerenter/pointerleave: když kurzor
      // stojí nad pruhem už při načtení, Chromium enter nepošle (ověřeno na
      // stagingu 20. 11. 2026), over ano. Jen myš a pero: dotyk posílá
      // over bez out a rotace by po klepnutí zůstala stát.
      bar.addEventListener('pointerover', function (e) {
        if (e.pointerType === 'touch') return;
        hovered = true;
        stop();
      });
      bar.addEventListener('pointerout', function (e) {
        if (e.pointerType === 'touch') return;
        if (e.relatedTarget && bar.contains(e.relatedTarget)) return;
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

    // Fokus kvůli posunu navbaru: pruh mimo obrazovku nesmí držet fokus.
    bar.addEventListener('focusin', function () {
      focusInside = true;
      lift();
    });
    bar.addEventListener('focusout', function (e) {
      if (e.relatedTarget && bar.contains(e.relatedTarget)) return;
      focusInside = false;
      lift();
    });

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
    if (!STICKY) window.addEventListener('scroll', queueLift, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    if ('ResizeObserver' in window) new window.ResizeObserver(sync).observe(bar);

    schedule();
  }

  onReady(function () {
    $$('.announcement_component').forEach(init);
  });
})();
