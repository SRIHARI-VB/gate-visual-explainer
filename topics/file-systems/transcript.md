# File Systems — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/file-systems/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A file system is three tables, not a folder

*0:00 – 0:30 · objective: Separate the name, the metadata and the bytes, and count what one open costs, so the rest of the topic has three objects to point at.*

**0:00–0:07** — A file is a named sequence of bytes. The name, the metadata and the bytes live in three different places.

> Caption: A file is a named sequence of bytes. The name, the metadata and the bytes live in three different places.

Exam-trap caption mode adds: *Treating the file name as the file. The name is an entry in a directory; two names can point at one inode, which is exactly what a hard link is.*

**0:07–0:15** — Three tables: the directory maps a name to an inode number, the inode maps an inode number to blocks.

> Caption: Three tables: the directory maps a name to an inode number, the inode maps an inode number to blocks.

Exam-trap caption mode adds: *Assuming the directory stores the block pointers. In the classic UNIX layout it stores only the name and the inode number; the pointers are in the inode.*

**0:15–0:22** — Opening one file costs three block reads here: the directory block, the inode, and the first data block.

> Caption: Opening one file costs three block reads here: the directory block, the inode, and the first data block.

Exam-trap caption mode adds: *Counting only the data block. The directory entry and the inode are disk reads too, and a question that says "assume nothing is cached" is asking you to count them.*

**0:22–0:30** — Every later question is one of: where do the blocks go, how big is the table, how many accesses does it cost.

> Caption: Every later question is one of: where do the blocks go, how big is the table, how many accesses does it cost.

Exam-trap caption mode adds: *Learning the allocation schemes as three unconnected facts. They differ only in what the inode holds: a start and a length, one pointer, or many pointers.*

## Scene 2. Three ways to place one file: contiguous, linked, indexed

*0:30 – 1:00 · objective: Place the same eight-block file three ways and read the fragmentation and access cost of each off the picture.*

**0:30–0:37** — Contiguous allocation gives the file one run of blocks. Fast to read, and it fragments the disk.

> Caption: Contiguous allocation gives the file one run of blocks. Fast to read, and it fragments the disk.

Exam-trap caption mode adds: *Thinking contiguous allocation wastes space inside a block. It wastes space between files - external fragmentation - which is a different failure from the internal fragmentation of the last block.*

**0:37–0:45** — Linked allocation stores the next block number inside each block. No external fragmentation, and no random access.

> Caption: Linked allocation stores the next block number inside each block. No external fragmentation, and no random access.

Exam-trap caption mode adds: *Forgetting that the pointer is stored in the block, which reduces the usable capacity of every block by the pointer width. That subtraction is the whole of the 2025 question.*

**0:45–0:52** — Indexed allocation puts all the pointers in one index block, so block k is one hop from the inode.

> Caption: Indexed allocation puts all the pointers in one index block, so block k is one hop from the inode.

Exam-trap caption mode adds: *Calling indexed allocation free of overhead. It removes external fragmentation but every file pays at least one index block, which is severe internal waste for a file of a few bytes.*

**0:52–1:00** — GATE 2017 Set 2: with no external fragmentation allowed, linked and indexed qualify, contiguous does not.

> Caption: GATE 2017 Set 2: with no external fragmentation allowed, linked and indexed qualify, contiguous does not.

Exam-trap caption mode adds: *Reading "no external fragmentation" as "no fragmentation at all". Both surviving schemes still waste the tail of the last block, and indexed allocation also wastes a whole index block for a small file.*

## Scene 3. Linked allocation and the file allocation table

*1:00 – 1:30 · objective: Turn the chain into a table, then compute the table size and the per-block pointer cost on two printed GATE configurations.*

**1:00–1:07** — A file allocation table lifts the chain out of the blocks: entry i holds the block after block i.

> Caption: A file allocation table lifts the chain out of the blocks: entry i holds the block after block i.

Exam-trap caption mode adds: *Confusing FAT with an inode. The FAT has one entry per block of the whole volume, not one per file, so its size grows with the disk, not with the number of files.*

**1:07–1:15** — GATE 2014 Set 2: 100,000 blocks of 1,000 bytes, so the table is 400,000 bytes and the data is 99.6 MB.

