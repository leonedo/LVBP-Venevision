// Prepara los exports del diseñador para CasparCG: la receta de "Cuando llega un export nuevo"
// de CLAUDE.md, ejecutable. Escrito sobre los exports del score (SCOREBUG, 2026-10-13 y 22), de la
// defensiva y la ofensiva (DEFENSIVA, OFENSIVA, 2026-10-15), del bateador (LOWBAR BATEADOR,
// 2026-10-18), del parcial (FINAL DE INNING, 2026-10-18), del lanzador (PITCHERS, 2026-10-21), del
// 3 en línea (3 EN LINEA, 2026-10-22), de los otros juegos (OTROS JUEGOS, 2026-10-22), del prevenido
// (PREVENIDO AL BATE, 2026-10-23), de la tabla de posiciones (TABLA DE POSICIONES, 2026-10-22) y del
// score final (SCORE FINAL, 2026-10-29): si
// el diseñador cambia nombres de capas, falla diciendo cuál no encuentra (no adivina).
//
// Uso, desde la raíz del repo:
//   1. Descomprimir los zips del diseñador en una carpeta (EXPORTS): SCOREBUG/, DEFENSIVA/,
//      OFENSIVA/, LOWBAR BATEADOR/, FINAL DE INNING/, PITCHERS/, 3 EN LINEA/, OTROS JUEGOS/,
//      PREVENIDO AL BATE/, TABLA DE POSICIONES/, SCORE FINAL/. Los que no estén se saltean: alcanza con el zip que
//      llegó. El parcial sin publicidad no tiene export: sale del parcial preparado, y se arma siempre.
//   2. Las imágenes de cada export que llegó, a <gráfico>/images/ (se copian tal cual; consolidar.mjs
//      las pasa después a _assets/ y borra la carpeta). Si llegó el 3 EN LINEA: python3
//      herramientas/tresenlinea.py "$EXPORTS/3 EN LINEA" . (sus imágenes: el recorte y los frames de
//      la salida). Si llegó el PREVENIDO AL BATE: python3 herramientas/prevenido.py "$EXPORTS/PREVENIDO
//      AL BATE" . (el recorte de sus imágenes).
//   3. node herramientas/prep.js $EXPORTS .
//   4. node herramientas/consolidar.mjs (las imágenes, a _assets/).
//   5. git diff, herramientas/lint.py y QA con el runtime real (CLAUDE.md).
// Las fuentes y los index.html no los toca: se copian a mano la primera vez. Las imágenes que un
// gráfico toma de otro (la textura de las puertas, los escudos de las compuertas, la barra de Bravos,
// las barras del parcial sin publicidad) no se copian: su asset apunta a la de ese gráfico.
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
// Lo mismo en y.
function enPantallaY(d, l, y) {
    for (let c = l; c; c = c.parent ? d.layers.find(o => o.ind === c.parent) : null) {
        const { p, a, s, r } = c.ks;
        if ((r && (r.a || r.k)) || p.s) throw new Error(`${c.nm}: rotada o con posición separada`);
        y = ultimoValor(p)[1] + (y - ultimoValor(a)[1]) * ultimoValor(s)[1] / 100;
    }
    return y;
}
const escalaY = (d, l) => enPantallaY(d, l, 1) - enPantallaY(d, l, 0);
// Dónde empieza y dónde termina en pantalla un recuadro (eje 0, x; 1, y): una capa de forma con un
// rectángulo, sin rotaciones ni animación en el grupo (la de la capa, con su último valor).
function rectangulo(d, l, eje) {
    const g = l.shapes[0].it, rc = g.find(s => s.ty === 'rc'), tr = g.find(s => s.ty === 'tr');
    if (l.shapes.length !== 1 || rc.s.a || rc.p.a || tr.p.a || tr.a.a || tr.s.a || tr.r.k) throw new Error(`${l.nm}: transform inesperado`);
    const aPantalla = eje ? enPantallaY : enPantalla;
    return [-1, 1].map(lado => aPantalla(d, l, tr.p.k[eje] + (rc.p.k[eje] + lado * rc.s.k[eje] / 2 - tr.a.k[eje]) * tr.s.k[eje] / 100));
}
const rectanguloY = (d, l) => rectangulo(d, l, 1);
// Un recuadro que crece (o se achica) hacia arriba o hacia abajo, en px de pantalla.
function creceRectanguloY(d, l, arriba, abajo) {
    rectanguloY(d, l);
    const g = l.shapes[0].it, rc = g.find(s => s.ty === 'rc'), tr = g.find(s => s.ty === 'tr');
    const sy = escalaY(d, l) * tr.s.k[1] / 100;   // px de pantalla por unidad del rectángulo
    rc.s.k[1] += (arriba + abajo) / sy;
    rc.p.k[1] += (abajo - arriba) / 2 / sy;
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
// El inning, más grande (Leon, 2026-10-24, sin que pise nada): la capa va al 140 % y crece desde
// su ancla, que el diseño puso en el centro del 10, así que queda centrado entre las flechas. El 10
// pasa de 13 a 19 px de alto y queda a 2 px de cada flecha (entre las dos hay 23; al 150 %, a 1 px
// de la de arriba). A lo ancho sobra: 10 o 18 miden 23 px, en el negro de x 753 a la tercera base
// (x 821). Si el ancla llega en otro lugar, falla: medir de nuevo el centro del 10.
const INNING_ESCALA = 1.4;
const INNING_ANCLA = [-17.503, -15.02];
// Tahoma Bold en la barra negra de abajo (nombres y números), el conteo, OUTS y el inning (Leon,
// 2026-10-31, con una captura de cómo lo quiere); las siglas y las carreras siguen en LT Energy. El
// archivo va en score/font/ (Leon: aunque Windows la trae, mejor estar seguros). El ascent es la
// altura de la H (1489 de 2048), la medida que da el de LT Energy (73,7 contra una H de 730 de 1000).
const TAHOMA = { origin: 0, fPath: 'font/Tahoma-Bold.ttf', fClass: '', fFamily: 'Tahoma', fWeight: '', fStyle: 'Bold', fName: 'Tahoma-Bold', ascent: 72.71 };
// Lo que cada capa centra en vertical: mayúsculas (la H: LT Energy 0–0.73, Tahoma 0–0.727) o
// números (el 0: 0–0.664 y −0.015–0.742). Al cambiar la fuente o el cuerpo, el centro queda donde
// estaba (la caja de Lottie pone la línea base en ps[1] + ascent × cuerpo).
const CENTRO = { mayusculas: [0.365, 0.3635], numeros: [0.332, 0.3635] };
// [capa, qué centra, cuerpo nuevo (null: el mismo)]. La barra de abajo pasa de 21 a 18 (y de 22 a
// 18.86: la misma proporción), el tamaño de la captura de Leon: con la Tahoma, más ancha, al 21
// CHIRINOS no entraba (119 px). El inning, al cuerpo en que sus números miden lo mismo que en LT
// Energy (los de la Tahoma son un 14 % más altos y tocaban las flechas). El conteo y OUTS, igual.
const TAH_CAPAS = [
    ['.bateador', 'mayusculas', 18], ['.lanzador', 'mayusculas', 18], ['.mph', 'mayusculas', 18],
    ['.lanzamientos', 'numeros', 18], ['.velocidad', 'numeros', 18],
    ['.average', 'numeros', 18.86], ['.actuacion', 'numeros', 18.86],
    ['.inning', 'numeros', 8.77], ['.conteobolasystrikes', 'numeros', null], ['.outs', 'mayusculas', null]
];
// Las cajas de la barra de abajo, en px de pantalla (la barra negra va de x 219 a 754, con la
// división entre bateador y lanzador en la 487). Sin cambios: el bateador (250.7–336.5, entra
// CASTRO, 78) y el average (347.2–408.6). La actuación crece hacia la izquierda hasta que entra
// 10-4 (44.8). Del lado del lanzador, de derecha a izquierda: MPH (44.4) termina donde terminaba
// (745.6, 8.4 px antes del final); la velocidad, 5.6 px antes de MPH, con lugar para 100 (36.6); los
// lanzamientos, 8.4 px antes, para P.100 (55.1), y el lanzador, 8.4 px antes, desde 4 px después de
// la división: 94 px (CHIRINOS, 101.5, baja a 16: Lottie achica de a 1).
const TAH_ACTUACION = [431.3, 476.8];
const TAH_MPH_FIN = 745.6, TAH_MPH = 44.4;
const TAH_VELOCIDAD = 37.5, TAH_LANZAMIENTOS = 56, TAH_LANZADOR_DESDE = 491;
const TAH_AIRE = 8.4, TAH_AIRE_MPH = 5.6;
const TAH_INNING = 56;
function tahomaEnLaBarra(d) {
    if (d.fonts.list.length !== 1 || d.fonts.list[0].fName !== 'LTEnergy-Regular') throw new Error('score: fuentes inesperadas');
    const lt = d.fonts.list[0].ascent / 100, ta = TAHOMA.ascent / 100;
    d.fonts.list.push({ ...TAHOMA });
    for (const [nm, que, cuerpo] of TAH_CAPAS) {
        const s = doc(d, nm), [cl, ct] = CENTRO[que], s2 = cuerpo ?? s.s;
        if (s.f !== 'LTEnergy-Regular') throw new Error(`${nm}: fuente ${s.f}`);
        s.ps[1] = +(s.ps[1] + (lt - cl) * s.s - (ta - ct) * s2).toFixed(3);
        if (s.lh) s.lh = +(s.lh * s2 / s.s).toFixed(3);
        s.s = s2;
        s.f = TAHOMA.fName;
    }
    // Una caja [x0, x1] en px de pantalla, a unidades de su capa.
    const caja = (nm, x0, x1) => {
        const l = layer(d, nm), s = doc(d, nm), o = enPantalla(d, l, 0), u = enPantalla(d, l, 1) - o;
        s.ps[0] = +((x0 - o) / u).toFixed(3);
        s.sz[0] = +((x1 - x0) / u).toFixed(3);
    };
    caja('.actuacion', ...TAH_ACTUACION);
    const mph = layer(d, '.mph'), m = doc(d, '.mph');
    const desdeMph = TAH_MPH_FIN - TAH_MPH;
    m.ps[0] = +((desdeMph - enPantalla(d, mph, 0)) / (enPantalla(d, mph, 1) - enPantalla(d, mph, 0))).toFixed(3);
    const finVel = desdeMph - TAH_AIRE_MPH, finLzm = finVel - TAH_VELOCIDAD - TAH_AIRE, finLan = finLzm - TAH_LANZAMIENTOS - TAH_AIRE;
    caja('.velocidad', finVel - TAH_VELOCIDAD, finVel);
    caja('.lanzamientos', finLzm - TAH_LANZAMIENTOS, finLzm);
    caja('.lanzador', TAH_LANZADOR_DESDE, finLan);
    // FINAL en el inning: con la Tahoma, más ancha, no entraba en la caja (38 px) hasta un cuerpo en
    // que ya entraban dos líneas, y salía partido (FINA / L). La caja crece a TAH_INNING px, centrada
    // (del negro que va de x 753 a la tercera base, en la 821), y el interlineado va al triple del
    // cuerpo: Lottie achica hasta que entra en una línea, nunca parte.
    const inn = layer(d, '.inning'), si = doc(d, '.inning');
    anchoCentrado(si, +(TAH_INNING / escalaX(d, inn)).toFixed(3));
    si.lh = +(3 * si.s).toFixed(3);
}
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
    const inn = layer(d, '.inning'), ia = inn.ks.a, is = inn.ks.s;
    if (ia.a || is.a || ia.k[0] !== INNING_ANCLA[0] || ia.k[1] !== INNING_ANCLA[1] || is.k[0] !== is.k[1])
        throw new Error(`inning: ancla ${JSON.stringify(ia.k)} escala ${JSON.stringify(is.k)}: medir de nuevo INNING_ANCLA`);
    is.k = [+(is.k[0] * INNING_ESCALA).toFixed(4), +(is.k[1] * INNING_ESCALA).toFixed(4), is.k[2]];
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
    tahomaEnLaBarra(d);

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
// Una imagen que ya usa otro gráfico preparado: su mismo asset, con la ruta vista desde éste. Si ya
// está en _assets/ (../_assets/) es la misma ruta; si ese gráfico se preparó en esta corrida, todavía
// está en su images/, y consolidar.mjs la junta con la de él.
function imagenDe(grafico, a) {
    if (!a || !a.p) throw new Error(`${grafico}: imagen sin asset`);
    return { w: a.w, h: a.h, u: a.u.startsWith('../') ? a.u : `../${grafico}/${a.u}`, p: a.p, e: 0 };
}
const capaImagen = (d, l) => d.assets.find(a => a.id === l.refId);

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
const AGUI_PUERTA = 'image_compuerta_aguilas';
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

    // ---- la compuerta de Águilas llegó aparte (un PNG, 2026-10-15): su asset es el de la defensiva
    // preparada (defensiva/data.json, ya en _assets/). Si el export no la trae, se arma con las dos
    // capas de la de Caribes (casi del mismo tamaño): mismo lugar y escala, centrada en su imagen, y la
    // máscara corrida lo que se corre el centro, para que el corte entre las puertas caiga igual.
    const aguiAsset = load(path.join(REPO, 'defensiva/data.json')).assets.find(a => a.id === AGUI_PUERTA);
    if (!d.layers.some(l => /^\.COMPUERTAAGUI/.test(l.nm)) && aguiAsset) {
        const { w, h } = aguiAsset;
        d.assets.push(clone(aguiAsset));
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
    d.assets.push({ id: 'image_texturapuertas', ...imagenDe('ofensiva', capaImagen(of, of.layers.find(l => l.cl === 'texturapuertaizq'))) });
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
// blancos de la defensiva preparada (defensiva/data.json), con estos id.
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
    const def = load(path.join(REPO, 'defensiva/data.json'));
    let ind = Math.max(...d.layers.map(l => l.ind));
    for (const [sig, png] of Object.entries(OF_ESCUDOS)) {
        if (d.layers.some(l => { const m = l.nm.match(/^\.COMPUERTA([A-Z]+?)(?:IZQ|DER)$/); return m && PUERTA[m[1]] === sig; })) continue;
        const escudo = def.layers.find(l => l.ln === `puerta${sig}izq`);
        if (!escudo) continue;                 // equipoEnPuertas avisa
        const id = 'image_' + png.replace(/\.png$/, '');
        const { w, h } = d.assets[d.assets.push({ id, ...imagenDe('defensiva', capaImagen(def, escudo)) }) - 1];
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
// Más rápidas (Leon, 2026-10-31: duraban 2,9 y 3,7 s): el bateador y el lanzador se reproducen al
// 1/RAPIDO de la velocidad del diseño, con el fr del JSON. La coreografía y los frames de los markers
// quedan iguales; la entrada y la salida (su espejo) duran un RAPIDO de lo que duraban. Lottie
// interpola entre frames (subframe), así que en un canal a 29,97 sale igual de suave.
const RAPIDO = 0.6;
function rapido(d) {
    if (Math.abs(d.fr - 29.97) > 0.01) throw new Error(`fr ${d.fr}: el export ya no viene a 29,97`);
    d.fr = +(d.fr / RAPIDO).toFixed(4);
}
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
    rapido(d);
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
// La barra de Bravos no vino: es la del bateador preparado (bateador/data.json; la misma serie de
// barras), con las medidas de las otras, que escalan con el ancho de su imagen (el ancla y la máscara).
const LAN_BARRA_BRAVOS = 'bateador';
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
    const bat = load(path.join(REPO, LAN_BARRA_BRAVOS, 'data.json'));
    const barraBat = bat.layers.filter(l => l.cl === 'BRAVOS_opacidad' && l.ty === 2 && !l.tt);
    if (barraBat.length !== 1) throw new Error(`${LAN_BARRA_BRAVOS}: ${barraBat.length} barras de Bravos`);
    const barraBravos = imagenDe(LAN_BARRA_BRAVOS, capaImagen(bat, barraBat[0]));
    const [bw, bh] = [barraBravos.w, barraBravos.h];
    if (d.layers.some(l => (l.nm || '').trim() === '.BARRABRAVOS')) throw new Error('la barra de Bravos ya viene en el export: sacar LAN_BARRA_BRAVOS');
    if (refA.w !== 512 || refA.h !== bh) throw new Error('barras: medidas inesperadas');
    const k = bw / refA.w, bravos = clone(ref);
    bravos.nm = '.BARRABRAVOS';
    bravos.cl = 'BARRABRAVOS';
    bravos.ind = freeInd(d, Math.max(...d.layers.map(l => l.ind)) + 1);
    bravos.refId = 'image_barra_bravos';
    bravos.ks.a.k[0] = r2(ref.ks.a.k[0] * k);
    for (const v of bravos.masksProperties[0].pt.k.v) v[0] = r2(v[0] * k);
    d.assets.push({ id: bravos.refId, ...barraBravos });
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
    rapido(d);
    save(path.join(REPO, 'lanzador/data.json'), d);
}

// ---------------------------------------------------------------- parcial
// El score de fin de inning (el export es FINAL DE INNING): C H E de los dos equipos con su barra y
// su nombre, el inning con sus flechas, los tres que vienen al bate (posición y apellido) y el cuadro
// de la publicidad, que desde el export del 2026-10-31 es una imagen fija (antes, la animación de Pepsi
// del diseñador, una secuencia de PNG). Las claves, las del parcial de LVBP-Meridiano, que a su vez son las del score donde
// dicen lo mismo: los escudos (<SIGLAS>VISITA_opacidad, <SIGLAS>LOCAL_opacidad), inning, las flechas,
// CARRERAS/HITS/ERRORES VISITA y LOCAL, jugador1–3 y titulo_jugadores. Propias: posicion1–3 (como en la
// ofensiva), NOMBREVISITA / NOMBRELOCAL (el nombre escrito sobre la barra; en el score, EQUIPOVISITA
// son las siglas) y los rótulos fijos C, H, E.
// Cajas medidas en la pausa con la fuente cargada (todo cuelga de Nulo 23, al 102 %, salvo las
// posiciones, sin parent).
const PAR_INNING = 38;                 // 4 px antes de cada flecha (10 mide 26.7)
const PAR_NOMBRE = 203;                // 8 px adentro de la caja negra (221 px; AGUILAS mide 120.1)
const PAR_TITULO = 274;                // 8 px adentro de la columna de los bateadores (216 px)
// El apellido, alineado a la izquierda desde donde empieza en el diseño (x 1061.6), hasta 8 px antes
// del final de la columna (x 1215.2): la caja del export llegaba 40 px adentro del cuadro de Pepsi.
// TOVAR mide 83.5 y CASTILLO 115.9.
const PAR_JUGADOR = { ps: 32.8073883056641, W: 129.46 };
// Flujo (el export del 2026-10-31, con la publicidad fija): la pizarra entra del 0 al 41; la imagen de
// la publicidad entra deslizándose desde la izquierda, recortada por el cuadro (34–53), y la raya
// derecha del cuadro aparece del 51 al 59. La pausa, en el 59 (2 s), y la salida, la entrada al revés
// entera, como en los demás: lo que la entrada muestra en el frame t, la salida lo muestra en el
// PAR_FIN − t (2 s).
const PAR_PIZARRA = 41;                // la entrada de la pizarra termina en el 41 (el tercer bateador)
const PAR_ENTRADA = 59;                // la raya derecha termina en el 58,7: queda en el 59
const PAR_FIN = 2 * PAR_ENTRADA + 1;   // 119, vacío: la salida empieza en el 60 mostrando el 59
// La publicidad es una imagen con la clave `publicidad`, como en Meridiano (Leon, 2026-10-31: el
// cliente cambió la animación de Pepsi por Insert PEPSI.jpg, de 316 × 200, el tamaño del cuadro). El
// export trae el JPG recomprimido por Bodymovin: va el del cliente, en PNG, en _assets/.
const PEP_IMAGEN = { w: 316, h: 200, p: '9116da765ab4.png' };
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
    // La imagen de la publicidad empieza en la x 1221,4 y la raya gris de su izquierda (MARCO DE
    // PUBLICIDAD 3, encima) termina en la 1220,9: en el key quedaba la columna 1221 al 65 %. La raya
    // crece 1 px a la derecha, por encima de la imagen.
    ensancha('MARCO DE PUBLICIDAD 3', 0, 1);

    // ---- la publicidad: el JPG del export (Insert PEPSI.jpg, clase jpg), mateado por el cuadro
    // (Shape Layer 1, quieto), pasa a la clave `publicidad`. Una ruta de otra proporción entra entera
    // (meet); "" o una ruta que no carga dejan el cuadro vacío.
    const pub = rename(d, 'Insert PEPSI.jpg', 'publicidad');
    const mate = d.layers[d.layers.indexOf(pub) - 1];
    if (!pub.tt || !mate.td || mate.nm !== 'Shape Layer 1' || pub.parent != null) throw new Error('publicidad: matte o parent inesperado');
    const img = d.assets.find(a => a.id === pub.refId);
    if (img.w !== PEP_IMAGEN.w || img.h !== PEP_IMAGEN.h) throw new Error(`publicidad: ${img.w} × ${img.h}`);
    if (!fs.existsSync(path.join(REPO, '_assets', PEP_IMAGEN.p))) throw new Error(`falta _assets/${PEP_IMAGEN.p}`);
    Object.assign(img, { u: '../_assets/', p: PEP_IMAGEN.p, e: 0, pr: 'xMidYMid meet' });

    // ---- timeline. Los markers del diseñador (START 0–30, stop 120–150) no sirven, y la raya derecha
    // trae una salida suelta (273–282): sale, y todo suma su entrada al revés.
    const marcoDer = layer(d, 'MARCO DE PUBLICIDAD 4');
    for (const p of propiedadesAnimadas([marcoDer.ks, marcoDer.shapes])) p.k = p.k.filter(k => k.t <= PAR_ENTRADA);
    const ultimo = Math.max(...propiedadesAnimadas(d.layers).flatMap(p => p.k.map(k => k.t)));
    if (ultimo > PAR_ENTRADA || ultimo < PAR_ENTRADA - 1) throw new Error(`la entrada termina en el ${ultimo}: mover PAR_ENTRADA`);
    for (const l of d.layers) for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) alReves(p, 0, PAR_ENTRADA, PAR_ENTRADA + 1);
    for (const l of d.layers) {
        // los mattes, con la capa que matean
        const ref = l.td ? d.layers[d.layers.indexOf(l) + 1] : l;
        if (l.op < PAR_ENTRADA || ref.ip > PAR_ENTRADA) throw new Error(`${l.nm}: ip ${l.ip}, op ${l.op}`);
        l.op = PAR_FIN - Math.max(ref.ip, 1) + 0.001;
    }
    for (const l of d.layers) l.ip = Math.max(l.ip, 1);
    d.op = PAR_FIN + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: PAR_ENTRADA + 1, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: PAR_ENTRADA + 1, cm: 'salida', dr: PAR_FIN - PAR_ENTRADA }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergyVFVF.ttf';
    allCaps(d);
    save(path.join(REPO, 'parcial/data.json'), d);
}

