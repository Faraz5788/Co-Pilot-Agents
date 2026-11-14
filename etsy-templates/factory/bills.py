import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import PieChart, Reference
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
Y = 2027
wb = Workbook()
start_here(wb, "Bill & Subscription Tracker", [
    "1.  Bills — list every regular bill: amount, how often it's paid, the first due date and how you pay it.",
    "2.  The next due date, days until due, monthly cost and yearly cost all work themselves out — weekly, monthly, quarterly or yearly.",
    "3.  Subscriptions — list Netflix, Spotify, gym, apps… and mark each one Keep, Review or Cancel to see how much you could save.",
    "4.  Paid Checklist — tick each bill off month by month so nothing slips through.",
    "5.  Dashboard — what goes out each month, what's due in the next 30 days, and where the money goes.",
])
FREQ = ["Weekly", "Monthly", "Quarterly", "Yearly"]
CATS = ["Housing", "Council tax", "Energy", "Water", "Phone & broadband", "Insurance", "TV licence", "Loans & credit", "Childcare", "Transport", "Other"]
STEP = 'IF({f}="Monthly",1,IF({f}="Quarterly",3,12))'
def next_due(r, f, d):   # next due date on or after today for a repeating bill
    st = STEP.format(f=f"{f}{r}")
    k = f"CEILING(MAX(0,(YEAR(TODAY())-YEAR({d}{r}))*12+MONTH(TODAY())-MONTH({d}{r}))/{st},1)*{st}"
    return (f'=IF(OR({d}{r}="",{f}{r}=""),"",IF({d}{r}>=TODAY(),{d}{r},IF({f}{r}="Weekly",{d}{r}+7*CEILING((TODAY()-{d}{r})/7,1),'
            f'IF(EDATE({d}{r},{k})>=TODAY(),EDATE({d}{r},{k}),EDATE({d}{r},{k}+{st})))))')
MONTHLY = '=IF(OR({a}{r}="",{f}{r}=""),"",{a}{r}*IF({f}{r}="Weekly",52/12,IF({f}{r}="Monthly",1,IF({f}{r}="Quarterly",1/3,1/12))))'

b = wb.create_sheet("Bills"); base(b, "Bills", "Every regular bill. Grey columns calculate themselves.", [24, 18, 11, 11, 13, 16, 13, 9, 12, 12])
header(b, 5, 2, ["Bill", "Category", "Amount", "How often", "First due", "Paid by", "Next due", "Days", "Per month", "Per year"], BLUE)
t = dt.date.today()
ex = [("Rent", "Housing", 950, "Monthly", dt.date(2026, 12, 1), "Standing order"), ("Council tax", "Council tax", 168, "Monthly", dt.date(2026, 4, 1), "Direct debit"),
      ("Octopus Energy", "Energy", 132, "Monthly", dt.date(2026, 11, 18), "Direct debit"), ("Water", "Water", 41, "Monthly", dt.date(2026, 11, 25), "Direct debit"),
      ("Broadband", "Phone & broadband", 32, "Monthly", dt.date(2026, 11, 10), "Card"), ("Mobile", "Phone & broadband", 18, "Monthly", dt.date(2026, 11, 22), "Direct debit"),
      ("Car insurance", "Insurance", 540, "Yearly", dt.date(2026, 3, 14), "Card"), ("TV licence", "TV licence", 174.5, "Yearly", dt.date(2026, 6, 1), "Card"),
      ("Boiler cover", "Insurance", 45, "Quarterly", dt.date(2026, 1, 20), "Direct debit")]
for i in range(30):
    r = 6 + i; v = ex[i] if i < len(ex) else (None,) * 6
    cell(b, r, 2, v[0], inp=True); cell(b, r, 3, v[1], inp=True); cell(b, r, 4, v[2], CUR, inp=True); cell(b, r, 5, v[3], inp=True, align="center")
    cell(b, r, 6, v[4], "dd mmm yyyy", inp=True, align="center"); cell(b, r, 7, v[5], inp=True)
    cell(b, r, 8, next_due(r, "E", "F"), "ddd dd mmm", bold=True, align="center")
    cell(b, r, 9, f'=IF(H{r}="","",H{r}-TODAY())', "0", align="center")
    cell(b, r, 10, MONTHLY.format(a="D", f="E", r=r), CUR); cell(b, r, 11, f'=IF(J{r}="","",J{r}*12)', CUR)
