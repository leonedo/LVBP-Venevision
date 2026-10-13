// Flujo al aire como lo haría el controlador: UPDATE antes del PLAY, UPDATE con el gráfico
// pausado, cambio de equipo al aire, NEXT entre stages y STOP. Captura después de cada paso.
// Uso: node onair.mjs <url> <pasos.json> <dir> [clip]
// pasos: [{ "cmd": "update", "data": {...} } | { "cmd": "play" | "next" | "stop" }, "wait": ms, "shot": "nombre" }]
import fs from 'node:fs';
// Playwright: el que trae el Lottie Layer Editor (cue-lottie-editor), o PLAYWRIGHT=<ruta a index.mjs>
const { chromium } = await import(process.env.PLAYWRIGHT || '/Users/leonedo/Repos/personal/Lottie-layer-editor/mcp/node_modules/playwright/index.mjs');

const [url, stepsPath, outDir, clipArg] = process.argv.slice(2);
const steps = JSON.parse(fs.readFileSync(stepsPath, 'utf8'));
const clip = clipArg ? (([x, y, width, height]) => ({ x, y, width, height }))(clipArg.split(',').map(Number)) : undefined;
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const t0 = Date.now();
const log = [];
const ms = () => String(Date.now() - t0).padStart(6) + 'ms';
page.on('console', m => {
    const t = m.text();
    if (/canResizeFont is not a function|^\s+at http/.test(t)) return;
    if (m.type() === 'error' || m.type() === 'warning' || /released|ignorado|no next|no active/i.test(t)) log.push(`${ms()} [${m.type()}] ${t}`);
});
page.on('pageerror', e => log.push(`${ms()} PAGEERROR ${e.message}`));
await page.goto(url);
await page.waitForFunction(() => typeof anim !== 'undefined' && anim && anim.isLoaded);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => { document.body.style.background = '#2b2b2b'; });

for (const s of steps) {
    if (s.cmd === 'update') await page.evaluate(d => update(JSON.stringify(d)), s.data);
    else await page.evaluate(c => window[c](), s.cmd);
    await page.waitForTimeout(s.wait || 0);
    const st = await page.evaluate(() => ({
        frame: +(anim.currentFrame + anim.firstFrame).toFixed(1),
        paused: anim.isPaused,
        stage: currentStageIndex === null ? null : stages[currentStageIndex].name
    }));
    log.push(`${ms()} ${s.cmd}${s.shot ? ' → ' + s.shot : ''}: ${JSON.stringify(st)}`);
    if (s.shot) await page.screenshot({ path: `${outDir}/${s.shot}.png`, clip });
}
console.log(log.join('\n'));
await browser.close();
