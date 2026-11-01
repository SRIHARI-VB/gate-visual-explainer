# Priority Inversion And Inheritance — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/priority-inversion-and-inheritance/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The wait that should not happen

*0:00 – 0:30 · objective: Read a three-job schedule in which the highest-priority job waits 10 time units for a critical section that is only 3 units long, and say exactly what the other 7 units are.*

**0:00–0:07** — Three jobs. J1 is the most urgent, J2 the middle, J3 the least. J1 and J3 share one lock. J2 never touches it.

> Caption: Three jobs: J1 has the highest priority, J2 the middle, J3 the lowest.

Exam-trap caption mode adds: *Smaller number means higher priority in this lesson. Reversing that convention reverses every comparison on the page.*

**0:07–0:15** — J3 takes the lock. J1 arrives, asks for it, and is refused, because the lock really is held.

> Caption: J3 takes the lock. J1 arrives, asks for it, and is blocked — correctly, since the lock is held.

Exam-trap caption mode adds: *The blocking at time 4 is not the problem. Every correct lock does this. The problem is what happens next.*

**0:15–0:22** — J2 then runs its whole eight units. It does not want the lock. It simply outranks the job that holds it.

> Caption: J2 then runs its whole 8 units, because it outranks J3 and never needs the lock.

Exam-trap caption mode adds: *A job that shares no data with anyone can still delay the most urgent job in the system, purely by being more urgent than the lock holder.*

**0:22–0:30** — J1 waits ten units for a three-unit critical section. Three are the section. Seven are the unrelated middle job. That is priority inversion.

> Caption: J1 waits 10 units for a 3-unit section. That is priority inversion.

Exam-trap caption mode adds: *It is not deadlock. Nothing is waiting in a cycle and the wait does end. Ten units is a bounded wait; it is just the wrong size.*

## Scene 2. Why the wait is unbounded

*0:30 – 1:00 · objective: Sweep the length of the middle job and the number of middle jobs, and see the high-priority wait grow without any change to the critical section it is waiting for.*

**0:30–0:37** — Lengthen the middle job by one unit and the wait grows by one unit. The wait is two plus L.

> Caption: Lengthen the middle job by one unit and J1's wait grows by one unit: 2 + L.

Exam-trap caption mode adds: *The number of units J1 waits is not a property of the lock or of the section. It is a property of work that has nothing to do with either.*

**0:37–0:45** — Add a second middle job and the wait becomes eighteen. Six middle jobs give fifty.

> Caption: Add a second middle job and the wait becomes 18. Six middle jobs give 50.

Exam-trap caption mode adds: *This is what "unbounded" means: there is no constant that bounds the wait, because the system designer does not bound the amount of unrelated middle-priority work.*

**0:45–0:52** — The inversion is unbounded. No constant limits the wait. Only the amount of middle work does.

> Caption: The inversion is unbounded: no constant limits the wait, only the middle work does.

Exam-trap caption mode adds: *Bounded and short are different claims. A wait can be bounded and still far too long; it can also be short in every test and unbounded in principle.*

**0:52–1:00** — The wait is bounded only by the middle work, and the middle work is not part of the argument you wanted to make.

> Caption: The wait is bounded by the middle work, and the middle work is not part of the argument.

Exam-trap caption mode adds: *A proof that quotes the critical section length as the bound is quoting the wrong quantity.*

## Scene 3. Basic priority inheritance

*1:00 – 1:30 · objective: Apply the one rule — a job holding a lock runs at the best priority among the jobs it blocks — and watch the same schedule give a wait of 2 instead of 10.*

**1:00–1:07** — The fix is one rule. While J3 holds a lock that J1 is blocked on, J3 runs at J1's priority.

> Caption: The fix is one rule: while J3 holds a lock that J1 is blocked on, J3 runs at J1's priority.

Exam-trap caption mode adds: *The waiter is not promoted and the holder is not made permanently important. The holder borrows the priority for the length of the section, then gives it back.*

