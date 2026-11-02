# 2-Edge-Connected Components and the Bridge Tree: Two Edge-Disjoint Routes, the Contraction, and the Leaves That Set the Augmentation — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/two-edge-connected-components-and-the-bridge-tree/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One cable, two halves

*0:00 – 0:30 · objective: see that a single edge can be the only link between two regions, and count how many such edges a network has*

**0:00–0:07** — Here is a network of fourteen stations. Look at the cable between station two and station three. Every message from the left three stations to anywhere else has to cross it, because it is the only link that joins the two sides.

> Caption: This network has fourteen stations. One cable, between station 2 and station 3, is the only link between the left region and the rest.

**0:07–0:14** — Cut that cable and the network falls apart into two pieces. An edge with this property has a name: a bridge, or a cut edge. It is the edge whose removal increases the number of connected pieces.

> Caption: Cut it and the network falls into two pieces. An edge like this is called a bridge, or a cut edge.

**0:14–0:21** — Count every such cable in the picture. There are four. Every other edge lies inside one of the cycles, and no single edge inside a cycle can split anything, because the rest of the cycle still carries the message around.

> Caption: Count them all: four bridges here. Every other edge sits inside a cycle, and no single one of them can split the network.

**0:21–0:30** — Inside each cycle, the network survives the loss of any single edge. So the interesting question is not only which edges are weak, but which pairs of stations still have two independent routes between them. That question has its own name, and it is the subject of this lesson.

> Caption: Inside each cycle the network survives any one failure. So the useful question is: which vertices still have two independent routes?

Exam-trap caption mode adds: *A pair of vertices inside the same cycle has two edge-disjoint routes, but a pair separated by a bridge has only one. Do not confuse "connected" with "redundantly connected".*

## Scene 2. A bridge is an edge on no cycle

*0:30 – 1:00 · objective: state the bridge test by deletion and prove it is the same as "lies on no cycle", with parallel edges as the boundary case*

**0:30–0:37** — Take three small graphs and apply the definition literally. Delete the highlighted edge, then count the connected pieces. That is the definition, and it needs no cleverness.

> Caption: Three small graphs, one test each: delete the highlighted edge and count the pieces.

**0:37–0:44** — In a path of three vertices, deleting the middle edge leaves two pieces, so it is a bridge. In a triangle, deleting any single edge leaves one piece, because the other two edges still join everything, so a triangle has no bridge at all.

> Caption: Path of three: deleting the middle edge leaves two pieces, so it is a bridge. Triangle: deleting any edge leaves one piece, so none is.

**0:44–0:52** — Both cases are the same fact said differently. An edge is a bridge exactly when it lies on no cycle. If a cycle contains it, the rest of the cycle is a detour, so cutting it changes nothing. If no cycle contains it, there is no detour, so cutting it separates its two ends.

> Caption: The same fact in one line: an edge is a bridge exactly when it lies on no cycle.

**0:52–1:00** — Now the boundary case that breaks careless code. Two parallel edges between the same pair of stations form a cycle of length two. Neither is a bridge, because cutting one leaves the other. Yet no simple cycle, in the usual sense of a cycle with three or more distinct vertices, contains them. So the equivalence holds only if a two-edge cycle counts as a cycle, which it does in a multigraph.

> Caption: Boundary case: two parallel edges are a cycle of length two, so neither is a bridge - even though no simple cycle contains them.

Exam-trap caption mode adds: *Most textbook code skips the parent vertex. On a simple graph that is safe; on a multigraph it reports a bridge that does not exist. GATE has asked about parallel edges more than once.*

## Scene 3. Two edge-disjoint paths, and the classes they make

*1:00 – 1:30 · objective: define the relation "two edge-disjoint paths exist", verify it is an equivalence relation, and read its classes off the worked graph*

**1:00–1:07** — Two routes from station zero to station two that share no edge: one goes directly, the other goes through station one. Two routes, no shared edge. That is what redundant connection means here.

> Caption: Two routes from station 0 to station 2 that share no edge: one way round the triangle, and the other way round.

