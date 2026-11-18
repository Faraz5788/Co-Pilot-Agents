import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import LineChart, Reference
from openpyxl.utils import get_column_letter as CL
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
ND, NM = 15, 120          # debts, months simulated
wb = Workbook()
start_here(wb, "Debt Payoff Planner", [
    "1.  Debts — list every debt: what it is, the balance, the interest rate (APR) and the minimum monthly payment.",
    "2.  Type how much you can pay towards debts each month in total, pick Snowball or Avalanche, and the month you start.",
    "3.  The planner works out which debt to attack first, when each one will be paid off, your debt-free date and the total interest.",
    "4.  Payoff Plan — month by month: what you pay and what's left, with a chart counting down to zero.",
    "5.  Payment Log — record payments as you make them and watch the progress bars fill on the Debts tab.",
], extra_notes=("Snowball = smallest balance first (quick wins). Avalanche = highest interest first (saves the most money). Try both!",
                "Figures are estimates based on a fixed APR and monthly interest. This is not financial advice."))

d = wb.create_sheet("Debts"); base(d, "My Debts", "Fill in the yellow cells. Everything else works itself out.", [26, 16, 13, 9, 13, 9, 12, 14, 13, 12, 10])
settings = [("Total I can pay each month", 650, CUR), ("Method", "Snowball", None), ("Start month", dt.date(2027, 1, 1), "mmm yyyy")]
for i, (l, v, f) in enumerate(settings):
    cell(d, 5 + i, 2, l, bold=True); cell(d, 5 + i, 3, v, f, inp=True, align="center")
dropdown(d, "C6", ["Snowball", "Avalanche"])
header(d, 9, 2, ["Debt", "Type", "Balance", "APR", "Minimum", "Order", "Months", "Paid off", "Interest", "Paid so far", "Progress"], RED)
types = ["Credit card", "Personal loan", "Overdraft", "Car finance", "Buy now pay later", "Store card", "Family / friend", "Other"]
ex = [("Barclaycard", "Credit card", 2400, 0.249, 60), ("Overdraft", "Overdraft", 650, 0.399, 25), ("Car finance", "Car finance", 5200, 0.079, 180),
      ("Klarna", "Buy now pay later", 180, 0, 45), ("Personal loan", "Personal loan", 3800, 0.119, 110)]
R0 = 10
for i in range(ND):
    r = R0 + i; v = ex[i] if i < len(ex) else (None,) * 5
    cell(d, r, 2, v[0], inp=True); cell(d, r, 3, v[1], inp=True); cell(d, r, 4, v[2], CUR, inp=True)
    cell(d, r, 5, v[3], "0.0%", inp=True, align="center"); cell(d, r, 6, v[4], CUR, inp=True)
    d[f"M{r}"] = f'=IF(OR(B{r}="",N(D{r})=0),"",IF($C$6="Avalanche",-N(E{r}),N(D{r}))+ROW()/100000)'
    cell(d, r, 7, f'=IF(M{r}="","",RANK(M{r},$M${R0}:$M${R0+ND-1},1))', "0", bold=True, align="center")
dropdown(d, f"C{R0}:C{R0+ND-1}", types); d.column_dimensions["M"].hidden = True

