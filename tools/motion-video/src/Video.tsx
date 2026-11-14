import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { BOARD_H, BOARD_W, Cam, camAt, PHONE, S1, S2, S3, S4, S5, S6, WORDMARK } from "./camera";
import { Burst, clamp, Kashida, Ltr, SelectBox, squash, txt, WordSwap } from "./kit";
import { CORAL, CREAM, FPS, FX, FY, H, NAVY, W, YELLOW } from "./theme";
import { Soundtrack } from "./sound";
import { T } from "./timing";

const sp = (frame: number, start: number, damping = 12, stiffness = 160) =>
  frame < start ? 0 : spring({ frame: frame - start, fps: FPS, config: { damping, stiffness } });

const ramp = (f: number, r: readonly [number, number], ease = Easing.out(Easing.cubic)) =>
  interpolate(f, [r[0], r[1]], [0, 1], { ...clamp, easing: ease });

// سطر في منتصف الكادر عند ارتفاع معيّن
const Row: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  y,
  children,
  style,
}) => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

// نطّة مع انضغاط (من فوق أو من تحت)
const Bounce: React.FC<{ f: number; at: number; from?: "top" | "bottom"; children: React.ReactNode }> = ({
  f,
  at,
  from = "top",
  children,
}) => {
  const b = squash(f, at);
  if (f < at) return null;
  return (
    <div
      style={{
        transform: `translateY(${from === "top" ? b.y : -b.y}px) scale(${b.sx}, ${b.sy})`,
        transformOrigin: "50% 100%",
      }}
    >
      {children}
    </div>
  );
};

// محطة = كادر 1080×1920 موضوع على اللوحة بحيث يطابق الشاشة لما الكاميرا توقف عليه
const Panel: React.FC<{
  cam: Cam;
  bg: string;
  shadow?: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ cam, bg, shadow, badge, children }) => (
  <div
    style={{
      position: "absolute",
      left: cam.x - FX,
      top: cam.y - FY,
      width: W,
      height: H,
      transformOrigin: `${FX}px ${FY}px`,
      transform: `rotate(${-cam.rot}deg) scale(${1 / cam.s})`,
    }}
  >
    {badge ? (
      <div
        style={{
          position: "absolute",
          left: -150,
          top: -150,
          width: 190,
          height: 190,
          borderRadius: 190,
          background: YELLOW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ltr style={txt(90, NAVY)}>{badge}</Ltr>
      </div>
    ) : null}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: bg,
        overflow: "hidden",
        boxShadow: shadow ? `44px 44px 0 ${shadow}` : undefined,
      }}
    >
      {children}
    </div>
  </div>
);

