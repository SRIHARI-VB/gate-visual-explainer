# Memory Management And Virtual Memory — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/memory-management-and-virtual-memory/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why memory needs managing: holes and fragmentation

*0:00 – 0:30 · objective: Show a logical address translated by the MMU, and see first-fit and best-fit place the same four requests into the same five holes with different results.*

**0:00–0:07** — A program is written with logical addresses; the MMU turns them into physical ones at run time.

> Caption: A program is written with logical addresses; the MMU turns them into physical ones at run time.

Exam-trap caption mode adds: *Confusing the two address spaces. A logical address is meaningful only inside one process; a physical address is meaningful only to the memory bus. A question that says "address" without qualifying it usually means logical.*

**0:07–0:15** — Contiguous allocation leaves holes. Five holes, four requests, and the fit rule decides everything.

> Caption: Contiguous allocation leaves holes. Five holes, four requests, and the fit rule decides everything.

Exam-trap caption mode adds: *Assuming the three fit rules give the same answer. They do not: first-fit fails on this sequence while best-fit succeeds, and both leave different holes behind.*

**0:15–0:22** — First-fit puts 212 in the 500 hole, 417 in the 600 hole, 112 in the 288 left by the first placement, and then stalls at 426.

> Caption: First-fit puts 212 in the 500 hole, 417 in the 600 hole, 112 in the 288 left by the first placement, and then stalls at 426.

Exam-trap caption mode adds: *Adding up free memory and concluding the request must fit. External fragmentation is about the largest single hole, not the total.*

**0:22–0:30** — Best-fit takes the smallest hole that fits and places all four. Same requests, same holes, different outcome.

> Caption: Best-fit takes the smallest hole that fits and places all four. Same requests, same holes, different outcome.

Exam-trap caption mode adds: *Believing best-fit is always better. It places more here, but it leaves the smallest unusable fragments, and the textbook conclusion is that no rule dominates on average.*

## Scene 2. Paging: pages, frames and one address split

*0:30 – 1:00 · objective: Split a virtual address into page number and offset, and follow the page table to a frame, so the translation stops being a slogan.*

**0:30–0:37** — Paging cuts the address space into equal pages and memory into equal frames, so any page fits any frame.

> Caption: Paging cuts the address space into equal pages and memory into equal frames, so any page fits any frame.

Exam-trap caption mode adds: *Saying paging has no fragmentation. It has no external fragmentation; internal fragmentation in the final page is unavoidable and is often the point of the question.*

**0:37–0:45** — The page table maps a page number to a frame number. The offset is copied through unchanged.

> Caption: The page table maps a page number to a frame number. The offset is copied through unchanged.

Exam-trap caption mode adds: *Translating the whole address. Only the page number is translated; the low bits are the position inside the page and are identical in both spaces.*

**0:45–0:52** — With 4 kilobyte pages, the low 12 bits are the offset and the remaining 20 are the page number.

> Caption: With 4 kilobyte pages, the low 12 bits are the offset and the remaining 20 are the page number.

Exam-trap caption mode adds: *Computing the offset bits from the address width, or the page-number bits from the page size. The offset comes from the page size alone; the page number is whatever is left.*

**0:52–1:00** — Page 3 sits in frame 7, so offset 498 becomes physical address 29170.

> Caption: Page 3 sits in frame 7, so offset 498 becomes physical address 29170.

Exam-trap caption mode adds: *Multiplying the whole logical address by the frame size, or forgetting the offset entirely. The frame number times the page size, plus the same offset, is the only correct form.*

## Scene 3. How big is the page table, and why one level is not enough

*1:00 – 1:30 · objective: Compute page table size from entries and entry width, and see the two-level split that keeps every table inside one page.*

**1:00–1:07** — Page table size is entries times entry width. Nothing else enters the formula.

> Caption: Page table size is entries times entry width. Nothing else enters the formula.

Exam-trap caption mode adds: *Using the physical memory size instead of the logical address space. The page table is per process and indexes that process's pages, so the logical space is what counts.*

**1:07–1:15** — GATE 2015 Set 1: 32-bit addresses, 4 kilobyte pages, 4 byte entries. One million entries, four megabytes.

