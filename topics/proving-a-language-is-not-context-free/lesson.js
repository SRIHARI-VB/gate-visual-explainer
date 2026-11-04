/* ==========================================================================
   proving-a-language-is-not-context-free — lesson.js
   Four layers, in order:
     1. THE MODEL      — eight languages as exact membership tests, their test
                         families, the pumping-lemma search, Ogden's search,
                         the four languages of GATE CSE 2019, and the split
                         counts. Every figure is computed, none quoted.
     2. THE CHECKS     — every number the captions state is recomputed here and
                         compared with the figure the caption states.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The claim under test is one sentence: the pumping lemma is necessary and not
   sufficient, so a refutation at a particular p is a proof about that p and
   never a proof about the language. Everything else on this page is that
   sentence applied, and the computations below are what make it checkable.
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

   A language here is an exact membership test over a finite alphabet. A test
   family is an explicit, finite, named set of strings taken from the language;
   the search is exhaustive over that family and over nothing else, and the
   page says so wherever it reports a survival.
   ====================================================================== */

  /* ---- eight languages, as exact membership tests ---- */

  function rep(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }
  function block(w, i, j) { return w.slice(i, j); }
  function rev(s) { return s.split('').reverse().join(''); }

  /* a^n b^n */
  function isAnBn(w) {
    var n = w.length;
    if (n % 2) return false;
    var h = n / 2;
    return w === rep('a', h) + rep('b', h);
  }
  /* a^n b^n c^n, n at least 1 */
  function isAnBnCn(w) {
    var n = w.length;
    if (n === 0 || n % 3) return false;
    var h = n / 3;
    return w === rep('a', h) + rep('b', h) + rep('c', h);
  }
  /* w w, w not empty */
  function isWw(w) {
    var n = w.length;
    if (n % 2) return false;
    var h = n / 2;
    return w.slice(0, h) === w.slice(h);
  }
  /* a^n b^n c^2n, n at least 1 */
  function isAnBnC2n(w) {
    for (var k = 1; 3 * k <= w.length; k++) {
      if (w === rep('a', k) + rep('b', k) + rep('c', 2 * k)) return true;
    }
    return false;
  }
  /* a^n b^m c^(n+m), n and m at least 1 */
  function isAnBmCnm(w) {
    for (var n = 1; 2 * n + 1 <= w.length + 1; n++) {
      for (var m = 1; n + 2 * m <= w.length; m++) {
        if (w === rep('a', n) + rep('b', m) + rep('c', n + m)) return true;
      }
    }
    return false;
  }
  /* a^i b^j c^k d^l with i = 0 or j = k = l */
  function isD4(w) {
    var i = 0;
    while (i < w.length && w.charAt(i) === 'a') i++;
    var j = 0;
    while (i + j < w.length && w.charAt(i + j) === 'b') j++;
    var k = 0;
    while (i + j + k < w.length && w.charAt(i + j + k) === 'c') k++;
    var l = 0;
    while (i + j + k + l < w.length && w.charAt(i + j + k + l) === 'd') l++;
    if (i + j + k + l !== w.length) return false;     /* a letter out of order */
    return i === 0 || (j === k && k === l);
  }
  /* a^i b^j c^j d^j with i at least 1  — D4 intersected with a+ b* c* d* */
  function isInter(w) {
    var i = 0;
    while (i < w.length && w.charAt(i) === 'a') i++;
    if (i === 0) return false;
    var j = 0;
    while (i + j < w.length && w.charAt(i + j) === 'b') j++;
    var k = 0;
    while (i + j + k < w.length && w.charAt(i + j + k) === 'c') k++;
    var l = 0;
    while (i + j + k + l < w.length && w.charAt(i + j + k + l) === 'd') l++;
    if (i + j + k + l !== w.length) return false;
    return j === k && k === l;
  }
  /* a^p with p prime */
  function isAPrime(w) {
    var n = w.length;
    if (n < 2 || w !== rep('a', n)) return false;
    for (var d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }
  /* the four languages of GATE CSE 2019 — the third is the answer */
  function isWwR(w) {
    var n = w.length;
    if (n % 2) return false;
    var h = n / 2;
    return w.slice(0, h) === rev(w.slice(h));
  }
  function isWanbnWr(w) {
    var n = w.length;
    for (var k = 0; 2 * k <= n; k++) {
      if (w.slice(n - k) !== rev(w.slice(0, k))) continue;
      var rest = w.slice(k, n - k);
      for (var m = 0; 2 * m <= rest.length; m++) {
        if (rest === rep('a', m) + rep('b', m)) return true;
      }
    }
    return false;
  }
  function isWanWrBn(w) {
    var n = w.length;
    for (var k = 0; 2 * k <= n; k++) {
      for (var m = 0; 2 * k + 2 * m <= n; m++) {
        if (2 * k + 2 * m !== n) continue;
        var A = w.slice(0, k), B = w.slice(k, k + m);
        var C = w.slice(k + m, 2 * k + m), D = w.slice(2 * k + m);
        if (A === rev(C) && B === rep('a', m) && D === rep('b', m)) return true;
      }
    }
    return false;
  }
  function isAnBi(w) {
    var i = 0;
    while (i < w.length && w.charAt(i) === 'a') i++;
    var j = 0;
    while (i + j < w.length && w.charAt(i + j) === 'b') j++;
    if (i + j !== w.length) return false;
    return j === i || j === 3 * i || j === 5 * i;
  }

  /* ---- test families: explicit, finite, and named in the lesson ---- */

  function famAnBn(nmax) {
    var out = [];
    for (var n = 1; n <= nmax; n++) out.push(rep('a', n) + rep('b', n));
    return out;
  }
  function famAnBnCn(nmax) {
    var out = [];
    for (var n = 1; n <= nmax; n++) out.push(rep('a', n) + rep('b', n) + rep('c', n));
    return out;
  }
  function famWw(wmax) {
    var out = [], letters = ['a', 'b'];
    function grow(prefix, len) {
      if (prefix.length === len) { out.push(prefix + prefix); return; }
      for (var x = 0; x < 2; x++) grow(prefix + letters[x], len);
    }
    for (var L = 1; L <= wmax; L++) grow('', L);
    /* the family the textbook proof uses: a^n b a^n b */
    for (var n = 1; n <= wmax; n++) out.push(rep('a', n) + 'b' + rep('a', n) + 'b');
    return out;
  }
  function famD4(lmax, nmax) {
    var out = [];
    for (var j = 0; j <= lmax; j++) {
      for (var k = 0; k + j <= lmax; k++) {
        for (var l = 0; j + k + l <= lmax; l++) {
          out.push(rep('b', j) + rep('c', k) + rep('d', l));
        }
      }
    }
    for (var n = 1; n <= nmax; n++) out.push('a' + rep('b', n) + rep('c', n) + rep('d', n));
    return out;
  }
  function famInter(imax, jmax) {
    var out = [];
    for (var i = 1; i <= imax; i++) {
      for (var j = 0; j <= jmax; j++) {
        out.push(rep('a', i) + rep('b', j) + rep('c', j) + rep('d', j));
      }
    }
    return out;
  }
  function famAnBnC2n(nmax) {
    var out = [];
    for (var n = 1; n <= nmax; n++) out.push(rep('a', n) + rep('b', n) + rep('c', 2 * n));
    return out;
  }
  function famAnBmCnm(nmax) {
    var out = [];
    for (var n = 1; n <= nmax; n++) {
      for (var m = 1; m <= nmax; m++) out.push(rep('a', n) + rep('b', m) + rep('c', n + m));
    }
    return out;
  }
  function famAPrime(pmax) {
    var out = [];
    for (var n = 2; n <= pmax; n++) if (isAPrime(rep('a', n))) out.push(rep('a', n));
    return out;
  }
  function famWwR(wmax) {
    var out = [], letters = ['a', 'b'];
    function grow(prefix, len) {
      if (prefix.length === len) { out.push(prefix + rev(prefix)); return; }
      for (var x = 0; x < 2; x++) grow(prefix + letters[x], len);
    }
    for (var L = 1; L <= wmax; L++) grow('', L);
    return out;
  }
  function famWanbnWr(wmax, mmax) {
    var out = [], letters = ['a', 'b'];
    function grow(prefix, len) {
      if (prefix.length === len) {
        for (var m = 0; m <= mmax; m++) {
          out.push(prefix + rep('a', m) + rep('b', m) + rev(prefix));
        }
        return;
      }
      for (var x = 0; x < 2; x++) grow(prefix + letters[x], len);
    }
    for (var L = 0; L <= wmax; L++) grow('', L);
    return out;
  }
  /* w a^n w^R b^n: the family the search uses is the nine strings
     a^k b a^(k+1) b a^k b^(k+1), which is where the pump has nowhere to hide */
  function famWanWrBn(kmax) {
    var out = [];
    for (var k = 1; k <= kmax; k++) {
      out.push(rep('a', k) + 'b' + rep('a', k + 1) + 'b' + rep('a', k) + rep('b', k + 1));
    }
    return out;
  }
  function famAnBi(nmax) {
    var out = [], mult = [1, 3, 5];
    for (var n = 0; n <= nmax; n++) {
      for (var x = 0; x < 3; x++) out.push(rep('a', n) + rep('b', mult[x] * n));
    }
    return out;
  }

  /* ---- the two searches ---- */

  var IMAX = 6;          /* pumping tested for i = 0 .. 6 inclusive */

  function pumped(w, i, j, k, l, t) {
    return w.slice(0, i) + rep2(w.slice(i, j), t) + w.slice(j, k) + rep2(w.slice(k, l), t) + w.slice(l);
  }
  function rep2(s, t) { var o = ''; for (var x = 0; x < t; x++) o += s; return o; }

  /* Plain pumping lemma: does every string of the family of length at least p
     admit an allowed split whose every pump stays in L? Returns the first
     string that does not, which is the witness that refutes this p. */
  function plCheck(member, fam, p) {
    var strings = 0, splits = 0;
    for (var s = 0; s < fam.length; s++) {
      var w = fam[s], n = w.length;
      if (n < p) continue;
      strings++;
      var good = false;
      for (var i = 0; i <= n && !good; i++) {
        for (var j = i; j <= n && !good; j++) {
          for (var k = j; k <= n && !good; k++) {
            for (var l = k; l <= n; l++) {
              if (l - i > p) continue;                 /* window at most p */
              if ((j - i) + (l - k) === 0) continue;   /* v and y not both empty */
              splits++;
              var ok = true;
              for (var t = 0; t <= IMAX; t++) {
                if (!member(pumped(w, i, j, k, l, t))) { ok = false; break; }
              }
              if (ok) { good = true; break; }
            }
          }
        }
      }
      if (!good) return { refuted: true, witness: w, splits: splits, strings: strings };
    }
    return { refuted: false, witness: null, splits: splits, strings: strings };
  }

  /* Ogden's lemma: vy must carry a marked position, and vxy may carry at most p. */
  function ogdenCheck(member, fam, p, markLetter) {
    var strings = 0, splits = 0;
    for (var s = 0; s < fam.length; s++) {
      var w = fam[s], n = w.length, mk = [], marked = 0;
      for (var x = 0; x < n; x++) {
        var m = w.charAt(x) === markLetter ? 1 : 0;
        mk.push(m); marked += m;
      }
      if (marked < p) continue;
      strings++;
      var good = false;
      for (var i = 0; i <= n && !good; i++) {
        for (var j = i; j <= n && !good; j++) {
          for (var k = j; k <= n && !good; k++) {
            for (var l = k; l <= n; l++) {
              if (l - i > p) continue;
              var mv = 0, my = 0, mxy = 0;
              for (var a = i; a < j; a++) mv += mk[a];
              for (a = k; a < l; a++) my += mk[a];
              for (a = i; a < l; a++) mxy += mk[a];
              if (mv + my < 1) continue;
              if (mxy > p) continue;
              splits++;
              var ok = true;
              for (var t = 0; t <= IMAX; t++) {
                if (!member(pumped(w, i, j, k, l, t))) { ok = false; break; }
              }
              if (ok) { good = true; break; }
            }
          }
        }
      }
      if (!good) return { refuted: true, witness: w, splits: splits, strings: strings };
    }
    return { refuted: false, witness: null, splits: splits, strings: strings };
  }

  /* the number of splits a string of length n offers at pumping length p,
     before the two conditions are applied */
  function countSplits(n, p) {
    var tot = 0;
    for (var s = 1; s <= p && s <= n; s++) {
      tot += (n - s + 1) * (((s + 1) * (s + 2)) / 2 - 1);
    }
    return tot;
  }

  /* ---- the families, built once ---- */

  var F = {
    anbn: famAnBn(12),
    anbncn: famAnBnCn(8),
    ww: famWw(8),
    anbnc2n: famAnBnC2n(6),
    anbmcnm: famAnBmCnm(5),
    d4: famD4(9, 8),
    inter: famInter(2, 8),
    aprime: famAPrime(60),
    wwr: famWwR(5),
    wanbnwr: famWanbnWr(3, 4),
    wanwrbn: famWanWrBn(9),
    anbi: famAnBi(9)
  };

  var LANG = [
    { key: 'anbn', name: 'a\u207fb\u207f', member: isAnBn, fam: F.anbn, class: 'context-free' },
    { key: 'anbmcnm', name: 'a\u207fb\u1d50c\u207f\u207a\u1d50', member: isAnBmCnm, fam: F.anbmcnm, class: 'context-free' },
    { key: 'anbncn', name: 'a\u207fb\u207fc\u207f', member: isAnBnCn, fam: F.anbncn, class: 'not context-free' },
    { key: 'anbnc2n', name: 'a\u207fb\u207fc\u00b2\u207f', member: isAnBnC2n, fam: F.anbnc2n, class: 'not context-free' },
    { key: 'ww', name: 'w w', member: isWw, fam: F.ww, class: 'not context-free' },
    { key: 'd4', name: 'a\u2071b\u02b2c\u1d4f d\u02e1', member: isD4, fam: F.d4, class: 'not context-free, passes the lemma' }
  ];

  var PS = [1, 2, 3, 4, 5, 6];

  var TABLE = LANG.map(function (L) {
    return {
      key: L.key, name: L.name, cls: L.class, famSize: L.fam.length,
      cells: PS.map(function (p) {
        var r = plCheck(L.member, L.fam, p);
        return { p: p, refuted: r.refuted, witness: r.witness, splits: r.splits, strings: r.strings };
      })
    };
  });
  function row(key) {
    for (var i = 0; i < TABLE.length; i++) if (TABLE[i].key === key) return TABLE[i];
    return null;
  }
  function cell(key, p) { var r = row(key); return r ? r.cells[p - 1] : null; }

  /* two more languages, computed for the checks and the prose but not drawn
     as rows of the search table */
  var SIDE = {
    inter: PS.map(function (p) { return plCheck(isInter, F.inter, p); }),
    aprime: PS.map(function (p) { return plCheck(isAPrime, F.aprime, p); })
  };

  /* Ogden's lemma on a^n b^n c^n, marking the a's */
  var OGDEN_ANBNCN = PS.map(function (p) {
    return ogdenCheck(isAnBnCn, F.anbncn, p, 'a');
  });
  /* Ogden's lemma on the four-block language, marking the b's */
  var OGDEN_D4 = PS.map(function (p) {
    return ogdenCheck(isD4, F.d4, p, 'b');
  });

  /* the four languages of GATE CSE 2019 */
  var GATE19 = [
    { name: 'w w\u1d3f', member: isWwR, fam: F.wwr, famSize: F.wwr.length },
    { name: 'w a\u207fb\u207fw\u1d3f', member: isWanbnWr, fam: F.wanbnwr, famSize: F.wanbnwr.length },
    { name: 'w a\u207fw\u1d3fb\u207f', member: isWanWrBn, fam: F.wanwrbn, famSize: F.wanwrbn.length },
    { name: 'a\u207fb\u2071, i \u2208 {n,3n,5n}', member: isAnBi, fam: F.anbi, famSize: F.anbi.length }
  ].map(function (L) {
    return {
      name: L.name, famSize: L.famSize,
      cells: PS.map(function (p) {
        var r = plCheck(L.member, L.fam, p);
        return { p: p, refuted: r.refuted, witness: r.witness };
      })
    };
  });

  /* the arithmetic the page quotes */
  var SPLITS = { n9p3: countSplits(9, 3), n18p6: countSplits(18, 6), n6p2: countSplits(6, 2), n12p4: countSplits(12, 4) };
  var P2K = [1, 2, 3, 4, 5, 6, 7, 8].map(function (k) { return Math.pow(2, k); });

  /* ======================================================================
     LAYER 2 - THE CHECKS
     ====================================================================== */

  var CHECKS = [];
  function check(name, pass, detail) { CHECKS.push({ name: name, pass: !!pass, detail: detail || '' }); }

  check('the a^n b^n test accepts aabb and rejects abab, aab and ba',
    isAnBn('aabb') && !isAnBn('abab') && !isAnBn('aab') && !isAnBn('ba'), '');
  check('the a^n b^n c^n test accepts aaabbbccc and rejects aabbcc d',
    isAnBnCn('aaabbbccc') && !isAnBnCn('aabbccd') && !isAnBnCn('aabbc'), '');
  check('the w w test accepts abab and rejects abba', isWw('abab') && !isWw('abba'), '');
  check('the four-block test accepts bbccdd and a b c d, and rejects a b b c c',
    isD4('bbccdd') && isD4('abcd') && !isD4('abbcc'), '');
  check('the four-block test rejects a letter out of order', !isD4('abbccd') && !isD4('abcdb'),
    'abbccd is a b b c c d: i = 1 but j = 2, k = 2, l = 1, so j, k and l are not equal');
  check('the intersection test rejects a string with no a', !isInter('bbccdd') && isInter('abbccdd'), '');
  check('the prime test accepts aaaaa and rejects aaaa', isAPrime('aaaaa') && !isAPrime('aaaa'), '');
  check('the family sizes are 12, 25, 8, 6, 518 and 228',
    F.anbn.length === 12 && F.anbmcnm.length === 25 && F.anbncn.length === 8 &&
    F.anbnc2n.length === 6 && F.ww.length === 518 && F.d4.length === 228,
    [F.anbn.length, F.anbmcnm.length, F.anbncn.length, F.anbnc2n.length, F.ww.length, F.d4.length].join(', '));
  check('the four-block family holds 220 strings with no a and 8 of the form a b^n c^n d^n',
    F.d4.length - 8 === 220, String(F.d4.length - 8));
  check('a^n b^n is refuted only at p = 1, by the string ab',
    cell('anbn', 1).refuted && cell('anbn', 1).witness === 'ab' &&
    !cell('anbn', 2).refuted && !cell('anbn', 6).refuted,
    cell('anbn', 1).witness);
  check('a^n b^n c^n is refuted at every p from 1 to 6',
    PS.every(function (p) { return cell('anbncn', p).refuted; }), '');
  check('the a^n b^n c^n witnesses are abc three times then aabbcc three times',
    [1, 2, 3, 4, 5, 6].map(function (p) { return cell('anbncn', p).witness; }).join('|') ===
    'abc|abc|abc|aabbcc|aabbcc|aabbcc',
    [1, 2, 3, 4, 5, 6].map(function (p) { return cell('anbncn', p).witness; }).join(', '));
  check('the a^n b^n c^n search tries 182 splits of the six-letter witness at p = 6',
    cell('anbncn', 6).splits === 182, String(cell('anbncn', 6).splits));
  check('a^n b^m c^(n+m) is refuted at p = 1 to 4 and survives at p = 5 and 6',
    cell('anbmcnm', 1).refuted && cell('anbmcnm', 4).refuted &&
    !cell('anbmcnm', 5).refuted && !cell('anbmcnm', 6).refuted,
    cell('anbmcnm', 1).witness + ' refutes p = 1');
  check('a^n b^n c^2n is refuted at every p from 1 to 6',
    PS.every(function (p) { return cell('anbnc2n', p).refuted; }), '');
  check('w w is refuted at every p from 1 to 6',
    PS.every(function (p) { return cell('ww', p).refuted; }), '');
  check('the four-block language survives every p from 1 to 6 under the plain lemma',
    PS.every(function (p) { return !cell('d4', p).refuted; }), '');
  check('the intersection a^i b^j c^j d^j is refuted at every p from 1 to 6',
    PS.every(function (p, i) { return SIDE.inter[i].refuted; }), '');
  check('the unary prime language is refuted at every p from 1 to 6',
    PS.every(function (p, i) { return SIDE.aprime[i].refuted; }), '');
  check('Ogden on a^n b^n c^n with the a\u2019s marked is refuted at every p',
    PS.every(function (p, i) { return OGDEN_ANBNCN[i].refuted; }), '');
  check('the Ogden split counts on a^n b^n c^n are 2, 13, 44, 110, 230 and 427',
    OGDEN_ANBNCN.map(function (r) { return r.splits; }).join(',') === '2,13,44,110,230,427',
    OGDEN_ANBNCN.map(function (r) { return r.splits; }).join(', '));
  check('Ogden refutes the four-block language at every p from 1 to 6',
    PS.every(function (p, i) { return OGDEN_D4[i].refuted; }), '');
  check('the four-block Ogden witnesses run abcd, abbccdd, abbbcccddd',
    OGDEN_D4[0].witness === 'abcd' && OGDEN_D4[1].witness === 'abbccdd' && OGDEN_D4[2].witness === 'abbbcccddd',
    OGDEN_D4.map(function (r) { return r.witness; }).join(', '));
  check('w a^n w^R b^n is refuted at every p, and its three neighbours are not',
    PS.every(function (p) { return GATE19[2].cells[p - 1].refuted; }) &&
    PS.slice(1).every(function (p) { return !GATE19[0].cells[p - 1].refuted; }) &&
    PS.slice(1).every(function (p) { return !GATE19[1].cells[p - 1].refuted; }),
    '');
  check('a^n b^i with i in {n, 3n, 5n} survives at p = 6',
    !GATE19[3].cells[5].refuted, 'p = 6, family of ' + GATE19[3].famSize + ' strings');
  check('the GATE 2019 families hold 62, 75, 9 and 30 strings',
    GATE19[0].famSize === 62 && GATE19[1].famSize === 75 &&
    GATE19[2].famSize === 9 && GATE19[3].famSize === 30,
    GATE19.map(function (g) { return g.famSize; }).join(', '));
  check('a nine-letter string offers 121 splits at p = 3 and 1106 at n = 18, p = 6',
    SPLITS.n9p3 === 121 && SPLITS.n18p6 === 1106, SPLITS.n9p3 + ', ' + SPLITS.n18p6);
  check('the split count agrees with brute force at n = 6, p = 2 and n = 12, p = 4',
    SPLITS.n6p2 === 37 && SPLITS.n12p4 === 295, SPLITS.n6p2 + ', ' + SPLITS.n12p4);
  check('the pumping length 2^k is 2, 4, 8, 16, 32, 64, 128 and 256',
    P2K.join(',') === '2,4,8,16,32,64,128,256', P2K.join(', '));
  check('pumping at i = 1 returns the original string',
    pumped('aabb', 0, 1, 2, 3, 1) === 'aabb', pumped('aabb', 0, 1, 2, 3, 1));
  check('pumping at i = 0 deletes v and y',
    pumped('aabb', 0, 1, 2, 3, 0) === 'ab', pumped('aabb', 0, 1, 2, 3, 0));

  /* ======================================================================
     LAYER 3 - RENDER
     ====================================================================== */

  function head(title, sub) {
    P.text(32, 18, title, { size: 15, bold: true, color: INK });
    if (sub) P.text(32, 38, sub, { size: 10.5, mono: true, color: FAINT });
    P.line(32, 50, 868, 50, { stroke: BORDER, sw: 1 });
  }
  function card(x, y, w, h, o) {
    o = o || {};
    P.rect(x, y, w, h, { fill: o.fill || SURF, stroke: o.stroke || BORDER, sw: o.sw || 1, radius: 6 });
  }
  function chip(x, y, text, good) {
    var w = text.length * 6.4 + 18;
    P.rect(x, y, w, 20, { fill: good ? ACCDIM : WARNDIM, stroke: good ? ACC : WARN, sw: 1, radius: 10 });
    P.text(x + 9, y + 10, text, { size: 10.5, base: 'middle', color: good ? ACC : WARN, bold: true });
  }
  function label(x, y, t) { P.text(x, y, t, { size: 10, mono: true, color: FAINT }); }
  function mono(x, y, t, col, size) { P.text(x, y, t, { size: size || 11.5, mono: true, color: col || INK }); }

  /* a five-piece split drawn on one line: u v x y z with the window bracketed */
  function drawSplit(x, y, w, u, v, xx, yy, z, p, o) {
    o = o || {};
    var cellW = Math.min(26, (w - 40) / Math.max(6, (u + v + xx + yy + z).length));
    var parts = [
      { s: u, c: DIM, dim: true }, { s: v, c: ACC, dim: false }, { s: xx, c: INFO, dim: false },
      { s: yy, c: ACC, dim: false }, { s: z, c: DIM, dim: true }
    ];
    var cx = x;
    var starts = [];
    parts.forEach(function (part) {
      var wd = Math.max(cellW, part.s.length * (cellW * 0.62));
      starts.push({ x: cx, w: wd, s: part.s, c: part.c, dim: part.dim });
      P.rect(cx, y, wd - 2, 24, {
        fill: part.dim ? SURF2 : (part.c === INFO ? '#e6eef7' : ACCDIM),
        stroke: part.c, sw: 1, radius: 3
      });
      P.text(cx + wd / 2 - 1, y + 12, part.s.length > 6 ? part.s.slice(0, 5) + '\u2026' : part.s,
        { size: 11, mono: true, align: 'center', base: 'middle', color: INK });
      cx += wd;
    });
    ['u', 'v', 'x', 'y', 'z'].forEach(function (nm, i) {
      P.text(starts[i].x + starts[i].w / 2 - 1, y - 8, nm, { size: 10, mono: true, align: 'center', color: FAINT });
    });
    /* the window bracket over v x y */
    var wx1 = starts[1].x, wx2 = starts[3].x + starts[3].w - 2;
    P.line(wx1, y + 30, wx2, y + 30, { stroke: WARN, sw: 1.6 });
    P.line(wx1, y + 26, wx1, y + 34, { stroke: WARN, sw: 1.6 });
    P.line(wx2, y + 26, wx2, y + 34, { stroke: WARN, sw: 1.6 });
    P.text((wx1 + wx2) / 2, y + 36, 'window |vxy| \u2264 p', { size: 9.5, align: 'center', color: WARN });
    return starts;
  }

  var SCENE_DRAW = {};

  /* ---- 1. what the lemma is for ---- */
  SCENE_DRAW.what = function (t, sc, p) {
    head('What the lemma is for', 'one direction only: it refutes, it never certifies');

    if (p > 0.02) {
      card(32, 66, 404, 250, { fill: SURF, stroke: ACC, sw: 1.5 });
      P.text(48, 84, 'what a refutation gives you', { size: 12, bold: true, color: ACC });
      mono(48, 110, 'L is a CFL  \u21d2  \u2203p \u2200w \u2208 L, |w| \u2265 p', INK, 11.5);
      mono(48, 130, '              \u21d2  \u2203 split u v x y z', INK, 11.5);
      mono(48, 150, '              \u21d2  \u2200i: u v\u2071 x y\u2071 z \u2208 L', INK, 11.5);
      P.line(48, 166, 420, 166, { stroke: BORDER, sw: 1 });
      P.text(48, 180, 'Contrapositive, which is the only way it is used:', { size: 10.5, color: DIM });
      mono(48, 202, 'no such p  \u21d2  L is not a CFL', BAD, 12);
      P.text(48, 228, 'The number p belongs to the language, not to the string:', { size: 10, color: DIM });
      P.text(48, 246, 'one p must serve every string of length p or more.', { size: 10, color: DIM });
      P.text(48, 272, 'For a grammar in Chomsky normal form with k nonterminals', { size: 10, color: FAINT });
      mono(48, 290, 'p = 2\u1d4f  \u2192  2, 4, 8, 16, 32, 64, 128, 256', ACC, 11);
    }

    if (p > 0.36) {
      card(452, 66, 416, 250, { fill: BADDIM, stroke: BAD, sw: 1.4 });
      P.text(468, 84, 'what it never gives you', { size: 12, bold: true, color: BAD });
      P.text(468, 110, 'Surviving the lemma is not a certificate. A language', { size: 10.5, color: INK });
      P.text(468, 128, 'may satisfy it and still not be context-free.', { size: 10.5, color: INK });
      mono(468, 156, 'passes the lemma  \u21cf  is a CFL', BAD, 12);
      P.line(468, 172, 852, 172, { stroke: BAD, sw: 1, dash: [3, 3] });
      P.text(468, 190, 'Scene 8 exhibits one: 228 strings, every p from 1 to 6,', { size: 10.5, color: INK });
      P.text(468, 208, 'no refutation, and the language is still not context-free.', { size: 10.5, color: INK });
      P.text(468, 236, 'The second direction trap is smaller: a CFL can fail the', { size: 10.5, color: INK });
      P.text(468, 254, 'lemma at p = 1 and pass from p = 2. Scene 6 computes that.', { size: 10.5, color: INK });
      P.text(468, 282, 'To show a language IS context-free you build a grammar or a PDA.', { size: 10.5, color: ACC });
    }

    if (p > 0.72) {
      card(32, 332, 836, 108, { fill: SURF2, stroke: BORDER });
      P.text(48, 352, 'GATE 2027 CS syllabus, Section 6, printed verbatim:', { size: 11, bold: true, color: INK });
      P.text(48, 374, '\u201cRegular expressions and finite automata. Context-free grammars and push-down automata. Regular and context-free', { size: 10, color: INK });
      P.text(48, 392, 'languages, pumping lemma. Turing machines and undecidability.\u201d', { size: 10, color: INK });
      chip(48, 408, 'class A: the phrase pumping lemma is in the syllabus', true);
      P.text(430, 416, 'both halves of the lemma are examinable: regular and context-free', { size: 10, color: DIM });
    }
  };

  /* ---- 2. where the five parts come from ---- */
  SCENE_DRAW.tree = function (t, sc, p) {
    head('Where the five parts come from', 'a tall tree repeats a nonterminal on one path');

    var cx = 230, top = 70;
    var nodes = [
      { x: cx, y: top, s: 'S', hi: false },
      { x: cx - 100, y: top + 52, s: 'A', hi: true },
      { x: cx + 100, y: top + 52, s: 'C', hi: false },
      { x: cx - 150, y: top + 104, s: 'a', leaf: true },
      { x: cx - 50, y: top + 104, s: 'A', hi: true },
      { x: cx + 40, y: top + 104, s: 'B', hi: false },
      { x: cx + 160, y: top + 104, s: 'c', leaf: true },
      { x: cx - 80, y: top + 156, s: 'b', leaf: true },
      { x: cx - 20, y: top + 156, s: 'b', leaf: true }
    ];
    var edges = [[0, 1], [0, 2], [1, 3], [1, 4], [4, 5], [5, 7], [5, 8], [2, 6]];
    if (p > 0.02) {
      edges.forEach(function (e, i) {
        if (p < 0.04 + i * 0.03) return;
        P.line(nodes[e[0]].x, nodes[e[0]].y + 13, nodes[e[1]].x, nodes[e[1]].y - 13,
          { stroke: BORDER, sw: 1.4 });
      });
    }
    nodes.forEach(function (nd, i) {
      if (p < 0.04 + i * 0.03) return;
      P.circle(nd.x, nd.y, 13, {
        fill: nd.hi ? ACCDIM : (nd.leaf ? SURF2 : SURF),
        stroke: nd.hi ? ACC : (nd.leaf ? BORDER : DIM), sw: nd.hi ? 1.8 : 1.2
      });
      P.text(nd.x, nd.y, nd.s, { size: 11, mono: true, align: 'center', base: 'middle', color: nd.hi ? ACC : INK });
    });

    if (p > 0.45) {
      P.text(32, 76, 'the same nonterminal', { size: 10.5, color: ACC, bold: true });
      P.text(32, 92, 'twice on one path', { size: 10.5, color: ACC, bold: true });
      P.text(32, 116, 'height 4, so more', { size: 10, color: DIM });
      P.text(32, 132, 'than 3 nonterminals', { size: 10, color: DIM });
      P.text(32, 148, 'on the path: repeat', { size: 10, color: DIM });
      P.line(120, 96, 132, 96, { stroke: ACC, sw: 1.2, dash: [3, 3] });
    }

    if (p > 0.62) {
      card(400, 66, 468, 168, { fill: SURF, stroke: BORDER });
      P.text(416, 84, 'the cut the repeated pair makes', { size: 11.5, bold: true, color: INK });
      mono(416, 108, 'upper A derives  v x y', ACC, 11.5);
      mono(416, 128, 'lower A derives  x', INFO, 11.5);
      mono(416, 148, 'so the whole string is  u v x y z', INK, 11.5);
      P.text(416, 172, 'Replacing the lower subtree by the upper one repeats', { size: 10, color: DIM });
      P.text(416, 190, 'v and y together; that is the only freedom the tree gives.', { size: 10, color: DIM });
      P.text(416, 212, 'Both copies derive from A, so either may stand for the other.', { size: 10, color: ACC });
    }

    if (p > 0.8) {
      P.text(32, 250, 'the string, cut into five pieces', { size: 10.5, bold: true, color: INK });
      drawSplit(32, 272, 836, 'a', 'b', 'b', '', 'c c', 0);
      P.text(32, 330, 'u = a, v = b, x = b, y = the empty string, z = c c. Here y is empty, which the lemma allows:', { size: 10, color: DIM });
      P.text(32, 348, 'the second condition forbids only v and y being empty together, never one of them alone.', { size: 10, color: DIM });
      card(32, 366, 836, 74, { fill: SURF2, stroke: BORDER });
      P.text(48, 386, 'The length of vxy is bounded by the subtree under the upper A, which is at most 2\u1d4f leaves:', { size: 10.5, color: INK });
      mono(48, 410, 'p = 2\u1d4f  for k nonterminals in Chomsky normal form  \u2192  2, 4, 8, 16, 32, 64, 128, 256', ACC, 11);
    }
  };

  /* ---- 3. the two conditions ---- */
  SCENE_DRAW.conditions = function (t, sc, p) {
    head('The two conditions, and the direction', 'the lemma is a sentence with four quantifiers in a fixed order');

    if (p > 0.02) {
      card(32, 66, 836, 74, { fill: SURF, stroke: ACC, sw: 1.4 });
      mono(48, 92, '\u2203p  \u2200w \u2208 L with |w| \u2265 p  \u2203 u v x y z  \u2200i \u2265 0 :  u v\u2071 x y\u2071 z \u2208 L', INK, 13);
      P.text(48, 118, 'read left to right: the language picks p, you pick w, the lemma picks the split, you pick i', { size: 10, color: DIM });
    }

    if (p > 0.2) {
      card(32, 154, 404, 116, { fill: SURF, stroke: WARN, sw: 1.3 });
      P.text(48, 172, 'condition 1: the window is short', { size: 11.5, bold: true, color: WARN });
      mono(48, 198, '|v x y| \u2264 p', INK, 13);
      P.text(48, 222, 'both copies of the repeated nonterminal sit inside p', { size: 10, color: DIM });
      P.text(48, 240, 'letters, so the window cannot reach across the string.', { size: 10, color: DIM });
      P.text(48, 258, 'This is the condition that makes a contradiction possible.', { size: 10, color: WARN });
    }
    if (p > 0.34) {
      card(452, 154, 416, 116, { fill: SURF, stroke: INFO, sw: 1.3 });
      P.text(468, 172, 'condition 2: something actually moves', { size: 11.5, bold: true, color: INFO });
      mono(468, 198, 'v y \u2260 \u03b5', INK, 13);
      P.text(468, 222, 'the lower copy derives a strictly smaller span than the', { size: 10, color: DIM });
      P.text(468, 240, 'upper one, so at least one of v and y is non-empty.', { size: 10, color: DIM });
      P.text(468, 258, '\u03b5 is the empty string; \u2260 means \u201cnot equal to\u201d.', { size: 10, color: FAINT });
    }

    if (p > 0.5) {
      P.text(32, 292, 'the string cut at a split that satisfies both conditions', { size: 10.5, bold: true, color: INK });
      drawSplit(32, 312, 836, 'a a', 'b b', 'b b', 'b', 'c c c', 0);
      P.text(32, 372, 'u = a a, v = b b, x = b b, y = b, z = c c c. The window vxy is 5 letters, so this split is legal only for p \u2265 5.', { size: 10, color: DIM });
    }

    if (p > 0.74) {
      card(32, 390, 836, 52, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
      P.text(48, 408, 'Read as a game: you choose w, the adversary chooses the split, you choose i, and you win if some i leaves the language.', { size: 10.5, color: INK });
      P.text(48, 428, 'A proof must win for every p the adversary names, so it leaves p as a symbol and builds w out of p.', { size: 10.5, color: WARN });
    }
  };

  /* ---- 4. the game on a^n b^n c^n ---- */
  SCENE_DRAW.game = function (t, sc, p) {
    head('Playing the game on a\u207fb\u207fc\u207f', 'w = p a\u2019s, then p b\u2019s, then p c\u2019s; the window cannot touch all three blocks');

    if (p > 0.02) {
      P.text(32, 70, 'the witness string, three equal blocks', { size: 10.5, bold: true, color: INK });
      var bx = 32, bw = 268;
      [['a', 'block 1: p letters'], ['b', 'block 2: p letters'], ['c', 'block 3: p letters']].forEach(function (bl, i) {
        if (p < 0.06 + i * 0.06) return;
        P.rect(bx + i * (bw + 16), 86, bw, 40, {
          fill: i === 1 ? ACCDIM : SURF2, stroke: i === 1 ? ACC : BORDER, sw: 1.2, radius: 5
        });
        P.text(bx + i * (bw + 16) + bw / 2, 106, bl[0] + '\u1d56', { size: 17, mono: true, align: 'center', base: 'middle', color: i === 1 ? ACC : INK });
        P.text(bx + i * (bw + 16) + bw / 2, 138, bl[1], { size: 9.5, align: 'center', color: FAINT });
      });
    }

    if (p > 0.24) {
      card(32, 156, 836, 62, { fill: WARNDIM, stroke: WARN, sw: 1.3 });
      P.text(48, 174, 'Why the window cannot touch all three blocks:', { size: 11, bold: true, color: WARN });
      P.text(48, 194, 'a window holding a letter of block 1 and a letter of block 3 must hold every one of the p letters of block 2, so it is at least p + 2 long.', { size: 10.5, color: INK });
      P.text(48, 212, 'The condition says at most p. So the window meets one block or two, and that is the whole case analysis.', { size: 10.5, color: INK });
    }

    if (p > 0.44) {
      card(32, 230, 404, 148, { fill: SURF, stroke: BAD, sw: 1.3 });
      P.text(48, 248, 'case 1: the window sits in one block', { size: 11.5, bold: true, color: BAD });
      drawSplit(48, 268, 360, '', 'a', '', 'a', 'a b b c c', 0);
      P.text(48, 322, 'pumping changes one count and leaves the other two, so', { size: 10, color: INK });
      P.text(48, 340, 'the three counts no longer agree: the string leaves L.', { size: 10, color: INK });
      P.text(48, 362, 'i = 0 deletes letters and breaks it the same way.', { size: 10, color: DIM });
    }
    if (p > 0.58) {
      card(452, 230, 416, 148, { fill: SURF, stroke: BAD, sw: 1.3 });
      P.text(468, 248, 'case 2: the window straddles two blocks', { size: 11.5, bold: true, color: BAD });
      drawSplit(468, 268, 372, 'a a', 'a', '', 'b', 'b c c c', 0);
      P.text(468, 322, 'pumping changes two counts by different amounts and', { size: 10, color: INK });
      P.text(468, 340, 'leaves the third alone, so the counts differ again.', { size: 10, color: INK });
      P.text(468, 362, 'The two cases cover every split the lemma allows.', { size: 10, color: DIM });
    }

    if (p > 0.78) {
      card(32, 392, 836, 52, { fill: BADDIM, stroke: BAD, sw: 1.2 });
      P.text(48, 410, 'Every split either changes one count or changes two by unequal amounts. So no split survives, for every p, and a\u207fb\u207fc\u207f is not context-free.', { size: 10.5, color: INK });
      P.text(48, 430, 'Note what the proof did: it refuted every p at once, because p was never given a number.', { size: 10.5, color: BAD });
    }
  };

  /* ---- 5. the search ---- */
  SCENE_DRAW.search = function (t, sc, p) {
    head('The search, and what it can prove', 'exhaustive over a stated family, pumping for i = 0 to 6');

    var x0 = 300, cw = 94, y0 = 92, rh = 40;
    label(x0, y0 - 10, 'p = 1');
    PS.forEach(function (pp, i) {
      P.text(x0 + i * cw + cw / 2 - 4, y0 - 10, 'p = ' + pp, { size: 10, mono: true, align: 'center', color: FAINT });
    });
    label(32, y0 - 10, 'language');

    TABLE.forEach(function (r, ri) {
      var y = y0 + ri * rh;
      if (p < 0.04 + ri * 0.05) return;
      P.text(32, y + 20, r.name, { size: 11.5, mono: true, color: INK });
      P.text(32, y + 34, r.famSize + ' test strings', { size: 9, color: FAINT });
      r.cells.forEach(function (c, ci) {
        var x = x0 + ci * cw;
        P.rect(x, y + 2, cw - 8, rh - 8, {
          fill: c.refuted ? BADDIM : ACCDIM, stroke: c.refuted ? BAD : ACC, sw: 1, radius: 4
        });
        P.text(x + (cw - 8) / 2, y + 13, c.refuted ? 'refuted' : 'survives',
          { size: 9.5, align: 'center', color: c.refuted ? BAD : ACC, bold: true });
        P.text(x + (cw - 8) / 2, y + 25, c.refuted ? c.witness : 'at this p',
          { size: 9, mono: true, align: 'center', color: c.refuted ? INK : DIM });
      });
    });

    if (p > 0.62) {
      card(32, 340, 404, 104, { fill: SURF, stroke: BORDER });
      P.text(48, 358, 'what a refutation at one p proves', { size: 11, bold: true, color: INK });
      P.text(48, 380, 'Exactly one thing: no context-free grammar for this', { size: 10, color: INK });
      P.text(48, 398, 'language has this pumping length. On a\u207fb\u207fc\u207f the search', { size: 10, color: INK });
      P.text(48, 416, 'refutes p = 1 to 6, trying 427 splits at p = 6.', { size: 10, color: INK });
    }
    if (p > 0.76) {
      card(452, 340, 416, 104, { fill: BADDIM, stroke: BAD, sw: 1.2 });
      P.text(468, 358, 'what it does not prove', { size: 11, bold: true, color: BAD });
      P.text(468, 380, 'The lemma only promises that some p works, so six', { size: 10, color: INK });
      P.text(468, 398, 'refutations leave infinitely many p open. A finite search', { size: 10, color: INK });
      P.text(468, 416, 'never finishes; the argument in scene 4 does, in two cases.', { size: 10, color: INK });
    }
  };

  /* ---- 6. the direction ---- */
  SCENE_DRAW.direction = function (t, sc, p) {
    head('Why a small p proves nothing', 'a context-free language can fail the lemma at p = 1');

    if (p > 0.02) {
      card(32, 66, 404, 168, { fill: BADDIM, stroke: BAD, sw: 1.3 });
      P.text(48, 84, 'p = 1, refuted by the string ab', { size: 11.5, bold: true, color: BAD });
      drawSplit(48, 104, 360, '', 'a', '', '', 'b', 0);
      P.text(48, 158, 'The only window is one letter, so v is one letter and y', { size: 10, color: INK });
      P.text(48, 176, 'is empty. Pumping a gives aab; pumping b gives abb.', { size: 10, color: INK });
      P.text(48, 194, 'Neither is in a\u207fb\u207f, so this p is not valid.', { size: 10, color: INK });
      P.text(48, 216, 'Computed: 1 string tested, and it refutes p = 1.', { size: 10, color: BAD });
    }
    if (p > 0.28) {
      card(452, 66, 416, 168, { fill: ACCDIM, stroke: ACC, sw: 1.3 });
      P.text(468, 84, 'p = 2 to 6, survives', { size: 11.5, bold: true, color: ACC });
      drawSplit(468, 104, 372, 'a a', 'a', '', 'b', 'b b', 0);
      P.text(468, 158, 'Take v as one a and y as one b: the window is two letters,', { size: 10, color: INK });
      P.text(468, 176, 'and pumping gives a\u207f\u207a\u2071 b\u207f\u207a\u2071, still in the language.', { size: 10, color: INK });
      P.text(468, 194, 'Computed: 12 test strings, no refutation at any p from 2.', { size: 10, color: INK });
      P.text(468, 216, 'The two counts move together, which is the whole trick.', { size: 10, color: ACC });
    }

    if (p > 0.52) {
      P.text(32, 258, 'the whole table for the two context-free languages, computed', { size: 10.5, bold: true, color: INK });
      var y = 280;
      ['a\u207fb\u207f', 'a\u207fb\u1d50c\u207f\u207a\u1d50'].forEach(function (nm, ri) {
        P.text(32, y + ri * 34 + 14, nm, { size: 11.5, mono: true, color: INK });
        PS.forEach(function (pp, ci) {
          var c = cell(ri === 0 ? 'anbn' : 'anbmcnm', pp);
          P.rect(160 + ci * 76, y + ri * 34, 70, 26, {
            fill: c.refuted ? BADDIM : ACCDIM, stroke: c.refuted ? BAD : ACC, sw: 1, radius: 4
          });
          P.text(160 + ci * 76 + 35, y + ri * 34 + 13, c.refuted ? 'refuted' : 'survives',
            { size: 9, align: 'center', color: c.refuted ? BAD : ACC, bold: true });
        });
      });
      PS.forEach(function (pp, ci) {
        P.text(160 + ci * 76 + 35, y - 12, 'p = ' + pp, { size: 9, mono: true, align: 'center', color: FAINT });
      });
      P.text(632, y + 12, 'Both languages are context-free', { size: 10, color: DIM });
      P.text(632, y + 30, 'by an explicit grammar.', { size: 10, color: DIM });
      P.text(632, y + 48, 'The second is context-free too, and', { size: 10, color: DIM });
      P.text(632, y + 64, 'four small values of p still fail it.', { size: 10, color: BAD });
    }

    if (p > 0.76) {
      card(32, 352, 836, 92, { fill: WARNDIM, stroke: WARN, sw: 1.2 });
      P.text(48, 372, 'The direction trap, stated once:', { size: 11, bold: true, color: WARN });
      P.text(48, 394, 'A context-free language must have some valid pumping length. It does not have to have p = 1, or p = 2, or any particular value.', { size: 10.5, color: INK });
      P.text(48, 414, 'So \u201cthe lemma fails at p = 1, therefore the language is not context-free\u201d is invalid, and it is a standard wrong answer.', { size: 10.5, color: INK });
      P.text(48, 434, 'The valid form: \u201cfor every p there is a string that no split survives\u201d, with the string built out of p.', { size: 10.5, color: WARN });
    }
  };

  /* ---- 7. Ogden's lemma ---- */
  SCENE_DRAW.ogden = function (t, sc, p) {
    head('Ogden\u2019s lemma', 'you choose the marks; the pump must land on one of them');

    if (p > 0.02) {
      card(32, 66, 836, 108, { fill: SURF, stroke: ACC, sw: 1.4 });
      P.text(48, 84, 'Mark at least p positions of the string first. Then the split must satisfy three conditions:', { size: 11, bold: true, color: INK });
      mono(48, 106, '1  v y contains at least one marked position', ACC, 11);
      mono(48, 126, '2  v x y contains at most p marked positions', ACC, 11);
      mono(48, 146, '3  u v\u2071 x y\u2071 z \u2208 L for every i \u2265 0', ACC, 11);
      P.text(48, 164, 'Conditions 1 and 2 are what the plain lemma does not have, and they are what make the tool stronger.', { size: 9.5, color: DIM });
    }

    if (p > 0.24) {
      P.text(32, 192, 'a\u207fb\u207fc\u207f with every a marked', { size: 10.5, bold: true, color: INK });
      var x = 32;
      for (var i = 0; i < 18; i++) {
        var ch = i < 6 ? 'a' : i < 12 ? 'b' : 'c';
        P.rect(x + i * 22, 206, 20, 24, {
          fill: ch === 'a' ? ACCDIM : SURF2, stroke: ch === 'a' ? ACC : BORDER, sw: 1, radius: 3
        });
        P.text(x + i * 22 + 10, 218, ch, { size: 11, mono: true, align: 'center', base: 'middle', color: INK });
        if (ch === 'a') P.circle(x + i * 22 + 10, 200, 3, { fill: ACC });
      }
      P.text(452, 212, 'marked positions: 6, and p = 6', { size: 10, color: ACC });
      P.text(452, 230, 'a window of 6 letters cannot reach from', { size: 10, color: DIM });
      P.text(452, 246, 'the a\u2019s to the c\u2019s, because the b\u2019s alone', { size: 10, color: DIM });
      P.text(452, 262, 'fill it. So the split is forced into the a\u2019s.', { size: 10, color: DIM });
    }

    if (p > 0.46) {
      P.text(32, 286, 'splits the search must try, with the a\u2019s marked, against the plain lemma', { size: 10.5, bold: true, color: INK });
      var bx = 32, bmax = 0;
      OGDEN_ANBNCN.forEach(function (r) { if (r.splits > bmax) bmax = r.splits; });
      OGDEN_ANBNCN.forEach(function (r, i) {
        if (p < 0.5 + i * 0.03) return;
        var h = (r.splits / bmax) * 76;
        P.rect(bx + i * 92, 400 - h, 58, h, { fill: ACCDIM, stroke: ACC, sw: 1, radius: 3 });
        P.text(bx + i * 92 + 29, 400 - h - 12, String(r.splits), { size: 10, mono: true, align: 'center', color: ACC, bold: true });
        P.text(bx + i * 92 + 29, 412, 'p = ' + r.p, { size: 9, mono: true, align: 'center', color: FAINT });
      });
      P.text(620, 330, 'plain lemma, no marking:', { size: 10, color: DIM });
      mono(620, 350, 'n = 9, p = 3  \u2192  121 splits', INK, 10.5);
      mono(620, 370, 'n = 18, p = 6 \u2192  1106 splits', INK, 10.5);
      P.text(620, 394, 'The marking filters most of them', { size: 10, color: ACC });
      P.text(620, 410, 'out before any pumping is tried.', { size: 10, color: ACC });
    }

    if (p > 0.82) {
      chip(32, 428, 'same language, same verdict, two cases instead of six', true);
    }
  };

  /* ---- 8. the counterexample ---- */
  SCENE_DRAW.counterexample = function (t, sc, p) {
    head('A language that passes and is still not context-free', 'a\u2071b\u02b2c\u1d4f d\u02e1 with i = 0 or j = k = l');

    if (p > 0.02) {
      card(32, 66, 836, 54, { fill: SURF2, stroke: BORDER });
      mono(48, 86, 'L = { a\u2071 b\u02b2 c\u1d4f d\u02e1 : i = 0  or  j = k = l }', INK, 12.5);
      P.text(48, 106, 'Either there is no a at all, or the three counts after it are equal. Four blocks, and one of them is optional.', { size: 10, color: DIM });
    }

    if (p > 0.2) {
      var x0 = 300, cw = 94, y0 = 138;
      PS.forEach(function (pp, i) {
        P.text(x0 + i * cw + cw / 2 - 4, y0 - 8, 'p = ' + pp, { size: 9.5, mono: true, align: 'center', color: FAINT });
      });
      ['plain pumping lemma', "Ogden, b\u2019s marked"].forEach(function (nm, ri) {
        if (p < 0.24 + ri * 0.08) return;
        var y = y0 + ri * 40;
        P.text(32, y + 20, nm, { size: 10.5, color: INK });
        var r = ri === 0 ? row('d4') : null;
        PS.forEach(function (pp, ci) {
          var c = ri === 0 ? r.cells[ci] : OGDEN_D4[ci];
          P.rect(x0 + ci * cw, y + 4, cw - 8, 30, {
            fill: c.refuted ? BADDIM : ACCDIM, stroke: c.refuted ? BAD : ACC, sw: 1, radius: 4
          });
          P.text(x0 + ci * cw + (cw - 8) / 2, y + 14, c.refuted ? 'refuted' : 'survives',
            { size: 9, align: 'center', color: c.refuted ? BAD : ACC, bold: true });
          P.text(x0 + ci * cw + (cw - 8) / 2, y + 27, c.refuted ? c.witness : '228 strings',
            { size: 8.5, mono: true, align: 'center', color: c.refuted ? INK : DIM });
        });
      });
      P.text(32, y0 + 92, 'Two rows, one language: the plain lemma never refutes it, and Ogden\u2019s lemma refutes every p. That gap is why the lemma is not sufficient.', { size: 10, color: DIM });
    }

    if (p > 0.62) {
      card(32, 246, 404, 140, { fill: SURF, stroke: BORDER });
      P.text(48, 264, 'why the plain lemma cannot touch it', { size: 11, bold: true, color: INK });
      P.text(48, 286, 'A string with no a is in the language whatever its', { size: 10, color: INK });
      P.text(48, 304, 'counts are, so pumping inside it is harmless. A string', { size: 10, color: INK });
      P.text(48, 322, 'with one a can pump inside the a\u2019s, and the three', { size: 10, color: INK });
      P.text(48, 340, 'counts stay equal. Either way a split survives.', { size: 10, color: INK });
      P.text(48, 364, 'The window condition alone cannot stop it.', { size: 10, color: DIM });
    }
    if (p > 0.72) {
      card(452, 246, 416, 140, { fill: SURF, stroke: BAD, sw: 1.2 });
      P.text(468, 264, 'why it is still not context-free', { size: 11, bold: true, color: BAD });
      mono(468, 288, 'L \u2229 a\u207a b* c* d* = a\u2071 b\u02b2 c\u02b2 d\u02b2, i \u2265 1', INK, 11);
      P.text(468, 312, 'That intersection is three equal counts, and the search', { size: 10, color: INK });
      P.text(468, 330, 'refutes it at every p from 1 to 6 on 18 test strings.', { size: 10, color: INK });
      P.text(468, 352, 'Context-free languages are closed under intersection with', { size: 10, color: INK });
      P.text(468, 370, 'a regular language, so L cannot be context-free.', { size: 10, color: BAD });
    }

    if (p > 0.88) {
      chip(32, 400, 'passes the lemma, fails Ogden, not context-free', false);
      P.text(360, 408, 'One language, three answers, and only the third one is the truth about the class.', { size: 10, color: DIM });
    }
  };

  /* ---- 9. the closure route ---- */
  SCENE_DRAW.closure = function (t, sc, p) {
    head('The closure route', 'GATE CSE 2019, four languages, classified by the same search');

    var y0 = 92, rh = 44;
    P.text(32, y0 - 10, 'the four options of GATE CSE 2019', { size: 10, mono: true, color: FAINT });
    GATE19.forEach(function (g, ri) {
      if (p < 0.04 + ri * 0.06) return;
      var y = y0 + ri * rh;
      P.rect(32, y, 836, rh - 8, { fill: ri === 2 ? BADDIM : SURF, stroke: ri === 2 ? BAD : BORDER, sw: ri === 2 ? 1.3 : 1, radius: 5 });
      P.text(48, y + 16, g.name, { size: 12, mono: true, color: INK });
      P.text(48, y + 31, g.famSize + ' test strings', { size: 9, color: FAINT });
      PS.forEach(function (pp, ci) {
        var c = g.cells[ci];
        P.rect(300 + ci * 76, y + 6, 70, 24, {
          fill: c.refuted ? BADDIM : ACCDIM, stroke: c.refuted ? BAD : ACC, sw: 1, radius: 3
        });
        P.text(300 + ci * 76 + 35, y + 18, c.refuted ? 'refuted' : 'survives',
          { size: 8.5, align: 'center', color: c.refuted ? BAD : ACC, bold: true });
      });
      P.text(770, y + 18, ri === 2 ? 'answer' : 'not the answer', {
        size: 9.5, color: ri === 2 ? BAD : DIM, bold: ri === 2
      });
    });
    PS.forEach(function (pp, ci) {
      P.text(300 + ci * 76 + 35, y0 - 10, 'p = ' + pp, { size: 9, mono: true, align: 'center', color: FAINT });
    });

    if (p > 0.5) {
      card(32, 282, 404, 104, { fill: SURF, stroke: BORDER });
      P.text(48, 300, 'why the third one breaks', { size: 11, bold: true, color: INK });
      P.text(48, 322, 'The mirrored copy w\u1d3f has already used the stack to', { size: 10, color: INK });
      P.text(48, 340, 'match w, so the trailing b\u207f has nothing left to count', { size: 10, color: INK });
      P.text(48, 358, 'against. Move the a\u207f inside the mirror and it works,', { size: 10, color: INK });
      P.text(48, 376, 'which is exactly what option 2 does.', { size: 10, color: INK });
    }
    if (p > 0.64) {
      card(452, 282, 416, 104, { fill: SURF, stroke: ACC, sw: 1.2 });
      P.text(468, 300, 'GATE CSE 2016 Set 2, the same test', { size: 11, bold: true, color: ACC });
      mono(468, 324, 'a\u207fb\u1d50c\u207f\u207a\u1d50   no refutation from p = 5', ACC, 11);
      mono(468, 344, 'a\u207fb\u207fc\u00b2\u207f   refuted at every p', BAD, 11);
      P.text(468, 368, 'A single counter can hold the sum n + m, so the first is', { size: 10, color: INK });
    }
    if (p > 0.8) {
      card(32, 398, 836, 46, { fill: SURF2, stroke: BORDER });
      P.text(48, 416, 'The exam route in one line: intersect with a regular set or apply a homomorphism, then run the counting test on what is left.', { size: 10.5, color: INK });
      P.text(48, 434, 'Both operations preserve context-freeness, so a failure afterwards convicts the original language.', { size: 10, color: DIM });
    }
  };

  /* ---- 10. the exam ---- */
  SCENE_DRAW.exam = function (t, sc, p) {
    head('How GATE asks it', 'four shapes, one counting test, two direction traps');

    var shapes = [
      ['1', 'which of these is not context-free', 'classify four languages'],
      ['2', 'is this grammar\u2019s pumping length valid', 'given k nonterminals, p = 2\u1d4f'],
      ['3', 'what does this split force', 'read the window, not the string'],
      ['4', 'which statement is false', 'three true, one false']
    ];
    shapes.forEach(function (s, i) {
      if (p < 0.04 + i * 0.07) return;
      var y = 66 + i * 46;
      P.circle(48, y + 16, 12, { fill: ACCDIM, stroke: ACC, sw: 1.2 });
      P.text(48, y + 16, s[0], { size: 11, mono: true, align: 'center', base: 'middle', color: ACC, bold: true });
      P.text(70, y + 10, s[1], { size: 11, color: INK });
      P.text(70, y + 26, s[2], { size: 9.5, color: FAINT });
    });

    if (p > 0.42) {
      card(452, 66, 416, 168, { fill: SURF, stroke: ACC, sw: 1.4 });
      P.text(468, 84, 'the counting test, which answers shape 1', { size: 11.5, bold: true, color: ACC });
      P.text(468, 108, 'Count the independent equalities the language demands.', { size: 10.5, color: INK });
      P.text(468, 126, 'A push-down automaton has one stack, so it can hold one', { size: 10.5, color: INK });
      P.text(468, 144, 'unbounded count while it compares.', { size: 10.5, color: INK });
      mono(468, 172, 'a\u207fb\u1d50c\u207f\u207a\u1d50   one count: the sum   \u2192 CFL', VAL, 11);
      mono(468, 194, 'a\u207fb\u207fc\u207f     two counts        \u2192 not CFL', BAD, 11);
      mono(468, 216, 'a\u207fb\u207fw\u1d3f   nested, not crossing \u2192 CFL', VAL, 11);
    }

    if (p > 0.62) {
      card(32, 252, 836, 74, { fill: BADDIM, stroke: BAD, sw: 1.2 });
      P.text(48, 270, 'the two direction traps, which decide the rest', { size: 11, bold: true, color: BAD });
      P.text(48, 292, 'A language that survives the lemma is not thereby context-free. Scene 8 computes a language that survives at every p and is not.', { size: 10.5, color: INK });
      P.text(48, 312, 'A language that fails at a small p is not thereby non-context-free. Scene 6 computes a CFL that fails at p = 1.', { size: 10.5, color: INK });
    }

    if (p > 0.82) {
      P.text(32, 352, 'previous-year anchors, all recomputed on this page', { size: 10.5, bold: true, color: INK });
      P.text(32, 374, 'GATE CSE 2016 Set 2  \u2014  a\u207fb\u1d50c\u207f\u207a\u1d50 against a\u207fb\u207fc\u00b2\u207f: the first is context-free, the second is not.', { size: 10.5, color: INK });
      P.text(32, 394, 'GATE CSE 2017 Set 2  \u2014  four statements; a\u207fb\u207fc\u00b2\u207f is not context-free but recursive, a\u207fb\u207f is deterministic context-free.', { size: 10.5, color: INK });
      P.text(32, 414, 'GATE CSE 2019       \u2014  which of four languages is not context-free: w a\u207fw\u1d3fb\u207f.', { size: 10.5, color: INK });
      chip(32, 430, 'the lemma kills languages, never saves them', true);
    }
  };

  function drawFrame(t) {
    if (!P) return;
    P.clear();
    P.alpha(1);
    var i = K.sceneAt ? K.sceneAt(t) : 0;
    var sc = window.LESSON_TIMELINE.scenes[i];
    if (!sc) return;
    var span = Math.max(0.001, sc.end - sc.start);
    var p = K.clamp01((t - sc.start) / span);
    var fn = SCENE_DRAW[sc.id];
    if (fn) {
      try { fn(t, sc, p); }
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
        new window.p5(function (s) {
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
    window.__lessonChecks = CHECKS;
    window.__model = {
      table: TABLE, ogdenAnBnCn: OGDEN_ANBNCN, ogdenD4: OGDEN_D4,
      gate19: GATE19, splits: SPLITS, p2k: P2K, side: SIDE,
      famSizes: {
        anbn: F.anbn.length, anbncn: F.anbncn.length, ww: F.ww.length,
        anbnc2n: F.anbnc2n.length, anbmcnm: F.anbmcnm.length, d4: F.d4.length,
        inter: F.inter.length, aprime: F.aprime.length
      },
      CHECKS: CHECKS
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
