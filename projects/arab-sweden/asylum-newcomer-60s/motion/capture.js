const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [,, from, to, fps, outDir] = process.argv;
  const F = Number(fps || 30), a = Number(from || 0), b = Number(to || 66);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + __dirname + '/index.html');
  await page.waitForFunction(() => window.ready === true);
  const total = Math.round(b * F);
  for (let i = Math.round(a * F); i < total; i++) {
    await page.evaluate(t => window.render(t), i / F);
    const data = await page.evaluate(() => document.getElementById('c').toDataURL('image/png'));
    fs.writeFileSync(`${outDir}/${String(i).padStart(5, '0')}.png`, Buffer.from(data.split(',')[1], 'base64'));
  }
  await browser.close();
  console.log('done', total);
})();
