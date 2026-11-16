"""Buduje kompendium: docs/index.html (strona z quizem) i docs/baza-pytan-ulc-2025.csv.

Użycie:
    python3 scripts/build.py                  # strona + CSV
    python3 scripts/build.py --fragment PLIK   # dodatkowo wersja bez <html>/<head>/<body> (do osadzenia)

Kolejność: scripts/link_refs.py (odnośniki pytanie → fragment tekstu) → złożenie strony z src/ → eksport CSV.
"""
import csv, io, json, os, re, runpy, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
read = lambda *a: io.open(P(*a), encoding='utf-8').read()

SUBJECTS = {  # prefiks numeru pytania ULC → przedmiot egzaminu
    'PL010': 'Prawo lotnicze', 'PL024': 'Ogólna wiedza o SP', 'PL030': 'Wykonanie i planowanie lotu',
    'PL040': 'Człowiek', 'PL050': 'Meteorologia', 'PL060': 'Nawigacja', 'PL070': 'Procedury operacyjne',
    'PL080': 'Zasady lotu', 'PL090': 'Łączność', 'PL100': 'Procedury operacyjne',
}


def build_page():
    version = read('VERSION').strip()
    head, body, js = read('src', 'shell_head.html'), read('src', 'shell_body.html'), read('src', 'shell_script.js')
    bdir = P('build', 'blocks')
    blocks = ''.join(io.open(os.path.join(bdir, f), encoding='utf-8').read() for f in sorted(os.listdir(bdir)) if f.endswith('.html'))
    blocks = blocks.replace('<section class="block" id="start"', '<section class="block on" id="start"', 1)
    body = body.replace('{{BLOCKS}}', blocks).replace('{{WERSJA}}', version)
    own = json.load(open(P('data', 'own.json'), encoding='utf-8'))
    bank = json.load(open(P('data', 'bank.json'), encoding='utf-8'))
    refs = json.load(open(P('build', 'refs.json')))
    for i, q in enumerate(own):
        q['r'] = refs['K%d' % (i + 1)]
    for q in bank:
        q['r'] = refs[q['id']]
    data = json.dumps({'own': own, 'bank': bank}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    html = head + body
    scripts = '<script type="application/json" id="qdata">' + data + '</script>\n<script>\n' + js + '</script>\n'

    ids = re.findall(r'\sid="([^"]+)"', html)
    bad = [i for i in ids if not re.fullmatch(r'[A-Za-z0-9-]+', i)]
    dup = sorted({i for i in ids if ids.count(i) > 1})
    missing = sorted(h for h in set(re.findall(r'href="#([^"]+)"', html)) if h not in ids)
    print('Strona: %d KB | pytania ULC: %d | kontrolne: %d' % (len((html + scripts).encode()) // 1024, len(bank), len(own)))
    if bad or dup or missing:
        raise SystemExit('Błędy w HTML – niepoprawne id: %s | powtórzone id: %s | brakujące kotwice: %s' % (bad, dup, missing))

    m = re.search(r'<title>.*?</title>', head)
    title, rest = m.group(0), head[:m.start()] + head[m.end():]
    rest = re.sub(r'<meta name="claude:[^>]*>\n?', '', rest)
    full = ('<!doctype html>\n<html lang="pl">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n' + title + '\n'
            '<meta name="description" content="Kompendium do egzaminu teoretycznego BPL w ULC: wiedza z 9 przedmiotów, '
            'pytania kontrolne i pełna baza pytań ULC z quizem i egzaminem próbnym.">\n'
            + rest.strip() + '\n</head>\n<body>\n' + body.strip() + '\n' + scripts + '</body>\n</html>\n')
    os.makedirs(P('docs'), exist_ok=True)
    io.open(P('docs', 'index.html'), 'w', encoding='utf-8').write(full)
    if '--fragment' in sys.argv:
        dst = sys.argv[sys.argv.index('--fragment') + 1]
        io.open(dst, 'w', encoding='utf-8').write(head + body + scripts)
        print('Fragment:', dst)


def export_csv():
    bank = json.load(open(P('data', 'bank.json'), encoding='utf-8'))
    with io.open(P('docs', 'baza-pytan-ulc-2025.csv'), 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f, delimiter=';', lineterminator='\r\n')
        w.writerow(['Numer', 'Przedmiot', 'Pytanie', 'Odpowiedź poprawna (ODP1)', 'ODP2', 'ODP3', 'ODP4', 'Adnotacja'])
        for q in bank:
            w.writerow([q['id'], SUBJECTS[q['id'][:5]], q['q']] + q['a'] + [q.get('adn', '')])
    print('CSV: %d pytań, %d z adnotacją' % (len(bank), sum(1 for q in bank if q.get('adn'))))


if __name__ == '__main__':
    runpy.run_path(P('scripts', 'link_refs.py'), run_name='__main__')
    build_page()
    export_csv()
