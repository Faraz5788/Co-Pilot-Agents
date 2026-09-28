# Motion Techniques

Copy-ready recipes. Every recipe assumes the site-wide ease below and a reduced-motion check.
The examples are React + GSAP where that matters. The same logic works in vanilla JS (see `assets/starter.html`).

```bash
npm i gsap lenis            # core
npm i @gsap/react           # useGSAP hook (React)
npm i three @react-three/fiber @react-three/drei   # only for 3D directions
```

GSAP (including SplitText and ScrollSmoother) is free for commercial use as of 3.13.

---

## 0. Shared setup: tokens, ease, reduced motion

```css
:root {
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 750ms;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

```ts
// motion.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create("site", "0.22, 1, 0.36, 1");     // same curve as --ease
gsap.defaults({ ease: "site", duration: 0.75 });

export const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

## 1. Lenis smooth scroll wired to ScrollTrigger

```ts
import Lenis from "lenis";
export function initLenis() {
  if (reduced()) return null;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
```
Include the Lenis CSS (`lenis/dist/lenis.css`), or at minimum: `html.lenis, html.lenis body { height: auto; }`.

## 2. Entry reveal (stagger children)

```ts
gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((group) => {
  gsap.from(group.children, {
    y: 16, opacity: 0, stagger: 0.06,
    scrollTrigger: { trigger: group, start: "top 85%", once: true },
  });
});
```
Never apply this to the hero H1. That element is the LCP (the largest element on first paint), so it must be visible on the first frame. Use recipe 3 for it, which animates the transform or clip-path only.

## 3. Masked line reveal for headlines (LCP-safe)

```ts
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const split = SplitText.create("[data-split]", { type: "lines", mask: "lines" });
gsap.from(split.lines, { yPercent: 100, stagger: 0.08, duration: 0.9 });
```
The mask wraps each line in an `overflow: clip` wrapper, so the text slides up into view without opacity ever being 0. For the H1, run it on load. For other headings, put it behind a ScrollTrigger.

## 4. Scroll-scrubbed canvas frame sequence (the Apple-style product teardown)
The hero technique for hardware and products. Export the render or footage as 120–240 WebP frames (`frame_0001.webp` …), 1600–1920px wide, ~40–80KB each.

```ts
export async function frameSequence(canvas: HTMLCanvasElement, opts: {
  count: number; path: (i: number) => string; trigger: string; end?: string;
  onProgress?: (p: number) => void;
}) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio, 2);
  const frames: ImageBitmap[] = new Array(opts.count);
  let loaded = 0;

  // Real preloader: decode every frame, report progress
  await Promise.all(Array.from({ length: opts.count }, async (_, i) => {
    const blob = await fetch(opts.path(i + 1)).then((r) => r.blob());
    frames[i] = await createImageBitmap(blob);
    opts.onProgress?.(++loaded / opts.count);
  }));

  const size = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    draw(state.frame);
  };
  const draw = (i: number) => {                 // object-fit: cover
    const img = frames[i]; if (!img) return;
    const s = Math.max(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * s, h = img.height * s;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  };
  const state = { frame: 0 };
  size(); addEventListener("resize", size);

  if (reduced()) { draw(Math.floor(opts.count * 0.5)); return; }   // static key frame

  let last = -1;
  gsap.to(state, {
    frame: opts.count - 1, snap: "frame", ease: "none",
    scrollTrigger: { trigger: opts.trigger, start: "top top", end: opts.end ?? "+=300%", scrub: 0.5, pin: true },
    onUpdate: () => { if (state.frame !== last) { last = state.frame; draw(state.frame); } },
  });
}
```
- **Chapters**: split the pinned range into N parts. Tie each chapter's text to a slice of the same ScrollTrigger by building a timeline with labels, so the copy fades in and out at frame ranges.
- **Anchored callouts**: store each callout's position as coordinates in the source frame (e.g. `{x: 1210, y: 640}` on a 1920×1080 frame), then put them through the same cover transform as `draw()` so they stay on the object at any crop.
- **Mobile**: use a shorter pin (`+=180%`), load every 2nd frame, and serve portrait-cropped frames if the composition needs them.

## 5. Scroll-scrubbed video
This is simpler than frames, but seeking is only smooth when the file has an **all-keyframe encode**:
```bash
ffmpeg -i in.mp4 -vf scale=1920:-2 -c:v libx264 -g 1 -crf 22 -an -movflags +faststart scrub.mp4
```
```ts
const v = document.querySelector<HTMLVideoElement>("#scrub")!;
v.pause();
ScrollTrigger.create({
  trigger: "#scrub-section", start: "top top", end: "+=400%", pin: true, scrub: true,
  onUpdate: (s) => { if (v.duration) v.currentTime = s.progress * v.duration; },
});
```
**Seam handover**: when two clips share an identical first and last frame, split the progress range at the seam and swap which video element is visible (with an opacity toggle, not a crossfade).

## 6. Pinned chapters with a progress index

```ts
const tl = gsap.timeline({
  scrollTrigger: { trigger: "#chapters", start: "top top", end: `+=${chapters.length * 100}%`, pin: true, scrub: 0.6,
    onUpdate: (s) => setIndex(Math.min(chapters.length - 1, Math.floor(s.progress * chapters.length))) },
});
chapters.forEach((el, i) => {
  if (i > 0) tl.from(el, { yPercent: 30, opacity: 0 }, i);
  if (i < chapters.length - 1) tl.to(el, { yPercent: -30, opacity: 0 }, i + 0.7);
});
```
Show `0{index+1} / 0{n}` in a mono label that uses the accent colour.