// ---------------------------------------------------------------- parcial sin publicidad
// El parcial sin el cuadro de Pepsi, como gráfico aparte (Leon, 2026-10-23): el controlador elige el
// template y le manda la misma data. No tiene export: sale del parcial ya preparado, así que corre
// siempre (también sin exports en SRC) y los dos no se separan. Sin el cuadro (la publicidad y su matte), sin sus
// dos rayas grises (MARCO DE PUBLICIDAD 3, la de la izquierda, que entra con la pizarra, y 4) y
// centrado en la pantalla. La entrada es la de la pizarra, que termina en el 41, y la salida, la
// misma que en el parcial después del cuadro: la entrada de la pizarra al revés, que pasa del 78 al
// 42 (1,4 s).
const PSP_PAUSA = PAR_PIZARRA + 1;     // play 0–42: queda en el 41, con la pizarra completa
const PSP_SALE = PAR_FIN - PAR_PIZARRA; // 78: en el parcial, la pizarra empieza a salir
const PSP_ADELANTA = PSP_SALE - PSP_PAUSA; // la salida de la pizarra, 36 frames antes
// Sin las rayas, la pizarra ocupa x 311–1215 (bbox del render en el 41): corrida 196 px, x 507–1411,
// queda centrada. Un px entero: el render es el del parcial, corrido.
const PSP_CORRE = 196;
const PSP_NULO = [894.231, 755.192];   // dónde llega Nulo 23: si cambia, medir de nuevo PSP_CORRE
const PSP_RAYAS = ['MARCO DE PUBLICIDAD 3', 'MARCO DE PUBLICIDAD 4'];
if (fs.existsSync(path.join(REPO, 'parcial/data.json'))) {
    const d = load(path.join(REPO, 'parcial/data.json'));
    const m = Object.fromEntries(d.markers.map(x => [x.cm, x]));
    if (m.play.dr !== PAR_ENTRADA + 1 || m.salida.tm !== PAR_ENTRADA + 1 || d.op !== PAR_FIN + 1) throw new Error('parcial: timeline inesperada');
    d.nm = 'FINAL DE INNING SIN PUBLICIDAD VV';

    // ---- el cuadro de la publicidad (la imagen y su matte) y sus rayas
    const pub = layer(d, '.publicidad'), mate = d.layers[d.layers.indexOf(pub) - 1];
    if (!mate.td) throw new Error('parcial sin publicidad: la publicidad sin su matte');
    const fuera = [mate, pub, ...PSP_RAYAS.map(nm => layer(d, nm))];
    if (d.layers.some(l => fuera.some(f => f.ind === l.parent)) || PSP_RAYAS.some(nm => layer(d, nm).td || layer(d, nm).tt)) throw new Error('parcial sin publicidad: el cuadro de Pepsi es parent o matte');
    d.layers = d.layers.filter(l => !fuera.includes(l));
    const usadas = new Set(d.layers.map(l => l.refId).filter(Boolean));
    d.assets = d.assets.filter(a => usadas.has(a.id));
    if (d.assets.length !== usadas.size || d.assets.some(a => a.layers)) throw new Error('parcial sin publicidad: assets inesperados');

    // ---- la columna de los bateadores crecía 1 px a la derecha, por debajo de la raya del cuadro de
    // Pepsi (el key del parcial): sin la raya, ése es el borde de afuera y vuelve a su ancho
    const nulo = layer(d, 'Nulo 23'), col = layer(d, 'Capa de formas 4'), g = col.shapes[0].it;
    const rc = g.find(s => s.ty === 'rc'), tr = g.find(s => s.ty === 'tr');
    const sx = new Set(col.ks.s.a ? col.ks.s.k.map(k => k.s[0]) : [col.ks.s.k[0]]);
    if (sx.size !== 1 || rc.s.a || rc.p.a || tr.s.a || col.parent !== nulo.ind || nulo.ks.s.a) throw new Error('Capa de formas 4: transform inesperado');
    const px = [...sx][0] / 100 * tr.s.k[0] / 100 * nulo.ks.s.k[0] / 100; // px de pantalla por unidad
    rc.s.k[0] -= 1 / px;
    rc.p.k[0] -= 0.5 / px;

    // ---- centrada: todo lo que no cuelga de nada (Nulo 23, las posiciones y las barras de la visita)
    if (nulo.ks.p.a || nulo.ks.p.k[0] !== PSP_NULO[0] || nulo.ks.p.k[1] !== PSP_NULO[1]) throw new Error(`Nulo 23: p ${JSON.stringify(nulo.ks.p.k)}: medir de nuevo PSP_CORRE`);
    for (const l of d.layers.filter(l => l.parent == null)) {
        const p = l.ks.p;
        if (p.a || p.s) throw new Error(`${l.nm}: posición animada o separada`);
        p.k = [p.k[0] + PSP_CORRE, ...p.k.slice(1)];
    }

    // ---- timeline: la salida de la pizarra (desde el 78) pasa a empezar en la pausa
    for (const p of propiedadesAnimadas(d.layers)) for (const k of p.k) {
        if (k.t > PAR_PIZARRA + 0.5 && k.t < PSP_SALE - 0.5) throw new Error(`keyframe en el ${k.t}, entre la entrada y la salida de la pizarra`);
        if (k.t >= PSP_SALE - 0.5) k.t -= PSP_ADELANTA;
    }
    for (const l of d.layers) {
        if (l.op < PSP_SALE) throw new Error(`${l.nm}: op ${l.op}, termina antes de la salida`);
        l.op -= PSP_ADELANTA;
    }
    d.op -= PSP_ADELANTA;
    d.markers = [
        { tm: 0, cm: 'play', dr: PSP_PAUSA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: PSP_PAUSA, cm: 'salida', dr: d.op - PSP_PAUSA }
    ];

    // ---- las imágenes (las barras), las del parcial; la fuente, una copia de la suya
    const dst = path.join(REPO, 'parcialsinpublicidad');
    d.assets = d.assets.map(a => ({ id: a.id, ...imagenDe('parcial', a) }));
    for (const f of d.fonts.list) {
        fs.mkdirSync(path.join(dst, path.dirname(f.fPath)), { recursive: true });
        fs.copyFileSync(path.join(REPO, 'parcial', f.fPath), path.join(dst, f.fPath));
    }
    save(path.join(dst, 'data.json'), d);
}

