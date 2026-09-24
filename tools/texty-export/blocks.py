from bs4 import BeautifulSoup, NavigableString
import re
LEAF_TAGS=("h1","h2","h3","h4","h5","h6","p","li","a","button","label","input","td","th","blockquote","figcaption","summary")
BLOCKISH=("div","p","h1","h2","h3","h4","h5","h6","li","ul","ol","section","a","button","label","form","table","tr","td","blockquote","details","summary")
def is_leafblock(el):
    for d in el.find_all(True):
        if d.name in BLOCKISH and d.get_text(strip=True): return False
    return True
def blocks(f, root_sel="main"):
    s=BeautifulSoup(open(f),"lxml")
    for t in s(["script","style","noscript","svg","img","picture","iframe","video"]): t.decompose()
    root=s.select_one(root_sel)
    out=[]
    def walk(el):
        for c in el.children:
            if isinstance(c,NavigableString) or c.name in("script","style"): continue
            if not c.get_text(strip=True): continue
            if c.name in LEAF_TAGS and (c.name!="a" or is_leafblock(c)):
                out.append((c,)); continue
            if c.name in("div","span") and is_leafblock(c):
                out.append((c,)); continue
            walk(c)
    for sec in root.children:
        if isinstance(sec,NavigableString): continue
        out.append(("SECTION",sec))
        walk(sec)
    return out, s