**1:07–1:15** — J2 can no longer preempt the holder. J1 now waits two units instead of ten.

> Caption: J2 can no longer preempt the holder, so J1 waits 2 units instead of 10.

Exam-trap caption mode adds: *The saved 8 units did not go to J1. They were taken from J2, which is the correct trade: J2 has no deadline pressure that outranks J1.*

**1:15–1:22** — J3's priority changes twice. Up when J1 blocks on it, back down when the section ends.

> Caption: J3's priority changes twice: up when J1 blocks, back down when the section ends.

Exam-trap caption mode adds: *Inheritance is transitive: if J3 blocks J2 and J2 blocks J1, J3 takes J1's priority, not J2's.*

**1:22–1:30** — Inheritance removes the inversion but keeps the blocking. Two units is still a wait, and it is now the right two units.

> Caption: Inheritance removes the inversion but keeps the blocking: 2 units is still a wait.

Exam-trap caption mode adds: *Push-through blocking is the name for J2's loss. It is a cost of the protocol, not a failure of it.*

## Scene 4. The priority ceiling

*1:30 – 2:00 · objective: Compute each semaphore's ceiling and apply the admission test, including the case where a job is refused a lock it could have taken.*

**1:30–1:37** — Each semaphore gets a ceiling, which is the highest priority of any job that may lock it.

> Caption: Each semaphore gets a ceiling: the highest priority of any job that may lock it.

Exam-trap caption mode adds: *The ceiling is a property of the semaphore and the job set, not of the current state. It does not change as jobs come and go.*

**1:37–1:45** — A job may enter a section only if its priority is above every ceiling currently locked by another job.

> Caption: A job may enter a section only if its priority is above every ceiling currently locked by others.

Exam-trap caption mode adds: *The test is applied before the lock is even examined. A job can be refused a semaphore that is completely free.*

**1:45–1:52** — So J1 is blocked on S2 while asking for S1, a lock it does not want at all.

> Caption: So J1 is blocked on S2 while asking for S1 — a lock it does not want.

Exam-trap caption mode adds: *This looks like a bug the first time you see it. It is the mechanism: refusing entry is what stops a chain of locks forming.*

**1:52–2:00** — Three kinds of blocking: direct, push-through and ceiling. All three appear in the traces on this page.

> Caption: Three kinds of blocking: direct, push-through and ceiling.

Exam-trap caption mode adds: *A question that says "blocked" without naming the kind is asking you to say which of the three it is.*

## Scene 5. Chained blocking, and what the ceiling buys

*2:00 – 2:30 · objective: Count blocking episodes rather than ticks: inheritance allows two, the ceiling protocol one, and the worst-case bound falls from min(n, m) critical sections to one.*

**2:00–2:07** — J1 needs two locks in sequence. Under inheritance it is blocked twice: once on each lock.

> Caption: J1 needs two locks in sequence. Under inheritance it is blocked twice.

Exam-trap caption mode adds: *Chained blocking is legal and bounded. It is not a deadlock, because each wait ends when its own holder finishes.*

**2:07–2:15** — The bound under inheritance is the smaller of the two counts: two lower jobs, two semaphores, so two critical sections.

> Caption: The bound under inheritance is min(n, m) critical sections: here min(2, 2) = 2.

Exam-trap caption mode adds: *The bound is a count of sections, not a count of ticks. Two sections of unknown length are still an unbounded delay in time.*

**2:15–2:22** — The ceiling protocol gives one episode instead of two, because J2 is never allowed to hold the second lock.

> Caption: The ceiling protocol gives one episode instead of two.

Exam-trap caption mode adds: *Prevention here is prevention of the lock being taken, not of the wait existing. J1 still waits once.*

**2:22–2:30** — Eight ticks in both, but one episode against two. The guarantee improved, not this particular run.

