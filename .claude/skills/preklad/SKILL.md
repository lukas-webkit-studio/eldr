---
name: preklad
description: Překládá obsah webu eldr.cz z češtiny do němčiny a angličtiny — produktové stránky, blog (Inspirace), kariéru, reference i statické texty — a zapisuje je přes Webflow API do sekundárních locale /de a /en. Použij vždy, když padne „přelož", „dej to do němčiny / angličtiny", „doplň DE a EN", „chybí překlad", „translate", nebo když se řeší lokalizace eldr.cz — i bez slova „skill". NEPOUŽÍVEJ na jiné weby než eldr.cz a na překlad do jiných jazyků než DE a EN.
---

# Překlad eldr.cz do DE a EN

Prodejní překlad, ne strojový. Čeština na webu je psaná, aby prodávala —
překlad musí prodávat stejně. Věta po větě věrně, ale výsledek musí znít,
jako by ho psal rodilý mluvčí marketingu, ne překladač.

**Terminologie je závazná: [glosar.md](glosar.md).** Načti ho vždy, než
začneš překládat. Termíny v něm nejsou návrh — jsou to volby, které už na
webu platí, a rozcházet se s nimi znamená vyrobit nekonzistenci.

## Než napíšeš první větu

1. **Načti glosář** — `glosar.md` vedle tohoto souboru.
2. **Načti český originál z Webflow**, ne z `docs/translation/`. Dokumenty
   v `docs/translation/` jsou zdroj terminologie z roku 2023, ne aktuální
   obsah. Web se od té doby změnil.
3. **Načti i současný stav cílového locale.** Část obsahu už přeložená je.
   Přepiš jen to, co je česky nebo špatně — hotový a dobrý překlad nech být.

## Souřadnice webu

| | hodnota |
|---|---|
| site_id | `635940ec249b210e8902edd4` |
| primární locale | čeština — `localeId` `66052b1245cd8094542338a7`, `cmsLocaleId` `653ad95be882f528b35cb5ef` |
| angličtina `/en` | `localeId` `66052b1245cd8094542338a5`, `cmsLocaleId` `66052b1345cd8094542338ad` |
| němčina `/de` | `localeId` `66052b1245cd8094542338a6`, `cmsLocaleId` `66052b1345cd8094542338ae` |

Primární locale je **read-only** — přes API se do češtiny zapsat nedá a ani
nechceme. Píše se jen do sekundárních.

## Čím se kam zapisuje

Tohle je nejčastější zdroj omylů — každý druh obsahu má jiný nástroj.

| Obsah | Nástroj | Klíč locale |
|---|---|---|
| CMS položky (blog, reference, kariéra, výrobky) | `data_cms_tool > update_collection_items` | `cmsLocaleId` na položce |
| Text na statické stránce | `data_localization_tool > update_static_content` | `localeId` |
| Text v komponentě (nav, patička, CTA bloky) | `data_localization_tool > update_component_content` | `localeId` |
| Meta title, meta description, Open Graph | `data_pages_tool > update_page_settings` | `localeId` |

**SEO metadata nejdou přes lokalizační nástroj.** Jdou přes `data_pages_tool`
s `localeId`. Když je vynecháš, stránka má přeložený obsah a český title ve
výsledcích vyhledávání — což je ta horší polovina.

### Blog — kolekce Inspirace

`collection_id` = `66b0d0179491e21cce3f82f4`

Překládá se: `name`, `perex`, `obsah`, `obsah-2-cast`, `obsah-c-3`.

Nesahat na: `slug` (rozbily by se odkazy a URL jsou i v DE/EN české —
tak to je nastavené a je to v pořádku), `datum`, `hlavni-obrazek`,
`nahledovy-obrazek`, `fotografie-test`, `fotogalerie-c-2`, `kategorie`,
`autor`, `typ-fotogalerii-2`, `zobrazit-vice-fotogalerii`.

`obsah*` jsou RichText — vrací se jako HTML. **Překládej text uvnitř tagů,
strukturu nech nedotčenou.** Nadpisové úrovně, `<ul>`, `<strong>`, `<a href>`
i třídy zůstávají přesně jak jsou; mění se jen text mezi tagy a případně
`title`/`alt` atributy. Odkazy uvnitř textu přesměruj na odpovídající
locale (`/produkty/…` → `/en/produkty/…`), pokud cíl v daném locale existuje.

### Zakládáš CMS položku přes API?

`create_collection_items` s `cmsLocaleIds` je **jediný** způsob, jak dát
položce sekundární varianty — dodatečně u existující položky to nejde ani
přes API, ani v Designeru. A do seznamu patří **i primární locale**; jinak
položka v češtině vůbec nevznikne. Podrobně i s dalšími pastmi (mazání
neuvolní slug, slug je pole per locale) v `docs/bannery-cms.md`.

### Štítky blogu — kolekce Štítky

`collection_id` = `6752dfb620f8115ea35c9431`

Na rozdíl od Bannerů **lokalizované varianty má** — stačí `update_collection_items`
s `cmsLocaleId`. Překládá se jen `name`; `slug` a `barva` zůstávají.

| CZ | EN | DE |
|---|---|---|
| Novinky | News | Neuigkeiten |
| Inspirace | Inspiration | Inspiration |
| Ze života ELDR | Life at ELDR | Aus dem Leben von ELDR |
| Ze světa reklamy | From the world of advertising | Aus der Welt der Werbung |

