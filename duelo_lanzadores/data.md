# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Image layers** — send a path the browser can load: relative to the graphic's `index.html`, a
> full URL, or a local file as a `file:///` URL (CasparCG opens the templates with `file://`). A
> plain filesystem path (`C:/...`) will not work. A path that doesn't load leaves the image empty
> instead of showing a broken-image icon.
> **Opacity layers** — send a number from `0` (transparent) to `1` (fully opaque).
> **Markers** — `play` and `stop` control playback.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Pitchers' duel (DUELO DE HOY):** full screen and opaque. On each side, the team's panel with the
starting pitcher's photo in front and, below, a bar with his name and number (the visitor on the
left, the home team on the right); in the middle, the ATRAPA LA EMOCIÓN logo, the title and a table
of 7 stats (the visitor's values on the left, the labels in the middle, the home pitcher's on the
right).

**Same keys as the LVBP-Meridiano `duelo_lanzadores`** for what both show: `titulo`, the names
(`lanzadorvisita` / `lanzadorlocal`), the photos (`fotolanzadorvisita` / `fotolanzadorlocal`) and the
stats (`etiquetaN`, `valorvisitaN`, `valorlocalN`). Meridiano's has 5 rows and this one 7: rows 6
and 7 stay empty if a client sends only 5. Meridiano's `escudovisita` / `escudolocal` don't exist
here (the teams go by opacity, below): they are ignored.

**Teams:** as the bars of `score` and `scorefinal`, the 8 panels of each side start visible and
overlap: send `1` for the team that plays and `0` for the other seven, on each side. The visitor's
side (left) takes `<TEAM>VISITA_opacidad`, the home side (right) `<TEAM>LOCAL_opacidad`. With no
data, Tigres shows on the left and Tiburones on the right.

**Names:** `lanzadorvisita` / `lanzadorlocal`, first name and surname, as in Meridiano
(`JHOULYS CHACÍN`). They start empty: **always send them**. Up to about 17 letters keep the design
size on the left and 16 on the right (`ALEXANDER MONASTERIOS` shrinks a little); longer ones shrink
within the bar. **Numbers:** `numerovisita` / `numerolocal`, the uniform number, in the black box
next to the name; three digits fit.

**Photos:** `fotolanzadorvisita` / `fotolanzadorlocal`, the path of each pitcher's photo. Best: a
cut-out with a transparent background, **720 × 1080 px** (2:3), like the design's: the team's panel
shows around the player and the bar covers the bottom. A photo of another proportion fits whole,
centered on its side and hanging from the top of that 720 × 1080 box (a square one sits above the
bar). By default there's no photo (transparent): if you send nothing, only the panel shows. `""` or
a path that doesn't load takes the photo off.

**Stats:** seven generic rows, top to bottom. Each one is a label (`etiquetaN`, the middle column)
and the two pitchers' values (`valorvisitaN` on the left, `valorlocalN` on the right): any stat can
go in any row, the design's G / P / EFE / IL / CL / BB / SO is only an example. All start empty.
Each text is centered in its column; up to about 5 characters keep the design size (`10.125`,
`100.2`, `12-10`, `WHIP` fit), longer ones shrink.

**Placement:** full screen, opaque from its first frame: nothing else goes on air with it.

```json
{
  "titulo": "DUELO DE HOY",
  "lanzadorvisita": "JHOULYS CHACÍN",
  "lanzadorlocal": "RICARDO PINTO",
  "numerovisita": "45",
  "numerolocal": "7",
  "fotolanzadorvisita": "file:///C:/fotos/chacin.png",
  "fotolanzadorlocal": "file:///C:/fotos/pinto.png",
  "etiqueta1": "G", "valorvisita1": "4", "valorlocal1": "3",
  "etiqueta2": "P", "valorvisita2": "1", "valorlocal2": "2",
  "etiqueta3": "EFE", "valorvisita3": "0.65", "valorlocal3": "2.45",
  "etiqueta4": "IL", "valorvisita4": "41.2", "valorlocal4": "36.0",
  "etiqueta5": "CL", "valorvisita5": "3", "valorlocal5": "10",
  "etiqueta6": "BB", "valorvisita6": "10", "valorlocal6": "12",
  "etiqueta7": "SO", "valorvisita7": "38", "valorlocal7": "29",
  "AGUIVISITA_opacidad": 0,
  "ANZVISITA_opacidad": 0,
  "BRAVOSVISITA_opacidad": 0,
  "CARDVISITA_opacidad": 0,
  "LEOVISITA_opacidad": 0,
  "MAGAVISITA_opacidad": 1,
  "TIBUSVISITA_opacidad": 0,
  "TIGRESVISITA_opacidad": 0,
  "AGUILOCAL_opacidad": 0,
  "ANZLOCAL_opacidad": 0,
  "BRAVOSLOCAL_opacidad": 0,
  "CARDLOCAL_opacidad": 0,
  "LEOLOCAL_opacidad": 1,
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
| Frames | 0 – 105 |
| Duration | 3.54 s |

Frame 0 is empty: nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing, always on one line.

| Class | nm | Default text |
|-------|----|-------------|
| `titulo` | `.titulo` | DUELO DE HOY |
| `lanzadorvisita` | `.lanzadorvisita` | (empty) |
| `lanzadorlocal` | `.lanzadorlocal` | (empty) |
| `numerovisita` | `.numerovisita` | (empty) |
| `numerolocal` | `.numerolocal` | (empty) |

| Row | Label | Visitor (left) | Home (right) | Design's label |
|-----|-------|----------------|--------------|----------------|
| 1 | `etiqueta1` | `valorvisita1` | `valorlocal1` | G |
| 2 | `etiqueta2` | `valorvisita2` | `valorlocal2` | P |
| 3 | `etiqueta3` | `valorvisita3` | `valorlocal3` | EFE |
| 4 | `etiqueta4` | `valorvisita4` | `valorlocal4` | IL |
| 5 | `etiqueta5` | `valorvisita5` | `valorlocal5` | CL |
| 6 | `etiqueta6` | `valorvisita6` | `valorlocal6` | BB |
| 7 | `etiqueta7` | `valorvisita7` | `valorlocal7` | SO |

All the stats start empty.

## Image layers

| Class | What | Default |
|-------|------|---------|
| `fotolanzadorvisita` | Visitor's pitcher photo, left (box of 720 × 1080 px, `xMidYMin meet`) | transparent |
| `fotolanzadorlocal` | Home pitcher photo, right (box of 720 × 1080 px, `xMidYMin meet`) | transparent |

## Opacity layers

| Team | Visitor (left) | Home (right) | Default opacity |
|------|----------------|--------------|----------------|
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
| `play` | 0 | 53 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 53 | 53 | — (the entry in reverse) |

`play` enters and pauses on frame 52 (1.8 s). No update animation: data sent while on air replaces
silently, the teams and the photos included. `stop` plays `salida` (frame 53 → 105, 1.8 s): the
entry in reverse, ending on an empty frame; it releases the layer when it ends. The `play` stage is
active from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it jumps to the full
graphic and exits from there.
