# Hashing: Hash Functions and Collision Resolution — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/hashing/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. From direct addressing to a hash table

*0:00 – 0:30 · objective: See the ideal — store the key at its own index — and see exactly which assumption it makes that a real key set breaks.*

**0:00–0:07** — A direct-address table stores the key itself at index k. One array access, no search at all.

> Caption: A direct-address table stores the key itself at index k. One array access, no search at all.

Exam-trap caption mode adds: *Direct addressing is not hashing. It assumes the key is already a small index, and that assumption is the one a real key set breaks.*

**0:07–0:15** — It works only when the universe of keys is small enough to be an array index.

> Caption: It works only when the universe of keys is small enough to be an array index.

Exam-trap caption mode adds: *The cost of a table is its number of slots, not its number of occupied slots. A direct-address table for 32-bit keys is 4 billion slots whether you store three keys or three million.*

**0:15–0:22** — So we keep m slots and compute a slot from the key: h maps a big key to a small number.

> Caption: So we keep m slots and compute a slot from the key: h maps a big key to a small number.

Exam-trap caption mode adds: *n and m are different quantities and every formula in this lesson uses them differently. Reading m where the question wrote n is the commonest arithmetic slip in this topic.*

**0:22–0:30** — Two keys can land on one slot. That is a collision, and it is not a mistake in the function.

> Caption: Two keys can land on one slot. That is a collision, and it is not a mistake in the function.

Exam-trap caption mode adds: *A question that asks for a hash function with no collisions is unanswerable when the key set is larger than the table. The answer to look for is a resolution scheme.*

## Scene 2. A hash function maps a big key to a small slot

*0:30 – 1:00 · objective: Read h(k) as arithmetic, apply the division and multiplication methods, and see why the choice of m decides whether the low bits are used.*

**0:30–0:37** — Division method: h of k is k modulo m. Fast, and good when m is prime.

> Caption: Division method: h of k is k modulo m. Fast, and good when m is prime.

Exam-trap caption mode adds: *The modulus is the table size, so choosing m is choosing part of the hash function. A question that fixes m has already fixed half the answer.*

**0:37–0:45** — Take m a power of two and the function reads only the low bits of the key. A prime m mixes all of them.

> Caption: Take m a power of two and the function reads only the low bits of the key. A prime m mixes all of them.

Exam-trap caption mode adds: *Even numbers of buckets plus keys that are all even is a deliberate collision generator. This is why the standard advice is a prime m.*

**0:45–0:52** — Multiplication method: multiply by a constant, keep the fractional part, scale to m.

> Caption: Multiplication method: multiply by a constant, keep the fractional part, scale to m.

Exam-trap caption mode adds: *The multiplication method is floor of m times the fractional part. Dropping the floor, or keeping the integer part instead, gives a number outside the table.*

**0:52–1:00** — What a hash function owes you: it must be fast, and it must spread any key set you actually meet.

> Caption: What a hash function owes you: it must be fast, and it must spread any key set you actually meet.

Exam-trap caption mode adds: *Uniformity is an assumption about the key set, not a property you can prove about a function by looking at it. Every Theta of 1 claim in this lesson is conditional on it.*

## Scene 3. An adversary defeats any fixed function

*1:00 – 1:30 · objective: Understand why a published deterministic hash function is not safe against a hostile key set, and what universal hashing buys instead.*

**1:00–1:07** — Fix one published hash function and an adversary can choose keys that all collide.

> Caption: Fix one published hash function and an adversary can choose keys that all collide.

Exam-trap caption mode adds: *This is a worst-case argument, and it is why hashing has no worst-case Theta of 1 guarantee. A deterministic function cannot fix it; only a randomised choice at run time can.*

**1:07–1:15** — Universal hashing picks the function at random from a family, after the adversary has committed.

> Caption: Universal hashing picks the function at random from a family, after the adversary has committed.

Exam-trap caption mode adds: *The randomness is in the choice of function, not in the keys. A scheme that randomises the key but uses one fixed function is not universal.*

**1:15–1:22** — The guarantee: for any two distinct keys, at most one in m functions of the family makes them collide.

> Caption: The guarantee: for any two distinct keys, at most one in m functions of the family makes them collide.

Exam-trap caption mode adds: *Universal hashing does not make collisions impossible. It makes them unpredictable, so no fixed key set can be bad on purpose.*