> Caption: GATE 2015 Set 1: 32-bit addresses, 4 kilobyte pages, 4 byte entries. One million entries, four megabytes.

Exam-trap caption mode adds: *Reporting 4 in kilobytes or 4194304 in megabytes. Read the unit the paper asks for before writing the number.*

**1:15–1:22** — One table of a million entries must be contiguous, so the split keeps each table inside a single page.

> Caption: One table of a million entries must be contiguous, so the split keeps each table inside a single page.

Exam-trap caption mode adds: *Thinking multi-level paging reduces the address translation time. It increases it: more levels means more memory references on a miss. It reduces the space a sparse address space occupies.*

**1:22–1:30** — Two levels: 10 bits, then 10 bits, then 12 offset bits. The address is fully accounted for.

> Caption: Two levels: 10 bits, then 10 bits, then 12 offset bits. The address is fully accounted for.

Exam-trap caption mode adds: *Choosing the split by taste. The number of bits per level is forced by how many entries fit in one page: page size divided by entry size, then take the base-two logarithm.*

## Scene 4. The TLB and effective memory access time

*1:30 – 2:00 · objective: Read a hit ratio as a weighted average of two paths, and compute the effective access time on a printed GATE configuration.*

**1:30–1:37** — The TLB is a small cache of recent translations, so a repeated page number skips the page table.

> Caption: The TLB is a small cache of recent translations, so a repeated page number skips the page table.

Exam-trap caption mode adds: *Forgetting that a hit still costs the data access. A TLB hit saves the page-table reference, not the memory read of the data itself.*

**1:37–1:45** — A hit costs the buffer lookup plus one memory access; a miss costs the lookup plus two.

> Caption: A hit costs the buffer lookup plus one memory access; a miss costs the lookup plus two.

Exam-trap caption mode adds: *Charging two memory accesses on a hit, or one on a miss. Write both paths out in full before substituting numbers; almost every error here is a miscounted path.*

**1:45–1:52** — GATE 2014 Set 3: 10 milliseconds to search, 80 to access memory, hit ratio 0.6. The answer is 122.

> Caption: GATE 2014 Set 3: 10 milliseconds to search, 80 to access memory, hit ratio 0.6. The answer is 122.

Exam-trap caption mode adds: *Adding the two paths and halving them, which gives 130 and ignores the hit ratio. The ratio is the only thing that decides the weights.*

**1:52–2:00** — The effective time falls as the hit ratio rises: 170 at zero, 122 at 0.6, 90 at one.

> Caption: The effective time falls as the hit ratio rises: 170 at zero, 122 at 0.6, 90 at one.

Exam-trap caption mode adds: *Expecting the improvement to be proportional to the hit ratio in percentage terms. The improvement is linear in absolute time, which is a different statement.*

## Scene 5. Demand paging: the fault is the normal case

*2:00 – 2:30 · objective: Follow the six steps of a page fault, and put the fault rate into the effective access time formula.*

**2:00–2:07** — Demand paging loads a page only when it is touched, so a program can be larger than memory.

> Caption: Demand paging loads a page only when it is touched, so a program can be larger than memory.

Exam-trap caption mode adds: *Treating a page fault as an error. It is the normal mechanism of virtual memory; only an access to an address outside the process is a fault the operating system refuses.*

**2:07–2:15** — Six steps: trap, save state, find the page, choose a victim, read from disk, restart.

> Caption: Six steps: trap, save state, find the page, choose a victim, read from disk, restart.

Exam-trap caption mode adds: *Forgetting the write-back. A dirty victim costs two disk transfers, one to write it out and one to read the new page in; a clean victim costs one.*

**2:15–2:22** — GATE 2011: memory takes 20 nanoseconds, a fault costs 10 milliseconds, one fault in a million accesses.

> Caption: GATE 2011: memory takes 20 nanoseconds, a fault costs 10 milliseconds, one fault in a million accesses.

Exam-trap caption mode adds: *Mixing units. Ten milliseconds is ten to the power seven nanoseconds, not ten to the power six; that single factor of ten changes the answer from 30 to 21.*

**2:22–2:30** — The same formula at a fault rate of one in a thousand gives about ten thousand nanoseconds.

> Caption: The same formula at a fault rate of one in a thousand gives about ten thousand nanoseconds.

