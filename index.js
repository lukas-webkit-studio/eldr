// Show more
const btn = document.querySelectorAll(".longtext__button");
const text = document.querySelectorAll(".longtext");
// Visibility
window.onload = function() {
    if ($(window).width() < 992) {
    btn.forEach(function (button, index) {      
        if ((text[index].offsetHeight) >= 180) {
        text[index].style.height = "220px";
        button.style.display = "block";
        } else {
        button.style.display = "none";
        }
    });
    };
};
// Action (click)
btn.onclick = function(button) { 
const index = Array.indexOf(button, btn)
    text[index].style.height = "auto";
button.style.display = "none";
};
btn.forEach( ( button, index ) =>
{
    button.addEventListener("click", () =>
    {
        button.style.display = "none";
        text[index].style.height = "auto";
    });
});

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


  // O NÁS – Zabránění horizontálního scrollování v sekci Naše historie
  document.addEventListener("DOMContentLoaded", function () {
    var slider = document.querySelector('.slider--history'); // Replace with your slider class
    var startX, startY, distX, distY;
    var isSwipingHorizontally = false;
    var threshold = 0; // Minimum distance for swipe
  
    slider.addEventListener('touchstart', function (e) {
      var touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isSwipingHorizontally = false;
    });
  
    slider.addEventListener('touchmove', function (e) {
      if (!isSwipingHorizontally) {
        var touch = e.touches[0];
        distX = touch.clientX - startX;
        distY = touch.clientY - startY;
  
        if (Math.abs(distX) > threshold && Math.abs(distX) > Math.abs(distY)) {
          // Horizontal swipe detected, prevent vertical scroll
          e.preventDefault();
          isSwipingHorizontally = true;
        }
      }
    });
  
    slider.addEventListener('touchend', function () {
      isSwipingHorizontally = false;
    });
  });