// Prepara los exports del diseñador para CasparCG: la receta de "Cuando llega un export nuevo"
// de CLAUDE.md, ejecutable. Escrito sobre los exports del score (SCOREBUG, 2026-10-13), de la
// defensiva y la ofensiva (DEFENSIVA, OFENSIVA, 2026-10-15), del bateador (LOWBAR BATEADOR,
// 2026-10-16) y del parcial (FINAL DE INNING, 2026-10-17): si el diseñador cambia nombres de
// capas, falla diciendo cuál no encuentra (no adivina).
//
// Uso, desde la raíz del repo:
//   1. Descomprimir los zips del diseñador en una carpeta (EXPORTS): SCOREBUG/, DEFENSIVA/,
//      OFENSIVA/, LOWBAR BATEADOR/, FINAL DE INNING/. Los que no estén se saltean: alcanza con el
//      zip que llegó.
//   2. node herramientas/prep.js $EXPORTS .
//   3. git diff, herramientas/lint.py y QA con el runtime real (CLAUDE.md).
// Las fuentes, las imágenes y los index.html no los toca: se copian a mano la primera vez.
const fs = require('fs');
const path = require('path');

const [SRC, REPO] = process.argv.slice(2);
const load = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const save = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2)); // igual que lottie_save
const clone = o => JSON.parse(JSON.stringify(o));
// Cada receta corre sólo si su export está en SRC: el diseñador manda los zips de a uno.
const hay = zip => {
    const ok = fs.existsSync(path.join(SRC, zip, 'data.json'));
    if (!ok) console.log(`· ${zip}: no está en ${SRC}, se saltea`);
    return ok;
};

function layer(d, nm) {
    const hits = d.layers.filter(l => (l.nm || '').trim() === nm);
    if (hits.length !== 1) throw new Error(`capa "${nm}": ${hits.length} coincidencias`);
    return hits[0];
}
// Convención del editor: nm ".<nombre>", cl "<nombre>"
function rename(d, nm, name) {
    const l = layer(d, nm);
    l.nm = '.' + name;
    l.cl = name;
    return l;
}
function freeInd(d, ind) {
    if (d.layers.some(l => l.ind === ind)) throw new Error(`ind ${ind} ocupado`);
    return ind;
}
// El diseño va todo en mayúsculas: All Caps (ca: 1) en todas las capas de texto, que es lo que
// index.js mira para pasar a mayúsculas el texto del UPDATE. Lottie tampoco lo aplica al texto
// por defecto, que se pasa acá.
function allCaps(d) {
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        k.s.ca = 1;
        k.s.t = k.s.t.toUpperCase();
    }
}
const doc = (d, nm) => {
    const ks = layer(d, nm).t.d.k;
    if (ks.length !== 1) throw new Error(`${nm}: ${ks.length} documentos de texto`);
    return ks[0].s;
};
// Texto de caja que el diseño alineó a la izquierda a ojo: pasa a centrado sobre el eje del texto
// del diseño, que queda en el mismo píxel. Lw = su ancho de línea con la fuente cargada
// (textProperty.currentData.lineWidths[0]). Ver textos-de-caja.md.
function centrar(s, Lw) {
    if (s.j !== 0) throw new Error(`centrar: j ${s.j}`);
    s.ps[0] += (Lw - s.sz[0]) / 2;
    s.j = 2;
}
// Caja centrada a la que se le cambia el ancho sin mover el centro.
function anchoCentrado(s, W) {
    if (s.j !== 2) throw new Error(`anchoCentrado: j ${s.j}`);
    s.ps[0] += (s.sz[0] - W) / 2;
    s.sz[0] = W;
}

// Keyframes de una propiedad animada, con la animación de [desde, hasta] repetida al revés a
// partir del frame `inicio`: el keyframe del tiempo t va a inicio + hasta - t. En cada tramo se
// invierte la curva (el `o` nuevo es 1 − el `i` viejo, y al revés) y las tangentes espaciales.
// El último keyframe original pasa a hold: entre los dos el valor es el mismo.
function alReves(prop, desde, hasta, inicio) {
    const ks = prop.k;
    if (ks.some(k => k.t < desde - 0.5 || k.t > hasta + 0.5)) throw new Error('alReves: keyframes fuera del tramo');
    if (ks.some(k => k.h)) throw new Error('alReves: keyframe hold');
    const flip = e => ({ x: [].concat(e.x).map(v => +(1 - v).toFixed(6)), y: [].concat(e.y).map(v => +(1 - v).toFixed(6)) });
    const unflat = (e, like) => Array.isArray(like.x) ? e : { x: e.x[0], y: e.y[0] };
    const rev = [];
    for (let j = ks.length - 1; j >= 0; j--) {
        const k = { t: inicio + hasta - ks[j].t, s: clone(ks[j].s) };
        if (j > 0) {
            const prev = ks[j - 1];
            k.o = unflat(flip(prev.i), prev.i);
            k.i = unflat(flip(prev.o), prev.o);
            if (prev.to) { k.to = clone(prev.ti); k.ti = clone(prev.to); }
        }
        rev.push(k);
    }
    ks[ks.length - 1].h = 1;
    prop.k = ks.concat(rev);
}
// Hue/Saturation de AE que sólo mueve la Master Lightness (L): lo aplica a los rellenos y trazos
// de la capa, que es lo que Lottie no hace, y lo saca. L > 0 va hacia el blanco, L < 0 al negro.
function horneaClaridad(l) {
    const i = (l.ef || []).findIndex(e => e.mn === 'ADBE HUE SATURATION');
    if (i < 0) throw new Error(`${l.nm}: sin Hue/Saturation`);
    const v = nm => l.ef[i].ef.find(x => x.nm === nm).v.k;
    if (v('Master Hue') || v('Master Saturation') || v('Colorize')) throw new Error(`${l.nm}: Hue/Saturation con más que claridad`);
    const L = v('Master Lightness') / 100;
    const aclara = c => +(L > 0 ? c + (1 - c) * L : c * (1 + L)).toFixed(6);
    const pinta = it => it.forEach(s => {
        if (s.ty === 'fl' || s.ty === 'st') {
            if (s.c.a) throw new Error(`${l.nm}: color animado`);
            s.c.k = s.c.k.map((c, j) => j < 3 ? aclara(c) : c);
        }
        if (s.it) pinta(s.it);
    });
    pinta(l.shapes);
    l.ef.splice(i, 1);
    if (!l.ef.length) delete l.ef;
}
function propiedadesAnimadas(o, acc = []) {
    if (Array.isArray(o)) o.forEach(v => propiedadesAnimadas(v, acc));
    else if (o && typeof o === 'object') {
        if (o.a === 1 && Array.isArray(o.k)) acc.push(o);
        else Object.values(o).forEach(v => propiedadesAnimadas(v, acc));
    }
    return acc;
}

// ---------------------------------------------------------------- score
// Escudos: las siglas de los escudos del score de LVBP-Meridiano, para que el controlador mande
// la misma data a los dos.
const SIGLAS = {
    AGUILAS: 'AGUI', BRAVOS: 'BRAVOS', CARDENALES: 'CARD', CARIBES: 'ANZ',
    LEONES: 'LEO', MAGALLANES: 'MAGA', TIBURONES: 'TIBUS', TIGRES: 'TIGRES'
};
// Flujo (como el score de Meridiano): la entrada para en `marcador`, `next` sube la barra de
// jugadores (`jugadores`) y la baja (`sinjugadores`). La salida es la entrada al revés.
const ENTRADA = 54;                    // la entrada del marcador termina en el 53 (los outs)
const SUBE = [64, 91];                 // la barra de jugadores sube del 65 al 90
const BAJA = 100;                      // y baja (la subida al revés) del 100 al 125
const OP = 130;
const BARRA = ['BARRA PITCHER', 'BARRA BATEADOR', '.lanzador', '.lanzamientos', '.mph',
    '.velocidad', '.bateador', '.average', '.actuacion'];
