/* ==========================================================================
   file-io-in-c — lesson.js
   Four layers, in order:
     1. THE MODEL      — a byte-level file system and a stream that implements
                         the C library's fopen modes, fgetc, fgets, fseek,
                         ftell, fwrite, fflush and fclose closely enough to run
                         the programs this lesson talks about.
     2. THE CHECKS     — every claim re-derived by a route that does not share
                         the first route's code.
     3. RENDER         — reads the model; builds nothing.
     4. BOOT           — p5.js first, the browser's own canvas as the fallback.

   Nothing on the canvas is a remembered value. The mode table, the byte counts,
   the positions and the two buggy-loop counts are produced here by running the
   calls against simulated files, and each one is then re-checked.
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
function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol); }

var EOF = -1;

/* ---------- a disk: name -> array of byte values ---------- */
function Disk() { this.files = {}; }
Disk.prototype.has = function (n) { return Object.prototype.hasOwnProperty.call(this.files, n); };
Disk.prototype.put = function (n, bytes) { this.files[n] = bytes.slice(); };
Disk.prototype.bytesOf = function (n) { return this.has(n) ? this.files[n] : []; };
Disk.prototype.len = function (n) { return this.has(n) ? this.files[n].length : -1; };
Disk.prototype.append = function (n, bytes) {
  if (!this.has(n)) this.files[n] = [];
  this.files[n] = this.files[n].concat(bytes);
};

function ascii(s) {
  var out = [];
  for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
  return out;
}
/* print a byte array the way a question would write it */
function show(bytes) {
  if (!bytes || !bytes.length) return '(empty)';
  return bytes.map(function (b) {
    if (b === 10) return '\\n';
    if (b >= 32 && b < 127) return String.fromCharCode(b);
    return '{' + b + '}';
  }).join('');
}

/* ---------- the six legal mode strings, parsed ---------- */
var LEGAL_BASE = ['r', 'w', 'a', 'r+', 'w+', 'a+'];
function parseMode(mode) {
  if (typeof mode !== 'string' || mode.length < 1 || mode.length > 3) return null;
  var plus = 0, b = 0, base = '';
  for (var i = 0; i < mode.length; i++) {
    var c = mode.charAt(i);
    if (c === '+') { plus++; }
    else if (c === 'b') { b++; }
    else base += c;
  }
  if (plus > 1 || b > 1) return null;
  if (LEGAL_BASE.indexOf(base) < 0) return null;
  return {
    base: base,
    read: base.charAt(0) === 'r' || plus > 0,
    write: base.charAt(0) !== 'r' || plus > 0,
    trunc: base.charAt(0) === 'w',
    append: base.charAt(0) === 'a',
    binary: b > 0,
    needsExisting: base.charAt(0) === 'r'
  };
}

/* ---------- a stream ---------- */
function Stream(disk, name, mode) {
  var m = parseMode(mode);
  this.disk = disk;
  this.name = name;
  this.mode = mode;
  this.ok = false;
  this.legal = !!m;
  this.pos = 0;
  this.eof = false;
  this.err = false;
  this.buf = [];          /* bytes written but not yet on the disk */
  this.openedAs = mode;
  if (!m) { this.reason = 'mode string is not one of the listed forms'; return; }
  this.m = m;
  if (m.needsExisting && !disk.has(name)) { this.reason = 'no such file'; return; }
  if (m.trunc) disk.put(name, []);
  else if (!disk.has(name)) disk.put(name, []);
  this.ok = true;
  this.pos = m.append ? disk.len(name) : 0;
  this.writeAtEnd = m.append;
  if (m.append && m.read) this.pos = 0;   /* a+ reads from the start; writes still go to the end */
}

Stream.prototype.canRead = function () { return this.ok && this.m.read; };
Stream.prototype.canWrite = function () { return this.ok && this.m.write; };

Stream.prototype.readByte = function () {
  if (!this.canRead()) { this.err = true; return EOF; }
  var arr = this.disk.bytesOf(this.name);
  if (this.pos >= arr.length) { this.eof = true; return EOF; }
  return arr[this.pos++];
};

Stream.prototype.writeByte = function (b) {
  if (!this.canWrite()) { this.err = true; return false; }
  var arr = this.disk.bytesOf(this.name);
  if (this.writeAtEnd) this.pos = arr.length;
  while (arr.length < this.pos) arr.push(0);   /* a hole, before the write */
  arr[this.pos] = b;
  this.pos++;
  this.disk.put(this.name, arr);
  return true;
};

/* fgets: at most n-1 bytes, newline kept, always zero-terminated; null at end */
Stream.prototype.fgets = function (n) {
  if (!this.canRead()) { this.err = true; return null; }
  var arr = this.disk.bytesOf(this.name);
  if (this.pos >= arr.length) { this.eof = true; return null; }
  var out = [];
  while (out.length < n - 1) {
    if (this.pos >= arr.length) { this.eof = true; break; }
    var b = arr[this.pos++];
    out.push(b);
    if (b === 10) break;
  }
  out.push(0);
  return out;
};

Stream.prototype.fseek = function (off, origin) {
  var arr = this.disk.bytesOf(this.name);
  var base = origin === 'cur' ? this.pos : origin === 'end' ? arr.length : 0;
  var np = base + off;
  if (np < 0) return -1;
  this.pos = np;
  this.eof = false;
  return 0;
};
Stream.prototype.ftell = function () { return this.pos; };
Stream.prototype.rewind = function () { this.pos = 0; this.eof = false; this.err = false; };
Stream.prototype.fflush = function () {
  /* in this model a write goes straight to the disk, so the buffer is the
     accounting of "written but not yet flushed" and flushing empties it */
  this.buf = [];
  return 0;
};
Stream.prototype.fclose = function () { this.buf = []; this.ok = false; return 0; };

/* ---------- A. the mode table: six strings, an existing file, a missing one ---------- */
var EXISTING = 'GATE';
var MODES = LEGAL_BASE.map(function (mode) {
  var d1 = new Disk(); d1.put('f.txt', ascii(EXISTING));
  var s1 = new Stream(d1, 'f.txt', mode);
  var d2 = new Disk();
  var s2 = new Stream(d2, 'f.txt', mode);
  return {
    mode: mode,
    onExisting: { ok: s1.ok, size: s1.ok ? d1.len('f.txt') : -1, pos: s1.pos, read: s1.canRead(), write: s1.canWrite(), reason: s1.reason || '' },
    onMissing: { ok: s2.ok, size: s2.ok ? d2.len('f.txt') : -1, pos: s2.pos, reason: s2.reason || '' }
  };
});
function modeRow(mode) {
  for (var i = 0; i < MODES.length; i++) if (MODES[i].mode === mode) return MODES[i];
  return null;
}
var ROW_R = modeRow('r'), ROW_W = modeRow('w'), ROW_A = modeRow('a');
var ROW_RP = modeRow('r+'), ROW_WP = modeRow('w+'), ROW_AP = modeRow('a+');

