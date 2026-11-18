"""Listing photos for Umrah Companion: python3 photos.py <shots_dir> <out_dir>"""
import sys, os, subprocess, json, glob
SH, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
I = lambda n: f"file://{SH}/{n}.png"
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "factory")
STAR = "data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='14'%3E%3Cpath d='M22 2l2 5 5 0-4 3 1.5 4.5L22 12l-4.5 2.5L19 10l-4-3 5 0z' fill='%23DDB94E'/%3E%3C/svg%3E"
CSS = open(f"{FD}/photos.css").read() + f"""
:root{{--red:#1D6B51;--yel:#B8901F;--blue:#1D6B51;--grn:#1D6B51;--cream:#F5EFE2}}
h1,h2{{color:#1D6B51}}.bg{{background-image:radial-gradient(rgba(184,144,31,.28) 2px,transparent 2px);background-size:46px 46px}}
.stripe{{height:22px;background:#1D6B51 url("{STAR}") repeat-x center}}
.pill.gold{{background:#B8901F;color:#fff}}.pill.c0{{background:#1D6B51}}.pill.c1{{background:#2C3E35}}
.step .num{{background:#1D6B51}}.step:nth-child(2) .num{{background:#B8901F}}.step:nth-child(3) .num{{background:#2C3E35}}
.ar{{font-family:Amiri,serif;color:#B8901F;font-size:54px;line-height:1.2}}
.phone{{position:absolute;background:#1b1b1b;border-radius:46px;padding:14px;box-shadow:0 30px 60px rgba(0,0,0,.3)}}.phone div{{border-radius:34px;overflow:hidden;background:#fff}}.phone img{{width:100%;display:block}}
.shot{{position:absolute;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.18);border:1px solid #e5dac4}}.shot img{{width:100%;display:block}}
.grid5{{display:grid;grid-template-columns:repeat(5,1fr);gap:18px;margin-top:40px}}.tl{{background:#fff;border-radius:18px;padding:22px 14px;box-shadow:0 10px 26px rgba(0,0,0,.08);border-top:7px solid #1D6B51;text-align:center}}
.tl:nth-child(2n){{border-color:#B8901F}}.tl .e{{font-size:48px}}.tl b{{display:block;font-size:22px;margin-top:6px}}.tl span{{font-size:16px;color:#6b645a}}
.ok{{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:34px}}.ok span{{background:#fff;border-radius:99px;padding:12px 22px;font-weight:800;font-size:21px;box-shadow:0 6px 16px rgba(0,0,0,.08)}}
.langs{{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}}.langs span{{background:#fff;border:2px solid #1D6B51;color:#1D6B51;border-radius:99px;padding:10px 20px;font-weight:800;font-size:22px}}"""
BRAND = '<div class="brand"><span>THE GEEK NEXT DOOR CO.</span></div>'
def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{i}</li>" for i in items) + "</ul>"
def laptop(img, x, y, w): return f'<div class="laptop" style="left:{x}px;top:{y}px;width:{w}px"><div class="scr"><div><img src="{I(img)}"></div></div><div class="base"></div></div>'
def phone(img, x, y, w, rot=0): return f'<div class="phone" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)"><div><img src="{I(img)}"></div></div>'
def shot(img, x, y, w, rot=0): return f'<div class="shot" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)"><img src="{I(img)}"></div>'
LANGS = '<div class="langs"><span>English</span><span>اردو</span><span>हिन्दी</span><span>বাংলা</span><span>Filipino</span><span>Türkçe</span><span>Bahasa Indonesia</span></div>'
TOOLS = [("🕋","Umrah Steps","7 clear steps"),("🔄","Tawaf Counter","Never lose count"),("⛰️","Sa'i Counter","Safa ↔ Marwah"),("🤲","18 Duas","Arabic + meaning"),("🌍","7 Languages","Urdu, Hindi, Bengali…"),
         ("🕌","Madinah Guide","Visiting the Prophet's ﷺ Masjid"),("📍","20 Ziyarat","History & facts"),("🗣️","Arabic Phrases","44 everyday phrases"),("✅","Packing Checklist","Add your own items"),("📶","Works Offline","Add to Home Screen")]
