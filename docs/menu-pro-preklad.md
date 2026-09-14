# Menu: co se změnilo a co s tím v EN a DE

Podklad pro chat, který dělá překlady. Týká se **jedné komponenty**
`Navbar_2024-12` — je společná pro celý web, takže stačí projít ji.

## Jak je menu postavené (důležité pro pochopení)

Odkazy v rozbalovacím menu nejsou vázané na stránku, ale na **ručně
napsanou URL** (`linkType: url`). Webflow je proto **nepřefixuje sám** —
prefix `/en/` a `/de/` je u každého odkazu vypsaný ručně a je součástí
překladu.

Z toho plynou dvě pravidla:

1. **Text odkazu se překládá.**
2. **URL se nepřekládá** — slug i kotva za `#` zůstávají česky. Mění se
   jen prefix: `/produkty/…` → `/en/produkty/…` resp. `/de/produkty/…`.

Příklad, jak to má vypadat (existující, správně přeložený odkaz):

| | |
|---|---|
| CS | `Světelné panely` → `/produkty/tabule-a-svetelne-panely#svetelne-panely` |
| EN | `Advertising boards` → `/en/produkty/tabule-a-svetelne-panely#svetelne-panely` |
| DE | (německý text) → `/de/produkty/tabule-a-svetelne-panely#svetelne-panely` |

## Úkol 1: doplnit chybějící prefix u šesti odkazů

V EN i DE mají tyhle odkazy URL **bez prefixu**, takže z anglické
i německé verze odskakují do české. Oprav je na `/en/…` resp. `/de/…`:

| Odkaz (CS text) | URL, která tam teď je |
|---|---|
| Atypické výstrče | `/produkty/vystrce-lekarenske-znaky#atypicke-vystrce` |
| Atypické zámečnické konstrukce | `/produkty/zamecnicke-konstrukce-na-miru-opracovani-plexiskla#atypicke-zamecnicke-konstrukce` |
| Designové obrazy | `/produkty/velkoformatovy-tisk#designove-obrazy` |
| Polepy | `/produkty/velkoformatovy-tisk#dalsi-druhy-polepu` |
| (odkaz s prázdným textem) | `/produkty/3d-napisy-loga-a-jednotliva-pismena#profil-9` |
| Výstrče a lékárenské znaky (odkaz na kategorii) | `/produkty/vystrce-lekarenske-znaky` — **jen v EN** |

První tři jsou nové odkazy, čtvrtý je opravená kotva (byla chybně
`#polepy`, ta sekce neexistuje). Poslední dva jsou starší nedodělky,
které se objevily při kontrole.

## Úkol 2: přeložit texty tří nových odkazů

V EN a DE zatím zůstal český text:

| CS | Co to je |
|---|---|
| **Atypické výstrče** | výstrče ve tvaru symbolu oboru — zub, nůžky, klíč |
| **Atypické zámečnické konstrukce** | nestandardní kovové konstrukce — zastávky, střídačky, přístřešky |
| **Designové obrazy** | tištěné obrazy na plátno a desky do interiéru |

## Úkol 3: skrýt „LED obrazovky" i v EN a DE

Odkaz **LED obrazovky** (`…#led-obrazovky`) je v české verzi skrytý —
sekce zatím nemá podklady. **Viditelnost je ve Webflow nastavená zvlášť
pro každý jazyk**, takže v EN a DE se odkaz pořád zobrazuje. Skryj ho
i tam (v Designeru přepnout viditelnost prvku, ne mazat).

Až podklady přijdou, odkryje se na všech třech místech najednou.

## Na co se ještě podívat

V EN sedí popisky u tří odkazů podezřele:

| Kotva | EN text | Co to česky je |
|---|---|---|
| `#svetelne-panely` | Advertising boards | Světelné panely |
| `#intarzie` | Illuminated panels | Plexi intarzie |
| `#reklamni-tabule` | Projecting signs | Reklamní tabule |

„Projecting signs" jsou výstrče, ne reklamní tabule — vypadá to, že se
překlady o jeden řádek posunuly. Není to z téhle várky změn, ale když už
se do menu půjde, stojí za ověření.
