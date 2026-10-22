# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Opacity layers** — send a number from `0` (transparent) to `1` (fully opaque).
> **Markers** — `play` puts the graphic on air, empty; an invoke picks the version (three, two or one
> game) and starts it; `stop` takes it out.

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

**Other games (ASÍ VAN):** how the day's other games are going. Three games, top to bottom, under the
ASÍ VAN title, each one with its venue, the visitor (top) and home (bottom) bars with the team name,
the runs and the inning with its arrows. The Harina PAN box that opens the graphic and leaves is
fixed (a JPG sequence): it takes no data.

**Same keys as `score` and `parcial`** for what they show, with **the game number at the end**
(`1` the top game, `3` the bottom one): the team bars, the runs (`CARRERASVISITA1`,
`CARRERASLOCAL1`), the inning and its arrows (`inning1`, `INNINGarriba1_opacidad`,
`INNINGabajo1_opacidad`) and the team names (`NOMBREVISITA1`, `NOMBRELOCAL1`, as in `parcial`).
Its own: the venue (`sede1`–`sede3`) and the title (`titulo`).

**Team bars:** as in `score`, the 16 of each game start visible and overlap, 8 per row: in each
game, send `1` for the two that play and `0` for the other fourteen. The visitor's row takes
`<TEAM>VISITA<n>_opacidad`, the home row `<TEAM>LOCAL<n>_opacidad` (table below). Each bar carries
its team's crest as a watermark. With no data, Leones shows on every row.

**Team names:** `NOMBREVISITA1`–`3` / `NOMBRELOCAL1`–`3`, the name written on each bar (`LEONES` in
the design). Up to about 9 letters keep the design size (`LEONES`, `AGUILAS`, `TIBURONES`);
`MAGALLANES` and `CARDENALES` shrink a little (to 83 %), within the bar.

**Runs:** `CARRERASVISITA1`–`3` / `CARRERASLOCAL1`–`3`. Up to three digits fit at the design size.

**Inning:** the number (`inning1`–`3`, centered between the arrows) and the arrows. Both arrows
start visible: turn off the one that doesn't apply (`INNINGarriba<n>_opacidad` ▲ is the top of the
inning, `INNINGabajo<n>_opacidad` ▼ the bottom). Two digits fit; for a finished game, `F` with both
arrows at `0` (`FINAL` fits too, smaller).

**Venue:** `sede1`–`3`, the whole text, as in the design (`EN CARACAS`), in cyan on the blue band
above each game. `EN PUERTO LA CRUZ` and `EN BARQUISIMETO` fit at the design size; longer ones shrink.

**Title:** `titulo`, ASÍ VAN in the design. It is the only text that doesn't start empty: send it only
to change it (a longer title shrinks within the box).

**Three, two or one game: the client always picks the version.** `play` puts the graphic on air on
an empty frame and waits there; an invoke right after it picks the version and starts it:
`goto('tresjuegos')`, `goto('dosjuegos')` or `goto('unjuego')`. Each one is a full graphic with its
own entry, pause and exit; with two games they're games `1` and `2`, with one, game `1` (the top
ones), stacked so that they end at the same bottom edge as the three games.

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
  "sede1": "EN BARQUISIMETO",
  "NOMBREVISITA1": "MAGALLANES",
  "CARRERASVISITA1": "3",
  "NOMBRELOCAL1": "CARDENALES",
  "CARRERASLOCAL1": "5",
  "inning1": "7",
  "INNINGarriba1_opacidad": 0,
  "INNINGabajo1_opacidad": 1,
  "MAGAVISITA1_opacidad": 1,
  "AGUIVISITA1_opacidad": 0,
  "ANZVISITA1_opacidad": 0,
  "BRAVOSVISITA1_opacidad": 0,
  "CARDVISITA1_opacidad": 0,
  "LEOVISITA1_opacidad": 0,
  "TIBUSVISITA1_opacidad": 0,
  "TIGRESVISITA1_opacidad": 0,
  "CARDLOCAL1_opacidad": 1,
  "AGUILOCAL1_opacidad": 0,
  "ANZLOCAL1_opacidad": 0,
  "BRAVOSLOCAL1_opacidad": 0,
  "LEOLOCAL1_opacidad": 0,
  "MAGALOCAL1_opacidad": 0,
  "TIBUSLOCAL1_opacidad": 0,
  "TIGRESLOCAL1_opacidad": 0,
  "sede2": "EN CARACAS",
  "NOMBREVISITA2": "TIBURONES",
  "CARRERASVISITA2": "2",
  "NOMBRELOCAL2": "LEONES",
  "CARRERASLOCAL2": "2",
  "inning2": "5",
  "INNINGarriba2_opacidad": 1,
  "INNINGabajo2_opacidad": 0,
  "TIBUSVISITA2_opacidad": 1,
  "AGUIVISITA2_opacidad": 0,
  "ANZVISITA2_opacidad": 0,
  "BRAVOSVISITA2_opacidad": 0,
  "CARDVISITA2_opacidad": 0,
  "LEOVISITA2_opacidad": 0,
  "MAGAVISITA2_opacidad": 0,
  "TIGRESVISITA2_opacidad": 0,
  "LEOLOCAL2_opacidad": 1,
  "AGUILOCAL2_opacidad": 0,
  "ANZLOCAL2_opacidad": 0,
  "BRAVOSLOCAL2_opacidad": 0,
  "CARDLOCAL2_opacidad": 0,
  "MAGALOCAL2_opacidad": 0,
  "TIBUSLOCAL2_opacidad": 0,
  "TIGRESLOCAL2_opacidad": 0,
  "sede3": "EN PUERTO LA CRUZ",
  "NOMBREVISITA3": "AGUILAS",
  "CARRERASVISITA3": "10",
  "NOMBRELOCAL3": "CARIBES",
  "CARRERASLOCAL3": "1",
  "inning3": "9",
  "INNINGarriba3_opacidad": 1,
  "INNINGabajo3_opacidad": 0,
  "AGUIVISITA3_opacidad": 1,
  "ANZVISITA3_opacidad": 0,
  "BRAVOSVISITA3_opacidad": 0,
  "CARDVISITA3_opacidad": 0,
  "LEOVISITA3_opacidad": 0,
  "MAGAVISITA3_opacidad": 0,
  "TIBUSVISITA3_opacidad": 0,
  "TIGRESVISITA3_opacidad": 0,
  "ANZLOCAL3_opacidad": 1,
  "AGUILOCAL3_opacidad": 0,
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
| Frames | 0 – 906 |
| Duration | 30.23 s (the wait on frame 0, and three versions: 100–335, 400–622, 700–906) |

