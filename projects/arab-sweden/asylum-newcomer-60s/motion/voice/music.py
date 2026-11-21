import numpy as np, wave, json
SR=48000; DUR=108.5
N=int(SR*DUR); t=np.arange(N)/SR
out=np.zeros(N)
def note(m): return 440*2**((m-69)/12)
# Am - F - C - G, 4 s per chord, warm & hopeful
prog=[[57,60,64],[53,57,60],[48,55,64],[55,59,62]]
CH=4.0
def env_seg(start,length,att=1.2,rel=1.5):
    e=np.zeros(N); i0=int(start*SR); i1=min(N,int((start+length+rel)*SR))
    tt=(np.arange(i0,i1)/SR)-start
    a=np.clip(tt/att,0,1); r=np.clip((start+length+rel-(tt+start))/rel,0,1)
    e[i0:i1]=a*np.minimum(1,r); return e
k=0; s0=0.0
while s0<DUR:
    ch=prog[k%4]; e=env_seg(s0,CH)
    for m in ch:
        f=note(m+12)
        for det in (-0.12,0.0,0.12):
            out+=e*0.05*np.sin(2*np.pi*f*(1+det/100)*t)
        out+=e*0.015*np.sin(2*np.pi*2*f*t)
    out+=e*0.06*np.sin(2*np.pi*note(ch[0]-12)*t)   # soft bass
    # gentle pluck arpeggio, quarter notes (0.5 s)
    for j in range(8):
        ts=s0+j*0.5
        if ts>=DUR: break
        m=ch[[0,1,2,1][j%4]]+24
        i0=int(ts*SR); L=int(1.2*SR); i1=min(N,i0+L)
        tt=np.arange(i1-i0)/SR
        pl=np.sin(2*np.pi*note(m)*tt)*np.exp(-tt*4.5)*0.035
        out[i0:i1]+=pl
    s0+=CH; k+=1
# soft whoosh at each scene change
rng=np.random.default_rng(7)
starts=[x['start'] for x in json.load(open('vo/timing.json'))][1:]
for st in starts:
    L=int(0.7*SR); i0=max(0,int((st-0.45)*SR)); i1=min(N,i0+L)
    n=rng.standard_normal(i1-i0)
    # crude lowpass via moving average, rising envelope then fall
    n=np.convolve(n,np.ones(24)/24,mode='same')
    tt=np.linspace(0,1,i1-i0); e=np.sin(np.pi*tt)**2
    out[i0:i1]+=n*e*0.12
# fades
fi=int(2.5*SR); fo=int(3.5*SR)
out[:fi]*=np.linspace(0,1,fi); out[-fo:]*=np.linspace(1,0,fo)
out/=np.max(np.abs(out))*1.12
st=np.stack([out, np.roll(out,int(0.012*SR))],1)  # slight stereo width
pcm=(st*32767).astype(np.int16)
with wave.open('vo/music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('music ok', DUR)
