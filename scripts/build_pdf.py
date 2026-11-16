"""Buduje docs/Kompendium-BPL.pdf z docs/index.html.

Wymaga: Node.js z pakietami z package.json (npm install, npx playwright install chromium) i pypdf.
Użycie: python3 scripts/build_pdf.py   (najpierw python3 scripts/build.py)

Dwa przebiegi: pierwszy ustala, na której stronie zaczyna się każdy blok (z zakładek PDF),
drugi wpisuje te numery do spisu treści na okładce.
"""
import json, os, subprocess, sys
from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
# kolejność rozdziałów w PDF (bloki z src/blocks, dodatki A i B z pdf/transform.js, kontakt na końcu)
ORDER = ['start', 'prawo', 'czlowiek', 'meteo', 'lacznosc', 'zasady', 'procedury', 'planowanie', 'wiedza',
         'nawigacja', 'sp-bfn', 'liczby', 'dodatek-a', 'dodatek-b', 'kontakt']


def render(out, pages=None):
    subprocess.run(['node', P('pdf', 'render.js'), P('docs', 'index.html'), out] + ([pages] if pages else []),
                   check=True, cwd=ROOT)


def chapter_pages(pdf):
    r = PdfReader(pdf)
    top = [it for it in r.outline if not isinstance(it, list)]
    if len(top) != len(ORDER):
        sys.exit('Nieoczekiwana liczba rozdziałów w PDF: %d (zakładki: %s)' % (len(top), [t.title for t in top]))
    return {b: r.get_destination_page_number(t) + 1 for b, t in zip(ORDER, top)}, len(r.pages)


if __name__ == '__main__':
    os.makedirs(P('build'), exist_ok=True)
    first, pages_json, final = P('build', 'pass1.pdf'), P('build', 'pdf-pages.json'), P('docs', 'Kompendium-BPL.pdf')
    render(first)
    pages, _ = chapter_pages(first)
    json.dump(pages, open(pages_json, 'w'))
    render(final, pages_json)
    check, n = chapter_pages(final)
    if check != pages:
        sys.exit('Numery stron zmieniły się między przebiegami – uruchom ponownie.')
    print('PDF: %s (%d stron)' % (os.path.relpath(final, ROOT), n))
