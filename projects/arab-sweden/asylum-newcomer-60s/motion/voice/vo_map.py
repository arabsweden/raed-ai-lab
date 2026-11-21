import json,re,sys
asr=json.load(open('vo/asr.json',encoding='utf-8'))
words=[(a,b,w.strip()) for s in asr for (a,b,w) in s['words']]
html=open('motion/index.html',encoding='utf-8').read()
beats=re.findall(r"^ '(.+)',?$",html[html.index('const BEATS=['):html.index('];',html.index('const BEATS=['))],re.M)
starts=[0.0,8.007,16.35,24.05,33.22,40.27,48.40,55.70,64.70,75.40,84.90,96.40]
ends=starts[1:]+[106.2]
out=[]
for i,(s,e) in enumerate(zip(starts,ends)):
    disp=beats[i].split(' ')
    aw=[w for w in words if w[0]>=s and w[0]<e]
    print(i+1,len(disp),len(aw),' | '.join(w[2] for w in aw))
    # map: if counts equal use asr times, else proportional by chars over speech span
    if len(disp)==len(aw):
        times=[round(w[0],3) for w in aw]
    else:
        sp0=aw[0][0]; sp1=aw[-1][1]
        L=[len(re.sub(r'[ً-ْ]','',d)) for d in disp]; tot=sum(L); acc=0; times=[]
        for l in L: times.append(round(sp0+(sp1-sp0)*acc/tot,3)); acc+=l
    out.append({'start':s,'speechEnd':round(aw[-1][1],3),'words':times})
json.dump(out,open('vo/timing.json','w'),ensure_ascii=False)