# ---------- Engine (hidden) ----------
e = wb.create_sheet("Engine")
OB, PR, MN, NE, PY, CB = 2, 2 + ND, 2 + 2 * ND, 2 + 3 * ND, 3 + 4 * ND, 3 + 5 * ND   # block start columns
POOL, TB, TP = 2 + 4 * ND, 3 + 6 * ND, 4 + 6 * ND
e.cell(1, 1, "Month")
for m in range(1, NM + 1):
    r = 2 + m; e.cell(r, 1, m)
    for i in range(ND):
        dr = R0 + i; rate = f"N(Debts!$E${dr})/12"
        o, p, mn, ne, py, cb = (CL(x + i) for x in (OB, PR, MN, NE, PY, CB))
        e[f"{o}{r}"] = f"=N(Debts!$D${dr})" if m == 1 else f"={cb}{r-1}"
        e[f"{p}{r}"] = f'=IF({o}{r}>0.005,Debts!$G${dr},999)'
        e[f"{mn}{r}"] = f"=MIN({o}{r}*(1+{rate}),N(Debts!$F${dr}))"
        e[f"{ne}{r}"] = f"={o}{r}*(1+{rate})-{mn}{r}"
        # spare money goes to debts in attack order: each takes what it needs from what's left
        e[f"{py}{r}"] = (f'={mn}{r}+IF({p}{r}<999,MAX(0,MIN({ne}{r},${CL(POOL)}{r}'
                         f'-SUMIF(${CL(PR)}{r}:${CL(PR+ND-1)}{r},"<"&{p}{r},${CL(NE)}{r}:${CL(NE+ND-1)}{r}))),0)')
        e[f"{cb}{r}"] = f"=MAX(0,ROUND({o}{r}*(1+{rate})-{py}{r},2))"
    e[f"{CL(POOL)}{r}"] = f"=MAX(0,Debts!$C$5-SUM({CL(MN)}{r}:{CL(MN+ND-1)}{r}))"
    e[f"{CL(TB)}{r}"] = f"=SUM({CL(CB)}{r}:{CL(CB+ND-1)}{r})"
    e[f"{CL(TP)}{r}"] = f"=SUM({CL(PY)}{r}:{CL(PY+ND-1)}{r})"
e.sheet_state = "hidden"

for i in range(ND):
    r = R0 + i; cbc = CL(CB + i); pyc = CL(PY + i)
    cbr = f"Engine!${cbc}$3:${cbc}${2+NM}"
    cell(d, r, 8, f'=IF(G{r}="","",IF(Engine!{cbc}{2+NM}>0.005,"10 yrs+",COUNTIF({cbr},">0.005")+1))', "0", align="center")
    cell(d, r, 9, f'=IF(OR(H{r}="",H{r}="10 yrs+"),"",EDATE($C$7,H{r}-1))', "mmm yyyy", align="center")
    cell(d, r, 10, f'=IF(G{r}="","",SUM(Engine!${pyc}$3:${pyc}${2+NM})-D{r})', CUR)
    cell(d, r, 11, f'=IF(B{r}="","",SUMIFS(\'Payment Log\'!$E$6:$E$505,\'Payment Log\'!$C$6:$C$505,B{r}))', CUR)
    cell(d, r, 12, f'=IF(OR(B{r}="",N(D{r})=0),"",MIN(1,K{r}/D{r}))', "0%", bold=True)
bar(d, f"L{R0}:L{R0+ND-1}", GRN)
d.conditional_formatting.add(f"G{R0}:G{R0+ND-1}", CellIsRule(operator="equal", formula=["1"], fill=fill(YEL), font=Font(name=F, bold=True)))
cell(d, R0 + ND, 2, "Total", bold=True); cell(d, R0 + ND, 4, f"=SUM(D{R0}:D{R0+ND-1})", CUR, bold=True); cell(d, R0 + ND, 6, f"=SUM(F{R0}:F{R0+ND-1})", CUR, bold=True)
cell(d, R0 + ND, 10, f"=SUM(J{R0}:J{R0+ND-1})", CUR, bold=True); cell(d, R0 + ND, 11, f"=SUM(K{R0}:K{R0+ND-1})", CUR, bold=True)
w = R0 + ND + 2
d.cell(w, 2, f'=IF(C5<F{R0+ND},"⚠ Your monthly amount is less than your minimum payments (£"&TEXT(F{R0+ND},"#,##0")&"). Increase it so the plan can work.","")').font = font(bold=True, color=RED)
note(d, w + 1, 2, "The yellow 'Order' 1 is the debt to throw every spare pound at. When it's gone, its payment rolls onto the next one.")

# ---------- Payment log ----------
lg = wb.create_sheet("Payment Log"); base(lg, "Payment Log", "Record payments as you make them.", [14, 26, 30, 14])
header(lg, 5, 2, ["Date", "Debt", "Note", "Amount"], BLUE)
exl = [(dt.date(2027, 1, 3), "Klarna", "Final instalments", 90), (dt.date(2027, 1, 28), "Barclaycard", "Monthly payment", 60)]
for r in range(6, 506):
    v = exl[r - 6] if r - 6 < len(exl) else (None,) * 4
    cell(lg, r, 2, v[0], "dd mmm yyyy", inp=True); cell(lg, r, 3, v[1], inp=True); cell(lg, r, 4, v[2], inp=True); cell(lg, r, 5, v[3], CUR, inp=True)
