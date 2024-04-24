$(document).ready(function () {
  // region [rgba(255,255,255,0.08)]
  // MAIN SWIPER & SWIPER-SMALL INITIALIZATION
  // – – – – –

  $(".slider-main_component").each(function () {
    const $this = $(this);
    const sliderDuration = $this.attr("slider-duration")
      ? parseInt($this.attr("slider-duration"), 10)
      : 300;

    const mainSwiper = new Swiper($this.find(".swiper")[0], {
      speed: sliderDuration,
      loop: false,
      autoHeight: false,
      centeredSlides: true,
      followFinger: true,
      freeMode: false,
      slideToClickedSlide: false,
      slidesPerView: "auto",
      spaceBetween: "0%",
      rewind: false,
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true, onlyInViewport: true },
      navigation: {
        nextEl: $this.find(".swiper-next")[0],
        prevEl: $this.find(".swiper-prev")[0],
        disabledClass: "is-disabled",
      },
      breakpoints: {
        480: {
          slidesPerView: "auto",
          spaceBetween: "0%",
          centeredSlides: true,
        },
        768: {
          slidesPerView: "auto",
          spaceBetween: "0%",
          centeredSlides: true,
        },
        992: { slidesPerView: 3, spaceBetween: "0%", centeredSlides: false },
        1280: { slidesPerView: 4, spaceBetween: "0%", centeredSlides: false },
      },
      preloadImages: true,
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 2,
        loadOnTransitionStart: true,
      },
    });

    $this.data("mainSwiper", mainSwiper);
    // endregion

    // region [rgba(255,255,255,0.08)]
    // POP-UP
    // – – – – –

    $this.find(".imageslider__slide").on("click", function () {
      const $popUp = $(this)
        .closest(".slider")
        .find(".popup")
        .css("display", "flex");
      $("body").css("overflow", "hidden");
      $popUp.data("swiper-slide-index", $(this).index());

      new Swiper($popUp.find(".swiper-popup")[0], {
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
        mousewheel: { forceToAxis: true },
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: {
          nextEl: $popUp.find(".swiper-next-popup")[0],
          prevEl: $popUp.find(".swiper-prev-popup")[0],
          disabledClass: "is-disabled",
        },
        slideActiveClass: "is-active",
        slideDuplicateActiveClass: "is-active",
        initialSlide: $(this).index(),
        preloadImages: true,
        lazy: {
          loadPrevNext: true,
          loadPrevNextAmount: 2,
          loadOnTransitionStart: true,
        },
      });

      // Adjusting for cross-icon click using event delegation to prevent multiple bindings
      $this.on("click", ".cross-icon", function () {
        const $popUp = $(this).closest(".popup");
        closePopup($popUp);
      });
    });
  });
  // endregion

  // region [rgba(255,255,255,0.08)]
  // ESC KEY HANDLING FOR CLOSING POP-UP
  // – – – – –

  $(document).keydown(function (e) {
    if (e.key === "Escape") {
      $(".popup").each(function () {
        closePopup($(this)); // Use the centralized close function
      });
    }
  });
  // endregion

  // region [rgba(255,255,255,0.08)]
  // FUNCTION HANDLING FOR CLOSING POP-UP
  // – – – – –

  function closePopup($popUp) {
    $popUp.css("display", "none");
    $("body").css("overflow", "");
    // Defer the swiper index sync to ensure the popup is fully closed
    setTimeout(() => {
      syncSwiperIndex($popUp);
    }, 0); // Timeout with 0 to defer the execution until after the current call stack clears
  }

  function syncSwiperIndex($popUp) {
    const index = $popUp.data("swiper-slide-index");
    const mainSwiper = $popUp
      .closest(".slider-main_component")
      .data("mainSwiper");
    if (mainSwiper && index !== undefined) {
      mainSwiper.slideTo(index, 0);
    }
  }
  // endregion

  // region [rgba(255,255,255,0.08)]
  // SWIPER-HOMEPAGE INITIALIZATION
  // – – – – –

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
      rewind: false,
      mousewheel: { forceToAxis: true },
      breakpoints: {
        992: { slidesPerView: 2 },
        1440: { slidesPerView: 3 },
      },
      keyboard: { enabled: true, onlyInViewport: true },
      navigation: { nextEl: ".swiper-next", prevEl: ".swiper-prev" },
      slideActiveClass: "is-active",
      slideDuplicateActiveClass: "is-active",
    });
  });
  // endregion

  // region [rgba(255,255,255,0.08)]
  // WHEN POP-UP OPEN & "F" KEY PRESSED SHOW IMAGE NAME
  // – – – – –

  document.addEventListener("keydown", function (event) {
    if (event.key === "f") {
      $(".swiper-popup--label").css("display", "block");
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.key === "f") {
      $(".swiper-popup--label").css("display", "none");
    }
  });
  // endregion
});
