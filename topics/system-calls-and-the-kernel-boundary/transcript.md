# System Calls: the User–Kernel Boundary, fork/exec/wait and File Descriptor Inheritance — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/system-calls-and-the-kernel-boundary/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A system call is not a function call

*0:00 – 0:30 · objective: Separate an ordinary call, which stays inside user mode, from a system call, which changes the privilege level of the running process.*

**0:00–0:08** — The processor has two modes, and one bit decides which. In user mode privileged instructions are refused; in kernel mode they are allowed.

> Caption: The processor runs in two modes. A single bit in the status register decides which one, and only the kernel can change it.

Exam-trap caption mode adds: *Textbooks write the mode bit as 1 for user and 0 for kernel. Some processors use the opposite polarity, so answer with the rule, not with the number.*

**0:08–0:16** — An ordinary call is a jump and a stack frame. The privilege level does not change, and neither does the address space.

> Caption: An ordinary function call pushes a return address and jumps. Both caller and callee stay in user mode, in the same address space.

Exam-trap caption mode adds: *A function call therefore does not guarantee a transition to kernel mode. That single sentence is the whole of GATE CSE 2023 Q13 option A.*

**0:16–0:23** — A system call executes a trap instruction. The hardware changes the mode and jumps to a fixed handler, then returns to the next instruction.

> Caption: A system call executes a trap instruction. The hardware switches mode, jumps to a fixed handler, and later returns to the next instruction.

Exam-trap caption mode adds: *The return address is set by the hardware, not by the caller, so a user program cannot choose where the kernel resumes.*

**0:23–0:30** — Same address space, same process, different privilege. A system call is a mode switch, not a process switch.

> Caption: So: same address space, same process, different privilege. That is the difference between a call and a system call.

Exam-trap caption mode adds: *Do not say the process is "switched out". It keeps running; it is now running kernel code on its own behalf.*

## Scene 2. What the trap does, register by register

*0:30 – 1:00 · objective: Follow one read() from the call number in %rax to the handler the kernel picks from its table, and back to the return value.*

**0:30–0:38** — The call number goes in one register and the arguments in the next few. read is number zero, write is number one.

> Caption: One read of eight bytes from descriptor 3: the number 0 goes in %rax, the descriptor in %rdi, the buffer in %rsi, the count in %rdx.

Exam-trap caption mode adds: *The numbers are per architecture. x86-64 fork is 57, but 32-bit x86 fork is 2, so a number quoted without its architecture is not a fact.*

**0:38–0:45** — The kernel indexes its own table with that number and runs the matching handler, after checking the number and the arguments.

> Caption: The trap instruction hands control to the kernel, which indexes its own table with the number and calls the handler for entry 0.

Exam-trap caption mode adds: *A negative return value in the range minus 4095 to minus 1 is an error code, not a small result. The C wrapper turns it into minus one and sets errno.*

**0:45–0:53** — The result comes back in the same register the number went in. Success is a count; failure is a negative code that the library turns into minus one and errno.

> Caption: The result comes back in %rax. Success returns the count read; failure returns a negative code that the C library converts to -1 and errno.

Exam-trap caption mode adds: *A return of 0 from read is not an error: it means end of file. Treating 0 as failure is the commonest misreading.*

**0:53–1:00** — The trap instruction itself is not privileged, or user code could never enter the kernel. The operation behind it is what needs privilege.

> Caption: The trap instruction itself is not privileged — that is why user code may execute it. What it stands in for, reading a disk, is.

Exam-trap caption mode adds: *A privileged instruction executed in user mode raises an exception, and the process is usually killed. The trap instruction is the deliberate exception.*

## Scene 3. Three doors into the kernel

*1:00 – 1:30 · objective: Distinguish a deliberate trap, a fault raised by the program, and an interrupt raised by a device, and apply the distinction to GATE CSE 2023 Q13.*

**1:00–1:08** — Three doors lead into the kernel: a deliberate trap, an accidental fault, and an interrupt from a device.

> Caption: Three doors lead in: a trap the program executes on purpose, a fault it causes by accident, and an interrupt a device raises.

Exam-trap caption mode adds: *A page fault is an exception, not an interrupt. It is caused by the instruction that is running, so it is synchronous with the program.*

