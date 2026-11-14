import React from "react";
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from "remotion";
import "@fontsource/reem-kufi/arabic-700.css";
import "@fontsource/reem-kufi/latin-700.css";
import "@fontsource/amiri/arabic-700.css";
import "@fontsource/amiri/latin-700.css";
import "@fontsource/el-messiri/arabic-700.css";
import "@fontsource/el-messiri/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
import {Captions} from "./Captions";
import {AVAILABLE, CUTS, T} from "./data";
import {AiNotice, Badge, Callout, CommentBox, Counter, Crane, LowerThird, MapCutaway, SabyRoute, SplitChip, Timeline, WalkPath, Wash} from "./Graphics";
import {F_LATIN, FPS, GOLD, f} from "./theme";

export const TOTAL_FRAMES = f(CUTS[6]);
const OVERLAP = 14; // frames a scene stays under the next one for the transition

type Enter = "none" | "burn" | "leak" | "whip" | "circle";
type SceneDef = {
	n: number;
	move: "in" | "out" | "left" | "right";
	enter: Enter;
	grade?: string;
	grain?: number;
	/** px the footage is pushed down, to keep a face clear of the badge */
	shiftY?: number;
	/** seconds (absolute) at which the footage blurs and darkens for a full-screen graphic */
	dimAt?: number;
};

const SCENES: SceneDef[] = [
	{n: 1, move: "in", enter: "none", dimAt: T.ahlan - 0.3},
	{n: 2, move: "left", enter: "burn", grade: "sepia(0.55) saturate(0.85) contrast(1.06) brightness(0.96)", grain: 0.3},
	{n: 3, move: "in", enter: "leak", dimAt: T.south - 0.1},
	{n: 4, move: "right", enter: "whip"},
	{n: 5, move: "in", enter: "circle", grade: "sepia(0.28) contrast(1.04)", grain: 0.22},
	{n: 6, move: "in", enter: "leak", shiftY: 95},
];

