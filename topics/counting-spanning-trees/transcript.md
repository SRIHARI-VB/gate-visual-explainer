# Counting Spanning Trees — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/counting-spanning-trees/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A spanning tree: all the vertices, one edge fewer, no cycle

*0:00 – 0:30 · objective: State what is being counted — a subgraph on all n vertices with exactly n-1 edges and no cycle — and count the 16 of K4 by choosing three of its six edges and rejecting the four triangles.*

**0:00–0:07** — A spanning tree keeps every vertex, uses exactly n minus one edges, and contains no cycle.

> Caption: A spanning tree keeps every vertex and exactly n-1 edges, with no cycle.

**0:07–0:15** — K four has six edges, and choosing three of them can be done in twenty ways.

> Caption: K4 has six edges, so there are C(6,3) = 20 ways to choose three of them.

**0:15–0:22** — Four of the twenty choices are triangles, which leave a vertex out, so sixteen remain.

> Caption: Four of those 20 choices are triangles, leaving one vertex out: 20 - 4 = 16.

Exam-trap caption mode adds: *A triangle on three of the four vertices is not a spanning tree: it does not reach the fourth vertex.*

**0:22–0:30** — Sixteen is the count for K four, and it is exactly what the 2024 paper asked.

> Caption: Sixteen is the count for K4, and it is what the 2024 paper asked for.

## Scene 2. Choose then test: the honest but slow method

*0:30 – 1:00 · objective: Count spanning trees by enumerating every (n-1)-subset of the edge set and keeping the connected ones, on K4, C4 and K2,3, and see why the cost is C(m, n-1).*

**0:30–0:37** — Brute force chooses n minus one of the m edges, then tests whether the choice is connected.

> Caption: Brute force: choose n-1 of the m edges, then test that the choice is connected.

**0:37–0:45** — In a four-cycle any three edges form a path, so there are four spanning trees.

> Caption: C4 has four edges, and any three of them form a path: 4 trees, one per omitted edge.

**0:45–0:52** — The graph K two three has five vertices, so a spanning tree needs four edges: fifteen subsets, twelve of them trees.

> Caption: K2,3 has five vertices, so a tree needs four edges: 15 subsets, and 12 of them are trees.

Exam-trap caption mode adds: *The number of edges does not determine the count: K4 and K2,3 both have six edges and different answers.*

**0:52–1:00** — Choose then test is exact, but it costs C of m choose n minus one checks, so it is for small graphs.

> Caption: Choose-then-test is exact but costs C(m, n-1) checks, so it is only for small graphs.

## Scene 3. Deletion and contraction: split on one edge

*1:00 – 1:30 · objective: Apply T(G) = T(G-e) + T(G/e) to the diamond, reach the two base cases — one vertex counts one, no edges on two or more vertices counts zero — and add 4 + 4.*

**1:00–1:07** — Pick an edge. A spanning tree either avoids it or uses it, so the count splits into two cases.

> Caption: Deletion-contraction splits on one edge: trees that avoid it, plus trees that use it.

**1:07–1:15** — Avoiding the edge deletes it. Using the edge contracts it, merging its two ends into one vertex.

> Caption: Avoiding e gives G-e; using e gives G/e, where the two ends become one vertex.

**1:15–1:22** — On the diamond the two branches give four and four, so the diamond has eight spanning trees.

> Caption: On the diamond the two branches give 4 and 4, and 4 + 4 = 8.

**1:22–1:30** — The recursion stops at two base cases: one vertex counts one, and no edges on two or more vertices counts zero.

> Caption: The recursion stops at two base cases: one vertex counts 1, no edges on two or more counts 0.

Exam-trap caption mode adds: *A self-loop left behind by a contraction must be deleted. Keeping it doubles every count that passes through it.*

## Scene 4. Complete graphs: Cayley's n to the n-2

*1:30 – 2:00 · objective: Read Cayley's formula as a table for n = 1 to 7, and see why it may only be applied to a complete graph.*

**1:30–1:37** — On a complete graph the count has a closed form: n to the power n minus two.

> Caption: On a complete graph the count collapses to a formula: n to the power n-2.

**1:37–1:45** — For one to seven vertices the counts are one, one, three, sixteen, one hundred twenty-five, twelve ninety-six and sixteen thousand eight hundred seven.

> Caption: For n = 1 to 7 the counts are 1, 1, 3, 16, 125, 1296, 16807.

**1:45–1:52** — The exponent is n minus two because a tree is pinned down by n minus two independent choices.

> Caption: The exponent is n-2 because a tree is pinned down by n-2 choices, not n-1.

**1:52–2:00** — Cayley needs a complete graph. On a sparse graph the formula counts trees that the graph cannot contain.

> Caption: Cayley needs a complete graph. On a sparse graph the formula over-counts.

Exam-trap caption mode adds: *Applying n^(n-2) to a non-complete graph is the most common wrong answer in this topic.*

## Scene 5. The Prüfer code: delete the smallest leaf, record its neighbour

*2:00 – 2:30 · objective: Encode a six-vertex tree by repeatedly deleting its smallest leaf and writing down that leaf's neighbour, giving a sequence of n-2 labels.*

**2:00–2:07** — A Prüfer code comes from deleting the smallest leaf again and again.

> Caption: A Prüfer code is what you get by deleting the smallest leaf, over and over.

**2:07–2:15** — Write down the neighbour of each leaf you delete, and stop when only two vertices remain.

> Caption: Record the neighbour of each deleted leaf, and stop when two vertices are left.

