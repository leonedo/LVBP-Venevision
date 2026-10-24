# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Opacity keys** (`*_opacidad`) — send `1` to show the layer, `0` to hide it.
> **Markers** — `play` and `stop` control playback.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Posiciones:** the standings, full screen: eight rows, top to bottom, each with the team's bar
(its crest as a watermark), its name and JJ, JG, JP, AVE and DIF. The background, the POSICIONES
title, the column labels and the GoGo Royal panel are fixed (a JPG sequence): they take no data.

The keys are those of the IVC standings in LVBP-Stats (`muestraIVC.muestraTablaPosiciones`), so a
controller builds both the same way: `equipo<n>`, `JJequipo<n>`, `JGequipo<n>`, `JPequipo<n>`,
`AVEequipo<n>` and `DIFequipo<n>`, with `<n>` the row, 1 (top) to 8. Two differences with IVC:

- **Team name:** send the **short name** (`LEONES`, the `nombre_equipo` column), not the full one
  that IVC sends (`nombre_completo_equipo`). Up to `MAGALLANES` and `CARDENALES` keep the design
  size; `ÁGUILAS DEL ZULIA` shrinks to 67 %, `LEONES DEL CARACAS` to 57 %.
- **Team bar:** no `logo_equipo<n>` (IVC sends an image path). Each row stacks the bars of the 8
  teams, one key each: `<SIGLAS><n>_opacidad`, with the crest abbreviations of the score (`AGUI`,
  `ANZ` Caribes, `BRAVOS`, `CARD`, `LEO`, `MAGA`, `TIBUS`, `TIGRES`). Send `1` to the team in that
  row and `0` to the other seven, **in every row**: all 64 start visible, and a row that only gets
  its `1` keeps the design's team on top (Águilas, Bravos, Cardenales, Caribes, Leones, Magallanes,
  Tiburones, Tigres, rows 1 to 8).

**Numbers:** `DIFequipo<n>` as IVC sends it (`--` for the leader). JJ, JG and JP take 3 digits,
AVE `1.000` and DIF `10.5` at the design size; longer ones shrink within their column.

