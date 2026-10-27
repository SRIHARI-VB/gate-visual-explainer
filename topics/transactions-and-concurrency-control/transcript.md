# Transactions and Concurrency Control — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/transactions-and-concurrency-control/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why a database cannot just run transactions one at a time

*0:00 – 0:30 · objective: See an interleaving lose an update, and name the four properties that would have prevented it.*

**0:00–0:07** — Start with the problem the whole chapter exists to solve. Two transactions each move money, and both touch the same balance. Run them one after the other, and the arithmetic is correct.

> Caption: Two transactions, one account balance. Run them one after the other and the arithmetic is right.

Exam-trap caption mode adds: *The serial schedule is always correct. Nothing in this chapter is about making a serial schedule right — it is about keeping a concurrent one equivalent to it.*

**0:07–0:15** — Now interleave the same two transactions. Both read the old balance before either writes. Both compute from the same stale number. The second write overwrites the first, and one hundred rupees disappear.

> Caption: Interleave them and the second read happens before the first write lands. One update is lost.

Exam-trap caption mode adds: *A lost update produces no error message. That is why the guarantee has to be enforced by the system, not detected afterwards.*

**0:15–0:22** — The fix is not to forbid concurrency. It is to demand something weaker and achievable: whatever order the operations actually ran in, the outcome must match some serial order of the same transactions.

> Caption: The fix is not "run serially". It is "run concurrently, but only in orders a serial run would allow".

**0:22–0:30** — That demand is called serialisability. Everything else in this lesson is either a way to test it after the fact or a protocol that guarantees it in advance.

> Caption: That demand has a name — serialisability — and it is the centre of this lesson.

## Scene 2. ACID, and the mechanism each letter buys

*0:30 – 1:00 · objective: Attach every letter of ACID to the component that enforces it, so isolation stops being a slogan.*

**0:30–0:37** — The four letters are four different promises, and each is kept by a different part of the system. Atomicity is all or nothing, and it is kept by the log and undo during recovery.

> Caption: Atomicity: all of the transaction or none of it. Enforced by the log and undo on restart.

**0:37–0:45** — Consistency means a transaction carries the database from one valid state to another. Declared constraints cover part of it, and the rest is the application's job — which is why this letter is the weakest of the four.

> Caption: Consistency: a transaction takes one valid state to another. Enforced by constraints and by the application.

**0:45–0:52** — Isolation is the letter this lesson is about. A concurrent execution must be equivalent to some serial order, and locks, timestamps or validation are what enforce it.

> Caption: Isolation: concurrent execution must look like some serial order. Enforced by the concurrency-control protocol.

Exam-trap caption mode adds: *Isolation is not "no interleaving". It is "no interleaving whose result a serial order could not have produced".*

**0:52–1:00** — Durability means a committed write survives a power cut, and the write-ahead rule is what buys it: the log record reaches stable storage before the commit is acknowledged.

> Caption: Durability: a committed write survives a crash. Enforced by force-writing the log before commit is acknowledged.

## Scene 3. The conflict: same item, two transactions, one write

*1:00 – 1:30 · objective: State the three-part test for a conflict and reject the pairs that only look like one.*

**1:00–1:07** — Now the definition everything rests on. Two operations conflict when three things hold at once: same data item, different transactions, and at least one of them is a write.

> Caption: Two operations conflict when they are on the same item, from different transactions, and at least one writes.

Exam-trap caption mode adds: *Two reads of the same item never conflict, however many transactions are involved. Reading does not change the value.*

**1:07–1:15** — There are exactly three shapes. A read followed by a write, a write followed by a read, and a write followed by a write. Read followed by read is not on the list, and that single omission is where most marks are won.

> Caption: Three shapes: read-write, write-read, write-write. Read-read is the one that is not a conflict.

**1:15–1:22** — Each conflict fixes an order. The operation that came first must still come first in any serial schedule that is equivalent. That fixed order is the edge we are about to draw.

