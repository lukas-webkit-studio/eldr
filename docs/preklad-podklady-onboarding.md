# Překlad podkladů pro eldr.cz — jak to spustit

Pro toho, kdo píše články a texty a má je dodat ve třech jazycích.

## Co dostaneš

Skill `preklad-podklady`. Dáš mu český článek (Google Doc, Word nebo
vložený text), on ho přeloží do angličtiny a němčiny podle závazného
glosáře webu, založí nové dokumenty vedle originálu, sám si je zkontroluje
a pošle report: co je hotové, co si máš ověřit, co je pro správce webu.

Do Webflow nesahá. Vkládání na web zůstává na správci.

## Co potřebuješ

1. **Claude Code** (desktop nebo web) s možností instalovat skilly.
2. **GitHub** připojený jako connector a účet s právem **číst** repozitář
   `lukas-webkit-studio/eldr`. Repo je privátní — přístup ti přidá jeho
   správce. Skill z něj při každém spuštění stahuje aktuální glosář; bez
   něj se zastaví.
3. **Google Drive** připojený jako connector, když píšeš v Google Docs.
   Když píšeš ve Wordu, stačí soubor.

## Instalace

Dostaneš soubor `preklad-podklady.skill`. Otevři ho v Claude a klikni
**Save skill**. Případně rozbal složku `preklad-podklady/` do
`~/.claude/skills/`.

## Jak to spustit

Napiš třeba:

> Přelož tenhle článek: https://docs.google.com/document/d/…

nebo

> Tady je nový článek na blog ve Wordu, potřebuju EN a DE verzi.

Skill se zeptá jen na dvě věci, pokud je nevíš z tvého zadání: do jakých
jazyků (výchozí oba) a kam (nové Google Docs ve stejné složce, soubory
`.docx`, nebo text do chatu). Vložit překlad do stávajícího dokumentu jako
další kartu neumí — zakládá nové dokumenty vedle.

## Co dodržet v českém originálu

- Tokeny `{#YOE#}` a `[banner:…]` piš přesně takhle, skill je přenese.
- Odkazy na web piš celé (`https://www.eldr.cz/produkty/…`); skill jim
  přidá jazykový prefix.
- Když má článek pole (Název, Perex, Meta title, Meta description), označ
  je popiskem — skill popisky zachová a přeloží obsah.

## Co dostaneš zpátky

Report se čtyřmi částmi: **Hotovo**, **K ověření**, **Pro programátora /
správce webu**, **Návrhy do glosáře**. Za překlad ručíš ty — projdi hlavně
„K ověření". Návrhy do glosáře pošli správci repa, sám do něj psát nemůžeš.
