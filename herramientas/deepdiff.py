# Diferencias entre dos Lottie capa por capa, emparejando por nombre (no por índice).
# Uso: python3 herramientas/deepdiff.py <publicado.json> <nuevo.json> [nmNuevo=nmPublicado ...]
#   (los pares mapean capas que el diseñador renombró)
import json, sys
def norm_nm(nm): return (nm or '').strip()
def walk(a, b, path, out, ignore=('ind','parent','nm','cl')):
    if type(a) != type(b):
        out.append((path, a, b)); return
    if isinstance(a, dict):
        for k in sorted(set(a) | set(b)):
            if len(path.split('/')) == 1 and k in ignore: continue
            if k not in a: out.append((path+'/'+k, '<missing>', b[k]))
            elif k not in b: out.append((path+'/'+k, a[k], '<missing>'))
            else: walk(a[k], b[k], path+'/'+k, out)
    elif isinstance(a, list):
        if len(a) != len(b):
            out.append((path+f' len', len(a), len(b)))
        for i, (x, y) in enumerate(zip(a, b)): walk(x, y, f'{path}[{i}]', out)
    else:
        if isinstance(a, float) or isinstance(b, float):
            if abs(a - b) > 1e-6: out.append((path, a, b))
        elif a != b: out.append((path, a, b))
def short(v):
    s = json.dumps(v, ensure_ascii=False)
    return s if len(s) < 140 else s[:137]+'...'
A = json.load(open(sys.argv[1])); B = json.load(open(sys.argv[2]))
rename = dict(x.split('=') for x in sys.argv[3:])  # map nmB=nmA
la = {norm_nm(l['nm']): l for l in A['layers']}
lb = {norm_nm(l['nm']): l for l in B['layers']}
for nmb, l in lb.items():
    nma = rename.get(nmb, nmb)
    if nma not in la:
        print('ONLY IN NEW:', repr(nmb)); continue
    out = []
    walk(la[nma], l, nmb, out)
    for p, x, y in out: print(f'{p}: {short(x)} -> {short(y)}')
for nma in la:
    if nma not in [rename.get(n, n) for n in lb]: print('ONLY IN CURRENT:', repr(nma))
# precomps
ca = {a['id']: a for a in A['assets']}; cb = {a['id']: a for a in B['assets']}
for k in cb:
    out = []
    if k in ca: walk(ca[k], cb[k], 'asset:'+k, out)
    for p, x, y in out: print(f'{p}: {short(x)} -> {short(y)}')
