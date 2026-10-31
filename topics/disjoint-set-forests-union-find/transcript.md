# Disjoint-set forests (union-find): parent pointers, union by rank, path compression and the inverse Ackermann bound — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/disjoint-set-forests-union-find/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Are these two in the same group? The partition and its forest

*0:00 – 0:30 · objective: State the problem union-find answers, name its three operations, and see that every answer is read off the shape of a forest of parent pointers.*

**0:00–0:07** — Six elements, each alone in its own set. A union merges two sets. A find asks which set an element is in.

> Caption: Six elements, each alone in its own set. A union merges two sets. A find asks which set an element is in.

**0:07–0:15** — The usual representation is a forest. One parent pointer per element, and the root of each tree names the set.

> Caption: The usual representation is a forest: one parent pointer per element, and the root of each tree names the set.

**0:15–0:22** — Find follows parent pointers to a root. Union points one root at the other. The cost of both is the number of hops.

> Caption: Find follows parent pointers to a root. Union points one root at the other. The cost of both is the number of hops.

**0:22–0:30** — Two correct implementations can produce different trees, so the tree shape is the whole subject.

> Caption: Two correct implementations can produce different trees, so the tree shape is the whole subject.

## Scene 2. Naive linking builds a chain, and one find costs n − 1 hops

*0:30 – 1:00 · objective: Link always in the same direction on eight elements, measure the height of the resulting chain and the hops a single find walks, and see why the worst case is Theta of n.*

**0:30–0:37** — Link every new element under the previous one, and the eight elements form a chain of height seven.

> Caption: Link every new element under the previous one and the eight elements form a chain of height seven.

**0:37–0:45** — Find of zero now walks seven edges. At n elements that same call walks n minus one, so a single find is Theta of n.

> Caption: Find of zero now walks seven edges. At n elements that same call walks n minus one, so a single find is Theta of n.

Exam-trap caption mode adds: *A chain is not a bug in find. Every pointer is valid and every answer is right. The cost comes from the linking rule, which looked at nothing.*

**0:45–0:52** — Repeat that find m times with no repair and the total is Theta of m times n. The sequence is quadratic for no reason.

> Caption: Repeat that find m times with no repair and the total is Theta of m times n: the sequence is quadratic for no reason.

**0:52–1:00** — Two independent repairs exist. Change which root goes under which, and change what find leaves behind.

> Caption: Two independent repairs exist: change which root goes under which, and change what find leaves behind.

## Scene 3. Union by rank: attach the shorter tree under the taller

*1:00 – 1:30 · objective: Apply the linking rule that keeps trees shallow, verify the invariant rank at most floor of log base two of n, and read the final parent array of an eight-element trace.*

**1:00–1:07** — Union by rank. Keep a rank per node, start it at zero, and attach the lower-ranked root under the higher.

> Caption: Union by rank: keep a rank per node, start it at zero, and attach the lower-ranked root under the higher.

**1:07–1:15** — A root of rank k holds at least two to the k nodes, so no rank exceeds log base two of n. Measured: no violation up to sixty-four.

> Caption: A root of rank k holds at least two to the k nodes, so no rank exceeds log base two of n. Measured: no violation up to 64.

**1:15–1:22** — Eight elements, seven unions. The parent array is zero zero zero two zero four four six, the root holds all eight, and the height is three.

> Caption: Eight elements, seven unions: the parent array is 0 0 0 2 0 4 4 6, the root holds all eight, and the height is three.

**1:22–1:30** — Union by size is the same rule counted differently. It stores a node count, not a rank. Different array, same logarithmic bound.

> Caption: Union by size is the same rule counted differently: it stores a node count, not a rank. Different array, same logarithmic bound.

Exam-trap caption mode adds: *Union by rank and union by size are not interchangeable in a question that asks for the final parent array. They are interchangeable in a question that asks for the height bound.*

## Scene 4. Path compression: find rewires the path it just walked

*1:30 – 2:00 · objective: Watch one find flatten a chain, measure the second find on the same node, and see that compression changes parent pointers but never a rank, a root or the set membership.*

**1:30–1:37** — Find of zero on the chain walks seven edges and returns the root. Path compression then makes every node on that path point at the root.

> Caption: Find of zero on the chain walks seven edges and returns the root. Path compression then makes every node on that path point at the root.

