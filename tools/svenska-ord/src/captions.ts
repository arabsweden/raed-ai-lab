import type { Caption } from "@remotion/captions";

/**
 * Fallback word timing when no Whisper/SRT captions file is provided:
 * spreads the explanation's words across the voiceover window, weighted
 * by word length so long words stay on screen longer.
 */
export const autoCaptions = (
  text: string,
  startMs: number,
  endMs: number,
): Caption[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0 || endMs <= startMs) {
    return [];
  }
  // Punctuation adds a small breath after the word.
  const weights = words.map(
    (w) => w.length + 2 + (/[.،,!؟?:؛]$/.test(w) ? 3 : 0),
  );
  const total = weights.reduce((a, b) => a + b, 0);
  const span = endMs - startMs;

  let cursor = startMs;
  return words.map((word, i) => {
    const duration = (weights[i] / total) * span;
    const caption: Caption = {
      text: i === 0 ? word : ` ${word}`,
      startMs: Math.round(cursor),
      endMs: Math.round(cursor + duration),
      timestampMs: Math.round(cursor + duration / 2),
      confidence: null,
    };
    cursor += duration;
    return caption;
  });
};
