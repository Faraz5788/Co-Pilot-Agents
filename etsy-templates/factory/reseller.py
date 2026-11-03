import sys, datetime as dt
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from common import *

OUT, SHOTS = sys.argv[1], sys.argv[2]
Y = 2026
wb = Workbook()
start_here(wb, "Reseller Profit Tracker", [
    "1.  Setup — check the platform list and type in each platform's selling fee (if any). Add your own sources (charity shops, car boots…).",
    "2.  Inventory — add every item you buy to resell: what it is, where you got it and what you paid. Each item gets an ID automatically.",
    "3.  When it's listed, add the platform and listing price. When it sells, add the sold date, sold price and postage you paid.",
    "4.  Fees, profit, ROI and days-to-sell calculate themselves. The status changes from In stock → Listed → Sold on its own.",
    "5.  Dashboard — stock value, sales, profit by month and by platform, your best sources and how fast things sell.",
], extra_notes=("Platform fees change — always check your platform's current seller fees and enter them on the Setup tab.",))

s = wb.create_sheet("Setup"); base(s, "Setup", "Platforms, fees and where you source stock.", [18, 12, 14, 4, 24])
cell(s, 5, 2, "Year to track", bold=True); cell(s, 5, 3, Y, "0", inp=True, align="center")
header(s, 7, 2, ["Platform", "Fee %", "Fixed fee per sale"], BLUE)
plats = ["Vinted", "eBay", "Depop", "Facebook", "Etsy", "Other"]
for i, p in enumerate(plats):
    cell(s, 8 + i, 2, p, inp=True); cell(s, 8 + i, 3, 0, "0.0%", inp=True, align="center"); cell(s, 8 + i, 4, 0, CUR, inp=True)
note(s, 14, 2, "Fees are set to 0 — enter your own current fees. Leave 0 if the buyer pays the fees.")
header(s, 7, 6, ["Where you source stock"], GRN)
srcs = ["Charity shop", "Car boot", "Clearance / sale", "Online", "Wardrobe clear-out", "Other"]
for i, v in enumerate(srcs): cell(s, 8 + i, 6, v, inp=True)
PL, SR = "Setup!$B$8:$B$13", "Setup!$F$8:$F$13"

N = 1000
iv = wb.create_sheet("Inventory"); base(iv, "Inventory & Sales", "One row per item. Grey columns calculate themselves.",
                                        [8, 28, 14, 8, 16, 13, 10, 12, 11, 13, 11, 10, 10, 11, 10, 9, 11])
cols = ["ID", "Item", "Brand", "Size", "Source", "Date bought", "Cost", "Platform", "Listed at", "Date sold", "Sold for", "Postage paid",
        "Fees", "Profit", "ROI", "Days to sell", "Status"]
header(iv, 5, 2, cols, INK)
ex = [("Levi's 501 jeans", "Levi's", "W32", "Charity shop", dt.date(Y, 9, 6), 4, "Vinted", 22, dt.date(Y, 9, 15), 20, 0),
      ("Barbour wax jacket", "Barbour", "M", "Car boot", dt.date(Y, 9, 14), 15, "eBay", 85, dt.date(Y, 10, 2), 78, 4.5),
      ("Nike Air Max 90", "Nike", "UK 9", "Online", dt.date(Y, 10, 3), 25, "Vinted", 55, None, None, None),
      ("Le Creuset casserole dish", "Le Creuset", "24cm", "Charity shop", dt.date(Y, 10, 10), 12, "Facebook", 60, dt.date(Y, 10, 18), 55, 0),
      ("Zara wool coat", "Zara", "S", "Clearance / sale", dt.date(Y, 10, 20), 9, None, None, None, None, None)]
for r in range(6, 6 + N):
    v = ex[r - 6] if r - 6 < len(ex) else (None,) * 11
    cell(iv, r, 2, f'=IF(C{r}="","",TEXT(ROW()-5,"0000"))', align="center", color=MUTE)
    specs = [(v[0], None, None), (v[1], None, None), (v[2], None, "center"), (v[3], None, None), (v[4], "dd mmm yy", None), (v[5], CUR, None),
             (v[6], None, None), (v[7], CUR, None), (v[8], "dd mmm yy", None), (v[9], CUR, None), (v[10], CUR, None)]
    for j, (val, fmt, al) in enumerate(specs): cell(iv, r, 3 + j, val, fmt, inp=True, align=al)
    cell(iv, r, 14, f'=IF(OR(L{r}="",I{r}=""),"",L{r}*IFERROR(INDEX(Setup!$C$8:$C$13,MATCH(I{r},{PL},0)),0)+IFERROR(INDEX(Setup!$D$8:$D$13,MATCH(I{r},{PL},0)),0))', CUR)
    cell(iv, r, 15, f'=IF(L{r}="","",L{r}-H{r}-N(M{r})-N(N{r}))', CUR, bold=True)
    cell(iv, r, 16, f'=IF(OR(L{r}="",N(H{r})=0),"",O{r}/H{r})', "0%")
    cell(iv, r, 17, f'=IF(OR(K{r}="",G{r}=""),"",K{r}-G{r})', "0", align="center")
    cell(iv, r, 18, f'=IF(C{r}="","",IF(L{r}<>"","Sold",IF(I{r}<>"","Listed","In stock")))', align="center")