dropdown(b, "C6:C35", CATS); dropdown(b, "E6:E35", FREQ); dropdown(b, "G6:G35", ["Direct debit", "Standing order", "Card", "Cash", "Bank transfer"])
b.conditional_formatting.add("I6:I35", FormulaRule(formula=['AND(I6<>"",I6<=3)'], fill=fill(PALE_R), font=Font(name=F, bold=True, color=RED)))
b.conditional_formatting.add("I6:I35", FormulaRule(formula=['AND(I6<>"",I6<=7)'], fill=fill("FBEFC9")))
cell(b, 36, 2, "Total", bold=True); cell(b, 36, 10, "=SUM(J6:J35)", CUR, bold=True); cell(b, 36, 11, "=SUM(K6:K35)", CUR, bold=True)
note(b, 37, 2, "First due = any date this bill was due (e.g. the last one you paid). Red = due within 3 days, yellow = within a week.")
b.freeze_panes = "C6"

s = wb.create_sheet("Subscriptions"); base(s, "Subscriptions", "Keep, review or cancel — see what you could save.", [22, 11, 11, 13, 13, 11, 12, 12])
header(s, 5, 2, ["Subscription", "Cost", "How often", "Renews / next", "Free trial ends", "Decision", "Per month", "Per year"], RED)
exs = [("Netflix", 10.99, "Monthly", dt.date(2026, 11, 28), None, "Keep"), ("Spotify", 11.99, "Monthly", dt.date(2026, 11, 20), None, "Keep"),
       ("Disney+", 8.99, "Monthly", dt.date(2026, 12, 3), None, "Review"), ("Gym", 34.99, "Monthly", dt.date(2026, 12, 1), None, "Cancel"),
       ("Amazon Prime", 95, "Yearly", dt.date(2027, 2, 14), None, "Keep"), ("iCloud 200GB", 2.99, "Monthly", dt.date(2026, 11, 26), None, "Keep"),
       ("Audible", 7.99, "Monthly", None, dt.date(2026, 11, 30), "Cancel")]
for i in range(25):
    r = 6 + i; v = exs[i] if i < len(exs) else (None,) * 6
    cell(s, r, 2, v[0], inp=True); cell(s, r, 3, v[1], CUR, inp=True); cell(s, r, 4, v[2], inp=True, align="center")
    cell(s, r, 5, v[3], "dd mmm yyyy", inp=True, align="center"); cell(s, r, 6, v[4], "dd mmm yyyy", inp=True, align="center"); cell(s, r, 7, v[5], inp=True, align="center")
    cell(s, r, 8, MONTHLY.format(a="C", f="D", r=r), CUR); cell(s, r, 9, f'=IF(H{r}="","",H{r}*12)', CUR)
dropdown(s, "D6:D30", FREQ); dropdown(s, "G6:G30", ["Keep", "Review", "Cancel"])
for st_, col in [("Keep", PALE_G), ("Review", "FBEFC9"), ("Cancel", PALE_R)]:
    s.conditional_formatting.add("G6:G30", CellIsRule(operator="equal", formula=[f'"{st_}"'], fill=fill(col)))
s.conditional_formatting.add("F6:F30", FormulaRule(formula=['AND(F6<>"",F6-TODAY()<=7)'], fill=fill(PALE_R), font=Font(name=F, bold=True, color=RED)))
cell(s, 31, 2, "Total", bold=True); cell(s, 31, 8, "=SUM(H6:H30)", CUR, bold=True); cell(s, 31, 9, "=SUM(I6:I30)", CUR, bold=True)
cell(s, 33, 2, "You could save per year", bold=True); cell(s, 33, 3, '=SUMIFS(I6:I30,G6:G30,"Cancel")', CUR, bold=True, color=GRN, size=13)
cell(s, 34, 2, "…and up to (incl. Review)", bold=True); cell(s, 34, 3, '=SUMIFS(I6:I30,G6:G30,"Cancel")+SUMIFS(I6:I30,G6:G30,"Review")', CUR, bold=True)
note(s, 35, 2, "Red free-trial date = it ends within a week — cancel before you're charged!")

