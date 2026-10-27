# Synchronisation and Deadlock — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/synchronisation-and-deadlock/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The race condition: one counter, two threads

*0:00 – 0:30 · objective: Show that a read-modify-write is three steps, and that interleaving two of them can lose an update.*

**0:00–0:07** — One counter, two threads, and each thread adds one. The answer should be two.

> Caption: One counter, two threads, and each thread adds one. The answer should be two.

Exam-trap caption mode adds: *Treating a high-level statement as one machine step. On most machines it is a load, an add and a store, and a switch between the load and the store is enough to lose an update.*

**0:07–0:15** — The statement is three steps: read the value into a register, add one, write it back.

> Caption: The statement is three steps: read the value into a register, add one, write it back.

Exam-trap caption mode adds: *Believing a switch can only happen between statements. If the question says statements are atomic, the interleavings shrink; if it does not, a switch inside the statement is legal.*

**0:15–0:22** — Both threads read zero, both write one. One increment has disappeared.

> Caption: Both threads read zero, both write one. One increment has disappeared.

Exam-trap caption mode adds: *Assuming the answer must be one value. With no synchronisation there are two legal outcomes here, one and two, and a question that asks for the possible values wants both.*

**0:22–0:30** — Two legal outcomes, one and two. The counter is not wrong; the sequence is unprotected.

> Caption: Two legal outcomes, one and two. The counter is not wrong; the sequence is unprotected.

Exam-trap caption mode adds: *Concluding that the program is wrong. It is correct under the assumption that the statement is atomic, and that assumption is what the hardware does not give you.*

## Scene 2. The three requirements, and strict alternation

*0:30 – 1:00 · objective: State mutual exclusion, progress and bounded waiting, and show a solution that satisfies the first and fails the second.*

**0:30–0:37** — A critical section is the part that touches shared data. Three promises are asked of it.

> Caption: A critical section is the part that touches shared data. Three promises are asked of it.

Exam-trap caption mode adds: *Treating the three as one requirement. A solution can be safe and still starve, and GATE asks for the specific property that fails rather than for "correct" or "incorrect".*

**0:37–0:45** — Strict alternation: one variable, turn, and each process waits for its own value.

> Caption: Strict alternation: one variable, turn, and each process waits for its own value.

Exam-trap caption mode adds: *Reading the loop as a lock. It is not a lock; it is a baton, and a baton can be held by a process that is not running.*

**0:45–0:52** — Mutual exclusion holds: turn cannot be zero and one at the same time.

> Caption: Mutual exclusion holds: turn cannot be zero and one at the same time.

Exam-trap caption mode adds: *Concluding "correct" after checking mutual exclusion. Safety is necessary and not sufficient, and this solution is the standard proof of that.*

**0:52–1:00** — Turn one, process one in its remainder, process zero waiting: progress fails.

> Caption: Turn one, process one in its remainder, process zero waiting: progress fails.

Exam-trap caption mode adds: *Calling this a deadlock. No process holds the critical section here, so the progress requirement is the precise charge; calling it a deadlock invites the wrong answer option.*

## Scene 3. Peterson's algorithm: flags plus a turn

*1:00 – 1:30 · objective: Trace the two-process solution and verify all three requirements by enumerating its reachable states.*

**1:00–1:07** — Two flags and one turn: each process raises its flag, then offers the turn to the other.

> Caption: Two flags and one turn: each process raises its flag, then offers the turn to the other.

Exam-trap caption mode adds: *Dropping the turn variable and keeping only the flags. Two flags alone deadlock when both are raised at once, which is the classic reason the second variable exists.*

**1:07–1:15** — Both raise their flags; the second writer of turn loses the tie, and waits.

> Caption: Both raise their flags; the second writer of turn loses the tie, and waits.

Exam-trap caption mode adds: *Thinking the loser waits forever. It waits only while the winner is inside; the winner lowers its flag on exit, which frees the loser immediately.*

**1:15–1:22** — Thirty-four reachable states, counting the finished one, and none has both inside.

> Caption: Thirty-four reachable states, counting the finished one, and none has both inside.

Exam-trap caption mode adds: *Claiming the algorithm is correct on real hardware because it is correct on paper. Without memory ordering guarantees the two writes can be observed in the wrong order; the algorithm is correct under sequential consistency.*

**1:22–1:30** — Progress holds and waiting is bounded: a process waits for at most one entry by the other.

> Caption: Progress holds and waiting is bounded: a process waits for at most one entry by the other.

Exam-trap caption mode adds: *Assuming the two-process solution scales. The Bakery algorithm extends the idea with ticket numbers; Peterson does not extend by adding flags alone.*

## Scene 4. Semaphores: a permit counter with a queue

*1:30 – 2:00 · objective: Read wait and signal as a counter that can go negative, and use the permit invariant to answer counting questions.*

**1:30–1:37** — A semaphore is an integer plus a queue, touched only by wait and signal.

> Caption: A semaphore is an integer plus a queue, touched only by wait and signal.

Exam-trap caption mode adds: *Believing the value can never be negative. In the counting definition the value is minus the number of blocked processes, so a negative reading is information, not an error.*

