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

**Team:** all 8 teams start hidden (`opacity: 0` in `index.html`). Send `1` for the team on
defense and `0` for the others. Each key turns on the team's bar (top left, with its crest and
name), the two doors in the team's colors and its crest on them. Without a team the doors are
blue. The teams overlap, so if you switch teams you have to turn off the previous one.

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
  "jugadorcatcher": "W.PEREZ",
  "jugadorlanzador": "R.LOPEZ",
  "jugadorprimerabase": "A.CABRERA",
  "jugadorsegundabase": "H.CASTRO",
  "jugadortercerabase": "J.ESCOBAR",
  "jugadorshortstop": "A.CAMPUSANO",
  "jugadorleftfield": "L.SIUSBEL",
  "jugadorcenterfield": "E.ROSARIO",
  "jugadorrightfield": "C.RODRIGUEZ"
}
```

These are the keys of the LVBP-Meridiano `defensiva`, so a controller can send both graphics the
same payload. Meridiano's `equipo` and `lineaparainformacion` don't exist here (the team name is
part of the bar image): they are ignored.

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 54 |
| Duration | 1.80 s |

Full screen. Frame 0 is empty: nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing. The players (`jugador…`)
fit about 10 letters at the design size (`ABCDEFGHIJ`; `F.RODRÍGUEZ` goes from 20 to 19,
`A.CAMPUSANO` to 17); longer ones shrink within their bar. An empty string leaves the bar empty.
The position labels (`catcher` … `rightfield`) and `titulo` are fixed in the design: a controller
doesn't need to send them.

| Class | nm | Default text |
|-------|----|-------------|
| `jugadorcatcher` | `.jugadorcatcher` | APELLIDO |
| `jugadorlanzador` | `.jugadorlanzador` | APELLIDO |
| `jugadorrightfield` | `.jugadorrightfield` | APELLIDO |
| `jugadorleftfield` | `.jugadorleftfield` | APELLIDO |
| `jugadorcenterfield` | `.jugadorcenterfield` | APELLIDO |
| `jugadortercerabase` | `.jugadortercerabase` | APELLIDO |
| `jugadorprimerabase` | `.jugadorprimerabase` | APELLIDO |
| `jugadorsegundabase` | `.jugadorsegundabase` | APELLIDO |
| `jugadorshortstop` | `.jugadorshortstop` | APELLIDO |
| `catcher` | `.catcher` | C |
| `lanzador` | `.lanzador` | P |
| `tercerabase` | `.tercerabase` | 3B |
| `rightfield` | `.rightfield` | RF |
| `leftfield` | `.leftfield` | LF |
| `centerfield` | `.centerfield` | CF |
| `primerabase` | `.primerabase` | 1B |
| `segundabase` | `.segundabase` | 2B |
| `shortstop` | `.shortstop` | SS |
| `titulo` | `.titulo` | DEFENSIVA |

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
| `campo` | `.campo` | `image_15` |
| `basecolor` | `.basecolor` | `image_16` |
| `logoatrapa` | `.logoatrapa` | `image_17` |
| `textura` | `.textura` | `image_18` |
| `texturapuertader` | `.texturapuertader` | `image_texturapuertas` |
| `texturapuertaizq` | `.texturapuertaizq` | `image_texturapuertas` |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 53 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 53 | -53 | — (the entry played backwards) |

`play` enters and pauses on frame 53 (1.8 s). No update animation: data sent while on air replaces
silently, the team included. The exit is the entry in reverse: `stop` plays `salida` (frame 53 → 0,
1.8 s: the doors close and it ends on the empty frame) and releases the layer when it ends. The
`play` stage is active from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it
jumps to the full graphic and exits from there.
