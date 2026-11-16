"""Łączy każde pytanie (baza ULC + pytania kontrolne) z fragmentem kompendium, który je wyjaśnia.

- kandydaci: li, p, tr, dd, details, figcaption, .stat we wszystkich blokach src/blocks/*.html
- zapisuje build/refs.json {id_pytania: id_elementu} i build/refs_review.json (powiązania o niskiej pewności)
- zapisuje build/blocks/*.html: kopie bloków z dodanymi id na powiązanych elementach
Ręczne poprawki: data/refs_manual.json {id_pytania: "<blok>|<fragment tekstu elementu docelowego>"}
Pytania kontrolne mają id K1, K2, … w kolejności z data/own.json.
"""
import json, re, glob, os, math, collections, unicodedata
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)

STOP = set('''a aby albo ale ani by być był była było były bo co czy czyli dla do gdy gdzie go i ich im
ile in innych inne inny jak jaka jaki jakie jako jakiej jakim je jego jej jest jeśli jeżeli już ją kiedy kto
która które którego której który którym którzy lub ma mają mi może mogą można mu na nad nie niż o od
oraz po pod podczas przed przez przy się są ta tak także tam te tego tej ten tę to tu tym tylko w we
wszystkie wszystkich z za ze że żeby oznacza oznaczamy nazywamy nazywa określa jaką odpowiedzi
prawidłowe poprawne powyższe wymienione żadna powinien powinna powinno powinni należy musi muszą wtedy
np m.in itp itd klucz ulc wg według
'''.split())
def norm(s):
    s = unicodedata.normalize('NFC', s).lower()
    s = re.sub(r'(?<=\d)[ \u00a0\u202f.](?=\d{3}\b)', '', s)
    return re.sub(r'(?<=\d),(?=\d)', '.', s)
def toks(s):
    out = []
    for t in re.findall(r'[0-9]+(?:\.[0-9]+)?|[a-ząćęłńóśźż]+', norm(s)):
        if t in STOP or (t.isalpha() and len(t) < 2): continue
        out.append(t[:5] if t.isalpha() and len(t) > 5 else t)
    return out
TF = re.compile(r'(teza|zdani\w*|stwierdzeni\w*|oba|obie|twierdzeni\w*)\b.*\b(prawdziw|fałszyw|nieprawd)|^(prawda|fałsz|tak|nie)\b', re.I)
def answer_text(q):
    a0 = q['a'][0]
    if re.search(r'wszystkie (odpowiedzi|powyższe|wymienione)|odpowiedzi .* (są )?prawidłowe', a0.lower()): return ' '.join(q['a'][1:])
    if TF.search(a0) or len(set(toks(a0))) <= 1: return q['q'] + ' ' + a0
    return a0

SEL = 'li, p, tr, dd, details, figcaption, .stat'
soups, units = {}, []
for f in sorted(glob.glob(P('src', 'blocks', '*.html'))):
    soup = BeautifulSoup(open(f, encoding='utf-8').read(), 'html.parser')
    sec = soup.find('section'); bid = sec['id']; soups[f] = (soup, bid)
    n = 0
    for el in sec.select(SEL):
        if el.find_parent(class_='calc') or el.find_parent('header'): continue
        if el.name == 'p' and el.find_parent('li'): continue
        t = el.get_text(' ', strip=True)
        if len(t) < 8: continue
        n += 1
        uid = el.get('id') or f'x-{bid}-{n}'
        units.append({'f': f, 'b': bid, 'el': el, 'id': uid, 'text': t, 'T': set(toks(t)),
                      'ulc': bool(el.find_parent(lambda tag: False)), 'len': len(t)})
# mark units inside ULC sections (after <h3 id="*-ulc">)
for f, (soup, bid) in soups.items():
    h = soup.find('h3', id=re.compile(r'-ulc$'))
    if not h: continue
    after = set(id(x) for x in h.find_all_next())
    for u in units:
        if u['f'] == f and id(u['el']) in after: u['ulc'] = True
