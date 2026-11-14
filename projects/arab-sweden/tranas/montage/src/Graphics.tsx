import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {MAP_H, MAP_W, SWEDEN_PATH, TRANAS_XY} from "./sweden";
import {
	CREAM,
	F_LATIN,
	F_NUMBER,
	F_TITLE,
	FPS,
	GOLD,
	LAKE,
	SHADOW,
	easeInOutCubic,
	easeOutBounce,
	easeOutExpo,
	f,
	prog,
	window01,
} from "./theme";

const Stroke: React.FC<{d: string; p: number; w?: number; color?: string; fill?: string; fillP?: number}> = ({
	d,
	p,
	w = 7,
	color = GOLD,
	fill,
	fillP = 0,
}) => (
	<path
		d={d}
		pathLength={1}
		fill={fill ?? "none"}
		fillOpacity={fill ? fillP : 0}
		stroke={color}
		strokeWidth={w}
		strokeLinecap="round"
		strokeLinejoin="round"
		strokeDasharray="1"
		strokeDashoffset={1 - p}
		opacity={p > 0 ? 1 : 0}
	/>
);

/** Original line drawing of a crane on a ridge (not the municipal coat of arms). Draws, then fills. */
export const Crane: React.FC<{from: number; to: number}> = ({from, to}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.15, 0.4);
	if (vis <= 0) return null;
	const p = (a: number, b: number) => prog(frame, from + a, from + b, easeInOutCubic);
	const fillP = prog(frame, from + 1.9, from + 2.4);
	return (
		<svg
			viewBox="0 0 400 400"
			style={{position: "absolute", left: 340, top: 400, width: 400, height: 400, opacity: vis, filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.6))"}}
		>
			<Stroke d="M30 352 Q200 292 370 352" p={p(0, 0.6)} color="white" w={6} />
			{/* legs */}
			<Stroke d="M206 262 L198 326 L180 334" p={p(0.4, 0.9)} w={6} />
			<Stroke d="M236 262 L246 322 L264 330" p={p(0.5, 1.0)} w={6} />
			{/* body + tail plume */}
			<Stroke
				d="M150 208 C178 172 262 176 292 220 C318 232 334 262 322 296 C314 270 300 258 276 262 C226 276 166 262 150 208 Z"
				p={p(0.7, 1.6)}
				fill={GOLD}
				fillP={fillP * 0.9}
			/>
			{/* neck + head + beak */}
			<Stroke d="M164 198 C128 168 156 128 138 96 C132 80 112 78 106 92" p={p(1.1, 1.8)} w={8} />
			<Stroke d="M106 92 L58 104 L108 104" p={p(1.6, 2.0)} w={6} />
			<circle cx={124} cy={90} r={5} fill="#C0392B" opacity={fillP} />
		</svg>
	);
};

/** M-040 Number Counter (1.2s count, easeOutExpo) with a Swedish label under it. */
export const Counter: React.FC<{
	from: number;
	to: number;
	countAt: number;
	start: number;
	end: number;
	label: string;
	top?: number;
	size?: number;
	second?: {countAt: number; end: number; label: string};
	group?: boolean;
}> = ({from, to, countAt, start, end, label, top = 520, size = 210, second, group}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.3, 0.3);
	if (vis <= 0) return null;
	let value = start + (end - start) * prog(frame, countAt, countAt + 1.2, easeOutExpo);
	let lab = label;
	let hit = prog(frame, countAt + 1.2, countAt + 1.45);
	if (second) {
		const p2 = prog(frame, second.countAt, second.countAt + 1.2, easeOutExpo);
		value = value + (second.end - end) * p2;
		if (frame >= f(second.countAt + 0.5)) lab = second.label;
		if (frame >= f(second.countAt)) hit = prog(frame, second.countAt + 1.2, second.countAt + 1.45);
	}
	const n = Math.round(value);
	const txt = group ? n.toLocaleString("sv-SE").replace(/ /g, " ") : String(n);
	const punch = 1 + 0.07 * Math.sin(Math.PI * hit);
	const enter = prog(frame, from, from + 0.35);
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				top,
				textAlign: "center",
				opacity: vis,
				transform: `translateY(${(1 - enter) * 30}px) scale(${punch})`,
				textShadow: SHADOW,
			}}
		>
			<div
				style={{
					fontFamily: F_NUMBER,
					fontWeight: 700,
					fontSize: size,
					lineHeight: 1,
					color: GOLD,
					fontVariantNumeric: "tabular-nums",
					direction: "ltr",
				}}
			>
				{txt}
			</div>
			<div
				style={{
					fontFamily: F_LATIN,
					fontWeight: 700,
					fontSize: 44,
					letterSpacing: 5,
					color: "white",
					marginTop: 14,
					textTransform: "uppercase",
				}}
			>
				{lab}
			</div>
		</div>
	);
};

