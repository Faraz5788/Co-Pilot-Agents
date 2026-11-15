"""Original Christmas line art for the colouring book. Every picture is an 800x800 SVG body.
Shapes carry a colour class (r g y b o br pk sk gr lb w); the printable version paints them all white."""
import math

def union(shapes, cls):
    """Merge overlapping shapes into one outlined silhouette (thick black pass, then fill pass)."""
    return f'<g fill="#111" stroke="#111" stroke-width="14">{shapes}</g><g class="{cls}" stroke="none">{shapes}</g>'

def tube(d, cls, w=56):
    """A hollow 'tube' following a path — for branches, antlers, snowflake arms."""
    return f'<path d="{d}" fill="none" stroke="#111" stroke-width="{w}"/><path d="{d}" fill="none" class="s{cls}" stroke-width="{w-14}"/>'

def star_pts(cx, cy, R, r, n=5, rot=-90):
    pts = []
    for i in range(2 * n):
        a = math.radians(rot + i * 180 / n); rr = R if i % 2 == 0 else r
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return " ".join(pts)

def dot(x, y, r=9): return f'<circle cx="{x}" cy="{y}" r="{r}" class="k"/>'
def eyes(x1, x2, y, r=12): return dot(x1, y, r) + dot(x2, y, r) + f'<circle cx="{x1+4}" cy="{y-4}" r="3.5" fill="#fff" stroke="none"/><circle cx="{x2+4}" cy="{y-4}" r="3.5" fill="#fff" stroke="none"/>'
def smile(cx, cy, w=40, h=18): return f'<path d="M{cx-w},{cy} Q{cx},{cy+h*2} {cx+w},{cy}" fill="none"/>'

def holly(cx, cy, s=1.0, rot=0):
    leaf = "M0,0 C20,-12 30,-40 60,-38 C52,-28 70,-22 78,-30 C82,-12 100,-8 112,-14 C104,0 104,10 112,22 C96,18 84,24 80,38 C70,28 54,32 50,44 C40,28 18,12 0,0 Z"
    g = f'<g stroke-width="{7/s:.2f}" transform="translate({cx},{cy}) rotate({rot}) scale({s})">'
    g += f'<path class="g" d="{leaf}" transform="rotate(-20)"/><path class="g" d="{leaf}" transform="scale(-1,1) rotate(-20)"/>'
    g += '<path d="M8,-6 L90,-26" transform="rotate(-20)" fill="none"/><path d="M8,-6 L90,-26" transform="scale(-1,1) rotate(-20)" fill="none"/>'
    g += '<circle class="r" cx="-14" cy="-18" r="16"/><circle class="r" cx="14" cy="-18" r="16"/><circle class="r" cx="0" cy="-42" r="16"/></g>'
    return g

def bow(cx, cy, s=1.0, cls="r"):
    return (f'<g stroke-width="{7/s:.2f}" transform="translate({cx},{cy}) scale({s})"><path class="{cls}" d="M0,0 C-20,-60 -90,-50 -70,-10 C-60,10 -20,8 0,0 Z"/>'
            f'<path class="{cls}" d="M0,0 C20,-60 90,-50 70,-10 C60,10 20,8 0,0 Z"/><path class="{cls}" d="M-6,4 L-40,60 L-22,56 L-14,72 L0,8 Z"/>'
            f'<path class="{cls}" d="M6,4 L40,60 L22,56 L14,72 L0,8 Z"/><circle class="{cls}" cx="0" cy="0" r="14"/></g>')

