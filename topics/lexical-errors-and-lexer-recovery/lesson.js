/* ==========================================================================
   lexical-errors-and-lexer-recovery — lesson.js
   Four layers, in order:
     1. THE MODEL      — a token specification, a 24-state automaton built from
                         it, an independently written longest-match matcher, a
                         recursive-descent parser, and three recovery rules.
     2. THE CHECKS     — every count re-derived from a definition.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The token counts, the failure
   positions, the deletion counts and the disagreement counts are all produced
   here and re-checked against the tables that produced them.
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
  var VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
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

/* ---------- the token specification of this lesson's language ---------- */
var KEYWORDS = ['if', 'then', 'else', 'while', 'print'];
var OPS = ['==', '<=', '=', '<', '+', '-', '*', '/', '(', ')', '{', '}', ';'];

function isLetter(c) { return /^[A-Za-z]$/.test(c); }
function isDigit(c) { return /^[0-9]$/.test(c); }
function isId(s) { return /^[A-Za-z][A-Za-z0-9_]*$/.test(s); }
function isNum(s) { return /^[0-9]+$/.test(s); }
function isKw(s) { return KEYWORDS.indexOf(s) >= 0; }
function isOp(s) { return OPS.indexOf(s) >= 0; }
function isWs(s) { return s.length > 0 && /^[ \t\n]+$/.test(s); }
function isStr(s) {
  if (s.length < 2) return false;
  if (s.charAt(0) !== '"' || s.charAt(s.length - 1) !== '"') return false;
  for (var i = 1; i < s.length - 1; i++) {
    var c = s.charAt(i);
    if (c === '\n') return false;
    if (c === '"') return false;
    if (c === '\\') {
      i++;
      if (i >= s.length - 1) return false;
      if (s.charAt(i) === '\n') return false;
    }
  }
  return true;
}
function isComment(s) {
  if (s.length < 4) return false;
  if (s.slice(0, 2) !== '/*' || s.slice(-2) !== '*/') return false;
  return s.indexOf('*/', 2) === s.length - 2;
}

/* priority order: a keyword before an identifier, since the two tie on length */
var SPEC = [
  { name: 'kw', test: isKw },
  { name: 'id', test: isId },
  { name: 'num', test: isNum },
  { name: 'str', test: isStr },
  { name: 'comment', test: isComment, skip: true },
  { name: 'op', test: isOp },
  { name: 'ws', test: isWs, skip: true }
];

/* ---------- independent brute-force longest-match scanner ---------- */
function bruteScan(src) {
  var i = 0, toks = [], err = null;
  while (i < src.length) {
    var best = null;
    for (var len = src.length - i; len >= 1 && !best; len--) {
      var s = src.substr(i, len);
      for (var k = 0; k < SPEC.length; k++) {
        if (SPEC[k].test(s)) {
          best = { type: SPEC[k].name, text: s, skip: !!SPEC[k].skip, start: i, end: i + len };
          break;
        }
      }
    }
    if (!best) { err = { start: i, pos: i, ch: src.charAt(i) }; break; }
    toks.push(best); i = best.end;
  }
  return { toks: toks, err: err, end: i };
}

/* ---------- the hand-built automaton ---------- */
var S = {};
['S0', 'ws', 'id', 'num', 'sopen', 'sbody', 'sesc', 'sclose', 'eq', 'eqeq', 'lt', 'le',
 'plus', 'minus', 'star', 'slash', 'cmt', 'cmtstar', 'cmtend', 'lparen', 'rparen',
 'lbrace', 'rbrace', 'semi'].forEach(function (n, i) { S[n] = i; });

var ACC = {};
ACC[S.ws] = 'ws';
ACC[S.id] = 'id';
ACC[S.num] = 'num';
ACC[S.sclose] = 'str';
ACC[S.eq] = 'op';
ACC[S.eqeq] = 'op';
ACC[S.lt] = 'op';
ACC[S.le] = 'op';
ACC[S.plus] = 'op';
ACC[S.minus] = 'op';
ACC[S.star] = 'op';
ACC[S.slash] = 'op';
ACC[S.cmtend] = 'comment';
ACC[S.lparen] = 'op';
ACC[S.rparen] = 'op';
ACC[S.lbrace] = 'op';
ACC[S.rbrace] = 'op';
ACC[S.semi] = 'op';

var NSTATES = 24;
var TRANS = [];
var NONDET = 0;
(function () {
  var i;
  for (i = 0; i < NSTATES; i++) TRANS.push({});
  function add(from, chars, to) {
    for (var k = 0; k < chars.length; k++) {
      var c = chars.charAt(k);
      if (TRANS[from][c] !== undefined && TRANS[from][c] !== to) NONDET++;
      TRANS[from][c] = to;
    }
  }
  function addIf(from, pred, to) {
    var codes = [9, 10];
    for (var c = 32; c < 127; c++) codes.push(c);
    for (var k = 0; k < codes.length; k++) {
      var ch = String.fromCharCode(codes[k]);
      if (pred(ch)) add(from, ch, to);
    }
  }

  addIf(S.S0, isLetter, S.id);
  addIf(S.S0, isDigit, S.num);
  addIf(S.S0, function (c) { return /[ \t\n]/.test(c); }, S.ws);
  add(S.S0, '"', S.sopen);
  add(S.S0, '=', S.eq);
  add(S.S0, '<', S.lt);
  add(S.S0, '+', S.plus);
  add(S.S0, '-', S.minus);
  add(S.S0, '*', S.star);
  add(S.S0, '/', S.slash);
  add(S.S0, '(', S.lparen);
  add(S.S0, ')', S.rparen);
  add(S.S0, '{', S.lbrace);
  add(S.S0, '}', S.rbrace);
  add(S.S0, ';', S.semi);

  addIf(S.ws, function (c) { return /[ \t\n]/.test(c); }, S.ws);
  addIf(S.id, function (c) { return isLetter(c) || isDigit(c) || c === '_'; }, S.id);
  addIf(S.num, isDigit, S.num);

  addIf(S.sopen, function (c) { return c !== '"' && c !== '\n' && c !== '\\'; }, S.sbody);
  addIf(S.sbody, function (c) { return c !== '"' && c !== '\n' && c !== '\\'; }, S.sbody);
  add(S.sopen, '\\', S.sesc);
  add(S.sopen, '"', S.sclose);
  add(S.sbody, '\\', S.sesc);
  add(S.sbody, '"', S.sclose);
  addIf(S.sesc, function (c) { return c !== '\n'; }, S.sbody);

  add(S.eq, '=', S.eqeq);
  add(S.lt, '=', S.le);
  add(S.slash, '*', S.cmt);

  addIf(S.cmt, function (c) { return c !== '*'; }, S.cmt);
  add(S.cmt, '*', S.cmtstar);
  add(S.cmtstar, '/', S.cmtend);
  add(S.cmtstar, '*', S.cmtstar);
  addIf(S.cmtstar, function (c) { return c !== '*' && c !== '/'; }, S.cmt);
})();

