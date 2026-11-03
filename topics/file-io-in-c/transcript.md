# File I/O in C: the Stream, the Six Modes and the Return Value That Decides — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/file-io-in-c/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A stream, not a file

*0:00 – 0:30 · objective: See that FILE * is a handle to a stream — a position, a buffer and two flags — and that stdin, stdout and stderr are already open when main starts.*

**0:00–0:06** — A FILE pointer is a handle to a stream. It is not the file, and it does not hold the file.

> Caption: A FILE pointer is a handle to a stream, not the file itself.

**0:06–0:12** — Inside the record there are four things: a position, a buffer, an end flag and an error flag. Every function in this lesson changes one of those four.

> Caption: The record holds a position, a buffer, an end flag and an error flag.

**0:12–0:18** — Three streams are open before your first line runs: standard input, standard output and standard error. That is why printf needs no fopen.

> Caption: Three streams are already open when main starts: stdin, stdout, stderr.

**0:18–0:24** — Between your program and the disk there is a buffer. A write goes into the buffer first, and reaches the disk later, when the buffer fills or the stream is flushed or closed.

> Caption: The buffer sits between your program and the disk. The bytes are in one place or the other.

**0:24–0:30** — So every file question in the exam is really four questions. Did the open succeed? Where is the position? What does the call return? And did the close flush what was written?

> Caption: So a file question is really four questions: open, position, count, close.

## Scene 2. The six modes, and what each one does to what is already there

*0:30 – 1:00 · objective: Run every legal mode string against an existing file and a missing one, and read off four facts each time: does the open succeed, is the content destroyed, where is the position, and is reading or writing allowed.*

**0:30–0:36** — A mode string answers three questions at once: what you are allowed to do, where the position starts, and what happens to whatever is already in the file.

> Caption: A mode string says three things: what you may do, where you start, and what happens to the old content.

**0:36–0:42** — Take a file that already holds four bytes. In r the open succeeds and the position is zero. In w the open succeeds and the file is now empty. In a the open succeeds and the position is four.

> Caption: On an existing file of four bytes: r opens at 0, w empties it, a opens at the end.

**0:42–0:48** — Now the same six strings on a file that does not exist. The two read-first modes fail. The other four create the file, and the open succeeds.

> Caption: On a missing file: r and r+ fail; w, w+, a and a+ create it.

**0:48–0:54** — A plus sign adds the other direction of access. It does not change the existence rule: r plus still fails on a missing file, because the family is still r.

> Caption: The plus adds the other direction. It never rescues a file that does not exist.

**0:54–1:00** — The letter b selects binary mode. On a POSIX system it changes nothing at all. On Windows it stops the library translating a newline into two bytes, and it stops a byte of value twenty-six from being read as end of file.

> Caption: b changes nothing on a text stream question, and everything on Windows.

## Scene 3. fopen returns a pointer, and the pointer can be null

*1:00 – 1:30 · objective: Separate "the file is empty" from "the open failed", and see why using the result of a failed fopen is undefined behaviour rather than an empty file.*

**1:00–1:06** — When fopen cannot open the file it returns a null pointer. It does not return a stream that is empty, and it does not stop the program.

> Caption: fopen returns a null pointer when it cannot open. It does not return an empty stream.

**1:06–1:12** — Using the pointer anyway is undefined behaviour. In practice it is usually a crash, and sometimes it is not a crash, which is worse.

> Caption: Using that pointer is undefined behaviour: a crash, or worse, a quiet wrong answer.

**1:12–1:18** — The check is a single comparison, and it has to come before the first read, write or close. Here it is in the form the exam papers use.

> Caption: The check is one line, and it must come before the first use.

**1:18–1:24** — An empty file is a different case. The open succeeds, the position is zero, and the first read fails because the end has already been reached.

> Caption: An empty file is not a failed open: it opens, and the first read reports the end.

**1:24–1:30** — The reason for the failure lives in errno, and perror turns it into a sentence. The null pointer tells you that something failed, not what failed.

> Caption: perror reads the reason from errno; the return value alone does not say why.

## Scene 4. fgetc returns an int, and that is not a detail

*1:30 – 2:00 · objective: Read a file with a loop that ends on EOF, and watch the same loop stop after one byte when the result is stored in a char, because one legal byte equals EOF.*

**1:30–1:36** — fgetc returns the next byte, widened to an int, or the value EOF when there is no next byte.

> Caption: fgetc returns the next byte as an int, or EOF when there is no next byte.

