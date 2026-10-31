# Database recovery: the log, the undo and redo lists, the two orders, and the checkpoint's active list — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/database-recovery-undo-redo/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A crash between two writes, and why the log exists

*0:00 – 0:30 · objective: See atomicity break: transaction T1 moves 40 from item x to item y, the crash lands after the first write, and the sum of the two items changes from 150 to 110. Recovery has to undo that half-finished work using only what is on stable storage.*

**0:00–0:07** — One transaction moves forty from item x to item y. Item x goes from one hundred to sixty. Item y goes from fifty to ninety. Both writes belong to the same transaction.

> Caption: T1 moves 40 from item x to item y: x goes 100 to 60, y goes 50 to 90.

**0:07–0:15** — Now the machine dies after the first write and before the second. Item x has lost forty. Item y never received it. The sum of the two items is now one hundred and ten.

> Caption: The crash lands between the two writes: x has lost 40, y never received it.

Exam-trap caption mode adds: *The database is not "half correct". It is inconsistent: a total that must be 150 now reads 110.*

**0:15–0:22** — Atomicity is the promise that either both writes survive or neither does. To keep that promise the system cannot rely on the data pages, which may already hold a half-finished value. It relies on a separate file: the log.

> Caption: Atomicity says both writes survive or neither does. The log is what makes that possible.

**0:22–0:30** — Recovery reads that log after the crash and puts every item back to the value that the committed transactions alone would have produced. That is the whole subject of this lesson: which records to replay, in which direction, and in which order.

> Caption: Recovery reads the log and rebuilds the state that the committed transactions alone define.

## Scene 2. Write-ahead logging: the record lands before the page

*0:30 – 1:00 · objective: Follow one change through four places — the transaction, the log buffer, the log on stable storage, the data page — and see why the log record must reach disk first, which is what makes both undo and redo possible.*

**0:30–0:37** — Every change is written twice. Once as a log record, which is small and sequential. Once as a data page, which is large and scattered. The two copies are what let recovery work.

> Caption: Every change is written twice: a log record first, then the data page.

**0:37–0:45** — The rule is write-ahead logging. The log record must reach stable storage before the data page it describes reaches the data file. Log first, page second, always.

> Caption: Write-ahead logging: the log record reaches stable storage before the page it describes.

Exam-trap caption mode adds: *Writing the log to a buffer is not enough. The record must be forced to stable storage; a buffered record dies with the machine.*

**0:45–0:52** — At the moment of the crash, a page holding a committed change may still be in memory and never reach the disk. The log knows the new value, so recovery can write it again. That direction is called redo.

> Caption: A committed page may still be in memory at the crash. That is why redo exists.

**0:52–1:00** — The opposite also happens. To keep memory free, the system may flush a page belonging to a transaction that has not committed. The disk then holds a value that must not survive. The log knows the old value, so recovery can put it back. That direction is called undo.

> Caption: An uncommitted page may have been flushed early. That is why undo exists.

Exam-trap caption mode adds: *Both directions exist because both accidents are possible. A system that only ever redid would keep the work of a transaction that never committed.*

## Scene 3. Five record types, and why a write record keeps two values

*1:00 – 1:30 · objective: Read a log: start, write with old and new value, commit, abort, and checkpoint with its active-transaction list. Undo needs the old value, redo needs the new one, and an LSN orders both.*

**1:00–1:07** — The log holds five kinds of record. A start record, which opens a transaction. A write record. A commit record. An abort record. And a checkpoint record.

> Caption: Five record types carry everything recovery needs.

**1:07–1:15** — A write record is the important one. It keeps both the old value and the new value. Undo needs the old value, because undo puts the item back. Redo needs the new value, because redo puts the change in again. A log that kept only one of them could not support both directions.

> Caption: A write record keeps both values: old 100, new 60. Undo needs old, redo needs new.

Exam-trap caption mode adds: *The pair is old then new. Reading it the other way round inverts every answer you compute from it.*

**1:15–1:22** — A checkpoint record names the transactions that were active at that instant: started, and not yet committed or aborted. Here that list holds only T1. That small list is what lets recovery start reading from the checkpoint instead of from the beginning of time.

