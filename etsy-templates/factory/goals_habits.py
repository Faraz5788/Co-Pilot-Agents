import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import LineChart, Reference
from openpyxl.formatting.rule import ColorScaleRule
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
YEAR = 2027
wb = Workbook()
start_here(wb, f"{YEAR} Goals & Habit Tracker", [
    "1.  Setup — type your name, the year, and up to 10 habits you want to build. They appear on every month automatically.",
    "2.  Goals — set up to 12 goals with a starting point and a target. Update 'Current' as you go and watch the progress bar fill.",
    "3.  Jan … Dec — tick off each habit every day (pick ✓ or type any letter). Days that don't exist in a month are greyed out.",
    "4.  Reflect — at the end of each month, score it out of 10 and jot down your wins and what to focus on next.",
    "5.  Dashboard — your goals, habit streaks month by month and a chart of your whole year.",
], extra_notes=("Want to use it again next year? Change the year on the Setup tab — all the dates update.",))

s = wb.create_sheet("Setup"); base(s, "Setup", "Your name, year and habits.", [34, 18])
cell(s, 5, 2, "Your name", bold=True); cell(s, 5, 3, "Alex", inp=True, align="center")
cell(s, 6, 2, "Year", bold=True); cell(s, 6, 3, YEAR, "0", inp=True, align="center")
header(s, 8, 2, ["Habits to track (up to 10)", ""], GRN)
habits = ["Drink 2L of water", "10,000 steps", "Read 20 minutes", "No phone after 10pm", "Exercise", "Save £5", "Meditate 10 minutes", "In bed by 11pm"]
for i in range(10): cell(s, 9 + i, 2, habits[i] if i < len(habits) else None, inp=True)
YR = "Setup!$C$6"

g = wb.create_sheet("Goals"); base(g, "Goals", "Set a start and target number for each goal, then update Current.", [30, 14, 30, 10, 10, 10, 12, 13, 13])
header(g, 5, 2, ["Goal", "Area", "Why it matters", "Start", "Target", "Current", "Progress", "Deadline", "Status"], RED)
areas = ["Health", "Money", "Career", "Learning", "Relationships", "Home", "Fun", "Mindset"]
exg = [("Run a 10k", "Health", "Feel fitter and stronger", 0, 10, 4, dt.date(YEAR, 6, 30)),
       ("Save an emergency fund", "Money", "Stop worrying about surprise bills", 0, 3000, 750, dt.date(YEAR, 12, 31)),
       ("Read 24 books", "Learning", "Less scrolling, more reading", 0, 24, 3, dt.date(YEAR, 12, 31)),
       ("Lose 6kg", "Health", "More energy", 82, 76, 80.5, dt.date(YEAR, 9, 1))]
for r in range(6, 18):
    v = exg[r - 6] if r - 6 < len(exg) else (None,) * 7
    for j, (val, fmt, al) in enumerate([(v[0], None, None), (v[1], None, "center"), (v[2], None, None), (v[3], "#,##0.##", "center"),
                                        (v[4], "#,##0.##", "center"), (v[5], "#,##0.##", "center")]):
        cell(g, r, 2 + j, val, fmt, inp=True, align=al)
    cell(g, r, 8, f'=IF(OR(B{r}="",F{r}="",F{r}=E{r}),"",MAX(0,MIN(1,(G{r}-E{r})/(F{r}-E{r}))))', "0%", bold=True)
    cell(g, r, 9, v[6], "dd mmm yyyy", inp=True)
    cell(g, r, 10, f'=IF(B{r}="","",IF(H{r}=1,"Done ✓",IF(AND(I{r}<>"",I{r}<TODAY()),"Overdue",IF(N(H{r})=0,"Not started","In progress"))))', align="center")
dropdown(g, "C6:C17", areas); bar(g, "H6:H17", GRN)
for st_, col in [("Done ✓", "B9D7C1"), ("Overdue", "F6DAD6"), ("In progress", "FBEFC9")]:
    g.conditional_formatting.add("J6:J17", CellIsRule(operator="equal", formula=[f'"{st_}"'], fill=fill(col)))