**1:37–1:45** — Value five, three waits: two left, nobody blocked.

> Caption: Value five, three waits: two left, nobody blocked.

Exam-trap caption mode adds: *Mixing up the value with the number of processes inside. The number inside is initial minus current, and it is the value that carries the queue length when negative.*

**1:45–1:52** — Waits minus signals cannot exceed the initial value plus the signals that ran.

> Caption: Waits minus signals cannot exceed the initial value plus the signals that ran.

Exam-trap caption mode adds: *Tracing one order and generalising. The question says "in some order", so the answer must hold for the worst order, which is all the waits first.*

**1:52–2:00** — Twenty waits, twelve signals: at most nineteen can pass from seven, so one blocks. Answer seven.

> Caption: Twenty waits, twelve signals: at most nineteen can pass from seven, so one blocks. Answer seven.

Exam-trap caption mode adds: *Answering eight by looking at the final value. The final value being zero is what makes eight safe, so eight is the largest value with no blocking, not with blocking.*

## Scene 5. Producer and consumer: the order that deadlocks

*2:00 – 2:30 · objective: Run the bounded buffer with the two wait calls in each order, and see which order can deadlock and why.*

**2:00–2:07** — A bounded buffer needs two jobs done: keep the buffer private, and wait for space or an item.

> Caption: A bounded buffer needs two jobs done: keep the buffer private, and wait for space or an item.

Exam-trap caption mode adds: *Using one semaphore for both jobs. A mutex initialised to one says nothing about whether the buffer is empty, and a counting semaphore says nothing about exclusivity.*

**2:07–2:15** — Correct order: wait for a slot, then take the mutex, then insert, then release both.

> Caption: Correct order: wait for a slot, then take the mutex, then insert, then release both.

Exam-trap caption mode adds: *Reversing the two waits because the mutex "comes first" in the code. Order matters here even though both calls are just waits.*

**2:15–2:22** — Swapped: the consumer takes the mutex, finds no item, sleeps holding it.

> Caption: Swapped: the consumer takes the mutex, finds no item, sleeps holding it.

Exam-trap caption mode adds: *Saying the producer can still run. It reaches semWait(s) and blocks on the mutex, so the item is never produced and the consumer never wakes. This is a genuine deadlock, not a slowdown.*

**2:22–2:30** — The rule: never sleep while holding a lock another process needs to wake you.

> Caption: The rule: never sleep while holding a lock another process needs to wake you.

Exam-trap caption mode adds: *Fixing it by initialising the item semaphore to one. That admits one item that does not exist, and the consumer reads garbage; the correct fix is the order of the two waits.*

## Scene 6. Monitors and condition variables

*2:30 – 3:00 · objective: Explain why a monitor holds its own lock, what wait on a condition variable releases, and why a signal with no waiter is lost.*

**2:30–2:37** — A monitor is a module the compiler locks for you: one process inside at a time.

> Caption: A monitor is a module the compiler locks for you: one process inside at a time.

Exam-trap caption mode adds: *Thinking a monitor removes the need to think about ordering. It removes the need to remember the mutex; it does not remove the need to know when to wait.*

**2:37–2:45** — Waiting on a condition variable releases the monitor and puts you on that condition queue.

> Caption: Waiting on a condition variable releases the monitor and puts you on that condition queue.

Exam-trap caption mode adds: *Calling wait outside a monitor, or expecting it to remember that it was signalled. There is no memory in a condition variable; a signal with no waiter is lost.*

**2:45–2:52** — After a signal the waiter must re-check its condition, because the state may have changed.

> Caption: After a signal the waiter must re-check its condition, because the state may have changed.

Exam-trap caption mode adds: *Writing if instead of while around wait. Under Mesa semantics that is a real bug, and it is a favourite exam distinction.*

**2:52–3:00** — Semaphores can do everything monitors can; monitors make one class of mistake impossible.

> Caption: Semaphores can do everything monitors can; monitors make one class of mistake impossible.

Exam-trap caption mode adds: *Claiming monitors are strictly more powerful. They are safer to use, not more expressive; the equivalence is the standard exam point.*

## Scene 7. Deadlock: four conditions and a cycle

*3:00 – 3:30 · objective: Name the four Coffman conditions, and read a cycle in a single-instance resource graph as a deadlock.*

**3:00–3:07** — Four conditions, all needed: exclusion, hold and wait, no preemption, circular wait.

> Caption: Four conditions, all needed: exclusion, hold and wait, no preemption, circular wait.

Exam-trap caption mode adds: *Treating the four as sufficient. They describe a situation in which deadlock is possible; whether it happens depends on the actual requests, which is why avoidance algorithms exist.*

**3:07–3:15** — Draw a resource allocation graph: processes as circles, resources as squares with dots.

> Caption: Draw a resource allocation graph: processes as circles, resources as squares with dots.

Exam-trap caption mode adds: *Drawing a request edge and an assignment edge as the same arrow. The direction carries the meaning, and reversing one turns a safe graph into a deadlocked one.*

**3:15–3:22** — Two processes, two files, each holding one and asking for the other: a cycle.

