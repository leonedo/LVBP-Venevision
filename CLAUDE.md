# CLAUDE.md

Base de templates HTML para gráficos Lottie en CasparCG (webcg-framework).

## Este repo: LVBP para Venevisión

Gráficos de la LVBP para Venevisión. Repo público, armado el 2026-10-13 desde HTML-templates
(c759d52) con los arreglos generales de `index.js` que tenía LVBP-Meridiano (ver *Modelo del
proyecto*). Cuatro gráficos, en LT Energy: el score con `font/LTEnergyVFVF.ttf` (fuente variable
con un solo eje, `ital`, que por defecto es la Regular) y la defensiva, la ofensiva y el bateador
con `font/LTEnergy-Regular.ttf`, la estática que mandó el diseñador con sus exports. Las keys del
UPDATE están en su `data.md`.

| Carpeta | Qué es | Flujo | Salida |
|---|---|---|---|
| `score/` | Pizarra arriba a la izquierda: logo de Venevisión, barras de visita y local (escudo y siglas), carreras, inning con sus flechas, bases, conteo y outs; abajo, la barra de bateador (apellido, average, actuación) y lanzador (apellido, lanzamientos, velocidad) | `play` (0–54) → stages `marcador` → `jugadores` (la barra sube, 65–90) → `sinjugadores` (la barra baja, 100–125), los tres `pause` | `salida`: la entrada al revés (1,8 s); desde `jugadores`, `salida_jugadores` baja antes la barra (3 s) |
| `defensiva/` | Pantalla completa: dos compuertas con los colores y el escudo del equipo se abren sobre el campo con las 9 posiciones (rótulo y apellido); arriba a la izquierda, la barra del equipo y DEFENSIVA. El frame 0 está vacío | stage `play` pause (0–53) | `salida`: la entrada al revés (1,8 s): las compuertas se cierran y termina en el frame vacío |
| `ofensiva/` | Pantalla completa, de la familia de la defensiva: dos compuertas con los colores y el escudo del equipo se abren sobre el lineup (9 filas de posición y nombre) y el mánager; arriba a la izquierda, la barra del equipo y OFENSIVA. El frame 0 está vacío | stage `play` pause (0–90) | `salida`: la entrada al revés (3 s) |
| `bateador/` | Barra baja del bateador: a la izquierda, el fondo del color del equipo con su escudo grande; la barra del equipo con el nombre, y el número y la posición en sus placas; abajo, 4 estadísticas (valor y rótulo). El frame 0 está vacío | stage `play` pause (0–87) | `salida`: la entrada al revés (2,9 s) |

Cómo se ve, en [capturas/](capturas/): `score.png` (pantalla completa con data de ejemplo y la barra
arriba), `score_marcador.png` (sin la barra) y `score_equipos.png` (los 56 cruces `visita_vs_local`),
del 2026-10-17; `defensiva.png` / `ofensiva.png` (Leones, con nombres de ejemplo) y
`defensiva_equipos.png` / `ofensiva_equipos.png` (los 8 equipos), del 2026-10-17; `bateador.png`
(Leones, con data de ejemplo) y `bateador_equipos.png` (los 8 equipos, recortado a la barra), del
2026-10-17. Si un gráfico cambia, hay que regenerarlas (las de Leones, con el ejemplo de su `data.md`,
en el último frame de la entrada). No entran al zip (`.gitattributes`).

No hay video de referencia del diseñador, y ningún export trae salida (los markers `stop` del score,
90–120, de la defensiva, 60–90, y de la ofensiva y el bateador, 90–120, no animan nada) ni la bajada de la barra
de jugadores del score: son la animación de entrada al revés, como en todos los gráficos de
Meridiano. Si el diseñador manda una salida propia, reemplaza a ésta.

**Score.** Claves: las del score de LVBP-Meridiano donde dicen lo mismo, para que el controlador le mande a
los dos la misma data: `conteobolasystrikes`, `outs`, `inning`, `INNINGarriba_opacidad` /
`INNINGabajo_opacidad`, `CARRERASVISITA` / `CARRERASLOCAL`, `PRIMERALLENA_opacidad` (y `SEGUNDA`,
`TERCERA`), `PRIMEROUT_opacidad` / `SEGUNDOOUT_opacidad`, `bateador`, `average`, `lanzador`,
`lanzamientos`, y las mismas siglas de escudo: `<SIGLAS>VISITA_opacidad` y `<SIGLAS>LOCAL_opacidad`
con `AGUI`, `ANZ` (Caribes), `BRAVOS`, `CARD`, `LEO`, `MAGA`, `TIBUS`, `TIGRES`. Propias de éste:
`EQUIPOVISITA` / `EQUIPOLOCAL` (las siglas escritas sobre la barra), `actuacion` (el 2-1 del
bateador), `velocidad` (el número; `MPH` es la capa fija `mph`). No tiene las de Meridiano
`lvbp`, `meridianotv` ni `logomeridiano`.

Tamaño: el export del 2026-10-17 reemplazó al del 2026-10-13 con el mismo diseño (capas, textos,
colores, tiempos e imágenes iguales) metido en un nulo nuevo, `Null 1`, al **134 %**: la pizarra
pasó de 656×78 px (x 133, y 74) a 879×104. Llegaba con la esquina en (94, 51), 2 px a la izquierda
y 3 arriba de la zona segura de títulos (90 %: 96, 54); va corrida hasta ahí (Leon, 2026-10-17) y
ocupa x 96–975, y 54–158 con la barra de jugadores arriba. Las claves no cambiaron: el controlador
le manda la misma data que al anterior.

Logo: la V de Venevisión llega azul (`#194771`) con un Hue/Saturation de Lightness +100, que en AE
la vuelve blanca. Lottie no pinta ese efecto y al aire salía azul sobre el azul oscuro de su caja
(`#192B45`: 30 contra 22 IRE), casi invisible; pasaba igual con el export anterior. `prep.js` pasa la
claridad a los rellenos (blanca) y saca el efecto.

Colores en NTSC compuesto (2026-10-17, con setup de 7,5 IRE): las 16 barras de equipo quedan
legales (la más alta, Leones, 106 IRE; ninguna baja de −7). Pasan de 110 IRE, sin llegar a 120, el
cian de los textos y la flecha del inning (`#00D9E2`, 113,5) y el amarillo de las bases (`#FCC107`,
114,4): quedan así (Leon). En HD (Rec.709) todo es legal. Si hiciera falta bajarlos a 110:
`#0BD4DD` y `#F4C11D`.

Barras de equipo: son **imágenes** (`images/img_0–7` local, `img_8–15` visita, con el escudo como
marca de agua), una encima de otra en cada lado y todas visibles al arrancar: el controlador manda
`1` a la que va y `0` a las otras siete, como en Meridiano. Que la clave sea `_opacidad` en una capa
de imagen es lo que destapó el arreglo de *claves sólo CSS* de `index.js`: antes el número se
escribía como ruta y la barra desaparecía.

Textos: salen en mayúsculas aunque lleguen en minúsculas (ver *Mayúsculas* en Convenciones del
Lottie). `bateador` y `lanzador` son sólo el apellido: al tamaño del diseño entran unas 7 letras en
el bateador (`CASTILLO` baja de 21 a 20, `RODRÍGUEZ` a 17) y 8 en el lanzador (`RODRÍGUEZ` a 19);
más largos encogen dentro de su lugar. Siglas, carreras e inning van centrados sobre el eje del
texto del diseño; la velocidad, alineada a la derecha contra `MPH`.

**Defensiva.** Claves: las de la defensiva de LVBP-Meridiano, para que el controlador le mande a
las dos la misma data: `jugador<posición>` el apellido (`jugadorcatcher`, `jugadorlanzador`,
`jugadorprimerabase`, `jugadorsegundabase`, `jugadortercerabase`, `jugadorshortstop`,
`jugadorleftfield`, `jugadorcenterfield`, `jugadorrightfield`), `<posición>` el rótulo (`catcher`
es la C…; fijos en el diseño, y `lanzador` dice P, no L como en Meridiano), `titulo` y
`<SIGLAS>_opacidad` el equipo. No tiene `equipo` ni `lineaparainformacion`: el nombre del equipo
está en la imagen de su barra. `campo`, `basecolor`, `logoatrapa` y `textura` son las imágenes
fijas del fondo.

Equipo: cada clave prende cinco capas, la barra de arriba (imagen con escudo y nombre), las dos
pantallas de color de las puertas y las dos mitades del escudo de las compuertas. Por eso la clase
se repite **a propósito**: el audit del editor lo marca como error y el lint lo deja pasar sólo en
la defensiva, la ofensiva y el bateador. Empiezan ocultas (CSS de `index.html`, como la defensiva de Meridiano):
el controlador manda `1` al que defiende y `0` a los otros siete. Sin equipo, las puertas quedan
azules.