S = [
 f'''<div class="hero-l" style="width:560px"><div class="ar">لَبَّيْكَ اللّٰهُمَّ عُمْرَةً</div><h1 style="margin-top:6px">Umrah Companion</h1><div class="sub">Your step-by-step Umrah guide app, in 7 languages</div>
<div class="pills"><span class="pill c0">iPhone, Android &amp; computer</span><span class="pill gold">Works offline</span></div>{ticks(["Tawaf &amp; Sa'i round counters","18 duas in Arabic with meaning","Madinah guide &amp; 20 ziyarat","Everyday Arabic phrases"])}</div>
{laptop("home", 640, 200, 800)}{phone("m-en-tawaf", 1210, 400, 240)}''',
 f'<h2 class="c">A one-stop Umrah app</h2><div class="sub c">For first-timers and returning pilgrims: no account, no subscription, no adverts</div><div class="grid5">' + "".join(f'<div class="tl"><div class="e">{e}</div><b>{t}</b><span>{d}</span></div>' for e, t, d in TOOLS) + '</div>',
 f'''<div style="width:520px"><h2>Never lose count</h2>{ticks(["Big tap button for each round","Kaaba dial shows exactly where you are","Sa'i shows which way to walk: Safa → Marwah","The right duas for each round, on screen"])}</div>{shot("sai-dark", 80, 650, 600, -2)}{phone("m-en-tawaf", 820, 110, 360, 2)}''',
 f'''<div style="width:500px"><h2>Duas you can actually read</h2>{ticks(["Clear Arabic with harakat, adjustable size","Pronunciation in your own alphabet","Meaning in your language","Sources given for every dua"])}</div>{shot("duas", 570, 140, 880, 1)}''',
 f'''<h2 class="c">In your language</h2><div class="sub c">Switch any time. Duas, steps, history and phrases are all translated</div><div style="display:flex;justify-content:center">{LANGS}</div>
{phone("m-ur-duas", 100, 360, 270, -4)}{phone("m-hi-phrases", 430, 340, 270, 2)}{phone("m-bn-ziyarat", 760, 360, 270, -2)}{phone("m-id-duas", 1090, 340, 270, 3)}''',
 f'''<div style="width:500px"><h2>Ziyarat with real history</h2>{ticks(["10 places in Makkah, 10 in Madinah","Facts, history &amp; Qur'an / hadith references","Practical tips for each visit","One tap to open in Maps"])}</div>{shot("ziyarat-mad", 590, 120, 850, -1)}''',
 f'''<div style="width:500px"><h2>Speak a little Arabic</h2>{ticks(["44 phrases for taxis, shops, hotel &amp; Haram","Saudi everyday Arabic, as people really speak","Arabic numbers for gates &amp; prices","Help &amp; emergency phrases"])}</div>{shot("phrases", 590, 140, 850, 1)}''',
 '''<h2 class="c">How it works</h2><div class="sub c">Instant download · one-off purchase · no subscription</div><div class="steps">
<div class="step"><div class="num">1</div><div class="t">Buy &amp; download</div><div class="d">Your PDF guide has the website link and your unlock code</div></div>
<div class="step"><div class="num">2</div><div class="t">Add it to your phone</div><div class="d">Open the website, type the code and tap Add to Home Screen. It works offline</div></div>
<div class="step"><div class="num">3</div><div class="t">Take it on your journey</div><div class="d">Follow the steps, count your rounds and read the duas, in your language</div></div></div>
<div class="ok"><span>✓ iPhone &amp; iPad</span><span>✓ Android</span><span>✓ Windows</span><span>✓ Mac</span><span>✓ Chromebook</span></div>''']
jobs = []
for i, sl in enumerate(S, 1):
    h = f"{OUT}/_s{i}.html"
    open(h, "w").write(f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&family=Amiri:wght@400;700&family=Noto+Nastaliq+Urdu&family=Noto+Sans+Devanagari:wght@700&family=Noto+Sans+Bengali:wght@700&display=swap" rel="stylesheet"><style>{CSS}</style></head><body><div class="bg"></div><div class="stripe top"></div><div class="stripe bot"></div><section>{sl}</section>{BRAND}</body></html>')
    jobs.append([h, f"{OUT}/listing-{i:02d}.png"])
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:1125},deviceScaleFactor:2});
for(const [f,o] of JSON.parse(process.argv[2])){await p.goto('file://'+f);await p.waitForLoadState('networkidle');await p.waitForTimeout(600);await p.screenshot({path:o});}await b.close()})();"""
open(f"{OUT}/_r.js", "w").write(js); subprocess.run(["node", f"{OUT}/_r.js", json.dumps(jobs)], check=True)
for f in glob.glob(f"{OUT}/_s*.html") + [f"{OUT}/_r.js"]: os.remove(f)
print("rendered", len(jobs))
