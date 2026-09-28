# Art Directions

Ten directions, all fully specified. Pick one, then adapt the palette and subject. Every direction sets its own ban list on top of the global list in `anti-ai-tells.md`.

Fonts listed are on Google Fonts or free to use unless noted. Where a font might need a licence, a free alternative is given.

---

## 1. Obsidian Instrument
*Luxury hardware: watches, audio, cameras, EVs.*
- Ground `#0A0A0B`, surface `#121214`, hairline `rgba(255,255,255,0.08)`, text `#EDEDED` / 55%
- Accent `#C9A66B` (brushed brass). Used only on the CTA, the active chapter index and the price.
- Type: Display **Inter Tight** 600, tracking -0.04em; labels **JetBrains Mono** 11px uppercase +0.12em
- Texture: grain at 3.5%. Radius 0 on media, 999px on buttons.
- Motion signature: a **scroll-scrubbed canvas frame sequence** of the product coming apart and going back together over 4 pinned chapters, with hairline callouts anchored to points in the source frame.
- Hero: the product centred on black. The H1 is split left and right of the object.
- Ban: gradients of any kind, and any colour other than brass.

## 2. Tidewater
*SaaS, infrastructure, dev tools that want to feel calm.*
- Ground `#07080A`, surface `#0C0F12`, hairline `#1B1C1E`, text `#F3F5F8` / `#9AA2AD`
- Accent `#5FB3D9` (sea glass), plus a deep `#0B141B` button fill with a `#1D4560` border
- Type: Display **Bricolage Grotesque** 600, tracking -0.035em; body **Inter** 400 at 17px; mono **Space Mono**
- Texture: a slow mesh-gradient shader behind the hero at 40% opacity, masked to fade into the ground
- Motion signature: two counter-running tech-logo marquees with masked edges. The feature cards rise 16px with a 60ms stagger.
- Hero: an eyebrow pill ("New — …"), a 3-line H1, one line of supporting copy at 60%, one pill CTA plus a ghost link
- Ban: purple, glass panels, 3-icon feature rows

## 3. Paper Atelier
*Editorial, studios, architecture, publishing.*
- Ground `#F2EFE8` (warm paper), text `#161513` / 62%, hairline `#161513` at 12%
- Accent `#D2462A` (vermilion), used for the index numbers and the one CTA only
- Type: Display **Instrument Serif** 400 italic for emphasis words, with **Inter Tight** 500 for everything else; H1 up to 9rem
- Texture: none. Rely on the whitespace and the grid.
- Motion signature: text lines reveal from behind a mask (a yPercent 100→0 clip). Images unclip from inset(8%) to inset(0) as they scroll in.
- Hero: an oversized H1 bleeding off the left edge, a small caption top-right, and an image placed off-grid
- Ban: rounded cards, drop shadows, dark mode

## 4. Ember Forge
*Energy, industrial, motorsport, knives, spirits.*
- Ground `#0B0806`, surface `#15100C`, text `#F4EDE4`
- Accent `#FF5A1F` (molten), plus a secondary `#FFB547` used only on hover glow
- Type: Display **Archivo** 800 expanded (`font-stretch: 125%`), uppercase, tracking -0.02em
- Texture: heavy grain at 6%, and a slow ember-particle field (a canvas with 2D particles rising)
- Motion signature: a **scrubbed video** (a 10-second continuous shot driven by the scrollbar, not a timeline). Two clips hand over at a shared seam frame so the cut is invisible.
- Hero: full-bleed footage, with the H1 bottom-left at 12vw
- Ban: cool colours, thin weights

## 5. Glasshouse Botanical
*Wellness, skincare, food, sustainable brands.*
- Ground `#E9EEE6`, surface `#F7F9F5`, text `#1E2A1F`
- Accent `#3F6B3A` (moss). Soft secondary `#D9C9A8` for badges.
- Type: Display **Fraunces** 500 (opsz 144, SOFT 50); body **Inter** 16.5px
- Texture: paper grain at 2%, and botanical imagery with a soft vignette
- Motion signature: parallax layers (foreground leaves move 1.4× scroll, background 0.6×) and slow fades of 900ms
- Hero: split layout, with serif copy on the left and a tall rounded (28px) image on the right, cropped by a pill mask
- Ban: neon, pure black, harsh motion