> Caption: A conflict pins an order: the earlier operation must stay earlier in any equivalent serial schedule.

**1:22–1:30** — So conflict serialisability is exactly the question of whether all those pinned orders can be satisfied at once. A set of orders can be satisfied at once exactly when it has no cycle.

> Caption: So a schedule is conflict serialisable exactly when those pinned orders are mutually consistent.

## Scene 4. The precedence graph decides conflict serialisability

*1:30 – 2:00 · objective: Draw the graph for both schedules of GATE CSE 2014 Set 3 and read the cycle off it.*

**1:30–1:37** — Here is a real question. Three transactions over three items, and two schedules using the same operations. Draw one vertex per transaction and add an edge for every conflict.

> Caption: GATE CSE 2014 Set 3 gives three transactions and two schedules. One vertex per transaction.

**1:37–1:45** — In the first schedule, T2 reads Y before T3 writes it, T3 reads X before T1 writes it, and T2 writes Z before T1 reads it. Three edges, no cycle, and the only topological order is T2 then T3 then T1.

> Caption: Schedule S1 gives T2 to T3 on Y, T3 to T1 on X, and T2 to T1 on Z. No cycle.

Exam-trap caption mode adds: *The answer is the schedule, not the serial order. The question asks which statement about the schedules is true.*

**1:45–1:52** — The second schedule moves one read on Z to the front. Now T1 precedes T2 on Z while T2 still precedes T1 on Z. Both edges exist, so there is a cycle, and no serial order can reproduce that schedule.

> Caption: Schedule S2 reverses one pair on Z, and now T1 to T2 and T2 to T1 both appear. Cycle.

Exam-trap caption mode adds: *A single reversed pair is enough. You do not need the whole graph to look wrong.*

**1:52–2:00** — So only the first schedule is conflict serialisable, which is option A. Two schedules that look almost identical are separated by one edge, and the graph finds it without guessing.

> Caption: So only S1 is conflict serialisable — option A. The graph, not intuition, decided it.

## Scene 5. View serialisability, and the blind write that separates them

*2:00 – 2:30 · objective: Show a schedule with a cycle in its precedence graph that is still equivalent to a serial one.*

**2:00–2:07** — Conflict serialisability is a sufficient condition, not a necessary one. A schedule can be equivalent to a serial order and still have a cycle in its precedence graph. The weaker definition is called view equivalence.

> Caption: Conflict serialisability is sufficient, not necessary. Some schedules are equivalent to a serial one and still have a cycle.

**2:07–2:15** — Here is the shape that makes it happen. One transaction reads and writes A. Two others write A without ever reading it. A write that reads nothing first is called a blind write.

> Caption: Take T1 reading and writing A, and T2 and T3 each writing A without reading it.

Exam-trap caption mode adds: *A blind write is not an error. It is the structural feature that makes view serialisability strictly larger than conflict serialisability.*

**2:15–2:22** — Run the four operations in that order. T1 reads the initial value and T3 writes last, which is exactly what the serial order T1, T2, T3 does. So the schedule is view serialisable, even though its graph has a cycle.

> Caption: In r1(A), w2(A), w1(A), w3(A) the graph has a cycle, yet T1 reads the initial value and T3 writes last — exactly as in the serial order T1, T2, T3.

**2:22–2:30** — The containment is strict and it runs one way. Every conflict-serialisable schedule is view serialisable, and the blind-write example is the witness that the converse fails. Testing view serialisability in general is hard, which is why practical protocols aim at the stronger property.

> Caption: The containment is strict: conflict serialisable sits inside view serialisable, which sits inside serialisable.

Exam-trap caption mode adds: *GATE asks for view serialisability only when blind writes are present. Without a blind write the two notions coincide on two transactions.*

## Scene 6. Counting: 70 interleavings, 54 of them conflict serialisable

