# Prompt pro noční Routine

Routine se musí založit **z claude.ai** (Routines → nová), ne odsud —
z API se ke spouštěné session nedají připojit konektory, takže by běžela
bez Webflow a Figmy a nic by nesvedla.

**Nastavení:** opakování každou hodinu přes noc, konektory **Webflow
(Elektro Drapač)** a **Figma**, repozitář `lukas-webkit-studio/eldr`,
větev `claude/figma-webflow-7-pages-ffqfoo`.

---

Pokračuj v přestavbě produktových stránek ELDR ve Webflow podle návrhu z Figmy. Běžíš autonomně v noci, uživatel spí a výsledek chce najít ráno hotový. Nečekej na odpovědi, rozhoduj sám.

## Nejdřív si načti kontext

V repozitáři `lukas-webkit-studio/eldr`, větev `claude/figma-webflow-7-pages-ffqfoo`, přečti v tomto pořadí:

1. `CLAUDE.md` — pravidla projektu
2. `docs/produktove-stranky-stav.md` — stav série, rozhodnutí zadavatele, co zbývá
3. `docs/produktove-stranky-figma.md` — mapa Figma framů na stránky, kostra stránky, ověřený postup, technické limity

Ty dokumenty jsou úplné. Neodvozuj nic z paměti, drž se jich.

## Co dělat

Vezmi první stránku, která v tabulce stavu není hotová, a postav ji celou: struktura podle návrhu, texty, kotvy sekcí, přepnutí galerie na správný produkt, obrázky nahrané a zatříděné do assetů. Pak další stránku. Pokračuj, dokud nedojdou.

Po **každé dokončené stránce**:

- doplň řádek v tabulce stavu v `docs/produktove-stranky-stav.md`
- doplň úkony pro člověka do sekce „Co člověk udělá ráno" — plná cesta k assetu i místo ve stránce, ať ráno nikdo nic nedohledává
- zapiš rozhodnutí, která jsi udělal za pochodu
- commitni a pushni na větev

Commituj průběžně, ne až na konci. Když session spadne, práce nesmí zmizet.

## Co nedělat

- **Nepublikuj web.** Ani na konci. Publikace je rozhodnutí uživatele.
- Nesahej na komponentu `Navbar_2024-12`, dokud nejsou hotové všechny stránky — je společná pro celý web.
- Nezakládej nové CSS třídy, když existuje použitelná.

## Až bude hotovo

Zkontroluj, že seznam pro člověka je úplný a srozumitelný, a skonči.
