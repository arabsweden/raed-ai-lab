import React from "react";
import { AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/playfair-display/900.css";
import "@fontsource/caveat/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/bebas-neue/400.css";
import timing from "./malmo_timing.json";
import { GOLD, SHADOW, clamp, useFonts, Grade, Grain, AiNote, Center } from "./Scene1";

export const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
export const M_FRAMES = f(timing.total);
const OV = 0.25; // transition half-overlap (s)
const YELLOW = "#FECC02", BLUE = "#5DADE2";
type W = { w: string; s: number; e: number };
const TM = timing as unknown as Record<string, { start: number; dur: number; words: W[] }>;
// time (s, scene-relative) of the n-th word matching re
const wt = (k: string, re: RegExp, n = 0) => { const m = TM[k].words.filter((x) => re.test(x.w)); return m[Math.min(n, m.length - 1)].s; };

// scene-relative time in seconds (Sequence starts OV before the scene)
const useT = () => useCurrentFrame() / FPS - OV;
const ease = Easing.inOut(Easing.cubic);
const prog = (t: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: e });
const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(prog(t, a, a + fi), 1 - prog(t, b - fo, b, Easing.in(Easing.quad)));

type Tr = "whip" | "slide" | "zoomblur" | "zoomthrough" | "leak" | "none" | "fade";
const Shell: React.FC<{ clip: string; dur: number; enter: Tr; exit: Tr; push?: [number, number]; children?: React.ReactNode }> = ({ clip, dur, enter, exit, push = [1.0, 1.06], children }) => {
  const t = useT();
  const pi = prog(t, -OV, OV, ease), po = prog(t, dur - OV, dur + OV, ease);
  let tx = 0, sc = interpolate(t, [0, dur], push, clamp), bl = 0, op = 1;
  if (enter === "whip") { sc *= 1.35 - 0.35 * prog(t, -OV, OV + 0.1); bl += 16 * (1 - prog(t, -OV, OV + 0.1)); op = Math.min(op, prog(t, -OV, -OV + 0.12)); }
  if (enter === "slide") tx += 1080 * (1 - pi);
  if (enter === "zoomblur") { sc *= 1.25 - 0.25 * pi; bl += 18 * (1 - pi); op = Math.min(op, prog(t, -OV, 0)); }
  if (enter === "zoomthrough") { sc *= 0.6 + 0.4 * pi; op = Math.min(op, prog(t, -OV, OV * 0.6)); }
  if (enter === "leak") op = Math.min(op, pi);
  if (enter === "fade") op = Math.min(op, prog(t, -OV, 0.1));
  if (exit === "slide") tx -= 1080 * po;
  if (exit === "whip") { const w = prog(t, dur - 0.15, dur + OV, Easing.in(Easing.quad)); sc *= 1 + 0.9 * w; bl += 14 * w; }
  if (exit === "zoomblur") { sc *= 1 + 0.25 * po; bl += 18 * po; }
  if (exit === "zoomthrough") { sc *= 1 + 3 * prog(t, dur - OV, dur + 0.05, Easing.in(Easing.quad)); op = Math.min(op, 1 - prog(t, dur - 0.1, dur + 0.1)); }
  return (
    <AbsoluteFill style={{ transform: `translateX(${tx}px)`, opacity: op, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${sc})`, filter: bl > 0.1 ? `blur(${bl}px)` : undefined }}>
        <OffthreadVideo src={staticFile(clip)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <Grade />
      </AbsoluteFill>
      {children}
    </AbsoluteFill>
  );
};

// Top band label (FE-36 Montserrat + FE-07 Barlow Condensed); items swap with a crossfade
const Label: React.FC<{ items: { at: number; title: string; sub?: string }[]; dur: number }> = ({ items, dur }) => {
  const t = useT(); const { fps } = useVideoConfig();
  const enter = spring({ frame: (t - 0.35) * fps, fps, config: { damping: 200 } });
  const out = 1 - prog(t, dur - 0.3, dur);
  const idx = items.reduce((a, it, i) => (t >= it.at ? i : a), 0);
  return (
    <div style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center", color: "white", opacity: enter * out, textShadow: SHADOW }}>
      <div style={{ display: "inline-block", height: 5, width: 110 * enter, background: GOLD, borderRadius: 3, marginBottom: 14 }} />
      <div style={{ position: "relative", height: 130 }}>
        {items.map((it, i) => {
          const o = i === idx ? prog(t, it.at + (i ? 0.15 : 0), it.at + (i ? 0.45 : 0.01)) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
              <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: it.title.length > 18 ? 54 : 62, letterSpacing: -0.5 }}>{it.title}</div>
              {it.sub && <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 42, letterSpacing: 3, opacity: 0.92 }}>{it.sub}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- kinetic text helpers (Alansari motion IDs in comments)
const Num: React.FC<{ v: string; size?: number; glow?: number }> = ({ v, size = 240, glow = 0.45 }) => (
  <div style={{ fontFamily: "Anton", fontSize: size, lineHeight: 1, color: GOLD, letterSpacing: 4, fontVariantNumeric: "tabular-nums", textShadow: `0 0 30px rgba(212,175,55,${glow}), ${SHADOW}` }}>{v}</div>
);
const Line: React.FC<{ children: React.ReactNode; p: number; size?: number; family?: string; weight?: number; color?: string; ls?: number }> = ({ children, p, size = 90, family = "Outfit", weight = 800, color = "white", ls = 2 }) => (
  <div style={{ fontFamily: family, fontWeight: weight, fontSize: size, color, letterSpacing: ls, marginTop: 6, opacity: p, transform: `translateY(${(1 - p) * 28}px)` }}>{children}</div>
);
// M-040 Number Counter
const Counter: React.FC<{ a: number; from: number; to: number; at: number; until: number; prefix?: string; suffix?: string; size?: number; label?: string; labelAt?: number; y?: number; comma?: boolean }> = ({ a, from, to, at, until, prefix = "", suffix = "", size = 240, label, labelAt, y, comma }) => {
  const t = useT(); const o = win(t, at, until);
  if (o <= 0) return null;
  const v = Math.round(interpolate(t, [at, at + a], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return <Center y={y} style={{ opacity: o }}><Num v={`${prefix}${comma ? v.toLocaleString("en-US") : v}${suffix}`} size={size} />{label && <Line p={prog(t, labelAt ?? at + a, (labelAt ?? at + a) + 0.4)}>{label}</Line>}</Center>;
};
// M-048 Word Stagger
const Stagger: React.FC<{ words: string[]; at: number; until: number; size?: number; family?: string; weight?: number; color?: string; y?: number; ls?: number }> = ({ words, at, until, size = 88, family = "Outfit", weight = 800, color = "white", y, ls = 3 }) => {
  const t = useT(); const o = win(t, at, until, 0.01);
  if (o <= 0) return null;
  return <Center y={y} style={{ opacity: o }}>{words.map((w, i) => { const p = prog(t, at + i * 0.2, at + i * 0.2 + 0.45); return <span key={i} style={{ display: "inline-block", margin: "0 12px", fontFamily: family, fontWeight: weight, fontSize: size, color, letterSpacing: ls, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>{w}</span>; })}</Center>;
};
// M-003 Letter Cascade
const Cascade: React.FC<{ text: string; at: number; until: number; size?: number; color?: string; y?: number }> = ({ text, at, until, size = 118, color = GOLD, y }) => {
  const t = useT(); const o = win(t, at, until, 0.01);
  if (o <= 0) return null;
  return <Center y={y} style={{ opacity: o }}><div style={{ fontFamily: "Unbounded", fontWeight: 800, fontSize: size, color, whiteSpace: "nowrap" }}>{text.split("").map((c, i) => { const p = interpolate(t, [at + i * 0.07, at + i * 0.07 + 0.5], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) }); return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * -60}px) rotate(${(1 - p) * -14}deg)` }}>{c}</span>; })}</div></Center>;
};
// M-052 Wave Text (Caveat)
const Wave: React.FC<{ text: string; at: number; until: number; y?: number; color?: string; size?: number }> = ({ text, at, until, y, color = "white", size = 128 }) => {
  const t = useT(); const o = win(t, at, until, 0.35);
  if (o <= 0) return null;
  return <Center y={y} style={{ opacity: o }}><div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: size, color }}>{text.split("").map((c, i) => <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${Math.sin((t - at) * 5 - i * 0.55) * size * 0.07}px)` }}>{c}</span>)}</div></Center>;
};

// Simplified Sweden outline (lon, lat)
const SWE: [number, number][] = [[13.36,55.34],[12.98,55.6],[12.7,56.05],[12.85,56.67],[12.2,57.3],[11.9,57.7],[11.6,58.3],[11.17,58.94],[11.8,59.85],[12.5,60.4],[12.6,61.0],[12.2,61.9],[12.1,62.6],[12.3,63.3],[14.0,64.4],[14.5,65.3],[16.0,66.5],[17.0,67.6],[18.5,68.5],[20.55,69.06],[21.6,68.4],[22.5,68.44],[23.6,67.9],[23.37,67.21],[23.7,66.4],[24.15,65.83],[22.15,65.58],[21.3,64.9],[20.95,64.75],[20.26,63.83],[18.7,63.29],[17.94,62.63],[17.3,62.39],[17.1,61.73],[17.3,61.0],[17.14,60.67],[18.45,60.34],[18.7,59.76],[18.4,59.4],[18.07,59.33],[17.95,58.9],[16.8,58.6],[16.64,57.76],[16.45,57.1],[16.36,56.66],[15.59,56.16],[14.58,56.05],[14.28,55.93],[14.35,55.56],[13.82,55.43]];
const GOT: [number, number][] = [[18.1,57.25],[18.3,57.0],[18.75,57.25],[19.1,57.85],[18.85,57.95],[18.4,57.65]];
const OLA: [number, number][] = [[16.4,56.25],[16.6,56.2],[17.05,57.3],[16.85,57.35]];
const proj = ([lon, lat]: [number, number]) => { const k = 64; return [540 + (lon - 17.6) * k * 0.5, 1390 - (lat - 55.3) * k] as [number, number]; };
const path = (pts: [number, number][]) => pts.map((p, i) => { const [x, y] = proj(p); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join(" ") + " Z";

const MapPanel: React.FC<{ pinAt: number; zoomAt: number; ll: [number, number]; name: string }> = ({ pinAt, zoomAt, ll, name }) => {
  const STH = proj(ll);
  const t = useT(); const { fps } = useVideoConfig();
  const draw = prog(t, 0.0, 1.1, Easing.inOut(Easing.quad));
  const z = prog(t, zoomAt, zoomAt + 0.8, Easing.in(Easing.cubic));
  const o = 1 - prog(t, zoomAt + 0.15, zoomAt + 0.5);
  if (o <= 0) return null;
  const pin = spring({ frame: (t - pinAt) * fps, fps, config: { damping: 9, stiffness: 160 } });
  const ring = ((t - pinAt) % 1.2) / 1.2;
  const sc = 1 + 5 * z;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, rgba(4,22,38,0.78), rgba(2,10,18,0.92))" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", transform: `scale(${sc})`, transformOrigin: `${STH[0]}px ${STH[1]}px` }}>
        <defs><linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b4f72" /><stop offset="1" stopColor="#0e2f47" /></linearGradient></defs>
        {[path(SWE), path(GOT), path(OLA)].map((d, i) => (
          <path key={i} d={d} fill="url(#land)" fillOpacity={0.85 * draw} stroke={GOLD} strokeWidth={3} strokeDasharray={4000} strokeDashoffset={4000 * (1 - draw)} strokeLinejoin="round" />
        ))}
        {t > pinAt && <>
          <circle cx={STH[0]} cy={STH[1]} r={10 + 70 * ring} fill="none" stroke={GOLD} strokeWidth={3} opacity={1 - ring} />
          <g transform={`translate(${STH[0]}, ${STH[1] - 160 * (1 - pin)}) scale(${0.6 + 0.4 * pin})`}>
            <path d="M0,0 C-8,-22 -26,-34 -26,-56 A26,26 0 1 1 26,-56 C26,-34 8,-22 0,0 Z" fill={GOLD} stroke="white" strokeWidth={3} />
            <circle cx={0} cy={-56} r={9} fill="white" />
          </g>
          <text x={STH[0] + 40} y={STH[1] + 10} fill="white" fontFamily="'Barlow Condensed'" fontWeight={600} fontSize={40} letterSpacing={3} opacity={pin * Math.max(0, 1 - z * 4)}>{name}</text>
        </>}
      </svg>
    </AbsoluteFill>
  );
};

// M-063 Box Outline Draw around a block
const BoxDraw: React.FC<{ at: number; w: number; h: number; y: number }> = ({ at, w, h, y }) => {
  const t = useT(); const p = prog(t, at, at + 0.6);
  const L = 2 * (w + h);
  return <svg width={1080} height={1920} style={{ position: "absolute", top: 0, left: 0 }}><rect x={540 - w / 2} y={y - h / 2} width={w} height={h} rx={26} fill="none" stroke={YELLOW} strokeWidth={6} strokeDasharray={L} strokeDashoffset={L * (1 - p)} /></svg>;
};

const LightLeak: React.FC<{ at: number }> = ({ at }) => {
  const t = useT(); const o = interpolate(t, [at - 0.45, at, at + 0.5], [0, 1, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, background: `radial-gradient(circle at ${30 + 40 * prog(t, at - 0.45, at + 0.5)}% 40%, rgba(255,150,60,0.95), rgba(255,80,40,0.0) 45%), radial-gradient(circle at 75% 70%, rgba(255,200,120,0.8), rgba(255,120,0,0) 40%)` }} />;
};


const Spotlight: React.FC<{ text: string; at: number; until: number; size?: number }> = ({ text, at, until, size = 200 }) => {
  const t = useT(); const o = win(t, at, until, 0.01); if (o <= 0) return null;
  const x = interpolate(t, [at, at + 1.2], [-30, 130], clamp);
  return <Center style={{ opacity: o }}><div style={{ fontFamily: "'Playfair Display'", fontWeight: 900, fontSize: size, color: GOLD, letterSpacing: 4, whiteSpace: "nowrap", textShadow: SHADOW, WebkitMaskImage: `radial-gradient(ellipse 60% 160% at ${x}% 50%, #000 40%, rgba(0,0,0,${Math.min(1, prog(t, at + 0.6, at + 1.3))}) 75%)` }}>{text}</div></Center>;
};

const Spacing: React.FC<{ text: string; at: number; until: number }> = ({ text, at, until }) => {
  const t = useT(); const o = win(t, at, until, 0.3); if (o <= 0) return null;
  return <Center style={{ opacity: o }}><div style={{ fontFamily: "'Playfair Display'", fontWeight: 900, fontSize: 112, color: "white", letterSpacing: `${0.01 + 0.07 * prog(t, at, at + 0.8)}em`, textShadow: SHADOW, whiteSpace: "nowrap" }}>{text}</div></Center>;
};

// M-077 Sparkle Stars
const Sparkles: React.FC<{ at: number; until: number; y: number }> = ({ at, until, y }) => {
  const t = useT(); const o = win(t, at, until, 0.2); if (o <= 0) return null;
  const pts = [[150, -170], [920, -120], [260, 150], [840, 170], [540, -260], [90, 20], [990, 40]];
  return <svg width={1080} height={1920} style={{ position: "absolute", top: 0, left: 0, opacity: o }}>{pts.map(([x, dy], i) => { const s = 0.4 + 0.6 * Math.abs(Math.sin((t - at) * 3 + i * 1.3)); const r = 26 * s;
    return <path key={i} transform={`translate(${x},${y + dy}) scale(${r / 26})`} d="M0,-26 Q3,-3 26,0 Q3,3 0,26 Q-3,3 -26,0 Q-3,-3 0,-26 Z" fill="#FFE9A8" opacity={0.9} style={{ filter: "drop-shadow(0 0 10px rgba(255,220,120,0.9))" }} />; })}</svg>;
};

// M-043 Drop In (+ optional M-009 shake on the last character)
const Drop: React.FC<{ text: string; at: number; until: number; size?: number; color?: string; shakeLast?: boolean; y?: number }> = ({ text, at, until, size = 110, color = "white", shakeLast, y }) => {
  const t = useT(); const { fps } = useVideoConfig(); const o = win(t, at, until, 0.01); if (o <= 0) return null;
  const d = spring({ frame: (t - at) * fps, fps, config: { damping: 11, stiffness: 170 } });
  const sh = shakeLast && t > at + 0.3 && t < at + 0.9 ? Math.sin(t * 60) * 12 * (1 - (t - at - 0.3) / 0.6) : 0;
  const body = shakeLast ? text.slice(0, -1) : text;
  return <Center y={y} style={{ opacity: o }}><div style={{ fontFamily: "Unbounded", fontWeight: 800, fontSize: size, color, lineHeight: 1.1, textShadow: SHADOW, transform: `translateY(${(1 - d) * -220}px)` }}>{body}{shakeLast && <span style={{ display: "inline-block", color: GOLD, transform: `translateX(${sh}px)` }}>{text.slice(-1)}</span>}</div></Center>;
};

const M1: React.FC = () => {
  const k = "s1", d = TM[k].dur;
  const n90 = wt(k, /^90/), deg = wt(k, /^degrees/), its = wt(k, /^It's/), turning = wt(k, /^Turning/), and = wt(k, /^and/), y2005 = wt(k, /^2005/);
  return (
    <Shell clip="m1.mp4" dur={d} enter="fade" exit="whip" push={[1.0, 1.05]}>
      <Drop text="IT TWISTS 🌀" at={0.35} until={n90 - 0.3} size={104} />
      <Counter a={0.8} from={0} to={90} suffix="°" at={n90 - 0.3} until={its - 0.1} label="twist" labelAt={deg} />
      <Cascade text="TURNING TORSO" at={turning - 0.1} until={and - 0.05} size={84} color="white" />
      <Counter a={0.7} from={1990} to={2005} at={y2005 - 0.35} until={d + 0.1} label="opened" labelAt={y2005 + 0.2} />
      <Label dur={d} items={[{ at: 0, title: "Turning Torso", sub: "VÄSTRA HAMNEN" }]} />
    </Shell>
  );
};

const M2: React.FC = () => {
  const k = "s2", d = TM[k].dur, t = useT();
  const pinAt = TM[k].words[2].s, third = wt(k, /^third/), facing = wt(k, /^facing/);
  const zoomAt = third - 0.5;
  const o3 = win(t, third - 0.15, facing - 0.1, 0.25);
  return (
    <Shell clip="m2.mp4" dur={d} enter="whip" exit="slide" push={[1.0, 1.06]}>
      <MapPanel pinAt={pinAt} zoomAt={zoomAt} ll={[13.0, 55.6]} name="MALMÖ" />
      <Cascade text="MALMÖ" at={pinAt - 0.05} until={zoomAt + 0.4} y={1470} size={120} />
      {o3 > 0 && <Center style={{ opacity: o3 }}><div style={{ transform: `scale(${0.7 + 0.3 * prog(t, third - 0.15, third + 0.35, Easing.out(Easing.back(1.5)))})` }}><Num v="#3" size={250} /></div><Line p={prog(t, third + 0.2, third + 0.6)}>city in Sweden</Line></Center>}
      <Wave text="Sweden ⇄ Denmark" at={facing} until={d + 0.1} />
      <Label dur={d} items={[{ at: 0, title: "Malmö", sub: "SKÅNE" }, { at: facing, title: "Öresund", sub: "SVERIGE ⇄ DANMARK" }]} />
    </Shell>
  );
};

const M3: React.FC = () => {
  const k = "s3", d = TM[k].dur;
  const y2000 = wt(k, /^2000/), linked = wt(k, /^linked/), it = wt(k, /^It$/), eight = wt(k, /^eight/), disap = wt(k, /^disappears/);
  return (
    <Shell clip="m3.mp4" dur={d} enter="slide" exit="zoomthrough" push={[1.0, 1.04]}>
      <Counter a={0.7} from={1990} to={2000} at={y2000 - 0.3} until={it - 0.1} label="Sweden ⇄ Denmark" labelAt={linked} />
      <Counter a={0.6} from={0} to={8} prefix="~" suffix=" km" at={eight - 0.25} until={disap - 0.1} label="of bridge" labelAt={eight + 0.3} />
      <Drop text="INTO A TUNNEL ↓" at={disap - 0.1} until={d + 0.1} size={84} />
      <Label dur={d} items={[{ at: 0, title: "Öresundsbron", sub: "ÖPPNAD 2000" }]} />
    </Shell>
  );
};

const M4: React.FC = () => {
  const k = "s4", d = TM[k].dur, t = useT(); const { fps } = useVideoConfig();
  const lilla = TM[k].words[2].s, y1590 = wt(k, /^1590/), full = wt(k, /^full/), cafes = wt(k, /^caf/);
  const oC = win(t, full - 0.05, d + 0.1, 0.01);
  const pop = spring({ frame: (t - (full - 0.05)) * fps, fps, config: { damping: 9, stiffness: 200 } });
  return (
    <Shell clip="m4.mp4" dur={d} enter="zoomthrough" exit="zoomblur" push={[1.0, 1.06]}>
      <Spotlight text="Lilla torg" at={lilla - 0.2} until={y1590 - 0.3} size={170} />
      <Counter a={0.8} from={1500} to={1590} suffix="s" at={y1590 - 0.3} until={full - 0.1} />
      {oC > 0 && <Center style={{ opacity: oC }}>
        <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 120, color: "#FFE3A3", transform: `scale(${0.4 + 0.6 * pop})`, textShadow: SHADOW }}>half-timbered houses</div>
        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 84, color: "white", textShadow: SHADOW, opacity: prog(t, cafes - 0.2, cafes + 0.2) }}>& cosy cafés ☕</div>
      </Center>}
      <Label dur={d} items={[{ at: 0, title: "Lilla torg", sub: "GAMLA STADEN" }]} />
    </Shell>
  );
};