def snowman():
    s = '<path d="M40,740 Q400,690 760,740" fill="none"/>'
    s += tube("M250,420 L130,330 M160,352 L120,300 M550,420 L670,330 M640,352 L690,310", "br", 34)
    s += '<circle class="w" cx="400" cy="600" r="170"/><circle class="w" cx="400" cy="390" r="128"/><circle class="w" cx="400" cy="215" r="92"/>'
    s += '<path class="r" d="M300,300 Q400,350 500,300 L506,330 Q400,385 294,330 Z"/><path class="r" d="M440,330 L470,450 L430,455 L410,340 Z"/>'
    s += '<path d="M445,380 L460,378 M452,410 L466,408" fill="none"/>'
    s += eyes(368, 432, 195, 11) + '<path class="o" d="M400,218 L470,232 L400,240 Z"/>' + "".join(dot(x, y, 6) for x, y in [(365, 262), (382, 270), (400, 273), (418, 270), (435, 262)])
    s += '<rect class="k2" x="310" y="122" width="180" height="22" rx="6"/><rect class="k2" x="340" y="20" width="120" height="110" rx="8"/><rect class="r" x="340" y="92" width="120" height="24"/>'
    s += "".join(f'<circle class="b" cx="400" cy="{y}" r="16"/>' for y in (390, 450, 560, 640))
    s += holly(470, 100, 0.45)
    return s

def tree():
    s = '<rect class="br" x="360" y="640" width="80" height="80" rx="6"/>'
    tiers = [(400, 110, 230, 340), (400, 250, 290, 500), (400, 390, 340, 660)]
    for cx, top, half, bot in tiers:
        s += f'<path class="g" d="M{cx},{top} L{cx+half},{bot} Q{cx+half/2},{bot-28} {cx},{bot} Q{cx-half/2},{bot-28} {cx-half},{bot} Z"/>'
    s += '<path d="M280,300 Q400,350 520,290 M220,450 Q400,520 590,430 M160,600 Q400,690 650,580" fill="none" stroke-dasharray="2 22" stroke-width="12"/>'
    s += f'<polygon class="y" points="{star_pts(400, 105, 70, 30)}"/>'
    for (x, y, c) in [(330, 240, "r"), (460, 270, "b"), (300, 390, "y"), (470, 400, "r"), (390, 330, "pk"), (250, 540, "b"), (380, 470, "y"), (540, 520, "pk"), (330, 600, "r"), (480, 610, "y"), (600, 610, "b"), (200, 640, "pk")]:
        s += f'<circle class="{c}" cx="{x}" cy="{y}" r="24"/><rect class="gr" x="{x-8}" y="{y-34}" width="16" height="12" rx="3"/>'
    s += '<rect class="r" x="150" y="660" width="140" height="100" rx="6"/><rect class="g" x="210" y="660" width="20" height="100"/>' + bow(220, 660, 0.45, "g")
    s += '<rect class="b" x="520" y="680" width="120" height="80" rx="6"/><rect class="y" x="570" y="680" width="20" height="80"/>' + bow(580, 680, 0.4, "y")
    return s

def gingerbread():
    sh = ('<circle cx="400" cy="190" r="110"/><rect x="290" y="270" width="220" height="250" rx="70"/>'
          '<rect x="140" y="300" width="230" height="90" rx="45" transform="rotate(-18 255 345)"/><rect x="430" y="300" width="230" height="90" rx="45" transform="rotate(18 545 345)"/>'
          '<rect x="285" y="440" width="100" height="260" rx="50" transform="rotate(12 335 570)"/><rect x="415" y="440" width="100" height="260" rx="50" transform="rotate(-12 465 570)"/>')
    s = union(sh, "br")
    zig = lambda x1, x2, y: "M" + " L".join(f"{x1 + i*(x2-x1)/8:.0f},{y + (12 if i % 2 else -12)}" for i in range(9))
    s += f'<path d="{zig(170, 300, 345)}" fill="none" stroke-width="6" transform="rotate(-18 235 345)"/><path d="{zig(500, 630, 345)}" fill="none" stroke-width="6" transform="rotate(18 565 345)"/>'
    s += f'<path d="{zig(290, 360, 650)}" fill="none" stroke-width="6" transform="rotate(12 325 650)"/><path d="{zig(440, 510, 650)}" fill="none" stroke-width="6" transform="rotate(-12 475 650)"/>'
    s += eyes(360, 440, 170, 14) + smile(400, 215, 42, 14) + '<circle class="pk" cx="330" cy="215" r="18"/><circle class="pk" cx="470" cy="215" r="18"/>'
    s += "".join(f'<circle class="{c}" cx="400" cy="{y}" r="20"/>' for y, c in ((330, "r"), (390, "g"), (450, "r")))
    s += bow(400, 285, 0.5, "g")
    return s