Puertas: el export las trae azules para todos, y ese azul es justo el de Magallanes en la ofensiva,
que salió de esta defensiva: la ofensiva es la versión nueva de la idea, con una puerta de color por
equipo y una textura de líneas encima. Para que las dos queden iguales (Leon, 2026-10-15), `prep.js`
le pone a cada puerta, encima, la textura (`images/texturapuertas.png`, en *multiply*) y las ocho
pantallas de color, hijas de la puerta, con su forma y su máscara. Los degradados y la textura salen
de la ofensiva preparada (`ofensiva/data.json`): si cambian allá, la defensiva los toma la próxima
vez que se prepare (y el bateador, los colores de sus fondos).
El escudo de las compuertas va al 49 % del diseño (con fusión *color dodge*), pero ese 49 % no está
en la capa sino en el CSS de su `<image>` (`g[id^="puerta"] > image`, por el `ln`
`puerta<SIGLAS><izq|der>` de la capa): el UPDATE escribe su `opacity` en la capa y lo pisaría con
un 1. Los efectos de AE de esos escudos Lottie no los pinta: el Emboss (relieve) y el
Hue/Saturation (el Tone es de audio: no se ve). El Emboss dejaba el escudo gris, y sin él el PNG
blanco con *color dodge* se quemaba casi a blanco y se veía mucho más fuerte que en el diseño. El
gris vuelve con un efecto **Fill** al 72,5 % (lo liso del Emboss, 50 % de gris mezclado 45 % con el
blanco), que Lottie sí pinta con un filtro SVG, como las sombras: el escudo da el brillo azul del
diseño, pero sin relieve. Lo eligió Leon el 2026-10-15 entre el blanco al 49 % y al 30 %; si el
diseñador manda los PNG con los efectos aplicados, se saca (`GRIS_PUERTA = null` en `prep.js` y el
chequeo del Fill en el lint). Con las puertas de color, el de Tigres va al 95 %, como en la ofensiva
(ver ahí). La compuerta de Águilas no vino en el export: llegó aparte, como PNG
(`images/compuerta_aguilas.png`, 2026-10-15), y `prep.js` le arma las dos capas con las de Caribes.

Textos: en mayúsculas, como en el score. Los apellidos van como se los manda el controlador a
Meridiano (`F.RODRIGUEZ`): al tamaño del diseño entran unas 10 letras (`F.RODRÍGUEZ` baja de 20 a
19, `A.CAMPUSANO` a 17); más largos encogen dentro de su barra azul. Es de pantalla completa desde
su primer frame, así que el frame 0 queda vacío: no se ve nada antes del `play` (un `CG ADD` sin
autoplay) y la salida termina en vacío. Un `stop` a mitad de la entrada salta al gráfico completo
y sale desde ahí, como en Meridiano.

**Ofensiva.** La misma familia que la defensiva (compuertas, barra de equipo arriba, frame 0 vacío,
el escudo con el mismo 49 % por CSS y el mismo Fill gris), y de acá salen las puertas de **color**:
cada equipo tiene sus dos pantallas (`PANTALLAPUERTA<DER|IZQ><equipo>`, con su degradado).
Claves: las de la ofensiva de LVBP-Meridiano donde dicen lo mismo, `posicion1`…`posicion9` y
`jugador1`…`jugador9` (los turnos, de arriba abajo), `titulo` y `<SIGLAS>_opacidad`; no tiene
`valorN` (no hay columna de average), `equipo` ni `informacion`. Propias: `manager` (el nombre) y
`rotulomanager` (el MGR, fijo). El controlador todavía no tiene el dato del mánager: tiene que
mandarlo siempre, o queda al aire el `NOMBRE APELLIDO` del diseño.

Equipo: cada clave prende cinco capas, la barra, las dos pantallas de las puertas y las dos mitades
del escudo; sin equipo, las puertas no se ven. El export sólo trae el escudo de Águilas: los otros
siete son los PNG blancos de la defensiva (`images/compuerta_<equipo>.png`), con las capas del de
Águilas (decidido con Leon, 2026-10-15). Las puertas de Tigres son de un azul casi negro, que el
*color dodge* casi no puede aclarar: con el gris de los demás (72,5 %) su escudo casi no se veía
(en AE pasaría lo mismo). Su escudo va al 95 % (`GRIS_EQUIPO` en `prep.js`) y se ve como el de
Tiburones o Magallanes; lo eligió Leon el 2026-10-15 entre 72,5, 85, 90 y 95.

Color de Águilas y Leones: cada barra es del mismo color en los cuatro gráficos, y en los otros seis
equipos la puerta es del tono de su barra, pero en éstos dos no: Águilas tiene la barra naranja
rojiza (`#F64D25`, tono 12°) y las puertas llegaban ámbar (`#FF8400`, 31°); Leones, la barra ámbar
(`#FDAD36`, 36°) y las puertas amarillas (`#FFD200`, 49°). Con ellas, las de la defensiva y el fondo
del bateador. Van con el tono de la barra y el brillo que el diseñador le dio a cada uno: el claro
es la barra llevada a 255 (`#FF5026`, `#FFAE36`) y los otros dos stops, en la proporción del export
(`COLOR_PUERTA` en `prep.js`). Los eligió Leon el 2026-10-17, cada uno entre ése y uno más oscuro (el
de Águilas, como Caribes, quedaba casi igual a Caribes). En NTSC compuesto, lo más alto de las
puertas de Leones (con el escudo) baja de 123 IRE a 106, lo de su barra. En el bateador, el escudo
de Leones (en *overlay*) sigue pasando un poco de 120 en sus brillos (121, antes 131): el *overlay*
lleva a 255 el rojo y el verde del amarillo debajo de lo blanco del escudo, y con el fondo más
oscuro (al 80 %) pasaba en más lugares.

Textos: nombre y apellido, como en el diseño y en Meridiano (`ALÍ CASTILLO`). Al tamaño del diseño
entran unas 21 letras en las filas (`ALEXANDER MONASTERIOS` entra) y 19 en el mánager; más largos
encogen dentro de su barra, igual en todas las filas. El título llega diciendo DEFENSIVA (copiado de
la defensiva): `prep.js` lo pasa a OFENSIVA.

**Bateador.** La barra baja. Claves: las de la barra de bateador de LVBP-Meridiano (`bateador/`),
para que el controlador le mande a las dos la misma data: `nombrejugador` (nombre y apellido),
`numerouniforme`, `posicion`, `valor1`…`valor4` / `etiqueta1`…`etiqueta4` (casilleros genéricos, de
izquierda a derecha: el AVE / HR / CI / OPS del diseño es sólo el texto por defecto) y
`<SIGLAS>_opacidad`. No tiene `titulo` ni `informacionbarranegra`.

Equipo: cada clave prende tres capas, la barra del nombre (imagen, con el escudo de marca de agua),
el fondo de color de la izquierda (forma con degradado) y el escudo grande encima (imagen en
*overlay*, mateada con su `MASK`). Por eso la clase se repite a propósito, como en la defensiva.
Empiezan ocultas (CSS de `index.html`, como el bateador de Meridiano): el controlador manda `1` al
que batea y `0` a los otros siete. Sin equipo no se ven la barra ni el fondo: el nombre queda sobre
la textura gris y la placa negra del número, entera. El export trae el fondo de siete equipos con
el mismo naranja (el de Bravos) y sólo Tigres con el suyo: van con el color de cada equipo de la
ofensiva, como las puertas de la defensiva (Leon, 2026-10-16). El escudo va en *overlay*, que a lo
sumo duplica el brillo del fondo: sobre el de Tigres, casi negro, no se veía. Lleva lo mismo que su
escudo en las puertas de la ofensiva, *color dodge* con el Fill gris (`BAT_DODGE` en `prep.js`), al
85 %: se ve como el de Tiburones o Magallanes (el 95 % de la ofensiva, acá, con el escudo al 100 % y
no al 49 %, queda mucho más fuerte). Comparado el 2026-10-16 con 80, 90 y 95.

Textos: en mayúsculas. El nombre, como en Meridiano (`ISAIAS TEJEDA`): al tamaño del diseño entran
unas 17 letras (`AEVERSON ARTEAGA` entra; `ALEXANDER MONASTERIOS` baja de 55 a 42); más largos
encogen dentro de la barra. El número entra con 3 cifras y la posición con 3 letras. Cada valor va
alineado a la derecha contra su rótulo y crece hacia la izquierda (un `8` queda junto a su HR, como
el `00` del diseño): `1.000` entra al tamaño del diseño en los casilleros 1, 2 y 4, y en el 3, el
más angosto, encoge un poco. Los rótulos, unas 3 letras.

### Cuando llega un export nuevo del diseñador

El score llega como `SCOREBUG.zip` (carpeta `SCOREBUG/` con `data.json`, `images/` y `FONT/`), la
defensiva como `DEFENSIVA.rar`, la ofensiva como `OFENSIVA.rar` y el bateador como
`LOWBAR_BATEADOR.rar` (carpetas `DEFENSIVA/`, `OFENSIVA/` y `LOWBAR BATEADOR/`, con espacio, igual; el
`.rar` se abre con `unar`). La receta de los cuatro es `herramientas/prep.js`, que prepara los que encuentre:
buscar las capas por `nm` (los índices cambian) y comparar contra `git show HEAD:<gráfico>/data.json`.

**Score**

