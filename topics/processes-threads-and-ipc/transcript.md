# Processes, Threads and IPC — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/processes-threads-and-ipc/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A program is a file, a process is a run

*0:00 – 0:30 · objective: Separate a program from a process, and name the three things a process is made of: an address space, an execution context and a kernel record.*

**0:00–0:07** — A program is a file on disk. A process is that file being executed.

> Caption: A program is a file on disk. A process is that file being executed.

Exam-trap caption mode adds: *Answering "a program in memory" as if that were enough. Two runs of one program are two processes, and a process needs a program counter as well as bytes.*

**0:07–0:15** — Run one program twice and you have two processes with two separate address spaces.

> Caption: Run one program twice and you have two processes with two separate address spaces.

Exam-trap caption mode adds: *Assuming two processes running the same code share data because they share the code. The code segment may be shared read-only; the data is not.*

**0:15–0:22** — So a process is three things: an address space, an execution context, and a record of it.

> Caption: So a process is three things: an address space, an execution context, and a record of it.

Exam-trap caption mode adds: *Treating the PCB as the process. The PCB is the kernel's note about the process; the address space is the process's memory, and the two are different objects.*

**0:22–0:30** — The execution context lives in registers while running, and in the PCB while not.

> Caption: The execution context lives in registers while running, and in the PCB while not.

Exam-trap caption mode adds: *Thinking the PCB holds the code or the variables. It holds the state needed to resume, plus accounting, not the program's data.*

## Scene 2. Five states and the edges that exist

*0:30 – 1:00 · objective: Draw the process state machine and name the two edges that do not exist, with the reason each is missing.*

**0:30–0:37** — Five states, and only some of the edges between them exist.

> Caption: Five states, and only some of the edges between them exist.

Exam-trap caption mode adds: *Reading the diagram as a flow chart of a single process. Several processes sit in the ready and blocked states at the same time.*

**0:37–0:45** — Ready means waiting for the CPU. Blocked means waiting for an event, not for the CPU.

> Caption: Ready means waiting for the CPU. Blocked means waiting for an event, not for the CPU.

Exam-trap caption mode adds: *Calling a blocked process "waiting for the CPU". It is not competing for the CPU at all, which is why waking it must put it in the ready queue.*

**0:45–0:52** — The edge that does not exist is blocked to running: a woken process joins the ready queue first.

> Caption: The edge that does not exist is blocked to running: a woken process joins the ready queue first.

Exam-trap caption mode adds: *Drawing blocked to running because "the event happened, so it runs". Between the event and the CPU there is always a queue and a scheduler.*

**0:52–1:00** — Ready to blocked is also missing, because only a running process can ask for something.

> Caption: Ready to blocked is also missing, because only a running process can ask for something.

Exam-trap caption mode adds: *Accepting "a ready process was preempted into blocked". Preemption always lands in ready; blocking is voluntary and starts from running.*

## Scene 3. The context switch and its cost

*1:00 – 1:30 · objective: Read a context switch as a save plus a load, say what is saved, and compute the fraction of CPU time a switch costs.*

**1:00–1:07** — A context switch is a save and a load, and no user instruction retires during either.

> Caption: A context switch is a save and a load, and no user instruction retires during either.

Exam-trap caption mode adds: *Counting a context switch as useful work in a CPU utilisation figure. It is the opposite: it is the reason utilisation is below one hundred per cent.*

**1:07–1:15** — What is saved is the execution context: program counter, stack pointer, general registers.

> Caption: What is saved is the execution context: program counter, stack pointer, general registers.

Exam-trap caption mode adds: *Saving the page table base register on a thread-to-thread switch. The address space did not change, so there is nothing to change.*

**1:15–1:22** — A process switch also changes the address space, so the translation cache is invalidated.

> Caption: A process switch also changes the address space, so the translation cache is invalidated.

Exam-trap caption mode adds: *Assuming the register save dominates. On real hardware the address-space change and the cold cache afterwards usually cost more.*

**1:22–1:30** — With a 10 ms quantum and a 0.1 ms switch, 0.99 per cent of the time is spent switching.

> Caption: With a 10 ms quantum and a 0.1 ms switch, 0.99 per cent of the time is spent switching.

Exam-trap caption mode adds: *Dividing by the quantum alone. The cycle length is the quantum plus the switch, so the denominator must include the switch.*

## Scene 4. fork: one call, two returns

*1:30 – 2:00 · objective: Explain why one call returns twice with two different values, and why the two copies share virtual addresses but not memory.*

**1:30–1:37** — fork makes a copy of the calling process, and both copies return from the same call.

> Caption: fork makes a copy of the calling process, and both copies return from the same call.

