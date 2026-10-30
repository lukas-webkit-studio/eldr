# Ověření: orientacni-systemy

- **Ověřeno:** 30. 10. 2026, 22:33 UTC, nezávislý ověřovatel (ne autor dat).
- **Nový snímek:** `node scripts/ai-vrstva/snapshot.js --out …/overeni/orientacni-systemy orientacni-systemy` (cs 118 bloků, en 115, de 117).
- **Diff proti `_zdroj/orientacni-systemy.<lang>.txt`:** cs, en, de beze změny.
- Staženo i surové HTML všech tří jazyků (`curl`): na stránce nejsou žádné kotvové odkazy karet (`href="#…"` jen prázdné `#`), duplicity karta↔sekce tedy nejsou.

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 29 | 27 | 1 | 2 | ✅ 27/27 (100 %) |
| en | 29 | 27 | 1 | 2 | ✅ 27/27 (100 %) |
| de | 29 | 27 | 1 | 2 | ✅ 27/27 (100 %) |

Klíče a pořadí výrobků jsou ve všech jazycích stejné (`orientacni-systemy`). EN a DE citují EN a DE stránku, ne překlad z češtiny.

## Nálezy

1. **Vlastnost stránky s nadpisem sekce místo štítku** – `page.properties` měla jako název
   „Orientační systémy podle prostoru i potřeb“ (EN „Wayfinding systems to suit the space and the need“,
   DE „Wegeleitsysteme passend zum Raum und zum Bedarf“). To je nadpis H2, ne štítek, a hodnota
   se už opakovala ve `variants` výrobku. → **Vlastnost zrušena** ve všech 3 jazycích, zapsáno do `vynechano`.
2. **Marketingové hodnocení v materiálu** – materiál „Oblíbeným materiálem s velice efektním vzhledem je
   eloxovaný hliník.“ → **opraveno**: hodnota zkrácena na „eloxovaný hliník“ / „anodized aluminium“ /
   „eloxiertes Aluminium“ (citace beze změny).
3. **Nepravdivé zdůvodnění ve `vynechano` (cs)** – psalo se, že fotka rozcestníku Globus „v české verzi
   stránky není“. V HTML české verze **je** (`img.product_image.localization-show-only_cs`), jen ji bez JS
   skryje `src/eldr.css` (`.localization-show-only_* {display:none}`, zobrazí až `body.lang-cs` z modulu
   20-locale.js). Na /en a /de ji ukáže Webflow pravidlo `:lang(en|de)`. → **Opraveno zdůvodnění**; obrázek
   výrobku v cs zůstává první fotka galerie (to robot bez JS opravdu vidí).
4. **Drobnost ve `vynechano` (cs)** – blok „Elektro Drapač je zárukou prvotřídní kvality“ má 6 bodů, ne 7. → **opraveno**.

## Zkontrolováno a ponecháno

- Štítky „Interiér i exteriér“ a „Na míru“ nejsou v hero, ale v sekci `#orientacni-systemy` (outline) –
  správně u výrobku (`uses`, `variants`), ne v `highlights`.
- Vlastnosti Grafika / Montáž / Umístění: štítky jsou na stránce doslova, hodnoty sedí.
- `uses` „do interiérů, exteriérů…“ a `variants` „ve světelném i nesvětelném provedení“ částečně opakují
  vlastnosti Umístění a Grafika. Není to chyba ani nepodložený údaj, jen duplicita; ponecháno.
- FAQ: dvě otázky (K čemu slouží…, Z čeho se vyrábějí…) jsou na stránce jako H3 s odpovědí hned pod nimi.
  „Jak probíhá výroba světelné reklamy?“ správně není ve FAQ (obecný postup zakázky).
- Chybějící údaje: při procházení snímku odshora dolů nic nechybí.

## K rozhodnutí člověkem

- **Česká verze schovává fotku výrobku robotům.** `src/eldr.css` skryje všechny prvky `.localization-show-only_*`
  a v češtině je zobrazí až JS. AI roboti JS nespouštějí, takže na `/produkty/orientacni-systemy` (a všude, kde je
  třída `localization-show-only_cs`) fotku nevidí, na /en a /de ano. Webflow má pro EN/DE vlastní pravidla `:lang()`,
  pro češtinu ne. Řešení patří do Webflow (pravidlo na třídě), případně do eldr.css jako failsafe. Do vrstvy se
  tím nic nedostalo, ale obrázek výrobku se mezi jazyky liší.
- Na /en stránka v HTML obsahuje pro locale `cs` jiný obrázek („Profil 1.png“) než v češtině. Je skrytý a nesouvisí s orientačními systémy (původ jsem neověřoval).
  Neškodí, ale stojí za úklid v Designeru.
- Alt texty obrázků jsou na /en a /de česky (Webflow alt per locale API nezapíše).
