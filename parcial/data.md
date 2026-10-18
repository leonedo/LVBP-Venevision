# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Opacity layers** — send a number from `0` (transparent) to `1` (fully opaque).
> **Markers** — `play` and `stop` control playback.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**End-of-inning score:** runs, hits and errors for each team (visitor on top, home below), the
inning with its arrows, the three batters due up in the next inning and the Pepsi box (fixed: it
takes no data).

**Same keys as the LVBP-Meridiano `parcial`**, which in turn are the ones of `score` for what both
show: the team bars, `inning`, the two arrows and the runs (`CARRERASVISITA`, `CARRERASLOCAL`). A
client can send the same values to the three, plus the team names and the positions. Hits and
errors follow the style of the runs: `HITSVISITA`, `ERRORESVISITA`, `HITSLOCAL`, `ERRORESLOCAL`.
Meridiano's `titulo` and `publicidad` don't exist here: they are ignored.

**Team bars:** as in `score`, all 16 start visible and overlap, 8 per row: send `1` for the two
that play and `0` for the other fourteen. The visitor's row takes `<TEAM>VISITA_opacidad`, the home
row `<TEAM>LOCAL_opacidad`. Each bar carries its team's crest as a watermark. With no data, Bravos
shows on both rows.

**Team names:** `NOMBREVISITA` / `NOMBRELOCAL`, the name written on each bar (`AGUILAS`, `LEONES`
in the design). They are not the abbreviations of the score's `EQUIPOVISITA` / `EQUIPOLOCAL`, and
Meridiano's `parcial` doesn't have them: **always send them**, or the design's AGUILAS and LEONES
stay on air over other teams' bars. Up to about 10 letters keep the design size (`MAGALLANES`,
`CARDENALES` fit); longer ones shrink.

**Inning:** the number (`inning`) and the arrows. Both arrows start visible: turn off the one that
doesn't apply (`INNINGarriba_opacidad` ▲ is the top of the inning, `INNINGabajo_opacidad` ▼ the
bottom). Extra innings (two digits) fit.

**Batters:** three rows, top to bottom, under `titulo_jugadores` (`AL BATE`). Each row is the
position (`posicion1`–`posicion3`, in cyan, centered in its slot: any two-letter position fits) and
the surname (`jugador1`–`jugador3`, in white, left-aligned), as in the LVBP-Venevision `ofensiva`
(`posicionN`, `jugadorN`). Up to about 9 letters of surname keep the design size (`CASTILLO`);
longer ones shrink within the column (`RODRÍGUEZ` a little, `MONASTERIOS` about a quarter). An
empty string leaves the slot empty.

