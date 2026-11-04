# View Serialisability and Blind Writes: the Read-From Table, the Gap Above Conflict Serialisability, and the Four-Class Ladder — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/view-serialisability-and-blind-writes/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The graph says no, and the schedule is still correct

*0:00 – 0:30 · objective: See a schedule whose precedence graph has a cycle yet whose outcome matches a serial order, and state why that is possible.*

**0:00–0:07** — Three transactions, one item. T1 reads X and then writes it. T2 writes X. T3 writes X. Four operations in total.

> Caption: Three transactions touch one item: T1 reads X then writes it, T2 writes X, T3 writes X.

**0:07–0:15** — The graph gets an edge from T1 to T2, because T1 read before T2 wrote. And an edge from T2 to T1, because T2 wrote before T1 wrote. Two edges, opposite directions.

> Caption: The precedence graph has two edges in opposite directions: T1 to T2, and T2 to T1.

Exam-trap caption mode adds: *A two-cycle is not a drawing mistake. Two conflicting pairs on one item really do pin the order in both directions.*

**0:15–0:22** — So the graph says not conflict serialisable. Now run it. X starts at one hundred. T1 reads one hundred and writes one fifty. T2 writes two hundred. T1 writes one fifty again. T3 writes three hundred.

> Caption: So it is not conflict serialisable. Run it with X at 100: read 100, write 150, write 200, write 150, write 300.

**0:22–0:30** — Run them one at a time, T1 then T2 then T3. T1 reads the initial value and writes one fifty, T2 writes two hundred, T3 writes three hundred. Final value three hundred. The same as before.

> Caption: Serial T1 then T2 then T3 also ends at 300 with T1 reading the initial value, so the schedule is equivalent to a serial one.

Exam-trap caption mode adds: *The graph can only ever say no to conflict serialisability. Reading that no as not serialisable is the commonest error in this topic.*

## Scene 2. Three observations are all that survive

*0:30 – 1:00 · objective: Name the three things a schedule leaves behind — who read the initial value, who each read took its value from, who wrote last — and see that an unread write changes none of them.*

**0:30–0:37** — What does a schedule leave behind? Three things. Who read the initial value. Who each read took its value from. And who wrote the last value of each item.

> Caption: A schedule leaves behind three things: who read the initial value, who each read took its value from, and who wrote last.

**0:37–0:45** — In our schedule, T1 read the initial value, and T3 wrote the last value. Those are the two facts.

> Caption: In the witness: T1 read the initial value, and T3 wrote the final value.

**0:45–0:52** — Now look at what T2 wrote: two hundred. Nobody ever read it. T1 wrote over it without reading it. A write that nobody reads is called dead.

> Caption: The 200 that T2 wrote was never read by anyone. A write nobody reads is called dead.

Exam-trap caption mode adds: *A dead write is not an error and not a lost update. It is invisible to every observation, which is why the graph can be too strict about it.*

**0:52–1:00** — Those three observations are called the view of the schedule. And because a dead write appears in none of them, it can move without changing the view.

> Caption: Those three observations are the view of the schedule, and a dead write can move without changing it.

## Scene 3. View equivalence, and the two dummy transactions

*1:00 – 1:30 · objective: State view equivalence, collapse the three observations into one read-from relation using T_init and T_final, and read the table of the witness.*

**1:00–1:07** — So here is the definition. Two schedules are view equivalent when all three observations agree: the same initial reads, the same read-from pairs, the same final writes.

> Caption: Two schedules are view equivalent when all three observations agree.

**1:07–1:15** — Now the trick that makes this testable. Put a transaction at the very start that writes every item, and one at the very end that reads every item. Then all three conditions become one relation.

> Caption: Add a transaction T_init that writes every item at the start, and T_final that reads every item at the end.

**1:15–1:22** — Two schedules are view equivalent exactly when their read-from relations are identical. And a schedule is view serialisable when at least one serial order has the same relation.

> Caption: View equivalent exactly when the read-from relation is identical. View serialisable when some serial order matches it.

**1:22–1:30** — For our witness the table has two rows. T1 read X from the initial transaction, and the final transaction read X from T3. That is the whole table.

