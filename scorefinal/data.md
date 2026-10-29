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

**Final score (line score):** the runs of each inning for both teams (visitor on top, home below),
runs, hits and errors, the team bars with their names, and the ATRAPA LA EMOCIÓN logo on the right
(fixed: it takes no data).

**Same keys as the LVBP-Meridiano `final`** for what both show: the team bars, the runs, hits and
errors (`CARRERASVISITA`, `HITSVISITA`, `ERRORESVISITA`, `CARRERASLOCAL`…), the runs of each inning
(`INNINGVISITA1`–`INNINGVISITA9`, `INNINGLOCAL1`–`INNINGLOCAL9`) and the label of the last column
(`ultimoinning`). A client can send the same values to both. Meridiano's bottom bar
(`lanzadorganador`, `lanzadorperdedor`, `jugadormvp`, `barra_opacidad`, their labels) and its
`titulo` / `titulo_entrada` don't exist here: they are ignored.

**Team bars:** as in `score` and `parcial`, all 16 start visible and overlap, 8 per row: send `1`
for the two that play and `0` for the other fourteen. The visitor's row takes
`<TEAM>VISITA_opacidad`, the home row `<TEAM>LOCAL_opacidad`. Each bar carries its team's crest as a
watermark (the same bars as `posiciones`). With no data, Tigres shows on top and Tiburones below.

**Team names:** `NOMBREVISITA` / `NOMBRELOCAL`, the name written on each bar, as in `parcial`
(`MAGALLANES`, `CARDENALES`). Meridiano's `final` doesn't have them: **always send them**, they
start empty. Up to about 10 letters keep the design size (`MAGALLANES`, `CARDENALES` fit); longer
ones shrink within the black box.

**Innings:** columns 1 to 8 have fixed labels. Column 9 is the **last inning**: its label is
`ultimoinning` (`9` in a regular game, `10`, `12`… in extra innings; default `9`) and its values are
`INNINGVISITA9` / `INNINGLOCAL9`. Each value is centered in its column; two digits keep the design
size, three shrink a little. Send `X` for a half inning not played (the home team's 9th when it
won) and `""` to leave a cell empty. All the numbers start empty.

**Runs, hits and errors:** centered in their columns; three digits fit at the design size.

**Placement:** bottom of the screen (x 302–1634, y 724–910). It overlaps `parcial` and `otrosjuegos`:
they don't go on air together.

```json
{
  "NOMBREVISITA": "MAGALLANES",
  "NOMBRELOCAL": "CARDENALES",
  "INNINGVISITA1": "0", "INNINGVISITA2": "2", "INNINGVISITA3": "0",
  "INNINGVISITA4": "0", "INNINGVISITA5": "1", "INNINGVISITA6": "0",
  "INNINGVISITA7": "0", "INNINGVISITA8": "2", "INNINGVISITA9": "0",
  "INNINGLOCAL1": "1", "INNINGLOCAL2": "0", "INNINGLOCAL3": "3",
  "INNINGLOCAL4": "0", "INNINGLOCAL5": "0", "INNINGLOCAL6": "1",
  "INNINGLOCAL7": "0", "INNINGLOCAL8": "1", "INNINGLOCAL9": "X",
  "ultimoinning": "9",
  "CARRERASVISITA": "5",
  "HITSVISITA": "9",
  "ERRORESVISITA": "1",
  "CARRERASLOCAL": "6",
  "HITSLOCAL": "11",
  "ERRORESLOCAL": "0",
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
  "TIGRESLOCAL_opacidad": 0
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 118 |
| Duration | 3.94 s |

Frame 0 is empty: nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing, always on one line.

| Class | nm | Default text |
|-------|----|-------------|
| `NOMBREVISITA` | `.NOMBREVISITA` | (empty) |
| `NOMBRELOCAL` | `.NOMBRELOCAL` | (empty) |
| `ultimoinning` | `.ultimoinning` | 9 |
| `rotuloinning1` | `.rotuloinning1` | 1 (column label: no need to send it) |
| `rotuloinning2` | `.rotuloinning2` | 2 (column label: no need to send it) |
| `rotuloinning3` | `.rotuloinning3` | 3 (column label: no need to send it) |
| `rotuloinning4` | `.rotuloinning4` | 4 (column label: no need to send it) |
| `rotuloinning5` | `.rotuloinning5` | 5 (column label: no need to send it) |
| `rotuloinning6` | `.rotuloinning6` | 6 (column label: no need to send it) |
| `rotuloinning7` | `.rotuloinning7` | 7 (column label: no need to send it) |
| `rotuloinning8` | `.rotuloinning8` | 8 (column label: no need to send it) |
| `rotulocarreras` | `.rotulocarreras` | C (column label: no need to send it) |
| `rotulohits` | `.rotulohits` | H (column label: no need to send it) |
| `rotuloerrores` | `.rotuloerrores` | E (column label: no need to send it) |

| Team | Runs | Hits | Errors | Default |
|------|------|------|--------|---------|
| Visitor (top) | `CARRERASVISITA` | `HITSVISITA` | `ERRORESVISITA` | (empty) |
| Home (bottom) | `CARRERASLOCAL` | `HITSLOCAL` | `ERRORESLOCAL` | (empty) |

| Inning | Visitor (top) | Home (bottom) | Default |
|--------|---------------|---------------|---------|
| 1 | `INNINGVISITA1` | `INNINGLOCAL1` | (empty) |
| 2 | `INNINGVISITA2` | `INNINGLOCAL2` | (empty) |
| 3 | `INNINGVISITA3` | `INNINGLOCAL3` | (empty) |
| 4 | `INNINGVISITA4` | `INNINGLOCAL4` | (empty) |
| 5 | `INNINGVISITA5` | `INNINGLOCAL5` | (empty) |
| 6 | `INNINGVISITA6` | `INNINGLOCAL6` | (empty) |
| 7 | `INNINGVISITA7` | `INNINGLOCAL7` | (empty) |
| 8 | `INNINGVISITA8` | `INNINGLOCAL8` | (empty) |
| 9 (`ultimoinning`) | `INNINGVISITA9` | `INNINGLOCAL9` | (empty) |

## Opacity layers

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
| `play` | 0 | 59 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 59 | 59 | — (the entry in reverse) |

`play` enters and pauses on frame 58 (1.9 s). No update animation: data sent while on air replaces
silently, the teams included. `stop` plays `salida` (frame 59 → 117, 1.9 s): the entry in reverse,
ending on an empty frame; it releases the layer when it ends. The `play` stage is active from frame
0, so a `stop` that arrives mid-entry also plays `salida`: it jumps to the full graphic and exits
from there.
