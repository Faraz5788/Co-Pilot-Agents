"""Christmas Bingo & Quiz Party Pack: python3 party.py <out_dir>"""
import sys, os, random
from art import *
from layout import *
OUT = os.path.abspath(sys.argv[1]); os.makedirs(OUT, exist_ok=True)
pic = lambda fn: f'<svg viewBox="0 0 800 800">{G.format(fn())}</svg>'

def cover():
    cols = ["#D94335", "#3E9A57", "#F4C243", "#3D78C2"]; letters = "".join(f'<tspan fill="{cols[i % 4]}">{ch}</tspan>' for i, ch in enumerate("Christmas"))
    t = (f'<svg class="t" viewBox="0 0 1200 600"><text x="600" y="200" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="200" stroke="#111" stroke-width="14" paint-order="stroke" stroke-linejoin="round">{letters}</text>'
         f'<text x="600" y="390" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="130" fill="#fff" stroke="#111" stroke-width="12" paint-order="stroke">Party Games</text>'
         f'<text x="600" y="500" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="50" fill="#3E9A57">Bingo · Family Quiz · Charades · Would You Rather?</text></svg>')
    arts = "".join(pic(f) for f in (santa, presents, reindeer, gingerbread, tree, snowman))
    return f'<section class="pg c"><div class="frame cov">{t}<div class="grid3">{arts}</div><div class="instr" style="color:#B3261E">For all the family · Print at home</div></div><div class="foot">The Geek Next Door Co.</div></section>'

def howto():
    return page(title_svg("How to Play") + '''<div class="rules">
<h3>🎄 Picture Bingo (2+ players)</h3><p>Give everyone a bingo card and some counters (sweets work brilliantly!). Cut out the calling cards, fold them and pop them in a hat. The caller pulls one out and shouts its name. If it's on your card, cover it. First to cover a whole row, column or diagonal shouts "BINGO!" Play on for a full card.</p>
<h3>🎅 Family Quiz (teams)</h3><p>Split into teams and give each one an answer sheet. The quizmaster reads the questions from the host sheets: 5 rounds of 10 questions. One point per correct answer. Add up the scores on the score sheet. The highest score wins!</p>
<h3>🎬 Charades (teams)</h3><p>Cut out the cards. Take turns to pick one and act it out without speaking. Your team has one minute to guess. Films, songs and Christmas things to act!</p>
<h3>⭐ Would You Rather?</h3><p>Cut out the cards and take turns to read one aloud. Everyone chooses and says why. There are no wrong answers, just lots of giggles.</p></div>''')

# ------------- bingo -------------
ITEMS = PAGES  # 20 pictures
def bingo_cards(n=20, k=16, seed=2026):
    rnd = random.Random(seed); seen = set(); cards = []
    while len(cards) < n:
        c = tuple(sorted(rnd.sample(range(len(ITEMS)), k)))
        if c in seen: continue
        seen.add(c); lst = list(c); rnd.shuffle(lst); cards.append(lst)
    return cards
def card_html(idx, num):
    cells = "".join(f'<div class="bc">{pic(ITEMS[i][1])}<span>{ITEMS[i][0]}</span></div>' for i in idx)
    return f'<div class="card"><div class="ch"><b>CHRISTMAS BINGO</b><i>Card {num}</i></div><div class="bg4">{cells}</div></div>'
def bingo_pages():
    cards = bingo_cards(); out = []
    for p in range(0, len(cards), 2):
        out.append(f'<section class="pg c"><div class="frame two">{card_html(cards[p], p+1)}<div class="cut">✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>{card_html(cards[p+1], p+2)}</div><div class="foot">© The Geek Next Door Co. · For personal use only</div></section>')
    calls = "".join(f'<div class="cc">{pic(fn)}<span>{n}</span></div>' for n, fn in ITEMS)
    out.append(f'<section class="pg c"><div class="frame">{title_svg("Calling Cards", size=150)}{instr("Cut out, fold and put in a hat. Tick them off here as you call them!")}<div class="calls">{calls}</div></div><div class="foot">© The Geek Next Door Co. · For personal use only</div></section>')
    return out

