# Las imágenes del 3 EN LÍNEA: el export es una secuencia de PNG a pantalla completa (1920 × 1080)
# para un gráfico que ocupa 479 × 525. Las recorta, sin pérdida, y arma los frames de la salida.
# Va antes de prep.js, que arma el JSON con estas medidas (TEL_RECORTE) y con estos frames.
# Uso, desde la raíz del repo: python3 herramientas/tresenlinea.py "$EXPORTS/3 EN LINEA" .
#
# Recorte: con las imágenes a pantalla completa, CasparCG (1080p29.97, render por CPU) repetía 52 de
# los 186 frames de la entrada y la página usaba un núcleo; recortadas, ninguno, y un 10 % de núcleo
# (2026-10-22). El render queda idéntico al píxel.
#
# Salida: el export no trae, y la entrada al revés no sirve: dura 6,5 s y traería de vuelta el panel
# de Empire Keeway. Es la entrada de la caja al revés (la columna naranja, la banda, el título y el
# recuadro azul, frames 16 a 43 de la secuencia), sin el panel. El panel tapa las filas de arriba de
# la caja (de la y 753 a la de su borde de abajo, que en el 16 está en la 770 y desde el 21 en la
# 755): se reponen con la imagen fija, recortadas al ancho que tiene la caja en la primera fila
# limpia (la columna y la banda son rectángulos). Desde el 44 la caja está completa: prep.js usa la
# imagen fija.
import json, os, sys
import numpy as np
from PIL import Image

SRC, REPO = sys.argv[1:]
DST = os.path.join(REPO, 'tresenlinea', 'images')
RECORTE = (1441, 555, 1920, 1080)      # x0, y0, x1, y1: lo que tapa la secuencia en algún frame
SALIDA = range(16, 44)                 # frames de la secuencia que arma la salida
ARRIBA = 753                           # la fila de arriba de la caja (la banda), en la imagen fija
PANEL = (700, 800, 1450, 1650)         # y0, y1, x0, x1: donde se busca el borde de abajo del panel
# El azul del panel (abajo, de (0, 49, 163) a (33, 81, 193)). El tramado del título deja píxeles
# gris azulados sueltos, como (193, 198, 224), que no son panel.
def azules(z): return (z[..., 3] > 0) & (z[..., 2] > z[..., 0] + 80)

d = json.load(open(os.path.join(SRC, 'data.json')))
assets = {a['id']: a for a in d['assets']}
def rgba(asset):
    return np.asarray(Image.open(os.path.join(SRC, asset['u'], asset['p'])).convert('RGBA'))

# ---- recorte de todas las imágenes, comprobando que no queda nada afuera
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

# ---- la salida
fija = [l for l in d['layers'] if l['ty'] == 2]
seq = [l for l in d['layers'] if l['ty'] == 0]
if len(fija) != 1 or len(seq) != 1: raise SystemExit('se esperaba una imagen fija y un precomp')
fija = rgba(assets[fija[0]['refId']]).astype(float)
capas = assets[seq[0]['refId']]['layers']
def frame(k):  # el frame k de la secuencia: la capa que se ve a mitad del frame
    c = [l for l in capas if l['ip'] <= k + 0.5 < l['op']]
    if len(c) != 1: raise SystemExit(f'frame {k} de la secuencia: {len(c)} capas')
    return rgba(assets[c[0]['refId']]).astype(float)
for k in SALIDA:
    f = frame(k)
    # el borde de abajo del panel: la última fila azul (seguida desde arriba) en la franja PANEL
    z0, z1, w0, w1 = PANEL
    zona = f[z0:z1, w0:w1]
    azul = azules(zona).mean(axis=1) > 0.5
    if not azul[0]: raise SystemExit(f'frame {k}: no se encuentra el panel')
    borde = z0 + int(np.argmin(azul)) - 1 # última fila de panel
    limpia = borde + 2                    # la primera sin panel (la del medio es el suavizado)
    if not ARRIBA < limpia < ARRIBA + 30: raise SystemExit(f'frame {k}: el panel termina en la {borde}')
    out = np.zeros_like(f)
    out[limpia:] = f[limpia:]
    cobertura = f[limpia, :, 3] / 255     # el ancho de la caja en la primera fila limpia
    out[ARRIBA:limpia] = fija[ARRIBA:limpia]
    out[ARRIBA:limpia, :, 3] *= cobertura
    # nada del panel debajo de la fila limpia
    resto = out[limpia:z1, w0:w1]
    if azules(resto).any(): raise SystemExit(f'frame {k}: queda panel')
    Image.fromarray(np.rint(out).astype(np.uint8), 'RGBA').crop(RECORTE).save(os.path.join(DST, f'salida_{k}.png'), optimize=True)
print(f'{sum("p" in a for a in d["assets"])} imágenes recortadas y {len(SALIDA)} frames de salida en {DST}')
