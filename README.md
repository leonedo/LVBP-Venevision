# LVBP-Venevision

Gráficos Lottie de la LVBP para Venevisión, para CasparCG con webcg-framework. Cada gráfico es una
carpeta con su `index.html`, su `data.json` y su `data.md` (las claves del UPDATE):

| Carpeta | Qué es |
|---|---|
| `score/` | Pizarra: barras de los dos equipos, carreras, inning, bases, conteo, outs y barra de bateador y lanzador |
| `defensiva/` | Pantalla completa: dos compuertas con los colores y el escudo del equipo se abren sobre el campo con las 9 posiciones y sus jugadores; arriba, la barra del equipo y DEFENSIVA |
| `ofensiva/` | Pantalla completa: dos compuertas con los colores y el escudo del equipo se abren sobre el lineup (9 turnos con posición y nombre) y el mánager; arriba, la barra del equipo y OFENSIVA |
| `bateador/` | Barra baja del bateador: escudo del equipo, nombre, número, posición y 4 estadísticas |

El resto de este README es el de la base, [HTML-templates](https://github.com/leonedo/HTML-templates):
plantilla para gráficos Lottie en CasparCG usando webcg-framework, con un state machine **multi-etapa** que permite gráficos secuenciales (entrada → loop1 → pausa → loop2 → salida) controlados desde CasparCG.

---

## Estructura de archivos

El root contiene los archivos compartidos. Cada gráfico vive en una **subcarpeta** que los referencia con `../`:

```
HTML-templates/
├── index.html               # Plantilla base (se copia en cada gráfico)
├── index.js                 # Lógica compartida — NO modificar por gráfico
├── lottie.js                # Vendor: librería Lottie
├── webcg-framework.umd.js   # Vendor: runtime CasparCG webcg
├── webcg-devtools.umd.js    # Vendor: UI de testeo en browser
└── MiGrafico/
    ├── index.html           # Copia ajustada (data_file, opciones)
    └── MiAnim.json          # Lottie del gráfico
```

En el `index.html` del gráfico, los scripts apuntan al root con `../`:

```html
<script>
    let data_file = "MiAnim.json";
    // let audio_inframe = 5;
    // window.ENABLE_CLOCK = true;
</script>
<script src="../webcg-framework.umd.js"></script>
<script src="../lottie.js"></script>
<script src="../index.js"></script>
```

---

## Modelo: stages y eventos

El flujo de un gráfico se modela como una secuencia de **stages** (etapas). Cada stage es un marker del Lottie con metadata declarando si es `loop` o `pause` y en qué orden ocurre. El operador desde CasparCG controla la progresión con eventos.

### Eventos disponibles

| Evento (handler) | Comando AMCP | Comportamiento |
|---|---|---|
| `play` | `CG <ch>-<ly> PLAY <ly>` (o `ADD ... 1`) | Reproduce el segmento `play`. Activa el state machine. |
| `stop` | `CG <ch>-<ly> STOP <ly>` | Reproduce el segmento `stop`, resetea state y **suelta el layer** al terminar — ver abajo. |
| `next` | `CG <ch>-<ly> NEXT <ly>` | Avanza al siguiente stage (por `order`). |
| `data` | `CG <ch>-<ly> UPDATE <ly> "<xml>"` | Reemplazo de texto/color/opacidad/imagen — ver sección Data más abajo. |
| `goto <stageName>` | `CG <ch>-<ly> INVOKE <ly> "goto('<stageName>')"` | Salta a un stage específico. |
| `playAnimation <markerName>` | `CG <ch>-<ly> INVOKE <ly> "playAnimation('<markerName>')"` | Salta a cualquier marker (no necesariamente stage). |
| `startclock` / `stopclock` | `CG <ch>-<ly> INVOKE <ly> "startclock"` / `"stopclock"` | Control manual del reloj. |
| `entrada1`..`entrada6` | `CG <ch>-<ly> INVOKE <ly> "entrada1"` (etc.) | Custom de bingo: salta a markers `bola1`..`bola6`. |

### ⚠ El contrato de salida — el gráfico suelta el layer

**`stop` no termina cuando termina la animación: termina cuando el gráfico suelta el layer.**
Lo hace `index.js` solo. **Un gráfico no escribe nada para esto.**

Por qué hace falta, medido contra CasparCG `2.6.0` el 2026-08-13:

- `CG STOP` es `producer->call("stop()")`: una llamada JavaScript a una página que el
  servidor **no introspecciona**. CasparCG no se entera de que el template paró.
- Tras un `CG STOP` el layer sigue reportando `producer=html` con el mismo `file/path`,
  **indefinidamente**. `INFO <ch>-<layer>` es **idéntico byte a byte** antes y después, y
  `CG INFO` ni siquiera existe (`400 ERROR`).
- `window.remove()` —que CasparCG inyecta en toda página— cierra el navegador y vacía el
  estado del productor: el servidor **deja de publicar `file/path` a los 43 ms**. Esa
  ausencia es la única señal con la que un controlador sabe que el layer quedó libre.

Un gráfico que no suelta el layer se queda **cargado aunque no se vea**. En los clientes
donde varios gráficos comparten un layer, eso deja al operador sin saber qué hay al aire.

| Pieza de `index.js` | Qué hace |
|---|---|
| `webcg.on('stop')` | Levanta `exiting` y arma el respaldo de `EXIT_FALLBACK_MS` (5 s) |
| `completeHandler()` | Primera rama: si `exiting`, suelta el layer |
| `releaseLayer()` | Llama a `window.remove()` si existe; fuera de CasparCG, `console.info` |
| `cancelExit()` | Sólo `play` cancela la salida — volver al aire antes de que acabe la animación **no** suelta el layer. `next` / `goto` durante una salida se ignoran |

⚠ **Los 5 s de `EXIT_FALLBACK_MS` son contrato con los controladores.** Un controlador
puede asumir que un gráfico que cumple el contrato suelta el layer, como mucho, 5 s después
de que su salida empieza, y de ahí saca su margen tras una salida. Por eso:

- **La salida dura ≤ 4,5 s** (`dr / fr` del marker `stop` y de cada `stop` custom). Una más
  larga la corta el respaldo y al aire se ve el corte. Sin marker `stop`, o con `dr: 0`, no
  hay animación de salida (con `dr: 0` el layer se suelta al instante, corte incluido).
- **Cambiar `EXIT_FALLBACK_MS` es cambiar el contrato con todos los controladores.**

Los 5 s cuentan desde que la salida corre: un `stop` que llega con el gráfico todavía
cargando espera la carga y entonces tiene sus 5 s. El respaldo es además la red de un
gráfico roto: si el JSON no carga no hay animación que termine, y sin él el layer no se
soltaría nunca.

⚠ **`remove` es nombre global reservado.** Un gráfico que declare su propia
`function remove()` pisa la que inyecta CasparCG: deja de soltarse el layer **y** se rompe
`CG REMOVE`. Tampoco hay que llamar a `window.remove()` a mano — llamarla antes de tiempo
corta la salida en seco.

**Prueba de salida**, obligatoria antes de publicar un gráfico: ponerlo al aire, mandarle
`stop`, y comprobar que el controlador ve el layer libre **solo**, sin forzar nada. Si hay
que forzarlo, el gráfico no está terminado.

### Stages

Un stage es un marker con `payload.type` y `payload.order`. Dos formas equivalentes (`index.js` acepta ambas):

```json
// Forma limpia (recomendada)
{ "tm": 0, "dr": 100, "cm": "play", "payload": { "name": "play", "type": "pause", "order": 1, "update": "update1" } }

// Forma compacta (todo serializado en cm)
{ "tm": 0, "dr": 100, "cm": "{\"name\":\"play\",\"type\":\"pause\",\"order\":1,\"update\":\"update1\"}" }
```

- `loop`: al final del segmento, salta de vuelta al inicio (loopea hasta `next`/`goto`).
- `pause`: al final del segmento, hace `anim.pause()` (queda detenido hasta `next`/`goto`).
- Para pausar **exacto en `tm`** sin reproducir segmento, usar `dr: 0`.
- Pauses y loops se mezclan libremente.

Detalles completos del schema de markers en [CLAUDE.md](CLAUDE.md).

---

## Data: reemplazo de texto, color, opacidad, imágenes

El evento `SET DATA "..."` desde CasparCG dispara el reemplazo. Convenciones:

| Tipo | Trigger | Acción |
|---|---|---|
| **Texto** | key del data == nombre de capa de texto en el Lottie | `updateDocumentData` sobre la capa |
| **Color** | key contiene `"color"` (case-insensitive) | `style.fill` del CSS `.{key}` |
| **Opacidad** | key contiene `"opacidad"` (case-insensitive) | `style.opacity` del CSS `.{key}` |
| **Imagen** | capa con `refId` que incluya `"image"` | reemplaza `href` del `<image>` SVG; si la ruta no carga, queda vacía (sin el ícono de imagen rota) |

Las keys de color y de opacidad son sólo CSS: una capa de imagen o de texto con clase `*_opacidad`
se prende y se apaga sin que cambie su imagen ni su texto.

Ejemplo:

```
CG 1-10 UPDATE 10 "<templateData>
  <componentData id=\"t0\"><data id=\"text\" value=\"Hola\"/></componentData>
  <componentData id=\"colorBox\"><data id=\"text\" value=\"#ff0000\"/></componentData>
  <componentData id=\"opacidadFondo\"><data id=\"text\" value=\"0.5\"/></componentData>
</templateData>"
```

- `t0` → el texto de la capa `t0` cambia a "Hola"
- `colorBox` → el `fill` de `.colorBox` cambia a rojo
- `opacidadFondo` → el `opacity` de `.opacidadFondo` baja a 0.5

⚠ **Un texto que puede llegar más largo que el del diseño** (una fecha, un número) conviene
pasarlo a **texto de caja** en el JSON: `index.js` ya llama a `canResizeFont(true)` y Lottie le
baja el cuerpo hasta que entra, en vez de salirse. Receta en [textos-de-caja.md](textos-de-caja.md).

⚠ **Mayúsculas:** Lottie no aplica el All Caps de After Effects. Si la capa lo tiene (`ca: 1` en
el JSON), `index.js` pasa a mayúsculas el texto que llega; si no, lo muestra tal cual.

### Update markers (transición visual al cambiar data)

Si el stage actual tiene `update: "<markerName>"` en su payload, el data dispara el reemplazo **acompañado** de la animación de ese marker. La animación queda al final del segmento del update; el operador puede mandar más data para reproducirlo de nuevo.

Si el stage no tiene `update` definido, el reemplazo es silencioso (sin animación).

`updateDelay: N` retrasa el reemplazo de texto N frames dentro del update segment, para sincronizar con la "tapadera" visual.

---

## Audio (SFX one-shot)

Para disparar un sonido en un frame específico del `play`:

1. Descomentar el tag en el `<head>` del `index.html`:
   ```html
   <audio id="sfxOut" src="../audio/aud_0.mp3" preload="auto"></audio>
   ```
2. Definir el frame en el bloque `<script>`:
   ```js
   let audio_inframe = 5;
   ```

Se dispara una vez al cruzar el frame; se resetea en cada `play`.

---

## Reloj y fecha automáticos

Muestra hora y/o fecha en vivo dentro del Lottie.

**1. En el Lottie:**
- Capa de texto de la hora → clase `time`
- Capa de texto de la fecha → clase `date`

(El nombre de la capa en AE = la clase CSS del SVG renderizado.)

**2. En el `index.html`:**
```js
window.ENABLE_CLOCK = true;       // arranca al cargar
// window.CLOCK_SECONDS = true;   // opcional: muestra segundos (intervalo 1s vs 60s)
```

**Formatos:**
- `time` sin segundos → `02:45 PM`
- `time` con segundos → `02:45:30 PM`
- `date` → `dd/mm/yyyy` (locale `es-DO`)

**Control manual desde CasparCG:**
```
CG [channel]-[layer] INVOKE [layer] "startclock"
CG [channel]-[layer] INVOKE [layer] "stopclock"
```

`stopclock` deja los campos de texto vacíos.

El intervalo está alineado a la marca de minuto/segundo, así que el cambio ocurre exacto.

---

## Testeo local con webcg-devtools

Cada `<gráfico>/index.html` carga `webcg-devtools.umd.js` —una UI de control en el browser— cuando se abre con Live Server de VSCode (puerto 5500) o en cualquier puerto con `?debug=true` en la URL (ej. `python3 -m http.server 5510` y `http://localhost:5510/score/index.html?debug=true`). Sin panel, desde la consola: `play()`, `update('{"clave":"valor"}')`, `next()`, `stop()`.

---

## Releases

Tags semver con [release.sh](release.sh):
- `./release.sh` → patch estable
- `./release.sh minor` / `major`
- `./release.sh patch pre` → pre-release

`release.sh` calcula la versión siguiente, crea el tag sobre `main` y lo pushea; el release lo crea
GitHub Actions al recibir el tag ([.github/workflows/release.yml](.github/workflows/release.yml)).
Tasks de VSCode en `.vscode/tasks.json` cubren Mac y Windows (Git Bash).

---

## Qué entra al zip de un Release

`release.sh` no arma el zip: taggea, y el release lo crea GitHub Actions. El **"Source code (zip)"** lo genera
GitHub desde el tag, y ese zip es el artefacto de deploy que se descomprime en el server de playout.
Lo único que controla su contenido es [.gitattributes](.gitattributes) con `export-ignore`.

Este repo es la plantilla base, así que su `.gitattributes` se hereda en todos los repos derivados.

### Qué se excluye siempre (genérico, no tocar)

| Categoría | Rutas |
|---|---|
| Herramientas de desarrollo | `/release.sh`, `/.vscode`, `/.claude`, `/webcg-devtools.umd.js`, `/samples` |
| Documentación | `*.md` — menos `/README.md`, que se queda |

`webcg-devtools.umd.js` **sí está referenciado**, pero sólo por caminos de desarrollo: `index.html`
lo inyecta con `document.write` si `location.port === "5500"` (Live Server), y
`webcg-framework.umd.js` lo carga armando la ruta por concatenación si la URL trae `?debug=true`.
En playout no se dispara ninguno de los dos. Costo de excluirlo: un 404 en consola si abrís un
gráfico del zip con `?debug=true`.

`.DS_Store` y `Thumbs.db` ya están en `.gitignore` — lo que nunca se trackea nunca llega al archive,
así que una línea en `.gitattributes` para eso no hace nada.

### Cómo agregar una exclusión propia en un repo derivado

Va en la sección marcada al final del `.gitattributes`, nunca arriba con las genéricas:

```gitattributes
/viejo/loop_old.json    export-ignore
```

Reglas: **anclá con `/` inicial** y en directorios **sin barra final**. Antes de agregar una línea,
comprobá con `git ls-files` que la ruta existe y con un grep que ningún `.html`/`.js` la referencie.
**No excluyas un gráfico ni un asset de gráfico** aunque no se use hoy — otra versión del
controlador puede invocarlo.

### Cómo verificarla

```bash
# 1. los atributos hacen lo que creés — y no de más
git check-attr export-ignore -- README.md CLAUDE.md <la ruta nueva>

# 2. el archive real (--worktree-attributes si todavía no commiteaste)
git archive --worktree-attributes --format=zip -o /tmp/t.zip HEAD
unzip -l /tmp/t.zip
```

Asserts, no mirar la salida y decir que se ve bien:

- Cero entradas en el zip que matcheen los patrones excluidos.
- `README.md` presente, el resto de los `.md` ausente.
- Todos los HTML de entrada dentro, y todo lo que ellos cargan también.
- Archivos sensibles a finales de línea: extraelos del zip y comparalos por **md5** contra el árbol
  de trabajo. Es el assert que atrapa una regla `text` metida sin querer.

### Cinco trampas del mecanismo

1. **`git archive HEAD` lee el `.gitattributes` del commit, no del árbol de trabajo.** Si probás sin
   commitear no se excluye nada y parece que la lista entera no sirve. Usá `--worktree-attributes`.
2. **`git check-attr` miente sobre los directorios.** Para un archivo dentro de una carpeta con
   `export-ignore` reporta `unspecified`, pero `git archive` sí saltea el subárbol entero. Verificá
   contra el archive real.
3. **No hay `!patron`, pero sí se desactiva un atributo con `-`.** Las líneas posteriores pisan a las
   previas: `*.md export-ignore` seguido de `/README.md -export-ignore` deja el README adentro.
   Se confirma con `git check-attr export-ignore -- README.md` → `unset`.
4. **Anclá con `/` inicial.** Un patrón sin barra matchea en cualquier nivel y puede llevarse
   archivos homónimos de otras carpetas.
5. **Ni una regla `text`, `eol` ni `* text=auto`.** `index.html` y `webcg-framework.umd.js` están en
   CRLF; normalizar finales de línea los reescribe enteros. Este archivo es sólo `export-ignore`.

Y si el repo tiene rutas con tilde o ñ: git las guarda en NFC y macOS escribe NFD, así que el patrón
hay que guardarlo en **NFC** o no matchea nunca.

### Dos límites, documentados a propósito

- **`export-ignore` sólo aplica al commit que se taggea.** Los releases ya publicados siguen
  generando el zip completo. El primero recortado es el próximo tag.
- **No es seguridad.** Los archivos excluidos siguen en la historia del repo y en cualquier clon.