// ───── 1) الهوك: عندك فكرة؟ (تمديد بالكشيدة مع كلمة «فكرة» + نطّة مع انضغاط) ─────
const Station1: React.FC<{ f: number }> = ({ f }) => {
  const b = squash(f, -7);
  const pre = interpolate(f, [0, T.stretch[0]], [30, 60], clamp);
  const stretch = pre + ramp(f, T.stretch, Easing.out(Easing.back(1.6))) * 200;
  // نبضة صغيرة لما تكتمل الكشيدة
  const punch = 1 + 0.05 * Math.sin(Math.min(1, Math.max(0, (f - T.stretch[1]) / 8)) * Math.PI);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 1080,
          width: 150,
          height: 150,
          background: CORAL,
          transform: `rotate(${f * 1.6}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 90,
          top: 300,
          width: 110,
          height: 110,
          borderRadius: 110,
          border: `22px solid ${NAVY}`,
          transform: `translateY(${Math.sin(f / 8) * 14}px)`,
        }}
      />
      <Row y={400}>
        <div style={{ transform: `translateY(${b.y}px) scale(${b.sx}, ${b.sy})`, transformOrigin: "50% 100%" }}>
          <span style={txt(150, NAVY)}>عندك</span>
        </div>
      </Row>
      <Row y={620}>
        <div style={{ transform: `scale(${punch})` }}>
          <Kashida
            right="فك"
            left="رة؟"
            stretch={stretch}
            size={250}
            color={NAVY}
            style={{ filter: `drop-shadow(14px 14px 0 ${CORAL})` }}
          />
        </div>
      </Row>
    </>
  );
};

// ───── 2) ضايع بين… (تبديل كلمة على كل كلمة منطوقة + شطب) ─────
const Station2: React.FC<{ f: number }> = ({ f }) => {
  const strike = ramp(f, T.strike);
  // الصندوق ينبض مع كل تبديل
  const kick = T.swaps.slice(1).reduce((s, at) => {
    const t = f - at;
    return t >= 0 && t < 14 ? s + Math.sin((t / 14) * Math.PI) * 0.045 : s;
  }, 0);
  return (
    <>
      <Row y={400}>
        <span style={txt(120, NAVY)}>بس&nbsp;</span>
        <span style={{ position: "relative" }}>
          <span style={txt(120, NAVY)}>ضايع</span>
          <div
            style={{
              position: "absolute",
              left: -14,
              right: -14,
              top: "52%",
              height: 24,
              background: CORAL,
              transform: `scaleX(${strike})`,
              transformOrigin: "100% 50%",
            }}
          />
        </span>
        <span style={txt(120, NAVY)}>&nbsp;بين</span>
      </Row>
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 640,
          width: 900,
          height: 270,
          background: NAVY,
          boxShadow: `20px 20px 0 ${YELLOW}`,
          transform: `scale(${1 + kick})`,
        }}
      >
        <WordSwap
          words={["السكربت؟", "الصور؟", "الصوت؟", "المونتاج؟"]}
          starts={[-20, ...T.swaps.slice(1)]}
          frame={f}
          size={150}
          color={YELLOW}
          width={900}
          height={270}
        />
      </div>
      {/* عدّاد صغير لتبديل الكلمات: 4 مربعات تتعبّى */}
      <Row y={968} style={{ gap: 22 }}>
        {T.swaps.map((at, i) => {
          const on = sp(f, at, 14, 220);
          return (
            <div
              key={i}
              style={{
                width: 34,
                height: 34,
                border: `6px solid ${NAVY}`,
                background: on > 0.5 ? CORAL : CREAM,
                transform: `scale(${0.7 + on * 0.3})`,
              }}
            />
          );
        })}
      </Row>
      <Row y={1080}>
        <Bounce f={f} at={T.easier} from="bottom">
          <span style={txt(110, CORAL)}>في طريقة أسهل</span>
        </Bounce>
      </Row>
    </>
  );
};

// ───── 3) الحل: RAED7 (إطار تحديد بمقابض + عدّاد يصعد) + الشاشة الصغيرة ─────
const Station3: React.FC<{ f: number }> = ({ f }) => {
  const n = Math.round(
    interpolate(f, [T.counter[0], T.counter[1]], [1, 7], { ...clamp, easing: Easing.out(Easing.quad) }),
  );
  const raed = sp(f, T.raed, 9, 170);
  const pillIn = sp(f, T.pillIn, 12, 200);
  const pop = squash(f, T.pill);
  const phoneIn = sp(f, T.phone, 11, 170);
  return (
    <>
      <Row y={300}>
        <span style={txt(120, CREAM)}>الحل؟</span>
      </Row>
      <Row y={470}>
        <div style={{ position: "relative", padding: "0 30px" }}>
          <SelectBox w={720} h={250} frame={f} start={T.select} color={YELLOW} fill={NAVY} />
          <Ltr
            style={{
              ...txt(230, CREAM),
              lineHeight: "250px",
              width: 660,
              textAlign: "center",
              textShadow: `12px 12px 0 ${NAVY}`,
              transform: `scale(${raed})`,
            }}
          >
            RAED7
          </Ltr>
        </div>
      </Row>
      <Row y={790}>
        <div
          style={{
            background: NAVY,
            padding: "0 50px",
            borderRadius: 100,
            display: "flex",
            alignItems: "center",
            gap: 26,
            transform: `scale(${pillIn * pop.sx}, ${pillIn * pop.sy})`,
          }}
        >
          <Ltr style={{ ...txt(110, YELLOW), width: 70, textAlign: "center" }}>{n}</Ltr>
          <span style={txt(90, CREAM)}>خطوات</span>
        </div>
      </Row>
      {/* إطار الشاشة الصغيرة اللي بنغوص جوّاها */}
      <div
        style={{
          position: "absolute",
          left: PHONE.left - 16,
          top: PHONE.top - 16,
          width: PHONE.w + 32,
          height: PHONE.h + 32,
          borderRadius: 30,
          background: NAVY,
          boxShadow: `14px 14px 0 ${YELLOW}`,
          transform: `scale(${phoneIn})`,
        }}
      />
    </>
  );
};

// ───── 4) داخل الشاشة: أعمدة «مشاهداتك» تنرص + خط بياني ينرسم لحاله + انفجار نقاط ─────
const Station4: React.FC<{ f: number }> = ({ f }) => {
  const appear = sp(f, T.phone, 11, 170);
  const playOut = 1 - ramp(f, T.playOut, Easing.in(Easing.cubic));
  const pulse = 1 + 0.06 * Math.sin(f / 4);
  const heights = [230, 340, 450, 580, 720];
  const base = 1250;
  const cx = (i: number) => 120 + i * 175 + 67.5; // النمو لليمين: رمز الصعود المفهوم للجميع
  const pts = heights.map((h, i) => [cx(i), base - h - 70] as const);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const draw = ramp(f, T.line, Easing.inOut(Easing.cubic));
  const tip = pts[pts.length - 1];
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${appear})`, background: NAVY }}>
      {playOut > 0 ? (
        <div
          style={{
            position: "absolute",
            left: FX - 150,
            top: FY - 180,
            width: 0,
            height: 0,
            borderTop: "180px solid transparent",
            borderBottom: "180px solid transparent",
            borderLeft: `320px solid ${YELLOW}`,
            transform: `translateX(50px) scale(${playOut * pulse}) rotate(${(1 - playOut) * 90}deg)`,
          }}
        />
      ) : null}
      <Row y={300}>
        <Bounce f={f} at={T.title}>
          <span style={txt(130, CREAM)}>مشاهداتك</span>
        </Bounce>
      </Row>
      {heights.map((h, i) => {
        const g = sp(f, T.bars + i * 6, 9, 140);
        const last = i === heights.length - 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120 + i * 175,
              bottom: H - base,
              width: 135,
              height: h * g,
              background: last ? YELLOW : CREAM,
              boxShadow: last ? `14px 14px 0 ${CORAL}` : undefined,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: 120, right: 120, top: base, height: 12, background: CREAM }} />
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <polyline
          opacity={draw > 0.001 ? 1 : 0}
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={CORAL}
          strokeWidth={16}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${len * draw} ${len}`}
        />
        {pts.map((p, i) => {
          const s = sp(f, T.line[0] + (i / (pts.length - 1)) * (T.line[1] - T.line[0]), 10, 220);
          return s < 0.02 ? null : (
            <circle key={i} cx={p[0]} cy={p[1]} r={20 * s} fill={CORAL} stroke={NAVY} strokeWidth={6} />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: tip[0], top: tip[1] }}>
        <Burst frame={f} start={T.burst} count={18} radius={170} />
      </div>
    </div>
  );
};

// ───── 5) «ذكاء» يدخل، ثم «قصتك» تصطدم فيه + تعبئة الحبر ─────
const Station5: React.FC<{ f: number }> = ({ f }) => {
  const HIT = T.hit;
  const aiIn = ramp(f, T.ai, Easing.out(Easing.back(1.4)));
  const approach = interpolate(f, [HIT - 12, HIT], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const rebound = sp(f, HIT, 8, 200);
  const rX = f < HIT ? interpolate(aiIn, [0, 1], [1500, 736]) : interpolate(rebound, [0, 1], [736, 830]);
  const lX = f < HIT ? interpolate(approach, [0, 1], [-400, 373]) : interpolate(rebound, [0, 1], [373, 285]);
  const tt = Math.max(0, f - HIT);
  const wob = f >= HIT ? Math.sin(tt * 0.9) * Math.exp(-tt / 6) : 0;
  const shake = f >= HIT ? Math.sin(tt * 2.3) * 22 * Math.exp(-tt / 5) : 0;
  const plus = sp(f, T.plus, 9, 220);
  const ink = ramp(f, T.ink, Easing.inOut(Easing.cubic));
  const level = 100 - ink * 112;
  const pts: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const y = level + Math.sin(i * 0.9 + f * 0.35) * 5;
    pts.push(`${(i / 24) * 100}% ${y}%`);
  }
  const wave = `polygon(${pts.join(", ")}, 100% 100%, 0% 100%)`;
  const inkIn = sp(f, T.inkIn, 12, 170);

  const word = (x: number, label: string, color: string, origin: string) => (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 420,
        transform: `translateX(-50%) scale(${1 - wob * 0.22}, ${1 + wob * 0.22})`,
        transformOrigin: origin,
      }}
    >
      <span style={txt(150, color)}>{label}</span>
    </div>
  );

  return (
    <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
      {word(rX, "ذكاء", NAVY, "0% 60%")}
      {f >= HIT - 12 ? word(lX, "قصتك", CORAL, "100% 60%") : null}
      <div style={{ position: "absolute", left: 590, top: 520 }}>
        <Burst frame={f} start={HIT} count={20} radius={300} />
      </div>
      <div style={{ position: "absolute", left: 550, top: 455, width: 100, height: 100, transform: `scale(${plus})` }}>
        <div style={{ position: "absolute", left: 38, top: 0, width: 24, height: 100, background: YELLOW }} />
        <div style={{ position: "absolute", left: 0, top: 38, width: 100, height: 24, background: YELLOW }} />
      </div>
      {f >= T.inkIn ? (
        <Row y={830}>
          <div style={{ position: "relative", transform: `scale(${inkIn})` }}>
            <span style={txt(130, YELLOW)}>محتوى يشبهك</span>
            <span style={{ ...txt(130, NAVY), position: "absolute", left: 0, top: 0, clipPath: wave }}>
              محتوى يشبهك
            </span>
          </div>
        </Row>
      ) : null}
    </div>
  );
};

// ───── 6) ستارة مسرح تنسحب بحبل وتكشف الدعوة (تظليل) ─────
const Station6: React.FC<{ f: number }> = ({ f }) => {
  const pull = interpolate(f, [...T.rope], [0, 150, 0], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const open = ramp(f, T.curtain, Easing.inOut(Easing.cubic));
  const signDrop = ramp(f, T.sign, Easing.in(Easing.cubic)) * 1300;
  const signSwing = Math.sin(f / 6) * 3 * (1 - ramp(f, T.sign));
  const hl = ramp(f, T.hl);
  const l1 = sp(f, T.l1, 12, 150);
  const l2 = sp(f, T.l2, 12, 150);
  const l3 = sp(f, T.l3, 11, 170);

  const curtain = (side: "left" | "right") => (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 580,
        [side]: 0,
        background: CORAL,
        transformOrigin: side === "left" ? "0% 50%" : "100% 50%",
        transform: `translateX(${(side === "left" ? -1 : 1) * open * 420}px) scaleX(${1 - open * 0.55})`,
      }}
    >
      {new Array(6).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 50 + i * 90, width: 14, background: NAVY }} />
      ))}
    </div>
  );

  const lift = (v: number): React.CSSProperties => ({
    transform: `translateY(${(1 - v) * 120}px)`,
    opacity: v > 0.02 ? 1 : 0,
  });

  return (
    <>
      <Row y={330}>
        <span style={{ ...txt(130, CREAM), ...lift(l1) }}>فيديوك الجاي</span>
      </Row>
      <Row y={530}>
        <span style={{ ...txt(130, YELLOW), ...lift(l2) }}>يبلّش من هون</span>
      </Row>
      <Row y={820}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${l3})` }}>
          <span style={txt(96, CREAM)}>تابع</span>
          <div style={{ position: "relative", padding: "0 26px" }}>
            <div
              style={{
                position: "absolute",
                inset: "14px 0",
                background: YELLOW,
                transform: `scaleX(${hl})`,
                transformOrigin: "100% 50%",
              }}
            />
            <Ltr style={{ ...txt(96, YELLOW), position: "relative" }}>RAED AI LAB</Ltr>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                clipPath: `inset(0 0 0 ${(1 - hl) * 100}%)`,
              }}
            >
              <Ltr style={txt(96, NAVY)}>RAED AI LAB</Ltr>
            </div>
          </div>
        </div>
      </Row>
      {curtain("left")}
      {curtain("right")}
      <Row y={640} style={{ transform: `translateY(${signDrop}px) rotate(${signSwing}deg)` }}>
        <div style={{ background: NAVY, padding: "0 60px", borderRadius: 30, boxShadow: `12px 12px 0 ${YELLOW}` }}>
          <span style={txt(130, CREAM)}>جاهز؟</span>
        </div>
      </Row>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 230, background: YELLOW }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, height: 26, background: NAVY }} />
      <div style={{ position: "absolute", left: 975 + open * 420, top: 256, width: 12, height: 520 + pull, background: CREAM }} />
      <div
        style={{
          position: "absolute",
          left: 951 + open * 420,
          top: 756 + pull,
          width: 60,
          height: 90,
          borderRadius: 30,
          background: YELLOW,
          boxShadow: `8px 8px 0 ${NAVY}`,
        }}
      />
    </>
  );
};