const M5: React.FC = () => {
  const k = "s5", d = TM[k].dur;
  const at = wt(k, /^At$/), y1898 = wt(k, /^1898/), you = wt(k, /^you/), sauna = wt(k, /^sauna/), jump = wt(k, /^jump/), all = wt(k, /^all/);
  return (
    <Shell clip="m5.mp4" dur={d} enter="zoomblur" exit="none" push={[1.0, 1.05]}>
      <Drop text="BRAVE ENOUGH?" at={0.2} until={at - 0.05} size={96} shakeLast />
      <Counter a={0.8} from={1850} to={1898} at={y1898 - 0.3} until={you - 0.1} label="bathhouse" labelAt={y1898 + 0.2} />
      <Stagger words={["sauna 🔥", "→", "sea 🌊"]} at={sauna - 0.1} until={all - 0.1} size={92} />
      <Wave text="all year round" at={all - 0.05} until={d + 0.1} color="#bfe6ff" />
      <Label dur={d} items={[{ at: 0, title: "Ribersborgs kallbadhus", sub: "SEDAN 1898" }]} />
      {jump > 0 ? null : null}
    </Shell>
  );
};

const M6: React.FC = () => {
  const k = "s6", d = TM[k].dur, t = useT(); const { fps } = useVideoConfig();
  const watch = wt(k, /^Watch/), im = wt(k, /^I'm/), which = wt(k, /^Which/), next = wt(k, /^next/);
  const Y = 1420;
  const glow = 0.5 + 0.5 * Math.sin((t - watch) * 4);
  const oTip = win(t, 0.25, im - 0.1, 0.3);
  const pTip = prog(t, watch - 0.1, watch + 0.45, Easing.out(Easing.back(1.4)));
  const oSig = win(t, im - 0.05, which - 0.1, 0.25);
  const shine = interpolate(t, [im + 0.3, im + 1.1], [-30, 130], clamp);
  const oQ = win(t, which - 0.05, d + 1.2, 0.1, 0.5);
  const qWords = ["Which", "city", "next?", "👇"];
  return (
    <Shell clip="m6.mp4" dur={d + 1.0} enter="leak" exit="none" push={[1.0, 1.03]}>
      <LightLeak at={0} />
      {oTip > 0 && <Center y={Y} style={{ opacity: oTip }}>
        <div style={{ display: "inline-block", padding: "8px 28px", borderRadius: 40, background: "#FECC02", color: "#1a1a1a", fontFamily: "Outfit", fontWeight: 800, fontSize: 44, letterSpacing: 6 }}>MY TIP</div>
        <div style={{ fontFamily: "'DM Serif Display'", fontSize: 112, color: GOLD, opacity: pTip, transform: `scale(${0.6 + 0.4 * pTip})`, textShadow: `0 0 ${16 + 22 * glow}px rgba(212,175,55,0.5), ${SHADOW}` }}>Watch the sunset</div>
      </Center>}
      {oSig > 0 && <Center y={Y} style={{ opacity: oSig }}>
        <div style={{ position: "relative", fontFamily: "'Bebas Neue'", fontSize: 150, letterSpacing: 10, lineHeight: 1 }}>
          <div style={{ color: "white", textShadow: SHADOW }}>RAED SHIHAB</div>
          <div style={{ position: "absolute", inset: 0, color: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text", backgroundImage: `linear-gradient(105deg, rgba(212,175,55,0) ${shine - 12}%, rgba(255,230,150,1) ${shine}%, rgba(212,175,55,0) ${shine + 12}%)` }}>RAED SHIHAB</div>
        </div>
        <div style={{ margin: "10px auto 0", height: 5, width: 420 * prog(t, im, im + 0.5), background: GOLD, borderRadius: 3 }} />
      </Center>}
      {oQ > 0 && <Center y={Y} style={{ opacity: oQ }}>
        {qWords.map((w, i) => { const a = i < 2 ? which + i * 0.25 : i === 2 ? next - 0.1 : next + 0.2; const p = spring({ frame: (t - a) * fps, fps, config: { damping: 10, stiffness: 220 } });
          return <span key={i} style={{ display: "inline-block", margin: "0 12px", fontFamily: "Outfit", fontWeight: 800, fontSize: 104, color: w === "next?" ? "#FECC02" : "white", opacity: Math.min(1, p * 2), transform: `scale(${0.3 + 0.7 * p}) translateY(${w === "👇" ? Math.sin(t * 6) * 10 : 0}px)`, textShadow: SHADOW }}>{w}</span>; })}
      </Center>}
      <Label dur={d + 1.0} items={[{ at: 0, title: "Daniaparken", sub: "VÄSTRA HAMNEN" }]} />
    </Shell>
  );
};

const at = (k: string) => f(TM[k].start - OV);
const len = (k: string) => f(TM[k].dur + 2 * OV);

export const MFilm: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const end = interpolate(frame, [M_FRAMES - 15, M_FRAMES - 1], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence name="01-turning-torso" from={at("s1")} durationInFrames={len("s1")}><M1 /></Sequence>
      <Sequence name="02-malmo-map" from={at("s2")} durationInFrames={len("s2")}><M2 /></Sequence>
      <Sequence name="03-oresund-bridge" from={at("s3")} durationInFrames={len("s3")}><M3 /></Sequence>
      <Sequence name="04-lilla-torg" from={at("s4")} durationInFrames={len("s4")}><M4 /></Sequence>
      <Sequence name="05-kallbadhus" from={at("s5")} durationInFrames={len("s5")}><M5 /></Sequence>
      <Sequence name="06-tip-cta" from={at("s6")} durationInFrames={M_FRAMES - at("s6")}><M6 /></Sequence>
      <AiNote />
      <Grain />
      <AbsoluteFill style={{ background: "black", opacity: end }} />
    </AbsoluteFill>
  );
};
