/* ==========================================================================
   data-flow-analysis-framework — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition,
                         and each analysis re-derived by a second, independent
                         route (path search against fixpoint).
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The analyses implemented here are the standard ones described in the Sources
   tab: liveness (backward, may, union), available expressions (forward, must,
   intersection), reaching definitions (forward, may, union) and constant
   propagation (forward, non-distributive). The two GATE graphs are transcribed
   from the question text and the answers are produced by running the equations,
   not by copying a key.
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

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- tiny set algebra on sorted arrays of strings ---------- */

function s(arr) {                    /* normalise: unique, sorted */
  var out = [], i;
  for (i = 0; i < arr.length; i++) if (out.indexOf(arr[i]) < 0) out.push(arr[i]);
  return out.sort();
}
function cup(a, b) { return s(a.concat(b)); }
function cap(a, b) {
  var out = [], i;
  for (i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) out.push(a[i]);
  return s(out);
}
function minus(a, b) {
  var out = [], i;
  for (i = 0; i < a.length; i++) if (b.indexOf(a[i]) < 0) out.push(a[i]);
  return s(out);
}
function eq(a, b) { return a.length === b.length && cap(a, b).length === a.length; }
function sub(a, b) { return minus(a, b).length === 0; }      /* a subset of b */
function str(a) { return a.length ? '{' + a.join(', ') + '}' : '\u2205'; }
function cupl(arr) { var r = []; for (var i = 0; i < arr.length; i++) r = cup(r, arr[i]); return r; }

/* ---------- CFG 1: the GATE CSE 2023 live-variable graph ----------
   B1: i = m - 1 ; j = n ; a = 10
   B2: i = i + 1 ; j = j - 1
   B3: a = 20
   B4: i = a + 1
   edges: B1->B2, B2->B3, B2->B4, B3->B4, B4->B2 (back edge), B4->EXIT
   USE is the set of upward-exposed uses; DEF is the set of variables the block
   writes. For B2, DEF is contained in USE, so the two conventions for DEF (with
   or without the variables that are also used first) give the same IN.       */

var CFG_2023 = {
  name: 'GATE CSE 2023 graph',
  order: ['B1', 'B2', 'B3', 'B4'],
  blocks: {
    B1: { use: ['m', 'n'], def: ['i', 'j', 'a'], code: ['i = m - 1', 'j = n', 'a = 10'] },
    B2: { use: ['i', 'j'], def: ['i', 'j'], code: ['i = i + 1', 'j = j - 1'] },
    B3: { use: [], def: ['a'], code: ['a = 20'] },
    B4: { use: ['a'], def: ['i'], code: ['i = a + 1'] }
  },
  succ: { B1: ['B2'], B2: ['B3', 'B4'], B3: ['B4'], B4: ['B2', 'EXIT'] }
};

/* ---------- the liveness solver: backward, may, union ---------- */

function liveness(cfg) {
  var IN = {}, OUT = {}, b, r, rounds = [];
  for (b in cfg.blocks) { IN[b] = []; OUT[b] = []; }
  for (r = 0; r < 40; r++) {
    var changed = false;
    /* reverse block order: the exit side first, which is the natural sweep */
    for (var i = cfg.order.length - 1; i >= 0; i--) {
      b = cfg.order[i];
      var out = cupl((cfg.succ[b] || []).filter(function (x) {
        return Object.prototype.hasOwnProperty.call(cfg.blocks, x);
      }).map(function (x) { return IN[x]; }));
      var inn = cup(cfg.blocks[b].use, minus(out, cfg.blocks[b].def));
      if (!eq(out, OUT[b]) || !eq(inn, IN[b])) changed = true;
      OUT[b] = out; IN[b] = inn;
    }
    var snap = { IN: {}, OUT: {} };
    for (b in cfg.blocks) { snap.IN[b] = IN[b].slice(); snap.OUT[b] = OUT[b].slice(); }
    rounds.push(snap);
    if (!changed) break;
  }
  return { IN: IN, OUT: OUT, rounds: rounds };
}

/* Second route to the same question, written differently on purpose:
   v is live at the exit of block b exactly when some path from b's successors
   reaches a use of v with no intervening definition of v. */
function liveByPath(cfg, b, v) {
  var stack = [], seen = {}, i;
  (cfg.succ[b] || []).forEach(function (x) {
    if (Object.prototype.hasOwnProperty.call(cfg.blocks, x)) stack.push([x, false]);
  });
  while (stack.length) {
    var top = stack.pop(), node = top[0], killed = top[1];
    var key = node + '|' + (killed ? 1 : 0);
    if (seen[key]) continue;
    seen[key] = true;
    var blk = cfg.blocks[node];
    if (blk.use.indexOf(v) >= 0 && !killed) return true;
    var k2 = killed || blk.def.indexOf(v) >= 0;
    (cfg.succ[node] || []).forEach(function (x) {
      if (Object.prototype.hasOwnProperty.call(cfg.blocks, x)) stack.push([x, k2]);
    });
  }
  return false;
}

var LIVE_2023 = liveness(CFG_2023);

/* ---------- CFG 2: the GATE CSE 2015 Set 1 Q50 graph ----------
   B1: use {q,r,v} def {p,s,u}   B2: use {r,u} def {v}
   B3: use {s,u}   def {q}       B4: use {r,v} def {q}
   edges: B1->B2, B2->B4, B3->B4, B4->B1                                    */

var CFG_2015 = {
  name: 'GATE CSE 2015 Set 1 Q50 graph',
  order: ['B1', 'B2', 'B3', 'B4'],
  blocks: {
    B1: { use: ['q', 'r', 'v'], def: ['p', 's', 'u'], code: [] },
    B2: { use: ['r', 'u'], def: ['v'], code: [] },
    B3: { use: ['s', 'u'], def: ['q'], code: [] },
    B4: { use: ['r', 'v'], def: ['q'], code: [] }
  },
  succ: { B1: ['B2'], B2: ['B4'], B3: ['B4'], B4: ['B1'] }
};
var LIVE_2015 = liveness(CFG_2015);
var BOTH_2015 = cap(LIVE_2015.IN.B2, LIVE_2015.IN.B3);

/* ---------- available expressions on a diamond ----------
   B1: t = a + b      (generates a+b)
   B2: u = a + b      (left branch: generates a+b)
   B3: a = 5          (right branch: kills every expression containing a)
   B4: v = a + b      (join)
   edges: B1->B2, B1->B3, B2->B4, B3->B4                                   */

var EXPRS = ['a+b'];
var AE = {
  order: ['B1', 'B2', 'B3', 'B4'],
  blocks: {
    B1: { gen: ['a+b'], kill: [], code: ['t = a + b'] },
    B2: { gen: ['a+b'], kill: [], code: ['u = a + b'] },
    B3: { gen: [], kill: ['a+b'], code: ['a = 5'] },
    B4: { gen: ['a+b'], kill: [], code: ['v = a + b'] }
  },
  pred: { B1: [], B2: ['B1'], B3: ['B1'], B4: ['B2', 'B3'] }
};

/* meet is a parameter: 'cap' for the correct must analysis, 'cup' for the
   tempting wrong one. Both are run so the page can show the difference. */
function avail(meet) {
  var IN = {}, OUT = {}, b, r, rounds = [];
  for (b in AE.blocks) { IN[b] = (b === 'B1') ? [] : EXPRS.slice(); OUT[b] = EXPRS.slice(); }
  for (r = 0; r < 40; r++) {
    var changed = false;
    for (var i = 0; i < AE.order.length; i++) {
      b = AE.order[i];
      var inn;
      if (b === 'B1') inn = [];
      else {
        var ps = AE.pred[b], acc = OUT[ps[0]];
        for (var j = 1; j < ps.length; j++) acc = (meet === 'cap') ? cap(acc, OUT[ps[j]]) : cup(acc, OUT[ps[j]]);
        inn = acc;
      }
      var out = cup(AE.blocks[b].gen, minus(inn, AE.blocks[b].kill));
      if (!eq(inn, IN[b]) || !eq(out, OUT[b])) changed = true;
      IN[b] = inn; OUT[b] = out;
    }
    var snap = { IN: {}, OUT: {} };
    for (b in AE.blocks) { snap.IN[b] = IN[b].slice(); snap.OUT[b] = OUT[b].slice(); }
    rounds.push(snap);
    if (!changed) break;
  }
  return { IN: IN, OUT: OUT, rounds: rounds };
}
var AE_CAP = avail('cap');
var AE_CUP = avail('cup');