/** Lake-blue wash over the (blurred) footage for full-screen graphic moments. */
export const Wash: React.FC<{from: number; to: number; out?: boolean}> = ({from, to, out = false}) => {
	const frame = useCurrentFrame();
	const o = out ? window01(frame, from, to, 0.4, 0.2) : prog(frame, from, from + 0.4);
	if (frame < f(from) || frame >= f(to)) return null;
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				opacity: o,
				background: `linear-gradient(180deg, rgba(14,59,83,0.82) 0%, rgba(8,34,50,0.9) 100%)`,
			}}
		/>
	);
};

const Pin: React.FC<{x: number; y: number; at: number; scale?: number}> = ({x, y, at, scale = 1}) => {
	// M-199 Map Pin Drop: 0.5s easeOutBounce + ripple
	const frame = useCurrentFrame();
	if (frame < f(at)) return null;
	const d = prog(frame, at, at + 0.5, easeOutBounce);
	const r = prog(frame, at + 0.3, at + 1.1);
	return (
		<g transform={`translate(${x} ${y})`}>
			<ellipse rx={12 + 60 * r} ry={(12 + 60 * r) * 0.42} fill="none" stroke={GOLD} strokeWidth={4} opacity={(1 - r) * 0.9} />
			<ellipse rx={10} ry={4} fill="rgba(0,0,0,0.45)" />
			<g transform={`translate(0 ${-(1 - d) * 420}) scale(${scale})`}>
				<path d="M0 0 C-10 -22 -30 -34 -30 -58 A30 30 0 1 1 30 -58 C30 -34 10 -22 0 0 Z" fill={GOLD} stroke="#7A5B00" strokeWidth={2} />
				<circle cy={-58} r={11} fill={LAKE} />
			</g>
		</g>
	);
};

/** Sweden outline (Natural Earth data) drawing itself, pin drop on Tranås, title outline -> fill (M-053). */
export const MapCutaway: React.FC<{from: number; to: number; pinAt: number}> = ({from, to, pinAt}) => {
	const frame = useCurrentFrame();
	if (frame < f(from) || frame >= f(to)) return null;
	const draw = prog(frame, from + 0.1, from + 1.3, easeInOutCubic);
	const fill = prog(frame, from + 0.9, from + 1.6);
	const S = 0.9;
	const ox = 96;
	const oy = 330;
	const zoom = interpolate(frame, [f(from), f(to)], [1, 1.05]);
	const px = TRANAS_XY[0];
	const py = TRANAS_XY[1];
	const outline = prog(frame, pinAt + 0.25, pinAt + 1.05, easeInOutCubic);
	const tfill = prog(frame, pinAt + 1.05, pinAt + 1.45);
	const sub = prog(frame, pinAt + 1.0, pinAt + 1.4);
	const lx = ox + 392 * S;
	const ly = oy + py * S - 138;
	return (
		<div style={{position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: `${ox + px * S}px ${oy + py * S}px`}}>
			<svg width={1080} height={1920} style={{position: "absolute", inset: 0}}>
				<g transform={`translate(${ox} ${oy}) scale(${S})`}>
					<path d={SWEDEN_PATH} fill={CREAM} fillOpacity={0.14 * fill} stroke="none" />
					<path
						d={SWEDEN_PATH}
						pathLength={1}
						fill="none"
						stroke={CREAM}
						strokeWidth={3.2}
						strokeLinejoin="round"
						strokeDasharray="1"
						strokeDashoffset={1 - draw}
					/>
					<Pin x={px} y={py} at={pinAt} scale={1.05} />
				</g>
				<line
					x1={ox + px * S + 34}
					y1={oy + py * S - 52}
					x2={ox + px * S + 34 + (lx - 20 - (ox + px * S + 34)) * outline}
					y2={oy + py * S - 52}
					stroke={GOLD}
					strokeWidth={4}
					strokeLinecap="round"
					opacity={outline > 0 ? 1 : 0}
				/>
			</svg>
			<div style={{position: "absolute", left: lx, top: ly, direction: "ltr"}}>
				<div style={{position: "relative", fontFamily: F_TITLE, fontWeight: 700, fontSize: 132, lineHeight: 1.1}}>
					<div
						style={{
							color: "transparent",
							WebkitTextStroke: `3px ${GOLD}`,
							clipPath: `inset(0 ${(1 - outline) * 100}% 0 0)`,
						}}
					>
						Tranås
					</div>
					<div style={{position: "absolute", inset: 0, color: "white", opacity: tfill, textShadow: SHADOW}}>Tranås</div>
				</div>
				<div
					style={{
						fontFamily: F_LATIN,
						fontWeight: 700,
						fontSize: 40,
						letterSpacing: 4,
						color: GOLD,
						opacity: sub,
						transform: `translateY(${(1 - sub) * 16}px)`,
						marginTop: 2,
					}}
				>
					SMÅLAND · SVERIGE
				</div>
			</div>
		</div>
	);
};

