# Counting semaphores and the bounded buffer: the counter's arithmetic, the three-counter solution, and the occupancy and blocked-process bounds — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/counting-semaphores-and-the-bounded-buffer/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What a counting semaphore actually counts

*0:00 – 0:30 · objective: Say what a counting semaphore is (one integer plus a queue), what P and V do, and why the two textbook conventions are the same arithmetic.*

**0:00–0:07** — A counting semaphore is not a lock. It is one integer, called its value, together with a queue of processes that are waiting on it.

> Caption: A counting semaphore is one integer, its value, plus a queue of sleeping processes.

Exam-trap caption mode adds: *A counting semaphore is not a mutex. A mutex is a counting semaphore whose value never exceeds 1, and that restriction is what makes it a lock.*

**0:07–0:15** — P, also written wait, tries to take one permit. If the value is positive it takes one and continues. If the value is zero there is no permit, so the caller joins the queue and sleeps.

> Caption: P, or wait, takes one permit if the value is positive; otherwise the caller joins the queue.

Exam-trap caption mode adds: *A process that is put to sleep by P does not retry. It is woken by a V, and it resumes after its own P, not at the start of the loop.*

**0:15–0:22** — V, also written signal, releases one permit. If somebody is queued it hands the permit straight to the first waiter, and the value does not change. If the queue is empty it raises the value by one.

> Caption: V, or signal, hands one permit to a waiter, or raises the value if nobody is waiting.

Exam-trap caption mode adds: *A V does not always increase the value. With a non-empty queue it wakes a waiter and the value stays where it is, which is why counting the value alone can miss a waiting process.*

**0:22–0:30** — Textbooks write the same thing in two ways. Either the value never drops below zero and the queue is counted separately, or the value is allowed to go negative and its magnitude is the queue length. Both give the same queue.

> Caption: Two conventions, one arithmetic: value v0 − P + V, and the queue is the part below zero.

Exam-trap caption mode adds: *Do not mix the conventions in one answer. Under the negative convention the final value is v0 − P + V; under the non-negative convention it is max(0, v0 − P + V).*

## Scene 2. The arithmetic when nothing blocks: GATE 1998

*0:30 – 1:00 · objective: Compute the final value of a counting semaphore from the counts of P and V, and state the condition under which that formula is valid.*

**0:30–0:37** — A counting semaphore starts at 10. Six P operations and four V operations are completed. What is the resulting value? The paper’s answer is 8.

> Caption: GATE CSE 1998 Q1.31: value 10, then 6 P and 4 V. Nothing blocks, so the value ends at 8.

Exam-trap caption mode adds: *The tempting wrong answers are 0 and 12. Zero comes from subtracting all ten operations; twelve comes from adding the four V operations to the six P operations instead of subtracting the P operations.*

**0:37–0:45** — Watch the ledger. Every P takes one permit away and every V puts one back. With six P and four V from a value of ten, the value never comes close to zero, so no operation ever has to block.

> Caption: Each P takes one permit and each V adds one, so the value only depends on the two counts.

Exam-trap caption mode adds: *A question may give the operations "in some order" and still expect one answer. That is only true when nothing blocks, which is exactly the condition this scene establishes.*

**0:45–0:52** — So the whole computation is one line: the final value is the initial value, minus the number of P operations, plus the number of V operations. Here that is 10 minus 6 plus 4, which is 8.

> Caption: The closed form: final value = initial value − number of P + number of V.

Exam-trap caption mode adds: *The formula is about counts, not about the arrangement. Use it for the final value, never for the peak queue, which does depend on the order.*

**0:52–1:00** — There is one condition attached. The formula describes the value only while every P finds a permit, which needs the initial value plus the number of V operations to be at least the number of P operations. Break that and the queue appears.

> Caption: The formula holds only while nothing blocks: it needs initial value + V at least P.

Exam-trap caption mode adds: *Applying the formula when the condition fails gives a negative number, which is fine under the negative convention but wrong if the question states that the value is non-negative.*

## Scene 3. When the counter runs out: the queue behind zero

*1:00 – 1:30 · objective: Trace three P operations and one V from a value of 1, and see that a blocked P is queued, not lost, so the queue length is max(0, P − V − v0).*

**1:00–1:07** — Now start at 1 and issue three P operations. The first takes the only permit and the value falls to zero. The second and third find nothing and their processes go to sleep.

> Caption: Start at 1. The first P takes the only permit; the second and third P operations block.

Exam-trap caption mode adds: *A blocked P is not a failed P. Its process will complete that P later, when a V hands it a permit, and it resumes on the next line of its program.*

**1:07–1:15** — The queue is what makes this different from a failed attempt. The value is zero, two processes are asleep, and nothing has been forgotten.

