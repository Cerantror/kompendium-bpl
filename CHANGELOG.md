# Historia zmian

Najnowsze zmiany są na górze. Data wersji jest też widoczna na stronie (blok „Kontakt i zgłoszenia”) i na okładce PDF.

## 19.11.2026 – poprawki zapisu pytań ULC

Treść wszystkich 903 pytań została porównana z plikiem ULC `bpl.pdf`. Numery pytań, kolejność odpowiedzi (klucz) i treść zgadzają się z plikiem. Poprawiony został tylko zapis – w 843 polach (pytaniach lub odpowiedziach) w 362 pytaniach.

**Co się nie zmienia:** klucz odpowiedzi, numery pytań, adnotacje, odnośniki do wyjaśnień i zapisane w przeglądarce postępy.

### Zgodność z plikiem ULC

- Wielka litera na początku odpowiedzi i kropka na końcu – tak jak w pliku ULC (482 pola), np. „serię błysków czerwonych” → „Serię błysków czerwonych.”.
- Przecinki, brakujący znak zapytania i dwa znaki stopnia przeniesione z pliku ULC, np. „Osobie która…” → „Osobie, która…”, „pomiędzy 10 a 11°” → „pomiędzy 10° a 11°”.
- PL010-0128: „lotniczego o.” → „lotniczego.” (w pliku ULC jest „lotniczegoo.”; wcześniejsza poprawka była błędna).

### Błędy zapisu, które są w pliku ULC

- **Stopnie, indeksy, jednostki** (45 pól): „15 0C” → „15°C”, „300C” → „30°C”, „m3” → „m³”, „N/m2” → „N/m²”, „O2” → „O₂”, „CO2” → „CO₂”, „Mpa” → „MPa”, „Gz +” → „Gz+”.
- **Nawiasy i cudzysłowy** (53 pola): ukośniki użyte jako nawiasy zamienione na nawiasy („/FIR/” → „(FIR)”), proste i niedomknięte cudzysłowy zamienione na „polskie”, usunięte spacje wewnątrz nawiasów.
- **Sklejone wyrazy** (13 pól): np. „+Gxdziałanie … w kierunkupleców” → „+Gx – działanie … w kierunku pleców”, „oczyi” → „oczy i”, „innychrównoczesnych” → „innych równoczesnych”.
- **Literówki** (39 pól): atmoferze → atmosferze, bedzie → będzie, Bernouliego → Bernoulliego, Farenhaita → Fahrenheita, lączności → łączności, lotnoczego → lotniczego, łaczącą → łączącą, Majac → Mając, miedzy → między, naziemniej → naziemnej, Obowiązakowe → Obowiązkowe, okomodacji → akomodacji, pleceń → poleceń, połnocnym → północnym, porcjalnego → parcjalnego, Prezez → Prezes, pwawdziwe → prawdziwe, rónoleżnikiem → równoleżnikiem, sładek → składek, starowej → startowej, straty cieple → straty cieplne, wysokosciomierzu → wysokościomierzu, zatwierdzedniu → zatwierdzeniu, Zdowia → Zdrowia, MADAY → MAYDAY, Shantza / Schantza → Schanza, antychololinoalergicznych → antycholinergicznych, Dimenhydrant → Dimenhydrynat.
- **Liczby, zakresy, minusy** (75 pól): „4.000-5.500 m” → „4000–5500 m”, „60 - 80 km/h” → „60–80 km/h”, „- 10°C” → „−10°C”, „1 : 250 000” → „1:250 000”, „25000 stóp” → „25 000 stóp”.
- **Spacje i interpunkcja** (160 pól): usunięta spacja przed dwukropkiem i znakiem zapytania, dodana spacja przed jednostką („200m” → „200 m”), łącznik w wyrazach złożonych („lotniczo- lekarskim” → „lotniczo-lekarskim”), usunięty przecinek na końcu odpowiedzi.

### Poprawki, w których zapis został zinterpretowany

- PL080-0676: „[J/kg0]” → „[J/(kg·K)]”.
- PL040-0046: „Gy-+” → „Gy±”.
- PL040-0226: „od 6.000 – 8.000 mnpm” → „od 6000 do 8000 m n.p.m.”.
- PL040-0015: „Asertywność relacjach” → „Asertywność w relacjach”; PL040-0103: „przeciwwskazane w przy operowaniu” → „przeciwwskazane przy operowaniu”.
- PL040-0121: „odczuwalnymi najbardziej” → „odczuwalnym i najbardziej”.

### Celowo bez zmian (tak jest w pliku ULC)

- PL040-0249: dwie identyczne błędne odpowiedzi.
- PL040-0021: czwarta odpowiedź jest tekstem z innego pytania.
- PL050-0095: „Symbol graficzny ,, oznacza” – dwa przecinki to symbol mżawki.

### Pozostałe

- Tekst kompendium, blok „Zasady lotu”: ujednolicona pisownia „w paskalach”.
- Dodana historia zmian (ten plik) i link do niej w bloku „Kontakt i zgłoszenia”.
- README: nowa sekcja o tym, czym treść pytań różni się od pliku ULC.

## 16.11.2026 – instrukcja i linki

- Dodana [INSTRUKCJA.md](INSTRUKCJA.md) – instrukcja korzystania z kompendium dla kursantów.
- Blok „Kontakt i zgłoszenia”: linki do repozytorium, zgłoszeń na GitHubie (Issues), strony online, PDF i CSV.
- README, instrukcja i okładka PDF podają adres strony.

## 15.11.2026 – pierwsza wersja

- 12 bloków wiedzy: droga do licencji BPL, 9 przedmiotów egzaminu ULC, praktyka na balonie SP-BFN, ściągawka liczb.
- 116 pytań kontrolnych z wyjaśnieniami i 903 pytania z bazy ULC; quiz w trybie nauki i egzamin próbny.
- Odnośnik od każdego pytania do fragmentu kompendium, który je wyjaśnia, z powrotem do testu.
- Zasada „klucz ULC ma zawsze rację” i 24 adnotacje przy pytaniach, w których klucz różni się od obecnych przepisów lub od fizyki.
- Wersja PDF do druku i baza pytań ULC w pliku CSV.
