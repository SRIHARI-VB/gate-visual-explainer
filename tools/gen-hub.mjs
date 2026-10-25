#!/usr/bin/env node
/* Generate the hub index.html from topics.json. Never hand-edit the hub.
   Cards are grouped by subject, in the order the subjects first appear in the
   registry; a subject with no registered lesson is not rendered at all. */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const registryPath = path.join(root, 'topics.json');
const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const byCategory = new Map();
for (const t of reg.topics) {
  const c = t.category || 'other';
  if (!byCategory.has(c)) byCategory.set(c, []);
  byCategory.get(c).push(t);
}

const catLabel = c => c.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
const classNote = {
  A: 'explicitly in the syllabus',
  B: 'prerequisite for a syllabus topic',
  C: 'useful extension beyond the syllabus',
  D: 'outside the exam scope'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card(t) {
  return `      <a class="topic-card" href="${esc(t.path)}">
        <h2>${esc(t.title)}</h2>
        <p>${esc(t.description || '')}</p>
        <div class="meta">
          <span>class ${esc(t.syllabus)} — ${esc(classNote[t.syllabus] || 'unclassified')}</span>
          <span>·</span>
          <span>${esc(catLabel(t.category || 'other'))}</span>
        </div>
      </a>`;
}

const order = reg.category_order || [];
const rank = c => { const i = order.indexOf(c); return i === -1 ? order.length : i; };
const cats = [...byCategory.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

const groups = [];
for (const cat of cats) {
  const list = byCategory.get(cat);
  const sorted = list.slice().sort((a, b) => a.title.localeCompare(b.title));
  groups.push(`  <section class="hub-group" aria-label="${esc(catLabel(cat))}">
    <div class="eyebrow">${esc(catLabel(cat))} · ${sorted.length} lesson${sorted.length === 1 ? '' : 's'}</div>
    <div class="grid grid--2">
${sorted.map(card).join('\n')}
    </div>
  </section>`);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GATE Visual Explainer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/theme.css">
</head>
<body>
<div class="hub">

  <header class="hub-head">
    <div class="eyebrow">GATE CSE · visual lessons</div>
    <h1>GATE Visual Explainer</h1>
    <p>One animated, captioned, tabbed lesson per topic. Every lesson opens with its objective, its syllabus class and its prerequisites; every load-bearing claim carries a label; and every diagram is computed and checked in code before it is drawn.</p>
  </header>

${groups.join('\n\n')}

  <p class="small muted" style="margin-top:22px">
    ${reg.topics.length} topic${reg.topics.length === 1 ? '' : 's'} across ${byCategory.size} subject${byCategory.size === 1 ? '' : 's'} · registry: <code>topics.json</code> · generated hub, do not edit by hand
  </p>

</div>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');
console.log(`OK  hub written: ${reg.topics.length} topic(s) in ${byCategory.size} subject group(s)`);
