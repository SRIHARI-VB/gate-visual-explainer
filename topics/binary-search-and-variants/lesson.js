(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = PR.PAL;
  var P = null;

/* ======================================================================
   LAYER 1 - THE MODEL (binary-search-and-variants)
   Pure data and pure functions. No drawing here. Nothing in this section
   knows what a canvas is.
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

function lg2(n) { return Math.log(n) / Math.LN2; }

/* floor(log2 n), exact for integers, by shifting */
function floorLog2(n) {
  var c = 0;
  while (n > 1) { n = Math.floor(n / 2); c++; }
  return c;
}
function ceilLog2(n) {
  var f = floorLog2(n);
  return Math.pow(2, f) === n ? f : f + 1;
}
/* the closed-form worst case: floor(log2 n) + 1 comparisons, including the
   final equality test */
function worstCmp(n) { return n <= 0 ? 0 : floorLog2(n) + 1; }

/* ---- the three searches, as plain loops ---- */
function bsClassic(a, x) {
  var lo = 0, hi = a.length - 1, cmp = 0, mid;
  while (lo <= hi) {
    mid = Math.floor((lo + hi) / 2);
    cmp++;
    if (a[mid] === x) return { idx: mid, cmp: cmp };
    if (a[mid] < x) lo = mid + 1; else hi = mid - 1;
  }
  return { idx: -1, cmp: cmp };
}

function lowerBound(a, x) {
  var lo = 0, hi = a.length, mid, cmp = 0;
  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    cmp++;
    if (a[mid] < x) lo = mid + 1; else hi = mid;
  }
  return { idx: lo, cmp: cmp };
}

function upperBound(a, x) {
  var lo = 0, hi = a.length, mid, cmp = 0;
  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    cmp++;
    if (a[mid] <= x) lo = mid + 1; else hi = mid;
  }
  return { idx: lo, cmp: cmp };
}

/* ---- rotated sorted array, distinct values ---- */
function searchRotated(a, x) {
  var lo = 0, hi = a.length - 1, cmp = 0, mid;
  while (lo <= hi) {
    mid = Math.floor((lo + hi) / 2);
    cmp++;
    if (a[mid] === x) return { idx: mid, cmp: cmp };
    if (a[lo] <= a[mid]) {                    /* left half is sorted */
      if (a[lo] <= x && x < a[mid]) hi = mid - 1; else lo = mid + 1;
    } else {                                  /* right half is sorted */
      if (a[mid] < x && x <= a[hi]) lo = mid + 1; else hi = mid - 1;
    }
  }
  return { idx: -1, cmp: cmp };
}

/* ---- bitonic array: peak first, then the two monotone runs ---- */
function peakIndex(a) {
  var lo = 0, hi = a.length - 1, cmp = 0, mid;
  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    cmp++;
    if (a[mid] < a[mid + 1]) lo = mid + 1; else hi = mid;
  }
  return { idx: lo, cmp: cmp };
}

function searchBitonic(a, x) {
  var p = peakIndex(a);
  var left = a.slice(0, p.idx + 1);
  var r1 = bsClassic(left, x);
  if (r1.idx !== -1) return { idx: r1.idx, cmp: p.cmp + r1.cmp };
  var right = a.slice(p.idx + 1);
  var rev = right.slice().reverse();
  var r2 = bsClassic(rev, x);
  if (r2.idx !== -1) return { idx: p.idx + 1 + (rev.length - 1 - r2.idx), cmp: p.cmp + r1.cmp + r2.cmp };
  return { idx: -1, cmp: p.cmp + r1.cmp + r2.cmp };
}

/* ---- search on a monotone predicate: smallest x in [0,N] with P(x) ---- */
function firstTrue(Pf, N) {
  var lo = 0, hi = N, mid, cmp = 0;
  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    cmp++;
    if (Pf(mid)) hi = mid; else lo = mid + 1;
  }
  return { idx: lo, cmp: cmp };
}

/* ---- the buggy loop that can stall ---- */
function buggyRun(a, x, cap) {
  var lo = 0, hi = a.length - 1, steps = 0, mid;
  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    steps++;
    if (a[mid] < x) lo = mid; else hi = mid;
    if (steps >= cap) return { stalled: true, steps: steps, lo: lo, hi: hi, mid: Math.floor((lo + hi) / 2) };
  }
  return { stalled: false, steps: steps, lo: lo, hi: hi };
}

/* ---- ternary search, measured rather than asserted ---- */
function ternaryCmp(a, x) {
  var lo = 0, hi = a.length - 1, cmp = 0, m1, m2;
  while (lo <= hi) {
    m1 = lo + Math.floor((hi - lo) / 3);
    m2 = hi - Math.floor((hi - lo) / 3);
    cmp += 2;
    if (a[m1] === x || a[m2] === x) return cmp;
    if (x < a[m1]) hi = m1 - 1;
    else if (x > a[m2]) lo = m2 + 1;
    else { lo = m1 + 1; hi = m2 - 1; }
  }
  return cmp;
}

/* ---- enumeration helpers for the exhaustive checks ---- */
function combos(maxVal, n, cb) {
  var cur = [];
  (function rec(start) {
    if (cur.length === n) { cb(cur.slice()); return; }
    for (var v = start; v <= maxVal; v++) { cur.push(v); rec(v); cur.pop(); }
  })(0);
}

/* ======================================================================
   the numbers the lesson shows, computed once
   ====================================================================== */

var A16 = [3, 7, 11, 14, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63];
var TRACE_43 = [
  { lo: 0, hi: 15, mid: 7 },
  { lo: 8, hi: 15, mid: 11 },
  { lo: 8, hi: 10, mid: 9 },
  { lo: 10, hi: 10, mid: 10 }
];
var TRACE_27 = [
  { lo: 0, hi: 15, mid: 7, v: 31, verdict: '31 > 27, hi = 6' },
  { lo: 0, hi: 6, mid: 3, v: 14, verdict: '14 < 27, lo = 4' },
  { lo: 4, hi: 6, mid: 5, v: 23, verdict: '23 < 27, lo = 6' },
  { lo: 6, hi: 6, mid: 6, v: 27, verdict: 'equal, return 6' }
];
var TRACE_25 = [
  { lo: 0, hi: 15, mid: 7, v: 31, verdict: '31 > 25, hi = 6' },
  { lo: 0, hi: 6, mid: 3, v: 14, verdict: '14 < 25, lo = 4' },
  { lo: 4, hi: 6, mid: 5, v: 23, verdict: '23 < 25, lo = 6' },
  { lo: 6, hi: 6, mid: 6, v: 27, verdict: '27 > 25, hi = 5, empty' }
];

var DUP = [4, 8, 8, 8, 12, 16];
var ROT = [43, 47, 51, 3, 7, 11, 14];
var BIT = [2, 5, 9, 14, 20, 17, 11, 6, 3];

/* ======================================================================
   the model checks
   ====================================================================== */
