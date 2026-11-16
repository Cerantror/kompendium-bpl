// Renderuje docs/index.html do PDF (A4) w Chromium przez Playwright.
// Użycie: node pdf/render.js <strona.html> <wynik.pdf> [numery-stron.json]
// Zwykle uruchamiane przez scripts/build_pdf.py (dwa przebiegi – drugi wpisuje numery stron do spisu treści).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const FONTS = [
  '@fontsource/inter/400.css', '@fontsource/inter/500.css', '@fontsource/inter/600.css',
  '@fontsource/barlow-semi-condensed/500.css', '@fontsource/barlow-semi-condensed/600.css',
  '@fontsource/barlow-semi-condensed/700.css',
  '@fontsource/jetbrains-mono/400.css', '@fontsource/jetbrains-mono/500.css',
];

(async () => {
  const [src, out, pagesFile] = process.argv.slice(2);
  if (!src || !out) { console.error('Użycie: node pdf/render.js <strona.html> <wynik.pdf> [numery-stron.json]'); process.exit(2); }
  const pages = pagesFile && fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, 'utf8')) : {};
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, colorScheme: 'light' });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  // bez sieci: czcionki z pakietów @fontsource, nie z Google Fonts
  await page.route(/^https?:/, route => route.abort());
  await page.goto('file://' + path.resolve(src), { waitUntil: 'load' });
  await page.evaluate(p => { window.__PAGES = p; }, pages);
  await page.addScriptTag({ path: path.join(__dirname, 'transform.js') });
  for (const css of FONTS) await page.addStyleTag({ url: 'file://' + require.resolve(css) });
  await page.addStyleTag({ path: path.join(__dirname, 'print.css') });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.pdf({
    path: out, format: 'A4', printBackground: true, scale: 0.85, outline: true, tagged: true,
    margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-family:Inter,sans-serif;font-size:7.5px;color:#55646F;width:100%;padding:0 14mm;display:flex;justify-content:space-between"><span>Kompendium pilota balonowego BPL</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  await browser.close();
  if (errs.length) { console.error('Błędy JS na stronie:', errs); process.exit(1); }
})();
