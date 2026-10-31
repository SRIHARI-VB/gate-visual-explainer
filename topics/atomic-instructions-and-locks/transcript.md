# Atomic instructions and the locks built from them: test-and-set, swap, compare-and-swap and bounded waiting — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/atomic-instructions-and-locks/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A lock cannot be built from an ordinary read and write

*0:00 – 0:30 · objective: See that a flag tested and then set in two separate steps lets two processes into the section together, so a lock needs one indivisible step.*

**0:00–0:07** — Two processes want the same critical section, and one shared word is supposed to keep them apart. The word starts at zero, which means the section is free. Everything in this lesson is about how that word is read and changed.

> Caption: Two processes, one shared flag, and a section only one may enter.

Exam-trap caption mode adds: *Assuming the shared word is enough on its own. The word is data; what matters is whether the sequence that uses it can be interrupted.*

**0:07–0:15** — The obvious lock reads the flag and repeats while it is set, and then a separate statement writes one. Two statements, and the machine may switch a process out between them. That gap is the whole problem.

> Caption: The obvious lock: test the flag, then set it. Two separate steps.

Exam-trap caption mode adds: *Reading the two lines as one action because they sit on adjacent lines. The processor sees a load, a test and a store.*

**0:15–0:22** — Process zero reads zero and is switched out before it writes. Process one reads zero too, because nothing has been written yet. Each then writes one and each enters the section. Both are inside, and the flag never warned either of them.

> Caption: Both read zero, both write one, both enter. The search finds it.

Exam-trap caption mode adds: *Believing the flag is wrong. The flag is correct at every instant; the sequence that reads and writes it is what fails.*

**0:22–0:30** — The search on this page enumerates every interleaving of the two processes. Fifty-two states are reachable, and exactly one of them has both processes inside. So the failure is not hypothetical, it is a state you can point at.

> Caption: Computed: 52 reachable states, exactly one with two inside.

Exam-trap caption mode adds: *Thinking a rare interleaving does not count. A lock must hold for every legal schedule, and one reachable violation is enough to refute it.*

## Scene 2. test-and-set: one indivisible read-and-write

*0:30 – 1:00 · objective: State what test-and-set returns and what it stores, build the spin lock from it, and check every interleaving of three processes for mutual exclusion.*

**0:30–0:37** — One instruction does the whole job. It reads the old value, hands it back, and writes one, and nothing else may touch that word in between. The return value is what the word held before, and that is exactly what a lock needs to know.

> Caption: test-and-set returns the old value and stores one, as one step.

Exam-trap caption mode adds: *Confusing the return value with the new value. The instruction returns what was there before; the word itself always ends at one.*

**0:37–0:45** — The lock becomes one line. Keep calling the instruction while it returns one; stop when it returns zero. A zero means you were the process that changed the word from free to held. Release is a plain store of zero, because a single store cannot be half done.

> Caption: The lock is one line: spin while the old value came back as one.

Exam-trap caption mode adds: *Thinking the release also needs an atomic instruction. Writing one word is already indivisible; the release is a plain store.*

**0:45–0:52** — Process zero calls it, gets zero and enters. Process one and process two each get one back, so they go round again. The word stays at one for as long as somebody is inside, and that is mutual exclusion with no gap in it.

> Caption: The winner gets zero and enters. The others get one and spin.

Exam-trap caption mode adds: *Calling the waiting "blocked". These processes are running and consuming the processor; they are not asleep.*

**0:52–1:00** — Every interleaving of three processes, each going round twice, gives a hundred and thirty-five states. Not one of them has two processes inside. The largest number inside is one, which is exactly what the problem asked for.

> Caption: Computed: 135 states, no state with two inside, maximum one.

Exam-trap caption mode adds: *Assuming mutual exclusion is enough. It is one of three requirements, and this lock fails the third one, as scene seven shows.*

## Scene 3. The word that decides the answer: indivisible

*1:00 – 1:30 · objective: Write test-and-set as three ordinary statements and watch the same search find two processes inside, so atomicity is a property of the instruction, not of the code.*

**1:00–1:07** — Here is the same instruction written as ordinary C. Load the old value, store one, return the saved value. Three statements, and a process can be switched out between any two of them. The moment that is allowed, it is no longer the instruction the lock was built on.

> Caption: Written out, test-and-set is three statements, and that changes everything.

Exam-trap caption mode adds: *Believing a library function marked atomic in a comment is atomic. Atomicity comes from the instruction set, not from a comment.*

**1:07–1:15** — Process zero loads zero and is switched out. Process one loads zero too, stores one, returns zero and enters. Process zero resumes, stores one, and returns the zero it saved earlier, so it enters as well. Both were told they had won, and both were.

> Caption: Both load zero. Both store one. Both are told they won.