- **Clases:** `.BOLASYSTRIKES` → `conteobolasystrikes`, `.INNINGS` → `inning`, `.ALTAINNING` /
  `.BAJAINNING` → `INNINGarriba_opacidad` / `INNINGabajo_opacidad`, `.<N>BASELLENA` →
  `<N>LLENA_opacidad`, `.PRIMEROUT` / `.SEGUNDOOUT` → `*_opacidad`, `.APELLIDOLANZADOR` →
  `lanzador`, `.NUMERODELANZAMIENTOS` → `lanzamientos`, `.VELOCIDADNUMERO` → `velocidad`,
  `.AVERAGE` → `average`, `.ACTUACIONENTURNOS` → `actuacion`, `.EQUIPOVISITANTE` →
  `EQUIPOVISITA`, y las barras `.BARRA<EQUIPO><LOCAL|VISITA>` → `<SIGLAS><LOCAL|VISITA>_opacidad`.
  Llegaron mal y se repiten: las dos carreras con la **misma** clase `CARRERAS` (una clave cambiaba
  las dos) → `CARRERASVISITA` / `CARRERASLOCAL`; el bateador como `,APELLIDOBATEADOR` (con coma: sin
  clase) → `bateador`; `.BARRABRAVOSLOCAL_` con un `_` de más; `OUTS` y `MPH` sin clase (textos
  fijos) → `outs` / `mph`.
- **Máscara que falta:** la barra de Águilas local (`.BARRAAGUILASLOCAL`) llega con `tt` y sin su
  máscara encima: Lottie la mateaba con el texto `EQUIPOLOCAL` y la barra sólo se veía por adentro
  de las letras. `prep.js` le pone una copia de `mascaralocal`, como las otras siete.
- **Fuente:** `fPath` llega como la carpeta (`SCOREBUG/FONT`): pasa a `font/LTEnergyVFVF.ttf`.
- **All Caps:** llega apagado en conteo, outs, inning y toda la barra de jugadores: `prep.js` lo
  prende en todas las capas de texto y el lint lo controla.
- **Textos de caja** ([textos-de-caja.md](textos-de-caja.md)): todas las cajas llegan de AE con
  `lh` 0.01 (un texto largo partía en líneas encimadas en vez de encoger): va 1.2 del cuerpo. Las de
  la barra de jugadores cruzaban la barra entera (`lanzador` 193 px, `lanzamientos` 464): `bateador`
  a 80 (8 px antes del average), `lanzador` a 89 centrado (6 px antes de los lanzamientos),
  `lanzamientos` a 46 centrado (entra `P.100`), `actuacion` a 42.1 (8 px antes del final de la
  barra), con `H` 18 en los nombres. `velocidad` llegaba alineada a la izquierda y pegada a `MPH`
  (un `100` se metía en `MPH`): pasa a la derecha, terminando donde termina el `90` del diseño, y el
  texto por defecto pierde el espacio final. `inning`, las carreras y las siglas pasan de izquierda
  a centrados sobre el eje del texto del diseño (Lw medidos: `10` 8.3422, `00` 26.0547, `TIG`
  32.1412). Con el texto del diseño, el resultado es idéntico al píxel al export en 15 frames. Los
  px de esta receta son del score al 100 %: al 134 % del `Null 1`, multiplicarlos por 1,34.
- **Nulo raíz:** desde el export del 2026-10-17 todo cuelga de `Null 1` (p `[962, 537.2]`, s 134 %):
  `prep.js` lo corre `CORRE` (2, 3 px) hasta la zona segura de títulos. Si llega en otro lugar o a
  otra escala, falla: medir de nuevo la esquina (bbox del render en el frame 90) y mover `CORRE`.
- **Logo:** la V de `VVLOGO` llega azul con un Hue/Saturation de Lightness +100 que Lottie no pinta:
  `horneaClaridad()` lo pasa a los rellenos (blanca) y lo saca.
- **Markers:** los del diseñador (`start`, `hold`, `stop`) se reemplazan por los de la tabla de
  arriba. La entrada del marcador termina en el 53 (los outs) y la barra sube del 65 al 90: si eso
  cambia, mover `ENTRADA`, `SUBE` y `BAJA` en `prep.js`. La bajada de la barra (100–125) la arma
  `prep.js` con los keyframes de la subida al revés (curvas invertidas); comprobado frame a frame
  contra la subida. El `stop` global está en el frame 0, que está vacío: un `stop` durante la
  entrada corta.
- **Imágenes:** las 16 barras del export van tal cual a `score/images/`.

Comparado frame a frame contra el export del 2026-10-17 (sin correr y con la V azul, con el texto
del diseño): idéntico al píxel del 0 al 90, salvo la barra de Águilas local (su máscara).

**Defensiva**

- **Clases:** los apellidos llegan con el nombre de la posición (`.rightfield`, `.campocorto`…) o
  con coma (`,catcher`, `,pitcher`: sin clase) → `jugador<posición>` (`campocorto` es `shortstop`;
  `pitcher`, `lanzador`); los rótulos (`C`, `P`, `1B`…, sin clase) → `<posición>`; `DEFENSIVA 2` →
  `titulo`; las barras `.BARRA_<EQUIPO>_VISITA[_1].png` (clase `BARRA_… png`, dos clases) y las
  compuertas `.COMPUERTA<ABREV><IZQ|DER>` → `<SIGLAS>_opacidad`. El lado de cada compuerta sale de
  su parent (`puertaizq` / `puertader`): los nombres no lo dicen (MAG está al revés que las otras).
  `CAMPO.png`, `BASE DE COLOR.png`, `LOGO FINAL ATRAPA LA EMOCION_1 bisel.png` y `TEXTURA.png`
  (clase `png`) → `campo`, `basecolor`, `logoatrapa` y `textura`.
- **Máscara invertida:** la puerta derecha (`puertader`) llega con su máscara invertida. Lottie la
  invierte contra un rectángulo del tamaño de la composición que arranca en el (0, 0) de la capa,
  no contra todo: al abrirse la puerta, la parte de la máscara a la izquierda de ese origen
  aparecía como una franja azul que tapaba el centro del campo y cortaba el DEFENSIVA. `prep.js` la
  cambia por la complementaria sin invertir: la misma diagonal, cerrada por la derecha.
- **Compuertas:** el 49 % pasa de la capa al CSS, cada una lleva su `ln` y suma el Fill gris (ver
  arriba). Sin compuerta de Águilas en el export, `prep.js` la arma desde
  `images/compuerta_aguilas.png`.
- **Fuente:** `fPath` llega como `FONT/LT Energy`: pasa a `font/LTEnergy-Regular.ttf`.
- **All Caps:** llega apagado en todas las capas de texto: `prep.js` lo prende.
- **Textos de caja:** los apellidos ya llegan de caja (con `lh` 52, no parten en líneas encimadas),
  pero la caja pasaba 27 px el final de su barra azul: va hasta 8 px antes (anchos medidos con la
  fuente, uno por posición, en `DEF_POSICIONES`). Los rótulos, a 52 centrados (su placa rosa).
- **Markers y timeline:** `start` / `stop` del diseñador → `play`, `salida` y `stop` de la tabla de
  arriba. La entrada termina en el 52 (el título): si cambia, mover `ENTRADA_DEF` (`prep.js` falla
  si algún keyframe pasa de ahí). Todas las capas arrancan en el frame 1.
- **Puertas de color:** encima de cada puerta, la textura y las 8 pantallas de color de la
  ofensiva (ver arriba). Necesita la ofensiva preparada: si llegan los dos exports juntos, correr
  `prep.js` dos veces.
- **Imágenes:** las 19 del export van tal cual a `defensiva/images/`, más `compuerta_aguilas.png` y
  `texturapuertas.png` (copia de `ofensiva/images/img_1.png`).

Comparado frame a frame contra el export (con sólo la máscara arreglada y el mismo equipo), antes
del Fill gris: igual salvo 1 o 2 niveles de 255 dentro del escudo de las compuertas, por el 49 % en
el `<image>`. El Fill sólo cambia el escudo, sin costo de frames medible en la entrada.

**Ofensiva**

- **Clases:** `POSICION` y `POSICION 2`…`9` (sin clase) → `posicion1`…`9`; `.NOMBREPOSICION1`…`9`
  (el 1 con un espacio al final del `nm`) → `jugador1`…`9`; `MANAGER` / `NOMBREMANAGER` (sin clase)
  → `rotulomanager` / `manager`; `DEFENSIVA 2` → `titulo`, con el texto pasado a OFENSIVA; las
  pantallas `PANTALLAPUERTA<DER|IZQ><AGUI|ANZ|BRA|CARD|LEO|MAG|TIB|TIG>`, las compuertas y las barras
  → `<SIGLAS>_opacidad`; las imágenes del fondo como en la defensiva (`CAMPO OFENSIVA.png` → `campo`)
  y las dos `TEXTURA PUERTAS.png` (mismo `nm`) → `texturapuertaizq` / `texturapuertader`, por parent.
- **Pantallas repetidas:** las de Águilas llegan dos veces; queda la de arriba (la que se ve en AE;
  la de abajo tiene la izquierda 4 px corrida).
- **Máscaras invertidas:** las 9 pantallas de la derecha, como la puerta de la defensiva
  (`complementaria()`, compartida): tapaban el centro con una franja del color del equipo.