# ------------- quiz -------------
ROUNDS = [
 ("Christmas Films", [("In Home Alone, what is the name of the boy who is left behind?", "Kevin (McCallister)"), ("In Elf, what is the name of Will Ferrell's character?", "Buddy"),
   ("Which green character tries to steal Christmas from Whoville?", "The Grinch"), ("What is the name of the snowman in Disney's Frozen?", "Olaf"),
   ("In The Polar Express, what is the first gift of Christmas the boy receives?", "A bell (from Santa's sleigh)"), ("Which Muppet plays Bob Cratchit in The Muppet Christmas Carol?", "Kermit the Frog"),
   ("In Love Actually, what is Hugh Grant's character's job?", "Prime Minister"), ("In It's a Wonderful Life, what is the name of the guardian angel?", "Clarence"),
   ("In Miracle on 34th Street, which department store does Kris Kringle work in?", "Macy's"), ("In the film The Snowman, where does the snowman fly the boy to?", "The North Pole (to meet Father Christmas)")]),
 ("Christmas Songs", [("Finish the lyric: \"I'm dreaming of a white…\"", "Christmas"), ("Who sang \"All I Want for Christmas Is You\" in 1994?", "Mariah Carey"),
   ("In \"The Twelve Days of Christmas\", what is given on the fifth day?", "Five gold rings"), ("Which duo had a hit with \"Last Christmas\" in 1984?", "Wham!"),
   ("The Pogues sang \"Fairytale of New York\" with which singer?", "Kirsty MacColl"), ("In \"Jingle Bells\", how many horses pull the open sleigh?", "One"),
   ("Which band sang \"Merry Xmas Everybody\"?", "Slade"), ("Which charity supergroup recorded \"Do They Know It's Christmas?\" in 1984?", "Band Aid"),
   ("In \"Frosty the Snowman\", what brought Frosty to life?", "An old silk hat"), ("What colour is Rudolph's nose?", "Red")]),
 ("Traditions & History", [("In which country did the tradition of decorating Christmas trees begin?", "Germany"), ("Which husband of Queen Victoria helped make Christmas trees popular in Britain?", "Prince Albert"),
   ("What plant do people traditionally kiss under?", "Mistletoe"), ("What is the day after Christmas Day called in the UK?", "Boxing Day"),
   ("Including Rudolph, how many reindeer pull Santa's sleigh?", "Nine"), ("Who wrote A Christmas Carol?", "Charles Dickens"),
   ("What is the name of Scrooge's dead business partner in A Christmas Carol?", "Jacob Marley"), ("In which modern-day country was St Nicholas born?", "Turkey"),
   ("What is the name of the four weeks leading up to Christmas?", "Advent"), ("In which decade was the first Christmas card sent in Britain?", "1840s (1843)")]),
 ("Food & Drink", [("What plant is traditionally put on top of a Christmas pudding?", "Holly"), ("What is poured over a Christmas pudding and set alight?", "Brandy"),
   ("Which small green vegetable is a famous part of a British Christmas dinner?", "Brussels sprouts"), ("What were mince pies originally filled with?", "Meat"),
   ("What warm drink is made with red wine and spices?", "Mulled wine"), ("What are little sausages wrapped in bacon called?", "Pigs in blankets"),
   ("Stollen is a Christmas cake from which country?", "Germany"), ("Panettone is a Christmas bread from which country?", "Italy"),
   ("What is the French name for a chocolate Christmas log?", "Bûche de Noël"), ("What is the main ingredient of eggnog, apart from milk or cream?", "Eggs")]),
 ("Kids' Round", [("What do children leave out for Santa's reindeer?", "Carrots"), ("Where does Santa live?", "The North Pole"), ("What are Santa's helpers called?", "Elves"),
   ("What do we often put on top of the Christmas tree?", "A star or an angel"), ("How many points does a snowflake usually have?", "Six"), ("What is the name of Santa's wife?", "Mrs Claus"),
   ("Which reindeer has a red nose?", "Rudolph"), ("What do you hang up on Christmas Eve for presents?", "A stocking"),
   ("What is the name of the Christmas play about the birth of Jesus?", "The Nativity"), ("What do you pull at Christmas dinner that goes BANG?", "A Christmas cracker")])]
