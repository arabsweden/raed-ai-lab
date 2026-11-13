import json, subprocess, numpy as np, sys
D=sys.argv[1]; SR=48000; T=75.35
def load(n):
    raw=subprocess.run(["ffmpeg","-v","error","-i",f"{D}/sfx/{n}.wav","-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout
    return np.frombuffer(raw,np.float32)
buf=np.zeros(int(T*SR)+SR,np.float32)
def put(n,t,db):
    x=load(n)*10**(db/20); i=int(t*SR); buf[i:i+len(x)]+=x[:len(buf)-i]
G=json.load(open(f"{D}/groups.json")); LAT=lambda s:any(c.isascii() and c.isalpha() or c in "åäöÅÄÖ" for c in s)
for g in G:
    if g["kind"]=="title":
        lat=[w for w in g["words"] if LAT(w["t"])]; put("pop",lat[0]["s"],-8)
        mean=[w for w in g["words"][1:] if not LAT(w["t"])]; put("scribble",mean[0]["s"],-14)
    for w in g["words"]:
        if w.get("em") in ("punch","big"): put("thump",w["s"],-6)
        elif w.get("em")=="em": put("scribble",w["s"],-20)
    if g["kind"]=="cta":
        s=g["words"][0]["s"]
        for k in range(9): put("tap",s+0.2+k*0.17,-14)
        put("pop",s+1.75,-10)
for t in (11.57,25.37,38.20,50.65,62.24): put("flip",t,-4)
put("wind",0,-24); put("wind",38.5,-22)
for k in range(13): put("tick",12.2+k,-24)
put("bell",39.2,-16)
tro=[g for g in G if g["kind"]=="title" and g["scene"]==4][0]; put("chime",tro["words"][-1]["s"],-16)
put("birds",62.7,-22)
buf=np.clip(buf,-1,1)
subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ac","1","-ar",str(SR),"-i","-","-t",str(T),f"{D}/sfx_track.wav"],input=buf.tobytes())
print("peak dB", 20*np.log10(np.abs(buf).max()+1e-9))