**1:22–1:30** — So the expected number of keys in a slot is n over m, whatever the key set. That is the load factor.

> Caption: So the expected number of keys in a slot is n over m, whatever the key set. That is the load factor.

Exam-trap caption mode adds: *The answer is not n over 2 m. Each slot receives keys from both groups, and the two expected values add.*

## Scene 4. Chaining: a list at every slot

*1:30 – 2:00 · objective: Trace chaining, define the load factor, and get both search costs — unsuccessful 1 plus alpha, successful 1 plus alpha over 2.*

**1:30–1:37** — Chaining puts a linked list at every slot. A colliding key is appended to the list.

> Caption: Chaining puts a linked list at every slot. A colliding key is appended to the list.

Exam-trap caption mode adds: *Chaining stores n nodes plus m pointers. Open addressing stores exactly m cells and no pointers. Space is a real distinction, not a detail.*

**1:37–1:45** — The load factor alpha is n over m, the average number of keys per slot. With chaining it can exceed 1.

> Caption: The load factor alpha is n over m, the average number of keys per slot. With chaining it can exceed 1.

Exam-trap caption mode adds: *A load factor of 80 is not an error and not a percentage. Reporting 0.8, or 80 percent, is the mistake this item exists to catch.*

**1:45–1:52** — Under uniform hashing an unsuccessful search scans 1 plus alpha nodes; a successful one scans 1 plus alpha over 2.

> Caption: Under uniform hashing an unsuccessful search scans 1 plus alpha nodes; a successful one scans 1 plus alpha over 2.

Exam-trap caption mode adds: *The two costs are different formulas. An item that says search without saying which will key the successful value.*

**1:52–2:00** — GATE CSE 2014 Set 1: nine keys into nine slots by chaining gives maximum 3, minimum 0, average 1.

> Caption: GATE CSE 2014 Set 1: nine keys into nine slots by chaining gives maximum 3, minimum 0, average 1.

Exam-trap caption mode adds: *The minimum is 0 only because the table has empty slots. If every slot were occupied the minimum would be 1, and the average is n over m whatever the arrangement.*

## Scene 5. Open addressing: the keys live in the table

*2:00 – 2:30 · objective: Trace linear probing on a real key list, and see that a probe sequence is a walk, not a second hash.*

**2:00–2:07** — Open addressing stores the keys themselves in the m slots. No lists, no pointers, no extra memory.

> Caption: Open addressing stores the keys themselves in the m slots. No lists, no pointers, no extra memory.

Exam-trap caption mode adds: *Open addressing equals closed hashing; chaining equals open hashing. A question that says closed hashing is asking about probing, not about lists.*

**2:07–2:15** — A collision starts a probe sequence: a fixed walk through the table until a free slot is found.

> Caption: A collision starts a probe sequence: a fixed walk through the table until a free slot is found.

Exam-trap caption mode adds: *Since every key occupies a slot, the table can never hold more than m keys. Open addressing requires alpha strictly less than 1, so a full table has no answer at all.*

**2:15–2:22** — Linear probing with h of x equals x plus 7 modulo 11: each collision moves one slot right, wrapping at the end.

> Caption: Linear probing with h of x equals x plus 7 modulo 11: each collision moves one slot right, wrapping at the end.

Exam-trap caption mode adds: *The walk wraps modulo m. Forgetting the wrap is the single most common error in a linear-probing trace, and it changes the final table.*

**2:22–2:30** — The result: slots 0, 1, 7, 8, 9, 10 hold keys, and 2, 3, 4, 5, 6 are empty.

> Caption: The result: slots 0, 1, 7, 8, 9, 10 hold keys, and 2, 3, 4, 5, 6 are empty.

Exam-trap caption mode adds: *A question can ask which position is empty without asking for the whole table. Trace the whole table anyway; the partial question is easier to answer from the full picture.*

## Scene 6. Linear probing builds clusters

*2:30 – 3:00 · objective: See a run of occupied slots absorb every new key that hashes into it, and see the quadratic blow-up in the unsuccessful-search cost.*

**2:30–2:37** — Every key that hashes into a run walks to the far end of it, and lengthens the run by one.

> Caption: Every key that hashes into a run walks to the far end of it, and lengthens the run by one.

