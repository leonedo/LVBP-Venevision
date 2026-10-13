# Keyframes de cada capa (los precomps corridos por su st): para ver dónde termina la entrada.
# Uso: python3 herramientas/kf.py <data.json> [...]
import json, sys
def times(o, acc):
    if isinstance(o, dict):
        if o.get('a') == 1 and isinstance(o.get('k'), list):
            for kf in o['k']:
                if isinstance(kf, dict) and 't' in kf: acc.append(kf['t'])
        for v in o.values(): times(v, acc)
    elif isinstance(o, list):
        for v in o: times(v, acc)
def run(path):
    d = json.load(open(path))
    comps = {a['id']: a for a in d['assets'] if 'layers' in a}
    print('#', path, 'op', d['op'], 'markers', [(m['cm'][:20], round(m['tm'],1), round(m['dr'],1)) for m in d.get('markers', [])])
    allt = []
    for i, l in enumerate(d['layers']):
        acc = []
        times(l.get('ks'), acc); times(l.get('shapes'), acc); times(l.get('t'), acc); times(l.get('masksProperties'), acc)
        if l.get('ty') == 0:
            sub = []
            for cl in comps[l['refId']]['layers']:
                times(cl, sub)
            st = l.get('st', 0)
            acc += [t + st for t in sub]
        acc = sorted(set(round(t, 1) for t in acc))
        allt += acc
        print(f" [{i}] {l.get('nm')!r:40} ip={round(l['ip'],1)} op={round(l['op'],1)} kf={acc}")
    print(' ALL kf range', min(allt) if allt else None, max(allt) if allt else None)
for p in sys.argv[1:]: run(p)
