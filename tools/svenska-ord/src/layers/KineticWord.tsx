import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { displayFont } from "../fonts";

/**
 * z-10: oversized Swedish word + outlined echo, drifting in opposite
 * directions (parallax). Intentionally wider than the frame so the
 * letters crop at the edges.
 */
export const KineticWord: React.FC<{ word: string; fontSize: number }> = ({
  word,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Kinetic typography"
      style={{
        alignItems: "center",
        overflow: "hidden",
        fontFamily: displayFont,
        fontWeight: 900,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        lineHeight: 0.82,
        letterSpacing: "-0.045em",
      }}
    >
      <Interactive.Div
        name="Word"
        style={{
          position: "absolute",
          top: 300,
          fontSize,
          color: "#2E2E2E",
          opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          translate: interpolate(
            frame,
            [0, 1.3 * fps, durationInFrames],
            ["260px 0px", "40px 0px", "-90px -16px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.out(Easing.cubic), Easing.linear],
            },
          ),
        }}
      >
        {word}
      </Interactive.Div>
      <Interactive.Div
        name="Word echo"
        style={{
          position: "absolute",
          top: 300 + fontSize * 0.86,
          fontSize,
          color: "transparent",
          WebkitTextStroke: "2px rgba(255, 255, 255, 0.11)",
          opacity: interpolate(frame, [0.25 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          translate: interpolate(
            frame,
            [0, 1.5 * fps, durationInFrames],
            ["-300px 0px", "-50px 0px", "100px 14px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [Easing.out(Easing.cubic), Easing.linear],
            },
          ),
        }}
      >
        {word}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
