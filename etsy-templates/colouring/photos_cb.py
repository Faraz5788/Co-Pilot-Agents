"""Listing photos for the colouring book: python3 photos_cb.py <book_out_dir> <photos_out_dir>"""
import sys, os, subprocess, json, glob
SRC, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
PG = f"{OUT}/_pages"; os.makedirs(PG, exist_ok=True)
subprocess.run(["pdftoppm", "-r", "110", "-png", f"{SRC}/Christmas-Colouring-Book-A4.pdf", f"{PG}/p"], check=True)
subprocess.run(["pdftoppm", "-r", "110", "-png", f"{SRC}/_coloured.pdf", f"{PG}/c"], check=True)
P = lambda n: f"file://{PG}/p-{n:02d}.png"; C = lambda n: f"file://{PG}/c-{n:02d}.png"
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "factory")
CSS = open(f"{FD}/photos.css").read() + open(f"{FD}/photos-christmas.css").read() + """
.paper{position:absolute;background:#fff;box-shadow:0 18px 40px rgba(0,0,0,.22);border-radius:6px;overflow:hidden}.paper img{width:100%;display:block}
.crayon{position:absolute;height:34px;border-radius:6px 18px 18px 6px;box-shadow:0 6px 12px rgba(0,0,0,.18)}
.crayon:after{content:"";position:absolute;right:-26px;top:5px;border-left:28px solid;border-left-color:inherit;border-top:12px solid transparent;border-bottom:12px solid transparent}
.thumbs{display:grid;grid-template-columns:repeat(8,1fr);gap:16px 22px;margin:30px auto 0;width:1180px}.thumbs img{width:100%;border-radius:4px;box-shadow:0 6px 14px rgba(0,0,0,.15);background:#fff}
.lab{position:absolute;font-family:'DM Serif Display';font-size:40px;color:#1E5631}
.badge{position:absolute;background:#B3261E;color:#fff;font-weight:800;font-size:26px;padding:14px 26px;border-radius:999px;box-shadow:0 10px 24px rgba(0,0,0,.2)}
"""
GLASSES = open(f"{FD}/photos.py").read().split("GLASSES = '''")[1].split("'''")[0]
BRAND = f'<div class="brand">{GLASSES}<span>THE GEEK NEXT DOOR CO.</span></div>'
def crayon(x, y, w, rot, col): return f'<div class="crayon" style="left:{x}px;top:{y}px;width:{w}px;background:{col};border-left-color:{col};transform:rotate({rot}deg)"></div>'
def paper(src, x, y, w, rot=0, z=1): return f'<div class="paper" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg);z-index:{z}"><img src="{src}"></div>'
def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
slides = []
slides.append(f'''<div class="hero-l" style="width:560px"><div class="pill gold">PRINTABLE · AGES 3+</div><h1>Christmas Colouring Book for Kids</h1>
<div class="sub">20 pictures + bonus pages · Instant PDF</div><div class="pills"><span class="pill c0">A4 &amp; US Letter</span><span class="pill c1">Print at home</span></div>
{ticks(["Big, bold, easy-to-colour pictures","Santa, Rudolph, snowman &amp; more","Bonus Dear Santa letter page"])}</div>
{paper(P(5), 1010, 150, 430, 9, 1)}{paper(P(11), 610, 170, 430, -9, 2)}{paper(P(1), 790, 90, 470, 1, 3)}
{crayon(600, 960, 260, -10, "#D94335")}{crayon(890, 990, 240, 5, "#3E9A57")}{crayon(1160, 950, 220, -4, "#F4C243")}''')
th = "".join(f'<img src="{P(n)}">' for n in range(1, 25))
slides.append(f'<h2 class="c">20 Christmas pictures to colour</h2><div class="sub c">Plus a cover and 3 bonus pages, 25 pages in total</div><div class="thumbs">{th}</div>')
slides.append(f'''<div style="width:520px"><h2>Big, bold &amp; easy to colour</h2>{ticks(["Thick, clear outlines for little hands","Hollow bubble-letter titles to colour too","Perfect for crayons, pencils or felt-tips"])}</div>
{paper(P(3), 610, 100, 450, -4, 1)}{paper(C(1), 1010, 130, 450, 5, 2)}<div class="lab" style="left:740px;top:790px">Before…</div><div class="lab" style="left:1150px;top:830px">…after!</div>''')
slides.append(f'''<h2 class="c">Fun bonus pages</h2><div class="sub c">Make it theirs, decorate a tree and write to Santa</div>
{paper(P(2), 100, 270, 420, -5, 1)}{paper(P(23), 540, 250, 420, 0, 2)}{paper(P(24), 980, 270, 420, 5, 3)}''')
slides.append(f'''<div style="width:560px"><h2>Perfect for Christmas</h2>{ticks(["Rainy days &amp; the school holidays","Christmas parties &amp; classrooms","Keeping little ones busy at dinner","Print as many copies as you like at home"])}</div>
{paper(C(9), 660, 90, 400, -6, 1)}{paper(C(16), 1040, 130, 400, 6, 2)}{paper(P(21), 870, 420, 380, 2, 3)}''')
slides.append('''<h2 class="c">How it works</h2><div class="sub c">Ready in minutes, no waiting for the post</div><div class="steps">
<div class="step"><div class="num">1</div><div class="t">Download</div><div class="d">Your PDFs are ready instantly from your Etsy Purchases page</div></div>
<div class="step"><div class="num">2</div><div class="t">Print at home</div><div class="d">A4 (UK/Europe) and US Letter sizes included. Print as many as you like</div></div>
<div class="step"><div class="num">3</div><div class="t">Colour!</div><div class="d">Grab the crayons and enjoy a merry, mess-free afternoon</div></div></div>
<div class="note c">This is a digital download. No physical item will be posted. For personal &amp; classroom use.</div>''')
jobs = []
for i, sl in enumerate(slides, 1):
    h = f"{OUT}/_s{i}.html"
    open(h, "w").write(f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><div class="bg"></div><div class="stripe top"></div><div class="stripe bot"></div><section>{sl}</section>{BRAND}</body></html>')
    jobs.append([h, f"{OUT}/listing-{i:02d}.png"])
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1125},deviceScaleFactor:2});
for(const [f,o] of JSON.parse(process.argv[2])){await p.goto('file://'+f);await p.waitForLoadState('networkidle');await p.waitForTimeout(600);await p.screenshot({path:o});}await b.close()})();"""
open(f"{OUT}/_r.js", "w").write(js); subprocess.run(["node", f"{OUT}/_r.js", json.dumps(jobs)], check=True)
for f in glob.glob(f"{OUT}/_s*.html") + [f"{OUT}/_r.js"]: os.remove(f)
for f in glob.glob(f"{PG}/*.png"): os.remove(f)
os.rmdir(PG); print("rendered", len(jobs))