function buildChecks() {
  var n, i, x, a, r, w;

  /* 1. exhaustive correctness of the classic loop, plus its exact worst case */
  var bad = 0, total = 0, boundOk = true;
  for (n = 1; n <= 8; n++) {
    (function (nn) {
      combos(3, nn, function (arr) {
        var worst = 0;
        for (var t = -1; t <= 4; t++) {
          var res = bsClassic(arr, t);
          total++;
          var ok = (res.idx !== -1 && arr[res.idx] === t) ||
                   (res.idx === -1 && arr.indexOf(t) === -1);
          if (!ok) bad++;
          if (res.cmp > worst) worst = res.cmp;
        }
        if (worst !== worstCmp(nn)) boundOk = false;
      });
    })(n);
  }
  chk('classic binary search is correct on every array up to 8 cells', bad === 0,
      total + ' (array, target) pairs checked, ' + bad + ' wrong');
  chk('observed worst case equals floor(log2 n) + 1 for n = 1..8', boundOk,
      'worst case at n = 16 is ' + worstCmp(16) + ', at n = 8 is ' + worstCmp(8));

  /* 2. the two closed forms agree for every n up to a million */
  var mism = 0;
  for (n = 1; n <= 1000000; n++) if (worstCmp(n) !== ceilLog2(n + 1)) mism++;
  chk('floor(log2 n) + 1 equals ceil(log2(n+1)) for every n up to 10^6', mism === 0,
      'checked 1,000,000 values, ' + mism + ' mismatches');

  /* 3. the recurrence F(n) = F(floor(n/2)) + 1 */
  var F = [0];
  for (n = 1; n <= 1000; n++) F[n] = F[Math.floor(n / 2)] + 1;
  var recOk = true;
  for (n = 1; n <= 1000; n++) if (F[n] !== worstCmp(n)) recOk = false;
  chk('F(n) = F(floor(n/2)) + 1 solves to floor(log2 n) + 1', recOk,
      'F(1)=1, F(2)=2, F(3)=2, F(4)=3, F(8)=4, F(16)=5, F(1000)=' + F[1000]);

  /* 4. lower_bound and upper_bound against a linear scan, with repeats */
  var lbBad = 0, lbTotal = 0;
  for (n = 0; n <= 6; n++) {
    (function (nn) {
      combos(2, nn, function (arr) {
        for (var t = -1; t <= 3; t++) {
          var lb = lowerBound(arr, t).idx, ub = upperBound(arr, t).idx;
          var eLb = 0; while (eLb < arr.length && arr[eLb] < t) eLb++;
          var eUb = 0; while (eUb < arr.length && arr[eUb] <= t) eUb++;
          lbTotal++;
          if (lb !== eLb || ub !== eUb) lbBad++;
        }
      });
    })(n);
  }
  chk('lower_bound and upper_bound match a linear scan on arrays with repeats',
      lbBad === 0, lbTotal + ' (array, target) pairs checked, ' + lbBad + ' wrong');
  var lb8 = lowerBound(DUP, 8).idx, ub8 = upperBound(DUP, 8).idx;
  chk('on [4,8,8,8,12,16] the bounds give lower 1, upper 4, count 3',
      lb8 === 1 && ub8 === 4 && ub8 - lb8 === 3, 'lower=' + lb8 + ' upper=' + ub8 + ' count=' + (ub8 - lb8));

  /* 5. rotated array: every rotation of every distinct array up to 7 cells */
  var rotBad = 0, rotTotal = 0, rotWorst = 0;
  for (n = 1; n <= 7; n++) {
    (function (nn) {
      var base = [];
      for (var k = 0; k < nn; k++) base.push(2 * k);
      for (var rr = 0; rr < nn; rr++) {
        var arr = base.slice(rr).concat(base.slice(0, rr));
        for (var t = -1; t <= 2 * nn; t++) {
          var res = searchRotated(arr, t);
          rotTotal++;
          var ok = (res.idx !== -1 && arr[res.idx] === t) ||
                   (res.idx === -1 && arr.indexOf(t) === -1);
          if (!ok) rotBad++;
          if (res.cmp > rotWorst) rotWorst = res.cmp;
        }
      }
    })(n);
  }
  chk('rotated-array search is correct on every rotation up to 7 cells', rotBad === 0,
      rotTotal + ' cases, ' + rotBad + ' wrong');
  chk('rotated search keeps the bound: worst case never exceeds floor(log2 n) + 1',
      rotWorst <= worstCmp(7), 'worst over all cases ' + rotWorst + ' vs bound ' + worstCmp(7));
  var r7 = searchRotated(ROT, 7);
  chk('on [43,47,51,3,7,11,14] the target 7 is found at index 4 in 3 comparisons',
      r7.idx === 4 && r7.cmp === 3, 'index ' + r7.idx + ', ' + r7.cmp + ' comparisons');

  /* 6. bitonic array: peak search then two monotone searches */
  var bitBad = 0, bitTotal = 0, bitWorst = 0;
  for (n = 1; n <= 7; n++) {
    (function (nn) {
      for (var up = 1; up <= nn; up++) {
        var arr = [], k;
        for (k = 0; k < up; k++) arr.push(k);
        for (k = nn - up - 1; k >= 0; k--) arr.push(up + k);
        if (arr.length !== nn) continue;
        var seen = {}, distinct = true;
        for (k = 0; k < arr.length; k++) { if (seen[arr[k]]) distinct = false; seen[arr[k]] = 1; }
        if (!distinct) continue;
        for (var t = -1; t <= nn + 1; t++) {
          var res = searchBitonic(arr, t);
          bitTotal++;
          var ok = (res.idx !== -1 && arr[res.idx] === t) ||
                   (res.idx === -1 && arr.indexOf(t) === -1);
          if (!ok) bitBad++;
          if (res.cmp > bitWorst) bitWorst = res.cmp;
        }
      }
    })(n);
  }
  chk('bitonic search (peak + two runs) is correct on small distinct arrays', bitBad === 0,
      bitTotal + ' cases, ' + bitBad + ' wrong');
  chk('bitonic worst case stays within 3*ceil(log2 n)', bitWorst <= 3 * ceilLog2(7),
      'worst ' + bitWorst + ' comparisons against the 3*ceil(log2 n) bound of ' + 3 * ceilLog2(7));
  var pk = peakIndex(BIT), b11 = searchBitonic(BIT, 11);
  chk('on [2,5,9,14,20,17,11,6,3] the peak is index 4 and 11 is found at index 6',
      pk.idx === 4 && b11.idx === 6, 'peak ' + pk.idx + ', index of 11 is ' + b11.idx + ', ' + b11.cmp + ' comparisons');

  /* 7. binary search on a monotone predicate */
  var predBad = 0;
  for (var kk = 0; kk <= 1000; kk++) {
    (function (target) {
      var r = firstTrue(function (v) { return v >= target; }, 1000);
      if (r.idx !== target) predBad++;
    })(kk);
  }
  chk('predicate search returns the exact boundary for every k in 0..1000', predBad === 0,
      '1001 boundaries checked, ' + predBad + ' wrong');
  var sq = firstTrue(function (v) { return v * v >= 1000; }, 63);
  chk('smallest x with x^2 >= 1000 in [0,63] is 32, in 6 predicate calls',
      sq.idx === 32 && sq.cmp === 6, 'x = ' + sq.idx + ' in ' + sq.cmp + ' calls');

  /* 8. the 32-bit overflow in (lo + hi) / 2 */
  var lo32 = 1500000000, hi32 = 1600000000;
  var sum = lo32 + hi32;
  var wrapped = sum >= 2147483648 ? sum - 4294967296 : sum;
  var safe = lo32 + Math.floor((hi32 - lo32) / 2);
  chk('(lo + hi) overflows signed 32-bit at lo = 1.5e9, hi = 1.6e9',
      sum > 2147483647 && wrapped < 0, 'sum ' + sum + ' wraps to ' + wrapped + ', halved ' + Math.floor(wrapped / 2));
  chk('lo + (hi - lo)/2 gives the true middle 1,550,000,000', safe === 1550000000,
      'safe form ' + safe + ', exact middle ' + Math.floor(sum / 2));

  /* 9. the stalling loop */
  var st = buggyRun([1, 3, 5, 7], 7, 60);
  chk('the loop with lo = mid stalls instead of terminating', st.stalled === true,
      'state repeats at lo = ' + st.lo + ', hi = ' + st.hi + ', mid = ' + st.mid);
  chk('the stalled state is always hi = lo + 1 with mid = lo',
      st.hi === st.lo + 1 && st.mid === st.lo, 'lo = ' + st.lo + ', hi = ' + st.hi);

  /* 10. the decision-tree bound */
  var treeOk = true;
  for (n = 1; n <= 100000; n++) {
    var h = worstCmp(n);
    if (!(n <= Math.pow(2, h) - 1 && n > Math.pow(2, h - 1) - 1)) { treeOk = false; break; }
  }
  chk('a tree of height h holds at most 2^h - 1 answers, and n needs exactly h = ceil(log2(n+1))',
      treeOk, 'checked n = 1..100000; n = 7 needs 3 levels, n = 8 needs 4');

  /* 11. average comparisons, and the worst miss */
  var avg15 = 0, avg31 = 0, k;
  for (k = 0; k < 15; k++) avg15 += bsClassic(A16.slice(0, 15), A16[k]).cmp;
  var a31 = []; for (k = 0; k < 31; k++) a31.push(k);
  for (k = 0; k < 31; k++) avg31 += bsClassic(a31, k).cmp;
  chk('average successful search is 3.2667 at n = 15 and 4.1613 at n = 31',
      Math.abs(avg15 / 15 - 3.2666667) < 1e-4 && Math.abs(avg31 / 31 - 4.1612903) < 1e-4,
      (avg15 / 15).toFixed(4) + ' and ' + (avg31 / 31).toFixed(4));

  var missOk = true, worstMiss = 0;
  for (n = 1; n <= 16; n++) {
    var arr16 = [];
    for (k = 0; k < n; k++) arr16.push(2 * k);
    var wm = 0;
    for (x = -1; x <= 2 * n + 1; x++) {
      if (arr16.indexOf(x) !== -1) continue;
      var mm = bsClassic(arr16, x).cmp;
      if (mm > wm) wm = mm;
    }
    if (wm !== ceilLog2(n + 1)) missOk = false;
    if (wm > worstMiss) worstMiss = wm;
  }
  chk('the worst miss costs exactly ceil(log2(n+1)), the same as the worst hit',
      missOk, 'checked n = 1..16; at n = 16 the worst miss is ' + worstMiss);
  var best = bsClassic(A16.slice(0, 15), A16[7]).cmp;
  chk('the best case is a single comparison when the target is the first probe',
      best === 1, 'target at index 7 of a 15-cell array costs ' + best);

  /* 12. ternary search measured against binary */
  var a100k = [], tw = 0;
  for (k = 0; k < 100000; k++) a100k.push(k);
  for (k = 0; k < 100000; k++) { var c = ternaryCmp(a100k, k); if (c > tw) tw = c; }
  var bw = worstCmp(100000);
  chk('ternary search is worse than binary: 22 comparisons against 17 at n = 100,000',
      tw === 22 && bw === 17, 'ternary ' + tw + ', binary ' + bw + ', ratio ' + (tw / bw).toFixed(3) +
      ' against 2/log2(3) = ' + (2 / Math.log(3) * Math.LN2).toFixed(3));
  chk('the k-way ratio 2/log2(3) exceeds 1, so binary is the best of the family',
      (2 / (Math.log(3) / Math.LN2)) > 1 && (3 / (Math.log(4) / Math.LN2)) > (2 / (Math.log(3) / Math.LN2)),
      'k=2: 1.000, k=3: 1.262, k=4: 1.500');

  /* 13. the count at the sizes the lesson quotes */
  chk('the quoted counts are exact: n=8 -> 4, n=16 -> 5, n=1000 -> 10, n=1024 -> 11, n=10^6 -> 20',
      worstCmp(8) === 4 && worstCmp(16) === 5 && worstCmp(1000) === 10 &&
      worstCmp(1024) === 11 && worstCmp(1000000) === 20,
      [worstCmp(8), worstCmp(16), worstCmp(1000), worstCmp(1024), worstCmp(1000000)].join(', '));
}