note(g, 19, 2, "Works for goals that go down too (like weight): just make Target smaller than Start.")

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
from openpyxl.utils import get_column_letter as CL
for mi, mn in enumerate(MONTHS):
    ws = wb.create_sheet(mn); base(ws, "", "Tick a habit each day you do it.", [26] + [3.6] * 31 + [7, 8])
    ws["B2"] = f'="{FULL[mi]} "&{YR}'
    dim = f"DAY(EOMONTH(DATE({YR},{mi+1},1),0))"
    cell(ws, 5, 2, None); cell(ws, 6, 2, "Habit", bold=True)
    for dd in range(1, 32):
        c = 2 + dd; Lc = CL(c)
        x = cell(ws, 6, c, f'=IF({dd}<={dim},{dd},"")', "0", bold=True, align="center", size=9)
        cell(ws, 5, c, f'=IF({Lc}6="","",LEFT(TEXT(DATE({YR},{mi+1},{dd}),"ddd"),1))', align="center", color=MUTE, size=8)
    cell(ws, 6, 34, "Done", bold=True, align="center"); cell(ws, 6, 35, "%", bold=True, align="center")
    for h in range(10):
        r = 7 + h
        cell(ws, r, 2, f'=IF(Setup!B{9+h}="","",Setup!B{9+h})')
        for dd in range(1, 32): cell(ws, r, 2 + dd, None, inp=True, align="center", size=9)
        cell(ws, r, 34, f'=IF(B{r}="","",COUNTA(C{r}:AG{r}))', "0", align="center")
        cell(ws, r, 35, f'=IF(OR(B{r}="",COUNTA($C$7:$AG$16)=0),"",AH{r}/{dim})', "0%", bold=True, align="center")
    cell(ws, 17, 2, "Daily score", bold=True)
    for dd in range(1, 32):
        Lc = CL(2 + dd)
        cell(ws, 17, 2 + dd, f'=IF(OR({Lc}6="",SUMPRODUCT(--($B$7:$B$16<>""))=0),"",COUNTA({Lc}7:{Lc}16)/SUMPRODUCT(--($B$7:$B$16<>"")))', "0%", align="center", size=7)
    cell(ws, 17, 35, '=IFERROR(AVERAGE(AI7:AI16),"")', "0%", bold=True, align="center")
    dropdown(ws, "C7:AG16", [TICK])
    ws.conditional_formatting.add("C5:AG17", FormulaRule(formula=['C$6=""'], fill=fill("E9E5DC")))
    ws.conditional_formatting.add("C7:AG16", FormulaRule(formula=['C7<>""'], fill=fill(GRN), font=Font(name=F, color="FFFFFF", bold=True)))
    ws.conditional_formatting.add("C17:AG17", ColorScaleRule(start_type="num", start_value=0, start_color="FFFFFF", end_type="num", end_value=1, end_color="9FD1AE"))
    bar(ws, "AI7:AI16", GRN)
    ws.freeze_panes = "C7"
    if mi == 0:  # example ticks so the format is obvious
        import random; random.seed(3)
        for h in range(len(habits)):
            for dd in range(1, 11):
                if random.random() < 0.7: ws.cell(7 + h, 2 + dd, TICK)

rf = wb.create_sheet("Reflect"); base(rf, "Monthly Reflection", "Five minutes at the end of each month.", [12, 10, 36, 36, 36])
header(rf, 5, 2, ["Month", "Score /10", "Wins", "What was hard", "Focus for next month"], BLUE)
for i, mn in enumerate(FULL):
    r = 6 + i; cell(rf, r, 2, mn, bold=True)
    for c in range(3, 7): cell(rf, r, c, None, "0" if c == 3 else None, inp=True, align="center" if c == 3 else None)
    rf.row_dimensions[r].height = 34
rf["C6"] = 7; rf["D6"] = "Ran 3 times a week"; rf["E6"] = "Late nights"; rf["F6"] = "Phone out of the bedroom"
dv = DataValidation(type="whole", operator="between", formula1="1", formula2="10", allow_blank=True); rf.add_data_validation(dv); dv.add("C6:C17")
rf.conditional_formatting.add("C6:C17", ColorScaleRule(start_type="num", start_value=1, start_color="F6DAD6", mid_type="num", mid_value=5, mid_color="FBEFC9", end_type="num", end_value=10, end_color="9FD1AE"))

