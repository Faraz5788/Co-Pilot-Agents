"""Listing photos for printable packs: python3 photos_pack.py <activity|party> <pdf> <out_dir>"""
import sys, os, subprocess, json, glob
KIND, PDF, OUT = sys.argv[1], os.path.abspath(sys.argv[2]), os.path.abspath(sys.argv[3]); os.makedirs(OUT, exist_ok=True)
PG = f"{OUT}/_pages"; os.makedirs(PG, exist_ok=True)
subprocess.run(["pdftoppm", "-r", "110", "-png", PDF, f"{PG}/p"], check=True)
P = lambda n: f"file://{PG}/p-{n:02d}.png"
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "factory")
CSS = open(f"{FD}/photos.css").read() + open(f"{FD}/photos-christmas.css").read() + """
.paper{position:absolute;background:#fff;box-shadow:0 18px 40px rgba(0,0,0,.22);border-radius:6px;overflow:hidden}.paper img{width:100%;display:block}
.thumbs{display:grid;gap:16px 20px;margin:28px auto 0}.thumbs img{width:100%;border-radius:4px;box-shadow:0 6px 14px rgba(0,0,0,.15);background:#fff}"""
GLASSES = open(f"{FD}/photos.py").read().split("GLASSES = '''")[1].split("'''")[0]
BRAND = f'<div class="brand">{GLASSES}<span>THE GEEK NEXT DOOR CO.</span></div>'
def paper(n, x, y, w, rot=0, z=1): return f'<div class="paper" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg);z-index:{z}"><img src="{P(n)}"></div>'
def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
def thumbs(pages, cols, width): return f'<div class="thumbs" style="grid-template-columns:repeat({cols},1fr);width:{width}px">' + "".join(f'<img src="{P(n)}">' for n in pages) + "</div>"
def three(a, b, c): return f'{paper(a, 100, 270, 420, -5, 1)}{paper(b, 540, 250, 420, 0, 2)}{paper(c, 980, 270, 420, 5, 3)}'
def left(h, items): return f'<div style="width:540px"><h2>{h}</h2>{ticks(items)}</div>'
def how(step3):
    return f'''<h2 class="c">How it works</h2><div class="sub c">Ready in minutes, no waiting for the post</div><div class="steps">
<div class="step"><div class="num">1</div><div class="t">Download</div><div class="d">Your PDFs are ready instantly from your Etsy Purchases page</div></div>
<div class="step"><div class="num">2</div><div class="t">Print at home</div><div class="d">A4 (UK/Europe) and US Letter sizes included. Print as many as you like</div></div>
<div class="step"><div class="num">3</div><div class="t">{step3[0]}</div><div class="d">{step3[1]}</div></div></div>
<div class="note c">This is a digital download. No physical item will be posted. For personal use.</div>'''
if KIND == "activity":
    S = [f'''<div class="hero-l" style="width:560px"><div class="pill gold">PRINTABLE · AGES 4–8</div><h1>Christmas Activity Pack for Kids</h1>
<div class="sub">17 activities + answers · Instant PDF</div><div class="pills"><span class="pill c0">A4 &amp; US Letter</span><span class="pill c1">Answers included</span></div>
{ticks(["Mazes, word searches &amp; dot-to-dots","Spot the difference &amp; colour by number","Hours of screen-free Christmas fun"])}</div>{paper(3, 1010, 150, 430, 9, 1)}{paper(2, 610, 170, 430, -9, 2)}{paper(1, 790, 90, 470, 1, 3)}''',
         f'<h2 class="c">17 Christmas activities</h2><div class="sub c">Plus a cover, 2 answer pages and a "Well done!" page</div>{thumbs(range(2, 20), 9, 1300)}',
         left("Puzzles for every age", ["3 mazes from easy to tricky", "2 word searches (easy &amp; harder)", "4 dot-to-dots"]) + f'{paper(15, 640, 110, 400, -5, 1)}{paper(12, 1010, 140, 400, 5, 2)}{paper(9, 830, 450, 380, 1, 3)}',
         f'<h2 class="c">Spot the difference &amp; colour by number</h2><div class="sub c">Plus shadow matching, counting and noughts &amp; crosses</div>' + three(7, 6, 10),
         left("Answers included", ["Every maze solved", "Every word found", "All the differences circled", "Counting answers"]) + f'{paper(19, 640, 110, 400, -4, 1)}{paper(20, 1010, 140, 400, 5, 2)}',
         how(("Have fun!", "Grab some pencils and enjoy a calm, screen-free afternoon"))]
else:
    S = [f'''<div class="hero-l" style="width:560px"><div class="pill gold">PRINTABLE · ALL THE FAMILY</div><h1>Christmas Party Games Pack</h1>
<div class="sub">Bingo · Quiz · Charades &amp; more</div><div class="pills"><span class="pill c0">A4 &amp; US Letter</span><span class="pill c1">Print at home</span></div>
{ticks(["20 different picture bingo cards","50-question family quiz","Charades &amp; would you rather cards"])}</div>{paper(14, 1010, 150, 430, 9, 1)}{paper(3, 610, 170, 430, -9, 2)}{paper(1, 790, 90, 470, 1, 3)}''',
         f'<h2 class="c">Everything for a Christmas games night</h2><div class="sub c">24 pages: print as many cards and answer sheets as you need</div>{thumbs(range(1, 25), 8, 1180)}',
         left("Picture Bingo", ["20 different bingo cards", "Bright, colourful pictures", "Calling cards to cut out", "Easy enough for little ones"]) + f'{paper(3, 640, 110, 400, -5, 1)}{paper(6, 1010, 140, 400, 5, 2)}{paper(13, 830, 450, 380, 1, 3)}',
         f'<h2 class="c">50-question family quiz</h2><div class="sub c">5 rounds: films, songs, traditions, food &amp; a kids\' round, plus answer and score sheets</div>' + three(14, 19, 20),
         f'<h2 class="c">Charades &amp; Would You Rather?</h2><div class="sub c">Cut-out cards for giggles round the table</div>' + three(21, 22, 23),
         how(("Play!", "Gather the family, grab some sweets for bingo counters and let the games begin"))]
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
