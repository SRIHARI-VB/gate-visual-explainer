# GATE Visual Explainer

Animated, captioned, tabbed browser lessons for GATE CSE. One repository, one
lesson per topic, one shared design system.

Open `index.html` in a browser to see the hub. No build step, no server: the
lessons are static files and work from a local clone.

## Topics

| Topic | Syllabus class | Path |
|---|---|---|
| Pointers in C | B — prerequisite for a syllabus topic | `topics/pointers-in-c/index.html` |

`topics.json` is the registry of record. The hub `index.html` is generated from
it by `node tools/gen-hub.mjs` — never hand-edit the hub.

## What every lesson contains

Each lesson is a directory:

```
topics/<slug>/
  index.html        the tabbed lesson; the timeline data and the sketch live here
  timeline.js       the single source of truth for animation, captions, narration
  captions.vtt      WebVTT, generated from timeline.js
  captions.srt      SubRip, generated from timeline.js
  transcript.md     full narration in reading order, generated from timeline.js
```

Run `node tools/gen-captions.mjs` after editing any `timeline.js`; it validates
the timeline (no overlaps, no gaps in scene coverage, no duplicate ids) and
rewrites the three derived files.

Subtitle timings are **estimated** from the timeline at a normal speaking rate.
They were not measured from recorded audio, because no audio file is shipped.
The lesson offers optional browser speech synthesis instead, and says so on the
page.

## The fixed tab set

Every lesson uses the same ten tabs in the same order: Overview, Build-up,
Animation, Examples, Edge cases, Misconceptions, GATE patterns, Practice,
Revision, Sources. No tab requires a long vertical scroll — content is laid out
as a grid of cards, and anything longer is paginated inside its tab.

## Shared assets

- `assets/theme.css` — design tokens and the component vocabulary
  (`.card`, `.claim-chip`, `.formula`, `.step-list`, `.question`, `.legend`,
  and the five card modifiers).
- `assets/lesson-kit.js` — the tab shell, the timeline clock, the caption
  renderer with its five modes, the transport controls, and the in-tab pagers.
- `assets/p5-version.js` — the pinned drawing-library reference and the note on
  why the brush layer is not used.

A design change belongs in `assets/`, not in a topic directory. Do not fork the
CSS to make one lesson look different.

## Claim labels

Every load-bearing claim in a lesson carries one of five labels: VERIFIED FACT,
MATHEMATICAL DERIVATION, EDUCATIONAL INTERPRETATION, COMMUNITY OBSERVATION, or
UNVERIFIED CLAIM. No question is presented as an official previous-year question
unless it was verified against an actual paper; the pointers lesson states
plainly that none of its practice items are PYQs.

## Offline behaviour

p5.js is loaded from a pinned CDN version. If that request fails, the lesson
falls back to the browser's own Canvas2D context and draws the identical frames;
if no canvas is available at all, the caption band and the written tabs still
carry the whole lesson.
