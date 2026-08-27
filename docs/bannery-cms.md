# CMS Bannery — banner do článku bez ručního HTML

Náhrada dnešního postupu, kdy se banner lepí do článku jako escapovaný HTML
z Notionu ([Šablony bannerů v blogu](https://app.notion.com/p/3bd5ddfeb94f80ce8d32d27af35e3e2b)).

## Proč pryč od embedu

Dnešní banner v článku `/inspirace/jak-vybrat-reklamni-pylon`:

```html
<p>&lt;section fs-richtext-component=&quot;cta-small&quot; class=&quot;banner-cta-big&quot;&gt;…</p>
```

Co to obnáší:

- Klient edituje kód. Jedna smazaná `&quot;` = rozbitý banner.
- Obrázek se vkládá jako natvrdo opsaná CDN URL, tedy **bez `srcset`** —
  do mobilu jde plná velikost. `alt` zůstává prázdný.
- Do každého článku se kopíruje `id="w-node-_2a17c21a-…"`.
- `fs-richtext-component="cta-small"` sedí i na velkém banneru (překlep
  z kopírování).
- Změna textu ve všech bannerech = ruční průchod všemi články.
- Banner vykresluje Finsweet až po `DOMContentLoaded`, takže **GTM na jeho
  tlačítko nikdy nesedne** — kliky z bannerů se dnes neměří.
- Třídy bannerů audit tříd nevidí (jsou v escapovaném HTML) — proto byly
  v prvním auditu označené za sirotky, viz `_backup/FINDINGS.md`.

## Jak to funguje nově

1. Banner je záznam v CMS kolekci **Bannery** — klient má knihovnu.
2. Šablona článku vykreslí **celou kolekci** do skrytého zdroje ve správné
   Webflow struktuře.
3. Klient napíše do textu článku `[banner:nazev-banneru]`.
4. Modul `src/modules/05-banners.js` vymění token za hotový banner.

**V kolekci Inspirace se nemění vůbec nic.** Žádné nové pole, žádná změna
stávajících článků. Klient nikdy nevidí kód a struktura banneru žije
v Designeru, takže se dá kdykoli přestylovat na jednom místě.

## Stav

**Kolekce Bannery je založená a naplněná** (`6a90303011d6493faa8a946a`) — 15 záznamů
vytažených ze živého webu, obrázky napojené na stávající assety. Zbývá postavit
strukturu v Designeru a přepsat články.

## Datový model — kolekce Bannery

| Pole | Typ | Povinné | Platí pro |
|---|---|---|---|
| Name | Plain text | ano | název banneru, píše se do `[banner:…]` |
| Slug | Slug | ano | druhý funkční klíč do `[banner:…]` |
| Typ | Option: `Velký` / `Malý` | ano | řídí, která struktura se vykreslí |
| Nadpis | Plain text | ano | oba |
| Text | Plain text (víceřádkový) | ne | jen velký |
| Text tlačítka | Plain text | ano | oba |
| Odkaz tlačítka | Link | ano | oba |
| Obrázek 1 | Image | ne | jen velký |
| Popis obrázku 1 | Plain text | ne | jen velký (`alt`) |
| Obrázek 2 | Image | ne | jen velký |
| Popis obrázku 2 | Plain text | ne | jen velký |

Pole jsou rozdělená do **field groups** „Společné" a „Jen velký banner"
a každé má help text. Webflow neumí pole podle `Typ` schovávat, ale skupina
s jasným názvem stačí — klient u malého banneru vyplní jen první skupinu.

**Typ jde přepnout kdykoli zpětně.** Změna Option pole + publish a všechny
články, které banner používají, se překreslí. Texty ani obrázky se nemažou,
jen se nepoužité pole přestane vykreslovat.

## Nastavení v Designeru — šablona `/inspirace/`

1. **Skrytý zdroj.** Na konec šablony vlož Div, custom atribut
   `data-banner-source`, Display `none`. Skrytí musí být v Designeru —
   kdyby skript nedojel, knihovna se nesmí ukázat. (Modul si `display: none`
   pro jistotu nastaví i sám.)
2. **Collection List** uvnitř, zdroj **Bannery** (celá kolekce, bez filtru).
   Limit nech na 100.
3. Na **Collection Item** dej custom atributy:
   - `data-banner` → vazba na pole *Slug*
   - `data-banner-name` → vazba na pole *Name*
4. Dovnitř položky vlož **dvě sekce** — `banner-cta-big` a `banner-cta-small`
   ve stejné struktuře, jakou má dnešní embed, s poli navázanými na CMS.
   Každé nastav **Conditional visibility**: `Typ = Velký`, resp. `Typ = Malý`.
5. Obrázkům nech **Loading: lazy**. Ve skrytém zdroji se pak nestahují;
   stáhnou se až po vložení do článku.

### Pojmenování tříd (client-first)

Dnešní třídy jsou ad hoc. Nová struktura se staví client-first:

| dnes | client-first |
|---|---|
| `banner-cta-big` | `banner_component` |
| `banner-cta-big-columns` | `banner_layout` |
| `banner-cta-big_content` | `banner_content` |
| `banner-cta-big_image-wrapper` | `banner_image-wrapper` |
| `banner-cta-big-image` + `.left` / `.right` | `banner_image` + `is-left` / `is-right` |
| `banner-cta-small` | `banner_component` + `is-small` |
| `banner-cta-small_content` | `banner_content` + `is-small` |

`contain`, `heading-style-h4`, `cta-section` a `button is-alternate` zůstávají —
to už client-first je.

**Aby vzhled zůstal identický:** ve Style panelu vyber prvek se starou třídou,
v menu u názvu třídy dej **Duplicate class** (vznikne kopie se všemi
vlastnostmi), přejmenuj ji na client-first název a starou třídu z prvku
odeber. Nepřepisuj styly ručně, rozjede se to.

**Staré třídy zatím nemazat** — drží vzhled bannerů ve starých článcích,
dokud nejsou přepsané. Až budou, jdou pryč (jsou i v `_backup/FINDINGS.md`).

### Na co si dát pozor

- **Nepoužívej u obrázků grid child positioning.** Webflow z něj generuje
  `id="w-node-…"` a to by se v článku duplikovalo. Obrázky umísti přes třídu
  `banner_image-wrapper` (flex), ne přes mřížku.
- **Nechej `attributes-richtext@1` v site head**, dokud nejsou přepsané
  všechny staré články. Nový systém ho nepotřebuje, ten starý na něm stojí.
- Držet kolekci v rozumné velikosti (do ~30 záznamů). HTML všech bannerů je
  na každé stránce článku, i když se použije jeden.

## Jazykové mutace

Site má Webflow Localization: primární `cs`, sekundární `en` a `de`.

**Dnes je to rozbité.** Banner je zapečený v rich textu a nikdo ho nepřeložil,
takže anglický i německý čtenář vidí český banner. Ověřeno na všech 24 URL.

**Nově to funguje samo.** Kolekce Bannery je lokalizovaná jako každá jiná:
přepneš locale, přepíšeš nadpis, text a tlačítko, publikuješ. Anglický
čtenář dostane anglický banner v anglickém článku. Nevyplněné pole padá
zpátky na češtinu, takže se nikdy nezobrazí prázdno.

**Dvě pravidla, aby to drželo:**

1. **Nelokalizuj pole Name a Slug.** Nech je ve všech mutacích česky —
   jsou to klíče, na které míří `[banner:…]` v textu.
2. **Nepřekládej token.** `[banner:pylony-velky]` zůstává v anglickém
   i německém článku doslova stejný. Tohle je potřeba říct i překladateli
   (a napsat do promptu, až bude blog překládat Claude).

## Návod pro klienta

**Nový banner:** CMS → Bannery → nový záznam. Vyplň název, vyber typ, doplň
nadpis, text tlačítka a odkaz. U velkého banneru navíc text a jednu nebo dvě
fotky. Publikuj.

**Banner do článku:** do textu na místo, kde má banner stát, napiš:

```
[banner:Pylony – velký]
```

Píše se název banneru z CMS. Na diakritice, velikosti písmen ani mezerách
nezáleží — `[banner:pylony-velky]` i `[banner: Pylony – velký ]` najdou totéž.

Token může být na samostatném řádku i uprostřed věty; banner se vždycky
vloží až za daný odstavec, aby nerozbil text. Když se banner nenajde, token
se z textu smaže (čtenář nikdy neuvidí hranaté závorky) a důvod je v konzoli
prohlížeče.

**Ve Webflow Editoru banner neuvidíš** — tam zůstane jen `[banner:…]`.
Zobrazí se až v náhledu publikovaného webu.

## Migrace stávajících článků

Bannery jsou už v CMS, takže na článek zbývá jen: smazat odstavec
s escapovaným HTML a napsat na jeho místo token. Pozice odpovídají živému webu.

| Článek (`/inspirace/…`) | Blok | Napsat do textu |
|---|---|---|
| `3d-napis-jak-ziskat-pozornost-zakazniku` | Obsah č. 2 | `[banner:3d-napisy-velky]` |
| `3d-napis-jak-ziskat-pozornost-zakazniku` | Obsah č. 2 | `[banner:3d-napisy-maly]` |
| `7-duvodu-proc-si-poridit-reklamni-totem-2` | Obsah č. 2 | `[banner:totemy-velky]` |
| `7-duvodu-proc-si-poridit-reklamni-totem-2` | Obsah č. 2 | `[banner:totemy-maly]` |
| `jak-vybrat-reklamni-pylon` | Obsah č. 2 | `[banner:pylony-maly]` |
| `jak-vybrat-reklamni-pylon` | Obsah č. 2 | `[banner:pylony-velky]` |
| `pozdvihnete-svuj-byznys-…-s-3d-reklamou-2` | Obsah č. 1 | `[banner:3d-reklama-velky]` |
| `pozdvihnete-svuj-byznys-…-s-3d-reklamou-2` | Obsah č. 2 | `[banner:3d-reklama-maly]` |
| `rezana-grafika-zaujmete-zakaznika-na-prvni-pohled` | Obsah č. 2 | `[banner:rezana-grafika-velky]` |
| `rezana-grafika-zaujmete-zakaznika-na-prvni-pohled` | Obsah č. 2 | `[banner:rezana-grafika-maly]` |
| `rozsvitte-svuj-brand-…-led-logo-dobrou-volbou` | Obsah č. 1 | `[banner:led-loga-maly]` |
| `rozsvitte-svuj-brand-…-led-logo-dobrou-volbou` | Obsah č. 2 | `[banner:led-loga-velky]` |
| `svetelna-reklama-propagujte-sve-podnikani-moderne` | Obsah č. 2 | `[banner:svetelna-reklama-maly]` |
| `svetelne-napisy-nejlepsi-zpusob-…-podnikani` | Obsah č. 2 | `[banner:svetelne-napisy-velky]` |
| `svetelne-napisy-nejlepsi-zpusob-…-podnikani` | Obsah č. 2 | `[banner:svetelne-napisy-maly]` |

Kde jsou u jednoho článku dva bannery ve stejném bloku, jdou v uvedeném
pořadí za sebou. Token se v EN a DE mutaci píše **stejně** (viz Jazykové mutace).

`3D nápisy – velký` a `3D reklama – velký` mají shodný text a liší se jen
fotkami — je to pozůstatek kopírování. Až budou články přepsané, dají se
sloučit do jednoho záznamu.

Po dokončení jde z site head pryč `attributes-richtext@1` a **audit sirotků
se dá zopakovat bez výjimky pro escapovaný HTML** — třídy bannerů budou
konečně na reálných prvcích v Designeru.

## Nasazení

Modul je součástí bundlu `dist/eldr.js`. Ten se ale v patičce webu zatím
nenačítá — live jsou pořád samostatné skripty `index.min.js` a `sliders.min.js`
na tagu `v1.2.27`. Než bannery pojedou, musí se patička přepnout na bundle.

Při editaci site head/footer **vždy nahrazuj celý obsah pole**, nikdy
„jen tenhle blok" — viz incident 2026-08-15 v `_backup/FINDINGS.md`.
