import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
W = sys.argv[1]; SR = 48000; DUR = 13.4; N = int(DUR * SR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR
def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output="sos"), x)
def env(n, a, d, shape=3.0):
    e = np.ones(n); ai = max(1, int(a * SR)); e[:ai] = np.linspace(0, 1, ai)
    e[ai:] = np.exp(-np.linspace(0, shape, n - ai)) if d else 1; return e
def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR); x = x[: max(0, N - i)]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[i:i + len(x), 0] += x * gain * l * 1.414; buf[i:i + len(x), 1] += x * gain * r * 1.414
def saw(f, n, det=0.0):
    ph = np.cumsum(np.full(n, f * (1 + det)) / SR); return 2 * (ph % 1) - 1
IR = rng.standard_normal(int(2.2 * SR)) * np.exp(-np.linspace(0, 7, int(2.2 * SR)))
IR = filt(IR, "lowpass", 5000) * 0.03
def verb(x, wet=0.35): return x + wet * fftconvolve(x, IR)[: len(x)]
mus = np.zeros((N, 2)); fx = np.zeros((N, 2))

# --- MUSIC: dark D-minor pad 0–7.1, sub drone underwater, D-major lift at 11.42
def pad(freqs, dur, cutoff, a=1.2):
    n = int(dur * SR); x = np.zeros(n)
    for f in freqs:
        for d in (-0.004, 0.0, 0.005): x += saw(f, n, d)
    x = filt(x / (len(freqs) * 3), "lowpass", cutoff, 2)
    e = np.minimum(1, np.arange(n) / (a * SR)) * np.minimum(1, (n - np.arange(n)) / (0.25 * SR)); return x * e
place(mus, verb(pad([73.42, 110.0, 146.83, 174.61], 7.6, 650, 1.0)), 0.0, 0.45)
# tension pulse 4.6–7.1, accelerating
k = 4.6
while k < 7.0:
    n = int(0.35 * SR); kk = np.sin(2 * np.pi * np.cumsum(np.linspace(90, 40, n)) / SR) * np.exp(-np.linspace(0, 9, n))
    place(mus, kk, k, 0.55); k += max(0.2, 0.5 - (k - 4.6) * 0.12)
# underwater sub drone 7.1–11.5
n = int(4.6 * SR); sub = np.sin(2 * np.pi * 36.7 * np.arange(n) / SR) + 0.4 * filt(rng.standard_normal(n), "lowpass", 120)
sub *= np.minimum(1, np.arange(n) / (0.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.4 * SR))
place(mus, sub, 7.65, 0.3)
place(mus, verb(pad([73.42, 110.0], 4.0, 260, 0.6), 0.6), 7.55, 0.35)
# D-major lift + shimmer
place(mus, verb(pad([146.83, 185.0, 220.0, 293.66], 2.0, 2400, 0.25), 0.5), 11.4, 0.5)
n = int(2.0 * SR); sh = sum(np.sin(2 * np.pi * f * np.arange(n) / SR) for f in (1174.7, 1760.0, 2349.3)) / 3
sh *= (0.6 + 0.4 * np.sin(2 * np.pi * 7 * np.arange(n) / SR)) * env(n, 0.02, 1, 3.5)
place(mus, verb(sh, 0.8), 11.42, 0.18)

# --- SFX
def whoosh(dur, f0, f1, g=1.0):
    n = int(dur * SR); x = rng.standard_normal(n); out = np.zeros(n); B = 2048
    for i in range(0, n, B):
        f = f0 + (f1 - f0) * (i / n); seg = x[max(0, i - 512): i + B]
        y = filt(seg, "bandpass", [max(40, f * 0.6), min(18000, f * 1.6)]); out[i:i + B] = y[-len(out[i:i + B]):]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5; return out * e * g
def creak(dur):
    n = int(dur * SR); f = 110 + 50 * np.sin(2 * np.pi * 3 * np.arange(n) / SR) + 15 * rng.standard_normal(n).cumsum() / np.sqrt(n)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (rng.random(n) > 0.3)
    return filt(x, "bandpass", [300, 1400]) * np.sin(np.pi * np.linspace(0, 1, n)) * 0.5
