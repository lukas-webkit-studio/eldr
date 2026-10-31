# Ověření: velkoformatovy-tisk

Ověřeno 30. 10. 2026, 22:33 UTC. Stránku jsem načetl znovu ze živého webu
(`snapshot.js --out …/overeni/velkoformatovy-tisk`) ve všech třech jazycích.
Diff proti `_zdroj/` je ve všech třech jazycích prázdný, a to u `.txt` i
`.outline.json`. Ze surového HTML (`/produkty/velkoformatovy-tisk`) je
doloženo, že karty odkazují na sekce `#uvod`, `#rezana-grafika`,
`#dalsi-druhy-polepu` a `#designove-obrazy`, takže sloučení karet se sekcemi
sedí.

## Souhrn

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 76 | 65 | 7 | 0 | ✅ 65/65 (100 %) |
| en | 76 | 65 | 7 | 0 | ✅ 65/65 (100 %) |
| de | 76 | 65 | 7 | 0 | ✅ 65/65 (100 %) |

Klíče a pořadí výrobků jsou ve všech jazycích stejné: `uvod`,
`rezana-grafika`, `dalsi-druhy-polepu`, `polepy-vozidel-a-vyloh`,
`perforovane-a-kryci-polepy-oken`, `polepy-podlah-a-bezpecnostni-prvky`,
`designove-obrazy`. Citace EN a DE jsou z EN a DE stránky.

## Nálezy

1. **`uvod`: vlastnost „stálobarevnost“ = „minimálně po dobu tří let“**
   (EN „colour fastness“, DE „Farbechtheit“). Název je slovo vytržené z věty
   „Za stálobarevnost tisků ručíme…“, na stránce to štítek není. → **Vyhozeno.**
   Celá věta je dál ve vlastnosti „Zpracování“, takže se údaj neztratil.
2. **`uvod`: tři vlastnosti z mezititulků** „Klademe důraz na kvalitu
   a životnost“, „Moderní technologie“, „Maximální trvanlivost“. To nejsou
   štítky, ale marketingové nadpisy. Text pod nimi je hlavně o firmě
   („na vlastní tiskárně“, „Vlastníme moderní tiskárnu“, „maximální
   trvanlivost“) a technické jádro (latex, lesklá/matná laminace) už je ve
   vlastnosti „Zpracování“. → **Vyhozeno** do `vynechano`. Jediný nový údaj
   o výrobku, „Laminace chrání reklamu rovněž před mechanickým poškozením“
   (EN/DE obdobně), jsem **přidal do `variants`** s citací celého odstavce.
3. **`rezana-grafika`: vlastnost „stálobarevnost“ = „až sedm let“** (EN
   „colour-fast“, DE „farbecht“). Je to stejná vada jako v bodě 1. → **Vyhozeno**,
   údaj zůstává ve vlastnosti „Materiály“.
4. **`rezana-grafika`: vlastnost „Výhodou řezané grafiky“ = „dlouhá
   životnost“** (EN „Its advantage“, DE „Ihr Vorteil“). Název je kostrbatý, vytržený
   z věty. → **Opraveno:** vlastnost zrušena, celá věta „Výhodou řezané grafiky
   je její dlouhá životnost.“ přesunuta do `variants`.
5. **`rezana-grafika`: v `variants` bylo omezení techniky** „Neumožňuje
   zhotovení například barevných přechodů…“. Pod popiskem „Provedení“ by to
   mělo opačný význam, protože jde o to, co technika neumí. → **Vyhozeno**
   z `variants`, text zůstává ve vlastnosti „Zpracování“, kde ho stránka uvádí.

Zkontrolováno a ponecháno: H1, štítky v hero, popisy z karet, vlastnosti
Materiály / Zpracování / Materiály a tisk, materiály (papír, fólie, banner,
textil, canvas, Dibond, PVC), provedení a použití polepů a obrazů, obrázky.
Stránka nemá perex pod H1, proto `page.description` chybí (správně).
Nic, co by do vrstvy patřilo, nechybí.

## Sporné — mělo by rozhodnout člověk

- **Procesní blok je na stránce tisku nadepsán „Jak probíhá výroba světelné
  reklamy?“** a končí krokem „Zprovozníme reklamu připojením k elektrické
  síti“. U tisku a polepů to nedává smysl, vypadá to jako chyba společné
  šablony. Ve vrstvě to není (je to ve `vynechano`), ale na webu by to stálo
  za opravu. Totéž platí pro blok „Elektro Drapač je zárukou prvotřídní
  kvality“, který mluví jen o světelné reklamě.
- **Štítek v hero „{#YOE#} let zkušeností“.** Bez JS ho robot vidí jako
  surový token. Ve vrstvě není. Pro AI a vyhledávače, které JS nespouštějí,
  je na stránce doslova `{#YOE#}`.
- **Highlight „Vlastní grafické studio“** (EN „In-house graphic design
  studio“, DE „Eigenes Grafikstudio“) je tvrzení o firmě, ne o výrobku. Ve
  vrstvě zůstal jako štítek stránky (`page.highlights`), ne u výrobku. Jestli
  ho klient chce mít ve vrstvě, je to jeho rozhodnutí.
- **Polepy jsou rozdělené na čtyři výrobky:** `dalsi-druhy-polepu` plus tři
  podtypy z odrážek se štítkem. Podtypy nemají vlastní kotvu ani obrázek a
  jejich názvy jsou zároveň ve `variants` výrobku „Polepy“. Je to doložené,
  jen trochu redundantní. Alternativa je převést podtypy na vlastnosti
  výrobku „Polepy“.
- **Alt texty obrázků jsou česky i na `/en` a `/de`.** Přeložit jdou jen
  v Designeru.
