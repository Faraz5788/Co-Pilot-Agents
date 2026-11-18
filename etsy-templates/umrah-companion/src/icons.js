// App icons (180/192/512 px) for the website / home screen
const {chromium} = require('playwright');
(async () => { const dir = process.argv[2]; const b = await chromium.launch();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1D6B51"/><g transform="translate(50 50) scale(1.25)"><rect x="-22" y="-22" width="44" height="44" fill="none" stroke="#DDB94E" stroke-width="4.5"/><rect x="-22" y="-22" width="44" height="44" fill="none" stroke="#DDB94E" stroke-width="4.5" transform="rotate(45)"/><rect x="-11" y="-12" width="22" height="26" rx="2" fill="#1E1C18"/><rect x="-11" y="-5" width="22" height="4" fill="#DDB94E"/></g></svg>`;
  for (const s of [180, 192, 512]) { const p = await b.newPage({viewport: {width: s, height: s}});
    await p.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</body>`); await p.screenshot({path: `${dir}/icon-${s}.png`}); await p.close(); }
  await b.close(); })();
