import re, os, json, html as H
from bs4 import BeautifulSoup, NavigableString, Tag
from blocks import blocks, is_leafblock, LEAF_TAGS

INLINE_KEEP={"strong","b","em","i","u","a","br","sup","sub"}
SKIP_CLASSES={"swiper-popup--label","w-dyn-empty","blog_section_hero-date","blog_date_text","w-embed"}
SKIP_SECTIONS={"slider","blog_section_followup","banner-source","blog_section_hero-image","paragraph-3"}
SHARED_PRODUCT_IDS={"jak-probiha-vyroba","duvera","zaruka-kvality"}

def loc_prefix(loc): return "" if loc=="cs" else f"/{loc}"
def fix_href(href, loc):
    if not href or loc=="cs": return href
    pre=loc_prefix(loc)
    m=re.match(r"^(https?://(?:www\.)?eldr\.cz)(/.*)?$",href)
    if m:
        path=m.group(2) or "/"
        if not path.startswith(pre+"/") and path!=pre: path=pre+path
        return m.group(1)+path
    if href.startswith("/") and not href.startswith(pre+"/") and href!=pre:
        return pre+href
    return href

def inline_html(el, loc):
    """inner HTML with only inline formatting kept, hrefs fixed, whitespace collapsed"""
    parts=[]
    def walk(n):
        for c in n.children:
            if isinstance(c,NavigableString):
                parts.append(H.escape(str(c))); continue
            if not isinstance(c,Tag): continue
            if c.name in("script","style","svg","img","picture"): continue
            if c.name=="br": parts.append("<br>"); continue
            if c.name in INLINE_KEEP:
                tag={"b":"strong","i":"em"}.get(c.name,c.name)
                if tag=="a":
                    href=fix_href(c.get("href",""),loc)
                    ah=("https://eldr.webflow.io"+href) if href.startswith("/") else href
                    parts.append(f'<a href="{H.escape(ah)}">'); walk(c); parts.append("</a>")
                else:
                    parts.append(f"<{tag}>"); walk(c); parts.append(f"</{tag}>")
                continue
            # block-ish inside (e.g. nested p in li): separate with space
            walk(c); parts.append(" ")
    walk(el)
    s="".join(parts)
    s=re.sub(r"[ \t\r\n ]+"," ",s)
    s=re.sub(r"\s*<br>\s*","<br>",s)
    s=re.sub(r"\s+([,.;:!?])",r"\1",s)  # no space before punctuation left by inline tags
    return s.strip()

def section_ctx(sec):
    cls=set(sec.get("class",[])); sid=sec.get("id","")
    if "section_header_product" in cls: return "hero","HERO"
    if "section_layout400" in cls: return "rozcestnik","ROZCESTNÍK (karty)"
    if "section_cards" in cls: return "rozcestnik_legacy","ROZCESTNÍK (karty)"
    if "section_layout253" in cls: return "dvojblok","DVOJBLOK"
    if "section_product" in cls: return "produkt",f"PRODUKT #{sid}"
    if "section_showreel" in cls: return "showreel",f"SHOWREEL #{sid}"
    if "section_layout121-2" in cls: return "proces","JAK PROBÍHÁ VÝROBA"
    if "section_layout188" in cls: return "duvera","DŮVĚŘUJÍ NÁM"
    if "sectionrightchoice" in cls: return "zaruka","ZÁRUKA KVALITY"
    if "blog_section_hero-content" in cls: return "blog_hero","HERO"
    if "blog_section_content" in cls: return "blog_obsah","OBSAH ČLÁNKU"
    return "obecne", (sid.upper() if sid else " ".join(sorted(cls)).upper() or sec.name.upper())

