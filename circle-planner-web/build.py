#!/usr/bin/env python3
"""Build the standalone web app from the planner UI.

The UI lives in ../circle-planner-app/index.html (also published as a claude.ai artifact).
This script wraps it in a full HTML document, adds the sign-in / group screens, plugs in
shim.js (Supabase storage and identity), and swaps Claude-specific wording for the web flow.

Run:  python3 circle-planner-web/build.py
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "circle-planner-app" / "index.html"
OUT = HERE / "index.html"

s = SRC.read_text()


def R(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f"build.py: expected {count} match(es), found {n}: {old[:90]!r}")
    s = s.replace(old, new)


# ---------- start the app only once the Supabase connector has a signed-in group ----------
R("  start();\n})();", '  window.__cpStart = start;\n  window.dispatchEvent(new Event("cp-app-ready"));\n})();')

# ---------- invites: real links instead of Claude's Share menu ----------
R("  function openInvite() {", r'''  async function webInvite() {
    const body = $("#inviteBody"); body.replaceChildren();
    $("#inviteDlg").showModal();
    if (!S.isOwner) { body.append(h("p", { style: "margin:0", text: "Only the group's owner can create invite links. Ask them to invite the person you'd like to add." })); return; }
    body.append(h("p", { class: "hint", style: "margin:0", text: "Creating your invite link…" }));
    let code;
    try { code = await window.cpCreateInvite(); }
    catch (e) { body.replaceChildren(h("p", { class: "err", text: "Couldn't create an invite link. Check your connection and try again." })); return; }
    const link = `${location.origin}${location.pathname}?join=${code}`;
    const msg = `Hi! Join our shared planner${S.settings.groupName ? ` (“${S.settings.groupName}”)` : ""} so we can share the calendar, lists and plans.\n\nTap to join: ${link}\n\nYou sign in with your email, no password needed. The link works for 14 days.`;
    const msgEl = h("div", { class: "msgbox", text: msg });
    body.replaceChildren(
      h("ol", { class: "isteps" },
        h("li", {}, h("div", {}, h("b", { text: "Send the invite" }), h("p", { text: "Share it on WhatsApp, text or email. Anyone with this link can join for the next 14 days, so send it only to people you want in the group." }))),
        h("li", {}, h("div", {}, h("b", { text: "They tap the link and sign in" }), h("p", { text: "They enter their email and tap the sign-in link we send them. No password and no app store." }))),
        h("li", {}, h("div", {}, h("b", { text: "Choose how long they stay" }), h("p", { text: "They appear under More → People. Set them as Family (ongoing) or Visitor until a date. When a visit ends, their access stops automatically." })))),
      msgEl,
      h("div", { class: "copy" },
        navigator.share ? h("button", { type: "button", class: "btn primary", text: "Share invite…", onclick: async () => { try { await navigator.share({ title: "Join our planner", text: msg }); } catch {} } }) : null,
        h("button", { type: "button", class: navigator.share ? "btn" : "btn primary", text: "Copy invite message", onclick: () => copyText(msg, msgEl, "Invite message copied") }),
        h("button", { type: "button", class: "btn", text: "Copy link only", onclick: () => copyText(link, null, "Link copied") })));
  }
  function openInvite() {
    if (window.CP_WEB) return webInvite();''')

# ---------- More sheet: switch group + sign out ----------
R('''    mk("group", "Group settings", "Name, planner type, people you plan for, appearance", () => { $("#moreDlg").close(); openSettings(); });''',
  '''    mk("group", "Group settings", "Name, planner type, people you plan for, appearance", () => { $("#moreDlg").close(); openSettings(); });
    if (window.CP_WEB) {
      MORE_ICONS.switch = '<path d="M7 7h11l-3-3M17 17H6l3 3"/>'; MORE_COLORS.switch = "var(--muted)";
      MORE_ICONS.signout = '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>'; MORE_COLORS.signout = "var(--muted)";
      mk("switch", "Switch group", "Your other groups, or start a new one", () => window.cpSwitchGroup());
      mk("signout", "Sign out", window.cpGroup?.name ? `Leave this device signed out` : "Sign out on this device", () => window.cpSignOut());
    }''')

# ---------- wording: access is enforced by the server now ----------
R("To stop them opening the page at all, remove them in the Share menu too.", "Their access has stopped.")
R("Remove them in the Share menu so they can't open the planner.", "Their access has stopped. Extend it under People if they're still staying.")
R('"Ask the person who shared this to invite you as an Editor so you can add entries."', '"Ask the group\'s owner to check your access so you can add entries."')
R('"You don\'t have permission to change this. Ask the planner\'s owner to invite you as an Editor."', '"You don\'t have permission to change this. Only the group\'s owner can change some settings."')

# ---------- split into a full document ----------
head, body = s.split('<div class="app">', 1)
body = '<div class="app">' + body
app_script_at = body.index("<script>")

GATE_CSS = """
<style>
/* page reset (the artifact viewer used to provide this) */
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
html,body{margin:0}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:14px}
img{max-width:100%}
[hidden]{display:none!important}
/* sign-in / group screens */
body.gated .app,body.gated .bnav,body.gated .fab{display:none!important}
#gate{min-height:100dvh;display:grid;place-items:center;padding:28px max(16px,env(safe-area-inset-right,0px)) 28px max(16px,env(safe-area-inset-left,0px));box-sizing:border-box;
  background:radial-gradient(120% 70% at 0% 0%,color-mix(in srgb,var(--c1) 45%,transparent),transparent 60%),radial-gradient(90% 60% at 100% 100%,color-mix(in srgb,var(--c0) 40%,transparent),transparent 60%),var(--band)}