**1:37–1:45** — The same find again costs one hop. Measured on eight elements: seven hops, then one, then one.

> Caption: The same find again costs one hop. Measured on eight elements: seven hops, then one, then one.

**1:45–1:52** — Compression never changes a rank, so after find of seven the root still has rank three while the real height has fallen to two.

> Caption: Compression never changes a rank, so after find of seven the root still has rank three while the real height has fallen to two.

Exam-trap caption mode adds: *Rank is an upper bound on height and can exceed it. An answer that treats rank and height as the same number is wrong the moment compression is switched on.*

**1:52–2:00** — Three rewiring variants. Two-pass compression, path halving, path splitting. Different pointers, same purpose.

> Caption: Three rewiring variants: two-pass compression, path halving, path splitting. Different pointers, same purpose.

## Scene 5. Four implementations, four bounds, one measured table

*2:00 – 2:30 · objective: Separate the four combinations of linking rule and compression by their bounds, and check the measured hop counts against them on the same sequence.*

**2:00–2:07** — No repair. A find is Theta of n in the worst case, because the chain is always available as an input sequence.

> Caption: No repair: a find is Theta of n in the worst case, because the chain is always available as an input sequence.

**2:07–2:15** — Union by rank alone. Every find is O of log n, and the bound is tight, because a balanced merge sequence attains log base two of n.

> Caption: Union by rank alone: every find is O of log n, and the bound is tight, because a balanced merge sequence attains log base two of n.

**2:15–2:22** — Compression alone. One find can still cost n, but any sequence of m operations costs O of m log n. Tarjan and van Leeuwen, nineteen eighty-four.

> Caption: Compression alone: one find can still cost n, but any sequence of m operations costs O of m log n. Tarjan and van Leeuwen, 1984.

**2:22–2:30** — Both together. O of m alpha of n for the whole sequence. Measured here at one point nine three hops per operation against sixty point nine three with no repair.

> Caption: Both together: O of m alpha of n for the whole sequence. Measured here at 1.93 hops per operation against 60.93 with no repair.

## Scene 6. Alpha of n is not one, and it is not a constant

*2:30 – 3:00 · objective: Define the inverse Ackermann function from its own recursion, compute its thresholds, and say exactly what the O of m alpha of n bound does and does not claim.*

**2:30–2:37** — Ackermann of k and j. A of zero and j is j plus one. A of k and zero is A of k minus one and one. Otherwise A of k minus one applied to A of k and j minus one.

> Caption: Ackermann of k and j: A of zero and j is j plus one; A of k and zero is A of k minus one and one; otherwise it is A of k minus one applied to A of k and j minus one.

**2:37–2:45** — A of k and one gives two, three, five, thirteen, sixty-five thousand five hundred and thirty-three. So alpha is one up to three, two up to five, three up to thirteen, four up to sixty-five thousand five hundred and thirty-three, and five after that.

> Caption: A of k and one gives 2, 3, 5, 13, 65533. So alpha is 1 up to 3, 2 up to 5, 3 up to 13, 4 up to 65533, and 5 after that.

**2:45–2:52** — So alpha of n is not one, and it is not a constant. It grows without bound, just astronomically slowly.

> Caption: So alpha of n is not one, and it is not a constant: it grows without bound, just astronomically slowly.

Exam-trap caption mode adds: *Answering O of one when O of alpha of n is offered. The first is false as a theorem, even though the two differ by less than a factor of five for every input that fits in memory.*

**2:52–3:00** — And the bound is on a sequence. One operation in that sequence may still walk a long path. Amortised is not per operation.

> Caption: And the bound is on a sequence: one operation in that sequence may still walk a long path. Amortised is not per operation.

## Scene 7. Kruskal: the cycle test is one comparison of two roots

*3:00 – 3:30 · objective: Run Kruskal on a six-vertex graph with union-find as the cycle test, count the finds, the unions and the rejects, and state the complexity with the sorting removed.*

**3:00–3:07** — Kruskal sorts the edges and asks one question per edge. Are these two endpoints already connected? Two finds answer it.

> Caption: Kruskal sorts the edges and asks one question per edge: are these two endpoints already connected? Two finds answer it.

