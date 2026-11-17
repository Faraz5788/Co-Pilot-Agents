// App icons (180/192/512 px) for the website / home screen
const {chromium} = require('playwright');
(async () => { const dir = process.argv[2]; const b = await chromium.launch();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1F2A55"/><g transform="translate(50 50) scale(1.15) translate(-50 -50)"><path d="M56 22a29 29 0 1 0 22 47A25 25 0 1 1 56 22z" fill="#E2BE5A"/><path d="M70 30l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#E2BE5A"/></g></svg>`;
  for (const s of [180, 192, 512]) { const p = await b.newPage({viewport: {width: s, height: s}});
    await p.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</body>`); await p.screenshot({path: `${dir}/icon-${s}.png`}); await p.close(); }
  await b.close(); })();
