# Pending publication: the conditional-expectation lesson

Run 2026-10-30, 06:00 IST. **Status: built and validated, NOT published.**

This file is temporary. Delete it once the lesson is published.

## Why it is not published

This integration cannot write through git: `git push` over HTTPS is refused with
`HTTP 403`, and the Git Data API refuses blob creation with
`403 Resource not accessible by integration`. The connector's multi-file commit does
work, but the publication payload is about 1.05 MB across ten files — the six lesson
files (168 KB), `topics.json` (243 KB), the regenerated hub `index.html` (100 KB),
`syllabus-coverage.json` (285 KB) and `tools/gen-coverage.py` (252 KB) — which is more
than one scheduled run can pass through a tool argument.

Nothing was pushed, so no file here claims the topic is published.

## What is ready

A bundle was delivered with the run containing:

- `lesson/` — the six files for `topics/conditional-expectation-and-total-expectation/`
  (`index.html`, `lesson.js`, `timeline.js`, `captions.vtt`, `captions.srt`,
  `transcript.md`). Captions were generated from the timeline by
  `tools/gen-captions.mjs`, so they agree with it.
- `pending/topics-entry.json` — the entry to append to the `topics` array.
- `pending/coverage-entry.json` — the entry for `syllabus-coverage.json`, with status
  `IN_PROGRESS`.
- `pending/gen-coverage-block.py.txt` — the block to insert into
  `tools/gen-coverage.py` immediately before `_VERIFIED = {`. The generator was also
  missing the earlier `linearity-of-expectation` entry; this block restores both.
- `pending/validation.txt` — the checker and geometry-audit output.

## Remaining steps

1. Copy `lesson/` to `topics/conditional-expectation-and-total-expectation/`.
2. Append `pending/topics-entry.json` to the `topics` array in `topics.json`.
3. Insert `pending/gen-coverage-block.py.txt` into `tools/gen-coverage.py`, then run
   `python3 tools/gen-coverage.py`.
4. Run `node tools/gen-hub.mjs` so the card appears under Engineering Mathematics.
5. Run `node tools/check-lesson.mjs` and `node tools/audit-geometry.mjs` on the lesson;
   expect `PASS` and `clean`.
6. Commit the six lesson files, `topics.json`, `index.html`, `syllabus-coverage.json`,
   `tools/gen-coverage.py` and the execution-log entry together, and push.
7. Delete this file.

Do not mark the topic PUBLISHED anywhere until the push lands.
