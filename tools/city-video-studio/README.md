# City Video Studio — قالب مونتاج «Discover Sweden»

الأدوات اللي طلع فيها فيديو ستوكهولم (59 ث) وفيديو غوتنبرغ (48 ث) في 12-11-2026.
المدخلات: 6 لقطات من Google Flow وملف صوت واحد من AI Studio. المخرجات: فيديو 1080×1920 بالموشن جرافيك والمؤثرات والموسيقى، وغلاف.
المهارة اللي بتكتب النص والبرومبتات: `.claude/skills/sweden-city-video/`.

## المتطلبات
- Node 22 و ffmpeg و Chrome/Chromium.
- Python 3 مع `pip install -r scripts/requirements.txt` (لنموذج Whisper `small.en` بيتنزل من Hugging Face أول مرة).
- `cd remotion && npm install`

## خطوات مدينة جديدة
| # | الخطوة | الأمر / الملف |
|---|---|---|
| 1 | حطّ الملفات في مجلد عمل: `in/s1.mp4 … in/s6.mp4` و `in/voice.wav` | — |
| 2 | تفريغ الصوت بتوقيت كل كلمة | `python -I scripts/asr.py in/voice.wav words.json` |
| 3 | تحديد أول كلمة بكل مشهد، ثم تقصير الوقفات وتسريع 1.18× وتقسيم الصوت | `python -I scripts/voice_by_words.py in/voice.wav words.json voice 0,21,39,56,75,94` |
| 4 | تحسين الصوت (EQ + compressor + ‎-16 LUFS) لكل مشهد | سطر ffmpeg في «ملاحظات» تحت |
| 5 | ملف التوقيت للمونتاج: `{s1:{start,dur,words}, …, total}` | مثال: `remotion/src/gbg_timing.json` |
| 6 | إبطاء/تكبير اللقطات لطول كل مشهد + 0.5 ث | `scripts/prep.sh in/s2.mp4 public/g2.mp4 "start:end:factor:duration" 1.0` |
| 7 | المشاهد والموشن: انسخ `GFilm.tsx` وغيّر النصوص والكلمات وأسماء الأماكن | `remotion/src/GFilm.tsx` |
| 8 | فحص صور ثابتة قبل الريندر | `npx remotion still src/index.ts Goteborg out/x.png --frame=300` |
| 9 | الريندر بدون صوت | `npx remotion render src/index.ts Goteborg out/silent.mp4 --muted --crf=16` |
| 10 | الموسيقى والمؤثرات وأصوات اللقطات + تجميع الصوت | `python -I scripts/sfx3.py <workdir> <workdir>/timing.json` |
| 11 | الدمج النهائي (ducking + ‎-14 LUFS) | سطر ffmpeg تحت |
| 12 | الغلاف | `npx remotion still src/index.ts GCover out/cover.png` |

## الملفات
| الملف | الدور |
|---|---|
| `remotion/src/Scene1.tsx` | مشهد Vasa (الماء والعداد 333) + مكونات مشتركة: الخطوط، Grade، Grain، Center، Flash |
| `remotion/src/Film.tsx` | فيلم ستوكهولم: Shell بالانتقالات (whip, slide, zoomblur, zoomthrough, leak)، Label، Counter، Stagger، Cascade، Wave، MapPanel، BoxDraw، LightLeak |
| `remotion/src/GFilm.tsx` | فيلم غوتنبرغ — أبسط مثال تنسخ منه لمدينة جديدة |
| `remotion/src/MFilm.tsx` | فيلم مالمو (لقطات Google Vids بدقة 1080×1920، بدون minterpolate للقطات بسرعة 1×) |
| `remotion/src/Cover.tsx` | غلاف ستوكهولم وغوتنبرغ |
| `scripts/voice_by_words.py` | تقسيم الصوت حسب الكلمات + تقصير الوقفات + التسريع + توقيت الكلمات الجديد |
| `scripts/prep.sh` | إبطاء/تسريع اللقطات بإطارات وسيطة (minterpolate) وتكبيرها لـ 1080×1920 |
| `scripts/sfx4.py` | نسخة مالمو من المؤثرات |
| `scripts/sfx3.py` | موسيقى (D–A–Bm–G) ومؤثرات مصنوعة بالكود + أصوات اللقطات + تجميع الصوت (مثال غوتنبرغ) |
| `scripts/sfx.py`, `sfx2.py`, `voice.py`, `voice_scenes.py` | نسخ ستوكهولم (مرجع) |

## ملاحظات
- تحسين الصوت لكل مشهد:
  `ffmpeg -i voice_sK_raw.wav -af "highpass=f=70,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3500:t=q:w=1.2:g=2,deesser=i=0.3,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 voice_sK.wav`
- الدمج النهائي:
  `ffmpeg -i silent.mp4 -i voice_full.wav -i bed_full.wav -filter_complex "[1:a]asplit=2[v][sc];[2:a][sc]sidechaincompress=threshold=0.05:ratio=3:attack=20:release=300:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.89:level=false,loudnorm=I=-14:TP=-1.0:LRA=11[a]" -map 0:v -map "[a]" -c:v libx264 -crf 20 -maxrate 7M -bufsize 14M -pix_fmt yuv420p -c:a aac -b:a 320k -ar 44100 -movflags +faststart final.mp4`
- الهدف: الصوت أعلى من الخلفية بـ 13–17 dB في نطاق الكلام (فوق 250 Hz).
- لا ترفع الفيديوهات أو الصوت إلى المستودع (`.gitignore` يمنعها).
- نطق الأسماء والاسم RAED SHIHAB يُسمع بالأذن قبل النشر؛ Whisper يخطئ في الأسماء السويدية.
- أصوات المؤثرات والموسيقى مولّدة بالكود (بلا رخص خارجية). للبديل الأغنى: Pixabay بكلمات البحث في ملف الحلقة.
