/* ==========================================================================
   file-systems - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same model.
   Timings are estimates from a speaking rate, not measured from audio.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'anatomy',
      n: 1,
      title: 'A file system is three tables, not a folder',
      start: 0, end: 30,
      objective: 'Separate the name, the metadata and the bytes, and count what one open costs, so the rest of the topic has three objects to point at.'
    },
    {
      id: 'allocation',
      n: 2,
      title: 'Three ways to place one file: contiguous, linked, indexed',
      start: 30, end: 60,
      objective: 'Place the same eight-block file three ways and read the fragmentation and access cost of each off the picture.'
    },
    {
      id: 'fat',
      n: 3,
      title: 'Linked allocation and the file allocation table',
      start: 60, end: 90,
      objective: 'Turn the chain into a table, then compute the table size and the per-block pointer cost on two printed GATE configurations.'
    },
    {
      id: 'inode-size',
      n: 4,
      title: 'Indexed allocation: how large a file an inode can address',
      start: 90, end: 120,
      objective: 'Build the pointer tree from direct, single and double indirect pointers, and compute the maximum file size.'
    },
    {
      id: 'insert-cost',
      n: 5,
      title: 'The cost of one insertion, counted in disk accesses',
      start: 120, end: 150,
      objective: 'Count reads and writes for the same insertion under contiguous and linked allocation, and add the two counts.'
    },
    {
      id: 'free-space',
      n: 6,
      title: 'Free space: a bitmap, a linked list, and the arithmetic',
      start: 150, end: 180,
      objective: 'Compute the size of a bitmap and the number of blocks a free list needs, on a configuration of each kind.'
    },
    {
      id: 'path',
      n: 7,
      title: 'From a name to a block: path resolution',
      start: 180, end: 210,
      objective: 'Walk a path component by component, count the reads, and see which directory operations need a full scan.'
    },
    {
      id: 'links',
      n: 8,
      title: 'Hard links, symbolic links and the link count',
      start: 210, end: 240,
      objective: 'Follow the link count through creation and deletion, and separate the two kinds of link by what they point at.'
    },
    {
      id: 'fragments',
      n: 9,
      title: 'What is wasted: the last block, the pointer, the inode table',
      start: 240, end: 270,
      objective: 'Compute internal fragmentation in the last block and the fixed limit an inode table puts on the number of files.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure for any question in this topic',
      start: 270, end: 300,
      objective: 'Fix a three-step procedure and the five traps that account for most lost marks here.'
    }
  ],

  events: [
    /* ---------------- scene 1: anatomy ---------------- */
    {
      id: 'an-1', start: 0, end: 7.5, scene: 'anatomy',
      caption: 'A file is a named sequence of bytes. The name, the metadata and the bytes live in three different places.',
      detail: 'A file is the operating system abstraction for a named collection of related information. Three things are kept apart. The name and its inode number sit in a directory entry. The metadata - size, owner, times, and the pointers to the data - sits in an index node, or inode. The bytes themselves sit in disk blocks. Because the three are separate, a file can be renamed without moving a byte, and its blocks can be scattered anywhere on the disk.',
      keyword: 'three different places',
      trap: 'Treating the file name as the file. The name is an entry in a directory; two names can point at one inode, which is exactly what a hard link is.',
      narration: 'A file is a named sequence of bytes. The name, the metadata and the bytes live in three different places.'
    },
    {
      id: 'an-2', start: 7.5, end: 15, scene: 'anatomy',
      caption: 'Three tables: the directory maps a name to an inode number, the inode maps an inode number to blocks.',
      detail: 'The directory is a table of pairs: a name and an inode number. The inode is a fixed-size record holding the metadata and an array of block pointers. The data area is a numbered array of blocks. Every file-system question is a question about which of these three tables is being read, and how many blocks that read costs.',
      keyword: 'directory maps a name to an inode number',
      trap: 'Assuming the directory stores the block pointers. In the classic UNIX layout it stores only the name and the inode number; the pointers are in the inode.',
      narration: 'Three tables: the directory maps a name to an inode number, the inode maps an inode number to blocks.'
    },
    {
      id: 'an-3', start: 15, end: 22.5, scene: 'anatomy',
      caption: 'Opening one file costs three block reads here: the directory block, the inode, and the first data block.',
      detail: 'The directory block is read and searched for the name. The inode it names is read. The first pointer in the inode is followed and the data block is read. With nothing cached that is three accesses before a single byte of data is used, which is why real systems cache directory entries and inodes, and why a longer path costs more.',
      keyword: 'three block reads',
      trap: 'Counting only the data block. The directory entry and the inode are disk reads too, and a question that says "assume nothing is cached" is asking you to count them.',
      narration: 'Opening one file costs three block reads here: the directory block, the inode, and the first data block.'
    },
    {
      id: 'an-4', start: 22.5, end: 30, scene: 'anatomy',
      caption: 'Every later question is one of: where do the blocks go, how big is the table, how many accesses does it cost.',
      detail: 'The four remaining questions in this topic are all about these three tables. Allocation asks where the data blocks of one file go. The inode question asks how many blocks its pointer array can reach. Free-space management asks how the system remembers which data blocks are unused. Path resolution asks how many table reads a name costs. Hold the three-table picture and each of those becomes one picture with one arithmetic step.',
      keyword: 'where do the blocks go',
      trap: 'Learning the allocation schemes as three unconnected facts. They differ only in what the inode holds: a start and a length, one pointer, or many pointers.',
      narration: 'Every later question is one of: where do the blocks go, how big is the table, how many accesses does it cost.'
    },

    /* ---------------- scene 2: allocation ---------------- */
    {
      id: 'al-1', start: 30, end: 37.5, scene: 'allocation',
      caption: 'Contiguous allocation gives the file one run of blocks. Fast to read, and it fragments the disk.',
      detail: 'The inode stores a start block and a length, so block k of the file is start plus k. Reading the file sequentially or randomly is equally cheap, and the whole file can be read with one seek. The cost is external fragmentation: free space becomes holes, and a file cannot grow unless the next block happens to be free, so growth means copying the file elsewhere.',
      keyword: 'one run of blocks',
      trap: 'Thinking contiguous allocation wastes space inside a block. It wastes space between files - external fragmentation - which is a different failure from the internal fragmentation of the last block.',
      narration: 'Contiguous allocation gives the file one run of blocks. Fast to read, and it fragments the disk.'
    },
    {
      id: 'al-2', start: 37.5, end: 45, scene: 'allocation',
      caption: 'Linked allocation stores the next block number inside each block. No external fragmentation, and no random access.',
      detail: 'Each data block ends with a pointer to the next block, and the inode holds only the first and last block numbers. Any free block will do, so external fragmentation disappears and the file can grow one block at a time. The price is that reaching block k means following k pointers, so random access is a walk, and a single damaged pointer loses the rest of the file.',
      keyword: 'stores the next block number inside each block',
      trap: 'Forgetting that the pointer is stored in the block, which reduces the usable capacity of every block by the pointer width. That subtraction is the whole of the 2025 question.',
      narration: 'Linked allocation stores the next block number inside each block. No external fragmentation, and no random access.'
    },
    {
      id: 'al-3', start: 45, end: 52.5, scene: 'allocation',
      caption: 'Indexed allocation puts all the pointers in one index block, so block k is one hop from the inode.',
      detail: 'The inode points at an index block, and the index block holds the block numbers of the file in order. Random access costs one extra read of the index block and then one read of the data block, and the file can grow anywhere on the disk. For a file larger than one index block can describe, the index is extended into a tree - which is the multi-level inode of the next scene.',
      keyword: 'one index block',
      trap: 'Calling indexed allocation free of overhead. It removes external fragmentation but every file pays at least one index block, which is severe internal waste for a file of a few bytes.',
      narration: 'Indexed allocation puts all the pointers in one index block, so block k is one hop from the inode.'
    },
    {
      id: 'al-4', start: 52.5, end: 60, scene: 'allocation',
      caption: 'GATE 2017 Set 2: with no external fragmentation allowed, linked and indexed qualify, contiguous does not.',
      detail: 'The question lists contiguous, linked and indexed and asks which can be used if no external fragmentation is allowed. Contiguous needs one unbroken run, so free space can be unusable while being plentiful: that is external fragmentation by definition. Linked and indexed take any free block, so they never leave a hole too small to use. The answer is linked and indexed only.',
      keyword: 'linked and indexed qualify',
      trap: 'Reading "no external fragmentation" as "no fragmentation at all". Both surviving schemes still waste the tail of the last block, and indexed allocation also wastes a whole index block for a small file.',
      narration: 'GATE 2017 Set 2: with no external fragmentation allowed, linked and indexed qualify, contiguous does not.'
    },

    /* ---------------- scene 3: FAT ---------------- */
    {
      id: 'fa-1', start: 60, end: 67.5, scene: 'fat',
      caption: 'A file allocation table lifts the chain out of the blocks: entry i holds the block after block i.',
      detail: 'In a FAT file system the next-block pointers are collected into one table at the start of the volume. Entry i of the table corresponds to block i of the volume, and holds the number of the next block of that file, or a marker for end of file, or a marker for free. Because the table is small enough to be cached in memory, following a chain becomes a memory walk rather than a disk walk, which is the whole reason FAT was fast for its time.',
      keyword: 'entry i holds the block after block i',
      trap: 'Confusing FAT with an inode. The FAT has one entry per block of the whole volume, not one per file, so its size grows with the disk, not with the number of files.',
      narration: 'A file allocation table lifts the chain out of the blocks: entry i holds the block after block i.'
    },
    {
      id: 'fa-2', start: 67.5, end: 75, scene: 'fat',
      caption: 'GATE 2014 Set 2: 100,000 blocks of 1,000 bytes, so the table is 400,000 bytes and the data is 99.6 MB.',
      detail: 'A disk of 100 million bytes with 1,000-byte blocks holds 100,000 blocks. Each FAT entry costs 4 bytes, so the table costs 400,000 bytes, which is 400 blocks of the disk. Those blocks are not available for data, so the largest file is 100,000,000 minus 400,000 bytes, which is 99.6 million bytes. The question asks for the answer in millions of bytes, so 99.6 is the answer.',
      keyword: 'the table is 400,000 bytes',
      trap: 'Computing the largest file as 100,000 blocks times 1,000 bytes and answering 100. The table occupies part of the same disk, and the question says so.',
      narration: 'GATE 2014 Set 2: 100,000 blocks of 1,000 bytes, so the table is 400,000 bytes and the data is 99.6 MB.'
    },
    {
      id: 'fa-3', start: 75, end: 82.5, scene: 'fat',
      caption: 'GATE 2025 Set 1: a 4-byte pointer in every 64 KB block leaves 65,532 usable bytes, and 65,468 wasted.',
      detail: 'With 64 KB blocks each block loses 4 bytes to the next pointer, so it carries 65,532 bytes of data. A file of 1 MB is 1,048,576 bytes. Sixteen blocks hold 1,048,512 bytes, which is 64 bytes short, so a seventeenth block is needed and 64 bytes of it are used. The waste is the unused usable space in that last block: 65,532 minus 64, which is 65,468 bytes.',
      keyword: '65,532 usable bytes',
      trap: 'Subtracting the used bytes from the whole block, which gives 65,536 and ignores the pointer, or subtracting the 64 bytes from 65,536 instead of from the usable 65,532.',
      narration: 'GATE 2025 Set 1: a 4-byte pointer in every 64 KB block leaves 65,532 usable bytes, and 65,468 wasted.'
    },
    {
      id: 'fa-4', start: 82.5, end: 90, scene: 'fat',
      caption: 'The table is the price of the scheme. Count its blocks before you count the data.',
      detail: 'A FAT-based system pays for the table on every volume, whether or not the files are large. A 100 million byte disk with 1,000-byte blocks spends 0.4 per cent of itself on the table; a disk with smaller blocks spends proportionally more, because there are more blocks and so more entries. That is the same trade-off as block size in general: smaller blocks waste less in the last block and need a bigger table.',
      keyword: 'The table is the price of the scheme',
      trap: 'Reporting the number of data blocks when the question asks for the largest file in bytes, or the reverse. Write the unit into your working line before you compute.',
      narration: 'The table is the price of the scheme. Count its blocks before you count the data.'
    },

    /* ---------------- scene 4: inode size ---------------- */
    {
      id: 'in-1', start: 90, end: 97.5, scene: 'inode-size',
      caption: 'An inode holds a fixed number of pointers: some direct, then single, double and triple indirect.',
      detail: 'A fixed-size inode cannot hold a pointer for every block of an arbitrarily large file, so it holds a small number of direct pointers plus pointers to blocks of pointers. A single indirect pointer points at a block full of block numbers. A double indirect pointer points at a block of pointers to such blocks. The structure is a tree whose depth is the level of indirection.',
      keyword: 'direct, then single, double and triple indirect',
      trap: 'Assuming the indirect blocks also hold data. They hold block numbers only; a file of one block still costs one data block and no indirect block, but a large file pays for the tree above it.',
      narration: 'An inode holds a fixed number of pointers: some direct, then single, double and triple indirect.'
    },
    {
      id: 'in-2', start: 97.5, end: 105, scene: 'inode-size',
      caption: 'GATE 2019: 4 KB blocks and 4-byte addresses give 1,024 pointers per block, so the largest file is 4.0 GB.',
      detail: 'The inode has 12 direct, one single-indirect and one double-indirect pointer. A 4 KB block divided by a 4-byte address holds 1,024 block numbers. The direct pointers reach 12 blocks, the single indirect reaches 1,024, and the double indirect reaches 1,024 squared. The total is 1,049,612 blocks of 4 KB, which is 4,299,210,752 bytes, or 4.00395 GB. Rounded to one decimal place the answer is 4.0 GB.',
      keyword: '1,024 pointers per block',
      trap: 'Adding the indirect blocks themselves into the count, or forgetting that the double indirect term is 1,024 squared and not 1,024 times two.',
      narration: 'GATE 2019: 4 KB blocks and 4-byte addresses give 1,024 pointers per block, so the largest file is 4.0 GB.'
    },
    {
      id: 'in-3', start: 105, end: 112.5, scene: 'inode-size',
      caption: 'GATE 2012: 128-byte blocks with 8-byte addresses give 16 pointers, and the answer is 35 KB, not 280.',
      detail: 'Eight direct, one indirect and one doubly indirect pointer. A 128-byte block holds 16 addresses of 8 bytes. Direct reaches 8 blocks, single indirect 16, and double indirect 256, which totals 280 blocks of 128 bytes, or 35,840 bytes, or 35 KB. The distractor 280 is the block count; the question asks for bytes.',
      keyword: '16 pointers',
      trap: 'Answering with the block count. 280 is a block count and 280 KB is neither the count nor the size; the size is 280 times 128 bytes.',
      narration: 'GATE 2012: 128-byte blocks with 8-byte addresses give 16 pointers, and the answer is 35 KB, not 280.'
    },
    {
      id: 'in-4', start: 112.5, end: 120, scene: 'inode-size',
      caption: 'The deepest term dominates. GATE 2004: with a triple indirect, 2^34 bytes, and the other terms vanish.',
      detail: 'With 10 direct, one single, one double and one triple indirect pointer, 1 KB blocks and 4-byte addresses, one block holds 256 addresses. The triple indirect term reaches 256 cubed blocks, which is 16,777,216 blocks of 1 KB, or 2^34 bytes. The direct term is 10 KB and the single indirect 256 KB; together they are 0.0015 per cent of the answer, which is why the option 2^34 is right and the exact sum is not needed.',
      keyword: 'The deepest term dominates',
      trap: 'Assuming the direct pointers matter in a maximum-size question. They are rounding error at three levels of indirection; they matter only in questions about how many accesses a small file needs.',
      narration: 'The deepest term dominates. GATE 2004: with a triple indirect, 2^34 bytes, and the other terms vanish.'
    },

    /* ---------------- scene 5: insert cost ---------------- */
    {
      id: 'ic-1', start: 120, end: 127.5, scene: 'insert-cost',
      caption: 'Insert a block after the fiftieth of a hundred: contiguous must shift the rest, fifty reads and fifty-one writes.',
      detail: 'In contiguous allocation the blocks must stay in order, so a new block in the middle pushes every later block one place along. That means reading and rewriting blocks 51 to 100 - fifty reads and fifty writes - plus one write for the new block itself. The count is 101 disk accesses, and the file control block is already in memory so it is not counted.',
      keyword: 'fifty reads and fifty-one writes',
      trap: 'Forgetting the write of the new block itself, which gives 100. The question supplies the block data in memory precisely so that this one write is the only cost of inserting it.',
      narration: 'Insert a block after the fiftieth of a hundred: contiguous must shift the rest, fifty reads and fifty-one writes.'
    },
    {
      id: 'ic-2', start: 127.5, end: 135, scene: 'insert-cost',
      caption: 'Linked allocation walks to the fiftieth block, writes the new block, and patches one pointer: 52 accesses.',
      detail: 'A linked file has no order to preserve on disk, so nothing is shifted. The system reads blocks 1 to 50 to reach the fiftieth, writes the new block with its pointer set to the old next block, and rewrites the fiftieth block with its pointer set to the new block. Fifty reads and two writes is 52 accesses.',
      keyword: 'patches one pointer',
      trap: 'Counting a read of the new block. Its contents are already in memory, so it is written once and never read.',
      narration: 'Linked allocation walks to the fiftieth block, writes the new block, and patches one pointer: 52 accesses.'
    },
    {
      id: 'ic-3', start: 135, end: 142.5, scene: 'insert-cost',
      caption: 'GATE 2022: 101 plus 52 is 153 disk accesses for the same insertion in the two schemes.',
      detail: 'The question gives two file systems, one contiguous and one linked, each holding a hundred-block file, and asks for the sum of the accesses needed to insert a block after the fiftieth. The contiguous system needs 101 and the linked system needs 52, so the answer is 153. Nothing about the block size or the disk geometry enters the count; only the scheme does.',
      keyword: '101 plus 52 is 153',
      trap: 'Treating the two counts as the same because both files have a hundred blocks. The scheme decides the count, not the size, and that is the point of the question.',
      narration: 'GATE 2022: 101 plus 52 is 153 disk accesses for the same insertion in the two schemes.'
    },
    {
      id: 'ic-4', start: 142.5, end: 150, scene: 'insert-cost',
      caption: 'Indexed allocation pays two accesses, or one if the index block is already in memory. State the assumption.',
      detail: 'With indexed allocation the index block holds every block number, so inserting means reading the index block if it is not resident, writing the new data block, and writing the index block back. That is three accesses cold and two warm. Because the assumption changes the answer, a question about indexed insertion always says whether the index block is cached, and a question that does not say is ambiguous.',
      keyword: 'State the assumption',
      trap: 'Answering a cached case with the cold count. When the question says the file control block or the index block is in memory, that access is free.',
      narration: 'Indexed allocation pays two accesses, or one if the index block is already in memory. State the assumption.'
    },

    /* ---------------- scene 6: free space ---------------- */
    {
      id: 'fs-1', start: 150, end: 157.5, scene: 'free-space',
      caption: 'A bitmap spends one bit per block. A 1 TB disk of 4 KB blocks has 2^28 blocks, so the bitmap is 32 MB.',
      detail: 'One terabyte is 2^40 bytes and a 4 KB block is 2^12 bytes, so the disk has 2^28 blocks. One bit each is 2^28 bits, which is 2^25 bytes, or 32 MB, or 8,192 blocks of 4 KB. That is the whole cost of the scheme: a fixed fraction of the disk, one bit per block, no matter how many files there are.',
      keyword: 'one bit per block',
      trap: 'Dividing bytes by eight and stopping, or forgetting that the answer is being asked in blocks rather than bytes. Both appear in the same question.',
      narration: 'A bitmap spends one bit per block. A 1 TB disk of 4 KB blocks has 2^28 blocks, so the bitmap is 32 MB.'
    },
    {
      id: 'fs-2', start: 157.5, end: 165, scene: 'free-space',
      caption: 'The bitmap is easy to read and cheap to search for runs of free blocks; the list is smaller only when the disk is full.',
      detail: 'Finding one free block in a bitmap is a scan of words, and finding n consecutive free blocks - which contiguous allocation needs - is a scan of bit patterns, both fast. A linked list of free blocks instead stores free block numbers in the free blocks themselves, so it costs nothing until you need a block, but finding a run means following a chain. Real systems use bitmaps and their variants for that reason.',
      keyword: 'cheap to search for runs',
      trap: 'Thinking the list is always smaller. Its size depends on how many blocks are free; the bitmap size depends only on the disk size, and the two cross over.',
      narration: 'The bitmap is easy to read and cheap to search for runs of free blocks; the list is smaller only when the disk is full.'
    },
    {
      id: 'fs-3', start: 165, end: 172.5, scene: 'free-space',
      caption: 'GATE 2026 Set 2: a list block holds (2,048 - 4) / 4 = 511 numbers, so 8,388,608 free blocks need 16,417 list blocks.',
      detail: 'A 16 GB disk of 2 KB blocks has 8,388,608 blocks, and every one of them is free in the worst case. Each list block is 2,048 bytes and spends 4 bytes on the pointer to the next list block, leaving 2,044 bytes, which holds 511 block numbers of 4 bytes. Dividing 8,388,608 by 511 gives 16,416.06, and a block cannot be split, so 16,417 list blocks are needed.',
      keyword: '511 numbers',
      trap: 'Using 2,048 / 4 = 512 and answering 16,384. The next pointer consumes one entry, and the difference between 512 and 511 changes the answer.',
      narration: 'GATE 2026 Set 2: a list block holds 2,044 over 4, which is 511 numbers, so 8,388,608 free blocks need 16,417 list blocks.'
    },
    {
      id: 'fs-4', start: 172.5, end: 180, scene: 'free-space',
      caption: 'Grouping stores many free numbers per block and keeps one pointer; counting stores one count per run of free blocks.',
      detail: 'Grouping is a linked list whose blocks each hold a batch of free block numbers, which reduces the number of list blocks needed at the cost of extra bookkeeping. Counting stores a pair - first free block, number of consecutive free blocks - per entry, which is compact on a disk that is mostly free and useless on a fragmented one. Neither is in the syllabus as a named technique, but both are the same arithmetic with a different number of entries per block.',
      keyword: 'Grouping',
      trap: 'Treating grouping and counting as new formulas. Both are the same division: entries per block, then a ceiling.',
      narration: 'Grouping stores many free numbers per block and keeps one pointer; counting stores one count per run of free blocks.'
    },

    /* ---------------- scene 7: path resolution ---------------- */
    {
      id: 'pa-1', start: 180, end: 187.5, scene: 'path',
      caption: 'Each component of a path is a directory lookup. Three components and no cache cost six block reads.',
      detail: 'To open /usr/lib/libc.so the system reads the root directory, finds usr, reads the inode of usr, reads the usr directory, finds lib, reads the inode of lib, reads the lib directory, and finds libc.so. Then it reads that file inode. With each lookup in its own block and nothing cached, that is six reads before any data. Caching directory entries and inodes is what makes a long path cheap in practice.',
      keyword: 'six block reads',
      trap: 'Counting one read per component. Each intermediate component costs a directory read and an inode read, which is why the count is not simply the number of slashes.',
      narration: 'Each component of a path is a directory lookup. Three components and no cache cost six block reads.'
    },
    {
      id: 'pa-2', start: 187.5, end: 195, scene: 'path',
      caption: 'A linear-list directory is searched entry by entry, so its cost is the position of the name, not a constant.',
      detail: 'In the simplest implementation a directory is a list of entries in no particular order. Looking up a name means comparing until it is found, so the average cost is half the directory and the worst case is all of it. A hash table or a B-tree directory makes lookup close to constant, which is why real file systems use one.',
      keyword: 'searched entry by entry',
      trap: 'Assuming every directory operation costs a full scan. A search can stop when it finds the name; only operations that must prove absence need the whole list.',
      narration: 'A linear-list directory is searched entry by entry, so its cost is the position of the name, not a constant.'
    },
    {
      id: 'pa-3', start: 195, end: 202.5, scene: 'path',
      caption: 'GATE 2021 Set 1: creating and renaming need a full scan, because both must prove the name is free.',
      detail: 'Creation must be sure no entry with that name exists, so it scans the whole directory. Renaming must be sure the new name is free, so it also scans. Deletion and opening stop as soon as the name is found, so neither necessarily scans everything. The answer to the multiple-select question is creation and renaming.',
      keyword: 'must prove the name is free',
      trap: 'Assuming deletion scans fully. Deleting stops at the entry, and the question says "necessarily", which is the word that decides it.',
      narration: 'GATE 2021 Set 1: creating and renaming need a full scan, because both must prove the name is free.'
    },
    {
      id: 'pa-4', start: 202.5, end: 210, scene: 'path',
      caption: 'Mounting attaches a file system at a directory, so one tree can span several volumes.',
      detail: 'A mounted file system is reached through a directory of another file system, called the mount point. The root of the mounted volume replaces or hides the contents of that directory, and the path from the global root continues into the new volume. This is why the root directory of a disk must be at a fixed, known location: the system has to find it before any path can be resolved.',
      keyword: 'Mounting',
      trap: 'Forgetting that the mount point is a directory in the parent file system. The mount does not create a new root; it grafts one tree onto another.',
      narration: 'Mounting attaches a file system at a directory, so one tree can span several volumes.'
    },

    /* ---------------- scene 8: links ---------------- */
    {
      id: 'li-1', start: 210, end: 217.5, scene: 'links',
      caption: 'A hard link is a second name for the same inode, so the link count becomes two and no data is copied.',
      detail: 'Creating a hard link adds a directory entry pointing at an existing inode and increments the inode link count. There is one inode and one set of data blocks, so the two names are indistinguishable: same size, same times, same permissions, same content. The link count is the only record of how many names there are.',
      keyword: 'second name for the same inode',
      trap: 'Thinking a hard link is a copy. Editing through either name changes what the other name sees, because there is only one set of blocks.',
      narration: 'A hard link is a second name for the same inode, so the link count becomes two and no data is copied.'
    },
    {
      id: 'li-2', start: 217.5, end: 225, scene: 'links',
      caption: 'Deleting one name drops the count to one; the data is freed only when the count reaches zero.',
      detail: 'Unlinking a name removes the directory entry and decrements the link count. While the count is above zero the inode and its blocks stay, so the file still exists under its other name. At zero the inode is freed and its blocks return to the free list. A process that still has the file open can keep reading it even after the last name is gone, because the open file holds the inode.',
      keyword: 'count reaches zero',
      trap: 'Reporting free space recovered when one of two names is deleted. Nothing is freed until the last name goes.',
      narration: 'Deleting one name drops the count to one; the data is freed only when the count reaches zero.'
    },
    {
      id: 'li-3', start: 225, end: 232.5, scene: 'links',
      caption: 'A symbolic link is a new inode holding a path, so it can dangle and it can cross file systems.',
      detail: 'A symbolic link is a small file whose content is the path of the target. It has its own inode, so it can point at a name that does not exist, and it can point into another file system or another machine. Following it costs an extra lookup, and if the target is removed the link remains and fails only when it is followed.',
      keyword: 'a new inode holding a path',
      trap: 'Confusing the two counts. A symbolic link raises the target link count by zero; only hard links change it.',
      narration: 'A symbolic link is a new inode holding a path, so it can dangle and it can cross file systems.'
    },
    {
      id: 'li-4', start: 232.5, end: 240, scene: 'links',
      caption: 'Hard links cannot cross a file system, because the inode number is only unique within one volume.',
      detail: 'An inode number is an index into one volume inode table, so a directory entry in another volume could not refer to it. Symbolic links carry a path instead, so they cross volumes and machines freely. That single fact explains both the limitation of hard links and the reason symbolic links exist at all.',
      keyword: 'only unique within one volume',
      trap: 'Expecting a hard link to work across a mount point. The kernel refuses, and the reason is the scope of an inode number.',
      narration: 'Hard links cannot cross a file system, because the inode number is only unique within one volume.'
    },

    /* ---------------- scene 9: fragments ---------------- */
    {
      id: 'fr-1', start: 240, end: 247.5, scene: 'fragments',
      caption: 'A 10,000-byte file in 4 KB blocks occupies three blocks, and 2,288 bytes of the last one are wasted.',
      detail: 'Ten thousand bytes divided by 4,096 is 2.44, so three blocks are allocated and 12,288 bytes are reserved. The difference, 2,288 bytes, is internal fragmentation: space inside an allocated block that no file can use. It is the price of fixed blocks, and it is why block size is a trade-off rather than a constant to memorise.',
      keyword: '2,288 bytes',
      trap: 'Confusing it with external fragmentation. Internal waste is inside a block you were given; external waste is free space you were not given because it is the wrong shape.',
      narration: 'A 10,000-byte file in 4 KB blocks occupies three blocks, and 2,288 bytes of the last one are wasted.'
    },
    {
      id: 'fr-2', start: 247.5, end: 255, scene: 'fragments',
      caption: 'The inode table is a fixed array, so a volume can run out of files while it still has free blocks.',
      detail: 'The number of inodes is decided when the file system is created. With a million inodes of 128 bytes each, the table is 128 MB and the volume can never hold more than a million files, however much space remains. Running out of inodes is a real failure mode on volumes holding many small files, and the only fix is to recreate the file system with more.',
      keyword: 'run out of files',
      trap: 'Assuming free space is the only limit on creating files. The inode count is a second, independent limit, and it is fixed at format time.',
      narration: 'The inode table is a fixed array, so a volume can run out of files while it still has free blocks.'
    },
    {
      id: 'fr-3', start: 255, end: 262.5, scene: 'fragments',
      caption: 'Larger blocks raise throughput and waste more of the last block; the choice is a trade, not an optimum.',
      detail: 'A larger block means fewer blocks, a smaller allocation table, and longer contiguous transfers, so throughput rises. It also means a larger average tail waste per file, since a file wastes on average half a block. Small blocks do the reverse. There is no single best size; the answer depends on the mix of file sizes the volume will hold.',
      keyword: 'Larger blocks raise throughput',
      trap: 'Answering that a larger block is better or worse without the trade-off. A one-line answer that ignores the other side of the trade is incomplete.',
      narration: 'Larger blocks raise throughput and waste more of the last block; the choice is a trade, not an optimum.'
    },
    {
      id: 'fr-4', start: 262.5, end: 270, scene: 'fragments',
      caption: 'Space questions are always about three things: the last block, the pointer, and the table.',
      detail: 'The last block of every file wastes part of itself. Every scheme with a pointer inside a block loses pointer width from the usable capacity. Every scheme with a table - the FAT, the inode array, the bitmap - spends part of the disk on the table. Those three sentences answer nearly every space question in this topic, and each of them is one subtraction or one division.',
      keyword: 'the last block, the pointer, and the table',
      trap: 'Memorising the numbers of past questions instead of the three subtractions. The numbers change with the configuration; the three subtractions do not.',
      narration: 'Space questions are always about three things: the last block, the pointer, and the table.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: convert everything to blocks first, rounding up, and write the block count down.',
      detail: 'Almost every error in this topic is a units error. Convert the disk size and the block size to the same unit, divide, and round up because a partly used block is still a block. Write the block count and the pointers-per-block count on the page before touching the question, and the arithmetic that follows is one line.',
      keyword: 'convert everything to blocks first',
      trap: 'Working in MB and bytes in the same line. Convert once at the start and convert back only at the end.',
      narration: 'Step one: convert everything to blocks first, rounding up, and write the block count down.'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step two: pointers per block is block size divided by address size, then sum the direct and indirect terms.',
      detail: 'One division gives the fan-out of the tree. Then write the four terms explicitly - direct, single, double, triple - multiply each by the block size, and add. In a maximum-size question the deepest term dominates, so check which term is present before doing the sum: with no triple indirect, the double indirect is the answer.',
      keyword: 'pointers per block',
      trap: 'Confusing the level of indirection with the exponent. Double indirect reaches fan-out squared blocks, not two blocks.',
      narration: 'Step two: pointers per block is block size divided by address size, then sum the direct and indirect terms.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'Step three: for free space, pick bits or entries, subtract the link, and take a ceiling.',
      detail: 'A bitmap costs one bit per block, so the count of bits is the count of blocks, and dividing by eight gives bytes. A free list costs entries per block, which is block size minus the link, divided by the block number width. In both cases the answer is a ceiling, because the last table block holds a partial set.',
      keyword: 'take a ceiling',
      trap: 'Rounding to nearest or down. A partial table block is still a block; only a ceiling is correct.',
      narration: 'Step three: for free space, pick bits or entries, subtract the link, and take a ceiling.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'Five traps: block count answered as bytes, the pointer forgotten, 512 instead of 511, the full-scan word, and the link count.',
      detail: 'One: giving the block count when bytes are asked for, as in 280 against 35 KB. Two: forgetting the pointer stored inside each data block. Three: using block size divided by address size without subtracting the free-list link. Four: missing the word "necessarily" in a directory-scan question. Five: assuming deleting one of two hard links frees space. Those five account for most of the lost marks in this topic.',
      keyword: 'Five traps',
      trap: 'Reading the answer options before finishing the arithmetic. Two options usually differ only by one of these five slips, and choosing early locks the slip in.',
      narration: 'Five traps: block count answered as bytes, the pointer forgotten, 512 instead of 511, the full-scan word, and the link count.'
    }
  ]
};
