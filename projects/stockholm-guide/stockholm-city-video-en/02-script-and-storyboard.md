# Stockholm (EN): script and storyboard

## 3. Full script (English, 147 spoken words ≈ 57 s at 155 wpm)
1. **(Hook)** In 1628, a brand-new royal warship sailed out of this harbour. Minutes later, she sank. Three hundred and thirty-three years later, she came back up.
2. **(Location)** This is Stockholm, Sweden's capital, spread across fourteen islands where Lake Mälaren meets the Baltic Sea. Wherever you walk here, the water walks with you.
3. **(Payoff)** Her name is Vasa. Ninety-eight percent of her is original, and today more than a million visitors a year come to meet her.
4. **(Old town)** Across the water lies Gamla stan, the old town, where Stockholm was founded in 1252. Its narrowest alley is just ninety centimetres wide.
5. **(Metro)** Now go underground. More than ninety of the hundred metro stations have art, which is why it's billed as the world's longest art exhibition.
6. **(Tip + CTA)** My tip: walk Monteliusvägen at sunset and watch the old town glow. I'm Raed Shihab. Which Swedish city should I explore next? Tell me below.

Spoken words per scene: 26 · 25 · 23 · 24 · 24 · 25.

## 4. Font system (Alansari library: IDs and names checked against the library file)
| Role | Font | Weight | Size on 1080×1920 |
|---|---|---|---|
| Numbers and counters | **FE-02 Anton** | 400 | 200–240px |
| Hook and strong titles (UPPERCASE) | **FE-60 Unbounded** | 800 | 105–130px |
| Short keyword lines | **FE-41 Outfit** | 800 | 85–100px |
| History and heritage words | **FE-44 Playfair Display** | 900 | 120–170px |
| Nature and summer words | **FE-10 Caveat** | 700 | 130–150px |
| Tip and closing line | **FE-16 DM Serif Display** | 400 | 115–130px |
| Swedish place names | **FE-36 Montserrat** | 800 | 58–66px |
| Swedish sub-line | **FE-07 Barlow Condensed** | 600 | 40–44px |
| Signature RAED SHIHAB | **FE-08 Bebas Neue** | 400 | 110px |

**Why these fonts:** Anton makes a 4-digit year read in under a second. Unbounded is wide and loud enough to own a hook without shouting in red. Playfair Display signals «royal, old, museum», and Caveat adds warmth to water and sunset words. Montserrat, Barlow Condensed and Bebas Neue stay the same as in the Arabic version, so the channel keeps one look in every language. All nine cover å ä ö, so they carry over to the Swedish version.

**Placement:** English keywords in the centre band (y 760–1150). Swedish labels in the top band (y 300–430). Everything inside the safe zone: x 60–1020, y 300–1550. Nothing in the bottom of the frame and no text over a face. Max two fonts on screen at once.

**Colours:** Gold #D4AF37 (numbers) · White · Swedish blue #006AA7 · Swedish yellow #FECC02 · Red #C8102E (the sinking only).

## 5. Scenes
Flow prompts for every scene are in `03-flow-prompts.md`.

### Scene 1 — 00:00–00:10 (Hook)
**Narration:** In 1628, a brand-new royal warship sailed out of this harbour. Minutes later, she sank. Three hundred and thirty-three years later, she came back up.

**Shot:** wide, 17th-century warship leaving a calm harbour · **Camera:** slow push-in · **Light:** overcast late afternoon · **RAED:** no.

**Motion graphics:**
| Time | Text | Font | Colour | Motion (library) |
|---|---|---|---|---|
| 0.0–4.2 | 1628 | FE-02 Anton 400 · 240px | Gold | M-044 Zoom In Text + M-065 Glow Pulse |
| 4.2–6.2 | SHE SANK. | FE-60 Unbounded 800 · 130px | Red #C8102E | M-043 Drop In + M-009 Word Shake |
| 6.2–10.0 | 333 years later | «333» FE-02 Anton 220px + «years later» FE-41 Outfit 800 · 90px | Gold + white | M-040 Number Counter (0→333) |
| 0.0–10.0 | **Regalskeppet Vasa** · 1628 | FE-36 Montserrat 800 · 62px | White | Top centre (y≈320) |