def label_for(el, ctx):
    name=el.name; cls=set(el.get("class",[]))
    if "w-button" in cls or "button" in cls: return "TLAČÍTKO"
    if name=="h1": return "NADPIS H1"
    if name in("h2","h3","h4","h5","h6"):
        if ctx in("rozcestnik","rozcestnik_legacy") and name=="h3": return "KARTA – NADPIS"
        if ctx=="proces" and name=="h3": return "KROK – NADPIS"
        return f"NADPIS {name.upper()}"
    if name=="p":
        if ctx in("hero","blog_hero"): return "PEREX"
        if ctx=="rozcestnik": return "KARTA – POPIS" if "text-size-small" in cls else "ÚVOD"
        return "ODSTAVEC"
    if name=="li": return "ODRÁŽKA"
    if name=="a": return "ODKAZ"
    if name=="figcaption": return "POPISEK"
    if name=="blockquote": return "CITACE"
    if name=="label": return "POPISEK POLE"
    if name=="input":
        return "TLAČÍTKO" if el.get("type")=="submit" else None
    if name in("div","span","summary"):
        if ctx=="hero" and "text-size-small" in cls: return "ŠTÍTEK"
        if ctx=="produkt" and not cls: return "ŠTÍTEK"
        if "blog_tags-item-text" in cls: return "ŠTÍTEK"
        if ctx=="rozcestnik_legacy": return "KARTA – POPIS" if "text-size-regular" in cls else "ÚVOD"
        if ctx=="proces": return "ODSTAVEC"
        if "banner-name" in cls: return "BANNER – NÁZEV (CMS)"
        return "TEXT"
    return "TEXT"

def element_items(el_iter, ctx, loc, skip_pred=None):
    items=[]
    for el in el_iter:
        cls=set(el.get("class",[]))
        if cls & SKIP_CLASSES: continue
        if skip_pred and skip_pred(el): continue
        if el.name=="input":
            val=el.get("value","")
            if el.get("type")=="submit" and val: items.append(("TLAČÍTKO",H.escape(val),None))
            continue
        lab=label_for(el,ctx)
        if not lab: continue
        txt=inline_html(el,loc)
        if not re.sub(r"<[^>]+>","",txt).strip(): continue
        href=None
        if el.name=="a" and el.get("href"):
            href=fix_href(el["href"],loc); txt=re.sub(r"</?a[^>]*>","",txt)
        items.append((lab,txt,href))
    return items

def walk_leaves(root):
    """yield leaf block elements in document order (same logic as blocks.walk)"""
    out=[]
    BLOCKISH=("div","p","h1","h2","h3","h4","h5","h6","li","ul","ol","section","a","button","label","form","table","tr","td","blockquote","details","summary")
    def walk(el):
        for c in el.children:
            if isinstance(c,NavigableString) or c.name in("script","style"): continue
            if c.name=="input":
                out.append(c); continue
            if not c.get_text(strip=True): continue
            if c.name in LEAF_TAGS and (c.name!="a" or is_leafblock(c)):
                out.append(c); continue
            if c.name in("div","span") and is_leafblock(c):
                out.append(c); continue
            walk(c)
    walk(root); return out

def clean_soup(f):
    s=BeautifulSoup(open(f),"lxml")
    for t in s(["script","style","noscript","svg","img","picture","iframe","video"]): t.decompose()
    return s

def meta_items(s):
    t=s.find("title"); d=s.find("meta",attrs={"name":"description"})
    return [("META TITLE",H.escape(t.get_text(strip=True)) if t else "",None),
            ("META DESCRIPTION",H.escape(d["content"]) if d and d.get("content") else "",None)]

def product_sections(s, loc, include_shared=False):
    """returns list of (marker, items)"""
    secs=[]
    main=s.select_one("main")
    for sec in main.children:
        if isinstance(sec,NavigableString): continue
        ctx,marker=section_ctx(sec)
        sid=sec.get("id","")
        if sid in SHARED_PRODUCT_IDS and not include_shared: continue
        items=element_items(walk_leaves(sec),ctx,loc)
        if items: secs.append((marker,items))
    return secs

def blog_sections(s, loc):
    secs=[]
    main=s.select_one("main")
    for sec in main.children:
        if isinstance(sec,NavigableString): continue
        cls=set(sec.get("class",[]))
        if cls & SKIP_SECTIONS or sec.get("id")=="gallery-option": continue
        ctx,marker=section_ctx(sec)
        def skip(el):  # AI summary widget lives in .flex-block-10
            return any("flex-block-10" in (p.get("class") or []) for p in el.parents)
        items=element_items(walk_leaves(sec),ctx,loc,skip_pred=skip)
        if items: secs.append((marker,items))
    return secs