> Caption: GATE 2014 Set 2: 100,000 blocks of 1,000 bytes, so the table is 400,000 bytes and the data is 99.6 MB.

Exam-trap caption mode adds: *Computing the largest file as 100,000 blocks times 1,000 bytes and answering 100. The table occupies part of the same disk, and the question says so.*

**1:15–1:22** — GATE 2025 Set 1: a 4-byte pointer in every 64 KB block leaves 65,532 usable bytes, and 65,468 wasted.

> Caption: GATE 2025 Set 1: a 4-byte pointer in every 64 KB block leaves 65,532 usable bytes, and 65,468 wasted.

Exam-trap caption mode adds: *Subtracting the used bytes from the whole block, which gives 65,536 and ignores the pointer, or subtracting the 64 bytes from 65,536 instead of from the usable 65,532.*

**1:22–1:30** — The table is the price of the scheme. Count its blocks before you count the data.

> Caption: The table is the price of the scheme. Count its blocks before you count the data.

Exam-trap caption mode adds: *Reporting the number of data blocks when the question asks for the largest file in bytes, or the reverse. Write the unit into your working line before you compute.*

## Scene 4. Indexed allocation: how large a file an inode can address

*1:30 – 2:00 · objective: Build the pointer tree from direct, single and double indirect pointers, and compute the maximum file size.*

**1:30–1:37** — An inode holds a fixed number of pointers: some direct, then single, double and triple indirect.

> Caption: An inode holds a fixed number of pointers: some direct, then single, double and triple indirect.

Exam-trap caption mode adds: *Assuming the indirect blocks also hold data. They hold block numbers only; a file of one block still costs one data block and no indirect block, but a large file pays for the tree above it.*

**1:37–1:45** — GATE 2019: 4 KB blocks and 4-byte addresses give 1,024 pointers per block, so the largest file is 4.0 GB.

> Caption: GATE 2019: 4 KB blocks and 4-byte addresses give 1,024 pointers per block, so the largest file is 4.0 GB.

Exam-trap caption mode adds: *Adding the indirect blocks themselves into the count, or forgetting that the double indirect term is 1,024 squared and not 1,024 times two.*

**1:45–1:52** — GATE 2012: 128-byte blocks with 8-byte addresses give 16 pointers, and the answer is 35 KB, not 280.

> Caption: GATE 2012: 128-byte blocks with 8-byte addresses give 16 pointers, and the answer is 35 KB, not 280.

Exam-trap caption mode adds: *Answering with the block count. 280 is a block count and 280 KB is neither the count nor the size; the size is 280 times 128 bytes.*

**1:52–2:00** — The deepest term dominates. GATE 2004: with a triple indirect, 2^34 bytes, and the other terms vanish.

> Caption: The deepest term dominates. GATE 2004: with a triple indirect, 2^34 bytes, and the other terms vanish.

Exam-trap caption mode adds: *Assuming the direct pointers matter in a maximum-size question. They are rounding error at three levels of indirection; they matter only in questions about how many accesses a small file needs.*

## Scene 5. The cost of one insertion, counted in disk accesses

*2:00 – 2:30 · objective: Count reads and writes for the same insertion under contiguous and linked allocation, and add the two counts.*

**2:00–2:07** — Insert a block after the fiftieth of a hundred: contiguous must shift the rest, fifty reads and fifty-one writes.

> Caption: Insert a block after the fiftieth of a hundred: contiguous must shift the rest, fifty reads and fifty-one writes.

Exam-trap caption mode adds: *Forgetting the write of the new block itself, which gives 100. The question supplies the block data in memory precisely so that this one write is the only cost of inserting it.*

**2:07–2:15** — Linked allocation walks to the fiftieth block, writes the new block, and patches one pointer: 52 accesses.

> Caption: Linked allocation walks to the fiftieth block, writes the new block, and patches one pointer: 52 accesses.

Exam-trap caption mode adds: *Counting a read of the new block. Its contents are already in memory, so it is written once and never read.*

**2:15–2:22** — GATE 2022: 101 plus 52 is 153 disk accesses for the same insertion in the two schemes.

> Caption: GATE 2022: 101 plus 52 is 153 disk accesses for the same insertion in the two schemes.

