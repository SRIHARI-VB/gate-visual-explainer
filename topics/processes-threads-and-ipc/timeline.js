/* ==========================================================================
   processes-threads-and-ipc - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'program-process',
      n: 1,
      title: 'A program is a file, a process is a run',
      start: 0, end: 30,
      objective: 'Separate a program from a process, and name the three things a process is made of: an address space, an execution context and a kernel record.'
    },
    {
      id: 'states',
      n: 2,
      title: 'Five states and the edges that exist',
      start: 30, end: 60,
      objective: 'Draw the process state machine and name the two edges that do not exist, with the reason each is missing.'
    },
    {
      id: 'switch',
      n: 3,
      title: 'The context switch and its cost',
      start: 60, end: 90,
      objective: 'Read a context switch as a save plus a load, say what is saved, and compute the fraction of CPU time a switch costs.'
    },
    {
      id: 'fork',
      n: 4,
      title: 'fork: one call, two returns',
      start: 90, end: 120,
      objective: 'Explain why one call returns twice with two different values, and why the two copies share virtual addresses but not memory.'
    },
    {
      id: 'counting',
      n: 5,
      title: 'Counting the processes',
      start: 120, end: 150,
      objective: 'Turn a fork sequence into a count by drawing the process tree, and separate the number of processes from the number of prints.'
    },
    {
      id: 'threads',
      n: 6,
      title: 'Threads: what is shared and what is not',
      start: 150, end: 180,
      objective: 'Split the process resources into the shared column and the private column, and say what each column costs.'
    },
    {
      id: 'ult-klt',
      n: 7,
      title: 'User-level against kernel-level threads',
      start: 180, end: 210,
      objective: 'Say who schedules each kind of thread, what happens when one blocks, and why one switch is cheaper than the other.'
    },
    {
      id: 'ipc-models',
      n: 8,
      title: 'Two models of inter-process communication',
      start: 210, end: 240,
      objective: 'Contrast shared memory with message passing on speed, on what the kernel does, and on who is responsible for synchronisation.'
    },
    {
      id: 'ipc-tools',
      n: 9,
      title: 'Pipes, signals, sockets, queues',
      start: 240, end: 270,
      objective: 'Match each IPC mechanism to what it carries and who may use it, and see why a pipe preserves bytes but not message boundaries.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The recipe and the traps',
      start: 270, end: 300,
      objective: 'Reduce every question in this topic to one of three questions, and name the five traps that are built on the edges.'
    }
  ],

  events: [
    /* ---------------- scene 1: program and process ---------------- */
    {
      id: 'pp-1', start: 0, end: 7.5, scene: 'program-process',
      caption: 'A program is a file on disk. A process is that file being executed.',
      detail: 'A program is passive: bytes in a file, doing nothing. A process is the active thing the operating system runs, and it exists only while it is being executed. The word "execution" is doing real work here: it is what turns a file into something with a program counter, a stack and a place in the scheduler.',
      keyword: 'a file on disk',
      trap: 'Answering "a program in memory" as if that were enough. Two runs of one program are two processes, and a process needs a program counter as well as bytes.',
      narration: 'A program is a file on disk. A process is that file being executed.'
    },
    {
      id: 'pp-2', start: 7.5, end: 15, scene: 'program-process',
      caption: 'Run one program twice and you have two processes with two separate address spaces.',
      detail: 'The same executable can be running many times. Each run gets its own copy of the address space, its own heap and stack, its own program counter, and its own process identifier. A write to a variable in one run is invisible in the other, because they are different copies at different physical addresses even though the code is identical.',
      keyword: 'two processes',
      trap: 'Assuming two processes running the same code share data because they share the code. The code segment may be shared read-only; the data is not.',
      narration: 'Run one program twice and you have two processes with two separate address spaces.'
    },
    {
      id: 'pp-3', start: 15, end: 22.5, scene: 'program-process',
      caption: 'So a process is three things: an address space, an execution context, and a record of it.',
      detail: 'The address space holds code, global data, heap and stack. The execution context is what the CPU is holding at any instant: the program counter, the stack pointer and the general registers. The record is the kernel structure that survives while the process is not running, which is the process control block, or PCB.',
      keyword: 'three things',
      trap: 'Treating the PCB as the process. The PCB is the kernel\'s note about the process; the address space is the process\'s memory, and the two are different objects.',
      narration: 'So a process is three things: an address space, an execution context, and a record of it.'
    },
    {
      id: 'pp-4', start: 22.5, end: 30, scene: 'program-process',
      caption: 'The execution context lives in registers while running, and in the PCB while not.',
      detail: 'That sentence is the whole reason a context switch is possible. While a process runs, its program counter and registers are in the CPU. When it stops running, the same values are written into its PCB. Restoring them is what "resuming" means, and it is exactly why the PCB must be per process rather than per system.',
      keyword: 'registers or the PCB',
      trap: 'Thinking the PCB holds the code or the variables. It holds the state needed to resume, plus accounting, not the program\'s data.',
      narration: 'The execution context lives in registers while running, and in the PCB while not.'
    },

    /* ---------------- scene 2: the five states ---------------- */
    {
      id: 'st-1', start: 30, end: 37.5, scene: 'states',
      caption: 'Five states, and only some of the edges between them exist.',
      detail: 'New is being created. Ready is able to run but not currently on the CPU. Running is executing on the CPU. Blocked, also called waiting, is unable to run because it is waiting for an event such as I/O completion. Terminated is finished. A state diagram is a set of states plus a set of legal edges, and the exam asks about the edges.',
      keyword: 'five states',
      trap: 'Reading the diagram as a flow chart of a single process. Several processes sit in the ready and blocked states at the same time.',
      narration: 'Five states, and only some of the edges between them exist.'
    },
    {
      id: 'st-2', start: 37.5, end: 45, scene: 'states',
      caption: 'Ready means waiting for the CPU. Blocked means waiting for an event, not for the CPU.',
      detail: 'This one distinction settles most state questions. A ready process is runnable: if the scheduler picked it now, it could execute. A blocked process cannot execute even if the CPU were free, because the thing it needs has not happened yet. So the ready queue is ordered by policy, and the blocked set is ordered by events.',
      keyword: 'waiting for the CPU',
      trap: 'Calling a blocked process "waiting for the CPU". It is not competing for the CPU at all, which is why waking it must put it in the ready queue.',
      narration: 'Ready means waiting for the CPU. Blocked means waiting for an event, not for the CPU.'
    },
    {
      id: 'st-3', start: 45, end: 52.5, scene: 'states',
      caption: 'The edge that does not exist is blocked to running: a woken process joins the ready queue first.',
      detail: 'When the event a blocked process waited for finally happens, the operating system cannot simply run it. The CPU may be busy, and the scheduler must still choose. So the process moves to ready, and only the scheduler may move it from ready to running. That is the reason blocked to running is absent from every correct diagram.',
      keyword: 'blocked to running',
      trap: 'Drawing blocked to running because "the event happened, so it runs". Between the event and the CPU there is always a queue and a scheduler.',
      narration: 'The edge that does not exist is blocked to running: a woken process joins the ready queue first.'
    },
    {
      id: 'st-4', start: 52.5, end: 60, scene: 'states',
      caption: 'Ready to blocked is also missing, because only a running process can ask for something.',
      detail: 'Blocking is something a process does to itself: it issues a request, and the request cannot be satisfied now. Issuing an instruction requires the CPU, so the process must be running when it blocks. Hence ready to blocked is not an edge. Note the asymmetry with preemption: running to ready needs no cooperation, because the timer interrupt can take the CPU away.',
      keyword: 'ready to blocked',
      trap: 'Accepting "a ready process was preempted into blocked". Preemption always lands in ready; blocking is voluntary and starts from running.',
      narration: 'Ready to blocked is also missing, because only a running process can ask for something.'
    },

    /* ---------------- scene 3: the context switch ---------------- */
    {
      id: 'sw-1', start: 60, end: 67.5, scene: 'switch',
      caption: 'A context switch is a save and a load, and no user instruction retires during either.',
      detail: 'The kernel writes the outgoing process\'s execution context into its PCB, then reads the incoming process\'s context out of its PCB. Both operations are bookkeeping. Every microsecond spent in them is a microsecond in which the CPU does no work for any user program, which is why the switch is called pure overhead.',
      keyword: 'pure overhead',
      trap: 'Counting a context switch as useful work in a CPU utilisation figure. It is the opposite: it is the reason utilisation is below one hundred per cent.',
      narration: 'A context switch is a save and a load, and no user instruction retires during either.'
    },
    {
      id: 'sw-2', start: 67.5, end: 75, scene: 'switch',
      caption: 'What is saved is the execution context: program counter, stack pointer, general registers.',
      detail: 'Those three are the minimum that lets execution resume exactly where it stopped. The 2023 paper makes the point by offering the page table base register as a fourth candidate: for a switch between two threads of one process it is not saved, because both threads share the same page table, so the register already holds the right value.',
      keyword: 'program counter, stack pointer, registers',
      trap: 'Saving the page table base register on a thread-to-thread switch. The address space did not change, so there is nothing to change.',
      narration: 'What is saved is the execution context: program counter, stack pointer, general registers.'
    },
    {
      id: 'sw-3', start: 75, end: 82.5, scene: 'switch',
      caption: 'A process switch also changes the address space, so the translation cache is invalidated.',
      detail: 'Addresses are translated by the memory management unit using a page table, and the translations it has cached are only valid for one address space. When the incoming process has a different page table, those cached translations must be discarded. That extra step, not the register save, is what makes a process switch more expensive than a thread switch.',
      keyword: 'translation cache',
      trap: 'Assuming the register save dominates. On real hardware the address-space change and the cold cache afterwards usually cost more.',
      narration: 'A process switch also changes the address space, so the translation cache is invalidated.'
    },
    {
      id: 'sw-4', start: 82.5, end: 90, scene: 'switch',
      caption: 'With a 10 ms quantum and a 0.1 ms switch, 0.99 per cent of the time is spent switching.',
      detail: 'The fraction is the switch cost divided by the quantum plus the switch cost: 0.1 divided by 10.1, which is 0.0099, or 0.99 per cent. Shorten the quantum to 1 ms and the same switch costs 9.09 per cent. This is the arithmetic reason a very small time slice destroys throughput even though it improves response time.',
      keyword: 'switch cost over quantum',
      trap: 'Dividing by the quantum alone. The cycle length is the quantum plus the switch, so the denominator must include the switch.',
      narration: 'With a 10 ms quantum and a 0.1 ms switch, 0.99 per cent of the time is spent switching.'
    },

    /* ---------------- scene 4: fork ---------------- */
    {
      id: 'fk-1', start: 90, end: 97.5, scene: 'fork',
      caption: 'fork makes a copy of the calling process, and both copies return from the same call.',
      detail: 'The child is a duplicate of the parent at the moment of the call: same code, same data, same open files, same position in the program. Execution continues in both, from the instruction after the call. That is why one call appears to return twice, once in each process, and why every statement after it runs twice unless the code branches.',
      keyword: 'both copies return',
      trap: 'Saying the child starts the program again from the beginning. It resumes after the fork, with a copy of the parent\'s state.',
      narration: 'fork makes a copy of the calling process, and both copies return from the same call.'
    },
    {
      id: 'fk-2', start: 97.5, end: 105, scene: 'fork',
      caption: 'The child receives 0. The parent receives the child\'s process identifier.',
      detail: 'The two different return values are the only way the code can tell which copy it is running in. Zero is not a valid process identifier, so it can safely mark the child. The parent\'s value is positive, which lets it name the child later for waiting or signalling. A negative return means the fork failed and no child exists.',
      keyword: 'zero in the child',
      trap: 'Reading the parent branch as "the parent is process 0". The parent gets a positive number; only the child gets zero.',
      narration: 'The child receives 0. The parent receives the child\'s process identifier.'
    },
    {
      id: 'fk-3', start: 105, end: 112.5, scene: 'fork',
      caption: 'Each copy has its own memory, so a write in one is invisible in the other.',
      detail: 'The copy is a copy, not a view. If the parent sets a variable to 5 and the child sets the same variable to 15, neither sees the other\'s value, and both survive. Implementations usually postpone the copy until the first write, which is called copy on write, but the observable rule is the same: after the fork, the two address spaces are independent.',
      keyword: 'its own memory',
      trap: 'Expecting a child\'s assignment to be visible in the parent. Only a shared region created on purpose, such as shared memory, behaves that way.',
      narration: 'Each copy has its own memory, so a write in one is invisible in the other.'
    },
    {
      id: 'fk-4', start: 112.5, end: 120, scene: 'fork',
      caption: 'But both copies print the same address, because the copy keeps the same virtual layout.',
      detail: 'This is the 2005 question. A parent that subtracts 5 and a child that adds 5 print values ten apart, and they print the same address for the variable, because the address printed is a virtual address and the child is a copy of the parent\'s address space at the same virtual addresses. The physical locations differ; the printed numbers do not.',
      keyword: 'same virtual address',
      trap: 'Concluding that equal printed addresses mean shared memory. Virtual addresses are per address space, so equality proves nothing about sharing.',
      narration: 'But both copies print the same address, because the copy keeps the same virtual layout.'
    },

    /* ---------------- scene 5: counting ---------------- */
    {
      id: 'ct-1', start: 120, end: 127.5, scene: 'counting',
      caption: 'Three sequential forks: every process that exists runs the next fork.',
      detail: 'The counting rule is not about the number of calls; it is about who executes each call. After the first fork there are two processes, and both reach the second fork, so each creates a child and the population doubles to four. All four reach the third fork, and the population doubles again to eight.',
      keyword: 'every process runs the next',
      trap: 'Counting one child per fork call. The call is executed by every process alive at that moment, not just by the original parent.',
      narration: 'Three sequential forks: every process that exists runs the next fork.'
    },
    {
      id: 'ct-2', start: 127.5, end: 135, scene: 'counting',
      caption: 'The count doubles each time: one, two, four, eight. So seven children and eight processes.',
      detail: 'After n sequential fork calls there are 2 to the power n processes, counting the original. The number of children created is one less, 2 to the power n minus 1. With n equal to three that is eight processes and seven children, which is the answer the 2012 paper asks for. Read the question: "child processes created" and "processes" differ by exactly one.',
      keyword: 'two to the power n',
      trap: 'Answering 8 when the question asks for child processes. The original parent is not a child, so subtract one.',
      narration: 'The count doubles each time: one, two, four, eight. So seven children and eight processes.'
    },
    {
      id: 'ct-3', start: 135, end: 142.5, scene: 'counting',
      caption: 'A fork inside a loop that also waits counts prints, not processes: two, four, eight, total 14.',
      detail: 'The 2024 question has a loop with fork, print and wait. In the first iteration one process forks, so two processes print. In the second, both of those fork, so four print. In the third, all four fork, so eight print. The prints are two plus four plus eight, which is 14, while the number of distinct processes is eight. Two different counts, both correct, answering two different questions.',
      keyword: 'prints are not processes',
      trap: 'Reporting the number of processes when the question asks how many times a statement executes. Here the statement runs once per process per iteration.',
      narration: 'A fork inside a loop that also waits counts prints, not processes: two, four, eight, total 14.'
    },
    {
      id: 'ct-4', start: 142.5, end: 150, scene: 'counting',
      caption: 'So draw the tree and count the nodes. Never guess the power.',
      detail: 'A process tree makes the two counts visible at once: nodes are processes, and a mark on each node for each time it executes the printing statement gives the print count. The tree also shows where wait changes the order without changing the total, which is exactly the trap in the 2024 question.',
      keyword: 'draw the tree',
      trap: 'Assuming wait reduces the count. It changes the order of execution and can bound how many processes are alive, not how many prints happen.',
      narration: 'So draw the tree and count the nodes. Never guess the power.'
    },

    /* ---------------- scene 6: threads ---------------- */
    {
      id: 'th-1', start: 150, end: 157.5, scene: 'threads',
      caption: 'A thread is a second execution context inside one process.',
      detail: 'If a process is an address space plus an execution context, a thread is what you get by keeping the address space and adding another execution context. Three threads in one process are three program counters, three stacks and three register sets, all pointed at the same code and the same heap.',
      keyword: 'a second execution context',
      trap: 'Calling threads "lightweight processes" and then treating them as processes. The saving is precisely that the address space is not duplicated.',
      narration: 'A thread is a second execution context inside one process.'
    },
    {
      id: 'th-2', start: 157.5, end: 165, scene: 'threads',
      caption: 'Shared: code, global data, heap, open files and the address space itself.',
      detail: 'Everything that belongs to the process rather than to an execution belongs to all its threads. That is why one thread can hand a pointer to another with no kernel involvement, and why a malloc in one thread is visible in the rest. It is also why the 2017 paper accepts the address space as the only shared item in its list.',
      keyword: 'code, data, heap, files',
      trap: 'Believing each thread has its own heap because it has its own stack. The heap belongs to the process.',
      narration: 'Shared: code, global data, heap, open files and the address space itself.'
    },
    {
      id: 'th-3', start: 165, end: 172.5, scene: 'threads',
      caption: 'Private: program counter, registers, stack, and the thread\'s own identifier and state.',
      detail: 'A thread needs its own program counter to be at a different place in the code, its own registers to hold different intermediate values, and its own stack to hold a different chain of calls. Everything in that list is per execution, not per process, which is exactly the split the 2017 paper tests with its four-item list.',
      keyword: 'private: PC, registers, stack',
      trap: 'Adding the stack to the shared column because "the stack is part of the process". The process has a stack area, but each thread gets its own stack inside it.',
      narration: 'Private: program counter, registers, stack, and the thread\'s own identifier and state.'
    },
    {
      id: 'th-4', start: 172.5, end: 180, scene: 'threads',
      caption: 'So threads communicate for free and must synchronise; processes are isolated and must use IPC.',
      detail: 'Two consequences follow from one column split. Because threads share, communicating costs a memory write, and the price is that concurrent writes can interleave, so the program must synchronise. Because processes do not share, the isolation is free but communication needs a mechanism the kernel provides. That mechanism is the next scene.',
      keyword: 'free to share, must synchronise',
      trap: 'Thinking threads remove the need for synchronisation because they are "in the same program". Sharing is exactly what creates the need.',
      narration: 'So threads communicate for free and must synchronise; processes are isolated and must use IPC.'
    },

    /* ---------------- scene 7: user against kernel threads ---------------- */
    {
      id: 'uk-1', start: 180, end: 187.5, scene: 'ult-klt',
      caption: 'A user-level thread is created and scheduled by a library; the kernel sees one process.',
      detail: 'With user-level threads the thread table lives in the process, and the switch between two of them is a function call inside the library: save some registers, restore some registers, return. The kernel is not involved and does not know the threads exist. That is why the 2014 paper calls them not scheduled by the kernel, and calls their switch faster.',
      keyword: 'the kernel sees one process',
      trap: 'Assuming the kernel can run user-level threads on two cores at once. It sees one execution unit, so it cannot.',
      narration: 'A user-level thread is created and scheduled by a library; the kernel sees one process.'
    },
    {
      id: 'uk-2', start: 187.5, end: 195, scene: 'ult-klt',
      caption: 'If one user-level thread blocks in a system call, the kernel blocks the whole process.',
      detail: 'The kernel blocks the only execution unit it knows about, so every thread in that process stops, even the ones that could have run. This is the price of keeping the kernel ignorant. The same ignorance is what prevents parallelism on a multi-core machine: one unit cannot be on two cores.',
      keyword: 'blocks the whole process',
      trap: 'Believing a blocking call in one user thread lets the others continue. It does not, which is why the 2014 paper marks that statement true.',
      narration: 'If one user-level thread blocks in a system call, the kernel blocks the whole process.'
    },
    {
      id: 'uk-3', start: 195, end: 202.5, scene: 'ult-klt',
      caption: 'Kernel threads are scheduled by the kernel, so one blocking thread does not stop the others.',
      detail: 'Each kernel thread is a separate schedulable entity with its own entry in the kernel\'s tables. A blocking call blocks only that thread, and the scheduler can place two of them on two cores at the same time. The cost is that creating and switching them requires entering the kernel, so the switch is slower than a library switch.',
      keyword: 'separate schedulable entity',
      trap: 'Concluding that kernel threads are always better. They are better for blocking and parallelism, worse for switch cost and for volume of threads.',
      narration: 'Kernel threads are scheduled by the kernel, so one blocking thread does not stop the others.'
    },
    {
      id: 'uk-4', start: 202.5, end: 210, scene: 'ult-klt',
      caption: 'Kernel threads of one process still share its code, so the 2014 statement is the false one.',
      detail: 'The 2014 paper asks which statement is false and offers "kernel level threads cannot share the code segment". That is the false one: threads of a process share the code segment whatever level they are implemented at, because the code belongs to the process. The other three statements in that question are true, which is what makes this a clean test of the shared and private columns.',
      keyword: 'code is shared at both levels',
      trap: 'Mixing up "separate execution" with "separate memory". Kernel threads are separately scheduled, not separately addressed.',
      narration: 'Kernel threads of one process still share its code, so the 2014 statement is the false one.'
    },

    /* ---------------- scene 8: two models of IPC ---------------- */
    {
      id: 'ip-1', start: 210, end: 217.5, scene: 'ipc-models',
      caption: 'Shared memory: the kernel maps one region into both address spaces, once.',
      detail: 'The operating system creates a region and installs it in both page tables, so both processes see the same physical pages at addresses of their choosing. After that setup, a write by one process is a write the other can read, with no system call at all. That is why shared memory is the fastest of the mechanisms the syllabus names.',
      keyword: 'mapped into both',
      trap: 'Thinking each message through shared memory costs a system call. Only the setup does; the transfers are ordinary memory accesses.',
      narration: 'Shared memory: the kernel maps one region into both address spaces, once.'
    },
    {
      id: 'ip-2', start: 217.5, end: 225, scene: 'ipc-models',
      caption: 'Because nothing is copied, the processes themselves must agree when a write is finished.',
      detail: 'The kernel is out of the loop, so it cannot tell whether the reader has seen the data or the writer has overwritten it. The processes must use a protocol, built from primitives such as semaphores or locks. So shared memory trades kernel help for program responsibility, and that trade is the reason the same topic contains both this scene and the synchronisation lesson.',
      keyword: 'they must synchronise',
      trap: 'Choosing shared memory for a problem where the two sides are written by different teams. The protocol becomes the hard part.',
      narration: 'Because nothing is copied, the processes themselves must agree when a write is finished.'
    },
    {
      id: 'ip-3', start: 225, end: 232.5, scene: 'ipc-models',
      caption: 'Message passing: no shared region. Send and receive copy through the kernel.',
      detail: 'Here the kernel owns a buffer, and a send copies data in while a receive copies it out. The processes need not share any address space, which is what makes this model usable across a network as well as inside one machine. The price is two copies and two system calls per message.',
      keyword: 'copy in, copy out',
      trap: 'Saying message passing is always slower. For small messages and for machines that are not co-located, the copy is cheaper than a badly written shared protocol.',
      narration: 'Message passing: no shared region. Send and receive copy through the kernel.'
    },
    {
      id: 'ip-4', start: 232.5, end: 240, scene: 'ipc-models',
      caption: 'Message passing can block instead of synchronise, and its buffer size is the parameter that matters.',
      detail: 'With zero buffering the sender must wait until the receiver actually receives, which is called a rendezvous. With a bounded buffer of k messages the sender may run ahead by k and then blocks. With unbounded buffering the sender never blocks, which is impossible in a finite machine. Naming the capacity is what makes a message-passing question answerable.',
      keyword: 'zero, bounded, unbounded',
      trap: 'Forgetting that the capacity is a property of the channel. "Unbounded" is a modelling assumption, never a real buffer.',
      narration: 'Message passing can block instead of synchronise, and its buffer size is the parameter that matters.'
    },

    /* ---------------- scene 9: the mechanisms ---------------- */
    {
      id: 'it-1', start: 240, end: 247.5, scene: 'ipc-tools',
      caption: 'A pipe is a one-way byte stream between two processes, buffered by the kernel.',
      detail: 'Writing appends bytes to a buffer, reading removes them from the front, and the kernel keeps them in order. An ordinary pipe is created by one process and inherited by its child, so it connects related processes only. When the writing end closes, a read after the buffer is empty returns end of file rather than blocking forever.',
      keyword: 'one-way byte stream',
      trap: 'Expecting a pipe to be two-way. An ordinary pipe carries data in one direction; the other direction needs a second pipe.',
      narration: 'A pipe is a one-way byte stream between two processes, buffered by the kernel.'
    },
    {
      id: 'it-2', start: 247.5, end: 255, scene: 'ipc-tools',
      caption: 'A pipe preserves bytes, not messages: two writes can be read as one read.',
      detail: 'There are no boundaries in a byte stream, so a reader asking for ten bytes may receive the first two written and the first eight of the next write, with nothing marking the join. Code that needs messages must frame them itself, with a length or a delimiter, or use a mechanism that keeps boundaries such as a message queue.',
      keyword: 'no boundaries',
      trap: 'Writing "one write, one read" as a rule. Reads and writes match only in total bytes, never in grouping.',
      narration: 'A pipe preserves bytes, not messages: two writes can be read as one read.'
    },
    {
      id: 'it-3', start: 255, end: 262.5, scene: 'ipc-tools',
      caption: 'A named pipe has a name in the file system, so unrelated processes can open it.',
      detail: 'An ordinary pipe exists only as two file descriptors inherited from a common ancestor. A named pipe, also called a FIFO, appears as a path, so two programs with no common parent can both open it by name. The data model is unchanged: it is still a one-way byte stream with no message boundaries.',
      keyword: 'a name in the file system',
      trap: 'Assuming a named pipe keeps messages because it looks like a file. It is a byte stream, exactly like the unnamed one.',
      narration: 'A named pipe has a name in the file system, so unrelated processes can open it.'
    },
    {
      id: 'it-4', start: 262.5, end: 270, scene: 'ipc-tools',
      caption: 'Signals carry no data; sockets cross machine boundaries; message queues keep boundaries.',
      detail: 'A signal is a notification with a number, used to interrupt and command rather than to transfer information. A socket is an endpoint that can address a process on another machine, so it is the only mechanism here that leaves the computer. A message queue stores discrete messages in the kernel and delivers them one message at a time, which is the mechanism to choose when boundaries matter.',
      keyword: 'data, boundary, machine',
      trap: 'Choosing a pipe for messages, or a signal for data. Each mechanism fixes what may be carried, and the exam tests the fixing.',
      narration: 'Signals carry no data; sockets cross machine boundaries; message queues keep boundaries.'
    },

    /* ---------------- scene 10: the recipe ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: is the question about states, about copies, or about sharing?',
      detail: 'Almost every question in this topic is one of three. A state question asks which transitions are legal. A copy question asks how many processes or prints a fork sequence produces. A sharing question asks which resources threads or processes hold in common. Naming the kind selects the diagram you should draw, and the diagram usually settles the answer.',
      keyword: 'states, copies, or sharing',
      trap: 'Starting from the options. Reading the stem for its question kind first is faster and less error-prone than testing each option.',
      narration: 'Step one: is the question about states, about copies, or about sharing?'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step two: for fork draw the tree, for threads split the columns, for states check the edge list.',
      detail: 'Three procedures cover the whole topic. Draw the process tree and count nodes for a fork sequence, marking the printing statement. Write the shared column and the private column for a thread question. Write the six legal edges and test each transition the question offers against them. Each procedure is a page of work, not a page of memory.',
      keyword: 'tree, columns, edge list',
      trap: 'Trying to recall a formula for the fork count. The tree gives the answer and shows where a wait or a branch changes it.',
      narration: 'Step two: for fork draw the tree, for threads split the columns, for states check the edge list.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'The traps: blocked to running, children against processes, and a pipe treated as a message channel.',
      detail: 'Blocked to running never happens; a woken process goes to ready. Children are one fewer than processes after n sequential forks. A pipe carries bytes with no boundaries. Two more: the parent\'s fork return value is positive while the child\'s is zero, and a thread switch does not save the page table base register because the address space is shared.',
      keyword: 'the five traps',
      trap: 'Memorising the list without the reason. Each trap is one edge, one count or one column, and each is checked in the animation panel.',
      narration: 'The traps: blocked to running, children against processes, and a pipe treated as a message channel.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'One question under all of it: what does this process own, and what does it share?',
      detail: 'A process owns an address space and an execution context. A thread owns an execution context and shares the address space. Processes that share nothing need a kernel mechanism to communicate, and threads that share everything need a protocol to do it safely. Every definition, count and mechanism in this lesson is that sentence read at a different scale.',
      keyword: 'what it owns, what it shares',
      trap: 'Treating processes, threads and IPC as three unrelated topics. They are one question about ownership, asked three times.',
      narration: 'One question under all of it: what does this process own, and what does it share?'
    }
  ]
};
