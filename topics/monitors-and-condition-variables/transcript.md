# Monitors and Condition Variables: the While Rule, Signal against Broadcast, and the Semaphore Construction — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/monitors-and-condition-variables/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 42 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why one lock is not enough

*0:00 – 0:30 · objective: See that mutual exclusion alone deadlocks a thread that needs a condition another thread must make true, and that the repair is to step out of the monitor and sleep on a named queue.*

**0:00–0:06** — A monitor lets exactly one thread execute inside it at a time. That part is automatic. The compiler puts the lock at the start and the end of every procedure.

> Caption: A monitor lets one thread inside at a time. That is mutual exclusion, and it comes free.

Exam-trap caption mode adds: *A monitor is not a mutex with extra syntax. The lock is only half of it; without condition variables a monitor cannot express waiting at all.*

**0:06–0:12** — Here T1 is inside the monitor. It wants to remove an item, and the buffer is empty. The only thread that can make the buffer non-empty is T2, which is outside.

> Caption: T1 is inside and needs the buffer to be non-empty, but only T2 can put an item in it.

Exam-trap caption mode adds: *This is not a rare case. Every bounded buffer, every readers-writers monitor and every scheduling decision has a thread waiting for a condition another thread must establish.*

**0:12–0:18** — T1 could spin, testing the buffer again and again. It would spin forever. T2 cannot enter to add an item, because T1 holds the lock. The thread waiting for a change is preventing the change.

> Caption: Busy-waiting inside the monitor spins forever, because the spinner is holding the door shut.

Exam-trap caption mode adds: *A question that shows a loop testing a shared variable inside a monitor is showing a defect, not a solution. Mutual exclusion guarantees the test can never change while the tester holds the lock.*

**0:18–0:24** — The repair is three steps in one action. Release the lock. Join a queue named after the condition you are waiting for. Sleep. Somebody who makes the condition true will take you off that queue.

> Caption: So the thread steps out: release the lock, join a named queue, and sleep.

Exam-trap caption mode adds: *The queue is not a count. Three threads asleep on notEmpty is three entries in a list, not the number three stored anywhere.*

**0:24–0:30** — That queue is a condition variable. The lock and the condition variable solve two different problems, and a monitor is the two of them together.

> Caption: That queue is a condition variable. The lock solves exclusion; the queue solves waiting.

Exam-trap caption mode adds: *Do not read condition variable as a kind of semaphore. The next four scenes are the differences, and they are all consequences of one fact: a condition variable has no value.*

## Scene 2. What a monitor is made of

*0:30 – 1:00 · objective: Name the four parts of a monitor — private data, entry procedures, one implicit lock, condition variables — and say what a condition variable holds and what it does not.*

**0:30–0:37** — A monitor has private data. The counter, the buffer, the flags: all of it is reachable only through the procedures the monitor exports.

> Caption: Part one is private data. It is reachable only through the monitor’s own procedures.

Exam-trap caption mode adds: *Data declared inside a monitor is not protected by being declared; it is protected by being unreachable from outside. A pointer handed out of a monitor undoes the whole guarantee.*

**0:37–0:44** — Part two is the set of procedures. insert and remove, in the buffer case. Only one thread may be inside any of them at a time, and that includes two different procedures of the same monitor.

> Caption: Part two is the entry procedures. Only one thread may be inside any of them at once.

Exam-trap caption mode adds: *The lock is per monitor instance. Two monitors means two independent locks, so a thread may hold both, and a question about deadlock may well be about that.*

**0:44–0:51** — Part three is the lock itself. It is taken on entry, released on exit, and it is also released and re-acquired around every wait. You never write those three calls.

> Caption: Part three is the implicit lock: taken on entry, released on exit, and released again around every wait.

Exam-trap caption mode adds: *wait releases the lock and re-acquires it. signal does not release it under Mesa. Mixing those two up is the most common single error in this topic.*

**0:51–1:00** — Part four is the condition variables. Each one is a queue of waiting threads and nothing else. wait always blocks and releases the lock; signal wakes one waiter if there is one; broadcast wakes all of them.

