import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
Y = 2027; N = 1500
M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
wb = Workbook()
start_here(wb, f"{Y} Annual Budget Planner", [
    "1.  Setup — set the year and rename the income and expense categories to suit you.",
    "2.  Budget Plan — type your usual monthly amount for each category. Every month copies it; overwrite any month that's different (e.g. Christmas).",
    "3.  Transactions — log money in and out: date, description, Income or Expense, category and amount.",
    "4.  Monthly View — pick a month to see plan vs actual for every category, what's left to spend and a chart.",
    "5.  Year Overview and Dashboard — month-by-month actuals, how much you saved and your savings rate for the year.",
], extra_notes=("Change the year on Setup to re-use it next year.",))
inc = ["Salary", "Partner's salary", "Side hustle", "Benefits", "Gifts", "Other income"]
exp = ["Rent / Mortgage", "Council tax", "Energy", "Water", "Phone & broadband", "Groceries", "Eating out", "Transport", "Insurance",
       "Subscriptions", "Childcare", "Shopping", "Entertainment", "Savings", "Debt payments", "Miscellaneous"]
s = wb.create_sheet("Setup"); base(s, "Setup", "Year and categories.", [28, 4, 28, 4, 22])
cell(s, 5, 2, "Year", bold=True); cell(s, 5, 4, Y, "0", inp=True, align="center")
header(s, 7, 2, ["Income categories"], GRN); header(s, 7, 4, ["Expense categories"], RED)
for i, v in enumerate(inc): cell(s, 8 + i, 2, v, inp=True)
for i, v in enumerate(exp): cell(s, 8 + i, 4, v, inp=True)
for i in range(6): s.cell(8 + i, 6, f"=B{8+i}").font = font(size=9, color=MUTE)
for i in range(16): s.cell(14 + i, 6, f"=D{8+i}").font = font(size=9, color=MUTE)
s["F7"] = "All categories (auto)"; s["F7"].font = font(size=9, italic=True, color=MUTE)
YR = "Setup!$D$5"

# Budget plan: rows 7-12 income, 15-30 expenses; col C = usual amount, D..O months
pl = wb.create_sheet("Budget Plan"); base(pl, "Budget Plan", "Usual amount per month — months copy it unless you overwrite them.", [24, 12] + [10] * 12 + [12])
header(pl, 5, 2, ["Income", "Usual"] + M + ["Year"], GRN)
pinc = [2650, 1400, 200, 0, 0, 0]
for i in range(6):
    r = 6 + i; cell(pl, r, 2, f"=Setup!B{8+i}"); cell(pl, r, 3, pinc[i], CUR, inp=True)
    for k in range(12): cell(pl, r, 4 + k, f"=$C{r}", '#,##0;-#,##0;"-"', inp=True)
    cell(pl, r, 16, f"=SUM(D{r}:O{r})", '#,##0;-#,##0;"-"', bold=True)
cell(pl, 12, 2, "Total income", bold=True)
for c in range(3, 17): L = chr(64 + c); cell(pl, 12, c, f"=SUM({L}6:{L}11)", '#,##0;-#,##0;"-"', bold=True)
header(pl, 14, 2, ["Expenses", "Usual"] + M + ["Year"], RED)
pexp = [1150, 175, 140, 42, 50, 480, 120, 160, 70, 45, 300, 150, 100, 400, 250, 60]
for i in range(16):
    r = 15 + i; cell(pl, r, 2, f"=Setup!D{8+i}"); cell(pl, r, 3, pexp[i], CUR, inp=True)
    for k in range(12): cell(pl, r, 4 + k, f"=$C{r}", '#,##0;-#,##0;"-"', inp=True)
    cell(pl, r, 16, f"=SUM(D{r}:O{r})", '#,##0;-#,##0;"-"', bold=True)