**1:36–1:42** — That is exactly why the result belongs in an int. Every one of the two hundred and fifty-six byte values is legal data, so the failure signal had to be a value outside that range.

> Caption: That is why the result is stored in an int: all 256 byte values are legal, and EOF is not one of them.

**1:42–1:48** — Store it in a char and the two cases collapse. A byte of value two hundred and fifty-five, held in a signed char, is minus one, which is EOF, and the loop stops in the middle of the file.

> Caption: Store it in a char and a byte of value 255 becomes EOF. The loop stops early.

Exam-trap caption mode adds: *On a platform with signed char, a 0xFF byte in a char is indistinguishable from EOF. The C standard leaves plain char signed or unsigned, so this is implementation-defined.*

**1:48–1:54** — The correct loop reads into an int, and it stops when the read returns EOF. It does not ask feof whether the file has ended.

> Caption: The correct loop reads into an int and stops on EOF, never on feof.

**1:54–2:00** — feof answers a question about the last operation, not about the file. Testing it before a read asks about an operation that has not happened yet.

> Caption: feof answers a question about the last read, so testing it first asks too early.

## Scene 5. fgets reads a line, almost

*2:00 – 2:30 · objective: Count what fgets stores: at most n minus one characters, the newline kept if it fits, always a terminator. Then see the loop that prints the last line twice.*

**2:00–2:06** — fgets takes a size and reads at most one character fewer than that, because one slot must hold the terminating zero.

> Caption: fgets takes a size, reads at most one less than it, and always terminates.

**2:06–2:12** — It keeps the newline if the newline fits. So the string you get back ends with a newline and then a zero, which is not what you get from a word-by-word scanf.

> Caption: It keeps the newline, so a line ends in a newline and a zero, not a zero alone.

**2:12–2:18** — A buffer that is too short does not lose the rest of the line. It splits the line, and the next call carries on from where this one stopped.

> Caption: A short buffer splits a line, and the rest arrives on the next call.

**2:18–2:24** — It returns the buffer on success and a null pointer when there is nothing more to read or when a read fails.

> Caption: It returns the buffer, or a null pointer at the end or on an error.

**2:24–2:30** — Because the buffer is left alone when the call fails, a loop that tests feof and then prints the buffer prints the last line one extra time.

> Caption: The buffer is not cleared on failure, so the last line is printed twice.

Exam-trap caption mode adds: *while (!feof(fp)) { fgets(buf, n, fp); printf("%s", buf); } prints the final line twice. Test the return value of the read, not feof.*

## Scene 6. Return values that count

*2:30 – 3:00 · objective: Read the return of fprintf, fscanf, fread and fwrite as a count, and use a short count as the only reliable error signal on input.*

**2:30–2:36** — fprintf returns a count of characters written, and a negative value when the write failed. The count is the one you can check.

> Caption: fprintf returns the number of characters written, or a negative value on failure.

**2:36–2:42** — Writing the numbers one to ten, each followed by a newline, writes twenty-one bytes: nine single digits, two digits for ten, and ten newlines.

> Caption: A loop writing one number and a newline for one to ten writes twenty-one bytes.

**2:42–2:48** — fscanf returns the number of items it managed to assign. If it assigned fewer than you asked for, the input did not match.

> Caption: fscanf returns how many items it assigned. A short count is the failure.

**2:48–2:54** — fread and fwrite count elements, not bytes. A read that returns fewer elements than you asked for has hit the end or an error, and that short count is the only signal you get.

> Caption: fread and fwrite count elements, not bytes. Read the short count as an error.

**2:54–3:00** — The data lands in the argument you passed by address, and the count comes back as the return value. So the check on the count has to happen before the data is used.

> Caption: The count is the return value. The data is in the argument, which is why the check comes first.

## Scene 7. Position: ftell, fseek, rewind

*3:00 – 3:30 · objective: Track the file position as a number, move it with the three origins, and know which offsets the standard leaves to the implementation in a text stream.*

**3:00–3:06** — ftell reports the position as a long, counted from the beginning of the file. After five reads of one byte each, it reports five.

> Caption: ftell reports the position as a long, counted from the start of the file.

**3:06–3:12** — fseek moves the position, and it needs an origin: the start of the file, the current position, or the end of the file.

> Caption: fseek takes an origin: the start, the current position, or the end.

**3:12–3:18** — rewind is a seek to the start, and it does one thing more: it clears the error indicator as well. fseek to the start does not.

