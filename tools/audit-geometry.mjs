#!/usr/bin/env node
/* Geometry audit of a lesson page.
   Runs the page's own drawing code against a recording painter and reports:
     - text drawn outside the canvas
     - text drawn on top of other text
   The painter's interface is copied from assets/painters.js, so the geometry the
   page emits here is the geometry the real painter receives.

   Usage: node tools/audit-geometry.mjs topics/<slug>/index.html
*/

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node tools/audit-geometry.mjs topics/<slug>/index.html');
  process.exit(1);
}
const file = path.resolve(target);
const dir = path.dirname(file);
const html = fs.readFileSync(file, 'utf8');

const W = 900, H = 470;

const PAL = {
  ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
  surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
  valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
  warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
};

/* ---------- the recording painter ---------- */
const texts = [];   // {t, x, y, s, size, mono, align, box}
const shapes = [];  // bounding boxes of rects and circles

function makePainter() {
  const P = { W, H, a: 1 };
  P.alpha = (v) => { P.a = v; };
  P.clear = () => {};
  P.rect = (x, y, w, h, o) => { shapes.push({ kind: 'rect', x, y, w, h }); };
  P.line = () => {};
  P.arrow = () => {};
  P.circle = (x, y, r) => { shapes.push({ kind: 'circle', x: x - r, y: y - r, w: 2 * r, h: 2 * r }); };
  P.tri = () => {};
  P.text = (x, y, s, o) => {
    o = o || {};
    const size = o.size || 14;
    const str = String(s);
    const per = o.mono ? 0.60 : 0.55;
    const w = str.length * size * per;
    const h = size * 1.12;
    let bx = x;
    if (o.align === 'center') bx = x - w / 2;
    else if (o.align === 'right') bx = x - w;
    let by = y;
    if (o.base === 'middle') by = y - h / 2;
    else if (o.base === 'bottom') by = y - h;
    texts.push({ t: null, x, y, s: str, size, mono: !!o.mono, align: o.align || 'left', box: { x: bx, y: by, w, h } });
  };
  return P;
}

/* ---------- the sandbox ---------- */
function fakeEl(id) {
  return {
    id, innerHTML: '', textContent: '', value: '0', hidden: false, disabled: false,
    style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {}, appendChild() {}, setAttribute() {},
    removeAttribute() {}, getAttribute() { return null; },
    querySelectorAll() { return []; }, querySelector() { return null; },
    getContext() { return null; }, focus() {}
  };
}
const els = new Map();
const getEl = (id) => { if (!els.has(id)) els.set(id, fakeEl(id)); return els.get(id); };

const sandbox = {
  console,
  setTimeout, clearTimeout, setInterval, clearInterval,
  requestAnimationFrame: () => 0, cancelAnimationFrame: () => {},
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
    if (tag === 'canvas') el.getContext = () => ({});      /* truthy, so the page builds a painter */
    return el;
  },
  body: fakeEl('body')
};

/* the page must not load the real painters: we supply the recorder instead */
sandbox.Painters = {
  PAL,
  rgba: (c) => c,
  cssVar: (n, f) => f,
  makePainter2D: () => makePainter(),
  makePainterP5: () => makePainter()
};

vm.createContext(sandbox);

const srcScripts = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
for (const s of srcScripts) {
  if (/^https?:/.test(s)) continue;
  if (/painters\.js$/.test(s)) continue;                  /* replaced by the recorder */
  const p = path.resolve(dir, s);
  if (!fs.existsSync(p)) { console.error('missing script ' + s); process.exit(1); }
  vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: p });
}

const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for (const [i, code] of inline.entries()) {
  try { vm.runInContext(code, sandbox, { filename: `inline-${i}.js` }); }
  catch (e) { console.error('inline script failed: ' + e.message); process.exit(1); }
}

if (typeof sandbox.__drawAt !== 'function') {
  console.error('page does not expose __drawAt'); process.exit(1);
}
const tl = sandbox.LESSON_TIMELINE;
if (!tl) { console.error('no timeline'); process.exit(1); }

/* ---------- sample every scene at each caption beat ---------- */
const problems = [];
const seen = new Set();

for (const sc of tl.scenes) {
  const beats = tl.events.filter(e => e.scene === sc.id).map(e => e.end - 0.01);
  const samples = beats.length ? beats : [sc.end - 0.01];
  for (const t of samples) {
    texts.length = 0; shapes.length = 0;
    try { sandbox.__drawAt(t); } catch (e) { problems.push(`${sc.id} @${t}s: draw threw ${e.message}`); continue; }

    /* 1. inside the canvas */
    for (const tx of texts) {
      const b = tx.box;
      if (b.x < -1 || b.y < -1 || b.x + b.w > W + 1 || b.y + b.h > H + 1) {
        const key = sc.id + '|out|' + tx.s;
        if (!seen.has(key)) {
          seen.add(key);
          problems.push(`${sc.id} @${t}s: text outside the canvas "${tx.s}" at (${b.x.toFixed(0)},${b.y.toFixed(0)}) size ${tx.size}`);
        }
      }
    }

    /* 2. text over text */
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i].box, b = texts[j].box;
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 2 && oy > 2) {
          const key = sc.id + '|ov|' + texts[i].s + '|' + texts[j].s;
          if (!seen.has(key)) {
            seen.add(key);
            problems.push(`${sc.id} @${t}s: text overlap "${texts[i].s}" with "${texts[j].s}" (${ox.toFixed(0)}x${oy.toFixed(0)} px)`);
          }
        }
      }
    }
  }
}

if (problems.length) {
  console.log(`GEOMETRY  ${problems.length} issue(s) in ${target}`);
  problems.forEach(p => console.log('  - ' + p));
  process.exit(1);
}
console.log(`GEOMETRY  clean: ${tl.scenes.length} scenes, every caption beat sampled, no text outside ${W}x${H} and no text-on-text overlap`);
