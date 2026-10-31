# Readers Writers And Dining Philosophers — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/readers-writers-and-dining-philosophers/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two different problems hide inside one word

*0:00 – 0:30 · objective: See that readers and writers contend over a shared value while philosophers contend over a ring of resources, so the two need different analyses.*

**0:00–0:07** — Two problems sit inside the word synchronisation, and they are not the same problem. The first is a shared value with two kinds of user. Many processes want to read it, and reading does not disturb reading. One process at a time wants to change it, and a change disturbs everybody.

> Caption: One shared value, two kinds of user: many readers, one writer.

Exam-trap caption mode adds: *Treating every access as equally exclusive. A question that says "readers may read together" is a different problem from one that says "one process in the section".*

**0:07–0:15** — On the left, three readers are inside at the same time. That is not a bug, it is the requirement. A writer that arrives while they read waits outside, and it may only enter when the last reader has gone.

> Caption: Three readers inside together is correct. A writer inside with them is not.

Exam-trap caption mode adds: *Counting readers inside as a mutual-exclusion violation. The rule is that a writer is alone, not that the section holds one process.*

**0:15–0:22** — The second problem has no readers and no writers. Five philosophers sit round a table with one fork between each pair, and to eat a philosopher needs the two forks beside him. Each fork is wanted by exactly two philosophers, and that is where the trouble comes from.

> Caption: Five philosophers, five forks, and each needs the two beside him.

Exam-trap caption mode adds: *Assuming five forks mean five philosophers can eat. Two forks are needed per meal, so five forks support two meals at most, whatever the code does.*

**0:22–0:30** — So the questions differ. The readers and writers question is about fairness: who gets in, and who waits for ever. The philosophers question is about a cycle: can the whole table stop at once. Fairness and stopping are different failures, and the rest of the lesson keeps them apart.

> Caption: One problem is about fairness. The other is about a cycle.

Exam-trap caption mode adds: *Answering "starvation" when the question asks what deadlock is, or the reverse. The two have different causes and different repairs.*

## Scene 2. The three rules, and why one mutex is wrong

*0:30 – 1:00 · objective: State the readers-writers rules and watch a single mutex satisfy safety while throwing away every bit of reader concurrency.*

**0:30–0:37** — The readers and writers problem is three rules, and the third one is the one that gets broken. First, a writer is alone. Second, readers share the section. Third, a process that asks is admitted eventually. The first two are about safety, the third is about fairness.

> Caption: Three rules: a writer is alone, readers share, and nobody starves for ever.

Exam-trap caption mode adds: *Checking only the first two rules. A solution can keep every writer alone, allow every reader, and still starve one class for ever.*

**0:37–0:45** — The obvious attempt uses one semaphore. Wait before reading, signal after. It is safe: only one process is ever inside, so no writer can meet a reader. And it throws away the only advantage this problem has, because two readers that could have worked together now take turns.

> Caption: One mutex around the whole section: correct, and needlessly serial.

Exam-trap caption mode adds: *Marking that code correct. It satisfies mutual exclusion and fails the second rule, so it is a wrong answer to a readers-writers question.*

**0:45–0:52** — Look at the two strips. Above, one mutex: the three readers occupy the section one after another, so the total time is the sum of the three. Below, the same three readers overlap, so the total time is the longest of them. That overlap is the whole reason the problem exists.

> Caption: The bars on the right: three readers serialised, then three readers overlapping.

Exam-trap caption mode adds: *Thinking overlap changes the answer to "how many can be inside". With one mutex the answer is one, and with a correct solution it is all the readers.*

**0:52–1:00** — So the design question becomes who decides, and the answer is a counter. The first reader to arrive locks the writer out. The readers after her only add one to the count. The last one to leave unlocks it. Everything that follows is that sentence with the details filled in.

> Caption: So the design question is: who decides, and when? A counter can decide.

Exam-trap caption mode adds: *Guarding the count with nothing. The increment is a read, an add and a store, so two readers can both see zero and both believe they are first.*

## Scene 3. The first solution: one counter and two semaphores