> Caption: Part four is the condition variables: one queue each, no value, and three operations.

Exam-trap caption mode adds: *A condition variable cannot be tested. Writing if (cv) is meaningless, because there is nothing to read. What you test is the shared data, and what you wait on is the name.*

## Scene 3. wait is three steps in one

*1:00 – 1:30 · objective: State the three indivisible steps of wait and explain why separating the lock release from the sleep loses a signal forever.*

**1:00–1:07** — wait does three things, and it does them as one action. It releases the monitor lock. It puts the calling thread on the queue of that condition variable. It sleeps.

> Caption: wait does three things as one indivisible action: release the lock, join the queue, sleep.

Exam-trap caption mode adds: *If a question describes wait as two separate operations, the answer it expects is the lost-wakeup one. Atomicity is not a performance detail here; it is the correctness condition.*

**1:07–1:14** — When the thread wakes, it is not running yet. It must acquire the lock again, and only then does wait return. Everything after the call runs inside the monitor, protected as usual.

> Caption: On waking it re-acquires the lock before returning, so the code after the wait is protected.

Exam-trap caption mode adds: *A woken thread is runnable, not running, and it does not hold the lock. Any claim that a signal transfers control to the waiter is a claim about Hoare semantics, not about monitors in general.*

**1:14–1:21** — Here is what the atomicity buys. Suppose thread A releases the lock and is not yet asleep. Thread B takes the lock, signals the condition, and leaves. A now goes to sleep. The signal has already happened and A missed it.

> Caption: If the release and the sleep could be separated, a signal arriving in the gap would be lost.

Exam-trap caption mode adds: *The same failure appears from the outside as a signal sent before the wait. That is why the condition must be tested under the lock immediately before waiting: the test and the wait together cannot be interleaved with a signal.*

**1:21–1:30** — After three waits and one signal, the condition variable holds two threads and one is runnable. That one still does not hold the lock. The signal moved a queue entry; it did not transfer ownership of anything.

> Caption: One signal moves exactly one thread from the queue to runnable. It does not hand it the lock.

Exam-trap caption mode adds: *Calling wait without holding the lock is an error, not a harmless no-op. In Java it is a thrown IllegalMonitorStateException; in C and C++ it is undefined behaviour.*

## Scene 4. signal has no memory

*1:30 – 2:00 · objective: Separate P from wait and V from signal on six rows, and state the one row that decides most questions: a signal with no waiter is lost.*

**1:30–1:37** — The first row of the table is the whole story. A semaphore has an integer. A condition variable has a queue and no integer at all.

> Caption: A semaphore has a value. A condition variable has only a queue.

Exam-trap caption mode adds: *Both have operations called wait and signal. The names are shared and the semantics are not. A question that uses the words without saying which construct it means is a question to read twice.*

**1:37–1:44** — P takes a permit and blocks only when there is none. wait always blocks. There is no state of the world in which a condition variable lets the caller continue.

> Caption: P blocks only when the value is zero. wait always blocks, whatever the state.

Exam-trap caption mode adds: *An unconditional wait with no test around it is correct only if the event is guaranteed to happen exactly once and cannot have happened already. In every other case the test is mandatory.*

**1:44–1:51** — Now the decisive row. V with no waiter adds one to the value, and a later P spends it. signal with no waiter does nothing, and a later wait still blocks.

> Caption: V adds one to the value when nobody waits. signal with nobody waiting does nothing at all.

Exam-trap caption mode adds: *This is why replacing a semaphore by a condition variable changes a program rather than renaming it. The counting behaviour has to be rebuilt out of a shared variable and a test.*

**1:51–2:00** — The last row is legal use. A semaphore may be used anywhere. A condition variable may only be waited on and signalled while holding the monitor lock, because the test that justifies the wait has to be protected by that same lock.

> Caption: And a condition variable may only be used while holding the lock. A semaphore has no such rule.

Exam-trap caption mode adds: *Two threads may signal the same condition variable from two different monitors only if they hold the same lock. A condition variable is bound to one lock, and a lock may have many condition variables.*

