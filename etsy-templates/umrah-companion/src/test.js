const {chromium}=require('playwright');
(async()=>{ const U=process.argv[2]; const b=await chromium.launch(); const errs=[]; const R={};
 const wrap=f=>{const fs=require('fs'); const h=fs.readFileSync(f,'utf8'); fs.writeFileSync(U+'/_t.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+h+'</body></html>');};
 wrap(U+'/umrah-companion.html');
 const c=await b.newContext({viewport:{width:1280,height:860}}); const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+U+'/_t.html'); await p.waitForTimeout(1500);
 R.picker=!!(await p.$('[data-pick]')); await p.screenshot({path:U+'/s-picker.png'});
 await p.click('[data-pick="en"]'); await p.waitForTimeout(300); await p.screenshot({path:U+'/s-home.png'});
 for(const v of ['steps','tawaf','sai','duas','madinah','ziyarat','phrases','checklist','settings']){ await p.click(`nav [data-v="${v}"]`); await p.waitForTimeout(200); await p.screenshot({path:U+`/s-${v}.png`,fullPage:false}); }
 await p.click('nav [data-v="tawaf"]'); for(let i=0;i<7;i++){ await p.click('[data-a="count"]'); } R.tawafDone=await p.textContent('.done-msg');
 await p.click('nav [data-v="sai"]'); R.sai0=await p.textContent('.dir'); await p.click('[data-a="count"]'); R.sai1=await p.textContent('.dir');
 await p.click('nav [data-v="duas"]'); await p.fill('#dq','zamzam'); R.search=await p.$$eval('.dua',e=>e.length);
 await p.fill('#dq',''); await p.click('[data-a="cat"][data-c="sai"]'); R.saiDuas=await p.$$eval('.dua',e=>e.length);
 await p.click('nav [data-v="steps"]'); await p.click('[data-a="openDua"]'); R.modal=!!(await p.$('.modal .dua')); await p.click('[data-x]');
 // Urdu
 await p.click('nav [data-v="home"]'); await p.click('[data-a="lang"][data-l="ur"]'); await p.waitForTimeout(500);
 R.dir=await p.evaluate(()=>document.documentElement.dir); await p.screenshot({path:U+'/s-ur-home.png'});
 await p.click('nav [data-v="duas"]'); await p.waitForTimeout(300); await p.screenshot({path:U+'/s-ur-duas.png'});
 await p.click('nav [data-v="ziyarat"]'); await p.waitForTimeout(200); await p.screenshot({path:U+'/s-ur-ziyarat.png'}); R.urZ=await p.textContent('.zcard h3');
 R.mak=await p.$$eval('.zcard',e=>e.length); await p.click('[data-a="zcity"][data-c="madinah"]'); R.mad=await p.$$eval('.zcard',e=>e.length); await p.screenshot({path:U+'/s-ur-madinah.png'});
 await p.click('nav [data-v="phrases"]'); R.phr=await p.$$eval('.phrase',e=>e.length); R.urP=await p.textContent('.phrase .mn'); await p.screenshot({path:U+'/s-ur-phrases.png'});
 await p.click('[data-a="pcat"][data-c="num"]'); R.nums=await p.$$eval('.ntile',e=>e.length); await p.click('[data-a="pcat"][data-c="help"]'); R.help=await p.$$eval('.phrase',e=>e.length);
 // mobile
 const m=await b.newContext({viewport:{width:390,height:844},isMobile:true}); const mp=await m.newPage(); mp.on('pageerror',e=>errs.push('m:'+e.message));
 await mp.goto('file://'+U+'/_t.html'); await mp.waitForTimeout(1200); await mp.click('[data-pick="bn"]'); await mp.waitForTimeout(400); await mp.click('.tabs-m [data-v="duas"]'); R.bnPr=await mp.textContent('.dua .tl.own');
 R.mw1=await mp.evaluate(()=>document.documentElement.scrollWidth); await mp.screenshot({path:U+'/m-home.png'});
 for(const v of ['tawaf','duas','steps','phrases','ziyarat']){ await mp.click(`.tabs-m [data-v="${v}"]`); await mp.waitForTimeout(250); R['mw_'+v]=await mp.evaluate(()=>document.documentElement.scrollWidth); await mp.screenshot({path:U+`/m-${v}.png`}); }
 for(const L of ['tr','id','hi']){ await p.click('nav [data-v="settings"]'); await p.click(`[data-a="lang"][data-l="${L}"]`); await p.click('nav [data-v="duas"]'); R['pr_'+L]=await p.textContent('.dua .tl'); } await p.click('nav [data-v="phrases"]'); await p.screenshot({path:U+'/s-hi-phrases.png'}); await p.click('nav [data-v="duas"]'); await p.screenshot({path:U+'/s-hi-duas.png'});
 console.log(JSON.stringify({errs,...R},null,1)); await b.close(); })();
