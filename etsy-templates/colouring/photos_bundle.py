"""Listing photos for the Christmas Kids Bundle: python3 photos_bundle.py <colouring_pdf> <activity_pdf> <out_dir>"""
import sys, os, subprocess, json, glob
CB, AP, OUT = (os.path.abspath(x) for x in sys.argv[1:4]); os.makedirs(OUT, exist_ok=True)
PG = f"{OUT}/_pages"; os.makedirs(PG, exist_ok=True)
subprocess.run(["pdftoppm", "-r", "110", "-png", CB, f"{PG}/c"], check=True)
subprocess.run(["pdftoppm", "-r", "110", "-png", AP, f"{PG}/a"], check=True)
C = lambda n: f"file://{PG}/c-{n:02d}.png"; A = lambda n: f"file://{PG}/a-{n:02d}.png"
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "factory")
CSS = open(f"{FD}/photos.css").read() + open(f"{FD}/photos-christmas.css").read() + """
.paper{position:absolute;background:#fff;box-shadow:0 18px 40px rgba(0,0,0,.22);border-radius:6px;overflow:hidden}.paper img{width:100%;display:block}
.thumbs{display:grid;gap:12px 14px}.thumbs img{width:100%;border-radius:4px;box-shadow:0 5px 12px rgba(0,0,0,.15);background:#fff}
.box{position:absolute;background:#fff;border-radius:22px;padding:26px 30px;box-shadow:0 12px 30px rgba(0,0,0,.1)}
.box h3{font-family:'DM Serif Display';font-weight:400;font-size:40px;margin:0 0 4px;color:#B3261E}.box p{margin:0 0 16px;font-size:21px;color:#5a544b;font-weight:600}
.plus{position:absolute;font-family:'DM Serif Display';font-size:120px;color:#C9A227;left:722px;top:470px}
.price{position:absolute;right:80px;top:70px;text-align:right}.price s{font-size:34px;color:#8a8378}.price b{display:block;font-family:'DM Serif Display';font-weight:400;font-size:84px;color:#B3261E;line-height:1}.price span{font-size:22px;font-weight:800;color:#1E5631}"""
GLASSES = open(f"{FD}/photos.py").read().split("GLASSES = '''")[1].split("'''")[0]
BRAND = f'<div class="brand">{GLASSES}<span>THE GEEK NEXT DOOR CO.</span></div>'
def paper(src, x, y, w, rot=0, z=1): return f'<div class="paper" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg);z-index:{z}"><img src="{src}"></div>'
def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
def thumbs(srcs, cols): return f'<div class="thumbs" style="grid-template-columns:repeat({cols},1fr)">' + "".join(f'<img src="{s}">' for s in srcs) + "</div>"
S = [
 f'''<div class="hero-l" style="width:560px"><div class="pill gold">BUNDLE · SAVE 23%</div><h1>Christmas Kids Printable Bundle</h1>
<div class="sub">Colouring + activities · 46 pages</div><div class="pills"><span class="pill c0">A4 &amp; US Letter</span><span class="pill c1">Answers included</span></div>
{ticks(["20 colouring pictures + bonus pages", "17 puzzles, mazes &amp; word searches", "Hours of screen-free Christmas fun"])}</div>
{paper(C(11), 1090, 230, 360, 10, 1)}{paper(A(3), 680, 240, 360, -10, 2)}{paper(C(1), 740, 130, 400, -3, 3)}{paper(A(1), 1000, 160, 400, 5, 4)}''',
 f'''<h2 class="c">Two Christmas books in one</h2><div class="sub c">Everything below for less than the price of buying them separately</div>
<div class="box" style="left:80px;top:270px;width:620px"><h3>Colouring Book</h3><p>25 pages · ages 3+</p>{thumbs([C(n) for n in (1, 3, 4, 10, 11, 21, 23, 24)], 4)}</div>
<div class="plus">+</div>
<div class="box" style="left:800px;top:270px;width:620px"><h3>Activity Pack</h3><p>21 pages · ages 4–8</p>{thumbs([A(n) for n in (1, 2, 3, 6, 7, 10, 12, 19)], 4)}</div>''',
 f'''<div style="width:560px"><h2>Colour in 20 Christmas pictures</h2>{ticks(["Santa, Rudolph, snowman, robin &amp; more", "Bubble-letter titles to colour too", "Dear Santa &amp; Decorate the Tree pages"])}</div>
{paper(C(10), 660, 100, 400, -5, 1)}{paper(C(4), 1030, 130, 400, 5, 2)}{paper(C(24), 850, 450, 370, 1, 3)}''',
 f'''<div style="width:560px"><h2>Then tackle 17 Christmas puzzles</h2>{ticks(["3 mazes &amp; 2 word searches", "4 dot-to-dots &amp; 3 colour by number", "Spot the difference, counting &amp; more", "Answer pages included"])}</div>
{paper(A(15), 660, 100, 400, -5, 1)}{paper(A(7), 1030, 130, 400, 5, 2)}{paper(A(6), 850, 450, 370, 1, 3)}''',
 f'''<h2 class="c">Better value together</h2><div class="sub c">Buy the bundle and save</div>
<div class="box" style="left:150px;top:300px;width:560px;text-align:center"><h3>Bought separately</h3><p style="font-size:30px">Colouring Book £2.99<br>Activity Pack £3.49</p><p style="font-size:44px;color:#8a8378"><s>£6.48</s></p></div>
<div class="box" style="left:790px;top:300px;width:560px;text-align:center;border:5px solid #B3261E"><h3>The bundle</h3><p style="font-size:30px">Both books · 46 pages<br>A4 &amp; US Letter</p><p style="font-family:'DM Serif Display';font-size:84px;color:#B3261E;margin:0">£4.99</p></div>
<div class="note c" style="position:absolute;left:0;right:0;top:720px;font-size:28px;color:#1E5631;font-weight:800">Print as many copies as you like, one for every child!</div>''',
 '''<h2 class="c">How it works</h2><div class="sub c">Ready in minutes, no waiting for the post</div><div class="steps">
<div class="step"><div class="num">1</div><div class="t">Download</div><div class="d">4 PDFs ready instantly from your Etsy Purchases page</div></div>
<div class="step"><div class="num">2</div><div class="t">Print at home</div><div class="d">Pick A4 (UK/Europe) or US Letter. Print as many as you like</div></div>
<div class="step"><div class="num">3</div><div class="t">Colour &amp; play!</div><div class="d">Grab the pencils and enjoy a merry, screen-free Christmas</div></div></div>
<div class="note c">This is a digital download. No physical item will be posted. For personal use.</div>''']
jobs = []
for i, sl in enumerate(S, 1):
    h = f"{OUT}/_s{i}.html"
    open(h, "w").write(f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><div class="bg"></div><div class="stripe top"></div><div class="stripe bot"></div><section>{sl}</section>{BRAND}</body></html>')
    jobs.append([h, f"{OUT}/listing-{i:02d}.png"])
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1125},deviceScaleFactor:2});
for(const [f,o] of JSON.parse(process.argv[2])){await p.goto('file://'+f);await p.waitForLoadState('networkidle');await p.waitForTimeout(600);await p.screenshot({path:o});}await b.close()})();"""
open(f"{OUT}/_r.js", "w").write(js); subprocess.run(["node", f"{OUT}/_r.js", json.dumps(jobs)], check=True)
for f in glob.glob(f"{OUT}/_s*.html") + [f"{OUT}/_r.js"] + glob.glob(f"{PG}/*.png"): os.remove(f)
os.rmdir(PG); print("rendered", len(jobs))
