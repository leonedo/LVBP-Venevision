# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Opacity layers** — send a number from `0` (transparent) to `1` (fully opaque).
> **Image layers** — send a web-accessible path to swap the displayed image. Accepted formats:
> a full URL (`https://...`) or a relative path from the template's web root (`images/logo.png`).
> Local filesystem paths (e.g. `C:/...`) will not work — the path must be resolvable by the browser rendering the template.
> A path that doesn't load leaves the image empty instead of showing a broken-image icon.
> **Markers** — `play` and `stop` control playback.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Team:** all 8 teams start hidden (`opacity: 0` in `index.html`). Send `1` for the pitcher's team
and `0` for the others. Each key turns on the team's color panel on the left, the big crest on it
and the name bar (with its crest as a watermark). Without a team the panel and the name bar don't
show. The teams overlap, so if you switch teams you have to turn off the previous one.

**Name:** two lines, two keys: `nombre` (first name, top) and `apellido` (surname, below). The
LVBP-Meridiano `lanzador` has a single `nombrelanzador` (the full name on one line): it doesn't
exist here.

**Stats:** six generic slots, top to bottom. Each one is a label (`etiquetaN`) and a value
(`valorN`): any stat can go in any slot, the design's G-P / EFE / BB / SO / WHIP / IL are only the
default. Same scheme as the LVBP-Meridiano `lanzador`.

```json
{
  "AGUI_opacidad": 0,
  "ANZ_opacidad": 0,
  "BRAVOS_opacidad": 0,
  "CARD_opacidad": 0,
  "LEO_opacidad": 1,
  "MAGA_opacidad": 0,
  "TIBUS_opacidad": 0,
  "TIGRES_opacidad": 0,
  "nombre": "JHOULYS",
  "apellido": "CHACÍN",
  "numerouniforme": "45",
  "manodelanzar": "LD",
  "etiqueta1": "G-P",
  "valor1": "10-2",
  "etiqueta2": "EFE",
  "valor2": "2.85",
  "etiqueta3": "BB",
  "valor3": "21",
  "etiqueta4": "SO",
  "valor4": "68",
  "etiqueta5": "WHIP",
  "valor5": "1.12",
  "etiqueta6": "IL",
  "valor6": "72.1"
}
```

`manodelanzar`, `etiquetaN` / `valorN` and the team keys are those of the LVBP-Meridiano
`lanzador`; `numerouniforme`, the one of the LVBP-Venevision `bateador`. Meridiano's
`nombrelanzador`, `titulo`, `informacionbarranegra` and `logomeridiano` don't exist here: they are
ignored.

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 111 |
| Duration | 3.70 s |

Left half of the screen: the team's color panel covers the left edge from top to bottom
(x 0–540), and the name bar and the stats panel sit to its right (up to x 1127, y 100–960). Frame 0
is empty: nothing shows before `play`.

## Text layers

**All text layers start empty:** a key that isn't sent shows nothing (the design's sample text,
in the table, is not on air). Send every key.

All are box text: a longer string shrinks to fit instead of overflowing, always on one line. The
first name and the surname are two boxes, each up to about 9 letters at the design size
(`ALEXANDER`, `RODRÍGUEZ` fit; `MONASTERIOS` shrinks to 80 %); each one shrinks on its own. The
number fits 2 digits (3 shrink a little), `manodelanzar` 2 letters. The labels are left-aligned in
their column, about 4 characters at the design size (`WHIP`, `K-BB`); the values are centered in
theirs, up to 6 characters (`100-20`, `130.2`).

| Class | nm | Design text (starts empty) |
|-------|----|-------------|
| `nombre` | `.nombre` | NOMBRE |
| `apellido` | `.apellido` | APELLIDO |
| `numerouniforme` | `.numerouniforme` | 00 |
| `manodelanzar` | `.manodelanzar` | LD |
| `etiqueta1` / `valor1` | `.etiqueta1` / `.valor1` | G-P / 0-0 |
| `etiqueta2` / `valor2` | `.etiqueta2` / `.valor2` | EFE / 00 |
| `etiqueta3` / `valor3` | `.etiqueta3` / `.valor3` | BB / 00 |
| `etiqueta4` / `valor4` | `.etiqueta4` / `.valor4` | SO / 00 |
| `etiqueta5` / `valor5` | `.etiqueta5` / `.valor5` | WHIP / 00 |
| `etiqueta6` / `valor6` | `.etiqueta6` / `.valor6` | IL / 00 |

## Opacity layers

| Class | Team | Layers | Default opacity |
|-------|------|--------|----------------|
| `AGUI_opacidad` | Águilas del Zulia | color panel + crest + name bar | 0 |
| `ANZ_opacidad` | Caribes de Anzoátegui | color panel + crest + name bar | 0 |
| `BRAVOS_opacidad` | Bravos de Margarita | color panel + crest + name bar | 0 |
| `CARD_opacidad` | Cardenales de Lara | color panel + crest + name bar | 0 |
| `LEO_opacidad` | Leones del Caracas | color panel + crest + name bar | 0 |
| `MAGA_opacidad` | Navegantes del Magallanes | color panel + crest + name bar | 0 |
| `TIBUS_opacidad` | Tiburones de La Guaira | color panel + crest + name bar | 0 |
| `TIGRES_opacidad` | Tigres de Aragua | color panel + crest + name bar | 0 |

## Image layers

Fixed image of the design. It can be swapped by path, but a controller doesn't need to.

| Class | nm | Ref ID |
|-------|----|--------|
| `textura` | `.textura` | `image_1` |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 110 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 110 | -110 | — (the entry played backwards) |

`play` enters and pauses on frame 110 (3.7 s). No update animation: data sent while on air replaces
silently, the team included. The exit is the entry in reverse: `stop` plays `salida` (frame 110 →
0, 3.7 s, ending on the empty frame) and releases the layer when it ends. The `play` stage is active
from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it jumps to the full graphic
and exits from there.