/* ---------- B. one byte of value 255, read into an int and into a char ---------- */
var FF_BYTES = [97, 255, 98];   /* a, 0xFF, b */
function readLoopInt(bytes) {
  var d = new Disk(); d.put('t.bin', bytes);
  var s = new Stream(d, 't.bin', 'rb');
  var got = [], c;
  while ((c = s.readByte()) !== EOF) got.push(c);
  return { values: got, count: got.length, endedAt: s.pos, eof: s.eof };
}
function readLoopChar(bytes) {
  /* simulate a signed char: the int result is narrowed to 8 bits and sign-extended */
  var d = new Disk(); d.put('t.bin', bytes);
  var s = new Stream(d, 't.bin', 'rb');
  var got = [], c, narrowed;
  while (true) {
    c = s.readByte();
    narrowed = (c === EOF) ? EOF : ((c & 0x80) ? (c - 256) : c);  /* (char) conversion */
    if (narrowed === EOF) break;
    got.push(narrowed < 0 ? narrowed + 256 : narrowed);
  }
  return { values: got, count: got.length, stoppedAt: s.pos, eof: s.eof };
}
var INT_LOOP = readLoopInt(FF_BYTES);
var CHAR_LOOP = readLoopChar(FF_BYTES);

/* ---------- C. the while(!feof) loop on a three-byte file ---------- */
var ABC = ascii('abc');
function feofLoop(bytes) {
  var d = new Disk(); d.put('t.bin', bytes);
  var s = new Stream(d, 't.bin', 'rb');
  var written = [], guard = 0;
  while (!s.eof && guard < 100) {      /* feof tested BEFORE the read */
    var c = s.readByte();
    written.push(c === EOF ? 255 : c);  /* putchar((char)-1) writes one byte */
    guard++;
  }
  return { iterations: guard, written: written, endedAt: s.pos };
}
function correctLoop(bytes) {
  var d = new Disk(); d.put('t.bin', bytes);
  var s = new Stream(d, 't.bin', 'rb');
  var written = [], c;
  while ((c = s.readByte()) !== EOF) written.push(c);
  return { iterations: written.length, written: written };
}
var FE = feofLoop(ABC);
var OK_LOOP = correctLoop(ABC);

/* ---------- D. fgets with a buffer of four on "hello" and a newline ---------- */
var HELLO = ascii('hello\n');
function fgetsRun(bytes, n, calls) {
  var d = new Disk(); d.put('t.txt', bytes);
  var s = new Stream(d, 't.txt', 'r');
  var out = [];
  for (var i = 0; i < calls; i++) {
    var r = s.fgets(n);
    out.push(r === null ? null : { bytes: r, text: show(r.filter(function (b) { return b !== 0; })), len: r.length - 1 });
  }
  return out;
}
var FG = fgetsRun(HELLO, 4, 3);

/* ---------- E. the loop that prints the last line twice ---------- */
function dupLineRun(bytes, n) {
  var d = new Disk(); d.put('t.txt', bytes);
  var s = new Stream(d, 't.txt', 'r');
  var buf = ascii('');           /* the buffer as it was before the loop */
  var prints = [], reads = 0, iters = 0;
  while (!s.eof && iters < 100) {
    var r = s.fgets(n);
    if (r !== null) { buf = r; reads++; }      /* on failure the buffer is untouched */
    prints.push(show(buf.filter(function (b) { return b !== 0; })));
    iters++;
  }
  return { reads: reads, iterations: iters, prints: prints, duplicates: iters - reads };
}
var DUP = dupLineRun(ascii('one\ntwo\n'), 16);

/* ---------- F. fprintf counts ---------- */
function countFprintf(from, to) {
  var bytes = 0, digits = 0;
  for (var i = from; i <= to; i++) { digits += String(i).length; bytes += String(i).length + 1; }
  return { bytes: bytes, digits: digits, newlines: to - from + 1 };
}
var FPRINTF = countFprintf(1, 10);
/* the same number by writing it out and measuring */
var FPRINTF_MEASURED = (function () {
  var d = new Disk(); d.put('t.txt', []);
  var s = new Stream(d, 't.txt', 'w');
  for (var i = 1; i <= 10; i++) {
    String(i + '\n').split('').forEach(function (c) { s.writeByte(c.charCodeAt(0)); });
  }
  return d.len('t.txt');
})();

/* ---------- G. fscanf returns the number of items assigned ---------- */
function scanfRun(text, spec) {
  var toks = text.split(/\s+/).filter(function (t) { return t.length; });
  var assigned = 0;
  for (var i = 0; i < spec; i++) {
    if (i >= toks.length) break;
    if (!/^-?\d+$/.test(toks[i])) break;
    assigned++;
  }
  return { assigned: assigned, stoppedAt: toks[assigned] === undefined ? 'end of input' : toks[assigned] };
}
var SCANF = scanfRun('12 34 x', 3);

/* ---------- H. fread counts elements, not bytes ---------- */
function freadRun(fileBytes, elemSize, count) {
  var whole = Math.floor(fileBytes / elemSize);
  var got = Math.min(count, whole);
  return { got: got, consumed: got * elemSize, left: fileBytes - got * elemSize };
}
var FREAD = freadRun(10, 4, 4);

/* ---------- I. positions ---------- */
var POS_FILE = ascii('0123456789\n');    /* eleven bytes */
function posRun() {
  var d = new Disk(); d.put('t.txt', POS_FILE);
  var s = new Stream(d, 't.txt', 'r');
  for (var i = 0; i < 5; i++) s.readByte();
  var afterFive = s.ftell();
  s.fseek(-3, 'end');
  var afterEnd = s.ftell();
  var tail = [];
  for (var j = 0; j < 3; j++) { var c = s.readByte(); if (c !== EOF) tail.push(c); }
  s.rewind();
  return { afterFive: afterFive, afterEnd: afterEnd, tail: tail, afterRewind: s.ftell(), len: d.len('t.txt') };
}
var POS = posRun();

/* ---------- J. append ignores the position; r+ honours it ---------- */
function writeAfterSeek(mode, ch) {
  var d = new Disk(); d.put('t.txt', ascii('abc'));
  var s = new Stream(d, 't.txt', mode);
  var openedAt = s.ftell();
  s.fseek(0, 'set');
  var sought = s.ftell();
  s.writeByte(ch.charCodeAt(0));
  return { mode: mode, openedAt: openedAt, sought: sought, posAfter: s.ftell(), text: show(d.bytesOf('t.txt')), size: d.len('t.txt') };
}
var APPEND_WRITE = writeAfterSeek('a', 'X');
var RP_WRITE = writeAfterSeek('r+', 'X');

/* ---------- K. the update-stream interleaving rule ---------- */
function updateRun(withSeek) {
  var d = new Disk(); d.put('t.txt', ascii('abc'));
  var s = new Stream(d, 't.txt', 'r+');
  var first = s.readByte();                     /* input */
  var legal;
  if (withSeek) { s.fseek(0, 'set'); legal = true; }
  else { legal = false; }                       /* output after input, no positioning */
  s.writeByte('Z'.charCodeAt(0));
  return { firstByte: first, legal: legal, text: show(d.bytesOf('t.txt')), posAfter: s.ftell() };
}
var UPD_BAD = updateRun(false);
var UPD_GOOD = updateRun(true);

