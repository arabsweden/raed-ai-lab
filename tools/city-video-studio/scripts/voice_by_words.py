# Split a full voice-over into scenes at given first words, tighten pauses, speed up, remap word times.
import json, subprocess, sys, re, numpy as np, soundfile as sf
src, words_json, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
starts_idx = [int(x) for x in sys.argv[4].split(",")]   # word index where each scene starts
TEMPO, SR, LEAD, TAIL = 1.18, 48000, 0.30, 0.45
words = json.load(open(words_json))
dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",src],capture_output=True,text=True).stdout)
log = subprocess.run(["ffmpeg","-hide_banner","-i",src,"-af","silencedetect=noise=-35dB:d=0.12","-f","null","-"],capture_output=True,text=True).stderr
sil = list(zip([float(x) for x in re.findall(r"silence_start: ([0-9.]+)", log)], [float(x) for x in re.findall(r"silence_end: ([0-9.]+)", log)]))
speech, t = [], 0.0
for s, e in sil:
    if s > t + 0.02: speech.append([t, s])
    t = e
if t < dur - 0.02: speech.append([t, dur])
bounds = [words[i]["s"] - 0.12 for i in starts_idx] + [dur + 1]
info = []
for k in range(len(starts_idx)):
    lo, hi = bounds[k], bounds[k + 1]
    segs = [[max(a, lo), min(b, hi)] for a, b in speech if b > lo and a < hi and min(b, hi) - max(a, lo) > 0.03]
    parts, maps, t = [np.zeros(int(LEAD * SR), "float32")], [], LEAD
    for i, (s, e) in enumerate(segs):
        if i:
            gap = s - segs[i-1][1]; g = min(gap, 0.18) if gap < 0.38 else 0.30
            parts.append(np.zeros(int(g * SR), "float32")); t += g
        s0, e0 = max(lo, s - 0.02), min(hi, e + 0.04)
        a = subprocess.run(["ffmpeg","-v","error","-i",src,"-af",f"atrim={s0}:{e0},asetpts=N/SR/TB,aresample={SR},atempo={TEMPO},afade=t=in:d=0.015,areverse,afade=t=in:d=0.03,areverse","-ac","1","-f","f32le","-"],capture_output=True).stdout
        a = np.frombuffer(a, np.float32); maps.append((s0, e0, t)); parts.append(a); t += len(a) / SR
    parts.append(np.zeros(int(TAIL * SR), "float32")); t += TAIL
    sf.write(f"{out_dir}/voice_s{k+1}_raw.wav", np.concatenate(parts), SR)
    def remap(x):
        best = min(maps, key=lambda m: 0 if m[0] <= x <= m[1] else min(abs(x-m[0]), abs(x-m[1])))
        x = min(max(x, best[0]), best[1]); return round(best[2] + (x - best[0]) / TEMPO, 3)
    ws = [{"w": w["w"], "s": remap(w["s"]), "e": remap(w["e"])} for w in words if lo <= w["s"] < hi]
    info.append({"scene": k + 1, "duration": round(t, 3), "words": ws})
json.dump(info, open(f"{out_dir}/timing.json", "w"), indent=1)
for i in info: print(i["scene"], i["duration"], " ".join(f"{w['w']}@{w['s']}" for w in i["words"]))