> Caption: The witness has two rows: T1 read X from T_init, and T_final read X from T3.

## Scene 4. The witness, one operation at a time

*1:30 – 2:00 · objective: Run the four operations with real values, and see which write is dead and why the final value matches the serial order T1, T2, T3.*

**1:30–1:37** — Let X start at one hundred. T1 reads it, so T1 has one hundred in its own buffer.

> Caption: X starts at 100. T1 reads 100.

**1:37–1:45** — T2 writes two hundred into X. T2 never read X, so this is a blind write.

> Caption: T2 writes 200 into X.

**1:45–1:52** — T1 now writes one fifty. It computed that from the one hundred it read earlier, not from the two hundred sitting in X. So the two hundred is gone, and nobody ever saw it.

> Caption: T1 writes 150, computed from the 100 it read. The 200 is now dead.

**1:52–2:00** — T3 writes three hundred. Final value three hundred. And the serial order T1, T2, T3 gives the same three observations: T1 reads the initial value, T3 writes last, final value three hundred.

> Caption: T3 writes 300. Final value 300, and serial T1, T2, T3 produces the same three observations.

## Scene 5. Match the table against every serial order

*2:00 – 2:30 · objective: Build the read-from table of all six serial orders and find which one the witness matches — the test that replaces the precedence graph.*

**2:00–2:07** — Three transactions give six serial orders. Build the table for each one, and compare it with the schedule table.

> Caption: Three transactions give six serial orders. Compare the read-from table with each one.

**2:07–2:15** — The final-write row is easy: whichever transaction runs last writes last. So an order ending in T3 has T3 as the final writer, and one ending in T2 has T2.

> Caption: The last transaction in a serial order writes last, so the final-write row names it immediately.

**2:15–2:22** — Only the order T1 then T2 then T3 has T1 reading the initial value and T3 writing last. Two rows agree, so the schedule is view serialisable, equivalent to T1, T2, T3.

> Caption: Only T1, T2, T3 has T1 reading the initial value and T3 writing last. That is the match.

**2:22–2:30** — One match is enough. The definition asks for at least one serial order, and it does not have to be the order the operations look like.

> Caption: A match is enough. The definition asks for one serial order, not for the order the operations look like.

## Scene 6. All twelve interleavings of this family

*2:30 – 3:00 · objective: Classify every interleaving of the three-transaction family: six conflict serialisable, ten view serialisable, four in the gap, two in neither class.*

**2:30–2:37** — Now enumerate. Four operations, two of them from T1 in a fixed order, one each from the other two. That is twelve interleavings.

> Caption: Four operations with two from T1 and one each from T2 and T3 give twelve interleavings.

**2:37–2:45** — Six of the twelve are conflict serialisable. In this family those six are exactly the serial orders themselves.

> Caption: Six are conflict serialisable, and here they are exactly the six serial orders.

**2:45–2:52** — Ten are view serialisable. So four of them have a cycle in the precedence graph and are still correct.

> Caption: Ten are view serialisable, so four have a cycle and are still correct.

Exam-trap caption mode adds: *Counting the view-serialisable ones by counting the acyclic graphs gives ten minus four, which is the wrong answer in both directions.*

**2:52–3:00** — The last two are in neither class. T1 writes last, but it computed that value from the initial one hundred. So the final value is one fifty, and no serial order gives one fifty.

> Caption: The other two are in neither class: T1 writes last but computed from the initial value.

## Scene 7. A blind write is necessary, and not sufficient

*3:00 – 3:30 · objective: Define a blind write, then check the necessity claim against three larger families: 45 schedules sit in the gap and every one contains a blind write.*

**3:00–3:07** — A blind write is a write that its own transaction never read that item before. Here T2 and T3 write blind. T1 does not, because it read X first.

> Caption: A blind write is a write with no earlier read of the same item in its own transaction.

**3:07–3:15** — Two bigger families. Two hundred and ten interleavings give fifty-four conflict serialisable and seventy-one view serialisable. Five hundred and sixty give eighty-six and one hundred and ten.

> Caption: Two larger families: 210 interleavings give 54 conflict and 71 view; 560 give 86 and 110.