/* ======================================================================
   LAYER 2 - THE DRAWING VOCABULARY
   ====================================================================== */

function bg(P) {
  P.rect(0, 0, W, H, { fill: '#ffffff' });
  P.rect(0, 0, W, 52, { fill: PAL.surface2 });
  P.line(0, 52, W, 52, { stroke: PAL.border });
}

function head(P, kicker, title) {
  P.text(24, 14, kicker.toUpperCase(), { size: 10, mono: true, color: PAL.accent });
  P.text(24, 28, title, { size: 17, bold: true, color: PAL.ink });
}

function panelBox(P, x, y, w, h, title, accent) {
  P.rect(x, y, w, h, { fill: '#ffffff', stroke: PAL.border, radius: 10, sw: 1 });
  if (title) P.text(x + 12, y + 9, title, { size: 11, mono: true, color: accent || PAL.dim });
}

/* wrap a sentence into a box, one call per line; returns the next free y */
function wrap(P, x, y, text, maxChars, size, colour, lead) {
  lead = lead || 15;
  var words = String(text).split(' '), line = '', w;
  for (w = 0; w < words.length; w++) {
    if ((line + ' ' + words[w]).trim().length > maxChars) {
      P.text(x, y, line, { size: size, color: colour });
      line = words[w]; y += lead;
    } else {
      line = line ? line + ' ' + words[w] : words[w];
    }
  }
  if (line) { P.text(x, y, line, { size: size, color: colour }); y += lead; }
  return y;
}

/* a row of array cells; options: lo, hi, mid, found, showIndex, size, dimAll */
function cells(P, x, y, cw, ch, vals, o) {
  o = o || {};
  for (var i = 0; i < vals.length; i++) {
    var cx = x + i * cw;
    var live = o.dimAll ? false : (o.lo === undefined || (i >= o.lo && i <= o.hi));
    var fill = live ? '#ffffff' : PAL.surface2;
    var stroke = live ? PAL.border : PAL.surface2;
    var col = live ? PAL.ink : PAL.faint;
    if (o.mid === i && !o.dimAll) { fill = PAL.warnDim; stroke = PAL.warn; col = PAL.ink; }
    if (o.found === i) { fill = '#dcfce7'; stroke = PAL.valid; col = PAL.ink; }
    P.rect(cx, y, cw - 3, ch, { fill: fill, stroke: stroke, radius: 4, sw: 1.4 });
    P.text(cx + (cw - 3) / 2, y + ch / 2 - 7, String(vals[i]),
           { size: o.size || 12, mono: true, color: col, align: 'center', bold: true });
    if (o.showIndex) {
      P.text(cx + (cw - 3) / 2, y + ch + 3, String(i), { size: 8, mono: true, color: PAL.faint, align: 'center' });
    }
  }
}

/* a caret under one cell, labelled */
function caret(P, x, y, cw, idx, label, colour) {
  var cx = x + idx * cw + (cw - 3) / 2;
  P.tri(cx - 5, y, cx + 5, y, cx, y + 7, { fill: colour || PAL.accent });
  P.text(cx, y + 10, label, { size: 9, mono: true, color: colour || PAL.accent, align: 'center' });
}

/* a code block: an array of lines, each already plain text */
function codeBlock(P, x, y, lines, o) {
  o = o || {};
  var lh = o.lead || 16;
  for (var i = 0; i < lines.length; i++) {
    P.text(x, y + i * lh, lines[i], {
      size: o.size || 11, mono: true,
      color: (o.colours && o.colours[i]) || o.colour || PAL.ink
    });
  }
  return y + lines.length * lh;
}

function tag(P, x, y, text, colour) {
  P.rect(x, y, 8 + String(text).length * 6.2, 17, { fill: PR.rgba(colour, 0.12), stroke: colour, radius: 4, sw: 1 });
  P.text(x + 4 + 0, y + 3, text, { size: 9.5, mono: true, color: colour });
}

/* ======================================================================
   SCENE 1 - halving
   ====================================================================== */
