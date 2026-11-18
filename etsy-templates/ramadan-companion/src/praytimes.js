// Offline prayer-time calculation (standard astronomical method, as used by PrayTimes.org).
// prayTimes(dateUTCmidnight, lat, lng, {fajr, isha | ishaMin, asr: 1|2, elev}) -> {fajr, sunrise, dhuhr, asr, maghrib, isha} as Date objects (UTC instants)
const PT_METHODS = {
  mwl:     {name: "Muslim World League", fajr: 18, isha: 17},
  msc:     {name: "Moonsighting Committee (UK)", fajr: 18, isha: 18, msc: true, off: {dhuhr: 5, maghrib: 3}},
  isna:    {name: "ISNA (North America)", fajr: 15, isha: 15},
  karachi: {name: "Karachi (Pakistan, India, Bangladesh)", fajr: 18, isha: 18},
  makkah:  {name: "Umm al-Qura (Saudi Arabia)", fajr: 18.5, ishaMin: 120},   // Isha is 2 hours after Maghrib in Ramadan
  egypt:   {name: "Egyptian Authority", fajr: 19.5, isha: 17.5},
  // official safety minutes, checked against published Diyanet (Istanbul) and Kemenag (Jakarta) timetables
  turkey:  {name: "Diyanet (Turkey)", fajr: 18, isha: 17, off: {sunrise: -7, dhuhr: 4, asr: 5, maghrib: 7, isha: 1}},
  kemenag: {name: "Kemenag (Indonesia)", fajr: 20, isha: 18, off: {fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 3, isha: 2}},
  jakim:   {name: "JAKIM (Malaysia)", fajr: 20, isha: 18, off: {fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2}},
  gulf:    {name: "Gulf region", fajr: 19.5, ishaMin: 90},
};
function prayTimes(date, lat, lng, o) {
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate();
  let Y = y, M = m; if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
  const jDate = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 - lng / (15 * 24);
  function sun(jd) {
    const D = jd - 2451545.0, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)), 360), e = 23.439 - 0.00000036 * D;
    const RA = fix(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15, 24);
    return {decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt: q / 15 - RA};
  }
  const noon = t => fix(12 - sun(jDate + t).eqt, 24);
  const angleTime = (angle, t, ccw) => { const s = sun(jDate + t), n = noon(t);
    const T = deg(Math.acos((-Math.sin(rad(angle)) - Math.sin(rad(s.decl)) * Math.sin(rad(lat))) / (Math.cos(rad(s.decl)) * Math.cos(rad(lat))))) / 15;
    return n + (ccw ? -T : T); };
  const asrTime = (f, t) => { const s = sun(jDate + t); const a = -deg(Math.atan(1 / (f + Math.tan(rad(Math.abs(lat - s.decl)))))); return angleTime(a, t); };
  const riseAngle = 0.833 + 0.0347 * Math.sqrt(o.elev || 0);
  // two passes: first with rough guesses, then refined with the first result
  let t = {fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 18};
  for (let i = 0; i < 2; i++) {
    const p = k => t[k] / 24;
    t = {fajr: angleTime(o.fajr, p("fajr"), true), sunrise: angleTime(riseAngle, p("sunrise"), true), dhuhr: noon(p("dhuhr")),
         asr: asrTime(o.asr || 1, p("asr")), maghrib: angleTime(riseAngle, p("maghrib")), isha: o.ishaMin ? 0 : angleTime(o.isha, p("isha"))};
  }
  if (o.ishaMin) t.isha = t.maghrib + o.ishaMin / 60;
  // high latitudes (e.g. Scotland in summer): angle-based night portion when twilight never ends
  const night = fix(t.sunrise - t.maghrib, 24);
  if (o.msc) {
    // Moonsighting Committee: Fajr/Isha from seasonal tables by latitude; use whichever keeps the fast safer
    const L = Math.abs(lat), leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0, doy = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 864e5), len = leap ? 366 : 365;
    let dys = lat >= 0 ? doy + 10 : doy - (leap ? 173 : 172); if (dys >= len) dys -= len; if (dys < 0) dys += len;
    const season = (a, b, c, e) => dys < 91 ? a + (b - a) / 91 * dys : dys < 137 ? b + (c - b) / 46 * (dys - 91) : dys < 183 ? c + (e - c) / 46 * (dys - 137)
      : dys < 229 ? e + (c - e) / 46 * (dys - 183) : dys < 275 ? c + (b - c) / 46 * (dys - 229) : b + (a - b) / 91 * (dys - 275);
    const mAdj = season(75 + 28.65 / 55 * L, 75 + 19.44 / 55 * L, 75 + 32.74 / 55 * L, 75 + 48.10 / 55 * L);
    const eAdj = season(75 + 25.60 / 55 * L, 75 + 2.050 / 55 * L, 75 - 9.21 / 55 * L, 75 + 6.14 / 55 * L);
    if (lat >= 55) t.fajr = t.sunrise - night / 7;
    const safeF = t.sunrise - mAdj / 60, safeI = t.maghrib + eAdj / 60;
    if (isNaN(t.fajr) || safeF > t.fajr) t.fajr = safeF;
    if (lat >= 55) t.isha = t.maghrib + night / 7;
    if (isNaN(t.isha) || safeI < t.isha) t.isha = safeI;
  } else {
  const adj = (time, base, angle, dir) => { const portion = angle / 60 * night; const diff = dir > 0 ? fix(time - base, 24) : fix(base - time, 24);
    return (isNaN(time) || diff > portion) ? base + dir * portion : time; };
  t.fajr = adj(t.fajr, t.sunrise, o.fajr, -1);
  if (!o.ishaMin) t.isha = adj(t.isha, t.maghrib, o.isha, 1);
  }
  t.dhuhr += 1 / 60;   // a minute after the sun passes its highest point
  const base = Date.UTC(y, m - 1, d), out = {};
  // round to the minute: Fajr down and Maghrib up, so rounding never shortens the fast
  const r = {fajr: Math.floor, maghrib: Math.ceil};
  const off = o.off || {};
  for (const k in t) out[k] = new Date(base + ((r[k] || Math.round)((t[k] - lng / 15) * 60) + (off[k] || 0)) * 60000);
  return out;
}
if (typeof module !== "undefined") module.exports = {prayTimes, PT_METHODS};
