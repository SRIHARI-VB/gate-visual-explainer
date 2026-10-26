# Graphs Connectivity — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/graphs-connectivity/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A graph is two sets

*0:00 – 0:30 · objective: State the definition of a simple undirected graph as a vertex set and an edge set, read a graph from an adjacency matrix and from an adjacency list, and read a degree off either one.*

**0:00–0:08** — A graph is two sets. V holds the vertices, and E holds the edges, each edge an unordered pair of vertices.

> Caption: A graph is two sets: V, the vertices, and E, a set of unordered pairs of vertices — the edges.

**0:08–0:16** — Two representations. A matrix with a one wherever two vertices are joined, or a list of neighbours for each vertex.

> Caption: Two representations: a matrix whose rows are vertices and whose 1s mark edges, or a list of neighbours for each vertex.

**0:16–0:23** — The degree of a vertex is how many edges meet it. That is the row sum of the matrix, and the length of the neighbour list.

> Caption: The degree of a vertex is the number of edges at it — the row sum of the matrix, the length of the list.

Exam-trap caption mode adds: *A degree counts edges, not distinct neighbours, only when there is at most one edge between any pair. In a multigraph the two numbers differ.*

**0:23–0:30** — Every number in this lesson is computed from the two sets. The picture is only a way of seeing them.

> Caption: Every number on this page is computed from those two sets, never read off the drawing.

## Scene 2. The handshake lemma

*0:30 – 1:00 · objective: Derive the degree sum equals twice the edge count by counting each edge at both ends, and use it to force the odd-degree vertices to come in pairs.*

**0:30–0:38** — Add up all the degrees. Every edge is counted twice, once at each end, so the sum is twice the number of edges.

> Caption: Add up all the degrees and every edge has been counted twice, once at each end. The sum is twice the number of edges.

**0:38–0:46** — The degree sum is always even. So the vertices of odd degree must come in pairs. There can never be exactly one.

> Caption: So the degree sum is always even, and the vertices of odd degree must come in pairs.

**0:46–0:53** — The degrees here are two, three, three, two, two. They sum to twelve, so there are six edges, and vertices one and two are the odd ones.

> Caption: Here the degrees 2, 3, 3, 2, 2 sum to 12, so there are exactly 6 edges — and vertices 1 and 2 are the two odd ones.

Exam-trap caption mode adds: *An even degree sum is necessary, not sufficient. The sequence 4, 4, 4, 0 sums to 12 but is not realisable on four vertices, because a vertex of degree 0 is isolated from vertices that must have degree 4.*

**0:53–1:00** — The lemma rules things out. A graph with exactly one vertex of odd degree cannot exist, and a degree sequence with an odd sum cannot either.

> Caption: The lemma rules things out: you cannot have a graph with exactly one vertex of odd degree.

## Scene 3. Walks, paths, cycles, components

*1:00 – 1:30 · objective: Separate walk, trail, path and cycle by what may repeat, then define connected, component and distance, and count the components of a graph that is not connected.*

**1:00–1:08** — A walk may repeat vertices and edges. A path repeats neither. A cycle is a closed path, and in a simple graph its length is at least three.

> Caption: A walk may repeat vertices and edges; a path repeats neither. A cycle is a closed path of length at least three.

Exam-trap caption mode adds: *A cycle of length two needs two parallel edges, which a simple graph does not have. That is why the minimum length is three.*

**1:08–1:16** — A graph is connected when a path joins every pair of vertices. A component is a maximal connected piece, and the components split the vertices between them.

> Caption: A graph is connected when a path joins every pair of vertices. A component is a maximal connected piece.

**1:16–1:23** — This graph has three components: the triangle, the two-vertex path, and vertex five on its own.

> Caption: This graph has three: the triangle, the two-vertex path, and vertex 5 alone. An isolated vertex is its own component.

Exam-trap caption mode adds: *An isolated vertex is a component. Counting components in a drawing and skipping the lone dots is the commonest counting error on this topic.*

**1:23–1:30** — Distance is the length of the shortest path. It exists only inside one component. Between components the distance is not big, it is undefined.

> Caption: Distance is the length of the shortest path, and it is defined only inside one component.

## Scene 4. Trees: three equivalent statements

*1:30 – 2:00 · objective: Recognise the three interchangeable tests for a tree on n vertices — connected and acyclic, exactly n − 1 edges, exactly one path between every pair — and know why each implies the others.*

**1:30–1:38** — A tree is a connected graph with no cycle. For a graph on n vertices, three statements then say the same thing.

> Caption: A tree is a connected graph with no cycle. Three statements then say the same thing about a graph on n vertices.

**1:38–1:45** — Connected and acyclic. Exactly n minus one edges. Exactly one path between every pair. Any one of the three implies the other two.

