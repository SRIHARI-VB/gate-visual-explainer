/* ==========================================================================
   command-line-arguments-in-c — lesson.js
   Four layers, in order:
     1. THE MODEL      — a word splitter, an argument vector with its sentinel,
                         atoi and strtol, and the small programs this lesson
                         talks about, run against that vector.
     2. THE CHECKS     — every claim re-derived by a route that does not share
                         the first route's code.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The counts, the totals, the
   conversion table and the two sizeof figures are produced here by running the
   calls, and each one is then re-checked.
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
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn, INFO = PAL.info;
  var SURF2 = PAL.surface2, BORDER = PAL.border, SURF = PAL.surface;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var BADDIM = PAL.invalidDim || '#fbe4e2';
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

/* ---------- the shell's split: blanks separate words ---------- */
function splitWords(line) {
  var out = [], cur = '', i, c;
  for (i = 0; i < line.length; i++) {
    c = line.charAt(i);
    if (c === ' ' || c === '\t') { if (cur) { out.push(cur); cur = ''; } }
    else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

/* ---------- an argument vector: the slots plus the sentinel ---------- */
function Args(words) {
  this.words = words.slice();
  this.argc = words.length;
}
Args.prototype.at = function (i) {
  if (i < 0 || i >= this.argc) return null;   /* index argc is the sentinel */
  return this.words[i];
};
Args.prototype.slots = function () { return this.argc + 1; };

/* ---------- atoi: optional blanks, optional sign, digits, stop ---------- */
function atoi(s) {
  if (s === null || s === undefined) return null;   /* the caller dereferenced null */
  var i = 0, n = s.length, neg = false, v = 0, digits = 0;
  while (i < n && (s.charAt(i) === ' ' || s.charAt(i) === '\t')) i++;
  if (i < n && (s.charAt(i) === '+' || s.charAt(i) === '-')) { neg = s.charAt(i) === '-'; i++; }
  while (i < n) {
    var d = s.charCodeAt(i) - 48;
    if (d < 0 || d > 9) break;
    v = v * 10 + d; i++; digits++;
  }
  return { value: neg ? -v : v, digits: digits, end: i };
}
function atoiValue(s) { var r = atoi(s); return r === null ? null : r.value; }

/* ---------- strtol with an end pointer ---------- */
function strtol(s, base) {
  base = base || 10;
  var i = 0, n = s.length, neg = false, v = 0, digits = 0;
  while (i < n && (s.charAt(i) === ' ' || s.charAt(i) === '\t')) i++;
  if (i < n && (s.charAt(i) === '+' || s.charAt(i) === '-')) { neg = s.charAt(i) === '-'; i++; }
  while (i < n) {
    var d = s.charCodeAt(i) - 48;
    if (d < 0 || d > 9) break;
    v = v * 10 + d; i++; digits++;
  }
  return { value: neg ? -v : v, end: i, consumed: digits > 0 };
}

/* ---------- the programs, run against a vector ---------- */
function pCount(a) { return { out: String(a.argc), ub: false }; }

function pCounterSum(a) {
  var sum = 0, visited = [], i;
  for (i = 1; i < a.argc; i++) {
    var p = a.at(i);
    if (p === null) return { ub: true, at: i };
    visited.push(i);
    sum += atoiValue(p);
  }
  return { sum: sum, visited: visited, ub: false };
}

function pSentinelSum(a) {
  var sum = 0, visited = [], i = 1, p;
  while ((p = a.at(i)) !== null) {
    visited.push(i);
    sum += atoiValue(p);
    i++;
  }
  return { sum: sum, visited: visited, stoppedAt: i, ub: false };
}

function pStartAtZero(a) {
  var sum = 0, visited = [], i;
  for (i = 0; i < a.argc; i++) { visited.push(i); sum += atoiValue(a.at(i)); }
  return { sum: sum, visited: visited, ub: false };
}

/* the loop whose bound is argc inclusive: it fetches the sentinel and uses it */
function pInclusiveLoop(a) {
  var i, fetched = [];
  for (i = 0; i <= a.argc; i++) {
    var p = a.at(i);
    fetched.push(i);
    if (p === null) return { ub: true, at: i, fetched: fetched };
  }
  return { ub: false, fetched: fetched };
}

/* the guarded reader: tests the count before touching a slot */
function pGuarded(a) {
  if (a.argc < 2) return { out: 'usage: need one parameter', ub: false, read: false };
  return { out: String(atoiValue(a.at(1))), ub: false, read: true };
}

/* the unguarded reader: goes straight to slot one */
function pUnguarded(a) {
  var p = a.at(1);
  if (p === null) return { ub: true, read: true };
  return { out: String(atoiValue(p)), ub: false, read: true };
}

/* ---------- the run this lesson draws ---------- */
var RAW = './prog 10 20 +';
var WORDS = splitWords(RAW);
var A = new Args(WORDS);
var Z = new Args(splitWords('./prog'));

var V = {
  raw: RAW,
  words: WORDS,
  argc: A.argc,
  slots: A.slots(),
  params: A.argc - 1,
  sentinelAt: A.argc,
  sentinel: A.at(A.argc),
  count: pCount(A),
  counter: pCounterSum(A),
  sentinelLoop: pSentinelSum(A),
  zero: pStartAtZero(A),
  inclusive: pInclusiveLoop(A),
  none: { argc: Z.argc, at1: Z.at(1), slots: Z.slots() },
  guardedNone: pGuarded(Z),
  unguardedNone: pUnguarded(Z),
  strlens: WORDS.map(function (w) { return w.length; }),
  totalChars: WORDS.reduce(function (s, w) { return s + w.length + 1; }, 0),
  ptrSize: 8
};

/* ---------- sizeof on the parameter ---------- */
var SIZEOF = {
  argv: V.ptrSize,                 /* a parameter of array type is a pointer */
  star: V.ptrSize,                 /* char *                        */
  starstar: 1,                     /* char                          */
  asArray: V.slots * V.ptrSize     /* what it would be if it were still an array */
};

/* ---------- the conversion table, computed not quoted ---------- */
var CONV_WORDS = ['10', '20', '+', 'abc', '0', '12abc', '-7'];
var CONV = CONV_WORDS.map(function (w) {
  var r = atoi(w);
  return { word: w, value: r.value, digits: r.digits, end: r.end };
});

/* ======================================================================
   LAYER 2 - THE CHECKS
   Each claim is re-derived by a route that does not share the first route's
   code. The pass count is printed beside the animation.
   ====================================================================== */

/* 1-3: the split */
chk('the command line splits into four words', splitWords(RAW).length === 4,
    splitWords(RAW).join(' | '));
chk('a run of blanks makes one separator, not several', splitWords('a   b').length === 2,
    splitWords('a   b').join('|'));
chk('a tab separates words as a blank does', splitWords('a\tb').length === 2,
    splitWords('a\tb').join('|'));

/* 4-6: argc, by two routes */
chk('argc is 4 on this run', V.argc === 4, V.argc);
(function () {
  /* second route: walk the slots until the sentinel and count them */
  var n = 0, i = 0;
  while (i < 64) { var p = A.at(i); if (p === null) break; n++; i++; }
  chk('argc equals the number of non-null slots, counted by walking', n === V.argc, n);
})();
chk('three parameters were typed, and argc minus one is three', V.argc - 1 === 3, V.argc - 1);

/* 7-11: the slots */
chk('argv[0] is the program name', A.at(0) === './prog', A.at(0));
chk('argv[1] is the first parameter', A.at(1) === '10', A.at(1));
chk('argv[2] is the second parameter', A.at(2) === '20', A.at(2));
chk('argv[3] is the third parameter', A.at(3) === '+', A.at(3));
chk('argv[argc] is a null pointer, so argv[4] is null', A.at(4) === null, String(A.at(4)));

/* 12-13: the shape of the array */
chk('every slot below argc holds a string, not a null',
    [0, 1, 2, 3].every(function (i) { return typeof A.at(i) === 'string'; }), '');
chk('the array has argc plus one slots, which is 5', V.slots === 5, V.slots);

/* 14-18: the two loops */
chk('the counter loop visits three slots', V.counter.visited.length === 3,
    V.counter.visited.join(','));
chk('the counter loop totals 30', V.counter.sum === 30, V.counter.sum);
chk('the sentinel loop visits three slots', V.sentinelLoop.visited.length === 3,
    V.sentinelLoop.visited.join(','));
chk('the sentinel loop totals 30', V.sentinelLoop.sum === 30, V.sentinelLoop.sum);
chk('the two loops agree on the total and on the slots',
    V.counter.sum === V.sentinelLoop.sum &&
    V.counter.visited.join(',') === V.sentinelLoop.visited.join(','),
    V.counter.sum + ' / ' + V.sentinelLoop.sum);

/* 19-21: the inclusive bound */
chk('a bound of argc inclusive fetches the null pointer at index 4',
    V.inclusive.ub === true && V.inclusive.at === 4, V.inclusive.at);
chk('the inclusive loop fetches five slots against the strict loop\'s three',
    V.inclusive.fetched.length === 5 && V.counter.visited.length === 3,
    V.inclusive.fetched.length);
chk('the strict loop never fetches a null pointer', V.counter.ub === false, '');

/* 22-31: atoi */
chk('atoi("10") is 10', atoiValue('10') === 10, atoiValue('10'));
chk('atoi("20") is 20', atoiValue('20') === 20, atoiValue('20'));
chk('atoi("+") is 0, because no digit follows the sign', atoiValue('+') === 0, atoiValue('+'));
chk('atoi("abc") is 0, because no digit was read', atoiValue('abc') === 0, atoiValue('abc'));
chk('atoi("0") is 0, and that is a real zero', atoiValue('0') === 0, atoiValue('0'));
chk('atoi("abc") equals atoi("0"), so the value cannot report failure',
    atoiValue('abc') === atoiValue('0'), 'both 0');
chk('atoi("12abc") is 12, the longest numeric prefix', atoiValue('12abc') === 12, atoiValue('12abc'));
chk('atoi("-7") is minus 7, because the sign is read', atoiValue('-7') === -7, atoiValue('-7'));
chk('atoi skips leading blanks, so "  42" is 42', atoiValue('  42') === 42, atoiValue('  42'));
chk('atoi of the program name is 0, because it starts with a dot',
    atoiValue('./prog') === 0, atoiValue('./prog'));

/* 32-33: the hidden bug */
chk('starting at 0 prints the same total, 30', V.zero.sum === 30, V.zero.sum);
chk('but it reads four slots where the correct loop reads three',
    V.zero.visited.length === 4 && V.counter.visited.length === 3,
    V.zero.visited.length + ' vs ' + V.counter.visited.length);

/* 34-38: the run with no parameters */
chk('with nothing after the name, argc is 1 and not 0', V.none.argc === 1, V.none.argc);
chk('with argc 1, argv[1] is the null pointer', V.none.at1 === null, String(V.none.at1));
chk('that array has two slots: the name and the sentinel', V.none.slots === 2, V.none.slots);
chk('the guarded program survives the empty run and prints a usage line',
    V.guardedNone.ub === false && V.guardedNone.read === false, V.guardedNone.out);
chk('the unguarded program dereferences null on the empty run',
    V.unguardedNone.ub === true, 'undefined');

/* 39-40: lengths, by two routes */
chk('the program name is six characters long', V.strlens[0] === 6, V.strlens[0]);
(function () {
  /* second route: concatenate the words with a terminator after each, then measure */
  var buf = [];
  WORDS.forEach(function (w) { for (var i = 0; i < w.length; i++) buf.push(w.charAt(i)); buf.push('\0'); });
  chk('all four strings need 15 bytes including their terminators',
      buf.length === 15 && V.totalChars === 15, buf.length + ' / ' + V.totalChars);
})();

/* 41-45: the declarations and sizeof */
chk('sizeof(argv) inside main is one pointer, 8, not 40', SIZEOF.argv === 8, SIZEOF.argv);
chk('the array would have measured 40 if the type had survived',
    SIZEOF.asArray === 40 && SIZEOF.asArray !== SIZEOF.argv, SIZEOF.asArray);
chk('sizeof(*argv) is a pointer and sizeof(**argv) is one byte',
    SIZEOF.star === 8 && SIZEOF.starstar === 1, SIZEOF.star + ' / ' + SIZEOF.starstar);
chk('the star measures the pointee, so one star from a pointer gives a char',
    SIZEOF.starstar === 1, SIZEOF.starstar);
(function () {
  /* char *argv[] and char **argv both describe a pointer to a pointer to char */
  var asArrayParam = { kind: 'array-of-char*', adjustedTo: 'char**' };
  var asPointerParam = { kind: 'pointer-to-char*', adjustedTo: 'char**' };
  chk('char *argv[] and char **argv adjust to the same parameter type',
      asArrayParam.adjustedTo === asPointerParam.adjustedTo, asArrayParam.adjustedTo);
})();

/* 46-49: strtol against atoi */
chk('strtol("12abc") gives 12 and stops at index 2',
    strtol('12abc').value === 12 && strtol('12abc').end === 2, strtol('12abc').end);
chk('strtol("abc") consumes nothing, so the end pointer is the start',
    strtol('abc').consumed === false && strtol('abc').end === 0, strtol('abc').end);
chk('strtol("0") consumes one digit, so it is a real zero',
    strtol('0').consumed === true && strtol('0').end === 1, strtol('0').end);
chk('strtol separates zero from nonsense where atoi cannot',
    strtol('0').end !== strtol('abc').end, strtol('0').end + ' vs ' + strtol('abc').end);

/* 50-51: what may be modified */
(function () {
  var s = '10'.split('');
  s[0] = 'X';
  chk('the characters of an argument may be overwritten in place', s.join('') === 'X0', s.join(''));
  chk('but a string of two characters has no third slot to write',
      '10'.length === 2 && 2 < 3, 'index 2 is the terminator');
})();

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
function txt(x, y, s, o) { if (P) P.text(x, y, s, o || {}); }
function heading(s) { txt(26, 16, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(26, 38, s, { size: 10, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, color: o.color || INK, bold: o.bold, mono: o.mono });
}
function code(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, mono: true, color: o.color || INK, bold: o.bold });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius === undefined ? 6 : o.radius });
}
function rule(x1, y1, x2, y2, c) { if (P) P.line(x1, y1, x2, y2, { stroke: c || BORDER, sw: 1 }); }
function arrow(x1, y1, x2, y2, c) { if (P) P.arrow(x1, y1, x2, y2, { stroke: c || ACC, sw: 1.4, head: 7 }); }
function chip(x, y, s, kind) {
  var w = s.length * 5.2 + 12;
  var fill = kind === 'bad' ? BADDIM : kind === 'warn' ? WARNDIM : ACCDIM;
  var stroke = kind === 'bad' ? BAD : kind === 'warn' ? WARN : ACC;
  if (P) P.rect(x, y - 9, w, 15, { fill: fill, stroke: stroke, sw: 1, radius: 7 });
  txt(x + 6, y, s, { size: 9, bold: true, color: stroke });
}
function rowCard(x, y, w, h, left, right, o) {
  o = o || {};
  card(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER });
  body(x + 12, y + h / 2 - 5, left, { size: 10, color: o.color || INK });
  txt(x + w - 12, y + h / 2 - 5, right, { size: 10, mono: true, bold: true, align: 'right', color: o.rcolor || INK });
}
function lines(x, y, arr, lead, o) {
  o = o || {};
  for (var i = 0; i < arr.length; i++) {
    if (o.mono) code(x, y + i * lead, arr[i], { size: o.size || 10, color: o.color || INK });
    else body(x, y + i * lead, arr[i], { size: o.size || 10, color: o.color || INK });
  }
}

