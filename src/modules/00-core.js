/* ==========================================================================
   Jádro — sdílené pomocné funkce a mapa selektorů
   ==========================================================================
   MIGRAČNÍ REŽIM (expand): každý selektor cílí na STARÝ i NOVÝ název třídy.
   Díky tomu web funguje během celého přejmenovávání ve Webflow.
   Po dokončení migrace se ze SEL smažou staré názvy (fáze contract).
   ========================================================================== */

var SEL = {
  // galerie
  gallery:          '.imageslider, .gallery_component',
  galleryCollection:'.imageslider__collection, .gallery_collection',
  gallerySlide:     '.imageslider__slide, .gallery_slide',
  sliderRoot:       '.slider, .slider_component',
  sliderMain:       '.slider-main_component',
  swiperHomepage:   '.swiper-homepage',

  // popup
  popup:            '.popup, .popup_component',
  popupBackdrop:    '.popup__background, .popup_backdrop',
  popupClose:       '.cross-icon, .popup_close',
  popupLabel:       '.swiper-popup--label, .swiper-popup_label',

  // navigace
  navOverlay:       '.overlap__menu__wrapper, .nav_overlay',
  wfNavOverlay:     '.w-nav-overlay',

  // dlouhý text
  longText:         '.longtext, .longtext_component',
  longTextButton:   '.longtext__button, .longtext_button',

  // homepage
  counter:          '.countupyears, .counter_years',
  tabLink:          '.tabs_link',
  tabImage:         '.tabs_image',
  videoWrapper:     '.video-wrapper, .video_modal',
  videoBackdrop:    '.video-background, .video_modal-backdrop',
  videoClose:       '.video-cancel-btn, .video_modal-close',
  videoTrigger:     '.reference_clipped_video',

  // o nás
  historySlider:    '.slider--history, .history_slider',
  lottie:           '.lottie-animation',

  // reference
  refLanguage:      '.sectionreference__collection__item__language, .reference_item-language',

  /* --- HOOK TŘÍDY PRO GTM — NESTYLOVAT, NEMAZAT ---------------------------
     Na těchto třídách visí měření v Google Tag Manageru. Ve Webflow zůstávají
     na prvcích jako prázdné třídy (nula CSS vlastností); vzhled řídí
     client-first třídy vedle nich. Odstranit je lze až po auditu GTM
     containeru GTM-W6PR2VX. */
  gtmForm:          '.form__type1',   // hook: NEPOUŽÍVÁ se v bundlu, měření běží přes #form-kontakt
  gtmNavLink:       '.navbar__link',

  /* Client-first `.button` přibyla k původní `.button--primary`. Bez ní se
     neměřila nová tlačítka — na Domovské stránce čtyři, včetně hlavního CTA
     v hero. Ověřeno na všech 87 stránkách: žádný prvek nemá obě třídy
     zároveň ani se nekříží s .navbar__link, takže nehrozí dvojí počítání. */
  gtmButton:        '.button--primary, .button',
  gtmTopProduct:    '.sectiontopproducts__item',
  gtmMenuProduct:   '.sectionproducts__item'
};

/** Vrátí pole prvků pro daný selektor. */
function $$(sel, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}

/** Vrátí první prvek nebo null. */
function $1(sel, root) {
  return (root || document).querySelector(sel);
}

/** Spustí callback po DOMContentLoaded (nebo hned, pokud už proběhl). */
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/** Je na stránce alespoň jeden prvek daného selektoru? Modul se pak spustí. */
function has(sel) {
  return !!$1(sel);
}

/** Je k dispozici jQuery? Webflow načítá vlastní 3.5.1. */
function hasJQ() {
  return typeof window.jQuery === 'function';
}

/* --- Jazyk stránky --------------------------------------------------------
   JEDINÝ zdroj pravdy pro celý bundle. Dřív si jazyk určoval každý modul sám
   a dvěma různými způsoby: podle podřetězce v URL (locale, video) nebo podle
   atributu lang (formulář). Ta první varianta je rozbitá — `url.indexOf('/de')`
   chytne i cestu /produkty/designova-…, takže česká stránka dostala němčinu
   a její anglická mutace taky. Ze 87 publikovaných URL na to dojely dvě.

   Webflow plní <html lang> správně na všech jazykových mutacích, takže čteme
   odtud. URL se používá jen jako záchrana, kdyby atribut chyběl — a to už
   striktně na segment cesty, ne na podřetězec. */

var LOCALES = ['cs', 'en', 'de'];

function locale() {
  var attr = (document.documentElement.getAttribute('lang') || '').trim().toLowerCase().slice(0, 2);
  if (LOCALES.indexOf(attr) !== -1) return attr;

  var seg = window.location.pathname.split('/')[1];
  return LOCALES.indexOf(seg) !== -1 ? seg : 'cs';
}
