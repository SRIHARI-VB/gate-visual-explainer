/* ==========================================================================
   readers-writers-and-dining-philosophers — THE timeline.
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
      id: 'two-problems',
      n: 1,
      title: 'Two different problems hide inside one word',
      start: 0, end: 30,
      objective: 'See that readers and writers contend over a shared value while philosophers contend over a ring of resources, so the two need different analyses.'
    },
    {
      id: 'rules',
      n: 2,
      title: 'The three rules, and why one mutex is wrong',
      start: 30, end: 60,
      objective: 'State the readers-writers rules and watch a single mutex satisfy safety while throwing away every bit of reader concurrency.'
    },
    {
      id: 'solution-one',
      n: 3,
      title: 'The first solution: one counter and two semaphores',
      start: 60, end: 90,
      objective: 'Trace readcount, rmutex and wsem through two readers and a writer, and see exactly which step admits the second reader.'
    },
    {
      id: 'starvation',
      n: 4,
      title: 'What that solution costs: the writer waits for ever',
      start: 90, end: 120,
      objective: 'Follow the exact semaphore values while readers keep arriving and see that a waiting writer is never preferred over a new reader.'
    },
    {
      id: 'preference',
      n: 5,
      title: 'Writer preference: a gate the first waiting writer closes',
      start: 120, end: 150,
      objective: 'Add readTry so that a waiting writer blocks new readers, and see which side starves once the gate closes.'
    },
    {
      id: 'counting',
      n: 6,
      title: 'The numbers questions ask for',
      start: 150, end: 180,
      objective: 'Collect the counts that papers ask about: how many processes can be inside, how many semaphores, and what a negative value means.'
    },
    {
      id: 'philosophers',
      n: 7,
      title: 'Dining philosophers: the ring, and the all-left deadlock',
      start: 180, end: 210,
      objective: 'Build the five-philosopher table and watch every philosopher take the left fork, which stops every one of them.'
    },
    {
      id: 'search',
      n: 8,
      title: 'What an exhaustive search proves about that deadlock',
      start: 210, end: 240,
      objective: 'Enumerate every reachable state of the naive solution and see that exactly one of them is stuck, and which one.'
    },
    {
      id: 'fixes',
      n: 9,
      title: 'Three fixes, and what each one gives up',
      start: 240, end: 270,
      objective: 'Check three standard repairs by the same exhaustive search, and name the cost each repair leaves behind.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'Distinctions, and the procedure for any question here',
      start: 270, end: 300,
      objective: 'Separate deadlock from starvation from unbounded waiting, and fix the order in which such a question should be read.'
    }
  ],

  events: [
    /* ---------------- scene 1: two problems ---------------- */
    {
      id: 's1-1', scene: 'two-problems', start: 0, end: 7.5,
      caption: 'One shared value, two kinds of user: many readers, one writer.',
      detail: 'A readers-writers problem is about a resource that many processes may read at the same time but only one may change. Reading does not disturb reading, so serialising readers wastes time; writing disturbs everything, so a writer must be alone.',
      narration: 'Two problems sit inside the word synchronisation, and they are not the same problem. The first is a shared value with two kinds of user. Many processes want to read it, and reading does not disturb reading. One process at a time wants to change it, and a change disturbs everybody.',
      keyword: 'many readers, one writer',
      trap: 'Treating every access as equally exclusive. A question that says "readers may read together" is a different problem from one that says "one process in the section".'
    },
    {
      id: 's1-2', scene: 'two-problems', start: 7.5, end: 15,
      caption: 'Three readers inside together is correct. A writer inside with them is not.',
      detail: 'On the left, three reader processes sit in the section at once, which is legal and is the whole point. A writer arriving waits outside until the last reader leaves.',
      narration: 'On the left, three readers are inside at the same time. That is not a bug, it is the requirement. A writer that arrives while they read waits outside, and it may only enter when the last reader has gone.',
      keyword: 'waits outside',
      trap: 'Counting readers inside as a mutual-exclusion violation. The rule is that a writer is alone, not that the section holds one process.'
    },
    {
      id: 's1-3', scene: 'two-problems', start: 15, end: 22.5,
      caption: 'Five philosophers, five forks, and each needs the two beside him.',
      detail: 'The second problem is a ring. Each of five philosophers needs the fork on his left and the fork on his right, and each fork lies between two philosophers, so every fork is wanted by exactly two of them.',
      narration: 'The second problem has no readers and no writers. Five philosophers sit round a table with one fork between each pair, and to eat a philosopher needs the two forks beside him. Each fork is wanted by exactly two philosophers, and that is where the trouble comes from.',
      keyword: 'one fork between each pair',
      trap: 'Assuming five forks mean five philosophers can eat. Two forks are needed per meal, so five forks support two meals at most, whatever the code does.'
    },
    {
      id: 's1-4', scene: 'two-problems', start: 22.5, end: 30,
      caption: 'One problem is about fairness. The other is about a cycle.',
      detail: 'The readers-writers problem asks who gets in and who waits, and its failure mode is starvation. The philosophers problem asks whether the system can stop completely, and its failure mode is deadlock. The two words are not interchangeable.',
      narration: 'So the questions differ. The readers and writers question is about fairness: who gets in, and who waits for ever. The philosophers question is about a cycle: can the whole table stop at once. Fairness and stopping are different failures, and the rest of the lesson keeps them apart.',
      keyword: 'fairness ... a cycle',
      trap: 'Answering "starvation" when the question asks what deadlock is, or the reverse. The two have different causes and different repairs.'
    },

    /* ---------------- scene 2: rules ---------------- */
    {
      id: 's2-1', scene: 'rules', start: 30, end: 37.5,
      caption: 'Three rules: a writer is alone, readers share, and nobody starves for ever.',
      detail: 'Rule one, mutual exclusion: no writer and no other process may be inside while a writer writes. Rule two, sharing: any number of readers may be inside together. Rule three, progress and bounded waiting: a process that asks must eventually be admitted, which is the rule most solutions break.',
      narration: 'The readers and writers problem is three rules, and the third one is the one that gets broken. First, a writer is alone. Second, readers share the section. Third, a process that asks is admitted eventually. The first two are about safety, the third is about fairness.',
      keyword: 'admitted eventually',
      trap: 'Checking only the first two rules. A solution can keep every writer alone, allow every reader, and still starve one class for ever.'
    },
    {
      id: 's2-2', scene: 'rules', start: 37.5, end: 45,
      caption: 'One mutex around the whole section: correct, and needlessly serial.',
      detail: 'The obvious code takes one semaphore before the read and releases it after. Safety holds, because only one process is ever inside. Concurrency is lost, because two readers who could have worked together now queue.',
      narration: 'The obvious attempt uses one semaphore. Wait before reading, signal after. It is safe: only one process is ever inside, so no writer can meet a reader. And it throws away the only advantage this problem has, because two readers that could have worked together now take turns.',
      keyword: 'one semaphore',
      trap: 'Marking that code correct. It satisfies mutual exclusion and fails the second rule, so it is a wrong answer to a readers-writers question.'
    },
    {
      id: 's2-3', scene: 'rules', start: 45, end: 52.5,
      caption: 'The bars on the right: three readers serialised, then three readers overlapping.',
      detail: 'The upper strip shows the single-mutex version, where reader one, two and three occupy the section one after another. The lower strip shows the same three readers overlapping in time, which is what the rules ask for.',
      narration: 'Look at the two strips. Above, one mutex: the three readers occupy the section one after another, so the total time is the sum of the three. Below, the same three readers overlap, so the total time is the longest of them. That overlap is the whole reason the problem exists.',
      keyword: 'the longest of them',
      trap: 'Thinking overlap changes the answer to "how many can be inside". With one mutex the answer is one, and with a correct solution it is all the readers.'
    },
    {
      id: 's2-4', scene: 'rules', start: 52.5, end: 60,
      caption: 'So the design question is: who decides, and when? A counter can decide.',
      detail: 'A single flag cannot express "readers may share". A count can: the first reader to arrive locks out writers, later readers only increment, and the last reader to leave unlocks. That is the shape of every solution that follows.',
      narration: 'So the design question becomes who decides, and the answer is a counter. The first reader to arrive locks the writer out. The readers after her only add one to the count. The last one to leave unlocks it. Everything that follows is that sentence with the details filled in.',
      keyword: 'a counter',
      trap: 'Guarding the count with nothing. The increment is a read, an add and a store, so two readers can both see zero and both believe they are first.'
    },

    /* ---------------- scene 3: solution one ---------------- */
    {
      id: 's3-1', scene: 'solution-one', start: 60, end: 67.5,
      caption: 'Two semaphores and one integer: rmutex protects the count, wsem protects the data.',
      detail: 'rmutex is a binary semaphore initialised to one and guards the shared counter readcount. wsem is a binary semaphore initialised to one and is the actual permission to write. readcount starts at zero and counts the readers inside.',
      narration: 'Here is the first solution. Two semaphores and one integer. rmutex guards the counter, so two readers cannot change it at the same time. wsem is the permission to write. And readcount holds how many readers are inside.',
      keyword: 'rmutex guards the counter',
      trap: 'Swapping the roles. rmutex is never held while reading; it is held only for the few instructions that touch readcount.'
    },
    {
      id: 's3-2', scene: 'solution-one', start: 67.5, end: 75,
      caption: 'Reader one: count 0 to 1, and because she is first she takes wsem.',
      detail: 'The first reader waits on rmutex, increments readcount to one, sees that she is the first, and therefore waits on wsem. wsem drops from one to zero. She signals rmutex and reads. The writer is now locked out.',
      narration: 'Reader one arrives. She waits on rmutex, adds one to the count, and because the count is now one she is the first, so she takes wsem. wsem falls from one to zero and the writers are locked out. Then she releases rmutex and reads.',
      keyword: 'the first reader takes wsem',
      trap: 'Believing every reader takes wsem. Only the reader that raises the count from zero to one does, and only the reader that lowers it from one to zero gives it back.'
    },
    {
      id: 's3-3', scene: 'solution-one', start: 75, end: 82.5,
      caption: 'Reader two: count 1 to 2, and she never touches wsem. Both read together.',
      detail: 'The second reader waits on rmutex, increments readcount to two, finds that she is not the first, and skips the wait on wsem entirely. wsem stays at zero and both readers are inside. This is the step the single-mutex version got wrong.',
      narration: 'Reader two arrives. She waits on rmutex, adds one, finds the count is two, and so she is not the first. She never touches wsem at all. wsem stays at zero and both readers read together. That skipped wait is the entire difference from the single-mutex attempt.',
      keyword: 'never touches wsem',
      trap: 'Thinking wsem counts readers. wsem is at zero while any number of readers are inside; the count is readcount, not the semaphore.'
    },
    {
      id: 's3-4', scene: 'solution-one', start: 82.5, end: 90,
      caption: 'A writer now blocks on wsem at minus one, and the last reader will wake him.',
      detail: 'A writer arriving now waits on wsem, which is zero, so the value becomes minus one and the writer is queued. When the last reader leaves, readcount reaches zero and she signals wsem, which wakes the writer. The minus one is the count of waiting writers.',
      narration: 'Now a writer arrives and waits on wsem. Its value is zero, so it becomes minus one and the writer is queued. When the last reader leaves, the count reaches zero, she signals wsem, and the writer wakes. A negative semaphore value is a count of the processes waiting on it.',
      keyword: 'minus one ... count of the processes waiting',
      trap: 'Reading a negative value as an error. Under the standard definition it means exactly that many processes are queued, and papers ask for that number.'
    },

    /* ---------------- scene 4: starvation ---------------- */
    {
      id: 's4-1', scene: 'starvation', start: 90, end: 97.5,
      caption: 'Readers keep arriving. Each new reader skips the wait on wsem.',
      detail: 'After the writer is queued, reader three and reader four arrive. Each takes rmutex, raises the count, finds the count is above one, and enters without touching wsem. wsem stays at minus one the whole time.',
      narration: 'Now watch the cost. Readers keep arriving. Reader three and reader four each take rmutex, raise the count, see that they are not first, and walk straight in. wsem does not move. It stays at minus one.',
      keyword: 'walk straight in',
      trap: 'Assuming a queued writer is served before later arrivals. Nothing in this code makes a new reader look at the writer queue.'
    },
    {
      id: 's4-2', scene: 'starvation', start: 97.5, end: 105,
      caption: 'Count four, wsem still minus one: four readers in, one writer out.',
      detail: 'The computed trace is: after reader one the count is one and wsem is zero; after reader two the count is two; the writer makes wsem minus one; readers three and four raise the count to four with wsem unchanged at minus one. One writer is queued throughout.',
      narration: 'Here are the exact values from the trace. Count one and wsem zero after the first reader. Count two after the second. The writer takes wsem to minus one. Then readers three and four take the count to four, and wsem is still minus one. Four readers inside, one writer outside.',
      keyword: 'wsem is still minus one',
      trap: 'Believing the count limits readers. Nothing bounds readcount; on this code any number of readers may be inside at once.'
    },
    {
      id: 's4-3', scene: 'starvation', start: 105, end: 112.5,
      caption: 'If readers never all leave, the writer never enters. That is starvation.',
      detail: 'The writer is released only when readcount returns to zero, which requires a moment with no reader inside at all. A steady arrival of readers can make that moment never happen. The writer waits for ever while the system keeps making progress for readers.',
      narration: 'The writer is released by exactly one event: the count falling to zero. That needs an instant with no reader inside. If readers keep arriving, that instant never comes. The system keeps working for readers and the writer waits for ever. That is starvation, and note that nothing is stuck.',
      keyword: 'starvation, and nothing is stuck',
      trap: 'Calling this a deadlock. Progress continues for readers, so no process is blocked for ever by a cycle; one class is simply never chosen.'
    },
    {
      id: 's4-4', scene: 'starvation', start: 112.5, end: 120,
      caption: 'This is called reader preference, and it is a design choice, not a bug in the code.',
      detail: 'The first readers-writers problem is stated as: no reader waits unless a writer already holds the section. That statement forces reader preference, and reader preference forces the possibility of writer starvation. The code is a correct solution to that problem.',
      narration: 'This behaviour has a name: reader preference. It is not a coding mistake. The first readers and writers problem says no reader may wait unless a writer already holds the section, and that sentence forces exactly this behaviour. The starvation is a consequence of the specification, not a slip.',
      keyword: 'reader preference',
      trap: 'Answering "the solution is incorrect" because a writer can starve. It is a correct solution to the first problem and a wrong one to the third.'
    },

    /* ---------------- scene 5: preference ---------------- */
    {
      id: 's5-1', scene: 'preference', start: 120, end: 127.5,
      caption: 'Add one gate, readTry, that every reader must pass through.',
      detail: 'The second solution adds readTry, a semaphore every reader takes on the way in and gives back immediately after. A writer takes readTry when it is the first writer to arrive and holds it until it is the last writer to leave, so a waiting writer closes the gate on new readers.',
      narration: 'The second solution adds one semaphore and one rule. Every reader passes through a gate called readTry on the way in. The first writer to arrive closes that gate, and the last writer to leave opens it again. So while a writer waits, no new reader can start.',
      keyword: 'closes that gate',
      trap: 'Thinking the gate makes writers exclusive of each other. A separate semaphore, wmutex, keeps the writers apart; readTry only stops readers.'
    },
    {
      id: 's5-2', scene: 'preference', start: 127.5, end: 135,
      caption: 'One reader inside, then a writer: the writer takes readTry and blocks on wmutex.',
      detail: 'The computed trace: reader one passes readTry and takes wmutex, leaving wmutex at zero. Writer one arrives, raises writecount to one, and because it is the first writer it takes readTry, which falls to zero, and then blocks on wmutex, which falls to minus one.',
      narration: 'Trace it. Reader one passes the gate and takes wmutex, so wmutex is zero and she reads. Writer one arrives and is the first writer, so it takes readTry, which falls to zero, and then it waits on wmutex, which falls to minus one. The writer is queued and it is holding the gate.',
      keyword: 'holding the gate',
      trap: 'Missing that the writer holds readTry while it is blocked. That held gate is the whole mechanism, and it is why a later reader cannot slip in.'
    },
    {
      id: 's5-3', scene: 'preference', start: 135, end: 142.5,
      caption: 'Reader two now blocks on readTry at minus one: the gate is shut.',
      detail: 'Reader two waits on readTry, whose value is zero, so it becomes minus one and reader two is queued. The value minus one is the count of readers waiting at the gate. Reader one finishes, the count reaches zero, and she signals wmutex, waking the writer.',
      narration: 'Now reader two arrives and waits at the gate. readTry is zero, so it becomes minus one, and reader two is queued. The gate is shut. When reader one finishes, the count reaches zero, she signals wmutex and the writer wakes. Only when the last writer leaves does the gate reopen.',
      keyword: 'the gate is shut',
      trap: 'Concluding that this solution is starvation-free. It is starvation-free for writers and it can starve readers, because a steady stream of writers keeps readTry closed.'
    },
    {
      id: 's5-4', scene: 'preference', start: 142.5, end: 150,
      caption: 'Second problem: writers first. Third problem: nobody starves, and it costs more.',
      detail: 'The second readers-writers problem asks that no writer, once queued, waits longer than necessary, and its solution gives writers preference. The third asks that neither class starves, and its solution routes every process through one queue semaphore, which gives up both preferences and adds semaphores and bookkeeping.',
      narration: 'So the three problems differ in one sentence each. The first says readers are never delayed by a reader, which starves writers. The second says a queued writer is not delayed by new readers, which starves readers. The third says nobody starves, and it is paid for with another semaphore and more bookkeeping.',
      keyword: 'nobody starves',
      trap: 'Answering "both are starvation-free" for the second solution. Writer preference starves readers, exactly as reader preference starves writers.'
    },

    /* ---------------- scene 6: counting ---------------- */
    {
      id: 's6-1', scene: 'counting', start: 150, end: 157.5,
      caption: 'How many processes can be inside? Readers: all of them. Writers: one.',
      detail: 'In the first solution nothing bounds the number of readers, so the maximum inside the section is the number of reader processes that exist, and they may all be inside together. Writers are serialised by wsem, so at most one writer is inside, and no writer is inside with any reader.',
      narration: 'Questions ask for the largest number of processes that can be inside at once. For readers the answer is every reader process there is, because nothing counts them down from a limit. For writers the answer is one. And no reader is ever inside at the same time as a writer.',
      keyword: 'every reader process there is',
      trap: 'Answering "one" because the section is called critical. The reader count is not capped by the code unless the question adds a semaphore that caps it.'
    },
    {
      id: 's6-2', scene: 'counting', start: 157.5, end: 165,
      caption: 'How many semaphores? Two for the first solution, four for the second.',
      detail: 'The first solution uses rmutex and wsem, two binary semaphores, plus the integer readcount. The second uses readTry, wmutex, a mutex on the reader count and a mutex on the writer count, four binary semaphores, plus two integers.',
      narration: 'A common question asks how many semaphores a solution needs. The first uses two: one for the counter and one for the data. The second uses four: the gate, the writer lock, and one mutex for each of the two counters. Count them off the code rather than from memory.',
      keyword: 'two ... four',
      trap: 'Counting semaphores and forgetting the counters, or the reverse. A question that asks for "shared variables" wants the integers, not the semaphores.'
    },
    {
      id: 's6-3', scene: 'counting', start: 165, end: 172.5,
      caption: 'A negative value is a queue length. Minus one means one process waiting.',
      detail: 'Under the standard definition, wait decrements and then blocks if the value has gone negative, and signal increments and wakes a waiter if the value is still at most zero. So a value of minus k means exactly k processes are queued, and after m waits and p signals on a semaphore started at s the value is s minus m plus p.',
      narration: 'One convention question decides many marks. Under the standard definition a wait decrements first and blocks if the value went negative, so a value of minus k means k processes are queued. And after m waits and p signals on a semaphore started at s, the value is s minus m plus p.',
      keyword: 'minus k means k processes are queued',
      trap: 'Using the convention that clamps the value at zero and keeps the queue separately. Both exist; the numbers differ, so read which one the question uses.'
    },
    {
      id: 's6-4', scene: 'counting', start: 172.5, end: 180,
      caption: 'Who may barge, and what each solution guarantees, in one table.',
      detail: 'The table collects the four quantities a paper is likely to ask for: maximum readers inside, maximum writers inside, semaphore count, and which class can be starved. Reader preference starves writers, writer preference starves readers, and the fair version starves neither at the cost of a queue semaphore.',
      narration: 'Here is the table to carry into the exam. Maximum readers inside, maximum writers inside, how many semaphores, and who can starve. Reader preference starves writers. Writer preference starves readers. The fair version starves neither, and it pays for that with one more semaphore.',
      keyword: 'who can starve',
      trap: 'Memorising the counts without the version. The counts differ between the three problems, so identify the version first.'
    },

    /* ---------------- scene 7: philosophers ---------------- */
    {
      id: 's7-1', scene: 'philosophers', start: 180, end: 187.5,
      caption: 'Five philosophers, five forks, and a loop of think, pick up, eat, put down.',
      detail: 'Each fork is a binary semaphore initialised to one, so it is a lock. Philosopher i takes fork i, which is on his left, and then fork i plus one modulo five, which is on his right, eats, and puts both back. The loop repeats for ever.',
      narration: 'Now the ring. Each fork is a lock, one semaphore each, all starting at one. Philosopher i takes the fork on his left, then the fork on his right, eats, and puts both back. Then he thinks and starts again. Five philosophers, five forks, and the code is the same for all five.',
      keyword: 'the same for all five',
      trap: 'Assuming the forks are distinguishable in the code. They are, by index, but every philosopher runs the identical instruction sequence, and that symmetry is the problem.'
    },
    {
      id: 's7-2', scene: 'philosophers', start: 187.5, end: 195,
      caption: 'All five take the left fork at the same instant. Every fork is now held.',
      detail: 'Because the code is symmetric, an interleaving exists in which each philosopher completes his first wait before any philosopher completes his second. At that moment all five forks are held, one per philosopher.',
      narration: 'Because every philosopher runs the same code, there is an interleaving where all five finish their first wait before anyone finishes the second. In that interleaving every philosopher holds his left fork, so all five forks are held, one each.',
      keyword: 'all five forks are held',
      trap: 'Believing a single processor prevents this. A preemption after the first wait is enough, so one core can reach this state.'
    },
    {
      id: 's7-3', scene: 'philosophers', start: 195, end: 202.5,
      caption: 'Each now waits for a fork his neighbour holds. Nothing can move.',
      detail: 'Philosopher i waits for fork i plus one, which philosopher i plus one holds as his left fork. Every philosopher is blocked, no philosopher is eating, and no fork will ever be released, so the state is permanent.',
      narration: 'Now each philosopher waits for the fork on his right. But that fork is the left fork of his neighbour, and the neighbour is holding it. Every philosopher is blocked, nobody is eating, and no fork will ever be released. The table has stopped, and it will stay stopped.',
      keyword: 'no fork will ever be released',
      trap: 'Describing this as slow progress. Nobody is eating and nothing can be released, so this is a permanent stop, not contention.'
    },
    {
      id: 's7-4', scene: 'philosophers', start: 202.5, end: 210,
      caption: 'Four conditions, all true here: exclusion, hold and wait, no preemption, a cycle.',
      detail: 'A fork is held by one philosopher only, so mutual exclusion holds. Each holds one fork while asking for another, so hold and wait holds. No fork can be taken away, so no preemption holds. And the waiting forms a ring, so circular wait holds. All four together are necessary for a deadlock; here they are also sufficient.',
      narration: 'Four conditions have to hold for a deadlock, and here all four do. A fork is exclusive. Each philosopher holds one while asking for another. Nothing can be taken away. And the waiting forms a ring. Remove any one of the four and this deadlock becomes impossible, which is exactly what the three repairs do.',
      keyword: 'remove any one of the four',
      trap: 'Saying the four conditions cause a deadlock. They are necessary conditions; a cycle of waiting is what makes them sufficient, and the next scene tests that claim by search.'
    },

    /* ---------------- scene 8: search ---------------- */
    {
      id: 's8-1', scene: 'search', start: 210, end: 217.5,
      caption: 'A philosopher is in one of four situations, so the whole table is finite.',
      detail: 'Model each philosopher as thinking, waiting for his first fork, holding his first fork, or eating. Fork ownership is then determined by those four labels, so a state is one label per philosopher. For five philosophers that is at most four to the fifth, which is one thousand and twenty-four states.',
      narration: 'To prove anything here, model the table as a finite object. Each philosopher is thinking, waiting for his first fork, holding it, or eating. Who holds which fork follows from those labels. So a state is five labels, and there are at most four to the fifth, which is one thousand and twenty-four of them.',
      keyword: 'a finite object',
      trap: 'Trying to reason from one execution. A single run shows a deadlock is possible; only the full state set shows what else is possible.'
    },
    {
      id: 's8-2', scene: 'search', start: 217.5, end: 225,
      caption: 'Search every reachable state: five hundred and seventy-three of them.',
      detail: 'Starting from all five thinking and applying every legal move in every order, the reachable set has five hundred and seventy-three states. This is computed, not quoted, and the same search is what the page runs to check every claim in this lesson.',
      narration: 'Now walk the whole graph. Start with all five thinking, and apply every legal move in every possible order. The reachable set comes out at five hundred and seventy-three states. That number is computed here, by the same search that checks the repairs later.',
      keyword: 'five hundred and seventy-three',
      trap: 'Assuming the reachable count equals the upper bound. Most of the one thousand and twenty-four states are unreachable, and only reachable states matter.'
    },
    {
      id: 's8-3', scene: 'search', start: 225, end: 232.5,
      caption: 'Exactly one state has no legal move, and it is all five holding their left fork.',
      detail: 'A state is stuck when no philosopher can take a step, which happens only when every philosopher is either waiting for a fork or holding one and blocked. The search finds exactly one such state: all five holding their first fork. The deadlock is real and it is the only one.',
      narration: 'A state is stuck when no philosopher has any legal move, which means every one of them is blocked. The search finds exactly one such state in the whole reachable set, and it is the one we built by hand: all five holding their left fork. One deadlock, and it is the one the picture showed.',
      keyword: 'exactly one such state',
      trap: 'Assuming there must be several deadlocks. There is one, and finding that it is unique is a stronger statement than finding it at all.'
    },
    {
      id: 's8-4', scene: 'search', start: 232.5, end: 240,
      caption: 'The same search says at most two can eat: two meals need four forks.',
      detail: 'Across every reachable state, the largest number of philosophers eating at once is two. Two eaters hold four forks, and a third meal needs two more forks while only one is left. So no arrangement of this table feeds three philosophers together.',
      narration: 'The same search answers the counting question. The largest number eating at once, over every reachable state, is two. Two eaters hold four forks, and the third meal needs two forks when only one is left. So the ceiling here is two, and it comes from the forks, not from the code.',
      keyword: 'the ceiling here is two',
      trap: 'Answering five, or three, from the number of philosophers. The fork count decides: each meal costs two forks, so the ceiling is half of five rounded down.'
    },

    /* ---------------- scene 9: fixes ---------------- */
    {
      id: 's9-1', scene: 'fixes', start: 240, end: 247.5,
      caption: 'Fix one: a room semaphore with four permits, so one philosopher waits outside.',
      detail: 'A semaphore initialised to four is taken before the first fork and released after the last. With at most four philosophers competing for five forks, at least one always finds both free. The search reports no stuck state, and the number of reachable states falls to four hundred and ninety-one.',
      narration: 'The first repair is a room with four seats. A semaphore starts at four, taken before the first fork and released after eating. Now at most four philosophers compete for five forks, so one of them can always get both. The search finds no stuck state at all, in four hundred and ninety-one reachable states.',
      keyword: 'no stuck state at all',
      trap: 'Initialising the room semaphore to five. That is the original problem again, and the search then finds the same deadlock.'
    },
    {
      id: 's9-2', scene: 'fixes', start: 247.5, end: 255,
      caption: 'Fix two: break the symmetry, so the odd philosophers reach right first.',
      detail: 'If philosophers with an even index take the left fork first and philosophers with an odd index take the right fork first, the ring of first-fork choices is no longer a cycle. The search reports no stuck state in four hundred and ninety-two reachable states.',
      narration: 'The second repair breaks the symmetry. Even-numbered philosophers reach left first, odd-numbered ones reach right first. Now the first choices no longer form a ring, so the cycle cannot close. The search finds no stuck state, in four hundred and ninety-two reachable states.',
      keyword: 'break the symmetry',
      trap: 'Turning only one philosopher around and calling it the asymmetric solution. One is enough to break the cycle, and turning all five the same way again restores it.'
    },
    {
      id: 's9-3', scene: 'fixes', start: 255, end: 262.5,
      caption: 'Fix three: a waiter that grants both forks or neither, as a monitor does.',
      detail: 'The monitor solution keeps a state per philosopher and grants both forks only when neither neighbour is eating, so no philosopher ever holds one fork while waiting for a second. Hold and wait is removed rather than the cycle, and two philosophers can still eat at once.',
      narration: 'The third repair removes hold and wait instead of the cycle. A monitor keeps one state per philosopher and lets a philosopher eat only when neither neighbour is eating, so nobody ever holds one fork while asking for another. Two can still eat at once, and no one can be stuck holding a fork.',
      keyword: 'removes hold and wait',
      trap: 'Believing the monitor makes everything fair. It removes deadlock; a philosopher can still be unlucky and wait a long time, so fairness needs a queue.'
    },
    {
      id: 's9-4', scene: 'fixes', start: 262.5, end: 270,
      caption: 'Every repair removes one condition, and none of them removes waiting.',
      detail: 'The room semaphore removes the possibility of all five competing at once, the asymmetric order removes the cycle, and the monitor removes hold and wait. None of them makes a philosopher eat sooner; they only make it impossible for the table to stop.',
      narration: 'So each repair attacks one of the four conditions. The room removes the possibility that all five compete. The asymmetric order removes the cycle. The monitor removes hold and wait. None of them makes anyone eat sooner. They only make it impossible for the whole table to stop.',
      keyword: 'one of the four conditions',
      trap: 'Answering "the deadlock is prevented" without naming which condition was removed. The question usually wants the condition, not the verdict.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Deadlock: nothing moves. Starvation: one class never chosen. They differ.',
      detail: 'A deadlock is a state from which no process can proceed, so the system as a whole stops. Starvation is a situation where the system keeps working while one process or class is never selected. A solution can be deadlock-free and still starve a class, and both of these lessons have such solutions.',
      narration: 'Two failures, two definitions. A deadlock is a state where nothing at all can proceed. Starvation is where the system keeps working and one class is never chosen. A solution can be free of deadlock and still starve a class, and the readers and writers solutions show exactly that.',
      keyword: 'nothing at all ... never chosen',
      trap: 'Using the words interchangeably in a one-mark question. The cause differs, the repair differs, and the exam distinguishes them.'
    },
    {
      id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Bounded waiting is the third promise, and it is the one usually broken.',
      detail: 'Bounded waiting says there is a limit on how many times others may enter while one process waits. The first readers-writers solution has no such limit for writers, and the asymmetric philosophers solution has none for philosophers, so both fail bounded waiting while satisfying safety.',
      narration: 'There is a third promise, bounded waiting: a limit on how many others may go ahead of a waiting process. The first readers and writers solution puts no limit on readers going ahead of a writer. The asymmetric philosophers solution puts no limit on lucky neighbours. Both are safe and both fail bounded waiting.',
      keyword: 'bounded waiting',
      trap: 'Treating bounded waiting as part of mutual exclusion. It is a separate requirement, and a solution can satisfy the first and fail this.'
    },
    {
      id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Read the code in this order: which variable is shared, what guards it, who signals.',
      detail: 'The procedure: find every shared variable, find the semaphore that guards it, then for each wait find the matching signal and ask whether every path reaches it. Then ask which class can be bypassed, and finally count the maximum inside and the semaphore values.',
      narration: 'Here is the order to read any such question. Find the shared variables. Find which semaphore guards each one. For every wait, find its matching signal and check that every path reaches it. Then ask which class can be bypassed. Only then count the maximum number inside and the semaphore values.',
      keyword: 'for every wait, find its matching signal',
      trap: 'Starting from the counts. A count computed before the matching signals are checked is a guess, because a missing signal changes every value in the trace.'
    },
    {
      id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Both problems are one idea: a resource that two rules disagree about.',
      detail: 'Readers and writers disagree about whether sharing is allowed; philosophers disagree about the order in which two resources are taken. The first is settled by a counter and a preference rule, the second by breaking a cycle. Everything else in this lesson is bookkeeping around those two sentences.',
      narration: 'Both problems come down to one idea: a resource that two rules disagree about. Readers and writers disagree about sharing. Philosophers disagree about the order of two acquisitions. A counter settles the first, and breaking a cycle settles the second. Everything else here is bookkeeping.',
      keyword: 'a counter ... breaking a cycle',
      trap: 'Learning the two solutions as text to reproduce. Both are one rule each, and a question that changes the rule changes the answer.'
    }
  ]
};
