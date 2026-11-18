"""Buyer guide PDF for Christmas HQ: python3 howto_hq.py <out.pdf>"""
import sys, os, subprocess
out = os.path.abspath(sys.argv[1])
page = """<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:0}body{margin:0;font-family:Inter,sans-serif;color:#1F1D1A;background:#F7F3EA;font-size:11.5px}
.s{height:12px;background:linear-gradient(90deg,#D6452F 0 25%,#F2B632 25% 50%,#2F6FB5 50% 75%,#3F9B5A 75%)}.w{padding:26px 44px}
h1{font-family:'DM Serif Display';font-weight:400;font-size:38px;margin:0 0 4px;color:#D6452F}.sub{color:#5a544b;font-weight:600;margin-bottom:18px}
h2{font-size:14.5px;margin:12px 0 5px}.box{background:#fff;border-radius:14px;padding:12px 20px;box-shadow:0 4px 14px rgba(0,0,0,.06)}ol,ul{margin:3px 0;padding-left:20px;line-height:1.5}
.warn{background:#FFF6D6;border:1px solid #E4DCCB}.ok span{display:inline-block;background:#E3EFE6;border-radius:99px;padding:3px 10px;margin:3px 4px 3px 0;font-weight:700}.ok span.no{background:#F6DAD6}
code{background:#eee;padding:1px 5px;border-radius:4px}.f{margin-top:18px;font-size:11px;color:#8a8378}</style></head><body><div class="s"></div><div class="w">
<h1>Welcome to Christmas HQ! 🎄</h1><div class="sub">Your Christmas planner app · The Geek Next Door Co.</div>
<div class="box ok"><b>Works on every device:</b> <span>✓ iPhone &amp; iPad</span><span>✓ Android</span><span>✓ Windows</span><span>✓ Mac</span><span>✓ Chromebook</span><br>
<b>Your unlock code: <span style="background:#FFF6D6;border:1px dashed #C9A227;font-size:15px;letter-spacing:1px">MERRY-GEEK-7K4P</span></b></div>
<h2>On your phone or tablet (recommended for iPhone &amp; iPad)</h2><div class="box"><ol><li>Open <b>christmas-hq-geek.netlify.app</b> in Safari (iPhone/iPad) or Chrome (Android).</li>
<li>Tap <b>I have a code</b>, type <b>MERRY-GEEK-7K4P</b> and tap Unlock.</li><li>iPhone/iPad: tap the <b>Share</b> button → <b>Add to Home Screen</b>. Android: tap ⋮ → <b>Add to Home screen</b>.</li>
<li>Christmas HQ now has its own app icon and works offline. Your list stays private on your phone.</li></ol></div>
<h2>On your computer</h2><div class="box"><ol><li>Unzip the download (double-click it on most computers).</li><li>Move the whole <b>Christmas HQ</b> folder somewhere safe, like <b>Documents</b> (keep the <b>printables</b> folder next to the app).</li><li>Double-click it. It opens in your web browser and you're ready to go!</li><li>Or use the website on your computer too, with the same code.</li></ol></div>
<h2>Getting started</h2><div class="box"><ol><li>Go to <b>Settings</b>: add your family name and choose your currency and theme.</li><li>Add your <b>People</b> and a budget for each.</li><li>Add <b>Gifts</b>. Tap a gift's status to move it along: Idea → To buy → Bought → Wrapped → Given.</li><li>Want a look around first? <b>Settings → Load the sample family</b>, then clear it when you're ready.</li></ol></div>
<h2>Keeping your list safe</h2><div class="box warn"><ul><li>Your list saves automatically <b>in the browser on this device</b>. Nothing is uploaded anywhere.</li>
<li>Always use the <b>same browser</b> on the <b>same device</b> (and open the file from the same place). Private / incognito windows won't save.</li>
<li>Clearing your browser's history or site data can delete your list, so use <b>Settings → Download backup</b> every now and then.</li>
<li>Moving to another computer? Download a backup, then use <b>Restore backup</b> on the new one.</li></ul></div>
<h2>Handy extras</h2><div class="box"><ul><li><b>Little eyes nearby?</b> Tap <b>🙈 Hide</b> on your phone, or press <b>Esc twice</b> on a computer, and it hides behind a mince pie recipe.</li><li><b>Kids' printables:</b> the colouring book and activity pack are in the <b>Printables</b> tab (and the printables folder).</li>
<li><b>PIN lock:</b> set a 4-digit PIN in Settings so the kids can't peek.</li><li><b>Gift tags:</b> pick a design and press Print Tags.</li><li><b>Excel / Google Sheets:</b> Settings → Export to Excel, or Import from a spreadsheet.</li></ul></div>
<h2>Need help?</h2><div class="box">Message me on Etsy and I'll help straight away. If you're enjoying Christmas HQ, a review would mean the world to a small shop. ⭐</div>
<div class="f">For personal use only. Please don't share or resell this file. © The Geek Next Door Co.</div></div></body></html>"""
h = out[:-4] + ".html"; open(h, "w").write(page)
js = "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.argv[2]);await p.waitForLoadState('networkidle');await p.pdf({path:process.argv[3],format:'A4',printBackground:true});await b.close()})();"
jf = out[:-4] + ".js"; open(jf, "w").write(js); subprocess.run(["node", jf, h, out], check=True); os.remove(h); os.remove(jf)