**Sound effects:** timber creak and a wind gust in the sails, then a deep cinematic boom on «sank» and a muffled underwater whoosh. Search: `wooden ship creaking`, `wind gust sails`, `cinematic boom deep`, `underwater whoosh`.

### Scene 2 — 00:10–00:20 (Location on the map)
**Narration:** This is Stockholm, Sweden's capital, spread across fourteen islands where Lake Mälaren meets the Baltic Sea. Wherever you walk here, the water walks with you.

**Shot:** high aerial over the islands · **Camera:** slow forward drone glide · **Light:** golden hour · **RAED:** no.

**Animated map (in the edit):** a simplified map of Sweden. A gold pin drops on **Stockholm**, then the map zooms into the centre: 14 island shapes, **Mälaren** in blue on the left, **Östersjön** on the right. Labels are in Barlow Condensed.

**Motion graphics:**
| Time | Text | Font | Colour | Motion (library) |
|---|---|---|---|---|
| 0.0–3.0 | STOCKHOLM | FE-60 Unbounded 800 · 120px | Gold | M-003 Letter Cascade + M-199 Map Pin Drop (on the map) |
| 3.0–6.5 | 14 islands | «14» FE-02 Anton 230px + «islands» FE-41 Outfit 800 · 95px | Gold + white | M-040 Number Counter (0→14) |
| 6.5–10.0 | lake meets sea | FE-10 Caveat 700 · 145px | White | M-052 Wave Text |
| 0.0–5.0 | **Stockholm** · Sveriges huvudstad | FE-36 Montserrat 800 · 62px | White | Top right |
| 5.0–10.0 | **Mälaren → Östersjön** | FE-07 Barlow Condensed 600 · 44px | White | Next to the map water |

**Sound effects:** soft whoosh on the zoom, a UI pop on the pin, harbour ambience with distant gulls. Search: `soft whoosh`, `ui pop`, `harbour ambience seagulls`.

### Scene 3 — 00:20–00:30 (Payoff: Vasa)
**Narration:** Her name is Vasa. Ninety-eight percent of her is original, and today more than a million visitors a year come to meet her.

**Shot:** interior, a huge dark-wood warship in a dim hall · **Camera:** slow crane up along the hull to the carved stern · **Light:** warm spotlights on dark wood · **RAED:** no.

**Motion graphics:**
| Time | Text | Font | Colour | Motion (library) |
|---|---|---|---|---|
| 0.0–3.0 | Vasa | FE-44 Playfair Display 900 · 170px | Gold | M-054 Spotlight Reveal |
| 3.0–6.5 | 98% original | «98%» FE-02 Anton 230px + «original» FE-41 Outfit 800 · 95px | Gold + white | M-040 Number Counter (0→98) |
| 6.5–10.0 | 1M+ visitors a year | «1M+» FE-02 Anton 200px + FE-41 Outfit 800 · 90px | Gold + white | M-048 Word Stagger |
| 0.0–10.0 | **Vasamuseet** · Djurgården | FE-36 Montserrat 800 · 60px | White | Top left |

**Sound effects:** quiet museum hall, a short riser into «Vasa», a soft low hit. Search: `museum hall ambience`, `cinematic riser short`, `soft impact low`.

### Scene 4 — 00:30–00:40 (Gamla stan)
**Narration:** Across the water lies Gamla stan, the old town, where Stockholm was founded in 1252. Its narrowest alley is just ninety centimetres wide.

**Shot:** low angle in a narrow stepped alley between ochre walls · **Camera:** slow glide up the steps · **Light:** soft morning light falling in from the top · **RAED:** no.

