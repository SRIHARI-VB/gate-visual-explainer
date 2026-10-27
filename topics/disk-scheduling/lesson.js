(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (disk scheduling)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is. Every number the lesson quotes is computed here,
   and the checks below re-verify it against the definitions.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}
function near(a, b, eps) { eps = eps === undefined ? 1e-9 : eps; return Math.abs(a - b) <= eps; }

/* the reference queue: the one used by the standard textbook example */
var LO = 0, HI = 199;
var Q = [98, 183, 37, 122, 14, 124, 65, 67];
var HEAD = 53;

/* total head movement of a service sequence that begins at seq[0] */
function movement(seq) {
  var s = 0;
  for (var i = 1; i < seq.length; i++) s += Math.abs(seq[i] - seq[i - 1]);
  return s;
}

/* the legs, as a list, so a caption can print them */
function legs(seq) {
  var out = [];
  for (var i = 1; i < seq.length; i++) out.push(Math.abs(seq[i] - seq[i - 1]));
  return out;
}

/* number of direction reversals: a change of sign between consecutive legs */
function reversals(seq) {
  var dirs = [], n = 0;
  for (var i = 1; i < seq.length; i++) {
    var d = seq[i] - seq[i - 1];
    if (d !== 0) dirs.push(d > 0 ? 1 : -1);
  }
  for (var j = 1; j < dirs.length; j++) if (dirs[j] !== dirs[j - 1]) n++;
  return n;
}

/* ---------------- the six policies, as service sequences ---------------- */

function seqFCFS(reqs, head) { return [head].concat(reqs.slice()); }

function seqSSTF(reqs, head) {
  var left = reqs.slice(), cur = head, seq = [head];
  while (left.length) {
    var bi = 0, bd = Infinity;
    for (var i = 0; i < left.length; i++) {
      var d = Math.abs(left[i] - cur);
      /* tie rule, stated: the lower cylinder first */
      if (d < bd - 1e-9 || (near(d, bd) && left[i] < left[bi])) { bd = d; bi = i; }
    }
    cur = left[bi];
    seq.push(cur);
    left.splice(bi, 1);
  }
  return seq;
}

function seqSCAN(reqs, head, up, lo, hi) {
  lo = lo === undefined ? LO : lo; hi = hi === undefined ? HI : hi;
  var r = reqs.slice().sort(function (a, b) { return a - b; });
  var seq = [head], i;
  if (up) {
    for (i = 0; i < r.length; i++) if (r[i] >= head) seq.push(r[i]);
    seq.push(hi);
    for (i = r.length - 1; i >= 0; i--) if (r[i] < head) seq.push(r[i]);
  } else {
    for (i = r.length - 1; i >= 0; i--) if (r[i] <= head) seq.push(r[i]);
    seq.push(lo);
    for (i = 0; i < r.length; i++) if (r[i] > head) seq.push(r[i]);
  }
  return seq;
}

function seqLOOK(reqs, head, up) {
  var r = reqs.slice().sort(function (a, b) { return a - b; });
  var seq = [head], i;
  if (up) {
    for (i = 0; i < r.length; i++) if (r[i] >= head) seq.push(r[i]);
    for (i = r.length - 1; i >= 0; i--) if (r[i] < head) seq.push(r[i]);
  } else {
    for (i = r.length - 1; i >= 0; i--) if (r[i] <= head) seq.push(r[i]);
    for (i = 0; i < r.length; i++) if (r[i] > head) seq.push(r[i]);
  }
  return seq;
}

function seqCSCAN(reqs, head, up, lo, hi) {
  lo = lo === undefined ? LO : lo; hi = hi === undefined ? HI : hi;
  var r = reqs.slice().sort(function (a, b) { return a - b; });
  var seq = [head], i;
  if (up) {
    for (i = 0; i < r.length; i++) if (r[i] >= head) seq.push(r[i]);
    seq.push(hi); seq.push(lo);
    for (i = 0; i < r.length; i++) if (r[i] < head) seq.push(r[i]);
  } else {
    for (i = r.length - 1; i >= 0; i--) if (r[i] <= head) seq.push(r[i]);
    seq.push(lo); seq.push(hi);
    for (i = r.length - 1; i >= 0; i--) if (r[i] > head) seq.push(r[i]);
  }
  return seq;
}

function seqCLOOK(reqs, head, up) {
  var r = reqs.slice().sort(function (a, b) { return a - b; });
  var seq = [head], i;
  if (up) {
    for (i = 0; i < r.length; i++) if (r[i] >= head) seq.push(r[i]);
    for (i = 0; i < r.length; i++) if (r[i] < head) seq.push(r[i]);
  } else {
    for (i = r.length - 1; i >= 0; i--) if (r[i] <= head) seq.push(r[i]);
    for (i = r.length - 1; i >= 0; i--) if (r[i] > head) seq.push(r[i]);
  }
  return seq;
}

