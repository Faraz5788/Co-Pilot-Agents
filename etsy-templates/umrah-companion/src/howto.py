"""Buyer guide PDF for Umrah Companion: python3 howto.py <out.pdf> <site host>"""
import sys, os, subprocess
out = os.path.abspath(sys.argv[1]); SITE = sys.argv[2] if len(sys.argv) > 2 else "umrah-companion-geek.netlify.app"
CODE = "LABBAYK-7Q2M"
page = f"""<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
<style>@page{{size:A4;margin:0}}body{{margin:0;font-family:Inter,sans-serif;color:#1E1C18;background:#F5EFE2;font-size:11.5px}}
.s{{height:14px;background:#1D6B51}}.w{{padding:24px 44px}}.ar{{font-family:Amiri,serif;color:#B8901F;font-size:24px}}
h1{{font-family:'DM Serif Display';font-weight:400;font-size:38px;margin:0 0 4px;color:#1D6B51}}.sub{{color:#5a544b;font-weight:600;margin-bottom:16px}}
h2{{font-size:14.5px;margin:12px 0 5px;color:#1D6B51}}.box{{background:#FFFCF6;border-radius:14px;padding:12px 20px;box-shadow:0 4px 14px rgba(0,0,0,.06)}}ol,ul{{margin:3px 0;padding-left:20px;line-height:1.5}}
.warn{{background:#F6EFD9;border:1px solid #E5DAC4}}.ok span{{display:inline-block;background:#E1EEE7;border-radius:99px;padding:3px 10px;margin:3px 4px 3px 0;font-weight:700}}
.code{{display:inline-block;background:#F6EFD9;border:1px dashed #B8901F;font-size:16px;letter-spacing:1px;padding:4px 12px;border-radius:8px;font-weight:800}}.f{{margin-top:16px;font-size:10.5px;color:#8a8378}}</style></head><body><div class="s"></div><div class="w">
<div class="ar">السَّلَامُ عَلَيْكُمْ</div><h1>Welcome to Umrah Companion</h1><div class="sub">Your step-by-step Umrah guide app · The Geek Next Door Co.</div>
<div class="box ok"><b>Works on every device:</b> <span>✓ iPhone &amp; iPad</span><span>✓ Android</span><span>✓ Windows</span><span>✓ Mac</span><span>✓ Chromebook</span><br>
<b>Languages:</b> English · اردو · हिन्दी · বাংলা · Filipino · Türkçe · Bahasa Indonesia<br><br>
<b>Your unlock code:</b> <span class="code">{CODE}</span></div>
<h2>On your phone (recommended: take it with you on your journey)</h2><div class="box"><ol><li>Open <b>{SITE}</b> in Safari (iPhone/iPad) or Chrome (Android).</li>
<li>Choose your language, tap <b>I have a code</b>, type <b>{CODE}</b> and tap Unlock.</li><li>iPhone/iPad: tap the <b>Share</b> button → <b>Add to Home Screen</b>. Android: tap ⋮ → <b>Add to Home screen</b>.</li>
<li>Umrah Companion now has its own app icon. <b>Open it once while you have internet</b>, and after that it works offline, even in the Haram with no signal.</li></ol></div>
<h2>On your computer</h2><div class="box"><ol><li>Unzip the download (double-click it on most computers).</li><li>Double-click <b>Umrah-Companion.html</b>. It opens in your web browser and is fully unlocked, no code needed.</li><li>Great for learning the duas and planning at home before you travel.</li></ol></div>
<h2>Getting started</h2><div class="box"><ol><li>On <b>Home</b>, add your Umrah date to see the countdown.</li><li>Read <b>Umrah Steps</b> before you go and tick each step as you do it.</li>
<li>During Tawaf and Sa'i, open the <b>counters</b> and tap the big button after each round. Sa'i shows which way to walk next.</li>
<li>Tap ☆ on any dua to save it to <b>Favourites</b>. In Settings you can make the Arabic bigger and turn the pronunciation on or off.</li>
<li>Use the <b>Checklist</b> for packing, and <b>Arabic Phrases</b> for taxis, shops and finding your way.</li></ol></div>
<h2>Good to know</h2><div class="box warn"><ul><li>Your progress, favourites and checklist save <b>on your device only</b>. Nothing is uploaded and there's no account.</li>
<li>Use the <b>same browser</b> on the same device. Private / incognito windows won't save.</li>
<li>Practices can differ between schools of thought. If you are unsure about anything, ask a scholar you trust.</li></ul></div>
<h2>Need help?</h2><div class="box">Message me on Etsy and I'll help straight away. May Allah accept your Umrah. If the app helps you, a review would mean the world to a small shop. ⭐</div>
<div class="f">For personal use only. Please don't share or resell this file or your code. © The Geek Next Door Co.</div></div></body></html>"""
h = out[:-4] + ".html"; open(h, "w").write(page)
js = "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.argv[2]);await p.waitForLoadState('networkidle');await p.pdf({path:process.argv[3],format:'A4',printBackground:true});await b.close()})();"
jf = out[:-4] + ".js"; open(jf, "w").write(js); subprocess.run(["node", jf, h, out], check=True); os.remove(h); os.remove(jf)