> Caption: A blocked P is queued, not lost: the value stays at zero and two processes wait.

Exam-trap caption mode adds: *Counting only the value misses the queue. A value of zero with three sleepers and a value of zero with none are different states with the same counter.*

**1:15–1:22** — Now issue one V. Somebody is queued, so the permit goes straight to the first waiter, that process wakes, and the value stays at zero. One process is still asleep.

> Caption: One V hands its permit to a waiter, so the value is still zero and one process is left waiting.

Exam-trap caption mode adds: *If you answer "the value becomes 1" you have assumed an empty queue. With a waiter present the V is absorbed.*

**1:22–1:30** — The number still waiting is the number of P operations, minus the number of V operations, minus the initial value, and never less than zero. Three minus one minus one leaves one, and the queue peaked at two.

> Caption: Queue length = max(0, P − V − v0). Here 3 − 1 − 1 = 1 sleeper remains and the peak was 2.

Exam-trap caption mode adds: *The final queue length is order-independent; the peak queue length is not. A question about the maximum number of blocked processes needs the worst order, not this formula.*

## Scene 4. The 2016 question: does the order of the operations matter?

*1:30 – 2:00 · objective: Use the closed form to answer the largest-initial-value question of GATE 2016 Set 2 Q49, and see why the phrase "in some order" changes nothing.*

**1:30–1:37** — Here is the question from GATE 2016, Set 2, question 49. A non-negative counting semaphore receives twenty P operations and twelve V operations, in some order. What is the largest initial value for which at least one P operation is still blocked at the end?

> Caption: GATE CSE 2016 Set 2 Q49: 20 P and 12 V in some order. Largest initial value with a P still blocked?

Exam-trap caption mode adds: *The phrase "in some order" is a trap only if you try to trace orders. Under queued semantics the totals decide everything, so the order cannot change the final value or the final queue length.*

**1:37–1:45** — Twenty P operations remove twenty permits in total and twelve V operations add twelve, whatever the arrangement. Nothing in a semaphore cares where in the sequence they fall.

> Caption: Every P removes one permit and every V adds one, so the total is order-independent.

Exam-trap caption mode adds: *Order matters for the peak queue and for which process wakes first. It does not matter for the final value or the final count of sleepers.*

**1:45–1:52** — So the final value is the initial value minus twenty plus twelve, which is the initial value minus eight. One process is still blocked exactly when that number is negative.

> Caption: The final value is v0 − 20 + 12 = v0 − 8, so a P is still blocked exactly when v0 is below 8.

Exam-trap caption mode adds: *The final value alone is not the queue under the non-negative convention, where the value would be clamped at 0 and the sleeper counted separately. Both give one sleeper at v0 = 7.*

**1:52–2:00** — The largest initial value that still leaves somebody waiting is 7, and the general form is the number of P operations minus the number of V operations minus one. Twenty minus twelve minus one is seven.

> Caption: Largest such v0 is 7. In general it is P − V − 1, here 20 − 12 − 1 = 7.

Exam-trap caption mode adds: *Answering 8 comes from wanting the final value to reach zero, which is the largest value with nobody blocked, not the largest with somebody blocked. Read which side of the boundary the question asks for.*

## Scene 5. The bounded buffer: three counters, three different questions

*2:00 – 2:30 · objective: Name what empty, full and mutex each count, place the four calls in the right order, and state the invariant empty + full = N.*

**2:00–2:07** — The bounded buffer needs three counters because it asks three different questions. How many free slots are left, how many items are waiting to be read, and who is allowed to touch the buffer at this instant.

> Caption: Three counters, three different questions: free slots, items available, and who may touch the buffer.

Exam-trap caption mode adds: *Using one semaphore where three are needed is the standard wrong answer, and it produces a solution that either loses items or lets two processes write at once.*

**2:07–2:15** — empty starts at the buffer size, full starts at zero, and mutex starts at one. The producer waits for a free slot, then takes the lock, adds the item, releases the lock and signals full.

> Caption: empty starts at N, full at 0, mutex at 1. The producer waits for a slot, then for the lock.

Exam-trap caption mode adds: *Taking the lock first looks harmless because both calls are present. It is the order, not the set of calls, that decides deadlock.*

**2:15–2:22** — Every slot is either free or filled, so the two counters always add up to the buffer size. The number of items in the buffer is exactly the value of full, and mutex is 0 or 1.

> Caption: The invariant: empty + full = N in every reachable state, and the item count equals full.

Exam-trap caption mode adds: *The invariant holds only between operations. In the middle of an insert, before the signal, full has not yet been raised and the item count is one higher than full.*

