// Browser test for Ramadan Companion. Usage: node test.js <preview html> <site base url> <shots dir>
const {chromium} = require('playwright'); const fs = require('fs');
(async () => { const [file, base, U] = process.argv.slice(2); const b = await chromium.launch(); const errs = []; const R = {};
  const wrap = U + '/_t.html'; fs.writeFileSync(wrap, '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + fs.readFileSync(file, 'utf8') + '</body></html>');
  const watch = (p, tag) => { p.on('pageerror', e => errs.push(tag + ':' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errs.push(tag + ':' + m.text()); }); };
  // ---- desktop, English, 20 Feb 2027 15:00 London (day 13, between Fajr and Maghrib)
  const c = await b.newContext({viewport: {width: 1280, height: 860}, timezoneId: 'Europe/London'}); const p = await c.newPage(); watch(p, 'd');
  await p.clock.install({time: new Date('2027-02-20T15:00:00Z')});
  await p.goto('file://' + wrap); await p.waitForTimeout(800);
  R.picker = !!(await p.$('[data-pick]')); await p.click('[data-pick="en"]');
  R.noCityCTA = !!(await p.$('.notice [data-v="times"]'));
  await p.click('nav [data-v="times"]'); await p.selectOption('[data-sel="city"]', {label: 'London'}); await p.waitForTimeout(200);
  R.ttRows = await p.$$eval('.tt tbody tr', e => e.length);
  R.londonDay13 = await p.$$eval('.tt tbody tr', rows => rows[12].innerText.replace(/\s+/g, ' '));
  R.method = await p.$eval('[data-sel="method"]', e => e.value);
  await p.screenshot({path: U + '/times.png'});
  await p.click('nav [data-v="home"]'); await p.waitForTimeout(300);
  R.homeStatus = await p.$eval('#homeTop .k', e => e.textContent);
  const cd1 = await p.$eval('#cd', e => e.textContent); await p.clock.runFor(3000); const cd2 = await p.$eval('#cd', e => e.textContent); R.countdownTicks = cd1 !== cd2 ? `${cd1} -> ${cd2}` : 'STUCK';
  await p.screenshot({path: U + '/home.png'});
  // tick today's fast and all prayers from the home checklist
  await p.click('[data-a="fst"][data-val="y"]'); for (let i = 0; i < 5; i++) await p.click(`[data-a="pr"][data-n="13"][data-i="${i}"]`);
  await p.click('[data-a="tg"][data-k="t"]'); await p.click('[data-a="qp"][data-d="5"]');
  R.ring = await p.$eval('#homeTop .ring b', e => e.textContent);
  // tracker: mark day 2 missed (travel)
  await p.click('nav [data-v="tracker"]'); await p.click('[data-a="tday"][data-n="2"]'); await p.click('[data-a="fst"][data-n="2"][data-val="r_travel"]');
  R.makeup = await p.$eval('.big', e => e.textContent); await p.click('[data-a="mu"][data-d="1"]'); R.makeupAfter = await p.$eval('.big', e => e.textContent);
  R.summary = await p.$$eval('.sumcard .stat b', e => e.map(x => x.textContent).join('|'));
  await p.screenshot({path: U + '/tracker.png'});
  // quran
  await p.click('nav [data-v="quran"]'); R.quran = await p.$$eval('.stat b', e => e.map(x => x.textContent).join('|')); await p.click('[data-a="juz"][data-i="0"]'); R.juz = await p.$$eval('.juz .on', e => e.length);
  // duas
  await p.click('nav [data-v="duas"]'); R.duas = await p.$$eval('.dua', e => e.length); await p.fill('#dq', 'qadr'); R.search = await p.$$eval('.dua', e => e.length); await p.fill('#dq', '');
  // dhikr: 33 taps -> target reached
  await p.click('nav [data-v="dhikr"]'); for (let i = 0; i < 33; i++) await p.click('[data-a="dh"]'); R.dhikrDone = !!(await p.$('.notice')); await p.screenshot({path: U + '/dhikr.png'});
  // last 10: day 13 so no "tonight"; check nights listed
  await p.click('nav [data-v="last10"]'); R.nights = await p.$$eval('.night', e => e.length); await p.screenshot({path: U + '/last10.png'});
  // charity: zakat
  await p.click('nav [data-v="charity"]'); await p.fill('[data-path="zk.bank"]', '10000'); await p.fill('[data-path="zk.sp"]', '0.75'); R.zakat = await p.$eval('#zres', e => e.innerText.replace(/\s+/g, ' '));
  await p.fill('[data-path="fitr.n"]', '4'); await p.fill('[data-path="fitr.a"]', '7'); R.fitr = await p.$eval('#fres', e => e.innerText.replace(/\s+/g, ' '));
  await p.fill('#sqA', '20'); await p.fill('#sqN', 'Masjid'); await p.click('[data-a="sqAdd"]'); R.sq = await p.$eval('.pill', e => e.textContent); await p.screenshot({path: U + '/charity.png'});
  // meals
  await p.click('nav [data-v="meals"]'); await p.fill('[data-path="meals.13.s"]', 'Oats and dates'); await p.fill('#shopIn', 'Dates'); await p.press('#shopIn', 'Enter'); R.shop = await p.$$eval('[data-a="shopTog"]', e => e.length); await p.click('[data-a="wt"][data-val="3"]');
  // kids
  await p.click('nav [data-v="family"]'); await p.fill('#kidIn', 'Aisha'); await p.click('[data-a="kidAdd"]'); for (let i = 0; i < 4; i++) await p.click(`[data-a="ks"][data-c="0"][data-i="${i}"]`);
  R.kids = await p.$eval('.pill', e => e.textContent); R.kidsGreat = !!(await p.$('.notice')); await p.screenshot({path: U + '/kids.png'});
  // eid
  await p.click('nav [data-v="eid"]'); await p.fill('#eiN', 'Yusuf'); await p.fill('#eiA', '10'); await p.click('[data-a="eiAdd"]'); await p.click('[data-a="ec"][data-i="0"]');
  await p.fill('#gfN', 'Mum'); await p.fill('#gfG', 'Perfume'); await p.click('[data-a="gfAdd"]'); R.eid = await p.$$eval('.stat b', e => e.map(x => x.textContent).join('|')); await p.screenshot({path: U + '/eid.png'});
  // journal persists after reload
  await p.click('nav [data-v="journal"]'); await p.fill('[data-path="jr.13.t"]', 'Alhamdulillah for today'); await p.waitForTimeout(700); R.saved = await p.textContent('#jsaved');
  await p.reload(); await p.waitForTimeout(600); await p.click('nav [data-v="journal"]'); R.journalKept = await p.inputValue('[data-path="jr.13.t"]');
  await p.click('nav [data-v="meals"]'); R.mealKept = await p.inputValue('[data-path="meals.13.s"]');
  // at iftar time the countdown flips to suhoor
  await p.click('nav [data-v="home"]'); await p.clock.fastForward('03:00:00'); await p.waitForTimeout(1500); R.after = await p.$eval('#homeTop .k', e => e.textContent);
  // Urdu + dark
  await p.click('[data-a="lang"][data-l="ur"]'); R.dir = await p.evaluate(() => document.documentElement.dir); await p.screenshot({path: U + '/home-ur.png'});
  await p.click('nav [data-v="settings"]'); await p.click('[data-a="theme"][data-m="dark"]'); await p.click('nav [data-v="tracker"]'); await p.screenshot({path: U + '/tracker-dark.png'});
  // ---- other cities: Karachi Hanafi, Jakarta, Istanbul
  for (const [city, tzid] of [['Karachi', 'Asia/Karachi'], ['Jakarta', 'Asia/Jakarta'], ['İstanbul', 'Europe/Istanbul'], ['Glasgow', 'Europe/London']]) {
    const cx = await b.newContext({viewport: {width: 1280, height: 860}, timezoneId: tzid}); const q = await cx.newPage(); watch(q, city);
    await q.goto('file://' + wrap); await q.waitForTimeout(500); await q.click('[data-pick="en"]'); await q.click('nav [data-v="times"]'); await q.selectOption('[data-sel="city"]', {label: city});
    R['m_' + city] = await q.$eval('[data-sel="method"]', e => e.value); R['d1_' + city] = await q.$$eval('.tt tbody tr', rows => rows[0].innerText.replace(/\s+/g, ' ')); await cx.close(); }
  // ---- phone sizes, every view, Bengali, no sideways scrolling
  const m = await b.newContext({viewport: {width: 375, height: 812}, isMobile: true, timezoneId: 'Asia/Dhaka'}); const mp = await m.newPage(); watch(mp, 'm');
  await mp.clock.install({time: new Date('2027-03-04T13:00:00Z')});   // day 25 evening in Dhaka -> night 27 is tonight? (day 25 ends; 27th night begins on day 26)
  await mp.goto('file://' + wrap); await mp.waitForTimeout(600); await mp.click('[data-pick="bn"]');
  await mp.click('.tabs-m [data-v="times"]'); await mp.selectOption('[data-sel="city"]', {label: 'Dhaka'});
  const over = [];
  for (const v of ['home','times','tracker','quran','duas','dhikr','last10','charity','meals','family','eid','journal','settings']) { await mp.click(`.tabs-m [data-v="${v}"]`); await mp.waitForTimeout(150);
    const w = await mp.evaluate(() => document.documentElement.scrollWidth); if (w > 375) over.push(v + ':' + w); if (['home','tracker','times','last10','charity'].includes(v)) await mp.screenshot({path: U + `/m-${v}.png`}); }
  R.mobileOverflow = over.length ? over : 'none';
  // ---- website: demo then unlock
  const w = await b.newContext({viewport: {width: 1280, height: 860}}); const wp = await w.newPage(); watch(wp, 'web');
  await wp.goto(base + '/'); await wp.waitForTimeout(600); await wp.click('[data-pick="en"]'); R.demo = !!(await wp.$('.demobar'));
  await wp.click('nav [data-v="charity"]'); R.lockedCharity = !!(await wp.$('.lockc'));
  await wp.click('nav [data-v="duas"]'); R.demoDuas = [await wp.$$eval('.dua', e => e.length), await wp.$$eval('.lockc', e => e.length)];
  await wp.click('.demobar [data-v="settings"]'); await wp.fill('#code', 'WRONG'); await wp.click('[data-a="unlockCode"]'); await wp.waitForTimeout(300); R.wrong = await wp.textContent('.toast').catch(() => null);
  await wp.fill('#code', 'iftar-8m3q'); await wp.press('#code', 'Enter'); await wp.waitForLoadState('load'); await wp.waitForTimeout(700);
  R.unlocked = !(await wp.$('.demobar')); await wp.click('nav [data-v="charity"]'); R.charityOpen = !(await wp.$('.lockc'));
  console.log(JSON.stringify({errs, ...R}, null, 1)); await b.close(); })();