**1:08–1:16** — The 2023 paper asks which of four options guarantees a transition from user mode to kernel mode.

> Caption: GATE CSE 2023 Q13 asks which options guarantee a move from user mode to kernel mode: function call, malloc, page fault, system call.

Exam-trap caption mode adds: *The word guarantee is doing the work. malloc usually reaches the kernel for more memory, but a call served from the existing heap does not.*

**1:16–1:23** — A function call never enters the kernel, and malloc need not. A page fault and a system call always do.

> Caption: A function call stays in user mode. malloc may be served from the heap without any call. A page fault and a system call always enter the kernel.

Exam-trap caption mode adds: *A candidate who answers only D loses the mark. The paper allows more than one correct option, and the page fault is the option people drop.*

**1:23–1:30** — The key is C and D. Ask of any option whether the processor could finish it without the kernel; if it could, it guarantees nothing.

> Caption: Answer key: C and D. The rule behind it is that only an event the hardware must hand to the kernel counts.

Exam-trap caption mode adds: *Some solutions argue about page faults served without kernel entry. On the architectures the paper means, a fault vectors to the kernel, and the key says so.*

## Scene 4. Mode switch against process switch

*1:30 – 2:00 · objective: Show that a system call changes the mode but not the running process, which is why T1 is smaller than T2 in GATE CSE 2011 Q6.*

**1:30–1:38** — A mode switch saves the program counter and status word, flips the mode bit, jumps to the handler, and returns.

> Caption: A mode switch saves the program counter and status word, flips the mode bit, jumps to the handler, and returns. Four steps.

Exam-trap caption mode adds: *Saving registers is not the expensive part. The expensive part of a switch is what it does to caches and address translation.*

**1:38–1:46** — A process switch does all four steps and four more, including changing the address space and disturbing the translation cache.

> Caption: A process switch does all four of those and four more: run the scheduler, save everything, change the page table base, disturb the TLB.

Exam-trap caption mode adds: *Do not answer this question with timings you have not measured. The safe argument is containment: one set of steps is a proper subset of the other.*

**1:46–1:53** — The 2011 paper asks for the relation, and it is T1 less than T2, because a process switch contains a mode switch.

> Caption: GATE CSE 2011 Q6: T1 is the mode switch and T2 the process switch, and the answer is T1 < T2.

Exam-trap caption mode adds: *The wrong answer is T1 > T2, which comes from imagining that entering the kernel is the costly part. Entering is cheap; changing process is not.*

**1:53–2:00** — So a program making many system calls is slow for a reason that is not a process switch: it is paying the boundary again and again.

> Caption: The consequence: a program that makes many system calls is slow for a reason that has nothing to do with process switching.

Exam-trap caption mode adds: *This is why buffering exists. The next two scenes turn that sentence into arithmetic.*

## Scene 5. printf is not a system call

*2:00 – 2:30 · objective: Place the stdio buffer between printf and write(2), and count how many system calls a run actually makes.*

**2:00–2:08** — printf formats into a buffer that the process owns. Only write, the system call, crosses into the kernel.

> Caption: printf is a library function. It formats into a buffer the process owns, and only write, the system call, reaches the kernel.

Exam-trap caption mode adds: *Calling printf a system call is the misconception this scene exists to remove. It is an ordinary function in the C library.*

**2:08–2:16** — stderr is unbuffered, stdout is line buffered at a terminal, and fully buffered when redirected to a file or a pipe.

> Caption: Three rules: stderr is unbuffered, stdout is line buffered on a terminal, and stdout is fully buffered when it is a file or a pipe.

Exam-trap caption mode adds: *The 4096 in this scene is the value used for the arithmetic. The real size is implementation defined, so do not quote it as a standard constant.*

**2:16–2:23** — Five lines cost five calls at a terminal and one when redirected, because all thirty bytes fit in the buffer until exit.

> Caption: Five lines of six bytes: five write calls on a terminal, one when redirected, because all 30 bytes fit in the buffer until exit.

Exam-trap caption mode adds: *This is also why a crash can lose redirected output: the bytes were in the buffer and were never written.*

