# Anti-AI-Tells & QA Checklist

## Why generated sites look generated
In every design decision the user doesn't make, the model reaches for the most common answer. The result is the "NexusFlow" page: a purple gradient, a centred "Transform Your Digital Experience" headline, three icon cards reading "Lightning Fast / Fully Secure / Infinitely Scalable", and "Trusted by industry leaders". It works, and it looks like everything else.

## Global ban list (applies unless the blueprint explicitly overrides it)
**Visual**
- Purple-to-blue or pink-to-orange gradients, and gradient text
- Glassmorphism panels (backdrop-blur cards) used as the default card style
- Soft, large drop shadows on every card (`shadow-xl` everywhere)
- `rounded-2xl` on everything. Choose a radius scale and justify it.
- Emoji or generic line icons in a row of 3 feature cards
- Blob or mesh backgrounds that have nothing to do with the subject
- Centred everything. A well-made page mixes left-aligned text with deliberate centring.
- Tailwind default palette colours used as-is (`indigo-600`, `slate-900` straight from the box)

**Copy**
- "Transform / Unlock / Elevate / Empower / Revolutionize / Seamless / Cutting-edge / Next-generation"
- "Trusted by industry leaders worldwide" above made-up logos
- Three-word benefit triplets ("Fast. Secure. Scalable.")
- Lorem ipsum, "Feature One", "John Doe, CEO"
- Headlines that could apply to any product. A good headline names the specific thing.

**Motion**
- Everything fading in from opacity 0 on load, headline included
- Bouncy or elastic easing on UI; several different easings on one page
- Animations that run on a timer when they should follow scroll
- Scaling cards on hover (`hover:scale-105`)
- Parallax on every element

## What to do instead
- **One accent colour** with a written rule for where it may appear.
- **A texture layer** (grain, halftone, a grid or real photography), so flat vector areas aren't the whole page.
- **Hairlines over shadows.** 1px borders at 6–12% alpha.
- **Typographic contrast**: a very large display size next to small mono labels. Index numbers (`01 / 04`) and eyebrow labels give structure.
- **Asymmetry**: offset images, text that bleeds off the edge, uneven bento spans.
- **Specific copy**: name materials, numbers, places and processes. "Hand-finished 316L case, 42 hours per piece" beats "Premium quality".
- **One hero technique** that fits the subject, carried out properly.

## Final QA checklist
Run it on screenshots at 1440×900 and 390×844, at 0/25/50/75/100% scroll.

**Art direction**
- [ ] The palette matches the blueprint hex values; the accent appears on at most ~4 elements per viewport
- [ ] None of the banned items appear anywhere
- [ ] The texture layer is present (or explicitly `none`)

**Typography**
- [ ] The display font has actually loaded (no fallback flash in screenshots)
- [ ] H1 line breaks are intentional at both widths
- [ ] Body measure ≤ 68ch; no centred paragraph longer than 2 lines

**Motion**
- [ ] One easing curve across CSS and JS
- [ ] The headline is visible on the first paint (opacity is never 0 at t=0)
- [ ] Scroll-linked scenes scrub both ways with no jumps; pins release cleanly with no overlap
- [ ] Only transform and opacity are animated (check DevTools for layout thrash)
- [ ] `prefers-reduced-motion: reduce` gives a complete, static, readable page (test with Playwright `reducedMotion: 'reduce'`)

**Layout and responsive**
- [ ] No horizontal scroll at 390px
- [ ] Pinned and horizontal sections have a written mobile alternative that works
- [ ] Tap targets ≥ 44px

**Performance**
- [ ] Videos use `preload="none"` and play/pause through IntersectionObserver
- [ ] Frame sequences have a preloader that shows real progress; the canvas DPR is capped at 2
- [ ] Images below the fold use `loading="lazy"`; the LCP image is preloaded
- [ ] No console errors

**Accessibility**
- [ ] Visible focus ring on every interactive element
- [ ] Contrast: body ≥ 4.5:1, display ≥ 3:1
- [ ] One H1; landmarks; decorative canvases and videos are `aria-hidden` or have `alt=""`
