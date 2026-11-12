---
name: sweden-city-video
description: "RAED's ~60-second vertical city video for any Swedish city, in English (or Swedish via a language pack): verified 6-scene script, Google Flow prompts, font system, Alansari motion IDs, sound effects, AI Studio voice-over, source table and a post pack. Use when RAED asks for a Sweden City Video, a city reel or «مونتاج مدينة» in English or Swedish, e.g. «Sweden City Video: Stockholm EN»."
---

# Sweden City Video (multilingual)

The English twin of RAED's Arabic city video (reference build: Söderhamn, Nov 2026).
The pipeline is the same in every language. What changes per language lives in a
**language pack**: `lang/en.md` today, `lang/sv.md` later.

Reply to RAED in Arabic. Everything inside the deliverable is in the target language,
except the Flow prompts (always English) and the Swedish place labels (always Swedish).

## Series workflow
For the series «Discover Sweden by Raed» (trigger: «Discover Sweden: <city>»), follow
`projects/discover-sweden/WORKFLOW.md` end to end: research → script → Flow prompts + voice text →
generation (with RAED's approval) → edit with `tools/city-video-studio/` → RAED review →
post pack → Metricool post for review → tracking. Never publish or spend credits without RAED's OK.

## 0. Inputs
- City name (Swedish spelling, e.g. Göteborg, not Gothenburg, for labels).
- Language pack: `en` (default for this skill) or `sv`.
- Optional: a hook idea, a script draft, real footage.
Ask only if the city is missing.

## 1. Research and verify (before writing a single line)
- Find 6–8 facts. Use official sources first: kommun, Visit <city>, Visit Sweden,
  the museum's own site, Svenska kyrkan, Länsstyrelsen, Riksantikvarieämbetet, SL/SJ.
  Wikipedia is backup only.
- Every number in the voice-over needs a source + check date.
- Drop what you cannot verify. Never invent restaurants, visitor numbers or records.
- Superlatives («world's longest», «most visited») must be attributed or dropped.
  If only the venue itself claims it, say «called» / «billed as», or use a hard number instead.
- Log corrections against earlier drafts (old claim → new claim → why).

## 2. Structure: 6 scenes × ~10 s ≈ 58 s, 9:16
| # | Role | Rule |
|---|---|---|
| 1 | Hook | The strangest verified fact. A question or a twist in the first 3 s. No city intro yet. |
| 2 | Location | City name + region/water + one orientation fact. Animated map in the edit. |
| 3 | History / landmark | Founding year, a landmark, or the payoff of the hook. |
| 4 | History / landmark 2 | A second fact with a strong number (year, size, width). |
| 5 | Nature / local life | Archipelago, lake, metro, food (named places only if verified). |
| 6 | Tip + CTA | One practical tip + RAED's name + ONE call to action. RAED appears here. |

Word budget per scene comes from the language pack (`words_per_scene`).
Hook in the first 3 s. One CTA only, at the end.

## 3. Deliverable format (one file, or the 4 RAED7 episode files)
Use these sections, in this order, with the labels from the language pack:
1. **Header**: city · 9:16 · duration · hook type · where RAED appears · map scene · best posting season · on-screen text rule.
2. **Summary** (3–4 lines).
3. **Full script**: 6 numbered lines, the exact words the voice reads.
4. **Font system**: the pack's table (role → font ID + name → weight → size on 1080×1920) + placement rules.
5. **Scenes**: per scene:
   - Narration
   - Flow prompt (English, ends with the no-text clause)
   - Motion graphics table: time | on-screen text | font | colour | motion (library ID + name)
   - Swedish label row: **Place name** · subtitle (FE-36 Montserrat 800)
   - Shot · camera move (one) · light · SFX with search keywords
   - Scene 6 also: identity-locked prompt with RAED's photo + a back-view fallback
   - Transitions list between scenes (library IDs)
6. **Voice-over** for Google AI Studio: voice, style instructions, paste-ready text (numbers spelled out), pronunciation notes for Swedish names.
7. **SFX + music list** (Pixabay keywords).
8. **Verification table**: claim | status ✅/⚠️/❌ | source link · check date. Then «Corrections».
9. **Post pack**: title, short post, exactly 4 hashtags one per line.

## 4. Visual rules (all languages)
- 1080×1920, 30 fps. Safe zone x 60–1020, y 300–1550 (Alansari library).
- Swedish place labels: top band, y 300–430, FE-36 Montserrat 800, white, away from faces.
- Kinetic text: centre band, y 760–1150, synced to the voice. Keywords only (2–4 words),
  never the full sentence. Numbers in gold.
- Nothing in the bottom 370 px (platform UI). No text over a face.
- Flow prompts never contain the channel name; RAED SHIHAB is added in the edit.
- Add a small «AI-generated visuals» note in the edit when clips are generated.
- Motions and fonts use IDs from the Alansari Motion Library (M-xxx, FE-xx, FA-xx).
  Grep the library for the exact ID before using it; never guess a name.

## 5. Identity lock (scenes with RAED)
Upload RAED's reference photo in Flow (Ingredients) before generating.
Prompt block to paste:
> Use the uploaded reference photo as the identity anchor: keep the exact face, age, skin tone, hair, body proportions, eye shape, nose, mouth and jawline unchanged. No beautifying, no de-ageing, no slimming, no style change. Change only clothing, pose, lighting and background.
RAED is B-roll: not speaking, not looking into the lens, mouth closed, framed in the lower third
so the kinetic text stays above him. Always give a back-view fallback prompt.

## 6. Flow settings (cheapest test first)
https://labs.google/fx/tools/flow → New project → Video → Ingredients → 9:16 → Omni 1.1 Flash, 360p, 10 s, ×1.
Credit costs change; check the balance and the price on screen and get RAED's OK before generating.
Every prompt ends with: «No on-screen text, no captions, no letters, no signs, no logos.
Natural ambient sound only, no dialogue, no music.»

## 7. After the package
- «Package ready» does not mean clips, voice or video exist. Update
  `tracking/production-status.md` only with evidence.
- If RAED asks for the edit, continue with `sweden-cities-montage-1` (Remotion), swapping
  the Arabic caption font for the pack's caption font and setting `direction: "ltr"`.

## 8. Adding a new language
Copy `lang/en.md` to `lang/<code>.md` and fill every field: words per scene, voice and style
prompt, caption font (must cover the language's letters), number style, CTA wording,
post-pack hashtags, British/US spelling or local orthography. The SKILL file does not change.
