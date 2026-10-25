# Visual upgrade research

Six research passes, run against the app as of this branch: one per theme plus one on the cross-theme system and the dice. Each pass read the code, screenshotted the app at phone and desktop sizes, and looked at reference work. The findings are below, ranked within each section by impact against effort. Contrast ratios and line numbers come from those passes; recheck them before acting, since `style.css` moves.

Shared constraints for everything here: no build step, motion on `transform`/`opacity` only, `prefers-reduced-motion` respected, and external scripts pinned and served only from jsdelivr, cdnjs or unpkg.

## Across all themes

1. **Theme chrome on first paint.** `theme-color` (meta and manifest) is `#14101f` for every theme, and the stored theme is applied at the end of `script.js`, so Mystic flashes first. Add a 3-line inline `<head>` script that sets `data-theme` and the theme-color from a `--chrome` token. Add `color-scheme: dark` to `:root` too: it's missing, so native select popups and scrollbars render light.
2. **Finish the token set.** All five themes share the same 21 tokens, but about 86 color literals in shared selectors leak Mystic colors into other themes:
   - The `[data-element]` art tints turn the Holo art window beige and the Blood Moon and Deco ones slate blue.
   - `.sigil-aura` is hard-coded purple.
   - Hover states are hard-coded white.

   Add role tokens (`--accent`, `--accent-2`, `--art-bg`, `--el-*`, `--hover`, `--focus-ring`, `--chrome`). Keep `--gold` and `--lavender` as aliases while migrating, because their names no longer match their colors: in Blood Moon, `--gold` is silver and `--lavender` is red.
