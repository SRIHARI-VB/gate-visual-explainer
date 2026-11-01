# Contiguous Memory Allocation And Fit Policies — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/contiguous-memory-allocation-and-fit-policies/index.html`
- Total duration: 5:06 (306 seconds), 11 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One process, one uninterrupted block

*0:00 – 0:24 · objective: State the assumption every scheme on this page rests on, and name the two questions it leaves open: where the block goes, and what happens to the space it leaves.*

**0:00–0:08** — Contiguous allocation gives a process one uninterrupted run of physical memory.

> Caption: Contiguous allocation gives a process one uninterrupted run of physical memory.

Exam-trap caption mode adds: *A question that says "the process must be loaded in one block" is a contiguous-allocation question. A question that says "frames" is not.*

**0:08–0:16** — That assumption leaves two questions open: where the block goes, and what happens to the space it leaves.

> Caption: That single assumption leaves two questions open: where the block goes, and what happens to the space left over.

Exam-trap caption mode adds: *The syllabus names "memory management" and not "first fit" — the placement policies are the machinery inside that clause, and they are what a numerical question asks about.*

**0:16–0:24** — The whole topic is one list of blocks and one subtraction per request.

> Caption: The whole topic is one list of blocks and one subtraction per request.

Exam-trap caption mode adds: *If H equals P the hole disappears rather than becoming a zero-byte hole. Counting it as a hole gives the wrong number of holes.*

## Scene 2. Fixed partitioning: partitions first, processes second

*0:24 – 0:56 · objective: Carve 1024 KB into eight 128 KB partitions, place five processes, and account for every byte: 191 KB of internal waste and 384 KB in three partitions nobody can use.*

**0:24–0:32** — Fixed partitioning cuts memory into equal pieces before any process exists. Here, eight partitions of one hundred and twenty-eight kilobytes.

> Caption: Fixed partitioning: 1024 KB is cut into eight partitions of 128 KB before any process exists.

Exam-trap caption mode adds: *Unequal fixed partitions are a variant: the count is still fixed, but the sizes differ. A question that gives partition sizes of 100, 200 and 500 KB is still fixed partitioning.*

**0:32–0:40** — Five processes are placed, and the part of each partition they do not use is wasted inside it. One hundred and ninety-one kilobytes in total.

> Caption: Five processes are placed, and the unused part of each partition is wasted inside it: 18, 33, 0, 88 and 52 KB.

Exam-trap caption mode adds: *Internal waste is partition size minus request size. Subtracting the other way round, or forgetting that P3 wastes nothing, both give a wrong total.*

**0:40–0:48** — A sixth process asks for a hundred and thirty kilobytes and cannot run, although three partitions are free.

> Caption: P6 asks for 130 KB and cannot run, although three partitions are free.

Exam-trap caption mode adds: *The answer to "why is this process not scheduled" is not always "not enough memory". Here 384 KB is free and the answer is still no.*

**0:48–0:56** — Four hundred and forty-nine kilobytes in use, one hundred and ninety-one wasted inside partitions, three hundred and eighty-four in empty ones. Five hundred and seventy-five of the thousand and twenty-four kilobytes are unusable.

> Caption: The account: 449 KB in use, 191 KB internal waste, 384 KB in free partitions, so 575 KB of 1024 is unusable.

Exam-trap caption mode adds: *Internal waste and free partitions are both "waste" but they are not the same thing, and only the second could have been used by a differently sized process.*

## Scene 3. Variable partitioning: the partition is cut to fit

*0:56 – 1:22 · objective: Place a request by splitting a hole, see that the remainder is hole minus request, and state the coalescing rule that decides whether two free pieces become one.*

**0:56–1:05** — Variable partitioning keeps a list of holes in address order. Here six holes of two hundred, four hundred, six hundred, five hundred, three hundred and two hundred and fifty kilobytes.

> Caption: Variable partitioning: 2500 KB holding six holes of 200, 400, 600, 500, 300 and 250 KB.

Exam-trap caption mode adds: *First fit scans in address order, not in ascending size. Sorting the holes first changes the answer.*

**1:05–1:13** — A request of three hundred and fifty-seven kilobytes takes that much of the four-hundred-kilobyte hole and leaves forty-three kilobytes as a hole.

> Caption: A 357 KB request takes 357 of the 400 KB hole and leaves 43 KB as a hole.