Exam-trap caption mode adds: *Averaging the two times without the fault probability, which gives five million nanoseconds. The probability is the whole content of the formula.*

## Scene 6. FIFO, LRU and optimal on one reference string

*2:30 – 3:00 · objective: Simulate three policies on the same string with three frames, and read the fault counts off the simulation rather than from memory.*

**2:30–2:37** — When every frame is full, the replacement policy decides who leaves. Three policies, one string.

> Caption: When every frame is full, the replacement policy decides who leaves. Three policies, one string.

Exam-trap caption mode adds: *Confusing first-in-first-out with least-recently-used. They differ only when a page is used again after arriving, and that is exactly the case these questions are built on.*

**2:37–2:45** — The first three references fill the frames. Reference 1 is the fourth fault and evicts page 4.

> Caption: The first three references fill the frames. Reference 1 is the fourth fault and evicts page 4.

Exam-trap caption mode adds: *Starting the count of faults after the frames fill. The first reference to a page is always a fault, and those three faults are part of the answer.*

**2:45–2:52** — Under least recently used the run ends at six faults, which is the paper's key for this string.

> Caption: Under least recently used the run ends at six faults, which is the paper's key for this string.

Exam-trap caption mode adds: *Evicting by position in the frame rather than by last-use time. LRU needs the recency order, which is not the same as the arrival order once a hit occurs.*

**2:52–3:00** — First in first out also gives six here; optimal gives five. The gap is the price of not knowing the future.

> Caption: First in first out also gives six here; optimal gives five. The gap is the price of not knowing the future.

Exam-trap caption mode adds: *Generalising from one reference string. Policy comparisons need either a proof, a property such as the stack property, or a worst case; one string is an anecdote.*

## Scene 7. Belady's anomaly, and the stack property that prevents it

*3:00 – 3:30 · objective: Show FIFO taking more faults with four frames than with three, and show why LRU and optimal cannot do that.*

**3:00–3:07** — Belady's anomaly: with first in first out, more frames can mean more faults.

> Caption: Belady's anomaly: with first in first out, more frames can mean more faults.

Exam-trap caption mode adds: *Believing the anomaly is universal. It is specific to policies without the stack property; it cannot happen with least recently used or optimal.*

**3:07–3:15** — Nine faults with three frames, ten with four. The extra frame changed the eviction order, not the demand.

> Caption: Nine faults with three frames, ten with four. The extra frame changed the eviction order, not the demand.

Exam-trap caption mode adds: *Trying to fix it by a better simulation. The simulation is right; the result is genuinely non-monotone, and the question usually asks you to name the policy, not to recompute.*

**3:15–3:22** — Least recently used goes ten, then eight. Optimal goes seven, then six. Neither can rise.

> Caption: Least recently used goes ten, then eight. Optimal goes seven, then six. Neither can rise.

Exam-trap caption mode adds: *Assuming any sane policy is immune. Least recently used and optimal are immune because of the stack property; clock and second chance are approximations of least recently used and are usually treated as immune, but first in first out is not.*

**3:22–3:30** — The stack property is the reason: with more frames the resident set only ever grows.

> Caption: The stack property is the reason: with more frames the resident set only ever grows.

Exam-trap caption mode adds: *Claiming the stack property for first in first out because it is a queue and queues look ordered. The order exists but it is not a fixed priority over pages; it is a priority over arrivals, which the frame count changes.*

## Scene 8. Counting faults: rate, reversal and a lookahead window

*3:30 – 4:00 · objective: Answer the three counting shapes the paper uses: a fault rate, a reversed string, and optimal with limited lookahead.*

**3:30–3:37** — GATE 2022: four frames, least recently used, fifteen references, nine faults, so the rate is 0.6.

> Caption: GATE 2022: four frames, least recently used, fifteen references, nine faults, so the rate is 0.6.

Exam-trap caption mode adds: *Dividing by the number of distinct pages, or counting only the faults after the frames fill. Both change the denominator or the numerator and give a plausible wrong decimal.*

**3:37–3:45** — GATE 2010: one hundred pages forward then backward, four frames, first in first out. 196 faults.

> Caption: GATE 2010: one hundred pages forward then backward, four frames, first in first out. 196 faults.