**2:23–2:30** — Two thousand prints of ten bytes cost two thousand calls at a terminal, and five when redirected.

> Caption: Two thousand prints of ten bytes: 2000 calls at a terminal against 5 redirected, because 20000 bytes need five full buffers.

Exam-trap caption mode adds: *The byte count is identical in both columns. Only the number of boundary crossings changes, which is exactly the cost being modelled.*

## Scene 6. fork copies the buffer

*2:30 – 3:00 · objective: Derive why an unflushed printf is printed once per process after fork, and when a newline prevents it.*

**2:30–2:38** — printf with no newline, redirected to a file, leaves the bytes in the process buffer. Nothing has been written yet.

> Caption: printf with no newline, redirected to a file: the five bytes are in the process buffer, and nothing has been written yet.

Exam-trap caption mode adds: *At a terminal the same printf would already have been written if it ended in a newline. The buffering mode decides the answer.*

**2:38–2:46** — fork duplicates the process, and the buffer is part of the process, so the child gets its own copy of those unflushed bytes.

> Caption: fork duplicates the process, and the buffer is part of the process. The child gets its own copy of those unflushed bytes.

Exam-trap caption mode adds: *Copy on write does not save you here. The bytes are only shared until one side writes, and flushing is a write.*

**2:46–2:53** — Three forks give eight processes, so the bytes are written eight times. Line buffered, the same program writes them once.

> Caption: Three forks give eight processes, so the five bytes are written eight times. Line buffered, the same program writes them once.

Exam-trap caption mode adds: *The output is not duplicated because fork copies output. It is duplicated because the output had not been sent yet.*

**2:53–3:00** — Flush before forking: end the line, or call fflush. A newline is enough only when the stream is line buffered.

> Caption: The fix is to flush before forking: end the line, or call fflush. A newline alone is enough only when the stream is line buffered.

Exam-trap caption mode adds: *Adding a newline fixes the terminal case and not the redirected case. Only fflush fixes both.*

## Scene 7. The four calls that run a program

*3:00 – 3:30 · objective: Read fork, exec, exit and wait as one protocol, and say which of them blocks, which returns, and which never returns.*

**3:00–3:08** — A shell forks, the child execs, the child exits, and the parent waits. Four calls, one protocol.

> Caption: A shell runs a program in four calls: fork to make a process, exec to put the program in it, exit when it ends, wait to collect it.

Exam-trap caption mode adds: *fork alone cannot run another program, and exec alone cannot create a second process. The pair is the mechanism.*

**3:08–3:16** — execve replaces the memory image with a new program and never returns on success. The process identifier does not change.

> Caption: execve replaces the memory image with a new program and does not return on success. The process identifier is unchanged.

Exam-trap caption mode adds: *Code written after a successful exec never runs. That is not a bug; there is no old program left to run it.*

**3:16–3:23** — A child that exits and is not waited for stays a zombie. wait collects the status and frees the slot, and the exit value is the low eight bits.

> Caption: A child that exits but is not waited for stays a zombie. wait collects the status and frees the slot; the status keeps its low eight bits.

Exam-trap caption mode adds: *exit 256 is not distinguishable from exit 0. The kernel keeps eight bits, so 256 and 512 both report 0.*

**3:23–3:30** — The 2024 loop prints fourteen times. wait changes the order of the prints and never their number.

> Caption: GATE CSE 2024 Set 1: the loop with fork, printf and wait prints 14 times. wait changes the order, never the count.

Exam-trap caption mode adds: *Candidates who treat wait as a filter answer 8, the process count. The question asks for executions of printf.*

## Scene 8. What exec throws away and what it keeps

*3:30 – 4:00 · objective: Sort the process attributes into the ones execve replaces and the ones it preserves, with the caught-signal rule as the sharp edge.*

**3:30–3:38** — exec replaces the program image and resets caught signal handlers to their defaults, along with mappings, timers and exit handlers.

> Caption: exec throws away the program: text, data, heap and stack are replaced, and the caught signal handlers go back to their defaults.

Exam-trap caption mode adds: *A handler set to be ignored stays ignored across exec, while a handler set to be caught is reset. The two dispositions behave differently.*

