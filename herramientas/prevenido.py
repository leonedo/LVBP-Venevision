# Las imágenes del PREVENIDO AL BATE (el export del 2026-11-14, PREVENODO AL BATE ACTUALIZADO): todo
# el gráfico salvo el nombre (el panel de LMV, la barra negra con el título y el recuadro azul) es una
# secuencia de 248 PNG a pantalla completa (1920 × 1080) para algo que ocupa 316 × 483 abajo a la
# derecha. Va antes de prep.js, que arma el JSON con estas medidas (PRE_RECORTE) y los mismos frames
# (PRE_CAJA, PRE_QUIETO).
# Uso, desde la raíz del repo: python3 herramientas/prevenido.py "$EXPORTS/PREVENIDO AL BATE" .
#
# Qué hace:
# - Recorta cada imagen a RECORTE, sin pérdida (con las imágenes a pantalla completa, CasparCG,
#   1080p29.97 y render por CPU, repetía frames en el 3 en línea; recortadas, no).
# - Los PNG vienen reducidos a una paleta con tramado, y cada frame se trama distinto: con la caja
#   quieta (desde el 45), la barra, el título y el recuadro titilaban mientras se mueve el panel (de un
#   frame a otro, cientos de píxeles a más de 40 niveles en el título, y cada tanto la barra entera 29
#   niveles). Del 45 al 220, desde la fila CORTE hacia abajo (debajo del panel), va la de la imagen
#   quieta (QUIETO, la del 221, la primera sin el panel).
# - Arma la salida: los frames de la caja (CAJA, 24–44) sin el panel, salida_<k>.png. El panel sólo
#   llega a la fila CORTE − 1 en esos frames; las filas de la barra que comparte con él (755–757) van
#   con las de la imagen quieta, al ancho que tiene la barra en ese frame (en la fila CORTE).
# - Key: con el panel, la fila donde se tocan el panel y la barra (la 755) llega al 92 % en el export:
#   en el key de CasparCG quedaba una línea de 1 px de video al aire. Del 24 al 220, un píxel de las
#   filas 752–757 que tiene arriba y abajo píxeles opacos va opaco (su color, el mismo).
import json, os, sys
import numpy as np
from PIL import Image

SRC, REPO = sys.argv[1:]
DST = os.path.join(REPO, 'prevenido', 'images')
RECORTE = (1457, 555, 1773, 1038)      # x0, y0, x1, y1: lo que tapa la secuencia en algún frame
CAJA = (24, 44)                        # la barra aparece en el 24 y el recuadro termina de crecer en el 44
QUIETO = 221                           # la primera imagen sin el panel: desde ahí no cambia nada
BARRA = 755                            # la fila de arriba de la barra negra
CORTE = 758                            # de acá abajo, sólo la caja (el panel termina antes desde el 19)

d = json.load(open(os.path.join(SRC, 'data.json')))
base = [l for l in d['layers'] if l.get('refId')]
if len(base) != 1: raise SystemExit('se esperaba una sola capa de secuencia')
secuencia = next(a for a in d['assets'] if a['id'] == base[0]['refId'])
imagenes = {a['id']: a for a in d['assets'] if 'p' in a}
frames = [imagenes[l['refId']] for l in secuencia['layers']]
if len(frames) != 248: raise SystemExit(f'{len(frames)} frames: se esperaban 248')

# Una imagen armada con dos frames tiene los colores de las dos paletas (de 6 a 60 cada una): entra
# en una paleta de 256 sin perder nada, y pesa como las del export.
def guarda(rgba, nombre):
    r = np.ascontiguousarray(rgba[RECORTE[1]:RECORTE[3], RECORTE[0]:RECORTE[2]])
    colores, idx = np.unique(r.reshape(-1, 4), axis=0, return_inverse=True)
    if len(colores) > 256: raise SystemExit(f'{nombre}: {len(colores)} colores')
    im = Image.fromarray(idx.reshape(r.shape[:2]).astype(np.uint8), 'P')
    im.putpalette(colores.flatten().tolist(), rawmode='RGBA')
    im.save(os.path.join(DST, nombre), optimize=True)

os.makedirs(DST, exist_ok=True)
x0, y0, x1, y1 = RECORTE
abrir = lambda a: Image.open(os.path.join(SRC, a['u'], a['p']))
quieta = np.asarray(abrir(frames[QUIETO]).convert('RGBA'))
for k, a in enumerate(frames):
    if (a['w'], a['h']) != (1920, 1080): raise SystemExit(f'{a["p"]}: {a["w"]} × {a["h"]}, no es de pantalla completa')
    im = abrir(a)
    rgba = np.asarray(im.convert('RGBA'))
    alfa = rgba[..., 3].copy()
    alfa[y0:y1, x0:x1] = 0
    if alfa.any(): raise SystemExit(f'{a["p"]}: tiene algo fuera de RECORTE: medirlo de nuevo')
    # (en el 234, el 236 y el 247 la fila de arriba de la barra llega al 100 % y no al 82 %: tramado)
    if k > QUIETO:
        if np.abs(rgba[..., 3].astype(int) - quieta[..., 3]).max() > 50: raise SystemExit(f'{a["p"]}: cambia el alfa después de QUIETO')
        continue                       # no se usan: la del 221 queda hasta el final
    if CAJA[0] <= k < QUIETO:
        rgba = rgba.copy()
        for y in range(BARRA - 3, CORTE):
            costura = (rgba[y - 1, :, 3] == 255) & (rgba[y + 1, :, 3] == 255) & (rgba[y, :, 3] < 255)
            rgba[y, costura, 3] = 255
    if CAJA[1] < k < QUIETO:
        # (en el 121 y el 220 cambia el suavizado del borde izquierdo y derecho, hasta 32 niveles: tramado)
        if np.abs(rgba[CORTE:, :, 3].astype(int) - quieta[CORTE:, :, 3]).max() > 40:
            raise SystemExit(f'{a["p"]}: la caja cambia de forma después de CAJA')
        rgba[CORTE:] = quieta[CORTE:]
    if CAJA[0] <= k < QUIETO:
        guarda(rgba, a['p'])
    else:
        im.crop(RECORTE).save(os.path.join(DST, a['p']), optimize=True)

# la salida: la caja sin el panel
for k in range(CAJA[0], CAJA[1] + 1):
    rgba = np.asarray(abrir(frames[k]).convert('RGBA')).copy()
    if not rgba[CORTE, :, 3].any(): raise SystemExit(f'frame {k}: sin barra en la fila {CORTE}')
    xs = np.nonzero(rgba[CORTE, :, 3])[0]
    rgba[:CORTE] = 0
    rgba[BARRA:CORTE, xs.min():xs.max() + 1] = quieta[BARRA:CORTE, xs.min():xs.max() + 1]
    guarda(rgba, f'salida_{k}.png')
