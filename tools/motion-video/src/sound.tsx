import React from "react";
import { Html5Audio, interpolate, Sequence, staticFile } from "remotion";
import { FPS } from "./theme";
import { SPEECH, T } from "./timing";

// كل مؤثر مربوط بحركة يشوفها المشاهد. at = فريم بداية الصوت (بعض الأصوات تبدأ قبل الحركة لأن ذروتها متأخرة).
export const CUES: { at: number; src: string; vol: number; what: string }[] = [
  { at: T.stretch[0], src: "stretch", vol: 0.2, what: "تمديد «فكرة» بالكشيدة" },
  { at: T.whip[0] - 4, src: "whoosh", vol: 0.32, what: "سحبة الكاميرا السريعة" },
  { at: T.swaps[1], src: "slide", vol: 0.34, what: "تبديل: الصور" },
  { at: T.swaps[2], src: "slide", vol: 0.3, what: "تبديل: الصوت" },
  { at: T.swaps[3], src: "slide", vol: 0.34, what: "تبديل: المونتاج" },
  { at: T.strike[0], src: "strike", vol: 0.4, what: "شطب «ضايع»" },
  { at: T.easier, src: "pop", vol: 0.32, what: "نطّة «في طريقة أسهل»" },
  { at: T.roll[0] - 2, src: "whoosh", vol: 0.3, what: "لفّة 90 درجة" },
  { at: T.raed, src: "land", vol: 0.32, what: "ظهور RAED7" },
  { at: T.select, src: "swipe", vol: 0.28, what: "رسم إطار التحديد" },
  { at: T.counter[0], src: "ratchet", vol: 0.9, what: "العدّاد 1→7" },
  { at: T.pill, src: "pop", vol: 0.3, what: "نطّة «7 خطوات»" },
  { at: T.dive[0] - 4, src: "zoomin", vol: 0.38, what: "الغوص جوّا الشاشة" },
  { at: T.bars, src: "steps", vol: 0.32, what: "الأعمدة تنرص" },
  { at: T.line[0], src: "draw", vol: 0.42, what: "الخط البياني ينرسم" },
  { at: T.burst, src: "shimmer", vol: 0.34, what: "انفجار النقاط" },
  { at: T.out[0] - 2, src: "whoosh", vol: 0.28, what: "الخروج من الشاشة" },
  { at: T.ai[0] - 6, src: "land", vol: 0.3, what: "«ذكاء» يدخل" },
  { at: T.hit, src: "thud", vol: 0.55, what: "تصادم «قصتك» مع «ذكاء»" },
  { at: T.ink[0], src: "ink", vol: 0.34, what: "تعبئة الحبر" },
  { at: T.tilt[0], src: "swipe", vol: 0.3, what: "ميلان الكاميرا" },
  { at: T.rope[0], src: "rope", vol: 0.45, what: "سحب الحبل" },
  { at: T.curtain[0], src: "curtain", vol: 0.4, what: "فتح الستارة" },
  { at: T.hl[0], src: "strike", vol: 0.26, what: "تظليل RAED AI LAB" },
  { at: T.pull[0], src: "reveal", vol: 0.42, what: "كشف اللوحة كلها" },
];

// خفض المؤثرات تلقائيًا تحت الكلام (ducking) مع انتقال ناعم 0.08 ثانية
const duck = (sec: number) => {
  let d = 0;
  for (const [a, b] of SPEECH) {
    const v = interpolate(sec, [a - 0.08, a, b, b + 0.08], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    d = Math.max(d, v);
  }
  return 1 - 0.45 * d;
};

export const Soundtrack: React.FC<{ voiceover: string | null; sfx: boolean }> = ({ voiceover, sfx }) => (
  <>
    {voiceover ? <Html5Audio src={staticFile(voiceover)} volume={1} /> : null}
    {sfx
      ? CUES.map((c, i) => (
          <Sequence key={i} from={c.at} layout="none" name={`sfx: ${c.what}`}>
            <Html5Audio
              src={staticFile(`sfx/${c.src}.wav`)}
              volume={(f) => (voiceover ? c.vol * duck((c.at + f) / FPS) : c.vol * 1.4)}
            />
          </Sequence>
        ))
      : null}
  </>
);