## Scene 5. Hoare against Mesa

*2:00 – 2:30 · objective: Say who runs after a signal under each semantics, what each guarantees about the predicate on return, and what each costs in context switches.*

**2:00–2:07** — Both designs are monitors and both give mutual exclusion. They differ in one scheduling rule. Under Hoare semantics the signaller hands the lock and the processor to the waiter, which runs immediately.

> Caption: Hoare semantics: the signaller hands over the lock and the processor to the waiter.

Exam-trap caption mode adds: *Under Hoare the signaller is blocked while the waiter runs, so a signal is not a cheap operation. It costs two context switches every time it finds a waiter.*

**2:07–2:14** — Because the waiter runs before anybody else can enter, the condition it was waiting for is still true when it resumes. Nothing can have changed the data in between. That is why Hoare code may test with an if.

> Caption: Under Hoare the condition is still true when the waiter returns, so an if is enough.

Exam-trap caption mode adds: *The if is safe under Hoare only because of the handover. Copy an if into Java and you have copied a Hoare program into a Mesa system, which is the bug the next scene measures.*

**2:14–2:21** — Mesa takes the other view. The signaller keeps the lock and keeps running. The waiter becomes runnable and competes for the lock like everybody else. Another thread may enter the monitor first.

> Caption: Mesa semantics: the signaller keeps the lock, and the waiter is only made runnable.

Exam-trap caption mode adds: *A signal under Mesa is a hint that something changed, not a promise about what. Java documents it that way and permits spurious wakeups, which are wake-ups with no signal at all.*

**2:21–2:30** — So under Mesa the predicate may be false when the waiter resumes, and the wait must sit in a loop. The price of that is nothing in switches: Hoare adds two per signal that finds a waiter, Mesa adds none. For four signals that is eight against zero.

> Caption: So under Mesa the predicate may be false on return, and the loop is required. The cost is two switches against none.

Exam-trap caption mode adds: *Read the question’s own words. Immediate transfer or urgent wait means Hoare; keeps the lock, notify, notifyAll or spurious wakeup means Mesa. If the question says nothing, the systems it names decide.*

## Scene 6. The while rule, computed

*2:30 – 3:00 · objective: Read the exhaustive search that takes an item from an empty buffer under `if` and never under `while`, and follow the shortest failing interleaving.*

**2:30–2:37** — Here is the smallest buffer that can show the difference. One producer, two consumers and a single slot. remove is written twice, once with a while loop and once with an if.

> Caption: One producer, two consumers, one slot. remove is written twice, with while and with if.

Exam-trap caption mode adds: *The versions are identical until a wait actually returns. That is why the bug survives testing on a lightly loaded machine: it needs a specific interleaving to appear.*

**2:37–2:44** — The page enumerates every reachable state of that program under Mesa semantics. The while version reaches seventy-eight states and takes from an empty buffer in none of them.

> Caption: Every interleaving of every statement is enumerated, so the answer is a count and not an opinion.

Exam-trap caption mode adds: *A simulation of one or two runs proves nothing. The claim here is over all interleavings, and that is the only kind of claim that settles a concurrency question.*

**2:44–2:51** — The if version reaches ninety-two states, and six of them take an item from an empty buffer. The count goes to minus one. That is not a crash; it is silent corruption of the invariant.

> Caption: The if version reaches ninety-two states, and six of them take an item that is not there.

Exam-trap caption mode adds: *A buffer counter going negative is the signature of this bug in the wild. It is also how it is caught in tests, because the invariant count is at least zero is cheap to assert.*

**2:51–3:00** — Here is the shortest way it happens. C1 waits. The producer adds an item and signals, which wakes C1. C2 enters before C1 does, takes the item and leaves. C1 now resumes inside its if and removes an item that is not there.

> Caption: C1 sleeps, the producer wakes it, C2 enters first and takes the item, and C1 resumes inside its if.

Exam-trap caption mode adds: *The fix is not to give the waiter priority. The fix is to re-test, which is what the while loop does, and which costs one comparison per wake-up.*

## Scene 7. When signal cannot reach the right waiter