def stocking():
    sd = "M300,190 L520,190 L520,520 Q520,560 560,590 L640,640 Q700,690 650,740 Q600,790 520,740 L340,620 Q280,580 300,520 Z"
    s = f'<defs><clipPath id="stk"><path d="{sd}"/></clipPath></defs><path class="r" d="{sd}"/>'
    s += '<g clip-path="url(#stk)"><circle class="w" cx="660" cy="720" r="110"/><circle class="w" cx="300" cy="560" r="95"/></g>'
    s += f'<path d="{sd}" fill="none"/>'
    for i, y in enumerate((260, 320, 380)):
        s += f'<path d="M300,{y} L520,{y}" fill="none" stroke-width="5"/>'
    s += "".join(f'<polygon class="y" points="{star_pts(x, y, 26, 11)}"/>' for x, y in ((360, 290), (460, 350), (410, 410), (470, 520)))
    s += '<rect class="w" x="260" y="90" width="300" height="120" rx="40"/>' + "".join(f'<circle cx="{x}" cy="{y}" r="5" class="k"/>' for x, y in ((300, 130), (350, 170), (410, 125), (470, 175), (520, 135)))
    s += holly(560, 110, 0.6, 20) + '<path d="M300,90 Q250,30 320,20 Q370,20 350,90" fill="none" stroke-width="10"/>'
    return s

def presents():
    s = '<rect class="r" x="120" y="420" width="300" height="300" rx="10"/><rect class="g" x="250" y="420" width="40" height="300"/><rect class="g" x="120" y="550" width="300" height="40"/>' + bow(270, 420, 0.75, "g")
    s += '<rect class="b" x="430" y="500" width="250" height="220" rx="10"/><rect class="y" x="540" y="500" width="34" height="220"/>' + bow(557, 500, 0.6, "y")
    s += "".join(f'<circle cx="{x}" cy="{y}" r="12" class="w"/>' for x, y in ((470, 560), (640, 560), (480, 680), (630, 670), (500, 620), (620, 620)))
    s += '<rect class="pk" x="230" y="210" width="230" height="200" rx="10"/><rect class="b" x="330" y="210" width="30" height="200"/>' + bow(345, 210, 0.55, "b")
    s += "".join(f'<polygon class="y" points="{star_pts(x, y, 20, 8)}"/>' for x, y in ((270, 260), (420, 270), (280, 360), (420, 370)))
    s += '<rect class="w" x="150" y="610" width="90" height="60" rx="8"/><path d="M165,640 L225,640" fill="none" stroke-width="5"/>'
    return s

def candy():
    s = '<defs><clipPath id="cm1"><path d="M362,720 L362,250 A142,142 0 0 0 78,250 L78,300 L142,300 L142,250 A78,78 0 0 1 298,250 L298,720 Z"/></clipPath>'
    s += '<clipPath id="cm2"><path d="M438,720 L438,250 A142,142 0 0 1 722,250 L722,300 L658,300 L658,250 A78,78 0 0 0 502,250 L502,720 Z"/></clipPath></defs>'
    for d, m, c in (("M330,720 L330,250 A110,110 0 0 0 110,250 L110,300", "cm1", "r"), ("M470,720 L470,250 A110,110 0 0 1 690,250 L690,300", "cm2", "g")):
        s += f'<path d="{d}" fill="none" stroke="#111" stroke-width="78"/><path d="{d}" fill="none" class="sw" stroke-width="64"/>'
        s += f'<g clip-path="url(#{m})">' + "".join(f'<path class="{c}" d="M{x},0 l38,0 l-420,800 l-38,0 Z" stroke-width="5"/>' for x in range(0, 1240, 84)) + '</g>'
    s += bow(400, 470, 1.0, "r") + holly(400, 600, 0.7)
    return s