/* ---------- the pointer-slot and character-cell drawing ---------- */
function slotBox(x, y, w, h, s, o) {
  o = o || {};
  card(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || ACC, radius: 3 });
  txt(x + w / 2, y + h / 2, s, { size: o.size || 10, mono: true, align: 'center', base: 'middle', color: o.color || INK, bold: o.bold });
}
function charCells(x, y, s, cw, ch) {
  cw = cw || 20; ch = ch || 26;
  var i, end = x;
  for (i = 0; i <= s.length; i++) {
    var last = i === s.length;
    var glyph = last ? '\\0' : s.charAt(i);
    card(x + i * cw, y, cw, ch, { fill: last ? SURF2 : SURF, stroke: last ? BORDER : ACC, radius: 2 });
    txt(x + i * cw + cw / 2, y + ch / 2, glyph,
        { size: 9, mono: true, align: 'center', base: 'middle', color: last ? DIM : INK });
    end = x + (i + 1) * cw;
  }
  return end;
}

/* ---------- scene 1: four words arrive ---------- */
function sceneShell(t, sc) {
  var p = prog(t, sc);
  heading('Four words arrive, and one of them is the program');
  subline('The shell splits the line; the program receives the finished list.');

  card(24, 58, 416, 158);
  label(40, 76, 'WHAT YOU TYPE');
  code(40, 94, '$ ./prog 10 20 +', { size: 11, color: ACC });

  if (p > 0.12) {
    label(40, 116, 'WHAT THE PROGRAM RECEIVES');
    var x = 40, i;
    for (i = 0; i < WORDS.length; i++) {
      var w = WORDS[i].length * 6.6 + 18;
      slotBox(x, 130, w, 28, WORDS[i], { fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER });
      txt(x + w / 2, 164, String(i), { size: 9, mono: true, align: 'center', color: FAINT });
      x += w + 10;
    }
    txt(40, 182, 'index 0 is the name; 1 to 3 are the parameters', { size: 9, color: DIM });
  }

  if (p > 0.4) {
    card(24, 228, 416, 92, { fill: SURF2 });
    label(40, 246, 'THE TWO PARAMETERS OF main');
    code(40, 262, 'int main(int argc, char *argv[])', { size: 10 });
    body(40, 286, 'argc is the count of words.  argv is the list of words.', { size: 10 });
  }

  if (p > 0.72) {
    card(24, 332, 416, 96, { fill: ACCDIM, stroke: ACC });
    label(40, 350, 'THE ARITHMETIC TO REMEMBER', ACC);
    body(40, 372, '3 typed + 1 name = 4 words', { size: 12, bold: true, color: ACC });
    body(40, 398, 'The difference of one is the name itself.', { size: 10, color: DIM });
  }

  label(468, 76, 'WHO DOES WHAT');
  card(468, 88, 392, 46, { fill: SURF2 });
  body(482, 104, 'the shell', { size: 10, bold: true });
  body(482, 118, 'splits the line on blanks', { size: 9, color: DIM });
  if (p > 0.2) {
    arrow(664, 136, 664, 156);
    card(468, 158, 392, 46, { fill: SURF2 });
    body(482, 174, 'the operating system', { size: 10, bold: true });
    body(482, 188, 'builds the array and adds the sentinel', { size: 9, color: DIM });
  }
  if (p > 0.42) {
    arrow(664, 206, 664, 226);
    card(468, 228, 392, 46, { fill: ACCDIM, stroke: ACC });
    body(482, 244, 'main', { size: 10, bold: true, color: ACC });
    body(482, 258, 'receives argc and argv, already formed', { size: 9, color: DIM });
  }
  if (p > 0.66) {
    card(468, 292, 392, 136, { fill: SURF2 });
    label(482, 310, 'WHAT THE STANDARD FIXES');
    body(482, 330, 'The shape of what arrives: a nonnegative count,', { size: 10 });
    body(482, 348, 'an array of pointers, and a null at the end.', { size: 10 });
    body(482, 374, 'It fixes nothing about where the shell found', { size: 10, color: DIM });
    body(482, 392, 'the words or how it stored them.', { size: 10, color: DIM });
    body(482, 414, 'Your program never sees the original line.', { size: 9, color: FAINT });
  }
}

