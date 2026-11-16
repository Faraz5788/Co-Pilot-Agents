"""Builds Umrah Companion from template.html + the content_*.py / z_*.py files.
   ../preview/umrah-companion.html  full app as an Artifact page (private preview)
   ../dist/Umrah-Companion.html     full offline file (sold in the Etsy zip)
   ../site/                         website: free demo + unlock code, installable on iPhone/Android
   ../demo/artifact.html            demo-only page as an Artifact
Usage: python3 build.py [etsy_listing_url]"""
import json, sys, os, re, hashlib, subprocess
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here); os.chdir(here)
from content_ui import LANGS, UI
from content_duas import DUAS, CATS
from content_steps import STEPS, MADINAH, CHECK
from z_makkah import MAKKAH
from z_madinah import MADINAH_Z
from content_phrases import PHRASES, PCATS, NUMBERS, PUI
from content_licence import LUI
UI.update(PUI); UI.update(LUI)
import content_pron; content_pron.apply(DUAS, PHRASES)
ZIYARAT = [dict(z, city="makkah") for z in MAKKAH] + [dict(z, city="madinah") for z in MADINAH_Z]
langs = [l[0] for l in LANGS]
URL = sys.argv[1] if len(sys.argv) > 1 else "https://thegeeknextdoorco.etsy.com"
CODE = "LABBAYK-7Q2M"                     # printed in the buyer guide PDF
H = hashlib.sha256(CODE.encode()).hexdigest()

# sanity: every translated block has all 7 languages
def check(obj, path):
    if isinstance(obj, dict) and set(obj.keys()) >= {"en", "ur"} and all(isinstance(v, (str, list)) for v in obj.values()):
        miss = [l for l in langs if l not in obj]
        if miss and not path.endswith(".note"): print("MISSING", path, miss)
    elif isinstance(obj, dict): [check(v, f"{path}.{k}") for k, v in obj.items()]
    elif isinstance(obj, list): [check(v, f"{path}[{i}]") for i, v in enumerate(obj)]
check({"UI": UI, "DUAS": DUAS, "CATS": CATS, "STEPS": STEPS, "MADINAH": MADINAH, "CHECK": CHECK, "ZIYARAT": ZIYARAT, "PHRASES": PHRASES, "PCATS": PCATS}, "root")
ids = {d["id"] for d in DUAS}
for s in STEPS + MADINAH:
    for i in s["duas"]: assert i in ids, i

data = json.dumps({"LANGS": LANGS, "UI": UI, "DUAS": DUAS, "CATS": CATS, "STEPS": STEPS, "MADINAH": MADINAH, "ZIYARAT": ZIYARAT, "CHECK": CHECK, "PHRASES": PHRASES, "PCATS": PCATS, "NUMBERS": NUMBERS}, ensure_ascii=False)
tpl = open("template.html").read().replace("/*DATA*/", data)
def make(mode): return tpl.replace("__MODE__", mode).replace("__ETSY_URL__", URL).replace("__CODE_HASH__", H)

def full_doc(art, extra_head=""):
    """Artifact page -> standalone HTML document."""
    art = art.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
    cut = art.index("<style>")
    head, body = art[:cut], art[cut:]
    return ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            + head + extra_head + "\n</head><body>\n" + body + "\n</body></html>\n")

out = lambda *p: os.path.join(here, "..", *p)
for d in ("preview", "dist", "site", "demo"): os.makedirs(out(d), exist_ok=True)
open(out("preview", "umrah-companion.html"), "w").write(make("preview"))
open(out("demo", "artifact.html"), "w").write(make("demo"))
open(out("dist", "Umrah-Companion.html"), "w").write(full_doc(make("file")))

PWA = ('<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png">'
       '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
       '<meta name="apple-mobile-web-app-title" content="Umrah"><meta name="theme-color" content="#1D6B51">'
       '<meta name="description" content="Umrah Companion: step-by-step Umrah guide, Tawaf and Sa\'i counters, duas in Arabic with translation, Madinah guide, ziyarat and Arabic phrases in 7 languages. Try the free demo.">')
site = full_doc(make("web"), PWA).replace("</body>", "<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});</script>\n</body>")
open(out("site", "index.html"), "w").write(site)
open(out("site", "manifest.webmanifest"), "w").write('{"name":"Umrah Companion","short_name":"Umrah","start_url":"./","display":"standalone","background_color":"#F5EFE2","theme_color":"#1D6B51",'
    '"icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]}')
ver = hashlib.sha256(site.encode()).hexdigest()[:8]     # new cache name whenever the app changes
open(out("site", "sw.js"), "w").write(f"""const C = "umrah-{ver}";
self.addEventListener("install", e => {{ e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"]))); self.skipWaiting(); }});
self.addEventListener("activate", e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); self.clients.claim(); }});
self.addEventListener("fetch", e => {{ const r = e.request; if (r.method !== "GET") return;
  e.respondWith(fetch(r).then(res => {{ if (res.ok || res.type === "opaque") {{ const copy = res.clone(); caches.open(C).then(c => c.put(r, copy)); }} return res; }}).catch(() => caches.match(r).then(m => m || caches.match("./index.html")))); }});
""")
open(out("site", "robots.txt"), "w").write("User-agent: *\nAllow: /\n")
open(out("site", "netlify.toml"), "w").write('[build]\n  publish = "."\n  command = ""\n\n[[headers]]\n  for = "/sw.js"\n  [headers.values]\n    Cache-Control = "no-cache"\n')
if not os.path.exists(out("site", "icon-512.png")):
    subprocess.run(["node", "icons.js", out("site")], check=True)
print("built preview/, dist/, site/, demo/ ·", len(DUAS), "duas ·", len(ZIYARAT), "places ·", len(PHRASES), "phrases · unlock code", CODE)
