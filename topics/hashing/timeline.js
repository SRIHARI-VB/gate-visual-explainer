/* ==========================================================================
   hashing - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'direct',
      n: 1,
      title: 'From direct addressing to a hash table',
      start: 0, end: 30,
      objective: 'See the ideal — store the key at its own index — and see exactly which assumption it makes that a real key set breaks.'
    },
    {
      id: 'function',
      n: 2,
      title: 'A hash function maps a big key to a small slot',
      start: 30, end: 60,
      objective: 'Read h(k) as arithmetic, apply the division and multiplication methods, and see why the choice of m decides whether the low bits are used.'
    },
    {
      id: 'universal',
      n: 3,
      title: 'An adversary defeats any fixed function',
      start: 60, end: 90,
      objective: 'Understand why a published deterministic hash function is not safe against a hostile key set, and what universal hashing buys instead.'
    },
    {
      id: 'chaining',
      n: 4,
      title: 'Chaining: a list at every slot',
      start: 90, end: 120,
      objective: 'Trace chaining, define the load factor, and get both search costs — unsuccessful 1 plus alpha, successful 1 plus alpha over 2.'
    },
    {
      id: 'openaddr',
      n: 5,
      title: 'Open addressing: the keys live in the table',
      start: 120, end: 150,
      objective: 'Trace linear probing on a real key list, and see that a probe sequence is a walk, not a second hash.'
    },
    {
      id: 'clustering',
      n: 6,
      title: 'Linear probing builds clusters',
      start: 150, end: 180,
      objective: 'See a run of occupied slots absorb every new key that hashes into it, and see the quadratic blow-up in the unsuccessful-search cost.'
    },
    {
      id: 'variants',
      n: 7,
      title: 'Quadratic probing and double hashing',
      start: 180, end: 210,
      objective: 'Apply both probe rules, and know the exact condition each one needs before it is allowed to promise a free slot.'
    },
    {
      id: 'deletion',
      n: 8,
      title: 'Deletion, and the tombstone',
      start: 210, end: 235,
      objective: 'See a present key become unreachable because a slot was marked empty, and understand what a tombstone does and what it costs.'
    },
    {
      id: 'expectation',
      n: 9,
      title: 'What the costs actually are',
      start: 235, end: 270,
      objective: 'Put the four expected-probe formulas side by side at four load factors, and see why "hashing is O of 1" is a statement about an average.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The decision procedure',
      start: 270, end: 300,
      objective: 'Four questions that turn any GATE hashing item into a mechanical trace or a one-line substitution.'
    }
  ],

  events: [
    /* ---------- scene 1: direct addressing ---------- */
    {
      id: 'direct-1', start: 0, end: 7.5, scene: 'direct',
      caption: 'A direct-address table stores the key itself at index k. One array access, no search at all.',
      detail: 'If the keys are the integers 0 to m minus 1, the table slot with that index is the record. Insert, search and delete are each a single array access, so all three are Theta of 1 in the worst case. This is the ideal every hash table is trying to imitate.',
      keyword: 'stores the key itself at index k',
      trap: 'Direct addressing is not hashing. It assumes the key is already a small index, and that assumption is the one a real key set breaks.',
      narration: 'A direct-address table stores the key itself at index k. One array access, no search at all.'
    },
    {
      id: 'direct-2', start: 7.5, end: 15, scene: 'direct',
      caption: 'It works only when the universe of keys is small enough to be an array index.',
      detail: 'The universe is the set every possible key comes from: all 32-bit integers, all 10-character strings, all valid PAN numbers. The table must have one slot per possible key, so its size is the size of the universe, not the number of keys you actually hold.',
      keyword: 'the universe of keys',
      trap: 'The cost of a table is its number of slots, not its number of occupied slots. A direct-address table for 32-bit keys is 4 billion slots whether you store three keys or three million.',
      narration: 'It works only when the universe of keys is small enough to be an array index.'
    },
    {
      id: 'direct-3', start: 15, end: 22.5, scene: 'direct',
      caption: 'So we keep m slots and compute a slot from the key: h maps a big key to a small number.',
      detail: 'The table has m slots. The number of keys actually stored is n. A hash function h takes a key from the universe and returns an integer in the range 0 to m minus 1. The table is sized for n, not for the universe.',
      keyword: 'compute a slot from the key',
      trap: 'n and m are different quantities and every formula in this lesson uses them differently. Reading m where the question wrote n is the commonest arithmetic slip in this topic.',
      narration: 'So we keep m slots and compute a slot from the key: h maps a big key to a small number.'
    },
    {
      id: 'direct-4', start: 22.5, end: 30, scene: 'direct',
      caption: 'Two keys can land on one slot. That is a collision, and it is not a mistake in the function.',
      detail: 'With m slots and more than m possible keys, two distinct keys must share a slot: that is the pigeonhole principle, and it holds for every function, however clever. The design question is therefore never how to avoid collisions but how to resolve them, and how to keep them evenly spread.',
      keyword: 'That is a collision',
      trap: 'A question that asks for a hash function with no collisions is unanswerable when the key set is larger than the table. The answer to look for is a resolution scheme.',
      narration: 'Two keys can land on one slot. That is a collision, and it is not a mistake in the function.'
    },

    /* ---------- scene 2: the hash function ---------- */
    {
      id: 'function-1', start: 30, end: 37.5, scene: 'function',
      caption: 'Division method: h of k is k modulo m. Fast, and good when m is prime.',
      detail: 'The division method takes the remainder on division by m. It costs one division, which is cheap on modern hardware. Its quality depends entirely on m: if m has small factors, keys sharing those factors share slots.',
      keyword: 'k modulo m',
      trap: 'The modulus is the table size, so choosing m is choosing part of the hash function. A question that fixes m has already fixed half the answer.',
      narration: 'Division method: h of k is k modulo m. Fast, and good when m is prime.'
    },
    {
      id: 'function-2', start: 37.5, end: 45, scene: 'function',
      caption: 'Take m a power of two and the function reads only the low bits of the key. A prime m mixes all of them.',
      detail: 'If m is 2 to the p, then k modulo m is exactly the p least significant bits of k. Any structure that lives in the high bits — a year, a batch number, a common prefix — is invisible, so all keys sharing a low-bit pattern collide. Choosing m prime, and not close to a power of two, avoids the trap. GATE CSE 2015 Set 2 tested this directly by asking which of four functions spreads 0 to 2020 most uniformly over ten buckets: the answer was i cubed modulo 10.',
      keyword: 'only the low bits',
      trap: 'Even numbers of buckets plus keys that are all even is a deliberate collision generator. This is why the standard advice is a prime m.',
      narration: 'Take m a power of two and the function reads only the low bits of the key. A prime m mixes all of them.'
    },
    {
      id: 'function-3', start: 45, end: 52.5, scene: 'function',
      caption: 'Multiplication method: multiply by a constant, keep the fractional part, scale to m.',
      detail: 'Write the key times a constant A strictly between 0 and 1, take only the fractional part, and multiply by m. The recommended constant is the golden-ratio conjugate, about 0.618034. The advantage is that the value of m matters much less: the method works even when m is a power of two, because the mixing happens before the scaling.',
      keyword: 'keep the fractional part',
      trap: 'The multiplication method is floor of m times the fractional part. Dropping the floor, or keeping the integer part instead, gives a number outside the table.',
      narration: 'Multiplication method: multiply by a constant, keep the fractional part, scale to m.'
    },
    {
      id: 'function-4', start: 52.5, end: 60, scene: 'function',
      caption: 'What a hash function owes you: it must be fast, and it must spread any key set you actually meet.',
      detail: 'Two requirements only. Fast, because every operation pays for it. Spreading, because the whole cost analysis assumes keys are equally likely in every slot. The formal version of the second requirement is the simple uniform hashing assumption: each key is equally likely to hash into any of the m slots, independently of the others.',
      keyword: 'fast, and it must spread',
      trap: 'Uniformity is an assumption about the key set, not a property you can prove about a function by looking at it. Every Theta of 1 claim in this lesson is conditional on it.',
      narration: 'What a hash function owes you: it must be fast, and it must spread any key set you actually meet.'
    },

    /* ---------- scene 3: universal hashing ---------- */
    {
      id: 'universal-1', start: 60, end: 67.5, scene: 'universal',
      caption: 'Fix one published hash function and an adversary can choose keys that all collide.',
      detail: 'The adversary knows the function, because it is in the code. It can compute, offline, any number of keys that share one slot, then submit them. Every one of those keys is then a linear list walk. This is the reasoning behind GATE CSE 2023, which asked for the best strategy against a malicious key generator given more keys than slots: the keyed answer was universal hashing.',
      keyword: 'an adversary can choose keys',
      trap: 'This is a worst-case argument, and it is why hashing has no worst-case Theta of 1 guarantee. A deterministic function cannot fix it; only a randomised choice at run time can.',
      narration: 'Fix one published hash function and an adversary can choose keys that all collide.'
    },
    {
      id: 'universal-2', start: 67.5, end: 75, scene: 'universal',
      caption: 'Universal hashing picks the function at random from a family, after the adversary has committed.',
      detail: 'Take a prime p larger than every key, pick a from 1 to p minus 1 and b from 0 to p minus 1 uniformly at random, and define h of k as a times k plus b, modulo p, then modulo m. The family is the set of all such pairs. The adversary must choose keys without knowing which member you drew.',
      keyword: 'picks the function at random',
      trap: 'The randomness is in the choice of function, not in the keys. A scheme that randomises the key but uses one fixed function is not universal.',
      narration: 'Universal hashing picks the function at random from a family, after the adversary has committed.'
    },
    {
      id: 'universal-3', start: 75, end: 82.5, scene: 'universal',
      caption: 'The guarantee: for any two distinct keys, at most one in m functions of the family makes them collide.',
      detail: 'That bound is what makes the expected chain length n over m no matter which keys the adversary chose. The page checks this exhaustively on a small prime: for every pair of distinct keys, it counts how many pairs a, b in the family collide on that pair, and confirms the count never exceeds the family size divided by m.',
      keyword: 'at most one in m functions',
      trap: 'Universal hashing does not make collisions impossible. It makes them unpredictable, so no fixed key set can be bad on purpose.',
      narration: 'The guarantee: for any two distinct keys, at most one in m functions of the family makes them collide.'
    },
    {
      id: 'universal-4', start: 82.5, end: 90, scene: 'universal',
      caption: 'So the expected number of keys in a slot is n over m, whatever the key set. That is the load factor.',
      detail: 'GATE CSE 2022 asked exactly this with two functions, one for odd keys and one for even keys, and the answer was still n over m: splitting the keys into two groups each uniformly hashed gives each group an expected n over 2 m per slot, and the two groups add. The result depends on uniformity, not on how many functions you use.',
      keyword: 'n over m, whatever the key set',
      trap: 'The answer is not n over 2 m. Each slot receives keys from both groups, and the two expected values add.',
      narration: 'So the expected number of keys in a slot is n over m, whatever the key set. That is the load factor.'
    },

    /* ---------- scene 4: chaining ---------- */
    {
      id: 'chaining-1', start: 90, end: 97.5, scene: 'chaining',
      caption: 'Chaining puts a linked list at every slot. A colliding key is appended to the list.',
      detail: 'The table holds m pointers, and each pointer heads a list of the keys that hashed there. Insertion is at the head, so it is Theta of 1: compute the slot, link the new node. Nothing ever has to move because a slot is taken.',
      keyword: 'a linked list at every slot',
      trap: 'Chaining stores n nodes plus m pointers. Open addressing stores exactly m cells and no pointers. Space is a real distinction, not a detail.',
      narration: 'Chaining puts a linked list at every slot. A colliding key is appended to the list.'
    },
    {
      id: 'chaining-2', start: 97.5, end: 105, scene: 'chaining',
      caption: 'The load factor alpha is n over m, the average number of keys per slot. With chaining it can exceed 1.',
      detail: 'GATE CSE 2015 Set 3 asked for the load factor of a table with 25 slots storing 2000 elements: 2000 over 25, which is 80. The load factor is a ratio, not a percentage and not a count, and nothing in the definition forbids it from being larger than 1.',
      keyword: 'alpha is n over m',
      trap: 'A load factor of 80 is not an error and not a percentage. Reporting 0.8, or 80 percent, is the mistake this item exists to catch.',
      narration: 'The load factor alpha is n over m, the average number of keys per slot. With chaining it can exceed 1.'
    },
    {
      id: 'chaining-3', start: 105, end: 112.5, scene: 'chaining',
      caption: 'Under uniform hashing an unsuccessful search scans 1 plus alpha nodes; a successful one scans 1 plus alpha over 2.',
      detail: 'An unsuccessful search must walk the whole list it lands on, and the expected list length is alpha, so the cost is 1 plus alpha. A successful search walks only as far as its own key; on average that is half the list, giving 1 plus alpha over 2. Both are Theta of 1 plus alpha, so both are Theta of 1 when n is proportional to m.',
      keyword: '1 plus alpha',
      trap: 'The two costs are different formulas. An item that says search without saying which will key the successful value.',
      narration: 'Under uniform hashing an unsuccessful search scans 1 plus alpha nodes; a successful one scans 1 plus alpha over 2.'
    },
    {
      id: 'chaining-4', start: 112.5, end: 120, scene: 'chaining',
      caption: 'GATE CSE 2014 Set 1: nine keys into nine slots by chaining gives maximum 3, minimum 0, average 1.',
      detail: 'The keys 5, 28, 19, 15, 20, 33, 12, 17, 10 modulo 9 land in slots 5, 1, 1, 6, 2, 6, 3, 8, 1. Slot 1 holds three keys, slot 6 holds two, four slots hold one each, and three slots are empty. The maximum is 3, the minimum is 0 because empty slots count, and the average is nine keys over nine slots, which is 1.',
      keyword: 'maximum 3, minimum 0, average 1',
      trap: 'The minimum is 0 only because the table has empty slots. If every slot were occupied the minimum would be 1, and the average is n over m whatever the arrangement.',
      narration: 'GATE CSE 2014 Set 1: nine keys into nine slots by chaining gives maximum 3, minimum 0, average 1.'
    },

    /* ---------- scene 5: open addressing ---------- */
    {
      id: 'openaddr-1', start: 120, end: 127.5, scene: 'openaddr',
      caption: 'Open addressing stores the keys themselves in the m slots. No lists, no pointers, no extra memory.',
      detail: 'Also called closed hashing, which is a naming trap worth fixing now: open addressing is closed hashing, and chaining is open hashing. The words are reversed from what intuition suggests. Every key occupies exactly one cell of the table.',
      keyword: 'stores the keys themselves',
      trap: 'Open addressing equals closed hashing; chaining equals open hashing. A question that says closed hashing is asking about probing, not about lists.',
      narration: 'Open addressing stores the keys themselves in the m slots. No lists, no pointers, no extra memory.'
    },
    {
      id: 'openaddr-2', start: 127.5, end: 135, scene: 'openaddr',
      caption: 'A collision starts a probe sequence: a fixed walk through the table until a free slot is found.',
      detail: 'The probe function takes the key and a probe number i and returns a slot. Linear probing adds i to the home slot; quadratic probing adds a quadratic function of i; double hashing adds i times a second hash. The walk must be a permutation of the slots, or a key may be reported absent while a free slot exists.',
      keyword: 'a fixed walk through the table',
      trap: 'Since every key occupies a slot, the table can never hold more than m keys. Open addressing requires alpha strictly less than 1, so a full table has no answer at all.',
      narration: 'A collision starts a probe sequence: a fixed walk through the table until a free slot is found.'
    },
    {
      id: 'openaddr-3', start: 135, end: 142.5, scene: 'openaddr',
      caption: 'Linear probing with h of x equals x plus 7 modulo 11: each collision moves one slot right, wrapping at the end.',
      detail: 'The insertion order is 1, 13, 22, 15, 11, 24. The first four keys land in slots 8, 9, 7 and 0 with no collision. Key 11 hashes to 7, which is taken, so it walks 7 to 8 to 9 to 10 and stops. Key 24 hashes to 9, taken, so it walks 9 to 10, taken, then wraps to 0, taken, then 1, which is free.',
      keyword: 'moves one slot right, wrapping',
      trap: 'The walk wraps modulo m. Forgetting the wrap is the single most common error in a linear-probing trace, and it changes the final table.',
      narration: 'Linear probing with h of x equals x plus 7 modulo 11: each collision moves one slot right, wrapping at the end.'
    },
    {
      id: 'openaddr-4', start: 142.5, end: 150, scene: 'openaddr',
      caption: 'The result: slots 0, 1, 7, 8, 9, 10 hold keys, and 2, 3, 4, 5, 6 are empty.',
      detail: 'GATE CSE 2026 Set 1 asked which of the positions 0, 10, 2 and 1 are empty after these insertions, and only slot 2 was. Note what makes this item fair: the keys and the order are given, so the answer is a trace and not an estimate. The page recomputes the whole table and checks it against this list.',
      keyword: 'and 2, 3, 4, 5, 6 are empty',
      trap: 'A question can ask which position is empty without asking for the whole table. Trace the whole table anyway; the partial question is easier to answer from the full picture.',
      narration: 'The result: slots 0, 1, 7, 8, 9, 10 hold keys, and 2, 3, 4, 5, 6 are empty.'
    },

    /* ---------- scene 6: clustering ---------- */
    {
      id: 'clustering-1', start: 150, end: 157.5, scene: 'clustering',
      caption: 'Every key that hashes into a run walks to the far end of it, and lengthens the run by one.',
      detail: 'A contiguous block of occupied slots is a cluster. A key whose home slot is anywhere inside the cluster must traverse the rest of it, so the whole cluster behaves as one oversized slot. Clusters also merge: two runs separated by one empty cell become one run as soon as that cell is filled. This self-reinforcing behaviour is primary clustering.',
      keyword: 'walks to the far end of it',
      trap: 'The failure is not that collisions happen. It is that collisions make further collisions more likely, which breaks the uniform hashing assumption the cost formulas rest on.',
      narration: 'Every key that hashes into a run walks to the far end of it, and lengthens the run by one.'
    },
    {
      id: 'clustering-2', start: 157.5, end: 165, scene: 'clustering',
      caption: 'Knuth\'s result: an unsuccessful search under linear probing averages half of 1 plus 1 over the square of 1 minus alpha.',
      detail: 'The square is the signature of clustering. At alpha equal to one half the formula gives 2.5 probes, and a uniform-hashing scheme would give 2. At alpha equal to 0.9 it gives 50.5 probes, against 10 for double hashing. The curve is not just higher; it turns upward far earlier.',
      keyword: 'the square of 1 minus alpha',
      trap: 'The squared denominator means linear probing is fine below about alpha equal to 0.5 and unusable near 1. Quoting the uniform-hashing formula for a linear-probing table is the error this scene exists to prevent.',
      narration: 'Knuth\'s result: an unsuccessful search under linear probing averages half of 1 plus 1 over the square of 1 minus alpha.'
    },
    {
      id: 'clustering-3', start: 165, end: 172.5, scene: 'clustering',
      caption: 'The same four load factors, measured on the page: linear probing is the worst of the three, and the gap widens.',
      detail: 'The page builds random tables at each load factor for linear probing, double hashing and chaining, measures the average unsuccessful probe count, and reports it beside the formula. Linear probing is worst at every load factor, and the ratio between linear probing and double hashing grows as alpha grows.',
      keyword: 'linear probing is the worst',
      trap: 'Linear probing is still the fastest in practice at low load factors, because consecutive slots share a cache line. The comparison is about probes, not about nanoseconds.',
      narration: 'The same four load factors, measured on the page: linear probing is the worst of the three, and the gap widens.'
    },
    {
      id: 'clustering-4', start: 172.5, end: 180, scene: 'clustering',
      caption: 'A successful search is cheaper, because it can stop at its own key. Linear probing: half of 1 plus 1 over 1 minus alpha.',
      detail: 'The successful formula has no square, for the same reason chaining\'s does not: the walk stops at the key rather than running to the end. At alpha equal to 0.9 that is 5.5 probes instead of 50.5. Both formulas are measurements of an average under uniform hashing, and neither is a worst case.',
      keyword: 'it can stop at its own key',
      trap: 'The successful and unsuccessful costs differ by more than a constant. A question that does not say which search it means has two defensible answers, so read the stem for the word unsuccessful or absent.',
      narration: 'A successful search is cheaper, because it can stop at its own key. Linear probing: half of 1 plus 1 over 1 minus alpha.'
    },

    /* ---------- scene 7: quadratic and double hashing ---------- */
    {
      id: 'variants-1', start: 180, end: 187.5, scene: 'variants',
      caption: 'Quadratic probing adds a square: the i-th probe is the home slot plus c1 i plus c2 i squared, modulo m.',
      detail: 'The step size grows with i, so a key does not trail through a cluster one cell at a time. That removes primary clustering, because two keys with the same home slot take different walks. It does not remove secondary clustering: two keys with the same home slot still follow the same walk, just a scattered one.',
      keyword: 'adds a square',
      trap: 'Quadratic probing does not guarantee a free slot in general. A table with alpha below 1 can still reject an insertion, because the walk may revisit slots and never reach the empty one.',
      narration: 'Quadratic probing adds a square: the i-th probe is the home slot plus c1 i plus c2 i squared, modulo m.'
    },
    {
      id: 'variants-2', start: 187.5, end: 195, scene: 'variants',
      caption: 'With m a power of two the walk can miss half the table. With m prime and alpha at most one half, it is guaranteed to find a slot.',
      detail: 'Take m equal to 8 with c1 equal to c2 equal to one half. The offsets for i equal 0 to 7 are 0, 1, 3, 6, 10, 15, 21, 28, which modulo 8 are 0, 1, 3, 6, 2, 7, 5, 4: that happens to cover all eight, but only because i ran to m minus 1. For i beyond that the offsets repeat modulo 8, and the standard theorem guarantees only that the first m over 2 offsets are distinct when m is prime. The page checks the offsets and reports the reachable set for each m it tests.',
      keyword: 'can miss half the table',
      trap: 'This is the one place where the table size silently decides correctness. A quadratic-probing trace on a non-prime m can be unanswerable, and the honest answer may be that the key cannot be inserted.',
      narration: 'With m a power of two the walk can miss half the table. With m prime and alpha at most one half, it is guaranteed to find a slot.'
    },
    {
      id: 'variants-3', start: 195, end: 202.5, scene: 'variants',
      caption: 'Double hashing steps by a second hash: probe i is h1 plus i times h2, modulo m.',
      detail: 'Because the step depends on the key, two keys with the same home slot still separate immediately, so double hashing removes secondary clustering as well as primary. Its expected cost is the uniform-hashing bound: 1 over 1 minus alpha unsuccessful, and minus 1 over alpha times the log of 1 minus alpha successful. That is as good as probing gets.',
      keyword: 'steps by a second hash',
      trap: 'The step must be coprime with m, or the walk visits only m over the gcd slots. If m is prime, the only bad step is a multiple of m; if m is not prime, an even step in an even table is the classic failure.',
      narration: 'Double hashing steps by a second hash: probe i is h1 plus i times h2, modulo m.'
    },
    {
      id: 'variants-4', start: 202.5, end: 210, scene: 'variants',
      caption: 'Two traces: key 90 gives probe 1 equal to 13 in 2020, and key 24 lands in slot 10 in 2025 Set 1.',
      detail: 'For 2020, h1 of 90 is 90 modulo 23, which is 21, and h2 of 90 is 1 plus 90 modulo 19, which is 15, so probe 1 is 21 plus 15, modulo 23, which is 13. For 2025 Set 1 the six keys are inserted in order and 24 collides twice before finding slot 10 free. The page runs both traces and checks the answers.',
      keyword: 'probe 1 equal to 13',
      trap: 'Probe numbering starts at 0 in both of these questions, and they say so. Reading probe 1 as the first probe gives 21 in the 2020 item, which is the commonest wrong answer.',
      narration: 'Two traces: key 90 gives probe 1 equal to 13 in 2020, and key 24 lands in slot 10 in 2025 Set 1.'
    },

    /* ---------- scene 8: deletion ---------- */
    {
      id: 'deletion-1', start: 210, end: 216, scene: 'deletion',
      caption: 'Delete a key by marking its slot empty, and every key that walked past it becomes unreachable.',
      detail: 'Search stops at the first empty slot, because that is the only signal that the key is not there. A slot emptied in the middle of a probe walk therefore ends the walk early, and a key that lies beyond it is reported absent even though it is present.',
      keyword: 'every key that walked past it',
      trap: 'This is a correctness bug, not a performance problem, and it is invisible until a particular key is searched. A test suite that only inserts will never catch it.',
      narration: 'Delete a key by marking its slot empty, and every key that walked past it becomes unreachable.'
    },
    {
      id: 'deletion-2', start: 216, end: 222.5, scene: 'deletion',
      caption: 'The fix is a tombstone: mark the slot deleted, which search treats as occupied and insert treats as free.',
      detail: 'A tombstone is a third state. Search walks over it and continues. Insert may reuse it. Nothing else changes, and every key that walked past the deleted one stays reachable. The page builds a small table, deletes a middle key, and demonstrates that the naive deletion loses a key while the tombstone does not.',
      keyword: 'a tombstone',
      trap: 'A tombstone is not the same as an empty slot, and it is not the same as an occupied slot. Any trace question that mentions a deletion is testing whether you kept all three states distinct.',
      narration: 'The fix is a tombstone: mark the slot deleted, which search treats as occupied and insert treats as free.'
    },
    {
      id: 'deletion-3', start: 222.5, end: 228, scene: 'deletion',
      caption: 'Tombstones accumulate: a table of tombstones has no free slot yet no keys, so the table must be rebuilt.',
      detail: 'Insert may reuse a tombstone, so the count of usable slots is the count of empty plus deleted, and that is what governs whether an insertion can succeed. A table full of tombstones reports every unsuccessful search at the full walk length. The standard remedy is to rehash the live keys into a fresh table when the tombstone count passes a threshold.',
      keyword: 'no free slot yet no keys',
      trap: 'The load factor that matters for an insertion is keys plus tombstones over m, not keys over m. Using the smaller number understates the cost badly after many deletions.',
      narration: 'Tombstones accumulate: a table of tombstones has no free slot yet no keys, so the table must be rebuilt.'
    },
    {
      id: 'deletion-4', start: 228, end: 235, scene: 'deletion',
      caption: 'Chaining has no such problem: given the pointer, unlinking is O of 1. That is why GATE CSE 1996 chose deletion as its advantage.',
      detail: 'In a chained table the list at a slot is independent of every other slot, so removing a node cannot affect any other key\'s search. GATE CSE 1996 asked for the advantage of a chained table over open addressing and the keyed answer was ease of deletion. Note that it is not worst-case search time, which is worse for chaining.',
      keyword: 'unlinking is O of 1',
      trap: 'The 1996 options included better worst-case search time, which is false, and less space, which is also false. Deletion is the only genuine advantage listed.',
      narration: 'Chaining has no such problem: given the pointer, unlinking is O of 1. That is why GATE CSE 1996 chose deletion as its advantage.'
    },

    /* ---------- scene 9: expected costs ---------- */
    {
      id: 'expectation-1', start: 235, end: 243, scene: 'expectation',
      caption: 'Four formulas, one assumption. Every one of them is an average under uniform hashing.',
      detail: 'Chaining unsuccessful is 1 plus alpha, successful 1 plus alpha over 2. Double hashing unsuccessful is 1 over 1 minus alpha, successful is minus 1 over alpha times the log of 1 minus alpha. Linear probing unsuccessful is half of 1 plus 1 over the square of 1 minus alpha. None of these is a worst case, and none applies when the key set is chosen adversarially.',
      keyword: 'an average under uniform hashing',
      trap: 'A question that gives you a table and a key list and asks for the number of probes wants a count, not a formula. The formula answers a different question about a random table.',
      narration: 'Four formulas, one assumption. Every one of them is an average under uniform hashing.'
    },
    {
      id: 'expectation-2', start: 243, end: 251, scene: 'expectation',
      caption: 'At alpha equal to 0.5 the three schemes are close; at 0.9 they are not. Linear probing pays 50 probes against 10.',
      detail: 'The page prints the four formulas at alpha equal to 0.5, 0.75, 0.9 and 0.99 and measures each scheme on random tables at those load factors. At 0.99 the linear-probing average passes 5000 probes while double hashing stays near 100, which is why production hash tables rehash before they reach it.',
      keyword: 'at 0.9 they are not',
      trap: 'The formulas blow up as alpha approaches 1. An item that asks for the cost at alpha equal to 1 has no finite answer, and the honest response is that the table is full.',
      narration: 'At alpha equal to 0.5 the three schemes are close; at 0.9 they are not. Linear probing pays 50 probes against 10.'
    },
    {
      id: 'expectation-3', start: 251, end: 259, scene: 'expectation',
      caption: 'Successful search is cheaper than unsuccessful in every scheme. The gap is not a constant.',
      detail: 'A successful search stops at its key; an unsuccessful one runs to the end of the probe walk. At alpha equal to 0.9 that is 5.5 against 50.5 for linear probing, and 2.56 against 10 for double hashing. For chaining the two are 1.45 and 1.9, which is a much smaller gap because a chain is short either way.',
      keyword: 'cheaper than unsuccessful in every scheme',
      trap: 'The two numbers are easy to swap. Read whether the question says the key is present before choosing a formula.',
      narration: 'Successful search is cheaper than unsuccessful in every scheme. The gap is not a constant.'
    },
    {
      id: 'expectation-4', start: 259, end: 270, scene: 'expectation',
      caption: 'So hashing is O of 1 on average, and Theta of n in the worst case. Both statements are true, of different things.',
      detail: 'The worst case is a real case: every key in one slot, either because the function is bad or because the key set was chosen to be bad. The average is real too, and it is what makes hash tables the default dictionary. A GATE item that asks for the worst case of a hash-table search wants the linear answer; one that asks for the expected cost wants the formula.',
      keyword: 'on average, and Theta of n in the worst case',
      trap: 'Quoting O of 1 as a worst-case bound is the single most common hashing misconception. It is an average, and it is conditional on the uniformity assumption.',
      narration: 'So hashing is O of 1 on average, and Theta of n in the worst case. Both statements are true, of different things.'
    },

    /* ---------- scene 10: decision procedure ---------- */
    {
      id: 'decide-1', start: 270, end: 277.5, scene: 'decide',
      caption: 'First: which scheme? Chaining has lists; linear, quadratic and double are all open addressing.',
      detail: 'Read the words the stem uses. Chaining, lists, or buckets with several keys means lists. Open addressing, closed hashing, or a probe function means probing. Then the probe rule: add i is linear, add a quadratic in i is quadratic, add i times a second hash is double hashing.',
      keyword: 'which scheme',
      trap: 'Closed hashing means open addressing. A stem that says closed hashing and a student who reads it as chaining will answer a different question correctly.',
      narration: 'First: which scheme? Chaining has lists; linear, quadratic and double are all open addressing.'
    },
    {
      id: 'decide-2', start: 277.5, end: 285, scene: 'decide',
      caption: 'Second: is the answer a count or an estimate? Given keys and an order, trace. Given only n, m and alpha, use a formula.',
      detail: 'A trace means writing the table out, slot by slot, key by key, with the probe walk for each collision. An estimate means substituting alpha equal to n over m into one of the four formulas. These are different questions, and most hashing items are traces.',
      keyword: 'a count or an estimate',
      trap: 'Applying a formula to a specific key list gives a number that is not the number of probes. The trace and the formula will disagree, and the trace is the answer.',
      narration: 'Second: is the answer a count or an estimate? Given keys and an order, trace. Given only n, m and alpha, use a formula.'
    },
    {
      id: 'decide-3', start: 285, end: 292.5, scene: 'decide',
      caption: 'Third: does the stem name a probe number? Then substitute i, and remember probe 0 is the first probe.',
      detail: 'A double-hashing item that asks for probe 1 wants i equal to 1, which is the second address visited. Write the general formula out, substitute the two hash values, reduce modulo m once at the end, and check the result is in range.',
      keyword: 'does the stem name a probe number',
      trap: 'Probe 0 is the home slot. Answering probe 1 with the home slot, or with i equal to 2, are the two standard wrong answers.',
      narration: 'Third: does the stem name a probe number? Then substitute i, and remember probe 0 is the first probe.'
    },
    {
      id: 'decide-4', start: 292.5, end: 300, scene: 'decide',
      caption: 'Fourth: is the question about a search that succeeds, or one that fails? The formulas differ, and so do the traces.',
      detail: 'An unsuccessful search runs to the end of the probe walk, so it counts every occupied slot on the way, plus the empty one that stops it. A successful search stops at its key. Before counting, decide which one the stem describes, and if it says neither, the safe reading is unsuccessful because that is the bound usually being discussed.',
      keyword: 'succeeds, or one that fails',
      trap: 'Counting the stopping empty slot is part of an unsuccessful probe count in most textbooks. State which convention you used, because the two conventions differ by one.',
      narration: 'Fourth: is the question about a search that succeeds, or one that fails? The formulas differ, and so do the traces.'
    }
  ]
};
