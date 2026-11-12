# Language pack: English (`en`)

## Script
- **words_per_scene:** 22–26 spoken words (≈ 150–160 wpm). Total 140–155 words → 55–60 s.
- Count spoken words: «1628» read as «sixteen twenty-eight» = 3 words.
- Spelling: British (harbour, metres, colour, centre), the standard taught in Sweden.
- Style: short punchy sentences, present tense, second person («you») in tips.
  Avoid filler: «nestled», «hidden gem», «breathtaking», «rich history», «a must-see».
- Hook patterns that work in English reels: the twist («…Minutes later, she sank.»),
  the number shock («90 centimetres. That's the whole street.»), the question
  («Why does this city have…?»). The answer comes by scene 3 at the latest.
- CTA (one only): «Which Swedish city should I explore next? Tell me below.»
  Variant: «Been here? Drop your favourite spot below.»

## Font system (Alansari library IDs; all Google Fonts, all cover å ä ö)
| Role | Font | Weight | Size on 1080×1920 | Case | Why |
|---|---|---|---|---|---|
| Numbers & counters | **FE-02 Anton** | 400 | 200–240px | — | Tall condensed digits; a 4-digit year still fits the width. |
| Hook & strong titles | **FE-60 Unbounded** | 800 | 105–130px | UPPERCASE | Wide, modern, very legible on a phone; owns the first 3 s. |
| Short keyword lines | **FE-41 Outfit** | 800 | 85–100px | Sentence case | Clean geometric sans; reads fast in 1–2 s. |
| History & heritage words | **FE-44 Playfair Display** | 900 | 120–170px | Title Case | High-contrast serif = old, royal, museum. |
| Nature & summer words | **FE-10 Caveat** | 700 | 130–150px | lower case | Hand-written warmth for water, sun, «golden hour». |
| Tip & closing line | **FE-16 DM Serif Display** | 400 | 115–130px | Sentence case | Calm, editorial; signals «personal advice». |
| Swedish place labels | **FE-36 Montserrat** | 800 | 58–66px | As written in Swedish | Same as the Arabic version: brand continuity. |
| Swedish sub-line | **FE-07 Barlow Condensed** | 600 | 40–44px | As written | Narrow, fits long Swedish compounds. |
| Signature RAED SHIHAB | **FE-08 Bebas Neue** | 400 | 110px | UPPERCASE | Same signature in every language. |

Rules:
- Max **2 fonts on screen at the same time** (label + one kinetic font).
- English words are longer than Arabic ones: max ~14 characters per line at 120px+,
  wrap to 2 lines before shrinking below the minimum size.
- Stroke/shadow: 0 4px 24px rgba(0,0,0,.65). No outlines thicker than 4px.
- Remotion: load with `@fontsource/<font>` (Google Fonts host is blocked in the sandbox).

## Colours
| Token | Hex | Use |
|---|---|---|
| Gold | #D4AF37 | numbers, key years, signature shine |
| White | #FFFFFF | default text |
| Swedish blue | #006AA7 | water, map, metro |
| Swedish yellow | #FECC02 | summer, CTA highlight |
| Alarm red | #C8102E | disasters only (fire, sinking, war) |

## Motion presets that suit Latin text (in addition to the Arabic set)
M-003 Letter Cascade (titles) · M-075 Letter Spacing (calm reveal) · M-006 Highlight Sweep
(marker on one word) · M-011 Karaoke Highlight (word-synced captions) · M-040 Number Counter ·
M-044 Zoom In Text · M-048 Word Stagger · M-054 Spotlight Reveal · M-157 Shine Sweep (signature).

## Voice-over: Google AI Studio
aistudio.google.com/generate-speech → model: Gemini TTS → single speaker.
- **Voice:** Charon (informative, male) or Orus (firm). Use RAED's approved English voice if he has one.
  Voice names in the dropdown can change; listen to a 1-line sample first.
- **Style instructions (paste):**
```
Read in clear, natural English with a neutral international accent, like a confident travel-reel narrator. Brisk but relaxed pace of about 155 words per minute. Very short pauses at commas, a short beat at full stops, a slightly longer beat between paragraphs. Do not add or skip any word. Pronounce Swedish place names exactly as a native Stockholm Swedish speaker would.
```
- Numbers spelled out the way they are spoken («sixteen twenty-eight», «ninety-eight percent»).
- Swedish names stay in Swedish spelling inside the English text. Add a respelling note
  in the file; only swap in the respelling if the TTS gets it wrong.
- One paragraph per scene, blank line between them.

## Sound
- Music bed: light cinematic / Nordic travel, −22 to −24 dB under the voice, duck −6 dB on hits.
  Pixabay keywords: `nordic cinematic travel`, `uplifting documentary light`.
- SFX at −14 to −18 dB, always under the voice. Check every Pixabay licence.
- English text hits: `whoosh short`, `typewriter key`, `ui pop`, `riser short`, `cinematic hit low`.

## Post pack
- Title: ≤ 60 characters, 🇸🇪 + a number or a twist.
- Post: hook question → 2–3 verified facts with emoji → the same CTA as the video.
- Hashtags (exactly 4, one per line): `#Sweden` `#SwedenTravel` `#<City>` `#ScandinaviaTravel`