> Caption: The checkpoint record names the transactions still running at that instant.

**1:22–1:30** — Every record carries an LSN, its position in the log. Redo walks the records in increasing LSN, oldest first. Undo walks them in decreasing LSN, newest first. The next scenes show why those directions are forced.

> Caption: An LSN orders the replay; without it, undo has no notion of newest first.

## Scene 4. Building the undo list and the redo list

*1:30 – 2:00 · objective: Scan a four-record log with a crash at the end and split the transactions: a start puts a transaction in the undo list, a commit moves it to the redo list. The two lists end disjoint — undo holds T1, redo holds T2.*

**1:30–1:37** — Here is a small log with no checkpoint in it. T1 starts and writes x from one hundred to sixty. T2 starts, writes z from ten to twenty, and commits. Then T1 writes y from fifty to ninety. Then the crash.

> Caption: One log, two transactions, a crash at the end, and no checkpoint.

**1:37–1:45** — Recovery walks the log and keeps two lists. The moment it sees a start record, that transaction is presumed to need undoing, so it goes into the undo list. Nothing is known yet about how it ends.

> Caption: A start record puts its transaction in the undo list.

**1:45–1:52** — A commit record is the only thing that moves a transaction. It leaves the undo list and joins the redo list. A transaction with no commit record stays where the start record put it.

> Caption: A commit record moves the transaction from the undo list to the redo list.

Exam-trap caption mode adds: *A commit record does not empty the undo list. It moves exactly one transaction, the one it names.*

**1:52–2:00** — At the crash the undo list holds T1 and the redo list holds T2. The lists are disjoint by construction: every record either has a commit or it does not. That disjointness is the first property to check on any answer you compute.

> Caption: The result: undo T1, redo T2. The two lists never share a transaction.

## Scene 5. Redo forward, undo backward: the state the committed work defines

*2:00 – 2:30 · objective: Take the disk state at the crash — x holding 60, a value no committed transaction ever wrote — and recover it: redo the new value of the redo list in ascending LSN, undo the old value of the undo list in descending LSN, and reach 100, 50, 20, which is exactly the initial state with only the committed transaction applied.*

**2:00–2:07** — Here is what the disk holds at the crash. x is sixty, because T1's page was flushed early. y is still fifty, because T1's second write never reached a page. z is ten, because T2's page is still in memory. Only one of those three values is wrong, and it is the one written by the transaction that never committed.

> Caption: The disk at the crash is not the truth: x holds 60, written by a transaction that never committed.

**2:07–2:15** — Redo walks the log from oldest to newest and applies the new value of every write record whose transaction is in the redo list. T2's write sets z to twenty. Only one record is redone here.

> Caption: Redo walks forward: apply the new value of every write in the redo list.

**2:15–2:22** — Undo walks the log from newest to oldest and applies the old value of every write record whose transaction is in the undo list. T1's write to y sets y to fifty, which it already is, so that step changes nothing. Then T1's write to x sets x back to one hundred. Two records undone, one of them a no-op.

> Caption: Undo walks backward: apply the old value of every write in the undo list.

Exam-trap caption mode adds: *A no-op undo is still counted in the work done. Questions about "how many undo operations" count records, not changes.*

**2:22–2:30** — The recovered state is x one hundred, y fifty, z twenty. That is exactly the initial state with only T2's committed write applied. The recovered state and the committed-only state agree on all three items, which is the property every recovery algorithm must satisfy.

> Caption: The result equals the initial state with only the committed transaction applied.

## Scene 6. Force or no-force, steal or no-steal: which of undo and redo you need

*2:30 – 3:00 · objective: Place the two buffer decisions on one grid. No-force means a committed change may be missing from disk, so redo is needed. Steal means an uncommitted change may be on disk, so undo is needed. Deferred modification is the no-steal corner; immediate modification is the steal corner.*

**2:30–2:37** — Whether a system needs undo, or redo, or both, is not a matter of taste. It follows from two decisions about when pages are written to disk.

> Caption: Two buffer decisions decide which of undo and redo you need.

**2:37–2:45** — First decision: at commit, are the transaction's pages forced to disk? If they are, the policy is called force, and a committed change is certainly on disk. If they are not, the policy is no-force, and a committed change may exist only in memory. No-force needs redo.

