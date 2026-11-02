/* ==========================================================================
   two-edge-connected-components-and-the-bridge-tree - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    { id: 'split',    n: 1,  title: 'One cable, two halves', objective: 'see that a single edge can be the only link between two regions, and count how many such edges a network has', start: 0,   end: 30  },
    { id: 'cycle',    n: 2,  title: 'A bridge is an edge on no cycle', objective: 'state the bridge test by deletion and prove it is the same as "lies on no cycle", with parallel edges as the boundary case', start: 30,  end: 60  },
    { id: 'disjoint', n: 3,  title: 'Two edge-disjoint paths, and the classes they make', objective: 'define the relation "two edge-disjoint paths exist", verify it is an equivalence relation, and read its classes off the worked graph', start: 60,  end: 90  },
    { id: 'wrongrel', n: 4,  title: 'The relation that looks right and is not', objective: 'show on the bowtie that "lies on a common cycle" is not transitive, and why the class count is the same either way for that graph', start: 90,  end: 120 },
    { id: 'lowlink',  n: 5,  title: 'One depth-first search finds every bridge', objective: 'read disc and low off a real traversal of the worked graph, and see the parallel-edge trap in the parent test', start: 120, end: 150 },
    { id: 'contract', n: 6,  title: 'Cut the bridges, contract what is left', objective: 'derive the count identity: components after cutting every bridge equals connected components plus bridges', start: 150, end: 180 },
    { id: 'tree',     n: 7,  title: 'The bridge tree of the worked graph', objective: 'read the forest that results, its leaves, and why tree distance is the number of bridges on any path', start: 180, end: 210 },
    { id: 'augment',  n: 8,  title: 'How many edges make it safe', objective: 'derive ceil(leaves/2), check the pairing construction leaves no bridge, and check the bound by brute force', start: 210, end: 240 },
    { id: 'pairs',    n: 9,  title: 'Three pairs that get confused', objective: 'separate bridge from articulation point, 2-edge-connected from 2-vertex-connected, and 2-edge-connected from strongly connected', start: 240, end: 270 },
    { id: 'proc',     n: 10, title: 'The procedure, in five steps', objective: 'consolidate the test, the relation, the contraction, the tree and the augmentation into one procedure', start: 270, end: 300 }
  ],

  events: [
    /* ---- 1. one cable, two halves ------------------------------------------ */
    { id: 's1', scene: 'split', start: 0, end: 7,
      caption: 'This network has fourteen stations. One cable, between station 2 and station 3, is the only link between the left region and the rest.',
      narration: 'Here is a network of fourteen stations. Look at the cable between station two and station three. Every message from the left three stations to anywhere else has to cross it, because it is the only link that joins the two sides.',
      detail: 'The left region is the triangle on stations 0, 1 and 2. The only edge leaving it is the edge 2 to 3, so removing that one edge separates those three stations from everything else.',
      keyword: 'the only link between the two sides' },

    { id: 's2', scene: 'split', start: 7, end: 14,
      caption: 'Cut it and the network falls into two pieces. An edge like this is called a bridge, or a cut edge.',
      narration: 'Cut that cable and the network falls apart into two pieces. An edge with this property has a name: a bridge, or a cut edge. It is the edge whose removal increases the number of connected pieces.',
      detail: 'The formal statement: e is a bridge if the graph with e removed has more connected components than the graph with e present. That definition works for multigraphs too, which matters later.',
      keyword: 'a bridge, or a cut edge' },

    { id: 's3', scene: 'split', start: 14, end: 21,
      caption: 'Count them all: four bridges here. Every other edge sits inside a cycle, and no single one of them can split the network.',
      narration: 'Count every such cable in the picture. There are four. Every other edge lies inside one of the cycles, and no single edge inside a cycle can split anything, because the rest of the cycle still carries the message around.',
      detail: 'The four are 2 to 3, 5 to 6, 6 to 7 and 6 to 11, computed on this page by deleting each edge in turn and counting components. Nothing here is estimated.',
      keyword: 'four bridges' },

    { id: 's4', scene: 'split', start: 21, end: 30,
      caption: 'Inside each cycle the network survives any one failure. So the useful question is: which vertices still have two independent routes?',
      narration: 'Inside each cycle, the network survives the loss of any single edge. So the interesting question is not only which edges are weak, but which pairs of stations still have two independent routes between them. That question has its own name, and it is the subject of this lesson.',
      detail: 'Two routes are independent when they share no edge. They may share vertices; that distinction is what separates this topic from the articulation-point lesson.',
      keyword: 'two independent routes',
      trap: 'A pair of vertices inside the same cycle has two edge-disjoint routes, but a pair separated by a bridge has only one. Do not confuse "connected" with "redundantly connected".' },

    /* ---- 2. a bridge is an edge on no cycle -------------------------------- */
    { id: 'c1', scene: 'cycle', start: 30, end: 37,
      caption: 'Three small graphs, one test each: delete the highlighted edge and count the pieces.',
      narration: 'Take three small graphs and apply the definition literally. Delete the highlighted edge, then count the connected pieces. That is the definition, and it needs no cleverness.',
      detail: 'The deletion test costs one connectivity check per edge. It is the definition, so it is the thing every faster method must agree with.',
      keyword: 'delete the edge and count the pieces' },

    { id: 'c2', scene: 'cycle', start: 37, end: 44,
      caption: 'Path of three: deleting the middle edge leaves two pieces, so it is a bridge. Triangle: deleting any edge leaves one piece, so none is.',
      narration: 'In a path of three vertices, deleting the middle edge leaves two pieces, so it is a bridge. In a triangle, deleting any single edge leaves one piece, because the other two edges still join everything, so a triangle has no bridge at all.',
      detail: 'A cycle of any length has no bridge. A tree has nothing but bridges: every edge of a tree is a bridge, which is why a tree on n vertices has exactly n minus one bridges.',
      keyword: 'a triangle has no bridge' },

    { id: 'c3', scene: 'cycle', start: 44, end: 52,
      caption: 'The same fact in one line: an edge is a bridge exactly when it lies on no cycle.',
      narration: 'Both cases are the same fact said differently. An edge is a bridge exactly when it lies on no cycle. If a cycle contains it, the rest of the cycle is a detour, so cutting it changes nothing. If no cycle contains it, there is no detour, so cutting it separates its two ends.',
      detail: 'This is the equivalence that makes every fast algorithm possible: instead of testing deletion, look for a back edge that covers the edge.',
      keyword: 'a bridge lies on no cycle' },

    { id: 'c4', scene: 'cycle', start: 52, end: 60,
      caption: 'Boundary case: two parallel edges are a cycle of length two, so neither is a bridge - even though no simple cycle contains them.',
      narration: 'Now the boundary case that breaks careless code. Two parallel edges between the same pair of stations form a cycle of length two. Neither is a bridge, because cutting one leaves the other. Yet no simple cycle, in the usual sense of a cycle with three or more distinct vertices, contains them. So the equivalence holds only if a two-edge cycle counts as a cycle, which it does in a multigraph.',
      detail: 'Consequence for the algorithm: the depth-first search must skip the parent edge by its identity, not by the parent vertex. Skipping the parent vertex skips both parallel edges and wrongly reports one of them.',
      keyword: 'a cycle of length two',
      trap: 'Most textbook code skips the parent vertex. On a simple graph that is safe; on a multigraph it reports a bridge that does not exist. GATE has asked about parallel edges more than once.' },

    /* ---- 3. two edge-disjoint paths ---------------------------------------- */
    { id: 'd1', scene: 'disjoint', start: 60, end: 67,
      caption: 'Two routes from station 0 to station 2 that share no edge: one way round the triangle, and the other way round.',
      narration: 'Two routes from station zero to station two that share no edge: one goes directly, the other goes through station one. Two routes, no shared edge. That is what redundant connection means here.',
      detail: 'Edge-disjoint means no edge is used twice across the two routes. Vertices may repeat; in the worked graph the two routes share their endpoints only.',
      keyword: 'no shared edge' },

    { id: 'd2', scene: 'disjoint', start: 67, end: 75,
      caption: 'Now ask it for every pair at once. Two stations are related when they have two edge-disjoint routes, or are the same station.',
      narration: 'Now ask the question for every pair of stations at once. Say two stations are related when they are the same station, or when two edge-disjoint routes join them. Being the same station counts, with two routes of length zero.',
      detail: 'The length-zero convention is what makes the relation reflexive, and reflexivity is what makes the classes cover every vertex, isolated ones included.',
      keyword: 'for every pair at once' },

    { id: 'd3', scene: 'disjoint', start: 75, end: 83,
      caption: 'The relation is an equivalence relation: reflexive, symmetric, and transitive. Transitivity is the one that needs a proof.',
      narration: 'This relation is reflexive by the convention, and symmetric because two routes can be read in either direction. Transitivity is the part that needs an argument: if two routes join a to b and two more join b to c, gluing the halves gives two routes from a to c that share no edge.',
      detail: 'The gluing argument is checked on the page by computing the maximum number of edge-disjoint routes with a unit-capacity flow, for every pair of every graph on five vertices.',
      keyword: 'an equivalence relation' },

    { id: 'd4', scene: 'disjoint', start: 83, end: 90,
      caption: 'Its classes are the 2-edge-connected components. Here there are five, and the same five appear if you cut the bridges instead.',
      narration: 'The classes of this relation are called the 2-edge-connected components of the graph. The worked graph has five of them. And here is the useful coincidence: you get exactly the same five by cutting every bridge and taking what is left. Two definitions, one partition.',
      detail: 'The coincidence is proved, not assumed: on all one thousand and twenty-four graphs on five vertices, the relation partition and the contraction partition agree, vertex for vertex.',
      keyword: 'five 2-edge-connected components' },

    /* ---- 4. the relation that looks right and is not ------------------------ */
    { id: 'w1', scene: 'wrongrel', start: 90, end: 98,
      caption: 'A tempting substitute: call two stations related when some cycle contains both. On this bowtie it fails.',
      narration: 'Here is a tempting substitute for the definition. Call two stations related when some cycle contains both of them. It sounds equivalent, and on a single cycle it is. On this bowtie it fails, and the failure is worth thirty seconds.',
      detail: 'The bowtie is two triangles sharing one vertex: stations 0, 1, 2 on the left and 0, 3, 4 on the right.',
      keyword: 'call two stations related when some cycle contains both' },

    { id: 'w2', scene: 'wrongrel', start: 98, end: 106,
      caption: 'Station 1 shares the left cycle with station 0. Station 3 shares the right cycle with station 0. But 1 and 3 share no cycle.',
      narration: 'Station one is on the left cycle with station zero. Station three is on the right cycle with station zero. But stations one and three lie on no common cycle, because every cycle here stays on one side of the shared station. So the relation is not transitive, and a relation that is not transitive has no classes.',
      detail: 'Verified by enumerating every simple cycle of the bowtie: the pair 1 and 3 appears in none of them.',
      keyword: 'share no cycle',
      trap: 'A relation that is not transitive cannot define a partition, so "the components are the pairs on a common cycle" is simply false. The right relation is two edge-disjoint paths.' },

    { id: 'w3', scene: 'wrongrel', start: 106, end: 114,
      caption: 'Yet the bowtie is one 2-edge-connected component: 1 and 3 do have two edge-disjoint routes, going opposite ways round the two triangles.',
      narration: 'And yet the bowtie is a single 2-edge-connected component. Stations one and three do have two edge-disjoint routes: go from one to zero one way, cross to three, and come back the other way. The routes share the shared station, and that is allowed.',
      detail: 'Two edge-disjoint routes may share vertices. Only the edges must be distinct. The maximum flow between 1 and 3 in the bowtie is two, computed on the page.',
      keyword: 'they share the shared station' },

    { id: 'w4', scene: 'wrongrel', start: 114, end: 120,
      caption: 'That is also the difference from blocks: the bowtie is one 2-edge-connected component but two biconnected blocks.',
      narration: 'This is also exactly the difference from the other decomposition. The bowtie is one 2-edge-connected component, but two biconnected blocks, because the shared station is an articulation point. Cutting bridges is coarser than cutting articulation points, and the difference is always this shape.',
      detail: 'The blocks are computed on the page by the edge-stack algorithm, and checked against their defining property: they partition the edge set.',
      keyword: 'one component but two blocks' },

    /* ---- 5. one depth-first search ---------------------------------------- */
    { id: 'l1', scene: 'lowlink', start: 120, end: 128,
      caption: 'A depth-first search from station 6 numbers every station as it arrives. These are the discovery numbers, d.',
      narration: 'Now the linear-time method. Run a depth-first search from station six and number every station as it is first reached. Station six is one, then five is two, then four, three, two, one, zero, and so on round the rest. These arrival numbers are the discovery numbers.',
      detail: 'The numbers on the drawing are the real ones for this traversal, computed on the page in the order the search visits vertices.',
      keyword: 'discovery numbers' },

    { id: 'l2', scene: 'lowlink', start: 128, end: 136,
      caption: 'The second number, low, is the smallest discovery number reachable from a station without crossing back over the edge it came in on.',
      narration: 'The second number is low: the smallest discovery number you can reach from this station by going down the search tree and then, at most once per route, jumping along an edge that closes a cycle. Those closing edges are the dashed ones. In the triangle, station two can jump straight to station five, so its low is two.',
      detail: 'Every triangle in the worked graph pulls its three vertices down to the same low value, which is why none of their edges can be a bridge.',
      keyword: 'the smallest discovery number you can reach' },

    { id: 'l3', scene: 'lowlink', start: 136, end: 144,
      caption: 'The test: the edge from u down to child v is a bridge exactly when low of v is strictly greater than d of u.',
      narration: 'The test is one comparison. The tree edge from u down to its child v is a bridge exactly when low of v is strictly greater than the discovery number of u. Strictly greater: if v can reach u or anything above u without using this edge, then a cycle covers the edge and it is not a bridge.',
      detail: 'At station three the child is two, with low five, against d of three equal to four. Five is greater than four, so the edge is a bridge. At station five the child is four, with low two, against d of five equal to two. Two is not greater than two, so that edge is not a bridge.',
      keyword: 'strictly greater' },

    { id: 'l4', scene: 'lowlink', start: 144, end: 150,
      caption: 'The one comparison that is easy to get wrong: skip the parent edge, not the parent station.',
      narration: 'Here is the comparison that is easy to get wrong, and it is worth the mark. The search must skip the edge it came in on, identified by the edge, and not the station it came from. On two parallel edges, skipping the station skips both of them, and the search then reports a bridge between two stations that are joined twice.',
      detail: 'On the two-station, two-edge multigraph the definition says zero bridges, the edge-id test says zero, and the parent-station test says one. All three numbers are computed on the page.',
      keyword: 'skip the parent edge, not the parent station',
      trap: 'If a question shows a multigraph, or says "parallel edges allowed", check which parent rule the code uses. The two rules differ exactly there.' },

    /* ---- 6. cut the bridges and contract ---------------------------------- */
    { id: 'k1', scene: 'contract', start: 150, end: 158,
      caption: 'Delete the four bridges and the graph splits into five pieces. Each piece is 2-edge-connected on its own.',
      narration: 'Now take the four bridges out of the worked graph. What is left splits into five pieces. Each piece is 2-edge-connected on its own: inside it, no edge is a bridge, so every pair of its stations has two edge-disjoint routes.',
      detail: 'Each piece is verified on the page: take the piece, delete each of its edges in turn, and confirm no deletion ever disconnects it.',
      keyword: 'five pieces' },

    { id: 'k2', scene: 'contract', start: 158, end: 166,
      caption: 'Now shrink each piece to a single dot and keep only the bridges. Five dots, four edges.',
      narration: 'Now shrink each piece to a single dot and keep only the bridges as edges between dots. Five dots, four edges. The picture that results is a tree, and it is called the bridge tree of the graph.',
      detail: 'The contraction is what turns a question about a graph into a question about a tree, and every question about trees is easier.',
      keyword: 'shrink each piece to a single dot' },

    { id: 'k3', scene: 'contract', start: 166, end: 174,
      caption: 'The count identity: components after cutting the bridges equals connected components plus bridges. Here 5 = 1 + 4.',
      narration: 'The contraction gives a count identity for free. The number of pieces after cutting every bridge equals the number of connected components plus the number of bridges. In the worked graph that is one plus four, which is five. For a connected graph it is simply bridges plus one.',
      detail: 'Checked on all one thousand and twenty-four graphs on five vertices, with no exception. It follows from the bridge forest being a forest: a forest on k nodes with c components has exactly k minus c edges.',
      keyword: 'components plus bridges' },

    { id: 'k4', scene: 'contract', start: 174, end: 180,
      caption: 'And the bridges of the graph are exactly the edges of that forest, so nothing is lost and nothing is invented.',
      narration: 'The two facts fit together exactly: the bridges of the original graph are precisely the edges of the forest, so no bridge disappears in the contraction and no new edge appears. That is why a question about single-edge failures can be answered by looking at a tree.',
      detail: 'The forest is checked to be a forest on every graph on five vertices: its edge count is always its node count minus the number of connected components.',
      keyword: 'exactly the edges of that forest' },

    /* ---- 7. the bridge tree ---------------------------------------------- */
    { id: 't1', scene: 'tree', start: 180, end: 188,
      caption: 'The bridge tree alone, drawn without the graph: a hub with three branches, one of which continues.',
      narration: 'Here is the bridge tree by itself. A hub with three branches, and one of those branches continues to a fourth dot. The left dot is the triangle of stations zero to two, and the branch continues through the triangle of stations three to five into the hub.',
      detail: 'The hub is the single station six, a component of one vertex with no edges of its own.',
      keyword: 'a hub with three branches' },

    { id: 't2', scene: 'tree', start: 188, end: 196,
      caption: 'Three leaves: the left triangle, the square, and the third triangle. Leaves are exactly the places where one cut is enough to strand a region.',
      narration: 'Three of the five dots have degree one. A dot of degree one is called a leaf, and a leaf is exactly a region reachable through a single bridge. That is why the number of leaves decides how much work is needed to make the whole network safe.',
      detail: 'Leaves are counted from the degrees of the forest, not from the picture: degrees are 1, 2, 3, 1, 1, so three leaves.',
      keyword: 'three leaves' },

    { id: 't3', scene: 'tree', start: 196, end: 204,
      caption: 'Distance in the tree is the number of bridges on any path. Stations 0 and 13 are three dots apart, and every route between them crosses three bridges.',
      narration: 'One more property earns its keep. The distance between two dots in the bridge tree is the number of bridges on any route between the corresponding stations. Stations zero and thirteen are three dots apart, so every route between them crosses exactly three bridges, whichever route you choose.',
      detail: 'Checked for every pair of stations on every graph with five vertices: the tree distance and the count of bridges whose removal separates the pair always agree.',
      keyword: 'distance is the number of bridges' },

    { id: 't4', scene: 'tree', start: 204, end: 210,
      caption: 'Two stations in the same dot have two edge-disjoint routes; two stations in different dots have only one route at best.',
      narration: 'This is also how the components answer the original question. Two stations inside the same dot have two edge-disjoint routes. Two stations in different dots have at most one route, so one well-chosen cut separates them. The tree is the whole answer, compressed.',
      detail: 'The maximum number of edge-disjoint routes is at least two exactly when the two stations share a dot, verified by flow for every pair on five vertices.',
      keyword: 'the whole answer, compressed' },

    /* ---- 8. how many edges make it safe ---------------------------------- */
    { id: 'a1', scene: 'augment', start: 210, end: 218,
      caption: 'Three leaves need two new cables: pair two leaves, and the third pairs with a leaf of the new cycle.',
      narration: 'Now the practical question. How many new cables make the network safe against any single failure? The answer depends only on the leaves. With three leaves, two new cables are enough: join two of the leaves, and the third leaf joins a station on the new cycle.',
      detail: 'The construction is run on the page for every labelled tree with four to seven vertices, and the result is checked by deleting every edge afterwards: no bridge survives.',
      keyword: 'two new cables' },

    { id: 'a2', scene: 'augment', start: 218, end: 226,
      caption: 'The lower bound is a counting argument: each leaf must receive an added edge, and one added edge has two ends. So at least ceil(L/2).',
      narration: 'Why can it not be fewer? Each leaf must be an endpoint of some added cable, because a leaf with no new cable stays behind a single bridge. One added cable has two ends, so it can serve at most two leaves. With L leaves you therefore need at least the ceiling of L over two cables.',
      detail: 'This is the pigeonhole principle again: L leaves, two per cable, so at least the ceiling of L over two cables. The construction above meets it, so the bound is exact.',
      keyword: 'each leaf must receive an added edge' },

    { id: 'a3', scene: 'augment', start: 226, end: 234,
      caption: 'Checked by brute force: for every tree on four, five and six vertices, search all added-edge sets and the minimum is exactly ceil(L/2).',
      narration: 'The page does not take the formula on trust. For every labelled tree on four, five and six vertices it searches every set of added edges, smallest size first, until no bridge remains. The minimum found is exactly the ceiling of L over two, every time.',
      detail: 'The exhaustive search covers 1,437 trees and compares against the formula. A tree that already has no bridge needs zero edges, and the formula gives zero because a single dot has no leaf.',
      keyword: 'checked by brute force' },

    { id: 'a4', scene: 'augment', start: 234, end: 240,
      caption: 'The formula is for the whole graph, not only trees: use the leaves of the bridge tree, and add that many edges between the right stations.',
      narration: 'And the formula is not only about trees. For any connected graph, compute the bridge tree, count its leaves, and the minimum number of added edges is the ceiling of that count over two. The added edges join stations inside the leaf components, so the new cycles cover the bridges.',
      detail: 'For a disconnected graph the same reasoning applies per component, with one extra edge needed for each isolated dot, since an isolated component needs two ends of its own.',
      keyword: 'use the leaves of the bridge tree',
      trap: 'A very common slip is to count the leaves of the original graph rather than of the bridge tree. They are different numbers: here the graph has many degree-one stations, and only three leaves in the tree.' },

    /* ---- 9. three pairs that get confused -------------------------------- */
    { id: 'p1', scene: 'pairs', start: 240, end: 248,
      caption: 'Bridge and articulation point are different objects. One edge with two stations: the edge is a bridge, and neither station is an articulation point.',
      narration: 'Three pairs get confused, and each has a two-second counterexample. First, a bridge and an articulation point. Take one edge with two stations. That edge is a bridge, and removing either station leaves a single station, which is still connected, so neither is an articulation point.',
      detail: 'Computed on the page by the slow definitions: one bridge, zero articulation points.',
      keyword: 'different objects' },

    { id: 'p2', scene: 'pairs', start: 248, end: 256,
      caption: 'The other way round: the bowtie has an articulation point at the shared station and no bridge at all.',
      narration: 'The other direction: the bowtie has an articulation point at the shared station, because removing it splits the graph in two, and it has no bridge at all. So neither object implies the other, in either direction.',
      detail: 'A graph with at least three vertices where every vertex has degree two can still have an articulation point: the bowtie is exactly that.',
      keyword: 'no bridge at all' },

    { id: 'p3', scene: 'pairs', start: 256, end: 264,
      caption: '2-edge-connected is weaker than 2-vertex-connected: the bowtie is one 2-edge-connected component but two blocks.',
      narration: 'Second pair: 2-edge-connected against 2-vertex-connected. Every 2-vertex-connected graph is 2-edge-connected, and the converse fails. The bowtie is one 2-edge-connected component, but two blocks, because a route may share the shared station and a vertex cut is not allowed to.',
      detail: 'Checked on every graph with five vertices: no 2-vertex-connected graph fails to be 2-edge-connected, and the bowtie is the smallest counterexample to the converse.',
      keyword: 'weaker than 2-vertex-connected' },

    { id: 'p4', scene: 'pairs', start: 264, end: 270,
      caption: 'Third pair: strongly connected is for directed graphs, and on one undirected graph it can split into two while 2-edge-connectivity keeps it whole.',
      narration: 'Third pair: strongly connected components are for directed graphs, and 2-edge-connected components for undirected ones. Take an undirected cycle and orient it consistently: it is strongly connected. Orient one edge the other way: it is still one 2-edge-connected component, but the strongly connected components are now two. Same edges, different question.',
      detail: 'The directed case is the condensation, which the strongly-connected-components lesson owns; this lesson owns the undirected one.',
      keyword: 'directed against undirected' },

    /* ---- 10. the procedure ----------------------------------------------- */
    { id: 'r1', scene: 'proc', start: 270, end: 278,
      caption: 'Step 1: decide what the question asks - which edges are weak, or which stations are safe from a single failure.',
      narration: 'The procedure, in five steps. First, decide what the question asks. Which edges are weak is a question about bridges. Which stations are safe from a single failure is a question about 2-edge-connected components. They use the same search but they do not have the same answer.',
      detail: 'A question that says "critical connections" is asking for bridges. A question that says "cannot be disconnected by one link failure" is asking for components.',
      keyword: 'decide what the question asks' },

    { id: 'r2', scene: 'proc', start: 278, end: 286,
      caption: 'Step 2: run one depth-first search with disc and low, skipping the parent edge by identity. Step 3: mark a tree edge a bridge when low of the child exceeds disc of the parent.',
      narration: 'Second, run one depth-first search keeping two numbers per station, and skip the parent edge by its identity. Third, mark a tree edge as a bridge when the low of the child is strictly greater than the discovery number of the parent. One pass, time proportional to vertices plus edges.',
      detail: 'The single strict comparison is the whole algorithm. Nothing else needs to be computed to list the bridges.',
      keyword: 'one pass' },

    { id: 'r3', scene: 'proc', start: 286, end: 294,
      caption: 'Step 4: cut the bridges and label the pieces - that is the component list, and components equal connected components plus bridges.',
      narration: 'Fourth, cut the bridges and label what remains. Those labels are the 2-edge-connected components, and the count is the number of connected components plus the number of bridges. Two stations share a label exactly when they have two edge-disjoint routes.',
      detail: 'The identity is checked on every graph with five vertices, and the label rule is checked against the flow definition for every pair.',
      keyword: 'cut the bridges and label the pieces' },

    { id: 'r4', scene: 'proc', start: 294, end: 300,
      caption: 'Step 5: for the number of added edges, build the bridge tree, count its leaves, and answer ceil of leaves over two.',
      narration: 'Fifth, if the question asks how many edges to add, build the bridge tree, count the leaves, and answer the ceiling of the leaves over two. Each leaf needs an added edge, each added edge serves two leaves, and pairing leaves meets the bound exactly.',
      detail: 'For a disconnected graph, add one edge per isolated dot and use the leaves of the remaining forest. The bound and the construction agree on every case the page computes.',
      keyword: 'count its leaves' }
  ]
};
