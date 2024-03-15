// SHOW MORE SCRIPT

// Load Elements
const btn = document.querySelectorAll(".longtext__button");
const text = document.querySelectorAll(".longtext");

// Visibility check
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

// Action on click
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
