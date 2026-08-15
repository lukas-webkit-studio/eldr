/* ==========================================================================
   Galerie — Swiper slidery a popup
   Původně: sliders.js
   Vyžaduje jQuery (Webflow načítá vlastní 3.5.1) a Swiper 8.
   ========================================================================== */

(function () {
  if (!has(SEL.sliderMain) && !has(SEL.swiperHomepage)) return;
  if (!hasJQ() || typeof window.Swiper !== 'function') return;

  var $ = window.jQuery;

  /* Společná konfigurace slideru — dřív byla trojmo zkopírovaná. */
  function baseConfig(duration) {
    return {
      speed: duration,
      loop: false,
      autoHeight: false,
      followFinger: true,
      freeMode: false,
      slideToClickedSlide: false,
      rewind: false,
      mousewheel: { forceToAxis: true },
      keyboard: { enabled: true, onlyInViewport: true },
      slideActiveClass: 'is-active',
      slideDuplicateActiveClass: 'is-active',
      preloadImages: true,
      lazy: { loadPrevNext: true, loadPrevNextAmount: 3, loadOnTransitionStart: true }
    };
  }

  function responsive(lastCount) {
    return {
      480:  { slidesPerView: 'auto', spaceBetween: '0%', centeredSlides: true },
      768:  { slidesPerView: 'auto', spaceBetween: '0%', centeredSlides: true },
      992:  { slidesPerView: 3,      spaceBetween: '0%', centeredSlides: false },
      1280: { slidesPerView: lastCount, spaceBetween: '0%', centeredSlides: false }
    };
  }

  function setPopupOpen(open) {
    if (window.eldrSetThemeColor) window.eldrSetThemeColor(open);
  }

  $(document).ready(function () {
    $(SEL.sliderMain).each(function () {
      var $component = $(this);
      var duration = $component.attr('slider-duration') ? +$component.attr('slider-duration') : 300;

      // hlavní slider
      var mainSwiper = null;
      var mainEl = $component.find('.swiper')[0];
      if (mainEl) {
        mainSwiper = new Swiper(mainEl, $.extend(baseConfig(duration), {
          centeredSlides: true,
          slidesPerView: 'auto',
          spaceBetween: '0%',
          breakpoints: responsive(4),
          navigation: {
            nextEl: $component.find('.swiper-next')[0],
            prevEl: $component.find('.swiper-prev')[0],
            disabledClass: 'is-disabled'
          }
        }));
        $component.data('mainSwiper', mainSwiper);
      }

      // malý slider
      var smallEl = $component.find('.swiper-small')[0];
      if (smallEl) {
        new Swiper(smallEl, $.extend(baseConfig(duration), {
          centeredSlides: true,
          slidesPerView: 'auto',
          spaceBetween: '0%',
          breakpoints: responsive(3)
        }));
      }

      // popup navázaný na tenhle slider
      var sliderRoot = $component.closest(SEL.sliderRoot);
      var popUp = sliderRoot.find(SEL.popup);
      var popupSwiperEl = popUp.find('.swiper-popup')[0];
      var popupSwiper = null;

      if (popUp.length && popupSwiperEl) {
        new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.attributeName !== 'style') return;
            var display = $(mutation.target).css('display');
            if (display === 'none' && popupSwiper && mainSwiper) {
              mainSwiper.slideTo(popupSwiper.activeIndex);
            }
            setPopupOpen(display === 'flex');
          });
        }).observe(popUp[0], { attributes: true });
      }

      $component.find(SEL.gallerySlide).on('click', function () {
        if (!popUp.length || !popupSwiperEl) return;
        var index = $(this).index();

        if (!popupSwiper) {
          popupSwiper = new Swiper(popupSwiperEl, $.extend(baseConfig(300), {
            centeredSlides: false,
            slidesPerView: 1,
            spaceBetween: '1%',
            initialSlide: index,
            navigation: {
              nextEl: popUp.find('.swiper-next-popup')[0],
              prevEl: popUp.find('.swiper-prev-popup')[0],
              disabledClass: 'is-disabled'
            }
          }));
        } else {
          popupSwiper.slideTo(index);
        }

        popUp.css('display', 'flex');
        setPopupOpen(true);
      });
    });

    // homepage slider
    $(SEL.swiperHomepage).each(function () {
      new Swiper(this, $.extend(baseConfig(300), {
        loop: true,
        centeredSlides: false,
        slidesPerView: 'auto',
        spaceBetween: 64,
        breakpoints: { 992: { slidesPerView: 2 }, 1440: { slidesPerView: 3 } },
        navigation: { nextEl: '.swiper-next', prevEl: '.swiper-prev' }
      }));
    });

    /* --- zavírání popupu ------------------------------------------------ */

    function syncAndClose(popup) {
      if (!popup || !popup.length) return;

      var root = popup.closest(SEL.sliderRoot);
      if (root.length) {
        var mainSwiper = root.find(SEL.sliderMain).data('mainSwiper');
        var popupEl = popup.find('.swiper-popup')[0];
        var popupSwiper = popupEl && popupEl.swiper;
        if (mainSwiper && popupSwiper) mainSwiper.slideTo(popupSwiper.activeIndex);
      }

      popup.css('display', 'none');
    }

    $(document).on('keydown', function (event) {
      if (event.key !== 'Escape') return;
      $(SEL.popup).filter(':visible').each(function () { syncAndClose($(this)); });
    });

    $(document).on('click', SEL.popupClose + ', ' + SEL.popupBackdrop, function () {
      syncAndClose($(this).closest(SEL.popup));
    });

    /* --- klávesa F: zobrazí popisek v otevřeném popupu -------------------
       Původně byly tyto handlery navěšené dvakrát (jednou globálně na všechny
       popisky, jednou jen na viditelný popup). Ponechána scoped varianta. */
    $(document).on('keydown.eldrLabel keyup.eldrLabel', function (event) {
      if (!event.key || event.key.toLowerCase() !== 'f') return;
      var show = event.type === 'keydown';
      $(SEL.popup).filter(':visible').find(SEL.popupLabel).css('display', show ? 'block' : 'none');
    });
  });
})();
