"""Christmas Activity Pack: python3 activity.py <out_dir>"""
import sys, os, random, math
from art import *
from layout import *
OUT = os.path.abspath(sys.argv[1]); os.makedirs(OUT, exist_ok=True)
CELL = lambda inner, vb="0 0 800 800": f'<svg class="fill" viewBox="{vb}">{G.format(inner)}</svg>'
answers = []   # (title, svg) collected for the answer pages

# ---------------- word search ----------------
def wordsearch(words, n, dirs, seed):
    rnd = random.Random(seed)
    for attempt in range(500):
        grid = [[""] * n for _ in range(n)]; placed = []
        ok = True
        for w in sorted(words, key=len, reverse=True):
            for _ in range(400):
                dx, dy = rnd.choice(dirs); x, y = rnd.randrange(n), rnd.randrange(n)
                ex, ey = x + dx * (len(w) - 1), y + dy * (len(w) - 1)
                if not (0 <= ex < n and 0 <= ey < n): continue
                if all(grid[y + dy * i][x + dx * i] in ("", w[i]) for i in range(len(w))):
                    for i in range(len(w)): grid[y + dy * i][x + dx * i] = w[i]
                    placed.append((w, x, y, ex, ey)); break
            else:
                ok = False; break
        if ok: break
    letters = "ABCDEFGHIJKLMNOPRSTUWY"
    for r in range(n):
        for c in range(n):
            if not grid[r][c]: grid[r][c] = rnd.choice(letters)
    return grid, placed

def ws_svg(grid, placed=None):
    n = len(grid); s = 800 / n; o = ""
    if placed:
        for w, x, y, ex, ey in placed:
            o += f'<line x1="{(x+.5)*s:.0f}" y1="{(y+.5)*s:.0f}" x2="{(ex+.5)*s:.0f}" y2="{(ey+.5)*s:.0f}" stroke="#F4C243" stroke-width="{s*0.72:.0f}" stroke-linecap="round" opacity=".8"/>'
    o += '<rect x="3" y="3" width="794" height="794" rx="24" fill="none" stroke-width="6"/>'
    for r in range(n):
        for c in range(n):
            o += f'<text x="{(c+.5)*s:.1f}" y="{(r+.5)*s + s*0.22:.1f}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="{s*0.6:.0f}" fill="#111" stroke="none">{grid[r][c]}</text>'
    return o

def ws_page(title, words, n, dirs, seed, tip):
    grid, placed = wordsearch(words, n, dirs, seed)
    lst = "".join(f'<span>☐ {w}</span>' for w in sorted(words))
    answers.append((title, CELL(ws_svg(grid, placed))))
    return page(title_svg(title) + instr(tip) + f'<svg class="fill" viewBox="-10 -10 820 820">{G.format(ws_svg(grid))}</svg><div class="words">{lst}</div>')

# ---------------- mazes ----------------
def maze(w, h, seed):
    rnd = random.Random(seed); walls = {(x, y): {"N", "S", "E", "W"} for x in range(w) for y in range(h)}
    D = {"N": (0, -1, "S"), "S": (0, 1, "N"), "E": (1, 0, "W"), "W": (-1, 0, "E")}
    stack = [(0, 0)]; seen = {(0, 0)}
    while stack:
        x, y = stack[-1]; nb = [(d, x + dx, y + dy, o) for d, (dx, dy, o) in D.items() if (x + dx, y + dy) in walls and (x + dx, y + dy) not in seen]
        if not nb: stack.pop(); continue
        d, nx, ny, o = rnd.choice(nb); walls[(x, y)].discard(d); walls[(nx, ny)].discard(o); seen.add((nx, ny)); stack.append((nx, ny))
    walls[(0, 0)].discard("N"); walls[(w - 1, h - 1)].discard("S")
    prev = {(0, 0): None}; q = [(0, 0)]
    while q:
        c = q.pop(0)
        for d, (dx, dy, o) in D.items():
            n2 = (c[0] + dx, c[1] + dy)
            if d not in walls[c] and n2 in walls and n2 not in prev: prev[n2] = c; q.append(n2)
    path = []; c = (w - 1, h - 1)
    while c: path.append(c); c = prev[c]
    return walls, path[::-1]