/* the true minimum over all orders: only used on small sets */
function optimalOrder(reqs, head) {
  var best = null;
  var idx = reqs.map(function (_, i) { return i; });
  function permute(arr, k) {
    if (k === arr.length) {
      var order = arr.map(function (i) { return reqs[i]; });
      var m = movement([head].concat(order));
      if (!best || m < best.m) best = { m: m, order: order };
      return;
    }
    for (var i = k; i < arr.length; i++) {
      var t = arr[k]; arr[k] = arr[i]; arr[i] = t;
      permute(arr, k + 1);
      t = arr[k]; arr[k] = arr[i]; arr[i] = t;
    }
  }
  permute(idx, 0);
  return best;
}

/* ---------------- the computed results ---------------- */

var R = {
  fcfs:   { seq: seqFCFS(Q, HEAD) },
  sstf:   { seq: seqSSTF(Q, HEAD) },
  scanUp: { seq: seqSCAN(Q, HEAD, true) },
  scanDn: { seq: seqSCAN(Q, HEAD, false) },
  cscan:  { seq: seqCSCAN(Q, HEAD, true) },
  lookUp: { seq: seqLOOK(Q, HEAD, true) },
  lookDn: { seq: seqLOOK(Q, HEAD, false) },
  clook:  { seq: seqCLOOK(Q, HEAD, true) },
  opt:    { seq: [HEAD].concat(optimalOrder(Q, HEAD).order) }
};
['fcfs', 'sstf', 'scanUp', 'scanDn', 'cscan', 'lookUp', 'lookDn', 'clook', 'opt'].forEach(function (k) {
  R[k].total = movement(R[k].seq);
  R[k].legs = legs(R[k].seq);
});

/* the greedy counterexample: head 50, requests 11, 40, 60, 90 */
var GQ = [11, 40, 60, 90], GH = 50;
var G = {
  sstf: seqSSTF(GQ, GH),
  opt: [GH].concat(optimalOrder(GQ, GH).order)
};
G.sstfTotal = movement(G.sstf);
G.optTotal = movement(G.opt);

/* GATE CSE 2015 Set 1 Q30: 100 tracks, head 50, SCAN toward 100 */
var G15Q = [45, 20, 90, 10, 50, 60, 80, 25, 70], G15H = 50;
var G15 = {
  sstf: seqSSTF(G15Q, G15H),
  scan: seqSCAN(G15Q, G15H, true, 1, 100),
  look: seqLOOK(G15Q, G15H, true)
};
G15.sstfTotal = movement(G15.sstf);
G15.scanTotal = movement(G15.scan);
G15.lookTotal = movement(G15.look);
G15.gap = Math.abs(G15.sstfTotal - G15.scanTotal);

/* GATE CSE 2014 Set 1 Q19: 201 cylinders, arm 100, when is 90 served */
var G14Q = [30, 85, 90, 100, 105, 110, 135, 145], G14H = 100;
var G14 = { seq: seqSSTF(G14Q, G14H) };
G14.before90 = G14.seq.indexOf(90) - 1;

/* GATE CSE 2016 Set 1 Q48: C-LOOK from 63, queue on 0..199 */
var G16Q = [47, 38, 121, 191, 87, 11, 92, 10], G16H = 63;
var G16 = { seq: seqCLOOK(G16Q, G16H, true) };
G16.total = movement(G16.seq);

/* GATE CSE 2020: five requests, head 100, SSTF */
var G20Q = [155, 85, 110, 30, 115], G20H = 100;
var G20 = { seq: seqSSTF(G20Q, G20H) };
G20.total = movement(G20.seq);

/* GATE CSE 2018 Set 1: SSTF, power per cylinder and per reversal */
var G18Q = [72, 134, 20, 86, 116, 16], G18H = 80;
var G18 = { seq: seqSSTF(G18Q, G18H) };
G18.total = movement(G18.seq);
G18.rev = reversals(G18.seq);
G18.power = G18.total / 100 * 20 + G18.rev * 15;

/* access-time arithmetic, all at stated parameters */
var RPM = 7200;
var ROT_MS = 60000 / RPM;             /* one rotation */
var LAT_MS = 60000 / (2 * RPM);       /* average rotational latency */
var SEEK_MS_PER_CYL = 0.1;
var SEEK_100 = 100 * SEEK_MS_PER_CYL; /* a 100-cylinder move */
var TRANSFER_MS = 4096 / (100 * 1024 * 1024) * 1000;  /* 4 KB at 100 MB/s */
var ACCESS_MS = SEEK_100 + LAT_MS + TRANSFER_MS;

/* ---------------- the checks ---------------- */