function sceneHalving(P, t) {
  head(P, 'scene 1', 'Halving the problem: 16 cells, 4 probes');

  var cw = 52, x0 = 40, y0 = 96, ch = 38;
  var probes = t < 2 ? 0 : Math.min(4, Math.floor((t - 2) / 7) + 1);
  var state = probes === 0 ? { lo: 0, hi: 15, mid: -1 } : TRACE_43[probes - 1];

  cells(P, x0, y0, cw, ch, A16, {
    lo: state.lo, hi: state.hi, mid: state.mid,
    found: probes === 4 ? 10 : -1,
    showIndex: true, size: 11
  });

  P.text(x0, y0 - 22, 'target x = 43', { size: 12, mono: true, color: PAL.accent, bold: true });
  P.text(760, y0 - 22, 'sorted, ascending', { size: 10, mono: true, color: PAL.dim, align: 'right' });

  if (state.mid >= 0) {
    caret(P, x0, y0 + ch + 14, cw, state.mid, 'mid = ' + state.mid, PAL.warn);
  }

  /* the live range as a bar */
  var barY = y0 + ch + 40;
  P.rect(x0, barY, 16 * cw - 3, 10, { fill: PAL.surface2, stroke: PAL.border, radius: 3, sw: 1 });
  var bw = (state.hi - state.lo + 1) * cw - 3;
  P.rect(x0 + state.lo * cw, barY, bw, 10, { fill: PAL.accentDim, stroke: PAL.accent, radius: 3, sw: 1 });
  P.text(x0, barY + 16, 'live range: indices ' + state.lo + ' to ' + state.hi +
         '  (' + (state.hi - state.lo + 1) + ' cells)', { size: 10, mono: true, color: PAL.dim });

  /* the probe counter */
  P.text(24, 232, 'probes made', { size: 10, mono: true, color: PAL.faint });
  for (var i = 0; i < 4; i++) {
    var on = i < probes;
    P.circle(140 + i * 26, 238, 9, { fill: on ? PAL.accentDim : '#ffffff', stroke: on ? PAL.accent : PAL.border, sw: 1.4 });
    if (on) P.text(140 + i * 26, 232, String(i + 1), { size: 10, mono: true, color: PAL.accent, align: 'center', bold: true });
  }
  P.text(264, 232, probes === 0 ? 'no comparison yet' : probes + ' of 4, and 4 is the whole job',
         { size: 11, mono: true, color: probes === 4 ? PAL.valid : PAL.dim, bold: probes === 4 });

  /* the commentary panel */
  panelBox(P, 24, 262, 852, 170, 'what each probe bought');
  var lines = [
    ['0', 'cells 0 to 15 are live; nothing is known yet'],
    ['1', 'A[7] = 31 < 43, so cells 0 to 7 cannot hold 43: lo becomes 8'],
    ['2', 'A[11] = 47 > 43, so cells 11 to 15 cannot hold 43: hi becomes 10'],
    ['3', 'A[9] = 39 < 43, so cells 8 and 9 cannot hold 43: lo becomes 10'],
    ['4', 'A[10] = 43, equal: the answer is index 10']
  ];
  for (var li = 1; li < lines.length; li++) {
    if (probes < li) continue;
    var yy = 286 + (li - 1) * 26;
    P.text(40, yy, lines[li][0], { size: 10, mono: true, color: PAL.faint });
    P.text(58, yy, lines[li][1], { size: 11, color: li === 4 ? PAL.valid : PAL.ink, bold: li === 4 });
  }
  if (t > 26) {
    P.text(40, 408, 'Doubling the array to 32 cells costs one more probe, not twice as many.',
           { size: 11, mono: true, color: PAL.accent, bold: true });
  }
}

/* ======================================================================
   SCENE 2 - the invariant
   ====================================================================== */
function sceneInvariant(P, t) {
  head(P, 'scene 2', 'The invariant: the answer never leaves [lo, hi]');

  var A8 = [12, 18, 25, 31, 40, 47, 55, 62];
  var cw = 74, x0 = 130, y0 = 84, ch = 40;
  cells(P, x0, y0, cw, ch, A8, { lo: 0, hi: 7, mid: t > 12 ? 3 : -1, showIndex: true, size: 13 });

  P.text(x0, y0 - 20, 'lo = 0', { size: 10, mono: true, color: PAL.accent });
  P.text(x0 + 7 * cw, y0 - 20, 'hi = 7', { size: 10, mono: true, color: PAL.accent, align: 'right' });

  /* the invariant, as a formula band */
  panelBox(P, 24, 146, 852, 56, 'the invariant', PAL.accent);
  P.text(40, 170, 'If x occurs in A at all, it occurs at some index i with lo \u2264 i \u2264 hi.',
         { size: 13, mono: true, color: PAL.ink, bold: true });
  P.text(40, 188, 'Everything strictly outside that range has already been proved not to hold x.',
         { size: 10.5, color: PAL.dim });

  /* the three outcomes */
  var outs = [
    ['A[mid] = x', 'return mid', PAL.valid],
    ['A[mid] < x', 'lo = mid + 1', PAL.info],
    ['A[mid] > x', 'hi = mid - 1', PAL.warn]
  ];
  for (var i = 0; i < 3; i++) {
    if (t < 6 + i * 4) continue;
    var x = 24 + i * 286, y = 220;
    panelBox(P, x, y, 270, 78, outs[i][0], outs[i][2]);
    P.text(x + 14, y + 34, outs[i][1], { size: 13, mono: true, color: outs[i][2], bold: true });
    P.text(x + 14, y + 54, i === 0 ? 'the loop stops here' : 'mid itself is excluded',
           { size: 10, color: PAL.dim });
  }

  if (t > 17) {
    /* mid is excluded from both new ranges */
    caret(P, x0, y0 + ch + 10, cw, 3, 'mid = 3', PAL.warn);
    P.text(24, 316, 'Both updates drop mid, because it has just been compared:', { size: 11, color: PAL.dim });
    P.text(24, 336, 'lo = mid + 1   and   hi = mid - 1   \u2014 never mid on its own.',
           { size: 12, mono: true, color: PAL.accent, bold: true });
  }

  if (t > 22) {
    panelBox(P, 24, 356, 852, 76, 'and when the range empties', PAL.invalid);
    P.text(40, 380, 'lo > hi  \u2192  the range contains nothing  \u2192  the invariant still holds  \u2192  the answer is "absent".',
           { size: 11, mono: true, color: PAL.ink });
    P.text(40, 400, 'The loop therefore ends in exactly two ways: on an equality, or on a proof of absence. Never on a guess.',
           { size: 10.5, color: PAL.dim });
    P.text(40, 418, 'A program that returns the last probed index instead of -1 reports a false hit \u2014 check the exit value.',
           { size: 10.5, color: PAL.invalid });
  }
}

/* ======================================================================
   SCENE 3 - a full trace
   ====================================================================== */
function traceTable(P, x, y, w, title, rows, shown, accent) {
  panelBox(P, x, y, w, 44 + shown * 26 + 10, title, accent);
  P.text(x + 14, y + 30, 'lo   hi   mid   A[mid]', { size: 9.5, mono: true, color: PAL.faint });
  P.text(x + w - 14, y + 30, 'verdict', { size: 9.5, mono: true, color: PAL.faint, align: 'right' });
  for (var i = 0; i < shown; i++) {
    var r = rows[i], yy = y + 50 + i * 26;
    P.text(x + 14, yy, r.lo + '    ' + r.hi + '    ' + r.mid + '     ' + r.v, { size: 10, mono: true, color: PAL.ink });
    P.text(x + w - 14, yy, r.verdict, {
      size: 9.5, mono: true, align: 'right',
      color: i === rows.length - 1 ? (accent === PAL.valid ? PAL.valid : PAL.invalid) : PAL.dim
    });
  }
}

function sceneTrace(P, t) {
  head(P, 'scene 3', 'A full trace, including the miss');

  var shown = t < 2 ? 0 : Math.min(4, Math.floor((t - 2) / 6) + 1);

  P.text(24, 66, 'search for 27 \u2014 present', { size: 11, mono: true, color: PAL.valid, bold: true });
  traceTable(P, 24, 76, 416, 'trace A', TRACE_27, shown, PAL.valid);

  P.text(466, 66, 'search for 25 \u2014 absent', { size: 11, mono: true, color: PAL.invalid, bold: true });
  traceTable(P, 460, 76, 416, 'trace B', TRACE_25, shown, PAL.invalid);

  if (t > 12) {
    P.text(24, 232, 'A: four comparisons, the fourth is the equality test that returns index 6.',
           { size: 10.5, mono: true, color: PAL.dim });
    P.text(24, 250, 'B: four comparisons, the fourth makes lo = 6 > hi = 5 and the range is empty.',
           { size: 10.5, mono: true, color: PAL.dim });
  }

  if (t > 18) {
    panelBox(P, 24, 268, 852, 164, 'both outcomes, one cost', PAL.accent);
    P.text(40, 292, 'A hit and a miss walk the same comparison tree. Every root-to-leaf path is within one level of every other,',
           { size: 11, color: PAL.ink });
    P.text(40, 310, 'so neither is cheaper than the other in the worst case.', { size: 11, color: PAL.ink });
    P.text(40, 336, 'hit   : 4 comparisons', { size: 11, mono: true, color: PAL.valid });
    P.text(40, 354, 'miss  : 4 comparisons', { size: 11, mono: true, color: PAL.invalid });
    P.text(40, 372, 'bound : floor(log2 16) + 1 = 5 comparisons', { size: 11, mono: true, color: PAL.accent, bold: true });
    P.text(40, 398, 'Both of these targets happened to be luckier than the worst case; the bound is what a question wants.',
           { size: 10.5, color: PAL.dim });
    P.text(40, 416, 'Count the rows of the table. Dropping the final equality test is the commonest off-by-one in this topic.',
           { size: 10.5, color: PAL.warn });
  }
}

