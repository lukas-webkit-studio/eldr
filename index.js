// Adding class based on the lang of the current Localization
document.addEventListener('DOMContentLoaded', function() {
  const url = window.location.href;

  if (url.includes('/de')) {
    document.body.classList.add('lang-de');
  } else if (url.includes('/en')) {
    document.body.classList.add('lang-en');
  } else {
    document.body.classList.add('lang-cs'); // Default to Czech if no language is specified in the URL
  }
});
