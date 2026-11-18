import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
Y = 2027
wb = Workbook()
start_here(wb, "Savings Tracker & Challenges", [
    "1.  Sinking Funds — list what you're saving for (holiday, Christmas, car repairs…), the target and the date you need it by.",
    "2.  Savings Log — every time you put money in (or take it out), add a row and pick the fund. Progress updates automatically.",
    "3.  Each fund shows how much is left and how much to save each month to hit your target on time.",
    "4.  1p Challenge and 52 Week Challenge — tick off each day or week as you save. Running totals and progress bars do the rest.",
    "5.  Dashboard — everything you've saved, every fund's progress and both challenges on one page.",
], extra_notes=("Use a minus amount in the Savings Log when you take money out of a fund.",))

# Funds
f = wb.create_sheet("Sinking Funds"); base(f, "Sinking Funds", "What you're saving for, and how you're doing.", [24, 12, 13, 12, 12, 10, 13, 12])
header(f, 5, 2, ["Saving for", "Target", "Need it by", "Saved", "Left to save", "Months left", "Save per month", "Progress"], GRN)
ex = [("Emergency fund", 3000, dt.date(Y, 12, 31)), ("Summer holiday", 1200, dt.date(Y, 7, 1)), ("Christmas 2027", 600, dt.date(Y, 11, 30)),
      ("Car service & MOT", 350, dt.date(Y, 5, 1)), ("New laptop", 800, dt.date(Y, 9, 1))]
for i in range(15):
    r = 6 + i; v = ex[i] if i < len(ex) else (None,) * 3
    cell(f, r, 2, v[0], inp=True); cell(f, r, 3, v[1], CUR, inp=True); cell(f, r, 4, v[2], "dd mmm yyyy", inp=True, align="center")
    cell(f, r, 5, f"=IF(B{r}=\"\",\"\",SUMIFS('Savings Log'!$E$6:$E$1005,'Savings Log'!$C$6:$C$1005,B{r}))", CUR)
    cell(f, r, 6, f'=IF(B{r}="","",MAX(0,C{r}-E{r}))', CUR)
    cell(f, r, 7, f'=IF(OR(B{r}="",D{r}=""),"",MAX(0,(YEAR(D{r})-YEAR(TODAY()))*12+MONTH(D{r})-MONTH(TODAY())))', "0", align="center")
    cell(f, r, 8, f'=IF(G{r}="","",IF(F{r}=0,0,F{r}/MAX(1,G{r})))', CUR, bold=True)
    cell(f, r, 9, f'=IF(OR(B{r}="",N(C{r})=0),"",MIN(1,E{r}/C{r}))', "0%", bold=True)
bar(f, "I6:I20", GRN)
f.conditional_formatting.add("B6:I20", FormulaRule(formula=['AND($I6<>"",$I6>=1)'], fill=fill(PALE_G)))
cell(f, 21, 2, "Total", bold=True)
for c, col in [(3, "C"), (5, "E"), (6, "F"), (8, "H")]: cell(f, 21, c, f"=SUM({col}6:{col}20)", CUR, bold=True)
note(f, 22, 2, "Save per month = what's left ÷ months left. Funds turn green when you hit the target.")

lg = wb.create_sheet("Savings Log"); base(lg, "Savings Log", "Money in (or out) of each fund.", [14, 24, 28, 12])
header(lg, 5, 2, ["Date", "Fund", "Note", "Amount"], BLUE)
exl = [(dt.date(Y, 1, 2), "Emergency fund", "Starting pot", 500), (dt.date(Y, 1, 28), "Summer holiday", "Payday", 150),
       (dt.date(Y, 1, 28), "Christmas 2027", "Payday", 50), (dt.date(Y, 2, 3), "Car service & MOT", "", 60), (dt.date(Y, 2, 14), "Emergency fund", "Vet bill", -80)]
for r in range(6, 1006):
    v = exl[r - 6] if r - 6 < len(exl) else (None,) * 4
    cell(lg, r, 2, v[0], "dd mmm yyyy", inp=True); cell(lg, r, 3, v[1], inp=True); cell(lg, r, 4, v[2] or None, inp=True); cell(lg, r, 5, v[3], CUR, inp=True)
dropdown(lg, "C6:C1005", formula="='Sinking Funds'!$B$6:$B$20"); red_if_negative(lg, "E6:E1005"); lg.freeze_panes = "B6"

# 1p challenge
p = wb.create_sheet("1p Challenge"); base(p, "1p a Day Challenge", "Save 1p on day 1, 2p on day 2 … £3.65 on day 365. Total: £667.95.", [8, 14, 10, 8])
cell(p, 5, 2, "Start date", bold=True); cell(p, 5, 3, dt.date(Y, 1, 1), "dd mmm yyyy", inp=True, align="center")
cell(p, 6, 2, "Saved so far", bold=True); cell(p, 6, 3, '=SUMIFS(D10:D374,E10:E374,"✓")', CUR, bold=True)
cell(p, 7, 2, "Progress", bold=True); cell(p, 7, 3, "=C6/667.95", "0%", bold=True); bar(p, "C7", YEL)
header(p, 9, 2, ["Day", "Date", "Save", "Done"], YEL)
for dd in range(1, 366):
    r = 9 + dd
    cell(p, r, 2, dd, "0", align="center"); cell(p, r, 3, f"=$C$5+{dd-1}", "ddd dd mmm", align="center")
    cell(p, r, 4, dd / 100, CUR); cell(p, r, 5, TICK if dd <= 9 else None, inp=True, align="center")