- **Color de Águilas y Leones:** sus pantallas llegan de otro tono que su barra: van con
  `COLOR_PUERTA` (`color`), el tono de la barra (ver arriba). `prep.js` falla si el degradado del
  export cambia (`COLOR_PUERTA`, `export`): mirar el color nuevo antes de volver a pisarlo. Para otro
  equipo, sumar sus siglas al mapa. La defensiva y el bateador lo toman de la ofensiva preparada.
- **Escudos:** el de Águilas viene en el export (`images/img_0.png`, con sus máscaras); los otros
  siete los arma `escudoClonado()` con sus capas: centrado en su imagen y la máscara por la misma
  diagonal, alargada para cubrir cualquier alto. 49 % al CSS y Fill gris, como en la defensiva
  (Tigres al 95 %, `GRIS_EQUIPO`).
- **Textos de caja:** ya llegan de caja, con `lh` 52, pero la caja de la fila 1 pasaba 4 px el
  final de su barra (van en diagonal) y la del mánager, 100. Los nueve nombres van a 474 (8 px antes
  del final de la barra más corta) y el mánager a 382; el alto, a 34 y 31: con el 50 del export un
  nombre muy largo partía en dos líneas chicas en vez de encoger.
- **Markers y timeline:** `play` / `salida` en el 90, `stop` en el 0 vacío. La entrada termina en
  el 89 (el mánager): si cambia, mover `ENTRADA_OF`. Las capas que arrancan en el 0 pasan al 1.
- **Imágenes:** las 14 del export van tal cual a `ofensiva/images/`, más los 7
  `compuerta_<equipo>.png` (copias de `defensiva/images/img_0–6`).

Comparado frame a frame contra el export (con las máscaras arregladas, Águilas, sin el Fill y con
el título del export): igual salvo 1 o 2 niveles de 255 en el escudo.

**Bateador**

- **Clases:** `.BATEADOR` → `nombrejugador`, `.NUMEROJUGADOR` → `numerouniforme`,
  `.POSICIONDEJUGADOR` → `posicion`; los rótulos `AVE`, `HR`, `CI`, `OPS` (sin clase) →
  `etiqueta1`…`4` y los valores `.AVERAGE`, `.JONRONES`, `.CARRERASIMPULSADAS`, `.OPSNUMERO` →
  `valor1`…`4`; las barras `.BARRA_<EQUIPO>_BATEO_1.png` (la de Bravos sin el `_1`; clase `… png`,
  dos clases), los fondos `.FONDO<EQUIPO>` y los escudos `.<EQUIPO>LOGO` → `<SIGLAS>_opacidad`;
  `TEXTURA BASE_1.png` (clase `png`) → `textura`. Las `MASK…` (los mattes de los escudos) y las
  `Capa de formas` (la franja plateada, hija del fondo de Tigres, y las placas del número y la
  posición) quedan como vienen, sin clase.
- **Fuente:** `fPath` llega como `FONT/LT Energy`: pasa a `font/LTEnergy-Regular.ttf`.
- **All Caps:** llega apagado en todas las capas de texto: `prep.js` lo prende.
- **Textos de caja:** ya llegan de caja, pero el nombre cruzaba el número y la posición (708 px de
  pantalla) y el número y la posición medían 594. El nombre va hasta 8 px antes del negro del número
  (459, a escala 0.91); número y posición, hasta 8 px adentro de su placa, que va en diagonal (117 y
  150, a 0.79). Los valores llegaban alineados a la izquierda, con el rótulo a continuación: pasan a
  la derecha, terminando donde termina el del diseño (Lw `.000` 125.6719, `00` 72.9531), con la caja
  hasta 8 px después de la del rótulo anterior (el primero, del borde de la barra gris, x 527); el
  `.000 ` pierde el espacio final. Los rótulos, cajas de 70. El alto de todas, el ascent del cuerpo
  más 2: con el del export (hasta 90) un texto que encogía mucho partía en dos líneas chicas.
- **Fondos:** el degradado de cada equipo sale de las puertas de la ofensiva preparada
  (`ofensiva/data.json`), con los stops dados vuelta (la puerta va de oscuro en 0, arriba, a claro
  en 1; el fondo, claro en 0, abajo). Las posiciones del degradado (`s`, `e`) quedan las del export.
  `prep.js` prepara la ofensiva antes que el bateador: si llegan los dos juntos, alcanza con una vez.
  Los de Águilas y Leones son el `COLOR_PUERTA` de la ofensiva (2026-10-17): sin el export del
  bateador a mano, se le pasaron al JSON preparado, igual que a la defensiva, con los stops dados
  vuelta como acá.
- **Escudo de Tigres:** de *overlay* (`bm` 3) a *color dodge* (6), con el Fill gris al 85 % (ver
  arriba).
- **Barras:** aparecen cuando empiezan a moverse (frame 11, su primer keyframe): antes, su punta
  asomaba quieta 5 px en el borde izquierdo, del frame 0 al 10 (y al final de la salida).
- **Markers y timeline:** `START` (0–30) y `STOP` (90–120) del diseñador → `play`, `salida` y `stop`
  como en la defensiva. La entrada termina en el 86 (el OPS): si cambia, mover `ENTRADA_BAT`. Las
  capas que arrancan en el 0 pasan al 1: el frame 0 queda vacío.
- **Imágenes:** las 17 del export van tal cual a `bateador/images/`.

Comparado frame a frame contra el export (Bravos, con el texto del diseño, antes de los colores de
la ofensiva): idéntico al píxel del 13 al 87; del 0 al 10 sólo falta la punta de la barra. En el 11
y el 12, la sombra de la franja difiere hasta 18/255 en la esquina según el frame que el browser
pintó antes: renderizados cada uno en una página recién cargada, son idénticos.

### QA

- Juzgar con el runtime real y la fuente cargada (`<gráfico>/index.html` en el browser o con
  Playwright). `lottie_render` del editor usa una fuente de reemplazo: no sirve para revisar textos.
- Score: los 56 cruces visita × local, entrada frame a frame, data al aire con el gráfico pausado,
  `next` y `stop` desde cada stage, y que el layer se suelte.
- Defensiva, ofensiva y bateador: los 8 equipos (barra, color de las puertas o del fondo y escudo), y sin equipo; entrada frame a frame, cambio de equipo al aire,
  `stop` en la pausa y a mitad de la entrada, y que el layer se suelte.
- Textos: apellidos largos (que encojan dentro de su lugar), números de más cifras (`P.100`, `100`
  de velocidad, `10-4`, `1.000`, inning `10`, `1.000` en cada casillero del bateador) y textos en
  minúsculas (que salgan en mayúsculas).
- Por `file://`, como lo abre CasparCG: Chromium con `--allow-file-access-from-files`.

### Herramientas

En [herramientas/](herramientas/), fuera del zip; las de render y análisis vienen de LVBP-Meridiano.
Los scripts de render necesitan un server estático en la raíz del repo (`python3 -m http.server
5510`) y Playwright: el del Lottie Layer Editor, o `PLAYWRIGHT=<ruta a index.mjs>` (en un contenedor
con Playwright global, `$(npm root -g)/playwright/index.mjs`).

| Script | Para qué |
|---|---|
| `prep.js` | La receta de arriba, ejecutable: prepara el export del diseñador. Instrucciones en su encabezado |
| `shot.mjs` | Frames de un gráfico con data: `node herramientas/shot.mjs <url> <salida> '<json>' <frames> [x,y,w,h]`; `JSON=<archivo>` sirve otro data.json para comparar versiones |
| `matrix.mjs` | Muchas variantes de data en una carga (todos los cruces…), con reporte de textos y consola |
| `onair.mjs` | Un flujo al aire (update, play, next, stop) con capturas en cada paso |
| `lifecycle.mjs` | Tiempos de play → pausa → stop → salida, y que el layer se suelte |
| `sheet.py` | Hojas de contacto con etiqueta (así se arman las de `capturas/`) |
| `lint.py` | Chequeo estructural de todos los gráficos |
| `dump.py`, `kf.py`, `deepdiff.py` | Analizar un export: capas, keyframes y diferencias contra lo publicado |

## Modelo del proyecto

El root contiene los **archivos compartidos** que todos los gráficos consumen vía `../`:

- [index.js](index.js) — lógica principal de todos los gráficos (NO se modifica salvo bug fix general)
- [lottie.js](lottie.js) — librería Lottie
- [webcg-framework.umd.js](webcg-framework.umd.js) — runtime de CasparCG webcg
- [webcg-devtools.umd.js](webcg-devtools.umd.js) — devtools para testear localmente con UI gráfica
- [index.html](index.html) — plantilla de referencia, se copia en cada gráfico
- [.gitattributes](.gitattributes) — qué NO entra al zip del release. Viaja a cada repo derivado, ver "Deploy"

Cada gráfico vive en una **subcarpeta hermana** con su `MiAnim.json` y un `index.html` propio que apunta a `../index.js`, `../lottie.js`, `../webcg-framework.umd.js`. Si un gráfico necesita lógica muy particular, se copia el `index.js` localmente y se edita ahí.

La **doc de data de cada gráfico** (`MiAnim.md`: keys con ejemplo, invokes, markers —la que un controlador usa como contrato—) la **genera el Lottie Layer Editor** al guardar el JSON (`generateDocumentationMd`, `core/lottie-core.js`). No se escribe a mano: el siguiente guardado la pisa. Si dice algo mal, se arregla en el generador, no en el `.md`. No entra al zip del release (`*.md export-ignore`).