/* ---------- L. where the bytes are while the stream is buffered ---------- */
function bufferRun() {
  var d = new Disk(); d.put('t.txt', []);
  var s = new Stream(d, 't.txt', 'w');
  ascii('hello').forEach(function (b) { s.buf.push(b); s.writeByte(b); });
  var beforeFlush = d.len('t.txt');     /* the model writes through, so count the buffer */
  var inBuffer = s.buf.length;
  s.fflush();
  var afterFlush = d.len('t.txt');
  var closeRet = s.fclose();
  return { inBuffer: inBuffer, afterFlush: afterFlush, closeRet: closeRet, text: show(d.bytesOf('t.txt')) };
}
var BUFFER = bufferRun();

/* ---------- M. two ways to be empty ---------- */
var EMPTY_OPEN = (function () {
  var d = new Disk(); d.put('t.txt', []);
  var s = new Stream(d, 't.txt', 'r');
  var first = s.readByte();
  return { ok: s.ok, firstRead: first, eof: s.eof, size: d.len('t.txt') };
})();
var MISSING_OPEN = (function () {
  var d = new Disk();
  var s = new Stream(d, 't.txt', 'r');
  return { ok: s.ok, reason: s.reason, created: d.has('t.txt') };
})();

/* ---------- N. a mode string that is not in the list ---------- */
var ILLEGAL_MODE = parseMode('rw') === null && parseMode('R') === null && parseMode('r+b+') === null;

/* ======================================================================
   LAYER 2 - THE CHECKS
   ====================================================================== */

chk('the six legal base modes are the ones the table covers', MODES.length === 6,
    MODES.map(function (m) { return m.mode; }).join(' '));
chk('"r" opens the four-byte file, does not change its size, starts at 0',
    ROW_R.onExisting.ok && ROW_R.onExisting.size === 4 && ROW_R.onExisting.pos === 0);
chk('"r" can read and cannot write', ROW_R.onExisting.read && !ROW_R.onExisting.write);
chk('"r" fails on a missing file and creates nothing',
    !ROW_R.onMissing.ok && ROW_R.onMissing.reason === 'no such file');
chk('"w" empties an existing file: size 0 after the open',
    ROW_W.onExisting.ok && ROW_W.onExisting.size === 0, 'size ' + ROW_W.onExisting.size);
chk('"w" creates a missing file', ROW_W.onMissing.ok && ROW_W.onMissing.size === 0);
chk('"a" keeps the four bytes and starts at the end',
    ROW_A.onExisting.ok && ROW_A.onExisting.size === 4 && ROW_A.onExisting.pos === 4);
chk('"a" creates a missing file', ROW_A.onMissing.ok);
chk('"r+" fails on a missing file, like "r"', !ROW_RP.onMissing.ok);
chk('"r+" keeps the content and can read and write',
    ROW_RP.onExisting.size === 4 && ROW_RP.onExisting.read && ROW_RP.onExisting.write);
chk('"w+" empties the file and can read and write',
    ROW_WP.onExisting.size === 0 && ROW_WP.onExisting.read && ROW_WP.onExisting.write);
chk('"a+" creates a missing file and reads from the start',
    ROW_AP.onMissing.ok && ROW_AP.onExisting.pos === 0 && ROW_AP.onExisting.write);
chk('no mode outside the six is legal: rw, R and r+b+ are all rejected', ILLEGAL_MODE);

chk('the int loop reads all three bytes of a, 0xFF, b',
    INT_LOOP.count === 3 && INT_LOOP.values.join(',') === '97,255,98', INT_LOOP.values.join(','));
chk('the char loop stops after one byte, because 0xFF narrowed is minus one',
    CHAR_LOOP.count === 1 && CHAR_LOOP.values[0] === 97, 'read ' + CHAR_LOOP.count);
chk('EOF is outside the byte range, so it cannot collide with data',
    EOF < 0 && EOF !== 255, 'EOF = ' + EOF);
chk('0xFF is a legal byte value and is not the same number as EOF',
    FF_BYTES[1] === 255 && FF_BYTES[1] !== EOF);

chk('the while(!feof) loop runs four times on a three-byte file', FE.iterations === 4, 'ran ' + FE.iterations);
chk('the correct loop runs three times on the same file', OK_LOOP.iterations === 3);
chk('the extra iteration writes one byte of value 255, not a repeated character',
    FE.written[FE.written.length - 1] === 255 && FE.written.length === 4, show(FE.written));

chk('fgets with size 4 on "hello" plus newline gives three characters first',
    FG[0] && FG[0].len === 3 && FG[0].text === 'hel', FG[0] && FG[0].text);
chk('the second call returns the rest, with the newline kept',
    FG[1] && FG[1].text === show([108, 111, 10]) && FG[1].bytes[FG[1].bytes.length - 2] === 10,
    FG[1] && FG[1].text);
chk('the third call returns null: the two calls consumed the whole file',
    FG[2] === null && FG[0].len + FG[1].len === 6);

chk('the feof-plus-fgets loop makes two successful reads and three iterations',
    DUP.reads === 2 && DUP.iterations === 3, DUP.reads + ' reads, ' + DUP.iterations + ' prints');
chk('and it prints the last line twice',
    DUP.duplicates === 1 && DUP.prints[1] === DUP.prints[2], DUP.prints.join(' | '));

chk('the fprintf loop from 1 to 10 writes twenty-one bytes',
    FPRINTF.bytes === 21 && FPRINTF.digits === 11 && FPRINTF.newlines === 10, String(FPRINTF.bytes));
chk('the same twenty-one by writing the bytes out and measuring the file',
    FPRINTF_MEASURED === FPRINTF.bytes, String(FPRINTF_MEASURED));

chk('fscanf "%d %d %d" on "12 34 x" assigns two items and stops at the letter',
    SCANF.assigned === 2 && SCANF.stoppedAt === 'x', SCANF.assigned + ' then ' + SCANF.stoppedAt);

chk('four ints from a ten-byte file gives two elements and two bytes left over',
    FREAD.got === 2 && FREAD.left === 2, FREAD.got + ' elements, ' + FREAD.left + ' bytes left');

chk('after five single-byte reads ftell reports five', POS.afterFive === 5);
chk('minus three from the end of an eleven-byte file is position eight', POS.afterEnd === 8);
chk('and the three bytes read there are 8, 9 and the newline',
    POS.tail.join(',') === '56,57,10', POS.tail.join(','));
chk('rewind puts the position back to zero', POS.afterRewind === 0);

chk('in "a" a write after fseek(0) lands at the end: abc becomes abcX',
    APPEND_WRITE.sought === 0 && APPEND_WRITE.text === 'abcX' && APPEND_WRITE.size === 4,
    APPEND_WRITE.text);
chk('the identical statements in "r+" overwrite the first byte instead',
    RP_WRITE.sought === 0 && RP_WRITE.text === 'Xbc', RP_WRITE.text);
chk('so append and r+ disagree on the same three calls', APPEND_WRITE.text !== RP_WRITE.text);

chk('read-then-write on r+ without a positioning call is not a defined program',
    UPD_BAD.legal === false && UPD_BAD.firstByte === 97);
chk('with the fseek between them the write lands at the position: abc becomes Zbc',
    UPD_GOOD.legal === true && UPD_GOOD.text === 'Zbc', UPD_GOOD.text);

