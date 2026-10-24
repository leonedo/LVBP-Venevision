# data

> **For AI control agents** — This file describes the controllable interface of a Lottie animation
> prepared for CasparCG. Use it to understand **what data to send** from a control client.
> Do not use this file to modify the animation itself.
>
> **Text layers** — send the target text string using the layer's CSS class name. The graphic shows
> it in capitals, whatever the case you send.
> **Color fill layers** — send a hex color string (e.g. `#FF0000`) to change the fill color.
> **Opacity layers** — send a number from `0` (transparent) to `1` (fully opaque).
> **Image layers** — send a web-accessible path to swap the displayed image. Accepted formats:
> a full URL (`https://...`) or a relative path from the template's web root (`images/logo.png`).
> Local filesystem paths (e.g. `C:/...`) will not work — the path must be resolvable by the browser rendering the template.
> A path that doesn't load leaves the image empty instead of showing a broken-image icon.
> **Markers** — `play` and `stop` control playback; any other marker name can be triggered
> via `invoke` to drive timeline-based animations (e.g. animate-in, animate-out, transitions).

## Example payload

A control client sends a flat JSON object. Any subset of these keys is valid — omit what you don't need to change.

```json
{
  "conteobolasystrikes": "3-2",
  "outs": "OUTS",
  "inning": "10",
  "CARRERASLOCAL": "00",
  "CARRERASVISITA": "00",
  "EQUIPOVISITA": "TIG",
  "EQUIPOLOCAL": "TIG",
  "lanzador": "CHIRINOS",
  "lanzamientos": "P.45",
  "mph": "MPH",
  "velocidad": "90",
  "bateador": "CASTRO",
  "average": ".346",
  "actuacion": "2-1",
  "SEGUNDOOUT_opacidad": 100,
  "PRIMEROUT_opacidad": 100,
  "INNINGarriba_opacidad": 100,
  "INNINGabajo_opacidad": 100,
  "TERCERALLENA_opacidad": 100,
  "SEGUNDALLENA_opacidad": 100,
  "PRIMERALLENA_opacidad": 100,
  "AGUILOCAL_opacidad": 100,
  "BRAVOSLOCAL_opacidad": 100,
  "CARDLOCAL_opacidad": 100,
  "ANZLOCAL_opacidad": 100,
  "MAGALOCAL_opacidad": 100,
  "TIBUSLOCAL_opacidad": 100,
  "TIGRESLOCAL_opacidad": 100,
  "LEOLOCAL_opacidad": 100,
  "AGUIVISITA_opacidad": 100,
  "BRAVOSVISITA_opacidad": 100,
  "CARDVISITA_opacidad": 100,
  "ANZVISITA_opacidad": 100,
  "MAGAVISITA_opacidad": 100,
  "TIBUSVISITA_opacidad": 100,
  "TIGRESVISITA_opacidad": 100,
  "LEOVISITA_opacidad": 100
}
```

## Animation

| Property | Value |
|----------|-------|
| Size | 1920 × 1080 px |
| Frame rate | 29.9700012207031 fps |
| Frames | 0 – 130 |
| Duration | 4.34 s |

## Text layers

| Class | nm | Default text |
|-------|----|-------------|
| `conteobolasystrikes` | `.conteobolasystrikes` | 3-2 |
| `outs` | `.outs` | OUTS |
| `inning` | `.inning` | 10 |
| `CARRERASLOCAL` | `.CARRERASLOCAL` | 00 |
| `CARRERASVISITA` | `.CARRERASVISITA` | 00 |
| `EQUIPOVISITA` | `.EQUIPOVISITA` | TIG |
| `EQUIPOLOCAL` | `.EQUIPOLOCAL` | TIG |
| `lanzador` | `.lanzador` | CHIRINOS |
| `lanzamientos` | `.lanzamientos` | P.45 |
| `mph` | `.mph` | MPH |
| `velocidad` | `.velocidad` | 90 |
| `bateador` | `.bateador` | CASTRO |
| `average` | `.average` | .346 |
| `actuacion` | `.actuacion` | 2-1 |

## Opacity layers

