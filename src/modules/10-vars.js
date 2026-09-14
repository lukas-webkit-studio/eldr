/* ==========================================================================
   Globální proměnné a tokeny
   Původně: current-year.js
   Počítá roky praxe a doplňuje je do [data-var] a do tokenů {#YOE#}.
   {#YOE#} je sjednocená značka; [data-var] zůstává kvůli starším prvkům.
   ========================================================================== */

(function () {
  var BASE_YEAR = 1990;

  window.GLOBAL_VARS = { YOE: new Date().getFullYear() - BASE_YEAR };
  window.GLOBAL_VARS_TOKEN = { start: '{#', end: '#}' };

  var VARS = window.GLOBAL_VARS;
  var TOKEN = { start: '{#', end: '#}' };
  var TOKEN_RE = new RegExp(escapeRegExp(TOKEN.start) + '(\\w+)' + escapeRegExp(TOKEN.end), 'g');

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function fillDataVars(root) {
    $$('[data-var]', root).forEach(function (el) {
      var key = el.getAttribute('data-var');
      if (key && key in VARS) el.textContent = String(VARS[key]);
    });
  }

  function replaceTokensIn(container) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || node.nodeValue.indexOf(TOKEN.start) === -1) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) {
      n.nodeValue = n.nodeValue.replace(TOKEN_RE, function (_, key) {
        return key in VARS ? String(VARS[key]) : TOKEN.start + key + TOKEN.end;
      });
    }
  }

  onReady(function () {
    fillDataVars(document);
    // Scan celého body, ne jen .w-richtext: token {#YOE#} je sjednocená značka
    // pro počet let na trhu a musí fungovat i v běžných textech (hero štítky,
    // nadpisy, odrážky). Ve Webflow to jinak nejde — do primárního locale se
    // přes API nezapisuje a vkládat kvůli tomu per locale <span data-var>
    // znamená prvek navíc, kterému Webflow přidělí vlastní data-w-id.
    replaceTokensIn(document.body);
  });
})();