Exam-trap caption mode adds: *Writing the original 400 KB back into the free list is the single most common mistake. The hole is replaced by the remainder, immediately.*

**1:13–1:22** — When a process leaves, its block becomes a hole. Two holes that touch merge, and two that do not stay apart.

> Caption: When a process leaves, its block becomes a hole; two holes that touch merge, two that do not stay apart.

Exam-trap caption mode adds: *Two holes separated by one live block cannot be merged, however small that block is. Compaction is the only way to join them.*

## Scene 4. First fit, traced request by request

*1:22 – 1:54 · objective: Run the four-request stream through first fit, writing the leftover at each step, and see the fourth request refused while 1215 KB is free.*

**1:22–1:30** — First fit scans from address zero and takes the first hole that is large enough. Three hundred and fifty-seven goes into the four hundred, leaving forty-three.

> Caption: First fit: scan from address zero and take the first hole that is large enough. 357 goes into the 400 KB hole, leaving 43.

Exam-trap caption mode adds: *The scan stops at the first fit. Continuing to look for a better hole is best fit, and it is a different policy with a different answer.*

**1:30–1:38** — Two hundred and ten goes into the six hundred, leaving three hundred and ninety. Four hundred and sixty-eight goes into the five hundred, leaving thirty-two.

> Caption: 210 goes into the 600 KB hole, leaving 390; 468 goes into the 500 KB hole, leaving 32.

Exam-trap caption mode adds: *The 43 KB remainder is examined before the 600 KB hole because it sits at a lower address. Order of examination is address order, not size order.*

**1:38–1:46** — The fourth request of four hundred and ninety-one kilobytes is refused, although twelve hundred and fifteen kilobytes are free.

> Caption: The fourth request of 491 KB is refused, although 1215 KB is free and the largest hole is 390 KB.

Exam-trap caption mode adds: *Adding the holes together to answer "does it fit" is the trap. A contiguous request needs one hole, not the sum of several.*

**1:46–1:54** — First fit is fast because it usually stops early. Its cost is that the low addresses are rescanned for every request.

> Caption: First fit is fast because it usually stops early; its cost is that the low addresses are rescanned for every request.

Exam-trap caption mode adds: *First fit is not optimal and never claims to be. A question that asks for the optimal placement of a set of processes is a different question.*

## Scene 5. Best fit and worst fit on the same stream

*1:54 – 2:22 · objective: Place four requests with best fit and two with worst fit on identical holes, and read the consequence in the number of placements, not in the name of the policy.*

**1:54–2:01** — Best fit takes the smallest hole that is large enough. All four requests are placed, and seven hundred and twenty-four kilobytes are left in six holes.

> Caption: Best fit takes the smallest hole that is large enough: all four requests are placed and 724 KB is left in six holes.

Exam-trap caption mode adds: *Best fit is the smallest hole that can satisfy the request, not the smallest hole overall. A hole smaller than the request is not a candidate at all.*

**2:01–2:08** — Worst fit takes the largest hole. Two requests are placed, and the third is refused with sixteen hundred and eighty-three kilobytes free.

> Caption: Worst fit takes the largest hole: two requests are placed and the third is refused with 1683 KB free.

Exam-trap caption mode adds: *Worst fit leaves the biggest remainder at each step and still does worse overall. A locally large leftover is not a globally better layout.*

**2:08–2:15** — Best fit keeps the large holes for the large requests that arrive later, and pays for it by scanning every hole.

> Caption: Best fit keeps the large holes for the large requests that arrive later, and pays for it by scanning every hole.

Exam-trap caption mode adds: *The textbook result is that first fit and best fit both beat worst fit on speed and on storage utilisation. It is not a claim that best fit beats first fit.*

**2:15–2:22** — Same holes, same requests, four placements against two. The policy is the only difference.

> Caption: Same six holes, same four requests, four placements against two — the policy is the only difference.

Exam-trap caption mode adds: *A question that gives holes and requests but no policy is unanswerable. Say which policy you assumed.*

## Scene 6. Next fit and the rover

*2:22 – 2:46 · objective: Resume the scan where the last allocation stopped, and see a searched witness where the same holes and requests give a different leftover from first fit.*

**2:22–2:30** — Next fit is first fit with a rover. The scan resumes where the last allocation stopped.