**3:15–3:22** — Add them up: four, seventeen, twenty-four. Forty-five schedules are view serialisable but not conflict serialisable. Every single one contains a blind write.

> Caption: Across the three families, 45 schedules sit in the gap, and every one contains a blind write.

**3:22–3:30** — And when there is no blind write anywhere, the two classes coincide. Ninety interleavings, thirty conflict serialisable, thirty view serialisable.

> Caption: With no blind write at all the two classes coincide: 90 interleavings, 30 and 30.

## Scene 8. Two transactions never separate

*3:30 – 4:00 · objective: Report what the enumeration finds for three two-transaction families — 29 schedules, no separation — and state the limit of that finding.*

**3:30–3:37** — Now the two-transaction case. Three families: three interleavings, six interleavings, twenty interleavings.

> Caption: Three two-transaction families: 3, 6 and 20 interleavings.

**3:37–3:45** — In every one of them the two counts are equal. Two of three, two of six, eight of twenty. No schedule separates the classes.

> Caption: In each family the two counts agree: 2 of 3, 2 of 6, 8 of 20.

**3:45–3:52** — Twenty-nine schedules, and not one separates the two classes. That is what the enumeration found. This page does not prove it always must be so.

> Caption: 29 schedules, no separation. This page reports the enumeration; it does not prove the general case.

Exam-trap caption mode adds: *Do not generalise from an enumeration to a theorem. The honest claim is about the 29 schedules on this page.*

**3:52–4:00** — So in the exam: if the schedule has no blind write, the graph decides both questions. If it has a blind write and a cycle, only the table decides.

> Caption: The exam consequence: a view-serialisability question needs a blind write, and in practice three transactions.

## Scene 9. The ladder, and why systems stop at conflict

*4:00 – 4:30 · objective: Place serial, conflict, view and final-state serialisability in one chain with a witness for each gap, and explain why protocols aim at the conflict level.*

**4:00–4:07** — Four classes, each one strictly bigger than the last. Serial, then conflict serialisable, then view serialisable, then final-state serialisable.

> Caption: Four classes, each strictly inside the one before: serial, conflict, view, final-state.

**4:07–4:15** — One witness for each gap. A conflict-serialisable schedule that is not serial. A view-serialisable schedule that is not conflict serialisable. And a schedule whose final state matches a serial order while its reads do not.

> Caption: Witnesses: r1 w1 w2 r2 of Y w3 of X w2 of Y w3 of Y is conflict but not serial; r1 w2 w1 w3 is view but not conflict; r1 r2 w1 w2 is final-state but not view.

**4:15–4:22** — Testing conflict serialisability is a cycle check. Testing view serialisability is NP-complete. That is why the weaker class is a definition, not a protocol.

> Caption: Testing conflict serialisability is a cycle check. Testing view serialisability is NP-complete.

**4:22–4:30** — And locking cannot produce every view-serialisable schedule. The ones it loses are exactly the ones that are not conflict serialisable. So real systems aim at the conflict level.

> Caption: Locking cannot produce every view-serialisable schedule, so real systems aim at conflict serialisability.

## Scene 10. The procedure for any question

*4:30 – 5:00 · objective: Fix the four steps that answer a view-serialisability question without guessing, and name the slips that cost a mark.*

**4:30–4:37** — Step one: write the schedule with one row per transaction, and read the page left to right as execution order.

> Caption: Step one: write the schedule with one row per transaction, in execution order.

**4:37–4:45** — Step two: mark the blind writes. A write with no earlier read of the same item in its own row.

> Caption: Step two: mark every write that has no earlier read of the same item in its own row.

**4:45–4:52** — Step three: if there is no blind write, draw the precedence graph. Acyclic means conflict serialisable, and that is also view serialisable.

> Caption: Step three: with no blind write, the precedence graph decides both questions at once.

**4:52–5:00** — Step four: otherwise build the read-from table, and compare it with each serial order. Then report the two verdicts separately, because they are different questions.

> Caption: Step four: otherwise build the read-from table and compare it with each serial order. Report the two verdicts separately.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
