# Journaling File Systems — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/journaling-file-systems/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One operation is four disk writes

*0:00 – 0:30 · objective: See that a single logical operation is several independent block writes, and read the ten crash points of a three-transaction workload without a journal.*

**0:00–0:07** — Creating one file is four separate disk writes. The power can fail between any two of them.

> Caption: Creating one file is four separate disk writes, and the power can fail between any two of them.

Exam-trap caption mode adds: *A file creation is atomic in the API and not on the disk. The atomicity is what a journal has to supply.*

**0:07–0:15** — Ten crash points: one before any write, then one after each of the nine in-place writes.

> Caption: Ten crash points: one before any write, then one after each of the nine in-place writes.

Exam-trap caption mode adds: *The number of crash points is the number of writes plus one, not the number of transactions.*

**0:15–0:22** — Six of the ten leave a disk that no longer makes sense. Three break metadata, three break the bytes.

> Caption: Six of the ten leave a disk that no longer makes sense. Three break metadata, three break the bytes.

Exam-trap caption mode adds: *A leaked block is not corruption yet, but it is space that will never come back without a full check.*

**0:22–0:30** — Only one crash point out of ten leaves all three operations complete and correct.

> Caption: Only one crash point out of ten leaves all three operations complete and correct.

Exam-trap caption mode adds: *Running the check on every boot makes the repair time a function of disk size — the thing journaling was invented to remove.*

## Scene 2. The write-ahead rule

*0:30 – 1:00 · objective: Name the four phases of a journaled transaction — log the images, commit, overwrite in place, free the log space — and identify the commit record as the single point that makes the transaction atomic.*

**0:30–0:37** — The write-ahead rule: log the new image of every block, and never overwrite a home block first.

> Caption: The write-ahead rule: log the new image of every block, and never overwrite a home block first.

Exam-trap caption mode adds: *A journal of deltas would need a different recovery algorithm. ext3 and ext4 store images, which is why replay is a plain copy.*

**0:37–0:45** — The commit record is one block, and it is the atomic point of the whole transaction.

> Caption: The commit record is one block, and it is the atomic point of the whole transaction.

Exam-trap caption mode adds: *Without a commit record a journal can only tell what was written, never whether it was meant to be.*

**0:45–0:52** — Then the images are copied home, and only then is the log space freed.

> Caption: Then the images are copied home, and only then is the log space freed.

Exam-trap caption mode adds: *Freeing the log entry before the in-place write completes destroys the only copy of the new image.*

**0:52–1:00** — So a crash gives recovery exactly two choices: the transaction happened, or it did not.

> Caption: So a crash gives recovery exactly two choices: the transaction happened, or it did not.

Exam-trap caption mode adds: *Atomicity says nothing about whether the values written were correct. A wrong value replays just as faithfully.*

## Scene 3. Crash at every write point

*1:00 – 1:30 · objective: Compare four commit disciplines on 88 recovered images, separating metadata invariants from the bytes, and see which discipline removes which column.*

**1:00–1:07** — The same three transactions, four commit disciplines, and a crash at every single write point.

> Caption: The same three transactions, four commit disciplines, and a crash at every single write point.

Exam-trap caption mode adds: *Comparing disciplines on one crash point proves nothing. The whole point is the worst point, not a typical one.*

**1:07–1:15** — Without a journal, six of the ten crash points are broken: three metadata, three bytes.

> Caption: Without a journal, six of the ten crash points are broken: three metadata, three bytes.

Exam-trap caption mode adds: *Ordering the writes better reduces the failures. It never removes them, because any order leaves a boundary.*

**1:15–1:22** — Metadata-only journaling fixes every metadata invariant, at all twenty-five crash points.

> Caption: Metadata-only journaling fixes every metadata invariant — at all twenty-five crash points, both orders.

Exam-trap caption mode adds: *A clean metadata table is not a clean file system. The next scene is the column that stays red.*

**1:22–1:30** — But writeback still exposes stale bytes at seven crash points, and ordered exposes none.

> Caption: But writeback still exposes stale bytes at seven crash points, and ordered exposes none.

Exam-trap caption mode adds: *Writeback is not a broken mode. It trades data integrity for throughput, and the documentation says so.*

## Scene 4. Recovery is replay

*1:30 – 2:00 · objective: Recover a crashed image in three passes, discard a transaction that never committed, and see why replay is idempotent and costs the log rather than the disk.*

**1:30–1:37** — Recovery is three passes: find the end of the log, find the last commit, redo the images.

> Caption: Recovery is three passes: find the end of the log, find the last commit, redo the images.