> Caption: Connected and acyclic; exactly n − 1 edges; and exactly one path between every pair of vertices.

Exam-trap caption mode adds: *Two of the three do not suffice. Acyclic with n − 1 edges is not enough on its own unless you know it is acyclic, and connected with n − 1 edges is a tree, but acyclic with fewer edges is a forest, not a tree.*

**1:45–1:53** — Each statement is a test. Count the edges, or look for a cycle, or ask whether two different routes join a pair.

> Caption: Each is a test you can run: count the edges, look for a cycle, or ask whether two routes exist.

**1:53–2:00** — Add an edge to a tree and exactly one cycle appears. Delete an edge and the tree falls into two pieces.

> Caption: Adding any edge to a tree creates exactly one cycle, and deleting any edge disconnects it.

## Scene 5. Spanning trees always exist

*2:00 – 2:30 · objective: Prove by edge deletion that every connected graph has a spanning tree, and check the count on K4 against Cayley n^(n−2) by two independent computations.*

**2:00–2:08** — Every connected graph has a spanning tree. It is a tree on all the vertices, built from some of the edges.

> Caption: Every connected graph has a spanning tree: a tree on all the vertices, using some of the edges.

**2:08–2:16** — Find a cycle and delete one of its edges. Connectivity survives, one edge is gone, and the process stops when no cycle is left.

> Caption: Find a cycle, delete one of its edges, and repeat. Each deletion keeps the graph connected and removes a cycle, so the process must stop — at a tree.

Exam-trap caption mode adds: *Deleting an edge that is not on a cycle breaks the graph. The instruction is specifically to delete an edge of a cycle.*

**2:16–2:23** — K4 has sixteen spanning trees. Cayley’s formula gives n to the power n minus two, which here is four squared, sixteen.

> Caption: K4 has 16 spanning trees. Cayley says a complete graph on n vertices has n to the power n − 2, which is 4 squared here.

Exam-trap caption mode adds: *Cayley’s n^(n−2) is for complete graphs. Applying it to a sparse graph over-counts, because the trees it counts use edges the graph does not have.*

**2:23–2:30** — The page counts them by listing every subset, and the formula gives the same number. That agreement is the check.

> Caption: Two independent computations of the same number, which is the only reason to trust either.

## Scene 6. Cut vertices and bridges

*2:30 – 3:00 · objective: Define a cut vertex and a bridge by the increase in component count, find both in one graph, and see that they are different objects counted by different words.*

**2:30–2:38** — A cut vertex is a vertex whose removal increases the number of components. A bridge is an edge with that same property.

> Caption: A cut vertex is a vertex whose removal increases the number of components. A bridge is an edge with the same property.

**2:38–2:46** — Two cut vertices and one bridge. The words count different things: vertices on one side, edges on the other.

> Caption: They are different objects. This graph has two cut vertices, 2 and 5, and one bridge — the edge between them.

**2:46–2:53** — A bridge does not guarantee two cut vertices. In the two-vertex graph the edge is a bridge and neither endpoint is a cut vertex.

> Caption: A bridge’s endpoints are cut vertices only when they have degree at least two.

Exam-trap caption mode adds: *A bridge does not always come with two cut vertices. The two-vertex graph is the counterexample, and it is small enough to check in the exam.*

**2:53–3:00** — A cycle has no cut vertex and no bridge. Every edge of a cycle has an alternative route around it.

> Caption: No cycle has either, because every edge of a cycle sits on an alternative route.

## Scene 7. How connected? kappa, lambda, delta

*3:00 – 3:30 · objective: Define vertex connectivity and edge connectivity as the sizes of the smallest cuts, state and justify Whitney’s chain kappa at most lambda at most delta, and see that the chain bounds rather than determines.*

**3:00–3:08** — How connected is a connected graph? Count the fewest things you must delete before it breaks apart.

> Caption: How connected is a connected graph? Count the fewest things you must delete to break it.

**3:08–3:16** — Kappa deletes vertices. Lambda deletes edges. Delta is the smallest degree in the graph.

> Caption: Vertex connectivity kappa deletes vertices; edge connectivity lambda deletes edges; delta is the smallest degree.

Exam-trap caption mode adds: *Kappa of a complete graph is n − 1 by convention, not undefined and not zero. Kappa of a disconnected graph is zero, not one.*

**3:16–3:23** — Whitney’s chain. Kappa at most lambda, lambda at most delta. The edges at the smallest-degree vertex always form a cut.

> Caption: Whitney’s inequality: kappa is at most lambda, and lambda is at most delta.

Exam-trap caption mode adds: *The chain is an inequality, not an equation. Reading kappa = lambda = delta from it is the standard error; the page shows a graph where the three values are 1, 2 and 3.*