Exam-trap caption mode adds: *Reading this as a bug in the C function. The C function is a correct description of the instruction; the split is what happens when the hardware does not provide it.*

**1:15–1:22** — Run the same search on this split version and it finds the violation at once: a reachable state with both processes inside. The code did not change and the schedules did not change. Only the places where a switch is allowed changed.

> Caption: The same search on the split version finds the same violation.

Exam-trap caption mode adds: *Answering "the algorithm is wrong". The algorithm is right; the assumption that the three statements are one step is what is wrong.*

**1:22–1:30** — So one word carries the whole lesson. Every primitive here is defined by a single promise: nothing else may touch that word between the read and the write. The exam asks how many instructions, and the answer depends on that promise, not on the number.

> Caption: So the load-bearing word in every definition here is indivisible.

Exam-trap caption mode adds: *Treating "atomic" as "fast". An atomic instruction can be slow; what it guarantees is that it cannot be half finished.*

## Scene 4. swap: the same lock from an exchange

*1:30 – 2:00 · objective: Read the swap lock, follow the key register through the exchange, and see that it is the same lock as test-and-set built from a different instruction.*

**1:30–1:37** — The second primitive is smaller. It takes two words and exchanges their contents, indivisibly. No return value, no comparison. All of its power is that the exchange cannot be interrupted halfway.

> Caption: swap exchanges two words indivisibly. Nothing else about it.

Exam-trap caption mode adds: *Looking for a return value. swap has none; the value the lock needs arrives in the second word.*

**1:37–1:45** — Each process keeps a private word holding one, and swaps it with the lock. If the lock was free, the swap puts one into the lock and brings zero back to the private word, so the loop ends. If the lock was held, one comes back and the process tries again.

> Caption: A private key register of one, swapped with the lock word.

Exam-trap caption mode adds: *Forgetting to reset the private word to one before each attempt. It must be one at the start of every exchange, or the loop ends for the wrong reason.*

**1:45–1:52** — On the trace, the first process finds the lock at zero. The exchange leaves the lock at one and its key at zero, so it enters. Every process after it brings back one and spins, and the lock stays at one while the section is occupied.

> Caption: The trace: lock zero to one, key one to zero, and this process is in.

Exam-trap caption mode adds: *Thinking the lock word can end at a value other than zero or one. Only one and zero are ever stored into it.*

**1:52–2:00** — The search gives four hundred and twenty-five states and not one violation. So the swap lock and the test-and-set lock behave the same way: same mutual exclusion, same starvation, different instruction. That is the sentence to carry into an exam.

> Caption: Computed: 425 states, no violation. Same lock, different instruction.

Exam-trap caption mode adds: *Assuming a different instruction gives a different property. Mutual exclusion and starvation come from the loop structure, which is identical.*

## Scene 5. compare-and-swap: test and write in one step

*2:00 – 2:30 · objective: Read the three arguments of compare-and-swap, use it as a lock, and use it to make an increment atomic instead.*

**2:00–2:07** — The third primitive takes three arguments: where the word is, what you expect it to hold, and what you want it to hold. It reads, compares, and stores only if the comparison matched. It also returns what it found, so the caller learns whether the store happened.

> Caption: compare-and-swap takes three arguments: address, expected, new.

Exam-trap caption mode adds: *Thinking it always stores. The store is conditional on the comparison, and that condition is the whole instruction.*

**2:07–2:15** — As a lock it is one line. Expect zero, ask for one, and keep asking while the answer comes back as one. If the word was zero, the store happens and you are in. If it was one, the store does not happen and you learn that from the return value.

> Caption: As a lock: expect zero, ask for one, and spin while it fails.

Exam-trap caption mode adds: *Writing the expected value as one. Expecting one would mean "store one if the word is already one", which never excludes anybody.*

**2:15–2:22** — Now the interesting use. An increment becomes a loop around the same instruction: read the value, compute the next one, and store only if the value did not change meanwhile. If it did change, try again. The result is a counter that cannot lose an update.

> Caption: The same instruction, used instead to make an increment atomic.

Exam-trap caption mode adds: *Believing the loop can spin for ever. Every failed attempt means somebody else succeeded, so the counter does advance.*

**2:22–2:30** — Two threads each add one a thousand times, and one read per round is stale. The compare-and-swap counter still ends at exactly two thousand, with a thousand retries along the way. The plain version loses an update every time a read is stale. That is what the instruction buys.

> Caption: Computed: 2,000 increments, 2,000 in the counter, 1,000 retries.

Exam-trap caption mode adds: *Expecting the retries to show up in the total. Retries cost time and change nothing about the final value.*

## Scene 6. The fetch-and-add lock of GATE 2012, and its defect

*2:30 – 3:00 · objective: Trace the published lock whose body sets the word back to one, and find the reachable state where the lock is held and nobody is inside.*