Exam-trap caption mode adds: *A redo-only journal cannot roll back a transaction that was already in place. That is why nothing is written in place before the commit.*

**1:37–1:45** — A transaction that never committed is discarded, and the image equals the last committed state.

> Caption: A transaction that never committed is discarded, and the image equals the last committed state.

Exam-trap caption mode adds: *Discarding is not undoing. The blocks were never overwritten, so there is nothing to undo.*

**1:45–1:52** — Replay is idempotent: doing it twice leaves exactly the image doing it once leaves.

> Caption: Replay is idempotent: doing it twice leaves exactly the image doing it once leaves.

Exam-trap caption mode adds: *An undo log is not idempotent in the same way. Redo of images is; that is a reason to prefer images.*

**1:52–2:00** — And recovery reads the log, not the disk: sixty-four blocks instead of two hundred sixty-two thousand.

> Caption: And recovery reads the log, not the disk: sixty-four blocks instead of two hundred sixty-two thousand.

Exam-trap caption mode adds: *The repair cost is now a property of the journal size, which the administrator chooses, not of the disk.*

## Scene 5. What the log costs

*2:00 – 2:30 · objective: Count the write amplification 2m + 3 for m metadata blocks, and bound a circular journal by its capacity and by the largest transaction that must fit in it.*

**2:00–2:07** — For m metadata blocks a journaled transaction costs 2m plus 3 block writes instead of m.

> Caption: For m metadata blocks a journaled transaction costs 2m + 3 block writes instead of m.

Exam-trap caption mode adds: *The +3 is constant, so the ratio falls towards 2. Quoting a ratio without saying m is meaningless.*

**2:07–2:15** — The log writes each block twice, and it writes it sequentially into one contiguous file.

> Caption: The log writes each block twice, and it writes it sequentially into one contiguous file.

Exam-trap caption mode adds: *A journal is not a second copy of the disk. It is a small buffer, reused in a circle.*

**2:15–2:22** — A sixty-four block journal holds sixteen transactions of two metadata blocks each.

> Caption: A sixty-four block journal holds sixteen transactions of two metadata blocks each.

Exam-trap caption mode adds: *The journal bounds replay time and it also bounds how long a writer may be stalled.*

**2:22–2:30** — One transaction must fit whole, so a sixty-four block journal takes at most sixty-two metadata blocks.

> Caption: One transaction must fit whole, so a sixty-four block journal takes at most sixty-two metadata blocks.

Exam-trap caption mode adds: *A journal too small for one transaction is a design error, and it shows up as an immediate stall, not slow performance.*

## Scene 6. Three commit orders

*2:30 – 3:00 · objective: Place the data block relative to the commit record in data=journal, data=ordered and data=writeback, and say which promise each one keeps.*

**2:30–2:37** — All three ext4 data modes journal the metadata. They differ only in where the data block sits.

> Caption: All three ext4 data modes journal the metadata. They differ only in where the data block sits.

Exam-trap caption mode adds: *There is no mode in which the metadata is not journaled. The option chooses the treatment of file data.*

**2:37–2:45** — Full data journaling protects the bytes, and costs two writes per data block as well.

> Caption: Full data journaling protects the bytes, and costs two writes per data block as well.

Exam-trap caption mode adds: *Journaling data does not make writes faster. It removes a class of after-crash surprises at a real cost.*

**2:45–2:52** — Ordered mode adds one rule: the data reaches its home block before the commit record does.

> Caption: Ordered mode adds one rule: the data reaches its home block before the commit record does.

Exam-trap caption mode adds: *Ordered is not a stronger journal. It is the same journal plus a barrier.*

**2:52–3:00** — Writeback commits earlier: write point four instead of six for the first transaction.

> Caption: Writeback commits earlier — write point four instead of six for the first transaction.

Exam-trap caption mode adds: *A commit record is durable metadata. It is not evidence that the bytes it describes have reached the platter.*

## Scene 7. Six orders, three unsafe

*3:00 – 3:30 · objective: Enumerate every order of one transaction's three in-place writes and count the orders in which a file can read bytes it never wrote.*

**3:00–3:07** — One transaction, three in-place writes, six possible orders, and the order decides everything.

> Caption: One transaction, three in-place writes, six possible orders — and the order decides everything.

Exam-trap caption mode adds: *The journal orders the log, not the home blocks. What orders the home blocks is the mode.*

**3:07–3:15** — Three of the six are unsafe, and they are exactly the ones that write the inode before the data.

> Caption: Three of the six are unsafe, and they are exactly the ones that write the inode before the data.

