/* ==========================================================================
   Bannery z CMS — vložení do článku bez ručního HTML
   --------------------------------------------------------------------------
   Dnešní stav: banner se do článku vlepuje jako escapovaný HTML do rich textu
   (`&lt;section class=&quot;banner-cta-big&quot;…`) a Finsweet
   `attributes-richtext` ho na klientovi rozbalí. Klient tím pádem edituje kód
   — přepisuje třídy, ručně lepí URL obrázků a kopíruje `w-node-…` id. Každý
   překlep je rozbitý banner a obrázky jdou bez srcset v plné velikosti.

   Nově je banner záznam v CMS kolekci Bannery. Šablona článku ho vykreslí do
   skrytého zdroje `[data-banner-source]` ve správné Webflow struktuře (živé
   třídy, responzivní srcset, alt texty). V textu článku zůstane jen zástupný
   odstavec `[banner:nazev]`, který tenhle modul vymění za hotový banner.

   Kontrakt se šablonou (podrobně v docs/bannery-cms.md):
     [data-banner-source]    skrytý wrapper s Collection Listem kolekce Bannery
     [data-banner="slug"]    položka seznamu, uvnitř hotová struktura banneru
     [data-banner-fallback]  volitelné místo pro banner, na který se v textu
                             zapomnělo (bez něj se takový banner nevykreslí)

   POŘADÍ V BUNDLU — proto 05, hned za jádrem:
   - před 10-vars → tokeny {#YOE#} se doplní i do vloženého banneru
   - před 90-gtm  → na tlačítko banneru stihne sednout měření button_click
     (dnes na něm neměří nic: Finsweet ho vykreslí až po DOMContentLoaded)
   ========================================================================== */

(function () {
  var SOURCE = '[data-banner-source]';
  var FALLBACK = '[data-banner-fallback]';
  var ITEM = '[data-banner]';
  var RICH = '.w-richtext';

  /* `[banner:nazev-banneru]`, nebo holé `[banner]` = vezmi další v pořadí,
     jak jsou vybrané v CMS. Mezery kolem dvojtečky se odpouštějí, velikost
     písmen taky — klient píše do textového pole, ne do kódu. */
  var TOKEN = /^\[banner(?:\s*:\s*([^\]]+))?\]$/i;

  var source = $1(SOURCE);
  if (!source) return;

  /* Skrytí patří do Designeru (kdyby skript nedojel, nesmí se zdroj ukázat).
     Tady je jen pojistka proti tomu, aby ho někdo ve Webflow omylem odkryl. */
  source.style.display = 'none';

  function warn(message) {
    if (window.console && console.warn) console.warn('[ELDR bannery] ' + message);
  }

  /* Webflow nechává v HTML i prvky schované podmíněnou viditelností
     (`w-condition-invisible`) a prvky s prázdným CMS polem
     (`w-dyn-bind-empty`) — typicky druhý obrázek, který se vyplňovat nemusí. */
  function isDropped(el) {
    return el.classList.contains('w-condition-invisible') ||
      el.classList.contains('w-dyn-bind-empty');
  }

  /* Klonuje se OBSAH položky, ne položka samotná — ta nese `w-dyn-item`
     a `role="listitem"`, co v článku nemá co dělat. */
  function build(item) {
    var frag = document.createDocumentFragment();

    Array.prototype.slice.call(item.children).forEach(function (child) {
      if (isDropped(child)) return;
      var clone = child.cloneNode(true);
      $$('.w-condition-invisible, .w-dyn-bind-empty', clone).forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      frag.appendChild(clone);
    });

    return frag.childNodes.length ? frag : null;
  }

  var items = $$(ITEM, source).filter(function (item) { return !isDropped(item); });
  var used = [];

  function slugOf(item) {
    return (item.getAttribute('data-banner') || '').trim().toLowerCase();
  }

  function take(name) {
    var i;
    if (name) {
      for (i = 0; i < items.length; i++) {
        if (slugOf(items[i]) === name) return items[i];
      }
      return null;
    }
    for (i = 0; i < items.length; i++) {
      if (used.indexOf(items[i]) === -1) return items[i];
    }
    return null;
  }

  /* Zástupný odstavec musí být v odstavci sám. Banner je <section>, uvnitř
     <p> by byl neplatný HTML a prohlížeč by ho z odstavce stejně vystrčil. */
  function placeholders() {
    var found = [];
    $$(RICH).forEach(function (rich) {
      if (source.contains(rich)) return;
      $$('p', rich).forEach(function (p) {
        var match = TOKEN.exec((p.textContent || '').trim());
        if (match) found.push({ el: p, name: (match[1] || '').trim().toLowerCase() });
      });
    });
    return found;
  }

  onReady(function () {
    placeholders().forEach(function (slot) {
      var item = take(slot.name);
      var banner = item && build(item);

      if (banner) {
        slot.el.parentNode.insertBefore(banner, slot.el);
        if (used.indexOf(item) === -1) used.push(item);
      } else if (slot.name) {
        warn('banner „' + slot.name + '" v článku není vybraný nebo v CMS neexistuje');
      } else {
        warn('v textu je [banner] navíc — v CMS už žádný další nezbyl');
      }

      /* Zástupný odstavec mizí vždycky. I když se banner nenajde, čtenář
         nesmí v textu vidět holé `[banner:…]`. */
      slot.el.parentNode.removeChild(slot.el);
    });

    /* Banner vybraný v CMS, na který se v textu zapomnělo. Bez záchytného
       místa by tiše zmizel a nikdo by si toho nevšiml. */
    var fallback = $1(FALLBACK);
    if (!fallback) return;

    items.forEach(function (item) {
      if (used.indexOf(item) !== -1) return;
      var banner = build(item);
      if (!banner) return;
      warn('banner „' + slugOf(item) + '" nemá v textu [banner:…], vykreslil se na náhradní místo');
      fallback.appendChild(banner);
    });
  });
})();