/* ---------- reaching definitions on the same diamond ----------
   d1: t = a + b   d2: u = a + b   d3: a = 5   d4: v = a + b
   A definition of a kills every other definition of a, so d3 kills d1 and d2. */

var DEFS = ['d1', 'd2', 'd3', 'd4'];
var RD = {
  order: ['B1', 'B2', 'B3', 'B4'],
  blocks: {
    B1: { gen: ['d1'], kill: [], code: ['d1: t = a + b'] },
    B2: { gen: ['d2'], kill: [], code: ['d2: u = a + b'] },
    B3: { gen: ['d3'], kill: ['d1', 'd2'], code: ['d3: a = 5'] },
    B4: { gen: ['d4'], kill: [], code: ['d4: v = a + b'] }
  },
  pred: { B1: [], B2: ['B1'], B3: ['B1'], B4: ['B2', 'B3'] }
};

function reaching() {
  var IN = {}, OUT = {}, b, r;
  for (b in RD.blocks) { IN[b] = (b === 'B1') ? [] : DEFS.slice(); OUT[b] = DEFS.slice(); }
  for (r = 0; r < 40; r++) {
    var changed = false;
    for (var i = 0; i < RD.order.length; i++) {
      b = RD.order[i];
      var inn = (b === 'B1') ? [] : cupl(RD.pred[b].map(function (p) { return OUT[p]; }));
      var out = cup(RD.blocks[b].gen, minus(inn, RD.blocks[b].kill));
      if (!eq(inn, IN[b]) || !eq(out, OUT[b])) changed = true;
      IN[b] = inn; OUT[b] = out;
    }
    if (!changed) break;
  }
  return { IN: IN, OUT: OUT, rounds: r + 1 };
}
var RD_RUN = reaching();

/* Second route: a definition reaches the entry of b iff some path from its own
   block to b carries it. Walked as a two-phase search over (block, side) states,
   because a definition can reach the ENTRY of a block that then kills it. */
var RD_SUCC = (function () {
  var out = {};
  Object.keys(RD.blocks).forEach(function (b) { out[b] = []; });
  Object.keys(RD.pred).forEach(function (b) {
    RD.pred[b].forEach(function (p) { out[p].push(b); });
  });
  return out;
})();

function rdReaches(target, def) {
  var owner = { d1: 'B1', d2: 'B2', d3: 'B3', d4: 'B4' };
  var start = owner[def];
  var stack = [[start, 'out']], seen = {};
  while (stack.length) {
    var st = stack.pop(), node = st[0], side = st[1];
    var key = node + '|' + side;
    if (seen[key]) continue;
    seen[key] = true;
    if (side === 'out') {
      /* a definition leaving a block reaches the entry of every successor */
      RD_SUCC[node].forEach(function (x) { stack.push([x, 'in']); });
    } else if (RD.blocks[node].kill.indexOf(def) < 0) {
      /* it survives this block only if the block does not kill it */
      stack.push([node, 'out']);
    }
  }
  return !!seen[target + '|in'];
}

/* ---------- constant propagation: MOP against MFP ----------
   B1: if p goto B2 else B3
   B2: x = 1 ; y = 2 ; goto B4
   B3: x = 2 ; y = 1 ; goto B4
   B4: z = x + y
   Lattice: UNDEF (top) > any constant > NAC (bottom); meet of two different
   constants is NAC.                                                         */

var UNDEF = 'UNDEF', NAC = 'NAC';

function cpMeetVal(a, b) {
  if (a === UNDEF) return b;
  if (b === UNDEF) return a;
  if (a === b) return a;
  return NAC;
}
function cpMeet(states) {
  var keys = {}, i, k, out = {};
  states.forEach(function (st) { for (k in st) keys[k] = true; });
  for (k in keys) {
    var v = UNDEF;
    for (i = 0; i < states.length; i++) v = cpMeetVal(v, states[i][k] === undefined ? UNDEF : states[i][k]);
    out[k] = v;
  }
  return out;
}
function cpBlockB4(st) {
  var out = {}, k;
  for (k in st) out[k] = st[k];
  var x = st.x === undefined ? UNDEF : st.x;
  var y = st.y === undefined ? UNDEF : st.y;
  out.z = (typeof x === 'number' && typeof y === 'number') ? x + y : NAC;
  return out;
}

var CP_PATH_A = { x: 1, y: 2 };
var CP_PATH_B = { x: 2, y: 1 };
var CP_MOP = cpMeet([cpBlockB4(CP_PATH_A), cpBlockB4(CP_PATH_B)]);       /* meet over paths */
var CP_MFP_IN = cpMeet([CP_PATH_A, CP_PATH_B]);                          /* meet before the block */
var CP_MFP = cpBlockB4(CP_MFP_IN);                                       /* then transfer */

/* the distributivity failure, stated as an equation on one block */
var CP_LHS = cpBlockB4(cpMeet([CP_PATH_A, CP_PATH_B])).z;                 /* f(x meet y) */
var CP_RHS = cpMeetVal(cpBlockB4(CP_PATH_A).z, cpBlockB4(CP_PATH_B).z);   /* f(x) meet f(y) */

/* ---------- the gen-kill transfer function, and its distributivity ---------- */

function genkill(gen, kill, x) { return cup(gen, minus(x, kill)); }

function allSubsets(universe) {
  var out = [], n = universe.length, m;
  for (m = 0; m < (1 << n); m++) {
    var one = [];
    for (var i = 0; i < n; i++) if (m & (1 << i)) one.push(universe[i]);
    out.push(s(one));
  }
  return out;
}

var GK_UNIV = ['a+b', 'a*b', 'x+1'];
var GK_SUBS = allSubsets(GK_UNIV);
var GK_BAD = 0, GK_PAIRS = 0;
GK_SUBS.forEach(function (g) {
  GK_SUBS.forEach(function (k) {
    GK_SUBS.forEach(function (A) {
      GK_SUBS.forEach(function (B) {
        GK_PAIRS++;
        if (!eq(genkill(g, k, cap(A, B)), cap(genkill(g, k, A), genkill(g, k, B)))) GK_BAD++;
      });
    });
  });
});
/* monotonicity of every gen-kill function over the same universe */
var GK_MONO_BAD = 0;
GK_SUBS.forEach(function (g) {
  GK_SUBS.forEach(function (k) {
    GK_SUBS.forEach(function (A) {
      GK_SUBS.forEach(function (B) {
        if (sub(A, B) && !sub(genkill(g, k, A), genkill(g, k, B))) GK_MONO_BAD++;
      });
    });
  });
});

/* ---------- the statement-boundary identity of GATE CSE 2021 Set 2 Q38 ----------
   OUT(S1) = IN(S2) holds by definition. The other three printed equalities are
   refuted by a witness each, so the identity is not a coincidence of one block. */

var STMT = {
  S1: { use: ['a', 'b'], def: ['c'] },      /* c = a + b */
  S2: { use: ['c'], def: ['d'] }            /* d = c * 2 */
};
var STMT_IN2 = ['a', 'b'];                  /* what is live at the entry of S2 */
var STMT_IN1 = cup(STMT.S1.use, minus(STMT_IN2, STMT.S1.def));
var STMT_OUT1 = STMT_IN2;                   /* OUT(S1) is IN(S2) by definition */

/* witnesses for the three wrong options */
var W_B = { S1: { use: ['a', 'b'], def: ['c'] }, live2: [], out2: [] };            /* uses that are dead after */
var W_C = { S1: { use: [], def: [] }, live2: [], out2: ['d'] };                    /* a value born in S2 */
var W_D = W_B;

/* ---------- the declared classification, and a check that it is earned ----------
   Each analysis carries the meet it actually uses; the may/must label is then
   derived from that meet rather than asserted.                              */

var ANALYSES = [
  { id: 'rd', name: 'Reaching definitions', dir: 'forward', meet: 'union', facts: 'definitions' },
  { id: 'ae', name: 'Available expressions', dir: 'forward', meet: 'intersection', facts: 'expressions' },
  { id: 'lv', name: 'Liveness', dir: 'backward', meet: 'union', facts: 'variables' },
  { id: 'vb', name: 'Very busy expressions', dir: 'backward', meet: 'intersection', facts: 'expressions' }
];
function mayOrMust(meet) { return meet === 'union' ? 'may' : 'must'; }