Bottom right (x 1415–1732, y 566–979 on air with three games, 677–979 with two, 789–979 with one;
the Harina PAN box adds 198 px on top while it's in, from y 368 with three games). Frame 0, where
`play` waits, is empty.

## Text layers

**All text layers but `titulo` start empty:** a key that isn't sent shows nothing (the design's
sample text, in the table, is not on air). Send every key.

All are box text: a longer string shrinks to fit instead of overflowing. The venue and the names
enter letter by letter, with a blur.

| Class | nm | Design text |
|-------|----|-------------|
| `titulo` | `.titulo` | ASÍ VAN (stays: it doesn't start empty) |
| `sede1` / `sede2` / `sede3` | `.sede1` / `.sede2` / `.sede3` | EN CARACAS (starts empty) |
| `NOMBREVISITA1` / `NOMBREVISITA2` / `NOMBREVISITA3` | `.NOMBREVISITA1` … | LEONES (starts empty) |
| `NOMBRELOCAL1` / `NOMBRELOCAL2` / `NOMBRELOCAL3` | `.NOMBRELOCAL1` … | LEONES (starts empty) |
| `CARRERASVISITA1` / `CARRERASVISITA2` / `CARRERASVISITA3` | `.CARRERASVISITA1` … | 00 (starts empty) |
| `CARRERASLOCAL1` / `CARRERASLOCAL2` / `CARRERASLOCAL3` | `.CARRERASLOCAL1` … | 00 (starts empty) |
| `inning1` / `inning2` / `inning3` | `.inning1` … | 10 (starts empty) |

## Opacity layers

| Class | What | Default opacity |
|-------|------|----------------|
| `INNINGarriba1_opacidad` / `INNINGarriba2_opacidad` / `INNINGarriba3_opacidad` | ▲ top of the inning | 1 |
| `INNINGabajo1_opacidad` / `INNINGabajo2_opacidad` / `INNINGabajo3_opacidad` | ▼ bottom of the inning | 1 |

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
| `tresjuegos` | 100 | 166 | stage `pause`, order 2, `stop: "salida"` (three games) |
| `salida` | 266 | 69 | — (the column's entry in reverse, without the Harina PAN box) |
| `dosjuegos` | 400 | 166 | stage `pause`, order 3, `stop: "salida2"` (two games) |
| `salida2` | 566 | 56 | — (its column's entry in reverse) |
| `unjuego` | 700 | 166 | stage `pause`, order 4, `stop: "salida1"` (one game) |
| `salida1` | 866 | 40 | — (its column's entry in reverse) |

`play` pauses on frame 0, empty, until the invoke. `tresjuegos` enters and pauses on frame 265 (5.5 s
after the invoke). Counting frames from the invoke: the Harina PAN box comes in from the right
(11–23), opens its doors and builds its logo; under it the title comes in (27–46) and the three
games, one after the other (game 1, 41–66; game 2, 60–82; game 3, 74–95), and the box leaves to the
right (157–164). The data is all on
air 3.2 s after the invoke. No update animation: data sent while on air replaces silently, the teams
included. `stop` plays `salida` (frame 266 → 334, 2.3 s): the column's entry in reverse (game 3 first,
then 2 and 1, the title and the grey line), ending on an empty frame; it releases the layer when it
ends. A `stop` that arrives mid-entry also plays `salida`: it jumps to the full column, without the
box, and exits from there.

`dosjuegos` and `unjuego` are the same with fewer games: the box and the title come in the same way,
the games one after the other, and they pause on frames 565 and 865. `stop` plays their own exit:
`salida2` (566 → 621, 1.9 s) and `salida1` (866 → 905, 1.3 s), also ending on an empty frame and
releasing the layer. A `stop` while waiting (no invoke yet) releases the layer at once.