*1:00 – 1:30 · objective: Trace readcount, rmutex and wsem through two readers and a writer, and see exactly which step admits the second reader.*

**1:00–1:07** — Here is the first solution. Two semaphores and one integer. rmutex guards the counter, so two readers cannot change it at the same time. wsem is the permission to write. And readcount holds how many readers are inside.

> Caption: Two semaphores and one integer: rmutex protects the count, wsem protects the data.

Exam-trap caption mode adds: *Swapping the roles. rmutex is never held while reading; it is held only for the few instructions that touch readcount.*

**1:07–1:15** — Reader one arrives. She waits on rmutex, adds one to the count, and because the count is now one she is the first, so she takes wsem. wsem falls from one to zero and the writers are locked out. Then she releases rmutex and reads.

> Caption: Reader one: count 0 to 1, and because she is first she takes wsem.

Exam-trap caption mode adds: *Believing every reader takes wsem. Only the reader that raises the count from zero to one does, and only the reader that lowers it from one to zero gives it back.*

**1:15–1:22** — Reader two arrives. She waits on rmutex, adds one, finds the count is two, and so she is not the first. She never touches wsem at all. wsem stays at zero and both readers read together. That skipped wait is the entire difference from the single-mutex attempt.

> Caption: Reader two: count 1 to 2, and she never touches wsem. Both read together.

Exam-trap caption mode adds: *Thinking wsem counts readers. wsem is at zero while any number of readers are inside; the count is readcount, not the semaphore.*

**1:22–1:30** — Now a writer arrives and waits on wsem. Its value is zero, so it becomes minus one and the writer is queued. When the last reader leaves, the count reaches zero, she signals wsem, and the writer wakes. A negative semaphore value is a count of the processes waiting on it.

> Caption: A writer now blocks on wsem at minus one, and the last reader will wake him.

Exam-trap caption mode adds: *Reading a negative value as an error. Under the standard definition it means exactly that many processes are queued, and papers ask for that number.*

## Scene 4. What that solution costs: the writer waits for ever

*1:30 – 2:00 · objective: Follow the exact semaphore values while readers keep arriving and see that a waiting writer is never preferred over a new reader.*

**1:30–1:37** — Now watch the cost. Readers keep arriving. Reader three and reader four each take rmutex, raise the count, see that they are not first, and walk straight in. wsem does not move. It stays at minus one.

> Caption: Readers keep arriving. Each new reader skips the wait on wsem.

Exam-trap caption mode adds: *Assuming a queued writer is served before later arrivals. Nothing in this code makes a new reader look at the writer queue.*

**1:37–1:45** — Here are the exact values from the trace. Count one and wsem zero after the first reader. Count two after the second. The writer takes wsem to minus one. Then readers three and four take the count to four, and wsem is still minus one. Four readers inside, one writer outside.

> Caption: Count four, wsem still minus one: four readers in, one writer out.

Exam-trap caption mode adds: *Believing the count limits readers. Nothing bounds readcount; on this code any number of readers may be inside at once.*

**1:45–1:52** — The writer is released by exactly one event: the count falling to zero. That needs an instant with no reader inside. If readers keep arriving, that instant never comes. The system keeps working for readers and the writer waits for ever. That is starvation, and note that nothing is stuck.

> Caption: If readers never all leave, the writer never enters. That is starvation.

Exam-trap caption mode adds: *Calling this a deadlock. Progress continues for readers, so no process is blocked for ever by a cycle; one class is simply never chosen.*

**1:52–2:00** — This behaviour has a name: reader preference. It is not a coding mistake. The first readers and writers problem says no reader may wait unless a writer already holds the section, and that sentence forces exactly this behaviour. The starvation is a consequence of the specification, not a slip.

> Caption: This is called reader preference, and it is a design choice, not a bug in the code.

Exam-trap caption mode adds: *Answering "the solution is incorrect" because a writer can starve. It is a correct solution to the first problem and a wrong one to the third.*

## Scene 5. Writer preference: a gate the first waiting writer closes

*2:00 – 2:30 · objective: Add readTry so that a waiting writer blocks new readers, and see which side starves once the gate closes.*