/* ======================================================================
   SCENE 4 - counting
   ====================================================================== */
function sceneCounts(P, t) {
  head(P, 'scene 4', 'How many comparisons: floor(log2 n) + 1');

  /* the recurrence */
  panelBox(P, 24, 68, 430, 96, 'the recurrence', PAL.accent);
  if (t > 1) {
    P.text(40, 96, 'F(n) = F( floor(n/2) ) + 1', { size: 15, mono: true, color: PAL.accent, bold: true });
    P.text(40, 120, 'one comparison, then one half', { size: 10.5, color: PAL.dim });
    P.text(40, 138, 'coefficient 1: only one half is searched', { size: 10.5, color: PAL.warn });
    P.text(40, 154, 'F(0) = 0, F(1) = 1', { size: 10.5, mono: true, color: PAL.faint });
  }

  /* the unrolling */
  panelBox(P, 466, 68, 410, 96, 'unrolled', PAL.info);
  if (t > 5) {
    P.text(482, 96, 'F(n) = 1 + F(n/2)', { size: 11, mono: true, color: PAL.ink });
    P.text(482, 114, '     = 1 + 1 + F(n/4)', { size: 11, mono: true, color: PAL.ink });
    P.text(482, 132, '     = ... floor(log2 n) times, plus 1', { size: 11, mono: true, color: PAL.ink });
    P.text(482, 152, 'F(n) = floor(log2 n) + 1', { size: 12, mono: true, color: PAL.info, bold: true });
  }

  /* the table */
  if (t > 10) {
    panelBox(P, 24, 174, 430, 190, 'n against the count', PAL.dim);
    P.text(40, 198, 'n     floor(log2 n)+1     ceil(log2(n+1))', { size: 9.5, mono: true, color: PAL.faint });
    var rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16];
    var upto = Math.min(rows.length, Math.max(0, Math.floor((t - 10) / 1.6)));
    for (var i = 0; i < upto; i++) {
      var n = rows[i], yy = 218 + i * 13.5;
      P.text(40, yy, String(n), { size: 10, mono: true, color: PAL.ink });
      P.text(120, yy, String(worstCmp(n)), { size: 10, mono: true, color: PAL.accent, bold: true });
      P.text(250, yy, String(ceilLog2(n + 1)), { size: 10, mono: true, color: PAL.info });
    }
  }

  /* the three cases */
  if (t > 20) {
    panelBox(P, 466, 174, 410, 190, 'best, average, worst at n = 15', PAL.dim);
    var bars = [
      ['best', 1, PAL.valid],
      ['average', 3.27, PAL.info],
      ['worst', 4, PAL.warn]
    ];
    for (var b = 0; b < bars.length; b++) {
      var by = 204 + b * 42;
      P.text(482, by, bars[b][0], { size: 10.5, mono: true, color: PAL.dim });
      var w = bars[b][1] / 4 * 240;
      P.rect(556, by - 2, Math.max(4, w), 16, { fill: PR.rgba(bars[b][2], 0.16), stroke: bars[b][2], radius: 3, sw: 1 });
      P.text(560 + Math.max(4, w) + 6, by, String(bars[b][1]), { size: 10, mono: true, color: bars[b][2], bold: true });
    }
    P.text(482, 336, 'the average needs a distribution: here, a uniform target', { size: 9.5, color: PAL.faint });
    P.text(482, 352, 'unlike linear search, the average is close to the worst', { size: 9.5, color: PAL.faint });
  }

  if (t > 26) {
    P.text(24, 388, 'The two closed forms agree for every n: checked here up to one million.', { size: 11, color: PAL.dim });
    P.text(24, 408, 'ceil(log2 n) is a different number: at n = 8 it gives 3, while the true worst case is 4.',
           { size: 11, mono: true, color: PAL.invalid, bold: true });
    P.text(24, 428, 'n = 1000 \u2192 10 comparisons;  n = 10^6 \u2192 20;  n = 2^31 - 1 \u2192 32.', { size: 11, mono: true, color: PAL.ink });
  }
}

/* ======================================================================
   SCENE 5 - the two loop shapes and their faults
   ====================================================================== */
function sceneLoops(P, t) {
  head(P, 'scene 5', 'Two loop shapes, two mid formulas, one infinite loop');

  /* shape one */
  panelBox(P, 24, 66, 420, 122, 'shape 1 \u2014 closed range', PAL.accent);
  codeBlock(P, 40, 92, [
    'while (lo <= hi) {',
    '  mid = (lo + hi) / 2;',
    '  if (A[mid] == x) return mid;',
    '  if (A[mid] <  x) lo = mid + 1;',
    '  else             hi = mid - 1;',
    '}  return -1;'
  ], { size: 10.5 });
  P.text(40, 178, 'hi starts at n - 1; both pointers may leave the array', { size: 9, color: PAL.faint });

  /* shape two */
  panelBox(P, 456, 66, 420, 122, 'shape 2 \u2014 half-open window', PAL.info);
  codeBlock(P, 472, 92, [
    'while (lo < hi) {',
    '  mid = (lo + hi) / 2;',
    '  if (A[mid] <  x) lo = mid + 1;',
    '  else             hi = mid;',
    '}  return lo;   // the boundary'
  ], { size: 10.5 });
  P.text(472, 178, 'hi starts at n, so "one past the end" is a legal answer', { size: 9, color: PAL.faint });

  /* fault one: the stall */
  if (t > 9) {
    panelBox(P, 24, 200, 420, 138, 'fault 1 \u2014 lo = mid stalls', PAL.invalid);
    var st = buggyRun([1, 3, 5, 7], 7, 60);
    P.text(40, 226, 'shape 2 with lo = mid instead of lo = mid + 1', { size: 10, color: PAL.dim });
    /* the two cells of the stuck window */
    P.text(40, 250, 'A = [1, 3, 5, 7],  x = 7', { size: 10.5, mono: true, color: PAL.ink });
    cells(P, 40, 264, 46, 30, [5, 7], { mid: 0, showIndex: false, size: 11 });
    P.text(150, 272, 'lo = ' + st.lo + ', hi = ' + st.hi + ', mid = ' + st.mid,
           { size: 10.5, mono: true, color: PAL.invalid, bold: true });
    P.text(150, 290, 'mid = lo, so lo = mid changes nothing', { size: 9.5, color: PAL.dim });
    P.text(40, 310, 'the state repeats for ever: hi = lo + 1 is the trap', { size: 10, mono: true, color: PAL.invalid });
    P.text(40, 326, 'fix: lo = mid + 1  (mid was already proved too small)', { size: 10, mono: true, color: PAL.valid });
  }

  /* fault two: overflow */
  if (t > 17) {
    panelBox(P, 456, 200, 420, 138, 'fault 2 \u2014 (lo + hi) overflows', PAL.invalid);
    P.text(472, 226, '32-bit signed int, lo = 1,500,000,000, hi = 1,600,000,000', { size: 9.5, color: PAL.dim });
    P.text(472, 250, 'lo + hi      = 3,100,000,000', { size: 10.5, mono: true, color: PAL.ink });
    P.text(472, 268, 'as int32     = -1,194,967,296', { size: 10.5, mono: true, color: PAL.invalid, bold: true });
    P.text(472, 286, 'halved       = -597,483,648  \u2192 A[negative]', { size: 10.5, mono: true, color: PAL.invalid });
    P.text(472, 310, 'lo + (hi - lo)/2 = 1,550,000,000', { size: 10.5, mono: true, color: PAL.valid, bold: true });
    P.text(472, 328, 'no intermediate value ever exceeds hi', { size: 9.5, color: PAL.dim });
  }

  if (t > 24) {
    panelBox(P, 24, 350, 852, 82, 'the rule that generates both faults', PAL.warn);
    P.text(40, 374, 'Every iteration must strictly shrink the range: at least one of lo, hi must move, and the new range must be smaller.',
           { size: 11, color: PAL.ink });
    P.text(40, 394, 'lo = mid is safe only when the loop condition is lo <= hi; with lo < hi it can be a no-op.',
           { size: 10.5, mono: true, color: PAL.dim });
    P.text(40, 414, 'Test with n = 2. The stall needs a final window of exactly two cells, so an odd-sized test passes.',
           { size: 10.5, color: PAL.warn });
  }
}