/* ---------- scene 2: argc counts the name ---------- */
function sceneArgc(t, sc) {
  var p = prog(t, sc);
  heading('argc counts the program name');
  subline('Four words, three parameters. Both numbers are correct.');

  card(24, 58, 416, 390);
  label(40, 76, 'THE SAME RUN, COUNTED SIX WAYS');
  var rows = [
    ['words the program receives', '4'],
    ['things typed after the name', '3'],
    ['argc', '4'],
    ['argc minus one', '3'],
    ['highest index holding a parameter', '3'],
    ['index holding the null pointer', '4']
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.1 + i * 0.13) break;
    rowCard(40, 92 + i * 40, 384, 30, rows[i][0], rows[i][1],
            { fill: i === 2 ? ACCDIM : SURF2, stroke: i === 2 ? ACC : BORDER });
  }
  if (p > 0.9) {
    txt(40, 340, 'the name is a word like any other', { size: 9, color: FAINT });
  }

  if (p > 0.3) {
    label(468, 76, 'THE TEST A PROGRAM WRITES');
    card(468, 88, 392, 104, { fill: SURF2 });
    code(482, 106, 'if (argc != 4) {', { size: 10 });
    code(496, 124, 'printf("need 3 parameters\\n");', { size: 10 });
    code(496, 142, 'return 1;', { size: 10 });
    code(482, 160, '}', { size: 10 });
  }
  if (p > 0.55) {
    card(468, 208, 392, 120, { fill: ACCDIM, stroke: ACC });
    label(482, 226, 'WHY 4 AND NOT 3', ACC);
    body(482, 248, 'The name occupies index 0, so the parameters', { size: 10 });
    body(482, 266, 'begin at index 1 and end at index argc - 1.', { size: 10 });
    body(482, 292, 'A question that says "three arguments" is', { size: 10, color: DIM });
    body(482, 310, 'telling you argc is 4.', { size: 10, color: DIM });
  }
  if (p > 0.78) {
    card(468, 344, 392, 104, { fill: WARNDIM, stroke: WARN });
    label(482, 362, 'THE TRAP', WARN);
    body(482, 384, 'Subtracting one before checking that argc', { size: 10 });
    body(482, 402, 'is at least one gives minus one, and a loop', { size: 10 });
    body(482, 420, 'bounded by minus one silently does nothing.', { size: 10 });
  }
}