> Caption: rewind is fseek to the start, and it also clears the error flag.

**3:18–3:24** — In a text stream, only an offset of zero and an offset that ftell produced are portable. Any other offset is left to the implementation, because the library may be translating newlines as it goes.

> Caption: In a text stream only a zero or an ftell offset is portable; anything else is implementation-defined.

Exam-trap caption mode adds: *fseek to an arbitrary offset on a text stream is implementation-defined; the same call on a stream opened with "rb" is defined.*

**3:24–3:30** — fseek reports failure by returning a nonzero value, and a successful seek clears the end-of-file flag, because the position is no longer at the end.

> Caption: fseek reports failure with a nonzero return; a successful seek clears the end flag.

## Scene 8. Append mode ignores the position

*3:30 – 4:00 · objective: See that in "a" the position moves but every write lands at the end anyway, and contrast it with the identical operations in "r+".*

**3:30–3:36** — In append mode every write goes to the end of the file, whatever the position happens to be.

> Caption: In append mode every write goes to the end, wherever the position is.

**3:36–3:42** — Seek to zero, write one character, and the character lands after the old content rather than over it.

> Caption: Seek to zero, write one character, and the character lands after the old content.

**3:42–3:48** — With a plus, reading starts at the beginning and writing still goes to the end. The read position and the write position are not the same number.

> Caption: a+ reads from the start and writes at the end. The two positions are not one number.

**3:48–3:54** — Append never destroys what is there, and write mode never keeps it. Those two facts answer most of the mode questions on their own.

> Caption: Append never destroys the old content, and w never keeps it.

**3:54–4:00** — The rule exists for a reason. Two processes appending to one log file each write at the end, so neither overwrites the other.

> Caption: A log file is the reason the rule exists: two writers never overwrite each other.

## Scene 9. Update streams: the interleaving rule

*4:00 – 4:30 · objective: Read the rule that a write must be followed by fflush or a positioning call before a read, see what the rule costs when it is skipped, and see where the bytes actually sit while the stream is buffered.*

**4:00–4:06** — In an update stream, a write has to be flushed or followed by a positioning call before the next read. A read has to be followed by a positioning call before the next write.

> Caption: In an update stream a write must be flushed or followed by a seek before a read.

**4:06–4:12** — Skip the seek and the program is not defined. It is not that the read returns the old byte, and it is not that it returns the new one; the standard simply does not say.

> Caption: Skip the seek and the program is not defined. It is not "reads the old byte".

Exam-trap caption mode adds: *Input then output on an update stream without fseek, fsetpos, rewind or fflush in between is undefined behaviour.*

**4:12–4:18** — Add the positioning call and the same program becomes defined. The write now lands where the seek put the position.

> Caption: Add the seek and the same program becomes defined, and its output is fixed.

**4:18–4:24** — While the stream is buffered, the bytes you wrote are in the buffer and not on the disk. A count taken at that moment counts zero.

> Caption: While the stream is buffered, written bytes are in the buffer and not on the disk.

**4:24–4:30** — Flushing an input stream is undefined in C. On POSIX it discards what has been read ahead, which is useful and not portable.

> Caption: fflush on an input stream is undefined in C, and a no-op on POSIX.

## Scene 10. fclose flushes, and its return value is the last chance

*4:30 – 5:00 · objective: Close the loop: buffered bytes reach the disk on fclose, fclose reports failure with EOF, and the five-step procedure that answers any file-I/O question.*

**4:30–4:36** — fclose writes out whatever is still in the buffer, then releases the stream. Five buffered characters become five bytes on the disk.

> Caption: fclose writes out the buffer, then releases the stream.

**4:36–4:42** — It returns zero on success and EOF when something went wrong. That return value is the last report the library gives you about that file.

> Caption: It returns zero, or EOF when the flush failed. That return is the last report you get.

**4:42–4:48** — Returning from main, or calling exit, closes every open stream and flushes it. A crash or an abort does not.

> Caption: Exiting normally closes every open stream; a crash does not.

**4:48–4:54** — Here is the procedure that answers any file question. Check the open. Know where the position is. Check the count the call returns. Position between the two directions. Check the close.

> Caption: The five-step procedure: check the open, know the position, check the count, position between directions, check the close.

**4:54–5:00** — Nothing on this page is a remembered number. The file is simulated byte by byte, every count is produced by running the calls, and each result is checked against a second route.

> Caption: Nothing here is a remembered number: the file on the canvas is simulated byte by byte.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