(function buildChecks() {
  chk('FCFS on the reference queue moves 640 cylinders',
      R.fcfs.total === 640, 'got ' + R.fcfs.total);
  chk('SSTF on the reference queue moves 236 cylinders',
      R.sstf.total === 236, 'got ' + R.sstf.total);
  chk('SSTF order on the reference queue is 65, 67, 37, 14, 98, 122, 124, 183',
      R.sstf.seq.slice(1).join(',') === '65,67,37,14,98,122,124,183',
      R.sstf.seq.slice(1).join(','));
  chk('SCAN upward from 53 moves 331 cylinders',
      R.scanUp.total === 331, 'got ' + R.scanUp.total);
  chk('SCAN downward from 53 moves 236 cylinders',
      R.scanDn.total === 236, 'got ' + R.scanDn.total);
  chk('C-SCAN upward moves 382 = 146 + 199 + 37',
      R.cscan.total === 382 && near(R.cscan.total, (HI - HEAD) + (HI - LO) + 37),
      'got ' + R.cscan.total);
  chk('LOOK upward moves 299 = 130 + 169',
      R.lookUp.total === 299 && near(R.lookUp.total, (183 - HEAD) + (183 - 14)),
      'got ' + R.lookUp.total);
  chk('C-LOOK upward moves 322 = 130 + 169 + 23',
      R.clook.total === 322, 'got ' + R.clook.total);
  chk('LOOK never exceeds SCAN on the reference queue (both directions)',
      R.lookUp.total <= R.scanUp.total && R.lookDn.total <= R.scanDn.total,
      R.lookUp.total + ' / ' + R.scanUp.total + ', ' + R.lookDn.total + ' / ' + R.scanDn.total);
  chk('C-LOOK never exceeds C-SCAN on the reference queue',
      R.clook.total <= R.cscan.total, R.clook.total + ' / ' + R.cscan.total);
  chk('the true minimum over all orders is 208, no policy beats it',
      R.opt.total === 208 &&
      [R.fcfs, R.sstf, R.scanUp, R.scanDn, R.cscan, R.lookUp, R.lookDn, R.clook]
        .every(function (x) { return x.total >= 208; }),
      'optimum ' + R.opt.total);
  chk('LOOK downward (208) equals the optimum, and the textbook SCAN figure of 208 is that schedule',
      R.lookDn.total === 208, 'got ' + R.lookDn.total);

  chk('every policy serves each reference request exactly once',
      [R.fcfs, R.sstf, R.scanUp, R.scanDn, R.cscan, R.lookUp, R.lookDn, R.clook, R.opt]
        .every(function (x) {
          var got = x.seq.filter(function (c) { return Q.indexOf(c) >= 0; }).sort(function (a, b) { return a - b; });
          return got.join(',') === Q.slice().sort(function (a, b) { return a - b; }).join(',');
        }), 'a policy dropped or repeated a request');

  chk('each total equals the sum of its own legs, recomputed independently',
      [R.fcfs, R.sstf, R.scanUp, R.cscan, R.lookUp, R.clook].every(function (x) {
        var s = 0;
        for (var i = 0; i < x.legs.length; i++) s += x.legs[i];
        return s === x.total;
      }), 'a total disagrees with its legs');

  chk('SSTF is not optimal: 139 against 118 on head 50, requests 11, 40, 60, 90',
      G.sstfTotal === 139 && G.optTotal === 118 && G.sstfTotal > G.optTotal,
      G.sstfTotal + ' / ' + G.optTotal);
  chk('the greedy counterexample legs are 10, 20, 30, 79',
      legs(G.sstf).join(',') === '10,20,30,79', legs(G.sstf).join(','));
  chk('the better order legs are 39, 29, 20, 30',
      legs(G.opt).join(',') === '39,29,20,30', legs(G.opt).join(','));

  chk('GATE 2015 Set 1: SSTF 130 and SCAN toward 100 gives 140',
      G15.sstfTotal === 130 && G15.scanTotal === 140,
      G15.sstfTotal + ' / ' + G15.scanTotal);
  chk('GATE 2015 Set 1: the gap is 10, and LOOK would give 120',
      G15.gap === 10 && G15.lookTotal === 120,
      'gap ' + G15.gap + ', look ' + G15.lookTotal);
  chk('GATE 2015 Set 1: the request at the head costs 0 movement',
      G15.sstf[0] === 50 && G15.sstf[1] === 50, G15.sstf.slice(0, 3).join(','));

  chk('GATE 2014 Set 1: cylinder 90 is the fourth request served, so after 3',
      G14.seq.indexOf(90) === 4 && G14.before90 === 3,
      'index ' + G14.seq.indexOf(90) + ', order ' + G14.seq.join(','));

  chk('GATE 2016 Set 1: C-LOOK from 63 gives 346',
      G16.total === 346, 'got ' + G16.total);
  chk('GATE 2016 Set 1: the legs are 24, 5, 29, 70, 181, 1, 27, 9',
      legs(G16.seq).join(',') === '24,5,29,70,181,1,27,9', legs(G16.seq).join(','));

  chk('GATE 2020: SSTF order is R(110), T(115), Q(85), S(30), P(155)',
      G20.seq.slice(1).join(',') === '110,115,85,30,155', G20.seq.slice(1).join(','));
  chk('GATE 2020: option B is the false statement',
      /* B says Q after S and before T; Q is 3rd, S is 4th, T is 2nd */
      !(G20.seq.indexOf(85) > G20.seq.indexOf(30) && G20.seq.indexOf(85) < G20.seq.indexOf(115)),
      'order ' + G20.seq.join(','));

  chk('GATE 2018 Set 1: 200 cylinders and 3 reversals give 85 mW',
      G18.total === 200 && G18.rev === 3 && near(G18.power, 85),
      G18.total + ' cyl, ' + G18.rev + ' rev, ' + G18.power + ' mW');
  chk('GATE 2018 Set 1: SSTF order is 86, 72, 116, 134, 20, 16',
      G18.seq.slice(1).join(',') === '86,72,116,134,20,16', G18.seq.slice(1).join(','));

  chk('7200 rpm gives an 8.33 ms rotation and a 4.17 ms average latency',
      near(ROT_MS, 8.333, 0.01) && near(LAT_MS, 4.1667, 0.01),
      ROT_MS.toFixed(3) + ' / ' + LAT_MS.toFixed(4));
  chk('a 100-cylinder seek at 0.1 ms per cylinder is 10 ms, 70% of the access',
      near(SEEK_100, 10) && near(SEEK_100 / ACCESS_MS, 0.703, 0.01),
      (100 * SEEK_100 / ACCESS_MS).toFixed(1) + '%');
  chk('4 KB at 100 MB/s transfers in 0.039 ms',
      near(TRANSFER_MS, 0.0391, 0.001), TRANSFER_MS.toFixed(4) + ' ms');
  chk('the three terms add to 14.21 ms',
      near(ACCESS_MS, 14.206, 0.01), ACCESS_MS.toFixed(3) + ' ms');
})();

