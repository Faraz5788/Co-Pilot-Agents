#!/bin/bash
# shots.sh <shots.xlsx> <out_dir> <name1> <name2> ... : render each visible sheet to a cropped PNG
set -e
X=/root/.claude/skills/synced/68c469eb-178f-462f-ab3c-75c10ae2692c_f447db75-f497-4f6f-af70-ccfe1ea90a7b/xlsx
IN=$(readlink -f "$1"); OUT=$(readlink -f "$2"); shift 2; mkdir -p "$OUT"; cd "$OUT"
python3 $X/scripts/recalc.py "$IN" 180 >/dev/null
python3 $X/scripts/office/soffice.py --headless --convert-to pdf --outdir "$OUT" "$IN" >/dev/null 2>&1
B=$(basename "$IN" .xlsx); pdftoppm -r 300 -png "$B.pdf" _pg 2>/dev/null
python3 - "$@" <<'PY'
import sys, glob
from PIL import Image, ImageChops
for f, n in zip(sorted(glob.glob("_pg-*.png")), sys.argv[1:]):
    im = Image.open(f).convert("RGB"); im.crop(ImageChops.difference(im, Image.new("RGB", im.size, "white")).getbbox()).save(n + ".png")
PY
rm -f _pg-*.png "$B.pdf"; ls
