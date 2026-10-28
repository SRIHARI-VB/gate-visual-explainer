/* ==========================================================================
   spatial-aptitude — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model works on integer grid cells, so every symmetry test is an equality
   of sets and not a tolerance. The fold model keeps, for every visible cell, the
   list of original cells stacked on it, so "holes equals punches times layers"
   is checked by construction. The cube-net model rolls a real cube across the
   net; the count of eleven nets is reproduced by enumerating all thirty-five
   free hexominoes, not quoted.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = (PR && PR.PAL) ? PR.PAL : {
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
  var BADDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 0 - grid geometry
   A cell is a pair [x, y] with y growing downwards, the way a canvas counts.
   ====================================================================== */

function cellKey(c) { return c[0] + ',' + c[1]; }

function cellSet(cells) {
  var s = {};
  for (var i = 0; i < cells.length; i++) s[cellKey(cells[i])] = true;
  return s;
}

function setKey(cells) {
  var ks = cells.map(cellKey).sort();
  return ks.join(';');
}

function bbox(cells) {
  var mx = Infinity, my = Infinity, Mx = -Infinity, My = -Infinity;
  for (var i = 0; i < cells.length; i++) {
    var x = cells[i][0], y = cells[i][1];
    if (x < mx) mx = x; if (x > Mx) Mx = x;
    if (y < my) my = y; if (y > My) My = y;
  }
  return { x: mx, y: my, w: Mx - mx + 1, h: My - my + 1 };
}

/* move a cell set so its bounding box starts at the origin */
function normalise(cells) {
  var b = bbox(cells);
  return cells.map(function (c) { return [c[0] - b.x, c[1] - b.y]; });
}

/* the eight operations that can map a square onto itself.
   Each takes a cell and the box it lives in. */
var OPS = [
  { id: 'id',  name: 'do nothing',       kind: 'rot', f: function (c) { return [c[0], c[1]]; } },
  { id: 'r90', name: 'quarter turn',     kind: 'rot', f: function (c, w, h) { return [h - 1 - c[1], c[0]]; } },
  { id: 'r180', name: 'half turn',       kind: 'rot', f: function (c, w, h) { return [w - 1 - c[0], h - 1 - c[1]]; } },
  { id: 'r270', name: 'three-quarter',   kind: 'rot', f: function (c, w, h) { return [c[1], w - 1 - c[0]]; } },
  { id: 'mv',  name: 'vertical mirror',  kind: 'ref', f: function (c, w, h) { return [w - 1 - c[0], c[1]]; } },
  { id: 'mh',  name: 'horizontal mirror', kind: 'ref', f: function (c, w, h) { return [c[0], h - 1 - c[1]]; } },
  { id: 'md',  name: 'diagonal mirror',  kind: 'ref', f: function (c, w, h) { return [c[1], c[0]]; } },
  { id: 'ma',  name: 'anti-diagonal',    kind: 'ref', f: function (c, w, h) { return [w - 1 - c[1], h - 1 - c[0]]; } }
];

function applyOp(op, cells) {
  var b = bbox(cells);
  return normalise(cells.map(function (c) { return op.f(c, b.w, b.h); }));
}

/* the image of one point under one operation, in a box of side n */
function opPoint(op, p, n) { return op.f(p, n, n); }

/* which of the eight operations is the composite "first g, then f" */
function identify(fn, n) {
  var probes = [[0, 0], [1, 0], [0, 1], [1, 1], [2, 3]];
  for (var i = 0; i < OPS.length; i++) {
    var ok = true;
    for (var j = 0; j < probes.length; j++) {
      var a = fn(probes[j]);
      var b = opPoint(OPS[i], probes[j], n);
      if (a[0] !== b[0] || a[1] !== b[1]) { ok = false; break; }
    }
    if (ok) return OPS[i].id;
  }
  return null;
}

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var V = {};

/* ---- 1a. the multiplication table of the eight operations ---- */
V.table = (function () {
  var n = 100, rows = [], missing = [];
  for (var i = 0; i < OPS.length; i++) {
    var row = [];
    for (var j = 0; j < OPS.length; j++) {
      var f = OPS[i], g = OPS[j];
      var id = identify(function (p) { return opPoint(f, opPoint(g, p, n), n); }, n);
      if (!id) missing.push(f.id + ' after ' + g.id);
      row.push(id);
    }
    rows.push(row);
  }
  return { order: OPS.map(function (o) { return o.id; }), rows: rows, missing: missing };
})();

/* associativity, checked on every triple */
V.assoc = (function () {
  var bad = 0, t = V.table, idx = {};
  for (var i = 0; i < t.order.length; i++) idx[t.order[i]] = i;
  for (var a = 0; a < 8; a++) for (var b = 0; b < 8; b++) for (var c = 0; c < 8; c++) {
    var ab = idx[t.rows[a][b]], bc = idx[t.rows[b][c]];
    if (t.rows[ab][c] !== t.rows[a][bc]) bad++;
  }
  return { triples: 512, bad: bad };
})();

/* ---- 1b. order of operations: rotate then mirror, against mirror then rotate ---- */
V.order = (function () {
  var n = 2;
  var rot = OPS[1], mir = OPS[4];             /* quarter turn, vertical mirror */
  var p = [1, 0];
  var rm = opPoint(mir, opPoint(rot, p, n), n);
  var mr = opPoint(rot, opPoint(mir, p, n), n);
  return {
    start: p,
    rotateThenMirror: rm,
    mirrorThenRotate: mr,
    differ: rm[0] !== mr[0] || rm[1] !== mr[1]
  };
})();

/* ---- 1c. symmetry counts for six small shapes ---- */
function symmetryOf(cells) {
  var base = setKey(normalise(cells)), lines = 0, rots = 0, ids = [], images = {};
  for (var i = 0; i < OPS.length; i++) {
    var img = applyOp(OPS[i], cells);
    images[setKey(img)] = true;
    if (setKey(img) === base) {
      ids.push(OPS[i].id);
      if (OPS[i].kind === 'ref') lines++;
      else rots++;
    }
  }
  return {
    lines: lines, rots: rots, stab: lines + rots,
    orbit: Object.keys(images).length,
    ids: ids
  };
}

