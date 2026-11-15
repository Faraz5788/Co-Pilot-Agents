"""Listing photos for Christmas HQ: python3 photos_hq.py <shots_dir> <out_dir>"""
import sys, os, subprocess, json, glob
SH, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
I = lambda n: f"file://{SH}/{n}.png"
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "factory")
CSS = open(f"{FD}/photos.css").read() + open(f"{FD}/photos-christmas.css").read() + """
.phone{position:absolute;background:#1b1b1b;border-radius:46px;padding:14px;box-shadow:0 30px 60px rgba(0,0,0,.3)}.phone div{border-radius:34px;overflow:hidden;background:#fff}.phone img{width:100%;display:block}
.shot{position:absolute;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.18);border:1px solid #e4dccb}.shot img{width:100%;display:block}
.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:22px;margin-top:60px}.tl{background:#fff;border-radius:18px;padding:40px 18px;box-shadow:0 10px 26px rgba(0,0,0,.08);border-top:7px solid #B3261E;text-align:center}
.tl:nth-child(3n+2){border-color:#1E5631}.tl:nth-child(3n){border-color:#C9A227}.tl .e{font-size:64px}.tl b{display:block;font-size:26px;margin-top:10px}.tl span{font-size:19px;color:#6b645a}
.ok{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:34px}.ok span{background:#fff;border-radius:99px;padding:12px 22px;font-weight:800;font-size:21px;box-shadow:0 6px 16px rgba(0,0,0,.08)}.ok span.no{color:#8a8378;font-weight:600}"""
GLASSES = open(f"{FD}/photos.py").read().split("GLASSES = '''")[1].split("'''")[0]
BRAND = f'<div class="brand">{GLASSES}<span>THE GEEK NEXT DOOR CO.</span></div>'
def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
def laptop(img, x, y, w): return f'<div class="laptop" style="left:{x}px;top:{y}px;width:{w}px"><div class="scr"><div><img src="{I(img)}"></div></div><div class="base"></div></div>'
def phone(img, x, y, w): return f'<div class="phone" style="left:{x}px;top:{y}px;width:{w}px"><div><img src="{I(img)}"></div></div>'
def shot(img, x, y, w, rot=0): return f'<div class="shot" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)"><img src="{I(img)}"></div>'
TOOLS = [("🏠","Dashboard","Countdown & budget"),("🎁","Gifts","Idea → given"),("👪","People","Budgets & sizes"),("🛒","Shopping","Grouped by shop"),("🧦","Stockings","Little extras"),
         ("💌","Cards","Sent & received"),("🎅","Secret Santa","Fair, private draw"),("🏷️","Gift Tags","Print from your list"),("✅","Checklist","Week-by-week plan"),("⚙️","Settings","£ $ €, themes, PIN")]
S = [
 f'''<div class="hero-l" style="width:520px"><div class="pill gold">CHRISTMAS PLANNER APP</div><h1>Christmas HQ</h1><div class="sub">Gifts, budgets, Secret Santa &amp; gift tags, all in one app</div>
<div class="pills"><span class="pill c0">Opens in your browser</span><span class="pill c1">No subscription</span></div>{ticks(["Track every gift &amp; budget","Fair Secret Santa draw","Printable gift tags","Private: saved on your device"])}</div>
{laptop("dash", 600, 170, 820)}{phone("m-dash", 1220, 430, 230)}''',
 f'<h2 class="c">10 Christmas tools in one app</h2><div class="sub c">One file that opens in your web browser: no account, no app store, no formulas to break</div><div class="grid5">' + "".join(f'<div class="tl"><div class="e">{e}</div><b>{t}</b><span>{d}</span></div>' for e, t, d in TOOLS) + '</div>',
 f'''<div style="width:500px"><h2>Every gift, sorted</h2>{ticks(["Who it's for, shop, link &amp; cost","Tap to move: Idea → To buy → Bought → Wrapped → Given","Budget per person, so no-one's left out","Shopping list grouped by shop"])}</div>{shot("gifts_c", 580, 120, 860, 1)}''',
 f'''<div style="width:500px"><h2>Secret Santa in seconds</h2>{ticks(["Nobody ever draws themselves","&ldquo;Don&rsquo;t pair these two&rdquo; rules for couples","Pass-the-phone private reveal","Spend limit &amp; exchange date"])}</div>{shot("santa_c", 590, 100, 850, -2)}{shot("reveal_c", 760, 600, 620, 2)}''',
 f'''<h2 class="c">Printable gift tags, filled in for you</h2><div class="sub c">4 designs. Names come straight from your gift list: print, cut and stick!</div>{shot("tags_c", 90, 260, 650, -2)}{shot("tagsc_c", 770, 280, 650, 2)}''',
 f'''<div style="width:520px"><h2>Private, safe &amp; kid-proof</h2>{ticks(["Saved only on your device: no account","Optional PIN lock","Press Esc twice to hide it behind a mince pie recipe!","Backup, restore &amp; export to Excel / Google Sheets","Light, festive &amp; dark themes"])}</div>{laptop("dark", 620, 190, 760)}''',
 '''<h2 class="c">How it works</h2><div class="sub c">Instant download · one-off purchase · no subscription</div><div class="steps">
<div class="step"><div class="num">1</div><div class="t">Download</div><div class="d">Get Christmas-HQ.html from your Etsy Purchases page</div></div>
<div class="step"><div class="num">2</div><div class="t">Open it</div><div class="d">Double-click to open in Chrome, Edge, Safari or Firefox on your computer</div></div>
<div class="step"><div class="num">3</div><div class="t">Plan away</div><div class="d">Add your people and gifts. Everything saves automatically on your device</div></div></div>
<div class="ok"><span>✓ Windows</span><span>✓ Mac</span><span>✓ Chromebook</span><span>✓ Android (Chrome)</span><span class="no">✗ Not for iPhone / iPad</span></div>''']
jobs = []
for i, sl in enumerate(S, 1):
    h = f"{OUT}/_s{i}.html"
    open(h, "w").write(f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><div class="bg"></div><div class="stripe top"></div><div class="stripe bot"></div><section>{sl}</section>{BRAND}</body></html>')
    jobs.append([h, f"{OUT}/listing-{i:02d}.png"])
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1125},deviceScaleFactor:2});
for(const [f,o] of JSON.parse(process.argv[2])){await p.goto('file://'+f);await p.waitForLoadState('networkidle');await p.waitForTimeout(600);await p.screenshot({path:o});}await b.close()})();"""
open(f"{OUT}/_r.js", "w").write(js); subprocess.run(["node", f"{OUT}/_r.js", json.dumps(jobs)], check=True)
for f in glob.glob(f"{OUT}/_s*.html") + [f"{OUT}/_r.js"]: os.remove(f)
print("rendered", len(jobs))
