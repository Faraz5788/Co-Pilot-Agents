// Screenshots of the full app for listing photos. Usage: node shots.js <dist html> <out dir>
const {chromium} = require('playwright');
(async () => { const [file, U] = process.argv.slice(2); const b = await chromium.launch();
  const seed = st => `localStorage.setItem("umrah-companion-v1", ${JSON.stringify(JSON.stringify(st))})`;
  const base = {date: "2027-02-12", done: {prepare: true, ihram: true, enter: true}, tawaf: 4, sai: 0, fav: ["rabbana", "zamzam"], chk: {"0-0": true, "0-1": true, "0-2": true, "1-0": true}, theme: "light"};
  async function page(w, h, st, mobile) { const c = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2, isMobile: !!mobile}); await c.addInitScript(seed(st));
    const p = await c.newPage(); await p.goto('file://' + file); await p.waitForTimeout(1200); return p; }
  const go = async (p, v, sel) => { await p.click(`${sel} [data-v="${v}"]`); await p.waitForTimeout(400); };
  let p = await page(1280, 820, {...base, lang: "en"});
  for (const v of ["home", "steps", "tawaf", "duas", "madinah", "phrases", "checklist"]) { await go(p, v, "nav"); await p.screenshot({path: `${U}/${v}.png`}); }
  await go(p, "ziyarat", "nav"); await p.screenshot({path: `${U}/ziyarat.png`}); await p.click('[data-a="zcity"][data-c="madinah"]'); await p.waitForTimeout(300); await p.screenshot({path: `${U}/ziyarat-mad.png`});
  p = await page(1280, 820, {...base, lang: "en", theme: "dark"}); await go(p, "sai", "nav"); await p.screenshot({path: `${U}/sai-dark.png`});
  const c = await b.newContext({viewport: {width: 1280, height: 820}, deviceScaleFactor: 2}); const lp = await c.newPage(); await lp.goto('file://' + file); await lp.waitForTimeout(1200); await lp.screenshot({path: `${U}/picker.png`});
  for (const [l, v] of [["en", "tawaf"], ["ur", "duas"], ["hi", "phrases"], ["bn", "ziyarat"], ["id", "duas"], ["tr", "steps"], ["tl", "phrases"]]) {
    const m = await page(390, 844, {...base, lang: l}, true); await go(m, v, ".tabs-m"); await m.screenshot({path: `${U}/m-${l}-${v}.png`}); }
  await b.close(); })();
