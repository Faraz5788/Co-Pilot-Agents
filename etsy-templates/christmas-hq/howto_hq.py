"""Buyer guide PDF for Christmas HQ: python3 howto_hq.py <out.pdf>"""
import sys, os, subprocess
out = os.path.abspath(sys.argv[1])
page = """<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:0}body{margin:0;font-family:Inter,sans-serif;color:#1F1D1A;background:#F7F3EA;font-size:12.5px}
.s{height:12px;background:linear-gradient(90deg,#D6452F 0 25%,#F2B632 25% 50%,#2F6FB5 50% 75%,#3F9B5A 75%)}.w{padding:34px 50px}
h1{font-family:'DM Serif Display';font-weight:400;font-size:38px;margin:0 0 4px;color:#D6452F}.sub{color:#5a544b;font-weight:600;margin-bottom:18px}
h2{font-size:16px;margin:18px 0 6px}.box{background:#fff;border-radius:14px;padding:12px 20px;box-shadow:0 4px 14px rgba(0,0,0,.06)}ol,ul{margin:4px 0;padding-left:20px;line-height:1.6}
.warn{background:#FFF6D6;border:1px solid #E4DCCB}.ok span{display:inline-block;background:#E3EFE6;border-radius:99px;padding:3px 10px;margin:3px 4px 3px 0;font-weight:700}.ok span.no{background:#F6DAD6}
code{background:#eee;padding:1px 5px;border-radius:4px}.f{margin-top:18px;font-size:11px;color:#8a8378}</style></head><body><div class="s"></div><div class="w">
<h1>Welcome to Christmas HQ! 🎄</h1><div class="sub">Your Christmas planner app · The Geek Next Door Co.</div>
<div class="box ok"><b>Works on:</b> <span>✓ Windows</span><span>✓ Mac</span><span>✓ Chromebook</span><span>✓ Android (Chrome)</span><span class="no">✗ iPhone &amp; iPad</span><br>
Open it in Chrome, Edge, Safari or Firefox. No account, no installing, no subscription.</div>
<h2>1. Open it on your computer</h2><div class="box"><ol><li>Unzip the download (double-click it on most computers).</li><li>Move <code>Christmas-HQ.html</code> somewhere safe, like your <b>Documents</b> folder.</li><li>Double-click it. It opens in your web browser and you're ready to go!</li><li>Tip: bookmark it in your browser so it's one click away.</li></ol></div>
<h2>2. Getting started</h2><div class="box"><ol><li>Go to <b>Settings</b>: add your family name and choose your currency and theme.</li><li>Add your <b>People</b> and a budget for each.</li><li>Add <b>Gifts</b>. Tap a gift's status to move it along: Idea → To buy → Bought → Wrapped → Given.</li><li>Want a look around first? <b>Settings → Load the sample family</b>, then clear it when you're ready.</li></ol></div>
<h2>3. Keeping your list safe</h2><div class="box warn"><ul><li>Your list saves automatically <b>in the browser on this device</b>. Nothing is uploaded anywhere.</li>
<li>Always open the file from the <b>same place</b>, in the <b>same browser</b>. Private / incognito windows won't save.</li>
<li>Clearing your browser's history or site data can delete your list, so use <b>Settings → Download backup</b> every now and then.</li>
<li>Moving to another computer? Download a backup, then use <b>Restore backup</b> on the new one.</li></ul></div>
<h2>4. Handy extras</h2><div class="box"><ul><li><b>Little eyes nearby?</b> Press <b>Esc twice</b> (or tap the logo three times) and it hides behind a mince pie recipe. Tap the recipe to come back.</li>
<li><b>PIN lock:</b> set a 4-digit PIN in Settings so the kids can't peek.</li><li><b>Gift tags:</b> pick a design and press Print Tags.</li><li><b>Excel / Google Sheets:</b> Settings → Export gifts (CSV).</li></ul></div>
<h2>Need help?</h2><div class="box">Message me on Etsy and I'll help straight away. If you're enjoying Christmas HQ, a review would mean the world to a small shop. ⭐</div>
<div class="f">For personal use only. Please don't share or resell this file. © The Geek Next Door Co.</div></div></body></html>"""
h = out[:-4] + ".html"; open(h, "w").write(page)
js = "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.argv[2]);await p.waitForLoadState('networkidle');await p.pdf({path:process.argv[3],format:'A4',printBackground:true});await b.close()})();"
jf = out[:-4] + ".js"; open(jf, "w").write(js); subprocess.run(["node", jf, h, out], check=True); os.remove(h); os.remove(jf)