/** Timeline with two dated points; the line draws to each point when its year is spoken. */
export const Timeline: React.FC<{from: number; to: number; a: {at: number; label: string}; b: {at: number; label: string}}> = ({
	from,
	to,
	a,
	b,
}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.3, 0.3);
	if (vis <= 0) return null;
	const x0 = 150;
	const xa = 330;
	const xb = 750;
	const x1 = 930;
	const y = 1290;
	const p1 = prog(frame, from, a.at + 0.3, easeInOutCubic);
	const p2 = prog(frame, b.at - 1.0, b.at + 0.3, easeInOutCubic);
	const end = x0 + (xa - x0) * p1 + (xb - xa) * p2 + (x1 - xb) * prog(frame, b.at + 0.3, b.at + 1.0);
	const dot = (x: number, at: number, label: string) => {
		const d = prog(frame, at, at + 0.35, Easing.out(Easing.back(2.5)));
		return (
			<g opacity={frame >= f(at) ? 1 : 0}>
				<circle cx={x} cy={y} r={16 * d} fill={GOLD} />
				<circle cx={x} cy={y} r={16 + 26 * prog(frame, at, at + 0.8)} fill="none" stroke={GOLD} strokeWidth={3} opacity={1 - prog(frame, at, at + 0.8)} />
				<text x={x} y={y + 66} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill="white" opacity={d}>
					{label}
				</text>
			</g>
		);
	};
	return (
		<svg width={1080} height={1920} style={{position: "absolute", inset: 0, opacity: vis, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.6))"}}>
			<line x1={x0} y1={y} x2={x1} y2={y} stroke="rgba(255,255,255,0.28)" strokeWidth={4} strokeLinecap="round" />
			<line x1={x0} y1={y} x2={end} y2={y} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
			{dot(xa, a.at, a.label)}
			{dot(xb, b.at, b.label)}
		</svg>
	);
};

/** Small pill: "Säby -> Tranås" with a drawn arrow. */
export const SplitChip: React.FC<{from: number; to: number}> = ({from, to}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.25, 0.25);
	if (vis <= 0) return null;
	const a = prog(frame, from + 0.2, from + 0.8, easeInOutCubic);
	const t2 = prog(frame, from + 0.7, from + 1.0);
	return (
		<div
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				top: 1105,
				display: "flex",
				justifyContent: "center",
				opacity: vis,
				transform: `translateY(${(1 - prog(frame, from, from + 0.3)) * 20}px)`,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 22,
					padding: "14px 34px",
					borderRadius: 60,
					background: "rgba(20,14,6,0.55)",
					border: "2px solid rgba(244,235,217,0.55)",
					fontFamily: F_LATIN,
					fontWeight: 700,
					fontSize: 42,
					color: CREAM,
					direction: "ltr",
				}}
			>
				<span>Säby</span>
				<svg width={110} height={30}>
					<line x1={4} y1={15} x2={4 + 92 * a} y2={15} stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
					<path d="M84 5 L100 15 L84 25" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={a > 0.9 ? 1 : 0} />
				</svg>
				<span style={{color: GOLD, opacity: t2}}>Tranås</span>
			</div>
		</div>
	);
};