def quiz_pages():
    out = []
    for r, (name, qs) in enumerate(ROUNDS, 1):
        body = f'<div class="round"><h3>Round {r}: {name}</h3><ol>' + "".join(f'<li>{q}<span class="a">{a}</span></li>' for q, a in qs) + "</ol></div>"
        out.append(page(title_svg("Quiz: Host Sheet", size=130) + instr("For the quizmaster only. Answers are in red!") + body))
    sheet = "".join(f'<div class="ar"><h4>Round {i+1}: {n}</h4>' + "".join(f'<div class="al">{j}.</div>' for j in range(1, 11)) + f'<div class="sc">Score: ___ / 10</div></div>' for i, (n, _) in enumerate(ROUNDS))
    out.append(page(title_svg("Answer Sheet", size=150) + '<div class="team">Team name: ______________________________</div>' + f'<div class="asheet">{sheet}</div>'))
    rows = "".join(f'<tr><td class="tn"></td>' + "<td></td>" * 6 + "</tr>" for _ in range(8))
    out.append(page(title_svg("Score Sheet", size=150) + f'<table class="score"><tr><th>Team</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th>R5</th><th>Total</th></tr>{rows}</table>'
                    + f'<svg class="trophy" viewBox="0 0 800 800">{G.format(star_page())}</svg><div class="instr">And the winner is… ______________________</div>'))
    return out

CHARADES = [("Film", "Home Alone"), ("Film", "Elf"), ("Film", "Frozen"), ("Film", "The Grinch"), ("Film", "The Snowman"), ("Film", "The Polar Express"), ("Film", "Paddington"), ("Film", "The Muppet Christmas Carol"),
            ("Song", "Jingle Bells"), ("Song", "Rudolph the Red-Nosed Reindeer"), ("Song", "Let It Snow"), ("Song", "Frosty the Snowman"), ("Song", "Deck the Halls"), ("Song", "We Wish You a Merry Christmas"), ("Song", "Silent Night"), ("Song", "Last Christmas"),
            ("Action", "Wrapping a present"), ("Action", "Building a snowman"), ("Action", "Decorating the tree"), ("Action", "Pulling a cracker"), ("Action", "Ice skating"), ("Action", "Santa stuck in a chimney"), ("Action", "Eating too much Christmas dinner"), ("Action", "Having a snowball fight")]
WYR = ["…be a reindeer or an elf?", "…have a snowball fight or build a snowman?", "…eat only sprouts or only Christmas pudding for dinner?", "…open one present on Christmas Eve or wait for all of them on Christmas Day?",
       "…ride in Santa's sleigh or work in his toy workshop?", "…have a real tree or a tree made of sweets?", "…have Christmas every month or a birthday every month?", "…wear a Christmas jumper all year or a Santa hat all year?",
       "…live in a gingerbread house or an igloo?", "…sing carols in the snow or watch a Christmas film by the fire?", "…have a pet penguin or a pet reindeer?", "…find a pony or a puppy under the tree?"]
def cards_pages():
    out = []
    for p in range(0, 24, 12):
        cells = "".join(f'<div class="cd"><em class="{t.lower()}">{t}</em><b>{w}</b></div>' for t, w in CHARADES[p:p + 12])
        out.append(page(title_svg("Charades", size=170) + instr("Cut out the cards. Act it out with no talking!") + f'<div class="cards">{cells}</div>'))
    cells = "".join(f'<div class="cd wyr"><em>Would you rather…</em><b>{w[1:]}</b></div>' for w in WYR)
    out.append(page(title_svg("Would You Rather?", size=130) + instr("Cut out the cards and take turns to ask them.") + f'<div class="cards">{cells}</div>'))
    return out

