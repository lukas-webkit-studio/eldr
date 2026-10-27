/* ==========================================================================
   Nahrávání příloh ve formuláři
   Nativní Webflow File Upload (Kontakty, Produkty, /dev/kontakty-upload).
   Webflow nahrává soubory sám; tady jsou jen dvě věci, které neumí:

   1. Postupné odkrývání polí. Formulář má pět polí Příloha 1–5, pole 2–5
      mají kombo třídu `is-hidden`. Další pole se ukáže, až když je předchozí
      nahrané. Proč ne ve Webflow: podmínka „předchozí pole má soubor“ je
      stav za běhu (atribut data-value na inputu), IX2 ani třída ho nevidí.
   2. Chybové hlášky v EN a DE. Webflow je drží v atributech
      data-w-*-error. Atributy mají jednu hodnotu pro všechny jazyky a nejde
      je lokalizovat (viz CLAUDE.md). Na české stránce zůstává hodnota
      z Designeru, na /en a /de se přepíše podle jazyka stránky.

   Modul do repa vrácen 27. 10. 2026 (S1, #17) podle bundlu, který už běžel
   na webu — v repu do té doby chyběl.
   ========================================================================== */

(function () {
  var MESSAGES = {
    en: {
      size: 'Upload failed. The maximum file size is 10 MB.',
      type: 'Upload failed. This file type is not allowed.',
      generic: 'Upload failed. Please try again.'
    },
    de: {
      size: 'Hochladen fehlgeschlagen. Die Datei darf höchstens 10 MB groß sein.',
      type: 'Hochladen fehlgeschlagen. Dieser Dateityp ist nicht erlaubt.',
      generic: 'Hochladen fehlgeschlagen. Bitte versuchen Sie es erneut.'
    }
  };

  function hasFile(field) {
    var input = $1('input[type="file"]', field);
    return !!(input && input.getAttribute('data-value'));
  }

  /** Ukáže všechna nahraná pole a první prázdné, zbylá prázdná skryje. */
  function updateVisibility(fields) {
    var emptyShown = false;
    fields.forEach(function (field, i) {
      var show = hasFile(field) || !emptyShown;
      if (!hasFile(field)) emptyShown = true;
      if (i !== 0) field.style.display = show ? 'block' : 'none';
    });
  }

  function translateErrors(lang) {
    var msg = MESSAGES[lang];
    if (!msg) return;
    $$(SEL.formUploadError).forEach(function (el) {
      var map = {};
      map[el.getAttribute('data-w-size-error')] = msg.size;
      map[el.getAttribute('data-w-type-error')] = msg.type;
      map[el.getAttribute('data-w-generic-error')] = msg.generic;
      var apply = function () {
        var text = el.textContent.trim();
        if (map[text] && text !== map[text]) el.textContent = map[text];
      };
      apply();
      new MutationObserver(apply).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  onReady(function () {
    if (!has(SEL.formUpload)) return;
    translateErrors(locale());

    $$('form').forEach(function (form) {
      var fields = $$(SEL.formUpload, form);
      if (fields.length < 2) return;
      var update = function () { updateVisibility(fields); };
      fields.forEach(function (field) {
        var input = $1('input[type="file"]', field);
        if (input) new MutationObserver(update).observe(input, { attributes: true, attributeFilter: ['data-value'] });
      });
      update();
    });
  });
})();