/** M-244 Callout Line: thin line from the Swedish badge to a pulsing dot on the subject (0.6s). */
export const Callout: React.FC<{from: number; to: number; x: number; y: number}> = ({from, to, x, y}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.1, 0.3);
	if (vis <= 0) return null;
	const p = prog(frame, from, from + 0.6, easeInOutCubic);
	const pulse = ((frame - f(from)) % 36) / 36;
	return (
		<svg width={1080} height={1920} style={{position: "absolute", inset: 0, opacity: vis, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))"}}>
			<path
				d={`M ${1016} 512 L ${x + 90} 512 L ${x} ${y}`}
				pathLength={1}
				fill="none"
				stroke="white"
				strokeWidth={4}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray="1"
				strokeDashoffset={1 - p}
			/>
			<g opacity={p >= 1 ? 1 : 0}>
				<circle cx={x} cy={y} r={11} fill={GOLD} />
				<circle cx={x} cy={y} r={11 + 30 * pulse} fill="none" stroke={GOLD} strokeWidth={3} opacity={1 - pulse} />
			</g>
		</svg>
	);
};

/** Schematic route Tranås -> Säby kyrka, 6 km south, by Säbysjön. Not a real map. */
export const SabyRoute: React.FC<{from: number; to: number; pinAt: number; lakeAt: number}> = ({from, to, pinAt, lakeAt}) => {
	const frame = useCurrentFrame();
	if (frame < f(from) || frame >= f(to)) return null;
	const vis = Math.min(prog(frame, from, from + 0.3), 1 - prog(frame, to - 0.2, to));
	const route = prog(frame, from + 0.5, pinAt, easeInOutCubic);
	const km = prog(frame, from + 1.1, from + 1.5);
	const name = prog(frame, pinAt + 0.4, pinAt + 0.8);
	const lake = prog(frame, lakeAt - 0.2, lakeAt + 0.5, easeInOutCubic);
	const lakeTxt = prog(frame, lakeAt + 0.2, lakeAt + 0.6);
	const wob = Math.sin(frame / 7) * 5;
	const d = "M540 520 C470 640 620 760 540 880 C500 940 520 1000 540 1040";
	return (
		<svg width={1080} height={1920} style={{position: "absolute", inset: 0, opacity: vis}}>
			{/* compass */}
			<g transform="translate(170 520)" opacity={0.85}>
				<path d="M0 -44 L14 6 L0 -4 L-14 6 Z" fill={GOLD} />
				<text y={46} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={34} fill="white">
					N
				</text>
			</g>
			{/* lake */}
			<g opacity={lake}>
				<ellipse cx={720} cy={1085} rx={170 * lake} ry={70 * lake} fill="rgba(120,190,220,0.35)" stroke="rgba(160,215,240,0.8)" strokeWidth={3} />
				{[0, 1, 2].map((i) => (
					<path
						key={i}
						d={`M${640 + i * 14 + wob} ${1066 + i * 20} q20 -12 40 0 t40 0 t40 0`}
						fill="none"
						stroke="rgba(220,240,250,0.85)"
						strokeWidth={3}
						strokeLinecap="round"
					/>
				))}
			</g>
			<text x={720} y={1210} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={40} fill="#CFE9F5" opacity={lakeTxt}>
				Säbysjön
			</text>
			{/* route */}
			<path d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={6} strokeDasharray="4 18" strokeLinecap="round" />
			<path d={d} pathLength={1} fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" strokeDasharray="1" strokeDashoffset={1 - route} />
			{/* start point */}
			<circle cx={540} cy={520} r={16} fill="white" />
			<circle cx={540} cy={520} r={7} fill={LAKE} />
			<text x={540} y={470} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={52} fill="white">
				Tranås
			</text>
			{/* distance */}
			<g opacity={km} transform={`translate(${300 - (1 - km) * 30} 770)`}>
				<rect x={-90} y={-44} width={180} height={88} rx={44} fill={GOLD} />
				<text y={17} textAnchor="middle" fontFamily="El Messiri" fontWeight={700} fontSize={50} fill={LAKE}>
					6 km
				</text>
			</g>
			<Pin x={540} y={1040} at={pinAt} scale={1.5} />
			<g opacity={name} transform={`translate(${-(1 - name) * 20} 0)`}>
				<text x={500} y={1010} textAnchor="end" fontFamily="Inter" fontWeight={800} fontSize={58} fill="white">
					Säby kyrka
				</text>
				<text x={500} y={1062} textAnchor="end" fontFamily="Inter" fontWeight={700} fontSize={36} fill={GOLD} letterSpacing={2}>
					MEDELTIDA KYRKA
				</text>
			</g>
		</svg>
	);
};