// ---------------------------------------------------------------- 3 en línea
// Los tres que vienen al bate, con el panel de Empire Keeway (el export es 3 EN LINEA): abajo a la
// derecha entra el panel con sus logos y se va, y queda la caja, la banda naranja con el 3 EN LÍNEA
// y el recuadro azul con los tres nombres. Todo es una secuencia de PNG (un precomp de 198 frames,
// 3NLSEQ, y una imagen fija para la pausa); lo único editable son los nombres, que aparecen letra por
// letra (un animador de opacidad, uno detrás del otro, del 40 al 60). Las claves, las de los
// bateadores del parcial (jugador1–3), para que el controlador les mande a los dos la misma data.
// Las imágenes las prepara antes herramientas/tresenlinea.py: las recorta a TEL_RECORTE y arma los
// frames de la salida (images/salida_<k>.png).
const TEL_RECORTE = [1441, 555, 479, 525]; // x, y, ancho y alto en pantalla (RECORTE de tresenlinea.py)
// Los nombres, desde donde empiezan en el diseño (x 1467.9) hasta 8 px antes de la columna naranja
// (x 1726: la caja del export entraba 3 px en ella). Renglones cada 45 px: llegaban cada 46 y 44
// (márgenes de 11 y 14 px en el recuadro azul, y 807–951); el del medio queda donde estaba, y el de
// arriba y el de abajo bajan 1 px (márgenes de 12 y 13).
const TEL_HASTA = 1718;
const TEL_RENGLON = 45;
// Flujo: el panel entra (4–17), la caja crece debajo (16–43 de la secuencia: la columna naranja, la
// banda, el título y el recuadro azul), los nombres aparecen (40–60), el panel pasa sus logos con un
// brillo y se va por la derecha (177–193), y la entrada para en la imagen fija (196; los últimos
// frames de la secuencia son iguales a ella). El export no trae salida (su stop, 210–240, no anima
// nada), y la entrada al revés no sirve: dura 6,5 s y traería de vuelta el panel. La salida es la
// entrada de la caja y los nombres al revés, sin el panel (Leon, 2026-10-22): lo que la entrada
// muestra en el instante t, la salida lo muestra en el TEL_FIN − t, del 197 (el 60, los nombres
// completos) al 241 (el 16, vacío); 1,5 s. El frame k de la secuencia se ve de k a k + 1 (con unos
// decimales de más en el ip de cada capa), así que en la salida va de TEL_FIN − k − 1 a TEL_FIN − k.
const TEL_PAUSA = 197;                 // play 0–197: queda en el 196, la imagen fija
const TEL_CAJA = [16, 44];             // la caja crece del 16 al 43 de la secuencia: salida_16–43
const TEL_NOMBRES = 60;                // el último nombre termina de aparecer en el 60
const TEL_FIN = TEL_PAUSA + TEL_NOMBRES;
if (hay('3 EN LINEA')) {
    const d = load(path.join(SRC, '3 EN LINEA/data.json'));
    const seq = layer(d, '3NLSEQ'), fija = layer(d, '3NLSEQ_00223.png');
    const secuencia = d.assets.find(a => a.id === seq.refId);
    if (!secuencia || secuencia.layers.length !== 198 || seq.st !== 0 || fija.ip !== seq.op) throw new Error('3NLSEQ: secuencia inesperada');

    // ---- el recorte: cada imagen, del tamaño del archivo recortado y en su lugar de la pantalla
    const [rx, ry, rw, rh] = TEL_RECORTE;
    const medidas = p => {
        const [w, h] = medidasPng(path.join(REPO, 'tresenlinea/images', p));
        if (w !== rw || h !== rh) throw new Error(`${p}: ${w} × ${h}: correr antes herramientas/tresenlinea.py`);
    };
    for (const a of d.assets) {
        if (!a.p) continue;
        if (a.u !== 'images/' || a.w !== 1920 || a.h !== 1080) throw new Error(`${a.p}: ${a.w} × ${a.h} en ${a.u}`);
        medidas(a.p);
        a.w = rw;
        a.h = rh;
    }
    for (const l of [...d.layers, ...secuencia.layers]) {
        if (l.ty !== 2) continue;
        const { a, p } = l.ks;
        if (a.a || p.a || a.k[0] !== 960 || a.k[1] !== 540 || p.k[0] !== 960 || p.k[1] !== 540) throw new Error(`${l.nm}: transform inesperado`);
        a.k = [0, 0, 0];
        p.k = [rx, ry, 0];
    }
    delete fija.cl;                    // la clase png: no es una clave

    // ---- los nombres
    const medio = layer(d, '.JUGADOR2').ks.p.k[1];
    for (let n = 1; n <= 3; n++) {
        const l = layer(d, '.JUGADOR' + n), s = doc(d, '.JUGADOR' + n);
        if (s.j !== 0 || l.parent || l.ks.p.a) throw new Error(`JUGADOR${n}: j ${s.j}, parent ${l.parent}`);
        s.sz[0] = +((TEL_HASTA - enPantalla(d, l, s.ps[0])) / escalaX(d, l)).toFixed(2);
        // el alto, como en el bateador: entra una línea al cuerpo del diseño y no dos hasta un 40 %
        s.sz[1] = +(d.fonts.list[0].ascent * s.s / 100 + 2).toFixed(2);
        const y = medio + (n - 2) * TEL_RENGLON;
        if (Math.abs(l.ks.p.k[1] - y) > 1.01) throw new Error(`JUGADOR${n}: y ${l.ks.p.k[1]}: medir de nuevo los renglones`);
        l.ks.p.k[1] = y;
        rename(d, '.JUGADOR' + n, 'jugador' + n);
    }

    // ---- la salida: los nombres desaparecen como aparecieron, al revés (el último, primero), y
    // después la caja se cierra con sus propios frames al revés
    const vacio = TEL_FIN - TEL_CAJA[0];   // 241, el primer frame vacío
    for (let n = 1; n <= 3; n++) {
        const l = layer(d, '.jugador' + n), props = propiedadesAnimadas([l.ks, l.t]);
        const ks = props.length === 1 && props[0].k;
        if (!ks || ks[0].t < TEL_CAJA[0] || ks[ks.length - 1].t > TEL_NOMBRES + 0.5) throw new Error(`jugador${n}: animación inesperada: medir de nuevo TEL_NOMBRES`);
        const hasta = ks[ks.length - 1].t;
        alReves(props[0], ks[0].t, hasta, TEL_FIN - hasta);
        l.op = vacio;
    }
    if (propiedadesAnimadas([d.layers.filter(l => l.ty !== 5), secuencia.layers]).length) throw new Error('animación fuera de los nombres');
    fija.op = TEL_FIN - TEL_CAJA[1];   // hasta el 212: la caja completa
    let ind = Math.max(...d.layers.map(l => l.ind));
    const cierre = [];
    for (let k = TEL_CAJA[1] - 1; k >= TEL_CAJA[0]; k--) {
        const id = 'salida_' + k, p = id + '.png';
        medidas(p);
        d.assets.push({ id, w: rw, h: rh, u: 'images/', p, e: 0 });
        cierre.push(Object.assign(clone(fija), { ind: ++ind, nm: p, refId: id, ip: TEL_FIN - k - 1, op: TEL_FIN - k, st: TEL_FIN - k - 1 }));
    }
    d.layers.splice(d.layers.indexOf(fija) + 1, 0, ...cierre);

    // ---- timeline: los markers del diseñador (start 0–30, stop 210–240) no sirven
    for (const l of d.layers) l.ip = Math.max(l.ip, 1);
    d.op = vacio + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: TEL_PAUSA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: TEL_PAUSA, cm: 'salida', dr: vacio + 1 - TEL_PAUSA }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    vaciaTextos(d);
    save(path.join(REPO, 'tresenlinea/data.json'), d);
}