Exam-trap caption mode adds: *The failure is silent. Nothing is corrupt by any metadata test; the file simply reads the wrong bytes.*

**3:15–3:22** — On the whole workload, writeback exposes stale bytes at seven of its twenty-five crash points.

> Caption: On the whole workload, writeback exposes stale bytes at seven of its twenty-five crash points.

Exam-trap caption mode adds: *A test that mounts the filesystem and lists the files will pass. Reading them will not.*

**3:22–3:30** — Writeback is durable at five crash points and intact at only two. Ordered makes the two coincide.

> Caption: Writeback is durable at five crash points and intact at only two. Ordered makes the two coincide.

Exam-trap caption mode adds: *"The transaction committed" answers a durability question and never an integrity one.*

## Scene 8. Four things it does not do

*3:30 – 4:00 · objective: State exactly what atomicity guarantees, and the four claims about journaling that are false.*

**3:30–3:37** — A journal is not a backup. It undoes half-done work, never wrong work.

> Caption: A journal is not a backup. It undoes half-done work, never wrong work.

Exam-trap caption mode adds: *Atomicity is about whether the transaction happened, not about whether it was the right transaction.*

**3:37–3:45** — It does not check your data. It never compares a block with what it should contain.

> Caption: It does not check your data. It never compares a block with what it should contain.

Exam-trap caption mode adds: *A consistent file system can hold a thoroughly wrong file. Those are independent properties.*

**3:45–3:52** — It does not survive a broken log. A media error leaves nothing to replay.

> Caption: It does not survive a broken log. A media error leaves nothing to replay.

Exam-trap caption mode adds: *Journaling removes the full check from the normal boot path. It does not remove the tool.*

**3:52–4:00** — And it is not free: seven writes instead of two at two metadata blocks, plus a periodic flush.

> Caption: And it is not free: seven writes instead of two at two metadata blocks, plus a periodic flush.

Exam-trap caption mode adds: *A commit interval is a durability window, not a corruption window. Losing recent work and damaging the file system are different events.*

## Scene 9. Five question shapes

*4:00 – 4:30 · objective: Recognise the three kinds of journaling question — a count, an order, a state — and the mechanical procedure each one needs.*

**4:00–4:07** — Shape one: how many block writes does this operation cost? Count 2m plus 3, or m without a journal.

> Caption: Shape one: how many block writes does this operation cost? Count 2m + 3, or m without a journal.

Exam-trap caption mode adds: *Counting one descriptor per block instead of one per transaction is the standard error here.*

**4:07–4:15** — Shape two: how many blocks does recovery read? The log, not the disk.

> Caption: Shape two: how many blocks does recovery read? The log, not the disk.

Exam-trap caption mode adds: *Replay cost depends on the journal, which is why a big disk no longer means a long boot.*

**4:15–4:22** — Shape three: which ordering rule is safe? The one that puts the data block before the commit.

> Caption: Shape three: which ordering rule is safe? The one that puts the data block before the commit.

Exam-trap caption mode adds: *The safe rule is about the commit, not about the in-place order. Once committed, the in-place order is irrelevant.*

**4:22–4:30** — Shape four: what does the commit record make atomic? Shape five: what does this crash point leave?

> Caption: Shape four: what does the commit record make atomic? Shape five: what does this crash point leave?

Exam-trap caption mode adds: *A crash-point question that is answered by intuition is usually answered wrongly. Run the order.*

## Scene 10. Four traps

*4:30 – 5:00 · objective: Separate a journal from a log-structured file system, a commit from durability, replay from a repair, and the boot path from the consistency check.*

**4:30–4:37** — Trap one: a journaling file system is not a log-structured file system.

> Caption: Trap one: a journaling file system is not a log-structured file system.

Exam-trap caption mode adds: *Both write sequentially. Only one of them keeps the old block positions, and that one is the journal.*

**4:37–4:45** — Trap two: a committed transaction does not mean your data is safe.

> Caption: Trap two: a committed transaction does not mean your data is safe.

Exam-trap caption mode adds: *Durability is about the record. Integrity is about the ordering rule. They are two different promises.*

**4:45–4:52** — Trap three: replaying the journal twice does not corrupt anything.

> Caption: Trap three: replaying the journal twice does not corrupt anything.

Exam-trap caption mode adds: *Idempotence is a property of image redo. It does not transfer automatically to every recovery scheme.*

**4:52–5:00** — Trap four: journaling does not delete the consistency check. It moves it off the normal path.

> Caption: Trap four: journaling does not delete the consistency check. It moves it off the normal path.

Exam-trap caption mode adds: *A file system that never runs the full check has not proved it does not need one.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