/** Dashed walking path that draws along the bottom of the frame with a moving dot. */
export const WalkPath: React.FC<{from: number; to: number}> = ({from, to}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.3, 0.4);
	if (vis <= 0) return null;
	const p = prog(frame, from, to - 0.3, Easing.inOut(Easing.quad));
	const x = 130 + 820 * p;
	const yAt = (xx: number) => 1470 + Math.sin((xx - 130) / 130) * 22;
	const pts = Array.from({length: 60}, (_, i) => 130 + (820 * i) / 59).filter((xx) => xx <= x);
	return (
		<svg width={1080} height={1920} style={{position: "absolute", inset: 0, opacity: vis, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))"}}>
			{pts.map((xx, i) => (i % 2 === 0 ? <circle key={i} cx={xx} cy={yAt(xx)} r={5} fill="white" opacity={0.85} /> : null))}
			<circle cx={x} cy={yAt(x)} r={15} fill={GOLD} />
			<circle cx={x} cy={yAt(x)} r={15 + 16 * ((frame % 30) / 30)} fill="none" stroke={GOLD} strokeWidth={3} opacity={1 - (frame % 30) / 30} />
		</svg>
	);
};

/** M-039 Lower Third: bar from the right edge (0.4s), then the name (0.3s). */
export const LowerThird: React.FC<{from: number; to: number; name: string; sub: string}> = ({from, to, name, sub}) => {
	const frame = useCurrentFrame();
	if (frame < f(from) || frame >= f(to)) return null;
	const bar = Math.min(prog(frame, from, from + 0.4, easeOutExpo), 1 - prog(frame, to - 0.35, to, Easing.in(Easing.cubic)));
	const txt = Math.min(prog(frame, from + 0.35, from + 0.65), 1 - prog(frame, to - 0.6, to - 0.35));
	return (
		<div style={{position: "absolute", right: 0, top: 1430, width: 560, height: 118, overflow: "hidden"}}>
			<div
				style={{
					position: "absolute",
					inset: 0,
					transform: `translateX(${(1 - bar) * 100}%)`,
					background: GOLD,
					borderRadius: "60px 0 0 60px",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					paddingLeft: 46,
					direction: "ltr",
					fontFamily: F_LATIN,
					color: LAKE,
				}}
			>
				<div style={{fontWeight: 800, fontSize: 46, letterSpacing: 2, opacity: txt, transform: `translateX(${(1 - txt) * 40}px)`}}>{name}</div>
				<div style={{fontWeight: 700, fontSize: 26, letterSpacing: 3, opacity: txt * 0.85}}>{sub}</div>
			</div>
		</div>
	);
};

