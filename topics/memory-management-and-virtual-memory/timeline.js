/* ==========================================================================
   memory-management-and-virtual-memory - THE timeline.
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
      id: 'fragmentation',
      n: 1,
      title: 'Why memory needs managing: holes and fragmentation',
      start: 0, end: 30,
      objective: 'Show a logical address translated by the MMU, and see first-fit and best-fit place the same four requests into the same five holes with different results.'
    },
    {
      id: 'paging',
      n: 2,
      title: 'Paging: pages, frames and one address split',
      start: 30, end: 60,
      objective: 'Split a virtual address into page number and offset, and follow the page table to a frame, so the translation stops being a slogan.'
    },
    {
      id: 'page-table-size',
      n: 3,
      title: 'How big is the page table, and why one level is not enough',
      start: 60, end: 90,
      objective: 'Compute page table size from entries and entry width, and see the two-level split that keeps every table inside one page.'
    },
    {
      id: 'tlb',
      n: 4,
      title: 'The TLB and effective memory access time',
      start: 90, end: 120,
      objective: 'Read a hit ratio as a weighted average of two paths, and compute the effective access time on a printed GATE configuration.'
    },
    {
      id: 'demand-paging',
      n: 5,
      title: 'Demand paging: the fault is the normal case',
      start: 120, end: 150,
      objective: 'Follow the six steps of a page fault, and put the fault rate into the effective access time formula.'
    },
    {
      id: 'replacement',
      n: 6,
      title: 'FIFO, LRU and optimal on one reference string',
      start: 150, end: 180,
      objective: 'Simulate three policies on the same string with three frames, and read the fault counts off the simulation rather than from memory.'
    },
    {
      id: 'belady',
      n: 7,
      title: "Belady's anomaly, and the stack property that prevents it",
      start: 180, end: 210,
      objective: 'Show FIFO taking more faults with four frames than with three, and show why LRU and optimal cannot do that.'
    },
    {
      id: 'counting',
      n: 8,
      title: 'Counting faults: rate, reversal and a lookahead window',
      start: 210, end: 240,
      objective: 'Answer the three counting shapes the paper uses: a fault rate, a reversed string, and optimal with limited lookahead.'
    },
    {
      id: 'structures',
      n: 9,
      title: 'Page table structures, segmentation and thrashing',
      start: 240, end: 270,
      objective: 'Count the pages a two-level table actually needs, name the alternatives, and say what thrashing and the working set mean.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure for any question in this topic',
      start: 270, end: 300,
      objective: 'Fix a four-step procedure and the five traps that account for most lost marks here.'
    }
  ],

  events: [
    /* ---------------- scene 1: fragmentation ---------------- */
    {
      id: 'fr-1', start: 0, end: 7.5, scene: 'fragmentation',
      caption: 'A program is written with logical addresses; the MMU turns them into physical ones at run time.',
      detail: 'Every address a compiled program contains is logical, also called virtual: an offset from the start of that program, decided when it was compiled. The memory management unit, a small piece of hardware, adds a relocation base and produces a physical address, which is what the memory bus sees. Because translation happens per access, the loader no longer has to know where the program will land, and a program can be moved or swapped without being recompiled.',
      keyword: 'logical addresses',
      trap: 'Confusing the two address spaces. A logical address is meaningful only inside one process; a physical address is meaningful only to the memory bus. A question that says "address" without qualifying it usually means logical.',
      narration: 'A program is written with logical addresses; the MMU turns them into physical ones at run time.'
    },
    {
      id: 'fr-2', start: 7.5, end: 15, scene: 'fragmentation',
      caption: 'Contiguous allocation leaves holes. Five holes, four requests, and the fit rule decides everything.',
      detail: 'With contiguous allocation each process takes one unbroken run of memory. Processes arrive and depart, so free memory becomes a set of holes of assorted sizes. First-fit takes the first hole big enough; best-fit takes the smallest hole big enough; worst-fit takes the largest. The holes here are 100, 500, 200, 300 and 600 kilobytes, and the requests arrive in the order 212, 417, 112 and 426 kilobytes.',
      keyword: 'Five holes, four requests',
      trap: 'Assuming the three fit rules give the same answer. They do not: first-fit fails on this sequence while best-fit succeeds, and both leave different holes behind.',
      narration: 'Contiguous allocation leaves holes. Five holes, four requests, and the fit rule decides everything.'
    },
    {
      id: 'fr-3', start: 15, end: 22.5, scene: 'fragmentation',
      caption: 'First-fit puts 212 in the 500 hole, 417 in the 600 hole, 112 in the 288 left by the first placement, and then stalls at 426.',
      detail: 'First-fit walks the holes from the bottom and takes the first one that fits. After three placements the holes left are 100, 176, 200, 300 and 183 kilobytes, because the third request goes into the remainder of the 500 kilobyte hole that the first request created. The fourth request needs 426 and the largest remaining hole is 300, so it waits even though 959 kilobytes are free in total. That is external fragmentation: enough total free memory, no single run large enough.',
      keyword: 'then stalls at 426',
      trap: 'Adding up free memory and concluding the request must fit. External fragmentation is about the largest single hole, not the total.',
      narration: 'First-fit puts 212 in the 500 hole, 417 in the 600 hole, 112 in the 288 left by the first placement, and then stalls at 426.'
    },
    {
      id: 'fr-4', start: 22.5, end: 30, scene: 'fragmentation',
      caption: 'Best-fit takes the smallest hole that fits and places all four. Same requests, same holes, different outcome.',
      detail: 'Best-fit sends 212 into the 300 hole, 417 into the 500 hole, 112 into the 200 hole and 426 into the 600 hole, leaving holes of 88, 83, 88 and 174 kilobytes. All four requests are placed. The cost is the opposite problem: best-fit leaves many tiny holes that nothing will ever use. Paging removes external fragmentation altogether by breaking memory into fixed frames, which is the next scene.',
      keyword: 'Best-fit takes the smallest hole that fits',
      trap: 'Believing best-fit is always better. It places more here, but it leaves the smallest unusable fragments, and the textbook conclusion is that no rule dominates on average.',
      narration: 'Best-fit takes the smallest hole that fits and places all four. Same requests, same holes, different outcome.'
    },

    /* ---------------- scene 2: paging ---------------- */
    {
      id: 'pg-1', start: 30, end: 37.5, scene: 'paging',
      caption: 'Paging cuts the address space into equal pages and memory into equal frames, so any page fits any frame.',
      detail: 'A page is a fixed-size block of a process, usually 4 kilobytes. A frame is a fixed-size block of physical memory, the same size. Because every page is the same size, any page can go in any free frame, and the external fragmentation of contiguous allocation disappears: there is no request that "does not fit". What remains is internal fragmentation, waste inside the last page of a process.',
      keyword: 'equal pages and equal frames',
      trap: 'Saying paging has no fragmentation. It has no external fragmentation; internal fragmentation in the final page is unavoidable and is often the point of the question.',
      narration: 'Paging cuts the address space into equal pages and memory into equal frames, so any page fits any frame.'
    },
    {
      id: 'pg-2', start: 37.5, end: 45, scene: 'paging',
      caption: 'The page table maps a page number to a frame number. The offset is copied through unchanged.',
      detail: 'The page table has one entry per page of the process. An entry holds the frame number plus control bits: valid, dirty, referenced, and the protection bits. Translation is two steps: take the page number from the top of the logical address, look it up, and replace it with the frame number. The offset from the bottom of the address is not translated at all, because page and frame have the same size.',
      keyword: 'The offset is copied through unchanged',
      trap: 'Translating the whole address. Only the page number is translated; the low bits are the position inside the page and are identical in both spaces.',
      narration: 'The page table maps a page number to a frame number. The offset is copied through unchanged.'
    },
    {
      id: 'pg-3', start: 45, end: 52.5, scene: 'paging',
      caption: 'With 4 kilobyte pages, the low 12 bits are the offset and the remaining 20 are the page number.',
      detail: 'A 4 kilobyte page is 4096 bytes, and 4096 is two to the power 12, so twelve bits are needed to name a byte inside a page. In a 32-bit logical address the other twenty bits name the page, which allows two to the power 20 pages, that is one million and forty-eight thousand five hundred and seventy-six pages. This split is the whole of the arithmetic in the topic: offset bits are the base-two logarithm of the page size.',
      keyword: 'the low 12 bits are the offset',
      trap: 'Computing the offset bits from the address width, or the page-number bits from the page size. The offset comes from the page size alone; the page number is whatever is left.',
      narration: 'With 4 kilobyte pages, the low 12 bits are the offset and the remaining 20 are the page number.'
    },
    {
      id: 'pg-4', start: 52.5, end: 60, scene: 'paging',
      caption: 'Page 3 sits in frame 7, so offset 498 becomes physical address 29170.',
      detail: 'Take a logical address whose page number is 3 and whose offset is 498 bytes. The page table entry for page 3 holds frame 7, so the physical address is 7 times 4096 plus 498, which is 29170. The offset was not changed; only the number in front of it was. A process of 10,000 bytes needs three pages, so it occupies 12,288 bytes and 2,288 bytes of its last page are wasted: that is internal fragmentation, computed, not guessed.',
      keyword: 'offset 498 becomes physical address 29170',
      trap: 'Multiplying the whole logical address by the frame size, or forgetting the offset entirely. The frame number times the page size, plus the same offset, is the only correct form.',
      narration: 'Page 3 sits in frame 7, so offset 498 becomes physical address 29170.'
    },

    /* ---------------- scene 3: page table size ---------------- */
    {
      id: 'pt-1', start: 60, end: 67.5, scene: 'page-table-size',
      caption: 'Page table size is entries times entry width. Nothing else enters the formula.',
      detail: 'One entry is needed for every page of the process, and each entry occupies a fixed number of bytes. So the size of a single-level page table is the number of pages multiplied by the entry width. The number of pages is the logical address space divided by the page size. Two divisions and one multiplication answer most of the questions in this topic.',
      keyword: 'entries times entry width',
      trap: 'Using the physical memory size instead of the logical address space. The page table is per process and indexes that process\'s pages, so the logical space is what counts.',
      narration: 'Page table size is entries times entry width. Nothing else enters the formula.'
    },
    {
      id: 'pt-2', start: 67.5, end: 75, scene: 'page-table-size',
      caption: 'GATE 2015 Set 1: 32-bit addresses, 4 kilobyte pages, 4 byte entries. One million entries, four megabytes.',
      detail: 'Two to the power 32 divided by two to the power 12 is two to the power 20 pages, and each entry is 4 bytes, so the table is 4 megabytes. The paper asks for the answer in megabytes and the key gives 4. That is the whole question: the arithmetic is a single line, and the marks are for doing it in the right direction.',
      keyword: 'four megabytes',
      trap: 'Reporting 4 in kilobytes or 4194304 in megabytes. Read the unit the paper asks for before writing the number.',
      narration: 'GATE 2015 Set 1: 32-bit addresses, 4 kilobyte pages, 4 byte entries. One million entries, four megabytes.'
    },
    {
      id: 'pt-3', start: 75, end: 82.5, scene: 'page-table-size',
      caption: 'One table of a million entries must be contiguous, so the split keeps each table inside a single page.',
      detail: 'A single-level table of a million entries is four megabytes that must be contiguous in memory, and it must be resident for the process to run at all. The two-level fix splits the 20-bit page number into two 10-bit fields. Each level then has 1024 entries of 4 bytes, which is 4096 bytes: exactly one page. That is not a coincidence; the split is chosen so each table fits in a page.',
      keyword: 'exactly one page',
      trap: 'Thinking multi-level paging reduces the address translation time. It increases it: more levels means more memory references on a miss. It reduces the space a sparse address space occupies.',
      narration: 'One table of a million entries must be contiguous, so the split keeps each table inside a single page.'
    },
    {
      id: 'pt-4', start: 82.5, end: 90, scene: 'page-table-size',
      caption: 'Two levels: 10 bits, then 10 bits, then 12 offset bits. The address is fully accounted for.',
      detail: 'Ten plus ten plus twelve is thirty-two, so the address is fully used with nothing left over. The first field indexes the outer table, whose entry points to a page of the inner table, whose entry gives the frame. Three memory references would be needed per access without a cache, which is why the translation lookaside buffer exists and is the next scene.',
      keyword: '10 bits, then 10 bits, then 12 offset bits',
      trap: 'Choosing the split by taste. The number of bits per level is forced by how many entries fit in one page: page size divided by entry size, then take the base-two logarithm.',
      narration: 'Two levels: 10 bits, then 10 bits, then 12 offset bits. The address is fully accounted for.'
    },

    /* ---------------- scene 4: TLB ---------------- */
    {
      id: 'tlb-1', start: 90, end: 97.5, scene: 'tlb',
      caption: 'The TLB is a small cache of recent translations, so a repeated page number skips the page table.',
      detail: 'Without a cache, every memory access becomes two: one to read the page table entry, one to read the data. The translation lookaside buffer stores a few dozen to a few thousand page-number to frame-number pairs. A hit returns the frame number immediately; a miss falls back to the page table and then fills the buffer. A hit ratio is the fraction of accesses served by the buffer.',
      keyword: 'a small cache of recent translations',
      trap: 'Forgetting that a hit still costs the data access. A TLB hit saves the page-table reference, not the memory read of the data itself.',
      narration: 'The TLB is a small cache of recent translations, so a repeated page number skips the page table.'
    },
    {
      id: 'tlb-2', start: 97.5, end: 105, scene: 'tlb',
      caption: 'A hit costs the buffer lookup plus one memory access; a miss costs the lookup plus two.',
      detail: 'On a hit the sequence is: search the buffer, get the frame number, read the data. That is the buffer time plus one memory access. On a miss the sequence is: search the buffer and fail, read the page table entry from memory, read the data. That is the buffer time plus two memory accesses. Those two paths are the whole model, and the effective access time is their average weighted by the hit ratio.',
      keyword: 'a miss costs the lookup plus two',
      trap: 'Charging two memory accesses on a hit, or one on a miss. Write both paths out in full before substituting numbers; almost every error here is a miscounted path.',
      narration: 'A hit costs the buffer lookup plus one memory access; a miss costs the lookup plus two.'
    },
    {
      id: 'tlb-3', start: 105, end: 112.5, scene: 'tlb',
      caption: 'GATE 2014 Set 3: 10 milliseconds to search, 80 to access memory, hit ratio 0.6. The answer is 122.',
      detail: 'A hit is 10 plus 80, which is 90 milliseconds. A miss is 10 plus 80 plus 80, which is 170. Weighting by the hit ratio gives 0.6 times 90 plus 0.4 times 170, which is 54 plus 68, so 122 milliseconds. The numbers are implausibly large for real hardware, which is why the paper calls them milliseconds; the arithmetic is unaffected.',
      keyword: 'The answer is 122',
      trap: 'Adding the two paths and halving them, which gives 130 and ignores the hit ratio. The ratio is the only thing that decides the weights.',
      narration: 'GATE 2014 Set 3: 10 milliseconds to search, 80 to access memory, hit ratio 0.6. The answer is 122.'
    },
    {
      id: 'tlb-4', start: 112.5, end: 120, scene: 'tlb',
      caption: 'The effective time falls as the hit ratio rises: 170 at zero, 122 at 0.6, 90 at one.',
      detail: 'At a hit ratio of zero every access takes the miss path, 170 milliseconds. At one, every access takes the hit path, 90. The curve between them is a straight line, because the effective time is a weighted average. That linearity is worth remembering: a question that gives two configurations and asks for the ratio of their effective times is asking for a point on a line, not for a new simulation.',
      keyword: '170 at zero, 122 at 0.6, 90 at one',
      trap: 'Expecting the improvement to be proportional to the hit ratio in percentage terms. The improvement is linear in absolute time, which is a different statement.',
      narration: 'The effective time falls as the hit ratio rises: 170 at zero, 122 at 0.6, 90 at one.'
    },

    /* ---------------- scene 5: demand paging ---------------- */
    {
      id: 'dp-1', start: 120, end: 127.5, scene: 'demand-paging',
      caption: 'Demand paging loads a page only when it is touched, so a program can be larger than memory.',
      detail: 'The page table gains a valid bit. A page whose valid bit is clear is not in memory; touching it raises a page fault. The process is suspended, the operating system finds a free frame or evicts a page, reads the needed page from disk into that frame, updates the table, and restarts the instruction. The restarted instruction re-executes the access and now succeeds.',
      keyword: 'only when it is touched',
      trap: 'Treating a page fault as an error. It is the normal mechanism of virtual memory; only an access to an address outside the process is a fault the operating system refuses.',
      narration: 'Demand paging loads a page only when it is touched, so a program can be larger than memory.'
    },
    {
      id: 'dp-2', start: 127.5, end: 135, scene: 'demand-paging',
      caption: 'Six steps: trap, save state, find the page, choose a victim, read from disk, restart.',
      detail: 'One: the access traps to the operating system. Two: the process state is saved, since the fault is synchronous and the instruction must be repeatable. Three: the operating system checks that the address is legal and locates the page on disk. Four: it finds a free frame, or runs the replacement policy and writes back the victim if it is dirty. Five: it reads the page into the frame and updates the table and the buffer. Six: it restarts the instruction, which now hits.',
      keyword: 'Six steps',
      trap: 'Forgetting the write-back. A dirty victim costs two disk transfers, one to write it out and one to read the new page in; a clean victim costs one.',
      narration: 'Six steps: trap, save state, find the page, choose a victim, read from disk, restart.'
    },
    {
      id: 'dp-3', start: 135, end: 142.5, scene: 'demand-paging',
      caption: 'GATE 2011: memory takes 20 nanoseconds, a fault costs 10 milliseconds, one fault in a million accesses.',
      detail: 'Ten milliseconds is ten million nanoseconds, so the fault path is 500,000 times slower than the normal path. With a fault probability of one in a million, the expected extra time is one millionth of ten million nanoseconds, which is 10 nanoseconds. Added to the 20 nanosecond base, the effective access time is 30 nanoseconds.',
      keyword: 'one fault in a million accesses',
      trap: 'Mixing units. Ten milliseconds is ten to the power seven nanoseconds, not ten to the power six; that single factor of ten changes the answer from 30 to 21.',
      narration: 'GATE 2011: memory takes 20 nanoseconds, a fault costs 10 milliseconds, one fault in a million accesses.'
    },
    {
      id: 'dp-4', start: 142.5, end: 150, scene: 'demand-paging',
      caption: 'The same formula at a fault rate of one in a thousand gives about ten thousand nanoseconds.',
      detail: 'One minus the fault rate times the memory time, plus the fault rate times the service time. At one in a thousand, the second term is one thousandth of ten million nanoseconds, which is ten thousand nanoseconds, and the first term is about twenty. So a fault rate a thousand times higher multiplies the effective time by roughly three hundred and thirty. This sensitivity is why the fault rate has to stay tiny, and why thrashing is catastrophic rather than merely slow.',
      keyword: 'about ten thousand nanoseconds',
      trap: 'Averaging the two times without the fault probability, which gives five million nanoseconds. The probability is the whole content of the formula.',
      narration: 'The same formula at a fault rate of one in a thousand gives about ten thousand nanoseconds.'
    },

    /* ---------------- scene 6: replacement ---------------- */
    {
      id: 'rp-1', start: 150, end: 157.5, scene: 'replacement',
      caption: 'When every frame is full, the replacement policy decides who leaves. Three policies, one string.',
      detail: 'The reference string is 4, 7, 6, 1, 7, 6, 1, 2, 7, 2 with three frames, all initially empty. First in first out evicts the page that arrived earliest. Least recently used evicts the page whose most recent use is oldest. Optimal evicts the page whose next use is furthest in the future, which needs knowledge of the future and so is a benchmark rather than an implementation.',
      keyword: 'Three policies, one string',
      trap: 'Confusing first-in-first-out with least-recently-used. They differ only when a page is used again after arriving, and that is exactly the case these questions are built on.',
      narration: 'When every frame is full, the replacement policy decides who leaves. Three policies, one string.'
    },
    {
      id: 'rp-2', start: 157.5, end: 165, scene: 'replacement',
      caption: 'The first three references fill the frames. Reference 1 is the fourth fault and evicts page 4.',
      detail: 'Pages 4, 7 and 6 arrive and fill the three frames: three faults. The fourth reference is page 1, which is not present, so it is the fourth fault. Under FIFO the earliest arrival is 4, so 4 leaves. Under least recently used, page 4 is also the least recently used, so it leaves. The two policies agree here, which is why the interesting part comes later.',
      keyword: 'the fourth fault and evicts page 4',
      trap: 'Starting the count of faults after the frames fill. The first reference to a page is always a fault, and those three faults are part of the answer.',
      narration: 'The first three references fill the frames. Reference 1 is the fourth fault and evicts page 4.'
    },
    {
      id: 'rp-3', start: 165, end: 172.5, scene: 'replacement',
      caption: 'Under least recently used the run ends at six faults, which is the paper\'s key for this string.',
      detail: 'After the eviction of 4 the frames hold 1, 7 and 6. References 7, 6 and 1 are all hits. Reference 2 faults and evicts 7, the least recently used. Reference 7 faults and evicts 6. Reference 2 is then a hit. That is six faults in ten references, and GATE 2014 Set 3 asks exactly this and keys 6.',
      keyword: 'six faults',
      trap: 'Evicting by position in the frame rather than by last-use time. LRU needs the recency order, which is not the same as the arrival order once a hit occurs.',
      narration: 'Under least recently used the run ends at six faults, which is the paper\'s key for this string.'
    },
    {
      id: 'rp-4', start: 172.5, end: 180, scene: 'replacement',
      caption: 'First in first out also gives six here; optimal gives five. The gap is the price of not knowing the future.',
      detail: 'Simulating all three on the same string with the same three frames: first in first out 6, least recently used 6, optimal 5. Optimal is a lower bound, never beaten by a real policy, and here the bound is only one fault away. Note the trap in the other direction: on this string first in first out is as good as least recently used, so a single string proves nothing about which policy is better in general.',
      keyword: 'optimal gives five',
      trap: 'Generalising from one reference string. Policy comparisons need either a proof, a property such as the stack property, or a worst case; one string is an anecdote.',
      narration: 'First in first out also gives six here; optimal gives five. The gap is the price of not knowing the future.'
    },

    /* ---------------- scene 7: Belady ---------------- */
    {
      id: 'bl-1', start: 180, end: 187.5, scene: 'belady',
      caption: "Belady's anomaly: with first in first out, more frames can mean more faults.",
      detail: 'The string is 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5. With three frames first in first out takes 9 faults. With four frames it takes 10. Giving the process more memory made it worse, which is the anomaly. It is not a measurement error and not a rare accident; it is a property of a policy that decides by arrival time, because adding a frame changes which pages happen to be oldest at each step.',
      keyword: 'more frames can mean more faults',
      trap: 'Believing the anomaly is universal. It is specific to policies without the stack property; it cannot happen with least recently used or optimal.',
      narration: "Belady's anomaly: with first in first out, more frames can mean more faults."
    },
    {
      id: 'bl-2', start: 187.5, end: 195, scene: 'belady',
      caption: 'Nine faults with three frames, ten with four. The extra frame changed the eviction order, not the demand.',
      detail: 'The demand is identical: the same twelve references. What changed is which page is at the head of the queue at each eviction. With four frames the queue holds one more page, so at the critical steps the page that would have been evicted early stays and is evicted later, when it is needed again. The anomaly is a statement about a queue, not about the program.',
      keyword: 'Nine faults with three frames, ten with four',
      trap: 'Trying to fix it by a better simulation. The simulation is right; the result is genuinely non-monotone, and the question usually asks you to name the policy, not to recompute.',
      narration: 'Nine faults with three frames, ten with four. The extra frame changed the eviction order, not the demand.'
    },
    {
      id: 'bl-3', start: 195, end: 202.5, scene: 'belady',
      caption: 'Least recently used goes ten, then eight. Optimal goes seven, then six. Neither can rise.',
      detail: 'On the same string, least recently used takes 10 faults with three frames and 8 with four. Optimal takes 7 and 6. Both counts fall as frames increase, and they must: both are stack algorithms. A stack algorithm ranks all pages by a priority that does not depend on how many frames exist, so the set of pages held with n frames is always a subset of the set held with n plus one frames at every step of the same reference string.',
      keyword: 'Neither can rise',
      trap: 'Assuming any sane policy is immune. Least recently used and optimal are immune because of the stack property; clock and second chance are approximations of least recently used and are usually treated as immune, but first in first out is not.',
      narration: 'Least recently used goes ten, then eight. Optimal goes seven, then six. Neither can rise.'
    },
    {
      id: 'bl-4', start: 202.5, end: 210, scene: 'belady',
      caption: 'The stack property is the reason: with more frames the resident set only ever grows.',
      detail: 'If the pages held with n frames are always a subset of those held with n plus one frames, then any reference that hits with n frames also hits with n plus one, so the fault count cannot increase. Least recently used satisfies the inclusion because recency order is independent of frame count. Optimal satisfies it because next-use distance is independent of frame count. First in first out satisfies neither, because arrival order is altered by how many pages were kept.',
      keyword: 'the resident set only ever grows',
      trap: 'Claiming the stack property for first in first out because it is a queue and queues look ordered. The order exists but it is not a fixed priority over pages; it is a priority over arrivals, which the frame count changes.',
      narration: 'The stack property is the reason: with more frames the resident set only ever grows.'
    },

    /* ---------------- scene 8: counting ---------------- */
    {
      id: 'ct-1', start: 210, end: 217.5, scene: 'counting',
      caption: 'GATE 2022: four frames, least recently used, fifteen references, nine faults, so the rate is 0.6.',
      detail: 'The string is 7, 2, 7, 3, 2, 5, 3, 4, 6, 7, 7, 1, 5, 6, 1. Simulating least recently used with four frames gives faults on 7, 2, 3, 5, 4, 6, 7, 1 and 5, which is nine faults in fifteen accesses. The rate is nine fifteenths, which is 0.6, and the paper asks for one decimal place. The simulation on this page recomputes the nine independently of the key.',
      keyword: 'nine faults, so the rate is 0.6',
      trap: 'Dividing by the number of distinct pages, or counting only the faults after the frames fill. Both change the denominator or the numerator and give a plausible wrong decimal.',
      narration: 'GATE 2022: four frames, least recently used, fifteen references, nine faults, so the rate is 0.6.'
    },
    {
      id: 'ct-2', start: 217.5, end: 225, scene: 'counting',
      caption: 'GATE 2010: one hundred pages forward then backward, four frames, first in first out. 196 faults.',
      detail: 'The forward pass touches one hundred distinct pages, so every access faults: one hundred. At the end the four frames hold the last four pages, so the first four references of the reverse pass hit. The remaining ninety-six pages are each absent, and each is used once, so each faults. One hundred plus ninety-six is 196. The argument is a counting argument, not a simulation, and it generalises: with k frames the answer is n plus n minus k.',
      keyword: '196 faults',
      trap: 'Saying 200, on the assumption that the reverse pass faults on everything. The last k pages of the forward pass are still resident and are the first k of the reverse pass.',
      narration: 'GATE 2010: one hundred pages forward then backward, four frames, first in first out. 196 faults.'
    },
    {
      id: 'ct-3', start: 225, end: 232.5, scene: 'counting',
      caption: 'GATE 2025: optimal with a four-reference lookahead on twelve references gives six faults.',
      detail: 'The paper modifies optimal so the operating system predicts only the next four references, including the current one, and evicts the resident page whose next use inside that window is furthest away, treating a page absent from the window as furthest of all. On the string 1, 3, 2, 4, 2, 3, 1, 2, 4, 3, 1, 4 with three frames the result is six faults. Full optimal also gives six here, so the lookahead cost nothing on this string.',
      keyword: 'six faults',
      trap: 'Applying unlimited lookahead and answering from the ordinary optimal policy. The window is the question; the numbers are chosen so the two policies differ.',
      narration: 'GATE 2025: optimal with a four-reference lookahead on twelve references gives six faults.'
    },
    {
      id: 'ct-4', start: 232.5, end: 240, scene: 'counting',
      caption: 'Three counting shapes: a rate, a reversal, a window. Each has a shortcut that avoids the full table.',
      detail: 'For a rate, simulate once and divide by the number of accesses. For a reversal, note which pages survive the forward pass and subtract that overlap. For a window, apply the policy but bound the lookahead explicitly and write the window down at each fault. A fourth shape, the difference between two policies on one string, is the only one that needs two full simulations, and it is where careless arithmetic costs the most.',
      keyword: 'Three counting shapes',
      trap: 'Simulating a policy that was not asked for. Read whether the question names first in first out, least recently used, optimal, or a modification of one, before drawing a single frame.',
      narration: 'Three counting shapes: a rate, a reversal, a window. Each has a shortcut that avoids the full table.'
    },

    /* ---------------- scene 9: structures ---------------- */
    {
      id: 'st-1', start: 240, end: 247.5, scene: 'structures',
      caption: 'GATE 2024 Set 2: how many pages does a two-level table occupy for 2000 pages? Between 3 and 1025.',
      detail: 'Each table page holds 1024 entries. Packing the 2000 accessed pages contiguously needs two inner pages, plus one outer page, so the minimum is 3. Spreading them needs one valid entry in as many inner pages as possible, and the outer table has only 1024 entries, so at most 1024 inner pages plus one outer: 1025. The paper asks for the sum, 1028.',
      keyword: 'Between 3 and 1025',
      trap: 'Answering 2000 for the maximum. The outer table has 1024 entries, so it cannot point at more than 1024 inner pages; the address space bounds the count, not the process.',
      narration: 'GATE 2024 Set 2: how many pages does a two-level table occupy for 2000 pages? Between 3 and 1025.'
    },
    {
      id: 'st-2', start: 247.5, end: 255, scene: 'structures',
      caption: 'Alternatives: an inverted table has one entry per frame, and a hashed table avoids the walk.',
      detail: 'An inverted page table stores one entry per physical frame rather than one per virtual page, so its size depends on memory, not on the address space. The entry records which process and which virtual page occupy the frame, so a lookup must search, usually by hashing on the virtual address. A hashed page table chains entries that collide. All three trade a smaller table for a slower or more complex lookup.',
      keyword: 'one entry per frame',
      trap: 'Saying an inverted page table is smaller therefore faster. It is smaller, and it needs a search or a hash, so the translation cost rises.',
      narration: 'Alternatives: an inverted table has one entry per frame, and a hashed table avoids the walk.'
    },
    {
      id: 'st-3', start: 255, end: 262.5, scene: 'structures',
      caption: 'Segmentation is visible to the programmer: variable-length segments, a base and a limit each.',
      detail: 'Paging is invisible: the compiler sees a flat address space and the hardware chops it. Segmentation is visible: the programmer or compiler names segments such as code, stack and heap, and each has a base and a length. A reference is a pair of segment number and offset, and the hardware checks the offset against the limit. Segmentation has external fragmentation and no internal fragmentation; paging is the reverse. Real systems use both.',
      keyword: 'variable-length segments',
      trap: 'Mixing the fragmentation. Paging wastes inside the last page; segmentation wastes between segments. A combined scheme keeps the segment visible and pages each segment.',
      narration: 'Segmentation is visible to the programmer: variable-length segments, a base and a limit each.'
    },
    {
      id: 'st-4', start: 262.5, end: 270, scene: 'structures',
      caption: 'Thrashing: the fault rate feeds back into the frame count, so more processes can mean less progress.',
      detail: 'If the sum of the working sets of the resident processes exceeds the frames available, each process evicts pages another process is about to use, and the machine spends its time swapping. The working set is the set of pages used in the last delta references, and the operating system can refuse to admit a process whose working set does not fit. Local replacement limits the damage to one process; global replacement lets one process starve the rest.',
      keyword: 'Thrashing',
      trap: 'Thinking more multiprogramming always raises utilisation. Past the point where working sets no longer fit, the fault rate rises and utilisation collapses, which is the classic curve.',
      narration: 'Thrashing: the fault rate feeds back into the frame count, so more processes can mean less progress.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'rc-1', start: 270, end: 277.5, scene: 'recipe',
      caption: 'Step one: write down the configuration in powers of two before computing anything.',
      detail: 'Address width, page size, entry width, number of frames, number of levels. Convert each to a power of two and note the bits. Most errors in this topic are arithmetic slips in the exponent, not conceptual mistakes, and writing the exponents down first makes the slip visible before it reaches the answer.',
      keyword: 'in powers of two',
      trap: 'Working in kilobytes and megabytes throughout. Convert to bytes and exponents once, compute, then convert back at the end, so a units mistake cannot hide inside the arithmetic.',
      narration: 'Step one: write down the configuration in powers of two before computing anything.'
    },
    {
      id: 'rc-2', start: 277.5, end: 285, scene: 'recipe',
      caption: 'Step two: for a time question, draw both paths and weight them by the probability.',
      detail: 'A hit path and a miss path, each written in full with its memory references, then multiplied by the hit ratio and its complement. For a page fault, the same shape with the fault rate, and the dirty write-back added to the miss path. Never substitute into a remembered formula before writing the paths; the formula is only a compression of the paths.',
      keyword: 'draw both paths',
      trap: 'Using a formula that assumes the fault rate applies to all accesses when the question says it applies to misses, or the reverse. That distinction changes the answer by a factor of twenty.',
      narration: 'Step two: for a time question, draw both paths and weight them by the probability.'
    },
    {
      id: 'rc-3', start: 285, end: 292.5, scene: 'recipe',
      caption: 'Step three: for a replacement question, simulate the named policy and only that policy.',
      detail: 'Draw a table with one column per reference and one row per frame, and fill it left to right. Mark each fault. For least recently used keep a recency order rather than the frame positions. For optimal write the future uses beside each resident page before choosing a victim. For first in first out keep the arrival order and note that a hit does not change it.',
      keyword: 'simulate the named policy',
      trap: 'Answering with the optimal count when the question asks for least recently used, because the optimal number is easier to reason about. The question names the policy for a reason.',
      narration: 'Step three: for a replacement question, simulate the named policy and only that policy.'
    },
    {
      id: 'rc-4', start: 292.5, end: 300, scene: 'recipe',
      caption: 'Five traps: unit mixing, translated offsets, one-level thinking, first in first out monotonicity, and one string.',
      detail: 'One: mixing nanoseconds and milliseconds. Two: translating the offset, which is copied through unchanged. Three: assuming multi-level paging is faster, when it costs more references and saves space. Four: assuming more frames never hurts, which is false for first in first out. Five: generalising a policy comparison from one reference string. Those five account for most of the lost marks in this topic.',
      keyword: 'Five traps',
      trap: 'Memorising formulas instead of these five sentences. The formulas are one line each; the traps are what the paper actually tests.',
      narration: 'Five traps: unit mixing, translated offsets, one-level thinking, first in first out monotonicity, and one string.'
    }
  ]
};