V.shapes = [
  { name: 'square',        cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { name: 'rectangle',     cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  { name: 'plus sign',     cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]] },
  { name: 'T tetromino',   cells: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
  { name: 'L tetromino',   cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { name: 'Z tetromino',   cells: [[0, 0], [1, 0], [1, 1], [2, 1]] }
];
V.shapes.forEach(function (s) {
  var r = symmetryOf(s.cells);
  s.lines = r.lines; s.rots = r.rots; s.stab = r.stab; s.orbit = r.orbit; s.ids = r.ids;
});

/* ---- 1d. folding: dimensions and layers ---- */
/* A fold is perpendicular to the current long edge, which is what the GATE
   2024 Set 1 question says. Dimensions are continuous, so a half of 5 is 2.5. */
function foldSequence(w0, h0, folds) {
  var w = w0, h = h0, layers = 1, steps = [{ w: w, h: h, layers: layers, axis: '-' }];
  for (var i = 0; i < folds; i++) {
    var axis = (w >= h) ? 'vertical' : 'horizontal';
    if (axis === 'vertical') w = w / 2; else h = h / 2;
    layers *= 2;
    steps.push({ w: w, h: h, layers: layers, axis: axis });
  }
  return { steps: steps, w: w, h: h, layers: layers, area0: w0 * h0, area: w * h };
}
V.fold = foldSequence(20, 8, 3);
V.fold.perimeter = 2 * (V.fold.w + V.fold.h);

/* the careless version: the 20 side folded three times */
V.foldCareless = (function () {
  var w = 20, h = 8;
  for (var i = 0; i < 3; i++) w = w / 2;
  return { w: w, h: h, perimeter: 2 * (w + h) };
})();

/* ---- 1e. folding on a grid, with a stack of layers at every cell ---- */
/* stacks is a flat array of cell-id lists, row major, over the current box. */
function foldGrid(w, h, ops) {
  var stacks = [], cw = w, ch = h;
  for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) stacks.push([j * w + i]);
  for (var k = 0; k < ops.length; k++) {
    var axis = ops[k], half = Math.floor((axis === 'v' ? cw : ch) / 2), ns = [];
    if (axis === 'v') {
      for (var y = 0; y < ch; y++) for (var x = half; x < cw; x++) {
        ns.push(stacks[y * cw + x].concat(stacks[y * cw + (cw - 1 - x)]));
      }
      cw = cw - half;
    } else {
      for (var yy = half; yy < ch; yy++) for (var xx = 0; xx < cw; xx++) {
        ns.push(stacks[yy * cw + xx].concat(stacks[(ch - 1 - yy) * cw + xx]));
      }
      ch = ch - half;
    }
    stacks = ns;
  }
  return { stacks: stacks, w: cw, h: ch };
}

/* the worked punch example: a 4 by 4 sheet, folded in half twice, one punch */
V.punch = (function () {
  var g = foldGrid(4, 4, ['v', 'h']);
  var px = 0, py = 0;                       /* the punched cell of the folded box */
  var hit = g.stacks[py * g.w + px];
  var holes = hit.map(function (id) { return [id % 4, Math.floor(id / 4)]; });
  var all = [];
  for (var i = 0; i < g.stacks.length; i++) all = all.concat(g.stacks[i]);
  return {
    layers: g.stacks[0].length,
    foldedW: g.w, foldedH: g.h,
    punched: [px, py],
    holes: holes.sort(function (a, b) { return a[1] - b[1] || a[0] - b[0]; }),
    holesFromProduct: g.stacks[0].length,
    cellsKept: all.length,
    cellsDistinct: (function () { var s = {}; all.forEach(function (v) { s[v] = 1; }); return Object.keys(s).length; })()
  };
})();

/* ---- 1f. hexominoes and cube nets ---- */
var D4FREE = [
  function (c) { return [c[0], c[1]]; },
  function (c) { return [-c[1], c[0]]; },
  function (c) { return [-c[0], -c[1]]; },
  function (c) { return [c[1], -c[0]]; },
  function (c) { return [-c[0], c[1]]; },
  function (c) { return [c[0], -c[1]]; },
  function (c) { return [c[1], c[0]]; },
  function (c) { return [-c[1], -c[0]]; }
];

function freeKey(cells) {
  var best = null;
  for (var i = 0; i < D4FREE.length; i++) {
    var k = setKey(normalise(cells.map(D4FREE[i])));
    if (best === null || k < best) best = k;
  }
  return best;
}

function freePolyominoes(n) {
  var cur = {}, start = [[0, 0]];
  cur[setKey(normalise(start))] = start;
  for (var s = 1; s < n; s++) {
    var next = {};
    for (var kk in cur) {
      if (!Object.prototype.hasOwnProperty.call(cur, kk)) continue;
      var cells = cur[kk], seen = cellSet(cells);
      for (var i = 0; i < cells.length; i++) {
        var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (var d = 0; d < 4; d++) {
          var nx = cells[i][0] + dirs[d][0], ny = cells[i][1] + dirs[d][1];
          if (seen[nx + ',' + ny]) continue;
          var nc = normalise(cells.concat([[nx, ny]]));
          next[setKey(nc)] = nc;
        }
      }
    }
    cur = next;
  }
  var free = {};
  for (var k2 in cur) {
    if (!Object.prototype.hasOwnProperty.call(cur, k2)) continue;
    free[freeKey(cur[k2])] = cur[k2];
  }
  return Object.keys(free).map(function (k) { return free[k]; });
}

/* roll a cube across a polyomino. Orientation is which face label sits on each
   of the six sides: D down (on the paper), U up, E, W, N, S. */
var ROLL = {
  '1,0':  function (o) { return { D: o.E, U: o.W, E: o.U, W: o.D, N: o.N, S: o.S }; },
  '-1,0': function (o) { return { D: o.W, U: o.E, E: o.D, W: o.U, N: o.N, S: o.S }; },
  '0,1':  function (o) { return { D: o.S, U: o.N, E: o.E, W: o.W, N: o.D, S: o.U }; },
  '0,-1': function (o) { return { D: o.N, U: o.S, E: o.E, W: o.W, N: o.U, S: o.D }; }
};

function foldNet(cells) {
  var set = cellSet(cells), start = cells[0];
  var faces = {}, seen = {}, stack = [];
  var k0 = cellKey(start);
  faces[k0] = 0; seen[k0] = true;
  stack.push({ p: start, o: { D: 0, U: 1, E: 2, W: 3, N: 4, S: 5 } });
  var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (stack.length) {
    var s = stack.pop();
    for (var d = 0; d < 4; d++) {
      var np = [s.p[0] + dirs[d][0], s.p[1] + dirs[d][1]], k = cellKey(np);
      if (!set[k]) continue;
      var no = ROLL[dirs[d][0] + ',' + dirs[d][1]](s.o);
      if (seen[k]) { if (faces[k] !== no.D) return { ok: false, faces: faces }; continue; }
      seen[k] = true; faces[k] = no.D;
      stack.push({ p: np, o: no });
    }
  }
  var distinct = {}, n = 0;
  for (var kk in faces) { if (!Object.prototype.hasOwnProperty.call(faces, kk)) continue; if (!distinct[faces[kk]]) { distinct[faces[kk]] = 1; n++; } }
  return { ok: n === 6 && cells.length === 6, faces: faces, distinct: n };
}

V.nets = (function () {
  var hex = freePolyominoes(6), good = [];
  for (var i = 0; i < hex.length; i++) {
    var r = foldNet(hex[i]);
    if (r && r.ok) good.push({ cells: normalise(hex[i]), faces: r.faces });
  }
  return { hexominoes: hex.length, count: good.length, list: good };
})();

/* the net drawn on the canvas: four in a row with one above and one below */
V.demoNet = (function () {
  var cells = normalise([[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]]);
  var r = foldNet(cells);
  var byFace = {};
  for (var k in r.faces) { if (!Object.prototype.hasOwnProperty.call(r.faces, k)) continue; byFace[r.faces[k]] = k; }
  var pairs = [];
  for (var f = 0; f < 6; f++) {
    for (var g = f + 1; g < 6; g++) {
      /* faces f and g are opposite when their normals are negatives: here the
         labelling puts 0 opposite 1, 2 opposite 3, 4 opposite 5 by construction */
      if ((f === 0 && g === 1) || (f === 2 && g === 3) || (f === 4 && g === 5)) {
        pairs.push([byFace[f], byFace[g]]);
      }
    }
  }
  return { cells: cells, faces: r.faces, ok: r.ok, pairs: pairs };
})();

/* ---- 1g. minimum straight cuts in three dimensions ---- */
V.cuts = (function () {
  var rows = [];
  for (var c = 1; c <= 4; c++) {
    var best = null;
    for (var cx = 0; cx <= c; cx++) for (var cy = 0; cy <= c - cx; cy++) {
      var cz = c - cx - cy;
      var p = (cx + 1) * (cy + 1) * (cz + 1);
      if (!best || p > best.pieces) best = { pieces: p, cx: cx, cy: cy, cz: cz };
    }
    rows.push({ cuts: c, pieces: best.pieces, split: best });
  }
  var minFor8 = null;
  for (var i = 0; i < rows.length; i++) if (rows[i].pieces >= 8) { minFor8 = rows[i].cuts; break; }
  return { rows: rows, minFor8: minFor8 };
})();

/* ---- 1h. tiling: area and the chessboard colour count ---- */
V.tiling = (function () {
  var board = [], black = 0, white = 0;
  for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
    var dark = ((x + y) % 2 === 0);
    board.push({ x: x, y: y, dark: dark, gone: false });
    if (dark) black++; else white++;
  }
  /* remove two opposite corners: (0,0) and (7,7), both dark */
  var removed = 0;
  board.forEach(function (c) {
    if ((c.x === 0 && c.y === 0) || (c.x === 7 && c.y === 7)) { c.gone = true; removed++; }
  });
  var b2 = 0, w2 = 0;
  board.forEach(function (c) { if (c.gone) return; if (c.dark) b2++; else w2++; });
  return {
    board: board, full: { dark: black, light: white },
    removed: removed,
    after: { dark: b2, light: w2 },
    area: 64 - removed,
    areaDividesBy2: (64 - removed) % 2 === 0,
    coloursMatch: b2 === w2,
    adjacentRemoval: (function () {
      /* removing two adjacent corners leaves 31 and 31 */
      var d = black, w = white;
      /* (0,0) dark and (0,7) light */
      return { dark: d - 1, light: w - 1 };
    })()
  };
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

var CHECKS = [];
function check(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

check('the eight operations close: every composite is one of the eight',
  V.table.missing.length === 0, V.table.missing.join(', '));

check('the operation table is associative on all 512 triples',
  V.assoc.bad === 0, V.assoc.bad + ' bad');

check('rotating then mirroring differs from mirroring then rotating',
  V.order.differ, JSON.stringify(V.order.rotateThenMirror) + ' vs ' + JSON.stringify(V.order.mirrorThenRotate));

check('every operation is its own inverse or has one in the set',
  (function () {
    var idx = {}, t = V.table;
    for (var i = 0; i < t.order.length; i++) idx[t.order[i]] = i;
    for (var i2 = 0; i2 < 8; i2++) {
      var found = false;
      for (var j = 0; j < 8; j++) if (t.rows[i2][j] === 'id') found = true;
      if (!found) return false;
    }
    return true;
  })(), 'each row contains the identity');

V.shapes.forEach(function (s) {
  check('symmetry count for the ' + s.name + ': lines plus rotational order equals the stabiliser',
    s.stab === s.lines + s.rots, s.lines + ' + ' + s.rots + ' = ' + s.stab);
  check('orbit times stabiliser equals eight for the ' + s.name,
    s.orbit * s.stab === 8, s.orbit + ' x ' + s.stab);
  check('the identity is a symmetry of the ' + s.name,
    s.ids.indexOf('id') >= 0, s.ids.join(','));
});

check('a non-square rectangle has no diagonal mirror line',
  (function () {
    var r = V.shapes.filter(function (s) { return s.name === 'rectangle'; })[0];
    return r.ids.indexOf('md') < 0 && r.ids.indexOf('ma') < 0;
  })(), 'diagonals excluded');

check('the L tetromino is chiral: its only symmetry is the identity',
  (function () {
    var l = V.shapes.filter(function (s) { return s.name === 'L tetromino'; })[0];
    return l.stab === 1 && l.ids.length === 1 && l.ids[0] === 'id';
  })(), 'one symmetry');

check('the fold sequence gives 5 by 4 after three folds of a 20 by 8 sheet',
  V.fold.w === 5 && V.fold.h === 4, V.fold.w + ' x ' + V.fold.h);

check('the perimeter of the folded sheet is 18',
  V.fold.perimeter === 18, String(V.fold.perimeter));

check('the careless fold of the 20 side three times gives perimeter 21',
  V.foldCareless.perimeter === 21, V.foldCareless.w + ' x ' + V.foldCareless.h);

check('folding conserves area: original equals final times layers',
  V.fold.area0 === V.fold.area * V.fold.layers,
  V.fold.area0 + ' = ' + V.fold.area + ' x ' + V.fold.layers);

check('the long edge alternates: fold two halves the 20, fold three halves the 8',
  V.fold.steps[1].axis === 'vertical' && V.fold.steps[2].axis === 'vertical' && V.fold.steps[3].axis === 'horizontal',
  V.fold.steps.map(function (s) { return s.axis; }).join(','));

check('the 4 by 4 sheet folded twice has four layers',
  V.punch.layers === 4, String(V.punch.layers));

check('one punch makes four holes, equal to punches times layers',
  V.punch.holes.length === V.punch.holesFromProduct,
  V.punch.holes.length + ' holes, ' + V.punch.holesFromProduct + ' from the product');

check('folding loses no cell: sixteen cells, sixteen distinct, once each',
  V.punch.cellsKept === 16 && V.punch.cellsDistinct === 16,
  V.punch.cellsKept + ' kept, ' + V.punch.cellsDistinct + ' distinct');

check('the four holes are closed under both fold reflections',
  (function () {
    var s = {};
    V.punch.holes.forEach(function (c) { s[cellKey(c)] = 1; });
    var ok = true;
    V.punch.holes.forEach(function (c) {
      if (!s[(3 - c[0]) + ',' + c[1]]) ok = false;
      if (!s[c[0] + ',' + (3 - c[1])]) ok = false;
    });
    return ok;
  })(), 'reflected in both axes');

check('exactly 35 free hexominoes exist',
  V.nets.hexominoes === 35, String(V.nets.hexominoes));

check('exactly 11 of them fold into a cube',
  V.nets.count === 11, String(V.nets.count));

check('the drawn net folds with six distinct faces',
  V.demoNet.ok === true, JSON.stringify(V.demoNet.faces));

check('the drawn net has three opposite pairs covering all six faces',
  V.demoNet.pairs.length === 3, JSON.stringify(V.demoNet.pairs));

check('squares two steps apart in the drawn net are an opposite pair',
  (function () {
    /* the four cells of the middle row are at x = 0,1,2,3; x=0 and x=2 must be opposite */
    var f0 = V.demoNet.faces['0,1'], f2 = V.demoNet.faces['2,1'];
    var f1 = V.demoNet.faces['1,1'], f3 = V.demoNet.faces['3,1'];
    var opp = function (a, b) {
      return (a === 0 && b === 1) || (a === 1 && b === 0) ||
             (a === 2 && b === 3) || (a === 3 && b === 2) ||
             (a === 4 && b === 5) || (a === 5 && b === 4);
    };
    return opp(f0, f2) && opp(f1, f3);
  })(), 'x=0 opposite x=2, x=1 opposite x=3');

check('three cuts reach eight pieces and two cuts cannot',
  V.cuts.minFor8 === 3 && V.cuts.rows[1].pieces === 4, JSON.stringify(V.cuts.rows.map(function (r) { return r.pieces; })));

check('the piece formula is the product of each axis count plus one',
  (function () {
    return V.cuts.rows.every(function (r) {
      return r.pieces === (r.split.cx + 1) * (r.split.cy + 1) * (r.split.cz + 1);
    });
  })(), 'all rows agree');

check('the full 8 by 8 board has equal colours',
  V.tiling.full.dark === 32 && V.tiling.full.light === 32,
  V.tiling.full.dark + ' / ' + V.tiling.full.light);

check('removing two opposite corners leaves 30 and 32',
  V.tiling.after.dark === 30 && V.tiling.after.light === 32,
  V.tiling.after.dark + ' / ' + V.tiling.after.light);

check('the area still divides by two, so the area test alone is not enough',
  V.tiling.area === 62 && V.tiling.areaDividesBy2 && !V.tiling.coloursMatch,
  V.tiling.area + ' squares');

check('removing two adjacent corners would leave 31 and 31, which the colour test allows',
  V.tiling.adjacentRemoval.dark === 31 && V.tiling.adjacentRemoval.light === 31,
  '31 / 31');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

var FONT_S = '"IBM Plex Sans", system-ui, sans-serif';

function txt(x, y, s, o) {
  o = o || {};
  o.size = o.size || 13;
  P.text(x, y, s, o);
}

function chip(x, y, label, o) {
  o = o || {};
  var w = o.w || (label.length * 7.2 + 18), h = o.h || 26;
  P.rect(x, y, w, h, { fill: o.fill || ACCDIM, stroke: o.stroke || ACC, radius: 6, sw: 1.2 });
  txt(x + w / 2, y + h / 2, label, { size: o.size || 11.5, align: 'center', base: 'middle', color: o.color || ACC, bold: true, mono: true });
  return w;
}

/* draw a grid of cols x rows unit cells whose top-left corner is (x, y) */
function grid(x, y, cols, rows, cell, o) {
  o = o || {};
  var col = o.stroke || BORDER;
  for (var i = 0; i <= cols; i++) P.line(x + i * cell, y, x + i * cell, y + rows * cell, { stroke: col, sw: o.sw || 1 });
  for (var j = 0; j <= rows; j++) P.line(x, y + j * cell, x + cols * cell, y + j * cell, { stroke: col, sw: o.sw || 1 });
}

function fillCells(x, y, cell, cells, o) {
  o = o || {};
  for (var i = 0; i < cells.length; i++) {
    P.rect(x + cells[i][0] * cell, y + cells[i][1] * cell, cell, cell, {
      fill: o.fill || ACCDIM, stroke: o.stroke || ACC, radius: o.radius || 0, sw: o.sw || 1.2
    });
  }
}

function caption(x, y, s, o) {
  txt(x, y, s, Object.assign({ size: 12, color: DIM }, o || {}));
}

/* ---------- scene 1: what ---------- */
function drawWhat(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'One figure in, one figure out. Which operation happened in between?', { size: 15, bold: true });

  var base = V.shapes[4].cells;             /* the L tetromino */
  var rotated = applyOp(OPS[1], base);
  var mirrored = applyOp(OPS[4], base);

  var panels = [
    { x: 60,  cells: base,    label: 'the figure', sub: 'three corners read A B C clockwise' },
    { x: 340, cells: rotated, label: 'image one',  sub: 'still A B C clockwise' },
    { x: 620, cells: mirrored, label: 'image two', sub: 'now A C B clockwise' }
  ];
  var cell = 46, gy = 78;
  for (var i = 0; i < panels.length; i++) {
    var show = p > 0.06 * i;
    if (!show) continue;
    grid(panels[i].x, gy, 3, 3, cell, { stroke: SURF2 });
    fillCells(panels[i].x, gy, cell, panels[i].cells, {
      fill: i === 0 ? ACCDIM : (i === 1 ? ACCDIM : BADDIM),
      stroke: i === 0 ? ACC : (i === 1 ? ACC : BAD)
    });
    caption(panels[i].x, gy + 3 * cell + 20, panels[i].label, { size: 13, bold: true, color: INK });
    caption(panels[i].x, gy + 3 * cell + 38, panels[i].sub, { size: 11, color: i === 2 ? BAD : DIM });
  }

  if (p > 0.35) {
    var labels = ['TRANSLATION', 'ROTATION', 'SCALING', 'MIRRORING'];
    var cx = 60;
    for (var k = 0; k < labels.length; k++) {
      cx += chip(cx, 300, labels[k], { fill: k === 3 ? BADDIM : ACCDIM, stroke: k === 3 ? BAD : ACC, color: k === 3 ? BAD : ACC }) + 12;
    }
  }
  if (p > 0.55) {
    txt(60, 352, 'Two labels decide every one of these questions.', { size: 13, bold: true });
    txt(60, 376, '1. The clockwise order of three identifiable corners: preserved means a rotation, reversed means a mirror.', { size: 12, color: DIM });
    txt(60, 396, '2. A length, an area or a layer count: these separate a scaling from a rigid move, and a fold from a cut.', { size: 12, color: DIM });
  }
  if (p > 0.8) {
    txt(60, 428, 'Folding, cutting and patterns are the same four operations applied several times in order.', { size: 12, color: WARN });
  }
}

/* ---------- scene 2: rigid ---------- */
function drawRigid(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'Three operations keep the figure; one reverses it', { size: 15, bold: true });

  var base = V.shapes[4].cells;
  var scaled = base.map(function (c) { return [c[0] * 2, c[1] * 2]; });
  var moved = base.map(function (c) { return [c[0] + 3, c[1] + 2]; });

  var cols = [
    { x: 30,  cells: base,   t: 'original',    keep: '',                                  col: ACC, dim: ACCDIM },
    { x: 250, cells: moved,  t: 'translated',  keep: 'size yes, direction yes, place no', col: INFO, dim: ACCDIM },
    { x: 470, cells: applyOp(OPS[1], base), t: 'rotated 90', keep: 'size yes, direction no', col: INFO, dim: ACCDIM },
    { x: 690, cells: scaled, t: 'scaled x2',   keep: 'size no, angles yes',               col: WARN, dim: WARNDIM }
  ];
  var cell = 40, gy = 64;
  for (var i = 0; i < cols.length; i++) {
    if (p < 0.05 + 0.18 * i) continue;
    grid(cols[i].x, gy, 6, 5, cell, { stroke: SURF2 });
    fillCells(cols[i].x, gy, cell, cols[i].cells, { fill: cols[i].dim, stroke: cols[i].col });
    caption(cols[i].x, gy + 5 * cell + 18, cols[i].t, { size: 13, bold: true, color: INK });
    caption(cols[i].x, gy + 5 * cell + 36, cols[i].keep, { size: 10.5, color: cols[i].col });
  }

  if (p > 0.72) {
    P.rect(30, 356, 840, 84, { fill: SURF2, stroke: BORDER, radius: 8 });
    txt(44, 368, 'The one property that separates them', { size: 12.5, bold: true, color: INK });
    txt(44, 392, 'Translation, rotation and scaling all preserve orientation: three corners read clockwise before and after.', { size: 12, color: DIM });
    txt(44, 412, 'A mirror reverses that order, and no rotation restores it. That is why the mirror is the operation this section turns on.', { size: 12, color: BAD });
  }
}

/* ---------- scene 3: mirror ---------- */
function drawMirror(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'Read three corners clockwise: rotation keeps the order, a mirror reverses it', { size: 15, bold: true });

  var base = [[0, 0], [0, 1], [0, 2], [1, 2]];
  var marks = [[0, 0], [1, 2], [0, 2]];        /* A, B, C in clockwise order */
  var rot = applyOp(OPS[1], base);
  var mir = applyOp(OPS[4], base);

  var groups = [
    { x: 30,  cells: base, t: 'original',  order: 'A B C clockwise',        col: INK },
    { x: 180, cells: rot,  t: 'rotated',   order: 'A B C clockwise',        col: VAL },
    { x: 330, cells: mir,  t: 'mirrored',  order: 'A C B clockwise',        col: BAD }
  ];
  var cell = 40, gy = 60;
  for (var i = 0; i < groups.length; i++) {
    if (p < 0.04 + 0.16 * i) continue;
    grid(groups[i].x, gy, 3, 3, cell, { stroke: SURF2 });
    fillCells(groups[i].x, gy, cell, groups[i].cells, { fill: SURF2, stroke: groups[i].col, sw: 1.4 });
    caption(groups[i].x, gy + 3 * cell + 18, groups[i].t, { size: 12.5, bold: true, color: INK });
    caption(groups[i].x, gy + 3 * cell + 35, groups[i].order, { size: 10.5, color: groups[i].col });
  }
  /* label the three marked corners of the original */
  if (p > 0.2) {
    var names = ['A', 'B', 'C'];
    for (var m = 0; m < marks.length; m++) {
      txt(30 + marks[m][0] * cell + cell / 2, gy + marks[m][1] * cell + cell / 2,
        names[m], { size: 13, bold: true, align: 'center', base: 'middle', color: ACC });
    }
  }

  if (p > 0.45) {
    txt(500, 60, 'Order of operations', { size: 13, bold: true });
    txt(500, 86, 'Start: the point one step right of centre, ' + JSON.stringify(V.order.start) + '.', { size: 11.5, color: DIM });
    txt(500, 110, 'Rotate a quarter turn, then mirror vertically:', { size: 11.5, color: DIM });
    txt(512, 130, 'lands at ' + JSON.stringify(V.order.rotateThenMirror), { size: 12.5, bold: true, color: BAD, mono: true });
    txt(500, 158, 'Mirror vertically first, then rotate:', { size: 11.5, color: DIM });
    txt(512, 178, 'lands at ' + JSON.stringify(V.order.mirrorThenRotate), { size: 12.5, bold: true, color: VAL, mono: true });
    txt(500, 206, V.order.differ ? 'Different answers from the same two moves.' : 'Same answer.', { size: 12, color: INK });
  }

  if (p > 0.66) {
    P.rect(30, 300, 840, 60, { fill: ACCDIM, stroke: ACC, radius: 8 });
    txt(44, 312, 'Eight operations keep a square in place: four rotations and four mirrors.', { size: 12.5, bold: true, color: ACC });
    txt(44, 336, 'The model composes all sixty-four pairs, checks every composite is again one of the eight, and checks associativity on 512 triples.', { size: 11.5, color: DIM });
  }
  if (p > 0.85) {
    P.rect(30, 372, 840, 62, { fill: BADDIM, stroke: BAD, radius: 8 });
    txt(44, 384, 'The L tetromino cannot be turned into its mirror image in the plane.', { size: 12.5, bold: true, color: BAD });
    txt(44, 408, 'Its only symmetry is the identity, so its mirror image is a different figure. A square is its own mirror image four times over.', { size: 11.5, color: DIM });
  }
}

