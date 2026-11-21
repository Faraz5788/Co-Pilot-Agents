// Browser test for Little Salah. Usage: node test.js <preview html> <node_modules dir with react UMD> <shots dir>
const {chromium} = require('playwright'); const fs = require('fs');
(async () => { const [file, nm, U] = process.argv.slice(2); const errs = [], R = {};
  // local copy of React so the test doesn't depend on the CDN
  let h = fs.readFileSync(file, 'utf8')
    .replace('https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js', 'file://' + nm + '/react/umd/react.production.min.js')
    .replace('https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js', 'file://' + nm + '/react-dom/umd/react-dom.production.min.js');
  fs.writeFileSync(U + '/_t.html', '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>' + h + '</body></html>');
  const b = await chromium.launch(); const watch = (p, t) => { p.on('pageerror', e => errs.push(t + ':' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errs.push(t + ':' + m.text()); }); };
  const p = await b.newPage({viewport: {width: 1366, height: 900}}); watch(p, 'd');
  await p.goto('file://' + U + '/_t.html'); await p.waitForTimeout(900);
  R.home = await p.textContent('h1'); await p.screenshot({path: U + '/home.png'});
  // wudu: go through all steps tapping
  await p.click('.nav-i:has-text("Wudu")'); await p.waitForTimeout(300); await p.screenshot({path: U + '/wudu.png'});
  for (let s = 0; s < 9; s++) { for (let k = 0; k < 3; k++) { const btn = await p.$('.counter .btn.primary'); if (btn) await btn.click(); }
    await p.click('.counter .btn.sun'); await p.waitForTimeout(80); }
  R.wuduEnd = await p.textContent('h2'); await p.waitForTimeout(400); R.toast = await p.textContent('.toast').catch(() => null);
  // salah walk-through
  await p.click('.nav-i:has-text("Salah")'); await p.waitForTimeout(300); for (let s = 0; s < 3; s++) await p.click('.lesson .btn.primary');
  await p.screenshot({path: U + '/salah.png'});
  for (let s = 3; s < 11; s++) await p.click('.lesson .btn.primary'); R.salahEnd = await p.textContent('.pop h2');
  // recite: mark Al-Fatihah known, practice mode
  await p.click('.nav-i:has-text("Recite")'); await p.click('text=⭐ I know it!'); await p.click('label.switch'); R.practice = await p.isChecked('#hideTr'); await p.screenshot({path: U + '/recite.png'});
  // play: order game + quiz (always correct answers)
  await p.click('.nav-i:has-text("Play")'); await p.click('text=Wudu in order');
  const order = ["Intention & Bismillah","Wash your hands","Rinse your mouth","Clean your nose","Wash your face","Wash your arms","Wipe your head","Wipe your ears","Wash your feet"];
  for (const o of order) await p.click(`.order-card:has-text("${o}")`); R.order = await p.textContent('.pop h2'); await p.click('text=Back to games');
  await p.click('text=Salah quiz');
  const correct = ["Bismillah","3 times","Right","2","3","Subhana Rabbiyal-'Adhim","Al-Fatihah","Say salam to the right and left","The qiblah (the Kaaba)","5"];
  for (const c of correct) { await p.click(`.answer >> text="${c}"`); await p.waitForTimeout(1000); }
  R.quiz = await p.textContent('.pop h2');
  // tracker: all five
  await p.click('.nav-i:has-text("Tracker")'); for (const n of ['Fajr','Dhuhr','Asr','Maghrib','Isha']) await p.click(`.prayer:has-text("${n}")`);
  await p.screenshot({path: U + '/tracker.png'});
  await p.click('.nav-i:has-text("Badges")'); R.badges = await p.$$eval('.badge.on', e => e.length); await p.screenshot({path: U + '/badges.png'});
  R.stars = await p.textContent('.pill b');
  await p.click('.nav-i:has-text("Parents")'); await p.fill('#kidName', 'Yusuf'); await p.click('.av:has-text("🐼")');
  await p.reload(); await p.waitForTimeout(600); R.persist = await p.textContent('h1') + ' ' + await p.textContent('.avatar');
  await p.click('.nav-i:has-text("Home")'); await p.waitForTimeout(400); await p.screenshot({path: U + '/home-progress.png'});
  // dark mode + phone
  const d = await b.newPage({viewport: {width: 1366, height: 900}, colorScheme: 'dark'}); watch(d, 'dark'); await d.goto('file://' + U + '/_t.html'); await d.waitForTimeout(700);
  await d.click('.nav-i:has-text("Salah")'); await d.screenshot({path: U + '/salah-dark.png'});
  const m = await b.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}); watch(m, 'm'); await m.goto('file://' + U + '/_t.html'); await m.waitForTimeout(700);
  const over = [];
  for (const v of ['Home','Wudu','Salah','Recite','Play','Tracker','Badges','Parents']) { await m.click(`.tabbar button:has-text("${v}")`); await m.waitForTimeout(250);
    const w = await m.evaluate(() => document.documentElement.scrollWidth); if (w > 390) over.push(v + ':' + w); if (['Home','Wudu','Salah'].includes(v)) await m.screenshot({path: U + `/m-${v}.png`}); }
  R.mobileOverflow = over.length ? over : 'none';
  console.log(JSON.stringify({errs, ...R}, null, 1)); await b.close(); })();
