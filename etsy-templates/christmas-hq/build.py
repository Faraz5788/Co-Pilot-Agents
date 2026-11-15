"""Builds Christmas HQ: python3 build.py [etsy_listing_url]  ->  dist/Christmas-HQ.html (full) + demo/index.html (demo)"""
import sys, os
here = os.path.dirname(os.path.abspath(__file__)); src = open(os.path.join(here, "app.html")).read()
url = sys.argv[1] if len(sys.argv) > 1 else "https://thegeeknextdoorco.etsy.com"
os.makedirs(os.path.join(here, "dist"), exist_ok=True); os.makedirs(os.path.join(here, "demo"), exist_ok=True)
open(os.path.join(here, "dist", "Christmas-HQ.html"), "w").write(src.replace("__DEMO__", "false").replace("__ETSY_URL__", url))
open(os.path.join(here, "demo", "index.html"), "w").write(src.replace("__DEMO__", "true").replace("__ETSY_URL__", url))
# artifact preview: same demo, without the document wrapper (the viewer adds its own)
import re
demo = src.replace("__DEMO__", "true").replace("__ETSY_URL__", url)
head = re.search(r"<head>(.*?)</head>", demo, re.S).group(1)
head = re.sub(r'<meta charset[^>]*>|<meta name="viewport"[^>]*>', "", head).replace("<title>Christmas HQ · The Geek Next Door Co.</title>", "<title>Christmas HQ</title>")
body = re.search(r"<body>(.*?)</body>", demo, re.S).group(1)
open(os.path.join(here, "demo", "artifact.html"), "w").write(head.strip() + "\n" + body.strip())
print("built full + demo + artifact")