**Motion graphics:**
| Time | Text | Font | Colour | Motion (library) |
|---|---|---|---|---|
| 0.0–3.5 | 1252 | FE-02 Anton 400 · 240px | Gold | M-040 Number Counter (1200→1252) |
| 3.5–6.5 | The Old Town | FE-44 Playfair Display 900 · 140px | White | M-075 Letter Spacing |
| 6.5–10.0 | 90 cm wide | «90 cm» FE-02 Anton 230px + «wide» FE-41 Outfit 800 · 95px | Gold + white | M-063 Box Outline Draw |
| 0.0–5.0 | **Gamla stan** · 1252 | FE-36 Montserrat 800 · 62px | White | Top centre |
| 5.0–10.0 | **Mårten Trotzigs gränd** | FE-36 Montserrat 800 · 58px | White | Top centre |

**Sound effects:** footsteps on cobblestones with a little echo, distant church bells, a small pop on «90 cm». Search: `footsteps cobblestone`, `church bells distant`, `ui pop soft`.

### Scene 5 — 00:40–00:50 (Metro art)
**Narration:** Now go underground. More than ninety of the hundred metro stations have art, which is why it's billed as the world's longest art exhibition.

**Shot:** an empty platform inside a rough rock-cave station with a painted ceiling · **Camera:** slow dolly forward along the platform · **Light:** cool blue station light · **RAED:** no.

**Motion graphics:**
| Time | Text | Font | Colour | Motion (library) |
|---|---|---|---|---|
| 0.0–3.0 | GO UNDERGROUND | FE-60 Unbounded 800 · 110px | White | M-043 Drop In |
| 3.0–6.5 | 90+ of 100 stations | «90+» FE-02 Anton 230px + FE-41 Outfit 800 · 90px | Gold + white | M-040 Number Counter (0→90) |
| 6.5–10.0 | longest art exhibition | FE-44 Playfair Display 900 · 115px | White, «longest» on yellow | M-006 Highlight Sweep (from the left) |
| 0.0–10.0 | **Stockholms tunnelbana** · konst sedan 1957 | FE-36 Montserrat 800 · 60px + FE-07 Barlow Condensed 44px | White | Top right |

**Sound effects:** a train arriving, escalator hum, a reverb whoosh on «underground». Search: `subway train arriving`, `escalator ambience`, `reverb whoosh`.

### Scene 6 — 00:50–01:00 (Tip + CTA)
**Narration:** My tip: walk Monteliusvägen at sunset and watch the old town glow. I'm Raed Shihab. Which Swedish city should I explore next? Tell me below.

**RAED in this scene (B-roll only):** the only scene with RAED. He stands at the railing of Monteliusvägen, seen from the side and slightly behind, looking over the water at Gamla stan in sunset light. He does not talk to the camera and his lips do not move; the voice-over runs on top. Upload his photo in Flow as the reference first. Keep his body in the lower third so the text stays in the centre, away from his face.

**Shot:** medium-wide, RAED in the lower third · **Camera:** slow push-in · **Light:** warm sunset, backlight on the old town · **RAED:** yes.

**Motion graphics:**
| Time | Text | Font | Colour | Motion (library) |
|---|---|---|---|---|
| 0.5–3.5 | Sunset walk | FE-16 DM Serif Display 400 · 125px | Gold | M-044 Zoom In Text + M-065 Glow Pulse |
| 3.5–5.5 | golden hour | FE-10 Caveat 700 · 145px | Yellow #FECC02 | M-049 Elastic Pop |
| 5.5–8.0 | RAED SHIHAB | FE-08 Bebas Neue 400 · 110px | White with a gold shine | M-157 Shine Sweep |
| 8.0–10.0 | Which city next? 👇 | FE-41 Outfit 800 · 90px | White, «next» yellow | M-012 Word Pop |
| 0.0–5.0 | **Monteliusvägen** · Södermalm | FE-36 Montserrat 800 · 60px | White | Top right |

**Sound effects:** evening city ambience, a soft whoosh on the signature, a soft chime on the question. Search: `evening city ambience`, `soft whoosh logo`, `soft chime`.

**Transitions between scenes:** 1→2 `M-125 Whip Zoom` · 2→3 `M-103 Slide Push` · 3→4 `M-019 Zoom Blur` · 4→5 `M-116 Zoom Through` (diving underground) · 5→6 `M-118 Light Leak` (out into the sunset).
