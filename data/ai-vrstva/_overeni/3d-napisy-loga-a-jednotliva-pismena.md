# Ověření: 3d-napisy-loga-a-jednotliva-pismena

- **Ověřeno:** 30. 10. 2026, 22:34 UTC. Stránka byla znovu načtena
  (`snapshot.js --out …/overeni/3d-napisy-loga-a-jednotliva-pismena`) ve všech
  třech jazycích.
- **Diff proti snímku autora** (`_zdroj/…{cs,en,de}.txt`): **beze změny**
  ve všech třech jazycích.
- **Surové HTML** (`curl https://www.eldr.cz[/en|/de]/produkty/…`): každá ze
  šesti přehledových karet je `<a href="#profil-…">` (každá dvakrát, dvě
  verze karty), sekce mají `id="profil-1"`, `profil-3`, `profil-4`,
  `profil-5s`, `profil-8`, `profil-9`. Stejně v cs, en i de.

## Souhrn

| Jazyk | Údajů před | Údajů po | Výrobků před → po | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 112 | 98 | 12 → 6 | 0 | ✅ 98/98 |
| en | 112 | 97 | 12 → 6 | 0 | ✅ 97/97 |
| de | 112 | 98 | 12 → 6 | 0 | ✅ 98/98 |

(EN má o údaj méně, protože rozměr a čelní plocha profilu 5s jsou na EN
stránce jedna věta, v CS a DE dvě.)

Klíče a pořadí po sloučení ve všech jazycích: `profil-1`, `profil-3`,
`profil-4`, `profil-5s`, `profil-8`, `profil-9`. EN/DE citace jsou z EN/DE
stránky.

## Nálezy

1. **Duplicita: 6 karet + 6 profilů = tytéž výrobky dvakrát.** Autor je vedl
   odděleně s odůvodněním „stránka přiřazení neuvádí“ – snímek odkazy
   neukazuje, surové HTML ano (viz výše).
   → **Opraveno – sloučeno** do 6 výrobků: klíč a kotva ze sekce, název
   a popis z karty, vlastnosti, materiály a obrázek ze sekce, číslo profilu
   („Profil 1“ / „Profile 1“) jako první položka `variants`. Mapování:
   Nesvětelné 3D nápisy → profil-1, se zadním podsvícením → profil-3,
   Velkoformátové světelné nápisy → profil-4, se svítícím čelem → profil-5s,
   se svítícím čelem a boky → profil-8, Plno-plexisklové → profil-9.
   Nepravdivý záznam ve `vynechano` nahrazen popisem sloučení.
2. **Profil 5s: marketing jako popis výrobku.** „Nejpopulárnější volba
   3D nápisu. Výrazný nápis s nejlepším poměrem kvality a ceny.“ (EN
   „excellent value for money“, DE „bestem Preis-Leistungs-Verhältnis“)
   bylo `description`. → **Vyhozeno** do `vynechano`; popis je teď z karty.
3. **Profil 5s: vlastnosti s kostrbatým názvem** – EN „high“ / „face“,
   DE „hoch“ / „Vorderseite“, CS „Rozměr“ / „Čelní plocha“ vytažené z věty.
   → **Opraveno:** vlastnosti zrušeny, celé věty („Rozměr do 2 metrů na
   výšku.“, „Čelní plocha bez viditelného rámečku.“) přesunuty do `variants`,
   stejně ve všech jazycích.
4. **Profil 9: rozpor karta × sekce.** Karta „Do interiérů a exteriérů.“,
   sekce „Umístění: vhodný především do interiéru“. → Ponecháno jen použití
   ze sekce (podrobnější), použití z karty ve `vynechano` s poznámkou;
   popis výrobku je druhá věta karty („Ideální pro drobné nápisy…“).
   **Rozhodne člověk** (viz níže).
5. **Vlastnost stránky „Prozkoumejte pestrou škálu profilů…“ → „všechno jde
   uspůsobit“** – název je celá navigační věta, hodnota prázdný slib (na
   pylonech je tentýž typ úvodu vyřazen). → **Vyhozeno** do `vynechano`.
6. **Profil 3: „Elegantní. Decentní.“** – hodnotící slova, totéž říká popis
   karty. → nepřevzato, záznam ve `vynechano`.
7. **Duplicity po sloučení** – variant „Díky nepřímému tlumenému podsvícení…“,
   „s čelním prosvícením“, „Prosvícená může být jak čelní strana…“ (shodné
   s popisem z karty) a použití „Do interiérů a exteriérů“ u 5s (shodné se
   sekcí „vhodné pro interiér i exteriér“) odstraněny. Úvodní věta sekce
   profilu 9 opakuje kartu → `vynechano`.
8. **Profil 4:** z úvodu sekce převzata konstrukční věta o upevňovacím lemu
   (EN/DE: o upevňovací liště) do `variants`; u profilu 1 věta o nižších
   nákladech oproti světelným variantám, u profilu 8 věta o bočním
   prosvícení. Hodnotící „Nejpůsobivější a nejživější reklama.“ zůstává
   vyřazená.
9. Ostatní údaje (Grafika, Korpus, Umístění, materiály, 3D tisk, lakování,
   záruka až 5 let, 3D vizualizace před výrobou) ověřeny: doslovně na
   stránce, u správného profilu podle kotvy v outline. Nic podstatného
   nechybí.

## Sporné – rozhodne člověk

- **Profil 9 – interiér, nebo i exteriér?** Karta říká „Do interiérů
  a exteriérů“, sekce „vhodný především do interiéru“ (EN/DE stejně).
  Ve vrstvě je jen sekce. Text na webu by měl být sjednocen ve Webflow.
- **„Nejoblíbenější varianta 3D světelných nápisů…“** (karta profilu 5s)
  zůstává jako součást popisu – jde o tvrzení o vlastním sortimentu, ne
  srovnání s konkurencí. Pokud ho klient bere jako nepodložené, stačí
  popis zkrátit na „Do interiérů a exteriérů.“
- **„Poutá z dálky, zaručuje dlouhou životnost i v nepříznivých podmínkách.“**
  (karta profilu 4) zůstává v popisu; „zaručuje“ je slib bez čísla.
- **„Naše kvalitní materiály … zajišťují stálost barev a vzhledu po mnoho
  let.“** – vlastnost stránky pod nadpisem „Odolnost vůči povětrnostním
  vlivům“, ponechána (výrobková vlastnost, ale bez čísla).
- **Názvy vlastností stránky jsou nadpisy sekcí** („Každý detail dle vašich
  představ“) – štítek je to jen napůl; hodnoty (výběr materiálů, 3D
  vizualizace před výrobou) jsou konkrétní, ponecháno.
- **Text webu:** „uspůsobit“ (správně „uzpůsobit“, na pylonech je správně),
  „zavešení“ u profilu 8 (správně „zavěšení“), „co zaručuje“ (spíš „což“).
  Citováno doslova, oprava patří do Webflow.
