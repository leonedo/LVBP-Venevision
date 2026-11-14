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

**Umpires:** the four umpires of the game, one row each, top to bottom: home plate, first, second
and third base. The keys are the ones of IVC's umpires graphic (`UMPIREHOME`, `UMPIREPRIMERA`,
`UMPIRESEGUNDA`, `UMPIRETERCERA`), the same as the `arbitros` of LVBP-Meridiano, so a controller can
send all of them the same data. IVC also has `UMPIRE5` / `UMPIRE6` (left and right field, six-man
crews): this graphic has four rows and ignores them. The UMPIRES header is part of the image: it
takes no data.

**Names:** start empty: a name not sent leaves its row without a name. Send `""` to empty a row.

**Position labels:** `rotulohome`, `rotuloprimera`, `rotulosegunda`, `rotulotercera` are optional:
if they aren't sent, they read HOME, 1B, 2B, 3B (as in Meridiano).

```json
{
  "UMPIREHOME": "JORGE TERAN",
  "UMPIREPRIMERA": "ALFONSO MARQUEZ",
  "UMPIRESEGUNDA": "RAMON COVA",
  "UMPIRETERCERA": "LUIS HERNANDEZ"
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 96 |
| Duration | 3.20 s |

Bottom left (x 0–853, y 321–977): the UMPIRES bar on top and a grey panel with four blue bars below.
Frame 0 is empty: nothing shows before `play`.

## Text layers

All are box text: a longer string shrinks to fit instead of overflowing, always on one line, and
sits higher in its bar. The names are right-aligned, ending next to the position label: at the
design size a row fits about 18 characters in the first row and 15 in the fourth (the bars are
slanted: the lower ones start further right), so `FRANCISCO RODRIGUEZ` (19) shrinks a little, more
in the lower rows. The labels are centered in their column: `HOME` fits at the design size, about 4
characters. They appear letter by letter, one row after the other (frames 31–49).

| Class | nm | Default text |
|-------|----|-------------|
| `UMPIREHOME` | `.UMPIREHOME` | (empty) row 1, home plate |
| `UMPIREPRIMERA` | `.UMPIREPRIMERA` | (empty) row 2, first base |
| `UMPIRESEGUNDA` | `.UMPIRESEGUNDA` | (empty) row 3, second base |
| `UMPIRETERCERA` | `.UMPIRETERCERA` | (empty) row 4, third base |
| `rotulohome` | `.rotulohome` | HOME |
| `rotuloprimera` | `.rotuloprimera` | 1B |
| `rotulosegunda` | `.rotulosegunda` | 2B |
| `rotulotercera` | `.rotulotercera` | 3B |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 50 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 50 | 46 | — (the entry in reverse) |

`play` enters and pauses on frame 49 (1.6 s): the UMPIRES bar slides in (frames 5–17), the panel
(13–24), the blue bars (25–41) and the texts, letter by letter (31–49). No update animation: data
sent while on air replaces silently. `stop` plays `salida` (frame 50 → 95, 1.5 s), the entry in
reverse, ending on an empty frame; it releases the layer when it ends. The `play` stage is active
from frame 0, so a `stop` that arrives mid-entry also plays `salida`: it jumps to the full graphic
and exits from there.
