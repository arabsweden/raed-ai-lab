import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import soundfile as sf, numpy as np
from scipy.signal import resample_poly
a, sr = sf.read(sys.argv[1], dtype="float32")
a = a if a.ndim == 1 else a.mean(1)
a = resample_poly(a, 16000, sr).astype("float32")
segs, _ = m.transcribe(a, word_timestamps=True, beam_size=5)
words = []
for s in segs:
    for w in s.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
json.dump(words, open(sys.argv[2], "w"), indent=1)
print(" ".join(f"{x['w']}[{x['s']}-{x['e']}]" for x in words))