En este repo es `<gráfico>/data.md`. El del score se armó con el formato del generador desde el
JSON preparado (no pasó por el editor) y lleva a mano las notas de los markers y de las barras de
equipo: si el editor lo regenera, reponerlas desde *Este repo*. El de la defensiva sí pasó por el
editor (audit y guardado, 2026-10-15), pero se reescribió a mano en el mismo formato: el generador
del MCP pone las capas de imagen con clase `_opacidad` también entre las imágenes, con una ruta de
ejemplo en el payload, y `index.js` no les reemplaza la imagen (ver *claves sólo CSS*). Si el editor
lo regenera, reponerlo desde git. El del bateador se escribió a mano en ese formato, sin pasar por
el editor.

## Convenciones del Lottie

El nombre de la capa en AE → clase CSS del SVG renderizado. Es el contrato entre el Lottie y el `index.js`.

**Capas de texto reemplazables:** la key del data de CasparCG debe matchear el nombre de la capa.

**Texto que puede no entrar** (una fecha, un número, un nombre): pasarlo a **texto de caja**
—`sz` + `ps` en `t.d.k[i].s`— para que encoja en vez de salirse. `index.js` ya llama a
`canResizeFont(true)`. Se hace a mano en el JSON y, siguiendo la receta, queda idéntico al
píxel con el texto del diseño: [textos-de-caja.md](textos-de-caja.md).

**Mayúsculas:** Lottie no aplica el All Caps de After Effects (`ca: 1` en `t.d.k[i].s`): un texto
que llega en minúsculas saldría en minúsculas aunque en AE la capa se vea en mayúsculas.
`index.js` pasa a mayúsculas el texto del UPDATE en las capas que lo tienen; en las que no, lo deja
como llega.

**Fuentes:** las `origin: 0` (archivo aparte) y las `origin: 3` (URL o base64 en el JSON)
las registra `index.js` y las **espera antes** de `lottie.loadAnimation` (`cargarFuentes()`),
porque Lottie mide cada letra una sola vez y una fuente que llega tarde deja medidas de la
de reserva para siempre. Tope `FONT_WAIT_MS` (2,5 s): una fuente más lenta que eso, o rota,
sale con la de reserva y deja un `[fuentes]` en la consola. Las `origin: 1/2` (CSS de Google
o Typekit) las registra y espera Lottie (hasta 5 s).

Cada `@font-face` declara el peso y el estilo que Lottie pide en el `<text>`, con su misma
tabla (`propiedadesDeFuente()`). Así conviven varios pesos de una familia: antes ganaba
una sola cara y, en un gráfico con Kanit Light y Kanit Black, las capas en Black salían en
Light. Dos cosas que eso le pide al Lottie:

- ⚠ La tabla de Lottie sólo distingue Bold, Black, Medium, Regular/Normal, Light/Thin e
  Italic, como **palabras sueltas** del `fStyle`. Dos estilos de la **misma familia** que no
  distingue (SemiBold, ExtraBold, Book, Heavy, `BoldItalic` junto) se pintan los dos con el
  último. Arreglo: darle a cada cara su propio `fFamily` en el JSON (p. ej. su `fName`).
- ⚠ El `fStyle` tiene que decir la verdad sobre el archivo. Antes la `@font-face` decía
  400 y `normal`, y Chrome compensaba con negrita u oblicua **sintéticas** cuando el
  archivo no estaba marcado así: uno Regular rotulado Bold salía en negrita falsa, uno
  recto rotulado Italic salía inclinado, y alguno cursivo, con doble inclinación. Ahora se
  pinta el archivo tal cual.

Al portar este `index.js` a un repo derivado, los gráficos con varios pesos de una familia
o con cursivas **cambian de cara** (a la del diseño): revisarlos antes de salir al aire.

**Capas reservadas (clase obligatoria):**
- `time` → reloj automático
- `date` → fecha automática

**Keys reservadas en data (matching por substring, case-insensitive):**
- cualquier key que contenga `color` → cambia el `fill` CSS de `.{key}`
- cualquier key que contenga `opacidad` → cambia el `opacity` CSS de `.{key}`

Esas keys son **sólo CSS**: el contenido de la capa no se toca. Una capa de imagen o de texto con
clase `*_opacidad` se prende y se apaga, pero no cambia su imagen ni su texto (antes el `1` o el `0`
se escribía como ruta de la imagen —que desaparecía— o como texto).

⚠ **El nombre de la capa tiene que ser un identificador CSS válido.** Se interpola en un
selector de clase, así que no puede tener espacios ni arrancar con dígito. `Logo induveca 4`
no funciona: Lottie escribe `cl` al atributo `class` y eso son en realidad tres clases
sueltas (`Logo`, `induveca`, `4`), con lo cual ningún selector la alcanza. Peor: sin la
guarda de `classSelector()` el selector inválido tira `DOMException` y —como color y opacidad
corren sincrónicos dentro del handler de `data`— se lleva puesto el **UPDATE entero**, no sólo
esa capa. `classSelector()` degrada eso a "no encontrado", pero el arreglo de fondo es
renombrar. El audit del Lottie Layer Editor lo reporta como `invalid-class`.

## Markers

Los markers se generan a mano o con una tool externa, no desde AE.

`index.js` pre-procesa el JSON antes de pasárselo a Lottie: si un marker tiene un campo `payload` que es **objeto**, lo serializa a `cm` por debajo (`m.cm = JSON.stringify(m.payload)`). Esto permite **dos formas equivalentes** de declarar markers:

- **Forma limpia (recomendada):** `payload` como objeto, `cm` opcional (puede llevar el nombre o ser ignorado).
- **Forma compacta:** todo va serializado dentro de `cm` (la usaba la versión anterior).

Lottie en runtime siempre reconstruye `marker.payload` parseando el `cm` final — primero intenta `JSON.parse(cm)`, después `key:value\r\nkey:value`, y como fallback `{name: cm}`. Lo que recibe `index.js` desde `anim.markers` es siempre `payload` ya armado.

### Markers básicos (regulares)

`cm` es solo el nombre. Lottie produce `payload = {name: cm}`.

```json
{ "tm": 0, "dr": 300, "cm": "play" }
```

Markers reservados por nombre (invocados desde CasparCG o usados internamente):
- `play` — entrada (CALL `play`)
- `stop` — salida (CALL `stop`)
- `bola1`..`bola6` — usados por handlers custom `entrada1`..`entrada6` (gráfico de bingo/lotería)

Cualquier otro marker regular puede invocarse vía `playAnimation <name>` o referenciarse desde un stage como su `update`.

### Stage markers

Definen segmentos del flujo donde el operador puede pausar/loopear y avanzar.

**Forma limpia (recomendada):**

```json
{ "tm": 0, "dr": 300, "cm": "play", "payload": { "name": "play", "type": "pause", "order": 1, "update": "update" } }
```

**Forma compacta (equivalente, retrocompatible):**

```json
{ "tm": 0, "dr": 300, "cm": "{\"name\":\"play\",\"type\":\"pause\",\"order\":1,\"update\":\"update\"}" }
```

Las dos formas producen el mismo `marker.payload` en runtime.

| Campo del payload | Valores | Notas |
|---|---|---|
| `name` | string libre | Identificador. Usado para `goto <name>` desde CasparCG y para `goToAndPlay` interno |
| `type` | `"loop"` o `"pause"` | Comportamiento al final del segmento |
| `order` | `1`, `2`, `3`, ... | Orden secuencial para el evento `next`. Único entre stages |
| `update` | `"<markerName>"` (opcional) | Marker que se reproduce cuando llega data en este stage. Si no está, fallback al marker global `update` (si existe). Si tampoco, silent replacement |
| `updateDelay` | número (opcional) | Frames a esperar dentro del update segment antes de aplicar text replacement. Default `0` |
| `stop` | `"<markerName>"` (opcional) | Marker que se reproduce cuando llega `stop` mientras este stage está activo. Self-contained (`playSegments` sobre `tm → tm+dr`). Si no está o el marker no existe, fallback al marker global `stop` |

**Comportamiento de stages:**

Ambos tipos usan el segmento `tm → tm + dr` simétricamente. Lo que cambia es qué pasa al final:
- `loop`: salta de vuelta a `tm` (loopea)
- `pause`: ejecuta `anim.pause()` y queda detenido. Para pausar exacto en `tm`, `dr: 0`

Pauses y loops se pueden mezclar libremente en el mismo gráfico.

**Comportamiento del `update`:**

El update marker solo se dispara si **la animación está pausada** cuando llega la data. Si está reproduciéndose (loop, transición entre stages, o un update ya en curso), se hace silent replacement — el próximo frame ya muestra el cambio.

Cuando llega data y `anim.isPaused === true`, `index.js` resuelve el update marker en este orden:
1. **Dentro de un stage:** stage.update si existe, else marker global `update` como fallback. Reproducción con `goToAndPlay` — la pause action del stage corta al final del segmento del stage
2. **Sin stage activo (gráfico sin stages, o pausado entre stages):** marker global `update`. Reproducción con `playSegments([tm, tm+dr])` — aislado al segmento del marker, no continúa al resto del timeline
3. **Si no hay update aplicable:** silent replacement + `renderFrame()` para repintar el frame congelado