/* ======================================================================
   LAYER 2 - THE FRAME (drawing vocabulary)
   Reads the model above. Never re-derives a number.
   ====================================================================== */

function note(x, y, s, colour, size, align, base) {
  P.text(x, y, s, { size: size || 10, color: colour || PAL.dim, align: align || 'left', base: base || 'top' });
}
function mono(x, y, s, colour, size, align, base) {
  P.text(x, y, s, { size: size || 11, mono: true, color: colour || PAL.ink, align: align || 'left', base: base || 'top' });
}
function box(x, y, w, h, o) {
  o = o || {};
  P.rect(x, y, w, h, { fill: o.fill || PAL.surface, stroke: o.stroke || PAL.border, radius: o.radius === undefined ? 5 : o.radius, sw: o.sw || 1.2 });
}

var FIG = '';   /* the figure caption drawn under the header */

function header(title, sub, total) {
  P.rect(0, 0, W, 52, { fill: PAL.surface2 });
  P.line(0, 52, W, 52, { stroke: PAL.border });
  mono(24, 12, 'DISK SCHEDULING', PAL.accent, 10);
  P.text(24, 26, title, { size: 16, bold: true, color: PAL.ink });
  if (sub) note(24, 44, sub, PAL.faint, 9);
  if (total) mono(872, 22, total, PAL.accent, 13, 'right');
}

function bg() {
  P.rect(0, 0, W, H, { fill: PAL.surface });
}

/* ---------- the head-movement profile ----------
   x is cumulative movement (time), y is the cylinder the head is on. */

function profile(cfg) {
  var seq = cfg.seq, lo = cfg.lo, hi = cfg.hi;
  var x0 = cfg.x0, x1 = cfg.x1, y0 = cfg.y0, y1 = cfg.y1;
  var total = movement(seq);
  var scale = cfg.scale || total || 1;
  var q = cfg.q === undefined ? 1 : cfg.q;
  var colour = cfg.colour || PAL.accent;

  function cy(v) { return y1 - (v - lo) / (hi - lo) * (y1 - y0); }
  function cx(c) { return x0 + c / scale * (x1 - x0); }

  var ticks = [lo, Math.round(lo + (hi - lo) / 4), Math.round(lo + (hi - lo) / 2),
               Math.round(lo + 3 * (hi - lo) / 4), hi];
  for (var t = 0; t < ticks.length; t++) {
    var y = cy(ticks[t]);
    P.line(x0, y, x1, y, { stroke: PAL.border, sw: 0.6, dash: [3, 4] });
    if (cfg.axis !== false) mono(x0 - 8, y - 5, String(ticks[t]), PAL.faint, 8.5, 'right');
  }
  P.line(x0, y0 - 8, x0, y1 + 8, { stroke: PAL.border, sw: 1.2 });

  /* the head at the start */
  var hy = cy(seq[0]);
  P.tri(x0 - 10, hy, x0 - 2, hy - 5, x0 - 2, hy + 5, { fill: PAL.ink });

  var cum = 0, limit = q * total, reached = 0;
  var lastLabelX = -999, flip = 0;
  for (var i = 1; i < seq.length; i++) {
    var d = Math.abs(seq[i] - seq[i - 1]);
    var segEnd = cum + d;
    var shown = Math.min(segEnd, limit);
    if (shown > cum) {
      var ax = cx(cum), ay = cy(seq[i - 1]);
      var bx = cx(shown);
      var frac = d > 0 ? (shown - cum) / d : 1;
      var by = ay + (cy(seq[i]) - ay) * frac;
      var jump = d >= (hi - lo) * 0.9;
      P.line(ax, ay, bx, by, {
        stroke: jump ? PAL.warn : colour,
        sw: jump ? 1.4 : 2,
        dash: jump ? [5, 4] : null
      });
      if (shown >= segEnd - 1e-9) {
        reached = i;
        P.circle(bx, by, 3.4, { fill: jump ? PAL.warn : colour });
        /* adjacent cylinders would collide, so neighbouring labels take
           turns sitting one line higher */
        var ly = by - 12;
        if (Math.abs(bx - lastLabelX) < 30) { flip = 1 - flip; if (flip) ly = by - 24; }
        else flip = 0;
        lastLabelX = bx;
        mono(bx + 5, ly, String(seq[i]), PAL.ink, 9);
        /* a leg label is drawn only when the leg is long enough to hold one */
        if (d > 0 && cfg.legs !== false && Math.abs(bx - ax) > 46) {
          var mx = (ax + bx) / 2;
          var my = by > ay ? (ay + by) / 2 - 13 : (ay + by) / 2 + 3;
          mono(mx, my, jump ? 'jump ' + d : String(d), jump ? PAL.warn : PAL.dim, 8.5, 'center');
        }
      }
    }
    cum = segEnd;
  }

  if (cfg.label) {
    mono(x0 + 2, y0 - 20, cfg.label, colour, 10.5);
  }
  if (cfg.stripY) {
    var shownSeq = seq.slice(0, reached + 1);
    mono(x0, cfg.stripY, shownSeq.join(' > '), PAL.dim, 10);
  }
  return { total: total, reached: reached, cx: cx, cy: cy, x0: x0, x1: x1, y0: y0, y1: y1 };
}

