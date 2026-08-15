/* ==========================================================================
   Měření do Google Tag Manageru
   Původně: inline v patičce webu (Site settings → Custom code → Footer)

   POZOR: selektory níž jsou HOOK TŘÍDY. Ve Webflow zůstávají na prvcích jako
   prázdné třídy bez jediné CSS vlastnosti — vzhled řídí client-first třídy
   vedle nich. Neodstraňovat, dokud neproběhne audit containeru GTM-W6PR2VX.

   POZOR — formulář zde ZÁMĚRNĚ NENÍ.
   Původní blok cílil na `.Form__Type1`; Webflow ale ukládá názvy tříd malými
   písmeny, takže na stránce je `.form__type1` a selektor nikdy nic nenašel.
   Konverzi contact_form_submit ve skutečnosti odpaluje jiný, funkční skript
   navázaný na #form-kontakt (stránky Kontakty a Produkty). Kdyby se selektor
   zde "opravil", event by se počítal dvakrát. Necháváme měření na #form-kontakt.

   Oprava proti původní verzi:
   U produktových dlaždic se do dataLayer posílal DOM element
   (querySelector('h2')) místo textu. Nyní se posílá text.
   ========================================================================== */

(function () {
  function push(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function text(el) {
    return el ? (el.textContent || '').trim() : '';
  }

  function on(selector, type, handler) {
    $$(selector).forEach(function (el) { el.addEventListener(type, handler); });
  }

  onReady(function () {
    // klik v navigaci
    on(SEL.gtmNavLink, 'click', function () {
      push({ event: 'menu_click', button_text: text(this) });
    });

    // klik na primární tlačítko
    on(SEL.gtmButton, 'click', function () {
      var section = this.closest('section');
      push({
        event: 'button_click',
        button_text: text(this),
        section: (section && section.id) || 'Sekce bez názvu'
      });
    });

    // produktové dlaždice na Domovské stránce
    on(SEL.gtmTopProduct, 'click', function () {
      push({
        event: 'button_click',
        button_text: text(this.querySelector('h2')),
        section: 'Home page'
      });
    });

    // dlaždice v menu na stránce Naše výrobky
    on(SEL.gtmMenuProduct, 'click', function () {
      push({
        event: 'button_click',
        button_text: text(this.querySelector('h5')),
        section: 'Naše výrobky'
      });
    });
  });
})();
