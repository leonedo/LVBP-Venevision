// version 2.0 - multi-stage model
//  created by cuecore systems - https://www.cuecoresystems.com/
// 

let isOn = false;
let framesMilliseconds;
let animLoaded = false;
let animElementsLength;
let markers = {};

// Multi-stage state
let stages = [];
let multiStageMode = false;
let currentStageIndex = null;
let exitStage = false;
let pendingReturnToStage = null;

// Exit contract — see releaseLayer() below.
// `exiting` marks that the animation currently running is the stop animation,
// so completeHandler() knows the layer has to be released once it finishes.
let exiting = false;
let exitFallbackTimer = null;

// Longest a stop animation is allowed to take before the layer is released
// regardless — counted from when the exit starts running, not from CG STOP.
//
// ⚠ This is a CONTRACT with the controllers, not a tuning knob. A controller
// assumes a graphic that honours the exit contract frees its layer within this
// time, and sizes its post-exit margin on it. Changing it changes the contract
// with every controller; a stop animation longer than this gets cut by it (keep
// exits ≤ 4.5 s). It is also the safety net for a graphic whose JSON never
// loads: there is no animation to complete, so nothing else would free the layer.
const EXIT_FALLBACK_MS = 5000;

// Lo más que se espera a las fuentes antes de cargar la animación — ver
// cargarFuentes(). Una fuente rota falla en milisegundos y no llega a esto; el
// tope es para una carga que se queda colgada, que sin él dejaría el gráfico
// sin salir nunca.
const FONT_WAIT_MS = 2500;

let animContainer = document.getElementById('bm');
let anim = null;

// El peso y el estilo con que Lottie pide cada fuente en el <text>: la misma
// tabla que getFontProperties() de lottie.js, que no se exporta. Si se actualiza
// lottie.js, comprobar que la tabla siga igual.
//
// ⚠ La @font-face tiene que declarar exactamente eso. Sin peso ni estilo, todas
// las caras de una familia (Prometo-Medium, Prometo-Regular) quedan con los
// mismos descriptores y el navegador usa la última para todo. Lo que importa es
// coincidir con Lottie, no el peso real de la fuente: por eso un estilo que la
// tabla no conoce (SemiBold, ExtraBold, Book) queda en `normal` en los dos lados.
const PESOS = { bold: '700', black: '900', medium: '500', regular: '400', normal: '400', light: '200', thin: '200' };
const propiedadesDeFuente = f => {
    const partes = (f.fStyle || '').toLowerCase().split(' ');
    return {
        estilo: partes.includes('italic') ? 'italic' : 'normal',
        peso: f.fWeight || partes.reduce((peso, p) => PESOS[p] || peso, 'normal'),
    };
};

const addFont = f => {
    const { estilo, peso } = propiedadesDeFuente(f);
    const newFont = document.createElement('style');
    newFont.appendChild(document.createTextNode(`\
    @font-face {\
        font-family: ${f.fFamily};\
        font-style: ${estilo};\
        font-weight: ${peso};\
        src: url('${f.fPath}');\
    }\
    `));
    document.head.appendChild(newFont);
};

// Registra las fuentes del JSON y las espera ANTES de lottie.loadAnimation.
//
// ⚠ El orden es el arreglo. Lottie da por cargada una fuente `origin: 0` sin
// esperarla (checkLoadedFonts) y mide cada letra UNA vez: guarda el ancho y no
// lo vuelve a medir. Si la fuente no llegó, mide con la de reserva, y un texto
// de caja se parte en dos líneas en vez de encoger — aunque después se pinte con
// la buena. Antes el @font-face se añadía después de loadAnimation; con la
// fuente en un archivo aparte, era una carrera que casi siempre ganaba la fuente.
//
// ⚠ Cada fuente la registra y la espera UNO solo. Este archivo se queda con las
// origin 0 (archivo aparte) y las origin 3 (URL o base64 en el JSON); Lottie, con
// las 1/2 (CSS de Google o Typekit, que traen sus propias @font-face). Si los dos
// registraban la misma, las esperas se sumaban con una fuente colgada (+2,5 s al
// aire) y Lottie podía medir con un peso y pintar con otro.
//
// Las origin 3 eran de Lottie, pero las registra mal: UNA @font-face por familia
// (la de la primera fuente de la lista), sin peso y con `font-style: normal`. Con
// Prometo-Medium y Prometo-Regular todo se pintaba en Medium, y a una cursiva
// Chrome le podía sumar una oblicua sintética. Pasarlas a origin 0 hace que
// Lottie no las registre ni las espere —una origin 0 la da por cargada— y
// quedan aquí.
//
// Cada carga lleva su catch: una fuente rota (404) rechaza en milisegundos y no
// tiene que frenar al resto ni al gráfico — sale con la de reserva, como antes.
function cargarFuentes(json) {
    const fuentes = ((json.fonts && json.fonts.list) || []).filter(f => f.fPath && !(
        f.origin === 1 || f.origin === 2 || f.fOrigin === 'g' || f.fOrigin === 't'));
    fuentes.forEach(f => {
        if (f.origin === 3 || f.fOrigin === 'p') { f.origin = 0; f.fOrigin = 'n'; }
        addFont(f);
    });
    if (!fuentes.length || !document.fonts) return Promise.resolve();

    // Con el peso y el estilo de cada una: sin ellos load() pide la cara 400
    // normal, y una Medium no se esperaría nunca.
    const cargas = fuentes.map(f => {
        const { estilo, peso } = propiedadesDeFuente(f);
        return Promise.resolve()
            .then(() => document.fonts.load(`${estilo} ${peso} 16px "${f.fFamily}"`))
            .catch(err => console.warn(`[fuentes] ${f.fName || f.fFamily} no cargó, se mide con la de reserva:`, err && err.message));
    });

    let tope;
    const tiempo = new Promise(resolve => {
        tope = setTimeout(() => {
            console.warn(`[fuentes] sin respuesta tras ${FONT_WAIT_MS} ms — se carga la animación igual`);
            resolve();
        }, FONT_WAIT_MS);
    });
    return Promise.race([Promise.all(cargas), tiempo]).then(() => clearTimeout(tope));
}

