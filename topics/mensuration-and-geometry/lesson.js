/* ==========================================================================
   mensuration-and-geometry — lesson.js
   Four layers, in order:
     1. THE MODEL      — every figure, formula value and comparison the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition or an
                         independent recomputation (numeric slicing, sampling,
                         exhaustive enumeration).
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The model is elementary mensuration: perimeter and area of the plane figures,
   surface area and volume of the solids, the k / k squared / k cubed scale law
   for similar figures, and the mapping that turns a flat sheet into a cylinder
   or a cube. Volumes that carry a 1/3 or a 4/3 factor are not asserted: they are
   recomputed here by stacking thin slices, which is the argument the animation
   shows. Two previous-year items are reproduced because their year, paper and
   answer could be confirmed; both are recomputed here rather than quoted.
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
  var BADDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

  var PI = Math.PI;

  /* ---------- the two sheets of the 2021 question ---------- */
  var SHEET = { w: 6, h: 1 };

  function sheetArea(s) { return s.w * s.h; }
  function sheetPerim(s) { return 2 * (s.w + s.h); }

  /* Roll a w-by-h sheet by bringing its two short edges together: the long edge
     closes into the circle, the short edge stands up as the height. */
  function rollLong(s) {
    var circ = s.w, height = s.h;
    var r = circ / (2 * PI);
    return {
      circ: circ, h: height, r: r,
      disc: PI * r * r,
      vol: PI * r * r * height,
      lateral: 2 * PI * r * height,
      ends: 2 * PI * r * r
    };
  }
  /* The other way: bring the long edges together, so the short edge is the circle. */
  function rollShort(s) {
    var circ = s.h, height = s.w;
    var r = circ / (2 * PI);
    return {
      circ: circ, h: height, r: r,
      disc: PI * r * r,
      vol: PI * r * r * height,
      lateral: 2 * PI * r * height,
      ends: 2 * PI * r * r
    };
  }

  /* A closed cube whose whole surface is the sheet. */
  function cubeFromArea(area) {
    var a = Math.sqrt(area / 6);
    return { a: a, vol: a * a * a, surface: 6 * a * a, faces: 6 };
  }

  var CYL = rollLong(SHEET);
  var CYL2 = rollShort(SHEET);
  var CUBE = cubeFromArea(sheetArea(SHEET));

  /* ---------- plane figures ---------- */
  function rectArea(a, b) { return a * b; }
  function triArea(base, height) { return 0.5 * base * height; }
  function heron(a, b, c) {
    var s = (a + b + c) / 2;
    return Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
  }
  function trapArea(a, b, h) { return 0.5 * (a + b) * h; }
  function circleArea(r) { return PI * r * r; }
  function sectorArea(r, deg) { return PI * r * r * deg / 360; }
  function arcLength(r, deg) { return 2 * PI * r * deg / 360; }
  function annulusArea(R, r) { return PI * (R * R - r * r); }
  /* the square path of width w around an a-by-a square */
  function squarePath(a, w) { return (a + 2 * w) * (a + 2 * w) - a * a; }

  /* ---------- solids ---------- */
  function cylinder(r, h) { return { vol: PI * r * r * h, lateral: 2 * PI * r * h, ends: 2 * PI * r * r }; }
  function cone(r, h) {
    var l = Math.sqrt(r * r + h * h);
    return { r: r, h: h, slant: l, vol: PI * r * r * h / 3, lateral: PI * r * l, total: PI * r * l + PI * r * r };
  }
  function sphere(R) { return { R: R, vol: 4 * PI * R * R * R / 3, surf: 4 * PI * R * R }; }
  function hemisphere(R) { return { R: R, vol: 2 * PI * R * R * R / 3, curved: 2 * PI * R * R, total: 3 * PI * R * R }; }
  function pyramid(a, h) { return { a: a, h: h, vol: a * a * h / 3 }; }
  function cuboid(a, b, c) { return { a: a, b: b, c: c, vol: a * b * c, surf: 2 * (a * b + b * c + c * a) }; }

  /* ---------- independent recomputations ---------- */

  /* Stack N thin discs up the cone: radius at height x is r (1 - x/h). */
  function coneVolSlices(r, h, N) {
    N = N || 4000;
    var dx = h / N, s = 0;
    for (var i = 0; i < N; i++) {
      var x = (i + 0.5) * dx;
      var rr = r * (1 - x / h);
      s += PI * rr * rr * dx;
    }
    return s;
  }
  /* Stack N thin square slabs up the pyramid. */
  function pyramidVolSlices(a, h, N) {
    N = N || 4000;
    var dx = h / N, s = 0;
    for (var i = 0; i < N; i++) {
      var x = (i + 0.5) * dx;
      var side = a * (1 - x / h);
      s += side * side * dx;
    }
    return s;
  }
  /* Stack N thin discs across the sphere. */
  function sphereVolSlices(R, N) {
    N = N || 4000;
    var dx = 2 * R / N, s = 0;
    for (var i = 0; i < N; i++) {
      var x = -R + (i + 0.5) * dx;
      s += PI * (R * R - x * x) * dx;
    }
    return s;
  }
  /* The step curve's area, recomputed by sampling the curve itself. */
  function stepSampled(N) {
    N = N || 20000;
    var s = 0, dx = 1 / N;
    for (var i = 0; i < N; i++) s += STEP_Y((i + 0.5) * dx) * dx;
    return s;
  }
  function STEP_Y(x) {
    if (x < 1 / 3) return 2;
    if (x < 3 / 4) return 3;
    return 1;
  }

  var STEP = {
    x: [0, 1 / 3, 3 / 4, 1],
    w: [1 / 3, 3 / 4 - 1 / 3, 1 - 3 / 4],
    h: [2, 3, 1]
  };
  STEP.prod = STEP.w.map(function (w, i) { return w * STEP.h[i]; });
  STEP.sum = STEP.prod.reduce(function (a, b) { return a + b; }, 0);

  /* ---------- exhaustive enumerations ---------- */

  /* Every integer rectangle of perimeter p: the best area. */
  function bestRectForPerimeter(p) {
    var half = p / 2, best = null, all = [];
    for (var a = 1; a < half; a++) {
      var b = half - a;
      if (b < a) break;
      all.push({ a: a, b: b, area: a * b });
      if (!best || a * b > best.area) best = { a: a, b: b, area: a * b };
    }
    return { best: best, all: all };
  }

  /* Every integer cuboid with ab + bc + ca = S/2: the best volume. */
  function bestCuboidForSurface(S) {
    var half = S / 2, best = null, count = 0;
    for (var a = 1; a <= 60; a++) {
      for (var b = a; b <= 60; b++) {
        var ab = a * b;
        if (ab >= half) break;
        var c = (half - ab) / (a + b);
        if (c < b - 1e-9) continue;
        var cr = Math.round(c);
        if (Math.abs(c - cr) > 1e-9) continue;
        count++;
        var v = a * b * cr;
        if (!best || v > best.vol) best = { a: a, b: b, c: cr, vol: v };
      }
    }
    return { best: best, count: count };
  }

  /* A sphere with a given surface area: its volume. */
  function sphereFromSurface(S) {
    var r = Math.sqrt(S / (4 * PI));
    return { r: r, vol: 4 * PI * r * r * r / 3, surf: S };
  }

  /* ---------- the figures the page quotes ---------- */
  var M = {
    sheet: SHEET,
    area: sheetArea(SHEET),
    perim: sheetPerim(SHEET),
    cyl: CYL,
    cyl2: CYL2,
    cube: CUBE,
    ratio: CYL.vol / CUBE.vol,
    rollRatio: CYL.vol / CYL2.vol,
    step: STEP,
    tri345: { a: 3, b: 4, c: 5, area: triArea(4, 3), heightOn5: 2 * triArea(4, 3) / 5 },
    triScaled: { a: 6, b: 8, c: 10, area: triArea(8, 6) },
    tri131415: { a: 13, b: 14, c: 15, area: heron(13, 14, 15), heightOn14: 2 * heron(13, 14, 15) / 14 },
    trap: trapArea(6, 10, 4),
    sector: { r: 4, deg: 90, area: sectorArea(4, 90), arc: arcLength(4, 90) },
    squarePath: squarePath(10, 1),
    circlePath: annulusArea(6, 5),
    cone: cone(3, 4),
    pyramid: pyramid(6, 4),
    sphere3: sphere(3),
    hemi3: hemisphere(3),
    rect12: bestRectForPerimeter(12),
    cuboid54: bestCuboidForSurface(54),
    sphereFrom6: sphereFromSurface(6)
  };

