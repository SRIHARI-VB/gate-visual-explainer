# Extendible Hashing Directory And Depths — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/extendible-hashing-directory-and-depths/index.html`
- Total duration: 6:10 (370 seconds), 13 scenes, 51 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A fixed number of buckets, and a chain that grows

*0:00 – 0:28 · objective: See static hashing overflow on a file larger than its bucket count, and measure the lookup cost that follows.*

**0:00–0:07** — Static hashing chooses the number of buckets before it sees a single record.

> Caption: Static hashing fixes the bucket count first: h(k) = k mod 10, ten buckets, two records each.

**0:07–0:14** — Halve the buckets and every bucket holds more than it can.

> Caption: Twenty-four keys into five buckets gives five, five, five, five and four records where two fit.

**0:14–0:21** — The chain turns one block read into four for the unlucky key.

> Caption: The excess goes to overflow blocks chained to the bucket, so the worst key costs four block reads instead of one.

Exam-trap caption mode adds: *An overflow chain is not a defect in the hash function. Any fixed bucket count overflows as soon as the file outgrows it, however good the hash is.*

**0:21–0:28** — Growing a static hash file means rehashing everything. That is the problem the next scene removes.

> Caption: The chain grows with the file and nothing in the structure notices. A directory is the fix.

## Scene 2. The directory: an array of pointers chosen by the low bits

*0:28 – 0:54 · objective: Read the directory index as the low d bits of the hash, and count the block reads a lookup costs.*

**0:28–0:35** — A directory of two to the d pointers, indexed by the low d bits of the hash.

> Caption: Keep an array of pointers, two to the power d of them, and index it by the low d bits of h(k).

**0:35–0:42** — d is the global depth, and it is one number for the whole directory.

> Caption: d is the global depth: the number of low-order bits the directory reads to choose a bucket.

**0:42–0:48** — One directory lookup, one bucket read. The count does not grow with the file.

> Caption: A lookup is one directory entry and one pointer. If the directory is resident, that is one block read, always.

**0:48–0:54** — Same low bits, same bucket. That rule is what the split has to break.

> Caption: Two keys with different low d bits cannot share a bucket. Two keys with the same low d bits must.

## Scene 3. Two depths: the directory has one, each bucket has one

*0:54 – 1:22 · objective: Distinguish global depth from local depth, and derive the 2^(d-d′) pointers that reach one bucket.*

**0:54–1:01** — The local depth is the number of bits this one bucket actually needed.

> Caption: Each bucket also records a local depth: how many bits were actually needed to separate the records it holds.

**1:01–1:08** — Two to the power d minus d prime entries reach one bucket.

> Caption: A bucket at local depth two is reached by four entries of an eight-entry directory: two to the power d minus d prime.

**1:08–1:15** — All pointers to a bucket share its low d-prime bits.

> Caption: Every entry that points at one bucket agrees on the low d-prime bits. That is what makes the pointer array legal.

**1:15–1:22** — Global depth is the maximum of the local depths. Never less.

> Caption: The global depth is the largest local depth, and no local depth can exceed it.

## Scene 4. An insert with room changes nothing structural

*1:22 – 1:48 · objective: Walk a key from its bits to its entry to its bucket, and see that a non-overflowing insert is free.*

**1:22–1:29** — Read the last three bits: 110, entry six.

> Caption: Insert 22. Its binary form ends in 110, so with d equal to three the entry is 110.

**1:29–1:36** — There is room, so the insert is free.

> Caption: Entry six holds one record, 6, so 22 goes in beside it. The directory does not change.

**1:36–1:42** — Two records, capacity two. Full, but still fine.

> Caption: Insert 24 into entry 000, which already holds 16. Two records, capacity two: full, but not yet overflowing.

**1:42–1:48** — The next record there forces a choice, and the two depths make it.

> Caption: The next record that lands there is the one that forces a decision, and the depths decide which decision.

## Scene 5. Overflow with a spare pointer: split, do not double

*1:48 – 2:18 · objective: Split a bucket whose local depth is below the global depth, redistributing on bit d′ and moving half the pointers.*

**1:48–1:55** — Local depth below global: split, and the directory stays as it is.

> Caption: If the local depth is below the global depth, split the bucket and leave the directory alone.

**1:55–2:02** — One more bit decides who stays and who moves.