// ───── اللوحة: مسار يربط المحطات + الشعار الكبير اللي يبين بالكشف الأخير ─────
const BoardDecor: React.FC<{ f: number }> = ({ f }) => {
  const pts = [S1, S2, S3, S5, S6].map((c) => `${c.x},${c.y}`).join(" ");
  const mark = sp(f, T.pull[0] + 20, 12, 120);
  return (
    <>
      <svg width={BOARD_W} height={BOARD_H} style={{ position: "absolute", left: 0, top: 0 }}>
        <polyline
          points={pts}
          fill="none"
          stroke={CREAM}
          strokeWidth={18}
          strokeDasharray="60 44"
          strokeDashoffset={-f * 6}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: WORDMARK.x - 1100,
          top: WORDMARK.y - 520,
          width: 2200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${0.8 + 0.2 * mark})`,
        }}
      >
        <Ltr style={{ ...txt(760, CREAM), lineHeight: 1.05, textShadow: `40px 40px 0 ${CORAL}` }}>RAED7</Ltr>
        <span dir="rtl" style={txt(230, YELLOW)}>
          من الفكرة للنشر
        </span>
      </div>
    </>
  );
};

export type VideoProps = { voiceover: string | null; sfx: boolean };

export const Video: React.FC<VideoProps> = ({ voiceover, sfx }) => {
  const f = useCurrentFrame();
  const c = camAt(f);
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <Soundtrack voiceover={voiceover} sfx={sfx} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: BOARD_W,
          height: BOARD_H,
          background: NAVY,
          transformOrigin: `${c.x}px ${c.y}px`,
          transform: `translate(${FX - c.x}px, ${c.fy - c.y}px) rotate(${c.rot}deg) scale(${c.s})`,
        }}
      >
        <BoardDecor f={f} />
        <Panel cam={S1} bg={YELLOW} shadow={CORAL} badge="01">
          <Station1 f={f} />
        </Panel>
        <Panel cam={S2} bg={CREAM} shadow={YELLOW} badge="02">
          <Station2 f={f} />
        </Panel>
        <Panel cam={S3} bg={CORAL} shadow={YELLOW} badge="03">
          <Station3 f={f} />
        </Panel>
        <Panel cam={S4} bg="transparent">
          <Station4 f={f} />
        </Panel>
        <Panel cam={S5} bg={CREAM} shadow={CORAL} badge="04">
          <Station5 f={f} />
        </Panel>
        <Panel cam={S6} bg={NAVY} shadow={YELLOW} badge="05">
          <Station6 f={f} />
        </Panel>
      </div>
    </AbsoluteFill>
  );
};
