# The Buddy System: Orders, the XOR Buddy Rule, Splits, Merge Cascades and Both Fragmentations — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/buddy-system-memory-allocation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two questions and one trick

*0:00 – 0:30 · objective: See why an allocation needs one contiguous run, and how halving the pool gives every block exactly one partner found by arithmetic.*

**0:00–0:07** — A request must receive one contiguous run of memory. Two smaller runs, however generous, are not an answer.

> Caption: A request must receive one contiguous run of memory, not scattered pieces.

Exam-trap caption mode adds: *Total free memory is not the question. The question is the largest free block, which is a different number.*

**0:07–0:15** — Halve the pool again and again. Every block then has exactly one partner, the other half of the block it came from.

> Caption: Halve the pool again and again, and every block has exactly one partner: its other half.

Exam-trap caption mode adds: *A block has one buddy, not two. The blocks on either side of it are neighbours, and only one of them may be the buddy.*

**0:15–0:22** — A pool of 64 units holds 127 blocks in its tree: 64 of size 1, up to a single block of size 64.

> Caption: A pool of 64 units has 127 blocks in its tree: 64 of size 1 up to 1 of size 64.

Exam-trap caption mode adds: *The root has no buddy. Counting buddies for all 127 blocks is an off-by-one that shows up in every counting question.*

**0:22–0:30** — The partner is found by arithmetic, not by a search. Flip one bit of the address.

> Caption: The partner is found by arithmetic, not by a search: flip one bit of the address.

Exam-trap caption mode adds: *This only works because blocks are aligned. A block of size 8 starting at address 12 has no buddy under this rule, and a real buddy allocator never creates one.*

## Scene 2. Round up, then split

*0:30 – 1:00 · objective: Run a 13-unit request against a 128-unit pool and read off the allocated size, the split count and the internal fragmentation.*

**0:30–0:37** — Request 13 units. Round up to the next power of two, which is 16.

> Caption: Request 13 units. Round up to the next power of two: 16.

Exam-trap caption mode adds: *Rounding down to 8 would be a silent buffer overflow. The allocator may waste, but it may never under-serve.*

**0:37–0:45** — Three splits. 128 becomes 64, 64 becomes 32, 32 becomes 16. The halves not used go on the free lists.

> Caption: Three splits: 128 into 64, 64 into 32, 32 into 16.

Exam-trap caption mode adds: *The number of splits is the difference of the orders, not the number of halvings until the request fits in your head.*

**0:45–0:52** — So the answer is 16 units allocated, 3 splits, and 3 units of internal fragmentation.

> Caption: The exam answer: 16 units, 3 splits, and 3 units of internal fragmentation.

Exam-trap caption mode adds: *Internal fragmentation is not the free memory. It is waste inside a block somebody already owns.*

**0:52–1:00** — The 112 units left are not lost. They sit in three free blocks of 16, 32 and 64.

> Caption: The 112 units left are not lost: three blocks of 16, 32 and 64, all free.

Exam-trap caption mode adds: *A common slip is to forget the block released at the last split, which makes the free total 96 instead of 112.*

## Scene 3. The buddy is one bit away

*1:00 – 1:30 · objective: State the buddy rule as address XOR size, read it in binary, and see it hold on every block of a 64-unit pool.*

**1:00–1:07** — The buddy of a block is its address exclusive-or its size.

> Caption: The buddy of a block is its address XOR its size.

Exam-trap caption mode adds: *The rule uses the size, not the order. Size 8 flips bit 3; order 3 happens to match only because the unit is 1.*

**1:07–1:15** — Address 24 with size 8: 24 exclusive-or 8 is 16. Only bit 3 differs, and that is the whole calculation.

> Caption: Address 24, size 8: 24 XOR 8 is 16, because only bit 3 differs.

Exam-trap caption mode adds: *The buddy of 24 is 16, not 32. Adding the size gives the block after it, which is a different block and usually not its buddy.*

**1:15–1:22** — Every one of the 126 blocks below the root passes the test. Each pair forms exactly one parent.

> Caption: All 126 blocks of a 64-unit pool pass: each pair forms exactly one parent.

Exam-trap caption mode adds: *The check is over blocks, not over addresses. An address that is not a block boundary has no buddy in this system.*

**1:22–1:30** — Exclusive-or twice returns the address, so the rule is symmetric. That is why freeing costs at most one walk up the tree.

> Caption: XOR twice returns the address, so the rule is symmetric and free is fast.

Exam-trap caption mode adds: *Fast does not mean free of work: the walk up the tree is at most log2 of the pool size levels, which is the bound a question may ask for.*

## Scene 4. One free list per order

*1:30 – 2:00 · objective: Follow the smallest-block-that-fits search through a nine-request sequence and find the first request that fails.*

**1:30–1:37** — One free list per order. A request looks at its own order, then one order up, until it finds a block.

> Caption: One free list per order. A request looks at its own order, then one order up.

Exam-trap caption mode adds: *This is a first fit over orders, not a best fit over all blocks. The buddy system never searches for the tightest hole.*