def maze_svg(w, h, walls, path=None, start_icon="", end_icon=""):
    W, H = 760, 760 * h / w; s = W / w; ox, oy = 20, 180; o = ""
    for (x, y), ws in walls.items():
        X, Y = ox + x * s, oy + y * s
        if "N" in ws: o += f'<line x1="{X:.1f}" y1="{Y:.1f}" x2="{X+s:.1f}" y2="{Y:.1f}"/>'
        if "W" in ws: o += f'<line x1="{X:.1f}" y1="{Y:.1f}" x2="{X:.1f}" y2="{Y+s:.1f}"/>'
        if "S" in ws and y == h - 1 or ("S" in ws): o += f'<line x1="{X:.1f}" y1="{Y+s:.1f}" x2="{X+s:.1f}" y2="{Y+s:.1f}"/>'
        if "E" in ws: o += f'<line x1="{X+s:.1f}" y1="{Y:.1f}" x2="{X+s:.1f}" y2="{Y+s:.1f}"/>'
    if path:
        pts = " ".join(f"{ox+(x+.5)*s:.1f},{oy+(y+.5)*s:.1f}" for x, y in path)
        o += f'<polyline points="{ox+.5*s:.1f},{oy-20} {pts} {ox+(w-.5)*s:.1f},{oy+H+20}" fill="none" stroke="#D94335" stroke-width="{max(5, s*0.28):.0f}" stroke-dasharray="1 0"/>'
    o += f'<g transform="translate({max(0, ox+.5*s-85):.0f},{oy-178}) scale(0.21)">{start_icon}</g>'
    o += f'<g transform="translate({min(632, ox+(w-.5)*s-85):.0f},{oy+H+8}) scale(0.21)">{end_icon}</g>'
    return o, H + 365

def maze_page(title, tip, w, h, seed, si, ei):
    walls, path = maze(w, h, seed); sw = 7 if w < 12 else 5
    body, H = maze_svg(w, h, walls, None, si, ei)
    vb = f"0 0 800 {H:.0f}"
    ans, _ = maze_svg(w, h, walls, path, si, ei)
    answers.append((title, f'<svg class="fill" viewBox="{vb}"><g stroke="#111" stroke-width="{sw}" stroke-linecap="round" fill="#fff">{ans}</g></svg>'))
    return page(title_svg(title) + instr(tip) + f'<svg class="fill" viewBox="{vb}"><g stroke="#111" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" fill="#fff">{body}</g></svg>')

# ---------------- dot to dot ----------------
def dots_page(title, pts, extra=""):
    cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
    o = extra
    for i, (x, y) in enumerate(pts, 1):
        a = math.atan2(y - cy, x - cx); lx, ly = x + 34 * math.cos(a), y + 34 * math.sin(a) + 10
        o += f'<circle cx="{x}" cy="{y}" r="9" fill="#111" stroke="none"/><text x="{lx:.0f}" y="{ly:.0f}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="30" fill="#111" stroke="none">{i}</text>'
    x0, y0 = pts[0]; o += f'<text x="{x0}" y="{y0-48}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="26" fill="#D94335" stroke="none">START</text>'
    return page(title_svg(title) + instr("Join the dots from 1 to " + str(len(pts)) + ", then back to 1. Then colour it in!") + CELL(o))

