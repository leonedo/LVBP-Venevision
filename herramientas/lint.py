# Lint estructural de los gráficos del repo: lo que el ojo no ve en un render (mattes, parents,
# clases, markers, assets, y que data.md e index.html coincidan con el JSON).
# Uso: python3 herramientas/lint.py
import json, re, sys, os
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
problems = []
def p(g, msg): problems.append(f'{g}: {msg}')
GRAFICOS = sorted(g for g in os.listdir(REPO) if os.path.isfile(REPO + g + '/data.json') and os.path.isfile(REPO + g + '/index.html'))
for g in GRAFICOS:
    d = json.load(open(REPO + g + '/data.json'))
    html = open(REPO + g + '/index.html').read()
    md = open(REPO + g + '/data.md').read()
    comps = {a['id']: a for a in d['assets'] if 'layers' in a}
    def check_layers(layers, where):
        inds = [l['ind'] for l in layers]
        if len(inds) != len(set(inds)): p(g, f'{where}: ind duplicado')
        for i, l in enumerate(layers):
            if l.get('parent') is not None and l['parent'] not in inds: p(g, f'{where}: {l["nm"]!r} parent {l["parent"]} no existe')
            if l.get('tt'):
                if i == 0 or not layers[i-1].get('td'): p(g, f'{where}: {l["nm"]!r} tiene tt pero la capa de arriba no es matte')
            if l.get('td') and (i + 1 >= len(layers) or not layers[i+1].get('tt')): p(g, f'{where}: matte {l["nm"]!r} sin capa mateada debajo')
            if l.get('ty') == 0 and l.get('refId') not in comps: p(g, f'{where}: precomp {l["nm"]!r} sin asset')
            if l.get('ty') == 2 and not any(a['id'] == l.get('refId') for a in d['assets']): p(g, f'{where}: imagen {l["nm"]!r} sin asset')
    # con glifos exportados Lottie no usa la fuente: sólo salen las letras del diseño
    if d.get('chars'): p(g, f'trae glifos (chars: {len(d["chars"])}): sólo salen esas letras')
    check_layers(d['layers'], 'main')
    for cid, c in comps.items(): check_layers(c['layers'], cid)
    cls = [l['cl'] for l in d['layers'] if l.get('cl')]
    for c in set(cls):
        if cls.count(c) > 1: p(g, f'clase duplicada {c}')
        if not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_-]*', c): p(g, f'clase inválida {c!r}')
    for l in d['layers']:
        nm = l.get('nm', '')
        if l.get('cl') and nm != '.' + l['cl']: p(g, f'nm/cl desincronizados {nm!r} / {l["cl"]!r}')
        if l.get('ty') == 5 and not l.get('cl'): p(g, f'texto sin clase {nm!r}')
        # el contenido de una clave de color u opacidad no se reemplaza: sólo cambia el CSS
        if l.get('ty') == 5 and re.search('color|opacidad', l.get('cl') or '', re.I): p(g, f'texto con clave CSS {l["cl"]!r}: el UPDATE no cambia su texto')
        # index.js pasa a mayúsculas el texto del UPDATE sólo en capas con All Caps (ca 1)
        if l.get('ty') == 5 and any(k['s'].get('ca') != 1 for k in l['t']['d']['k']): p(g, f'{nm!r} sin All Caps (ca 1)')
        # y Lottie no aplica el All Caps al texto por defecto: tiene que venir en mayúsculas
        if l.get('ty') == 5 and any(k['s']['t'] != k['s']['t'].upper() for k in l['t']['d']['k']): p(g, f'{nm!r}: texto por defecto en minúsculas')
    # markers contra el contrato de index.js
    ms = {}
    for m in d['markers']:
        name = (m.get('payload') or {}).get('name', m['cm'])
        if name in ms: p(g, f'marker repetido {name}')
        ms[name] = m
    for need in ('play', 'stop'):
        if need not in ms: p(g, f'falta marker {need}')
    for name, m in ms.items():
        pl = m.get('payload') or {}
        for ref in ('update', 'stop'):
            if pl.get(ref) and pl[ref] not in ms: p(g, f'stage {name}: {ref} → {pl[ref]} no existe')
        if pl.get('type') and pl['type'] not in ('pause', 'loop'): p(g, f'stage {name}: type {pl["type"]}')
        end = m['tm'] + m['dr']
        if not (d['ip'] <= m['tm'] <= d['op'] and d['ip'] <= end <= d['op']): p(g, f'marker {name} fuera de la timeline')
    # cada fuente en un archivo de la carpeta del gráfico (CasparCG la abre con file://)
    for f in d['fonts']['list']:
        if not f.get('fPath', '').startswith('font/') or not os.path.isfile(REPO + g + '/' + f['fPath']): p(g, f'fPath {f.get("fPath")!r}')
    for a in d['assets']:
        if 'p' in a:
            if not os.path.exists(REPO + g + '/' + a['u'] + a['p']): p(g, f'asset {a["u"]}{a["p"]} no existe')
    # data.md: cada clave del JSON documentada y cada clave documentada existe
    md_keys = set(re.findall(r'`([A-Za-z_][A-Za-z0-9_]*)`', md))
    for c in cls:
        if c not in md_keys: p(g, f'data.md no menciona la clave {c}')
    for k in re.findall(r'^\s*"([A-Za-z_][A-Za-z0-9_]*)":', md, re.M):
        if k not in cls: p(g, f'data.md: el ejemplo usa {k}, que no existe en el JSON')
    # CSS de escudos en index.html contra las clases reales
    for sel in re.findall(r'\.([A-Za-z_]+_opacidad)', html):
        if sel not in cls: p(g, f'index.html oculta .{sel}, que no existe')
    if 'data_file = "data.json"' not in html: p(g, 'index.html no carga data.json')
print('\n'.join(problems) if problems else f'lint: sin problemas ({", ".join(GRAFICOS)})')
