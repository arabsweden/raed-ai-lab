import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { CORAL, CREAM, FONT, FPS, NAVY, YELLOW } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const txt = (size: number, color: string, weight = 900): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: weight,
  fontSize: size,
  color,
  lineHeight: 1.35,
  whiteSpace: "nowrap",
});

// رقم أو نسبة داخل span اتجاهه ltr
export const Ltr: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <span dir="ltr" style={{ unicodeBidi: "isolate", display: "inline-block", ...style }}>
    {children}
  </span>
);

// ───── تمديد الكلمة بالكشيدة: 3 قطع في صف واحد RTL ─────
export const Kashida: React.FC<{
  right: string; // الجزء اليمين (ينتهي بحرف يتصل بما بعده)
  left: string; // الجزء اليسار
  stretch: number; // عرض صندوق التطويل بالبكسل
  size: number;
  color: string;
  style?: React.CSSProperties;
}> = ({ right, left, stretch, size, color, style }) => {
  const base = size * 0.24; // تقدير عرض حرف «ـ» الواحد
  const boxW = stretch + size * 0.24;
  const sx = Math.max(1, (boxW + 12) / base);
  return (
    <div
      dir="rtl"
      style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", ...style }}
    >
      <span style={txt(size, color)}>{right + "‍"}</span>
      <div
        style={{
          width: boxW,
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          // القطع تتراكب قليلًا لتغطية الفراغ الجانبي للحروف (نفس اللون)
          marginLeft: -size * 0.12,
          marginRight: -size * 0.12,
        }}
      >
        <span style={{ ...txt(size, color), display: "inline-block", transform: `scaleX(${sx})` }}>
          {"ـ"}
        </span>
      </div>
      <span style={txt(size, color)}>{"‍" + left}</span>
    </div>
  );
};

// ───── نطّة مع انضغاط ─────
export const squash = (frame: number, start: number) => {
  const sp = spring({ frame: frame - start, fps: FPS, config: { damping: 7, stiffness: 180 } });
  const wob = Math.sin(Math.max(0, frame - start) * 0.55) * Math.exp(-Math.max(0, frame - start) / 9);
  return {
    y: interpolate(sp, [0, 1], [-160, 0]),
    sx: 1 + wob * 0.18,
    sy: 1 - wob * 0.18,
    opacityGate: frame >= start ? 1 : 0,
  };
};

// ───── تبديل كلمة: القديمة تطلع لفوق والجديدة تجي من تحت ─────
export const WordSwap: React.FC<{
  words: string[];
  starts: number[]; // فريم بداية دخول كل كلمة
  frame: number;
  size: number;
  color: string;
  height: number;
  width: number;
}> = ({ words, starts, frame, size, color, height, width }) => {
  const D = 9;
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      {words.map((w, i) => {
        const inT = interpolate(frame, [starts[i], starts[i] + D], [1, 0], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        const next = starts[i + 1];
        const outT =
          next === undefined
            ? 0
            : interpolate(frame, [next, next + D], [0, -1], { ...clamp, easing: Easing.in(Easing.cubic) });
        const visible = (i === 0 || frame >= starts[i]) && (next === undefined || frame < next + D);
        if (!visible) return null;
        const y = (i === 0 && frame < starts[0] ? 0 : inT + outT) * height;
        return (
          <div
            key={w}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translateY(${y}px)`,
            }}
          >
            <span style={txt(size, color)}>{w}</span>
          </div>
        );
      })}
    </div>
  );
};

// ───── إطار تحديد بمقابض ─────
export const SelectBox: React.FC<{
  w: number;
  h: number;
  frame: number;
  start: number;
  color: string;
  fill: string;
}> = ({ w, h, frame, start, color, fill }) => {
  const draw = interpolate(frame, [start, start + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const per = 2 * (w + h);
  const handles = [
    [0, 0],
    [w / 2, 0],
    [w, 0],
    [w, h / 2],
    [w, h],
    [w / 2, h],
    [0, h],
    [0, h / 2],
  ];
  return (
    <svg width={w + 60} height={h + 60} style={{ position: "absolute", left: -30, top: -30, overflow: "visible" }}>
      <rect
        x={30}
        y={30}
        width={w}
        height={h}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${per * draw} ${per}`}
      />
      {handles.map(([hx, hy], i) => {
        const s = spring({ frame: frame - start - 8 - i * 1.5, fps: FPS, config: { damping: 10, stiffness: 220 } });
        return (
          <rect
            key={i}
            x={30 + hx - 14}
            y={30 + hy - 14}
            width={28}
            height={28}
            fill={fill}
            stroke={color}
            strokeWidth={6}
            transform={`translate(${30 + hx} ${30 + hy}) scale(${s}) translate(${-(30 + hx)} ${-(30 + hy)})`}
          />
        );
      })}
    </svg>
  );
};

// ───── انفجار نقاط (حتمي بدون Math.random) ─────
export const Burst: React.FC<{ frame: number; start: number; count?: number; radius?: number }> = ({
  frame,
  start,
  count = 16,
  radius = 260,
}) => {
  const t = frame - start;
  if (t < 0 || t > 30) return null;
  const p = interpolate(t, [0, 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shrink = interpolate(t, [12, 30], [1, 0], clamp);
  const colors = [YELLOW, CORAL, CREAM, NAVY];
  return (
    <div style={{ position: "absolute", left: 0, top: 0 }}>
      {new Array(count).fill(0).map((_, i) => {
        const ang = (i / count) * Math.PI * 2 + 0.3;
        const k = 0.65 + 0.35 * Math.abs(Math.sin(i * 12.9898));
        const r = radius * k * p;
        const size = (18 + (i % 3) * 8) * shrink;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: size,
              background: colors[i % 3],
              left: Math.cos(ang) * r - size / 2,
              top: Math.sin(ang) * r - size / 2,
            }}
          />
        );
      })}
    </div>
  );
};

export { clamp };
