# Articulation Points Bridges And Blocks — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/articulation-points-bridges-and-blocks/index.html`
- Total duration: 5:50 (350 seconds), 12 scenes, 46 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One failure, two questions

*0:00 – 0:30 · objective: separate the vertex question from the edge question, and see that both are questions about the component count*

**0:00–0:08** — Here is a road network with one failure to survive. Two questions follow. If one junction closes, can every town still reach every other? And if one road closes, can every town still reach every other?

> Caption: A road network, one failure, two questions. Close a junction and see what happens; close a road and see what happens.

**0:08–0:16** — Closing a junction removes the vertex and every road that touches it. Closing a road removes only that road: both of its endpoints are still there, and the traffic that used them is only forbidden from using that one link.

> Caption: Closing a junction removes the vertex and every road at it. Closing a road removes only that road, and both of its ends survive.

**0:16–0:24** — So these are different objects, and a map can be fragile against one and robust against the other. A pair of loops that share a single junction is exactly that: no road is critical, and the junction is.

> Caption: So a junction and a road are different objects, and a map can be fragile against one kind of failure and robust against the other.

**0:24–0:30** — One depth-first search answers both questions at once, and a little bookkeeping on the same search cuts the edge set into the pieces that survive. That is the plan for the rest of the lesson.

> Caption: One depth-first search answers both, and also cuts the edges into the pieces that survive a failure. That is the plan.

## Scene 2. Definitions by deletion

*0:30 – 0:58 · objective: define articulation point, bridge and block by what deleting the object does, and read the consequence that blocks partition the edges*

**0:30–0:38** — An articulation point, or cut vertex, is a vertex whose deletion raises the number of connected components of the graph. That is a definition by deletion: it says what happens, not how to find out cheaply.

> Caption: An articulation point is a vertex whose deletion raises the number of connected components. That is the definition, not a test.

**0:38–0:46** — A bridge, or cut edge, is an edge whose deletion raises the component count. Both of its endpoints survive the deletion, which makes it a strictly weaker demand than the vertex version: fewer things qualify.

> Caption: A bridge is an edge whose deletion raises the component count. Both endpoints survive, so it is a weaker demand than the vertex version.

**0:46–0:52** — A biconnected component, or block, is a maximal set of edges such that any two edges in the set lie on a common simple cycle. The binding agent is the loop: two edges belong together when one cycle carries both.

> Caption: A block is a maximal set of edges any two of which lie on a common simple cycle. Loops are what tie edges together.

**0:52–0:58** — Two consequences follow immediately. The blocks partition the edges, because lying on a common cycle is an equivalence relation on edges. And a bridge is a block of exactly one edge, because an edge on no cycle has no partner.

> Caption: Consequence: the blocks partition the edges, and a bridge is a block of exactly one edge.

## Scene 3. An undirected search has only two kinds of edge

*0:58 – 1:30 · objective: see why a depth-first search of an undirected graph produces tree edges and back edges and nothing else*

**0:58–1:06** — Here is the graph the lesson works on: twelve vertices, fifteen edges. The search starts at J, which is a leaf, and that choice is deliberate, because the root of a search needs a different rule and starting at a leaf forces us to face it.

> Caption: The graph: twelve vertices, fifteen edges. Search it from J, a leaf, so that the root rule cannot be dodged.

**1:06–1:14** — The search produces eleven tree edges and four back edges. Eleven plus four is fifteen, which is every edge of the graph, and there is no third kind of edge to account for.

> Caption: The search produces eleven tree edges and four back edges. Fifteen edges, and no third kind.

**1:14–1:22** — There is no third kind. A cross edge would join two branches of the search tree, and the moment the search stood at the first of its endpoints it would have crossed into the other branch, so the two would have been one branch.

> Caption: There are no cross edges in an undirected search: an edge between two branches would have been taken, and the second branch would have become the first.

Exam-trap caption mode adds: *A question that offers "cross edge" as a classification of an edge in an undirected DFS is offering a wrong answer. Only tree and back edges occur.*

**1:22–1:30** — This is why one number per vertex is enough. The only way out of a subtree is a back edge climbing to an ancestor, so recording the earliest ancestor any vertex below can reach tells us everything about whether the subtree is sealed off.

> Caption: So the only way out of a subtree is a back edge climbing to an ancestor. One number per vertex can record how high it climbs.

## Scene 4. disc and low on the twelve-vertex graph

*1:30 – 2:06 · objective: read the discovery time and compute the low-link value bottom-up on the drawn graph*