**3:07–3:15** — Six vertices, nine edges. Five accepted with total weight fourteen, four rejected. Eighteen finds and five unions, twelve hops.

> Caption: Six vertices, nine edges: five accepted with total weight 14, four rejected. Eighteen finds and five unions, twelve hops.

**3:15–3:22** — The counts are fixed by the graph, not by the weights. Two finds per edge, n minus one unions, and m minus n plus one rejects.

> Caption: The counts are fixed by the graph, not by the weights: two finds per edge, n minus one unions, and m minus n plus one rejects.

**3:22–3:30** — With the sorting removed the cost is the union-find cost. O of m alpha of n with both repairs, O of m log n with rank alone.

> Caption: With the sorting removed the cost is the union-find cost: O of m alpha of n with both repairs, O of m log n with rank alone.

Exam-trap caption mode adds: *Quoting O of m log m for the sorted case. The sort is given away by the question, so the only term left is the disjoint-set work.*

## Scene 8. Counting components without tracing the forest

*3:30 – 4:00 · objective: Read the number of sets off the number of successful unions and off the number of roots, and treat a union that changes nothing as the answer rather than an error.*

**3:30–3:37** — Ten elements, eight union calls, seven successful. Three sets remain, which is n minus the successful unions.

> Caption: Ten elements, eight union calls, seven successful: three sets remain, which is n minus the successful unions.

**3:37–3:45** — The same number is read the other way. Count the roots, the elements that are their own parent. Three here.

> Caption: The same number is read the other way: count the roots, the elements that are their own parent. Three here.

**3:45–3:52** — After n minus one successful unions on n elements, one set remains. The graph is connected, and the forest is a single tree.

> Caption: After n minus one successful unions on n elements, one set remains: the graph is connected, and the forest is a single tree.

**3:52–4:00** — A union that returns false is information, not an error. The two elements are already connected, and in Kruskal that is a cycle.

> Caption: A union that returns false is information, not an error: the two elements are already connected, and in Kruskal that is a cycle.

## Scene 9. What a disjoint-set forest cannot do

*4:00 – 4:30 · objective: Name the four things this structure cannot answer — splits, paths, directed cycles and set membership lists — and the data structure that can.*

**4:00–4:07** — A disjoint-set forest only merges. There is no split, no delete, and no way to undo a union.

> Caption: A disjoint-set forest only merges. There is no split, no delete, and no way to undo a union.

**4:07–4:15** — It answers same or different, not how. The parent pointers are not a path in the graph.

> Caption: It answers same or different, not how. The parent pointers are not a path in the graph.

**4:15–4:22** — It detects cycles in undirected graphs only. Two vertices joined in both directions are a directed cycle and not an undirected one.

> Caption: It detects cycles in undirected graphs only. Two vertices joined in both directions are a directed cycle and not an undirected one.

Exam-trap caption mode adds: *Using find of u against find of v as a directed-cycle test. It answers a question about the underlying undirected graph, which is a different question.*

**4:22–4:30** — It cannot list the members of a set either. That needs a second structure, such as a member list per root.

> Caption: It cannot list the members of a set either. That needs a second structure, such as a member list per root.

## Scene 10. The procedure, and the four traps

*4:30 – 5:00 · objective: Reduce the topic to four questions asked in order, and name the four traps that decide the mark.*

**4:30–4:37** — First, which linking rule? Without one, the parent array is not determined, and a question that asks for it must have said.

> Caption: First: which linking rule? Without one, the parent array is not determined, and a question that asks for it must have said.

**4:37–4:45** — Second, is compression on? It makes the array depend on the order of the finds, not only on the unions.

> Caption: Second: is compression on? It makes the array depend on the order of the finds, not only on the unions.

Exam-trap caption mode adds: *Tracing unions only, then answering a question that had finds in the middle. The finds rewired the paths the unions left behind.*

**4:45–4:52** — Third, count hops, not operations, and state n and m. A bound without its two parameters is not a bound.

> Caption: Third: count hops, not operations, and state n and m. A bound without its two parameters is not a bound.

**4:52–5:00** — Three sentences to write. No repair, Theta of n. Rank alone, O of log n and tight. Both together, O of m alpha of n amortised.

> Caption: Three sentences to write: no repair Theta of n; rank alone O of log n and tight; both together O of m alpha of n amortised.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