**3:23–3:30** — Here kappa and lambda are one, because of the bridge, and delta is two. The chain gives a bound, not a value.

> Caption: Here kappa and lambda are 1 because of the bridge, while delta is 2. The chain bounds the answer; it does not fix it.

## Scene 8. Bipartite is no odd cycle

*3:30 – 4:00 · objective: Define bipartite by a two-way split and by a 2-colouring, watch an odd cycle defeat every colouring, and decide bipartiteness by breadth-first parity.*

**3:30–3:38** — A graph is bipartite when the vertices split into two sides and every edge goes from one side to the other.

> Caption: A graph is bipartite when the vertices split into two sides and every edge crosses between them.

**3:38–3:46** — Equivalently, colour one side zero and the other one. Every edge then joins different colours. That is a two-colouring.

> Caption: Equivalently: colour one side 0 and the other 1, so every edge joins different colours. That is a 2-colouring.

**3:46–3:53** — An odd cycle is the obstruction. Alternate the colours around five edges and the closing edge joins two vertices of the same colour.

> Caption: The obstruction is an odd cycle. Walking a 5-cycle forces alternating colours, and the last edge meets its own colour.

Exam-trap caption mode adds: *It is the oddness that obstructs, not the length. A 6-cycle is bipartite and a 5-cycle is not, although both are cycles of similar size.*

**3:53–4:00** — Bipartite means no odd cycle. A breadth-first search decides it, by colouring each vertex with the parity of its distance.

> Caption: So bipartite is the same as no odd cycle, and a breadth-first search decides it by parity of distance.

## Scene 9. Euler and Hamilton

*4:00 – 4:30 · objective: Distinguish using every edge once from visiting every vertex once, state the Euler criterion with its connectivity condition, and see that Hamiltonian cycles have no such test.*

**4:00–4:08** — An Euler circuit uses every edge once and comes back to the start. A Hamiltonian cycle visits every vertex once.

> Caption: An Euler circuit uses every edge exactly once and returns to the start. A Hamiltonian cycle visits every vertex exactly once.

**4:08–4:16** — Euler has a one-line test. All edges in one component, and every degree even. Two odd vertices give a trail that does not close.

> Caption: Euler has a one-line test: every edge in one component and every degree even. Zero odd vertices gives a circuit, two gives a trail that is not closed.

Exam-trap caption mode adds: *The degree test alone is not enough. It must be applied to the component that actually holds the edges; four odd vertices in a second component do not stop a circuit in the first.*

**4:16–4:23** — Hamilton has no such test. No simple exact condition is known, and deciding the question is NP-complete.

> Caption: Hamilton has no such test. No simple necessary-and-sufficient condition is known, and deciding it is NP-complete.

Exam-trap caption mode adds: *A sufficient condition is not a test. Dirac’s condition proves a Hamiltonian cycle exists when it holds, but a graph failing it may still be Hamiltonian.*

**4:23–4:30** — The two questions are independent. One graph has an Euler trail but no Hamiltonian cycle, and another has the reverse.

> Caption: They are independent: the two-triangle graph has an Euler trail but no Hamiltonian cycle; K4 minus an edge has a Hamiltonian cycle but no Euler circuit.

## Scene 10. The decision procedure and three traps

*4:30 – 5:00 · objective: Run a fixed five-question procedure on an unfamiliar graph question, and recognise the three traps that cost marks: reading the picture, confusing the pairs, and applying a criterion outside its condition.*

**4:30–4:38** — The procedure. Count the vertices and the edges, check the degrees, find the components, then ask what the question wants broken.

> Caption: The procedure: count vertices and edges, check the degrees, find the components, then ask what the question wants broken.

**4:38–4:45** — Trap one. Read the structure, not the picture. Two drawings of the same graph have the same answers.

> Caption: Trap one: reading the picture instead of the structure. Two drawings of the same graph look different and answer the same.

Exam-trap caption mode adds: *A crossing in the drawing is not a vertex. Two edges that cross on the page share no vertex unless a dot is drawn there.*

**4:45–4:53** — Trap two. Do not confuse a cut vertex with a bridge, or Euler with Hamilton. Each pair counts different objects.

> Caption: Trap two: confusing a cut vertex with a bridge, or Euler with Hamilton. Each pair counts different objects.

Exam-trap caption mode adds: *Answering the cut-vertex count when the question asked for bridges is a whole mark, and the two numbers usually differ.*

**4:53–5:00** — Trap three. Every criterion has a condition. Check the condition before you use the criterion.

> Caption: Trap three: applying a criterion outside its condition. The all-even-degrees test needs every edge in one component.

Exam-trap caption mode adds: *Every criterion in this lesson has a hypothesis. A remembered formula applied to a graph that fails the hypothesis is the commonest way to lose this mark.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
