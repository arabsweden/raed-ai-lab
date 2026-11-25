import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { uiFont } from "../fonts";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * z-30: hairline, progress bar + timecode (top-left), category tag
 * (top-right) and pronunciation block (mid-right negative space).
 */
export const EditorialHud: React.FC<{
  category: string;
  episode: number;
  phonetic: string;
}> = ({ category, episode, phonetic }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = Math.floor(frame / fps);

  return (
    <AbsoluteFill
      name="Editorial HUD"
      style={{ fontFamily: uiFont, color: "#FFFFFF" }}
    >
      {/* Top-left: timecode + progress */}
      <Interactive.Div
        name="Progress"
        style={{
          position: "absolute",
          top: 150,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 22,
          fontWeight: 500,
          letterSpacing: "0.18em",
          fontVariantNumeric: "tabular-nums",
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span style={{ opacity: 0.85 }}>{`00:${pad(seconds)}`}</span>
        <div
          style={{
            width: 180,
            height: 3,
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#FFFFFF",
              width: `${interpolate(
                frame,
                [0, durationInFrames - 1],
                [0, 100],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              )}%`,
            }}
          />
        </div>
      </Interactive.Div>

      {/* Top-right: category tag */}
      <Interactive.Div
        name="Category tag"
        style={{
          position: "absolute",
          top: 146,
          right: 80,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.24em",
          opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.3 * fps, 0.9 * fps],
            ["0px -12px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          ),
        }}
      >
        {`${category.toUpperCase()} • ${pad(episode)}`}
      </Interactive.Div>

      {/* Hairline */}
      <Interactive.Div
        name="Hairline"
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          height: 1,
          backgroundColor: "#FFFFFF",
          opacity: 0.4,
          width: interpolate(frame, [0, 1 * fps], [0, 920], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
        }}
      />

      {/* Mid-right: pronunciation */}
      <Interactive.Div
        name="Pronunciation"
        style={{
          position: "absolute",
          top: 1060,
          right: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
          opacity: interpolate(frame, [1.1 * fps, 1.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.1 * fps, 1.7 * fps],
            ["24px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          ),
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.3em",
            opacity: 0.55,
          }}
        >
          UTTAL
        </div>
        <div
          style={{
            width: 56,
            height: 1,
            backgroundColor: "#FFFFFF",
            opacity: 0.6,
          }}
        />
        <div style={{ fontSize: 46, fontWeight: 400, letterSpacing: "0.02em" }}>
          {phonetic}
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
