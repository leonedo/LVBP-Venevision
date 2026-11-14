# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Markers** — `play` and `stop` control playback.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Prevenido al bate:** the on-deck batter, one name under the PREVENIDO AL BATE title. The LMV
panel, the black bar with the title and the blue box are one PNG sequence: they take no data.

**Name:** send **the first initial and the surname** (`F. RODRÍGUEZ`), as for the `prevenido` of
LVBP-Meridiano (same key, same text). Up to about 16 characters keep the design size (`J. CASTILLO`,
`A. MONASTERIOS`); longer ones shrink within the box (`AEVERSON ARTEAGA` a little,
`ALEXANDER MONASTERIOS` to about 80 %). A name that shrinks sits higher in the box. An empty string
leaves the box empty.

**Title:** it is part of the image (PREVENIDO AL BATE) since the 2026-11-14 export. `titulo` is still
accepted, so a client that sends it doesn't break, but it changes nothing.

```json
{
  "jugador": "F. RODRÍGUEZ"
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 256 |
| Duration | 8.54 s |

Bottom right (x 1457–1773, y 755–957 on air; y 555 up while the panel is in). Frame 0 is empty:
nothing shows before `play`.

## Text layers

**`jugador` starts empty:** if it isn't sent, the box shows no name (the design's sample text, in
the table, is not on air).

Box text: a longer string shrinks to fit instead of overflowing, always on one line. The name fades
in (frames 40–56).

| Class | nm | Design text |
|-------|----|-------------|
| `jugador` | `.jugador` | JACKSON CHOURIO (starts empty) |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 222 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 222 | 34 | — (the box's entry in reverse, without the panel) |

`play` enters and pauses on frame 221 (7.4 s): the LMV panel flips down into place (frames 4–19),
the black bar with the title grows under it (24–31), the blue box opens (37–44) and the name fades in
(40–56); the panel shows its logo with a few shines and leaves upwards (216–220). The name is on air
from 1.4 s. No update animation: data sent while on air replaces silently. `stop` plays `salida`
(frame 222 → 255, 1.1 s): the name fades out, the box closes, the bar shrinks to nothing, ending on
an empty frame; it releases the layer when it ends. The `play` stage is active from frame 0, so a
`stop` that arrives mid-entry also plays `salida`: it jumps to the box with the name, without the
panel, and exits from there.