**2:30–2:37** — This is the lock GATE asked about in 2012. Fetch-and-add reads the word, adds one, and returns what was there. The loop keeps going while the returned value is not zero, and the body sets the word back to one. Both statements are inside the loop.

> Caption: GATE 2012 gave a lock built on fetch-and-add, with a body that resets.

Exam-trap caption mode adds: *Reading the loop as an empty statement. There is no semicolon after the condition, so the assignment is the body and runs on every failed attempt.*

**2:37–2:45** — The first process finds zero, so fetch-and-add returns zero and leaves one. The test is false, the body is skipped, and it enters. A second process gets one back, which makes the word two, and then its body puts the word back to one, so it spins.

> Caption: The happy path: zero comes back, the word is one, and this process enters.

Exam-trap caption mode adds: *Thinking the word can stay at two. The body always brings it back to one on the next attempt.*

**2:45–2:52** — Now the defect. A waiting process fetches, gets one, leaves the word at two, and is switched out before its body runs. The holder releases, storing zero. The waiting process resumes and its body stores one. The word is one, nobody is inside, and the release has been overwritten.

> Caption: The defect: a switch after the fetch, before the reset, and the word is stranded at one.

Exam-trap caption mode adds: *Calling this a lost update of a counter. Here the lost value is the release, and the consequence is that the lock can never be taken again.*

**2:52–3:00** — The search reaches a state with the word at one and nobody inside. From there, forty-six further states are visited and not one of them enters the section, because every fetch returns a non-zero value and every body puts one back. The lock is not held by anyone and cannot be taken.

> Caption: Computed: a reachable state with the word at one and nobody inside, and no way in.

Exam-trap caption mode adds: *Answering "it works correctly but may starve". A lock that can never be taken is not merely unfair; the code fails, which is the answer the paper wants.*

## Scene 7. Starvation in the plain lock, and the waiting array that fixes it

*3:00 – 3:30 · objective: Show a schedule in which one process never gets in, then read the exit scan that hands the lock to the next waiting process and bounds the wait by n minus one.*

**3:00–3:07** — The plain lock has no queue. On the schedule computed here, process zero and process two alternate for six rounds, and process one tries once per round and loses every time. Six admissions and six failures, and process one has still never been inside.

> Caption: The plain lock has no queue, so a process can lose every race.

Exam-trap caption mode adds: *Calling this a deadlock. Somebody is always inside and always making progress; it is one particular process that is never chosen.*

**3:07–3:15** — The fix keeps one flag per process and a private key. A process raises its flag, then spins only while its own flag is still raised and its key still says the lock is held. That raised flag is the handle the exiting process will use to hand the lock over.

> Caption: One flag per process, and the lock is handed over rather than raced for.

Exam-trap caption mode adds: *Dropping the second condition. Without the key test the process would spin even after its flag had been cleared.*

**3:15–3:22** — On the way out, the process scans forward from its own index for the first raised flag. If it finds one, it clears that flag and leaves the lock at one, so the chosen process drops out of its loop without needing the instruction at all. If nobody is waiting, it stores zero.

> Caption: On exit, scan forward for the next raised flag and clear it instead of the lock.

Exam-trap caption mode adds: *Expecting the exiting process to store zero every time. Storing zero would reopen the race the waiting array was added to close.*

**3:22–3:30** — The search gives two thousand three hundred and fifty-two states and no violation. The exit scan is checked on all two hundred and fifty-six combinations of process and waiting vector, and it always picks the nearest raised flag going round. So a process waits for at most n minus one admissions, which is the bound the definition asks for.

> Caption: Computed: 2,352 states, no violation, and the wait is at most n minus one.

Exam-trap caption mode adds: *Reading the bound as "nobody waits". Bounded waiting allows a wait; it forbids an unbounded one.*

## Scene 8. The ticket lock: a queue kept in two counters

*3:30 – 4:00 · objective: Follow the dispenser and the display, check that admission is in ticket order, and state the wait bound and its wraparound caveat.*

**3:30–3:37** — The ticket lock is two counters. One dispenses a ticket with fetch-and-add, so the numbers go out as zero, one, two, with no two processes getting the same one. The other shows whose turn it is, and a process spins while its ticket differs from that.

> Caption: Two counters: one dispenses tickets, one shows whose turn it is.

Exam-trap caption mode adds: *Confusing the two counters. The dispenser only ever grows; the display only ever catches up with it.*

**3:37–3:45** — Subtract the display from the dispenser and you have the number of processes inside or waiting. If the dispenser has given out t tickets and the display has served s, then t minus s is how many are in the system. That one subtraction answers most of the counting questions here.

> Caption: The difference between the counters is the number of processes in the system.

