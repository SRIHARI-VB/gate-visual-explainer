/* ==========================================================================
   view-serialisability-and-blind-writes — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js from
   the schedules themselves and printed on the canvas; the two agree because
   both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'cycle',
      n: 1,
      title: 'The graph says no, and the schedule is still correct',
      start: 0, end: 30,
      objective: 'See a schedule whose precedence graph has a cycle yet whose outcome matches a serial order, and state why that is possible.'
    },
    {
      id: 'observations',
      n: 2,
      title: 'Three observations are all that survive',
      start: 30, end: 60,
      objective: 'Name the three things a schedule leaves behind — who read the initial value, who each read took its value from, who wrote last — and see that an unread write changes none of them.'
    },
    {
      id: 'definition',
      n: 3,
      title: 'View equivalence, and the two dummy transactions',
      start: 60, end: 90,
      objective: 'State view equivalence, collapse the three observations into one read-from relation using T_init and T_final, and read the table of the witness.'
    },
    {
      id: 'witness',
      n: 4,
      title: 'The witness, one operation at a time',
      start: 90, end: 120,
      objective: 'Run the four operations with real values, and see which write is dead and why the final value matches the serial order T1, T2, T3.'
    },
    {
      id: 'matching',
      n: 5,
      title: 'Match the table against every serial order',
      start: 120, end: 150,
      objective: 'Build the read-from table of all six serial orders and find which one the witness matches — the test that replaces the precedence graph.'
    },
    {
      id: 'twelve',
      n: 6,
      title: 'All twelve interleavings of this family',
      start: 150, end: 180,
      objective: 'Classify every interleaving of the three-transaction family: six conflict serialisable, ten view serialisable, four in the gap, two in neither class.'
    },
    {
      id: 'blind',
      n: 7,
      title: 'A blind write is necessary, and not sufficient',
      start: 180, end: 210,
      objective: 'Define a blind write, then check the necessity claim against three larger families: 45 schedules sit in the gap and every one contains a blind write.'
    },
    {
      id: 'two',
      n: 8,
      title: 'Two transactions never separate',
      start: 210, end: 240,
      objective: 'Report what the enumeration finds for three two-transaction families — 29 schedules, no separation — and state the limit of that finding.'
    },
    {
      id: 'ladder',
      n: 9,
      title: 'The ladder, and why systems stop at conflict',
      start: 240, end: 270,
      objective: 'Place serial, conflict, view and final-state serialisability in one chain with a witness for each gap, and explain why protocols aim at the conflict level.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure for any question',
      start: 270, end: 300,
      objective: 'Fix the four steps that answer a view-serialisability question without guessing, and name the slips that cost a mark.'
    }
  ],

  events: [
    /* ---------- scene 1: the cycle that is still correct ---------- */
    {
      id: 'e1a', scene: 'cycle', start: 0, end: 7.5,
      caption: 'Three transactions touch one item: T1 reads X then writes it, T2 writes X, T3 writes X.',
      detail: 'Four operations in all. T1 has two of them and its own order fixes them: the read comes before the write. T2 and T3 each have one write. Nothing here is unusual, and the schedule is a legal interleaving.',
      narration: 'Three transactions, one item. T1 reads X and then writes it. T2 writes X. T3 writes X. Four operations in total.',
      keyword: 'T2 writes X'
    },
    {
      id: 'e1b', scene: 'cycle', start: 7.5, end: 15,
      caption: 'The precedence graph has two edges in opposite directions: T1 to T2, and T2 to T1.',
      detail: 'The read of T1 conflicts with the write of T2 on the same item, so T1 must come first. The write of T2 conflicts with the later write of T1, so T2 must come first. Two edges, both between the same pair, in opposite directions.',
      narration: 'The graph gets an edge from T1 to T2, because T1 read before T2 wrote. And an edge from T2 to T1, because T2 wrote before T1 wrote. Two edges, opposite directions.',
      keyword: 'T2 to T1',
      trap: 'A two-cycle is not a drawing mistake. Two conflicting pairs on one item really do pin the order in both directions.'
    },
    {
      id: 'e1c', scene: 'cycle', start: 15, end: 22.5,
      caption: 'So it is not conflict serialisable. Run it with X at 100: read 100, write 150, write 200, write 150, write 300.',
      detail: 'T1 reads the initial 100 and writes 150. T2 writes 200. T1 then writes 150 again, computed from what it read, not from the 200 sitting in the item. T3 writes 300. The final value is 300.',
      narration: 'So the graph says not conflict serialisable. Now run it. X starts at one hundred. T1 reads one hundred and writes one fifty. T2 writes two hundred. T1 writes one fifty again. T3 writes three hundred.',
      keyword: 'not conflict serialisable'
    },
    {
      id: 'e1d', scene: 'cycle', start: 22.5, end: 30,
      caption: 'Serial T1 then T2 then T3 also ends at 300 with T1 reading the initial value, so the schedule is equivalent to a serial one.',
      detail: 'In the serial order T1, T2, T3: T1 reads 100 and writes 150, T2 writes 200, T3 writes 300. Final value 300, and T1 read the initial value. The two schedules agree on every observation that matters. Conflict serialisability is a sufficient condition for correctness, never a necessary one.',
      narration: 'Run them one at a time, T1 then T2 then T3. T1 reads the initial value and writes one fifty, T2 writes two hundred, T3 writes three hundred. Final value three hundred. The same as before.',
      keyword: 'equivalent to a serial one',
      trap: 'The graph can only ever say no to conflict serialisability. Reading that no as not serialisable is the commonest error in this topic.'
    },

    /* ---------- scene 2: the three observations ---------- */
    {
      id: 'e2a', scene: 'observations', start: 30, end: 37.5,
      caption: 'A schedule leaves behind three things: who read the initial value, who each read took its value from, and who wrote last.',
      detail: 'These are the only facts a later reader can tell apart. Everything else about a schedule — how many times an item was overwritten, how long an operation waited — is invisible once the transactions finish.',
      narration: 'What does a schedule leave behind? Three things. Who read the initial value. Who each read took its value from. And who wrote the last value of each item.',
      keyword: 'three things'
    },
    {
      id: 'e2b', scene: 'observations', start: 37.5, end: 45,
      caption: 'In the witness: T1 read the initial value, and T3 wrote the final value.',
      detail: 'Both facts are shared with the serial order T1, T2, T3, which is exactly why the two schedules are interchangeable from the point of view of anyone who reads the database afterwards or of any transaction that ran inside it.',
      narration: 'In our schedule, T1 read the initial value, and T3 wrote the last value. Those are the two facts.',
      keyword: 'T3 wrote the final value'
    },
    {
      id: 'e2c', scene: 'observations', start: 45, end: 52.5,
      caption: 'The 200 that T2 wrote was never read by anyone. A write nobody reads is called dead.',
      detail: 'T1 overwrote it with 150 without ever reading it, and T3 overwrote that. The 200 exists in no observation at all, so moving that write to another position, as long as it stays unread, changes nothing.',
      narration: 'Now look at what T2 wrote: two hundred. Nobody ever read it. T1 wrote over it without reading it. A write that nobody reads is called dead.',
      keyword: 'dead',
      trap: 'A dead write is not an error and not a lost update. It is invisible to every observation, which is why the graph can be too strict about it.'
    },
    {
      id: 'e2d', scene: 'observations', start: 52.5, end: 60,
      caption: 'Those three observations are the view of the schedule, and a dead write can move without changing it.',
      detail: 'This is the whole idea behind the weaker equivalence: two schedules are interchangeable when they leave the same view, even if the order of their operations differs enough to change the conflict graph.',
      narration: 'Those three observations are called the view of the schedule. And because a dead write appears in none of them, it can move without changing the view.',
      keyword: 'the view of the schedule'
    },

    /* ---------- scene 3: the definition ---------- */
    {
      id: 'e3a', scene: 'definition', start: 60, end: 67.5,
      caption: 'Two schedules are view equivalent when all three observations agree.',
      detail: 'Formally: the same transaction reads the initial value of each item, every read reads from the same write in both schedules, and the same transaction performs the final write of each item. Three conditions, checked item by item and read by read.',
      narration: 'So here is the definition. Two schedules are view equivalent when all three observations agree: the same initial reads, the same read-from pairs, the same final writes.',
      keyword: 'view equivalent'
    },
    {
      id: 'e3b', scene: 'definition', start: 67.5, end: 75,
      caption: 'Add a transaction T_init that writes every item at the start, and T_final that reads every item at the end.',
      detail: 'The two dummy transactions turn the three conditions into one. A read that took the initial value now reads from T_init, and the final write of an item is simply the write that T_final reads. Nothing is lost and nothing extra is added.',
      narration: 'Now the trick that makes this testable. Put a transaction at the very start that writes every item, and one at the very end that reads every item. Then all three conditions become one relation.',
      keyword: 'T_init'
    },
    {
      id: 'e3c', scene: 'definition', start: 75, end: 82.5,
      caption: 'View equivalent exactly when the read-from relation is identical. View serialisable when some serial order matches it.',
      detail: 'The read-from relation is the set of triples: this transaction read this item from that transaction. Two schedules with the same relation are view equivalent. A schedule is view serialisable when at least one serial order of the same transactions produces the same relation.',
      narration: 'Two schedules are view equivalent exactly when their read-from relations are identical. And a schedule is view serialisable when at least one serial order has the same relation.',
      keyword: 'read-from relation'
    },
    {
      id: 'e3d', scene: 'definition', start: 82.5, end: 90,
      caption: 'The witness has two rows: T1 read X from T_init, and T_final read X from T3.',
      detail: 'Two rows for a four-operation schedule, because only one item is touched and only one transaction reads it. The comparison with a serial order is then a comparison of two-row tables, which is why the test is easy to run by hand on small examples and expensive to run in general.',
      narration: 'For our witness the table has two rows. T1 read X from the initial transaction, and the final transaction read X from T3. That is the whole table.',
      keyword: 'two rows'
    },

    /* ---------- scene 4: the witness ---------- */
    {
      id: 'e4a', scene: 'witness', start: 90, end: 97.5,
      caption: 'X starts at 100. T1 reads 100.',
      detail: 'The value is only a label for a provenance. What matters is that the value T1 sees came from nobody, that is, from the initial state of the database.',
      narration: 'Let X start at one hundred. T1 reads it, so T1 has one hundred in its own buffer.',
      keyword: 'T1 reads 100'
    },
    {
      id: 'e4b', scene: 'witness', start: 97.5, end: 105,
      caption: 'T2 writes 200 into X.',
      detail: 'T2 never read X, so this write is blind: the value it stores is a constant from T2 own logic, not something derived from the database.',
      narration: 'T2 writes two hundred into X. T2 never read X, so this is a blind write.',
      keyword: 'blind write'
    },
    {
      id: 'e4c', scene: 'witness', start: 105, end: 112.5,
      caption: 'T1 writes 150, computed from the 100 it read. The 200 is now dead.',
      detail: 'This is the step that decides everything. T1 does not re-read X before writing; it writes the value it computed from its earlier read. So the 200 disappears from the database without ever being observed.',
      narration: 'T1 now writes one fifty. It computed that from the one hundred it read earlier, not from the two hundred sitting in X. So the two hundred is gone, and nobody ever saw it.',
      keyword: 'The 200 is now dead'
    },
    {
      id: 'e4d', scene: 'witness', start: 112.5, end: 120,
      caption: 'T3 writes 300. Final value 300, and serial T1, T2, T3 produces the same three observations.',
      detail: 'The final value is 300 in both. T1 read the initial value in both. T3 wrote last in both. Two schedules, four operations, a cycle in the graph, and identical views.',
      narration: 'T3 writes three hundred. Final value three hundred. And the serial order T1, T2, T3 gives the same three observations: T1 reads the initial value, T3 writes last, final value three hundred.',
      keyword: 'identical views'
    },

    /* ---------- scene 5: matching serial orders ---------- */
    {
      id: 'e5a', scene: 'matching', start: 120, end: 127.5,
      caption: 'Three transactions give six serial orders. Compare the read-from table with each one.',
      detail: 'A serial order is a permutation, so three transactions give six. For each, build the same two-row table and compare. One match is all the definition asks for.',
      narration: 'Three transactions give six serial orders. Build the table for each one, and compare it with the schedule table.',
      keyword: 'six serial orders'
    },
    {
      id: 'e5b', scene: 'matching', start: 127.5, end: 135,
      caption: 'The last transaction in a serial order writes last, so the final-write row names it immediately.',
      detail: 'That single observation already narrows the search: an order ending in T2 writes last in T2, one ending in T3 writes last in T3. Only when T1 is last does the final writer depend on what T1 reads, because T1 computes its value from its own read.',
      narration: 'The final-write row is easy: whichever transaction runs last writes last. So an order ending in T3 has T3 as the final writer, and one ending in T2 has T2.',
      keyword: 'writes last'
    },
    {
      id: 'e5c', scene: 'matching', start: 135, end: 142.5,
      caption: 'Only T1, T2, T3 has T1 reading the initial value and T3 writing last. That is the match.',
      detail: 'Two rows agree, so the two schedules are view equivalent and the witness is view serialisable. The named serial order is T1, T2, T3, and it is the order a human would guess from the operations — but the test, not the guess, produced it.',
      narration: 'Only the order T1 then T2 then T3 has T1 reading the initial value and T3 writing last. Two rows agree, so the schedule is view serialisable, equivalent to T1, T2, T3.',
      keyword: 'That is the match'
    },
    {
      id: 'e5d', scene: 'matching', start: 142.5, end: 150,
      caption: 'A match is enough. The definition asks for one serial order, not for the order the operations look like.',
      detail: 'Two different serial orders can share a table when the operations allow it, and either is a valid witness. What the definition does not permit is calling a schedule serialisable because it merely looks like an order.',
      narration: 'One match is enough. The definition asks for at least one serial order, and it does not have to be the order the operations look like.',
      keyword: 'A match is enough'
    },

    /* ---------- scene 6: the twelve ---------- */
    {
      id: 'e6a', scene: 'twelve', start: 150, end: 157.5,
      caption: 'Four operations with two from T1 and one each from T2 and T3 give twelve interleavings.',
      detail: 'The count is the multinomial coefficient: four positions, two of them taken by the operations of T1 in their fixed order, one by T2, one by T3. Twelve ways, and the page enumerates every one of them rather than sampling.',
      narration: 'Now enumerate. Four operations, two of them from T1 in a fixed order, one each from the other two. That is twelve interleavings.',
      keyword: 'twelve interleavings'
    },
    {
      id: 'e6b', scene: 'twelve', start: 157.5, end: 165,
      caption: 'Six are conflict serialisable, and here they are exactly the six serial orders.',
      detail: 'When the two blind writes come after T1 has finished, no conflict can point backwards, so the graph stays acyclic. Six of the twelve fall in this group, which happens to equal the number of serial orders.',
      narration: 'Six of the twelve are conflict serialisable. In this family those six are exactly the serial orders themselves.',
      keyword: 'Six are conflict serialisable'
    },
    {
      id: 'e6c', scene: 'twelve', start: 165, end: 172.5,
      caption: 'Ten are view serialisable, so four have a cycle and are still correct.',
      detail: 'The four are r1 w2 w1 w3, r1 w3 w1 w2, w2 r1 w3 w1 and w3 r1 w2 w1. Each has the two-cycle of scene one and each matches a serial order on both rows of the table.',
      narration: 'Ten are view serialisable. So four of them have a cycle in the precedence graph and are still correct.',
      keyword: 'Ten are view serialisable',
      trap: 'Counting the view-serialisable ones by counting the acyclic graphs gives ten minus four, which is the wrong answer in both directions.'
    },
    {
      id: 'e6d', scene: 'twelve', start: 172.5, end: 180,
      caption: 'The other two are in neither class: T1 writes last but computed from the initial value.',
      detail: 'In r1 w2 w3 w1 the final write is T1, but T1 computed its value from the initial 100, so the final value is 150. No serial order produces 150: if T1 runs last it reads 200 or 300 first, and if it does not run last it does not write last. Both tables fail.',
      narration: 'The last two are in neither class. T1 writes last, but it computed that value from the initial one hundred. So the final value is one fifty, and no serial order gives one fifty.',
      keyword: 'in neither class'
    },

    /* ---------- scene 7: blind writes ---------- */
    {
      id: 'e7a', scene: 'blind', start: 180, end: 187.5,
      caption: 'A blind write is a write with no earlier read of the same item in its own transaction.',
      detail: 'The test is inside the transaction, not inside the schedule. T2 and T3 write blind here; T1 does not, because its write follows its own read of X.',
      narration: 'A blind write is a write that its own transaction never read that item before. Here T2 and T3 write blind. T1 does not, because it read X first.',
      keyword: 'blind write'
    },
    {
      id: 'e7b', scene: 'blind', start: 187.5, end: 195,
      caption: 'Two larger families: 210 interleavings give 54 conflict and 71 view; 560 give 86 and 110.',
      detail: 'Both families use two items and three transactions, with blind writes on both items. The gap widens with the number of interleavings but stays a small fraction of them, which is why a schedule in the gap is a rare but reliable exam example.',
      narration: 'Two bigger families. Two hundred and ten interleavings give fifty-four conflict serialisable and seventy-one view serialisable. Five hundred and sixty give eighty-six and one hundred and ten.',
      keyword: '54 conflict and 71 view'
    },
    {
      id: 'e7c', scene: 'blind', start: 195, end: 202.5,
      caption: 'Across the three families, 45 schedules sit in the gap, and every one contains a blind write.',
      detail: 'Four, seventeen and twenty-four make forty-five. Checking each of them for a blind write inside its own transactions finds at least one every time. That is the necessity half of the textbook statement; the sufficiency half fails, because most schedules with a blind write are still not view serialisable.',
      narration: 'Add them up: four, seventeen, twenty-four. Forty-five schedules are view serialisable but not conflict serialisable. Every single one contains a blind write.',
      keyword: '45 schedules'
    },
    {
      id: 'e7d', scene: 'blind', start: 202.5, end: 210,
      caption: 'With no blind write at all the two classes coincide: 90 interleavings, 30 and 30.',
      detail: 'The third family has three transactions and two items and no transaction writes an item it has not read. Thirty of its ninety interleavings are conflict serialisable and exactly the same thirty are view serialisable.',
      narration: 'And when there is no blind write anywhere, the two classes coincide. Ninety interleavings, thirty conflict serialisable, thirty view serialisable.',
      keyword: 'the two classes coincide'
    },

    /* ---------- scene 8: two transactions ---------- */
    {
      id: 'e8a', scene: 'two', start: 210, end: 217.5,
      caption: 'Three two-transaction families: 3, 6 and 20 interleavings.',
      detail: 'The first has one item and one blind write. The second has one item and no blind write. The third has two items with blind writes on both sides, so the only thing missing is the third transaction.',
      narration: 'Now the two-transaction case. Three families: three interleavings, six interleavings, twenty interleavings.',
      keyword: 'two-transaction'
    },
    {
      id: 'e8b', scene: 'two', start: 217.5, end: 225,
      caption: 'In each family the two counts agree: 2 of 3, 2 of 6, 8 of 20.',
      detail: 'Every schedule that is view serialisable in these families is also conflict serialisable, and the reverse always holds. So the two classes cannot be told apart on these examples, however the blind writes are placed.',
      narration: 'In every one of them the two counts are equal. Two of three, two of six, eight of twenty. No schedule separates the classes.',
      keyword: 'the two counts agree'
    },
    {
      id: 'e8c', scene: 'two', start: 225, end: 232.5,
      caption: '29 schedules, no separation. This page reports the enumeration; it does not prove the general case.',
      detail: 'Three plus six plus twenty is twenty-nine. What the page shows is that no counterexample appears in these families. Whether two transactions can ever separate the classes is a stronger statement, and this page does not claim to have proved it.',
      narration: 'Twenty-nine schedules, and not one separates the two classes. That is what the enumeration found. This page does not prove it always must be so.',
      keyword: 'no separation',
      trap: 'Do not generalise from an enumeration to a theorem. The honest claim is about the 29 schedules on this page.'
    },
    {
      id: 'e8d', scene: 'two', start: 232.5, end: 240,
      caption: 'The exam consequence: a view-serialisability question needs a blind write, and in practice three transactions.',
      detail: 'A question that offers two transactions and asks which schedules are view serialisable is therefore answered by the precedence graph alone, which is faster and safer than building tables.',
      narration: 'So in the exam: if the schedule has no blind write, the graph decides both questions. If it has a blind write and a cycle, only the table decides.',
      keyword: 'the graph decides both questions'
    },

    /* ---------- scene 9: the ladder ---------- */
    {
      id: 'e9a', scene: 'ladder', start: 240, end: 247.5,
      caption: 'Four classes, each strictly inside the one before: serial, conflict, view, final-state.',
      detail: 'Serial schedules sit inside the conflict-serialisable ones, which sit inside the view-serialisable ones, which sit inside the schedules whose final state matches some serial order. Each inclusion is strict, and this page exhibits a witness for each gap.',
      narration: 'Four classes, each one strictly bigger than the last. Serial, then conflict serialisable, then view serialisable, then final-state serialisable.',
      keyword: 'Four classes'
    },
    {
      id: 'e9b', scene: 'ladder', start: 247.5, end: 255,
      caption: 'Witnesses: r1 w1 w2 r2 of Y w3 of X w2 of Y w3 of Y is conflict but not serial; r1 w2 w1 w3 is view but not conflict; r1 r2 w1 w2 is final-state but not view.',
      detail: 'The first interleaves two transactions that touch different items, so its graph has no edge between them and it is conflict serialisable without being a serial order. The second is the witness of scene one. The third is the lost update: both transactions read the same old value, so the final state matches the serial order T1, T2 while the read-from relation does not.',
      narration: 'One witness for each gap. A conflict-serialisable schedule that is not serial. A view-serialisable schedule that is not conflict serialisable. And a schedule whose final state matches a serial order while its reads do not.',
      keyword: 'Witnesses'
    },
    {
      id: 'e9c', scene: 'ladder', start: 255, end: 262.5,
      caption: 'Testing conflict serialisability is a cycle check. Testing view serialisability is NP-complete.',
      detail: 'The precedence graph is built in time proportional to the pairs of operations and tested for a cycle in linear time. The general view test has no such procedure: deciding view serialisability of a schedule is NP-complete, which is the formal reason the weaker class is not used as a practical correctness criterion.',
      narration: 'Testing conflict serialisability is a cycle check. Testing view serialisability is NP-complete. That is why the weaker class is a definition, not a protocol.',
      keyword: 'NP-complete'
    },
    {
      id: 'e9d', scene: 'ladder', start: 262.5, end: 270,
      caption: 'Locking cannot produce every view-serialisable schedule, so real systems aim at conflict serialisability.',
      detail: 'A locking protocol that is sound produces only conflict-serialisable schedules, and the schedules it cannot produce are exactly the ones outside that class. So the view-serialisable schedules in the gap are not reachable by a correct locking scheduler at all.',
      narration: 'And locking cannot produce every view-serialisable schedule. The ones it loses are exactly the ones that are not conflict serialisable. So real systems aim at the conflict level.',
      keyword: 'real systems aim at conflict serialisability'
    },

    /* ---------- scene 10: the procedure ---------- */
    {
      id: 'e10a', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: write the schedule with one row per transaction, in execution order.',
      detail: 'Reading order across the page is execution order; each row is one transaction program. This layout makes both questions answerable: conflicts are found between columns, and blind writes are found along a row.',
      narration: 'Step one: write the schedule with one row per transaction, and read the page left to right as execution order.',
      keyword: 'one row per transaction'
    },
    {
      id: 'e10b', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step two: mark every write that has no earlier read of the same item in its own row.',
      detail: 'That is the definition of a blind write, and it is a property of one transaction, so it is read off a single row without looking at the rest of the schedule.',
      narration: 'Step two: mark the blind writes. A write with no earlier read of the same item in its own row.',
      keyword: 'mark the blind writes'
    },
    {
      id: 'e10c', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step three: with no blind write, the precedence graph decides both questions at once.',
      detail: 'The graph is acyclic exactly when the schedule is conflict serialisable, and with no blind write present that is also exactly when it is view serialisable, so one drawing answers both.',
      narration: 'Step three: if there is no blind write, draw the precedence graph. Acyclic means conflict serialisable, and that is also view serialisable.',
      keyword: 'the precedence graph decides'
    },
    {
      id: 'e10d', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Step four: otherwise build the read-from table and compare it with each serial order. Report the two verdicts separately.',
      detail: 'Two rows and six orders is a two-minute test by hand. Never answer a view question with the graph verdict, and never answer a conflict question with the table: they are different tests on the same schedule.',
      narration: 'Step four: otherwise build the read-from table, and compare it with each serial order. Then report the two verdicts separately, because they are different questions.',
      keyword: 'compare it with each serial order'
    }
  ]
};