```json
{
  "CARRERASVISITA": "3",
  "HITSVISITA": "8",
  "ERRORESVISITA": "1",
  "CARRERASLOCAL": "5",
  "HITSLOCAL": "11",
  "ERRORESLOCAL": "0",
  "inning": "7",
  "INNINGarriba_opacidad": 0,
  "INNINGabajo_opacidad": 1,
  "NOMBREVISITA": "MAGALLANES",
  "NOMBRELOCAL": "CARDENALES",
  "MAGAVISITA_opacidad": 1,
  "AGUIVISITA_opacidad": 0,
  "ANZVISITA_opacidad": 0,
  "BRAVOSVISITA_opacidad": 0,
  "CARDVISITA_opacidad": 0,
  "LEOVISITA_opacidad": 0,
  "TIBUSVISITA_opacidad": 0,
  "TIGRESVISITA_opacidad": 0,
  "CARDLOCAL_opacidad": 1,
  "AGUILOCAL_opacidad": 0,
  "ANZLOCAL_opacidad": 0,
  "BRAVOSLOCAL_opacidad": 0,
  "LEOLOCAL_opacidad": 0,
  "MAGALOCAL_opacidad": 0,
  "TIBUSLOCAL_opacidad": 0,
  "TIGRESLOCAL_opacidad": 0,
  "posicion1": "SS",
  "jugador1": "ALCÁNTARA",
  "posicion2": "2B",
  "jugador2": "MARCANO",
  "posicion3": "CF",
  "jugador3": "PALACIOS",
  "titulo_jugadores": "AL BATE"
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 338 |
| Duration | 11.28 s |

Bottom of the screen, a little right of center (x 310–1540, y 677–930): it doesn't touch the score.
Frame 0 is empty: nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing, always on one line.

| Class | nm | Default text |
|-------|----|-------------|
| `inning` | `.inning` | 10 |
| `NOMBREVISITA` | `.NOMBREVISITA` | AGUILAS |
| `NOMBRELOCAL` | `.NOMBRELOCAL` | LEONES |
| `titulo_jugadores` | `.titulo_jugadores` | AL BATE |
| `posicion1` / `jugador1` | `.posicion1` / `.jugador1` | 3B / TOVAR |
| `posicion2` / `jugador2` | `.posicion2` / `.jugador2` | 3B / TOVAR |
| `posicion3` / `jugador3` | `.posicion3` / `.jugador3` | 3B / TOVAR |
| `rotulocarreras` | `.rotulocarreras` | C (column label: no need to send it) |
| `rotulohits` | `.rotulohits` | H (column label: no need to send it) |
| `rotuloerrores` | `.rotuloerrores` | E (column label: no need to send it) |

| Team | Runs | Hits | Errors | Default |
|------|------|------|--------|---------|
| Visitor (top) | `CARRERASVISITA` | `HITSVISITA` | `ERRORESVISITA` | 0 |
| Home (bottom) | `CARRERASLOCAL` | `HITSLOCAL` | `ERRORESLOCAL` | 0 |

Two digits fit in each number at the design size.

## Opacity layers

| Class | What | Default opacity |
|-------|------|----------------|
| `INNINGarriba_opacidad` | ▲ top of the inning | 1 |
| `INNINGabajo_opacidad` | ▼ bottom of the inning | 1 |

| Team | Visitor (top row) | Home (bottom row) | Default opacity |
|------|-------------------|-------------------|----------------|
| Águilas del Zulia | `AGUIVISITA_opacidad` | `AGUILOCAL_opacidad` | 1 |
| Caribes de Anzoátegui | `ANZVISITA_opacidad` | `ANZLOCAL_opacidad` | 1 |
| Bravos de Margarita | `BRAVOSVISITA_opacidad` | `BRAVOSLOCAL_opacidad` | 1 |
| Cardenales de Lara | `CARDVISITA_opacidad` | `CARDLOCAL_opacidad` | 1 |
| Leones del Caracas | `LEOVISITA_opacidad` | `LEOLOCAL_opacidad` | 1 |
| Navegantes del Magallanes | `MAGAVISITA_opacidad` | `MAGALOCAL_opacidad` | 1 |
| Tiburones de La Guaira | `TIBUSVISITA_opacidad` | `TIBUSLOCAL_opacidad` | 1 |
| Tigres de Aragua | `TIGRESVISITA_opacidad` | `TIGRESLOCAL_opacidad` | 1 |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 222 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 222 | 116 | — (the Pepsi box leaves, then the board) |

`play` enters and pauses on frame 221 (7.4 s): the board is in by frame 41 (1.4 s), the Pepsi box
by frame 73 (2.4 s), and a shine crosses the Pepsi logo before the pause (frames 181–220). The
graphic can go on air before that: the data is all there from 1.4 s. No update animation: data sent
while on air replaces silently, the teams included. `stop` plays `salida` (frame 222 → 337, 3.9 s):
the Pepsi box plays its exit (the letters go, the logo turns into a dot and the box closes) and then
the board leaves, its entry in reverse, ending on an empty frame; it releases the layer when it
ends. The `play` stage is active from frame 0, so a `stop` that arrives mid-entry also plays
`salida`: it jumps to the full graphic and exits from there.
