#!/usr/bin/env node
/* Headless check of a lesson page.
   - syntax-checks every inline script and every local <script src>
   - runs the page's own model in a stub DOM and reports the model checks
   - draws every scene at 0.25s intervals against a recording fake canvas,
     so a runtime error inside a scene function surfaces here, not in class.

   Usage: node tools/check-lesson.mjs topics/<slug>/index.html
*/

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node tools/check-lesson.mjs topics/<slug>/index.html');
  process.exit(1);
}
const file = path.resolve(target);
const dir = path.dirname(file);
const html = fs.readFileSync(file, 'utf8');

let failures = 0;
const fail = (msg) => { failures++; console.log('  FAIL  ' + msg); };
const ok = (msg) => console.log('  ok    ' + msg);

/* ---------- 1. structure ---------- */
const TABS = ['overview', 'buildup', 'animation', 'examples', 'edges',
              'misconceptions', 'gate', 'practice', 'revision', 'sources'];

const tabButtons = [...html.matchAll(/data-tab="([^"]+)"/g)].map(m => m[1]);
if (tabButtons.join(',') === TABS.join(',')) ok('ten tabs, fixed order');
else fail('tab set is ' + tabButtons.join(','));

for (const t of TABS) {
  if (!html.includes(`id="panel-${t}"`)) fail('missing panel ' + t);
}
if (failures === 0) ok('all ten panels present');

for (const f of ['captions.vtt', 'captions.srt', 'transcript.md']) {
  if (fs.existsSync(path.join(dir, f))) ok('ships ' + f);
  else fail('missing ' + f);
}

/* every control the checklist names must exist in the markup */
const CONTROLS = ['btn-play', 'btn-pause', 'btn-restart', 'btn-prev', 'btn-next',
                  'scrub', 'speed', 'cap-toggle', 'cap-mode'];
for (const id of CONTROLS) {
  if (!html.includes(`id="${id}"`)) fail('missing control #' + id);
}
if (!CONTROLS.some(id => !html.includes(`id="${id}"`))) ok('play/pause/restart/scene/scrub/speed/caption controls present');

/* ---------- 2. syntax of every script ---------- */
const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const srcScripts = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);

for (const [i, code] of inlineScripts.entries()) {
  try { new vm.Script(code, { filename: `inline-${i}.js` }); }
  catch (e) { fail(`inline script ${i} syntax: ${e.message}`); }
}
ok(`${inlineScripts.length} inline script(s) parse`);

const localSrcs = srcScripts.filter(s => !/^https?:/.test(s));
const loaded = [];
for (const s of localSrcs) {
  const p = path.resolve(dir, s);
  if (!fs.existsSync(p)) { fail('script not found: ' + s); continue; }
  const code = fs.readFileSync(p, 'utf8');
  try { new vm.Script(code, { filename: p }); loaded.push([s, code]); }
  catch (e) { fail(`script ${s} syntax: ${e.message}`); }
}
ok(`${loaded.length} local script(s) parse`);

/* ---------- 3. run the page against a stub DOM ---------- */
function fakeEl(id) {
  return {
    id, innerHTML: '', textContent: '', value: '0', min: '0', max: '0', step: '1',
    hidden: false, disabled: false, style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {},
    appendChild() {}, setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelectorAll() { return []; }, querySelector() { return null; },
    getContext() { return null; }, focus() {}
  };
}

const els = new Map();
const getEl = (id) => {
  if (!els.has(id)) els.set(id, fakeEl(id));
  return els.get(id);
};

const ctxCalls = [];
function fakeCtx() {
  const rec = (name) => (...a) => { ctxCalls.push(name); };
  return {
    save: rec('save'), restore: rec('restore'), beginPath: rec('beginPath'),
    closePath: rec('closePath'), moveTo: rec('moveTo'), lineTo: rec('lineTo'),
    arc: rec('arc'), arcTo: rec('arcTo'), rect: rec('rect'),
    fill: rec('fill'), stroke: rec('stroke'), clearRect: rec('clearRect'),
    fillText: rec('fillText'), setLineDash: rec('setLineDash'),
    measureText: () => ({ width: 10 }),
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '',
    textAlign: 'left', textBaseline: 'top'
  };
}