**1:07–1:15** — Now ask the question for every pair of stations at once. Say two stations are related when they are the same station, or when two edge-disjoint routes join them. Being the same station counts, with two routes of length zero.

> Caption: Now ask it for every pair at once. Two stations are related when they have two edge-disjoint routes, or are the same station.

**1:15–1:23** — This relation is reflexive by the convention, and symmetric because two routes can be read in either direction. Transitivity is the part that needs an argument: if two routes join a to b and two more join b to c, gluing the halves gives two routes from a to c that share no edge.

> Caption: The relation is an equivalence relation: reflexive, symmetric, and transitive. Transitivity is the one that needs a proof.

**1:23–1:30** — The classes of this relation are called the 2-edge-connected components of the graph. The worked graph has five of them. And here is the useful coincidence: you get exactly the same five by cutting every bridge and taking what is left. Two definitions, one partition.

> Caption: Its classes are the 2-edge-connected components. Here there are five, and the same five appear if you cut the bridges instead.

## Scene 4. The relation that looks right and is not

*1:30 – 2:00 · objective: show on the bowtie that "lies on a common cycle" is not transitive, and why the class count is the same either way for that graph*

**1:30–1:38** — Here is a tempting substitute for the definition. Call two stations related when some cycle contains both of them. It sounds equivalent, and on a single cycle it is. On this bowtie it fails, and the failure is worth thirty seconds.

> Caption: A tempting substitute: call two stations related when some cycle contains both. On this bowtie it fails.

**1:38–1:46** — Station one is on the left cycle with station zero. Station three is on the right cycle with station zero. But stations one and three lie on no common cycle, because every cycle here stays on one side of the shared station. So the relation is not transitive, and a relation that is not transitive has no classes.

> Caption: Station 1 shares the left cycle with station 0. Station 3 shares the right cycle with station 0. But 1 and 3 share no cycle.

Exam-trap caption mode adds: *A relation that is not transitive cannot define a partition, so "the components are the pairs on a common cycle" is simply false. The right relation is two edge-disjoint paths.*

**1:46–1:54** — And yet the bowtie is a single 2-edge-connected component. Stations one and three do have two edge-disjoint routes: go from one to zero one way, cross to three, and come back the other way. The routes share the shared station, and that is allowed.

> Caption: Yet the bowtie is one 2-edge-connected component: 1 and 3 do have two edge-disjoint routes, going opposite ways round the two triangles.

**1:54–2:00** — This is also exactly the difference from the other decomposition. The bowtie is one 2-edge-connected component, but two biconnected blocks, because the shared station is an articulation point. Cutting bridges is coarser than cutting articulation points, and the difference is always this shape.

> Caption: That is also the difference from blocks: the bowtie is one 2-edge-connected component but two biconnected blocks.

## Scene 5. One depth-first search finds every bridge

*2:00 – 2:30 · objective: read disc and low off a real traversal of the worked graph, and see the parallel-edge trap in the parent test*

**2:00–2:08** — Now the linear-time method. Run a depth-first search from station six and number every station as it is first reached. Station six is one, then five is two, then four, three, two, one, zero, and so on round the rest. These arrival numbers are the discovery numbers.

> Caption: A depth-first search from station 6 numbers every station as it arrives. These are the discovery numbers, d.

**2:08–2:16** — The second number is low: the smallest discovery number you can reach from this station by going down the search tree and then, at most once per route, jumping along an edge that closes a cycle. Those closing edges are the dashed ones. In the triangle, station two can jump straight to station five, so its low is two.

> Caption: The second number, low, is the smallest discovery number reachable from a station without crossing back over the edge it came in on.

**2:16–2:24** — The test is one comparison. The tree edge from u down to its child v is a bridge exactly when low of v is strictly greater than the discovery number of u. Strictly greater: if v can reach u or anything above u without using this edge, then a cycle covers the edge and it is not a bridge.

> Caption: The test: the edge from u down to child v is a bridge exactly when low of v is strictly greater than d of u.

**2:24–2:30** — Here is the comparison that is easy to get wrong, and it is worth the mark. The search must skip the edge it came in on, identified by the edge, and not the station it came from. On two parallel edges, skipping the station skips both of them, and the search then reports a bridge between two stations that are joined twice.

