# Las imágenes del PREVENIDO AL BATE: el export trae el panel de LMV como una secuencia de PNG a
# pantalla completa (1920 × 1080) para algo que ocupa 479 × 533. Las recorta, sin pérdida, como
# tresenlinea.py. Va antes de prep.js, que arma el JSON con estas medidas (PRE_RECORTE).
# Uso, desde la raíz del repo: python3 herramientas/prevenido.py "$EXPORTS/PREVENIDO AL BATE" .
#
# Recorte: con las imágenes a pantalla completa, CasparCG (1080p29.97, render por CPU) repite frames
# (lo midió el 3 en línea: 52 de 186); recortadas, no.
import json, os, sys
import numpy as np
from PIL import Image

SRC, REPO = sys.argv[1:]
DST = os.path.join(REPO, 'prevenido', 'images')
RECORTE = (1441, 547, 1920, 1080)      # x0, y0, x1, y1: lo que tapa la secuencia en algún frame

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
