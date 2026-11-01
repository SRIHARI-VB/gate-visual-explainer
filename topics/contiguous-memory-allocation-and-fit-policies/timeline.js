/* ==========================================================================
   contiguous-memory-allocation-and-fit-policies — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js, which
   builds the 1024 KB fixed-partition layout, the 2500 KB address space with its
   six holes, all four placement traces, the compaction move, an exhaustive
   leftover comparison and a seeded allocation simulation, and re-checks each
   claim before anything is drawn.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 306,

  scenes: [
    {
      id: 'map', n: 1,
      title: 'One process, one uninterrupted block',
      start: 0, end: 24,
      objective: 'State the assumption every scheme on this page rests on, and name the two questions it leaves open: where the block goes, and what happens to the space it leaves.'
    },
    {
      id: 'fixed', n: 2,
      title: 'Fixed partitioning: partitions first, processes second',
      start: 24, end: 56,
      objective: 'Carve 1024 KB into eight 128 KB partitions, place five processes, and account for every byte: 191 KB of internal waste and 384 KB in three partitions nobody can use.'
    },
    {
      id: 'variable', n: 3,
      title: 'Variable partitioning: the partition is cut to fit',
      start: 56, end: 82,
      objective: 'Place a request by splitting a hole, see that the remainder is hole minus request, and state the coalescing rule that decides whether two free pieces become one.'
    },
    {
      id: 'firstfit', n: 4,
      title: 'First fit, traced request by request',
      start: 82, end: 114,
      objective: 'Run the four-request stream through first fit, writing the leftover at each step, and see the fourth request refused while 1215 KB is free.'
    },
    {
      id: 'bestworst', n: 5,
      title: 'Best fit and worst fit on the same stream',
      start: 114, end: 142,
      objective: 'Place four requests with best fit and two with worst fit on identical holes, and read the consequence in the number of placements, not in the name of the policy.'
    },
    {
      id: 'nextfit', n: 6,
      title: 'Next fit and the rover',
      start: 142, end: 166,
      objective: 'Resume the scan where the last allocation stopped, and see a searched witness where the same holes and requests give a different leftover from first fit.'
    },
    {
      id: 'external', n: 7,
      title: 'External fragmentation, measured',
      start: 166, end: 194,
      objective: 'Separate a capacity shortage from a shape problem using two numbers: total free space and the largest single hole.'
    },
    {
      id: 'twofrags', n: 8,
      title: 'Internal against external',
      start: 194, end: 220,
      objective: 'Decide which kind of waste a layout has by asking who owns the wasted bytes, and see that compaction cures only one of the two.'
    },
    {
      id: 'compaction', n: 9,
      title: 'Compaction: what it buys and what it costs',
      start: 220, end: 248,
      objective: 'Pack the live blocks, count the 1285 KB that must be copied, and state the two conditions under which compaction is possible at all.'
    },
    {
      id: 'notbest', n: 10,
      title: 'Best fit is a name, not a result',
      start: 248, end: 276,
      objective: 'Trace a 1994 paper question in which first fit places all four requests and best fit places three, and see why the better-looking policy loses.'
    },
    {
      id: 'procedure', n: 11,
      title: 'The procedure that answers the question',
      start: 276, end: 306,
      objective: 'Fix what the question fixes, trace mechanically in address order, then run the two diagnostics — internal or external, capacity or shape.'
    }
  ],

  events: [
    /* ---------------------------- scene 1 ---------------------------- */
    { id: 's1a', scene: 'map', start: 0, end: 8,
      caption: 'Contiguous allocation gives a process one uninterrupted run of physical memory.',
      detail: 'Every scheme on this page — fixed partitions, variable partitions, first fit, best fit, next fit, worst fit — assumes that a process occupies a single interval of physical addresses with no other process inside it. The base register holds the lowest address and the limit register holds the length, so one comparison protects the whole block.',
      narration: 'Contiguous allocation gives a process one uninterrupted run of physical memory.',
      keyword: 'one uninterrupted run',
      trap: 'A question that says "the process must be loaded in one block" is a contiguous-allocation question. A question that says "frames" is not.' },

    { id: 's1b', scene: 'map', start: 8, end: 16,
      caption: 'That single assumption leaves two questions open: where the block goes, and what happens to the space left over.',
      detail: 'The first question is the placement policy: when several free blocks are large enough, which one do you take? The second is fragmentation: as processes arrive and leave, the free space changes shape, and a layout that fits today may refuse tomorrow. Both questions are answered by arithmetic on a list of blocks, not by a definition to memorise.',
      narration: 'That assumption leaves two questions open: where the block goes, and what happens to the space it leaves.',
      keyword: 'two questions',
      trap: 'The syllabus names "memory management" and not "first fit" — the placement policies are the machinery inside that clause, and they are what a numerical question asks about.' },

    { id: 's1c', scene: 'map', start: 16, end: 24,
      caption: 'The whole topic is one list of blocks and one subtraction per request.',
      detail: 'A memory is a list of segments in address order. Each is either free, in which case it is called a hole, or in use. Placing a request of size P in a hole of size H gives the process P bytes and returns a hole of H minus P bytes at the next address. Every policy differs only in which hole it chooses, and every fragmentation question is a question about the shape of what remains.',
      narration: 'The whole topic is one list of blocks and one subtraction per request.',
      keyword: 'one subtraction per request',
      trap: 'If H equals P the hole disappears rather than becoming a zero-byte hole. Counting it as a hole gives the wrong number of holes.' },

    /* ---------------------------- scene 2 ---------------------------- */
    { id: 's2a', scene: 'fixed', start: 24, end: 32,
      caption: 'Fixed partitioning: 1024 KB is cut into eight partitions of 128 KB before any process exists.',
      detail: 'The division is done once, at system start. The number of partitions is the degree of multiprogramming: at most eight processes can be in memory, however small they are. 1024 divided by 128 is exactly 8, so no byte is left outside a partition.',
      narration: 'Fixed partitioning cuts memory into equal pieces before any process exists. Here, eight partitions of one hundred and twenty-eight kilobytes.',
      keyword: 'before any process exists',
      trap: 'Unequal fixed partitions are a variant: the count is still fixed, but the sizes differ. A question that gives partition sizes of 100, 200 and 500 KB is still fixed partitioning.' },

    { id: 's2b', scene: 'fixed', start: 32, end: 40,
      caption: 'Five processes are placed, and the unused part of each partition is wasted inside it: 18, 33, 0, 88 and 52 KB.',
      detail: 'P1 asks for 110 KB and gets a 128 KB partition, so 18 KB of that partition is unused. P2 asks for 95 and wastes 33. P3 asks for exactly 128 and wastes nothing. P4 asks for 40 and wastes 88. P5 asks for 76 and wastes 52. The total is 191 KB, and the allocator cannot offer any of it to another process, because it has already been assigned.',
      narration: 'Five processes are placed, and the part of each partition they do not use is wasted inside it. One hundred and ninety-one kilobytes in total.',
      keyword: '191 KB',
      trap: 'Internal waste is partition size minus request size. Subtracting the other way round, or forgetting that P3 wastes nothing, both give a wrong total.' },

    { id: 's2c', scene: 'fixed', start: 40, end: 48,
      caption: 'P6 asks for 130 KB and cannot run, although three partitions are free.',
      detail: 'A partition is a container of one fixed size. 130 KB is larger than 128 KB, so no partition can hold it, and the process waits outside memory while 384 KB sits unused in three empty partitions. This is the characteristic failure of fixed partitioning, and it is not a shortage of memory.',
      narration: 'A sixth process asks for a hundred and thirty kilobytes and cannot run, although three partitions are free.',
      keyword: 'cannot run',
      trap: 'The answer to "why is this process not scheduled" is not always "not enough memory". Here 384 KB is free and the answer is still no.' },

    { id: 's2d', scene: 'fixed', start: 48, end: 56,
      caption: 'The account: 449 KB in use, 191 KB internal waste, 384 KB in free partitions, so 575 KB of 1024 is unusable.',
      detail: '449 plus 191 plus 384 is 1024, so nothing is lost from the arithmetic. The 575 KB is 56.2 per cent of memory, and it is the sum of two different failures: the internal waste that no policy can reach, and the free partitions that are the wrong size for the next process.',
      narration: 'Four hundred and forty-nine kilobytes in use, one hundred and ninety-one wasted inside partitions, three hundred and eighty-four in empty ones. Five hundred and seventy-five of the thousand and twenty-four kilobytes are unusable.',
      keyword: '575 KB',
      trap: 'Internal waste and free partitions are both "waste" but they are not the same thing, and only the second could have been used by a differently sized process.' },

    /* ---------------------------- scene 3 ---------------------------- */
    { id: 's3a', scene: 'variable', start: 56, end: 65,
      caption: 'Variable partitioning: 2500 KB holding six holes of 200, 400, 600, 500, 300 and 250 KB.',
      detail: 'The six hole sizes are the configuration of a real past question. Between them sit blocks that other processes already hold, which is why the holes are not adjacent: 2500 minus 2250 leaves 250 KB in five blocks of 50 KB. Address order is preserved, because first fit and next fit both depend on it.',
      narration: 'Variable partitioning keeps a list of holes in address order. Here six holes of two hundred, four hundred, six hundred, five hundred, three hundred and two hundred and fifty kilobytes.',
      keyword: 'in address order',
      trap: 'First fit scans in address order, not in ascending size. Sorting the holes first changes the answer.' },

    { id: 's3b', scene: 'variable', start: 65, end: 73.5,
      caption: 'A 357 KB request takes 357 of the 400 KB hole and leaves 43 KB as a hole.',
      detail: 'The subtraction is 400 minus 357 equals 43. The 43 KB is not lost and it is not inside the allocation: it returns to the free list at the address immediately after the process, and the next request may use it. This one arithmetic is run once per request in every trace on this page.',
      narration: 'A request of three hundred and fifty-seven kilobytes takes that much of the four-hundred-kilobyte hole and leaves forty-three kilobytes as a hole.',
      keyword: 'leaves 43 KB',
      trap: 'Writing the original 400 KB back into the free list is the single most common mistake. The hole is replaced by the remainder, immediately.' },

    { id: 's3c', scene: 'variable', start: 73.5, end: 82,
      caption: 'When a process leaves, its block becomes a hole; two holes that touch merge, two that do not stay apart.',
      detail: 'Coalescing is checked only between neighbours in address order. The consequence is the whole difficulty of the topic: the total free space can stay the same while the largest hole shrinks, so a request that fitted yesterday is refused today. Variable partitioning removes internal waste by construction and creates external waste by history.',
      narration: 'When a process leaves, its block becomes a hole. Two holes that touch merge, and two that do not stay apart.',
      keyword: 'merge',
      trap: 'Two holes separated by one live block cannot be merged, however small that block is. Compaction is the only way to join them.' },

    /* ---------------------------- scene 4 ---------------------------- */
    { id: 's4a', scene: 'firstfit', start: 82, end: 90,
      caption: 'First fit: scan from address zero and take the first hole that is large enough. 357 goes into the 400 KB hole, leaving 43.',
      detail: 'The 200 KB hole is examined first and rejected because it is too small. The 400 KB hole is next in address order and it fits, so the scan stops. The leftover is 400 minus 357, which is 43 KB.',
      narration: 'First fit scans from address zero and takes the first hole that is large enough. Three hundred and fifty-seven goes into the four hundred, leaving forty-three.',
      keyword: 'first hole that is large enough',
      trap: 'The scan stops at the first fit. Continuing to look for a better hole is best fit, and it is a different policy with a different answer.' },

    { id: 's4b', scene: 'firstfit', start: 90, end: 98,
      caption: '210 goes into the 600 KB hole, leaving 390; 468 goes into the 500 KB hole, leaving 32.',
      detail: 'The 200 KB and the 43 KB holes are both too small for 210, so the first fit is the 600 KB hole at the next address, and 600 minus 210 is 390. Then 468 skips the 200, the 43 and the 390, and takes the 500 KB hole, leaving 32.',
      narration: 'Two hundred and ten goes into the six hundred, leaving three hundred and ninety. Four hundred and sixty-eight goes into the five hundred, leaving thirty-two.',
      keyword: 'leaving 390',
      trap: 'The 43 KB remainder is examined before the 600 KB hole because it sits at a lower address. Order of examination is address order, not size order.' },

    { id: 's4c', scene: 'firstfit', start: 98, end: 106,
      caption: 'The fourth request of 491 KB is refused, although 1215 KB is free and the largest hole is 390 KB.',
      detail: 'The holes after three placements are 200, 43, 390, 32, 300 and 250 KB, which total 1215 KB. The request needs one contiguous 491 KB block and no hole reaches that, so the process waits. Three of four requests were placed, and the memory is not full.',
      narration: 'The fourth request of four hundred and ninety-one kilobytes is refused, although twelve hundred and fifteen kilobytes are free.',
      keyword: 'refused',
      trap: 'Adding the holes together to answer "does it fit" is the trap. A contiguous request needs one hole, not the sum of several.' },

    { id: 's4d', scene: 'firstfit', start: 106, end: 114,
      caption: 'First fit is fast because it usually stops early; its cost is that the low addresses are rescanned for every request.',
      detail: 'The scan rarely reaches the end of the list, so first fit is the cheapest of the four policies to run. The price is that small remainders accumulate near the bottom of memory, where every later request must step over them. First fit is the default in several real allocators for exactly this reason: cheap and good enough.',
      narration: 'First fit is fast because it usually stops early. Its cost is that the low addresses are rescanned for every request.',
      keyword: 'stops early',
      trap: 'First fit is not optimal and never claims to be. A question that asks for the optimal placement of a set of processes is a different question.' },

    /* ---------------------------- scene 5 ---------------------------- */
    { id: 's5a', scene: 'bestworst', start: 114, end: 121,
      caption: 'Best fit takes the smallest hole that is large enough: all four requests are placed and 724 KB is left in six holes.',
      detail: 'The choices are 400 for 357 leaving 43, 250 for 210 leaving 40, 500 for 468 leaving 32, and 600 for 491 leaving 109. All four processes are in memory. The untouched partitions are the 200 KB and the 300 KB ones, which is exactly the answer to the 2015 question this configuration comes from.',
      narration: 'Best fit takes the smallest hole that is large enough. All four requests are placed, and seven hundred and twenty-four kilobytes are left in six holes.',
      keyword: 'smallest hole that is large enough',
      trap: 'Best fit is the smallest hole that can satisfy the request, not the smallest hole overall. A hole smaller than the request is not a candidate at all.' },

    { id: 's5b', scene: 'bestworst', start: 121, end: 128,
      caption: 'Worst fit takes the largest hole: two requests are placed and the third is refused with 1683 KB free.',
      detail: 'The 600 KB hole serves 357 and leaves 243. The 500 KB hole then serves 210 and leaves 290. The largest hole is now the untouched 400 KB one, and the 468 KB request cannot be placed at all, although 1683 KB is free in six holes. Worst fit consumed the two holes that could have held it.',
      narration: 'Worst fit takes the largest hole. Two requests are placed, and the third is refused with sixteen hundred and eighty-three kilobytes free.',
      keyword: 'refused with 1683 KB free',
      trap: 'Worst fit leaves the biggest remainder at each step and still does worse overall. A locally large leftover is not a globally better layout.' },

    { id: 's5c', scene: 'bestworst', start: 128, end: 135,
      caption: 'Best fit keeps the large holes for the large requests that arrive later, and pays for it by scanning every hole.',
      detail: 'Choosing the smallest sufficient hole minimises the immediate leftover, which is why the 600 KB hole survived to serve the 491 KB request. To know which hole is smallest, the allocator must examine all of them unless the list is kept sorted by size, and keeping it sorted costs work on every insertion and every coalescing.',
      narration: 'Best fit keeps the large holes for the large requests that arrive later, and pays for it by scanning every hole.',
      keyword: 'keeps the large holes',
      trap: 'The textbook result is that first fit and best fit both beat worst fit on speed and on storage utilisation. It is not a claim that best fit beats first fit.' },

    { id: 's5d', scene: 'bestworst', start: 135, end: 142,
      caption: 'Same six holes, same four requests, four placements against two — the policy is the only difference.',
      detail: 'Nothing about the memory changed between the two bars: the holes, their sizes and their addresses are identical, and the requests arrive in the same order. Only the rule for choosing a hole changed, and it moved the result from four placements to two. That is why a placement question must be traced and never answered from the name of the policy.',
      narration: 'Same holes, same requests, four placements against two. The policy is the only difference.',
      keyword: 'four placements against two',
      trap: 'A question that gives holes and requests but no policy is unanswerable. Say which policy you assumed.' },

    /* ---------------------------- scene 6 ---------------------------- */
    { id: 's6a', scene: 'nextfit', start: 142, end: 150,
      caption: 'Next fit is first fit with a rover: the scan resumes where the last allocation stopped.',
      detail: 'The rover is an index into the list of blocks. After a placement it points just past the allocation, and the next scan starts there and wraps around at the end of memory. Everything else about the rule is unchanged: the first hole that is large enough wins.',
      narration: 'Next fit is first fit with a rover. The scan resumes where the last allocation stopped.',
      keyword: 'rover',
      trap: 'The rover does not point at the chosen hole; it points past it. Restarting the scan at the chosen hole turns next fit back into first fit.' },

    { id: 's6b', scene: 'nextfit', start: 150, end: 158,
      caption: 'On this stream it places three of four, the same count and the same layout as first fit.',
      detail: 'The rover happened never to pass a hole that first fit would have used, so the two policies coincide here: holes 200, 43, 390, 32, 300 and 250 KB, three placements, and the 491 KB request refused. That is not a general equivalence, and the next beat shows a case where the two disagree.',
      narration: 'On this stream it places three of four, the same count and the same layout as first fit.',
      keyword: 'the same layout',
      trap: 'Two policies giving the same answer on one stream says nothing about the next stream. Equivalence needs a proof, and there is none here.' },

    { id: 's6c', scene: 'nextfit', start: 158, end: 166,
      caption: 'A searched witness: with holes 100, 200 and 700 KB, first fit leaves 0 KB where next fit leaves 600 KB.',
      detail: 'A 150 KB request goes into the 200 KB hole and moves the rover past the 100 KB hole. A following 100 KB request then starts at the 700 KB hole under next fit and leaves 600 KB, while first fit, scanning from zero, takes the 100 KB hole exactly and leaves nothing. The model found this pair by search over hole sizes and request sizes, so it is a computed witness rather than an illustration.',
      narration: 'With holes of a hundred, two hundred and seven hundred kilobytes, first fit leaves nothing where next fit leaves six hundred kilobytes.',
      keyword: 'leaves 600 KB',
      trap: 'A witness proves that a claim is not universally true. It does not show which policy is better on average.' },

    /* ---------------------------- scene 7 ---------------------------- */
    { id: 's7a', scene: 'external', start: 166, end: 173,
      caption: 'External fragmentation: the free bytes exist, in six pieces, and no single piece is large enough.',
      detail: 'After the first-fit trace the free space is 1215 KB in six holes of 200, 43, 390, 32, 300 and 250 KB. A 491 KB request cannot be satisfied, although 1215 is more than twice what it needs. The waste is not a shortage; it is a shape.',
      narration: 'External fragmentation means the free bytes exist, in six pieces, and no single piece is large enough.',
      keyword: 'a shape',
      trap: 'External fragmentation is defined by the request, not by the memory. The same 390 KB hole is external waste for a 491 KB request and perfectly usable for a 300 KB one.' },

    { id: 's7b', scene: 'external', start: 173, end: 180,
      caption: 'The diagnostic is two numbers: total free space, and the largest single hole.',
      detail: 'If the total free space is below the request, the failure is a capacity shortage, and no rearrangement helps. If the total is at or above the request while the largest hole is below it, the failure is external fragmentation, and rearrangement is exactly what helps. Here the total is 1215 and the largest hole is 390.',
      narration: 'The diagnostic is two numbers: the total free space, and the largest single hole.',
      keyword: 'largest single hole',
      trap: 'A question that says "the process could not be allocated even though enough memory is free" has already told you which of the two failures it is.' },

    { id: 's7c', scene: 'external', start: 180, end: 187,
      caption: 'The average hole size is 202.5 KB, which is not the number that decides anything.',
      detail: 'Averaging the six holes gives 202.5 KB, and it is useless for predicting whether a request fits: the distribution is what matters, and one large hole can carry a request that the average would refuse. The relevant statistics are the total, the maximum, and the count of holes above the request size.',
      narration: 'The average hole size is two hundred and two point five kilobytes, and it decides nothing.',
      keyword: 'decides nothing',
      trap: 'Averaging hole sizes is a distractor in numerical questions. Only the maximum, or a count above a threshold, answers "does it fit".' },

    { id: 's7d', scene: 'external', start: 187, end: 194,
      caption: 'No placement policy prevents external fragmentation for arbitrary arrivals and departures.',
      detail: 'Each of the four policies changes where the remainders land and how small they are, but none removes them, because the memory must be contiguous and the request sizes are arbitrary. That impossibility, and not a weakness of one policy, is what motivates paging and segmentation: both give up contiguity so that any free block of the right size is usable.',
      narration: 'No placement policy prevents external fragmentation for arbitrary arrivals and departures.',
      keyword: 'no placement policy prevents it',
      trap: 'Paging removes external fragmentation because any frame will do. Segmentation keeps it, because a segment must still be one contiguous block.' },

    /* ---------------------------- scene 8 ---------------------------- */
    { id: 's8a', scene: 'twofrags', start: 194, end: 202.5,
      caption: 'Internal waste sits inside an allocation the allocator has already given away; external waste sits in the free list.',
      detail: 'In the fixed layout, 191 KB is unused inside five allocated partitions, and the allocator cannot see it: the bytes were handed over with the partition. In the variable layout, 1215 KB is free and every byte of it is on the free list, offered to every request, but in six pieces. The difference is ownership, not size.',
      narration: 'Internal waste sits inside an allocation the allocator has already given away. External waste sits in the free list.',
      keyword: 'ownership',
      trap: 'The words describe where the bytes are, not how many there are. A layout can have a lot of one and none of the other.' },

    { id: 's8b', scene: 'twofrags', start: 202.5, end: 211,
      caption: 'Fixed partitioning creates internal waste by construction; variable partitioning creates external waste by history.',
      detail: 'Fixed partitioning must round every request up to the partition size, so the difference is wasted before the process even runs, and the waste does not grow or shrink with time. Variable partitioning cuts each partition exactly, so no internal waste exists at allocation; instead, the sequence of arrivals and departures scatters the free space, and that history decides the shape.',
      narration: 'Fixed partitioning creates internal waste by construction. Variable partitioning creates external waste by history.',
      keyword: 'by construction',
      trap: 'Variable partitioning does not eliminate fragmentation; it relocates it from inside allocations to between them.' },

    { id: 's8c', scene: 'twofrags', start: 211, end: 220,
      caption: 'Compaction cures the second and cannot touch the first; paging still has internal waste.',
      detail: 'Compaction moves live blocks so that the scattered holes become one, which removes external fragmentation for the space it can rearrange. It recovers nothing from inside an allocation, because those bytes were never free. Paging has no external fragmentation at all, since any frame will hold any page, but the last page of a process is partly unused, so paging trades external waste for internal waste.',
      narration: 'Compaction cures the second and cannot touch the first. Paging still has internal waste.',
      keyword: 'trades external for internal',
      trap: 'The claim that paging eliminates fragmentation is wrong as stated. It eliminates external fragmentation and keeps internal fragmentation of at most one page per process.' },

    /* ---------------------------- scene 9 ---------------------------- */
    { id: 's9a', scene: 'compaction', start: 220, end: 227,
      caption: 'Compaction moves the live blocks together, so 1215 KB of scattered free space becomes one hole of 1215 KB.',
      detail: 'The total free space is unchanged, because compaction creates no memory and destroys none. What changes is the maximum: the largest hole grows from 390 KB to 1215 KB, and the 491 KB request that was refused now fits. Everything below the first hole stays where it is.',
      narration: 'Compaction moves the live blocks together, so the scattered free space becomes one hole of the same total.',
      keyword: 'one hole of the same total',
      trap: 'Compaction does not increase free memory. A question that expects the total to rise after compaction is testing whether you know that.' },

    { id: 's9b', scene: 'compaction', start: 227, end: 234,
      caption: 'The bill is 1285 KB copied, in eight blocks — proportional to the live bytes moved, not to the number of holes.',
      detail: 'Every live block above the first hole changes address: five 50 KB resident blocks and the three placed processes of 357, 210 and 468 KB, which is 1285 KB across eight blocks. The cost is the copying time and the pause while nothing else runs, and it grows with the amount of live memory, not with the number of holes removed.',
      narration: 'The bill is twelve hundred and eighty-five kilobytes copied in eight blocks, proportional to the live bytes moved.',
      keyword: '1285 KB copied',
      trap: 'The cost of compaction is live bytes moved, not holes merged. A memory with one big live block and many holes is the expensive case.' },

    { id: 's9c', scene: 'compaction', start: 234, end: 241,
      caption: 'It needs dynamic relocation: every address a process holds must be rewritable at run time.',
      detail: 'If addresses were bound at compile time or at load time, a process could not be moved without breaking every reference it holds. With a base register, moving a process means changing one number in the register, which is why base-and-limit hardware makes compaction practical. With static relocation the technique is simply unavailable.',
      narration: 'Compaction needs dynamic relocation: every address a process holds must be rewritable at run time.',
      keyword: 'dynamic relocation',
      trap: 'Compaction is possible only when relocation is dynamic and done at execution time. A question that states static binding has already ruled it out.' },

    { id: 's9d', scene: 'compaction', start: 241, end: 248,
      caption: 'And it must not move a block that a device is reading: pin it, or do I/O through kernel buffers.',
      detail: 'A controller performing a DMA transfer holds a physical address. If compaction moves that block mid-transfer, the device writes into the wrong place. The standard answers are to latch the job in memory while it is doing I/O, or to perform I/O only into operating-system buffers and copy afterwards. Both are real restrictions on when compaction may run.',
      narration: 'Compaction must not move a block that a device is reading. Pin it, or do the I/O through kernel buffers.',
      keyword: 'pin it',
      trap: 'This I/O restriction is a favourite one-mark question, and it is a property of compaction, not of paging.' },

    /* ---------------------------- scene 10 ---------------------------- */
    { id: 's10a', scene: 'notbest', start: 248, end: 255,
      caption: 'A 1994 paper question: blocks of 50 in use, 150 free, 300 in use, 350 free, 600 in use; requests 300, 25, 125, 50.',
      detail: 'The blocks are given in increasing address order, so the free list is 150 then 350. Four requests arrive in the stated order. The question asks which policy can satisfy all four, and it is answerable only by tracing, because the two free blocks are different sizes and the requests are small enough to fit in either.',
      narration: 'Blocks of fifty in use, one hundred and fifty free, three hundred in use, three hundred and fifty free, six hundred in use. Requests three hundred, twenty-five, one hundred and twenty-five, fifty.',
      keyword: 'in increasing address order',
      trap: 'Reordering the requests to make them fit better is not allowed. The question fixes the order, and the order changes the answer.' },

    { id: 's10b', scene: 'notbest', start: 255, end: 262,
      caption: 'First fit places all four: 350 gives 50, then 150 gives 125, then 125 exactly, then 50 exactly.',
      detail: 'The 300 KB request skips the 150 KB hole and takes the 350, leaving 50. The 25 KB request takes the 150, leaving 125. The 125 KB request takes that 125 exactly, so the hole disappears. The 50 KB request then takes the 50 KB remainder exactly. Four placements and nothing left free.',
      narration: 'First fit places all four. Three hundred and fifty gives fifty, then one hundred and fifty gives one hundred and twenty-five, then that is taken exactly, then fifty exactly.',
      keyword: 'all four',
      trap: 'A hole used exactly disappears. Writing it back as a zero-size hole inflates the hole count and can change a later decision.' },

    { id: 's10c', scene: 'notbest', start: 262, end: 269,
      caption: 'Best fit places three: it serves 25 from the 50, leaving two 25 KB holes that cannot hold 50.',
      detail: 'Best fit takes the smallest sufficient hole at each step. The 25 KB request is served from the 50 KB hole and leaves 25. The 125 KB request takes the 150 and leaves 25. Now the 50 KB request needs one hole of 50 and there are two holes of 25, which are not adjacent, so it waits. Best fit created the fragmentation that defeated it.',
      narration: 'Best fit places three. It serves twenty-five from the fifty, leaving two twenty-five kilobyte holes that cannot hold fifty.',
      keyword: 'two 25 KB holes',
      trap: 'This is the counterexample to "best fit is best". It is a real past question, not a constructed example.' },

    { id: 's10d', scene: 'notbest', start: 269, end: 276,
      caption: 'So "best" is a description of the immediate leftover, not a guarantee about the outcome.',
      detail: 'Best fit minimises the leftover of the current request, and that is all it minimises. Whether the resulting layout serves future requests depends on the sizes that arrive, which the policy cannot know. The one thing that can be proved is the leftover comparison: best fit always leaves a leftover no larger than first fit does on the same holes, and the model checks that over 1705 enumerated cases.',
      narration: 'Best is a description of the immediate leftover, not a guarantee about the outcome.',
      keyword: 'not a guarantee',
      trap: 'The provable claim is about one leftover, not about placements. Do not extend a theorem about a single step to a whole trace.' },

    /* ---------------------------- scene 11 ---------------------------- */
    { id: 's11a', scene: 'procedure', start: 276, end: 283.5,
      caption: 'First, fix what the question fixes: the policy, the request order, and whether compaction is allowed.',
      detail: 'A question that gives a partition table and names a policy wants one trace. A question that gives a count of processes and no sizes wants the degree of multiprogramming. A question that reports a failure wants the two diagnostics. A question that asks for the optimal arrangement is not a placement-policy question at all.',
      narration: 'First, fix what the question fixes: the policy, the request order, and whether compaction is allowed.',
      keyword: 'what the question fixes',
      trap: 'If the question does not name a policy, no single answer exists. State the policy you assumed and answer under it.' },

    { id: 's11b', scene: 'procedure', start: 283.5, end: 291,
      caption: 'Then trace mechanically: keep address order, take requests in order, and write the remainder immediately.',
      detail: 'Every error in these questions comes from one of three shortcuts: sorting the holes by size when the policy is first fit, reordering the requests, or leaving the original hole size in the list after a placement. The trace is four columns — request, chosen hole, leftover, running free list — and it never needs a clever step.',
      narration: 'Then trace mechanically: keep address order, take the requests in order, and write the remainder immediately.',
      keyword: 'write the remainder immediately',
      trap: 'The running free list is the state that the next request sees. Skipping a line of it produces an answer that looks plausible and is wrong.' },

    { id: 's11c', scene: 'procedure', start: 291, end: 298.5,
      caption: 'Then the two diagnostics: internal or external, and a capacity shortage or a shape problem.',
      detail: 'Internal waste is inside an allocation and invisible to the free list. External waste is on the free list in pieces. A shortage is total free space below the request; a shape problem is total free space at or above the request with the largest hole below it. Compaction fixes the shape problem only, and needs dynamic relocation to exist.',
      narration: 'Then the two diagnostics: internal or external, and a capacity shortage or a shape problem.',
      keyword: 'a capacity shortage or a shape problem',
      trap: 'Compaction cannot help a capacity shortage, and adding memory does not help external fragmentation. The remedy follows the diagnosis.' },

    { id: 's11d', scene: 'procedure', start: 298.5, end: 306,
      caption: 'On this page\'s own stream: first fit 3 of 4, next fit 3, best fit 4, worst fit 2 — from identical holes.',
      detail: 'Four policies, one address space, one request order, and four different outcomes: three placements, three, four and two. Best fit left 724 KB free in six holes with a largest hole of 300 KB. Every one of those figures is recomputed at load and checked against its own definition, and the count of passing checks is shown beside the canvas.',
      narration: 'First fit places three of four, next fit three, best fit four, worst fit two, all from identical holes.',
      keyword: 'four different outcomes',
      trap: 'Memorising one policy\'s outcome as "the answer" fails on the next stream. The trace is the method.' }
  ]
};
