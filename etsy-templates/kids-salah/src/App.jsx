import { WUDU, WUDU_DUA, SALAH, RECITE, RECITE_ORDER, PRAYERS, QUIZ, AVATARS, BADGES } from "./content.js";
import { Demo, WuduKid, PrayerKid, WUDU_SEQ, SALAH_SEQ } from "./anim.jsx";
const { useState, useEffect, useMemo, useRef, useCallback } = React;

/* ---------------- state ---------------- */
const KEY = "little-salah-v1";
const FRESH = { name: "Little Star", avatar: "🦁", kid: "boy", wuduDone: 0, salahDone: 0, known: {}, bestQuiz: 0, orderWins: 0, log: {}, view: "home" };
const load = () => { try { return { ...FRESH, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { return { ...FRESH }; } };
const saveState = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const todayKey = () => ymd(new Date());
function streakOf(log) { let n = 0; const d = new Date(); if (!(log[ymd(d)] || []).length) d.setDate(d.getDate() - 1);
  while ((log[ymd(d)] || []).length) { n++; d.setDate(d.getDate() - 1); } return n; }
function starsOf(s) { const prayed = Object.values(s.log).reduce((a, d) => a + d.length, 0);
  return s.wuduDone * 5 + s.salahDone * 5 + Object.values(s.known).filter(Boolean).length * 3 + s.bestQuiz + s.orderWins * 3 + prayed; }
const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- small UI pieces ---------------- */
function Confetti({ burst }) {
  const [pieces, setPieces] = useState([]);
  useEffect(() => { if (!burst || reduceMotion()) return;
    const colors = ["var(--sun)", "var(--coral)", "var(--accent)", "#7FB8FF", "#B48CFF"];
    const p = Array.from({ length: 46 }, (_, i) => ({ id: burst + "-" + i, left: Math.random() * 100, delay: Math.random() * 0.3, dur: 1.4 + Math.random() * 1.2, rot: Math.random() * 360, c: colors[i % colors.length], w: 6 + Math.random() * 7 }));
    setPieces(p); const t = setTimeout(() => setPieces([]), 3000); return () => clearTimeout(t); }, [burst]);
  return <div className="confetti" aria-hidden="true">{pieces.map(p => <i key={p.id} style={{ left: p.left + "%", animationDelay: p.delay + "s", animationDuration: p.dur + "s", background: p.c, width: p.w, height: p.w * 1.6, transform: `rotate(${p.rot}deg)` }} />)}</div>;
}
function Ring({ value, max, size = 92, stroke = 10, label, sub, color = "var(--accent)" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = max ? Math.min(1, value / max) : 0;
  return <div className="ring" style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      {p > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} className="ring-arc" />}
    </svg>
    <div className="ring-in"><b>{label}</b>{sub && <small>{sub}</small>}</div>
  </div>;
}
function Arabic({ children, size }) { return <p className="ar" lang="ar" dir="rtl" style={size ? { fontSize: size } : null}>{children}</p>; }
function ReciteCard({ id, compact }) {
  const r = RECITE[id]; if (!r) return null;
  return <div className={"recite" + (compact ? " compact" : "")}>
    <div className="recite-h"><b>{r.name}</b>{r.times && <span className="chip-s">× {r.times}</span>}{r.optional && <span className="chip-s soft">optional</span>}</div>
    {r.lines ? r.lines.map((l, i) => <div className="line" key={i}><Arabic>{l[0]}</Arabic><p className="tr">{l[1]}</p><p className="mean">{l[2]}</p></div>)
      : <><Arabic>{r.ar}</Arabic><p className="tr">{r.tr}</p><p className="mean">{r.mean}</p></>}
    {r.after && <p className="tr" style={{ marginTop: 6 }}>{r.after}</p>}
    {r.src && <p className="src">Source: {r.src}</p>}
  </div>;
}

/* ---------------- views ---------------- */
function Home({ s, go, togglePrayer }) {
  const today = s.log[todayKey()] || [], known = Object.values(s.known).filter(Boolean).length, badges = BADGES.filter(b => b.test({ ...s, streak: streakOf(s.log) }));
  const next = s.wuduDone === 0 ? { v: "wudu", t: "Learn how to make wudu", e: "💧" } : s.salahDone === 0 ? { v: "salah", t: "Learn the steps of salah", e: "🕌" } : !s.known.fatiha ? { v: "recite", t: "Learn Surah Al-Fatihah", e: "📖" } : { v: "play", t: "Play the salah quiz", e: "🧠" };
  return <div className="stack">
    <section className="glass hero">
      <div className="hero-text">
        <p className="eyebrow">Today's adventure</p>
        <h2>{next.e} {next.t}</h2>
        <p className="muted">Every step you learn earns stars. Collect badges as you go!</p>
        <button className="btn primary" onClick={() => go(next.v)}>Let's go →</button>
      </div>
      <div className="hero-figure"><Demo seq={SALAH_SEQ.home} render={PrayerKid} kid={s.kid} label="A child praying" bare /></div>
    </section>
    <section className="grid4">
      {[["wudu", "Wudu", s.wuduDone, 5, "lessons", "var(--accent)"], ["salah", "Salah", s.salahDone, 5, "lessons", "#5B8CFF"], ["recite", "Recite", known, RECITE_ORDER.length, "learnt", "var(--coral)"], ["badges", "Badges", badges.length, BADGES.length, "earned", "var(--sun)"]].map(([v, n, val, max, sub, col]) =>
        <button key={v} className="glass tile lift" onClick={() => go(v)}><Ring value={val} max={max} label={val} sub={"/" + max} color={col} /><span><b>{n}</b><small>{val} {sub}</small></span></button>)}
    </section>
    <section className="glass pad">
      <div className="row-between"><h3>Today's prayers</h3><span className="chip-s">{today.length} / 5</span></div>
      <div className="prayers">{PRAYERS.map(p => { const on = today.includes(p.id);
        return <button key={p.id} className={"prayer lift" + (on ? " on" : "")} aria-pressed={on} onClick={() => togglePrayer(p.id)}><span className="pi">{on ? "✅" : p.icon}</span><b>{p.name}</b><small>{p.rakah} rak'ahs</small></button>; })}</div>
    </section>
    <section className="grid2">
      <div className="glass pad"><h3>Latest badges</h3>{badges.length ? <div className="badge-row">{badges.slice(-4).map(b => <span key={b.id} className="badge-mini" title={b.name}>{b.icon}<small>{b.name}</small></span>)}</div> : <p className="muted">Finish your first lesson to earn a badge!</p>}</div>
      <div className="glass pad tip"><h3>Did you know?</h3><p>The Prophet ﷺ said that when a person makes wudu, their small sins wash away with the water. <span className="src">(Sahih Muslim 244)</span></p></div>
    </section>
  </div>;
}

function Wudu({ onDone, kid }) {
  const [i, setI] = useState(0), [count, setCount] = useState(0), [ripple, setRipple] = useState(0), done = i >= WUDU.length;
  const st = WUDU[i];
  const tap = () => { if (count < st.times) { setCount(count + 1); setRipple(r => r + 1); try { navigator.vibrate && navigator.vibrate(20); } catch (e) {} } };
  const next = () => { if (i === WUDU.length - 1) onDone(); setI(i + 1); setCount(0); };
  if (done) return <div className="stack">
    <section className="glass pad center pop"><div className="big-emoji">🌟</div><h2>Masha'Allah! Your wudu is complete!</h2><p className="muted">Now say this dua, looking up:</p>
      <div className="glass-inner"><Arabic>{WUDU_DUA.ar}</Arabic><p className="tr">{WUDU_DUA.tr}</p><p className="mean">{WUDU_DUA.mean}</p><p className="src">Source: {WUDU_DUA.src}</p></div>
      <div className="row center-row"><button className="btn primary" onClick={() => { setI(0); setCount(0); }}>Practise again</button></div></section>
  </div>;
  return <div className="stack">
    <div className="steps-bar" aria-label={`Step ${i + 1} of ${WUDU.length}`}>{WUDU.map((w, k) => <span key={w.id} className={k < i ? "done" : k === i ? "now" : ""} />)}</div>
    <section className="glass lesson" key={st.id}>
      <div className="lesson-art"><Demo seq={WUDU_SEQ[st.id]} render={WuduKid} kid={kid} label={"Animation: " + st.title} /><p className="muted small mirror-tip">Copy me like a mirror! <b className="rdot">R</b> is my right hand.</p></div>
      <div className="lesson-body">
        <p className="eyebrow">Step {i + 1} of {WUDU.length}</p>
        <h2>{st.title}</h2>
        <p className="how">{st.how}</p>
        {st.note && <p className="note">👉 {st.note}</p>}
        {st.ar && <div className="glass-inner"><Arabic size="34px">{st.ar}</Arabic><p className="tr">{st.tr} · <span className="mean">{st.mean}</span></p></div>}
        <div className="counter">
          <div className="dots">{Array.from({ length: st.times }, (_, k) => <span key={k} className={k < count ? "on" : ""}>{k < count ? "💧" : k + 1}</span>)}</div>
          {count < st.times ? <button className="btn big primary" onClick={tap}>{st.action}{st.times > 1 ? ` (${count + 1} of ${st.times})` : ""}</button>
            : <button className="btn big sun" onClick={next}>{i === WUDU.length - 1 ? "Finish wudu 🎉" : "Next step →"}</button>}
        </div>
        <div className="row"><button className="btn ghost sm" disabled={i === 0} onClick={() => { setI(i - 1); setCount(0); }}>← Back</button><button className="btn ghost sm" onClick={() => setCount(st.times)}>Skip counting</button></div>
      </div>
    </section>
  </div>;
}

function Salah({ onDone, kid }) {
  const [i, setI] = useState(0), done = i >= SALAH.length, st = SALAH[i];
  const rakah = i < 8 ? 1 : 2;
  if (done) return <div className="stack"><section className="glass pad center pop"><div className="big-emoji">🕌</div><h2>Your salah is complete!</h2>
    <p className="muted">You walked through a 2 rak'ah prayer, like Fajr. May Allah accept it!</p><button className="btn primary" onClick={() => setI(0)}>Practise again</button></section><RakahGuide /></div>;
  return <div className="stack">
    <div className="steps-bar">{SALAH.map((w, k) => <span key={w.id} className={k < i ? "done" : k === i ? "now" : ""} />)}</div>
    <section className="glass lesson" key={st.id}>
      <div className="lesson-art"><Demo seq={SALAH_SEQ[st.id]} render={PrayerKid} kid={kid} label={"Animation: " + st.title} /><span className="chip-s">Rak'ah {rakah} of 2</span></div>
      <div className="lesson-body">
        <p className="eyebrow">Step {i + 1} of {SALAH.length}</p>
        <h2>{st.title}</h2>
        <p className="how">{st.how}</p>
        {st.say && <ReciteCard id={st.say} compact />}
        {st.extra && <details className="more"><summary>Also say…</summary>{st.extra.map(x => <ReciteCard key={x} id={x} compact />)}</details>}
        <div className="row">
          <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
          <button className="btn primary" onClick={() => { if (i === SALAH.length - 1) onDone(); setI(i + 1); }}>{i === SALAH.length - 1 ? "Finish salah 🎉" : "Next step →"}</button>
        </div>
      </div>
    </section>
  </div>;
}
function RakahGuide() {
  return <section className="glass pad"><h3>How many rak'ahs?</h3><div className="rakah-grid">{PRAYERS.map(p => <div key={p.id} className="rakah"><span>{p.icon}</span><b>{p.name}</b><span className="ar-s" lang="ar">{p.ar}</span><div className="rk">{Array.from({ length: p.rakah }, (_, k) => <i key={k} />)}</div><small>{p.rakah} rak'ahs · {p.when}</small></div>)}</div>
    <p className="muted small">In prayers with 3 or 4 rak'ahs, sit for At-Tahiyyat after the 2nd rak'ah, then stand up for the rest. In the 3rd and 4th rak'ahs of these fard prayers, recite only Al-Fatihah.</p></section>;
}

function Recite({ s, setKnown }) {
  const [open, setOpen] = useState("fatiha"), [hide, setHide] = useState(false);
  return <div className="grid-recite">
    <nav className="glass pad list" aria-label="Recitations">{RECITE_ORDER.map(id => <button key={id} className={"list-item" + (open === id ? " on" : "")} onClick={() => setOpen(id)}><span>{s.known[id] ? "⭐" : "○"}</span>{RECITE[id].name}</button>)}</nav>
    <section className={"glass pad fade-in" + (hide ? " hide-tr" : "")} key={open}>
      <div className="row-between"><h2>{RECITE[open].name}</h2><label className="switch"><input type="checkbox" id="hideTr" checked={hide} onChange={e => setHide(e.target.checked)} /><span /> Practice mode</label></div>
      {hide && <p className="muted small">The pronunciation and meaning are hidden. Try reciting, then tap a line to check.</p>}
      <ReciteCard id={open} />
      <div className="row"><button className={"btn " + (s.known[open] ? "ghost" : "sun")} onClick={() => setKnown(open, !s.known[open])}>{s.known[open] ? "✓ I know this one" : "⭐ I know it!"}</button></div>
    </section>
  </div>;
}

function Play({ s, onQuiz, onOrder }) {
  const [game, setGame] = useState(null);
  if (game === "quiz") return <Quiz onExit={() => setGame(null)} onScore={onQuiz} />;
  if (game === "order") return <OrderGame onExit={() => setGame(null)} onWin={onOrder} />;
  return <div className="grid2">
    <button className="glass game lift" onClick={() => setGame("order")}><span className="big-emoji">🧩</span><h3>Wudu in order</h3><p className="muted">Tap the wudu steps in the right order.</p><span className="chip-s">Won {s.orderWins} times</span></button>
    <button className="glass game lift" onClick={() => setGame("quiz")}><span className="big-emoji">🧠</span><h3>Salah quiz</h3><p className="muted">{QUIZ.length} questions about wudu and salah.</p><span className="chip-s">Best: {s.bestQuiz} / {QUIZ.length}</span></button>
  </div>;
}
function Quiz({ onExit, onScore }) {
  const [i, setI] = useState(0), [score, setScore] = useState(0), [pick, setPick] = useState(null);
  if (i >= QUIZ.length) return <section className="glass pad center pop"><div className="big-emoji">{score === QUIZ.length ? "🏆" : "🌟"}</div><h2>You got {score} out of {QUIZ.length}!</h2>
    <p className="muted">{score === QUIZ.length ? "Perfect score, masha'Allah!" : "Great effort! Try again to beat your score."}</p><div className="row center-row"><button className="btn primary" onClick={() => { setI(0); setScore(0); setPick(null); }}>Play again</button><button className="btn ghost" onClick={onExit}>Back to games</button></div></section>;
  const q = QUIZ[i];
  const choose = k => { if (pick !== null) return; setPick(k); const ok = k === q.c; const ns = score + (ok ? 1 : 0); setScore(ns);
    setTimeout(() => { if (i === QUIZ.length - 1) onScore(ns); setI(i + 1); setPick(null); }, 900); };
  return <section className="glass pad quiz fade-in" key={i}>
    <div className="row-between"><span className="chip-s">Question {i + 1} / {QUIZ.length}</span><span className="chip-s">⭐ {score}</span></div>
    <h2>{q.q}</h2>
    <div className="answers">{q.a.map((a, k) => <button key={k} className={"answer lift" + (pick !== null ? (k === q.c ? " right" : k === pick ? " wrong" : "") : "")} onClick={() => choose(k)}>{a}</button>)}</div>
    <button className="btn ghost sm" onClick={onExit}>Quit</button>
  </section>;
}
function OrderGame({ onExit, onWin }) {
  const shuffled = useMemo(() => [...WUDU].sort(() => Math.random() - 0.5), []);
  const [got, setGot] = useState(0), [shake, setShake] = useState(null), [won, setWon] = useState(false);
  const tap = w => { if (WUDU[got].id === w.id) { const n = got + 1; setGot(n); if (n === WUDU.length) { setWon(true); onWin(); } } else { setShake(w.id); setTimeout(() => setShake(null), 450); } };
  if (won) return <section className="glass pad center pop"><div className="big-emoji">🧩</div><h2>All in order, well done!</h2><div className="row center-row"><button className="btn ghost" onClick={onExit}>Back to games</button></div></section>;
  return <section className="glass pad">
    <div className="row-between"><h2>Tap step {got + 1}</h2><span className="chip-s">{got} / {WUDU.length}</span></div>
    <div className="order-done">{WUDU.slice(0, got).map((w, k) => <span key={w.id} className="chip-s ok">{k + 1}. {w.icon} {w.title}</span>)}</div>
    <div className="order-grid">{shuffled.filter(w => !WUDU.slice(0, got).includes(w)).map(w => <button key={w.id} className={"order-card lift" + (shake === w.id ? " shake" : "")} onClick={() => tap(w)}><span>{w.icon}</span>{w.title}</button>)}</div>
    <button className="btn ghost sm" onClick={onExit}>Quit</button>
  </section>;
}

function Tracker({ s, togglePrayer }) {
  const days = Array.from({ length: 7 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); return d; });
  const today = s.log[todayKey()] || [], streak = streakOf(s.log);
  return <div className="stack">
    <section className="glass pad"><div className="row-between"><h2>Today</h2><span className="chip-s">🔥 {streak}-day streak</span></div>
      <div className="prayers">{PRAYERS.map(p => { const on = today.includes(p.id);
        return <button key={p.id} className={"prayer lift" + (on ? " on" : "")} aria-pressed={on} onClick={() => togglePrayer(p.id)}><span className="pi">{on ? "✅" : p.icon}</span><b>{p.name}</b><small>{p.when}</small></button>; })}</div></section>
    <section className="glass pad"><h3>This week</h3><div className="week">{days.map(d => { const n = (s.log[ymd(d)] || []).length;
      return <div key={ymd(d)} className="wday"><div className="wbar"><i style={{ height: n / 5 * 100 + "%" }} /></div><b>{n}</b><small>{d.toLocaleDateString(undefined, { weekday: "short" })}</small></div>; })}</div></section>
  </div>;
}

function Badges({ s }) {
  const st = { ...s, streak: streakOf(s.log) };
  return <div className="badge-grid">{BADGES.map(b => { const on = b.test(st);
    return <div key={b.id} className={"glass badge" + (on ? " on" : "")}><span className="b-icon">{on ? b.icon : "🔒"}</span><b>{b.name}</b><small>{b.how}</small></div>; })}</div>;
}

function Parents({ s, set, reset }) {
  const [confirm, setConfirm] = useState(false);
  return <div className="grid2">
    <section className="glass pad"><h3>Child's profile</h3>
      <label className="lbl" htmlFor="kidName">Name</label><input id="kidName" className="inp" value={s.name} maxLength={20} onChange={e => set({ name: e.target.value })} />
      <span className="lbl">Character in the lessons</span><div className="row" style={{ marginTop: 0 }}>{[["boy", "👦 Boy"], ["girl", "👧 Girl"]].map(([k, n]) => <button key={k} className={"btn sm " + (s.kid === k ? "primary" : "ghost")} aria-pressed={s.kid === k} onClick={() => set({ kid: k })}>{n}</button>)}</div>
      <span className="lbl">Avatar</span><div className="avatars">{AVATARS.map(a => <button key={a} className={"av lift" + (s.avatar === a ? " on" : "")} aria-pressed={s.avatar === a} onClick={() => set({ avatar: a })}>{a}</button>)}</div>
    </section>
    <section className="glass pad"><h3>A note for parents</h3>
      <p>This app teaches the common steps of wudu and salah in simple words. Some details differ between schools of thought, for example where the hands are placed when standing, or whether the neck is wiped in wudu.</p>
      <p>Please follow what your family, teacher or masjid teaches. Every recitation shows its source.</p>
      <p className="muted small">Progress is saved on this device only. Nothing is uploaded.</p>
      {!confirm ? <button className="btn ghost sm warn" onClick={() => setConfirm(true)}>Reset all progress</button>
        : <div className="row"><span>Reset everything?</span><button className="btn sm warn-fill" onClick={() => { reset(); setConfirm(false); }}>Yes, reset</button><button className="btn ghost sm" onClick={() => setConfirm(false)}>Cancel</button></div>}
    </section>
  </div>;
}

/* ---------------- shell ---------------- */
const NAV = [["home", "🏠", "Home"], ["wudu", "💧", "Wudu"], ["salah", "🕌", "Salah"], ["recite", "📖", "Recite"], ["play", "🎮", "Play"], ["tracker", "📅", "Tracker"], ["badges", "🏅", "Badges"], ["parents", "👪", "Parents"]];
const TITLES = { home: null, wudu: ["Learn Wudu", "Follow each step and tap to count"], salah: ["Learn Salah", "Step by step through a 2 rak'ah prayer"], recite: ["Recite", "The words we say in salah"], play: ["Play & learn", "Games that earn stars"], tracker: ["Prayer tracker", "Tick each prayer you pray"], badges: ["Badges", "Collect them all!"], parents: ["Parents' corner", "Settings and a note for grown-ups"] };

function App() {
  const [s, setS] = useState(load), [burst, setBurst] = useState(0), [toast, setToast] = useState(null);
  const set = useCallback(p => setS(o => { const n = { ...o, ...p }; saveState(n); return n; }), []);
  const go = v => { set({ view: v }); try { window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" }); } catch (e) {} };
  const prevBadges = useRef(null);
  const st = { ...s, streak: streakOf(s.log) }, earned = BADGES.filter(b => b.test(st)).map(b => b.id), stars = starsOf(s);
  useEffect(() => { if (prevBadges.current) { const fresh = earned.filter(b => !prevBadges.current.includes(b));
      if (fresh.length) { const b = BADGES.find(x => x.id === fresh[0]); setToast(`${b.icon} New badge: ${b.name}!`); setBurst(Date.now()); setTimeout(() => setToast(null), 2800); } }
    prevBadges.current = earned; }, [earned.join()]);
  const celebrate = msg => { setBurst(Date.now()); setToast(msg); setTimeout(() => setToast(null), 2600); };
  const togglePrayer = id => { const k = todayKey(), d = s.log[k] || [], on = d.includes(id); set({ log: { ...s.log, [k]: on ? d.filter(x => x !== id) : [...d, id] } }); if (!on && d.length === 4) celebrate("🖐️ All five prayers today, masha'Allah!"); };
  const view = TITLES[s.view] !== undefined ? s.view : "home", title = TITLES[view];
  const body = {
    home: <Home s={s} go={go} togglePrayer={togglePrayer} />,
    wudu: <Wudu kid={s.kid} onDone={() => { set({ wuduDone: s.wuduDone + 1 }); celebrate("💧 +5 stars! Wudu complete"); }} />,
    salah: <Salah kid={s.kid} onDone={() => { set({ salahDone: s.salahDone + 1 }); celebrate("🕌 +5 stars! Salah complete"); }} />,
    recite: <Recite s={s} setKnown={(id, v) => { set({ known: { ...s.known, [id]: v } }); if (v) celebrate("⭐ +3 stars! Keep going"); }} />,
    play: <Play s={s} onQuiz={n => { if (n > s.bestQuiz) set({ bestQuiz: n }); if (n === QUIZ.length) celebrate("🏆 Perfect quiz!"); }} onOrder={() => { set({ orderWins: s.orderWins + 1 }); celebrate("🧩 +3 stars!"); }} />,
    tracker: <Tracker s={s} togglePrayer={togglePrayer} />,
    badges: <Badges s={s} />,
    parents: <Parents s={s} set={set} reset={() => { const keep = { name: s.name, avatar: s.avatar, kid: s.kid }; setS({ ...FRESH, ...keep }); saveState({ ...FRESH, ...keep }); }} />,
  }[view];
  return <div className="app">
    <div className="sky" aria-hidden="true"><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /></div>
    <aside className="glass side">
      <div className="brand"><span className="logo">🌙</span><div><b>Little Salah</b><small>Learn wudu &amp; prayer</small></div></div>
      <nav className="nav">{NAV.map(([v, e, n]) => <button key={v} className={"nav-i" + (view === v ? " on" : "")} aria-current={view === v ? "page" : undefined} onClick={() => go(v)}><span>{e}</span>{n}</button>)}</nav>
      <div className="side-foot">The Geek Next Door Co.</div>
    </aside>
    <main className="main">
      <header className="top">
        <div className="hello"><span className="avatar">{s.avatar}</span><div><p className="eyebrow">Assalamu alaikum</p><h1>{title ? title[0] : s.name + "!"}</h1>{title && <p className="muted">{title[1]}</p>}</div></div>
        <div className="pills"><span className="glass pill" title="Stars">⭐ <b>{stars}</b></span><span className="glass pill" title="Daily streak">🔥 <b>{st.streak}</b></span></div>
      </header>
      <div className="view" key={view}>{body}</div>
    </main>
    <nav className="glass tabbar" aria-label="Sections">{NAV.map(([v, e, n]) => <button key={v} className={view === v ? "on" : ""} aria-current={view === v ? "page" : undefined} onClick={() => go(v)}><span>{e}</span>{n}</button>)}</nav>
    <Confetti burst={burst} />
    {toast && <div className="toast glass" role="status">{toast}</div>}
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