def bauble():
    s = '<defs><clipPath id="bc"><circle cx="400" cy="450" r="270"/></clipPath></defs>'
    s += '<path d="M400,60 Q350,60 360,120 M400,60 Q450,60 440,120" fill="none" stroke-width="9"/>'
    s += '<circle class="r" cx="400" cy="450" r="270"/><g clip-path="url(#bc)">'
    s += '<rect class="y" x="100" y="330" width="600" height="60"/><rect class="g" x="100" y="510" width="600" height="60"/>'
    s += '<path class="b" d="M100,420 ' + " ".join(f"L{130+i*40},{(400 if i % 2 == 0 else 480)}" for i in range(16)) + ' L700,420 Z" />'
    s += "".join(f'<circle class="w" cx="{x}" cy="640" r="18"/>' for x in range(200, 640, 70))
    s += "".join(f'<polygon class="y" points="{star_pts(x, 255, 26, 11)}"/>' for x in range(240, 600, 90)) + '</g>'
    s += '<circle cx="400" cy="450" r="270" fill="none"/>'
    s += '<rect class="gr" x="330" y="140" width="140" height="55" rx="12"/><path d="M350,150 L350,185 M380,150 L380,185 M410,150 L410,185 M440,150 L440,185" fill="none" stroke-width="5"/>'
    return s

def santa():
    s = '<path class="r" d="M210,300 Q300,40 520,90 Q660,130 700,300 Q690,330 650,330 Q630,230 560,190 Z"/>'
    s += '<path class="r" d="M210,300 Q260,120 420,110 Q560,110 600,300 Z"/><circle class="w" cx="680" cy="330" r="50"/>'
    s += '<path class="w" d="M180,300 Q170,250 230,250 L580,250 Q640,250 630,300 Q640,350 580,350 L230,350 Q170,350 180,300 Z"/>'
    s += '<circle class="sk" cx="405" cy="440" r="140"/><circle class="pk" cx="300" cy="445" r="26"/><circle class="pk" cx="510" cy="445" r="26"/>'
    beard = "M250,450 " + " ".join(f"Q{260+i*30},{560+abs(4-i)*-18+90} {280+i*30+15},{470+ (250 - abs(5-i)*30)}" for i in range(0)) 
    s += '<path class="w" d="M260,460 Q240,560 300,640 Q340,700 405,720 Q470,700 510,640 Q570,560 550,460 Q520,520 470,530 Q405,560 340,530 Q290,520 260,460 Z"/>'
    s += '<path d="M290,560 Q320,600 340,580 M360,640 Q380,670 400,650 M430,620 Q450,650 470,630 M500,560 Q520,590 530,570" fill="none" stroke-width="5"/>'
    s += '<path class="w" d="M405,505 Q360,470 320,500 Q300,520 330,530 Q370,530 405,515 Q440,530 480,530 Q510,520 490,500 Q450,470 405,505 Z"/>'
    s += '<circle class="pk" cx="405" cy="462" r="24"/>' + eyes(355, 455, 410, 13)
    s += '<path d="M330,375 Q355,360 380,375 M430,375 Q455,360 480,375" fill="none" stroke-width="9"/>'
    return s

