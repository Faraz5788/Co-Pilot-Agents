"""Writes Etsy listing copy and checks it against Etsy's title/tag rules."""
import json, sys, os
L = json.load(open(sys.argv[1])); out = sys.argv[2]
for p in L:
    t = p["title"]; tags = p["tags"]
    assert len(t) <= 140, (t, len(t))
    for ch in "%&:": assert t.count(ch) <= 1, (t, ch)
    assert len(tags) == 13 and all(len(x) <= 20 for x in tags), [x for x in tags if len(x) > 20]
    md = f"""# Etsy listing: {p['name']}

## Photos
Folder `listing-photos/{p['photos']}/`: upload `listing-01.png` first (it's the thumbnail), then the rest in order.

## Title ({len(t)}/140)
{t}

## Details
- Type: **Digital** · Who made it: **I did** · What is it: **A finished product**
- Category: {p['category']}
- Price: **£{p['price']}** · Quantity: **999**
- Digital file: `{p['file']}`
- Shop section: **{p['section']}**

## Tags
{', '.join(tags)}

## Description

{p['description'].strip()}

━━━━━━━━━━━━━━━━━━
HOW IT WORKS
━━━━━━━━━━━━━━━━━━
1. Buy and download your file from your Etsy Purchases page.
2. Open it in Microsoft Excel, or upload it to Google Drive and open it with Google Sheets (free with a Google account).
3. Type in the pale yellow cells. Everything else calculates automatically.

━━━━━━━━━━━━━━━━━━
PLEASE NOTE
━━━━━━━━━━━━━━━━━━
• This is a DIGITAL DOWNLOAD. No physical item will be posted.
• You'll need Microsoft Excel or a free Google account. It won't work fully in Apple Numbers.
• Because it's a digital file I can't offer refunds, but if anything isn't working please message me and I'll help straight away.
• For personal use only. Please don't share or resell the file.
{p.get('extra_note','')}
Questions? Send me a message. I'm happy to help.

Made with ♥ by The Geek Next Door Co.
"""
    open(os.path.join(out, f"listing-{p['photos']}.md"), "w").write(md)
    print(f"OK  {p['name']}: title {len(t)} chars, 13 tags")