// ---------------------------------------------------------------- otros juegos
// Cómo van los otros juegos de la jornada (el export es OTROS JUEGOS): una columna abajo a la
// derecha, con el cuadro de Harina PAN arriba (una secuencia de JPG: un precomp de 138 frames de
// 316 × 200), el título ASÍ VAN y tres resultados, cada uno con la sede, las barras de visita y local
// (imágenes apiladas con su máscara, como en el score) con el nombre del equipo, las carreras y el
// inning con sus flechas. Las claves, las del score y el parcial donde dicen lo mismo, con el número
// del juego al final (1 arriba, 3 abajo): <SIGLAS>VISITA1_opacidad, NOMBREVISITA1, CARRERASVISITA1,
// inning1, INNINGarriba1_opacidad… Propias: sede1–3 (EN CARACAS) y titulo (ASÍ VAN).
// Cajas medidas en el frame 140 con las fuentes cargadas.
const OJ_CUADRO = 1596.6;              // empieza el cuadro negro de las carreras: ahí termina lo que se ve de la barra
const OJ_MARGEN = 5;                   // el nombre, desde donde empieza (x 1509.1) hasta 5 px antes del cuadro negro
// La sede, centrada sobre el eje del texto del diseño (x 1579.5), 8 px adentro de la banda azul
// (x 1415.7–1732.1). EN PUERTO LA CRUZ mide 144.
const OJ_SEDE = 289;
// El inning, centrado sobre el eje del 10 del diseño (x 1702.4), 4 px antes del borde del cuadro negro
// (x 1732). El título, 8 px adentro de la caja azul (316 px; ASÍ VAN mide 190 en pantalla).
const OJ_INNING = 51;
const OJ_TITULO = 300;
const OJ_LW = { '10': 25.026562499999997, 'EN CARACAS': 90.79874999999998 };
// Flujo de cada tramo, desde su comienzo: el cuadro de PAN entra por la derecha (11–23), abre sus
// puertas y arma el logo; debajo entra la columna (27–95: la raya gris, el ASÍ VAN y los tres juegos,
// uno detrás del otro) y el cuadro se va por la derecha (157–164). La entrada para en el 165, el primer
// frame sin el cuadro. El export no trae
// salida (su STOP, 167–197, no anima nada): es la entrada de la columna al revés, sin el cuadro, como
// en el 3 en línea (2,3 s). Una capa que entraba en el frame t se va en el OJ_PAUSA + OJ_ENTRADA − t.
const OJ_ENTRADA = 95;                 // la entrada de la columna termina en el 95 (las flechas y las carreras del juego 3)
const OJ_PAUSA = 166;                  // el stage de cada tramo, 0–166 desde su comienzo: queda en el 165
// Días con menos juegos (Leon, 2026-10-22): la timeline trae tres tramos, cada uno un gráfico entero
// (entrada, pausa y salida) con los juegos de arriba: 3 juegos desde el 100 (stage tresjuegos), 2
// desde el 400 (dosjuegos) y 1 desde el 700 (unjuego). Con menos juegos, la columna baja hasta
// terminar donde termina la de tres (111 y 223 px), y su último juego termina como el 3 (las barras
// locales, 1.25 px antes que el cuadro negro: en el de tres, la banda de abajo las tapa). La salida de
// cada tramo es su entrada al revés: el último juego primero.
// El tramo siempre lo elige el controlador (Leon, 2026-10-22): play pone el gráfico al aire en el
// frame 0, vacío, y queda ahí hasta un goto('tresjuegos'), goto('dosjuegos') o goto('unjuego'). Así un
// goto que llega tarde sólo atrasa la entrada; si play arrancara un tramo, un goto tardío mostraría
// unos frames del que no es. goto sin play no sirve: no pone el gráfico al aire (no pausa, y webcg
// descarta el CG STOP).
const OJ_TRAMO = { 3: 100, 2: 400, 1: 700 };
const OJ_STAGE = { 3: 'tresjuegos', 2: 'dosjuegos', 1: 'unjuego' };
const OJ_SALIDA = { 3: 'salida', 2: 'salida2', 1: 'salida1' };
// La secuencia viene en JPG y cada frame se comprime distinto: con el logo quieto, sus bordes
// titilaban un poco (hasta 30 niveles en unos 25 px de un frame al otro). Desde el frame 78 de la
// secuencia (al aire, el 93.5) el logo no se mueve hasta que el cuadro se va: queda ese JPG solo,
// como el tramo quieto del parcial. Con una secuencia sin compresión, null.
const OJ_QUIETO = 78;
// Key: los recuadros se tocan borde con borde, y en el key de CasparCG quedaban filas y columnas de
// 1 px al 54–94 %: entre el título y la primera banda, entre cada banda y su juego, entre el cuadro
// negro y la banda de abajo, entre la barra y el cuadro negro, y entre la visita y la local. Ahí las
// barras no alcanzan: los PNG traen la primera y la última fila (y columna) semitransparentes, y la
// visita y la local se tocan con esas filas. Debajo de las barras de cada juego va un fondo negro
// (OJ_FONDO, en px de pantalla: desde adentro del borde izquierdo de las barras, por debajo de la
// banda de arriba, del cuadro negro y de la banda de abajo), que se ve sólo por esos bordes; las barras
// son oscuras arriba y el cuadro es negro. Aparece cuando terminan de entrar las barras y el cuadro
// del juego. La primera banda crece 1 px hacia arriba, por debajo del título, y cada cuadro negro 1 px
// hacia arriba y hacia abajo (el del juego 3, sólo hacia arriba), por debajo de las bandas.
const OJ_FONDO = [[1417, 666, 1597.6, 756.5], [1417, 778, 1597.6, 867.5], [1417, 889, 1597.6, 977]];
// Los textos entran letra por letra con un Fast Box Blur (radio 4 → 0, 3 iteraciones), que Lottie no
// pinta: pasa a un Gaussian Blur, que sí. El box blur de radio r con n pasadas es un gaussiano de
// sigma √(n·r·(r+1)/3), y Lottie pinta el Gaussian Blur con sigma = 0,3 × el Blurriness.
const OJ_BLUR = (r, n) => Math.sqrt(n * r * (r + 1) / 3) / 0.3;
// Un tramo: el gráfico con los primeros `juegos` juegos (de arriba abajo), preparado como si fuera
// solo, desde el frame 0, con su entrada, su pausa y su salida.
function otrosJuegos(juegos) {
    const d = load(path.join(SRC, 'OTROS JUEGOS/data.json'));
    const pan = layer(d, 'PANSECUENCE');
    const secuencia = d.assets.find(a => a.id === pan.refId);
    if (!secuencia || secuencia.layers.length !== 138 || pan.st !== 0) throw new Error('PANSECUENCE: secuencia inesperada');

    // ---- de qué juego es cada capa. Las barras y los nombres del 2 y del 3 cuelgan de dos nulos que se
    // llaman igual (Null 1); las barras del 1, de nada.
    const nulos = {};
    for (let n = 1; n <= 3; n++) {
        const p = layer(d, '.EQUIPOVISITANTE' + n).parent;
        const nulo = d.layers.find(l => l.ind === p);
        if (n > 1 && (!nulo || nulo.nm !== 'Null 1')) throw new Error(`EQUIPOVISITANTE${n}: parent ${p}`);
        if (n > 1) nulos[p] = n;
    }
    const juego = l => l.parent == null ? 1 : nulos[l.parent] || (() => { throw new Error(`${l.nm}: ¿de qué juego?`); })();

    // ---- las barras: las 8 de cada fila, una encima de otra, todas visibles al arrancar, como en el
    // score. La fila de arriba es la visita. La de Leones visita del juego 1 llega como una segunda
    // BARRALEONESLOCAL, con la imagen de la local: pasa a la de la visita (la de los juegos 2 y 3).
    const barras = d.layers.filter(l => l.ty === 2 && /^\.BARRA[A-Z]+(LOCAL|VISITA)$/.test(l.nm));
    const filas = {};
    for (const l of barras) {
        if (l.ks.p.a) throw new Error(`${l.nm}: posición animada`);
        (filas[juego(l)] = filas[juego(l)] || new Set()).add(l.ks.p.k[1]);
    }
    const corregidas = [];
    for (const l of barras) {
        const n = juego(l), ys = [...filas[n]].sort((a, b) => a - b);
        if (ys.length !== 2) throw new Error(`juego ${n}: ${ys.length} filas de barras`);
        const [, equipo, rotulo] = l.nm.match(/^\.BARRA([A-Z]+?)(LOCAL|VISITA)$/);
        if (!SIGLAS[equipo]) throw new Error(`equipo desconocido ${equipo}`);
        const lado = l.ks.p.k[1] === ys[0] ? 'VISITA' : 'LOCAL';
        if (lado !== rotulo) corregidas.push({ l, quien: equipo + rotulo + n });
        l.nm = `.${SIGLAS[equipo]}${lado}${n}_opacidad`;
        l.cl = l.nm.slice(1);
    }
    if (corregidas.map(c => c.quien).join() !== 'LEONESLOCAL1') throw new Error(`barras con el lado cambiado: ${corregidas.map(c => c.quien).join() || 'ninguna'} (se esperaba la de Leones visita del juego 1)`);
    const leoVisita = layer(d, '.LEOVISITA2_opacidad').refId;
    if (leoVisita === layer(d, '.LEOLOCAL1_opacidad').refId) throw new Error('Leones visita: la misma imagen que la local');
    corregidas[0].l.refId = leoVisita;
    for (let n = 1; n <= 3; n++) for (const s of Object.values(SIGLAS)) for (const lado of ['VISITA', 'LOCAL']) layer(d, `.${s}${lado}${n}_opacidad`);

    // ---- textos
    const fuente = f => d.fonts.list.find(x => x.fName === f) || (() => { throw new Error(`fuente ${f}`); })();
    for (let n = 1; n <= 3; n++) {
        const espacio = n === 1 ? '' : ' ' + n;   // el inning y las flechas del 1 no llevan número
        rename(d, '.SEDE' + n, 'sede' + n);
        rename(d, '.EQUIPOVISITANTE' + n, 'NOMBREVISITA' + n);
        rename(d, '.EQUIPOLOCAL' + n, 'NOMBRELOCAL' + n);
        rename(d, 'CARRERAVISITA' + n, 'CARRERASVISITA' + n);   // llega sin el punto: sin clase
        rename(d, '.CARRERALOCAL' + n, 'CARRERASLOCAL' + n);
        rename(d, '.INNINGS' + espacio, 'inning' + n);
        // ▲ y ▼: las dos llegan con la clase PARTE (con espacio en el nombre), y en los tres juegos
        const alta = layer(d, '.PARTE ALTA' + espacio), baja = layer(d, '.PARTE BAJA' + espacio);
        if (alta.parent !== baja.parent || alta.ks.p.k[1] >= baja.ks.p.k[1]) throw new Error(`flechas del juego ${n}: ¿cuál es la de arriba?`);
        rename(d, '.PARTE ALTA' + espacio, `INNINGarriba${n}_opacidad`);
        rename(d, '.PARTE BAJA' + espacio, `INNINGabajo${n}_opacidad`);

        // la sede: de la izquierda a centrada sobre su eje, con el ancho de la banda
        const sede = doc(d, '.sede' + n), lSede = layer(d, '.sede' + n);
        if (sede.t !== 'EN CARACAS') throw new Error(`sede${n}: "${sede.t}": medir de nuevo OJ_LW`);
        centrar(sede, OJ_LW['EN CARACAS']);
        anchoCentrado(sede, OJ_SEDE / escalaX(d, lSede));
        // los nombres, desde donde empiezan hasta antes del cuadro negro: más largos pasaban por debajo
        for (const lado of ['VISITA', 'LOCAL']) {
            const l = layer(d, `.NOMBRE${lado}${n}`), s = doc(d, `.NOMBRE${lado}${n}`);
            if (s.j !== 0) throw new Error(`NOMBRE${lado}${n}: j ${s.j}`);
            s.sz[0] = +((OJ_CUADRO - OJ_MARGEN - enPantalla(d, l, s.ps[0])) / escalaX(d, l)).toFixed(2);
        }
        // el inning: de la izquierda a centrado sobre su eje
        const inning = doc(d, '.inning' + n);
        if (inning.t !== '10') throw new Error(`inning${n}: "${inning.t}": medir de nuevo OJ_LW`);
        centrar(inning, OJ_LW['10']);
        anchoCentrado(inning, OJ_INNING / escalaX(d, layer(d, '.inning' + n)));
    }
    rename(d, '.ASÍ VAN', 'titulo');
    anchoCentrado(doc(d, '.titulo'), OJ_TITULO / escalaX(d, layer(d, '.titulo')));
    // Las cajas vienen de AE con lh 0.01 (la sede y los nombres): lh a 1.2 del cuerpo. El alto, como en
    // el bateador: entra una línea al cuerpo del diseño (su ascent, más 2) y no dos hasta un 40 % del
    // cuerpo, para que un texto largo encoja en vez de partir en dos líneas chicas.
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        if (!k.s.sz) throw new Error(`${l.nm}: no es de caja`);
        k.s.lh = 1.2 * k.s.s;
        k.s.sz[1] = +(fuente(k.s.f).ascent * k.s.s / 100 + 2).toFixed(2);
    }

    // ---- el Fast Box Blur de los textos, a Gaussian Blur
    for (const l of d.layers) {
        l.ef = (l.ef || []).map(e => {
            if (e.mn !== 'ADBE Box Blur2') return e;
            const [radio, pasadas, dimensiones] = e.ef;
            if (pasadas.v.k !== 3 || dimensiones.v.k !== 1 || !radio.v.a) throw new Error(`${l.nm}: Fast Box Blur inesperado`);
            const v = clone(radio.v);
            const max = Math.max(...v.k.map(k => k.s[0]));
            for (const k of v.k) k.s = [+(k.s[0] * OJ_BLUR(max, pasadas.v.k) / max).toFixed(3)];
            return {
                ty: 29, nm: 'Gaussian Blur', np: 5, mn: 'ADBE Gaussian Blur 2', ix: e.ix, en: 1, ef: [
                    { ty: 0, nm: 'Blurriness', mn: 'ADBE Gaussian Blur 2-0001', ix: 1, v },
                    { ty: 7, nm: 'Blur Dimensions', mn: 'ADBE Gaussian Blur 2-0002', ix: 2, v: { a: 0, k: 1, ix: 2 } },
                    { ty: 7, nm: 'Repeat Edge Pixels', mn: 'ADBE Gaussian Blur 2-0003', ix: 3, v: { a: 0, k: 0, ix: 3 } }
                ]
            };
        });
        if (!l.ef.length) delete l.ef;
    }

    // ---- geometría en px de pantalla (en y), al final de la entrada (rectY, creceY)
    const rectY = l => rectanguloY(d, l);
    const creceY = (l, arriba, abajo) => creceRectanguloY(d, l, arriba, abajo);
    const espacio = n => n === 1 ? '' : ' ' + n;
    const cuadro = n => layer(d, 'CUADRO SCORE' + espacio(n));
    const fondos = [1, 2, 3].map(n => rectY(cuadro(n))[1]);      // donde termina cada cuadro negro
    const localesDe = n => d.layers.filter(l => l.ty === 2 && new RegExp(`^\\.[A-Z]+LOCAL${n}_opacidad$`).test(l.nm)).map(l => d.layers[d.layers.indexOf(l) - 1]);
    // Las barras locales del juego 3 terminan 1.25 px antes que su cuadro negro (el borde de abajo de
    // la columna); las del 1 y el 2 siguen por debajo de la banda del juego de abajo.
    const bajos3 = localesDe(3).map(m => rectY(m)[1]);
    if (Math.max(...bajos3) - Math.min(...bajos3) > 0.01) throw new Error('juego 3: las barras locales no terminan todas a la misma altura');
    const corte = fondos[2] - bajos3[0];

    // ---- con menos juegos: fuera los de abajo, y el último termina como el juego 3
    if (juegos < 3) {
        const raices = new Set();
        for (let n = juegos + 1; n <= 3; n++) {
            raices.add(layer(d, 'RESULTADO ' + n));
            raices.add(d.layers.find(l => l.ind === +Object.keys(nulos).find(k => nulos[k] === n)));
            for (const k of ['.sede', '.inning', '.CARRERASVISITA', '.CARRERASLOCAL']) raices.add(layer(d, k + n));
        }
        const desciende = l => {
            for (let c = l; c; c = d.layers.find(o => o.ind === c.parent)) if (raices.has(c)) return true;
            return false;
        };
        const fuera = new Set(d.layers.filter(desciende));
        d.layers.forEach((l, i) => { if (l.td && fuera.has(d.layers[i + 1])) fuera.add(l); });   // sus mattes
        d.layers = d.layers.filter(l => !fuera.has(l));
        for (const l of d.layers) {
            const m = (l.cl || '').match(/(\d)(_opacidad)?$/);
            if ((m && +m[1] > juegos) || (l.parent != null && !d.layers.some(o => o.ind === l.parent))) throw new Error(`${l.nm}: quedó del juego ${m && m[1]}`);
        }
        for (const m of localesDe(juegos)) {
            creceY(m, 0, fondos[juegos - 1] - corte - rectY(m)[1]);
            if (Math.abs(rectY(m)[1] - (fondos[juegos - 1] - corte)) > 0.01) throw new Error(`${m.nm}: no quedó a la altura del cuadro`);
        }
    }

    // ---- key: el fondo negro de las barras de cada juego, debajo de la última, y los recuadros que
    // crecen 1 px por debajo de las bandas
    const ultimoFrame = ls => Math.ceil(Math.max(...propiedadesAnimadas(ls.map(l => l.ks)).flatMap(p => p.k.map(k => k.t))));
    let ind = Math.max(...d.layers.map(l => l.ind));
    for (let n = 1; n <= juegos; n++) {
        const suyas = d.layers.filter(l => l.ty === 2 && /^\.[A-Z]+(VISITA|LOCAL)\d_opacidad$/.test(l.nm) && l.nm.endsWith(n + '_opacidad'));
        const mattes = suyas.map(l => d.layers[d.layers.indexOf(l) - 1]);
        if (suyas.length !== 16 || mattes.some(m => !m.td)) throw new Error(`juego ${n}: barras o mattes inesperados`);
        // el del último juego, hasta donde terminan sus barras (el borde de abajo de la columna)
        const [x0, y0, x1] = OJ_FONDO[n - 1], y1 = n < juegos ? OJ_FONDO[n - 1][3] : Math.floor(fondos[n - 1] - corte);
        if (n === 3 && y1 !== OJ_FONDO[2][3]) throw new Error(`fondo del juego 3: ${y1}`);
        const fondo = {
            ddd: 0, ind: ++ind, ty: 4, nm: 'fondo barras ' + n, sr: 1, ao: 0, bm: 0,
            ks: {
                o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [(x0 + x1) / 2, (y0 + y1) / 2, 0] },
                a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }
            },
            shapes: [{
                ty: 'gr', nm: 'fondo', it: [
                    { ty: 'rc', d: 1, s: { a: 0, k: [x1 - x0, y1 - y0] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 } },
                    { ty: 'fl', c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
                    { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }
                ]
            }],
            // cuando ya entraron las barras (sus mattes) y el cuadro negro
            ip: ultimoFrame([...mattes, cuadro(n)]), op: d.layers[0].op, st: 0
        };
        const ultima = Math.max(...suyas.map(l => d.layers.indexOf(l)));
        d.layers.splice(ultima + 1, 0, fondo);
    }
    if (layer(d, 'Capa de formas 7').parent !== layer(d, 'RESULTADO 1').ind) throw new Error('Capa de formas 7: ¿es la banda del juego 1?');
    creceY(layer(d, 'Capa de formas 7'), 1, 0);   // la banda del juego 1, por debajo del título
    // los cuadros negros, por debajo de la banda de su juego y de la del juego de abajo (el último, sólo
    // hacia arriba: abajo es el borde de la columna)
    for (let n = 1; n <= juegos; n++) creceY(cuadro(n), 1, n < juegos ? 1 : 0);

    // ---- con menos juegos, la columna baja hasta terminar donde termina la de tres
    if (juegos < 3) {
        const dy = fondos[2] - fondos[juegos - 1];
        if (Math.abs(dy - Math.round(dy)) > 0.01) throw new Error(`la columna bajaría ${dy} px: no es un número entero`);
        for (const l of d.layers) {
            if (l.parent != null) continue;
            const p = l.ks.p;
            if (p.s) throw new Error(`${l.nm}: posición separada`);
            if (p.a) for (const k of p.k) { k.s[1] += Math.round(dy); if (k.e) k.e[1] += Math.round(dy); }
            else p.k[1] += Math.round(dy);
        }
    }

    // ---- el tramo quieto del cuadro de PAN: la capa del frame OJ_QUIETO dura hasta el final de la
    // secuencia, y las de después se van, con sus imágenes (los JPG quedan en la carpeta)
    const capas = secuencia.layers;
    capas.forEach((c, k) => { if (c.nm !== `PAN_${String(k).padStart(5, '0')}.png`) throw new Error(`PANSECUENCE: capa ${k} ${c.nm}`); });
    if (OJ_QUIETO) {
        const fuera = capas.slice(OJ_QUIETO + 1);
        capas[OJ_QUIETO].op = capas[capas.length - 1].op;
        secuencia.layers = capas.slice(0, OJ_QUIETO + 1);
        const usadas = new Set(secuencia.layers.map(c => c.refId));
        d.assets = d.assets.filter(a => usadas.has(a.id) || !fuera.some(c => c.refId === a.id));
    }

    // ---- timeline: la salida es la entrada de la columna al revés, sin el cuadro de PAN, que para la
    // pausa ya se fue
    if (pan.op >= OJ_PAUSA) throw new Error(`PANSECUENCE: termina en el ${pan.op}, después de la pausa`);
    const columna = d.layers.filter(l => l !== pan);
    const tiempos = propiedadesAnimadas(columna.map(l => [l.ks, l.shapes, l.t, l.masksProperties, l.ef])).flatMap(p => p.k.map(k => k.t));
    const entrada = Math.round(Math.max(...tiempos));   // la del último juego
    if (juegos === 3 && Math.max(...tiempos) > OJ_ENTRADA + 0.5) throw new Error(`la columna anima hasta el ${Math.max(...tiempos)}: medir de nuevo OJ_ENTRADA`);
    const FIN = OJ_PAUSA + entrada;
    const vacio = Math.ceil(FIN - Math.min(...tiempos));   // el primer frame vacío: la raya gris sin ancho
    for (const l of columna) {
        for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) alReves(p, 0, entrada, OJ_PAUSA);
    }
    for (const l of columna) {
        const ref = l.td ? d.layers[d.layers.indexOf(l) + 1] : l;   // los mattes, con la capa que matean
        if (l.op < OJ_PAUSA || ref.ip > entrada) throw new Error(`${l.nm}: ip ${l.ip}, op ${l.op}`);
        l.op = Math.min(FIN - Math.max(ref.ip, 1) + 0.001, vacio + 1);
    }
    for (const l of d.layers) l.ip = Math.max(l.ip, 1);
    d.op = vacio + 1;
    d.markers = [
        { tm: 0, cm: OJ_STAGE[juegos], dr: OJ_PAUSA, payload: { name: OJ_STAGE[juegos], type: 'pause', order: 5 - juegos, stop: OJ_SALIDA[juegos] } },
        { tm: OJ_PAUSA, cm: OJ_SALIDA[juegos], dr: vacio + 1 - OJ_PAUSA }
    ];
    return d;
}
if (hay('OTROS JUEGOS')) {
    // Los tres tramos en una timeline, copias de sus capas (las mismas claves: un UPDATE llena los
    // tres), corridos a OJ_TRAMO. Antes, en el frame 0, vacío, la espera: play pausa ahí.
    const tramos = [3, 2, 1].map(juegos => [juegos, otrosJuegos(juegos)]);
    const d = tramos[0][1];   // las fuentes, las imágenes y el precomp, del tramo de tres
    const capas = [];
    const marcas = [
        { tm: 0, cm: 'play', dr: 0, payload: { name: 'play', type: 'pause', order: 1 } },
        { tm: 0, cm: 'stop', dr: 1 }
    ];
    let ind = 0, fin = 1;
    for (const [juegos, v] of tramos) {
        const S = OJ_TRAMO[juegos];
        if (S < fin) throw new Error(`el tramo de ${juegos} empezaría en el ${S}, antes del final del anterior (${fin})`);
        if (v.assets.length !== d.assets.length) throw new Error('los tramos no usan las mismas imágenes');
        const mapa = {};
        for (const l of v.layers) mapa[l.ind] = ++ind;
        for (const l of v.layers) {
            l.ind = mapa[l.ind];
            if (l.parent != null) l.parent = mapa[l.parent];
            if (l.tp != null) l.tp = mapa[l.tp];
            l.ip += S; l.op += S; l.st += S;
            if (l.ty === 5 && l.t.d.k.length !== 1) throw new Error(`${l.nm}: texto animado`);
            for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) for (const k of p.k) k.t += S;
        }
        capas.push(...v.layers);
        for (const m of v.markers) marcas.push(Object.assign(m, { tm: m.tm + S }));
        fin = v.op + S;
    }
    d.layers = capas;
    d.markers = marcas;
    d.op = fin;
    const archivos = { 'LTEnergy-Regular': 'font/LTEnergy-Regular.ttf', 'ChakraPetch-Bold': 'font/ChakraPetch-Bold.ttf' };
    for (const f of d.fonts.list) {
        if (!archivos[f.fName]) throw new Error(`fuente ${f.fName}`);
        f.fPath = archivos[f.fName];
    }
    allCaps(d);
    // Los textos arrancan vacíos, como en el bateador, salvo el título: si no llega, queda ASÍ VAN.
    for (const l of d.layers) if (l.ty === 5 && l.cl && l.cl !== 'titulo') for (const k of l.t.d.k) k.s.t = '';
    save(path.join(REPO, 'otrosjuegos/data.json'), d);
}