function dfaScan(src) {
  var i = 0, toks = [], err = null;
  while (i < src.length) {
    var st = S.S0, j = i, last = null;
    while (j < src.length) {
      var nx = TRANS[st][src.charAt(j)];
      if (nx === undefined) break;
      st = nx; j++;
      if (ACC[st] !== undefined) last = { end: j, cls: ACC[st] };
    }
    if (!last) {
      err = { start: i, pos: j, ch: src.charAt(j), state: st, moved: st !== S.S0 };
      break;
    }
    var text = src.slice(i, last.end);
    var type = last.cls;
    if (type === 'id' && isKw(text)) type = 'kw';
    toks.push({ type: type, text: text, skip: (type === 'ws' || type === 'comment'), start: i, end: last.end });
    i = last.end;
  }
  return { toks: toks, err: err, end: i };
}

function live(ts) { return ts.filter(function (t) { return !t.skip; }); }
function sig(ts) { return ts.map(function (t) { return t.type + ':' + t.text; }).join(' | '); }
function texts(ts) { return live(ts).map(function (t) { return t.text; }); }

/* ---------- a shortest-match lexer, for comparison only ---------- */
function shortestScan(src) {
  var i = 0, toks = [], err = null;
  while (i < src.length) {
    var best = null;
    for (var len = 1; len <= src.length - i && !best; len++) {
      var s = src.substr(i, len);
      for (var k = 0; k < SPEC.length; k++) {
        if (SPEC[k].test(s)) {
          best = { type: SPEC[k].name, text: s, skip: !!SPEC[k].skip, start: i, end: i + len };
          break;
        }
      }
    }
    if (!best) { err = { start: i }; break; }
    toks.push(best); i = best.end;
  }
  return { toks: toks, err: err };
}

/* ---------- a recursive-descent parser: the syntactic side ---------- */
function parse(toks) {
  var ts = live(toks);
  var i = 0, fail = null;
  function is(t) { return ts[i] && ts[i].type === t; }
  function isText(t) { return ts[i] && ts[i].text === t; }
  function bad(msg) {
    if (!fail) fail = { index: i, token: ts[i] ? ts[i].text : 'end of input', msg: msg };
    throw new Error('parse-stop');
  }
  function expectText(t, msg) { if (!isText(t)) bad(msg || ('expected ' + t)); i++; }
  function expr() { term(); while (isText('+') || isText('-')) { i++; term(); } }
  function term() { factor(); while (isText('*') || isText('/')) { i++; factor(); } }
  function factor() {
    if (is('id') || is('num') || is('str')) { i++; return; }
    if (isText('(')) { i++; expr(); expectText(')'); return; }
    bad('a value is expected here');
  }
  function stmt() {
    if (is('id')) { i++; expectText('=', 'expected = after the name'); expr(); expectText(';', 'expected ; at the end of the statement'); return; }
    if (isText('print')) { i++; expr(); expectText(';'); return; }
    if (isText('if') || isText('while')) { i++; expr(); expectText('then'); stmt(); return; }
    if (isText('{')) { i++; while (!isText('}') && i < ts.length) stmt(); expectText('}'); return; }
    bad('a statement cannot start with this token');
  }
  try { while (i < ts.length) stmt(); } catch (e) { /* recorded in fail */ }
  return { ok: !fail, fail: fail, tokens: ts.length };
}

/* ---------- panic mode: delete to a character that can begin a token ---- */
function panicScan(src) {
  var i = 0, toks = [], errs = [], deletes = 0, guardFires = 0, passes = 0;
  while (i < src.length && passes++ < 40) {
    var r = dfaScan(src.slice(i));
    var k;
    for (k = 0; k < r.toks.length; k++) {
      r.toks[k].start += i; r.toks[k].end += i; toks.push(r.toks[k]);
    }
    if (!r.err) { i = src.length; break; }
    var at = i + r.err.pos;
    errs.push({ pos: at, ch: src.charAt(at), moved: r.err.moved });
    var j = at;
    while (j < src.length && TRANS[S.S0][src.charAt(j)] === undefined) j++;
    if (j === at) { guardFires++; j = at + 1; }
    deletes += j - at;
    i = j;
  }
  return { toks: toks, errs: errs, deletes: deletes, guardFires: guardFires, passes: passes };
}

/* ---------- syncing to a delimiter ---------- */
function syncScan(src, delim) {
  var i = 0, toks = [], errs = [], skipped = 0, passes = 0;
  while (i < src.length && passes++ < 40) {
    var r = dfaScan(src.slice(i)), k;
    for (k = 0; k < r.toks.length; k++) {
      r.toks[k].start += i; r.toks[k].end += i; toks.push(r.toks[k]);
    }
    if (!r.err) break;
    var at = i + r.err.pos;
    errs.push({ pos: at, ch: src.charAt(at) });
    var j = at;
    while (j < src.length && delim.indexOf(src.charAt(j)) < 0) j++;
    skipped += j - at;
    i = j;
    if (i === at) i = at + 1;
  }
  return { toks: toks, errs: errs, skipped: skipped };
}

/* ---------- the corpus the page shows ---------- */
var CORPUS = [
  'x1 23mm 78 y 7z',
  'x = 3 $ y;',
  'x = @@@ 3;',
  'x = "abc\ny = 2;',
  'a/*b*/c',
  'a / * b / c',
  'if if then',
  '3 + 4 ;',
  'x == 3;',
  'x = 3;',
  'x = "a\\"b";',
  '/* unterminated',
  'ifx = 1;'
];

var V = {};
V.keywords = KEYWORDS;
V.corpus = CORPUS;
V.scan = {};