pl["N26"] = 450; pl["N27"] = 200   # example: bigger Shopping & Entertainment in November (Christmas)
cell(pl, 31, 2, "Total expenses", bold=True)
for c in range(3, 17): L = chr(64 + c); cell(pl, 31, c, f"=SUM({L}15:{L}30)", '#,##0;-#,##0;"-"', bold=True)
cell(pl, 32, 2, "Left over", bold=True)
for c in range(3, 17): L = chr(64 + c); cell(pl, 32, c, f"={L}12-{L}31", '#,##0;-#,##0;"-"', bold=True)
red_if_negative(pl, "C32:P32"); pl.freeze_panes = "D6"
note(pl, 33, 2, "Example: November's Shopping and Entertainment are overwritten for Christmas.")

tx = wb.create_sheet("Transactions"); base(tx, "Transactions", "Every bit of money in and out.", [14, 32, 11, 22, 13, 22])
header(tx, 5, 2, ["Date", "Description", "Type", "Category", "Amount", "Notes"], BLUE)
ex = [(dt.date(Y, 1, 1), "Rent", "Expense", "Rent / Mortgage", 1150), (dt.date(Y, 1, 3), "Tesco", "Expense", "Groceries", 92.4),
      (dt.date(Y, 1, 5), "Train to work", "Expense", "Transport", 38), (dt.date(Y, 1, 9), "Pizza Express", "Expense", "Eating out", 46.8),
      (dt.date(Y, 1, 28), "January pay", "Income", "Salary", 2650), (dt.date(Y, 1, 28), "Partner's pay", "Income", "Partner's salary", 1400),
      (dt.date(Y, 1, 15), "Council tax", "Expense", "Council tax", 175), (dt.date(Y, 1, 18), "Octopus", "Expense", "Energy", 151.2)]
for r in range(6, 6 + N):
    v = ex[r - 6] if r - 6 < len(ex) else (None,) * 5
    cell(tx, r, 2, v[0], "dd mmm yyyy", inp=True); cell(tx, r, 3, v[1], inp=True); cell(tx, r, 4, v[2], inp=True, align="center")
    cell(tx, r, 5, v[3], inp=True); cell(tx, r, 6, v[4], CUR, inp=True); cell(tx, r, 7, None, inp=True)
dropdown(tx, f"D6:D{5+N}", ["Income", "Expense"]); dropdown(tx, f"E6:E{5+N}", formula="=Setup!$F$8:$F$29"); tx.freeze_panes = "B6"
TD, TT, TC, TA = (f"Transactions!${c}$6:${c}${5+N}" for c in "BDEF")
def act(cat, typ, st, en): return f'SUMIFS({TA},{TC},{cat},{TT},"{typ}",{TD},">="&{st},{TD},"<="&{en})'

mv = wb.create_sheet("Monthly View"); base(mv, "", "Plan vs actual for the month you pick.", [24, 13, 13, 14, 4, 26, 14])
mv["B2"] = '=C5&" "&Setup!D5'
cell(mv, 5, 2, "Month", bold=True); cell(mv, 5, 3, "January", inp=True, align="center"); dropdown(mv, "C5", formula="=Setup!$H$8:$H$19")
for k, mn in enumerate(FULL): s.cell(8 + k, 8, mn).font = font(size=9, color=MUTE)
s["H7"] = "Months (auto)"; s["H7"].font = font(size=9, italic=True, color=MUTE)
mv["D5"] = "=MATCH(C5,Setup!$H$8:$H$19,0)"; mv["D5"].font = font(size=8, color=MUTE)
st, en = f"DATE({YR},$D$5,1)", f"EOMONTH(DATE({YR},$D$5,1),0)"
header(mv, 7, 2, ["Income", "Planned", "Actual", "Difference"], GRN)
for i in range(6):
    r = 8 + i; cell(mv, r, 2, f"=Setup!B{8+i}"); cell(mv, r, 3, f"=INDEX('Budget Plan'!$D{6+i}:$O{6+i},$D$5)", CUR)
    cell(mv, r, 4, "=" + act(f"B{r}", "Income", st, en), CUR); cell(mv, r, 5, f"=D{r}-C{r}", CUR)
