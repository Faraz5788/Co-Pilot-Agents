"""Builds the Christmas colouring book: python3 book.py <out_dir>  →  A4 + US Letter PDFs and page PNGs."""
import sys, os, subprocess, json
from art import PAGES, star_pts, holly, tree, snowman, reindeer, gingerbread, decorate
from style import css
OUT = os.path.abspath(sys.argv[1]); os.makedirs(OUT, exist_ok=True)
FONT = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">'
G = '<g stroke="#111" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" fill="#fff">{}</g>'

def title_svg(text, coloured=False):
    size = 200 if len(text) <= 9 else (160 if len(text) <= 13 else 120)
    fillc = "#D94335" if coloured else "#fff"
    return (f'<svg class="t" viewBox="0 0 1200 250"><text x="600" y="200" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="{size}" '
            f'letter-spacing="6" fill="{fillc}" stroke="#111" stroke-width="12" stroke-linejoin="round" paint-order="stroke">{text}</text></svg>')

def page(inner, cls=""):
    return f'<section class="pg {cls}"><div class="frame">{inner}</div><div class="foot">© The Geek Next Door Co. · For personal use only</div></section>'

def picture_page(name, fn, coloured=False):
    return page(title_svg(name, coloured) + f'<svg class="art" viewBox="0 0 800 800">{G.format(fn())}</svg>', "c" if coloured else "")

def cover():
    letters = ""; cols = ["#D94335", "#3E9A57", "#F4C243", "#3D78C2"]
    for i, ch in enumerate("Christmas"): letters += f'<tspan fill="{cols[i % 4]}">{ch}</tspan>'
    t = (f'<svg class="ct" viewBox="0 0 1600 560"><text x="800" y="150" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="120" fill="#fff" stroke="#111" stroke-width="12" paint-order="stroke">My</text>'
         f'<text x="800" y="330" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="200" stroke="#111" stroke-width="14" paint-order="stroke" stroke-linejoin="round">{letters}</text>'
         f'<text x="800" y="490" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="120" fill="#fff" stroke="#111" stroke-width="12" paint-order="stroke">Colouring Book</text></svg>')
    arts = "".join(f'<svg viewBox="0 0 800 800">{G.format(f())}</svg>' for f in (snowman, tree, reindeer, gingerbread))
    return (f'<section class="pg c cover"><div class="frame">{t}<div class="grid4">{arts}</div>'
            f'<div class="sub">20 Christmas pictures to colour · Ages 3+</div></div><div class="foot">The Geek Next Door Co.</div></section>')

def belongs():
    inner = title_svg("This book belongs to") + '<div class="nameline"></div>'
    inner += f'<svg class="art small" viewBox="0 0 800 800">{G.format(holly(400, 420, 2.4))}</svg>'
    inner += '<div class="hint">Draw a picture of yourself in the box!</div><div class="selfie"></div>'
    return page(inner)

def decorate_page():
    return page(title_svg("Decorate the Tree") + f'<svg class="art" viewBox="0 0 800 800">{G.format(decorate())}</svg><div class="hint">Draw baubles, lights and presents!</div>')

def letter_page():
    lines = "".join('<div class="ln"></div>' for _ in range(11))
    inner = title_svg("Dear Santa") + '<div class="letter"><div class="lt">My name is</div><div class="ln short"></div><div class="lt">I am ____ years old. This year I have been…</div>'
    inner += '<div class="boxes"><span>☐ Very good</span><span>☐ Good</span><span>☐ A little bit cheeky!</span></div><div class="lt">For Christmas I would love…</div>' + lines
    inner += f'<div class="lt">Love from</div><div class="ln short"></div></div><svg class="cornerstar" viewBox="0 0 200 200"><g stroke="#111" stroke-width="7" stroke-linejoin="round" fill="#fff"><polygon points="{star_pts(100,100,90,40)}"/></g></svg>'
    return page(inner)