**1:30–1:38** — The discovery time of a vertex is the order in which the search enters it. J is zero because the search starts there, I is one, and the chain runs down the graph to A at nine, then L at ten and K at eleven as the search backs up and takes the remaining branches.

> Caption: The discovery time is the order in which the search enters a vertex. J is 0, I is 1, and the chain runs down to K at 11.

**1:38–1:48** — The low value of a vertex is the smallest discovery time reachable from it, taking the minimum of three things: its own discovery time, the discovery time of anything a back edge from it reaches, and the low value of each of its children.

> Caption: low of a vertex is the smallest discovery time it can reach, using its own value, one back edge, and the low values of its children.

**1:48–1:58** — Filled bottom-up, the values tell the story of the cycles. A climbs back to C, so the low value of A is seven, the discovery time of C. G climbs to I, so the low value of G is one. D takes the smallest of its three children: C gives seven, K gives eleven, L gives four, so D is four.

> Caption: Filled bottom-up: A climbs to C, so low of A is 7. G climbs to I, so low of G is 1. D takes the smallest of its three children.

**1:58–2:06** — The comparison is the whole method. A low value below the discovery time of the parent means the subtree escapes above that parent. A low value equal to it, or above it, means the subtree cannot get past the parent at all.

> Caption: A low value below the discovery time means the subtree escapes above the vertex. Equal or above means it does not.

## Scene 5. The articulation test: greater or equal

*2:06 – 2:36 · objective: apply low[v] >= disc[u] at every non-root vertex with a child, and see why equality is enough*

**2:06–2:14** — Here is the test for vertices. Take a vertex u that is not the root, and one of its children v. If the low value of v is greater than or equal to the discovery time of u, then u is an articulation point.

> Caption: Take a non-root vertex u with a child v. If low of v is at least the discovery time of u, then u is an articulation point.

**2:14–2:24** — Why is that enough? Because deleting u removes u itself and every edge at it, including any back edge that ended at u. The subtree of v then has no way up at all, and the graph splits into that subtree and the rest.

> Caption: Why: deleting u removes every back edge that ended at u. The subtree of v then has no way up, so the graph splits there.

Exam-trap caption mode adds: *The vertex test is >=, not >. Using > silently misses every articulation point whose child climbs back exactly to it, and the smallest graph that shows the miss has four vertices.*

**2:24–2:30** — On the drawn graph, D has three children. C gives a low value of seven against a discovery time of six, and K gives eleven against six, so both of those subtrees are sealed off when D goes. L gives four, which is below six, so that one escapes.

> Caption: On the graph: D has three children. C gives 7 against 6, K gives 11 against 6, so D is cut off from two of them.

**2:30–2:36** — Applying the test everywhere gives five articulation points: C, D, F, G and I. E and H are not, because their single child climbs above them. The leaves are not, and the root is not, but the root needs a different argument.

> Caption: Five articulation points: C, D, F, G and I. Not E, not H, not the leaves, and not the root.

## Scene 6. The bridge test: strictly greater

*2:36 – 3:02 · objective: apply low[v] > disc[u] to the tree edges, and see the same edge fail it while its parent passes the vertex test*

**2:36–2:44** — Here is the test for edges, and it is almost the same. For a tree edge from u down to v, the edge is a bridge exactly when the low value of v is strictly greater than the discovery time of u. Strictly greater, not greater or equal.

> Caption: For a tree edge from u to v, the edge is a bridge exactly when low of v is strictly greater than the discovery time of u.

**2:44–2:52** — The equality case is not hypothetical here. The edge from F down to E has a low value of four at E, which is exactly the discovery time of F. The strict test fails, so this edge is not a bridge: remove it and the piece stays together.

> Caption: The equality case is live on this graph: edge F to E has low of E equal to 4, the discovery time of F. Not a bridge.

**2:52–2:58** — And yet F is an articulation point, because the same edge passes the weak test. This is the pair to remember: one edge, one number, two different answers, and the difference is whether the vertex at the top survives the deletion.

> Caption: But F is still an articulation point, because the same edge passes the weak test. Equality splits the two answers.

Exam-trap caption mode adds: *A question that says low[v] equals disc[u] is testing exactly this: the vertex is a cut vertex and the edge is not a bridge.*

**2:58–3:02** — Where the inequality is strict, the edge is a bridge. C down to D qualifies, because seven is greater than six, and so do D to K, F to G and I to J. Four bridges, and the page checks each by deleting it.