3. **One motion language.** There are 52 different durations and 6 easings. Add `--dur-1/2/3` and `--ease-out` tokens. Cross-fade theme switches with `document.startViewTransition` (today they're a hard cut). Replace the hand-kept list of about 30 reduced-motion selectors with one global rule.
4. **Responsive stage.** The card is capped at 300px, which is about 254px on an 820px tablet and looks small on desktop. Size the card, sigil and dice with `--stage-w: clamp(260px, min(80vw, 50dvh), 460px)`, and add a portrait-tablet step and a foldable (`horizontal-viewport-segments: 2`) rule. In Terminal, the deck select truncates ("Tarot of the Divin").
5. **Per-theme font loading.** One request pulls 8 families, and Grenze Gotisch is never used. Load Inter plus the active theme's faces.

## Mystic Violet (default)

1. **Reversed card face.** `.card-front-content.is-reversed { filter: invert(1) }` turns the violet art window into a cream slab. In Mystic only, drop the invert and mark reversal with a moon-silver palette (`--gold: #c9cbe0`). Removing the filter is also faster inside the 3D card.
2. **Accent.** `--lavender` is sky blue (`#6fb8e8`) and clashes with the gold. Use `#b8a6e0` (8.5:1).
3. **Card back.** The back is a flat slab with a small motif, and people see it more often than any front. Reuse the `.mystic-frame` gilt frame, add a static engraved dot field, and show `.foil-glare` while tilting.
4. **Control typography.** The labels, Shuffle button and theme-menu title are in Inter. Move them to Cinzel and the hint to Cormorant italic (both already load). Keep Inter for descriptions.
5. **One gilt sweep on reveal.** Run a single transform-only light sweep across the name plate when a card lands.

## Holographic Foil

1. **Make the foil follow the pointer.** `applyTilt()` should also write `--px`, `--py` and `--hyp`, and the holo layers shift their background from them, as in simeydotme's pokemon-cards-css. Today the foil is a timed animation and the glare sits at 7–8% alpha.
2. **A real holo stack.** The 0.42-alpha pastel wash reads grey or olive. Replace it with a darker base, a `repeating-linear-gradient` rainbow on `mix-blend-mode: color-dodge`, and an `overlay` glare at the pointer. Use at most two blend layers on phones.
3. **The background.** `holo-bg-drift` animates `background-position`, repainting the whole screen every frame, and it swings the page from grey haze to near-black every 13 seconds. Move the blobs to a fixed pseudo-element, animate `transform`, and keep them on screen.
4. **Glint bug.** JS adds `.glinting` to both faces, but CSS styles only `.card-front::after`, so the idle card back never glints. Use `.card-face.glinting::after`, glint on landing, and pause the timer while the page is hidden.
5. **Optional gyro tilt** behind a "Tilt to shimmer" toggle. On iOS, permission must be requested from a click.

## Glitch Terminal

1. **Phosphor art.** Card art renders in full color inside the green CRT. Map it to green with an SVG `feColorMatrix` and add a scanline overlay. Very low effort.
2. **Decode reveal.** Replace the always-on title flicker:
   - Scramble, then lock the title letters left to right over about 500ms.
   - Add one 240ms `clip-path` glitch burst on reveal. It moves the text rather than flashing it, which stays within WCAG 2.3.1.
   - Keep the real text for screen readers.
3. **Compositor-only CRT effects.**
   - Body scanlines repaint the viewport every frame.
   - The sweep animates `top`, which triggers layout.
   - The rain redraws about 3,500 glyphs per frame behind a CSS blur.

   Use a static fixed overlay, animate the sweep with `translateY`, and throttle the rain to about 20fps with a sprite.
4. **Terminal card back and boot log.** A `╔═╗` frame around `TAROT.EXE`, and typed lines while drawing (`> seek arcana[78]… OK`).
5. **Fix the color mismatches.** The `terminal-flicker` keyframes hard-code `#ff4d8d` while the title uses `#ff3b30`. Add `--glitch-r` and `--glitch-c` tokens.

## Blood Moon

1. **Paint the moon.** There's only a red glow now. One static `body::before` gives a copper-to-garnet eclipsed disc plus an edge vignette. It paints once, so it costs nothing per frame.
2. **Compositor-only motion.** `bloodmoon-rim` animates `box-shadow` forever, and the title glint animates `background-position` forever. Move the glow to a pseudo-element that animates `opacity`, and glint once on reveal.
3. **Red contrast.** `#a3102c` is 2.57:1 on the background. Keep it for glows, and add `--blood-ink: #e0314f` (4.54:1) for red text and focus rings.
4. **Card back and art window.** Make the back's center an eclipse seal. Recolor the mustard Major and blue-grey Swords art windows with a `mix-blend-mode: color` oxblood overlay.
5. **Candlelight and embers.** An irregular `opacity` flicker under a face-up card, and at most 20 ember sprites on a canvas like `terminalRain`. Skip both under reduced motion.

Also: Cinzel Decorative's "II" reads as "11". Use plain Cinzel for numerals (the die already does).

## Art Deco Luxe

1. **Gold edges on the cut corners.** The octagon `clip-path` cuts through the gold border, leaving gaps at every chamfer on the card, buttons, select and history panel. Fix: a gold background plus an inset pseudo-element with a slightly smaller octagon. Drop the `filter: drop-shadow`s too, since they repaint on every flip.
2. **A deco card back.** It's currently the Mystic motif in brown. Draw a gold sunburst fan, chevron bands and a stepped arch as one static SVG.
3. **Deco typography.** Limelight for numerals, Josefin Sans 600 uppercase for the title and UI (buttons are still Inter), and Poiret One only at 28px and up. Also square off the rounded theme menu.
4. **A static half-sunburst background.** The spinning 150vmax layer is about 58MB of GPU texture on a high-density phone.
5. **Brushed-brass tokens.** Add `--gilt` and `--brush` gradients. Run the title shimmer once per reveal, not forever, and fix the off-theme blue REVERSED button.

## The dice in each theme

Already in this branch: each theme sets the die's body, numeral color and font, edge color, emissive, roughness, metalness and light colors through `--die-*` in `dice.css`. Changing theme re-inks the die in place, after waiting for the numeral font to load. The starting values:

| Theme | Body | Numerals | Edges | Rim light |
|---|---|---|---|---|
| Mystic | `#1b1236` night enamel | `#d8b76a` Cinzel | `#82702f` | `#7a54e0` violet |
| Holo | `#1a1530` | `#f5f2ff` Space Grotesk | `#8f86b8` | `#ff9ad5` pink |
| Terminal | `#000d07` matte | `#22ff7f` Space Mono | `#22ff7f` | `#22ff7f` |
| Blood Moon | `#3a0410` garnet | `#e9e4e1` Cinzel | `#8a8d94` silver | `#ff2a3c` red |
| Deco | `#0d0b07` black enamel | `#e8c368` Cinzel | `#e8c368` gold | `#9db8ff` cool |

Next steps:

1. **sRGB output.** The renderer outputs linear color, so CSS gold renders as saturated yellow. Set `renderer.outputEncoding = THREE.sRGBEncoding` and the same on the atlas texture, then raise light intensities about 1.3×.
2. **A small environment map.** Generate a tiny gradient image once per theme and run it through `PMREMGenerator`, or use `RoomEnvironment` from r128 `examples/js`. Without an environment, metals render dull or black. This would allow:
   - a pearl Holo die (`#cfc8ea`, metalness .65) with fake iridescence from rainbow bands in the map
   - real gold inlay on the Deco die.
3. **Numeral glow.** Use a numeral-only atlas as `emissiveMap`, and always bind one (black when a theme has no glow) so a theme switch never recompiles shaders. Bloom passes are too costly for phones.
4. **Wireframe Terminal die.** Flat dark faces with `polygonOffset`, phosphor edges, and an additive second edge pass for glow (WebGL ignores `linewidth`).
5. **Mobile tiers.** Reuse the existing `hardwareConcurrency` cap:
   - **≤4 cores:** standard material, a tiny environment map, pixel ratio 1.
   - **More than 6 cores:** clearcoat for Deco and Holo only.
   - **Never:** transmission, shadow maps or post-processing. The app already dropped clearcoat and MSAA once because of lag.

## References

- [simeydotme/pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css): pointer-driven holo layers.
- [web.dev animations guide](https://web.dev/articles/animations-guide): compositor-only motion.
- [W3C Understanding SC 2.3.1 (three flashes)](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- [A List Apart: Finessing feColorMatrix](https://alistapart.com/article/finessing-fecolormatrix)
- [dice-box themes](https://fantasticdice.games/docs/themes) and [Dice So Nice](https://foundryvtt-hub.com/package/dice-so-nice): per-theme dice color sets on standard materials.
- [three.js MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial): why transmission and clearcoat are avoided on mobile.
