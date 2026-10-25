# Sanctum: prototype

A candidate for Tarot Pull's grand visual relaunch. It's standalone (open `prototype/index.html`), so the live app is untouched until a direction is chosen.

**The idea in one line:** every card you meet becomes a star in your own sky.

## Why this direction

It comes from three research passes on live-service relaunches, immersive web techniques, and what brings people back to ritual apps:

- **Build a place, not controls.** Hearthstone's tavern box, Inscryption's cabin and Bruno Simon's driveable portfolio all turn an interface into a world. Here the sanctum is a place, and each deck is a constellation you visit.
- **Make the arrival an event.** The sky rises and tonight's real moon is named: phase and illumination, computed on the device. It's a short version after the first visit of the day, and it's always skippable.
- **Let real time change the world** (Animal Crossing, Moonly). The moon phase, the next full and new moon, and the hour's sky tint are all computed in the browser, with no location and no server.
- **Make progress visible in the world** (Sky's growing light, Pokémon TCG Pocket's collection, Duolingo's path). The grimoire is the sky itself, not a list:
  - drawing a new card lights its star permanently
  - each portal shows its constellation in miniature, with a progress ring.
- **The reveal as spectacle** (Hearthstone and TCG Pocket rarity tells). The room dims and the card lifts. It glows in its suit's colour, with a stronger tell for a Major. It turns, pausing for a breath edge-on, then bursts, and a spark flies up to light its star. Once you've seen the full ritual, a tap skips it.
- **One-tap draw stays.** Tonight's card waits face-down on the altar in a moonbeam (Discord's 2023 redesign is the cautionary tale here).
- **Gifts, not guilt** (Neko Atsume, Finch). After a day away, a moth leaves a small offering on the altar. "Night N under this sky" only ever counts up, and there are no streaks to lose.
- **Gentle sound.** A generated drone and chimes, off by default.

## What's in it

- **Sky.** three.js r128 (already used by the dice mode). Rendered in a handful of draw calls:
  - a sky dome
  - about 5–7k twinkling stars plus a galaxy band
  - a moon shader that shows the real phase
  - one point cloud for all 216 card-stars, with their constellation lines
- **Performance.** Pixel ratio capped at 1.5, dropping to 1 if the first 2 seconds run slow. The loop pauses when the tab is hidden. Reduced motion skips the flights, sparks and bursts.
- **Three constellations:**
  - *Tarot Wheel*: the Fool at the hub, the Majors in a ring, the four suits as outer arcs.
  - *Oracle Spiral*: a sunflower-seed pattern.
  - *Archetype Gate*: four spiral arms (Selves, Places, Tools, Initiations).
- **Card art.** Each card's art is its own small constellation, generated from its name, so card and star share one figure. Real artwork can replace it later.
- **The Ask Ball portal** opens the main app on the dice.
- **Card data** in `data.js` is a copy of the deck section of `../script.js`.

## Knobs for tweaking

- Mood and palette: `SKY_MOODS` in `sanctum.js`; colours at the top of `sanctum.css`.
- Constellation shapes: `tarotLayout` / `oracleLayout` / `archetypesLayout`.
- Reveal timing: the `beat(...)` values in `revealCard`, plus the `turn` and `tell` keyframes.
- Portal placement: the `--x` / `--y` style on each portal in `index.html`.

## Not in it yet

- The five themes. Each would restyle this same world, e.g. Blood Moon as a real eclipse event, or Terminal as a star chart on a CRT.
- Spreads.
- Journaling.
- Exporting your sky.
- Sharing tonight's card as an image.
- iOS tilt (it needs a permission tap).
