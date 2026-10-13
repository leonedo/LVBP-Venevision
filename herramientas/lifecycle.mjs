// Prueba de ciclo de vida con el runtime real: play → pausa → stop → salida → layer suelto.
// Uso: node lifecycle.mjs <url> <ms antes del stop>
// Playwright: el que trae el Lottie Layer Editor (cue-lottie-editor), o PLAYWRIGHT=<ruta a index.mjs>
const { chromium } = await import(process.env.PLAYWRIGHT || '/Users/leonedo/Repos/personal/Lottie-layer-editor/mcp/node_modules/playwright/index.mjs');

const [url, stopAfter] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const t0 = Date.now();
const log = [];
page.on('console', m => {
    const t = m.text();
    if (/stop|play|released|pause|invoke|next|goto|error/i.test(t)) log.push(`${String(Date.now() - t0).padStart(5)}ms ${t}`);
});
page.on('pageerror', e => log.push('PAGEERROR ' + e.message));
await page.goto(url);
await page.waitForFunction(() => typeof anim !== 'undefined' && anim && anim.isLoaded);
await page.evaluate(() => document.fonts.ready);
// muestreo del frame actual y la dirección
await page.evaluate(() => {
    window.__trace = [];
    anim.addEventListener('enterFrame', e => window.__trace.push([Math.round(performance.now()), +(e.currentTime + anim.firstFrame).toFixed(1), anim.playDirection]));
});
const tPlay = Date.now();
await page.evaluate(() => play());
await page.waitForTimeout(Number(stopAfter));
const st = await page.evaluate(() => ({ frame: +(anim.currentFrame + anim.firstFrame).toFixed(1), paused: anim.isPaused, stage: currentStageIndex }));
log.push(`${String(Date.now() - t0).padStart(5)}ms antes del stop: ${JSON.stringify(st)}`);
await page.evaluate(() => stop());
await page.waitForTimeout(6000);
const trace = await page.evaluate(() => window.__trace);
const first = trace[0][0];
// resumir: primeros y últimos frames de cada tramo monotónico
const pts = trace.map(([t, f, d]) => [t - first, f, d]);
const marks = [];
for (let i = 0; i < pts.length; i++) {
    if (i === 0 || i === pts.length - 1 || Math.sign(pts[i][1] - pts[i - 1][1]) !== Math.sign((pts[i - 1] && pts[i - 2]) ? pts[i - 1][1] - pts[i - 2][1] : 0) || Math.abs(pts[i][1] - pts[i - 1][1]) > 5) marks.push(pts[i]);
}
console.log(log.join('\n'));
console.log('frames (ms desde el primer enterFrame, frame, dir):', JSON.stringify(marks));
await browser.close();
