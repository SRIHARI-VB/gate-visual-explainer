/* ==========================================================================
   atomic-instructions-and-locks — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'gap',
      n: 1,
      title: 'A lock cannot be built from an ordinary read and write',
      start: 0, end: 30,
      objective: 'See that a flag tested and then set in two separate steps lets two processes into the section together, so a lock needs one indivisible step.'
    },
    {
      id: 'tas',
      n: 2,
      title: 'test-and-set: one indivisible read-and-write',
      start: 30, end: 60,
      objective: 'State what test-and-set returns and what it stores, build the spin lock from it, and check every interleaving of three processes for mutual exclusion.'
    },
    {
      id: 'atomicity',
      n: 3,
      title: 'The word that decides the answer: indivisible',
      start: 60, end: 90,
      objective: 'Write test-and-set as three ordinary statements and watch the same search find two processes inside, so atomicity is a property of the instruction, not of the code.'
    },
    {
      id: 'swap',
      n: 4,
      title: 'swap: the same lock from an exchange',
      start: 90, end: 120,
      objective: 'Read the swap lock, follow the key register through the exchange, and see that it is the same lock as test-and-set built from a different instruction.'
    },
    {
      id: 'cas',
      n: 5,
      title: 'compare-and-swap: test and write in one step',
      start: 120, end: 150,
      objective: 'Read the three arguments of compare-and-swap, use it as a lock, and use it to make an increment atomic instead.'
    },
    {
      id: 'faa',
      n: 6,
      title: 'The fetch-and-add lock of GATE 2012, and its defect',
      start: 150, end: 180,
      objective: 'Trace the published lock whose body sets the word back to one, and find the reachable state where the lock is held and nobody is inside.'
    },
    {
      id: 'bounded',
      n: 7,
      title: 'Starvation in the plain lock, and the waiting array that fixes it',
      start: 180, end: 210,
      objective: 'Show a schedule in which one process never gets in, then read the exit scan that hands the lock to the next waiting process and bounds the wait by n minus one.'
    },
    {
      id: 'ticket',
      n: 8,
      title: 'The ticket lock: a queue kept in two counters',
      start: 210, end: 240,
      objective: 'Follow the dispenser and the display, check that admission is in ticket order, and state the wait bound and its wraparound caveat.'
    },
    {
      id: 'cost',
      n: 9,
      title: 'What spinning costs, and the one-line improvement',
      start: 240, end: 270,
      objective: 'Count the failed attempts under contention, derive n times n minus one over two, and see what test-and-test-and-set changes and what it does not.'
    },
    {
      id: 'properties',
      n: 10,
      title: 'Which property each lock gives, and how to read such a question',
      start: 270, end: 300,
      objective: 'Put mutual exclusion, progress and bounded waiting side by side for the three locks, and fix the order in which a question on this family is read.'
    }
  ],

  events: [
    /* ---------------- scene 1: the gap ---------------- */
    {
      id: 's1-1', scene: 'gap', start: 0, end: 7.5,
      caption: 'Two processes, one shared flag, and a section only one may enter.',
      detail: 'The task is the critical-section problem: a part of the code that must not run in two processes at once, and a shared word that is supposed to keep them apart. The word starts at zero and means "the section is free".',
      narration: 'Two processes want the same critical section, and one shared word is supposed to keep them apart. The word starts at zero, which means the section is free. Everything in this lesson is about how that word is read and changed.',
      keyword: 'one shared word',
      trap: 'Assuming the shared word is enough on its own. The word is data; what matters is whether the sequence that uses it can be interrupted.'
    },
    {
      id: 's1-2', scene: 'gap', start: 7.5, end: 15,
      caption: 'The obvious lock: test the flag, then set it. Two separate steps.',
      detail: 'The lock is written as a loop that reads the flag and repeats while it is set, followed by a separate statement that writes one. Between those two statements the process may be switched out, and the flag has not changed yet.',
      narration: 'The obvious lock reads the flag and repeats while it is set, and then a separate statement writes one. Two statements, and the machine may switch a process out between them. That gap is the whole problem.',
      keyword: 'Two separate steps',
      trap: 'Reading the two lines as one action because they sit on adjacent lines. The processor sees a load, a test and a store.'
    },
    {
      id: 's1-3', scene: 'gap', start: 15, end: 22.5,
      caption: 'Both read zero, both write one, both enter. The search finds it.',
      detail: 'Process zero reads zero and is switched out. Process one reads zero as well, because nothing has been written yet. Each then writes one and each enters, and the flag never showed either of them that the other was coming.',
      narration: 'Process zero reads zero and is switched out before it writes. Process one reads zero too, because nothing has been written yet. Each then writes one and each enters the section. Both are inside, and the flag never warned either of them.',
      keyword: 'Both read zero',
      trap: 'Believing the flag is wrong. The flag is correct at every instant; the sequence that reads and writes it is what fails.'
    },
    {
      id: 's1-4', scene: 'gap', start: 22.5, end: 30,
      caption: 'Computed: 52 reachable states, exactly one with two inside.',
      detail: 'Every interleaving of the two processes is enumerated from the initial state: 52 distinct states are reachable, and one of them has both processes inside the section. The largest number inside at any reachable state is two, and the requirement is one.',
      narration: 'The search on this page enumerates every interleaving of the two processes. Fifty-two states are reachable, and exactly one of them has both processes inside. So the failure is not hypothetical, it is a state you can point at.',
      keyword: 'exactly one with two inside',
      trap: 'Thinking a rare interleaving does not count. A lock must hold for every legal schedule, and one reachable violation is enough to refute it.'
    },

    /* ---------------- scene 2: test-and-set ---------------- */
    {
      id: 's2-1', scene: 'tas', start: 30, end: 37.5,
      caption: 'test-and-set returns the old value and stores one, as one step.',
      detail: 'The instruction takes the address of a word, copies the old contents back to the caller, and writes one, with no other access to that word allowed in between. The return value is what the word held before, which is the part a lock needs.',
      narration: 'One instruction does the whole job. It reads the old value, hands it back, and writes one, and nothing else may touch that word in between. The return value is what the word held before, and that is exactly what a lock needs to know.',
      keyword: 'returns the old value',
      trap: 'Confusing the return value with the new value. The instruction returns what was there before; the word itself always ends at one.'
    },
    {
      id: 's2-2', scene: 'tas', start: 37.5, end: 45,
      caption: 'The lock is one line: spin while the old value came back as one.',
      detail: 'Acquire loops on the instruction and stops when it returned zero, which means this process is the one that turned the word from free to held. Release is a plain store of zero, and a store of a single word needs no special instruction.',
      narration: 'The lock becomes one line. Keep calling the instruction while it returns one; stop when it returns zero. A zero means you were the process that changed the word from free to held. Release is a plain store of zero, because a single store cannot be half done.',
      keyword: 'stop when it returns zero',
      trap: 'Thinking the release also needs an atomic instruction. Writing one word is already indivisible; the release is a plain store.'
    },
    {
      id: 's2-3', scene: 'tas', start: 45, end: 52.5,
      caption: 'The winner gets zero and enters. The others get one and spin.',
      detail: 'Process zero calls the instruction, gets zero, and enters. Process one and process two each get one back and go round the loop again. The word stays at one for as long as the section is occupied.',
      narration: 'Process zero calls it, gets zero and enters. Process one and process two each get one back, so they go round again. The word stays at one for as long as somebody is inside, and that is mutual exclusion with no gap in it.',
      keyword: 'get one back',
      trap: 'Calling the waiting "blocked". These processes are running and consuming the processor; they are not asleep.'
    },
    {
      id: 's2-4', scene: 'tas', start: 52.5, end: 60,
      caption: 'Computed: 135 states, no state with two inside, maximum one.',
      detail: 'All interleavings of three processes, each running the loop twice, give 135 distinct states. No reachable state has two processes inside, and the largest number inside is one, which is the requirement.',
      narration: 'Every interleaving of three processes, each going round twice, gives a hundred and thirty-five states. Not one of them has two processes inside. The largest number inside is one, which is exactly what the problem asked for.',
      keyword: 'no state with two inside',
      trap: 'Assuming mutual exclusion is enough. It is one of three requirements, and this lock fails the third one, as scene seven shows.'
    },

    /* ---------------- scene 3: atomicity ---------------- */
    {
      id: 's3-1', scene: 'atomicity', start: 60, end: 67.5,
      caption: 'Written out, test-and-set is three statements, and that changes everything.',
      detail: 'A C version of the instruction is a load of the old value, a store of one, and a return of the saved value. As three statements it can be interrupted between any two of them, and then it is no longer the instruction the lock was built for.',
      narration: 'Here is the same instruction written as ordinary C. Load the old value, store one, return the saved value. Three statements, and a process can be switched out between any two of them. The moment that is allowed, it is no longer the instruction the lock was built on.',
      keyword: 'three statements',
      trap: 'Believing a library function marked atomic in a comment is atomic. Atomicity comes from the instruction set, not from a comment.'
    },
    {
      id: 's3-2', scene: 'atomicity', start: 67.5, end: 75,
      caption: 'Both load zero. Both store one. Both are told they won.',
      detail: 'Process zero loads zero and is switched out. Process one loads zero as well, stores one, returns zero and enters. Process zero resumes, stores one, returns its saved zero and enters too. Each was told it had won, and both were.',
      narration: 'Process zero loads zero and is switched out. Process one loads zero too, stores one, returns zero and enters. Process zero resumes, stores one, and returns the zero it saved earlier, so it enters as well. Both were told they had won, and both were.',
      keyword: 'Both load zero',
      trap: 'Reading this as a bug in the C function. The C function is a correct description of the instruction; the split is what happens when the hardware does not provide it.'
    },
    {
      id: 's3-3', scene: 'atomicity', start: 75, end: 82.5,
      caption: 'The same search on the split version finds the same violation.',
      detail: 'The enumeration used for the real instruction, run on the three-statement version, reports a reachable state with both processes inside. Nothing else changed: the code is the same, the schedules are the same, the only difference is where the switching is allowed.',
      narration: 'Run the same search on this split version and it finds the violation at once: a reachable state with both processes inside. The code did not change and the schedules did not change. Only the places where a switch is allowed changed.',
      keyword: 'the same violation',
      trap: 'Answering "the algorithm is wrong". The algorithm is right; the assumption that the three statements are one step is what is wrong.'
    },
    {
      id: 's3-4', scene: 'atomicity', start: 82.5, end: 90,
      caption: 'So the load-bearing word in every definition here is indivisible.',
      detail: 'Every hardware primitive on this page is defined by one sentence: no other access to that word may occur between the read and the write. The instruction count is what the exam asks about, and the indivisibility is what the answer depends on.',
      narration: 'So one word carries the whole lesson. Every primitive here is defined by a single promise: nothing else may touch that word between the read and the write. The exam asks how many instructions, and the answer depends on that promise, not on the number.',
      keyword: 'indivisible',
      trap: 'Treating "atomic" as "fast". An atomic instruction can be slow; what it guarantees is that it cannot be half finished.'
    },

    /* ---------------- scene 4: swap ---------------- */
    {
      id: 's4-1', scene: 'swap', start: 90, end: 97.5,
      caption: 'swap exchanges two words indivisibly. Nothing else about it.',
      detail: 'The instruction takes two addresses and exchanges their contents in one indivisible step. There is no return value and no comparison; the whole of its power is that the exchange cannot be interrupted.',
      narration: 'The second primitive is smaller. It takes two words and exchanges their contents, indivisibly. No return value, no comparison. All of its power is that the exchange cannot be interrupted halfway.',
      keyword: 'exchanges two words',
      trap: 'Looking for a return value. swap has none; the value the lock needs arrives in the second word.'
    },
    {
      id: 's4-2', scene: 'swap', start: 97.5, end: 105,
      caption: 'A private key register of one, swapped with the lock word.',
      detail: 'Each process keeps a private word initialised to one and swaps it with the lock. If the lock was free, the exchange puts one into the lock and brings zero back into the private word, and the loop ends. If the lock was held, one comes back and the process tries again.',
      narration: 'Each process keeps a private word holding one, and swaps it with the lock. If the lock was free, the swap puts one into the lock and brings zero back to the private word, so the loop ends. If the lock was held, one comes back and the process tries again.',
      keyword: 'brings zero back',
      trap: 'Forgetting to reset the private word to one before each attempt. It must be one at the start of every exchange, or the loop ends for the wrong reason.'
    },
    {
      id: 's4-3', scene: 'swap', start: 105, end: 112.5,
      caption: 'The trace: lock zero to one, key one to zero, and this process is in.',
      detail: 'On the computed trace, the first process finds the lock at zero, the exchange leaves the lock at one and the key at zero, and it enters. Every later process brings back one, leaves the lock at one, and spins.',
      narration: 'On the trace, the first process finds the lock at zero. The exchange leaves the lock at one and its key at zero, so it enters. Every process after it brings back one and spins, and the lock stays at one while the section is occupied.',
      keyword: 'lock zero to one',
      trap: 'Thinking the lock word can end at a value other than zero or one. Only one and zero are ever stored into it.'
    },
    {
      id: 's4-4', scene: 'swap', start: 112.5, end: 120,
      caption: 'Computed: 425 states, no violation. Same lock, different instruction.',
      detail: 'The three-process search gives 425 states and no state with two processes inside. The lock behaves exactly as the test-and-set lock does; the two differ in the instruction used, in the number of words touched, and in nothing else that matters here.',
      narration: 'The search gives four hundred and twenty-five states and not one violation. So the swap lock and the test-and-set lock behave the same way: same mutual exclusion, same starvation, different instruction. That is the sentence to carry into an exam.',
      keyword: 'Same lock, different instruction',
      trap: 'Assuming a different instruction gives a different property. Mutual exclusion and starvation come from the loop structure, which is identical.'
    },

    /* ---------------- scene 5: compare-and-swap ---------------- */
    {
      id: 's5-1', scene: 'cas', start: 120, end: 127.5,
      caption: 'compare-and-swap takes three arguments: address, expected, new.',
      detail: 'The instruction reads the word at the address, compares it with the expected value, and only if they are equal does it store the new value. It returns the value it found, so the caller can tell whether the store happened.',
      narration: 'The third primitive takes three arguments: where the word is, what you expect it to hold, and what you want it to hold. It reads, compares, and stores only if the comparison matched. It also returns what it found, so the caller learns whether the store happened.',
      keyword: 'three arguments',
      trap: 'Thinking it always stores. The store is conditional on the comparison, and that condition is the whole instruction.'
    },
    {
      id: 's5-2', scene: 'cas', start: 127.5, end: 135,
      caption: 'As a lock: expect zero, ask for one, and spin while it fails.',
      detail: 'The lock expects the word to be zero and asks for one. If the word was zero the store happens and this process is in. If the word was one the store does not happen, the returned one shows the failure, and the process tries again.',
      narration: 'As a lock it is one line. Expect zero, ask for one, and keep asking while the answer comes back as one. If the word was zero, the store happens and you are in. If it was one, the store does not happen and you learn that from the return value.',
      keyword: 'Expect zero, ask for one',
      trap: 'Writing the expected value as one. Expecting one would mean "store one if the word is already one", which never excludes anybody.'
    },
    {
      id: 's5-3', scene: 'cas', start: 135, end: 142.5,
      caption: 'The same instruction, used instead to make an increment atomic.',
      detail: 'An increment written as a loop around compare-and-swap is indivisible as a whole: read the value, compute the successor, and store only if nothing changed in between, retrying otherwise. The result is a counter that never loses an update.',
      narration: 'Now the interesting use. An increment becomes a loop around the same instruction: read the value, compute the next one, and store only if the value did not change meanwhile. If it did change, try again. The result is a counter that cannot lose an update.',
      keyword: 'make an increment atomic',
      trap: 'Believing the loop can spin for ever. Every failed attempt means somebody else succeeded, so the counter does advance.'
    },
    {
      id: 's5-4', scene: 'cas', start: 142.5, end: 150,
      caption: 'Computed: 2,000 increments, 2,000 in the counter, 1,000 retries.',
      detail: 'Two threads each add one a thousand times, with one forced stale read per round. The compare-and-swap version ends at exactly 2,000 with 1,000 retries; the plain version loses the update on every stale read. The lock search itself reports 135 states and no violation.',
      narration: 'Two threads each add one a thousand times, and one read per round is stale. The compare-and-swap counter still ends at exactly two thousand, with a thousand retries along the way. The plain version loses an update every time a read is stale. That is what the instruction buys.',
      keyword: 'exactly 2,000',
      trap: 'Expecting the retries to show up in the total. Retries cost time and change nothing about the final value.'
    },

    /* ---------------- scene 6: fetch-and-add ---------------- */
    {
      id: 's6-1', scene: 'faa', start: 150, end: 157.5,
      caption: 'GATE 2012 gave a lock built on fetch-and-add, with a body that resets.',
      detail: 'The instruction reads the word, adds a value, and returns the old contents. The published lock loops while the returned value is non-zero, and its loop body sets the word back to one. Both statements are in the loop, which the printed code makes easy to misread.',
      narration: 'This is the lock GATE asked about in 2012. Fetch-and-add reads the word, adds one, and returns what was there. The loop keeps going while the returned value is not zero, and the body sets the word back to one. Both statements are inside the loop.',
      keyword: 'sets the word back to one',
      trap: 'Reading the loop as an empty statement. There is no semicolon after the condition, so the assignment is the body and runs on every failed attempt.'
    },
    {
      id: 's6-2', scene: 'faa', start: 157.5, end: 165,
      caption: 'The happy path: zero comes back, the word is one, and this process enters.',
      detail: 'The first process finds the word at zero, fetch-and-add returns zero and leaves one, the test fails so the body is skipped, and it enters. While it is inside, a second process gets one back, adds to make two, and its body puts the word back to one.',
      narration: 'The first process finds zero, so fetch-and-add returns zero and leaves one. The test is false, the body is skipped, and it enters. A second process gets one back, which makes the word two, and then its body puts the word back to one, so it spins.',
      keyword: 'the word is one',
      trap: 'Thinking the word can stay at two. The body always brings it back to one on the next attempt.'
    },
    {
      id: 's6-3', scene: 'faa', start: 165, end: 172.5,
      caption: 'The defect: a switch after the fetch, before the reset, and the word is stranded at one.',
      detail: 'A waiting process fetches, receives one and leaves the word at two, and is switched out before its body runs. The holder releases, storing zero. The waiting process resumes and its body stores one, so the word is one with nobody inside, and the store it would have needed to make is the one it overwrote.',
      narration: 'Now the defect. A waiting process fetches, gets one, leaves the word at two, and is switched out before its body runs. The holder releases, storing zero. The waiting process resumes and its body stores one. The word is one, nobody is inside, and the release has been overwritten.',
      keyword: 'stranded at one',
      trap: 'Calling this a lost update of a counter. Here the lost value is the release, and the consequence is that the lock can never be taken again.'
    },
    {
      id: 's6-4', scene: 'faa', start: 172.5, end: 180,
      caption: 'Computed: a reachable state with the word at one and nobody inside, and no way in.',
      detail: 'The search over the published code reaches a state with the word at one and no process inside. From that state the forward search visits 46 states without ever entering the section, because every fetch returns a non-zero value and every body restores one. The search over the code as a whole covers 318 states.',
      narration: 'The search reaches a state with the word at one and nobody inside. From there, forty-six further states are visited and not one of them enters the section, because every fetch returns a non-zero value and every body puts one back. The lock is not held by anyone and cannot be taken.',
      keyword: 'no way in',
      trap: 'Answering "it works correctly but may starve". A lock that can never be taken is not merely unfair; the code fails, which is the answer the paper wants.'
    },

    /* ---------------- scene 7: bounded waiting ---------------- */
    {
      id: 's7-1', scene: 'bounded', start: 180, end: 187.5,
      caption: 'The plain lock has no queue, so a process can lose every race.',
      detail: 'Nothing in the loop orders the waiting processes. On the computed schedule, process zero and process two alternate for six rounds while process one attempts once per round and fails every time. Six admissions, six failures, and process one has still not been in.',
      narration: 'The plain lock has no queue. On the schedule computed here, process zero and process two alternate for six rounds, and process one tries once per round and loses every time. Six admissions and six failures, and process one has still never been inside.',
      keyword: 'no queue',
      trap: 'Calling this a deadlock. Somebody is always inside and always making progress; it is one particular process that is never chosen.'
    },
    {
      id: 's7-2', scene: 'bounded', start: 187.5, end: 195,
      caption: 'One flag per process, and the lock is handed over rather than raced for.',
      detail: 'The fix keeps a waiting flag per process and a private key. A process sets its flag, then spins on the instruction only while its own flag is still set and its key still says the lock is held. The waiting flag is what the exiting process will clear.',
      narration: 'The fix keeps one flag per process and a private key. A process raises its flag, then spins only while its own flag is still raised and its key still says the lock is held. That raised flag is the handle the exiting process will use to hand the lock over.',
      keyword: 'handed over',
      trap: 'Dropping the second condition. Without the key test the process would spin even after its flag had been cleared.'
    },
    {
      id: 's7-3', scene: 'bounded', start: 195, end: 202.5,
      caption: 'On exit, scan forward for the next raised flag and clear it instead of the lock.',
      detail: 'The exiting process scans from its own index forward, cyclically, for the first process whose flag is still raised. If it finds one, it clears that flag and leaves the lock word at one, so the chosen process leaves its loop without ever needing the instruction. If it finds none, it stores zero.',
      narration: 'On the way out, the process scans forward from its own index for the first raised flag. If it finds one, it clears that flag and leaves the lock at one, so the chosen process drops out of its loop without needing the instruction at all. If nobody is waiting, it stores zero.',
      keyword: 'clear it instead of the lock',
      trap: 'Expecting the exiting process to store zero every time. Storing zero would reopen the race the waiting array was added to close.'
    },
    {
      id: 's7-4', scene: 'bounded', start: 202.5, end: 210,
      caption: 'Computed: 2,352 states, no violation, and the wait is at most n minus one.',
      detail: 'The three-process search gives 2,352 states and no state with two inside. The exit scan is checked on all 256 combinations of process and waiting vector for two to five processes, and it always picks the nearest raised flag cyclically, so a process waits for at most n minus one admissions.',
      narration: 'The search gives two thousand three hundred and fifty-two states and no violation. The exit scan is checked on all two hundred and fifty-six combinations of process and waiting vector, and it always picks the nearest raised flag going round. So a process waits for at most n minus one admissions, which is the bound the definition asks for.',
      keyword: 'at most n minus one',
      trap: 'Reading the bound as "nobody waits". Bounded waiting allows a wait; it forbids an unbounded one.'
    },

    /* ---------------- scene 8: ticket lock ---------------- */
    {
      id: 's8-1', scene: 'ticket', start: 210, end: 217.5,
      caption: 'Two counters: one dispenses tickets, one shows whose turn it is.',
      detail: 'A process takes a ticket with fetch-and-add, which hands out 0, then 1, then 2 with no two processes getting the same number. A second counter, now-serving, holds the ticket currently allowed in, and a process spins while the two differ.',
      narration: 'The ticket lock is two counters. One dispenses a ticket with fetch-and-add, so the numbers go out as zero, one, two, with no two processes getting the same one. The other shows whose turn it is, and a process spins while its ticket differs from that.',
      keyword: 'Two counters',
      trap: 'Confusing the two counters. The dispenser only ever grows; the display only ever catches up with it.'
    },
    {
      id: 's8-2', scene: 'ticket', start: 217.5, end: 225,
      caption: 'The difference between the counters is the number of processes in the system.',
      detail: 'If the dispenser has handed out t tickets and the display has served s of them, then t minus s processes are inside or waiting. That single subtraction is the arithmetic the questions ask for, and it is bounded by the number of processes.',
      narration: 'Subtract the display from the dispenser and you have the number of processes inside or waiting. If the dispenser has given out t tickets and the display has served s, then t minus s is how many are in the system. That one subtraction answers most of the counting questions here.',
      keyword: 'the number of processes in the system',
      trap: 'Reading the difference as the queue length only. It counts the process inside as well.'
    },
    {
      id: 's8-3', scene: 'ticket', start: 225, end: 232.5,
      caption: 'Computed: 1,201 states, no violation, and admission follows ticket order.',
      detail: 'The search over three processes gives 1,201 states and no state with two inside. It also checks an invariant at every state: whoever is inside holds the ticket equal to now-serving, with no exceptions across all 1,201 states, so admission is in ticket order and not merely exclusive.',
      narration: 'The search gives twelve hundred and one states and no violation. It also checks, at every one of them, that whoever is inside holds the ticket the display shows. There are no exceptions, so admission is in ticket order, not merely exclusive.',
      keyword: 'in ticket order',
      trap: 'Assuming the ticket lock removes contention. It removes unfairness; the waiters still spin.'
    },
    {
      id: 's8-4', scene: 'ticket', start: 232.5, end: 240,
      caption: 'The bound is n minus one admissions, with one caveat about wraparound.',
      detail: 'Because the display increases by exactly one per release and every ticket is distinct, a process holding ticket t is admitted after at most n minus one other admissions. The caveat is that the counters are fixed-width: the comparison must be a wrap-safe difference, not a plain inequality, or the queue breaks at the wrap.',
      narration: 'The display increases by exactly one per release and every ticket is distinct, so a process is admitted after at most n minus one other admissions. One caveat. The counters are a fixed width, so the comparison has to be a wrap-safe difference rather than a plain inequality, or the queue breaks when they wrap.',
      keyword: 'n minus one admissions',
      trap: 'Using a plain less-than comparison on unsigned counters. After a wrap the comparison inverts and every waiter is stuck.'
    },

    /* ---------------- scene 9: cost ---------------- */
    {
      id: 's9-1', scene: 'cost', start: 240, end: 247.5,
      caption: 'A spinner burns the processor to ask the same question again.',
      detail: 'A spinning process is running: it issues the instruction, gets a refusal, and issues it again. On a uniprocessor that is harmless only if the holder is elsewhere; on a multiprocessor every attempt is a write to a shared line, which is far more expensive than a local test.',
      narration: 'A spinning process is not waiting politely, it is running. It issues the instruction, is refused, and issues it again. On one processor that mostly wastes time. On several processors every attempt writes a shared cache line, and that is much more expensive than a local test.',
      keyword: 'burns the processor',
      trap: 'Believing spinning is free because it does no work. It consumes the very resource the holder needs.'
    },
    {
      id: 's9-2', scene: 'cost', start: 247.5, end: 255,
      caption: 'With n processes arriving together, the attempts are 0, 1, 2 and up to n minus one.',
      detail: 'The first process in makes no failed attempt, the second makes one, the third makes two, and the last makes n minus one. Summing them gives n times n minus one over two: 6 for four processes and 28 for eight, which the page computes rather than asserts.',
      narration: 'Count the failed attempts. The first process makes none, the second makes one, the third makes two, and the last makes n minus one. Add them and you get n times n minus one over two: six for four processes, twenty-eight for eight. The page computes both.',
      keyword: 'n times n minus one over two',
      trap: 'Counting the successful attempt as a failure. The holder’s own call succeeds and is not part of the total.'
    },
    {
      id: 's9-3', scene: 'cost', start: 255, end: 262.5,
      caption: 'Test-and-test-and-set: read cheaply, and use the instruction only when it may succeed.',
      detail: 'The improvement spins on an ordinary read and calls the atomic instruction only when the read shows the lock free. The number of attempts is unchanged; what falls is the number of writes to the shared line, which is the expensive part on a multiprocessor.',
      narration: 'The improvement spins on an ordinary read, and calls the atomic instruction only when the read says the lock is free. The count of attempts is the same. What falls is the number of writes to the shared line, and on several processors that is the expensive part.',
      keyword: 'read cheaply',
      trap: 'Thinking the improvement is still correct if the read loop replaces the instruction. A read loop alone has the gap scene one showed.'
    },
    {
      id: 's9-4', scene: 'cost', start: 262.5, end: 270,
      caption: 'A blocking lock trades the spin for a queue and a switch.',
      detail: 'A semaphore or mutex does not spin: a refused process is put on a queue and the processor is given to somebody else. That removes the wasted attempts and adds a context switch in each direction, which is why the two designs suit different hold times.',
      narration: 'A blocking lock does not spin at all. A refused process goes on a queue and the processor goes to somebody else. That removes the wasted attempts and adds a context switch on each side, which is why short holds use spinning and long holds use blocking.',
      keyword: 'trades the spin for a queue',
      trap: 'Assuming blocking is always better. A switch costs more than a few spins, so for a very short section spinning wins.'
    },

    /* ---------------- scene 10: properties ---------------- */
    {
      id: 's10-1', scene: 'properties', start: 270, end: 277.5,
      caption: 'Every lock here gives mutual exclusion. Only two of them bound the wait.',
      detail: 'The plain test-and-set, swap, compare-and-swap and fetch-and-add locks all give mutual exclusion and progress, and all of them can starve a process. The waiting-array version and the ticket lock add a queue, which is the only thing that bounds the wait.',
      narration: 'Every lock on this page gives mutual exclusion, and every one gives progress. What separates them is the third requirement. The plain locks can starve a process; the waiting array and the ticket lock cannot, because they added a queue.',
      keyword: 'Only two of them bound the wait',
      trap: 'Awarding bounded waiting to a lock because it is correct. Correctness here is three separate promises and a paper may ask for any one.'
    },
    {
      id: 's10-2', scene: 'properties', start: 277.5, end: 285,
      caption: 'One indivisible instruction is the whole requirement, not the whole solution.',
      detail: 'Each lock needs exactly one atomic instruction, and everything else is ordinary code. But an atomic instruction does not by itself give a correct lock: the fetch-and-add lock of 2012 has one and still fails, because a second ordinary statement sits inside the loop.',
      narration: 'Each lock needs exactly one indivisible instruction, and everything else is ordinary code. But having one is not enough. The fetch-and-add lock from 2012 has one, and it still fails, because an ordinary statement sits inside the loop beside it.',
      keyword: 'not the whole solution',
      trap: 'Approving any code that contains an atomic instruction. Where the other statements sit is what decides the answer.'
    },
    {
      id: 's10-3', scene: 'properties', start: 285, end: 292.5,
      caption: 'Read such a question in one order: instruction, then loop, then queue.',
      detail: 'First identify which instruction is atomic and what it returns. Then check what else runs between the instruction and the section. Then ask whether anything orders the waiters. Those three questions decide mutual exclusion, progress and bounded waiting respectively.',
      narration: 'Read such a question in one order. First, which instruction is atomic, and what does it return. Second, what else runs between that instruction and the section. Third, does anything order the waiters. Those three questions answer mutual exclusion, progress and bounded waiting in turn.',
      keyword: 'instruction, then loop, then queue',
      trap: 'Starting from the code and looking for a familiar shape. Start from the instruction and its return value; the rest follows.'
    },
    {
      id: 's10-4', scene: 'properties', start: 292.5, end: 300,
      caption: 'So a lock is one indivisible step plus a queue, and nothing else.',
      detail: 'The indivisible step makes the section exclusive. The queue, when it exists, makes the wait bounded. Everything else on this page is a variation on those two ideas, and every exam question in this family asks about one of them.',
      narration: 'So a lock is two ideas. One indivisible step makes the section exclusive. A queue, when there is one, makes the wait bounded. Everything else on this page is a variation on those two, and every question in this family asks about one of them.',
      keyword: 'one indivisible step plus a queue',
      trap: 'Looking for a third ingredient. There is none: the variants differ in the instruction and in whether a queue exists.'
    }
  ]
};