let drew = 0;
const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  speechSynthesis: { speak() {}, cancel() {}, getVoices: () => [] },
  SpeechSynthesisUtterance: function () {},
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  location: { hash: '', href: '', search: '' },
  navigator: { userAgent: 'node', language: 'en' },
  devicePixelRatio: 1
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.addEventListener = () => {};
sandbox.removeEventListener = () => {};
sandbox.dispatchEvent = () => true;
sandbox.document = {
  readyState: 'complete',
  documentElement: fakeEl('html'),
  fonts: { ready: Promise.resolve() },
  getElementById: getEl,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  createElement: (tag) => {
    const el = fakeEl(tag);
    if (tag === 'canvas') el.getContext = () => fakeCtx();
    return el;
  },
  body: fakeEl('body')
};

vm.createContext(sandbox);

for (const [s, code] of loaded) {
  try { vm.runInContext(code, sandbox, { filename: s }); }
  catch (e) { fail(`running ${s}: ${e.message}`); }
}

for (const [i, code] of inlineScripts.entries()) {
  try { vm.runInContext(code, sandbox, { filename: `inline-${i}.js` }); }
  catch (e) { fail(`running inline script ${i}: ${e.message}\n        ${e.stack.split('\n')[1] || ''}`); }
}

const checks = sandbox.__lessonChecks;
if (!Array.isArray(checks) || checks.length === 0) {
  fail('no model checks were registered');
} else {
  const bad = checks.filter(c => !c.pass);
  if (bad.length === 0) ok(`model: ${checks.length}/${checks.length} checks passed`);
  else {
    fail(`model: ${bad.length} of ${checks.length} checks failed`);
    bad.forEach(c => console.log('          - ' + c.name + (c.detail ? ' (' + c.detail + ')' : '')));
  }
}

/* ---------- 4. draw every scene ---------- */
const tl = sandbox.LESSON_TIMELINE;
if (!tl) fail('no timeline exported');
else {
  if (typeof sandbox.__drawAt !== 'function') console.log('  skip  page does not expose __drawAt; scene drawing not exercised');
  else {
    const step = 0.25;
    const errors = [];
    for (let t = 0; t <= tl.duration; t += step) {
      try { sandbox.__drawAt(Math.min(t, tl.duration)); }
      catch (e) { errors.push(`${t.toFixed(2)}s: ${e.message}`); if (errors.length > 5) break; }
      drew++;
    }
    if (errors.length) { fail('scene drawing threw'); errors.forEach(e => console.log('          ' + e)); }
    else ok(`drew ${drew} frames across ${tl.scenes.length} scenes without error`);
    if (ctxCalls.length === 0) fail('the painter issued no canvas calls');
    else ok(`painter issued ${ctxCalls.length} canvas calls`);
  }
}

/* ---------- 5. timeline sanity, independent of gen-captions ---------- */
if (tl) {
  let prevEnd = 0, tiled = true;
  for (const s of tl.scenes.slice().sort((a, b) => a.start - b.start)) {
    if (Math.abs(s.start - prevEnd) > 1e-6) tiled = false;
    prevEnd = s.end;
  }
  if (tiled && Math.abs(prevEnd - tl.duration) < 1e-6) ok('scenes tile the timeline exactly');
  else fail('scenes do not tile the timeline');
  const last = tl.events[tl.events.length - 1];
  if (last && Math.abs(last.end - tl.duration) < 1e-6) ok('captions cover the whole duration');
  else fail('captions stop before the end of the duration');
}

console.log(failures === 0 ? '\nPASS  ' + target : `\n${failures} failure(s) in ${target}`);
process.exit(failures === 0 ? 0 : 1);
