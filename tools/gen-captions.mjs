#!/usr/bin/env node
/* Derive captions.vtt, captions.srt and transcript.md from topics/<slug>/timeline.js.
   The timeline is the only source of truth; these files are generated, never edited.

   Usage: node tools/gen-captions.mjs [slug]     (default slug: pointers-in-c) */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SLUG = process.argv[2] || 'pointers-in-c';
const root = path.resolve(process.cwd());
const dir = path.join(root, 'topics', SLUG);

if (!fs.existsSync(path.join(dir, 'timeline.js'))) {
  console.error(`No timeline at topics/${SLUG}/timeline.js`);
  process.exit(1);
}

function loadTimeline(file) {
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  return sandbox.window.LESSON_TIMELINE;
}

const tl = loadTimeline(path.join(dir, 'timeline.js'));

/* the lesson title, derived from the slug */
function slugTitle(s) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/* prefer the registered title, so regenerating never rewrites a lesson's name */
const registry = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'topics.json'), 'utf8')); }
  catch { return { topics: [] }; }
})();
const registered = (registry.topics || []).find(t => t.slug === SLUG);
const title = (registered && registered.title) || slugTitle(SLUG);

/* ---------- validation of the timeline itself ---------- */
const problems = [];
let prevEnd = -1;
const ids = new Set();
for (const ev of tl.events) {
  if (ids.has(ev.id)) problems.push(`duplicate event id: ${ev.id}`);
  ids.add(ev.id);
  if (!(ev.end > ev.start)) problems.push(`non-positive duration: ${ev.id}`);
  if (ev.start < prevEnd - 1e-6) problems.push(`overlap or out-of-order: ${ev.id}`);
  if (!ev.caption || !ev.narration) problems.push(`missing caption or narration: ${ev.id}`);
  if (!tl.scenes.some(s => s.id === ev.scene)) problems.push(`unknown scene: ${ev.id} -> ${ev.scene}`);
  prevEnd = ev.end;
}
if (tl.events.length && tl.events[tl.events.length - 1].end > tl.duration + 1e-6) {
  problems.push('last event ends after the stated duration');
}
for (const s of tl.scenes) {
  const covered = tl.events.some(e => e.scene === s.id);
  if (!covered) problems.push(`scene has no captions: ${s.id}`);
  if (!(s.end > s.start)) problems.push(`scene has non-positive span: ${s.id}`);
  if (!(s.end <= tl.duration + 1e-6)) problems.push(`scene ends after the duration: ${s.id}`);
}
/* scene boundaries must tile the timeline without gaps */
const ordered = tl.scenes.slice().sort((a, b) => a.start - b.start);
for (let i = 1; i < ordered.length; i++) {
  if (Math.abs(ordered[i].start - ordered[i - 1].end) > 1e-6) {
    problems.push(`gap or overlap between scenes ${ordered[i - 1].id} and ${ordered[i].id}`);
  }
}
if (ordered.length && Math.abs(ordered[0].start) > 1e-6) problems.push('first scene does not start at 0');

if (problems.length) {
  console.error('Timeline validation failed:\n  ' + problems.join('\n  '));
  process.exit(1);
}

/* ---------- time formatting ---------- */
const pad = (n, w = 2) => String(n).padStart(w, '0');

function vttTime(t) {
  const ms = Math.round(t * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const r = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(r, 3)}`;
}

function srtTime(t) {
  return vttTime(t).replace('.', ',');
}

const mmss = t => `${Math.floor(t / 60)}:${pad(Math.floor(t % 60))}`;

/* ---------- WebVTT ---------- */
let vtt = 'WEBVTT\n';
vtt += `TITLE ${title} — GATE Visual Explainer\n`;
vtt += `NOTE Timings are estimated from the lesson timeline (speaking-rate based), not measured from recorded audio.\n\n`;
tl.events.forEach((ev, i) => {
  vtt += `${i + 1}\n`;
  vtt += `${vttTime(ev.start)} --> ${vttTime(ev.end)}\n`;
  vtt += `${ev.caption}\n\n`;
});
fs.writeFileSync(path.join(dir, 'captions.vtt'), vtt, 'utf8');

/* ---------- SubRip ---------- */
let srt = '';
tl.events.forEach((ev, i) => {
  srt += `${i + 1}\n`;
  srt += `${srtTime(ev.start)} --> ${srtTime(ev.end)}\n`;
  srt += `${ev.caption}\n\n`;
});
fs.writeFileSync(path.join(dir, 'captions.srt'), srt, 'utf8');

/* ---------- transcript ---------- */
let md = `# ${title} — transcript\n\n`;
md += `Full narration and caption text in reading order, with scene headings. This is the\n`;
md += `accessibility fallback and the printable study document for the lesson.\n\n`;
md += `- Lesson: \`topics/${SLUG}/index.html\`\n`;
md += `- Total duration: ${mmss(tl.duration)} (${tl.duration} seconds), ${tl.scenes.length} scenes, ${tl.events.length} caption segments\n`;
md += `- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.\n`;
md += `- Subtitle files derived from the same timeline: \`captions.vtt\`, \`captions.srt\`\n\n`;
md += `---\n\n`;

for (const sc of tl.scenes) {
  md += `## Scene ${sc.n}. ${sc.title}\n\n`;
  md += `*${mmss(sc.start)} – ${mmss(sc.end)} · objective: ${sc.objective}*\n\n`;
  for (const ev of tl.events.filter(e => e.scene === sc.id)) {
    md += `**${mmss(ev.start)}–${mmss(ev.end)}** — ${ev.narration}\n\n`;
    md += `> Caption: ${ev.caption}\n\n`;
    if (ev.trap) md += `Exam-trap caption mode adds: *${ev.trap}*\n\n`;
  }
}

md += `---\n\n`;
md += `Captions are on by default in the lesson and can be switched to Detailed, Keyword,\n`;
md += `Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers\n`;
md += `optional browser speech synthesis, whose voice availability differs by platform.\n`;

fs.writeFileSync(path.join(dir, 'transcript.md'), md, 'utf8');

console.log(`OK  ${SLUG}: ${tl.events.length} cues, ${tl.scenes.length} scenes, ${tl.duration}s`);
console.log(`    captions.vtt, captions.srt, transcript.md written to topics/${SLUG}/`);