def thanks():
    return page('<div class="thx"><h1>Thank you!</h1><p>I hope you have a wonderful time colouring. 🎄</p><p>If you enjoyed this book, a review on Etsy would mean the world to a small shop.</p>'
                '<p class="sm">Printing tips: print on plain A4 or Letter paper, or thicker card for felt-tips and paint. Choose "Fit to page" in your printer settings.</p>'
                '<p class="sm">© The Geek Next Door Co. This file is for personal and classroom use only. Please don\'t share or resell it.</p></div>')

def html(size, pages_html):
    w, h = {"A4": ("210mm", "297mm"), "Letter": ("8.5in", "11in")}[size]
    style = f"""@page{{size:{w} {h};margin:0}} *{{box-sizing:border-box}} body{{margin:0;font-family:Inter,sans-serif}}
    .pg{{width:{w};height:{h};padding:9mm;page-break-after:always;position:relative;background:#fff;display:flex;flex-direction:column}}
    .frame{{flex:1;border:2.2mm solid #111;border-radius:9mm;padding:6mm 8mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;overflow:hidden}}
    .foot{{font-size:8pt;color:#888;text-align:center;padding-top:2mm}}
    svg{{overflow:hidden}} svg.t{{width:100%;height:auto;flex:0 0 auto}} svg.art{{width:100%;flex:1;min-height:0}} svg.art.small{{flex:0 0 32%}}
    .cover .frame{{background:#FBF7EF;border-color:#B3261E}} svg.ct{{width:100%;height:auto}}
    .grid4{{display:grid;grid-template-columns:1fr 1fr;gap:2mm;width:88%}} .grid4 svg{{width:100%;height:auto}}
    .sub{{font-family:Fredoka;font-weight:600;font-size:17pt;color:#3E9A57}}
    .nameline{{width:80%;border-bottom:1.2mm dashed #111;height:16mm}} .hint{{font-family:Fredoka;font-size:15pt;color:#555}}
    .selfie{{width:62%;flex:1;border:1.2mm solid #111;border-radius:6mm;margin-top:3mm}}
    .letter{{width:92%;flex:1;font-family:Fredoka;font-size:16pt}} .lt{{margin-top:5mm}} .ln{{border-bottom:0.7mm solid #999;height:11mm}} .ln.short{{width:70%}}
    .boxes{{display:flex;gap:8mm;margin-top:3mm;font-size:14pt}} .cornerstar{{position:absolute;right:16mm;bottom:20mm;width:30mm}}
    .thx{{text-align:center;font-family:Fredoka;margin:auto;width:80%}} .thx h1{{font-size:44pt;color:#B3261E;margin:0 0 6mm}} .thx p{{font-size:16pt}} .thx p.sm{{font-family:Inter;font-size:10pt;color:#666}}
    {css(False)} .c{{}} """
    col = css(True).replace(".", ".c .")   # coloured pages
    return f'<!doctype html><html><head><meta charset="utf-8">{FONT}<style>{style} {col}</style></head><body>{pages_html}</body></html>'

pages = [cover(), belongs()] + [picture_page(n, f) for n, f in PAGES] + [decorate_page(), letter_page(), thanks()]
coloured = [picture_page(n, f, True) for n, f in PAGES]
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [h,pdf] of JSON.parse(process.argv[2])){await p.goto('file://'+h);await p.waitForLoadState('networkidle');await p.waitForTimeout(800);await p.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});}
await b.close()})();"""
jobs = []
for size in ("A4", "Letter"):
    hp = f"{OUT}/_book_{size}.html"; open(hp, "w").write(html(size, "".join(pages))); jobs.append([hp, f"{OUT}/Christmas-Colouring-Book-{size}.pdf"])
hp = f"{OUT}/_coloured.html"; open(hp, "w").write(html("A4", "".join(coloured))); jobs.append([hp, f"{OUT}/_coloured.pdf"])
open(f"{OUT}/_r.js", "w").write(js); subprocess.run(["node", f"{OUT}/_r.js", json.dumps(jobs)], check=True)
print("pages:", len(pages))