/* a shared cylinder axis with two or three stacked bands */
function bands(list, opts) {
  opts = opts || {};
  var lo = opts.lo === undefined ? LO : opts.lo;
  var hi = opts.hi === undefined ? HI : opts.hi;
  var x0 = opts.x0 || 96, x1 = opts.x1 || 858;
  var top = opts.top || 92, bottom = opts.bottom || 372;
  var n = list.length;
  var gap = 14;
  var h = (bottom - top - gap * (n - 1)) / n;
  var scale = opts.scale || Math.max.apply(null, list.map(function (b) { return movement(b.seq); }));
  var out = [];
  for (var i = 0; i < n; i++) {
    var b = list[i];
    var y0 = top + i * (h + gap), y1 = y0 + h;
    var r = profile({
      seq: b.seq, lo: lo, hi: hi, x0: x0, x1: x1, y0: y0, y1: y1,
      q: b.q === undefined ? opts.q : b.q,
      colour: b.colour, scale: scale, axis: i === 0,
      label: b.label, legs: b.legs
    });
    if (i > 0) {
      /* redraw the tick numbers only once, at the far left of the first band */
      for (var t = 0; t < 5; t++) {
        var v = lo + Math.round((hi - lo) * t / 4);
        P.line(x0, y1 - (v - lo) / (hi - lo) * (y1 - y0), x1, y1 - (v - lo) / (hi - lo) * (y1 - y0),
               { stroke: PAL.border, sw: 0.6, dash: [3, 4] });
      }
    }
    out.push(r);
  }
  return out;
}

/* ======================================================================
   LAYER 3 - THE SCENES
   ====================================================================== */

var SCENES = {};

/* ---------- 1. geometry and access time ---------- */
SCENES.geom = function (t) {
  var q = K.clamp01(t / 30);
  header('One access, three terms', 'the arm moves in cylinders; only the seek is the scheduler\u2019s choice');

  /* the cylinder line */
  var x0 = 96, x1 = 858, y = 148;
  function X(v) { return x0 + v / 199 * (x1 - x0); }
  P.line(x0, y, x1, y, { stroke: PAL.border, sw: 1.4 });
  [0, 50, 100, 150, 199].forEach(function (v) {
    P.line(X(v), y - 4, X(v), y + 4, { stroke: PAL.border, sw: 1.2 });
    mono(X(v), y + 8, String(v), PAL.faint, 9, 'center');
  });
  mono(x0, y - 26, 'cylinder number', PAL.faint, 9);
  mono(x1, y + 22, 'one cylinder = one arm position', PAL.faint, 9, 'right');

  if (q > 0.10) {
    P.tri(X(53), y - 4, X(53) - 6, y - 16, X(53) + 6, y - 16, { fill: PAL.ink });
    mono(X(53), y - 34, 'head 53', PAL.ink, 10, 'center');
  }
  if (q > 0.22) {
    P.circle(X(153), y, 4.5, { fill: PAL.accent });
    mono(X(153), y - 34, 'request 153', PAL.accent, 10, 'center');
    P.arrow(X(53) + 8, y - 20, X(153) - 8, y - 20, { stroke: PAL.accent, sw: 1.6, head: 8 });
    mono((X(53) + X(153)) / 2, y - 44, '100 cylinders = 10.0 ms of seek', PAL.accent, 9.5, 'center');
  }

  if (q > 0.38) {
    mono(x0, 196, 'one access  =  seek  +  rotational latency  +  transfer', PAL.ink, 12);
    note(x0, 212, 'seek: the arm moves to the cylinder. latency: the sector rotates under the head. transfer: the bytes move.', PAL.dim, 9);
  }

  var bars = [
    { k: 'seek', v: SEEK_100, txt: SEEK_100.toFixed(2) + ' ms', c: PAL.accent, at: 0.46 },
    { k: 'rotational latency', v: LAT_MS, txt: LAT_MS.toFixed(2) + ' ms', c: PAL.info, at: 0.62 },
    { k: 'transfer', v: TRANSFER_MS, txt: TRANSFER_MS.toFixed(2) + ' ms', c: PAL.valid, at: 0.78 }
  ];
  var bx = 250, maxW = 470, maxV = SEEK_100;
  bars.forEach(function (b, i) {
    if (q < b.at) return;
    var yy = 240 + i * 34;
    mono(x0, yy + 3, b.k, PAL.dim, 10);
    var w = Math.max(3, b.v / maxV * maxW);
    P.rect(bx, yy, w, 16, { fill: b.c, radius: 3 });
    mono(bx + w + 8, yy + 3, b.txt, PAL.ink, 10);
  });
  if (q > 0.86) {
    note(x0, 344, 'total ' + ACCESS_MS.toFixed(2) + ' ms, and the seek is ' +
         (100 * SEEK_100 / ACCESS_MS).toFixed(0) + '% of it. At 7200 rpm one rotation is ' +
         ROT_MS.toFixed(2) + ' ms, so the average wait is half of that.', PAL.dim, 9);
    note(x0, 360, 'Only the first term is a decision: it is how far the arm travels, and that is what the order of service sets.',
         PAL.ink, 9.5);
  }
};

