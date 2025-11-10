document.addEventListener("DOMContentLoaded", function() {
  // Vyhledáme skrytý element podle jeho id (např. "gallery-option")
  var galleryOption = document.getElementById("gallery-option");
  
  if (galleryOption) {
    // Získáme textový obsah a odstraníme případné mezery
    var optionText = galleryOption.textContent.trim();
    
    // Pokud je vybraná možnost "Vysoká galerie", upravíme výšku slideru
    if (optionText === "Vysoká fotogalerie") {
      var sliderCollection = document.querySelector(".imageslider__collection");
      if (sliderCollection) {
        sliderCollection.style.height = "236px";
      }
      var sliderCollection = document.querySelector(".slider");
      if (sliderCollection) {
        sliderCollection.style.height = "236px";
      }
    }
    // Pokud je hodnota "Default" nebo jiná, neděláme nic
  }
});
