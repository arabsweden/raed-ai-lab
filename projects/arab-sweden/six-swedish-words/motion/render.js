const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
(async () => {
  const [mode, dir, outArg] = process.argv.slice(2);
  const groups = JSON.parse(fs.readFileSync(path.join(dir, 'groups.json'), 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + path.join(dir, 'overlay.html'));
  const fonts = await page.evaluate(g => window.init(g), groups);
  console.error('fonts:', fonts.join(', '), '| errors:', errs.length ? errs : 'none');
  const stage = await page.$('#stage');
  if (mode === 'check') {
    for (const t of outArg.split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await stage.screenshot({ path: path.join(dir, `chk_${t}.png`), omitBackground: true });
    }
  } else {
    const fps = 24, total = 75.35, N = Math.round(total * fps);
    const ff = spawn('ffmpeg', ['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','png','-i','-',
      '-c:v','qtrle','-pix_fmt','argb', outArg], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) {
      await page.evaluate(t => window.seek(t), f / fps);
      const buf = await stage.screenshot({ type: 'png', omitBackground: true });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 120 === 0) console.error('frame', f, '/', N);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
