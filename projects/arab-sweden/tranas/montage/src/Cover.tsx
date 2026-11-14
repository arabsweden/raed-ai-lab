import React from "react";
import {AbsoluteFill, OffthreadVideo, staticFile} from "remotion";
import "@fontsource/reem-kufi/arabic-700.css";
import "@fontsource/reem-kufi/latin-700.css";
import "@fontsource/el-messiri/latin-700.css";
import "@fontsource/inter/latin-800.css";
import {F_LATIN, F_NUMBER, F_TITLE, GOLD, LAKE} from "./theme";

/** TikTok cover, 1080x1920, one frame. Text stays inside the centre area TikTok shows in the profile grid. */
export const Cover: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: "black"}}>
		<AbsoluteFill style={{transform: "scale(1.12)"}}>
			<OffthreadVideo src={staticFile("s1.mp4")} startFrom={300} muted style={{width: "100%", height: "100%", objectFit: "cover"}} />
		</AbsoluteFill>
		<AbsoluteFill
			style={{background: "linear-gradient(180deg, rgba(6,24,36,0.45) 0%, rgba(6,24,36,0.2) 28%, rgba(6,24,36,0.55) 62%, rgba(6,24,36,0.9) 100%)"}}
		/>
		<AbsoluteFill style={{alignItems: "center", paddingTop: 560, textShadow: "0 4px 26px rgba(0,0,0,0.75)"}}>
			<div style={{fontFamily: F_LATIN, fontWeight: 800, fontSize: 46, letterSpacing: 8, color: "white"}}>SVERIGE · SMÅLAND</div>
			<div style={{width: 120, height: 8, borderRadius: 4, background: GOLD, marginTop: 26}} />
			<div style={{fontFamily: F_TITLE, fontWeight: 700, fontSize: 250, lineHeight: 1.15, color: GOLD, marginTop: 6}}>Tranås</div>
			<div style={{direction: "rtl", fontFamily: F_TITLE, fontWeight: 700, fontSize: 84, lineHeight: 1.45, color: "white", textAlign: "center", marginTop: 10}}>
				<div>مدينة بجانب بحيرة</div>
				<div>
					فيها <span style={{fontFamily: F_NUMBER, color: GOLD, fontSize: 120, lineHeight: 1}}>260</span> جزيرة
				</div>
			</div>
			<div
				style={{
					direction: "rtl",
					display: "flex",
					alignItems: "center",
					gap: 20,
					marginTop: 56,
					padding: "18px 52px",
					borderRadius: 70,
					background: "white",
					color: LAKE,
					fontFamily: F_TITLE,
					fontWeight: 700,
					fontSize: 54,
					textShadow: "none",
					boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
				}}
			>
				<span>جولة في دقيقة</span>
				<svg width={54} height={54} viewBox="0 0 24 24">
					<circle cx={12} cy={13} r={8} fill="none" stroke={LAKE} strokeWidth={2.2} />
					<path d="M12 9v4l2.6 1.6M9.5 2.5h5M12 2.5V5" fill="none" stroke={LAKE} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</div>
		</AbsoluteFill>
	</AbsoluteFill>
);