Cuando hay update marker resuelto, text/color/image replacement se aplica a `framesMilliseconds * updateDelay` (el delay viene del stage; en modo sin stage, default 0).

Implicación práctica: un loop nunca se interrumpe por data, aunque tenga `update` definido en el payload (el campo se ignora silenciosamente porque el loop está siempre playing). Si querés interrumpir un loop visualmente al cambiar data, usá un stage `pause` en su lugar.

Un mismo update marker puede ser referenciado por múltiples stages, o servir como fallback global.

**Comportamiento del `stop` custom:**

Cuando llega el evento `stop` desde CasparCG:
1. Si el stage actual tiene `stop: "<name>"` y existe ese marker → reproduce solo el segmento `tm → tm+dr` con `playSegments` (queda en el último frame, sin pasar al resto del timeline)
2. Si no → reproduce el marker global `stop` con `goToAndPlay`. Con `dr > 0` es también sólo `tm → tm+dr`: Lottie 5.13 convierte `goToAndPlay` sobre un marker con duración en `playSegments`. Con `dr: 0` no anima: suelta el layer al instante

Útil para gráficos donde la salida visual depende del estado actual (ej. cada stage tiene su propia animación de cierre).

## Eventos de CasparCG

| Evento | Comportamiento |
|---|---|
| `play` | Arranca, reproduce el segmento `play`, activa state machine de stages |
| `stop` | Reproduce el segmento `stop`, resetea state |
| `next` | Salta al siguiente stage por `order` usando `goToAndPlay(<nombre>)`. Si no hay siguiente, warn y no-op. Funciona igual en pause y loop |
| `goto <name>` | Salta al stage con ese nombre |
| `playAnimation <name>` | Salta a cualquier marker (no necesariamente stage) |
| `data {...}` | Reemplaza textos/colores/opacidad/imágenes; dispara update marker si el stage actual lo define |
| `entrada1..6` | Custom: salta a markers `bola1..bola6` |
| `startclock` / `stopclock` | Control manual del reloj automático |

### ⚠ El contrato de salida — `window.remove()`

**`stop` no termina cuando termina la animación: termina cuando el gráfico suelta el
layer.** Lo hace `index.js` solo, en `releaseLayer()`; ningún gráfico escribe la llamada.

Por qué hace falta, medido contra **CasparCG 2.6.0** el 2026-08-13:

- `CG STOP` es literalmente `producer->call("stop()")` — una llamada JS a una página que el
  servidor no introspecciona. **CasparCG no se entera de que el template paró.**
- Después de un `CG STOP` el layer sigue reportando `producer=html` con el mismo
  `file/path`, indefinidamente. `INFO <ch>-<layer>` devuelve un XML **idéntico byte a
  byte** antes y después, y `CG INFO` ni siquiera existe (`400 ERROR`).
- `window.remove()` —que CasparCG inyecta en toda página— cierra el navegador y vacía el
  estado del productor: el servidor **deja de publicar `foreground/file/path` a los 43 ms**.
  Esa ausencia es la única señal con la que un controlador puede saber que el layer quedó
  libre.

Consecuencia práctica: un gráfico que no suelta el layer se queda cargado aunque no se vea,
y en un controlador con **layer compartido** —varios gráficos por el mismo layer, que es el
caso de ZFX La Suerte— eso deja al operador sin saber qué hay al aire.

Cómo se cumple:

| Pieza | Qué hace |
|---|---|
| `webcg.on('stop')` | Levanta `exiting` y arma el respaldo de `EXIT_FALLBACK_MS` (5 s) |
| `completeHandler()` | Primera rama: si `exiting`, suelta el layer. Va primero a propósito |
| `releaseLayer()` | Llama a `window.remove()` si existe; fuera de CasparCG deja un `console.info` |
| `cancelExit()` | Sólo `play` cancela la salida: volver al aire antes de que termine la animación **no** suelta el layer. `next` / `goto` / `playAnimation` / el global de un stage se **ignoran** durante una salida |

⚠ **Los 5 s de `EXIT_FALLBACK_MS` son contrato con los controladores, no un detalle de
`index.js`.** Un controlador puede asumir que un gráfico que cumple el contrato suelta el
layer, como mucho, 5 s después de que su salida **empieza**, y de ahí saca su margen tras
una salida (cue-qs-beisbol: `SALIDA_MAXIMA_TEMPLATE_MS`). Dos consecuencias:

- **La salida dura ≤ 4,5 s**: el `dr / fr` del marker `stop` y de cada `stop` custom de
  stage. Una más larga **la corta el respaldo**: suelta el layer a mitad de la animación y al
  aire se ve el corte. Con 5 s justos compiten `complete` y el respaldo.
- **Sin marker `stop` o con `dr: 0` no hay animación de salida.** Sin marker, el layer se
  suelta al terminar el segmento en curso (al instante si estaba en pausa). Con `dr: 0`, al
  instante siempre: corta lo que se esté viendo, también una entrada a medias.
- **Cambiar `EXIT_FALLBACK_MS` es cambiar el contrato con todos los controladores**, no
  ajustar un gráfico. Un gráfico que necesita una salida más larga no cabe en esta plantilla.

Los 5 s cuentan desde que la salida **corre**, no desde el `CG STOP`. Un `stop` que llega
con el gráfico todavía cargando espera la carga (JSON y fuentes) y entonces tiene sus 5 s:
hasta ~10 s desde el `CG STOP`. Si la carga pasa de 5 s, el respaldo que se armó al llegar
el `stop` suelta el layer sin animar.

El respaldo además es la red de un gráfico roto: si el JSON no carga no hay animación que
termine, y sin él el layer se quedaría ocupado para siempre.

⚠ **`remove` es nombre global reservado.** Un gráfico que declare su propia
`function remove()` pisa la que inyecta CasparCG: deja de soltarse el layer **y** se rompe
`CG REMOVE`.

**Prueba de salida** — todo gráfico nuevo la pasa antes de publicarse: ponerlo al aire,
mandarle `stop`, y comprobar que el controlador ve el layer libre solo, sin forzar nada. Si
hay que forzarlo, el gráfico no está terminado.

### Invocación directa de stages (shortcut)

Cada stage marker queda expuesto como función global en `window`, así que desde CasparCG se puede invocar directo en vez de pasar por `goto`.

Sintaxis CasparCG: `CG <channel>-<videoLayer> INVOKE <cg_layer> "<method>"` — en este setup `cg_layer` siempre es `1`.

```
CG 1-10 INVOKE 1 "intro()"       # equivalente a INVOKE 1 "goto('intro')"
```

Reglas:
- Solo aplica a stages (markers con `type` y `order`). Markers regulares siguen vía `playAnimation`.
- No se exponen los nombres reservados: `play`, `stop`, `next`, `update`, `goto`, `playAnimation`, `startclock`, `stopclock`.
- Nombres que no son identificadores JS válidos (espacios, guiones, empieza con dígito) se saltean con warning — usar `goto('<name>')` en ese caso.
- Si el nombre colisiona con un global existente (ej. un stage llamado `anim`), se saltea con warning.
- Los `()` son obligatorios — `INVOKE 1 "intro"` solo lee la referencia, no la ejecuta.
- ⚠ El global no existe hasta que cargan el JSON **y sus fuentes** (hasta `FONT_WAIT_MS` más). Un `INVOKE 1 "intro()"` justo después del `CG ADD` se pierde con un `ReferenceError`; `goto('intro')` existe desde el principio y espera a la carga. Un controlador que manda el stage pegado al ADD usa `goto`.

## Reemplazo de imágenes

Si una capa con clase (`cl`) tiene `refId` que incluye `image`, `index.js` reemplaza el `href` del `<image>` SVG con el valor del data.

Si la ruta no carga (mal escrita, o el archivo no está), la imagen queda vacía: sin eso, el navegador
muestra al aire su ícono de imagen rota. `""` también la deja vacía.

Lottie dibuja la imagen en el tamaño del asset (`w` × `h`) y por defecto recorta (`xMidYMid slice`)
una de otra proporción. Para un logo que tiene que entrar entero, `"pr": "xMidYMid meet"` en el
asset.

## Audio

Para SFX one-shot por entrada (uno o varios clips):
1. Agregar un `<audio id="sfx_<i>" src="../audio/aud_<i>.mp3" preload="auto">` por clip en `<head>` (índice 0-based)
2. Definir `let audio_clips = [{ src: '../audio/aud_0.mp3', inframe: 5 }, ...]` antes de cargar `../index.js`

Cada clip se dispara una vez al cruzar su `inframe`; todos los flags se resetean en cada `play`. El `src` en `audio_clips` es informativo (el `<audio id="sfx_<i>">` es el que efectivamente se reproduce).

## Reloj/fecha

- `window.ENABLE_CLOCK = true` antes de cargar `../index.js` para arrancar al cargar
- `window.CLOCK_SECONDS = true` para incluir segundos (intervalo 1s vs 60s alineado al minuto)
- Control manual: CALL `startclock` / `stopclock` (stop deja los textos vacíos)
- Formato: `time` → `02:45 PM` en-US, `date` → `dd/mm/yyyy` es-DO

