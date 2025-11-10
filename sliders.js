$(document).ready(function () {

  // Function to toggle scroll lock and body background color based on the display value of the popup.
  const toggleScrollLock = function(displayValue) {
    $('body').toggleClass('no-scroll', displayValue === 'flex');
    if (displayValue === 'flex') {
      $('meta[name="theme-color"]').attr('content', '#272727'); // Change theme color to dark
    } else {
      $('meta[name="theme-color"]').attr('content', '#fcfcfc'); // Change theme color to light
    }
  };

  // Main Swiper & Swiper-Small Initialization
  $(".slider-main_component").each(function () {
    let sliderDuration = $(this).attr("slider-duration") ? +$(this).attr("slider-duration") : 300;

    // Main Swiper initialization
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
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true, onlyInViewport: true },
      breakpoints: {
        480: { slidesPerView: 'auto', spaceBetween: "0%", centeredSlides: true },
        768: { slidesPerView: 'auto', spaceBetween: "0%", centeredSlides: true },
        992: { slidesPerView: 3, spaceBetween: "0%", centeredSlides: false },
        1280: { slidesPerView: 4, spaceBetween: "0%", centeredSlides: false },
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
        loadPrevNextAmount: 3,
        loadOnTransitionStart: true
      }
    });

    // Swiper-small initialization
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
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true, onlyInViewport: true },
      breakpoints: {
        480: { slidesPerView: 'auto', spaceBetween: "0%", centeredSlides: true },
        768: { slidesPerView: 'auto', spaceBetween: "0%", centeredSlides: true },
        992: { slidesPerView: 3, spaceBetween: "0%", centeredSlides: false },
        1280: { slidesPerView: 3, spaceBetween: "0%", centeredSlides: false },
      },
      slideActiveClass: "is-active",
      slideDuplicateActiveClass: "is-active",
      preloadImages: true,
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 3,
        loadOnTransitionStart: true
      }
    });

    let mainSwiper = swiper;

    // Popup functionality
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
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
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
          loadPrevNextAmount: 3,
          loadOnTransitionStart: true
        }
      });

      // Apply the background color and theme color immediately on popup open
      toggleScrollLock('flex');

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

      // Attach observer to the popup
      popupObserver.observe(popUp[0], { attributes: true });
    });
  });

  // Function to update the scroll state based on the visibility of certain elements
  function updateScrollState() {
    let shouldDisableScroll = false;
    $('.popup, .overlap__menu__wrapper, .w-nav-overlay').each(function() {
      const displayValue = $(this).css('display');
      if (displayValue === 'flex' || displayValue === 'block') {
        shouldDisableScroll = true;
      }
    });

    $('body').toggleClass('no-scroll', shouldDisableScroll).css('overflow', shouldDisableScroll ? 'hidden' : 'auto');
  }

  // Initialize MutationObserver for scroll state updates
  const observer = new MutationObserver(updateScrollState);

  // Observe changes in elements affecting scroll state
  $('.popup, .overlap__menu__wrapper, .w-nav-overlay').each(function() {
    observer.observe(this, { attributes: true });
  });

  // Initial check of state
  updateScrollState();

  // Close popup when ESC is pressed
  $(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
      $('.popup:visible').each(function() {
        const popup = $(this);
        updateSwiperOnPopupClose(popup);
        popup.css('display', 'none');
      });
    }
  });

  // Close popup on clicking cross-icon or popup background
  $(document).on('click', '.cross-icon, .popup__background', function () {
    const popup = $(this).closest('.popup');
    updateSwiperOnPopupClose(popup);
    popup.css('display', 'none');
  });

  // Show image name when 'f' key is pressed
  document.addEventListener('keydown', function(event) {
    if (event.key === 'f') {
      let elements = document.querySelectorAll(".swiper-popup--label");
      elements.forEach(function(element) {
        element.style.display = 'block';
      });
    }
  });

  // Hide image name when 'f' key is released
  document.addEventListener('keyup', function(event) {
    if (event.key === 'f') {
      let elements = document.querySelectorAll(".swiper-popup--label");
      elements.forEach(function(element) {
        element.style.display = 'none';
      });
    }
  });

  // Function to update the main swiper's slide based on the popup's active slide index when the popup is closed
  function updateSwiperOnPopupClose(popup) {
    const mainSwiper = popup.closest(".slider-main_component").data("mainSwiper");
    if (mainSwiper) {
      const activeSlideIndex = popup.find(".swiper-slide-active").index();
      if (activeSlideIndex !== -1) {
        mainSwiper.slideTo(activeSlideIndex);
      }
    }
  }

  // Homepage Swiper Initialization
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
      mousewheel: { forceToAxis: true },
      breakpoints: {
        992: { slidesPerView: 2 },
        1440: { slidesPerView: 3 }
      },
      keyboard: { enabled: true, onlyInViewport: true },
      navigation: {
        nextEl: ".swiper-next", // Direct class reference
        prevEl: ".swiper-prev", // Direct class reference
      },
      slideActiveClass: "is-active",
      slideDuplicateActiveClass: "is-active",
    });
  });
});
