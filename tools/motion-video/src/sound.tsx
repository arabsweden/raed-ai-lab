import React from "react";
import { Html5Audio, Sequence, staticFile } from "remotion";

// كل مؤثر مربوط بحركة يشوفها المشاهد (الفريم = لحظة بداية الحركة)
export const CUES: { at: number; src: string; vol: number; what: string }[] = [
  { at: 0, src: "stretch", vol: 0.18, what: "تمديد «فكرة» بالكشيدة" },
  { at: 70, src: "whoosh", vol: 0.25, what: "سحبة الكاميرا السريعة" },
  { at: 112, src: "slide", vol: 0.3, what: "تبديل: الصور" },
  { at: 138, src: "slide", vol: 0.27, what: "تبديل: الصوت" },
  { at: 164, src: "slide", vol: 0.3, what: "تبديل: المونتاج" },
  { at: 174, src: "strike", vol: 0.35, what: "شطب «ضايع»" },
  { at: 186, src: "pop", vol: 0.3, what: "نطّة «في طريقة أسهل»" },
  { at: 192, src: "whoosh", vol: 0.22, what: "لفّة 90 درجة" },
  { at: 226, src: "swipe", vol: 0.25, what: "رسم إطار التحديد" },
  { at: 240, src: "ratchet", vol: 0.4, what: "العدّاد 1→7" },
  { at: 284, src: "pop", vol: 0.28, what: "نطّة «7 خطوات»" },
  { at: 318, src: "zoomin", vol: 0.3, what: "الغوص جوّا الشاشة" },
  { at: 346, src: "steps", vol: 0.3, what: "الأعمدة تنرص" },
  { at: 378, src: "shimmer", vol: 0.3, what: "انفجار النقاط" },
  { at: 434, src: "whoosh", vol: 0.22, what: "الخروج من الشاشة" },
  { at: 479, src: "thud", vol: 0.45, what: "تصادم «ذكاء» و«قصتك»" },
  { at: 494, src: "ink", vol: 0.3, what: "تعبئة الحبر" },
  { at: 544, src: "swipe", vol: 0.28, what: "ميلان الكاميرا" },
  { at: 568, src: "rope", vol: 0.4, what: "سحب الحبل" },
  { at: 579, src: "curtain", vol: 0.35, what: "فتح الستارة" },
  { at: 610, src: "strike", vol: 0.22, what: "تظليل RAED AI LAB" },
  { at: 646, src: "reveal", vol: 0.35, what: "كشف اللوحة كلها" },
];

export const Soundtrack: React.FC<{ voiceover: string | null; sfx: boolean }> = ({ voiceover, sfx }) => (
  <>
    {voiceover ? <Html5Audio src={staticFile(voiceover)} volume={1} /> : null}
    {sfx
      ? CUES.map((c, i) => (
          <Sequence key={i} from={c.at} layout="none" name={`sfx: ${c.what}`}>
            {/* بدون فويس أوفر نرفع المؤثرات، ومعه تبقى تحته */}
            <Html5Audio src={staticFile(`sfx/${c.src}.wav`)} volume={voiceover ? c.vol : c.vol * 1.6} />
          </Sequence>
        ))
      : null}
  </>
);