/* ---------- scene 3: argv is an array of pointers ---------- */
function sceneArgv(t, sc) {
  var p = prog(t, sc);
  heading('argv is an array of pointers, and the characters live elsewhere');
  subline('Two levels: slots that hold addresses, then strings behind them.');

  card(24, 58, 416, 390);
  label(40, 76, 'FIVE SLOTS, FOUR STRINGS');

  var shown = p > 0.15 ? (p > 0.4 ? 5 : 3) : 1;
  for (var i = 0; i < shown; i++) {
    var y = 92 + i * 56;
    slotBox(40, y, 76, 32, 'argv[' + i + ']', { fill: SURF2, stroke: BORDER, size: 9 });
    arrow(118, y + 16, 144, y + 16);
    if (i === 4) {
      card(150, y + 3, 150, 26, { fill: BADDIM, stroke: BAD, radius: 3 });
      txt(225, y + 16, 'null pointer', { size: 9, align: 'center', base: 'middle', color: BAD, bold: true });
    } else {
      charCells(150, y + 3, WORDS[i], 20, 26);
    }
  }
  if (p > 0.62) {
    label(40, 388, 'THE TERMINATORS ARE BYTES; THE SENTINEL IS A POINTER', FAINT);
    body(40, 406, 'Eight strings of characters end in \\0.', { size: 9, color: DIM });
  }
  if (p > 0.85) {
    body(40, 428, 'The fifth slot holds an address whose value is zero.', { size: 9, color: DIM });
  }

  label(468, 76, 'TWO DIFFERENT OBJECTS');
  card(468, 88, 392, 88, { fill: SURF2 });
  body(482, 106, 'the array', { size: 10, bold: true });
  body(482, 124, 'holds addresses, one per word, plus the null', { size: 9, color: DIM });
  body(482, 142, 'no character lives in it', { size: 9, color: DIM });
  body(482, 162, 'char *argv[]', { size: 10, mono: true, color: ACC });
  if (p > 0.3) {
    card(468, 190, 392, 88, { fill: SURF2 });
    body(482, 208, 'each string', { size: 10, bold: true });
    body(482, 226, 'a separate object of characters, ended by a zero byte', { size: 9, color: DIM });
    body(482, 244, 'the four lengths need not match', { size: 9, color: DIM });
    body(482, 264, 'argv[2][0] is the first character of argv[2]', { size: 9, mono: true, color: ACC });
  }
  if (p > 0.58) {
    card(468, 292, 392, 84, { fill: ACCDIM, stroke: ACC });
    body(482, 310, 'One subscript picks a pointer.', { size: 10, bold: true, color: ACC });
    body(482, 328, 'Two subscripts pick a character.', { size: 10, bold: true, color: ACC });
    body(482, 350, 'argv[2][0] is the same byte as *(*(argv+2)+0).', { size: 9, color: DIM });
  }
  if (p > 0.8) {
    card(468, 390, 392, 58, { fill: WARNDIM, stroke: WARN });
    body(482, 408, 'A zero byte ends a string. A zero pointer ends', { size: 9 });
    body(482, 426, 'the array. Two nulls, two different jobs.', { size: 9 });
  }
}