/* ---------- 2. FCFS ---------- */
SCENES.fcfs = function (t) {
  var q = K.clamp01(t / 30);
  header('First Come First Served', 'arrival order, no reordering, no memory',
         q > 0.55 ? 'total ' + R.fcfs.total + ' cylinders' : '');
  profile({ seq: R.fcfs.seq, lo: LO, hi: HI, x0: 96, x1: 858, y0: 96, y1: 356, q: q,
            colour: PAL.accent, stripY: 400 });
  if (q > 0.62) {
    note(96, 420, 'legs: ' + R.fcfs.legs.join(' + ') + ' = ' + R.fcfs.total, PAL.dim, 9.5);
  }
  if (q > 0.9) {
    mono(96, 438, 'the two long diagonals are the arm crossing the disk; no starvation, but the longest travel', PAL.valid, 9);
  }
};

/* ---------- 3. SSTF ---------- */
SCENES.sstf = function (t) {
  var q = K.clamp01(t / 30);
  header('Shortest Seek Time First', 'always the nearest pending request',
         q > 0.5 ? 'total ' + R.sstf.total + ' cylinders' : '');
  var r = profile({ seq: R.sstf.seq, lo: LO, hi: HI, x0: 96, x1: 858, y0: 96, y1: 356, q: q,
                    colour: PAL.accent, stripY: 400 });
  if (q > 0.66) {
    note(96, 420, 'legs: ' + R.sstf.legs.join(' + ') + ' = ' + R.sstf.total +
         ' \u2014 ' + (R.fcfs.total - R.sstf.total) + ' fewer than FCFS on identical work.', PAL.dim, 9.5);
  }
  if (q > 0.84) {
    /* the starvation marker: 183 is served last, after seven others */
    var y = r.cy(183);
    P.line(r.cx(R.sstf.total) - 4, y, 866, y, { stroke: PAL.warn, sw: 1, dash: [3, 3] });
    mono(866, y - 16, '183 is served last: 7 requests go first', PAL.warn, 9, 'right');
  }
};

/* ---------- 4. greedy is not optimal ---------- */
SCENES.greedy = function (t) {
  var q = K.clamp01(t / 30);
  header('Nearest first is not a minimum', 'head 50, requests 11, 40, 60, 90');
  var res = bands([
    { seq: G.sstf, label: 'SSTF: 40, 60, 90, 11 = ' + G.sstfTotal + ' cylinders', colour: PAL.invalid, q: q },
    { seq: G.opt, label: 'the order 11, 40, 60, 90 = ' + G.optTotal + ' cylinders', colour: PAL.valid, q: K.clamp01((t - 12) / 18) }
  ], { lo: 0, hi: 100, top: 92, bottom: 356, x0: 96, x1: 858 });
  if (q > 0.45) {
    note(96, 384, 'The greedy path spends 10, 20, 30 and then 79: it walks outward and pays 79 to come back.', PAL.dim, 9.5);
  }
  if (q > 0.62) {
    note(96, 400, 'The better path spends 39 first, then 29, 20, 30: one large step buys a monotone sweep.', PAL.dim, 9.5);
  }
  if (q > 0.8) {
    mono(96, 424, 'SSTF ' + G.sstfTotal + '  >  optimum ' + G.optTotal + ' by ' + (G.sstfTotal - G.optTotal) +
         ' cylinders: a locally best step is not a globally best schedule', PAL.invalid, 10);
    mono(858, 424, 'brute force over 4! orders', PAL.faint, 9, 'right');
  }
};