/* ---------- scene 4: symmetry ---------- */
function drawSymmetry(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'Count the lines and the turns; then check the total', { size: 15, bold: true });

  var cell = 30, positions = [[40, 56], [320, 56], [600, 56], [40, 230], [320, 230], [600, 230]];
  for (var i = 0; i < V.shapes.length; i++) {
    var s = V.shapes[i], pos = positions[i];
    if (p < 0.04 + 0.13 * i) continue;
    var b = bbox(s.cells);
    grid(pos[0], pos[1], b.w, b.h, cell, { stroke: SURF2 });
    fillCells(pos[0], pos[1], cell, normalise(s.cells), { fill: ACCDIM, stroke: ACC });
    caption(pos[0], pos[1] + b.h * cell + 18, s.name, { size: 12.5, bold: true, color: INK });
    caption(pos[0], pos[1] + b.h * cell + 34,
      'lines ' + s.lines + '   turn order ' + s.rots + '   total ' + s.stab,
      { size: 10.5, color: s.stab === 1 ? BAD : ACC, mono: true });
  }

  /* draw the mirror lines of the square, which is the first shape */
  if (p > 0.4) {
    var sq = positions[0], w = 2 * cell;
    P.line(sq[0] + w / 2, sq[1] - 6, sq[0] + w / 2, sq[1] + w + 6, { stroke: INFO, sw: 1.4, dash: [5, 4] });
    P.line(sq[0] - 6, sq[1] + w / 2, sq[0] + w + 6, sq[1] + w / 2, { stroke: INFO, sw: 1.4, dash: [5, 4] });
    P.line(sq[0] - 4, sq[1] - 4, sq[0] + w + 4, sq[1] + w + 4, { stroke: INFO, sw: 1.2, dash: [3, 4] });
    P.line(sq[0] + w + 4, sq[1] - 4, sq[0] - 4, sq[1] + w + 4, { stroke: INFO, sw: 1.2, dash: [3, 4] });
  }

  if (p > 0.6) {
    P.rect(300, 372, 570, 62, { fill: SURF2, stroke: BORDER, radius: 8 });
    txt(314, 384, 'The check: lines plus turn order equals the eight operations that fix the shape.', { size: 11.5, bold: true, color: INK });
    txt(314, 406, 'Square: 4 + 4 = 8, so every operation fixes it. L tetromino: 0 + 1 = 1, identity only.', { size: 11, color: DIM });
    txt(314, 424, 'And orbit times stabiliser is always eight: the orbit-stabiliser identity for this group.', { size: 11, color: DIM });
  }
  if (p > 0.82) {
    P.rect(30, 372, 258, 62, { fill: WARNDIM, stroke: WARN, radius: 8 });
    txt(44, 384, 'A non-square rectangle', { size: 11.5, bold: true, color: WARN });
    txt(44, 404, 'has two lines, not four:', { size: 11, color: DIM });
    txt(44, 420, 'its diagonals are not mirror lines.', { size: 11, color: DIM });
  }
}

