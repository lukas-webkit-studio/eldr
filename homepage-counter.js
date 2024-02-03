$(window).on('load', function() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'style') {
        const displayValue = $(mutation.target).css('display');
        console.log(`Detected style change. New display value: ${displayValue}`);
        if (displayValue === 'none') {
          console.log('Starting counter...');
          startCounter();
        }
      }
    });
  });

  function startCounter() {
    new PureCounter({
      // your settings...
      selector: '.countupyears',
      start: 0,
      end: 34,
      duration: 2.6,
      delay: 60,
      once: true,
      repeat: false,
      decimals: 0,
      legacy: true,
      filesizing: false,
      currency: false,
      separator: false,
    });
  }

  $('[fs-cc="banner"]').each(function() {
    if ($(this).css('display') === 'none') {
      console.log('Starting counter...');
      startCounter();
    } else {
      observer.observe(this, {
        attributes: true
      });
    }
  });
});

window.addEventListener('load', function() {
    var iframes = document.getElementsByTagName('iframe');
    Array.prototype.forEach.call(iframes, function(iframe) {
        iframe.addEventListener('load', function() {
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            var style = iframeDocument.createElement('style');
            style.textContent = '.ytp-chrome-top-buttons { display: none; }';
            iframeDocument.head.appendChild(style);
        });
    });
});