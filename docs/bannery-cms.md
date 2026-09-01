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

## Stav — hotovo, čeká na publish

Ve Webflow je všechno postavené. **Zbývá jediné: publikovat web.**

- kolekce **Bannery** (`6a90303011d6493faa8a946a`) — 15 záznamů vytažených
  ze živého webu, obrázky napojené na stávající assety
- skrytý zdroj na šabloně `/inspirace/` (`66b0d0179491e21cce3f8302`) —
  Collection List nad celou kolekcí, obě provedení banneru navázaná na CMS
- všech **8 článků přepsáno** na tokeny, ověřeno bajt po bajtu proti
  původnímu textu; žádný starý embed nezůstal
- site head i footer bumpnuté na commit `f0200cd`
- šablona `Bannery Template` přepnutá na draft, ať nevznikne veřejná
  stránka `/bannery/…` s tenkým obsahem

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
3. Uvnitř položky **Div `.banner-item`**, jeho **DOM id navázané na Slug**.
   Tohle je klíč, na který míří `[banner:…]`.
4. V něm **Div `.banner-name`** (display none) s **textem navázaným na Name** —
   druhý klíč, aby klient mohl psát i „Pylony – velký".
5. Vedle něj **dvě sekce** — `banner-cta-big` a `banner-cta-small` ve stejné
   struktuře, jakou má dnešní embed, s poli navázanými na CMS. Každá má
   statický atribut `data-banner-variant` (`velky` / `maly`).
6. Velké sekci nastav **viditelnost navázanou na přepínač Velký banner**.
   Malá zůstává vždy viditelná — modul si vybere tu, která projde.
7. Obrázkům nech **Loading: lazy**. Ve skrytém zdroji se pak nestahují;
   stáhnou se až po vložení do článku.

### Proč zrovna takhle

Webflow Data API **neumí** dvě věci, které by se v Designeru naklikaly:
navázat custom atribut na položce Collection Listu a nastavit podmíněnou
viditelnost podle Option pole. Odtud DOM id místo `data-banner`, skrytý text
místo `data-banner-name` a Switch místo Option. Kdo to bude překopávat ručně
v Designeru, může použít i původní varianty — modul je na klíče nenáročný,
jen musí sedět `.banner-item`, `.banner-name` a `data-banner-variant`.

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

**Přejmenování až po publikaci.** Struktura je zatím postavená na starých
třídách, aby vzhled seděl 1:1. Přejmenovat je jde teprve až bude nový systém
odpublikovaný a ověřený — do té doby drží vzhled i staré publikované články.

### Mezera nad a pod bannerem

Odsazení banneru je **ve Webflow na třídách** `banner-cta-big`
a `banner-cta-small`: `margin-top` i `margin-bottom` 64 px. Chceš-li ho
změnit, měň ho tam, ne v kódu.

V kódu je jen to, co style panel zapsat neumí — vynulování odsazení
u sousedů. V rich textu totiž mezery nedrží margin, ale padding odstavců
a nadpisů (`p { padding-bottom: 19px }`, `h2 { padding-top: 1.5em }`),
a padding se do margin collapsingu nepočítá. Mezera kolem banneru proto
vycházela pokaždé jinak podle toho, co kolem něj náhodou stálo:

| sousedi | před opravou | po opravě |
|---|---|---|
| odstavec → banner | 83 px | 64 px |
| banner → nadpis | 136 px | 64 px |
| banner → odstavec | 0 px (text se lepil na pruh) | 64 px |

Modul `05-banners.js` proto při vkládání označí banner třídou `eldr-banner`
a jeho předchůdce třídou `eldr-banner-before`; na ty visí dvě pravidla
v `src/eldr.css`. Zároveň zahodí prázdné odstavce těsně kolem banneru,
takže klient nemusí hlídat, kolikrát odentroval. Dva bannery za sebou se
nevynulují — mezi nimi zůstane 64 px.

Token v odrážce vloží banner **až za celý seznam**, ne doprostřed něj —
banner musí být přímý potomek rich textu, jinak na něj pravidla nesednou.

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

**Dnes není přeložený vůbec nic.** Ověřeno na všech 24 URL: `/en` i `/de`
články jsou celé česky včetně bannerů. Rich text se nikdy nelokalizoval,
mutace jen padají na primární češtinu.

