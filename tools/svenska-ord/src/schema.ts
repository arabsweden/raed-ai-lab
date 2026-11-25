import { staticFile } from "remotion";
import { z } from "zod";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Props of one rendered episode (editable in the Studio sidebar).
export const svenskaOrdSchema = z.object({
  episode: z.number().int().min(1),
  category: z.string(),
  swedishWord: z.string(),
  phonetic: z.string(),
  arabicTitle: z.string(),
  arabicExplanation: z.string(),
  // Path relative to public/ or a full https URL. Image (.jpg/.png/.webp) or video (.mp4/.webm/.mov).
  mediaSource: z.string(),
  // Voiceover path relative to public/ or URL. Empty string = no voiceover.
  audioSource: z.string(),
  // Optional Caption[] JSON (e.g. from Whisper) relative to public/. Empty = auto timing.
  captionsSource: z.string(),
  durationInSeconds: z.number().min(3).max(90),
  wordFontSize: z.number().min(120).max(700),
  // lighten/screen for black-background media, normal for transparent PNG.
  blendMode: z.enum(["lighten", "screen", "normal"]),
  // CSS object-position of the subject, e.g. "38% 50%".
  mediaFocus: z.string(),
  // Base size/position of the subject inside the frame (before the slow zoom).
  mediaScale: z.number().min(0.3).max(3),
  // CSS translate, e.g. "-80px -240px" moves the subject left and up.
  mediaOffset: z.string(),
  voiceStartSec: z.number().min(0),
  whoosh: z.boolean(),
  ambient: z.boolean(),
  ambientVolume: z.number().min(0).max(1),
  showArabicText: z.boolean(),
});

export type SvenskaOrdProps = z.infer<typeof svenskaOrdSchema>;

// Shape of words.json (nulls and missing fields fall back to "defaults").
export type WordsFile = {
  defaults: Partial<Record<keyof SvenskaOrdProps, unknown>>;
  episodes: Array<
    { id: string } & Partial<Record<keyof SvenskaOrdProps, unknown>>
  >;
};

const FALLBACK: Omit<
  SvenskaOrdProps,
  | "episode"
  | "swedishWord"
  | "phonetic"
  | "arabicTitle"
  | "arabicExplanation"
  | "mediaSource"
> = {
  category: "SVENSKA ORD",
  audioSource: "",
  captionsSource: "",
  durationInSeconds: 12,
  wordFontSize: 380,
  blendMode: "lighten",
  mediaFocus: "50% 50%",
  mediaScale: 1,
  mediaOffset: "0px 0px",
  voiceStartSec: 0.6,
  whoosh: true,
  ambient: true,
  ambientVolume: 0.18,
  showArabicText: true,
};

const stripNulls = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined),
  );

export const toEpisodeProps = (
  file: WordsFile,
  entry: WordsFile["episodes"][number],
  index: number,
): SvenskaOrdProps => {
  const { id, ...rest } = entry;
  const merged = {
    ...FALLBACK,
    episode: index + 1,
    ...stripNulls(file.defaults as Record<string, unknown>),
    ...stripNulls(rest as Record<string, unknown>),
  };
  const parsed = svenskaOrdSchema.safeParse(merged);
  if (!parsed.success) {
    throw new Error(
      `words.json → episode "${id}" is invalid:\n${parsed.error.message}`,
    );
  }
  return parsed.data;
};

// Composition IDs may only contain a-z, A-Z, 0-9 and "-".
export const compositionId = (id: string, episode: number) =>
  `ep${String(episode).padStart(2, "0")}-${id.replace(/[^a-zA-Z0-9-]/g, "-")}`;

export const resolveSrc = (src: string) =>
  /^https?:\/\//.test(src) ? src : staticFile(src.replace(/^\/+/, ""));

export const isVideoSrc = (src: string) =>
  /\.(mp4|webm|mov|m4v|mkv)(\?.*)?$/i.test(src);