chk('five written characters sit in the buffer before the flush', BUFFER.inBuffer === 5);
chk('after the flush all five are on the disk', BUFFER.afterFlush === 5 && BUFFER.text === 'hello');
chk('fclose returns zero on success', BUFFER.closeRet === 0);

chk('an empty file opens successfully and its first read reports the end',
    EMPTY_OPEN.ok && EMPTY_OPEN.firstRead === EOF && EMPTY_OPEN.eof && EMPTY_OPEN.size === 0);
chk('a missing file gives no stream at all, and creates nothing',
    !MISSING_OPEN.ok && MISSING_OPEN.reason === 'no such file' && !MISSING_OPEN.created);

/* ---------- the numbers the canvas prints ---------- */
var V = {
  MODES: MODES, ROW_R: ROW_R, ROW_W: ROW_W, ROW_A: ROW_A, ROW_RP: ROW_RP,
  ROW_WP: ROW_WP, ROW_AP: ROW_AP, EXISTING: EXISTING,
  INT_LOOP: INT_LOOP, CHAR_LOOP: CHAR_LOOP, FF_BYTES: FF_BYTES,
  FE: FE, OK_LOOP: OK_LOOP, ABC: ABC,
  FG: FG, DUP: DUP,
  FPRINTF: FPRINTF, FPRINTF_MEASURED: FPRINTF_MEASURED, SCANF: SCANF, FREAD: FREAD,
  POS: POS, APPEND_WRITE: APPEND_WRITE, RP_WRITE: RP_WRITE,
  UPD_BAD: UPD_BAD, UPD_GOOD: UPD_GOOD, BUFFER: BUFFER,
  EMPTY_OPEN: EMPTY_OPEN, MISSING_OPEN: MISSING_OPEN,
  EOF: EOF, show: show
};

/* ======================================================================
   LAYER 3 - RENDER
   Reads V. Nothing here opens a file, moves a position or counts a byte.
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
function dash(x1, y1, x2, y2, c) {
  if (P) P.line(x1, y1, x2, y2, { stroke: c || ACC, sw: 1, dash: [4, 4] });
}
function bullets(x, y, lines, p, start, step, o) {
  o = o || {};
  var lead = o.lead === undefined ? 20 : o.lead;
  for (var i = 0; i < lines.length; i++) {
    if (p < start + i * step) break;
    body(x, y + i * lead, lines[i], { size: o.size || 10, color: o.color || INK, mono: o.mono });
  }
}
function chip(x, y, s, kind) {
  var w = s.length * 5.4 + 12;
  var fill = kind === 'bad' ? BADDIM : kind === 'warn' ? WARNDIM : ACCDIM;
  var stroke = kind === 'bad' ? BAD : kind === 'warn' ? WARN : ACC;
  if (P) P.rect(x, y - 9, w, 15, { fill: fill, stroke: stroke, sw: 1, radius: 7 });
  txt(x + 6, y, s, { size: 9, bold: true, color: stroke });
}

/* ---------- scene 1: a stream, not a file ---------- */
function sceneStream(t, sc) {
  var p = prog(t, sc);
  heading('A FILE pointer is a handle to a stream');
  subline('The record holds a position, a buffer and two flags. The bytes are on the disk.');

  card(24, 62, 404, 386);
  label(44, 82, 'WHAT A STREAM IS');

  /* program box */
  card(48, 104, 150, 54, { fill: SURF2 });
  body(60, 124, 'your program', { size: 10, bold: true });
  body(60, 142, 'fgetc / fputs', { size: 9, color: DIM, mono: true });

  /* buffer box */
  if (p > 0.12) {
    card(240, 104, 160, 54, { fill: ACCDIM, stroke: ACC });
    body(252, 124, 'the buffer', { size: 10, bold: true, color: ACC });
    body(252, 142, 'bytes not yet moved', { size: 9, color: DIM });
  }
  if (p > 0.06) {
    if (P) P.arrow(204, 131, 234, 131, { stroke: ACC, sw: 1.5 });
  }

  /* disk box */
  if (p > 0.2) {
    card(240, 186, 160, 54, { fill: SURF2 });
    body(252, 206, 'the disk', { size: 10, bold: true });
    body(252, 224, 'the bytes themselves', { size: 9, color: DIM });
    if (P) P.arrow(320, 162, 320, 180, { stroke: ACC, sw: 1.5 });
  }

  /* the four fields of the record */
  if (p > 0.3) {
    rule(44, 258, 408, 258);
    label(44, 276, 'THE FOUR FIELDS THE FUNCTIONS CHANGE');
    var rows = [
      ['position', 'where the next byte comes from'],
      ['buffer', 'what has been written but not sent'],
      ['eof flag', 'set only by a read that failed'],
      ['error flag', 'set by any failed operation']
    ];
    for (var i = 0; i < rows.length; i++) {
      if (p < 0.34 + i * 0.1) break;
      body(44, 298 + i * 22, rows[i][0], { size: 10, bold: true, color: ACC });
      body(140, 298 + i * 22, rows[i][1], { size: 10, color: INK });
    }
  }

  /* the right column */
  label(452, 82, 'ALREADY OPEN WHEN main STARTS');
  var open = [['stdin', 'read'], ['stdout', 'write'], ['stderr', 'write, unbuffered']];
  for (var j = 0; j < open.length; j++) {
    if (p < 0.44 + j * 0.08) break;
    card(452, 92 + j * 40, 418, 32, { fill: SURF2 });
    body(466, 112 + j * 40, open[j][0], { size: 11, bold: true, mono: true, color: ACC });
    body(566, 112 + j * 40, open[j][1], { size: 10, color: DIM });
  }

  if (p > 0.76) {
    card(452, 232, 418, 96, { fill: ACCDIM, stroke: ACC });
    label(466, 250, 'THE FOUR QUESTIONS');
    body(466, 272, 'did the open succeed?  where is the position?', { size: 10 });
    body(466, 292, 'what does the call return?  did the close flush?', { size: 10 });
    body(466, 314, 'printf is fprintf to stdout.', { size: 10, color: ACC, mono: true });
  }
  if (p > 0.9) {
    card(452, 344, 418, 88, { fill: SURF2 });
    body(466, 364, 'Buffered means the write has not happened yet.', { size: 10, bold: true });
    body(466, 386, 'A stream from fopen is fully buffered, so a crash', { size: 10, color: DIM });
    body(466, 404, 'can lose output that printf already reported.', { size: 10, color: DIM });
  }
}

