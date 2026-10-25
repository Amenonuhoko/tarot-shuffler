# Realms: following Mystic's footsteps

Feedback on the painted realms: Major pulls glitch, Blood Moon's effects don't turn with the card, and the paintings are "too everywhere" and not dynamic the way Mystic Violet is. This plan diagnoses each problem, defines what "dynamic like Mystic" means, and sets out the work.

## Diagnosis

Measured on a phone-sized viewport (390×844) with Playwright, forcing a Major pull (The Fool). The test browser renders on the CPU, so the absolute numbers are worse than a real phone, but the ranking between variants holds.

| Blood Moon variant | Tap → turn starts | Frames per second during the pull |
|---|---|---|
| As shipped | 315 ms | 6 |
| WebGL light pass off | 44 ms | 32 |
| Light off and drift off | 34 ms | 35 |
| Mystic Violet, for reference | 69 ms | 53 |

1. **Major pulls stutter because of the WebGL light pass.** It redraws a full-screen shader on every frame and competes with the card's 3D turn, the halo and the omen veil. Everything in the Major sequence starts late, so the content cascade lands about 2 seconds after the face turns up. That gap is the blank face seen in Blood Moon.
2. **The rest of the gap to Mystic is theme CSS that repaints every frame:**
   - Blood Moon: the rim glow animates `box-shadow` and the title flash animates `text-shadow`.
   - Terminal: the scan sweep animates `top`, which also forces layout. The card glitch animates `box-shadow` and the title flicker animates `text-shadow`.
   - Holo: the glint slides a gradient's `background-position`.
   - Deco: the card carries two `drop-shadow` filters.
   - All themes: the description's "more" pulse animates `text-shadow`.

   Mystic was already rebuilt to animate only transform and opacity; these themes weren't.
3. **Blood Moon's effects don't turn with the card.** The briars, the rose light and the arch live on fixed page layers pinned to the card's resting box. The card lifts and turns in 3D, but they stay flat where it was.
4. **"Too everywhere".** Each painting is lit edge to edge at full brightness, so every column, candle and crystal competes with the card and the controls. Mystic is a dark field with the light pooled on the card.
5. **"Not dynamic".** Mystic's background is a choreography centred on the card:
   - a sigil of three wheels turning against each other, always moving
   - an aura under it that breathes, and stars that twinkle
   - a surge through the wheels on every reveal, card or dice
   - on a Major, the room darkens and a halo blooms behind the turning card.

   The realms have a still painting and a light pass that only brightens.

## Target: Mystic's structure, in each tradition's language

Each realm gets the same five parts as Mystic:

| Part | Mystic Violet | Every realm |
|---|---|---|
| Backdrop | dark field, vignette | the painting, dimmed and vignetted with light pooled on the card; it darkens for an omen and lights on a reveal |
| Centrepiece | sigil: rim, zodiac and planet wheels | its own sigil of three counter-turning wheels, pinned to the card (or dice) |
| Breath | the aura breathes, the stars twinkle | aura breath, plus the painting's own light: shafts, sun, beam, glow |
| Reveal | the wheels surge | the wheels surge, the painting's light flares, plus one tradition-specific beat |
| Major omen | veil plus star-chart halo | veil plus the realm's own halo |

### The four sigils

Each sigil has a rim, a middle wheel and a hub, turning at 360 s, 240 s (reversed) and 120 s like Mystic's. All are generated SVG with exact geometry.

- **Seven Rays (Holo):**
  - Rim: a spectral ring of seven arcs in the ray colours, numbered I–VII and named.
  - Middle: Metatron's cube in spectral line.
  - Hub: a {7/3} heptagram.
  - On reveal: the aura takes the card's ray colour and that ray's arc lights.
- **Digital Geomancy (Terminal):**
  - Rim: the 16 geomantic figures with their Latin names. It ticks round in steps, like a clock.
  - Middle: a ring of all 64 hexagrams as six concentric bit-rings.
  - Hub: a reticle with a radar sweep.
  - On reveal: a ping ring expands from the card.
- **Crimson Cathedral (Blood Moon):**
  - Rim: gothic tracery, a ring of cusped foils and roundels in stone.
  - Middle: twelve lancet petals of jewel glass.
  - Hub: a crown of thorns round the eclipsed moon. This replaces the loose briars.
  - On reveal: light through the glass, cast inside the card face so it turns with it.
- **Temple of Ra (Deco):**
  - Rim: a stepped deco sunburst with the 36 decan stars of Egyptian astronomy.
  - Middle: a band of twelve cartouches (ankh, djed, was, eye, scarab, sun and so on).
  - Hub: a sixteen-petal lotus rosette.
  - On reveal: the sun's rays flare.

### Major omens

The shared veil darkens the room, and the painting's light dims with it. Each realm replaces Mystic's star-chart halo with its own:

- Blood Moon: a thorn corona with red rays.
- Deco: a sunburst rising behind the card.
- Holo: a spectral prism ring.
- Terminal: concentric reticle rings with a target lock.

### Shuffle

The sigil stirs, with a short extra turn of the wheels while the deck riffles. Mystic doesn't do this yet; it's cheap and makes every realm answer every action.

## Performance rules (non-negotiable)

- No WebGL. The painting's light is rebuilt as compositor layers: gradient shafts, glows and fans whose transform and opacity animate. They are positioned on the painting through the same cover mapping, so they stay on the rose window, sun, prism and attractor however the screen crops.
- Every moving part animates only transform or opacity, and no group with opacity wraps moving layers (Mystic's rule).
- Port Mystic's compositor-only fixes to the theme card animations: rim, title flash, scan sweep, card glitch, title flicker, glint, deco filters and the description pulse.
- Acceptance: with the same test, each realm matches Mystic within about 10% on tap-to-turn lag and frames per second during a Major pull.

## Cleanup

- Remove the front realm layer (briars, rose cast, arch) and the WebGL engine.
- The card-back emblems, holo caption, geomancy cast and equations stay.

## Verification

- A Major and a minor pull in every theme: event timeline, frame strips and the cost test against Mystic.
- Phone and desktop screenshots, idle and mid-reveal.
- Reduced motion: still frames, no surges.
- Dice mode: the sigil pins to the dice and surges on a settled roll.
- Mystic Violet unchanged.

## Status

All of the above is built.

| Major pull | Tap → turn starts | Frames per second |
|---|---|---|
| Mystic Violet | 31 ms | 55–60 |
| Holo | 41–68 ms | 57–59 |
| Terminal | 41–57 ms | 56–58 |
| Blood Moon | 35–38 ms | 60 |
| Deco | 42–65 ms | 60 |

No frame took longer than 133 ms in any theme. Two more costs turned up and were fixed along the way:

- Blood Moon's light shafts and Holo's beam were clip-path-masked animating layers. They are now static SVG; only two layers' opacity animates.
- Holo's controls used `backdrop-filter: blur()`, which re-renders every frame while the realm moves behind it. They now use smoked glass instead.