| Class | nm | Default opacity |
|-------|----|----------------|
| `SEGUNDOOUT_opacidad` | `.SEGUNDOOUT_opacidad` | 100 |
| `PRIMEROUT_opacidad` | `.PRIMEROUT_opacidad` | 100 |
| `INNINGarriba_opacidad` | `.INNINGarriba_opacidad` | 100 |
| `INNINGabajo_opacidad` | `.INNINGabajo_opacidad` | 100 |
| `TERCERALLENA_opacidad` | `.TERCERALLENA_opacidad` | 100 |
| `SEGUNDALLENA_opacidad` | `.SEGUNDALLENA_opacidad` | 100 |
| `PRIMERALLENA_opacidad` | `.PRIMERALLENA_opacidad` | 100 |
| `AGUILOCAL_opacidad` | `.AGUILOCAL_opacidad` | 100 |
| `BRAVOSLOCAL_opacidad` | `.BRAVOSLOCAL_opacidad` | 100 |
| `CARDLOCAL_opacidad` | `.CARDLOCAL_opacidad` | 100 |
| `ANZLOCAL_opacidad` | `.ANZLOCAL_opacidad` | 100 |
| `MAGALOCAL_opacidad` | `.MAGALOCAL_opacidad` | 100 |
| `TIBUSLOCAL_opacidad` | `.TIBUSLOCAL_opacidad` | 100 |
| `TIGRESLOCAL_opacidad` | `.TIGRESLOCAL_opacidad` | 100 |
| `LEOLOCAL_opacidad` | `.LEOLOCAL_opacidad` | 100 |
| `AGUIVISITA_opacidad` | `.AGUIVISITA_opacidad` | 100 |
| `BRAVOSVISITA_opacidad` | `.BRAVOSVISITA_opacidad` | 100 |
| `CARDVISITA_opacidad` | `.CARDVISITA_opacidad` | 100 |
| `ANZVISITA_opacidad` | `.ANZVISITA_opacidad` | 100 |
| `MAGAVISITA_opacidad` | `.MAGAVISITA_opacidad` | 100 |
| `TIBUSVISITA_opacidad` | `.TIBUSVISITA_opacidad` | 100 |
| `TIGRESVISITA_opacidad` | `.TIGRESVISITA_opacidad` | 100 |
| `LEOVISITA_opacidad` | `.LEOVISITA_opacidad` | 100 |

The team bars (`<TEAM>VISITA_opacidad`, `<TEAM>LOCAL_opacidad`) are images stacked in the same
place and all start visible: send `1` for the team that plays and `0` for the other seven, on each
side. The keys are the ones of the LVBP-Meridiano score (`AGUI`, `ANZ` Caribes, `BRAVOS`, `CARD`,
`LEO`, `MAGA`, `TIBUS`, `TIGRES`), so a controller can send both graphics the same data.
`EQUIPOVISITA` / `EQUIPOLOCAL` are the team abbreviations written on the bars.

Text sizes: `bateador` and `lanzador` take the surname only. At the design size (21) fit about 7
letters for the batter (`CASTILLO` goes to 20, `RODRÍGUEZ` to 17) and 8 for the pitcher
(`RODRÍGUEZ` 19); longer ones shrink within their place. `velocidad` is the number alone (`MPH`
is its own layer). `inning` fits two digits (extra innings), and even `100`, at full size.

## Markers

| Name | Start (tm) | Duration (dr) | Payload |
|------|-----------|--------------|---------|
| `play` | 0 | 59 | — (the entry; it pauses in `marcador`) |
| `stop` | 0 | 1 | — (a `stop` during the entry, before `marcador`: it cuts) |
| `marcador` | 53 | 6 | stage `pause`, order 1, `stop: "salida"` |
| `jugadores` | 64 | 27 | stage `pause`, order 2, `stop: "salida_jugadores"` |
| `sinjugadores` | 100 | 26 | stage `pause`, order 3, `stop: "salida"` |
| `salida` | 59 | -59 | — (the entry played backwards) |
| `salida_jugadores` | 91 | -91 | — (the player bar goes down, then the entry backwards) |

`next` walks the stages: `marcador` (board only) → `jugadores` (batter and pitcher bar up) →
`sinjugadores` (bar down). To bring the bar up again, `goto('jugadores')`. The exit is the entry
in reverse: `stop` from `marcador` or `sinjugadores` plays `salida` (2 s); from `jugadores`,
`salida_jugadores` first lowers the bar (3 s in all). Both release the layer when they end.

## Invocación directa desde CasparCG

Sintaxis: `CG <channel>-<videoLayer> INVOKE <cg_layer> "<method>"` (en este setup `cg_layer` siempre es `1`).

Cada stage se puede invocar directo en vez de pasar por `goto`:

| Stage | Comando CasparCG |
|-------|------------------|
| `marcador` | `CG 1-10 INVOKE 1 "marcador()"` |
| `jugadores` | `CG 1-10 INVOKE 1 "jugadores()"` |
| `sinjugadores` | `CG 1-10 INVOKE 1 "sinjugadores()"` |

Los `()` son obligatorios. `1-10` es ejemplo (`<channel>-<videoLayer>`), sustituir por el setup real.