(function build() {
  var q, src, d;

  /* the automaton's own figures */
  V.states = NSTATES;
  V.accStates = Object.keys(ACC).length;
  V.nondet = NONDET;
  V.transCount = (function () {
    var n = 0, s, c;
    for (s = 0; s < NSTATES; s++) for (c in TRANS[s]) n++;
    return n;
  })();

  /* keyword trie */
  (function () {
    var root = { kids: {}, end: false }, count = 1;
    KEYWORDS.forEach(function (w) {
      var n = root;
      for (var i = 0; i < w.length; i++) {
        var c = w.charAt(i);
        if (!n.kids[c]) { n.kids[c] = { kids: {}, end: false }; count++; }
        n = n.kids[c];
      }
      n.end = true;
    });
    V.trie = count;
  })();

  /* the corpus, scanned three ways */
  var alpha = 'ab01"\\=<*/ (;$';
  var allStrings = [''];
  var a, b, c2;
  for (a = 0; a < alpha.length; a++) {
    allStrings.push(alpha.charAt(a));
    for (b = 0; b < alpha.length; b++) {
      allStrings.push(alpha.charAt(a) + alpha.charAt(b));
      for (c2 = 0; c2 < alpha.length; c2++) {
        allStrings.push(alpha.charAt(a) + alpha.charAt(b) + alpha.charAt(c2));
      }
    }
  }
  V.strings3 = allStrings.length;
  V.agree3 = 0;
  V.disagree3 = [];
  for (q = 0; q < allStrings.length; q++) {
    var d1 = dfaScan(allStrings[q]), b1 = bruteScan(allStrings[q]);
    var same = sig(d1.toks) === sig(b1.toks) &&
      String(d1.err ? d1.err.start : -1) === String(b1.err ? b1.err.start : -1);
    if (same) V.agree3++;
    else if (V.disagree3.length < 4) V.disagree3.push(allStrings[q]);
  }

  V.agreeCorpus = 0;
  V.corpusDiff = [];
  V.munchDiff = [];
  V.rows = [];
  for (q = 0; q < CORPUS.length; q++) {
    src = CORPUS[q];
    d = dfaScan(src);
    var br = bruteScan(src), sh = shortestScan(src);
    V.scan[src] = d;
    var same2 = sig(d.toks) === sig(br.toks) &&
      String(d.err ? d.err.start : -1) === String(br.err ? br.err.start : -1);
    if (same2) V.agreeCorpus++; else V.corpusDiff.push(src);
    if (sig(d.toks) !== sig(sh.toks)) V.munchDiff.push(src);
    V.rows.push({
      src: src,
      toks: texts(d.toks),
      err: d.err,
      shortest: texts(sh.toks)
    });
  }

  /* tokens tile the source */
  V.tiled = true;
  V.tileBad = '';
  for (q = 0; q < CORPUS.length; q++) {
    src = CORPUS[q];
    var at = 0, tl = dfaScan(src).toks, bad = false;
    for (var t = 0; t < tl.length; t++) {
      if (tl[t].start !== at || src.slice(tl[t].start, tl[t].end) !== tl[t].text) bad = true;
      at = tl[t].end;
    }
    if (bad) { V.tiled = false; V.tileBad = src; }
  }

  /* the named cases */
  V.illegal = dfaScan('x = 3 $ y;');
  V.unterm = dfaScan('x = "abc\ny = 2;');
  V.openQuote = 'x = "abc\ny = 2;'.indexOf('"');
  V.dist = V.unterm.err.pos - V.openQuote;
  V.packed = texts(dfaScan('a/*b*/c').toks);
  V.spaced = texts(dfaScan('a / * b / c').toks);
  V.untermComment = { toks: texts(dfaScan('/* unterminated').toks), err: dfaScan('/* unterminated').err };
  V.emptyString = dfaScan('x = "";');

  /* GATE CSE 2026 Set 2, under that question's own token rules */
  (function () {
    var GSPEC = [
      { name: 'id', test: isId },
      { name: 'number', test: isNum },
      { name: 'ws', test: isWs, skip: true }
    ];
    var gsrc = 'x1 23mm 78 y 7z zz5 14A 8H AaYcD';
    var i2 = 0, out = [], words = gsrc.split(/\s+/).filter(Boolean);
    while (i2 < gsrc.length) {
      var best = null;
      for (var len = gsrc.length - i2; len >= 1 && !best; len--) {
        var s = gsrc.substr(i2, len);
        for (var k = 0; k < GSPEC.length; k++) {
          if (GSPEC[k].test(s)) { best = { type: GSPEC[k].name, text: s, skip: !!GSPEC[k].skip }; break; }
        }
      }
      if (!best) break;
      out.push(best); i2 += best.text.length;
    }
    var liveOut = out.filter(function (t) { return !t.skip; });
    V.gate = {
      src: gsrc,
      words: words,
      toks: liveOut,
      count: liveOut.length,
      wordCount: words.length,
      perWord: words.map(function (w) {
        var j = 0, n = 0;
        while (j < w.length) {
          var bb = null;
          for (var L = w.length - j; L >= 1 && !bb; L--) {
            var ss = w.substr(j, L);
            for (var kk = 0; kk < GSPEC.length; kk++) {
              if (!GSPEC[kk].skip && GSPEC[kk].test(ss)) { bb = ss; break; }
            }
          }
          if (!bb) break;
          n++; j += bb.length;
        }
        return n;
      })
    };
  })();

  /* classification of the corpus by phase */
  var PLAN = [
    ['x = 3 $ y;', 'lexical'],
    ['3 + 4 ;', 'syntactic'],
    ['if if then', 'syntactic'],
    ['x = 3 y;', 'syntactic'],
    ['x = 3;', 'none'],
    ['if x then { print x; }', 'none'],
    ['x = "abc\ny = 2;', 'lexical']
  ];
  V.classify = PLAN.map(function (row) {
    var dd = dfaScan(row[0]);
    if (dd.err) {
      return { src: row[0], phase: 'lexical', want: row[1],
        detail: 'no token can start at character ' + (dd.err.pos + 1) };
    }
    var r = parse(dd.toks);
    if (!r.ok) {
      return { src: row[0], phase: 'syntactic', want: row[1],
        detail: 'token ' + (r.fail.index + 1) + ' "' + r.fail.token + '": ' + r.fail.msg };
    }
    return { src: row[0], phase: 'none', want: row[1], detail: r.tokens + ' tokens, it parses' };
  });

  /* GATE CSE 2026 Set 1 */
  V.gateS1 = {
    s1: 'char *str1 = "Hello;',
    s2: 'char *str2 = "Hello;";',
    s3: 'int *str3 = "Hello";'
  };
  V.gateS1err = {
    s1: dfaScan(V.gateS1.s1).err,
    s2: dfaScan(V.gateS1.s2).err,
    s3: dfaScan(V.gateS1.s3).err
  };

  /* recovery */
  V.panic = ['x = 3 $ y;', 'x = @@@ 3;', 'x = "abc\ny = 2;'].map(function (s) {
    var r = panicScan(s);
    return {
      src: s, errors: r.errs.length, deletes: r.deletes,
      guards: r.guardFires, toks: texts(r.toks)
    };
  });
  V.syncIn = 'x = @ y ; z = 1;';
  (function () {
    var r = syncScan(V.syncIn, ';');
    V.sync = { src: V.syncIn, skipped: r.skipped, errors: r.errs.length, toks: texts(r.toks) };
  })();
  V.guardedParse = parse(panicScan('x = "abc\ny = 2;').toks);
})();

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('the transition table is deterministic: no state has two moves on one character',
  V.nondet === 0, V.nondet + ' conflicts in ' + V.transCount + ' transitions');
chk('the automaton has ' + V.states + ' states and ' + V.accStates + ' accepting states',
  V.states === 24 && V.accStates === 18, V.states + '/' + V.accStates);
chk('the automaton and the brute-force matcher agree on all ' + V.agree3 + ' of ' + V.strings3 +
  ' strings of length at most three', V.agree3 === V.strings3, V.disagree3.join(' ; '));
chk('the two scanners agree on all ' + V.agreeCorpus + ' of the ' + CORPUS.length + ' corpus strings',
  V.agreeCorpus === CORPUS.length, V.corpusDiff.join(' ; '));
chk('every token text is the source substring at its own span, with no gaps', V.tiled, V.tileBad);
chk('the ' + KEYWORDS.length + ' keywords, spelled out as paths, need ' + V.trie + ' extra states',
  V.trie === 21, V.trie);
chk('longest match and shortest match disagree on ' + V.munchDiff.length + ' of the ' +
  CORPUS.length + ' corpus strings', V.munchDiff.length === 6, V.munchDiff.join(' || '));
chk('the packed comment form gives ' + V.packed.length + ' tokens and the spaced form gives ' + V.spaced.length,
  V.packed.length === 2 && V.spaced.length === 6, V.packed.join(' ') + ' / ' + V.spaced.join(' '));
chk('GATE CSE 2026 Set 2: the string gives ' + V.gate.count + ' tokens under that question\'s rules',
  V.gate.count === 13, sig(V.gate.toks));
