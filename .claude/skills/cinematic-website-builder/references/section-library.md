# Section Library

Patterns for building a page one band at a time. Each entry gives the layout, the motion (with a recipe number from `motion-techniques.md`) and the mobile behaviour. Put your chosen sections into the blueprint's §5.

---

## Heroes

| Pattern | Layout | Motion | Mobile |
|---|---|---|---|
| **Eyebrow stack** | Eyebrow pill → H1 on 2–3 manually broken lines → one support line at 60% → primary pill CTA + ghost link. Left-aligned or centred. | H1 masked line reveal (#3); support and CTAs rise (#2); optional shader behind (#11) | Same stack, H1 at clamp min |
| **Product teardown** | Pinned canvas at full viewport; H1 split around the object; chapter copy in a corner | Frame sequence (#4) with chapters and anchored callouts | Shorter pin, portrait frames |
| **Footage bleed** | Full-bleed scrubbed video; H1 bottom-left at 10–12vw; mono meta top-right | Scrubbed video (#5) | Native autoplay muted loop with a poster; no scrub |
| **Oversized type** | The name fills the width (font-size in vw), bleeding off the edges; small caption and CTA tucked into a corner | Letters rise with a stagger; velocity skew (#8 variant) | Wraps to 2 lines, still edge to edge |
| **Tilted product UI** | H1 left, product screenshot frame below at `rotateX(12deg)` | The tilt scrubs to 0 while the frame scales 0.92→1 | No tilt |
| **3D scene** | Canvas centre-right, H1 left, a mono readout following the cursor | Scroll camera or morph (#12) | A static render image replaces the canvas below 768px |

Hero rules: one primary action. The H1 names the specific thing. The LCP is visible on the first frame.

## Social proof and marquees
- **Logo marquee**: two rows running in opposite directions at 32s and 38s, masked edges, logos monochrome at 50% opacity. (#8)
- **Stack ticker**: mono text items separated by `✦`, one row only.
- **Number band**: 3–4 stats in huge display type with mono labels. Numbers count up once when in view (`gsap.from(obj,{val:0, snap:{val:1}})`).

## Features
- **Bento grid**: a 12-col grid with uneven spans (7/5, 4/4/4, 5/7). Cards on a 1px hairline, radius from the blueprint, no shadow. One card holds real product media and the rest are text. Hover is `translateY(-4px)` over 500ms. (#2)
- **Sticky split**: a sticky left column (title plus a progress index) and scrolling feature blocks on the right. The active block's index takes the accent colour.
- **Pinned chapters**: see #6. Best for 3–5 sequential ideas.
- **Numbered list**: `01`–`04` in mono accent, with a one-line headline and 2-line body each, separated by hairline rows. Plain and effective.

Avoid: the 3-icon row of "Fast / Secure / Scalable".

## Galleries and showcases
- **Horizontal pinned strip** (#7), with counter-parallax inside each card
- **Unclip grid**: images reveal by clip-path (#9) in an off-grid, staggered layout
- **Hover-preview list**: a text list of projects, where hovering shows a floating image that follows the cursor (`quickTo`)
- **3D carousels** (ring, arc, fan deck): only use one when the subject is visual, and keep it to one per page

## Testimonials
- **Single big quote**: one quote in display type (clamp 1.8–3rem), with the name and role in mono. It beats a wall of 9 cards.
- **Quote marquee**: slow single row of cards, pausing on hover.

## Pricing
- **Tier cards**: 2–3 columns. The recommended tier is marked by an accent border or label, not by making it larger. Prices are in display type, and feature lists are left-aligned with hairline separators.
- A monthly/annual toggle animates the price digits with a vertical roll (`yPercent`).

## CTA bands
- **Full-bleed statement**: a huge headline, one button, and the shader or image from the hero reused to bookend the page
- **Capture**: the headline plus an inline pill email field and button, with a mono privacy note underneath

## Footers
- **Wordmark bleed**: the brand name set at ~20vw along the bottom edge, partially cut off by the viewport. Links in 3–4 mono columns above it.
- **Contact column**: large email address as a link, social links, and local time for the studio's city (updated live)
- A footer never needs animation beyond a single reveal

## Navigation
- Fixed, 64px, transparent over the hero. Once past the hero it gains a `backdrop-filter: blur(12px)` over a surface at 70% alpha (this is the one place blur is allowed).
- It hides on scroll down and shows on scroll up (`ScrollTrigger.create({onUpdate: s => nav.classList.toggle('hide', s.direction === 1)})`).
- On mobile, a full-screen overlay menu whose links rise with a stagger.

## Page recipes (starting points)
- **Product launch**: Product teardown hero → Stack ticker → Pinned chapters → Bento → Single big quote → Tier pricing → Full-bleed CTA → Wordmark footer
- **SaaS**: Eyebrow stack + shader → Logo marquee → Tilted product UI → Sticky split features → Number band → Pricing → Capture CTA → Footer
- **Portfolio/studio**: Oversized type hero → Hover-preview list → Horizontal strip → Big quote → Contact column footer
- **Hospitality/travel**: Footage bleed hero → Unclip grid → Horizontal strip → Booking CTA → Wordmark footer