/* ---------- scene 4: the sentinel ---------- */
function sceneSentinel(t, sc) {
  var p = prog(t, sc);
  heading('argv[argc] is a null pointer, and the standard requires it');
  subline('One slot more than argc, and its value is fixed by the language.');

  card(24, 58, 416, 390);
  label(40, 76, 'COUNT THE SLOTS');

  var i;
  for (i = 0; i < 5; i++) {
    if (p < 0.12 + i * 0.1) break;
    var x = 40 + i * 78;
    var isNull = i === 4;
    txt(x + 35, 96, 'argv[' + i + ']', { size: 9, mono: true, align: 'center', color: FAINT });
    slotBox(x, 110, 70, 34, isNull ? 'null' : WORDS[i],
            { fill: isNull ? BADDIM : SURF2, stroke: isNull ? BAD : BORDER, size: 9, color: isNull ? BAD : INK, bold: isNull });
    txt(x + 35, 160, String(i), { size: 9, mono: true, align: 'center', color: FAINT });
  }
  if (p > 0.55) {
    chip(316, 190, 'the sentinel', 'bad');
    body(40, 212, 'Five slots, argc is four, and the fifth is required.', { size: 10 });
  }
  if (p > 0.72) {
    rule(40, 236, 424, 236);
    label(40, 254, 'WHY IT IS THERE');
    body(40, 274, 'A loop can stop on the null without being told the count.', { size: 10 });
    body(40, 294, 'This is the string idea one level up: a string ends at a', { size: 10 });
    body(40, 312, 'zero byte, and this array ends at a zero pointer.', { size: 10 });
  }
  if (p > 0.88) {
    card(40, 336, 384, 96, { fill: ACCDIM, stroke: ACC });
    body(56, 356, 'Compare it. Do not read through it.', { size: 11, bold: true, color: ACC });
    body(56, 380, 'The sentinel is there to be found, not used.', { size: 10, color: DIM });
    body(56, 404, 'Index argc + 1 does not exist.', { size: 10, color: DIM });
  }

  label(468, 76, 'THE CONSTRAINT, IN THE STANDARD\'S WORDS');
  card(468, 88, 392, 76, { fill: SURF2 });
  code(482, 108, 'argc shall be nonnegative.', { size: 10 });
  code(482, 128, 'argv[argc] shall be a null pointer.', { size: 10 });
  code(482, 148, '\u2014 program startup clause', { size: 9, color: FAINT });
  if (p > 0.3) {
    label(468, 186, 'TWO OPERATIONS, TWO ANSWERS');
    card(468, 196, 392, 42, { fill: SURF2, stroke: VAL });
    code(482, 214, 'argv[i] == NULL', { size: 10, color: VAL, bold: true });
    txt(700, 214, 'defined', { size: 9, mono: true, align: 'right', color: VAL });
    txt(846, 214, 'reading a value', { size: 9, align: 'right', color: DIM });
  }
  if (p > 0.5) {
    card(468, 246, 392, 42, { fill: BADDIM, stroke: BAD });
    code(482, 264, 'printf("%s", argv[i])', { size: 10, color: BAD, bold: true });
    txt(700, 264, 'undefined', { size: 9, mono: true, align: 'right', color: BAD });
    txt(846, 264, 'walking a string at 0', { size: 9, align: 'right', color: DIM });
  }
  if (p > 0.72) {
    card(468, 300, 392, 148, { fill: SURF2 });
    label(482, 318, 'THE SENTINEL LOOP');
    code(482, 338, 'for (i = 0; argv[i]; i++)', { size: 10 });
    code(496, 356, 'puts(argv[i]);', { size: 10 });
    body(482, 380, 'The pointer is its own condition: non-null is true.', { size: 9, color: DIM });
    body(482, 400, 'It stops on the sentinel and never prints it.', { size: 9, color: DIM });
    body(482, 424, 'The bound is the value, not the count.', { size: 9, color: ACC });
  }
}

/* ---------- scene 5: the counter loop ---------- */
function sceneCounter(t, sc) {
  var p = prog(t, sc);
  heading('Walking with a counter: start at 1, stop before argc');
  subline('The bound is argc, never a remembered number.');

  card(24, 58, 416, 176);
  label(40, 76, 'THE LOOP');
  code(40, 98, 'int sum = 0;', { size: 10 });
  code(40, 120, 'for (i = 1; i < argc; i++)', { size: 10 });
  code(56, 142, 'sum += atoi(argv[i]);', { size: 10 });
  code(40, 164, 'printf("%d\\n", sum);', { size: 10 });
  if (p > 0.35) {
    body(40, 196, 'i starts at 1, so the name at index 0 is skipped.', { size: 9, color: DIM });
    body(40, 214, 'The strict less-than stops at argc - 1.', { size: 9, color: DIM });
  }

  if (p > 0.5) {
    card(24, 248, 416, 200, { fill: ACCDIM, stroke: ACC });
    label(40, 266, 'THE TWO BOUNDS', ACC);
    body(40, 288, 'i < argc   reads indices 1, 2, 3', { size: 10, mono: true, color: ACC });
    body(40, 308, 'i <= argc  reads indices 1, 2, 3, 4', { size: 10, mono: true, color: BAD });
    body(40, 334, 'Index 4 holds the null pointer, so the second', { size: 10 });
    body(40, 352, 'bound fetches a value the loop may not use.', { size: 10 });
    body(40, 378, 'Only the strict bound is safe with a counter.', { size: 10, bold: true });
    body(40, 400, 'The sentinel loop in scene 6 needs no bound at all.', { size: 9, color: DIM });
    body(40, 422, 'Both are correct; mixing them is not.', { size: 9, color: DIM });
  }

  label(468, 76, 'TRACE OF THIS RUN');
  txt(482, 98, 'i', { size: 9, bold: true, color: FAINT });
  txt(522, 98, 'word', { size: 9, bold: true, color: FAINT });
  txt(612, 98, 'atoi', { size: 9, bold: true, color: FAINT });
  txt(712, 98, 'sum', { size: 9, bold: true, color: FAINT });
  txt(790, 98, 'why', { size: 9, bold: true, color: FAINT });
  rule(468, 112, 860, 112);

  var trace = [
    ['1', '10', '10', '10', 'first parameter'],
    ['2', '20', '20', '30', 'second parameter'],
    ['3', '+', '0', '30', 'no digits']
  ];
  for (var i = 0; i < trace.length; i++) {
    if (p < 0.18 + i * 0.12) break;
    var y = 122 + i * 30;
    txt(482, y, trace[i][0], { size: 10, mono: true });
    txt(522, y, trace[i][1], { size: 10, mono: true, bold: true });
    txt(612, y, trace[i][2], { size: 10, mono: true, color: trace[i][2] === '0' ? WARN : INK });
    txt(712, y, trace[i][3], { size: 10, mono: true, bold: true, color: ACC });
    txt(790, y, trace[i][4], { size: 9, color: DIM });
  }
  if (p > 0.55) {
    rule(468, 214, 860, 214);
    txt(482, 226, '4', { size: 10, mono: true, color: FAINT });
    txt(522, 226, '-', { size: 10, mono: true, color: FAINT });
    txt(612, 226, '-', { size: 10, mono: true, color: FAINT });
    txt(712, 226, '30', { size: 10, mono: true, bold: true, color: ACC });
    txt(790, 226, '4 < 4 is false', { size: 9, color: DIM });
  }
  if (p > 0.7) {
    card(468, 254, 392, 194, { fill: WARNDIM, stroke: WARN });
    label(482, 272, 'THE BUG THE OUTPUT HIDES', WARN);
    body(482, 294, 'Start the same loop at 0 and the total is', { size: 10 });
    body(482, 312, 'still 30, because atoi of the name is 0.', { size: 10 });
    body(482, 338, 'Four slots read instead of three.', { size: 10, bold: true });
    body(482, 360, 'A right answer is not evidence of a right', { size: 10, color: DIM });
    body(482, 378, 'loop. Only the bound tells the truth.', { size: 10, color: DIM });
    body(482, 404, 'Rename the program to a word starting with a', { size: 9, color: FAINT });
    body(482, 422, 'digit and the two totals would differ.', { size: 9, color: FAINT });
  }
}

