# Kompendium pilota balonowego (BPL)

Interaktywne kompendium do egzaminu teoretycznego na licencję pilota balonowego **BPL** w Urzędzie Lotnictwa Cywilnego. Cała wiedza z 9 przedmiotów egzaminu w jednym miejscu, pytania kontrolne z wyjaśnieniami i pełna baza **903 przykładowych pytań ULC** ([plik ULC z 4.04.2025](https://ulc.gov.pl/_download/personel_lotniczy/lke/bpl.pdf)) z quizem i egzaminem próbnym.

**Strona: [cerantror.github.io/kompendium-bpl](https://cerantror.github.io/kompendium-bpl/)**

Kompendium powstało na podstawie kursu BPL w FBSN i oficjalnej bazy pytań ULC. Przygotował je Mateusz Korona.

## Co jest w środku

- **12 bloków wiedzy**: droga do licencji BPL, 9 przedmiotów egzaminu ULC, praktyka na balonie SP-BFN i ściągawka liczb.
- **Quiz** w dwóch trybach: nauka (od razu widzisz poprawną odpowiedź i wyjaśnienie) oraz egzamin próbny z liczbą pytań, czasem i progiem 75% jak w ULC.
- **1019 pytań**: 116 pytań kontrolnych z wyjaśnieniami i 903 pytania z bazy ULC.
- **Odnośnik przy każdym pytaniu**: po złej odpowiedzi przechodzisz do fragmentu kompendium, który wyjaśnia pytanie, i jednym kliknięciem wracasz do testu.
- Kalkulatory, checklisty, tryb jasny i ciemny. Strona to jeden plik HTML – działa też offline.
- **Wersja PDF** do druku: spis treści, wszystkie bloki, pytania kontrolne i cała baza ULC z odpowiedziami.

## Jak korzystać

| Co | Gdzie |
| --- | --- |
| Strona z quizem | online: [cerantror.github.io/kompendium-bpl](https://cerantror.github.io/kompendium-bpl/); offline: pobierz [`docs/index.html`](docs/index.html) i otwórz go w przeglądarce |
| PDF do druku | [`docs/Kompendium-BPL.pdf`](docs/Kompendium-BPL.pdf) |
| Baza pytań ULC w arkuszu | [`docs/baza-pytan-ulc-2025.csv`](docs/baza-pytan-ulc-2025.csv) – separator `;`, kodowanie UTF-8 |

Wyniki quizu i listę pytań, w których się pomyliłeś, zapisuje tylko Twoja przeglądarka.

**Pełna instrukcja dla kursanta** – wyszukiwarka, tryb nauki i egzamin próbny, wyjaśnienia z powrotem do testu, adnotacje, postępy, kalkulatory, checklisty i plan nauki: [INSTRUKCJA.md](INSTRUKCJA.md).

## Klucz ULC ma zawsze rację

Na egzaminie liczy się odpowiedź z klucza ULC – także wtedy, gdy opiera się na dawnych przepisach albo jest merytorycznie wątpliwa. Kompendium i quiz traktują ją jako poprawną. Tam, gdzie klucz różni się od obecnych przepisów lub od fizyki (np. wysokościomierz, dawne krajowe przepisy o tlenie i lotach nocnych, stare wytyczne pierwszej pomocy), pod tekstem i pod odpowiedzią w quizie jest **adnotacja** z wyjaśnieniem. W bazie jest 24 takich pytań.

## Zgłaszanie błędów i pomysłów

Zauważyłeś błąd w treści, pytanie ze złą odpowiedzią, odnośnik do niewłaściwego fragmentu albo masz pomysł na nową funkcję?

- załóż [zgłoszenie (Issue)](../../issues/new/choose) – są gotowe szablony,
- albo napisz: **korona.mateusz@gmail.com**. W quizie przy każdym pytaniu jest link „Zgłoś problem z tym pytaniem”, który wypełnia temat wiadomości za Ciebie.

Poprawki mile widziane jako pull requesty – zobacz niżej, jak zbudować kompendium.

## Struktura repozytorium

```
src/
  shell_head.html      nagłówek strony: style (kolory, tryb ciemny, układ)
  shell_body.html      szkielet strony: pasek, menu, quiz, kontakt; {{BLOCKS}} = bloki wiedzy
  shell_script.js      logika strony: nawigacja, quiz, egzamin próbny, odnośniki, kalkulatory
  blocks/NN_nazwa.html bloki wiedzy – jeden plik = jeden blok
data/
  bank.json            903 pytania ULC (pierwsza odpowiedź = klucz ULC, adn = adnotacja)
  own.json             pytania kontrolne (pierwsza odpowiedź poprawna, e = wyjaśnienie)
  refs_manual.json     ręczne poprawki odnośników pytanie → fragment tekstu
scripts/
  link_refs.py         łączy każde pytanie z fragmentem tekstu, który je wyjaśnia
  build.py             składa stronę docs/index.html i eksportuje CSV
  build_pdf.py         buduje PDF (dwa przebiegi – numery stron w spisie treści)
pdf/
  render.js            render PDF w Chromium (Playwright)
  transform.js         zamienia stronę na dokument do druku (okładka, spis, dodatki z pytaniami)
  print.css            style druku
docs/                  gotowe pliki do publikacji (GitHub Pages): strona, PDF, CSV
INSTRUKCJA.md          instrukcja korzystania z kompendium dla kursantów
VERSION                data wersji pokazywana na stronie i w PDF
```

## Jak edytować treść

- **Tekst kompendium** – pliki `src/blocks/*.html`. Każdy blok to `<section class="block" id="…" data-title="…" data-group="…">`. Fragmenty, które odpowiadają tylko na pytania z bazy ULC, są na końcu bloku w sekcji „Z bazy ULC – do zapamiętania”.
- **Adnotacja w tekście** – wewnątrz punktu listy: `<span class="adn"><b>Adnotacja:</b> …</span>`.
- **Pytania kontrolne** – `data/own.json`: `{"b": "<id bloku>", "q": "pytanie", "a": ["poprawna", "zła", "zła", "zła"], "e": "wyjaśnienie"}`, opcjonalnie `"adn"`. Pytania mają numery K1, K2… według kolejności w pliku, więc nowe dopisuj na końcu.
- **Baza ULC** – `data/bank.json`. Nie zmieniaj treści pytań ani klucza (poza oczywistymi literówkami). Zastrzeżenia do klucza wpisuj jako `"adn"`.
- **Odnośniki** – tworzą się automatycznie. Jeśli pytanie prowadzi do złego fragmentu, dopisz do `data/refs_manual.json` wpis `"ID_PYTANIA": "<id bloku>|<fragment tekstu docelowego punktu>"`. Pytania o niskiej pewności dopasowania lądują w `build/refs_review.json`.
- **Data wersji** – plik `VERSION`.

Po każdej zmianie przebuduj pliki w `docs/` i dodaj je do commita.

## Budowanie

Strona i CSV (Python 3.9+):

```sh
pip install -r requirements.txt
python3 scripts/build.py
```

Skrypt sprawdza, czy każde z 1019 pytań ma odnośnik do tekstu i czy w HTML nie ma powtórzonych identyfikatorów ani pustych kotwic – przy błędzie przerywa budowanie.

PDF (dodatkowo Node.js 18+):

```sh
npm install
npx playwright install chromium
python3 scripts/build_pdf.py
```

## Licencja

- **Treść kompendium** (`src/blocks/`, `data/own.json`, adnotacje oraz strona i PDF w `docs/`) – [CC BY-NC-SA 4.0](LICENSE-CONTENT.md): możesz kopiować i przerabiać z podaniem autora, niekomercyjnie i na tych samych warunkach.
- **Kod** (`scripts/`, `pdf/`, `src/shell_*`) – [MIT](LICENSE).
- **Pytania z bazy ULC** (`data/bank.json` poza adnotacjami) pochodzą z publicznego pliku Urzędu Lotnictwa Cywilnego i nie są objęte licencją repozytorium.

## Zastrzeżenie

Kompendium jest pomocą do nauki, a nie oficjalnym materiałem ULC ani szkoły lotniczej. W sprawach przepisów rozstrzygają aktualne akty prawne, AIP Polska i instrukcja użytkowania balonu (AFM).