**2:00–2:07** — The second solution adds one semaphore and one rule. Every reader passes through a gate called readTry on the way in. The first writer to arrive closes that gate, and the last writer to leave opens it again. So while a writer waits, no new reader can start.

> Caption: Add one gate, readTry, that every reader must pass through.

Exam-trap caption mode adds: *Thinking the gate makes writers exclusive of each other. A separate semaphore, wmutex, keeps the writers apart; readTry only stops readers.*

**2:07–2:15** — Trace it. Reader one passes the gate and takes wmutex, so wmutex is zero and she reads. Writer one arrives and is the first writer, so it takes readTry, which falls to zero, and then it waits on wmutex, which falls to minus one. The writer is queued and it is holding the gate.

> Caption: One reader inside, then a writer: the writer takes readTry and blocks on wmutex.

Exam-trap caption mode adds: *Missing that the writer holds readTry while it is blocked. That held gate is the whole mechanism, and it is why a later reader cannot slip in.*

**2:15–2:22** — Now reader two arrives and waits at the gate. readTry is zero, so it becomes minus one, and reader two is queued. The gate is shut. When reader one finishes, the count reaches zero, she signals wmutex and the writer wakes. Only when the last writer leaves does the gate reopen.

> Caption: Reader two now blocks on readTry at minus one: the gate is shut.

Exam-trap caption mode adds: *Concluding that this solution is starvation-free. It is starvation-free for writers and it can starve readers, because a steady stream of writers keeps readTry closed.*

**2:22–2:30** — So the three problems differ in one sentence each. The first says readers are never delayed by a reader, which starves writers. The second says a queued writer is not delayed by new readers, which starves readers. The third says nobody starves, and it is paid for with another semaphore and more bookkeeping.

> Caption: Second problem: writers first. Third problem: nobody starves, and it costs more.

Exam-trap caption mode adds: *Answering "both are starvation-free" for the second solution. Writer preference starves readers, exactly as reader preference starves writers.*

## Scene 6. The numbers questions ask for

*2:30 – 3:00 · objective: Collect the counts that papers ask about: how many processes can be inside, how many semaphores, and what a negative value means.*

**2:30–2:37** — Questions ask for the largest number of processes that can be inside at once. For readers the answer is every reader process there is, because nothing counts them down from a limit. For writers the answer is one. And no reader is ever inside at the same time as a writer.

> Caption: How many processes can be inside? Readers: all of them. Writers: one.

Exam-trap caption mode adds: *Answering "one" because the section is called critical. The reader count is not capped by the code unless the question adds a semaphore that caps it.*

**2:37–2:45** — A common question asks how many semaphores a solution needs. The first uses two: one for the counter and one for the data. The second uses four: the gate, the writer lock, and one mutex for each of the two counters. Count them off the code rather than from memory.

> Caption: How many semaphores? Two for the first solution, four for the second.

Exam-trap caption mode adds: *Counting semaphores and forgetting the counters, or the reverse. A question that asks for "shared variables" wants the integers, not the semaphores.*

**2:45–2:52** — One convention question decides many marks. Under the standard definition a wait decrements first and blocks if the value went negative, so a value of minus k means k processes are queued. And after m waits and p signals on a semaphore started at s, the value is s minus m plus p.

> Caption: A negative value is a queue length. Minus one means one process waiting.

Exam-trap caption mode adds: *Using the convention that clamps the value at zero and keeps the queue separately. Both exist; the numbers differ, so read which one the question uses.*

**2:52–3:00** — Here is the table to carry into the exam. Maximum readers inside, maximum writers inside, how many semaphores, and who can starve. Reader preference starves writers. Writer preference starves readers. The fair version starves neither, and it pays for that with one more semaphore.

> Caption: Who may barge, and what each solution guarantees, in one table.

Exam-trap caption mode adds: *Memorising the counts without the version. The counts differ between the three problems, so identify the version first.*

## Scene 7. Dining philosophers: the ring, and the all-left deadlock

*3:00 – 3:30 · objective: Build the five-philosopher table and watch every philosopher take the left fork, which stops every one of them.*