def reindeer():
    s = tube("M300,260 Q260,160 220,90 M262,190 Q200,170 170,190 M235,130 Q260,80 300,70", "br", 46)
    s += tube("M500,260 Q540,160 580,90 M538,190 Q600,170 630,190 M565,130 Q540,80 500,70", "br", 46)
    s += '<path class="br" d="M270,300 Q190,240 160,300 Q200,360 280,350 Z"/><path class="br" d="M530,300 Q610,240 640,300 Q600,360 520,350 Z"/>'
    s += '<path class="br" d="M400,220 Q560,220 560,400 Q560,520 500,600 Q460,660 400,660 Q340,660 300,600 Q240,520 240,400 Q240,220 400,220 Z"/>'
    s += '<path class="sk" d="M400,470 Q500,470 500,560 Q500,650 400,650 Q300,650 300,560 Q300,470 400,470 Z"/>'
    s += '<circle class="r" cx="400" cy="520" r="58"/><circle cx="385" cy="503" r="12" fill="#fff" stroke="none"/>' + eyes(340, 460, 390, 18)
    s += '<path d="M310,350 Q340,330 370,350 M430,350 Q460,330 490,350" fill="none" stroke-width="8"/>' + smile(400, 600, 34, 12)
    s += '<path class="g" d="M290,640 Q400,720 510,640 L520,690 Q400,770 280,690 Z"/>' + "".join(f'<circle class="y" cx="{x}" cy="{y}" r="16"/>' for x, y in ((340, 705), (400, 722), (460, 705)))
    return s

def snowflakes():
    def flake(cx, cy, R, w):
        d = ""
        for k in range(6):
            a = math.radians(k * 60); x2, y2 = cx + R * math.cos(a), cy + R * math.sin(a)
            d += f"M{cx},{cy} L{x2:.0f},{y2:.0f} "
            for f in (0.55, 0.8):
                bx, by = cx + R * f * math.cos(a), cy + R * f * math.sin(a)
                for sgn in (-1, 1):
                    b = a + sgn * math.radians(45); L = R * 0.25
                    d += f"M{bx:.0f},{by:.0f} L{bx + L*math.cos(b):.0f},{by + L*math.sin(b):.0f} "
        return d
    s = ""
    for cx, cy, R, c in ((400, 400, 250, "lb"), (140, 140, 95, "b"), (660, 150, 90, "lb"), (150, 660, 90, "lb"), (660, 650, 100, "b")):
        w = 46 if R > 200 else 32
        s += f'<path d="{flake(cx, cy, R, w)}" fill="none" stroke="#111" stroke-width="{w}"/><path d="{flake(cx, cy, R, w)}" fill="none" class="s{c}" stroke-width="{w-14}"/>'
        s += f'<circle class="w" cx="{cx}" cy="{cy}" r="{R*0.16:.0f}"/>'
    return s

def house():
    s = '<path class="w" d="M-20,720 Q200,670 400,700 Q600,730 820,690 L820,840 L-20,840 Z"/>'
    s += '<rect class="br" x="520" y="120" width="70" height="160"/><path class="w" d="M510,125 Q555,95 600,125 Q610,140 600,145 L510,145 Q500,140 510,125 Z"/>'
    s += '<circle class="gr" cx="570" cy="70" r="26"/><circle class="gr" cx="610" cy="40" r="20"/><circle class="gr" cx="640" cy="15" r="14"/>'
    s += '<rect class="y" x="150" y="350" width="500" height="360"/><path class="r" d="M110,370 L400,140 L690,370 Z"/>'
    s += '<path class="w" d="M400,140 L540,251 Q520,272 495,252 Q470,280 445,256 Q420,282 400,258 Q380,282 355,256 Q330,280 305,252 Q280,272 260,251 Z"/>'
    s += '<path class="w" d="M110,370 Q130,345 150,358 Q170,340 190,360 Q160,385 110,370 Z M690,370 Q670,345 650,358 Q630,340 610,360 Q640,385 690,370 Z"/>'
    s += '<rect class="b" x="340" y="520" width="120" height="190" rx="6"/><circle class="k" cx="440" cy="620" r="7"/>'
    s += '<circle class="g" cx="400" cy="570" r="40"/><circle class="w" cx="400" cy="570" r="18"/>' + bow(400, 600, 0.35, "r")
    for x in (190, 510):
        s += f'<rect class="lb" x="{x}" y="430" width="100" height="100" rx="4"/><path d="M{x+50},430 L{x+50},530 M{x},480 L{x+100},480" fill="none"/>'
    s += '<circle class="y" cx="400" cy="280" r="45"/><path d="M400,235 L400,325 M355,280 L445,280" fill="none"/>'
    s += "".join(f'<circle class="w" cx="{x}" cy="{y}" r="9"/>' for x, y in ((80, 100), (180, 60), (280, 120), (700, 90), (740, 220), (60, 260), (720, 320), (90, 470), (730, 470)))
    return s

