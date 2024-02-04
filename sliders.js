/*region [rgba(0, 255, 255, 0.08)]

SLIDERS FUNCTIONALITY
Slider on ELDR website are run by Swiper.js library.

endregion*/



//region [rgba(255, 255, 255, 0.08)]
// MAIN SWIPER & SWIPER-SMALL INITIALIZATION
// – – – – –

$(document).ready(function () {

    $(".slider-main_component").each(function () {

        let sliderDuration = $(this).attr("slider-duration") ? +$(this).attr("slider-duration") : 300;
        let $thisComponent = $(this); // Store reference to current component

        // Main swiper
        const swiper = new Swiper($thisComponent.find(".swiper")[0], {

            speed: sliderDuration,
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
                // desktop-large
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
                loadPrevNextAmount: 2, // Load the previous and next 3 slides
                loadOnTransitionStart: true
            }

        });

        // Swiper-small
        const swiperSmall = new Swiper($(this).find(".swiper-small")[0], {

            speed: sliderDuration,
            loop: false,
            autoHeight: false,
            followFinger: true,
            freeMode: false,
            slideToClickedSlide: false,
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
            },
            slideActiveClass: "is-active",
            slideDuplicateActiveClass: "is-active",
            preloadImages: true,

        });

        // Store a reference to this swiper instance for later use
        $thisComponent.data('mainSwiper', swiper);

        // Popup functionality
        $thisComponent.find('.imageslider__slide').on('click', function () {
            var popUp = $(this).closest('.slider').find('.popup');
            popUp.css('display', 'flex');
            var popupSwiper = new Swiper(popUp.find(".swiper-popup")[0], {
                speed: sliderDuration,
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
                    loadPrevNextAmount: 2,
                    loadOnTransitionStart: true
                }

            });

        });

    });

});
//endregion



//region [rgba(255, 255, 255, 0.08)]
// SWIPER-HOMEPAGE INITIALIZATION
// – – – – –

$(document).ready(function () {

    $(".swiper-homepage").each(function () {

        new Swiper(this, {
            speed: 300,
            loop: true,
            autoHeight: false,
            centeredSlides: false,
            followFinger: true,
            freeMode: false,
            slidesPerView: 'auto',
            spaceBetween: 64,
            slideToClickedSlide: false,
            rewind: false,
            mousewheel: {
                forceToAxis: true
            },
            breakpoints: {
                992: {
                    slidesPerView: 2,
                },
                1440: {
                    slidesPerView: 3,
                },
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            navigation: {
                nextEl: '.swiper-next', // Direct class reference
                prevEl: '.swiper-prev', // Direct class reference
            },
            slideActiveClass: "is-active",
            slideDuplicateActiveClass: "is-active"
        });

    });

});
//endregion



//region [rgba(255, 255, 255, 0.08)]
// UPDATE SCROLL STATE & CLOSE POPUP ON ESC KEY
// – – – – –

$(document).ready(function () {
    // Function to update the scroll state based on the visibility of elements
    function updateScrollState() {
        let shouldDisableScroll = $('.popup:visible, .overlap__menu__wrapper:visible, .w-nav-overlay:visible').length > 0;
        $('body').toggleClass('no-scroll', shouldDisableScroll).css('overflow', shouldDisableScroll ? 'hidden' : 'auto');
    }

    // Initialize the mutation observer to observe changes in the display property of popups and overlays
    var observer = new MutationObserver(updateScrollState);
    $('.popup, .overlap__menu__wrapper, .w-nav-overlay').each(function() {
        observer.observe(this, { attributes: true });
    });
    updateScrollState();

    // Close popup when the Escape key is pressed and update the scroll state
    $(document).on('keydown', function (event) {
        if (event.key === 'Escape') {
            $('.popup').css('display', 'none');
        }
    });
});

//endregion



//region [rgba(255, 255, 255, 0.08)]
// WHEN POP-UP OPEN & "F" KEY PRESSED SHOW IMAGE NAME
// – – – – –
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
//endregion



//region [rgba(255, 255, 255, 0.08)]
// POP-UP TO SWIPER INDEX SYNC
// – – – – –

// Function to update the main swiper's slide based on the popup's index when the popup is closed
function updateSwiperOnPopupClose() {
    const popupObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === "style") {
                const target = $(mutation.target); // The popup that triggered the mutation
                const displayValue = target.css("display");
                if (displayValue === "none") { // Popup was closed
                    // Find the index of the slide associated with the closed popup
                    let slideIndex = target.data('swiper-slide-index');
                    if (slideIndex === undefined) {
                        // If the data attribute is not set, fallback to using index within its parent
                        slideIndex = target.closest('.slider-main_component').find('.imageslider__slide').index(target);
                    }
                    // Update the main swiper's current slide to the index associated with the closed popup
                    const mainSwiper = target.closest('.slider-main_component').data('mainSwiper');
                    if (mainSwiper) {
                        mainSwiper.slideTo(slideIndex);
                    }
                }
                // Optionally, re-apply the scroll lock logic here if needed
            }
        });
    });

    // Attach the observer to each popup element
    $(".popup").each(function() {
        popupObserver.observe(this, { attributes: true });
    });
}

// Initialize the function to set up the observers
updateSwiperOnPopupClose();

//endregion