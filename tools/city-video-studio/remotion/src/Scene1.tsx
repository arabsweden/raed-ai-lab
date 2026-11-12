import React, { useEffect, useState } from "react";
import { AbsoluteFill, Easing, OffthreadVideo, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/anton/400.css";
import "@fontsource/unbounded/800.css";
import "@fontsource/outfit/800.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/barlow-condensed/600.css";

export const FPS = 30;
export const DURATION = 405; // 13.5 s incl. exit overlap
const f = (s: number) => Math.round(s * FPS);
export const GOLD = "#D4AF37", RED = "#C8102E";
export const SHADOW = "0 4px 24px rgba(0,0,0,0.65)";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Timeline (seconds), synced to the tightened voice
const T = { y1628: 0.45, royal: 3.15, out1: 5.75, minutes: 6.05, sank: 7.12, hit: 7.72, under: 7.75, underFull: 8.6, n333: 8.35, n333end: 9.85, years: 10.6, out333: 11.25, up: 11.4, upFull: 11.9, whip: 12.95 };

export const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(["400 40px Anton", "800 40px Unbounded", "800 40px Outfit", "800 40px Montserrat", "600 40px 'Barlow Condensed'", "900 40px 'Playfair Display'", "700 40px Caveat", "400 40px 'DM Serif Display'", "400 40px 'Bebas Neue'"].map((x) => document.fonts.load(x, "Bärgad 1628")))
      .then(() => continueRender(h));
  }, [h]);
};

