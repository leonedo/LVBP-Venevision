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
panel that opens it is fixed (a PNG sequence): it takes no data.

**Name:** send **the first initial and the surname** (`F. RODRÍGUEZ`), as for the `prevenido` of
LVBP-Meridiano (same key, same text). Up to about 13 characters keep the design size (`J. CASTILLO`,
`A. HERNÁNDEZ`, `JOSÉ CASTILLO`); longer ones shrink within the box (`A. MONASTERIOS` to 96 %,
`AEVERSON ARTEAGA` to 80 %, `ALEXANDER MONASTERIOS` to 60 %). A name that shrinks sits higher in
the box. An empty string leaves the box empty.

**Title:** `titulo` is optional: if it isn't sent, it reads PREVENIDO AL BATE (the design). The
`prevenido` of LVBP-Meridiano takes the same key with `PREVENIDO`: sent here, the title reads
PREVENIDO. It shrinks to fit the black bar (about 18 characters at the design size).

```json
{
  "jugador": "F. RODRÍGUEZ",
  "titulo": "PREVENIDO AL BATE"
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 196 |
| Duration | 6.54 s |

Bottom right (x 1441–1757, y 754–922 on air; y 547 up while the panel is in). Frame 0 is empty:
nothing shows before `play`.

## Text layers

**`jugador` starts empty:** if it isn't sent, the box shows no name (the design's sample text, in
the table, is not on air). `titulo` keeps the design's text.

Both are box text: a longer string shrinks to fit instead of overflowing, always on one line. The
name appears letter by letter (frames 36–48).

| Class | nm | Design text |
|-------|----|-------------|
| `jugador` | `.jugador` | IVAN MEDINA (starts empty) |
| `titulo` | `.titulo` | PREVENIDO AL BATE |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 170 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 170 | 26 | — (the box's entry in reverse, without the panel) |

`play` enters and pauses on frame 169 (5.6 s): the LMV panel flips in (frames 3–20), the black bar
grows under it (23–32), the title slides in (31–39), the blue box opens (33–45) and the name
appears (36–48); the panel shows its logo with a shine and leaves to the right (151–168). The name
is on air from 1.6 s. No update animation: data sent while on air replaces silently. `stop` plays
`salida` (frame 170 → 195, 0.9 s): the name disappears in reverse, the box closes, the title slides
out and the bar shrinks to nothing, ending on an empty frame; it releases the layer when it ends.
The `play` stage is active from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it
jumps to the box with the name, without the panel, and exits from there.