// Lee el JSON con XMLHttpRequest, no con fetch: CasparCG abre los templates como
// file:// y el Chromium de CasparCG 2.3.x rechaza fetch() sobre ese esquema
// ("URL scheme "file" is not supported"). En 2.6.0 fetch sí funciona, pero XHR
// sirve en las dos (es lo que usaba Lottie por dentro con `path:`). Con file://
// XHR devuelve status 0 aunque haya leído bien: el éxito se decide por el contenido.
function loadJSON(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = () => {
            const ok = (xhr.status >= 200 && xhr.status < 300) || (xhr.status === 0 && xhr.responseText);
            if (!ok) {
                reject(new Error(`HTTP ${xhr.status}`));
                return;
            }
            try {
                resolve(JSON.parse(xhr.responseText));
            } catch (err) {
                reject(err);
            }
        };
        xhr.onerror = () => reject(new Error(`XHR failed: ${url}`));
        xhr.send();
    });
}

// Pre-fetch the JSON so we can normalize markers (object payload -> stringified cm)
// before Lottie parses them. Lottie only reads `cm` to populate `marker.payload`,
// so the user's tool can emit either the legacy stringified-cm form or a clean
// `{ ..., payload: { name, type, order, update? } }` object.
const animPromise = new Promise((resolve, reject) => {
    console.log('loading ' + data_file);
    loadJSON(data_file)
        .then(json => {
            if (json.markers) {
                json.markers.forEach(m => {
                    if (m.payload && typeof m.payload === 'object') {
                        m.cm = JSON.stringify(m.payload);
                    }
                });
            }
            return cargarFuentes(json).then(() => json);
        })
        .then(json => {
            // Match the path resolution Lottie used to do internally with `path:`,
            // so external image assets in the Lottie keep resolving correctly.
            const assetsPath = data_file.substring(0, data_file.lastIndexOf('/') + 1);

            anim = lottie.loadAnimation({
                container: animContainer,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                animationData: json,
                assetsPath
            });

            // With animationData, config_ready fires synchronously inside loadAnimation
            // (no fetch to wait for), so we'd miss it if we attached a listener now.
            // Run the setup explicitly instead — all the data is already available.
            setupStages();
            attachAnimListeners();

            anim.addEventListener('DOMLoaded', () => {
                animLoaded = true;
                resolve('Animation ready to play');
            });
            anim.addEventListener('data_failed', () => {
                console.error('[Lottie] failed to load:', data_file);
                reject(new Error(`Lottie load failed: ${data_file}`));
            });
        })
        .catch(err => {
            console.error('[Lottie] failed to fetch JSON:', data_file, err);
            reject(err);
        });
});

function setupStages() {
    framesMilliseconds = 1000 / anim.renderer.data.fr;

    if (anim.markers) {
        anim.markers.forEach(m => {
            if (m.payload && m.payload.name) {
                markers[m.payload.name] = m;
            }
        });
    }

    stages = (anim.markers || [])
        .filter(m => m.payload && m.payload.type && m.payload.order != null)
        .map(m => ({
            name: m.payload.name,
            type: m.payload.type,
            order: Number(m.payload.order),
            time: m.time,
            duration: m.duration,
            update: m.payload.update || null,
            updateDelay: Number(m.payload.updateDelay || 0),
            stop: m.payload.stop || null
        }))
        .sort((a, b) => a.order - b.order);

    multiStageMode = stages.length > 0;

    exposeStagesAsGlobals();
}

