/* ==========================================================================
   transactions-and-concurrency-control — THE timeline.
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
      id: 'lost',
      n: 1,
      title: 'Why a database cannot just run transactions one at a time',
      start: 0, end: 30,
      objective: 'See an interleaving lose an update, and name the four properties that would have prevented it.'
    },
    {
      id: 'acid',
      n: 2,
      title: 'ACID, and the mechanism each letter buys',
      start: 30, end: 60,
      objective: 'Attach every letter of ACID to the component that enforces it, so isolation stops being a slogan.'
    },
    {
      id: 'conflict',
      n: 3,
      title: 'The conflict: same item, two transactions, one write',
      start: 60, end: 90,
      objective: 'State the three-part test for a conflict and reject the pairs that only look like one.'
    },
    {
      id: 'prec',
      n: 4,
      title: 'The precedence graph decides conflict serialisability',
      start: 90, end: 120,
      objective: 'Draw the graph for both schedules of GATE CSE 2014 Set 3 and read the cycle off it.'
    },
    {
      id: 'view',
      n: 5,
      title: 'View serialisability, and the blind write that separates them',
      start: 120, end: 150,
      objective: 'Show a schedule with a cycle in its precedence graph that is still equivalent to a serial one.'
    },
    {
      id: 'count',
      n: 6,
      title: 'Counting: 70 interleavings, 54 of them conflict serialisable',
      start: 150, end: 180,
      objective: 'Reproduce the GATE CSE 2017 Set 2 count by enumeration rather than by a remembered formula.'
    },
    {
      id: 'recover',
      n: 7,
      title: 'Recoverable, cascadeless, strict — three different promises',
      start: 180, end: 210,
      objective: 'Place the three recovery properties in a strict ladder and test each one on one schedule.'
    },
    {
      id: 'lock',
      n: 8,
      title: 'Two-phase locking: the lock point and what it forbids',
      start: 210, end: 240,
      objective: 'Read a lock point off a schedule, and see a conflict-serialisable schedule 2PL cannot produce.'
    },
    {
      id: 'ts',
      n: 9,
      title: 'Timestamp ordering and the Thomas write rule',
      start: 240, end: 270,
      objective: 'Run the read and write tests on two timestamps and watch a write be ignored instead of aborted.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The five-step procedure, and the marks it saves',
      start: 270, end: 300,
      objective: 'Turn the whole lesson into a decision procedure that starts from what the question asks.'
    }
  ],

  events: [
    /* ---------------- scene 1: why concurrency control ---------------- */
    {
      id: 'lost-1', scene: 'lost', start: 0, end: 7.5,
      caption: 'Two transactions, one account balance. Run them one after the other and the arithmetic is right.',
      detail: 'A transaction is a unit of work that must run completely or not at all. Two transfers on the same balance, run one after the other, leave the correct total.',
      narration: 'Start with the problem the whole chapter exists to solve. Two transactions each move money, and both touch the same balance. Run them one after the other, and the arithmetic is correct.',
      keyword: 'transaction',
      trap: 'The serial schedule is always correct. Nothing in this chapter is about making a serial schedule right — it is about keeping a concurrent one equivalent to it.'
    },
    {
      id: 'lost-2', scene: 'lost', start: 7.5, end: 15,
      caption: 'Interleave them and the second read happens before the first write lands. One update is lost.',
      detail: 'Both transactions read the same old value, both compute from it, and the second write overwrites the first. The balance is 100 short and no transaction ever saw an error.',
      narration: 'Now interleave the same two transactions. Both read the old balance before either writes. Both compute from the same stale number. The second write overwrites the first, and one hundred rupees disappear.',
      keyword: 'lost update',
      trap: 'A lost update produces no error message. That is why the guarantee has to be enforced by the system, not detected afterwards.'
    },
    {
      id: 'lost-3', scene: 'lost', start: 15, end: 22.5,
      caption: 'The fix is not "run serially". It is "run concurrently, but only in orders a serial run would allow".',
      detail: 'Concurrency is needed for throughput. The correctness target is weaker and achievable: the concurrent result must equal the result of some serial order.',
      narration: 'The fix is not to forbid concurrency. It is to demand something weaker and achievable: whatever order the operations actually ran in, the outcome must match some serial order of the same transactions.',
      keyword: 'equivalent to a serial order'
    },
    {
      id: 'lost-4', scene: 'lost', start: 22.5, end: 30,
      caption: 'That demand has a name — serialisability — and it is the centre of this lesson.',
      detail: 'Serialisability is the isolation guarantee. The rest of the lesson builds the tools that test it and the protocols that enforce it.',
      narration: 'That demand is called serialisability. Everything else in this lesson is either a way to test it after the fact or a protocol that guarantees it in advance.',
      keyword: 'serialisability'
    },

    /* ---------------- scene 2: ACID ---------------- */
    {
      id: 'acid-1', scene: 'acid', start: 30, end: 37.5,
      caption: 'Atomicity: all of the transaction or none of it. Enforced by the log and undo on restart.',
      detail: 'Atomicity is a recovery property, not a concurrency property. A transaction that fails halfway is undone using its log records.',
      narration: 'The four letters are four different promises, and each is kept by a different part of the system. Atomicity is all or nothing, and it is kept by the log and undo during recovery.',
      keyword: 'atomicity'
    },
    {
      id: 'acid-2', scene: 'acid', start: 37.5, end: 45,
      caption: 'Consistency: a transaction takes one valid state to another. Enforced by constraints and by the application.',
      detail: 'Consistency is the one letter the database cannot fully enforce. Keys, checks and foreign keys cover the declarative part; the rest is the programmer\'s responsibility.',
      narration: 'Consistency means a transaction carries the database from one valid state to another. Declared constraints cover part of it, and the rest is the application\'s job — which is why this letter is the weakest of the four.',
      keyword: 'consistency'
    },
    {
      id: 'acid-3', scene: 'acid', start: 45, end: 52.5,
      caption: 'Isolation: concurrent execution must look like some serial order. Enforced by the concurrency-control protocol.',
      detail: 'Isolation is the property this whole lesson is about. Locks, timestamps and validation are the three families of protocol that enforce it.',
      narration: 'Isolation is the letter this lesson is about. A concurrent execution must be equivalent to some serial order, and locks, timestamps or validation are what enforce it.',
      keyword: 'isolation',
      trap: 'Isolation is not "no interleaving". It is "no interleaving whose result a serial order could not have produced".'
    },
    {
      id: 'acid-4', scene: 'acid', start: 52.5, end: 60,
      caption: 'Durability: a committed write survives a crash. Enforced by force-writing the log before commit is acknowledged.',
      detail: 'Durability is again a recovery property. The write-ahead rule — log record reaches stable storage before the commit is reported — is what makes it hold.',
      narration: 'Durability means a committed write survives a power cut, and the write-ahead rule is what buys it: the log record reaches stable storage before the commit is acknowledged.',
      keyword: 'durability'
    },

    /* ---------------- scene 3: the conflict ---------------- */
    {
      id: 'conf-1', scene: 'conflict', start: 60, end: 67.5,
      caption: 'Two operations conflict when they are on the same item, from different transactions, and at least one writes.',
      detail: 'All three conditions are required. Any pair failing one of them can be reordered freely without changing the outcome, so it cannot constrain the order.',
      narration: 'Now the definition everything rests on. Two operations conflict when three things hold at once: same data item, different transactions, and at least one of them is a write.',
      keyword: 'same item, different transactions, a write',
      trap: 'Two reads of the same item never conflict, however many transactions are involved. Reading does not change the value.'
    },
    {
      id: 'conf-2', scene: 'conflict', start: 67.5, end: 75,
      caption: 'Three shapes: read-write, write-read, write-write. Read-read is the one that is not a conflict.',
      detail: 'A read-write pair means one transaction read a value the other later overwrote. A write-read pair means one read a value the other had written. A write-write pair means the last writer wins.',
      narration: 'There are exactly three shapes. A read followed by a write, a write followed by a read, and a write followed by a write. Read followed by read is not on the list, and that single omission is where most marks are won.',
      keyword: 'read-write, write-read, write-write'
    },
    {
      id: 'conf-3', scene: 'conflict', start: 75, end: 82.5,
      caption: 'A conflict pins an order: the earlier operation must stay earlier in any equivalent serial schedule.',
      detail: 'That is the whole reason the graph works. Each conflict contributes one directed edge, and the edges record every ordering the interleaving has already committed to.',
      narration: 'Each conflict fixes an order. The operation that came first must still come first in any serial schedule that is equivalent. That fixed order is the edge we are about to draw.',
      keyword: 'pins an order'
    },
    {
      id: 'conf-4', scene: 'conflict', start: 82.5, end: 90,
      caption: 'So a schedule is conflict serialisable exactly when those pinned orders are mutually consistent.',
      detail: 'Mutually consistent means acyclic. A cycle would demand that some transaction come both before and after another, which no serial order can satisfy.',
      narration: 'So conflict serialisability is exactly the question of whether all those pinned orders can be satisfied at once. A set of orders can be satisfied at once exactly when it has no cycle.',
      keyword: 'no cycle'
    },

    /* ---------------- scene 4: precedence graph ---------------- */
    {
      id: 'prec-1', scene: 'prec', start: 90, end: 97.5,
      caption: 'GATE CSE 2014 Set 3 gives three transactions and two schedules. One vertex per transaction.',
      detail: 'T1 reads and writes X and Z. T2 reads Y and Z and writes Z. T3 reads Y and X and writes Y. The two schedules use exactly the same operations in different orders.',
      narration: 'Here is a real question. Three transactions over three items, and two schedules using the same operations. Draw one vertex per transaction and add an edge for every conflict.',
      keyword: 'one vertex per transaction'
    },
    {
      id: 'prec-2', scene: 'prec', start: 97.5, end: 105,
      caption: 'Schedule S1 gives T2 to T3 on Y, T3 to T1 on X, and T2 to T1 on Z. No cycle.',
      detail: 'r2(Y) precedes w3(Y), so T2 precedes T3. r3(X) precedes w1(X), so T3 precedes T1. w2(Z) precedes r1(Z), so T2 precedes T1. The three edges form a chain with one shortcut.',
      narration: 'In the first schedule, T2 reads Y before T3 writes it, T3 reads X before T1 writes it, and T2 writes Z before T1 reads it. Three edges, no cycle, and the only topological order is T2 then T3 then T1.',
      keyword: 'T2, T3, T1',
      trap: 'The answer is the schedule, not the serial order. The question asks which statement about the schedules is true.'
    },
    {
      id: 'prec-3', scene: 'prec', start: 105, end: 112.5,
      caption: 'Schedule S2 reverses one pair on Z, and now T1 to T2 and T2 to T1 both appear. Cycle.',
      detail: 'r1(Z) comes before w2(Z), giving T1 to T2. w2(Z) still comes before w1(Z), giving T2 to T1. A cycle means no serial order can reproduce S2.',
      narration: 'The second schedule moves one read on Z to the front. Now T1 precedes T2 on Z while T2 still precedes T1 on Z. Both edges exist, so there is a cycle, and no serial order can reproduce that schedule.',
      keyword: 'both edges exist',
      trap: 'A single reversed pair is enough. You do not need the whole graph to look wrong.'
    },
    {
      id: 'prec-4', scene: 'prec', start: 112.5, end: 120,
      caption: 'So only S1 is conflict serialisable — option A. The graph, not intuition, decided it.',
      detail: 'Both schedules look similar line by line. The graph distinguishes them in one step, which is why it is the standard tool rather than a convenience.',
      narration: 'So only the first schedule is conflict serialisable, which is option A. Two schedules that look almost identical are separated by one edge, and the graph finds it without guessing.',
      keyword: 'option A'
    },

    /* ---------------- scene 5: view serialisability ---------------- */
    {
      id: 'view-1', scene: 'view', start: 120, end: 127.5,
      caption: 'Conflict serialisability is sufficient, not necessary. Some schedules are equivalent to a serial one and still have a cycle.',
      detail: 'View equivalence is the weaker definition: same reads-from relation and same final writer for every item. It ignores the order of operations that do not change what anybody reads.',
      narration: 'Conflict serialisability is a sufficient condition, not a necessary one. A schedule can be equivalent to a serial order and still have a cycle in its precedence graph. The weaker definition is called view equivalence.',
      keyword: 'sufficient, not necessary'
    },
    {
      id: 'view-2', scene: 'view', start: 127.5, end: 135,
      caption: 'Take T1 reading and writing A, and T2 and T3 each writing A without reading it.',
      detail: 'A write with no read of that item in the same transaction is a blind write. Blind writes are exactly what allow a cyclic schedule to still be view serialisable.',
      narration: 'Here is the shape that makes it happen. One transaction reads and writes A. Two others write A without ever reading it. A write that reads nothing first is called a blind write.',
      keyword: 'blind write',
      trap: 'A blind write is not an error. It is the structural feature that makes view serialisability strictly larger than conflict serialisability.'
    },
    {
      id: 'view-3', scene: 'view', start: 135, end: 142.5,
      caption: 'In r1(A), w2(A), w1(A), w3(A) the graph has a cycle, yet T1 reads the initial value and T3 writes last — exactly as in the serial order T1, T2, T3.',
      detail: 'The reads-from relation and the final writer both match that serial order, so the schedule is view serialisable. Conflict serialisability fails because T1 to T2 and T2 to T1 both appear.',
      narration: 'Run the four operations in that order. T1 reads the initial value and T3 writes last, which is exactly what the serial order T1, T2, T3 does. So the schedule is view serialisable, even though its graph has a cycle.',
      keyword: 'same reads, same final writer'
    },
    {
      id: 'view-4', scene: 'view', start: 142.5, end: 150,
      caption: 'The containment is strict: conflict serialisable sits inside view serialisable, which sits inside serialisable.',
      detail: 'Every conflict-serialisable schedule is view serialisable, and the converse fails as the blind-write example shows. Deciding view serialisability in general is NP-complete, which is why no protocol targets it.',
      narration: 'The containment is strict and it runs one way. Every conflict-serialisable schedule is view serialisable, and the blind-write example is the witness that the converse fails. Testing view serialisability in general is hard, which is why practical protocols aim at the stronger property.',
      keyword: 'strict containment',
      trap: 'GATE asks for view serialisability only when blind writes are present. Without a blind write the two notions coincide on two transactions.'
    },

    /* ---------------- scene 6: counting ---------------- */
    {
      id: 'cnt-1', scene: 'count', start: 150, end: 157.5,
      caption: 'GATE CSE 2017 Set 2 asks how many conflict-serialisable schedules two four-operation transactions can form.',
      detail: 'T1 is r1(X), w1(X), r1(Y), w1(Y). T2 is r2(Y), w2(Y), r2(Z), w2(Z). Each transaction keeps its own order; only the interleaving varies.',
      narration: 'Now the counting question from GATE 2017 Set 2. Two transactions of four operations each. Their internal order is fixed, and only the interleaving may vary.',
      keyword: 'how many interleavings'
    },
    {
      id: 'cnt-2', scene: 'count', start: 157.5, end: 165,
      caption: 'Total interleavings: choose 4 of the 8 positions for T1. That is 70.',
      detail: 'Choosing which four of the eight slots belong to T1 fixes the whole schedule, because each transaction\'s operations then fill its slots in order. C(8,4) is 70.',
      narration: 'Choosing which four of the eight slots belong to T1 fixes everything, because each transaction fills its own slots in order. That is seventy schedules in total.',
      keyword: '70',
      trap: 'The base case is always the binomial coefficient of the total operations over one transaction\'s count, never the factorial of the operations.'
    },
    {
      id: 'cnt-3', scene: 'count', start: 165, end: 172.5,
      caption: 'Conflicts can only happen on Y, because X belongs only to T1 and Z only to T2.',
      detail: 'T1 touches Y at its third and fourth operations; T2 touches Y at its first and second. Every conflict therefore involves those four operations, and nothing else.',
      narration: 'The only shared item is Y. X belongs only to T1 and Z only to T2, so no conflict can involve them. That reduces the whole question to how the four operations on Y interleave.',
      keyword: 'only Y is shared'
    },
    {
      id: 'cnt-4', scene: 'count', start: 172.5, end: 180,
      caption: 'Enumeration gives 54. One schedule has T1 wholly before T2; the other 53 are equivalent to T2 then T1.',
      detail: 'T1 to T2 needs w1(Y) before r2(Y), and those are T1\'s last and T2\'s first operation, so only the fully serial order qualifies. All remaining conflict-serialisable schedules run T2 before T1.',
      narration: 'Enumerating all seventy and testing each one gives fifty-four. Exactly one of them has T1 entirely before T2, because that needs T1\'s last operation before T2\'s first. The other fifty-three are equivalent to T2 before T1.',
      keyword: '54',
      trap: 'Forgetting the single T1-before-T2 schedule gives 53. Adding the two serial schedules twice gives 55.'
    },

    /* ---------------- scene 7: recovery ladder ---------------- */
    {
      id: 'rec-1', scene: 'recover', start: 180, end: 187.5,
      caption: 'Recoverable: if T2 read a value T1 wrote, T1 must commit before T2 does.',
      detail: 'The schedule w1(X), r2(X), commit2, commit1 is not recoverable. If T1 aborts after T2 has committed, T2 has already used a value that never existed and cannot be undone.',
      narration: 'Three properties are often confused because all three mention commits. Recoverable is the weakest: if you read a value I wrote, I must commit before you do. Otherwise my abort would invalidate a transaction that has already finished.',
      keyword: 'recoverable',
      trap: 'Recoverable says nothing about when the read happened. It only compares the two commit points.'
    },
    {
      id: 'rec-2', scene: 'recover', start: 187.5, end: 195,
      caption: 'Cascadeless: you may only read values whose writer has already committed.',
      detail: 'The schedule w1(X), r2(X), commit1, commit2 is recoverable but not cascadeless, because the read happened before T1 committed. A cascadeless schedule never triggers a cascade of rollbacks.',
      narration: 'Cascadeless is stronger. You may not read a value until its writer has committed, so an abort can never force anybody else to abort. That schedule becomes recoverable but still not cascadeless.',
      keyword: 'cascadeless'
    },
    {
      id: 'rec-3', scene: 'recover', start: 195, end: 202.5,
      caption: 'Strict: nobody may read or write an item until its last writer has committed.',
      detail: 'Strict adds writes to cascadeless. It is the property real systems want, because it also allows the old value to be restored in place during undo.',
      narration: 'Strict is stronger again. Not only reads, but writes too must wait for the previous writer to commit. That is the property real engines want, because it lets undo restore an old value in place.',
      keyword: 'strict'
    },
    {
      id: 'rec-4', scene: 'recover', start: 202.5, end: 210,
      caption: 'The ladder is one-way: strict implies cascadeless implies recoverable, and neither converse holds.',
      detail: 'Each implication is strict, and each has a one-line counterexample, which is why the three are asked as separate options rather than as synonyms.',
      narration: 'The ladder runs one way only: strict implies cascadeless implies recoverable. Neither arrow reverses, and each failure is one line of schedule. That is why exam options can list all three and mean three different things.',
      keyword: 'one-way ladder',
      trap: 'Do not read "recoverable" as "safe". A recoverable schedule can still force a long chain of rollbacks.'
    },

    /* ---------------- scene 8: two-phase locking ---------------- */
    {
      id: 'lock-1', scene: 'lock', start: 210, end: 217.5,
      caption: 'Two-phase locking: one growing phase where locks are only taken, then one shrinking phase where they are only released.',
      detail: 'The moment a transaction releases any lock it enters the shrinking phase and may never acquire another. The boundary between the phases is the lock point.',
      narration: 'A protocol has to guarantee the property rather than test it afterwards. Two-phase locking does it with one rule: all locks are acquired before any is released. The boundary is called the lock point.',
      keyword: 'growing then shrinking'
    },
    {
      id: 'lock-2', scene: 'lock', start: 217.5, end: 225,
      caption: 'A transaction locks an item at or before its first access and releases it at or after its last.',
      detail: 'That gives each transaction a minimal span per item: from first access to last access. Locking earlier or releasing later only widens the span.',
      narration: 'In a schedule, each transaction\'s lock on an item spans at least from its first access to its last. Locking earlier or releasing later only makes the span longer, so the shortest possible span is the best case.',
      keyword: 'first access to last access'
    },
    {
      id: 'lock-3', scene: 'lock', start: 225, end: 232.5,
      caption: 'So two transactions may not need the same item over overlapping spans. S1 fails this, though it is conflict serialisable.',
      detail: 'In S1, T1 accesses X from position 0 to position 8 while T3 accesses X at position 2. Whichever holds the lock on X, the other cannot be inside its own span. So no 2PL execution produces S1.',
      narration: 'That gives a test. Two transactions may not need the same item over overlapping stretches. The first schedule of the 2014 question fails it: T1 needs X from the start to the end while T3 needs X in the middle, so no two-phase execution can produce it.',
      keyword: 'overlapping spans',
      trap: 'Conflict serialisable does not mean 2PL can produce it. 2PL is sufficient for the property, never necessary.'
    },
    {
      id: 'lock-4', scene: 'lock', start: 232.5, end: 240,
      caption: '2PL gives conflict serialisability but not deadlock freedom; strict 2PL also gives strictness and recovery.',
      detail: 'Two transactions can each hold one lock and wait for the other, which is a deadlock. Strict 2PL holds every lock until commit, which adds cascadelessness and strictness at the cost of more waiting.',
      narration: 'Two-phase locking buys conflict serialisability and nothing else. Two transactions can still each hold one lock and wait for the other forever. Strict two-phase locking holds every lock until commit, which also buys the recovery properties.',
      keyword: 'deadlock is not prevented',
      trap: 'Timestamp ordering is the protocol that avoids deadlock. 2PL never does, however it is dressed up.'
    },

    /* ---------------- scene 9: timestamp ordering ---------------- */
    {
      id: 'ts-1', scene: 'ts', start: 240, end: 247.5,
      caption: 'Timestamp ordering gives every transaction a number and keeps two per item: the largest read time and the largest write time.',
      detail: 'The order the protocol enforces is the timestamp order, not the arrival order. Two counters per item are enough to detect any operation that would break it.',
      narration: 'Timestamp ordering attacks the problem from the other side. Every transaction gets a timestamp, and every item keeps the largest read timestamp and the largest write timestamp it has seen. The protocol enforces timestamp order instead of arrival order.',
      keyword: 'read timestamp, write timestamp'
    },
    {
      id: 'ts-2', scene: 'ts', start: 247.5, end: 255,
      caption: 'A read is refused if a later transaction has already written the item. A write is refused if a later transaction has already read it.',
      detail: 'Both tests compare the arriving transaction\'s timestamp with the stored one. A refusal aborts the transaction, which then restarts with a fresh timestamp.',
      narration: 'A read is refused when a transaction with a larger timestamp has already written the item, because the reader is too late. A write is refused when a larger timestamp has already read the item, because the writer is too late.',
      keyword: 'too late'
    },
    {
      id: 'ts-3', scene: 'ts', start: 255, end: 262.5,
      caption: 'The Thomas write rule: if a later write already landed, silently skip this one instead of aborting.',
      detail: 'An obsolete write would be overwritten anyway, so ignoring it changes nothing that anybody can observe. The transaction continues instead of restarting.',
      narration: 'One case can be handled more cheaply. If a write is too late because a later write already happened, this write would be overwritten anyway. The Thomas write rule simply ignores it, and the transaction continues.',
      keyword: 'Thomas write rule',
      trap: 'The Thomas write rule relaxes conflict serialisability. A schedule it permits can be view serialisable without being conflict serialisable.'
    },
    {
      id: 'ts-4', scene: 'ts', start: 262.5, end: 270,
      caption: 'Timestamp ordering never deadlocks, because nobody waits. It aborts and restarts instead.',
      detail: 'No transaction ever holds a resource while waiting for another, so the cycle that a deadlock needs cannot form. The price is wasted work on aborts.',
      narration: 'The trade is clean. Timestamp ordering never deadlocks, because no transaction ever waits for another; it aborts and restarts. Locks wait and deadlock, timestamps refuse and restart.',
      keyword: 'no waiting, so no deadlock',
      trap: 'Deadlock-free does not mean starvation-free. A transaction with a small timestamp can be restarted repeatedly.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'dec-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: read what is asked. Conflict, view, recoverability and locking are four different tests.',
      detail: 'Most lost marks here come from answering the right schedule with the wrong test. The wording of the question names the test; find it before touching the schedule.',
      narration: 'Finally, the procedure. Step one is to read what is being asked, because conflict serialisability, view serialisability, recoverability and lock compatibility are four different tests on the same schedule.',
      keyword: 'what is asked'
    },
    {
      id: 'dec-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: list the operations in order, and write each one as transaction, action, item.',
      detail: 'A table with one column per transaction and one row per position makes the conflicts visible. Reading down a column gives each transaction\'s order; reading across a row gives the schedule.',
      narration: 'Step two is to lay the schedule out as a table, one column per transaction and one row per position. Every conflict is then a pair of cells in different columns on the same item.',
      keyword: 'lay it out as a table'
    },
    {
      id: 'dec-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three: add an edge for every conflicting pair, then look only for a cycle.',
      detail: 'Same item, different transactions, at least one write. One edge per ordered pair of transactions, however many conflicts produce it.',
      narration: 'Step three is the graph. Add one edge per ordered pair of transactions that conflicts, then look for a cycle and nothing else. If there is no cycle, read off the topological order and you are done.',
      keyword: 'only look for a cycle',
      trap: 'Duplicate edges between the same two transactions change nothing. Deduplicate before you look for the cycle.'
    },
    {
      id: 'dec-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Steps four and five: for counting, count interleavings then filter; for locking, check spans for overlap.',
      detail: 'Counting questions want C(total, one transaction) followed by a filter, not a formula. Locking questions want the access span of each transaction per item, checked for overlap.',
      narration: 'Steps four and five. For a counting question, take the binomial coefficient of the total operations over one transaction\'s count and then filter by the graph. For a locking question, write each transaction\'s span per item and check whether two spans overlap. Both are counting exercises, not memory.',
      keyword: 'count, then filter',
      trap: 'The most expensive error in this chapter is testing a schedule for the property the question did not ask about.'
    }
  ]
};