/* ---------- 5. SCAN ---------- */
SCENES.scan = function (t) {
  var q = K.clamp01(t / 30);
  header('SCAN \u2014 the elevator', 'one direction, held to the physical end of the disk',
         q > 0.5 ? 'total ' + R.scanUp.total + ' cylinders' : '');
  var r = profile({ seq: R.scanUp.seq, lo: LO, hi: HI, x0: 96, x1: 858, y0: 96, y1: 356, q: q,
                    colour: PAL.accent, stripY: 400 });
  if (q > 0.62) {
    note(96, 420, 'climb 53 to 199 = ' + (199 - 53) + ', return 199 to 14 = ' + (199 - 14) +
         ', total ' + R.scanUp.total + '.', PAL.dim, 9.5);
  }
  if (q > 0.8) {
    var y183 = r.cy(183), yEnd = r.cy(199);
    P.line(r.cx(183 - 53 + 0), y183, r.cx(183 - 53), yEnd, { stroke: PAL.warn, sw: 1.2, dash: [3, 3] });
    mono(r.cx(146) + 8, (y183 + yEnd) / 2 - 5, '183 to 199: 16 cylinders, nothing served', PAL.warn, 9);
    mono(858, 420, 'downward instead: ' + R.scanDn.total + ' cylinders', PAL.faint, 9.5, 'right');
  }
};

/* ---------- 6. C-SCAN ---------- */
SCENES.cscan = function (t) {
  var q = K.clamp01(t / 30);
  header('C-SCAN \u2014 the circular elevator', 'return to cylinder 0 without servicing anything',
         q > 0.5 ? 'total ' + R.cscan.total + ' cylinders' : '');
  var r = profile({ seq: R.cscan.seq, lo: LO, hi: HI, x0: 96, x1: 858, y0: 96, y1: 356, q: q,
                    colour: PAL.accent, stripY: 400 });
  if (q > 0.6) {
    note(96, 420, '146 up to 199, the ' + (HI - LO) + '-cylinder jump back to 0, then 14 and 37: ' +
         (146 + 199 + 37) + '.', PAL.dim, 9.5);
  }
  if (q > 0.78) {
    mono(858, 396, 'the jump is ' + (100 * 199 / R.cscan.total).toFixed(0) + '% of the answer', PAL.warn, 9.5, 'right');
    mono(858, 420, 'SCAN on the same queue: ' + R.scanUp.total, PAL.faint, 9.5, 'right');
  }
};

/* ---------- 7. LOOK and C-LOOK ---------- */
SCENES.look = function (t) {
  var q = K.clamp01(t / 30);
  header('LOOK and C-LOOK \u2014 reverse at the last request', 'the same guarantee without the empty trip');
  var a = K.clamp01(t / 10), b = K.clamp01((t - 10) / 10), c = K.clamp01((t - 20) / 10);
  bands([
    { seq: R.lookUp.seq, label: 'LOOK from 53 = ' + R.lookUp.total + ' (climb 130, return 169)', colour: PAL.accent, q: a },
    { seq: R.clook.seq, label: 'C-LOOK from 53 = ' + R.clook.total + ' (climb 130, jump 169, then 23)', colour: PAL.info, q: b },
    { seq: G16.seq, label: 'GATE 2016 Set 1: C-LOOK from 63 = ' + G16.total, colour: PAL.valid, q: c }
  ], { lo: 0, hi: 199, top: 92, bottom: 340, x0: 96, x1: 858 });
  if (q > 0.35) {
    note(96, 352, 'LOOK stops at 183, the highest request, instead of 199: ' + (R.scanUp.total - R.lookUp.total) + ' cylinders saved, same service order.', PAL.dim, 9);
  }
  if (q > 0.7) {
    mono(96, 372, 'GATE 2016 legs: ' + legs(G16.seq).join(' + ') + ' = ' + G16.total +
         ' \u2014 the jump alone is 181, more than half.', PAL.ink, 9.5);
  }
  if (q > 0.9) {
    mono(858, 372, 'jump to 10, not to 0', PAL.warn, 9.5, 'right');
  }
};

/* ---------- 8. GATE 2015 ---------- */
SCENES.gate2015 = function (t) {
  var q = K.clamp01(t / 30);
  header('GATE 2015 Set 1 Q30', '100 tracks, head 50, SCAN moves toward 100');
  bands([
    { seq: G15.sstf, label: 'SSTF = ' + G15.sstfTotal + ' cylinders', colour: PAL.accent, q: q },
    { seq: G15.scan, label: 'SCAN toward 100 = ' + G15.scanTotal + ' cylinders', colour: PAL.info, q: K.clamp01((t - 12) / 18) }
  ], { lo: 0, hi: 100, top: 92, bottom: 320, x0: 96, x1: 858 });
  if (q > 0.55) {
    note(96, 336, 'SSTF legs: ' + legs(G15.sstf).join(' + ') + ' = ' + G15.sstfTotal +
         '. The request at 50 is the head position, so its leg is 0.', PAL.dim, 9);
  }
  if (q > 0.7) {
    note(96, 352, 'SCAN legs: ' + legs(G15.scan).join(' + ') + ' = ' + G15.scanTotal +
         '. It must reach 100 even though no request waits there.', PAL.dim, 9);
  }
  if (q > 0.84) {
    mono(96, 376, 'SSTF travels ' + (G15.scanTotal - G15.sstfTotal) + ' fewer than SCAN, so the gap is ' + G15.gap +
         ' \u2014 the published key.', PAL.valid, 10);
    mono(96, 396, 'LOOK would give ' + G15.lookTotal + ': reverse at 90, the highest request.', PAL.dim, 9.5);
  }
};

