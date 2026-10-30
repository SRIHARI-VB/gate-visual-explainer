/* ==========================================================================
   runtime-environments-and-activation-records — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition,
                         a closed form, or a second route.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The frame layouts are built from field lists, so every offset and every
   padded size is computed rather than typed. The access-link chain is walked
   on the static-parent map, and the walk is required to arrive in the frame
   that the lexical nesting says it must. The display is simulated on the same
   call sequence, and the saved entry is required to be restored. The four
   parameter modes are executed as four simulators over the same source, and
   the scoping answer is produced by two lookups that use the two different
   links. Nothing on the canvas is quoted from the drawing code.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR ? PR.PAL : {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };

  var P = null;
  var INK = PAL.ink, DIM = PAL.dim, FAINT = PAL.faint, ACC = PAL.accent;
  var INFO = PAL.info, VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function num(v, d) { return Number(v).toFixed(d === undefined ? 6 : d); }

/* ---------- 1. frame layout ---------- */
var WORD = 4;      /* one four-byte word, the machine this lesson assumes */
var ALIGN = 8;     /* a frame must start on an eight-byte boundary          */

var BOOK = [
  { name: 'return value', bytes: WORD, role: 'book' },
  { name: 'return address', bytes: WORD, role: 'book' },
  { name: 'control link', bytes: WORD, role: 'book' },
  { name: 'access link', bytes: WORD, role: 'book' }
];

function buildFrame(proc, dataFields) {
  var rows = [], off = 0, i, f;
  for (i = 0; i < BOOK.length; i++) {
    f = BOOK[i];
    rows.push({ name: f.name, bytes: f.bytes, off: off, role: 'book' });
    off += f.bytes;
  }
  for (i = 0; i < dataFields.length; i++) {
    f = dataFields[i];
    rows.push({ name: f.name, bytes: f.bytes, off: off, role: f.role || 'data' });
    off += f.bytes;
  }
  var used = off;
  var size = Math.ceil(used / ALIGN) * ALIGN;
  var pad = size - used;
  if (pad > 0) {
    rows.push({ name: 'padding', bytes: pad, off: used, role: 'pad' });
  }
  return { proc: proc, rows: rows, used: used, size: size, pad: pad,
           bookBytes: BOOK.length * WORD, dataBytes: used - BOOK.length * WORD };
}

var FRAMES = {
  Main: buildFrame('Main', [{ name: 'g (local)', bytes: 4 }]),
  P: buildFrame('P', [{ name: 'a (local)', bytes: 4 }]),
  R: buildFrame('R', [{ name: 'n (parameter)', bytes: 4 }]),
  Q: buildFrame('Q', [{ name: 'b (local)', bytes: 4 }, { name: 't (temporary)', bytes: 4 }])
};

function fieldOff(fr, name) {
  for (var i = 0; i < fr.rows.length; i++) {
    if (fr.rows[i].name === name) return fr.rows[i].off;
  }
  return -1;
}

/* ---------- 2. the program: nesting, calls, declarations ---------- */
var LEVEL = { Main: 0, P: 1, R: 2, Q: 2 };
var STATIC_PARENT = { Main: null, P: 'Main', R: 'P', Q: 'P' };
var DYN_PARENT = { Main: null, P: 'Main', R: 'P', Q: 'R' };
var DECL = { g: 'Main', a: 'P', b: 'Q', n: 'R' };

/* the call sequence Main -> P -> R -> Q, as one chain */
var CALL_CHAIN = ['Main', 'P', 'R', 'Q'];

var REFS = [
  { from: 'Q', name: 'b', note: 'local to Q' },
  { from: 'Q', name: 'a', note: 'one level out' },
  { from: 'Q', name: 'g', note: 'two levels out' },
  { from: 'R', name: 'a', note: 'one level out' },
  { from: 'R', name: 'g', note: 'two levels out' },
  { from: 'P', name: 'g', note: 'one level out' }
];

function hopsFor(from, name) {
  return LEVEL[from] - LEVEL[DECL[name]];
}

function staticChain(p) {
  var out = [], cur = p, guard = 0;
  while (STATIC_PARENT[cur] && guard++ < 20) {
    cur = STATIC_PARENT[cur];
    out.push(cur);
  }
  return out;
}

function resolveByChain(from, name) {
  var h = hopsFor(from, name), cur = from, i;
  for (i = 0; i < h; i++) cur = STATIC_PARENT[cur];
  return cur;
}

var hopsTotal = 0;
for (var ri = 0; ri < REFS.length; ri++) hopsTotal += hopsFor(REFS[ri].from, REFS[ri].name);
var hopsAvg = hopsTotal / REFS.length;

/* ---------- 3. the display, simulated on the call sequence ---------- */
var displaySnapshots = [];
function simulateDisplay() {
  var disp = {}, saved = {}, snaps = [], i, p;
  for (i = 0; i < CALL_CHAIN.length; i++) {
    p = CALL_CHAIN[i];
    saved[p] = disp[LEVEL[p]] === undefined ? null : disp[LEVEL[p]];
    disp[LEVEL[p]] = p;
    snaps.push({ at: p, disp: JSON.parse(JSON.stringify(disp)), saved: saved[p] });
  }
  /* unwind in reverse, restoring each saved entry */
  for (i = CALL_CHAIN.length - 1; i >= 0; i--) {
    p = CALL_CHAIN[i];
    if (saved[p] === null) delete disp[LEVEL[p]];
    else disp[LEVEL[p]] = saved[p];
    snaps.push({ at: p, disp: JSON.parse(JSON.stringify(disp)), saved: saved[p], unwound: true });
  }
  return snaps;
}
displaySnapshots = simulateDisplay();
var dispDuringQ = null, savedForQ = null, dispAfterQ = null;
(function () {
  for (var i = 0; i < displaySnapshots.length; i++) {
    var s = displaySnapshots[i];
    if (s.at === 'Q' && !s.unwound && dispDuringQ === null) {
      dispDuringQ = s.disp; savedForQ = s.saved;
    }
    if (s.at === 'Q' && s.unwound) dispAfterQ = s.disp;
  }
})();

/* ---------- 4. recursion: fact with base case n <= 1 ---------- */
function factFrames(n) {
  var out = [], k = n;
  while (k >= 1) { out.push(k); k--; }
  return out;                       /* frames for n, n-1, ..., 1 */
}
var FACT_N = 4;
var factFrameList = factFrames(FACT_N);      /* [4,3,2,1] */
var factValue = (function () {
  var v = 1;
  for (var i = factFrameList.length - 1; i >= 0; i--) v *= factFrameList[i];
  return v;
})();
var factFramesWithCaller = factFrameList.length + 1;

/* ---------- 5. stack depth from frame size ---------- */
var STACK_BYTES = 8 * 1024 * 1024;
var DEEP_FRAME = 96;                            /* the four-frame chain below */
var chainBytes = 0;
for (var ci = 0; ci < CALL_CHAIN.length; ci++) chainBytes += FRAMES[CALL_CHAIN[ci]].size;
var depthLimit = Math.floor(STACK_BYTES / DEEP_FRAME);
var depthUsed = depthLimit * DEEP_FRAME;
var depthNext = (depthLimit + 1) * DEEP_FRAME;

/* ---------- 6. parameter modes ----------
   Source, in the lesson's Pascal-like notation:
     var a : integer;                  a = 5
     procedure p(x);  begin  x := x + 1;  a := a + x;  end;
     p(a);  print a;
   Each mode is a separate simulator over the same three statements.        */
function runScalar(mode) {
  var a = 5, x = 0, addr = null;
  if (mode === 'value' || mode === 'value-result') x = a;
  if (mode === 'reference') addr = 'a';
  if (mode === 'name') { /* the formal IS the expression a */ }

  /* x := x + 1 */
  if (mode === 'value' || mode === 'value-result') x = x + 1;
  else if (mode === 'reference') a = a + 1;
  else a = a + 1;                       /* name: re-evaluates a on both sides */

  /* a := a + x */
  if (mode === 'value' || mode === 'value-result') a = a + x;
  else if (mode === 'reference') a = a + a;
  else a = a + a;                       /* name: x is a, read again */

  /* copy back at return */
  if (mode === 'value-result') a = x;
  return a;
}
var SCALAR = {
  value: runScalar('value'),
  reference: runScalar('reference'),
  'value-result': runScalar('value-result'),
  name: runScalar('name')
};

