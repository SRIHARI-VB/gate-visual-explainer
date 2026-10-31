/* ==========================================================================
   database-recovery-undo-redo — THE timeline.
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
      id: 'why', n: 1,
      title: 'A crash between two writes, and why the log exists',
      start: 0, end: 30,
      objective: 'See atomicity break: transaction T1 moves 40 from item x to item y, the crash lands after the first write, and the sum of the two items changes from 150 to 110. Recovery has to undo that half-finished work using only what is on stable storage.'
    },
    {
      id: 'wal', n: 2,
      title: 'Write-ahead logging: the record lands before the page',
      start: 30, end: 60,
      objective: 'Follow one change through four places — the transaction, the log buffer, the log on stable storage, the data page — and see why the log record must reach disk first, which is what makes both undo and redo possible.'
    },
    {
      id: 'anatomy', n: 3,
      title: 'Five record types, and why a write record keeps two values',
      start: 60, end: 90,
      objective: 'Read a log: start, write with old and new value, commit, abort, and checkpoint with its active-transaction list. Undo needs the old value, redo needs the new one, and an LSN orders both.'
    },
    {
      id: 'scan', n: 4,
      title: 'Building the undo list and the redo list',
      start: 90, end: 120,
      objective: 'Scan a four-record log with a crash at the end and split the transactions: a start puts a transaction in the undo list, a commit moves it to the redo list. The two lists end disjoint — undo holds T1, redo holds T2.'
    },
    {
      id: 'replay', n: 5,
      title: 'Redo forward, undo backward: the state the committed work defines',
      start: 120, end: 150,
      objective: 'Take the disk state at the crash — x holding 60, a value no committed transaction ever wrote — and recover it: redo the new value of the redo list in ascending LSN, undo the old value of the undo list in descending LSN, and reach 100, 50, 20, which is exactly the initial state with only the committed transaction applied.'
    },
    {
      id: 'policies', n: 6,
      title: 'Force or no-force, steal or no-steal: which of undo and redo you need',
      start: 150, end: 180,
      objective: 'Place the two buffer decisions on one grid. No-force means a committed change may be missing from disk, so redo is needed. Steal means an uncommitted change may be on disk, so undo is needed. Deferred modification is the no-steal corner; immediate modification is the steal corner.'
    },
    {
      id: 'order', n: 7,
      title: 'Why undo runs backwards and redo runs forwards',
      start: 180, end: 210,
      objective: 'One uncommitted transaction writes x twice, 0 to 5 and 5 to 9. Undoing in forward order leaves 5, a value no committed transaction wrote; undoing in reverse order leaves 0. The order is part of the algorithm, not a detail.'
    },
    {
      id: 'checkpoint', n: 8,
      title: 'The checkpoint: the active list, and the work it saves',
      start: 210, end: 240,
      objective: 'Work the GATE CSE 2015 Set 2 log. The checkpoint record names T1, the only transaction active then, so T1 is undone even though it started before the checkpoint. T4 committed before it, so T4 needs no redo. Undo is T1 and T3; redo is T2; five records are read instead of eleven.'
    },
    {
      id: 'again', n: 9,
      title: 'Crashing again during recovery, and why it still works',
      start: 240, end: 270,
      objective: 'Recover twice from the same log. The log has not changed, so the same two lists are rebuilt and the same records replayed; redo and undo are idempotent, so the state after the second pass equals the state after the first. This is the GATE CSE 2021 Set 1 question.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The five-step procedure and the boundary it assumes',
      start: 270, end: 300,
      objective: 'Fix the decision procedure: last checkpoint, its active list, scan to the crash, split the lists, replay redo ascending and undo descending, then compare with the committed-only state. Name the assumption a sharp checkpoint makes, and what a fuzzy checkpoint costs.'
    }
  ],

  events: [
    /* ---------------- scene 1: why ---------------- */
    {
      id: 'why-1', scene: 'why', start: 0, end: 7.5,
      caption: 'T1 moves 40 from item x to item y: x goes 100 to 60, y goes 50 to 90.',
      narration: 'One transaction moves forty from item x to item y. Item x goes from one hundred to sixty. Item y goes from fifty to ninety. Both writes belong to the same transaction.',
      detail: 'Two data items, one transaction, two write records. The sum of the two items is 150 before the transfer and must still be 150 after it.',
      keyword: 'moves'
    },
    {
      id: 'why-2', scene: 'why', start: 7.5, end: 15,
      caption: 'The crash lands between the two writes: x has lost 40, y never received it.',
      narration: 'Now the machine dies after the first write and before the second. Item x has lost forty. Item y never received it. The sum of the two items is now one hundred and ten.',
      detail: 'This is not a small error. Money has disappeared from the database, and no user did anything wrong.',
      keyword: 'crash',
      trap: 'The database is not "half correct". It is inconsistent: a total that must be 150 now reads 110.'
    },
    {
      id: 'why-3', scene: 'why', start: 15, end: 22.5,
      caption: 'Atomicity says both writes survive or neither does. The log is what makes that possible.',
      narration: 'Atomicity is the promise that either both writes survive or neither does. To keep that promise the system cannot rely on the data pages, which may already hold a half-finished value. It relies on a separate file: the log.',
      detail: 'The log is written to stable storage, which survives a crash. The data pages are not guaranteed to.',
      keyword: 'Atomicity'
    },
    {
      id: 'why-4', scene: 'why', start: 22.5, end: 30,
      caption: 'Recovery reads the log and rebuilds the state that the committed transactions alone define.',
      narration: 'Recovery reads that log after the crash and puts every item back to the value that the committed transactions alone would have produced. That is the whole subject of this lesson: which records to replay, in which direction, and in which order.',
      detail: 'The reference answer for any log is: start from the initial state and apply exactly the writes of the transactions that have a commit record.',
      keyword: 'committed'
    },

    /* ---------------- scene 2: wal ---------------- */
    {
      id: 'wal-1', scene: 'wal', start: 30, end: 37.5,
      caption: 'Every change is written twice: a log record first, then the data page.',
      narration: 'Every change is written twice. Once as a log record, which is small and sequential. Once as a data page, which is large and scattered. The two copies are what let recovery work.',
      detail: 'A log record names the transaction, the item, the old value and the new value. It is appended, so writing it is cheap.',
      keyword: 'twice'
    },
    {
      id: 'wal-2', scene: 'wal', start: 37.5, end: 45,
      caption: 'Write-ahead logging: the log record reaches stable storage before the page it describes.',
      narration: 'The rule is write-ahead logging. The log record must reach stable storage before the data page it describes reaches the data file. Log first, page second, always.',
      detail: 'If the page went first and the crash came before the log record, the change would exist with no record of it, and no algorithm could decide whether to keep it.',
      keyword: 'before',
      trap: 'Writing the log to a buffer is not enough. The record must be forced to stable storage; a buffered record dies with the machine.'
    },
    {
      id: 'wal-3', scene: 'wal', start: 45, end: 52.5,
      caption: 'A committed page may still be in memory at the crash. That is why redo exists.',
      narration: 'At the moment of the crash, a page holding a committed change may still be in memory and never reach the disk. The log knows the new value, so recovery can write it again. That direction is called redo.',
      detail: 'Redo applies the new value of a write record. It is needed only for transactions that committed, because only their changes must survive.',
      keyword: 'redo'
    },
    {
      id: 'wal-4', scene: 'wal', start: 52.5, end: 60,
      caption: 'An uncommitted page may have been flushed early. That is why undo exists.',
      narration: 'The opposite also happens. To keep memory free, the system may flush a page belonging to a transaction that has not committed. The disk then holds a value that must not survive. The log knows the old value, so recovery can put it back. That direction is called undo.',
      detail: 'Undo applies the old value of a write record. It is needed only for transactions that did not commit.',
      keyword: 'undo',
      trap: 'Both directions exist because both accidents are possible. A system that only ever redid would keep the work of a transaction that never committed.'
    },

    /* ---------------- scene 3: anatomy ---------------- */
    {
      id: 'ana-1', scene: 'anatomy', start: 60, end: 67.5,
      caption: 'Five record types carry everything recovery needs.',
      narration: 'The log holds five kinds of record. A start record, which opens a transaction. A write record. A commit record. An abort record. And a checkpoint record.',
      detail: 'Every record also carries an LSN, a log sequence number: its address in the log. Recovery replays records in LSN order and needs that address to order the replay.',
      keyword: 'five'
    },
    {
      id: 'ana-2', scene: 'anatomy', start: 67.5, end: 75,
      caption: 'A write record keeps both values: old 100, new 60. Undo needs old, redo needs new.',
      narration: 'A write record is the important one. It keeps both the old value and the new value. Undo needs the old value, because undo puts the item back. Redo needs the new value, because redo puts the change in again. A log that kept only one of them could not support both directions.',
      detail: 'Written as a tuple: transaction, item, old value, new value. In this lesson the notation is a record like T1, x, 100, 60.',
      keyword: 'both',
      trap: 'The pair is old then new. Reading it the other way round inverts every answer you compute from it.'
    },
    {
      id: 'ana-3', scene: 'anatomy', start: 75, end: 82.5,
      caption: 'The checkpoint record names the transactions still running at that instant.',
      narration: 'A checkpoint record names the transactions that were active at that instant: started, and not yet committed or aborted. Here that list holds only T1. That small list is what lets recovery start reading from the checkpoint instead of from the beginning of time.',
      detail: 'The list is the load-bearing part of the record. Without it, a transaction that started before the checkpoint and never committed would be invisible to a reader that stops at the checkpoint.',
      keyword: 'active'
    },
    {
      id: 'ana-4', scene: 'anatomy', start: 82.5, end: 90,
      caption: 'An LSN orders the replay; without it, undo has no notion of newest first.',
      narration: 'Every record carries an LSN, its position in the log. Redo walks the records in increasing LSN, oldest first. Undo walks them in decreasing LSN, newest first. The next scenes show why those directions are forced.',
      detail: 'An LSN is a monotonically increasing number assigned when the record is appended. Two records never share one.',
      keyword: 'LSN'
    },

    /* ---------------- scene 4: scan ---------------- */
    {
      id: 'scan-1', scene: 'scan', start: 90, end: 97.5,
      caption: 'One log, two transactions, a crash at the end, and no checkpoint.',
      narration: 'Here is a small log with no checkpoint in it. T1 starts and writes x from one hundred to sixty. T2 starts, writes z from ten to twenty, and commits. Then T1 writes y from fifty to ninety. Then the crash.',
      detail: 'Six records: two starts, three writes, one commit. T1 never commits; T2 does.',
      keyword: 'no checkpoint'
    },
    {
      id: 'scan-2', scene: 'scan', start: 97.5, end: 105,
      caption: 'A start record puts its transaction in the undo list.',
      narration: 'Recovery walks the log and keeps two lists. The moment it sees a start record, that transaction is presumed to need undoing, so it goes into the undo list. Nothing is known yet about how it ends.',
      detail: 'This is the pessimistic default: assume every transaction is unfinished until a commit record proves otherwise.',
      keyword: 'undo list'
    },
    {
      id: 'scan-3', scene: 'scan', start: 105, end: 112.5,
      caption: 'A commit record moves the transaction from the undo list to the redo list.',
      narration: 'A commit record is the only thing that moves a transaction. It leaves the undo list and joins the redo list. A transaction with no commit record stays where the start record put it.',
      detail: 'An abort record removes the transaction from both lists, because its rollback already happened before the crash.',
      keyword: 'commit',
      trap: 'A commit record does not empty the undo list. It moves exactly one transaction, the one it names.'
    },
    {
      id: 'scan-4', scene: 'scan', start: 112.5, end: 120,
      caption: 'The result: undo T1, redo T2. The two lists never share a transaction.',
      narration: 'At the crash the undo list holds T1 and the redo list holds T2. The lists are disjoint by construction: every record either has a commit or it does not. That disjointness is the first property to check on any answer you compute.',
      detail: 'Undo T1 because it never committed. Redo T2 because it did, and its page may not have reached the disk.',
      keyword: 'disjoint'
    },

    /* ---------------- scene 5: replay ---------------- */
    {
      id: 'rep-1', scene: 'replay', start: 120, end: 127.5,
      caption: 'The disk at the crash is not the truth: x holds 60, written by a transaction that never committed.',
      narration: 'Here is what the disk holds at the crash. x is sixty, because T1\'s page was flushed early. y is still fifty, because T1\'s second write never reached a page. z is ten, because T2\'s page is still in memory. Only one of those three values is wrong, and it is the one written by the transaction that never committed.',
      detail: 'The disk state is a mix of committed and uncommitted work. Neither can be trusted on its own; the log decides.',
      keyword: 'not the truth'
    },
    {
      id: 'rep-2', scene: 'replay', start: 127.5, end: 135,
      caption: 'Redo walks forward: apply the new value of every write in the redo list.',
      narration: 'Redo walks the log from oldest to newest and applies the new value of every write record whose transaction is in the redo list. T2\'s write sets z to twenty. Only one record is redone here.',
      detail: 'Redo is safe to repeat, because writing the new value twice leaves the same new value.',
      keyword: 'forward'
    },
    {
      id: 'rep-3', scene: 'replay', start: 135, end: 142.5,
      caption: 'Undo walks backward: apply the old value of every write in the undo list.',
      narration: 'Undo walks the log from newest to oldest and applies the old value of every write record whose transaction is in the undo list. T1\'s write to y sets y to fifty, which it already is, so that step changes nothing. Then T1\'s write to x sets x back to one hundred. Two records undone, one of them a no-op.',
      detail: 'The no-op is not a mistake. Undo cannot know which pages were flushed, so it restores every old value and lets the ones already correct stay correct.',
      keyword: 'backward',
      trap: 'A no-op undo is still counted in the work done. Questions about "how many undo operations" count records, not changes.'
    },
    {
      id: 'rep-4', scene: 'replay', start: 142.5, end: 150,
      caption: 'The result equals the initial state with only the committed transaction applied.',
      narration: 'The recovered state is x one hundred, y fifty, z twenty. That is exactly the initial state with only T2\'s committed write applied. The recovered state and the committed-only state agree on all three items, which is the property every recovery algorithm must satisfy.',
      detail: 'This equality, not the individual values, is the definition of correct recovery: the result is the state the committed transactions alone define.',
      keyword: 'equals'
    },

    /* ---------------- scene 6: policies ---------------- */
    {
      id: 'pol-1', scene: 'policies', start: 150, end: 157.5,
      caption: 'Two buffer decisions decide which of undo and redo you need.',
      narration: 'Whether a system needs undo, or redo, or both, is not a matter of taste. It follows from two decisions about when pages are written to disk.',
      detail: 'These are properties of the buffer manager, not of the log. The log format is the same in all four combinations.',
      keyword: 'two'
    },
    {
      id: 'pol-2', scene: 'policies', start: 157.5, end: 165,
      caption: 'Force or no-force: are pages flushed at commit? No-force means a committed change may be missing, so redo.',
      narration: 'First decision: at commit, are the transaction\'s pages forced to disk? If they are, the policy is called force, and a committed change is certainly on disk. If they are not, the policy is no-force, and a committed change may exist only in memory. No-force needs redo.',
      detail: 'No-force is the common choice, because forcing a random page at every commit is slow.',
      keyword: 'no-force',
      trap: 'Force removes the need for redo but does not remove redo from the log. The records are still written.'
    },
    {
      id: 'pol-3', scene: 'policies', start: 165, end: 172.5,
      caption: 'Steal or no-steal: may an uncommitted page be flushed? Steal means a dirty value may be on disk, so undo.',
      narration: 'Second decision: may the system flush a page belonging to a transaction that has not committed? If it may, the policy is steal, and an uncommitted value can be on disk. Steal needs undo. If it may not, the policy is no-steal, and nothing uncommitted ever reaches the disk.',
      detail: 'Steal is also the common choice, because holding a transaction\'s pages in memory until commit needs unbounded memory.',
      keyword: 'steal'
    },
    {
      id: 'pol-4', scene: 'policies', start: 172.5, end: 180,
      caption: 'Deferred modification is the no-steal corner: only redo. Immediate modification is steal: both.',
      narration: 'Put the two decisions together and the four corners name the classic schemes. No-steal with force needs neither direction. No-steal without force needs only redo, and that is deferred modification. Steal without force needs both, and that is immediate modification. Force with steal needs only undo.',
      detail: 'The version in every textbook table is the pair: deferred modification, redo only; immediate modification, undo and redo.',
      keyword: 'deferred',
      trap: 'Deferred modification does not mean the log is unnecessary. It means the undo list is built and every undo it contains turns out to be a no-op.'
    },

    /* ---------------- scene 7: order ---------------- */
    {
      id: 'ord-1', scene: 'order', start: 180, end: 187.5,
      caption: 'One transaction writes x twice, 0 to 5 and 5 to 9, and never commits.',
      narration: 'Here is the smallest log that shows why order matters. T1 writes x from zero to five. Then T1 writes x again, from five to nine. Then the crash, with no commit. T1 is in the undo list.',
      detail: 'Two write records, one item, one transaction. The initial value is 0 and the disk holds 9, because both pages were flushed.',
      keyword: 'twice'
    },
    {
      id: 'ord-2', scene: 'order', start: 187.5, end: 195,
      caption: 'Undo in forward order leaves 5, a value that no committed transaction ever wrote.',
      narration: 'Suppose undo walked the log forwards. It applies the old value of the first record, giving zero. Then it applies the old value of the second record, giving five. The database now holds five, which is the intermediate value of a transaction that never committed.',
      detail: 'Five is not the initial value and it is not a committed value. It is an artefact of the wrong direction.',
      keyword: 'forward',
      trap: 'This is the one wrong answer that looks right, because both values it applies really are old values from the log.'
    },
    {
      id: 'ord-3', scene: 'order', start: 195, end: 202.5,
      caption: 'Undo in reverse order leaves 0, the value before the transaction began.',
      narration: 'Undo walks the log backwards. It applies the old value of the second record first, giving five. Then the old value of the first record, giving zero. Zero is the value before the transaction began, which is what undo must restore.',
      detail: 'Reverse order means each write is undone before the write that preceded it, so the last old value applied is the oldest.',
      keyword: 'reverse'
    },
    {
      id: 'ord-4', scene: 'order', start: 202.5, end: 210,
      caption: 'Undo newest first, redo oldest first. Reversing either gives a value nothing wrote.',
      narration: 'The rule is symmetric and easy to remember: undo runs newest record first, redo runs oldest record first. Reverse the redo order on a committed transaction that wrote the same item twice, and you get five instead of nine. Both directions are ordered by LSN, and both orders are forced.',
      detail: 'Redo ascending and undo descending are the two directions of one walk along the LSN axis.',
      keyword: 'order'
    },

    /* ---------------- scene 8: checkpoint ---------------- */
    {
      id: 'cp-1', scene: 'checkpoint', start: 210, end: 217.5,
      caption: 'A checkpoint forces every dirty page and records which transactions are still running.',
      narration: 'A checkpoint does two things at one instant. It forces every dirty page to disk, so the database on disk is consistent up to that point. And it writes a record naming the transactions that are still running. After that, recovery need not read the log from the beginning.',
      detail: 'This is the sharp, or simple, checkpoint. A fuzzy checkpoint skips the forcing step, which is why it needs a different recovery rule.',
      keyword: 'forces'
    },
    {
      id: 'cp-2', scene: 'checkpoint', start: 217.5, end: 225,
      caption: 'T4 committed before the checkpoint, so its page is already on disk and T4 needs no redo.',
      narration: 'Look at the log. T4 wrote y from two to three, and committed, and then the checkpoint forced its page. So T4 needs no redo at all, even though its commit record is in the log. Reading back only as far as the checkpoint is exactly what excludes it.',
      detail: 'Without a checkpoint the same log puts T4 in the redo list, because nothing then guarantees its page reached the disk. The redo list grows from one transaction to two.',
      keyword: 'no redo',
      trap: '"Committed, therefore redo" is wrong once a checkpoint is in the log. The question is whether the page was forced after the commit.'
    },
    {
      id: 'cp-3', scene: 'checkpoint', start: 225, end: 232.5,
      caption: 'T1 started before the checkpoint and never committed: the active list puts it back in undo.',
      narration: 'Now the trap in the other direction. T1 started before the checkpoint and never committed. A reader that stops at the checkpoint would never see T1\'s start record. That is why the checkpoint record carries the active list: T1 is named in it, so T1 goes into the undo list, and its write to z is undone.',
      detail: 'Dropping T1 gives z equal to seven, the value of a transaction that never committed, instead of five. The lesson computes both.',
      keyword: 'active list',
      trap: 'A transaction that started before the checkpoint can still be the whole answer. Read the active list before you read anything else.'
    },
    {
      id: 'cp-4', scene: 'checkpoint', start: 232.5, end: 240,
      caption: 'Reading back only to the checkpoint: undo T1 and T3, redo T2. Five records instead of eleven.',
      narration: 'So the lists are: undo T1 and T3, redo T2. Replaying them gives x nine, y three, z five, which is the initial state with only T4 and T2 applied. And the reader looked at five records instead of eleven. This is the GATE CSE 2015 Set 2 question, and its official key is exactly these two lists.',
      detail: 'Redo T2 sets x to nine. Undo T3 sets z back to seven, then undo T1 sets z back to five. y is untouched because T4 is in neither list.',
      keyword: 'five records'
    },

    /* ---------------- scene 9: again ---------------- */
    {
      id: 'ag-1', scene: 'again', start: 240, end: 247.5,
      caption: 'What if the machine crashes again while it is recovering?',
      narration: 'Recovery takes time, and during that time the machine can crash again. The question is whether the second crash makes things worse. It does not, and the reason is worth knowing precisely.',
      detail: 'This is not a hypothetical: recovery of a large log can run for minutes, and a restart during it is routine.',
      keyword: 'again'
    },
    {
      id: 'ag-2', scene: 'again', start: 247.5, end: 255,
      caption: 'The log has not changed, so the same two lists are rebuilt and the same records replayed.',
      narration: 'Nothing in the log has changed, because recovery does not remove records and no checkpoint is taken during it. So the second recovery rebuilds exactly the same undo and redo lists from exactly the same records, and replays them from the start.',
      detail: 'If a checkpoint were taken during recovery, the lists could legitimately differ. The question states that no checkpointing is done during recovery.',
      keyword: 'same lists'
    },
    {
      id: 'ag-3', scene: 'again', start: 255, end: 262.5,
      caption: 'Redo and undo are idempotent: applying a record twice leaves the value it sets.',
      narration: 'The reason a repeat is harmless is idempotence. Redo sets an item to the new value; doing it twice leaves the new value. Undo sets an item to the old value; doing it twice leaves the old value. Neither operation accumulates.',
      detail: 'Idempotence is why recovery can be restarted rather than resumed. It is also why a no-op undo is not a problem.',
      keyword: 'idempotent',
      trap: 'Idempotence applies per record, in the right order. Applying two records of the same transaction in the wrong order is not idempotent; it is simply wrong.'
    },
    {
      id: 'ag-4', scene: 'again', start: 262.5, end: 270,
      caption: 'GATE CSE 2021 Set 1 asked this, and the official key is the same undo and redo list.',
      narration: 'GATE CSE 2021 Set 1 asked this exact question, with checkpointing excluded during the transactions and during recovery. The official key is the statement that the same undo and redo list will be used while recovering again. The lesson recomputes the state after a second pass and finds it unchanged.',
      detail: 'The other three options were: the system cannot recover any further; already undone and redone transactions will not be recovered again; the database will become inconsistent. Each is refuted by the same two facts: the log is unchanged, and both directions are idempotent.',
      keyword: 'same undo and redo list'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'pr-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Five steps: last checkpoint, its active list, scan to the crash, split the lists, replay.',
      narration: 'Here is the procedure to apply to any log in an exam. One: find the last checkpoint. Two: copy its active list into the undo list. Three: read the records from there to the crash. Four: a start joins undo, a commit moves its transaction to redo, an abort removes it from both. Five: replay redo ascending, then undo descending.',
      detail: 'With no checkpoint, step one and two vanish and the scan starts at the first record.',
      keyword: 'Five steps'
    },
    {
      id: 'pr-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Then check your answer: recovered state equals the committed-only state, and the lists are disjoint.',
      narration: 'Then check the answer two ways. The two lists must not share a transaction. And the recovered state must equal the initial state with exactly the committed transactions applied. Both checks are cheap, and either one catches most errors before the exam does.',
      detail: 'The committed-only state is computed by replaying the write records of committed transactions in LSN order onto the initial state.',
      keyword: 'check',
      trap: 'A list that looks plausible can still be wrong. The committed-only comparison catches an undo that was omitted, which no amount of staring at the log will.'
    },
    {
      id: 'pr-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Boundary: a fuzzy checkpoint does not force pages, so you must read back further and redo more.',
      narration: 'One assumption sits under the whole procedure: the checkpoint forced the pages. A fuzzy checkpoint lets transactions keep writing while it runs and does not force every page. Then a transaction that committed before the checkpoint may still be missing from the disk, so you must read back to the oldest transaction that was active and redo more work. On the 2015 log that grows the redo list from one transaction to two.',
      detail: 'GATE questions state the protocol they mean. "Simple checkpointing protocol" means pages are forced; without that phrase, say which assumption you used.',
      keyword: 'fuzzy'
    },
    {
      id: 'pr-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'One line: the log holds both values, so recovery can always rebuild the committed state.',
      narration: 'The one line to keep: the log holds the old value and the new value of every change, so recovery can always rebuild the state that the committed transactions alone define. Undo newest first, redo oldest first, and check against the committed-only state.',
      detail: 'Everything in this lesson is that sentence applied to a different log, with or without a checkpoint.',
      keyword: 'both values'
    }
  ]
};
