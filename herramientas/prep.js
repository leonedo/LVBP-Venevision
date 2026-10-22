// Prepara los exports del diseñador para CasparCG: la receta de "Cuando llega un export nuevo"
// de CLAUDE.md, ejecutable. Escrito sobre los exports del score (SCOREBUG, 2026-10-13 y 22), de la
// defensiva y la ofensiva (DEFENSIVA, OFENSIVA, 2026-10-15), del bateador (LOWBAR BATEADOR,
// 2026-10-18), del parcial (FINAL DE INNING, 2026-10-18) y del lanzador (PITCHERS, 2026-10-21): si
// el diseñador cambia nombres de capas, falla diciendo cuál no encuentra (no adivina).
//
// Uso, desde la raíz del repo:
//   1. Descomprimir los zips del diseñador en una carpeta (EXPORTS): SCOREBUG/, DEFENSIVA/,
//      OFENSIVA/, LOWBAR BATEADOR/, FINAL DE INNING/, PITCHERS/. Los que no estén se saltean:
//      alcanza con el zip que llegó.
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
// Los textos del UPDATE arrancan vacíos (Leon, 2026-10-18): lo que el controlador no manda no sale,
// en vez de quedar al aire el texto de ejemplo del diseño (NOMBRE APELLIDO, .000, el split…). Va al
// final de la receta: las cajas se miden con el texto del diseño.
function vaciaTextos(d) {
    for (const l of d.layers) if (l.ty === 5 && l.cl) for (const k of l.t.d.k) k.s.t = '';
}
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
    if (!(W > 0)) throw new Error(`anchoCentrado: ancho ${W} (¿se movió el texto? medir de nuevo)`);
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
function propiedadesAnimadas(o, acc = []) {
    if (Array.isArray(o)) o.forEach(v => propiedadesAnimadas(v, acc));
    else if (o && typeof o === 'object') {
        if (o.a === 1 && Array.isArray(o.k)) acc.push(o);
        else Object.values(o).forEach(v => propiedadesAnimadas(v, acc));
    }
    return acc;
}
// Dónde cae en pantalla (x) el x local de una capa, al final de la entrada: compone la cadena de
// parents con el último valor de cada transform. Sin rotaciones ni posiciones separadas.
const ultimoValor = p => p.a ? p.k[p.k.length - 1].s : p.k;
function enPantalla(d, l, x) {
    for (let c = l; c; c = c.parent ? d.layers.find(o => o.ind === c.parent) : null) {
        const { p, a, s, r } = c.ks;
        if ((r && (r.a || r.k)) || p.s) throw new Error(`${c.nm}: rotada o con posición separada`);
        x = ultimoValor(p)[0] + (x - ultimoValor(a)[0]) * ultimoValor(s)[0] / 100;
    }
    return x;
}
const escalaX = (d, l) => enPantalla(d, l, 1) - enPantalla(d, l, 0);