def penguin():
    sh = '<ellipse cx="400" cy="450" rx="200" ry="260"/><circle cx="400" cy="230" r="140"/>'
    s = '<ellipse class="o" cx="320" cy="720" rx="70" ry="30"/><ellipse class="o" cx="480" cy="720" rx="70" ry="30"/>'
    s += '<path class="k2" d="M215,380 Q120,470 160,560 Q210,520 240,470 Z"/><path class="k2" d="M585,380 Q680,470 640,560 Q590,520 560,470 Z"/>'
    s += union(sh, "k2")
    s += '<path class="w" d="M400,170 Q470,170 480,250 Q560,320 560,470 Q560,660 400,680 Q240,660 240,470 Q240,320 320,250 Q330,170 400,170 Z"/>'
    s += eyes(355, 445, 240, 15) + '<path class="o" d="M370,275 L430,275 L400,310 Z"/>' + '<circle class="pk" cx="330" cy="290" r="18"/><circle class="pk" cx="470" cy="290" r="18"/>'
    s += '<path class="r" d="M285,340 Q400,390 515,340 L520,375 Q400,430 280,375 Z"/><path class="r" d="M460,380 L500,480 L460,490 L430,395 Z"/>'
    s += '<path class="g" d="M270,170 Q300,40 420,60 Q520,80 530,170 Q400,130 270,170 Z"/><rect class="w" x="255" y="150" width="290" height="45" rx="22"/><circle class="w" cx="420" cy="50" r="34"/>'
    return s

def bells():
    bell = "M0,-150 Q90,-150 100,-20 Q105,60 160,110 L-160,110 Q-105,60 -100,-20 Q-90,-150 0,-150 Z"
    s = ""
    for cx, cy, rot, c in ((290, 450, -14, "y"), (510, 450, 14, "y")):
        s += f'<g transform="translate({cx},{cy}) rotate({rot})"><circle class="gr" cx="0" cy="135" r="34"/><path class="{c}" d="{bell}"/>'
        s += '<path d="M-118,60 Q0,90 118,60" fill="none" stroke-width="6"/><path d="M-100,-10 Q0,15 100,-10" fill="none" stroke-width="6"/><rect class="y" x="-22" y="-185" width="44" height="40" rx="10"/></g>'
    s += bow(400, 250, 1.1, "r") + holly(400, 175, 0.6)
    s += "".join(f'<polygon class="y" points="{star_pts(x, y, 22, 9)}"/>' for x, y in ((120, 200), (680, 200), (130, 690), (670, 690)))
    return s

def holly_page():
    s = holly(400, 430, 2.6) + holly(170, 170, 1.0, -25) + holly(640, 660, 1.0, 20) + holly(640, 170, 0.9, 25) + holly(160, 650, 0.9, -15)
    return s

def star_page():
    s = f'<polygon class="y" points="{star_pts(400, 420, 320, 140)}" stroke-width="9"/><polygon class="o" points="{star_pts(400, 420, 170, 75)}"/>'
    s += eyes(360, 440, 410, 14) + smile(400, 445, 30, 10) + '<circle class="pk" cx="335" cy="450" r="16"/><circle class="pk" cx="465" cy="450" r="16"/>'
    for x, y in ((110, 120), (690, 120), (110, 720), (690, 720), (400, 760)):
        s += f'<polygon class="lb" points="{star_pts(x, y, 38, 12, 4, 0)}"/>'
    return s

