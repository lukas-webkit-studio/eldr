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

1. Banner je záznam v CMS kolekci **Bannery**.
2. V článku se banner **vybere** v multi-reference poli.
3. Na místo, kde má stát, klient napíše do textu odstavec `[banner:nazev]`.
4. Šablona článku vykreslí vybrané bannery do skrytého zdroje ve správné
   Webflow struktuře. Modul `src/modules/05-banners.js` je odtud vezme
   a vymění za zástupný odstavec.

Klient nikdy nevidí kód. Struktura banneru žije v Designeru, takže se dá
kdykoli přestylovat na jednom místě a promítne se do všech článků.

## Datový model — kolekce Bannery

| Pole | Typ | Povinné | Platí pro |
|---|---|---|---|
| Name | Plain text | ano | interní název, klient ho vidí při výběru |
| Slug | Slug | ano | klíč do `[banner:…]` |
| Typ | Option: `Velký` / `Malý` | ano | řídí, která struktura se vykreslí |
| Nadpis | Plain text | ano | oba |
| Text | Plain text (víceřádkový) | ne | jen velký |
| Text tlačítka | Plain text | ano | oba |
| Odkaz tlačítka | Link | ano | oba |
| Obrázek 1 | Image | ne | jen velký |
| Popis obrázku 1 | Plain text | ne | jen velký (`alt`) |
| Obrázek 2 | Image | ne | jen velký |
| Popis obrázku 2 | Plain text | ne | jen velký (`alt`) |

Pole rozdělit do **field groups** „Společné" a „Jen velký banner". Webflow
neumí pole podle `Typ` schovávat, ale skupina s jasným názvem a help textem
stačí — klient u malého banneru vyplní jen první skupinu.

V kolekci **Inspirace** přibude jedno pole:

| Pole | Typ | Cíl |
|---|---|---|
| Bannery v článku | Multi-reference | Bannery |

## Nastavení v Designeru — šablona `/inspirace/`

1. **Skrytý zdroj.** Na konec šablony vlož Div, custom atribut
   `data-banner-source`, Display `none`. Skrytí musí být v Designeru —
   kdyby skript nedojel, zdroj se nesmí ukázat. (Modul si `display: none`
   pro jistotu nastaví i sám.)
2. **Collection List** uvnitř, zdroj **Bannery v článku** (multi-reference
   aktuální položky, ne celá kolekce — do HTML se tak dostanou jen bannery,
   které článek opravdu používá).
3. Na **Collection Item** dej custom atributy:
   - `data-banner` → vazba na pole *Slug*
   - `data-banner-typ` → vazba na pole *Typ* (jen pro čitelnost v DOM)
4. Dovnitř položky vlož **dvě sekce** — `banner-cta-big` a `banner-cta-small`
   ve stejné struktuře, jakou má dnešní embed, s poli navázanými na CMS.
   Každé nastav **Conditional visibility**: `Typ = Velký`, resp. `Typ = Malý`.
5. **Náhradní místo** (volitelné, ale doporučené): Div s atributem
   `data-banner-fallback` pod poslední blok obsahu. Sem spadne banner, který
   je vybraný v CMS, ale klient na něj v textu zapomněl napsat `[banner]`.
   Bez něj takový banner tiše zmizí.

### Na co si dát pozor

- **Nepoužívej u obrázků grid child positioning.** Webflow z něj generuje
  `id="w-node-…"` a to by se v článku duplikovalo. Obrázky umísti přes třídu
  `banner-cta-big_image-wrapper` (flex), ne přes mřížku.
- **Nechej `attributes-richtext@1` v site head**, dokud nejsou přepsané
  všechny staré články. Nový systém ho nepotřebuje, ten starý na něm stojí.
- Vnořený Collection List (multi-reference) zobrazí **max 5 položek**.
  Na dva bannery v článku to bohatě stačí.
- Kolekce Bannery se lokalizuje jako každá jiná — texty pro `/en` a `/de`
  se vyplňují v příslušné locale.

## Návod pro klienta

**Nový banner:** CMS → Bannery → nový záznam. Vyplň název (podle něj banner
poznáš), vyber typ, doplň nadpis, text tlačítka a odkaz. U velkého banneru
navíc text a jednu nebo dvě fotky. Publikuj.

**Banner do článku:**

1. V článku dole v poli **Bannery v článku** zaškrtni ten, který tam chceš.
2. V textu na místo, kde má banner stát, napiš **na samostatný řádek**:

   ```
   [banner:pylony-velky]
   ```

   `pylony-velky` je slug banneru (je vidět v CMS pod názvem).

Zkrácený zápis: když napíšeš jen `[banner]`, vezme se další banner v pořadí,
jak jsou zaškrtnuté. Dva bannery v článku = dvakrát `[banner]`, žádné slugy.

Řádek `[banner:…]` musí být samostatný odstavec, ne uprostřed věty.
Když se banner nenajde, odstavec se smaže — čtenář nikdy neuvidí hranaté
závorky. Důvod je v konzoli prohlížeče.

## Migrace stávajících článků

24 URL v `/inspirace/` (8 článků × 3 jazyky). Postup na článek:

1. Z embedu opiš nadpis, text, tlačítko a obrázky do nového záznamu Bannery.
   Bannery se v článcích opakují — vznikne jich řádově pět, ne dvacet.
2. Smaž odstavec s escapovaným HTML, napiš `[banner:…]`.
3. Zaškrtni banner v poli Bannery v článku.

Po dokončení jde z site head pryč `attributes-richtext@1` a **audit sirotků
se dá zopakovat bez výjimky pro escapovaný HTML** — třídy bannerů budou
konečně na reálných prvcích v Designeru.

## Nasazení

Modul je součástí bundlu `dist/eldr.js`. Ten se ale v patičce webu zatím
nenačítá — live jsou pořád samostatné skripty `index.min.js` a `sliders.min.js`
na tagu `v1.2.27`. Než bannery pojedou, musí se patička přepnout na bundle.

Při editaci site head/footer **vždy nahrazuj celý obsah pole**, nikdy
„jen tenhle blok" — viz incident 2026-08-15 v `_backup/FINDINGS.md`.