> Caption: The one comparison that is easy to get wrong: skip the parent edge, not the parent station.

Exam-trap caption mode adds: *If a question shows a multigraph, or says "parallel edges allowed", check which parent rule the code uses. The two rules differ exactly there.*

## Scene 6. Cut the bridges, contract what is left

*2:30 – 3:00 · objective: derive the count identity: components after cutting every bridge equals connected components plus bridges*

**2:30–2:38** — Now take the four bridges out of the worked graph. What is left splits into five pieces. Each piece is 2-edge-connected on its own: inside it, no edge is a bridge, so every pair of its stations has two edge-disjoint routes.

> Caption: Delete the four bridges and the graph splits into five pieces. Each piece is 2-edge-connected on its own.

**2:38–2:46** — Now shrink each piece to a single dot and keep only the bridges as edges between dots. Five dots, four edges. The picture that results is a tree, and it is called the bridge tree of the graph.

> Caption: Now shrink each piece to a single dot and keep only the bridges. Five dots, four edges.

**2:46–2:54** — The contraction gives a count identity for free. The number of pieces after cutting every bridge equals the number of connected components plus the number of bridges. In the worked graph that is one plus four, which is five. For a connected graph it is simply bridges plus one.

> Caption: The count identity: components after cutting the bridges equals connected components plus bridges. Here 5 = 1 + 4.

**2:54–3:00** — The two facts fit together exactly: the bridges of the original graph are precisely the edges of the forest, so no bridge disappears in the contraction and no new edge appears. That is why a question about single-edge failures can be answered by looking at a tree.

> Caption: And the bridges of the graph are exactly the edges of that forest, so nothing is lost and nothing is invented.

## Scene 7. The bridge tree of the worked graph

*3:00 – 3:30 · objective: read the forest that results, its leaves, and why tree distance is the number of bridges on any path*

**3:00–3:08** — Here is the bridge tree by itself. A hub with three branches, and one of those branches continues to a fourth dot. The left dot is the triangle of stations zero to two, and the branch continues through the triangle of stations three to five into the hub.

> Caption: The bridge tree alone, drawn without the graph: a hub with three branches, one of which continues.

**3:08–3:16** — Three of the five dots have degree one. A dot of degree one is called a leaf, and a leaf is exactly a region reachable through a single bridge. That is why the number of leaves decides how much work is needed to make the whole network safe.

> Caption: Three leaves: the left triangle, the square, and the third triangle. Leaves are exactly the places where one cut is enough to strand a region.

**3:16–3:24** — One more property earns its keep. The distance between two dots in the bridge tree is the number of bridges on any route between the corresponding stations. Stations zero and thirteen are three dots apart, so every route between them crosses exactly three bridges, whichever route you choose.

> Caption: Distance in the tree is the number of bridges on any path. Stations 0 and 13 are three dots apart, and every route between them crosses three bridges.

**3:24–3:30** — This is also how the components answer the original question. Two stations inside the same dot have two edge-disjoint routes. Two stations in different dots have at most one route, so one well-chosen cut separates them. The tree is the whole answer, compressed.

> Caption: Two stations in the same dot have two edge-disjoint routes; two stations in different dots have only one route at best.

## Scene 8. How many edges make it safe

*3:30 – 4:00 · objective: derive ceil(leaves/2), check the pairing construction leaves no bridge, and check the bound by brute force*

**3:30–3:38** — Now the practical question. How many new cables make the network safe against any single failure? The answer depends only on the leaves. With three leaves, two new cables are enough: join two of the leaves, and the third leaf joins a station on the new cycle.

> Caption: Three leaves need two new cables: pair two leaves, and the third pairs with a leaf of the new cycle.

**3:38–3:46** — Why can it not be fewer? Each leaf must be an endpoint of some added cable, because a leaf with no new cable stays behind a single bridge. One added cable has two ends, so it can serve at most two leaves. With L leaves you therefore need at least the ceiling of L over two cables.

> Caption: The lower bound is a counting argument: each leaf must receive an added edge, and one added edge has two ends. So at least ceil(L/2).