// El export del 2026-10-17 es el mismo diseño dentro de un nulo nuevo (Null 1) al 134 %: más grande,
// con la esquina en (94, 51), 2 px a la izquierda y 3 arriba de la zona segura de títulos (90 %: 96,
// 54). Va corrido hasta ahí (Leon, 2026-10-17). Si el nulo llega en otro lugar o a otra escala,
// prep.js falla: medir de nuevo la esquina (bbox del render en el frame 90) y mover CORRE.
const RAIZ = { nm: 'Null 1', p: [962, 537.2], s: 134 };
const CORRE = [2, 3];
if (hay('SCOREBUG')) {
    const d = load(path.join(SRC, 'SCOREBUG/data.json'));

    const raiz = layer(d, RAIZ.nm), rp = raiz.ks.p, rs = raiz.ks.s;
    if (rp.a || rs.a || rp.k[0] !== RAIZ.p[0] || rp.k[1] !== RAIZ.p[1] || rs.k[0] !== RAIZ.s || rs.k[1] !== RAIZ.s)
        throw new Error(`${RAIZ.nm}: p ${JSON.stringify(rp.k)} s ${JSON.stringify(rs.k)}, no los del export del 2026-10-17: medir y mover CORRE`);
    rp.k = [rp.k[0] + CORRE[0], rp.k[1] + CORRE[1], rp.k[2]];

    rename(d, '.BOLASYSTRIKES', 'conteobolasystrikes');
    rename(d, 'OUTS', 'outs');
    rename(d, '.PRIMEROUT', 'PRIMEROUT_opacidad');
    rename(d, '.SEGUNDOOUT', 'SEGUNDOOUT_opacidad');
    rename(d, '.ALTAINNING', 'INNINGarriba_opacidad');
    rename(d, '.BAJAINNING', 'INNINGabajo_opacidad');
    rename(d, '.INNINGS', 'inning');
    rename(d, '.PRIMERABASELLENA', 'PRIMERALLENA_opacidad');
    rename(d, '.SEGUNDABASELLENA', 'SEGUNDALLENA_opacidad');
    rename(d, '.TERCERABASELLENA', 'TERCERALLENA_opacidad');
    // Las dos llegan con la clase CARRERAS: una clave cambiaba las dos.
    rename(d, '.CARRERAS VISITANTES', 'CARRERASVISITA');
    rename(d, '.CARRERAS LOCAL', 'CARRERASLOCAL');
    rename(d, '.EQUIPOVISITANTE', 'EQUIPOVISITA');
    rename(d, '.EQUIPOLOCAL', 'EQUIPOLOCAL');
    rename(d, '.APELLIDOLANZADOR', 'lanzador');
    rename(d, '.NUMERODELANZAMIENTOS', 'lanzamientos');
    rename(d, 'MPH', 'mph');
    rename(d, '.VELOCIDADNUMERO', 'velocidad');
    rename(d, ',APELLIDOBATEADOR', 'bateador'); // llega con coma: sin clase
    rename(d, '.AVERAGE', 'average');
    rename(d, '.ACTUACIONENTURNOS', 'actuacion');
    for (const l of d.layers) {
        const m = (l.nm || '').match(/^\.BARRA([A-Z]+?)(LOCAL|VISITA)_?$/);
        if (!m) continue;
        if (!SIGLAS[m[1]]) throw new Error(`equipo desconocido ${m[1]}`);
        rename(d, l.nm, SIGLAS[m[1]] + m[2] + '_opacidad');
    }
    for (const s of Object.values(SIGLAS)) for (const lado of ['LOCAL', 'VISITA']) layer(d, `.${s}${lado}_opacidad`);

    // La barra de Águilas local llega sin máscara: su tt la mateaba con el texto EQUIPOLOCAL de
    // arriba y la barra sólo se veía por adentro de las letras. Lleva la de las otras siete.
    const mascara = clone(layer(d, 'mascaralocal'));
    mascara.nm = 'mascaralocal 8';
    mascara.ind = freeInd(d, Math.max(...d.layers.map(l => l.ind)) + 1);
    const agui = layer(d, '.AGUILOCAL_opacidad');
    d.layers.splice(d.layers.indexOf(agui), 0, mascara);

    // El logo de Venevisión llega azul (#194771) con un Hue/Saturation de Lightness +100 encima,
    // que en AE lo vuelve blanco. Lottie no pinta ese efecto: al aire salía azul sobre el azul
    // oscuro de su caja y casi no se veía. La claridad pasa a los rellenos y el efecto se saca.
    horneaClaridad(layer(d, 'VVLOGO'));

    // ---- textos de caja (textos-de-caja.md). Las cajas vienen de AE con lh 0.01: un texto que
    // no entra partía en líneas encimadas en vez de encoger. lh va a 1.2 del cuerpo, que no mueve
    // la primera línea.
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) if (k.s.sz) k.s.lh = 1.2 * k.s.s;
    // Alineados a la izquierda a ojo: pasan a centrados sobre el eje del texto del diseño, para
    // que un inning de un dígito, unas carreras de un dígito o unas siglas más anchas no queden
    // corridas. Lw medidos con LT Energy (10, 00, TIG).
    centrar(doc(d, '.inning'), 8.3422);
    centrar(doc(d, '.CARRERASVISITA'), 26.0547);
    centrar(doc(d, '.CARRERASLOCAL'), 26.0547);
    centrar(doc(d, '.EQUIPOVISITA'), 32.1412);
    centrar(doc(d, '.EQUIPOLOCAL'), 32.1412);
    // Barra de jugadores (capas a escala 0.8: 1 px de pantalla = 1.25 unidades; los px de estos
    // comentarios son del score al 100 %, antes del Null 1: al 134 %, × 1.34). Las cajas del
    // export cruzaban la barra entera (lanzador 193 px, lanzamientos 464): un nombre largo pisaba
    // los números en vez de encoger. H 18: entra una línea al cuerpo del diseño (ascent 15.48) y
    // no dos hasta un cuerpo de 9.
    const bat = doc(d, '.bateador');
    bat.sz = [80, 18];                 // hasta 8 px antes del average (CASTRO mide 67.6)
    const act = doc(d, '.actuacion');
    act.sz[0] = 42.1;                  // hasta 8 px antes del final de la barra (10-4 mide 39.9)
    const lan = doc(d, '.lanzador');
    anchoCentrado(lan, 89);            // 6 px antes de la caja de lanzamientos (CHIRINOS mide 78.5)
    lan.sz[1] = 18;
    const lzm = doc(d, '.lanzamientos');
    anchoCentrado(lzm, 46);            // entra P.100 (44.2)
    lzm.sz[1] = 18;
    // La velocidad llegaba alineada a la izquierda pegada a MPH: 100 se metía en MPH. Pasa a la
    // derecha, terminando donde termina el 90 del diseño (21.78), y crece hacia la izquierda.
    const vel = doc(d, '.velocidad');
    if (vel.j !== 0) throw new Error('velocidad: j');
    const fin = vel.ps[0] + 21.7809;
    vel.j = 1;
    vel.sz[0] = 30;                    // entra 100 (28.25)
    vel.ps[0] = fin - vel.sz[0];
    vel.t = vel.t.trim();              // "90 ": el espacio separaba de MPH a la izquierda

    // ---- la barra de jugadores baja: la subida al revés, del 100 al 125
    for (const nm of BARRA) {
        const props = propiedadesAnimadas([layer(d, nm).ks, layer(d, nm).shapes]);
        if (!props.length) throw new Error(`${nm}: sin animación`);
        for (const p of props) alReves(p, 65, 90.0000036657751, BAJA);
    }

    // ---- timeline y markers
    for (const l of d.layers) if (Math.abs(l.op - d.op) < 0.01) l.op = OP;
    d.op = OP;
    d.markers = [
        { tm: 0, cm: 'play', dr: ENTRADA },
        // stop global: un stop durante la entrada (antes de marcador) corta. El frame 0 está vacío.
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: ENTRADA - 6, cm: 'marcador', dr: 6, payload: { name: 'marcador', type: 'pause', order: 1, stop: 'salida' } },
        { tm: SUBE[0], cm: 'jugadores', dr: SUBE[1] - SUBE[0], payload: { name: 'jugadores', type: 'pause', order: 2, stop: 'salida_jugadores' } },
        { tm: BAJA, cm: 'sinjugadores', dr: 26, payload: { name: 'sinjugadores', type: 'pause', order: 3, stop: 'salida' } },
        { tm: ENTRADA, cm: 'salida', dr: -ENTRADA },
        { tm: SUBE[1], cm: 'salida_jugadores', dr: -SUBE[1] }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergyVFVF.ttf';
    allCaps(d);
    save(path.join(REPO, 'score/data.json'), d);
}

