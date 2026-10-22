# CLAUDE.md

Base de templates HTML para gráficos Lottie en CasparCG (webcg-framework).

## Este repo: LVBP para Venevisión

Gráficos de la LVBP para Venevisión. Repo público, armado el 2026-10-13 desde HTML-templates
(c759d52) con los arreglos generales de `index.js` que tenía LVBP-Meridiano (ver *Modelo del
proyecto*). Ocho gráficos, en LT Energy: el score y el parcial con `font/LTEnergyVFVF.ttf` (fuente
variable con un solo eje, `ital`, que por defecto es la Regular) y la defensiva, la ofensiva, el
bateador, el lanzador, el 3 en línea y los otros juegos con `font/LTEnergy-Regular.ttf`, la estática
que mandó el diseñador con sus primeros exports (los del 2026-10-18 traen la variable: mide igual, y
en el render difiere en el suavizado de algunos bordes de letra; los del 3 en línea y los otros
juegos, del 2026-10-22, otra vez la estática). Los otros juegos llevan además Chakra Petch Bold
(`font/ChakraPetch-Bold.ttf`, libre, de Google Fonts) en el título y las carreras. Las keys del
UPDATE están en su `data.md`.

| Carpeta | Qué es | Flujo | Salida |
|---|---|---|---|
| `score/` | Pizarra arriba a la izquierda: logo (ATRAPA LA EMOCIÓN), barras de visita y local (escudo y siglas), carreras, inning con sus flechas, bases, conteo y outs; abajo, la barra de bateador (apellido, average, actuación) y lanzador (apellido, lanzamientos, velocidad) | `play` (0–59) → stages `marcador` → `jugadores` (la barra sube, 65–90) → `sinjugadores` (la barra baja, 100–125), los tres `pause` | `salida`: la entrada al revés (2 s); desde `jugadores`, `salida_jugadores` baja antes la barra (3 s) |
| `defensiva/` | Pantalla completa: dos compuertas con los colores y el escudo del equipo se abren sobre el campo con las 9 posiciones (rótulo y apellido); arriba a la izquierda, la barra del equipo y DEFENSIVA. El frame 0 está vacío | stage `play` pause (0–53) | `salida`: la entrada al revés (1,8 s): las compuertas se cierran y termina en el frame vacío |
| `ofensiva/` | Pantalla completa, de la familia de la defensiva: dos compuertas con los colores y el escudo del equipo se abren sobre el lineup (9 filas de posición y nombre) y el mánager; arriba a la izquierda, la barra del equipo y OFENSIVA. El frame 0 está vacío | stage `play` pause (0–90) | `salida`: la entrada al revés (3 s) |
| `bateador/` | Barra baja del bateador, abajo a la izquierda: arriba, una barra negra con el split; a la izquierda, el fondo del color del equipo con su escudo grande; la barra del equipo con el nombre, y el número y la posición en sus placas; abajo, 4 estadísticas (valor y rótulo). El frame 0 está vacío | stage `play` pause (0–87) | `salida`: la entrada al revés (2,9 s) |
| `lanzador/` | El lanzador (el export es PITCHERS), en la mitad izquierda: un panel del color del equipo con su escudo grande, de arriba abajo en el borde izquierdo; la barra del equipo con el nombre y el apellido (dos líneas) y el número, y debajo una barra negra con el split; la mano de lanzar y 6 estadísticas (rótulo y valor) sobre una textura gris. El frame 0 está vacío | stage `play` pause (0–110) | `salida`: la entrada al revés (3,7 s) |
| `parcial/` | Score de fin de inning (el export es FINAL DE INNING), abajo, casi centrado (35 px a la izquierda): barras de visita y local (escudo y nombre), C H E de cada uno, inning con sus flechas, los tres que vienen AL BATE (posición y apellido) y el cuadro de Pepsi (fijo: una secuencia de PNG). El frame 0 está vacío | stage `play` pause (0–222): la pizarra entra hasta el 41, el cuadro de Pepsi hasta el 73 y le pasa un brillo del 181 al 220 | `salida`: el cuadro de Pepsi sale como lo animó el diseñador y después la pizarra, su entrada al revés (3,9 s) |
| `tresenlinea/` | Los tres que vienen al bate (el export es 3 EN LINEA), abajo a la derecha: un panel de Empire Keeway entra con sus logos y se va, y queda la caja, la banda naranja con el 3 EN LÍNEA y el recuadro azul con los tres nombres (todo una secuencia de PNG, salvo los nombres). El frame 0 está vacío | stage `play` pause (0–197): la caja crece del 16 al 43, los nombres aparecen del 40 al 60 y el panel se va del 177 al 193 | `salida`: los nombres y la caja, su entrada al revés, sin el panel (1,5 s) |
| `otrosjuegos/` | Cómo van los otros juegos (el export es OTROS JUEGOS; el título, ASÍ VAN), una columna abajo a la derecha: arriba, un cuadro de Harina PAN entra, arma su logo y se va (una secuencia de JPG); debajo, el título y tres juegos, cada uno con la sede, las barras de visita y local (escudo y nombre), las carreras y el inning con sus flechas. El frame 0 está vacío | stage `play` pause (0–166): el cuadro entra del 11 al 23, la columna del 27 al 95 (un juego detrás del otro) y el cuadro se va del 157 al 164. Con menos juegos, `play` y enseguida `goto` a `dosjuegos` (300–466) o `unjuego` (600–766), el mismo gráfico con 2 o 1 juegos | `salida`: la columna, su entrada al revés, sin el cuadro (2,3 s); `salida2` (1,9 s) y `salida1` (1,3 s) |

Cómo se ve, en [capturas/](capturas/): `score.png` (pantalla completa con data de ejemplo y la barra
arriba), `score_marcador.png` (sin la barra) y `score_equipos.png` (los 56 cruces
`visita_vs_local`), del 2026-10-22; `defensiva.png` / `ofensiva.png` (Leones, con nombres de
ejemplo) y `defensiva_equipos.png` / `ofensiva_equipos.png` (los 8 equipos), las de la defensiva del
2026-10-21 y las de la ofensiva del 2026-10-17; `bateador.png` / `lanzador.png` (Leones, con data de
ejemplo) y `bateador_equipos.png` / `lanzador_equipos.png` (los 8 equipos, recortado al gráfico),
las del bateador del 2026-10-18 y las del lanzador del 2026-10-21; `parcial.png` (pantalla completa
con el ejemplo de su `data.md`, Magallanes y Cardenales) y `parcial_equipos.png` (los 56 cruces
`visita_vs_local`, recortado a la pizarra), del 2026-10-18; `tresenlinea.png` (pantalla completa con
el ejemplo de su `data.md`, en la pausa) y `tresenlinea_panel.png` (en el 120, con el panel), del
2026-10-22; `otrosjuegos.png` (pantalla completa con el ejemplo de su `data.md`, en la pausa),
`otrosjuegos_panel.png` (en el 120, con el cuadro de Harina PAN), `otrosjuegos_equipos.png` (8
casos que ponen cada equipo en las 6 filas, recortado al gráfico) y `otrosjuegos_dosjuegos.png` /
`otrosjuegos_unjuego.png` (los tramos de 2 y 1 juegos, en su pausa), del 2026-10-22. Si un gráfico
cambia, hay que
regenerarlas (las de Leones, con el ejemplo de su `data.md`, en el último frame de la entrada). No
entran al zip (`.gitattributes`).

No hay video de referencia del diseñador, y ningún export trae salida (los markers `stop` del score,
90–120, de la defensiva, 60–90, de la ofensiva y el bateador, 90–120, y del lanzador, 120–150, no
animan nada) ni la bajada de la barra de jugadores del score: son la animación de entrada al revés,
como en todos los gráficos de Meridiano. Si el diseñador manda una salida propia, reemplaza a ésta:
el cuadro de Pepsi del parcial trae la suya, y la pizarra sale después, al revés. En el 3 en línea
(su `stop`, 210–240, tampoco anima) la entrada al revés traería de vuelta el panel: sale la caja sola.
En los otros juegos (su `STOP`, 167–197, tampoco), lo mismo: sale la columna, sin el cuadro de PAN.

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

Logo: desde el export del 2026-10-22 es el de ATRAPA LA EMOCIÓN, una imagen (`images/img_0.png`),
en lugar de la V de Venevisión en vectores; lo demás del score no cambió (comparado capa por capa y
frame a frame, ver la receta). Su caja y las dos barras plateadas de los lados crecieron hasta el
alto de la barra de jugadores (y 54–158): con la barra abajo, la caja queda colgando debajo de la
pizarra. El logo entra girando en 3D (Lottie lo pinta sin perspectiva, casi igual), con una sombra
blanca, y le pasa un brillo del 29 al 58 en Add, que Lottie no pinta (salía una mancha gris): el JSON
lo lleva en Screen y el `index.html` en `plus-lighter`, que es el Add (`g[mask]:has(> #brillo)`; en
CasparCG 2.5.1 sale igual que en Chromium, y donde no lo haya queda el Screen). Por el brillo, la
pausa del marcador pasó del 53 al 58 (en el 53 quedaba quieto sobre la A) y la salida dura 2 s
(antes 1,8). Con el blend en la página, Chromium compone el SVG de otra manera: fuera del logo
quedan hasta 3 niveles de diferencia en una columna y, en el frame 25, el borde de 1 px de la caja
de la derecha cuando empieza a abrirse.