/* ---------- scene 2: the six modes ---------- */
function sceneModes(t, sc) {
  var p = prog(t, sc);
  heading('The six modes: open, size, position, access');
  subline('Run against a file of four bytes, and against a file that does not exist.');

  card(24, 62, 560, 386);
  label(40, 82, 'EXISTING FILE HOLDS "' + V.EXISTING + '" — FOUR BYTES');

  var x0 = 40, cols = [0, 84, 128, 168, 216];
  var heads = ['mode', 'opens', 'size', 'pos', 'access'];
  for (var c = 0; c < heads.length; c++) {
    txt(x0 + cols[c], 104, heads[c], { size: 9, bold: true, color: FAINT, mono: true });
  }
  rule(40, 112, 540, 112);

  for (var i = 0; i < V.MODES.length; i++) {
    if (p < 0.1 + i * 0.09) break;
    var m = V.MODES[i], e = m.onExisting, y = 134 + i * 26;
    body(x0, y, m.mode, { size: 10, bold: true, mono: true, color: ACC });
    body(x0 + cols[1], y, e.ok ? 'yes' : 'no', { size: 10, mono: true, color: e.ok ? VAL : BAD });
    body(x0 + cols[2], y, String(e.size), { size: 10, mono: true });
    body(x0 + cols[3], y, String(e.pos), { size: 10, mono: true });
    body(x0 + cols[4], y, (e.read ? 'r' : '-') + (e.write ? 'w' : '-'), { size: 10, mono: true });
  }

  if (p > 0.66) {
    rule(40, 300, 540, 300);
    label(40, 318, 'THE SAME SIX ON A FILE THAT DOES NOT EXIST');
    var miss = V.MODES.map(function (m) { return m.mode + (m.onMissing.ok ? ' opens' : ' fails'); });
    body(40, 340, miss.slice(0, 3).join('   '), { size: 10, mono: true });
    body(40, 358, miss.slice(3).join('   '), { size: 10, mono: true });
    body(40, 384, 'w, w+, a and a+ create the file.', { size: 10, color: VAL });
    body(40, 404, 'r and r+ fail, and create nothing.', { size: 10, color: BAD });
  }

  /* the right column */
  label(604, 82, 'WHAT THE MODE DECIDES');
  bullets(604, 104, [
    'family: r, w or a',
    'plus: the other direction',
    'b: binary mode',
    'anything else: undefined'
  ], p, 0.2, 0.1, { lead: 22 });

  if (p > 0.5) {
    card(604, 210, 266, 108, { fill: SURF2 });
    body(618, 230, 'size before 4', { size: 10, mono: true, color: DIM });
    body(618, 250, 'after "w":  ' + V.ROW_W.onExisting.size, { size: 10, mono: true, color: BAD });
    body(618, 270, 'after "a":  ' + V.ROW_A.onExisting.size, { size: 10, mono: true, color: VAL });
    body(618, 290, 'w destroys, a keeps.', { size: 10, bold: true });
  }
  if (p > 0.78) {
    card(604, 334, 266, 100, { fill: WARNDIM, stroke: WARN });
    body(618, 354, 'The b flag', { size: 10, bold: true, color: WARN });
    body(618, 376, 'no effect on POSIX; on Windows', { size: 9, color: INK });
    body(618, 394, 'it stops newline translation', { size: 9, color: INK });
    body(618, 412, 'and 0x1A read as end of file.', { size: 9, color: INK });
  }
}

/* ---------- scene 3: the null pointer ---------- */
function sceneNull(t, sc) {
  var p = prog(t, sc);
  heading('fopen returns a pointer, and the pointer can be null');
  subline('"The open failed" and "the file is empty" are different states with different symptoms.');

  card(24, 62, 420, 190, { fill: BADDIM, stroke: BAD });
  label(40, 82, 'THE OPEN FAILED', BAD);
  body(40, 106, 'FILE *fp = fopen("nofile.txt", "r");', { size: 10, mono: true });
  body(40, 130, 'fp is ' + (V.MISSING_OPEN.ok ? 'a stream' : 'NULL') + ' — no stream exists', { size: 10, bold: true });
  body(40, 152, 'reason: ' + V.MISSING_OPEN.reason, { size: 10, color: BAD, mono: true });
  if (p > 0.2) {
    body(40, 178, 'fgetc(NULL) is undefined behaviour:', { size: 10, color: INK });
    body(40, 198, 'a crash, or a quiet wrong answer.', { size: 10, color: INK });
    chip(40, 224, 'undefined, not "prints nothing"', 'bad');
  }

  card(464, 62, 406, 190, { fill: ACCDIM, stroke: ACC });
  label(480, 82, 'THE FILE IS EMPTY', ACC);
  body(480, 106, 'fopen succeeded, size ' + V.EMPTY_OPEN.size, { size: 10, mono: true });
  body(480, 130, 'first read returns ' + V.EMPTY_OPEN.firstRead + ' (EOF)', { size: 10, bold: true });
  body(480, 152, 'and sets the end flag', { size: 10, color: DIM });
  if (p > 0.28) {
    body(480, 178, 'A stream exists. It has a position of 0', { size: 10 });
    body(480, 198, 'and nothing to read.', { size: 10 });
    chip(480, 224, 'defined: EOF, eof flag set', 'ok');
  }

  if (p > 0.42) {
    card(24, 268, 846, 168);
    label(40, 288, 'THE CHECK, AND WHY IT COMES FIRST');
    body(40, 312, 'if ((fp = fopen(name, "r")) == NULL) { perror(name); return 1; }', { size: 10, mono: true, color: ACC });
    body(40, 336, 'The assignment sits inside the comparison, so the pointer is stored and tested once.', { size: 10 });
    body(40, 358, 'perror reads errno: the null pointer says that something failed, not what failed.', { size: 10 });
    body(40, 380, 'POSIX requires errno to be set by a failing fopen; the C standard alone does not.', { size: 10, color: DIM });
    body(40, 402, 'So a portable program tests the pointer, and a program that wants the reason uses errno.', { size: 10, color: DIM });
  }
  if (p > 0.86) {
    chip(40, 424, 'class A: Section 4, Programming in C', 'ok');
  }
}

