import { useId } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Deterministic animated film grain: the turbulence seed changes every
 * 2 frames, so renders are identical across machines.
 */
export const FilmGrain: React.FC<{ opacity: number; name: string }> = ({
  opacity,
  name,
}) => {
  const frame = useCurrentFrame();
  const filterId = useId().replace(/:/g, "");

  return (
    <AbsoluteFill
      name={name}
      style={{ opacity, mixBlendMode: "screen", pointerEvents: "none" }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 540 960"
        preserveAspectRatio="none"
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={Math.floor(frame / 2) % 97}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="540" height="960" filter={`url(#${filterId})`} />
      </svg>
    </AbsoluteFill>
  );
};