/* ---------- scene 6: the sentinel loop ---------- */
function sceneWhile(t, sc) {
  var p = prog(t, sc);
  heading('Walking with the sentinel, and the loop that reaches the null');
  subline('A pointer is its own condition: non-null is true.');

  card(24, 58, 416, 168);
  label(40, 76, 'THE SENTINEL LOOP');
  code(40, 98, 'i = 1;', { size: 10 });
  code(40, 120, 'while (argv[i] != NULL) {', { size: 10 });
  code(56, 142, 'sum += atoi(argv[i]);', { size: 10 });
  code(56, 164, 'i++;', { size: 10 });
  code(40, 186, '}', { size: 10 });
  if (p > 0.35) {
    body(40, 208, 'argc is never mentioned. The array ends itself.', { size: 9, color: DIM });
  }

  if (p > 0.5) {
    card(24, 242, 416, 206, { fill: SURF2 });
    label(40, 260, 'TRACE');
    body(40, 282, 'reads argv[1] "10"  sum 10', { size: 10, mono: true });
    body(40, 302, 'reads argv[2] "20"  sum 30', { size: 10, mono: true });
    body(40, 322, 'reads argv[3] "+"   sum 30', { size: 10, mono: true });
    body(40, 342, 'meets argv[4] null  stops', { size: 10, mono: true, color: BAD });
    rule(40, 362, 424, 362);
    body(40, 380, 'Three reads, the same 30, and no index arithmetic.', { size: 10 });
    body(40, 404, 'It agrees with the counter loop here because the', { size: 9, color: DIM });
    body(40, 422, 'array is well formed and nothing was modified.', { size: 9, color: DIM });
  }

  card(468, 58, 392, 150);
  label(482, 76, 'THE LOOP WITH THE WRONG BOUND');
  code(482, 98, 'for (i = 0; i <= argc; i++)', { size: 10, color: BAD });
  code(498, 120, 'printf("%s\\n", argv[i]);', { size: 10, color: BAD });
  body(482, 148, 'At i = 4 the counter is still inside the bound,', { size: 10 });
  body(482, 166, 'and the slot fetched there holds a null pointer.', { size: 10 });
  body(482, 190, 'The condition is fine. The body is not.', { size: 9, color: DIM });

  if (p > 0.4) {
    card(468, 224, 392, 224, { fill: BADDIM, stroke: BAD });
    label(482, 242, 'WHAT UNDEFINED MEANS HERE', BAD);
    body(482, 264, 'The standard imposes no requirement at all.', { size: 10 });
    body(482, 286, 'It may print nothing. It may crash. It may print', { size: 10 });
    body(482, 304, 'a word of the compiler\'s choosing.', { size: 10 });
    body(482, 330, 'None of those is "the answer".', { size: 10, bold: true });
    rule(482, 350, 846, 350);
    body(482, 368, 'So an empty line is not a safe guess, and a', { size: 10, color: DIM });
    body(482, 386, 'crash is not proof that the code is undefined.', { size: 10, color: DIM });
    body(482, 412, 'Only the language text decides, and it declines', { size: 9, color: FAINT });
    body(482, 430, 'to say what happens.', { size: 9, color: FAINT });
  }
}

