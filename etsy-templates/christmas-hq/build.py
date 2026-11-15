"""Builds Christmas HQ from app.html:
   dist/Christmas-HQ.html  full offline file (sold in the Etsy zip)
   site/                   website: free demo + unlock code, installable on iPhone/Android (Add to Home Screen)
   demo/artifact.html      demo-only preview page
Usage: python3 build.py [etsy_listing_url]"""
import sys, os, re, hashlib, shutil
here = os.path.dirname(os.path.abspath(__file__)); src = open(os.path.join(here, "app.html")).read()
url = sys.argv[1] if len(sys.argv) > 1 else "https://thegeeknextdoorco.etsy.com"
CODE = "MERRY-GEEK-7K4P"            # printed in the buyer guide PDF
H = hashlib.sha256(CODE.encode()).hexdigest()
def make(mode, pwa=""):
    return src.replace("__MODE__", mode).replace("__ETSY_URL__", url).replace("__CODE_HASH__", H).replace("<!--PWA-->", pwa)
for d in ("dist", "demo", "site"): os.makedirs(os.path.join(here, d), exist_ok=True)
open(os.path.join(here, "dist", "Christmas-HQ.html"), "w").write(make("file"))
PWA = ('<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png">'
       '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
       '<meta name="apple-mobile-web-app-title" content="Christmas HQ"><meta name="theme-color" content="#F7F3EA">'
       '<meta name="description" content="Christmas HQ: plan gifts, budgets, Secret Santa and gift tags in one app. Try the free demo.">')
site = make("web", PWA).replace("</body>", "<script>if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});</script>\n</body>")
open(os.path.join(here, "site", "index.html"), "w").write(site)
open(os.path.join(here, "site", "manifest.webmanifest"), "w").write('{"name":"Christmas HQ","short_name":"Christmas HQ","start_url":"./","display":"standalone","background_color":"#F7F3EA","theme_color":"#F7F3EA",'
    '"icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]}')
open(os.path.join(here, "site", "sw.js"), "w").write("""const C = "christmas-hq-v2";
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-180.png"]))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => { const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(C).then(c => c.put(r, copy)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("./index.html")))); });
""")
open(os.path.join(here, "site", "robots.txt"), "w").write("User-agent: *\nAllow: /\n")
up = os.path.join(here, "..", "etsy-uploads")
PF = "printables-" + hashlib.sha256(("pdf:" + CODE).encode()).hexdigest()[:16]   # only reachable by people who have the code
for d in os.listdir(os.path.join(here, "site")):
    if d.startswith("printables"): shutil.rmtree(os.path.join(here, "site", d))
os.makedirs(os.path.join(here, "site", PF), exist_ok=True)
for f in ("Christmas-Colouring-Book-A4.pdf", "Christmas-Colouring-Book-Letter.pdf", "Christmas-Activity-Pack-A4.pdf", "Christmas-Activity-Pack-Letter.pdf"):
    shutil.copy(os.path.join(up, f), os.path.join(here, "site", PF, f))
demo = make("demo")
head = re.search(r"<head>(.*?)</head>", demo, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>|<meta name="viewport"[^>]*>', "", head).replace("<title>Christmas HQ · The Geek Next Door Co.</title>", "<title>Christmas HQ</title>")
body = re.search(r"<body>(.*?)</body>", demo, re.S).group(1)
open(os.path.join(here, "demo", "artifact.html"), "w").write(head.strip() + "\n" + body.strip())
if os.path.exists(os.path.join(here, "demo", "index.html")): os.remove(os.path.join(here, "demo", "index.html"))
print("built: dist/Christmas-HQ.html, site/, demo/artifact.html · unlock code", CODE)