/* ---------- 9. cost models ---------- */
SCENES.costmodel = function (t) {
  var q = K.clamp01(t / 30);
  header('GATE 2018 Set 1 \u2014 power, not distance', '20 mW per 100 cylinders, 15 mW per reversal');
  var r = profile({ seq: G18.seq, lo: 0, hi: 199, x0: 96, x1: 858, y0: 96, y1: 300, q: q,
                    colour: PAL.accent, stripY: 316 });
  if (q > 0.55) {
    /* mark the three reversals */
    var cum = 0, marks = 0;
    for (var i = 1; i < G18.seq.length; i++) {
      var prev = G18.seq[i - 1], cur = G18.seq[i];
      cum += Math.abs(cur - prev);
      if (i < G18.seq.length - 1) {
        var nxt = G18.seq[i + 1];
        var d1 = cur - prev, d2 = nxt - cur;
        if (d1 * d2 < 0) {
          marks++;
          var mx = r.cx(cum), my = r.cy(cur);
          P.circle(mx, my, 8, { stroke: PAL.warn, sw: 1.4 });
          mono(mx, my - 22, 'R' + marks, PAL.warn, 9, 'center');
        }
      }
    }
  }
  if (q > 0.7) {
    mono(96, 344, 'movement  ' + G18.total + ' cylinders', PAL.ink, 10);
    mono(96, 360, 'reversals ' + G18.rev + '  (at 86, at 72, at 134)', PAL.ink, 10);
    mono(96, 380, 'power = ' + G18.total + '/100 \u00d7 20 + ' + G18.rev + ' \u00d7 15 = ' +
         (G18.total / 100 * 20) + ' + ' + (G18.rev * 15) + ' = ' + G18.power + ' mW', PAL.valid, 10.5);
  }
  if (q > 0.88) {
    mono(858, 380, 'sector and platter numbers never enter', PAL.faint, 9, 'right');
  }
};

/* ---------- 10. procedure ---------- */
SCENES.recipe = function (t) {
  var q = K.clamp01(t / 30);
  header('The procedure, and the five traps', 'works for every policy and every question shape');

  var steps = [
    ['1', 'Fix the range, the head, the direction', 'lowest and highest cylinder; is the head itself in the queue; which way first'],
    ['2', 'Write the service order', 'arrival, nearest, or one direction to the end or to the last request'],
    ['3', 'Sum the absolute differences', 'each leg is |next \u2212 current|; the head request is 0; a jump is charged'],
    ['4', 'Convert only at the end', 'cylinders first, then \u00d7 ms per cylinder, or /100 \u00d7 mW, plus reversals'],
    ['5', 'Answer the metric that was asked', 'movement, seek time, power, order or fairness: different winners']
  ];
  steps.forEach(function (s, i) {
    var at = 0.06 + i * 0.13;
    if (q < at) return;
    var y = 96 + i * 52;
    box(96, y, 520, 44, { fill: i % 2 ? PAL.surface : PAL.surface2, stroke: PAL.border, sw: 1 });
    mono(110, y + 6, s[0], PAL.accent, 13);
    mono(134, y + 6, s[1], PAL.ink, 11);
    note(134, y + 24, s[2], PAL.dim, 8.5);
  });

  if (q > 0.7) {
    mono(640, 92, 'the five traps', PAL.warn, 11);
    var traps = ['SCAN visits the end of the disk; LOOK does not',
                 'an unstated direction makes SCAN unanswerable',
                 'the C-SCAN and C-LOOK jump is charged',
                 'units: cylinders, then milliseconds, then power',
                 'a tie in SSTF needs a stated rule'];
    traps.forEach(function (s, i) {
      note(640, 112 + i * 34, '\u2022 ' + s, PAL.dim, 9);
    });
    mono(640, 292, 'checked on this page: ' + R.cscan.total + ' = 146 + 199 + 37', PAL.faint, 9);
    mono(640, 308, 'and ' + R.lookUp.total + ' = 130 + 169', PAL.faint, 9);
  }
  if (q > 0.92) {
    mono(96, 400, 'Every number in this lesson is computed by the model on this page and re-checked against its own definition.', PAL.ink, 9.5);
  }
};

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function drawFrame(painter) {
  if (!painter) return;
  P = painter;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg();
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

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

  K.init({
    timeline: window.LESSON_TIMELINE,
    draw: function () { if (P) drawFrame(P); }
  });

  K.onResize(function () { if (P) drawFrame(P); });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (P) drawFrame(P); });
  }

  window.__drawAt = function (t) {
    K.state.elapsed = t;
    if (P) drawFrame(P);
  };

  window.__lessonChecks = CHECKS;
  var bad = CHECKS.filter(function (c) { return !c.pass; });
  if (bad.length) console.warn('Model validation did not fully pass:', bad);
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