Exam-trap caption mode adds: *Saying the child starts the program again from the beginning. It resumes after the fork, with a copy of the parent's state.*

**1:37–1:45** — The child receives 0. The parent receives the child's process identifier.

> Caption: The child receives 0. The parent receives the child's process identifier.

Exam-trap caption mode adds: *Reading the parent branch as "the parent is process 0". The parent gets a positive number; only the child gets zero.*

**1:45–1:52** — Each copy has its own memory, so a write in one is invisible in the other.

> Caption: Each copy has its own memory, so a write in one is invisible in the other.

Exam-trap caption mode adds: *Expecting a child's assignment to be visible in the parent. Only a shared region created on purpose, such as shared memory, behaves that way.*

**1:52–2:00** — But both copies print the same address, because the copy keeps the same virtual layout.

> Caption: But both copies print the same address, because the copy keeps the same virtual layout.

Exam-trap caption mode adds: *Concluding that equal printed addresses mean shared memory. Virtual addresses are per address space, so equality proves nothing about sharing.*

## Scene 5. Counting the processes

*2:00 – 2:30 · objective: Turn a fork sequence into a count by drawing the process tree, and separate the number of processes from the number of prints.*

**2:00–2:07** — Three sequential forks: every process that exists runs the next fork.

> Caption: Three sequential forks: every process that exists runs the next fork.

Exam-trap caption mode adds: *Counting one child per fork call. The call is executed by every process alive at that moment, not just by the original parent.*

**2:07–2:15** — The count doubles each time: one, two, four, eight. So seven children and eight processes.

> Caption: The count doubles each time: one, two, four, eight. So seven children and eight processes.

Exam-trap caption mode adds: *Answering 8 when the question asks for child processes. The original parent is not a child, so subtract one.*

**2:15–2:22** — A fork inside a loop that also waits counts prints, not processes: two, four, eight, total 14.

> Caption: A fork inside a loop that also waits counts prints, not processes: two, four, eight, total 14.

Exam-trap caption mode adds: *Reporting the number of processes when the question asks how many times a statement executes. Here the statement runs once per process per iteration.*

**2:22–2:30** — So draw the tree and count the nodes. Never guess the power.

> Caption: So draw the tree and count the nodes. Never guess the power.

Exam-trap caption mode adds: *Assuming wait reduces the count. It changes the order of execution and can bound how many processes are alive, not how many prints happen.*

## Scene 6. Threads: what is shared and what is not

*2:30 – 3:00 · objective: Split the process resources into the shared column and the private column, and say what each column costs.*

**2:30–2:37** — A thread is a second execution context inside one process.

> Caption: A thread is a second execution context inside one process.

Exam-trap caption mode adds: *Calling threads "lightweight processes" and then treating them as processes. The saving is precisely that the address space is not duplicated.*

**2:37–2:45** — Shared: code, global data, heap, open files and the address space itself.

> Caption: Shared: code, global data, heap, open files and the address space itself.

Exam-trap caption mode adds: *Believing each thread has its own heap because it has its own stack. The heap belongs to the process.*

**2:45–2:52** — Private: program counter, registers, stack, and the thread's own identifier and state.

> Caption: Private: program counter, registers, stack, and the thread's own identifier and state.

Exam-trap caption mode adds: *Adding the stack to the shared column because "the stack is part of the process". The process has a stack area, but each thread gets its own stack inside it.*

**2:52–3:00** — So threads communicate for free and must synchronise; processes are isolated and must use IPC.

> Caption: So threads communicate for free and must synchronise; processes are isolated and must use IPC.

Exam-trap caption mode adds: *Thinking threads remove the need for synchronisation because they are "in the same program". Sharing is exactly what creates the need.*

## Scene 7. User-level against kernel-level threads

*3:00 – 3:30 · objective: Say who schedules each kind of thread, what happens when one blocks, and why one switch is cheaper than the other.*

**3:00–3:07** — A user-level thread is created and scheduled by a library; the kernel sees one process.

> Caption: A user-level thread is created and scheduled by a library; the kernel sees one process.

Exam-trap caption mode adds: *Assuming the kernel can run user-level threads on two cores at once. It sees one execution unit, so it cannot.*

**3:07–3:15** — If one user-level thread blocks in a system call, the kernel blocks the whole process.

> Caption: If one user-level thread blocks in a system call, the kernel blocks the whole process.

Exam-trap caption mode adds: *Believing a blocking call in one user thread lets the others continue. It does not, which is why the 2014 paper marks that statement true.*

**3:15–3:22** — Kernel threads are scheduled by the kernel, so one blocking thread does not stop the others.

> Caption: Kernel threads are scheduled by the kernel, so one blocking thread does not stop the others.