**Progressive enhancement (important):** by default the chapters should be a **static stacked list**. Add the absolute-positioned, pinned layout only through a class (`.is-pinned`) that JS sets once it actually creates the pin. Otherwise reduced-motion users, mobile users and anyone whose CDN load fails will see every chapter stacked on top of the others.

## 7. Horizontal pinned gallery

```ts
const track = document.querySelector<HTMLElement>(".h-track")!;
gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth), ease: "none",
  scrollTrigger: { trigger: ".h-wrap", start: "top top", end: () => `+=${track.scrollWidth - innerWidth}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
});
```
Counter-parallax inside each card: `gsap.fromTo(img, {xPercent:-10}, {xPercent:10, scrollTrigger:{containerAnimation: tween, trigger: card, scrub:true}})`.
**Mobile**: replace it with a native `overflow-x: auto; scroll-snap-type: x mandatory` row.

## 8. Seamless marquee (CSS only)

```html
<div class="marquee" aria-hidden="true"><div class="marquee__track">…items……same items again…</div></div>
```
```css
.marquee { overflow: clip; mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
.marquee__track { display: flex; gap: 3rem; width: max-content; animation: marquee 32s linear infinite; }
.marquee--reverse .marquee__track { animation-duration: 38s; animation-direction: reverse; }
@keyframes marquee { to { transform: translateX(-50%); } }
```
Velocity-reactive variant (Kinetic Poster): read `lenis.velocity` and lerp `timeScale` and `skewY` toward it.

## 9. Image unclip reveal

```ts
gsap.utils.toArray<HTMLElement>("[data-unclip]").forEach((el) =>
  gsap.fromTo(el, { clipPath: "inset(8% 8% 8% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)",
    scrollTrigger: { trigger: el, start: "top 80%", end: "top 30%", scrub: true } }));
```

## 10. Magnetic button

```ts
export function magnetic(el: HTMLElement, strength = 0.35) {
  if (matchMedia("(hover: none)").matches || reduced()) return;
  const xTo = gsap.quickTo(el, "x", { duration: 0.6 }), yTo = gsap.quickTo(el, "y", { duration: 0.6 });
  el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * strength); yTo((e.clientY - r.top - r.height / 2) * strength); });
  el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
}
```

## 11. Shader background (mesh gradient / swirl), with no three.js
A minimal full-screen fragment shader in raw WebGL. Pause it when it is off-screen, and cap the DPR at 1.5.

```ts
const frag = `precision highp float; uniform vec2 r; uniform float t;
uniform vec3 c1, c2, c3;
vec2 h(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453)*2.-1.;}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
 return mix(mix(dot(h(i),f),dot(h(i+vec2(1,0)),f-vec2(1,0)),u.x),mix(dot(h(i+vec2(0,1)),f-vec2(0,1)),dot(h(i+1.),f-1.),u.x),u.y);}
void main(){vec2 uv=gl_FragCoord.xy/r; vec2 p=uv*2.;
 float a=n(p+t*.05), b=n(p*1.7-t*.04+a);
 vec3 col=mix(c1,c2,smoothstep(-.4,.6,a)); col=mix(col,c3,smoothstep(-.2,.8,b)*.6);
 col+= (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.035; // grain
 gl_FragColor=vec4(col,1.);}`;
```
Set up a single triangle covering the screen, pass `r` (resolution), `t` (seconds) and three brand colours as vec3, then render with `requestAnimationFrame`. Stop the loop when an IntersectionObserver reports it is off-screen. Under reduced motion, render one frame and stop.

## 12. Three.js scroll camera (Deep Field / Signal Lab)

```tsx
// R3F: camera follows a curve; progress from ScrollTrigger stored in a ref
const curve = useMemo(() => new THREE.CatmullRomCurve3([v(0,0,8), v(3,1,4), v(0,2,1), v(-3,0,3)]), []);
useFrame(({ camera }) => {
  const p = THREE.MathUtils.damp(cur.current, progress.current, 4, 1/60); cur.current = p;
  camera.position.copy(curve.getPointAt(p)); camera.lookAt(0, 0, 0);
});
```
Drive `progress.current` from a pinned ScrollTrigger's `onUpdate: s => progress.current = s.progress`. Set `dpr={[1, 1.5]}` and `frameloop="demand"` when the scene is idle, and compress GLBs with `gltf-transform optimize --compress draco`.

**Point-cloud morph**: store two position buffers (a sphere and the target shape) and do `mix(a, b, uProgress)` in the vertex shader. It costs far less than tweening the vertices in JS.

## 13. React integration notes
- Use `useGSAP(() => {...}, { scope: ref })` from `@gsap/react`. It handles cleanup and works with StrictMode.
- Call `ScrollTrigger.refresh()` after fonts load (`document.fonts.ready.then(...)`) and after images or frames finish loading.
- In Next.js, mark animated components `"use client"` and import GSAP plugins only on the client.
- Framer Motion is fine for small hover and layout transitions. Keep all **scroll-choreographed** work in GSAP, so there is a single timing source.