// ---------------------------------------------------------------- compuertas (defensiva, ofensiva)
// Los dos son de pantalla completa: dos compuertas con el escudo del equipo que se abren, y la barra
// del equipo arriba. Las compuertas llegan abreviadas distinto que las barras (y en la ofensiva, las
// pantallas de color de las puertas, otra vez distinto); acá también, las siglas tal cual.
const PUERTA = {
    AGUI: 'AGUI', AGUIL: 'AGUI', AGUILAS: 'AGUI', ANZ: 'ANZ', BRA: 'BRAVOS', BRAV: 'BRAVOS', CARD: 'CARD',
    LEO: 'LEO', MAG: 'MAGA', TIB: 'TIBUS', TIG: 'TIGRES'
};
for (const s of Object.values(SIGLAS)) PUERTA[s] = s;
const OPACIDAD_PUERTA = 49;            // la del diseño: pasa al CSS del index.html del gráfico
// El escudo de las compuertas lleva en AE un Emboss (y un Hue/Saturation) que Lottie no pinta. El
// Emboss deja lo liso en 50 % de gris y lo mezcla 45 % con el original (blanco): 0.55 × 0.5 +
// 0.45 = 0.725. Sin eso el escudo es blanco puro, el color dodge lo quema casi a blanco y se ve
// mucho más fuerte que en el diseño. El gris va como efecto Fill, que Lottie sí pinta (con un
// filtro SVG, como las sombras). Si el diseñador manda los PNG con los efectos ya aplicados,
// sacarlo (GRIS_PUERTA = null).
const GRIS_PUERTA = 0.725;
// Las puertas de Tigres son de un azul casi negro y el color dodge no lo puede aclarar: con el gris
// de los demás su escudo casi no se veía. Al 95 % se ve como el de Tiburones o Magallanes (lo eligió
// Leon el 2026-10-15 entre 72,5, 85, 90 y 95).
const GRIS_EQUIPO = { TIGRES: 0.95 };
const ENTRADA_DEF = 53;                // la entrada termina en el 52 (el título)
// Un efecto Fill de AE tal como lo exporta bodymovin. Lottie lee el color (3.º) y la opacidad (7.º).
const relleno = (gris, ix) => ({
    ty: 21, nm: 'Fill', np: 9, mn: 'ADBE Fill', ix, en: 1, ef: [
        { ty: 10, nm: 'Fill Mask', mn: 'ADBE Fill-0001', ix: 1, v: { a: 0, k: 0, ix: 1 } },
        { ty: 7, nm: 'All Masks', mn: 'ADBE Fill-0007', ix: 2, v: { a: 0, k: 0, ix: 2 } },
        { ty: 2, nm: 'Color', mn: 'ADBE Fill-0002', ix: 3, v: { a: 0, k: [gris, gris, gris, 1], ix: 3 } },
        { ty: 7, nm: 'Invert', mn: 'ADBE Fill-0006', ix: 4, v: { a: 0, k: 0, ix: 4 } },
        { ty: 0, nm: 'Horizontal Feather', mn: 'ADBE Fill-0003', ix: 5, v: { a: 0, k: 0, ix: 5 } },
        { ty: 0, nm: 'Vertical Feather', mn: 'ADBE Fill-0004', ix: 6, v: { a: 0, k: 0, ix: 6 } },
        { ty: 0, nm: 'Opacity', mn: 'ADBE Fill-0005', ix: 7, v: { a: 0, k: 1, ix: 7 } }
    ]
});
// Ancho y alto de un PNG (su IHDR).
const medidasPng = f => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

// El equipo: una clave, <SIGLAS>_opacidad, prende su barra (arriba), las dos mitades del escudo de
// las compuertas y las dos pantallas de color de las puertas (`extra` capas por equipo, ya
// renombradas). `lado`: ind del parent de cada puerta → 'izq' / 'der'. `gris`: el gris
// del escudo de un equipo cuando no es GRIS_PUERTA.
function equipoEnPuertas(d, lado, grafico, extra, gris = {}) {
    const vistos = {};
    for (const l of d.layers) {
        let m = l.nm.match(/^\.BARRA_([A-Z]+)_VISITA(?:_1)?\.png$/);
        if (m) {
            if (!SIGLAS[m[1]]) throw new Error(`barra de equipo desconocido ${m[1]}`);
            rename(d, l.nm, SIGLAS[m[1]] + '_opacidad');
            continue;
        }
        m = l.nm.match(/^\.COMPUERTA([A-Z]+?)(?:IZQ|DER)$/);
        if (!m) continue;
        const sig = PUERTA[m[1]];
        if (!sig || !lado[l.parent]) throw new Error(`compuerta ${l.nm}: equipo o puerta desconocidos`);
        // El escudo va al 49 %, pero el UPDATE escribe su _opacidad en la capa y pisaría ese
        // 49 con un 1: la capa queda al 100 y el 49 % lo pone el CSS en su <image>, por el
        // id (ln) que la distingue de la barra. Los nombres IZQ/DER del export no dicen en qué
        // puerta va (MAG está al revés en la defensiva): el lado sale del parent.
        if (l.ks.o.a || l.ks.o.k !== OPACIDAD_PUERTA) throw new Error(`compuerta ${l.nm}: opacidad ${JSON.stringify(l.ks.o.k)}`);
        l.ks.o.k = 100;
        if (GRIS_PUERTA !== null) {
            if (l.ef.some(e => e.ty === 21)) throw new Error(`compuerta ${l.nm}: ya trae un Fill`);
            l.ef.push(relleno(gris[sig] ?? GRIS_PUERTA, l.ef.length + 1));
        }
        l.ln = `puerta${sig}${lado[l.parent]}`;
        vistos[l.ln] = 1;
        rename(d, l.nm, sig + '_opacidad');
    }
    const conPuerta = new Set(Object.keys(vistos).map(id => id.replace(/^puerta|izq$|der$/g, '')));
    for (const s of conPuerta) if (!vistos[`puerta${s}izq`] || !vistos[`puerta${s}der`]) throw new Error(`compuerta ${s}: falta una mitad`);
    for (const s of Object.values(SIGLAS)) {
        const n = d.layers.filter(l => l.nm === `.${s}_opacidad`).length;
        if (n !== 1 + extra + (conPuerta.has(s) ? 2 : 0)) throw new Error(`${s}_opacidad: ${n} capas`);
        if (!conPuerta.has(s)) console.warn(`· ${grafico}: sin compuerta de ${s}: con ese equipo las compuertas salen sin escudo`);
    }
}

// Máscara invertida de una puerta. Lottie la invierte contra un rectángulo del tamaño de la
// composición desde el (0, 0) de la capa, no contra todo: al correrse la puerta, la parte de la
// máscara a la izquierda de ese (0, 0) aparece como una franja que tapa el centro. Va la
// complementaria, sin invertir: la misma diagonal, cerrada por la derecha más allá del borde del
// rectángulo de la puerta (en la defensiva termina en el 957.6).
function complementaria(l) {
    const mk = l.masksProperties;
    if (!mk || mk.length !== 1 || !mk[0].inv || mk[0].pt.a) throw new Error(`${l.nm}: máscara inesperada`);
    const v = mk[0].pt.k.v;
    if (v.length !== 4 || v[1][0] !== -1016 || v[2][0] !== -1016) throw new Error(`${l.nm}: vértices inesperados`);
    const g = l.shapes[0].it, rc = g.find(s => s.ty === 'rc'), tr = g.find(s => s.ty === 'tr');
    const borde = tr.p.k[0] + (rc.p.k[0] + rc.s.k[0] / 2 - tr.a.k[0]) * tr.s.k[0] / 100;
    if (borde >= 1016) throw new Error(`${l.nm}: la puerta pasa de la máscara (${borde})`);
    v[1][0] = v[2][0] = 1016;
    mk[0].inv = false;
}

