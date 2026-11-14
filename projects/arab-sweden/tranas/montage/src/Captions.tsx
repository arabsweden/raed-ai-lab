import React from "react";
import {Easing, interpolate, useCurrentFrame} from "remotion";
import {CAPTIONS, Cap, Word} from "./data";
import {F_CAPTION, F_LATIN, F_NUMBER, F_TITLE, FPS, GOLD, SHADOW, f} from "./theme";

const TOP: Record<Cap["pos"], string> = {mid: "50%", low: "74%", cta: "67%"};

type Group = {ltr: boolean; words: Word[]};

// Consecutive Latin words stay in one left-to-right group, so "Tranås kyrka" reads correctly inside RTL.
const group = (words: Word[]): Group[] => {
	const out: Group[] = [];
	for (const w of words) {
		const last = out[out.length - 1];
		if (w.latin && last?.ltr) last.words.push(w);
		else out.push({ltr: w.latin, words: [w]});
	}
	return out;
};

// M-086 Scale Active Word: the spoken word grows to 125% in gold (easeOutBack 0.12s), then returns.
const WordView: React.FC<{w: Word; next?: number; hook: boolean}> = ({w, next, hook}) => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const active = !w.punct && t >= w.s && (next === undefined || t < next);
	const spoken = t >= w.s;
	const up = interpolate(frame, [f(w.s), f(w.s) + 4], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: Easing.out(Easing.back(2)),
	});
	const down =
		next === undefined
			? 0
			: interpolate(frame, [f(next), f(next) + 4], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
	const k = w.punct ? 0 : up - down;
	const keepGold = w.num || (w.emph && spoken);
	const underline = w.emph
		? interpolate(frame, [f(w.s), f(w.s) + 18], [0, 1], {
				extrapolateLeft: "clamp",
				extrapolateRight: "clamp",
				easing: Easing.inOut(Easing.quad),
			})
		: 0;
	return (
		<span
			style={{
				position: "relative",
				display: "inline-block",
				transform: `scale(${1 + 0.18 * k + (w.emph && spoken ? 0.06 : 0)})`,
				color: active || keepGold ? GOLD : "white",
				fontFamily: w.num ? F_NUMBER : w.latin ? F_LATIN : hook ? F_TITLE : F_CAPTION,
				fontWeight: w.latin ? 800 : 700,
				fontSize: w.latin ? "0.8em" : w.num ? "1.05em" : "1em",
				letterSpacing: w.latin ? -1 : 0,
			}}
		>
			{w.t}
			{w.emph && (
				// M-007 Underline Draw
				<span
					style={{
						position: "absolute",
						right: 0,
						bottom: -6,
						height: 7,
						borderRadius: 4,
						width: `${underline * 100}%`,
						background: GOLD,
					}}
				/>
			)}
		</span>
	);
};

const CaptionView: React.FC<{cap: Cap; end: number}> = ({cap, end}) => {
	const frame = useCurrentFrame();
	const from = f(cap.from);
	const to = f(end);
	if (frame < from || frame >= to) return null;
	const enter = interpolate(frame, [from, from + 7], [0, 1], {
		extrapolateRight: "clamp",
		easing: Easing.out(Easing.cubic),
	});
	const exit = interpolate(frame, [to - 5, to], [1, 0], {extrapolateLeft: "clamp"});
	const hook = cap.style === "hook";
	const spoken = cap.words.filter((w) => !w.punct);
	const nextOf = (w: Word) => spoken[spoken.indexOf(w) + 1]?.s;
	return (
		<div
			style={{
				position: "absolute",
				left: 80,
				right: 80,
				top: TOP[cap.pos],
				transform: `translateY(-50%) translateY(${(1 - enter) * 34}px)`,
				opacity: Math.min(enter, exit),
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "center",
				alignItems: "baseline",
				direction: "rtl",
				columnGap: hook ? 36 : 34,
				rowGap: 6,
				fontSize: hook ? 90 : 80,
				lineHeight: 1.5,
				textShadow: SHADOW,
			}}
		>
			{group(cap.words).map((g, i) => (
				<span
					key={i}
					style={{
						display: "inline-flex",
						direction: g.ltr ? "ltr" : "rtl",
						columnGap: 26,
						alignItems: "baseline",
						marginRight: g.words[0].punct ? -28 : 0,
					}}
				>
					{g.words.map((w, j) => (
						<WordView key={j} w={w} next={w.punct ? undefined : nextOf(w)} hook={hook} />
					))}
				</span>
			))}
		</div>
	);
};

export const Captions: React.FC = () => (
	<>
		{CAPTIONS.map((c, i) => (
			<CaptionView key={i} cap={c} end={Math.min(c.to, CAPTIONS[i + 1]?.from ?? c.to)} />
		))}
	</>
);
