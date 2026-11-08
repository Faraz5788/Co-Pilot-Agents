"""Listing-photo generator: python3 photos.py <config.json> <shots_dir> <out_dir>
Renders 3000x2250 Etsy listing images in The Geek Next Door Co. style."""
import json, sys, os, subprocess, html
cfg = json.load(open(sys.argv[1])); SHOTS = os.path.abspath(sys.argv[2]); OUT = os.path.abspath(sys.argv[3])
os.makedirs(OUT, exist_ok=True)
E = html.escape
def img(name): return f'file://{SHOTS}/{name}.png'
GLASSES = '''<svg width="120" height="52" viewBox="0 0 520 220"><path d="M10 70 L60 95M510 70 L460 95" stroke="#1F1D1A" stroke-width="16" stroke-linecap="round"/>
<path d="M232 110 Q260 82 288 110" stroke="#1F1D1A" stroke-width="16" fill="none" stroke-linecap="round"/>
<circle cx="145" cy="120" r="88" fill="none" stroke="#D6452F" stroke-width="28" stroke-dasharray="300 253"/><circle cx="145" cy="120" r="88" fill="none" stroke="#F2B632" stroke-width="28" stroke-dasharray="0 300 253 0"/>
<circle cx="375" cy="120" r="88" fill="none" stroke="#2F6FB5" stroke-width="28" stroke-dasharray="300 253"/><circle cx="375" cy="120" r="88" fill="none" stroke="#3F9B5A" stroke-width="28" stroke-dasharray="0 300 253 0"/></svg>'''
BRAND = f'<div class="brand">{GLASSES}<span>THE GEEK NEXT DOOR CO.</span></div>'
def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{E(i)}</li>" for i in items) + "</ul>"

def slide(s):
    t = s["type"]
    if t == "hero":
        return f'''<div class="hero-l"><div class="pill gold">{E(s["badge"])}</div><h1>{E(s["title"])}</h1><div class="sub">{E(s["sub"])}</div>
        <div class="pills">{''.join(f'<span class="pill c{i}">{E(p)}</span>' for i,p in enumerate(s["pills"]))}</div>{ticks(s.get("bullets",[]))}</div>
        <div class="laptop" style="left:670px;top:{s.get("laptop_top",230)}px;width:760px"><div class="scr"><div><img src="{img(s["main"])}"></div></div><div class="base"></div></div>'''
    if t == "included":
        tiles = "".join(f'<div class="tile c{i%4}"><div class="n">{i+1:02d}</div><div class="t">{E(a)}</div><div class="d">{E(b)}</div></div>' for i,(a,b) in enumerate(s["items"]))
        cols = 4 if len(s["items"]) > 6 else 3
        return f'<h2 class="c">{E(s.get("heading","What\'s included"))}</h2><div class="sub c">{E(s["sub"])}</div><div class="grid" style="grid-template-columns:repeat({cols},1fr)">{tiles}</div>'
    if t == "feature":   # bullets left, screenshot right
        return f'''<div style="width:560px"><h2>{E(s["heading"])}</h2>{ticks(s["bullets"])}</div>
        <div class="card" style="position:absolute;left:{s.get("left",700)}px;top:{s.get("top",110)}px;width:{s.get("width",720)}px"><img src="{img(s["shot"])}"></div>'''
    if t == "wide":      # heading top, wide screenshot, bullets row
        chips = "".join(f'<div class="chip">{E(b)}</div>' for b in s["bullets"])
        return f'''<div class="wide"><h2>{E(s["heading"])}</h2><div class="sub">{E(s.get("sub",""))}</div>
        <div class="mid"><div class="card" style="width:{s.get("width",1340)}px"><img src="{img(s["shot"])}"></div><div class="chips">{chips}</div></div></div>'''
    if t == "how":
        return f'''<h2 class="c">How it works</h2><div class="sub c">No spreadsheet skills needed</div><div class="steps">
        <div class="step"><div class="num">1</div><div class="t">Buy &amp; download</div><div class="d">Your file is ready instantly from your Etsy Purchases page</div></div>
        <div class="step"><div class="num">2</div><div class="t">Open it</div><div class="d">Works in Microsoft Excel or Google Sheets — free with a Google account</div></div>
        <div class="step"><div class="num">3</div><div class="t">Type in the yellow cells</div><div class="d">{E(s.get("step3","Everything else calculates for you"))}</div></div></div>
        <div class="note c">Digital download — no physical item will be posted. Prices shown in £ GBP.</div>'''
    raise ValueError(t)

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "photos.css")).read()
pages = []
for i, s in enumerate(cfg["slides"], 1):
    p = os.path.join(OUT, f"_slide{i}.html")
    open(p, "w").write(f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><div class="bg"></div><div class="stripe top"></div><div class="stripe bot"></div><section>{slide(s)}</section>{BRAND}</body></html>')
    pages.append(p)
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1125},deviceScaleFactor:2});
for(const [f,o] of JSON.parse(process.argv[2])){await p.goto('file://'+f);await p.waitForLoadState('networkidle');await p.waitForTimeout(800);await p.screenshot({path:o});}await b.close()})();"""
jobs = [[p, os.path.join(OUT, f"listing-{i:02d}.png")] for i, p in enumerate(pages, 1)]
open(os.path.join(OUT, "_r.js"), "w").write(js)
subprocess.run(["node", os.path.join(OUT, "_r.js"), json.dumps(jobs)], check=True)
for p in pages: os.remove(p)
os.remove(os.path.join(OUT, "_r.js"))
print("rendered", len(jobs))