## 6. Signal Lab
*AI, biotech, research, data products.*
- Ground `#050607`, text `#E6F1EE`
- Accent `#39FF9E` (phosphor), only for live-data dots, the cursor and the CTA
- Type: Display **Space Grotesk** 500; mono **IBM Plex Mono** for all labels and numbers
- Texture: a halftone dot shader and faint 1px grid lines every 80px
- Motion signature: a **Three.js point cloud** (a sphere or DNA helix) that the scroll morphs between shapes, with a camera dolly driven by ScrollTrigger progress
- Hero: the point cloud centre-right, a mono coordinate readout that follows the cursor, and the H1 left
- Ban: stock "AI brain" imagery, gradient text

## 7. Riviera
*Travel, hospitality, fashion, lifestyle.*
- Ground `#F6F1EA`, text `#1A1714`; a dark section ground `#1A1714` for contrast
- Accent `#1F4E79` (Mediterranean). Warm secondary `#E7B98A`.
- Type: Display **Cormorant Garamond** 500 at large sizes, uppercase labels in **Manrope** 600 at +0.2em
- Texture: none. Film-grade photography with warm highlights.
- Motion signature: a **horizontal pinned gallery**. Vertical scroll moves a strip of images sideways, and each image counter-parallaxes inside its frame.
- Hero: a full-bleed image with a slow Ken Burns zoom (scale 1.08→1 scrubbed) and the H1 centred in serif
- Ban: icons, bento grids

## 8. Kinetic Poster
*Events, music, agencies, streetwear.*
- Ground `#EDEBE4` or `#111`. Accent `#FF3B00` or `#D4FF00`, one per page, at full saturation.
- Type: Display **Anton** or **Archivo Black**, uppercase, at a very large size (18–22vw)
- Texture: halftone or risograph noise
- Motion signature: giant type marquees that change direction with scroll velocity, and letters that skew with it (`skewY` mapped to Lenis velocity, clamped to ±8°)
- Hero: the name filling the viewport edge to edge, with a sticker-style rotated badge
- Ban: subtle anything, thin weights, soft shadows

## 9. Nordic Utility
*Fintech, productivity, B2B that wants to feel trustworthy.*
- Ground `#FAFAF9`, surface `#FFFFFF`, hairline `#E7E5E4`, text `#1C1917` / `#78716C`
- Accent `#2F6FEB`. Success `#16A34A`, used only in product UI.
- Type: Display **Geist** 600, tracking -0.03em (alternative: Inter Tight); mono **Geist Mono** for numbers
- Texture: none. Real product UI screenshots in 12px-radius frames on a 1px hairline.
- Motion signature: UI layers that assemble on scroll (the sidebar slides in, rows stagger, a number counts up). Pinned while it happens.
- Hero: a left-aligned H1 and a product frame below it, tilted with `rotateX(12deg)`, which flattens to 0 as you scroll
- Ban: illustrations of people, 3D blobs

## 10. Deep Field
*Space, aerospace, gaming, film.*
- Ground `#000000`, text `#FFFFFF` / 60%
- Accent `#9FB8FF` (starlight), used for thin rings and the index only
- Type: Display **Syne** 700 or **Unbounded** 600; mono **DM Mono**
- Texture: a starfield shader with slow drift and a faint lens bloom on the hero object
- Motion signature: a **scroll-driven camera** through a GLB scene (a Three.js camera following a CatmullRom path, with progress mapped to ScrollTrigger). Chapter text fades in at waypoints.
- Hero: the object (planet, craft, helmet) lit from one side. The H1 sits below the fold line and rises as you scroll.
- Ban: cartoonish colours, rounded bubbly UI

---

## Writing a custom direction
Use exactly these fields: **Use for · Ground/surface/hairline/text · Accent + where allowed · Type (display, body, mono with weights and tracking) · Texture · Motion signature (one hero technique) · Hero layout · Ban list**. One motion signature per site. Two competing hero techniques read as a demo reel, not a brand.
