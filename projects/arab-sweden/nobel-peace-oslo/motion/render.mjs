// usage: node render.mjs sheet  |  node render.mjs video out.mp4
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
const mode = process.argv[2], out = process.argv[3] || 'out.mp4';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
await page.goto('file://' + path.resolve('video.html'));
await page.evaluate(() => document.fonts.ready);
if (mode === 'sheet') {
  const times = [0.3, 2.5, 5, 8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 59];
  for (const [i, t] of times.entries()) { await page.evaluate(t => seek(t), t); await page.screenshot({ path: `sheet/f${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
} else {
  const FPS = 30, TOTAL = 60;
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', FPS, '-c:v', 'mjpeg', '-i', '-', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
    '-map', '0:v', '-map', '1:a', '-t', TOTAL, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out].map(String), { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let f = 0; f < FPS * TOTAL; f++) {
    await page.evaluate(t => seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log('frame', f);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
