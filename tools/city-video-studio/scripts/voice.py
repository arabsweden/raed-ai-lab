import json, subprocess, sys, os, numpy as np, soundfile as sf
W = sys.argv[1]; TEMPO = 1.2; SR = 48000
src = f"{W}/in/voice.wav"
# speech segments (from silencedetect) with small padding
segs = [(0.00, 2.335), (2.558, 6.834), (7.454, 8.323), (9.055, 9.902), (10.48, 14.108), (14.675, 15.709)]
gaps_before = [0.15, 0.08, 0.22, 0.16, 0.42, 0.08]
TAIL = 0.7
words = json.load(open(f"{W}/words.json"))
out, t, mapping = [], 0.0, []
for i, ((s, e), g) in enumerate(zip(segs, gaps_before)):
    s0, e0 = max(0, s - 0.02), min(16.0, e + 0.05)
    tmp = f"{W}/seg{i}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
        f"atrim={s0}:{e0},asetpts=N/SR/TB,aresample={SR},atempo={TEMPO},afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse",
        "-ac", "1", tmp], check=True)
    a, _ = sf.read(tmp, dtype="float32")
    out.append(np.zeros(int(g * SR), "float32")); t += g
    mapping.append((s0, t)); out.append(a); t += len(a) / SR
    os.remove(tmp)
out.append(np.zeros(int(TAIL * SR), "float32")); t += TAIL
sf.write(f"{W}/voice_tight_raw.wav", np.concatenate(out), SR)
def remap(x):
    for (s0, n0), (s, e) in zip(mapping, segs):
        if s0 - 0.05 <= x <= e + 0.2: return round(n0 + (x - s0) / TEMPO, 3)
    return None
new = [{"w": w["w"], "s": remap(w["s"]), "e": remap(w["e"])} for w in words]
json.dump({"duration": round(t, 3), "words": new}, open(f"{W}/timing.json", "w"), indent=1)
print(round(t, 3)); print(" ".join(f"{x['w']}[{x['s']}]" for x in new))