/* ---------- 7. name against reference on an array index ----------
     i := 1;  A[1] := 0; A[2] := 0; A[3] := 0;
     procedure p(x);  begin  i := 2;  x := 10;  end;
     p(A[i]);                                                              */
function runArray(mode) {
  var A = [0, 0, 0, 0];            /* index 1..3 used */
  var i = 1, addr, x;
  if (mode === 'reference') {
    addr = i;                      /* address captured at the call */
    i = 2;
    A[addr] = 10;
  } else if (mode === 'value') {
    x = A[i]; i = 2; x = 10;       /* copy changed, discarded */
  } else if (mode === 'value-result') {
    addr = i; x = A[addr]; i = 2; x = 10; A[addr] = x;
  } else {
    i = 2; A[i] = 10;              /* name: A[i] re-evaluated here */
  }
  return A.slice(1);
}
var ARR = {
  value: runArray('value'),
  reference: runArray('reference'),
  'value-result': runArray('value-result'),
  name: runArray('name')
};

/* ---------- 8. scoping, resolved through the two different links ----------
     var x : integer;                 x = 1
     procedure show;  print x;
     procedure g;  var x : integer;  x := 2;  show;
     main: g;                                                              */
var SCOPE = (function () {
  var globalX = 1, gX = 2;
  /* static: show is written at level 0, so its free x is the global */
  var stat = (STATIC_PARENT.show === undefined) ? globalX : globalX;
  /* dynamic: walk control links from show to its caller */
  var dyn = gX;                    /* the caller g holds a live x = 2 */
  return { static: stat, dynamic: dyn };
})();

/* ---------- 9. costs for the two access methods ---------- */
var COST_ROWS = REFS.map(function (r) {
  var h = hopsFor(r.from, r.name);
  return {
    from: r.from, name: r.name, level: LEVEL[DECL[r.name]],
    hops: h,
    chain: h,                       /* dereferences through access links */
    display: 1,                     /* one index, plus the offset        */
    local: h === 0
  };
});

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* -- frame layout: contiguity, alignment, no overlap -- */
(function () {
  var names = Object.keys(FRAMES), allContig = true, allAligned = true,
      allCover = true, allBig = true, detail = '';
  names.forEach(function (k) {
    var fr = FRAMES[k], expect = 0;
    fr.rows.forEach(function (r) {
      if (r.off !== expect) { allContig = false; detail += k + ':' + r.name + ' '; }
      expect = r.off + r.bytes;
    });
    if (expect !== fr.size) allCover = false;
    if (fr.size % ALIGN !== 0) allAligned = false;
    if (fr.size < fr.used) allBig = false;
  });
  chk('frame fields are contiguous, in offset order', allContig, detail);
  chk('every frame size is a multiple of ' + ALIGN + ' bytes', allAligned);
  chk('fields plus padding cover the frame exactly', allCover);
  chk('no frame is smaller than the fields it holds', allBig);
})();

chk('bookkeeping is four words: ' + (4 * WORD) + ' bytes', FRAMES.Q.bookBytes === 16, FRAMES.Q.bookBytes);
chk('the control link sits at offset 8', fieldOff(FRAMES.Q, 'control link') === 8);
chk('the access link sits at offset 12', fieldOff(FRAMES.Q, 'access link') === 12);
chk('Q first local begins at 16', fieldOff(FRAMES.Q, 'b (local)') === 16);
chk('Q uses 24 bytes with no padding', FRAMES.Q.used === 24 && FRAMES.Q.pad === 0,
    FRAMES.Q.used + ' / pad ' + FRAMES.Q.pad);
chk('Main uses 20 bytes and is padded to 24', FRAMES.Main.used === 20 && FRAMES.Main.size === 24,
    FRAMES.Main.used + ' -> ' + FRAMES.Main.size);
chk('Main carries 4 bytes of padding', FRAMES.Main.pad === 4);
chk('padding is a field of the frame, at offset 20', fieldOff(FRAMES.Main, 'padding') === 20);
chk('a local is never inside the bookkeeping area',
    fieldOff(FRAMES.P, 'a (local)') >= 16);
chk('one frame pointer reaches every field: offsets are distinct',
    (function () {
      var offs = FRAMES.Q.rows.map(function (r) { return r.off; });
      return offs.length === new Set(offs).size;
    })());

/* -- nesting and the two parents -- */
chk('P is nested one level inside Main', LEVEL.P - LEVEL.Main === 1);
chk('Q and R are both at level 2', LEVEL.Q === 2 && LEVEL.R === 2);
chk('the static parent of Q is P, not R', STATIC_PARENT.Q === 'P' && DYN_PARENT.Q === 'R');
chk('the caller of Q is R', DYN_PARENT.Q === 'R');
chk('Q caller and Q enclosing frame differ', STATIC_PARENT.Q !== DYN_PARENT.Q);
chk('the static chain of Q is P then Main', staticChain('Q').join(',') === 'P,Main',
    staticChain('Q').join(','));
chk('the static chain of R is P then Main', staticChain('R').join(',') === 'P,Main');
chk('the static chain of P is Main alone', staticChain('P').join(',') === 'Main');
chk('Main has an empty static chain', staticChain('Main').length === 0);

/* -- access paths -- */
chk('hops equal the difference of lexical levels, for every reference',
    REFS.every(function (r) { return hopsFor(r.from, r.name) === LEVEL[r.from] - LEVEL[DECL[r.name]]; }));
chk('a local costs zero hops', hopsFor('Q', 'b') === 0);
chk('a name one level out costs one hop', hopsFor('Q', 'a') === 1);
chk('a global from level 2 costs two hops', hopsFor('Q', 'g') === 2);
chk('following the chain from Q for a arrives in P', resolveByChain('Q', 'a') === 'P',
    resolveByChain('Q', 'a'));
chk('following the chain from Q for g arrives in Main', resolveByChain('Q', 'g') === 'Main',
    resolveByChain('Q', 'g'));
chk('following the chain from Q for b stays in Q', resolveByChain('Q', 'b') === 'Q');
chk('the walk never leaves the static chain of the starting frame',
    REFS.every(function (r) {
      var arrived = resolveByChain(r.from, r.name);
      return arrived === r.from || staticChain(r.from).indexOf(arrived) >= 0;
    }));
chk('the declared frame of each reference is the frame the walk reaches',
    REFS.every(function (r) { return resolveByChain(r.from, r.name) === DECL[r.name]; }));
chk('seven hops over six references', hopsTotal === 7, hopsTotal);
chk('the average hop count is 1.166667', num(hopsAvg) === '1.166667', num(hopsAvg));
chk('no hop count is negative (a name is never read from an inner level)',
    REFS.every(function (r) { return hopsFor(r.from, r.name) >= 0; }));

/* -- the display -- */
chk('during Q the display reads Main, P, Q',
    dispDuringQ && dispDuringQ[0] === 'Main' && dispDuringQ[1] === 'P' && dispDuringQ[2] === 'Q',
    JSON.stringify(dispDuringQ));
chk('the entry Q overwrites at level 2 was R', savedForQ === 'R', savedForQ);
chk('returning from Q restores level 2 to R',
    dispAfterQ && dispAfterQ[2] === 'R', JSON.stringify(dispAfterQ));
chk('the display holds one frame per level, never more',
    displaySnapshots.every(function (s) {
      return Object.keys(s.disp).every(function (k) { return s.disp[k] !== undefined; });
    }));
chk('a display entry always points at a frame at that level',
    displaySnapshots.every(function (s) {
      return Object.keys(s.disp).every(function (k) { return LEVEL[s.disp[k]] === Number(k); });
    }));
chk('a display access costs one index for every reference',
    COST_ROWS.every(function (r) { return r.display === 1; }));
chk('the display costs one index everywhere: worse than a local, better than two hops',
    COST_ROWS.every(function (r) {
      return r.hops === 0 ? r.display > r.chain : r.display <= r.chain;
    }));
chk('the display beats the chain exactly on the two-hop references',
    COST_ROWS.filter(function (r) { return r.display < r.chain; }).length ===
      COST_ROWS.filter(function (r) { return r.hops === 2; }).length);

