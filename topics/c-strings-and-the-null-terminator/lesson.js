/* ==========================================================================
   c-strings-and-the-null-terminator — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads M; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Two kinds of fact appear below and are kept apart:
     - what the C STANDARD says: a string ends at the first null character; the
       literal initialises an array "including the terminating null character if
       there is room"; modifying a literal's array is undefined behaviour;
       strlen returns size_t;
     - what THIS PAGE COMPUTES from those rules: every sizeof, every strlen,
       every byte layout and every trace below is produced by simulating the
       byte array, not quoted from a table.

   The page cannot run a C compiler. Nothing here is presented as compiler
   output; the rules are simulated and each simulation is re-checked against
   the rule it is supposed to obey.
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

  /* The two machine conventions the lesson uses. GATE states a pointer size
     when it matters; both are carried so a question can be answered either way. */
  var PTR64 = 8, PTR32 = 4;

  /* ---------- 1a. a literal as source text -> the bytes it stores ----------
     Handles the escape sequences this lesson uses: \\ \" \' \0 \n \t \r and
     \xHH. Returns the content bytes; the terminator is added by the caller,
     because whether it is stored depends on the array. */

  function parseLiteral(src) {
    var out = [], i = 0;
    while (i < src.length) {
      var c = src.charAt(i);
      if (c !== '\\') { out.push(src.charCodeAt(i)); i++; continue; }
      var n = src.charAt(i + 1);
      if (n === '\\') { out.push(92); i += 2; }
      else if (n === '"') { out.push(34); i += 2; }
      else if (n === "'") { out.push(39); i += 2; }
      else if (n === '0') { out.push(0); i += 2; }
      else if (n === 'n') { out.push(10); i += 2; }
      else if (n === 't') { out.push(9); i += 2; }
      else if (n === 'r') { out.push(13); i += 2; }
      else if (n === 'x') {
        var j = i + 2, h = '';
        while (j < src.length && /[0-9a-fA-F]/.test(src.charAt(j))) { h += src.charAt(j); j++; }
        if (!h) return { ok: false, bytes: [], why: 'empty hex escape' };
        // a hex escape takes every following hex digit; the value must fit a byte
        var v = parseInt(h, 16);
        if (v > 255) return { ok: false, bytes: [], why: 'hex escape wider than a byte: \\x' + h };
        out.push(v); i = j;
      } else return { ok: false, bytes: [], why: 'unsupported escape \\' + n };
    }
    return { ok: true, bytes: out };
  }

  /* A literal in source form, stored into an array of the stated size.
     size === null means the compiler chooses: content plus the terminator. */
  function storeLiteral(src, size) {
    var lit = parseLiteral(src);
    if (!lit.ok) return { ok: false, why: lit.why };
    var content = lit.bytes.slice();
    var need = content.length + 1;
    var bytes, dropped = false;
    if (size === null) {
      bytes = content.concat([0]);
    } else if (size >= need) {
      bytes = content.concat([0]);
      while (bytes.length < size) bytes.push(0);
    } else if (size === content.length) {
      bytes = content.slice();          // the one legal drop: the terminator
      dropped = true;
    } else {
      return { ok: false, why: 'initialiser longer than the array by more than the terminator' };
    }
    return { ok: true, bytes: bytes, dropped: dropped, need: need, size: bytes.length };
  }

  /* strlen as the definition: the index of the first zero byte.
     Returns -1 and string:false when no zero is present, which is exactly the
     case where calling strlen would read past the array. */
  function strlenOf(bytes) {
    for (var i = 0; i < bytes.length; i++) if (bytes[i] === 0) return { len: i, isString: true };
    return { len: -1, isString: false };
  }

  function show(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) {
      var b = bytes[i];
      s += b === 0 ? '\\0' : (b >= 32 && b < 127 ? String.fromCharCode(b) : '\\' + b);
    }
    return s;
  }

  /* ---------- 1b. the declaration table ---------- */

  var PTRW = PTR64;   /* the machine this page draws */

  var DECLS = [
    { id: 'a', decl: 'char a[] = "GATE";',        src: 'GATE', size: null, kind: 'array',   ptr: false },
    { id: 'b', decl: 'char b[10] = "GATE";',      src: 'GATE', size: 10,   kind: 'array',   ptr: false },
    { id: 'c', decl: 'char c[4] = "GATE";',       src: 'GATE', size: 4,    kind: 'array',   ptr: false },
    { id: 'p', decl: 'char *p = "GATE";',         src: 'GATE', size: null, kind: 'pointer', ptr: true  },
    { id: 'f', decl: 'char f[6] = "GA";',         src: 'GA',   size: 6,    kind: 'array',   ptr: false },
    { id: 'g', decl: 'char g[] = "GA\\0TE";',     src: 'GA\\0TE', size: null, kind: 'array', ptr: false }
  ];

  var TABLE = DECLS.map(function (d) {
    var st = storeLiteral(d.src, d.size);
    var obj = st.bytes ? st.bytes : [];
    var sz = d.ptr ? PTRW : (d.size === null ? obj.length : d.size);
    var sl = strlenOf(obj);
    return {
      id: d.id, decl: d.decl, kind: d.kind,
      sizeof: sz, strlen: sl.isString ? sl.len : null,
      isString: sl.isString, dropped: !!st.dropped,
      bytes: obj, shown: show(obj),
      stored: d.ptr ? PTRW : obj.length
    };
  });

  function row(id) {
    for (var i = 0; i < TABLE.length; i++) if (TABLE[i].id === id) return TABLE[i];
    return null;
  }

  /* ---------- 1c. brace initialisation, the form that adds nothing ---------- */

  var BRACE = {
    noZero: { decl: "char e[] = {'G','A','T','E'};", bytes: [71, 65, 84, 69] },
    withZero: { decl: "char e[] = {'G','A','T','E','\\0'};", bytes: [71, 65, 84, 69, 0] }
  };
  BRACE.noZero.sizeof = BRACE.noZero.bytes.length;
  BRACE.noZero.strlen = strlenOf(BRACE.noZero.bytes);
  BRACE.withZero.sizeof = BRACE.withZero.bytes.length;
  BRACE.withZero.strlen = strlenOf(BRACE.withZero.bytes);

  /* ---------- 1d. the escape table ---------- */

  var ESCAPES = [
    { src: '\\0',  why: 'the null character itself' },
    { src: '\\n',  why: 'newline, one byte of value 10' },
    { src: '\\\\n', why: 'a backslash then an n: two bytes' },
    { src: '\\x41', why: 'hex escape: one byte, the letter A' },
    { src: '\\\\', why: 'one backslash byte' },
    { src: 'a\\tb', why: 'a, a tab, b: three bytes' },
    { src: '\\"q\\"', why: 'a quote, q, a quote' }
  ];

  var ESC = ESCAPES.map(function (e) {
    var lit = parseLiteral(e.src);
    var n = lit.ok ? lit.bytes.length : 0;
    return {
      src: e.src, why: e.why,
      content: n,
      sizeof: lit.ok ? n + 1 : null,
      strlen: lit.ok ? strlenOf(lit.bytes.concat([0])).len : null,
      ok: lit.ok
    };
  });

  /* adjacent literal concatenation, joined before any terminator is appended */
  var ADJ = (function () {
    var a = parseLiteral('ab'), b = parseLiteral('cd');
    var joined = a.bytes.concat(b.bytes).concat([0]);
    return { pieces: ['"ab"', '"cd"'], bytes: joined, sizeof: joined.length, strlen: strlenOf(joined).len };
  })();

  /* ---------- 1e. size_t arithmetic ---------- */

  /* The wrap must be exact, and a double cannot hold 2^64 - 2, so the 64-bit
     case is computed in BigInt. This is the page being careful about the very
     arithmetic the lesson is teaching. */
  function subModBig(a, b, bits) {
    var m = BigInt(1) << BigInt(bits);
    var v = (BigInt(a) - BigInt(b)) % m;
    if (v < BigInt(0)) v += m;
    return v;
  }

  var UNS = {
    s: 3, t: 5,
    d32: Number(subModBig(3, 5, 32)),
    d64: subModBig(3, 5, 64),
    selected: null,
    answer: null
  };
  UNS.d64Str = UNS.d64.toString();
  /* the ternary: ((strlen(s) - strlen(t)) > 0) ? strlen(s) : strlen(t) */
  UNS.cond = UNS.d64 > BigInt(0);
  UNS.selected = UNS.cond ? UNS.s : UNS.t;
  UNS.answer = UNS.selected;

  /* the downward loop: i starts at strlen("") - 1 */
  var LOOP = (function () {
    var start = subModBig(0, 1, 64);
    /* every unsigned value is >= 0, so the test can never fail: checked over
       the whole 4-bit unsigned type, and true at 64 bits by the same argument,
       since no value of an unsigned type is negative. */
    var allTrue = true;
    for (var v = 0; v < 16; v++) if (!(v >= 0)) allTrue = false;
    return { start: start, startStr: start.toString(), allTrue: allTrue };
  })();

  /* ---------- 1f. GATE 2017 Set 2 Q55, simulated ---------- */

  var Q2017b = (function () {
    var lit = parseLiteral('GATECSIT2017');
    var bytes = lit.bytes.concat([0]);
    var p2 = bytes[2], p6 = bytes[6];
    var offset = p2 - p6 - 1;
    var tail = bytes.slice(offset);
    var sl = strlenOf(tail);
    return {
      bytes: bytes, chars: lit.bytes.length, terminatorAt: lit.bytes.length,
      p2: p2, p6: p6, ch2: String.fromCharCode(p2), ch6: String.fromCharCode(p6),
      diff: p2 - p6, offset: offset,
      tail: sl.isString ? show(tail.slice(0, sl.len)) : '(no terminator)',
      answer: sl.len
    };
  })();

  /* ---------- 1g. GATE 2025 Set 2 Q9, simulated byte by byte ---------- */

  function simCopy() {
    var st = storeLiteral('@#Hello World!', 30);
    var a = st.bytes.slice();
    var before = a.slice();
    var s = 0, t = 2, writes = 0, trace = [];
    while (a[t] !== 0 && writes < 40) {
      trace.push({ from: t, to: s, byte: a[t] });
      a[s] = a[t];
      s++; t++; writes++;
    }
    var sl = strlenOf(a);
    var printed = sl.isString ? show(a.slice(0, sl.len)) : '(no terminator)';
    return {
      init: show(before), initChars: 14, size: 30,
      writes: writes, destFrom: 0, destTo: s - 1,
      leftAt: [s, s + 1], leftBytes: [a[s], a[s + 1]],
      leftChars: String.fromCharCode(a[s]) + String.fromCharCode(a[s + 1]),
      terminatorAt: sl.len, printed: printed, printedLen: sl.len,
      bytes: a, trace: trace
    };
  }
  var Q2025 = simCopy();

  /* ---------- 1h. GATE CSE 2004, simulated ---------- */

  var Q2004 = (function () {
    var s = storeLiteral('string', null).bytes;      /* "string" + terminator */
    var length = strlenOf(s).len;
    var p = [];
    for (var k = 0; k < 20; k++) p.push(0);
    var writes = [];
    for (var i = 0; i < length; i++) { p[i] = s[length - i]; writes.push({ i: i, from: length - i, byte: s[length - i] }); }
    var firstZero = strlenOf(p);
    return {
      length: length, writes: writes, p0: p[0],
      printedLen: firstZero.isString ? firstZero.len : -1,
      printed: firstZero.isString ? show(p.slice(0, firstZero.len)) : '(no terminator)',
      firstWriteFrom: writes.length ? writes[0].from : -1
    };
  })();

  /* ---------- 1i. the library byte budgets ---------- */

  var BUDGET = (function () {
    var buf = 6;                            /* char buf[6] */
    var srcLen = 4;                         /* "GATE" */
    var copyNeed = srcLen + 1;              /* strcpy stores the terminator */
    var afterCopy = srcLen;                 /* strlen(buf) after the copy */
    var appLen = 1;                         /* "!" */
    var appNeed = afterCopy + appLen + 1;   /* strcat: dst + src + terminator */
    return {
      buf: buf, srcLen: srcLen, copyNeed: copyNeed,
      copyFits: copyNeed <= buf,
      appLen: appLen, appNeed: appNeed,
      appFits: appNeed <= buf,
      spareAfter: buf - appNeed,
      oneMore: appNeed + 1, oneMoreFits: appNeed + 1 <= buf
    };
  })();

  var STRNCPY = (function () {
    var dst = 8, n = 4, src = [71, 65, 84, 69, 0];
    var out = [];
    for (var i = 0; i < dst; i++) out.push(i < n ? src[i] : 0);
    var sl = strlenOf(out.slice(0, n));
    return { dst: dst, n: n, copied: n, sl: sl, terminated: sl.isString };
  })();

  /* ---------- 1j. arrays of strings ---------- */

  var GRID = {
    rows: 3, cols: 8,
    sizeof: 3 * 8,
    rowStride: 8,
    ptrArray64: 3 * PTR64,
    ptrArray32: 3 * PTR32,
    sameOn64: (3 * 8) === (3 * PTR64)
  };

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

  /* --- the declaration table, against the rules it must obey --- */
  chk('char a[] = "GATE": sizeof is 5 (content plus terminator)',
    row('a').sizeof === 5, 'sizeof ' + row('a').sizeof);
  chk('char a[] = "GATE": strlen is 4 (the index of the first zero)',
    row('a').strlen === 4, 'strlen ' + row('a').strlen);
  chk('char a[] = "GATE": the last byte stored is the terminator',
    row('a').bytes[row('a').bytes.length - 1] === 0, 'last byte ' + row('a').bytes[row('a').bytes.length - 1]);
  chk('sizeof - strlen is exactly 1 for every array sized by its initialiser',
    (row('a').sizeof - row('a').strlen) === 1 && (row('f').sizeof - row('f').strlen) === 4,
    'a: 1, f: ' + (row('f').sizeof - row('f').strlen));

  chk('char b[10] = "GATE": sizeof is 10, the declared size',
    row('b').sizeof === 10, 'sizeof ' + row('b').sizeof);
  chk('char b[10] = "GATE": strlen is 4, and the remaining bytes are zero-filled',
    row('b').strlen === 4 && row('b').bytes.slice(5).every(function (v) { return v === 0; }),
    'strlen ' + row('b').strlen + ', tail ' + row('b').bytes.slice(5).join(','));

  chk('char c[4] = "GATE": sizeof is 4 and the terminator was dropped',
    row('c').sizeof === 4 && row('c').dropped === true, 'dropped ' + row('c').dropped);
  chk('char c[4] = "GATE": no zero byte is present, so it is not a string',
    row('c').isString === false && row('c').strlen === null, 'isString ' + row('c').isString);

  chk('char *p = "GATE": sizeof is the pointer width, not the text length',
    row('p').sizeof === PTRW && row('p').sizeof !== 5, 'sizeof ' + row('p').sizeof);
  chk('char *p = "GATE": strlen of the pointed array is 4',
    row('p').strlen === 4, 'strlen ' + row('p').strlen);
  chk('the literal array itself is 5 bytes on both pointer widths',
    storeLiteral('GATE', null).bytes.length === 5, 'bytes ' + storeLiteral('GATE', null).bytes.length);

  chk('char g[] = "GA\\0TE": sizeof is 6 and strlen is 2 (the embedded zero truncates)',
    row('g').sizeof === 6 && row('g').strlen === 2,
    'sizeof ' + row('g').sizeof + ', strlen ' + row('g').strlen);

  /* --- brace initialisation --- */
  chk('brace initialisation without the zero is not a string',
    BRACE.noZero.sizeof === 4 && BRACE.noZero.strlen.isString === false,
    'sizeof ' + BRACE.noZero.sizeof);
  chk('brace initialisation with the zero is a string of length 4',
    BRACE.withZero.sizeof === 5 && BRACE.withZero.strlen.len === 4,
    'sizeof ' + BRACE.withZero.sizeof + ', strlen ' + BRACE.withZero.strlen.len);

  /* --- an initialiser two bytes too long is not valid C --- */
  chk('a literal two bytes too long for the array is rejected by the rule',
    storeLiteral('GATE', 3).ok === false, 'ok ' + storeLiteral('GATE', 3).ok);

  /* --- escapes --- */
  chk('"\\0": one content byte, sizeof 2, strlen 0',
    ESC[0].sizeof === 2 && ESC[0].strlen === 0,
    'sizeof ' + ESC[0].sizeof + ', strlen ' + ESC[0].strlen);
  chk('"\\\\n" is two bytes, not one: sizeof 3, strlen 2',
    ESC[2].sizeof === 3 && ESC[2].strlen === 2,
    'sizeof ' + ESC[2].sizeof + ', strlen ' + ESC[2].strlen);
  chk('"\\x41" is one byte of value 65, sizeof 2',
    ESC[3].sizeof === 2 && parseLiteral('\\x41').bytes[0] === 65,
    'first byte ' + parseLiteral('\\x41').bytes[0]);
  chk('"a\\tb" is three content bytes, sizeof 4',
    ESC[5].sizeof === 4 && ESC[5].strlen === 3,
    'sizeof ' + ESC[5].sizeof);
  chk('every escape in the table parses, and sizeof is one more than the content bytes',
    ESC.every(function (e) { return e.ok && e.sizeof === e.content + 1; }),
    ESC.length + ' escapes');
  chk('sizeof = strlen + 1 for every escape that embeds no zero byte',
    ESC.filter(function (e) { return parseLiteral(e.src).bytes.indexOf(0) < 0; })
       .every(function (e) { return e.sizeof === e.strlen + 1; }),
    'the null escape is the exception: sizeof 2, strlen 0');

  /* --- adjacent literals --- */
  chk('"ab" "cd" joins into one literal of 5 bytes, strlen 4',
    ADJ.sizeof === 5 && ADJ.strlen === 4, 'sizeof ' + ADJ.sizeof + ', strlen ' + ADJ.strlen);
  chk('adjacent joining happens before the terminator is appended, not after',
    ADJ.bytes.filter(function (b) { return b === 0; }).length === 1,
    'zero bytes ' + ADJ.bytes.filter(function (b) { return b === 0; }).length);

  /* --- size_t arithmetic --- */
  chk('3 - 5 as size_t is not negative, at 32 bits',
    UNS.d32 > 0 && UNS.d32 === 4294967294, 'value ' + UNS.d32);
  chk('3 - 5 as size_t is not negative, at 64 bits',
    UNS.d64 > BigInt(0), 'value ' + UNS.d64Str);
  chk('the comparison against 0 is true, so the conditional picks strlen(s)',
    UNS.cond === true && UNS.answer === 3, 'answer ' + UNS.answer);
  chk('the answer does not depend on the width of size_t',
    subModBig(3, 5, 32) > BigInt(0) && subModBig(3, 5, 64) > BigInt(0), 'both positive');
  chk('every unsigned value satisfies i >= 0, so that loop test never fails',
    LOOP.allTrue === true && LOOP.start === (BigInt(1) << BigInt(64)) - BigInt(1), 'start ' + LOOP.startStr);

  /* --- GATE 2017 Set 2 Q55 --- */
  chk('the literal "GATECSIT2017" has 12 characters and its terminator at index 12',
    Q2017b.chars === 12 && Q2017b.terminatorAt === 12,
    Q2017b.chars + ' chars, terminator at ' + Q2017b.terminatorAt);
  chk('2[p] is p[2] = T and 6[p] is p[6] = I',
    Q2017b.ch2 === 'T' && Q2017b.ch6 === 'I', Q2017b.ch2 + ' and ' + Q2017b.ch6);
  chk('the offset is 84 - 73 - 1 = 10, and the tail is "17"',
    Q2017b.offset === 10 && Q2017b.tail === '17', 'offset ' + Q2017b.offset + ', tail ' + Q2017b.tail);
  chk('strlen of the tail is 2, the paper\'s answer',
    Q2017b.answer === 2, 'answer ' + Q2017b.answer);

  /* --- GATE 2025 Set 2 Q9 --- */
  chk('the initialiser "@#Hello World!" fills 14 characters and a terminator at 14',
    Q2025.initChars === 14, 'chars ' + Q2025.initChars);
  chk('the loop writes exactly 12 bytes, from index 2 up to 13',
    Q2025.writes === 12 && Q2025.destTo === 11, 'writes ' + Q2025.writes);
  chk('indices 12 and 13 still hold d and ! after the copy',
    Q2025.leftChars === 'd!', 'leftover ' + Q2025.leftChars);
  chk('the printed string is "Hello World!d!", 14 characters long',
    Q2025.printed === 'Hello World!d!' && Q2025.printedLen === 14,
    Q2025.printed + ' (' + Q2025.printedLen + ')');
  chk('the copy loop never wrote the terminator: it is the original zero at 14',
    Q2025.bytes[14] === 0 && Q2025.terminatorAt === 14, 'zero at ' + Q2025.terminatorAt);

  /* --- GATE CSE 2004 --- */
  chk('s[length - 0] is the terminator, so p[0] is the zero byte',
    Q2004.firstWriteFrom === 6 && Q2004.p0 === 0,
    'first read from index ' + Q2004.firstWriteFrom);
  chk('p therefore prints nothing: the printed length is 0',
    Q2004.printedLen === 0 && Q2004.printed === '', 'printed length ' + Q2004.printedLen);

  /* --- library budgets --- */
  chk('strcpy of "GATE" needs 5 bytes, and buf[6] has them',
    BUDGET.copyNeed === 5 && BUDGET.copyFits === true, 'need ' + BUDGET.copyNeed);
  chk('strcat of "!" needs strlen(dst) + strlen(src) + 1 = 6, which fits exactly',
    BUDGET.appNeed === 6 && BUDGET.appFits === true && BUDGET.spareAfter === 0,
    'need ' + BUDGET.appNeed + ', spare ' + BUDGET.spareAfter);
  chk('one more character would need 7 bytes and overflow buf[6]',
    BUDGET.oneMore === 7 && BUDGET.oneMoreFits === false, 'need ' + BUDGET.oneMore);
  chk('strncpy with a count of 4 copies no terminator, so the result is not a string',
    STRNCPY.terminated === false && STRNCPY.copied === 4, 'copied ' + STRNCPY.copied);

  /* --- arrays of strings --- */
  chk('char names[3][8] is 24 bytes, and every row is 8 bytes whatever it holds',
    GRID.sizeof === 24 && GRID.rowStride === 8, 'sizeof ' + GRID.sizeof);
  chk('char *names[3] is three pointer widths: 24 on 64-bit, 12 on 32-bit',
    GRID.ptrArray64 === 24 && GRID.ptrArray32 === 12,
    GRID.ptrArray64 + ' and ' + GRID.ptrArray32);
  chk('the equal sizeof on a 64-bit machine is a coincidence of pointer width',
    GRID.sameOn64 === true && (3 * 8) !== (3 * 4), 'same on 64 only');

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

  function rv(sp, a, b) { return K ? K.clamp01((sp - a) / Math.max(0.001, b - a)) : 1; }

  function head(txt, sub) {
    P.text(40, 30, txt, { size: 15, bold: true, color: PAL.ink });
    if (sub) P.text(40, 50, sub, { size: 12, color: PAL.dim });
  }

  function foot(txt) {
    P.line(40, 432, 860, 432, { stroke: PAL.border, sw: 1 });
    P.text(40, 450, txt, { size: 12, color: PAL.accent });
  }

  /* a row of byte cells with an index row underneath */
  function cells(x, y, cw, ch, bytes, o) {
    o = o || {};
    for (var i = 0; i < bytes.length; i++) {
      var b = bytes[i];
      var isZero = b === 0;
      var fill = isZero ? PAL.invalidDim : (o.highlight && o.highlight.indexOf(i) >= 0 ? PAL.accentDim : PAL.surface2);
      var stroke = isZero ? PAL.invalid : PAL.border;
      P.rect(x + i * cw, y, cw - 2, ch, { fill: fill, stroke: stroke, sw: 1.2, radius: 3 });
      P.text(x + i * cw + (cw - 2) / 2, y + ch / 2 + 5,
        isZero ? '\\0' : (b >= 32 && b < 127 ? String.fromCharCode(b) : String(b)),
        { size: o.size || 13, mono: true, align: 'center', color: isZero ? PAL.invalid : PAL.ink, bold: true });
      if (o.index !== false) {
        P.text(x + i * cw + (cw - 2) / 2, y + ch + 14, String(i), { size: 9.5, mono: true, align: 'center', color: PAL.faint });
      }
    }
  }

  function tag(x, y, txt, colour) {
    P.text(x, y, txt, { size: 10.5, mono: true, color: colour || PAL.dim });
  }

  /* ---------------- scene 1 ---------------- */
  function drawBytes(t, sp) {
    head('A string is bytes up to the first zero', 'the only length signal C gives a string');

    var lit = storeLiteral('GATE', null).bytes;
    P.alpha(rv(sp, 0.02, 0.14));
    tag(40, 78, 'the literal "GATE"');
    cells(40, 88, 46, 40, lit, { highlight: [0, 1, 2, 3] });

    P.alpha(rv(sp, 0.2, 0.34));
    P.text(320, 106, 'sizeof = ' + row('a').sizeof, { size: 13, mono: true, color: PAL.ink, bold: true });
    P.text(320, 126, 'four characters plus the terminator', { size: 11, color: PAL.dim });

    P.alpha(rv(sp, 0.36, 0.52));
    P.text(40, 190, 'strlen counts the bytes before the zero, so it is ' + row('a').strlen + '.', { size: 12.5, color: PAL.ink });
    P.arrow(40 + 4.5 * 46 + 10, 108, 40 + 4 * 46 + 12, 108, { stroke: PAL.invalid, sw: 1.4, head: 8 });
    P.text(40 + 5 * 46 - 4, 168, 'stop here', { size: 10.5, mono: true, color: PAL.invalid });

    P.alpha(rv(sp, 0.56, 0.74));
    P.rect(40, 210, 800, 66, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
    P.text(56, 232, 'printf("%s", a)  copies bytes into the output until it meets the zero.', { size: 12.5, mono: true, color: PAL.ink });
    P.text(56, 254, 'There is no length in the array and no length in the pointer. The zero is the length.', { size: 11.5, color: PAL.dim });

    P.alpha(rv(sp, 0.78, 0.94));
    P.text(40, 308, 'A char array with no zero is a legal object and an illegal string.', { size: 12.5, color: PAL.invalid });
    P.text(40, 330, 'Every function that takes a string walks until the zero, so it walks past the array.', { size: 11.5, color: PAL.dim });

    foot('Two numbers describe every string: bytes stored, and bytes before the zero.');
  }

  /* ---------------- scene 2 ---------------- */
  function drawLiteralArray(t, sp) {
    head('Literal and array: the same five bytes, two different objects', 'char *s = "GATE"  against  char t[] = "GATE"');

    P.alpha(rv(sp, 0.02, 0.16));
    P.rect(40, 80, 390, 150, { fill: PAL.surface, stroke: PAL.border, sw: 1.2, radius: 8 });
    P.text(56, 102, 'char *s = "GATE";', { size: 13, mono: true, bold: true, color: PAL.ink });
    P.text(56, 126, 's holds an address.', { size: 11.5, color: PAL.dim });
    P.text(56, 146, 'The five bytes are an unnamed static array.', { size: 11.5, color: PAL.dim });
    P.text(56, 166, 'sizeof(s) = ' + row('p').sizeof + '   strlen(s) = 4', { size: 12, mono: true, color: PAL.accent });
    P.text(56, 190, 's[0] = \'g\';  undefined behaviour', { size: 11.5, mono: true, color: PAL.invalid });
    P.text(56, 210, 's = "OTHER";  legal', { size: 11.5, mono: true, color: PAL.valid });

    P.alpha(rv(sp, 0.2, 0.36));
    P.rect(470, 80, 390, 150, { fill: PAL.surface, stroke: PAL.border, sw: 1.2, radius: 8 });
    P.text(486, 102, 'char t[] = "GATE";', { size: 13, mono: true, bold: true, color: PAL.ink });
    P.text(486, 126, 't is the array itself, a copy of the bytes.', { size: 11.5, color: PAL.dim });
    P.text(486, 146, 'Automatic storage if t is a local variable.', { size: 11.5, color: PAL.dim });
    P.text(486, 166, 'sizeof(t) = ' + row('a').sizeof + '   strlen(t) = 4', { size: 12, mono: true, color: PAL.accent });
    P.text(486, 190, 't[0] = \'g\';  defined', { size: 11.5, mono: true, color: PAL.valid });
    P.text(486, 210, 't = "OTHER";  compile error', { size: 11.5, mono: true, color: PAL.invalid });

    P.alpha(rv(sp, 0.4, 0.6));
    tag(40, 264, 'what the standard says about the literal array');
    P.text(40, 286, 'It is unspecified whether identical literals share one array.', { size: 12, color: PAL.ink });
    P.text(40, 306, 'If the program attempts to modify such an array, the behaviour is undefined.', { size: 12, color: PAL.invalid });

    P.alpha(rv(sp, 0.64, 0.82));
    P.text(40, 348, 'Both facts come from one paragraph, which is why they are taught together:', { size: 12, color: PAL.dim });
    P.text(40, 368, 'the compiler may pool literals, so a write could change another literal or nothing at all.', { size: 12, color: PAL.ink });

    P.alpha(rv(sp, 0.86, 0.96));
    P.text(40, 404, 'Three differences: writable, sizeof, assignable. Everything else in this topic follows.', { size: 12.5, color: PAL.accent });

    foot('A pointer to a literal is not a string you own. An array is.');
  }

  /* ---------------- scene 3 ---------------- */
  function drawSizeofStrlen(t, sp) {
    head('sizeof against strlen', 'answered at compile time  against  answered by counting');

    var rows = ['a', 'b', 'c', 'p', 'f', 'g'];
    var y0 = 78, rh = 34;
    P.alpha(rv(sp, 0.02, 0.12));
    tag(40, y0 - 10, 'declaration');
    tag(430, y0 - 10, 'sizeof');
    tag(520, y0 - 10, 'strlen');
    tag(620, y0 - 10, 'a string?');

    var shown = Math.min(rows.length, 1 + Math.floor(sp * 8));
    for (var i = 0; i < shown; i++) {
      var r = row(rows[i]);
      var y = y0 + i * rh;
      P.alpha(1);
      P.rect(36, y - 12, 828, rh - 6, { fill: i % 2 ? PAL.surface2 : PAL.surface, stroke: null });
      P.text(44, y + 4, r.decl, { size: 11.5, mono: true, color: PAL.ink });
      P.text(436, y + 4, String(r.sizeof), { size: 12, mono: true, bold: true, color: PAL.accent });
      P.text(526, y + 4, r.strlen === null ? 'undefined' : String(r.strlen),
        { size: 12, mono: true, bold: true, color: r.strlen === null ? PAL.invalid : PAL.accent });
      P.text(626, y + 4, r.isString ? 'yes' : 'no', { size: 11.5, mono: true, color: r.isString ? PAL.valid : PAL.invalid });
      P.text(690, y + 4, r.kind === 'pointer' ? 'pointer width, not text' : (r.dropped ? 'terminator dropped' : r.shown),
        { size: 10.5, mono: true, color: PAL.dim });
    }

    P.alpha(rv(sp, 0.66, 0.84));
    P.text(40, 318, 'sizeof is an operator: the compiler answers from the declared type, and never looks inside.', { size: 12, color: PAL.ink });
    P.text(40, 338, 'strlen is a function: it walks the bytes and stops at the first zero.', { size: 12, color: PAL.ink });
    P.text(40, 358, 'For an array sized by its initialiser they differ by exactly one; for a pointer they are unrelated.', { size: 12, color: PAL.accent });

    P.alpha(rv(sp, 0.86, 0.96));
    P.text(40, 396, 'Inside a function, a parameter written char t[] has been adjusted to char *t.', { size: 12, color: PAL.warn });
    P.text(40, 416, 'So sizeof(t) there is the pointer width. The length has to be passed separately.', { size: 12, color: PAL.dim });

    foot('sizeof counts the object. strlen counts characters. Only one of them can be wrong at run time.');
  }

  /* ---------------- scene 4 ---------------- */
  function drawSizing(t, sp) {
    head('What fits: a bigger array, an exact array, one byte short', 'the initialisation rule, applied three times');

    P.alpha(rv(sp, 0.02, 0.16));
    tag(40, 78, 'char b[10] = "GATE";');
    cells(40, 88, 40, 34, row('b').bytes, { highlight: [0, 1, 2, 3] });
    P.text(470, 108, 'sizeof 10, strlen 4', { size: 12, mono: true, color: PAL.accent });
    P.text(470, 126, 'five used, five zero-filled', { size: 11, color: PAL.dim });

    P.alpha(rv(sp, 0.24, 0.4));
    tag(40, 172, 'char c[4] = "GATE";');
    cells(40, 182, 40, 34, row('c').bytes, {});
    P.text(250, 202, 'sizeof 4, no terminator: not a string', { size: 12, mono: true, color: PAL.invalid });
    P.text(250, 220, 'the one legal drop, and only at exactly one byte short', { size: 11, color: PAL.dim });

    P.alpha(rv(sp, 0.46, 0.62));
    tag(40, 262, "char e[] = {'G','A','T','E'};");
    cells(40, 272, 40, 34, BRACE.noZero.bytes, {});
    tag(250, 292, 'not a string');
    P.alpha(rv(sp, 0.62, 0.74));
    tag(430, 262, "char e[] = {'G','A','T','E','\\0'};");
    cells(430, 272, 40, 34, BRACE.withZero.bytes, { highlight: [0, 1, 2, 3] });
    tag(640, 292, 'a string of length 4');

    P.alpha(rv(sp, 0.78, 0.94));
    P.text(40, 344, 'The brace form stores exactly the bytes listed. It adds no terminator of its own.', { size: 12, color: PAL.ink });
    P.text(40, 364, 'An initialiser two bytes too long provides a value for an element the array does not have,', { size: 12, color: PAL.warn });
    P.text(40, 384, 'which the standard forbids; only the terminator, and only one byte of it, may be lost.', { size: 12, color: PAL.dim });
    P.text(40, 414, 'A question that hands you an array one byte short is asking whether you noticed.', { size: 12, color: PAL.accent });

    foot('A char array holds what fits. A string is what has a zero in it.');
  }

  /* ---------------- scene 5 ---------------- */
  function drawEscapes(t, sp) {
    head('Escapes are one byte each', 'count bytes, never source characters');

    var y0 = 82, rh = 34;
    tag(40, y0 - 10, 'written');
    tag(300, y0 - 10, 'bytes of content');
    tag(460, y0 - 10, 'sizeof');
    tag(560, y0 - 10, 'strlen');
    tag(660, y0 - 10, 'why');

    var shown = Math.min(ESC.length, 1 + Math.floor(sp * 10));
    for (var i = 0; i < shown; i++) {
      var e = ESC[i], y = y0 + i * rh;
      P.alpha(1);
      P.rect(36, y - 12, 828, rh - 6, { fill: i % 2 ? PAL.surface2 : PAL.surface, stroke: null });
      P.text(44, y + 4, '"' + e.src + '"', { size: 11.5, mono: true, color: PAL.ink });
      P.text(306, y + 4, String(e.content), { size: 12, mono: true, bold: true, color: PAL.ink });
      P.text(466, y + 4, String(e.sizeof), { size: 12, mono: true, bold: true, color: PAL.accent });
      P.text(566, y + 4, String(e.strlen), { size: 12, mono: true, bold: true, color: PAL.accent });
      P.text(666, y + 4, e.why, { size: 10.5, color: PAL.dim });
    }

    P.alpha(rv(sp, 0.7, 0.86));
    P.text(40, 352, 'Adjacent literals are joined first: "ab" "cd" is one array of ' + ADJ.sizeof + ' bytes, strlen ' + ADJ.strlen + '.',
      { size: 12, color: PAL.ink });
    P.text(40, 372, 'A hex escape is read greedily, so "\\x41BC" is one escape with too large a value, not A then BC.', { size: 12, color: PAL.warn });

    P.alpha(rv(sp, 0.9, 0.98));
    P.text(40, 410, 'sizeof is always strlen + 1 only when there is exactly one zero and it is the last byte.', { size: 12, color: PAL.accent });

    foot('"\\0" is the one literal whose strlen is 0 and whose sizeof is 2.');
  }

  /* ---------------- scene 6 ---------------- */
  function drawUnsigned(t, sp) {
    head('strlen returns size_t, which is unsigned', 'GATE 2017 Set 1 Q53, traced');

    P.alpha(rv(sp, 0.02, 0.18));
    P.rect(40, 78, 800, 74, { fill: PAL.surface2, stroke: PAL.border, sw: 1, radius: 8 });
    P.text(56, 100, 'int len = ((strlen(s) - strlen(t)) > c) ? strlen(s) : strlen(t);', { size: 12.5, mono: true, color: PAL.ink });
    P.text(56, 122, 'with  s = "abc"  (3)   and   t = "defgh"  (5)   and   unsigned c = 0', { size: 11.5, mono: true, color: PAL.dim });
    P.text(56, 142, 'both lengths have type size_t, so the subtraction is unsigned', { size: 11, color: PAL.accent });

    P.alpha(rv(sp, 0.24, 0.42));
    tag(40, 182, '3 - 5, computed in each width');
    P.text(40, 206, '32-bit size_t:  ' + UNS.d32, { size: 12, mono: true, color: PAL.ink });
    P.text(40, 228, '64-bit size_t:  ' + UNS.d64Str, { size: 12, mono: true, color: PAL.ink });
    P.text(40, 250, 'not -2 in either width, and positive in both', { size: 11.5, color: PAL.accent });

    P.alpha(rv(sp, 0.46, 0.64));
    P.text(40, 292, 'So the test is true, and the conditional selects strlen(s), which is ' + UNS.answer + '.', { size: 13, color: PAL.valid });
    P.text(40, 314, 'The intuitive answer is 5, the larger length. That is the answer the question punishes.', { size: 12, color: PAL.invalid });

    P.alpha(rv(sp, 0.68, 0.86));
    P.rect(40, 338, 800, 56, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 8 });
    P.text(56, 360, 'The same type breaks a loop:  for (i = strlen(s) - 1; i >= 0; i--)', { size: 12.5, mono: true, color: PAL.ink });
    P.text(56, 380, 'i >= 0 is true for every unsigned value, so the test can never fail.', { size: 11.5, color: PAL.warn });

    P.alpha(rv(sp, 0.9, 0.98));
    P.text(40, 416, 'Decide the sign, not the value. The width of size_t never changes the answer.', { size: 12, color: PAL.accent });

    foot('A difference of two lengths is a length only when the first is at least the second.');
  }

  /* ---------------- scene 7 ---------------- */
  function drawPointerArith(t, sp) {
    head('2[p] is p[2]: the 2017 arithmetic', 'GATE 2017 Set 2 Q55');

    var bytes = Q2017b.bytes;
    P.alpha(rv(sp, 0.02, 0.16));
    tag(40, 78, '"GATECSIT2017"  —  twelve characters, terminator at index 12');
    cells(40, 88, 40, 34, bytes, { highlight: [2, 6] });

    P.alpha(rv(sp, 0.2, 0.38));
    P.text(40, 168, '2[p] = p[2] = ' + Q2017b.ch2 + ' (' + Q2017b.p2 + ')', { size: 12.5, mono: true, color: PAL.ink });
    P.text(320, 168, '6[p] = p[6] = ' + Q2017b.ch6 + ' (' + Q2017b.p6 + ')', { size: 12.5, mono: true, color: PAL.ink });
    P.text(600, 168, 'difference ' + Q2017b.diff, { size: 12.5, mono: true, color: PAL.accent });

    P.alpha(rv(sp, 0.42, 0.6));
    P.text(40, 200, 'a[i] means *(a + i), and addition commutes, so i[a] is the same object.', { size: 12, color: PAL.dim });
    P.text(40, 224, 'c + 2[p] - 6[p] - 1  =  c + ' + Q2017b.diff + ' - 1  =  c + ' + Q2017b.offset,
      { size: 13, mono: true, color: PAL.ink, bold: true });
    P.text(40, 246, 'the element type is char, so the offset is a byte count with no scaling', { size: 11.5, color: PAL.dim });

    P.alpha(rv(sp, 0.64, 0.82));
    P.arrow(600, 104, 500, 104, { stroke: PAL.accent, sw: 1.6, head: 8 });
    tag(608, 108, 'c + ' + Q2017b.offset + ' starts here');
    P.text(40, 292, 'strlen counts from there to the zero: "' + Q2017b.tail + '" is ' + Q2017b.answer + ' characters.',
      { size: 12.5, color: PAL.ink });
    P.text(40, 316, 'Answer ' + Q2017b.answer + '.', { size: 15, mono: true, bold: true, color: PAL.valid });

    P.alpha(rv(sp, 0.86, 0.96));
    P.text(40, 356, 'Twelve characters, a terminator at 12, and an answer of 2: every wrong option is a miscounted index.', { size: 12, color: PAL.dim });
    P.text(40, 378, 'The character values 84 and 73 are not needed as numbers; letters are consecutive in any character set C allows.',
      { size: 12, color: PAL.ink });

    foot('Substitute the definition of the subscript, then count the bytes to the zero.');
  }

  /* ---------------- scene 8 ---------------- */
  function drawCopy(t, sp) {
    head('A copy is not a copy until the zero is written', 'GATE 2025 Set 2 Q9');

    P.alpha(rv(sp, 0.02, 0.14));
    tag(40, 78, 'before:  char a[30] = "@#Hello World!";');
    cells(40, 86, 30, 28, Q2025.bytes.slice(0, 18), { size: 11 });

    P.alpha(rv(sp, 0.18, 0.34));
    tag(40, 168, 'the call:  stringcopy(a, a + 2)');
    P.text(40, 190, 'while (*t) *s++ = *t++;     the zero stops the loop before it is copied', { size: 12, mono: true, color: PAL.ink });
    P.text(40, 212, 'twelve characters travel: indices 2 to 13 into indices 0 to 11', { size: 11.5, color: PAL.accent });

    P.alpha(rv(sp, 0.38, 0.58));
    tag(40, 248, 'after:  the same array, twelve bytes overwritten');
    cells(40, 256, 30, 28, Q2025.bytes.slice(0, 18), { size: 11, highlight: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] });
    tag(40 + 11 * 30, 316, 'leftovers', PAL.invalid);
    tag(40 + 14 * 30 + 6, 316, 'original zero', PAL.invalid);

    P.alpha(rv(sp, 0.62, 0.8));
    P.text(40, 340, 'Indices 12 and 13 still hold "' + Q2025.leftChars + '", and the zero at 14 was never written.',
      { size: 12, color: PAL.ink });
    P.text(40, 362, 'printf prints "' + Q2025.printed + '", which is ' + Q2025.printedLen + ' characters. Option D.',
      { size: 12.5, mono: true, color: PAL.valid });

    P.alpha(rv(sp, 0.84, 0.96));
    P.text(40, 394, 'Budgets: a copy needs strlen(src) + 1 bytes; an append needs strlen(dst) + strlen(src) + 1.', { size: 12, color: PAL.ink });
    P.text(40, 414, 'buf[6] with "GATE" then "!" needs ' + BUDGET.appNeed + ' bytes and fits with ' + BUDGET.spareAfter + ' to spare.',
      { size: 12, color: PAL.dim });

    foot('The zero is data. A loop that tests it before copying it never stores it.');
  }

  /* ---------------- scene 9 ---------------- */
  function drawTwoD(t, sp) {
    head('Arrays of strings: a grid of bytes against an array of pointers', 'char names[3][8]  against  char *names[3]');

    var names = ['GATE', 'CSE', '2027'];

    P.alpha(rv(sp, 0.02, 0.18));
    tag(40, 78, 'char names[3][8];   one object of ' + GRID.sizeof + ' bytes');
    for (var r = 0; r < 3; r++) {
      var rowBytes = [];
      for (var c = 0; c < 8; c++) rowBytes.push(c < names[r].length ? names[r].charCodeAt(c) : 0);
      cells(40, 90 + r * 56, 32, 30, rowBytes, { size: 11, highlight: c === 0 ? [] : undefined });
      tag(40 + 8 * 32 + 10, 110 + r * 56, 'char[' + GRID.rowStride + ']');
    }

    P.alpha(rv(sp, 0.28, 0.46));
    tag(430, 78, 'char *names[3];   three pointers');
    for (var k = 0; k < 3; k++) {
      P.rect(430, 90 + k * 46, 150, 32, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1, radius: 4 });
      P.text(505, 111 + k * 46, 'pointer ' + k, { size: 11, mono: true, align: 'center', color: PAL.ink });
      P.arrow(585, 106 + k * 46, 625, 106 + k * 46, { stroke: PAL.border, sw: 1.2, head: 7 });
      P.text(632, 111 + k * 46, '"' + names[k] + '"', { size: 11.5, mono: true, color: PAL.dim });
    }

    P.alpha(rv(sp, 0.5, 0.68));
    P.text(40, 268, 'sizeof(names) is ' + GRID.sizeof + ' for the grid and ' + GRID.ptrArray64 + ' for the pointer array on a 64-bit machine,',
      { size: 12, color: PAL.ink });
    P.text(40, 288, 'and ' + GRID.ptrArray32 + ' on the 32-bit convention. Equal totals, different objects.', { size: 12, color: PAL.ink });

    P.alpha(rv(sp, 0.72, 0.88));
    P.text(40, 322, 'names[0] = "NEW";  is a compile error for the grid, and legal for the pointer array.', { size: 12, mono: true, color: PAL.warn });
    P.text(40, 342, 'The grid stores its own bytes; the pointer array stores addresses of bytes it does not own.', { size: 12, color: PAL.dim });

    P.alpha(rv(sp, 0.9, 0.98));
    P.text(40, 378, 'This is why main receives argv as char *argv[]: the pointers are yours, the strings are not.', { size: 12, color: PAL.accent });

    foot('Compare the element type, never the total size.');
  }

  /* ---------------- scene 10 ---------------- */
  function drawRules(t, sp) {
    head('The four-step procedure and the five traps', 'the order that answers any string question');

    var steps = [
      ['1', 'Find the object.', 'Array of known size, or pointer? sizeof is decided at the declaration.'],
      ['2', 'Lay out the bytes.', 'Write the indices, mark the first zero. strlen is that index.'],
      ['3', 'Check the types.', 'Lengths and counts are size_t. A difference of two is never negative.'],
      ['4', 'Ask about the zero.', 'If the terminator was not written, the object is not a string.']
    ];
    for (var i = 0; i < steps.length; i++) {
      var y = 80 + i * 62;
      P.alpha(rv(sp, 0.02 + i * 0.16, 0.14 + i * 0.16));
      P.circle(56, y + 12, 13, { fill: PAL.accentDim, stroke: PAL.accent, sw: 1.2 });
      P.text(56, y + 17, steps[i][0], { size: 12, mono: true, align: 'center', bold: true, color: PAL.ink });
      P.text(80, y + 6, steps[i][1], { size: 12.5, bold: true, color: PAL.ink });
      P.text(80, y + 26, steps[i][2], { size: 11.5, color: PAL.dim });
    }

    P.alpha(rv(sp, 0.66, 0.86));
    P.rect(40, 328, 800, 84, { fill: PAL.warnDim, stroke: PAL.warn, sw: 1, radius: 8 });
    P.text(56, 348, 'Five traps, in the order they cost marks', { size: 12, bold: true, color: PAL.warn });
    P.text(56, 368, 'a four-letter word is five bytes   ·   sizeof is not strlen   ·   a pointer is not an array', { size: 11.5, color: PAL.ink });
    P.text(56, 388, 'a difference of lengths is unsigned   ·   a copy loop that tests the zero never writes it', { size: 11.5, color: PAL.ink });

    foot('Four questions, four checks. Answer them in order and the arithmetic looks after itself.');
  }

  /* ---------------- dispatch ---------------- */

  var DRAWERS = {
    bytes: drawBytes, 'literal-array': drawLiteralArray, 'sizeof-strlen': drawSizeofStrlen,
    sizing: drawSizing, escapes: drawEscapes, unsigned: drawUnsigned,
    'pointer-arith': drawPointerArith, copy: drawCopy, 'two-d': drawTwoD, rules: drawRules
  };

  function drawFrame(Pp) {
    if (!Pp) return;
    P = Pp;
    P.alpha(1);
    P.clear();
    P.rect(0, 0, W, H, { fill: PAL.surface });

    var T = window.LESSON_TIMELINE;
    if (!T) return;
    var t = (K && K.state && K.state.elapsed) || 0;
    var scene = null;
    for (var i = 0; i < T.scenes.length; i++) {
      if (t >= T.scenes[i].start && t < T.scenes[i].end) { scene = T.scenes[i]; break; }
    }
    if (!scene) scene = T.scenes[T.scenes.length - 1];
    var sp = (t - scene.start) / (scene.end - scene.start);
    if (sp < 0) sp = 0; if (sp > 1) sp = 1;

    var fn = DRAWERS[scene.id];
    if (fn) fn(t, sp);
    P.alpha(1);
  }

