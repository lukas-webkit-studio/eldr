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

Pole rozdělit do **field groups** „Společné" a „Jen velký banner". Webflow
neumí pole podle `Typ` schovávat, ale skupina s jasným názvem a help textem
stačí — klient u malého banneru vyplní jen první skupinu.

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

### Na co si dát pozor

- **Nepoužívej u obrázků grid child positioning.** Webflow z něj generuje
  `id="w-node-…"` a to by se v článku duplikovalo. Obrázky umísti přes třídu
  `banner-cta-big_image-wrapper` (flex), ne přes mřížku.
- **Nechej `attributes-richtext@1` v site head**, dokud nejsou přepsané
  všechny staré články. Nový systém ho nepotřebuje, ten starý na něm stojí.
- Kolekce Bannery se lokalizuje jako každá jiná — texty pro `/en` a `/de`
  se vyplňují v příslušné locale.
- Držet kolekci v rozumné velikosti (do ~30 záznamů). HTML všech bannerů je
  na každé stránce článku, i když se použije jeden.

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

24 URL v `/inspirace/` (8 článků × 3 jazyky). Postup na článek:

1. Z embedu opiš nadpis, text, tlačítko a obrázky do nového záznamu Bannery.
   Bannery se v článcích opakují — vznikne jich řádově pět, ne dvacet.
2. Smaž odstavec s escapovaným HTML, napiš `[banner:…]`.

Po dokončení jde z site head pryč `attributes-richtext@1` a **audit sirotků
se dá zopakovat bez výjimky pro escapovaný HTML** — třídy bannerů budou
konečně na reálných prvcích v Designeru.

## Nasazení

Modul je součástí bundlu `dist/eldr.js`. Ten se ale v patičce webu zatím
nenačítá — live jsou pořád samostatné skripty `index.min.js` a `sliders.min.js`
na tagu `v1.2.27`. Než bannery pojedou, musí se patička přepnout na bundle.

Při editaci site head/footer **vždy nahrazuj celý obsah pole**, nikdy
„jen tenhle blok" — viz incident 2026-08-15 v `_backup/FINDINGS.md`.