> Caption: Next fit is first fit with a rover: the scan resumes where the last allocation stopped.

Exam-trap caption mode adds: *The rover does not point at the chosen hole; it points past it. Restarting the scan at the chosen hole turns next fit back into first fit.*

**2:30–2:38** — On this stream it places three of four, the same count and the same layout as first fit.

> Caption: On this stream it places three of four, the same count and the same layout as first fit.

Exam-trap caption mode adds: *Two policies giving the same answer on one stream says nothing about the next stream. Equivalence needs a proof, and there is none here.*

**2:38–2:46** — With holes of a hundred, two hundred and seven hundred kilobytes, first fit leaves nothing where next fit leaves six hundred kilobytes.

> Caption: A searched witness: with holes 100, 200 and 700 KB, first fit leaves 0 KB where next fit leaves 600 KB.

Exam-trap caption mode adds: *A witness proves that a claim is not universally true. It does not show which policy is better on average.*

## Scene 7. External fragmentation, measured

*2:46 – 3:14 · objective: Separate a capacity shortage from a shape problem using two numbers: total free space and the largest single hole.*

**2:46–2:53** — External fragmentation means the free bytes exist, in six pieces, and no single piece is large enough.

> Caption: External fragmentation: the free bytes exist, in six pieces, and no single piece is large enough.

Exam-trap caption mode adds: *External fragmentation is defined by the request, not by the memory. The same 390 KB hole is external waste for a 491 KB request and perfectly usable for a 300 KB one.*

**2:53–3:00** — The diagnostic is two numbers: the total free space, and the largest single hole.

> Caption: The diagnostic is two numbers: total free space, and the largest single hole.

Exam-trap caption mode adds: *A question that says "the process could not be allocated even though enough memory is free" has already told you which of the two failures it is.*

**3:00–3:07** — The average hole size is two hundred and two point five kilobytes, and it decides nothing.

> Caption: The average hole size is 202.5 KB, which is not the number that decides anything.

Exam-trap caption mode adds: *Averaging hole sizes is a distractor in numerical questions. Only the maximum, or a count above a threshold, answers "does it fit".*

**3:07–3:14** — No placement policy prevents external fragmentation for arbitrary arrivals and departures.

> Caption: No placement policy prevents external fragmentation for arbitrary arrivals and departures.

Exam-trap caption mode adds: *Paging removes external fragmentation because any frame will do. Segmentation keeps it, because a segment must still be one contiguous block.*

## Scene 8. Internal against external

*3:14 – 3:40 · objective: Decide which kind of waste a layout has by asking who owns the wasted bytes, and see that compaction cures only one of the two.*

**3:14–3:22** — Internal waste sits inside an allocation the allocator has already given away. External waste sits in the free list.

> Caption: Internal waste sits inside an allocation the allocator has already given away; external waste sits in the free list.

Exam-trap caption mode adds: *The words describe where the bytes are, not how many there are. A layout can have a lot of one and none of the other.*

**3:22–3:31** — Fixed partitioning creates internal waste by construction. Variable partitioning creates external waste by history.

> Caption: Fixed partitioning creates internal waste by construction; variable partitioning creates external waste by history.

Exam-trap caption mode adds: *Variable partitioning does not eliminate fragmentation; it relocates it from inside allocations to between them.*

**3:31–3:40** — Compaction cures the second and cannot touch the first. Paging still has internal waste.

> Caption: Compaction cures the second and cannot touch the first; paging still has internal waste.

Exam-trap caption mode adds: *The claim that paging eliminates fragmentation is wrong as stated. It eliminates external fragmentation and keeps internal fragmentation of at most one page per process.*

## Scene 9. Compaction: what it buys and what it costs

*3:40 – 4:08 · objective: Pack the live blocks, count the 1285 KB that must be copied, and state the two conditions under which compaction is possible at all.*

**3:40–3:47** — Compaction moves the live blocks together, so the scattered free space becomes one hole of the same total.

> Caption: Compaction moves the live blocks together, so 1215 KB of scattered free space becomes one hole of 1215 KB.

Exam-trap caption mode adds: *Compaction does not increase free memory. A question that expects the total to rise after compaction is testing whether you know that.*

**3:47–3:54** — The bill is twelve hundred and eighty-five kilobytes copied in eight blocks, proportional to the live bytes moved.