Exam-trap caption mode adds: *Reading the difference as the queue length only. It counts the process inside as well.*

**3:45–3:52** — The search gives twelve hundred and one states and no violation. It also checks, at every one of them, that whoever is inside holds the ticket the display shows. There are no exceptions, so admission is in ticket order, not merely exclusive.

> Caption: Computed: 1,201 states, no violation, and admission follows ticket order.

Exam-trap caption mode adds: *Assuming the ticket lock removes contention. It removes unfairness; the waiters still spin.*

**3:52–4:00** — The display increases by exactly one per release and every ticket is distinct, so a process is admitted after at most n minus one other admissions. One caveat. The counters are a fixed width, so the comparison has to be a wrap-safe difference rather than a plain inequality, or the queue breaks when they wrap.

> Caption: The bound is n minus one admissions, with one caveat about wraparound.

Exam-trap caption mode adds: *Using a plain less-than comparison on unsigned counters. After a wrap the comparison inverts and every waiter is stuck.*

## Scene 9. What spinning costs, and the one-line improvement

*4:00 – 4:30 · objective: Count the failed attempts under contention, derive n times n minus one over two, and see what test-and-test-and-set changes and what it does not.*

**4:00–4:07** — A spinning process is not waiting politely, it is running. It issues the instruction, is refused, and issues it again. On one processor that mostly wastes time. On several processors every attempt writes a shared cache line, and that is much more expensive than a local test.

> Caption: A spinner burns the processor to ask the same question again.

Exam-trap caption mode adds: *Believing spinning is free because it does no work. It consumes the very resource the holder needs.*

**4:07–4:15** — Count the failed attempts. The first process makes none, the second makes one, the third makes two, and the last makes n minus one. Add them and you get n times n minus one over two: six for four processes, twenty-eight for eight. The page computes both.

> Caption: With n processes arriving together, the attempts are 0, 1, 2 and up to n minus one.

Exam-trap caption mode adds: *Counting the successful attempt as a failure. The holder’s own call succeeds and is not part of the total.*

**4:15–4:22** — The improvement spins on an ordinary read, and calls the atomic instruction only when the read says the lock is free. The count of attempts is the same. What falls is the number of writes to the shared line, and on several processors that is the expensive part.

> Caption: Test-and-test-and-set: read cheaply, and use the instruction only when it may succeed.

Exam-trap caption mode adds: *Thinking the improvement is still correct if the read loop replaces the instruction. A read loop alone has the gap scene one showed.*

**4:22–4:30** — A blocking lock does not spin at all. A refused process goes on a queue and the processor goes to somebody else. That removes the wasted attempts and adds a context switch on each side, which is why short holds use spinning and long holds use blocking.

> Caption: A blocking lock trades the spin for a queue and a switch.

Exam-trap caption mode adds: *Assuming blocking is always better. A switch costs more than a few spins, so for a very short section spinning wins.*

## Scene 10. Which property each lock gives, and how to read such a question

*4:30 – 5:00 · objective: Put mutual exclusion, progress and bounded waiting side by side for the three locks, and fix the order in which a question on this family is read.*

**4:30–4:37** — Every lock on this page gives mutual exclusion, and every one gives progress. What separates them is the third requirement. The plain locks can starve a process; the waiting array and the ticket lock cannot, because they added a queue.

> Caption: Every lock here gives mutual exclusion. Only two of them bound the wait.

Exam-trap caption mode adds: *Awarding bounded waiting to a lock because it is correct. Correctness here is three separate promises and a paper may ask for any one.*

**4:37–4:45** — Each lock needs exactly one indivisible instruction, and everything else is ordinary code. But having one is not enough. The fetch-and-add lock from 2012 has one, and it still fails, because an ordinary statement sits inside the loop beside it.

> Caption: One indivisible instruction is the whole requirement, not the whole solution.

Exam-trap caption mode adds: *Approving any code that contains an atomic instruction. Where the other statements sit is what decides the answer.*

**4:45–4:52** — Read such a question in one order. First, which instruction is atomic, and what does it return. Second, what else runs between that instruction and the section. Third, does anything order the waiters. Those three questions answer mutual exclusion, progress and bounded waiting in turn.

> Caption: Read such a question in one order: instruction, then loop, then queue.

Exam-trap caption mode adds: *Starting from the code and looking for a familiar shape. Start from the instruction and its return value; the rest follows.*

**4:52–5:00** — So a lock is two ideas. One indivisible step makes the section exclusive. A queue, when there is one, makes the wait bounded. Everything else on this page is a variation on those two, and every question in this family asks about one of them.

> Caption: So a lock is one indivisible step plus a queue, and nothing else.

Exam-trap caption mode adds: *Looking for a third ingredient. There is none: the variants differ in the instruction and in whether a queue exists.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
