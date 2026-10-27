# Memory Hierarchy And Cache — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/memory-hierarchy-and-cache/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 41 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Why a small fast memory helps at all

*0:00 – 0:30 · objective: State the two kinds of locality, and read the hierarchy as a bet on them: a hit costs one level, a miss costs that level plus a trip down.*

**0:00–0:07** — A memory hierarchy works because programs repeat themselves: the same address is used again soon, and its neighbours are used soon after.

> Caption: A memory hierarchy works because programs repeat themselves: the same address is used again soon, and its neighbours are used soon after.

Exam-trap caption mode adds: *A cache does not make memory faster. It makes the average access faster by making most accesses cheap, and it makes some accesses much more expensive. If a program had no locality, a cache would only add work.*

**0:07–0:15** — Each level is bigger, slower and cheaper per byte than the one above, and holds copies of blocks taken from the level below.

> Caption: Each level is bigger, slower and cheaper per byte than the one above, and holds copies of blocks taken from the level below.

Exam-trap caption mode adds: *The numbers on the ladder in the animation are orders of magnitude, offered as a picture of the shape of the hierarchy. They are not a specification and no GATE question quotes them.*

**0:15–0:22** — A hit costs one access at that level. A miss costs that access plus a trip to the next level, which is the miss penalty.

> Caption: A hit costs one access at that level. A miss costs that access plus a trip to the next level, which is the miss penalty.

Exam-trap caption mode adds: *Do not call the miss penalty the memory access time. Whether it includes the hit time is a convention, and the next scene shows the two conventions giving different answers to the same arithmetic.*

**0:22–0:30** — Temporal locality is the same address twice. Spatial locality is a neighbour. A block is what turns spatial locality into hits.

> Caption: Temporal locality is the same address twice. Spatial locality is a neighbour. A block is what turns spatial locality into hits.

Exam-trap caption mode adds: *A larger block helps spatial locality and hurts when the extra bytes are never used, because they still cost transfer time and still evict something. Block size is a trade, not a free win.*

## Scene 2. Average access time: one formula, two conventions

*0:30 – 1:00 · objective: Compute T = T_hit + m x P from a hit rate, and say whether the miss penalty given already includes the cache access time.*

**0:30–0:37** — Average memory access time is the hit time plus the miss rate times the miss penalty: T equals T-hit plus m times P.

> Caption: Average memory access time is the hit time plus the miss rate times the miss penalty: T equals T-hit plus m times P.

Exam-trap caption mode adds: *The miss rate multiplies the penalty only, not the hit time. Writing T = m times P drops the hit time entirely and is wrong for every cache.*

**0:37–0:45** — GATE 2015 Set 2: 80 per cent hits at 5 ns with a 50 ns miss gives 0.8 times 5 plus 0.2 times 50, which is 14 ns.

> Caption: GATE 2015 Set 2: 80 per cent hits at 5 ns with a 50 ns miss gives 0.8 times 5 plus 0.2 times 50, which is 14 ns.

Exam-trap caption mode adds: *Using T = T_hit + m times P with P taken as 50 would give 5 + 10 = 15, which double counts the hit time. When the paper gives the full miss time, weight the two outcomes.*

**0:45–0:52** — Hierarchical access adds the cache time to the penalty. Simultaneous access looks in both at once, so the miss costs only the lower level time.

> Caption: Hierarchical access adds the cache time to the penalty. Simultaneous access looks in both at once, so the miss costs only the lower level time.

Exam-trap caption mode adds: *GATE states which convention it means, in words like "including the miss penalty of the previous level". Assume nothing; the same numbers differ by the hit time under the other convention.*

**0:52–1:00** — So read what the paper hands you: hit time and penalty, or hit time and full miss time. The formula follows the words.

> Caption: So read what the paper hands you: hit time and penalty, or hit time and full miss time. The formula follows the words.

Exam-trap caption mode adds: *A question that says "the average access time is 13.5 ns" and asks for a hit rate cannot be solved without knowing which convention the paper used. Write the convention down before solving.*

## Scene 3. The address splits into three fields

*1:00 – 1:30 · objective: Derive offset, index and tag bit widths from block size, number of sets and address width, and check that the three add up.*

**1:00–1:07** — Every address splits into three fields: the offset picks the byte inside the block, the index picks the set, and the tag is what is left.

> Caption: Every address splits into three fields: the offset picks the byte inside the block, the index picks the set, and the tag is what is left.

Exam-trap caption mode adds: *The tag is not a separate field that the hardware may define freely. Its width is forced: address width minus offset minus index. A question that gives you a tag width is giving you an equation.*

**1:07–1:15** — Offset bits are log base 2 of the block size, index bits log base 2 of the number of sets, and the three must add to the address width.

