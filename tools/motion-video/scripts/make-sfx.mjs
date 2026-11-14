#!/usr/bin/env node
// مؤثرات صوتية مخصصة لحركات الحروف — مولّدة بالكود (بدون عينات ولا حقوق).
//   node scripts/make-sfx.mjs [outDir=public/sfx]
// كل صوت مصمم على حركة محددة في الفيديو، وتوقيتاته الداخلية مطابقة لفريمات الحركة (30fps).
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] || "public/sfx");
fs.mkdirSync(out, { recursive: true });
const SR = 48000;
const TAU = Math.PI * 2;

// مولّد شبه عشوائي ثابت (نفس الصوت في كل مرة)
let seed = 12345;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;

// فلتر state-variable بسيط
const svf = () => {
  let low = 0;
  let band = 0;
  return (x, f, q = 0.7) => {
    const F = 2 * Math.sin((Math.PI * Math.min(f, SR / 6)) / SR);
    low += F * band;
    const high = x - low - (1 / q) * band * 0.5;
    band += F * high;
    return { low, band, high };
  };
};

const write = (name, data, peak = 0.7) => {
  let m = 0;
  for (const v of data) m = Math.max(m, Math.abs(v));
  const g = m > 0 ? peak / m : 0;
  const buf = Buffer.alloc(44 + data.length * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + data.length * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * g)) * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(out, name), buf);
  console.log("wrote", name, (data.length / SR).toFixed(2) + "s");
};

const render = (sec, fn) => {
  const n = Math.round(sec * SR);
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) d[i] = fn(i / SR, i);
  // تلاشي ناعم بآخر 10ms لمنع الطقة
  const fade = Math.round(0.01 * SR);
  for (let i = 0; i < fade; i++) d[n - 1 - i] *= i / fade;
  return d;
};
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// 1) تمديد الكشيدة: مطاط يتمدد — النغمة تصعد بنفس منحنى التمدد (30 فريم)
{
  let ph = 0;
  const lp = svf();
  write(
    "stretch.wav",
    render(1.1, (x) => {
      const p = Math.min(1, x / 1.0);
      const f0 = 150 + 330 * easeOutCubic(p) + Math.sin(TAU * 7 * x) * 6;
      ph += (TAU * f0) / SR;
      const tone = Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.15 * Math.sin(3 * ph);
      const env = Math.min(1, x / 0.015) * (x < 0.9 ? 1 - 0.4 * p : 0.6 * Math.exp(-(x - 0.9) * 25));
      return lp(tone, 2200, 0.8).low * env;
    }),
    0.6,
  );
}

// 2) تبديل الكلمة: «فْويپ» قصير صاعد
{
  const bp = svf();
  let ph = 0;
  write(
    "slide.wav",
    render(0.26, (x) => {
      const p = x / 0.26;
      ph += (TAU * (520 + 520 * p)) / SR;
      const env = Math.sin(Math.PI * Math.pow(p, 0.7)) ** 2;
      return (bp(noise(), 900 + 2600 * p, 1.4).band * 0.9 + Math.sin(ph) * 0.18) * env;
    }),
    0.5,
  );
}

// 3) الشطب: خربشة قلم عريض
{
  const bp = svf();
  write(
    "strike.wav",
    render(0.38, (x) => {
      const p = x / 0.38;
      const grit = 0.55 + 0.45 * Math.sin(TAU * 38 * x) * Math.sin(TAU * 11 * x);
      const env = Math.min(1, x / 0.02) * (1 - p) ** 1.3;
      return bp(noise(), 2400 + 600 * Math.sin(TAU * 3 * x), 1.6).band * grit * env;
    }),
    0.5,
  );
}

// 4) العدّاد: تكّة لكل رقم (1→7) في نفس فريمات تغيّر الرقم (T.counter في src/timing.ts)
const COUNTER_FRAMES = 28;
{
  const ticks = [];
  for (let k = 2; k <= 7; k++) {
    const e = (k - 0.5 - 1) / 6;
    const t = 1 - Math.sqrt(1 - e); // معكوس easeOutQuad
    ticks.push({ at: (COUNTER_FRAMES * t) / 30, k });
  }
  write(
    "ratchet.wav",
    render(1.6, (x) =>
      ticks.reduce((s, { at, k }) => {
        const t = x - at;
        if (t < 0) return s;
        const f = 1700 + k * 110;
        return s + (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * f * 2.01 * t)) * Math.exp(-t * 90) * (k === 7 ? 1.25 : 0.9);
      }, 0),
    ),
    0.45,
  );
}

