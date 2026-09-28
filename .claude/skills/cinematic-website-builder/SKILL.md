---
name: cinematic-website-builder
description: Build scroll-driven, cinematic marketing websites (landing pages, hero sections, portfolios, product/e-commerce showcases, 3D sites) that do not look AI-generated. Use when the user asks for a "premium", "animated", "Awwwards-style", "scroll-driven", "cinematic", or "like scrolltide/apple/linear" website, a hero section, a landing page with motion, or wants to turn a vague site idea into a concrete build blueprint. Covers art direction, typography, motion (GSAP ScrollTrigger, Lenis, Framer Motion, scroll-scrubbed canvas frame sequences, marquees, shaders/WebGL), section choreography, performance and accessibility.
---

# Cinematic Website Builder

Claude can write the code. What it can't do is see the website the user is picturing. A sentence like "make it premium" leaves layout, typography, motion, depth and restraint unset, and the model fills each one with the average of what it has seen before. That average is why AI-made sites all look alike.

This skill closes that gap with **the blueprint method**: make every design decision explicitly and write it down as a build blueprint first. Then build to the blueprint, not to the vague request.

## Workflow

### 1. Brief (keep it short)
Get these from the request, or ask in a single message when they are missing. Don't interrogate the user; pick sensible defaults and state them.
- **Subject**: what the site sells or shows, and the single thing a visitor should do.
- **Hero asset**: a video, a product render, an image sequence, or type-only. This decides the motion technique.
- **Mood**: pick one direction from `references/art-directions.md`, or describe a new one in the same format.
- **Stack**: default to **Vite + React + Tailwind + GSAP/ScrollTrigger + Lenis**. Use Next.js if they need routing or SSR. Use a single HTML file (see `assets/starter.html`) for a quick prototype or when no build tooling is wanted.
- **Scope**: a full landing page, one hero section, or one component.

### 2. Write the blueprint
Copy `references/blueprint-template.md` and fill in **every** field with concrete values: hex codes, px/rem/clamp values, ms durations, easing curves, and the element counts per viewport. Don't use adjectives where a number belongs. Save it in the project as `BLUEPRINT.md` and show the user a short summary of it before a large build.

The blueprint needs:
- **Art direction**: the ground colour, one accent and the rule for where it may appear, a texture, and an explicit **ban list** (see `references/anti-ai-tells.md`).
- **Typography**: the display and body faces, weights, tracking, a clamp() scale, leading and measure.
- **Motion system**: one site-wide easing curve, entry values (distance, duration, stagger), and which motion is tied to scroll progress and which to time.
- **Section choreography**: one numbered block per section, covering its layout, its content and exactly what moves, when, and by how much.
- **Performance and accessibility rules.**

### 3. Build
- Scaffold the stack, then set up the tokens first (CSS variables or the Tailwind theme) straight from the blueprint.
- Build one section at a time in blueprint order. Take motion code from `references/motion-techniques.md` and layouts from `references/section-library.md`.
- Use real copy that fits the subject. Never use lorem ipsum, "Transform your digital experience" or "Unlock the power of…".

### 4. Verify
- Run the app and take screenshots with Playwright at 1440×900 and 390×844. Check them at scroll positions 0%, 25%, 50%, 75% and 100% when the site is scroll-driven.
- Go through `references/anti-ai-tells.md` and the QA checklist at the end of it. Fix every failure before reporting back.
- Report which direction you used, what moves, and how to swap in the real assets.

## Non-negotiables
1. **One easing curve** for the whole site (default `cubic-bezier(0.22, 1, 0.36, 1)`, which is `power3.out`/`expo.out` territory in GSAP).
2. **Animate only transform and opacity.** Never animate width, height, top/left or box-shadow.
3. **The LCP headline must never start at opacity 0.** Animate its transform or clip-path only, so it paints on the first frame.
4. **Honour `prefers-reduced-motion`.** Scrubbed scenes fall back to a static key frame, and reveals become instant.
5. **One accent colour**, on no more than about 4 elements per viewport.
6. **Motion follows scroll progress, not timers**, for anything tied to the story. Timers are only for ambient loops such as marquees and shaders.
7. **Mobile is designed, not squeezed.** Pinned or scrubbed sections get a simpler mobile choreography that you write into the blueprint.
8. **Media loads lazily.** Videos use `preload="none"` and play or pause through IntersectionObserver. Frame sequences load behind a preloader that shows real progress.

## Reference files
| File | Use it for |
|---|---|
| `references/blueprint-template.md` | The fill-in blueprint. Always start here. |
| `references/art-directions.md` | 10 ready-made directions with palette, type, motion signature and hero idea |
| `references/motion-techniques.md` | Copy-ready code: Lenis+ScrollTrigger setup, scroll-scrubbed canvas frame sequences, pinned chapters, split-text reveals, marquees, magnetic buttons, shader backgrounds, Three.js scroll camera |
| `references/section-library.md` | Section patterns: heroes, marquees, bento features, galleries, stats, testimonials, pricing, CTA, footers, and the motion for each |
| `references/anti-ai-tells.md` | Ban list, the things that make a site look AI-made, and the final QA checklist |
| `assets/starter.html` | A working single-file starter (Lenis + GSAP via CDN) with hero, marquee, pinned chapter, bento, CTA and wordmark footer |