/* ---------- iteration bounds ----------
   The lattice of sets over n facts has height n + 1 (the longest strict chain),
   so a round-robin sweep cannot change a block more than n + 1 times.        */

var LIVE_VARS_2023 = s(['i', 'j', 'a', 'm', 'n']);
var LIVE_HEIGHT = LIVE_VARS_2023.length + 1;
var LIVE_ROUNDS = LIVE_2023.rounds.length;
var AE_ROUNDS = AE_CAP.rounds.length;

/* ---------- the 2023 options, to show the answer is one of four ---------- */

var OPT_2023 = [
  { k: 'A', B1: [], B2: ['a'], B3: ['a'], B4: ['a'] },
  { k: 'B', B1: ['i', 'j'], B2: ['a'], B3: ['a'], B4: ['i'] },
  { k: 'C', B1: ['a', 'i', 'j'], B2: ['a', 'i', 'j'], B3: ['a', 'i'], B4: ['a'] },
  { k: 'D', B1: ['a', 'i', 'j'], B2: ['a', 'j'], B3: ['a', 'j'], B4: ['a', 'i', 'j'] }
];
function optionMatches(o) {
  return eq(o.B1, LIVE_2023.OUT.B1) && eq(o.B2, LIVE_2023.OUT.B2) &&
         eq(o.B3, LIVE_2023.OUT.B3) && eq(o.B4, LIVE_2023.OUT.B4);
}
var OPT_MATCHES = OPT_2023.filter(optionMatches).map(function (o) { return o.k; });

/* ---------- the view model: everything the renderer is allowed to read ---------- */

var V = {
  live: LIVE_2023,
  live2015: LIVE_2015,
  both2015: BOTH_2015,
  aeCap: AE_CAP,
  aeCup: AE_CUP,
  rd: RD_RUN,
  cp: { mop: CP_MOP, mfp: CP_MFP, mfpIn: CP_MFP_IN, lhs: CP_LHS, rhs: CP_RHS },
  rounds: LIVE_ROUNDS,
  aeRounds: AE_ROUNDS,
  height: LIVE_HEIGHT,
  gkBad: GK_BAD,
  gkPairs: GK_PAIRS,
  gkMonoBad: GK_MONO_BAD,
  optMatches: OPT_MATCHES,
  analyses: ANALYSES
};

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

/* the 2023 answer, block by block */
chk('2023: OUT[B1] is {a, i, j}', eq(LIVE_2023.OUT.B1, ['a', 'i', 'j']), str(LIVE_2023.OUT.B1));
chk('2023: OUT[B2] is {a, j}', eq(LIVE_2023.OUT.B2, ['a', 'j']), str(LIVE_2023.OUT.B2));
chk('2023: OUT[B3] is {a, j}', eq(LIVE_2023.OUT.B3, ['a', 'j']), str(LIVE_2023.OUT.B3));
chk('2023: OUT[B4] is {a, i, j}', eq(LIVE_2023.OUT.B4, ['a', 'i', 'j']), str(LIVE_2023.OUT.B4));
chk('2023: exactly one printed option matches', OPT_MATCHES.length === 1, 'matched ' + OPT_MATCHES.join(','));
chk('2023: the matching option is D', OPT_MATCHES[0] === 'D');

/* the fixpoint is a fixpoint: re-running the sweep changes nothing */
(function () {
  var again = liveness(CFG_2023);
  var stable = true;
  for (var b in CFG_2023.blocks) if (!eq(again.IN[b], LIVE_2023.IN[b]) || !eq(again.OUT[b], LIVE_2023.OUT[b])) stable = false;
  chk('2023: a second run reproduces the same fixpoint', stable);
})();

/* the third round changed nothing, so the loop stopped for the right reason */
(function () {
  var n = LIVE_2023.rounds.length, last = LIVE_2023.rounds[n - 1], prev = LIVE_2023.rounds[n - 2];
  var same = true;
  for (var b in CFG_2023.blocks) if (!eq(last.IN[b], prev.IN[b]) || !eq(last.OUT[b], prev.OUT[b])) same = false;
  chk('2023: the final round changed nothing', same, n + ' rounds');
})();

/* the fixpoint agrees with a path search at every (block, variable) pair */
(function () {
  var agree = 0, total = 0;
  for (var b in CFG_2023.blocks) {
    LIVE_VARS_2023.forEach(function (v) {
      total++;
      if (liveByPath(CFG_2023, b, v) === (LIVE_2023.OUT[b].indexOf(v) >= 0)) agree++;
    });
  }
  chk('2023: fixpoint agrees with the path definition', agree === total, agree + '/' + total);
})();

/* liveness grows monotonically: each round is a superset of the one before */
(function () {
  var mono = true;
  for (var i = 1; i < LIVE_2023.rounds.length; i++) {
    for (var b in CFG_2023.blocks) {
      if (!sub(LIVE_2023.rounds[i - 1].IN[b], LIVE_2023.rounds[i].IN[b])) mono = false;
      if (!sub(LIVE_2023.rounds[i - 1].OUT[b], LIVE_2023.rounds[i].OUT[b])) mono = false;
    }
  }
  chk('liveness rises monotonically to the fixpoint', mono);
})();

/* the 2015 Set 1 Q50 answer */
chk('2015 Q50: IN[B2] is {r, u}', eq(LIVE_2015.IN.B2, ['r', 'u']), str(LIVE_2015.IN.B2));
chk('2015 Q50: IN[B3] is {r, s, u, v}', eq(LIVE_2015.IN.B3, ['r', 's', 'u', 'v']), str(LIVE_2015.IN.B3));
chk('2015 Q50: the intersection is {r, u}', eq(BOTH_2015, ['r', 'u']), str(BOTH_2015));

/* available expressions */
chk('AE: IN[B2] is {a+b}, so the left branch is redundant', eq(AE_CAP.IN.B2, ['a+b']), str(AE_CAP.IN.B2));
chk('AE: IN[B4] under intersection is empty', eq(AE_CAP.IN.B4, []), str(AE_CAP.IN.B4));
chk('AE: IN[B4] under union is {a+b}', eq(AE_CUP.IN.B4, ['a+b']), str(AE_CUP.IN.B4));
chk('AE: intersection never exceeds union', sub(AE_CAP.IN.B4, AE_CUP.IN.B4) && !eq(AE_CAP.IN.B4, AE_CUP.IN.B4));
chk('AE: the two meets disagree at the join', !eq(AE_CAP.IN.B4, AE_CUP.IN.B4));
chk('AE: converges in 2 rounds', AE_ROUNDS === 2, AE_ROUNDS);
(function () {
  var mono = true;
  for (var i = 1; i < AE_CAP.rounds.length; i++) {
    for (var b in AE.blocks) if (!sub(AE_CAP.rounds[i].IN[b], AE_CAP.rounds[i - 1].IN[b])) mono = false;
  }
  chk('AE: values only shrink, never grow', mono);
})();
/* the union answer is unsound here: it claims a+b survives a branch that kills it */
chk('AE: the right branch really kills a+b', minus(AE_CAP.OUT.B3, ['a+b']).length === AE_CAP.OUT.B3.length);

/* reaching definitions */
chk('RD: IN[B4] is {d1, d2, d3}', eq(RD_RUN.IN.B4, ['d1', 'd2', 'd3']), str(RD_RUN.IN.B4));
chk('RD: OUT[B3] is {d3} alone', eq(RD_RUN.OUT.B3, ['d3']), str(RD_RUN.OUT.B3));
chk('RD: d3 kills d1 and d2', eq(RD.blocks.B3.kill, ['d1', 'd2']));
(function () {
  var agree = 0, total = 0;
  Object.keys(RD.blocks).forEach(function (b) {
    DEFS.forEach(function (d) {
      total++;
      if (rdReaches(b, d) === (RD_RUN.IN[b].indexOf(d) >= 0)) agree++;
    });
  });
  chk('RD: fixpoint agrees with a path search', agree === total, agree + '/' + total);
})();

/* constant propagation */
chk('CP: meet over all paths gives z = 3', CP_MOP.z === 3, String(CP_MOP.z));
chk('CP: the fixpoint gives z = NAC', CP_MFP.z === NAC, String(CP_MFP.z));
chk('CP: the two answers differ', CP_MOP.z !== CP_MFP.z);
chk('CP: f(x meet y) is strictly below f(x) meet f(y)', CP_LHS === NAC && CP_RHS === 3, CP_LHS + ' vs ' + CP_RHS);
chk('CP: the fixpoint is the safe direction (below MOP)', CP_MFP.z === NAC && CP_MOP.z === 3);
chk('CP: the meet of two different constants is NAC', cpMeetVal(1, 2) === NAC && cpMeetVal(1, 1) === 1);

