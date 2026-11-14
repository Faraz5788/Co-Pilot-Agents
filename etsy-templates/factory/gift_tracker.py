import sys, datetime as dt
from openpyxl import Workbook
import common
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
XR, XG, XGOLD = "B3261E", "1E5631", "C9A227"          # festive palette
common.PALETTE = [XR, XG, XGOLD, XR]
Y = 2026
wb = Workbook()
start_here(wb, "Christmas Gift Tracker", [
    "1.  People — list everyone you're buying for and set a budget for each person.",
    "2.  Gift List — one row per gift: who it's for, the idea, where to buy it, and the real cost once you've bought it.",
    "3.  Move each gift from Idea → Ordered → Bought → Wrapped → Given. Each person's spend and status updates automatically.",
    "4.  Stocking Fillers and Card List — little extras and every card, ticked off as you go.",
    "5.  Dashboard — countdown to Christmas, total budget vs spent, and how many gifts are bought and wrapped.",
])
for ws in [wb["Start Here"]]: ws["B2"].font = font(size=20, bold=True, color=XR)

pp = wb.create_sheet("People"); base(pp, "People & Budgets", "Who you're buying for and how much for each.", [22, 14, 12, 12, 12, 9, 12], accent=XR)
header(pp, 5, 2, ["Person", "Group", "Budget", "Spent", "Left", "Gifts", "All bought?"], XR)
people = [("Mum", "Family", 60), ("Dad", "Family", 50), ("Sophie", "Family", 40), ("Lily (niece)", "Kids", 30), ("Jack (nephew)", "Kids", 30),
          ("Grandma", "Family", 25), ("Emma", "Friends", 20), ("Secret Santa", "Work", 10)]
G = "'Gift List'"
for i in range(30):
    r = 6 + i; v = people[i] if i < len(people) else (None,) * 3
    cell(pp, r, 2, v[0], inp=True); cell(pp, r, 3, v[1], inp=True, align="center"); cell(pp, r, 4, v[2], CUR, inp=True)
    cell(pp, r, 5, f'=IF(B{r}="","",SUMIFS({G}!$F$6:$F$305,{G}!$B$6:$B$305,B{r}))', CUR)
    cell(pp, r, 6, f'=IF(B{r}="","",D{r}-E{r})', CUR, bold=True)
    cell(pp, r, 7, f'=IF(B{r}="","",COUNTIF({G}!$B$6:$B$305,B{r}))', "0", align="center")
    cell(pp, r, 8, f'=IF(OR(B{r}="",G{r}=0),"",IF(COUNTIFS({G}!$B$6:$B$305,B{r},{G}!$G$6:$G$305,"Idea")+COUNTIFS({G}!$B$6:$B$305,B{r},{G}!$G$6:$G$305,"Ordered")=0,"Yes ✓","Not yet"))', align="center")
dropdown(pp, "C6:C35", ["Family", "Friends", "Kids", "Work", "Other"]); red_if_negative(pp, "F6:F35")
pp.conditional_formatting.add("H6:H35", CellIsRule(operator="equal", formula=['"Yes ✓"'], fill=fill("DCEBDF")))
cell(pp, 36, 2, "Total", bold=True)
for c, L in [(4, "D"), (5, "E"), (6, "F"), (7, "G")]: cell(pp, 36, c, f"=SUM({L}6:{L}35)", CUR if c < 7 else "0", bold=True)

g = wb.create_sheet("Gift List"); base(g, "Gift List", "One row per gift. Status: Idea → Ordered → Bought → Wrapped → Given.", [20, 28, 22, 11, 11, 11, 22], accent=XR)
header(g, 5, 2, ["For", "Gift", "Where to buy / link", "Est. cost", "Actual cost", "Status", "Notes"], XG)
gifts = [("Mum", "Cashmere scarf", "John Lewis", 40, 36, "Wrapped"), ("Mum", "Candle set", "Boots", 15, 15, "Bought"),
         ("Dad", "Coffee subscription", "Online", 30, 30, "Ordered"), ("Dad", "Book", "Waterstones", 15, None, "Idea"),
         ("Lily (niece)", "LEGO Friends set", "Argos", 25, 24, "Bought"), ("Jack (nephew)", "Football boots", "JD Sports", 30, None, "Idea"),
         ("Sophie", "Perfume", "Boots", 40, 38, "Given"), ("Secret Santa", "Desk plant", "Garden centre", 10, 8.5, "Wrapped")]
for i in range(300):
    r = 6 + i; v = gifts[i] if i < len(gifts) else (None,) * 6
    cell(g, r, 2, v[0], inp=True); cell(g, r, 3, v[1], inp=True); cell(g, r, 4, v[2], inp=True)
    cell(g, r, 5, v[3], CUR, inp=True); cell(g, r, 6, v[4], CUR, inp=True); cell(g, r, 7, v[5], inp=True, align="center"); cell(g, r, 8, None, inp=True)
dropdown(g, "B6:B305", formula="=People!$B$6:$B$35"); dropdown(g, "G6:G305", ["Idea", "Ordered", "Bought", "Wrapped", "Given"])
for st_, col in [("Idea", "EFEBE3"), ("Ordered", "FBEFC9"), ("Bought", "DCEBDF"), ("Wrapped", "B9D7C1"), ("Given", "8FBF9E")]:
    g.conditional_formatting.add("G6:G305", CellIsRule(operator="equal", formula=[f'"{st_}"'], fill=fill(col)))
