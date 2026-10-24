// Junta las imágenes de todos los gráficos en _assets/, cada una con el sha1 de su contenido por
// nombre, como cue-zfx-lasuerte-templates/consolidar-assets.mjs (Leon, 2026-10-24). Dos copias
// idénticas (las barras del parcial y del parcial sin publicidad, los frames repetidos de una
// secuencia) quedan en un solo archivo, y dos distintas con el mismo nombre (img_0.png está en casi
// todos los gráficos) no chocan. Cada asset del data.json pasa a u: "../_assets/".
//
// Sin pasar a WebP, a diferencia de lasuerte: cada imagen queda en su formato (PNG o JPG), porque la
// app legacy (LVBP-Stats) sale por un CasparCG 2.3 en el que nunca se probó WebP, y ahorraba ~1 MB.
//
// Es idempotente: lo ya consolidado no se toca. Va después de prep.js, que escribe los data.json con
// las imágenes en <gráfico>/images/ (las del export, copiadas tal cual). Al final borra las carpetas
// images/ y las imágenes de _assets/ que ya no usa ningún gráfico, sólo si todas las referencias
// resolvieron: si no, sus imágenes parecerían huérfanas y se irían.
//
//   node herramientas/consolidar.mjs
//
// ⚠ Depende de que data_file en el index.html no lleve barra: Lottie usa u + p, relativo a la página,
// sólo cuando no tiene un assetsPath (getAssetsPath() en lottie.js).
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.join(import.meta.dirname, '..');
const COMPARTIDA = '_assets';
const U = `../${COMPARTIDA}/`;
const sha = buf => createHash('sha1').update(buf).digest('hex').slice(0, 12);

const graficos = fs.readdirSync(RAIZ, { withFileTypes: true })
    .filter(d => d.isDirectory() && !/^[._]/.test(d.name) && fs.existsSync(path.join(RAIZ, d.name, 'data.json')))
    .map(d => d.name);
fs.mkdirSync(path.join(RAIZ, COMPARTIDA), { recursive: true });

const usadas = new Set();
let rotas = 0, nuevas = 0;
for (const g of graficos) {
    const json = path.join(RAIZ, g, 'data.json');
    const d = JSON.parse(fs.readFileSync(json, 'utf8'));
    let tocados = 0;
    for (const a of d.assets) {
        if (!a.p || a.p.startsWith('data:')) continue;
        const origen = path.join(RAIZ, g, a.u ?? '', a.p);
        if (!fs.existsSync(origen)) {
            console.error(`  ⚠ ${g}: falta ${a.u ?? ''}${a.p}`);
            rotas++;
            continue;
        }
        if (a.u === U) { usadas.add(a.p); continue; }
        const buf = fs.readFileSync(origen);
        const nombre = sha(buf) + path.extname(a.p).toLowerCase();
        const destino = path.join(RAIZ, COMPARTIDA, nombre);
        if (!fs.existsSync(destino)) {
            // a un .tmp y después el nombre: un archivo a medias no puede quedar con el nombre bueno
            fs.writeFileSync(destino + '.tmp', buf);
            fs.renameSync(destino + '.tmp', destino);
            nuevas++;
        }
        usadas.add(nombre);
        a.u = U;
        a.p = nombre;
        tocados++;
    }
    if (tocados) fs.writeFileSync(json, JSON.stringify(d, null, 2)); // igual que prep.js
    console.log(`  ${g}: ${tocados ? `${tocados} imágenes a ${U}` : 'sin cambios'}`);
}

const mb = n => (n / 1048576).toFixed(1) + ' MB';
if (rotas) {
    console.error(`\n⚠ ${rotas} referencia(s) rota(s): no se borran las carpetas images/ ni se podan huérfanas`);
    process.exit(1);
}
for (const g of graficos) fs.rmSync(path.join(RAIZ, g, 'images'), { recursive: true, force: true });
const huerfanas = fs.readdirSync(path.join(RAIZ, COMPARTIDA)).filter(f => !usadas.has(f));
for (const f of huerfanas) fs.rmSync(path.join(RAIZ, COMPARTIDA, f));
const total = [...usadas].reduce((n, f) => n + fs.statSync(path.join(RAIZ, COMPARTIDA, f)).size, 0);
console.log(`\n${usadas.size} imágenes en ${COMPARTIDA}/ (${mb(total)}): ${nuevas} nuevas, ${huerfanas.length} huérfanas podadas`);