/* ---------- scene 5: fold ---------- */
function drawFold(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'A 20 by 8 sheet, folded three times perpendicular to its long edge', { size: 15, bold: true });

  /* which step are we on */
  var step = 0;
  if (p > 0.22) step = 1;
  if (p > 0.42) step = 2;
  if (p > 0.6) step = 3;

  var s = V.fold.steps[step];
  var scale = 19;
  var ox = 60, oy = 90;
  var dw = s.w * scale, dh = s.h * scale;

  P.rect(ox, oy, dw, dh, { fill: ACCDIM, stroke: ACC, radius: 2, sw: 1.4 });
  /* the fold lines that are still to come on this sheet */
  if (step < 3) {
    if (s.w >= s.h) P.line(ox + dw / 2, oy - 8, ox + dw / 2, oy + dh + 8, { stroke: BAD, sw: 1.4, dash: [6, 4] });
    else P.line(ox - 8, oy + dh / 2, ox + dw + 8, oy + dh / 2, { stroke: BAD, sw: 1.4, dash: [6, 4] });
  }
  txt(ox, oy - 14, s.w + ' cm x ' + s.h + ' cm', { size: 13, bold: true, color: INK, mono: true });
  txt(ox, oy + dh + 12, 'layers: ' + s.layers, { size: 12, color: ACC, mono: true });

  /* the running table */
  var tx = 520, ty = 78;
  txt(tx, ty, 'fold   size       layers', { size: 11.5, bold: true, color: DIM, mono: true });
  for (var i = 0; i <= 3; i++) {
    var st = V.fold.steps[i];
    var on = i <= step;
    var label = i === 0 ? 'start' : (st.axis === 'vertical' ? 'across 20' : 'across 8');
    txt(tx, ty + 22 + i * 22, (i === 0 ? '-' : String(i)) + '      ' + st.w + ' x ' + st.h + '      ' + st.layers,
      { size: 11.5, mono: true, color: on ? INK : FAINT });
    txt(tx + 168, ty + 22 + i * 22, label, { size: 10.5, color: on ? (st.axis === 'horizontal' && i === 3 ? WARN : DIM) : FAINT });
  }

  if (p > 0.62) {
    P.rect(tx, ty + 130, 320, 46, { fill: ACCDIM, stroke: ACC, radius: 8 });
    txt(tx + 14, ty + 142, 'Final 5 x 4, perimeter 2(5+4) = ' + V.fold.perimeter, { size: 12, bold: true, color: ACC });
    txt(tx + 14, ty + 162, 'area check: 160 = 20 x 8 layers', { size: 11, color: DIM });
  }
  if (p > 0.78) {
    P.rect(tx, ty + 186, 320, 62, { fill: BADDIM, stroke: BAD, radius: 8 });
    txt(tx + 14, ty + 198, 'The wrong answer: 21', { size: 12, bold: true, color: BAD });
    txt(tx + 14, ty + 218, 'Folding the 20 side three times gives', { size: 10.5, color: DIM });
    txt(tx + 14, ty + 236, V.foldCareless.w + ' x ' + V.foldCareless.h + ', perimeter ' + V.foldCareless.perimeter, { size: 11, mono: true, color: BAD });
  }

  if (p > 0.86) {
    txt(60, 344, 'The long edge changes hands: after the second fold the 8 is the longer side.', { size: 11.5, color: WARN });
    txt(60, 364, 'so the third fold halves the 8, not the 5.', { size: 11.5, color: WARN });
    txt(60, 396, 'This is GATE CSE 2024 Set 1, General Aptitude Question 9.', { size: 11, color: FAINT });
  }
}