> Caption: Redistribute on one more bit: bit number d prime, counting from zero. A zero stays, a one moves.

**2:02–2:10** — The pointers are divided between the two halves, none are added.

> Caption: Half the pointers follow the new bucket. Four pointers at local depth two become two and two at local depth three.

**2:10–2:18** — The reorganisation is confined to one bucket and its pointers.

> Caption: No other bucket moves and no entry changes its index. Only the pointers that reached the split bucket are rewritten.

Exam-trap caption mode adds: *The split bit is the bit at position d prime, counted from the right starting at zero. Splitting on the top bit of the hash, or on bit d, redistributes nothing useful and the same bucket overflows again immediately.*

## Scene 6. Overflow with no spare pointer: double the directory

*2:18 – 2:50 · objective: See why doubling is a copy of the pointer array, and why only least-significant-bit indexing allows it.*

**2:18–2:25** — Local depth equal to global depth. One more bit is needed, and the directory has not got it.

> Caption: Now the other case: the bucket is full and its local depth already equals the global depth.

**2:25–2:32** — One pointer, two buckets. A pointer has to be created.

> Caption: Only one pointer reaches it, so splitting in place would leave the new bucket with no entry pointing at it.

**2:32–2:42** — Copy the array after itself. That is the whole doubling.

> Caption: Doubling is a copy: the new entry at i plus two to the d is a copy of entry i.

**2:42–2:50** — Double, then split. The halves take the new depth.

> Caption: Then the split runs as before on the new bit. The global depth rises by one and the two halves take local depth d plus one.

## Scene 7. Ten records, computed end to end

*2:50 – 3:24 · objective: Follow one insertion order through every doubling and split to a finished structure whose counts can be checked.*

**2:50–2:58** — Ten records, capacity two, one fixed insertion order.

> Caption: Ten records, capacity two, inserted in the order 16, 4, 6, 22, 24, 10, 31, 7, 9, 20.

**2:58–3:06** — Three doublings, five splits, depth zero to depth three.

> Caption: Three doublings and five splits take the global depth from zero to three and the directory from one entry to eight.

**3:06–3:15** — Six buckets, ten records, ten of twelve slots full.

> Caption: Six buckets hold ten records, so ten of twelve slots are used. Two buckets have local depth two and are shared by two entries each.

**3:15–3:24** — The four properties are rechecked after every insert, not just at the end.

> Caption: Every number here is recomputed by this page, and the four defining properties are re-checked after each of the ten inserts.

## Scene 8. Four counts that answer the questions

*3:24 – 3:52 · objective: Compute pointers per bucket, maximum records, minimum global depth and directory size in bytes.*

**3:24–3:31** — Two to the power d minus d prime pointers reach a bucket.

> Caption: Pointers reaching one bucket: two to the power d minus d prime. Depth four and local depth two gives four.

**3:31–3:38** — Multiply for a ceiling, divide and take a ceiling for a floor.

> Caption: Most records the structure can hold: two to the d times the capacity. Minimum depth for N records: the smallest d with two to the d at least N over the capacity.

**3:38–3:45** — Depth twenty with four-byte pointers is a four mebibyte directory.

> Caption: Directory size in bytes: two to the d times the pointer width. Four-byte pointers at depth twenty is four mebibytes.

**3:45–3:52** — The directory length bounds the bucket count from above, never pins it.

> Caption: Two to the d is an upper bound on the number of buckets, not the count. Shared entries make the count smaller.

Exam-trap caption mode adds: *Two to the d is not the number of buckets. A question that asks for the number of buckets after a given insertion sequence must be traced, because shared entries are the whole point of the structure.*

## Scene 9. One block read, and the query it cannot answer

*3:52 – 4:16 · objective: Count the reads for an equality lookup, then measure what a range query costs and why a B+ tree beats it.*

**3:52–3:59** — One directory entry, one bucket. That is the whole lookup.

> Caption: A lookup reads one directory entry, then one bucket. One block read if the directory is resident, two if it is not.

**3:59–4:06** — Eight consecutive keys, eight different buckets.

> Caption: A range query is the failure. Twenty records in twelve buckets: eight consecutive keys touch eight different buckets.

**4:06–4:16** — The B+ tree follows a chain. The hash index has no chain to follow.