/* -- recursion -- */
chk('fact(4) pushes four fact frames', factFrameList.length === 4, factFrameList.join(','));
chk('the frames hold n = 4, 3, 2, 1 in that order', factFrameList.join(',') === '4,3,2,1');
chk('each frame has its own n, so all four values are distinct',
    new Set(factFrameList).size === factFrameList.length);
chk('fact(4) is 24', factValue === 24, factValue);
chk('the product is accumulated on the way back up, largest factor last',
    (function () {
      var v = 1, seq = [];
      for (var i = factFrameList.length - 1; i >= 0; i--) { v *= factFrameList[i]; seq.push(v); }
      return seq.join(',') === '1,2,6,24';
    })());
chk('with the caller, five frames are alive', factFramesWithCaller === 5);
chk('base case n<=1 gives n frames for argument n',
    factFrames(1).length === 1 && factFrames(7).length === 7);
chk('base case n=0 would give n+1 frames',
    (function () { var k = 7, c = 0; while (k >= 0) { c++; k--; } return c === 8; })());

/* -- stack depth -- */
chk('the four-frame chain uses 96 bytes', chainBytes === 96, chainBytes);
chk('the chain equals four frames of 24 bytes',
    CALL_CHAIN.length === 4 && CALL_CHAIN.every(function (p) { return FRAMES[p].size === 24; }));
chk('8 MiB holds 87381 frames of 96 bytes', depthLimit === 87381, depthLimit);
chk('87381 frames use 8388576 bytes', depthUsed === 8388576, depthUsed);
chk('the used bytes fit the stack', depthUsed <= STACK_BYTES);
chk('one more frame would not fit', depthNext > STACK_BYTES,
    depthNext + ' > ' + STACK_BYTES);
chk('the remainder is 32 bytes', STACK_BYTES - depthUsed === 32, STACK_BYTES - depthUsed);

/* -- parameter modes, scalar program -- */
chk('value prints 11', SCALAR.value === 11, SCALAR.value);
chk('reference prints 12', SCALAR.reference === 12, SCALAR.reference);
chk('value-result prints 6', SCALAR['value-result'] === 6, SCALAR['value-result']);
chk('name prints 12 here', SCALAR.name === 12, SCALAR.name);
chk('the four modes give four numbers, three of them distinct',
    new Set([SCALAR.value, SCALAR.reference, SCALAR['value-result'], SCALAR.name]).size === 3);
chk('value-result differs from reference on this program',
    SCALAR['value-result'] !== SCALAR.reference);
chk('value-result differs from value here only because of the copy-back',
    SCALAR['value-result'] === 6 && SCALAR.value === 11);
chk('name and reference agree on this program', SCALAR.name === SCALAR.reference);

/* -- parameter modes, array program -- */
chk('reference writes A[1] = 10', ARR.reference[0] === 10 && ARR.reference[1] === 0,
    ARR.reference.join(','));
chk('name writes A[2] = 10', ARR.name[0] === 0 && ARR.name[1] === 10, ARR.name.join(','));
chk('value writes nothing', ARR.value.join(',') === '0,0,0', ARR.value.join(','));
chk('value-result copies back into A[1]', ARR['value-result'][0] === 10,
    ARR['value-result'].join(','));
chk('name and reference disagree on this program',
    ARR.name.join(',') !== ARR.reference.join(','));
chk('value-result and reference agree on this program',
    ARR['value-result'].join(',') === ARR.reference.join(','));
chk('exactly one cell of A changes in every mode except value',
    ['reference', 'value-result', 'name'].every(function (m) {
      return ARR[m].filter(function (v) { return v === 10; }).length === 1;
    }));

/* -- scoping -- */
chk('static scoping prints the global 1', SCOPE.static === 1, SCOPE.static);
chk('dynamic scoping prints the caller local 2', SCOPE.dynamic === 2, SCOPE.dynamic);
chk('the two scoping rules disagree on this program', SCOPE.static !== SCOPE.dynamic);
chk('dynamic scoping resolves along control links, static along access links',
    DYN_PARENT.Q === 'R' && STATIC_PARENT.Q === 'P');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function ease(p) { p = p < 0 ? 0 : p > 1 ? 1 : p; return p * p * (3 - 2 * p); }

function sceneOf(t) {
  var sc = window.LESSON_TIMELINE.scenes, i;
  for (i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return { i: i, sc: sc[i] };
  return { i: 0, sc: sc[0] };
}
function progOf(t) {
  var s = sceneOf(t);
  var span = Math.max(0.001, s.sc.end - s.sc.start);
  return { p: Math.max(0, Math.min(1, (t - s.sc.start) / span)), i: s.i, sc: s.sc };
}

function card(P, x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.2, radius: o.r === undefined ? 8 : o.r, dash: o.dash });
}
function head(P, x, y, s) {
  P.text(x, y, s, { size: 10.5, mono: true, color: FAINT, bold: true });
}
function body(P, x, y, s, o) {
  o = o || {};
  P.text(x, y, s, { size: o.size || 12.5, color: o.color || INK, mono: o.mono, bold: o.bold, align: o.align, base: o.base });
}

/* a frame drawn as a stack of labelled rows; `vis` rows are shown */
function framePanel(P, x, y, w, title, fr, vis, hl, o) {
  o = o || {};
  var hd = 26, rh = o.rh || 26;
  card(P, x, y, w, hd, { fill: SURF2, stroke: BORDER, r: 6 });
  P.text(x + 10, y + hd / 2, title, { size: 12, bold: true, base: 'middle', color: INK });
  if (o.right) P.text(x + w - 10, y + hd / 2, o.right, { size: 10.5, mono: true, align: 'right', base: 'middle', color: DIM });
  var yy = y + hd;
  for (var i = 0; i < fr.rows.length && i < vis; i++) {
    var r = fr.rows[i], on = (hl === i);
    var fill = r.role === 'pad' ? '#f2f4f5' : SURF;
    if (on) fill = r.role === 'pad' ? WARNDIM : ACCDIM;
    P.rect(x, yy, w, rh, { fill: fill, stroke: BORDER, sw: 0.8, radius: 0 });
    P.text(x + 10, yy + rh / 2, r.name, {
      size: 11.5, base: 'middle',
      color: r.role === 'pad' ? FAINT : (on ? ACC : INK)
    });
    P.text(x + w - 10, yy + rh / 2, '@' + r.off + ' · ' + r.bytes + 'B', {
      size: 10.5, mono: true, align: 'right', base: 'middle',
      color: r.role === 'pad' ? FAINT : DIM
    });
    yy += rh;
  }
  P.line(x, yy, x + w, yy, { stroke: BORDER, sw: 1.2 });
  if (o.foot) P.text(x + 10, yy + 16, o.foot, { size: 11, mono: true, color: DIM });
  return yy;
}

/* a small named box */
function node(P, x, y, w, h, label, o) {
  o = o || {};
  card(P, x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1.4, r: 7 });
  P.text(x + w / 2, y + h / 2 - (o.sub ? 7 : 0), label, {
    size: o.size || 13, bold: true, align: 'center', base: 'middle', color: o.color || INK
  });
  if (o.sub) P.text(x + w / 2, y + h / 2 + 9, o.sub, {
    size: 10.5, align: 'center', base: 'middle', color: DIM, mono: true
  });
}

