# Lista las capas de un Lottie: nombre, clase, tiempos, transform y textos (con caja).
# Uso: python3 herramientas/dump.py <data.json> [...]
import json, sys
def short(v):
    s = json.dumps(v, ensure_ascii=False)
    return s if len(s) < 90 else s[:87] + '...'
def ks(p):
    # static value or first keyframe summary
    if p is None: return None
    if p.get('a') == 1:
        k = p['k']
        return 'anim[' + ','.join(f"{kf.get('t')}:{short(kf.get('s'))}" for kf in k[:6]) + (']' if len(k) <= 6 else ',...]')
    return short(p.get('k'))
def dump(path):
    d = json.load(open(path))
    print(f"# {path}\n w={d['w']} h={d['h']} fr={d['fr']} ip={d['ip']} op={d['op']} nlayers={len(d['layers'])} assets={len(d['assets'])}")
    print(' markers:', json.dumps(d.get('markers'), ensure_ascii=False))
    print(' fonts:', json.dumps(d.get('fonts'), ensure_ascii=False))
    for a in d['assets']:
        if 'layers' in a:
            print(f" asset {a['id']} precomp nlayers={len(a['layers'])}")
        else:
            print(f" asset {a['id']} {a.get('u')}{a.get('p','')[:60]} w={a.get('w')} h={a.get('h')} e={a.get('e')}")
    for i, l in enumerate(d['layers']):
        ks_ = l.get('ks', {})
        print(f" [{i}] ind={l.get('ind')} ty={l.get('ty')} nm={l.get('nm')!r} cl={l.get('cl')!r} parent={l.get('parent')} ip={l.get('ip')} op={l.get('op')} st={l.get('st')} refId={l.get('refId')} td={l.get('td')} tt={l.get('tt')} tp={l.get('tp')} hd={l.get('hd')}")
        print(f"      o={ks(ks_.get('o'))} p={ks(ks_.get('p'))} s={ks(ks_.get('s'))} a={ks(ks_.get('a'))} r={ks(ks_.get('r'))}")
        if l.get('ty') == 5:
            for kf in l['t']['d']['k']:
                s = kf['s']
                print(f"      text t={kf.get('t')} s={s.get('s')} f={s.get('f')} t={s.get('t')!r} j={s.get('j')} sz={s.get('sz')} ps={s.get('ps')} lh={s.get('lh')} tr={s.get('tr')} fc={s.get('fc')}")
for p in sys.argv[1:]:
    dump(p)