/* ======================================================================
   LAYER 2 - THE CHECKS
   Every number the lesson states is re-verified here. A failure is printed on
   the page, never hidden.
   ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) {
    CHECKS.push({ name: name, pass: !!pass, detail: detail || '' });
  }
  function near(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-9); }

  /* --- the sheet --- */
  check('sheet area is 6 and perimeter is 14',
    M.area === 6 && M.perim === 14, M.area + ' / ' + M.perim);

  check('six unit squares tile the sheet exactly',
    near(SHEET.w / 1, 6) && near(SHEET.h / 1, 1) && 6 * 1 === M.area,
    '6 squares of 1 by 1');

  check('a square of side 2 does not fit: needs width 2, strip is 1 wide',
    2 > SHEET.h && 4 <= M.area, 'area enough, width not');

  /* --- rolling --- */
  check('rolling the long edge: 2 pi r equals the 6 cm edge',
    near(2 * PI * CYL.r, 6, 1e-12), 'r = ' + CYL.r.toFixed(6));

  check('the curved surface equals the sheet area (paper is not stretched)',
    near(CYL.lateral, M.area, 1e-12), CYL.lateral.toFixed(9));

  check('cylinder volume is 9/pi and equals lateral times r over 2',
    near(CYL.vol, 9 / PI, 1e-12) && near(CYL.vol, CYL.lateral * CYL.r / 2, 1e-12),
    CYL.vol.toFixed(6));

  check('rolling the short edge gives 3/(2 pi) and is six times smaller',
    near(CYL2.vol, 3 / (2 * PI), 1e-12) && near(M.rollRatio, 6, 1e-12),
    CYL2.vol.toFixed(6) + ' / ratio ' + M.rollRatio.toFixed(6));

  /* --- the cube --- */
  check('cube from area 6: side 1, volume 1, surface 6',
    near(CUBE.a, 1, 1e-12) && near(CUBE.vol, 1, 1e-12) && near(CUBE.surface, 6, 1e-12),
    'a = ' + CUBE.a);

  check('the 6 by 1 strip cuts into exactly six 1 by 1 squares',
    SHEET.w / SHEET.h === 6, 'no waste');

  check('the 2021 ratio is 9/pi',
    near(M.ratio, 9 / PI, 1e-12), M.ratio.toFixed(6));

  /* --- the scale law --- */
  (function () {
    var s1 = 1, s2 = 2, s3 = 3;
    var areaK2 = rectArea(s2, s2) / rectArea(s1, s1);
    var volK2 = (s2 * s2 * s2) / (s1 * s1 * s1);
    var areaK3 = rectArea(s3, s3) / rectArea(s1, s1);
    var volK3 = (s3 * s3 * s3) / (s1 * s1 * s1);
    check('scale law on the square and the cube: k=2 gives 4 and 8, k=3 gives 9 and 27',
      areaK2 === 4 && volK2 === 8 && areaK3 === 9 && volK3 === 27,
      [areaK2, volK2, areaK3, volK3].join(' / '));
    var v1 = sphere(1).vol, v2 = sphere(2).vol;
    check('the scale law holds for the sphere too: volume factor is k cubed',
      near(v2 / v1, 8, 1e-9), (v2 / v1).toFixed(9));
    check('the scale law for a model at one tenth: area 1/100, volume 1/1000',
      near(Math.pow(0.1, 2), 0.01, 1e-15) && near(Math.pow(0.1, 3), 0.001, 1e-15), '');
  })();

  /* --- triangles --- */
  check('3-4-5 from base 4 and from base 5 give the same area 6',
    near(M.tri345.area, 6, 1e-12) &&
    near(triArea(5, M.tri345.heightOn5), 6, 1e-12) &&
    near(M.tri345.heightOn5, 12 / 5, 1e-12),
    'height on 5 is ' + M.tri345.heightOn5.toFixed(6));

  check('Heron agrees with base times height on the 13-14-15 triangle',
    near(M.tri131415.area, 84, 1e-9) && near(triArea(14, M.tri131415.heightOn14), 84, 1e-9),
    'area ' + M.tri131415.area.toFixed(6) + ', height on 14 is ' + M.tri131415.heightOn14);

  check('doubling every side of 3-4-5 multiplies the area by 4, not by 2',
    near(M.triScaled.area, 24, 1e-12) && near(M.triScaled.area / M.tri345.area, 4, 1e-12), '');

  check('the 3-4-5 triangle is right: 3 squared + 4 squared = 5 squared',
    near(3 * 3 + 4 * 4, 5 * 5, 1e-12), '');

  /* --- the step curve --- */
  check('the step widths add to 1',
    near(STEP.w.reduce(function (a, b) { return a + b; }, 0), 1, 1e-12), '');

  check('the step area is 13/6 by the rectangles and by sampling the curve',
    near(STEP.sum, 13 / 6, 1e-12) && near(stepSampled(), 13 / 6, 5e-4),
    STEP.sum.toFixed(9) + ' / sampled ' + stepSampled().toFixed(6));

  /* --- solids recomputed by slicing --- */
  check('cone volume (1/3) pi r squared h matches the stacked discs',
    near(coneVolSlices(3, 4), M.cone.vol, 1e-2),
    coneVolSlices(3, 4).toFixed(6) + ' against ' + M.cone.vol.toFixed(6));

  check('cone slant height is 5, lateral 15 pi, total 24 pi',
    near(M.cone.slant, 5, 1e-12) && near(M.cone.lateral, 15 * PI, 1e-12) &&
    near(M.cone.total, 24 * PI, 1e-12), '');

  check('pyramid volume a squared h / 3 matches the stacked slabs',
    near(pyramidVolSlices(6, 4), M.pyramid.vol, 1e-2),
    pyramidVolSlices(6, 4).toFixed(6) + ' against ' + M.pyramid.vol);

  check('sphere volume 4/3 pi r cubed matches the stacked discs',
    near(sphereVolSlices(3), M.sphere3.vol, 1e-2),
    sphereVolSlices(3).toFixed(6) + ' against ' + M.sphere3.vol.toFixed(6));

  check('at r = 3 the sphere volume and surface are equal, and not at r = 4',
    near(M.sphere3.vol, M.sphere3.surf, 1e-9) &&
    !near(sphere(4).vol, sphere(4).surf, 1e-3),
    '36 pi both');

  check('hemisphere at r = 3: volume 18 pi and curved surface 18 pi',
    near(M.hemi3.vol, 18 * PI, 1e-9) && near(M.hemi3.curved, 18 * PI, 1e-9), '');

  /* --- optima --- */
  check('with perimeter 12 the square 3 by 3 wins among integer rectangles',
    M.rect12.best.a === 3 && M.rect12.best.b === 3 && M.rect12.best.area === 9 &&
    M.rect12.all.length === 3, JSON.stringify(M.rect12.all));

  check('with surface 54 the cube 3 by 3 by 3 wins among integer cuboids',
    M.cuboid54.best.vol === 27 && M.cuboid54.best.a === 3 &&
    M.cuboid54.best.b === 3 && M.cuboid54.best.c === 3,
    M.cuboid54.count + ' cuboids checked');

  check('a sphere with surface 6 holds more than the unit cube (isoperimetric)',
    M.sphereFrom6.vol > CUBE.vol + 1e-9,
    M.sphereFrom6.vol.toFixed(6) + ' against 1');

  /* --- paths and sectors --- */
  check('a 1 cm path around a 10 by 10 square is 44, around a circle of r = 5 it is 11 pi',
    M.squarePath === 44 && near(M.circlePath, 11 * PI, 1e-12),
    M.squarePath + ' / ' + M.circlePath.toFixed(6));

  check('a quarter sector of radius 4: area 4 pi, arc 2 pi',
    near(M.sector.area, 4 * PI, 1e-12) && near(M.sector.arc, 2 * PI, 1e-12), '');

  check('trapezium (6, 10, height 4) is 32, the same as the two triangles it splits into',
    near(M.trap, 32, 1e-12) && near(triArea(6, 4) + triArea(10, 4), M.trap, 1e-12),
    'half of 6 by 4 plus half of 10 by 4 is 12 + 20 = 32');

  window.__lessonChecks = CHECKS;

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function ell(cx, cy, rx, ry, o) {
    var n = 48, prevX = null, prevY = null;
    for (var i = 0; i <= n; i++) {
      var a = (i / n) * Math.PI * 2;
      var x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      if (prevX !== null) P.line(prevX, prevY, x, y, o);
      prevX = x; prevY = y;
    }
  }

  function cylinderShape(cx, cy, r, hPx, o) {
    o = o || {};
    var ry = Math.max(6, r * 0.32);
    P.rect(cx - r, cy - hPx, 2 * r, hPx, { fill: o.fill || ACCDIM, stroke: null });
    P.line(cx - r, cy - hPx, cx - r, cy, { stroke: o.stroke || ACC, sw: 2 });
    P.line(cx + r, cy - hPx, cx + r, cy, { stroke: o.stroke || ACC, sw: 2 });
    ell(cx, cy, r, ry, { stroke: o.stroke || ACC, sw: 2 });
    ell(cx, cy - hPx, r, ry, { stroke: o.stroke || ACC, sw: 2, fill: o.top || SURF });
  }

  function isoCube(x, y, s, o) {
    o = o || {};
    var d = s * 0.42;
    var f = o.fill || ACCDIM, st = o.stroke || ACC;
    /* front face */
    P.rect(x, y, s, s, { fill: f, stroke: st, sw: 2 });
    /* top and right faces */
    P.tri(x, y, x + d, y - d, x + s + d, y - d, { fill: o.top || SURF2, stroke: st, sw: 1.5 });
    P.tri(x, y, x + s, y, x + s + d, y - d, { fill: o.top || SURF2, stroke: st, sw: 1.5 });
    P.tri(x + s, y, x + s + d, y - d, x + s + d, y + s - d, { fill: o.side || SURF2, stroke: st, sw: 1.5 });
    P.tri(x + s, y, x + s, y + s, x + s + d, y + s - d, { fill: o.side || SURF2, stroke: st, sw: 1.5 });
    P.line(x + d, y - d, x + s + d, y - d, { stroke: st, sw: 1.5 });
    P.line(x + s + d, y - d, x + s + d, y + s - d, { stroke: st, sw: 1.5 });
    P.line(x + s, y + s, x + s + d, y + s - d, { stroke: st, sw: 1.5 });
  }

  function dim(x1, y1, x2, y2, label, o) {
    o = o || {};
    P.arrow(x1, y1, x2, y2, { stroke: o.stroke || DIM, sw: 1.2, head: 7 });
    P.arrow(x2, y2, x1, y1, { stroke: o.stroke || DIM, sw: 1.2, head: 7 });
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    P.text(mx + (o.dx || 0), my + (o.dy || -8), label, {
      size: o.size || 12, mono: true, align: 'center', base: 'bottom', color: o.color || DIM
    });
  }

  function head(text, sub) {
    P.text(24, 20, text, { size: 15, bold: true, color: INK });
    if (sub) P.text(24, 42, sub, { size: 12, color: DIM });
  }

  function note(x, y, text, colour, size) {
    P.text(x, y, text, { size: size || 12, mono: true, color: colour || DIM });
  }

  /* a 6 by 1 sheet drawn to scale, one unit = u pixels */
  function sheetShape(x, y, u, o) {
    o = o || {};
    var w = SHEET.w * u, h = SHEET.h * u;
    P.rect(x, y, w, h, { fill: o.fill || ACCDIM, stroke: o.stroke || ACC, sw: 2 });
    if (o.grid) {
      for (var i = 1; i < SHEET.w; i++) P.line(x + i * u, y, x + i * u, y + h, { stroke: FAINT, sw: 1, dash: [3, 3] });
    }
    if (o.labels) {
      for (var j = 0; j < SHEET.w; j++) {
        P.text(x + j * u + u / 2, y + h / 2, String(j + 1), { size: 13, mono: true, align: 'center', base: 'middle', color: ACC });
      }
    }
    return { w: w, h: h };
  }

  var SCENE_DRAW = {};

  /* ---------- scene 1: three questions ---------- */
  SCENE_DRAW.threequestions = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('One sheet: 6 cm by 1 cm', 'perimeter, area and volume are three different questions');
    var u = 84, x = 60, y = 200;
    var d = sheetShape(x, y, u);
    dim(x, y + d.h + 26, x + d.w, y + d.h + 26, '6 cm', { dy: 4 });
    dim(x - 26, y, x - 26, y + d.h, '1 cm', { dx: -12, dy: -2 });

    var tags = [
      { at: 0.12, t: 'fence round the edge', v: 'perimeter = 14 cm', c: INFO },
      { at: 0.42, t: 'paint on the surface', v: 'area = 6 sq cm', c: VAL },
      { at: 0.72, t: 'water inside', v: 'volume = 0 until folded', c: WARN }
    ];
    tags.forEach(function (g) {
      if (p < g.at) return;
      P.alpha(Math.min(1, (p - g.at) / 0.06));
      var yy = 150 + tags.indexOf(g) * 92;
      P.rect(660, yy, 220, 70, { fill: SURF, stroke: g.c, sw: 1.5, radius: 8 });
      P.text(674, yy + 16, g.t, { size: 12, color: g.c, bold: true });
      P.text(674, yy + 40, g.v, { size: 13, mono: true, color: INK });
      P.alpha(1);
    });
    P.alpha(1);
    if (p > 0.9) note(60, 420, 'a length, an area and a volume are never interchangeable', DIM, 12);
  };

  /* ---------- scene 2: unit square and unit cube ---------- */
  SCENE_DRAW.units = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Area is a count of unit squares', 'volume is a count of unit cubes');
    var u = 84, x = 60, y = 170;
    var d = sheetShape(x, y, u, { grid: p > 0.15, labels: p > 0.3 });
    P.text(x, y - 14, '6 unit squares, no gap, no overlap', { size: 12, color: VAL });

    if (p > 0.55) {
      P.alpha(Math.min(1, (p - 0.55) / 0.1));
      P.rect(x + u, y - u / 2, 2 * u, 2 * u, { stroke: BAD, sw: 2, dash: [6, 5], fill: null });
      P.text(x + 2 * u, y - u / 2 - 10, 'a 2 by 2 square needs a strip 2 cm wide', { size: 12, color: BAD, align: 'center' });
      P.alpha(1);
    }

    isoCube(660, 230, 54, {});
    P.text(660, 190, 'side 1 cm', { size: 12, mono: true, color: DIM });
    P.text(660, 306, 'volume 1 cubic cm', { size: 13, mono: true, color: ACC });
    if (p > 0.35) {
      note(60, 350, 'area unit: cm x cm = square cm', DIM);
      note(60, 372, 'volume unit: cm x cm x cm = cubic cm', DIM);
    }
  };

  /* ---------- scene 3: the scale law ---------- */
  SCENE_DRAW.scale = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Scale every length by k', 'areas multiply by k squared, volumes by k cubed');

    var x = 70, y = 250, s1 = 50, s2 = 100, s3 = 150;
    /* squares */
    P.rect(x, y, s1, s1, { fill: ACCDIM, stroke: ACC, sw: 2 });
    P.text(x + s1 / 2, y + s1 + 8, '1 x 1 = 1', { size: 12, mono: true, align: 'center', color: DIM });

    var x2 = x + s1 + 40;
    if (p > 0.2) {
      P.rect(x2, y + s1 - s2, s2, s2, { fill: null, stroke: VAL, sw: 2 });
      for (var i = 0; i <= 2; i++) {
        P.line(x2 + i * s2 / 2, y + s1 - s2, x2 + i * s2 / 2, y + s1, { stroke: VAL, sw: 1, dash: [3, 3] });
        P.line(x2, y + s1 - s2 + i * s2 / 2, x2 + s2, y + s1 - s2 + i * s2 / 2, { stroke: VAL, sw: 1, dash: [3, 3] });
      }
      P.text(x2 + s2 / 2, y + s1 + 8, '2 x 2 = 4', { size: 12, mono: true, align: 'center', color: VAL });
      P.text(x2 + s2 / 2, y + s1 - s2 - 8, 'k = 2: four copies', { size: 12, align: 'center', color: VAL });
    }

    /* cubes */
    isoCube(540, 230, 40, {});
    P.text(540, 306, 'side 1, volume 1', { size: 12, mono: true, color: DIM });
    if (p > 0.4) {
      isoCube(700, 230, 80, { fill: VAL, stroke: VAL, top: '#e7f5ea', side: '#d3ecdb' });
      P.text(700, 132, 'side 2, volume 8', { size: 12, mono: true, color: VAL });
      P.text(700, 336, 'k = 2: eight copies', { size: 12, align: 'center', color: VAL });
    }

    if (p > 0.65) {
      P.rect(60, 372, 780, 70, { fill: SURF2, stroke: BORDER, radius: 8 });
      P.text(76, 388, 'k = 3', { size: 12, mono: true, color: INK });
      P.text(150, 388, 'length x 3', { size: 12, mono: true, color: INFO });
      P.text(300, 388, 'area x 9', { size: 12, mono: true, color: VAL });
      P.text(430, 388, 'volume x 27', { size: 12, mono: true, color: WARN });
      P.text(76, 416, 'a model at 1/10 scale: paint x 1/100, water x 1/1000', { size: 12, mono: true, color: DIM });
    }
  };

  /* ---------- scene 4: rolling ---------- */
  SCENE_DRAW.roll = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Bring the short edges together', 'the long edge closes into the circle');

    var u = 60, x = 50, y = 190;
    var d = sheetShape(x, y, u);
    /* the short edges, marked */
    P.line(x, y, x, y + d.h, { stroke: BAD, sw: 4 });
    P.line(x + d.w, y, x + d.w, y + d.h, { stroke: BAD, sw: 4 });
    P.text(x + d.w / 2, y + d.h + 30, 'short edges = the seam', { size: 12, align: 'center', color: BAD });
    P.text(x + d.w / 2, y - 12, '6 cm wraps round', { size: 12, align: 'center', color: INFO });

    P.arrow(x + d.w + 20, y + d.h / 2, x + d.w + 80, y + d.h / 2, { stroke: DIM, sw: 2, head: 9 });

    if (p > 0.25) {
      var cx = 700, cy = 300, r = 78, hp = 70;
      cylinderShape(cx, cy, r, hp, {});
      dim(cx - r, cy + 24, cx + r, cy + 24, 'circumference 6', { dy: 4, color: INFO });
      dim(cx + r + 18, cy, cx + r + 18, cy - hp, 'h = 1', { dx: 26, dy: 0, color: VAL });
      P.text(cx, cy + 62, 'r = 3/pi = ' + CYL.r.toFixed(3) + ' cm', { size: 13, mono: true, align: 'center', color: ACC });
    }
    if (p > 0.7) {
      P.rect(560, 60, 300, 62, { fill: SURF, stroke: ACC, radius: 8 });
      P.text(574, 74, 'paper area is unchanged', { size: 12, color: ACC, bold: true });
      P.text(574, 96, '2 pi r h = ' + CYL.lateral.toFixed(1) + ' = the sheet area', { size: 12, mono: true, color: INK });
    }
    note(50, 330, 'the 6 cm edge is the circle, the 1 cm edge is the height', DIM);
  };

  /* ---------- scene 5: the cylinder volume and the ratio ---------- */
  SCENE_DRAW.cylinder = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('A cylinder is a disc stacked', 'base area pi r squared times height');

    var cx = 210, cy = 300, r = 88, hp = 76;
    cylinderShape(cx, cy, r, hp, {});
    dim(cx - r, cy + 26, cx + r, cy + 26, '2 pi r = 6', { dy: 4, color: INFO });
    dim(cx + r + 16, cy, cx + r + 16, cy - hp, 'h = 1', { dx: 26, dy: 0, color: VAL });
    P.text(cx, 210, 'disc = pi r squared = 9/pi = ' + CYL.disc.toFixed(3), { size: 12, mono: true, align: 'center', color: ACC });

    /* the comparison bars */
    var bx = 470, by = 130, bw = 120;
    P.text(bx, by - 22, 'volume from the same 6 sq cm', { size: 12, color: DIM });
    if (p > 0.3) {
      var hc = CYL.vol * 46;
      P.rect(bx, by + 200 - hc, bw, hc, { fill: ACCDIM, stroke: ACC, sw: 1.5 });
      P.text(bx + bw / 2, by + 200 + 6, 'cylinder 9/pi', { size: 11, mono: true, align: 'center', color: ACC });
      P.text(bx + bw / 2, by + 200 - hc - 8, CYL.vol.toFixed(3), { size: 12, mono: true, align: 'center', color: ACC });
    }
    if (p > 0.55) {
      var hu = CUBE.vol * 46;
      P.rect(bx + 190, by + 200 - hu, bw, hu, { fill: SURF2, stroke: VAL, sw: 1.5 });
      P.text(bx + 190 + bw / 2, by + 200 + 6, 'cube 1', { size: 11, mono: true, align: 'center', color: VAL });
      P.text(bx + 190 + bw / 2, by + 200 - hu - 8, CUBE.vol.toFixed(3), { size: 12, mono: true, align: 'center', color: VAL });
    }
    if (p > 0.8) {
      P.text(bx, 400, 'ratio = 9/pi / 1 = ' + M.ratio.toFixed(3), { size: 14, mono: true, color: INK, bold: true });
      P.text(bx, 424, 'GATE 2021 CS Set 1, two-mark GA question', { size: 11, color: DIM });
    }
  };

  /* ---------- scene 6: six squares make a cube ---------- */
  SCENE_DRAW.cube = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Six squares make a closed cube', '6 a squared = the sheet area');

    var u = 56, x = 50, y = 200;
    var d = sheetShape(x, y, u, { grid: true, labels: true });
    for (var i = 1; i < 6; i++) P.line(x + i * u, y, x + i * u, y + d.h, { stroke: WARN, sw: 2, dash: [5, 4] });
    P.text(x + d.w / 2, y + d.h + 26, 'six 1 by 1 squares, no waste', { size: 12, align: 'center', color: WARN });

    if (p > 0.3) {
      isoCube(560, 190, 70, {});
      P.text(560, 160, 'side 1, volume 1', { size: 12, mono: true, color: VAL });
      P.text(560, 290, 'surface 6 x 1 = 6', { size: 12, mono: true, color: DIM });
    }
    if (p > 0.55) {
      P.rect(60, 330, 400, 96, { fill: SURF, stroke: BORDER, radius: 8 });
      P.text(76, 344, 'why the cylinder holds more', { size: 12, bold: true, color: INK });
      P.text(76, 366, 'cylinder: paper is only the curved side', { size: 12, mono: true, color: ACC });
      P.text(76, 388, 'cube: paper is all six faces', { size: 12, mono: true, color: VAL });
      P.text(76, 410, 'the ends are assumed closed, not paid for', { size: 11, mono: true, color: WARN });
    }
    if (p > 0.8) {
      P.text(560, 350, '2.865 against 1', { size: 14, mono: true, color: ACC, bold: true });
      P.text(560, 374, 'same 6 sq cm of paper', { size: 11, color: DIM });
    }
  };

  /* ---------- scene 7: the other way to roll ---------- */
  SCENE_DRAW.otherway = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Roll it the other way', 'the short edge becomes the circle');

    var u = 46, x = 40, y = 250;
    var d = sheetShape(x, y, u);
    P.line(x, y, x + d.w, y, { stroke: BAD, sw: 4 });
    P.line(x, y + d.h, x + d.w, y + d.h, { stroke: BAD, sw: 4 });
    P.text(x + d.w / 2, y + d.h + 26, 'long edges = the seam', { size: 12, align: 'center', color: BAD });

    if (p > 0.2) {
      cylinderShape(330, 300, 34, 150, { stroke: WARN, fill: WARNDIM });
      dim(330 - 34, 324, 330 + 34, 324, 'circ 1', { dy: 4, color: WARN });
      P.text(330, 168, 'r = 1/(2 pi) = ' + CYL2.r.toFixed(3), { size: 12, mono: true, align: 'center', color: WARN });
      P.text(330, 360, 'volume 3/(2 pi) = ' + CYL2.vol.toFixed(3), { size: 12, mono: true, align: 'center', color: WARN });
    }
    if (p > 0.45) {
      cylinderShape(520, 300, 88, 76, {});
      dim(520 - 88, 324, 520 + 88, 324, 'circ 6', { dy: 4, color: ACC });
      P.text(520, 190, 'volume 9/pi = ' + CYL.vol.toFixed(3), { size: 12, mono: true, align: 'center', color: ACC });
    }
    if (p > 0.7) {
      P.rect(620, 96, 250, 120, { fill: SURF, stroke: BORDER, radius: 8 });
      P.text(634, 110, 'same paper, same area', { size: 12, bold: true, color: INK });
      P.text(634, 134, '9/pi = ' + CYL.vol.toFixed(3), { size: 12, mono: true, color: ACC });
      P.text(634, 156, '3/(2 pi) = ' + CYL2.vol.toFixed(3), { size: 12, mono: true, color: WARN });
      P.text(634, 180, 'ratio exactly 6', { size: 12, mono: true, color: INK });
      P.text(634, 202, 'the phrase fixes the mapping', { size: 11, color: DIM });
    }
  };

  /* ---------- scene 8: triangles ---------- */
  SCENE_DRAW.triangle = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Half base times height', 'the height belongs to the base you chose');

    /* first triangle: base 4, height 3 */
    var ox = 90, oy = 300, k = 46;
    P.tri(ox, oy, ox + 4 * k, oy, ox, oy - 3 * k, { fill: ACCDIM, stroke: ACC, sw: 2 });
    P.line(ox, oy - 3 * k, ox, oy, { stroke: DIM, sw: 1, dash: [4, 3] });
    dim(ox, oy + 22, ox + 4 * k, oy + 22, 'base 4', { dy: 4 });
    dim(ox - 18, oy, ox - 18, oy - 3 * k, 'h 3', { dx: -16, dy: 0 });
    P.text(ox + 2 * k, oy - 24, 'area 6', { size: 13, mono: true, align: 'center', color: ACC, bold: true });

    if (p > 0.28) {
      /* the same triangle on base 5: scale so the hypotenuse is 5 units */
      var k2 = 44, ox2 = 350, oy2 = 300;
      var A = { x: ox2, y: oy2 };
      var B = { x: ox2 + 5 * k2 * 0.8, y: oy2 };
      var C = { x: ox2, y: oy2 - 5 * k2 * 0.6 };
      P.tri(A.x, A.y, B.x, B.y, C.x, C.y, { fill: null, stroke: INFO, sw: 2 });
      dim(A.x, A.y + 22, B.x, A.y + 22, 'base 5', { dy: 4, color: INFO });
      P.line(A.x + 2, A.y - 2, A.x + 2, A.y - 2, { stroke: INFO });
      P.text(A.x + 6, A.y - 3 * k2 * 0.6 - 4, 'height 12/5 = 2.4', { size: 12, mono: true, color: INFO });
      P.text((A.x + B.x) / 2, A.y - 3 * k2 * 0.6 - 26, 'area still 6', { size: 13, mono: true, align: 'center', color: INFO, bold: true });
    }

    if (p > 0.55) {
      var k3 = 22, ox3 = 660, oy3 = 300;
      P.tri(ox3, oy3, ox3 + 8 * k3, oy3, ox3, oy3 - 6 * k3, { fill: null, stroke: VAL, sw: 2 });
      P.text(ox3 + 4 * k3, oy3 + 8, 'base 8', { size: 11, mono: true, align: 'center', color: VAL });
      P.text(652, 232, 'h 6', { size: 11, mono: true, align: 'right', color: VAL });
      P.text(ox3 + 4 * k3, 158, 'area 24', { size: 12, mono: true, align: 'center', color: VAL, bold: true });
      P.text(ox3 + 4 * k3, 176, 'the 3-4-5 doubled', { size: 11, mono: true, align: 'center', color: DIM });
    }
    if (p > 0.8) {
      P.text(600, 434, 'similar: areas x k squared, volumes x k cubed', { size: 11, color: DIM });
    }
  };

  /* ---------- scene 9: the step curve ---------- */
  SCENE_DRAW.step = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('Area under a flat-topped curve', 'three rectangles, widths 1/3, 5/12, 1/4');

    var ox = 90, oy = 340, wpx = 660, hpx = 220;
    /* axes */
    P.line(ox, oy, ox + wpx, oy, { stroke: INK, sw: 1.5 });
    P.line(ox, oy, ox, oy - hpx - 20, { stroke: INK, sw: 1.5 });
    P.text(ox + wpx + 8, oy - 8, 'x', { size: 12, mono: true, color: DIM });
    P.text(ox - 14, oy - hpx - 22, 'y', { size: 12, mono: true, color: DIM });

    var xs = STEP.x.map(function (v) { return ox + v * wpx; });
    var hs = STEP.h.map(function (v) { return v * 60; });

    for (var i = 0; i < 3; i++) {
      if (p < 0.1 + i * 0.18) continue;
      P.alpha(Math.min(1, (p - (0.1 + i * 0.18)) / 0.08));
      P.rect(xs[i], oy - hs[i], xs[i + 1] - xs[i], hs[i],
        { fill: i === 1 ? '#e7f5ea' : ACCDIM, stroke: i === 1 ? VAL : ACC, sw: 1.5 });
      P.text((xs[i] + xs[i + 1]) / 2, oy - hs[i] / 2, 'h ' + STEP.h[i], { size: 12, mono: true, align: 'center', base: 'middle', color: i === 1 ? VAL : ACC });
      P.alpha(1);
    }
    /* width ticks */
    [0, 1 / 3, 3 / 4, 1].forEach(function (v, i) {
      var xx = ox + v * wpx;
      P.line(xx, oy, xx, oy + 6, { stroke: INK, sw: 1.5 });
      var lab = ['0', '1/3', '3/4', '1'][i];
      P.text(xx, oy + 12, lab, { size: 11, mono: true, align: 'center', color: DIM });
    });
    if (p > 0.6) {
      P.text(ox, 60, '2/3 + 5/4 + 1/4 = 13/6 = ' + STEP.sum.toFixed(4), { size: 14, mono: true, color: INK, bold: true });
      P.text(ox, 84, 'widths: 1/3, 5/12, 1/4 (they add to 1)', { size: 12, mono: true, color: DIM });
    }
    if (p > 0.85) {
      P.text(ox, 420, 'GATE 2022 CS, GA Q2, one mark, key C', { size: 11, color: DIM });
    }
  };

  /* ---------- scene 10: the best shape ---------- */
  SCENE_DRAW.best = function (t, sc) {
    var p = (t - sc.start) / (sc.end - sc.start);
    head('When the material is fixed', 'enumerate the few cases, or quote the optimum with its condition');

    var ox = 80, oy = 300, bw = 90;
    P.text(ox, 70, 'perimeter 12: 2(a + b) = 12', { size: 12, mono: true, color: DIM });
    M.rect12.all.forEach(function (r, i) {
      if (p < 0.1 + i * 0.15) return;
      P.alpha(Math.min(1, (p - (0.1 + i * 0.15)) / 0.08));
      var h = r.area * 22;
      P.rect(ox + i * (bw + 30), oy - h, bw, h, { fill: r.area === 9 ? '#e7f5ea' : ACCDIM, stroke: r.area === 9 ? VAL : ACC, sw: 1.5 });
      P.text(ox + i * (bw + 30) + bw / 2, oy + 8, r.a + ' by ' + r.b, { size: 12, mono: true, align: 'center', color: DIM });
      P.text(ox + i * (bw + 30) + bw / 2, oy - h - 8, String(r.area), { size: 13, mono: true, align: 'center', color: r.area === 9 ? VAL : ACC, bold: true });
      P.alpha(1);
    });

    if (p > 0.55) {
      P.text(500, 70, 'surface 6: closed shapes', { size: 12, mono: true, color: DIM });
      isoCube(520, 210, 60, {});
      P.text(520, 300, 'cube: 1', { size: 12, mono: true, color: VAL });
      ell(700, 250, 50, 50, { stroke: WARN, sw: 2, fill: WARNDIM });
      P.text(700, 250, 'sphere', { size: 12, mono: true, align: 'center', base: 'middle', color: WARN });
      P.text(650, 320, 'sphere: ' + M.sphereFrom6.vol.toFixed(3), { size: 12, mono: true, color: WARN });
    }
    if (p > 0.8) {
      P.text(80, 380, 'the square wins for a fixed fence; the sphere wins for a fixed surface', { size: 12, color: INK });
      P.text(80, 404, 'both statements need their condition: rectangles only, closed shapes only', { size: 11, color: DIM });
    }
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt ? K.sceneAt(t) : 0;
    var sc = window.LESSON_TIMELINE.scenes[i];
    if (!sc) return;
    var fn = SCENE_DRAW[sc.id];
    if (fn) {
      try { fn(t, sc); }
      catch (e) { P.text(24, 240, 'draw error: ' + e.message, { size: 12, color: BAD }); }
    }
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.filter(function (c) { return !c.pass; });
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:4px 0 0">' + (CHECKS.length - bad.length) + ' of ' + CHECKS.length +
      ' passed' + (bad.length ? ' \u2014 ' + bad.map(function (c) { return c.name; }).join('; ') : '') + '</p>';
  }

  function boot() {
    fillChecks();
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.createCanvas === 'function' && PR) {
      try {
        var sk = new window.p5(function (s) {
          s.setup = function () {
            var c = s.createCanvas(W, H);
            if (c && c.parent) c.parent(holder);
            s.pixelDensity(1);
            s.noLoop();
            P = PR.makePainterP5(s, W, H);
            drawFrame(K.state.elapsed);
          };
          s.draw = function () { drawFrame(K.state.elapsed); };
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
          drawFrame(0);
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
        draw: function () { if (P) drawFrame(K.state.elapsed); }
      });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(t);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
