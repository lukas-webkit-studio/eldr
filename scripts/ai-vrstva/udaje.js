/* Sdílené funkce vrstvy pro AI: cesty, normalizace textu a výčet údajů. */
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'data', 'ai-vrstva');

/* Normalizace pro porovnání citace se stránkou: NFC, neviditelné znaky pryč,
   typografické uvozovky a pomlčky na rovné, všechny mezery na jednu. */
const norm = s => String(s)
  .normalize('NFC')
  .replace(/[­​-‍⁠﻿]/g, '')
  .replace(/[“-‟«»″]/g, '"')
  .replace(/[‘-‛′]/g, "'")
  .replace(/[‐-―−]/g, '-')
  .replace(/\s+/g, ' ')
  .trim();

/* Údaje souboru stránky jako [{path, value, quote, vrstva}].
   vrstva=false: údaj je v datech, ale do JSON-LD nejde (body z úvodu stránky). */
function facts(data) {
  const out = [];
  const add = (p, f, vrstva = true) => { if (f) out.push({ path: p, value: f.value, quote: f.quote, vrstva }); };
  const list = (p, arr, vrstva) => (arr || []).forEach((f, i) => add(`${p}[${i}]`, f, vrstva));
  const page = data.page || {};
  add('page.name', page.name);
  add('page.description', page.description);
  list('page.highlights', page.highlights, false);
  (page.properties || []).forEach((pp, j) => {
    add(`page.properties[${j}].name`, pp.name);
    add(`page.properties[${j}].value`, pp.value);
  });
  (data.products || []).forEach((pr, i) => {
    const p = `products[${i}:${pr.key}]`;
    add(`${p}.name`, pr.name);
    add(`${p}.description`, pr.description);
    (pr.properties || []).forEach((pp, j) => {
      add(`${p}.properties[${j}].name`, pp.name);
      add(`${p}.properties[${j}].value`, pp.value);
    });
    list(`${p}.materials`, pr.materials);
    list(`${p}.variants`, pr.variants);
    list(`${p}.uses`, pr.uses);
  });
  (data.faq || []).forEach((q, i) => {
    add(`faq[${i}].question`, q.question);
    add(`faq[${i}].answer`, q.answer);
  });
  return out;
}

module.exports = { DIR, norm, facts };