// ---------------------------------------------------------------- defensiva
// Las claves son las de la defensiva de LVBP-Meridiano, para que el controlador le mande a las dos
// la misma data: jugador<posición> el nombre, <posición> el rótulo y <SIGLAS>_opacidad el equipo.
// [capa del nombre, capa del rótulo, posición, ancho de la caja del nombre]. El ancho llega hasta
// 8 px antes del final de su barra azul (en el export, la caja pasaba 27 px de la barra): medido
// en el frame 53 con la fuente cargada, a la escala de la capa (0.9009 × 1.3 del nulo; RF va a
// 0.79989). APELLIDO, el texto del diseño, mide 76.1 (91.3 en RF).
const DEF_POSICIONES = [
    [',catcher', 'C', 'catcher', 104.4],
    [',pitcher', 'P', 'lanzador', 101.9],
    ['.primerabase', '1B', 'primerabase', 100.9],
    ['.segundabase', '2B', 'segundabase', 101.7],
    ['.tercerabase', '3B', 'tercerabase', 101.4],
    ['.campocorto', 'SS', 'shortstop', 100.4],
    ['.leftfield', 'LF', 'leftfield', 99.9],
    ['.centerfield', 'CF', 'centerfield', 101.9],
    ['.rightfield', 'RF', 'rightfield', 115.3]
];
// La compuerta de Águilas no vino en el export del 2026-10-15: llegó aparte, como PNG (ver abajo).
const AGUI_PUERTA = 'images/compuerta_aguilas.png';
if (hay('DEFENSIVA')) {
    const d = load(path.join(SRC, 'DEFENSIVA/data.json'));

    // ---- textos. Los nombres ya son de caja (lh 52: no parten en líneas encimadas).
    for (const [nombre, rotulo, pos, W] of DEF_POSICIONES) {
        rename(d, nombre, 'jugador' + pos);  // primero el nombre: el rótulo toma su nm
        doc(d, '.jugador' + pos).sz[0] = W;
        rename(d, rotulo, pos);
        anchoCentrado(doc(d, '.' + pos), 52); // la placa rosa (70 px de pantalla), 4 px por lado
    }
    rename(d, 'DEFENSIVA 2', 'titulo');

    // ---- la compuerta de Águilas llegó aparte (un PNG, 2026-10-15), copiado a mano a
    // defensiva/images/compuerta_aguilas.png. Si el export no la trae, se arma con las dos capas de
    // la de Caribes (casi del mismo tamaño): mismo lugar y escala, centrada en su imagen, y la
    // máscara corrida lo que se corre el centro, para que el corte entre las puertas caiga igual.
    const aguiPng = path.join(REPO, 'defensiva', AGUI_PUERTA);
    if (!d.layers.some(l => /^\.COMPUERTAAGUI/.test(l.nm)) && fs.existsSync(aguiPng)) {
        const [w, h] = medidasPng(aguiPng);
        d.assets.push({ id: 'image_compuerta_aguilas', w, h, u: 'images/', p: path.basename(AGUI_PUERTA), e: 0 });
        let ind = Math.max(...d.layers.map(l => l.ind));
        for (const lado of ['IZQ', 'DER']) {
            const ref = layer(d, '.COMPUERTAANZ' + lado);
            const c = clone(ref);
            const [ax, ay] = ref.ks.a.k;
            const dx = w / 2 - ax, dy = h / 2 - ay;
            c.ks.a.k = [w / 2, h / 2, 0];
            for (const v of c.masksProperties[0].pt.k.v) { v[0] += dx; v[1] += dy; }
            const ys = c.masksProperties[0].pt.k.v.map(v => v[1]);
            if (Math.min(...ys) > 0 || Math.max(...ys) < h) throw new Error('compuerta AGUI: la máscara no cubre la imagen');
            c.refId = 'image_compuerta_aguilas';
            c.nm = '.COMPUERTAAGUI' + lado;
            c.cl = 'COMPUERTAAGUI' + lado;
            c.ind = ++ind;
            d.layers.splice(d.layers.indexOf(ref), 0, c);
        }
    }

    // ---- la puerta derecha llega con una máscara invertida: una franja azul tapaba el campo.
    complementaria(layer(d, 'puertader'));

    // ---- las puertas, del color de cada equipo y con la textura, como en la ofensiva (Leon,
    // 2026-10-15). El azul de la defensiva es justo el de Magallanes en la ofensiva, que salió de
    // ésta: la defensiva es la versión anterior de la idea. Los degradados y la textura se toman de
    // la ofensiva preparada (ofensiva/data.json), así que si allá cambian, la defensiva los toma la
    // próxima vez (si llegan los dos exports juntos, correr prep.js dos veces). Encima de cada
    // puerta van su textura y sus 8 pantallas de color: hijas de la puerta, con su forma y su
    // máscara. Sin equipo queda el azul de la puerta.
    const of = load(path.join(REPO, 'ofensiva/data.json'));
    const ofLado = { [of.layers.find(l => l.nm === 'movimientopuertaizq').ind]: 'izq', [of.layers.find(l => l.nm === 'movimientopuertader').ind]: 'der' };
    const degradado = l => l.shapes[0].it.find(s => s.ty === 'gf');
    const texPng = path.join(REPO, 'defensiva/images/texturapuertas.png');
    if (!fs.existsSync(texPng)) throw new Error('falta defensiva/images/texturapuertas.png (la textura de las puertas de la ofensiva)');
    const [tw, th] = medidasPng(texPng);
    d.assets.push({ id: 'image_texturapuertas', w: tw, h: th, u: 'images/', p: 'texturapuertas.png', e: 0 });
    let indPuerta = Math.max(...d.layers.map(l => l.ind));
    for (const lado of ['der', 'izq']) {
        const base = layer(d, 'puerta' + lado);
        const tex = clone(of.layers.find(l => l.cl === 'texturapuerta' + lado));
        Object.assign(tex, { ind: ++indPuerta, parent: base.ind, ip: 0, op: base.op, st: 0, refId: 'image_texturapuertas' });
        const nuevas = [tex];
        for (const sig of Object.values(SIGLAS)) {
            const ref = of.layers.find(l => l.cl === sig + '_opacidad' && l.ty === 4 && ofLado[l.parent] === lado);
            if (!ref) throw new Error(`ofensiva: sin pantalla ${lado} de ${sig}`);
            const c = clone(base);
            c.ind = ++indPuerta;
            c.parent = base.ind;
            c.ks = { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } };
            degradado(c).g = clone(degradado(ref).g);
            c.nm = `.${sig}_opacidad`;
            c.cl = `${sig}_opacidad`;
            nuevas.push(c);
        }
        d.layers.splice(d.layers.indexOf(base), 0, ...nuevas);
    }

    // ---- el equipo: una clave prende su barra, sus dos pantallas y las dos mitades del escudo.
    equipoEnPuertas(d, { [layer(d, 'puertaizq').ind]: 'izq', [layer(d, 'puertader').ind]: 'der' }, 'DEFENSIVA', 2, GRIS_EQUIPO);
    // Las imágenes del fondo llegan con la clase "png" (la extensión del nombre) y nombres con
    // espacios y puntos, que el audit del editor marca como clases inválidas: nombres válidos,
    // como logomeridiano en Meridiano.
    rename(d, 'CAMPO.png', 'campo');
    rename(d, 'BASE DE COLOR.png', 'basecolor');
    rename(d, 'LOGO FINAL ATRAPA LA EMOCION_1 bisel.png', 'logoatrapa');
    rename(d, 'TEXTURA.png', 'textura');

    // ---- timeline: el frame 0 queda vacío (todas las capas desde el 1). El gráfico es de
    // pantalla completa desde su primer frame: así no se ve nada antes del play (un CG ADD sin
    // autoplay), la salida termina en un frame vacío y el stop global (sin stage) no muestra nada.
    const ultimo = Math.max(...propiedadesAnimadas(d.layers).flatMap(p => p.k.map(k => k.t)));
    if (ultimo > ENTRADA_DEF - 0.5) throw new Error(`la entrada termina en el ${ultimo}: mover ENTRADA_DEF`);
    for (const l of d.layers) {
        if (l.ip !== 0) throw new Error(`${l.nm}: ip ${l.ip}`);
        l.ip = 1;
        l.op = ENTRADA_DEF + 1;
    }
    d.op = ENTRADA_DEF + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: ENTRADA_DEF, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: ENTRADA_DEF, cm: 'salida', dr: -ENTRADA_DEF }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    save(path.join(REPO, 'defensiva/data.json'), d);
}