*2:30 – 3:00 · objective: Reproduce the GATE CSE 2017 Set 2 count by enumeration rather than by a remembered formula.*

**2:30–2:37** — Now the counting question from GATE 2017 Set 2. Two transactions of four operations each. Their internal order is fixed, and only the interleaving may vary.

> Caption: GATE CSE 2017 Set 2 asks how many conflict-serialisable schedules two four-operation transactions can form.

**2:37–2:45** — Choosing which four of the eight slots belong to T1 fixes everything, because each transaction fills its own slots in order. That is seventy schedules in total.

> Caption: Total interleavings: choose 4 of the 8 positions for T1. That is 70.

Exam-trap caption mode adds: *The base case is always the binomial coefficient of the total operations over one transaction's count, never the factorial of the operations.*

**2:45–2:52** — The only shared item is Y. X belongs only to T1 and Z only to T2, so no conflict can involve them. That reduces the whole question to how the four operations on Y interleave.

> Caption: Conflicts can only happen on Y, because X belongs only to T1 and Z only to T2.

**2:52–3:00** — Enumerating all seventy and testing each one gives fifty-four. Exactly one of them has T1 entirely before T2, because that needs T1's last operation before T2's first. The other fifty-three are equivalent to T2 before T1.

> Caption: Enumeration gives 54. One schedule has T1 wholly before T2; the other 53 are equivalent to T2 then T1.

Exam-trap caption mode adds: *Forgetting the single T1-before-T2 schedule gives 53. Adding the two serial schedules twice gives 55.*

## Scene 7. Recoverable, cascadeless, strict — three different promises

*3:00 – 3:30 · objective: Place the three recovery properties in a strict ladder and test each one on one schedule.*

**3:00–3:07** — Three properties are often confused because all three mention commits. Recoverable is the weakest: if you read a value I wrote, I must commit before you do. Otherwise my abort would invalidate a transaction that has already finished.

> Caption: Recoverable: if T2 read a value T1 wrote, T1 must commit before T2 does.

Exam-trap caption mode adds: *Recoverable says nothing about when the read happened. It only compares the two commit points.*

**3:07–3:15** — Cascadeless is stronger. You may not read a value until its writer has committed, so an abort can never force anybody else to abort. That schedule becomes recoverable but still not cascadeless.

> Caption: Cascadeless: you may only read values whose writer has already committed.

**3:15–3:22** — Strict is stronger again. Not only reads, but writes too must wait for the previous writer to commit. That is the property real engines want, because it lets undo restore an old value in place.

> Caption: Strict: nobody may read or write an item until its last writer has committed.

**3:22–3:30** — The ladder runs one way only: strict implies cascadeless implies recoverable. Neither arrow reverses, and each failure is one line of schedule. That is why exam options can list all three and mean three different things.

> Caption: The ladder is one-way: strict implies cascadeless implies recoverable, and neither converse holds.

Exam-trap caption mode adds: *Do not read "recoverable" as "safe". A recoverable schedule can still force a long chain of rollbacks.*

## Scene 8. Two-phase locking: the lock point and what it forbids

*3:30 – 4:00 · objective: Read a lock point off a schedule, and see a conflict-serialisable schedule 2PL cannot produce.*

**3:30–3:37** — A protocol has to guarantee the property rather than test it afterwards. Two-phase locking does it with one rule: all locks are acquired before any is released. The boundary is called the lock point.

> Caption: Two-phase locking: one growing phase where locks are only taken, then one shrinking phase where they are only released.

**3:37–3:45** — In a schedule, each transaction's lock on an item spans at least from its first access to its last. Locking earlier or releasing later only makes the span longer, so the shortest possible span is the best case.

> Caption: A transaction locks an item at or before its first access and releases it at or after its last.

**3:45–3:52** — That gives a test. Two transactions may not need the same item over overlapping stretches. The first schedule of the 2014 question fails it: T1 needs X from the start to the end while T3 needs X in the middle, so no two-phase execution can produce it.