/** M-032 Comment Typing: comment field, keyword typed over 1.5s, send button pulses. */
export const CommentBox: React.FC<{from: number; typeAt: number; text: string}> = ({from, typeAt, text}) => {
	const frame = useCurrentFrame();
	if (frame < f(from)) return null;
	const enter = prog(frame, from, from + 0.35, Easing.out(Easing.back(1.4)));
	const chars = Math.floor(prog(frame, typeAt, typeAt + 1.2, (x) => x) * text.length);
	const typed = text.slice(0, chars);
	const done = frame >= f(typeAt + 1.3);
	const pulseT = done ? ((frame - f(typeAt + 1.3)) % 40) / 40 : 0;
	const pulse = done ? (pulseT < 0.2 ? 1 - 0.25 * (pulseT / 0.2) : pulseT < 0.5 ? 0.75 + 0.4 * ((pulseT - 0.2) / 0.3) : 1.15 - 0.15 * Math.min(1, (pulseT - 0.5) / 0.2)) : 1;
	const caret = Math.floor(frame / 8) % 2 === 0;
	return (
		<div
			style={{
				position: "absolute",
				left: 110,
				right: 110,
				top: 1432,
				height: 112,
				borderRadius: 56,
				background: "rgba(255,255,255,0.96)",
				boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
				display: "flex",
				alignItems: "center",
				padding: "0 16px 0 40px",
				direction: "ltr",
				opacity: Math.min(1, enter),
				transform: `translateY(${(1 - enter) * 60}px)`,
			}}
		>
			<svg width={48} height={48} viewBox="0 0 24 24" style={{marginRight: 18, flexShrink: 0}}>
				<path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="none" stroke="#8A8F98" strokeWidth={2} strokeLinejoin="round" />
			</svg>
			<div style={{flex: 1, fontFamily: F_LATIN, fontWeight: 700, fontSize: 46, color: typed ? "#111" : "#9AA0A6", display: "flex", alignItems: "center"}}>
				{typed || "Lägg till en kommentar…"}
				{typed && chars >= text.length && (
					<svg width={38} height={46} viewBox="-32 -92 64 96" style={{marginLeft: 12}}>
						<path d="M0 0 C-10 -22 -30 -34 -30 -58 A30 30 0 1 1 30 -58 C30 -34 10 -22 0 0 Z" fill="#E0483B" />
						<circle cy={-58} r={11} fill="white" />
					</svg>
				)}
				{typed && !done && <span style={{width: 4, height: 50, background: "#111", marginLeft: 4, opacity: caret ? 1 : 0}} />}
			</div>
			<div
				style={{
					width: 84,
					height: 84,
					borderRadius: 42,
					background: "#1D9BF0",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transform: `scale(${pulse})`,
					opacity: typed ? 1 : 0.45,
				}}
			>
				<svg width={42} height={42} viewBox="0 0 24 24">
					<path d="M12 20V5M5 12l7-7 7 7" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		</div>
	);
};

/** Swedish place badge, top right, away from the face. */
export const Badge: React.FC<{from: number; to: number; name: string; sub?: string; source?: string; top?: number}> = ({from, to, name, sub, source, top = 300}) => {
	const frame = useCurrentFrame();
	if (frame < f(from) || frame >= f(to)) return null;
	const enter = prog(frame, from + 0.25, from + 0.7);
	const line = prog(frame, from + 0.45, from + 0.95);
	const exit = 1 - prog(frame, to - 0.25, to);
	return (
		<div
			style={{
				position: "absolute",
				top,
				right: 64,
				textAlign: "right",
				direction: "ltr",
				fontFamily: F_LATIN,
				color: "white",
				opacity: Math.min(enter, exit),
				transform: `translateX(${(1 - enter) * 60}px)`,
				textShadow: "0 2px 18px rgba(0,0,0,0.6)",
			}}
		>
			<div style={{display: "inline-block", height: 6, width: 90 * line, background: GOLD, borderRadius: 3, marginBottom: 14}} />
			<div style={{fontSize: 64, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1}}>{name}</div>
			{sub && <div style={{fontSize: 34, fontWeight: 700, opacity: 0.92, marginTop: 6}}>{sub}</div>}
			{source && <div style={{fontSize: 24, fontWeight: 400, opacity: 0.75, marginTop: 10}}>{source}</div>}
		</div>
	);
};

export const AiNotice: React.FC<{from: number; to: number}> = ({from, to}) => {
	const frame = useCurrentFrame();
	const vis = window01(frame, from, to, 0.4, 0.4);
	if (vis <= 0) return null;
	return (
		<div
			style={{
				position: "absolute",
				left: 64,
				top: 1500,
				fontFamily: F_LATIN,
				fontWeight: 400,
				fontSize: 24,
				color: "white",
				opacity: vis * 0.7,
				textShadow: "0 1px 8px rgba(0,0,0,0.8)",
				direction: "ltr",
			}}
		>
			AI-generated visuals
		</div>
	);
};

export const _fps = FPS;