Exam-trap caption mode adds: *Concluding that kernel threads are always better. They are better for blocking and parallelism, worse for switch cost and for volume of threads.*

**3:22–3:30** — Kernel threads of one process still share its code, so the 2014 statement is the false one.

> Caption: Kernel threads of one process still share its code, so the 2014 statement is the false one.

Exam-trap caption mode adds: *Mixing up "separate execution" with "separate memory". Kernel threads are separately scheduled, not separately addressed.*

## Scene 8. Two models of inter-process communication

*3:30 – 4:00 · objective: Contrast shared memory with message passing on speed, on what the kernel does, and on who is responsible for synchronisation.*

**3:30–3:37** — Shared memory: the kernel maps one region into both address spaces, once.

> Caption: Shared memory: the kernel maps one region into both address spaces, once.

Exam-trap caption mode adds: *Thinking each message through shared memory costs a system call. Only the setup does; the transfers are ordinary memory accesses.*

**3:37–3:45** — Because nothing is copied, the processes themselves must agree when a write is finished.

> Caption: Because nothing is copied, the processes themselves must agree when a write is finished.

Exam-trap caption mode adds: *Choosing shared memory for a problem where the two sides are written by different teams. The protocol becomes the hard part.*

**3:45–3:52** — Message passing: no shared region. Send and receive copy through the kernel.

> Caption: Message passing: no shared region. Send and receive copy through the kernel.

Exam-trap caption mode adds: *Saying message passing is always slower. For small messages and for machines that are not co-located, the copy is cheaper than a badly written shared protocol.*

**3:52–4:00** — Message passing can block instead of synchronise, and its buffer size is the parameter that matters.

> Caption: Message passing can block instead of synchronise, and its buffer size is the parameter that matters.

Exam-trap caption mode adds: *Forgetting that the capacity is a property of the channel. "Unbounded" is a modelling assumption, never a real buffer.*

## Scene 9. Pipes, signals, sockets, queues

*4:00 – 4:30 · objective: Match each IPC mechanism to what it carries and who may use it, and see why a pipe preserves bytes but not message boundaries.*

**4:00–4:07** — A pipe is a one-way byte stream between two processes, buffered by the kernel.

> Caption: A pipe is a one-way byte stream between two processes, buffered by the kernel.

Exam-trap caption mode adds: *Expecting a pipe to be two-way. An ordinary pipe carries data in one direction; the other direction needs a second pipe.*

**4:07–4:15** — A pipe preserves bytes, not messages: two writes can be read as one read.

> Caption: A pipe preserves bytes, not messages: two writes can be read as one read.

Exam-trap caption mode adds: *Writing "one write, one read" as a rule. Reads and writes match only in total bytes, never in grouping.*

**4:15–4:22** — A named pipe has a name in the file system, so unrelated processes can open it.

> Caption: A named pipe has a name in the file system, so unrelated processes can open it.

Exam-trap caption mode adds: *Assuming a named pipe keeps messages because it looks like a file. It is a byte stream, exactly like the unnamed one.*

**4:22–4:30** — Signals carry no data; sockets cross machine boundaries; message queues keep boundaries.

> Caption: Signals carry no data; sockets cross machine boundaries; message queues keep boundaries.

Exam-trap caption mode adds: *Choosing a pipe for messages, or a signal for data. Each mechanism fixes what may be carried, and the exam tests the fixing.*

## Scene 10. The recipe and the traps

*4:30 – 5:00 · objective: Reduce every question in this topic to one of three questions, and name the five traps that are built on the edges.*

**4:30–4:37** — Step one: is the question about states, about copies, or about sharing?

> Caption: Step one: is the question about states, about copies, or about sharing?

Exam-trap caption mode adds: *Starting from the options. Reading the stem for its question kind first is faster and less error-prone than testing each option.*

**4:37–4:45** — Step two: for fork draw the tree, for threads split the columns, for states check the edge list.

> Caption: Step two: for fork draw the tree, for threads split the columns, for states check the edge list.

Exam-trap caption mode adds: *Trying to recall a formula for the fork count. The tree gives the answer and shows where a wait or a branch changes it.*

**4:45–4:52** — The traps: blocked to running, children against processes, and a pipe treated as a message channel.

> Caption: The traps: blocked to running, children against processes, and a pipe treated as a message channel.

Exam-trap caption mode adds: *Memorising the list without the reason. Each trap is one edge, one count or one column, and each is checked in the animation panel.*

**4:52–5:00** — One question under all of it: what does this process own, and what does it share?

> Caption: One question under all of it: what does this process own, and what does it share?

Exam-trap caption mode adds: *Treating processes, threads and IPC as three unrelated topics. They are one question about ownership, asked three times.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
