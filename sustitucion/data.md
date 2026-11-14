# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Opacity** — keys containing `opacidad` set the CSS `opacity` of the layer with that class.
> **Markers** — `play` and `stop` control playback.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Substitution:** a lower third for the player who comes into the game (the export is INSERT
SUSTITUCION): first name and last name in two lines (`nombre`, `apellido`, the keys of this repo's
`lanzador`), the uniform number (`numerouniforme`, as in `bateador` and `lanzador`) and a free line
below (`texto`, the free line of `bateador_informacion` in LVBP-Meridiano, the one that carries
CORREDOR EMERGENTE there): `ENTRA POR J. CASTILLO`, `CORREDOR EMERGENTE`, `NUEVO LANZADOR`…

**Team:** `<SIGLAS>_opacidad`, the sigla keys of `bateador`: `AGUI`, `ANZ` (Caribes), `BRAVOS`,
`CARD`, `LEO`, `MAGA`, `TIBUS`, `TIGRES`. Each one is the team bar behind the name (the
visiting-team bars of `resultados`, Tigres in red). The eight are stacked and **all visible at
start**, as in `score`: send `1` to the team and `0` to the other seven. With no team data,
Magallanes (on top) shows.

**Texts:** start empty: a text not sent stays empty. Send `""` to empty one.

```json
{
  "nombre": "Alexander",
  "apellido": "Monasterios",
  "numerouniforme": "23",
  "texto": "Entra por J. Castillo",
  "AGUI_opacidad": 0, "ANZ_opacidad": 0, "BRAVOS_opacidad": 0, "CARD_opacidad": 0,
  "LEO_opacidad": 1, "MAGA_opacidad": 0, "TIBUS_opacidad": 0, "TIGRES_opacidad": 0
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 101 |
| Duration | 3.37 s |

Bottom left (x 0–988, y 699–965): the blue box with the ATRAPA LA EMOCIÓN logo, the team bar with the
name and the number on its right, and a grey bar with the free line below. Frames 0–11 are empty:
nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing, always on one line, and
sits higher in its box. `nombre` and `apellido` are left-aligned and end 8 px before the black box of
the number: at the design size each line fits about 11 characters (`MONASTERIOS`); each one shrinks
on its own. `numerouniforme` is centered in the black box (2 digits at the design size; `100` shrinks
a little). `texto` is left-aligned on the grey bar, about 33 characters (`ENTRA A JUGAR EL JARDÍN
IZQUIERDO`).

| Class | nm | Default text |
|-------|----|-------------|
| `nombre` | `.nombre` | (empty) first line |
| `apellido` | `.apellido` | (empty) second line |
| `numerouniforme` | `.numerouniforme` | (empty) |
| `texto` | `.texto` | (empty) the grey bar |

## Image layers (opacity only)

| Class | What |
|-------|------|
| `AGUI_opacidad` | the Águilas bar |
| `ANZ_opacidad` | the Caribes bar |
| `BRAVOS_opacidad` | the Bravos bar |
| `CARD_opacidad` | the Cardenales bar |
| `LEO_opacidad` | the Leones bar |
| `MAGA_opacidad` | the Magallanes (on top) bar |
| `TIBUS_opacidad` | the Tiburones bar |
| `TIGRES_opacidad` | the Tigres (red) bar |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 56 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 56 | 45 | — (the entry in reverse) |

`play` enters and pauses on frame 55 (1.8 s): the blue box slides in (visible from frame 12, until
28), the team bar (18–38), the grey bar and the number box (30–48), and the texts fade in (27–55).
No update animation: data sent while on air replaces silently. `stop` plays `salida` (frame 56 → 100,
1.5 s), the entry in reverse, ending on an empty frame; it releases the layer when it ends. The `play`
stage is active from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it jumps to the
full graphic and exits from there.