// ---------------------------------------------------------------- score
// Escudos: las siglas de los escudos del score de LVBP-Meridiano, para que el controlador mande
// la misma data a los dos.
const SIGLAS = {
    AGUILAS: 'AGUI', BRAVOS: 'BRAVOS', CARDENALES: 'CARD', CARIBES: 'ANZ',
    LEONES: 'LEO', MAGALLANES: 'MAGA', TIBURONES: 'TIBUS', TIGRES: 'TIGRES'
};
// Flujo (como el score de Meridiano): la entrada para en `marcador`, `next` sube la barra de
// jugadores (`jugadores`) y la baja (`sinjugadores`). La salida es la entrada al revés.
const ENTRADA = 59;                    // la entrada del marcador termina en el 58 (el brillo del logo)
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
const LOGO = 'LOGO FINAL ATRAPA LA EMOCION_1.png';
if (hay('SCOREBUG')) {
    const d = load(path.join(SRC, 'SCOREBUG/data.json'));

    // Desde el segundo export del 2026-10-22, abajo de todo viene una foto de un estadio (un JPG de
    // 2208 × 1242, sin alfa): el fondo con el que el diseñador ve la pizarra en AE. Al aire taparía
    // el video entero: sale, con su asset (y su imagen no se copia).
    for (const l of d.layers.filter(l => l.ty === 2 && /\.jpe?g$/i.test(d.assets.find(a => a.id === l.refId).p))) {
        if (d.layers.indexOf(l) !== d.layers.length - 1 || l.parent) throw new Error(`${l.nm}: JPG que no es el fondo de abajo de todo`);
        d.layers.splice(d.layers.indexOf(l), 1);
        d.assets.splice(d.assets.findIndex(a => a.id === l.refId), 1);
    }

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

    // El logo (desde el export del 2026-10-22, el de ATRAPA LA EMOCIÓN, una imagen; antes la V de
    // Venevisión, en vectores) no cuelga del Null 1, y tampoco su brillo: se corren igual que el
    // nulo, para que queden en su caja. Son dos capas con la misma imagen, la de abajo la que se ve
    // y la de arriba el matte del brillo, y llegan con la clase png (por el nombre): no son claves.
    for (const l of d.layers) {
        if (l.parent || l === raiz) continue;
        const p = l.ks.p;
        if (p.s) throw new Error(`${l.nm}: sin parent y con posición separada`);
        if (p.a) for (const k of p.k) k.s = [k.s[0] + CORRE[0], k.s[1] + CORRE[1], k.s[2]];
        else p.k = [p.k[0] + CORRE[0], p.k[1] + CORRE[1], p.k[2]];
    }
    const logo = d.layers.filter(l => l.nm === LOGO);
    if (logo.length !== 2) throw new Error(`logo: ${logo.length} capas "${LOGO}" (van 2)`);
    for (const l of logo) delete l.cl;
    // El brillo va en Add (bm 16), que Lottie no pinta: lo dejaba en Normal, una mancha gris que
    // cruzaba el logo. Pasa a Screen (bm 2), lo más parecido que Lottie pinta, y el index.html lo
    // lleva al Add de verdad (plus-lighter) por su ln, donde el navegador lo tiene.
    const brillo = layer(d, 'Shape Layer 8');
    if (brillo.bm !== 16 || brillo.tt !== 1 || d.layers[d.layers.indexOf(brillo) - 1] !== logo[0])
        throw new Error('Shape Layer 8: no es el brillo del logo (Add, mateado con el logo)');
    brillo.bm = 2;
    brillo.ln = 'brillo';
    // Key: la barra plateada de la izquierda del logo (Shape Layer 5) llega 0,45 px más a la
    // izquierda que en el export anterior y ya no se toca con la caja: en el key de CasparCG quedaba
    // una columna de 1 px al 87 % (x 101), de arriba abajo de la caja, una línea finita de video al
    // aire. Crece 1 px a la derecha, por debajo de la caja (como en el parcial).
    const izq = layer(d, 'Shape Layer 5'), gi = izq.shapes[0].it, caja = layer(d, 'Shape Layer 3');
    const rcI = gi.find(s => s.ty === 'rc'), trI = gi.find(s => s.ty === 'tr');
    const sxI = new Set(izq.ks.s.a ? izq.ks.s.k.map(k => k.s[0]) : [izq.ks.s.k[0]]);
    if (sxI.size !== 1 || rcI.s.a || rcI.p.a || trI.s.a || izq.parent !== raiz.ind || d.layers.indexOf(caja) > d.layers.indexOf(izq))
        throw new Error('Shape Layer 5: no es la barra de la izquierda del logo, debajo de la caja');
    const pxI = [...sxI][0] / 100 * trI.s.k[0] / 100 * RAIZ.s / 100; // px de pantalla por unidad
    rcI.s.k[0] = +(rcI.s.k[0] + 1 / pxI).toFixed(3);
    rcI.p.k[0] = +(rcI.p.k[0] + 1 / 2 / pxI).toFixed(3);

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

    // La pausa del marcador va después del último keyframe de la entrada (todo menos la barra de
    // jugadores): desde el export del 2026-10-22 es el brillo del logo, que pasa del 29 al 58, y
    // en la pausa de antes (el 53) quedaba quieto a medio camino, sobre la A.
    const barra = BARRA.map(nm => layer(d, nm));
    const ultimo = Math.max(...propiedadesAnimadas(d.layers.filter(l => !barra.includes(l))).flatMap(p => p.k.map(k => k.t)));
    if (ultimo > ENTRADA - 0.5) throw new Error(`la entrada termina en el ${ultimo}: mover ENTRADA`);

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
// 0.79989). APELLIDO, el texto del diseño, mide 76.1 al cuerpo del export (20; 24 en RF).
// El cuerpo de los nombres pasa a 25, el de los rótulos, como en la captura de AE que mandó Leon el
// 2026-10-21 (APELLIDO, 108 px de pantalla; con el 20 del export, 87): RF, a la misma escala de
// pantalla que los demás (en el export iba un 7 % más grande). Crecen desde el centro de la letra,
// que queda donde estaba: un nombre que encoge queda arriba en su barra, como antes.
const DEF_CUERPO = 25;
const DEF_ESCALA = 90.09;              // la de 8 de las 9 capas de los nombres
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
    const ascent = d.fonts.list[0].ascent / 100;
    for (const [nombre, rotulo, pos, W] of DEF_POSICIONES) {
        const l = rename(d, nombre, 'jugador' + pos);  // primero el nombre: el rótulo toma su nm
        const s = doc(d, '.jugador' + pos);
        s.sz[0] = W;
        if (l.ks.s.a || l.ks.s.k[0] !== l.ks.s.k[1]) throw new Error(`${l.nm}: escala inesperada`);
        const cuerpo = +(DEF_CUERPO * DEF_ESCALA / l.ks.s.k[0]).toFixed(2);
        s.ps[1] = +(s.ps[1] - ascent * (cuerpo - s.s) / 2).toFixed(3);
        s.s = cuerpo;
        if (s.sz[1] < ascent * cuerpo) throw new Error(`${l.nm}: la caja no tiene alto para el cuerpo ${cuerpo}`);
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
// (Águilas, 0.133 y 0.57 del claro; Leones, 0.384 y 0.69). La defensiva las toma de acá (el
// bateador, hasta el export del 2026-10-18, que trae sus colores). Los stops como en el JSON:
// posición, r, g, b (0–1); `export`, el degradado que llega.
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
// La barra baja del bateador. El export del 2026-10-18 (Leon: reemplaza al del 2026-10-16) es el
// mismo diseño al 64 %, más arriba, con una barra negra encima para el split, y todo cuelga de
// `Null 5` (al 130 %). Las claves, las de la barra de bateador de LVBP-Meridiano donde dicen lo
// mismo, para que el controlador le mande a las dos la misma data: nombrejugador, numerouniforme,
// posicion, etiquetaN / valorN (casilleros genéricos, 1 a 4 de izquierda a derecha),
// informacionbarranegra (el split, en la barra negra) y <SIGLAS>_opacidad. No tiene titulo.
// Bordes medidos en px de pantalla en el frame 87, con la fuente cargada; las cajas quedan a 5 px de
// ellos (los 8 px del bateador anterior, al 64 %). El nombre, hasta antes del negro del número (la
// caja del export cruzaba el número y la posición); el split, hasta antes del final de su barra (la
// cruzaba 29 px); el número y la posición, adentro de su placa, que va en diagonal (las cajas del
// export medían 379 px).
const BAT_MARGEN = 5;
const BAT_NOMBRE_HASTA = 724;          // empieza el negro del número (724–733 en la franja de las letras)
const BAT_SPLIT_HASTA = 706;           // termina la barra negra (706–712)
const BAT_NUMERO = [733, 805];         // el negro del número
const BAT_POSICION = [816, 901];       // el azul de la posición
// Estadísticas: el valor (cuerpo 70) va antes de su rótulo (40), y el diseño dejó los dos alineados
// a la izquierda: un valor de una cifra quedaba lejos de su rótulo y uno más largo se le metía
// encima. El valor pasa a la derecha, terminando donde termina el del diseño (Lw: .000 125.6719,
// 00 72.9531), y crece hacia la izquierda hasta 5 px después de la caja del rótulo anterior (el
// primero, hasta 5 px después del borde de la barra gris, x 309 de pantalla). Los rótulos, cajas
// de 70 unidades de su capa (AVG mide 67.5).
const BAT_STATS = [['AVE', '.AVERAGE'], ['HR', '.JONRONES'], ['CI', '.CARRERASIMPULSADAS'], ['OPS', '.OPSNUMERO']];
const BAT_LW = { '.000': 125.6719, '00': 72.9531 };
const BAT_ETIQUETA = 70;
const BAT_BORDE = 309;
const ENTRADA_BAT = 87;                // la entrada termina en el 86 (OPS)
const BAT_COSTURA = 2;                 // px que crece hacia abajo la barra negra del split (ver key)
// El escudo grande va en overlay sobre el fondo, que a lo sumo duplica el brillo de lo que tiene
// abajo: sobre el fondo de Tigres, casi negro, apenas se ve. Lleva lo mismo que su escudo en las
// puertas de la ofensiva: color dodge con el Fill gris. Acá el escudo va al 100 % (en las puertas,
// al 49 %). Con el fondo del export del 2026-10-18, más claro que el de la ofensiva, al 70 % se ve
// como el de Tiburones, el criterio de Leon (2026-10-16, cuando fue al 85 %); comparado con el
// overlay del diseño, 50, 60, 75, 80 y 85.
const BAT_DODGE = { TIGRES: 0.7 };
if (hay('LOWBAR BATEADOR')) {
    const d = load(path.join(SRC, 'LOWBAR BATEADOR/data.json'));
    const nulo = layer(d, 'Null 5');
    if (nulo.ks.s.a || nulo.ks.s.k[0] !== 130) throw new Error('Null 5: escala inesperada: medir de nuevo los bordes');

    // ---- textos
    // una caja que empieza donde la puso el diseño y termina en x de pantalla
    const hasta = (nm, x) => {
        const l = layer(d, nm), s = doc(d, nm);
        if (s.j !== 0) throw new Error(`${nm}: j ${s.j}`);
        s.sz[0] = +((x - BAT_MARGEN - enPantalla(d, l, s.ps[0])) / escalaX(d, l)).toFixed(2);
    };
    // una caja centrada que entra en [izq, der] de pantalla, a lo ancho de su centro
    const entre = (nm, [izq, der]) => {
        const l = layer(d, nm), s = doc(d, nm);
        const c = enPantalla(d, l, s.ps[0] + s.sz[0] / 2);
        anchoCentrado(s, +(2 * (Math.min(c - izq, der - c) - BAT_MARGEN) / escalaX(d, l)).toFixed(2));
    };
    hasta('.BATEADOR', BAT_NOMBRE_HASTA);
    rename(d, '.BATEADOR', 'nombrejugador');
    hasta('.INFORNACIONBARRAARRIBA', BAT_SPLIT_HASTA);
    rename(d, '.INFORNACIONBARRAARRIBA', 'informacionbarranegra');
    entre('.NUMEROJUGADOR', BAT_NUMERO);
    rename(d, '.NUMEROJUGADOR', 'numerouniforme');
    entre('.POSICIONDEJUGADOR', BAT_POSICION);
    rename(d, '.POSICIONDEJUGADOR', 'posicion');
    let libre = BAT_BORDE + BAT_MARGEN; // dónde puede empezar el próximo valor
    BAT_STATS.forEach(([rotulo, valor], i) => {
        const lv = layer(d, valor), v = doc(d, valor);
        v.t = v.t.trim();              // ".000 ": el espacio del final
        if (v.j !== 0 || !BAT_LW[v.t]) throw new Error(`${valor}: j ${v.j}, texto "${v.t}"`);
        const fin = v.ps[0] + BAT_LW[v.t];
        v.sz[0] = +((enPantalla(d, lv, fin) - libre) / escalaX(d, lv)).toFixed(2);
        v.ps[0] = fin - v.sz[0];
        v.j = 1;
        rename(d, valor, 'valor' + (i + 1));
        const le = layer(d, rotulo), e = doc(d, rotulo);
        if (e.j !== 0) throw new Error(`${rotulo}: j ${e.j}`);
        e.sz[0] = BAT_ETIQUETA;
        libre = enPantalla(d, le, e.ps[0] + BAT_ETIQUETA) + BAT_MARGEN;
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
    // barra de Bravos llega sin el _1 de las otras. Los fondos, con los colores del diseñador (Leon,
    // 2026-10-18: el export anterior traía el mismo naranja en siete equipos, y se les ponía el
    // degradado de las puertas de la ofensiva).
    for (const l of d.layers) {
        const barra = l.nm.match(/^\.BARRA_([A-Z]+)_BATEO(?:_1)?\.png$/);
        const fondo = l.nm.match(/^\.FONDO([A-Z]+)$/);
        const escudo = l.nm.match(/^\.([A-Z]+)LOGO$/);
        const m = barra || fondo || escudo;
        if (!m) continue;
        const sig = SIGLAS[m[1]];
        if (!sig) throw new Error(`${l.nm}: equipo desconocido`);
        // Hasta que empieza a moverse (frame 11), la punta de la barra asomaba en el borde
        // izquierdo: en la entrada y al final de la salida. Aparece cuando se mueve.
        if (barra) {
            if (!l.ks.p.a) throw new Error(`${l.nm}: sin animación`);
            l.ip = l.ks.p.k[0].t;
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

    // ---- key: la barra negra del split y lo de abajo (el fondo y la barra del nombre) se tocan borde
    // con borde, y dos bordes suavizados que caen en el mismo píxel no suman 100 %: en el key de
    // CasparCG quedaba una fila de 1 px al 58–69 % (y 813), una línea finita de video al aire. La
    // barra negra crece hacia abajo, por debajo del fondo y por encima de la barra del nombre, que
    // ahí arriba es casi negra (como en el parcial: BAT_COSTURA px).
    const negra = layer(d, 'Capa de formas 4'), gn = negra.shapes[0].it;
    const rc = gn.find(s => s.ty === 'rc'), tr = gn.find(s => s.ty === 'tr');
    if (gn.length !== 4 || rc.s.a || rc.p.a || tr.s.a || negra.ks.s.a || negra.parent !== nulo.ind) throw new Error('Capa de formas 4: transform inesperado');
    const py = negra.ks.s.k[1] / 100 * tr.s.k[1] / 100 * nulo.ks.s.k[1] / 100; // px de pantalla por unidad, en y
    rc.s.k[1] = +(rc.s.k[1] + BAT_COSTURA / py).toFixed(3);
    rc.p.k[1] = +(rc.p.k[1] + BAT_COSTURA / 2 / py).toFixed(3);

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
    vaciaTextos(d);
    save(path.join(REPO, 'bateador/data.json'), d);
}

// ---------------------------------------------------------------- lanzador
// El lanzador (el export es PITCHERS; la carpeta, como su equivalente de Meridiano): a la izquierda,
// de arriba abajo, un panel del color del equipo con su escudo grande; la barra del equipo con el
// nombre y el apellido, en dos líneas, y el número; abajo, una barra negra con el split; la mano de
// lanzar, y seis estadísticas (rótulo y valor) sobre una textura gris. Las claves, las del lanzador
// de LVBP-Meridiano donde dicen lo mismo: manodelanzar, etiquetaN / valorN (casilleros genéricos, 1
// a 6 de arriba abajo), informacionbarranegra (el split) y <SIGLAS>_opacidad. Propias: nombre y
// apellido (en Meridiano, nombrelanzador es el nombre completo en una línea) y numerouniforme (la
// del bateador). No tiene titulo.
// El export del 2026-10-21 (Leon: reemplaza al del 2026-10-18) es el mismo diseño al 80 %, con la
// barra negra del split (una copia negra de la última fila de las estadísticas, Sólido Profundo
// Azul 2, y su texto, una copia de la mano) y las estadísticas 44,4 px más abajo, para hacerle
// lugar. Todo cuelga de `Null 7` (s 80, a [−179, 0], p [782, 515] al final: lo que no tenía parent
// queda en x 157,2 + 0,8 x, y 83 + 0,8 y), que en la entrada se corre 174 px a la derecha (0–49).
// Las medidas son las del export anterior pasadas por ese cambio: las cajas quedan iguales, en
// unidades de cada capa (y 6,4 px de margen, los 8 de antes).
// Bordes medidos en px de pantalla en el frame 109 con la fuente cargada. El número, centrado donde
// lo puso el diseño (x 874), en 64 px (00 mide 53); el nombre y el apellido, desde donde empiezan
// hasta el margen antes del número (las cajas del export cruzaban el número y el final de la
// barra). La mano, centrada en su placa azul (termina en x 665,2). El split, desde donde empieza
// hasta el margen antes del final de la barra negra (904 donde empiezan las letras; la caja del
// export la cruzaba 20 px).
const LAN_RAIZ = { nm: 'Null 7', s: 80 };
const LAN_MARGEN = 6.4;
const LAN_NUMERO = 64;
const LAN_MANO_HASTA = 665.2;
const LAN_SPLIT_HASTA = 904;
// Los rótulos de las estadísticas llegan centrados, cada uno en una caja distinta, y en pantalla
// quedan alineados a la izquierda a ojo (empiezan entre x 634 y 638): pasan a la izquierda, todos
// desde el x del primero (G-P, 636,4), hasta la mitad del margen antes de la columna de los valores
// (x 733,2). Los valores quedan centrados donde los puso el diseño (x 808,4), desde la mitad del
// margen después de esa columna.
const LAN_STATS = [['.GANADOSYPERDIDOS', 'NUMEROSDEGANADOSYPERDIDOS'], ['.EFECTIVIDAD', '.NNUMEROSEFECTIVIDAD'],
    ['.BASEXBOLAS', '.NUMEROSBASESXBOLAS'], ['.PONCHES', '.NUMEROSPONCHE'], ['.WHIP', '.NUMEROSWHIP'],
    ['.INNINIGSLANZADOS', '.NUMEROSINNINGLANZADOS']];
const LAN_ROTULOS_DESDE = 636.4;
const LAN_COLUMNA = 733.2;
const ENTRADA_LAN = 110;               // la entrada termina en el 109 (el último rótulo)
// La barra de Bravos no vino: es la del bateador (la misma serie de barras), con las medidas de
// las otras, que escalan con el ancho de su imagen (el ancla y la máscara).
const LAN_BARRA_BRAVOS = 'images/barra_bravos.png';
if (hay('PITCHERS')) {
    const d = load(path.join(SRC, 'PITCHERS/data.json'));
    const local = (l, X) => (X - enPantalla(d, l, 0)) / escalaX(d, l);
    const r2 = v => +v.toFixed(2);
    const raiz = layer(d, LAN_RAIZ.nm);
    if (raiz.parent || raiz.ks.s.a || raiz.ks.s.k[0] !== LAN_RAIZ.s) throw new Error(`${LAN_RAIZ.nm}: escala inesperada: medir de nuevo los bordes`);

    // ---- textos
    rename(d, '.NOMBRE', 'nombre');
    rename(d, '.APELLIDO', 'apellido');
    rename(d, ',NUMEROUNIFORME', 'numerouniforme');
    rename(d, '.MANODELLANZADOR', 'manodelanzar');
    const num = layer(d, '.numerouniforme'), sn = doc(d, '.numerouniforme');
    anchoCentrado(sn, r2(LAN_NUMERO / escalaX(d, num)));
    const desdeNumero = enPantalla(d, num, sn.ps[0]) - LAN_MARGEN;
    for (const nm of ['.nombre', '.apellido']) {
        const s = doc(d, nm);
        s.t = s.t.trim();              // "NOMBRE \r": un salto de línea al final
        if (s.j !== 0) throw new Error(`${nm}: j ${s.j}`);
        s.sz[0] = r2(local(layer(d, nm), desdeNumero) - s.ps[0]);
    }
    const mano = layer(d, '.manodelanzar'), sm = doc(d, '.manodelanzar');
    const cm = enPantalla(d, mano, sm.ps[0] + sm.sz[0] / 2);
    anchoCentrado(sm, r2(2 * (LAN_MANO_HASTA - LAN_MARGEN - cm) / escalaX(d, mano)));
    // el split llega como una copia de la mano (con su clase): queda como en el bateador
    rename(d, '.MANODELLANZADOR 2', 'informacionbarranegra');
    const split = layer(d, '.informacionbarranegra'), ss = doc(d, '.informacionbarranegra');
    if (ss.j !== 0) throw new Error(`.informacionbarranegra: j ${ss.j}`);
    ss.sz[0] = r2(local(split, LAN_SPLIT_HASTA - LAN_MARGEN) - ss.ps[0]);
    LAN_STATS.forEach(([rotulo, valor], i) => {
        const le = layer(d, rotulo), e = doc(d, rotulo), lv = layer(d, valor), v = doc(d, valor);
        if (e.j !== 2 || v.j !== 2) throw new Error(`${rotulo}: j ${e.j}, ${valor}: j ${v.j}`);
        e.ps[0] = r2(local(le, LAN_ROTULOS_DESDE));
        e.sz[0] = r2(local(le, LAN_COLUMNA - LAN_MARGEN / 2) - e.ps[0]);
        e.j = 0;
        const c = enPantalla(d, lv, v.ps[0] + v.sz[0] / 2);
        anchoCentrado(v, r2(2 * (c - LAN_COLUMNA - LAN_MARGEN / 2) / escalaX(d, lv)));
        rename(d, rotulo, 'etiqueta' + (i + 1));
        rename(d, valor, 'valor' + (i + 1));
    });
    // El alto: una línea al cuerpo del diseño (su ascent, más 2), como en el bateador.
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        if (!k.s.sz) throw new Error(`${l.nm}: no es de caja`);
        k.s.sz[1] = r2(d.fonts.list[0].ascent * k.s.s / 100 + 2);
    }

    // ---- el panel de color: la textura con un Gradient Ramp, que Lottie no pinta (salía la textura
    // blanca). En AE el Ramp tapa toda la capa (Blend With Original 0) y lo recorta la máscara: pasa a
    // una capa de forma con la máscara como trazado y el degradado lineal del Ramp, con sus colores.
    for (const l of d.layers) {
        if (!/^\.COLOR[A-Z]+$/.test(l.nm)) continue;
        const ef = l.ef || [];
        if (l.ty !== 2 || ef.length !== 1 || ef[0].mn !== 'ADBE Ramp') throw new Error(`${l.nm}: sin Gradient Ramp`);
        const v = nm => ef[0].ef.find(x => x.nm === nm).v.k;
        if (v('Ramp Shape') !== 1 || v('Ramp Scatter') || v('Blend With Original')) throw new Error(`${l.nm}: Ramp inesperado`);
        const m = l.masksProperties || [];
        if (m.length !== 1 || m[0].mode !== 'a' || m[0].inv || m[0].pt.a || m[0].o.k !== 100 || m[0].x.k) throw new Error(`${l.nm}: máscara inesperada`);
        const [c0, c1] = [v('Start Color'), v('End Color')];
        l.ty = 4;
        l.shapes = [{ ty: 'gr', nm: 'panel', np: 3, cix: 2, bm: 0, ix: 1, it: [
            { ty: 'sh', nm: 'máscara', ix: 1, ks: m[0].pt },
            { ty: 'gf', nm: 'Gradient Ramp', o: { a: 0, k: 100, ix: 10 }, r: 1, bm: 0, t: 1,
                g: { p: 2, k: { a: 0, k: [0, c0[0], c0[1], c0[2], 1, c1[0], c1[1], c1[2]], ix: 9 } },
                s: { a: 0, k: v('Start of Ramp'), ix: 5 }, e: { a: 0, k: v('End of Ramp'), ix: 6 } },
            { ty: 'tr', nm: 'Transformar', p: { a: 0, k: [0, 0], ix: 2 }, a: { a: 0, k: [0, 0], ix: 1 },
                s: { a: 0, k: [100, 100], ix: 3 }, r: { a: 0, k: 0, ix: 6 }, o: { a: 0, k: 100, ix: 7 },
                sk: { a: 0, k: 0, ix: 4 }, sa: { a: 0, k: 0, ix: 5 } }] }];
        for (const k of ['refId', 'masksProperties', 'hasMask', 'ef']) delete l[k];
    }
    // ---- la textura gris de las estadísticas
    // Su matte (BORDE DE SOMBRA 2, la forma del panel) llega lejos de ella: el export de Bodymovin
    // 5.9 no dice cuál es (no trae tp) y Lottie matea con la capa de arriba, un sólido. Pasa a
    // estar justo encima, que es lo que Lottie entiende.
    const tex = layer(d, 'TEXTURA BASE 4_1.png'), mate = layer(d, 'BORDE DE SOMBRA 2');
    if (!tex.tt || !mate.td || d.layers.filter(l => l.td).length !== 1 || d.layers.filter(l => l.tt).length !== 1) throw new Error('textura: mattes inesperados');
    d.layers.splice(d.layers.indexOf(mate), 1);
    d.layers.splice(d.layers.indexOf(tex), 0, mate);
    // Su Hue/Saturation (saturación −100, claridad −23) Lottie tampoco lo pinta: la textura es
    // gris (R = G = B), así que sólo cuenta la claridad, que la oscurece al 77 %. Un Tint de negro a
    // gris 77 %, que Lottie sí pinta, da lo mismo.
    const hs = (tex.ef || []).find(e => e.mn === 'ADBE HUE SATURATION');
    if (!hs || tex.ef.length !== 1) throw new Error('textura: sin Hue/Saturation');
    const hv = nm => hs.ef.find(x => x.nm === nm).v.k;
    if (hv('Channel Control') !== 1 || hv('Master Hue') || hv('Master Saturation') !== -100 || hv('Colorize')) throw new Error('textura: Hue/Saturation inesperado');
    const g = 1 + hv('Master Lightness') / 100;
    tex.ef = [{ ty: 20, nm: 'Tint', np: 6, mn: 'ADBE Tint', ix: 1, en: 1, ef: [
        { ty: 2, nm: 'Map Black To', mn: 'ADBE Tint-0001', ix: 1, v: { a: 0, k: [0, 0, 0, 1], ix: 1 } },
        { ty: 2, nm: 'Map White To', mn: 'ADBE Tint-0002', ix: 2, v: { a: 0, k: [g, g, g, 1], ix: 2 } },
        { ty: 0, nm: 'Amount to Tint', mn: 'ADBE Tint-0003', ix: 3, v: { a: 0, k: 100, ix: 3 } }] }];
    rename(d, 'TEXTURA BASE 4_1.png', 'textura');

    // ---- la barra de Bravos
    const ref = layer(d, '.BARRAAGUILAS'), refA = d.assets.find(a => a.id === ref.refId);
    const [bw, bh] = medidasPng(path.join(REPO, 'lanzador', LAN_BARRA_BRAVOS));
    if (d.layers.some(l => (l.nm || '').trim() === '.BARRABRAVOS')) throw new Error('la barra de Bravos ya viene en el export: sacar LAN_BARRA_BRAVOS');
    if (refA.w !== 512 || refA.h !== bh) throw new Error('barras: medidas inesperadas');
    const k = bw / refA.w, bravos = clone(ref);
    bravos.nm = '.BARRABRAVOS';
    bravos.cl = 'BARRABRAVOS';
    bravos.ind = freeInd(d, Math.max(...d.layers.map(l => l.ind)) + 1);
    bravos.refId = 'image_barra_bravos';
    bravos.ks.a.k[0] = r2(ref.ks.a.k[0] * k);
    for (const v of bravos.masksProperties[0].pt.k.v) v[0] = r2(v[0] * k);
    d.assets.push({ id: bravos.refId, w: bw, h: bh, u: 'images/', p: path.basename(LAN_BARRA_BRAVOS), e: 0 });
    d.layers.splice(d.layers.indexOf(layer(d, '.BARRACARDENALES')) + 1, 0, bravos);

    // ---- el equipo: cada clave prende el panel de color, su escudo grande (en overlay) y la barra
    // (imagen, con el escudo de marca de agua). Los escudos de Cardenales y Bravos llegan como
    // LOGOGRANDE (el de Cardenales sin el punto) y el panel de Bravos como COLORBARAVOS.
    // El escudo va al 49 %, como el de las compuertas de la defensiva, y por lo mismo ese 49 % pasa de
    // la capa al CSS de su <image> (g[id^="escudo"] > image, por su ln): el UPDATE escribe ahí su
    // _opacidad y lo pisaría con un 1 (el escudo salía al 100 % y el panel, mucho más claro).
    const ALIAS = { BARAVOS: 'BRAVOS' };
    for (const l of [...d.layers]) {
        const nm = (l.nm || '').trim();    // como layer(): el export trae nm con espacios al final
        const escudo = nm.match(/^\.?LOGO(?:GRANDE)?([A-Z]+)$/);
        const m = escudo || nm.match(/^\.COLOR([A-Z]+)$/) || (l.ty === 2 && nm.match(/^\.BARRA([A-Z]+)$/));
        if (!m) continue;
        const sig = SIGLAS[ALIAS[m[1]] || m[1]];
        if (!sig) throw new Error(`${nm}: equipo desconocido`);
        if (escudo) {
            if (l.ks.o.a || l.ks.o.k !== 49 || l.ty !== 2) throw new Error(`${nm}: opacidad inesperada`);
            l.ks.o.k = 100;
            l.ln = 'escudo' + sig;
        }
        rename(d, nm, sig + '_opacidad');
    }
    for (const s of Object.values(SIGLAS)) {
        const n = d.layers.filter(l => l.nm === `.${s}_opacidad`).length;
        if (n !== 3) throw new Error(`${s}_opacidad: ${n} capas`);
    }

    // ---- timeline: el frame 0 ya está vacío. Los markers del diseñador (start 0–30, stop 120–150)
    // no sirven: la entrada dura hasta el 109 y el stop no anima nada. La salida, la entrada al revés.
    const ultimo = Math.max(...propiedadesAnimadas(d.layers).flatMap(p => p.k.map(k => k.t)));
    if (ultimo > ENTRADA_LAN - 0.5) throw new Error(`la entrada termina en el ${ultimo}: mover ENTRADA_LAN`);
    for (const l of d.layers) {
        l.ip = Math.max(l.ip, 1);
        l.op = ENTRADA_LAN + 1;
    }
    d.op = ENTRADA_LAN + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: ENTRADA_LAN, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: ENTRADA_LAN, cm: 'salida', dr: -ENTRADA_LAN }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    vaciaTextos(d);
    save(path.join(REPO, 'lanzador/data.json'), d);
}

// ---------------------------------------------------------------- parcial
// El score de fin de inning (el export es FINAL DE INNING): C H E de los dos equipos con su barra y
// su nombre, el inning con sus flechas, los tres que vienen al bate (posición y apellido) y el cuadro
// de Pepsi, que desde el export del 2026-10-18 llega como una secuencia de PNG (262 frames de 334 ×
// 208, un precomp). Las claves, las del parcial de LVBP-Meridiano, que a su vez son las del score donde
// dicen lo mismo: los escudos (<SIGLAS>VISITA_opacidad, <SIGLAS>LOCAL_opacidad), inning, las flechas,
// CARRERAS/HITS/ERRORES VISITA y LOCAL, jugador1–3 y titulo_jugadores. Propias: posicion1–3 (como en la
// ofensiva), NOMBREVISITA / NOMBRELOCAL (el nombre escrito sobre la barra; en el score, EQUIPOVISITA
// son las siglas) y los rótulos fijos C, H, E.
// Cajas medidas en el frame 221 con la fuente cargada (todo cuelga de Nulo 23, al 102 %, salvo las
// posiciones, sin parent).
const PAR_INNING = 38;                 // 4 px antes de cada flecha (10 mide 26.7)
const PAR_NOMBRE = 203;                // 8 px adentro de la caja negra (221 px; AGUILAS mide 120.1)
const PAR_TITULO = 274;                // 8 px adentro de la columna de los bateadores (216 px)
// El apellido, alineado a la izquierda desde donde empieza en el diseño (x 1061.6), hasta 8 px antes
// del final de la columna (x 1215.2): la caja del export llegaba 40 px adentro del cuadro de Pepsi.
// TOVAR mide 83.5 y CASTILLO 115.9.
const PAR_JUGADOR = { ps: 32.8073883056641, W: 129.46 };
// Flujo: la pizarra entra del 0 al 41 y el cuadro de Pepsi del 37 al 73; el logo queda quieto, le pasa
// un brillo (181–220) y la entrada para en el 221, con el logo limpio (Leon, 2026-10-18). La salida es
// la del diseñador para el cuadro de Pepsi (222–295: las letras se van, el logo se vuelve un punto y el
// recuadro se cierra) y después la pizarra, que el export no saca (la corta en el 297): su entrada al
// revés, del 296 al 337. En total, 3,9 s.
const PAR_PAUSA = 222;                 // play 0–222: queda en el 221
const PAR_PIZARRA = 41;                // la entrada de la pizarra termina en el 41 (el tercer bateador)
const PAR_FIN_PEPSI = 296;             // la secuencia queda vacía desde el 296 (su frame 259)
const PAR_FIN = PAR_FIN_PEPSI + PAR_PIZARRA; // 337, vacío
// Los PNG de la secuencia vienen reducidos a unos 40 colores con tramado, y cada frame se trama
// distinto: con el logo quieto, sus bordes titilaban. En los frames 38–133 de la secuencia (al aire,
// del 76 al 171, antes del brillo) el logo no se mueve (medido: el centro de su luz no se corre más de
// 0,04 px), y se ve un solo PNG, el primero (Leon, 2026-10-18). Cuando lleguen los PNG con color
// completo, null.
const PAR_QUIETO = [38, 134];          // frames de la secuencia, del 38 al 133
if (hay('FINAL DE INNING')) {
    const d = load(path.join(SRC, 'FINAL DE INNING/data.json'));

    // ---- textos
    rename(d, '.inning', 'inning');
    anchoCentrado(doc(d, '.inning'), PAR_INNING);
    // ▲ y ▼: la misma forma, la de abajo rotada 180°
    if (layer(d, '.INNINGARRIBAFLECHA').ks.r.k !== 0 || layer(d, '.INNINGABAJOFLECHA').ks.r.k !== 180) throw new Error('flechas: rotación inesperada');
    rename(d, '.INNINGARRIBAFLECHA', 'INNINGarriba_opacidad');
    rename(d, '.INNINGABAJOFLECHA', 'INNINGabajo_opacidad');
    // ALTA es la fila de arriba, la de la visita. Los errores de abajo llegan sin el punto (sin clase).
    rename(d, '.CARRERA ALTA', 'CARRERASVISITA');
    rename(d, '.HITS ALTA', 'HITSVISITA');
    rename(d, '.ERROR ALTA', 'ERRORESVISITA');
    rename(d, '.CARRERA BAJA', 'CARRERASLOCAL');
    rename(d, '.HITS BAJA', 'HITSLOCAL');
    rename(d, 'ERRORESBAJA', 'ERRORESLOCAL');
    rename(d, '.VISITANTE', 'NOMBREVISITA');
    rename(d, '.LOCAL', 'NOMBRELOCAL');
    anchoCentrado(doc(d, '.NOMBREVISITA'), PAR_NOMBRE);
    anchoCentrado(doc(d, '.NOMBRELOCAL'), PAR_NOMBRE);
    rename(d, 'C', 'rotulocarreras');
    rename(d, 'H', 'rotulohits');
    rename(d, 'E', 'rotuloerrores');
    rename(d, '.albate', 'titulo_jugadores');
    anchoCentrado(doc(d, '.titulo_jugadores'), PAR_TITULO);
    // Los bateadores, en dos capas: la posición (cian, centrada en su caja: entra cualquiera de dos
    // letras, DH mide 33 de 40) y el apellido (blanco).
    for (let n = 1; n <= 3; n++) {
        rename(d, '.POSPREVENIDO' + n, 'posicion' + n);
        const p = doc(d, '.posicion' + n);
        p.t = p.t.trim();              // "3B ": Lottie no cuenta el espacio final al centrar
        rename(d, '.PREVENIDO' + n, 'jugador' + n);
        const j = doc(d, '.jugador' + n);
        if (j.j !== 0 || j.ps[0] !== PAR_JUGADOR.ps) throw new Error(`jugador${n}: j ${j.j}, ps ${j.ps[0]}: medir de nuevo PAR_JUGADOR`);
        j.sz[0] = PAR_JUGADOR.W;
    }
    // Las cajas vienen de AE con lh 0.01, como en el score: lh a 1.2 del cuerpo. El alto, como en el
    // bateador: entra una línea al cuerpo del diseño (su ascent, más 2) y no dos hasta un 40 % del
    // cuerpo. Con el del export, un nombre largo partía en dos líneas chicas en vez de encoger.
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        if (!k.s.sz) throw new Error(`${l.nm}: no es de caja`);
        k.s.lh = 1.2 * k.s.s;
        k.s.sz[1] = +(d.fonts.list[0].ascent * k.s.s / 100 + 2).toFixed(2);
    }

    // ---- las barras de los equipos: las 8 de cada fila, imágenes apiladas con su máscara (un track
    // matte), todas visibles al arrancar, como en el score.
    for (const l of d.layers) {
        const m = (l.nm || '').match(/^\.([A-Z]+?)(LOCAL|VISITA)$/);
        if (!m || l.ty !== 2) continue;
        if (!SIGLAS[m[1]]) throw new Error(`equipo desconocido ${m[1]}`);
        rename(d, l.nm, SIGLAS[m[1]] + m[2] + '_opacidad');
    }
    for (const s of Object.values(SIGLAS)) for (const lado of ['VISITA', 'LOCAL']) layer(d, `.${s}${lado}_opacidad`);

    // ---- los recuadros que se tocan: dos bordes suavizados que caen en el mismo píxel no suman 100 %
    // de opacidad, y en el key quedaba una columna de 1 px al 86–94 % entre el nombre y los números,
    // los números y los bateadores, y los bateadores y la raya gris del cuadro de Pepsi: al aire, una
    // línea finita de video. Los recuadros crecen 1 px sobre el vecino: los números a la derecha, por
    // debajo de los bateadores, y a la izquierda, por encima del final de las barras (que quedan 1 px
    // más cortas, abajo del nombre); los bateadores a la derecha, por debajo de la raya.
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

    // ---- timeline. El export dice que dura 38 frames (op) y sus capas llegan hasta el 297; sus
    // markers (START 0–30, stop 270–298) no sirven: la entrada dura hasta el 221.
    const pepsi = layer(d, 'PEPSI LOGO');
    const secuencia = d.assets.find(a => a.id === pepsi.refId);
    if (!secuencia || secuencia.layers.length !== 262 || pepsi.st !== pepsi.ip) throw new Error('PEPSI LOGO: secuencia inesperada');
    // Su primer frame vacío del final: los PNG vacíos de la secuencia son el mismo archivo (el del 0).
    // (el frame k de la secuencia es la capa que se ve en su k: los nm vienen al revés, PEPSI_00296 en el 0)
    const capa = k => secuencia.layers.find(c => c.ip <= k + 0.5 && k + 0.5 < c.op); // a mitad del frame: los ip traen decimales
    const png = k => {
        const a = d.assets.find(x => x.id === capa(k).refId);
        return fs.readFileSync(path.join(SRC, 'FINAL DE INNING', a.u, a.p));
    };
    const kFin = Math.round(PAR_FIN_PEPSI - pepsi.st);
    if (!png(kFin).equals(png(0)) || png(kFin - 1).equals(png(0))) throw new Error('PEPSI LOGO: medir de nuevo PAR_FIN_PEPSI (su primer frame vacío del final)');
    if (PAR_QUIETO) {
        // la capa del primer frame dura hasta el final del tramo; las otras se van, con sus imágenes
        const [k0, k1] = PAR_QUIETO;
        const primera = capa(k0), fuera = new Set();
        for (let k = k0 + 1; k < k1; k++) fuera.add(capa(k));
        primera.op = capa(k1 - 1).op;
        secuencia.layers = secuencia.layers.filter(c => !fuera.has(c));
        const usadas = new Set(secuencia.layers.map(c => c.refId));
        d.assets = d.assets.filter(a => usadas.has(a.id) || ![...fuera].some(c => c.refId === a.id));
    }
    const marcoDer = layer(d, 'MARCO DE PUBLICIDAD 4'); // la raya derecha, que sale con el cuadro (273–282)
    // La pizarra (todo menos el cuadro de Pepsi y su raya derecha): su entrada al revés desde el 296.
    // Una capa que entraba en el frame t se va en el PAR_FIN − t.
    for (const l of d.layers) {
        if (l === pepsi || l === marcoDer) continue;
        for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) alReves(p, 0, PAR_PIZARRA, PAR_FIN_PEPSI);
    }
    for (const l of d.layers) {
        // los mattes, con la capa que matean
        const ref = l.td ? d.layers[d.layers.indexOf(l) + 1] : l;
        if (l.op < PAR_FIN_PEPSI || ref.ip > PAR_PAUSA) throw new Error(`${l.nm}: ip ${l.ip}, op ${l.op}: termina antes de la salida`);
        l.op = (ref === pepsi || ref === marcoDer) ? PAR_FIN_PEPSI : PAR_FIN - Math.max(ref.ip, 1) + 0.001;
    }
    for (const l of d.layers) l.ip = Math.max(l.ip, 1);
    if (Math.max(...propiedadesAnimadas(d.layers).flatMap(p => p.k.map(k => k.t))) > PAR_FIN) throw new Error('animación después del final');
    d.op = PAR_FIN + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: PAR_PAUSA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: PAR_PAUSA, cm: 'salida', dr: PAR_FIN + 1 - PAR_PAUSA }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergyVFVF.ttf';
    allCaps(d);
    save(path.join(REPO, 'parcial/data.json'), d);
}