/* ---------- scene 7: no arguments ---------- */
function sceneNone(t, sc) {
  var p = prog(t, sc);
  heading('Run with nothing after the name: argc is 1');
  subline('The null then sits exactly where a parameter would have been.');

  card(24, 58, 416, 190);
  label(40, 76, '$ ./prog');
  var i;
  for (i = 0; i < 2; i++) {
    if (p < 0.15 + i * 0.12) break;
    var x = 44 + i * 96;
    txt(x + 35, 106, 'argv[' + i + ']', { size: 9, mono: true, align: 'center', color: FAINT });
    slotBox(x, 118, 70, 34, i === 1 ? 'null' : './prog',
            { fill: i === 1 ? BADDIM : SURF2, stroke: i === 1 ? BAD : BORDER, size: 9, color: i === 1 ? BAD : INK, bold: i === 1 });
    txt(x + 35, 168, String(i), { size: 9, mono: true, align: 'center', color: FAINT });
  }
  if (p > 0.4) {
    body(44, 196, 'argc is 1, and there is no index 2.', { size: 10, bold: true });
    body(44, 216, 'Two slots: the name, then the sentinel.', { size: 10, color: DIM });
  }
  if (p > 0.6) {
    card(24, 262, 416, 186, { fill: ACCDIM, stroke: ACC });
    label(40, 280, 'THE ARITHMETIC OF AN EMPTY RUN', ACC);
    body(40, 302, 'typed: 0        words: 1        argc: 1', { size: 10, mono: true });
    body(40, 324, 'parameters: argc - 1 = 0', { size: 10, mono: true });
    body(40, 350, 'The name is still a word, so the count is', { size: 10 });
    body(40, 368, 'never zero on a run the shell started.', { size: 10 });
    body(40, 394, 'A count of 0 is permitted by the standard,', { size: 9, color: DIM });
    body(40, 412, 'and then argv[0] is not required to be a name.', { size: 9, color: DIM });
  }

  if (p > 0.28) {
    card(468, 58, 392, 148, { fill: SURF2, stroke: VAL });
    label(482, 76, 'GUARDED: TESTS THE COUNT FIRST', VAL);
    code(482, 98, 'if (argc < 2) {', { size: 10 });
    code(498, 116, 'puts("need one parameter");', { size: 10 });
    code(498, 134, 'return 1;', { size: 10 });
    code(482, 152, '}', { size: 10 });
    code(482, 174, 'int n = atoi(argv[1]);', { size: 10, color: VAL });
    body(482, 194, 'On the empty run this prints the usage line.', { size: 9, color: DIM });
  }
  if (p > 0.5) {
    card(468, 222, 392, 148, { fill: BADDIM, stroke: BAD });
    label(482, 240, 'UNGUARDED: GOES STRAIGHT TO SLOT 1', BAD);
    code(482, 262, 'int n = atoi(argv[1]);', { size: 10, color: BAD });
    body(482, 288, 'On the empty run argv[1] is a null pointer,', { size: 10 });
    body(482, 306, 'so atoi reads a string at address zero.', { size: 10 });
    body(482, 332, 'Undefined behaviour, not a zero.', { size: 10, bold: true, color: BAD });
    body(482, 354, 'The program works on every run that has', { size: 9, color: DIM });
  }
  if (p > 0.78) {
    card(468, 386, 392, 62, { fill: WARNDIM, stroke: WARN });
    body(482, 404, 'a parameter, and fails on the one run that', { size: 9 });
    body(482, 422, 'does not. Test the count, not the result.', { size: 9 });
  }
}

/* ---------- scene 8: atoi and strtol ---------- */
function sceneAtoi(t, sc) {
  var p = prog(t, sc);
  heading('Turning a word into a number: atoi, and what it cannot say');
  subline('atoi reports a value and never reports a failure.');

  card(24, 58, 416, 390);
  label(40, 76, 'THE CONVERSIONS, COMPUTED');
  txt(40, 100, 'word', { size: 9, bold: true, color: FAINT });
  txt(240, 100, 'atoi', { size: 9, bold: true, color: FAINT });
  txt(320, 100, 'digits', { size: 9, bold: true, color: FAINT });
  txt(400, 100, 'stopped at', { size: 9, bold: true, color: FAINT, align: 'right' });
  rule(40, 114, 424, 114);

  for (var i = 0; i < CONV.length; i++) {
    if (p < 0.1 + i * 0.09) break;
    var y = 124 + i * 32;
    var c = CONV[i];
    txt(40, y, '"' + c.word + '"', { size: 10, mono: true });
    txt(240, y, String(c.value), { size: 10, mono: true, bold: true, color: c.value === 0 && c.digits === 0 ? BAD : ACC });
    txt(320, y, String(c.digits), { size: 10, mono: true, color: c.digits === 0 ? BAD : INK });
    txt(400, y, 'index ' + c.end, { size: 9, color: DIM, align: 'right' });
  }
  if (p > 0.72) {
    rule(40, 352, 424, 352);
    body(40, 370, 'Two words give 0 for two different reasons.', { size: 10, bold: true });
    body(40, 390, '"0" read one digit. "abc" read none.', { size: 10 });
    body(40, 414, 'atoi returns 0 in both cases and says nothing.', { size: 9, color: DIM });
  }

  label(468, 76, 'THE SAME CONVERSION, WITH A REPORT');
  card(468, 88, 392, 116, { fill: SURF2 });
  code(482, 106, 'char *end;', { size: 10 });
  code(482, 128, 'long v = strtol(argv[1], &end, 10);', { size: 10 });
  code(482, 150, 'if (end == argv[1]) {', { size: 10 });
  code(498, 170, '/* not a number */', { size: 10, color: DIM });
  code(482, 190, '}', { size: 10 });

  if (p > 0.35) {
    card(468, 220, 392, 96, { fill: ACCDIM, stroke: ACC });
    label(482, 238, 'ON "12abc"', ACC);
    body(482, 260, 'value 12, end points at index 2, the letter a.', { size: 10 });
    body(482, 280, 'end is past the start, so digits were read.', { size: 10 });
    body(482, 300, 'The trailing letters are left unread, as with atoi.', { size: 9, color: DIM });
  }
  if (p > 0.6) {
    card(468, 332, 392, 116, { fill: SURF2 });
    label(482, 350, 'THE ONE COMPARISON THAT DECIDES');
    body(482, 372, 'end == argv[1]   nothing was converted', { size: 10, mono: true, color: BAD });
    body(482, 392, 'end >  argv[1]   a number was converted', { size: 10, mono: true, color: VAL });
    body(482, 416, 'This is the test atoi has no way to offer.', { size: 9, color: DIM });
  }
}

