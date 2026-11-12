import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useFonts, GOLD } from "./Scene1";

const Card: React.FC<{ src: string; label: string; x: number; rot: number }> = ({ src, label, x, rot }) => (
  <div style={{ position: "absolute", left: x, top: 1110, width: 250, transform: `rotate(${rot}deg)`, background: "white", padding: "10px 10px 0", borderRadius: 18, boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
    <Img src={staticFile(src)} style={{ width: 230, height: 300, objectFit: "cover", borderRadius: 10, filter: "saturate(1.35) contrast(1.08)" }} />
    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 30, letterSpacing: 3, color: "#14202b", textAlign: "center", padding: "6px 0 8px" }}>{label}</div>
  </div>
);

export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Img src={staticFile("cov6_0.2.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.45) contrast(1.12) brightness(1.02)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,18,38,0.82) 0%, rgba(8,18,38,0.45) 22%, rgba(8,18,38,0) 36%, rgba(0,0,0,0) 52%, rgba(10,6,20,0.55) 66%, rgba(8,6,16,0.92) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(255,140,60,0.28), rgba(255,140,60,0) 55%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 66, letterSpacing: 24, color: "white", textShadow: "0 4px 24px rgba(0,0,0,0.6)", paddingLeft: 24 }}>DISCOVER</div>
        <div style={{ fontFamily: "Unbounded", fontWeight: 800, fontSize: 122, lineHeight: 1.1, color: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text",
          backgroundImage: "linear-gradient(180deg, #FFF1B8 0%, #F6CF57 45%, #E59A2F 100%)", filter: "drop-shadow(0 8px 26px rgba(0,0,0,0.65))" }}>STOCKHOLM</div>
        <div style={{ display: "inline-block", marginTop: 22, padding: "10px 30px", borderRadius: 50, background: "#FECC02", color: "#111", fontFamily: "Outfit", fontWeight: 800, fontSize: 40, letterSpacing: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>🇸🇪 60-SECOND CITY TOUR</div>
      </div>
      <Card src="cov1.jpg" label="VASA 1628" x={110} rot={-7} />
      <Card src="cov4.jpg" label="GAMLA STAN" x={415} rot={0} />
      <Card src="cov5.jpg" label="TUNNELBANA" x={720} rot={7} />
      <div style={{ position: "absolute", top: 1495, left: 0, right: 0, textAlign: "center", color: "white", textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>
        <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 78, lineHeight: 0.9, color: "#FFE3A3" }}>with</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 168, lineHeight: 0.95, letterSpacing: 10 }}>RAED SHIHAB</div>
        <div style={{ margin: "8px auto 0", width: 420, height: 6, borderRadius: 3, background: GOLD }} />
        <div style={{ marginTop: 16, fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 34, letterSpacing: 6, opacity: 0.85 }}>EDITED BY RAED SHIHAB</div>
      </div>
    </AbsoluteFill>
  );
};

export const GCover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Img src={staticFile("gcov6.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: "translate(40px, -90px) scale(1.06)", filter: "saturate(1.45) contrast(1.12) brightness(1.02)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,18,38,0.82) 0%, rgba(8,18,38,0.45) 22%, rgba(8,18,38,0) 36%, rgba(0,0,0,0) 52%, rgba(10,6,20,0.55) 66%, rgba(8,6,16,0.92) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(255,140,60,0.28), rgba(255,140,60,0) 55%)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: 66, letterSpacing: 24, color: "white", textShadow: "0 4px 24px rgba(0,0,0,0.6)", paddingLeft: 24 }}>DISCOVER</div>
        <div style={{ fontFamily: "Unbounded", fontWeight: 800, fontSize: 122, lineHeight: 1.1, color: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text",
          backgroundImage: "linear-gradient(180deg, #FFF1B8 0%, #F6CF57 45%, #E59A2F 100%)", filter: "drop-shadow(0 8px 26px rgba(0,0,0,0.65))" }}>GÖTEBORG</div>
        <div style={{ display: "inline-block", marginTop: 22, padding: "10px 30px", borderRadius: 50, background: "#FECC02", color: "#111", fontFamily: "Outfit", fontWeight: 800, fontSize: 40, letterSpacing: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>🇸🇪 60-SECOND CITY TOUR</div>
      </div>
      <Card src="gcov1.jpg" label="FESKEKÔRKA" x={110} rot={-7} />
      <Card src="gcov4.jpg" label="HAGA" x={415} rot={0} />
      <Card src="gcov5.jpg" label="LISEBERG" x={720} rot={7} />
      <div style={{ position: "absolute", top: 1495, left: 0, right: 0, textAlign: "center", color: "white", textShadow: "0 4px 24px rgba(0,0,0,0.7)" }}>
        <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 78, lineHeight: 0.9, color: "#FFE3A3" }}>with</div>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 168, lineHeight: 0.95, letterSpacing: 10 }}>RAED SHIHAB</div>
        <div style={{ margin: "8px auto 0", width: 420, height: 6, borderRadius: 3, background: GOLD }} />
        <div style={{ marginTop: 16, fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 34, letterSpacing: 6, opacity: 0.85 }}>EDITED BY RAED SHIHAB</div>
      </div>
    </AbsoluteFill>
  );
};
