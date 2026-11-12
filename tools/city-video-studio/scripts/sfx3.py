import sys, json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
F, TJ = sys.argv[1], sys.argv[2]
SR = 48000; tm = json.load(open(TJ)); TOT = tm["total"]; N = int(TOT * SR)
rng = np.random.default_rng(11); t = np.arange(N) / SR
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output="sos"), x)
def place(buf, x, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    x = x[: N - i]
    if x.ndim == 1:
        l, r = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
        buf[i:i+len(x), 0] += x * g * l; buf[i:i+len(x), 1] += x * g * r
    else: buf[i:i+len(x)] += x * g
IR = rng.standard_normal(int(2.4 * SR)) * np.exp(-np.linspace(0, 6.5, int(2.4 * SR))); IR = filt(IR, "lowpass", 6000) * 0.03
def verb(x, wet=0.35): return x + wet * fftconvolve(x, IR)[: len(x)]
def whoosh(dur, f0, f1, g=1.0):
    n = int(dur * SR); x = rng.standard_normal(n + 1024); out = np.zeros(n); B = 1024
    for i in range(0, n, B):
        f = f0 + (f1 - f0) * (i / n); y = filt(x[i:i + B + 1024], "bandpass", [max(40, f * 0.6), min(20000, f * 1.6)])
        out[i:i + B] = y[1024:1024 + len(out[i:i + B])]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * g
def pop():
    n = int(0.12 * SR); f = np.geomspace(900, 300, n); return np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-np.linspace(0, 14, n))
def tick():
    n = int(0.03 * SR); return filt(rng.standard_normal(n), "highpass", 2500) * np.exp(-np.linspace(0, 12, n))
def hit(f0=70, d=1.6):
    n = int(d * SR); x = np.sin(2*np.pi*np.cumsum(np.geomspace(f0, f0*0.45, n))/SR) * np.exp(-np.linspace(0, 5, n))
    return np.tanh(1.4 * (x + 0.4 * filt(rng.standard_normal(n), "lowpass", 2500) * np.exp(-np.linspace(0, 50, n))))
def riser(d):
    n = int(d * SR); return whoosh(d, 300, 6000) * np.linspace(0.2, 1, n) + np.sin(2*np.pi*np.cumsum(np.geomspace(220, 880, n))/SR) * np.linspace(0, 0.25, n)
def bell(f=392.0, d=4.0):
    n = int(d * SR); tt = np.arange(n) / SR
    x = sum(a * np.sin(2*np.pi*f*m*tt) * np.exp(-tt * dec) for m, a, dec in [(0.5,.5,0.8),(1,1,1.0),(1.19,.6,1.6),(1.56,.4,2),(2,.35,2.5),(2.74,.2,3.5)])
    return x / 3
def chime(fs=(880, 1318.5), d=1.6):
    n = int(d * SR); tt = np.arange(n) / SR; return sum(np.sin(2*np.pi*f*tt) * np.exp(-tt * 3) for f in fs) / len(fs)
def shimmer(d=2.0):
    n = int(d * SR); tt = np.arange(n)/SR; x = sum(np.sin(2*np.pi*f*tt) for f in (1174.7, 1760, 2349.3, 2637)) / 4
    return x * (0.6 + 0.4*np.sin(2*np.pi*7*tt)) * np.sin(np.pi*np.linspace(0,1,n))
def saw(f, n, det): ph = np.cumsum(np.full(n, f * (1 + det)) / SR); return 2 * (ph % 1) - 1
def pad(freqs, d, cutoff, a=0.6, r=0.6):
    n = int(d * SR); x = sum(saw(fr, n, dt) for fr in freqs for dt in (-0.004, 0, 0.005)) / (len(freqs) * 3)
    x = filt(x, "lowpass", cutoff); e = np.minimum(1, np.arange(n)/(a*SR)) * np.minimum(1, (n-np.arange(n))/(r*SR)); return x * e
