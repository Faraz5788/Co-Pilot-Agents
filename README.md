# Co-Pilot-Agents

## Skills

### `cinematic-website-builder`
Location: `.claude/skills/cinematic-website-builder/`

Builds scroll-driven, cinematic websites that don't look AI-generated. It uses the **blueprint method**: every design decision (palette, type scale, easing, choreography for each section, accessibility) is written down before any code.

- `SKILL.md`: workflow and non-negotiables
- `references/blueprint-template.md`: the fill-in build blueprint
- `references/art-directions.md`: 10 fully specified visual directions
- `references/motion-techniques.md`: GSAP/Lenis/WebGL recipes (frame sequences, scrubbed video, pinned chapters, marquees, shaders, Three.js scroll camera)
- `references/section-library.md`: hero, feature, gallery, pricing, CTA and footer patterns
- `references/anti-ai-tells.md`: ban list and the QA checklist
- `assets/starter.html`: a working single-file starter page

Claude Code loads it automatically when this repo is open. You can also invoke it with `/cinematic-website-builder`, or by asking for something like "build me a premium scroll-animated landing page for …".