*3:00 – 3:30 · objective: See a state in which a thread sleeps with a true condition under signal and not under broadcast, and state when each wake rule is the correct one.*

**3:00–3:07** — Now a different failure. A pool of free space holds ten units. One thread needs sixteen, another needs six, and both are asleep on the same condition variable. Ten units arrive and one signal is sent.

> Caption: A pool of ten free units, two waiters needing sixteen and six, and one signal.

Exam-trap caption mode adds: *The unit counts are not decoration. Six is satisfied by ten and sixteen is not, so the two waiters are not interchangeable, and that is what breaks the signal.*

**3:07–3:14** — The signal wakes the thread needing sixteen. It finds ten units, which is fewer than sixteen, so it goes back to sleep. Its wake-up has been used up and is not passed on to anybody else.

> Caption: The signal wakes the thread needing sixteen, which re-waits, and the wake-up is spent.

Exam-trap caption mode adds: *Re-waiting does not re-signal. A program that expects the wake-up to travel down the queue is relying on a behaviour no monitor provides.*

**3:14–3:21** — Now look at the other waiter. Ten units are free, six are needed, so its condition is already true, and it is still asleep. No thread remains that could signal it. The program is stuck with the resource available.

> Caption: The thread needing six is asleep although ten units are free. Nothing can ever wake it.

Exam-trap caption mode adds: *This is a deadlock that looks like starvation and is neither. It is a lost wake-up, and the giveaway in an exam question is a waiter whose condition is visibly satisfied while it waits.*

**3:21–3:28** — With broadcast, both waiters wake. The one needing sixteen re-waits, correctly. The one needing six takes its six and finishes. The search finds no stalling state at all.

> Caption: Broadcast wakes both, the thread needing six takes six, and the run finishes.

Exam-trap caption mode adds: *Broadcast is not the wasteful option that should be avoided. It is the correct option whenever the mapping from condition variable to predicate is not one to one.*

**3:28–3:30** — So the rule is short. Use signal when every waiter on that condition variable would be satisfied by the same change. Use broadcast when they would not, or when you are not sure.

> Caption: Signal is right when every waiter on that variable can be satisfied by the same change.

Exam-trap caption mode adds: *One condition variable per predicate is the design that makes signal correct. Sharing a condition variable between two predicates is what forces broadcast.*

## Scene 8. The monitor built from semaphores

*3:30 – 4:00 · objective: Read the mutex/next/x_sem construction, and decide all four candidate answers by running them rather than by recognising them.*

**3:30–3:37** — A Hoare monitor is not a primitive. It can be built from semaphores, and the construction uses three of them plus two counters. mutex guards the body, x_sem parks the waiter, next parks the signaller.

> Caption: A Hoare monitor can be built from three semaphores and two counters.

Exam-trap caption mode adds: *The three semaphores have different jobs and are not interchangeable. mutex is a lock, x_sem carries a wake-up to a waiter, and next carries control back to the signaller.*

**3:37–3:44** — A wait increments the waiter count, releases the monitor lock, and then parks on x_sem. So a signal has to release x_sem, or the waiter is never coming back. That is the shape the answer takes.

> Caption: wait parks on x_sem after releasing the lock. signal must release that same semaphore.

Exam-trap caption mode adds: *The two blanks are in opposite directions on the same semaphore: P on the waiter side, V on the signaller side. An answer that names two different semaphores has the roles confused.*

**3:44–3:51** — The page runs all four candidate answers against the same scenario. Three of them stall: in each case one thread is left blocked with nothing that could release it. Only the fourth finishes.

> Caption: All four candidate answers are executed. Three stall and one finishes.

Exam-trap caption mode adds: *This is the general method for this family of questions: find which thread is supposed to be woken, and check that the code that wakes it names the same object it is parked on.*

**3:51–4:00** — The answer is the pair that names x_sem in both places, P where the waiter parks and V where the signaller releases it. That is option D, and it is the only one the search finds finishing.

> Caption: So the answer is the pair that names x_sem in both blanks: P on the waiter side, V on the signaller side.

