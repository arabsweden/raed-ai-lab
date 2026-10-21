# البرومبتات — نوبل في Oslo
لا نحتاج Flow في هذه الحلقة: الصور كلها مرسومة بالكود في `motion/video.html`، فلا تكلفة توليد.

## الصوت (Google AI Studio)
الصوت المقترح: Charon أو Orus.

**تعليمات الأسلوب:**
```
اقرأ النص بالعربية الفصحى، بصوت رجل واضح وواثق بنبرة راوٍ يكشف معلومة غريبة. الإيقاع هادئ بلا استعجال، وكل فقرة تأخذ نحو تسع ثوانٍ. توقّف نصف ثانية عند كل «…»، وثانية كاملة بين الفقرات. اجعل الهوك في البداية مشوّقًا بنبرة سؤال، واجعل الخاتمة ودّية مع سؤال حقيقي للمشاهد. التزم بالتشكيل. انطق Oslo «أوسْلو» وStockholm «سْتوكْهولْم» وNobel «نوبِل».
```

**النص:** انسخ قسم «النص المنطوق» من `02-script-and-storyboard.md` كما هو.

## صورة رائد (المشهدان 1 و6) — اختياري
```
Use the reference photo as the identity anchor. Keep the exact face, age, skin tone, hair, proportions, and the shape of the eyes, nose, mouth and jaw. No beautifying, no de-aging, no slimming, no style change.
Change only: clothing to a plain dark crew-neck sweater; pose to a curious half-smile looking slightly toward camera-left; lighting to soft warm studio light; background to a flat cream color #f2eee8.
Head-and-shoulders, centered, sharp focus, 1:1 square, photorealistic.
```
بعد التوليد: احذف الخلفية، وضع الصورة في دائرة بإطار أبيض 10px وظل ناعم.

## تعديل الموشن
- التوقيتات داخل `UPD[i](lt)` في `motion/video.html`، والزمن `lt` محلي من 0 إلى 10 لكل مشهد.
- العنوان في `data-lines`: الرمز `/` يفصل الأسطر، و`|` يفصل الكلمات، و`*` يلوّن الكلمة بالبرتقالي، و`#` يجعلها عدّادًا.
- المعاينة: افتح `video.html?t=25` لترى الثانية 25.
- التصيير: `npm i` ثم `npm run sheet` (لوحة لقطات) و`npm run render` (MP4 صامت 1080×1920).
- مسار Chromium مكتوب في `render.mjs` لبيئة Claude السحابية، فغيّره إذا شغّلته على جهازك.