/* ---------- scene 6: cut ---------- */
function drawCut(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'A 4 by 4 sheet, folded twice, punched once', { size: 15, bold: true });

  var cell = 56, ox = 70, oy = 78;
  var folded = p > 0.34, unfolded = p > 0.72;

  if (!folded) {
    grid(ox, oy, 4, 4, cell, { stroke: BORDER });
    fillCells(ox, oy, cell, [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1],
                             [0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [1, 3], [2, 3], [3, 3]],
      { fill: SURF2, stroke: SURF2 });
    P.line(ox + 2 * cell, oy - 10, ox + 2 * cell, oy + 4 * cell + 10, { stroke: BAD, sw: 1.5, dash: [6, 4] });
    txt(ox + 2 * cell + 8, oy - 16, 'fold 1', { size: 11, color: BAD });
    if (p > 0.16) {
      P.line(ox - 10, oy + 2 * cell, ox + 4 * cell + 10, oy + 2 * cell, { stroke: BAD, sw: 1.5, dash: [6, 4] });
      txt(ox + 4 * cell + 14, oy + 2 * cell - 6, 'fold 2', { size: 11, color: BAD });
    }
    caption(ox, oy + 4 * cell + 20, '16 cells, one layer', { size: 12 });
  } else {
    var size = unfolded ? 4 : 2;
    grid(ox, oy, size, size, cell, { stroke: BORDER });
    var all = [];
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) all.push([x, y]);
    fillCells(ox, oy, cell, all, { fill: unfolded ? SURF2 : ACCDIM, stroke: unfolded ? SURF2 : ACC });
    caption(ox, oy + size * cell + 20,
      unfolded ? 'unfolded: four holes, closed under both reflections'
               : 'folded: 2 x 2 visible, ' + V.punch.layers + ' layers thick',
      { size: 12, color: unfolded ? ACC : INK });

    if (unfolded) {
      for (var h = 0; h < V.punch.holes.length; h++) {
        var c = V.punch.holes[h];
        P.circle(ox + c[0] * cell + cell / 2, oy + c[1] * cell + cell / 2, 11, { fill: BADDIM, stroke: BAD, sw: 1.5 });
      }
      P.line(ox + 2 * cell, oy - 6, ox + 2 * cell, oy + 4 * cell + 6, { stroke: FAINT, sw: 1, dash: [4, 5] });
      P.line(ox - 6, oy + 2 * cell, ox + 4 * cell + 6, oy + 2 * cell, { stroke: FAINT, sw: 1, dash: [4, 5] });
    } else if (p > 0.52) {
      P.circle(ox + V.punch.punched[0] * cell + cell / 2, oy + V.punch.punched[1] * cell + cell / 2, 11,
        { fill: BADDIM, stroke: BAD, sw: 1.8 });
      txt(ox + cell + 16, oy + cell - 4, 'one punch', { size: 11, color: BAD, bold: true });
    }
  }

  /* the arithmetic panel */
  var tx = 430;
  txt(tx, 78, 'The two numbers', { size: 13, bold: true });
  txt(tx, 106, 'punches  1', { size: 12, mono: true, color: DIM });
  txt(tx, 128, 'layers   ' + V.punch.layers, { size: 12, mono: true, color: DIM });
  txt(tx, 150, 'holes    ' + V.punch.holes.length, { size: 12.5, mono: true, bold: true, color: ACC });

  if (p > 0.6) {
    txt(tx, 190, 'The model keeps, for every visible cell, the list of', { size: 11, color: DIM });
    txt(tx, 208, 'original cells stacked on it. After both folds all 16', { size: 11, color: DIM });
    txt(tx, 226, 'cells appear exactly once, four to a stack.', { size: 11, color: DIM });
  }
  if (p > 0.8) {
    P.rect(tx, 254, 400, 96, { fill: ACCDIM, stroke: ACC, radius: 8 });
    txt(tx + 14, 266, 'Holes equals punches times layers', { size: 12, bold: true, color: ACC });
    txt(tx + 14, 290, 'Unfold in the reverse order, reflecting the holes across', { size: 11, color: DIM });
    txt(tx + 14, 308, 'each fold line as you open it.', { size: 11, color: DIM });
    txt(tx + 14, 330, 'A punch on a fold line is shared, so it makes fewer.', { size: 10.5, color: WARN });
  }
}

