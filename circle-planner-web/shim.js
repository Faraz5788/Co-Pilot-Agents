/* Circle Planner: Supabase connector.
 *
 * The planner UI was first built as a claude.ai artifact, where it talks to storage through
 * `window.claude.use("db")` and `window.claude.use("user")`. This file provides the same two
 * interfaces on top of Supabase, so the UI runs unchanged as a standalone web app. It also
 * owns the screens before the app: sign in, create or join a group, pick a group.
 *
 * Data model (see supabase/schema.sql): every planner record is a row in `docs`
 * (group_id, path, data jsonb), e.g. path "events/abc" or "lists/x/items/y". Row level
 * security limits each group's rows to its members; owner-only paths are enforced there too.
 */
(() => {
  const SUPABASE_URL = "https://xfzkugkhascthehwnxrw.supabase.co";
  const SUPABASE_KEY = "sb_publishable_XN-Ho72GUQ1RHAKqE58exA_oqwRdeKy"; // publishable key: safe in the browser
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} }
  };

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" }
  });

  // ---------------- small DOM helper for the gate screens ----------------
  const gate = () => document.getElementById("gate");
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v; else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c));
    return n;
  };
  function showGate(...content) {
    document.body.classList.add("gated");
    const g = gate(); g.hidden = false;
    g.replaceChildren(el("div", { class: "gcard" },
      el("div", { class: "gbrand" }, el("span", { class: "gplume", "aria-hidden": "true" }), el("span", { text: "Circle Planner" })),
      ...content));
  }
  const errText = e => (e && (e.message || e.error_description)) || "Something went wrong. Please try again.";

  // ---------------- 1. sign in ----------------
  function signInScreen(note) {
    const email = el("input", { type: "email", id: "gEmail", autocomplete: "email", inputmode: "email", required: true, placeholder: "you@example.com" });
    const name = el("input", { type: "text", id: "gName", autocomplete: "given-name", maxlength: "30", placeholder: "e.g. Faraz" });
    name.value = LS.get("cp-pending-name") || "";
    const msg = el("p", { class: "gerr", role: "alert" });
    const btn = el("button", { type: "submit", class: "gbtn", text: "Email me a sign-in link" });
    const invite = sessionStorage.getItem("cp-join");
    showGate(
      el("h1", { text: invite ? "You've been invited" : "Plan together" }),
      el("p", { class: "glead", text: invite ? "Sign in with your email to join the group. No password needed." : "One shared calendar, lists, trips and chat for your family, friends or housemates." }),
      note ? el("p", { class: "gnote", text: note }) : null,
      el("form", { class: "gform", novalidate: true, onsubmit: async e => {
        e.preventDefault(); msg.textContent = "";
        const em = email.value.trim();
        if (!/^\S+@\S+\.\S+$/.test(em)) { msg.textContent = "Enter a valid email address."; return; }
        LS.set("cp-pending-name", name.value.trim() || null);
        btn.disabled = true; btn.textContent = "Sending…";
        const { error } = await sb.auth.signInWithOtp({ email: em, options: { emailRedirectTo: location.origin + location.pathname } });
        btn.disabled = false; btn.textContent = "Email me a sign-in link";
        if (error) { msg.textContent = /rate/i.test(error.message) ? "Too many emails sent just now. Wait a few minutes and try again." : errText(error); return; }
        showGate(el("h1", { text: "Check your email" }),
          el("p", { class: "glead", text: `We sent a sign-in link to ${em}. Open it on this device and you'll come straight back here.` }),
          el("p", { class: "gnote", text: "Can't see it? Check spam or promotions, or go back and try again." }),
          el("button", { type: "button", class: "gbtn ghost", text: "Use a different email", onclick: () => signInScreen() }));
      } },
        el("label", { class: "gfield" }, el("span", { text: "Your first name" }), name),
        el("label", { class: "gfield" }, el("span", { text: "Email" }), email),
        msg, btn),
      el("p", { class: "gfine", text: "By signing in you agree to keep your group's information private. We only use your email to sign you in." }));
    setTimeout(() => (email.value ? btn : email).focus(), 50);
  }

  // ---------------- 2. groups ----------------
  async function myGroups(uid) {
    const { data, error } = await sb.from("group_members").select("group_id, role, access, until, groups(name)").eq("user_id", uid);
    if (error) throw error;
    return (data || []).map(r => ({ id: r.group_id, role: r.role, access: r.access, until: r.until, name: r.groups?.name || "" }));
  }
  const activeIn = g => g.role === "owner" || (g.access !== "removed" && (!g.until || g.until >= new Date().toISOString().slice(0, 10)));

  function createGroupScreen(user, groups) {
    const name = el("input", { type: "text", id: "gGroup", maxlength: "40", placeholder: "e.g. The Tak family, Flat 4, Year 2 Law" });
    const msg = el("p", { class: "gerr", role: "alert" });
    showGate(
      el("h1", { text: groups.length ? "Start another group" : "Create your group" }),
      el("p", { class: "glead", text: "A group is the people you plan with: your household, a couple, friends or a study group. You'll invite them next." }),
      el("form", { class: "gform", novalidate: true, onsubmit: async e => {
        e.preventDefault(); msg.textContent = "";
        const id = crypto.randomUUID(), n = name.value.trim();
        const { error } = await sb.from("groups").insert({ id, name: n, created_by: user.id });
        if (error) { msg.textContent = errText(error); return; }
        await sb.from("docs").upsert({ group_id: id, path: "family/settings", coll: "family", data: { groupName: n, groupType: "", profiles: [], parents: {} } });
        enterGroup(user, { id, role: "owner", access: "family", name: n });
      } },
        el("label", { class: "gfield" }, el("span", { text: "Group name" }), name), msg,
        el("button", { type: "submit", class: "gbtn", text: "Create group" })),
      groups.length ? el("button", { type: "button", class: "gbtn ghost", text: "Back to my groups", onclick: () => pickGroupScreen(user, groups) }) : null,
      el("p", { class: "gnote", text: "Been invited? Open the invite link you were sent and you'll join that group instead." }),
      el("button", { type: "button", class: "glink", text: `Signed in as ${user.email}. Sign out`, onclick: signOut }));
    setTimeout(() => name.focus(), 50);
  }

  function pickGroupScreen(user, groups) {
    showGate(
      el("h1", { text: "Your groups" }),
      el("div", { class: "glist" }, groups.map(g => el("button", { type: "button", class: "gitem", disabled: !activeIn(g), onclick: () => enterGroup(user, g) },
        el("b", { text: g.name || "Untitled group" }),
        el("span", { text: g.role === "owner" ? "Owner" : !activeIn(g) ? (g.access === "removed" ? "Access removed" : "Visit ended") : g.access === "visitor" ? `Visiting until ${new Date(g.until).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : "Member" })))),
      el("button", { type: "button", class: "gbtn ghost", text: "+ Start a new group", onclick: () => createGroupScreen(user, groups) }),
      el("button", { type: "button", class: "glink", text: `Signed in as ${user.email}. Sign out`, onclick: signOut }));
  }

  async function signOut() { LS.set("cp-group", null); await sb.auth.signOut(); location.replace(location.origin + location.pathname); }

  // ---------------- 3. storage shim: window.claude.use("db") ----------------
  function makeDb(groupId) {
    const store = new Map(); // path -> data
    const listeners = new Set();
    let loaded = false, pending = false;
    const collOf = p => p.replace(/\/[^/]+$/, "");
    const idOf = p => p.slice(p.lastIndexOf("/") + 1);
    const clone = v => v == null ? v : JSON.parse(JSON.stringify(v));
    const meta = () => ({ fromCache: !loaded, hasPendingWrites: false });
    const snapDoc = path => { const d = store.get(path); return { id: idOf(path), exists: d !== undefined, data: () => clone(d), metadata: meta() }; };
    const cmp = (a, op, b) => {
      switch (op) {
        case "==": return a === b; case "!=": return a !== b; case "<": return a < b; case "<=": return a <= b;
        case ">": return a > b; case ">=": return a >= b; case "in": return (b || []).includes(a); case "not-in": return !(b || []).includes(a);
        case "array-contains": return Array.isArray(a) && a.includes(b); default: return false;
      }
    };
    function runQuery(q) {
      let rows = [];
      for (const [p, d] of store) if (collOf(p) === q.coll) rows.push([p, d]);
      for (const [f, op, v] of q.wheres) rows = rows.filter(([, d]) => cmp(d?.[f], op, v));
      if (q.order) { const [f, dir] = q.order, s = dir === "desc" ? -1 : 1; rows.sort((a, b) => { const x = a[1]?.[f], y = b[1]?.[f]; return x === y ? 0 : (x === undefined ? 1 : y === undefined ? -1 : (x < y ? -1 : 1) * s); }); }
      else rows.sort((a, b) => idOf(a[0]) < idOf(b[0]) ? -1 : 1);
      if (q.lim) rows = rows.slice(0, q.lim);
      const docs = rows.map(([p]) => snapDoc(p));
      return { docs, size: docs.length, empty: !docs.length, metadata: meta(), docChanges: () => [] };
    }
    function notify() { pending = false; for (const l of [...listeners]) { try { l.next(l.path ? snapDoc(l.path) : runQuery(l.q)); } catch (e) { console.error(e); } } }
    const notifySoon = () => { if (!pending) { pending = true; queueMicrotask(notify); } };
    const dbErr = error => ({ code: error?.code === "42501" || /row-level security|permission/i.test(error?.message || "") ? "invalid_argument" : "unavailable", message: error?.message || "Request failed" });

    async function loadAll() {
      const next = new Map();
      for (let from = 0; ; from += 1000) {
        const { data, error } = await sb.from("docs").select("path,data").eq("group_id", groupId).order("path").range(from, from + 999);
        if (error) throw error;
        for (const r of data) next.set(r.path, r.data);
        if (data.length < 1000) break;
      }
      store.clear(); for (const [k, v] of next) store.set(k, v);
      loaded = true; notifySoon();
    }
    sb.channel(`docs-${groupId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "docs", filter: `group_id=eq.${groupId}` }, payload => {
        if (payload.eventType === "DELETE") store.delete(payload.old?.path); else store.set(payload.new.path, payload.new.data);
        notifySoon();
      })
      .subscribe(status => { if (status === "SUBSCRIBED" && loaded) loadAll().catch(() => {}); });
    // catch up after the phone was asleep or offline
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") loadAll().catch(() => {}); });
    window.addEventListener("online", () => loadAll().catch(() => {}));

    const merge = (a, b) => { const out = { ...(a || {}) }; for (const [k, v] of Object.entries(b || {})) out[k] = v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k]) ? merge(out[k], v) : v; return out; };
    async function write(path, data) {
      const before = store.get(path);
      store.set(path, clone(data)); notifySoon();
      const { error } = await sb.from("docs").upsert({ group_id: groupId, path, coll: collOf(path), data });
      if (error) { before === undefined ? store.delete(path) : store.set(path, before); notifySoon(); throw dbErr(error); }
    }
    function doc(path) {
      return {
        id: idOf(path), path,
        get: async () => snapDoc(path),
        set: data => write(path, data),
        update: async patch => { const cur = store.get(path); if (cur === undefined) throw { code: "invalid_argument", message: "Document does not exist" }; return write(path, merge(cur, patch)); },
        delete: async () => {
          const before = store.get(path); store.delete(path); notifySoon();
          const { error } = await sb.from("docs").delete().eq("group_id", groupId).eq("path", path);
          if (error) { if (before !== undefined) store.set(path, before); notifySoon(); throw dbErr(error); }
        },
        onSnapshot(next) { const l = { path, next }; listeners.add(l); if (loaded) queueMicrotask(() => listeners.has(l) && next(snapDoc(path))); return () => listeners.delete(l); },
        collection: sub => collection(`${path}/${sub}`)
      };
    }
    function query(q) {
      return {
        where: (f, op, v) => query({ ...q, wheres: [...q.wheres, [f, op, v]] }),
        orderBy: (f, dir = "asc") => query({ ...q, order: [f, dir] }),
        limit: n => query({ ...q, lim: n }),
        get: async () => runQuery(q),
        onSnapshot(next) { const l = { q, next }; listeners.add(l); if (loaded) queueMicrotask(() => listeners.has(l) && next(runQuery(q))); return () => listeners.delete(l); }
      };
    }
    function collection(c) {
      return Object.assign(query({ coll: c, wheres: [], order: null, lim: 0 }), {
        path: c,
        doc: id => doc(`${c}/${id || crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`),
        add: async data => { const d = doc(`${c}/${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`); await d.set(data); return d; }
      });
    }
    const api = { doc, collection, store };
    api.ready = loadAll();
    return api;
  }

  // ---------------- 4. identity shim: window.claude.use("user") ----------------
  const PALETTE = ["#8C52B5", "#14839F", "#AD5B2A", "#2F72CC", "#647F25", "#5B4CC8"];
  const colorFor = id => PALETTE[[...String(id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % PALETTE.length];
  function makeUser(user, membership, db) {
    const displayName = user.user_metadata?.name || (user.email || "").split("@")[0];
    const isOwner = membership.role === "owner";
    const nameFor = id => db.store.get(`members/${id}`)?.nickname || (id === user.id ? displayName : "");
    return {
      isOwner: async () => isOwner,
      canEdit: async () => isOwner,
      can: async name => name === "data.write" ? activeIn(membership) : name === "people.add" ? isOwner : false,
      id: async () => user.id,
      name: async () => displayName,
      email: async () => user.email || null,
      avatarUrl: async () => null,
      me: async () => ({ id: user.id, name: displayName, avatarUrl: "", color: colorFor(user.id), email: user.email || null, isOwner, canEdit: isOwner }),
      profiles: async ids => Object.fromEntries([...new Set([].concat(ids))].map(id => [id, { id, name: nameFor(id), avatarUrl: "", color: colorFor(id), email: null, isMe: id === user.id, guest: false }])),
      search: async () => []
    };
  }

  // ---------------- 5. enter a group and start the app ----------------
  let started = false;
  async function enterGroup(user, membership) {
    if (!activeIn(membership)) {
      showGate(el("h1", { text: membership.access === "removed" ? "Your access was removed" : "Your visit has ended" }),
        el("p", { class: "glead", text: membership.access === "removed" ? `You no longer have access to ${membership.name || "this group"}. Ask the owner if you think this is a mistake.` : `Your shared access to ${membership.name || "this group"} ended on ${new Date(membership.until).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}. Ask the owner to extend it.` }),
        el("button", { type: "button", class: "gbtn ghost", text: "Back to my groups", onclick: () => boot(true) }),
        el("button", { type: "button", class: "glink", text: "Sign out", onclick: signOut }));
      return;
    }
    LS.set("cp-group", membership.id);
    if (started) { location.reload(); return; }
    started = true;
    const db = makeDb(membership.id);
    const userApi = makeUser(user, membership, db);
    window.cpGroup = membership;
    window.cpCreateInvite = async () => { const { data, error } = await sb.rpc("create_invite", { g: membership.id }); if (error) throw error; return data; };
    window.cpSwitchGroup = () => { LS.set("cp-group", null); location.replace(location.origin + location.pathname + "?groups=1"); };
    window.cpSignOut = signOut;
    window.claude = { use: async name => name === "db" ? db : name === "user" ? userApi : null };
    try { await db.ready; } catch (e) { console.error(e); }
    document.body.classList.remove("gated"); gate().hidden = true;
    const go = () => window.__cpStart && window.__cpStart();
    if (window.__cpStart) go(); else window.addEventListener("cp-app-ready", go, { once: true });
  }

  async function boot(forcePicker) {
    const params = new URLSearchParams(location.search);
    const code = params.get("join");
    if (code) { sessionStorage.setItem("cp-join", code); }
    if (code || params.has("groups")) history.replaceState(null, "", location.pathname);
    showGate(el("p", { class: "glead", text: "Loading…" }));

    const { data: { session } } = await sb.auth.getSession();
    if (!session) return signInScreen();
    const user = session.user;
    const pendingName = LS.get("cp-pending-name");
    if (pendingName && !user.user_metadata?.name) { await sb.auth.updateUser({ data: { name: pendingName } }); user.user_metadata = { ...(user.user_metadata || {}), name: pendingName }; }
    LS.set("cp-pending-name", null);

    let joinedId = null;
    const pendingCode = sessionStorage.getItem("cp-join");
    if (pendingCode) {
      sessionStorage.removeItem("cp-join");
      const { data, error } = await sb.rpc("join_group", { c: pendingCode });
      if (error) {
        const groups = await myGroups(user.id).catch(() => []);
        showGate(el("h1", { text: "That invite didn't work" }),
          el("p", { class: "glead", text: /expired|not valid/i.test(error.message) ? "The link has expired or was mistyped. Ask for a new invite link." : errText(error) }),
          el("button", { type: "button", class: "gbtn", text: groups.length ? "Go to my groups" : "Create my own group", onclick: () => groups.length ? pickGroupScreen(user, groups) : createGroupScreen(user, groups) }));
        return;
      }
      joinedId = data;
    }

    let groups;
    try { groups = await myGroups(user.id); }
    catch (e) { return showGate(el("h1", { text: "Can't connect" }), el("p", { class: "glead", text: "Check your internet connection and try again." }), el("button", { type: "button", class: "gbtn", text: "Try again", onclick: () => boot() })); }
    const wanted = joinedId || (!forcePicker && !params.has("groups") && LS.get("cp-group"));
    const pick = groups.find(g => g.id === wanted);
    if (pick) return enterGroup(user, pick);
    if (!groups.length) return createGroupScreen(user, groups);
    if (groups.length === 1 && !forcePicker && !params.has("groups")) return enterGroup(user, groups[0]);
    pickGroupScreen(user, groups);
  }

  window.CP_WEB = true;
  sb.auth.onAuthStateChange(evt => { if (evt === "SIGNED_IN" && !started && document.getElementById("gEmail")) boot(); });
  boot().catch(e => { console.error(e); showGate(el("h1", { text: "Something went wrong" }), el("p", { class: "glead", text: errText(e) }), el("button", { type: "button", class: "gbtn", text: "Try again", onclick: () => location.reload() })); });
})();