g.freeze_panes = "C6"

sf = wb.create_sheet("Stocking Fillers"); base(sf, "Stocking Fillers", "The little extras that add up!", [18, 28, 11, 8], accent=XR)
header(sf, 5, 2, ["Stocking", "Item", "Cost", "Got it"], XGOLD)
fill_ex = [("Lily", "Chocolate coins", 2), ("Lily", "Hair clips", 3), ("Jack", "Yo-yo", 4), ("Jack", "Satsuma", 0.3)]
for i in range(60):
    r = 6 + i; v = fill_ex[i] if i < len(fill_ex) else (None,) * 3
    cell(sf, r, 2, v[0], inp=True); cell(sf, r, 3, v[1], inp=True); cell(sf, r, 4, v[2], CUR, inp=True); cell(sf, r, 5, TICK if i < 2 else None, inp=True, align="center")
dropdown(sf, "E6:E65", [TICK]); strike_done(sf, "B6:E65", "E", 6)
cell(sf, 4, 3, "Total", bold=True); cell(sf, 4, 4, "=SUM(D6:D65)", CUR, bold=True)

cl = wb.create_sheet("Card List"); base(cl, "Christmas Card List", "Tick Sent when it's posted, Received when theirs arrives.", [24, 40, 10, 10, 20], accent=XR)
header(cl, 5, 2, ["Name", "Address", "Sent", "Received", "Notes"], XG)
cards = [("Auntie Jean & Bob", "12 Holly Lane, York, YO1 2AB", TICK, None), ("The Patels", "4 Elm Road, Leeds, LS6 1AA", None, TICK)]
for i in range(150):
    r = 6 + i; v = cards[i] if i < len(cards) else (None,) * 4
    cell(cl, r, 2, v[0], inp=True); cell(cl, r, 3, v[1], inp=True); cell(cl, r, 4, v[2], inp=True, align="center"); cell(cl, r, 5, v[3], inp=True, align="center"); cell(cl, r, 6, None, inp=True)
dropdown(cl, "D6:E155", [TICK]); strike_done(cl, "B6:F155", "D", 6)

d = wb.create_sheet("Dashboard"); base(d, "", "Your Christmas gifts at a glance.", [30, 18, 4, 26, 12], accent=XR)
d["B2"] = '="Christmas "&C5'
cell(d, 5, 2, "Year", bold=True); cell(d, 5, 3, Y, "0", inp=True, align="center")
cell(d, 6, 2, "Days until Christmas", bold=True); cell(d, 6, 3, "=MAX(0,DATE(C5,12,25)-TODAY())", "0", bold=True, align="center", color=XR, size=20)
d.row_dimensions[6].height = 32
header(d, 8, 2, ["Money", ""], XR)
rows = [("Total gift budget", "=People!D36", CUR), ("Spent on gifts", "=People!E36", CUR), ("Stocking fillers", "='Stocking Fillers'!D4", CUR),
        ("Total spent", "=C10+C11", CUR), ("Left in budget", "=C9-C12", CUR), ("% of budget used", "=IF(C9=0,0,C12/C9)", "0%")]
for i, (l, fm, fmt) in enumerate(rows):
    cell(d, 9 + i, 2, l, bold=i == 4); cell(d, 9 + i, 3, fm, fmt, bold=True, align="right")
red_if_negative(d, "C13"); bar(d, "C14", XR)
header(d, 5, 5, ["Gifts", ""], XG)
GS = f"{G}!$G$6:$G$305"
prog = [("Gifts on the list", f"=COUNTA({G}!B6:B305)", "0"), ("Still ideas", f'=COUNTIF({GS},"Idea")', "0"), ("Ordered", f'=COUNTIF({GS},"Ordered")', "0"),
        ("Bought", f'=COUNTIF({GS},"Bought")+COUNTIF({GS},"Wrapped")+COUNTIF({GS},"Given")', "0"), ("Wrapped", f'=COUNTIF({GS},"Wrapped")+COUNTIF({GS},"Given")', "0"),
        ("% bought", "=IF(F6=0,0,F9/F6)", "0%"), ("% wrapped", "=IF(F6=0,0,F10/F6)", "0%"),
        ("People all sorted", '=COUNTIF(People!H6:H35,"Yes ✓")&" of "&COUNTA(People!B6:B35)', None),
        ("Cards sent", f'=COUNTIF(\'Card List\'!D6:D155,"{TICK}")&" of "&COUNTA(\'Card List\'!B6:B155)', None)]
for i, (l, fm, fmt) in enumerate(prog):
    cell(d, 6 + i, 5, l); cell(d, 6 + i, 6, fm, fmt, bold=True, align="right")
bar(d, "F11:F12", XG)

finish(wb, ["Start Here", "Dashboard", "People", "Gift List", "Stocking Fillers", "Card List"],
       {"Dashboard": XR, "People": XG, "Gift List": XR, "Stocking Fillers": XGOLD, "Card List": XG}, OUT,
       shots={"Dashboard": "A1:G15", "People": "A1:I15", "Gift List": "A1:I15", "Stocking Fillers": "A1:F12", "Card List": "A1:G10"}, shots_out=SHOTS)
