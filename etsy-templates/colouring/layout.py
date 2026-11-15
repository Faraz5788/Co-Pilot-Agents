"""Shared page layout for printable PDFs (frame, bubble titles, A4/Letter rendering)."""
import os, subprocess, json
from style import css
FONT = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">'
G = '<g stroke="#111" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" fill="#fff">{}</g>'

def title_svg(text, colour=None, size=None):
    size = size or (190 if len(text) <= 10 else (150 if len(text) <= 15 else (120 if len(text) <= 20 else 96)))
    return (f'<svg class="t" viewBox="0 0 1200 240"><text x="600" y="190" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="{size}" '
            f'letter-spacing="4" fill="{colour or "#fff"}" stroke="#111" stroke-width="12" stroke-linejoin="round" paint-order="stroke">{text}</text></svg>')

def instr(text): return f'<div class="instr">{text}</div>'
def page(inner, cls="", foot="© The Geek Next Door Co. · For personal use only"):
    return f'<section class="pg {cls}"><div class="frame">{inner}</div><div class="foot">{foot}</div></section>'

BASE_CSS = """*{{box-sizing:border-box}} body{{margin:0;font-family:Inter,sans-serif}}
.pg{{width:{w};height:{h};padding:9mm;page-break-after:always;position:relative;background:#fff;display:flex;flex-direction:column}}
.frame{{flex:1;border:2.2mm solid #111;border-radius:9mm;padding:5mm 7mm;display:flex;flex-direction:column;align-items:center;overflow:hidden;gap:3mm}}
.foot{{font-size:8pt;color:#888;text-align:center;padding-top:2mm}} svg{{overflow:hidden}}
svg.t{{width:100%;height:auto;flex:0 0 auto}} .instr{{font-family:Fredoka;font-weight:500;font-size:17pt;color:#333;text-align:center}}
svg.fill{{width:100%;flex:1;min-height:0}} .sil *{{fill:#111 !important;stroke:#111 !important}}
"""
def build(pages_html, out_pdf_base, extra_css="", sizes=("A4", "Letter"), coloured_css=False):
    outs = []
    for size in sizes:
        w, h = {"A4": ("210mm", "297mm"), "Letter": ("8.5in", "11in")}[size]
        style = f"@page{{size:{w} {h};margin:0}}" + BASE_CSS.format(w=w, h=h) + extra_css + css(False) + " " + css(True).replace(".", ".c .")
        hp = f"{out_pdf_base}-{size}.html"
        open(hp, "w").write(f'<!doctype html><html><head><meta charset="utf-8">{FONT}<style>{style}</style></head><body>{"".join(pages_html)}</body></html>')
        outs.append([hp, f"{out_pdf_base}-{size}.pdf"])
    js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [h,pdf] of JSON.parse(process.argv[2])){await p.goto('file://'+h);await p.waitForLoadState('networkidle');await p.waitForTimeout(800);await p.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});}
await b.close()})();"""
    jf = out_pdf_base + "_r.js"; open(jf, "w").write(js)
    subprocess.run(["node", jf, json.dumps(outs)], check=True)
    os.remove(jf)
    for hp, _ in outs: os.remove(hp)
    return [o[1] for o in outs]