// Commands that arrive before the JSON has loaded.
//
// CasparCG fires them whenever it likes: a `CG ADD` and its follow-up can be
// milliseconds apart, and a recap is megabytes of JSON plus hundreds of images.
// Everything that needs `anim` therefore waits for the same promise `play` waits
// for, instead of the old mix — `play` deferred, the rest bailed out on a null
// `anim` and were silently lost.
//
// ⚠ The queue runs IN ORDER, and that matters more than it looks. A first pass
// used "newest command wins", which is wrong: `play` followed by `goto` is a
// legitimate SEQUENCE — it is what a controller does to restore a graphic that
// re-enters mid-draw — and discarding the play left `isOn` false, which quietly
// kills stage tracking, the SFX one-shot and every `loop` stage.
//
// What genuinely supersedes is only the lifecycle pair: `play` and `stop` are
// mutually exclusive, so each drops a pending one of the other. Cue a graphic,
// cancel it, and the play never runs; change your mind again and the stop never
// runs. Everything else queues behind them.
//
// Anything with an immediate side effect — arming the exit fallback — must still
// happen synchronously, outside this. See the stop handler.
// Un `stop` invalida TODO lo que esperaba, no sólo el play. Cualquier comando
// encolado se pensó para un gráfico que iba a estar al aire, y ya no va a
// estarlo. Dejar pasar uno es lo que rompió el contrato de salida: un `goto`
// superviviente corría ANTES que el stop, llamaba a `cancelExit()`, y borraba el
// `exiting` y el respaldo que el stop acababa de armar — la salida se animaba y
// el layer no se soltaba jamás. Medido: SALIDA dentro de los primeros ~200 ms de
// la carga y el gráfico se quedaba al aire.
const VACIA_LA_COLA = new Set(['stop']);

// El otro del par del ciclo de vida deja de tener sentido cuando llega éste.
const CICLO_DE_VIDA = { play: 'stop', stop: 'play' };

let comandosEnCola = [];
let animacionLista = false;

function alCargar(nombre, fn) {
    const antes = comandosEnCola.length;
    if (VACIA_LA_COLA.has(nombre)) {
        comandosEnCola = [];
    } else {
        const contrario = CICLO_DE_VIDA[nombre];
        if (contrario) comandosEnCola = comandosEnCola.filter(c => c.nombre !== contrario);
    }
    if (comandosEnCola.length !== antes) {
        console.log(`[${nombre}] descarta ${antes - comandosEnCola.length} comando(s) que esperaban a que cargara`);
    }

    if (animacionLista) {
        fn();
        return;
    }
    comandosEnCola.push({ nombre, fn });
}

animPromise.then(() => {
    animacionLista = true;
    const pendientes = comandosEnCola;
    comandosEnCola = [];
    for (const comando of pendientes) {
        try {
            comando.fn();
        } catch (error) {
            console.error(`[${comando.nombre}] falló al ejecutarse tras la carga:`, error);
        }
    }
}).catch(() => {
    // El fetch falló: no hay animación que mandar. Los comandos en cola se
    // quedan sin correr a propósito — el respaldo del stop es quien suelta el
    // layer, y ya está armado desde su handler.
    comandosEnCola = [];
});

// CasparCG `INVOKE 1 "intro()"` evaluates JS, which calls `window.intro()`.
// We register each stage via `webcg.on(name, ...)` so the webcg-framework
// auto-wires `window[name]` (same shape as play/stop/next/goto). Bonus: the
// framework's command buffering serializes back-to-back invokes for us.
const INVOKE_RESERVED_NAMES = new Set([
    'play', 'stop', 'next', 'update',
    'goto', 'playAnimation', 'startclock', 'stopclock'
]);
const INVOKE_VALID_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function exposeStagesAsGlobals() {
    for (const s of stages) {
        const name = s.name;
        if (INVOKE_RESERVED_NAMES.has(name)) continue;
        if (!INVOKE_VALID_IDENT.test(name)) {
            console.warn(`[invoke] stage "${name}" not exposed: invalid JS identifier — use goto('${name}')`);
            continue;
        }
        if (window[name] !== undefined) {
            console.warn(`[invoke] stage "${name}" not exposed: window.${name} already defined`);
            continue;
        }
        webcg.on(name, function () {
            console.log(`[invoke] ${name}`);
            if (exiting) {
                console.warn(`[invoke] ${name} ignorado: hay una salida en curso`);
                return;
            }
            currentStageIndex = null;
            exitStage = false;
            pendingReturnToStage = null;
            anim.goToAndPlay(name, true);
        });
    }
}

function attachAnimListeners() {
    anim.addEventListener('complete', completeHandler);
    anim.addEventListener('enterFrame', enterFrameHandler);
}