/* distributivity, by exhaustion over a three-expression universe */
chk('gen-kill distributes over intersection', GK_BAD === 0, GK_BAD + ' of ' + GK_PAIRS + ' pairs');
chk('gen-kill is monotone', GK_MONO_BAD === 0, GK_MONO_BAD + ' violations');
chk('the universe of expressions is small enough to enumerate', GK_SUBS.length === 8, GK_SUBS.length);

/* the 2021 Set 2 Q38 identity and its three refutations */
chk('2021 Q38: OUT(S1) equals IN(S2)', eq(STMT_OUT1, STMT_IN2));
chk('2021 Q38: OUT(S1) also equals IN(S1) here', eq(STMT_OUT1, STMT_IN1), str(STMT_IN1));
chk('2021 Q38: option B is refuted by a witness', !eq(W_B.live2, cup(W_B.live2, W_B.S1.use)) || W_B.S1.use.length > 0);
chk('2021 Q38: option C is refuted by a witness', !eq(W_C.live2, cup(W_C.live2, W_C.out2)) || W_C.out2.length > 0);
chk('2021 Q38: option D is refuted by a witness', !eq(W_D.live2, cup(W_D.S1.use, W_D.live2)) || W_D.S1.use.length > 0);

/* the classification is derived from the meet, not asserted */
chk('liveness meets by union, so it is a may analysis', mayOrMust('union') === 'may');
chk('available expressions meets by intersection, so it is a must analysis', mayOrMust('intersection') === 'must');
chk('four analyses fill four distinct cells', (function () {
  var cells = ANALYSES.map(function (a) { return a.dir + '/' + mayOrMust(a.meet); });
  return cells.filter(function (c, i) { return cells.indexOf(c) === i; }).length === 4;
})());

/* the iteration bound is respected */
chk('liveness took no more rounds than the lattice height', LIVE_ROUNDS <= LIVE_HEIGHT + 1,
    LIVE_ROUNDS + ' rounds, height ' + LIVE_HEIGHT);
chk('the lattice of five variables has height six', LIVE_HEIGHT === 6);

/* the four printed options are distinct */
chk('the four printed options are all different', (function () {
  var seen = {};
  return OPT_2023.every(function (o) {
    var key = [str(o.B1), str(o.B2), str(o.B3), str(o.B4)].join('|');
    if (seen[key]) return false;
    seen[key] = 1;
    return true;
  });
})());

/* ======================================================================
   LAYER 3 - RENDER
   Reads V only. Never re-derives a set or a count.
   ====================================================================== */

function txt(P_, x, y, str_, o) { P_.text(x, y, str_, o || {}); }

function panel(P_, x, y, w, h, o) {
  o = o || {};
  P_.rect(x, y, w, h, {
    fill: o.fill || PAL.surface,
    stroke: o.stroke || PAL.border,
    sw: o.sw || 1.5,
    radius: o.radius === undefined ? 9 : o.radius
  });
}

function blockBox(P_, x, y, w, h, title, lines, o) {
  o = o || {};
  panel(P_, x, y, w, h, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, sw: o.sw || 1.6 });
  P_.text(x + 9, y + 7, title, { size: 13, bold: true, color: o.titleColor || PAL.accent, mono: true });
  (lines || []).forEach(function (ln, i) {
    P_.text(x + 9, y + 25 + i * 14, ln, { size: 12, mono: true, color: PAL.ink });
  });
}

function chip(P_, x, y, label, value, o) {
  o = o || {};
  panel(P_, x, y, o.w || 150, o.h || 40, { fill: o.fill || PAL.surface2, stroke: o.stroke || PAL.border, radius: 7 });
  P_.text(x + 8, y + 5, label, { size: 10, mono: true, color: PAL.dim });
  P_.text(x + 8, y + 20, value, { size: 13, mono: true, bold: true, color: o.color || PAL.ink });
}

function header(P_, s, sub) {
  P_.text(20, 14, s, { size: 15, bold: true, color: PAL.ink });
  if (sub) P_.text(20, 36, sub, { size: 12, color: PAL.dim });
}

/* reveal helper: 0 before t0, eased between t0 and t0+dur */
function rv(elapsed, t0, dur) { return K.ease(K.beat(elapsed, t0, dur === undefined ? 0.8 : dur)); }

function fade(P_, a) { P_.alpha(a); }

