src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"
src="https://unpkg.com/swiper/swiper-bundle.min.js"

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



$(document).ready(function () {

const toggleScrollLock = function(displayValue) {
    if (displayValue === 'flex') {
    $('body').addClass('no-scroll');
    } else {
    $('body').removeClass('no-scroll');
    }
};

$(".slider-main_component").each(function (index) {
    let sliderDuration = 300;
    if ($(this).attr("slider-duration") !== undefined) {
    sliderDuration = +$(this).attr("slider-duration");
    }
    const swiper = new Swiper($(this).find(".swiper")[0], {
    speed: sliderDuration,
    loop: false,
    autoHeight: false,
    centeredSlides: true,
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    slidesPerView: 'auto',
    spaceBetween: "0%",
    rewind: false,
    mousewheel: {
        forceToAxis: true
    },
    keyboard: {
        enabled: true,
        onlyInViewport: true
    },
    breakpoints: {
        // mobile landscape
        480: {
        slidesPerView: 'auto',
        spaceBetween: "0%",
        centeredSlides: true
        },
        // tablet
        768: {
        slidesPerView: 'auto',
        spaceBetween: "0%",
        centeredSlides: true
        },
        // desktop
        992: {
        slidesPerView: 3,
        spaceBetween: "0%",
        centeredSlides: false
        },
        // tablet
        1280: {
        slidesPerView: 4,
        spaceBetween: "0%",
        centeredSlides: false
        },
    },
    navigation: {
        nextEl: $(this).find(".swiper-next")[0],
        prevEl: $(this).find(".swiper-prev")[0],
        disabledClass: "is-disabled"
    },
    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active",
    preloadImages: true,
    lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 3, // Load the previous and next 3 slides
        loadOnTransitionStart: true
    }
    });
    
    // Inicializace 'swiper-small'
    const swiperSmall = new Swiper($(this).find(".swiper-small")[0], {
    speed: sliderDuration,
    loop: false,
    autoHeight: false,
    centeredSlides: true,
    followFinger: true,
    freeMode: false,
    slideToClickedSlide: false,
    slidesPerView: 'auto',
    spaceBetween: "0%",
    rewind: false,
    mousewheel: {
        forceToAxis: true
    },
    keyboard: {
        enabled: true,
        onlyInViewport: true
    },
    breakpoints: {
        480: {
        slidesPerView: 'auto',
        spaceBetween: "0%",
        centeredSlides: true
        },
        768: {
        slidesPerView: 'auto',
        spaceBetween: "0%",
        centeredSlides: true
        },
        992: {
        slidesPerView: 3,
        spaceBetween: "0%",
        centeredSlides: false
        },
        1280: {
        slidesPerView: 4,
        spaceBetween: "0%",
        centeredSlides: false
        },
    },
    slideActiveClass: "is-active",
    slideDuplicateActiveClass: "is-active",
    preloadImages: true,
    lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 3, // Load the previous and next 3 slides
        loadOnTransitionStart: true
    }
    });

    let mainSwiper = swiper;

    $(this).find('.imageslider__slide').on('click', function() {
    const popUp = $(this).closest('.slider').find('.popup');
    popUp.css('display', 'flex');
    const popupSwiper = new Swiper(popUp.find(".swiper-popup")[0], {
        speed: 300,
        loop: false,
        autoHeight: false,
        centeredSlides: false,
        followFinger: true,
        freeMode: false,
        slideToClickedSlide: false,
        slidesPerView: 1,
        spaceBetween: "1%",
        rewind: false,
        mousewheel: {
        forceToAxis: true
        },
        keyboard: {
        enabled: true,
        onlyInViewport: true
        },
        navigation: {
        nextEl: popUp.find(".swiper-next-popup")[0],
        prevEl: popUp.find(".swiper-prev-popup")[0],
        disabledClass: "is-disabled"
        },
        slideActiveClass: "is-active",
        slideDuplicateActiveClass: "is-active",
        initialSlide: $(this).index(),
        preloadImages: true,
        lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 3, // Load the previous and next 3 slides
        loadOnTransitionStart: true
        }
    });

    // Observe changes to the popup's style
    const popupObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
            if (mutation.attributeName === "style") {
                const displayValue = $(mutation.target).css("display");
                if (displayValue === "none") {
                mainSwiper.slideTo(popupSwiper.activeIndex);
                }
                toggleScrollLock(displayValue);
            }
            });
        });
    
    $(".popup").each(function () {
            popupObserver.observe(this, {
            attributes: true,
        });
    });
    });
});
});
      

    
$(document).ready(function() {
// Funkce pro aktualizaci stavu skrolování
function updateScrollState() {
  let shouldDisableScroll = false;

  $('.popup, .overlap__menu__wrapper, .w-nav-overlay').each(function() {
    const displayValue = $(this).css('display');
    if (displayValue === 'flex' || displayValue === 'block') {
      shouldDisableScroll = true;
    }
  });

  if (shouldDisableScroll) {
    $('body').addClass('no-scroll').css('overflow', 'hidden');
  } else {
    $('body').removeClass('no-scroll').css('overflow', 'auto');
  }
}

// Inicializace MutationObserver
const observer = new MutationObserver(updateScrollState);

// Sledování změn v elementech
$('.popup, .overlap__menu__wrapper, .w-nav-overlay').each(function() {
  observer.observe(this, { attributes: true });
});

// Počáteční kontrola stavu
updateScrollState();
});



// Close pop-up when Esc pressed
$(document).ready(function() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'style') {
        const displayValue = $(mutation.target).css('display');
        if (displayValue === 'flex') {
          $('body').addClass('no-scroll');
          $(document).on('keydown', function(event) {
            if (event.key === 'Escape') {
              $(mutation.target).css('display', 'none');
            }
          });
        } else {
          $('body').removeClass('no-scroll');
          $(document).off('keydown');
        }
      }
    });
  });
  
  $('.popup').each(function() {
    observer.observe(this, {
      attributes: true
    });
  });
});

// Zobrazení názvu obrázku při Pop-up slideru "f"
document.addEventListener('DOMContentLoaded', function() {

document.addEventListener('keydown', function(event) {
  if (event.key === 'f') {
    let elements = document.querySelectorAll(".swiper-popup--label");
    if (elements.length > 0) {
      elements.forEach(function(element) {
        element.style.display = 'block';
      });
      console.log('Showing elements');
    } else {
      console.log('No elements with .swiper-popup--label found on keydown.');
    }
  }
});

document.addEventListener('keyup', function(event) {
  if (event.key === 'f') {
    let elements = document.querySelectorAll(".swiper-popup--label");
    if (elements.length > 0) {
      elements.forEach(function(element) {
        element.style.display = 'none';
      });
      console.log('Hiding elements');
    } else {
      console.log('No elements with .swiper-popup--label found on keyup.');
    }
  }
});

});