// Resolves and triggers an update marker animation when the anim is paused.
// Returns the ms delay before the caller should apply text replacement
// (0 if no update was triggered). Used by both the data handler and the clock
// — without an animation, layers with in/out points outside the current frame
// won't repaint via renderFrame alone.
function triggerUpdateAnim() {
    if (!anim || !anim.isPaused) return 0;

    let updateName = null;
    let pendingStage = null;
    let delay = 0;
    let useSegments = false;

    if (currentStageIndex !== null) {
        const stage = stages[currentStageIndex];
        if (stage.update && markers[stage.update]) updateName = stage.update;
        else if (markers['update']) updateName = 'update';
        if (updateName) {
            pendingStage = stage.name;
            delay = stage.updateDelay;
        }
    } else if (markers['update']) {
        updateName = 'update';
        useSegments = true;
    }

    if (!updateName) return 0;

    exitStage = true;
    pendingReturnToStage = pendingStage;
    currentStageIndex = null;
    if (useSegments) {
        const m = markers[updateName];
        anim.playSegments([m.time, m.time + m.duration], true);
    } else {
        anim.goToAndPlay(updateName, true);
    }
    return framesMilliseconds * delay;
}

webcg.on('data', function (data) {
    console.log('data from casparcg received');
    console.log(JSON.stringify(data, null, 2));

    animPromise.then(resolve => {
        // Colors and opacity are CSS-only — apply immediately, no animation
        // needed. Inside the promise so we don't lose them if anim takes
        // longer than the retry window to load.
        for (const key in data) {
            if (key.toLowerCase().includes('color')) checkandcolor(key, data[key]);
            if (key.toLowerCase().includes('opacidad')) checkandupdate(key, data[key]);
        }

        // Only trigger an update animation if the anim is currently frozen.
        // If it's playing (loop, transition, or an update already running),
        // do silent replacement — the next rendered frame will show the change.
        const updateTiming = triggerUpdateAnim();

        animElementsLength = anim.renderer.elements.length;
        console.log(resolve);

        setTimeout(() => {
            for (let i = 0; i < animElementsLength; i++) {
                let animElement = anim.renderer.elements[i];
                if (
                    animElement.hasOwnProperty('data') && animElement.data.hasOwnProperty('cl') &&
                    data && data.hasOwnProperty(animElement.data.cl)
                ) {
                    let cl = animElement.data.cl;
                    let newPath;

                    // Las claves de color y de opacidad son sólo CSS (arriba): no son
                    // un texto ni una ruta. Antes una capa de imagen con clave
                    // `_opacidad` perdía la imagen —el 1 o el 0 se escribía como su
                    // href— y una de texto mostraba el número.
                    if (/color|opacidad/i.test(cl)) continue;

                    if (animElement.data.hasOwnProperty('refId') && animElement.data.refId.includes('image')) {
                        // Antes esto quedaba fuera de cualquier try: un `cl` con espacios
                        // tiraba acá y cortaba el for, dejando sin actualizar todas las
                        // capas que venían después (y en un setTimeout, así que el .catch
                        // del handler de `data` ni lo veía).
                        try {
                            newPath = data[cl] ? data[cl].text || data[cl] : '';
                            const group = document.querySelector(classSelector(cl, 'g'));
                            const image = group ? group.querySelector('image') : null;

                            if (image) {
                                // Una ruta que no carga (mal escrita, o el archivo no está)
                                // muestra al aire el ícono de imagen rota del navegador: si
                                // falla, la imagen queda vacía. El href vacío también tira
                                // error, pero ese ya no muestra nada.
                                image.onerror = () => {
                                    if (image.getAttribute('href')) image.removeAttribute('href');
                                };
                                image.setAttribute('href', newPath);
                            }
                        } catch (err) {
                            console.warn('[update] no se pudo actualizar la imagen', cl, err.message);
                        }
                    } else if (typeof animElement.updateDocumentData === 'function') {
                        // Sólo las capas de texto tienen estos métodos. Una key puede nombrar
                        // una capa de forma —la convención `*_opacidad` lo hace siempre— y antes
                        // llegaba aquí y escribía un TypeError en el log en cada UPDATE.
                        // String() y no `valor || ''`: un 0 es un texto válido (carreras,
                        // outs), y Lottie no pinta un número — recorre `t` con `.length`.
                        // Lo que no es texto ni número (null, un booleano, un objeto) se
                        // vacía, como antes, en vez de pintar "false" u "[object Object]".
                        const valor = normalizeValue(data[cl]);
                        let texto = (typeof valor === 'string' || typeof valor === 'number') ? String(valor) : '';
                        // Lottie no aplica el All Caps de After Effects (ca: 1 en el
                        // documento de texto): sin esto, un texto que llega en minúsculas
                        // sale en minúsculas aunque en AE la capa se vea en mayúsculas.
                        if (animElement.data.t.d.k[0].s.ca === 1) texto = texto.toUpperCase();
                        try {
                            animElement.canResizeFont(true);
                            animElement.updateDocumentData({ t: texto }, 0);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
            }
            // Force a repaint if paused — silent text/image replacements are
            // otherwise invisible until the renderer ticks again.
            if (anim.isPaused) anim.renderer.renderFrame(null);
        }, updateTiming);
    }).catch(error => console.error(error));
});

// Release the CasparCG layer once the stop animation has played out.
//
// CasparCG has NO idea a template stopped: `CG STOP` is literally
// `producer->call("stop()")`, a javascript call into a page the server does not
// introspect. Measured against CasparCG 2.6.0 on 2026-08-13: after a CG STOP the
// layer keeps reporting `producer=html` with the same `file/path`, forever, and
// `INFO <ch>-<layer>` is byte-for-byte identical before and after. There is no
// AMCP query that knows better — `CG INFO` does not even exist.
//
// window.remove() is the way out. CasparCG injects it into every page context;
// calling it closes the browser and clears the producer's monitor state, so the
// server stops publishing `foreground/file/path` for that layer (43 ms later,
// measured). That absence is the ONLY signal a controller can use to know the
// layer is free again.
//
// ⚠ This is why it lives in the framework and not in each graphic: "remember to
// call it" is not a contract. Every graphic inherits it by using index.js, and
// there is exactly one place where it can break.
//
// ⚠ `remove` is a RESERVED GLOBAL NAME. A template that declares its own
// `function remove()` shadows the one CasparCG injects — this stops working and
// `CG REMOVE` breaks too.
function releaseLayer() {
    clearTimeout(exitFallbackTimer);
    exitFallbackTimer = null;
    exiting = false;

    // Outside CasparCG (devtools, editor preview, a plain browser) there is no
    // window.remove — the guard is what keeps those environments alive.
    if (typeof window.remove === 'function') {
        window.remove();
    } else {
        console.info('[stop] layer released (no-op: window.remove() only exists inside CasparCG)');
    }
}

// Cancel a pending exit: the operator put the graphic back on air before the
// stop animation finished, so the layer must NOT be released.
function cancelExit() {
    clearTimeout(exitFallbackTimer);
    exitFallbackTimer = null;
    exiting = false;
}

function completeHandler() {
    // The stop animation just finished: hand the layer back to the server.
    // Checked first on purpose — an exit outranks any stage bookkeeping.
    if (exiting) {
        releaseLayer();
        return;
    }

    if (pendingReturnToStage) {
        const stageName = pendingReturnToStage;
        pendingReturnToStage = null;
        const idx = stages.findIndex(s => s.name === stageName);
        if (idx === -1) return;
        const s = stages[idx];

        // Restore stage tracking so the next data still triggers the update.
        currentStageIndex = idx;
        exitStage = false;

        if (s.type === 'pause') {
            // Stay at the end of the update segment; pause to avoid Lottie
            // continuing forward through the rest of the timeline.
            anim.pause();
        } else if (s.type === 'loop') {
            // Re-enter the loop from its start.
            anim.goToAndPlay(s.name, true);
        }
        return;
    }

    // Fallback: a loop stage's segment ended naturally without enterFrame
    // catching tm+dr-0.5 in time (low framerate or skipped frame). Without
    // this, the loop dies silently. Skip if we're exiting on purpose (next).
    if (
        multiStageMode &&
        isOn &&
        !exitStage &&
        currentStageIndex !== null &&
        stages[currentStageIndex] &&
        stages[currentStageIndex].type === 'loop'
    ) {
        anim.goToAndPlay(stages[currentStageIndex].name, true);
        return;
    }
    // Otherwise: animation rests at final frame, waiting for goto/next/stop from operator.
}


// Custom methods

// El `cl` de una capa se interpola crudo en un selector de clase. Si el diseñador
// dejó un nombre con espacios ("Logo induveca 4") o que arranca con dígito,
// `querySelector` tira DOMException — y como color/opacidad corren sincrónicos
// dentro del handler de `data`, esa excepción se lleva puesto el UPDATE entero:
// no se actualiza ningún texto y ni siquiera se llega a `triggerUpdateAnim()`.
//
// Escapar degrada eso a "no encontrado", que es un fallo parejo y diagnosticable.
// Ojo con la expectativa: escapar NO hace que el nombre funcione. Lottie escribe
// `cl` al atributo `class`, así que "Logo induveca 4" son en realidad tres clases
// sueltas y ningún selector lo matchea como una sola. El arreglo de fondo es
// renombrar la capa — el audit del editor lo reporta como error `invalid-class`.
function classSelector(name, prefix) {
    const raw = String(name);
    let esc;
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        esc = CSS.escape(raw);
    } else {
        // Fallback para runtimes sin CSS.escape. Escapar sólo los caracteres raros no
        // alcanza: un dígito inicial deja el selector inválido igual (".4logo" tira),
        // así que el primer dígito va como escape hexadecimal, igual que CSS.escape.
        esc = raw.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
        if (/^[0-9]/.test(esc)) esc = '\\3' + esc[0] + ' ' + esc.slice(1);
    }
    return (prefix || '') + '.' + esc;
}

function queryAllByClass(campo, prefix) {
    try {
        return document.querySelectorAll(classSelector(campo, prefix));
    } catch (e) {
        console.warn('[selector] clase inutilizable:', campo, e.message);
        return [];
    }
}

function update_color(campo, color) {
    queryAllByClass(campo).forEach(el => {
        el.style.setProperty('fill', color);
    });
}

function update_opacidad(campo, value) {
    queryAllByClass(campo).forEach(el => {
        el.style.setProperty('opacity', value);
    });
}

function normalizeValue(v) {
    return (typeof v === 'object' && v !== null && 'text' in v) ? v.text : v;
}

function checkandcolor(item, colorData, retries = 20) {
    const color = normalizeValue(colorData);
    if (itemExists(item)) {
        update_color(item, color);
    } else if (retries > 0) {
        setTimeout(() => checkandcolor(item, colorData, retries - 1), 100);
    } else {
        console.log(`[checkandcolor] element not found: ${item}`);
    }
}

function checkandupdate(item, valueData, retries = 20) {
    const value = normalizeValue(valueData);
    if (itemExists(item)) {
        update_opacidad(item, value);
    } else if (retries > 0) {
        setTimeout(() => checkandupdate(item, valueData, retries - 1), 100);
    } else {
        console.log(`[checkandupdate] element not found: ${item}`);
    }
}

function itemExists(item) {
    try {
        return document.querySelector(classSelector(item)) !== null;
    } catch (e) {
        return false;
    }
}


// CasparCG control

webcg.on('startclock', () => startClock());
webcg.on('stopclock', () => stopClock());

webcg.on('play', function () {
    // ⚠ Síncrono, no dentro de la cola. El respaldo del stop cuenta desde que se
    // pulsó SALIDA, así que si la carga tarda más que sus 5 s el temporizador
    // mataría la página aunque este play ya hubiera anulado aquel stop. Cancelar
    // aquí es lo que hace que «volver al aire» gane siempre a un stop anterior.
    cancelExit();

    alCargar('play', () => {
        console.log('play');
        resetSfxPlayed();
        currentStageIndex = null;
        exitStage = false;
        pendingReturnToStage = null;
        // ⚠ Before goToAndPlay, not after: that call can fire enterFrame
        // synchronously, and the SFX guard above reads `isOn`. Setting it
        // afterwards would swallow a clip with `inframe: 0`.
        isOn = true;
        anim.goToAndPlay('play', true);
    });
});

webcg.on('stop', function () {
    // ⚠ The safety net is armed BEFORE anything can bail out. If the JSON never
    // loaded there is no `anim`, and the old early return jumped over the timer
    // as well — so a graphic that failed to load could never release its layer,
    // by any route. That is the exact failure this contract exists to remove,
    // and it was the one path the fallback did not cover: the operator sees
    // black, presses SALIDA, and the layer stays OCUPADO until someone forces a
    // CG CLEAR.
    exiting = true;
    clearTimeout(exitFallbackTimer);
    exitFallbackTimer = setTimeout(() => {
        console.warn(`[stop] no complete event after ${EXIT_FALLBACK_MS} ms — releasing the layer anyway`);
        releaseLayer();
    }, EXIT_FALLBACK_MS);

    console.log('stop');
    isOn = false;

    // The exit animation needs `anim`, so it waits like everything else. A stop
    // issued while the graphic was still loading now supersedes the pending play
    // instead of being lost — and if the load never finishes, the fallback armed
    // above releases the layer regardless.
    alCargar('stop', () => {
        // ⚠ Se rearma aquí además de arriba, y no es redundante: el respaldo
        // síncrono cubre «el JSON no cargó nunca», pero cuenta también el tiempo
        // de carga. Reiniciarlo cuando la salida EMPIEZA de verdad es lo que hace
        // que sus 5 s midan la animación y no la descarga — un recap son 2,5 MB
        // de JSON y cientos de imágenes.
        exiting = true;
        clearTimeout(exitFallbackTimer);
        exitFallbackTimer = setTimeout(() => {
            console.warn(`[stop] no complete event after ${EXIT_FALLBACK_MS} ms — releasing the layer anyway`);
            releaseLayer();
        }, EXIT_FALLBACK_MS);

        // Per-stage custom stop: if the active stage declares stop: "<marker>"
        // and that marker exists, play it as a self-contained segment.
        let customStop = null;
        if (multiStageMode && currentStageIndex !== null) {
            const s = stages[currentStageIndex];
            if (s.stop) {
                customStop = markers[s.stop] || null;
                if (!customStop) {
                    console.warn(`[stop] custom stop marker not found: ${s.stop}, falling back to global stop`);
                }
            }
        }

        currentStageIndex = null;
        exitStage = false;
        pendingReturnToStage = null;

        if (customStop) {
            // playSegments keeps the custom stop self-contained — animation pauses
            // at the end of the segment instead of continuing past it.
            anim.playSegments([customStop.time, customStop.time + customStop.duration], true);
        } else {
            anim.goToAndPlay('stop', true);
        }
    });
});

webcg.on('next', function () {
  alCargar('next', () => {
    // ⚠ Una salida en curso NO se cancela desde aquí. Navegar por un gráfico que
    // se está yendo no significa nada, y hacerlo tenía dos consecuencias graves:
    // `cancelExit()` borraba `exiting` y el respaldo, así que el layer no se
    // soltaba; y para entonces webcg ya está en estado `stopped`, o sea que un
    // `CG STOP` posterior lo descarta el framework y el gráfico se queda al aire
    // SIN NINGUNA FORMA de quitarlo salvo CG CLEAR. Volver al aire a propósito
    // es `play`, y ése sí cancela.
    if (exiting) {
        console.warn('[next] ignorado: hay una salida en curso');
        return;
    }
    if (!anim || !multiStageMode || currentStageIndex === null) {
        console.warn('[next] no active stage');
        return;
    }
    const nextStage = stages[currentStageIndex + 1];
    if (!nextStage) {
        console.warn('[next] no next stage');
        return;
    }
    currentStageIndex = null;
    exitStage = false;
    pendingReturnToStage = null;
    anim.goToAndPlay(nextStage.name, true);
  });
});

// ⚠ `goto('bolo3')` es la forma SEGURA de pedir un stage justo después de un
// `CG ADD`: este handler existe desde que carga index.js, mientras que el global
// por stage (`bolo3()`) no aparece hasta que el JSON se parsea y corre
// `exposeStagesAsGlobals()`. Un INVOKE temprano al global se pierde con un
// ReferenceError; éste espera.
webcg.on('goto', function (stageName) {
  alCargar('goto', () => {
    // ⚠ Una salida en curso NO se cancela desde aquí. Navegar por un gráfico que
    // se está yendo no significa nada, y hacerlo tenía dos consecuencias graves:
    // `cancelExit()` borraba `exiting` y el respaldo, así que el layer no se
    // soltaba; y para entonces webcg ya está en estado `stopped`, o sea que un
    // `CG STOP` posterior lo descarta el framework y el gráfico se queda al aire
    // SIN NINGUNA FORMA de quitarlo salvo CG CLEAR. Volver al aire a propósito
    // es `play`, y ése sí cancela.
    if (exiting) {
        console.warn('[goto] ignorado: hay una salida en curso');
        return;
    }
    if (!anim || !multiStageMode) {
        console.warn('[goto] no stages defined');
        return;
    }
    if (!stages.find(s => s.name === stageName)) {
        console.warn(`[goto] no stage named: ${stageName}`);
        return;
    }
    currentStageIndex = null;
    exitStage = false;
    pendingReturnToStage = null;
    anim.goToAndPlay(stageName, true);
  });
});

webcg.on('playAnimation', function (animationName) {
  alCargar('playAnimation', () => {
    // ⚠ Una salida en curso NO se cancela desde aquí. Navegar por un gráfico que
    // se está yendo no significa nada, y hacerlo tenía dos consecuencias graves:
    // `cancelExit()` borraba `exiting` y el respaldo, así que el layer no se
    // soltaba; y para entonces webcg ya está en estado `stopped`, o sea que un
    // `CG STOP` posterior lo descarta el framework y el gráfico se queda al aire
    // SIN NINGUNA FORMA de quitarlo salvo CG CLEAR. Volver al aire a propósito
    // es `play`, y ése sí cancela.
    if (exiting) {
        console.warn('[playAnimation] ignorado: hay una salida en curso');
        return;
    }
    if (!anim) return;
    console.log('playAnimation ' + animationName);
    anim.goToAndPlay(animationName, true);
  });
});


// SFX + stage tracking on each frame
let sfxPlayedFlags = [];

function resetSfxPlayed() {
    const clips = (typeof audio_clips !== 'undefined' && Array.isArray(audio_clips)) ? audio_clips : [];
    sfxPlayedFlags = clips.map(() => false);
}

function enterFrameHandler(e) {
    // e.currentTime is relative to anim.firstFrame; markers use absolute frames.
    const absFrame = e.currentTime + anim.firstFrame;

    // SFX one-shot per clip.
    //
    // ⚠ `isOn` first, and it is not a micro-optimisation. Lottie fires an
    // enterFrame at frame 0 while the animation LOADS, before anyone called
    // play(). With `inframe: 0` the `absFrame >= inframe` test passes there, so
    // the sting used to hit the programme bus on the `CG ADD` — cued, not on
    // air. It went unnoticed for as long as it did because every graphic until
    // now used a non-zero `inframe`, and that comparison was doing the guarding
    // by accident.
    if (isOn && typeof audio_clips !== 'undefined' && Array.isArray(audio_clips)) {
        for (let i = 0; i < audio_clips.length; i++) {
            const clip = audio_clips[i];
            if (!clip) continue;
            const inframe = Number(clip.inframe);
            if (!Number.isFinite(inframe)) continue;
            if (absFrame >= inframe && !sfxPlayedFlags[i]) {
                const audio = document.getElementById('sfx_' + i);
                if (audio) {
                    audio.volume = 1.0;
                    audio.currentTime = 0;
                    audio.play();
                    sfxPlayedFlags[i] = true;
                }
            }
        }
    }

    // Stage tracking
    if (!multiStageMode || !isOn) return;

    // Release stage tracking if we've moved outside the current stage's range
    // (e.g. after playAnimation jumped us elsewhere, or after exit-and-expand).
    if (currentStageIndex !== null) {
        const cs = stages[currentStageIndex];
        if (absFrame < cs.time || absFrame >= cs.time + Math.max(cs.duration, 1)) {
            currentStageIndex = null;
        }
    }

    // Entry detection: latch onto the stage whose range we're now in
    if (currentStageIndex === null) {
        for (let i = 0; i < stages.length; i++) {
            const s = stages[i];
            if (absFrame >= s.time && absFrame < s.time + Math.max(s.duration, 1)) {
                currentStageIndex = i;
                exitStage = false;
                // We're now anchored in a real stage — drop any pending "return
                // to original stage" intent left over from an update marker
                // playback that transitioned us here.
                pendingReturnToStage = null;
                break;
            }
        }
    }

    // Action at end of segment (tm + dr)
    if (currentStageIndex !== null) {
        const s = stages[currentStageIndex];
        if (absFrame >= s.time + s.duration - 0.5) {
            if (exitStage) {
                currentStageIndex = null;
                // Expand segment so animation can continue past tm+dr toward next stage / end of timeline
                anim.playSegments([absFrame, anim.animationData.op], true);
            } else if (s.type === 'loop') {
                anim.goToAndPlay(s.name, true);
            } else if (s.type === 'pause') {
                anim.pause();
            }
        }
    }
}


// Clock and date
const ENABLE_CLOCK = window.ENABLE_CLOCK === true;
const CLOCK_SECONDS = window.CLOCK_SECONDS === true;
let clockInterval = null;
let clockTimeout = null;
let clockEnabled = false;

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...(CLOCK_SECONDS && { second: '2-digit' }),
    hour12: true
});