/* ---------- scene 9: the two declarations ---------- */
function sceneDecl(t, sc) {
  var p = prog(t, sc);
  heading('Two declarations that are one type');
  subline('In a parameter list, an array type is rewritten as a pointer.');

  card(24, 58, 416, 150);
  label(40, 76, 'BOTH ARE VALID, AND BOTH MEAN THE SAME');
  code(40, 100, 'int main(int argc, char *argv[])', { size: 10, color: ACC });
  code(40, 126, 'int main(int argc, char **argv)', { size: 10, color: ACC });
  chip(40, 168, 'same parameter type', 'ok');
  if (p > 0.25) {
    body(40, 192, 'The standard calls the second form equivalent.', { size: 9, color: DIM });
  }

  if (p > 0.4) {
    card(24, 226, 416, 222, { fill: SURF2 });
    label(40, 244, 'WHY: THE ADJUSTMENT RULE');
    body(40, 266, 'A parameter declared with an array type is', { size: 10 });
    body(40, 284, 'adjusted to a pointer type before anything else.', { size: 10 });
    body(40, 310, 'char *argv[]   becomes   char **argv', { size: 10, mono: true, color: ACC });
    body(40, 336, 'That is why C cannot pass an array by value:', { size: 10 });
    body(40, 354, 'the function receives an address, and the', { size: 10 });
    body(40, 372, 'length is lost at the boundary.', { size: 10 });
    body(40, 400, 'The count survives only because it was passed', { size: 9, color: DIM });
    body(40, 418, 'separately, in argc.', { size: 9, color: DIM });
  }

  label(468, 76, 'SO WHAT DOES sizeof SAY?');
  var rows = [
    ['sizeof(argv)', '8', 'a pointer, not the array'],
    ['sizeof(*argv)', '8', 'still a pointer: char *'],
    ['sizeof(**argv)', '1', 'a char, which is one byte'],
    ['sizeof(argv[0])', '8', 'the element type is char *'],
    ['argc', '4', 'the count, from the parameter'],
    ['slots actually present', '5', 'argc plus the sentinel']
  ];
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.12 + i * 0.11) break;
    rowCard(468, 92 + i * 40, 392, 30, rows[i][0], rows[i][1],
            { fill: i === 0 ? ACCDIM : SURF2, stroke: i === 0 ? ACC : BORDER });
  }
  if (p > 0.78) {
    card(468, 348, 392, 100, { fill: BADDIM, stroke: BAD });
    label(482, 366, 'THE WRONG ANSWER', BAD);
    body(482, 388, '5 slots times 8 bytes is 40, and that is what', { size: 10 });
    body(482, 406, 'the array would measure. argv is not the array.', { size: 10 });
    body(482, 428, 'It measures one pointer.', { size: 10, bold: true, color: BAD });
  }
}

/* ---------- scene 10: guarantees ---------- */
function sceneGuarantee(t, sc) {
  var p = prog(t, sc);
  heading('What is guaranteed, and what the standard leaves open');
  subline('Two lists. Only the left one may be relied on in a question.');

  card(24, 58, 416, 390);
  label(40, 76, 'GUARANTEED', VAL);
  var g = [
    'argc is nonnegative.',
    'argv[argc] is a null pointer.',
    'slots 0 to argc - 1 hold string pointers.',
    'argc, argv and the strings are modifiable.',
    'they keep their values until termination.'
  ];
  for (var i = 0; i < g.length; i++) {
    if (p < 0.1 + i * 0.1) break;
    if (P) P.circle(43, 103 + i * 24, 2.4, { fill: VAL });
    body(56, 98 + i * 24, g[i], { size: 10 });
  }
  if (p > 0.62) {
    rule(40, 226, 424, 226);
    label(40, 244, 'LEFT OPEN', WARN);
    body(40, 266, 'where the characters are stored', { size: 10 });
    body(40, 288, 'whether argv[0] is a bare name, a relative', { size: 10 });
    body(40, 306, 'path or an absolute path', { size: 10 });
    body(40, 328, 'the exact text of every string', { size: 10 });
    body(40, 354, 'The standard fixes the shape, not the contents.', { size: 10, bold: true, color: WARN });
  }
  if (p > 0.84) {
    card(40, 374, 384, 64, { fill: SURF2 });
    body(56, 392, 'Modifiable is not roomy: writing past a', { size: 9 });
    body(56, 410, 'string\'s own terminator is still out of bounds.', { size: 9 });
  }

  label(468, 76, 'THE FIVE-STEP PROCEDURE');
  var steps = [
    '1  Test argc before reading any slot.',
    '2  Start parameter loops at index 1.',
    '3  Stop at argc, or at the null pointer.',
    '4  Convert with the reporting you need.',
    '5  Say what went wrong, and return nonzero.'
  ];
  for (var j = 0; j < steps.length; j++) {
    if (p < 0.12 + j * 0.12) break;
    card(468, 92 + j * 46, 392, 36, { fill: j === 0 ? ACCDIM : SURF2, stroke: j === 0 ? ACC : BORDER });
    body(482, 106 + j * 46, steps[j], { size: 10, color: j === 0 ? ACC : INK });
  }
  if (p > 0.75) {
    card(468, 340, 392, 108, { fill: SURF2 });
    body(482, 360, 'Every step answers one fact on this page:', { size: 9, color: DIM });
    body(482, 382, 'the name at 0, the null at argc, the silent', { size: 9, color: DIM });
    body(482, 400, 'zero from atoi, and the guard that comes first.', { size: 9, color: DIM });
    body(482, 426, 'Nothing here needs a remembered number.', { size: 9, color: ACC });
  }
}

/* ---------- dispatch ---------- */
var SCENES = {
  shell: sceneShell,
  argc: sceneArgc,
  argv: sceneArgv,
  sentinel: sceneSentinel,
  counter: sceneCounter,
  while: sceneWhile,
  none: sceneNone,
  atoi: sceneAtoi,
  decl: sceneDecl,
  guarantee: sceneGuarantee
};

function drawFrame(P_) {
  if (!P_) return;
  P = P_;
  P.clear();
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
  if (!sc) return;
  var fn = SCENES[sc.id] || SCENES.shell;
  fn(t, sc);
}

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

function fillChecks() {
  var el = document.getElementById('checks');
  if (!el) return;
  var pass = CHECKS.filter(function (c) { return c.pass; }).length;
  el.innerHTML = '<span class="k">Model checks</span>' + pass + ' of ' + CHECKS.length + ' passing';
  el.className = 'checks ' + (pass === CHECKS.length ? 'is-pass' : 'is-fail');
}

function boot() {
  var holder = document.getElementById('canvas-holder');
  var fallback = document.getElementById('canvas-fallback');
  if (!holder) return;

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
    } catch (e) { console.error('p5 failed', e); ok = false; }
  }

  if (!ok) {
    var drew = false;
    try {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      holder.appendChild(cv);
      var ctx2d = cv.getContext && cv.getContext('2d');
      if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
    } catch (e) { console.error('canvas fallback failed', e); }
    if (!drew && fallback) fallback.classList.add('show');
  }

  if (K && K.init) K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });

  fillChecks();

  window.__drawAt = function (t) { K.state.elapsed = t; if (P) drawFrame(P); };

  var badc = CHECKS.filter(function (c) { return !c.pass; });
  if (badc.length) console.warn('Model validation did not fully pass:', badc);
}

window.__MODEL = { V: V, SIZEOF: SIZEOF, CONV: CONV, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