Exam-trap caption mode adds: *The failure is not that collisions happen. It is that collisions make further collisions more likely, which breaks the uniform hashing assumption the cost formulas rest on.*

**2:37–2:45** — Knuth's result: an unsuccessful search under linear probing averages half of 1 plus 1 over the square of 1 minus alpha.

> Caption: Knuth's result: an unsuccessful search under linear probing averages half of 1 plus 1 over the square of 1 minus alpha.

Exam-trap caption mode adds: *The squared denominator means linear probing is fine below about alpha equal to 0.5 and unusable near 1. Quoting the uniform-hashing formula for a linear-probing table is the error this scene exists to prevent.*

**2:45–2:52** — The same four load factors, measured on the page: linear probing is the worst of the three, and the gap widens.

> Caption: The same four load factors, measured on the page: linear probing is the worst of the three, and the gap widens.

Exam-trap caption mode adds: *Linear probing is still the fastest in practice at low load factors, because consecutive slots share a cache line. The comparison is about probes, not about nanoseconds.*

**2:52–3:00** — A successful search is cheaper, because it can stop at its own key. Linear probing: half of 1 plus 1 over 1 minus alpha.

> Caption: A successful search is cheaper, because it can stop at its own key. Linear probing: half of 1 plus 1 over 1 minus alpha.

Exam-trap caption mode adds: *The successful and unsuccessful costs differ by more than a constant. A question that does not say which search it means has two defensible answers, so read the stem for the word unsuccessful or absent.*

## Scene 7. Quadratic probing and double hashing

*3:00 – 3:30 · objective: Apply both probe rules, and know the exact condition each one needs before it is allowed to promise a free slot.*

**3:00–3:07** — Quadratic probing adds a square: the i-th probe is the home slot plus c1 i plus c2 i squared, modulo m.

> Caption: Quadratic probing adds a square: the i-th probe is the home slot plus c1 i plus c2 i squared, modulo m.

Exam-trap caption mode adds: *Quadratic probing does not guarantee a free slot in general. A table with alpha below 1 can still reject an insertion, because the walk may revisit slots and never reach the empty one.*

**3:07–3:15** — With m a power of two the walk can miss half the table. With m prime and alpha at most one half, it is guaranteed to find a slot.

> Caption: With m a power of two the walk can miss half the table. With m prime and alpha at most one half, it is guaranteed to find a slot.

Exam-trap caption mode adds: *This is the one place where the table size silently decides correctness. A quadratic-probing trace on a non-prime m can be unanswerable, and the honest answer may be that the key cannot be inserted.*

**3:15–3:22** — Double hashing steps by a second hash: probe i is h1 plus i times h2, modulo m.

> Caption: Double hashing steps by a second hash: probe i is h1 plus i times h2, modulo m.

Exam-trap caption mode adds: *The step must be coprime with m, or the walk visits only m over the gcd slots. If m is prime, the only bad step is a multiple of m; if m is not prime, an even step in an even table is the classic failure.*

**3:22–3:30** — Two traces: key 90 gives probe 1 equal to 13 in 2020, and key 24 lands in slot 10 in 2025 Set 1.

> Caption: Two traces: key 90 gives probe 1 equal to 13 in 2020, and key 24 lands in slot 10 in 2025 Set 1.

Exam-trap caption mode adds: *Probe numbering starts at 0 in both of these questions, and they say so. Reading probe 1 as the first probe gives 21 in the 2020 item, which is the commonest wrong answer.*

## Scene 8. Deletion, and the tombstone

*3:30 – 3:55 · objective: See a present key become unreachable because a slot was marked empty, and understand what a tombstone does and what it costs.*

**3:30–3:36** — Delete a key by marking its slot empty, and every key that walked past it becomes unreachable.

> Caption: Delete a key by marking its slot empty, and every key that walked past it becomes unreachable.

Exam-trap caption mode adds: *This is a correctness bug, not a performance problem, and it is invisible until a particular key is searched. A test suite that only inserts will never catch it.*

**3:36–3:42** — The fix is a tombstone: mark the slot deleted, which search treats as occupied and insert treats as free.

> Caption: The fix is a tombstone: mark the slot deleted, which search treats as occupied and insert treats as free.

Exam-trap caption mode adds: *A tombstone is not the same as an empty slot, and it is not the same as an occupied slot. Any trace question that mentions a deletion is testing whether you kept all three states distinct.*