/* ---------- scene 7: net ---------- */
function drawNet(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'A net folds into a cube; opposite faces are two steps apart', { size: 15, bold: true });

  var cell = 52, ox = 96, oy = 66;
  var cells = V.demoNet.cells, b = bbox(cells);
  grid(ox, oy, b.w, b.h, cell, { stroke: SURF2 });

  var shown = Math.min(cells.length, Math.ceil(p * 12));
  for (var i = 0; i < cells.length; i++) {
    if (i >= shown) continue;
    var c = cells[i], f = V.demoNet.faces[cellKey(c)];
    P.rect(ox + c[0] * cell, oy + c[1] * cell, cell, cell, { fill: ACCDIM, stroke: ACC, radius: 2, sw: 1.3 });
    txt(ox + c[0] * cell + cell / 2, oy + c[1] * cell + cell / 2, String(f),
      { size: 18, bold: true, align: 'center', base: 'middle', color: ACC, mono: true });
  }
  caption(ox, oy + b.h * cell + 22, 'each square labelled with the cube face it becomes', { size: 11 });

  /* the opposite pairs */
  var tx = 470;
  txt(tx, 66, 'Opposite pairs in this net', { size: 13, bold: true });
  if (p > 0.4) {
    for (var k = 0; k < V.demoNet.pairs.length; k++) {
      var pr = V.demoNet.pairs[k];
      txt(tx, 94 + k * 24, 'face ' + V.demoNet.faces[pr[0]] + '  opposite  face ' + V.demoNet.faces[pr[1]],
        { size: 12, mono: true, color: INK });
    }
    txt(tx, 178, 'Two steps apart in the row of four is the rule.', { size: 11, color: ACC });
    txt(tx, 196, 'One step apart is adjacent.', { size: 11, color: DIM });
  }

  if (p > 0.58) {
    P.rect(tx, 220, 396, 66, { fill: SURF2, stroke: BORDER, radius: 8 });
    txt(tx + 14, 232, 'The count, computed rather than quoted', { size: 11.5, bold: true, color: INK });
    txt(tx + 14, 254, V.nets.hexominoes + ' free hexominoes, rolled over by a cube, of which ' + V.nets.count + ' fold up.',
      { size: 11, color: DIM });
    txt(tx + 14, 272, 'The other ' + (V.nets.hexominoes - V.nets.count) + ' overlap themselves.', { size: 11, color: DIM });
  }
  if (p > 0.78) {
    P.rect(tx, 300, 396, 74, { fill: BADDIM, stroke: BAD, radius: 8 });
    txt(tx + 14, 312, 'Opposite faces can never both be visible', { size: 12, bold: true, color: BAD });
    txt(tx + 14, 334, 'A view of a cube shows three mutually adjacent faces.', { size: 11, color: DIM });
    txt(tx + 14, 352, 'So an option showing an opposite pair is wrong, before any folding.', { size: 11, color: DIM });
  }
}