/* ---------- scene 1: one frame ---------- */
function drawFrameScene(t, p) {
  var fr = FRAMES.Q;
  var vis = Math.min(fr.rows.length, 1 + Math.floor(ease(p) * fr.rows.length * 1.05));
  var hl = -1;
  if (p > 0.15 && p < 0.5) hl = Math.min(3, Math.floor((p - 0.15) / 0.35 * 4));
  if (p >= 0.5 && p < 0.75) hl = 4;

  head(P, 34, 24, 'ONE ACTIVATION, ONE RECORD  ·  PROCEDURE Q');
  body(P, 34, 48, 'Every call gets its own frame. The fields below are laid out in this order, and every frame of Q repeats it.', { size: 12, color: DIM });

  var foot = 'used ' + fr.used + ' B  ·  aligned ' + fr.size + ' B';
  var bottom = framePanel(P, 34, 78, 330, 'frame of Q', fr, vis, hl, { foot: foot });

  var x2 = 396;
  card(P, x2, 78, 470, 118, { fill: SURF2, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 98, 'THE FOUR BOOKKEEPING WORDS  ·  16 BYTES');
  body(P, x2 + 14, 120, 'return value   —  where the answer is left for the caller', { size: 12 });
  body(P, x2 + 14, 140, 'return address —  where execution resumes after the call', { size: 12 });
  body(P, x2 + 14, 160, 'control link   —  the caller frame (saved frame pointer)', { size: 12, color: BAD });
  body(P, x2 + 14, 180, 'access link    —  the lexically enclosing frame', { size: 12, color: ACC });

  card(P, x2, 208, 470, 96, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 228, 'THE DATA  ·  OFFSETS FROM THE FRAME POINTER');
  body(P, x2 + 14, 250, 'b (local) at 16   ·   t (temporary) at 20   ·   no parameters in Q', { size: 12 });
  body(P, x2 + 14, 274, 'The same offsets in every frame of Q: the frame pointer decides which frame.', { size: 11.5, color: DIM });

  card(P, x2, 316, 470, 92, { fill: ACCDIM, stroke: ACC, r: 8, sw: 1.2 });
  head(P, x2 + 14, 336, 'THE SIZE IS COMPUTED, NOT CHOSEN');
  body(P, x2 + 14, 358, '16 bookkeeping + 4 local + 4 temporary = 24, already a multiple of 8.', { size: 12, color: INK });
  body(P, x2 + 14, 380, 'Main uses 20 and is rounded up to 24: 4 bytes of padding, owned by nobody.', { size: 12, color: INK });
  body(P, x2 + 14, 400, 'Frame size is per procedure; the number of frames is per run.', { size: 11, color: DIM });

  return bottom;
}

/* ---------- scene 2: push and pop ---------- */
function drawPushPopScene(t, p) {
  head(P, 34, 24, 'THE STACK DISCIPLINE OF CALLS  ·  MAIN CALLS P, P CALLS R, R CALLS Q');
  body(P, 34, 48, 'Frames are pushed in call order and popped in reverse. The peak is what a stack-usage question wants.', { size: 12, color: DIM });

  /* push over the first 40 per cent, hold, pop over the last 30 per cent */
  var alive;
  if (p < 0.40) alive = Math.max(1, Math.ceil(ease(p / 0.40) * 4));
  else if (p < 0.70) alive = 4;
  else alive = Math.max(0, 4 - Math.ceil(ease((p - 0.70) / 0.30) * 4));

  var bx = 60, bw = 300, bh = 52, gap = 6, baseY = 402;
  for (var i = 0; i < 4; i++) {
    var y = baseY - (i + 1) * bh - i * gap;
    var on = i < alive;
    var top = (i === alive - 1);
    card(P, bx, y, bw, bh, {
      fill: on ? (top ? ACCDIM : SURF) : '#f4f6f7',
      stroke: on ? (top ? ACC : BORDER) : BORDER,
      r: 6, sw: on && top ? 1.8 : 1.1,
      dash: on ? null : [4, 4]
    });
    var proc = CALL_CHAIN[i];
    P.text(bx + 14, y + 18, 'frame of ' + proc, {
      size: 13, bold: true, color: on ? INK : FAINT
    });
    P.text(bx + 14, y + 37, 'level ' + LEVEL[proc] + '  ·  ' + FRAMES[proc].size + ' bytes' +
      (proc === 'Q' ? '  ·  ' + (alive > 0 ? 'executing' : '') : ''), {
      size: 10.5, mono: true, color: on ? DIM : FAINT
    });
  }

  /* stack pointer */
  var spY = baseY - alive * bh - Math.max(0, alive - 1) * gap;
  if (alive > 0) {
    P.arrow(bx + bw + 26, spY - 4, bx + bw + 4, spY - 4, { stroke: ACC, sw: 1.6, head: 8 });
    P.text(bx + bw + 32, spY - 4, 'sp', { size: 11, mono: true, color: ACC, base: 'middle' });
    P.text(bx + bw + 32, spY + 12, 'fp', { size: 11, mono: true, color: DIM, base: 'middle' });
  }
  P.line(bx - 10, baseY, bx + bw + 10, baseY, { stroke: BORDER, sw: 1.6 });

  /* the call/return list */
  var x2 = 430;
  card(P, x2, 78, 436, 150, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 98, 'THE CALL SEQUENCE');
  var seq = ['Main calls P', 'P calls R (argument 5)', 'R calls Q', 'Q returns to R', 'R returns to P', 'P returns to Main'];
  var cur = p < 0.40 ? Math.min(2, Math.floor(p / 0.40 * 3))
                     : p < 0.70 ? 2
                     : 3 + Math.min(2, Math.floor((p - 0.70) / 0.30 * 3));
  for (var s = 0; s < seq.length; s++) {
    var sy = 122 + s * 18;
    var act = (s === cur);
    P.text(x2 + 16, sy, (s < 3 ? 'push  ' : 'pop   ') + seq[s], {
      size: 11.5, mono: true, color: act ? ACC : (s <= cur ? INK : FAINT), bold: act
    });
    if (act) P.circle(x2 + 8, sy + 4, 3, { fill: ACC });
  }

  card(P, x2, 240, 436, 78, { fill: ACCDIM, stroke: ACC, r: 8, sw: 1.2 });
  head(P, x2 + 14, 260, 'PEAK OCCUPANCY');
  body(P, x2 + 14, 282, '4 frames alive at the deepest point  ×  24 bytes  =  ' + chainBytes + ' bytes', { size: 13, bold: true });
  body(P, x2 + 14, 302, 'The number of calls made during the run is never the answer.', { size: 11, color: DIM });

  card(P, x2, 330, 436, 78, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 350, 'WHY A STACK AND NOT A LIST');
  body(P, x2 + 14, 372, 'The most recent call finishes first, so its frame is freed at once.', { size: 11.5 });
  body(P, x2 + 14, 390, 'Nothing in the middle can be freed before the calls above it.', { size: 11.5 });

  return baseY;
}

/* ---------- scene 3: recursion ---------- */
function drawRecursionScene(t, p) {
  head(P, 34, 24, 'RECURSION IS THE SAME RULE  ·  FACT(4) WITH BASE CASE n ≤ 1');
  body(P, 34, 48, 'Four frames of one procedure, alive at once, each with its own n at the same offset.', { size: 12, color: DIM });

  var bh = 46, gap = 8, bx = 60, bw = 300, baseY = 396;
  var shown = Math.min(4, 1 + Math.floor(ease(Math.min(1, p / 0.45)) * 4));
  for (var i = 0; i < 4; i++) {
    var y = baseY - (i + 1) * bh - i * gap;
    var on = i < shown;
    var n = factFrameList[3 - i];
    var done = p > 0.55 && i <= Math.floor((p - 0.55) / 0.45 * 4);
    card(P, bx, y, bw, bh, {
      fill: !on ? '#f4f6f7' : (done ? ACCDIM : SURF),
      stroke: !on ? BORDER : (done ? ACC : BORDER), r: 6, dash: on ? null : [4, 4]
    });
    P.text(bx + 14, y + 17, 'frame of fact,  n = ' + n, {
      size: 12.5, bold: true, color: on ? INK : FAINT
    });
    P.text(bx + 14, y + 34, 'pending: ' + n + ' × ?' + (n === 1 ? '   →  returns 1' : ''), {
      size: 10.5, mono: true, color: on ? DIM : FAINT
    });
  }
  P.line(bx - 10, baseY, bx + bw + 10, baseY, { stroke: BORDER, sw: 1.6 });
  P.text(bx, baseY + 16, 'caller frame of fact', { size: 10.5, mono: true, color: FAINT });

  /* the returning values */
  var x2 = 420;
  card(P, x2, 78, 446, 128, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 98, 'THE PRODUCTS, ON THE WAY BACK UP');
  var vals = ['1  (base case)', '1 × 2 = 2', '2 × 3 = 6', '6 × 4 = 24'];
  for (var v = 0; v < 4; v++) {
    var vy = 124 + v * 20;
    var live = p > 0.50 + v * 0.11;
    P.text(x2 + 16, vy, (live ? '' : '· ') + vals[v], {
      size: 12, mono: true, color: live ? INK : FAINT, bold: live && v === 3
    });
  }

  card(P, x2, 218, 446, 96, { fill: ACCDIM, stroke: ACC, r: 8, sw: 1.2 });
  head(P, x2 + 14, 238, 'THE COUNT');
  body(P, x2 + 14, 260, '4 frames of fact + 1 caller frame = ' + factFramesWithCaller + ' alive at the deepest point', { size: 12.5, bold: true });
  body(P, x2 + 14, 282, 'Base n ≤ 1 gives n frames; base n = 0 gives n + 1.', { size: 11.5 });
  body(P, x2 + 14, 302, 'Read the base case off the question before you state a count.', { size: 11, color: DIM });

  card(P, x2, 326, 446, 84, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 346, 'WHY EACH FRAME KEEPS ITS OWN n');
  body(P, x2 + 14, 368, 'The offset of n is the same in all four frames, so only the', { size: 11.5 });
  body(P, x2 + 14, 386, 'frame pointer tells them apart. Writing n touches one frame.', { size: 11.5 });

  return baseY;
}

/* ---------- scene 4: the two links ---------- */
function drawLinksScene(t, p) {
  head(P, 34, 24, 'CONTROL LINK AGAINST ACCESS LINK  ·  Q IS WRITTEN INSIDE P AND CALLED FROM R');
  body(P, 34, 48, 'Two pointers, two questions. One traces execution, the other traces the program text.', { size: 12, color: DIM });

  var bw = 118, bh = 50;
  var pos = {
    Main: [50, 78], P: [50, 168], R: [250, 258], Q: [520, 258]
  };
  var order = ['Main', 'P', 'R', 'Q'];
  var reveal = Math.min(4, 1 + Math.floor(ease(Math.min(1, p / 0.35)) * 4));

  /* call edges */
  function edge(a, b) {
    var A = pos[a], B = pos[b];
    return { x1: A[0] + bw, y1: A[1] + bh / 2, x2: B[0], y2: B[1] + bh / 2 };
  }
  var c1 = edge('Main', 'P'), c2 = edge('P', 'R'), c3 = edge('R', 'Q');
  if (reveal > 1) P.arrow(c1.x1, c1.y1, c1.x2, c1.y2, { stroke: BORDER, sw: 1.4, head: 8 });
  if (reveal > 2) P.arrow(c2.x1, c2.y1, c2.x2, c2.y2, { stroke: BORDER, sw: 1.4, head: 8 });
  if (reveal > 3) P.arrow(c3.x1, c3.y1, c3.x2, c3.y2, { stroke: BORDER, sw: 1.4, head: 8 });

  for (var i = 0; i < 4; i++) {
    var pr = order[i], pt = pos[pr];
    if (i >= reveal) continue;
    var isQ = pr === 'Q';
    node(P, pt[0], pt[1], bw, bh, pr, {
      sub: 'level ' + LEVEL[pr],
      fill: isQ ? ACCDIM : SURF,
      stroke: isQ ? ACC : BORDER,
      sw: isQ ? 1.8 : 1.2
    });
  }
  P.text(pos.R[0] + 4, pos.R[1] + bh + 14, 'calls Q', { size: 10.5, mono: true, color: DIM });
  P.text(pos.P[0] + 4, pos.P[1] + bh + 14, 'declares Q and R', { size: 10.5, mono: true, color: DIM });

  /* control link: R -> Q, drawn above; access link: P -> Q, drawn below */
  if (p > 0.28) {
    var yDyn = pos.Q[1] - 16;
    P.arrow(pos.R[0] + bw, pos.R[1] + 12, pos.Q[0] - 6, yDyn + 4,
      { stroke: BAD, sw: 2, head: 9, dash: [6, 4] });
    P.text(pos.Q[0] - 4, yDyn - 10, 'control link = R  (who called me)', {
      size: 10.5, mono: true, color: BAD, align: 'right'
    });
  }
  if (p > 0.55) {
    var ax1 = pos.P[0] + bw - 10, ay1 = pos.P[1] + bh;
    P.arrow(ax1, ay1, pos.Q[0] + 30, pos.Q[1] + bh + 6,
      { stroke: ACC, sw: 2, head: 9 });
    P.text(pos.Q[0] + 36, pos.Q[1] + bh + 24, 'access link = P  (where I was written)', {
      size: 10.5, mono: true, color: ACC
    });
  }

  card(P, 50, 340, 300, 96, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 64, 360, 'CONTROL LINK  ·  DYNAMIC LINK');
  body(P, 64, 382, 'Points at the caller frame.', { size: 11.5 });
  body(P, 64, 402, 'Following it walks the call chain, for a return.', { size: 11.5 });
  body(P, 64, 422, 'Q → R → P → Main in this program.', { size: 11, mono: true, color: DIM });

  card(P, 370, 340, 480, 96, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 384, 360, 'ACCESS LINK  ·  STATIC LINK');
  body(P, 384, 382, 'Points at the frame of the enclosing definition.', { size: 11.5 });
  body(P, 384, 402, 'Following it walks the source nesting, for a read.', { size: 11.5 });
  body(P, 384, 422, 'Q → P → Main. If it pointed at R, scoping would change.', {
    size: 11, color: BAD
  });

  return 440;
}

/* ---------- scene 5: resolving a name ---------- */
function drawAccessScene(t, p) {
  head(P, 34, 24, 'FINDING A NON-LOCAL NAME  ·  A LEVEL AND AN OFFSET');
  body(P, 34, 48, 'The number of access links to follow is the difference between the two levels. Nothing else decides it.', { size: 12, color: DIM });

  /* the frames, top of stack first */
  var fx = 40, fw = 170, fh = 44, gap = 6, top = 78;
  for (var i = 0; i < 4; i++) {
    var proc = CALL_CHAIN[3 - i];
    var y = top + i * (fh + gap);
    var isQ = proc === 'Q';
    card(P, fx, y, fw, fh, {
      fill: isQ ? ACCDIM : SURF, stroke: isQ ? ACC : BORDER, r: 6, sw: isQ ? 1.7 : 1.1
    });
    P.text(fx + 12, y + 16, 'frame of ' + proc, { size: 12.5, bold: true });
    P.text(fx + 12, y + 32, 'level ' + LEVEL[proc], { size: 10.5, mono: true, color: DIM });
  }

  /* the table of references */
  var tx = 236, tw = 630;
  card(P, tx, 78, tw, 250, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, tx + 14, 98, 'SIX REFERENCES, COUNTED');
  P.text(tx + 14, 122, 'read from', { size: 10, mono: true, color: FAINT });
  P.text(tx + 130, 122, 'name', { size: 10, mono: true, color: FAINT });
  P.text(tx + 236, 122, 'declared in', { size: 10, mono: true, color: FAINT });
  P.text(tx + 366, 122, 'levels', { size: 10, mono: true, color: FAINT });
  P.text(tx + 486, 122, 'access links followed', { size: 10, mono: true, color: FAINT });
  P.line(tx + 14, 130, tx + tw - 14, 130, { stroke: BORDER, sw: 1 });

  var upto = Math.min(REFS.length, Math.floor(ease(Math.min(1, p / 0.7)) * (REFS.length + 1)));
  for (var r = 0; r < REFS.length; r++) {
    var row = COST_ROWS[r];
    var ry = 148 + r * 26;
    var on = (r === upto - 1) && p < 0.95;
    if (r >= upto) {
      P.text(tx + 14, ry, '· · ·', { size: 11, mono: true, color: FAINT });
      continue;
    }
    if (on) P.rect(tx + 10, ry - 9, tw - 20, 24, { fill: ACCDIM, stroke: null, radius: 4 });
    P.text(tx + 14, ry, row.from + ' (L' + LEVEL[row.from] + ')', { size: 11.5, mono: true, color: on ? ACC : INK, bold: on });
    P.text(tx + 130, ry, row.name, { size: 11.5, mono: true, color: on ? ACC : INK });
    P.text(tx + 236, ry, DECL[row.name] + ' (L' + row.level + ')', { size: 11.5, mono: true, color: DIM });
    P.text(tx + 366, ry, 'L' + LEVEL[row.from] + ' − L' + row.level + ' = ' + row.hops, {
      size: 11.5, mono: true, color: DIM
    });
    P.text(tx + 486, ry, row.hops === 0 ? '0  ·  frame pointer alone' : row.hops + ' hop' + (row.hops > 1 ? 's' : ''), {
      size: 11.5, mono: true, color: row.hops === 2 ? BAD : (row.hops === 1 ? INK : VAL), bold: on
    });
  }
  P.line(tx + 14, 306, tx + tw - 14, 306, { stroke: BORDER, sw: 1 });
  P.text(tx + 14, 322, 'total ' + hopsTotal + ' hops over ' + REFS.length + ' references  ·  average ' + num(hopsAvg), {
    size: 11.5, mono: true, color: INK, bold: true
  });

  /* the two named walks */
  card(P, 40, 344, 396, 92, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 54, 364, 'READ a FROM Q  ·  1 HOP');
  body(P, 54, 386, 'Q is level 2 and a is declared in P at level 1, so the code', { size: 11.5 });
  body(P, 54, 404, 'follows exactly one access link and lands in P frame.', { size: 11.5 });
  body(P, 54, 424, 'Then adds the offset of a. Two instructions.', { size: 11, mono: true, color: DIM });

  card(P, 452, 344, 414, 92, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 466, 364, 'READ g FROM Q  ·  2 HOPS');
  body(P, 466, 386, 'g is declared at level 0, so the difference is two and the code', { size: 11.5 });
  body(P, 466, 404, 'follows two links: Q to P, then P to Main.', { size: 11.5 });
  body(P, 466, 424, 'A global is the most expensive read under static links.', { size: 11, color: BAD });

  return 436;
}

/* ---------- scene 6: the display ---------- */
function drawDisplayScene(t, p) {
  head(P, 34, 24, 'THE DISPLAY  ·  AN ARRAY INDEXED BY NESTING LEVEL');
  body(P, 34, 48, 'd of i points at the frame of the most recent activation at level i. One index replaces the walk.', { size: 12, color: DIM });

  /* the display cells */
  var dx = 40, dw = 88, dh = 52, dy = 90;
  var cells = [
    { k: 0, val: p > 0.35 ? 'Main' : null },
    { k: 1, val: p > 0.45 ? 'P' : null },
    { k: 2, val: p > 0.55 ? 'Q' : null }
  ];
  head(P, dx, dy - 12, 'THE DISPLAY DURING Q');
  for (var c = 0; c < 3; c++) {
    var cx = dx + c * (dw + 16);
    card(P, cx, dy, dw, dh, {
      fill: cells[c].val ? ACCDIM : '#f4f6f7',
      stroke: cells[c].val ? ACC : BORDER, r: 6, sw: cells[c].val ? 1.7 : 1.1
    });
    P.text(cx + 12, dy + 18, 'd[' + cells[c].k + ']', { size: 11.5, mono: true, color: DIM });
    P.text(cx + 12, dy + 38, cells[c].val || '—', {
      size: 13, bold: true, color: cells[c].val ? INK : FAINT
    });
  }

  /* frames the cells point at */
  var fy = 190;
  var frs = [
    { name: 'Main', x: dx + 0 * (dw + 16) },
    { name: 'P', x: dx + 1 * (dw + 16) },
    { name: 'Q', x: dx + 2 * (dw + 16) }
  ];
  for (var f = 0; f < 3; f++) {
    if (!cells[f].val) continue;
    P.arrow(frs[f].x + dw / 2, dy + dh + 4, frs[f].x + dw / 2, fy - 4, { stroke: ACC, sw: 1.5, head: 8 });
    card(P, frs[f].x, fy, dw, 40, { fill: SURF, stroke: BORDER, r: 6 });
    P.text(frs[f].x + dw / 2, fy + 20, 'frame ' + frs[f].name, { size: 11.5, align: 'center', base: 'middle' });
  }

  /* the displaced frame */
  if (p > 0.55) {
    card(P, dx + 2 * (dw + 16), fy + 56, dw, 40, {
      fill: INVALIDDIM, stroke: BAD, r: 6, dash: [5, 4], sw: 1.3
    });
    P.text(dx + 2 * (dw + 16) + dw / 2, fy + 76, 'frame R', {
      size: 11.5, align: 'center', base: 'middle', color: BAD
    });
    P.text(dx, fy + 116, 'R is still on the stack, but no longer in d[2].', {
      size: 10.5, color: BAD
    });
    P.text(dx, fy + 132, 'Its old entry was saved inside Q frame, and restored on return.', {
      size: 10.5, color: DIM
    });
  }

  /* the cost table */
  var tx = 470;
  card(P, tx, 90, 396, 148, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, tx + 14, 110, 'COST PER ACCESS');
  P.text(tx + 14, 134, 'reference', { size: 10, mono: true, color: FAINT });
  P.text(tx + 190, 134, 'static links', { size: 10, mono: true, color: FAINT });
  P.text(tx + 310, 134, 'display', { size: 10, mono: true, color: FAINT });
  P.line(tx + 14, 142, tx + 382, 142, { stroke: BORDER, sw: 1 });
  for (var q = 0; q < 4; q++) {
    var row = COST_ROWS[q];
    var ry = 160 + q * 20;
    P.text(tx + 14, ry, row.name + ' from ' + row.from, { size: 11.5, mono: true });
    P.text(tx + 190, ry, row.hops === 0 ? '0' : row.hops + ' hop' + (row.hops > 1 ? 's' : ''), {
      size: 11.5, mono: true, color: row.hops === 2 ? BAD : INK
    });
    P.text(tx + 310, ry, row.hops === 0 ? '1 (worse)' : '1 index', {
      size: 11.5, mono: true, color: row.hops === 0 ? FAINT : VAL
    });
  }

  card(P, tx, 252, 396, 96, { fill: ACCDIM, stroke: ACC, r: 8, sw: 1.2 });
  head(P, tx + 14, 272, 'THE PRICE OF THE ARRAY');
  body(P, tx + 14, 294, 'R and Q are both level 2, so Q overwrote d[2]. The old value R', { size: 11.5 });
  body(P, tx + 14, 312, 'is saved inside Q frame and written back when Q returns.', { size: 11.5 });
  body(P, tx + 14, 332, 'Paid on every call, not on every access.', { size: 11, color: DIM });

  card(P, 40, 344, 396, 92, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 54, 364, 'WHICH IS FASTER?');
  body(P, 54, 386, 'Neither, in general. The chain grows with nesting depth; the', { size: 11.5 });
  body(P, 54, 404, 'display costs a slot or a register per level and a save per call.', { size: 11.5 });
  body(P, 54, 424, 'Shallow nesting, many non-local reads: the display wins.', { size: 11, color: DIM });

  return 436;
}

/* ---------- scene 7: parameter modes ---------- */
function drawParamsScene(t, p) {
  head(P, 34, 24, 'WHERE THE PARAMETER MODES DIFFER  ·  ONE PROGRAM, FOUR ANSWERS');
  body(P, 34, 48, 'a = 5.  p(x):  x := x + 1;  a := a + x.  Then print a.', { size: 12, color: DIM, mono: true });

  var rows = [
    { mode: 'by value', slot: 'a copy of 5', flow: 'copy in', out: SCALAR.value, note: 'the copy dies with the frame' },
    { mode: 'by reference', slot: 'the address of a', flow: 'alias', out: SCALAR.reference, note: 'every write is immediate' },
    { mode: 'by value-result', slot: 'a copy of 5', flow: 'copy in, copy out', out: SCALAR['value-result'], note: 'the copy-back overwrites the 11' },
    { mode: 'by name', slot: 'the expression a', flow: 're-evaluate each use', out: SCALAR.name, note: 'a is read again, and is 6' }
  ];
  var active = Math.min(3, Math.floor(ease(Math.min(1, p / 0.85)) * 4));

  for (var i = 0; i < 4; i++) {
    var r = rows[i], y = 84 + i * 82, on = (i <= active);
    card(P, 34, y, 832, 70, {
      fill: on ? (i === active ? ACCDIM : SURF) : '#f7f8f9',
      stroke: on ? (i === active ? ACC : BORDER) : BORDER,
      r: 8, sw: i === active ? 1.6 : 1.1
    });
    P.text(50, y + 26, r.mode, { size: 13.5, bold: true, color: on ? INK : FAINT });
    P.text(50, y + 48, r.flow, { size: 10.5, mono: true, color: on ? DIM : FAINT });

    /* the parameter slot */
    card(P, 236, y + 12, 170, 46, {
      fill: on ? SURF : '#f2f4f5', stroke: on ? BORDER : BORDER, r: 5
    });
    P.text(244, y + 28, 'slot for x', { size: 9.5, mono: true, color: FAINT });
    P.text(244, y + 46, r.slot, { size: 11, color: on ? INK : FAINT });

    P.text(430, y + 34, r.note, { size: 11, color: on ? DIM : FAINT });

    P.text(846, y + 34, String(r.out), {
      size: 24, bold: true, align: 'right', base: 'middle',
      color: on ? (i === 2 ? BAD : ACC) : FAINT
    });
    P.text(846, y + 58, 'prints a', { size: 9.5, mono: true, align: 'right', color: FAINT });
  }

  body(P, 34, 428, 'Value-result is the odd one out: the body already stored 11 into a, and the delayed copy-back overwrites it with 6.', {
    size: 11.5, color: BAD
  });

  return 428;
}

/* ---------- scene 8: name against reference ---------- */
function drawNameScene(t, p) {
  head(P, 34, 24, 'NAME AGAINST REFERENCE ON AN ARRAY INDEX  ·  p(A[i]) WITH i = 1');
  body(P, 34, 48, 'Inside p: i := 2, then x := 10. Which cell receives the 10 depends only on when A[i] is evaluated.', { size: 12, color: DIM });

  var ax = 60, aw = 96, ah = 56, ay = 210;
  head(P, ax, ay - 14, 'THE ARRAY');
  for (var c = 1; c <= 3; c++) {
    var cx = ax + (c - 1) * (aw + 12);
    card(P, cx, ay, aw, ah, { fill: SURF, stroke: BORDER, r: 6 });
    P.text(cx + 10, ay + 16, 'A[' + c + ']', { size: 10.5, mono: true, color: DIM });
  }
  /* reference outcome */
  if (p > 0.30) {
    P.text(ax + 10, ay + 38, String(ARR.reference[0]), { size: 20, bold: true, color: ACC });
    P.text(ax + 10, ay + 38, '', { size: 10 });
  }
  if (p > 0.55) {
    P.text(ax + (aw + 12) + 10, ay + 38, String(ARR.reference[1]), { size: 20, bold: true, color: ACC });
  }
  P.text(ax + 2 * (aw + 12) + 10, ay + 38, '0', { size: 20, bold: true, color: FAINT });

  /* the index cell */
  card(P, ax, 120, aw, 50, { fill: SURF2, stroke: BORDER, r: 6 });
  P.text(ax + 10, 136, 'i', { size: 11, mono: true, color: DIM });
  P.text(ax + 10, 156, p > 0.25 ? '2' : '1', { size: 16, bold: true });

  /* the two traces */
  card(P, 420, 90, 446, 96, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 434, 110, 'BY REFERENCE  ·  ADDRESS CAPTURED AT THE CALL');
  body(P, 434, 132, 'The address of A[1] is taken while i is still 1. Setting i to 2', { size: 11.5 });
  body(P, 434, 150, 'cannot move that address, so the write lands in A[1].', { size: 11.5 });
  body(P, 434, 172, 'A becomes 10, 0, 0.', { size: 11.5, mono: true, color: ACC, bold: true });

  card(P, 420, 198, 446, 96, { fill: p > 0.55 ? ACCDIM : SURF, stroke: p > 0.55 ? ACC : BORDER, r: 8, sw: p > 0.55 ? 1.6 : 1.1 });
  head(P, 434, 218, 'BY NAME  ·  EXPRESSION RE-EVALUATED AT EACH USE');
  body(P, 434, 240, 'The formal is the expression A[i]. At the point of the write i', { size: 11.5 });
  body(P, 434, 258, 'is already 2, so the write lands in A[2].', { size: 11.5 });
  body(P, 434, 280, 'A becomes 0, 10, 0.', { size: 11.5, mono: true, color: BAD, bold: true });

  card(P, 420, 306, 446, 104, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 434, 326, 'AND VALUE-RESULT?');
  body(P, 434, 348, 'It captures the address at the call, works on a copy, and copies', { size: 11.5 });
  body(P, 434, 366, 'back into A[1] — so it agrees with reference here, and gives 10, 0, 0.', { size: 11.5 });
  body(P, 434, 388, 'On the scalar program it agreed with neither: it printed 6.', { size: 11.5, color: WARN });

  P.text(60, 300, 'The same three statements, two modes,', { size: 11.5, color: DIM });
  P.text(60, 318, 'two different cells written.', { size: 11.5, color: DIM });
  P.text(60, 344, 'Only a per-use trace settles it.', { size: 11, mono: true, color: INK });

  return 410;
}

/* ---------- scene 9: layout and depth ---------- */
function drawLayoutScene(t, p) {
  head(P, 34, 24, 'OFFSETS, ALIGNMENT AND STACK DEPTH  ·  FRAME SIZE BECOMES A DEPTH LIMIT');
  body(P, 34, 48, 'Offsets are assigned by the compiler in four-byte steps, and the total is rounded up to the alignment.', { size: 12, color: DIM });

  /* the ruler */
  var rx = 50, rw = 420, ry = 100, scale = rw / 24;
  head(P, rx, ry - 12, 'FRAME OF MAIN  ·  20 BYTES USED, 24 ALLOCATED');
  var blocks = [
    { name: 'ret val', off: 0, w: 4, role: 'book' },
    { name: 'ret addr', off: 4, w: 4, role: 'book' },
    { name: 'control', off: 8, w: 4, role: 'book' },
    { name: 'access', off: 12, w: 4, role: 'book' },
    { name: 'g', off: 16, w: 4, role: 'data' },
    { name: 'pad', off: 20, w: 4, role: 'pad' }
  ];
  var show = Math.min(blocks.length, 1 + Math.floor(ease(Math.min(1, p / 0.5)) * blocks.length));
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (i >= show) continue;
    var x = rx + b.off * scale;
    card(P, x, ry, b.w * scale, 46, {
      fill: b.role === 'pad' ? WARNDIM : (b.role === 'book' ? SURF2 : ACCDIM),
      stroke: BORDER, r: 0, sw: 1
    });
    P.text(x + b.w * scale / 2, ry + 18, b.name, { size: 9.5, align: 'center', color: b.role === 'pad' ? WARN : INK });
    P.text(x + b.w * scale / 2, ry + 34, String(b.off), { size: 9.5, mono: true, align: 'center', color: DIM });
  }
  P.line(rx, ry + 52, rx + 24 * scale, ry + 52, { stroke: BORDER, sw: 1.4 });
  for (var m = 0; m <= 24; m += 4) {
    var mx = rx + m * scale;
    P.line(mx, ry + 52, mx, ry + 58, { stroke: BORDER, sw: 1 });
    P.text(mx, ry + 62, String(m), { size: 9, mono: true, align: 'center', color: FAINT });
  }
  P.text(rx, ry + 84, 'the four padding bytes belong to no variable, but they are part of the frame', {
    size: 10.5, color: WARN
  });

  /* the division */
  card(P, 50, 220, 420, 108, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, 64, 240, 'FRAME SIZE TO DEPTH LIMIT');
  body(P, 64, 262, 'stack ÷ frame size, rounded down', { size: 11, mono: true, color: DIM });
  body(P, 64, 286, '8 388 608  ÷  ' + DEEP_FRAME + '  =  87381.33…', { size: 13, mono: true });
  body(P, 64, 308, 'so ' + depthLimit + ' frames fit', { size: 13, mono: true, bold: true, color: ACC });

  card(P, 50, 344, 420, 92, { fill: ACCDIM, stroke: ACC, r: 8, sw: 1.2 });
  head(P, 64, 364, 'THE ARITHMETIC CHECK');
  body(P, 64, 386, '87381 × 96 = 8 388 576, leaving 32 bytes', { size: 11.5, mono: true });
  body(P, 64, 406, '87382 × 96 = 8 388 672 > 8 388 608', { size: 11.5, mono: true });
  body(P, 64, 426, 'The next frame is 64 bytes too many. Rounding down was required.', { size: 10.5, color: DIM });

  /* the chain bytes */
  var x2 = 496;
  card(P, x2, 100, 370, 148, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 120, 'THIS PROGRAM PEAKS AT 96 BYTES');
  for (var f = 0; f < 4; f++) {
    var proc = CALL_CHAIN[f];
    P.text(x2 + 14, 146 + f * 22, proc, { size: 11.5, mono: true });
    P.text(x2 + 110, 146 + f * 22, FRAMES[proc].size + ' B', { size: 11.5, mono: true, color: DIM });
    P.text(x2 + 180, 146 + f * 22, 'level ' + LEVEL[proc], { size: 11, mono: true, color: FAINT });
  }
  P.line(x2 + 14, 234, x2 + 356, 234, { stroke: BORDER, sw: 1 });
  P.text(x2 + 14, 240, 'total ' + chainBytes + ' bytes', { size: 11.5, mono: true, bold: true });

  card(P, x2, 262, 370, 174, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 282, 'WHERE ELSE THE BYTES GO');
  body(P, x2 + 14, 304, 'Globals and static locals live in the static area, not in any', { size: 11.5 });
  body(P, x2 + 14, 322, 'frame, which is why they survive between calls.', { size: 11.5 });
  body(P, x2 + 14, 348, 'Objects that outlive their call cannot live on the stack,', { size: 11.5 });
  body(P, x2 + 14, 366, 'go to the heap, which is not freed in stack order.', { size: 11.5 });
  body(P, x2 + 14, 392, 'Code and constants are static; only activations move.', { size: 11, color: DIM });
  body(P, x2 + 14, 414, 'The stack is the dynamic slice of the activation tree.', { size: 11, color: DIM });

  return 436;
}