pages = [cover(), howto()] + bingo_pages() + quiz_pages() + cards_pages()
pages.append(page('<div class="thx"><h1>Merry Christmas!</h1><p>Have a wonderful time playing. 🎄</p><p>If your family enjoyed these games, a review on Etsy would mean the world to a small shop.</p>'
                  '<p class="sm">Print on plain A4 or Letter paper and choose "Fit to page". Print as many bingo cards and answer sheets as you need. © The Geek Next Door Co. For personal use only. Please don\'t share or resell.</p></div>'))
EXTRA = """.cov{background:#FBF7EF;border-color:#B3261E} .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm;width:92%} .grid3 svg{width:100%}
.rules{width:94%;font-size:14.5pt;line-height:1.5} .rules h3{font-family:Fredoka;font-size:20pt;margin:7mm 0 2mm;color:#B3261E} .rules p{margin:0}
.frame.two{justify-content:space-between;padding:4mm 6mm} .card{width:100%;flex:1;display:flex;flex-direction:column;min-height:0}
.ch{display:flex;justify-content:space-between;align-items:baseline;font-family:Fredoka;padding:0 2mm} .ch b{font-size:22pt;color:#B3261E;letter-spacing:1px} .ch i{font-style:normal;font-size:12pt;color:#666}
.bg4{display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);border:1mm solid #111;border-radius:4mm;overflow:hidden;flex:1;min-height:0}
.bc{border:0.4mm solid #111;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1mm;min-height:0} .bc svg{width:78%;flex:1;min-height:0} .bc span{font-family:Fredoka;font-size:8.5pt;font-weight:600;white-space:nowrap}
.cut{font-size:10pt;color:#999;letter-spacing:1px}
.calls{display:grid;grid-template-columns:repeat(4,1fr);gap:0;width:100%;flex:1;border:0.6mm dashed #999} .cc{border:0.6mm dashed #999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1mm} .cc svg{width:70%} .cc span{font-family:Fredoka;font-weight:600;font-size:11pt}
.round{width:96%} .round h3{font-family:Fredoka;font-size:22pt;color:#3E9A57;margin:3mm 0 4mm} .round ol{margin:0;padding-left:8mm;font-size:14pt;line-height:1.35} .round li{margin-bottom:4.5mm} .a{display:block;color:#D94335;font-weight:600}
.team{font-family:Fredoka;font-size:16pt;width:94%} .asheet{display:grid;grid-template-columns:1fr 1fr;gap:3mm 8mm;width:94%;flex:1}
.ar h4{font-family:Fredoka;font-size:13pt;margin:0 0 1mm;color:#3E9A57} .al{border-bottom:0.4mm solid #aaa;height:6.6mm;font-size:10pt;padding-top:1.5mm} .sc{font-family:Fredoka;font-size:11pt;text-align:right;margin-top:1mm}
table.score{width:94%;border-collapse:collapse;font-family:Fredoka;font-size:15pt} .score th,.score td{border:0.6mm solid #111;height:14mm;text-align:center} .score th{background:#f3efe6} .score td.tn{width:38%}
svg.trophy{width:40%;flex:1;min-height:0}
.cards{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);width:100%;flex:1;border:0.6mm dashed #999}
.cd{border:0.6mm dashed #999;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3mm;gap:2mm} .cd b{font-family:Fredoka;font-size:15pt;font-weight:600;line-height:1.2}
.cd em{font-style:normal;font-family:Fredoka;font-size:10pt;color:#fff;background:#3D78C2;border-radius:99px;padding:1mm 4mm} .cd em.song{background:#3E9A57} .cd em.action{background:#D94335} .cd.wyr em{background:#B3261E} .cd.wyr b{font-size:13.5pt}
.thx{text-align:center;font-family:Fredoka;margin:auto;width:80%} .thx h1{font-size:44pt;color:#B3261E;margin:0 0 6mm} .thx p{font-size:16pt} .thx p.sm{font-family:Inter;font-size:10pt;color:#666}"""
print(len(pages), build(pages, f"{OUT}/Christmas-Party-Games", EXTRA))