> Caption: Force or no-force: are pages flushed at commit? No-force means a committed change may be missing, so redo.

Exam-trap caption mode adds: *Force removes the need for redo but does not remove redo from the log. The records are still written.*

**2:45–2:52** — Second decision: may the system flush a page belonging to a transaction that has not committed? If it may, the policy is steal, and an uncommitted value can be on disk. Steal needs undo. If it may not, the policy is no-steal, and nothing uncommitted ever reaches the disk.

> Caption: Steal or no-steal: may an uncommitted page be flushed? Steal means a dirty value may be on disk, so undo.

**2:52–3:00** — Put the two decisions together and the four corners name the classic schemes. No-steal with force needs neither direction. No-steal without force needs only redo, and that is deferred modification. Steal without force needs both, and that is immediate modification. Force with steal needs only undo.

> Caption: Deferred modification is the no-steal corner: only redo. Immediate modification is steal: both.

Exam-trap caption mode adds: *Deferred modification does not mean the log is unnecessary. It means the undo list is built and every undo it contains turns out to be a no-op.*

## Scene 7. Why undo runs backwards and redo runs forwards

*3:00 – 3:30 · objective: One uncommitted transaction writes x twice, 0 to 5 and 5 to 9. Undoing in forward order leaves 5, a value no committed transaction wrote; undoing in reverse order leaves 0. The order is part of the algorithm, not a detail.*

**3:00–3:07** — Here is the smallest log that shows why order matters. T1 writes x from zero to five. Then T1 writes x again, from five to nine. Then the crash, with no commit. T1 is in the undo list.

> Caption: One transaction writes x twice, 0 to 5 and 5 to 9, and never commits.

**3:07–3:15** — Suppose undo walked the log forwards. It applies the old value of the first record, giving zero. Then it applies the old value of the second record, giving five. The database now holds five, which is the intermediate value of a transaction that never committed.

> Caption: Undo in forward order leaves 5, a value that no committed transaction ever wrote.

Exam-trap caption mode adds: *This is the one wrong answer that looks right, because both values it applies really are old values from the log.*

**3:15–3:22** — Undo walks the log backwards. It applies the old value of the second record first, giving five. Then the old value of the first record, giving zero. Zero is the value before the transaction began, which is what undo must restore.

> Caption: Undo in reverse order leaves 0, the value before the transaction began.

**3:22–3:30** — The rule is symmetric and easy to remember: undo runs newest record first, redo runs oldest record first. Reverse the redo order on a committed transaction that wrote the same item twice, and you get five instead of nine. Both directions are ordered by LSN, and both orders are forced.

> Caption: Undo newest first, redo oldest first. Reversing either gives a value nothing wrote.

## Scene 8. The checkpoint: the active list, and the work it saves

*3:30 – 4:00 · objective: Work the GATE CSE 2015 Set 2 log. The checkpoint record names T1, the only transaction active then, so T1 is undone even though it started before the checkpoint. T4 committed before it, so T4 needs no redo. Undo is T1 and T3; redo is T2; five records are read instead of eleven.*

**3:30–3:37** — A checkpoint does two things at one instant. It forces every dirty page to disk, so the database on disk is consistent up to that point. And it writes a record naming the transactions that are still running. After that, recovery need not read the log from the beginning.

> Caption: A checkpoint forces every dirty page and records which transactions are still running.

**3:37–3:45** — Look at the log. T4 wrote y from two to three, and committed, and then the checkpoint forced its page. So T4 needs no redo at all, even though its commit record is in the log. Reading back only as far as the checkpoint is exactly what excludes it.

> Caption: T4 committed before the checkpoint, so its page is already on disk and T4 needs no redo.

Exam-trap caption mode adds: *"Committed, therefore redo" is wrong once a checkpoint is in the log. The question is whether the page was forced after the commit.*

**3:45–3:52** — Now the trap in the other direction. T1 started before the checkpoint and never committed. A reader that stops at the checkpoint would never see T1's start record. That is why the checkpoint record carries the active list: T1 is named in it, so T1 goes into the undo list, and its write to z is undone.