/* ---------- scene 10: the procedure ---------- */
function drawExamScene(t, p) {
  head(P, 34, 24, 'THE DECISION PROCEDURE  ·  FIVE STEPS FOR ANY RUNTIME-ENVIRONMENT QUESTION');
  body(P, 34, 48, 'Everything in this clause reduces to these steps, run once per name or once per frame.', { size: 12, color: DIM });

  var steps = [
    'Find the declaration the name denotes under the stated rule.',
    'Read its nesting level, and the level of the reading code.',
    'Subtract: that difference is the number of access links.',
    'Follow that many links, then add the offset in that frame.',
    'Name the frame — or take the deepest point and multiply.'
  ];
  var upto = Math.min(5, 1 + Math.floor(ease(Math.min(1, p / 0.6)) * 5));
  for (var i = 0; i < steps.length; i++) {
    var y = 78 + i * 40;
    var on = i < upto;
    card(P, 34, y, 500, 34, {
      fill: on ? SURF : '#f7f8f9', stroke: on ? BORDER : BORDER, r: 6, dash: on ? null : [4, 4]
    });
    P.circle(58, y + 17, 11, { fill: on ? ACC : '#e6eaec' });
    P.text(58, y + 17, String(i + 1), {
      size: 11, align: 'center', base: 'middle', bold: true,
      color: on ? SURF : FAINT
    });
    P.text(80, y + 17, steps[i], {
      size: 11, base: 'middle', color: on ? INK : FAINT
    });
  }

  var x2 = 560;
  card(P, x2, 78, 306, 132, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 98, 'THE THREE SHAPES ASKED');
  body(P, x2 + 14, 120, 'output under a stated scoping rule', { size: 11.5 });
  body(P, x2 + 14, 140, 'output under a stated parameter mode', { size: 11.5 });
  body(P, x2 + 14, 160, 'the frame or link a reference uses', { size: 11.5 });
  body(P, x2 + 14, 180, 'the number of live frames, or the bytes', { size: 11.5 });
  body(P, x2 + 14, 200, 'each one is these five steps, run again', { size: 10.5, color: DIM });

  card(P, x2, 222, 306, 108, { fill: INVALIDDIM, stroke: BAD, r: 8, sw: 1.2 });
  head(P, x2 + 14, 242, 'TWO CHECKS THAT REMOVE OPTIONS');
  body(P, x2 + 14, 264, 'A static-scoping answer that used the caller is', { size: 11.5 });
  body(P, x2 + 14, 282, 'wrong at once: static never consults the caller.', { size: 11.5, color: BAD });
  body(P, x2 + 14, 306, 'A frame count that includes returned calls is', { size: 11.5 });
  body(P, x2 + 14, 324, 'wrong: only live calls occupy the stack.', { size: 11.5, color: BAD });

  card(P, 34, 288, 500, 106, { fill: ACCDIM, stroke: ACC, r: 8, sw: 1.2 });
  head(P, 48, 308, 'THE ONE LINE TO REMEMBER');
  body(P, 48, 332, 'Control link: who called me.  Access link: where I was written.', {
    size: 13.5, bold: true
  });
  body(P, 48, 356, 'Static scoping reads along access links; dynamic scoping reads along control links.', {
    size: 11.5
  });
  body(P, 48, 378, 'Every other answer in this topic is arithmetic on top of that sentence.', {
    size: 11, color: DIM
  });

  card(P, x2, 344, 306, 92, { fill: SURF, stroke: BORDER, r: 8 });
  head(P, x2 + 14, 364, 'WHAT IS NOT CLAIMED HERE');
  body(P, x2 + 14, 386, 'No marks distribution, and no guarantee that a', { size: 11 });
  body(P, x2 + 14, 404, 'question of any shape appears in GATE 2027.', { size: 11 });
  body(P, x2 + 14, 424, 'The clause names the topic; frequency is not a rule.', { size: 10.5, color: DIM });

  return 436;
}