// ---------------------------------------------------------------- prevenido
// El bateador en el círculo (el export es PREVENIDO AL BATE): abajo a la derecha, un panel de LMV (una
// secuencia de PNG: un precomp de 170 frames) gira, muestra su logo con un brillo y se va por la
// derecha; debajo entran una barra negra con el título PREVENIDO AL BATE y el recuadro azul con el
// nombre, que aparece letra por letra (un animador de opacidad). Las claves, las del prevenido de
// LVBP-Meridiano: jugador (el nombre) y titulo, para que el controlador les mande a los dos la misma
// data. Las imágenes las recorta antes herramientas/prevenido.py (PRE_RECORTE).
const PRE_RECORTE = [1441, 547, 479, 533]; // x, y, ancho y alto en pantalla (RECORTE de prevenido.py)
const PRE_MARGEN = 8;                  // el nombre y el título, 8 px adentro de su recuadro (centrados donde estaban)
// Flujo: el panel entra girando (3–20), la barra crece a lo ancho (23–32), el título entra por la
// derecha (31–39), el recuadro azul crece hacia abajo (33–45) y aparece el nombre (36–48); el panel
// se va por la derecha (151–168) y la entrada para en el 169, sin él. El export no trae salida (su
// STOP, 180–210, no anima nada), y la entrada al revés traería de vuelta el panel: es la entrada de la
// barra, el título, el recuadro y el nombre al revés, sin el panel, como en el 3 en línea. Los ip de
// la secuencia traen unos decimales de más: en el frame entero k se ve su frame k − 1.
const PRE_PAUSA = 170;                 // play 0–170: queda en el 169, el primer frame sin el panel
const PRE_ENTRADA = 48;                // la entrada de la caja termina en el 48 (el nombre)
// Los PNG de la secuencia vienen reducidos a una paleta con tramado, y cada frame se trama distinto:
// con el logo quieto, el panel hervía. En los frames 112–150 de la secuencia (al aire, del 113 al 151,
// antes de que se vaya) el logo no se mueve (medido con desenfoque contra el 136: lo que cambia es el
// tramado; del 125 al 150 el export ya trae casi siempre la misma imagen), y se ve un solo PNG, el
// primero, como en el parcial. Con PNG de color completo, null.
const PRE_QUIETO = [112, 151];
if (hay('PREVENIDO AL BATE')) {
    const d = load(path.join(SRC, 'PREVENIDO AL BATE/data.json'));
    const panel = layer(d, 'lmv logo');
    const secuencia = d.assets.find(a => a.id === panel.refId);
    if (!secuencia || secuencia.layers.length !== 170 || panel.st !== 0) throw new Error('lmv logo: secuencia inesperada');

    // ---- el recorte, como en el 3 en línea
    const [rx, ry, rw, rh] = PRE_RECORTE;
    for (const a of d.assets) {
        if (!a.p) continue;
        if (a.u !== 'images/' || a.w !== 1920 || a.h !== 1080) throw new Error(`${a.p}: ${a.w} × ${a.h} en ${a.u}`);
        const [w, h] = medidasPng(path.join(REPO, 'prevenido/images', a.p));
        if (w !== rw || h !== rh) throw new Error(`${a.p}: ${w} × ${h}: correr antes herramientas/prevenido.py`);
        a.w = rw;
        a.h = rh;
    }
    for (const l of secuencia.layers) {
        const { a, p } = l.ks;
        if (l.ty !== 2 || a.a || p.a || a.k[0] !== 960 || a.k[1] !== 540 || p.k[0] !== 960 || p.k[1] !== 540) throw new Error(`${l.nm}: transform inesperado`);
        a.k = [0, 0, 0];
        p.k = [rx, ry, 0];
    }

    // ---- el tramo quieto: la capa del primer frame dura hasta el final; las otras se van, con sus imágenes
    if (PRE_QUIETO) {
        const capa = k => secuencia.layers.find(c => c.ip <= k + 0.5 && k + 0.5 < c.op);
        const [k0, k1] = PRE_QUIETO;
        const primera = capa(k0), fuera = new Set();
        for (let k = k0 + 1; k < k1; k++) fuera.add(capa(k));
        primera.op = capa(k1 - 1).op;
        secuencia.layers = secuencia.layers.filter(c => !fuera.has(c));
        const usadas = new Set(secuencia.layers.map(c => c.refId));
        d.assets = d.assets.filter(a => usadas.has(a.id) || ![...fuera].some(c => c.refId === a.id));
    }

    // ---- los textos: centrados donde los puso el diseño, hasta PRE_MARGEN antes del borde más cercano
    // de su recuadro (el título, de la barra negra; el nombre, del recuadro azul); el alto, el ascent
    // del cuerpo más 2, como en el bateador
    const barra = layer(d, 'Capa de formas 1'), caja = layer(d, 'Capa de formas 2');
    for (const [nm, recuadro, clave] of [['PREVENIDO AL BATE', barra, 'titulo'], ['.PREVENIDO', caja, 'jugador']]) {
        const l = layer(d, nm), s = doc(d, nm);
        const [x0, x1] = rectangulo(d, recuadro, 0);
        const centro = enPantalla(d, l, s.ps[0] + s.sz[0] / 2);
        anchoCentrado(s, (2 * Math.min(centro - x0, x1 - centro) - 2 * PRE_MARGEN) / escalaX(d, l));
        s.sz[1] = +(d.fonts.list[0].ascent * s.s / 100 + 2).toFixed(2);
        rename(d, nm, clave);
    }

    // ---- key: el último renglón del panel (y 755) llega al 60 % y la barra negra lo cubre apenas
    // (empieza en la 755.9): mientras está el panel quedaba una línea de video al aire. La barra crece
    // 1 px hacia arriba, por debajo del panel. Y la barra y el recuadro azul se tocan borde con borde
    // (809.6 y 809.5): el recuadro crece 1 px hacia arriba, por debajo de la barra.
    creceRectanguloY(d, barra, 1, 0);
    creceRectanguloY(d, caja, 1, 0);

    // ---- timeline: los markers del diseñador (START 0–30, STOP 180–210) no sirven. La salida es la
    // entrada de la caja al revés desde la pausa: una capa que entraba en el frame t se va en el
    // FIN − t, del 170 (el nombre completo) al 195 (la barra sin ancho, vacío); 0,9 s.
    const FIN = PRE_PAUSA + PRE_ENTRADA;
    const resto = d.layers.filter(l => l !== panel);
    const tiempos = [];
    for (const l of resto) for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) {
        tiempos.push(p.k[0].t);
        alReves(p, 0, PRE_ENTRADA, PRE_PAUSA);
    }
    const vacio = Math.ceil(FIN - Math.min(...tiempos));
    for (const l of resto) {
        // los mattes, con la capa que matean; un ip con decimales (el del título, 31.0000012) se ve
        // desde el frame siguiente
        const ref = l.td ? d.layers[d.layers.indexOf(l) + 1] : l;
        l.op = Math.min(FIN - Math.ceil(Math.max(ref.ip, 1)) + 0.001, vacio + 1);
    }
    if (Math.round(panel.op) > PRE_PAUSA) throw new Error(`lmv logo: termina en el ${panel.op}, después de la pausa`);
    for (const l of d.layers) l.ip = Math.max(l.ip, 1);
    d.op = vacio + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: PRE_PAUSA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: PRE_PAUSA, cm: 'salida', dr: vacio + 1 - PRE_PAUSA }
    ];
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    // Los textos arrancan vacíos, como en el bateador, salvo el título: si no llega, queda PREVENIDO AL BATE.
    for (const l of d.layers) if (l.ty === 5 && l.cl && l.cl !== 'titulo') for (const k of l.t.d.k) k.s.t = '';
    save(path.join(REPO, 'prevenido/data.json'), d);
}

