# GATE Visual Explainer

Animated, captioned, tabbed browser lessons for GATE CSE. One repository, one
lesson per topic, one shared design system.

Open `index.html` in a browser to see the hub. No build step, no server: the
lessons are static files and work from a local clone.

## Topics

| Topic | Syllabus class | Path |
|---|---|---|
| Propositional Logic | A — explicitly in the syllabus | `topics/propositional-logic/index.html` |
| First-Order Logic | A — explicitly in the syllabus | `topics/first-order-logic/index.html` |
| Sets and Set Operations | A — explicitly in the syllabus | `topics/sets-and-set-operations/index.html` |
| Pointers in C | B — prerequisite for a syllabus topic | `topics/pointers-in-c/index.html` |

`topics.json` is the registry of record. The hub `index.html` is generated from
it by `node tools/gen-hub.mjs` — never hand-edit the hub. Cards are grouped by
subject, and the group order comes from `category_order` in `topics.json`.

`syllabus-coverage.json` is the plan, not the register: it lists the subjects,
topics and subtopics of the GATE 2027 CS syllabus with a status
(`NOT_STARTED`, `READY`, `IN_PROGRESS`, `PUBLISHED`, `NEEDS_REVIEW`, `BLOCKED`)
and the lesson slug for anything published. Regenerate it with
`python3 tools/gen-coverage.py` after changing a status. `execution-log.json`
records one entry per scheduled run: what was selected, why, and whether the
push landed.

## What every lesson contains

Each lesson is a directory:

```
topics/<slug>/
  index.html        the tabbed lesson; the model, the checks and the sketch live here
  timeline.js       the single source of truth for animation, captions, narration
  captions.vtt      WebVTT, generated from timeline.js
  captions.srt      SubRip, generated from timeline.js
  transcript.md     full narration in reading order, generated from timeline.js
```

Run `node tools/gen-captions.mjs <slug>` after editing any `timeline.js`; it
validates the timeline (no overlaps, no gaps in scene coverage, no duplicate ids,
scenes tiling the duration) and rewrites the three derived files. Without a slug
it regenerates `pointers-in-c`, for backwards compatibility.

Run `node tools/check-lesson.mjs topics/<slug>/index.html` to check a lesson
without a browser: it verifies the ten-tab shell and the controls exist, parses
every script, runs the page's own model in a stub DOM, reports the model checks,
and draws every scene at quarter-second intervals against a recording canvas so
a runtime error in a scene surfaces here rather than in front of a learner.

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
  the five card modifiers, and the hub's `.hub-group` subject headings).
- `assets/lesson-kit.js` — the tab shell, the timeline clock, the caption
  renderer with its five modes, the transport controls, and the in-tab pagers.
- `assets/painters.js` — the drawing vocabulary (`rect`, `line`, `arrow`,
  `circle`, `tri`, `text`, `alpha`) over two backends, p5.js and Canvas2D, so a
  lesson draws the same frames when the CDN is unreachable. New lessons should
  use it; `pointers-in-c` predates it and carries its own copy.
- `assets/p5-version.js` — the pinned drawing-library reference and the note on
  why the brush layer is not used.

A design change belongs in `assets/`, not in a topic directory. Do not fork the
CSS to make one lesson look different.

## Claim labels

Every load-bearing claim in a lesson carries one of five labels: VERIFIED FACT,
MATHEMATICAL DERIVATION, EDUCATIONAL INTERPRETATION, COMMUNITY OBSERVATION, or
UNVERIFIED CLAIM. No question is presented as an official previous-year question
unless it was verified against an actual paper; both lessons state plainly that
none of their practice items are PYQs.

## Offline behaviour

p5.js is loaded from a pinned CDN version. If that request fails, the lesson
falls back to the browser's own Canvas2D context and draws the identical frames;
if no canvas is available at all, the caption band and the written tabs still
carry the whole lesson.
