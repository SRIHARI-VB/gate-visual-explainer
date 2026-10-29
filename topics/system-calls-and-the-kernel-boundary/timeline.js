/* ==========================================================================
   system-calls-and-the-kernel-boundary — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every count quoted in a caption is computed by the model in lesson.js and
   printed on the canvas. The two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'boundary',
      n: 1,
      title: 'A system call is not a function call',
      start: 0, end: 30,
      objective: 'Separate an ordinary call, which stays inside user mode, from a system call, which changes the privilege level of the running process.'
    },
    {
      id: 'trap',
      n: 2,
      title: 'What the trap does, register by register',
      start: 30, end: 60,
      objective: 'Follow one read() from the call number in %rax to the handler the kernel picks from its table, and back to the return value.'
    },
    {
      id: 'doors',
      n: 3,
      title: 'Three doors into the kernel',
      start: 60, end: 90,
      objective: 'Distinguish a deliberate trap, a fault raised by the program, and an interrupt raised by a device, and apply the distinction to GATE CSE 2023 Q13.'
    },
    {
      id: 'switch',
      n: 4,
      title: 'Mode switch against process switch',
      start: 90, end: 120,
      objective: 'Show that a system call changes the mode but not the running process, which is why T1 is smaller than T2 in GATE CSE 2011 Q6.'
    },
    {
      id: 'stdio',
      n: 5,
      title: 'printf is not a system call',
      start: 120, end: 150,
      objective: 'Place the stdio buffer between printf and write(2), and count how many system calls a run actually makes.'
    },
    {
      id: 'dup',
      n: 6,
      title: 'fork copies the buffer',
      start: 150, end: 180,
      objective: 'Derive why an unflushed printf is printed once per process after fork, and when a newline prevents it.'
    },
    {
      id: 'lifecycle',
      n: 7,
      title: 'The four calls that run a program',
      start: 180, end: 210,
      objective: 'Read fork, exec, exit and wait as one protocol, and say which of them blocks, which returns, and which never returns.'
    },
    {
      id: 'survives',
      n: 8,
      title: 'What exec throws away and what it keeps',
      start: 210, end: 240,
      objective: 'Sort the process attributes into the ones execve replaces and the ones it preserves, with the caught-signal rule as the sharp edge.'
    },
    {
      id: 'fds',
      n: 9,
      title: 'File descriptors: copied by fork, kept by exec',
      start: 240, end: 270,
      objective: 'Separate the descriptor table from the open file description, and use the shared offset to answer a read question exactly.'
    },
    {
      id: 'count',
      n: 10,
      title: 'Counting with wait, and the four traps',
      start: 270, end: 300,
      objective: 'Run the 2024 Set 1 loop, show that wait changes the order and not the count, and close on the traps worth memorising.'
    }
  ],

  events: [
    /* ---------------- scene 1: boundary ---------------- */
    {
      id: 'boundary-1', start: 0, end: 8, scene: 'boundary',
      visualAction: 'draw-two-bands',
      caption: 'The processor runs in two modes. A single bit in the status register decides which one, and only the kernel can change it.',
      detail: 'Two horizontal bands: the process runs in user mode, where privileged instructions are refused, and the kernel runs in kernel mode, where every instruction is allowed. The mode bit lives in the processor status word; changing it is itself a privileged operation, which is what stops a user program from promoting itself.',
      keyword: 'mode',
      narration: 'The processor has two modes, and one bit decides which. In user mode privileged instructions are refused; in kernel mode they are allowed.',
      trap: 'Textbooks write the mode bit as 1 for user and 0 for kernel. Some processors use the opposite polarity, so answer with the rule, not with the number.'
    },
    {
      id: 'boundary-2', start: 8, end: 16, scene: 'boundary',
      visualAction: 'draw-plain-call',
      caption: 'An ordinary function call pushes a return address and jumps. Both caller and callee stay in user mode, in the same address space.',
      detail: 'A call to a function you wrote yourself is a jump plus a stack frame. Nothing about the privilege level changes, nothing is saved except what the calling convention says, and the callee can do exactly what the caller could do.',
      keyword: 'function call',
      narration: 'An ordinary call is a jump and a stack frame. The privilege level does not change, and neither does the address space.',
      trap: 'A function call therefore does not guarantee a transition to kernel mode. That single sentence is the whole of GATE CSE 2023 Q13 option A.'
    },
    {
      id: 'boundary-3', start: 16, end: 23, scene: 'boundary',
      visualAction: 'draw-trap-path',
      caption: 'A system call executes a trap instruction. The hardware switches mode, jumps to a fixed handler, and later returns to the next instruction.',
      detail: 'The user program puts a call number and arguments in registers and executes one trap instruction. The hardware switches to kernel mode, saves the program counter and status word, and enters the kernel through a fixed vector. On the way back, a return-from-trap instruction restores the saved state and drops the mode again.',
      keyword: 'trap',
      narration: 'A system call executes a trap instruction. The hardware changes the mode and jumps to a fixed handler, then returns to the next instruction.',
      trap: 'The return address is set by the hardware, not by the caller, so a user program cannot choose where the kernel resumes.'
    },
    {
      id: 'boundary-4', start: 23, end: 30, scene: 'boundary',
      visualAction: 'state-difference',
      caption: 'So: same address space, same process, different privilege. That is the difference between a call and a system call.',
      detail: 'The process that made the call is still the process running in the kernel. Its page tables, its open files and its identity are unchanged; only the mode bit and the code being executed differ. That is why a system call is a mode switch and not a process switch.',
      keyword: 'privilege',
      narration: 'Same address space, same process, different privilege. A system call is a mode switch, not a process switch.',
      trap: 'Do not say the process is "switched out". It keeps running; it is now running kernel code on its own behalf.'
    },

    /* ---------------- scene 2: trap ---------------- */
    {
      id: 'trap-1', start: 30, end: 38, scene: 'trap',
      visualAction: 'draw-registers',
      caption: 'One read of eight bytes from descriptor 3: the number 0 goes in %rax, the descriptor in %rdi, the buffer in %rsi, the count in %rdx.',
      detail: 'On x86-64 Linux the call number travels in %rax and the arguments in %rdi, %rsi, %rdx, %r10, %r8 and %r9 in that order. read is number 0, write is 1, close is 3, fork is 57, execve is 59, exit is 60 and wait4 is 61, taken from the kernel table file for 64-bit x86.',
      keyword: '%rax',
      narration: 'The call number goes in one register and the arguments in the next few. read is number zero, write is number one.',
      trap: 'The numbers are per architecture. x86-64 fork is 57, but 32-bit x86 fork is 2, so a number quoted without its architecture is not a fact.'
    },
    {
      id: 'trap-2', start: 38, end: 45, scene: 'trap',
      visualAction: 'draw-table-lookup',
      caption: 'The trap instruction hands control to the kernel, which indexes its own table with the number and calls the handler for entry 0.',
      detail: 'The kernel does not trust the number blindly: it range-checks it against the table length, and an unimplemented number fails with the error ENOSYS. The handler then validates the arguments, because a user program may pass any descriptor or any pointer.',
      keyword: 'handler',
      narration: 'The kernel indexes its own table with that number and runs the matching handler, after checking the number and the arguments.',
      trap: 'A negative return value in the range minus 4095 to minus 1 is an error code, not a small result. The C wrapper turns it into minus one and sets errno.'
    },
    {
      id: 'trap-3', start: 45, end: 53, scene: 'trap',
      visualAction: 'draw-return-value',
      caption: 'The result comes back in %rax. Success returns the count read; failure returns a negative code that the C library converts to -1 and errno.',
      detail: 'Eight bytes read returns 8. A closed descriptor returns minus 9, which is minus EBADF, and the wrapper in the C library reports -1 with errno set to 9. The kernel never writes errno itself; that is library work.',
      keyword: 'errno',
      narration: 'The result comes back in the same register the number went in. Success is a count; failure is a negative code that the library turns into minus one and errno.',
      trap: 'A return of 0 from read is not an error: it means end of file. Treating 0 as failure is the commonest misreading.'
    },
    {
      id: 'trap-4', start: 53, end: 60, scene: 'trap',
      visualAction: 'show-privilege',
      caption: 'The trap instruction itself is not privileged — that is why user code may execute it. What it stands in for, reading a disk, is.',
      detail: 'If the trap instruction were privileged, a user program could never enter the kernel at all. The design is that entering is always allowed, and what the kernel then does is gated by checks on the number and the arguments.',
      keyword: 'not privileged',
      narration: 'The trap instruction itself is not privileged, or user code could never enter the kernel. The operation behind it is what needs privilege.',
      trap: 'A privileged instruction executed in user mode raises an exception, and the process is usually killed. The trap instruction is the deliberate exception.'
    },

    /* ---------------- scene 3: doors ---------------- */
    {
      id: 'doors-1', start: 60, end: 68, scene: 'doors',
      visualAction: 'draw-three-doors',
      caption: 'Three doors lead in: a trap the program executes on purpose, a fault it causes by accident, and an interrupt a device raises.',
      detail: 'A system call is synchronous and deliberate. A fault such as a divide by zero or a page fault is synchronous and accidental. An interrupt such as a timer tick or a disk completion is asynchronous and external. All three end in the same place: kernel mode, a handler, and a return.',
      keyword: 'three doors',
      narration: 'Three doors lead into the kernel: a deliberate trap, an accidental fault, and an interrupt from a device.',
      trap: 'A page fault is an exception, not an interrupt. It is caused by the instruction that is running, so it is synchronous with the program.'
    },
    {
      id: 'doors-2', start: 68, end: 76, scene: 'doors',
      visualAction: 'draw-options',
      caption: 'GATE CSE 2023 Q13 asks which options guarantee a move from user mode to kernel mode: function call, malloc, page fault, system call.',
      detail: 'The question is a multiple-select item from the 2023 paper. The wording that matters is "guarantee": an option that sometimes enters the kernel is not an answer, and an option that never does is not either.',
      keyword: 'guarantee',
      narration: 'The 2023 paper asks which of four options guarantees a transition from user mode to kernel mode.',
      trap: 'The word guarantee is doing the work. malloc usually reaches the kernel for more memory, but a call served from the existing heap does not.'
    },
    {
      id: 'doors-3', start: 76, end: 83, scene: 'doors',
      visualAction: 'judge-options',
      caption: 'A function call stays in user mode. malloc may be served from the heap without any call. A page fault and a system call always enter the kernel.',
      detail: 'Both rejected options are rejected for the same reason: they can complete entirely in user mode, so neither guarantees anything. Both accepted options are traps into the kernel by construction.',
      keyword: 'rejected',
      narration: 'A function call never enters the kernel, and malloc need not. A page fault and a system call always do.',
      trap: 'A candidate who answers only D loses the mark. The paper allows more than one correct option, and the page fault is the option people drop.'
    },
    {
      id: 'doors-4', start: 83, end: 90, scene: 'doors',
      visualAction: 'show-answer',
      caption: 'Answer key: C and D. The rule behind it is that only an event the hardware must hand to the kernel counts.',
      detail: 'The archived key records C and D. The reasoning generalises: ask whether the processor can complete the operation without asking the kernel. If it can, there is no guarantee.',
      keyword: 'C and D',
      narration: 'The key is C and D. Ask of any option whether the processor could finish it without the kernel; if it could, it guarantees nothing.',
      trap: 'Some solutions argue about page faults served without kernel entry. On the architectures the paper means, a fault vectors to the kernel, and the key says so.'
    },

    /* ---------------- scene 4: switch ---------------- */
    {
      id: 'switch-1', start: 90, end: 98, scene: 'switch',
      visualAction: 'draw-mode-switch',
      caption: 'A mode switch saves the program counter and status word, flips the mode bit, jumps to the handler, and returns. Four steps.',
      detail: 'Nothing about the address space changes, no scheduler runs, and the same process continues. That is why a system call is cheap compared with what comes next.',
      keyword: 'four steps',
      narration: 'A mode switch saves the program counter and status word, flips the mode bit, jumps to the handler, and returns.',
      trap: 'Saving registers is not the expensive part. The expensive part of a switch is what it does to caches and address translation.'
    },
    {
      id: 'switch-2', start: 98, end: 106, scene: 'switch',
      visualAction: 'draw-process-switch',
      caption: 'A process switch does all four of those and four more: run the scheduler, save everything, change the page table base, disturb the TLB.',
      detail: 'The mode switch is a subset of the process switch. That containment is the argument, not a measurement: the process switch performs every step the mode switch performs, and then does work the mode switch never does.',
      keyword: 'subset',
      narration: 'A process switch does all four steps and four more, including changing the address space and disturbing the translation cache.',
      trap: 'Do not answer this question with timings you have not measured. The safe argument is containment: one set of steps is a proper subset of the other.'
    },
    {
      id: 'switch-3', start: 106, end: 113, scene: 'switch',
      visualAction: 'state-inequality',
      caption: 'GATE CSE 2011 Q6: T1 is the mode switch and T2 the process switch, and the answer is T1 < T2.',
      detail: 'The paper asks which relation holds between the time to switch from user mode to kernel mode and the time to switch between two user processes. Since every process switch includes a mode switch and adds scheduler and memory work, T1 is smaller.',
      keyword: 'T1 < T2',
      narration: 'The 2011 paper asks for the relation, and it is T1 less than T2, because a process switch contains a mode switch.',
      trap: 'The wrong answer is T1 > T2, which comes from imagining that entering the kernel is the costly part. Entering is cheap; changing process is not.'
    },
    {
      id: 'switch-4', start: 113, end: 120, scene: 'switch',
      visualAction: 'show-consequence',
      caption: 'The consequence: a program that makes many system calls is slow for a reason that has nothing to do with process switching.',
      detail: 'Each call costs a mode switch, the handler work, and the cache and TLB disturbance of running a different body of code. That cost is what the next scene counts.',
      keyword: 'consequence',
      narration: 'So a program making many system calls is slow for a reason that is not a process switch: it is paying the boundary again and again.',
      trap: 'This is why buffering exists. The next two scenes turn that sentence into arithmetic.'
    },

    /* ---------------- scene 5: stdio ---------------- */
    {
      id: 'stdio-1', start: 120, end: 128, scene: 'stdio',
      visualAction: 'draw-layers',
      caption: 'printf is a library function. It formats into a buffer the process owns, and only write, the system call, reaches the kernel.',
      detail: 'The chain is printf, then the stdio buffer in the process heap, then write with descriptor 1, then the kernel, then the file or terminal. printf never crosses the boundary by itself.',
      keyword: 'buffer',
      narration: 'printf formats into a buffer that the process owns. Only write, the system call, crosses into the kernel.',
      trap: 'Calling printf a system call is the misconception this scene exists to remove. It is an ordinary function in the C library.'
    },
    {
      id: 'stdio-2', start: 128, end: 136, scene: 'stdio',
      visualAction: 'draw-buffering-rules',
      caption: 'Three rules: stderr is unbuffered, stdout is line buffered on a terminal, and stdout is fully buffered when it is a file or a pipe.',
      detail: 'Line buffered means a newline triggers a write. Fully buffered means bytes accumulate until the buffer is full or the stream is flushed at exit. The size used here is 4096 bytes, which is a typical block size, not a guaranteed constant.',
      keyword: 'line buffered',
      narration: 'stderr is unbuffered, stdout is line buffered at a terminal, and fully buffered when redirected to a file or a pipe.',
      trap: 'The 4096 in this scene is the value used for the arithmetic. The real size is implementation defined, so do not quote it as a standard constant.'
    },
    {
      id: 'stdio-3', start: 136, end: 143, scene: 'stdio',
      visualAction: 'count-writes',
      caption: 'Five lines of six bytes: five write calls on a terminal, one when redirected, because all 30 bytes fit in the buffer until exit.',
      detail: 'At a terminal every newline flushes, so five prints are five system calls. Redirected, the 30 bytes sit in the buffer and are written once when the stream is flushed at exit. The arithmetic is the ceiling of total bytes over buffer size.',
      keyword: 'five against one',
      narration: 'Five lines cost five calls at a terminal and one when redirected, because all thirty bytes fit in the buffer until exit.',
      trap: 'This is also why a crash can lose redirected output: the bytes were in the buffer and were never written.'
    },
    {
      id: 'stdio-4', start: 143, end: 150, scene: 'stdio',
      visualAction: 'count-large',
      caption: 'Two thousand prints of ten bytes: 2000 calls at a terminal against 5 redirected, because 20000 bytes need five full buffers.',
      detail: 'The ceiling of 20000 over 4096 is 5. The factor of 400 between the two columns is the reason buffered output exists, and it is a factor in system calls, not in bytes.',
      keyword: '2000 against 5',
      narration: 'Two thousand prints of ten bytes cost two thousand calls at a terminal, and five when redirected.',
      trap: 'The byte count is identical in both columns. Only the number of boundary crossings changes, which is exactly the cost being modelled.'
    },

    /* ---------------- scene 6: dup ---------------- */
    {
      id: 'dup-1', start: 150, end: 158, scene: 'dup',
      visualAction: 'draw-buffer-state',
      caption: 'printf with no newline, redirected to a file: the five bytes are in the process buffer, and nothing has been written yet.',
      detail: 'The program has produced output that no other process can see, because the bytes never left user space. That state is what makes the next step surprising.',
      keyword: 'not written yet',
      narration: 'printf with no newline, redirected to a file, leaves the bytes in the process buffer. Nothing has been written yet.',
      trap: 'At a terminal the same printf would already have been written if it ended in a newline. The buffering mode decides the answer.'
    },
    {
      id: 'dup-2', start: 158, end: 166, scene: 'dup',
      visualAction: 'draw-fork-copy',
      caption: 'fork duplicates the process, and the buffer is part of the process. The child gets its own copy of those unflushed bytes.',
      detail: 'fork gives the child a separate address space with the same contents, so the stdio buffer is copied along with everything else. Two independent buffers now hold the same five bytes.',
      keyword: 'copy',
      narration: 'fork duplicates the process, and the buffer is part of the process, so the child gets its own copy of those unflushed bytes.',
      trap: 'Copy on write does not save you here. The bytes are only shared until one side writes, and flushing is a write.'
    },
    {
      id: 'dup-3', start: 166, end: 173, scene: 'dup',
      visualAction: 'count-copies',
      caption: 'Three forks give eight processes, so the five bytes are written eight times. Line buffered, the same program writes them once.',
      detail: 'Each process flushes its own copy at exit, so the number of copies is the number of processes alive at flush time, which is two to the power of the number of forks. The model on this page runs that tree and counts.',
      keyword: 'eight copies',
      narration: 'Three forks give eight processes, so the bytes are written eight times. Line buffered, the same program writes them once.',
      trap: 'The output is not duplicated because fork copies output. It is duplicated because the output had not been sent yet.'
    },
    {
      id: 'dup-4', start: 173, end: 180, scene: 'dup',
      visualAction: 'show-fix',
      caption: 'The fix is to flush before forking: end the line, or call fflush. A newline alone is enough only when the stream is line buffered.',
      detail: 'On a terminal a newline flushes and the problem disappears. Redirected, a newline does not flush, and fflush is the portable fix. That asymmetry is why the same program behaves differently in a script and at a prompt.',
      keyword: 'fflush',
      narration: 'Flush before forking: end the line, or call fflush. A newline is enough only when the stream is line buffered.',
      trap: 'Adding a newline fixes the terminal case and not the redirected case. Only fflush fixes both.'
    },

    /* ---------------- scene 7: lifecycle ---------------- */
    {
      id: 'lifecycle-1', start: 180, end: 188, scene: 'lifecycle',
      visualAction: 'draw-protocol',
      caption: 'A shell runs a program in four calls: fork to make a process, exec to put the program in it, exit when it ends, wait to collect it.',
      detail: 'The parent forks, the child execs, the child exits, the parent waits. The four calls are one protocol, and each one answers a different question about the process.',
      keyword: 'four calls',
      narration: 'A shell forks, the child execs, the child exits, and the parent waits. Four calls, one protocol.',
      trap: 'fork alone cannot run another program, and exec alone cannot create a second process. The pair is the mechanism.'
    },
    {
      id: 'lifecycle-2', start: 188, end: 196, scene: 'lifecycle',
      visualAction: 'draw-exec',
      caption: 'execve replaces the memory image with a new program and does not return on success. The process identifier is unchanged.',
      detail: 'The text, data, heap and stack are overwritten by the new program. The same process, with the same identifier, is now running different code. On success there is no return; on failure it returns minus one and the old program continues.',
      keyword: 'replaces',
      narration: 'execve replaces the memory image with a new program and never returns on success. The process identifier does not change.',
      trap: 'Code written after a successful exec never runs. That is not a bug; there is no old program left to run it.'
    },
    {
      id: 'lifecycle-3', start: 196, end: 203, scene: 'lifecycle',
      visualAction: 'draw-zombie',
      caption: 'A child that exits but is not waited for stays a zombie. wait collects the status and frees the slot; the status keeps its low eight bits.',
      detail: 'The kernel keeps the identifier, the termination status and the resource usage so the parent can still ask. Once the parent waits, the entry is gone. The status is a packed integer, and the exit value is its low eight bits, so exit 256 is reported as 0.',
      keyword: 'zombie',
      narration: 'A child that exits and is not waited for stays a zombie. wait collects the status and frees the slot, and the exit value is the low eight bits.',
      trap: 'exit 256 is not distinguishable from exit 0. The kernel keeps eight bits, so 256 and 512 both report 0.'
    },
    {
      id: 'lifecycle-4', start: 203, end: 210, scene: 'lifecycle',
      visualAction: 'state-wait-effect',
      caption: 'GATE CSE 2024 Set 1: the loop with fork, printf and wait prints 14 times. wait changes the order, never the count.',
      detail: 'The loop runs three times, and every live process forks once per iteration, so the populations are 2, 4 and 8 and every one of them prints. wait only stops a parent from running ahead of its own child.',
      keyword: '14',
      narration: 'The 2024 loop prints fourteen times. wait changes the order of the prints and never their number.',
      trap: 'Candidates who treat wait as a filter answer 8, the process count. The question asks for executions of printf.'
    },

    /* ---------------- scene 8: survives ---------------- */
    {
      id: 'survives-1', start: 210, end: 218, scene: 'survives',
      visualAction: 'list-reset',
      caption: 'exec throws away the program: text, data, heap and stack are replaced, and the caught signal handlers go back to their defaults.',
      detail: 'Also discarded: the alternate signal stack, memory mappings, timers, open directory streams, exit handlers, and the floating-point environment, which is reset. A handler the old program installed cannot survive, because the code for it no longer exists.',
      keyword: 'reset',
      narration: 'exec replaces the program image and resets caught signal handlers to their defaults, along with mappings, timers and exit handlers.',
      trap: 'A handler set to be ignored stays ignored across exec, while a handler set to be caught is reset. The two dispositions behave differently.'
    },
    {
      id: 'survives-2', start: 218, end: 226, scene: 'survives',
      visualAction: 'list-preserved',
      caption: 'What survives: the identifier, the parent identifier, the open descriptors, the working directory, the umask, the limits and the identity.',
      detail: 'These are properties of the process rather than of the program, so replacing the program leaves them alone. The environment is not inherited automatically either: execve takes it as an argument, which is why a shell passes its own.',
      keyword: 'preserved',
      narration: 'The identifier, the open descriptors, the working directory, the umask, the limits and the identity all survive exec.',
      trap: 'The environment is passed, not inherited. execve takes it as a third argument, so a program can be given a different one.'
    },
    {
      id: 'survives-3', start: 226, end: 233, scene: 'survives',
      visualAction: 'draw-signal-rule',
      caption: 'The sharp edge: ignored signals stay ignored, caught signals are reset. That asymmetry is a favourite question.',
      detail: 'Ignoring a signal is a property the new program may want to keep, since the parent chose it deliberately. Catching one requires handler code in the old image, so it cannot survive.',
      keyword: 'ignored',
      narration: 'An ignored signal stays ignored across exec. A caught one is reset to the default, because its handler no longer exists.',
      trap: 'The default disposition of most signals is not "ignore" but the action itself, such as terminating. Only SIG_IGN is inherited.'
    },
    {
      id: 'survives-4', start: 233, end: 240, scene: 'survives',
      visualAction: 'bridge-to-fds',
      caption: 'And the descriptor table survives, which is how a redirection set up before exec still works after it. That is the next scene.',
      detail: 'A shell duplicates the file it opened onto descriptor 1 in the child, then execs. The new program writes to descriptor 1 without knowing anything about the file.',
      keyword: 'descriptor',
      narration: 'The descriptor table survives exec, which is how a redirection set up before exec still works after it.',
      trap: 'This is the mechanism behind the shell operator, not a special feature of the shell.'
    },

    /* ---------------- scene 9: fds ---------------- */
    {
      id: 'fds-1', start: 240, end: 248, scene: 'fds',
      visualAction: 'draw-two-levels',
      caption: 'Two levels: the descriptor table belongs to the process, the open file description belongs to the kernel and holds the offset.',
      detail: 'A descriptor is an index into the process table. The entry points at an open file description, which holds the offset, the status flags and the access mode. Several descriptors can point at one description.',
      keyword: 'open file description',
      narration: 'A descriptor indexes the process table. The entry points at an open file description in the kernel, which holds the offset.',
      trap: 'The offset is in the description, not in the descriptor. That one sentence decides every shared-offset question.'
    },
    {
      id: 'fds-2', start: 248, end: 256, scene: 'fds',
      visualAction: 'draw-shared-offset',
      caption: 'fork copies the table but not the descriptions. Both processes read through the same description, so the offsets go 4 then 8.',
      detail: 'The parent reads four bytes and the offset becomes four. The child then reads four bytes and gets the second four bytes of the file, not the first four, because it is reading the same description.',
      keyword: 'shared',
      narration: 'fork copies the table but not the descriptions, so the parent reads the first four bytes and the child reads the next four.',
      trap: 'The child does not start at the beginning. The offset is shared, so the child continues where the parent stopped.'
    },
    {
      id: 'fds-3', start: 256, end: 263, scene: 'fds',
      visualAction: 'draw-separate-opens',
      caption: 'Two separate open calls make two descriptions, and then each has its own offset from zero. Same file, different question.',
      detail: 'This is the counterexample that stops the shared-offset rule being over-applied: sharing comes from fork, dup and descriptor passing, not from naming the same file twice.',
      keyword: 'separate opens',
      narration: 'Two separate opens make two descriptions with independent offsets. Same file, different question.',
      trap: 'The rule is about the description, not the file. Two opens of one file do not share an offset.'
    },
    {
      id: 'fds-4', start: 263, end: 270, scene: 'fds',
      visualAction: 'draw-cloexec',
      caption: 'exec keeps every descriptor unless it was marked close-on-exec, and dup2 is how a shell makes descriptor 1 point at a file.',
      detail: 'By default a new descriptor survives exec, and the close-on-exec flag is what stops that. dup2 makes the target descriptor refer to the same description as the source, which is exactly a redirection.',
      keyword: 'close-on-exec',
      narration: 'exec keeps every descriptor unless it was marked close-on-exec, and dup2 is how a shell points descriptor one at a file.',
      trap: 'A descriptor that is closed on exec is closed in the new program only. The parent still has its own copy.'
    },

    /* ---------------- scene 10: count ---------------- */
    {
      id: 'count-1', start: 270, end: 278, scene: 'count',
      visualAction: 'run-simulation',
      caption: 'Run the 2024 program as a model: three iterations, populations of 2, 4 and 8, every one printing once, for 14 executions in 8 processes.',
      detail: 'The model builds the process tree and counts two ways: the population of each iteration, and the sum over processes of how many iterations each one still had to run. Both give 14.',
      keyword: '14 in 8',
      narration: 'The model runs the loop: populations of two, four and eight, every process printing once, for fourteen executions in eight processes.',
      trap: 'Fourteen is not the process count and eight is not the print count. The question names one of them.'
    },
    {
      id: 'count-2', start: 278, end: 285, scene: 'count',
      visualAction: 'list-traps',
      caption: 'Four traps: printf is not a system call, the trap instruction is not privileged, wait changes order not count, and a shared description shares its offset.',
      detail: 'Each one is a place where a plausible sentence is false. None of them requires memorising a number; each requires reading the definition.',
      keyword: 'four traps',
      narration: 'Four traps: printf is not a system call, the trap instruction is not privileged, wait changes order and not count, and a shared description shares its offset.',
      trap: 'If a question needs a number you cannot derive, derive it from the description first: descriptors, descriptions, and the process tree.'
    },
    {
      id: 'count-3', start: 285, end: 293, scene: 'count',
      visualAction: 'show-checklist',
      caption: 'The procedure for any question here: name the call, name its mode, then ask what the call changes and what it leaves alone.',
      detail: 'Naming the call fixes whether it returns, blocks or never returns. Naming its mode fixes whether it is a boundary crossing. Asking what it changes separates a fork from an exec and a mode switch from a process switch.',
      keyword: 'procedure',
      narration: 'Name the call, name its mode, then ask what it changes and what it leaves alone.',
      trap: 'The three questions are ordered. Answering what changes before naming the call is how people confuse exec with fork.'
    },
    {
      id: 'count-4', start: 293, end: 300, scene: 'count',
      visualAction: 'close',
      caption: 'One boundary, four calls and two tables explain the whole topic. Everything else on this page is a consequence.',
      detail: 'The boundary is the mode bit and the trap. The four calls are fork, exec, exit and wait. The two tables are the descriptor table and the open file description. The practice set tests each one separately.',
      keyword: 'one boundary',
      narration: 'One boundary, four calls and two tables. Everything else is a consequence of those.',
      trap: 'The revision tab is one screen. If a fact is not on it, it is a consequence and can be rebuilt.'
    }
  ]
};