def pluck(f, d=0.6):
    n = int(d * SR); tt = np.arange(n)/SR; return (np.sin(2*np.pi*f*tt) + 0.3*np.sin(4*np.pi*f*tt)) * np.exp(-tt * 6)

mus = np.zeros((N, 2)); fx = np.zeros((N, 2)); amb = np.zeros((N, 2))
K = ["s1","s2","s3","s4","s5","s6"]; st = {k: tm[k]["start"] for k in K}
def find(k, w): return next(st[k] + x["s"] for x in tm[k]["words"] if x["w"].lower().startswith(w.lower()))
def jingle(d=0.18):
    n = int(d * SR); return filt(rng.standard_normal(n), "bandpass", [5000, 11000]) * np.exp(-np.linspace(0, 9, n))
def horn(d=2.2):
    n = int(d * SR); x = saw(110, n, 0) + 0.6 * saw(164.8, n, 0.002); x = filt(x, "lowpass", 700)
    return x * np.minimum(1, np.arange(n)/(0.5*SR)) * np.minimum(1, (n-np.arange(n))/(0.6*SR))
def slap():
    n = int(0.25 * SR); return filt(rng.standard_normal(n), "bandpass", [300, 3000]) * np.exp(-np.linspace(0, 25, n)) + np.sin(2*np.pi*90*np.arange(n)/SR) * np.exp(-np.linspace(0, 18, n))
# --- music: D – A – Bm – G pad + plucks; Christmas scene gets celesta-like bells; warm resolve at end
CH = {"D": [146.83,185.0,220.0,293.66], "A": [110.0,164.81,220.0,277.18], "Bm": [123.47,185.0,246.94,293.66], "G": [98.0,146.83,196.0,246.94]}
prog = ["D","A","Bm","G"]; step = 2.6; c = 0; t0 = 0.0
while t0 < TOT - 1.0:
    name = prog[c % 4]; xmas = st["s5"] - 0.2 <= t0 < st["s6"] - 0.2
    place(mus, verb(pad(CH[name], step + 0.6, 1600, 0.5 if c else 1.2, 0.6), 0.4), t0, 0.42)
    notes = CH[name] + [CH[name][1] * 2]
    for j in range(8):
        f0 = notes[[0,2,1,3,4,3,1,2][j]] * (4 if xmas else 2)
        place(mus, verb(pluck(f0, 0.6 if xmas else 0.5), 0.6), t0 + j * step / 8, 0.07 if xmas else 0.09, [-0.4, 0.4][j % 2])
    t0 += step; c += 1