Exam-trap caption mode adds: *Treating the two counts as the same because both files have a hundred blocks. The scheme decides the count, not the size, and that is the point of the question.*

**2:22–2:30** — Indexed allocation pays two accesses, or one if the index block is already in memory. State the assumption.

> Caption: Indexed allocation pays two accesses, or one if the index block is already in memory. State the assumption.

Exam-trap caption mode adds: *Answering a cached case with the cold count. When the question says the file control block or the index block is in memory, that access is free.*

## Scene 6. Free space: a bitmap, a linked list, and the arithmetic

*2:30 – 3:00 · objective: Compute the size of a bitmap and the number of blocks a free list needs, on a configuration of each kind.*

**2:30–2:37** — A bitmap spends one bit per block. A 1 TB disk of 4 KB blocks has 2^28 blocks, so the bitmap is 32 MB.

> Caption: A bitmap spends one bit per block. A 1 TB disk of 4 KB blocks has 2^28 blocks, so the bitmap is 32 MB.

Exam-trap caption mode adds: *Dividing bytes by eight and stopping, or forgetting that the answer is being asked in blocks rather than bytes. Both appear in the same question.*

**2:37–2:45** — The bitmap is easy to read and cheap to search for runs of free blocks; the list is smaller only when the disk is full.

> Caption: The bitmap is easy to read and cheap to search for runs of free blocks; the list is smaller only when the disk is full.

Exam-trap caption mode adds: *Thinking the list is always smaller. Its size depends on how many blocks are free; the bitmap size depends only on the disk size, and the two cross over.*

**2:45–2:52** — GATE 2026 Set 2: a list block holds 2,044 over 4, which is 511 numbers, so 8,388,608 free blocks need 16,417 list blocks.

> Caption: GATE 2026 Set 2: a list block holds (2,048 - 4) / 4 = 511 numbers, so 8,388,608 free blocks need 16,417 list blocks.

Exam-trap caption mode adds: *Using 2,048 / 4 = 512 and answering 16,384. The next pointer consumes one entry, and the difference between 512 and 511 changes the answer.*

**2:52–3:00** — Grouping stores many free numbers per block and keeps one pointer; counting stores one count per run of free blocks.

> Caption: Grouping stores many free numbers per block and keeps one pointer; counting stores one count per run of free blocks.

Exam-trap caption mode adds: *Treating grouping and counting as new formulas. Both are the same division: entries per block, then a ceiling.*

## Scene 7. From a name to a block: path resolution

*3:00 – 3:30 · objective: Walk a path component by component, count the reads, and see which directory operations need a full scan.*

**3:00–3:07** — Each component of a path is a directory lookup. Three components and no cache cost six block reads.

> Caption: Each component of a path is a directory lookup. Three components and no cache cost six block reads.

Exam-trap caption mode adds: *Counting one read per component. Each intermediate component costs a directory read and an inode read, which is why the count is not simply the number of slashes.*

**3:07–3:15** — A linear-list directory is searched entry by entry, so its cost is the position of the name, not a constant.

> Caption: A linear-list directory is searched entry by entry, so its cost is the position of the name, not a constant.

Exam-trap caption mode adds: *Assuming every directory operation costs a full scan. A search can stop when it finds the name; only operations that must prove absence need the whole list.*

**3:15–3:22** — GATE 2021 Set 1: creating and renaming need a full scan, because both must prove the name is free.

> Caption: GATE 2021 Set 1: creating and renaming need a full scan, because both must prove the name is free.

Exam-trap caption mode adds: *Assuming deletion scans fully. Deleting stops at the entry, and the question says "necessarily", which is the word that decides it.*

**3:22–3:30** — Mounting attaches a file system at a directory, so one tree can span several volumes.

> Caption: Mounting attaches a file system at a directory, so one tree can span several volumes.

Exam-trap caption mode adds: *Forgetting that the mount point is a directory in the parent file system. The mount does not create a new root; it grafts one tree onto another.*

## Scene 8. Hard links, symbolic links and the link count

*3:30 – 4:00 · objective: Follow the link count through creation and deletion, and separate the two kinds of link by what they point at.*

**3:30–3:37** — A hard link is a second name for the same inode, so the link count becomes two and no data is copied.

> Caption: A hard link is a second name for the same inode, so the link count becomes two and no data is copied.

