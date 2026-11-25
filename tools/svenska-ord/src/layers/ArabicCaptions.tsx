import type { Caption, TikTokPage } from "@remotion/captions";
import { createTikTokStyleCaptions } from "@remotion/captions";
import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import { autoCaptions } from "../captions";
import { arabicFont } from "../fonts";
import { resolveSrc } from "../schema";

// Higher = more words per caption page.
const SWITCH_CAPTIONS_EVERY_MS = 1500;

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

  return (
    <Interactive.Div
      name="Caption pill"
      style={{
        direction: "rtl",
        whiteSpace: "pre-wrap",
        textAlign: "center",
        maxWidth: 900,
        padding: "16px 36px 20px",
        borderRadius: 28,
        backgroundColor: "rgba(8, 8, 8, 0.62)",
        backdropFilter: "blur(10px)",
        fontSize: 56,
        fontWeight: 600,
        lineHeight: 1.45,
        opacity: interpolate(frame, [0, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 7], ["0px 14px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }),
      }}
    >
      {page.tokens.map((token, i) => {
        const isActive =
          token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
        const isSpoken = token.toMs <= absoluteTimeMs;
        return (
          <span
            key={`${token.fromMs}-${i}`}
            style={{
              color: "#FFFFFF",
              opacity: isActive ? 1 : isSpoken ? 0.88 : 0.34,
              textShadow: isActive ? "0 0 18px rgba(255,255,255,0.35)" : "none",
            }}
          >
            {token.text}
          </span>
        );
      })}
    </Interactive.Div>
  );
};

/**
 * z-30: Arabic title + word-by-word captions in the bottom safe zone
 * (kept ~340px above the bottom edge, clear of Reels/TikTok UI).
 */
export const ArabicCaptions: React.FC<{
  arabicTitle: string;
  arabicExplanation: string;
  captionsSource: string;
  voiceStartSec: number;
}> = ({ arabicTitle, arabicExplanation, captionsSource, voiceStartSec }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [loaded, setLoaded] = useState<Caption[] | null>(null);

  useEffect(() => {
    if (!captionsSource) {
      return;
    }
    const handle = delayRender(`Loading captions ${captionsSource}`);
    fetch(resolveSrc(captionsSource))
      .then((res) => res.json())
      .then((data: Caption[]) => {
        setLoaded(data);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [captionsSource, delayRender, continueRender, cancelRender]);

  const captions = useMemo<Caption[]>(() => {
    if (captionsSource) {
      return loaded ?? [];
    }
    const endMs = (durationInFrames / fps - 0.9) * 1000;
    return autoCaptions(arabicExplanation, voiceStartSec * 1000, endMs);
  }, [
    captionsSource,
    loaded,
    arabicExplanation,
    voiceStartSec,
    durationInFrames,
    fps,
  ]);

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      }),
    [captions],
  );

  return (
    <AbsoluteFill
      name="Arabic text"
      style={{ fontFamily: arabicFont, color: "#FFFFFF" }}
    >
      <Interactive.Div
        name="Arabic title"
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 560,
          direction: "rtl",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          opacity: interpolate(frame, [0.9 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.9 * fps, 1.5 * fps],
            ["0px 20px", "0px 0px"],
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
            width: 44,
            height: 2,
            backgroundColor: "#FFFFFF",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.25,
            textAlign: "center",
            textShadow: "0 4px 30px rgba(0,0,0,0.85)",
          }}
        >
          {arabicTitle}
        </div>
      </Interactive.Div>

      <AbsoluteFill
        name="Captions"
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 340,
        }}
      >
        {pages.map((page, index) => {
          const nextPage = pages[index + 1] ?? null;
          const startFrame = Math.round((page.startMs / 1000) * fps);
          const endFrame = nextPage
            ? Math.round((nextPage.startMs / 1000) * fps)
            : Math.round(((page.startMs + page.durationMs + 600) / 1000) * fps);
          const duration = endFrame - startFrame;
          if (duration <= 0) {
            return null;
          }
          return (
            <Sequence
              key={index}
              name={`Caption ${index + 1}`}
              from={startFrame}
              durationInFrames={duration}
              layout="none"
            >
              <CaptionPage page={page} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
