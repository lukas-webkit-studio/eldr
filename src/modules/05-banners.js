/* ==========================================================================
   Bannery z CMS — vložení do článku bez ručního HTML
   --------------------------------------------------------------------------
   Dnešní stav: banner se do článku vlepuje jako escapovaný HTML do rich textu
   (`&lt;section class=&quot;banner-cta-big&quot;…`) a Finsweet
   `attributes-richtext` ho na klientovi rozbalí. Klient tím pádem edituje kód
   — přepisuje třídy, ručně lepí URL obrázků a kopíruje `w-node-…` id. Každý
   překlep je rozbitý banner a obrázky jdou bez srcset v plné velikosti.

   Nově je banner záznam v CMS kolekci Bannery. Šablona článku vykreslí CELOU
   kolekci do skrytého zdroje `[data-banner-source]` ve správné Webflow
   struktuře (živé třídy, responzivní srcset, alt texty) — funguje tedy jako
   knihovna. V kolekci Inspirace se nemění nic; klient jen napíše do textu
   `[banner:nazev]` a modul to vymění za hotový banner.

   Kontrakt se šablonou (podrobně v docs/bannery-cms.md):
     [data-banner-source]     skrytý wrapper s Collection Listem kolekce Bannery
     .banner-item             položka knihovny; její id = slug banneru
     .banner-name             skrytý text s Názvem — druhý klíč, aby klient
                              nemusel hlídat slug a mohl napsat „Pylony – velký"
     [data-banner-variant]    velký / malý provedení uvnitř položky

   Vložený banner dostane hookovou třídu `eldr-banner` a jeho předchůdce
   v článku `eldr-banner-before`. Na ně visí jediné dvě pravidla v
   src/eldr.css, která srovnávají mezeru kolem banneru — viz komentář tam.

   Proč id a skrytý text místo data atributů: Webflow Data API neumí na
   položce Collection Listu navázat custom atribut na CMS pole. Navázat jde
   DOM id a text, takže klíče jedou přes ně. Stejný důvod má i výběr varianty
   — podmíněná viditelnost přes API nejde nastavit na Option pole, takže
   šablona vykreslí obě provedení, Webflow to nepoužité označí
   `w-condition-invisible` (podle přepínače Velký banner) a vybere se tady.

   POŘADÍ V BUNDLU — proto 05, hned za jádrem:
   - před 10-vars → tokeny {#YOE#} se doplní i do vloženého banneru
   - před 90-gtm  → na tlačítko banneru stihne sednout měření button_click
     (dnes na něm neměří nic: Finsweet ho vykreslí až po DOMContentLoaded)
   ========================================================================== */