Exam-trap caption mode adds: *Thinking a hard link is a copy. Editing through either name changes what the other name sees, because there is only one set of blocks.*

**3:37–3:45** — Deleting one name drops the count to one; the data is freed only when the count reaches zero.

> Caption: Deleting one name drops the count to one; the data is freed only when the count reaches zero.

Exam-trap caption mode adds: *Reporting free space recovered when one of two names is deleted. Nothing is freed until the last name goes.*

**3:45–3:52** — A symbolic link is a new inode holding a path, so it can dangle and it can cross file systems.

> Caption: A symbolic link is a new inode holding a path, so it can dangle and it can cross file systems.

Exam-trap caption mode adds: *Confusing the two counts. A symbolic link raises the target link count by zero; only hard links change it.*

**3:52–4:00** — Hard links cannot cross a file system, because the inode number is only unique within one volume.

> Caption: Hard links cannot cross a file system, because the inode number is only unique within one volume.

Exam-trap caption mode adds: *Expecting a hard link to work across a mount point. The kernel refuses, and the reason is the scope of an inode number.*

## Scene 9. What is wasted: the last block, the pointer, the inode table

*4:00 – 4:30 · objective: Compute internal fragmentation in the last block and the fixed limit an inode table puts on the number of files.*

**4:00–4:07** — A 10,000-byte file in 4 KB blocks occupies three blocks, and 2,288 bytes of the last one are wasted.

> Caption: A 10,000-byte file in 4 KB blocks occupies three blocks, and 2,288 bytes of the last one are wasted.

Exam-trap caption mode adds: *Confusing it with external fragmentation. Internal waste is inside a block you were given; external waste is free space you were not given because it is the wrong shape.*

**4:07–4:15** — The inode table is a fixed array, so a volume can run out of files while it still has free blocks.

> Caption: The inode table is a fixed array, so a volume can run out of files while it still has free blocks.

Exam-trap caption mode adds: *Assuming free space is the only limit on creating files. The inode count is a second, independent limit, and it is fixed at format time.*

**4:15–4:22** — Larger blocks raise throughput and waste more of the last block; the choice is a trade, not an optimum.

> Caption: Larger blocks raise throughput and waste more of the last block; the choice is a trade, not an optimum.

Exam-trap caption mode adds: *Answering that a larger block is better or worse without the trade-off. A one-line answer that ignores the other side of the trade is incomplete.*

**4:22–4:30** — Space questions are always about three things: the last block, the pointer, and the table.

> Caption: Space questions are always about three things: the last block, the pointer, and the table.

Exam-trap caption mode adds: *Memorising the numbers of past questions instead of the three subtractions. The numbers change with the configuration; the three subtractions do not.*

## Scene 10. The procedure for any question in this topic

*4:30 – 5:00 · objective: Fix a three-step procedure and the five traps that account for most lost marks here.*

**4:30–4:37** — Step one: convert everything to blocks first, rounding up, and write the block count down.

> Caption: Step one: convert everything to blocks first, rounding up, and write the block count down.

Exam-trap caption mode adds: *Working in MB and bytes in the same line. Convert once at the start and convert back only at the end.*

**4:37–4:45** — Step two: pointers per block is block size divided by address size, then sum the direct and indirect terms.

> Caption: Step two: pointers per block is block size divided by address size, then sum the direct and indirect terms.

Exam-trap caption mode adds: *Confusing the level of indirection with the exponent. Double indirect reaches fan-out squared blocks, not two blocks.*

**4:45–4:52** — Step three: for free space, pick bits or entries, subtract the link, and take a ceiling.

> Caption: Step three: for free space, pick bits or entries, subtract the link, and take a ceiling.

Exam-trap caption mode adds: *Rounding to nearest or down. A partial table block is still a block; only a ceiling is correct.*

**4:52–5:00** — Five traps: block count answered as bytes, the pointer forgotten, 512 instead of 511, the full-scan word, and the link count.

> Caption: Five traps: block count answered as bytes, the pointer forgotten, 512 instead of 511, the full-scan word, and the link count.

Exam-trap caption mode adds: *Reading the answer options before finishing the arithmetic. Two options usually differ only by one of these five slips, and choosing early locks the slip in.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