// ---------------------------------------------------------------- ofensiva
// Las claves, las de la ofensiva de LVBP-Meridiano donde dicen lo mismo: posicion<N> y jugador<N>
// (los turnos, 1 a 9 de arriba abajo), titulo y <SIGLAS>_opacidad. No tiene valor<N> (el average),
// equipo ni informacion. Propias: manager (el nombre) y rotulomanager (el MGR, fijo).
// Cajas de los nombres [ancho, alto]: las barras van en diagonal y la de la fila 1 es la más corta
// (su caja pasaba 4 px el final de la barra): las nueve llegan hasta 8 px antes del final de esa
// barra, para que un nombre encoja igual en cualquier fila. La del mánager, hasta 8 px antes de la
// suya (pasaba 100). Medidos en el frame 89, a la altura de la parte de arriba del texto (la capa
// va a escala 1). El alto deja una línea al cuerpo del diseño y no dos hasta un cuerpo de 17 (los
// nombres) o 15 (el mánager): con el 50 del export, un nombre largo partía en dos líneas chicas.
const OF_NOMBRE = [474, 34];
const OF_MANAGER = [382, 31];
// Los escudos de las compuertas que no vinieron en el export (sólo trae el de Águilas): los PNG
// blancos de la defensiva, copiados a mano a ofensiva/images.
const OF_ESCUDOS = {
    ANZ: 'compuerta_caribes.png', BRAVOS: 'compuerta_bravos.png', CARD: 'compuerta_cardenales.png',
    LEO: 'compuerta_leones.png', MAGA: 'compuerta_magallanes.png', TIBUS: 'compuerta_tiburones.png',
    TIGRES: 'compuerta_tigres.png'
};
const ENTRADA_OF = 90;                 // la entrada termina en el 89 (el mánager)
// Las puertas que no llegan del tono de su barra, que es el mismo en los cuatro gráficos: las de
// Águilas, ámbar (#FF8400, tono 31°) y no del naranja rojizo de la barra (#F64D25, 12°), y las de
// Leones, amarillas (#FFD200, 49°) y no del ámbar de la barra (#FDAD36, 36°). Van con el tono de la
// barra y el brillo que el diseñador le dio a cada equipo (Leon, 2026-10-17): el claro es la barra
// llevada a 255 (#FF5026, #FFAE36), y los otros dos stops, en la misma proporción que en el export
// (Águilas, 0.133 y 0.57 del claro; Leones, 0.384 y 0.69). La defensiva y el bateador las toman de
// acá. Los stops como en el JSON: posición, r, g, b (0–1); `export`, el degradado que llega.
const COLOR_PUERTA = {
    AGUI: {
        export: [0, 0.133, 0.075, 0, 0.61, 0.567, 0.296, 0, 1, 1, 0.518, 0],
        color: [0, 0.133, 0.043, 0.02, 0.61, 0.569, 0.176, 0.086, 1, 1, 0.314, 0.149]
    },
    LEO: {
        export: [0, 0.384, 0.253, 0, 0.5, 0.692, 0.538, 0, 1, 1, 0.824, 0],
        color: [0, 0.384, 0.263, 0.082, 0.5, 0.69, 0.471, 0.145, 1, 1, 0.682, 0.212]
    }
};
// Un escudo de compuerta para otro equipo, a partir de la capa de uno que vino en el export: la
// misma puerta, lugar y escala, centrado en su imagen. La máscara corta por la misma diagonal (la
// costura entre las puertas), alargada para cubrir una imagen de cualquier alto.
function escudoClonado(ref, w, h, refId) {
    const c = clone(ref);
    const [ax, ay] = ref.ks.a.k;
    const m = c.masksProperties;
    if (m.length !== 1 || m[0].inv || m[0].pt.a || m[0].pt.k.v.length !== 4) throw new Error(`${ref.nm}: máscara inesperada`);
    const v = m[0].pt.k.v.map(([x, y]) => [x + w / 2 - ax, y + h / 2 - ay]);
    const porCentro = [...v].sort((a, b) => Math.abs(a[0] - w / 2) - Math.abs(b[0] - w / 2));
    const [s1, s2] = porCentro.slice(0, 2).sort((a, b) => a[1] - b[1]); // la costura, de arriba abajo
    const x = y => s1[0] + (y - s1[1]) * (s2[0] - s1[0]) / (s2[1] - s1[1]);
    const lejos = porCentro[2][0] > w / 2 ? w + 200 : -200;
    m[0].pt.k.v = [[lejos, -200], [x(-200), -200], [x(h + 200), h + 200], [lejos, h + 200]];
    c.ks.a.k = [w / 2, h / 2, 0];
    c.refId = refId;
    return c;
}
if (hay('OFENSIVA')) {
    const d = load(path.join(SRC, 'OFENSIVA/data.json'));

    // ---- textos. Ya son de caja, con lh 52.
    rename(d, 'POSICION', 'posicion1');
    for (let n = 2; n <= 9; n++) rename(d, 'POSICION ' + n, 'posicion' + n);
    for (let n = 1; n <= 9; n++) {
        rename(d, '.NOMBREPOSICION' + n, 'jugador' + n); // el 1 llega con un espacio al final del nm
        doc(d, '.jugador' + n).sz = [...OF_NOMBRE];
    }
    rename(d, 'MANAGER', 'rotulomanager');
    rename(d, 'NOMBREMANAGER', 'manager');
    doc(d, '.manager').sz = [...OF_MANAGER];
    // El título llega como en la defensiva (la capa y el texto): DEFENSIVA.
    rename(d, 'DEFENSIVA 2', 'titulo');
    const titulo = doc(d, '.titulo');
    if (!['DEFENSIVA', 'OFENSIVA'].includes(titulo.t)) throw new Error(`titulo: ${titulo.t}`);
    titulo.t = 'OFENSIVA';

    // ---- puertas. Cada equipo tiene sus dos pantallas de color (PANTALLAPUERTA<DER|IZQ><equipo>).
    // La de Águilas llega dos veces: queda la de arriba, la que se ve en AE (la de abajo tiene la
    // izquierda 4 px corrida). Las de la derecha llegan con la máscara invertida.
    for (const p of ['DER', 'IZQ']) {
        const dup = d.layers.filter(l => l.nm === 'PANTALLAPUERTA' + p + 'AGUI');
        if (dup.length !== 2) throw new Error(`PANTALLAPUERTA${p}AGUI: ${dup.length}`);
        d.layers.splice(d.layers.indexOf(dup[1]), 1);
    }
    for (const l of d.layers) {
        const m = l.nm.match(/^PANTALLAPUERTA(DER|IZQ)([A-Z]+)$/);
        if (!m) continue;
        if (!PUERTA[m[2]]) throw new Error(`pantalla de equipo desconocido ${l.nm}`);
        if (m[1] === 'DER') complementaria(l);
        rename(d, l.nm, PUERTA[m[2]] + '_opacidad');
        const color = COLOR_PUERTA[PUERTA[m[2]]];
        if (color) {
            const g = l.shapes[0].it.find(s => s.ty === 'gf').g;
            if (g.p !== 3 || g.k.a || JSON.stringify(g.k.k) !== JSON.stringify(color.export))
                throw new Error(`${l.nm}: el degradado no es el del export del 2026-10-15: revisar COLOR_PUERTA`);
            g.k.k = [...color.color];
        }
    }
    // Los escudos que faltan, con las capas del de Águilas (el único del export).
    let ind = Math.max(...d.layers.map(l => l.ind));
    for (const [sig, png] of Object.entries(OF_ESCUDOS)) {
        if (d.layers.some(l => { const m = l.nm.match(/^\.COMPUERTA([A-Z]+?)(?:IZQ|DER)$/); return m && PUERTA[m[1]] === sig; })) continue;
        const file = path.join(REPO, 'ofensiva/images', png);
        if (!fs.existsSync(file)) continue;    // equipoEnPuertas avisa
        const [w, h] = medidasPng(file);
        const id = 'image_' + png.replace(/\.png$/, '');
        d.assets.push({ id, w, h, u: 'images/', p: png, e: 0 });
        for (const p of ['IZQ', 'DER']) {
            const ref = layer(d, '.COMPUERTAAGUI' + p);
            const c = escudoClonado(ref, w, h, id);
            c.nm = `.COMPUERTA${sig}${p}`;
            c.cl = `COMPUERTA${sig}${p}`;
            c.ind = ++ind;
            d.layers.splice(d.layers.indexOf(ref), 0, c);
        }
    }
    equipoEnPuertas(d, { [layer(d, 'movimientopuertaizq').ind]: 'izq', [layer(d, 'movimientopuertader').ind]: 'der' }, 'OFENSIVA', 2, GRIS_EQUIPO);

    // ---- imágenes con la clase "png" y nombres inválidos (como en la defensiva)
    rename(d, 'CAMPO OFENSIVA.png', 'campo');
    rename(d, 'BASE DE COLOR.png', 'basecolor');
    rename(d, 'LOGO FINAL ATRAPA LA EMOCION_1 bisel.png', 'logoatrapa');
    rename(d, 'TEXTURA.png', 'textura');
    const texturas = d.layers.filter(l => l.nm === 'TEXTURA PUERTAS.png');
    if (texturas.length !== 2) throw new Error(`TEXTURA PUERTAS: ${texturas.length}`);
    const ladoTextura = { [layer(d, 'movimientopuertaizq').ind]: 'izq', [layer(d, 'movimientopuertader').ind]: 'der' };
    for (const l of texturas) { l.nm = '.texturapuerta' + ladoTextura[l.parent]; l.cl = 'texturapuerta' + ladoTextura[l.parent]; }

    // ---- timeline: como la defensiva, el frame 0 vacío (es de pantalla completa)
    const ultimo = Math.max(...propiedadesAnimadas(d.layers).flatMap(p => p.k.map(k => k.t)));
    if (ultimo > ENTRADA_OF - 0.5) throw new Error(`la entrada termina en el ${ultimo}: mover ENTRADA_OF`);
    for (const l of d.layers) {
        l.ip = Math.max(l.ip, 1);
        l.op = ENTRADA_OF + 1;
    }
    d.op = ENTRADA_OF + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: ENTRADA_OF, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: ENTRADA_OF, cm: 'salida', dr: -ENTRADA_OF }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    save(path.join(REPO, 'ofensiva/data.json'), d);
}