def elf():
    s = '<path class="sk" d="M210,420 Q120,330 130,300 Q200,330 260,380 Z"/><path class="sk" d="M590,420 Q680,330 670,300 Q600,330 540,380 Z"/>'
    s += '<circle class="sk" cx="400" cy="450" r="170"/>'
    s += '<path class="g" d="M220,330 Q260,90 470,60 Q590,40 650,120 Q600,110 560,130 Q610,220 580,330 Z"/><circle class="y" cx="660" cy="130" r="38"/>'
    s += '<path class="r" d="M210,330 Q400,270 590,330 L595,375 Q400,320 205,375 Z"/>'
    s += eyes(345, 455, 450, 16) + '<circle class="pk" cx="400" cy="495" r="22"/><circle class="pk" cx="310" cy="510" r="22"/><circle class="pk" cx="490" cy="510" r="22"/>'
    s += '<path d="M340,550 Q400,600 460,550" fill="none"/>' + "".join(dot(x, y, 4) for x, y in ((320, 480), (335, 495), (465, 480), (480, 495)))
    s += '<path class="g" d="M250,600 L300,680 L340,620 L400,700 L460,620 L500,680 L550,600 Q400,650 250,600 Z"/>' + "".join(f'<circle class="y" cx="{x}" cy="{y}" r="13"/>' for x, y in ((300, 680), (400, 700), (500, 680)))
    return s

def mittens():
    m = "M-100,-150 Q-110,-260 0,-260 Q110,-260 105,-150 L100,60 L-100,60 Z"
    th = "M-95,-60 Q-170,-90 -160,-150 Q-150,-190 -105,-160"
    s = '<path d="M290,160 Q400,40 510,160" fill="none" stroke-width="10"/>'
    for cx, rot, sx, c in ((260, -10, 1, "r"), (540, 10, -1, "b")):
        s += f'<g transform="translate({cx},430) rotate({rot}) scale({sx},1)">' + union(f'<path d="{m}"/><path d="{th} Q-130,-30 -95,-20 Z"/><ellipse cx="-130" cy="-120" rx="45" ry="70" transform="rotate(-30 -130 -120)"/>', c)
        s += '<rect class="w" x="-115" y="50" width="230" height="80" rx="20"/><path d="M-90,70 L-90,110 M-55,70 L-55,110 M-20,70 L-20,110 M15,70 L15,110 M50,70 L50,110 M85,70 L85,110" fill="none" stroke-width="5"/>'
        s += f'<path class="w" d="M0,-140 C-40,-180 -80,-120 0,-70 C80,-120 40,-180 0,-140 Z"/>' + ''.join(f'<circle class="y" cx="{x}" cy="{y}" r="12"/>' for x, y in ((-50, -10), (0, 0), (50, -10)))
        s += '</g>'
    s += "".join(f'<circle class="w" cx="{x}" cy="{y}" r="10"/>' for x, y in ((120, 120), (680, 120), (400, 260), (120, 720), (680, 720), (400, 700)))
    return s

def pudding():
    s = '<ellipse class="w" cx="400" cy="640" rx="320" ry="70"/><ellipse class="lb" cx="400" cy="630" rx="260" ry="45"/>'
    s += '<path class="br" d="M150,600 Q130,300 400,260 Q670,300 650,600 Q400,660 150,600 Z"/>'
    s += '<path class="w" d="M175,400 Q200,280 400,265 Q600,280 625,400 Q600,440 580,410 Q565,470 540,420 Q510,460 490,410 Q460,480 430,415 Q400,450 370,415 Q340,470 310,410 Q280,450 260,410 Q235,460 215,405 Q195,430 175,400 Z"/>'
    s += "".join(f'<circle class="k" cx="{x}" cy="{y}" r="9"/>' for x, y in ((230, 520), (300, 470), (370, 540), (450, 500), (520, 560), (580, 480), (270, 580), (420, 590), (560, 600), (330, 610)))
    s += holly(400, 300, 0.9)
    return s

