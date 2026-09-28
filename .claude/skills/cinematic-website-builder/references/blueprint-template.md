# Build Blueprint — <Project name>

Fill in every field with a concrete value. If a field doesn't apply, write `n/a — <reason>`.
Leaving a field blank means the model will guess it, and a guess is exactly what this blueprint is meant to prevent.

---

## 0. BRIEF
- Subject: <what it is, in one sentence>
- Primary action: <the single CTA and where it goes>
- Audience: <who is scrolling this>
- Stack: <e.g. Vite + React 18 + Tailwind 3 + GSAP 3 (ScrollTrigger, SplitText) + Lenis>
- Direction: <name from art-directions.md, or "custom">
- Hero technique: <frame-sequence canvas | scrubbed video | WebGL scene | shader bg | type-only>

## 1. ART DIRECTION
- Ground: <hex>; surface <hex>; hairline <hex or rgba>
- Text: primary <hex>; secondary <hex at N% opacity>
- Accent: <hex>. Allowed on: <list, max ~4 per viewport>. Never on: <list>
- Texture: <e.g. grain overlay 3–4% opacity, blend overlay | none>
- Imagery: <photographic / rendered / illustrative; colour grade; crop rules>
- Radius scale: <e.g. 0 / 6px / 20px / 999px, and where each one is used>
- Borders vs shadows: <e.g. 1px hairlines only, no drop shadows>
- BANNED: <e.g. gradient text, purple, glassmorphism panels, emoji icons, centred paragraphs over 2 lines, stock 3-icon feature rows>

## 2. TYPOGRAPHY
- Display: <family>, <weight>, tracking <em>, case <sentence/upper>
- Body: <family>, <weight>
- Mono/label: <family>, <size>, tracking <em>, uppercase?
- Scale:
  - H1 clamp(<min>rem, <vw>vw, <max>rem) / leading <0.9–1.0>
  - H2 clamp(...) / leading <...>
  - Body <px> / leading <1.5–1.75>; measure capped at <55–68>ch
  - Eyebrow/label <px>, <tracking>
- Rules: <e.g. H1 is always broken manually into 2–3 lines; never centre body copy longer than 2 lines>
- Font loading: <self-host / Google Fonts; font-display swap; preload display weight>

## 3. LAYOUT
- Container: max <px>, gutters <px mobile / px desktop>
- Grid: <12-col, gap px>
- Section rhythm: vertical padding clamp(<>, <>, <>)
- Breakpoints: <390 / 768 / 1024 / 1440>
- Z-layers: <bg shader 0, content 10, nav 50, cursor 100, preloader 200>

## 4. MOTION SYSTEM
- Ease: <cubic-bezier(...)> used everywhere (GSAP: <equivalent>)
- Smooth scroll: <Lenis lerp 0.1 | native>
- Entry reveal: y <px>→0, duration <ms>, stagger <ms>, trigger at <"top 85%">
- Text reveal: <lines | words | chars>, mask <yes/no>, duration <ms>, stagger <ms>
- Scroll-linked: <list the elements that are scrubbed, and their scrub value>
- Time-based ambient: <marquee speeds, shader speed>
- Hover: <e.g. translateY(-4px) over 500ms; nothing scales>
- Reduced motion: <exactly what each animated element does instead>

## 5. SECTIONS (repeat per section)

### SECTION 01 — <NAME>
- Purpose: <what the visitor should understand here>
- Height / pin: <100svh | pinned for 300% scroll | auto>
- Layout: <exact arrangement, what sits where, alignment>
- Content: <real headline, sub-copy, CTA text, media>
- Motion: <start state → end state, trigger, duration or scroll range>
- Mobile: <how the layout and motion change below 768px>

### SECTION 02 — ...

## 6. ASSETS
- Hero: <path/format; for frame sequences: count, resolution, format (WebP/AVIF), naming `frame_0001.webp`>
- Images: <formats, sizes, `loading="lazy"` except the LCP image>
- Video: <mp4/webm, poster, preload="none", IO play/pause at rootMargin>
- Fonts: <files>

## 7. PERFORMANCE
- LCP element: <which one>; it is never at opacity 0 at t=0
- Budget: JS < <kb> gz; hero media < <MB> before first interaction
- Only transform and opacity are animated; `will-change` goes on the active scrubbed layers only
- Canvas: DPR capped at 2; redraw only when the frame index changes

## 8. ACCESSIBILITY
- Contrast: body ≥ 4.5:1, display ≥ 3:1
- Focus ring: <2px accent, 2px offset> on every interactive element
- Semantic landmarks, one H1, logical heading order
- Pinned sections still read correctly in DOM order; decorative canvases are `aria-hidden`
- prefers-reduced-motion: see §4

## 9. DONE MEANS
- [ ] Screenshots at 1440×900 and 390×844 at 0/25/50/75/100% scroll
- [ ] Every item in anti-ai-tells.md QA checklist passes
- [ ] No console errors; Lighthouse performance ≥ 85 on desktop
