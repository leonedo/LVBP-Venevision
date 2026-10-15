// Prepara los exports del diseñador para CasparCG: la receta de "Cuando llega un export nuevo"
// de CLAUDE.md, ejecutable. Escrito sobre los exports del score (SCOREBUG, 2026-10-13) y de la
// defensiva (DEFENSIVA, 2026-10-15): si el diseñador cambia nombres de capas, falla diciendo cuál
// no encuentra (no adivina).
//
// Uso, desde la raíz del repo:
//   1. Descomprimir los zips del diseñador en una carpeta (EXPORTS): SCOREBUG/, DEFENSIVA/. Los que
//      no estén se saltean: alcanza con el zip que llegó.
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
// Las compuertas llegan abreviadas distinto que las barras. La de Águilas no vino en el export del
// 2026-10-15: llegó aparte, como PNG (ver abajo).
const AGUI_PUERTA = 'images/compuerta_aguilas.png';
const PUERTA = {
    AGUI: 'AGUI', AGUIL: 'AGUI', AGUILAS: 'AGUI', ANZ: 'ANZ', BRAV: 'BRAVOS', CARD: 'CARD', LEO: 'LEO',
    MAG: 'MAGA', TIB: 'TIBUS', TIG: 'TIGRES'
};
const OPACIDAD_PUERTA = 49;            // la del diseño: pasa al CSS de defensiva/index.html
const ENTRADA_DEF = 53;                // la entrada termina en el 52 (el título)
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
        const png = fs.readFileSync(aguiPng);
        const w = png.readUInt32BE(16), h = png.readUInt32BE(20); // IHDR
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

    // ---- el equipo: una clave prende su barra y las dos mitades del escudo de las compuertas.
    const lado = { [layer(d, 'puertaizq').ind]: 'izq', [layer(d, 'puertader').ind]: 'der' };
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
        // puerta va (MAG está al revés): el lado sale del parent.
        if (l.ks.o.a || l.ks.o.k !== OPACIDAD_PUERTA) throw new Error(`compuerta ${l.nm}: opacidad ${JSON.stringify(l.ks.o.k)}`);
        l.ks.o.k = 100;
        l.ln = `puerta${sig}${lado[l.parent]}`;
        vistos[l.ln] = 1;
        rename(d, l.nm, sig + '_opacidad');
    }
    const conPuerta = new Set(Object.keys(vistos).map(id => id.replace(/^puerta|izq$|der$/g, '')));
    for (const s of conPuerta) if (!vistos[`puerta${s}izq`] || !vistos[`puerta${s}der`]) throw new Error(`compuerta ${s}: falta una mitad`);
    for (const s of Object.values(SIGLAS)) {
        const n = d.layers.filter(l => l.nm === `.${s}_opacidad`).length;
        if (n !== (conPuerta.has(s) ? 3 : 1)) throw new Error(`${s}_opacidad: ${n} capas`);
        if (!conPuerta.has(s)) console.warn(`· DEFENSIVA: sin compuerta de ${s}: con ese equipo las compuertas salen lisas`);
    }
    // Las imágenes del fondo llegan con la clase "png" (la extensión del nombre) y nombres con
    // espacios y puntos, que el audit del editor marca como clases inválidas: nombres válidos,
    // como logomeridiano en Meridiano.
    rename(d, 'CAMPO.png', 'campo');
    rename(d, 'BASE DE COLOR.png', 'basecolor');
    rename(d, 'LOGO FINAL ATRAPA LA EMOCION_1 bisel.png', 'logoatrapa');
    rename(d, 'TEXTURA.png', 'textura');

    // ---- la puerta derecha llega con una máscara invertida. Lottie la invierte contra un
    // rectángulo del tamaño de la composición desde el (0, 0) de la capa, no contra todo: al
    // correrse la puerta, la parte de la máscara a la izquierda de ese (0, 0) aparece como una
    // franja azul que tapa el campo. Va la máscara complementaria, sin invertir: la misma
    // diagonal, cerrada por la derecha (el rectángulo de la puerta termina en el 957.6).
    const mk = layer(d, 'puertader').masksProperties;
    if (mk.length !== 1 || !mk[0].inv || mk[0].pt.a) throw new Error('puertader: máscara inesperada');
    const v = mk[0].pt.k.v;
    if (v.length !== 4 || v[1][0] !== -1016 || v[2][0] !== -1016) throw new Error('puertader: vértices inesperados');
    v[1][0] = v[2][0] = 1016;
    mk[0].inv = false;

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