chk('the same string is ' + V.gate.wordCount + ' blank-separated words, so the word count is the wrong answer',
  V.gate.wordCount === 9, V.gate.wordCount);
chk('the per-word counts add up to the token count',
  V.gate.perWord.reduce(function (a, b) { return a + b; }, 0) === V.gate.count, V.gate.perWord.join('+'));
chk('the unterminated literal is reported at character ' + (V.unterm.err.pos + 1) +
  ' though the quote opens at character ' + (V.openQuote + 1), V.dist === 4, V.dist);
chk('the illegal character leaves the run in the start state, the literal does not',
  V.illegal.err.moved === false && V.unterm.err.moved === true,
  'illegal moved=' + V.illegal.err.moved + ', literal moved=' + V.unterm.err.moved);
chk('the unterminated comment raises no error under pure longest match: ' +
  V.untermComment.toks.length + ' tokens, falling back to the slash',
  V.untermComment.err === null && V.untermComment.toks.length === 3, V.untermComment.toks.join(' '));
chk('an empty string literal is one token', V.emptyString.err === null && texts(V.emptyString.toks).length === 4,
  texts(V.emptyString.toks).join(' '));
chk('every corpus string is classified in the phase that can see the fault',
  V.classify.every(function (r) { return r.phase === r.want; }),
  V.classify.filter(function (r) { return r.phase !== r.want; }).map(function (r) { return r.src; }).join(' ; '));
chk('GATE CSE 2026 Set 1: only S1 has a lexical error',
  !!V.gateS1err.s1 && !V.gateS1err.s2 && !V.gateS1err.s3,
  'S1 ' + (V.gateS1err.s1 ? 'error at ' + (V.gateS1err.s1.pos + 1) : 'clean') +
  ', S2 ' + (V.gateS1err.s2 ? 'error' : 'clean') + ', S3 ' + (V.gateS1err.s3 ? 'error' : 'clean'));
chk('panic mode deletes ' + V.panic[0].deletes + ' character on the dollar input and ' +
  V.panic[1].deletes + ' on the three-at input',
  V.panic[0].deletes === 1 && V.panic[1].deletes === 3,
  V.panic[0].deletes + ',' + V.panic[1].deletes);
chk('the unterminated literal makes the rule delete nothing, so the guard fires ' +
  V.panic[2].guards + ' time', V.panic[2].guards === 1, V.panic[2].guards);
chk('the guarded repair leaves ' + V.panic[2].toks.join(' ') + ', which the parser rejects',
  !V.guardedParse.ok, V.guardedParse.fail && V.guardedParse.fail.token);
chk('syncing to the semicolon skips ' + V.sync.skipped + ' characters on ' + V.sync.src,
  V.sync.skipped === 4 && V.sync.errors === 1, V.sync.toks.join(' '));

/* ======================================================================
   LAYER 3 - RENDER
   Reads V. Nothing here builds a token, a state or a count.
   ====================================================================== */

function prog(t, sc) {
  var span = Math.max(0.001, sc.end - sc.start);
  var p = (t - sc.start) / span;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
function txt(x, y, s, o) { if (P) P.text(x, y, s, o || {}); }
function heading(s) { txt(28, 18, s, { size: 15, bold: true, color: INK }); }
function subline(s) { txt(28, 40, s, { size: 11, color: DIM }); }
function label(x, y, s, c) { txt(x, y, s, { size: 9, bold: true, color: c || FAINT }); }
function body(x, y, s, o) {
  o = o || {};
  txt(x, y, s, { size: o.size || 10, color: o.color || INK, bold: o.bold, mono: o.mono });
}
function card(x, y, w, h, o) {
  o = o || {};
  if (!P) return;
  P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: o.radius || 6 });
}
function rule(x1, y1, x2, y2, c) { if (P) P.line(x1, y1, x2, y2, { stroke: c || BORDER, sw: 1 }); }
function bullets(x, y, lines, p, start, step, o) {
  o = o || {};
  var lead = o.lead === undefined ? 20 : o.lead;
  for (var i = 0; i < lines.length; i++) {
    if (p < start + i * step) break;
    var ln = lines[i];
    var col = o.color || INK, mono = o.mono;
    if (typeof ln === 'object') { col = ln.color || col; mono = ln.mono === undefined ? mono : ln.mono; ln = ln.s; }
    body(x, y + i * lead, ln, { size: o.size || 10, color: col, mono: mono });
  }
}

/* a token chip: a small rounded box holding one lexeme */
function chip(x, y, text, o) {
  o = o || {};
  var size = o.size || 9.5;
  var w = 12 + String(text).length * size * 0.6;
  if (P) P.rect(x, y, w, 19, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: 1, radius: 4 });
  txt(x + 6, y + 5, String(text), { size: size, mono: true, color: o.color || INK, bold: o.bold });
  return x + w;
}
function chipRow(x, y, items, o) {
  o = o || {};
  var gap = o.gap === undefined ? 6 : o.gap;
  var cx = x;
  for (var i = 0; i < items.length; i++) {
    cx = chip(cx, y, items[i], o) + gap;
  }
  return cx;
}