def robin():
    s = tube("M60,640 Q300,600 520,650 Q640,680 760,640 M480,640 Q560,580 620,560", "br", 42)
    s += holly(650, 700, 0.8, 10)
    s += '<path class="br" d="M560,420 L720,330 Q740,400 660,470 Z"/>'
    s += '<ellipse class="br" cx="420" cy="440" rx="200" ry="170"/><circle class="br" cx="290" cy="300" r="110"/>'
    s += '<path class="r" d="M230,330 Q220,470 330,540 Q420,580 470,520 Q420,480 400,420 Q380,350 330,320 Q280,300 230,330 Z"/>'
    s += '<path class="br" d="M400,360 Q560,340 600,440 Q560,520 460,500 Q520,430 400,360 Z"/>'
    s += '<path d="M450,400 Q500,420 520,460 M440,430 Q480,450 495,480" fill="none" stroke-width="5"/>'
    s += eyes(270, 270, 280, 14)[:0] + dot(275, 280, 14) + '<circle cx="279" cy="276" r="4" fill="#fff" stroke="none"/>'
    s += '<path class="o" d="M185,300 L130,318 L185,330 Z"/>'
    s += '<path d="M380,600 L370,650 M440,600 L450,650 M355,650 L385,650 M435,650 L465,650" fill="none" stroke-width="8"/>'
    return s

def sleigh():
    s = '<path d="M80,690 L620,690 Q700,690 720,620 Q730,580 700,575" fill="none" stroke-width="16" stroke="#111"/><path d="M80,690 L620,690 Q700,690 720,620 Q730,580 700,575" fill="none" class="sgr" stroke-width="4"/>'
    s += '<path d="M200,690 L220,620 M480,690 L460,620" fill="none" stroke-width="12"/>'
    s += '<rect class="b" x="170" y="300" width="130" height="130" rx="8"/><rect class="y" x="225" y="300" width="20" height="130"/>' + bow(235, 300, 0.4, "y")
    s += '<path class="br" d="M300,250 Q360,200 420,250 L450,420 L280,420 Z"/><path d="M320,262 Q360,290 400,262" fill="none"/>'
    s += '<rect class="g" x="420" y="330" width="110" height="100" rx="8"/><rect class="r" x="465" y="330" width="20" height="100"/>' + bow(475, 330, 0.35, "r")
    s += '<path class="r" d="M100,420 L600,420 Q680,420 690,500 Q700,560 640,610 L160,620 Q110,620 100,560 Z"/>'
    s += '<path class="r" d="M100,420 Q60,380 90,330 Q130,290 160,340 Q170,380 140,420 Z"/>'
    s += '<path class="y" d="M140,480 Q300,460 460,480 Q600,500 640,560 Q450,520 140,560 Z"/>'
    s += "".join(f'<polygon class="y" points="{star_pts(x, y, 22, 9)}"/>' for x, y in ((90, 120), (300, 90), (560, 140), (720, 260), (680, 60)))
    return s

def letter():
    return ""   # text-based page, built in book.py

def decorate():
    s = '<rect class="br" x="360" y="640" width="80" height="80" rx="6"/>'
    s += '<path class="g" d="M400,90 L640,640 Q400,600 160,640 Z"/>'
    s += f'<polygon class="y" points="{star_pts(400, 95, 60, 26)}"/>'
    return s

PAGES = [("Snowman", snowman), ("Christmas Tree", tree), ("Gingerbread", gingerbread), ("Stocking", stocking), ("Presents", presents),
         ("Candy Canes", candy), ("Bauble", bauble), ("Santa", santa), ("Rudolph", reindeer), ("Snowflakes", snowflakes),
         ("Snowy House", house), ("Penguin", penguin), ("Jingle Bells", bells), ("Holly", holly_page), ("Star", star_page),
         ("Elf", elf), ("Mittens", mittens), ("Christmas Pudding", pudding), ("Robin", robin), ("Santa's Sleigh", sleigh)]
