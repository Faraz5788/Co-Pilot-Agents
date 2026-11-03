import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
Y = 2026  # tax year 2026/27 starts 6 April 2026
wb = Workbook()
start_here(wb, "UK Sole Trader Bookkeeping", [
    "1.  Setup — type your business name and the year your tax year starts (e.g. 2026 for 6 Apr 2026 – 5 Apr 2027). Rename categories if you like.",
    "2.  Income — log every payment you receive: date, client, what it was for and the amount.",
    "3.  Expenses — log every business cost and pick a category. The categories follow the HMRC self-employment boxes.",
    "4.  Mileage — log business journeys. Your mileage claim works itself out using the rates on the Setup tab.",
    "5.  Dashboard — month-by-month income, expenses and profit, a tax pot to set aside, and totals per category ready for your Self Assessment.",
], extra_notes=("This template helps you keep records. It is not tax advice — check figures and rates on gov.uk or with an accountant.",))

# ---------- Setup ----------
s = wb.create_sheet("Setup"); base(s, "Setup", "Your details, tax year and categories.", [34, 22, 4, 38])
rows = [("Business name", "Jo Smith Design", None), ("Tax year starts (year)", Y, "0"),
        ("Tax year runs", '="6 Apr "&C6&" – 5 Apr "&(C6+1)', None),
        ("% of profit to set aside for tax", 0.25, "0%"),
        ("Mileage rate: first 10,000 miles", 0.45, "£0.00"), ("Mileage rate: after 10,000 miles", 0.25, "£0.00")]
for i, (l, v, f) in enumerate(rows):
    cell(s, 5 + i, 2, l, bold=True); cell(s, 5 + i, 3, v, f, inp=(i != 2), align="center")
note(s, 11, 2, "Mileage rates shown are the HMRC approved rates for cars and vans — check gov.uk in case they change.")
note(s, 12, 2, "The % to set aside is your own rough figure for saving, not a tax calculation.")
header(s, 14, 2, ["Income categories"], GRN)
inc = ["Sales / fees", "Product sales", "Commission", "Grants", "Other income"]
for i, v in enumerate(inc): cell(s, 15 + i, 2, v, inp=True)
header(s, 14, 5, ["Expense categories (HMRC boxes)"], RED)
exp = ["Cost of goods bought for resale", "Car, van and travel", "Wages and staff costs", "Rent, rates, power and insurance",
       "Repairs and maintenance", "Phone, stationery and office costs", "Advertising and marketing", "Accountancy and legal fees",
       "Interest and bank charges", "Clothing (uniform / protective)", "Subcontractor costs", "Other allowable expenses"]
for i, v in enumerate(exp): cell(s, 15 + i, 5, v, inp=True)
INC, EXP = "Setup!$B$15:$B$19", "Setup!$E$15:$E$26"

# ---------- Income ----------
N = 500
inc_ws = wb.create_sheet("Income"); base(inc_ws, "Income", "Every payment in. Paid ✓ when the money lands.", [14, 22, 30, 12, 20, 14, 8])
header(inc_ws, 5, 2, ["Date", "Client", "Description", "Invoice #", "Category", "Amount", "Paid"], GRN)
ex = [(dt.date(Y, 4, 14), "Bright Bakery", "Logo design", "INV-001", "Sales / fees", 450, TICK),
      (dt.date(Y, 5, 2), "Harbour Gym", "Social media graphics", "INV-002", "Sales / fees", 320, TICK),
      (dt.date(Y, 5, 20), "Etsy payout", "Print sales", "", "Product sales", 86.4, TICK)]
for r in range(6, 6 + N):
    v = ex[r - 6] if r - 6 < len(ex) else (None,) * 7
    for j, (val, fmt, al) in enumerate([(v[0], "dd mmm yyyy", None), (v[1], None, None), (v[2], None, None), (v[3] or None, None, "center"),
                                        (v[4], None, None), (v[5], CUR, None), (v[6], None, "center")]):
        cell(inc_ws, r, 2 + j, val, fmt, inp=True, align=al)
dropdown(inc_ws, f"F6:F{5+N}", formula="=" + INC); dropdown(inc_ws, f"H6:H{5+N}", [TICK]); inc_ws.freeze_panes = "B6"

# ---------- Expenses ----------
e = wb.create_sheet("Expenses"); base(e, "Expenses", "Every business cost. Tick Receipt when you've saved it.", [14, 22, 30, 32, 14, 9])
header(e, 5, 2, ["Date", "Supplier", "Description", "Category", "Amount", "Receipt"], RED)
exe = [(dt.date(Y, 4, 8), "Adobe", "Creative Cloud subscription", "Phone, stationery and office costs", 56.98, TICK),
       (dt.date(Y, 4, 22), "Vistaprint", "Business cards", "Advertising and marketing", 24.5, TICK),
       (dt.date(Y, 5, 30), "BT", "Broadband (business share)", "Phone, stationery and office costs", 18, None)]
for r in range(6, 6 + N):
    v = exe[r - 6] if r - 6 < len(exe) else (None,) * 6
    for j, (val, fmt, al) in enumerate([(v[0], "dd mmm yyyy", None), (v[1], None, None), (v[2], None, None), (v[3], None, None), (v[4], CUR, None), (v[5], None, "center")]):
        cell(e, r, 2 + j, val, fmt, inp=True, align=al)
dropdown(e, f"E6:E{5+N}", formula="=" + EXP); dropdown(e, f"G6:G{5+N}", [TICK]); e.freeze_panes = "B6"
e.conditional_formatting.add(f"G6:G{5+N}", FormulaRule(formula=['AND($F6<>"",$G6="")'], fill=fill(PALE_R)))
note(e, 4, 2, "Pink Receipt cell = you've logged a cost but haven't saved the receipt yet.")

