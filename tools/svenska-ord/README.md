# Svenska Ord — قالب Remotion لكلمة سويدية في ريل

قالب فيديو عمودي **1080×1920 بسرعة 30fps** بأسلوب «كينتك تايبوغرافي» تحريري داكن.
كل حلقة تُعرَّف في `words.json`، ويُخرَج الكل بأمر واحد.

## الطبقات

| الطبقة | المحتوى | الملف |
| --- | --- | --- |
| z-0 | خلفية `#050505` + حبيبات فيلم متحركة (ثابتة النتيجة) | `src/layers/FilmGrain.tsx` |
| z-10 | الكلمة السويدية بحجم 380px بلون `#2E2E2E` مقصوصة عند الحواف + صدى مفرّغ، بانزياح بارالاكس متعاكس | `src/layers/KineticWord.tsx` |
| z-20 | الصورة/الفيديو الأمامي بمزج `lighten` وتكبير بطيء 1.0 → 1.06 | `src/layers/Subject.tsx` |
| z-30 | خط شعري، شريط تقدم وتوقيت، وسم `SVENSKA ORD • 01`، النطق `UTTAL` | `src/layers/EditorialHud.tsx` |
| z-30 | عنوان عربي + ترجمة كلمة بكلمة بخط IBM Plex Sans Arabic داخل كبسولة داكنة | `src/layers/ArabicCaptions.tsx` |

الخطوط (Montserrat وInter وIBM Plex Sans Arabic، رخصة OFL) محفوظة في `public/fonts`، فالإخراج يعمل بلا إنترنت.

## التشغيل

```bash
cd tools/svenska-ord
npm i
npm run dev            # Remotion Studio للمعاينة والتعديل
npm run render:draft   # كل الحلقات بنصف الدقة للفحص السريع
npm run render:all     # كل الحلقات بدقة 1080×1920 → out/
npm run render:all -- lagom   # حلقة واحدة بالـ id
```

## حلقة جديدة

1. ضع الصورة أو الفيديو في `public/media/` والتعليق الصوتي في `public/voice/`.
2. أضف عنصرًا إلى `episodes` في `words.json`:

```json
{
  "id": "mysig",
  "episode": 3,
  "swedishWord": "MYSIG",
  "phonetic": "/ˈmyːsɪɡ/",
  "arabicTitle": "دفء ومزاج حلو",
  "arabicExplanation": "جملة قصيرة يُقرأ نصها في التعليق الصوتي.",
  "mediaSource": "media/mysig.mp4",
  "audioSource": "voice/mysig.mp3"
}
```

3. `npm run render:all -- mysig`

## حقول `words.json`

الحقول غير المذكورة في الحلقة تؤخذ من `defaults`.

| الحقل | الوظيفة |
| --- | --- |
| `swedishWord` | الكلمة الكبيرة في الخلفية |
| `phonetic` | النطق بالرموز الصوتية IPA |
| `arabicTitle` | العنوان العربي فوق الترجمة |
| `arabicExplanation` | نص التعليق الصوتي، ويظهر كلمة بكلمة |
| `mediaSource` | مسار داخل `public/` أو رابط https. صورة (jpg/png/webp) أو فيديو (mp4/webm/mov) |
| `audioSource` | التعليق الصوتي. `null` = بلا صوت بشري |
| `captionsSource` | ملف توقيت كلمات بصيغة `Caption[]` (من Whisper مثلًا) داخل `public/captions/`. `null` = توقيت تلقائي تقريبي |
| `durationInSeconds` | طول الحلقة (افتراضي 12) |
| `voiceStartSec` | متى يبدأ التعليق الصوتي (افتراضي 0.6) |
| `wordFontSize` | حجم الكلمة الكبيرة (افتراضي 380). كبّره للكلمات القصيرة حتى تُقص عند الحواف |
| `blendMode` | `lighten` أو `screen` للوسائط ذات الخلفية السوداء، و`normal` لصورة PNG شفافة |
| `mediaFocus` / `mediaScale` / `mediaOffset` | موضع الموضوع وحجمه. مثال: `0.82` و`"-60px -300px"` لرفع الكوب وتصغيره |
| `whoosh` / `ambient` / `ambientVolume` | مؤثرات الصوت المرفقة في `public/audio` |
| `showArabicText` | `false` لإخفاء النص العربي داخل الفيديو |

## ملاحظات

- **التوقيت التلقائي للترجمة تقريبي**: يوزّع الكلمات على مدة الصوت حسب طولها. للتزامن الدقيق مع التعليق الصوتي ولّد ملف `Caption[]` من الصوت ثم ضع مساره في `captionsSource`.
- **صورة بخلفية سوداء مع `lighten`**: الأجزاء الداكنة من الموضوع (مثل الجاكيت الأسود) تُظهر الكلمة الرمادية من خلفها. لعزل كامل استخدم PNG مفرّغة مع `"blendMode": "normal"`.
- مجلدا `public/media` و`public/voice` لا يُرفعان إلى Git. ضع الملفات محليًا قبل الإخراج.
- المؤثرات `whoosh.m4a` و`ambient-drone.m4a` مولّدة بـ ffmpeg من ضوضاء صناعية، فلا قيود ترخيص عليها.