dropdown(lg, "C6:C505", formula=f"=Debts!$B${R0}:$B${R0+ND-1}"); lg.freeze_panes = "B6"

# ---------- Payoff plan ----------
p = wb.create_sheet("Payoff Plan"); base(p, "Payoff Plan", "Month by month, until you're debt free.", [10, 12, 14, 16])
header(p, 5, 2, ["Month", "Date", "You pay", "Debt left"], GRN)
for m in range(1, NM + 1):
    r = 5 + m
    cell(p, r, 2, m, "0", align="center"); cell(p, r, 3, f"=EDATE(Debts!$C$7,{m-1})", "mmm yyyy", align="center")
    cell(p, r, 4, f"=Engine!{CL(TP)}{2+m}", CUR); cell(p, r, 5, f"=Engine!{CL(TB)}{2+m}", CUR, bold=True)
p.conditional_formatting.add(f"B6:E{5+NM}", FormulaRule(formula=["AND($E6=0,$D6=0)"], font=Font(name=F, color=MUTE)))
p.freeze_panes = "B6"

# ---------- Dashboard ----------
db = wb.create_sheet("Dashboard"); base(db, "Debt Free Plan", "Your plan at a glance.", [30, 24, 4, 30, 16])
TOTR = R0 + ND
months_max = f'IF(COUNTIF(Debts!H{R0}:H{R0+ND-1},"10 yrs+")>0,"10 yrs+",MAX(Debts!H{R0}:H{R0+ND-1}))'
rows = [("Total debt today", f"=Debts!D{TOTR}", CUR), ("Paying each month", "=Debts!C5", CUR), ("Method", "=Debts!C6", None),
        ("Months until debt free", "=" + months_max, "0"),
        ("Debt-free date", f'=IF(ISNUMBER(C9),EDATE(Debts!C7,C9-1),"Increase your payment")', "mmm yyyy"),
        ("Total interest you'll pay", f"=Debts!J{TOTR}", CUR), ("Paid off so far", f"=Debts!K{TOTR}", CUR),
        ("Progress", f'=IF(Debts!D{TOTR}=0,0,MIN(1,C12/Debts!D{TOTR}))', "0%")]
header(db, 5, 2, ["Your plan", ""], RED)
for i, (l, f, fmt) in enumerate(rows):
    cell(db, 6 + i, 2, l, bold=i == 4); cell(db, 6 + i, 3, f, fmt, bold=True, align="right")
db["C10"].font = font(bold=True, size=16, color=GRN); db.row_dimensions[10].height = 28; bar(db, "C13", GRN)
header(db, 5, 5, ["Attack order", "Paid off"], INK)
for k in range(1, 9):
    r = 5 + k
    cell(db, r, 5, f'=IFERROR(INDEX(Debts!$B${R0}:$B${R0+ND-1},MATCH({k},Debts!$G${R0}:$G${R0+ND-1},0)),"")', bold=k == 1)
    cell(db, r, 6, f'=IFERROR(INDEX(Debts!$I${R0}:$I${R0+ND-1},MATCH({k},Debts!$G${R0}:$G${R0+ND-1},0)),"")', "mmm yyyy", align="center")
db["E6"].fill = fill(YEL)
ch = LineChart(); ch.title = "Debt left over time"; ch.height = 8; ch.width = 18; ch.legend = None
ch.add_data(Reference(p, min_col=5, min_row=5, max_row=5 + 60), titles_from_data=True); ch.set_categories(Reference(p, min_col=3, min_row=6, max_row=5 + 60))
ch.series[0].graphicalProperties.line.solidFill = RED; ch.series[0].graphicalProperties.line.width = 38000; ch.y_axis.majorGridlines = None
ch.x_axis.number_format = "mmm yy"; ch.x_axis.tickLblSkip = 6
db.add_chart(ch, "B16")

finish(wb, ["Start Here", "Dashboard", "Debts", "Payoff Plan", "Payment Log", "Engine"],
       {"Dashboard": BLUE, "Debts": RED, "Payoff Plan": GRN, "Payment Log": YEL}, OUT,
       shots={"Dashboard": "A1:G33", "Debts": "A1:L27", "Payoff Plan": "A1:F30", "Payment Log": "A1:F14"}, shots_out=SHOTS)