> Caption: T1 started before the checkpoint and never committed: the active list puts it back in undo.

Exam-trap caption mode adds: *A transaction that started before the checkpoint can still be the whole answer. Read the active list before you read anything else.*

**3:52–4:00** — So the lists are: undo T1 and T3, redo T2. Replaying them gives x nine, y three, z five, which is the initial state with only T4 and T2 applied. And the reader looked at five records instead of eleven. This is the GATE CSE 2015 Set 2 question, and its official key is exactly these two lists.

> Caption: Reading back only to the checkpoint: undo T1 and T3, redo T2. Five records instead of eleven.

## Scene 9. Crashing again during recovery, and why it still works

*4:00 – 4:30 · objective: Recover twice from the same log. The log has not changed, so the same two lists are rebuilt and the same records replayed; redo and undo are idempotent, so the state after the second pass equals the state after the first. This is the GATE CSE 2021 Set 1 question.*

**4:00–4:07** — Recovery takes time, and during that time the machine can crash again. The question is whether the second crash makes things worse. It does not, and the reason is worth knowing precisely.

> Caption: What if the machine crashes again while it is recovering?

**4:07–4:15** — Nothing in the log has changed, because recovery does not remove records and no checkpoint is taken during it. So the second recovery rebuilds exactly the same undo and redo lists from exactly the same records, and replays them from the start.

> Caption: The log has not changed, so the same two lists are rebuilt and the same records replayed.

**4:15–4:22** — The reason a repeat is harmless is idempotence. Redo sets an item to the new value; doing it twice leaves the new value. Undo sets an item to the old value; doing it twice leaves the old value. Neither operation accumulates.

> Caption: Redo and undo are idempotent: applying a record twice leaves the value it sets.

Exam-trap caption mode adds: *Idempotence applies per record, in the right order. Applying two records of the same transaction in the wrong order is not idempotent; it is simply wrong.*

**4:22–4:30** — GATE CSE 2021 Set 1 asked this exact question, with checkpointing excluded during the transactions and during recovery. The official key is the statement that the same undo and redo list will be used while recovering again. The lesson recomputes the state after a second pass and finds it unchanged.

> Caption: GATE CSE 2021 Set 1 asked this, and the official key is the same undo and redo list.

## Scene 10. The five-step procedure and the boundary it assumes

*4:30 – 5:00 · objective: Fix the decision procedure: last checkpoint, its active list, scan to the crash, split the lists, replay redo ascending and undo descending, then compare with the committed-only state. Name the assumption a sharp checkpoint makes, and what a fuzzy checkpoint costs.*

**4:30–4:37** — Here is the procedure to apply to any log in an exam. One: find the last checkpoint. Two: copy its active list into the undo list. Three: read the records from there to the crash. Four: a start joins undo, a commit moves its transaction to redo, an abort removes it from both. Five: replay redo ascending, then undo descending.

> Caption: Five steps: last checkpoint, its active list, scan to the crash, split the lists, replay.

**4:37–4:45** — Then check the answer two ways. The two lists must not share a transaction. And the recovered state must equal the initial state with exactly the committed transactions applied. Both checks are cheap, and either one catches most errors before the exam does.

> Caption: Then check your answer: recovered state equals the committed-only state, and the lists are disjoint.

Exam-trap caption mode adds: *A list that looks plausible can still be wrong. The committed-only comparison catches an undo that was omitted, which no amount of staring at the log will.*

**4:45–4:52** — One assumption sits under the whole procedure: the checkpoint forced the pages. A fuzzy checkpoint lets transactions keep writing while it runs and does not force every page. Then a transaction that committed before the checkpoint may still be missing from the disk, so you must read back to the oldest transaction that was active and redo more work. On the 2015 log that grows the redo list from one transaction to two.

> Caption: Boundary: a fuzzy checkpoint does not force pages, so you must read back further and redo more.

**4:52–5:00** — The one line to keep: the log holds the old value and the new value of every change, so recovery can always rebuild the state that the committed transactions alone define. Undo newest first, redo oldest first, and check against the committed-only state.

> Caption: One line: the log holds both values, so recovery can always rebuild the committed state.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