Outs: desde el segundo export del 2026-10-22 (`SCOREBUG_3.zip`) son del cian de los textos
(`#00D9E2`); antes, magenta (`#EA0059`). Es lo único que cambió en ese export, que trae además el
fondo de referencia del diseñador (ver la receta).

Colores en NTSC compuesto (2026-10-17, con setup de 7,5 IRE): las 16 barras de equipo quedan
legales (la más alta, Leones, 106 IRE; ninguna baja de −7). Pasan de 110 IRE, sin llegar a 120, el
cian de los textos y la flecha del inning (`#00D9E2`, 113,5) y el amarillo de las bases (`#FCC107`,
114,4): quedan así (Leon). En HD (Rec.709) todo es legal. Si hiciera falta bajarlos a 110:
`#0BD4DD` y `#F4C11D`. Los outs, del mismo cian desde el 2026-10-22. El logo de ATRAPA LA EMOCIÓN (2026-10-22), en la pausa: lo más alto el
amarillo de las letras (`#FBC20D`, 113,7) y lo más bajo el magenta (`#EA0058`, −12,5). Durante el
brillo, el cian de LA EMOCIÓN pasa de 120 por unos frames (del 21 al 49, hasta 126 en unos 40 px):
en AE pasa lo mismo, es el Add.