dropdown(iv, f"F6:F{5+N}", formula="=" + SR); dropdown(iv, f"I6:I{5+N}", formula="=" + PL)
for st_, col in [("Sold", "B9D7C1"), ("Listed", "FBEFC9"), ("In stock", "EFEBE3")]:
    iv.conditional_formatting.add(f"R6:R{5+N}", CellIsRule(operator="equal", formula=[f'"{st_}"'], fill=fill(col)))
red_if_negative(iv, f"O6:O{5+N}"); iv.freeze_panes = "D6"
R = lambda col: f"Inventory!${col}$6:${col}${5+N}"

d = wb.create_sheet("Dashboard"); base(d, "Reseller Dashboard", "Updates as you add items and sales.", [24, 14, 4, 12, 12, 12, 12, 4, 16, 10, 12, 12])
header(d, 5, 2, ["Overview", ""], INK)
ov = [("Items in stock (unsold)", f'=COUNTIF({R("R")},"In stock")+COUNTIF({R("R")},"Listed")', "0"),
      ("Money tied up in stock", f'=SUMIFS({R("H")},{R("R")},"In stock")+SUMIFS({R("H")},{R("R")},"Listed")', CUR),
      ("Items sold", f'=COUNTIF({R("R")},"Sold")', "0"), ("Total sales", f'=SUM({R("L")})', CUR),
      ("Total profit", f'=SUM({R("O")})', CUR), ("Average profit per sale", '=IF(C8=0,0,C10/C8)', CUR),
      ("Average ROI", f'=IF(SUMIFS({R("H")},{R("R")},"Sold")=0,0,C10/SUMIFS({R("H")},{R("R")},"Sold"))', "0%"),
      ("Average days to sell", f'=IFERROR(AVERAGE({R("Q")}),0)', "0")]
for i, (l, f, fmt) in enumerate(ov):
    cell(d, 6 + i, 2, l); cell(d, 6 + i, 3, f, fmt, bold=True, align="right")
d["C10"].fill = fill(PALE_G); d["C10"].font = font(bold=True, size=14, color=GRN)
header(d, 5, 5, ["Month", "Sold", "Sales", "Profit"], GRN)
YR = "Setup!$C$5"
for k, mn in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]):
    r = 6 + k; st = f"DATE({YR},{k+1},1)"; en = f"EOMONTH(DATE({YR},{k+1},1),0)"
    cond = f'{R("K")},">="&{st},{R("K")},"<="&{en}'
    cell(d, r, 5, mn); cell(d, r, 6, f"=COUNTIFS({cond})", "0", align="center")
    cell(d, r, 7, f"=SUMIFS({R('L')},{cond})", CUR); cell(d, r, 8, f"=SUMIFS({R('O')},{cond})", CUR, bold=True)
cell(d, 18, 5, "Total", bold=True)
for c, col in [(6, "F"), (7, "G"), (8, "H")]: cell(d, 18, c, f"=SUM({col}6:{col}17)", "0" if c == 6 else CUR, bold=True)
header(d, 5, 10, ["Platform", "Sold", "Profit", "Avg days"], BLUE)
for i in range(6):
    r = 6 + i; cell(d, r, 10, f"=Setup!B{8+i}")
    cell(d, r, 11, f'=COUNTIFS({R("I")},J{r},{R("R")},"Sold")', "0", align="center")
    cell(d, r, 12, f'=SUMIFS({R("O")},{R("I")},J{r})', CUR); cell(d, r, 13, f'=IFERROR(AVERAGEIFS({R("Q")},{R("I")},J{r}),"-")', "0", align="center")
header(d, 13, 10, ["Source", "Bought", "Profit", "Avg ROI"], GRN)
for i in range(6):
    r = 14 + i; cell(d, r, 10, f"=Setup!F{8+i}")
    cell(d, r, 11, f'=COUNTIF({R("F")},J{r})', "0", align="center"); cell(d, r, 12, f'=SUMIFS({R("O")},{R("F")},J{r})', CUR)
    cell(d, r, 13, f'=IFERROR(SUMIFS({R("O")},{R("F")},J{r})/SUMIFS({R("H")},{R("F")},J{r},{R("R")},"Sold"),"-")', "0%", align="center")
red_if_negative(d, "H6:H18"); red_if_negative(d, "L6:L19")
ch = BarChart(); ch.title = "Profit by month"; ch.height = 8; ch.width = 16; ch.legend = None
ch.add_data(Reference(d, min_col=8, min_row=5, max_row=17), titles_from_data=True); ch.set_categories(Reference(d, min_col=5, min_row=6, max_row=17))
ch.series[0].graphicalProperties.solidFill = GRN; ch.y_axis.majorGridlines = None; d.add_chart(ch, "B21")

finish(wb, ["Start Here", "Dashboard", "Inventory", "Setup"], {"Dashboard": BLUE, "Inventory": GRN, "Setup": INK}, OUT,
       shots={"Dashboard": "A1:N38", "Inventory": "A1:S11", "Setup": "A1:G15"}, shots_out=SHOTS)