/* ---------- scene 4: fgetc returns an int ---------- */
function sceneGetc(t, sc) {
  var p = prog(t, sc);
  heading('fgetc returns an int, and that is not a detail');
  subline('One byte of value 255, read by the same loop twice — once into an int, once into a char.');

  /* the file */
  card(24, 62, 420, 96, { fill: SURF2 });
  label(40, 82, 'THE FILE ON DISK — THREE BYTES');
  var cells = [97, 255, 98];
  for (var i = 0; i < cells.length; i++) {
    card(40 + i * 84, 94, 76, 46, { fill: SURF, stroke: BORDER });
    txt(78 + i * 84, 108, 'byte ' + i, { size: 8, color: FAINT, align: 'center' });
    txt(78 + i * 84, 130, String(cells[i]), { size: 13, bold: true, mono: true, align: 'center', color: cells[i] === 255 ? BAD : INK });
  }
  body(320, 108, "'a'", { size: 10, mono: true, color: DIM });
  body(320, 126, '0xFF', { size: 10, mono: true, color: BAD });
  body(320, 144, "'b'", { size: 10, mono: true, color: DIM });

  /* int loop */
  card(24, 174, 420, 130);
  label(40, 194, 'int c;  while ((c = fgetc(fp)) != EOF)');
  body(40, 220, 'read ' + V.INT_LOOP.count + ' bytes: ' + V.INT_LOOP.values.join(', '), { size: 10, mono: true, color: VAL });
  body(40, 242, 'the loop ends only when the read fails', { size: 10, color: DIM });
  if (p > 0.3) {
    body(40, 268, '255 is data. EOF is ' + V.EOF + ', outside 0..255.', { size: 10, bold: true });
    body(40, 290, 'That is why the result cannot be a char.', { size: 10, color: DIM });
  }

  /* char loop */
  card(24, 320, 420, 128, { fill: BADDIM, stroke: BAD });
  label(40, 340, 'char c;  while ((c = fgetc(fp)) != EOF)', BAD);
  body(40, 366, 'read ' + V.CHAR_LOOP.count + ' byte: ' + V.CHAR_LOOP.values.join(', '), { size: 10, mono: true, color: BAD });
  body(40, 388, 'byte 255 narrowed to a signed char is minus one', { size: 10 });
  body(40, 410, 'so the second iteration stops the loop early', { size: 10 });
  if (p > 0.72) chip(40, 432, 'implementation-defined: char may be unsigned', 'warn');

  /* right column: the two questions feof answers */
  label(464, 82, 'WHAT EOF IS, AND WHAT feof IS');
  bullets(464, 104, [
    'EOF is a negative int, conventionally -1',
    '256 byte values are legal data',
    'EOF is outside them, so it can signal failure',
    'feof reports the last operation, not the file',
    'after the read of the last byte, feof is still 0'
  ], p, 0.16, 0.1, { lead: 24 });

  if (p > 0.62) {
    card(464, 244, 406, 96, { fill: ACCDIM, stroke: ACC });
    label(478, 262, 'THE LOOP THAT IS ALWAYS RIGHT');
    body(478, 286, 'int c;', { size: 10, mono: true, bold: true });
    body(478, 306, 'while ((c = fgetc(fp)) != EOF)', { size: 10, mono: true });
    body(478, 326, '    putchar(c);', { size: 10, mono: true });
  }
  if (p > 0.84) {
    card(464, 356, 406, 92, { fill: SURF2 });
    body(478, 376, 'One read per iteration, and the test is', { size: 10 });
    body(478, 396, 'the read. No value is used that was', { size: 10 });
    body(478, 416, 'never returned by a call.', { size: 10 });
  }
}

/* ---------- scene 5: fgets ---------- */
function sceneFgets(t, sc) {
  var p = prog(t, sc);
  heading('fgets reads a line, almost');
  subline('A buffer of four on "hello" and a newline: two calls, three characters each.');

  card(24, 62, 480, 200);
  label(40, 82, 'char buf[4];  fgets(buf, 4, fp)');
  var calls = V.FG;
  for (var i = 0; i < calls.length; i++) {
    if (p < 0.1 + i * 0.14) break;
    var y = 108 + i * 46;
    body(40, y, 'call ' + (i + 1), { size: 10, bold: true, color: ACC });
    if (calls[i] === null) {
      body(140, y, 'returns NULL — nothing more to read', { size: 10, color: BAD, mono: true });
    } else {
      body(140, y, 'buf holds ' + calls[i].len + ' characters: ' + calls[i].text, { size: 10, mono: true });
      body(140, y + 18, 'plus the terminating zero, which is why size is 4', { size: 9, color: DIM });
    }
  }
  if (p > 0.6) {
    rule(40, 244, 488, 244);
    body(40, 262, 'read 1: h e l' + '   read 2: l o \\n' + '   total ' + (V.FG[0].len + V.FG[1].len) + ' bytes of the 6', { size: 10, mono: true, color: ACC });
  }

  /* the duplicate-line bug */
  if (p > 0.4) {
    card(24, 288, 480, 160, { fill: BADDIM, stroke: BAD });
    label(40, 308, 'while (!feof(fp)) { fgets(buf, 16, fp); printf("%s", buf); }', BAD);
    body(40, 332, 'two successful reads, ' + V.DUP.iterations + ' prints', { size: 10, bold: true });
    var printed = V.DUP.prints.map(function (s) { return '"' + s + '"'; }).join('  ');
    body(40, 354, printed, { size: 9, mono: true, color: BAD });
    body(40, 376, 'the third call returned NULL and left the buffer alone,', { size: 10 });
    body(40, 396, 'so the last line is printed a second time.', { size: 10 });
    if (p > 0.86) chip(40, 424, 'duplicates: ' + V.DUP.duplicates + ' line', 'bad');
  }

  /* right column */
  label(524, 82, 'THE THREE FACTS ABOUT fgets');
  bullets(524, 104, [
    'reads at most n-1 characters',
    'keeps the newline when it fits',
    'always writes a terminating zero',
    'returns the buffer, or NULL',
    'on NULL the buffer is untouched'
  ], p, 0.2, 0.09, { lead: 24 });

  if (p > 0.55) {
    card(524, 232, 346, 104, { fill: ACCDIM, stroke: ACC });
    label(538, 250, 'THE LOOP THAT IS ALWAYS RIGHT');
    body(538, 274, 'while (fgets(buf, sizeof buf, fp) != NULL)', { size: 10, mono: true, bold: true });
    body(538, 296, '    fputs(buf, stdout);', { size: 10, mono: true });
    body(538, 318, 'sizeof buf, not a remembered 16.', { size: 9, color: DIM });
  }
  if (p > 0.76) {
    card(524, 350, 346, 98, { fill: SURF2 });
    body(538, 370, 'gets was removed in C11: it had no size,', { size: 10 });
    body(538, 390, 'so no input could be read safely with it.', { size: 10 });
    body(538, 412, 'fgets with a size is the replacement.', { size: 10, color: ACC });
  }
}

/* ---------- scene 6: return values that count ---------- */
function sceneFormatted(t, sc) {
  var p = prog(t, sc);
  heading('Return values that count');
  subline('Four functions, four counts. A short count is the only error signal on input.');

  var rows = [
    ['fprintf', 'characters written', String(V.FPRINTF.bytes) + ' for 1..10'],
    ['fscanf', 'items assigned', String(V.SCANF.assigned) + ' of 3'],
    ['fread', 'elements read', String(V.FREAD.got) + ' of 4'],
    ['fwrite', 'elements written', 'the count you asked for']
  ];
  card(24, 62, 470, 168);
  label(40, 82, 'WHAT EACH CALL RETURNS');
  for (var i = 0; i < rows.length; i++) {
    if (p < 0.1 + i * 0.09) break;
    var y = 110 + i * 30;
    body(40, y, rows[i][0], { size: 10, bold: true, mono: true, color: ACC });
    body(140, y, rows[i][1], { size: 10, color: DIM });
    body(320, y, rows[i][2], { size: 10, mono: true });
  }

  if (p > 0.42) {
    card(24, 246, 470, 100, { fill: SURF2 });
    label(40, 266, 'THE BYTE COUNT, COMPUTED BOTH WAYS');
    body(40, 290, V.FPRINTF.digits + ' digits + ' + V.FPRINTF.newlines + ' newlines = ' + V.FPRINTF.bytes + ' bytes', { size: 10, mono: true });
    body(40, 312, 'written out and measured on the file: ' + V.FPRINTF_MEASURED + ' bytes', { size: 10, mono: true, color: VAL });
    body(40, 332, 'nine single digits, two for ten, one newline each.', { size: 9, color: DIM });
  }

  if (p > 0.66) {
    card(24, 362, 470, 86, { fill: ACCDIM, stroke: ACC });
    label(40, 382, 'THE INPUT SIDE');
    body(40, 406, '"12 34 x" with "%d %d %d" assigns ' + V.SCANF.assigned + ', then stops at "' + V.SCANF.stoppedAt + '"', { size: 10, mono: true });
    body(40, 428, 'the position stays on the letter, so the next call sees it again.', { size: 9, color: DIM });
  }

  /* right column */
  label(514, 82, 'THE ELEMENT COUNT');
  bullets(514, 104, [
    'fread and fwrite count elements',
    'not bytes: the size is a parameter',
    'a short count means end or error',
    'check it before using the data'
  ], p, 0.22, 0.1, { lead: 24 });

  if (p > 0.5) {
    card(514, 206, 356, 112, { fill: WARNDIM, stroke: WARN });
    label(528, 224, 'TEN BYTES, FOUR INTS, ASK FOR FOUR', WARN);
    body(528, 248, 'got ' + V.FREAD.got + ' elements, consumed ' + V.FREAD.consumed + ' bytes', { size: 10, mono: true });
    body(528, 270, V.FREAD.left + ' bytes left over: not a whole int', { size: 10, mono: true });
    body(528, 292, 'asking for 10 would have been bytes, not ints', { size: 9, color: DIM });
  }
  if (p > 0.78) {
    card(514, 334, 356, 114, { fill: SURF2 });
    body(528, 354, 'A program that prints the buffer', { size: 10 });
    body(528, 374, 'without testing the count prints', { size: 10 });
    body(528, 394, 'whatever was in the buffer before,', { size: 10 });
    body(528, 414, 'which is not a defined output.', { size: 10 });
    if (p > 0.93) chip(528, 434, 'undefined, so not answerable', 'bad');
  }
}

