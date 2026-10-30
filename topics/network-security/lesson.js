/* ==========================================================================
   network-security — lesson.js
   Four layers, in order:
     1. THE MODEL      — every number the lesson shows, computed here.
     2. THE CHECKS     — each computed value re-verified against a definition.
     3. RENDER         — reads the model; never re-derives it.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   The drawing code reads V. It performs no cryptography of its own: every
   figure on the canvas was computed once here and checked against the rule it
   is supposed to satisfy — the pair count against a nested loop, the RSA
   inverse against gcd and against a full round trip of all 220 messages, the
   primes recovered from n and phi(n) against their product and their totient,
   square-and-multiply against a naive loop and against the cycle of powers,
   the signature against verification under the correct key and failure under
   a wrong one, the birthday probabilities against the falling product and
   against the pigeonhole, the firewall decisions against first-match
   evaluation and against a reordering, and the layer capabilities against the
   four options of the 2011 item.
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
  var SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';

/* ======================================================================
   LAYER 1 - THE MODEL
   ====================================================================== */

var CHECKS = [];
function chk(name, pass, detail) {
  CHECKS.push({ name: name, pass: !!pass, detail: detail === undefined ? '' : String(detail) });
}

function fx(v, k) { return Number(v).toFixed(k === undefined ? 4 : k); }
function near(a, b, tol) { return Math.abs(a - b) < (tol === undefined ? 1e-9 : tol); }

/* ---------- arithmetic primitives ---------- */
function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