## Testeo local

Cada `<gráfico>/index.html` carga `../webcg-devtools.umd.js` —una UI de control en el browser— cuando se abre en el puerto 5500, el de Live Server de VSCode, o en cualquier puerto con `?debug=true` en la URL (ej. `python3 -m http.server 5510` y `http://localhost:5510/score/index.html?debug=true`). El panel acepta el payload en modo JSON. Sin panel, desde la consola: `play()`, `update('{"clave":"valor"}')`, `next()`, `stop()`.

## Cómo llegan los cambios a `main`

Por pull request (Leon, 2026-10-16). Cada sesión trabaja en una rama `claude/<tema>`, la pushea y
abre un PR hacia `main`; lo mergea Leon en GitHub, o la sesión cuando Leon se lo pide (con
*rebase*, para que `main` siga lineal: desde la nube, mergear un PR sí se puede). GitHub borra la
rama al mergear (*Automatically delete head branches*, en Settings → General). No pushear directo
a `main`. Para publicar, después
del merge: volver a `main`, `git pull` y `release.sh` (ver *Releases*).

## Releases

Tags semver gestionados con [release.sh](release.sh):
- `./release.sh` → patch estable
- `./release.sh minor` / `major`
- `./release.sh patch pre` → pre-release `vX.Y.Z-pre.N`

Tasks de VSCode en [.vscode/tasks.json](.vscode/tasks.json) cubren Mac y Windows (Git Bash).

**No correr `release.sh` sin pedir confirmación** — crea un release público en GitHub.

`release.sh` trae los tags de GitHub (`git fetch --tags`, para no repetir una versión), calcula la
siguiente y pushea `main` a la rama `release/<versión>`; exige estar en `main`, sin cambios sin
commitear y con `main` igual a `origin/main`. GitHub Actions
([.github/workflows/release.yml](.github/workflows/release.yml)) crea en ese commit el tag y el
release (título el tag, notas generadas, pre-release si es `-pre.N`) y borra la rama, en unos
segundos. Después `release.sh` espera a que el release aparezca (si hay `gh`). El workflow
también corre con un tag `v*` pusheado a mano, y si el release ya existe no lo toca.

Va por una rama para poder publicar desde una sesión de Claude Code en la nube: su proxy de GitHub
deja pushear ramas, pero rechaza pushear tags (`HTTP 403` en el `git push`) y crear releases
(`Creating, editing, or deleting releases is not permitted for this session type`), y no deja leer
la API de Actions ni GraphQL (`gh release view`): el release se comprueba por REST (`gh api
repos/{owner}/{repo}/releases/tags/<versión>`), que sí pasa. Así salió `v0.0.5` (2026-10-16). Si el workflow
falla, la rama `release/<versión>` queda en GitHub y el próximo `release.sh` no puede pushearla:
ver la pestaña Actions y borrar la rama. El workflow (`/.github`) no entra al zip.

Desde una sesión en la nube tampoco se pueden borrar ramas en GitHub (ni por `git push --delete` ni
por la API): las ramas de trabajo las borra GitHub al mergear su PR (ver *Cómo llegan los cambios a
`main`*), y las `release/<versión>`, el workflow. Una que llegó a `main` sin PR hay que borrarla a
mano, en GitHub, *Branches*.

## Deploy: qué entra al zip del release

El artefacto que se copia al server de playout es el **"Source code (zip)"** que GitHub genera del tag — `release.sh` no empaqueta nada: el tag y el release los crea el workflow (ver *Releases*). Lo único que controla el contenido de ese zip es [.gitattributes](.gitattributes) con `export-ignore`. El porqué de cada línea, las cinco trampas del mecanismo y los ejemplos están en el README, sección "Qué entra al zip de un Release". Acá van las reglas de uso.

### Este repo es la plantilla: el `.gitattributes` viaja a cada paquete derivado

- El bloque genérico (`*.md` menos README, `/.vscode`, `/.claude`, `/release.sh`, `/webcg-devtools.umd.js`, `/samples`) es interno en **cualquier** repo de gráficos. No se toca ni acá ni en el derivado.
- Lo interno de UN proyecto va **sólo** en la sección marcada del final, y en el repo derivado — nunca subirlo al bloque genérico de la plantilla. Si dudás de si algo es genérico o específico, es específico.
- Al arrancar un paquete nuevo desde esta plantilla, la única línea a revisar es `/samples`: si ese repo usa `samples/` para gráficos reales y no para ejemplos, hay que borrarla. Es la única del bloque genérico que puede morder.

### Antes de agregar una exclusión

1. `git ls-files` — sólo lo trackeado puede entrar al zip. Lo que ya está en `.gitignore` no necesita línea (sería decoración).
2. Comprobar que ningún `.html`/`.js` la referencia, sin confiar en un grep literal: hay rutas armadas por concatenación en runtime (así carga `webcg-framework.umd.js` a los devtools) y puede haber diferencias de mayúsculas entre lo que pide el HTML y el nombre real del archivo.
3. Anclar con `/` inicial, y en directorios **sin** barra final. Un patrón suelto matchea en cualquier nivel y se lleva homónimos de otras carpetas.
4. Rutas con tilde o ñ: guardar el patrón en **NFC** (git usa NFC, macOS escribe NFD) o no matchea nunca.

**Nunca excluir un gráfico ni un asset de gráfico** aunque hoy no se use — otra versión del controlador puede invocarlo. Si parece que sobra, preguntar antes de sacarlo.

### Verificar antes de decir que está listo

```bash
git check-attr export-ignore -- README.md <la ruta nueva>
git archive --worktree-attributes --format=zip -o /tmp/t.zip HEAD && unzip -l /tmp/t.zip
```

- `--worktree-attributes` es obligatorio si todavía no commiteaste: `git archive HEAD` lee el `.gitattributes` **del commit**, y sin eso parece que la lista entera no sirve.
- `git check-attr` reporta `unspecified` para archivos dentro de un directorio con `export-ignore`, aunque `git archive` sí saltee el subárbol entero. **Verificar contra el archive real, no contra `check-attr`.**
- Asserts concretos, no "se ve bien": cero entradas que matcheen los patrones excluidos, `README.md` presente y el resto de los `.md` ausente, todos los HTML de entrada dentro con todo lo que cargan, y md5 idéntico worktree↔zip en los archivos CRLF (`index.html`, `webcg-framework.umd.js`) — ese último atrapa una regla `text` metida sin querer.

### Dos límites conocidos, no son bugs

- `export-ignore` sólo aplica al commit que se taggea: los releases ya publicados siguen generando el zip completo, el primero recortado es el próximo tag.
- No es seguridad: lo excluido sigue en la historia del repo y en cualquier clon.

## Cosas que NO hay que hacer

- No modificar `index.js` del root para resolver una necesidad de UN gráfico — copiarlo a la subcarpeta del gráfico y editar ahí.
- No cambiar nombres de markers/clases reservados (`play`, `stop`, `time`, `date`, `bola1..6`) — rompen el contrato con CasparCG y el index.js.
- **No declarar una `function remove()` global** — pisa la `window.remove()` que inyecta CasparCG y con ella el contrato de salida (ver *Eventos de CasparCG*).
- No llamar a `window.remove()` desde un gráfico: lo hace `index.js` al terminar la animación de salida. Llamarla antes corta la salida en seco.
- No cambiar `EXIT_FALLBACK_MS` ni hacer una salida de más de 4,5 s: los 5 s son el contrato con los controladores (ver *Eventos de CasparCG*).
- No reusar nombres de stages — cada `payload.name` debe ser único.
- No repetir `order` entre stages.
- No tocar `lottie.js` ni `webcg-framework.umd.js` (son vendors).
- **No usar `fetch()` para leer archivos del template** (el JSON del Lottie, etc.). CasparCG abre los templates como `file://`, y en **CasparCG 2.3.x** su Chromium rechaza `fetch` sobre ese esquema (`URL scheme "file" is not supported`, visto con LVBP-Stats). En 2.6.0 `fetch` sí funciona, así que el problema solo aparece en clientes con el server viejo. `index.js` usa `loadJSON()` con `XMLHttpRequest`, que funciona en las dos versiones. Con Live Server (`http://`) los dos funcionan, así que al testear en el browser no se ve.
- No agregar al bloque genérico del `.gitattributes` una exclusión que sea específica de un proyecto — va en la sección marcada del final, y en el repo derivado.
- No meter reglas `text`, `eol` ni `* text=auto` en `.gitattributes` — `index.html` y `webcg-framework.umd.js` están en CRLF y una normalización los reescribe enteros. Ese archivo lleva sólo `export-ignore`.

## Pendiente / a futuro

- **External loops** (`loopExternal` legacy con `loop.json` separado) se eliminó en la reescritura. Si vuelve a hacer falta, se reimplementará con un diseño propio integrado al modelo de stages.
- **`loopDelay`** (frames muertos entre iteraciones de loop) tampoco se migró. Se puede emular agregando frames "muertos" al final del segmento del loop en el Lottie.

---

## Spec completa de markers (referencia para tools)

