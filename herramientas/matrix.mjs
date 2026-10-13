// Renderiza muchas variantes de data en una sola sesión, con el runtime real.
// Uso: node matrix.mjs <url> <casos.json> <dir-salida> [clip x,y,w,h]
// casos.json: [{ "name": "...", "data": {...}, "frame": 105 }, ...]
import fs from 'node:fs';
// Playwright: el que trae el Lottie Layer Editor (cue-lottie-editor), o PLAYWRIGHT=<ruta a index.mjs>
const { chromium } = await import(process.env.PLAYWRIGHT || '/Users/leonedo/Repos/personal/Lottie-layer-editor/mcp/node_modules/playwright/index.mjs');

const [url, casesPath, outDir, clipArg] = process.argv.slice(2);
const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
const clip = clipArg ? (([x, y, width, height]) => ({ x, y, width, height }))(clipArg.split(',').map(Number)) : undefined;
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('console', m => {
    const t = m.text();
    // index.js loguea esto para cada clave _opacidad (capa de forma, sin texto): es inocuo
    if (/canResizeFont is not a function|^\s+at http/.test(t)) return;
    if (m.type() === 'error' || m.type() === 'warning' || /\berror\b/i.test(t)) errors.push(t);
});
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
// JSON=<ruta> sirve otro data.json (para comparar contra la versión publicada)
if (process.env.JSON) {
    const body = fs.readFileSync(process.env.JSON, 'utf8');
    await page.route('**/data.json', r => r.fulfill({ body, contentType: 'application/json' }));
}
await page.goto(url);
await page.waitForFunction(() => typeof anim !== 'undefined' && anim && anim.isLoaded);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => { document.body.style.background = '#2b2b2b'; });

const report = [];
for (const c of cases) {
    await page.evaluate(d => update(JSON.stringify(d)), c.data);
    await page.waitForTimeout(250);
    await page.evaluate(f => anim.goToAndStop(f, true), c.frame);
    await page.waitForTimeout(60);
    await page.screenshot({ path: `${outDir}/${c.name}.png`, clip });
    // lo que el runtime dejó aplicado: textos pedidos y escudos visibles
    const applied = await page.evaluate(d => {
        const out = { textMismatch: [], visible: [] };
        for (const [k, v] of Object.entries(d)) {
            if (/opacidad/i.test(k)) {
                const el = document.querySelector('.' + k);
                if (el && getComputedStyle(el).opacity !== '0') out.visible.push(k);
            } else {
                const e = anim.renderer.elements.find(x => x && x.data && x.data.cl === k && x.textProperty);
                if (e) {
                    const shown = (e.textProperty.currentData.t || '').replace(/\r/g, ' ');
                    const want = e.textProperty.currentData.ca ? String(v).toUpperCase() : String(v);
                    if (shown !== want) out.textMismatch.push(`${k}: "${shown}" ≠ "${want}"`);
                }
            }
        }
        return out;
    }, c.data);
    report.push({ name: c.name, ...applied });
}
fs.writeFileSync(`${outDir}/_report.json`, JSON.stringify({ errors, report }, null, 1));
const bad = report.filter(r => r.textMismatch.length);
console.log(`${cases.length} casos, ${errors.length} errores de consola, ${bad.length} con textos distintos a lo pedido`);
if (errors.length) console.log(errors.slice(0, 10).join('\n'));
for (const b of bad.slice(0, 10)) console.log(b.name, b.textMismatch.join(' | '));
await browser.close();