> Caption: A B+ tree reads one leaf and then follows the chain. A hash index has nothing to follow.

Exam-trap caption mode adds: *A hash index cannot answer a range, a prefix match or an ordered scan efficiently. If a question asks which index supports BETWEEN or ORDER BY, the answer is never the hash index.*

## Scene 10. Deletion: the buddy merge and the halving

*4:16 – 4:46 · objective: Apply both merge conditions on a real deletion sequence, then halve the directory when every depth has fallen below it.*

**4:16–4:23** — Merge needs both: the same local depth, and room for both sets of records.

> Caption: Deletion runs the split backwards. A bucket and its split image may merge if their combined records fit in one bucket.

**4:23–4:31** — Three records do not fit. Two do.

> Caption: Deleting 20 leaves a candidate of three records, so no merge. Deleting 24 leaves two, so the merge happens and the local depth falls by one.

**4:31–4:38** — If every pair of entries agrees, throw half the array away.

> Caption: When every local depth is below the global depth, the directory halves: each pair of entries agrees, so one of the pair is redundant.

**4:38–4:46** — Delete everything and the structure returns to where it started.

> Caption: Here the halving takes the depth from three to two. Delete every record and the structure returns to one empty bucket at depth zero.

Exam-trap caption mode adds: *A merge needs the same local depth on both sides and a combined count within capacity. Dropping either condition leaves a pointer array that disagrees with its buckets, which is the one error a lookup cannot detect.*

## Scene 11. The failure mode: five keys that share their low bits

*4:46 – 5:14 · objective: See the directory grow to 64 entries for five records, and state the assumption the structure rests on.*

**4:46–4:53** — Five keys that agree on every low bit the directory has read so far.

> Caption: Nothing here is free. Five keys all congruent to one modulo sixteen share their low four bits.

**4:53–5:01** — Every split puts all five in the same half, so the next bit is read, and again.

> Caption: Each split leaves them in the same bucket, because the bit being examined is the same for all five. The directory doubles six times.

**5:01–5:08** — Sixty-four entries for five records. The directory grew, the data did not spread.

> Caption: Sixty-four directory entries, seven buckets, five records. The directory grew and the records did not spread.

**5:08–5:14** — A small overflow allowance caps the directory. That is the engineering answer.

> Caption: Real implementations allow a few overflow blocks and double only when overflow becomes common.

## Scene 12. Extendible against static, against linear, against a B+ tree

*5:14 – 5:42 · objective: Place the four schemes on one table by what each guarantees, and name the operation hashing cannot do.*

**5:14–5:21** — Static hashing pays for growth with a full rehash.

> Caption: Static: one read until it overflows, then a chain, and a full rehash to grow.

**5:21–5:28** — One read always, paid for with a directory.

> Caption: Extendible: one read always, a directory that doubles, and no overflow chain except for duplicate keys.

**5:28–5:35** — Linear hashing trades the directory for overflow chains and a fixed split order.

> Caption: Linear hashing: no directory at all, splits round-robin, and an overflow chain allowed in exchange.

**5:35–5:42** — Only the B+ tree answers a range. That is the line to remember.

> Caption: And a B+ tree answers ranges and ordered scans, which no hash index can.

## Scene 13. The five-step procedure, and the four properties to recheck

*5:42 – 6:10 · objective: Fix an order of operations for an exam question, and a checklist that catches a corrupted pointer array.*

**5:42–5:49** — Five steps in a fixed order, with the depth comparison last.

> Caption: Five steps: read d, take the low d bits, follow the pointer, then choose split or double by comparing the two depths.

**5:49–5:57** — Write the binary first, and count from the right unless the question says otherwise.

> Caption: Write the binary of the key first and count bits from the right. Most wrong answers come from reading the wrong end.

Exam-trap caption mode adds: *Check whether the question indexes by the first d bits or the last d. The depths and the split behaviour are the same; the entry numbers are not.*

**5:57–6:04** — Four properties, checked after every split. They catch nearly every mistake.

> Caption: After any split, recheck four things: array length, the two depths, pointers per bucket, and no bucket over capacity.

**6:04–6:10** — Four numbers are easy to confuse. Answer the one that was asked.

> Caption: Then answer the question that was actually asked: the depth, the entry, the bucket count, or the block reads.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