```json
{
  "equipo1": "LEONES",
  "JJequipo1": "20",
  "JGequipo1": "13",
  "JPequipo1": "7",
  "AVEequipo1": ".650",
  "DIFequipo1": "--",
  "AGUI1_opacidad": "0",
  "ANZ1_opacidad": "0",
  "BRAVOS1_opacidad": "0",
  "CARD1_opacidad": "0",
  "LEO1_opacidad": "1",
  "MAGA1_opacidad": "0",
  "TIBUS1_opacidad": "0",
  "TIGRES1_opacidad": "0",
  "equipo2": "TIBURONES",
  "JJequipo2": "20",
  "JGequipo2": "12",
  "JPequipo2": "8",
  "AVEequipo2": ".600",
  "DIFequipo2": "1",
  "AGUI2_opacidad": "0",
  "ANZ2_opacidad": "0",
  "BRAVOS2_opacidad": "0",
  "CARD2_opacidad": "0",
  "LEO2_opacidad": "0",
  "MAGA2_opacidad": "0",
  "TIBUS2_opacidad": "1",
  "TIGRES2_opacidad": "0",
  "equipo3": "CARIBES",
  "JJequipo3": "20",
  "JGequipo3": "11",
  "JPequipo3": "9",
  "AVEequipo3": ".550",
  "DIFequipo3": "2",
  "AGUI3_opacidad": "0",
  "ANZ3_opacidad": "1",
  "BRAVOS3_opacidad": "0",
  "CARD3_opacidad": "0",
  "LEO3_opacidad": "0",
  "MAGA3_opacidad": "0",
  "TIBUS3_opacidad": "0",
  "TIGRES3_opacidad": "0",
  "equipo4": "MAGALLANES",
  "JJequipo4": "20",
  "JGequipo4": "10",
  "JPequipo4": "10",
  "AVEequipo4": ".500",
  "DIFequipo4": "3",
  "AGUI4_opacidad": "0",
  "ANZ4_opacidad": "0",
  "BRAVOS4_opacidad": "0",
  "CARD4_opacidad": "0",
  "LEO4_opacidad": "0",
  "MAGA4_opacidad": "1",
  "TIBUS4_opacidad": "0",
  "TIGRES4_opacidad": "0",
  "equipo5": "ÁGUILAS",
  "JJequipo5": "20",
  "JGequipo5": "10",
  "JPequipo5": "10",
  "AVEequipo5": ".500",
  "DIFequipo5": "3",
  "AGUI5_opacidad": "1",
  "ANZ5_opacidad": "0",
  "BRAVOS5_opacidad": "0",
  "CARD5_opacidad": "0",
  "LEO5_opacidad": "0",
  "MAGA5_opacidad": "0",
  "TIBUS5_opacidad": "0",
  "TIGRES5_opacidad": "0",
  "equipo6": "CARDENALES",
  "JJequipo6": "20",
  "JGequipo6": "9",
  "JPequipo6": "11",
  "AVEequipo6": ".450",
  "DIFequipo6": "4",
  "AGUI6_opacidad": "0",
  "ANZ6_opacidad": "0",
  "BRAVOS6_opacidad": "0",
  "CARD6_opacidad": "1",
  "LEO6_opacidad": "0",
  "MAGA6_opacidad": "0",
  "TIBUS6_opacidad": "0",
  "TIGRES6_opacidad": "0",
  "equipo7": "TIGRES",
  "JJequipo7": "20",
  "JGequipo7": "8",
  "JPequipo7": "12",
  "AVEequipo7": ".400",
  "DIFequipo7": "5",
  "AGUI7_opacidad": "0",
  "ANZ7_opacidad": "0",
  "BRAVOS7_opacidad": "0",
  "CARD7_opacidad": "0",
  "LEO7_opacidad": "0",
  "MAGA7_opacidad": "0",
  "TIBUS7_opacidad": "0",
  "TIGRES7_opacidad": "1",
  "equipo8": "BRAVOS",
  "JJequipo8": "20",
  "JGequipo8": "7",
  "JPequipo8": "13",
  "AVEequipo8": ".350",
  "DIFequipo8": "6",
  "AGUI8_opacidad": "0",
  "ANZ8_opacidad": "0",
  "BRAVOS8_opacidad": "1",
  "CARD8_opacidad": "0",
  "LEO8_opacidad": "0",
  "MAGA8_opacidad": "0",
  "TIBUS8_opacidad": "0",
  "TIGRES8_opacidad": "0"
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 151 |
| Duration | 5.07 s |

Full screen and opaque: from frame 1 the background covers the video (a grey screen with a
diagonal line, as in the design). Frame 0 is empty: nothing shows before `play`.

## Text layers

**They start empty:** what isn't sent isn't on air (the design's sample text, `XXXXXXXXX`, `56`,
`.300` and `2`, is not). All are box text: a longer string shrinks to fit instead of overflowing,
always on one line. The names appear letter by letter (frames 41–66), the numbers fade in (60–70).

| Row | Name | JJ | JG | JP | AVE | DIF |
|-----|------|----|----|----|-----|-----|
| 1 | `equipo1` | `JJequipo1` | `JGequipo1` | `JPequipo1` | `AVEequipo1` | `DIFequipo1` |
| 2 | `equipo2` | `JJequipo2` | `JGequipo2` | `JPequipo2` | `AVEequipo2` | `DIFequipo2` |
| 3 | `equipo3` | `JJequipo3` | `JGequipo3` | `JPequipo3` | `AVEequipo3` | `DIFequipo3` |
| 4 | `equipo4` | `JJequipo4` | `JGequipo4` | `JPequipo4` | `AVEequipo4` | `DIFequipo4` |
| 5 | `equipo5` | `JJequipo5` | `JGequipo5` | `JPequipo5` | `AVEequipo5` | `DIFequipo5` |
| 6 | `equipo6` | `JJequipo6` | `JGequipo6` | `JPequipo6` | `AVEequipo6` | `DIFequipo6` |
| 7 | `equipo7` | `JJequipo7` | `JGequipo7` | `JPequipo7` | `AVEequipo7` | `DIFequipo7` |
| 8 | `equipo8` | `JJequipo8` | `JGequipo8` | `JPequipo8` | `AVEequipo8` | `DIFequipo8` |

## Team bars

| Team | Row 1 | Row 2 | Row 3 | Row 4 | Row 5 | Row 6 | Row 7 | Row 8 |
|------|-------|-------|-------|-------|-------|-------|-------|-------|
| Águilas | `AGUI1_opacidad` | `AGUI2_opacidad` | `AGUI3_opacidad` | `AGUI4_opacidad` | `AGUI5_opacidad` | `AGUI6_opacidad` | `AGUI7_opacidad` | `AGUI8_opacidad` |
| Caribes | `ANZ1_opacidad` | `ANZ2_opacidad` | `ANZ3_opacidad` | `ANZ4_opacidad` | `ANZ5_opacidad` | `ANZ6_opacidad` | `ANZ7_opacidad` | `ANZ8_opacidad` |
| Bravos | `BRAVOS1_opacidad` | `BRAVOS2_opacidad` | `BRAVOS3_opacidad` | `BRAVOS4_opacidad` | `BRAVOS5_opacidad` | `BRAVOS6_opacidad` | `BRAVOS7_opacidad` | `BRAVOS8_opacidad` |
| Cardenales | `CARD1_opacidad` | `CARD2_opacidad` | `CARD3_opacidad` | `CARD4_opacidad` | `CARD5_opacidad` | `CARD6_opacidad` | `CARD7_opacidad` | `CARD8_opacidad` |
| Leones | `LEO1_opacidad` | `LEO2_opacidad` | `LEO3_opacidad` | `LEO4_opacidad` | `LEO5_opacidad` | `LEO6_opacidad` | `LEO7_opacidad` | `LEO8_opacidad` |
| Magallanes | `MAGA1_opacidad` | `MAGA2_opacidad` | `MAGA3_opacidad` | `MAGA4_opacidad` | `MAGA5_opacidad` | `MAGA6_opacidad` | `MAGA7_opacidad` | `MAGA8_opacidad` |
| Tiburones | `TIBUS1_opacidad` | `TIBUS2_opacidad` | `TIBUS3_opacidad` | `TIBUS4_opacidad` | `TIBUS5_opacidad` | `TIBUS6_opacidad` | `TIBUS7_opacidad` | `TIBUS8_opacidad` |
| Tigres | `TIGRES1_opacidad` | `TIGRES2_opacidad` | `TIGRES3_opacidad` | `TIGRES4_opacidad` | `TIGRES5_opacidad` | `TIGRES6_opacidad` | `TIGRES7_opacidad` | `TIGRES8_opacidad` |

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 76 | stage `pause`, order 1, `stop: "salida"` |
| `stop` | 0 | 1 | — (frame 0, empty) |
| `salida` | 76 | 76 | — (the entry in reverse) |

`play` enters and pauses on frame 75 (2.5 s): the grey screen holds (frames 1–11), the background
and the frame sweep in (12–64), the team bars drop in (29–44), the black name boxes grow (38–49), the
names appear (41–66) and the numbers fade in while they rise (60–75). No update animation: data sent
while on air replaces silently. `stop` plays `salida` (frame 76 → 151, 2.5 s): the entry in reverse,
ending on the grey screen and then an empty frame, a cut to the video, as it enters; it releases the
layer when it ends. The `play` stage is active from frame 0, so a `stop` that arrives mid-entry also
plays `salida`: it jumps to the full table and exits from there.
