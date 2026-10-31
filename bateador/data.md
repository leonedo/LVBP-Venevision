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

**Team:** all 8 teams start hidden (`opacity: 0` in `index.html`). Send `1` for the batter's team
and `0` for the others. Each key turns on the team's name bar (with its crest as a watermark), the
color block on the left and the big crest on it. Without a team the name bar and the color block
don't show. The teams overlap, so if you switch teams you have to turn off the previous one.

**Stats:** four generic slots, left to right. Each one is a value (`valorN`) followed by its label
(`etiquetaN`): any stat can go in any slot, the design's AVE / HR / CI / OPS are only the default.

**Split:** `informacionbarranegra`, the black bar above the name: what the stats are (the season,
the split). The bar is always on air: send the text with every payload, or it stays empty.

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
  "informacionbarranegra": "TEMPORADA 2026-27",
  "nombrejugador": "WILSON GARCÍA",
  "numerouniforme": "7",
  "posicion": "BD",
  "etiqueta1": "AVE",
  "valor1": ".312",
  "etiqueta2": "HR",
  "valor2": "8",
  "etiqueta3": "CI",
  "valor3": "27",
  "etiqueta4": "OPS",
  "valor4": ".905"
}
```

These are the keys of the LVBP-Meridiano `bateador`, so a controller can send both graphics the same
payload. Meridiano's `titulo` doesn't exist here: it is ignored.

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 88 |
| Duration | 2.94 s |

Lower third, at the bottom left (x 0–1058, y 752–1019), with the split's black bar on top. Frame 0
is empty: nothing shows before `play`.

## Text layers

**All text layers start empty:** a key that isn't sent shows nothing (the design's sample text,
in the table, is not on air). Send every key.

All are box text: a longer string shrinks to fit instead of overflowing, always on one line. The
name, first name and surname as in the design: up to about 19 characters keep the design size
(`AEVERSON ARTEAGA` fits); longer ones shrink within the bar (`ALEXANDER MONASTERIOS` to 87 %). The
split, up to about 30 characters (`TEMPORADA 2026-27 · VS ZURDOS` fits). The number fits 3 digits,
the position 2 or 3 letters.
Each value is right-aligned against its label and grows to the left: `1.000` fits at the design
size in slots 1, 2 and 4, and shrinks a little in slot 3. Labels fit about 3 letters.

| Class | nm | Design text (starts empty) |
|-------|----|-------------|
| `informacionbarranegra` | `.informacionbarranegra` | DE POR VIDA CON BASES LLENAS |
| `nombrejugador` | `.nombrejugador` | NOMBRE  APELLIDO |
| `numerouniforme` | `.numerouniforme` | 99 |
| `posicion` | `.posicion` | DH |
| `valor1` / `etiqueta1` | `.valor1` / `.etiqueta1` | .000 / AVE |
| `valor2` / `etiqueta2` | `.valor2` / `.etiqueta2` | 00 / HR |
| `valor3` / `etiqueta3` | `.valor3` / `.etiqueta3` | 00 / CI |
| `valor4` / `etiqueta4` | `.valor4` / `.etiqueta4` | .000 / OPS |

## Opacity layers

| Class | Team | Layers | Default opacity |
|-------|------|--------|----------------|
| `AGUI_opacidad` | Águilas del Zulia | name bar + color block + crest | 0 |
| `ANZ_opacidad` | Caribes de Anzoátegui | name bar + color block + crest | 0 |
| `BRAVOS_opacidad` | Bravos de Margarita | name bar + color block + crest | 0 |
| `CARD_opacidad` | Cardenales de Lara | name bar + color block + crest | 0 |
| `LEO_opacidad` | Leones del Caracas | name bar + color block + crest | 0 |
| `MAGA_opacidad` | Navegantes del Magallanes | name bar + color block + crest | 0 |
| `TIBUS_opacidad` | Tiburones de La Guaira | name bar + color block + crest | 0 |
| `TIGRES_opacidad` | Tigres de Aragua | name bar + color block + crest | 0 |

## Image layers

Fixed image of the design. It can be swapped by path, but a controller doesn't need to.

| Class | nm | Ref ID |
|-------|----|--------|
| `textura` | `.textura` | `image_16` |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 87 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 87 | -87 | — (the entry played backwards) |

`play` enters and pauses on frame 87 (1.7 s; the JSON runs at 49.95 fps, 60 % of the design speed). No update animation: data sent while on air replaces
silently, the team included. The exit is the entry in reverse: `stop` plays `salida` (frame 87 → 0,
1.7 s, ending on the empty frame) and releases the layer when it ends. The `play` stage is active
from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it jumps to the full graphic
and exits from there.