/* ======================================================================
   SCENE 6 - lower_bound and upper_bound
   ====================================================================== */
function sceneBounds(P, t) {
  head(P, 'scene 6', 'lower_bound and upper_bound: the duplicates problem');

  var cw = 92, x0 = 90, y0 = 88, ch = 44;
  cells(P, x0, y0, cw, ch, DUP, { showIndex: true, size: 15 });

  P.text(x0, y0 - 22, 'target x = 8, which occurs three times', { size: 11, mono: true, color: PAL.accent, bold: true });

  if (t > 4) {
    caret(P, x0, y0 + ch + 16, cw, 1, 'lower = 1', PAL.info);
  }
  if (t > 10) {
    caret(P, x0, y0 + ch + 44, cw, 4, 'upper = 4', PAL.warn);
  }
  if (t > 16) {
    /* the run of copies, bracketed */
    var bx = x0 + 1 * cw, bw = 3 * cw - 3;
    P.rect(bx, y0 - 12, bw, ch + 24, { stroke: PAL.valid, dash: [5, 4], radius: 6, sw: 1.6 });
    P.text(bx + bw / 2, y0 + ch + 74, 'count = 4 - 1 = 3', { size: 12, mono: true, color: PAL.valid, align: 'center', bold: true });
  }

  if (t > 8) {
    panelBox(P, 24, 210, 420, 128, 'lower_bound: the test is A[mid] < x', PAL.info);
    codeBlock(P, 40, 236, [
      'lo = 0;  hi = n;',
      'while (lo < hi) {',
      '  mid = (lo + hi) / 2;',
      '  if (A[mid] < x) lo = mid + 1;',
      '  else            hi = mid;',
      '}   // lo = first index with A[lo] >= x'
    ], { size: 9.5 });
  }

  if (t > 14) {
    panelBox(P, 456, 210, 420, 128, 'upper_bound: the test is A[mid] <= x', PAL.warn);
    codeBlock(P, 472, 236, [
      'lo = 0;  hi = n;',
      'while (lo < hi) {',
      '  mid = (lo + hi) / 2;',
      '  if (A[mid] <= x) lo = mid + 1;',
      '  else             hi = mid;',
      '}   // lo = first index with A[lo] > x'
    ], { size: 9.5 });
  }

  if (t > 22) {
    panelBox(P, 24, 348, 852, 84, 'what the two bounds are for', PAL.valid);
    P.text(40, 372, 'lower_bound is the insertion point, and it may be n: the array need not contain x at all.',
           { size: 11, color: PAL.ink });
    P.text(40, 392, 'upper_bound - lower_bound counts the copies; the last occurrence is upper_bound - 1, and only if the count is not 0.',
           { size: 11, color: PAL.ink });
    P.text(40, 412, 'One character separates the two loops. GATE 2014 Set 3 printed exactly this pair of tests inside a single loop.',
           { size: 10.5, color: PAL.dim });
  }
}

/* ======================================================================
   SCENE 7 - rotated array
   ====================================================================== */
function sceneRotated(P, t) {
  head(P, 'scene 7', 'A rotated sorted array still gives up in log n');

  var cw = 104, x0 = 76, y0 = 90, ch = 46;
  var lo = t > 16 ? 4 : (t > 8 ? 4 : 0), hi = t > 16 ? 4 : 6, mid = t > 16 ? 4 : (t > 8 ? 5 : 3);

  cells(P, x0, y0, cw, ch, ROT, { lo: lo, hi: hi, mid: mid, found: t > 16 ? 4 : -1, showIndex: true, size: 15 });

  P.text(x0, y0 - 22, 'sorted, then rotated left by 3 \u2014 target x = 7', { size: 11, mono: true, color: PAL.accent, bold: true });

  /* the two runs, labelled */
  if (t > 2) {
    P.rect(x0, y0 - 8, 3 * cw - 3, ch + 16, { stroke: PAL.warn, dash: [5, 4], radius: 6, sw: 1.4 });
    P.text(x0 + (3 * cw) / 2, y0 - 16, 'run 1: 43 to 51', { size: 9.5, mono: true, color: PAL.warn, align: 'center' });
    P.rect(x0 + 3 * cw, y0 - 8, 4 * cw - 3, ch + 16, { stroke: PAL.valid, dash: [5, 4], radius: 6, sw: 1.4 });
    P.text(x0 + 5 * cw, y0 - 16, 'run 2: 3 to 14', { size: 9.5, mono: true, color: PAL.valid, align: 'center' });
  }

  if (t > 6) {
    panelBox(P, 24, 186, 420, 118, 'the one fact to establish', PAL.accent);
    P.text(40, 212, 'A[lo] <= A[mid]  ?', { size: 13, mono: true, color: PAL.accent, bold: true });
    P.text(40, 234, 'yes \u2192 the left half is sorted', { size: 10.5, mono: true, color: PAL.info });
    P.text(40, 252, 'no  \u2192 the right half is sorted', { size: 10.5, mono: true, color: PAL.warn });
    P.text(40, 274, 'A rotation point inside one half leaves the other untouched,', { size: 9.5, color: PAL.dim });
    P.text(40, 290, 'so exactly one half is always monotone.', { size: 9.5, color: PAL.dim });
  }

  if (t > 12) {
    panelBox(P, 456, 186, 420, 118, 'then one range test', PAL.valid);
    P.text(472, 208, '43 > 3, so the right half is sorted.', { size: 10.5, color: PAL.ink });
    P.text(472, 224, 'is 7 in [3, 14]?  yes  \u2192  lo = mid + 1 = 4', { size: 10, mono: true, color: PAL.valid });
    P.text(472, 240, 'then A[lo] = 7 <= A[5] = 11, left sorted;', { size: 10, mono: true, color: PAL.dim });
    P.text(472, 254, '7 in [7, 11]?  yes  \u2192  hi = 4', { size: 10, mono: true, color: PAL.valid });
    P.text(472, 272, 'then A[4] = 7, equal. Three comparisons.', { size: 10.5, mono: true, color: PAL.accent, bold: true });
  }

  if (t > 20) {
    panelBox(P, 24, 320, 852, 112, 'the bound does not move', PAL.accent);
    P.text(40, 344, 'Each iteration still discards about half the live range, so the recurrence is the same:', { size: 11, color: PAL.ink });
    P.text(40, 366, 'F(n) = F(floor(n/2)) + 1   \u2192   floor(log2 n) + 1 comparisons, worst case', { size: 12, mono: true, color: PAL.accent, bold: true });
    P.text(40, 392, 'Every rotation of every distinct array up to seven cells is checked in this page: no wrong answer, worst case 3 at n = 7.',
           { size: 10.5, color: PAL.dim });
    P.text(40, 412, 'Rotation costs a constant amount of extra reasoning, not extra asymptotic time. Theta(n) is the trap option.',
           { size: 10.5, color: PAL.invalid });
  }
}

/* ======================================================================
   SCENE 8 - bitonic
   ====================================================================== */
