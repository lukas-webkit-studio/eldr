# Ověření: vystrce-lekarenske-znaky

Ověřeno 30. 10. 2026, 22:33 UTC. Stránku jsem načetl znovu ze živého webu
(`snapshot.js --out …/overeni/vystrce-lekarenske-znaky`) ve všech třech jazycích.
Diff proti `_zdroj/` je ve všech třech jazycích prázdný, a to u `.txt` i
`.outline.json`. Ze surového HTML (`/produkty/vystrce-lekarenske-znaky`) je
doloženo, že karty odkazují na sekce `#vystrce`, `#atypicke-vystrce` a
`#lekarenske-znaky`, takže sloučení karet se sekcemi sedí.

## Souhrn

| Jazyk | Údajů před | Údajů po | Výrobků | FAQ | Test dohledatelnosti |
|---|---|---|---|---|---|
| cs | 54 | 50 | 5 | 0 | ✅ 50/50 (100 %) |
| en | 54 | 50 | 5 | 0 | ✅ 50/50 (100 %) |
| de | 54 | 50 | 5 | 0 | ✅ 50/50 (100 %) |

Klíče a pořadí výrobků jsou ve všech jazycích stejné: `vystrce`,
`atypicke-vystrce`, `lekarenske-znaky`, `svetelna-vystrc-a-vystrc-s-intarzii`,
`vystrc-na-miru-a-nesvetelna-vystrc`. Citace EN a DE jsou z EN a DE stránky,
ne překlad z češtiny (test je hledá ve snímku daného jazyka).

## Nálezy

1. **Tvrzení o firmě v popisu výrobku `lekarenske-znaky`.** Popis obsahoval
   i druhou větu „A my patříme mezi několik málo firem, které mají oprávnění
   k jejich výrobě.“ (EN „And we are one of the few companies…“, DE „Und wir
   gehören zu den wenigen Unternehmen…“). → **Opraveno:** `value` popisu je
   jen první věta („Lékárenské znaky jsou pod autorským zákonem.“), druhá
   věta je ve `vynechano`.
2. **Vlastnost „Oprávnění“ / „Licence“ / „Berechtigung“ u `lekarenske-znaky`.**
   Celá je o firmě („jedna z mála firem“, spolupráce s Ing. arch. Flašarem,
   „velké množství těchto křížů“), ne o výrobku. → **Vyhozeno** do `vynechano`.
3. **Materiály u `vystrce` obsahovaly dva údaje, které materiál nejsou:**
   „K vnitřnímu rámu jsou přivařeny konzoly…“ (to je upevnění) a „LED
   podsvětlení zajišťuje rovnoměrnou viditelnost…“ (to je osvětlení).
   → **Opraveno:** z `materials` vyřazeno. Obsah se neztratil: konzoly jsou
   dál ve vlastnosti „Materiál“ (tak to štítek na stránce uvádí), LED je
   v popisu výrobku. Totéž v EN a DE.

Zkontrolováno a ponecháno: H1, perex, 4 štítky v hero, vlastnost
„Výstrče různých typů a provedení na míru“, vlastnosti Grafika / Materiál /
Vhodné pro / Sortiment, použití a provedení u všech výrobků, obrázky
(jsou ve správných sekcích). Nic na stránce, co by do vrstvy patřilo,
nechybí; galerie, procesní blok, bloky o firmě a patička jsou ve `vynechano`.

## Sporné — mělo by rozhodnout člověk

- **„záložny (klíč)“** ve „Vhodné pro“ u atypických výstrčí (EN „credit
  unions (a key)“, DE „Kreditgenossenschaften (Schlüssel)“). Klíč jako symbol
  záložny je zvláštní; spíš to vypadá na „zámečnictví“. Ve vrstvě je to
  doslovně, jak to je na webu — jestli jde o chybu, opravit na webu.
- **Hliník vs. ocel.** Sekce `#vystrce` uvádí „rám tvoří hliníková
  konstrukce“, sekce `#atypicke-vystrce` „Viditelná reklama na ocelové
  konstrukci“. Ve vrstvě je jen hliník (štítek „Materiál:“), věta o oceli je
  ve `vynechano`. Stojí za ověření u klienta, jestli si to neodporuje.
- **Alt texty obrázků jsou česky i na `/en` a `/de`** (např. „Světelná výstrč
  obchodu RE.BRUNS kolmo k fasádě“). Ve vrstvě jsou tak, jak na stránce
  jsou. Přeložit jdou jen v Designeru.
- **Výrobky `svetelna-vystrc-a-vystrc-s-intarzii` a
  `vystrc-na-miru-a-nesvetelna-vystrc`** nemají kotvu ani obrázek a částečně se
  překrývají s kartou „Světelné výstrče“. Na stránce jsou to samostatné bloky
  s vlastním nadpisem a karta na ně neodkazuje, proto zůstaly samostatně.
  Kdyby se měly brát jen jako provedení, přesunuly by se do `variants`.
- **Štítek „Životnost desítky let“** je v hero a ve vrstvě zůstal jako
  highlight. Je to tvrzení o výrobku, ale nepodložené parametrem. Jestli ho
  klient chce ve vrstvě obhajovat, je to jeho rozhodnutí.
- **Duplicita vlastnost × provedení.** Část textu u `vystrce` je jak ve
  vlastnosti „Grafika“, tak ve `variants`. Obsah je doložený, v JSON-LD se
  ale objeví dvakrát (jednou pod „Grafika“, jednou pod „Provedení“).