/* ---------- scene 1: characters in, tokens out ---------- */
function sceneStream(t, sc) {
  var p = prog(t, sc);
  heading('Characters in, tokens out');
  subline('A token is a class plus the exact text it matched. Nothing later sees characters.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE SEVEN CLASSES OF THIS LANGUAGE');
  bullets(40, 98, [
    'keyword    identifier    number',
    'string     operator      comment',
    'whitespace, which is skipped'
  ], p, 0.03, 0.08, { lead: 18 });
  if (p > 0.24) {
    rule(40, 158, 444, 158);
    label(40, 172, 'ONE LINE OF INPUT');
    body(40, 192, 'x1 23mm 78 y 7z', { mono: true, size: 11 });
    label(40, 218, 'ITS TOKENS — SEVEN, NOT FIVE');
    chipRow(40, 234, ['x1', '23', 'mm', '78', 'y', '7', 'z'], { size: 9.5 });
    body(40, 262, '5 words, 7 tokens: words are not tokens.', { size: 10, color: DIM });
  }
  if (p > 0.56) {
    rule(40, 286, 444, 286);
    body(40, 302, '23mm splits because an identifier must', { size: 10 });
    body(40, 320, 'begin with a letter. The digits end the', { size: 10 });
    body(40, 338, 'number; the letters start a new token.', { size: 10 });
  }
  if (p > 0.8) {
    card(40, 358, 404, 62, { fill: ACCDIM, stroke: ACC });
    body(56, 372, 'A token is a class plus its lexeme.', { size: 10 });
    body(56, 392, 'The class is what the parser reads.', { size: 10, bold: true, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE TWO DECISIONS, AND ONLY TWO');
  body(488, 100, '1. Where does a token start?', { size: 10.5, bold: true });
  body(488, 118, '   at the position the last token ended', { size: 10, color: DIM });
  body(488, 142, '2. Where does it end?', { size: 10.5, bold: true });
  body(488, 160, '   at the last accepting state the run', { size: 10, color: DIM });
  body(488, 176, '   passed — the longest match', { size: 10, color: DIM });
  if (p > 0.3) {
    rule(488, 200, 860, 200);
    label(488, 214, 'WHAT IT DOES NOT DECIDE');
    bullets(488, 234, [
      'whether the tokens are in a legal order',
      'whether the names were declared',
      'whether the types agree',
      'whether the program is correct'
    ], p, 0.36, 0.09, { lead: 19 });
  }
  if (p > 0.66) {
    card(488, 322, 372, 96, { fill: BADDIM, stroke: BAD });
    body(504, 336, 'A lexical error is a position where', { size: 10 });
    body(504, 354, 'no token can be formed at all.', { size: 10.5, bold: true, color: BAD });
    body(504, 378, 'Every other fault belongs to another', { size: 10 });
    body(504, 396, 'phase, and that phase must report it.', { size: 10 });
  }
}

/* ---------- scene 2: the automaton ---------- */
function sceneDfa(t, sc) {
  var p = prog(t, sc);
  heading('The automaton that makes those decisions');
  subline('One table, read left to right, decides where every token ends.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE TRANSITIONS THAT MATTER');
  body(40, 100, 'S0    letter        -> id', { mono: true, size: 10 });
  body(40, 118, 'S0    digit         -> num', { mono: true, size: 10 });
  body(40, 136, 'S0    "             -> sopen', { mono: true, size: 10 });
  body(40, 154, 'S0    /             -> slash', { mono: true, size: 10 });
  body(40, 172, 'id    letter|digit  -> id', { mono: true, size: 10 });
  body(40, 190, 'num   digit         -> num', { mono: true, size: 10 });
  body(40, 208, 'sopen c             -> sbody', { mono: true, size: 10 });
  body(40, 226, 'sbody "             -> sclose', { mono: true, size: 10 });
  body(40, 244, 'eq    =             -> eqeq', { mono: true, size: 10 });
  body(40, 262, 'slash *             -> cmt', { mono: true, size: 10 });
  body(40, 280, 'cmtstar /           -> cmtend', { mono: true, size: 10 });
  if (p > 0.4) {
    rule(40, 300, 444, 300);
    label(40, 314, 'WHY 24 STATES AND 18 CLASSES');
    body(40, 334, 'A class can need several states: the', { size: 10 });
    body(40, 352, 'literal needs four, because the quote,', { size: 10 });
    body(40, 370, 'the body, an escape and the closing', { size: 10 });
    body(40, 388, 'quote are different amounts of progress.', { size: 10 });
  }
  if (p > 0.76) {
    body(40, 412, V.accStates + ' accepting states, ' + V.states + ' in all, ' + V.transCount + ' moves.', { size: 9.5, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHAT WAS CHECKED, AND HOW');
  bullets(488, 100, [
    'Deterministic: the builder refuses two',
    'targets for one character in one state.',
    '',
    'Agreement: a second matcher that never',
    'walks the table, written separately.',
    '',
    'It tries the longest prefix against a',
    'plain predicate for each class.'
  ], p, 0.05, 0.08, { lead: 18 });
  if (p > 0.46) {
    rule(488, 250, 860, 250);
    body(488, 266, V.strings3 + ' strings of length at most three', { mono: true, size: 10.5 });
    body(488, 288, V.agree3 + ' agree, ' + (V.strings3 - V.agree3) + ' disagree', { mono: true, size: 10.5, color: VAL });
    body(488, 312, CORPUS.length + ' corpus strings, ' + V.agreeCorpus + ' agree', { mono: true, size: 10.5, color: VAL });
  }
  if (p > 0.7) {
    card(488, 332, 372, 86, { fill: ACCDIM, stroke: ACC });
    body(504, 346, 'Two implementations, one answer.', { size: 10.5, bold: true, color: ACC });
    body(504, 368, 'The diagram is drawn from the table,', { size: 10 });
    body(504, 386, 'and the table is what was tested.', { size: 10 });
  }
}

/* ---------- scene 3: longest match ---------- */
function sceneMunch(t, sc) {
  var p = prog(t, sc);
  heading('Longest match, and what it decides');
  subline('The run records an accepting state, then keeps going while a longer token is possible.');

  card(24, 62, 436, 372);
  label(40, 78, 'TWO STRINGS, ONE RULE');
  body(40, 98, 'a/*b*/c', { mono: true, size: 10.5 });
  chipRow(40, 116, ['a', '/*b*/', 'c'], { size: 9.5, fill: ACCDIM, stroke: ACC });
  body(40, 146, V.packed.length + ' tokens: the comment is one token', { size: 10, color: DIM });
  body(40, 172, 'a / * b / c', { mono: true, size: 10.5 });
  chipRow(40, 190, ['a', '/', '*', 'b', '/', 'c'], { size: 9.5 });
  body(40, 220, V.spaced.length + ' tokens: the spaces remove the comment', { size: 10, color: DIM });
  if (p > 0.34) {
    rule(40, 246, 444, 246);
    label(40, 260, 'THE RUN PASSES AN ACCEPTING STATE');
    body(40, 280, 'slash accepts. star follows. the run', { size: 10 });
    body(40, 298, 'moves into the comment and remembers', { size: 10 });
    body(40, 316, 'the slash as its fallback.', { size: 10 });
    body(40, 338, 'Longest match is not "longest token that', { size: 10, color: DIM });
    body(40, 356, 'exists"; it is the longest prefix accepted.', { size: 10, color: DIM });
  }
  if (p > 0.78) {
    card(40, 378, 404, 44, { fill: BADDIM, stroke: BAD });
    body(56, 392, 'Stopping at the first accepting state is wrong.', { size: 10, color: BAD });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'A LEXER THAT STOPPED EARLY');
  body(488, 98, V.munchDiff.length + ' of the ' + CORPUS.length + ' corpus strings would change', { size: 10.5, bold: true });
  rule(488, 120, 860, 120);
  label(488, 134, 'SHORTEST MATCH WOULD READ');
  body(488, 154, 'x == 3;      =  =  (two equals)', { mono: true, size: 9.5 });
  body(488, 172, 'ifx = 1;     if  x  (a keyword)', { mono: true, size: 9.5 });
  body(488, 190, '23mm        2 3 m m  (four)', { mono: true, size: 9.5 });
  body(488, 208, 'a/*b*/c     / * b * / c  (six)', { mono: true, size: 9.5 });
  if (p > 0.42) {
    rule(488, 230, 860, 230);
    label(488, 244, 'KEYWORDS ARE NOT AN AUTOMATON MATTER');
    body(488, 264, KEYWORDS.length + ' keywords as paths: ' + V.trie + ' more states', { size: 10 });
    body(488, 284, 'the same ' + KEYWORDS.length + ' in a table: 0 states, 1 lookup', { size: 10 });
    body(488, 306, 'So the identifier is recognised first and', { size: 10, color: DIM });
    body(488, 324, 'its text is looked up afterwards. That is', { size: 10, color: DIM });
    body(488, 342, 'why ifx is an identifier and if is not.', { size: 10, color: DIM });
  }
  if (p > 0.76) {
    card(488, 362, 372, 56, { fill: ACCDIM, stroke: ACC });
    body(504, 376, 'A longer token wins even when the', { size: 10 });
    body(504, 394, 'shorter one would parse.', { size: 10, bold: true, color: ACC });
  }
}

/* ---------- scene 4: the two failures ---------- */
function sceneNoFinish(t, sc) {
  var p = prog(t, sc);
  heading('The only two ways to fail');
  subline('No move at all, or a move that can never reach an accepting state.');

  card(24, 62, 436, 372);
  label(40, 78, 'FAILURE 1 — NO MOVE FROM THE START');
  body(40, 100, 'x = 3 $ y;', { mono: true, size: 11 });
  body(40, 124, 'character ' + (V.illegal.err.pos + 1) + ' is the dollar', { size: 10, color: BAD });
  chipRow(40, 144, ['x', '=', '3'], { size: 9.5 });
  chip(200, 144, '$', { size: 9.5, fill: BADDIM, stroke: BAD, color: BAD });
  if (p > 0.26) {
    rule(40, 180, 444, 180);
    body(40, 194, 'The run never leaves the start state,', { size: 10 });
    body(40, 212, 'so there is not even a partial token.', { size: 10 });
    body(40, 234, 'Report: a character, a position, and no', { size: 10 });
    body(40, 252, 'class to name.', { size: 10 });
  }
  if (p > 0.5) {
    card(40, 274, 404, 76, { fill: BADDIM, stroke: BAD });
    body(56, 288, 'Do not write "unexpected token".', { size: 10.5, bold: true, color: BAD });
    body(56, 310, 'No token was formed, so none can be', { size: 10 });
    body(56, 328, 'named in the message.', { size: 10 });
  }
  if (p > 0.76) {
    body(40, 372, 'The same failure covers @ # ? ~ ^ ! & | %', { mono: true, size: 9.5, color: DIM });
    body(40, 392, 'and any other character no rule admits.', { size: 10, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'FAILURE 2 — A MOVE THAT CANNOT FINISH');
  body(488, 100, 'x = "abc', { mono: true, size: 11 });
  body(488, 122, 'y = 2;', { mono: true, size: 11 });
  body(488, 148, 'quote opens at character ' + (V.openQuote + 1), { size: 10 });
  body(488, 166, 'error reported at character ' + (V.unterm.err.pos + 1), { size: 10, color: BAD });
  body(488, 184, V.dist + ' characters between the two', { size: 10, color: DIM });
  if (p > 0.34) {
    rule(488, 208, 860, 208);
    body(488, 222, 'The literal cannot cross a newline, so', { size: 10 });
    body(488, 240, 'the run stops there, four characters', { size: 10 });
    body(488, 258, 'after the quote that caused it.', { size: 10 });
    body(488, 282, 'Keep both numbers: where the message', { size: 10.5, bold: true });
    body(488, 300, 'points, and where the cause sits.', { size: 10.5, bold: true });
  }
  if (p > 0.66) {
    card(488, 320, 372, 98, { fill: WARNDIM, stroke: WARN });
    body(504, 334, 'Deleting at the reported position', { size: 10 });
    body(504, 352, 'removes the newline, not the quote.', { size: 10, bold: true, color: WARN });
    body(504, 376, 'The literal is still open, and the next', { size: 10 });
    body(504, 394, 'report arrives at the end of the line.', { size: 10 });
  }
}

/* ---------- scene 5: the fallback ---------- */
function sceneFallback(t, sc) {
  var p = prog(t, sc);
  heading('The comment has a fallback, the quote does not');
  subline('Longest match needs a shorter accepted token to fall back on. A lone quote is not one.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE QUOTE HAS NOTHING TO FALL BACK ON');
  bullets(40, 98, [
    'sopen is not accepting, and nothing',
    'before it accepts either.',
    'So the run ends with no token at all:',
    'the failure is reported.'
  ], p, 0.04, 0.08, { lead: 19 });
  if (p > 0.3) {
    rule(40, 182, 444, 182);
    label(40, 196, 'THE COMMENT DOES');
    body(40, 216, '/* unterminated', { mono: true, size: 11 });
    chipRow(40, 236, V.untermComment.toks, { size: 9.5, fill: WARNDIM, stroke: WARN });
    body(40, 266, V.untermComment.toks.length + ' tokens, and no error at all', { size: 10.5, bold: true, color: WARN });
    body(40, 288, 'slash is accepting, so it is the fallback', { size: 10 });
  }
  if (p > 0.6) {
    card(40, 310, 404, 104, { fill: BADDIM, stroke: BAD });
    body(56, 324, 'Pure longest match cannot report an', { size: 10 });
    body(56, 342, 'unterminated comment.', { size: 10.5, bold: true, color: BAD });
    body(56, 366, 'It reports a division, a star, and an', { size: 10 });
    body(56, 384, 'identifier, and carries on as if nothing', { size: 10 });
    body(56, 400, 'had gone wrong.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'SO THE SCANNER DRIVER COMMITS');
  bullets(488, 98, [
    'On /* it enters the comment and does not',
    'fall back. If the closing pair never',
    'arrives, it reports the missing */ at the',
    'end of the input.',
    '',
    'That decision lives in the driver, not in',
    'the transition table.'
  ], p, 0.05, 0.08, { lead: 19 });
  if (p > 0.46) {
    rule(488, 236, 860, 236);
    body(488, 250, 'Consequence: the same two characters', { size: 10 });
    body(488, 268, 'mean different things in different', { size: 10 });
    body(488, 286, 'states, and only the state decides.', { size: 10 });
  }
  if (p > 0.68) {
    card(488, 310, 372, 104, { fill: ACCDIM, stroke: ACC });
    body(504, 324, 'A lexer is a table plus a driver.', { size: 10.5, bold: true, color: ACC });
    body(504, 348, 'The table says where a run may go;', { size: 10 });
    body(504, 366, 'the driver decides what to commit to', { size: 10 });
    body(504, 384, 'and what to report.', { size: 10 });
    body(504, 402, 'Both are part of the answer.', { size: 10 });
  }
}

/* ---------- scene 6: lexical, syntactic, semantic ---------- */
function sceneClassify(t, sc) {
  var p = prog(t, sc);
  heading('Lexical, syntactic, semantic');
  subline('Three tests, three phases. The test decides the label, not the symptom.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE THREE TESTS');
  body(40, 100, 'LEXICAL', { size: 9.5, bold: true, color: ACC });
  body(40, 118, 'can this character be part of a token?', { size: 10 });
  body(40, 144, 'SYNTACTIC', { size: 9.5, bold: true, color: ACC });
  body(40, 162, 'may these tokens appear in this order?', { size: 10 });
  body(40, 188, 'SEMANTIC', { size: 9.5, bold: true, color: ACC });
  body(40, 206, 'do the types and the names obey?', { size: 10 });
  if (p > 0.36) {
    rule(40, 230, 444, 230);
    label(40, 244, 'WHERE EACH ONE IS FOUND');
    body(40, 264, 'a bad character or an open literal', { size: 10, color: DIM });
    body(40, 282, 'a missing semicolon, a wrong order', { size: 10, color: DIM });
    body(40, 300, 'an undeclared name, a type mismatch', { size: 10, color: DIM });
  }
  if (p > 0.62) {
    card(40, 324, 404, 90, { fill: ACCDIM, stroke: ACC });
    body(56, 338, 'A well-formed token in the wrong place', { size: 10 });
    body(56, 356, 'is never a lexical error.', { size: 10.5, bold: true, color: ACC });
    body(56, 380, 'A misspelt keyword is an identifier, and', { size: 10 });
    body(56, 398, 'the lexer has nothing to complain about.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'GATE CSE 2026 SET 1, QUESTION 27');
  body(488, 98, 'S1  char *str1 = "Hello;', { mono: true, size: 9.5, color: BAD });
  body(488, 116, 'S2  char *str2 = "Hello;";', { mono: true, size: 9.5, color: VAL });
  body(488, 134, 'S3  int *str3 = "Hello";', { mono: true, size: 9.5, color: VAL });
  body(488, 156, 'S1 lexical, S3 semantic — answer (C)', { size: 10.5, bold: true, color: ACC });
  body(488, 176, 'S2 is fine: inside the quotes the', { size: 10, color: DIM });
  body(488, 194, 'semicolon is just a character.', { size: 10, color: DIM });
  if (p > 0.4) {
    rule(488, 218, 860, 218);
    label(488, 232, 'AND THE PARSER\'S OWN CASE');
    body(488, 252, '3 + 4 ;', { mono: true, size: 11 });
    body(488, 274, 'every token is well formed', { size: 10, color: VAL });
    body(488, 292, 'a statement cannot start with a number', { size: 10, color: BAD });
    body(488, 312, 'so the parser reports token 1', { size: 10, color: BAD });
  }
  if (p > 0.72) {
    card(488, 334, 372, 84, { fill: SURF2, stroke: BORDER });
    body(504, 348, V.classify.length + ' corpus strings were classified this way.', { size: 10 });
    body(504, 368, 'Two lexical, three syntactic, two clean.', { size: 10 });
    body(504, 388, 'Each label came from the phase that saw it.', { size: 10, color: DIM });
  }
}

/* ---------- scene 7: panic mode ---------- */
function scenePanic(t, sc) {
  var p = prog(t, sc);
  heading('Panic mode in a lexer: delete to a token start');
  subline('There is no stack to pop. The only thing recovery can change is the position.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE RULE');
  bullets(40, 98, [
    'At the failing position, delete characters',
    'until one appears that can begin a token,',
    'then resume the scan there.'
  ], p, 0.03, 0.08, { lead: 19 });
  if (p > 0.22) {
    rule(40, 168, 444, 168);
    body(40, 182, V.panic[0].src, { mono: true, size: 11 });
    body(40, 204, 'delete 1 character, the dollar', { size: 10, color: BAD });
    body(40, 224, 'the space can begin whitespace', { size: 10, color: DIM });
    chipRow(40, 244, V.panic[0].toks, { size: 9.5, fill: ACCDIM, stroke: ACC });
    body(40, 274, '1 error, 1 deletion, and the line survives', { size: 10 });
  }
  if (p > 0.52) {
    rule(40, 298, 444, 298);
    body(40, 312, V.panic[1].src, { mono: true, size: 11 });
    body(40, 334, 'delete 3 characters in one pass', { size: 10, color: BAD });
    chipRow(40, 354, V.panic[1].toks, { size: 9.5, fill: ACCDIM, stroke: ACC });
    body(40, 384, '1 error, 3 deletions: one message', { size: 10 });
    body(40, 404, 'covers the whole run of junk', { size: 10, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHAT RECOVERY CANNOT DO');
  bullets(488, 98, [
    'It cannot restore the deleted characters.',
    'It cannot report one message per character.',
    'It cannot edit the tokens already emitted.'
  ], p, 0.05, 0.09, { lead: 19 });
  if (p > 0.36) {
    rule(488, 178, 860, 178);
    label(488, 192, 'THE TWO COUNTS');
    body(488, 214, 'characters deleted', { size: 11, bold: true, color: ACC });
    body(488, 236, V.panic[0].deletes + ' and ' + V.panic[1].deletes + ' on the two inputs', { size: 10 });
    body(488, 262, 'errors reported', { size: 11, bold: true, color: ACC });
    body(488, 284, '1 and 1 on the same two inputs', { size: 10 });
  }
  if (p > 0.62) {
    rule(488, 310, 860, 310);
    body(488, 324, 'Recovery counts characters; the report', { size: 10 });
    body(488, 342, 'counts positions. That is why a compiler', { size: 10 });
    body(488, 360, 'prints one line for a run of junk.', { size: 10 });
  }
  if (p > 0.8) {
    card(488, 378, 372, 40, { fill: WARNDIM, stroke: WARN });
    body(504, 390, 'Nothing is pushed and nothing is popped.', { size: 10, color: WARN });
  }
}

/* ---------- scene 8: the guard ---------- */
function sceneGuard(t, sc) {
  var p = prog(t, sc);
  heading('The rule loops, so it needs a guard');
  subline('At an unterminated literal the offending character can begin whitespace.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE PASS THAT DELETES NOTHING');
  body(40, 98, 'x = "abc', { mono: true, size: 11 });
  body(40, 120, 'y = 2;', { mono: true, size: 11 });
  body(40, 144, 'error at character ' + (V.unterm.err.pos + 1) + ', a newline', { size: 10, color: BAD });
  body(40, 166, 'a newline can begin whitespace', { size: 10 });
  body(40, 184, 'so the rule deletes 0 characters', { size: 10, color: BAD });
  body(40, 206, 'and the same error returns for ever', { size: 10, color: BAD });
  if (p > 0.32) {
    rule(40, 230, 444, 230);
    label(40, 244, 'THE GUARD');
    body(40, 264, 'if a pass deletes nothing, delete the', { size: 10.5, bold: true });
    body(40, 282, 'offending character itself', { size: 10.5, bold: true });
    body(40, 306, 'One line, and the procedure terminates.', { size: 10, color: DIM });
  }
  if (p > 0.6) {
    card(40, 330, 404, 84, { fill: ACCDIM, stroke: ACC });
    body(56, 344, 'Every recovery rule needs a guard, for', { size: 10 });
    body(56, 362, 'the same reason: it is written to keep', { size: 10 });
    body(56, 380, 'as much input as possible, and sometimes', { size: 10 });
    body(56, 398, 'that means keeping all of it.', { size: 10 });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHAT THE GUARD LEAVES');
  chipRow(488, 98, V.panic[2].toks, { size: 9.5, fill: BADDIM, stroke: BAD });
  body(488, 128, '1 report, 1 deletion, and the literal', { size: 10 });
  body(488, 146, 'has silently disappeared', { size: 10, color: BAD });
  body(488, 168, 'the parser rejects the result', { size: 10, color: DIM });
  if (p > 0.36) {
    rule(488, 192, 860, 192);
    label(488, 206, 'SYNC TO A DELIMITER INSTEAD');
    body(488, 226, V.sync.src, { mono: true, size: 10.5 });
    chipRow(488, 246, V.sync.toks, { size: 9.5 });
    body(488, 276, V.sync.skipped + ' characters skipped, the semicolon kept', { size: 10 });
    body(488, 298, 'the stream keeps its shape', { size: 10, color: VAL });
  }
  if (p > 0.7) {
    card(488, 320, 372, 98, { fill: SURF2, stroke: BORDER });
    body(504, 334, 'Deleting the delimiter too would', { size: 10 });
    body(504, 352, 'destroy the boundary the parser needs,', { size: 10 });
    body(504, 370, 'and turn one error into two.', { size: 10 });
    body(504, 394, 'The delimiter is kept, not skipped.', { size: 10, bold: true, color: ACC });
  }
}

/* ---------- scene 9: the counting question ---------- */
function sceneCount(t, sc) {
  var p = prog(t, sc);
  heading('The counting question, worked');
  subline('GATE CSE 2026 Set 2 gives the rules and asks for one integer.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE RULES THE QUESTION GIVES');
  body(40, 98, 'letter  [A-Za-z]      digit  [0-9]', { mono: true, size: 9.5 });
  body(40, 116, 'id      letter(letter|digit)*', { mono: true, size: 9.5 });
  body(40, 134, 'number  digit+        ws  (blank|tab|nl)+', { mono: true, size: 9.5 });
  body(40, 156, 'no keywords, no operators, no literals', { size: 10, color: DIM });
  if (p > 0.2) {
    rule(40, 178, 444, 178);
    label(40, 192, 'THE STRING');
    body(40, 210, 'x1  23mm  78  y  7z', { mono: true, size: 10.5 });
    body(40, 226, 'zz5  14A  8H  AaYcD', { mono: true, size: 10.5 });
  }
  if (p > 0.4) {
    rule(40, 248, 444, 248);
    label(40, 262, 'TOKENS PER WORD');
    var y = 282, i;
    for (i = 0; i < V.gate.words.length; i++) {
      var col = i % 2, row = Math.floor(i / 2);
      body(40 + col * 210, y + row * 18, V.gate.words[i] + '  ' + V.gate.perWord[i], { mono: true, size: 9.5 });
    }
  }
  if (p > 0.78) {
    body(40, 380, 'sum 1+2+1+1+2+1+2+2+1 = ' + V.gate.count, { mono: true, size: 11, bold: true, color: ACC });
    body(40, 404, 'the scanner produced exactly this', { size: 9.5, color: DIM });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'WHY THE WORD COUNT IS WRONG');
  body(488, 98, V.gate.wordCount + ' words, ' + V.gate.count + ' tokens', { size: 13, bold: true, color: ACC });
  body(488, 126, '23mm is number 23 then identifier mm', { size: 10 });
  body(488, 146, 'an identifier must begin with a letter', { size: 10, color: DIM });
  body(488, 168, 'so after digits, a letter starts again', { size: 10, color: DIM });
  if (p > 0.34) {
    rule(488, 194, 860, 194);
    body(488, 208, 'x1 is one token and 23mm is two.', { size: 10 });
    body(488, 226, 'The two directions are not symmetric,', { size: 10 });
    body(488, 244, 'and that asymmetry is the question.', { size: 10 });
  }
  if (p > 0.58) {
    card(488, 268, 372, 82, { fill: BADDIM, stroke: BAD });
    body(504, 282, 'Answering ' + V.gate.wordCount + ' is the trap.', { size: 10.5, bold: true, color: BAD });
    body(504, 304, 'Words are separated by blanks; tokens', { size: 10 });
    body(504, 322, 'are separated by nothing at all.', { size: 10 });
    body(504, 340, 'The scanner decides where each ends.', { size: 10 });
  }
  if (p > 0.8) {
    body(488, 372, 'Answer: ' + V.gate.count, { size: 13, bold: true, color: VAL });
    body(488, 398, 'recomputed here, not quoted from a key', { size: 9.5, color: DIM });
  }
}

/* ---------- scene 10: the procedure ---------- */
function sceneProcedure(t, sc) {
  var p = prog(t, sc);
  heading('The five steps and the four traps');
  subline('The order matters: each step uses the one before it.');

  card(24, 62, 436, 372);
  label(40, 78, 'THE FIVE STEPS');
  bullets(40, 98, [
    '1. Scan with longest match, remembering the',
    '   last accepting state.',
    '2. At the failure, name the character and',
    '   the position.',
    '3. Decide: no move at all, or a run that',
    '   cannot finish.',
    '4. Recover — delete to a token start, or',
    '   sync to a delimiter — with a guard.',
    '5. Report, then resume at the guarded point.'
  ], p, 0.03, 0.07, { lead: 18 });
  if (p > 0.62) {
    rule(40, 280, 444, 280);
    body(40, 296, 'What the message needs:', { size: 9.5, color: DIM });
    body(40, 316, 'character ' + (V.illegal.err.pos + 1) + ', position, kind', { mono: true, size: 10 });
    body(40, 338, 'On x = 3 $ y; that is the dollar, and', { size: 10 });
    body(40, 356, 'the kind is "no move at all".', { size: 10 });
  }
  if (p > 0.82) {
    card(40, 376, 404, 44, { fill: ACCDIM, stroke: ACC });
    body(56, 390, 'A repaired program is not a correct program.', { size: 10, color: ACC });
  }

  card(472, 62, 404, 372);
  label(488, 78, 'THE FOUR TRAPS');
  body(488, 98, '1. Counting words as tokens.', { size: 10 });
  body(488, 116, '   ' + V.gate.wordCount + ' words, ' + V.gate.count + ' tokens.', { size: 9.5, color: DIM });
  body(488, 140, '2. Calling a misplaced token lexical.', { size: 10 });
  body(488, 158, '   On 3 + 4 ; every token is fine.', { size: 9.5, color: DIM });
  body(488, 182, '3. Reading the reported position as the', { size: 10 });
  body(488, 200, '   cause. ' + V.dist + ' characters apart here.', { size: 9.5, color: DIM });
  body(488, 224, '4. Forgetting the comment\'s fallback.', { size: 10 });
  body(488, 242, '   ' + V.untermComment.toks.length + ' tokens, no error.', { size: 9.5, color: DIM });
  if (p > 0.6) {
    rule(488, 266, 860, 266);
    card(488, 280, 372, 138, { fill: SURF2, stroke: BORDER });
    body(504, 294, 'The two counts to carry:', { size: 9.5, color: DIM });
    body(504, 316, 'characters deleted, errors reported', { size: 11, bold: true, color: ACC });
    body(504, 342, 'Panic mode changes the position;', { size: 10 });
    body(504, 360, 'syncing changes it further; neither', { size: 10 });
    body(504, 378, 'edits tokens already emitted.', { size: 10 });
    body(504, 400, 'A lexer has no stack to pop.', { size: 10, bold: true });
  }
}

var SCENES = {
  stream: sceneStream, dfa: sceneDfa, munch: sceneMunch, nofinish: sceneNoFinish,
  fallback: sceneFallback, classify: sceneClassify, panic: scenePanic,
  guard: sceneGuard, count: sceneCount, proc: sceneProcedure
};

function drawFrame(painter) {
  P = painter;
  if (!P || !P.clear) return;
  P.clear();
  var t = K ? K.state.elapsed : 0;
  var scs = (window.LESSON_TIMELINE && window.LESSON_TIMELINE.scenes) || [];
  var idx = 0, i;
  for (i = scs.length - 1; i >= 0; i--) if (t >= scs[i].start - 1e-6) { idx = i; break; }
  var sc = scs[idx];
  if (!sc) return;
  var fn = SCENES[sc.id] || SCENES.stream;
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

window.__MODEL = { V: V, CHECKS: CHECKS };
window.__lessonChecks = CHECKS;

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