def shared_sections(sp, sb, loc):
    """sp: product page soup, sb: blog article soup"""
    secs=[]
    def add(marker,root,ctx="obecne",skip=None):
        if root is None: return
        items=element_items(walk_leaves(root),ctx,loc,skip_pred=skip)
        if items: secs.append((marker,items))
    add("MENU (navigace)",sp.select_one(".navbar_component"))
    add("COOKIE LIŠTA",sp.select_one(".cookiesconsent"))
    for sid,marker in (("jak-probiha-vyroba","JAK PROBÍHÁ VÝROBA"),("duvera","DŮVĚŘUJÍ NÁM"),("zaruka-kvality","ZÁRUKA KVALITY")):
        sec=sp.select_one(f"#{sid}")
        if sec is not None:
            ctx,_=section_ctx(sec); add(marker,sec,ctx)
    add("PATIČKA",sp.select_one(".footer_component"))
    if sb is not None:
        add("BLOG – SOUHRN ČLÁNKU PŘES AI",sb.select_one(".flex-block-10"))
        fu=sb.select_one(".blog_section_followup")
        if fu is not None:
            h=fu.find("h2"); 
            if h: secs.append(("BLOG – DALŠÍ ČLÁNKY",[("NADPIS H2",inline_html(h,loc),None)]))
        sl=sb.select_one(".slider")
        if sl is not None:
            items=[("TEXT",inline_html(e,loc),None) for e in walk_leaves(sl)]
            if items: secs.append(("BLOG – HLÁŠKY GALERIE",items))
        add("BLOG – BANNERY (vkládají se přes [banner:…])",sb.select_one(".banner-source"))
    return secs

def number_labels(secs):
    """number labels that repeat within the document; returns new secs"""
    from collections import Counter
    cnt=Counter(l for _,items in secs for l,_,_ in items)
    seen=Counter(); out=[]
    mcnt=Counter(m for m,_ in secs); mseen=Counter()
    for m,items in secs:
        mseen[m]+=1
        mm=f"{m} {mseen[m]}" if mcnt[m]>1 else m
        new=[]
        for l,t,h in items:
            seen[l]+=1
            new.append((f"{l} {seen[l]}" if cnt[l]>1 else l,t,h))
        out.append((mm,new))
    return out

LAB='color:#8c8c8c;font-size:8pt;margin-top:10pt'
TXT='font-size:11pt'
URL='color:#8c8c8c;font-size:8pt'
SEC='color:#555;font-size:9pt;font-weight:bold;margin-top:22pt'
def abs_href(h, source_url):
    if not h: return h
    if h.startswith("#"): return source_url.split("#")[0]+h
    if h.startswith("/"): return "https://eldr.webflow.io"+h
    return h
def render(title, source_url, secs):
    o=[f'<html><head><meta charset="utf-8"><title>{H.escape(title)}</title></head><body style="font-family:Arial,Helvetica,sans-serif">']
    o.append(f'<p style="{URL}">Šedé řádky jsou jen označení prvku – neměňte je, upravujte pouze text pod nimi. Zdroj: {H.escape(source_url)} (staženo 24. 9. 2026)</p>')
    for m,items in secs:
        o.append(f'<p style="{SEC}">■ {H.escape(m)}</p>')
        for l,t,h in items:
            o.append(f'<p style="{LAB}">{H.escape(l)}</p>')
            if h: o.append(f'<p style="{TXT}"><a href="{H.escape(abs_href(h,source_url))}">{t}</a></p><p style="{URL}">odkaz: {H.escape(h)}</p>')
            else: o.append(f'<p style="{TXT}">{t}</p>')
    o.append("</body></html>")
    return "\n".join(o)

def label_seq(secs): return [(m,l) for m,items in secs for l,_,_ in items]
