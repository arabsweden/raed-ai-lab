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
st = {k: tm[k]["start"] for k in ["s2","s3","s4","s5","s6"]}
def W(k, i): return st[k] + tm[k]["words"][i]["s"]
def find(k, w): return next(st[k] + x["s"] for x in tm[k]["words"] if x["w"].lower().startswith(w.lower()))

# --- scene 1 bed (already mixed music+sfx+amb), fade its tail
b1, _ = sf.read(f"{F}/s1bed/rm/public/bed.wav"); n1 = min(len(b1), N); b1 = b1[:n1].copy()
fo = int(0.35 * SR); b1[-fo:] *= np.linspace(1, 0, fo)[:, None]
s1buf = np.zeros((N, 2)); place(s1buf, b1, 0.0, 1.0)
# splash on the cut to the rushing water in scene 1
place(fx, whoosh(0.5, 2500, 500), 5.85, 0.35); place(fx, filt(rng.standard_normal(int(1.2*SR)), "bandpass", [300, 6000]) * np.exp(-np.linspace(0, 4, int(1.2*SR))), 6.05, 0.25)

# --- music from scene 2: D – A – Bm – G, 2.8 s per chord
CH = {"D": [146.83,185.0,220.0,293.66], "A": [110.0,164.81,220.0,277.18], "Bm": [123.47,185.0,246.94,293.66], "G": [98.0,146.83,196.0,246.94]}
prog = ["D","A","Bm","G"]; T0 = 13.3; step = 2.8; c = 0; tt0 = T0
while tt0 < TOT:
    name = prog[c % 4]; under = st["s5"] - 0.3 <= tt0 < st["s6"] - 0.2
    cutoff = 650 if under else 1800
    place(mus, verb(pad(CH[name], step + 0.6, cutoff, 0.5, 0.6), 0.4), tt0, 0.5 if under else 0.42)
    if not under:
        notes = CH[name] + [CH[name][1] * 2]
        for j in range(8):
            place(mus, verb(pluck(notes[[0,2,1,3,4,3,1,2][j]] * 2, 0.5), 0.5), tt0 + j * step / 8, 0.09, [-0.4, 0.4][j % 2])
    else:
        n = int((step + 0.6) * SR); place(mus, np.sin(2*np.pi*36.7*np.arange(n)/SR) * np.minimum(1, np.arange(n)/(0.4*SR)) * np.minimum(1,(n-np.arange(n))/(0.5*SR)), tt0, 0.2)
    tt0 += step; c += 1
# ending: warm resolve + shimmer
place(mus, verb(pad(CH["D"] + [369.99], 3.2, 2600, 0.3, 1.5), 0.6), st["s6"] + 6.6, 0.45)
place(mus, verb(shimmer(2.6), 0.8), st["s6"] + 6.7, 0.12)
fade = np.clip((TOT - t) / 1.2, 0, 1); mus[:, 0] *= np.where(t > 13.3, fade, 1); mus[:, 1] *= np.where(t > 13.3, fade, 1)

