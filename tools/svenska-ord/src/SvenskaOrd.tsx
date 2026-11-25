import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { ArabicCaptions } from "./layers/ArabicCaptions";
import { EditorialHud } from "./layers/EditorialHud";
import { FilmGrain } from "./layers/FilmGrain";
import { KineticWord } from "./layers/KineticWord";
import { Subject } from "./layers/Subject";
import { resolveSrc, SvenskaOrdProps } from "./schema";

export const SvenskaOrd: React.FC<SvenskaOrdProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill name="Svenska Ord" style={{ backgroundColor: "#050505" }}>
      {/* z-0 — background grain */}
      <FilmGrain name="Background grain" opacity={0.07} />

      {/* z-10 — oversized kinetic typography */}
      <KineticWord word={props.swedishWord} fontSize={props.wordFontSize} />

      {/* z-20 — foreground subject */}
      <Subject
        mediaSource={props.mediaSource}
        blendMode={props.blendMode}
        mediaFocus={props.mediaFocus}
        mediaScale={props.mediaScale}
        mediaOffset={props.mediaOffset}
      />

      {/* Depth: vignette + bottom shade for caption legibility + light grain over subject */}
      <AbsoluteFill
        name="Vignette"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%), linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 38%)",
        }}
      />
      <FilmGrain name="Overlay grain" opacity={0.035} />

      {/* z-30 — editorial metadata, HUD, Arabic text */}
      <EditorialHud
        category={props.category}
        episode={props.episode}
        phonetic={props.phonetic}
      />
      {props.showArabicText ? (
        <ArabicCaptions
          arabicTitle={props.arabicTitle}
          arabicExplanation={props.arabicExplanation}
          captionsSource={props.captionsSource}
          voiceStartSec={props.voiceStartSec}
        />
      ) : null}

      {/* Audio */}
      {props.audioSource ? (
        <Audio
          name="Voiceover"
          src={resolveSrc(props.audioSource)}
          from={Math.round(props.voiceStartSec * fps)}
        />
      ) : null}
      {props.whoosh ? (
        <Audio
          name="Whoosh"
          src={staticFile("audio/whoosh.m4a")}
          volume={0.55}
        />
      ) : null}
      {props.whoosh ? (
        <Audio
          name="Whoosh (pronunciation)"
          src={staticFile("audio/whoosh.m4a")}
          from={Math.round(1.05 * fps)}
          volume={0.18}
        />
      ) : null}
      {props.ambient ? (
        <Audio
          name="Ambient"
          src={staticFile("audio/ambient-drone.m4a")}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, fps, durationInFrames - fps, durationInFrames],
              [0, props.ambientVolume, props.ambientVolume, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