Exam-trap caption mode adds: *Do not choose by recognising the textbook figure. The figure is often drawn with different letter names, and the question may permute them. Follow which thread parks where.*

## Scene 9. The bounded buffer as a monitor

*4:00 – 4:30 · objective: Write the two-condition-variable buffer, state its four counts, and map its three names onto Java, POSIX, C# and Go.*

**4:00–4:08** — The bounded buffer as a monitor needs two condition variables. notFull for producers waiting for space, and notEmpty for consumers waiting for an item. Two conditions, two queues.

> Caption: The monitor buffer needs two condition variables, one for each condition.

Exam-trap caption mode adds: *Do not carry the semaphore names across. empty and full counted permits; notEmpty and notFull hold waiters. The same three words in the two versions mean different objects.*

**4:08–4:15** — Both waits sit in while loops, for the reason the previous scenes measured. Each signal comes after the change that makes it true, and while the lock is still held, so no wake-up can be lost.

> Caption: Both waits sit in while loops, and the signal comes after the change, inside the monitor.

Exam-trap caption mode adds: *Signalling before the change is the classic ordering bug: the woken thread re-tests, finds the old value, and goes back to sleep, and the wake-up is gone.*

**4:15–4:23** — The counting questions have short answers. At most N items are in the buffer. At most one producer sleeps when the buffer is full, so at most P producers in total. At most C consumers. And at most P plus C threads are asleep across the two queues.

> Caption: The four counts: at most N items, at most P producers asleep, at most C consumers asleep, and P plus C in total.

Exam-trap caption mode adds: *A question asking how many threads can be blocked at once usually wants P plus C, and a question asking how many can be inside the monitor wants exactly one.*

**4:23–4:30** — The names change and the structure does not. Java uses a synchronized method with wait and notifyAll on the same object. POSIX uses a mutex with a condition variable. C# and Go follow the same shape.

> Caption: The same three names in Java, POSIX threads, C# and Go: the lock, and the condition.

Exam-trap caption mode adds: *Java notify wakes one arbitrary waiter, and the documentation says the choice is at the implementation’s discretion. Code that depends on which one is woken is relying on nothing.*

## Scene 10. The reading procedure

*4:30 – 5:00 · objective: Leave with a four-step procedure and the four traps, plus the words in a question that settle Hoare against Mesa.*

**4:30–4:38** — The procedure has four steps. Name the lock and the queues. Read who runs after the signal, because that decides Hoare against Mesa and everything that follows. Check the predicate. Count the waiters and the wake-ups.

> Caption: Four steps: name the lock and the queues, then read who runs after the signal.

Exam-trap caption mode adds: *Skipping step two is what produces an answer that is right about the mechanism and wrong about the guarantee, which is the most common way to lose a mark here.*

**4:38–4:45** — Step three is to check the predicate rather than the name. The shared variable is what gets tested, under the lock, in a loop. The condition variable is only the name you sleep on.

> Caption: Check the predicate, not the name. A condition variable has no value to test.

Exam-trap caption mode adds: *A while loop whose condition is always true is an unconditional wait in disguise, and it is correct only when the event is guaranteed and cannot have already happened.*

**4:45–4:53** — The four traps, one line each. signal is not V, because there is no value to remember. wait is not P, because it always blocks. A wake-up is not a promise, because Mesa wakes you and then you re-test. And broadcast is not waste, because it is the safe default.

> Caption: Four traps: signal is not V, wait is not P, a wake-up is not a promise, broadcast is not waste.

Exam-trap caption mode adds: *The most attractive wrong option in these questions is the one that treats a signal as a stored permission. It reads well and it contradicts the one fact that defines the construct.*

**4:53–5:00** — The sentence worth keeping: a monitor gives exclusion for free, a condition variable gives waiting, and every wait is re-tested in a loop, because under Mesa a signal is a hint and not a guarantee.

> Caption: A monitor gives exclusion for free; a condition variable gives waiting; every wait is re-tested in a loop.

Exam-trap caption mode adds: *Nothing in this topic is about performance, except the context-switch table. Everything else is about which of two promises a design makes.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
