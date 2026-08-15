/* ==========================================================================
   Měření do Google Tag Manageru
   Původně: inline v patičce webu (Site settings → Custom code → Footer)

   POZOR: selektory níž jsou HOOK TŘÍDY. Ve Webflow zůstávají na prvcích jako
   prázdné třídy bez jediné CSS vlastnosti — vzhled řídí client-first třídy
   vedle nich. Neodstraňovat, dokud neproběhne audit containeru GTM-W6PR2VX.

   Dvě opravy proti původní verzi:
   1. Selektor formuláře byl `.Form__Type1`, ale Webflow ukládá názvy tříd
      malými písmeny, takže na stránce je `.form__type1`. querySelectorAll je
      case-sensitive → event contact_form_submit se nikdy neodpaloval.
   2. U produktových dlaždic se do dataLayer posílal DOM element
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
    // odeslání kontaktního formuláře
    on(SEL.gtmForm, 'submit', function () {
      push({ event: 'contact_form_submit' });
    });

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
