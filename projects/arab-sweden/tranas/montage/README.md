# مونتاج Tranås (Remotion)
ستايل Fusion · Småland Lake. 1080×1920، 30 fps، المدة 72 ثانية حسب ملف الصوت.

## الملفات
- `public/s1.mp4` … `s6.mp4` و`public/voice.wav`: غير مرفوعة إلى GitHub (انظر `.gitignore`).
- `words.json`: توقيت كل كلمة من الصوت (faster-whisper medium).
- `gen-data.py`: يبني `src/data.ts` (حدود المشاهد، الكابشن، أي المقاطع موجود).
- `gen-map.mjs`: يبني `src/sweden.ts` من بيانات Natural Earth.
- `prep-clip.sh`: يكبّر مقطع Flow ويمدّه إلى طول المشهد.

## عند وصول مقطع جديد (مثل المشهد 4 أو 5)
```bash
./prep-clip.sh path/to/clip.mp4 4 12.3
./prep-clip.sh path/to/clip.mp4 5 11.7
python3 gen-data.py
npx remotion render Tranas out/Tranas_montage.mp4 --crf=18 --concurrency=4
```

## إذا تغيّر ملف الصوت
أعد تفريغ الكلمات إلى `words.json`، وحدّث `CUTS` و`SIL` في `gen-data.py`، ثم أعد التشغيل.