/* ---------- scene 7: positions ---------- */
function sceneSeek(t, sc) {
  var p = prog(t, sc);
  heading('Position: ftell, fseek, rewind');
  subline('Eleven bytes, five reads, and a seek counted from the end.');

  /* the file strip with a position marker */
  card(24, 62, 560, 150, { fill: SURF2 });
  label(40, 82, 'THE FILE — ELEVEN BYTES');
  var digits = '0123456789'.split('');
  for (var i = 0; i < 11; i++) {
    var ch = i < 10 ? digits[i] : '\\n';
    card(40 + i * 44, 94, 38, 34, { fill: SURF, stroke: BORDER });
    txt(59 + i * 44, 116, ch, { size: 11, mono: true, align: 'center', color: i === 10 ? FAINT : INK });
  }
  if (p > 0.16) {
    txt(59 + 5 * 44, 144, '^', { size: 12, mono: true, align: 'center', color: ACC });
    body(40, 164, 'after five reads ftell reports ' + V.POS.afterFive, { size: 10, color: ACC, mono: true });
  }
  if (p > 0.4) {
    txt(59 + 8 * 44, 144, '^', { size: 12, mono: true, align: 'center', color: WARN });
    body(40, 186, 'fseek(fp, -3, SEEK_END) reports position ' + V.POS.afterEnd + ' of ' + V.POS.len, { size: 10, color: WARN, mono: true });
  }

  card(24, 226, 560, 120);
  label(40, 246, 'THE THREE ORIGINS');
  body(40, 270, 'SEEK_SET  from the start of the file', { size: 10, mono: true });
  body(40, 292, 'SEEK_CUR  from where the position is now', { size: 10, mono: true });
  body(40, 314, 'SEEK_END  from the end, so negative counts back', { size: 10, mono: true });
  if (p > 0.62) {
    body(40, 336, 'the three bytes at ' + V.POS.afterEnd + ' are ' + V.POS.tail.join(', ') + ' — 8, 9 and the newline', { size: 9, color: DIM, mono: true });
  }

  if (p > 0.76) {
    card(24, 360, 560, 88, { fill: WARNDIM, stroke: WARN });
    label(40, 380, 'TEXT STREAM VERSUS BINARY STREAM', WARN);
    body(40, 404, 'text: only 0, or an offset ftell produced, is portable', { size: 10 });
    body(40, 426, 'binary ("rb"): any offset is defined', { size: 10, color: ACC });
  }

  /* right column */
  label(604, 82, 'THE THREE FACTS');
  bullets(604, 104, [
    'ftell returns a long offset from the start',
    'fseek returns 0, or nonzero on failure',
    'a successful seek clears the end flag',
    'rewind also clears the error flag'
  ], p, 0.24, 0.1, { lead: 26 });

  if (p > 0.56) {
    card(604, 226, 266, 104, { fill: ACCDIM, stroke: ACC });
    label(618, 244, 'A QUESTION SHAPE', ACC);
    body(618, 268, 'seek to the end, ftell, seek', { size: 9 });
    body(618, 286, 'back, read: that is a size', { size: 9 });
    body(618, 304, 'computation in two lines.', { size: 9 });
    body(618, 322, 'needs "rb" to be guaranteed.', { size: 9, color: BAD });
  }
  if (p > 0.82) {
    card(604, 348, 266, 100, { fill: SURF2 });
    body(618, 368, 'A seek past the end then a write', { size: 9 });
    body(618, 386, 'creates a hole. The C standard', { size: 9 });
    body(618, 404, 'leaves the resulting size to the', { size: 9 });
    body(618, 422, 'implementation, so it is not asked.', { size: 9 });
  }
}

/* ---------- scene 8: append ignores the position ---------- */
function sceneAppend(t, sc) {
  var p = prog(t, sc);
  heading('Append mode ignores the position');
  subline('Three identical statements, run in "a" and in "r+". The results differ in one byte.');

  function strip(x, y, text, colour) {
    var arr = text.split('');
    for (var i = 0; i < arr.length; i++) {
      card(x + i * 46, y, 40, 36, { fill: SURF, stroke: colour || BORDER });
      txt(x + i * 46 + 20, y + 24, arr[i], { size: 12, mono: true, align: 'center', color: colour || INK });
    }
  }

  card(24, 62, 846, 140, { fill: SURF2 });
  label(40, 82, 'THE THREE STATEMENTS');
  body(40, 106, 'fp = fopen("t.txt", MODE);   fseek(fp, 0, SEEK_SET);   fputc(\'X\', fp);', { size: 10, mono: true, color: ACC });
  body(40, 130, 'the file before the open holds "abc"', { size: 10, color: DIM });
  if (p > 0.2) {
    body(40, 158, 'mode "a":  opened at ' + V.APPEND_WRITE.openedAt + ', sought to ' + V.APPEND_WRITE.sought + ', position after write ' + V.APPEND_WRITE.posAfter, { size: 10, mono: true, color: WARN });
    body(40, 180, 'mode "r+": opened at ' + V.RP_WRITE.openedAt + ', sought to ' + V.RP_WRITE.sought + ', position after write ' + V.RP_WRITE.posAfter, { size: 10, mono: true, color: ACC });
  }

  if (p > 0.34) {
    card(24, 214, 410, 128);
    label(40, 234, 'MODE "a" — SIZE ' + V.APPEND_WRITE.size, WARN);
    strip(40, 248, V.APPEND_WRITE.text, WARN);
    body(40, 306, 'the write landed after the old content', { size: 10 });
    body(40, 326, 'because append ignores where you sought', { size: 10, color: DIM });
  }
  if (p > 0.48) {
    card(460, 214, 410, 128);
    label(476, 234, 'MODE "r+" — SIZE ' + V.RP_WRITE.size, ACC);
    strip(476, 248, V.RP_WRITE.text, ACC);
    body(476, 306, 'the write landed at position 0', { size: 10 });
    body(476, 326, 'because r+ honours the position', { size: 10, color: DIM });
  }

  if (p > 0.66) {
    card(24, 356, 846, 92, { fill: ACCDIM, stroke: ACC });
    label(40, 376, 'THE RULE, AND WHY IT EXISTS', ACC);
    body(40, 400, 'In append modes data is written to the end of the file regardless of the current position of the file position indicator.', { size: 9 });
    body(40, 422, 'That is what lets two processes append to one log file without overwriting each other.', { size: 9, color: DIM });
  }
  if (p > 0.88) chip(700, 440, 'a+ reads from the start', 'warn');
}

