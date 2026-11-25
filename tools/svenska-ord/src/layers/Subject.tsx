import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { isVideoSrc, resolveSrc, SvenskaOrdProps } from "../schema";

/**
 * z-20: foreground subject. Black-background media uses lighten/screen so
 * the bright subject cuts across the gray typography while the black
 * background disappears. Transparent PNGs use "normal".
 */
export const Subject: React.FC<
  Pick<
    SvenskaOrdProps,
    "mediaSource" | "blendMode" | "mediaFocus" | "mediaScale" | "mediaOffset"
  >
> = ({ mediaSource, blendMode, mediaFocus, mediaScale, mediaOffset }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const src = resolveSrc(mediaSource);

  return (
    <AbsoluteFill
      name="Subject"
      style={{
        mixBlendMode: blendMode,
        opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
        scale: interpolate(frame, [0, durationInFrames], [1, 1.06], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      <AbsoluteFill
        name="Subject placement"
        style={{ scale: mediaScale, translate: mediaOffset }}
      >
        {isVideoSrc(mediaSource) ? (
          <Video
            name="Subject video"
            src={src}
            muted
            loop
            objectFit="cover"
            style={{
              width: "100%",
              height: "100%",
              objectPosition: mediaFocus,
            }}
          />
        ) : (
          <Img
            name="Subject image"
            src={src}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: mediaFocus,
            }}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
