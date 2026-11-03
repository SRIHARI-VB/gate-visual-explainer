/* ==========================================================================
   file-io-in-c — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'stream', n: 1,
      title: 'A stream, not a file',
      start: 0, end: 30,
      objective: 'See that FILE * is a handle to a stream — a position, a buffer and two flags — and that stdin, stdout and stderr are already open when main starts.'
    },
    {
      id: 'modes', n: 2,
      title: 'The six modes, and what each one does to what is already there',
      start: 30, end: 60,
      objective: 'Run every legal mode string against an existing file and a missing one, and read off four facts each time: does the open succeed, is the content destroyed, where is the position, and is reading or writing allowed.'
    },
    {
      id: 'null', n: 3,
      title: 'fopen returns a pointer, and the pointer can be null',
      start: 60, end: 90,
      objective: 'Separate "the file is empty" from "the open failed", and see why using the result of a failed fopen is undefined behaviour rather than an empty file.'
    },
    {
      id: 'getc', n: 4,
      title: 'fgetc returns an int, and that is not a detail',
      start: 90, end: 120,
      objective: 'Read a file with a loop that ends on EOF, and watch the same loop stop after one byte when the result is stored in a char, because one legal byte equals EOF.'
    },
    {
      id: 'fgets', n: 5,
      title: 'fgets reads a line, almost',
      start: 120, end: 150,
      objective: 'Count what fgets stores: at most n minus one characters, the newline kept if it fits, always a terminator. Then see the loop that prints the last line twice.'
    },
    {
      id: 'formatted', n: 6,
      title: 'Return values that count',
      start: 150, end: 180,
      objective: 'Read the return of fprintf, fscanf, fread and fwrite as a count, and use a short count as the only reliable error signal on input.'
    },
    {
      id: 'seek', n: 7,
      title: 'Position: ftell, fseek, rewind',
      start: 180, end: 210,
      objective: 'Track the file position as a number, move it with the three origins, and know which offsets the standard leaves to the implementation in a text stream.'
    },
    {
      id: 'append', n: 8,
      title: 'Append mode ignores the position',
      start: 210, end: 240,
      objective: 'See that in "a" the position moves but every write lands at the end anyway, and contrast it with the identical operations in "r+".'
    },
    {
      id: 'update', n: 9,
      title: 'Update streams: the interleaving rule',
      start: 240, end: 270,
      objective: 'Read the rule that a write must be followed by fflush or a positioning call before a read, see what the rule costs when it is skipped, and see where the bytes actually sit while the stream is buffered.'
    },
    {
      id: 'close', n: 10,
      title: 'fclose flushes, and its return value is the last chance',
      start: 270, end: 300,
      objective: 'Close the loop: buffered bytes reach the disk on fclose, fclose reports failure with EOF, and the five-step procedure that answers any file-I/O question.'
    }
  ],

  events: [
    /* ---------------- scene 1: a stream, not a file ---------------- */
    {
      id: 'e01', scene: 'stream', start: 0, end: 6,
      caption: 'A FILE pointer is a handle to a stream, not the file itself.',
      narration: 'A FILE pointer is a handle to a stream. It is not the file, and it does not hold the file.',
      detail: 'The FILE object is a record the library keeps about an open file: where the next read will come from, which buffer belongs to it, whether the end has been seen, and whether an error has occurred. The bytes themselves are on the disk.',
      keyword: 'FILE pointer'
    },
    {
      id: 'e02', scene: 'stream', start: 6, end: 12,
      caption: 'The record holds a position, a buffer, an end flag and an error flag.',
      narration: 'Inside the record there are four things: a position, a buffer, an end flag and an error flag. Every function in this lesson changes one of those four.',
      detail: 'Reading advances the position. Writing fills the buffer. feof reports the end flag and ferror reports the error flag, and both report a fact about the last operation rather than about the disk.',
      keyword: 'stream state'
    },
    {
      id: 'e03', scene: 'stream', start: 12, end: 18,
      caption: 'Three streams are already open when main starts: stdin, stdout, stderr.',
      narration: 'Three streams are open before your first line runs: standard input, standard output and standard error. That is why printf needs no fopen.',
      detail: 'stdin, stdout and stderr are macros that expand to expressions of type FILE star. printf is fprintf to stdout; scanf is fscanf from stdin. Closing stdout and then printing is undefined behaviour.',
      keyword: 'stdin stdout stderr'
    },
    {
      id: 'e04', scene: 'stream', start: 18, end: 24,
      caption: 'The buffer sits between your program and the disk. The bytes are in one place or the other.',
      narration: 'Between your program and the disk there is a buffer. A write goes into the buffer first, and reaches the disk later, when the buffer fills or the stream is flushed or closed.',
      detail: 'A stream opened with fopen is fully buffered unless the name refers to an interactive device. That is why a program that writes and then crashes can lose its output, and why fflush exists.',
      keyword: 'buffer'
    },
    {
      id: 'e05', scene: 'stream', start: 24, end: 30,
      caption: 'So a file question is really four questions: open, position, count, close.',
      narration: 'So every file question in the exam is really four questions. Did the open succeed? Where is the position? What does the call return? And did the close flush what was written?',
      detail: 'This page keeps those four questions in view for every function, because they are the four places a question can be answered wrongly.',
      keyword: 'four questions'
    },

    /* ---------------- scene 2: the six modes ---------------- */
    {
      id: 'e06', scene: 'modes', start: 30, end: 36,
      caption: 'A mode string says three things: what you may do, where you start, and what happens to the old content.',
      narration: 'A mode string answers three questions at once: what you are allowed to do, where the position starts, and what happens to whatever is already in the file.',
      detail: 'The first character chooses the family: r for read, w for write, a for append. A plus adds the other direction. A b chooses binary mode. Anything else is not one of the listed strings, and the behaviour is then undefined.',
      keyword: 'mode string'
    },
    {
      id: 'e07', scene: 'modes', start: 36, end: 42,
      caption: 'On an existing file of four bytes: r opens at 0, w empties it, a opens at the end.',
      narration: 'Take a file that already holds four bytes. In r the open succeeds and the position is zero. In w the open succeeds and the file is now empty. In a the open succeeds and the position is four.',
      detail: 'The mode table on the canvas is produced by running the six strings against a simulated file, not by quoting a table. The size after the open is the column that decides most questions.',
      keyword: 'truncation'
    },
    {
      id: 'e08', scene: 'modes', start: 42, end: 48,
      caption: 'On a missing file: r and r+ fail; w, w+, a and a+ create it.',
      narration: 'Now the same six strings on a file that does not exist. The two read-first modes fail. The other four create the file, and the open succeeds.',
      detail: 'This is the single most asked fact about fopen: r fails on a missing file, and it fails by returning a null pointer rather than by creating anything.',
      keyword: 'missing file'
    },
    {
      id: 'e09', scene: 'modes', start: 48, end: 54,
      caption: 'The plus adds the other direction. It never rescues a file that does not exist.',
      narration: 'A plus sign adds the other direction of access. It does not change the existence rule: r plus still fails on a missing file, because the family is still r.',
      detail: 'w+ empties an existing file and then lets you read what you write, after a positioning call. r+ opens an existing file for both directions and starts at the beginning. a+ creates if missing, reads from the start and writes at the end.',
      keyword: 'r+ w+ a+'
    },
    {
      id: 'e10', scene: 'modes', start: 54, end: 60,
      caption: 'b changes nothing on a text stream question, and everything on Windows.',
      narration: 'The letter b selects binary mode. On a POSIX system it changes nothing at all. On Windows it stops the library translating a newline into two bytes, and it stops a byte of value twenty-six from being read as end of file.',
      detail: 'The b flag also matters for fseek: a text stream accepts only the offsets that ftell produced and zero, while a binary stream accepts any offset. That difference is why a byte count question often specifies rb.',
      keyword: 'binary mode'
    },

    /* ---------------- scene 3: fopen can fail ---------------- */
    {
      id: 'e11', scene: 'null', start: 60, end: 66,
      caption: 'fopen returns a null pointer when it cannot open. It does not return an empty stream.',
      narration: 'When fopen cannot open the file it returns a null pointer. It does not return a stream that is empty, and it does not stop the program.',
      detail: 'A failed open sets no end flag and no error flag, because there is no stream to hold them. The function that failed is the only place the failure is reported.',
      keyword: 'null pointer'
    },
    {
      id: 'e12', scene: 'null', start: 66, end: 72,
      caption: 'Using that pointer is undefined behaviour: a crash, or worse, a quiet wrong answer.',
      narration: 'Using the pointer anyway is undefined behaviour. In practice it is usually a crash, and sometimes it is not a crash, which is worse.',
      detail: 'Undefined behaviour is not "prints nothing". It is "the standard makes no promise", so an exam that asks for the output of such a program is asking an unanswerable question, and a well-posed paper does not do it.',
      keyword: 'undefined behaviour'
    },
    {
      id: 'e13', scene: 'null', start: 72, end: 78,
      caption: 'The check is one line, and it must come before the first use.',
      narration: 'The check is a single comparison, and it has to come before the first read, write or close. Here it is in the form the exam papers use.',
      detail: 'if ((fp = fopen(name, "r")) == NULL) { perror(name); return 1; } — the assignment sits inside the comparison so the pointer is tested and stored in one expression.',
      keyword: 'NULL check'
    },
    {
      id: 'e14', scene: 'null', start: 78, end: 84,
      caption: 'An empty file is not a failed open: it opens, and the first read reports the end.',
      narration: 'An empty file is a different case. The open succeeds, the position is zero, and the first read fails because the end has already been reached.',
      detail: 'So "the file is empty" shows up as a read that returns EOF with the end flag set, and "the file is missing" shows up as a null pointer with no stream at all. Two different symptoms, two different checks.',
      keyword: 'empty file'
    },
    {
      id: 'e15', scene: 'null', start: 84, end: 90,
      caption: 'perror reads the reason from errno; the return value alone does not say why.',
      narration: 'The reason for the failure lives in errno, and perror turns it into a sentence. The null pointer tells you that something failed, not what failed.',
      detail: 'POSIX requires errno to be set when fopen fails; the C standard alone does not. So a portable program checks the pointer, and a program that wants the reason uses perror or strerror on errno.',
      keyword: 'errno'
    },

    /* ---------------- scene 4: fgetc returns int ---------------- */
    {
      id: 'e16', scene: 'getc', start: 90, end: 96,
      caption: 'fgetc returns the next byte as an int, or EOF when there is no next byte.',
      narration: 'fgetc returns the next byte, widened to an int, or the value EOF when there is no next byte.',
      detail: 'The byte is converted as unsigned char and then widened, so it arrives as a value from 0 to 255. EOF is a negative constant, conventionally minus one.',
      keyword: 'fgetc'
    },
    {
      id: 'e17', scene: 'getc', start: 96, end: 102,
      caption: 'That is why the result is stored in an int: all 256 byte values are legal, and EOF is not one of them.',
      narration: 'That is exactly why the result belongs in an int. Every one of the two hundred and fifty-six byte values is legal data, so the failure signal had to be a value outside that range.',
      detail: 'There are 256 possible bytes and only those. EOF is outside them, so a correct program can tell "I read a byte of value 255" from "I could not read".',
      keyword: 'int not char'
    },
    {
      id: 'e18', scene: 'getc', start: 102, end: 108,
      caption: 'Store it in a char and a byte of value 255 becomes EOF. The loop stops early.',
      narration: 'Store it in a char and the two cases collapse. A byte of value two hundred and fifty-five, held in a signed char, is minus one, which is EOF, and the loop stops in the middle of the file.',
      detail: 'The canvas reads the same three-byte file with both loops. The int loop reports three bytes; the char loop reports one. The file is a, then byte 255, then b.',
      keyword: 'char trap',
      trap: 'On a platform with signed char, a 0xFF byte in a char is indistinguishable from EOF. The C standard leaves plain char signed or unsigned, so this is implementation-defined.'
    },
    {
      id: 'e19', scene: 'getc', start: 108, end: 114,
      caption: 'The correct loop reads into an int and stops on EOF, never on feof.',
      narration: 'The correct loop reads into an int, and it stops when the read returns EOF. It does not ask feof whether the file has ended.',
      detail: 'while ((c = fgetc(fp)) != EOF) putchar(c); — one read per iteration, and the test is the read itself, so there is no way to use a value that was never read.',
      keyword: 'read loop'
    },
    {
      id: 'e20', scene: 'getc', start: 114, end: 120,
      caption: 'feof answers a question about the last read, so testing it first asks too early.',
      narration: 'feof answers a question about the last operation, not about the file. Testing it before a read asks about an operation that has not happened yet.',
      detail: 'After the read that returns the last byte, feof is still zero. Only the read that fails sets it. That single sentence is the whole of the next scene but one.',
      keyword: 'feof timing'
    },

    /* ---------------- scene 5: fgets ---------------- */
    {
      id: 'e21', scene: 'fgets', start: 120, end: 126,
      caption: 'fgets takes a size, reads at most one less than it, and always terminates.',
      narration: 'fgets takes a size and reads at most one character fewer than that, because one slot must hold the terminating zero.',
      detail: 'char buf[16]; fgets(buf, 16, fp); reads at most 15 characters and then writes a zero. The zero is not counted in the size the function was given.',
      keyword: 'fgets size'
    },
    {
      id: 'e22', scene: 'fgets', start: 126, end: 132,
      caption: 'It keeps the newline, so a line ends in a newline and a zero, not a zero alone.',
      narration: 'It keeps the newline if the newline fits. So the string you get back ends with a newline and then a zero, which is not what you get from a word-by-word scanf.',
      detail: 'The canvas reads "hello" followed by a newline with a size of four: the first call returns h, e, l and a zero; the second returns l, o, newline and a zero. Two calls, three characters each.',
      keyword: 'newline kept'
    },
    {
      id: 'e23', scene: 'fgets', start: 132, end: 138,
      caption: 'A short buffer splits a line, and the rest arrives on the next call.',
      narration: 'A buffer that is too short does not lose the rest of the line. It splits the line, and the next call carries on from where this one stopped.',
      detail: 'That is why a loop around fgets with a small buffer still reads every byte exactly once, and why the pieces do not line up with the lines.',
      keyword: 'splitting a line'
    },
    {
      id: 'e24', scene: 'fgets', start: 138, end: 144,
      caption: 'It returns the buffer, or a null pointer at the end or on an error.',
      narration: 'It returns the buffer on success and a null pointer when there is nothing more to read or when a read fails.',
      detail: 'So the loop is while (fgets(buf, size, fp) != NULL) { ... }, and the test is the return value. The buffer is untouched when the call returns null, which is where the next trap comes from.',
      keyword: 'fgets return'
    },
    {
      id: 'e25', scene: 'fgets', start: 144, end: 150,
      caption: 'The buffer is not cleared on failure, so the last line is printed twice.',
      narration: 'Because the buffer is left alone when the call fails, a loop that tests feof and then prints the buffer prints the last line one extra time.',
      detail: 'On a two-line file the canvas counts two successful reads, three loop iterations and one duplicated line. The bug is not a duplicated read; it is a print of a string nobody read.',
      keyword: 'duplicate last line',
      trap: 'while (!feof(fp)) { fgets(buf, n, fp); printf("%s", buf); } prints the final line twice. Test the return value of the read, not feof.'
    },

    /* ---------------- scene 6: counts ---------------- */
    {
      id: 'e26', scene: 'formatted', start: 150, end: 156,
      caption: 'fprintf returns the number of characters written, or a negative value on failure.',
      narration: 'fprintf returns a count of characters written, and a negative value when the write failed. The count is the one you can check.',
      detail: 'The count is what the conversion produced, not what the buffer did with it. A write that goes into the buffer still reports its characters as written.',
      keyword: 'fprintf count'
    },
    {
      id: 'e27', scene: 'formatted', start: 156, end: 162,
      caption: 'A loop writing one number and a newline for one to ten writes twenty-one bytes.',
      narration: 'Writing the numbers one to ten, each followed by a newline, writes twenty-one bytes: nine single digits, two digits for ten, and ten newlines.',
      detail: 'The canvas counts it by running the loop against a simulated file: 9 + 2 digits and 10 newlines, so 21. That is the shape of a "how large is the file" question.',
      keyword: 'byte count'
    },
    {
      id: 'e28', scene: 'formatted', start: 162, end: 168,
      caption: 'fscanf returns how many items it assigned. A short count is the failure.',
      narration: 'fscanf returns the number of items it managed to assign. If it assigned fewer than you asked for, the input did not match.',
      detail: 'On the text 12 34 x, the call fscanf(fp, "%d %d %d", &a, &b, &c) returns 2: the third conversion meets a letter and stops, leaving the position at that letter.',
      keyword: 'fscanf count'
    },
    {
      id: 'e29', scene: 'formatted', start: 168, end: 174,
      caption: 'fread and fwrite count elements, not bytes. Read the short count as an error.',
      narration: 'fread and fwrite count elements, not bytes. A read that returns fewer elements than you asked for has hit the end or an error, and that short count is the only signal you get.',
      detail: 'Four ints from a ten-byte file: two complete ints fit, so fread returns 2 and two bytes are left over. Asking for bytes instead of elements is the usual way this is got wrong.',
      keyword: 'fread elements'
    },
    {
      id: 'e30', scene: 'formatted', start: 174, end: 180,
      caption: 'The count is the return value. The data is in the argument, which is why the check comes first.',
      narration: 'The data lands in the argument you passed by address, and the count comes back as the return value. So the check on the count has to happen before the data is used.',
      detail: 'A program that reads into an uninitialised buffer and then prints it regardless of the count prints whatever was there before, which is not a defined output.',
      keyword: 'check the count'
    },

    /* ---------------- scene 7: position ---------------- */
    {
      id: 'e31', scene: 'seek', start: 180, end: 186,
      caption: 'ftell reports the position as a long, counted from the start of the file.',
      narration: 'ftell reports the position as a long, counted from the beginning of the file. After five reads of one byte each, it reports five.',
      detail: 'The position is the offset of the next byte to be read or written. It is not a pointer into memory, and it is not the address of anything.',
      keyword: 'ftell'
    },
    {
      id: 'e32', scene: 'seek', start: 186, end: 192,
      caption: 'fseek takes an origin: the start, the current position, or the end.',
      narration: 'fseek moves the position, and it needs an origin: the start of the file, the current position, or the end of the file.',
      detail: 'SEEK_SET counts from the start, SEEK_CUR from where you are, SEEK_END from the end, so a negative offset from the end addresses bytes near the end. On an eleven-byte file, minus three from the end is position eight.',
      keyword: 'SEEK_SET SEEK_CUR SEEK_END'
    },
    {
      id: 'e33', scene: 'seek', start: 192, end: 198,
      caption: 'rewind is fseek to the start, and it also clears the error flag.',
      narration: 'rewind is a seek to the start, and it does one thing more: it clears the error indicator as well. fseek to the start does not.',
      detail: 'So a stream that hit an error and then needs to be read again is reset with rewind or clearerr, not with a bare fseek.',
      keyword: 'rewind'
    },
    {
      id: 'e34', scene: 'seek', start: 198, end: 204,
      caption: 'In a text stream only a zero or an ftell offset is portable; anything else is implementation-defined.',
      narration: 'In a text stream, only an offset of zero and an offset that ftell produced are portable. Any other offset is left to the implementation, because the library may be translating newlines as it goes.',
      detail: 'This is the assumption behind every "seek to the end and read backwards" question: it works on a binary stream, and on a text stream it needs an rb mode to be guaranteed.',
      keyword: 'text stream offsets',
      trap: 'fseek to an arbitrary offset on a text stream is implementation-defined; the same call on a stream opened with "rb" is defined.'
    },
    {
      id: 'e35', scene: 'seek', start: 204, end: 210,
      caption: 'fseek reports failure with a nonzero return; a successful seek clears the end flag.',
      narration: 'fseek reports failure by returning a nonzero value, and a successful seek clears the end-of-file flag, because the position is no longer at the end.',
      detail: 'So the flag from a previous end-of-file read does not poison the stream for ever: a successful fseek or rewind puts it back into a usable state.',
      keyword: 'fseek return'
    },

    /* ---------------- scene 8: append ---------------- */
    {
      id: 'e36', scene: 'append', start: 210, end: 216,
      caption: 'In append mode every write goes to the end, wherever the position is.',
      narration: 'In append mode every write goes to the end of the file, whatever the position happens to be.',
      detail: 'That is a property of the mode, not of the position. The position still moves, and ftell still reports it, but a write ignores it and lands at the end.',
      keyword: 'append rule'
    },
    {
      id: 'e37', scene: 'append', start: 216, end: 222,
      caption: 'Seek to zero, write one character, and the character lands after the old content.',
      narration: 'Seek to zero, write one character, and the character lands after the old content rather than over it.',
      detail: 'The canvas runs it: a file holding three bytes, seek to zero, write X. The result is four bytes with X last. The same three statements in r plus overwrite the first byte instead.',
      keyword: 'append versus r+'
    },
    {
      id: 'e38', scene: 'append', start: 222, end: 228,
      caption: 'a+ reads from the start and writes at the end. The two positions are not one number.',
      narration: 'With a plus, reading starts at the beginning and writing still goes to the end. The read position and the write position are not the same number.',
      detail: 'The C standard leaves the initial read position in a+ to the implementation; the common libraries put it at the start. A question that depends on this is a question about a library, not about the language.',
      keyword: 'a+'
    },
    {
      id: 'e39', scene: 'append', start: 228, end: 234,
      caption: 'Append never destroys the old content, and w never keeps it.',
      narration: 'Append never destroys what is there, and write mode never keeps it. Those two facts answer most of the mode questions on their own.',
      detail: 'The size column of the mode table is the whole difference: four bytes before the open, four after in a, zero after in w.',
      keyword: 'truncate versus append'
    },
    {
      id: 'e40', scene: 'append', start: 234, end: 240,
      caption: 'A log file is the reason the rule exists: two writers never overwrite each other.',
      narration: 'The rule exists for a reason. Two processes appending to one log file each write at the end, so neither overwrites the other.',
      detail: 'That guarantee is what append mode is for, and it is why the position is deliberately ignored rather than honoured.',
      keyword: 'why append exists'
    },

    /* ---------------- scene 9: update streams ---------------- */
    {
      id: 'e41', scene: 'update', start: 240, end: 246,
      caption: 'In an update stream a write must be flushed or followed by a seek before a read.',
      narration: 'In an update stream, a write has to be flushed or followed by a positioning call before the next read. A read has to be followed by a positioning call before the next write.',
      detail: 'The two directions share one buffer, so the library has to be told which way the stream is being used. fflush, fseek, fsetpos and rewind all count as the signal; a bare sequence of calls does not.',
      keyword: 'interleaving rule'
    },
    {
      id: 'e42', scene: 'update', start: 246, end: 252,
      caption: 'Skip the seek and the program is not defined. It is not "reads the old byte".',
      narration: 'Skip the seek and the program is not defined. It is not that the read returns the old byte, and it is not that it returns the new one; the standard simply does not say.',
      detail: 'So a question that shows read-then-write on an r plus stream with no positioning call in between has no answer to give, and that is the answer.',
      keyword: 'no positioning call',
      trap: 'Input then output on an update stream without fseek, fsetpos, rewind or fflush in between is undefined behaviour.'
    },
    {
      id: 'e43', scene: 'update', start: 252, end: 258,
      caption: 'Add the seek and the same program becomes defined, and its output is fixed.',
      narration: 'Add the positioning call and the same program becomes defined. The write now lands where the seek put the position.',
      detail: 'The canvas runs both versions: the illegal one is flagged, and the legal one writes the new byte over the first byte, which is what the position said.',
      keyword: 'the fix'
    },
    {
      id: 'e44', scene: 'update', start: 258, end: 264,
      caption: 'While the stream is buffered, written bytes are in the buffer and not on the disk.',
      narration: 'While the stream is buffered, the bytes you wrote are in the buffer and not on the disk. A count taken at that moment counts zero.',
      detail: 'fputs of five characters into a write stream leaves the file empty until fflush or fclose. That is the fact behind "the program crashed and the file is empty".',
      keyword: 'buffered writes'
    },
    {
      id: 'e45', scene: 'update', start: 264, end: 270,
      caption: 'fflush on an input stream is undefined in C, and a no-op on POSIX.',
      narration: 'Flushing an input stream is undefined in C. On POSIX it discards what has been read ahead, which is useful and not portable.',
      detail: 'So the portable rule is: fflush for output, a positioning call for input. Mixing the two is the source of the library-specific answers that a good question avoids.',
      keyword: 'fflush'
    },

    /* ---------------- scene 10: close ---------------- */
    {
      id: 'e46', scene: 'close', start: 270, end: 276,
      caption: 'fclose writes out the buffer, then releases the stream.',
      narration: 'fclose writes out whatever is still in the buffer, then releases the stream. Five buffered characters become five bytes on the disk.',
      detail: 'The flush happens first, so a failed close can still have written part of the data. That is why the return value is checked rather than assumed.',
      keyword: 'fclose'
    },
    {
      id: 'e47', scene: 'close', start: 276, end: 282,
      caption: 'It returns zero, or EOF when the flush failed. That return is the last report you get.',
      narration: 'It returns zero on success and EOF when something went wrong. That return value is the last report the library gives you about that file.',
      detail: 'A full disk is the usual reason. A program that ignores the return of fclose reports success for a write that never reached the disk.',
      keyword: 'fclose return'
    },
    {
      id: 'e48', scene: 'close', start: 282, end: 288,
      caption: 'Exiting normally closes every open stream; a crash does not.',
      narration: 'Returning from main, or calling exit, closes every open stream and flushes it. A crash or an abort does not.',
      detail: 'So the buffered data of a program that dies is lost, which is why a program that must not lose it flushes at the points that matter rather than trusting the exit path.',
      keyword: 'exit versus crash'
    },
    {
      id: 'e49', scene: 'close', start: 288, end: 294,
      caption: 'The five-step procedure: check the open, know the position, check the count, position between directions, check the close.',
      narration: 'Here is the procedure that answers any file question. Check the open. Know where the position is. Check the count the call returns. Position between the two directions. Check the close.',
      detail: 'Every question in the practice set on this page is one of those five steps, and the fourth step is the one that is usually missing from the code in the question.',
      keyword: 'procedure'
    },
    {
      id: 'e50', scene: 'close', start: 294, end: 300,
      caption: 'Nothing here is a remembered number: the file on the canvas is simulated byte by byte.',
      narration: 'Nothing on this page is a remembered number. The file is simulated byte by byte, every count is produced by running the calls, and each result is checked against a second route.',
      detail: 'That is what makes the char-versus-int counterexample and the duplicated line facts rather than folklore: both are run, and both are printed.',
      keyword: 'computed'
    }
  ]
};
