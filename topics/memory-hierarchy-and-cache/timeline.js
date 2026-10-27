/* ==========================================================================
   memory-hierarchy-and-cache - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'locality',
      n: 1,
      title: 'Why a small fast memory helps at all',
      start: 0, end: 30,
      objective: 'State the two kinds of locality, and read the hierarchy as a bet on them: a hit costs one level, a miss costs that level plus a trip down.'
    },
    {
      id: 'amat',
      n: 2,
      title: 'Average access time: one formula, two conventions',
      start: 30, end: 60,
      objective: 'Compute T = T_hit + m x P from a hit rate, and say whether the miss penalty given already includes the cache access time.'
    },
    {
      id: 'address',
      n: 3,
      title: 'The address splits into three fields',
      start: 60, end: 90,
      objective: 'Derive offset, index and tag bit widths from block size, number of sets and address width, and check that the three add up.'
    },
    {
      id: 'mapping',
      n: 4,
      title: 'Direct, set-associative, fully associative',
      start: 90, end: 120,
      objective: 'Name the mapping from block number to line or set, and see why only set-associative and fully associative need a replacement choice.'
    },
    {
      id: 'associativity',
      n: 5,
      title: 'Associativity trades index bits for tag bits',
      start: 120, end: 150,
      objective: 'Use the exchange rate: raising associativity to k removes log2(k) index bits and adds the same number to the tag, in both directions.'
    },
    {
      id: 'replacement',
      n: 6,
      title: 'A replacement walk on a real trace',
      start: 150, end: 180,
      objective: 'Simulate least-recently-used replacement on the GATE 2004 trace and count misses, not addresses.'
    },
    {
      id: 'threes',
      n: 7,
      title: 'Compulsory, conflict, capacity',
      start: 180, end: 210,
      objective: 'Classify each miss by the counterfactual that removes it: a different cache of the same size, or a bigger cache.'
    },
    {
      id: 'write',
      n: 8,
      title: 'Write-through against write-back',
      start: 210, end: 240,
      objective: 'Say which policy needs a dirty bit, which one writes memory on a store, and what eviction costs under each.'
    },
    {
      id: 'multilevel',
      n: 9,
      title: 'Two levels, and the move to CPI',
      start: 240, end: 270,
      objective: 'Weight the three mutually exclusive outcomes of a two-level hierarchy, then convert a miss rate into stall cycles per instruction.'
    },
    {
      id: 'recipe',
      n: 10,
      title: 'The procedure, and five traps',
      start: 270, end: 300,
      objective: 'Carry the five-step procedure from an address width to a speedup, with the five errors that cost marks marked beside it.'
    }
  ],

  events: [

    /* ---------------- scene 1: locality ---------------- */
    {
      id: 'lc-1', start: 0, end: 7.5, scene: 'locality',
      caption: 'A memory hierarchy works because programs repeat themselves: the same address is used again soon, and its neighbours are used soon after.',
      detail: 'A hierarchy of memories is only worth building if the fast, small memory can be right most of the time. It can, because real programs do not touch memory uniformly: they loop, they reuse variables, and they walk arrays in order. That non-uniformity is called locality, and every number in this lesson depends on it.',
      keyword: 'programs repeat themselves',
      trap: 'A cache does not make memory faster. It makes the average access faster by making most accesses cheap, and it makes some accesses much more expensive. If a program had no locality, a cache would only add work.',
      narration: 'A memory hierarchy works because programs repeat themselves: the same address is used again soon, and its neighbours are used soon after.'
    },
    {
      id: 'lc-2', start: 7.5, end: 15, scene: 'locality',
      caption: 'Each level is bigger, slower and cheaper per byte than the one above, and holds copies of blocks taken from the level below.',
      detail: 'Registers, then L1, then L2, then L3, then main memory, then storage. Going down, capacity grows and access time grows with it. Each level keeps a copy of some blocks of the level below, and a block is the unit of transfer: a cache never copies one byte, it copies a whole block, typically 32 to 128 bytes.',
      keyword: 'bigger, slower and cheaper per byte',
      trap: 'The numbers on the ladder in the animation are orders of magnitude, offered as a picture of the shape of the hierarchy. They are not a specification and no GATE question quotes them.',
      narration: 'Each level is bigger, slower and cheaper per byte than the one above, and holds copies of blocks taken from the level below.'
    },
    {
      id: 'lc-3', start: 15, end: 22.5, scene: 'locality',
      caption: 'A hit costs one access at that level. A miss costs that access plus a trip to the next level, which is the miss penalty.',
      detail: 'Two quantities drive every performance question in this topic: the hit time, which is the time to read the level when the block is present, and the miss penalty, which is the extra time to bring the block from below. A miss is not free and not merely slow: it is the hit time plus the penalty.',
      keyword: 'the miss penalty',
      trap: 'Do not call the miss penalty the memory access time. Whether it includes the hit time is a convention, and the next scene shows the two conventions giving different answers to the same arithmetic.',
      narration: 'A hit costs one access at that level. A miss costs that access plus a trip to the next level, which is the miss penalty.'
    },
    {
      id: 'lc-4', start: 22.5, end: 30, scene: 'locality',
      caption: 'Temporal locality is the same address twice. Spatial locality is a neighbour. A block is what turns spatial locality into hits.',
      detail: 'Temporal locality says a recently used address is likely to be used again, which is why keeping it is worthwhile. Spatial locality says an address near a recently used one is likely to be used, which is why the unit of transfer is a block rather than a byte. The two give different answers to "should I enlarge the cache or lengthen the block".',
      keyword: 'temporal and spatial',
      trap: 'A larger block helps spatial locality and hurts when the extra bytes are never used, because they still cost transfer time and still evict something. Block size is a trade, not a free win.',
      narration: 'Temporal locality is the same address twice. Spatial locality is a neighbour. A block is what turns spatial locality into hits.'
    },

    /* ---------------- scene 2: average access time ---------------- */
    {
      id: 'am-1', start: 30, end: 37.5, scene: 'amat',
      caption: 'Average memory access time is the hit time plus the miss rate times the miss penalty: T equals T-hit plus m times P.',
      detail: 'If a fraction h of accesses hit and the rest miss, the average time is h times the hit time plus (1 - h) times the miss time, where the miss time is the hit time plus the penalty. Collecting terms gives T = T_hit + (1 - h) times P, and (1 - h) is the miss rate m.',
      keyword: 'T-hit plus m times P',
      trap: 'The miss rate multiplies the penalty only, not the hit time. Writing T = m times P drops the hit time entirely and is wrong for every cache.',
      narration: 'Average memory access time is the hit time plus the miss rate times the miss penalty: T equals T-hit plus m times P.'
    },
    {
      id: 'am-2', start: 37.5, end: 45, scene: 'amat',
      caption: 'GATE 2015 Set 2: 80 per cent hits at 5 ns with a 50 ns miss gives 0.8 times 5 plus 0.2 times 50, which is 14 ns.',
      detail: 'The paper states that a read request takes 5 ns on a hit and 50 ns on a miss, with an 80 per cent hit rate. The 50 ns is the whole miss time here, so the two outcomes are weighted directly: 0.8 times 5 is 4, and 0.2 times 50 is 10, giving 14 ns. The page recomputes this and confirms 14.',
      keyword: '14 ns',
      trap: 'Using T = T_hit + m times P with P taken as 50 would give 5 + 10 = 15, which double counts the hit time. When the paper gives the full miss time, weight the two outcomes.',
      narration: 'GATE 2015 Set 2: 80 per cent hits at 5 ns with a 50 ns miss gives 0.8 times 5 plus 0.2 times 50, which is 14 ns.'
    },
    {
      id: 'am-3', start: 45, end: 52.5, scene: 'amat',
      caption: 'Hierarchical access adds the cache time to the penalty. Simultaneous access looks in both at once, so the miss costs only the lower level time.',
      detail: 'In a hierarchical or serial hierarchy, the lower level is consulted only after the upper level says no, so a miss costs the cache access time plus the memory access time. In a simultaneous or parallel hierarchy, both levels are read at once and a hit simply discards the slower result, so the miss costs only the memory time, but every access pays the larger of the two times.',
      keyword: 'two access conventions',
      trap: 'GATE states which convention it means, in words like "including the miss penalty of the previous level". Assume nothing; the same numbers differ by the hit time under the other convention.',
      narration: 'Hierarchical access adds the cache time to the penalty. Simultaneous access looks in both at once, so the miss costs only the lower level time.'
    },
    {
      id: 'am-4', start: 52.5, end: 60, scene: 'amat',
      caption: 'So read what the paper hands you: hit time and penalty, or hit time and full miss time. The formula follows the words.',
      detail: 'Three phrasings cover nearly every GATE cache performance question. "Hit time t and miss penalty p" means T = t + m times p. "Hit time t1 and miss time t2" means T = h times t1 + (1 - h) times t2. "Access time of level i including the miss penalty above" means weight each level time directly, as scene 9 does.',
      keyword: 'the formula follows the words',
      trap: 'A question that says "the average access time is 13.5 ns" and asks for a hit rate cannot be solved without knowing which convention the paper used. Write the convention down before solving.',
      narration: 'So read what the paper hands you: hit time and penalty, or hit time and full miss time. The formula follows the words.'
    },

    /* ---------------- scene 3: the address ---------------- */
    {
      id: 'ad-1', start: 60, end: 67.5, scene: 'address',
      caption: 'Every address splits into three fields: the offset picks the byte inside the block, the index picks the set, and the tag is what is left.',
      detail: 'The offset is the low-order field because a block is a contiguous run of bytes, so the low bits count position inside the run. The index is next because the set is chosen by a middle slice of the block number. The tag is the high-order remainder, and it is what the cache compares to decide whether the block it holds is the block you asked for.',
      keyword: 'offset, index, tag',
      trap: 'The tag is not a separate field that the hardware may define freely. Its width is forced: address width minus offset minus index. A question that gives you a tag width is giving you an equation.',
      narration: 'Every address splits into three fields: the offset picks the byte inside the block, the index picks the set, and the tag is what is left.'
    },
    {
      id: 'ad-2', start: 67.5, end: 75, scene: 'address',
      caption: 'Offset bits are log base 2 of the block size, index bits log base 2 of the number of sets, and the three must add to the address width.',
      detail: 'Number of lines equals cache size divided by block size. Number of sets equals number of lines divided by associativity. So the index width is log2 of that quotient. Everything is a power of two in these questions, which is why a bit count is a logarithm and not a division.',
      keyword: 'the three must add to the width',
      trap: 'Dividing by associativity twice, or forgetting that the cache size is in bytes while the block size may be given in words, are the two most common slips. Convert the word size first.',
      narration: 'Offset bits are log base 2 of the block size, index bits log base 2 of the number of sets, and the three must add to the address width.'
    },
    {
      id: 'ad-3', start: 75, end: 82.5, scene: 'address',
      caption: 'GATE 2021 Set 1: a 32-bit byte address, a 32 KB direct-mapped cache, 64-byte blocks. Offset 6, index 9, tag 17.',
      detail: 'Lines are 32768 divided by 64, which is 512, so the index is 9 bits. The block is 64 bytes, so the offset is 6 bits. The tag is 32 minus 9 minus 6, which is 17 bits. The page computes the same three numbers and checks that they sum to 32.',
      keyword: '17 bits',
      trap: 'The 32 KB is the size of the cache, not the size of the address space. The address space here is 2 to the 32 bytes and it is given by the address width.',
      narration: 'GATE 2021 Set 1: a 32-bit byte address, a 32 KB direct-mapped cache, 64-byte blocks. Offset 6, index 9, tag 17.'
    },
    {
      id: 'ad-4', start: 82.5, end: 90, scene: 'address',
      caption: 'GATE 2025 Set 1 asked for the total tag storage: 1024 lines times 6 bits, which is 6144 bits, not 6.',
      detail: 'The question gives 1 MB of main memory, a 20-bit address, 16 KB of cache and 16-byte blocks, and asks how many bits are needed to store all the tag values. Lines are 16384 divided by 16, which is 1024, so the index is 10 bits and the offset 4, leaving a 6-bit tag. Every one of the 1024 lines stores its own tag, so the total is 6144 bits.',
      keyword: '6144 bits',
      trap: 'The question asks for storage, so it multiplies by the number of lines. Answering 6 is answering the tag width, which is a different question.',
      narration: 'GATE 2025 Set 1 asked for the total tag storage: 1024 lines times 6 bits, which is 6144 bits, not 6.'
    },

    /* ---------------- scene 4: the three mappings ---------------- */
    {
      id: 'mp-1', start: 90, end: 97.5, scene: 'mapping',
      caption: 'Direct mapped: block b may live only in line b modulo L, so there is exactly one place to look and no choice to make.',
      detail: 'With L lines, the line number is the low bits of the block number, which is the index field of the address. Because the destination is forced, a lookup is one comparison, and a replacement needs no policy at all: the arriving block evicts whatever is there.',
      keyword: 'exactly one place to look',
      trap: 'Direct mapped is the cheapest to search and the most prone to conflict misses, because two blocks that differ only above the index bits fight for one line for ever.',
      narration: 'Direct mapped: block b may live only in line b modulo L, so there is exactly one place to look and no choice to make.'
    },
    {
      id: 'mp-2', start: 97.5, end: 105, scene: 'mapping',
      caption: 'Set associative: block b goes to set b modulo v, and may sit in any of that set\'s k lines.',
      detail: 'Divide the L lines into v sets of k lines each, so L equals v times k. The set is still forced, so the lookup is confined to one set, but inside that set all k tags are compared, usually in parallel. A replacement policy is needed only when the set is full.',
      keyword: 'any of that set\'s k lines',
      trap: 'k is the associativity, v is the number of sets, and L is v times k. Mixing up which of the three the index field counts is the usual error: the index counts sets.',
      narration: 'Set associative: block b goes to set b modulo v, and may sit in any of that set\'s k lines.'
    },
    {
      id: 'mp-3', start: 105, end: 112.5, scene: 'mapping',
      caption: 'Fully associative: one set, so a block may sit anywhere, and there are no index bits at all.',
      detail: 'Setting v equal to 1 makes every line a candidate, so the whole tag is compared against every line. The index field disappears, which is why a fully associative cache has tag width equal to address width minus offset. The cost is comparators, one per line, and a replacement decision on every miss.',
      keyword: 'no index bits at all',
      trap: 'A fully associative cache still has a block offset. Only the index vanishes. Questions that say "index field" for a fully associative cache expect the answer zero, not the tag.',
      narration: 'Fully associative: one set, so a block may sit anywhere, and there are no index bits at all.'
    },
    {
      id: 'mp-4', start: 112.5, end: 120, scene: 'mapping',
      caption: 'GATE 2013 asked for the line range of block j: from j modulo v times k up to that plus k minus 1.',
      detail: 'If the lines are laid out set by set, with set s occupying k consecutive lines starting at s times k, then block j, whose set is j modulo v, may occupy exactly the k lines starting at (j modulo v) times k. The page checks this for every block in a small example and confirms each range holds exactly k lines, all in the right set.',
      keyword: 'j mod v times k',
      trap: 'The distractors all use the right modulus with the wrong multiplier: j mod v without the k factor, or j mod k instead of j mod v. The modulus is always the number of sets.',
      narration: 'GATE 2013 asked for the line range of block j: from j modulo v times k up to that plus k minus 1.'
    },

    /* ---------------- scene 5: associativity ---------------- */
    {
      id: 'as-1', start: 120, end: 127.5, scene: 'associativity',
      caption: 'Raising associativity to k divides the number of sets, so the index loses log base 2 of k bits and the tag gains exactly those bits.',
      detail: 'The cache capacity and the block size are unchanged, so the number of lines is unchanged. Dividing the lines into sets of k leaves v over k sets, and log2(v/k) is log2(v) minus log2(k). The address width is fixed, so whatever the index loses the tag must gain.',
      keyword: 'loses index, gains tag',
      trap: 'Total cache capacity does not change with associativity, so the number of lines does not change either. Only the split of the block number between index and tag changes.',
      narration: 'Raising associativity to k divides the number of sets, so the index loses log base 2 of k bits and the tag gains exactly those bits.'
    },
    {
      id: 'as-2', start: 127.5, end: 135, scene: 'associativity',
      caption: 'GATE 2017 Set 1: a 10-bit tag in a direct-mapped cache becomes 14 bits at 16-way, because 16 is 2 to the 4.',
      detail: 'The question gives only the tag width and the change of associativity, which is enough because the exchange rate is fixed: 4 index bits become 4 tag bits. The page instantiates a concrete cache consistent with a 10-bit tag and checks that the 16-way version needs exactly 14.',
      keyword: '14 bits',
      trap: 'Multiplying 10 by 16, or adding 16, are both common wrong answers. The change is additive in bits and equal to log2 of the associativity.',
      narration: 'GATE 2017 Set 1: a 10-bit tag in a direct-mapped cache becomes 14 bits at 16-way, because 16 is 2 to the 4.'
    },
    {
      id: 'as-3', start: 135, end: 142.5, scene: 'associativity',
      caption: 'GATE 2021 Set 2 runs the exchange backwards: 2 KB of cache, 64-byte blocks, a 22-bit tag in a 32-bit address, so 4 index bits, 16 sets and 2 ways.',
      detail: 'Offset is 6 and tag is 22, so index is 32 minus 28, which is 4, giving 16 sets. The cache holds 2048 divided by 64, which is 32 lines. Thirty-two lines in sixteen sets is two lines per set, so the associativity is 2. The page solves for the associativity from the tag width and gets 2.',
      keyword: '2-way',
      trap: 'The number of lines comes from the cache size and the block size, never from the index width. The index width tells you the number of sets, and the associativity is the quotient.',
      narration: 'GATE 2021 Set 2 runs the exchange backwards: 2 KB of cache, 64-byte blocks, a 22-bit tag in a 32-bit address, so 4 index bits, 16 sets and 2 ways.'
    },
    {
      id: 'as-4', start: 142.5, end: 150, scene: 'associativity',
      caption: 'Associativity buys fewer conflict misses and pays with a wider tag and a slower comparison.',
      detail: 'Higher associativity means more blocks may share a set, so fewer misses are caused by collisions. The price is a wider tag stored per line, k comparators instead of one, and usually a longer hit time, which feeds straight back into the average access time.',
      keyword: 'buys misses, pays time',
      trap: 'A wider tag does not change the number of lines, so the data storage is unchanged. What grows is the per-line tag and status storage, which is the subject of the 2025 tag-storage question.',
      narration: 'Associativity buys fewer conflict misses and pays with a wider tag and a slower comparison.'
    },

    /* ---------------- scene 6: replacement ---------------- */
    {
      id: 'rp-1', start: 150, end: 157.5, scene: 'replacement',
      caption: 'On a miss into a full set, a replacement policy names the victim. Least recently used names the line unused for the longest time.',
      detail: 'FIFO evicts the line that arrived earliest, whatever has happened since. LRU evicts the line whose last use is furthest in the past. Random picks without looking. Optimal, also called Belady, evicts the line whose next use is furthest in the future, and is used only as a bound because it needs the future.',
      keyword: 'names the victim',
      trap: 'A replacement policy is only consulted when the target set is full. A direct-mapped cache has one line per set, so it never needs a policy and any mention of LRU in a direct-mapped question is a distractor.',
      narration: 'On a miss into a full set, a replacement policy names the victim. Least recently used names the line unused for the longest time.'
    },
    {
      id: 'rp-2', start: 157.5, end: 165, scene: 'replacement',
      caption: 'GATE 2004: two-way with four blocks, so two sets of two lines. Every block in the trace is even, so all five accesses land in set 0.',
      detail: 'Two-way associativity with four blocks gives two sets. The set is the block number modulo the number of sets, which is 2, so even blocks go to set 0 and odd blocks to set 1. The trace 8, 12, 0, 12, 8 contains only even numbers, so set 1 is never touched and all five accesses compete for the two lines of set 0.',
      keyword: 'all five accesses land in set 0',
      trap: 'It is tempting to count the four blocks as four usable lines. They are not: the mapping fixes the set, so half the cache is unreachable from this trace.',
      narration: 'GATE 2004: two-way with four blocks, so two sets of two lines. Every block in the trace is even, so all five accesses land in set 0.'
    },
    {
      id: 'rp-3', start: 165, end: 172.5, scene: 'replacement',
      caption: 'The walk: 8, 12 and 0 each miss and fill, 12 hits, then 8 misses again and evicts 0. Four misses in all.',
      detail: 'The first access to 8 misses and takes the first line. 12 misses and takes the second, filling the set. 0 misses and must evict, and 8 is the least recently used, so 0 replaces 8. 12 then hits, refreshing its recency. Finally 8 misses, and now 0 is the least recently used, so 8 replaces 0. Four misses out of five accesses.',
      keyword: 'four misses',
      trap: 'A hit still updates recency. Forgetting that turns the fourth access into a hit for the wrong reason and changes the victim of the fifth.',
      narration: 'The walk: 8, 12 and 0 each miss and fill, 12 hits, then 8 misses again and evicts 0. Four misses in all.'
    },
    {
      id: 'rp-4', start: 172.5, end: 180, scene: 'replacement',
      caption: 'The first three misses are unavoidable. The last is not: the same trace in four fully associative lines misses only three times.',
      detail: 'Make the cache fully associative with the same four lines and the trace becomes 8, 12, 0 in three empty lines, then 12 and 8 both hit. Three misses instead of four. The fourth miss existed only because the mapping forced 8, 12 and 0 into two lines. That is what makes it a conflict miss, which is scene 7.',
      keyword: 'three instead of four',
      trap: 'Do not read this as "associativity is always better". It removes this miss, and it changes the hit time and the tag width, so the average access time can still get worse.',
      narration: 'The first three misses are unavoidable. The last is not: the same trace in four fully associative lines misses only three times.'
    },

    /* ---------------- scene 7: the three Cs ---------------- */
    {
      id: 'tc-1', start: 180, end: 187.5, scene: 'threes',
      caption: 'A compulsory miss is the first reference to a block. No cache size and no associativity removes it.',
      detail: 'The block cannot be in the cache before it is ever asked for, so the first touch always misses. Compulsory misses are also called cold misses. Their count is exactly the number of distinct blocks in the trace, whatever the cache looks like.',
      keyword: 'first reference to a block',
      trap: 'A compulsory miss is defined by the trace, not by the cache. The same access is compulsory in every cache, so counting distinct blocks in the trace gives the compulsory count directly.',
      narration: 'A compulsory miss is the first reference to a block. No cache size and no associativity removes it.'
    },
    {
      id: 'tc-2', start: 187.5, end: 195, scene: 'threes',
      caption: 'A conflict miss disappears when the same capacity is made fully associative, because nothing is then forced to share a set.',
      detail: 'The test is a counterfactual that holds capacity fixed and changes only the mapping. In the 2004 trace the real cache misses four times and the fully associative cache of the same four blocks misses three times, so exactly one miss was caused by the mapping. That one is the conflict miss.',
      keyword: 'the counterfactual that holds capacity fixed',
      trap: 'Re-running the trace in a bigger cache mixes conflict and capacity misses and will not separate them. Only the same-capacity fully associative version isolates conflict.',
      narration: 'A conflict miss disappears when the same capacity is made fully associative, because nothing is then forced to share a set.'
    },
    {
      id: 'tc-3', start: 195, end: 202.5, scene: 'threes',
      caption: 'A capacity miss survives full associativity and goes away only when the cache is larger than the working set.',
      detail: 'If a trace touches more distinct blocks than the cache can hold, some block must be evicted and later refetched however clever the mapping is. Those are capacity misses. They are the ones an infinite cache would not have, minus the compulsory ones.',
      keyword: 'larger than the working set',
      trap: 'Capacity is about the number of distinct blocks alive at once, not about the trace length. A long trace over a small working set has no capacity misses.',
      narration: 'A capacity miss survives full associativity and goes away only when the cache is larger than the working set.'
    },
    {
      id: 'tc-4', start: 202.5, end: 210, scene: 'threes',
      caption: 'So classify by counterfactual: re-run the same trace in another cache and see which misses vanish. The page does exactly that.',
      detail: 'Three runs answer every classification question: the real cache, a fully associative cache of the same size, and an unbounded cache. Misses in the unbounded run are compulsory. Misses in the fully associative run that are not compulsory are capacity. Everything else in the real run is conflict. The page runs all three on the 2004 trace and prints the three counts.',
      keyword: 're-run the trace in another cache',
      trap: 'The three categories can overlap in loose usage, and different textbooks split them slightly differently. GATE questions are written against the counterfactual definition, so use it.',
      narration: 'So classify by counterfactual: re-run the same trace in another cache and see which misses vanish. The page does exactly that.'
    },

    /* ---------------- scene 8: write policy ---------------- */
    {
      id: 'wr-1', start: 210, end: 217.5, scene: 'write',
      caption: 'A write hit always updates the cache. The policy decides whether main memory is updated now or later.',
      detail: 'Reads are simple: find the block, or fetch it. Writes add a second question, because there are now two copies of the datum. Write-through keeps them identical at all times; write-back lets the cache copy run ahead and reconciles later. A separate question is what to do on a write miss: allocate the block in the cache, or write around it to memory.',
      keyword: 'now or later',
      trap: 'Write policy and write-miss policy are two independent choices. Write-back with no write-allocate, and write-through with write-allocate, are both real designs.',
      narration: 'A write hit always updates the cache. The policy decides whether main memory is updated now or later.'
    },
    {
      id: 'wr-2', start: 217.5, end: 225, scene: 'write',
      caption: 'Write-through writes memory on every store, so no dirty bit is needed and eviction moves no data.',
      detail: 'Because memory is updated immediately, the cached copy is never newer than memory, so the cache has nothing to write back. Eviction is a pure invalidation. The cost is that every store pays a memory write, which is why write-through designs often add a write buffer.',
      keyword: 'no dirty bit is needed',
      trap: 'A dirty bit in a write-through cache is not merely useless, it is never set. A statement that both policies keep a dirty bit is false, which is exactly the 2022 question.',
      narration: 'Write-through writes memory on every store, so no dirty bit is needed and eviction moves no data.'
    },
    {
      id: 'wr-3', start: 225, end: 232.5, scene: 'write',
      caption: 'Write-back writes only the cache and sets the dirty bit. The block goes to memory when it is evicted.',
      detail: 'A write hit modifies the line and marks it dirty. The line may be written many times for the price of one memory write, which is why write-back is the common choice for a lower-level cache. The catch is that eviction of a dirty line costs a memory write, and that cost is incurred even on a read miss, because the victim is chosen without regard to the reason for the miss.',
      keyword: 'when it is evicted',
      trap: 'Write-back does not mean memory is never written. It means the write is deferred to eviction, so the total number of memory writes depends on how often dirty lines are evicted.',
      narration: 'Write-back writes only the cache and sets the dirty bit. The block goes to memory when it is evicted.'
    },
    {
      id: 'wr-4', start: 232.5, end: 240, scene: 'write',
      caption: 'GATE 2022: the false statements are A, B and D. Only C, that evicting from a write-through cache moves no data, is true.',
      detail: 'A claims both caches keep a dirty bit, which is false for write-through. B claims every write hit in write-back transfers data to memory, which is false because the transfer is deferred. D claims a read miss in write-back can never evict a dirty block, which is false because the victim is chosen by LRU and may well be dirty. C is true. The page records the answer as A, B and D.',
      keyword: 'A, B and D',
      trap: 'The question asks which are FALSE, so a true statement left unmarked is correct behaviour. Marking all four, or marking only D, are the two common errors.',
      narration: 'GATE 2022: the false statements are A, B and D. Only C, that evicting from a write-through cache moves no data, is true.'
    },

    /* ---------------- scene 9: two levels and CPI ---------------- */
    {
      id: 'ml-1', start: 240, end: 247.5, scene: 'multilevel',
      caption: 'With two levels the outcomes are exclusive: L1 hit, or L1 miss with L2 hit, or both miss.',
      detail: 'A two-level hierarchy is not two independent bets. The probability of reaching L2 is the L1 miss rate, and the probability of reaching memory is the product of the two miss rates. The three outcomes partition the accesses, so their probabilities sum to one, which is the check that catches most arithmetic slips.',
      keyword: 'mutually exclusive outcomes',
      trap: 'Multiplying the two hit rates, or adding the two miss rates, both destroy the partition. The miss rates multiply, the hit rate of the lower level applies only to the survivors.',
      narration: 'With two levels the outcomes are exclusive: L1 hit, or L1 miss with L2 hit, or both miss.'
    },
    {
      id: 'ml-2', start: 247.5, end: 255, scene: 'multilevel',
      caption: 'GATE 2025 Set 1: 0.95 times 10 plus 0.0425 times 20 plus 0.0075 times 200, which is 11.85 ns.',
      detail: 'The paper gives L1 at 95 per cent and 10 ns, L2 at 85 per cent and 20 ns including the L1 miss penalty, and memory at 200 ns including both. So the three probabilities are 0.95, 0.05 times 0.85 which is 0.0425, and 0.05 times 0.15 which is 0.0075, and the times are used as given. The sum is 9.5 plus 0.85 plus 1.5, which is 11.85 ns.',
      keyword: '11.85 ns',
      trap: 'Adding the L1 time again inside the L2 and memory terms double counts it and gives 12.5. The paper says the lower times already include the penalty, so they are used directly.',
      narration: 'GATE 2025 Set 1: 0.95 times 10 plus 0.0425 times 20 plus 0.0075 times 200, which is 11.85 ns.'
    },
    {
      id: 'ml-3', start: 255, end: 262.5, scene: 'multilevel',
      caption: 'For the processor, stall cycles per instruction are the accesses per instruction times the miss rate times the miss penalty.',
      detail: 'A cache question becomes a processor question when the miss cost is charged to instructions. If every instruction fetches once, the instruction-cache term is the instruction miss rate times the penalty. Data accesses happen only on the fraction of instructions that are loads or stores, so the data term carries that fraction as well.',
      keyword: 'accesses per instruction',
      trap: 'Charging a data miss to every instruction instead of only to the memory instructions overstates the stalls by the reciprocal of that fraction, and is the single most common error in this question type.',
      narration: 'For the processor, stall cycles per instruction are the accesses per instruction times the miss rate times the miss penalty.'
    },
    {
      id: 'ml-4', start: 262.5, end: 270, scene: 'multilevel',
      caption: 'That is why cache questions end as CPI or speedup questions: the memory system changes the cycles, not the instruction count.',
      detail: 'Execution time is instruction count times cycles per instruction times the clock period. A cache changes only the middle factor, by adding stall cycles. So a perfect-cache speedup is the new CPI over the old CPI, and the instruction count cancels entirely. The page checks this on the 2024 Set 1 numbers and gets 3.00.',
      keyword: 'changes the cycles',
      trap: 'Do not compare miss rates and call the difference a speedup. Speedup is a ratio of times, and a miss rate enters a time only through the stall cycles it causes.',
      narration: 'That is why cache questions end as CPI or speedup questions: the memory system changes the cycles, not the instruction count.'
    },

    /* ---------------- scene 10: the recipe ---------------- */
    {
      id: 'rc-1', start: 270, end: 276, scene: 'recipe',
      caption: 'Step one: split the address into offset, index and tag, and check that the three widths add to the address width.',
      detail: 'Offset is log2 of the block size in bytes, index is log2 of the number of sets, and the tag is the remainder. The sum check is free and catches nearly every slip in this step.',
      keyword: 'split the address',
      trap: 'The block size may be given in words. Convert with the word length before taking any logarithm.',
      narration: 'Step one: split the address into offset, index and tag, and check that the three widths add to the address width.'
    },
    {
      id: 'rc-2', start: 276, end: 282, scene: 'recipe',
      caption: 'Step two: name the mapping, because it fixes the number of sets and therefore the index width.',
      detail: 'Direct mapped is one line per set, fully associative is one set, and set associative is anything between. Associativity is the number of lines per set, never the number of sets.',
      keyword: 'name the mapping',
      trap: 'A question that gives an associativity and a cache size gives you the number of sets for free. Use it before guessing any bit width.',
      narration: 'Step two: name the mapping, because it fixes the number of sets and therefore the index width.'
    },
    {
      id: 'rc-3', start: 282, end: 288, scene: 'recipe',
      caption: 'Step three: if a trace is given, count hits, misses and evictions, not addresses.',
      detail: 'Run the trace one access at a time, computing the set from the block number and then comparing tags inside that set. Update recency on a hit as well as on a miss. Mark the victim on every eviction.',
      keyword: 'count misses, not addresses',
      trap: 'A repeated address in the same block is a hit only if the block is still resident. A repeated block number is not automatically a hit.',
      narration: 'Step three: if a trace is given, count hits, misses and evictions, not addresses.'
    },
    {
      id: 'rc-4', start: 288, end: 294, scene: 'recipe',
      caption: 'Step four: use the access-time convention the paper used, and convert units once, at the end.',
      detail: 'Hit time plus miss rate times penalty, or weighted full miss times, or weighted per-level times: three conventions, chosen by the wording. Then convert nanoseconds to microseconds or cycles once, at the end, so no rounding compounds.',
      keyword: 'convert units once, at the end',
      trap: 'Rounding an intermediate value and then multiplying by a large instruction count turns a small slip into a wrong answer that is not near any option.',
      narration: 'Step four: use the access-time convention the paper used, and convert units once, at the end.'
    },
    {
      id: 'rc-5', start: 294, end: 300, scene: 'recipe',
      caption: 'Step five: for a speedup, divide times, never miss rates. And carry the clock if the question changed it.',
      detail: 'Speedup is old time over new time. If the cycle count and the clock period both change, both factors belong in the ratio. A cache usually leaves the clock alone, which is why the instruction count cancels and the CPI ratio is enough.',
      keyword: 'divide times, never miss rates',
      trap: 'A miss rate falling from 20 per cent to 10 per cent is not a twofold speedup: the stall cycles halve, and the speedup depends on how large they were relative to the base CPI.',
      narration: 'Step five: for a speedup, divide times, never miss rates. And carry the clock if the question changed it.'
    }
  ]
};