# ---------- Mileage ----------
m = wb.create_sheet("Mileage"); base(m, "Mileage Log", "Business journeys only. Log them in date order.", [14, 30, 26, 10, 12, 12])
header(m, 5, 2, ["Date", "Journey (from → to)", "Purpose", "Miles", "Miles so far", "Claim"], BLUE)
exm = [(dt.date(Y, 4, 14), "Home → Bright Bakery, Leeds", "Client meeting", 18), (dt.date(Y, 5, 2), "Home → Harbour Gym, York", "Photo shoot", 46)]
for r in range(6, 6 + 300):
    v = exm[r - 6] if r - 6 < len(exm) else (None,) * 4
    cell(m, r, 2, v[0], "dd mmm yyyy", inp=True); cell(m, r, 3, v[1], inp=True); cell(m, r, 4, v[2], inp=True); cell(m, r, 5, v[3], "0.0", inp=True, align="center")
    cell(m, r, 6, f'=IF(E{r}="","",SUM($E$6:E{r}))', "#,##0.0", align="center")
    cell(m, r, 7, f'=IF(E{r}="","",MIN(E{r},MAX(0,10000-(F{r}-E{r})))*Setup!$C$9+MAX(0,E{r}-MAX(0,10000-(F{r}-E{r})))*Setup!$C$10)', CUR)
m.freeze_panes = "B6"
cell(m, 4, 6, "Total claim", bold=True); cell(m, 4, 7, "=SUM(G6:G305)", CUR, bold=True)

# ---------- Dashboard ----------
d = wb.create_sheet("Dashboard"); base(d, "", "Your tax year at a glance.", [24, 14, 14, 14, 4, 34, 14])
d["B2"] = '=Setup!C5&" — "&Setup!C7'
header(d, 5, 2, ["Month", "Income", "Expenses", "Profit"], INK)
months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
IA, ID = f"Income!$G$6:$G${5+N}", f"Income!$B$6:$B${5+N}"
EA, ED = f"Expenses!$F$6:$F${5+N}", f"Expenses!$B$6:$B${5+N}"
for k in range(12):
    r = 6 + k
    st = f"DATE(Setup!$C$6,4,6)" if k == 0 else f"DATE(Setup!$C$6,{4+k},1)"
    en = f"DATE(Setup!$C$6+1,4,5)" if k == 11 else f"EOMONTH({st},0)"
    cell(d, r, 2, months[k] + (" (from 6th)" if k == 0 else " (to 5 Apr)" if k == 11 else ""))
    cell(d, r, 3, f'=SUMIFS({IA},{ID},">="&{st},{ID},"<="&{en})', CUR)
    cell(d, r, 4, f'=SUMIFS({EA},{ED},">="&{st},{ED},"<="&{en})', CUR)
    cell(d, r, 5, f"=C{r}-D{r}", CUR, bold=True)
cell(d, 18, 2, "Total", bold=True)
for c, col in [(3, "C"), (4, "D"), (5, "E")]: cell(d, 18, c, f"=SUM({col}6:{col}17)", CUR, bold=True)
red_if_negative(d, "E6:E18")
header(d, 20, 2, ["Summary", ""], BLUE)
summ = [("Total income", "=C18"), ("Business expenses", "=D18"), ("Mileage claim", "=Mileage!G4"),
        ("Profit (after mileage)", "=C21-D21-C23" if False else "=C21-C22-C23"), ("Set aside for tax", "=MAX(0,C24)*Setup!C8"),
        ("Unpaid invoices", f'=SUMIFS({IA},Income!$H$6:$H${5+N},"<>{TICK}",{ID},"<>")')]
for i, (l, f) in enumerate(summ):
    cell(d, 21 + i, 2, l, bold=(i == 3)); cell(d, 21 + i, 3, f, CUR, bold=(i in (3, 4)))
d["C25"].fill = fill(PALE_G); red_if_negative(d, "C24")
header(d, 5, 7, ["Expenses by category", "Total"], RED)
for i in range(12):
    r = 6 + i; cell(d, r, 7, f"=Setup!E{15+i}"); cell(d, r, 8, f'=SUMIFS({EA},Expenses!$E$6:$E${5+N},G{r})', CUR)
cell(d, 18, 7, "Total", bold=True); cell(d, 18, 8, "=SUM(H6:H17)", CUR, bold=True)
note(d, 19, 7, "Car, van and travel above excludes your mileage claim (shown separately).")
ch = BarChart(); ch.title = "Income vs expenses by month"; ch.height = 8; ch.width = 18
ch.add_data(Reference(d, min_col=3, max_col=4, min_row=5, max_row=17), titles_from_data=True); ch.set_categories(Reference(d, min_col=2, min_row=6, max_row=17))
ch.series[0].graphicalProperties.solidFill = GRN; ch.series[1].graphicalProperties.solidFill = RED; ch.y_axis.majorGridlines = None
d.add_chart(ch, "B28")

order = ["Start Here", "Dashboard", "Income", "Expenses", "Mileage", "Setup"]
finish(wb, order, {"Dashboard": BLUE, "Income": GRN, "Expenses": RED, "Mileage": YEL, "Setup": INK}, OUT,
       shots={"Dashboard": "A1:I45", "Income": "A1:I14", "Expenses": "A1:H14", "Mileage": "A1:H14", "Setup": "A1:F27"}, shots_out=SHOTS)
