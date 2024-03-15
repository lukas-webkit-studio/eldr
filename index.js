// REFERENCE – Text přeloženo z
document.addEventListener("DOMContentLoaded", function() {

  var testimonialLanguages = document.querySelectorAll(".collection_item.reference.text.originallanguage");
  
    testimonialLanguages.forEach(function(item) {
      var language = item.textContent.trim();
  
      if (language === "") {
        // Do nothing if the text is empty
        return;
      }
  
      // Translate language code to full name and set text
      switch (language) {
        case "en":
          item.textContent = "Přeloženo z angličtiny";
          break;
        case "cs":
          item.textContent = "Přeloženo z češtiny";
          break;
        case "de":
          item.textContent = "Přeloženo z němčiny";
          break;
        case "fr":
          item.textContent = "Přeloženo z francouzštiny";
          break;
        default:
          console.error('Unknown language: ' + language);
      }
  
      // Add class
      item.classList.add('language-' + language);
    });
  });