const Placeholder: React.FC<{n: number}> = ({n}) => (
	<AbsoluteFill style={{background: "linear-gradient(160deg, #123F57 0%, #0A2231 60%, #1B1A14 100%)", alignItems: "center", justifyContent: "flex-end"}}>
		<div style={{fontFamily: F_LATIN, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.45)", marginBottom: 330, letterSpacing: 3}}>
			KLIPP {n} SAKNAS – PLATSHÅLLARE
		</div>
	</AbsoluteFill>
);

const Scene: React.FC<{sc: SceneDef; dur: number; nominal: number; exitWhip: boolean}> = ({sc, dur, nominal, exitWhip}) => {
	const frame = useCurrentFrame();
	const start = f(CUTS[sc.n - 1]);
	const p = frame / dur;
	const ease = Easing.inOut(Easing.sin);
	// M-025 Ken Burns, softened so the AI footage keeps its own camera move
	const scale =
		sc.shiftY
			? interpolate(p, [0, 1], [1.11, 1.15], {easing: ease})
			: sc.move === "in"
			? interpolate(p, [0, 1], [1.04, 1.15], {easing: ease})
			: sc.move === "out"
				? interpolate(p, [0, 1], [1.14, 1.04], {easing: ease})
				: 1.1;
	const tx = sc.move === "left" ? interpolate(p, [0, 1], [26, -26], {easing: ease}) : sc.move === "right" ? interpolate(p, [0, 1], [-26, 26], {easing: ease}) : 0;

	const dim = sc.dimAt === undefined ? 0 : interpolate(frame + start, [f(sc.dimAt), f(sc.dimAt) + 12], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
	const filters = [sc.grade, dim > 0 ? `blur(${dim * 16}px) brightness(${1 - dim * 0.35})` : null].filter(Boolean).join(" ");

	// entrance
	let opacity = 1;
	let clip: string | undefined;
	let enterX = 0;
	let enterBlur = 0;
	if (sc.enter === "burn" || sc.enter === "leak") opacity = interpolate(frame, [0, 5], [0, 1], {extrapolateRight: "clamp"});
	if (sc.enter === "circle") {
		// M-016 Circle Reveal 0.6s easeOutCubic
		const r = interpolate(frame, [0, 18], [0, 2300], {extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)});
		clip = `circle(${r}px at 540px 960px)`;
	}
	if (sc.enter === "whip") {
		// M-020 Whip Pan 0.35s easeInOutQuart
		const w = interpolate(frame, [0, 6], [1, 0], {extrapolateRight: "clamp", easing: Easing.out(Easing.poly(4))});
		enterX = w * 1080;
		enterBlur = w * 40;
	}
	// exit for a whip pan into the next scene
	let exitX = 0;
	let exitBlur = 0;
	if (exitWhip) {
		const w = interpolate(frame, [nominal - 5, nominal + 2], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.poly(4))});
		exitX = -w * 1080;
		exitBlur = w * 40;
	}
	const ring = sc.enter === "circle" ? interpolate(frame, [0, 18], [0, 1], {extrapolateRight: "clamp", easing: Easing.out(Easing.cubic)}) : 1;
	const file = `s${sc.n}.mp4`;
	return (
		<AbsoluteFill style={{opacity, clipPath: clip, transform: `translateX(${enterX + exitX}px)`, filter: enterBlur + exitBlur > 0.5 ? `blur(${enterBlur + exitBlur}px)` : undefined}}>
			<AbsoluteFill style={{transform: `translateY(${sc.shiftY ?? 0}px) scale(${scale}) translateX(${tx}px)`, filter: filters || undefined}}>
				{AVAILABLE[`s${sc.n}`] ? (
					<OffthreadVideo src={staticFile(file)} volume={0.13} style={{width: "100%", height: "100%", objectFit: "cover"}} />
				) : (
					<Placeholder n={sc.n} />
				)}
			</AbsoluteFill>
			{sc.grain ? (
				// M-156 Film Grain: noise layer jumping every frame, with a very light flicker
				<AbsoluteFill
					style={{
						backgroundImage: `url(${staticFile("noise.png")})`,
						backgroundPosition: `${(frame * 137) % 512}px ${(frame * 263) % 512}px`,
						mixBlendMode: "overlay",
						opacity: sc.grain * (0.92 + 0.08 * Math.sin(frame * 1.7)),
					}}
				/>
			) : null}
			{sc.grain ? <AbsoluteFill style={{background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 48%, rgba(20,10,0,0.55) 100%)"}} /> : null}
			<AbsoluteFill style={{background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.12) 58%, rgba(0,0,0,0.62) 100%)"}} />
			{sc.enter === "circle" && ring < 1 ? (
				<AbsoluteFill>
					<div style={{position: "absolute", left: 540 - ring * 2300, top: 960 - ring * 2300, width: ring * 4600, height: ring * 4600, borderRadius: "50%", border: `6px solid ${GOLD}`, opacity: 1 - ring}} />
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

/** M-270 Film Burn / M-118 Light Leak: warm light on screen blend, brightest on the cut (0.8s). */
const LightTransition: React.FC<{kind: "burn" | "leak"}> = ({kind}) => {
	const frame = useCurrentFrame(); // 0..24, cut at 12
	const k = Math.sin((Math.PI * frame) / 24);
	if (kind === "burn") {
		const r = 20 + 150 * k;
		return (
			<AbsoluteFill
				style={{
					mixBlendMode: "screen",
					opacity: Math.min(0.9, k * 1.1),
					background: `radial-gradient(circle at 12% 8%, #FFFFFF 0%, #FFE9A8 ${r * 0.28}%, #FF9D2E ${r * 0.6}%, rgba(190,60,0,0.5) ${r * 0.85}%, rgba(0,0,0,0) ${r}%)`,
				}}
			/>
		);
	}
	const x = interpolate(frame, [0, 24], [-30, 130]);
	return (
		<AbsoluteFill
			style={{
				mixBlendMode: "screen",
				opacity: Math.min(1, k * 1.2),
				background: `radial-gradient(ellipse 75% 60% at ${x}% 35%, #FFF3D1 0%, #FFB347 34%, rgba(214,72,20,0.55) 62%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 60% 45% at ${x - 35}% 78%, rgba(255,150,60,0.8) 0%, rgba(0,0,0,0) 100%)`,
			}}
		/>
	);
};

const Sfx: React.FC<{at: number; file: string; volume: number}> = ({at, file, volume}) => (
	<Sequence from={Math.max(0, f(at))} durationInFrames={FPS}>
		<Audio src={staticFile(file)} volume={volume} />
	</Sequence>
);

export const Tranas: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: "black"}}>
		{SCENES.map((sc, i) => {
			const from = f(CUTS[i]);
			const nominal = f(CUTS[i + 1]) - from;
			const dur = nominal + (i < SCENES.length - 1 ? OVERLAP : 0);
			return (
				<Sequence key={sc.n} name={`0${sc.n}-scene`} from={from} durationInFrames={dur}>
					<Scene sc={sc} dur={dur} nominal={nominal} exitWhip={SCENES[i + 1]?.enter === "whip"} />
				</Sequence>
			);
		})}

		{/* 01 hook: crane line drawing, island counter, map with pin */}
		<Crane from={0.15} to={4.6} />
		<Counter from={T.n260 - 0.5} to={T.ahlan - 0.35} countAt={T.n260 - 0.1} start={0} end={260} label="öar i Sommen" />
		<Wash from={T.ahlan - 0.3} to={CUTS[1] + 0.4} />
		<MapCutaway from={T.ahlan - 0.2} to={CUTS[1] + 0.4} pinAt={T.tranas} />
		<AiNotice from={0.5} to={5} />

		{/* 02 history: year counter + timeline */}
		<Counter
			from={CUTS[1] + 0.25}
			to={CUTS[2] - 0.1}
			countAt={T.y1882}
			start={1800}
			end={1882}
			label="Köping"
			top={540}
			second={{countAt: T.y1919, end: 1919, label: "Stad"}}
		/>
		<SplitChip from={T.saby - 1.2} to={T.koping + 1.9} />
		<Timeline from={CUTS[1] + 0.4} to={CUTS[2] - 0.1} a={{at: T.y1882 + 0.9, label: "1882"}} b={{at: T.y1919 + 0.9, label: "1919"}} />

		{/* 03 church: callout from the badge, year, then Säby route */}
		<Callout from={T.tk} to={T.south - 0.2} x={640} y={770} />
		<Wash from={T.south - 0.1} to={CUTS[3] + 0.4} />
		<SabyRoute from={T.south} to={CUTS[3] + 0.4} pinAt={T.sabyk} lakeAt={T.sjon - 0.6} />

		{/* 04 Storgatan */}
		<WalkPath from={T.walk} to={CUTS[4] - 0.1} />

		{/* 05 fur + population */}
		<Counter from={T.n18 - 0.9} to={CUTS[5] - 0.1} countAt={T.n18 - 0.4} start={0} end={18604} label="invånare · 2024" size={190} group />

		{/* 06 CTA */}
		<LowerThird from={CUTS[5] + 0.5} to={T.write - 0.25} name="RAED SHIHAB" sub="SVERIGE · STAD FÖR STAD" />
		<CommentBox from={T.write - 0.2} typeAt={T.write + 0.35} text="Tranås" />

		<Captions />

		<Badge from={4.7} to={T.ahlan - 0.3} name="Sommen" sub="Tranås · Jönköpings län" source="Källa: Wikipedia" />
		<Badge from={CUTS[1]} to={CUTS[2]} name="Tranås" sub="Jönköpings län" source="Källa: Wikipedia" />
		<Badge from={CUTS[2]} to={T.south - 0.1} name="Tranås kyrka" sub="Invigd 1930" source="Källa: Svenska kyrkan" />
		<Badge from={T.south + 0.1} to={CUTS[3]} name="Säby kyrka" sub="6 km söder om Tranås" source="Källa: Svenska kyrkan" />
		<Badge from={CUTS[3]} to={CUTS[4]} name="Storgatan" sub="Tranås centrum" source="Källa: Wikipedia" />
		<Badge from={CUTS[4]} to={CUTS[5]} name="Tranås" sub="Känd för pälsindustri" source="Källa: Wikipedia · SCB" />
		<Badge from={CUTS[5]} to={CUTS[6]} name="Tranås" sub="Vi ses i nästa stad!" top={205} />

		{/* transitions */}
		{SCENES.map((sc, i) =>
			sc.enter === "burn" || sc.enter === "leak" ? (
				<Sequence key={sc.n} name={`transition ${sc.n}`} from={f(CUTS[i]) - 12} durationInFrames={24}>
					<LightTransition kind={sc.enter} />
				</Sequence>
			) : null,
		)}

		<Audio src={staticFile("voice.wav")} />
		{/* very soft effects */}
		{[1, 2, 3, 4, 5].map((i) => (
			<Sfx key={i} at={CUTS[i] - 0.35} file="whoosh.wav" volume={0.09} />
		))}
		<Sfx at={T.tranas + 0.3} file="pop.wav" volume={0.12} />
		<Sfx at={T.sabyk + 0.3} file="pop.wav" volume={0.12} />
		<Sfx at={T.n260 + 1.1} file="tick.wav" volume={0.1} />
		<Sfx at={T.y1882 + 1.2} file="tick.wav" volume={0.1} />
		<Sfx at={T.y1919 + 1.2} file="tick.wav" volume={0.1} />
		<Sfx at={T.n18 + 0.8} file="tick.wav" volume={0.1} />
		{[0, 1, 2, 3, 4, 5].map((i) => (
			<Sfx key={`t${i}`} at={T.write + 0.35 + i * 0.2} file="tick.wav" volume={0.06} />
		))}
	</AbsoluteFill>
);
