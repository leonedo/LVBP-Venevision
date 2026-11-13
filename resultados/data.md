# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Opacity layers** — send a number from `0` (transparent) to `1` (fully opaque).
> **Image layers** — send the image path (relative to the template, or a `file:///` URL).
> **Markers** — `play` puts the graphic on air, empty; an invoke picks the version (three, two or one
> game) and starts it; `stop` takes it out.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Results (RESULTADOS):** the final scores of the day's other games, full screen and opaque. Over the
LVBP background (with a slow zoom that keeps going in the pause), a blue panel with the RESULTADOS
title and up to three games, top to bottom, each one with the visitor bar (crest and name) on the
left, the two scores in black boxes in the middle and the home bar on the right. Above the panel, the
sponsor box (`publicidad`) comes in, stays about 8 s and closes, and the ATRAPA LA EMOCIÓN logo
replaces it, turning in, with a shine. Unlike `otrosjuegos` (ASÍ VAN), there is no inning: these are
finished games.

**Same keys as `otrosjuegos`** for what they show, with **the game number at the end** (`1` the top
game, `3` the bottom one): the team bars, the team names (`NOMBREVISITA1`, `NOMBRELOCAL1`), the runs
(`CARRERASVISITA1`, `CARRERASLOCAL1`) and the title (`titulo`). The client can send the same data to
both: `sede<n>`, `inning<n>` and the inning arrows are simply ignored here. The sponsor box takes the
`publicidad` key, like `parcial`.

**Team bars:** the 16 of each game start visible and overlap, 8 per side: in each game, send `1` for
the two that play and `0` for the other fourteen. The visitor's side takes
`<TEAM>VISITA<n>_opacidad`, the home side `<TEAM>LOCAL<n>_opacidad` (table below). Each bar carries
its team's crest (on the left for the visitor, on the right for home); Tigres is red. With no data,
Magallanes shows on every bar.

**Team names:** `NOMBREVISITA1`–`3` / `NOMBRELOCAL1`–`3`, the short name (`LEONES`), written on each
bar between the crest and the scores. Up to `MAGALLANES` and `CARDENALES` fit at the design size;
longer ones shrink within the bar.

**Runs:** `CARRERASVISITA1`–`3` / `CARRERASLOCAL1`–`3`. Two digits fit at the design size; `100`
shrinks a little.

**Title:** `titulo`, RESULTADOS in the design. It is the only text that doesn't start empty: send it
only to change it (a longer title shrinks within its black box).

**Sponsor:** `publicidad`, an image (default: Tu Azar.com). The box is 316 × 200 px; an image of any
proportion fits whole, centered (`meet`). `""` or a path that doesn't load leave the box empty, with
its grey frame. It only shows in the first part of the entry (until about 8.9 s after the invoke):
in the pause the ATRAPA LA EMOCIÓN logo, fixed, is in its place.

**Three, two or one game: the client always picks the version**, as in `otrosjuegos`. `play` puts the
graphic on air on an empty frame and waits there; an invoke right after it picks the version and
starts it: `goto('tresjuegos')`, `goto('dosjuegos')` or `goto('unjuego')`. Each one is a full graphic
with its own entry, pause and exit; with two games they're games `1` and `2`, with one, game `1`. With
fewer games the title and the games move down, centered where the three-game block was (76 px with
two games, 153 with one).

```
CG 1-10 PLAY 1
CG 1-10 INVOKE 1 "goto('tresjuegos')"
```

- `play` alone shows nothing: without the invoke the graphic stays on air, empty. A late invoke
  only delays the entry: nothing of another version ever shows.
- Always `play` first: `goto` without `play` doesn't put the graphic on air (it won't pause, and a
  later `CG STOP` is dropped), and a `play` after it goes back to the empty wait.
- The keys are the same for the three: a two-game graphic ignores the game 3 keys, a one-game
  graphic those of games 2 and 3.
- To change the number of games, take the graphic out (`stop`) and put it in again. Don't send
  `next`: it would jump from one version to the next.