// ---------------------------------------------------------------- bateador
// La barra baja del bateador. Las claves, las de la barra de bateador de LVBP-Meridiano donde dicen
// lo mismo, para que el controlador le mande a las dos la misma data: nombrejugador, numerouniforme,
// posicion, etiquetaN / valorN (casilleros genéricos, 1 a 4 de izquierda a derecha) y
// <SIGLAS>_opacidad. No tiene titulo ni informacionbarranegra.
// Cajas medidas en el frame 87 con la fuente cargada. El nombre, hasta 8 px antes del negro del
// número (la caja del export cruzaba el número y la posición); el número y la posición, 8 px
// adentro de su placa, que va en diagonal (las cajas del export medían 594 px de pantalla).
const BAT_NOMBRE = 459;                // 418 px / 0.9099 de escala; NOMBRE  APELLIDO mide 418.3
const BAT_NUMERO = 117;                // 92 px / 0.7877; 100 mide 94.9
const BAT_POSICION = 150;              // 118 px / 0.7877; DH mide 76.9
// Estadísticas: el valor (cuerpo 70) va antes de su rótulo (40), y el diseño dejó los dos alineados
// a la izquierda: un valor de una cifra quedaba lejos de su rótulo y uno más largo se le metía
// encima. El valor pasa a la derecha, terminando donde termina el del diseño (Lw: .000 125.6719,
// 00 72.9531), y crece hacia la izquierda hasta 8 px después de la caja del rótulo anterior (el
// primero, hasta 8 px después del borde de la barra gris, x 527 de pantalla). Los rótulos, cajas
// de 70 px (AVG mide 67.5). Capas a escala 1 y sin parent: 1 unidad, 1 px.
const BAT_STATS = [['AVE', '.AVERAGE'], ['HR', '.JONRONES'], ['CI', '.CARRERASIMPULSADAS'], ['OPS', '.OPSNUMERO']];
const BAT_LW = { '.000': 125.6719, '00': 72.9531 };
const BAT_ETIQUETA = 70;
const BAT_BORDE = 527;
const ENTRADA_BAT = 87;                // la entrada termina en el 86 (OPS)
// El escudo grande va en overlay sobre el fondo, que a lo sumo duplica el brillo de lo que tiene
// abajo: sobre el fondo de Tigres, casi negro, no se veía. Lleva lo mismo que su escudo en las
// puertas de la ofensiva: color dodge con el Fill gris. Acá el escudo va al 100 % (en las puertas,
// al 49 %): al 85 % se ve como el de Tiburones o Magallanes (comparado el 2026-10-16 con 80, 90 y
// 95; el 95 de la ofensiva, acá, queda mucho más fuerte que los demás).
const BAT_DODGE = { TIGRES: 0.85 };
if (hay('LOWBAR BATEADOR')) {
    const d = load(path.join(SRC, 'LOWBAR BATEADOR/data.json'));

    // ---- textos
    rename(d, '.BATEADOR', 'nombrejugador');
    doc(d, '.nombrejugador').sz[0] = BAT_NOMBRE;
    rename(d, '.NUMEROJUGADOR', 'numerouniforme');
    anchoCentrado(doc(d, '.numerouniforme'), BAT_NUMERO);
    rename(d, '.POSICIONDEJUGADOR', 'posicion');
    anchoCentrado(doc(d, '.posicion'), BAT_POSICION);
    // x de pantalla del (0, 0) de una capa a escala 1 y sin parent
    const origen = l => {
        const { p, a, s } = l.ks;
        if (l.parent || p.a || a.a || s.a || s.k[0] !== 100) throw new Error(`${l.nm}: transform inesperado`);
        return p.k[0] - a.k[0];
    };
    let libre = BAT_BORDE + 8;         // dónde puede empezar el próximo valor
    BAT_STATS.forEach(([rotulo, valor], i) => {
        const v = doc(d, valor);
        v.t = v.t.trim();              // ".000 ": el espacio del final
        if (v.j !== 0 || !BAT_LW[v.t]) throw new Error(`${valor}: j ${v.j}, texto "${v.t}"`);
        const fin = v.ps[0] + BAT_LW[v.t];
        v.sz[0] = origen(layer(d, valor)) + fin - libre;
        v.ps[0] = fin - v.sz[0];
        v.j = 1;
        rename(d, valor, 'valor' + (i + 1));
        const e = doc(d, rotulo);
        if (e.j !== 0) throw new Error(`${rotulo}: j ${e.j}`);
        e.sz[0] = BAT_ETIQUETA;
        libre = origen(layer(d, rotulo)) + e.ps[0] + BAT_ETIQUETA + 8;
        rename(d, rotulo, 'etiqueta' + (i + 1));
    });
    // El alto: entra una línea al cuerpo del diseño (su ascent, más 2) y no dos hasta un 40–50 %
    // del cuerpo. Con el alto del export (hasta 90), un texto que tenía que encoger mucho partía
    // en dos líneas chicas.
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        if (!k.s.sz) throw new Error(`${l.nm}: no es de caja`);
        k.s.sz[1] = +(d.fonts.list[0].ascent * k.s.s / 100 + 2).toFixed(2);
    }

    // ---- el equipo: cada clave prende su barra (la imagen del nombre, con el escudo de marca de
    // agua), el fondo de color de la izquierda y el escudo grande encima (en overlay, mateado). La
    // barra de Bravos llega sin el _1 de las otras.
    // Los fondos llegan con el mismo naranja (el de Bravos) en siete equipos: sólo Tigres trae el
    // suyo. Van con el color de cada equipo de la ofensiva, como las puertas de la defensiva (Leon,
    // 2026-10-16): el degradado de sus puertas, tomado de la ofensiva preparada (si cambia allá, el
    // bateador lo toma la próxima vez que se prepare). La puerta va de oscuro (arriba, en 0) a claro
    // (abajo, en 1) y el fondo al revés, claro en 0 (abajo): los stops se dan vuelta.
    const of = load(path.join(REPO, 'ofensiva/data.json'));
    const degradado = l => l.shapes[0].it.find(s => s.ty === 'gf');
    for (const l of d.layers) {
        const barra = l.nm.match(/^\.BARRA_([A-Z]+)_BATEO(?:_1)?\.png$/);
        const fondo = l.nm.match(/^\.FONDO([A-Z]+)$/);
        const escudo = l.nm.match(/^\.([A-Z]+)LOGO$/);
        const m = barra || fondo || escudo;
        if (!m) continue;
        const sig = SIGLAS[m[1]];
        if (!sig) throw new Error(`${l.nm}: equipo desconocido`);
        // Hasta que empieza a moverse (frame 11), la punta de la barra asomaba 5 px en el borde
        // izquierdo: en la entrada y al final de la salida. Aparece cuando se mueve.
        if (barra) {
            if (!l.ks.p.a) throw new Error(`${l.nm}: sin animación`);
            l.ip = l.ks.p.k[0].t;
        }
        if (fondo) {
            const ref = of.layers.find(o => o.cl === sig + '_opacidad' && o.ty === 4);
            if (!ref) throw new Error(`ofensiva: sin puerta de ${sig}`);
            const g = degradado(ref).g, k = g.k.k, gf = degradado(l);
            if (g.p !== 3 || k.length !== 12 || gf.g.p !== 3 || gf.g.k.a) throw new Error(`${l.nm}: degradado inesperado`);
            const stops = [];
            for (let i = 8; i >= 0; i -= 4) stops.push(+(1 - k[i]).toFixed(3), k[i + 1], k[i + 2], k[i + 3]);
            gf.g.k.k = stops;
        }
        if (escudo && BAT_DODGE[sig]) {
            if (l.bm !== 3 || l.ef) throw new Error(`${l.nm}: bm ${l.bm}, efectos inesperados`);
            l.bm = 6;                  // color dodge
            l.ef = [relleno(BAT_DODGE[sig], 1)];
        }
        rename(d, l.nm, sig + '_opacidad');
    }
    for (const s of Object.values(SIGLAS)) {
        const n = d.layers.filter(l => l.nm === `.${s}_opacidad`).length;
        if (n !== 3) throw new Error(`${s}_opacidad: ${n} capas`);
    }
    // la textura de la barra de estadísticas llega con la clase "png" (como en la defensiva)
    rename(d, 'TEXTURA BASE_1.png', 'textura');

    // ---- timeline: el frame 0 vacío, como en la defensiva (el diseño ya casi lo estaba). Los
    // markers del diseñador (START 0–30, STOP 90–120) no sirven: la entrada dura hasta el 86 y el
    // STOP no anima nada.
    const ultimo = Math.max(...propiedadesAnimadas(d.layers).flatMap(p => p.k.map(k => k.t)));
    if (ultimo > ENTRADA_BAT - 0.5) throw new Error(`la entrada termina en el ${ultimo}: mover ENTRADA_BAT`);
    for (const l of d.layers) {
        l.ip = Math.max(l.ip, 1);
        l.op = ENTRADA_BAT + 1;
    }
    d.op = ENTRADA_BAT + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: ENTRADA_BAT, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: ENTRADA_BAT, cm: 'salida', dr: -ENTRADA_BAT }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    save(path.join(REPO, 'bateador/data.json'), d);
}

