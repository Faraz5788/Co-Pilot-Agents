# The Geek Next Door Co. product roadmap

Inspired by inDeoDesignStudio (103 listings, 13.8k sales). Our angle: **UK-first** (£, UK tax year, HMRC, Vinted, Royal Mail) and templates that **work in both Excel and Google Sheets**.

## Shop sections (set these up in Shop Manager → Listings → Sections)
1. Christmas & Seasonal
2. Personal Finance
3. Small Business
4. Goals & Habits
5. Home & Family
6. Travel & Events
7. Students
8. Bundles

## Done
| # | Product | Section | Price | Status |
|---|---------|---------|-------|--------|
| 1 | Ultimate Christmas Organiser | Christmas & Seasonal | £7.99 | Live |
| 2 | Monthly Budget Planner | Personal Finance | £4.99 | Built, needs photos |
| 3 | Ultimate Trip Planner | Travel & Events | £4.99 | Built, needs photos |
| 4 | UK Sole Trader Bookkeeping | Small Business | £6.99 | Ready to list |
| 5 | Reseller Profit Tracker (Vinted/eBay) | Small Business | £4.99 | Ready to list |
| 6 | 2027 Goals & Habit Tracker | Goals & Habits | £4.99 | Ready to list |

## Next batches, ordered by season
**Batch 2: New Year money (list by early December)**
- Debt Payoff Tracker (snowball and avalanche)
- Savings Challenges & Sinking Funds (incl. 1p-a-day challenge)
- Monthly Bill & Subscription Tracker
- 2027 Annual Budget Planner (12 months in one file, built from the Monthly Budget Planner)
- Christmas Gift Tracker only (a cheaper single item split from the Organiser, £3.99)

**Batch 3: Small business (January, Self Assessment season)**
- Etsy Seller Profit & Fee Calculator (UK)
- Invoice Generator & Tracker
- Client / CRM Tracker
- Small Business Inventory & Stock Tracker
- Social Media Content Planner
- Small Business Bundle (sole trader, invoices, CRM, content planner)

**Batch 4: Home & family (January to March)**
- Meal Planner & Shopping List
- Weekly Cleaning Schedule
- Chore Chart for Kids
- Family Calendar / Year at a Glance with UK bank holidays
- Home Maintenance & Bills Log
- Password & Account Organiser

**Batch 5: Life events (spring)**
- Wedding Planner & Budget
- Baby Planner / Feeding & Sleep Tracker
- House Move Checklist
- Holiday Packing List (stand-alone)
- Birthday Party Planner

**Batch 6: Health & students (all year)**
- Fitness & Workout Log
- Weight Loss Tracker
- Period / Cycle Tracker
- Reading Log & Book Tracker
- University Assignment Tracker (UK terms)
- GCSE / A-Level Revision Planner

**Bundles** (each sells better than its parts): Personal Finance Bundle, Small Business Bundle, Home Organisation Bundle.

## Lessons from inDeo to copy
- Lots of products, each a separate listing catching different searches. Variations of a hit (such as three habit trackers for different audiences) are fine.
- Long, keyword-rich titles (Etsy allows only one each of `& % :`).
- Bundles at 3–4× the single price.
- Reply to every review, quickly and personally.
- Offer "custom spreadsheets" as a service once you have reviews.
- Build an email list and Instagram later.

## Not copying
- A permanent "75% off" with inflated "original" prices. This risks breaking UK pricing rules. Run genuine, time-limited sales instead (e.g. 20% off for a launch week or Black Friday).

## How new products are made (factory/)
- `common.py`: shared house style (colours, fonts, yellow input cells, Start Here tab)
- `<product>.py <out.xlsx> <shots.xlsx>`: builds the template plus a copy set up for screenshots
- `shots.sh <shots.xlsx> <dir> names…`: renders each tab to a PNG
- `photos.py <config.json> <shots_dir> <out_dir>`: renders the 3000×2250 listing photos
- `listings.py <listings.json> <out_dir>`: writes listing copy and checks Etsy's title and tag rules