def boom():
    n = int(2.8 * SR); f = np.geomspace(85, 28, n); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.linspace(0, 4, n))
    crack = filt(rng.standard_normal(n), "lowpass", 3500) * np.exp(-np.linspace(0, 60, n))
    return np.tanh(1.6 * (x + 0.6 * crack))
def splash(dur):
    n = int(dur * SR); x = filt(rng.standard_normal(n), "bandpass", [250, 6000]); return x * env(n, 0.03, 1, 4)
def bubble():
    n = int(rng.uniform(0.05, 0.12) * SR); f = np.linspace(rng.uniform(250, 450), rng.uniform(700, 1100), n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-np.linspace(0, 6, n))
def tick():
    n = int(0.03 * SR); return filt(rng.standard_normal(n), "highpass", 2500) * np.exp(-np.linspace(0, 12, n))
def riser(dur):
    n = int(dur * SR); x = whoosh(dur, 300, 6000, 1) * np.linspace(0.2, 1, n)
    s = np.sin(2 * np.pi * np.cumsum(np.geomspace(200, 900, n)) / SR) * np.linspace(0, 0.3, n); return x + s

# wind bed (continuous) + gust that heels the ship
n = N; wind = filt(rng.standard_normal(n), "bandpass", [200, 1200]) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t + 1))
wind *= np.clip(1 - (t - 7.5) / 0.3, 0, 1) * 0.12 + np.where(t > 11.4, np.clip((t - 11.4) / 0.6, 0, 1) * 0.08, 0)
fx[:, 0] += wind; fx[:, 1] += np.roll(wind, 900)
place(fx, whoosh(2.6, 300, 1400, 1.0), 4.9, 0.55)          # gust
place(fx, whoosh(0.55, 500, 4000), 0.32, 0.6)                # 1628 in
place(fx, verb(boom() * 0.5, 0.4), 0.45, 0.35)                 # soft low hit under 1628
place(fx, creak(0.7), 1.2, 0.45, -0.3); place(fx, creak(0.9), 3.9, 0.5, 0.3); place(fx, creak(1.1), 6.2, 0.6, 0.1)
place(fx, tick() * 3, 3.2, 0.5)                                # ROYAL WARSHIP pop
place(fx, whoosh(0.4, 800, 3000), 6.0, 0.4)                   # MINUTES LATER
place(fx, verb(boom(), 0.5), 7.72, 0.95)                       # SHE SANK
place(fx, splash(1.6), 7.74, 0.45)
for b in rng.uniform(7.7, 11.2, 26): place(fx, bubble(), b, rng.uniform(0.05, 0.12), rng.uniform(-0.7, 0.7))
for i in range(22): place(fx, tick(), 8.35 + 1.5 * (i / 22) ** 0.8, 0.18, rng.uniform(-0.3, 0.3))  # counter ticks
place(fx, riser(1.35), 10.05, 0.3)
place(fx, whoosh(0.7, 3000, 400), 11.35, 0.5)                  # water drops away
place(fx, splash(1.0), 11.4, 0.3)
place(fx, whoosh(0.45, 600, 6000), 12.95, 0.6)                 # whip out

# Omni ambience: normal, then muffled underwater, then back
amb, sr = sf.read(f"{W}/rm/public/amb.wav", dtype="float64"); amb = np.vstack([amb, np.zeros((max(0, N - len(amb)), 2))])[:N]
low = np.stack([filt(amb[:, c], "lowpass", 350, 4) for c in (0, 1)], 1)
m = np.clip((t - 7.75) / 0.35, 0, 1) * np.clip(1 - (t - 11.4) / 0.4, 0, 1)
amb_mix = amb * (1 - m)[:, None] + low * 1.4 * m[:, None]
bed = mus * 0.55 + fx * 0.9 + amb_mix * 0.5
bed = np.tanh(bed * (0.12 / np.sqrt(np.mean(bed ** 2))) * 1.5) / 1.5
sf.write(f"{W}/rm/public/bed.wav", bed.astype("float32"), SR)
print("ok", bed.shape)
