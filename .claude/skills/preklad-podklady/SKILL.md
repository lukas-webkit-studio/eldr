---
name: preklad-podklady
description: Překládá podklady pro web eldr.cz — články na blog, texty stránek, novinky — z češtiny do angličtiny a němčiny, z Google Docu, Wordu (.docx) nebo vloženého textu, podle závazného glosáře načteného z GitHubu. Výstupem jsou nové dokumenty po jazycích se stejnou strukturou jako čeština, nezávislá kontrola a report, co je hotové, co ověřit a co je pro programátora. Použij vždy, když někdo chce článek nebo text „přeložit", „dát do angličtiny / němčiny", „udělat EN a DE verzi", „připravit podklady ve třech jazycích", „hodit to do němčiny" — i bez slova skill, i když mluví jen o jednom jazyku, i když jen pošle odkaz na dokument a napíše „přelož". NEPOUŽÍVEJ na zápis do Webflow (na to je skill `preklad`) ani na překlad pro jiné weby než eldr.cz.
---

# Překlad podkladů pro eldr.cz

Autor píše článek česky v Google Docu nebo ve Wordu. Ty z něj uděláš
anglickou a německou verzi, které někdo jiný **beze změn vloží do Webflow**.
Z toho plyne všechno níž: překlad musí prodávat stejně jako čeština, musí
používat terminologii, která už na webu platí, a musí mít **stejnou
strukturu** jako originál — jinak vkládání přestane být mechanické.

Do Webflow nezapisuješ. Nemáš k němu přístup a ani ho nepotřebuješ.

## 1. Než začneš — glosář z GitHubu

Terminologie je závazná a žije v repu `lukas-webkit-studio/eldr`. Není to
návrh — jsou to volby, které už na webu platí. Vždy načti **aktuální** verzi,
ne to, co si pamatuješ z minula:

- nástroj GitHub `get_file_contents`
- `owner`: `lukas-webkit-studio`, `repo`: `eldr`
- `path`: `.claude/skills/preklad/glosar.md`, `ref`: `refs/heads/main`

Obsah přijde jako text (kdyby přišel v base64, dekóduj ho). Přečti celý.
Sekce 1–4 jsou termíny, 5 je styl, 6 redakční značky.

Když GitHub není připojený nebo repo nejde přečíst, **zastav se a řekni to**.
Bez glosáře vyrobíš překlad, který se rozejde s webem — a to je přesně to,
čemu má tenhle postup zabránit. Nepřekládej „zatím bez glosáře".

## 2. Zdroj

Vezmi, co uživatel dal, a přečti to **celé**, včetně nadpisu, perexu,
případných polí jako meta title / meta description a poznámek na konci.

- **Google Doc** — odkaz nebo název. Podle názvu nejdřív `search_files`,
  pak `read_file_content` s přesným `fileId`. Nikdy `fileId` neodhaduj.
- **.docx na Drivu** — `read_file_content` ho přečte také.
- **.docx jako soubor** nebo **vložený text** — pracuj s tím přímo.

Čtečka Google Docu vrací text jako markdown a některé znaky **escapuje
zpětným lomítkem** (`{\#YOE\#}`, `\[banner:…\]`). To dělá čtečka, ne
dokument. V překladu piš tokeny čistě, bez lomítek.

## 3. Dvě otázky, ne víc

Zeptej se **v jedné zprávě** a jen na to, co uživatel ještě neřekl:

1. **Do jakých jazyků** — výchozí je angličtina i němčina. Když řekl jen
   jeden, ber jeden.
2. **Kam** — možnosti:
   - nový Google Doc na každý jazyk, ve stejné složce jako originál
     (výchozí, když je zdroj Google Doc),
   - soubory `.docx` na každý jazyk (výchozí, když je zdroj Word),
   - text rovnou sem do chatu.

Vložit překlad **do stávajícího dokumentu** jako další stránku nebo kartu
neumíš — connector existující Google Doc needituje. Když to uživatel chce,
řekni to rovnou a nabídni nový dokument vedle.

Na nic dalšího se neptej. Nejasnosti v textu vyřeš překladem podle smyslu
a napiš je do reportu.

## 4. Jak překládat

**Prodejní, ne strojový.** Čeština na webu je psaná, aby prodávala.
Věta po větě věrně, ale výsledek musí znít, jako by ho psal rodilý mluvčí
marketingu. Nadpisy prodávají — zachovej jejich funkci (upoutat, slíbit,
vyzvat), ne slovosled.

**Termíny z glosáře.** Když se v textu objeví něco, co glosář má, použij
přesně to. Když glosář termín nemá, přelož podle oboru a **napiš to do
reportu jako návrh do glosáře** — uživatel nemá do repa zápis, doplní to
správce.

**Styl** podle sekce 5 glosáře: němčina vždy „Sie", nikdy „du"; angličtina
britský pravopis s koncovkami -ize, nadpisy větným psaním; čísla ve formátu
daného jazyka. Němčina je asi o 15 % delší — u nadpisů to hlídej.

**Nepřidávej a neubírej tvrzení.** Čísla, záruky, roky, ceny, jména osob
a firem jsou stejné ve všech jazycích. „Elektro Drapač" se nepřekládá
a neskloňuje.

