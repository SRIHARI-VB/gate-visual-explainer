# Runtime environments: activation records, the two links, displays and parameter modes — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/runtime-environments-and-activation-records/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One activation, one record

*0:00 – 0:30 · objective: See what a single activation record contains, in the order the fields are laid out, and watch the byte offsets and the aligned total size come out of that layout.*

**0:00–0:07** — One call, one frame, and the frame dies when the call returns.

> Caption: One call, one frame. Every activation gets its own record.

Exam-trap caption mode adds: *A frame belongs to a call, not to a procedure. One procedure can have many frames alive at once.*

**0:07–0:15** — Bookkeeping first: returned value, return address, control link, access link.

> Caption: Four words of bookkeeping come first: return value, return address, the two links.

Exam-trap caption mode adds: *The two links are separate fields with separate jobs. Merging them is the single most common error in this topic.*

**0:15–0:22** — Parameters, locals, temporaries: fixed offsets from the frame pointer.

> Caption: Then parameters, locals and temporaries, at fixed offsets from the frame pointer.

Exam-trap caption mode adds: *Offsets are fixed per procedure, not per call. That is what makes one frame pointer enough.*

**0:22–0:30** — Twenty used, rounded up to twenty-four, with four bytes of padding.

> Caption: Sixteen bytes of bookkeeping plus the data, rounded up to the alignment: 24 bytes.

Exam-trap caption mode adds: *Alignment padding is part of the frame. A frame-size question that ignores it gets the wrong depth limit.*

## Scene 2. The stack discipline of calls

*0:30 – 1:00 · objective: Watch four frames be pushed in call order and popped in reverse, and read the deepest occupancy and the stack bytes from the picture.*

**0:30–0:37** — Main, then P, then R, then Q. Four frames, bottom to top.

> Caption: Main calls P, P calls R, R calls Q: four frames in that order.

Exam-trap caption mode adds: *The order on the stack follows the calls. It is not the order the procedures appear in the source file.*

**0:37–0:45** — Stack pointer for the top, frame pointer for the current frame.

> Caption: The stack pointer marks the top; the frame pointer marks the current frame.

**0:45–0:52** — Q returns, then R, then P. Strictly last in, first out.

> Caption: Returns pop in the reverse order: Q, then R, then P.

Exam-trap caption mode adds: *A frame cannot be freed while a call it started is still running. Long-lived data therefore does not belong on the stack.*

**0:52–1:00** — Four frames, ninety-six bytes. The peak, not the total.

> Caption: Deepest occupancy is four frames, 96 bytes here. That is the number asked for.

Exam-trap caption mode adds: *Calls that have already returned do not count. Only the peak occupancy matters.*

## Scene 3. Recursion is the same rule

*1:00 – 1:30 · objective: Count the frames alive during fact(4), see that each frame owns its own copy of n, and get the frame count from the base case rather than from memory.*

**1:00–1:07** — fact of 4 pushes four fact frames, one per level.

> Caption: Recursion obeys the same rule: fact(4) pushes four fact frames.

**1:07–1:15** — Every frame has its own n, at the same offset, in different memory.

> Caption: Each frame holds its own n. The n in one frame is not the n in another.

Exam-trap caption mode adds: *A recursive function that seems to lose its argument is usually reading a static or global variable, not a local.*

**1:15–1:22** — Base case first, then the products on the way back: 1, 2, 6, 24.

> Caption: Nothing is multiplied until the base case returns: 1, 1, 2, 6, 24.

**1:22–1:30** — Five frames alive, and the base case decides whether it is n or n plus one.

> Caption: With the caller, five frames are alive. Base case n at most 1 gives n frames; base case 0 gives n plus 1.

Exam-trap caption mode adds: *Two answers are defensible for the same code if the base case is not fixed. Read the base case from the question.*

## Scene 4. Control link against access link

*1:30 – 2:00 · objective: Put a procedure whose caller and whose enclosing definition differ in front of the two links, and see each pointer choose the right frame.*

**1:30–1:37** — Written inside P, called from R. Two frames, two jobs.

> Caption: Q is written inside P but called from R. Two questions, two answers.

**1:37–1:45** — Control link to R: it answers who called me.

> Caption: The control link points to R, the caller. It traces execution.

Exam-trap caption mode adds: *The control link is for returning, not for reading variables. It answers a question about execution, not about the text.*

**1:45–1:52** — Access link to P: it answers where I was written.

> Caption: The access link points to P, the enclosing definition. It traces the text.

Exam-trap caption mode adds: *The access link is not the caller. Under static scoping it must not be, or every non-local read goes to the wrong frame.*

**1:52–2:00** — Swap the two and the scoping rule silently changes.

> Caption: Swap them and every non-local read lands in the wrong frame.

Exam-trap caption mode adds: *Dynamic scoping is exactly the rule you get if you look names up along the control links instead of the access links.*

## Scene 5. Finding a non-local name

*2:00 – 2:30 · objective: Resolve a level-and-offset pair by walking access links, and count the dereferences for a local, a one-level name and a two-level name.*

**2:00–2:07** — Level and offset. The level is a number of hops.

> Caption: A non-local name is a level and an offset. The level says how many links to follow.

**2:07–2:15** — b is local, so zero hops.

> Caption: b is local to Q: zero hops, straight from the frame pointer.

**2:15–2:22** — a is one level out, so one hop into P.

> Caption: a is declared one level out: one access link, into the frame of P.

Exam-trap caption mode adds: *The number of hops is the difference in lexical levels, never the number of frames on the stack.*

**2:22–2:30** — Two hops for g, and seven hops over six references.

> Caption: g is two levels out: two links, into Main. Seven hops over the six references here.