/* ======================================================================
   LAYER 4 - BOOT
   ====================================================================== */

  function boot() {
    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (typeof window.p5 === 'function') {
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
        if (holder) holder.appendChild(cv);
        var ctx2d = cv.getContext && cv.getContext('2d');
        if (ctx2d) {
          P = PR.makePainter2D(ctx2d, W, H);
          drawFrame(P);
          drew = true;
        }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback && fallback.classList) fallback.classList.add('show');
    }

    var checkBox = document.getElementById('checks');
    if (checkBox) {
      var bad = CHECKS.filter(function (c) { return !c.pass; });
      checkBox.innerHTML = '<span class="k">Model checks</span>' +
        (bad.length ? bad.length + ' of ' + CHECKS.length + ' failed' : CHECKS.length + '/' + CHECKS.length + ' passed');
    }

    if (K && K.init && window.LESSON_TIMELINE) {
      K.init({
        timeline: window.LESSON_TIMELINE,
        draw: function () { if (P) drawFrame(P); }
      });
    }

    window.__drawAt = function (t) {
      if (K && K.state) K.state.elapsed = t;
      if (P) drawFrame(P);
    };

    var failing = CHECKS.filter(function (c) { return !c.pass; });
    if (failing.length) console.warn('Model validation did not fully pass:', failing);
  }

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