**Tokeny znak po znaku.** V textech se vyskytují `{#YOE#}` (počet let na
trhu, dopisuje ho web) a `[banner:nazev-banneru]` (vloží banner). Musí
zůstat přesně stejné, na stejném místě, i v angličtině a němčině.

**Odkazy na web přepiš na jazykovou verzi.** `/produkty/pylony-a-totemy`
→ `/en/produkty/pylony-a-totemy` resp. `/de/…`. Mění se **jen prefix** —
slug a kotva za `#` se nepřekládají. Plné adresy `https://www.eldr.cz/…`
stejně: prefix hned za doménou. Cizí adresy nech být.

**Redakční značky** ze sekce 6 glosáře (`(proklik)`, `Button:`,
`Metatitle:` …) nepřekládej ani nekopíruj. Výjimka: když je dokument
**strukturovaný do polí** (Název / Perex / Meta title / Meta description /
Obsah), zachovej popisky polí, ať ten, kdo vkládá, ví, co kam patří —
přelož hodnoty, popisky nech.

**Meta title** drží tvar `Téma | Elektro Drapač`. Emoji v meta description
zachovej i s pozicí.

## 5. Struktura 1:1

Ten, kdo bude překlad vkládat, jede odstavec po odstavci proti češtině.
Proto: stejné úrovně nadpisů, stejný počet odstavců, stejné odrážky ve
stejném pořadí, tučné a kurzíva na stejných místech, odkazy na stejných
slovech. Nespojuj dva odstavce v jeden, nerozděluj jeden na dva, nepřidávej
shrnutí ani úvod, který v češtině není.

**Nový Google Doc:** poskládej obsah jako HTML (`h1`–`h3`, `p`, `ul`/`ol`,
`strong`, `em`, `a href`) a založ ho přes `create_file` s
`contentMimeType: text/html` — Drive z něj udělá Google Doc a strukturu
zachová. `parentId` dej stejný, jako má zdroj (najdeš ho v metadatech
zdroje), název `Původní název – EN` / `– DE`. Ověřeno: nadpisy, tučné,
seznamy, odkazy i tokeny přežijí.

**Soubory .docx:** použij skill pro Word, stejná pravidla struktury.

## 6. Kontrola — až po zápisu, ne z paměti

Překladatel svůj text schválí vždycky. Skutečné chyby chytí až někdo,
kdo ho čte poprvé. Proto po zápisu **znovu načti hotové dokumenty**
(`read_file_content` na nově založené `fileId`, resp. otevři hotový
soubor) a projdi je, jako bys je nepsal ty:

1. **Čeština.** Nezůstalo české slovo, věta, nadpis? Diakritika
   `ěščřžýáíéůú` mimo vlastní jména a „Drapač" je varování.
2. **Struktura.** Spočítej nadpisy po úrovních, odstavce, položky seznamů
   a odkazy v češtině a v každém jazyku. Musí sedět.
3. **Tokeny a odkazy.** Každý `{#YOE#}` a `[banner:…]` z češtiny je tam
   znak po znaku (bez zpětných lomítek čtečky). Interní odkazy mají
   prefix jazyka a nezměněný slug.
4. **Glosář.** Klíčové termíny textu proti sekcím 1–4. Zvlášť hlídej:
   *illuminated advertising* (ne lighted / light), *Leuchtreklame*
   (ne Lichtwerbung), *acrylic glass* (ne plexiglass), *projecting sign*
   / *Ausleger*, *wayfinding* / *Wegeleitsystem*.
5. **Němčina.** Nikde „du", „dein", „Zeig", „Mach". Všude „Sie".
6. **Angličtina.** Nadpisy větným psaním, britský pravopis, -ize.
7. **Čísla a tvrzení.** Stejná ve všech jazycích. Žádné nové sliby.
8. **Zní to prodejně?** Přečti nadpisy a první odstavec nahlas v hlavě.
   Když zní jako překladač, přepiš.

Co najdeš, oprav a **tu část zkontroluj znovu**. Teprve pak report.

## 7. Report

Až po kontrole, vždy v tomhle tvaru:

```
## Hotovo
- [jazyk]: [odkaz nebo název dokumentu / souboru]
- zkontrolováno: struktura N nadpisů / N odstavců / N odkazů sedí ve všech jazycích,
  tokeny X, odkazy Y, čeština 0

## K ověření (rozhodne autor)
- [termín / jméno / číslo, které nejsou v glosáři nebo jsou nejasné, a co jsi zvolil]

## Pro programátora / správce webu
- [tokeny a bannery v textu, odkazy na stránky, které možná v daném jazyce neexistují,
  cokoli, co má dopad na web mimo samotný text]

## Návrhy do glosáře
| Česky | English | Deutsch | kde v textu |
```

Prázdnou sekci nech s pomlčkou, nevynechávej ji — ten, kdo report čte,
se spoléhá na to, že tam vždycky je.

## Co tenhle skill nedělá

- Nepíše do Webflow a nepublikuje. To je práce správce webu.
- Nemění stávající dokumenty — zakládá nové vedle nich.
- Neopravuje češtinu. Překlep nebo nesmysl v originále přelož podle
  smyslu a nahlas ho v reportu; do originálu nesahej.