(function () {
  var SOURCE = '[data-banner-source]';
  var ITEM = '.banner-item';
  var NAME = '.banner-name';
  var VARIANT = '[data-banner-variant]';
  var RICH = '.w-richtext';
  var BANNER = 'eldr-banner';
  var BEFORE = 'eldr-banner-before';
  var BLOCKS = 'p, li, blockquote, h1, h2, h3, h4, h5, h6';

  /* `[banner:nazev]`. Mezery kolem dvojtečky se odpouštějí, diakritika
     a velikost písmen taky — klient píše do textového pole, ne do kódu.
     Název je nepovinný jen proto, aby se holé `[banner]` dalo z textu uklidit
     a nezůstalo na očích čtenáři. */
  var TOKEN = /\[banner\s*(?::\s*([^\]\r\n]+))?\]/gi;

  var source = $1(SOURCE);
  if (!source) return;

  /* Skrytí patří do Designeru (kdyby skript nedojel, nesmí se knihovna
     ukázat). Tady je jen pojistka, aby ji někdo ve Webflow omylem neodkryl. */
  source.style.display = 'none';

  function warn(message) {
    if (window.console && console.warn) console.warn('[ELDR bannery] ' + message);
  }

  /* „Pylony – velký", „pylony-velky" i „Pylony velky" musí vést na stejný
     banner. Bez toho by klient musel opisovat slug znak po znaku. */
  function key(value) {
    var text = (value || '').trim().toLowerCase();
    if (text.normalize) text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /* Webflow nechává v HTML i prvky schované podmíněnou viditelností
     (`w-condition-invisible`) a prvky s prázdným CMS polem
     (`w-dyn-bind-empty`) — typicky druhý obrázek, který se vyplňovat nemusí. */
  function isDropped(el) {
    return el.classList.contains('w-condition-invisible') ||
      el.classList.contains('w-dyn-bind-empty');
  }

  /* Klonuje se jen vybrané provedení, ne celá položka — ta nese obal
     Collection Listu a skrytý nosič názvu, co v článku nemá co dělat.
     V DOM je velký první, takže když ho přepínač nechá projít, vyhraje. */
  function build(item) {
    var chosen = $$(VARIANT, item).filter(function (el) { return !isDropped(el); })[0];
    if (!chosen) return null;

    var clone = chosen.cloneNode(true);
    clone.removeAttribute('data-banner-variant');
    clone.classList.add(BANNER);
    $$('.w-condition-invisible, .w-dyn-bind-empty', clone).forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    var frag = document.createDocumentFragment();
    frag.appendChild(clone);
    return frag;
  }

  /* Prázdný odstavec — klient odentroval navíc, nebo mu po smazání tokenu
     zbyl `<p><br></p>`. Vedle banneru by dělal mezeru navíc, tak jde pryč.
     Obrázek ani vložené video se za prázdné nepovažují. */
  function isBlank(el) {
    if (/\S/.test((el.textContent || '').replace(/\u00a0/g, ' '))) return false;
    return !el.querySelector('img, figure, iframe, video, svg, hr');
  }

  function dropBlanks(el, next) {
    while (el && el.nodeType === 1 && isBlank(el)) {
      var sibling = next ? el.nextElementSibling : el.previousElementSibling;
      el.parentNode.removeChild(el);
      el = sibling;
    }
    return el;
  }

  var library = {};

  $$(ITEM, source).forEach(function (item) {
    if (isDropped(item)) return;
    var named = $1(NAME, item);
    [item.id, named && named.textContent].forEach(function (name) {
      var k = key(name);
      if (k && !library[k]) library[k] = item;
    });
  });

  /* Token se z textu odstraňuje po textových uzlech, ne přes innerHTML —
     odkazy a tučný text uvnitř odstavce musí zůstat nedotčené. */
  function stripTokens(block) {
    var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach(function (text) {
      if (text.nodeValue.indexOf('[') === -1) return;
      TOKEN.lastIndex = 0;
      text.nodeValue = text.nodeValue.replace(TOKEN, '');
    });
  }

  function process(block, rich) {
    var text = block.textContent || '';
    if (text.indexOf('[') === -1) return;

    var frags = [];
    var match;

    TOKEN.lastIndex = 0;
    while ((match = TOKEN.exec(text))) {
      var name = key(match[1]);

      if (!name) {
        warn('v textu je [banner] bez názvu — nevím, který vložit');
        continue;
      }

      var item = library[name];
      if (!item) {
        warn('banner „' + name + '" v kolekci Bannery neexistuje nebo není publikovaný');
        continue;
      }

      var banner = build(item);
      if (banner) frags.push(banner);
    }

    /* Token mizí z textu vždycky. I když se banner nenajde, čtenář nesmí
       v článku vidět holé `[banner:…]`. */
    stripTokens(block);

    /* Banner smí být sourozenec odstavce, ne jeho obsah — <section> uvnitř
       <p> je neplatný HTML a prohlížeč by ho z odstavce stejně vystrčil.

       Vkládá se až za prvek, který je přímým potomkem rich textu. Když token
       stojí v odrážce, banner tím pádem vyjde za celý seznam, ne doprostřed
       něj — a hlavně je vždycky na stejné úrovni, takže na něj sedí pravidla
       pro mezeru z src/eldr.css. */
    var anchor = block;
    while (anchor.parentNode && anchor.parentNode !== rich) anchor = anchor.parentNode;
    if (!anchor.parentNode) return;

    var firstBanner = null;
    var lastBanner = null;

    frags.forEach(function (frag) {
      var last = frag.lastChild;
      anchor.parentNode.insertBefore(frag, anchor.nextSibling);
      anchor = last;
      lastBanner = last;
      if (!firstBanner) firstBanner = last;
    });

    /* Odstavec, ve kterém byl jen token, po úklidu zůstal prázdný. */
    if (!block.textContent.trim() && !block.children.length && block.parentNode) {
      var wrapper = block.parentNode;
      wrapper.removeChild(block);
      /* Odrážka s tokenem byla v seznamu sama — prázdný <ul> by v článku
         zůstal jako neviditelná mezera. */
      if (wrapper !== rich && !wrapper.children.length && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    }

    if (!firstBanner) return;

    /* Prázdné odstavce těsně kolem banneru pryč, ať klient nemusí hlídat,
       kolikrát odentroval. Označit souseda jde až potom — musí to být ten,
       co u banneru doopravdy zůstal. */
    dropBlanks(lastBanner.nextElementSibling, true);
    var before = dropBlanks(firstBanner.previousElementSibling, false);
    if (before && !before.classList.contains(BANNER)) before.classList.add(BEFORE);
  }

  onReady(function () {
    $$(RICH).forEach(function (rich) {
      if (source.contains(rich)) return;
      $$(BLOCKS, rich).forEach(function (block) { process(block, rich); });
    });
  });
})();
