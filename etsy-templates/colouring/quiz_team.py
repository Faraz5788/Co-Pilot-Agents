"""Christmas Team Quiz for meetings: 16:9 slides + A4 host/answer/score sheets.
Usage: python3 quiz_team.py <out_dir>"""
import sys, os, re, subprocess, json, html
here = os.path.dirname(os.path.abspath(__file__)); out = os.path.abspath(sys.argv[1]); os.makedirs(out, exist_ok=True)
src = open(os.path.join(here, "party.py")).read()
ns = {}; exec(src[src.index("ROUNDS = ["):src.index("def quiz_pages")], ns)
ROUNDS = [(("Quick-Fire Round" if n == "Kids' Round" else n), qs) for n, qs in ns["ROUNDS"]]
E = html.escape
EMO = ["🎬", "🎵", "🎄", "🍮", "⚡"]
FONTS = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Inter:wght@500;600;800&display=swap" rel="stylesheet">'
SNOW = "data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cg fill='%23ffffff' opacity='.12'%3E%3Ccircle cx='20' cy='30' r='3'/%3E%3Ccircle cx='110' cy='20' r='2'/%3E%3Ccircle cx='70' cy='90' r='4'/%3E%3Ccircle cx='140' cy='120' r='2.5'/%3E%3Ccircle cx='30' cy='140' r='2'/%3E%3C/g%3E%3C/svg%3E"

# ---------- slides ----------
CSS = f"""@page{{size:1920px 1080px;margin:0}}*{{box-sizing:border-box;margin:0}}body{{font-family:Inter,sans-serif}}
.s{{width:1920px;height:1080px;position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column;justify-content:center;padding:90px 140px;background:#B3261E url("{SNOW}");color:#fff}}
.s.g{{background-color:#1E5631}}.s.c{{background:#FBF7EF;color:#1F1D1A}}
.s:before{{content:"";position:absolute;left:0;right:0;top:0;height:22px;background:repeating-linear-gradient(90deg,#C9A227 0 60px,#fff 60px 120px)}}
.ft{{position:absolute;bottom:34px;left:140px;right:140px;display:flex;justify-content:space-between;font-size:24px;opacity:.75;font-weight:600}}
h1{{font-family:Fredoka;font-weight:700;font-size:150px;line-height:1}}h2{{font-family:Fredoka;font-weight:700;font-size:96px;line-height:1.05}}
.big{{font-size:200px;line-height:1}}.sub{{font-size:42px;margin-top:26px;opacity:.92;font-weight:600}}
.qn{{font-family:Fredoka;font-size:46px;font-weight:600;color:#F3D77A}}.c .qn{{color:#B3261E}}
.q{{font-family:Fredoka;font-weight:600;font-size:84px;line-height:1.15;margin-top:24px;max-width:1600px}}
ul.r{{font-size:40px;line-height:1.5;margin-top:30px;padding-left:44px}}
.ans{{display:grid;grid-template-columns:1fr 1fr;gap:16px 50px;margin-top:34px}}.ans div{{font-size:31px;line-height:1.3;border-bottom:2px dashed #e4dccb;padding-bottom:12px}}
.ans b{{color:#B3261E;font-family:Fredoka;font-size:36px}}.ans small{{display:block;color:#6b645a;font-size:23px}}
.sc{{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:40px}}.sc div{{background:rgba(255,255,255,.12);border:3px solid rgba(255,255,255,.4);border-radius:26px;height:190px;padding:20px 26px;font-size:30px;font-weight:700}}"""
def foot(left): return f'<div class="ft"><span>{E(left)}</span><span>The Geek Next Door Co.</span></div>'
S = [f'''<div class="s"><div class="big">🎄</div><h1 style="margin-top:20px">The Big Christmas<br>Team Quiz</h1><div class="sub">5 rounds · 50 questions · one festive champion</div>{foot("Grab a pen and find your team!")}</div>''',
     f'''<div class="s g"><h2>How it works</h2><ul class="r"><li>Get into teams and pick a fun team name</li><li>One answer sheet per team (or a shared doc / chat)</li><li>5 rounds of 10 questions: one point per correct answer</li><li>Answers are revealed at the end of each round</li><li>No phones, no Googling, and the quizmaster's decision is final!</li></ul>{foot("Good luck! 🎅")}</div>''']