> Caption: Offset bits are log base 2 of the block size, index bits log base 2 of the number of sets, and the three must add to the address width.

Exam-trap caption mode adds: *Dividing by associativity twice, or forgetting that the cache size is in bytes while the block size may be given in words, are the two most common slips. Convert the word size first.*

**1:15–1:22** — GATE 2021 Set 1: a 32-bit byte address, a 32 KB direct-mapped cache, 64-byte blocks. Offset 6, index 9, tag 17.

> Caption: GATE 2021 Set 1: a 32-bit byte address, a 32 KB direct-mapped cache, 64-byte blocks. Offset 6, index 9, tag 17.

Exam-trap caption mode adds: *The 32 KB is the size of the cache, not the size of the address space. The address space here is 2 to the 32 bytes and it is given by the address width.*

**1:22–1:30** — GATE 2025 Set 1 asked for the total tag storage: 1024 lines times 6 bits, which is 6144 bits, not 6.

> Caption: GATE 2025 Set 1 asked for the total tag storage: 1024 lines times 6 bits, which is 6144 bits, not 6.

Exam-trap caption mode adds: *The question asks for storage, so it multiplies by the number of lines. Answering 6 is answering the tag width, which is a different question.*

## Scene 4. Direct, set-associative, fully associative

*1:30 – 2:00 · objective: Name the mapping from block number to line or set, and see why only set-associative and fully associative need a replacement choice.*

**1:30–1:37** — Direct mapped: block b may live only in line b modulo L, so there is exactly one place to look and no choice to make.

> Caption: Direct mapped: block b may live only in line b modulo L, so there is exactly one place to look and no choice to make.

Exam-trap caption mode adds: *Direct mapped is the cheapest to search and the most prone to conflict misses, because two blocks that differ only above the index bits fight for one line for ever.*

**1:37–1:45** — Set associative: block b goes to set b modulo v, and may sit in any of that set's k lines.

> Caption: Set associative: block b goes to set b modulo v, and may sit in any of that set's k lines.

Exam-trap caption mode adds: *k is the associativity, v is the number of sets, and L is v times k. Mixing up which of the three the index field counts is the usual error: the index counts sets.*

**1:45–1:52** — Fully associative: one set, so a block may sit anywhere, and there are no index bits at all.

> Caption: Fully associative: one set, so a block may sit anywhere, and there are no index bits at all.

Exam-trap caption mode adds: *A fully associative cache still has a block offset. Only the index vanishes. Questions that say "index field" for a fully associative cache expect the answer zero, not the tag.*

**1:52–2:00** — GATE 2013 asked for the line range of block j: from j modulo v times k up to that plus k minus 1.

> Caption: GATE 2013 asked for the line range of block j: from j modulo v times k up to that plus k minus 1.

Exam-trap caption mode adds: *The distractors all use the right modulus with the wrong multiplier: j mod v without the k factor, or j mod k instead of j mod v. The modulus is always the number of sets.*

## Scene 5. Associativity trades index bits for tag bits

*2:00 – 2:30 · objective: Use the exchange rate: raising associativity to k removes log2(k) index bits and adds the same number to the tag, in both directions.*

**2:00–2:07** — Raising associativity to k divides the number of sets, so the index loses log base 2 of k bits and the tag gains exactly those bits.

> Caption: Raising associativity to k divides the number of sets, so the index loses log base 2 of k bits and the tag gains exactly those bits.

Exam-trap caption mode adds: *Total cache capacity does not change with associativity, so the number of lines does not change either. Only the split of the block number between index and tag changes.*

**2:07–2:15** — GATE 2017 Set 1: a 10-bit tag in a direct-mapped cache becomes 14 bits at 16-way, because 16 is 2 to the 4.

> Caption: GATE 2017 Set 1: a 10-bit tag in a direct-mapped cache becomes 14 bits at 16-way, because 16 is 2 to the 4.

Exam-trap caption mode adds: *Multiplying 10 by 16, or adding 16, are both common wrong answers. The change is additive in bits and equal to log2 of the associativity.*

**2:15–2:22** — GATE 2021 Set 2 runs the exchange backwards: 2 KB of cache, 64-byte blocks, a 22-bit tag in a 32-bit address, so 4 index bits, 16 sets and 2 ways.

> Caption: GATE 2021 Set 2 runs the exchange backwards: 2 KB of cache, 64-byte blocks, a 22-bit tag in a 32-bit address, so 4 index bits, 16 sets and 2 ways.

Exam-trap caption mode adds: *The number of lines comes from the cache size and the block size, never from the index width. The index width tells you the number of sets, and the associativity is the quotient.*

