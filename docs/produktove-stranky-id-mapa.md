# ID mapa duplikátu 3D nápisů

Každá stránka vzniklá `create_page` s `duplicateOf:
67cd93a208e0807c31816af3` (3D nápisy) má **stejná element ID** jako
předloha. Ověřeno na dvou nezávislých duplikátech (Zámečnické konstrukce,
Výstrče) — ID sedí do posledního znaku.

Díky tomu se nemusí strom stránky pokaždé prohledávat. `query_elements`
navíc pod kapotou volá `/v2/assets` a **naráží na 429** už po pár
voláních za sebou; mutace (`set_text`, `remove_element`, `set_style`,
`set_dom_id`, `set_settings`) tenhle limit nemají. Čtení tedy šetři,
zapisuj v dávkách.

`component` v `element_id` je vždy **ID stránky**, ne komponenty.

## Bloky stránky

| Blok | element |
|---|---|
| hero `header.section_header_product` | `51b75afb-8535-285d-4c5e-7c5259fe971c` |
| rozcestník `section_layout400` | `4986df31-c5f9-6b15-742d-6a42b1e51ad2` |
| mrtvá `section_cards.hide` (mazat) | `f3a2c0d7-5578-6f7e-a147-46f81af1c6db` |
| `section_layout253` | `12d758e8-b4c1-5e3d-1d60-e1f93db77e8c` |

### Hero

| Co | element |
|---|---|
| H1 (String) | `51b75afb-8535-285d-4c5e-7c5259fe9724` |
| podnadpis, 1. část | `51b75afb-8535-285d-4c5e-7c5259fe9726` |
| podnadpis, tučný úsek | `e15e5cf4-ac1a-00a8-e2d2-327abca8b3b9` |
| podnadpis, tečka | `e15e5cf4-ac1a-00a8-e2d2-327abca8b3ba` |
| štítek „Životnost desítky let" (String / kořen) | `1b5c8eb8-…cae0771` / `1b5c8eb8-0204-46bc-6be3-b7115cae076d` |
| štítek „Úsporné LED" | `ca8e8997-5af3-28a0-b066-99709db0fdcf` |
| štítek „Odborná montáž" | `4750f8c4-983f-faeb-c315-0e6e2a2344e9` |
| štítek „Kompletní servis" | `65805fe8-16f7-c9c2-c284-f7bd48a0c597` |

### Rozcestník

Uvozující věta: `4986df31-c5f9-6b15-742d-6a42b1e51adb`

| Karta | kořen (Link) | nadpis | popis | obrázek |
|---|---|---|---|---|
| 1 | `4986df31-…e51ade` | `…e51ae6` | `…e51ae9` | `…e51ae0` |
| 2 | `4986df31-…e51aea` | `…e51af3` | `…e51af6` | `…e51aec` |
| 3 | `4986df31-…e51af7` | `…e51b00` | `…e51b03` | `…e51af9` |
| 4 | `4986df31-…e51b04` | `…e51b0d` | `…e51b10` | |
| 5 | `1527740d-462a-eead-ca84-a49a4e8303a1` | `…8303aa` | `…8303ad` | |
| 6 | `55e431b2-09db-2e82-2fed-b46c4835a920` | `…4835a929` | `…4835a92c` | |

Prefix karet 1–4 je `4986df31-c5f9-6b15-742d-6a42b1e51`. Karty odkazují
`linkType: pageSection` na produktové sekce 1–6 ve stejném pořadí, takže
po smazání nadbytečných sekcí i karet zbytek sedí sám.

### `section_layout253`

Levý sloupec: nadpis `12d758e8-…77e98`, odstavec `…77e9a`, text tlačítka
`…77e9e`.

| Položka vpravo | nadpis | textové fragmenty (v pořadí) |
|---|---|---|
| 1 | `12d758e8-…77eaa` | `cd4f0604-ac87-a429-3db0-2b6c33015bbb`, `12d758e8-…77eac`, `b8c2d867-90b5-ef81-9bf2-d654e28441fe`, **`f88c3212-8702-f7b7-f3df-6ddc84232286`**, `f88c3212-…232287` |
| 2 | `12d758e8-…77eb3` | `12d758e8-…77eb5`, **`9b11c60b-ca0e-9cf7-5803-e2060b7e538a`**, `d4e2b012-576d-bbed-34ad-43c27ed4e1d8`, `0ef5a156-461a-2998-e502-004ef3a8e94c`, **`f6ccb7db-8cb1-6f71-e1d4-4357c518be32`**, `f6ccb7db-…518be33` |

Tučně = `Strong`.

## Produktové sekce

| # | id v předloze | element sekce |
|---|---|---|
| 1 | `profil-1` | `3b1868e6-f203-9b85-0f6f-e9fb15f06b1c` |
| 2 | `profil-3` | `cd2d0122-db01-458c-4f72-f9ec68809c07` |
| 3 | `profil-4` | `c9352813-4932-9bb7-94f1-70852d627444` |
| 4 | `profil-5s` | `20712323-2bf7-cd83-0598-56b1fc74cf5c` |
| 5 | `profil-8` | `a6b052bc-f10e-22fa-4bc6-ecc7537fcc42` |
| 6 | `profil-9` | `658e272e-f2a3-ec63-87f5-44cecf18e701` |

### Vnitřek sekcí 1–3

Sekce má tři „metatag" štítky; návrh má dva a **oba s ikonou**. Vzor
z hotové stránky: nechat štítky 2 a 3, druhému přidat combo
`margin-right margin-xxsmall` (`set_style` na `["product_metatag-link",
"margin-right","margin-xxsmall"]`) a **smazat štítek 1** (ten jediný
ikonu nemá). Levnější než ikonu dostavovat.

