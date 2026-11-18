// Tests the website (demo -> unlock) and the offline file. Usage: node test_site.js <http base url of ../site> <path to dist file> <shots dir>
const {chromium} = require('playwright');
(async () => { const [base, file, U] = process.argv.slice(2); const b = await chromium.launch(); const errs = []; const R = {};
  const c = await b.newContext({viewport: {width: 1280, height: 860}}); const p = await c.newPage();
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + '/'); await p.waitForTimeout(800); await p.click('[data-pick="en"]');
  R.demobar = !!(await p.$('.demobar')); await p.screenshot({path: U + '/w-demo-home.png'});
  await p.click('nav [data-v="duas"]'); R.demoDuasOpen = await p.$$eval('.dua', e => e.length); R.demoDuasLocked = await p.$$eval('.lockc', e => e.length); await p.screenshot({path: U + '/w-demo-duas.png'});
  await p.click('nav [data-v="ziyarat"]'); R.demoZ = [await p.$$eval('.zcard', e => e.length), await p.$$eval('.lockc', e => e.length)];
  await p.click('nav [data-v="phrases"]'); R.demoP = [await p.$$eval('.phrase', e => e.length), await p.$$eval('.lockc', e => e.length)];
  await p.click('nav [data-v="tawaf"]'); for (let i = 0; i < 7; i++) await p.click('[data-a="count"]'); R.tawaf = !!(await p.$('.done-msg'));
  await p.click('.demobar [data-v="settings"]'); await p.fill('#code', 'WRONG-CODE'); await p.click('[data-a="unlockCode"]'); await p.waitForTimeout(300);
  R.wrongToast = await p.textContent('.toast').catch(() => null); R.stillDemo = !!(await p.$('.demobar'));
  await p.fill('#code', 'labbayk-7q2m'); await p.press('#code', 'Enter'); await p.waitForLoadState('load'); await p.waitForTimeout(800);
  R.unlocked = !(await p.$('.demobar')); await p.click('nav [data-v="settings"]'); R.okMsg = await p.textContent('main .card b'); await p.screenshot({path: U + '/w-unlocked.png'});
  await p.click('nav [data-v="duas"]'); R.fullDuas = await p.$$eval('.dua', e => e.length); R.fullLocks = await p.$$eval('.lockc', e => e.length);
  await p.click('nav [data-v="ziyarat"]'); R.fullZ = await p.$$eval('.zcard', e => e.length);
  R.sw = await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()));
  R.tawafKept = await p.evaluate(() => JSON.parse(localStorage.getItem('umrah-companion-v1')).tawaf);
  // phone, Urdu, demo
  const m = await b.newContext({viewport: {width: 390, height: 844}, isMobile: true}); const mp = await m.newPage(); mp.on('pageerror', e => errs.push('m:' + e.message));
  await mp.goto(base + '/'); await mp.waitForTimeout(800); await mp.click('[data-pick="ur"]'); await mp.waitForTimeout(300);
  for (const v of ['home', 'duas', 'ziyarat', 'settings']) { await mp.click(`.tabs-m [data-v="${v}"]`); await mp.waitForTimeout(200); R['mw_' + v] = await mp.evaluate(() => document.documentElement.scrollWidth); await mp.screenshot({path: U + `/w-m-${v}.png`}); }
  // offline file = full, no locks
  const f = await b.newPage(); f.on('pageerror', e => errs.push('f:' + e.message)); await f.goto('file://' + file); await f.waitForTimeout(600); await f.click('[data-pick="en"]');
  await f.click('nav [data-v="duas"]'); R.fileDuas = await f.$$eval('.dua', e => e.length); R.fileDemobar = !!(await f.$('.demobar'));
  console.log(JSON.stringify({errs, ...R}, null, 1)); await b.close(); })();