**3:38–3:46** — The identifier, the open descriptors, the working directory, the umask, the limits and the identity all survive exec.

> Caption: What survives: the identifier, the parent identifier, the open descriptors, the working directory, the umask, the limits and the identity.

Exam-trap caption mode adds: *The environment is passed, not inherited. execve takes it as a third argument, so a program can be given a different one.*

**3:46–3:53** — An ignored signal stays ignored across exec. A caught one is reset to the default, because its handler no longer exists.

> Caption: The sharp edge: ignored signals stay ignored, caught signals are reset. That asymmetry is a favourite question.

Exam-trap caption mode adds: *The default disposition of most signals is not "ignore" but the action itself, such as terminating. Only SIG_IGN is inherited.*

**3:53–4:00** — The descriptor table survives exec, which is how a redirection set up before exec still works after it.

> Caption: And the descriptor table survives, which is how a redirection set up before exec still works after it. That is the next scene.

Exam-trap caption mode adds: *This is the mechanism behind the shell operator, not a special feature of the shell.*

## Scene 9. File descriptors: copied by fork, kept by exec

*4:00 – 4:30 · objective: Separate the descriptor table from the open file description, and use the shared offset to answer a read question exactly.*

**4:00–4:08** — A descriptor indexes the process table. The entry points at an open file description in the kernel, which holds the offset.

> Caption: Two levels: the descriptor table belongs to the process, the open file description belongs to the kernel and holds the offset.

Exam-trap caption mode adds: *The offset is in the description, not in the descriptor. That one sentence decides every shared-offset question.*

**4:08–4:16** — fork copies the table but not the descriptions, so the parent reads the first four bytes and the child reads the next four.

> Caption: fork copies the table but not the descriptions. Both processes read through the same description, so the offsets go 4 then 8.

Exam-trap caption mode adds: *The child does not start at the beginning. The offset is shared, so the child continues where the parent stopped.*

**4:16–4:23** — Two separate opens make two descriptions with independent offsets. Same file, different question.

> Caption: Two separate open calls make two descriptions, and then each has its own offset from zero. Same file, different question.

Exam-trap caption mode adds: *The rule is about the description, not the file. Two opens of one file do not share an offset.*

**4:23–4:30** — exec keeps every descriptor unless it was marked close-on-exec, and dup2 is how a shell points descriptor one at a file.

> Caption: exec keeps every descriptor unless it was marked close-on-exec, and dup2 is how a shell makes descriptor 1 point at a file.

Exam-trap caption mode adds: *A descriptor that is closed on exec is closed in the new program only. The parent still has its own copy.*

## Scene 10. Counting with wait, and the four traps

*4:30 – 5:00 · objective: Run the 2024 Set 1 loop, show that wait changes the order and not the count, and close on the traps worth memorising.*

**4:30–4:38** — The model runs the loop: populations of two, four and eight, every process printing once, for fourteen executions in eight processes.

> Caption: Run the 2024 program as a model: three iterations, populations of 2, 4 and 8, every one printing once, for 14 executions in 8 processes.

Exam-trap caption mode adds: *Fourteen is not the process count and eight is not the print count. The question names one of them.*

**4:38–4:45** — Four traps: printf is not a system call, the trap instruction is not privileged, wait changes order and not count, and a shared description shares its offset.

> Caption: Four traps: printf is not a system call, the trap instruction is not privileged, wait changes order not count, and a shared description shares its offset.

Exam-trap caption mode adds: *If a question needs a number you cannot derive, derive it from the description first: descriptors, descriptions, and the process tree.*

**4:45–4:53** — Name the call, name its mode, then ask what it changes and what it leaves alone.

> Caption: The procedure for any question here: name the call, name its mode, then ask what the call changes and what it leaves alone.

Exam-trap caption mode adds: *The three questions are ordered. Answering what changes before naming the call is how people confuse exec with fork.*

**4:53–5:00** — One boundary, four calls and two tables. Everything else is a consequence of those.

> Caption: One boundary, four calls and two tables explain the whole topic. Everything else on this page is a consequence.

Exam-trap caption mode adds: *The revision tab is one screen. If a fact is not on it, it is a consequence and can be rebuilt.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