// 0 → 1 when going underwater, 1 → 0 when the ship comes back up
const useWater = (frame: number) => {
  const down = interpolate(frame, [f(T.under), f(T.underFull)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const up = interpolate(frame, [f(T.up - 0.05), f(T.upFull)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return down * (1 - up);
};

const Footage: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useWater(frame);
  const push = interpolate(frame, [0, f(T.sank)], [1.0, 1.09], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const rise = interpolate(frame, [f(T.up), f(T.up + 1.6)], [60, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shakeAmp = interpolate(frame, [f(T.hit), f(T.hit + 0.7)], [26, 0], clamp);
  const sx = (random(`sx${frame}`) - 0.5) * shakeAmp, sy = (random(`sy${frame}`) - 0.5) * shakeAmp;
  const whip = interpolate(frame, [f(T.whip + 0.1), DURATION - 1], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const scale = push * (1 + 0.04 * m) * (1 + 0.9 * whip);
  return (
    <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy + (frame >= f(T.up) ? rise : 0)}px) scale(${scale})`,
      filter: `saturate(${1 - 0.55 * m}) brightness(${1 - 0.3 * m + 0.08 * (frame >= f(T.up) ? 1 - m : 0)}) blur(${2.5 * m + 14 * whip}px) contrast(${1.05 + 0.05 * m})` }}>
      <OffthreadVideo src={staticFile("c1.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const WaterOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const m = useWater(frame);
  if (m <= 0.001) return null;
  const top = interpolate(m, [0, 1], [1950, -220]);
  const ph = frame / 6;
  const pts = Array.from({ length: 25 }, (_, i) => { const x = (i / 24) * 1080; return `${x},${60 + Math.sin(ph + i * 0.7) * 22 + Math.sin(ph * 0.6 + i * 1.9) * 10}`; }).join(" L");
  const bubbles = Array.from({ length: 46 }, (_, i) => {
    const start = f(T.under) + random(`b${i}`) * f(3.6), life = f(1.6 + random(`l${i}`) * 1.8);
    const p = (frame - start) / life; if (p < 0 || p > 1) return null;
    const x = random(`x${i}`) * 1080 + Math.sin(p * 9 + i) * 14, y = 1950 - p * (1500 + random(`y${i}`) * 600), r = 4 + random(`r${i}`) * 16;
    return <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.05)" stroke="rgba(220,240,255,0.55)" strokeWidth={2} opacity={Math.sin(p * Math.PI)} />;
  });
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d6f96" stopOpacity={0.45} />
            <stop offset="0.35" stopColor="#0b3b5c" stopOpacity={0.62} />
            <stop offset="1" stopColor="#031726" stopOpacity={0.88} />
          </linearGradient>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfe6ff" stopOpacity={0.22} /><stop offset="1" stopColor="#bfe6ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g transform={`translate(0, ${top})`}>
          <path d={`M${pts} L1080,2400 L0,2400 Z`} fill="url(#deep)" />
          <path d={`M${pts}`} fill="none" stroke="rgba(210,240,255,0.7)" strokeWidth={4} />
          {[160, 430, 700, 920].map((x, i) => (
            <polygon key={i} points={`${x},70 ${x + 70},70 ${x - 120 + i * 30},1500 ${x - 260 + i * 30},1500`} fill="url(#ray)" opacity={0.5 + 0.5 * Math.sin(frame / 11 + i * 1.7)} />
          ))}
        </g>
        {bubbles}
      </svg>
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{ at: number; color: string; peak: number }> = ({ at, color, peak }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [f(at), f(at) + 1, f(at + 0.22)], [0, peak, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen" }} /> : null;
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
      <svg width={1080} height={1920}><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 30} /></filter><rect width="100%" height="100%" filter="url(#n)" /></svg>
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.5) 72%, rgba(0,0,0,0.7) 100%), radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
);

// Top band: Swedish place label (FE-36 Montserrat 800 + FE-07 Barlow Condensed 600)
const PlaceLabel: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - f(0.6), fps, config: { damping: 200 } });
  const line = spring({ frame: frame - f(0.8), fps, config: { damping: 200 } });
  const swapOut = interpolate(frame, [f(T.up), f(T.up + 0.15)], [1, 0], clamp);
  const swap = interpolate(frame, [f(T.up + 0.2), f(T.up + 0.45)], [0, 1], clamp);
  const out = interpolate(frame, [f(T.whip), f(T.whip + 0.2)], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", color: "white", opacity: enter * out, transform: `translateY(${(1 - enter) * -30}px)`, textShadow: SHADOW }}>
      <div style={{ display: "inline-block", height: 5, width: 110 * line, background: GOLD, borderRadius: 3, marginBottom: 14 }} />
      <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 62, letterSpacing: -0.5 }}>Regalskeppet Vasa</div>
      <div style={{ position: "relative", height: 50, fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 42, letterSpacing: 3, opacity: 0.92 }}>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: swapOut }}>STOCKHOLM · 1628</div>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: swap, color: GOLD }}>BÄRGAD 1961</div>
      </div>
    </div>
  );
};

export const Center: React.FC<{ children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ children, y = 1150, style }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: y, transform: "translateY(-50%)", textAlign: "center", color: "white", textShadow: SHADOW, ...style }}>{children}</div>
);

// M-044 Zoom In Text + M-065 Glow Pulse → «1628»; M-001-style line «ROYAL WARSHIP»
const Year1628: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [f(T.y1628), f(T.y1628 + 0.5)], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const o = interpolate(frame, [f(T.out1), f(T.out1 + 0.3)], [1, 0], clamp);
  const glow = 0.5 + 0.5 * Math.sin(((frame - f(T.y1628)) / f(1.6)) * Math.PI * 2);
  const r = interpolate(frame, [f(T.royal), f(T.royal + 0.4)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (frame < f(T.y1628) || o <= 0) return null;
  return (
    <Center style={{ opacity: o, transform: `translateY(-50%) scale(${1 - 0.1 * (1 - o)})` }}>
      <div style={{ fontFamily: "Anton", fontSize: 250, lineHeight: 1, color: GOLD, letterSpacing: 6, opacity: a, transform: `scale(${1.6 - 0.6 * a})`, filter: `blur(${(1 - a) * 10}px)`,
        textShadow: `0 0 ${18 + 26 * glow}px rgba(212,175,55,${0.35 + 0.35 * glow}), ${SHADOW}` }}>1628</div>
      <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, opacity: r, transform: `translateY(${(1 - r) * 30}px)` }}>
        <span style={{ height: 3, width: 70 * r, background: GOLD }} />
        <span style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 64, letterSpacing: 9 }}>ROYAL WARSHIP</span>
        <span style={{ height: 3, width: 70 * r, background: GOLD }} />
      </div>
    </Center>
  );
};

// M-048 Word Stagger → «MINUTES LATER…»
const MinutesLater: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [f(T.sank - 0.12), f(T.sank)], [1, 0], clamp);
  if (frame < f(T.minutes) || o <= 0) return null;
  return (
    <Center style={{ opacity: o }}>
      {["MINUTES", "LATER…"].map((w, i) => {
        const p = interpolate(frame, [f(T.minutes + i * 0.2), f(T.minutes + i * 0.2 + 0.45)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        return <span key={w} style={{ display: "inline-block", margin: "0 14px", fontFamily: "Outfit", fontWeight: 800, fontSize: 88, letterSpacing: 4, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>{w}</span>;
      })}
    </Center>
  );
};

// M-043 Drop In + M-009 Word Shake → «SHE SANK.», then it sinks with the water
const SheSank: React.FC = () => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const d = spring({ frame: frame - f(T.sank), fps, config: { damping: 11, stiffness: 180 } });
  const shake = interpolate(frame, [f(T.hit), f(T.hit + 0.6)], [1, 0], clamp);
  const sx = shake > 0 && shake < 1 ? Math.sin(frame * 2.7) * 16 * shake : 0;
  const sink = interpolate(frame, [f(T.n333 - 0.35), f(T.n333 + 0.05)], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  if (frame < f(T.sank) || sink >= 1) return null;
  return (
    <Center style={{ opacity: 1 - sink, filter: `blur(${sink * 8}px)` }}>
      <div style={{ fontFamily: "Unbounded", fontWeight: 800, fontSize: 132, color: RED, letterSpacing: 2, transform: `translate(${sx}px, ${(1 - d) * -260 + sink * 160}px)`,
        textShadow: `0 0 26px rgba(200,16,46,0.45), 0 0 2px rgba(255,255,255,0.9), ${SHADOW}` }}>SHE SANK.</div>
    </Center>
  );
};

// M-040 Number Counter (0→333) + «years later»
const Years333: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [f(T.n333), f(T.n333end)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const a = interpolate(frame, [f(T.n333), f(T.n333 + 0.3)], [0, 1], clamp);
  const y = interpolate(frame, [f(T.years), f(T.years + 0.4)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = interpolate(frame, [f(T.out333), f(T.up)], [1, 0], clamp);
  if (frame < f(T.n333) || o <= 0) return null;
  return (
    <Center style={{ opacity: a * o }}>
      <div style={{ fontFamily: "Anton", fontSize: 260, lineHeight: 1, color: GOLD, fontVariantNumeric: "tabular-nums", textShadow: `0 0 30px rgba(212,175,55,0.45), ${SHADOW}` }}>{Math.round(333 * p)}</div>
      <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 92, marginTop: 6, opacity: y, transform: `translateY(${(1 - y) * 30}px)` }}>years later</div>
    </Center>
  );
};

// M-001 Fade Up (rising out of the water) + M-157 Shine Sweep → «1961 · BACK UP»
const BackUp: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [f(T.up + 0.05), f(T.up + 0.6)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shine = interpolate(frame, [f(T.up + 0.7), f(T.up + 1.5)], [-40, 140], clamp);
  const w = interpolate(frame, [f(T.up + 0.25), f(T.up + 0.7)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const o = interpolate(frame, [f(T.whip), f(T.whip + 0.2)], [1, 0], clamp);
  if (frame < f(T.up)) return null;
  return (
    <Center style={{ opacity: p * o, transform: `translateY(calc(-50% + ${(1 - p) * 140}px))` }}>
      <div style={{ position: "relative", fontFamily: "Anton", fontSize: 240, lineHeight: 1, letterSpacing: 6 }}>
        <div style={{ color: GOLD, textShadow: `0 0 30px rgba(212,175,55,0.45), ${SHADOW}` }}>1961</div>
        <div style={{ position: "absolute", inset: 0, color: "transparent", textShadow: "none", WebkitBackgroundClip: "text", backgroundClip: "text",
          backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${shine - 14}%, rgba(255,250,225,0.95) ${shine}%, rgba(255,255,255,0) ${shine + 14}%)` }}>1961</div>
      </div>
      <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 84, letterSpacing: 6, marginTop: 8, opacity: w, transform: `translateY(${(1 - w) * 24}px)` }}>BACK UP ↑</div>
    </Center>
  );
};

export const AiNote: React.FC = () => (
  <div style={{ position: "absolute", left: 64, top: 248, fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 30, letterSpacing: 2, color: "rgba(255,255,255,0.6)" }}>AI-GENERATED VISUALS</div>
);

export const Scene1: React.FC = () => {

  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 6], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <Footage />
        <WaterOverlay />
        <Grade />
        <Flash at={T.hit} color="#ff3b3b" peak={0.2} />
        <Flash at={T.up} color="#fff1c9" peak={0.22} />
        <PlaceLabel />
        <Year1628 />
        <MinutesLater />
        <SheSank />
        <Years333 />
        <BackUp />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
