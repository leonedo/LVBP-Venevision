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

**Team:** all 8 teams start hidden (`opacity: 0` in `index.html`). Send `1` for the team at bat
and `0` for the others. Each key turns on the team's bar (top left, with its crest and name), the
two doors in the team's colors and its crest on them. Without a team the doors don't show. The
teams overlap, so if you switch teams you have to turn off the previous one.

**Lineup:** one row per batting slot, 1 to 9 top to bottom: position (`posicionN`) and player
(`jugadorN`). Below, the manager (`manager`).

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
  "posicion1": "2B",
  "jugador1": "ALÍ CASTILLO",
  "posicion2": "CF",
  "jugador2": "JAISON CHOURIO",
  "posicion3": "BD",
  "jugador3": "AEVERSON ARTEAGA",
  "posicion4": "1B",
  "jugador4": "ISAÍAS TEJEDA",
  "posicion5": "3B",
  "jugador5": "ANGELO CASTELLANO",
  "posicion6": "RF",
  "jugador6": "GABRIEL MARTÍNEZ",
  "posicion7": "LF",
  "jugador7": "WILSON GARCÍA",
  "posicion8": "C",
  "jugador8": "JOSÉ GODOY",
  "posicion9": "SS",
  "jugador9": "LUIS LIMA",
  "manager": "JOSÉ ALGUACIL"
}
```

`posicionN` and `jugadorN` are the keys of the LVBP-Meridiano `ofensiva`, so a controller can send
both graphics the same payload. Meridiano's `valorN`, `equipo` and `informacion` don't exist here
(no stat column; the team name is part of the bar image): they are ignored. `manager` is new: send
it always, or the design's `NOMBRE APELLIDO` stays on air.

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 91 |
| Duration | 3.04 s |

Full screen. Frame 0 is empty: nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing. Player names, first name
and surname as in the design: up to about 21 characters keep the design size (`ALEXANDER
MONASTERIOS` fits); longer ones shrink within their bar, the same in every row. The manager, up to
about 19. An empty string leaves the row's bar empty. `rotulomanager` (`MGR`) and `titulo` are
fixed in the design: a controller doesn't need to send them.

| Class | nm | Default text |
|-------|----|-------------|
| `titulo` | `.titulo` | OFENSIVA |
| `posicion1` | `.posicion1` | 2B |
| `jugador1` | `.jugador1` | NOMBRE APELLIDO |
| `posicion2` | `.posicion2` | 2B |
| `jugador2` | `.jugador2` | NOMBRE APELLIDO |
| `posicion3` | `.posicion3` | 2B |
| `jugador3` | `.jugador3` | NOMBRE APELLIDO |
| `posicion4` | `.posicion4` | 2B |
| `jugador4` | `.jugador4` | NOMBRE APELLIDO |
| `posicion5` | `.posicion5` | 2B |
| `jugador5` | `.jugador5` | NOMBRE APELLIDO |
| `posicion6` | `.posicion6` | 2B |
| `jugador6` | `.jugador6` | NOMBRE APELLIDO |
| `posicion7` | `.posicion7` | 2B |
| `jugador7` | `.jugador7` | NOMBRE APELLIDO |
| `posicion8` | `.posicion8` | 2B |
| `jugador8` | `.jugador8` | NOMBRE APELLIDO |
| `posicion9` | `.posicion9` | 2B |
| `jugador9` | `.jugador9` | NOMBRE APELLIDO |
| `rotulomanager` | `.rotulomanager` | MGR |
| `manager` | `.manager` | NOMBRE APELLIDO |

## Opacity layers

| Class | Team | Layers | Default opacity |
|-------|------|--------|----------------|
| `AGUI_opacidad` | Águilas del Zulia | bar + 2 doors + 2 crest halves | 0 |
| `ANZ_opacidad` | Caribes de Anzoátegui | bar + 2 doors + 2 crest halves | 0 |
| `BRAVOS_opacidad` | Bravos de Margarita | bar + 2 doors + 2 crest halves | 0 |
| `CARD_opacidad` | Cardenales de Lara | bar + 2 doors + 2 crest halves | 0 |
| `LEO_opacidad` | Leones del Caracas | bar + 2 doors + 2 crest halves | 0 |
| `MAGA_opacidad` | Navegantes del Magallanes | bar + 2 doors + 2 crest halves | 0 |
| `TIBUS_opacidad` | Tiburones de La Guaira | bar + 2 doors + 2 crest halves | 0 |
| `TIGRES_opacidad` | Tigres de Aragua | bar + 2 doors + 2 crest halves | 0 |

`1` shows the crest on the doors at the design's 49 % (`index.html` applies it to the image).

## Image layers

Fixed images of the design. They can be swapped by path, but a controller doesn't need to.

| Class | nm | Ref ID |
|-------|----|--------|
| `campo` | `.campo` | `image_10` |
| `basecolor` | `.basecolor` | `image_11` |
| `logoatrapa` | `.logoatrapa` | `image_12` |
| `textura` | `.textura` | `image_13` |
| `texturapuertaizq` | `.texturapuertaizq` | `image_1` |
| `texturapuertader` | `.texturapuertader` | `image_1` |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 90 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 90 | -90 | — (the entry played backwards) |

`play` enters and pauses on frame 90 (3 s). No update animation: data sent while on air replaces
silently, the team included. The exit is the entry in reverse: `stop` plays `salida` (frame 90 → 0,
3 s: the rows go out, the doors close and it ends on the empty frame) and releases the layer when
it ends. The `play` stage is active from frame 0, so a `stop` that arrives mid-entry also plays
`salida`: it jumps to the full graphic and exits from there.