**1:37–1:45** — In a pool of 1024 units, the first six requests are served: 50, 150, 90, 130, 70 and 80. Six splits, and 960 units allocated.

> Caption: In 1024 units: 50, 150, 90, 130, 70 and 80 are served, with 6 splits and 960 out.

Exam-trap caption mode adds: *The sizes are the rounded sizes, not the requested sizes. Summing the requests gives 570 and is the wrong total.*

**1:45–1:52** — The seventh request, for 120 units, fails. There is no block of 128, although 64 units are free.

> Caption: The seventh request, 120 units, fails: no 128 exists, though 64 units are free.

Exam-trap caption mode adds: *Reporting the total free memory here answers a different question. The failing request needs one block, not the sum of the free ones.*

**1:52–2:00** — The next two requests fail as well, and a failed request leaves the lists untouched.

> Caption: The requests 180 and 68 fail as well, and a failed request changes nothing.

Exam-trap caption mode adds: *Some question banks ask how many requests succeed. Here it is six of nine, and the three failures are all after the sixth.*

## Scene 5. Freeing is a cascade

*2:00 – 2:30 · objective: Count the merges on four releases of 8-unit blocks, and see four merges cancel four splits exactly.*

**2:00–2:07** — Four requests of 8 units land at addresses 0, 8, 16 and 24, and cost four splits in total.

> Caption: Four requests of 8 units: addresses 0, 8, 16 and 24, with 4 splits in total.

Exam-trap caption mode adds: *Two requests of the same size need not cost the same number of splits. The first and the third paid; the second and the fourth did not.*

**2:07–2:15** — Freeing address 0 merges nothing, because its buddy at address 8 is still allocated.

> Caption: Freeing address 0 merges nothing: its buddy, address 8, is still allocated.

Exam-trap caption mode adds: *A free block beside a used block is not a merge. Only the buddy counts, and the buddy here is the one in use.*

**2:15–2:22** — Freeing address 8 merges once into a block of 16 at address 0. Freeing 16 does nothing, because 24 is still out.

> Caption: Freeing 8 then merges once into a 16 at 0; freeing 16 does nothing at all.

Exam-trap caption mode adds: *The merged block keeps the lower address. Writing 16 as the result address is the usual slip.*

**2:22–2:30** — Freeing 24 cascades three times, back to the whole 64-unit pool. Four merges against four splits.

> Caption: Freeing 24 cascades three times: to 16, to 32, then to the whole 64.

Exam-trap caption mode adds: *Merging with the buddy at the old order and stopping is the classic error. The buddy must be recomputed after every merge.*

## Scene 6. Internal fragmentation, bounded by half

*2:30 – 3:00 · objective: Compute the waste for every request from 1 to 64, locate the worst case just under half a block, and compare with the published range.*

**2:30–2:37** — Internal fragmentation is the allocated block minus the request. Sixteen minus thirteen is three.

> Caption: Internal fragmentation is the block minus the request: 16 minus 13 is 3.

Exam-trap caption mode adds: *Do not add the rounding to the free lists. The 3 wasted units are inside the block in use, not in any free list.*

**2:37–2:45** — The worst case is just over half a block. Thirty-three units take sixty-four and waste thirty-one.

> Caption: The worst case is just over half a block: 33 units take 64 and waste 31.

Exam-trap caption mode adds: *Half is the bound on the ratio of waste to the allocated block. It is never a bound on the waste as a fraction of the pool.*

**2:45–2:52** — The waste is always under half of the block, and exactly zero when the request is a power of two.

> Caption: The waste is always under half, and exactly zero for a power-of-two request.

Exam-trap caption mode adds: *Under half, not at most half. No request wastes exactly half, because the ratio is one half minus one over the block.*

**2:52–3:00** — Uniform requests from one to sixty-four waste 22.3 per cent of what is allocated. The published range for the binary buddy system is 25 to 33 per cent.

> Caption: Uniform requests from 1 to 64 waste 22.3 per cent; the published range is 25 to 33.

Exam-trap caption mode adds: *The percentage is of allocated memory, not of the pool. Quoting it against total memory understates the waste.*

## Scene 7. External fragmentation still exists

*3:00 – 3:30 · objective: Build the witness in which 32 units are free but a 32-unit request fails, and see why merging cannot repair it.*

**3:00–3:07** — Four blocks of sixteen at addresses 0, 16, 32 and 48. Free the second and the fourth.

> Caption: Four blocks of 16 at 0, 16, 32 and 48, then free the second and the fourth.

Exam-trap caption mode adds: *The addresses matter. Freeing 16 and 32 would have merged into a 32, and the witness would disappear.*

**3:07–3:15** — Thirty-two units are free, in two blocks of sixteen, and those two blocks are not buddies.

> Caption: 32 units are free, in two blocks of 16 — and 16 and 48 are not buddies.

Exam-trap caption mode adds: *A free list that holds two 16s says nothing about whether they can be combined. Their addresses decide that.*