**3:00–3:07** — Now the ring. Each fork is a lock, one semaphore each, all starting at one. Philosopher i takes the fork on his left, then the fork on his right, eats, and puts both back. Then he thinks and starts again. Five philosophers, five forks, and the code is the same for all five.

> Caption: Five philosophers, five forks, and a loop of think, pick up, eat, put down.

Exam-trap caption mode adds: *Assuming the forks are distinguishable in the code. They are, by index, but every philosopher runs the identical instruction sequence, and that symmetry is the problem.*

**3:07–3:15** — Because every philosopher runs the same code, there is an interleaving where all five finish their first wait before anyone finishes the second. In that interleaving every philosopher holds his left fork, so all five forks are held, one each.

> Caption: All five take the left fork at the same instant. Every fork is now held.

Exam-trap caption mode adds: *Believing a single processor prevents this. A preemption after the first wait is enough, so one core can reach this state.*

**3:15–3:22** — Now each philosopher waits for the fork on his right. But that fork is the left fork of his neighbour, and the neighbour is holding it. Every philosopher is blocked, nobody is eating, and no fork will ever be released. The table has stopped, and it will stay stopped.

> Caption: Each now waits for a fork his neighbour holds. Nothing can move.

Exam-trap caption mode adds: *Describing this as slow progress. Nobody is eating and nothing can be released, so this is a permanent stop, not contention.*

**3:22–3:30** — Four conditions have to hold for a deadlock, and here all four do. A fork is exclusive. Each philosopher holds one while asking for another. Nothing can be taken away. And the waiting forms a ring. Remove any one of the four and this deadlock becomes impossible, which is exactly what the three repairs do.

> Caption: Four conditions, all true here: exclusion, hold and wait, no preemption, a cycle.

Exam-trap caption mode adds: *Saying the four conditions cause a deadlock. They are necessary conditions; a cycle of waiting is what makes them sufficient, and the next scene tests that claim by search.*

## Scene 8. What an exhaustive search proves about that deadlock

*3:30 – 4:00 · objective: Enumerate every reachable state of the naive solution and see that exactly one of them is stuck, and which one.*

**3:30–3:37** — To prove anything here, model the table as a finite object. Each philosopher is thinking, waiting for his first fork, holding it, or eating. Who holds which fork follows from those labels. So a state is five labels, and there are at most four to the fifth, which is one thousand and twenty-four of them.

> Caption: A philosopher is in one of four situations, so the whole table is finite.

Exam-trap caption mode adds: *Trying to reason from one execution. A single run shows a deadlock is possible; only the full state set shows what else is possible.*

**3:37–3:45** — Now walk the whole graph. Start with all five thinking, and apply every legal move in every possible order. The reachable set comes out at five hundred and seventy-three states. That number is computed here, by the same search that checks the repairs later.

> Caption: Search every reachable state: five hundred and seventy-three of them.

Exam-trap caption mode adds: *Assuming the reachable count equals the upper bound. Most of the one thousand and twenty-four states are unreachable, and only reachable states matter.*

**3:45–3:52** — A state is stuck when no philosopher has any legal move, which means every one of them is blocked. The search finds exactly one such state in the whole reachable set, and it is the one we built by hand: all five holding their left fork. One deadlock, and it is the one the picture showed.

> Caption: Exactly one state has no legal move, and it is all five holding their left fork.

Exam-trap caption mode adds: *Assuming there must be several deadlocks. There is one, and finding that it is unique is a stronger statement than finding it at all.*

**3:52–4:00** — The same search answers the counting question. The largest number eating at once, over every reachable state, is two. Two eaters hold four forks, and the third meal needs two forks when only one is left. So the ceiling here is two, and it comes from the forks, not from the code.

> Caption: The same search says at most two can eat: two meals need four forks.

Exam-trap caption mode adds: *Answering five, or three, from the number of philosophers. The fork count decides: each meal costs two forks, so the ceiling is half of five rounded down.*

## Scene 9. Three fixes, and what each one gives up