cell(mv, 14, 2, "Total income", bold=True)
for c, L in [(3, "C"), (4, "D"), (5, "E")]: cell(mv, 14, c, f"=SUM({L}8:{L}13)", CUR, bold=True)
header(mv, 16, 2, ["Expenses", "Planned", "Actual", "Left to spend"], RED)
for i in range(16):
    r = 17 + i; cell(mv, r, 2, f"=Setup!D{8+i}"); cell(mv, r, 3, f"=INDEX('Budget Plan'!$D{15+i}:$O{15+i},$D$5)", CUR)
    cell(mv, r, 4, "=" + act(f"B{r}", "Expense", st, en), CUR); cell(mv, r, 5, f"=C{r}-D{r}", CUR)
cell(mv, 33, 2, "Total expenses", bold=True)
for c, L in [(3, "C"), (4, "D"), (5, "E")]: cell(mv, 33, c, f"=SUM({L}17:{L}32)", CUR, bold=True)
red_if_negative(mv, "E17:E33"); red_if_negative(mv, "E8:E14")
header(mv, 7, 7, ["This month", ""], BLUE)
for i, (l, fm, fmt) in enumerate([("Money in", "=D14", CUR), ("Money out", "=D33", CUR), ("Left over", "=D14-D33", CUR), ("% of budget spent", "=IF(C33=0,0,D33/C33)", "0%")]):
    cell(mv, 8 + i, 7, l, bold=i == 2); cell(mv, 8 + i, 8, fm, fmt, bold=True)
red_if_negative(mv, "H10"); bar(mv, "H11", YEL)
ch = BarChart(); ch.type = "bar"; ch.title = "Planned vs actual"; ch.height = 10; ch.width = 15
ch.add_data(Reference(mv, min_col=3, max_col=4, min_row=16, max_row=32), titles_from_data=True); ch.set_categories(Reference(mv, min_col=2, min_row=17, max_row=32))
ch.series[0].graphicalProperties.solidFill = LINE; ch.series[1].graphicalProperties.solidFill = BLUE; ch.y_axis.majorGridlines = None; ch.x_axis.scaling.orientation = "maxMin"
mv.add_chart(ch, "G14"); mv.freeze_panes = "B7"

yo = wb.create_sheet("Year Overview"); base(yo, "Year Overview", "What actually came in and went out, month by month.", [24] + [10] * 12 + [12])
header(yo, 5, 2, ["Category"] + M + ["Year"], INK)
NF = '#,##0;-#,##0;"-"'
def ms(k): return f"DATE({YR},{k},1)", f"EOMONTH(DATE({YR},{k},1),0)"
r = 6; cell(yo, r, 2, "INCOME", bold=True).fill = fill(PALE_G)
for i in range(6):
    r = 7 + i; cell(yo, r, 2, f"=Setup!B{8+i}")
    for k in range(12): cell(yo, r, 3 + k, "=" + act(f"$B{r}", "Income", *ms(k + 1)), NF)
    cell(yo, r, 15, f"=SUM(C{r}:N{r})", NF, bold=True)
cell(yo, 13, 2, "EXPENSES", bold=True).fill = fill(PALE_R)
for i in range(16):
    r = 14 + i; cell(yo, r, 2, f"=Setup!D{8+i}")
    for k in range(12): cell(yo, r, 3 + k, "=" + act(f"$B{r}", "Expense", *ms(k + 1)), NF)
    cell(yo, r, 15, f"=SUM(C{r}:N{r})", NF, bold=True)
for lbl, r, f_ in [("Total income", 31, "=SUM({c}7:{c}12)"), ("Total expenses", 32, "=SUM({c}14:{c}29)"), ("Saved", 33, "={c}31-{c}32"),
                   ("Planned saving", 34, "='Budget Plan'!{p}32")]:
    cell(yo, r, 2, lbl, bold=True)
    for c in range(3, 16):
        L = chr(64 + c); P = chr(65 + c) if c < 15 else "P"
        cell(yo, r, c, f_.format(c=L, p=P), NF, bold=True)