**3:42–3:48** — Tombstones accumulate: a table of tombstones has no free slot yet no keys, so the table must be rebuilt.

> Caption: Tombstones accumulate: a table of tombstones has no free slot yet no keys, so the table must be rebuilt.

Exam-trap caption mode adds: *The load factor that matters for an insertion is keys plus tombstones over m, not keys over m. Using the smaller number understates the cost badly after many deletions.*

**3:48–3:55** — Chaining has no such problem: given the pointer, unlinking is O of 1. That is why GATE CSE 1996 chose deletion as its advantage.

> Caption: Chaining has no such problem: given the pointer, unlinking is O of 1. That is why GATE CSE 1996 chose deletion as its advantage.

Exam-trap caption mode adds: *The 1996 options included better worst-case search time, which is false, and less space, which is also false. Deletion is the only genuine advantage listed.*

## Scene 9. What the costs actually are

*3:55 – 4:30 · objective: Put the four expected-probe formulas side by side at four load factors, and see why "hashing is O of 1" is a statement about an average.*

**3:55–4:03** — Four formulas, one assumption. Every one of them is an average under uniform hashing.

> Caption: Four formulas, one assumption. Every one of them is an average under uniform hashing.

Exam-trap caption mode adds: *A question that gives you a table and a key list and asks for the number of probes wants a count, not a formula. The formula answers a different question about a random table.*

**4:03–4:11** — At alpha equal to 0.5 the three schemes are close; at 0.9 they are not. Linear probing pays 50 probes against 10.

> Caption: At alpha equal to 0.5 the three schemes are close; at 0.9 they are not. Linear probing pays 50 probes against 10.

Exam-trap caption mode adds: *The formulas blow up as alpha approaches 1. An item that asks for the cost at alpha equal to 1 has no finite answer, and the honest response is that the table is full.*

**4:11–4:19** — Successful search is cheaper than unsuccessful in every scheme. The gap is not a constant.

> Caption: Successful search is cheaper than unsuccessful in every scheme. The gap is not a constant.

Exam-trap caption mode adds: *The two numbers are easy to swap. Read whether the question says the key is present before choosing a formula.*

**4:19–4:30** — So hashing is O of 1 on average, and Theta of n in the worst case. Both statements are true, of different things.

> Caption: So hashing is O of 1 on average, and Theta of n in the worst case. Both statements are true, of different things.

Exam-trap caption mode adds: *Quoting O of 1 as a worst-case bound is the single most common hashing misconception. It is an average, and it is conditional on the uniformity assumption.*

## Scene 10. The decision procedure

*4:30 – 5:00 · objective: Four questions that turn any GATE hashing item into a mechanical trace or a one-line substitution.*

**4:30–4:37** — First: which scheme? Chaining has lists; linear, quadratic and double are all open addressing.

> Caption: First: which scheme? Chaining has lists; linear, quadratic and double are all open addressing.

Exam-trap caption mode adds: *Closed hashing means open addressing. A stem that says closed hashing and a student who reads it as chaining will answer a different question correctly.*

**4:37–4:45** — Second: is the answer a count or an estimate? Given keys and an order, trace. Given only n, m and alpha, use a formula.

> Caption: Second: is the answer a count or an estimate? Given keys and an order, trace. Given only n, m and alpha, use a formula.

Exam-trap caption mode adds: *Applying a formula to a specific key list gives a number that is not the number of probes. The trace and the formula will disagree, and the trace is the answer.*

**4:45–4:52** — Third: does the stem name a probe number? Then substitute i, and remember probe 0 is the first probe.

> Caption: Third: does the stem name a probe number? Then substitute i, and remember probe 0 is the first probe.

Exam-trap caption mode adds: *Probe 0 is the home slot. Answering probe 1 with the home slot, or with i equal to 2, are the two standard wrong answers.*

**4:52–5:00** — Fourth: is the question about a search that succeeds, or one that fails? The formulas differ, and so do the traces.

> Caption: Fourth: is the question about a search that succeeds, or one that fails? The formulas differ, and so do the traces.

Exam-trap caption mode adds: *Counting the stopping empty slot is part of an unsuccessful probe count in most textbooks. State which convention you used, because the two conventions differ by one.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
