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

**3 en línea:** the three batters due up, top to bottom, under the 3 EN LÍNEA title. The Empire
Keeway panel that opens it and the title are fixed (a PNG sequence): they take no data.

**Names:** send **the first initial and the surname** (`J. CASTILLO`): that keeps the three rows at
the design size. Up to about 12 characters fit (`F. RODRÍGUEZ`, `A. HERNÁNDEZ`); longer ones shrink
a little within the row (`A. MONASTERIOS` to 90 %). A full name usually doesn't fit (`JOSÉ
CASTILLO` does; `ALEXANDER MONASTERIOS` shrinks to 58 %), and the three rows end up at different
sizes. An empty string leaves the row empty.

**Same keys as the batters of the LVBP-Venevision `parcial`** (`jugador1`–`jugador3`, the three due
up after the inning), but not the same text: the `parcial` takes the surname alone.

```json
{
  "jugador1": "J. ALCÁNTARA",
  "jugador2": "I. TEJEDA",
  "jugador3": "F. RODRÍGUEZ"
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 242 |
| Duration | 8.07 s |

Bottom right (x 1441–1758, y 753–952 on air; y 555 up while the panel is in). Frame 0 is empty:
nothing shows before `play`.

## Text layers

**All text layers start empty:** a key that isn't sent shows nothing (the design's sample text,
in the table, is not on air). Send every key.

All are box text: a longer string shrinks to fit instead of overflowing, always on one line. They
appear letter by letter, one after the other (frames 40–60).

| Class | nm | Design text (starts empty) |
|-------|----|-------------|
| `jugador1` | `.jugador1` | IVAN MEDINA |
| `jugador2` | `.jugador2` | IVAN MEDINA |
| `jugador3` | `.jugador3` | IVAN MEDINA |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 197 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 197 | 45 | — (the box's entry in reverse, without the panel) |

`play` enters and pauses on frame 196 (6.5 s): the Empire Keeway panel comes in, the box grows
under it (frames 16–43) and the names appear (40–60); the panel shows its logos with a shine and
leaves to the right (177–193). The names are on air from 2 s. No update animation: data sent while
on air replaces silently. `stop` plays `salida` (frame 197 → 241, 1.5 s): the names disappear in
reverse, last one first, and the box closes, its own entry in reverse, ending on an empty frame; it
releases the layer when it ends. The `play` stage is active from frame 0, so a `stop` that arrives
mid-entry also plays `salida`: it jumps to the box with the names, without the panel, and exits
from there.