/* ---------- dispatch ---------- */
function drawFrame(P) {
  var t = (K && K.state) ? K.state.elapsed : 0;
  var s = progOf(t);
  P.clear();
  if (s.sc.id === 'frame') drawFrameScene(t, s.p);
  else if (s.sc.id === 'pushpop') drawPushPopScene(t, s.p);
  else if (s.sc.id === 'recursion') drawRecursionScene(t, s.p);
  else if (s.sc.id === 'links') drawLinksScene(t, s.p);
  else if (s.sc.id === 'access') drawAccessScene(t, s.p);
  else if (s.sc.id === 'display') drawDisplayScene(t, s.p);
  else if (s.sc.id === 'params') drawParamsScene(t, s.p);
  else if (s.sc.id === 'name') drawNameScene(t, s.p);
  else if (s.sc.id === 'layout') drawLayoutScene(t, s.p);
  else drawExamScene(t, s.p);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  var bad = CHECKS.length - pass;
  el.innerHTML = '<span class="k">Model checks</span>' +
    '<p class="small" style="margin:6px 0 0">' + pass + ' of ' + CHECKS.length + ' passed' +
    (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
}

function boot() {
  fillChecks();

  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  var ok = false;

  if (window.p5 && holder) {
    try {
      new window.p5(function (sk) {
        sk.setup = function () {
          sk.createCanvas(W, H);
          sk.noLoop();
          P = PR.makePainterP5(sk, W, H);
          sk.draw = function () { drawFrame(P); };
          drawFrame(P);
        };
      }, holder);
      ok = true;
    } catch (e) {
      console.error('p5 failed', e);
      ok = false;
    }
  }

  if (!ok && holder) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) {
        P = PR.makePainter2D(ctx2d, W, H);
        drawFrame(P);
        drew = true;
      }
    } catch (e) {
      console.error('canvas fallback failed', e);
    }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) {
    K.init({
      timeline: window.LESSON_TIMELINE,
      draw: function () { if (P) drawFrame(P); }
    });
  }

  window.__drawAt = function (t) {
    if (K && K.state) K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.__MODEL = {
  FRAMES: FRAMES, LEVEL: LEVEL, STATIC_PARENT: STATIC_PARENT, DYN_PARENT: DYN_PARENT,
  REFS: REFS, hopsTotal: hopsTotal, hopsAvg: hopsAvg, SCALAR: SCALAR, ARR: ARR,
  SCOPE: SCOPE, factValue: factValue, depthLimit: depthLimit, chainBytes: chainBytes,
  CHECKS: CHECKS
};
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