> Caption: So two transactions may not need the same item over overlapping spans. S1 fails this, though it is conflict serialisable.

Exam-trap caption mode adds: *Conflict serialisable does not mean 2PL can produce it. 2PL is sufficient for the property, never necessary.*

**3:52–4:00** — Two-phase locking buys conflict serialisability and nothing else. Two transactions can still each hold one lock and wait for the other forever. Strict two-phase locking holds every lock until commit, which also buys the recovery properties.

> Caption: 2PL gives conflict serialisability but not deadlock freedom; strict 2PL also gives strictness and recovery.

Exam-trap caption mode adds: *Timestamp ordering is the protocol that avoids deadlock. 2PL never does, however it is dressed up.*

## Scene 9. Timestamp ordering and the Thomas write rule

*4:00 – 4:30 · objective: Run the read and write tests on two timestamps and watch a write be ignored instead of aborted.*

**4:00–4:07** — Timestamp ordering attacks the problem from the other side. Every transaction gets a timestamp, and every item keeps the largest read timestamp and the largest write timestamp it has seen. The protocol enforces timestamp order instead of arrival order.

> Caption: Timestamp ordering gives every transaction a number and keeps two per item: the largest read time and the largest write time.

**4:07–4:15** — A read is refused when a transaction with a larger timestamp has already written the item, because the reader is too late. A write is refused when a larger timestamp has already read the item, because the writer is too late.

> Caption: A read is refused if a later transaction has already written the item. A write is refused if a later transaction has already read it.

**4:15–4:22** — One case can be handled more cheaply. If a write is too late because a later write already happened, this write would be overwritten anyway. The Thomas write rule simply ignores it, and the transaction continues.

> Caption: The Thomas write rule: if a later write already landed, silently skip this one instead of aborting.

Exam-trap caption mode adds: *The Thomas write rule relaxes conflict serialisability. A schedule it permits can be view serialisable without being conflict serialisable.*

**4:22–4:30** — The trade is clean. Timestamp ordering never deadlocks, because no transaction ever waits for another; it aborts and restarts. Locks wait and deadlock, timestamps refuse and restart.

> Caption: Timestamp ordering never deadlocks, because nobody waits. It aborts and restarts instead.

Exam-trap caption mode adds: *Deadlock-free does not mean starvation-free. A transaction with a small timestamp can be restarted repeatedly.*

## Scene 10. The five-step procedure, and the marks it saves

*4:30 – 5:00 · objective: Turn the whole lesson into a decision procedure that starts from what the question asks.*

**4:30–4:37** — Finally, the procedure. Step one is to read what is being asked, because conflict serialisability, view serialisability, recoverability and lock compatibility are four different tests on the same schedule.

> Caption: Step one: read what is asked. Conflict, view, recoverability and locking are four different tests.

**4:37–4:45** — Step two is to lay the schedule out as a table, one column per transaction and one row per position. Every conflict is then a pair of cells in different columns on the same item.

> Caption: Step two: list the operations in order, and write each one as transaction, action, item.

**4:45–4:52** — Step three is the graph. Add one edge per ordered pair of transactions that conflicts, then look for a cycle and nothing else. If there is no cycle, read off the topological order and you are done.

> Caption: Step three: add an edge for every conflicting pair, then look only for a cycle.

Exam-trap caption mode adds: *Duplicate edges between the same two transactions change nothing. Deduplicate before you look for the cycle.*

**4:52–5:00** — Steps four and five. For a counting question, take the binomial coefficient of the total operations over one transaction's count and then filter by the graph. For a locking question, write each transaction's span per item and check whether two spans overlap. Both are counting exercises, not memory.

> Caption: Steps four and five: for counting, count interleavings then filter; for locking, check spans for overlap.

Exam-trap caption mode adds: *The most expensive error in this chapter is testing a schedule for the property the question did not ask about.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