function modpow(b, e, m) {
  var r = 1; b = b % m;
  while (e > 0) {
    if (e % 2 === 1) r = (r * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
  }
  return r;
}

function modinv(a, m) {
  var r0 = a, r1 = m, s0 = 1, s1 = 0;
  while (r1 !== 0) {
    var q = Math.floor(r0 / r1);
    var t = r0 - q * r1; r0 = r1; r1 = t;
    t = s0 - q * s1; s0 = s1; s1 = t;
  }
  if (r0 !== 1) return null;
  return ((s0 % m) + m) % m;
}

function isPrime(n) {
  if (n < 2) return false;
  for (var i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

var V = {};

/* ---------- 1. the three properties ---------- */
V.goals = [
  { name: 'Confidentiality', question: 'can anyone else read it?',
    tool: 'encrypt with the receiver public key' },
  { name: 'Integrity', question: 'did the bits arrive unchanged?',
    tool: 'hash the message, compare the digest' },
  { name: 'Authentication', question: 'who sent it, provably?',
    tool: 'sign with the sender private key' }
];

/* ---------- 2. key counts ---------- */
V.keys = (function () {
  var rows = [], N, i, j, pairs;
  for (N = 2; N <= 10; N++) {
    pairs = 0;
    for (i = 1; i <= N; i++) for (j = i + 1; j <= N; j++) pairs++;
    rows.push({ N: N, formula: N * (N - 1) / 2, counted: pairs, asymKeys: 2 * N });
  }
  return rows;
})();

V.keyChecks = {
  formulaMatchesCount: V.keys.every(function (r) { return r.formula === r.counted; }),
  overcount: V.keys.every(function (r) { return r.N * (r.N - 1) === 2 * r.formula; }),
  coincidenceAt: V.keys.filter(function (r) { return r.formula === r.asymKeys; })
    .map(function (r) { return r.N; }),
  n10: V.keys[8].formula
};

/* ---------- 3. RSA, the small worked pair ---------- */
V.rsa1 = (function () {
  var p = 13, q = 17, n = p * q, phi = (p - 1) * (q - 1), e = 35, d = modinv(e, phi);
  var m, okCount = 0, badCount = 0;
  for (m = 1; m < n; m++) {
    if (modpow(modpow(m, e, n), d, n) === m) okCount++; else badCount++;
  }
  return {
    p: p, q: q, n: n, phi: phi, e: e, d: d,
    g: gcd(e, phi),
    product: e * d,
    quotient: Math.floor((e * d) / phi),
    remainder: (e * d) % phi,
    roundtripOk: okCount, roundtripBad: badCount, tested: n - 1,
    edModN: (e * d) % n,
    phiPrime: isPrime(p) && isPrime(q)
  };
})();

/* ---------- 4. RSA, the 2019 numbers ---------- */
V.rsa2 = (function () {
  var n = 3007, phi = 2880;
  var sum = n - phi + 1;
  var disc = sum * sum - 4 * n;
  var root = Math.round(Math.sqrt(disc));
  var p = (sum - root) / 2, q = (sum + root) / 2;
  return {
    n: n, phi: phi, sum: sum, disc: disc, root: root,
    p: p, q: q, greater: Math.max(p, q), smaller: Math.min(p, q),
    product: p * q, totient: (p - 1) * (q - 1),
    primes: isPrime(p) && isPrime(q),
    discPerfect: root * root === disc
  };
})();

/* ---------- 5. square-and-multiply, instrumented ---------- */
function sqMul(base, exp, mod) {
  var bits = exp.toString(2), i, r = 1, squarings = 0, mults = 0, trace = [];
  for (i = 0; i < bits.length; i++) {
    if (i > 0) { r = (r * r) % mod; squarings++; }
    if (bits.charAt(i) === '1') { r = (r * base) % mod; mults++; }
    trace.push({ bit: bits.charAt(i), residue: r });
  }
  return { result: r, bits: bits, squarings: squarings, mults: mults, trace: trace };
}

V.modexp = (function () {
  var s = sqMul(3, 51, 5);
  var cycle = [], i, naive = 1;
  for (i = 0; i < 4; i++) cycle.push(modpow(3, i + 1, 5));
  naive = 3;
  for (i = 0; i < 50; i++) naive = (naive * 3) % 5;
  return {
    base: 3, exp: 51, mod: 5,
    result: s.result, bits: s.bits, squarings: s.squarings, mults: s.mults,
    total: s.squarings + s.mults, naive: 50, naiveResult: naive,
    cycle: cycle, cycleIndex: (51 - 1) % 4, trace: s.trace,
    popcount: s.bits.split('').filter(function (c) { return c === '1'; }).length
  };
})();

/* ---------- 6. a signature, and a wrong-key verification ---------- */
V.sign = (function () {
  var n = 221, e = 35, d = 11, h = 42;
  var sig = modpow(h, d, n);
  var verified = modpow(sig, e, n);
  /* the same modulus, but the wrong public exponent: 13 instead of 35 */
  var eWrong = 13;
  var wrong = modpow(sig, eWrong, n);
  return {
    n: n, e: e, d: d, h: h, sig: sig,
    verified: verified, ok: verified === h,
    wrong: wrong, wrongOk: wrong === h, eWrong: eWrong
  };
})();

/* ---------- 7. hashes and the birthday bound ---------- */
function distinctProb(k, N) {
  var p = 1, i;
  for (i = 0; i < k; i++) p *= (N - i) / N;
  return p;
}
V.birthday = (function () {
  var N = 365, k, marks = [10, 23, 40, 57, 100], bars = [];
  for (k = 0; k < marks.length; k++) {
    bars.push({ k: marks[k], p: 1 - distinctProb(marks[k], N) });
  }
  var bits = 64;
  var space = Math.pow(2, bits);
  var sqrtSpace = Math.pow(2, bits / 2);
  var bound = 1.1774 * sqrtSpace;
  var approxAtSqrt = 1 - Math.exp(-(sqrtSpace * (sqrtSpace - 1)) / (2 * space));
  return {
    N: N, bars: bars,
    p23: 1 - distinctProb(23, N),
    distinct23: distinctProb(23, N),
    p366: 1 - distinctProb(366, N),
    bits: bits, space: space, sqrtSpace: sqrtSpace, bound: bound,
    approxAtSqrt: approxAtSqrt,
    monotone: (1 - distinctProb(23, N)) < (1 - distinctProb(40, N)) &&
              (1 - distinctProb(40, N)) < (1 - distinctProb(100, N))
  };
})();

/* ---------- 8. the firewall rule table ---------- */
function cidrHit(addr, prefix) {
  if (prefix === 'any') return true;
  var parts = prefix.split('/'), net = parts[0].split('.'), bits = parseInt(parts[1], 10);
  var a = addr.split('.'), i, full = Math.floor(bits / 8), rem = bits % 8;
  for (i = 0; i < full; i++) if (a[i] !== net[i]) return false;
  if (rem > 0) {
    var mask = 256 - Math.pow(2, 8 - rem);
    if ((parseInt(a[full], 10) & mask) !== (parseInt(net[full], 10) & mask)) return false;
  }
  return true;
}

function ruleHit(pkt, r) {
  if (r.proto !== 'any' && pkt.proto !== r.proto) return false;
  if (!cidrHit(pkt.src, r.src)) return false;
  if (!cidrHit(pkt.dst, r.dst)) return false;
  if (r.dport !== null && pkt.dport !== r.dport) return false;
  return true;
}

function evaluate(rules, packets) {
  var out = [], i, j;
  for (i = 0; i < packets.length; i++) {
    var hit = null;
    for (j = 0; j < rules.length; j++) {
      if (ruleHit(packets[i], rules[j])) { hit = { rule: rules[j].n, action: rules[j].action }; break; }
    }
    out.push({ packet: packets[i], rule: hit ? hit.rule : 0, action: hit ? hit.action : 'deny (no rule)' });
  }
  return out;
}

V.fw = (function () {
  var rules = [
    { n: 1, action: 'deny',  proto: 'tcp', src: 'any',          dst: '10.0.0.5',   dport: 23 },
    { n: 2, action: 'deny',  proto: 'tcp', src: '200.1.1.0/24', dst: 'any',        dport: 80 },
    { n: 3, action: 'allow', proto: 'tcp', src: '10.0.0.0/8',   dst: 'any',        dport: 443 },
    { n: 4, action: 'deny',  proto: 'udp', src: 'any',          dst: 'any',        dport: 53 },
    { n: 5, action: 'allow', proto: 'tcp', src: 'any',          dst: 'any',        dport: 22 },
    { n: 6, action: 'deny',  proto: 'any', src: 'any',          dst: 'any',        dport: null }
  ];
  var packets = [
    { label: 'P1  tcp 10.0.0.7 -> 10.0.0.5:23',  proto: 'tcp', src: '10.0.0.7', dst: '10.0.0.5', dport: 23 },
    { label: 'P2  tcp 200.1.1.9 -> 10.0.0.5:80', proto: 'tcp', src: '200.1.1.9', dst: '10.0.0.5', dport: 80 },
    { label: 'P3  tcp 10.0.0.7 -> 93.184.216.34:443', proto: 'tcp', src: '10.0.0.7', dst: '93.184.216.34', dport: 443 },
    { label: 'P4  udp 10.0.0.7 -> 8.8.8.8:53',    proto: 'udp', src: '10.0.0.7', dst: '8.8.8.8', dport: 53 },
    { label: 'P5  tcp 10.0.0.7 -> 10.0.0.9:80',  proto: 'tcp', src: '10.0.0.7', dst: '10.0.0.9', dport: 80 },
    { label: 'P6  tcp 10.0.0.7 -> 10.0.0.9:22',  proto: 'tcp', src: '10.0.0.7', dst: '10.0.0.9', dport: 22 }
  ];
  var base = evaluate(rules, packets);
  /* move the catch-all to the top: every packet then meets rule 6 first */
  var moved = rules.filter(function (r) { return r.n === 6; })
    .concat(rules.filter(function (r) { return r.n !== 6; }));
  var afterMove = evaluate(moved, packets);
  var changed = base.some(function (d, i) { return d.action !== afterMove[i].action; });
  var allows = base.filter(function (d) { return d.action === 'allow'; }).length;
  return {
    rules: rules, packets: packets, decisions: base,
    movedDecisions: afterMove, orderMatters: changed,
    allows: allows, denies: base.length - allows
  };
})();

/* ---------- 9. what each layer can read ---------- */
V.layers = [
  { tag: 'L3', sees: 'IP source, IP destination, protocol field', device: 'packet filter' },
  { tag: 'L4', sees: 'plus TCP/UDP ports, TCP flags, and the clock', device: 'layer-4 firewall' },
  { tag: 'L7', sees: 'plus the URL, the method, the user, the content', device: 'application proxy' }
];

V.fwOptions = [
  { id: 'A', text: 'block entire HTTP traffic 9pm to 5am', needs: 'port 80 + clock', possible: true },
  { id: 'B', text: 'block all ICMP traffic', needs: 'protocol field', possible: true },
  { id: 'C', text: 'stop incoming from one IP, allow outgoing to it', needs: 'addresses + direction', possible: true },
  { id: 'D', text: 'block TCP traffic from one user on a multi-user host', needs: 'a user identity above L4', possible: false }
];

/* ---------- checks ---------- */
chk('the pair count equals the number of unordered pairs for N = 2..10', V.keyChecks.formulaMatchesCount);
chk('N(N-1) is exactly twice the pair count', V.keyChecks.overcount, 'N(N-1) double counts each pair');
chk('10 people need 45 shared keys', V.keyChecks.n10 === 45, 'N(N-1)/2 at N = 10');
chk('symmetric and asymmetric counts coincide at exactly one N in 2..10', V.keyChecks.coincidenceAt.length === 1, 'N = ' + V.keyChecks.coincidenceAt.join(','));

chk('13 and 17 are prime', V.rsa1.phiPrime);
chk('n = 221 is the product of the primes', V.rsa1.n === 13 * 17);
chk('phi(n) = (p-1)(q-1) = 192', V.rsa1.phi === 12 * 16);
chk('gcd(35, 192) = 1, so an inverse exists', V.rsa1.g === 1, 'gcd = ' + V.rsa1.g);
chk('d = 11 is the inverse of e = 35 modulo 192', (V.rsa1.e * V.rsa1.d) % V.rsa1.phi === 1, V.rsa1.e + ' x ' + V.rsa1.d + ' = ' + V.rsa1.product);
chk('35 x 11 = 2 x 192 + 1', V.rsa1.quotient === 2 && V.rsa1.remainder === 1);
chk('every message below n survives encrypt-then-decrypt', V.rsa1.roundtripBad === 0, V.rsa1.roundtripOk + ' of ' + V.rsa1.tested);
chk('e x d is not 1 modulo n, only modulo phi(n)', V.rsa1.edModN !== 1, 'e x d mod n = ' + V.rsa1.edModN);

chk('the 2019 primes sum to n - phi(n) + 1 = 128', V.rsa2.sum === 128);
chk('the discriminant 4356 is a perfect square', V.rsa2.discPerfect, 'root = ' + V.rsa2.root);
chk('31 x 97 = 3007', V.rsa2.product === 3007);
chk('(31-1)(97-1) = 2880', V.rsa2.totient === 2880);
chk('both recovered factors are prime', V.rsa2.primes);
chk('the factor above 50 is 97', V.rsa2.greater === 97);

chk('square-and-multiply returns 2 for 3^51 mod 5', V.modexp.result === 2);
chk('a naive loop returns the same value', V.modexp.naiveResult === 2);
chk('the cycle of powers mod 5 gives 2 at index 51 mod 4', V.modexp.cycle[V.modexp.cycleIndex] === 2, 'cycle ' + V.modexp.cycle.join(','));
chk('51 is 110011 in binary with four set bits', V.modexp.bits === '110011' && V.modexp.popcount === 4);
chk('nine multiplications against fifty', V.modexp.total === 9 && V.modexp.naive === 50, V.modexp.squarings + ' squarings + ' + V.modexp.mults + ' multiplications');
chk('the trace ends at the same residue', V.modexp.trace[V.modexp.trace.length - 1].residue === 2);

chk('the signature verifies back to the digest under the correct key', V.sign.ok, 'signature = ' + V.sign.sig);
chk('the same signature fails under the wrong public exponent', V.sign.wrongOk === false, 'exponent ' + V.sign.eWrong + ' returns ' + V.sign.wrong);
chk('the signed digest is unchanged by verification', V.sign.verified === V.sign.h);

chk('23 items on 365 values collide with probability 0.507297', near(V.birthday.p23, 0.507297, 1e-6), fx(V.birthday.p23, 6));
chk('the no-collision probability at 23 is 0.492703', near(V.birthday.distinct23, 0.492703, 1e-6));
chk('366 items on 365 values collide with probability exactly 1', V.birthday.p366 === 1, 'pigeonhole');
chk('the collision probability rises with the number of items', V.birthday.monotone);
chk('the birthday bound for 64 bits is about 2^32', near(V.birthday.bound / V.birthday.sqrtSpace, 1.1774, 1e-6));
chk('a 64-bit space holds about 1.8e19 digests', near(V.birthday.space, 1.8446744073709552e19, 1e4));
chk('2^32 attempts on a 64-bit digest collide with probability about 0.3935', near(V.birthday.approxAtSqrt, 0.393469, 1e-5), fx(V.birthday.approxAtSqrt, 6));

chk('the firewall table has six rules', V.fw.rules.length === 6);
chk('first match decides every packet', V.fw.decisions.length === V.fw.packets.length);
chk('P1 meets rule 1', V.fw.decisions[0].rule === 1 && V.fw.decisions[0].action === 'deny');
chk('P2 meets rule 2 through the /24 prefix', V.fw.decisions[1].rule === 2 && V.fw.decisions[1].action === 'deny');
chk('P3 meets rule 3 through the /8 prefix', V.fw.decisions[2].rule === 3 && V.fw.decisions[2].action === 'allow');
chk('P4 meets rule 4', V.fw.decisions[3].rule === 4 && V.fw.decisions[3].action === 'deny');
chk('P5 falls through to the catch-all and is denied', V.fw.decisions[4].rule === 6 && V.fw.decisions[4].action === 'deny');
chk('P6 meets rule 5 before the catch-all', V.fw.decisions[5].rule === 5 && V.fw.decisions[5].action === 'allow');
chk('two packets are allowed and four denied', V.fw.allows === 2 && V.fw.denies === 4);
chk('moving the catch-all to the top changes a decision', V.fw.orderMatters);

chk('exactly one of the four 2011 options is impossible at layer 4', V.fwOptions.filter(function (o) { return !o.possible; }).length === 1);
chk('the impossible option is the per-user block', V.fwOptions[3].possible === false);
chk('three layers are distinguished', V.layers.length === 3);

/* ======================================================================
   LAYER 3 - RENDER
   ====================================================================== */

function hdr(s) {
  P.alpha(1);
  P.text(24, 14, s, { size: 11, bold: true, color: INK });
  P.line(24, 32, 876, 32, { stroke: BORDER, sw: 1 });
}
function foot(s) {
  P.alpha(1);
  P.line(24, 424, 876, 424, { stroke: BORDER, sw: 1 });
  P.text(24, 431, s, { size: 10.5, color: DIM });
}
function tx(x, y, s, o) {
  o = o || {};
  P.text(x, y, s, {
    size: o.size || 11, color: o.color || INK, mono: !!o.mono,
    bold: !!o.bold, align: o.align || 'left'
  });
}
function rows(x, y0, step, list, o) {
  o = o || {};
  var i;
  for (i = 0; i < list.length; i++) tx(x, y0 + i * step, list[i], o);
}
function box(x, y, w, h, title, lines, o) {
  o = o || {};
  P.alpha(1);
  P.rect(x, y, w, h, { fill: o.fill || SURF2, stroke: o.stroke || BORDER, sw: 1.2, radius: 6 });
  tx(x + 10, y + 9, title, { size: 10.5, bold: true, color: o.titleColor || INK });
  rows(x + 10, y + 27, 13, lines, { size: 9.6, color: DIM });
}

var SCENE_DRAW = {};

/* ---------- 1. the three goals ---------- */
SCENE_DRAW.goals = function (t, sc) {
  hdr('Three properties, and the key each one needs');

  var i, x = 30;
  for (i = 0; i < V.goals.length; i++) {
    var g = V.goals[i];
    var a = K.ease(K.beat(t, sc.start + 0.5 + i * 1.1, 1.2));
    P.alpha(a);
    P.rect(x, 52, 262, 132, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    tx(x + 12, 64, g.name, { size: 12.5, bold: true, color: ACC });
    tx(x + 12, 90, g.question, { size: 10.4, color: INK });
    P.line(x + 12, 110, x + 250, 110, { stroke: BORDER, sw: 1 });
    rows(x + 12, 120, 14, wrapText(g.tool, 34), { size: 10, color: DIM });
    x += 276;
  }
  P.alpha(1);

  P.line(24, 200, 876, 200, { stroke: BORDER, sw: 1 });
  tx(30, 210, 'What the adversary does to each property', { size: 10.5, bold: true, color: WARN });
  rows(30, 232, 15, [
    'eavesdrop: copy the bytes            -> confidentiality is what stops it',
    'tamper: flip bits in transit         -> integrity is what detects it',
    'impersonate: claim to be someone     -> authentication is what refuses it'
  ], { size: 10.2, color: DIM });

  var a2 = K.ease(K.beat(t, sc.start + 4.2, 1.4));
  P.alpha(a2);
  P.rect(30, 292, 840, 104, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
  tx(44, 302, 'The first decision, before any arithmetic', { size: 10.8, bold: true, color: ACC });
  rows(44, 322, 15, [
    'secrecy points at the RECEIVER key pair: encrypt with the receiver public key, decrypt with the receiver private key.',
    'proof points at the SENDER key pair: sign with the sender private key, verify with the sender public key.',
    'change detection points at a hash: recompute the digest and compare, with no key involved at all.',
    'A question that says only "securely" is asking you to name one of the three. Most wrong answers name the wrong one.'
  ], { size: 10.1, color: INK });
  P.alpha(1);

  foot('Name the property first. The property decides the keys; the keys decide the arithmetic.');
};

function wrapText(s, width) {
  var words = String(s).split(' '), lines = [], cur = '';
  var i;
  for (i = 0; i < words.length; i++) {
    if ((cur + ' ' + words[i]).trim().length > width) { lines.push(cur.trim()); cur = words[i]; }
    else cur = cur + ' ' + words[i];
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

/* ---------- 2. symmetric keys ---------- */
SCENE_DRAW.symmetric = function (t, sc) {
  hdr('One shared key, and the count is the number of pairs');

  P.alpha(K.ease(K.beat(t, sc.start + 0.4, 1.2)));
  P.circle(90, 108, 26, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
  tx(90, 104, 'A', { size: 12, bold: true, align: 'center' });
  P.circle(250, 108, 26, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
  tx(250, 104, 'B', { size: 12, bold: true, align: 'center' });
  P.line(116, 108, 224, 108, { stroke: DIM, sw: 1.2 });
  P.rect(148, 92, 44, 26, { fill: '#ffffff', stroke: ACC, sw: 1.2, radius: 4 });
  tx(170, 99, 'K', { size: 12, bold: true, align: 'center', color: ACC });
  tx(170, 136, 'one key, both directions', { size: 10, color: DIM, align: 'center' });
  P.alpha(1);

  rows(30, 168, 15, [
    'Symmetric means the same key locks and unlocks.',
    'The hard problem is not the arithmetic, it is delivery:',
    'both ends must already hold the key, and a network',
    'cannot be trusted to carry it. DES and AES are the',
    'standard examples of the cipher; the key count below',
    'is what the exam actually asks for.'
  ], { size: 10.2, color: DIM });

  tx(430, 52, 'N people, every pair with its own secret', { size: 10.5, bold: true, color: ACC });
  tx(430, 74, 'N', { size: 10, color: DIM, mono: true });
  tx(470, 74, 'pairs = N(N-1)/2', { size: 10, color: DIM, mono: true });
  tx(600, 74, 'counted', { size: 10, color: DIM, mono: true });
  tx(690, 74, 'asymmetric 2N', { size: 10, color: DIM, mono: true });
  P.line(430, 88, 850, 88, { stroke: BORDER, sw: 1 });

  var i;
  for (i = 0; i < V.keys.length; i++) {
    var r = V.keys[i];
    var y = 94 + i * 16;
    var hot = (r.N === 5 || r.N === 10);
    if (hot) P.rect(424, y - 2, 428, 15, { fill: WARNDIM, stroke: null });
    tx(430, y, String(r.N), { size: 10, mono: true, color: hot ? WARN : INK, bold: hot });
    tx(470, y, String(r.formula), { size: 10, mono: true, color: hot ? WARN : INK });
    tx(600, y, String(r.counted), { size: 10, mono: true, color: DIM });
    tx(690, y, String(r.asymKeys), { size: 10, mono: true, color: DIM });
  }
  tx(30, 258, 'N = 5 is the one place the two counts agree: 10 shared keys, and 10 keys in a', { size: 9.8, color: WARN });
  tx(30, 272, 'public-key system. Below N = 5 the shared arrangement needs fewer keys; above it, fewer.', { size: 9.8, color: WARN });

  P.alpha(K.ease(K.beat(t, sc.start + 3.4, 1.4)));
  P.rect(30, 292, 840, 104, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(44, 302, 'The three counts that appear as options', { size: 10.8, bold: true, color: INK });
  rows(44, 322, 15, [
    'N(N-1)/2   the number of pairs. Correct for a shared-key system, and the 2015 Set 1 answer.',
    'N(N-1)     counts each pair twice, once from each end. The commonest wrong option.',
    '2N         the number of keys in a public-key system: N public plus N private.',
    'N-1        the number of keys ONE person holds, which is a different question.'
  ], { size: 10.1, color: DIM });
  P.alpha(1);

  foot('Count pairs, not people. A shared key has no direction, so counting by people doubles every key.');
};

/* ---------- 3. public key ---------- */
SCENE_DRAW.publickey = function (t, sc) {
  hdr('Two keys per person, and a direction rule');

  P.alpha(K.ease(K.beat(t, sc.start + 0.4, 1.2)));
  P.circle(96, 96, 24, { fill: ACCDIM, stroke: ACC, sw: 1.4 });
  tx(96, 92, 'A', { size: 12, bold: true, align: 'center' });
  P.rect(150, 66, 150, 30, { fill: '#ffffff', stroke: VAL, sw: 1.2, radius: 4 });
  tx(160, 74, 'public key  K_A+', { size: 10, mono: true, color: VAL });
  P.rect(150, 102, 150, 30, { fill: '#ffffff', stroke: BAD, sw: 1.2, radius: 4 });
  tx(160, 110, 'private key K_A-', { size: 10, mono: true, color: BAD });
  tx(310, 74, 'published to everyone', { size: 9.6, color: DIM });
  tx(310, 110, 'never leaves the owner', { size: 9.6, color: DIM });
  P.alpha(1);

  tx(30, 160, 'The direction rule, which is the whole question type', { size: 10.8, bold: true, color: ACC });
  tx(30, 186, 'goal', { size: 10, color: DIM, mono: true });
  tx(150, 186, 'sender applies', { size: 10, color: DIM, mono: true });
  tx(360, 186, 'receiver applies', { size: 10, color: DIM, mono: true });
  P.line(30, 200, 620, 200, { stroke: BORDER, sw: 1 });

  var rule = [
    ['secrecy', 'receiver public key', 'receiver private key'],
    ['proof', 'sender private key', 'sender public key'],
    ['both', 'sign with sender private, then encrypt', 'decrypt, then verify with sender public']
  ];
  var i;
  for (i = 0; i < rule.length; i++) {
    var y = 212 + i * 40;
    var a = K.ease(K.beat(t, sc.start + 1.2 + i * 0.9, 1.1));
    P.alpha(a);
    tx(30, y, rule[i][0], { size: 10.4, bold: true, color: INK });
    tx(150, y, rule[i][1], { size: 9.8, color: i === 1 ? BAD : VAL });
    tx(360, y, rule[i][2], { size: 9.8, color: DIM });
  }
  P.alpha(1);

  P.alpha(K.ease(K.beat(t, sc.start + 4.0, 1.4)));
  P.rect(640, 52, 232, 150, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(652, 62, 'The count, for N people', { size: 10.4, bold: true, color: INK });
  rows(652, 84, 15, [
    'public keys:  N',
    'private keys: N',
    'total:        2N',
    'shared keys:  N(N-1)/2',
    '',
    'At N = 5 both totals are 10.',
    'Below 5 the shared system is',
    'cheaper; above it, 2N wins.'
  ], { size: 9.8, color: DIM });
  P.alpha(1);

  foot('Secrecy points at the receiver. Proof points at the sender. Encrypting with your private key hides nothing.');
};

/* ---------- 4. RSA ---------- */
SCENE_DRAW.rsa = function (t, sc) {
  hdr('RSA from two primes: n, phi(n), and the inverse of e');

  var steps = [
    ['p = 13, q = 17', ['two distinct primes', 'p and q stay secret']],
    ['n = p x q = ' + V.rsa1.n, ['the modulus', 'published']],
    ['phi(n) = ' + V.rsa1.phi, ['(p-1)(q-1)', 'never published']],
    ['e = ' + V.rsa1.e, ['gcd(e, phi) = ' + V.rsa1.g, 'published with n']],
    ['d = ' + V.rsa1.d, ['e x d = ' + V.rsa1.quotient + ' x 192 + 1', 'the private exponent']]
  ];
  var i, x = 30;
  for (i = 0; i < steps.length; i++) {
    var a = K.ease(K.beat(t, sc.start + 0.4 + i * 0.9, 1.1));
    P.alpha(a);
    P.rect(x, 50, 158, 62, { fill: i === 4 ? WARNDIM : SURF2, stroke: i === 4 ? WARN : BORDER, sw: 1.2, radius: 6 });
    tx(x + 10, 58, steps[i][0], { size: 10.4, bold: true, color: i === 4 ? WARN : INK });
    rows(x + 10, 78, 13, steps[i][1], { size: 9.4, color: DIM });
    if (i < 4) P.arrow(x + 160, 81, x + 186, 81, { stroke: FAINT, sw: 1.1 });
    x += 186;
  }
  P.alpha(1);

  P.line(24, 128, 876, 128, { stroke: BORDER, sw: 1 });
  tx(30, 138, 'Why the inverse exists, and what it buys', { size: 10.6, bold: true, color: ACC });
  rows(30, 160, 15, [
    'Euclid gives gcd(35, 192) = ' + V.rsa1.g + ', so 35 has an inverse modulo 192 and the key pair is legal.',
    'That inverse is d = ' + V.rsa1.d + ', because ' + V.rsa1.e + ' x ' + V.rsa1.d + ' = ' + V.rsa1.product + ' = ' + V.rsa1.quotient + ' x 192 + ' + V.rsa1.remainder + '.',
    'The page encrypts and decrypts every message from 1 to ' + V.rsa1.tested + ' and recovers all ' + V.rsa1.roundtripOk + ' of them.',
    'e x d modulo n is ' + V.rsa1.edModN + ', not 1: the relation lives modulo phi(n). That is the 2009 item, equations I and III.'
  ], { size: 10.2, color: DIM });

  var a2 = K.ease(K.beat(t, sc.start + 4.4, 1.4));
  P.alpha(a2);
  P.rect(30, 240, 840, 156, { fill: SURF2, stroke: ACC, sw: 1.2, radius: 6 });
  tx(44, 250, 'The 2019 item: n and phi(n) hand you the primes', { size: 10.8, bold: true, color: ACC });
  rows(44, 274, 15, [
    'phi(n) = n - p - q + 1, so p + q = n - phi(n) + 1 = ' + V.rsa2.n + ' - ' + V.rsa2.phi + ' + 1 = ' + V.rsa2.sum + '.',
    'The primes are the roots of x^2 - ' + V.rsa2.sum + 'x + ' + V.rsa2.n + ': discriminant ' + V.rsa2.disc + ' = ' + V.rsa2.root + '^2.',
    'So p = (' + V.rsa2.sum + ' - ' + V.rsa2.root + ')/2 = ' + V.rsa2.smaller + ' and q = (' + V.rsa2.sum + ' + ' + V.rsa2.root + ')/2 = ' + V.rsa2.greater + '.',
    'Check: ' + V.rsa2.smaller + ' x ' + V.rsa2.greater + ' = ' + V.rsa2.product + ', and (' + (V.rsa2.smaller - 1) + ')(' + (V.rsa2.greater - 1) + ') = ' + V.rsa2.totient + '.',
    'The factor greater than 50 is ' + V.rsa2.greater + '. No factorisation of a 4-digit number was needed.'
  ], { size: 10.1, color: INK });
  P.alpha(1);

  foot('n and phi(n) are published, and together they determine the primes. That is why phi(n) is never published.');
};

/* ---------- 5. square and multiply ---------- */
SCENE_DRAW.modexp = function (t, sc) {
  hdr('Square-and-multiply, and the two moduli that get confused');

  tx(30, 50, 'Exponent 51 in binary: ' + V.modexp.bits, { size: 10.4, bold: true, color: ACC });
  tx(30, 74, 'bit', { size: 10, color: DIM, mono: true });
  tx(90, 74, 'after squaring', { size: 10, color: DIM, mono: true });
  tx(220, 74, 'after multiplying', { size: 10, color: DIM, mono: true });
  tx(350, 74, 'residue', { size: 10, color: DIM, mono: true });
  P.line(30, 88, 430, 88, { stroke: BORDER, sw: 1 });

  var i, prev = 1;
  for (i = 0; i < V.modexp.trace.length; i++) {
    var st = V.modexp.trace[i];
    var y = 96 + i * 20;
    var sq = i === 0 ? '-' : String((prev * prev) % V.modexp.mod);
    var mult = st.bit === '1' ? String(st.residue) : 'skip';
    tx(30, y, st.bit, { size: 10.4, mono: true, bold: st.bit === '1', color: st.bit === '1' ? WARN : DIM });
    tx(90, y, sq, { size: 10.2, mono: true, color: DIM });
    tx(220, y, mult, { size: 10.2, mono: true, color: st.bit === '1' ? WARN : FAINT });
    tx(350, y, String(st.residue), { size: 10.2, mono: true, bold: true, color: INK });
    prev = st.residue;
  }

  P.rect(460, 50, 412, 96, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(472, 58, 'The cost of 3^51 mod 5', { size: 10.4, bold: true, color: INK });
  rows(472, 78, 14, [
    'squarings: ' + V.modexp.squarings + '   multiplications: ' + V.modexp.mults,
    'total: ' + V.modexp.total + ' against ' + V.modexp.naive + ' for repeated multiplication',
    'answer: ' + V.modexp.base + '^' + V.modexp.exp + ' mod ' + V.modexp.mod + ' = ' + V.modexp.result
  ], { size: 9.9, color: DIM });

  P.rect(460, 158, 412, 92, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(472, 166, 'The same answer from the cycle of powers', { size: 10.4, bold: true, color: INK });
  tx(472, 188, '3^k mod 5 = ' + V.modexp.cycle.join(', ') + ' , repeating with period 4', { size: 9.9, color: DIM, mono: true });
  tx(472, 208, '51 mod 4 = ' + (51 % 4) + ', so take element ' + (V.modexp.cycleIndex + 1) + ' of the cycle: ' + V.modexp.cycle[V.modexp.cycleIndex], { size: 9.9, color: DIM });
  tx(472, 226, 'Both routes, and a naive loop, give the same residue.', { size: 9.9, color: DIM });

  var a2 = K.ease(K.beat(t, sc.start + 3.6, 1.4));
  P.alpha(a2);
  P.rect(30, 268, 842, 128, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 6 });
  tx(44, 278, 'Two moduli, one letter apart', { size: 10.8, bold: true, color: WARN });
  rows(44, 300, 15, [
    'The ciphertext is m^e mod n, and decryption is c^d mod n. The modulus of the arithmetic is n.',
    'The exponent relation is e x d = 1 mod phi(n). The modulus of the KEYS is phi(n).',
    'Here e x d = ' + V.rsa1.product + ', which is ' + V.rsa1.remainder + ' modulo ' + V.rsa1.phi + ' but ' + V.rsa1.edModN + ' modulo ' + V.rsa1.n + '.',
    'GATE CSE 2009 offered both statements; the correct pair was I (arithmetic mod n) and III (keys mod phi(n)).',
    'Signing swaps the roles of e and d, and changes nothing else: the same routine runs both directions.'
  ], { size: 10.1, color: INK });
  P.alpha(1);

  foot('Square-and-multiply is why RSA is usable; phi(n) is why the inverse exists; n is why the exponentiation is modulo n.');
};

/* ---------- 6. signatures ---------- */
SCENE_DRAW.signature = function (t, sc) {
  hdr('Signing a digest with the private key, verifying with the public key');

  var chain = [
    ['message m', ['any length']],
    ['H(m) = ' + V.sign.h, ['fixed length digest', 'the page hashes to 42']],
    ['sig = ' + V.sign.sig, [V.sign.h + '^' + V.sign.d + ' mod ' + V.sign.n, 'signed with d']],
    ['verify with e', ['sig^' + V.sign.e + ' mod ' + V.sign.n, '= ' + V.sign.verified]],
    ['accept', ['digest matches', 'sender proved']]
  ];
  var i, x = 26;
  for (i = 0; i < chain.length; i++) {
    var a = K.ease(K.beat(t, sc.start + 0.4 + i * 0.8, 1.0));
    P.alpha(a);
    P.rect(x, 52, 152, 60, { fill: i === 4 ? ACCDIM : SURF2, stroke: i === 4 ? ACC : BORDER, sw: 1.2, radius: 6 });
    tx(x + 8, 60, chain[i][0], { size: 10.2, bold: true, color: i === 4 ? ACC : INK });
    rows(x + 8, 80, 12, chain[i][1], { size: 9.2, color: DIM });
    if (i < 4) P.arrow(x + 154, 82, x + 172, 82, { stroke: FAINT, sw: 1.1 });
    x += 176;
  }
  P.alpha(1);

  tx(30, 138, 'What actually travels, in the 2016 Set 1 notation', { size: 10.6, bold: true, color: ACC });
  P.rect(30, 156, 420, 58, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(44, 166, '{ m , K_B-( H(m) ) }', { size: 12, mono: true, bold: true, color: INK });
  rows(44, 188, 13, ['the message, and its digest under the SENDER private key'], { size: 9.6, color: DIM });

  P.rect(470, 156, 404, 58, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(484, 166, 'A public key gives no secrecy', { size: 10.2, bold: true, color: BAD });
  rows(484, 188, 13, ['anyone holding K_B+ can read a value made with K_B-'], { size: 9.6, color: DIM });

  var a2 = K.ease(K.beat(t, sc.start + 3.8, 1.4));
  P.alpha(a2);
  P.rect(30, 232, 842, 164, { fill: SURF2, stroke: ACC, sw: 1.2, radius: 6 });
  tx(44, 242, 'Verification under the right key and under a wrong one', { size: 10.8, bold: true, color: ACC });
  rows(44, 266, 15, [
    'Signature ' + V.sign.sig + ' was produced from the digest ' + V.sign.h + ' with the private exponent d = ' + V.sign.d + ' and modulus n = ' + V.sign.n + '.',
    'Applying the matching public key (e = ' + V.sign.e + ') returns ' + V.sign.verified + ', which equals the digest: the check passes.',
    'Applying the wrong public exponent (' + V.sign.eWrong + ' instead of ' + V.sign.e + ') returns ' + V.sign.wrong + ', which is not the digest: the check fails.',
    'That failure is the whole security argument. Producing a value the sender public key opens requires the sender private key,',
    'so a passing check is evidence about who made it. GATE CSE 2016 Set 2 asks exactly this: verification needs the SIGNER public key.',
    'The receiver own keys are never involved in verification, which is why the two 2016 items have one-word answers once the rule is clear.'
  ], { size: 10.1, color: INK });
  P.alpha(1);

  foot('Sign with the sender private key, verify with the sender public key. Anything else is not a signature.');
};

/* ---------- 7. the order of operations ---------- */
SCENE_DRAW.order = function (t, sc) {
  hdr('Sign then encrypt: four keys, in one order');

  tx(30, 52, 'At the sender X', { size: 10.8, bold: true, color: ACC });
  tx(470, 52, 'At the receiver Y', { size: 10.8, bold: true, color: ACC });

  var left = [
    ['M', 'the message'],
    ['sign with X-', 'proof: only X holds it'],
    ['encrypt with Y+', 'secrecy: only Y can open it'],
    ['send <M, sigma>', 'one envelope, both properties']
  ];
  var i;
  for (i = 0; i < left.length; i++) {
    var y = 74 + i * 62;
    var a = K.ease(K.beat(t, sc.start + 0.4 + i * 0.7, 1.0));
    P.alpha(a);
    P.rect(30, y, 380, 48, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    tx(42, y + 8, left[i][0], { size: 10.6, bold: true, color: INK });
    tx(42, y + 26, left[i][1], { size: 9.6, color: DIM });
    if (i < left.length - 1) P.arrow(220, y + 50, 220, y + 60, { stroke: FAINT, sw: 1.1 });
  }
  P.alpha(1);

  var right = [
    ['receive <M, sigma>', 'the envelope arrives'],
    ['decrypt with Y-', 'only Y can do this'],
    ['verify with X+', 'proof: only X could sign'],
    ['accept M', 'and it can be shown to a third party']
  ];
  for (i = 0; i < right.length; i++) {
    var y2 = 74 + i * 62;
    var b = K.ease(K.beat(t, sc.start + 1.1 + i * 0.7, 1.0));
    P.alpha(b);
    P.rect(470, y2, 400, 48, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
    tx(482, y2 + 8, right[i][0], { size: 10.6, bold: true, color: INK });
    tx(482, y2 + 26, right[i][1], { size: 9.6, color: DIM });
    if (i < right.length - 1) P.arrow(660, y2 + 50, 660, y2 + 60, { stroke: FAINT, sw: 1.1 });
  }
  P.alpha(1);

  var a3 = K.ease(K.beat(t, sc.start + 3.4, 1.4));
  P.alpha(a3);
  P.rect(30, 322, 842, 74, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 6 });
  tx(44, 332, 'GATE CSE 2013, and why the answer is the last option', { size: 10.6, bold: true, color: WARN });
  rows(44, 352, 15, [
    'Encryption: X private key followed by Y public key.  Decryption: Y private key followed by X public key.',
    'Each key is used by the party that holds it, in the direction that gives the intended property.',
    'The reverse order still computes, but it exposes the signature over ciphertext and lets a receiver act on unverified data.'
  ], { size: 10.1, color: INK });
  P.alpha(1);

  foot('Secrecy is about who can open the envelope; proof is about who could have sealed it. Signing first keeps both.');
};

/* ---------- 8. hashes and birthday ---------- */
SCENE_DRAW.hash = function (t, sc) {
  hdr('A hash, and how early collisions arrive');

  tx(30, 50, 'Collision probability on 365 values', { size: 10.6, bold: true, color: ACC });
  var i, baseY = 240, maxH = 120;
  for (i = 0; i < V.birthday.bars.length; i++) {
    var b = V.birthday.bars[i];
    var h = b.p * maxH;
    var x = 50 + i * 78;
    var a = K.ease(K.beat(t, sc.start + 0.4 + i * 0.5, 0.9));
    P.alpha(a);
    P.rect(x, baseY - h, 46, h, { fill: i === 1 ? ACC : ACCDIM, stroke: i === 1 ? ACC : BORDER, sw: 1 });
    tx(x + 23, baseY - h - 15, fx(b.p, 3), { size: 9.4, color: i === 1 ? ACC : DIM, align: 'center', mono: true });
    tx(x + 23, baseY + 4, 'k=' + b.k, { size: 9.6, color: DIM, align: 'center' });
  }
  P.alpha(1);
  P.line(40, baseY, 420, baseY, { stroke: BORDER, sw: 1 });
  tx(50, 262, '23 items already collide with probability 0.507297,', { size: 9.8, color: INK });
  tx(50, 278, 'and 366 items must collide: the product hits a zero factor.', { size: 9.8, color: INK });

  P.rect(450, 48, 424, 128, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(462, 56, 'A 64-bit digest', { size: 10.4, bold: true, color: INK });
  rows(462, 78, 15, [
    'digest space: 2^64, about 1.84 x 10^19',
    'collision: about 1.18 x sqrt(space) = 1.18 x 2^32',
    'that is about ' + (V.birthday.bound / 1e9).toFixed(2) + ' billion attempts, not 1.8 x 10^19',
    'at 2^32 attempts the collision probability is ' + fx(V.birthday.approxAtSqrt, 4),
    'a second preimage still costs the full 2^64'
  ], { size: 9.7, color: DIM });

  P.rect(450, 188, 424, 96, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(462, 196, 'Digest functions, and two that are not', { size: 10.4, bold: true, color: INK });
  rows(462, 218, 14, [
    'SHA-1 and MD5 produce digests: one way, fixed length.',
    'RSA and DES encrypt; they are not digest functions.',
    'A hash is not injective: a finite digest set, infinite inputs.',
    'That is the 2014 Set 1 item, answered Q and S.'
  ], { size: 9.7, color: DIM });

  var a2 = K.ease(K.beat(t, sc.start + 3.4, 1.4));
  P.alpha(a2);
  P.rect(30, 296, 842, 100, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 6 });
  tx(44, 306, 'Why only the signer can use a birthday collision (2017 Set 1)', { size: 10.6, bold: true, color: WARN });
  rows(44, 328, 15, [
    'A collision is two messages the attacker chose, at about 2^32 work. A second preimage is a match for a digest already fixed, at 2^64.',
    'The sender picks both messages before signing, so the sender can profit from a collision: sign the innocent one, then claim the other.',
    'A third party or the receiver would need a second preimage of a digest they cannot choose, which is out of reach. Answer: I only.'
  ], { size: 10.1, color: INK });
  P.alpha(1);

  foot('Collision resistance and second-preimage resistance are different numbers. The 2017 item is exactly that difference.');
};

/* ---------- 9. certificates ---------- */
SCENE_DRAW.certificate = function (t, sc) {
  hdr('A certificate is a name bound to a key, and signed by an authority');

  var a = K.ease(K.beat(t, sc.start + 0.4, 1.2));
  P.alpha(a);
  P.rect(30, 52, 200, 96, { fill: ACCDIM, stroke: ACC, sw: 1.2, radius: 6 });
  tx(42, 60, 'Root authority', { size: 10.6, bold: true, color: ACC });
  rows(42, 82, 14, ['key already installed', 'on the machine', 'never asked about'], { size: 9.5, color: DIM });

  P.arrow(232, 100, 268, 100, { stroke: FAINT, sw: 1.2 });

  P.rect(270, 52, 300, 96, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(282, 60, 'Server certificate', { size: 10.6, bold: true, color: INK });
  rows(282, 82, 14, [
    'subject: the server name',
    'public key: the server key',
    'issuer: the authority',
    'validity: not before, not after',
    'signature: authority over the above'
  ], { size: 9.5, color: DIM });

  P.arrow(572, 100, 608, 100, { stroke: FAINT, sw: 1.2 });

  P.rect(610, 52, 264, 96, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(622, 60, 'Browser', { size: 10.6, bold: true, color: INK });
  rows(622, 82, 14, [
    'verifies the chain up to a root',
    'then believes the key belongs',
    'to that name, and encrypts',
    'with it'
  ], { size: 9.5, color: DIM });
  P.alpha(1);

  P.rect(30, 164, 402, 108, { fill: SURF2, stroke: BAD, sw: 1.2, radius: 6 });
  tx(42, 172, 'What it stops: the man in the middle', { size: 10.4, bold: true, color: BAD });
  rows(42, 194, 14, [
    'Without a binding, a public key is just a number.',
    'An attacker who intercepts the first exchange',
    'substitutes their own key and reads everything.',
    'A signature by an authority the stranger already',
    'trusts is what makes the binding checkable.'
  ], { size: 9.5, color: DIM });

  P.rect(450, 164, 424, 108, { fill: SURF2, stroke: ACC, sw: 1.2, radius: 6 });
  tx(462, 172, 'The closest confused pair: MAC against signature', { size: 10.4, bold: true, color: ACC });
  rows(462, 194, 14, [
    'MAC: one shared key, so both parties can compute it.',
    'It gives integrity and proves the sender to a key holder.',
    'It cannot be shown to a third party: either could have made it.',
    'Signature: one private key, so only one party can make it.',
    'It gives non-repudiation, which a MAC never can.'
  ], { size: 9.5, color: DIM });

  var a2 = K.ease(K.beat(t, sc.start + 3.4, 1.4));
  P.alpha(a2);
  P.rect(30, 284, 842, 112, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(44, 294, 'Authentication, in the sense the syllabus uses', { size: 10.6, bold: true, color: ACC });
  rows(44, 316, 15, [
    'Password authentication: a shared secret, proved by revealing it, or better by a challenge-response exchange.',
    'Certificate authentication: a private key, proved by signing a challenge that the server chose at random.',
    'The random challenge is what stops a replay: a recorded answer to yesterday challenge is useless today.',
    'Expiry and revocation are part of the same idea: a binding is believed only while the authority says it holds.'
  ], { size: 10.1, color: DIM });
  P.alpha(1);

  foot('A certificate answers "whose key is this?". A MAC answers "did this change?". Only a signature answers "who sent it, provably?".');
};

/* ---------- 10. firewalls ---------- */
SCENE_DRAW.firewall = function (t, sc) {
  hdr('First match, and what a layer-4 device can read');

  tx(30, 50, 'The rule table, in order', { size: 10.6, bold: true, color: ACC });
  var i, y0 = 68;
  tx(30, y0, '#', { size: 9.6, color: DIM, mono: true });
  tx(52, y0, 'action', { size: 9.6, color: DIM, mono: true });
  tx(110, y0, 'proto', { size: 9.6, color: DIM, mono: true });
  tx(158, y0, 'source', { size: 9.6, color: DIM, mono: true });
  tx(258, y0, 'destination', { size: 9.6, color: DIM, mono: true });
  tx(370, y0, 'port', { size: 9.6, color: DIM, mono: true });
  P.line(30, y0 + 12, 430, y0 + 12, { stroke: BORDER, sw: 1 });

  for (i = 0; i < V.fw.rules.length; i++) {
    var r = V.fw.rules[i], y = y0 + 22 + i * 17;
    var a = K.ease(K.beat(t, sc.start + 0.3 + i * 0.35, 0.7));
    P.alpha(a);
    tx(30, y, String(r.n), { size: 9.6, mono: true, color: DIM });
    tx(52, y, r.action, { size: 9.6, mono: true, bold: true, color: r.action === 'allow' ? VAL : BAD });
    tx(110, y, r.proto, { size: 9.6, mono: true, color: DIM });
    tx(158, y, r.src, { size: 9.6, mono: true, color: DIM });
    tx(258, y, r.dst, { size: 9.6, mono: true, color: DIM });
    tx(370, y, r.dport === null ? 'any' : String(r.dport), { size: 9.6, mono: true, color: DIM });
  }
  P.alpha(1);

  tx(470, 50, 'Six packets, decided by the first rule that matches', { size: 10.6, bold: true, color: ACC });
  for (i = 0; i < V.fw.decisions.length; i++) {
    var d = V.fw.decisions[i], y2 = 70 + i * 19;
    var b = K.ease(K.beat(t, sc.start + 1.2 + i * 0.4, 0.8));
    P.alpha(b);
    tx(470, y2, d.packet.label, { size: 9.4, mono: true, color: INK });
    tx(742, y2, 'rule ' + d.rule, { size: 9.4, mono: true, color: DIM });
    tx(800, y2, d.action, { size: 9.4, mono: true, bold: true, color: d.action === 'allow' ? VAL : BAD });
  }
  P.alpha(1);
  tx(470, 194, 'Two allowed, four denied. Moving rule 6 to the top denies everything:', { size: 9.6, color: DIM });
  tx(470, 208, 'order is part of the policy, not decoration.', { size: 9.6, color: DIM });

  var a3 = K.ease(K.beat(t, sc.start + 3.2, 1.3));
  P.alpha(a3);
  P.rect(30, 226, 420, 170, { fill: SURF2, stroke: BORDER, sw: 1.2, radius: 6 });
  tx(42, 234, 'What each layer can read', { size: 10.4, bold: true, color: INK });
  var yy = 256;
  for (i = 0; i < V.layers.length; i++) {
    tx(42, yy, V.layers[i].tag + '  ' + V.layers[i].device, { size: 9.6, bold: true, color: ACC });
    tx(42, yy + 13, V.layers[i].sees, { size: 9.4, color: DIM });
    yy += 42;
  }
  P.alpha(1);

  var a4 = K.ease(K.beat(t, sc.start + 4.2, 1.3));
  P.alpha(a4);
  P.rect(470, 226, 404, 170, { fill: WARNDIM, stroke: WARN, sw: 1.2, radius: 6 });
  tx(482, 234, 'GATE CSE 2011: the layer-4 firewall CANNOT', { size: 10.4, bold: true, color: WARN });
  var yy2 = 258;
  for (i = 0; i < V.fwOptions.length; i++) {
    var o = V.fwOptions[i];
    tx(482, yy2, o.id + '  ' + (o.possible ? 'possible' : 'IMPOSSIBLE'), {
      size: 9.6, bold: true, color: o.possible ? VAL : BAD
    });
    tx(482, yy2 + 13, o.text + '   [' + o.needs + ']', { size: 9.3, color: DIM });
    yy2 += 34;
  }
  P.alpha(1);

  foot('Blocking all HTTP needs only port 80. Blocking one user needs an identity that no header up to layer 4 carries.');
};

function drawFrame(painter) {
  P = painter;
  var st = K.state;
  var t = st.elapsed;
  var sc = st.scenes[K.sceneAt(t)];
  P.clear();
  if (!sc) return;
  var fn = SCENE_DRAW[sc.id];
  if (!fn) return;
  try { fn(t, sc); } catch (err) { console.error('scene draw failed', sc.id, err); }
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