Exam-trap caption mode adds: *Saying 200, on the assumption that the reverse pass faults on everything. The last k pages of the forward pass are still resident and are the first k of the reverse pass.*

**3:45–3:52** — GATE 2025: optimal with a four-reference lookahead on twelve references gives six faults.

> Caption: GATE 2025: optimal with a four-reference lookahead on twelve references gives six faults.

Exam-trap caption mode adds: *Applying unlimited lookahead and answering from the ordinary optimal policy. The window is the question; the numbers are chosen so the two policies differ.*

**3:52–4:00** — Three counting shapes: a rate, a reversal, a window. Each has a shortcut that avoids the full table.

> Caption: Three counting shapes: a rate, a reversal, a window. Each has a shortcut that avoids the full table.

Exam-trap caption mode adds: *Simulating a policy that was not asked for. Read whether the question names first in first out, least recently used, optimal, or a modification of one, before drawing a single frame.*

## Scene 9. Page table structures, segmentation and thrashing

*4:00 – 4:30 · objective: Count the pages a two-level table actually needs, name the alternatives, and say what thrashing and the working set mean.*

**4:00–4:07** — GATE 2024 Set 2: how many pages does a two-level table occupy for 2000 pages? Between 3 and 1025.

> Caption: GATE 2024 Set 2: how many pages does a two-level table occupy for 2000 pages? Between 3 and 1025.

Exam-trap caption mode adds: *Answering 2000 for the maximum. The outer table has 1024 entries, so it cannot point at more than 1024 inner pages; the address space bounds the count, not the process.*

**4:07–4:15** — Alternatives: an inverted table has one entry per frame, and a hashed table avoids the walk.

> Caption: Alternatives: an inverted table has one entry per frame, and a hashed table avoids the walk.

Exam-trap caption mode adds: *Saying an inverted page table is smaller therefore faster. It is smaller, and it needs a search or a hash, so the translation cost rises.*

**4:15–4:22** — Segmentation is visible to the programmer: variable-length segments, a base and a limit each.

> Caption: Segmentation is visible to the programmer: variable-length segments, a base and a limit each.

Exam-trap caption mode adds: *Mixing the fragmentation. Paging wastes inside the last page; segmentation wastes between segments. A combined scheme keeps the segment visible and pages each segment.*

**4:22–4:30** — Thrashing: the fault rate feeds back into the frame count, so more processes can mean less progress.

> Caption: Thrashing: the fault rate feeds back into the frame count, so more processes can mean less progress.

Exam-trap caption mode adds: *Thinking more multiprogramming always raises utilisation. Past the point where working sets no longer fit, the fault rate rises and utilisation collapses, which is the classic curve.*

## Scene 10. The procedure for any question in this topic

*4:30 – 5:00 · objective: Fix a four-step procedure and the five traps that account for most lost marks here.*

**4:30–4:37** — Step one: write down the configuration in powers of two before computing anything.

> Caption: Step one: write down the configuration in powers of two before computing anything.

Exam-trap caption mode adds: *Working in kilobytes and megabytes throughout. Convert to bytes and exponents once, compute, then convert back at the end, so a units mistake cannot hide inside the arithmetic.*

**4:37–4:45** — Step two: for a time question, draw both paths and weight them by the probability.

> Caption: Step two: for a time question, draw both paths and weight them by the probability.

Exam-trap caption mode adds: *Using a formula that assumes the fault rate applies to all accesses when the question says it applies to misses, or the reverse. That distinction changes the answer by a factor of twenty.*

**4:45–4:52** — Step three: for a replacement question, simulate the named policy and only that policy.

> Caption: Step three: for a replacement question, simulate the named policy and only that policy.

Exam-trap caption mode adds: *Answering with the optimal count when the question asks for least recently used, because the optimal number is easier to reason about. The question names the policy for a reason.*

**4:52–5:00** — Five traps: unit mixing, translated offsets, one-level thinking, first in first out monotonicity, and one string.

> Caption: Five traps: unit mixing, translated offsets, one-level thinking, first in first out monotonicity, and one string.

Exam-trap caption mode adds: *Memorising formulas instead of these five sentences. The formulas are one line each; the traps are what the paper actually tests.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
