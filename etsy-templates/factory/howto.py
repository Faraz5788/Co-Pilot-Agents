"""Builds a buyer 'How to open your template' PDF: python3 howto.py "<Product name>" <file.xlsx> <out.pdf>"""
import sys, subprocess, os, html
name, xlsx, out = sys.argv[1], sys.argv[2], os.path.abspath(sys.argv[3])
E = html.escape
page = f"""<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>@page{{size:A4;margin:0}}body{{margin:0;font-family:Inter,sans-serif;color:#1F1D1A;background:#F7F3EA}}
.s{{height:12px;background:linear-gradient(90deg,#D6452F 0 25%,#F2B632 25% 50%,#2F6FB5 50% 75%,#3F9B5A 75%)}}
.w{{padding:40px 56px}}h1{{font-family:'DM Serif Display';font-weight:400;font-size:40px;margin:0 0 6px;color:#D6452F}}
.sub{{color:#5a544b;font-weight:600;margin-bottom:22px}}h2{{font-size:18px;margin:22px 0 8px}}
.box{{background:#fff;border-radius:14px;padding:16px 22px;box-shadow:0 4px 14px rgba(0,0,0,.06)}}
ol{{margin:4px 0 0;padding-left:22px;line-height:1.6}}.y{{background:#FFF6D6;border:1px solid #E4DCCB;padding:1px 6px}}
.f{{margin-top:26px;font-size:13px;color:#8a8378}}code{{background:#eee;padding:1px 5px;border-radius:4px}}</style></head><body><div class="s"></div><div class="w">
<h1>Thank you for your order!</h1><div class="sub">{E(name)} · The Geek Next Door Co.</div>
<div class="box"><b>Your file:</b> <code>{E(xlsx)}</code><br>It works in Microsoft Excel and Google Sheets.</div>
<h2>Open it in Microsoft Excel</h2><div class="box"><ol><li>Unzip the download (on most devices just tap or double-click it).</li><li>Open <code>{E(xlsx)}</code> in Excel.</li><li>If you see "Enable Editing" at the top, click it.</li></ol></div>
<h2>Open it in Google Sheets (free)</h2><div class="box"><ol><li>Go to <b>drive.google.com</b> and sign in.</li><li>Click <b>New → File upload</b> and choose <code>{E(xlsx)}</code>.</li><li>Open it, then click <b>File → Save as Google Sheets</b>.</li><li>Use the new Google Sheets version from now on.</li></ol></div>
<h2>Using your template</h2><div class="box"><ol><li>Start on the <b>Start Here</b> tab for a quick guide.</li><li>Type only in the <span class="y">pale yellow cells</span>. Everything else calculates for you.</li><li>The example rows show the format. Overwrite or delete them.</li></ol></div>
<h2>Need help?</h2><div class="box">Message me on Etsy and I'll help straight away. If you're enjoying it, a review would mean the world to a small shop. ⭐</div>
<div class="f">For personal use only. Please don't share or resell this file. Apple Numbers isn't fully supported.</div></div></body></html>"""
h = out[:-4] + ".html"; open(h, "w").write(page)
js = "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.argv[2]);await p.waitForLoadState('networkidle');await p.pdf({path:process.argv[3],format:'A4',printBackground:true});await b.close()})();"
jf = out[:-4] + ".js"; open(jf, "w").write(js)
subprocess.run(["node", jf, h, out], check=True); os.remove(h); os.remove(jf)