> Caption: Where it is strictly greater, the edge is a bridge: C to D, because 7 is greater than 6.

## Scene 7. The root is asked a different question

*3:02 – 3:28 · objective: see the vertex test lie at the root of the search, and replace it with the two-children rule*

**3:02–3:10** — Now the root. The search started at J, which has one child, I, and the low value of I is one, which is at least the discovery time of J, which is zero. The vertex test, applied here, says J is an articulation point.

> Caption: The root here is J, with one child I. Low of I is 1, at least the discovery time of J, which is 0. The test says yes.

**3:10–3:18** — The test is wrong here. Delete J, and the eleven remaining vertices are still joined: the graph stays in one piece. So J is not an articulation point, and the test that just said it was cannot be applied at the root.

> Caption: The test is wrong here. Delete J and the graph is still connected: J is not an articulation point at all.

Exam-trap caption mode adds: *Applying the vertex test at the root flags every root of every graph, which turns a correct answer into a wrong one on any question that counts articulation points.*

**3:18–3:24** — Ask the direct question instead. Deleting the root leaves one piece per child subtree, and no edge joins two of them, because such an edge would have made them one subtree during the search. So the root is an articulation point exactly when it has at least two children.

> Caption: Ask the direct question instead: the root is an articulation point exactly when it has at least two children.

**3:24–3:28** — The smallest graph where forgetting this goes wrong is a single edge. The root has one child, the weak test holds, and the root is flagged. Two vertices and one edge: that is the smallest counterexample, found by searching graphs in order of size.

> Caption: The smallest graph where forgetting this goes wrong is a single edge: one child, and the test would flag the root.

## Scene 8. Blocks: pop the edge stack

*3:28 – 4:04 · objective: push every traversed edge, pop at every weak tree edge, and count seven blocks out of fifteen edges*

**3:28–3:36** — Now the pieces that survive. Keep a stack of edges. Push each tree edge as the search takes it, and push each back edge as the search finds one. Nothing is popped until a block is complete.

> Caption: Now the pieces. Keep a stack of edges: push each tree edge as the search takes it, and push each back edge as it finds one.

**3:36–3:46** — When the search finishes a child v of u, and the low value of v is at least the discovery time of u, pop edges off the stack until the edge from u to v comes off. The popped set is one block, complete and maximal.

> Caption: When the search finishes a child v and low of v is at least the discovery time of u, pop down to the edge from u to v. That set is one block.

**3:46–3:56** — Seven tree edges satisfy the weak test, so seven blocks come out: the triangle on A, B and C; the single edge C to D; the single edge D to K; the four-vertex piece on D, E, F and L; the single edge F to G; the triangle on G, H and I; and the single edge I to J.

> Caption: Seven pops, seven blocks: the triangle ABC, the bridge CD, the bridge DK, the four-vertex piece, the bridge FG, the triangle GHI, the bridge IJ.

**3:56–4:04** — Three plus one plus one plus five plus one plus three plus one is fifteen, which is every edge of the graph, and no edge is in two blocks. The partition is checked on the page against the brute-force definition: two edges together when a common cycle carries both.

> Caption: Three, one, one, five, one, three, one: fifteen edges, and every one of them in exactly one block.

## Scene 9. The block-cut tree, and the counting identities

*4:04 – 4:34 · objective: build the block-cut tree from the blocks and the cut vertices, and read two counts off it*

**4:04–4:12** — Draw one node for each block and one node for each articulation point, and join a point to a block exactly when the point lies in that block. The result is the block-cut tree, and it records the whole structure of the graph in one picture.

> Caption: Draw one node per block and one per articulation point, and join a point to a block when the point lies in it. The block-cut tree.

**4:12–4:20** — Here that is twelve nodes and eleven edges: seven blocks plus five articulation points, and eleven edges is exactly one fewer than twelve, so the result is a tree. It always is, for a connected graph.

> Caption: Twelve nodes and eleven edges: seven blocks plus five points, and it is a tree, as it must be for a connected graph.

**4:20–4:28** — One counting identity falls out. Add up the number of vertices in each block: three plus two plus two plus four plus two plus three plus two is eighteen. That equals the twelve vertices, plus one extra copy for every block past the first that a vertex belongs to: six here, from C, D, F, G and I.

> Caption: A counting identity: the block sizes add up to the vertices, plus one extra copy for every block past the first that a vertex is in. Eighteen is twelve plus six.