dropdown(p, "E10:E374", [TICK]); strike_done(p, "B10:E374", "E", 10); p.freeze_panes = "B10"
note(p, 8, 2, "Tip: you can tick days in any order — tick the big ones when you're flush!")

# 52 week
w = wb.create_sheet("52 Week Challenge"); base(w, "52 Week Challenge", "Save £1 in week 1, £2 in week 2 … £52 in week 52. Change the amount to scale it.", [8, 14, 10, 8, 12])
cell(w, 5, 2, "Start date", bold=True); cell(w, 5, 3, dt.date(Y, 1, 4), "dd mmm yyyy", inp=True, align="center")
cell(w, 6, 2, "£ per week step", bold=True); cell(w, 6, 3, 1, CUR, inp=True, align="center")
cell(w, 7, 2, "Saved so far", bold=True); cell(w, 7, 3, '=SUMIFS(D11:D62,E11:E62,"✓")', CUR, bold=True)
cell(w, 8, 2, "Progress", bold=True); cell(w, 8, 3, "=IF(SUM(D11:D62)=0,0,C7/SUM(D11:D62))", "0%", bold=True); bar(w, "C8", YEL)
header(w, 10, 2, ["Week", "Week of", "Save", "Done", "Total target"], YEL)
for k in range(1, 53):
    r = 10 + k
    cell(w, r, 2, k, "0", align="center"); cell(w, r, 3, f"=$C$5+{7*(k-1)}", "dd mmm", align="center")
    cell(w, r, 4, f"={k}*$C$6", CUR); cell(w, r, 5, TICK if k <= 3 else None, inp=True, align="center"); cell(w, r, 6, f"=SUM($D$11:D{r})", CUR)
dropdown(w, "E11:E62", [TICK]); strike_done(w, "B11:F62", "E", 11); w.freeze_panes = "B11"

d = wb.create_sheet("Dashboard"); base(d, "My Savings", "Everything you're saving, at a glance.", [34, 16, 4, 26, 14])
header(d, 5, 2, ["Overview", ""], INK)
rows = [("Saved in sinking funds", "='Sinking Funds'!E21", CUR), ("Total targets", "='Sinking Funds'!C21", CUR),
        ("Left to save", "='Sinking Funds'!F21", CUR), ("Save each month to stay on track", "='Sinking Funds'!H21", CUR),
        ("1p challenge saved", "='1p Challenge'!C6", CUR), ("52 week challenge saved", "='52 Week Challenge'!C7", CUR),
        ("Grand total saved", "=C6+C10+C11", CUR)]
for i, (l, fm, fmt) in enumerate(rows):
    cell(d, 6 + i, 2, l, bold=i == 6); cell(d, 6 + i, 3, fm, fmt, bold=True, align="right")
d["C12"].font = font(bold=True, size=16, color=GRN); d.row_dimensions[12].height = 28
header(d, 5, 5, ["Fund", "Progress"], GRN)
for i in range(10):
    r = 6 + i; cell(d, r, 5, f"=IF('Sinking Funds'!B{6+i}=\"\",\"\",'Sinking Funds'!B{6+i})"); cell(d, r, 6, f"='Sinking Funds'!I{6+i}", "0%", bold=True)
bar(d, "F6:F15", GRN)
cell(d, 17, 5, "1p challenge", bold=True); cell(d, 17, 6, "='1p Challenge'!C7", "0%", bold=True)
cell(d, 18, 5, "52 week challenge", bold=True); cell(d, 18, 6, "='52 Week Challenge'!C8", "0%", bold=True); bar(d, "F17:F18", YEL)
ch = BarChart(); ch.type = "bar"; ch.title = "Saved vs target"; ch.height = 8; ch.width = 16
ch.add_data(Reference(f, min_col=3, min_row=5, max_row=12), titles_from_data=True); ch.add_data(Reference(f, min_col=5, min_row=5, max_row=12), titles_from_data=True)
ch.set_categories(Reference(f, min_col=2, min_row=6, max_row=12))
ch.series[0].graphicalProperties.solidFill = LINE; ch.series[1].graphicalProperties.solidFill = GRN; ch.y_axis.majorGridlines = None; ch.x_axis.scaling.orientation = "maxMin"
d.add_chart(ch, "B21")

def demo(wb):
    for r, v in zip(range(6, 11), [None] * 5): pass
    p = wb["1p Challenge"]
    for dd in range(1, 60): p.cell(9 + dd, 5).value = TICK
    w = wb["52 Week Challenge"]
    for k in range(1, 9): w.cell(10 + k, 5).value = TICK
finish(wb, ["Start Here", "Dashboard", "Sinking Funds", "Savings Log", "1p Challenge", "52 Week Challenge"],
       {"Dashboard": BLUE, "Sinking Funds": GRN, "Savings Log": INK, "1p Challenge": YEL, "52 Week Challenge": RED}, OUT, shot_hook=demo,
       shots={"Dashboard": "A1:G38", "Sinking Funds": "A1:J22", "1p Challenge": "A1:J30", "52 Week Challenge": "A1:J30", "Savings Log": "A1:F14"}, shots_out=SHOTS)
