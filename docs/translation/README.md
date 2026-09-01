# Podklady pro překlad

Šestnáct dvojic dokumentů — anglická a německá verze textů webu z doby, kdy
se překlad dělal poprvé. Soubor bez přípony je **anglicky**, soubor
s `_DE` **německy**. Česká předloha tu není; ta je na živém webu.

**Nejsou to aktuální texty.** Web se od té doby několikrát změnil — přibyly
sekce, jiné zmizely. Slouží jako **zdroj terminologie**, ne jako obsah
k nakopírování.

Vytěžená terminologie je v [`.claude/skills/preklad/glosar.md`](../../.claude/skills/preklad/glosar.md),
postup překladu v [`SKILL.md`](../../.claude/skills/preklad/SKILL.md) vedle něj.

Dokumenty obsahují redakční poznámky (`(proklik)`, `(odkaz)`, `Button:`,
`Metatitle:`) a několik nedodělků — v německých souborech zůstala na pár
místech čeština. Konkrétní seznam je v glosáři, sekce *Známé chyby*.

Text se z nich dá vytáhnout bez Wordu:

```bash
python3 - <<'PY'
import zipfile
from xml.etree import ElementTree as ET
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
root=ET.fromstring(zipfile.ZipFile('docs/translation/O nas.docx').read('word/document.xml'))
for p in root.iter(W+'p'):
    t=''.join(n.text or '' for n in p.iter(W+'t')).strip()
    if t: print(t)
PY
```