/* ---------- scene 8: cuts3d ---------- */
function drawCuts3d(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'Three cuts, one along each axis, divide a block into eight', { size: 15, bold: true });

  /* a simple isometric cube */
  var cx = 170, cy = 200, s = 108, d = 46;
  var A = [cx, cy], B = [cx + s, cy], C = [cx + s + d, cy - d], D = [cx + d, cy - d];
  var E = [cx, cy + s], F = [cx + s, cy + s], G = [cx + s + d, cy + s - d], H = [cx + d, cy + s - d];

  P.tri(A[0], A[1], B[0], B[1], C[0], C[1], { fill: SURF2, stroke: BORDER, sw: 1.3 });
  P.tri(A[0], A[1], C[0], C[1], D[0], D[1], { fill: ACCDIM, stroke: BORDER, sw: 1.3 });
  P.tri(A[0], A[1], B[0], B[1], F[0], F[1], { fill: SURF, stroke: BORDER, sw: 1.3 });
  P.tri(A[0], A[1], F[0], F[1], E[0], E[1], { fill: SURF, stroke: BORDER, sw: 1.3 });
  P.tri(B[0], B[1], C[0], C[1], G[0], G[1], { fill: SURF2, stroke: BORDER, sw: 1.3 });
  P.tri(B[0], B[1], G[0], G[1], F[0], F[1], { fill: SURF2, stroke: BORDER, sw: 1.3 });
  P.tri(C[0], C[1], D[0], D[1], H[0], H[1], { fill: ACCDIM, stroke: BORDER, sw: 1.3 });
  P.tri(C[0], C[1], H[0], H[1], G[0], G[1], { fill: ACCDIM, stroke: BORDER, sw: 1.3 });

  if (p > 0.2) {
    /* the three cutting planes, drawn as lines across the cube */
    P.line(A[0] + s / 2, A[1], B[0] + s / 2, B[1], { stroke: BAD, sw: 1.6, dash: [6, 4] });
    P.line(A[0], A[1] + s / 2, E[0], E[1] + s / 2, { stroke: INFO, sw: 1.6, dash: [6, 4] });
    P.line(A[0] + d / 2, A[1] - d / 2, E[0] + d / 2, E[1] - d / 2, { stroke: WARN, sw: 1.6, dash: [6, 4] });
    txt(cx + s / 2 - 8, cy + s + 14, 'cut 1', { size: 10.5, color: BAD });
    txt(cx - 52, cy + s / 2 - 6, 'cut 2', { size: 10.5, color: INFO });
    txt(cx + d / 2 - 46, cy - d / 2 + 6, 'cut 3', { size: 10.5, color: WARN });
  }
  caption(60, 372, 'Each cut crosses the whole block, so it doubles the count along one axis.', { size: 11 });

  /* the table */
  var tx = 470;
  txt(tx, 66, 'cuts   best split      pieces', { size: 11.5, bold: true, color: DIM, mono: true });
  for (var i = 0; i < V.cuts.rows.length; i++) {
    var r = V.cuts.rows[i];
    if (p < 0.24 + 0.12 * i) continue;
    var on = r.cuts === V.cuts.minFor8;
    txt(tx, 92 + i * 24, ' ' + r.cuts + '     ' + r.split.cx + '+' + r.split.cy + '+' + r.split.cz +
      '         ' + r.pieces, { size: 11.5, mono: true, color: on ? ACC : INK, bold: on });
  }
  if (p > 0.62) {
    txt(tx, 208, '(c-x + 1)(c-y + 1)(c-z + 1) pieces from c-x + c-y + c-z cuts', { size: 11.5, mono: true, color: INK });
  }
  if (p > 0.76) {
    P.rect(tx, 232, 396, 70, { fill: ACCDIM, stroke: ACC, radius: 8 });
    txt(tx + 14, 244, 'Eight equal pieces need exactly ' + V.cuts.minFor8 + ' cuts', { size: 12, bold: true, color: ACC });
    txt(tx + 14, 266, 'Two cuts reach at most ' + V.cuts.rows[1].pieces + '; four reach ' + V.cuts.rows[3].pieces + ', so four is not the minimum.',
      { size: 11, color: DIM });
    txt(tx + 14, 286, 'This is the shape of GATE CSE 2024 Set 2, GA Question 9.', { size: 10.5, color: FAINT });
  }
  if (p > 0.88) {
    P.rect(tx, 316, 396, 54, { fill: BADDIM, stroke: BAD, radius: 8 });
    txt(tx + 14, 328, 'The trap: cuts and pieces are different numbers', { size: 11.5, bold: true, color: BAD });
    txt(tx + 14, 350, 'Pieces is a product; cuts is a search over factorisations.', { size: 11, color: DIM });
  }
}

