# Tranås — الصوت والمونتاج والنشر
الحالة: خطة جاهزة، لم تُنفّذ.

## 1) الصوت — Google AI Studio
- aistudio.google.com/generate-speech → Create new dialog → Gemini Flash TTS → المتحدث **Rami**.
- Style instructions (الصقها في خانة الأسلوب، لا تُقرأ):
```text
Warm, calm Arabic documentary travel narrator in clear Modern Standard Arabic with full classical pronunciation. Relaxed natural pace, never rushed, short pause at every comma and a longer pause between paragraphs. Pronounce Swedish place names written in Latin letters exactly as a native Stockholm Swedish speaker would: Tranås, Sommen, Småland, Säby, Säby kyrka, Säbysjön, Tranås kyrka, Storgatan.
```
- الصق نص الصوت من `02-script-and-storyboard.md` كتلة واحدة → Run → استمع وقارن بالنص → Download WAV باسم `voice.wav`.
- الهدف ≤ 58 ثانية. إذا أخطأ في اسم سويدي، أعد توليد الفقرة وحدها.

## 2) ستايل المونتاج: Fusion · Småland Lake
- 1080×1920، 30 fps، Remotion. الألوان: ذهبي `#F2C94C` للأرقام والكلمة النشطة، أزرق بحيرة `#0E3B53` للأشكال، كريمي `#F4EBD9` لمشهد التاريخ.
- كل الحركات من مكتبة الأنصاري، داخل المنطقة الآمنة (y 300–1550، x 60–1020).
- الكابشن على طول الفيديو: **M-086 Scale Active Word** بخط Amiri 700 (FA-06)، 64px، في منتصف الشاشة، 3–5 كلمات لكل ظهور. الكلمة المنطوقة تكبر 125% وتصبح ذهبية. الأسماء السويدية تبقى بالأحرف اللاتينية.
- الشارة السويدية أعلى اليمين (top 210): خط ذهبي ثم الاسم Inter 800 (FE-24). من جدول الشارات في الملف 02.
- خلفية كل المقاطع: Ken Burns ناعم (M-025 بنسبة تكبير مخففة 104%→116%) بالتناوب: زوم داخل، خارج، يمين، يسار.

| المشهد | الموشن جرافيك والأنيميشن | التوقيت |
|---|---|---|
| 1 | كركي ذهبي يُرسم بالخط ثم يُعبّأ (أسلوب M-182، رسم أصلي من صنعنا، ليس شعار البلدية) مع «طائر الكركي» · خريطة السويد مبسطة ثم **M-199 Map Pin Drop** على «Tranås» · **M-040 Number Counter** من 0 إلى 260 بخط El Messiri (FA-21) وتحته «öar i Sommen» · الهوك «Tranås» كبيرًا بخط Reem Kufi (FA-51) مع **M-053 Outline to Fill** | الكركي 0–1.5 ث، الدبوس عند «Sommen»، العداد عند «جزيرة» |
| 2 | **M-156 Film Grain** + سيبيا وتظليل خفيف · خط زمني أفقي ينرسم بنقطتين: **M-040** يعد 1882 ثم 1919 بخط El Messiri ذهبي · سهم صغير «Säby → Tranås» | السنة مع نطقها بالضبط |
| 3 | **M-244 Callout Line** من برج الكنيسة إلى بطاقة «Tranås kyrka · 1930» · عند «Säby kyrka»: **M-016 Circle Reveal** لبطاقة دائرية صغيرة أسفل اليسار مع نقطة ماء متموجة (اختياري: صورة حقيقية لـ Säby kyrka مع M-025) | البطاقة مع «Tranås kyrka» |
| 4 | **M-088 Keyword Color** على «Storgatan» + **M-007 Underline Draw** تحتها · خط مشي متقطع ينرسم أسفل الكادر مع حركة الكاميرا (أسلوب M-248) | مع نطق «Storgatan» |
| 5 | **M-156 Film Grain** خفيف (25%) · **M-053 Outline to Fill** على كلمة «الفراء» · **M-040** يعد إلى 18 604 مع «invånare · 2024» | العداد مع «ثمانية عشر ألف» |
| 6 | الكابشن ينزل إلى 66% بعيدًا عن وجهك · **M-039 Lower Third**: «RAED SHIHAB» · **M-032 Comment Typing** يكتب «Tranås 📍» عند «اكتبوا لنا» · فقاعات 💬 📍 ➕ ترتد في آخر 3 ثوانٍ | مع آخر جملة |

الانتقالات: 1→2 **M-270 Film Burn** · 2→3 **M-118 Light Leak** · 3→4 **M-020 Whip Pan** · 4→5 **M-016 Circle Reveal** · 5→6 **M-118 Light Leak**.

### الصوت في المونتاج
- التعليق 100%. صوت مقاطع Flow 12–15% (خفيف جدًا).
- مؤثرات انتقال ناعمة جدًا (-28 dB): whoosh للانتقالات، «تك» خفيف مع كل دبوس وعداد، صوت كتابة خفيف مع M-032.
- موسيقى اختيارية: هادئة ومرخصة، أخفض من الصوت بـ19 dB، fade-in وfade-out.
- تنويه صغير أسفل الشاشة في المشهد 1: «AI-generated visuals».

### فحص قبل الرندر النهائي
صور ثابتة من كل مشهد: لا تغطية للوجه، لا تداخل بين الشارة والكابشن، كل الأرقام تطابق السكربت.

## 3) الغلاف
لقطة من المشهد 1 + تدرج داكن · «SVERIGE · TRANÅS» (Inter) · «Tranås» كبير ذهبي (Reem Kufi) · «مدينة بجانب بحيرة فيها 260 جزيرة» · كبسولة «جولة في دقيقة ⏱️».

## 4) حزمة النشر
العنوان:
```text
🇸🇪 Tranås: مدينة شعارها طائر وبجانبها 260 جزيرة
```
المنشور:
```text
هل سمعتم عن Tranås؟ 📍
🏝️ بجانبها بحيرة Sommen وفيها نحو 260 جزيرة
📜 صارت مدينة عام 1919
⛪ كنيستها Tranås kyrka افتُتحت عام 1930
هل زرتموها؟ اكتبوا لنا واقترحوا المدينة القادمة 👇
```
الهاشتاغات:
```text
#السويد
#عرب_السويد
#سياحة_السويد
#Tranås
```

## 5) التسليم
`Tranas_montage.mp4` و`Tranas_cover.jpg`. لا نشر قبل موافقتك الصريحة.
