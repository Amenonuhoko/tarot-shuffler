# Tarot Pull

A simple, free web app for pulling tarot and oracle cards. No sign-up, no app store — just open it in a browser and draw a card.

**[Try it now →](https://amenonuhoko.github.io/tarot-shuffler/)**

## What is this?

Tarot Pull is a digital card-shuffler for people who want to do a quick reading without shuffling a physical deck. Tap the screen, get a card, read what it means. It works on your phone, tablet, or computer, and it remembers nothing about you — everything happens right there in your browser.

## What you can do with it

- **Draw a card** — tap anywhere on the screen (or the deck itself) to pull a random card, complete with its meaning.
- **Choose a deck** — pick between:
  - **Tarot of the Divine**, the traditional 78-card tarot deck (Major and Minor Arcana), with a meaning for both upright and reversed draws.
  - **Oracle of the Divine**, a custom 60-card deck with its own artwork and meanings.
- **Shuffle** — reset the deck and start a new reading whenever you like.
- **Flip a card** — toggle a drawn card between upright and reversed to see how the meaning changes (available on decks that support reversed cards).
- **Search for a specific card** — already know which card you want to look up? Type its name and it'll show it to you directly.
- **Check your recent pulls** — the last 10 cards you've drawn are kept in a small history list. Tap any of them to bring that card back up on screen.
- **Install it like an app** — on a phone, you can add Tarot Pull to your home screen and it'll open full-screen and work offline, just like a regular app.

It's also built to look right no matter what you're using — a phone in portrait, a tablet turned sideways, a foldable phone, or a regular desktop browser.

## How to use it

1. Open the [live site](https://amenonuhoko.github.io/tarot-shuffler/).
2. Pick a deck from the dropdown at the top, if you want something other than the default.
3. Tap anywhere on the card to draw one.
4. Read the card's name and meaning. If the deck supports it, you'll see whether it's upright or reversed, and you can tap the little flip icon to reverse it yourself.
5. Tap **Shuffle** to clear the reading and start fresh, or just tap again to draw another card.
6. Tap the menu icon (☰) to see your recent pulls or search for a card by name.

## Supporting the project

If you enjoy using Tarot Pull, there's a small "Support on PayPal" link at the bottom of the app.

## For developers

This is a plain HTML/CSS/JavaScript site with no build step and no dependencies — open `index.html` in a browser, or serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The site is automatically published to GitHub Pages from the `main` branch.