> Caption: The same 8 ticks in both, but 1 episode against 2 — the bound improved, not this run.

Exam-trap caption mode adds: *This is the trap in "the ceiling protocol blocks less". In one trace it can block the same amount, or more. It is the worst case that shrinks.*

## Scene 6. Inheritance does not prevent deadlock

*2:30 – 3:00 · objective: Build the two-job, two-lock cycle that inheritance cannot break and the ceiling test refuses to enter, and count the deadlocks over every release-time pair.*

**2:30–2:37** — Two jobs, two locks, opposite order. Each holds one and wants the other.

> Caption: Two jobs, two locks, opposite order. J1 holds S1 and wants S2; J2 holds S2 and wants S1.

Exam-trap caption mode adds: *The cause is the lock order, not the priorities. Swapping the priorities reproduces the same cycle.*

**2:37–2:45** — The model deadlocks at time four under inheritance. Both jobs are blocked and neither finishes.

> Caption: The model deadlocks at time 4 under inheritance: both jobs blocked, neither finished.

Exam-trap caption mode adds: *A protocol that fixes inversion is not thereby a protocol that fixes deadlock. The 1990 paper says so explicitly.*

**2:45–2:52** — The ceiling test refuses the second lock, so the cycle cannot close, and both jobs finish.

> Caption: The ceiling test refuses the second lock, so the cycle cannot close. All jobs finish.

Exam-trap caption mode adds: *Preventing deadlock here is a consequence of the admission rule, not of any deadlock detector.*

**2:52–3:00** — Over all one hundred and twenty-one release-time pairs: thirty-one deadlocks under inheritance, none under the ceiling.

> Caption: Over all 121 release-time pairs: 31 deadlocks under inheritance, none under the ceiling.

Exam-trap caption mode adds: *A measured zero is evidence, not a proof. The proof is the paper's, and the page says which is which.*

## Scene 7. The Mars Pathfinder reset

*3:00 – 3:30 · objective: Map every role in the three-job trace onto the 1997 spacecraft, and see why the same schedule that is fine in a lab is not fine against a deadline.*

**3:00–3:07** — Mars Pathfinder, nineteen ninety-seven. A low-priority weather task held a mutex that the bus task needed.

> Caption: Mars Pathfinder, 1997: a low-priority weather task held a mutex the bus task needed.

Exam-trap caption mode adds: *The names matter less than the shape: low priority, a shared mutex, and a high-priority job that needs it. That is scene 1.*

**3:07–3:15** — Several medium-priority tasks ran first, so the holder could not release the mutex.

> Caption: Several medium-priority tasks ran first, so the holder could not release.

Exam-trap caption mode adds: *This is the J2 of scene 1, several times over. The medium jobs did nothing wrong; they were simply more urgent than the holder.*

**3:15–3:22** — The bus task missed its deadline, the watchdog fired, and the spacecraft reset itself.

> Caption: The bus task missed its 8 Hz deadline, the watchdog fired, and the spacecraft reset.

Exam-trap caption mode adds: *A missed deadline, not a crash and not a deadlock. The system was doing exactly what its code said.*

**3:22–3:30** — The fix was one creation flag. Turn priority inheritance on for that mutex, and the resets stopped.

> Caption: The fix was one creation flag: turn priority inheritance on for that mutex.

Exam-trap caption mode adds: *This is the strongest evidence that the three-job trace is not a toy: the exact same schedule ended a day of a planetary mission.*

## Scene 8. Inversion, deadlock, starvation

*3:30 – 4:00 · objective: Separate the three ways a job can fail to run, and separate bounded inversion from unbounded inversion.*

**3:30–3:37** — Inversion is a wait whose length is decided by the wrong job. It ends. It is just the wrong size.

> Caption: Inversion: the wait ends, but its length is set by the wrong job.

Exam-trap caption mode adds: *Inversion does not require a bug in the lock. A perfectly correct mutex produces it.*