**Názvy štítků jsou na `/inspirace` podruhé jako statické popisky filtru**
(Finsweet, `fs-cmsfilter-field="category"`). Finsweet páruje popisek filtru
s textem štítku u článku **na přesnou shodu**, takže obojí musí znít úplně
stejně. Přeložíš-li jen jednu stranu, filtrování v tom locale přestane
fungovat — bez chyby v konzoli, prostě nic nevyfiltruje.

### Hodnoty, které jsou ve skutečnosti klíče

Tyhle texty vypadají jako obsah, ale bundle je porovnává **na přesnou shodu
s českým řetězcem**. Přeložit je znamená tiše vypnout funkci — nic se
nerozbije viditelně, jen to přestane dělat, co má.

| Kde | Hodnota | Kdo ji čte |
|---|---|---|
| Bannery — `name` a `slug` | `3D nápisy – velký`, `pylony-maly`, … | `src/modules/05-banners.js` (`key()` na id i `.banner-name`) |
| Inspirace — `typ-fotogalerii-2` | `Vysoká fotogalerie` | `src/modules/32-gallery-height.js` (`textContent.trim() !== 'Vysoká fotogalerie'`) |

Obojí sedí ve skrytých prvcích (`[data-banner-source]`, `#gallery-option`),
takže návštěvník je nikdy neuvidí — čeština tam **patří** i v EN a DE.
Než začneš překládat nové pole, projdi `src/modules/` na doslovné porovnání
s českým textem; přibývají.

## Jak překládat

- **Nadpisy prodávají.** Doslovný převod českého nadpisu bývá v EN/DE mdlý.
  Zachovej funkci (upoutat, slíbit, vyzvat), ne slovosled.
- **Oslovení:** DE vždy „Sie", nikdy „du". EN druhá osoba, přímé „you".
- **Délka:** němčina roste o ~15 %. U nadpisů, tlačítek a štítků, které
  sedí v layoutu, drž délku blízko češtině — jinak se rozbije design.
- **Nepřidávej a neubírej tvrzení.** Záruka 5 let, 40 metrů, 1 000 projektů
  ročně — čísla a sliby jsou stejná ve všech jazycích.
- **Tokeny nech doslova.** V textech článků jsou dva druhy zástupných
  značek, které dopisuje až JS v prohlížeči: `[banner:nazev-banneru]`
  (modul `05-banners.js`) a `{#YOE#}` pro počet let na trhu (`10-vars.js`).
  Nepřekládej je, nepřepisuj a needituj mezery — musí zůstat znak po znaku
  stejné i v anglické a německé mutaci.
- **Redakční značky nepřekládej ani nekopíruj.** V podkladech se vyskytují
  `(proklik)`, `(odkaz)`, `(ukázky)`, `(click-through)`, `(link)`,
  `Button:`, `Metatitle:` a čáry z podtržítek. Jsou to poznámky pro
  zpracování, ne obsah — do webu nepatří.

## Ověření — vždy, než ohlásíš hotovo

Netvrď nic, cos neověřil. Po zápisu:

1. **Přečti zpět, co jsi zapsal** — `list_collection_items` s `cmsLocaleId`
   cílového locale, resp. `get_page_content` s `localeId`.
2. **Zkontroluj, že nezbyla čeština.** Projeď výsledek na české diakritické
   znaky (`ěščřžýáíéůú`) a na typicky české řetězce. Zbytek češtiny v DE
   textu je nejčastější závada — v původních podkladech takových zůstalo
   několik (viz glosář, sekce Známé chyby).
3. **Zkontroluj termíny proti glosáři.**
4. **Po publikaci stáhni živou stránku** (`curl https://www.eldr.cz/de/…`)
   a ověř, že se opravdu načítá přeložená verze.

## Publikace

**„Kdy publikovat" rozhoduje uživatel, ne ty.** Zápis přes API mění obsah
v Designeru; na web se dostane až publikací.

**Lokalizovaný CMS obsah jde na web jen přes publikaci celého webu.**
`publish_collection_items` publikuje pouze primární locale — ověřeno
1. 9. 2026 na článku `jak-vybrat-reklamni-pylon`: volání vrátilo úspěch
a prázdné `errors`, ale u obou sekundárních variant zůstal `lastPublished`
beze změny a na `/en/` i `/de/` se dál načítala čeština. Živě to bylo až po
`data_sites_tool > publish_site`. Necíluj tedy CMS publikaci a nehlas hotovo,
dokud jsi živou stránku neviděl přeloženou.

**Po `update_collection_items` se sekundární varianta vrátí jako
`isDraft: true`,** i když primární položka draft není. Než publikuješ, sraz
to zpátky: `update_collection_items` s `isDraft: false` na každé variantě.

Statický obsah stránek a komponent se publikuje taky jen celým webem.

Před `publish_site` si vytáhni `get_site` a porovnej `lastUpdated`
s `lastPublished`:

- **jsou blízko sebe** → v Designeru nikdo nic rozdělaného nemá, publikace
  pustí ven jen tvoje změny. (Editace CMS položek `lastUpdated` webu
  nezvedají, takže rozestup ukazuje opravdu jen práci v Designeru.)
- **`lastUpdated` je výrazně novější** → někdo něco rozdělaného má
  a publikace by to poslala ven s sebou. Zeptej se, nepublikuj naslepo.

Po publikaci vždycky stáhni živou stránku a ověř výsledek.

## Když narazíš na chybu v češtině

Překlep nebo nesmysl v českém originálu neopravuj potichu v překladu ani
v češtině (do primárního locale se stejně zapsat nedá). Přelož smysl
a chybu nahlas uživateli.