/* ---------- scene 9: tiling ---------- */
function drawTiling(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'An 8 by 8 board with two opposite corners removed', { size: 15, bold: true });

  var cell = 30, ox = 60, oy = 66;
  grid(ox, oy, 8, 8, cell, { stroke: BORDER, sw: 0.8 });
  var after = p > 0.3;
  for (var i = 0; i < V.tiling.board.length; i++) {
    var c = V.tiling.board[i];
    var x = ox + c.x * cell, y = oy + c.y * cell;
    if (c.gone) {
      if (after) P.rect(x, y, cell, cell, { fill: BADDIM, stroke: BAD, radius: 0, sw: 1 });
      continue;
    }
    P.rect(x, y, cell, cell, { fill: c.dark ? '#dfe6ea' : SURF, stroke: BORDER, radius: 0, sw: 0.8 });
  }
  if (after) {
    txt(ox, oy + 8 * cell + 18, 'the two removed corners are the same colour', { size: 11, color: BAD });
  }

  var tx = 400;
  txt(tx, 66, 'Test one: area', { size: 12.5, bold: true });
  txt(tx, 90, 'board ' + V.tiling.area + ' squares, domino covers 2', { size: 11, mono: true, color: DIM });
  txt(tx, 110, V.tiling.area + ' / 2 = ' + (V.tiling.area / 2) + ', remainder 0', { size: 11, mono: true, color: VAL });
  txt(tx, 130, 'so the area test passes and proves nothing', { size: 10.5, color: DIM });

  if (p > 0.42) {
    txt(tx, 168, 'Test two: colour', { size: 12.5, bold: true });
    txt(tx, 192, 'shaded ' + V.tiling.after.dark + '   unshaded ' + V.tiling.after.light,
      { size: 11.5, mono: true, color: BAD, bold: true });
    txt(tx, 214, 'a domino covers one of each, so the counts must tie', { size: 10.5, color: DIM });
  }
  if (p > 0.62) {
    P.rect(tx, 236, 466, 62, { fill: BADDIM, stroke: BAD, radius: 8 });
    txt(tx + 14, 248, 'Unequal counts: no tiling exists, whatever the arrangement.', { size: 12, bold: true, color: BAD });
    txt(tx + 14, 270, 'This is an invariant. It does not depend on how cleverly you place the dominoes.', { size: 11, color: DIM });
    txt(tx + 14, 288, 'Two adjacent corners would leave ' + V.tiling.adjacentRemoval.dark + ' and ' + V.tiling.adjacentRemoval.light + ', which passes.', { size: 10.5, color: DIM });
  }
  if (p > 0.82) {
    txt(tx, 320, 'Both tests can only prove impossibility.', { size: 11.5, bold: true, color: WARN });
    txt(tx, 342, 'To prove a tiling exists you still have to exhibit one.', { size: 11, color: DIM });
  }
}

/* ---------- scene 10: procedure ---------- */
function drawProcedure(t, sc) {
  var p = (t - sc.start) / (sc.end - sc.start);
  txt(24, 16, 'The five-step procedure for any spatial question', { size: 15, bold: true });

  var steps = [
    ['1', 'Name the family from the wording', 'folded means reflections; cuts and pieces mean products; constructed means tiling'],
    ['2', 'Test orientation with three corners', 'clockwise order preserved means rotation, reversed means mirror'],
    ['3', 'For folds, track two dimensions and the layers', 'halve the crossed dimension, double the layers, find the long edge again'],
    ['4', 'For cuts, multiply or search', 'layers times punches in the plane; the product of counts plus one in space'],
    ['5', 'For tiling, area then colour', 'a remainder ends it; unequal colours end it; only a construction proves it']
  ];
  for (var i = 0; i < steps.length; i++) {
    if (p < 0.04 + 0.17 * i) continue;
    var y = 52 + i * 76;
    P.rect(30, y, 840, 64, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, radius: 8 });
    P.circle(64, y + 32, 16, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
    txt(64, y + 32, steps[i][0], { size: 14, bold: true, align: 'center', base: 'middle', color: ACC, mono: true });
    txt(96, y + 14, steps[i][1], { size: 12.5, bold: true, color: INK });
    txt(96, y + 38, steps[i][2], { size: 11, color: DIM });
  }
  if (p > 0.88) {
    txt(30, 438, 'Every step is a computation on paper. None of them needs you to see the answer in the picture.', { size: 11.5, color: ACC });
  }
}

var SCENE_DRAW = {
  what: drawWhat,
  rigid: drawRigid,
  mirror: drawMirror,
  symmetry: drawSymmetry,
  fold: drawFold,
  cut: drawCut,
  net: drawNet,
  cuts3d: drawCuts3d,
  tiling: drawTiling,
  procedure: drawProcedure
};

function drawFrame(painter) {
  P = painter;
  if (!P) return;
  P.alpha(1);
  P.clear();
  var st = K.state, tl = window.LESSON_TIMELINE;
  if (!tl) return;
  var t = st.elapsed, scenes = tl.scenes, i = 0;
  for (var k = scenes.length - 1; k >= 0; k--) {
    if (t >= scenes[k].start - 1e-6) { i = k; break; }
  }
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try {
    fn(t, sc);
  } catch (err) {
    console.error('scene draw failed', sc.id, err);
  }
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

  if (window.p5) {
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

  if (!ok) {
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
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