# ---------------- spot the difference ----------------
def scene_snow(variant):
    sm = snowman()
    if variant:   # five changes
        sm = sm.replace('<circle class="b" cx="400" cy="560" r="16"/>', '')
        sm = sm.replace(holly(470, 100, 0.45), '')
        sm = sm.replace('<path class="o" d="M400,218 L470,232 L400,240 Z"/>', '<path class="o" d="M400,218 L430,229 L400,240 Z"/>')
    o = f'<g transform="translate(200,40) scale(0.62)">{sm}</g>'
    o += '<path class="g" d="M110,190 L190,330 L30,330 Z"/><path class="g" d="M110,250 L210,420 L10,420 Z"/><rect class="br" x="95" y="420" width="30" height="40"/>'
    if not variant: o += f'<polygon class="y" points="{star_pts(110, 185, 28, 12)}"/>'
    o += '<rect class="r" x="610" y="360" width="130" height="100" rx="6"/><rect class="g" x="665" y="360" width="20" height="100"/>'
    if not variant: o += bow(675, 360, 0.35, "g")
    o += '<circle class="y" cx="700" cy="90" r="45"/>'
    for x, y in ((300, 60), (520, 40), (60, 70), (760, 220)): o += f'<circle class="w" cx="{x}" cy="{y}" r="9"/>'
    if variant: o += f'<circle class="w" cx="560" cy="220" r="14"/>'
    o += '<path d="M0,470 Q400,440 800,470" fill="none"/>'
    return o
SNOW_DIFFS = [(448, 387, 30), (491, 102, 40), (476, 182, 32), (110, 185, 40), (675, 355, 45)]
SNOW_DIFFS[0] = (400, 387, 30); SNOW_DIFFS[1] = (491, 102, 42); SNOW_DIFFS[2] = (458, 184, 30)
SNOW_DIFFS.append((560, 220, 30)); SNOW_DIFFS = SNOW_DIFFS[:3] + SNOW_DIFFS[3:6]

def scene_house(variant):
    h = house()
    if variant:
        h = h.replace('<circle class="gr" cx="640" cy="15" r="14"/>', '')
        h = h.replace('<circle class="k" cx="440" cy="620" r="7"/>', '')
        h = h.replace('<path d="M560,430 L560,530 M510,480 L610,480" fill="none"/>', '')
        h = h.replace('<circle class="w" cx="740" cy="220" r="9"/>', '')
        h = h.replace(bow(400, 600, 0.35, "r"), '')
    return f'<g transform="translate(160,0) scale(0.6)">{h}</g>'
HOUSE_DIFFS = [(160 + x * 0.6, y * 0.6, r) for x, y, r in [(640, 15, 40), (440, 620, 34), (560, 480, 75), (740, 220, 34), (400, 600, 50)]]

def spot_page(title, fn, diffs, n=5):
    a = f'<svg class="half" viewBox="0 0 800 480">{G.format(fn(False))}<rect x="3" y="3" width="794" height="474" rx="20" fill="none" stroke="#111" stroke-width="6"/></svg>'
    b = f'<svg class="half" viewBox="0 0 800 480">{G.format(fn(True))}<rect x="3" y="3" width="794" height="474" rx="20" fill="none" stroke="#111" stroke-width="6"/></svg>'
    circ = "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="#D94335" stroke-width="8"/>' for x, y, r in diffs)
    answers.append((title, f'<svg class="fill" viewBox="0 0 800 480">{G.format(fn(True))}{circ}<rect x="3" y="3" width="794" height="474" rx="20" fill="none" stroke="#111" stroke-width="6"/></svg>'))
    return page(title_svg(title) + instr(f"Can you find {n} differences between the two pictures?") + a + b + '<div class="tally">Found: ☐ ☐ ☐ ☐ ☐</div>')