function scenePeak(P, t) {
  head(P, 'scene 8', 'Bitonic arrays: find the peak, then two searches');

  var cw = 82, x0 = 96, y0 = 86, ch = 42;
  var pk = peakIndex(BIT);
  var stage = t < 8 ? 0 : (t < 14 ? 1 : (t < 20 ? 2 : 3));

  cells(P, x0, y0, cw, ch, BIT, {
    mid: stage === 0 ? 4 : -1,
    found: stage >= 1 ? pk.idx : -1,
    showIndex: true, size: 14
  });

  P.text(x0, y0 - 22, 'rises to a single peak, then falls \u2014 target x = 11', { size: 11, mono: true, color: PAL.accent, bold: true });

  if (t > 2) {
    P.text(x0 + 2 * cw, y0 - 42, 'ascending', { size: 9.5, mono: true, color: PAL.valid });
    P.text(x0 + 6 * cw, y0 - 42, 'descending', { size: 9.5, mono: true, color: PAL.warn });
    P.line(x0 + 4.5 * cw, y0 - 14, x0 + 4.5 * cw, y0 + ch + 16, { stroke: PAL.border, dash: [4, 4] });
    P.text(x0 + 4.5 * cw + 4, y0 + ch + 22, 'peak', { size: 9, mono: true, color: PAL.dim });
  }

  /* stage 1 */
  if (stage >= 1) {
    panelBox(P, 24, 182, 420, 112, 'stage 1 \u2014 find the peak', PAL.valid);
    P.text(40, 208, 'compare A[mid] with A[mid+1]', { size: 10.5, mono: true, color: PAL.ink });
    P.text(40, 228, 'smaller \u2192 still rising \u2192 lo = mid + 1', { size: 10.5, mono: true, color: PAL.dim });
    P.text(40, 246, 'otherwise \u2192 hi = mid', { size: 10.5, mono: true, color: PAL.dim });
    P.text(40, 270, 'peak found at index ' + pk.idx + ' in ' + pk.cmp + ' comparisons', { size: 11, mono: true, color: PAL.valid, bold: true });
  }

  /* stage 2 */
  if (stage >= 2) {
    panelBox(P, 456, 182, 420, 112, 'stage 2 \u2014 two monotone runs', PAL.info);
    P.text(472, 208, 'A[0..4] ascending: binary search for 11', { size: 10.5, mono: true, color: PAL.ink });
    P.text(472, 226, 'not found there', { size: 10.5, mono: true, color: PAL.dim });
    P.text(472, 248, 'A[5..8] descending: search with the', { size: 10.5, mono: true, color: PAL.ink });
    P.text(472, 264, 'inequality reversed \u2192 11 at index 6', { size: 10.5, mono: true, color: PAL.valid });
  }

  if (t > 20) {
    panelBox(P, 24, 306, 852, 126, 'three stages, added not multiplied', PAL.accent);
    P.text(40, 330, 'peak ' + pk.cmp + '  +  left run 3  +  right run 2  =  8 comparisons, and 8 is the worst case over all targets on 9 cells.',
           { size: 11, mono: true, color: PAL.ink });
    P.text(40, 354, 'Theta(log n) + Theta(log n) + Theta(log n)  =  Theta(log n)', { size: 12.5, mono: true, color: PAL.accent, bold: true });
    P.text(40, 378, 'Multiplying them gives Theta(log^2 n) \u2014 that is the trap option in the 2025 paper. Sequential stages add; nested loops multiply.',
           { size: 10.5, color: PAL.invalid });
    P.text(40, 400, 'It is also optimal: any comparison search among n distinct values needs Omega(log n). The official answer is Theta(log n).',
           { size: 10.5, color: PAL.dim });
    P.text(40, 418, 'Each probe here reads two cells, so a question counting array accesses gets a different number from one counting comparisons.',
           { size: 10, color: PAL.faint });
  }
}

/* ======================================================================
   SCENE 9 - binary search on a predicate
   ====================================================================== */
function scenePredicate(P, t) {
  head(P, 'scene 9', 'Binary search on the answer, not on the array');

  /* the value line, 0 to 63 */
  var x0 = 60, x1 = 856, y = 118, N = 63;
  var px = function (v) { return x0 + (v / N) * (x1 - x0); };
  var split = 32;
  P.rect(x0, y, px(split) - x0, 34, { fill: PAL.invalidDim, stroke: PAL.invalid, radius: 4, sw: 1.2 });
  P.rect(px(split), y, x1 - px(split), 34, { fill: PAL.accentDim, stroke: PAL.accent, radius: 4, sw: 1.2 });
  P.text(x0 + (px(split) - x0) / 2, y + 11, 'P(x) false', { size: 10.5, mono: true, color: PAL.invalid, align: 'center' });
  P.text(px(split) + (x1 - px(split)) / 2, y + 11, 'P(x) true', { size: 10.5, mono: true, color: PAL.accent, align: 'center' });
  P.line(px(split), y - 12, px(split), y + 46, { stroke: PAL.ink, dash: [4, 3], sw: 1.4 });
  P.text(px(split), y - 28, 'the flip point: x = 32', { size: 11, mono: true, color: PAL.ink, align: 'center', bold: true });

  P.text(x0, y - 28, '0', { size: 9.5, mono: true, color: PAL.faint });
  P.text(x1, y - 28, '63', { size: 9.5, mono: true, color: PAL.faint, align: 'right' });

  P.text(24, 78, 'predicate P(x) = (x\u00B2 \u2265 1000), monotone: once true, always true',
         { size: 11, mono: true, color: PAL.ink, bold: true });

  /* the probes */
  var probes = [[0, 63, 31], [32, 63, 47], [32, 47, 39], [32, 39, 35], [32, 35, 33], [32, 33, 32]];
  var shown = t < 4 ? 0 : Math.min(6, Math.floor((t - 4) / 3.2) + 1);
  for (var i = 0; i < shown; i++) {
    var pr = probes[i], cx = px(pr[2]);
    var truth = pr[2] * pr[2] >= 1000;
    P.circle(cx, y + 52 + (i % 2) * 0, 5, { fill: truth ? PAL.accent : PAL.invalid, stroke: '#ffffff', sw: 1 });
    P.text(cx, y + 62, String(pr[2]), { size: 9, mono: true, color: PAL.dim, align: 'center' });
    if (i < 5) P.line(cx, y + 45, px(probes[i + 1][2]), y + 45, { stroke: PAL.border, dash: [3, 3] });
  }
  if (shown > 0) {
    P.text(24, y + 84, 'probes: ' + probes.slice(0, shown).map(function (p) { return p[2]; }).join(', '),
           { size: 10.5, mono: true, color: PAL.dim });
  }

  if (t > 14) {
    panelBox(P, 24, 232, 420, 116, 'the loop is the same ten lines', PAL.info);
    codeBlock(P, 40, 258, [
      'lo = 0;  hi = N;',
      'while (lo < hi) {',
      '  mid = (lo + hi) / 2;',
      '  if (P(mid)) hi = mid;',
      '  else        lo = mid + 1;',
      '}   // lo = first true value'
    ], { size: 9.5 });
  }

  if (t > 19) {
    panelBox(P, 456, 232, 420, 116, 'what changed, and what did not', PAL.accent);
    P.text(472, 258, 'changed: lo and hi are VALUES, not indices', { size: 10.5, mono: true, color: PAL.ink });
    P.text(472, 276, 'changed: the test is a predicate, not a comparison', { size: 10.5, mono: true, color: PAL.ink });
    P.text(472, 294, 'unchanged: the halving, the invariant, the count', { size: 10.5, mono: true, color: PAL.valid });
    P.text(472, 318, 'six calls for a range of 64 values', { size: 10.5, mono: true, color: PAL.accent, bold: true });
    P.text(472, 336, '= ceil(log2(range))', { size: 9.5, mono: true, color: PAL.faint });
  }

  if (t > 24) {
    panelBox(P, 24, 360, 852, 72, 'the two things that go wrong', PAL.invalid);
    P.text(40, 384, 'A predicate that flips twice has no single boundary: the loop returns whichever one it lands on. Prove monotonicity first.',
           { size: 11, color: PAL.ink });
    P.text(40, 404, 'A range that excludes the answer returns the range end with no error. The cost is log of the RANGE, not of the data;',
           { size: 10.5, color: PAL.dim });
    P.text(40, 420, 'and if each call scans n items, the total is n log(range) \u2014 the inner cost is a separate factor.', { size: 10.5, color: PAL.dim });
  }
}