> Caption: Two processes, two files, each holding one and asking for the other: a cycle.

Exam-trap caption mode adds: *Assuming a cycle always means deadlock. That inference is licensed only by the single-instance assumption, and the next scene shows what breaks without it.*

**3:22–3:30** — Break the cycle by ordering the resources, or by asking for everything at once.

> Caption: Break the cycle by ordering the resources, or by asking for everything at once.

Exam-trap caption mode adds: *Confusing prevention with avoidance. Prevention removes a condition for all time; avoidance lets the conditions hold and refuses the request that would make the state unsafe.*

## Scene 8. A cycle is not always a deadlock

*3:30 – 4:00 · objective: Show a multi-instance graph with a cycle that still has a safe completion order, and say which condition licenses the cycle test.*

**3:30–3:37** — Two instances of one resource, one of another: draw a cycle and no deadlock.

> Caption: Two instances of one resource, one of another: draw a cycle and no deadlock.

Exam-trap caption mode adds: *Applying the single-instance cycle test to a multi-instance graph. It is the most common wrong answer in this topic and it costs two marks quietly.*

**3:37–3:45** — The free instance is the escape hatch: P2 completes, releases R2, P1 proceeds.

> Caption: The free instance is the escape hatch: P2 completes, releases R2, P1 proceeds.

Exam-trap caption mode adds: *Concluding "not deadlocked" from the mere existence of a free instance. What matters is whether a full completion order exists, which is what the safety algorithm checks.*

**3:45–3:52** — With multiple instances, test for a completion order, not for a cycle.

> Caption: With multiple instances, test for a completion order, not for a cycle.

Exam-trap caption mode adds: *Looking for a process that can finish "now" only. The available vector grows as processes finish, so an early stall is not a failure; you must rescan after every completion.*

**3:52–4:00** — Single instance: cycle means deadlock. Several instances: cycle is only a warning.

> Caption: Single instance: cycle means deadlock. Several instances: cycle is only a warning.

Exam-trap caption mode adds: *Collapsing a multi-instance graph into a wait-for graph. The collapse can invent or hide cycles, and the answers that follow are wrong either way.*

## Scene 9. Banker's algorithm and the resource bound

*4:00 – 4:30 · objective: Run the safety check on a printed GATE table, and use n(K-1)+1 <= m to answer the single-resource-type version.*

**4:00–4:07** — Banker: grant a request only if some completion order still exists afterwards.

> Caption: Banker: grant a request only if some completion order still exists afterwards.

Exam-trap caption mode adds: *Confusing safe with deadlock-free in the other direction. A safe state cannot deadlock; an unsafe state may still complete, because safety is a guarantee about the worst case, not a prediction.*

**4:07–4:15** — GATE 2018 Q39: available three of E, three of F, none of G.

> Caption: GATE 2018 Q39: available three of E, three of F, none of G.

Exam-trap caption mode adds: *Subtracting the other way, or forgetting to add the allocation back to the work vector when a process finishes. Both errors change the sequence and can flip the verdict.*

**4:15–4:22** — P0 finishes, then P2, then P1, then P3. The state is safe.

> Caption: P0 finishes, then P2, then P1, then P3. The state is safe.

Exam-trap caption mode adds: *Stopping at the first process that fits and declaring success. One completion is not a safe sequence; you need all four, which is why the algorithm loops until no progress is possible.*

**4:22–4:30** — One resource type: deadlock is impossible when n times (K minus one) plus one is at most m.

> Caption: One resource type: deadlock is impossible when n times (K minus one) plus one is at most m.

Exam-trap caption mode adds: *Using n times K at most m. That requires every process to be able to finish at once, which is far stronger than needed, and it gives the wrong K here.*

## Scene 10. The procedure for any question in this topic

*4:30 – 5:00 · objective: Fix a four-step procedure and the five traps that account for most lost marks here.*

**4:30–4:37** — Step one: say what is shared, and whether the statements are atomic.

> Caption: Step one: say what is shared, and whether the statements are atomic.

Exam-trap caption mode adds: *Assuming statements are atomic when the question does not say so. Without that sentence, a switch inside a read-modify-write is legal and the answer set grows.*

**4:37–4:45** — Step two: for a value question, enumerate the extreme interleavings, not the typical one.

> Caption: Step two: for a value question, enumerate the extreme interleavings, not the typical one.

Exam-trap caption mode adds: *Reporting only the sequential answer. The sequential run is the best case and almost never the question.*

**4:45–4:52** — Step three: for a liveness question, name the property before you name the verdict.

> Caption: Step three: for a liveness question, name the property before you name the verdict.

Exam-trap caption mode adds: *Answering "deadlock" when the failing property is progress or starvation. The options are usually distinguished precisely, and a state with an empty critical section is not a deadlock.*

**4:52–5:00** — Five traps: atomicity, the negative semaphore, sleeping under a lock, cycles, and safe against deadlocked.

> Caption: Five traps: atomicity, the negative semaphore, sleeping under a lock, cycles, and safe against deadlocked.

Exam-trap caption mode adds: *Memorising algorithms instead of these five sentences. The algorithms are three lines each; the traps are what the paper actually tests.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