// 5) الغوص داخل الشاشة: هواء يصعد ويُسحب للداخل
{
  const bp = svf();
  const lp = svf();
  let ph = 0;
  write(
    "zoomin.wav",
    render(1.0, (x) => {
      const p = x / 0.95;
      ph += (TAU * (90 + 260 * p * p)) / SR;
      const env = p < 1 ? Math.pow(p, 1.6) : Math.exp(-(x - 0.95) * 60);
      return lp(bp(noise(), 300 + 4200 * p * p, 1.1).band + Math.sin(ph) * 0.25, 7000, 0.7).low * env;
    }),
    0.5,
  );
}

// 6) الأعمدة: 5 نغمات ماريمبا صاعدة مع كل عمود (كل 6 فريمات)
{
  const notes = [67, 69, 72, 74, 79];
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  write(
    "steps.wav",
    render(1.3, (x) =>
      notes.reduce((s, n, i) => {
        const t = x - i * 0.2;
        if (t < 0) return s;
        const f = midi(n);
        return s + (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 4 * t) * Math.exp(-t * 40)) * Math.exp(-t * 7) * Math.min(1, t / 0.002);
      }, 0),
    ),
    0.5,
  );
}

// 7) تعبئة الحبر: سائل يرتفع مع فقاعات
{
  const lp = svf();
  const bubbles = [];
  for (let i = 0; i < 14; i++) bubbles.push({ at: 0.05 + i * 0.065 + rand() * 0.03, f: 380 + i * 45 + rand() * 80 });
  write(
    "ink.wav",
    render(1.2, (x) => {
      const p = Math.min(1, x / 1.0);
      const bed = lp(noise(), 350 + 900 * p, 0.9).low * Math.sin(Math.PI * p) * 0.5;
      const b = bubbles.reduce((s, { at, f }) => {
        const t = x - at;
        if (t < 0 || t > 0.08) return s;
        return s + Math.sin(TAU * (f * t + f * 2.5 * t * t * 6)) * Math.exp(-t * 55) * 0.6;
      }, 0);
      return bed + b;
    }),
    0.5,
  );
}

// 8) سحب الحبل: صرير قصير
{
  const bp = svf();
  write(
    "rope.wav",
    render(0.45, (x) => {
      const p = x / 0.45;
      const f = 95 + 25 * Math.sin(TAU * 4 * x);
      const saw = ((x * f) % 1) * 2 - 1;
      const grains = 0.5 + 0.5 * Math.sin(TAU * 22 * x);
      return bp(saw, 900 + 400 * p, 2.2).band * grains * Math.sin(Math.PI * p);
    }),
    0.45,
  );
}

// 9) فتح الستارة: قماش ينسحب
{
  const lp = svf();
  const bp = svf();
  write(
    "curtain.wav",
    render(1.0, (x) => {
      const p = x / 1.0;
      const env = Math.sin(Math.PI * Math.pow(p, 0.6)) ** 2;
      const flutter = 0.75 + 0.25 * Math.sin(TAU * 13 * x);
      return (lp(noise(), 1300, 0.7).low * 0.8 + bp(noise(), 2600, 1.2).band * 0.25) * env * flutter;
    }),
    0.5,
  );
}

// 10) الخط البياني ينرسم: قلم يصعد مع الخط (22 فريم)
{
  const bp = svf();
  let ph = 0;
  write(
    "draw.wav",
    render(0.8, (x) => {
      const p = Math.min(1, x / 0.73);
      ph += (TAU * (300 + 500 * p)) / SR;
      const env = Math.min(1, x / 0.03) * (x < 0.73 ? 0.6 + 0.4 * p : Math.exp(-(x - 0.73) * 40));
      const scratch = bp(noise(), 1800 + 2600 * p, 2.0).band * (0.6 + 0.4 * Math.sin(TAU * 30 * x));
      return (scratch * 0.8 + Math.sin(ph) * 0.12) * env;
    }),
    0.45,
  );
}

// 11) دخول كلمة جانبيًا: «زووم» قصير ينتهي بنقرة هبوط
{
  const bp = svf();
  write(
    "land.wav",
    render(0.5, (x) => {
      const p = Math.min(1, x / 0.42);
      const air = bp(noise(), 600 + 2200 * p, 1.3).band * Math.pow(p, 1.5) * (x < 0.42 ? 1 : 0);
      const t = x - 0.42;
      const knock = t > 0 ? Math.sin(TAU * 180 * t) * Math.exp(-t * 45) * 1.2 : 0;
      return air * 0.7 + knock;
    }),
    0.5,
  );
}