> Caption: The bill is 1285 KB copied, in eight blocks — proportional to the live bytes moved, not to the number of holes.

Exam-trap caption mode adds: *The cost of compaction is live bytes moved, not holes merged. A memory with one big live block and many holes is the expensive case.*

**3:54–4:01** — Compaction needs dynamic relocation: every address a process holds must be rewritable at run time.

> Caption: It needs dynamic relocation: every address a process holds must be rewritable at run time.

Exam-trap caption mode adds: *Compaction is possible only when relocation is dynamic and done at execution time. A question that states static binding has already ruled it out.*

**4:01–4:08** — Compaction must not move a block that a device is reading. Pin it, or do the I/O through kernel buffers.

> Caption: And it must not move a block that a device is reading: pin it, or do I/O through kernel buffers.

Exam-trap caption mode adds: *This I/O restriction is a favourite one-mark question, and it is a property of compaction, not of paging.*

## Scene 10. Best fit is a name, not a result

*4:08 – 4:36 · objective: Trace a 1994 paper question in which first fit places all four requests and best fit places three, and see why the better-looking policy loses.*

**4:08–4:15** — Blocks of fifty in use, one hundred and fifty free, three hundred in use, three hundred and fifty free, six hundred in use. Requests three hundred, twenty-five, one hundred and twenty-five, fifty.

> Caption: A 1994 paper question: blocks of 50 in use, 150 free, 300 in use, 350 free, 600 in use; requests 300, 25, 125, 50.

Exam-trap caption mode adds: *Reordering the requests to make them fit better is not allowed. The question fixes the order, and the order changes the answer.*

**4:15–4:22** — First fit places all four. Three hundred and fifty gives fifty, then one hundred and fifty gives one hundred and twenty-five, then that is taken exactly, then fifty exactly.

> Caption: First fit places all four: 350 gives 50, then 150 gives 125, then 125 exactly, then 50 exactly.

Exam-trap caption mode adds: *A hole used exactly disappears. Writing it back as a zero-size hole inflates the hole count and can change a later decision.*

**4:22–4:29** — Best fit places three. It serves twenty-five from the fifty, leaving two twenty-five kilobyte holes that cannot hold fifty.

> Caption: Best fit places three: it serves 25 from the 50, leaving two 25 KB holes that cannot hold 50.

Exam-trap caption mode adds: *This is the counterexample to "best fit is best". It is a real past question, not a constructed example.*

**4:29–4:36** — Best is a description of the immediate leftover, not a guarantee about the outcome.

> Caption: So "best" is a description of the immediate leftover, not a guarantee about the outcome.

Exam-trap caption mode adds: *The provable claim is about one leftover, not about placements. Do not extend a theorem about a single step to a whole trace.*

## Scene 11. The procedure that answers the question

*4:36 – 5:06 · objective: Fix what the question fixes, trace mechanically in address order, then run the two diagnostics — internal or external, capacity or shape.*

**4:36–4:43** — First, fix what the question fixes: the policy, the request order, and whether compaction is allowed.

> Caption: First, fix what the question fixes: the policy, the request order, and whether compaction is allowed.

Exam-trap caption mode adds: *If the question does not name a policy, no single answer exists. State the policy you assumed and answer under it.*

**4:43–4:51** — Then trace mechanically: keep address order, take the requests in order, and write the remainder immediately.

> Caption: Then trace mechanically: keep address order, take requests in order, and write the remainder immediately.

Exam-trap caption mode adds: *The running free list is the state that the next request sees. Skipping a line of it produces an answer that looks plausible and is wrong.*

**4:51–4:58** — Then the two diagnostics: internal or external, and a capacity shortage or a shape problem.

> Caption: Then the two diagnostics: internal or external, and a capacity shortage or a shape problem.

Exam-trap caption mode adds: *Compaction cannot help a capacity shortage, and adding memory does not help external fragmentation. The remedy follows the diagnosis.*

**4:58–5:06** — First fit places three of four, next fit three, best fit four, worst fit two, all from identical holes.

> Caption: On this page's own stream: first fit 3 of 4, next fit 3, best fit 4, worst fit 2 — from identical holes.

Exam-trap caption mode adds: *Memorising one policy's outcome as "the answer" fails on the next stream. The trace is the method.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