*4:00 – 4:30 · objective: Check three standard repairs by the same exhaustive search, and name the cost each repair leaves behind.*

**4:00–4:07** — The first repair is a room with four seats. A semaphore starts at four, taken before the first fork and released after eating. Now at most four philosophers compete for five forks, so one of them can always get both. The search finds no stuck state at all, in four hundred and ninety-one reachable states.

> Caption: Fix one: a room semaphore with four permits, so one philosopher waits outside.

Exam-trap caption mode adds: *Initialising the room semaphore to five. That is the original problem again, and the search then finds the same deadlock.*

**4:07–4:15** — The second repair breaks the symmetry. Even-numbered philosophers reach left first, odd-numbered ones reach right first. Now the first choices no longer form a ring, so the cycle cannot close. The search finds no stuck state, in four hundred and ninety-two reachable states.

> Caption: Fix two: break the symmetry, so the odd philosophers reach right first.

Exam-trap caption mode adds: *Turning only one philosopher around and calling it the asymmetric solution. One is enough to break the cycle, and turning all five the same way again restores it.*

**4:15–4:22** — The third repair removes hold and wait instead of the cycle. A monitor keeps one state per philosopher and lets a philosopher eat only when neither neighbour is eating, so nobody ever holds one fork while asking for another. Two can still eat at once, and no one can be stuck holding a fork.

> Caption: Fix three: a waiter that grants both forks or neither, as a monitor does.

Exam-trap caption mode adds: *Believing the monitor makes everything fair. It removes deadlock; a philosopher can still be unlucky and wait a long time, so fairness needs a queue.*

**4:22–4:30** — So each repair attacks one of the four conditions. The room removes the possibility that all five compete. The asymmetric order removes the cycle. The monitor removes hold and wait. None of them makes anyone eat sooner. They only make it impossible for the whole table to stop.

> Caption: Every repair removes one condition, and none of them removes waiting.

Exam-trap caption mode adds: *Answering "the deadlock is prevented" without naming which condition was removed. The question usually wants the condition, not the verdict.*

## Scene 10. Distinctions, and the procedure for any question here

*4:30 – 5:00 · objective: Separate deadlock from starvation from unbounded waiting, and fix the order in which such a question should be read.*

**4:30–4:37** — Two failures, two definitions. A deadlock is a state where nothing at all can proceed. Starvation is where the system keeps working and one class is never chosen. A solution can be free of deadlock and still starve a class, and the readers and writers solutions show exactly that.

> Caption: Deadlock: nothing moves. Starvation: one class never chosen. They differ.

Exam-trap caption mode adds: *Using the words interchangeably in a one-mark question. The cause differs, the repair differs, and the exam distinguishes them.*

**4:37–4:45** — There is a third promise, bounded waiting: a limit on how many others may go ahead of a waiting process. The first readers and writers solution puts no limit on readers going ahead of a writer. The asymmetric philosophers solution puts no limit on lucky neighbours. Both are safe and both fail bounded waiting.

> Caption: Bounded waiting is the third promise, and it is the one usually broken.

Exam-trap caption mode adds: *Treating bounded waiting as part of mutual exclusion. It is a separate requirement, and a solution can satisfy the first and fail this.*

**4:45–4:52** — Here is the order to read any such question. Find the shared variables. Find which semaphore guards each one. For every wait, find its matching signal and check that every path reaches it. Then ask which class can be bypassed. Only then count the maximum number inside and the semaphore values.

> Caption: Read the code in this order: which variable is shared, what guards it, who signals.

Exam-trap caption mode adds: *Starting from the counts. A count computed before the matching signals are checked is a guess, because a missing signal changes every value in the trace.*

**4:52–5:00** — Both problems come down to one idea: a resource that two rules disagree about. Readers and writers disagree about sharing. Philosophers disagree about the order of two acquisitions. A counter settles the first, and breaking a cycle settles the second. Everything else here is bookkeeping.

> Caption: Both problems are one idea: a resource that two rules disagree about.

Exam-trap caption mode adds: *Learning the two solutions as text to reproduce. Both are one rule each, and a question that changes the rule changes the answer.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