for ri, (rn, qs) in enumerate(ROUNDS):
    bg = "" if ri % 2 == 0 else " g"
    S.append(f'''<div class="s{bg}"><div class="big">{EMO[ri]}</div><div class="qn" style="margin-top:30px">Round {ri + 1} of 5</div><h1 style="margin-top:10px">{E(rn)}</h1>{foot("10 questions coming up")}</div>''')
    for qi, (q, a) in enumerate(qs):
        S.append(f'''<div class="s c"><div class="qn">{EMO[ri]} Round {ri + 1} · Question {qi + 1}</div><div class="q">{E(q)}</div>{foot(f"{rn} · {qi + 1}/10")}</div>''')
    S.append(f'''<div class="s c" style="justify-content:flex-start;padding-top:80px"><div class="qn">{EMO[ri]} Round {ri + 1} answers</div><h2 style="color:#1E5631;font-size:72px">{E(rn)}</h2>
      <div class="ans">{"".join(f"<div><small>{qi + 1}. {E(q)}</small><b>{E(a)}</b></div>" for qi, (q, a) in enumerate(qs))}</div>{foot("Swap sheets and mark! One point each.")}</div>''')
S.append(f'''<div class="s g"><h2>Final scores 🏆</h2><div class="sub">Add up all 5 rounds. The highest score wins the title of Christmas Quiz Champions!</div>
  <div class="sc">{"".join(f"<div>Team {i}<br><span style='font-size:64px;font-family:Fredoka'>&nbsp;</span></div>" for i in range(1, 9))}</div>{foot("Thanks for playing, and Merry Christmas!")}</div>''')
slides = f'<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{CSS}</style></head><body>{"".join(S)}</body></html>'

# ---------- A4 sheets ----------
CSS2 = """@page{size:A4;margin:14mm 14mm}*{box-sizing:border-box}body{font-family:Inter,sans-serif;color:#1F1D1A;font-size:12.5px;margin:0}
.p{page-break-after:always}h1{font-family:Fredoka;color:#B3261E;font-size:34px;margin:0 0 2px}h2{font-family:Fredoka;color:#1E5631;font-size:20px;margin:16px 0 6px}
.sub{color:#6b645a;font-weight:600;margin-bottom:6px}ol{margin:0;padding-left:22px}li{margin:3px 0}.a{color:#B3261E;font-weight:800}
table{width:100%;border-collapse:collapse}td,th{border:1.5px solid #d9d0bd;padding:8px 10px;text-align:left}th{background:#FBF7EF}
.line{height:23px;border-bottom:1.5px solid #cfc6b3}.g2{display:grid;grid-template-columns:1fr 1fr;gap:6px 26px}.f{color:#8a8378;font-size:10.5px;margin-top:14px}"""
host = "".join(f'<h2>{EMO[ri]} Round {ri + 1}: {E(rn)}</h2><ol>{"".join(f"<li>{E(q)} <span class=a>{E(a)}</span></li>" for q, a in qs)}</ol>' for ri, (rn, qs) in enumerate(ROUNDS))
sheet = "".join(f'<h2 style="margin:8px 0 2px">{EMO[ri]} Round {ri + 1}: {E(rn)}</h2><div class="g2">{"".join(f"<div class=line>{i}.</div>" for i in range(1, 11))}</div>' for ri, (rn, _) in enumerate(ROUNDS))
score = '<table><tr><th>Team</th>' + "".join(f"<th>R{i}</th>" for i in range(1, 6)) + '<th>Total</th></tr>' + "".join("<tr>" + "<td style='height:38px'></td>" * 7 + "</tr>" for _ in range(10)) + "</table>"
sheets = f'''<!doctype html><html><head><meta charset="utf-8">{FONTS}<style>{CSS2}</style></head><body>
<div class="p"><h1>🎄 Christmas Team Quiz: Host Sheet</h1><div class="sub">For the quizmaster only. Answers are in red.</div>{host}<div class="f">© The Geek Next Door Co.</div></div>
<div class="p"><h1>🎄 Team Answer Sheet</h1><div class="sub">Team name: ____________________________________</div>{sheet}<div style="margin-top:10px;font-weight:800">Total score: ______ / 50</div></div>
<div><h1>🏆 Score Sheet</h1><div class="sub">Write each team's score after every round.</div>{score}<div class="f">© The Geek Next Door Co.</div></div></body></html>'''

jobs = []
for name, doc, fmt in [("Christmas-Team-Quiz-Slides.pdf", slides, "slides"), ("Christmas-Team-Quiz-Host-and-Answer-Sheets-A4.pdf", sheets, "a4")]:
    h = os.path.join(out, "_" + name + ".html"); open(h, "w").write(doc); jobs.append([h, os.path.join(out, name), fmt])
js = """const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [h,o,f] of JSON.parse(process.argv[2])){await p.goto('file://'+h);await p.waitForLoadState('networkidle');await p.waitForTimeout(400);
 await p.pdf(f==='slides'?{path:o,width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true}:{path:o,format:'A4',printBackground:true,preferCSSPageSize:true});}await b.close()})();"""
jf = os.path.join(out, "_r.js"); open(jf, "w").write(js); subprocess.run(["node", jf, json.dumps(jobs)], check=True)
for h, _, _ in jobs: os.remove(h)
os.remove(jf); print("done", [j[1] for j in jobs])