place(mus, verb(pad(CH["D"] + [369.99], 3.0, 2600, 0.3, 1.4), 0.6), st["s6"] + 6.8, 0.45)
place(mus, verb(shimmer(2.4), 0.8), st["s6"] + 6.9, 0.12)
mus *= np.clip((TOT - t) / 1.2, 0, 1)[:, None]
# --- scene 1: Feskekôrka
place(fx, verb(bell(196.0, 4.0), 0.7), find("s1","church") - 0.05, 0.22)
place(fx, whoosh(0.35, 800, 3000), find("s1","looks") - 0.25, 0.3)
for i in range(14): place(fx, tick(), find("s1","18") - 0.25 + 0.9 * (i / 14) ** 0.8, 0.18)
place(fx, slap(), find("s1","fish") + 0.05, 0.5)
place(fx, riser(0.6), find("s1","Fish") - 0.65, 0.22); place(fx, verb(hit(80, 1.2), 0.5), find("s1","Fish") - 0.05, 0.4)
# --- transitions
b = [st[k] for k in K[1:]]
place(fx, whoosh(0.5, 4000, 500), b[0] - 0.2, 0.5)
place(fx, whoosh(0.55, 600, 3500), b[1] - 0.3, 0.45, -0.3)
place(fx, whoosh(0.5, 3000, 600), b[2] - 0.3, 0.45)
place(fx, verb(shimmer(1.4), 0.7), b[3] - 0.5, 0.18); place(fx, whoosh(0.9, 400, 2500), b[3] - 0.5, 0.25)
place(fx, verb(whoosh(0.7, 5000, 300), 0.5), b[4] - 0.4, 0.45)
# --- scene 2: map
place(fx, whoosh(1.0, 300, 1200), st["s2"], 0.25)
pin = st["s2"] + tm["s2"]["words"][2]["s"]
place(fx, pop(), pin, 0.5); place(fx, verb(chime((1046.5,), 1.2), 0.6), pin + 0.05, 0.12)
for i in range(8): place(fx, tick(), pin - 0.05 + i * 0.07, 0.12)
place(fx, whoosh(0.8, 500, 5000), find("s2","second") - 0.6, 0.4)
place(fx, verb(hit(70, 1.0), 0.4), find("s2","second") - 0.1, 0.3)
place(fx, verb(horn(2.4), 0.6), find("s2","where"), 0.12)
# --- scene 3
place(fx, riser(0.5), st["s3"] - 0.1, 0.15)
for i in range(12): place(fx, tick(), st["s3"] + 0.2 + 0.9 * (i / 12) ** 0.8, 0.18)
place(fx, whoosh(0.6, 500, 2000), find("s3","King"), 0.2)
for i in range(2): place(fx, pop() * 0.7, find("s3","Dutch") - 0.1 + i * 0.2, 0.25)
# --- scene 4
place(fx, riser(0.6), find("s4","Haga") - 0.85, 0.2); place(fx, verb(chime((784, 1174.7), 1.4), 0.5), find("s4","Haga") - 0.2, 0.15)
place(fx, pop(), find("s4","cinnamon") - 0.15, 0.45)
place(fx, whoosh(0.45, 800, 4000), find("s4","biggest") - 0.05, 0.35)
# --- scene 5: Christmas
x = st["s5"]
while x < st["s6"] - 0.3:
    place(fx, jingle(), x, 0.12 + 0.05 * rng.random(), rng.uniform(-0.5, 0.5)); x += 0.25 + 0.05 * rng.random()
place(fx, verb(chime((1046.5, 1568.0), 2.0), 0.7), find("s5","Christmas") - 0.2, 0.22)
place(fx, verb(shimmer(1.6), 0.7), find("s5","millions") - 0.1, 0.15)
for i in range(16): place(fx, tick(), find("s5","about") - 0.05 + 1.0 * (i / 16) ** 0.8, 0.18)
# --- scene 6
place(fx, pop(), find("s6","My"), 0.35); place(fx, verb(chime((784, 1174.7), 1.6), 0.6), find("s6","Climb"), 0.18)
place(fx, whoosh(0.7, 500, 3000), find("s6","I'm") - 0.2, 0.35); place(fx, verb(shimmer(1.2), 0.6), find("s6","I'm") + 0.3, 0.12)
place(fx, verb(chime((880, 1318.5), 1.8), 0.6), find("s6","Which"), 0.2)
for w in ["Which", "city", "next"]: place(fx, pop() * 0.6, find("s6", w), 0.25)
# --- clip ambiences
for k, g in [("s1",0.5),("s2",0.5),("s3",0.45),("s4",0.45),("s5",0.45),("s6",0.45)]:
    a, _ = sf.read(f"{F}/amb/a{k[1]}.wav"); a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * 0.05
    n = len(a); e = np.minimum(1, np.arange(n) / (0.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR)); place(amb, a * e[:, None], st[k] - (0.0 if k == "s1" else 0.25), g)
bed = (mus * 0.8 + fx * 0.9 + amb) * 0.32
bed = np.tanh(bed * 1.3) / 1.3
sf.write(f"{F}/bed_full.wav", bed.astype("float32"), SR)
v = np.zeros((N, 2))
for k in K:
    a, _ = sf.read(f"{F}/voice/voice_{k}.wav"); place(v, a, st[k], 0.707)
sf.write(f"{F}/voice_full.wav", v.astype("float32"), SR); print("ok", TOT)
