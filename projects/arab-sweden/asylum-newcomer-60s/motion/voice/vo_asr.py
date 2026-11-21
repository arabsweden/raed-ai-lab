import sys, json
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
import subprocess, numpy as np
aud=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout,dtype=np.float32)
segs, info = m.transcribe(aud, language="ar", word_timestamps=True, vad_filter=False)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[(w.start,w.end,w.word) for w in s.words]})
    print(f"{s.start:7.2f} {s.end:7.2f} {s.text}")
json.dump(out, open(sys.argv[2],"w",encoding="utf-8"), ensure_ascii=False)
