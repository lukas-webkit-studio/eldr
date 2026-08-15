# ELDR — audit před migrací na client-first

Site ID `635940ec249b210e8902edd4` · Workspace `63593aa9923e4a3417813ca5`
Audit: 2026-08-15 · Live stav: publikováno 2026-06-29, kód na tagu v1.2.27 / v1.2.28

## Rollback body
- **Kód:** tagy `v1.2.27` (index, sliders, style) a `v1.2.28` (current-year) — beze změny na GitHubu.
- **Custom code ve Webflow:** `webflow/custom-code/site-head.html`, `site-footer.html` (verbatim kopie).
- **Styly:** `webflow/style-names.txt` (1336 jmen), `webflow/styles-raw.json`.
- **Publikované CSS:** `published/eldr.webflow.shared.min.css`.

## Nalezené chyby

### 1. Rozbité měření konverze (KRITICKÉ)
Site footer, GTM blok: `document.querySelectorAll(".Form__Type1")`.
Skutečná třída na webu je `form__type1` (malými písmeny). `querySelectorAll` je
case-sensitive → event `contact_form_submit` se **nikdy neodpálí**.
Oprava: změnit selektor na `.form__type1`.

### 2. jQuery se načítá dvakrát
- Webflow vlastní: `jquery-3.5.1.min.dc5e7f18c8.js` (cloudfront)
- Site footer navíc: `jquery/3.7.1/jquery.min.js` (googleapis) — ~30 kB gzip
Druhá instance přepisuje `$` pro Webflow skripty psané proti 3.5.1.

### 3. Rozjeté verze skriptů
Live běží 4 různé tagy současně: v1.2.22 (gallery-option), v1.2.23 (share-ai-data),
v1.2.27 (index, sliders, style), v1.2.28 (current-year).

### 4. Mrtvý kód v repu (smazáno)
`sliders-new.js`, `homepage-counter.js`, `show-mode.js`, `lead-script.js` —
nenačítají se nikde. Logika homepage-counter a show-mode je duplicitně
vepsaná přímo v page-level custom code (Domovská stránka / Reference).

### 5. Nepoužívaná třída v custom kódu
`.tab-image--mobile` (homepage footer) — na webu neexistuje.

## Stav tříd
- 1387 tříd v publikovaném CSS, 733 použitých → **539 sirotků (39 %)**
- 1336 stylů v Designeru
- 11 skupin duplicit
- Pět souběžných systémů pojmenování: ad hoc 41 %, BEM 30 %, client-first 16 %,
  Relume 5 %, Webflow balast 5 %

## Třídy vázané na custom kód — NESMÍ se přejmenovat bez úpravy kódu

| Třída | Kde | Funkce |
|---|---|---|
| `form__type1` | site footer (GTM) | konverze formuláře (dnes rozbité) |
| `navbar__link` | site footer (GTM) | menu_click |
| `button--primary` | site footer (GTM) | button_click |
| `sectiontopproducts__item` | site footer (GTM) | button_click HP |
| `sectionproducts__item` | site footer (GTM) | button_click Produkty |
| `countupyears` | HP footer | PureCounter (window.GLOBAL_VARS.YOE) |
| `video-wrapper`, `video-background`, `video-cancel-btn`, `reference_clipped_video` | HP footer | Vimeo modal |
| `tabs_link`, `tabs_image`, `tabs_icon`, `active` | HP head+footer | přepínání záložek |
| `longtext`, `longtext__button` | Reference footer | rozbalení textu |
| `slider--history`, `lottie-animation` | O nás footer | swipe + fade Lottie |
| `imageslider__*`, `popup*`, `slider`, `slider-main_component`, `swiper-*`, `cross-icon`, `overlap__menu__wrapper`, `arrow*` | sliders.js | galerie a popup |
| `sectionhero__graphic*`, `sectionmap__mapwrapper`, `image--clipped` | style.css | clip-path |
| `sectionreference__collection__item__language`, `localization-show-only_*` | index.js | jazykové varianty |

---

## Incident 2026-08-15: přepsaný site head

Při nasazení bundlu byl obsah Site settings → Custom code → **Head** nahrazen
celý, místo aby se vyměnil jen poslední blok. Z živého webu tím zmizely:

- **GTM loader** → veškeré měření mimo provoz (v HTML zbyl jen `<noscript>`)
- `attributes-richtext@1` → HTML vložené do CMS rich textu se přestalo
  renderovat a zobrazovalo se jako holý kód (rozbité bannery v blogu)
- `attributes-cmsfilter@1` → filtrování CMS seznamů
- `attributes-scrolldisable@1`, `attributes@2`
- `<meta name="theme-color">`

Obnoveno ze zálohy a publikováno. Poučení: **vždy předávat celý obsah pole,
nikdy instrukci „nahraď jen tuhle část"**.

## KRITICKÉ: audit sirotků neplatí

Bannery v článcích jsou vložené jako escapovaný HTML v CMS poli rich textu
(`&lt;div class=&quot;banner-cta-big&quot;&gt;`). Audit četl atributy
`class="…"` v renderovaném HTML, takže tyhle třídy nikdy neuviděl a označil
je za nepoužívané:

`banner-cta-big`, `banner-cta-big-columns`, `banner-cta-big_content`,
`banner-cta-big_image-wrapper`, `banner-cta-big-image`, `banner-cta-small`,
`banner-cta-small_content`, `cta-section`, `heading-style-h4`

Seznam 539 sirotků se proto NESMÍ použít k mazání. Před dalším postupem je
nutné audit zopakovat a započítat i escapovaný HTML ve všech CMS polích
typu Rich Text napříč všemi kolekcemi.
