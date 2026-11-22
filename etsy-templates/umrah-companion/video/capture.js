// Captures real Umrah Companion screens at phone size for the Etsy listing video.
// Usage: node capture.js <app html> <out dir>
const {chromium} = require('playwright'); const fs = require('fs');
(async () => { const [app, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
  const b = await chromium.launch(); const meta = {};
  const page = async (lang, extra = {}) => { const c = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'light'});
    await c.addInitScript(s => localStorage.setItem('umrah-companion-v1', JSON.stringify(s)), {lang, theme: 'light', date: '2027-02-12', tawaf: 0, ...extra});
    const p = await c.newPage(); await p.goto('file://' + app); await p.waitForTimeout(900); return p; };
  const go = async (p, v) => { await p.click(`.tabs-m [data-v="${v}"]`); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150); };
  // tawaf counter: rounds 3 -> 7
  let p = await page('en', {tawaf: 2}); await go(p, 'tawaf');
  const bb = await p.locator('.tap').boundingBox(); meta.tap = {x: bb.x + bb.width / 2, y: bb.y + bb.height / 2};
  for (let r = 2; r <= 6; r++) { await p.screenshot({path: `${out}/tawaf-${r}.png`}); await p.click('.tap'); await p.waitForTimeout(450); }
  await p.screenshot({path: `${out}/tawaf-7.png`});
  await p.screenshot({path: `${out}/tabbar.png`, clip: {x: 0, y: 844 - 72, width: 390, height: 72}});
  // duas in four languages
  for (const l of ['en', 'ur', 'hi', 'id']) { p = await page(l); await go(p, 'duas'); await p.screenshot({path: `${out}/duas-${l}.png`}); }
  // ziyarat and phrases: tall pages for a scroll effect (tab bar hidden, laid back on top later)
  for (const v of ['ziyarat', 'phrases']) { p = await page('en'); await go(p, v); await p.addStyleTag({content: '.tabs-m{display:none!important}'});
    await p.screenshot({path: `${out}/${v}-full.png`, fullPage: true}); meta[v] = await p.evaluate(() => document.documentElement.scrollHeight); }
  fs.writeFileSync(`${out}/meta.json`, JSON.stringify(meta)); await b.close(); console.log(JSON.stringify(meta)); })();