c = wb.create_sheet("Paid Checklist"); base(c, "Paid Checklist", f"Tick each bill when it's paid.", [24] + [6] * 12)
cell(c, 4, 2, "Year", bold=True); cell(c, 4, 3, Y, "0", inp=True, align="center")
M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
header(c, 5, 2, ["Bill"] + M, GRN)
for i in range(30):
    r = 6 + i; cell(c, r, 2, f'=IF(Bills!B{6+i}="","",Bills!B{6+i})')
    for k in range(12): cell(c, r, 3 + k, TICK if (i < 6 and k == 0) else None, inp=True, align="center")
dropdown(c, "C6:N35", [TICK])
c.conditional_formatting.add("C6:N35", FormulaRule(formula=['C6<>""'], fill=fill(GRN), font=Font(name=F, color="FFFFFF", bold=True)))
cell(c, 36, 2, "Paid", bold=True)
for k in range(12):
    L = chr(67 + k); cell(c, 36, 3 + k, f'=COUNTA({L}6:{L}35)&"/"&COUNTIF($B$6:$B$35,"?*")', align="center", size=8)
c.freeze_panes = "C6"

d = wb.create_sheet("Dashboard"); base(d, "Bills at a Glance", "Updates as you add bills and subscriptions.", [30, 16, 4, 22, 14])
header(d, 5, 2, ["Money going out", ""], INK)
rows = [("Bills per month", "=Bills!J36", CUR), ("Subscriptions per month", "=Subscriptions!H31", CUR), ("Total per month", "=C6+C7", CUR),
        ("Total per year", "=C8*12", CUR), ("Due in the next 7 days", '=SUMPRODUCT((Bills!I6:I35<>"")*(Bills!I6:I35>=0)*(Bills!I6:I35<=7),Bills!D6:D35)', CUR),
        ("Due in the next 30 days", '=SUMPRODUCT((Bills!I6:I35<>"")*(Bills!I6:I35>=0)*(Bills!I6:I35<=30),Bills!D6:D35)', CUR),
        ("Bills due in 30 days", '=SUMPRODUCT((Bills!I6:I35<>"")*(Bills!I6:I35>=0)*(Bills!I6:I35<=30))', "0"),
        ("Subscriptions you could cancel", "=Subscriptions!C33", CUR)]
for i, (l, fm, fmt) in enumerate(rows):
    cell(d, 6 + i, 2, l, bold=i == 2); cell(d, 6 + i, 3, fm, fmt, bold=True, align="right")
d["C8"].font = font(bold=True, size=15, color=RED); d.row_dimensions[8].height = 26; d["C13"].font = font(bold=True, color=GRN)
header(d, 5, 5, ["Category", "Per month"], BLUE)
for i, cat in enumerate(CATS):
    r = 6 + i; cell(d, r, 5, cat); cell(d, r, 6, f'=SUMIFS(Bills!$J$6:$J$35,Bills!$C$6:$C$35,E{r})', CUR)
cell(d, 17, 5, "Subscriptions"); cell(d, 17, 6, "=Subscriptions!H31", CUR)
pc = PieChart(); pc.title = "Where your money goes each month"; pc.height = 9; pc.width = 14
pc.add_data(Reference(d, min_col=6, min_row=6, max_row=17)); pc.set_categories(Reference(d, min_col=5, min_row=6, max_row=17))
d.add_chart(pc, "B19")

finish(wb, ["Start Here", "Dashboard", "Bills", "Subscriptions", "Paid Checklist"],
       {"Dashboard": BLUE, "Bills": GRN, "Subscriptions": RED, "Paid Checklist": YEL}, OUT,
       shots={"Dashboard": "A1:G38", "Bills": "A1:L18", "Subscriptions": "A1:J35", "Paid Checklist": "A1:O18"}, shots_out=SHOTS)