// ---------------------------------------------------------------- posiciones
// La tabla de posiciones (el export es TABLA DE POSICIONES), a pantalla completa. El fondo, el título
// POSICIONES, los rótulos de las columnas, el recuadro magenta de los números y el cuadro de GoGo
// Royal son una secuencia de JPG (un precomp de 150 frames de 1920 × 1080, opaca desde el primero);
// encima, 8 filas, cada una con la barra del equipo (una imagen con su escudo de marca de agua), el
// nombre en una caja negra y JJ, JG, JP, AVE y DIF. Las claves, las de la tabla de IVC en LVBP-Stats
// (Leon, 2026-10-24), para que el controlador arme las dos igual: equipo<n>, JJequipo<n>,
// JGequipo<n>, JPequipo<n>, AVEequipo<n> y DIFequipo<n>, del 1 (arriba) al 8. La barra de cada fila,
// como en el score: las 8 apiladas, <SIGLAS><n>_opacidad (IVC manda la ruta de un logo).
// Flujo: del 0 al 11, el gris quieto; el fondo entra del 12 al 64, las barras bajan del 29 al 44, las
// cajas negras crecen del 38 al 49, los nombres aparecen letra por letra del 41 al 66 y los números
// del 60 al 70, mientras suben (60–75). El export no trae salida (su stop, 120–150, no anima nada): es
// la entrada al revés (Leon, 2026-10-24), que termina en el gris y corta al video, como entra.
const POS_PAUSA = 76;                  // play 0–76: queda en el 75
const POS_ENTRADA = 75;                // la entrada termina en el 75 (los números)
const POS_MARGEN = 8;                  // las cajas de los textos, 8 px antes de su caja negra o de la columna vecina
const POS_FONDO = 1425;                // el borde derecho del recuadro magenta (de la secuencia): el tope de DIF
// Las columnas, de izquierda a derecha: el nm de sus capas (.<columna>EQUIPO<n>) y su clave.
const POS_COLUMNAS = [['JJ', 'JJequipo'], ['JG', 'JGequipo'], ['JP', 'JPequipo'], ['AV', 'AVEequipo'], ['DIF', 'DIFequipo']];
if (hay('TABLA DE POSICIONES')) {
    const d = load(path.join(SRC, 'TABLA DE POSICIONES/data.json'));
    const FIN = POS_PAUSA + POS_ENTRADA;   // lo que la entrada muestra en el frame t, la salida lo muestra en el FIN − t
    const vacio = FIN;                     // el espejo del frame 0, vacío
    const filas = [1, 2, 3, 4, 5, 6, 7, 8];
    if (d.layers.some(l => l.td || l.tt)) throw new Error('posiciones: mattes inesperados');

    // ---- el nombre de la fila 8 llega colgado del Nulo 22 (el de los números) y no de nada, como los
    // otros siete: entraba 19 px más abajo, colgando de su caja negra, y subía con los números (60–75).
    // Queda donde termina, sin parent.
    const nulo = layer(d, 'Nulo 22'), eq8 = layer(d, '.EQUIPO8');
    if (eq8.parent !== nulo.ind || ['p', 's', 'r'].some(k => eq8.ks[k].a) || eq8.ks.r.k || nulo.ks.s.a || nulo.ks.r.k)
        throw new Error('.EQUIPO8: no cuelga del Nulo 22 como en el export del 2026-10-22');
    const [ex, ey] = eq8.ks.p.k;
    eq8.ks.p.k = [+enPantalla(d, nulo, ex).toFixed(3), +enPantallaY(d, nulo, ey).toFixed(3), 0];
    eq8.ks.s.k = [0, 1, 2].map(i => i < 2 ? eq8.ks.s.k[i] * nulo.ks.s.k[i] / 100 : eq8.ks.s.k[i]);
    delete eq8.parent;

    // ---- los números: cada columna llega con un x y cada fila con un y, salvo algunos corridos a ojo
    // (hasta 2,5 unidades, 3 px: el JJ de la fila 4): van todos al de la mayoría.
    const moda = xs => { const n = new Map(); for (const x of xs) n.set(x, (n.get(x) || 0) + 1); return [...n].sort((a, b) => b[1] - a[1])[0][0]; };
    const celda = (col, n) => layer(d, `.${col}EQUIPO${n}`);
    for (const [col] of POS_COLUMNAS) {
        const x = moda(filas.map(n => celda(col, n).ks.p.k[0]));
        for (const n of filas) celda(col, n).ks.p.k[0] = x;
    }
    for (const n of filas) {
        const y = moda(POS_COLUMNAS.map(([col]) => celda(col, n).ks.p.k[1]));
        for (const [col] of POS_COLUMNAS) celda(col, n).ks.p.k[1] = y;
    }

    // ---- textos de caja (textos-de-caja.md), medidos con la entrada terminada. Los nombres, centrados
    // donde estaban, hasta POS_MARGEN antes del borde más cercano de su caja negra (en el export, la
    // caja pasaba 11 px de cada lado). Los números, centrados en su columna, hasta POS_MARGEN antes de la
    // columna vecina (repartido: 8 px entre dos cajas), de la caja negra (JJ) o del final del recuadro
    // magenta (DIF). El alto, el ascent del cuerpo más 2, como en el bateador; lh, 1.2 del cuerpo (llega
    // en 0.01).
    const ascent = d.fonts.list[0].ascent / 100;
    const cajas = {};
    for (const l of d.layers) {
        const m = (l.nm || '').trim().match(/^BARRA EQUIPO (\d)\D+LUGAR$/);
        if (m) cajas[m[1]] = l;
    }
    for (const n of filas) {
        const l = layer(d, `.EQUIPO${n}`), s = doc(d, `.EQUIPO${n}`), caja = cajas[n];
        if (!caja) throw new Error(`sin la caja negra de la fila ${n}`);
        const [x0, x1] = rectangulo(d, caja, 0), [y0, y1] = rectanguloY(d, caja);
        const centro = enPantalla(d, l, s.ps[0] + s.sz[0] / 2), medio = enPantallaY(d, l, s.ps[1] + s.sz[1] / 2);
        if (!(x0 < centro && centro < x1 && y0 < medio && medio < y1)) throw new Error(`.EQUIPO${n}: fuera de la caja negra de su fila`);
        anchoCentrado(s, (2 * Math.min(centro - x0, x1 - centro) - 2 * POS_MARGEN) / escalaX(d, l));
    }
    const centros = POS_COLUMNAS.map(([col]) => { const l = celda(col, 1), s = doc(d, l.nm); return enPantalla(d, l, s.ps[0] + s.sz[0] / 2); });
    const finCaja = rectangulo(d, cajas[1], 0)[1];
    POS_COLUMNAS.forEach(([col], i) => {
        const izq = i ? (centros[i] - centros[i - 1] - POS_MARGEN) / 2 : centros[i] - finCaja - POS_MARGEN;
        const der = i < centros.length - 1 ? (centros[i + 1] - centros[i] - POS_MARGEN) / 2 : POS_FONDO - centros[i] - POS_MARGEN;
        for (const n of filas) anchoCentrado(doc(d, `.${col}EQUIPO${n}`), 2 * Math.min(izq, der) / escalaX(d, celda(col, n)));
    });
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        k.s.sz[1] = +(ascent * k.s.s + 2).toFixed(2);
        k.s.lh = 1.2 * k.s.s;
    }
    for (const n of filas) {
        rename(d, `.EQUIPO${n}`, `equipo${n}`);
        for (const [col, clave] of POS_COLUMNAS) rename(d, `.${col}EQUIPO${n}`, clave + n);
    }

    // ---- las barras: la de cada equipo llega en una fila (Águilas arriba … Tigres abajo). En cada fila
    // van las 8 apiladas, con la del diseño arriba: el controlador manda 1 a la que va y 0 a las otras
    // siete, como en el score. Cada barra conserva su x y su ancla (las imágenes miden de 400 a 405 px
    // de ancho, y el diseñador las alineó una por una) y toma la y de la fila. Las filas, en el orden de
    // capas del diseño.
    const barras = d.layers.filter(l => /^\.BARRA[A-Z]+$/.test(l.nm));
    if (barras.length !== 8 || barras.some(b => !SIGLAS[b.cl.slice(5)] || b.ks.p.a)) throw new Error(`barras: ${barras.map(b => b.nm)}`);
    let ind = Math.max(...d.layers.map(l => l.ind));
    [...barras].sort((a, b) => a.ks.p.k[1] - b.ks.p.k[1]).forEach((fila, i) => {
        const n = i + 1;
        const nuevas = [fila, ...barras.filter(b => b !== fila)].map(b => {
            const c = clone(b), clave = `${SIGLAS[b.cl.slice(5)]}${n}_opacidad`;
            Object.assign(c, { ind: ++ind, nm: '.' + clave, cl: clave });
            c.ks.p.k = [b.ks.p.k[0], fila.ks.p.k[1], b.ks.p.k[2]];
            return c;
        });
        d.layers.splice(d.layers.indexOf(fila), 1, ...nuevas);
    });

    // ---- la salida: todo menos el fondo, su entrada al revés desde la pausa (una capa que entraba en el
    // frame t se va en el FIN − t)
    const base = layer(d, 'BASE TABLA DE POSICIONES');
    for (const l of d.layers) {
        if (l === base) continue;
        for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) alReves(p, 0, POS_ENTRADA, POS_PAUSA);
        l.op = Math.min(FIN - Math.ceil(Math.max(l.ip, 1)) + 0.001, vacio + 1);
    }

    // ---- el fondo. Los JPG iguales (los frames 0–8 y 65–149 son cada uno el mismo archivo: 93 de 150)
    // quedan en una sola capa, y las otras salen con sus imágenes. La salida son los mismos tramos al
    // revés: en el frame entero k se ve la imagen k − 1 (los ip traen unos decimales de más, como en el 3
    // en línea), así que la imagen k va en la salida de FIN − k − 1 a FIN − k.
    const secuencia = d.assets.find(a => a.id === base.refId);
    if (!secuencia || secuencia.layers.length !== 150 || base.ip !== 0 || base.st !== 0) throw new Error('BASE TABLA DE POSICIONES: secuencia inesperada');
    const jpg = c => { const a = capaImagen(d, c); return fs.readFileSync(path.join(SRC, 'TABLA DE POSICIONES', a.u, a.p)); };
    const tramos = [];
    for (const c of [...secuencia.layers].sort((a, b) => a.ip - b.ip)) {
        const t = tramos[tramos.length - 1], buf = jpg(c);
        if (t && Math.abs(c.ip - t.capa.op) > 0.01) throw new Error(`${c.nm}: la secuencia tiene un hueco`);
        if (t && buf.equals(t.buf)) t.capa.op = c.op;
        else tramos.push({ capa: c, buf });
    }
    const quedan = new Set(tramos.map(t => t.capa));
    const fuera = new Set(secuencia.layers.filter(c => !quedan.has(c)).map(c => c.refId));
    secuencia.layers = secuencia.layers.filter(c => quedan.has(c));
    d.assets = d.assets.filter(a => !fuera.has(a.id));
    let indSeq = Math.max(...secuencia.layers.map(c => c.ind));
    for (const { capa } of tramos) {
        const [a, b] = [Math.round(capa.ip), Math.round(capa.op)];
        capa.op = Math.min(capa.op, POS_PAUSA);
        const ip = Math.max(FIN - b, POS_PAUSA), op = FIN - a;
        if (ip < op) secuencia.layers.push(Object.assign(clone(capa), { ind: ++indSeq, ip, op, st: ip }));
    }
    base.op = vacio;

    // ---- timeline: el frame 0 queda vacío (todas las capas desde el 1), como en los otros gráficos
    for (const l of d.layers) l.ip = Math.max(l.ip, 1);
    d.op = vacio + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: POS_PAUSA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: POS_PAUSA, cm: 'salida', dr: vacio + 1 - POS_PAUSA }
    ];
    if (d.fonts.list.length !== 1 || d.fonts.list[0].fName !== 'LTEnergy-Regular') throw new Error('posiciones: fuentes inesperadas');
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    vaciaTextos(d);
    save(path.join(REPO, 'posiciones/data.json'), d);
}