// ---------------------------------------------------------------- parcial
// El score de fin de inning (el export es FINAL DE INNING): C H E de los dos equipos con su barra y
// su nombre, el inning con sus flechas, los tres que vienen al bate y el cuadro de Pepsi. Las claves,
// las del parcial de LVBP-Meridiano, que a su vez son las del score donde dicen lo mismo: los escudos
// (<SIGLAS>VISITA_opacidad, <SIGLAS>LOCAL_opacidad), inning, las flechas, CARRERAS/HITS/ERRORES
// VISITA y LOCAL, jugador1–3 y titulo_jugadores. Propias: NOMBREVISITA / NOMBRELOCAL (el nombre
// escrito sobre la barra; en el score, EQUIPOVISITA son las siglas) y los rótulos fijos C, H, E.
// Cajas medidas en el frame 115 con la fuente cargada (todo cuelga de Nulo 23, al 102 %).
const PAR_INNING = 38;                 // 4 px antes de cada flecha (10 mide 26.7)
const PAR_NOMBRE = 203;                // 8 px adentro de la caja negra (221 px; AGUILAS mide 120.1)
const PAR_TITULO = 274;                // 8 px adentro de la columna de los bateadores (216 px)
// Los bateadores: el diseño los dejó centrados, pero corridos a mano para que se vean alineados a la
// izquierda (x 1108.6 el primero y 1110.5 los otros dos). Pasan a la izquierda desde donde empieza el
// texto del diseño (Lw, su ancho de línea) y llegan hasta 8 px antes del final de la columna (x 1307.2).
const PAR_JUGADORES = [['3B TOVAR 2', 121.3922, 169.39], ['CF CASTRO 2', 133.4531, 167.62], ['LF RONDON 2', 132.5813, 167.74]];
// Las barras de los equipos que no vinieron (el export trae Águilas y Leones, en PNG de 512 × 512 con
// la barra en x 0, y 192): las BARRA_<EQUIPO>_VISITA de la ofensiva, del mismo diseño, copiadas a mano
// a parcial/images. [archivo, el de ofensiva/images del que es copia, columnas transparentes a la
// izquierda del PNG]. Si la ofensiva cambia sus barras, prep.js falla: copiarlas de nuevo y medir
// esas columnas.
const PAR_BARRAS = {
    BRAVOS: ['barra_bravos.png', 'img_3.png', 2], CARD: ['barra_cardenales.png', 'img_4.png', 0],
    ANZ: ['barra_caribes.png', 'img_5.png', 0], MAGA: ['barra_magallanes.png', 'img_7.png', 0],
    TIBUS: ['barra_tiburones.png', 'img_9.png', 0], TIGRES: ['barra_tigres.png', 'img_8.png', 4]
};
const PAR_ENTRADA = 116;               // la entrada termina en el 115 (el logo de Pepsi se achica)
const PAR_DESCARTE = 282;              // del 282 al 372, el final a medio hacer del cuadro de Pepsi
if (hay('FINAL DE INNING')) {
    const d = load(path.join(SRC, 'FINAL DE INNING/data.json'));
    const quitar = nm => d.layers.splice(d.layers.indexOf(layer(d, nm)), 1)[0];

    // ---- textos
    rename(d, '10', 'inning');
    anchoCentrado(doc(d, '.inning'), PAR_INNING);
    // ▲ y ▼: la misma forma, la de abajo rotada 180°
    if (layer(d, 'Capa de formas 10').ks.r.k !== 0 || layer(d, 'Capa de formas 9').ks.r.k !== 180) throw new Error('flechas: rotación inesperada');
    rename(d, 'Capa de formas 10', 'INNINGarriba_opacidad');
    rename(d, 'Capa de formas 9', 'INNINGabajo_opacidad');
    // ALTA es la fila de arriba, la de la visita
    for (const [fila, lado] of [['ALTA', 'VISITA'], ['BAJA', 'LOCAL']]) {
        rename(d, 'CARRERA ' + fila, 'CARRERAS' + lado);
        rename(d, 'HITS ' + fila, 'HITS' + lado);
        rename(d, 'ERROR ' + fila, 'ERRORES' + lado);
    }
    rename(d, 'NOMBRE EQUIPO VISITANTE', 'NOMBREVISITA');
    rename(d, 'NOMBRE EQUIPO LOCAL', 'NOMBRELOCAL');
    anchoCentrado(doc(d, '.NOMBREVISITA'), PAR_NOMBRE);
    anchoCentrado(doc(d, '.NOMBRELOCAL'), PAR_NOMBRE);
    rename(d, 'C', 'rotulocarreras');
    rename(d, 'H', 'rotulohits');
    rename(d, 'E', 'rotuloerrores');
    rename(d, 'AL BATE', 'titulo_jugadores');
    anchoCentrado(doc(d, '.titulo_jugadores'), PAR_TITULO);
    PAR_JUGADORES.forEach(([nm, Lw, W], i) => {
        rename(d, nm, 'jugador' + (i + 1));
        const s = doc(d, '.jugador' + (i + 1));
        if (s.j !== 2) throw new Error(`${nm}: j ${s.j}`);
        s.ps[0] += (s.sz[0] - Lw) / 2;
        s.sz[0] = W;
        s.j = 0;
    });
    // Las cajas vienen de AE con lh 0.01, como en el score: lh a 1.2 del cuerpo. El alto, como en el
    // bateador: entra una línea al cuerpo del diseño (su ascent, más 2) y no dos hasta un 40 % del
    // cuerpo. Con el del export, un nombre largo partía en dos líneas chicas en vez de encoger.
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        if (!k.s.sz) throw new Error(`${l.nm}: no es de caja`);
        k.s.lh = 1.2 * k.s.s;
        k.s.sz[1] = +(d.fonts.list[0].ascent * k.s.s / 100 + 2).toFixed(2);
    }

    // ---- las barras de los equipos: imágenes apiladas, todas visibles al arrancar, como en el score.
    // Cada fila lleva su máscara animada (la barra baja desde arriba); las nuevas van debajo de la del
    // diseño, que queda arriba si no llega data.
    const filas = [['VISITA', 'BARRA_AGUILAS_VISITA.ai', 'AGUI'], ['LOCAL', 'BARRA_LEONES_VISITA.ai', 'LEO']];
    const del512 = Object.fromEntries(filas.map(([, nm, sig]) => [sig, layer(d, nm).refId]));
    let ind = Math.max(...d.layers.map(l => l.ind));
    for (const [lado, nm, sigFila] of filas) {
        const ref = layer(d, nm);
        if (ref.ks.a.k[0] !== 256 || ref.ks.a.k[1] !== 256) throw new Error(`${nm}: ancla ${ref.ks.a.k}`);
        const nuevas = [];
        for (const sig of Object.values(SIGLAS)) {
            if (sig === sigFila) continue;
            const c = clone(ref);
            c.ind = ++ind;
            c.nm = `.${sig}${lado}_opacidad`;
            c.cl = `${sig}${lado}_opacidad`;
            if (del512[sig]) { c.refId = del512[sig]; nuevas.push(c); continue; } // la otra del export
            const [png, deOfensiva, izq] = PAR_BARRAS[sig];
            const file = path.join(REPO, 'parcial/images', png);
            if (!fs.existsSync(file)) throw new Error(`falta parcial/images/${png} (la barra de la ofensiva)`);
            if (!fs.readFileSync(file).equals(fs.readFileSync(path.join(REPO, 'ofensiva/images', deOfensiva))))
                throw new Error(`parcial/images/${png} no es ofensiva/images/${deOfensiva}: copiarla de nuevo y medir sus columnas transparentes`);
            const [w, h] = medidasPng(file);
            const id = 'image_' + png.replace(/\.png$/, '');
            if (!d.assets.some(a => a.id === id)) d.assets.push({ id, w, h, u: 'images/', p: png, e: 0 });
            c.refId = id;
            // La barra en el mismo lugar que en el PNG de 512: su primera columna con color en x 0 y su
            // borde de arriba en y 192. La máscara, en las coordenadas de la imagen nueva.
            c.ks.a.k = [256 + izq, 256 - 192, 0];
            for (const kf of c.masksProperties[0].pt.k) for (const v of kf.s[0].v) { v[0] += izq; v[1] -= 192; }
            nuevas.push(c);
        }
        d.layers.splice(d.layers.indexOf(ref) + 1, 0, ...nuevas);
        rename(d, nm, `${sigFila}${lado}_opacidad`);
    }
    for (const s of Object.values(SIGLAS)) for (const lado of ['VISITA', 'LOCAL']) layer(d, `.${s}${lado}_opacidad`);

    // ---- los recuadros que se tocan: dos bordes suavizados que caen en el mismo píxel no suman 100 %
    // de opacidad, y en el key quedaba una columna de 1 px al 86–94 % entre el nombre y los números
    // (x 807), los números y los bateadores (1090) y los bateadores y la raya gris del cuadro de Pepsi
    // (1307): al aire, una línea finita de video. Los recuadros crecen 1 px sobre el vecino: los
    // números a la derecha, por debajo de los bateadores, y a la izquierda, por encima del final de
    // las barras (que quedan 1 px más cortas, abajo del nombre); los bateadores a la derecha, por
    // debajo de la raya.
    const nulo = layer(d, 'Nulo 23');
    if (nulo.ks.s.a || nulo.ks.s.k[0] !== 102) throw new Error('Nulo 23: escala inesperada');
    const ensancha = (nm, izq, der) => {
        const l = layer(d, nm), g = l.shapes[0].it;
        const rc = g.find(s => s.ty === 'rc'), tr = g.find(s => s.ty === 'tr');
        const sx = new Set(l.ks.s.a ? l.ks.s.k.map(k => k.s[0]) : [l.ks.s.k[0]]);
        if (sx.size !== 1 || rc.s.a || rc.p.a || tr.s.a || l.parent !== nulo.ind) throw new Error(`${nm}: transform inesperado`);
        const px = [...sx][0] / 100 * tr.s.k[0] / 100 * nulo.ks.s.k[0] / 100; // px de pantalla por unidad
        rc.s.k[0] += (izq + der) / px;
        rc.p.k[0] += (der - izq) / 2 / px;
    };
    ensancha('Capa de formas 1', 1, 1);
    ensancha('Capa de formas 4', 0, 1);

    // ---- el cuadro de Pepsi.
    // La imagen "Pepsi Insert (1).png" faltaba en el proyecto del diseñador: llega como las barras de
    // color de AE, en el centro de la pantalla. Y el círculo (Capa de formas 13) es un sobrante: el aro
    // del logo, 170 px más arriba del logo, que ya trae el suyo en el PNG.
    const insert = quitar('Pepsi Insert (1).png');
    d.assets = d.assets.filter(a => a.id !== insert.refId);
    quitar('Capa de formas 13');
    // Las letras grandes de PEPSI aparecen del 15 al 30, antes que el recuadro: en AE no se ven hasta que
    // el recuadro gris crece debajo (37–50), por la T de "preservar transparencia", que Lottie no
    // exporta. Cada letra va mateada con una copia del recuadro gris, que hace lo mismo. Su Hue/Saturation
    // está en cero (no hace nada) y se saca. La copia es 0.7 px más alta por lado: abajo llega hasta el
    // borde del recuadro azul (y 946), que en la pausa es el que está debajo, y la base de la S y la I
    // (945.9) se ve entera, como en AE.
    const gris = layer(d, 'Capa de formas 11');
    const rectGris = gris.shapes[0].it.find(s => s.ty === 'rc');
    if (rectGris.s.a || rectGris.s.k[1] !== 199.362) throw new Error('Capa de formas 11: recuadro inesperado');
    const letras = d.layers.filter(l => l.nm === 'pepsi-type-3.ai' && !l.parent);
    if (letras.length !== 5) throw new Error(`letras de PEPSI: ${letras.length}`);
    letras.forEach((l, i) => {
        if (l.tt || l.ef?.length !== 1 || l.ef[0].mn !== 'ADBE HUE SATURATION') throw new Error(`letra ${i + 1}: matte o efectos inesperados`);
        const hs = nm => l.ef[0].ef.find(x => x.nm === nm).v.k;
        if (hs('Channel Control') !== 1 || hs('Master Hue') || hs('Master Saturation') || hs('Master Lightness') || hs('Colorize'))
            throw new Error(`letra ${i + 1}: el Hue/Saturation cambia algo`);
        delete l.ef;
        const m = clone(gris);
        Object.assign(m, { ind: ++ind, nm: 'pepsi mascara ' + (i + 1), td: 1 });
        m.shapes[0].it.find(s => s.ty === 'rc').s.k[1] += 1.4;
        l.tt = 1;
        l.nm = 'pepsi letra ' + (i + 1);
        delete l.cl;                   // la clase "ai" (la extensión del archivo de AE), repetida
        d.layers.splice(d.layers.indexOf(l), 0, m);
    });
    const logo = layer(d, 'pepsi-seeklogo-3.ai');
    logo.nm = 'pepsi logo';
    delete logo.cl;
    d.layers.filter(l => l.nm === 'pepsi-type-3.ai').forEach((l, i) => {
        if (l.parent !== logo.ind) throw new Error('pepsi-type-3.ai: parent inesperado');
        l.nm = 'pepsi logo letra ' + (i + 1);
        delete l.cl;
    });

    // ---- timeline: la entrada (0–115) y la pausa. El export sigue hasta el 900: del 282 al 372 el logo
    // se vuelve un PEPSI chico, el recuadro se corta y quedan letras sueltas. No se usa, y entre la
    // entrada y ese final no se mueve nada. El frame 0 vacío, como en la defensiva.
    for (const p of propiedadesAnimadas(d.layers)) {
        if (p.k.some(k => k.t > PAR_ENTRADA - 0.5 && k.t < PAR_DESCARTE - 0.5)) throw new Error('hay animación entre la entrada y el final: mover PAR_ENTRADA');
        // ni un tramo que cruce la pausa: el último keyframe de la entrada y el primero del final, iguales
        const corte = p.k.findIndex(k => k.t >= PAR_DESCARTE - 0.5);
        if (corte > 0 && !p.k[corte - 1].h && JSON.stringify(p.k[corte - 1].s) !== JSON.stringify(p.k[corte].s))
            throw new Error('hay animación entre la entrada y el final: mover PAR_ENTRADA');
        p.k = p.k.filter(k => k.t < PAR_DESCARTE - 0.5);
        if (p.k.length < 2) throw new Error('una propiedad queda con un solo keyframe');
    }
    for (const l of d.layers) {
        if (l.ip > PAR_ENTRADA || l.op < PAR_ENTRADA + 1) throw new Error(`${l.nm}: ip ${l.ip}, op ${l.op}`);
        l.ip = Math.max(l.ip, 1);
        l.op = PAR_ENTRADA + 1;
    }
    d.op = PAR_ENTRADA + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: PAR_ENTRADA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: PAR_ENTRADA, cm: 'salida', dr: -PAR_ENTRADA }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergyVFVF.ttf';
    allCaps(d);
    save(path.join(REPO, 'parcial/data.json'), d);
}