**2:22–2:30** — The producer creates an item, so it signals full. The consumer frees a slot, so it signals empty. Each side signals the counter the other side is waiting on, and that is the whole discipline.

> Caption: Each side signals what it has just created for the other: the producer signals full, the consumer empty.

Exam-trap caption mode adds: *The two signals are not interchangeable even though the code looks symmetric. Producer signals full, consumer signals empty, and swapping them makes the solution wrong.*

## Scene 6. The search that checks the solution rather than trusting it

*2:30 – 3:00 · objective: Read the exhaustive search over every interleaving of two producers and two consumers, and see the four invariants hold in all reachable states.*

**2:30–2:37** — To check the solution rather than trust it, the page searches every interleaving of two producers and two consumers, each producing or consuming two items, on a buffer of three slots.

> Caption: Two producers, two consumers, three slots, two items each: every interleaving is searched.

Exam-trap caption mode adds: *A trace shows one schedule. A search shows all of them, which is the difference between "it worked when I ran it" and "it cannot fail".*

**2:37–2:45** — The search reaches 2360 distinct states. In none of them are two processes inside the buffer at the same time, so mutual exclusion is not an assumption here, it is a measurement.

> Caption: 2360 reachable states, and in none of them are two processes inside the buffer together.

Exam-trap caption mode adds: *A large state count is not a proof of correctness by itself. What matters is which invariant was checked in every state.*

**2:45–2:52** — The item count never leaves the range zero to three, so the buffer never overruns and never underruns. The two counters add up to three everywhere, so no slot is ever counted twice or lost.

> Caption: The item count stays between 0 and 3 in every state, and empty + full = 3 in every state.

Exam-trap caption mode adds: *An overrun does not always crash. It silently corrupts a neighbouring slot, so a program can pass a test run and still be wrong.*

**2:52–3:00** — No state in the search is stuck: at least one process can always take a step until everybody has finished. And at most three of the four processes are blocked at the same time.

> Caption: No reachable state is stuck, and at most three of the four processes are ever blocked at once.

Exam-trap caption mode adds: *Deadlock-free does not mean starvation-free. This search proves nobody is stuck for ever in the states it reaches, and says nothing about which waiter is woken first.*

## Scene 7. The naming trap of GATE 2018

*3:00 – 3:30 · objective: Follow the question’s own definitions of empty and full rather than their names, and decide all four assignments by simulation.*

**3:00–3:07** — GATE 2018, question 40, does something deliberate. It sets empty to 0 and full to the buffer size, and then defines empty as the number of slots the consumer may read from, which is the item count.

> Caption: GATE CSE 2018 Q40 numbers the counters against their names: empty starts at 0 and counts items.

Exam-trap caption mode adds: *Answering from the names alone gives the wrong assignment, because in this question full counts free slots and empty counts items. The definition in the question beats the name.*

**3:07–3:15** — Read the definitions and the assignment follows. The producer must wait for a free slot, which this question calls full, and must signal that an item now exists, which it calls empty.

> Caption: The producer waits on the counter of free slots and signals the counter of items.

Exam-trap caption mode adds: *A question that renames its variables is testing whether you read definitions. Write the meaning next to each name before you write any assignment.*

**3:15–3:22** — Assignment A has the producer wait on full and signal full. The net effect on that counter is nothing, the consumer’s counter never rises, and the consumer waits for ever while the buffer grows without bound.

> Caption: Assignment A signals the counter it waited on, so the consumer waits for ever while the buffer overruns.

Exam-trap caption mode adds: *A is the option that looks symmetric and tidy. Symmetry is not correctness: a producer that signals the counter it just decremented has created nothing for anybody.*

**3:22–3:30** — In B and D the producer blocks immediately because its counter starts at zero, while the consumer is allowed to read, so it takes items that were never produced. The item count falls to minus four and minus three.

> Caption: B and D let the consumer take items that do not exist: the count reaches −4 and −3. Only C is safe.

Exam-trap caption mode adds: *A negative item count is an underrun. It is the mirror of the overrun in A, and both are invisible in a run where the timing happens to hide them.*

## Scene 8. How many items, and how many blocked processes

*3:30 – 4:00 · objective: State and justify the two counting bounds: occupancy at most N, and at most n − 1 processes blocked at once.*

**3:30–3:37** — Two questions recur. How many items can be in the buffer at once, and how many processes can be blocked at once. The first answer is the buffer size, and also the number produced so far, whichever is smaller.

> Caption: How many items can the buffer hold? At most N, and at most the number produced so far.

Exam-trap caption mode adds: *Answering N when the question produces fewer items is a common slip. The occupancy cannot exceed what was produced.*