**3:15–3:22** — A request for thirty-two units fails, while thirty-two units are free. That is external fragmentation.

> Caption: A request for 32 fails. This is external fragmentation, and buddy has it.

Exam-trap caption mode adds: *The claim that the buddy system has no external fragmentation is false. It has less than first fit, which is a different statement.*

**3:22–3:30** — Merging only joins the two halves of one parent. A free neighbour is not enough.

> Caption: Merging joins halves of one parent, so a free neighbour is not enough.

Exam-trap caption mode adds: *Compaction would fix it, and compaction is not allowed here: a buddy block cannot be moved while it is allocated.*

## Scene 8. Buddy is not paging

*3:30 – 4:00 · objective: Separate buddy allocation from fixed partitions, from first-fit and from paging on the two axes that decide the answer.*

**3:30–3:37** — Buddy allocation gives one contiguous run. Paging gives scattered frames and a page table.

> Caption: Buddy gives one contiguous run; paging gives scattered frames.

Exam-trap caption mode adds: *Both are called memory management, and the syllabus names both in one clause. The distinction is contiguity.*

**3:37–3:45** — Buddy has both kinds of fragmentation. Paging has only the internal waste of the last page.

> Caption: So buddy has both fragmentations; paging wastes only inside the last page.

Exam-trap caption mode adds: *A statement that paging has no internal fragmentation is false: the last page is partly unused by construction.*

**3:45–3:52** — The Fibonacci variant uses block sizes 1, 2, 3, 5 and 8 instead of powers of two, which lowers the waste and costs arithmetic.

> Caption: The Fibonacci variant uses 1, 2, 3, 5, 8 instead of powers of two.

Exam-trap caption mode adds: *The XOR rule is a property of the binary system. It does not carry over to the Fibonacci or weighted variants unchanged.*

**3:52–4:00** — Real kernels layer a slab allocator on top, so the waste becomes one object per slab rather than half a page.

> Caption: Real kernels layer a slab allocator on top to cut the internal waste.

Exam-trap caption mode adds: *The slab layer is outside the exam clause. It is here so that "why is the buddy system used at all" has an answer.*

## Scene 9. The five question shapes

*4:00 – 4:30 · objective: Match each question shape to the one quantity it asks for, with the computed answer for each shape on this page.*

**4:00–4:07** — Five shapes. Which request fails, the allocated size and the split count, the state of the free lists, the buddy of a block, and the number of merges.

> Caption: Five shapes: which request fails, the size and splits, the free lists, the buddy, the merges.

Exam-trap caption mode adds: *Mixing shapes is the commonest loss: computing total free memory for a question about the largest free block.*

**4:07–4:15** — For which request fails, simulate and stop at the first failure. Here that is the seventh request.

> Caption: For which request fails, simulate and stop at the first failure.

Exam-trap caption mode adds: *The first failure and the last failure are different answers to the same sequence, so read which one is asked.*

**4:15–4:22** — For size and splits, round up and then subtract the orders. Seven minus four is three.

> Caption: For size and splits: round up, then count the halvings from the pool order down.

Exam-trap caption mode adds: *The subtraction counts splits, not blocks created. Each split creates one extra free block, which is why three splits leave three free blocks here.*

**4:22–4:30** — For the buddy, exclusive-or the address with the size. For merges, keep merging while the buddy is free.

> Caption: For the buddy, XOR the address with the size; for merges, cascade while the buddy is free.

Exam-trap caption mode adds: *The cascade must recompute the buddy at each new order. Reusing the first buddy is the error that undercounts merges.*

## Scene 10. Four traps

*4:30 – 5:00 · objective: Name the four beliefs that cost marks: buddy means neighbour, half means half the pool, round down, and no external fragmentation.*

**4:30–4:37** — First trap: a buddy is not a neighbour. Address 16 and address 48 are in one free list and are not buddies.

> Caption: Trap 1: a buddy is not a neighbour. 16 and 48 sit in one free list and are not buddies.

Exam-trap caption mode adds: *Adjacency is necessary but not sufficient. Two blocks can be adjacent and still not be the halves of one parent.*

**4:37–4:45** — Second trap: half is half of the allocated block, never half of the pool.

> Caption: Trap 2: half means half of the block, never half of the pool.

Exam-trap caption mode adds: *A question that says "at most 50 per cent wasted" without a denominator is asking you to supply one; supply the block.*

**4:45–4:52** — Third trap: rounding down. A request for thirteen units never receives eight.

> Caption: Trap 3: rounding down. A request for 13 units never receives 8.

Exam-trap caption mode adds: *Rounding up by hand to "a nice number" such as 20 is also wrong. Only powers of two exist in the binary system.*

**4:52–5:00** — Fourth trap: the buddy system does have external fragmentation. Thirty-two free units can refuse a thirty-two-unit request.

> Caption: Trap 4: no external fragmentation is false. 32 free units can refuse a 32-unit request.

Exam-trap caption mode adds: *This is the trap that decides a true-or-false question, so it is worth the four-line witness rather than a memory.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
