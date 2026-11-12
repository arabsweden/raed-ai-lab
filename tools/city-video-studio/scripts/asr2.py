import sys, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    raw = subprocess.run(["ffmpeg","-v","error","-i",f,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout
    a = np.frombuffer(raw, np.float32)
    segs,_ = m.transcribe(a, vad_filter=True)
    print(f.split("/")[-1], "|", " ".join(s.text.strip() for s in segs) or "(no speech)")