**3:46–3:54** — The page does not take the formula on trust. For every labelled tree on four, five and six vertices it searches every set of added edges, smallest size first, until no bridge remains. The minimum found is exactly the ceiling of L over two, every time.

> Caption: Checked by brute force: for every tree on four, five and six vertices, search all added-edge sets and the minimum is exactly ceil(L/2).

**3:54–4:00** — And the formula is not only about trees. For any connected graph, compute the bridge tree, count its leaves, and the minimum number of added edges is the ceiling of that count over two. The added edges join stations inside the leaf components, so the new cycles cover the bridges.

> Caption: The formula is for the whole graph, not only trees: use the leaves of the bridge tree, and add that many edges between the right stations.

Exam-trap caption mode adds: *A very common slip is to count the leaves of the original graph rather than of the bridge tree. They are different numbers: here the graph has many degree-one stations, and only three leaves in the tree.*

## Scene 9. Three pairs that get confused

*4:00 – 4:30 · objective: separate bridge from articulation point, 2-edge-connected from 2-vertex-connected, and 2-edge-connected from strongly connected*

**4:00–4:08** — Three pairs get confused, and each has a two-second counterexample. First, a bridge and an articulation point. Take one edge with two stations. That edge is a bridge, and removing either station leaves a single station, which is still connected, so neither is an articulation point.

> Caption: Bridge and articulation point are different objects. One edge with two stations: the edge is a bridge, and neither station is an articulation point.

**4:08–4:16** — The other direction: the bowtie has an articulation point at the shared station, because removing it splits the graph in two, and it has no bridge at all. So neither object implies the other, in either direction.

> Caption: The other way round: the bowtie has an articulation point at the shared station and no bridge at all.

**4:16–4:24** — Second pair: 2-edge-connected against 2-vertex-connected. Every 2-vertex-connected graph is 2-edge-connected, and the converse fails. The bowtie is one 2-edge-connected component, but two blocks, because a route may share the shared station and a vertex cut is not allowed to.

> Caption: 2-edge-connected is weaker than 2-vertex-connected: the bowtie is one 2-edge-connected component but two blocks.

**4:24–4:30** — Third pair: strongly connected components are for directed graphs, and 2-edge-connected components for undirected ones. Take an undirected cycle and orient it consistently: it is strongly connected. Orient one edge the other way: it is still one 2-edge-connected component, but the strongly connected components are now two. Same edges, different question.

> Caption: Third pair: strongly connected is for directed graphs, and on one undirected graph it can split into two while 2-edge-connectivity keeps it whole.

## Scene 10. The procedure, in five steps

*4:30 – 5:00 · objective: consolidate the test, the relation, the contraction, the tree and the augmentation into one procedure*

**4:30–4:38** — The procedure, in five steps. First, decide what the question asks. Which edges are weak is a question about bridges. Which stations are safe from a single failure is a question about 2-edge-connected components. They use the same search but they do not have the same answer.

> Caption: Step 1: decide what the question asks - which edges are weak, or which stations are safe from a single failure.

**4:38–4:46** — Second, run one depth-first search keeping two numbers per station, and skip the parent edge by its identity. Third, mark a tree edge as a bridge when the low of the child is strictly greater than the discovery number of the parent. One pass, time proportional to vertices plus edges.

> Caption: Step 2: run one depth-first search with disc and low, skipping the parent edge by identity. Step 3: mark a tree edge a bridge when low of the child exceeds disc of the parent.

**4:46–4:54** — Fourth, cut the bridges and label what remains. Those labels are the 2-edge-connected components, and the count is the number of connected components plus the number of bridges. Two stations share a label exactly when they have two edge-disjoint routes.

> Caption: Step 4: cut the bridges and label the pieces - that is the component list, and components equal connected components plus bridges.

**4:54–5:00** — Fifth, if the question asks how many edges to add, build the bridge tree, count the leaves, and answer the ceiling of the leaves over two. Each leaf needs an added edge, each added edge serves two leaves, and pairing leaves meets the bound exactly.

> Caption: Step 5: for the number of added edges, build the bridge tree, count its leaves, and answer ceil of leaves over two.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
