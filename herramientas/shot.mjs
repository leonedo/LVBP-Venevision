// Captura frames de un gráfico tal como lo carga CasparCG (index.html + index.js + fuente real).
// Uso: node shot.mjs <url> <out-prefix> '<json data|"">' frame[,frame...] [clip x,y,w,h]
// Playwright: el que trae el Lottie Layer Editor (cue-lottie-editor), o PLAYWRIGHT=<ruta a index.mjs>
const { chromium } = await import(process.env.PLAYWRIGHT || '/Users/leonedo/Repos/personal/Lottie-layer-editor/mcp/node_modules/playwright/index.mjs');

const [url, out, data, framesArg, clipArg] = process.argv.slice(2);
const frames = framesArg.split(',').map(Number);
const clip = clipArg ? (([x, y, width, height]) => ({ x, y, width, height }))(clipArg.split(',').map(Number)) : undefined;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const logs = [];
page.on('console', m => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', e => logs.push('PAGEERROR: ' + e.message));
// JSON=<ruta> sirve otro data.json en lugar del del gráfico (para comparar versiones)
if (process.env.JSON) {
    const fs = await import('node:fs');
    const body = fs.readFileSync(process.env.JSON, 'utf8');
    await page.route('**/data.json', r => r.fulfill({ body, contentType: 'application/json' }));
}
await page.goto(url);
await page.waitForFunction(() => typeof anim !== 'undefined' && anim && anim.isLoaded);
await page.evaluate(() => document.fonts.ready);
// BG=none: fondo transparente, para superponer el render sobre un frame de video
if (process.env.BG !== 'none') await page.evaluate(() => { document.body.style.background = '#2b2b2b'; });
if (data) {
    await page.evaluate(d => update(d), data);
    await page.waitForTimeout(600);
}
for (const f of frames) {
    await page.evaluate(f => anim.goToAndStop(f, true), f);
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${out}_${f}.png`, clip, omitBackground: process.env.BG === 'none' });
}
const errs = logs.filter(l => /error|warn|PAGEERROR/i.test(l));
if (errs.length) console.log(errs.join('\n'));
await browser.close();
