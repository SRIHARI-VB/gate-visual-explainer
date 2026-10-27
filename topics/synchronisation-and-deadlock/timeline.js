/* ==========================================================================
   synchronisation-and-deadlock - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same model.
   Timings are estimates from a speaking rate, not measured from audio.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'race',
      n: 1,
      title: 'The race condition: one counter, two threads',
      start: 0, end: 30,
      objective: 'Show that a read-modify-write is three steps, and that interleaving two of them can lose an update.'
    },
    {
      id: 'requirements',
      n: 2,
      title: 'The three requirements, and strict alternation',
      start: 30, end: 60,
      objective: 'State mutual exclusion, progress and bounded waiting, and show a solution that satisfies the first and fails the second.'
    },
    {
      id: 'peterson',
      n: 3,
      title: "Peterson's algorithm: flags plus a turn",
      start: 60, end: 90,
      objective: 'Trace the two-process solution and verify all three requirements by enumerating its reachable states.'
    },
    {
      id: 'semaphore',
      n: 4,
      title: 'Semaphores: a permit counter with a queue',
      start: 90, end: 120,
      objective: 'Read wait and signal as a counter that can go negative, and use the permit invariant to answer counting questions.'
    },
    {
      id: 'producer-consumer',
      n: 5,
      title: 'Producer and consumer: the order that deadlocks',
      start: 120, end: 150,
      objective: 'Run the bounded buffer with the two wait calls in each order, and see which order can deadlock and why.'
    },
    {
      id: 'monitor',
      n: 6,
      title: 'Monitors and condition variables',
      start: 150, end: 180,
      objective: 'Explain why a monitor holds its own lock, what wait on a condition variable releases, and why a signal with no waiter is lost.'
    },
    {
      id: 'deadlock',
      n: 7,
      title: 'Deadlock: four conditions and a cycle',
      start: 180, end: 210,
      objective: 'Name the four Coffman conditions, and read a cycle in a single-instance resource graph as a deadlock.'
    },
    {
      id: 'cycle-not-deadlock',
      n: 8,
      title: 'A cycle is not always a deadlock',
      start: 210, end: 240,
      objective: 'Show a multi-instance graph with a cycle that still has a safe completion order, and say which condition licenses the cycle test.'
    },
    {
      id: 'banker',
      n: 9,
      title: "Banker's algorithm and the resource bound",
      start: 240, end: 270,
      objective: "Run the safety check on a printed GATE table, and use n(K-1)+1 <= m to answer the single-resource-type version."
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure for any question in this topic',
      start: 270, end: 300,
      objective: 'Fix a four-step procedure and the five traps that account for most lost marks here.'
    }
  ],

  events: [
    /* ---------------- scene 1: race ---------------- */
    {
      id: 'rc-1', start: 0, end: 7.5, scene: 'race',
      caption: 'One counter, two threads, and each thread adds one. The answer should be two.',
      detail: 'Two threads share an integer counter that starts at zero, and each runs counter = counter + 1 once. If the result is always two, nothing is wrong. The question is what happens when the two threads overlap in time, because the statement is not one step.',
      keyword: 'counter = counter + 1',
      trap: 'Treating a high-level statement as one machine step. On most machines it is a load, an add and a store, and a switch between the load and the store is enough to lose an update.',
      narration: 'One counter, two threads, and each thread adds one. The answer should be two.'
    },
    {
      id: 'rc-2', start: 7.5, end: 15, scene: 'race',
      caption: 'The statement is three steps: read the value into a register, add one, write it back.',
      detail: 'Read, add, write. A context switch is allowed between any two of them. The register holds a private copy, so a value read before another thread wrote is stale the moment it is used, and the write that follows erases the other thread\'s work.',
      keyword: 'read, add, write',
      trap: 'Believing a switch can only happen between statements. If the question says statements are atomic, the interleavings shrink; if it does not, a switch inside the statement is legal.',
      narration: 'The statement is three steps: read the value into a register, add one, write it back.'
    },
    {
      id: 'rc-3', start: 15, end: 22.5, scene: 'race',
      caption: 'Both threads read zero, both write one. One increment has disappeared.',
      detail: 'Thread one reads zero, thread two reads zero, thread one writes one, thread two writes one. Two increments, one of them lost, and the counter holds one. The lost update is not a scheduling accident that a faster machine avoids; it is a legal interleaving of a non-atomic sequence.',
      keyword: 'one increment has disappeared',
      trap: 'Assuming the answer must be one value. With no synchronisation there are two legal outcomes here, one and two, and a question that asks for the possible values wants both.',
      narration: 'Both threads read zero, both write one. One increment has disappeared.'
    },
    {
      id: 'rc-4', start: 22.5, end: 30, scene: 'race',
      caption: 'Two legal outcomes, one and two. The counter is not wrong; the sequence is unprotected.',
      detail: 'Enumerating every interleaving of the two read-modify-write pairs gives exactly two possible final values: one, when the two reads both happen before either write, and two otherwise. The fix is not a faster processor but a protocol that keeps the three steps together, which is what a critical section is.',
      keyword: 'the sequence is unprotected',
      trap: 'Concluding that the program is wrong. It is correct under the assumption that the statement is atomic, and that assumption is what the hardware does not give you.',
      narration: 'Two legal outcomes, one and two. The counter is not wrong; the sequence is unprotected.'
    },

    /* ---------------- scene 2: requirements ---------------- */
    {
      id: 'rq-1', start: 30, end: 37.5, scene: 'requirements',
      caption: 'A critical section is the part that touches shared data. Three promises are asked of it.',
      detail: 'A critical section is a stretch of code that reads or writes data another process also touches. A correct solution must give mutual exclusion, so at most one process is inside; progress, so a process that wants in is not blocked by a process that does not; and bounded waiting, so no process waits forever while others overtake it.',
      keyword: 'three promises',
      trap: 'Treating the three as one requirement. A solution can be safe and still starve, and GATE asks for the specific property that fails rather than for "correct" or "incorrect".',
      narration: 'A critical section is the part that touches shared data. Three promises are asked of it.'
    },
    {
      id: 'rq-2', start: 37.5, end: 45, scene: 'requirements',
      caption: 'Strict alternation: one variable, turn, and each process waits for its own value.',
      detail: 'Process zero enters when turn is zero and sets turn to one on the way out; process one does the mirror image. This is the GATE 2016 Set 2 Q48 shape. It is the smallest possible solution: one shared integer, two loops.',
      keyword: 'turn',
      trap: 'Reading the loop as a lock. It is not a lock; it is a baton, and a baton can be held by a process that is not running.',
      narration: 'Strict alternation: one variable, turn, and each process waits for its own value.'
    },
    {
      id: 'rq-3', start: 45, end: 52.5, scene: 'requirements',
      caption: 'Mutual exclusion holds: turn cannot be zero and one at the same time.',
      detail: 'Only one process can pass its loop, because passing requires turn to equal its own index and the two indices differ. So mutual exclusion is satisfied by a one-line argument about a single variable. The safety property is cheap; the liveness property is where this solution fails.',
      keyword: 'mutual exclusion holds',
      trap: 'Concluding "correct" after checking mutual exclusion. Safety is necessary and not sufficient, and this solution is the standard proof of that.',
      narration: 'Mutual exclusion holds: turn cannot be zero and one at the same time.'
    },
    {
      id: 'rq-4', start: 52.5, end: 60, scene: 'requirements',
      caption: 'Turn one, process one in its remainder, process zero waiting: progress fails.',
      detail: 'Set turn to one and put process one in its remainder section, doing no work and wanting nothing. Process zero reaches its entry, sees turn equal to one, and spins. The critical section is empty and process zero is willing, yet it cannot enter, because the decision is being made by a process that is not participating. That is exactly the progress requirement being violated, and the same state can deadlock outright if process one never returns.',
      keyword: 'progress fails',
      trap: 'Calling this a deadlock. No process holds the critical section here, so the progress requirement is the precise charge; calling it a deadlock invites the wrong answer option.',
      narration: 'Turn one, process one in its remainder, process zero waiting: progress fails.'
    },

    /* ---------------- scene 3: peterson ---------------- */
    {
      id: 'pt-1', start: 60, end: 67.5, scene: 'peterson',
      caption: 'Two flags and one turn: each process raises its flag, then offers the turn to the other.',
      detail: 'Flag i says process i wants to enter. Turn says whose claim is older. The entry is: raise my flag, set turn to the other index, then wait while the other flag is up and the turn is the other index. On the way out, lower my flag. Two booleans and one index, and no special instruction.',
      keyword: 'raises its flag',
      trap: 'Dropping the turn variable and keeping only the flags. Two flags alone deadlock when both are raised at once, which is the classic reason the second variable exists.',
      narration: 'Two flags and one turn: each process raises its flag, then offers the turn to the other.'
    },
    {
      id: 'pt-2', start: 67.5, end: 75, scene: 'peterson',
      caption: 'Both raise their flags; the second writer of turn loses the tie, and waits.',
      detail: 'If both raise flags, both write turn, and the last write wins. The process that wrote first sees turn pointing at itself and stays outside while the other flag is up. The other process sees turn pointing away from itself and enters. The tie is broken by a write, not by a priority number, so no process is permanently favoured.',
      keyword: 'the second writer loses the tie',
      trap: 'Thinking the loser waits forever. It waits only while the winner is inside; the winner lowers its flag on exit, which frees the loser immediately.',
      narration: 'Both raise their flags; the second writer of turn loses the tie, and waits.'
    },
    {
      id: 'pt-3', start: 75, end: 82.5, scene: 'peterson',
      caption: 'Thirty-four reachable states, counting the finished one, and none has both inside.',
      detail: 'Enumerating every reachable state of the two processes, treating each statement as atomic and the spin as a self-loop, gives thirty-four distinct states, counting the all-finished state. In none of them are both processes in the critical section. That enumeration is the proof for this model; it is not a proof for a machine that reorders memory writes, which is why real systems add fences.',
      keyword: 'thirty-four reachable states',
      trap: 'Claiming the algorithm is correct on real hardware because it is correct on paper. Without memory ordering guarantees the two writes can be observed in the wrong order; the algorithm is correct under sequential consistency.',
      narration: 'Thirty-four reachable states, counting the finished one, and none has both inside.'
    },
    {
      id: 'pt-4', start: 82.5, end: 90, scene: 'peterson',
      caption: 'Progress holds and waiting is bounded: a process waits for at most one entry by the other.',
      detail: 'If the other process is not interested, its flag is down and the loop is never entered, so progress holds. If both are interested, one of them enters, and the other enters after at most one critical section of its rival, so waiting is bounded. All three requirements hold, which is why this is the textbook two-process solution and why it generalises only awkwardly to n processes.',
      keyword: 'waiting is bounded',
      trap: 'Assuming the two-process solution scales. The Bakery algorithm extends the idea with ticket numbers; Peterson does not extend by adding flags alone.',
      narration: 'Progress holds and waiting is bounded: a process waits for at most one entry by the other.'
    },

    /* ---------------- scene 4: semaphore ---------------- */
    {
      id: 'sm-1', start: 90, end: 97.5, scene: 'semaphore',
      caption: 'A semaphore is an integer plus a queue, touched only by wait and signal.',
      detail: 'wait decrements and blocks the caller if the value goes negative; signal increments and wakes one sleeper if there is one. Both are atomic. A binary semaphore, also called a mutex, is the special case that never exceeds one. The queue is the part that turns a spin into a sleep.',
      keyword: 'an integer plus a queue',
      trap: 'Believing the value can never be negative. In the counting definition the value is minus the number of blocked processes, so a negative reading is information, not an error.',
      narration: 'A semaphore is an integer plus a queue, touched only by wait and signal.'
    },
    {
      id: 'sm-2', start: 97.5, end: 105, scene: 'semaphore',
      caption: 'Value five, three waits: two left, nobody blocked.',
      detail: 'Starting at five, three waits take the value to two and no process sleeps. The value is the number of permits still available, and the count of processes that have passed is initial minus current. Every question about a counting semaphore is an accounting question about these two quantities.',
      keyword: 'permits still available',
      trap: 'Mixing up the value with the number of processes inside. The number inside is initial minus current, and it is the value that carries the queue length when negative.',
      narration: 'Value five, three waits: two left, nobody blocked.'
    },
    {
      id: 'sm-3', start: 105, end: 112.5, scene: 'semaphore',
      caption: 'Waits minus signals cannot exceed the initial value plus the signals that ran.',
      detail: 'Every signal creates one permit and every completed wait consumes one. So the number of waits that can ever complete is at most the initial value plus the number of signals issued. That single inequality answers the whole family of "largest initial value" questions without tracing any particular order.',
      keyword: 'cannot exceed',
      trap: 'Tracing one order and generalising. The question says "in some order", so the answer must hold for the worst order, which is all the waits first.',
      narration: 'Waits minus signals cannot exceed the initial value plus the signals that ran.'
    },
    {
      id: 'sm-4', start: 112.5, end: 120, scene: 'semaphore',
      caption: 'Twenty waits, twelve signals: at most nineteen can pass from seven, so one blocks. Answer seven.',
      detail: 'GATE 2016 Set 2 Q49 gives twenty wait operations and twelve signal operations and asks for the largest initial value that still leaves at least one wait blocked. From seven, at most seven plus twelve equals nineteen waits can ever complete, so the twentieth blocks whatever the order. From eight, eight then twelve then twelve completes all twenty with the value back at zero, so nothing blocks. The largest value is seven.',
      keyword: 'Answer seven',
      trap: 'Answering eight by looking at the final value. The final value being zero is what makes eight safe, so eight is the largest value with no blocking, not with blocking.',
      narration: 'Twenty waits, twelve signals: at most nineteen can pass from seven, so one blocks. Answer seven.'
    },

    /* ---------------- scene 5: producer-consumer ---------------- */
    {
      id: 'pc-1', start: 120, end: 127.5, scene: 'producer-consumer',
      caption: 'A bounded buffer needs two jobs done: keep the buffer private, and wait for space or an item.',
      detail: 'One semaphore does mutual exclusion on the buffer, and two counting semaphores do the waiting: empty counts free slots, full counts items. The mutex protects the array; the counters protect the arithmetic of how many items exist. Both are needed and they are not interchangeable.',
      keyword: 'two jobs',
      trap: 'Using one semaphore for both jobs. A mutex initialised to one says nothing about whether the buffer is empty, and a counting semaphore says nothing about exclusivity.',
      narration: 'A bounded buffer needs two jobs done: keep the buffer private, and wait for space or an item.'
    },
    {
      id: 'pc-2', start: 127.5, end: 135, scene: 'producer-consumer',
      caption: 'Correct order: wait for a slot, then take the mutex, then insert, then release both.',
      detail: 'The producer waits on empty first, so it sleeps before it takes the mutex, and never holds the mutex while sleeping. The consumer waits on full first, then the mutex. Because a sleeping process holds no mutex, the other side can always make progress, and the buffer fills and drains indefinitely.',
      keyword: 'never holds the mutex while sleeping',
      trap: 'Reversing the two waits because the mutex "comes first" in the code. Order matters here even though both calls are just waits.',
      narration: 'Correct order: wait for a slot, then take the mutex, then insert, then release both.'
    },
    {
      id: 'pc-3', start: 135, end: 142.5, scene: 'producer-consumer',
      caption: 'Swapped: the consumer takes the mutex, finds no item, sleeps holding it.',
      detail: 'This is the GATE 2014 Set 2 Q31 code, where the consumer does semWait(s) and then semWait(n). With an empty buffer the consumer passes the mutex, then blocks on the item count while still holding the mutex. The producer now cannot enter to add the item the consumer is waiting for. Nothing can move.',
      keyword: 'sleeps holding it',
      trap: 'Saying the producer can still run. It reaches semWait(s) and blocks on the mutex, so the item is never produced and the consumer never wakes. This is a genuine deadlock, not a slowdown.',
      narration: 'Swapped: the consumer takes the mutex, finds no item, sleeps holding it.'
    },
    {
      id: 'pc-4', start: 142.5, end: 150, scene: 'producer-consumer',
      caption: 'The rule: never sleep while holding a lock another process needs to wake you.',
      detail: 'The deadlock is a hold-and-wait on a lock: the consumer holds the mutex and waits for an item that only a mutex-holder can create. The general rule is to acquire the resource that can be empty last, and to release the lock before blocking. Stated as a checklist: identify what each process holds while it sleeps, and ask who could ever release it.',
      keyword: 'never sleep while holding a lock',
      trap: 'Fixing it by initialising the item semaphore to one. That admits one item that does not exist, and the consumer reads garbage; the correct fix is the order of the two waits.',
      narration: 'The rule: never sleep while holding a lock another process needs to wake you.'
    },

    /* ---------------- scene 6: monitor ---------------- */
    {
      id: 'mn-1', start: 150, end: 157.5, scene: 'monitor',
      caption: 'A monitor is a module the compiler locks for you: one process inside at a time.',
      detail: 'Shared data and the procedures that touch it are wrapped in one construct, and the language guarantees that at most one process executes any procedure of that monitor at a time. The lock is implicit, so the mutual exclusion cannot be forgotten, which is the whole point.',
      keyword: 'the compiler locks for you',
      trap: 'Thinking a monitor removes the need to think about ordering. It removes the need to remember the mutex; it does not remove the need to know when to wait.',
      narration: 'A monitor is a module the compiler locks for you: one process inside at a time.'
    },
    {
      id: 'mn-2', start: 157.5, end: 165, scene: 'monitor',
      caption: 'Waiting on a condition variable releases the monitor and puts you on that condition queue.',
      detail: 'A condition variable has no value. wait puts the caller on its queue and releases the monitor so somebody else can enter; signal moves one waiter from that queue back to the ready state. Signalling the wrong condition variable, or signalling when nobody waits, does nothing at all.',
      keyword: 'releases the monitor',
      trap: 'Calling wait outside a monitor, or expecting it to remember that it was signalled. There is no memory in a condition variable; a signal with no waiter is lost.',
      narration: 'Waiting on a condition variable releases the monitor and puts you on that condition queue.'
    },
    {
      id: 'mn-3', start: 165, end: 172.5, scene: 'monitor',
      caption: 'After a signal the waiter must re-check its condition, because the state may have changed.',
      detail: 'Under the Mesa semantics used by most languages, signal only makes the waiter runnable; it does not hand over the monitor, so another process may enter first and take the resource. The waiter therefore resumes inside a while loop, not an if. Under Hoare semantics the signaller yields immediately and the condition is guaranteed, which is why textbooks differ on whether the re-check is needed.',
      keyword: 're-check its condition',
      trap: 'Writing if instead of while around wait. Under Mesa semantics that is a real bug, and it is a favourite exam distinction.',
      narration: 'After a signal the waiter must re-check its condition, because the state may have changed.'
    },
    {
      id: 'mn-4', start: 172.5, end: 180, scene: 'monitor',
      caption: 'Semaphores can do everything monitors can; monitors make one class of mistake impossible.',
      detail: 'A monitor with condition variables is equivalent in power to semaphores, and either can be built from the other. The difference is where the discipline lives: with semaphores the programmer must pair every wait with a signal, and with a monitor the language holds the lock and the programmer only decides when to wait.',
      keyword: 'equivalent in power',
      trap: 'Claiming monitors are strictly more powerful. They are safer to use, not more expressive; the equivalence is the standard exam point.',
      narration: 'Semaphores can do everything monitors can; monitors make one class of mistake impossible.'
    },

    /* ---------------- scene 7: deadlock ---------------- */
    {
      id: 'dl-1', start: 180, end: 187.5, scene: 'deadlock',
      caption: 'Four conditions, all needed: exclusion, hold and wait, no preemption, circular wait.',
      detail: 'Deadlock needs a resource held exclusively, a process holding one thing while asking for another, no way to take a resource away, and a cycle of waiting. These are necessary, not sufficient, and each one is a place a prevention scheme can attack. Prevention breaks a condition structurally; avoidance checks each request against a safe state.',
      keyword: 'four conditions',
      trap: 'Treating the four as sufficient. They describe a situation in which deadlock is possible; whether it happens depends on the actual requests, which is why avoidance algorithms exist.',
      narration: 'Four conditions, all needed: exclusion, hold and wait, no preemption, circular wait.'
    },
    {
      id: 'dl-2', start: 187.5, end: 195, scene: 'deadlock',
      caption: 'Draw a resource allocation graph: processes as circles, resources as squares with dots.',
      detail: 'An arrow from a process to a resource is a request; an arrow from a resource to a process is an assignment. With one instance per resource type, each square holds a single dot, and a cycle in this graph is both necessary and sufficient for deadlock. With several instances the same cycle is only necessary.',
      keyword: 'circles and squares',
      trap: 'Drawing a request edge and an assignment edge as the same arrow. The direction carries the meaning, and reversing one turns a safe graph into a deadlocked one.',
      narration: 'Draw a resource allocation graph: processes as circles, resources as squares with dots.'
    },
    {
      id: 'dl-3', start: 195, end: 202.5, scene: 'deadlock',
      caption: 'Two processes, two files, each holding one and asking for the other: a cycle.',
      detail: 'P1 holds the printer and asks for the plotter; P2 holds the plotter and asks for the printer. Following the arrows returns to the start, and with one instance of each resource no process can proceed. The graph is the proof, and the cycle is easy to see, which is why single-instance questions are usually drawn rather than tabulated.',
      keyword: 'a cycle',
      trap: 'Assuming a cycle always means deadlock. That inference is licensed only by the single-instance assumption, and the next scene shows what breaks without it.',
      narration: 'Two processes, two files, each holding one and asking for the other: a cycle.'
    },
    {
      id: 'dl-4', start: 202.5, end: 210, scene: 'deadlock',
      caption: 'Break the cycle by ordering the resources, or by asking for everything at once.',
      detail: 'Number the resource types and require every process to request them in increasing order; a cycle then cannot form, because a cycle would need one arrow going down the numbering. Asking for everything at once breaks hold and wait. Both cost utilisation: the first forbids legal request patterns, the second forces a process to wait for its whole set.',
      keyword: 'ordering the resources',
      trap: 'Confusing prevention with avoidance. Prevention removes a condition for all time; avoidance lets the conditions hold and refuses the request that would make the state unsafe.',
      narration: 'Break the cycle by ordering the resources, or by asking for everything at once.'
    },

    /* ---------------- scene 8: cycle but no deadlock ---------------- */
    {
      id: 'cn-1', start: 210, end: 217.5, scene: 'cycle-not-deadlock',
      caption: 'Two instances of one resource, one of another: draw a cycle and no deadlock.',
      detail: 'Let R1 have two instances and R2 have one. P1 holds one instance of R1 and asks for R2. P2 holds R2 and asks for R1. The arrows form a cycle, P1 to R2 to P2 to R1 and back. Yet a second instance of R1 is free, so P2 can be granted it, finish, and release R2.',
      keyword: 'a cycle and no deadlock',
      trap: 'Applying the single-instance cycle test to a multi-instance graph. It is the most common wrong answer in this topic and it costs two marks quietly.',
      narration: 'Two instances of one resource, one of another: draw a cycle and no deadlock.'
    },
    {
      id: 'cn-2', start: 217.5, end: 225, scene: 'cycle-not-deadlock',
      caption: 'The free instance is the escape hatch: P2 completes, releases R2, P1 proceeds.',
      detail: 'Grant the free R1 instance to P2, which then holds everything it needs, finishes, and releases both. R2 is now free, so P1 can take it and finish. The completion order exists, so the state is not deadlocked. The cycle was real; the deadlock was not.',
      keyword: 'the escape hatch',
      trap: 'Concluding "not deadlocked" from the mere existence of a free instance. What matters is whether a full completion order exists, which is what the safety algorithm checks.',
      narration: 'The free instance is the escape hatch: P2 completes, releases R2, P1 proceeds.'
    },
    {
      id: 'cn-3', start: 225, end: 232.5, scene: 'cycle-not-deadlock',
      caption: 'With multiple instances, test for a completion order, not for a cycle.',
      detail: 'Repeatedly find a process whose remaining request can be met from the available vector, run it to completion, and add its holdings back to the available vector. If every process is eventually selected, the state is safe and therefore not deadlocked. If the scan stalls with processes left, no order exists and the state is deadlocked. This is the detection algorithm and, unchanged, the avoidance check.',
      keyword: 'a completion order',
      trap: 'Looking for a process that can finish "now" only. The available vector grows as processes finish, so an early stall is not a failure; you must rescan after every completion.',
      narration: 'With multiple instances, test for a completion order, not for a cycle.'
    },
    {
      id: 'cn-4', start: 232.5, end: 240, scene: 'cycle-not-deadlock',
      caption: 'Single instance: cycle means deadlock. Several instances: cycle is only a warning.',
      detail: 'This is the distinction the topic is built on. It also explains why the wait-for graph, which collapses each resource to its holder, is valid only when every resource type has one instance: with several instances a process may be waiting for a type, not for a particular holder, and the collapse loses exactly the information that matters.',
      keyword: 'cycle is only a warning',
      trap: 'Collapsing a multi-instance graph into a wait-for graph. The collapse can invent or hide cycles, and the answers that follow are wrong either way.',
      narration: 'Single instance: cycle means deadlock. Several instances: cycle is only a warning.'
    },

    /* ---------------- scene 9: banker ---------------- */
    {
      id: 'bk-1', start: 240, end: 247.5, scene: 'banker',
      caption: 'Banker: grant a request only if some completion order still exists afterwards.',
      detail: 'Each process declares its maximum need in advance. The algorithm computes need as maximum minus allocation, then pretends to run processes to completion while tracking a work vector. A state is safe if such an order exists; the system grants a request only when the resulting state is safe. It is avoidance: the conditions for deadlock may all hold, but the state never becomes unsafe.',
      keyword: 'some completion order',
      trap: 'Confusing safe with deadlock-free in the other direction. A safe state cannot deadlock; an unsafe state may still complete, because safety is a guarantee about the worst case, not a prediction.',
      narration: 'Banker: grant a request only if some completion order still exists afterwards.'
    },
    {
      id: 'bk-2', start: 247.5, end: 255, scene: 'banker',
      caption: 'GATE 2018 Q39: available three of E, three of F, none of G.',
      detail: 'The paper prints allocation and maximum for four processes over resources E, F and G. Need is maximum minus allocation: P0 needs three, three, zero; P1 needs one, zero, two; P2 needs zero, three, zero; P3 needs three, four, one. With available three, three, zero, P0 fits immediately.',
      keyword: 'need is maximum minus allocation',
      trap: 'Subtracting the other way, or forgetting to add the allocation back to the work vector when a process finishes. Both errors change the sequence and can flip the verdict.',
      narration: 'GATE 2018 Q39: available three of E, three of F, none of G.'
    },
    {
      id: 'bk-3', start: 255, end: 262.5, scene: 'banker',
      caption: 'P0 finishes, then P2, then P1, then P3. The state is safe.',
      detail: 'P0 completes and returns its allocation, so work becomes four, three, one. P2 needs zero, three, zero and fits, so work becomes five, three, four. P1 needs one, zero, two and fits, so work becomes six, four, six. P3 needs three, four, one and fits. Every process completes, so a safe sequence exists and the answer to the paper question is that the system is in a safe state.',
      keyword: 'The state is safe',
      trap: 'Stopping at the first process that fits and declaring success. One completion is not a safe sequence; you need all four, which is why the algorithm loops until no progress is possible.',
      narration: 'P0 finishes, then P2, then P1, then P3. The state is safe.'
    },
    {
      id: 'bk-4', start: 262.5, end: 270, scene: 'banker',
      caption: 'One resource type: deadlock is impossible when n times (K minus one) plus one is at most m.',
      detail: 'With n processes, m identical instances and a maximum of K each, the worst case is every process holding K minus one and asking for one more. If one instance is still free, somebody finishes and the rest follow. So n times (K minus one) plus one at most m guarantees no deadlock. GATE 2018 Q24 asks for the largest K with n equal to three and m equal to four, which gives K equal to two.',
      keyword: 'n times (K minus one) plus one',
      trap: 'Using n times K at most m. That requires every process to be able to finish at once, which is far stronger than needed, and it gives the wrong K here.',
      narration: 'One resource type: deadlock is impossible when n times (K minus one) plus one is at most m.'
    },

    /* ---------------- scene 10: recipe ---------------- */
    {
      id: 'rp-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: say what is shared, and whether the statements are atomic.',
      detail: 'Underline every shared variable and every semaphore with its initial value. Then read the sentence that says whether statements are atomic: "each statement executes atomically" and "context switch at any time" give completely different answer sets, and most errors in this topic come from answering under the wrong model.',
      keyword: 'what is shared',
      trap: 'Assuming statements are atomic when the question does not say so. Without that sentence, a switch inside a read-modify-write is legal and the answer set grows.',
      narration: 'Step one: say what is shared, and whether the statements are atomic.'
    },
    {
      id: 'rp-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step two: for a value question, enumerate the extreme interleavings, not the typical one.',
      detail: 'For "possible values" and "number of distinct values", take the schedule that maximises and the schedule that minimises, and check each intermediate value is reachable. For a semaphore, use the permit inequality instead of tracing. For a lock order, look for a cycle in the waits-for relation.',
      keyword: 'the extreme interleavings',
      trap: 'Reporting only the sequential answer. The sequential run is the best case and almost never the question.',
      narration: 'Step two: for a value question, enumerate the extreme interleavings, not the typical one.'
    },
    {
      id: 'rp-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'Step three: for a liveness question, name the property before you name the verdict.',
      detail: 'Decide which of the three requirements is being tested, then construct the state that breaks it: both inside for mutual exclusion, an idle third party for progress, an unbounded queue for bounded waiting. For deadlock, say whether the graph has one instance per type, because that decides whether a cycle is enough.',
      keyword: 'name the property',
      trap: 'Answering "deadlock" when the failing property is progress or starvation. The options are usually distinguished precisely, and a state with an empty critical section is not a deadlock.',
      narration: 'Step three: for a liveness question, name the property before you name the verdict.'
    },
    {
      id: 'rp-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'Five traps: atomicity, the negative semaphore, sleeping under a lock, cycles, and safe against deadlocked.',
      detail: 'One: the atomicity assumption. Two: a negative semaphore value is the queue length, not an error. Three: never sleep while holding a lock the waker needs. Four: a cycle proves deadlock only with single instances. Five: safe means a completion order exists, which is a guarantee, while unsafe only means the guarantee is lost. Those five cover most of the marks in this topic.',
      keyword: 'Five traps',
      trap: 'Memorising algorithms instead of these five sentences. The algorithms are three lines each; the traps are what the paper actually tests.',
      narration: 'Five traps: atomicity, the negative semaphore, sleeping under a lock, cycles, and safe against deadlocked.'
    }
  ]
};