**3:37–3:45** — Deadlock is a wait that never ends, because the waits form a cycle.

> Caption: Deadlock: the wait never ends, because the waits form a cycle.

Exam-trap caption mode adds: *Inversion bounded by a section of unknown length is not deadlock. It is still finite.*

**3:45–3:52** — Starvation is a job that is runnable the whole time and never chosen. No lock and no cycle are involved.

> Caption: Starvation: a job is runnable the whole time and never chosen.

Exam-trap caption mode adds: *Blocked, starved and deadlocked are three different states. A question that says "waiting" without saying which is under-specified.*

**3:52–4:00** — Being blocked by a more urgent job is not inversion at all. Inversion is waiting for a less urgent job.

> Caption: And being blocked by a more urgent job is not inversion at all.

Exam-trap caption mode adds: *Every inversion is a wait; not every wait is an inversion. Check the direction before naming it.*

## Scene 9. The question shapes

*4:00 – 4:30 · objective: Match each question shape to the one quantity it asks for, with this page's computed answer beside each shape.*

**4:00–4:07** — First shape: given a trace, how long is the highest-priority job blocked? Subtract the two times, and do not answer with the section length.

> Caption: Shape one: given a trace, how long is the high-priority job blocked?

Exam-trap caption mode adds: *The tempting answer is the critical-section length. It is right only when inheritance is on.*

**4:07–4:15** — Second shape: how many blocking episodes, and what is the bound? The smaller of the job count and the semaphore count, or one section.

> Caption: Shape two: how many blocking episodes, and what is the worst-case bound?

Exam-trap caption mode adds: *Two sections of unknown length do not give a bound in time. If the question asks for a time bound, the section lengths must be given.*

**4:15–4:22** — Third shape: which protocol deadlocks? Look for nested locks in opposite orders. The ceiling test refuses entry; inheritance does not.

> Caption: Shape three: which protocol deadlocks on this program, and which does not?

Exam-trap caption mode adds: *A total order on the locks also removes the cycle. That is a different repair, and it is not a protocol.*

**4:22–4:30** — Fourth shape: compute a ceiling. Fifth: say exactly what a protocol guarantees, and by what quantity.

> Caption: Shape four: compute a ceiling. Shape five: state what a protocol guarantees.

Exam-trap caption mode adds: *"Prevents priority inversion" is not a guarantee anyone proves. Both protocols bound the blocking; neither makes the wait zero.*

## Scene 10. Four traps

*4:30 – 5:00 · objective: Name the four beliefs that cost marks: inversion is deadlock, inheritance raises the waiter, ceiling blocking is a bug, and the ceiling protocol always blocks less.*

**4:30–4:37** — First trap: priority inversion is not deadlock. The wait here ends, and every job finishes.

> Caption: Trap 1: priority inversion is not deadlock. The wait here ends.

Exam-trap caption mode adds: *A trace that completes cannot be a deadlock, however long the waits inside it were.*

**4:37–4:45** — Second trap: inheritance raises the holder, never the waiter. J1 keeps its priority; J3 borrows it.

> Caption: Trap 2: inheritance raises the holder, never the waiter.

Exam-trap caption mode adds: *The borrowed priority is the highest among the jobs blocked, not the sum, and not the highest in the system.*

**4:45–4:52** — Third trap: ceiling blocking is not a bug. A lock that is free may be refused, on purpose.

> Caption: Trap 3: ceiling blocking is not a bug. A free lock may be refused.

Exam-trap caption mode adds: *If a question says the ceiling protocol never refuses a free lock, it has confused it with inheritance.*

**4:52–5:00** — Fourth trap: the ceiling protocol does not always block less. The worst case shrinks. This run does not.

> Caption: Trap 4: the ceiling protocol does not always block less. The bound shrinks, not the run.

Exam-trap caption mode adds: *Answer a bound question with a bound and a trace question with a trace. Swapping them is how this trap is written.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
