// Renders the stage frame by frame (30 fps, 15 s) and encodes an Etsy-ready MP4 (silent, H.264, 1080x1080).
// Usage: node render.js <capture dir> <out.mp4>
const {chromium} = require('playwright'); const fs = require('fs'); const path = require('path'); const {execFileSync} = require('child_process');
(async () => { const [dir, out] = process.argv.slice(2), FPS = 30, DUR = 15, frames = path.join(dir, 'frames');
  fs.rmSync(frames, {recursive: true, force: true}); fs.mkdirSync(frames);
  fs.copyFileSync(path.join(__dirname, 'stage.html'), path.join(dir, 'stage.html'));
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1080, height: 1080}, deviceScaleFactor: 1});
  await p.goto('file://' + path.join(dir, 'stage.html')); await p.waitForLoadState('networkidle'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(m => window.setMeta(m), JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'))));
  // preload every image so no frame catches one half-loaded
  await p.evaluate(async () => { const srcs = ['tawaf-2','tawaf-3','tawaf-4','tawaf-5','tawaf-6','tawaf-7','duas-en','duas-ur','duas-hi','duas-id','ziyarat-full','phrases-full','tabbar'];
    await Promise.all(srcs.map(s => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = s + '.png'; }))); });
  for (let f = 0; f < FPS * DUR; f++) { await p.evaluate(t => render(t), f / FPS); await p.waitForTimeout(f === 0 ? 300 : 8);
    await p.screenshot({path: path.join(frames, `f${String(f).padStart(4, '0')}.png`)}); }
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', '-an', out]);
  console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(1) + ' MB'); })();