/* ======================================================================
   SCENE 10 - the lower bound and the checklist
   ====================================================================== */
function sceneLower(P, t) {
  head(P, 'scene 10', 'Why log n is a wall, and the decision procedure');

  /* the comparison tree for n = 7 */
  if (t < 14) {
    var cy = [92, 152, 212], leavesY = 274;
    var nodes = [
      [[450, cy[0]]],
      [[300, cy[1]], [600, cy[1]]],
      [[200, cy[2]], [400, cy[2]], [500, cy[2]], [700, cy[2]]]
    ];
    var labels = [['7'], ['3', '5'], ['1', '2', '4', '6']];
    for (var lv = 0; lv < 3; lv++) {
      if (t < 2 + lv * 3) continue;
      for (var i = 0; i < nodes[lv].length; i++) {
        var nd = nodes[lv][i];
        P.circle(nd[0], nd[1], 15, { fill: '#ffffff', stroke: PAL.accent, sw: 1.6 });
        P.text(nd[0], nd[1] - 6, labels[lv][i], { size: 10, mono: true, color: PAL.accent, align: 'center', bold: true });
        if (lv > 0) {
          var parent = nodes[lv - 1][Math.floor(i / 2)];
          P.line(parent[0], parent[1] + 15, nd[0], nd[1] - 15, { stroke: PAL.border, sw: 1.2 });
        }
      }
    }
    if (t > 8) {
      for (var lf = 0; lf < 8; lf++) {
        var lx = 150 + lf * 88;
        P.circle(lx, leavesY, 6, { fill: PAL.surface2, stroke: PAL.border, sw: 1.2 });
        P.line(nodes[2][Math.floor(lf / 2)][0], cy[2] + 15, lx, leavesY - 6, { stroke: PAL.border, sw: 1 });
      }
      P.text(150, leavesY + 18, '8 leaves = 7 hits + 1 miss', { size: 10, mono: true, color: PAL.dim });
    }
    P.text(24, 74, 'the comparison tree for n = 7: one internal node per comparison, one leaf per outcome',
           { size: 11, mono: true, color: PAL.ink });
    if (t > 4) {
      panelBox(P, 24, 306, 852, 60, 'counting the outcomes', PAL.info);
      P.text(40, 330, 'a tree of height h has at most 2^h - 1 internal nodes, so  n \u2264 2^h - 1  \u2192  h \u2265 ceil(log2(n+1))',
             { size: 12, mono: true, color: PAL.info, bold: true });
      P.text(40, 350, 'binary search meets it exactly, so its comparison tree is as balanced as n allows: that is what optimal means here.',
             { size: 10.5, color: PAL.dim });
    }
  }

  /* the ternary comparison */
  if (t >= 14 && t < 22) {
    panelBox(P, 24, 74, 420, 128, 'ternary search, measured', PAL.warn);
    P.text(40, 100, 'two comparisons per level, range cut to a third', { size: 10, color: PAL.dim });
    P.text(40, 124, 'n = 100,000', { size: 11, mono: true, color: PAL.ink });
    P.text(40, 146, 'binary  : 17 comparisons', { size: 11, mono: true, color: PAL.accent, bold: true });
    P.text(40, 166, 'ternary : 22 comparisons', { size: 11, mono: true, color: PAL.warn, bold: true });
    P.text(40, 188, 'ratio \u2192 2 / log2 3 = 1.262', { size: 10.5, mono: true, color: PAL.dim });

    panelBox(P, 456, 74, 420, 128, 'why more comparisons is worse', PAL.info);
    P.text(472, 100, 'k-way search costs (k-1)/log2 k per level', { size: 10.5, mono: true, color: PAL.ink });
    P.text(472, 122, 'k = 2 : 1.000', { size: 10.5, mono: true, color: PAL.accent, bold: true });
    P.text(472, 142, 'k = 3 : 1.262', { size: 10.5, mono: true, color: PAL.warn });
    P.text(472, 162, 'k = 4 : 1.500', { size: 10.5, mono: true, color: PAL.invalid });
    P.text(472, 186, 'minimised at k = 2: binary is the best of the family', { size: 9.5, color: PAL.dim });
  }

  /* the checklist */
  if (t > 22) {
    var qs = [
      ['1', 'sorted, or a monotone predicate?', 'neither \u2192 Theta(n) for one query'],
      ['2', 'which count?', 'comparisons, iterations, accesses, time'],
      ['3', 'which loop shape?', 'closed with <=, or half-open with <'],
      ['4', 'present, or possibly absent?', 'a miss costs the same, not less'],
      ['5', 'which assumption did the stem give?', 'distinct values, a distribution, a bound']
    ];
    for (var q = 0; q < qs.length; q++) {
      var y = 74 + q * 40;
      P.text(30, y, qs[q][0], { size: 11, mono: true, color: PAL.accent, bold: true });
      P.text(52, y, qs[q][1], { size: 11, mono: true, color: PAL.ink, bold: true });
      P.text(360, y, qs[q][2], { size: 10, color: PAL.dim });
    }
    panelBox(P, 24, 284, 852, 148, 'the sentence to leave with', PAL.accent);
    P.text(40, 310, 'A lower bound says nothing can be faster. It never says anything is achievable.', { size: 12, color: PAL.ink, bold: true });
    P.text(40, 334, 'A matching upper bound is a separate argument, and a question that says "best possible" wants both.', { size: 11, color: PAL.dim });
    P.text(40, 360, 'Theta(log n) for a sorted array  =  the algorithm (upper)  +  the decision tree (lower).', { size: 11, mono: true, color: PAL.accent });
    P.text(40, 386, 'The comparison model is what the bound is about: hashing computes an address instead, and escapes it.', { size: 10.5, color: PAL.dim });
    P.text(40, 410, 'Write every count with its convention attached: "5 comparisons, including the final equality test".', { size: 10.5, color: PAL.warn });
  }
}

/* ======================================================================
   the scene table
   ====================================================================== */
var SCENES = {
  halving: sceneHalving,
  invariant: sceneInvariant,
  trace: sceneTrace,
  counts: sceneCounts,
  loops: sceneLoops,
  bounds: sceneBounds,
  rotated: sceneRotated,
  peak: scenePeak,
  predicate: scenePredicate,
  lowerbound: sceneLower
};

function drawFrame(painter) {
  if (!painter) return;
  var tl = window.LESSON_TIMELINE;
  var tt = K.state.elapsed;
  var idx = K.sceneAt(tt);
  var sc = tl.scenes[idx];
  painter.alpha(1);
  painter.clear();
  bg(painter);
  if (sc && SCENES[sc.id]) {
    try {
      SCENES[sc.id](painter, tt - sc.start);
    } catch (err) {
      console.error('scene draw failed', sc.id, err);
    }
  }
}

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var passed = CHECKS.filter(function (c) { return c.pass; }).length;
  var html = '<span class="k">Model checks</span>' +
    '<span class="ok">' + passed + ' / ' + CHECKS.length + ' passed</span>';
  html += '<details style="margin-top:5px"><summary style="cursor:pointer;color:var(--text-faint)">what was checked</summary>';
  CHECKS.forEach(function (c) {
    html += '<div style="margin-top:3px">' +
      (c.pass ? '<span class="ok">\u2713</span>' : '<span style="color:var(--invalid)">\u2717</span> ') +
      c.name + (c.detail ? '<br><span style="opacity:.7">' + c.detail + '</span>' : '') +
      '</div>';
  });
  html += '</details>';
  el.innerHTML = html;
}

  function boot() {
    buildChecks();
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

    K.onResize(function () {
      if (P) drawFrame(P);
    });

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