**4:28–4:34** — The tree also gives the criterion in one line. A vertex is an articulation point exactly when it lies in two or more blocks, because that is exactly when deleting it separates one block from another.

> Caption: And the criterion: a vertex is an articulation point exactly when it lies in two or more blocks.

## Scene 10. Four beliefs, each refuted by the smallest example

*4:34 – 5:04 · objective: see the smallest graph on which each of four common beliefs fails, found by search rather than chosen*

**4:34–4:42** — First belief: that the vertex test can use the strict inequality, the same one as the edge test. It fails on four vertices: a pendant edge from A into a triangle on B, C and D. At B the child C climbs back exactly to B, so B is a cut vertex, and the strict test misses it entirely.

> Caption: First belief: the vertex test can use the strict inequality. It fails first on four vertices: a pendant edge into a triangle.

Exam-trap caption mode adds: *Swapping the two symbols is the most common error in this topic, and it costs the articulation points whose children climb back exactly to them.*

**4:42–4:50** — Second belief: that a graph with no bridge has no articulation point. The bowtie refutes it: two triangles sharing exactly one vertex, five vertices and six edges. Every edge lies on a cycle, so no edge is a bridge, and the shared vertex is an articulation point.

> Caption: Second: no bridge means no articulation point. The bowtie refutes it: two triangles sharing one vertex.

**4:50–4:58** — Third belief: that every bridge has an articulation point at one of its ends. A single edge refutes it. The edge is a bridge, and both of its endpoints have degree one, so neither is an articulation point.

> Caption: Third: every bridge has an articulation point at one end. A single edge refutes it: the edge is a bridge and neither end is a cut vertex.

**4:58–5:04** — Fourth belief: that deleting an articulation point adds exactly one component. A star with three leaves adds two: one piece becomes three. The increase is the number of children in the search tree, which the root rule bounds below by two. For a bridge, by contrast, the increase is always exactly one.

> Caption: Fourth: deleting an articulation point adds exactly one component. A star with three leaves adds two.

## Scene 11. Two previous-year items, recomputed

*5:04 – 5:34 · objective: settle the four statements of the 2021 item and the four options of the 2015 item from the definitions*

**5:04–5:12** — GATE CSE 2021, Set 1 asks which four statements about articulation points and a depth-first search tree are correct. The four are about all paths passing through the point, a leaf of the tree being a point, the root with two children, and the root never being one.

> Caption: GATE CSE 2021, Set 1: four statements about articulation points and a DFS tree. One of them survives.

**5:12–5:20** — Three of the four fail, each on the smallest graph that breaks it. All paths need not pass through the point: on four vertices, the ancestor and the descendant are joined directly. A leaf of the search tree is never an articulation point: no graph up to six vertices has one. And a root can certainly be one: three vertices in a path, searched from an end.

> Caption: Three fail. All paths need not pass through u: four vertices suffice. A leaf is never a point: nothing found up to six vertices. A root can be one: three vertices.

**5:20–5:28** — The statement that survives is the root rule: the root of the search tree is an articulation point if and only if it has at least two children. It agrees with brute force on every graph with five and six vertices, searched from every possible start vertex.

> Caption: The survivor is the root rule: the root is an articulation point if and only if it has two or more children. Verified on every graph to six vertices.

**5:28–5:34** — GATE CSE 2015, Set 2 asks for the true statement about bridges, and the answer is that a bridge cannot be part of a simple cycle: an edge on a cycle has a detour, so removing it changes nothing. The page checks the contrapositive over every graph to six vertices, and no bridge ever shared a block with another edge.

> Caption: GATE CSE 2015, Set 2: a bridge cannot lie on a simple cycle. Checked directly: no bridge ever shared a block with another edge.

## Scene 12. The procedure, in five steps

*5:34 – 5:50 · objective: consolidate the one search, the two tests and the block stack into a procedure that answers any question in the topic*

**5:34–5:42** — The procedure is one search. Record the discovery time on the way in, compute the low value on the way out, and classify each edge as a tree edge or a back edge. Everything else in the topic is a comparison against those two numbers.

> Caption: One search. Record the discovery time on the way in, compute the low value on the way out, classify each edge as tree or back.

**5:42–5:50** — Then apply three comparisons. The weak test for vertices, with the root rule instead of the test at the root. The strict test for edges. And the pop at every weak tree edge for the blocks. If time allows, check one of the three answers by deleting a vertex or an edge and recounting the pieces.

> Caption: Then: weak test for vertices with the root rule, strict test for edges, pop the stack for blocks. Check one answer by deletion.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