# ---------------- how many ----------------
def icon(kind, x, y, s=1.0):
    t = f'transform="translate({x},{y}) scale({s})"'
    if kind == "star": return f'<polygon {t} class="y" points="{star_pts(0, 0, 34, 15)}"/>'
    if kind == "bauble": return f'<g {t}><circle class="r" cx="0" cy="6" r="28"/><rect class="gr" x="-10" y="-30" width="20" height="12" rx="3"/></g>'
    if kind == "gift": return f'<g {t}><rect class="b" x="-28" y="-24" width="56" height="50" rx="4"/><rect class="y" x="-6" y="-24" width="12" height="50"/></g>'
    if kind == "tree": return f'<g {t}><path class="g" d="M0,-36 L30,20 L-30,20 Z"/><rect class="br" x="-7" y="20" width="14" height="14"/></g>'
def howmany_page():
    rnd = random.Random(42); counts = {"star": 7, "bauble": 5, "gift": 6, "tree": 4}; pts = []; o = ""
    for k, n in counts.items():
        for _ in range(n):
            for _ in range(500):
                x, y = rnd.randint(60, 740), rnd.randint(60, 560)
                if all((x - a) ** 2 + (y - b) ** 2 > 95 ** 2 for a, b in pts): pts.append((x, y)); o += icon(k, x, y, rnd.uniform(0.9, 1.25)); break
    o += '<rect x="3" y="3" width="794" height="614" rx="20" fill="none" stroke-width="6"/>'
    key = ""
    for i, k in enumerate(counts):
        key += f'{icon(k, 90 + i*190, 700, 1)}<text x="{140 + i*190}" y="712" font-family="Fredoka" font-weight="600" font-size="36" fill="#111" stroke="none">= ___</text>'
    ans = key.replace("= ___", "= {}")
    ans = "".join(f'{icon(k, 90 + i*190, 700, 1)}<text x="{140 + i*190}" y="712" font-family="Fredoka" font-weight="700" font-size="36" fill="#D94335" stroke="none">= {n}</text>' for i, (k, n) in enumerate(counts.items()))
    answers.append(("How Many?", f'<svg class="fill" viewBox="0 0 800 760">{G.format(o + ans)}</svg>'))
    return page(title_svg("How Many?") + instr("Count each Christmas thing and write the number.") + f'<svg class="fill" viewBox="0 0 800 760">{G.format(o + key)}</svg>')

# ---------------- shadow match ----------------
def shadow_page():
    items = [("Snowman", snowman), ("Bells", bells), ("Gingerbread", gingerbread), ("Stocking", stocking), ("Tree", tree)]
    order = [3, 0, 4, 1, 2]; o = ""
    for i, (n, fn) in enumerate(items):
        o += f'<g transform="translate(20,{20 + i*240}) scale(0.27)">{fn()}</g><circle cx="300" cy="{128 + i*240}" r="12" class="k"/>'
    for i, j in enumerate(order):
        o += f'<g class="sil" transform="translate(560,{20 + i*240}) scale(0.27)">{items[j][1]()}</g><circle cx="500" cy="{128 + i*240}" r="12" class="k"/>'
    return page(title_svg("Shadow Match") + instr("Draw a line from each picture to its shadow.") + CELL(o, "0 0 800 1220"))

# ---------------- colour by number ----------------
KEY = {"g": (1, "Green"), "r": (2, "Red"), "y": (3, "Yellow"), "b": (4, "Blue"), "br": (5, "Brown"), "pk": (6, "Pink"), "o": (7, "Orange"), "sk": (8, "Peach")}
def cbn_page(title, fn, labels):
    o = fn()
    for cls, x, y in labels:
        n = KEY[cls][0]; o += f'<text x="{x}" y="{y+12}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="34" fill="#111" stroke="#fff" stroke-width="6" paint-order="stroke">{n}</text>'
    used = []
    for c, *_ in labels:
        if c not in used: used.append(c)
    from style import COLOURS
    key = "".join(f'<span class="sw"><i style="background:{COLOURS[c]}"></i>{KEY[c][0]} = {KEY[c][1]}</span>' for c in sorted(used, key=lambda c: KEY[c][0]))
    return page(title_svg(title) + instr("Colour each part using the colour for its number.") + CELL(o) + f'<div class="key">{key}</div>')
