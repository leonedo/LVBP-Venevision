// Prepara los exports del diseñador para CasparCG: la receta de "Cuando llega un export nuevo"
// de CLAUDE.md, ejecutable. Escrito sobre los exports del score (SCOREBUG, 2026-10-13), de la
// defensiva y la ofensiva (DEFENSIVA, OFENSIVA, 2026-10-15) y del bateador (LOWBAR BATEADOR,
// 2026-10-16): si el diseñador cambia nombres de capas, falla diciendo cuál no encuentra (no adivina).
//
// Uso, desde la raíz del repo:
//   1. Descomprimir los zips del diseñador en una carpeta (EXPORTS): SCOREBUG/, DEFENSIVA/,
//      OFENSIVA/, LOWBAR BATEADOR/. Los que no estén se saltean: alcanza con el zip que llegó.
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
if (hay('SCOREBUG')) {
    const d = load(path.join(SRC, 'SCOREBUG/data.json'));

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
    mascara.ind = freeInd(d, 65);
    const agui = layer(d, '.AGUILOCAL_opacidad');
    d.layers.splice(d.layers.indexOf(agui), 0, mascara);

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
    // Barra de jugadores (capas a escala 0.8: 1 px de pantalla = 1.25 unidades). Las cajas del
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
    for (const l of d.layers) {
        const barra = l.nm.match(/^\.BARRA_([A-Z]+)_BATEO(?:_1)?\.png$/);
        const m = barra || l.nm.match(/^\.FONDO([A-Z]+)$/) || l.nm.match(/^\.([A-Z]+)LOGO$/);
        if (!m) continue;
        if (!SIGLAS[m[1]]) throw new Error(`${l.nm}: equipo desconocido`);
        // Hasta que empieza a moverse (frame 11), la punta de la barra asomaba 5 px en el borde
        // izquierdo: en la entrada y al final de la salida. Aparece cuando se mueve.
        if (barra) {
            if (!l.ks.p.a) throw new Error(`${l.nm}: sin animación`);
            l.ip = l.ks.p.k[0].t;
        }
        rename(d, l.nm, SIGLAS[m[1]] + '_opacidad');
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