df = collections.Counter()
for u in units: df.update(u['T'])
N = len(units)
idf = lambda w: math.log((N + 1) / (df[w] + 1)) + 0.5
W = lambda X: sum(idf(w) for w in X)

bank = json.load(open(P('data', 'bank.json'), encoding='utf-8'))
own = json.load(open(P('data', 'own.json'), encoding='utf-8'))
for i, q in enumerate(own): q['id'] = 'K%d' % (i + 1); q['s'] = 'own'
allq = own + bank
manual = json.load(open(P('data', 'refs_manual.json'), encoding='utf-8')) if os.path.exists(P('data', 'refs_manual.json')) else {}

refs, review, used, missing_manual = {}, [], set(), []
for q in allq:
    if q['id'] in manual:
        blk, sub = manual[q['id']].split('|', 1)
        cand = [u for u in units if u['b'] == blk and sub in u['text']]
        if not cand: missing_manual.append(q['id']); print('BRAK FRAGMENTU z refs_manual.json:', q['id'], manual[q['id']]); continue
        u = min(cand, key=lambda u: u['len'])
        refs[q['id']] = u['id']; used.add(u['id']); continue
    A = set(toks(answer_text(q))); Q = set(toks(q['q'])) - A
    wa, wq = W(A) or 1, W(Q) or 1
    scored = []
    for u in units:
        sa = W(A & u['T']) / wa
        if sa < 0.12 and W(Q & u['T']) / wq < 0.5: continue
        sq = W(Q & u['T']) / wq if Q else 1
        sc = 0.62 * sa + 0.38 * sq
        if u['b'] == q['b']: sc += 0.08
        sc -= 0.03 * math.log(max(1, u['len'] / 250))
        scored.append((sc, sa, sq, u))
    scored.sort(key=lambda x: -x[0])
    if not scored:
        review.append({'id': q['id'], 'b': q['b'], 'q': q['q'], 'a': q['a'][0], 'conf': 0, 'cands': []}); continue
    sc, sa, sq, u = scored[0]
    refs[q['id']] = u['id']; used.add(u['id'])
    conf = min(sa, 1) * 0.6 + min(sq, 1) * 0.4
    NA = set(re.findall(r'[0-9]+(?:\.[0-9]+)?', norm(answer_text(q))))
    NU = set(re.findall(r'[0-9]+(?:\.[0-9]+)?', norm(u['text'])))
    weak = sa < 0.45 or sq < 0.2 or not NA <= NU
    strong = NA <= NU and ((sa >= 0.6 and sq >= 0.25) or (sa >= 0.45 and sq >= 0.5)) and u['b'] in (q['b'], 'start', 'liczby', 'sp-bfn')
    if not strong:
        review.append({'id': q['id'], 'b': q['b'], 'q': q['q'], 'a': q['a'][0], 'conf': round(conf, 2), 'weak': weak,
                       'ulc': u['ulc'] and u['b'] == q['b'], 'sa': round(sa, 2), 'sq': round(sq, 2),
                       'cands': [(x[3]['b'], round(x[1], 2), round(x[2], 2), x[3]['text'][:150], x[3]['id']) for x in scored[:3]]})

# write blocks with ids on linked elements
os.makedirs(P('build', 'blocks'), exist_ok=True)
for u in units:
    if u['id'] in used and not u['el'].get('id'): u['el']['id'] = u['id']
for f, (soup, bid) in soups.items():
    open(P('build', 'blocks', os.path.basename(f)), 'w', encoding='utf-8').write(str(soup))
json.dump(refs, open(P('build', 'refs.json'), 'w'))
json.dump(review, open(P('build', 'refs_review.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('Pytań:', len(allq), '| z odnośnikiem:', len(refs), '| do przejrzenia (build/refs_review.json):', len(review), '| fragmentów-celów:', len(used))
unlinked = [q['id'] for q in allq if q['id'] not in refs]
if unlinked or missing_manual:
    raise SystemExit('Pytania bez odnośnika: %s' % ', '.join(unlinked or missing_manual))
