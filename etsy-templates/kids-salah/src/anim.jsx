// Animated demonstrations: a front-facing child doing wudu (drawn like a mirror, so children copy it)
// and a side-view child moving through the positions of salah. Poses are joint coordinates; the
// animator eases between them in a loop with subtitles.
const { useState, useEffect, useRef } = React;

/* ---------------- animation engine ---------------- */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function lerpPose(a, b, t) { const o = {}; for (const k in b) { const x = a[k] ?? b[k], y = b[k];
  o[k] = Array.isArray(y) ? y.map((v, i) => (x[i] ?? v) + (v - (x[i] ?? v)) * t) : typeof y === "number" ? x + (y - x) * t : (t < .5 ? x : y); } return o; }
const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
// seq: [{p: pose, ms: move time, hold: hold time, cap: subtitle}]
function useLoop(seq, playing, slow) {
  const keyIdx = Math.max(0, seq.findIndex(s => s.key)), [frame, setFrame] = useState({ pose: seq[keyIdx].p, cap: seq[keyIdx].cap, i: keyIdx });
  const t0 = useRef(null), acc = useRef(0);
  useEffect(() => {
    if (reduceMotion()) { setFrame({ pose: seq[keyIdx].p, cap: seq[keyIdx].cap, i: keyIdx }); return; }
    if (!playing) { t0.current = null; return; }
    const k = slow ? 1.8 : 1, total = seq.reduce((a, s) => a + (s.ms + s.hold) * k, 0); let raf;
    const tick = now => { if (t0.current == null) t0.current = now - acc.current; acc.current = now - t0.current; let t = acc.current % total;
      for (let i = 0; i < seq.length; i++) { const s = seq[i], m = s.ms * k, h = s.hold * k, prev = seq[(i - 1 + seq.length) % seq.length].p;
        if (t < m) { setFrame({ pose: lerpPose(prev, s.p, ease(t / m)), cap: s.cap, i }); break; }
        t -= m; if (t < h) { setFrame({ pose: s.p, cap: s.cap, i }); break; } t -= h; }
      raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [seq, playing, slow]);
  useEffect(() => { acc.current = 0; t0.current = null; }, [seq]);
  return frame;
}
function Demo({ seq, render, label, kid, bare }) {
  const [playing, setPlaying] = useState(true), [slow, setSlow] = useState(false), f = useLoop(seq, playing, slow);
  return <div className="demo">
    <div className="demo-stage" role="img" aria-label={label}>{render(f.pose, kid)}{!bare && f.cap && <div className="demo-cap" key={f.cap + f.i}>{f.cap}</div>}</div>
    {!bare && !reduceMotion() && <div className="demo-ctrl">
      <button className="btn ghost sm" onClick={() => setPlaying(!playing)} aria-pressed={!playing}>{playing ? "⏸ Pause" : "▶ Play"}</button>
      <button className={"btn sm " + (slow ? "sun" : "ghost")} onClick={() => setSlow(!slow)} aria-pressed={slow}>🐢 Slow</button>
    </div>}
  </div>;
}

/* ---------------- wudu: front-facing child (mirror view) ---------------- */
// viewBox 0 0 240 300. R = the child's right hand, shown on the viewer's right like a mirror.
const REST = { ub: [0, 0], eR: [162, 158], hR: [166, 200], eL: [78, 158], hL: [74, 200], kR: [136, 248], fR: [138, 290], kL: [104, 248], fL: [102, 290],
  cheek: 0, shut: 0, sp: [120, 190], spOn: 0, stool: 0, stoolX: 172, bub: 0 };
const W = o => ({ ...REST, ...o });
const WP = {
  rest: W({}),
  dua: W({ eR: [158, 150], hR: [140, 168], eL: [82, 150], hL: [100, 168], bub: 1 }),
  handsA: W({ eR: [150, 162], hR: [130, 188], eL: [90, 162], hL: [110, 192], sp: [120, 190], spOn: 1 }),
  handsB: W({ eR: [146, 164], hR: [112, 188], eL: [94, 164], hL: [128, 192], sp: [120, 190], spOn: 1 }),
  mouthIn: W({ eR: [152, 128], hR: [126, 86] }),
  swish1: W({ cheek: 1 }), swish2: W({ cheek: .55 }),
  spit: W({ cheek: 0, sp: [120, 92], spOn: 1 }),
  noseR: W({ eR: [152, 126], hR: [124, 72] }),
  noseL: W({ eL: [88, 126], hL: [116, 74], sp: [120, 74], spOn: 1 }),
  faceUp: W({ eR: [152, 108], hR: [136, 42], eL: [88, 108], hL: [104, 42], shut: 1, sp: [120, 60], spOn: 1 }),
  faceDown: W({ eR: [154, 120], hR: [134, 88], eL: [86, 120], hL: [106, 90], shut: 1, sp: [120, 70], spOn: 1 }),
  armR1: W({ eR: [180, 152], hR: [198, 188], eL: [140, 176], hL: [192, 190], sp: [194, 190], spOn: 1 }),
  armR2: W({ eR: [180, 152], hR: [198, 188], eL: [128, 160], hL: [178, 156], sp: [178, 156], spOn: 1 }),
  armL1: W({ eL: [60, 152], hL: [42, 188], eR: [100, 176], hR: [48, 190], sp: [46, 190], spOn: 1 }),
  armL2: W({ eL: [60, 152], hL: [42, 188], eR: [112, 160], hR: [62, 156], sp: [62, 156], spOn: 1 }),
  headF: W({ eR: [154, 98], hR: [134, 36], eL: [86, 98], hL: [106, 36] }),
  headT: W({ eR: [150, 92], hR: [128, 24], eL: [90, 92], hL: [112, 24] }),
  headB: W({ eR: [172, 100], hR: [150, 48], eL: [68, 100], hL: [90, 48] }),
  ears1: W({ eR: [172, 100], hR: [152, 64], eL: [68, 100], hL: [88, 64] }),
  ears2: W({ eR: [174, 104], hR: [155, 68], eL: [66, 104], hL: [85, 68] }),
  footR1: W({ ub: [24, 34], kR: [164, 186], fR: [178, 218], eR: [176, 162], hR: [168, 184], eL: [124, 192], hL: [188, 214], sp: [184, 216], spOn: 1, stool: 1, stoolX: 178 }),
  footR2: W({ ub: [24, 34], kR: [164, 186], fR: [178, 218], eR: [176, 162], hR: [168, 184], eL: [120, 186], hL: [172, 204], sp: [172, 206], spOn: 1, stool: 1, stoolX: 178 }),
  footL1: W({ ub: [-24, 34], kL: [76, 186], fL: [62, 218], eL: [64, 162], hL: [72, 184], eR: [116, 192], hR: [52, 214], sp: [56, 216], spOn: 1, stool: 1, stoolX: 62 }),
  footL2: W({ ub: [-24, 34], kL: [76, 186], fL: [62, 218], eL: [64, 162], hL: [72, 184], eR: [120, 186], hR: [68, 204], sp: [68, 206], spOn: 1, stool: 1, stoolX: 62 }),
};
const rep = (a, b, n, ms, cap) => Array.from({ length: n }, () => [{ p: a, ms, hold: 120, cap }, { p: b, ms, hold: 120, cap }]).flat();
const WUDU_SEQ = {
  niyyah: [{ p: WP.rest, ms: 500, hold: 600, cap: "Intend in your heart…" }, { p: WP.dua, ms: 700, hold: 1800, cap: "Bismillah", key: 1 }],
  hands: [{ p: WP.rest, ms: 500, hold: 400 }, ...rep(WP.handsA, WP.handsB, 3, 260, "Rub between your fingers").map((s, i) => i === 0 ? { ...s, key: 1 } : s)],
  mouth: [{ p: WP.rest, ms: 500, hold: 300 }, { p: WP.mouthIn, ms: 600, hold: 500, cap: "Water into your mouth", key: 1 }, { p: WP.swish1, ms: 500, hold: 150, cap: "Swish it around" },
    { p: WP.swish2, ms: 250, hold: 100, cap: "Swish it around" }, { p: WP.swish1, ms: 250, hold: 100, cap: "Swish it around" }, { p: WP.spit, ms: 300, hold: 700, cap: "Spit it out" }],
  nose: [{ p: WP.rest, ms: 500, hold: 300 }, { p: WP.noseR, ms: 600, hold: 800, cap: "Sniff gently (right hand)", key: 1 }, { p: WP.rest, ms: 400, hold: 100 }, { p: WP.noseL, ms: 600, hold: 900, cap: "Blow out (left hand)" }],
  face: [{ p: WP.rest, ms: 500, hold: 300 }, { p: WP.faceUp, ms: 600, hold: 200, cap: "Hairline to chin", key: 1 }, { p: WP.faceDown, ms: 700, hold: 200, cap: "Hairline to chin" }, { p: WP.faceUp, ms: 500, hold: 100, cap: "Ear to ear" }, { p: WP.faceDown, ms: 700, hold: 300, cap: "Ear to ear" }],
  arms: [{ p: WP.rest, ms: 500, hold: 200 }, ...rep(WP.armR1, WP.armR2, 2, 650, "Right arm, up to the elbow").map((s, i) => i === 0 ? { ...s, key: 1 } : s), { p: WP.rest, ms: 500, hold: 200 }, ...rep(WP.armL1, WP.armL2, 2, 650, "Then the left arm")],
  head: [{ p: WP.rest, ms: 500, hold: 300 }, { p: WP.headF, ms: 600, hold: 200, cap: "Front of your head…", key: 1 }, { p: WP.headT, ms: 500, hold: 0, cap: "…over to the back…" }, { p: WP.headB, ms: 500, hold: 200, cap: "…over to the back…" },
    { p: WP.headT, ms: 500, hold: 0, cap: "…and back to the front" }, { p: WP.headF, ms: 500, hold: 300, cap: "…and back to the front" }],
  ears: [{ p: WP.rest, ms: 500, hold: 300 }, { p: WP.ears1, ms: 600, hold: 200, cap: "Index fingers inside, thumbs behind", key: 1 }, ...rep(WP.ears2, WP.ears1, 2, 220, "Index fingers inside, thumbs behind"), { p: WP.ears1, ms: 200, hold: 500 }],
  feet: [{ p: WP.rest, ms: 600, hold: 200 }, ...rep(WP.footR1, WP.footR2, 2, 650, "Right foot, up to the ankle").map((s, i) => i === 0 ? { ...s, key: 1 } : s), { p: WP.rest, ms: 600, hold: 200 }, ...rep(WP.footL1, WP.footL2, 2, 650, "Then the left foot")],
};

function WuduKid(P, kid) {
  const u = P.ub, up = ([x, y]) => [x + u[0], y + u[1]];
  const head = up([120, 62]), neck = up([120, 98]), shR = up([156, 112]), shL = up([84, 112]), hipR = [136, 206], hipL = [104, 206];
  const ln = (a, b, w, c) => <><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--outline)" strokeWidth={w + 3} strokeLinecap="round" /><line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" /></>;
  const girl = kid === "girl", cheekR = 3 + P.cheek * 6;
  const torso = `M${shL[0] - 4},${shL[1] - 4} Q${neck[0]},${neck[1] - 6} ${shR[0] + 4},${shR[1] - 4} L${hipR[0] + 26},${hipR[1] + 4} Q120,${hipR[1] + 12} ${hipL[0] - 26},${hipL[1] + 4} Z`;
  return <svg className="kid" viewBox="0 0 240 300">
    <ellipse cx="120" cy="294" rx="70" ry="6" fill="var(--track)" />
    {P.stool > .5 && <rect x={P.stoolX - 22} y="222" width="44" height="70" rx="8" fill="var(--mat)" opacity=".85" />}
    {ln(hipL, P.kL, 18, "var(--pants)")}{ln(P.kL, P.fL, 16, "var(--pants)")}{ln(hipR, P.kR, 18, "var(--pants)")}{ln(P.kR, P.fR, 16, "var(--pants)")}
    <ellipse cx={P.fL[0] - 3} cy={P.fL[1] + 2} rx="12" ry="6" fill="var(--skin)" /><ellipse cx={P.fR[0] + 3} cy={P.fR[1] + 2} rx="12" ry="6" fill="var(--skin)" />
    {girl && <path d={`M${head[0] - 34},${head[1] - 4} Q${head[0] - 40},${head[1] + 46} ${head[0] - 18},${head[1] + 52} L${head[0] + 18},${head[1] + 52} Q${head[0] + 40},${head[1] + 46} ${head[0] + 34},${head[1] - 4} Z`} fill="var(--hair)" />}
    <path d={torso} fill="var(--shirt)" stroke="var(--outline)" strokeWidth="2" strokeLinejoin="round" />
    {ln(neck, up([120, 108]), 16, "var(--skin)")}
    <circle cx={head[0]} cy={head[1]} r="33" fill="var(--skin)" stroke="var(--outline)" strokeWidth="2" />
    {girl ? <path d={`M${head[0] - 33},${head[1] - 2} Q${head[0] - 30},${head[1] - 38} ${head[0]},${head[1] - 36} Q${head[0] + 30},${head[1] - 38} ${head[0] + 33},${head[1] - 2} Q${head[0] + 12},${head[1] - 22} ${head[0] - 33},${head[1] - 2} Z`} fill="var(--hair)" />
      : <path d={`M${head[0] - 31},${head[1] - 10} Q${head[0]},${head[1] - 52} ${head[0] + 31},${head[1] - 10} Q${head[0]},${head[1] - 26} ${head[0] - 31},${head[1] - 10} Z`} fill="var(--hair)" />}
    {P.shut > .5 ? <><path d={`M${head[0] - 16},${head[1] - 2} q4,3 8,0`} stroke="var(--ink)" strokeWidth="2.6" fill="none" strokeLinecap="round" /><path d={`M${head[0] + 8},${head[1] - 2} q4,3 8,0`} stroke="var(--ink)" strokeWidth="2.6" fill="none" strokeLinecap="round" /></>
      : <><circle cx={head[0] - 12} cy={head[1] - 2} r="3.6" fill="var(--ink)" /><circle cx={head[0] + 12} cy={head[1] - 2} r="3.6" fill="var(--ink)" /></>}
    <circle cx={head[0] - 20} cy={head[1] + 10} r={cheekR} fill="var(--blush)" /><circle cx={head[0] + 20} cy={head[1] + 10} r={cheekR} fill="var(--blush)" />
    {P.cheek > .2 ? <circle cx={head[0]} cy={head[1] + 16} r="3.5" fill="var(--ink)" /> : <path d={`M${head[0] - 9},${head[1] + 13} q9,8 18,0`} stroke="var(--ink)" strokeWidth="2.6" fill="none" strokeLinecap="round" />}
    {ln(shL, P.eL, 15, "var(--shirt2)")}{ln(P.eL, P.hL, 12, "var(--skin)")}<circle cx={P.hL[0]} cy={P.hL[1]} r="9.5" fill="var(--skin)" />
    {ln(shR, P.eR, 15, "var(--shirt2)")}{ln(P.eR, P.hR, 12, "var(--skin)")}<circle cx={P.hR[0]} cy={P.hR[1]} r="9.5" fill="var(--skin)" />
    <g className="rtag" transform={`translate(${P.hR[0] + 10},${P.hR[1] - 18})`}><circle r="8" fill="var(--sun)" /><text y="3.6" textAnchor="middle" fontSize="10" fontWeight="800" fill="#2A1B00">R</text></g>
    {P.spOn > .5 && <g className="splash" transform={`translate(${P.sp[0]},${P.sp[1]})`}>{[0, 1, 2, 3, 4].map(i => <path key={i} className={"sd sd" + i} d="M0,-6 C3,-1 4,2 0,5 C-4,2 -3,-1 0,-6 Z" fill="#4FB8F0" />)}</g>}
    {P.bub > .5 && <g transform="translate(176,40)"><rect x="-38" y="-18" width="76" height="30" rx="15" fill="var(--glass-strong)" stroke="var(--glass-line)" /><text y="3" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--ink)">Bismillah</text></g>}
  </svg>;
}

/* ---------------- salah: side-view child ---------------- */
const SP = {
  stand:  { head: [100, 38], neck: [100, 56], hip: [100, 112], kneeL: [95, 148], kneeR: [105, 148], footL: [94, 184], footR: [106, 184], elbL: [89, 86], elbR: [111, 86], handL: [87, 114], handR: [113, 114], eye: [-6, -2] },
  takbir: { head: [100, 38], neck: [100, 56], hip: [100, 112], kneeL: [95, 148], kneeR: [105, 148], footL: [94, 184], footR: [106, 184], elbL: [82, 66], elbR: [118, 66], handL: [86, 40], handR: [114, 40], eye: [-6, -2] },
  qiyam:  { head: [100, 38], neck: [100, 56], hip: [100, 112], kneeL: [95, 148], kneeR: [105, 148], footL: [94, 184], footR: [106, 184], elbL: [86, 90], elbR: [114, 90], handL: [103, 86], handR: [97, 88], eye: [-6, -2] },
  ruku:   { head: [56, 98], neck: [72, 100], hip: [128, 100], kneeL: [124, 142], kneeR: [130, 142], footL: [122, 184], footR: [132, 184], elbL: [96, 120], elbR: [104, 122], handL: [120, 138], handR: [126, 140], eye: [-6, 3] },
  kneel:  { head: [96, 90], neck: [102, 106], hip: [122, 152], kneeL: [100, 180], kneeR: [106, 181], footL: [152, 182], footR: [158, 183], elbL: [104, 128], elbR: [110, 130], handL: [100, 152], handR: [106, 154], eye: [-6, -1] },
  sujud:  { head: [58, 172], neck: [74, 162], hip: [132, 136], kneeL: [118, 180], kneeR: [124, 181], footL: [158, 182], footR: [164, 183], elbL: [74, 182], elbR: [80, 182], handL: [64, 184], handR: [70, 184], eye: [-6, 4] },
  sit:    { head: [104, 92], neck: [104, 110], hip: [110, 164], kneeL: [72, 174], kneeR: [78, 176], footL: [126, 182], footR: [132, 183], elbL: [98, 140], elbR: [104, 142], handL: [82, 160], handR: [88, 162], eye: [-6, -2] },
  salamR: { head: [105, 92], neck: [104, 110], hip: [110, 164], kneeL: [72, 174], kneeR: [78, 176], footL: [126, 182], footR: [132, 183], elbL: [98, 140], elbR: [104, 142], handL: [82, 160], handR: [88, 162], eye: [4, -2] },
  salamL: { head: [101, 92], neck: [104, 110], hip: [110, 164], kneeL: [72, 174], kneeR: [78, 176], footL: [126, 182], footR: [132, 183], elbL: [98, 140], elbR: [104, 142], handL: [82, 160], handR: [88, 162], eye: [-11, -1] },
};
const S = (p, ms, hold, cap, key) => ({ p: SP[p], ms, hold, cap, key });
const SALAH_SEQ = {
  stand: [S("stand", 600, 2400, "Face the qiblah and make your intention", 1)],
  takbir: [S("stand", 500, 700, "Stand straight"), S("takbir", 600, 1300, "Allahu akbar", 1), S("qiyam", 600, 900, "Hands on your chest")],
  qiyam: [S("qiyam", 500, 2600, "Recite Al-Fatihah…", 1), S("qiyam", 10, 2000, "…then a short surah")],
  ruku: [S("qiyam", 500, 700, "Allahu akbar"), S("ruku", 900, 2600, "Subhana Rabbiyal-'Adhim × 3", 1)],
  itidal: [S("ruku", 500, 600, "Sami'allahu liman hamidah"), S("stand", 900, 1800, "Rabbana wa lakal-hamd", 1)],
  sujud1: [S("stand", 500, 500, "Allahu akbar"), S("kneel", 700, 100, "Allahu akbar"), S("sujud", 700, 2600, "Subhana Rabbiyal-A'la × 3", 1)],
  jalsa: [S("sujud", 500, 700, "Allahu akbar"), S("sit", 800, 2000, "Rabbighfir li", 1)],
  sujud2: [S("sit", 500, 600, "Allahu akbar"), S("sujud", 800, 2400, "Subhana Rabbiyal-A'la × 3", 1)],
  rakah2: [S("sujud", 500, 500, "Allahu akbar"), S("kneel", 600, 0, "Allahu akbar"), S("stand", 700, 300, "Stand up for rak'ah 2"), S("qiyam", 500, 1800, "Al-Fatihah again…", 1)],
  tashahhud: [S("sujud", 500, 500, "Allahu akbar"), S("sit", 800, 2800, "At-Tahiyyat… then the Salawat", 1)],
  salam: [S("sit", 600, 700, "Sit calmly"), S("salamR", 500, 1500, "→ As-salamu 'alaykum wa rahmatullah", 1), S("sit", 400, 200, ""), S("salamL", 500, 1500, "← As-salamu 'alaykum wa rahmatullah")],
  home: [S("qiyam", 600, 1300, ""), S("ruku", 800, 1200, ""), S("stand", 700, 600, ""), S("kneel", 600, 0, ""), S("sujud", 600, 1500, "", 1), S("sit", 700, 1300, "")],
};
function PrayerKid(P, kid) {
  const girl = kid === "girl", h = P.head;
  // each limb is drawn twice: a slightly wider outline underneath, then the colour on top
  const L = (a, b, w, c) => <g key={a + b}><line x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke="var(--outline)" strokeWidth={w + 3} strokeLinecap="round" />
    <line x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} stroke={c} strokeWidth={w} strokeLinecap="round" /></g>;
  const cloth = girl ? "var(--dress)" : "var(--shirt)", legFar = girl ? "var(--dress2)" : "var(--pants2)", legNear = girl ? "var(--dress)" : "var(--pants)";
  return <svg className="figure" viewBox="0 0 200 200">
    <rect x="22" y="186" width="156" height="9" rx="4.5" fill="var(--mat)" />
    {L("hip", "kneeL", girl ? 15 : 12, legFar)}{L("kneeL", "footL", girl ? 13 : 11, legFar)}{L("neck", "elbL", 11, girl ? "var(--dress2)" : "var(--shirt2)")}{L("elbL", "handL", 9, "var(--skin2)")}
    {L("neck", "hip", girl ? 24 : 17, cloth)}{L("hip", "kneeR", girl ? 17 : 13, legNear)}{L("kneeR", "footR", girl ? 15 : 12, legNear)}
    <ellipse cx={P.footR[0] - 4} cy={P.footR[1] + 1} rx="8" ry="4" fill="var(--skin)" stroke="var(--outline)" strokeWidth="1.5" />
    {girl && <circle cx={h[0]} cy={h[1] + 2} r="19" fill="var(--hijab)" stroke="var(--outline)" strokeWidth="1.5" />}
    <circle cx={h[0]} cy={h[1]} r="14" fill="var(--skin)" stroke={girl ? "none" : "var(--outline)"} strokeWidth="1.5" />
    {girl ? <path d={`M${h[0] - 15},${h[1] + 2} Q${h[0] - 16},${h[1] - 19} ${h[0]},${h[1] - 19} Q${h[0] + 16},${h[1] - 19} ${h[0] + 15},${h[1] + 2} Q${h[0] + 6},${h[1] - 10} ${h[0] - 15},${h[1] + 2} Z`} fill="var(--hijab)" />
      : <path d={`M${h[0] - 13},${h[1] - 5} Q${h[0]},${h[1] - 22} ${h[0] + 13},${h[1] - 5} Z`} fill="var(--kufi)" stroke="var(--outline)" strokeWidth="1.5" />}
    <circle cx={h[0] + P.eye[0]} cy={h[1] + P.eye[1]} r="2.3" fill="var(--ink)" />
    {L("neck", "elbR", 11, girl ? "var(--dress)" : "var(--shirt2)")}{L("elbR", "handR", 9, "var(--skin)")}
    <circle cx={P.handR[0]} cy={P.handR[1]} r="5.5" fill="var(--skin)" />
  </svg>;
}

export { Demo, WuduKid, PrayerKid, WUDU_SEQ, SALAH_SEQ };