# --- transitions
place(fx, whoosh(0.5, 4000, 500), 13.1, 0.5)                          # whip in
place(fx, whoosh(0.55, 600, 3500), st["s3"] - 0.3, 0.45, -0.3)          # slide push
place(fx, whoosh(0.5, 3000, 600), st["s4"] - 0.3, 0.45)                # zoom blur
place(fx, verb(whoosh(0.7, 5000, 200), 0.6), st["s5"] - 0.4, 0.55); place(fx, verb(hit(60, 2.0), 0.5), st["s5"] - 0.02, 0.45)  # zoom through, underground
place(fx, verb(shimmer(1.4), 0.7), st["s6"] - 0.5, 0.18); place(fx, whoosh(0.9, 400, 2500), st["s6"] - 0.5, 0.25)              # light leak
# --- scene 2: map
place(fx, whoosh(1.0, 300, 1200), st["s2"] + 0.0, 0.25)
place(fx, pop(), find("s2","Stockholm") , 0.5); place(fx, verb(chime((1046.5,), 1.2), 0.6), find("s2","Stockholm") + 0.05, 0.12)
for i in range(9): place(fx, tick(), find("s2","Stockholm") - 0.05 + i * 0.07, 0.12)      # letter cascade
place(fx, whoosh(0.8, 500, 5000), find("s2","spread") - 0.1, 0.4)                          # map zoom
for i in range(14): place(fx, tick(), find("s2","14") - 0.15 + 0.8 * (i / 14) ** 0.8, 0.18)
place(fx, whoosh(0.6, 400, 1500), find("s2","where") + 0.15, 0.2)
# --- scene 3: Vasa
v = find("s3","Vasa"); place(fx, riser(1.0), v - 1.05, 0.25); place(fx, verb(hit(75, 1.6), 0.5), v - 0.05, 0.55)
for i in range(16): place(fx, tick(), find("s3","98") - 0.1 + 1.0 * (i / 16) ** 0.8, 0.18)
for i in range(3): place(fx, pop(), find("s3","million") - 0.2 + i * 0.2, 0.25)
# --- scene 4: Gamla stan
place(fx, verb(bell(196.0, 4.5), 0.7), st["s4"] + 0.2, 0.18, 0.5); place(fx, verb(bell(261.6, 4.0), 0.7), st["s4"] + 1.4, 0.12, -0.4)
for i in range(14): place(fx, tick(), find("s4","where") + 0.1 + 1.4 * (i / 14) ** 0.8, 0.18)
for i in range(3): place(fx, pop() * 0.7, find("s4","Its") + i * 0.2, 0.2)
place(fx, whoosh(0.6, 2000, 6000), find("s4","90") + 0.1, 0.3); place(fx, pop(), find("s4","wide") - 0.1, 0.4)
# --- scene 5: metro
place(fx, verb(hit(55, 1.2), 0.4), find("s5","go") + 0.3, 0.45)
for i in range(12): place(fx, tick(), find("s5","More") + 0.9 * (i / 12) ** 0.8, 0.18)
place(fx, whoosh(0.45, 800, 4000), find("s5","Longest") - 0.05, 0.4)
# --- scene 6: tip + CTA
place(fx, pop(), find("s6","My") + 0.0, 0.35); place(fx, verb(chime((784, 1174.7), 1.6), 0.6), find("s6","Walk"), 0.18)
place(fx, whoosh(0.7, 500, 3000), find("s6","I'm") - 0.2, 0.35); place(fx, verb(shimmer(1.2), 0.6), find("s6","I'm") + 0.3, 0.12)
place(fx, verb(chime((880, 1318.5), 1.8), 0.6), find("s6","Which"), 0.2)
for i, w in enumerate(["Which", "city", "next"]): place(fx, pop() * 0.6, find("s6", w), 0.25)

# --- clip ambiences (normalised), placed from scene start - 0.25
for k, g in [("s2", 0.5), ("s3", 0.45), ("s4", 0.45), ("s5", 0.35), ("s6", 0.45)]:
    a, _ = sf.read(f"{F}/amb/a{k[1]}.wav"); a = a / (np.sqrt(np.mean(a ** 2)) + 1e-9) * 0.05
    n = len(a); e = np.minimum(1, np.arange(n) / (0.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR)); place(amb, a * e[:, None], st[k] - 0.25, g)
bed = (mus * 0.8 + fx * 0.9 + amb) * 0.32 + s1buf
bed = np.tanh(bed * 1.3) / 1.3
sf.write(f"{F}/bed_full.wav", bed.astype("float32"), SR); print("bed", bed.shape, TOT)
# voice track
v = np.zeros((N, 2))
a, _ = sf.read(f"{F}/../s1/rm/public/voice.wav"); place(v, a if a.ndim == 1 else a.mean(1), 0.0, 0.707)
for k in ["s2","s3","s4","s5","s6"]:
    a, _ = sf.read(f"{F}/voice/voice_{k}.wav"); place(v, a, st[k], 0.707)
sf.write(f"{F}/voice_full.wav", v.astype("float32"), SR); print("voice ok")