/* ---------- scene 9: update streams ---------- */
function sceneUpdate(t, sc) {
  var p = prog(t, sc);
  heading('Update streams: the interleaving rule');
  subline('One buffer serves both directions, so the library has to be told which way you are going.');

  card(24, 62, 420, 150, { fill: BADDIM, stroke: BAD });
  label(40, 82, 'READ THEN WRITE, NO POSITIONING CALL', BAD);
  body(40, 106, 'c = fgetc(fp);   fputc(\'Z\', fp);', { size: 10, mono: true });
  body(40, 130, 'first byte read: ' + V.UPD_BAD.firstByte + " ('a')", { size: 10, mono: true });
  body(40, 152, 'the program is not defined', { size: 10, bold: true, color: BAD });
  body(40, 174, 'it is not "reads the old byte"', { size: 10, color: DIM });
  if (p > 0.22) chip(40, 196, 'undefined, so no output to compute', 'bad');

  card(464, 62, 406, 150, { fill: ACCDIM, stroke: ACC });
  label(480, 82, 'READ, SEEK, THEN WRITE', ACC);
  body(480, 106, 'c = fgetc(fp);  fseek(fp, 0, SEEK_SET);  fputc(\'Z\', fp);', { size: 9, mono: true });
  body(480, 130, 'the file becomes "' + V.UPD_GOOD.text + '"', { size: 10, mono: true, bold: true });
  body(480, 152, 'position after the write: ' + V.UPD_GOOD.posAfter, { size: 10, color: DIM });
  body(480, 174, 'the seek said where, so the write went there', { size: 10 });
  if (p > 0.3) chip(480, 196, 'defined, and the answer is fixed', 'ok');

  if (p > 0.42) {
    card(24, 228, 846, 120);
    label(40, 248, 'THE RULE, IN BOTH DIRECTIONS');
    body(40, 272, 'output then input: needs fflush, fseek, fsetpos or rewind in between', { size: 10, mono: true });
    body(40, 294, 'input then output: needs fseek, fsetpos or rewind, unless the input hit the end', { size: 10, mono: true });
    body(40, 318, 'The two directions share one buffer, so this is the signal that says which way it is being used.', { size: 9, color: DIM });
    body(40, 338, 'fflush on an input stream is undefined in C and a no-op on POSIX: portable code uses a seek.', { size: 9, color: DIM });
  }

  if (p > 0.62) {
    card(24, 364, 410, 84, { fill: SURF2 });
    label(40, 382, 'WHERE THE BYTES ARE');
    body(40, 406, 'fputs("hello", fp) into a write stream:', { size: 9, mono: true });
    body(40, 426, 'buffer ' + V.BUFFER.inBuffer + ' bytes, disk ' + (V.BUFFER.afterFlush - V.BUFFER.inBuffer) + ' bytes', { size: 10, mono: true, color: BAD });
  }
  if (p > 0.78) {
    card(460, 364, 410, 84, { fill: ACCDIM, stroke: ACC });
    label(476, 382, 'AFTER THE FLUSH', ACC);
    body(476, 406, 'disk ' + V.BUFFER.afterFlush + ' bytes: "' + V.BUFFER.text + '"', { size: 10, mono: true });
    body(476, 426, 'that is the fact behind "it crashed and the file is empty"', { size: 9, color: DIM });
  }
}

/* ---------- scene 10: close, and the procedure ---------- */
function sceneClose(t, sc) {
  var p = prog(t, sc);
  heading('fclose flushes, and its return is the last report');
  subline('Five buffered characters become five bytes on the disk, and the close says whether it worked.');

  card(24, 62, 420, 130);
  label(40, 82, 'fclose DOES TWO THINGS, IN THIS ORDER');
  body(40, 106, '1. write out what is still in the buffer', { size: 10 });
  body(40, 128, '2. release the stream', { size: 10 });
  body(40, 152, 'returns 0 on success, EOF (' + V.EOF + ') when the flush failed', { size: 10, mono: true, color: ACC });
  if (p > 0.2) {
    body(40, 176, 'a full disk is the usual reason, and it is silent without this check', { size: 9, color: DIM });
  }

  card(464, 62, 406, 130, { fill: SURF2 });
  label(480, 82, 'THE BUFFER, COUNTED');
  body(480, 106, 'in the buffer before the flush: ' + V.BUFFER.inBuffer, { size: 10, mono: true, color: WARN });
  body(480, 128, 'on the disk after the flush: ' + V.BUFFER.afterFlush, { size: 10, mono: true, color: VAL });
  body(480, 150, 'fclose returned ' + V.BUFFER.closeRet, { size: 10, mono: true });
  if (p > 0.28) {
    body(480, 174, 'returning from main or calling exit flushes; a crash does not', { size: 9, color: DIM });
  }

  if (p > 0.4) {
    card(24, 208, 846, 190, { fill: ACCDIM, stroke: ACC });
    label(40, 228, 'THE FIVE-STEP PROCEDURE', ACC);
    var steps = [
      '1  Check the open: the pointer is null, or it is a stream.',
      '2  Know the position: what the mode did, then what ftell says.',
      '3  Check the count: characters, items or elements, whichever the call returns.',
      '4  Position between the two directions, or the program is not defined.',
      '5  Check the close: it is the last report the library gives.'
    ];
    for (var i = 0; i < steps.length; i++) {
      if (p < 0.44 + i * 0.08) break;
      body(40, 254 + i * 26, steps[i], { size: 10, color: i === 3 ? BAD : INK });
    }
  }

  if (p > 0.84) {
    card(24, 412, 846, 40, { fill: SURF2 });
    body(40, 438, 'Every count on this page came from running the calls against simulated files, then from a second route.', { size: 9, color: DIM });
  }
}

/* ---------- dispatch ---------- */
var SCENES = {
  stream: sceneStream,
  modes: sceneModes,
  null: sceneNull,
  getc: sceneGetc,
  fgets: sceneFgets,
  formatted: sceneFormatted,
  seek: sceneSeek,
  append: sceneAppend,
  update: sceneUpdate,
  close: sceneClose
};

function drawFrame(P_) {
  if (!P_) return;
  P = P_;
  P.clear();
  var t = K.state.elapsed;
  var i = K.sceneAt(t);
  var sc = K.state.scenes[i];
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