// ---------------------------------------------------------------- score final
// El line score (el export es SCORE FINAL; la carpeta, scorefinal): abajo, de x 302 a 1634, las barras
// de visita y local con el nombre, las carreras de los 9 innings, C H E y el logo de ATRAPA LA EMOCIÓN.
// Las claves, las del final de LVBP-Meridiano donde dicen lo mismo (las barras <SIGLAS>VISITA/LOCAL,
// CARRERAS, HITS y ERRORES, INNINGVISITA1–9 / INNINGLOCAL1–9 y ultimoinning, el rótulo de la columna 9),
// y las del parcial de este repo para el nombre escrito sobre la barra (NOMBREVISITA / NOMBRELOCAL) y
// los rótulos fijos (rotulocarreras…), para que el controlador les mande la misma data.
// Flujo: la entrada termina en el 58 (la raya plateada de la derecha). El export no trae salida (su
// STOP, 90–119, no anima nada): es la entrada al revés, como en los demás.
const SF_PAUSA = 59;                   // play 0–59: queda en el 58
const SF_ENTRADA = 58;                 // la entrada termina en el 58
const SF_MARGEN = 8;                   // las cajas, 8 px antes de la columna vecina o del borde de su caja negra
if (hay('SCORE FINAL')) {
    const d = load(path.join(SRC, 'SCORE FINAL/data.json'));
    const FIN = SF_PAUSA + SF_ENTRADA;     // lo que la entrada muestra en el frame t, la salida lo muestra en el FIN − t
    const vacio = FIN;
    const columnas = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    if (d.layers.some(l => l.td || l.tt || l.ty === 0)) throw new Error('scorefinal: mattes o precomps inesperados');
    const moda = xs => { const n = new Map(); for (const x of xs) n.set(x, (n.get(x) || 0) + 1); return [...n].sort((a, b) => b[1] - a[1])[0][0]; };

    // ---- las carreras de cada inning: llegan en columnas con el mismo x en las dos filas, pero algunas
    // corridas en y a ojo (la de la local del 9, 2 px más abajo; las de la visita del 1 al 4, 0,6 px):
    // cada fila, al y de la mayoría. El rótulo del 1, 1 px más arriba que los otros ocho: lo mismo.
    for (const fila of ['ALTA', 'BAJA']) {
        const celdas = columnas.map(n => layer(d, `.CARRERAS POR INNING ${fila}${n}`));
        if (celdas.some(l => l.ks.p.a)) throw new Error(`carreras ${fila}: posición animada`);
        const y = moda(celdas.map(l => l.ks.p.k[1]));
        for (const l of celdas) l.ks.p.k[1] = y;
    }
    const rotulos = columnas.map(n => layer(d, `.INNING${n}`));
    const yFinal = l => { const k = l.ks.p.k; if (!l.ks.p.a || k.length !== 2) throw new Error(`${l.nm}: posición inesperada`); return k[1].s[1]; };
    const yRotulo = moda(rotulos.map(yFinal));
    for (const l of rotulos) { const dy = yRotulo - yFinal(l); for (const k of l.ks.p.k) k.s[1] += dy; }

    // ---- textos de caja (textos-de-caja.md), medidos con la entrada terminada. Llegan de caja, centrados
    // (los nombres, a la izquierda), con lh 0.01: va 1.2 del cuerpo, y el alto, el ascent del cuerpo más
    // 2, como en los otros gráficos (si no, un texto largo partía en dos líneas encimadas en vez de
    // encoger). Los anchos: las carreras de los innings y sus rótulos, la menor distancia entre dos
    // columnas menos SF_MARGEN (todos iguales: entran dos cifras al cuerpo del diseño); C H E, lo mismo
    // entre sus columnas; los nombres, desde donde empiezan hasta SF_MARGEN antes del final de su caja
    // negra (la del export terminaba a 4 px).
    const ascent = d.fonts.list[0].ascent / 100;
    const centro = nm => { const l = layer(d, nm), s = doc(d, nm); return enPantalla(d, l, s.ps[0] + s.sz[0] / 2); };
    const anchoMinimo = nms => {
        const xs = nms.map(centro);
        return Math.min(...xs.slice(1).map((x, i) => x - xs[i])) - SF_MARGEN;
    };
    const wInning = anchoMinimo(columnas.map(n => `.CARRERAS POR INNING ALTA${n}`));
    for (const fila of ['ALTA', 'BAJA']) for (const n of columnas) {
        const nm = `.CARRERAS POR INNING ${fila}${n}`;
        anchoCentrado(doc(d, nm), wInning / escalaX(d, layer(d, nm)));
    }
    for (const n of columnas) anchoCentrado(doc(d, `.INNING${n}`), wInning / escalaX(d, rotulos[n - 1]));
    const che = ['CARRERAS', 'HITS', 'ERRORES'];
    const wChe = anchoMinimo(che.map(c => `.${c}VISITA`));
    for (const c of che) for (const lado of ['VISITA', 'LOCAL']) anchoCentrado(doc(d, `.${c}${lado}`), wChe / escalaX(d, layer(d, `.${c}${lado}`)));
    const cajaNombre = { ',NOMBRE EQUIPO VISITANTE': 'Capa de formas 21', '.NOMBRE EQUIPO LOCAL': 'Capa de formas 22' };
    for (const [nm, caja] of Object.entries(cajaNombre)) {
        const l = layer(d, nm), s = doc(d, nm), [x0, x1] = rectangulo(d, layer(d, caja), 0);
        const desde = enPantalla(d, l, s.ps[0]);
        if (s.j !== 0 || !(x0 < desde && desde < x1)) throw new Error(`${nm}: fuera de su caja negra`);
        s.sz[0] = (x1 - SF_MARGEN - desde) / escalaX(d, l);
    }
    for (const l of d.layers) if (l.ty === 5) for (const k of l.t.d.k) {
        k.s.sz[1] = +(ascent * k.s.s + 2).toFixed(2);
        k.s.lh = 1.2 * k.s.s;
        k.s.t = k.s.t.trim();          // el 9 llega con un espacio al final, que Lottie no cuenta al centrar
    }

    // ---- clases
    rename(d, ',NOMBRE EQUIPO VISITANTE', 'NOMBREVISITA');
    rename(d, '.NOMBRE EQUIPO LOCAL', 'NOMBRELOCAL');
    for (const c of che) for (const lado of ['VISITA', 'LOCAL']) rename(d, `.${c}${lado}`, c + lado);
    for (const n of columnas) {
        rename(d, `.CARRERAS POR INNING ALTA${n}`, `INNINGVISITA${n}`);
        rename(d, `.CARRERAS POR INNING BAJA${n}`, `INNINGLOCAL${n}`);
        rename(d, `.INNING${n}`, n < 9 ? `rotuloinning${n}` : 'ultimoinning');
    }
    rename(d, 'C', 'rotulocarreras');
    rename(d, 'H', 'rotulohits');
    rename(d, 'E', 'rotuloerrores');
    const logo = layer(d, 'LOGO FINAL ATRAPA LA EMOCION.png');
    delete logo.cl;
    // Las barras: las 8 de cada fila apiladas, todas visibles al arrancar, como en el parcial: el
    // controlador manda 1 a la que va y 0 a las otras siete.
    const barras = d.layers.filter(l => /^\.BARRA_[A-Z]+_(LOCAL|VISITA)$/.test(l.nm));
    if (barras.length !== 16) throw new Error(`barras: ${barras.length}`);
    for (const b of barras) {
        const [, equipo, lado] = b.nm.match(/^\.BARRA_([A-Z]+)_(LOCAL|VISITA)$/);
        if (!SIGLAS[equipo]) throw new Error(`${b.nm}: equipo desconocido`);
        rename(d, b.nm, `${SIGLAS[equipo]}${lado}_opacidad`);
    }

    // ---- key: los recuadros se tocan borde con borde, y dos bordes suavizados que caen en el mismo
    // píxel no suman 100 %: quedaban dos columnas de 1 px al 60–92 %, de arriba abajo (x 587, entre las
    // barras y el rosado de los innings, y x 1408, entre el negro de C H E y la banda azul de los
    // rótulos y la caja del logo), una línea finita de video al aire. El rosado crece 1 px a la
    // izquierda, por debajo de las barras y las cajas de los nombres, y el negro y la banda azul, 1 px a
    // la derecha, por debajo de la caja del logo.
    const creceTrazadoX = (l, izq, der) => {
        const g = l.shapes[0].it, sh = g.find(s => s.ty === 'sh'), tr = g.find(s => s.ty === 'tr');
        if (l.shapes.length !== 1 || sh.ks.a || tr.s.a || Math.abs(tr.r.k) > 0.5 || l.ks.r.k) throw new Error(`${l.nm}: trazado inesperado`); // la banda azul llega girada 0,098°
        const v = sh.ks.k.v, xs = v.map(p => p[0]), min = Math.min(...xs), max = Math.max(...xs);
        const sx = escalaX(d, l) * tr.s.k[0] / 100;   // px de pantalla por unidad del trazado
        for (const p of v) {
            if (p[0] < min + 1) p[0] -= izq / sx;
            if (p[0] > max - 1) p[0] += der / sx;
        }
    };
    creceTrazadoX(layer(d, 'Capa de formas 17'), 1, 0);   // el rosado (fill 0.918 0 0.349)
    creceTrazadoX(layer(d, 'Capa de formas 18'), 0, 1);   // el negro de C H E
    creceTrazadoX(layer(d, 'Capa de formas 3'), 0, 1);    // la banda azul de los rótulos

    // ---- la salida: todo, su entrada al revés desde la pausa
    for (const l of d.layers) {
        for (const p of propiedadesAnimadas([l.ks, l.shapes, l.t, l.masksProperties, l.ef])) alReves(p, 0, SF_ENTRADA, SF_PAUSA);
        l.ip = Math.max(l.ip, 1);      // el frame 0 queda vacío, como en los otros gráficos
        l.op = Math.min(FIN - Math.ceil(l.ip) + 0.001, vacio + 1);
    }
    d.op = vacio + 1;
    d.markers = [
        { tm: 0, cm: 'play', dr: SF_PAUSA, payload: { name: 'play', type: 'pause', order: 1, stop: 'salida' } },
        { tm: 0, cm: 'stop', dr: 1 },
        { tm: SF_PAUSA, cm: 'salida', dr: vacio + 1 - SF_PAUSA }
    ];
    if (d.fonts.list.length !== 1 || d.fonts.list[0].fName !== 'LTEnergy-Regular') throw new Error('scorefinal: fuentes inesperadas');
    d.fonts.list[0].fPath = 'font/LTEnergy-Regular.ttf';
    allCaps(d);
    // los textos del UPDATE arrancan vacíos, salvo los rótulos (ultimoinning dice 9)
    for (const l of d.layers) if (l.ty === 5 && l.cl && !/^(rotulo|ultimoinning)/.test(l.cl)) for (const k of l.t.d.k) k.s.t = '';
    save(path.join(REPO, 'scorefinal/data.json'), d);
}