| Co | sekce 1 | sekce 2 | sekce 3 |
|---|---|---|---|
| štítek 1 (kořen, mazat) | `39d70114-…179ec1` | `cd2d0122-…809c11` | `c9352813-…62744e` |
| štítek 2 kořen / text | `…179ec4` / `…179ec8` | `…809c14` / `…809c18` | `…627451` / `…627455` |
| štítek 3 kořen / text | `…179ec9` / `…179ecd` | `…809c19` / `…809c1d` | `…627456` / `…62745a` |
| H2 | `3b1868e6-…f06b28` | `cd2d0122-…809c20` | `c9352813-…62745d` |
| úvodní odstavec | `4ac62fd0-491f-79d8-3fd1-21b03f03d0f1` | `cd2d0122-…809c23` | `c9352813-…627460` |
| odrážka 1 — tučné / text | `03e81e56-…ffd913` / `09f0c9f7-…363944` | `cd2d0122-…809c27` / `5e0b1f00-…192626` | `c9352813-…627464` / `5b6ecf6e-…94aedc` |
| odrážka 2 — tučné / text | `5df32ee1-…8734d51e` / `0c32000f-…b22a08e` | `cd2d0122-…809c2b` / `f9f91647-…c658c8` | `c9352813-…627468` / `eb46b0bc-…d89b282` |
| odrážka 3 — tučné / text | `b1a9e7f5-…c7d0fc4de5` / `cc850fe4-…c450179` | `cd2d0122-…809c2f` / `69336865-…9a6ede` | `c9352813-…62746c` / `1193f119-…ba776d26` |
| přebytečný tučný úsek v odrážce 2 (mazat i s ocáskem) | `bf073eaf-…8fd65` + `…8fd64` | — | `952f4ef2-…ddf43c` + `…ddf43a`/`…ddf43b` |

Prefixy: sekce 1 `39d70114-ade1-45a0-146e-b7e539179…` (štítky) a
`3b1868e6-f203-9b85-0f6f-e9fb15f06…`, sekce 2
`cd2d0122-db01-458c-4f72-f9ec68809…`, sekce 3
`c9352813-4932-9bb7-94f1-70852d627…`.

### Galerie

| Sekce | obal `div.slider` | `ImageSlider__Collection` | `PopUpSlider__Collection` |
|---|---|---|---|
| 1 | | `3fcad9d6-7d88-259e-8f1c-ac6ec5fa0325` | `3fcad9d6-…5fa0312` |
| 2 | `cd2d0122-…809c37` | `cd2d0122-…809c55` | `cd2d0122-…809c42` |
| 3 | | `c9352813-…627492` | `c9352813-…62747f` |

Filtr se zapisuje `set_settings`, klíč `filters`:

```json
[{"fieldSlug":"produkt-2","operator":"equals","value":"<id možnosti>"}]
```

## ID možností galerie (`produkt-2`, kolekce `646d5c52aab44e9fcf5974b8`)

| Možnost | id |
|---|---|
| Výstrče | `5273a08b6e2765b73ab9f3a08e4dc494` |
| Lékárenské znaky | `fa6d1c87bd1ff6f53657605679f5335c` |
| Zámečnické konstrukce | `a637df9de32203cc02f75910d11cebc6` |
| Atypické zámečnické konstrukce | `e54aa444019c4c77239680077d731afb` |
| Opracování a prodej plexiskla a polykarbonátu | `63f56c938779601245607e12a7c15fcb` |
| Velkoformátový digitální tisk | `63c0a542d2775da0427b15117791169a` |
| Řezaná grafika | `5c3a901c9efde2edfb74d2c537e91f50` |
| Další druhy polepů | `e85204ffd45cfebffe921b4d4d9da972` |
| Vstupní portály na míru | `bf8bafc8e6e5fa89b90389d393995c26` |
| Architektonické světelné prvky | `a7f0413a080fd62e1c1fcefaa590197c` |
| Reklamní vlajky | `0d408807ca468d67d92b4ed9ebc70902` |
| Prvky podpory prodeje | `f3e37d06557e5f83e1c44d03bc4a8523` |
| Led displaye | `33454324a752154a9603b176f66709ed` |
| Světelné panely | `68a38dad7ecc982882ae39962a6c62e6` |
| Intarzie | `9ea07e6357b2e3f0f9ab291e2def6c46` |
| Reklamní tabule | `9f7038c9681b452bf81af8afb3ac1959` |
| Menuboardy/infoboardy | `c509110babf75fd1ad0593238cb30bf2` |
| Designová svítidla | `16381f137ade6350f8c73b9ac418b241` |
| „Žárovkové" světelné nápisy | `673549040e1cb35f4d4cf5552c7d3664` |
| Neonová reklama | `65991def267b320e4fab565ebc8569cb` |
| Mechové stěny | `0bcc5407ab1bb6b1feb27be391530550` |
| Světelná čísla domů | `40a173437d4414b7edfaa4bf3c122a97` |
| Designové lampy | `791c3122d677866f082918bf37a67495` |

### Sekce bez galerie v CMS

Pro čtyři sekce z návrhu **možnost v `produkt-2` neexistuje**:

- Atypické výstrče
- Designové obrazy
- LED obrazovky
- Reklama z cortenového plechu

Přes API se do `Option` pole nová možnost přidat nedá
(`update_collection_field` umí jen jméno, nápovědu a povinnost). U těchto
sekcí se proto **skryje celý obal `div.slider`** (`set_visibility` na
`false`). U „LED obrazovek" a „Reklamy z cortenového plechu" to odpovídá
i živému webu — galerii tam nemají.