d = wb.create_sheet("Dashboard"); base(d, "", "Your year at a glance.", [26] + [7] * 12 + [8])
d["B2"] = f'=Setup!C5&"\'s "&{YR}'
cell(d, 5, 2, "Goals done", bold=True); cell(d, 5, 3, '=COUNTIF(Goals!J6:J17,"Done ✓")&" of "&COUNTA(Goals!B6:B17)')
d.merge_cells("C5:E5")
cell(d, 6, 2, "Average goal progress", bold=True); cell(d, 6, 3, '=IFERROR(AVERAGE(Goals!H6:H17),0)', "0%", bold=True); d.merge_cells("C6:E6")
bar(d, "C6", GRN)
header(d, 8, 2, ["Habit"] + MONTHS + ["Year"], INK)
for h in range(10):
    r = 9 + h; cell(d, r, 2, f'=IF(Setup!B{9+h}="","",Setup!B{9+h})')
    for mi, mn in enumerate(MONTHS): cell(d, r, 3 + mi, f'=IF($B{r}="","",{mn}!AI{7+h})', "0%", align="center", size=9)
    cell(d, r, 15, f'=IF(B{r}="","",IFERROR(AVERAGE(C{r}:N{r}),""))', "0%", bold=True, align="center")
cell(d, 19, 2, "All habits", bold=True)
for mi, mn in enumerate(MONTHS): cell(d, 19, 3 + mi, f"={mn}!AI17", "0%", bold=True, align="center", size=9)
cell(d, 19, 15, '=IFERROR(AVERAGE(C19:N19),"")', "0%", bold=True, align="center")
cell(d, 20, 2, "Month score /10", bold=True)
for mi in range(12): cell(d, 20, 3 + mi, f'=IF(Reflect!C{6+mi}="","",Reflect!C{6+mi})', "0", align="center", size=9)
d.conditional_formatting.add("C9:O19", ColorScaleRule(start_type="num", start_value=0, start_color="FFFFFF", end_type="num", end_value=1, end_color="7DBE90"))
from openpyxl.chart import BarChart
ch = BarChart(); ch.title = "Habit score by month"; ch.height = 7; ch.width = 20; ch.legend = None
ch.add_data(Reference(d, min_col=3, max_col=14, min_row=19), from_rows=True); ch.set_categories(Reference(d, min_col=3, max_col=14, min_row=8))
ch.series[0].graphicalProperties.solidFill = GRN; ch.y_axis.majorGridlines = None
ch.y_axis.scaling.min = 0; ch.y_axis.scaling.max = 1; ch.y_axis.number_format = "0%"; d.add_chart(ch, "B23")

order = ["Start Here", "Dashboard", "Goals", "Setup"] + MONTHS + ["Reflect"]
cols = {"Dashboard": BLUE, "Goals": RED, "Setup": INK, "Reflect": YEL}; cols.update({m: GRN for m in MONTHS})
def demo(wb):  # screenshot copy only: show the tracker after a few months of use
    import random; random.seed(7)
    for mi, mn in enumerate(MONTHS[:10]):
        ws = wb[mn]; p = 0.45 + 0.04 * mi
        for h in range(len(habits)):
            for dd in range(1, 29):
                ws.cell(7 + h, 2 + dd).value = TICK if random.random() < p + 0.03 * h % 0.2 else None
        wb["Reflect"].cell(6 + mi, 3).value = min(10, 5 + mi // 2 + random.randint(0, 1))
    for r, v in zip(range(6, 10), [10, 2100, 17, 77.5]): wb["Goals"].cell(r, 7).value = v
finish(wb, order, cols, OUT, shot_hook=demo, shots={"Dashboard": "A1:P38", "Goals": "A1:K19", "Jan": "A1:AJ18", "Reflect": "A1:G17"}, shots_out=SHOTS)
