/* ==========================================================================
   barriers-and-their-implementations — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are generated from this file by
   tools/gen-captions.mjs and must never be edited by hand.

   Every number quoted below is computed by the model in lesson.js and printed
   on the canvas, so the caption and the picture cannot drift apart.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'what', n: 1,
      title: 'What a barrier is',
      start: 0, end: 30,
      objective: 'See that a barrier has two jobs — an arrival gate that holds early processes and a departure gate that re-arms the counter — and that almost every broken barrier fails the second job.'
    },
    {
      id: 'code', n: 2,
      title: 'The GATE CSE 2006 barrier, line by line',
      start: 30, end: 60,
      objective: 'Read the eleven lines as three blocks — a protected arrival, an unprotected spin, a protected departure — and name the block the defect lives in.'
    },
    {
      id: 'round1', n: 3,
      title: 'One invocation, executed',
      start: 60, end: 90,
      objective: 'Accept that the first invocation is correct, with the counter bounded by n and no process released early, and see the search that establishes it.'
    },
    {
      id: 'deadlock', n: 4,
      title: 'Two invocations in immediate succession',
      start: 90, end: 120,
      objective: 'Follow the shortest deadlocking interleaving: one process sees the counter at n, leaves, re-enters, and pushes it to n+1 while the others are still spinning.'
    },
    {
      id: 'repairs', n: 5,
      title: 'The four candidate repairs, executed',
      start: 120, end: 150,
      objective: 'Decide all four options of the second question by running them, and say exactly what each one breaks.'
    },
    {
      id: 'keyed', n: 6,
      title: 'What the keyed repair fixes, and what it leaves',
      start: 150, end: 180,
      objective: 'Separate the counter bound that option B does establish from the reusable barrier it does not, and see the interleaving that still stalls.'
    },
    {
      id: 'naive', n: 7,
      title: 'The naive counter barrier, and why it fails',
      start: 180, end: 210,
      objective: 'Recognise the same defect in its purest form — spinning for a value the counter has already passed — and state the repair as a change of representation, not of timing.'
    },
    {
      id: 'sense', n: 8,
      title: 'The sense-reversing barrier',
      start: 210, end: 240,
      objective: 'Read the sense-reversing barrier, understand why a stale read cannot match the current local sense, and accept the measured zero deadlocks over two invocations.'
    },
    {
      id: 'twophase', n: 9,
      title: 'The two-phase barrier, and the counting question',
      start: 240, end: 270,
      objective: 'Read the arrival/departure semaphore barrier, see why counting up then down needs no reset, and answer whether a non-atomic counter breaks it.'
    },
    {
      id: 'procedure', n: 10,
      title: 'Counts, reading procedure and traps',
      start: 270, end: 300,
      objective: 'Leave with the counts worth memorising, a four-step reading procedure for any barrier question, and the three traps.'
    }
  ],

  events: [
    /* ---------------- scene 1: what ---------------- */
    {
      id: 'wh1', scene: 'what', start: 0, end: 7.5,
      caption: 'A barrier holds every process at one point until the last one arrives.',
      narration: 'A barrier is a meeting point. Every process must arrive, and none may leave until all of them have arrived. That is the whole idea, and it is used to separate the phases of a parallel program.',
      detail: 'A physics simulation computes forces, then updates positions. Every thread must finish the force phase before any thread starts the update, otherwise one thread reads a position another has already changed. The barrier is the line between the phases.',
      keyword: 'every process must arrive',
      trap: 'A barrier is not a mutex. A mutex lets one process in; a barrier lets all of them through, but only together.'
    },
    {
      id: 'wh2', scene: 'what', start: 7.5, end: 15,
      caption: 'The arrival gate holds early arrivals; the counter counts them.',
      narration: 'Picture three processes and one counter. Each process increments the counter as it arrives, and then waits until the counter reads three. The first two spin, the third releases everybody. That is the arrival gate.',
      detail: 'The increment must be protected, or two processes can read the same value and write the same value, and one arrival is lost. That is why the counter sits inside a critical section in every real barrier.',
      keyword: 'the arrival gate',
      trap: 'The count is the number of arrivals, not the number of processes that have finished. Mixing those two up is the start of every departure-gate bug.'
    },
    {
      id: 'wh3', scene: 'what', start: 15, end: 22.5,
      caption: 'The departure gate resets the counter so the barrier can be used again.',
      narration: 'A barrier is almost never used once. A program calls it every iteration. So after the release, the counter must be returned to zero, and nobody may begin the next round before the current round has ended. That is the departure gate.',
      detail: 'The departure gate is where every wrong implementation in this lesson fails. The reset happens after the release, and a fast process can reach the next round before a slow process has even read the released value.',
      keyword: 'the departure gate',
      trap: 'A barrier that is correct for one invocation and wrong for two is not a barrier. Exam questions almost always test the second invocation.'
    },
    {
      id: 'wh4', scene: 'what', start: 22.5, end: 30,
      caption: 'A barrier is a counter plus a release condition; reuse needs a way to tell one round from the next.',
      narration: 'So here is the sentence to carry through the lesson. A barrier is a counter plus a release condition, and reusing it needs one more thing: a way to tell round k from round k plus one. Every implementation below is a different answer to that one question.',
      detail: 'Three answers appear: reset a constant to zero, which is what the 2006 code does and gets wrong; flip a flag, which is the sense-reversing barrier; or count up then down, which is the two-phase barrier.',
      keyword: 'a way to tell round k from round k+1',
      trap: 'Nothing in a barrier requires fairness, priority or ordering. A barrier promises only that no process passes early, and that all of them eventually pass.'
    },

    /* ---------------- scene 2: code ---------------- */
    {
      id: 'co1', scene: 'code', start: 30, end: 37.5,
      caption: 'GATE CSE 2006 gives three processes and a binary semaphore S initialised to one.',
      narration: 'Here is the barrier the 2006 paper asks about. Three processes call it. S is a binary semaphore with the usual P and V, so P takes the lock and V releases it. Two counters are shared and both start at zero.',
      detail: 'The two counters have different jobs. process_arrived counts the arrivals in this round. process_left counts the departures, so the last process out can reset the first counter for the next round.',
      keyword: 'three processes, one binary semaphore',
      trap: 'The semaphore is binary, so it can only say locked or free. It cannot remember how many processes are waiting, which is why a second counter is needed.'
    },
    {
      id: 'co2', scene: 'code', start: 37.5, end: 45,
      caption: 'Lines 1 to 3 are the arrival gate, and they are correct.',
      narration: 'Lines one to three take the lock, increment the arrival counter, and release the lock. The increment is inside the critical section, so two processes cannot lose an arrival. This block is correct, and it is worth saying so before looking for the defect.',
      detail: 'Without the lock, two processes could both read the counter as one, both write two, and the barrier would wait for an arrival that already happened. That is the standard lost-update race, and it is not the bug here.',
      keyword: 'the arrival gate is correct',
      trap: 'A question that shows you a correct block first is telling you where not to look.'
    },
    {
      id: 'co3', scene: 'code', start: 45, end: 52.5,
      caption: 'Line 4 spins on the counter outside the critical section, and that is the flaw.',
      narration: 'Line four is the wait. It tests the counter and spins while it is not three. The test is outside the critical section, which is deliberate, because holding the lock while spinning would block the very processes you are waiting for. But it means the read can interleave with line two of another invocation.',
      detail: 'This is the trade every spin barrier makes: you must not hold the lock while spinning, so the value you spin on is read without protection. The correctness of the whole barrier then depends on that value never being reused with a different meaning.',
      keyword: 'the test is outside the critical section',
      trap: 'Do not conclude that the spin is wrong because it is unprotected. The spin must be unprotected. What is wrong is what the counter means after a reset.'
    },
    {
      id: 'co4', scene: 'code', start: 52.5, end: 60,
      caption: 'Lines 5 to 11 are the departure gate: the last one out resets both counters.',
      narration: 'Lines five to eleven take the lock, increment the departure counter, and when the third process leaves, reset both counters to zero. On paper that re-arms the barrier. The rest of the lesson is about the word on paper.',
      detail: 'Read the code as three blocks, not eleven lines: a protected arrival, an unprotected wait, a protected departure. The defect is in the middle block, and it is not a missing lock.',
      keyword: 'the last one out resets both counters',
      trap: 'Lines 6 to 10 look optional. Option C of the second question claims they can be dropped, and the search in scene five shows what that costs.'
    },

    /* ---------------- scene 3: round 1 ---------------- */
    {
      id: 'r1', scene: 'round1', start: 60, end: 67.5,
      caption: 'The search visits every interleaving of the three processes, not one convenient trace.',
      narration: 'Before judging the code, run it. The model here is a statement-level simulator, and the search is a breadth-first walk over every reachable state of the three processes, deduplicated by their program counters, the two counters and the semaphore.',
      detail: 'Because the walk is exhaustive, the statement "no run does this" is a claim about all runs of this program, not about a sample. That is the difference between an argument and an example.',
      keyword: 'every reachable state',
      trap: 'An exhaustive search is complete only for the program it models. It says nothing about a larger program with the same shape unless the argument is made separately.'
    },
    {
      id: 'r2', scene: 'round1', start: 67.5, end: 75,
      caption: 'With one invocation there are no deadlocks and no early releases.',
      narration: 'For a single invocation the search finds no deadlocked end state and no process released before all three arrived. The arrival gate works exactly as the code intends.',
      detail: 'A process leaves line four only when it reads three, and the counter reaches three only after all three increments. So no process can pass early. That part of the design is sound.',
      keyword: 'no deadlocks, no early releases',
      trap: 'Zero violations here does not make the barrier correct. It makes it correct once.'
    },
    {
      id: 'r3', scene: 'round1', start: 75, end: 82.5,
      caption: 'The counter climbs to three and stops, because only three processes exist.',
      narration: 'The arrival counter goes zero, one, two, three, and then it cannot go further. Only three processes exist, and each increments once. At most two of them can be spinning at the same time, because the third is the one that released them.',
      detail: 'That bound is worth remembering: in an n-process spin barrier, at most n minus one processes spin, and the last arrival never spins at all.',
      keyword: 'three and no further',
      trap: 'The bound n minus one holds for one invocation. It is exactly what two invocations break.'
    },
    {
      id: 'r4', scene: 'round1', start: 82.5, end: 90,
      caption: 'So the first invocation is correct — and the exam question is about the second.',
      narration: 'So the first invocation passes. Every process waits for the third arrival, and the last one out resets the counter. Which means the question you are actually being asked is not "is this barrier correct" but "what happens the second time".',
      detail: 'That is the shape of the whole question family. One invocation is easy; the paper is testing whether you think about reuse, which is the only reason a barrier exists.',
      keyword: 'the second invocation',
      trap: 'A student who checks one invocation stops here and marks the code correct. That is exactly the wrong option in the 2006 question.'
    },

    /* ---------------- scene 4: the deadlock ---------------- */
    {
      id: 'dl1', scene: 'deadlock', start: 90, end: 97.5,
      caption: 'With two invocations the search finds deadlocked end states.',
      narration: 'Now let the same three processes call the barrier twice, one immediately after the other. The search finds deadlocked end states — several of them — and it finds them in a trace only eighteen steps long.',
      detail: 'A deadlocked end state is one in which no process is finished and none of them can make progress: each is either blocked on the semaphore or spinning on a value that nobody can change.',
      keyword: 'two invocations deadlock',
      trap: 'The deadlock is not a rare race. It is reachable in eighteen statements from the initial state.'
    },
    {
      id: 'dl2', scene: 'deadlock', start: 97.5, end: 105,
      caption: 'One process reads three, leaves the loop, and re-enters before the others read.',
      narration: 'Here is the interleaving. The first process arrives, increments, and reads three. It leaves the loop, takes the departure lock, increments the departure counter, and — because it is not the third departure — releases the lock and returns. Then it calls the barrier again.',
      detail: 'Nothing in that sequence is unusual. A process that finishes the barrier first is allowed to run ahead. The barrier promises nothing about who reaches the next round first.',
      keyword: 'it re-enters the barrier',
      trap: 'Do not look for a missing lock. Every counter update in this trace is properly protected.'
    },
    {
      id: 'dl3', scene: 'deadlock', start: 105, end: 112.5,
      caption: 'Its second arrival pushes the counter to four, and four never equals three.',
      narration: 'On its second entry the same process increments the arrival counter again, and the counter becomes four. The other two processes are still spinning on line four, reading four, waiting for three. Nobody will ever make it three again.',
      detail: 'The reset only happens when the departure counter reaches three, and the departure counter only reaches three when all three processes pass line six, and two of them never will. The barrier has waited for an arrival that already happened.',
      keyword: 'four never equals three',
      trap: 'The counter is not corrupted. It is doing exactly what the code says. The code reused one variable for two different rounds.'
    },
    {
      id: 'dl4', scene: 'deadlock', start: 112.5, end: 120,
      caption: 'Measured: eight deadlocked end states, and the counter reaches 2n minus one.',
      narration: 'The measurement: eight deadlocked end states out of one thousand five hundred and thirty-eight reachable states, and across the whole graph the counter reaches five, which is two n minus one for n equal to three. That figure is the signature of this bug.',
      detail: 'Two n minus one because the first round can contribute n arrivals and the second round can contribute n minus one more before the last process is stuck. The search confirms it for n from two to four.',
      keyword: '2n minus one',
      trap: 'If a question tells you the counter reached two n minus one, it is telling you that two invocations interleaved and that the barrier never reset.'
    },

    /* ---------------- scene 5: repairs ---------------- */
    {
      id: 'rp1', scene: 'repairs', start: 120, end: 127.5,
      caption: 'Option A replaces the departure block with a single decrement, and it fails.',
      narration: 'The second question asks which change fixes the problem. Option A replaces lines six to ten with one decrement of the arrival counter. Run it: the search finds hundreds of states in which a process leaves the barrier before all three have arrived.',
      detail: 'The reason is easy to see once the search shows it. A process decrements, immediately re-enters, increments, and the counter reads three again while the other two are still arriving. The barrier has been passed by one process alone.',
      keyword: 'A fails: early release',
      trap: 'A decrement looks like a tidy symmetric reset. It removes the very information — how many have left — that the departure gate needs.'
    },
    {
      id: 'rp2', scene: 'repairs', start: 127.5, end: 135,
      caption: 'Option B puts a gate at the start, and the counter can no longer pass n.',
      narration: 'Option B adds a wait at the beginning: the first process to enter waits until the arrival counter is zero before taking the lock. That does bound the counter. In the search the largest value it reaches is three, not four, so the specific defect the first question names cannot happen.',
      detail: 'This is why B is the keyed answer. The reasoning the paper expects is exactly that: prevent process_arrived from exceeding n, and the deadlock the first question describes is gone.',
      keyword: 'B is keyed',
      trap: 'Do not stop at "it bounds the counter". Bounding the counter is a necessary property of a barrier. It is not sufficient, and the next scene shows why.'
    },
    {
      id: 'rp3', scene: 'repairs', start: 135, end: 142.5,
      caption: 'Option C disables context switching, so the spin can never be satisfied.',
      narration: 'Option C disables the context switch from the start of the barrier to its end. That is worse than it sounds. A process that enters the barrier and finds the counter at one spins, and with no context switch no other process can ever arrive to make it three. The search is stuck at the very first invocation.',
      detail: 'A spin barrier needs the scheduler. That is not a defect of this implementation; it is what spinning means. Any option that removes preemption from a spin loop is wrong for that reason alone.',
      keyword: 'C fails: no one can arrive',
      trap: 'Disabling interrupts is a legitimate technique for a short critical section. It is never legitimate around a wait for other processors.'
    },
    {
      id: 'rp4', scene: 'repairs', start: 142.5, end: 150,
      caption: 'Option D makes the departure counter private, so it is never reset.',
      narration: 'Option D makes process_left private, one copy per process. Then no process ever sees it reach three, so the reset never happens, and the counter climbs to six, which is two n. The barrier works once and never again.',
      detail: 'The measurement is unambiguous: with D there is not a single run that finishes both invocations, and the counter reaches two n rather than two n minus one, because every process now arrives twice.',
      keyword: 'D fails: no reset at all',
      trap: 'A shared counter that decides a global property must be shared. Making it private removes the only place where the "all of them" fact can be recorded.'
    },

    /* ---------------- scene 6: what B leaves ---------------- */
    {
      id: 'ky1', scene: 'keyed', start: 150, end: 157.5,
      caption: 'Option B bounds the counter at n, which is what the first question asks for.',
      narration: 'So option B does the job the paper asks of it. The arrival counter never exceeds n, the deadlock described in the first question cannot arise, and the answer key is B. That is worth stating plainly, because the rest of this scene is not a contradiction of it.',
      detail: 'The 2006 question asks which statement is true about the implementation and which change rectifies the problem it names. It does not ask for a barrier that provably survives an arbitrary number of invocations.',
      keyword: 'B answers the question asked',
      trap: 'An exam answer can be correct for the question asked and still not be a good engineering answer. Keep the two judgements separate.'
    },
    {
      id: 'ky2', scene: 'keyed', start: 157.5, end: 165,
      caption: 'But a full search still finds a stalled second invocation under B.',
      narration: 'Now run B exhaustively, as we ran everything else. The search still finds stalled end states — twelve of them. The counter bound is fixed and the deadlock is not, because the gate can only be cleared by a reset, and the reset needs a completed round.',
      detail: 'That is the honest result of the computation, and it is worth being precise about what it does and does not show. It shows that B, transcribed literally, is not a reusable barrier. It does not show that B is the wrong answer to the 2006 question.',
      keyword: 'twelve stalled end states',
      trap: 'Be careful with this claim in an exam. The keyed answer is B; an answer sheet is not the place to argue with the key.'
    },
    {
      id: 'ky3', scene: 'keyed', start: 165, end: 172.5,
      caption: 'Round two stalls because only a completed round two can clear the gate.',
      narration: 'The stalling interleaving is four lines long. All three pass round one and the last one out resets the counter to zero. The first process enters round two, sees zero, passes the gate and increments to one. The other two reach the gate, read one, and wait for zero — which only a completed round two could produce.',
      detail: 'The gate is a condition on a variable that the barrier itself is supposed to change. That is circular, and it is the general reason why "wait for the counter to return to its initial value" is not a sound way to detect the end of a round.',
      keyword: 'circular gate',
      trap: 'Any repair of the form "wait until the shared state looks like the start" has this shape. Ask what could make it look that way again.'
    },
    {
      id: 'ky4', scene: 'keyed', start: 172.5, end: 180,
      caption: 'The exam answer and the reusable barrier are two different questions.',
      narration: 'So keep two sentences. B answers the question the paper asks: stop the counter exceeding n. And a barrier that must survive many rounds needs a different idea — not a reset to a constant, but a change of representation. The next two scenes are the two standard answers.',
      detail: 'The distinction is worth internalising because exam options are usually written as the first kind of claim, while real implementations need the second.',
      keyword: 'two different questions',
      trap: 'If a question asks "which change rectifies the problem", answer for the problem stated. If it asks "which is a correct reusable barrier", answer with the sense or two-phase design.'
    },

    /* ---------------- scene 7: naive ---------------- */
    {
      id: 'nv1', scene: 'naive', start: 180, end: 187.5,
      caption: 'The naive barrier spins until the counter returns to n.',
      narration: 'Strip the 2006 code to its idea and you get the naive centralized barrier. Each process atomically decrements a counter that starts at n. The one that finds one left resets it to n. Everyone else spins until the counter reads n again.',
      detail: 'This is the barrier most textbooks draw first, and it is the one that fails. Its failure is not about locks or about the reset being done by the wrong process; it is about what the value n means.',
      keyword: 'spin until the counter is n',
      trap: 'An atomic decrement is necessary here and not sufficient. The bug survives any amount of atomicity.'
    },
    {
      id: 'nv2', scene: 'naive', start: 187.5, end: 195,
      caption: 'It finishes some runs and deadlocks in others — which is the worst kind of wrong.',
      narration: 'Run it over two invocations. Some interleavings finish both rounds, and the search finds deadlocked end states as well. That mixture is the worst possible outcome for a student, because a single trace you try by hand may well work.',
      detail: 'A barrier is a correctness mechanism. A version that works for the schedules you happened to try is not a barrier; it is a bug that passes your tests.',
      keyword: 'some runs finish, some do not',
      trap: 'When a question shows you a working trace, it has shown you an example, not a proof. Look for the schedule the trace does not cover.'
    },
    {
      id: 'nv3', scene: 'naive', start: 195, end: 202.5,
      caption: 'A fast process decrements to two while a slow one spins for three.',
      narration: 'The race is three moves. Round one ends with the counter at three. A fast process re-enters and decrements it to two. A slow process, still in round one, reads two and spins waiting for three, which has already been and gone.',
      detail: 'Notice what the slow process is waiting for: not for the counter to change, but for it to reach a particular value. Once the counter passes that value in the wrong direction, no future change helps.',
      keyword: 'waiting for a value that has gone',
      trap: 'The reset is not the problem here. The problem is that the reset is expressed as a value that the next round also produces.'
    },
    {
      id: 'nv4', scene: 'naive', start: 202.5, end: 210,
      caption: 'Repair: give each round a different value, so a stale read cannot match.',
      narration: 'So the repair is a change of representation, not of timing. Make each round use a different value. One shared boolean flips at every barrier, each process flips its own copy first, and then waits for the shared one to match its own. Round k and round k plus one differ by construction.',
      detail: 'This is why the technique is called sense reversal. The shared flag does not say "how many have arrived"; it says "which round are we in", and that is the fact the waiter actually needs.',
      keyword: 'a different value each round',
      trap: 'Adding a delay, a backoff or a memory fence does not fix this bug. Only changing what the variable means does.'
    },

    /* ---------------- scene 8: sense ---------------- */
    {
      id: 'sn1', scene: 'sense', start: 210, end: 217.5,
      caption: 'Each process flips its own sense, then waits for the shared one to match.',
      narration: 'Here is the sense-reversing barrier. The count starts at n. Each process flips its own local sense, then atomically decrements the count. The one that finds one left resets the count to n and copies its own sense into the shared one. The rest wait until the shared sense equals their local sense.',
      detail: 'The order inside the last process matters: reset the count first, then publish the sense. Publishing the sense is what releases the waiters, so everything the waiters will read must already be in place.',
      keyword: 'flip, then wait for a match',
      trap: 'The reset of the count and the flip of the sense are two separate steps. Doing them in the other order lets a waiter read a stale count.'
    },
    {
      id: 'sn2', scene: 'sense', start: 217.5, end: 225,
      caption: 'A stale read cannot match, because the value changes meaning every round.',
      narration: 'Why a stale read is now harmless. A process waiting in round k is waiting for a sense value that round k will produce. Round k plus one produces the opposite value. So a process that is late cannot be fooled by a fast process that has already entered the next round, because the fast process is waiting for the other value.',
      detail: 'That is the whole proof, and it is short enough to reproduce: the sense a process waits for is a function of its round, and rounds alternate, so two processes in different rounds never wait for the same value.',
      keyword: 'rounds alternate',
      trap: 'This works because there are exactly two senses. A three-valued scheme would let a process two rounds behind match a process one round ahead.'
    },
    {
      id: 'sn3', scene: 'sense', start: 225, end: 232.5,
      caption: 'Measured over two invocations: zero deadlocks and zero early releases.',
      narration: 'And the measurement agrees with the argument. Over two invocations the search finds no deadlocked end state and no process released before all three arrived, and it finds runs that finish both rounds. The count never exceeds n.',
      detail: 'The two claims are checked separately, because they are different properties. A barrier can be free of deadlock and still let a process through early, and that would be a worse bug.',
      keyword: 'zero and zero',
      trap: 'Do not confuse "no deadlock" with "correct". Both properties have to hold, and a question can test either one.'
    },
    {
      id: 'sn4', scene: 'sense', start: 232.5, end: 240,
      caption: 'Three rounds, three alternating values: true, false, true.',
      narration: 'Across three rounds the shared sense goes true, false, true. Every round is distinguishable from the one before it and the one after it, which is exactly what the 2006 code could not do when it reset to zero.',
      detail: 'The cost is one shared word and one private bit per process. The barrier is still centralized, so the count is still a point of contention, which is why large machines use tree and dissemination barriers instead.',
      keyword: 'true, false, true',
      trap: 'A question about scalability is a different question. Sense reversal fixes reuse, not contention.'
    },

    /* ---------------- scene 9: two-phase ---------------- */
    {
      id: 'tp1', scene: 'twophase', start: 240, end: 247.5,
      caption: 'The two-phase barrier counts up on arrival and down on departure.',
      narration: 'The second standard answer uses two semaphores and one counter. The arrival semaphore lets processes in one at a time. Each increments the counter. The one that makes it n opens the departure semaphore. Everyone waits there, and each decrements the counter on the way out.',
      detail: 'The last one out re-arms the arrival semaphore. So the counter goes up to n and back down to zero, and it is never reset to a constant, which is why no stale value can exist.',
      keyword: 'count up, then count down',
      trap: 'Two phases are not decoration. The departure phase is what makes the barrier reusable, and it is the part a naive answer leaves out.'
    },
    {
      id: 'tp2', scene: 'twophase', start: 247.5, end: 255,
      caption: 'The invariant is that the counter equals the processes still inside.',
      narration: 'The invariant is worth stating in words: the counter equals the number of processes that have arrived but not yet left. It rises to n as the last one arrives and falls to zero as the last one departs, and the barrier is ready when it reaches zero.',
      detail: 'Because the counter is a count of processes rather than a flag, a process cannot mistake a value from the previous round for the current one: the value is not a round marker at all.',
      keyword: 'processes still inside',
      trap: 'If a question asks for the value of the counter at a moment, compute it from that sentence rather than from the code order.'
    },
    {
      id: 'tp3', scene: 'twophase', start: 255, end: 262.5,
      caption: 'Measured: no deadlocks, and the non-atomic counter changes nothing.',
      narration: 'The search finds no deadlocked end state and no early release over two invocations. It also answers a question a lecture slide asks: is this still correct if the counter is not atomic? Yes — and the reason is visible in the code, because both the increment and the decrement sit inside a region protected by a semaphore.',
      detail: 'That is a good example of a question where the answer is "it does not matter here, and here is the specific reason". The atomicity is not needed because the mutual exclusion is already there.',
      keyword: 'atomicity is not needed',
      trap: 'Do not generalise this to "counters need no atomicity". In a spin barrier with no lock, the increment does need to be atomic.'
    },
    {
      id: 'tp4', scene: 'twophase', start: 262.5, end: 270,
      caption: 'Three barriers, three answers to "how do I know which round this is".',
      narration: 'So the three designs differ in one question only. The 2006 code resets a constant, which is wrong. The sense barrier flips a flag, which is right. The two-phase barrier counts up and then down, which is also right and needs no marker at all.',
      detail: 'Once you see them as three answers to the same question, the counting questions become easy, because each design has its own small set of quantities to track.',
      keyword: 'one question, three answers',
      trap: 'Mixing the designs is a common error in exam options — a sense flag with a reset-to-zero, for example. Check that the pieces belong to one design.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'The counts: n minus one spin, and the counter can reach 2n minus one.',
      narration: 'These are the numbers worth carrying in. At most n minus one processes spin, because the last arrival never spins. With two invocations of the 2006 barrier the counter reaches two n minus one. Option D pushes it to two n. And n arrivals are needed to release anybody.',
      detail: 'The first two were measured for n from two to five, and the two n minus one figure for n from two to four. The general form follows from the argument that round one contributes n arrivals and round two contributes n minus one.',
      keyword: 'n minus one, and 2n minus one',
      trap: 'Do not quote a bound you cannot derive. The spin bound is n minus one because the releasing process is not spinning; the counter bound has the derivation given in scene four.'
    },
    {
      id: 'pr2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Reading procedure: find the counter, find who resets it, then try two rounds.',
      narration: 'For any barrier question, four steps. Find the counter and find who resets it. Ask when that reset can be late. Ask what a stale read of the counter can see. Then try two invocations rather than one.',
      detail: 'The fourth step is the one that earns marks. Almost every wrong option in this family is a change that looks fine for a single invocation and breaks on the second.',
      keyword: 'four steps',
      trap: 'Do not start by tracing the code line by line. Start by naming the counter and its reset, because that pair is where every defect lives.'
    },
    {
      id: 'pr3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Three traps: one trace proves nothing, spinning is not blocked, arrivals are not enough.',
      narration: 'Three traps. One working trace proves nothing, and the naive barrier finishes several runs while still being broken. A spinning process is runnable, so the operating system cannot see the deadlock. And n arrivals are only enough if the departure gate re-arms the counter in time.',
      detail: 'The second trap has an exam consequence: a question that asks "will the OS detect this deadlock" has answer no, because a spin is a busy loop and the process is still runnable.',
      keyword: 'the three traps',
      trap: 'The most attractive wrong option in these questions is always the one that fixes the symptom you were shown and leaves the reuse problem in place.'
    },
    {
      id: 'pr4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'A barrier needs an arrival gate and a departure gate, and the departure gate must tell one round from the next.',
      narration: 'The sentence to keep: a barrier needs an arrival gate and a departure gate, and the departure gate must make round k plus one distinguishable from round k. Every correct design in this lesson is a way of doing that, and every broken one is a way of not doing it.',
      detail: 'That sentence answers the code questions, the counting questions and the option questions, and it tells you which of the three traps a wrong option has fallen into.',
      keyword: 'distinguishable from round k',
      trap: 'Nothing here is about performance. Contention, tree barriers and dissemination barriers are a different lesson.'
    }
  ]
};
