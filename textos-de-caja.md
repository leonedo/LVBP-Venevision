# Textos de caja — que un texto encoja en vez de salirse

Un texto de Lottie puede ser **de punto** (lo que exporta casi siempre After Effects: crece
hacia un lado sin límite) o **de caja** (tiene ancho y alto). Si es de caja y el texto no
entra, Lottie le baja el cuerpo de 1 en 1 hasta que entra.

Sirve para cualquier capa que el data puede mandar **más larga que el ejemplo del diseño**:
una fecha, un número de sorteo, un nombre. No hace falta en todas — es seguridad extra para
las que pueden crecer.

⚠ **`index.js` ya lo tiene activado.** Llama a `canResizeFont(true)` antes de cada
`updateDocumentData`, tanto en el handler de `data` como en el reloj. Basta con que la capa
sea de caja: no hay que tocar JS.

Se hace **a mano en el JSON**. El Lottie Layer Editor no tiene herramienta para esto, pero
tampoco lo pisa: conserva `sz` y `ps` al guardar (comprobado el 2026-09-12).

---

## La receta

En el documento de texto de la capa —`layer.t.d.k[i].s`, **en cada keyframe** si hay más de
uno— se agregan dos claves:

```json
"sz": [W, H],
"ps": [X, -ascent]
```

| Clave | Valor | De dónde sale |
|---|---|---|
| `ascent` | `fonts.list[<f>].ascent × s / 100` | La fuente de la capa (`f`) y su cuerpo (`s`). Ubuntu a 19 → `77.5986 × 19 / 100 = 14.7437…` |
| `ps[1]` | `-ascent` | Lottie pone la línea base en `ps[1] + ascent`: así queda en 0, donde estaba. |
| `ps[0]` | `0` si `j: 0` (izquierda) · `-W` si `j: 1` (derecha) · `-W/2` si `j: 2` (centro) | Compensa el justificado. **`j` no se toca.** |
| `sz[0]` = `W` | El ancho disponible, **en unidades de la capa** | Píxeles de pantalla ÷ la escala con la que se ve la capa (padres incluidos). |
| `sz[1]` = `H` | Entre `ascent` y `lh + ascent` | Tiene que entrar **una** línea y **no dos**. Con `s 19` y `lh 43`: entre 14,75 y 57,7. |

⚠ **`W` tiene que ser al menos el ancho del texto más largo normal.** Si el texto del diseño
no entra en `W`, parte línea y encoge — y ya no queda igual que antes.

⚠ **Copiá `ascent` con todos los decimales** (`-14.743728637695323`, no `-14.74`). Con eso
la matriz de cada letra sale idéntica, no «casi».

### Por qué queda igual — `lottie.js` 5.13.0

- `TextAnimatorProperty.getMeasures` y `ITextElement.applyTextPropertiesToMatrix`: con `ps`,
  cada letra se traslada `(ps[0], ps[1] + ascent)`; sin `ps`, nada. Con `ps[1] = -ascent`
  las dos dan 0.
- `TextProperty.completeTextData`: de punto, el justificado desplaza `-anchoLínea` (derecha)
  o `-anchoLínea/2` (centro); de caja, `ps[0] + W - anchoLínea` o `ps[0] + (W - anchoLínea)/2`.
  Con `ps[0] = -W` o `-W/2` coinciden. Con `j: 0` ninguno desplaza.
- `SVGTextLottieElement.buildNewText`: una capa sin `singleShape` (lo normal en un export)
  se pinta **letra a letra**, un `<text>` por carácter, y ese camino es el mismo para punto
  y para caja. Sólo cambia la matriz.

### Cómo encoge

`completeTextData` recorre el texto y, si una letra se pasa de `W`, **parte línea** (por el
último espacio, o por la letra si no hay: un número largo también parte). Si con eso la
altura supera `H`, baja `finalSize` en 1 y vuelve a probar, hasta que entra en una línea.

---

## ⚠ Lo que hay que saber

- **La caja se ancla arriba.** Al encoger, la línea base **sube**: a 12 px el texto queda
  unos 5 px más alto que a 19. Lottie no tiene alineación vertical; es el precio, y sólo se
  ve en los casos que antes se salían.
- **Sólo encoge si alguien llama a `canResizeFont(true)`.** `index.js` lo hace; otro
  reproductor o un render estático (`lottie_render` del editor) no: ahí un texto que no
  entra **parte en dos líneas** en vez de encoger.
- **El ancho se mide una vez por letra, y con la fuente que haya en ese momento.** Lottie
  guarda el ancho y no lo vuelve a medir. Con una fuente externa (`origin: 0`, archivo
  aparte) eso era una carrera: si la fuente no había llegado, medía con la de reserva y el
  texto **partía en dos líneas** en vez de encoger. `index.js` ya registra y **espera** las
  fuentes `origin: 0` y `3` antes de cargar la animación (`cargarFuentes()`), con un tope de `FONT_WAIT_MS`
  (2,5 s) para que una carga colgada no deje el gráfico sin salir. Lo que sigue pudiendo
  salir mal: una fuente que tarda **más** que el tope, o que no existe (404) — en los dos
  casos se mide con la de reserva, como antes, y queda un `[fuentes]` en la consola. Con la
  fuente embebida en el JSON (`origin: 3`) no hay carrera.

---

## Cómo comprobar que quedó igual

1. **Medir con el motor**, en el browser: dónde empieza el texto y dónde tiene que terminar
   (el borde de su placa, el siguiente rótulo). La escala de la capa es
   `document.querySelector('g.<clase>').getBoundingClientRect().width` entre
   `anim.renderer.elements[i].textProperty.currentData.lineWidths[0]`.
2. **Aplicar la receta**, dejando un margen (10 px de pantalla va bien).
3. **Comparar píxel a píxel** el gráfico original y el de caja, con el mismo data y en el
   mismo frame —entrada, reposo y salida—. Si hay un solo píxel distinto, `W` es corto o `ps`
   está redondeado. Truco para no tocar el archivo mientras se prueba: con Playwright,
   `page.route('**/MiAnim.json', r => r.fulfill({ body: JSON.stringify(jsonConCajas) }))`.
4. **Probar lo que no entra** y mirarlo: que encoja dentro de su espacio.

## Dónde se probó

`cue-zfx-lasuerte-templates/super6` (2026-09-12): `fecha` y `sorteo`, justificados a la
izquierda. **4 textos × 8 frames, cero píxeles distintos** y la misma matriz en cada letra.
Un sorteo de 8 cifras que antes se salía de su placa pasó a 15 px y quedó adentro. El detalle
y los números están en el `textos-de-caja.md` de ese repo.