Barras de equipo: son **imágenes** (`images/img_1–8` local, `img_9–16` visita, con el escudo como
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
vez que se prepare.
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
Meridiano (`F.RODRIGUEZ`), en cuerpo 25, el de los rótulos (el export los trae en 20: Leon,
2026-10-21, con una captura de AE donde APELLIDO llena su barra azul): al tamaño del diseño entran
unas 8 letras (`APELLIDO`, `R.LOPEZ`; `E.ROSARIO` baja a 23–24, `F.RODRÍGUEZ` a 19–20,
`A.CAMPUSANO` a 16–17, según la barra); más largos encogen dentro de su barra azul, y uno que encoge
queda arriba en ella (la caja de Lottie no centra en vertical). Es de pantalla completa desde
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

Color de Águilas y Leones: cada barra es del mismo color en todos los gráficos, y en los otros seis
equipos la puerta es del tono de su barra, pero en éstos dos no: Águilas tiene la barra naranja
rojiza (`#F64D25`, tono 12°) y las puertas llegaban ámbar (`#FF8400`, 31°); Leones, la barra ámbar
(`#FDAD36`, 36°) y las puertas amarillas (`#FFD200`, 49°). Con ellas, las de la defensiva. Van con
el tono de la barra y el brillo que el diseñador le dio a cada uno: el claro es la barra llevada a
255 (`#FF5026`, `#FFAE36`) y los otros dos stops, en la proporción del export (`COLOR_PUERTA` en
`prep.js`). Los eligió Leon el 2026-10-17, cada uno entre ése y uno más oscuro (el de Águilas, como
Caribes, quedaba casi igual a Caribes). En NTSC compuesto, lo más alto de las puertas de Leones (con
el escudo) baja de 123 IRE a 106, lo de su barra. El bateador y el lanzador traen sus propios
colores desde el export del 2026-10-18 (ver ahí): Águilas y Leones, con el tono de su barra, y todos
más claros que las puertas.

Textos: nombre y apellido, como en el diseño y en Meridiano (`ALÍ CASTILLO`). Al tamaño del diseño
entran unas 21 letras en las filas (`ALEXANDER MONASTERIOS` entra) y 19 en el mánager; más largos
encogen dentro de su barra, igual en todas las filas. El título llega diciendo DEFENSIVA (copiado de
la defensiva): `prep.js` lo pasa a OFENSIVA.

**Bateador.** La barra baja. El export del 2026-10-18 reemplazó al del 2026-10-16 (Leon): es el mismo
diseño al 64 %, más arriba (x 0–1058, y 752–1019, adentro de la zona segura de títulos), con una
barra negra encima para el split, sus propios colores de equipo y todo colgado de un nulo nuevo,
`Null 5`, al 130 %. Claves: las de la barra de bateador de LVBP-Meridiano (`bateador/`), para que el
controlador le mande a las dos la misma data: `nombrejugador` (nombre y apellido),
`numerouniforme`, `posicion`, `valor1`…`valor4` / `etiqueta1`…`etiqueta4` (casilleros genéricos, de
izquierda a derecha: el AVE / HR / CI / OPS del diseño es sólo el texto por defecto),
`informacionbarranegra` (el split, en la barra negra: como en Meridiano, siempre al aire; Leon,
2026-10-18) y `<SIGLAS>_opacidad`. No tiene `titulo`. Todos los textos arrancan vacíos (Leon,
2026-10-18): lo que el controlador no manda no sale, en vez del texto de ejemplo del diseño. El
split también: hasta la `0.11.0` de cue-qs-beisbol no se manda, y la barra negra sale vacía.

Equipo: cada clave prende tres capas, la barra del nombre (imagen, con el escudo de marca de agua),
el fondo de color de la izquierda (forma con degradado) y el escudo grande encima (imagen en
*overlay*, mateada con su `MASK`). Por eso la clase se repite a propósito, como en la defensiva.
Empiezan ocultas (CSS de `index.html`, como el bateador de Meridiano): el controlador manda `1` al
que batea y `0` a los otros siete. Sin equipo no se ven la barra ni el fondo: el nombre queda sobre
la textura gris y la placa negra del número, entera. Los fondos van con los colores del diseñador
(Leon, 2026-10-18): el export anterior traía el mismo naranja en siete equipos y se les ponían las
puertas de la ofensiva, más oscuras. El escudo va en *overlay*, que a lo sumo duplica el brillo del
fondo: sobre el de Tigres, casi negro, apenas se ve. Lleva lo mismo que su escudo en las puertas de
la ofensiva, *color dodge* con el Fill gris (`BAT_DODGE` en `prep.js`), al 70 %: se ve como el de
Tiburones, el criterio de Leon (2026-10-16, cuando fue al 85 % sobre el fondo más oscuro). Comparado
el 2026-10-18 con el *overlay* del diseño, 50, 60, 75, 80 y 85.

Textos: en mayúsculas. El nombre, como en Meridiano (`ISAIAS TEJEDA`): al tamaño del diseño entran
unas 19 letras (`AEVERSON ARTEAGA` entra; `ALEXANDER MONASTERIOS` baja de 55 a 48); más largos
encogen dentro de la barra. El split, unas 30 (`TEMPORADA 2026-27 · VS ZURDOS` entra). El número
entra con 3 cifras y la posición con 3 letras. Cada valor va alineado a la derecha contra su rótulo
y crece hacia la izquierda (un `8` queda junto a su HR, como el `00` del diseño): `1.000` entra al
tamaño del diseño en los casilleros 1, 2 y 4, y en el 3, el más angosto, encoge un poco. Los
rótulos, unas 3 letras.

Key: la barra negra del split y lo de abajo (el fondo y la barra del nombre) se tocan borde con
borde: en el key de CasparCG quedaba una fila de 1 px al 58–69 %, una línea finita de video al aire
(como en el parcial). La barra negra crece 2 px hacia abajo (`BAT_COSTURA`), por debajo del fondo y
por encima de la barra del nombre, que ahí arriba es casi negra. Queda un píxel suelto al 90 % donde
termina la barra gris de las estadísticas (x 308, y 988), en una esquina.

Colores en NTSC compuesto (2026-10-18, con setup de 7,5 IRE): todo legal salvo el escudo de Leones,
que en sus brillos llega a 121,4 IRE (el *overlay* lleva a 255 el rojo y el verde del amarillo
debajo de lo blanco del escudo; con el fondo de la ofensiva llegaba a 121, y antes a 131). Lo más
bajo, Cardenales, −8,6. En HD (Rec.709) todo es legal.

**Lanzador.** El export es PITCHERS; la carpeta, como su equivalente de Meridiano (Leon). El del
2026-10-21 reemplazó al del 2026-10-18 (Leon): es el mismo diseño al 80 %, con una barra negra para el
split debajo del nombre y las estadísticas 44 px más abajo para hacerle lugar, todo colgado de un nulo
nuevo, `Null 7`, que en la entrada se corre 174 px a la derecha; trae también otro degradado en la
línea plateada, más oscuro. En la mitad izquierda: el panel de color del equipo con su escudo grande,
del borde de arriba al de abajo (x 0–630), y a su derecha la barra del equipo con el nombre, el
apellido y el número (y 166–288), la barra negra del split (y 292–345) y el panel de estadísticas
(hasta x 1061, y 901). Claves: las del lanzador de LVBP-Meridiano donde dicen lo mismo,
`manodelanzar`, `informacionbarranegra` (el split; como en el bateador, siempre al aire),
`etiqueta1`…`etiqueta6` / `valor1`…`valor6` (casilleros genéricos, de arriba abajo: el G-P / EFE / BB /
SO / WHIP / IL del diseño es sólo el texto por defecto) y `<SIGLAS>_opacidad`; `numerouniforme`, la
del bateador. Propias: `nombre` y `apellido`, en dos líneas (Leon, 2026-10-18; la `nombrelanzador` de
Meridiano es el nombre completo en una). No tiene `titulo` ni `logomeridiano`. Todos los textos
arrancan vacíos, como en el bateador. El split también: lo mandan LVBP-Stats desde la 2.3.0.15 y
cue-qs-beisbol desde la 0.13.0 (2026-10-21); con una versión anterior, la barra negra sale vacía.

Equipo: cada clave prende tres capas, el panel de color (forma con degradado), el escudo grande
encima (imagen en *overlay*, al 49 %) y la barra del nombre (imagen, con el escudo de marca de
agua), así que la clase se repite a propósito. Empiezan ocultas (CSS de `index.html`): el
controlador manda `1` al que lanza y `0` a los otros siete. Sin equipo no se ven el panel ni la
barra: quedan la línea plateada, la barra negra del split y las filas azules de las estadísticas,
enteras hasta el borde izquierdo. Los colores, los del diseñador (Leon, 2026-10-18): parecidos a los
del bateador, salvo Tigres, azul acá y casi negro allá. El 49 % del escudo va en el CSS de su
`<image>` (`g[id^="escudo"] > image`, por el `ln` `escudo<SIGLAS>`), como el de las compuertas: el
UPDATE escribe su `opacity` en la capa y lo pisaría con un 1 (el escudo salía al 100 % y el panel,
mucho más claro). La barra de Bravos no vino en el export: es la del bateador
(`images/barra_bravos.png`, la misma serie de barras).

Textos: en mayúsculas. El nombre y el apellido, cada uno en su caja: entran unas 9 letras en cada
línea (`ALEXANDER`, `RODRÍGUEZ`; `MONASTERIOS` baja de 55 a 44), y cada línea encoge por su lado.
El número entra con 2 cifras (`100` baja de 80 a 74), la mano con 2 letras. El split, unas 21
(`TEMPORADA 2026-27`; `TEMPORADA 2026-27 · VS ZURDOS` baja de 55 a 42 y `· COMO RELEVISTA` a 36, y
queda arriba en la barra, como en el bateador). Los rótulos, alineados a la izquierda en su columna,
unas 4 letras (`WHIP`, `K-BB`); los valores, centrados en la suya, hasta 6 caracteres (`100-20`,
`130.2`). Las cajas son las del export anterior: al 80 %, las mismas medidas en unidades de la capa.

Key: la barra negra del split queda 4 px debajo de la del nombre, sin tocarla. En el key de CasparCG
no hay filas ni columnas a menos de 255 donde se tocan los recuadros: quedan 4 píxeles sueltos, al
88–95 %, en las puntas de las diagonales (x 458–587).

Colores en NTSC compuesto (2026-10-18): legal salvo el escudo de Leones, que llega a 121,2 IRE en
sus brillos sobre lo claro del panel (más área que en el bateador), y el cian de los rótulos, la
mano y el split (`#00D9E2`, 113,5, como el del score). Lo más bajo, Cardenales, −8,6. Si hiciera
falta bajar Leones a 120, el panel o el escudo un poco más oscuros. En HD (Rec.709) todo es legal. El
export del 2026-10-21 no los cambia: medidos los 8 equipos con el mismo método, lo más alto y lo más
bajo de cada uno da igual que con el anterior (la barra negra y la línea plateada nueva quedan en el
medio).

**Parcial.** El score de fin de inning; el diseñador lo llama FINAL DE INNING, y la carpeta se llama
como su equivalente de Meridiano (Leon, 2026-10-17). Claves: las del parcial de LVBP-Meridiano, que
a su vez son las del score donde dicen lo mismo, para que el controlador les mande a los tres la
misma data: `<SIGLAS>VISITA_opacidad` / `<SIGLAS>LOCAL_opacidad`, `inning`,
`INNINGarriba_opacidad` / `INNINGabajo_opacidad`, `CARRERASVISITA`, `HITSVISITA`, `ERRORESVISITA`
(y `LOCAL`), `jugador1`…`jugador3` y `titulo_jugadores` (el AL BATE). No tiene `titulo` ni
`publicidad`. Propias: `posicion1`…`posicion3` (la posición de cada bateador, en su capa, como en la
ofensiva), `NOMBREVISITA` / `NOMBRELOCAL`, el nombre escrito sobre la barra (`AGUILAS`; en el score,
`EQUIPOVISITA` son las siglas, y por eso no se reusa), y los rótulos fijos `rotulocarreras`,
`rotulohits`, `rotuloerrores` (la C, la H y la E). El payload del parcial de Meridiano no trae los
nombres ni las posiciones: el controlador tiene que mandarlos siempre, o quedan al aire los del
diseño (AGUILAS y LEONES) sobre las barras de otros equipos.

Barras de equipo: imágenes apiladas, las 8 de cada fila, cada una con su máscara (un track matte),
todas visibles al arrancar, como en el score: el controlador manda `1` a la que va en cada fila y
`0` a las otras siete. Sin data queda arriba Bravos, en las dos filas.

Textos: en mayúsculas. Cada bateador es la posición (cian, centrada en su caja: entra cualquiera de
dos letras, DH mide 33 de 40) y el apellido (blanco, alineado a la izquierda): entran unas 8 letras
(`CASTILLO`); más largos encogen dentro de la columna (`RODRÍGUEZ` baja de 30 a 28, `MONASTERIOS` a
22). Los nombres de equipo, unas 10 letras (`MAGALLANES`, `CARDENALES`); los números, dos cifras; el
inning, dos. Todo en una línea: un texto muy largo encoge, no parte.

Cuadro de Pepsi: fijo, sin claves (Leon, 2026-10-17, entre arreglarlo, una publicidad genérica como
la de Meridiano o sacarlo). Los dos primeros exports (2026-10-17) lo traían en vectores y con
problemas que no se podían resolver sin adivinar: una imagen que faltaba, letras que se veían antes
que el recuadro, un círculo suelto, un final a medio hacer, y el PEPSI blanco de la captura de AE del
diseñador, que no llegaba al JSON. Desde el export del 2026-10-18 es una **secuencia de PNG** (Leon):
un precomp de 262 frames de 334 × 208 (0,8 MB), a escala 1, con el brillo y su salida tal como en
AE. Flujo (Leon, 2026-10-18): la pizarra entra del 0 al 41, el cuadro del 37 al 73, el logo queda
quieto, le pasa un brillo (181–220) y la entrada para en el 221; la salida es la del diseñador para
el cuadro (222–295: las letras se van, el logo se vuelve un punto y el recuadro se cierra) y después
la pizarra, que el export no saca (la corta en el 297): su entrada al revés, del 296 al 337 (3,9 s
en total). No es un loop.

Pendiente con el diseñador: los PNG vienen reducidos a una paleta de unos 40 colores con tramado (la
compresión de imágenes de Bodymovin): en el brillo se ve la trama y, como cada frame se trama
distinto, los bordes del logo titilaban entre frames (hasta 55–88 niveles en unos 600 px) aunque
estuviera quieto. Mientras tanto, en el tramo quieto (del 76 al 171, antes del brillo) se ve un solo
PNG (`PAR_QUIETO`, Leon, 2026-10-18), y en la pausa no titila: es un solo frame. Hace falta la
secuencia con color completo (mismos nombres y tamaños: se reemplazan los archivos y `PAR_QUIETO`
pasa a `null`). Y no hay un frame limpio después del brillo: en el 221 todavía queda un resto en la
esquina de arriba a la izquierda (sale del todo en el 224, cuando las letras ya se van), y el logo
chico queda 1 px corrido respecto del de antes del brillo, así que no se puede pausar en otro frame
sin un salto. Si el diseñador deja unos frames limpios después del brillo, mover `PAR_PAUSA`.

Key: los recuadros de la pizarra se tocan borde con borde, y dos bordes suavizados que caen en el
mismo píxel no suman 100 %: en el key de CasparCG quedaban columnas de 1 px al 86–94 % (entre el
nombre y los números, los números y los bateadores, y los bateadores y la raya del cuadro de Pepsi),
una línea finita de video al aire. Los números y los bateadores crecen 1 px sobre el vecino y el key
queda lleno (las barras, 1 px más cortas debajo del nombre).

Colores en NTSC compuesto (2026-10-17, con setup de 7,5 IRE): las barras de los 8 equipos, medidas
en los 56 cruces del primer export, quedan legales (la más alta, Leones, 106 IRE; la más baja,
Cardenales, −7,1); el cian de los números y las posiciones y el amarillo del AL BATE son los del
score (113,5 y 114,4 IRE): quedan así, como allá. En la secuencia de Pepsi (2026-10-18), lo más alto
es el blanco (100 IRE) y el azul de Pepsi baja a −14,2 IRE, legal hasta −20; si hiciera falta subirlo
a −7, `#1032FF` (en los PNG del diseñador). En HD (Rec.709) todo es legal.

**3 en línea.** Los tres que vienen al bate; el export es 3 EN LINEA, y la carpeta, `tresenlinea`
(Leon, 2026-10-22). Abajo a la derecha, un panel de Empire Keeway entra, pasa sus logos con un brillo
y se va por la derecha; debajo crece la caja: la columna y la banda naranjas con el título 3 EN
LÍNEA, y el recuadro azul con los tres nombres. Todo es una secuencia de PNG (un precomp de 198
frames y una imagen fija para la pausa) más los tres textos: lo único editable son los nombres.
Claves: las de los bateadores del parcial, `jugador1`…`jugador3` (de arriba abajo), para que el
controlador les mande a los dos la misma clave; no tiene `posicion` ni `titulo_jugadores` (el título
es parte de la imagen). Los textos arrancan vacíos (Leon, 2026-10-22), como en el bateador.

Nombres: la inicial y el apellido (`J. CASTILLO`; Leon pidió decidirlo por el espacio, 2026-10-22).
Al tamaño del diseño (cuerpo 40) entran unos 12 caracteres. De 20 nombres de prueba, con el nombre
completo encogían 16 (`ALEXANDER MONASTERIOS` a 23) y los tres renglones quedaban de tamaños
distintos; con la inicial, 2, y poco (`A. MONASTERIOS` a 36, `C. CASTELLANOS` a 37); con el apellido
solo entran todos, pero el recuadro queda medio vacío. El parcial recibe el apellido solo: la clave
es la misma, el texto no. En mayúsculas, como en los demás. Aparecen letra por letra (un animador de
opacidad), uno detrás del otro, del 40 al 60.

Imágenes: el export las trae a 1920 × 1080 para un gráfico de 479 × 525, y `tresenlinea.py` las
recorta, sin pérdida (el render queda idéntico al píxel). En CasparCG (1080p29.97, render por CPU), a
pantalla completa se repetían 52 de los 186 frames de la entrada (se veía a saltos) y la página
usaba un núcleo entero; recortadas, ninguno (sólo los que la secuencia ya trae iguales) y un 10 % de
núcleo.

Salida: el export no trae, y la entrada al revés dura 6,5 s y traería de vuelta el panel. Es la
entrada de la caja y los nombres al revés, sin el panel (Leon, 2026-10-22, que no espera más nada
del diseñador): los nombres se apagan del último al primero, el recuadro azul se cierra hacia
arriba, el título sale por la derecha, la banda se recoge y la columna se afina hasta desaparecer
(1,5 s). Los frames de la caja son los de la secuencia (16–43) sin el panel, que los tapa por arriba
(desde la y 753 hasta su borde de abajo, en la 770 en el 16 y en la 755 desde el 21): `tresenlinea.py`
repone esas filas con la imagen fija, al ancho que tiene la caja en la primera fila limpia (la columna
y la banda son rectángulos).

Queda así (el diseñador no manda más): los PNG vienen reducidos a una paleta de 24 a 60 colores con
tramado, como el Pepsi del parcial. En el degradado azul del panel y en su brillo se ve la trama y,
como cada frame se trama distinto, el fondo del panel hierve (3,7 niveles por frame en promedio; un
7 % de los píxeles, más de 10), y los bordes de la caja y del título cambian de un frame a otro
mientras está el panel. En la pausa es una sola imagen y no titila. A diferencia del Pepsi, no hay
tramo quieto que congelar: los logos se mueven todo el tiempo.

Renglones: llegaban cada 46 y 44 px (márgenes de 11 y 14 en el recuadro azul, y 807–951): van cada
45, con el de arriba y el de abajo 1 px más abajo (márgenes de 12 y 13).

Key: la caja es un solo PNG. En la pausa el key es 255 en todo el recuadro, salvo el borde de afuera
de la derecha (x 1757, al 31 %, el suavizado del diseño); en la salida, sin huecos. Mientras sale el
panel (180–192), la fila de arriba de la banda (y 753) queda al 94 %, como en el export: es el borde
de afuera.

Colores en NTSC compuesto (2026-10-22, con setup de 7,5 IRE, en todos los colores de la secuencia):
todo legal; lo más alto, un naranja claro del panel (103,4 IRE), y lo más bajo, su azul (−1,1). En
HD (Rec.709), también.

**Otros juegos.** Cómo van los otros juegos de la jornada; el export es OTROS JUEGOS, y la carpeta,
`otrosjuegos` (el título dice ASÍ VAN). Una columna abajo a la derecha (x 1415–1732): arriba, un
cuadro de Harina PAN (una secuencia de JPG) entra por la derecha, abre sus puertas, arma su logo y se
va por la derecha; debajo, una raya gris, el título y tres juegos, cada uno con la sede en una banda
azul, las barras de visita (arriba) y local con el nombre del equipo y, en un cuadro negro, las
carreras y el inning con sus flechas. Meridiano no tiene uno así. Claves: las del score y el parcial
donde dicen lo mismo, con el número del juego al final (1 arriba, 3 abajo): `<SIGLAS>VISITA1_opacidad`
/ `<SIGLAS>LOCAL1_opacidad`, `CARRERASVISITA1` / `CARRERASLOCAL1`, `inning1`,
`INNINGarriba1_opacidad` / `INNINGabajo1_opacidad` y, del parcial, `NOMBREVISITA1` / `NOMBRELOCAL1`
(el nombre escrito sobre la barra). Propias: `sede1`…`sede3` (el texto entero: EN CARACAS) y `titulo`
(ASÍ VAN). Los textos arrancan vacíos, como en el bateador, salvo el título: si no llega, queda ASÍ
VAN.

Días con menos juegos (Leon, 2026-10-22, sin pedirle nada al diseñador): la misma timeline trae dos
tramos más, cada uno el gráfico entero (entrada, pausa y salida) con los juegos de arriba: 2 juegos
desde el 300 (stage `dosjuegos`, salida `salida2`) y 1 desde el 600 (`unjuego`, `salida1`). Pausar
antes el de tres no servía: los juegos entran encimados (el 2 empieza antes de que termine el 1) y el
cuadro de PAN arma su logo hasta el 93, así que quedaba a medias. Cada tramo es una copia de sus capas
con las mismas clases (un UPDATE llena los tres; el lint deja repetir una clase una vez por tramo). La
columna baja hasta terminar donde termina la de tres (111 y 223 px, enteros: idéntica al píxel a la de
tres corrida), y su último juego termina como el 3: las barras locales, 1,25 px antes que su cuadro
negro (en el de tres, la banda de abajo las tapa). Se llega con `play` y enseguida `goto('dosjuegos')`
o `goto('unjuego')`: `goto` solo no pone el gráfico al aire (`index.js` no pausa los stages sin el
`play`, y webcg descarta el `CG STOP` de un gráfico que no está en play). Los primeros 12 frames del
tramo de tres están vacíos: en CasparCG, con los dos comandos seguidos, lo primero que se ve ya es el
tramo pedido. `next` saltaría de un tramo al siguiente: no se manda.

Barras de equipo: como en el score, imágenes apiladas, las 8 de cada fila con su máscara, todas
visibles al arrancar: el controlador manda `1` a la que va y `0` a las otras siete, en cada fila. Sin
data queda Leones en todas. Son como las del score, pero no los mismos archivos. La de Leones visita
del juego 1 llegaba como otra `BARRALEONESLOCAL`, con la imagen de la local: va con la de la visita (la
de los juegos 2 y 3).

Textos: en mayúsculas. Los nombres, desde donde empiezan en el diseño (x 1509) hasta 5 px antes del
cuadro negro: más largos pasaban por debajo de él. Entran al cuerpo del diseño (18) hasta TIBURONES;
MAGALLANES y CARDENALES bajan a 15. La sede, centrada sobre el eje del texto del diseño, con el ancho
de la banda: EN PUERTO LA CRUZ entra. El inning, centrado sobre el eje del 10 (entra `F`, y `FINAL`
más chico); las carreras ya llegaban centradas, y entran 3 cifras. El título encoge dentro de su caja.
La sede y los nombres entran letra por letra con un Fast Box Blur (radio 4 a 0), que Lottie no pinta:
va un Gaussian Blur equivalente (`OJ_BLUR` en `prep.js`), y entran desenfocados como en AE.

Cuadro de Harina PAN: fijo, sin claves. Una secuencia de 138 JPG de 316 × 200 a 25 fps en el gráfico a
29,97 (cada uno dura 1,2 frames: uno de cada seis se repite, como en AE). Sin alfa, pero el cuadro es
un rectángulo opaco en todos sus frames (las puertas azules del principio son del diseño): el lint
deja pasar JPG sólo en ese precomp. Desde el frame 78 de la secuencia (al aire, del 93,5 hasta que se
va) el logo está quieto, y como cada JPG se comprime distinto, sus bordes titilaban un poco (hasta 30
niveles en unos 25 px de un frame al otro): queda ese JPG solo (`OJ_QUIETO`), como el tramo quieto del
parcial. La capa del cuadro termina en el 164, cuando le quedan 11 px en pantalla: no se nota el corte.

Salida: el export no trae, y la entrada al revés traería de vuelta el cuadro. Es la entrada de la
columna al revés, sin el cuadro, como en el 3 en línea: el juego 3 primero, después el 2 y el 1, el
título y la raya (2,3 s).

Key: los recuadros se tocan borde con borde, y en el key de CasparCG quedaban filas y columnas de 1 px
al 54–94 %: entre el título y la primera banda, entre cada banda y su juego, entre el cuadro negro y
la banda de abajo, entre la barra y el cuadro negro, y entre la visita y la local, una línea finita de
video al aire. Las barras no alcanzan a cubrirlas: los PNG traen la primera y la última fila
semitransparentes, la visita y la local se tocan con esas filas, y la máscara de Tigres local termina
1,3 px antes del cuadro negro. Debajo de las barras de cada juego va un fondo negro (`OJ_FONDO`), que
se ve sólo por esos bordes (las barras son oscuras arriba y el cuadro es negro) y aparece cuando
terminan de entrar las barras y el cuadro; la primera banda crece 1 px hacia arriba, por debajo del
título, y los cuadros negros 1 px hacia arriba y hacia abajo (el del juego 3, sólo hacia arriba), por
debajo de las bandas. Con los 8 equipos en las 6 filas, el key es 255 en toda la columna salvo los
bordes de afuera: la izquierda de las barras (el borde del PNG), la derecha del título (0,5 px más
angosto que las bandas) y abajo, donde las barras terminan 1,25 px antes que el cuadro negro. Una
fila con todas las barras en 0 muestra el fondo negro.

En CasparCG (1080p29.97, render por CPU) la entrada usa un núcleo y no repite frames: sólo los de la
cadencia de la secuencia, cuando nada más se mueve (el 25 y el 49).

No se pinta el CC Light Sweep de la raya gris de arriba: está quieto (sin keyframes) y por su centro
pasaría como un brillo fino sobre la raya. Sin una captura de AE no se sabe cómo se ve: pendiente con
el diseñador, si importa.

Colores en NTSC compuesto (2026-10-22, con setup de 7,5 IRE): las barras de los 8 equipos quedan
legales (la más alta, Leones, 106,1; la más baja, Cardenales, −6,5); el cian de la sede y las flechas
es el del score (113,5). En el cuadro de PAN, el amarillo de la marca (`#FEC200`) da 116 IRE en más de
medio cuadro, y la compresión del JPG lleva algunos píxeles a 119,7 (uno a 120,6 en un frame de la
entrada); el azul baja a −16,3, legal hasta −20. Quedan así, como el cian y el amarillo del score. En
HD (Rec.709) todo es legal.

### Cuando llega un export nuevo del diseñador

El score llega como `SCOREBUG.zip` (carpeta `SCOREBUG/` con `data.json`, `images/` y `FONT/`), la
defensiva como `DEFENSIVA.rar` y la ofensiva como `OFENSIVA.rar` (carpetas `DEFENSIVA/` y
`OFENSIVA/`; el `.rar` se abre con `unar`), el bateador como `LOWBAR_BATEADOR.zip` (antes `.rar`;
carpeta `LOWBAR BATEADOR/`, con espacio), el parcial como `FINAL_DE_INNING.zip` (carpeta `FINAL DE
INNING/`), el lanzador como `PITCHERS.zip` (carpeta `PITCHERS/`), el 3 en línea como
`3_EN_LINEA.zip` (carpeta `3 EN LINEA/`) y los otros juegos como `OTROS_JUEGOS.zip` (carpeta `OTROS
JUEGOS/`). La receta de los ocho es `herramientas/prep.js`, que
prepara los que encuentre (las imágenes del 3 en línea, antes, `herramientas/tresenlinea.py`):
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
- **Logo:** desde el export del 2026-10-22, `LOGO FINAL ATRAPA LA EMOCION_1.png` dos veces (la de
  arriba es el matte del brillo, `Shape Layer 8`), sin parent: `prep.js` corre lo que no cuelga del
  `Null 1` lo mismo que `CORRE`, les saca la clase `png` (no son claves) y pasa el brillo de Add
  (`bm` 16) a Screen (2), con `ln` `brillo` para el CSS. Falla si el brillo no es el Add mateado con
  el logo. El lint avisa de cualquier modo de fusión que Lottie no pinta (más de 15).
- **Fondo de referencia:** desde el segundo export del 2026-10-22, abajo de todo viene una foto de
  un estadio (`fauahncdwz67y2swnvml.jpg`, un JPG de 2208 × 1242 sin alfa): el fondo con el que el
  diseñador ve la pizarra en AE. Al aire taparía el video entero: `prep.js` saca la capa y su asset,
  y `img_17.jpg` no se copia. El lint avisa de un JPG en cualquier gráfico que no sea de pantalla
  completa.
- **Key:** la barra plateada de la izquierda del logo (`Shape Layer 5`) llega 0,45 px más a la
  izquierda que en el export del 2026-10-17 y ya no se toca con la caja: en el key de CasparCG
  quedaba una columna de 1 px al 87 % (x 101), de arriba abajo. Crece 1 px a la derecha, por debajo
  de la caja (como en el parcial); en la entrada (frames 1–17) se ve 1 px más ancha.
- **Markers:** los del diseñador (`start`, `hold`, `stop`) se reemplazan por los de la tabla de
  arriba. La entrada del marcador termina en el 58 (el brillo del logo; hasta el export del
  2026-10-17, en el 53, los outs) y la barra sube del 65 al 90: si eso cambia, mover `ENTRADA`,
  `SUBE` y `BAJA` en `prep.js` (falla si algún keyframe fuera de la barra pasa de `ENTRADA`). La bajada de la barra (100–125) la arma
  `prep.js` con los keyframes de la subida al revés (curvas invertidas); comprobado frame a frame
  contra la subida. El `stop` global está en el frame 0, que está vacío: un `stop` durante la
  entrada corta.
- **Imágenes:** las 17 PNG del export (`img_0` el logo, `img_1–16` las barras) van tal cual a
  `score/images/`; el JPG del fondo de referencia, no.

Comparado frame a frame contra el export del 2026-10-17 (sin correr y con la V azul, con el texto
del diseño): idéntico al píxel del 0 al 90, salvo la barra de Águilas local (su máscara).

El del 2026-10-22, contra el preparado anterior (`deepdiff.py` con `"Shape Layer 7=Shape Layer 5"
"Shape Layer 5=Shape Layer 4"`: el diseñador las renumeró): cambian sólo el logo, su caja y sus dos
barras plateadas (más altas, la de la izquierda corrida, y otras curvas en su entrada); las barras de
equipo son las mismas imágenes, un índice más arriba. Sin el blend del brillo, todo lo que no es el
logo queda idéntico al píxel al publicado (cada frame renderizado en su propia carga, ver *QA*).

El segundo del 2026-10-22 (`SCOREBUG_3.zip`), contra el primero: las mismas 17 imágenes y la misma
fuente, y en el JSON sólo cambia el color de los dos outs, más el fondo de referencia. Preparado, es
el anterior con los outs en cian; en el render cambian sólo los outs.

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
- **Cuerpo de los apellidos:** de 20 (24 en RF) a 25, el de los rótulos (`DEF_CUERPO`, ver arriba);
  RF, a la misma escala de pantalla que los demás (`DEF_ESCALA`). Crecen desde el centro de la letra
  (`ps[1]` sube la mitad de lo que crece el ascent): con APELLIDO, el centro queda donde estaba.
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
  equipo, sumar sus siglas al mapa. La defensiva lo toma de la ofensiva preparada.
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
  `.POSICIONDEJUGADOR` → `posicion`, `.INFORNACIONBARRAARRIBA` (así, con N) →
  `informacionbarranegra`; los rótulos `AVE`, `HR`, `CI`, `OPS` (sin clase) → `etiqueta1`…`4` y los
  valores `.AVERAGE`, `.JONRONES`, `.CARRERASIMPULSADAS`, `.OPSNUMERO` → `valor1`…`4`; las barras
  `.BARRA_<EQUIPO>_BATEO_1.png` (la de Bravos sin el `_1`; clase `… png`, dos clases), los fondos
  `.FONDO<EQUIPO>` y los escudos `.<EQUIPO>LOGO` → `<SIGLAS>_opacidad`; `TEXTURA BASE_1.png` (clase
  `png`) → `textura`. Las `MASK…` (los mattes de los escudos), las `Capa de formas` (la franja
  plateada, las placas del número y la posición, y la barra negra del split) y los nulos quedan como
  vienen, sin clase.
- **Nulo raíz:** desde el export del 2026-10-18 todo cuelga de `Null 5` (p `[783, 898]`, s 130 %): las
  cajas se calculan en px de pantalla con `enPantalla()` (compone la cadena de parents, como queda al
  final de la entrada). Si llega a otra escala, falla: medir de nuevo los bordes.
- **Fuente:** `fPath` llega como la carpeta (`LOWBAR BATEADOR/FONT`, con la variable): pasa a
  `font/LTEnergy-Regular.ttf`, la estática que ya tenía (mide igual).
- **All Caps:** llega apagado en todas las capas de texto: `prep.js` lo prende.
- **Textos de caja:** ya llegan de caja, pero el nombre cruzaba el número y la posición, el split
  pasaba 29 px el final de su barra y el número y la posición medían 379 px de pantalla. Bordes
  medidos en el frame 87 (`BAT_NOMBRE_HASTA` y los demás) y las cajas a 5 px de ellos (los 8 px del
  bateador anterior, al 64 %): el nombre y el split, desde donde empiezan hasta antes del negro del
  número (x 724) y del final de su barra (x 706); el número y la posición, centrados adentro de su
  placa, que va en diagonal. Los valores llegaban alineados a la izquierda, con el rótulo a
  continuación: pasan a la derecha, terminando donde termina el del diseño (Lw `.000` 125.6719, `00`
  72.9531), con la caja hasta 5 px después de la del rótulo anterior (el primero, del borde de la
  barra gris, x 309); el `.000 ` pierde el espacio final. Los rótulos, cajas de 70 unidades. El alto
  de todas, el ascent del cuerpo más 2: con el del export (hasta 90) un texto que encogía mucho
  partía en dos líneas chicas.
- **Fondos:** con los colores del export (antes, los de las puertas de la ofensiva).
- **Escudo de Tigres:** de *overlay* (`bm` 3) a *color dodge* (6), con el Fill gris al 70 % (ver
  arriba).
- **Barras:** aparecen cuando empiezan a moverse (frame 11, su primer keyframe): antes, su punta
  asomaba quieta en el borde izquierdo, del frame 0 al 10 (y al final de la salida).
- **Key:** la barra negra del split (`Capa de formas 4`) crece 2 px hacia abajo (`BAT_COSTURA`; ver
  *Key* arriba).
- **Markers y timeline:** `START` (0–30) y `STOP` (90–120) del diseñador → `play`, `salida` y `stop`
  como en la defensiva. La entrada termina en el 86 (el OPS): si cambia, mover `ENTRADA_BAT`. Las
  capas que arrancan en el 0 pasan al 1: el frame 0 queda vacío.
- **Textos vacíos:** al final, `vaciaTextos()` deja vacío el texto de todas las capas con clase (las
  cajas ya se midieron con el del diseño).
- **Imágenes:** las 17 del export van tal cual a `bateador/images/`.

Comparado frame a frame contra el export del 2026-10-18 (con todos los equipos prendidos, el texto
del diseño y la misma fuente): idéntico salvo 1 nivel en 2 o 3 px, y del 0 al 10 la punta de la
barra; antes del arreglo del key. Con la fuente variable del export, los textos difieren hasta
47/255 en el suavizado de algunos bordes.

**Lanzador**

- **Clases:** `.NOMBRE  ` (con dos espacios al final) → `nombre`, `.APELLIDO` → `apellido`,
  `,NUMEROUNIFORME` (con coma: sin clase) → `numerouniforme`, `.MANODELLANZADOR` → `manodelanzar`;
  los rótulos `.GANADOSYPERDIDOS`, `.EFECTIVIDAD`, `.BASEXBOLAS`, `.PONCHES`, `.WHIP`,
  `.INNINIGSLANZADOS` → `etiqueta1`…`6` y los valores `NUMEROSDEGANADOSYPERDIDOS` (sin el punto),
  `.NNUMEROSEFECTIVIDAD`, `.NUMEROSBASESXBOLAS`, `.NUMEROSPONCHE`, `.NUMEROSWHIP`,
  `.NUMEROSINNINGLANZADOS` → `valor1`…`6`; los paneles `.COLOR<EQUIPO>` (el de Bravos,
  `.COLORBARAVOS`), los escudos `.LOGO<EQUIPO>` (los de Cardenales y Bravos, `LOGOGRANDE…`, el de
  Cardenales sin el punto) y las barras `.BARRA<EQUIPO>` → `<SIGLAS>_opacidad`; `TEXTURA BASE
  4_1.png` (clase `png`) → `textura`; el split, `.MANODELLANZADOR 2` (una copia de la mano, con su
  clase) → `informacionbarranegra`. Los sólidos azules (y el negro del split, `Sólido Profundo Azul
  2`), los bordes de sombra y los nulos quedan como vienen.
- **Nulo raíz:** desde el export del 2026-10-21 todo cuelga de `Null 7` (s 80 %, p `[782, 515]` al
  final de la entrada): las cajas se calculan en px de pantalla con `enPantalla()`. Si llega a otra
  escala, falla (`LAN_RAIZ`): medir de nuevo los bordes.
- **Fuente:** `fPath` llega como la carpeta (`PITCHERS/FONT`, con la variable): pasa a
  `font/LTEnergy-Regular.ttf`, como el bateador.
- **All Caps:** llega apagado en todas las capas de texto: `prep.js` lo prende.
- **Panel de color:** la textura (`img_1`) con un Gradient Ramp, que Lottie no pinta: salía la
  textura blanca. En AE el Ramp tapa toda la capa (Blend With Original 0) y lo recorta la máscara:
  pasa a una capa de forma con la máscara como trazado y el degradado lineal del Ramp, con sus
  puntos y sus colores.
- **Textura de las estadísticas:** su matte (`BORDE DE SOMBRA 2`, la forma del panel) llega lejos de
  ella: el Bodymovin 5.9 del export no dice cuál es (sin `tp`) y Lottie mateaba con la capa de
  arriba, un sólido. Pasa a estar justo encima. Su Hue/Saturation (saturación −100, claridad −23)
  Lottie tampoco lo pinta: la textura es gris, así que es un Tint de negro a gris 77 %, que sí pinta.
- **Escudos:** el 49 % pasa al CSS, cada uno con su `ln` `escudo<SIGLAS>` (ver arriba).
- **Barra de Bravos:** no vino. Es la del bateador (`images/barra_bravos.png`, copia de
  `bateador/images/img_8.png`), con las medidas de las otras, que escalan con el ancho de la imagen:
  el ancla y la máscara de la de Águilas (512 px) por 514/512. Si el diseñador la manda, `prep.js`
  falla: sacar `LAN_BARRA_BRAVOS`.
- **Textos de caja:** ya llegan de caja, pero las del nombre y el apellido cruzaban el número y el
  final de la barra. Bordes medidos en el frame 109, cajas a 6,4 px (los 8 del export anterior, al
  80 %): el número, centrado donde lo puso el diseño (x 874), en 64 px; el nombre y el apellido,
  desde donde empiezan hasta el margen antes del número; la mano, centrada en su placa (termina en
  x 665,2); el split, desde donde empieza hasta el margen antes del final de la barra negra (x 904
  donde empiezan las letras; la caja del export la pasaba 20 px). Los rótulos llegaban centrados,
  cada uno en una caja distinta, y en pantalla quedaban alineados a la izquierda a ojo (empiezan
  entre x 634 y 638): pasan a la izquierda, todos desde el x del primero (636,4), hasta 3,2 px antes
  de la columna de los valores (x 733,2); los valores, centrados donde estaban (x 808,4), desde 3,2 px
  después. Son las medidas del export anterior (x 599, 720, 814…) pasadas al 80 % (x 157,2 + 0,8 x):
  las cajas quedan iguales en unidades de cada capa. El alto, el ascent del cuerpo más 2. El
  `NOMBRE \r` del diseño pierde el salto de línea del final.
- **Markers y timeline:** `start` (0–30) y `stop` (120–150) del diseñador → `play`, `salida` y `stop`
  como en el bateador. La entrada termina en el 109 (el último rótulo): si cambia, mover
  `ENTRADA_LAN`. El frame 0 ya llega vacío.
- **Textos vacíos:** como en el bateador, `vaciaTextos()` al final.
- **Imágenes:** las 16 del export van tal cual a `lanzador/images/`, más `barra_bravos.png`.

Comparado frame a frame contra el export del 2026-10-18 con el panel, la textura y el escudo
arreglados a mano (sólo Águilas, el texto del diseño y la misma fuente): idéntico en la pausa salvo
los rótulos que se movieron (hasta 3 px); durante la entrada, del 42 al 69, hasta 10/255 en los
bordes del escudo en *overlay* (el 49 % en el `<image>` y no en la capa).

El del 2026-10-21, contra el preparado anterior (`deepdiff.py`): cambian sólo los transforms (el nulo
y las estadísticas más abajo) y el degradado de la línea plateada, y se suman `Null 7`, `Null 8`, la
barra negra y el split; las cajas de texto, iguales. Con data, el gráfico es el anterior al 80 %.
Las 16 imágenes llegan con otra paleta de la compresión de Bodymovin (el mismo dibujo).

**Parcial**

- **Clases:** `.inning` → `inning`; las flechas `.INNINGARRIBAFLECHA` / `.INNINGABAJOFLECHA` (la
  misma forma, rotada 180°) → `INNINGarriba_opacidad` / `INNINGabajo_opacidad`; `.CARRERA ALTA`,
  `.HITS ALTA`, `.ERROR ALTA` (la fila de arriba, la visita; con espacio, clases inválidas) →
  `CARRERASVISITA`, `HITSVISITA`, `ERRORESVISITA`, y las `BAJA` → `…LOCAL` (`ERRORESBAJA` llega
  sin el punto); `.VISITANTE` / `.LOCAL` → `NOMBREVISITA` / `NOMBRELOCAL`; `C`, `H`, `E` →
  `rotulocarreras`, `rotulohits`, `rotuloerrores`; `.albate` → `titulo_jugadores`;
  `.POSPREVENIDO1`…`3` → `posicion1`…`3` (el texto por defecto pierde el espacio final, que Lottie no
  cuenta al centrar); `.PREVENIDO1`…`3` → `jugador1`…`3`; las barras `.<EQUIPO><LOCAL|VISITA>` (sin
  `_`, con el nombre del equipo) → `<SIGLAS><LOCAL|VISITA>_opacidad`. Las `mask N` (sus mattes) y
  el precomp `PEPSI LOGO` quedan como vienen.
- **Fuente:** `fPath` llega como la carpeta (`FINAL DE INNING/FONT`): pasa a `font/LTEnergyVFVF.ttf`,
  el mismo archivo que el del score. El `ascent` queda el del export (72.9996).
- **All Caps:** llega apagado en todas las capas de texto: `prep.js` lo prende.
- **Textos de caja:** ya llegan de caja, con `lh` 0.01 (va 1.2 del cuerpo) y cajas que cruzaban su
  lugar. Medidos en el frame 221 con la fuente cargada: `inning` a 38, centrado, 4 px antes de cada
  flecha; los nombres a 203, centrados, 8 px adentro de la caja negra; `titulo_jugadores` a 274,
  centrado, 8 px adentro de la columna; los apellidos a 129.46 (`PAR_JUGADOR`), desde donde empiezan
  hasta 8 px antes del final de la columna (x 1215: la caja del export entraba 40 px en el cuadro de
  Pepsi). Las posiciones y los números quedan con su caja. El alto de todas, el ascent del cuerpo
  más 2, como en el bateador.
- **Key:** `Capa de formas 1` (los números) crece 1 px a cada lado y `Capa de formas 4` (los
  bateadores) 1 px a la derecha (ver *Key* arriba).
- **Markers y timeline:** el export dice que dura 38 frames (su `op`), sus capas llegan al 297 y sus
  markers (`START` 0–30, `stop` 270–298) no sirven. `play` 0–222 (pausa en el 221, `PAR_PAUSA`),
  `salida` 222–338 y `stop` en el 0. La pizarra (todo menos `PEPSI LOGO` y su raya derecha, `MARCO DE
  PUBLICIDAD 4`, que sale con él) suma su entrada al revés desde el 296 (`alReves`, como la bajada de
  la barra del score): una capa que entraba en el frame t se va en el 337 − t. El 296
  (`PAR_FIN_PEPSI`) es el primer frame vacío del final de la secuencia: `prep.js` lo comprueba (los
  PNG vacíos son el mismo archivo) y falla si cambia. Las capas que arrancan en el 0 pasan al 1: el
  frame 0 queda vacío.
- **Tramo quieto:** los frames 38–133 de la secuencia (`PAR_QUIETO`; al aire, del 76 al 171) son el
  logo quieto, con el tramado distinto en cada uno: queda la capa del 38, que dura todo el tramo, y
  las otras 95 salen del JSON con sus imágenes (medido: el centro de la luz del logo no se corre más
  de 0,04 px en el tramo; al entrar y al salir, el salto es el de un frame cualquiera). Si la
  secuencia cambia de tiempos, medir de nuevo; con los PNG de color completo, `null`.
- **Imágenes:** las 270 del export van tal cual a `parcial/images/` (`img_0`–`261`, la secuencia;
  `img_262`–`269`, las barras). Con el tramo quieto, `img_39`–`133` quedan en la carpeta sin usar.

Comparado frame a frame contra el export del 2026-10-18 (sin data, con su `op` llevado al 300):
idéntico al píxel del 0 al 221, salvo las columnas de 1 px del arreglo del key (x 714–715, 998–999 y
1215–1216) y el tramo quieto (77–171, en el cuadro de Pepsi).

**3 en línea**

- **Imágenes, antes que `prep.js`:** `python3 herramientas/tresenlinea.py "$EXPORTS/3 EN LINEA" .`
  recorta las 199 del export a `RECORTE` (x 1441–1920, y 555–1080: lo que tapa la secuencia en algún
  frame; falla si algo queda afuera) y arma `salida_16`…`salida_43.png`. `prep.js` falla si las
  imágenes no tienen el tamaño del recorte (`TEL_RECORTE`).
- **Clases:** `.JUGADOR1`…`3` → `jugador1`…`3`. La imagen fija (`3NLSEQ_00223.png`, clase `png`)
  pierde la clase; las capas del precomp `3NLSEQ` quedan como vienen.
- **Recorte:** cada imagen, con el tamaño del recorte, y cada capa de imagen con el ancla en el 0 y
  la posición en la esquina del recorte.
- **Fuente:** `fPath` llega como `3 EN LINEA / FONT`: pasa a `font/LTEnergy-Regular.ttf` (el mismo
  archivo que el del bateador).
- **All Caps:** llega apagado: `prep.js` lo prende.
- **Textos de caja:** ya llegan de caja, pero entraban 3 px en la columna naranja: van desde donde
  empiezan (x 1467.9) hasta 8 px antes de ella (`TEL_HASTA`, x 1718), y el alto, el ascent del cuerpo
  más 2. Los renglones, cada 45 (`TEL_RENGLON`): falla si llegan a más de 1 px de eso.
- **Markers y timeline:** `start` (0–30) y `stop` (210–240) del diseñador → `play` 0–197 (pausa en
  el 196, la imagen fija: `TEL_PAUSA`), `salida` 197–242 y `stop` en el 0. Los nombres suman su
  aparición al revés (`alReves`) y la caja sus frames al revés: lo que la entrada muestra en el
  instante t, la salida lo muestra en el 257 − t (`TEL_FIN`). Las capas de la secuencia traen unos
  decimales de más en el ip (el frame k empieza en k × 1,00000004: en el frame entero k todavía se
  ve el k − 1), así que el frame k se ve de k a k + 1, y `salida_k`, de 256 − k a 257 − k. Si cambia
  cuándo crece la caja (`TEL_CAJA`, 16–43) o cuándo termina de aparecer el último nombre
  (`TEL_NOMBRES`, el 60), mover las constantes: falla si un keyframe de los nombres pasa de ahí.
- **Textos vacíos:** al final, como en el bateador.
- **Imágenes:** las 199 del export, recortadas, en `tresenlinea/images/`, más las 28 de la salida.

Comparado frame a frame contra el export (con IVAN MEDINA en los tres y los renglones donde
llegaban): idéntico al píxel en 27 frames del 0 al 196. La salida, contra la entrada al revés
(debajo del panel, desde la y 772): idéntica del 17 al 44; del 45 al 61, con la imagen fija contra
los frames de la secuencia, difieren los bordes tramados.

**Otros juegos**

- **Clases:** `.EQUIPOVISITANTE<n>` / `.EQUIPOLOCAL<n>` → `NOMBREVISITA<n>` / `NOMBRELOCAL<n>`;
  `CARRERAVISITA<n>` (sin el punto: sin clase) y `.CARRERALOCAL<n>` → `CARRERASVISITA<n>` /
  `CARRERASLOCAL<n>`; `.INNINGS`, `.INNINGS 2` y `.INNINGS 3` (los tres con la clase `INNINGS`) →
  `inning1`…`3`; `.PARTE ALTA` / `.PARTE BAJA` (y con ` 2`, ` 3`: las seis con la clase `PARTE`) →
  `INNINGarriba<n>_opacidad` / `INNINGabajo<n>_opacidad`; `.SEDE<n>` → `sede<n>`; `.ASÍ VAN` (clase
  `AS`) → `titulo`; las barras `.BARRA<EQUIPO><LOCAL|VISITA>` (los mismos nombres en los tres juegos)
  → `<SIGLAS><LOCAL|VISITA><n>_opacidad`. El juego de cada barra sale de su parent (las del 2 y el 3
  cuelgan de dos nulos que se llaman igual, `Null 1`; las del 1, de nada) y el lado, de su fila (la de
  arriba es la visita). Las `mascara N` (sus mattes) y los nulos quedan como vienen.
- **Barra de Leones visita del juego 1:** llega como una segunda `BARRALEONESLOCAL`, en la fila de la
  visita y con la imagen de la local: pasa a `LEOVISITA1_opacidad`, con la imagen de la visita.
  `prep.js` falla si hay otra barra con el lado cambiado, o ninguna: si el diseñador la arregla, sacar
  la corrección.
- **Fuentes:** `fPath` llega como `OTROS JUEGOS / FONT` (LT Energy) y vacío (Chakra Petch): pasan a
  `font/LTEnergy-Regular.ttf` (el mismo archivo que el del bateador) y `font/ChakraPetch-Bold.ttf`. El
  export trae la familia entera de Chakra Petch: se usa sólo la Bold.
- **All Caps:** llega apagado: `prep.js` lo prende.
- **Textos de caja:** ya llegan de caja; la sede y los nombres, con `lh` 0.01 (va 1.2 del cuerpo).
  Medidos en el frame 140 con las fuentes cargadas: los nombres, desde donde empiezan hasta 5 px
  antes del cuadro negro (x 1596.6, `OJ_CUADRO`); la sede, de la izquierda a centrada sobre su eje (Lw
  de EN CARACAS 90.7987), a 289 (8 px adentro de la banda); el inning, de la izquierda a centrado sobre
  el eje del 10 (Lw 25.0266), a 51 (4 px antes del borde del cuadro); el título, a 300 px de pantalla
  (8 px adentro de su caja; la capa va al 124 %). Las carreras quedan con su caja. El alto de todas, el
  ascent del cuerpo más 2, con el de su fuente.
- **Fast Box Blur:** el de la sede y los nombres pasa a Gaussian Blur (`OJ_BLUR`). El lint avisa de un
  Fast Box Blur sin convertir.
- **Cuadro de PAN:** desde el frame `OJ_QUIETO` (78) de la secuencia, un solo JPG: la capa de ese
  frame dura hasta el final y las de después salen del JSON con sus imágenes (`img_79`–`137` quedan en
  la carpeta sin usar). Con una secuencia sin compresión, `null`.
- **Key:** el fondo negro de las barras de cada juego (`OJ_FONDO`, en px de pantalla, debajo de la
  última barra del juego), la primera banda (`Capa de formas 7`) 1 px más alta y los cuadros negros
  (`CUADRO SCORE`, ` 2`, ` 3`) 1 px más altos (ver *Key* arriba). Si la columna se mueve, medir de
  nuevo `OJ_FONDO`.
- **Markers y timeline:** `START` (0–30) y `STOP` (167–197) del diseñador → `play` 0–166 (pausa en el
  165, el primer frame sin el cuadro de PAN: `OJ_PAUSA`), `salida` 166–235 y `stop` en el 0. La columna
  suma su entrada al revés (`alReves`) desde el 166: una capa que entraba en el frame t se va en el
  261 − t, y el 234 (la raya gris sin ancho) es el primer frame vacío. La entrada de la columna termina
  en el 95 (`OJ_ENTRADA`): `prep.js` falla si algo de la columna anima después. Las capas que arrancan
  en el 0 pasan al 1.
- **Tramos:** `otrosJuegos(juegos)` arma cada tramo como un gráfico solo, desde el frame 0: con 2 o 1
  juegos saca las capas de los de abajo (las que cuelgan de `RESULTADO <n>` y de su `Null 1`, más la
  sede, el inning y las carreras, y sus mattes), achica las máscaras de las barras locales del último
  para que terminen como las del juego 3, no le agranda el cuadro negro hacia abajo, y corre las capas
  sin parent hasta que su cuadro termine donde el del 3. La entrada del tramo termina con su último
  juego (66, 82 o 95), y la salida es esa entrada al revés. Después los tramos de 2 y 1 se copian a
  `OJ_TRAMO` (300 y 600) con `ind` nuevos (y sus `parent` y `tp`), y se corren el ip, el op, el st y
  todos los keyframes. `prep.js` falla si un tramo empieza antes de que termine el anterior.
- **Textos vacíos:** al final, todos salvo `titulo`.
- **Imágenes:** las 154 del export van tal cual a `otrosjuegos/images/` (`img_0`–`137`, los JPG de la
  secuencia; `img_138`–`153`, las barras).

Comparado frame a frame contra el export (del 0 al 165, con todas las barras prendidas y el texto del
diseño): idéntico salvo el desenfoque de los textos mientras entran, el escudo de Leones visita del
juego 1 (la imagen corregida), el cuadro de PAN desde el 95 (el JPG quieto) y las filas de 1 px del
arreglo del key (la 643 y, en el cuadro negro, la 667, la 779 y la 890). La salida, contra la entrada
al revés: idéntica (hasta 1 nivel). Con los tramos, el de tres quedó idéntico al publicado antes, y la
pausa de los de 2 y 1, idéntica a la de tres corrida 111 y 223 px (hasta 1 nivel), salvo el borde de
abajo.

### QA

- Juzgar con el runtime real y la fuente cargada (`<gráfico>/index.html` en el browser o con
  Playwright). `lottie_render` del editor usa una fuente de reemplazo: no sirve para revisar textos.
- Score: los 56 cruces visita × local, entrada frame a frame, data al aire con el gráfico pausado,
  `next` y `stop` desde cada stage, y que el layer se suelte.
- Parcial: lo mismo que el score con su único stage, y el key en CasparCG (`casparcg-ctl
  snapshot`): sin columnas a menos de 255 entre los recuadros.
- 3 en línea: entrada frame a frame, la salida contra la entrada al revés, data al aire, `stop` en
  la pausa y a mitad de la entrada, y que el layer se suelte; en CasparCG, el key y que la entrada no
  repita frames: se graba la salida del canal (`ADD 1-901 FILE "<ruta>.nut" -filter:v
  crop=480:528:1440:552 -codec:v rawvideo`, `REMOVE 1-901` al terminar) y se cuentan los frames
  iguales al anterior (la secuencia trae iguales el 23 y del 169 al 176).
- Otros juegos: los 8 equipos en las 6 filas (8 casos que los rotan), textos largos (nombres, sedes,
  `FINAL` en el inning), entrada frame a frame contra el export, la salida contra la entrada al revés,
  data al aire, `stop` en la pausa y a mitad de la entrada, y que el layer se suelte; en CasparCG, el
  key con los 8 casos (sin filas ni columnas a menos de 255 adentro de la columna) y que la entrada no
  repita frames (como en el 3 en línea, `crop=400:720:1400:300`). Los tramos de 2 y 1: `CG PLAY` y
  `CG INVOKE 1 "goto('dosjuegos')"`, el key en la pausa, que no se vea nada del tramo de tres antes del
  goto (grabando el canal) y que el `CG STOP` suelte el layer.
- Defensiva, ofensiva, bateador y lanzador: los 8 equipos (barra, color de las puertas, del fondo o
  del panel, y escudo), y sin equipo; entrada frame a frame, cambio de equipo al aire, `stop` en la
  pausa y a mitad de la entrada, y que el layer se suelte. El bateador y el lanzador, además, el key
  en CasparCG: sin filas ni columnas a menos de 255 donde se tocan los recuadros.
- Colores: NTSC compuesto en cada equipo (lo más alto y lo más bajo, con setup de 7,5 IRE).
- Textos: apellidos largos (que encojan dentro de su lugar), números de más cifras (`P.100`, `100`
  de velocidad, `10-4`, `1.000`, inning `10`, `1.000` en cada casillero del bateador) y textos en
  minúsculas (que salgan en mayúsculas).
- Por `file://`, como lo abre CasparCG: Chromium con `--allow-file-access-from-files`.
- Al comparar dos versiones al píxel: cada frame en su propia carga (`shot.mjs` con un solo frame),
  o con tolerancia. En una misma carga, según los frames que se renderizaron antes, Chromium deja
  hasta 43 niveles de diferencia en algunos bordes, también entre una versión y ella misma. En el
  primer frame de una carga, una barra puede no haber cargado todavía: repetir. Y con PNG con alfa,
  comparar el color además del alfa (en Pillow, `getbbox()` de una RGBA mira sólo el alfa).

### Herramientas

En [herramientas/](herramientas/), fuera del zip; las de render y análisis vienen de LVBP-Meridiano.
Los scripts de render necesitan un server estático en la raíz del repo (`python3 -m http.server
5510`) y Playwright: el del Lottie Layer Editor, o `PLAYWRIGHT=<ruta a index.mjs>` (en un contenedor
con Playwright global, `$(npm root -g)/playwright/index.mjs`).

| Script | Para qué |
|---|---|
| `prep.js` | La receta de arriba, ejecutable: prepara el export del diseñador. Instrucciones en su encabezado |
| `tresenlinea.py` | Las imágenes del 3 en línea: el recorte y los frames de la salida (va antes de `prep.js`) |
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
lo regenera, reponerlo desde git. El del bateador, el del parcial y el del lanzador se escribieron
a mano en ese formato, sin pasar por el editor.

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
