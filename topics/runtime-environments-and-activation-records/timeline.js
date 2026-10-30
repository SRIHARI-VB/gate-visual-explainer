/* ==========================================================================
   runtime-environments-and-activation-records — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas: the 24-byte frame whose fields sit at offsets 0, 4, 8,
   12 and 16 with four bytes of alignment padding; the four-frame chain
   Main -> P -> R -> Q using 96 bytes; fact(4) with four fact frames alive and
   five including the caller; the access-link chain of Q whose control link is R
   and whose access link is P; the hop counts 0, 1 and 2 and their total 7 over
   six references, average 1.166667; the display d[0]=Main, d[1]=P, d[2]=Q while
   Q runs; the four parameter modes printing 11, 12, 6 and 12 on one program and
   writing A[1], A[1], A[1] and A[2] on the array program; and 87381 frames of
   96 bytes in an 8 MiB stack, using 8388576 bytes.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'frame', n: 1,
      title: 'One activation, one record',
      start: 0, end: 30,
      objective: 'See what a single activation record contains, in the order the fields are laid out, and watch the byte offsets and the aligned total size come out of that layout.'
    },
    {
      id: 'pushpop', n: 2,
      title: 'The stack discipline of calls',
      start: 30, end: 60,
      objective: 'Watch four frames be pushed in call order and popped in reverse, and read the deepest occupancy and the stack bytes from the picture.'
    },
    {
      id: 'recursion', n: 3,
      title: 'Recursion is the same rule',
      start: 60, end: 90,
      objective: 'Count the frames alive during fact(4), see that each frame owns its own copy of n, and get the frame count from the base case rather than from memory.'
    },
    {
      id: 'links', n: 4,
      title: 'Control link against access link',
      start: 90, end: 120,
      objective: 'Put a procedure whose caller and whose enclosing definition differ in front of the two links, and see each pointer choose the right frame.'
    },
    {
      id: 'access', n: 5,
      title: 'Finding a non-local name',
      start: 120, end: 150,
      objective: 'Resolve a level-and-offset pair by walking access links, and count the dereferences for a local, a one-level name and a two-level name.'
    },
    {
      id: 'display', n: 6,
      title: 'The display array',
      start: 150, end: 180,
      objective: 'Replace the walk with an array indexed by nesting level, see the entry that must be saved and restored, and compare the two access costs honestly.'
    },
    {
      id: 'params', n: 7,
      title: 'Where the parameter modes differ',
      start: 180, end: 210,
      objective: 'Put value, reference, value-result and name into the same parameter slot and let one program separate them: 11, 12, 6, 12.'
    },
    {
      id: 'name', n: 8,
      title: 'Name against reference on an array index',
      start: 210, end: 240,
      objective: 'Watch reference capture A[1] and name re-evaluate A[i], and see value-result agree with reference on one program and disagree on another.'
    },
    {
      id: 'layout', n: 9,
      title: 'Offsets, alignment and stack depth',
      start: 240, end: 270,
      objective: 'Compute the offsets and the padded frame size, then turn frame size into a depth limit: 87381 frames of 96 bytes fit in 8 MiB.'
    },
    {
      id: 'exam', n: 10,
      title: 'The decision procedure',
      start: 270, end: 300,
      objective: 'Reduce every runtime-environment question to five steps, name the three shapes the exam asks, and state the two checks that remove most wrong options.'
    }
  ],

  events: [
    /* ---------- scene 1: frame ---------- */
    {
      id: 's1a', start: 0, end: 7.5, scene: 'frame',
      caption: 'One call, one frame. Every activation gets its own record.',
      detail: 'A procedure that is running is called an activation, and every activation owns a block of storage called an activation record, or frame. The frame is created when the call is made and destroyed when the call returns, which is exactly why two calls to the same procedure can hold different values in the same variable name.',
      narration: 'One call, one frame, and the frame dies when the call returns.',
      keyword: 'one frame',
      trap: 'A frame belongs to a call, not to a procedure. One procedure can have many frames alive at once.'
    },
    {
      id: 's1b', start: 7.5, end: 15, scene: 'frame',
      caption: 'Four words of bookkeeping come first: return value, return address, the two links.',
      detail: 'The first fields are not data the programmer wrote. They are what the machine needs in order to come back: space for the returned value, the return address to jump to, the control link to the caller, and the access link to the enclosing definition. Sixteen bytes here, at offsets 0, 4, 8 and 12.',
      narration: 'Bookkeeping first: returned value, return address, control link, access link.',
      keyword: 'bookkeeping',
      trap: 'The two links are separate fields with separate jobs. Merging them is the single most common error in this topic.'
    },
    {
      id: 's1c', start: 15, end: 22.5, scene: 'frame',
      caption: 'Then parameters, locals and temporaries, at fixed offsets from the frame pointer.',
      detail: 'After the bookkeeping come the actual parameters, the local variables and the temporaries the compiler needed for expression evaluation. Their offsets are fixed by the compiler, so the same procedure always uses the same layout and one frame pointer plus an offset reaches any of them.',
      narration: 'Parameters, locals, temporaries: fixed offsets from the frame pointer.',
      keyword: 'fixed offsets',
      trap: 'Offsets are fixed per procedure, not per call. That is what makes one frame pointer enough.'
    },
    {
      id: 's1d', start: 22.5, end: 30, scene: 'frame',
      caption: 'Sixteen bytes of bookkeeping plus the data, rounded up to the alignment: 24 bytes.',
      detail: 'Procedure Q has no parameters, one local and one temporary, so its data is eight bytes and its used total is twenty-four. Procedure Main uses twenty and is rounded up to twenty-four, and the four bytes of padding belong to no variable at all. The frame size is therefore a computed number, not a chosen one.',
      narration: 'Twenty used, rounded up to twenty-four, with four bytes of padding.',
      keyword: '24 bytes',
      trap: 'Alignment padding is part of the frame. A frame-size question that ignores it gets the wrong depth limit.'
    },

    /* ---------- scene 2: pushpop ---------- */
    {
      id: 's2a', start: 30, end: 37.5, scene: 'pushpop',
      caption: 'Main calls P, P calls R, R calls Q: four frames in that order.',
      detail: 'The frames are pushed in the order the calls happen, so the stack from the bottom up reads Main, P, R, Q. The bottom frame is the outermost call and the top frame is the one executing now. The call chain, not the program text, decides this order.',
      narration: 'Main, then P, then R, then Q. Four frames, bottom to top.',
      keyword: 'four frames',
      trap: 'The order on the stack follows the calls. It is not the order the procedures appear in the source file.'
    },
    {
      id: 's2b', start: 37.5, end: 45, scene: 'pushpop',
      caption: 'The stack pointer marks the top; the frame pointer marks the current frame.',
      detail: 'Two registers keep the stack under control. The stack pointer holds the address of the next free slot, and the frame pointer holds the base of the frame that is running, so that every local can be reached as frame pointer plus offset. The frame pointer is what the control link saves.',
      narration: 'Stack pointer for the top, frame pointer for the current frame.',
      keyword: 'frame pointer'
    },
    {
      id: 's2c', start: 45, end: 52.5, scene: 'pushpop',
      caption: 'Returns pop in the reverse order: Q, then R, then P.',
      detail: 'A return frees the frame at the top of the stack, so frames leave in the reverse of the order they arrived. This is the whole reason a stack is the right structure: the most recent call is always the one that finishes first. Nothing in the middle can be freed early without breaking the calls above it.',
      narration: 'Q returns, then R, then P. Strictly last in, first out.',
      keyword: 'reverse order',
      trap: 'A frame cannot be freed while a call it started is still running. Long-lived data therefore does not belong on the stack.'
    },
    {
      id: 's2d', start: 52.5, end: 60, scene: 'pushpop',
      caption: 'Deepest occupancy is four frames, 96 bytes here. That is the number asked for.',
      detail: 'At the moment Q runs, four frames of twenty-four bytes are live, which is ninety-six bytes of stack. A question that asks for the maximum stack usage wants this peak, counted at the deepest point of the call chain, and not the total number of calls made during the whole run.',
      narration: 'Four frames, ninety-six bytes. The peak, not the total.',
      keyword: '96 bytes',
      trap: 'Calls that have already returned do not count. Only the peak occupancy matters.'
    },

    /* ---------- scene 3: recursion ---------- */
    {
      id: 's3a', start: 60, end: 67.5, scene: 'recursion',
      caption: 'Recursion obeys the same rule: fact(4) pushes four fact frames.',
      detail: 'A recursive call is an ordinary call, so fact(4) pushes a frame for n equal to 4, then 3, then 2, then 1. Four frames of the same procedure sit on the stack at once, each with the same layout and a different value in the same slot.',
      narration: 'fact of 4 pushes four fact frames, one per level.',
      keyword: 'four fact frames'
    },
    {
      id: 's3b', start: 67.5, end: 75, scene: 'recursion',
      caption: 'Each frame holds its own n. The n in one frame is not the n in another.',
      detail: 'This is the point that separates a frame from a variable. The name n denotes a different slot in each frame, and the offset is identical in all of them, so the frame pointer is the only thing that tells them apart. Overwriting n in one frame leaves every other frame untouched.',
      narration: 'Every frame has its own n, at the same offset, in different memory.',
      keyword: 'its own n',
      trap: 'A recursive function that seems to lose its argument is usually reading a static or global variable, not a local.'
    },
    {
      id: 's3c', start: 75, end: 82.5, scene: 'recursion',
      caption: 'Nothing is multiplied until the base case returns: 1, 1, 2, 6, 24.',
      detail: 'The multiplications are pending in the frames, waiting for the value below them. The base case returns 1, then each frame multiplies its own n by the value it received on the way back up: 1 times 2, then 2 times 3, then 6 times 4, which is 24. The order of multiplication is the reverse of the order of the calls.',
      narration: 'Base case first, then the products on the way back: 1, 2, 6, 24.',
      keyword: 'on the way back'
    },
    {
      id: 's3d', start: 82.5, end: 90, scene: 'recursion',
      caption: 'With the caller, five frames are alive. Base case n at most 1 gives n frames; base case 0 gives n plus 1.',
      detail: 'Four fact frames plus the frame of whoever called fact makes five alive at the deepest point. The count depends on where the recursion stops: stopping at n equal to 1 with argument n gives n frames, and stopping at n equal to 0 gives n plus 1. State the base case before stating the count.',
      narration: 'Five frames alive, and the base case decides whether it is n or n plus one.',
      keyword: 'five frames',
      trap: 'Two answers are defensible for the same code if the base case is not fixed. Read the base case from the question.'
    },

    /* ---------- scene 4: links ---------- */
    {
      id: 's4a', start: 90, end: 97.5, scene: 'links',
      caption: 'Q is written inside P but called from R. Two questions, two answers.',
      detail: 'P declares Q and R. P calls R, and R calls Q. So Q was written inside P, which makes P its enclosing definition, while Q was called from R, which makes R its caller. Those are two different frames, and one pointer cannot serve both jobs.',
      narration: 'Written inside P, called from R. Two frames, two jobs.',
      keyword: 'written inside P'
    },
    {
      id: 's4b', start: 97.5, end: 105, scene: 'links',
      caption: 'The control link points to R, the caller. It traces execution.',
      detail: 'The control link, also called the dynamic link, points to the frame of the procedure that made this call, and it is the saved frame pointer of that frame. Following control links from any frame walks the call chain back to the start of the program, which is what a return needs.',
      narration: 'Control link to R: it answers who called me.',
      keyword: 'who called me',
      trap: 'The control link is for returning, not for reading variables. It answers a question about execution, not about the text.'
    },
    {
      id: 's4c', start: 105, end: 112.5, scene: 'links',
      caption: 'The access link points to P, the enclosing definition. It traces the text.',
      detail: 'The access link, also called the static link, points to the frame of the procedure that lexically encloses the current one, so it points to the most recent activation of P. Following access links from any frame walks the nesting of the source program, which is what a non-local read needs.',
      narration: 'Access link to P: it answers where I was written.',
      keyword: 'where I was written',
      trap: 'The access link is not the caller. Under static scoping it must not be, or every non-local read goes to the wrong frame.'
    },
    {
      id: 's4d', start: 112.5, end: 120, scene: 'links',
      caption: 'Swap them and every non-local read lands in the wrong frame.',
      detail: 'If the access link were set to the caller, then a name that should resolve in P would resolve in R, and R has no such variable, so the read would either fail or silently take a different declaration. That is precisely the difference between static and dynamic scoping, and it is what a one-mark question tests.',
      narration: 'Swap the two and the scoping rule silently changes.',
      keyword: 'the wrong frame',
      trap: 'Dynamic scoping is exactly the rule you get if you look names up along the control links instead of the access links.'
    },

    /* ---------- scene 5: access ---------- */
    {
      id: 's5a', start: 120, end: 127.5, scene: 'access',
      caption: 'A non-local name is a level and an offset. The level says how many links to follow.',
      detail: 'The compiler resolves each name to a pair: the nesting level of the declaration and the offset inside that level frame. At run time the level becomes a count of access links to follow and the offset becomes the final addition. Both parts are fixed at compile time, so the cost is known before the program runs.',
      narration: 'Level and offset. The level is a number of hops.',
      keyword: 'level and offset'
    },
    {
      id: 's5b', start: 127.5, end: 135, scene: 'access',
      caption: 'b is local to Q: zero hops, straight from the frame pointer.',
      detail: 'When the declaration level equals the current level, no link is followed at all. The frame pointer already points at the right frame, so the access is frame pointer plus offset, one addition. Locals are the cheapest case and the most common one.',
      narration: 'b is local, so zero hops.',
      keyword: 'zero hops'
    },
    {
      id: 's5c', start: 135, end: 142.5, scene: 'access',
      caption: 'a is declared one level out: one access link, into the frame of P.',
      detail: 'Q sits at level two and a is declared at level one, so the difference is one and the code follows exactly one access link. That lands in the frame of P, and then the offset of a is added. The count is the difference in levels, not the depth of the stack.',
      narration: 'a is one level out, so one hop into P.',
      keyword: 'one hop',
      trap: 'The number of hops is the difference in lexical levels, never the number of frames on the stack.'
    },
    {
      id: 's5d', start: 142.5, end: 150, scene: 'access',
      caption: 'g is two levels out: two links, into Main. Seven hops over the six references here.',
      detail: 'A global is declared at level zero, so from level two it costs two links. Adding the six references used in this program gives seven hops in total, an average of one point one six six six six seven. A display is the standard answer when that average is too expensive.',
      narration: 'Two hops for g, and seven hops over six references.',
      keyword: 'seven hops'
    },

    /* ---------- scene 6: display ---------- */
    {
      id: 's6a', start: 150, end: 157.5, scene: 'display',
      caption: 'A display replaces the walk with an array indexed by nesting level.',
      detail: 'A display is an array whose i-th entry points to the frame of the most recent activation at nesting level i. A non-local access becomes one array index plus the offset, so the cost no longer depends on how deep the declaration is. The number of entries is fixed by the nesting depth of the program.',
      narration: 'One array, indexed by level, instead of a walk.',
      keyword: 'display'
    },
    {
      id: 's6b', start: 157.5, end: 165, scene: 'display',
      caption: 'During Q, entry 0 is Main, entry 1 is P, entry 2 is Q. R lost its slot.',
      detail: 'R and Q are both at level two, so when R calls Q the level-two entry is overwritten with Q frame. While Q runs the display reads Main, P, Q. The frame of R is still on the stack, but the display no longer points at it, because only the most recent activation at each level is reachable through the display.',
      narration: 'Level two now points at Q, and R is no longer in the display.',
      keyword: 'overwritten',
      trap: 'A display holds one frame per level, not one frame per call. That is why the old entry must be saved.'
    },
    {
      id: 's6c', start: 165, end: 172.5, scene: 'display',
      caption: 'So the old entry is saved in the frame and restored on return.',
      detail: 'The value that was in the level-two slot is stored inside Q frame, and when Q returns it is written back. That save and restore is the cost of the array, paid on every call rather than on every access. Static links pay on every access instead.',
      narration: 'Save the old slot in the frame, restore it on return.',
      keyword: 'save and restore'
    },
    {
      id: 's6d', start: 172.5, end: 180, scene: 'display',
      caption: 'One index for any non-local, against a chain that grows with nesting.',
      detail: 'The trade is honest rather than one-sided. A display makes every non-local access cost one index, at the price of a register or a slot per nesting level and the save and restore on each call. Static links cost nothing per call and up to the nesting difference per access. Shallow nesting with many non-local reads favours the display.',
      narration: 'One index always, or a chain that grows with nesting.',
      keyword: 'the trade',
      trap: 'Neither method is faster in general. The answer depends on nesting depth and on how often non-local names are read.'
    },

    /* ---------- scene 7: params ---------- */
    {
      id: 's7a', start: 180, end: 187.5, scene: 'params',
      caption: 'The parameter slot is where the modes differ. Value copies the argument in.',
      detail: 'Call by value evaluates the argument and stores a copy in the callee frame. The callee can change that copy freely and the caller never sees it. In C every ordinary parameter works this way, which is why a function cannot change its caller variable without an address.',
      narration: 'Value: a copy lives in the frame, and the copy dies with it.',
      keyword: 'value',
      trap: 'A pointer parameter is still passed by value. What it lets you change is the object pointed at, not the pointer.'
    },
    {
      id: 's7b', start: 187.5, end: 195, scene: 'params',
      caption: 'Reference stores the caller address. Value-result copies in and copies back.',
      detail: 'Call by reference stores the address of the actual argument in the parameter slot, so the formal name is an alias for the caller storage and every write is immediate. Call by value-result uses an ordinary local copy and copies the final value back into the caller location at return, which is a different thing whenever the body also touches that location directly.',
      narration: 'Reference is an alias; value-result is a copy in and a copy out.',
      keyword: 'alias',
      trap: 'Value-result is not reference. The copy-back can overwrite a change the body made through the actual name.'
    },
    {
      id: 's7c', start: 195, end: 202.5, scene: 'params',
      caption: 'Name passes an expression, re-evaluated at every use.',
      detail: 'Call by name passes the argument expression together with the environment it was written in, and the expression is evaluated again each time the formal is read or written. It is the mode that produces different answers on two consecutive uses of the same name inside one body, which is why exam questions like it.',
      narration: 'Name re-evaluates the argument every time the name is used.',
      keyword: 're-evaluated'
    },
    {
      id: 's7d', start: 202.5, end: 210, scene: 'params',
      caption: 'One program, four answers: 11, 12, 6, 12.',
      detail: 'With a global a equal to 5 and a body that does x equals x plus 1 and then a equals a plus x, the four modes print 11, 12, 6 and 12 in the order value, reference, value-result and name. Value-result is the odd one out because the delayed copy-back overwrites the 11 that the body had already stored.',
      narration: 'Eleven, twelve, six, twelve. Value-result is the odd one out.',
      keyword: '11, 12, 6, 12',
      trap: 'Name and reference agree here. Do not conclude they are the same mode; the next scene separates them.'
    },

    /* ---------- scene 8: name ---------- */
    {
      id: 's8a', start: 210, end: 217.5, scene: 'name',
      caption: 'The call is p of A of i, with i equal to 1.',
      detail: 'The array A has three cells, all zero, and i is one. The call passes A of i. Under reference and under value-result the address of A of 1 is taken at the moment of the call, before the body runs, so any later change to i cannot move the target.',
      narration: 'At the call, A of 1 is the target, and i is one.',
      keyword: 'A of 1'
    },
    {
      id: 's8b', start: 217.5, end: 225, scene: 'name',
      caption: 'Inside, i becomes 2. Under reference the write still lands in A of 1.',
      detail: 'The body first sets i to two, then assigns ten to the formal. Because the formal holds an address captured at the call, the write goes to A of 1 and the array reads ten, zero, zero. The changed i is irrelevant to a reference parameter.',
      narration: 'Reference writes through the saved address: A of 1 becomes ten.',
      keyword: 'saved address',
      trap: 'A reference parameter is bound once, at the call. Changing the index afterwards does not re-target it.'
    },
    {
      id: 's8c', start: 225, end: 232.5, scene: 'name',
      caption: 'Under name the argument is A of i, re-evaluated: the write lands in A of 2.',
      detail: 'The formal is the expression A of i, and it is evaluated at the point of use, by which time i is two. The write therefore goes to A of 2 and the array reads zero, ten, zero. One line of code, one mode changed, and the array differs in which cell holds the value.',
      narration: 'Name evaluates A of i now, so the write goes to A of 2.',
      keyword: 'A of 2',
      trap: 'This is the standard separator between name and reference, and the only reliable way to answer it is to trace each use.'
    },
    {
      id: 's8d', start: 232.5, end: 240, scene: 'name',
      caption: 'Value-result agrees with reference here, and disagrees on the scalar program.',
      detail: 'On the array program value-result copies back into A of 1, so it matches reference. On the scalar program it matched neither reference nor name, printing six. A mode pair can agree on one program and disagree on the next, so the mode names must be traced against the code in front of you.',
      narration: 'Agreement on one program proves nothing. Trace the modes.',
      keyword: 'trace the modes',
      trap: 'Memorising one example of value-result versus reference is not enough. The difference shows only when the body touches the actual variable directly.'
    },

    /* ---------- scene 9: layout ---------- */
    {
      id: 's9a', start: 240, end: 247.5, scene: 'layout',
      caption: 'Offsets are computed, not chosen: 0, 4, 8, 12, then the data at 16.',
      detail: 'The compiler assigns each field the next free offset, four bytes at a time for a four-byte word machine. The returned value takes 0, the return address 4, the control link 8 and the access link 12, and the first local begins at 16. Every frame of the same procedure repeats this layout exactly.',
      narration: 'Zero, four, eight, twelve, then the data at sixteen.',
      keyword: 'offsets'
    },
    {
      id: 's9b', start: 247.5, end: 255, scene: 'layout',
      caption: 'Round the total up to the alignment: 20 becomes 24, and the padding belongs to nothing.',
      detail: 'The fields of Main use twenty bytes, but a frame must start on an eight-byte boundary, so its size is rounded up to twenty-four and four bytes of padding are inserted. Padding is part of the frame size and therefore part of the stack usage, even though no variable lives there.',
      narration: 'Twenty used, twenty-four allocated, four bytes of padding.',
      keyword: 'padding',
      trap: 'Counting only the variables understates the frame and overstates the depth limit.'
    },
    {
      id: 's9c', start: 255, end: 262.5, scene: 'layout',
      caption: 'Frame size times depth is stack use: 96 bytes per frame gives 87381 frames in 8 MiB.',
      detail: 'Divide the available stack by the frame size and round down, because a frame that does not fit cannot be allocated. Eight mebibytes divided by ninety-six bytes is 87381.33, so 87381 frames fit. The rounding down is what the floor is for.',
      narration: 'Eight MiB over ninety-six bytes is 87381 frames.',
      keyword: '87381',
      trap: 'Round down, not to nearest. A part-frame is a stack overflow.'
    },
    {
      id: 's9d', start: 262.5, end: 270, scene: 'layout',
      caption: '87381 frames use 8388576 bytes; the next one would need 8388672 and does not fit.',
      detail: 'The product 87381 times 96 is 8388576, which leaves 32 bytes unused, and one more frame would need 8388672 bytes, which is 64 bytes more than the stack holds. That gap is the arithmetic check that a depth answer is right, and it is cheaper than trusting the division.',
      narration: 'Thirty-two bytes left over, and the next frame needs sixty-four too many.',
      keyword: '8388576'
    },

    /* ---------- scene 10: exam ---------- */
    {
      id: 's10a', start: 270, end: 277.5, scene: 'exam',
      caption: 'Five steps: find the declaration, take the level difference, follow that many links, add the offset.',
      detail: 'Locate the declaration the name denotes under the stated scoping rule, read its nesting level, subtract the level of the code doing the reading, follow exactly that many access links, then add the offset. Naming the frame you arrived in is the last step, and it is the answer a question usually wants.',
      narration: 'Declaration, level difference, that many links, then the offset.',
      keyword: 'five steps'
    },
    {
      id: 's10b', start: 277.5, end: 285, scene: 'exam',
      caption: 'Three shapes are asked: output under a scoping rule, the frame a name resolves to, and the live frame count.',
      detail: 'Almost every question on this clause is one of three things. Print the output of a program under a stated scoping or parameter rule. Name the frame or the link that a given reference uses. Count the frames alive at some point, or the bytes they occupy. Each has its own check, and all three reduce to the same five steps.',
      narration: 'Output, resolution, and frame count. Three shapes, one procedure.',
      keyword: 'three shapes',
      trap: 'A question may state the scoping rule and the parameter mode separately. Apply each where it belongs.'
    },
    {
      id: 's10c', start: 285, end: 292.5, scene: 'exam',
      caption: 'A scoping answer that used the caller under static scope is wrong at once.',
      detail: 'Under static scoping the answer depends only on where the procedures are written, so any trace that consults the calling procedure has already broken the rule. This single check removes most wrong options without any arithmetic, and it takes seconds.',
      narration: 'Static scope never consults the caller.',
      keyword: 'never consults the caller',
      trap: 'The distractor is usually the dynamic-scoping answer offered under a static-scoping question, or the reverse.'
    },
    {
      id: 's10d', start: 292.5, end: 300, scene: 'exam',
      caption: 'A frame count that includes returned calls is wrong: only live calls occupy the stack.',
      detail: 'Frames belong to calls that have started and not yet returned. Counting every call made during the run, or counting the number of times a function appears in the source, both overcount. Take the deepest point of the call chain, count the frames alive there, and multiply by the padded frame size.',
      narration: 'Only calls that have not returned are on the stack.',
      keyword: 'not yet returned',
      trap: 'The peak of the stack is a property of one moment, not of the whole execution.'
    }
  ]
};