const dateFormatter = new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

function updateLottieText(className, text) {
    if (!anim || !anim.renderer) return;
    for (let i = 0; i < anim.renderer.elements.length; i++) {
        const el = anim.renderer.elements[i];
        if (
            el.data &&
            el.data.cl === className &&
            typeof el.updateDocumentData === 'function'
        ) {
            try {
                el.canResizeFont(true);
                el.updateDocumentData({ t: text }, 0);
            } catch (e) {
                console.log('[Clock] Failed to update', className, e);
            }
            return;
        }
    }
}

function updateClock() {
    const now = new Date();
    updateLottieText('time', timeFormatter.format(now));
    updateLottieText('date', dateFormatter.format(now));

    // Don't disturb the graphic visually if it's not on air (before first play
    // or after stop). The text data is still updated in memory; next play will
    // pick up the latest values when the clock layer enters its visible range.
    if (!isOn) return;
    if (!anim || !anim.isPaused) return;

    // Anim paused mid-flow → try to play an update marker so the renderer
    // re-renders the time/date layer (covers layers with in/out ranges).
    triggerUpdateAnim();
    // No update marker available → best-effort renderFrame (only works if
    // the layer is currently in its visible range).
    if (anim.isPaused) anim.renderer.renderFrame(null);
}

function startClock() {
    if (clockEnabled) return;

    clockEnabled = true;
    updateClock();

    // Align first tick to next second/minute boundary so the displayed
    // value never lags more than a few ms behind real time.
    const intervalMs = CLOCK_SECONDS ? 1000 : 60 * 1000;
    const msUntilNextTick = intervalMs - (Date.now() % intervalMs);

    clockTimeout = setTimeout(() => {
        clockTimeout = null;
        if (!clockEnabled) return;
        updateClock();
        clockInterval = setInterval(updateClock, intervalMs);
    }, msUntilNextTick);
}

function stopClock() {
    clockEnabled = false;

    if (clockTimeout) {
        clearTimeout(clockTimeout);
        clockTimeout = null;
    }
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }

    updateLottieText('time', '');
    updateLottieText('date', '');
}

animPromise.then(() => {
    if (ENABLE_CLOCK) startClock();
}).catch(error => console.error(error));
