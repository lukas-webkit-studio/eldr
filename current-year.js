(function(){
  'use strict';

  // === 0) Dynamický výpočet proměnných ===
  const currentYear = new Date().getFullYear();
  const baseYear = 1989;
  const yearsOfExperience = currentYear - baseYear;

  // Globální proměnné — lze je používat v HTML
  window.GLOBAL_VARS = {
    YOE: yearsOfExperience
  };

  // Token syntaxe — jak se pozná proměnná v textu
  window.GLOBAL_VARS_TOKEN = { start: '{#', end: '#}' };

  // === 1) Načtení proměnných a tokenů ===
  const VARS  = window.GLOBAL_VARS;
  const TOKEN = Object.assign({ start:'[#', end:'#]' }, window.GLOBAL_VARS_TOKEN);
  const TOKEN_RE = new RegExp(escapeRegExp(TOKEN.start) + '(\\w+)' + escapeRegExp(TOKEN.end), 'g');

  // === 2) Vyplnění prvků <span data-var="..."> ===
  function fillDataVars(root){
    (root || document).querySelectorAll('[data-var]').forEach(el => {
      const key = el.getAttribute('data-var');
      if (key && (key in VARS)) el.textContent = String(VARS[key]);
    });
  }

  // === 3) Nahrazení tokenů v textu (např. {#YOE#}) ===
  function replaceTokensIn(container){
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node){
          if (!node.nodeValue || node.nodeValue.indexOf(TOKEN.start) === -1) return NodeFilter.FILTER_REJECT;
          const p = node.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let n;
    while ((n = walker.nextNode())){
      n.nodeValue = n.nodeValue.replace(TOKEN_RE, (_, key) => (key in VARS ? String(VARS[key]) : TOKEN.start + key + TOKEN.end));
    }
  }

  // === 4) Spuštění skriptu ===
  function run(){
    fillDataVars(document);
    const targets = document.querySelectorAll('.w-richtext, [data-scan-tokens]');
    targets.forEach(replaceTokensIn);
  }

  // === 5) Spuštění po načtení stránky ===
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run, { once:true });
  } else {
    run();
  }

  // === 6) Utility funkce ===
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

})();
