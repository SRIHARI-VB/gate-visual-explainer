# Graph Algorithms: Traversals, MSTs and Shortest Paths — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/graph-traversals-mst-shortest-paths/index.html`
- Total duration: 5:30 (330 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A graph, a representation, and three different questions

*0:00 – 0:30 · objective: Separate the three things GATE asks about graphs - can I reach it, how cheaply can I connect everything, how cheaply can I travel - and see that each has its own algorithm.*

**0:00–0:07** — A graph is a set of vertices and a set of edges. An algorithm is handed one of two representations, and the choice changes its running time.

> Caption: A graph is a set of vertices and a set of edges. An algorithm is handed one of two representations, and the choice changes its running time.

Exam-trap caption mode adds: *The same algorithm has two costs, one per representation. A question that names the algorithm but not the representation has not fixed the answer, so a good answer names both.*

**0:07–0:15** — The first question is reachability: starting from a source, which vertices can I get to, and how far away are they in edges?

> Caption: The first question is reachability: starting from a source, which vertices can I get to, and how far away are they in edges?

Exam-trap caption mode adds: *Distance in edges is not distance in weight. A vertex three edges away can be cheaper to reach than a vertex one edge away, once edges carry weights.*

**0:15–0:22** — The second question is connection: can I join every vertex into one tree of minimum total weight? That is the minimum spanning tree.

> Caption: The second question is connection: can I join every vertex into one tree of minimum total weight? That is the minimum spanning tree.

Exam-trap caption mode adds: *A minimum spanning tree is not a shortest-path tree. The tree that minimises the total weight can make the path between two particular vertices much longer than necessary.*

**0:22–0:30** — The third question is travel: from one source, what is the cheapest route to every other vertex? Three families answer it, and which one is legal depends on the weights.

> Caption: The third question is travel: from one source, what is the cheapest route to every other vertex? Three families answer it, and which one is legal depends on the weights.

Exam-trap caption mode adds: *The three families are not interchangeable. Choosing Dijkstra because it is fastest, on a graph with a negative edge, gives a wrong number rather than a slow one.*

## Scene 2. Breadth-first search: a queue, levels, and a shortest-path tree

*0:30 – 1:00 · objective: Watch the frontier expand one level at a time, and see why a BFS tree records the fewest-edges distance from the source.*

**0:30–0:37** — Breadth-first search from A. A holds a queue, and the source goes in first with distance zero.

> Caption: Breadth-first search from A. A holds a queue, and the source goes in first with distance zero.

Exam-trap caption mode adds: *Marking on dequeue instead of enqueue lets a vertex enter the queue several times, and the running time then depends on the number of paths rather than the number of edges.*

**0:37–0:45** — Dequeue A, and give every unvisited neighbour the distance one and a place in the queue. That is level one: B and C.

> Caption: Dequeue A, and give every unvisited neighbour the distance one and a place in the queue. That is level one: B and C.

Exam-trap caption mode adds: *The order inside a level depends on the adjacency order, so the BFS order is not unique. The level of each vertex is unique, and that is the part questions ask about.*

**0:45–0:52** — Level two is D, E and F; level three is G; level four is H. The tree records one shortest route to each vertex.

> Caption: Level two is D, E and F; level three is G; level four is H. The tree records one shortest route to each vertex.

Exam-trap caption mode adds: *A BFS tree is a shortest-path tree only when every edge costs the same. Put weights on the edges and the tree stops being shortest.*

**0:52–1:00** — Every edge that is not in the BFS tree joins two vertices whose levels differ by at most one. That is the property GATE asked about in 2015.

> Caption: Every edge that is not in the BFS tree joins two vertices whose levels differ by at most one. That is the property GATE asked about in 2015.

Exam-trap caption mode adds: *The difference can be zero, one or minus one. The value that cannot occur is any magnitude of two or more, which is why the 2015 answer is the option giving two.*

## Scene 3. Depth-first search: a stack, timestamps, and back edges

*1:00 – 1:30 · objective: Follow one branch to the end, and read discovery and finish times off the recursion to classify every edge.*

**1:00–1:07** — Depth-first search from A. Instead of a queue it uses a stack, which is what a recursive call amounts to.

> Caption: Depth-first search from A. Instead of a queue it uses a stack, which is what a recursive call amounts to.

Exam-trap caption mode adds: *Recursion depth is not the number of vertices. It is the longest path followed before a return, which is why a DFS can overflow a small stack on a long chain.*

**1:07–1:15** — Discovery times are written on the way in: A gets one, B two, D three, and so on down the chain to H at eight.

> Caption: Discovery times are written on the way in: A gets one, B two, D three, and so on down the chain to H at eight.

Exam-trap caption mode adds: *The discovery time is not the distance from the source. H is discovered eighth and sits four edges from A, while in a different graph the eighth discovery could be two edges away.*

**1:15–1:22** — Finish times are written on the way out, so every vertex finishes after all of its descendants. That nesting is the parenthesis property.

> Caption: Finish times are written on the way out, so every vertex finishes after all of its descendants. That nesting is the parenthesis property.

Exam-trap caption mode adds: *Timestamps are not comparable across different runs. Two correct runs on the same graph can number the vertices differently, so a question must fix the adjacency order before asking for a time.*

**1:22–1:30** — Three edges are not in the DFS tree: A-C, D-E and C-F. Each joins a vertex to its own ancestor, so each is a back edge.

> Caption: Three edges are not in the DFS tree: A-C, D-E and C-F. Each joins a vertex to its own ancestor, so each is a back edge.

Exam-trap caption mode adds: *The claim "no cross edges" is a property of undirected graphs only. In a directed graph a cross edge between two finished branches is perfectly possible, and that is what makes SCC algorithms work.*

## Scene 4. BFS or DFS: what each one actually guarantees, and what it costs

*1:30 – 2:00 · objective: Hold the two traversals against each other on guarantee, cost and use, and kill the claim that a DFS tree is a shortest-path tree.*

**1:30–1:37** — Both traversals visit every vertex and every edge once, so both cost the number of vertices plus the number of edges on a list.

> Caption: Both traversals visit every vertex and every edge once, so both cost the number of vertices plus the number of edges on a list.

Exam-trap caption mode adds: *The two costs coincide on a dense graph and differ enormously on a sparse one. Saying a traversal is linear without naming the representation is an incomplete answer.*

**1:37–1:45** — BFS gives the fewest-edges distance. DFS gives no distance at all, and on this graph its tree is seven levels deep where BFS needs four.

> Caption: BFS gives the fewest-edges distance. DFS gives no distance at all, and on this graph its tree is seven levels deep where BFS needs four.

Exam-trap caption mode adds: *This is the 2025 statement that a DFS tree is a shortest-path tree. It is false, and this one graph is the refutation, not an illustration of a difficulty.*

**1:45–1:52** — So each traversal is the tool for a different job: BFS for distance and levels, DFS for structure, cycles, and order.

> Caption: So each traversal is the tool for a different job: BFS for distance and levels, DFS for structure, cycles, and order.

Exam-trap caption mode adds: *Both find connected components of an undirected graph, so a statement saying only one can is false. The split appears in directed graphs and in structural questions.*

**1:52–2:00** — Neither traversal looks at weights, so neither can answer a question about cost. Weighted questions need the two algorithms of the next scenes.

> Caption: Neither traversal looks at weights, so neither can answer a question about cost. Weighted questions need the two algorithms of the next scenes.

Exam-trap caption mode adds: *Reading a BFS off a weighted graph and calling the result shortest is the single most common mistake in this topic. It answers an unweighted question that was not asked.*

## Scene 5. The cut property and the cycle property: which edges an MST must contain

*2:00 – 2:30 · objective: Use the two properties that make Kruskal and Prim correct, and separate "minimum weight" from "unique".*

**2:00–2:07** — A cut splits the vertices into two groups. An edge crosses the cut when its two ends are in different groups.

> Caption: A cut splits the vertices into two groups. An edge crosses the cut when its two ends are in different groups.

Exam-trap caption mode adds: *The cut is a partition of the vertices, not of the edges. An edge inside one side of the cut is irrelevant to it, however heavy or light it is.*

**2:07–2:15** — The cut property: the lightest edge crossing a cut belongs to some minimum spanning tree. If its weight is unique, it belongs to every one.

> Caption: The cut property: the lightest edge crossing a cut belongs to some minimum spanning tree. If its weight is unique, it belongs to every one.

Exam-trap caption mode adds: *The property gives membership in some minimum tree, not in all of them. Uniqueness of the weight is what upgrades the claim, and without it a tie can send different trees different ways.*

**2:15–2:22** — The cycle property: the heaviest edge on a cycle belongs to no minimum spanning tree, provided it is strictly heavier than the rest.

> Caption: The cycle property: the heaviest edge on a cycle belongs to no minimum spanning tree, provided it is strictly heavier than the rest.

Exam-trap caption mode adds: *Strictly heavier is required. If the cycle has two edges of the same maximum weight, one of them may well be in a minimum tree, so the property as usually quoted needs its condition.*

**2:22–2:30** — Distinct weights force a unique minimum tree, but a unique minimum tree does not need distinct weights. The implication runs one way only.

> Caption: Distinct weights force a unique minimum tree, but a unique minimum tree does not need distinct weights. The implication runs one way only.

Exam-trap caption mode adds: *A question that says "weights are distinct, so the minimum tree is unique" is using the true direction. A question that concludes "the minimum tree is unique, so the weights are distinct" is using the false one.*

## Scene 6. Kruskal: sort the edges, then refuse to make a cycle

*2:30 – 3:00 · objective: Run Kruskal on a six-vertex graph, see the union-find decide each edge, and get a total of 24.*

**2:30–2:37** — Kruskal sorts all nine edges by weight and walks the list once, from the lightest to the heaviest.

> Caption: Kruskal sorts all nine edges by weight and walks the list once, from the lightest to the heaviest.

Exam-trap caption mode adds: *The sort dominates the running time, so Kruskal is m log m, not m. Saying it is linear because the scan is linear leaves out the expensive half.*

**2:37–2:45** — An edge is accepted unless its two endpoints are already connected. Union-find answers that question in almost constant time per edge.

> Caption: An edge is accepted unless its two endpoints are already connected. Union-find answers that question in almost constant time per edge.

Exam-trap caption mode adds: *The rejection test is connectivity, not "does this edge form a triangle". A long cycle is rejected exactly the same way, on its last edge, when both ends are already in one component.*

**2:45–2:52** — Five edges are accepted and four are rejected. The accepted set is B-C, A-B, B-D, D-F and E-F, with total weight 24.

> Caption: Five edges are accepted and four are rejected. The accepted set is B-C, A-B, B-D, D-F and E-F, with total weight 24.

Exam-trap caption mode adds: *Stopping as soon as five edges are accepted is correct only when the graph is connected. On a disconnected graph the forest has fewer edges and the answer is a minimum spanning forest.*

**2:52–3:00** — Why it is correct: every accepted edge is the lightest edge across the cut formed by its two components at that moment, so the cut property applies.

> Caption: Why it is correct: every accepted edge is the lightest edge across the cut formed by its two components at that moment, so the cut property applies.

Exam-trap caption mode adds: *This argument depends on processing in sorted order. Take the edges in an arbitrary order, accept every edge that does not close a cycle, and you get a spanning tree that is usually not minimum.*

## Scene 7. Prim: grow one tree and keep the cheapest way out

*3:00 – 3:30 · objective: Run Prim from the same vertex, read the key array round by round, and get the same total weight from a different set of edges.*

**3:00–3:07** — Prim also starts at A, but it grows one tree instead of a forest. Every vertex outside the tree keeps a key: the cheapest edge joining it to the tree.

> Caption: Prim also starts at A, but it grows one tree instead of a forest. Every vertex outside the tree keeps a key: the cheapest edge joining it to the tree.

Exam-trap caption mode adds: *The key of a vertex is a single edge weight, not a path length. Prim is not accumulating distance, which is exactly what separates it from Dijkstra.*

**3:07–3:15** — Extract the smallest key, add that vertex, then lower the keys of its neighbours. From A, B and C both offer four, so the tie is broken by the rule this page states.

> Caption: Extract the smallest key, add that vertex, then lower the keys of its neighbours. From A, B and C both offer four, so the tie is broken by the rule this page states.

Exam-trap caption mode adds: *Kruskal and Prim can return different edge sets and must return the same total weight. A question asking for the weight has one answer; one asking for the edges may have several.*

**3:15–3:22** — The extraction order is A, C, B, D, F, E and the total is 24, the same number Kruskal produced by a different route.

> Caption: The extraction order is A, C, B, D, F, E and the total is 24, the same number Kruskal produced by a different route.

Exam-trap caption mode adds: *Agreement between the two algorithms is a check on the arithmetic, not a proof of either. Both are proved by the cut property, and the agreement follows from that.*

**3:22–3:30** — The cost depends on the data structure: a binary heap gives E log V, a plain array scanning for the minimum gives V squared.

> Caption: The cost depends on the data structure: a binary heap gives E log V, a plain array scanning for the minimum gives V squared.

Exam-trap caption mode adds: *Neither is simply "the complexity of Prim". GATE has asked for both, and the correct answer follows the data structure named in the question, not the algorithm name.*

## Scene 8. Counting minimum spanning trees: the GATE 2024 question

*3:30 – 4:00 · objective: Collapse forced edges into components, count the independent choices, and reach 9 the way the official key does.*

**3:30–3:37** — The 2024 question gives a seven-vertex graph and asks how many distinct minimum spanning trees it has.

> Caption: The 2024 question gives a seven-vertex graph and asks how many distinct minimum spanning trees it has.

Exam-trap caption mode adds: *Distinct means a different set of edges. Two trees that differ only in which endpoint is called the parent are the same tree, and an undirected tree has no parent.*

**3:37–3:45** — All four weight-one edges are forced. No cheaper path joins their endpoints, so by the cut property every minimum tree contains all four.

> Caption: All four weight-one edges are forced. No cheaper path joins their endpoints, so by the cut property every minimum tree contains all four.

Exam-trap caption mode adds: *Being light is not the same as being forced. An edge is forced when no equal or lighter alternative path exists between its endpoints, which has to be checked rather than assumed.*

**3:45–3:52** — Those four edges collapse the graph into three pieces: the pair A, B, F; the triple C, D, E; and the centre vertex G on its own.

> Caption: Those four edges collapse the graph into three pieces: the pair A, B, F; the triple C, D, E; and the centre vertex G on its own.

Exam-trap caption mode adds: *Counting the ways to pick two of the six weight-two edges gives fifteen, which is wrong. Most pairs leave a piece unconnected or close a cycle.*

**3:52–4:00** — One edge must join G to the first piece and one to the second, chosen independently: three ways each, so nine trees, total weight eight.

> Caption: One edge must join G to the first piece and one to the second, chosen independently: three ways each, so nine trees, total weight eight.

Exam-trap caption mode adds: *The multiplication is valid only because the two choices are independent. If a single edge could serve both pieces, the product would double-count.*

## Scene 9. Dijkstra: settle the nearest unsettled vertex, then relax its edges

*4:00 – 4:30 · objective: Trace extraction and relaxation on a directed graph, and see that a settled distance is never revised.*

**4:00–4:07** — Dijkstra on a directed graph with non-negative weights. Every distance starts at infinity except the source, which is zero.

> Caption: Dijkstra on a directed graph with non-negative weights. Every distance starts at infinity except the source, which is zero.

Exam-trap caption mode adds: *The tentative distance is not a distance until the vertex is settled. Reading the array mid-run and calling the numbers the answer is the most common tracing error.*

**4:07–4:15** — Settle s, then relax: A becomes four and B becomes one. B is the smallest unsettled, so B is settled next.

> Caption: Settle s, then relax: A becomes four and B becomes one. B is the smallest unsettled, so B is settled next.

Exam-trap caption mode adds: *Settling order is by tentative distance, not by label and not by discovery order. A vertex with a large label can be settled before a vertex with a small one.*

**4:15–4:22** — B settles at one and improves A to three. Then A at three, D at seven, C at eight, and finally T at eight.

> Caption: B settles at one and improves A to three. Then A at three, D at seven, C at eight, and finally T at eight.

Exam-trap caption mode adds: *The route to T is s-B-D-T at eight, not the direct-looking s-A-T at fifteen. Reading the parent array is how the route is recovered, and the parent of T is D.*

**4:22–4:30** — The guarantee rests on one fact: once a vertex is settled, no later route can be shorter, because every edge is non-negative.

> Caption: The guarantee rests on one fact: once a vertex is settled, no later route can be shorter, because every edge is non-negative.

Exam-trap caption mode adds: *That argument needs every edge to be non-negative. One negative edge breaks the step where a route through an unsettled vertex is assumed no cheaper, and the algorithm then reports a wrong number silently.*

## Scene 10. Where Dijkstra breaks, and the three algorithms that do not

*4:30 – 5:00 · objective: Watch a negative edge make Dijkstra report 2 for a vertex whose true distance is 1, then place Bellman-Ford, DAG shortest path and Floyd-Warshall against it.*

**4:30–4:37** — Four vertices, one negative edge: s to A costs one, s to B costs two, and B to A costs minus two. The true distance to A is zero.

> Caption: Four vertices, one negative edge: s to A costs one, s to B costs two, and B to A costs minus two. The true distance to A is zero.

Exam-trap caption mode adds: *A negative edge is not the same as a negative cycle. This graph has no cycle at all, so shortest paths are perfectly well defined; the difficulty is entirely Dijkstra's.*

**4:37–4:45** — Dijkstra settles A at one, before B is even considered, and never revisits it. It reports two for T where the answer is one.

> Caption: Dijkstra settles A at one, before B is even considered, and never revisits it. It reports two for T where the answer is one.

Exam-trap caption mode adds: *The failure is silent. Nothing crashes, no flag is raised, and the array looks plausible. Only a second algorithm, or an explicit check for negative weights, catches it.*

**4:45–4:52** — Bellman-Ford relaxes every edge once per round, for one round fewer than there are vertices, and gets the true distances.

> Caption: Bellman-Ford relaxes every edge once per round, for one round fewer than there are vertices, and gets the true distances.

Exam-trap caption mode adds: *The round count is vertices minus one, not vertices. Running one extra round is the detection step, not part of the distance computation.*

**4:52–5:00** — Three more tools: one topological pass on a DAG, Floyd-Warshall for all pairs, and the rule that picks between them.

> Caption: Three more tools: one topological pass on a DAG, Floyd-Warshall for all pairs, and the rule that picks between them.

Exam-trap caption mode adds: *Floyd-Warshall tolerates negative edges but not negative cycles, and it costs the cube of the vertex count. Using it for a single source on a sparse graph is legal and wasteful.*

## Scene 11. One table: the question, the algorithm, the cost, the guarantee

*5:00 – 5:30 · objective: Choose the right algorithm in four questions, and hold the seven costs in one row of memory.*

**5:00–5:07** — Ask four questions in order. Is there a source, or do I need all pairs? Are there weights? Are any weights negative? Is the graph acyclic?

> Caption: Ask four questions in order. Is there a source, or do I need all pairs? Are there weights? Are any weights negative? Is the graph acyclic?

Exam-trap caption mode adds: *The order matters. Asking "which is fastest" first leads to Dijkstra on a graph that has a negative edge, which is the wrong answer with the right running time.*

**5:07–5:15** — BFS and DFS cost V plus E on a list and V squared on a matrix. Kruskal costs E log E. Prim costs E log V with a heap or V squared with an array.

> Caption: BFS and DFS cost V plus E on a list and V squared on a matrix. Kruskal costs E log E. Prim costs E log V with a heap or V squared with an array.

Exam-trap caption mode adds: *E log E and E log V are both correct for Kruskal, since E is at most V squared and the log differs by a constant factor. Both are accepted; E log V is the more usual form.*

**5:15–5:22** — Dijkstra costs E log V, Bellman-Ford V times E, a DAG pass V plus E, and Floyd-Warshall V cubed.

> Caption: Dijkstra costs E log V, Bellman-Ford V times E, a DAG pass V plus E, and Floyd-Warshall V cubed.

Exam-trap caption mode adds: *Dijkstra with a plain array is V squared, not E log V. The heap is what buys the logarithm, and GATE has asked for both versions.*

**5:22–5:30** — One sentence to keep: a minimum spanning tree minimises the total, a shortest-path tree minimises each route, and the two are different trees.

> Caption: One sentence to keep: a minimum spanning tree minimises the total, a shortest-path tree minimises each route, and the two are different trees.

Exam-trap caption mode adds: *Every MST question and every shortest-path question is a different question. An answer that uses one to settle the other is wrong even when the numbers happen to look reasonable.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
