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
    const $component = $(this);
    let sliderDuration = $component.attr("slider-duration") ? +$component.attr("slider-duration") : 300;

    // Main Swiper initialization
    const mainSwiperEl = $component.find(".swiper")[0];
    if (!mainSwiperEl) {
      return; // no main swiper found, nothing to init for this component
    }

    const swiper = new Swiper(mainSwiperEl, {
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
        1280: { slidesPerView: 4, spaceBetween: "0%", centeredSlides: false }
      },
      navigation: {
        nextEl: $component.find(".swiper-next")[0],
        prevEl: $component.find(".swiper-prev")[0],
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

    // Swiper-small initialization (only if exists)
    const swiperSmallEl = $component.find(".swiper-small")[0];
    if (swiperSmallEl) {
      new Swiper(swiperSmallEl, {
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
          1280: { slidesPerView: 3, spaceBetween: "0%", centeredSlides: false }
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
    }

    let mainSwiper = swiper;
    // uložíme instanci hlavního swiperu na DOM element pro pozdější použití
    $component.data("mainSwiper", mainSwiper);

    // Popup a jeho Swiper – navázané na konkrétní slider
    const sliderRoot = $component.closest(".slider");
    const popUp = sliderRoot.find(".popup");
    const popupSwiperEl = popUp.find(".swiper-popup")[0];

    let popupSwiper = null;

    // Observer sledující změny display popupu (otevření/zavření)
    if (popUp.length && popupSwiperEl) {
      const popupObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === "style") {
            const displayValue = $(mutation.target).css("display");

            // při zavření popupu sesynchronizujeme hlavní slider
            if (displayValue === "none" && popupSwiper) {
              mainSwiper.slideTo(popupSwiper.activeIndex);
            }

            // zamknutí scrollu + změna theme color
            toggleScrollLock(displayValue);
          }
        });
      });

      popupObserver.observe(popUp[0], { attributes: true });
    }

    // Otevření popupu po kliku na obrázek v hlavním slideru
    $component.find(".imageslider__slide").on("click", function () {
      if (!popUp.length || !popupSwiperEl) {
        return;
      }

      const clickedIndex = $(this).index();

      // první otevření – vytvoříme Swiper pro popup
      if (!popupSwiper) {
        popupSwiper = new Swiper(popupSwiperEl, {
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
          initialSlide: clickedIndex,
          preloadImages: true,
          lazy: {
            loadPrevNext: true,
            loadPrevNextAmount: 3,
            loadOnTransitionStart: true
          }
        });
      } else {
        // další otevření – jen přepneme na správný slide
        popupSwiper.slideTo(clickedIndex);
      }

      popUp.css("display", "flex");
      // okamžitě aplikujeme změnu theme color a scroll lock
      toggleScrollLock("flex");
    });
  });

  // Function to update the scroll state based on the visibility of certain elements
  function updateScrollState() {
    let shouldDisableScroll = false;
    $(".popup, .overlap__menu__wrapper, .w-nav-overlay").each(function () {
      const displayValue = $(this).css("display");
      if (displayValue === "flex" || displayValue === "block") {
        shouldDisableScroll = true;
      }
    });

    $("body")
      .toggleClass("no-scroll", shouldDisableScroll)
      .css("overflow", shouldDisableScroll ? "hidden" : "auto");
  }

  // Initialize MutationObserver for scroll state updates
  const observer = new MutationObserver(updateScrollState);

  // Observe changes in elements affecting scroll state
  $(".popup, .overlap__menu__wrapper, .w-nav-overlay").each(function () {
    observer.observe(this, { attributes: true });
  });

  // Initial check of state
  updateScrollState();

  // Close popup when ESC is pressed
  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      $(".popup:visible").each(function () {
        const popup = $(this);
        updateSwiperOnPopupClose(popup);
        popup.css("display", "none");
      });
    }
  });

  // Close popup on clicking cross-icon or popup background
  $(document).on("click", ".cross-icon, .popup__background", function () {
    const popup = $(this).closest(".popup");
    updateSwiperOnPopupClose(popup);
    popup.css("display", "none");
  });

  // Show image name when 'f' key is pressed
  document.addEventListener("keydown", function (event) {
    if (event.key === "f") {
      let elements = document.querySelectorAll(".swiper-popup--label");
      elements.forEach(function (element) {
        element.style.display = "block";
      });
    }
  });

  // Hide image name when 'f' key is released
  document.addEventListener("keyup", function (event) {
    if (event.key === "f") {
      let elements = document.querySelectorAll(".swiper-popup--label");
      elements.forEach(function (element) {
        element.style.display = "none";
      });
    }
  });

  // Function to update the main swiper's slide based on the popup's active slide index when the popup is closed
  function updateSwiperOnPopupClose(popup) {
    if (!popup || !popup.length) {
      return;
    }

    const sliderRoot = popup.closest(".slider");
    if (!sliderRoot.length) {
      return;
    }

    const mainComponent = sliderRoot.find(".slider-main_component");
    const mainSwiper = mainComponent.data("mainSwiper");

    const popupSwiperEl = popup.find(".swiper-popup")[0];
    const popupSwiper = popupSwiperEl && popupSwiperEl.swiper;

    if (mainSwiper && popupSwiper) {
      mainSwiper.slideTo(popupSwiper.activeIndex);
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
      slidesPerView: "auto",
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
        prevEl: ".swiper-prev" // Direct class reference
      },
      slideActiveClass: "is-active",
      slideDuplicateActiveClass: "is-active"
    });
  });
});