**2:22–2:30** — Associativity buys fewer conflict misses and pays with a wider tag and a slower comparison.

> Caption: Associativity buys fewer conflict misses and pays with a wider tag and a slower comparison.

Exam-trap caption mode adds: *A wider tag does not change the number of lines, so the data storage is unchanged. What grows is the per-line tag and status storage, which is the subject of the 2025 tag-storage question.*

## Scene 6. A replacement walk on a real trace

*2:30 – 3:00 · objective: Simulate least-recently-used replacement on the GATE 2004 trace and count misses, not addresses.*

**2:30–2:37** — On a miss into a full set, a replacement policy names the victim. Least recently used names the line unused for the longest time.

> Caption: On a miss into a full set, a replacement policy names the victim. Least recently used names the line unused for the longest time.

Exam-trap caption mode adds: *A replacement policy is only consulted when the target set is full. A direct-mapped cache has one line per set, so it never needs a policy and any mention of LRU in a direct-mapped question is a distractor.*

**2:37–2:45** — GATE 2004: two-way with four blocks, so two sets of two lines. Every block in the trace is even, so all five accesses land in set 0.

> Caption: GATE 2004: two-way with four blocks, so two sets of two lines. Every block in the trace is even, so all five accesses land in set 0.

Exam-trap caption mode adds: *It is tempting to count the four blocks as four usable lines. They are not: the mapping fixes the set, so half the cache is unreachable from this trace.*

**2:45–2:52** — The walk: 8, 12 and 0 each miss and fill, 12 hits, then 8 misses again and evicts 0. Four misses in all.

> Caption: The walk: 8, 12 and 0 each miss and fill, 12 hits, then 8 misses again and evicts 0. Four misses in all.

Exam-trap caption mode adds: *A hit still updates recency. Forgetting that turns the fourth access into a hit for the wrong reason and changes the victim of the fifth.*

**2:52–3:00** — The first three misses are unavoidable. The last is not: the same trace in four fully associative lines misses only three times.

> Caption: The first three misses are unavoidable. The last is not: the same trace in four fully associative lines misses only three times.

Exam-trap caption mode adds: *Do not read this as "associativity is always better". It removes this miss, and it changes the hit time and the tag width, so the average access time can still get worse.*

## Scene 7. Compulsory, conflict, capacity

*3:00 – 3:30 · objective: Classify each miss by the counterfactual that removes it: a different cache of the same size, or a bigger cache.*

**3:00–3:07** — A compulsory miss is the first reference to a block. No cache size and no associativity removes it.

> Caption: A compulsory miss is the first reference to a block. No cache size and no associativity removes it.

Exam-trap caption mode adds: *A compulsory miss is defined by the trace, not by the cache. The same access is compulsory in every cache, so counting distinct blocks in the trace gives the compulsory count directly.*

**3:07–3:15** — A conflict miss disappears when the same capacity is made fully associative, because nothing is then forced to share a set.

> Caption: A conflict miss disappears when the same capacity is made fully associative, because nothing is then forced to share a set.

Exam-trap caption mode adds: *Re-running the trace in a bigger cache mixes conflict and capacity misses and will not separate them. Only the same-capacity fully associative version isolates conflict.*

**3:15–3:22** — A capacity miss survives full associativity and goes away only when the cache is larger than the working set.

> Caption: A capacity miss survives full associativity and goes away only when the cache is larger than the working set.

Exam-trap caption mode adds: *Capacity is about the number of distinct blocks alive at once, not about the trace length. A long trace over a small working set has no capacity misses.*

**3:22–3:30** — So classify by counterfactual: re-run the same trace in another cache and see which misses vanish. The page does exactly that.

> Caption: So classify by counterfactual: re-run the same trace in another cache and see which misses vanish. The page does exactly that.

Exam-trap caption mode adds: *The three categories can overlap in loose usage, and different textbooks split them slightly differently. GATE questions are written against the counterfactual definition, so use it.*

## Scene 8. Write-through against write-back

*3:30 – 4:00 · objective: Say which policy needs a dirty bit, which one writes memory on a store, and what eviction costs under each.*

**3:30–3:37** — A write hit always updates the cache. The policy decides whether main memory is updated now or later.

> Caption: A write hit always updates the cache. The policy decides whether main memory is updated now or later.

Exam-trap caption mode adds: *Write policy and write-miss policy are two independent choices. Write-back with no write-allocate, and write-through with write-allocate, are both real designs.*

**3:37–3:45** — Write-through writes memory on every store, so no dirty bit is needed and eviction moves no data.

> Caption: Write-through writes memory on every store, so no dirty bit is needed and eviction moves no data.

