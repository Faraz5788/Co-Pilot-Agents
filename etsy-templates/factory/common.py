"""Shared spreadsheet styling for The Geek Next Door Co. templates."""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, DataBarRule, FormulaRule
from openpyxl.worksheet.page import PageMargins
from openpyxl.utils import get_column_letter as L

INK = "1F1D1A"; CREAM = "F7F3EA"; RED = "D6452F"; YEL = "F2B632"; BLUE = "2F6FB5"; GRN = "3F9B5A"
INPUT = "FFF6D6"; LINE = "E4DCCB"; MUTE = "8A8378"; PALE_G = "E3EFE6"; PALE_R = "FBE3DF"
F = "Arial"; CUR = '£#,##0.00;-£#,##0.00;"-"'; TICK = "✓"
PALETTE = [RED, YEL, BLUE, GRN]

def font(**k): return Font(name=F, color=k.pop("color", INK), **k)
def fill(c): return PatternFill("solid", fgColor=c)
thin = Side(style="thin", color=LINE); box = Border(left=thin, right=thin, top=thin, bottom=thin)

def base(ws, title, sub, widths, accent=RED):
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 3
    for i, w in enumerate(widths): ws.column_dimensions[L(i + 2)].width = w
    n = len(widths) + 2
    for r in range(1, 4):
        for c in range(1, n + 1): ws.cell(r, c).fill = fill(CREAM)
    for c in range(1, n + 1): ws.cell(1, c).fill = fill(PALETTE[(c - 1) % 4])
    ws.row_dimensions[1].height = 6
    ws["B2"] = title; ws["B2"].font = font(size=20, bold=True, color=accent); ws.row_dimensions[2].height = 32
    ws["B3"] = sub; ws["B3"].font = font(size=10, italic=True, color="5A544B")

def header(ws, row, col, labels, color=INK):
    for i, l in enumerate(labels):
        c = ws.cell(row, col + i, l); c.font = font(bold=True, color="FFFFFF"); c.fill = fill(color)
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True); c.border = box
    ws.row_dimensions[row].height = 24

def cell(ws, r, c, v=None, fmt=None, inp=False, bold=False, align=None, color=INK, size=10):
    x = ws.cell(r, c)
    if v is not None: x.value = v
    x.font = font(bold=bold, color=color, size=size); x.border = box
    if inp: x.fill = fill(INPUT)
    if fmt: x.number_format = fmt
    x.alignment = Alignment(horizontal=align, vertical="center")
    return x

def dropdown(ws, rng, items=None, formula=None):
    dv = DataValidation(type="list", formula1=formula or '"' + ",".join(items) + '"', allow_blank=True)
    ws.add_data_validation(dv); dv.add(rng)

def note(ws, r, c, text): ws.cell(r, c, text).font = font(size=9, italic=True, color=MUTE)

def red_if_negative(ws, rng):
    ws.conditional_formatting.add(rng, CellIsRule(operator="lessThan", formula=["0"], font=Font(name=F, color=RED, bold=True)))

def bar(ws, rng, color=GRN, maxv=1):
    ws.conditional_formatting.add(rng, DataBarRule(start_type="num", start_value=0, end_type="num", end_value=maxv, color=color))

def strike_done(ws, rng, col, first):
    ws.conditional_formatting.add(rng, FormulaRule(formula=[f'${col}{first}="{TICK}"'], font=Font(name=F, color=MUTE, strike=True), fill=fill(PALE_G)))

def start_here(wb, name, steps, extra_notes=()):
    ws = wb.active; ws.title = "Start Here"
    base(ws, name, "by The Geek Next Door Co.", [100])
    r = 5; ws.cell(r, 2, "How to use this template").font = font(size=14, bold=True); r += 2
    for s in steps:
        c = ws.cell(r, 2, s); c.font = font(size=11); c.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[r].height = 30; r += 1
    r += 1; ws.cell(r, 2, "Colour key").font = font(size=14, bold=True); r += 1
    c = ws.cell(r, 2, "  Pale yellow cells = type here. Everything else calculates automatically."); c.fill = fill(INPUT); c.font = font(); c.border = box; r += 1
    c = ws.cell(r, 2, f"  {TICK} columns: pick {TICK} from the dropdown to tick something off."); c.font = font(); c.border = box; r += 2
    for t in ("Works in Microsoft Excel and Google Sheets. Example rows just show the format — overwrite or delete them.",) + tuple(extra_notes):
        note(ws, r, 2, t); r += 1
    return ws

def finish(wb, order, colors, out, shots=None, shots_out=None, shot_fill=None, shot_hook=None):
    """Save the product; optionally a second copy set up for screenshot rendering."""
    wb._sheets = [wb[n] for n in order]
    for ws in wb.worksheets: ws.sheet_properties.tabColor = colors.get(ws.title, INK)
    wb.active = 1
    wb.save(out)
    if shots:
        for k, v in (shot_fill or {}).items():
            sh, ref = k.split("!"); wb[sh][ref] = v
        if shot_hook: shot_hook(wb)
        for ws in wb.worksheets:
            if ws.title in shots:
                ws.print_area = shots[ws.title]; ws.page_setup.orientation = "landscape"
                ws.sheet_properties.pageSetUpPr.fitToPage = True; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 1
                ws.page_margins = PageMargins(left=0.1, right=0.1, top=0.1, bottom=0.1, header=0, footer=0)
            else:
                ws.sheet_state = "hidden"
        wb._sheets = [wb[n] for n in shots] + [w for w in wb.worksheets if w.title not in shots]
        wb.active = 0
        wb.save(shots_out)
