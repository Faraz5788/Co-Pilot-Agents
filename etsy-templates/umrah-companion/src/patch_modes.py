"""One-off: add demo / unlock-code modes to template.html (kept for reference)."""
p = "template.html"; s = open(p).read()
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
rep('const KEY = "umrah-companion-v1";', '''const KEY = "umrah-companion-v1";
const MODE = "__MODE__", ETSY_URL = "__ETSY_URL__", CODE_HASH = "__CODE_HASH__";   // MODE: file/preview (full) | web (demo until unlocked) | demo
function licensed(){ try { return localStorage.getItem("umrah-licence") === CODE_HASH; } catch(e) { return false; } }
const DEMO = MODE === "demo" || (MODE === "web" && !licensed());
const DEMO_DUAS = ["travel","niyyah","talbiyah","enter_masjid","see_kaaba","start_round","rabbana"];
const lockedDua = d => DEMO && !DEMO_DUAS.includes(d.id);
async function sha256(x){ const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x)); return [...new Uint8Array(b)].map(v => v.toString(16).padStart(2, "0")).join(""); }
const getFull = () => `<a class="btn sm gold" href="${ETSY_URL}" target="_blank" rel="noopener" style="text-decoration:none">${esc(t("get_full"))}</a>`;
const lockCard = (title, sub) => `<div class="card lockc"><div class="lk">🔒</div><div><h3 style="margin:0 0 4px">${esc(title)}</h3>${sub ? `<p style="margin:0 0 8px;color:var(--mute)">${esc(sub)}</p>` : ""}<p style="margin:0 0 10px;font-weight:600;color:var(--gold)">${esc(t("locked"))}</p>${getFull()}</div></div>`;
const unlockBox = () => MODE !== "web" ? "" : DEMO
  ? `<div class="card" id="unlockBox" style="margin-bottom:16px;border:2px solid var(--gold)"><h3>${esc(t("unlock_t"))}</h3><p style="color:var(--mute);margin-top:0">${esc(t("unlock_sub"))}</p><div class="row"><input id="code" class="inp" placeholder="${esc(t("code_ph"))}" autocapitalize="characters" style="text-transform:uppercase;max-width:260px"><button class="btn" data-a="unlockCode">${esc(t("unlock"))}</button></div></div>`
  : `<div class="card" style="margin-bottom:16px"><b>✓ ${esc(t("unlocked_ok"))}</b> <span style="color:var(--mute)">${esc(t("a2hs"))}</span></div>`;''')
# dua cards: locked ones show a lock card
rep('function duaCard(d, compact){\n', 'function duaCard(d, compact){\n  if (lockedDua(d)) return lockCard(L(d.title), L(CATS[d.cat]));\n')
# ziyarat: first 2 per city open in demo
rep('<div class="grid g2">${list.map(z => `<div class="card zcard">', '<div class="grid g2">${list.map((z, zi) => DEMO && zi > 1 ? lockCard(L(z.nm), L(z.sum)) : `<div class="card zcard">')
# phrases: greetings open in demo
rep('${list.map(p => `<div class="card dua phrase">', '${list.map(p => DEMO && p.cat !== "greet" ? lockCard(p.ar + "  ·  " + L(p.m), "") : `<div class="card dua phrase">')
# madinah guide: first section open in demo
rep('${MADINAH.map(s => `<div class="card"><h3>', '${MADINAH.map((s, si) => DEMO && si > 0 ? lockCard(L(s.title), "") : `<div class="card"><h3>')
# settings + home: unlock box; drop the "preview" review note
rep('<p style="font-size:13px;color:var(--mute);margin:12px 0 0">${esc(t("preview"))}: Arabic text, rulings and translations are being reviewed before release.</p>', '')
rep('return `<div class="top"><div><h1>${esc(t("settings"))}</h1></div></div><div class="grid g2">', 'return `<div class="top"><div><h1>${esc(t("settings"))}</h1></div></div>${unlockBox()}<div class="grid g2">')
# demo banner on every page
rep('<main>${V[view]()}', '<main>${DEMO ? `<div class="demobar"><span>🌙 ${esc(t("demo_bar"))}</span><span class="row" style="gap:8px">${MODE === "web" ? `<button class="btn sm ghost" data-v="settings">${esc(t("have_code"))}</button>` : ""}${getFull()}</span></div>` : ""}${V[view]()}')
# unlock action
rep('  if (act === "pcat") {', '''  if (act === "unlockCode") { const c = (document.getElementById("code").value || "").trim().toUpperCase(); if (!c) return;
    if (await sha256(c) === CODE_HASH) { try { localStorage.setItem("umrah-licence", CODE_HASH); } catch(e) {} location.reload(); } else toast(t("code_bad")); }
  if (act === "pcat") {''')
rep('.tabs-m{display:none}', '''.tabs-m{display:none}
.demobar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;background:var(--emerald);color:#fff;border-radius:16px;padding:10px 14px;margin-bottom:18px;font-weight:600}
.demobar .btn.ghost{color:#fff;border-color:rgba(255,255,255,.6)}
.lockc{display:flex;gap:14px;align-items:flex-start;opacity:.92}.lockc .lk{font-size:26px;line-height:1}''')
open(p, "w").write(s)