red_if_negative(yo, "C33:O34"); yo.freeze_panes = "C6"

d = wb.create_sheet("Dashboard"); base(d, "", "Your money this year.", [28, 14, 14, 4, 26, 14])
d["B2"] = '="My "&Setup!D5&" Budget"'
header(d, 5, 2, ["This year", "Planned", "Actual"], INK)
for i, (l, p, a) in enumerate([("Income", "='Budget Plan'!P12", "='Year Overview'!O31"), ("Expenses", "='Budget Plan'!P31", "='Year Overview'!O32"),
                               ("Saved", "=C6-C7", "=D6-D7")]):
    cell(d, 6 + i, 2, l, bold=i == 2); cell(d, 6 + i, 3, p, CUR); cell(d, 6 + i, 4, a, CUR, bold=True)
cell(d, 9, 2, "Savings rate", bold=True); cell(d, 9, 3, "=IF(C6=0,0,C8/C6)", "0%"); cell(d, 9, 4, "=IF(D6=0,0,D8/D6)", "0%", bold=True)
red_if_negative(d, "C8:D8")
header(d, 5, 6, ["Biggest spends (year)", ""], RED)
for k in range(1, 6):
    r = 5 + k
    cell(d, r, 6, f"=IF(LARGE('Year Overview'!$O$14:$O$29,{k})=0,\"\",INDEX('Year Overview'!$B$14:$B$29,MATCH(LARGE('Year Overview'!$O$14:$O$29,{k}),'Year Overview'!$O$14:$O$29,0)))")
    cell(d, r, 7, f"=LARGE('Year Overview'!$O$14:$O$29,{k})", CUR)
ch = BarChart(); ch.title = "Money in vs out by month"; ch.height = 8; ch.width = 20
ch.add_data(Reference(yo, min_col=2, max_col=14, min_row=31, max_row=32), from_rows=True, titles_from_data=True); ch.set_categories(Reference(yo, min_col=3, max_col=14, min_row=5))
ch.series[0].graphicalProperties.solidFill = GRN; ch.series[1].graphicalProperties.solidFill = RED; ch.y_axis.majorGridlines = None
d.add_chart(ch, "B13")

def demo(wb):   # screenshot copy: a few months of realistic spending
    import random; random.seed(11); t = wb["Transactions"]; r = 14
    for mth in range(1, 11):
        for cat, base_, typ in [("Salary", 2650, "Income"), ("Partner's salary", 1400, "Income"), ("Rent / Mortgage", 1150, "Expense"),
                                ("Groceries", 470, "Expense"), ("Energy", 140, "Expense"), ("Transport", 150, "Expense"), ("Eating out", 110, "Expense"),
                                ("Savings", 400, "Expense"), ("Debt payments", 250, "Expense"), ("Shopping", 140, "Expense"), ("Entertainment", 90, "Expense")]:
            if mth == 1 and cat in ("Salary", "Partner's salary", "Rent / Mortgage", "Groceries", "Energy", "Transport", "Eating out"): continue
            amt = round(base_ * random.uniform(0.85, 1.15), 2) if typ == "Expense" and cat not in ("Rent / Mortgage", "Savings") else base_
            for c_, v in zip("BCDEF", [dt.date(Y, mth, random.randint(1, 27)), cat, typ, cat, amt]): t[f"{c_}{r}"] = v
            r += 1
finish(wb, ["Start Here", "Dashboard", "Monthly View", "Budget Plan", "Transactions", "Year Overview", "Setup"],
       {"Dashboard": BLUE, "Monthly View": GRN, "Budget Plan": YEL, "Transactions": INK, "Year Overview": RED, "Setup": INK}, OUT, shot_hook=demo,
       shots={"Dashboard": "A1:H30", "Monthly View": "A1:M34", "Budget Plan": "A1:Q33", "Year Overview": "A1:P34", "Transactions": "A1:H16"}, shots_out=SHOTS)
