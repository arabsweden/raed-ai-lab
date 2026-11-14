import {Easing, interpolate} from "remotion";

export const FPS = 30;
export const GOLD = "#F2C94C";
export const LAKE = "#0E3B53";
export const CREAM = "#F4EBD9";

// Fonts from the Alansari library, same set as the Vasa video.
export const F_TITLE = "'Reem Kufi'"; // FA-51
export const F_CAPTION = "Amiri"; // FA-06
export const F_NUMBER = "'El Messiri'"; // FA-21
export const F_LATIN = "Inter"; // FE-24

export const SHADOW = "0 3px 22px rgba(0,0,0,0.75), 0 1px 3px rgba(0,0,0,0.6)";

/** seconds -> frames */
export const f = (sec: number) => Math.round(sec * FPS);

/** 0..1 progress of the absolute frame between two absolute times (seconds). */
export const prog = (
	frame: number,
	fromSec: number,
	toSec: number,
	easing: (n: number) => number = Easing.out(Easing.cubic),
) =>
	interpolate(frame, [f(fromSec), Math.max(f(fromSec) + 1, f(toSec))], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing,
	});

/** Fades in over `inSec` after `fromSec`, and out over `outSec` before `toSec`. */
export const window01 = (frame: number, fromSec: number, toSec: number, inSec = 0.3, outSec = 0.3) =>
	Math.min(
		prog(frame, fromSec, fromSec + inSec),
		1 - prog(frame, toSec - outSec, toSec, Easing.in(Easing.cubic)),
	);

export const easeOutExpo = Easing.out(Easing.exp);
export const easeInOutCubic = Easing.inOut(Easing.cubic);

export const easeOutBounce = (x: number) => {
	const n1 = 7.5625;
	const d1 = 2.75;
	if (x < 1 / d1) return n1 * x * x;
	if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
	if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
	return n1 * (x -= 2.625 / d1) * x + 0.984375;
};
