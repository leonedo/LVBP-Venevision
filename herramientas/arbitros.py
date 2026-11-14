# Las imágenes de los ÁRBITROS (el export es IDENTIFICADOR UMPIRES): todo el gráfico, salvo los textos,
# es una secuencia de 151 PNG a pantalla completa (1920 × 1080, 17,5 MB) para algo que ocupa 853 × 656
# abajo a la izquierda. Las recorta, sin pérdida, como prevenido.py. Va antes de prep.js, que arma el
# JSON con estas medidas (ARB_RECORTE) y deja sólo los frames que se usan (ARB_QUIETO).
# Uso, desde la raíz del repo: python3 herramientas/arbitros.py "$EXPORTS/IDENTIFICADOR UMPIRES" .
#
# Recorte: con las imágenes a pantalla completa, CasparCG (1080p29.97, render por CPU) repetía frames
# en el 3 en línea; recortadas, no.
import json, os, sys
import numpy as np
from PIL import Image

SRC, REPO = sys.argv[1:]
DST = os.path.join(REPO, 'arbitros', 'images')
RECORTE = (0, 321, 853, 977)           # x0, y0, x1, y1: lo que tapa la secuencia en algún frame

d = json.load(open(os.path.join(SRC, 'data.json')))
os.makedirs(DST, exist_ok=True)
x0, y0, x1, y1 = RECORTE
for a in d['assets']:
    if 'p' not in a: continue
    if (a['w'], a['h']) != (1920, 1080): raise SystemExit(f'{a["p"]}: {a["w"]} × {a["h"]}, no es de pantalla completa')
    im = Image.open(os.path.join(SRC, a['u'], a['p']))
    alfa = np.asarray(im.convert('RGBA'))[..., 3].copy()
    alfa[y0:y1, x0:x1] = 0
    if alfa.any(): raise SystemExit(f'{a["p"]}: tiene algo fuera de RECORTE: medirlo de nuevo')
    im.crop(RECORTE).save(os.path.join(DST, a['p']), optimize=True)
