# CMS Fotografie — jeden dropdown místo textového pole

Fotky do galerií se dřív zařazovaly **dvěma poli**: `Kategorie` (dropdown,
12 produktových stránek) a `Název sekce` (**volný text**, 32 hodnot). Galerie
v Designeru filtrovala `Kategorie = X AND Název sekce = "přesný text"`.

Nově stačí jedno pole: **Produkt** (dropdown, 34 možností).

## Proč pryč od textového pole

- Text se musel napsat **na písmeno stejně** jako ve filtru galerie.
  Překlep, mezera navíc nebo jiná diakritika = prázdná galerie, a nikde
  se to nenahlásí.
- Klient musel vědět, jaké hodnoty už existují — nikde nebyl jejich seznam.
- Kategorie byla po zavedení Produktu redundantní: každý název sekce patřil
  právě do jedné kategorie, takže druhá podmínka filtru nic nefiltrovala.

## Jak to funguje nově

1. U fotky se vybere **Produkt** z dropdownu (pole je povinné).
2. V Designeru má galerie jediný filtr `Produkt = <produkt>`.
3. Hotovo — řazení (`Pořadí` sestupně) a limity zůstaly beze změny.

Přidání nového produktu = přidat možnost do pole Produkt v CMS nastavení
a v Designeru založit galerii s filtrem na tuto možnost.

## Pozor: pole Produkt je lokalizované

Webflow u **nově vytvořeného** Option pole **nepropíše hodnoty do sekundárních
locale** (en, de) — zůstanou prázdné. Filtr `Produkt = X` pak na `/en/…`
a `/de/…` nevrátí nic a **galerie jsou prázdné**, i když česká verze je v pořádku.

Při migraci se proto hodnota zapisovala třikrát — do `cs`, `en` i `de`
(`cmsLocaleId` u každé položky). Kdyby se pole někdy zakládalo znovu nebo
přibyla další locale, je to první věc, kterou zkontrolovat.

## Mapování (34 možností)

Názvy zůstaly doslova ty, co byly v `Název sekce`; dvě galerie, které dřív
filtrovaly jen podle kategorie, dostaly stejnojmennou možnost.

| Produktová stránka | Možnosti pole Produkt |
|---|---|
| Orientační systémy | Orientační systémy |
| Světelné panely a tabule | Světelné panely · Intarzie · Reklamní tabule · Menuboardy/infoboardy |
| Reklamní pylony a totemy | Reklamní pylony · Reklamní totemy |
| 3D nápisy, loga a jednotlivá písmena | Profil 1 · Profil 3 · Profil 4 · Profil 5s · Profil 8 · Profil 9 |
| Vstupní portály a architektonické prvky | Vstupní portály na míru · Architektonické světelné prvky · Reklamní vlajky |
| Prvky podpory prodeje | Prvky podpory prodeje · Led displaye |
| Designová a interiérová svítidla | Designová svítidla · Designové lampy · Neonová reklama · Mechové stěny · Světelná čísla domů · „Žárovkové“ světelné nápisy |
| Výstrče, lékárenské znaky | Výstrče · Lékárenské znaky |
| Zámečnické konstrukce | Zámečnické konstrukce · Atypické zámečnické konstrukce · Opracování a prodej plexiskla a polykarbonátu |
| Velkoformátový tisk | Velkoformátový digitální tisk · Řezaná grafika · Další druhy polepů |
| Servisní služby | Instalace ochranných systémů proti ptactvu |
| Muzeum světelných reklam | Muzeum světelných reklam |

**Názvy sekcí nejsou nadpisy na webu.** Nadpisy nad galeriemi jsou statický
text v Designeru — na stránce 3D nápisů je nad „Profil 1“ nadpis „Nesvětelné
3D nápisy“. Přejmenování možnosti v CMS tedy nadpis nezmění (a naopak).

## Co se změnilo v Designeru

Přepsáno **70 collection listů** (každá galerie = hlavní slider + popup) na
12 produkčních stránkách a na dev stránkách. Zdroj, řazení, limity ani
vzhled se nikde neměnily — jen filtr.

Dvě mrtvé galerie se skryly (`visibility: false`), protože po migraci by
začaly sypat fotky do stránky:

- **Muzeum** — komponenta `PopUp` (1 instance) měla list filtrovaný na
  Orientační systémy a vykreslovala 76 fotek do skrytého `#pop-up`, který
  žádný slider neotevírá. Zároveň tím na stránce vznikalo duplicitní `id="pop-up"`.
- **Servisní služby** — osiřelý popup filtrovaný na `Název sekce =
  "Světelné měření reklamy"`, což je sekce bez jediné fotky.

Dohromady to z produkce ubralo 228 obrázků ve skrytém markupu.

## Co zbylo

Pole **Kategorie** (`produkt`) je v kolekci pořád. Galerie ho už nepoužívají,
ale Webflow ho odmítá smazat (409 `currently being used in bindings`), protože
na něj pořád odkazuje filtr toho skrytého listu v komponentě `PopUp`.
Filtry uvnitř **definice komponenty** přes API zapsat nejdou — `set_settings`
vrací `No source connected`, i s `scope_component_id`.

Až se ten list v Designeru smaže (komponenta PopUp → smazat Collection List),
půjde smazat i pole Kategorie. Do té doby je neškodné, jen přebývá.

## Ověření

Před migrací i po ní se stáhlo všech 12 produktových stránek ve třech
jazycích a porovnaly se **seznamy vykreslených souborů** v každé galerii
(ne jen počty). Výsledek: **204 galerií, stejné fotky ve stejném pořadí**.