.gcard{width:min(420px,100%);background:var(--surface);color:var(--ink);border-radius:24px;padding:28px 22px 24px;box-shadow:0 20px 60px rgb(0 0 0 / .25);box-sizing:border-box}
.gbrand{display:flex;gap:10px;align-items:center;font-weight:700;color:var(--muted);font-size:.9rem;margin-bottom:20px}
.gplume{width:38px;height:6px;border-radius:6px;background:linear-gradient(90deg,var(--c1) 0 24%,var(--c0) 24% 50%,var(--accent) 50% 72%,var(--c2) 72% 90%,var(--c4) 90%)}
.gcard h1{font-family:var(--display);font-weight:400;font-size:2.1rem;margin:0 0 8px;line-height:1.08;text-wrap:balance}
.glead{color:var(--muted);margin:0 0 18px;font-size:1rem;line-height:1.45}
.gform{display:flex;flex-direction:column;gap:12px}
.gfield{display:flex;flex-direction:column;gap:6px;font-weight:600;font-size:.85rem;color:var(--muted)}
.gfield input{font:inherit;font-weight:400;font-size:1rem;color:var(--ink);padding:12px 13px;border-radius:12px;border:1px solid var(--line);background:var(--bg);width:100%;box-sizing:border-box}
.gbtn{border:0;border-radius:12px;padding:14px 16px;background:var(--accent);color:var(--accent-ink);font-weight:700;font-size:1rem;width:100%;cursor:pointer}
.gbtn:disabled{opacity:.6}
.gbtn.ghost{background:transparent;color:var(--accent);border:1px solid var(--line);margin-top:12px}
.gerr{color:var(--warn);min-height:1em;margin:0;font-size:.88rem}
.gnote{background:var(--sunk);border-radius:12px;padding:10px 12px;font-size:.88rem;color:var(--muted);margin:14px 0 0}
.gfine{font-size:.76rem;color:var(--muted);margin:16px 0 0}
.glink{display:block;border:0;background:none;color:var(--muted);text-decoration:underline;margin:16px auto 0;font-size:.84rem;padding:0;cursor:pointer}
.glist{display:flex;flex-direction:column;gap:8px}
.gitem{text-align:left;border:1px solid var(--line);background:var(--bg);border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;gap:2px;cursor:pointer;color:var(--ink)}
.gitem b{font-size:1rem}
.gitem span{font-size:.82rem;color:var(--muted)}
.gitem:disabled{opacity:.55;cursor:default}
</style>
"""

doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="One shared calendar, lists, trips and chat for families, couples, friends, housemates and students.">
<meta name="theme-color" content="#22307E">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Circle">
{head.strip()}
{GATE_CSS}
</head>
<body class="gated">
<div id="gate" role="main"></div>
{body[:app_script_at]}<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
<script src="/shim.js"></script>
{body[app_script_at:]}
</body>
</html>
"""
OUT.write_text(doc)
print(f"wrote {OUT} ({len(doc):,} bytes)")