Esta sección es la fuente de verdad para cualquier tool que genere markers. Documenta exactamente qué soporta el `index.js` actual y qué NO.

### Forma base de cualquier marker

```json
{ "tm": <frame inicio>, "dr": <duración en frames>, "cm": "<string>", "payload": { ... } (opcional) }
```

| Campo | Tipo | Notas |
|---|---|---|
| `tm` | number | Frame absoluto donde arranca el segmento. Obligatorio |
| `dr` | number | Duración del segmento en frames. Obligatorio. Para "punto" usar `0` |
| `cm` | string | Comment field. Si el marker no trae `payload` objeto, este campo se parsea para producir el payload. Obligatorio |
| `payload` | object | Opcional. Si está y es objeto, `index.js` lo serializa a `cm` antes de pasárselo a Lottie. Forma recomendada para stages |

### Cómo `index.js` arma el `payload` final

1. Pre-procesa el JSON antes de cargar: si `marker.payload` es objeto, sobrescribe `marker.cm = JSON.stringify(marker.payload)`.
2. Le pasa el JSON a Lottie como `animationData`.
3. Lottie parsea `cm` para producir el `marker.payload` definitivo:
   - **`JSON.parse(cm)`** — si es JSON válido, `payload = parsed`.
   - **`key:value\r\nkey:value`** — si tiene al menos un `clave: valor` separado por `\r\n`, parsea key/value (valores quedan como strings).
   - **Fallback**: `payload = { name: cm }` — para markers simples cuyo nombre es literalmente el contenido de `cm`.

Resultado neto: emitir `payload: {...}` (forma limpia) y emitir `cm: "{...JSON...}"` (forma compacta) son **equivalentes**.

### Categoría 1: Markers regulares (no-stage)

`payload` es solo `{ name: "..." }`. Se usan para:
- Trigger desde CasparCG por nombre conocido (`play`, `stop`, etc.)
- Target de `playAnimation <name>` desde CasparCG
- Ser referenciados como `update` desde un stage marker

**Forma simple (recomendada para regulars):**
```json
{ "tm": 0, "dr": 100, "cm": "play" }
```

Lottie produce `payload = { name: "play" }`.

**Forma JSON (también válida pero innecesaria para regulars):**
```json
{ "tm": 0, "dr": 100, "cm": "{\"name\":\"play\"}" }
```

#### Nombres reservados (no reusar para otra cosa)

| Nombre | Uso |
|---|---|
| `play` | Disparado por evento `play` desde CasparCG. Puede ser stage. |
| `stop` | Disparado por evento `stop` desde CasparCG. **No** debería ser stage. |
| `bola1`, `bola2`, ..., `bola6` | Disparados por `entrada1`..`entrada6` (custom bingo). |

### Categoría 2: Stage markers

Definen el state machine multi-etapa. Llevan `name`, `type` y `order`.

**Forma limpia (recomendada para tools nuevas):**
```json
{ "tm": 0, "dr": 100, "cm": "play", "payload": { "name": "play", "type": "pause", "order": 1, "update": "update1" } }
```

**Forma compacta (equivalente, retrocompatible):**
```json
{ "tm": 0, "dr": 100, "cm": "{\"name\":\"play\",\"type\":\"pause\",\"order\":1,\"update\":\"update1\"}" }
```

`index.js` acepta cualquiera de las dos. Si `payload` es objeto, lo serializa a `cm` antes de pasárselo a Lottie.

#### Schema del payload

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `name` | string | Sí | Único entre TODOS los markers (no solo stages). Usado para `goto <name>` y para `goToAndPlay` interno |
| `type` | string | Sí | Exactamente `"loop"` o `"pause"` |
| `order` | number | Sí | Entero positivo. **Único entre stages**, secuencial recomendado (1, 2, 3, ...) |
| `update` | string | No | Nombre de otro marker (regular). Si está, se reproduce ese marker cuando llega data. Si no está, fallback al marker global `update` (si existe) |
| `updateDelay` | number | No | Frames a esperar dentro del update segment antes del text replacement. Default `0` |
| `stop` | string | No | Nombre de otro marker (regular). Si está, se reproduce ese cuando llega `stop` mientras este stage está activo (con `playSegments`, self-contained). Si no está, fallback al marker global `stop` |

#### Comportamiento al final del segmento (`tm + dr`)

- `loop`: salta a `tm` (loopea hasta `next`/`goto`).
- `pause`: ejecuta `anim.pause()` (queda detenido hasta `next`/`goto`).

Para pausar **exacto en `tm`** (sin reproducir un segmento previo), usar `dr: 0`.

#### Stage marker que también es `play`

El marker `play` puede ser un stage. Se invoca normalmente con el evento `play` desde CasparCG, y al terminar el segmento ejecuta el comportamiento de stage. Es el patrón recomendado cuando el primer stage del flujo coincide con la entrada.

```json
{ "tm": 0, "dr": 100, "cm": "play", "payload": { "name": "play", "type": "pause", "order": 1, "update": "update1" } }
```

### Categoría 3: Update markers

Son markers regulares (sin `type`/`order`) que se referencian desde un stage:

```json
{ "tm": 200, "dr": 30, "cm": "update1" }
```

- El `name` debe matchear el campo `update` de algún stage.
- Un mismo update marker puede ser referenciado por varios stages.
- Cuando termina la reproducción, la animación queda en el último frame del segmento (no vuelve al stage marker).

### Reglas de validación que el tool debería enforcear

✅ **Hacer:**
- Generar `tm`, `dr`, `cm` para todo marker
- Para regulars: `cm = "<name>"` (string simple, sin payload)
- Para stages: emitir `payload: { name, type, order, update?, updateDelay? }` como objeto (forma limpia). `cm` puede ser el nombre o irrelevante. Alternativamente `cm = JSON.stringify(payload)` sin campo `payload` (forma compacta) — `index.js` acepta ambas
- `payload.name` único en todo el set de markers
- `payload.order` único entre stages, idealmente secuencial sin huecos
- `dr >= 0` siempre
- Si un stage define `update`, el marker referenciado debe existir
- Asegurarse de incluir al menos el marker `play` y `stop` (no son obligatorios para que el index.js no crashee, pero CasparCG espera poder mandar play/stop)

❌ **NO hacer:**
- No reusar nombres entre markers
- No repetir `order` entre stages
- No usar `type` distinto de `"loop"` o `"pause"`
- No declarar `type` en update markers (los convertiría en stages, lo cual no querés)
- No declarar `update` apuntando a otro stage marker (debería apuntar a uno regular)
- No usar nombres reservados (`stop`, `bola1..6`) como name de stages
- No emitir un `payload` con `cm` también stringificado del mismo payload — usar uno o el otro

### Lo que NO está soportado (pre-eliminado o futuro)

| Feature | Estado | Workaround actual |
|---|---|---|
| `loopExternal: true` (loop en archivo separado) | Eliminado | No hay; pendiente de re-diseño |
| `loopDelay` (frames muertos entre iteraciones de loop) | Eliminado | Agregar frames "muertos" al final del segmento del loop |
| Marker `update` legacy (sin stage owner) | Eliminado | Cualquier data triggerea update solo si el stage actual lo declara |
| `prev` (navegación hacia atrás) | No implementado | Usar `goto <stageName>` para saltar atrás |
| Multiple updates por stage | No implementado | Un solo `update` por stage |

### Ejemplos completos

**Gráfico simple (entrada con pausa + salida) — forma limpia:**
```json
"markers": [
    { "tm": 0, "dr": 100, "cm": "play", "payload": { "name": "play", "type": "pause", "order": 1, "update": "update1" } },
    { "tm": 200, "dr": 30, "cm": "update1" },
    { "tm": 500, "dr": 100, "cm": "stop" }
]
```

**Gráfico multi-etapa (entrada → loop → pausa → salida) — forma limpia:**
```json
"markers": [
    { "tm": 0, "dr": 50, "cm": "play" },
    { "tm": 50, "dr": 60, "cm": "intro", "payload": { "name": "intro", "type": "loop", "order": 1 } },
    { "tm": 200, "dr": 100, "cm": "detalle", "payload": { "name": "detalle", "type": "pause", "order": 2, "update": "update_detalle" } },
    { "tm": 350, "dr": 40, "cm": "update_detalle" },
    { "tm": 500, "dr": 100, "cm": "stop" }
]
```

**Update marker compartido entre stages — forma limpia:**
```json
"markers": [
    { "tm": 0, "dr": 50, "cm": "play", "payload": { "name": "play", "type": "pause", "order": 1, "update": "fade" } },
    { "tm": 100, "dr": 50, "cm": "detalle", "payload": { "name": "detalle", "type": "pause", "order": 2, "update": "fade" } },
    { "tm": 200, "dr": 30, "cm": "fade" },
    { "tm": 400, "dr": 100, "cm": "stop" }
]
```

**Equivalente compacto (todo en `cm` stringificado):**
```json
"markers": [
    { "tm": 0, "dr": 100, "cm": "{\"name\":\"play\",\"type\":\"pause\",\"order\":1,\"update\":\"update1\"}" },
    { "tm": 200, "dr": 30, "cm": "update1" },
    { "tm": 500, "dr": 100, "cm": "stop" }
]
```