**2:15–2:22** — This tree gives the code one, two, four, four.

> Caption: This six-vertex tree gives the code 1, 2, 4, 4 — four labels, which is n-2.

**2:22–2:30** — Every labelled tree gives exactly one code, so nothing is missed and nothing is counted twice.

> Caption: Every tree on n labelled vertices gives exactly one code, so no tree is missed.

## Scene 6. Decoding: the code determines the tree

*2:30 – 3:00 · objective: Rebuild the tree from a Prüfer sequence using degree counts, and see that the 125 sequences on five labels give exactly the 125 spanning trees of K5.*

**2:30–2:37** — To decode, count how often each label appears in the code and add one: that is its degree.

> Caption: To reverse it, count each label in the code and add one: that is its degree.

**2:37–2:45** — The smallest label of degree one is the leaf that was deleted first, so join it to the first code entry.

> Caption: The smallest label of degree one must be a leaf: join it to the first code entry.

**2:45–2:52** — Repeat, join the last two survivors, and the tree comes back exactly as it was.

> Caption: Repeat, then join the last two survivors: the tree comes back exactly.

**2:52–3:00** — Codes and trees match one for one, so five to the third is one hundred twenty-five trees on five vertices.

> Caption: So codes and trees match one for one: 5 to the 3 is 125 trees on five vertices.

## Scene 7. The Matrix-Tree theorem: one determinant

*3:00 – 3:30 · objective: Build the Laplacian, delete one row and its column, take the determinant, and get 16 for K4, 5 for C5 and 81 for K3,3.*

**3:00–3:07** — The Laplacian has the degree on the diagonal and minus one wherever there is an edge.

> Caption: The Laplacian is the degree on the diagonal, minus one for each edge.

**3:07–3:15** — Delete one row and the same column, and the determinant of what is left is the number of spanning trees.

> Caption: Delete any one row and the same column; the determinant is the tree count.

**3:15–3:22** — For K four the minor has three on the diagonal and minus one elsewhere, and its determinant is sixteen.

> Caption: For K4 the minor has 3 on the diagonal and -1 elsewhere: determinant 16.

**3:22–3:30** — The five-cycle gives five, and the complete bipartite graph on three and three gives eighty-one.

> Caption: For C5 the same recipe gives 5, and for K3,3 it gives 81.

## Scene 8. The families worth memorising

*3:30 – 4:00 · objective: Collect the counts for a tree, a cycle, a complete bipartite graph, a wheel and a disconnected graph, each verified against the determinant.*

**3:30–3:37** — A tree counts one, because it is its own spanning tree. A disconnected graph counts zero.

> Caption: A tree counts 1, and a disconnected graph counts 0.

Exam-trap caption mode adds: *A disconnected graph is not a graph with few trees. It has none, so the answer is 0.*

**3:37–3:45** — A cycle on n vertices has n spanning trees, one for each edge you could delete.

> Caption: A cycle C_n counts n: one tree for each edge you delete.

**3:45–3:52** — A complete bipartite graph has m to the n minus one times n to the m minus one spanning trees.

> Caption: A complete bipartite graph K_m,n counts m to the n-1 times n to the m-1.

**3:52–4:00** — The wheel on four rim vertices has forty-five spanning trees, and the determinant finds it without a formula.

> Caption: The wheel W4 counts 45, and the determinant gives it without a formula.

## Scene 9. Labelled, unlabelled, and the binary search tree count

*4:00 – 4:30 · objective: Separate three numbers that are confused with each other: 16 labelled trees, 2 unlabelled shapes, and 14 distinct binary search trees on four keys.*

**4:00–4:07** — Whether the vertices are labelled decides which number the question is asking for.

> Caption: Labelled or unlabelled decides which number the question wants.

**4:07–4:15** — Four vertices give sixteen labelled trees but only two shapes, the path and the star.

> Caption: On four vertices there are 16 labelled trees but only 2 shapes: the path and the star.

**4:15–4:22** — Binary search trees on four keys number fourteen, which is the fourth Catalan number.

> Caption: Binary search trees on four keys number 14, the fourth Catalan number.

Exam-trap caption mode adds: *Cayley counts trees on n vertices; Catalan counts binary trees or binary search trees. They are not the same sequence.*

**4:22–4:30** — Sixteen, two and fourteen answer three different questions about the same four vertices.

> Caption: So 16, 2 and 14 answer three different questions about the same four vertices.

## Scene 10. The exam procedure, and the 2024 question

*4:30 – 5:00 · objective: Choose the method from the shape of the graph, check connectivity first, and answer the GATE CSE 2024 Set 1 spanning-tree question three independent ways.*

**4:30–4:37** — Step one: decide whether the graph is complete, a cycle, a complete bipartite graph, or none of these.

> Caption: Step one: is the graph complete, a cycle, or neither? That picks the method.

**4:37–4:45** — Step two: check the graph is connected, because a disconnected graph has no spanning tree.

> Caption: Step two: check connectivity first. A disconnected graph has no spanning tree.

**4:45–4:52** — On K four, brute force, contraction and the determinant all give sixteen.

> Caption: Step three: on K4, brute force, contraction and the determinant all give 16.

**4:52–5:00** — The 2024 paper asked for the spanning trees of K four labelled, and the official key is sixteen.

> Caption: The 2024 paper asked exactly this for K4 labelled, and the official key is 16.

Exam-trap caption mode adds: *Answering 2 counts the shapes instead of the labelled trees. Answering 20 forgets the four triangles.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
