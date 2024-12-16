// SHOW MORE SCRIPT

// Load Elements
const btn = document.querySelectorAll(".longtext__button");
const text = document.querySelectorAll(".longtext");

// Ensure elements exist before proceeding
if (btn.length > 0 && text.length > 0) {
  // Visibility check
  window.onload = function () {
    if (window.innerWidth < 992) {
      btn.forEach((button, index) => {
        if (text[index].offsetHeight >= 180) {
          text[index].style.height = "220px";
          button.style.display = "block";
        } else {
          button.style.display = "none";
        }
      });
    }
  };

  // Add click events
  btn.forEach((button, index) => {
    button.addEventListener("click", () => {
      text[index].style.height = "auto";
      button.style.display = "none";
    });
  });
}
