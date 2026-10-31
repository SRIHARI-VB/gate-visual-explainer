/* ==========================================================================
   counting-semaphores-and-the-bounded-buffer — THE timeline.
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
      id: 'permits', n: 1,
      title: 'What a counting semaphore actually counts',
      start: 0, end: 30,
      objective: 'Say what a counting semaphore is (one integer plus a queue), what P and V do, and why the two textbook conventions are the same arithmetic.'
    },
    {
      id: 'arithmetic', n: 2,
      title: 'The arithmetic when nothing blocks: GATE 1998',
      start: 30, end: 60,
      objective: 'Compute the final value of a counting semaphore from the counts of P and V, and state the condition under which that formula is valid.'
    },
    {
      id: 'blocking', n: 3,
      title: 'When the counter runs out: the queue behind zero',
      start: 60, end: 90,
      objective: 'Trace three P operations and one V from a value of 1, and see that a blocked P is queued, not lost, so the queue length is max(0, P − V − v0).'
    },
    {
      id: 'order2016', n: 4,
      title: 'The 2016 question: does the order of the operations matter?',
      start: 90, end: 120,
      objective: 'Use the closed form to answer the largest-initial-value question of GATE 2016 Set 2 Q49, and see why the phrase "in some order" changes nothing.'
    },
    {
      id: 'buffer', n: 5,
      title: 'The bounded buffer: three counters, three different questions',
      start: 120, end: 150,
      objective: 'Name what empty, full and mutex each count, place the four calls in the right order, and state the invariant empty + full = N.'
    },
    {
      id: 'search', n: 6,
      title: 'The search that checks the solution rather than trusting it',
      start: 150, end: 180,
      objective: 'Read the exhaustive search over every interleaving of two producers and two consumers, and see the four invariants hold in all reachable states.'
    },
    {
      id: 'trap2018', n: 7,
      title: 'The naming trap of GATE 2018',
      start: 180, end: 210,
      objective: 'Follow the question\u2019s own definitions of empty and full rather than their names, and decide all four assignments by simulation.'
    },
    {
      id: 'bounds', n: 8,
      title: 'How many items, and how many blocked processes',
      start: 210, end: 240,
      objective: 'State and justify the two counting bounds: occupancy at most N, and at most n − 1 processes blocked at once.'
    },
    {
      id: 'orders', n: 9,
      title: 'The order of the waits, and the order of the signals',
      start: 240, end: 270,
      objective: 'Find the deadlock state of the mutex-first order at every buffer size, and separate that from the harmless reordering of the two signals.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The reading procedure for this whole family',
      start: 270, end: 300,
      objective: 'Leave with a four-step procedure and the four traps that decide these questions.'
    }
  ],

  events: [
    /* ---------------- scene 1: permits ---------------- */
    {
      id: 'p1', scene: 'permits', start: 0, end: 7.5,
      caption: 'A counting semaphore is one integer, its value, plus a queue of sleeping processes.',
      narration: 'A counting semaphore is not a lock. It is one integer, called its value, together with a queue of processes that are waiting on it.',
      detail: 'The value is the number of permits nobody has taken yet. The queue holds the processes that asked for a permit and found none. Everything in this lesson follows from those two things and nothing else.',
      keyword: 'one integer', trap: 'A counting semaphore is not a mutex. A mutex is a counting semaphore whose value never exceeds 1, and that restriction is what makes it a lock.'
    },
    {
      id: 'p2', scene: 'permits', start: 7.5, end: 15,
      caption: 'P, or wait, takes one permit if the value is positive; otherwise the caller joins the queue.',
      narration: 'P, also written wait, tries to take one permit. If the value is positive it takes one and continues. If the value is zero there is no permit, so the caller joins the queue and sleeps.',
      detail: 'The test and the decrement are one indivisible step. That is the whole reason a semaphore works, and the reason a plain read-then-write does not.',
      keyword: 'P, or wait', trap: 'A process that is put to sleep by P does not retry. It is woken by a V, and it resumes after its own P, not at the start of the loop.'
    },
    {
      id: 'p3', scene: 'permits', start: 15, end: 22.5,
      caption: 'V, or signal, hands one permit to a waiter, or raises the value if nobody is waiting.',
      narration: 'V, also written signal, releases one permit. If somebody is queued it hands the permit straight to the first waiter, and the value does not change. If the queue is empty it raises the value by one.',
      detail: 'That single sentence is why a V is always safe to call and a P is not: V never blocks, P can.',
      keyword: 'V, or signal', trap: 'A V does not always increase the value. With a non-empty queue it wakes a waiter and the value stays where it is, which is why counting the value alone can miss a waiting process.'
    },
    {
      id: 'p4', scene: 'permits', start: 22.5, end: 30,
      caption: 'Two conventions, one arithmetic: value v0 − P + V, and the queue is the part below zero.',
      narration: 'Textbooks write the same thing in two ways. Either the value never drops below zero and the queue is counted separately, or the value is allowed to go negative and its magnitude is the queue length. Both give the same queue.',
      detail: 'Dijkstra\u2019s original writes the value as a possibly negative integer. Silberschatz writes a non-negative value and a list of waiting processes. The queue length is the same number under both, so a question that states one convention can be answered in the other.',
      keyword: 'v0 \u2212 P + V', trap: 'Do not mix the conventions in one answer. Under the negative convention the final value is v0 \u2212 P + V; under the non-negative convention it is max(0, v0 \u2212 P + V).'
    },

    /* ---------------- scene 2: arithmetic ---------------- */
    {
      id: 'a1', scene: 'arithmetic', start: 30, end: 37.5,
      caption: 'GATE CSE 1998 Q1.31: value 10, then 6 P and 4 V. Nothing blocks, so the value ends at 8.',
      narration: 'A counting semaphore starts at 10. Six P operations and four V operations are completed. What is the resulting value? The paper\u2019s answer is 8.',
      detail: 'Ten minus six is four, and four plus four is eight. The order of the ten operations cannot change the total, because each P removes exactly one and each V adds exactly one.',
      keyword: 'ends at 8', trap: 'The tempting wrong answers are 0 and 12. Zero comes from subtracting all ten operations; twelve comes from adding the four V operations to the six P operations instead of subtracting the P operations.'
    },
    {
      id: 'a2', scene: 'arithmetic', start: 37.5, end: 45,
      caption: 'Each P takes one permit and each V adds one, so the value only depends on the two counts.',
      narration: 'Watch the ledger. Every P takes one permit away and every V puts one back. With six P and four V from a value of ten, the value never comes close to zero, so no operation ever has to block.',
      detail: 'The picture shows the value after each operation. The path dips from 10 to 4 and rises back to 8, and it stays strictly positive throughout.',
      keyword: 'only depends on the two counts', trap: 'A question may give the operations "in some order" and still expect one answer. That is only true when nothing blocks, which is exactly the condition this scene establishes.'
    },
    {
      id: 'a3', scene: 'arithmetic', start: 45, end: 52.5,
      caption: 'The closed form: final value = initial value − number of P + number of V.',
      narration: 'So the whole computation is one line: the final value is the initial value, minus the number of P operations, plus the number of V operations. Here that is 10 minus 6 plus 4, which is 8.',
      detail: 'The page computes this and also simulates the ten operations one at a time; the two agree, which is the check printed under the canvas.',
      keyword: 'final value = initial value', trap: 'The formula is about counts, not about the arrangement. Use it for the final value, never for the peak queue, which does depend on the order.'
    },
    {
      id: 'a4', scene: 'arithmetic', start: 52.5, end: 60,
      caption: 'The formula holds only while nothing blocks: it needs initial value + V at least P.',
      narration: 'There is one condition attached. The formula describes the value only while every P finds a permit, which needs the initial value plus the number of V operations to be at least the number of P operations. Break that and the queue appears.',
      detail: 'Here 10 + 4 is 14, comfortably at least 6, so the condition holds and no process waits.',
      keyword: 'only while nothing blocks', trap: 'Applying the formula when the condition fails gives a negative number, which is fine under the negative convention but wrong if the question states that the value is non-negative.'
    },

    /* ---------------- scene 3: blocking ---------------- */
    {
      id: 'b1', scene: 'blocking', start: 60, end: 67.5,
      caption: 'Start at 1. The first P takes the only permit; the second and third P operations block.',
      narration: 'Now start at 1 and issue three P operations. The first takes the only permit and the value falls to zero. The second and third find nothing and their processes go to sleep.',
      detail: 'The value does not go below zero under the non-negative convention. The two sleepers are recorded in the queue, and the queue is drawn beside the counter.',
      keyword: 'block', trap: 'A blocked P is not a failed P. Its process will complete that P later, when a V hands it a permit, and it resumes on the next line of its program.'
    },
    {
      id: 'b2', scene: 'blocking', start: 67.5, end: 75,
      caption: 'A blocked P is queued, not lost: the value stays at zero and two processes wait.',
      narration: 'The queue is what makes this different from a failed attempt. The value is zero, two processes are asleep, and nothing has been forgotten.',
      detail: 'Under the negative convention the same state is written as the value minus 2, and the magnitude is the number of sleepers. The page prints both readings of the same state.',
      keyword: 'queued, not lost', trap: 'Counting only the value misses the queue. A value of zero with three sleepers and a value of zero with none are different states with the same counter.'
    },
    {
      id: 'b3', scene: 'blocking', start: 75, end: 82.5,
      caption: 'One V hands its permit to a waiter, so the value is still zero and one process is left waiting.',
      narration: 'Now issue one V. Somebody is queued, so the permit goes straight to the first waiter, that process wakes, and the value stays at zero. One process is still asleep.',
      detail: 'This is the case that catches people out: a V that does not change the value. The queue shrank from two to one, and the counter did not move.',
      keyword: 'still zero', trap: 'If you answer "the value becomes 1" you have assumed an empty queue. With a waiter present the V is absorbed.'
    },
    {
      id: 'b4', scene: 'blocking', start: 82.5, end: 90,
      caption: 'Queue length = max(0, P − V − v0). Here 3 − 1 − 1 = 1 sleeper remains and the peak was 2.',
      narration: 'The number still waiting is the number of P operations, minus the number of V operations, minus the initial value, and never less than zero. Three minus one minus one leaves one, and the queue peaked at two.',
      detail: 'The page evaluates this closed form and also enumerates all fifteen orders of four P and two V operations, and checks that the final queue length is the same in every order while the peak is not.',
      keyword: 'max(0, P \u2212 V \u2212 v0)', trap: 'The final queue length is order-independent; the peak queue length is not. A question about the maximum number of blocked processes needs the worst order, not this formula.'
    },

    /* ---------------- scene 4: the 2016 question ---------------- */
    {
      id: 'c1', scene: 'order2016', start: 90, end: 97.5,
      caption: 'GATE CSE 2016 Set 2 Q49: 20 P and 12 V in some order. Largest initial value with a P still blocked?',
      narration: 'Here is the question from GATE 2016, Set 2, question 49. A non-negative counting semaphore receives twenty P operations and twelve V operations, in some order. What is the largest initial value for which at least one P operation is still blocked at the end?',
      detail: 'The answer key gives 7. The interesting part is why the phrase "in some order" is there at all, since the answer does not depend on the order.',
      keyword: 'largest initial value', trap: 'The phrase "in some order" is a trap only if you try to trace orders. Under queued semantics the totals decide everything, so the order cannot change the final value or the final queue length.'
    },
    {
      id: 'c2', scene: 'order2016', start: 97.5, end: 105,
      caption: 'Every P removes one permit and every V adds one, so the total is order-independent.',
      narration: 'Twenty P operations remove twenty permits in total and twelve V operations add twelve, whatever the arrangement. Nothing in a semaphore cares where in the sequence they fall.',
      detail: 'The page checks this rather than asserting it: it searches every reachable state of a smaller instance, four P and two V, over all fifteen orders, and confirms that the final value and the final queue length are identical in all fifteen.',
      keyword: 'order-independent', trap: 'Order matters for the peak queue and for which process wakes first. It does not matter for the final value or the final count of sleepers.'
    },
    {
      id: 'c3', scene: 'order2016', start: 105, end: 112.5,
      caption: 'The final value is v0 − 20 + 12 = v0 − 8, so a P is still blocked exactly when v0 is below 8.',
      narration: 'So the final value is the initial value minus twenty plus twelve, which is the initial value minus eight. One process is still blocked exactly when that number is negative.',
      detail: 'At an initial value of 7 the final value is minus 1, one waiter. At 8 it is 0 and the queue is empty. At 9 it is 1.',
      keyword: 'v0 \u2212 8', trap: 'The final value alone is not the queue under the non-negative convention, where the value would be clamped at 0 and the sleeper counted separately. Both give one sleeper at v0 = 7.'
    },
    {
      id: 'c4', scene: 'order2016', start: 112.5, end: 120,
      caption: 'Largest such v0 is 7. In general it is P − V − 1, here 20 − 12 − 1 = 7.',
      narration: 'The largest initial value that still leaves somebody waiting is 7, and the general form is the number of P operations minus the number of V operations minus one. Twenty minus twelve minus one is seven.',
      detail: 'The page prints the table for initial values 0 to 9 with the final value and the queue length, so the boundary is visible rather than memorised.',
      keyword: 'P \u2212 V \u2212 1', trap: 'Answering 8 comes from wanting the final value to reach zero, which is the largest value with nobody blocked, not the largest with somebody blocked. Read which side of the boundary the question asks for.'
    },

    /* ---------------- scene 5: the buffer ---------------- */
    {
      id: 'd1', scene: 'buffer', start: 120, end: 127.5,
      caption: 'Three counters, three different questions: free slots, items available, and who may touch the buffer.',
      narration: 'The bounded buffer needs three counters because it asks three different questions. How many free slots are left, how many items are waiting to be read, and who is allowed to touch the buffer at this instant.',
      detail: 'One semaphore cannot answer all three. A single counter would have to be decremented by both sides, and then a consumer blocked on it could be woken by another consumer.',
      keyword: 'three different questions', trap: 'Using one semaphore where three are needed is the standard wrong answer, and it produces a solution that either loses items or lets two processes write at once.'
    },
    {
      id: 'd2', scene: 'buffer', start: 127.5, end: 135,
      caption: 'empty starts at N, full at 0, mutex at 1. The producer waits for a slot, then for the lock.',
      narration: 'empty starts at the buffer size, full starts at zero, and mutex starts at one. The producer waits for a free slot, then takes the lock, adds the item, releases the lock and signals full.',
      detail: 'The order of the two waits is the load-bearing part. The counting semaphore comes first so that a process never sleeps while holding the lock.',
      keyword: 'waits for a slot', trap: 'Taking the lock first looks harmless because both calls are present. It is the order, not the set of calls, that decides deadlock.'
    },
    {
      id: 'd3', scene: 'buffer', start: 135, end: 142.5,
      caption: 'The invariant: empty + full = N in every reachable state, and the item count equals full.',
      narration: 'Every slot is either free or filled, so the two counters always add up to the buffer size. The number of items in the buffer is exactly the value of full, and mutex is 0 or 1.',
      detail: 'The page asserts this in every state the search reaches, not just in the states a trace happens to visit. A violation would be printed under the canvas.',
      keyword: 'empty + full = N', trap: 'The invariant holds only between operations. In the middle of an insert, before the signal, full has not yet been raised and the item count is one higher than full.'
    },
    {
      id: 'd4', scene: 'buffer', start: 142.5, end: 150,
      caption: 'Each side signals what it has just created for the other: the producer signals full, the consumer empty.',
      narration: 'The producer creates an item, so it signals full. The consumer frees a slot, so it signals empty. Each side signals the counter the other side is waiting on, and that is the whole discipline.',
      detail: 'Getting this backwards is the second most common error: a producer that signals empty wakes another producer, and the consumer starves.',
      keyword: 'signals what it has just created', trap: 'The two signals are not interchangeable even though the code looks symmetric. Producer signals full, consumer signals empty, and swapping them makes the solution wrong.'
    },

    /* ---------------- scene 6: the search ---------------- */
    {
      id: 'e1', scene: 'search', start: 150, end: 157.5,
      caption: 'Two producers, two consumers, three slots, two items each: every interleaving is searched.',
      narration: 'To check the solution rather than trust it, the page searches every interleaving of two producers and two consumers, each producing or consuming two items, on a buffer of three slots.',
      detail: 'Each state records every program counter, the three counter values, the item count and how many processes are inside the buffer. A state is expanded by letting any single enabled process take one step.',
      keyword: 'every interleaving', trap: 'A trace shows one schedule. A search shows all of them, which is the difference between "it worked when I ran it" and "it cannot fail".'
    },
    {
      id: 'e2', scene: 'search', start: 157.5, end: 165,
      caption: '2360 reachable states, and in none of them are two processes inside the buffer together.',
      narration: 'The search reaches 2360 distinct states. In none of them are two processes inside the buffer at the same time, so mutual exclusion is not an assumption here, it is a measurement.',
      detail: 'The number of states is small because each process runs a fixed number of items and then stops, which makes the state space finite and the search complete rather than a sample.',
      keyword: '2360 reachable states', trap: 'A large state count is not a proof of correctness by itself. What matters is which invariant was checked in every state.'
    },
    {
      id: 'e3', scene: 'search', start: 165, end: 172.5,
      caption: 'The item count stays between 0 and 3 in every state, and empty + full = 3 in every state.',
      narration: 'The item count never leaves the range zero to three, so the buffer never overruns and never underruns. The two counters add up to three everywhere, so no slot is ever counted twice or lost.',
      detail: 'Both properties are checked in the same pass as the mutual-exclusion check, and all three would be reported if any failed.',
      keyword: 'between 0 and 3', trap: 'An overrun does not always crash. It silently corrupts a neighbouring slot, so a program can pass a test run and still be wrong.'
    },
    {
      id: 'e4', scene: 'search', start: 172.5, end: 180,
      caption: 'No reachable state is stuck, and at most three of the four processes are ever blocked at once.',
      narration: 'No state in the search is stuck: at least one process can always take a step until everybody has finished. And at most three of the four processes are blocked at the same time.',
      detail: 'The bound of three is the general bound n minus 1, which the next scenes justify. The page measures it on five different configurations.',
      keyword: 'at most three', trap: 'Deadlock-free does not mean starvation-free. This search proves nobody is stuck for ever in the states it reaches, and says nothing about which waiter is woken first.'
    },

    /* ---------------- scene 7: the 2018 naming trap ---------------- */
    {
      id: 'f1', scene: 'trap2018', start: 180, end: 187.5,
      caption: 'GATE CSE 2018 Q40 numbers the counters against their names: empty starts at 0 and counts items.',
      narration: 'GATE 2018, question 40, does something deliberate. It sets empty to 0 and full to the buffer size, and then defines empty as the number of slots the consumer may read from, which is the item count.',
      detail: 'The question then replaces four calls with the placeholders P, Q, R and S, each of which may be empty or full, and asks which assignment is correct. The answer key gives P: full, Q: empty, R: empty, S: full.',
      keyword: 'against their names', trap: 'Answering from the names alone gives the wrong assignment, because in this question full counts free slots and empty counts items. The definition in the question beats the name.'
    },
    {
      id: 'f2', scene: 'trap2018', start: 187.5, end: 195,
      caption: 'The producer waits on the counter of free slots and signals the counter of items.',
      narration: 'Read the definitions and the assignment follows. The producer must wait for a free slot, which this question calls full, and must signal that an item now exists, which it calls empty.',
      detail: 'The consumer does the mirror image: it waits on empty, the item count, and signals full, the free-slot count. Only that assignment makes each side wait on what it needs and signal what it created.',
      keyword: 'free slots', trap: 'A question that renames its variables is testing whether you read definitions. Write the meaning next to each name before you write any assignment.'
    },
    {
      id: 'f3', scene: 'trap2018', start: 195, end: 202.5,
      caption: 'Assignment A signals the counter it waited on, so the consumer waits for ever while the buffer overruns.',
      narration: 'Assignment A has the producer wait on full and signal full. The net effect on that counter is nothing, the consumer\u2019s counter never rises, and the consumer waits for ever while the buffer grows without bound.',
      detail: 'The search measures it: with four items attempted on a three-slot buffer, the item count reaches 4 and the consumer never removes anything. That is an overrun, not a slow solution.',
      keyword: 'waits for ever', trap: 'A is the option that looks symmetric and tidy. Symmetry is not correctness: a producer that signals the counter it just decremented has created nothing for anybody.'
    },
    {
      id: 'f4', scene: 'trap2018', start: 202.5, end: 210,
      caption: 'B and D let the consumer take items that do not exist: the count reaches −4 and −3. Only C is safe.',
      narration: 'In B and D the producer blocks immediately because its counter starts at zero, while the consumer is allowed to read, so it takes items that were never produced. The item count falls to minus four and minus three.',
      detail: 'Only assignment C keeps the item count between 0 and 3, keeps the two counters summing to 3, and finishes with every process completing. It is the only one of the four the search cannot break.',
      keyword: 'do not exist', trap: 'A negative item count is an underrun. It is the mirror of the overrun in A, and both are invisible in a run where the timing happens to hide them.'
    },

    /* ---------------- scene 8: the bounds ---------------- */
    {
      id: 'g1', scene: 'bounds', start: 210, end: 217.5,
      caption: 'How many items can the buffer hold? At most N, and at most the number produced so far.',
      narration: 'Two questions recur. How many items can be in the buffer at once, and how many processes can be blocked at once. The first answer is the buffer size, and also the number produced so far, whichever is smaller.',
      detail: 'The search confirms it: with a buffer of three and only two items ever produced, the occupancy peaks at 2, not 3. The bound is a minimum of two quantities.',
      keyword: 'At most N', trap: 'Answering N when the question produces fewer items is a common slip. The occupancy cannot exceed what was produced.'
    },
    {
      id: 'g2', scene: 'bounds', start: 217.5, end: 225,
      caption: 'How many processes can be blocked at once? At most n − 1, not n.',
      narration: 'The second answer is n minus 1, where n is the number of processes. At least one process can always take a step, so at most all but one can be asleep.',
      detail: 'With four processes the search reaches states with three blocked and never four. With two processes it reaches one and never two.',
      keyword: 'n \u2212 1', trap: 'Answering n assumes every process can be asleep at once, which is precisely the deadlock the correct order rules out.'
    },
    {
      id: 'g3', scene: 'bounds', start: 225, end: 232.5,
      caption: 'Why one can always move: a full buffer wakes a consumer, an empty one wakes a producer.',
      narration: 'The reason is a case analysis. If the buffer is full then some consumer can proceed. If it is empty then some producer can proceed. If somebody is blocked on the lock, the process holding the lock can proceed.',
      detail: 'Those three cases cover every state, and each produces a runnable process, which is why the bound holds for the correct order at any buffer size of at least one.',
      keyword: 'one can always move', trap: 'The argument needs at least one producer and one consumer and a buffer of at least one slot. With a zero-slot buffer or a missing side, it does not apply.'
    },
    {
      id: 'g4', scene: 'bounds', start: 232.5, end: 240,
      caption: 'Measured on six configurations: four processes give at most 3 blocked, two processes give 1.',
      narration: 'The page measures the bound rather than assuming it, on six different combinations of buffer size, producer count and consumer count. Every one agrees: four processes, three blocked at most; two processes, one.',
      detail: 'The same runs report no deadlock in any configuration, which is the other half of the argument.',
      keyword: 'Measured on six configurations', trap: 'These bounds are for the correct order. With the lock taken first the deadlock states exist and all n processes can be asleep.'
    },

    /* ---------------- scene 9: the orders ---------------- */
    {
      id: 'h1', scene: 'orders', start: 240, end: 247.5,
      caption: 'Take the lock before the counter and the consumer can sleep on full while holding mutex.',
      narration: 'Now change one thing: let each side take the lock before the counter. The consumer takes mutex, then finds no items and sleeps on full, still holding mutex.',
      detail: 'The producer then needs mutex to add the item the consumer is waiting for, and cannot get it. The two processes wait for each other, and nothing in the program can break the cycle.',
      keyword: 'still holding mutex', trap: 'The set of calls is identical to the correct solution. Only the order differs, which is why a question can show you code that looks right and is not.'
    },
    {
      id: 'h2', scene: 'orders', start: 247.5, end: 255,
      caption: 'The search finds that stuck state at every buffer size it tries: 1, 2, 3 and 5 slots.',
      narration: 'The search finds this stuck state at buffer sizes one, two, three and five. A larger buffer does not remove it, because the consumer can still find the buffer empty.',
      detail: 'What a large buffer removes is the producer\u2019s wait for a slot. The consumer\u2019s wait for an item remains, and that is the one that holds the lock.',
      keyword: 'every buffer size', trap: 'The common claim that a large or unbounded buffer makes the swapped order safe is wrong for this reason: the deadlock is on the consumer side. Only removing the consumer\u2019s wait would help, and then nothing would ever consume.'
    },
    {
      id: 'h3', scene: 'orders', start: 255, end: 262.5,
      caption: 'Signalling full before releasing mutex is safe, but the woken consumer must block again.',
      narration: 'The order of the two signals is a different matter. A producer may signal full before it releases mutex. That is safe: no deadlock appears and every invariant holds.',
      detail: 'What changes is the schedule. The woken consumer immediately tries to take mutex, finds it still held, and goes back to sleep. It loses nothing but a turn.',
      keyword: 'safe, but', trap: 'This is the one reordering that is genuinely harmless. Do not confuse it with taking the lock first, which is the reordering that deadlocks.'
    },
    {
      id: 'h4', scene: 'orders', start: 262.5, end: 270,
      caption: 'Measured: 52 reachable states with the release first, 30 with the signal first, occupancy 2 against 1.',
      narration: 'The page measures both. Releasing the lock first gives 52 reachable states, signalling first gives 30, and the peak occupancy is two items against one. Both are correct, and they behave differently.',
      detail: 'The smaller state count is not a defect. It reflects that the signal-first version wakes a consumer earlier, so items are consumed sooner and the buffer holds fewer.',
      keyword: '52 against 30', trap: 'A question that asks which signal order is correct is asking about correctness, not about these counts. Both orders are correct, and the counts differ.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'i1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: which counters exist, and what does each one count? Use the question\u2019s own definitions.',
      narration: 'The first step is always the same. List the counters, and write what each one counts in words, using the question\u2019s definitions rather than the names it happens to use.',
      detail: 'Two of the traps in this lesson are naming traps. Writing the meaning beside each name costs ten seconds and removes both.',
      keyword: 'what does each one count', trap: 'Do not assume empty counts free slots. In GATE 2018 it counts items, and the question says so.'
    },
    {
      id: 'i2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: what does each side wait for first, and what does it signal for the other?',
      narration: 'The second step is to read each side\u2019s first wait and its two signals. Each side waits for what it needs and signals what it has just created for the other side.',
      detail: 'If a side waits for a lock before it waits for its resource, the solution can deadlock and the answer to the question is already decided.',
      keyword: 'waits for what it needs', trap: 'The two signals are easy to swap because the code looks symmetric. Check each signal against what the other side is waiting on.'
    },
    {
      id: 'i3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step three: for value questions use v0 − P + V, and the queue max(0, P − V − v0); order never matters.',
      narration: 'For a question about a semaphore\u2019s value or its queue, use the two closed forms. The final value is the initial value minus the P operations plus the V operations, and the queue is that number below zero, floored at zero.',
      detail: 'The order of the operations does not change either quantity, so the phrase "in some order" can be read as "in any order" for these questions.',
      keyword: 'v0 \u2212 P + V', trap: 'The peak queue does depend on the order. Only the final value and the final queue length are order-independent.'
    },
    {
      id: 'i4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Step four: for occupancy use empty + full = N; for liveness look for a sleeper holding the lock.',
      narration: 'For an occupancy question use the invariant that the two counters sum to the buffer size. For a liveness question, look for a process that is asleep while holding a lock another process needs, which is the deadlock in one sentence.',
      detail: 'Four steps, four traps, and one sentence that decides the liveness half: never sleep while holding a lock the waker needs.',
      keyword: 'never sleep while holding a lock', trap: 'A solution can be free of deadlock and still starve a process. Liveness questions in this family usually ask about deadlock, and starvation needs a separate argument.'
    }
  ]
};