**3:37–3:45** — The second answer is n minus 1, where n is the number of processes. At least one process can always take a step, so at most all but one can be asleep.

> Caption: How many processes can be blocked at once? At most n − 1, not n.

Exam-trap caption mode adds: *Answering n assumes every process can be asleep at once, which is precisely the deadlock the correct order rules out.*

**3:45–3:52** — The reason is a case analysis. If the buffer is full then some consumer can proceed. If it is empty then some producer can proceed. If somebody is blocked on the lock, the process holding the lock can proceed.

> Caption: Why one can always move: a full buffer wakes a consumer, an empty one wakes a producer.

Exam-trap caption mode adds: *The argument needs at least one producer and one consumer and a buffer of at least one slot. With a zero-slot buffer or a missing side, it does not apply.*

**3:52–4:00** — The page measures the bound rather than assuming it, on six different combinations of buffer size, producer count and consumer count. Every one agrees: four processes, three blocked at most; two processes, one.

> Caption: Measured on six configurations: four processes give at most 3 blocked, two processes give 1.

Exam-trap caption mode adds: *These bounds are for the correct order. With the lock taken first the deadlock states exist and all n processes can be asleep.*

## Scene 9. The order of the waits, and the order of the signals

*4:00 – 4:30 · objective: Find the deadlock state of the mutex-first order at every buffer size, and separate that from the harmless reordering of the two signals.*

**4:00–4:07** — Now change one thing: let each side take the lock before the counter. The consumer takes mutex, then finds no items and sleeps on full, still holding mutex.

> Caption: Take the lock before the counter and the consumer can sleep on full while holding mutex.

Exam-trap caption mode adds: *The set of calls is identical to the correct solution. Only the order differs, which is why a question can show you code that looks right and is not.*

**4:07–4:15** — The search finds this stuck state at buffer sizes one, two, three and five. A larger buffer does not remove it, because the consumer can still find the buffer empty.

> Caption: The search finds that stuck state at every buffer size it tries: 1, 2, 3 and 5 slots.

Exam-trap caption mode adds: *The common claim that a large or unbounded buffer makes the swapped order safe is wrong for this reason: the deadlock is on the consumer side. Only removing the consumer’s wait would help, and then nothing would ever consume.*

**4:15–4:22** — The order of the two signals is a different matter. A producer may signal full before it releases mutex. That is safe: no deadlock appears and every invariant holds.

> Caption: Signalling full before releasing mutex is safe, but the woken consumer must block again.

Exam-trap caption mode adds: *This is the one reordering that is genuinely harmless. Do not confuse it with taking the lock first, which is the reordering that deadlocks.*

**4:22–4:30** — The page measures both. Releasing the lock first gives 52 reachable states, signalling first gives 30, and the peak occupancy is two items against one. Both are correct, and they behave differently.

> Caption: Measured: 52 reachable states with the release first, 30 with the signal first, occupancy 2 against 1.

Exam-trap caption mode adds: *A question that asks which signal order is correct is asking about correctness, not about these counts. Both orders are correct, and the counts differ.*

## Scene 10. The reading procedure for this whole family

*4:30 – 5:00 · objective: Leave with a four-step procedure and the four traps that decide these questions.*

**4:30–4:37** — The first step is always the same. List the counters, and write what each one counts in words, using the question’s definitions rather than the names it happens to use.

> Caption: Step one: which counters exist, and what does each one count? Use the question’s own definitions.

Exam-trap caption mode adds: *Do not assume empty counts free slots. In GATE 2018 it counts items, and the question says so.*

**4:37–4:45** — The second step is to read each side’s first wait and its two signals. Each side waits for what it needs and signals what it has just created for the other side.

> Caption: Step two: what does each side wait for first, and what does it signal for the other?

Exam-trap caption mode adds: *The two signals are easy to swap because the code looks symmetric. Check each signal against what the other side is waiting on.*

**4:45–4:52** — For a question about a semaphore’s value or its queue, use the two closed forms. The final value is the initial value minus the P operations plus the V operations, and the queue is that number below zero, floored at zero.

> Caption: Step three: for value questions use v0 − P + V, and the queue max(0, P − V − v0); order never matters.

Exam-trap caption mode adds: *The peak queue does depend on the order. Only the final value and the final queue length are order-independent.*

**4:52–5:00** — For an occupancy question use the invariant that the two counters sum to the buffer size. For a liveness question, look for a process that is asleep while holding a lock another process needs, which is the deadlock in one sentence.

> Caption: Step four: for occupancy use empty + full = N; for liveness look for a sleeper holding the lock.

Exam-trap caption mode adds: *A solution can be free of deadlock and still starve a process. Liveness questions in this family usually ask about deadlock, and starvation needs a separate argument.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