TREE_L = [("g", 400, 250), ("g", 300, 420), ("g", 520, 560), ("g", 250, 600), ("y", 400, 108), ("br", 400, 690), ("r", 330, 240), ("b", 460, 270), ("y", 300, 390), ("r", 470, 400), ("pk", 390, 330),
          ("b", 250, 540), ("y", 380, 470), ("pk", 540, 520), ("r", 330, 600), ("y", 480, 610), ("b", 600, 610), ("r", 180, 720), ("b", 580, 730)]
GING_L = [("br", 400, 330), ("br", 400, 120), ("br", 190, 300), ("br", 610, 300), ("br", 315, 610), ("br", 485, 610), ("pk", 330, 215), ("pk", 470, 215), ("r", 400, 450), ("g", 400, 390), ("r", 400, 520)]
REIN_L = [("br", 400, 290), ("br", 205, 300), ("br", 595, 300), ("sk", 400, 618), ("r", 400, 535), ("g", 330, 700), ("y", 400, 722), ("y", 340, 705), ("y", 460, 705), ("br", 220, 100), ("br", 580, 100)]

# ---------------- noughts & crosses ----------------
def ttt_page():
    o = ""
    for i in range(6):
        X, Y = 70 + (i % 2) * 380, 30 + (i // 2) * 360
        o += f'<path d="M{X+100},{Y} L{X+100},{Y+300} M{X+200},{Y} L{X+200},{Y+300} M{X},{Y+100} L{X+300},{Y+100} M{X},{Y+200} L{X+300},{Y+200}" fill="none" stroke-width="9"/>'
    return page(title_svg("Snowmen vs Stars") + instr("Christmas noughts &amp; crosses! One player draws snowmen ☃, the other draws stars ★. Get three in a row to win.") + CELL(o, "0 0 800 1100"))

def cover():
    from art import presents, penguin, elf
    cols = ["#D94335", "#3E9A57", "#F4C243", "#3D78C2"]; letters = "".join(f'<tspan fill="{cols[i % 4]}">{ch}</tspan>' for i, ch in enumerate("Christmas"))
    t = (f'<svg class="t" viewBox="0 0 1200 560"><text x="600" y="210" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="200" stroke="#111" stroke-width="14" paint-order="stroke" stroke-linejoin="round">{letters}</text>'
         f'<text x="600" y="400" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="140" fill="#fff" stroke="#111" stroke-width="12" paint-order="stroke">Activity Pack</text>'
         f'<text x="600" y="510" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="44" fill="#3E9A57">Puzzles · Mazes · Dot-to-dot · Colour by number</text></svg>')
    arts = "".join(f'<svg viewBox="0 0 800 800">{G.format(f())}</svg>' for f in (elf, presents, penguin, reindeer, tree, snowman))
    return (f'<section class="pg c"><div class="frame cov">{t}<div class="grid3">{arts}</div><div class="instr" style="color:#B3261E">Ages 4–8 · Answers included</div></div><div class="foot">The Geek Next Door Co.</div></section>')

pages = [cover(),
    ws_page("Word Search", ["SANTA", "ELF", "STAR", "TREE", "SNOW", "BELLS", "GIFT", "HOLLY", "SLEIGH"], 9, [(1, 0), (0, 1)], 3, "Find the words. They go across → and down ↓."),
    maze_page("Help Rudolph!", "Help Rudolph find his way to Santa.", 6, 8, 11, reindeer(), santa()),
    dots_page("Dot to Dot", [tuple(map(float, p.split(","))) for p in star_pts(400, 420, 330, 140).split()]),
    howmany_page(),
    cbn_page("Colour by Number", tree, TREE_L),
    spot_page("Spot the Difference", scene_snow, SNOW_DIFFS),
    maze_page("Elf Maze", "Help the elf get back to the presents.", 9, 12, 5, elf(), presents()),
    dots_page("Dot to Dot", [(400, 90), (520, 260), (470, 260), (600, 420), (530, 420), (690, 600), (440, 600), (440, 700), (360, 700), (360, 600), (110, 600), (270, 420), (200, 420), (330, 260), (280, 260)]),
    shadow_page(),
    cbn_page("Colour by Number", gingerbread, GING_L),
    ws_page("Super Word Search", ["REINDEER", "SNOWMAN", "STOCKING", "CANDYCANE", "PRESENTS", "MISTLETOE", "GINGERBREAD", "CRACKER", "CAROLS", "TINSEL", "ROBIN", "PUDDING"], 12, [(1, 0), (0, 1), (1, 1)], 7, "Find the words. They go across →, down ↓ and diagonally ↘."),
    dots_page("Dot to Dot", [(400, 130), (470, 150), (510, 230), (520, 370), (560, 490), (640, 570), (160, 570), (240, 490), (280, 370), (290, 230), (330, 150)], '<circle class="w" cx="400" cy="610" r="40"/><rect class="w" x="375" y="85" width="50" height="45" rx="10"/>'),
    spot_page("Spot the Difference", scene_house, HOUSE_DIFFS),
    maze_page("Penguin Maze", "Can you get the penguin home in time for Christmas?", 13, 17, 23, penguin(), house()),
    cbn_page("Colour by Number", reindeer, REIN_L),
    dots_page("Dot to Dot", [(300, 140), (500, 140), (500, 460), (600, 540), (650, 610), (620, 680), (540, 690), (360, 580), (300, 490)]),
    ttt_page()]
# answers: 4 per page
for k in range(0, len(answers), 4):
    grid = "".join(f'<div class="ans"><div class="at">{t}</div>{s}</div>' for t, s in answers[k:k + 4])
    pages.append(page(title_svg("Answers") + f'<div class="agrid">{grid}</div>'))
pages.append(page('<div class="thx"><h1>Well done!</h1><p>You finished the Christmas Activity Pack! 🎄</p><p>If you enjoyed it, a review on Etsy would mean the world to a small shop.</p>'
                  '<p class="sm">Print on plain A4 or Letter paper and choose "Fit to page". © The Geek Next Door Co. For personal and classroom use only. Please don\'t share or resell.</p></div>'))
EXTRA = """.words{{display:flex;flex-wrap:wrap;gap:3mm 7mm;justify-content:center;font-family:Fredoka;font-weight:600;font-size:16pt;width:92%}}
svg.half{{width:100%;flex:1;min-height:0}} .tally{{font-family:Fredoka;font-size:18pt}}
.key{{display:flex;flex-wrap:wrap;gap:3mm 6mm;justify-content:center;font-family:Fredoka;font-size:15pt}} .sw{{display:flex;align-items:center;gap:2mm}} .sw i{{width:9mm;height:9mm;border-radius:50%;border:0.6mm solid #111;display:inline-block}}
.agrid{{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4mm;width:100%;flex:1;min-height:0}} .ans{{display:flex;flex-direction:column;align-items:center;min-height:0}} .ans svg{{flex:1;min-height:0;width:100%}}
.at{{font-family:Fredoka;font-weight:600;font-size:13pt}} .cov{{background:#FBF7EF;border-color:#B3261E}} .grid3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm;width:95%}} .grid3 svg{{width:100%}}
.thx{{text-align:center;font-family:Fredoka;margin:auto;width:80%}} .thx h1{{font-size:44pt;color:#B3261E;margin:0 0 6mm}} .thx p{{font-size:16pt}} .thx p.sm{{font-family:Inter;font-size:10pt;color:#666}}""".replace("{{", "{").replace("}}", "}")
outs = build(pages, f"{OUT}/Christmas-Activity-Pack", EXTRA)
print(len(pages), "pages", outs)
