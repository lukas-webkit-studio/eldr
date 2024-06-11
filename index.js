document.addEventListener('DOMContentLoaded', function() {
  const url = window.location.href;

  if (url.includes('/de')) {
    document.body.classList.add('lang-de');
  } else if (url.includes('/en')) {
    document.body.classList.add('lang-en');
  } else {
    document.body.classList.add('lang-cs'); // Default to Czech if no language is specified in the URL
  }

  // Function to update the language text based on the body class
  function updateLanguageText() {
    const languageElements = document.querySelectorAll('.SectionReference__Collection__Item__Language');
    languageElements.forEach(function(element) {
      const languageText = element.textContent.trim().toLowerCase();
      const bodyClass = document.body.classList;

      if (bodyClass.contains('lang-cs')) {
        if (languageText === 'cs') {
          element.style.display = 'none';
        } else if (languageText === 'de') {
          element.textContent = 'Přeloženo z němčiny';
        } else if (languageText === 'en') {
          element.textContent = 'Přeloženo z angličtiny';
        }
      } else if (bodyClass.contains('lang-de')) {
        if (languageText === 'de') {
          element.style.display = 'none';
        } else if (languageText === 'cs') {
          element.textContent = 'Aus dem Tschechischen übersetzt';
        } else if (languageText === 'en') {
          element.textContent = 'Aus dem Englischen übersetzt';
        }
      } else if (bodyClass.contains('lang-en')) {
        if (languageText === 'en') {
          element.style.display = 'none';
        } else if (languageText === 'cs') {
          element.textContent = 'Translated from Czech';
        } else if (languageText === 'de') {
          element.textContent = 'Translated from German';
        }
      }
    });
  }

  updateLanguageText();
});