Exam-trap caption mode adds: *A dirty bit in a write-through cache is not merely useless, it is never set. A statement that both policies keep a dirty bit is false, which is exactly the 2022 question.*

**3:45–3:52** — Write-back writes only the cache and sets the dirty bit. The block goes to memory when it is evicted.

> Caption: Write-back writes only the cache and sets the dirty bit. The block goes to memory when it is evicted.

Exam-trap caption mode adds: *Write-back does not mean memory is never written. It means the write is deferred to eviction, so the total number of memory writes depends on how often dirty lines are evicted.*

**3:52–4:00** — GATE 2022: the false statements are A, B and D. Only C, that evicting from a write-through cache moves no data, is true.

> Caption: GATE 2022: the false statements are A, B and D. Only C, that evicting from a write-through cache moves no data, is true.

Exam-trap caption mode adds: *The question asks which are FALSE, so a true statement left unmarked is correct behaviour. Marking all four, or marking only D, are the two common errors.*

## Scene 9. Two levels, and the move to CPI

*4:00 – 4:30 · objective: Weight the three mutually exclusive outcomes of a two-level hierarchy, then convert a miss rate into stall cycles per instruction.*

**4:00–4:07** — With two levels the outcomes are exclusive: L1 hit, or L1 miss with L2 hit, or both miss.

> Caption: With two levels the outcomes are exclusive: L1 hit, or L1 miss with L2 hit, or both miss.

Exam-trap caption mode adds: *Multiplying the two hit rates, or adding the two miss rates, both destroy the partition. The miss rates multiply, the hit rate of the lower level applies only to the survivors.*

**4:07–4:15** — GATE 2025 Set 1: 0.95 times 10 plus 0.0425 times 20 plus 0.0075 times 200, which is 11.85 ns.

> Caption: GATE 2025 Set 1: 0.95 times 10 plus 0.0425 times 20 plus 0.0075 times 200, which is 11.85 ns.

Exam-trap caption mode adds: *Adding the L1 time again inside the L2 and memory terms double counts it and gives 12.5. The paper says the lower times already include the penalty, so they are used directly.*

**4:15–4:22** — For the processor, stall cycles per instruction are the accesses per instruction times the miss rate times the miss penalty.

> Caption: For the processor, stall cycles per instruction are the accesses per instruction times the miss rate times the miss penalty.

Exam-trap caption mode adds: *Charging a data miss to every instruction instead of only to the memory instructions overstates the stalls by the reciprocal of that fraction, and is the single most common error in this question type.*

**4:22–4:30** — That is why cache questions end as CPI or speedup questions: the memory system changes the cycles, not the instruction count.

> Caption: That is why cache questions end as CPI or speedup questions: the memory system changes the cycles, not the instruction count.

Exam-trap caption mode adds: *Do not compare miss rates and call the difference a speedup. Speedup is a ratio of times, and a miss rate enters a time only through the stall cycles it causes.*

## Scene 10. The procedure, and five traps

*4:30 – 5:00 · objective: Carry the five-step procedure from an address width to a speedup, with the five errors that cost marks marked beside it.*

**4:30–4:36** — Step one: split the address into offset, index and tag, and check that the three widths add to the address width.

> Caption: Step one: split the address into offset, index and tag, and check that the three widths add to the address width.

Exam-trap caption mode adds: *The block size may be given in words. Convert with the word length before taking any logarithm.*

**4:36–4:42** — Step two: name the mapping, because it fixes the number of sets and therefore the index width.

> Caption: Step two: name the mapping, because it fixes the number of sets and therefore the index width.

Exam-trap caption mode adds: *A question that gives an associativity and a cache size gives you the number of sets for free. Use it before guessing any bit width.*

**4:42–4:48** — Step three: if a trace is given, count hits, misses and evictions, not addresses.

> Caption: Step three: if a trace is given, count hits, misses and evictions, not addresses.

Exam-trap caption mode adds: *A repeated address in the same block is a hit only if the block is still resident. A repeated block number is not automatically a hit.*

**4:48–4:54** — Step four: use the access-time convention the paper used, and convert units once, at the end.

> Caption: Step four: use the access-time convention the paper used, and convert units once, at the end.

Exam-trap caption mode adds: *Rounding an intermediate value and then multiplying by a large instruction count turns a small slip into a wrong answer that is not near any option.*

**4:54–5:00** — Step five: for a speedup, divide times, never miss rates. And carry the clock if the question changed it.

> Caption: Step five: for a speedup, divide times, never miss rates. And carry the clock if the question changed it.

Exam-trap caption mode adds: *A miss rate falling from 20 per cent to 10 per cent is not a twofold speedup: the stall cycles halve, and the speedup depends on how large they were relative to the base CPI.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