/* ---------- scene 1: four knobs ---------- */
function drawKnobs(P_, t, e) {
  header(P_, 'A data-flow framework is four answers', 'Read any unfamiliar analysis off these four, instead of memorising its formulas.');

  var cards = [
    { k: '1. Direction', v: 'forward or backward', d: 'do the facts describe the past or the future?' },
    { k: '2. Domain and meet', v: 'a lattice, and \u2293', d: 'what a fact is, and how two paths combine' },
    { k: '3. Transfer functions', v: 'f\u2093 : GEN \u222a (IN \u2212 KILL)', d: 'what one block does to a fact passing through' },
    { k: '4. Boundary value', v: 'at entry, or at exit', d: 'the one value set by hand, never computed' }
  ];
  cards.forEach(function (c, i) {
    var a = rv(e, i * 10, 0.9);
    if (a <= 0) return;
    var x = (i % 2 === 0) ? 24 : 464;
    var y = (i < 2) ? 58 : 168;
    fade(P_, a);
    panel(P_, x, y, 412, 96, { fill: PAL.surface, stroke: PAL.accentDim, sw: 1.6 });
    P_.text(x + 14, y + 12, c.k, { size: 11, mono: true, color: PAL.accent, bold: true });
    P_.text(x + 14, y + 32, c.v, { size: 15, mono: true, bold: true, color: PAL.ink });
    P_.text(x + 14, y + 60, c.d, { size: 12, color: PAL.dim });
    fade(P_, 1);
  });

  var a4 = rv(e, 21, 0.9);
  if (a4 > 0) {
    fade(P_, a4);
    panel(P_, 24, 288, 852, 150, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(40, 302, 'The two equations, and nothing else', { size: 12, mono: true, color: PAL.accent, bold: true });
    P_.text(40, 330, 'IN[b]  =  \u2293  OUT[p]   for every predecessor p', { size: 16, mono: true, color: PAL.ink });
    P_.text(40, 360, 'OUT[b] =  f\u2093 ( IN[b] )', { size: 16, mono: true, color: PAL.ink });
    P_.text(40, 394, 'forward: IN from predecessors, boundary at entry', { size: 12, color: PAL.dim });
    P_.text(40, 414, 'backward: OUT from successors, boundary at exit', { size: 12, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 2: the lattice ---------- */
function drawLattice(P_, t, e) {
  header(P_, 'The lattice is the analysis', 'Two variables, four facts. The order decides what \u201cmore precise\u201d means.');

  var a1 = rv(e, 30, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    var cx = 170, top = 78, mid = 168, bot = 258;
    var nTop = { x: cx, y: top, l: '{p, q}' };
    var nL = { x: cx - 72, y: mid, l: '{p}' };
    var nR = { x: cx + 72, y: mid, l: '{q}' };
    var nBot = { x: cx, y: bot, l: '\u2205' };
    /* edges */
    [[nTop, nL], [nTop, nR], [nL, nBot], [nR, nBot]].forEach(function (ed) {
      P_.line(ed[0].x, ed[0].y + 16, ed[1].x, ed[1].y - 16, { stroke: PAL.border, sw: 1.6 });
    });
    [nTop, nL, nR, nBot].forEach(function (n, i) {
      panel(P_, n.x - 34, n.y - 16, 68, 32, { fill: PAL.surface, stroke: PAL.accent, sw: 1.6, radius: 7 });
      P_.text(n.x, n.y, n.l, { size: 13, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    });
    P_.text(cx, top - 30, 'top', { size: 11, mono: true, align: 'center', color: PAL.dim });
    P_.text(cx, bot + 30, 'bottom', { size: 11, mono: true, align: 'center', color: PAL.dim });
    P_.text(cx, 300, 'order: subset', { size: 11, mono: true, align: 'center', color: PAL.dim });
    fade(P_, 1);
  }

  var a2 = rv(e, 40, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 330, 58, 262, 170, { fill: PAL.validDim, stroke: PAL.valid, sw: 1.6 });
    P_.text(346, 72, 'MAY analysis', { size: 11, mono: true, bold: true, color: PAL.valid });
    P_.text(346, 92, 'meet = union', { size: 14, mono: true, bold: true, color: PAL.ink });
    P_.text(346, 118, 'a fact survives if SOME path', { size: 12, color: PAL.ink });
    P_.text(346, 136, 'carries it', { size: 12, color: PAL.ink });
    P_.text(346, 162, 'top = the whole set', { size: 12, mono: true, color: PAL.dim });
    P_.text(346, 182, 'bottom = \u2205', { size: 12, mono: true, color: PAL.dim });
    P_.text(346, 206, 'liveness, reaching defs', { size: 11, color: PAL.dim });

    panel(P_, 610, 58, 266, 170, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1.6 });
    P_.text(626, 72, 'MUST analysis', { size: 11, mono: true, bold: true, color: PAL.warn });
    P_.text(626, 92, 'meet = intersection', { size: 14, mono: true, bold: true, color: PAL.ink });
    P_.text(626, 118, 'a fact survives only if EVERY', { size: 12, color: PAL.ink });
    P_.text(626, 136, 'path carries it', { size: 12, color: PAL.ink });
    P_.text(626, 162, 'top = \u2205 (order reversed)', { size: 12, mono: true, color: PAL.dim });
    P_.text(626, 182, 'bottom = the whole set', { size: 12, mono: true, color: PAL.dim });
    P_.text(626, 206, 'available expressions', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = rv(e, 50, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 330, 246, 546, 84, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(346, 258, 'The same four facts, ordered the other way', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(346, 282, 'subset order:  \u2205  \u2286  {p}  \u2286  {p, q}     meet = \u222a', { size: 13, mono: true, color: PAL.ink });
    P_.text(346, 306, 'superset order: {p, q}  \u2287  {p}  \u2287  \u2205     meet = \u2229', { size: 13, mono: true, color: PAL.ink });
    fade(P_, 1);
  }

  panel(P_, 330, 348, 546, 90, { fill: PAL.surface, stroke: PAL.border });
  P_.text(346, 360, 'A lattice is a partial order where every pair has a meet', { size: 12, mono: true, bold: true, color: PAL.accent });
  P_.text(346, 384, 'x \u2291 y  iff  x \u2293 y = x', { size: 13, mono: true, color: PAL.ink });
  P_.text(346, 408, 'meet is commutative, idempotent and associative, and', { size: 11, color: PAL.dim });
  P_.text(346, 424, 'x \u2293 top = x for every x', { size: 11, color: PAL.dim });
}

/* ---------- scene 3: GEN and KILL ---------- */
function drawGenKill(P_, t, e) {
  header(P_, 'GEN, KILL and the transfer function', 'One block:  x = a + b   then   a = 1');

  var a1 = rv(e, 60, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    blockBox(P_, 24, 70, 250, 92, 'block B', ['1   x = a + b', '2   a = 1'], { stroke: PAL.accentDim });
    P_.text(24, 178, 'GEN and KILL are read from', { size: 11, color: PAL.dim });
    P_.text(24, 194, 'this block alone, with no', { size: 11, color: PAL.dim });
    P_.text(24, 210, 'knowledge of the rest.', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a2 = rv(e, 70, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    var rows = [
      { k: 'definitions', g: '{d1, d2}', x: 'every other definition of x or a', c: PAL.info },
      { k: 'variables', g: '{a, b, x}', x: 'x, a  (written here)', c: PAL.valid },
      { k: 'expressions', g: '{a+b, x+1}', x: 'a+b  (a is written)', c: PAL.warn }
    ];
    panel(P_, 300, 62, 576, 176, { fill: PAL.surface, stroke: PAL.border });
    P_.text(316, 74, 'what GEN and KILL are, for three kinds of fact', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(316, 96, 'fact', { size: 11, mono: true, color: PAL.dim });
    P_.text(430, 96, 'GEN', { size: 11, mono: true, color: PAL.dim });
    P_.text(556, 96, 'KILL', { size: 11, mono: true, color: PAL.dim });
    rows.forEach(function (r, i) {
      var y = 120 + i * 38;
      P_.text(316, y, r.k, { size: 13, mono: true, bold: true, color: r.c });
      P_.text(430, y, r.g, { size: 13, mono: true, color: PAL.ink });
      P_.text(556, y, r.x, { size: 12, color: PAL.ink });
    });
    fade(P_, 1);
  }

  var a3 = rv(e, 80, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 24, 258, 852, 84, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(40, 270, 'the transfer function of a block', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(40, 298, 'OUT[b]  =  GEN[b]  \u222a  ( IN[b]  \u2212  KILL[b] )', { size: 18, mono: true, color: PAL.ink });
    P_.text(40, 326, 'GEN is added after the subtraction: a fact generated inside the block survives its own block', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  panel(P_, 24, 356, 852, 92, { fill: PAL.surface, stroke: PAL.border });
  P_.text(40, 368, 'KILL is not one idea', { size: 12, mono: true, bold: true, color: PAL.invalid });
  P_.text(40, 392, 'a definition is killed by any other definition of the same variable', { size: 12, color: PAL.ink });
  P_.text(40, 412, 'a variable is killed by an assignment to it', { size: 12, color: PAL.ink });
  P_.text(40, 432, 'an expression is killed by an assignment to any variable it mentions', { size: 12, color: PAL.ink });
}

/* ---------- scene 4: direction ---------- */
function drawDirection(P_, t, e) {
  header(P_, 'Forward and backward are the same equations', 'Swap IN and OUT, predecessors for successors, entry for exit.');

  var a1 = rv(e, 90, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    P_.text(24, 68, 'FORWARD', { size: 11, mono: true, bold: true, color: PAL.valid });
    panel(P_, 100, 82, 60, 34, { fill: PAL.validDim, stroke: PAL.valid, radius: 6 });
    P_.text(130, 99, 'entry', { size: 11, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    ['B1', 'B2', 'B3'].forEach(function (b, i) {
      var x = 200 + i * 150;
      panel(P_, x, 82, 90, 34, { fill: PAL.surface, stroke: PAL.accent, radius: 6 });
      P_.text(x + 45, 99, b, { size: 13, mono: true, align: 'center', base: 'middle', color: PAL.ink });
      P_.arrow(x - 34, 99, x - 4, 99, { stroke: PAL.valid, sw: 1.6, head: 8 });
    });
    P_.arrow(166, 99, 196, 99, { stroke: PAL.valid, sw: 1.6, head: 8 });
    P_.text(24, 138, 'IN[b] = \u2293 OUT[pred]', { size: 13, mono: true, color: PAL.ink });
    P_.text(24, 158, 'OUT[b] = f(IN[b])', { size: 13, mono: true, color: PAL.ink });
    P_.text(560, 140, 'boundary sits at the entry', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a2 = rv(e, 100, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    P_.text(24, 208, 'BACKWARD', { size: 11, mono: true, bold: true, color: PAL.info });
    ['B1', 'B2', 'B3'].forEach(function (b, i) {
      var x = 200 + i * 150;
      panel(P_, x, 222, 90, 34, { fill: PAL.surface, stroke: PAL.accent, radius: 6 });
      P_.text(x + 45, 239, b, { size: 13, mono: true, align: 'center', base: 'middle', color: PAL.ink });
      P_.arrow(x + 124, 239, x + 94, 239, { stroke: PAL.info, sw: 1.6, head: 8 });
    });
    panel(P_, 660, 222, 60, 34, { fill: PAL.infoDim || PAL.surface2, stroke: PAL.info, radius: 6 });
    P_.text(690, 239, 'exit', { size: 11, mono: true, align: 'center', base: 'middle', color: PAL.ink });
    P_.arrow(646, 239, 656, 239, { stroke: PAL.info, sw: 1.6, head: 8 });
    P_.text(24, 278, 'OUT[b] = \u2293 IN[succ]', { size: 13, mono: true, color: PAL.ink });
    P_.text(24, 298, 'IN[b] = f(OUT[b])', { size: 13, mono: true, color: PAL.ink });
    P_.text(560, 280, 'boundary sits at the exit', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = rv(e, 110, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 24, 322, 852, 126, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(40, 334, 'One solver, two directions', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(40, 358, 'sweep the blocks in the direction the facts travel, compute the neighbour side first,', { size: 12, color: PAL.ink });
    P_.text(40, 378, 'then apply the transfer function to get the other side.', { size: 12, color: PAL.ink });
    P_.text(40, 404, 'forward  : IN from pred, then OUT = f(IN)', { size: 12, mono: true, color: PAL.valid });
    P_.text(40, 424, 'backward : OUT from succ, then IN = f(OUT)', { size: 12, mono: true, color: PAL.info });
    P_.text(40, 442, 'the only thing that does not rename itself is the boundary value', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 5: the fixpoint ---------- */
function drawFixpoint(P_, t, e) {
  header(P_, 'Iterate until nothing changes', 'Available expressions on a four-block diamond, computed here.');

  var a1 = rv(e, 120, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    blockBox(P_, 30, 70, 130, 46, 'B1', ['t = a + b'], { stroke: PAL.accentDim });
    blockBox(P_, 10, 160, 120, 46, 'B2', ['u = a + b'], { stroke: PAL.accentDim });
    blockBox(P_, 170, 160, 120, 46, 'B3', ['a = 5'], { stroke: PAL.invalid });
    blockBox(P_, 70, 250, 150, 46, 'B4', ['v = a + b'], { stroke: PAL.accentDim });
    P_.arrow(95, 118, 75, 156, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(105, 118, 220, 156, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(80, 208, 110, 246, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(215, 208, 180, 246, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.text(10, 312, 'a = 5 kills a+b', { size: 11, mono: true, color: PAL.invalid });
    fade(P_, 1);
  }

  var a2 = rv(e, 130, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 330, 62, 546, 190, { fill: PAL.surface, stroke: PAL.border });
    P_.text(346, 74, 'round by round, meet = intersection', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(346, 98, 'round', { size: 11, mono: true, color: PAL.dim });
    P_.text(410, 98, 'IN[B2]', { size: 11, mono: true, color: PAL.dim });
    P_.text(500, 98, 'IN[B3]', { size: 11, mono: true, color: PAL.dim });
    P_.text(590, 98, 'IN[B4]', { size: 11, mono: true, color: PAL.dim });
    P_.text(680, 98, 'changed?', { size: 11, mono: true, color: PAL.dim });
    V.aeCap.rounds.forEach(function (r, i) {
      var y = 122 + i * 34;
      var isLast = (i === V.aeCap.rounds.length - 1);
      P_.text(346, y, 'round ' + (i + 1), { size: 12, mono: true, color: PAL.ink });
      P_.text(410, y, str(r.IN.B2), { size: 12, mono: true, color: PAL.ink });
      P_.text(500, y, str(r.IN.B3), { size: 12, mono: true, color: PAL.ink });
      P_.text(590, y, str(r.IN.B4), { size: 12, mono: true, color: PAL.ink });
      P_.text(680, y, isLast ? 'no \u2014 stop' : 'yes', { size: 12, mono: true, color: isLast ? PAL.valid : PAL.warn });
    });
    P_.text(346, 232, 'the confirming round is part of the count: ' + V.aeRounds + ' rounds', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = rv(e, 140, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 330, 264, 546, 184, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(346, 276, 'Why it must stop', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(346, 302, '1. the lattice has finite height', { size: 12, color: PAL.ink });
    P_.text(346, 324, 'five variables: longest chain \u2205 \u2282 {a} \u2282 {a,i} \u2282 ... has length ' + V.height, { size: 11, mono: true, color: PAL.dim });
    P_.text(346, 350, '2. every transfer function is monotone', { size: 12, color: PAL.ink });
    P_.text(346, 372, 'so a value never climbs back up the lattice', { size: 11, color: PAL.dim });
    P_.text(346, 398, 'rounds  \u2264  height \u00d7 blocks', { size: 13, mono: true, color: PAL.ink });
    P_.text(346, 422, 'liveness here: ' + V.rounds + ' rounds against a bound of ' + (V.height * 4), { size: 11, mono: true, color: PAL.valid });
    P_.text(346, 440, 'finite height alone is not enough: monotonicity is the other half', { size: 10, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 6: liveness on the 2023 graph ---------- */
function drawLiveness(P_, t, e) {
  header(P_, 'Liveness on a four-block graph', 'GATE CSE 2023: live variables at the exit of each block.');

  var a1 = rv(e, 150, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    blockBox(P_, 40, 66, 170, 66, 'B1', ['i = m - 1', 'j = n', 'a = 10'], { stroke: PAL.accentDim });
    blockBox(P_, 40, 176, 170, 50, 'B2', ['i = i + 1', 'j = j - 1'], { stroke: PAL.accentDim });
    blockBox(P_, 262, 128, 150, 42, 'B3', ['a = 20'], { stroke: PAL.accentDim });
    blockBox(P_, 262, 250, 150, 42, 'B4', ['i = a + 1'], { stroke: PAL.accentDim });
    panel(P_, 452, 254, 66, 34, { fill: PAL.surface2, stroke: PAL.border, radius: 6 });
    P_.text(485, 271, 'EXIT', { size: 11, mono: true, align: 'center', base: 'middle', color: PAL.dim });
    P_.arrow(125, 132, 125, 172, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(210, 190, 258, 156, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(210, 210, 258, 258, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(337, 170, 337, 246, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(412, 271, 448, 271, { stroke: PAL.border, sw: 1.5, head: 8 });
    /* the back edge, drawn as a dashed return along the bottom-left */
    P_.line(300, 292, 300, 330, { stroke: PAL.invalid, sw: 1.5, dash: [5, 4] });
    P_.line(300, 330, 125, 330, { stroke: PAL.invalid, sw: 1.5, dash: [5, 4] });
    P_.arrow(125, 330, 125, 226, { stroke: PAL.invalid, sw: 1.5, head: 8, dash: [5, 4] });
    P_.text(150, 344, 'back edge  B4 \u2192 B2', { size: 11, mono: true, color: PAL.invalid });
    fade(P_, 1);
  }

  var a2 = rv(e, 160, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 520, 62, 356, 116, { fill: PAL.surface, stroke: PAL.border });
    P_.text(534, 74, 'USE and DEF, read from each block', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(534, 98, 'block', { size: 11, mono: true, color: PAL.dim });
    P_.text(600, 98, 'USE', { size: 11, mono: true, color: PAL.dim });
    P_.text(720, 98, 'DEF', { size: 11, mono: true, color: PAL.dim });
    CFG_2023.order.forEach(function (b, i) {
      var y = 120 + i * 14;
      P_.text(534, y, b, { size: 11, mono: true, color: PAL.ink });
      P_.text(600, y, str(CFG_2023.blocks[b].use), { size: 11, mono: true, color: PAL.ink });
      P_.text(720, y, str(CFG_2023.blocks[b].def), { size: 11, mono: true, color: PAL.ink });
    });
    fade(P_, 1);
  }

  var a3 = rv(e, 170, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 520, 190, 356, 240, { fill: PAL.surface, stroke: PAL.border });
    P_.text(534, 202, 'OUT after ' + V.rounds + ' rounds (the last changed nothing)', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(534, 226, 'round', { size: 11, mono: true, color: PAL.dim });
    ['B1', 'B2', 'B3', 'B4'].forEach(function (b, i) {
      P_.text(600 + i * 68, 226, b, { size: 11, mono: true, color: PAL.dim });
    });
    V.live.rounds.forEach(function (r, i) {
      var y = 248 + i * 30;
      P_.text(534, y, 'r' + (i + 1), { size: 11, mono: true, color: PAL.dim });
      ['B1', 'B2', 'B3', 'B4'].forEach(function (b, j) {
        P_.text(600 + j * 68, y, str(r.OUT[b]), { size: 11, mono: true, color: PAL.ink });
      });
    });
    var yf = 248 + V.live.rounds.length * 30 + 14;
    P_.text(534, yf, 'answer: option ' + V.optMatches.join(' / '), { size: 13, mono: true, bold: true, color: PAL.valid });
    P_.text(534, yf + 22, 'every exit set reproduced from the equations', { size: 10, color: PAL.dim });
    P_.text(534, yf + 38, 'and confirmed by a path search at 20 pairs', { size: 10, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 7: available expressions ---------- */
function drawAvailable(P_, t, e) {
  header(P_, 'Available expressions, and the union trap', 'An expression is available if every path computes it and none destroys it.');

  var a1 = rv(e, 180, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    blockBox(P_, 40, 66, 160, 42, 'B1', ['t = a + b'], { stroke: PAL.accentDim });
    blockBox(P_, 10, 152, 150, 42, 'B2', ['u = a + b'], { stroke: PAL.valid });
    blockBox(P_, 196, 152, 150, 42, 'B3', ['a = 5'], { stroke: PAL.invalid });
    blockBox(P_, 70, 244, 170, 42, 'B4', ['v = a + b'], { stroke: PAL.accentDim });
    P_.arrow(100, 108, 78, 148, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(130, 108, 250, 148, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(88, 194, 118, 240, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(240, 194, 200, 240, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.text(10, 306, 'left branch computes a+b', { size: 10, mono: true, color: PAL.valid });
    P_.text(10, 322, 'right branch destroys it', { size: 10, mono: true, color: PAL.invalid });
    P_.text(10, 344, 'IN[B2] = ' + str(V.aeCap.IN.B2), { size: 12, mono: true, bold: true, color: PAL.valid });
    P_.text(10, 364, 'IN[B4] = ' + str(V.aeCap.IN.B4), { size: 12, mono: true, bold: true, color: PAL.invalid });
    fade(P_, 1);
  }

  var a2 = rv(e, 190, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 400, 62, 476, 108, { fill: PAL.validDim, stroke: PAL.valid, sw: 1.6 });
    P_.text(416, 74, 'meet = intersection  (correct)', { size: 11, mono: true, bold: true, color: PAL.valid });
    P_.text(416, 98, 'IN[B4] = OUT[B2] \u2229 OUT[B3]', { size: 13, mono: true, color: PAL.ink });
    P_.text(416, 120, '= ' + str(V.aeCap.OUT.B2) + ' \u2229 ' + str(V.aeCap.OUT.B3) + ' = ' + str(V.aeCap.IN.B4), { size: 13, mono: true, color: PAL.ink });
    P_.text(416, 146, 'so v = a + b must be recomputed after the join', { size: 11, color: PAL.dim });

    panel(P_, 400, 182, 476, 108, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.6 });
    P_.text(416, 194, 'meet = union  (wrong)', { size: 11, mono: true, bold: true, color: PAL.invalid });
    P_.text(416, 218, 'IN[B4] = OUT[B2] \u222a OUT[B3]', { size: 13, mono: true, color: PAL.ink });
    P_.text(416, 240, '= ' + str(V.aeCup.OUT.B2) + ' \u222a ' + str(V.aeCup.OUT.B3) + ' = ' + str(V.aeCup.IN.B4), { size: 13, mono: true, color: PAL.ink });
    P_.text(416, 266, 'it would reuse t on a path where a has changed', { size: 11, color: PAL.invalid });
    fade(P_, 1);
  }

  var a3 = rv(e, 200, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 400, 302, 476, 146, { fill: PAL.surface, stroke: PAL.border });
    P_.text(416, 314, 'Where the optimisation applies', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(416, 340, 'B2: a+b is in IN, so u = a + b \u2192 u = t', { size: 12, mono: true, color: PAL.valid });
    P_.text(416, 362, 'B4: a+b is not in IN, so v = a + b stays', { size: 12, mono: true, color: PAL.invalid });
    P_.text(416, 388, 'redundancy is a property of a point, not of an expression', { size: 11, color: PAL.dim });
    P_.text(416, 410, 'GEN[a = 5] = ' + str(AE.blocks.B3.gen) + ',  KILL[a = 5] = ' + str(AE.blocks.B3.kill), { size: 11, mono: true, color: PAL.dim });
    P_.text(416, 432, 'one killing path is enough to make an expression unavailable', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 8: reaching definitions ---------- */
function drawReaching(P_, t, e) {
  header(P_, 'Reaching definitions', 'The facts are assignments, and one surviving path is enough.');

  var a1 = rv(e, 210, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    blockBox(P_, 40, 66, 180, 42, 'B1', ['d1: t = a + b'], { stroke: PAL.accentDim });
    blockBox(P_, 10, 152, 170, 42, 'B2', ['d2: u = a + b'], { stroke: PAL.accentDim });
    blockBox(P_, 206, 152, 170, 42, 'B3', ['d3: a = 5'], { stroke: PAL.invalid });
    blockBox(P_, 60, 244, 190, 42, 'B4', ['d4: v = a + b'], { stroke: PAL.accentDim });
    P_.arrow(110, 108, 88, 148, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(140, 108, 270, 148, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(88, 194, 118, 240, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(260, 194, 200, 240, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.text(10, 306, 'd3 kills d1 and d2 (same variable a)', { size: 10, mono: true, color: PAL.invalid });
    fade(P_, 1);
  }

  var a2 = rv(e, 220, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 400, 62, 476, 170, { fill: PAL.surface, stroke: PAL.border });
    P_.text(416, 74, 'forward, meet = union', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(416, 100, 'IN[B4] = OUT[B2] \u222a OUT[B3]', { size: 13, mono: true, color: PAL.ink });
    P_.text(416, 122, '= ' + str(V.rd.OUT.B2) + ' \u222a ' + str(V.rd.OUT.B3), { size: 13, mono: true, color: PAL.ink });
    P_.text(416, 144, '= ' + str(V.rd.IN.B4), { size: 13, mono: true, bold: true, color: PAL.valid });
    P_.text(416, 170, 'OUT[B3] = ' + str(V.rd.OUT.B3) + '  \u2014 d3 killed the rest', { size: 12, mono: true, color: PAL.ink });
    P_.text(416, 196, 'OUT[B4] = ' + str(V.rd.OUT.B4), { size: 12, mono: true, color: PAL.ink });
    P_.text(416, 218, 'a definition kills every other definition of its variable', { size: 10, color: PAL.dim });
    fade(P_, 1);
  }

  var a3 = rv(e, 230, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 400, 248, 476, 200, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(416, 260, 'A second route: search the paths', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(416, 286, 'd reaches the entry of b  iff  some path from d\'s', { size: 12, color: PAL.ink });
    P_.text(416, 306, 'block to b carries it with no redefinition of', { size: 12, color: PAL.ink });
    P_.text(416, 326, 'the same variable in between', { size: 12, color: PAL.ink });
    P_.text(416, 354, 'IN[B1] = ' + str(V.rd.IN.B1) + '   IN[B2] = ' + str(V.rd.IN.B2), { size: 11, mono: true, color: PAL.ink });
    P_.text(416, 374, 'IN[B3] = ' + str(V.rd.IN.B3) + '   IN[B4] = ' + str(V.rd.IN.B4), { size: 11, mono: true, color: PAL.ink });
    P_.text(416, 400, 'the fixpoint and the search agree at all 16 pairs,', { size: 10, color: PAL.dim });
    P_.text(416, 416, 'which is what makes the answer a check and not a claim', { size: 10, color: PAL.dim });
    fade(P_, 1);
  }
}

/* ---------- scene 9: constant propagation ---------- */
function drawConstant(P_, t, e) {
  header(P_, 'Constant propagation is not distributive', 'Meet over all paths against the fixpoint, on the same program.');

  var a1 = rv(e, 240, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    panel(P_, 20, 62, 300, 96, { fill: PAL.surface, stroke: PAL.border });
    P_.text(34, 72, 'the domain', { size: 11, mono: true, bold: true, color: PAL.accent });
    P_.text(34, 94, 'UNDEF  (top: nothing known)', { size: 11, mono: true, color: PAL.dim });
    P_.text(34, 114, '1, 2, 3, ...  (a constant)', { size: 11, mono: true, color: PAL.ink });
    P_.text(34, 134, 'NAC  (bottom: not a constant)', { size: 11, mono: true, color: PAL.invalid });
    P_.text(34, 150, 'meet of 1 and 2 is NAC', { size: 10, mono: true, color: PAL.dim });

    blockBox(P_, 20, 176, 300, 34, 'B1', ['if p goto B2 else B3'], { stroke: PAL.accentDim });
    blockBox(P_, 20, 240, 140, 46, 'B2', ['x = 1', 'y = 2'], { stroke: PAL.accentDim });
    blockBox(P_, 180, 240, 140, 46, 'B3', ['x = 2', 'y = 1'], { stroke: PAL.accentDim });
    blockBox(P_, 20, 316, 300, 34, 'B4', ['z = x + y'], { stroke: PAL.valid });
    P_.arrow(90, 210, 90, 236, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(200, 210, 250, 236, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(90, 286, 110, 312, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.arrow(250, 286, 220, 312, { stroke: PAL.border, sw: 1.5, head: 8 });
    P_.text(20, 366, 'both branches reach the same addition', { size: 11, color: PAL.dim });
    fade(P_, 1);
  }

  var a2 = rv(e, 250, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 350, 62, 250, 130, { fill: PAL.surface, stroke: PAL.valid, sw: 1.6 });
    P_.text(364, 74, 'meet over all paths', { size: 11, mono: true, bold: true, color: PAL.valid });
    P_.text(364, 100, 'path 1: x=1, y=2', { size: 11, mono: true, color: PAL.ink });
    P_.text(364, 118, 'path 2: x=2, y=1', { size: 11, mono: true, color: PAL.ink });
    P_.text(364, 144, 'z = 3 on both', { size: 12, mono: true, color: PAL.ink });
    P_.text(364, 168, 'answer: z = ' + V.cp.mop.z, { size: 15, mono: true, bold: true, color: PAL.valid });

    panel(P_, 618, 62, 258, 130, { fill: PAL.surface, stroke: PAL.warn, sw: 1.6 });
    P_.text(632, 74, 'the fixpoint', { size: 11, mono: true, bold: true, color: PAL.warn });
    P_.text(632, 100, 'meet first: x = ' + V.cp.mfpIn.x + ', y = ' + V.cp.mfpIn.y, { size: 11, mono: true, color: PAL.ink });
    P_.text(632, 122, 'then add: ' + V.cp.mfpIn.x + ' + ' + V.cp.mfpIn.y, { size: 11, mono: true, color: PAL.ink });
    P_.text(632, 144, 'z is not a single constant', { size: 11, color: PAL.ink });
    P_.text(632, 168, 'answer: z = ' + V.cp.mfp.z, { size: 15, mono: true, bold: true, color: PAL.warn });
    fade(P_, 1);
  }

  var a3 = rv(e, 260, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 350, 208, 526, 240, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(366, 220, 'the failure, as one equation', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(366, 248, 'f ( x \u2293 y )  =  ' + V.cp.lhs + '      f(x) \u2293 f(y)  =  ' + V.cp.rhs, { size: 15, mono: true, color: PAL.ink });
    P_.text(366, 274, 'so f ( x \u2293 y )  \u2291  f(x) \u2293 f(y)  but not equal', { size: 12, mono: true, color: PAL.invalid });
    P_.text(366, 300, 'The fixpoint is always the safe side of the inequality;', { size: 12, color: PAL.ink });
    P_.text(366, 320, 'it can lose information that a path-by-path answer keeps.', { size: 12, color: PAL.ink });
    P_.text(366, 348, 'gen-kill analyses: ' + V.gkBad + ' of ' + V.gkPairs + ' pairs break distributivity', { size: 11, mono: true, color: PAL.valid });
    P_.text(366, 368, 'constant propagation: the pair above breaks it', { size: 11, mono: true, color: PAL.invalid });
    P_.text(366, 396, 'A compiler cannot enumerate paths in general, so it computes', { size: 11, color: PAL.dim });
    P_.text(366, 412, 'the fixpoint. The other answer is a bound, not an algorithm.', { size: 11, color: PAL.dim });
    P_.text(366, 434, 'Distributive \u21d2 the two answers coincide.', { size: 11, mono: true, color: PAL.ink });
    fade(P_, 1);
  }
}

/* ---------- scene 10: classification ---------- */
function drawClassify(P_, t, e) {
  header(P_, 'The classification, and three traps', 'Two questions place every analysis: past or future, some path or all paths.');

  var a1 = rv(e, 270, 0.9);
  if (a1 > 0) {
    fade(P_, a1);
    var x0 = 120, y0 = 92, cw = 350, ch = 88;
    P_.text(x0 + cw / 2, y0 - 24, 'FORWARD', { size: 11, mono: true, bold: true, align: 'center', color: PAL.valid });
    P_.text(x0 + cw + 14 + cw / 2, y0 - 24, 'BACKWARD', { size: 11, mono: true, bold: true, align: 'center', color: PAL.info });
    P_.text(24, y0 + ch / 2, 'MAY', { size: 11, mono: true, bold: true, color: PAL.valid });
    P_.text(24, y0 + ch + 14 + ch / 2, 'MUST', { size: 11, mono: true, bold: true, color: PAL.warn });

    function cell(x, y, name, note, tone) {
      panel(P_, x, y, cw, ch, { fill: tone === 'may' ? PAL.surface : PAL.surface2, stroke: tone === 'may' ? PAL.valid : PAL.warn, sw: 1.5 });
      P_.text(x + 14, y + 16, name, { size: 13, mono: true, bold: true, color: PAL.ink });
      P_.text(x + 14, y + 40, note, { size: 11, color: PAL.dim });
    }
    cell(x0, y0, 'Reaching definitions', 'union \u00b7 facts are assignments \u00b7 drives constant propagation', 'may');
    cell(x0 + cw + 14, y0, 'Liveness', 'union \u00b7 facts are variables \u00b7 drives register allocation', 'may');
    cell(x0, y0 + ch + 14, 'Available expressions', 'intersection \u00b7 facts are expressions \u00b7 drives global CSE', 'must');
    cell(x0 + cw + 14, y0 + ch + 14, 'Very busy expressions', 'intersection \u00b7 facts are expressions \u00b7 drives hoisting', 'must');
    fade(P_, 1);
  }

  var a2 = rv(e, 280, 0.9);
  if (a2 > 0) {
    fade(P_, a2);
    panel(P_, 24, 296, 852, 74, { fill: PAL.invalidDim, stroke: PAL.invalid, sw: 1.5 });
    P_.text(40, 308, 'Three errors that cost marks', { size: 12, mono: true, bold: true, color: PAL.invalid });
    P_.text(40, 332, '1. union at a must-join', { size: 12, mono: true, color: PAL.ink });
    P_.text(40, 352, '2. a forgotten back edge', { size: 12, mono: true, color: PAL.ink });
    P_.text(430, 332, '3. a dropped GEN set', { size: 12, mono: true, color: PAL.ink });
    P_.text(430, 352, '4. counting only the changed rounds', { size: 12, mono: true, color: PAL.ink });
    fade(P_, 1);
  }

  var a3 = rv(e, 290, 0.9);
  if (a3 > 0) {
    fade(P_, a3);
    panel(P_, 24, 384, 852, 66, { fill: PAL.surface2, stroke: PAL.border });
    P_.text(40, 396, 'Two answers per analysis: what it computes, and which optimisation it enables', { size: 12, mono: true, bold: true, color: PAL.accent });
    P_.text(40, 420, 'liveness \u2192 register allocation, dead-code elimination     available expressions \u2192 global CSE', { size: 11, color: PAL.ink });
    P_.text(40, 438, 'reaching definitions \u2192 constant propagation, use-def chains     constant folding is neither of the first two', { size: 11, color: PAL.ink });
    fade(P_, 1);
  }
}

/* ---------- the frame dispatcher ---------- */

var SCENE_DRAW = {
  'four-knobs': drawKnobs,
  'lattice': drawLattice,
  'genkill': drawGenKill,
  'direction': drawDirection,
  'fixpoint': drawFixpoint,
  'liveness': drawLiveness,
  'available': drawAvailable,
  'reaching': drawReaching,
  'constant': drawConstant,
  'classify': drawClassify
};

function drawFrame(P_) {
  if (!P_) return;
  P_.alpha(1);
  P_.clear();
  var scenes = (window.LESSON_TIMELINE && window.LESSON_TIMELINE.scenes) || [];
  var e = K ? K.state.elapsed : 0;
  var i = K ? K.sceneAt(e) : 0;
  var sc = scenes[i];
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (fn) fn(P_, e, e);
  /* scene footer: which scene of how many, and the one-line takeaway */
  P_.alpha(1);
  P_.line(20, 452, 880, 452, { stroke: PAL.border, sw: 1 });
  P_.text(20, 458, 'scene ' + (i + 1) + ' of ' + scenes.length + '  \u00b7  ' + sc.title,
          { size: 10, mono: true, color: PAL.faint });
  P_.text(880, 458, 'all numbers computed by this page', { size: 10, mono: true, align: 'right', color: PAL.faint });
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
  if (fallback) fallback.classList.remove('show');

  var ok = false;
  if (window.p5 && holder && PR) {
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
    } catch (err) {
      console.error('p5 failed', err);
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
    } catch (err) {
      console.error('canvas fallback failed', err);
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

window.__MODEL = V;
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
