/* ==========================================================================
   monitors-and-condition-variables — THE timeline.
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
      id: 'why', n: 1,
      title: 'Why one lock is not enough',
      start: 0, end: 30,
      objective: 'See that mutual exclusion alone deadlocks a thread that needs a condition another thread must make true, and that the repair is to step out of the monitor and sleep on a named queue.'
    },
    {
      id: 'anatomy', n: 2,
      title: 'What a monitor is made of',
      start: 30, end: 60,
      objective: 'Name the four parts of a monitor — private data, entry procedures, one implicit lock, condition variables — and say what a condition variable holds and what it does not.'
    },
    {
      id: 'wait', n: 3,
      title: 'wait is three steps in one',
      start: 60, end: 90,
      objective: 'State the three indivisible steps of wait and explain why separating the lock release from the sleep loses a signal forever.'
    },
    {
      id: 'memory', n: 4,
      title: 'signal has no memory',
      start: 90, end: 120,
      objective: 'Separate P from wait and V from signal on six rows, and state the one row that decides most questions: a signal with no waiter is lost.'
    },
    {
      id: 'hoare', n: 5,
      title: 'Hoare against Mesa',
      start: 120, end: 150,
      objective: 'Say who runs after a signal under each semantics, what each guarantees about the predicate on return, and what each costs in context switches.'
    },
    {
      id: 'while', n: 6,
      title: 'The while rule, computed',
      start: 150, end: 180,
      objective: 'Read the exhaustive search that takes an item from an empty buffer under `if` and never under `while`, and follow the shortest failing interleaving.'
    },
    {
      id: 'broadcast', n: 7,
      title: 'When signal cannot reach the right waiter',
      start: 180, end: 210,
      objective: 'See a state in which a thread sleeps with a true condition under signal and not under broadcast, and state when each wake rule is the correct one.'
    },
    {
      id: 'semaphores', n: 8,
      title: 'The monitor built from semaphores',
      start: 210, end: 240,
      objective: 'Read the mutex/next/x_sem construction, and decide all four candidate answers by running them rather than by recognising them.'
    },
    {
      id: 'buffer', n: 9,
      title: 'The bounded buffer as a monitor',
      start: 240, end: 270,
      objective: 'Write the two-condition-variable buffer, state its four counts, and map its three names onto Java, POSIX, C# and Go.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The reading procedure',
      start: 270, end: 300,
      objective: 'Leave with a four-step procedure and the four traps, plus the words in a question that settle Hoare against Mesa.'
    }
  ],

  events: [
    /* ---------------- scene 1: why ---------------- */
    {
      id: 'w1', scene: 'why', start: 0, end: 6,
      caption: 'A monitor lets one thread inside at a time. That is mutual exclusion, and it comes free.',
      narration: 'A monitor lets exactly one thread execute inside it at a time. That part is automatic. The compiler puts the lock at the start and the end of every procedure.',
      detail: 'Nothing in the source code asks for the lock. The language inserts it. So the interesting question about monitors is never how they achieve mutual exclusion; it is what happens when a thread inside finds that the thing it needs is not yet true.',
      keyword: 'one thread',
      trap: 'A monitor is not a mutex with extra syntax. The lock is only half of it; without condition variables a monitor cannot express waiting at all.'
    },
    {
      id: 'w2', scene: 'why', start: 6, end: 12,
      caption: 'T1 is inside and needs the buffer to be non-empty, but only T2 can put an item in it.',
      narration: 'Here T1 is inside the monitor. It wants to remove an item, and the buffer is empty. The only thread that can make the buffer non-empty is T2, which is outside.',
      detail: 'This is the ordinary shape of a producer and a consumer. The condition T1 needs is a fact about the shared data, and the shared data can only be changed by code that runs inside the same monitor.',
      keyword: 'only T2',
      trap: 'This is not a rare case. Every bounded buffer, every readers-writers monitor and every scheduling decision has a thread waiting for a condition another thread must establish.'
    },
    {
      id: 'w3', scene: 'why', start: 12, end: 18,
      caption: 'Busy-waiting inside the monitor spins forever, because the spinner is holding the door shut.',
      narration: 'T1 could spin, testing the buffer again and again. It would spin forever. T2 cannot enter to add an item, because T1 holds the lock. The thread waiting for a change is preventing the change.',
      detail: 'This is the one place where a monitor is stricter than a semaphore. With a semaphore you can wait without holding anything. Inside a monitor you already hold the lock, so any waiting you do while holding it blocks everyone who could help you.',
      keyword: 'holding the door shut',
      trap: 'A question that shows a loop testing a shared variable inside a monitor is showing a defect, not a solution. Mutual exclusion guarantees the test can never change while the tester holds the lock.'
    },
    {
      id: 'w4', scene: 'why', start: 18, end: 24,
      caption: 'So the thread steps out: release the lock, join a named queue, and sleep.',
      narration: 'The repair is three steps in one action. Release the lock. Join a queue named after the condition you are waiting for. Sleep. Somebody who makes the condition true will take you off that queue.',
      detail: 'Notice that the queue is named after the condition, not after the data. notEmpty and notFull are the two names a bounded buffer uses. A thread sleeps on the name of the thing it is waiting for.',
      keyword: 'release, join, sleep',
      trap: 'The queue is not a count. Three threads asleep on notEmpty is three entries in a list, not the number three stored anywhere.'
    },
    {
      id: 'w5', scene: 'why', start: 24, end: 30,
      caption: 'That queue is a condition variable. The lock solves exclusion; the queue solves waiting.',
      narration: 'That queue is a condition variable. The lock and the condition variable solve two different problems, and a monitor is the two of them together.',
      detail: 'Keeping the two jobs separate is what makes the rest of the topic readable. Every fact about monitors is either a fact about the lock or a fact about a condition variable, and the two lists of facts are short.',
      keyword: 'two different jobs',
      trap: 'Do not read condition variable as a kind of semaphore. The next four scenes are the differences, and they are all consequences of one fact: a condition variable has no value.'
    },

    /* ---------------- scene 2: anatomy ---------------- */
    {
      id: 'a1', scene: 'anatomy', start: 30, end: 37,
      caption: 'Part one is private data. It is reachable only through the monitor\u2019s own procedures.',
      narration: 'A monitor has private data. The counter, the buffer, the flags: all of it is reachable only through the procedures the monitor exports.',
      detail: 'This is the encapsulation half of the design, and it is why the lock is safe to insert automatically. If any code anywhere could touch the data, an automatic lock at procedure entry would protect nothing.',
      keyword: 'private data',
      trap: 'Data declared inside a monitor is not protected by being declared; it is protected by being unreachable from outside. A pointer handed out of a monitor undoes the whole guarantee.'
    },
    {
      id: 'a2', scene: 'anatomy', start: 37, end: 44,
      caption: 'Part two is the entry procedures. Only one thread may be inside any of them at once.',
      narration: 'Part two is the set of procedures. insert and remove, in the buffer case. Only one thread may be inside any of them at a time, and that includes two different procedures of the same monitor.',
      detail: 'The exclusion is per monitor object, not per procedure. A thread inside insert blocks a thread that wants remove. That is exactly what makes the shared counter safe, and exactly why a thread must not wait while holding the lock.',
      keyword: 'any of them',
      trap: 'The lock is per monitor instance. Two monitors means two independent locks, so a thread may hold both, and a question about deadlock may well be about that.'
    },
    {
      id: 'a3', scene: 'anatomy', start: 44, end: 51,
      caption: 'Part three is the implicit lock: taken on entry, released on exit, and released again around every wait.',
      narration: 'Part three is the lock itself. It is taken on entry, released on exit, and it is also released and re-acquired around every wait. You never write those three calls.',
      detail: 'The re-acquisition is the part that surprises people. A thread returning from wait holds the lock again, because the code after the wait runs inside the monitor and expects to be protected.',
      keyword: 'implicit lock',
      trap: 'wait releases the lock and re-acquires it. signal does not release it under Mesa. Mixing those two up is the most common single error in this topic.'
    },
    {
      id: 'a4', scene: 'anatomy', start: 51, end: 60,
      caption: 'Part four is the condition variables: one queue each, no value, and three operations.',
      narration: 'Part four is the condition variables. Each one is a queue of waiting threads and nothing else. wait always blocks and releases the lock; signal wakes one waiter if there is one; broadcast wakes all of them.',
      detail: 'A monitor may have any number of condition variables. A bounded buffer needs two, because it has two different conditions. One condition variable can be shared between two predicates only if every wake is a broadcast.',
      keyword: 'one queue each',
      trap: 'A condition variable cannot be tested. Writing if (cv) is meaningless, because there is nothing to read. What you test is the shared data, and what you wait on is the name.'
    },

    /* ---------------- scene 3: wait ---------------- */
    {
      id: 'wt1', scene: 'wait', start: 60, end: 67,
      caption: 'wait does three things as one indivisible action: release the lock, join the queue, sleep.',
      narration: 'wait does three things, and it does them as one action. It releases the monitor lock. It puts the calling thread on the queue of that condition variable. It sleeps.',
      detail: 'The indivisibility is a statement about what other threads can observe. No other thread can ever see the state in which the lock has been released and the waiter is not yet on the queue.',
      keyword: 'indivisible',
      trap: 'If a question describes wait as two separate operations, the answer it expects is the lost-wakeup one. Atomicity is not a performance detail here; it is the correctness condition.'
    },
    {
      id: 'wt2', scene: 'wait', start: 67, end: 74,
      caption: 'On waking it re-acquires the lock before returning, so the code after the wait is protected.',
      narration: 'When the thread wakes, it is not running yet. It must acquire the lock again, and only then does wait return. Everything after the call runs inside the monitor, protected as usual.',
      detail: 'This is why a waiter can be overtaken. Between the signal and the moment the waiter holds the lock again, another thread may enter, change the data, and leave. The waiter resumes with the lock held but with no promise about the data.',
      keyword: 're-acquires the lock',
      trap: 'A woken thread is runnable, not running, and it does not hold the lock. Any claim that a signal transfers control to the waiter is a claim about Hoare semantics, not about monitors in general.'
    },
    {
      id: 'wt3', scene: 'wait', start: 74, end: 81,
      caption: 'If the release and the sleep could be separated, a signal arriving in the gap would be lost.',
      narration: 'Here is what the atomicity buys. Suppose thread A releases the lock and is not yet asleep. Thread B takes the lock, signals the condition, and leaves. A now goes to sleep. The signal has already happened and A missed it.',
      detail: 'Nobody will signal again, because the condition is now true and everyone believes A has been told. A sleeps forever. This is called a lost wakeup, and it is the failure that atomicity of wait exists to prevent.',
      keyword: 'lost',
      trap: 'The same failure appears from the outside as a signal sent before the wait. That is why the condition must be tested under the lock immediately before waiting: the test and the wait together cannot be interleaved with a signal.'
    },
    {
      id: 'wt4', scene: 'wait', start: 81, end: 90,
      caption: 'One signal moves exactly one thread from the queue to runnable. It does not hand it the lock.',
      narration: 'After three waits and one signal, the condition variable holds two threads and one is runnable. That one still does not hold the lock. The signal moved a queue entry; it did not transfer ownership of anything.',
      detail: 'Counting questions in this topic are almost always questions about these two queues: how many are asleep on the condition variable, and how many are waiting for the lock. They are different queues and they are counted separately.',
      keyword: 'one thread',
      trap: 'Calling wait without holding the lock is an error, not a harmless no-op. In Java it is a thrown IllegalMonitorStateException; in C and C++ it is undefined behaviour.'
    },

    /* ---------------- scene 4: no memory ---------------- */
    {
      id: 'm1', scene: 'memory', start: 90, end: 97,
      caption: 'A semaphore has a value. A condition variable has only a queue.',
      narration: 'The first row of the table is the whole story. A semaphore has an integer. A condition variable has a queue and no integer at all.',
      detail: 'Everything else in the table follows from that one row. A value can be incremented and remembered; a queue can only be appended to and removed from. Nothing is remembered about a wake that nobody received.',
      keyword: 'no integer',
      trap: 'Both have operations called wait and signal. The names are shared and the semantics are not. A question that uses the words without saying which construct it means is a question to read twice.'
    },
    {
      id: 'm2', scene: 'memory', start: 97, end: 104,
      caption: 'P blocks only when the value is zero. wait always blocks, whatever the state.',
      narration: 'P takes a permit and blocks only when there is none. wait always blocks. There is no state of the world in which a condition variable lets the caller continue.',
      detail: 'This is why the test comes before the wait and not inside it. The decision about whether to wait belongs to the programmer, expressed as a loop over the shared data. The condition variable itself makes no decision.',
      keyword: 'always blocks',
      trap: 'An unconditional wait with no test around it is correct only if the event is guaranteed to happen exactly once and cannot have happened already. In every other case the test is mandatory.'
    },
    {
      id: 'm3', scene: 'memory', start: 104, end: 111,
      caption: 'V adds one to the value when nobody waits. signal with nobody waiting does nothing at all.',
      narration: 'Now the decisive row. V with no waiter adds one to the value, and a later P spends it. signal with no waiter does nothing, and a later wait still blocks.',
      detail: 'The semaphore\u2019s V is a deposit. The condition variable\u2019s signal is a knock on a door that may be empty. A deposit is remembered; a knock is not.',
      keyword: 'does nothing',
      trap: 'This is why replacing a semaphore by a condition variable changes a program rather than renaming it. The counting behaviour has to be rebuilt out of a shared variable and a test.'
    },
    {
      id: 'm4', scene: 'memory', start: 111, end: 120,
      caption: 'And a condition variable may only be used while holding the lock. A semaphore has no such rule.',
      narration: 'The last row is legal use. A semaphore may be used anywhere. A condition variable may only be waited on and signalled while holding the monitor lock, because the test that justifies the wait has to be protected by that same lock.',
      detail: 'The rule exists so that the test and the wait cannot be separated by another thread. Without it, the lost wakeup of the previous scene becomes possible again.',
      keyword: 'while holding the lock',
      trap: 'Two threads may signal the same condition variable from two different monitors only if they hold the same lock. A condition variable is bound to one lock, and a lock may have many condition variables.'
    },

    /* ---------------- scene 5: hoare against mesa ---------------- */
    {
      id: 'h1', scene: 'hoare', start: 120, end: 127,
      caption: 'Hoare semantics: the signaller hands over the lock and the processor to the waiter.',
      narration: 'Both designs are monitors and both give mutual exclusion. They differ in one scheduling rule. Under Hoare semantics the signaller hands the lock and the processor to the waiter, which runs immediately.',
      detail: 'This is Hoare\u2019s original 1974 definition, and it is what most textbooks draw. The signaller is parked on a second queue, usually called next, and resumes when the waiter leaves or waits again.',
      keyword: 'hands over',
      trap: 'Under Hoare the signaller is blocked while the waiter runs, so a signal is not a cheap operation. It costs two context switches every time it finds a waiter.'
    },
    {
      id: 'h2', scene: 'hoare', start: 127, end: 134,
      caption: 'Under Hoare the condition is still true when the waiter returns, so an if is enough.',
      narration: 'Because the waiter runs before anybody else can enter, the condition it was waiting for is still true when it resumes. Nothing can have changed the data in between. That is why Hoare code may test with an if.',
      detail: 'The guarantee is stronger than the monitor invariant: the waiter may assume the predicate it waited on. Hoare stated it exactly that way, and the construction in scene eight is the implementation of it.',
      keyword: 'still true',
      trap: 'The if is safe under Hoare only because of the handover. Copy an if into Java and you have copied a Hoare program into a Mesa system, which is the bug the next scene measures.'
    },
    {
      id: 'h3', scene: 'hoare', start: 134, end: 141,
      caption: 'Mesa semantics: the signaller keeps the lock, and the waiter is only made runnable.',
      narration: 'Mesa takes the other view. The signaller keeps the lock and keeps running. The waiter becomes runnable and competes for the lock like everybody else. Another thread may enter the monitor first.',
      detail: 'Mesa is the Xerox Mesa system, described by Lampson and Redell in 1980, and it is what every mainstream system does now. Java, POSIX condition variables, C# monitors and Go condition variables are all Mesa.',
      keyword: 'keeps the lock',
      trap: 'A signal under Mesa is a hint that something changed, not a promise about what. Java documents it that way and permits spurious wakeups, which are wake-ups with no signal at all.'
    },
    {
      id: 'h4', scene: 'hoare', start: 141, end: 150,
      caption: 'So under Mesa the predicate may be false on return, and the loop is required. The cost is two switches against none.',
      narration: 'So under Mesa the predicate may be false when the waiter resumes, and the wait must sit in a loop. The price of that is nothing in switches: Hoare adds two per signal that finds a waiter, Mesa adds none. For four signals that is eight against zero.',
      detail: 'The trade is real in both directions. Hoare leaves less to chance and is easier to reason about. Mesa is cheaper and easier to implement, which is why the systems you will actually use chose it.',
      keyword: 'the loop is required',
      trap: 'Read the question\u2019s own words. Immediate transfer or urgent wait means Hoare; keeps the lock, notify, notifyAll or spurious wakeup means Mesa. If the question says nothing, the systems it names decide.'
    },

    /* ---------------- scene 6: the while rule ---------------- */
    {
      id: 'wl1', scene: 'while', start: 150, end: 157,
      caption: 'One producer, two consumers, one slot. remove is written twice, with while and with if.',
      narration: 'Here is the smallest buffer that can show the difference. One producer, two consumers and a single slot. remove is written twice, once with a while loop and once with an if.',
      detail: 'The two versions differ in one place only: what happens after the wait returns. The while version goes back to the test. The if version goes straight on to the removal.',
      keyword: 'written twice',
      trap: 'The versions are identical until a wait actually returns. That is why the bug survives testing on a lightly loaded machine: it needs a specific interleaving to appear.'
    },
    {
      id: 'wl2', scene: 'while', start: 157, end: 164,
      caption: 'Every interleaving of every statement is enumerated, so the answer is a count and not an opinion.',
      narration: 'The page enumerates every reachable state of that program under Mesa semantics. The while version reaches seventy-eight states and takes from an empty buffer in none of them.',
      detail: 'The search is over states, not over runs, so it is finite and it is complete: if a bad interleaving exists, one of its states is in the set. The count is printed on the canvas and re-checked by the page itself.',
      keyword: 'every reachable state',
      trap: 'A simulation of one or two runs proves nothing. The claim here is over all interleavings, and that is the only kind of claim that settles a concurrency question.'
    },
    {
      id: 'wl3', scene: 'while', start: 164, end: 171,
      caption: 'The if version reaches ninety-two states, and six of them take an item that is not there.',
      narration: 'The if version reaches ninety-two states, and six of them take an item from an empty buffer. The count goes to minus one. That is not a crash; it is silent corruption of the invariant.',
      detail: 'Six states out of ninety-two sounds rare and is not. Each is reachable by a legal interleaving, so on a loaded machine with an unlucky schedule it happens. The search prints the shortest one.',
      keyword: 'minus one',
      trap: 'A buffer counter going negative is the signature of this bug in the wild. It is also how it is caught in tests, because the invariant count is at least zero is cheap to assert.'
    },
    {
      id: 'wl4', scene: 'while', start: 171, end: 180,
      caption: 'C1 sleeps, the producer wakes it, C2 enters first and takes the item, and C1 resumes inside its if.',
      narration: 'Here is the shortest way it happens. C1 waits. The producer adds an item and signals, which wakes C1. C2 enters before C1 does, takes the item and leaves. C1 now resumes inside its if and removes an item that is not there.',
      detail: 'Every step is legal. C1 was woken, not scheduled. C2 had as much right to the lock as C1 did. And the if had already been evaluated before C1 slept, so nothing re-tests the buffer.',
      keyword: 'before C1 does',
      trap: 'The fix is not to give the waiter priority. The fix is to re-test, which is what the while loop does, and which costs one comparison per wake-up.'
    },

    /* ---------------- scene 7: signal against broadcast ---------------- */
    {
      id: 'b1', scene: 'broadcast', start: 180, end: 187,
      caption: 'A pool of ten free units, two waiters needing sixteen and six, and one signal.',
      narration: 'Now a different failure. A pool of free space holds ten units. One thread needs sixteen, another needs six, and both are asleep on the same condition variable. Ten units arrive and one signal is sent.',
      detail: 'This is the storage allocator from the Mesa paper, reduced to three threads. The point of the example there was exactly this: a single condition variable can serve waiters whose predicates differ, and a single signal cannot serve both.',
      keyword: 'one signal',
      trap: 'The unit counts are not decoration. Six is satisfied by ten and sixteen is not, so the two waiters are not interchangeable, and that is what breaks the signal.'
    },
    {
      id: 'b2', scene: 'broadcast', start: 187, end: 194,
      caption: 'The signal wakes the thread needing sixteen, which re-waits, and the wake-up is spent.',
      narration: 'The signal wakes the thread needing sixteen. It finds ten units, which is fewer than sixteen, so it goes back to sleep. Its wake-up has been used up and is not passed on to anybody else.',
      detail: 'Under Mesa a woken thread that finds its predicate false simply waits again. Nothing records that a wake-up was consumed. This is the same mechanism as the previous scene, seen from the other side.',
      keyword: 'spent',
      trap: 'Re-waiting does not re-signal. A program that expects the wake-up to travel down the queue is relying on a behaviour no monitor provides.'
    },
    {
      id: 'b3', scene: 'broadcast', start: 194, end: 201,
      caption: 'The thread needing six is asleep although ten units are free. Nothing can ever wake it.',
      narration: 'Now look at the other waiter. Ten units are free, six are needed, so its condition is already true, and it is still asleep. No thread remains that could signal it. The program is stuck with the resource available.',
      detail: 'The page searches all reachable states and finds exactly one stalling state under signal: a terminal state in which a thread is asleep although its own condition is false. It finds none under broadcast.',
      keyword: 'already true',
      trap: 'This is a deadlock that looks like starvation and is neither. It is a lost wake-up, and the giveaway in an exam question is a waiter whose condition is visibly satisfied while it waits.'
    },
    {
      id: 'b4', scene: 'broadcast', start: 201, end: 208,
      caption: 'Broadcast wakes both, the thread needing six takes six, and the run finishes.',
      narration: 'With broadcast, both waiters wake. The one needing sixteen re-waits, correctly. The one needing six takes its six and finishes. The search finds no stalling state at all.',
      detail: 'Broadcast is always correct when the wait is in a while loop, because a thread whose condition is false just goes back to sleep. It costs extra context switches, and it is the safe default when one condition variable serves more than one predicate.',
      keyword: 'no stalling state',
      trap: 'Broadcast is not the wasteful option that should be avoided. It is the correct option whenever the mapping from condition variable to predicate is not one to one.'
    },
    {
      id: 'b5', scene: 'broadcast', start: 208, end: 210,
      caption: 'Signal is right when every waiter on that variable can be satisfied by the same change.',
      narration: 'So the rule is short. Use signal when every waiter on that condition variable would be satisfied by the same change. Use broadcast when they would not, or when you are not sure.',
      detail: 'The bounded buffer satisfies the rule for signal, because notEmpty has only consumers on it and every consumer is satisfied by one new item. The allocator breaks it, because two waiters on one variable need different amounts.',
      keyword: 'the same change',
      trap: 'One condition variable per predicate is the design that makes signal correct. Sharing a condition variable between two predicates is what forces broadcast.'
    },

    /* ---------------- scene 8: semaphores ---------------- */
    {
      id: 's1', scene: 'semaphores', start: 210, end: 217,
      caption: 'A Hoare monitor can be built from three semaphores and two counters.',
      narration: 'A Hoare monitor is not a primitive. It can be built from semaphores, and the construction uses three of them plus two counters. mutex guards the body, x_sem parks the waiter, next parks the signaller.',
      detail: 'This is the construction in the operating systems textbooks, and it is the one a 2006 GATE question asks you to complete. The two counters exist so that the code knows whether anybody is parked on each semaphore.',
      keyword: 'three semaphores',
      trap: 'The three semaphores have different jobs and are not interchangeable. mutex is a lock, x_sem carries a wake-up to a waiter, and next carries control back to the signaller.'
    },
    {
      id: 's2', scene: 'semaphores', start: 217, end: 224,
      caption: 'wait parks on x_sem after releasing the lock. signal must release that same semaphore.',
      narration: 'A wait increments the waiter count, releases the monitor lock, and then parks on x_sem. So a signal has to release x_sem, or the waiter is never coming back. That is the shape the answer takes.',
      detail: 'The signaller also has to get out of the way, because under Hoare the waiter runs next. It does that by incrementing next_count and parking on next, and the waiter releases it when it leaves the monitor.',
      keyword: 'the same semaphore',
      trap: 'The two blanks are in opposite directions on the same semaphore: P on the waiter side, V on the signaller side. An answer that names two different semaphores has the roles confused.'
    },
    {
      id: 's3', scene: 'semaphores', start: 224, end: 231,
      caption: 'All four candidate answers are executed. Three stall and one finishes.',
      narration: 'The page runs all four candidate answers against the same scenario. Three of them stall: in each case one thread is left blocked with nothing that could release it. Only the fourth finishes.',
      detail: 'Option A releases next instead of x_sem, so the waiter sleeps forever. Option B parks the signaller on x_sem before releasing it. Option C parks the waiter on next, where the signaller is also going, and neither frees the other.',
      keyword: 'three stall',
      trap: 'This is the general method for this family of questions: find which thread is supposed to be woken, and check that the code that wakes it names the same object it is parked on.'
    },
    {
      id: 's4', scene: 'semaphores', start: 231, end: 240,
      caption: 'So the answer is the pair that names x_sem in both blanks: P on the waiter side, V on the signaller side.',
      narration: 'The answer is the pair that names x_sem in both places, P where the waiter parks and V where the signaller releases it. That is option D, and it is the only one the search finds finishing.',
      detail: 'Reading the construction as a whole also tells you why. The waiter must be released before the signaller blocks, or the two of them wait for each other. Releasing x_sem first, then parking on next, is exactly that order.',
      keyword: 'both blanks',
      trap: 'Do not choose by recognising the textbook figure. The figure is often drawn with different letter names, and the question may permute them. Follow which thread parks where.'
    },

    /* ---------------- scene 9: the bounded buffer ---------------- */
    {
      id: 'bf1', scene: 'buffer', start: 240, end: 248,
      caption: 'The monitor buffer needs two condition variables, one for each condition.',
      narration: 'The bounded buffer as a monitor needs two condition variables. notFull for producers waiting for space, and notEmpty for consumers waiting for an item. Two conditions, two queues.',
      detail: 'Compare the semaphore version, which needs three counters: empty, full and mutex. The monitor version needs no counter for the lock, because the lock is the monitor, and no counter for the conditions, because the queues are the counters.',
      keyword: 'two condition variables',
      trap: 'Do not carry the semaphore names across. empty and full counted permits; notEmpty and notFull hold waiters. The same three words in the two versions mean different objects.'
    },
    {
      id: 'bf2', scene: 'buffer', start: 248, end: 255,
      caption: 'Both waits sit in while loops, and the signal comes after the change, inside the monitor.',
      narration: 'Both waits sit in while loops, for the reason the previous scenes measured. Each signal comes after the change that makes it true, and while the lock is still held, so no wake-up can be lost.',
      detail: 'The signal may come before or after the other housekeeping, as long as it is inside the monitor and after the data has been changed. Under Mesa the signaller keeps the lock, so the ordering does not affect correctness.',
      keyword: 'while loops',
      trap: 'Signalling before the change is the classic ordering bug: the woken thread re-tests, finds the old value, and goes back to sleep, and the wake-up is gone.'
    },
    {
      id: 'bf3', scene: 'buffer', start: 255, end: 263,
      caption: 'The four counts: at most N items, at most P producers asleep, at most C consumers asleep, and P plus C in total.',
      narration: 'The counting questions have short answers. At most N items are in the buffer. At most one producer sleeps when the buffer is full, so at most P producers in total. At most C consumers. And at most P plus C threads are asleep across the two queues.',
      detail: 'The last bound is the useful one, because it separates the two queues. A thread cannot be asleep on both, and a producer and a consumer are never asleep at the same moment when the buffer has one slot, since count equal to capacity excludes count equal to zero.',
      keyword: 'P plus C',
      trap: 'A question asking how many threads can be blocked at once usually wants P plus C, and a question asking how many can be inside the monitor wants exactly one.'
    },
    {
      id: 'bf4', scene: 'buffer', start: 263, end: 270,
      caption: 'The same three names in Java, POSIX threads, C# and Go: the lock, and the condition.',
      narration: 'The names change and the structure does not. Java uses a synchronized method with wait and notifyAll on the same object. POSIX uses a mutex with a condition variable. C# and Go follow the same shape.',
      detail: 'In Java the condition variable is the object itself, and notifyAll is the broadcast. That is why Java code that needs two conditions either uses two objects or uses java.util.concurrent locks with explicit Condition objects.',
      keyword: 'the same shape',
      trap: 'Java notify wakes one arbitrary waiter, and the documentation says the choice is at the implementation\u2019s discretion. Code that depends on which one is woken is relying on nothing.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'pr1', scene: 'procedure', start: 270, end: 278,
      caption: 'Four steps: name the lock and the queues, then read who runs after the signal.',
      narration: 'The procedure has four steps. Name the lock and the queues. Read who runs after the signal, because that decides Hoare against Mesa and everything that follows. Check the predicate. Count the waiters and the wake-ups.',
      detail: 'The second step is the one worth doing first in an exam, because the words of the question usually settle it: immediate transfer or urgent wait is Hoare; keeps the lock, notify or notifyAll is Mesa.',
      keyword: 'four steps',
      trap: 'Skipping step two is what produces an answer that is right about the mechanism and wrong about the guarantee, which is the most common way to lose a mark here.'
    },
    {
      id: 'pr2', scene: 'procedure', start: 278, end: 285,
      caption: 'Check the predicate, not the name. A condition variable has no value to test.',
      narration: 'Step three is to check the predicate rather than the name. The shared variable is what gets tested, under the lock, in a loop. The condition variable is only the name you sleep on.',
      detail: 'A question that shows if (cv) or while (cv) is showing a misunderstanding to be identified, not a program to be traced. There is nothing to read on a condition variable.',
      keyword: 'the predicate',
      trap: 'A while loop whose condition is always true is an unconditional wait in disguise, and it is correct only when the event is guaranteed and cannot have already happened.'
    },
    {
      id: 'pr3', scene: 'procedure', start: 285, end: 293,
      caption: 'Four traps: signal is not V, wait is not P, a wake-up is not a promise, broadcast is not waste.',
      narration: 'The four traps, one line each. signal is not V, because there is no value to remember. wait is not P, because it always blocks. A wake-up is not a promise, because Mesa wakes you and then you re-test. And broadcast is not waste, because it is the safe default.',
      detail: 'Each trap is a row of the table from scene four, restated as a thing to check. If an option in a question relies on any of the four, it is wrong, whatever else it says.',
      keyword: 'the four traps',
      trap: 'The most attractive wrong option in these questions is the one that treats a signal as a stored permission. It reads well and it contradicts the one fact that defines the construct.'
    },
    {
      id: 'pr4', scene: 'procedure', start: 293, end: 300,
      caption: 'A monitor gives exclusion for free; a condition variable gives waiting; every wait is re-tested in a loop.',
      narration: 'The sentence worth keeping: a monitor gives exclusion for free, a condition variable gives waiting, and every wait is re-tested in a loop, because under Mesa a signal is a hint and not a guarantee.',
      detail: 'That sentence answers the definition questions, the code questions and the counting questions, and it tells you which of the four traps an option has fallen into.',
      keyword: 'a hint and not a guarantee',
      trap: 'Nothing in this topic is about performance, except the context-switch table. Everything else is about which of two promises a design makes.'
    }
  ]
};