**Hotovo od 1. 9. 2026.** Kolekce Bannery má lokalizované varianty ve všech
třech locale a texty jsou přeložené. Anglický čtenář dostane anglický banner
v anglickém článku, německý německý.

**Proč to dřív nefungovalo.** Všech 15 bannerů mělo `createdOn` shodné na
milisekundu — vznikly jedním dávkovým zápisem přes API, kterému se nepředal
`cmsLocaleIds`. Webflow proto sekundární varianty vůbec nezaložil.
Dokumentace Webflow to potvrzuje: *„For any Collection items that already
exist, you must add the desired secondary locales in the CMS panel within
the Designer. You can't add a new locale to an existing item via the API."*
Přes API to u existující položky dodatečně nešlo a v CMS panelu nebylo co
otevřít, protože seznam byl v EN prázdný. Řešilo se to smazáním a založením
znovu s `cmsLocaleIds`.

### Pasti, na které se přišlo při migraci

**`cmsLocaleIds` musí obsahovat i primární locale.** Když se pošlou jen
sekundární, položka vznikne **jen** v nich a česká varianta neexistuje.
Pro tenhle web je správně:
`["653ad95be882f528b35cb5ef", "66052b1345cd8094542338ad", "66052b1345cd8094542338ae"]`.

**Smazání slug neuvolní.** `delete_collection_items` mazání jen naskladní;
slug drží publikovaná verze a uvolní se až publikací celého webu. Nejde
tedy smazat položku a hned ji ve stejném volání založit se stejným slugem —
skončí to `Unique value is already in database`. Buď zakládej s dočasným
slugem a přejmenuj po publikaci, nebo počítej se dvěma publikacemi.

**Slug a Name jsou pole per locale.** Přejmenování v primárním locale se do
sekundárních nepropíše — musí se zapsat zvlášť s `cmsLocaleId`. Drž je ve
všech mutacích česky, jsou to klíče pro `[banner:…]`.

**Obrázkové pole chce `url`, `fileId` samo nebere.** Při zakládání položky
z URL existujícího assetu Webflow obvykle vyrobí nový asset a název souboru
znovu procentuálně zakóduje (`%25` → `%2525`). Funguje to (ověřeno HTTP 200),
ale v assetech zůstanou duplikáty.

**Pravidlo do budoucna:** každý nový banner zakládaný přes API musí mít
`cmsLocaleIds` se všemi třemi locale. Položka založená ručně v Designeru
varianty dostane sama.

**Dvě pravidla, aby to drželo:**

1. **Nelokalizuj obsah polí Name a Slug.** Nech je ve všech mutacích česky —
   jsou to klíče, na které míří `[banner:…]` v textu.
2. **Nepřekládej token.** `[banner:pylony-velky]` zůstává v anglickém
   i německém článku doslova stejný.

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

**Odentrovávat nemusíš.** Dopiš odstavec, enter, napiš token, enter, piš dál.
Kolem banneru vyjde 64 px nad i pod, ať za ním stojí nadpis, odstavec nebo
odrážky. Prázdné řádky kolem tokenu se zahodí, takže když jich tam pár
zůstane, na vzhledu se to neprojeví.

## Migrace stávajících článků

Bannery jsou už v CMS, takže na článek zbývá jen: smazat odstavec
s escapovaným HTML a napsat na jeho místo token. Pozice odpovídají živému webu.

**Stačí přepsat 8 článků v české (primární) mutaci.** `/en` a `/de` dnes
nemají vlastní text a padají na češtinu, takže token zdědí samy.

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

Site head i footer už ukazují na commit `f0200cd`, kde je modul součástí
bundlu. Zbývá **publikovat web** — do té doby na živém webu běží pořád
starý stav.

Při editaci site head/footer **vždy nahrazuj celý obsah pole**, nikdy
„jen tenhle blok" — viz incident 2026-08-15 v `_backup/FINDINGS.md`. A vždy
si aktuální stav vytáhni z API, ne ze zálohy v repu; ta byla 27. 8. o dva
kroky pozadu a tvrdila, že patička jede na `v1.2.27`.

### Po publikaci zkontrolovat

1. `/inspirace/jak-vybrat-reklamni-pylon` — malý i velký banner sedí na
   stejném místě jako dřív
2. konzole prohlížeče je bez `[ELDR bannery]` hlášek
3. klik na tlačítko banneru pošle do dataLayer `button_click`
