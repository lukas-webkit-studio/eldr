# Ověření: zamecnicke-konstrukce-na-miru-opracovani-plexiskla

- **Ověřeno:** 30. 10. 2026, 22:33 UTC, nezávislý ověřovatel (ne autor dat).
- **Nový snímek:** `node scripts/ai-vrstva/snapshot.js --out …/overeni/<slug> <slug>` (cs 142 bloků, en 138, de 138).
- **Diff proti `_zdroj/<slug>.<lang>.txt`:** cs, en, de beze změny.
- Surové HTML všech tří jazyků: karty rozcestníku odkazují na `href="#zamecnicke-konstrukce"`
  a `href="#opracovani-a-prodej-plexiskla"` – karty a sekce jsou tentýž výrobek.

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 41 | 33 | 3 | 0 | ✅ 33/33 (100 %) |
| en | 41 | 33 | 3 | 0 | ✅ 33/33 (100 %) |
| de | 41 | 33 | 3 | 0 | ✅ 33/33 (100 %) |

Klíče a pořadí výrobků stejné ve všech jazycích: `zamecnicke-konstrukce`, `atypicke-zamecnicke-konstrukce`,
`opracovani-a-prodej-plexiskla`. EN/DE citují EN/DE stránku.

## Nálezy

1. **Štítek „1–40 m výška“ v hero** (EN „1–40 m height“, DE „1–40 m Höhe“) byl v `highlights`. Na stránce
   není řečeno, čeho se výška týká; žádná sekce výšku neuvádí a u plexiskla (polovina stránky) nedává smysl.
   Jediné místo na webu, kde je 1–40 m doloženo, je stránka pylonů („Výška reklamních věží se pohybuje
   od 1 do 40 metrů“). → **Vyhozeno** do `vynechano`, viz „K rozhodnutí“.
2. **Kostrbaté názvy vlastností** u plexiskla: „přesností“ = 1/10 mm, „řezné ploše“ = 2 000 × 4 000 mm
   (EN „accuracy“, „cutting area“; DE dokonce „genau“). → **Vlastnosti zrušeny**; celá věta zůstává
   v popisu výrobku, takže údaje nezmizely.
3. **Citace názvu ukazovala na jiný text** (cs): výrobek „Zámečnické konstrukce“ citoval H1
   „Zámečnické konstrukce na míru, opracování plexiskla“, ačkoli `vynechano` tvrdilo, že je z karty.
   V EN/DE naopak název plexiskla citoval odstavec karty místo nadpisu sekce. → **Opraveno**: název
   prvního výrobku cituje kartu (H3), název třetího nadpis sekce (H2), shodně ve všech jazycích.
4. **Technologie zařazené jako provedení**: „svařování, ohýbání a další obrábění kovů“ bylo ve `variants`
   u dvou výrobků – generátor by to označil „Provedení“, což význam mění. Údaj je i ve vlastnosti
   Materiály (Materiály a technologie). → **Vyhozeno z variants** (6×).
5. **Věta ve špatné kategorii**: „Každý projekt přizpůsobujeme požadavkům, provozu i prostředí…“ byla
   v `uses` (umístění/použití). → **Přesunuto do `variants`**.
6. **Dostupnost a lhůta jako provedení**: „Většinu barev a tabulí držíme skladem, jsme tedy schopni
   připravit plexisklo na míru na počkání.“ → **Vyhozeno** do `vynechano` (sliby lhůt se nepřebírají,
   stejně jako blok o průběhu zakázky).
7. **Marketing v hodnotě vlastnosti**: Technologické zázemí končilo „…které zaručují prvotřídní zpracování“.
   → **Opraveno**: hodnota zkrácena na souvislý úsek o vybavení (pily). Sériová výroba: hodnota zkrácena
   na první větu, věty o zákaznících zůstávají v `uses`.
8. `vynechano` u rozcestníku – **doplněno zdůvodnění** o odkazech karet na kotvy (bod 5 zadání).

## Zkontrolováno a ponecháno

- Hero štítek „{#YOE#} let zkušeností“ správně vynechán (tvrzení o firmě, bez JS jen token).
- `page.description = null` – pod H1 opravdu perex není.
- `uses` u plexiskla: „Naše řešení využívají truhláři, optiky, banky i orchestry.“ a „Spolupracujeme
  s výrobci interiérových prvků (nábytek).“ – popis odvětví, kde se výrobek používá, ne superlativ;
  ponecháno. Kdyby měl klient vrstvu přísnější, druhá věta je spíš o firmě než o výrobku.
- Popis prvního výrobku mluví o „reklamních nosičích“ (sekce), karta o „konstrukcích“. Ponechán text sekce.
- FAQ: na stránce žádná otázka s odpovědí kromě obecného bloku o průběhu zakázky → prázdné správně.
- Chybějící údaje: při průchodu snímkem nic nechybí.

## K rozhodnutí člověkem

- **„1–40 m výška“ – patří na stránku?** Nejde o doslovně zkopírovaný štítek z hero pylonů (ten má jiné
  štítky). Šablona těchto stránek má třetí štítek proměnný („Neomezená kreativita“, „Vlastní grafické
  studio“), tady někdo zapsal „1–40 m výška“. Číslo odpovídá výšce reklamních věží z pylonů a dává smysl
  jen pro nosné konstrukce (pylony, billboardy), ne pro plexisklo. Doporučení: zeptat se klienta, zda
  zámečnické konstrukce do 40 m opravdu dělá. Když ano, doplnit to do textu sekce `#zamecnicke-konstrukce`
  (pak to půjde do vrstvy jako vlastnost výrobku); když ne, štítek ve Webflow vyměnit. Do té doby ve vrstvě není.