```json
{
  "NOMBREVISITA1": "LEONES",
  "CARRERASVISITA1": "5",
  "NOMBRELOCAL1": "MAGALLANES",
  "CARRERASLOCAL1": "3",
  "LEOVISITA1_opacidad": 1,
  "AGUIVISITA1_opacidad": 0,
  "ANZVISITA1_opacidad": 0,
  "BRAVOSVISITA1_opacidad": 0,
  "CARDVISITA1_opacidad": 0,
  "MAGAVISITA1_opacidad": 0,
  "TIBUSVISITA1_opacidad": 0,
  "TIGRESVISITA1_opacidad": 0,
  "MAGALOCAL1_opacidad": 1,
  "AGUILOCAL1_opacidad": 0,
  "ANZLOCAL1_opacidad": 0,
  "BRAVOSLOCAL1_opacidad": 0,
  "CARDLOCAL1_opacidad": 0,
  "LEOLOCAL1_opacidad": 0,
  "TIBUSLOCAL1_opacidad": 0,
  "TIGRESLOCAL1_opacidad": 0,
  "NOMBREVISITA2": "TIGRES",
  "CARRERASVISITA2": "2",
  "NOMBRELOCAL2": "CARDENALES",
  "CARRERASLOCAL2": "10",
  "TIGRESVISITA2_opacidad": 1,
  "AGUIVISITA2_opacidad": 0,
  "ANZVISITA2_opacidad": 0,
  "BRAVOSVISITA2_opacidad": 0,
  "CARDVISITA2_opacidad": 0,
  "LEOVISITA2_opacidad": 0,
  "MAGAVISITA2_opacidad": 0,
  "TIBUSVISITA2_opacidad": 0,
  "CARDLOCAL2_opacidad": 1,
  "AGUILOCAL2_opacidad": 0,
  "ANZLOCAL2_opacidad": 0,
  "BRAVOSLOCAL2_opacidad": 0,
  "LEOLOCAL2_opacidad": 0,
  "MAGALOCAL2_opacidad": 0,
  "TIBUSLOCAL2_opacidad": 0,
  "TIGRESLOCAL2_opacidad": 0,
  "NOMBREVISITA3": "CARIBES",
  "CARRERASVISITA3": "7",
  "NOMBRELOCAL3": "AGUILAS",
  "CARRERASLOCAL3": "6",
  "ANZVISITA3_opacidad": 1,
  "AGUIVISITA3_opacidad": 0,
  "BRAVOSVISITA3_opacidad": 0,
  "CARDVISITA3_opacidad": 0,
  "LEOVISITA3_opacidad": 0,
  "MAGAVISITA3_opacidad": 0,
  "TIBUSVISITA3_opacidad": 0,
  "TIGRESVISITA3_opacidad": 0,
  "AGUILOCAL3_opacidad": 1,
  "ANZLOCAL3_opacidad": 0,
  "BRAVOSLOCAL3_opacidad": 0,
  "CARDLOCAL3_opacidad": 0,
  "LEOLOCAL3_opacidad": 0,
  "MAGALOCAL3_opacidad": 0,
  "TIBUSLOCAL3_opacidad": 0,
  "TIGRESLOCAL3_opacidad": 0
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 1544 |
| Duration | 51.5 s (the wait on frame 0, and three versions: 100–544, 600–1044, 1100–1544) |

Full screen and opaque from the first frame of the entry. Frame 0, where `play` waits, is empty, and
so is the end of each exit: it cuts from and to the video.

## Text layers

**All text layers but `titulo` start empty:** a key that isn't sent shows nothing (the design's
sample text, in the table, is not on air). Send every key.

All are box text: a longer string shrinks to fit instead of overflowing.

| Class | nm | Design text |
|-------|----|-------------|
| `titulo` | `.titulo` | RESULTADOS (stays: it doesn't start empty) |
| `NOMBREVISITA1` / `NOMBREVISITA2` / `NOMBREVISITA3` | `.NOMBREVISITA1` … | MAGALLANES (starts empty) |
| `NOMBRELOCAL1` / `NOMBRELOCAL2` / `NOMBRELOCAL3` | `.NOMBRELOCAL1` … | MAGALLANES (starts empty) |
| `CARRERASVISITA1` / `CARRERASVISITA2` / `CARRERASVISITA3` | `.CARRERASVISITA1` … | 00 (starts empty) |
| `CARRERASLOCAL1` / `CARRERASLOCAL2` / `CARRERASLOCAL3` | `.CARRERASLOCAL1` … | 00 (starts empty) |

## Image layers

| Class | What | Default |
|-------|------|---------|
| `publicidad` | the sponsor box, 316 × 200, `xMidYMid meet` | Tu Azar.com |

## Opacity layers

| Team | Game 1, visitor / home | Game 2, visitor / home | Game 3, visitor / home |
|------|------------------------|------------------------|------------------------|
| Águilas del Zulia | `AGUIVISITA1_opacidad` / `AGUILOCAL1_opacidad` | `AGUIVISITA2_opacidad` / `AGUILOCAL2_opacidad` | `AGUIVISITA3_opacidad` / `AGUILOCAL3_opacidad` |
| Caribes de Anzoátegui | `ANZVISITA1_opacidad` / `ANZLOCAL1_opacidad` | `ANZVISITA2_opacidad` / `ANZLOCAL2_opacidad` | `ANZVISITA3_opacidad` / `ANZLOCAL3_opacidad` |
| Bravos de Margarita | `BRAVOSVISITA1_opacidad` / `BRAVOSLOCAL1_opacidad` | `BRAVOSVISITA2_opacidad` / `BRAVOSLOCAL2_opacidad` | `BRAVOSVISITA3_opacidad` / `BRAVOSLOCAL3_opacidad` |
| Cardenales de Lara | `CARDVISITA1_opacidad` / `CARDLOCAL1_opacidad` | `CARDVISITA2_opacidad` / `CARDLOCAL2_opacidad` | `CARDVISITA3_opacidad` / `CARDLOCAL3_opacidad` |
| Leones del Caracas | `LEOVISITA1_opacidad` / `LEOLOCAL1_opacidad` | `LEOVISITA2_opacidad` / `LEOLOCAL2_opacidad` | `LEOVISITA3_opacidad` / `LEOLOCAL3_opacidad` |
| Navegantes del Magallanes | `MAGAVISITA1_opacidad` / `MAGALOCAL1_opacidad` | `MAGAVISITA2_opacidad` / `MAGALOCAL2_opacidad` | `MAGAVISITA3_opacidad` / `MAGALOCAL3_opacidad` |
| Tiburones de La Guaira | `TIBUSVISITA1_opacidad` / `TIBUSLOCAL1_opacidad` | `TIBUSVISITA2_opacidad` / `TIBUSLOCAL2_opacidad` | `TIBUSVISITA3_opacidad` / `TIBUSLOCAL3_opacidad` |
| Tigres de Aragua | `TIGRESVISITA1_opacidad` / `TIGRESLOCAL1_opacidad` | `TIGRESVISITA2_opacidad` / `TIGRESLOCAL2_opacidad` | `TIGRESVISITA3_opacidad` / `TIGRESLOCAL3_opacidad` |

All start at opacity 1.

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 0 | stage `pause`, order 1 (waits on frame 0, empty) |
| `stop` | 0 | 1 | — (frame 0, empty: the exit while waiting) |
| `tresjuegos` | 100 | 346 | stage `pause`, order 2, `stop: "salida"` (three games) |
| `salida` | 446 | 98 | — (the logo, then the entry of the games and the panel in reverse) |
| `dosjuegos` | 600 | 346 | stage `pause`, order 3, `stop: "salida2"` (two games) |
| `salida2` | 946 | 98 | — (the same, with two games) |
| `unjuego` | 1100 | 346 | stage `pause`, order 4, `stop: "salida1"` (one game) |
| `salida1` | 1446 | 98 | — (the same, with one game) |

`play` pauses on frame 0, empty, until the invoke. Counting frames from the invoke: the background
and the panel open (1–13), the sponsor box opens (0–27), the title comes in (19–42), the score boxes
(23–32), the runs (31–35), the bars (32–44) and the names, one game after the other (game 1, 34–69;
game 2, 38–73; game 3, 42–77). The data is all on air 2.6 s after the invoke. The sponsor box closes
(247–269) and the ATRAPA LA EMOCIÓN logo comes in turning (273–293), with a shine (307–345); it
pauses on 345 (11.5 s after the invoke). The background zoom (CSS) starts with the invoke and keeps
going until 16.9 s. No update animation: data sent while on air replaces silently, the teams included.

`stop` plays the version's exit (98 frames, 3.2 s): the logo's entry in reverse (20 frames), then
the entry of the games, the title and the panel in reverse, ending on an empty frame; it releases the
layer when it ends. A `stop` that arrives mid-entry also plays the exit: it jumps to the full graphic,
with the logo, and exits from there. A `stop` while waiting (no invoke yet) releases the layer at once.