## Scene 6. The display array

*2:30 – 3:00 · objective: Replace the walk with an array indexed by nesting level, see the entry that must be saved and restored, and compare the two access costs honestly.*

**2:30–2:37** — One array, indexed by level, instead of a walk.

> Caption: A display replaces the walk with an array indexed by nesting level.

**2:37–2:45** — Level two now points at Q, and R is no longer in the display.

> Caption: During Q, entry 0 is Main, entry 1 is P, entry 2 is Q. R lost its slot.

Exam-trap caption mode adds: *A display holds one frame per level, not one frame per call. That is why the old entry must be saved.*

**2:45–2:52** — Save the old slot in the frame, restore it on return.

> Caption: So the old entry is saved in the frame and restored on return.

**2:52–3:00** — One index always, or a chain that grows with nesting.

> Caption: One index for any non-local, against a chain that grows with nesting.

Exam-trap caption mode adds: *Neither method is faster in general. The answer depends on nesting depth and on how often non-local names are read.*

## Scene 7. Where the parameter modes differ

*3:00 – 3:30 · objective: Put value, reference, value-result and name into the same parameter slot and let one program separate them: 11, 12, 6, 12.*

**3:00–3:07** — Value: a copy lives in the frame, and the copy dies with it.

> Caption: The parameter slot is where the modes differ. Value copies the argument in.

Exam-trap caption mode adds: *A pointer parameter is still passed by value. What it lets you change is the object pointed at, not the pointer.*

**3:07–3:15** — Reference is an alias; value-result is a copy in and a copy out.

> Caption: Reference stores the caller address. Value-result copies in and copies back.

Exam-trap caption mode adds: *Value-result is not reference. The copy-back can overwrite a change the body made through the actual name.*

**3:15–3:22** — Name re-evaluates the argument every time the name is used.

> Caption: Name passes an expression, re-evaluated at every use.

**3:22–3:30** — Eleven, twelve, six, twelve. Value-result is the odd one out.

> Caption: One program, four answers: 11, 12, 6, 12.

Exam-trap caption mode adds: *Name and reference agree here. Do not conclude they are the same mode; the next scene separates them.*

## Scene 8. Name against reference on an array index

*3:30 – 4:00 · objective: Watch reference capture A[1] and name re-evaluate A[i], and see value-result agree with reference on one program and disagree on another.*

**3:30–3:37** — At the call, A of 1 is the target, and i is one.

> Caption: The call is p of A of i, with i equal to 1.

**3:37–3:45** — Reference writes through the saved address: A of 1 becomes ten.

> Caption: Inside, i becomes 2. Under reference the write still lands in A of 1.

Exam-trap caption mode adds: *A reference parameter is bound once, at the call. Changing the index afterwards does not re-target it.*

**3:45–3:52** — Name evaluates A of i now, so the write goes to A of 2.

> Caption: Under name the argument is A of i, re-evaluated: the write lands in A of 2.

Exam-trap caption mode adds: *This is the standard separator between name and reference, and the only reliable way to answer it is to trace each use.*

**3:52–4:00** — Agreement on one program proves nothing. Trace the modes.

> Caption: Value-result agrees with reference here, and disagrees on the scalar program.

Exam-trap caption mode adds: *Memorising one example of value-result versus reference is not enough. The difference shows only when the body touches the actual variable directly.*

## Scene 9. Offsets, alignment and stack depth

*4:00 – 4:30 · objective: Compute the offsets and the padded frame size, then turn frame size into a depth limit: 87381 frames of 96 bytes fit in 8 MiB.*

**4:00–4:07** — Zero, four, eight, twelve, then the data at sixteen.

> Caption: Offsets are computed, not chosen: 0, 4, 8, 12, then the data at 16.

**4:07–4:15** — Twenty used, twenty-four allocated, four bytes of padding.

> Caption: Round the total up to the alignment: 20 becomes 24, and the padding belongs to nothing.

Exam-trap caption mode adds: *Counting only the variables understates the frame and overstates the depth limit.*

**4:15–4:22** — Eight MiB over ninety-six bytes is 87381 frames.

> Caption: Frame size times depth is stack use: 96 bytes per frame gives 87381 frames in 8 MiB.

Exam-trap caption mode adds: *Round down, not to nearest. A part-frame is a stack overflow.*

**4:22–4:30** — Thirty-two bytes left over, and the next frame needs sixty-four too many.

> Caption: 87381 frames use 8388576 bytes; the next one would need 8388672 and does not fit.

## Scene 10. The decision procedure

*4:30 – 5:00 · objective: Reduce every runtime-environment question to five steps, name the three shapes the exam asks, and state the two checks that remove most wrong options.*

**4:30–4:37** — Declaration, level difference, that many links, then the offset.

> Caption: Five steps: find the declaration, take the level difference, follow that many links, add the offset.

**4:37–4:45** — Output, resolution, and frame count. Three shapes, one procedure.

> Caption: Three shapes are asked: output under a scoping rule, the frame a name resolves to, and the live frame count.

Exam-trap caption mode adds: *A question may state the scoping rule and the parameter mode separately. Apply each where it belongs.*

**4:45–4:52** — Static scope never consults the caller.

> Caption: A scoping answer that used the caller under static scope is wrong at once.

Exam-trap caption mode adds: *The distractor is usually the dynamic-scoping answer offered under a static-scoping question, or the reverse.*

**4:52–5:00** — Only calls that have not returned are on the stack.

> Caption: A frame count that includes returned calls is wrong: only live calls occupy the stack.

Exam-trap caption mode adds: *The peak of the stack is a property of one moment, not of the whole execution.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
