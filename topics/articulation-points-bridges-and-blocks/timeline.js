/* ==========================================================================
   articulation-points-bridges-and-blocks - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 350,

  scenes: [
    { id: 'fail',   n: 1,  title: 'One failure, two questions', objective: 'separate the vertex question from the edge question, and see that both are questions about the component count', start: 0,   end: 30  },
    { id: 'defs',   n: 2,  title: 'Definitions by deletion', objective: 'define articulation point, bridge and block by what deleting the object does, and read the consequence that blocks partition the edges', start: 30,  end: 58  },
    { id: 'edges',  n: 3,  title: 'An undirected search has only two kinds of edge', objective: 'see why a depth-first search of an undirected graph produces tree edges and back edges and nothing else', start: 58,  end: 90  },
    { id: 'low',    n: 4,  title: 'disc and low on the twelve-vertex graph', objective: 'read the discovery time and compute the low-link value bottom-up on the drawn graph', start: 90,  end: 126 },
    { id: 'aptest', n: 5,  title: 'The articulation test: greater or equal', objective: 'apply low[v] >= disc[u] at every non-root vertex with a child, and see why equality is enough', start: 126, end: 156 },
    { id: 'brtest', n: 6,  title: 'The bridge test: strictly greater', objective: 'apply low[v] > disc[u] to the tree edges, and see the same edge fail it while its parent passes the vertex test', start: 156, end: 182 },
    { id: 'root',   n: 7,  title: 'The root is asked a different question', objective: 'see the vertex test lie at the root of the search, and replace it with the two-children rule', start: 182, end: 208 },
    { id: 'blocks', n: 8,  title: 'Blocks: pop the edge stack', objective: 'push every traversed edge, pop at every weak tree edge, and count seven blocks out of fifteen edges', start: 208, end: 244 },
    { id: 'tree',   n: 9,  title: 'The block-cut tree, and the counting identities', objective: 'build the block-cut tree from the blocks and the cut vertices, and read two counts off it', start: 244, end: 274 },
    { id: 'wrong',  n: 10, title: 'Four beliefs, each refuted by the smallest example', objective: 'see the smallest graph on which each of four common beliefs fails, found by search rather than chosen', start: 274, end: 304 },
    { id: 'gate',   n: 11, title: 'Two previous-year items, recomputed', objective: 'settle the four statements of the 2021 item and the four options of the 2015 item from the definitions', start: 304, end: 334 },
    { id: 'proc',   n: 12, title: 'The procedure, in five steps', objective: 'consolidate the one search, the two tests and the block stack into a procedure that answers any question in the topic', start: 334, end: 350 }
  ],

  events: [
    /* ---- 1. one failure, two questions ------------------------------------ */
    { id: 'f1', scene: 'fail', start: 0, end: 8,
      caption: 'A road network, one failure, two questions. Close a junction and see what happens; close a road and see what happens.',
      narration: 'Here is a road network with one failure to survive. Two questions follow. If one junction closes, can every town still reach every other? And if one road closes, can every town still reach every other?',
      detail: 'Both questions are answered by counting the pieces the map falls into afterwards. That count, and nothing else, is what every definition in this lesson measures.',
      keyword: 'two questions' },

    { id: 'f2', scene: 'fail', start: 8, end: 16,
      caption: 'Closing a junction removes the vertex and every road at it. Closing a road removes only that road, and both of its ends survive.',
      narration: 'Closing a junction removes the vertex and every road that touches it. Closing a road removes only that road: both of its endpoints are still there, and the traffic that used them is only forbidden from using that one link.',
      detail: 'That asymmetry is the whole reason the two tests differ by a single symbol later on. In the edge case the vertex is still present to receive a detour; in the vertex case it is not.',
      keyword: 'both of its ends survive' },

    { id: 'f3', scene: 'fail', start: 16, end: 24,
      caption: 'So a junction and a road are different objects, and a map can be fragile against one kind of failure and robust against the other.',
      narration: 'So these are different objects, and a map can be fragile against one and robust against the other. A pair of loops that share a single junction is exactly that: no road is critical, and the junction is.',
      detail: 'The graph of two triangles sharing one vertex has no bridge at all and one articulation point. It is the smallest example of the separation and it returns in scene ten.',
      keyword: 'fragile against one kind of failure' },

    { id: 'f4', scene: 'fail', start: 24, end: 30,
      caption: 'One depth-first search answers both, and also cuts the edges into the pieces that survive a failure. That is the plan.',
      narration: 'One depth-first search answers both questions at once, and a little bookkeeping on the same search cuts the edge set into the pieces that survive. That is the plan for the rest of the lesson.',
      detail: 'The search is linear in vertices plus edges, so all three answers cost no more than the traversal that the syllabus names.',
      keyword: 'One depth-first search' },

    /* ---- 2. definitions ---------------------------------------------------- */
    { id: 'd1', scene: 'defs', start: 30, end: 38,
      caption: 'An articulation point is a vertex whose deletion raises the number of connected components. That is the definition, not a test.',
      narration: 'An articulation point, or cut vertex, is a vertex whose deletion raises the number of connected components of the graph. That is a definition by deletion: it says what happens, not how to find out cheaply.',
      detail: 'Deleting a vertex also deletes every edge incident with it. The comparison is between the component count before and after, so the definition reads correctly on a disconnected graph too.',
      keyword: 'raises the number of connected components' },

    { id: 'd2', scene: 'defs', start: 38, end: 46,
      caption: 'A bridge is an edge whose deletion raises the component count. Both endpoints survive, so it is a weaker demand than the vertex version.',
      narration: 'A bridge, or cut edge, is an edge whose deletion raises the component count. Both of its endpoints survive the deletion, which makes it a strictly weaker demand than the vertex version: fewer things qualify.',
      detail: 'Every bridge of a tree qualifies, and so does every edge of a path. In a cycle nothing qualifies, because the rest of the cycle is a detour.',
      keyword: 'Both endpoints survive' },

    { id: 'd3', scene: 'defs', start: 46, end: 52,
      caption: 'A block is a maximal set of edges any two of which lie on a common simple cycle. Loops are what tie edges together.',
      narration: 'A biconnected component, or block, is a maximal set of edges such that any two edges in the set lie on a common simple cycle. The binding agent is the loop: two edges belong together when one cycle carries both.',
      detail: 'This is the edge version of the definition, and the standard textbook one. Some texts instead define a block as a maximal two-vertex-connected subgraph, which excludes bridges; the Edge cases tab shows what that changes.',
      keyword: 'any two of which lie on a common simple cycle' },

    { id: 'd4', scene: 'defs', start: 52, end: 58,
      caption: 'Consequence: the blocks partition the edges, and a bridge is a block of exactly one edge.',
      narration: 'Two consequences follow immediately. The blocks partition the edges, because lying on a common cycle is an equivalence relation on edges. And a bridge is a block of exactly one edge, because an edge on no cycle has no partner.',
      detail: 'So the block sizes add up to the number of edges, and counting the one-edge blocks counts the bridges. Both facts are used on the blocks and examples tabs.',
      keyword: 'partition the edges' },

    /* ---- 3. the two kinds of edge ------------------------------------------ */
    { id: 'e1', scene: 'edges', start: 58, end: 66,
      caption: 'The graph: twelve vertices, fifteen edges. Search it from J, a leaf, so that the root rule cannot be dodged.',
      narration: 'Here is the graph the lesson works on: twelve vertices, fifteen edges. The search starts at J, which is a leaf, and that choice is deliberate, because the root of a search needs a different rule and starting at a leaf forces us to face it.',
      detail: 'The shape is a chain of three cyclic pieces joined by bridges, with one four-vertex piece and two leaves hanging off. Every number on this page is computed from this edge list.',
      keyword: 'starts at J, which is a leaf' },

    { id: 'e2', scene: 'edges', start: 66, end: 74,
      caption: 'The search produces eleven tree edges and four back edges. Fifteen edges, and no third kind.',
      narration: 'The search produces eleven tree edges and four back edges. Eleven plus four is fifteen, which is every edge of the graph, and there is no third kind of edge to account for.',
      detail: 'The four back edges are A to C, F to L, D to F and G to I. Each one closes a cycle with the tree path above it, which is exactly how a cyclic piece holds together.',
      keyword: 'eleven tree edges and four back edges' },

    { id: 'e3', scene: 'edges', start: 74, end: 82,
      caption: 'There are no cross edges in an undirected search: an edge between two branches would have been taken, and the second branch would have become the first.',
      narration: 'There is no third kind. A cross edge would join two branches of the search tree, and the moment the search stood at the first of its endpoints it would have crossed into the other branch, so the two would have been one branch.',
      detail: 'Forward and cross edges exist in directed graphs, where the arrow decides which endpoint is examined first. In an undirected graph the search always gets there from the higher vertex, so the edge can only climb.',
      keyword: 'no cross edges',
      trap: 'A question that offers "cross edge" as a classification of an edge in an undirected DFS is offering a wrong answer. Only tree and back edges occur.' },

    { id: 'e4', scene: 'edges', start: 82, end: 90,
      caption: 'So the only way out of a subtree is a back edge climbing to an ancestor. One number per vertex can record how high it climbs.',
      narration: 'This is why one number per vertex is enough. The only way out of a subtree is a back edge climbing to an ancestor, so recording the earliest ancestor any vertex below can reach tells us everything about whether the subtree is sealed off.',
      detail: 'That number is the low-link value, and the next scene computes it. Note that it must be a discovery time, not a depth, or the comparisons later would not be between comparable quantities.',
      keyword: 'the only way out of a subtree' },

    /* ---- 4. disc and low --------------------------------------------------- */
    { id: 'l1', scene: 'low', start: 90, end: 98,
      caption: 'The discovery time is the order in which the search enters a vertex. J is 0, I is 1, and the chain runs down to K at 11.',
      narration: 'The discovery time of a vertex is the order in which the search enters it. J is zero because the search starts there, I is one, and the chain runs down the graph to A at nine, then L at ten and K at eleven as the search backs up and takes the remaining branches.',
      detail: 'The discovery times of a chain are consecutive, which is why the values in this graph look so orderly. On a bushy graph they interleave, and the comparisons still work.',
      keyword: 'order in which the search enters' },

    { id: 'l2', scene: 'low', start: 98, end: 108,
      caption: 'low of a vertex is the smallest discovery time it can reach, using its own value, one back edge, and the low values of its children.',
      narration: 'The low value of a vertex is the smallest discovery time reachable from it, taking the minimum of three things: its own discovery time, the discovery time of anything a back edge from it reaches, and the low value of each of its children.',
      detail: 'Because the third item refers to children, the whole table is filled on the way back up the recursion: every vertex is finished before its parent.',
      keyword: 'smallest discovery time it can reach' },

    { id: 'l3', scene: 'low', start: 108, end: 118,
      caption: 'Filled bottom-up: A climbs to C, so low of A is 7. G climbs to I, so low of G is 1. D takes the smallest of its three children.',
      narration: 'Filled bottom-up, the values tell the story of the cycles. A climbs back to C, so the low value of A is seven, the discovery time of C. G climbs to I, so the low value of G is one. D takes the smallest of its three children: C gives seven, K gives eleven, L gives four, so D is four.',
      detail: 'L reaches four because of the back edge from L to F. That single back edge is what makes the whole four-vertex piece one block, and it is why D is not sealed off from F.',
      keyword: 'Filled bottom-up' },

    { id: 'l4', scene: 'low', start: 118, end: 126,
      caption: 'A low value below the discovery time means the subtree escapes above the vertex. Equal or above means it does not.',
      narration: 'The comparison is the whole method. A low value below the discovery time of the parent means the subtree escapes above that parent. A low value equal to it, or above it, means the subtree cannot get past the parent at all.',
      detail: 'Notice that low is never greater than the discovery time of the vertex itself, and never less than zero. The values are discovery times, so they are comparable to each other and to nothing else.',
      keyword: 'escapes above the vertex' },

    /* ---- 5. the articulation test ----------------------------------------- */
    { id: 'a1', scene: 'aptest', start: 126, end: 134,
      caption: 'Take a non-root vertex u with a child v. If low of v is at least the discovery time of u, then u is an articulation point.',
      narration: 'Here is the test for vertices. Take a vertex u that is not the root, and one of its children v. If the low value of v is greater than or equal to the discovery time of u, then u is an articulation point.',
      detail: 'The test is asked once per child, and one child is enough. A vertex with three children can be cut off from one of them and still be an articulation point.',
      keyword: 'low of v is at least the discovery time of u' },

    { id: 'a2', scene: 'aptest', start: 134, end: 144,
      caption: 'Why: deleting u removes every back edge that ended at u. The subtree of v then has no way up, so the graph splits there.',
      narration: 'Why is that enough? Because deleting u removes u itself and every edge at it, including any back edge that ended at u. The subtree of v then has no way up at all, and the graph splits into that subtree and the rest.',
      detail: 'Equality is the interesting case: the subtree climbs back exactly as far as u and no further. That still counts, because u is about to disappear.',
      keyword: 'no way up',
      trap: 'The vertex test is >=, not >. Using > silently misses every articulation point whose child climbs back exactly to it, and the smallest graph that shows the miss has four vertices.' },

    { id: 'a3', scene: 'aptest', start: 144, end: 150,
      caption: 'On the graph: D has three children. C gives 7 against 6, K gives 11 against 6, so D is cut off from two of them.',
      narration: 'On the drawn graph, D has three children. C gives a low value of seven against a discovery time of six, and K gives eleven against six, so both of those subtrees are sealed off when D goes. L gives four, which is below six, so that one escapes.',
      detail: 'D is the most interesting vertex in the graph: three blocks meet there, and it is the only vertex in three of them.',
      keyword: 'D has three children' },

    { id: 'a4', scene: 'aptest', start: 150, end: 156,
      caption: 'Five articulation points: C, D, F, G and I. Not E, not H, not the leaves, and not the root.',
      narration: 'Applying the test everywhere gives five articulation points: C, D, F, G and I. E and H are not, because their single child climbs above them. The leaves are not, and the root is not, but the root needs a different argument.',
      detail: 'The page checks this list by deleting each of the twelve vertices in turn and recounting components. The two lists agree exactly.',
      keyword: 'Five articulation points' },

    /* ---- 6. the bridge test ------------------------------------------------ */
    { id: 'b1', scene: 'brtest', start: 156, end: 164,
      caption: 'For a tree edge from u to v, the edge is a bridge exactly when low of v is strictly greater than the discovery time of u.',
      narration: 'Here is the test for edges, and it is almost the same. For a tree edge from u down to v, the edge is a bridge exactly when the low value of v is strictly greater than the discovery time of u. Strictly greater, not greater or equal.',
      detail: 'Back edges are never bridges: removing one leaves the tree path above it as a detour. So the test is only ever asked of tree edges, which is eleven of them here.',
      keyword: 'strictly greater' },

    { id: 'b2', scene: 'brtest', start: 164, end: 172,
      caption: 'The equality case is live on this graph: edge F to E has low of E equal to 4, the discovery time of F. Not a bridge.',
      narration: 'The equality case is not hypothetical here. The edge from F down to E has a low value of four at E, which is exactly the discovery time of F. The strict test fails, so this edge is not a bridge: remove it and the piece stays together.',
      detail: 'E reaches four because of the back edge from L to F. That edge is the detour that keeps F and E joined when the tree edge between them is cut.',
      keyword: 'Not a bridge' },

    { id: 'b3', scene: 'brtest', start: 172, end: 178,
      caption: 'But F is still an articulation point, because the same edge passes the weak test. Equality splits the two answers.',
      narration: 'And yet F is an articulation point, because the same edge passes the weak test. This is the pair to remember: one edge, one number, two different answers, and the difference is whether the vertex at the top survives the deletion.',
      detail: 'Delete the edge and F is still there to receive the back edge from L. Delete the vertex F and the back edge goes with it, so the four-vertex piece is sealed off.',
      keyword: 'Equality splits the two answers',
      trap: 'A question that says low[v] equals disc[u] is testing exactly this: the vertex is a cut vertex and the edge is not a bridge.' },

    { id: 'b4', scene: 'brtest', start: 178, end: 182,
      caption: 'Where it is strictly greater, the edge is a bridge: C to D, because 7 is greater than 6.',
      narration: 'Where the inequality is strict, the edge is a bridge. C down to D qualifies, because seven is greater than six, and so do D to K, F to G and I to J. Four bridges, and the page checks each by deleting it.',
      detail: 'Each bridge comes out of the block stack as a block of exactly one edge, which is the connection between this scene and the next.',
      keyword: 'the edge is a bridge' },

    /* ---- 7. the root ------------------------------------------------------- */
    { id: 'r1', scene: 'root', start: 182, end: 190,
      caption: 'The root here is J, with one child I. Low of I is 1, at least the discovery time of J, which is 0. The test says yes.',
      narration: 'Now the root. The search started at J, which has one child, I, and the low value of I is one, which is at least the discovery time of J, which is zero. The vertex test, applied here, says J is an articulation point.',
      detail: 'And it says so for the root of every graph, whatever the graph, because nothing lies above the root for the child to climb to.',
      keyword: 'The test says yes' },

    { id: 'r2', scene: 'root', start: 190, end: 198,
      caption: 'The test is wrong here. Delete J and the graph is still connected: J is not an articulation point at all.',
      narration: 'The test is wrong here. Delete J, and the eleven remaining vertices are still joined: the graph stays in one piece. So J is not an articulation point, and the test that just said it was cannot be applied at the root.',
      detail: 'The reason is structural rather than numerical. The root has no parent, so there is no "above the root" for a subtree to be sealed off from; the question the test asks does not exist here.',
      keyword: 'J is not an articulation point',
      trap: 'Applying the vertex test at the root flags every root of every graph, which turns a correct answer into a wrong one on any question that counts articulation points.' },

    { id: 'r3', scene: 'root', start: 198, end: 204,
      caption: 'Ask the direct question instead: the root is an articulation point exactly when it has at least two children.',
      narration: 'Ask the direct question instead. Deleting the root leaves one piece per child subtree, and no edge joins two of them, because such an edge would have made them one subtree during the search. So the root is an articulation point exactly when it has at least two children.',
      detail: 'One child means everything hangs off the root in a single piece, and deleting the root leaves that piece whole. Two children means two pieces that now have nothing between them.',
      keyword: 'at least two children' },

    { id: 'r4', scene: 'root', start: 204, end: 208,
      caption: 'The smallest graph where forgetting this goes wrong is a single edge: one child, and the test would flag the root.',
      narration: 'The smallest graph where forgetting this goes wrong is a single edge. The root has one child, the weak test holds, and the root is flagged. Two vertices and one edge: that is the smallest counterexample, found by searching graphs in order of size.',
      detail: 'Three vertices in a path, searched from an end, is the smallest graph where the root genuinely is an articulation point: two children, and removing it leaves two pieces.',
      keyword: 'a single edge' },

    /* ---- 8. blocks --------------------------------------------------------- */
    { id: 'k1', scene: 'blocks', start: 208, end: 216,
      caption: 'Now the pieces. Keep a stack of edges: push each tree edge as the search takes it, and push each back edge as it finds one.',
      narration: 'Now the pieces that survive. Keep a stack of edges. Push each tree edge as the search takes it, and push each back edge as the search finds one. Nothing is popped until a block is complete.',
      detail: 'The stack holds edges, not vertices, which is why this algorithm partitions the edge set rather than the vertex set.',
      keyword: 'Keep a stack of edges' },

    { id: 'k2', scene: 'blocks', start: 216, end: 226,
      caption: 'When the search finishes a child v and low of v is at least the discovery time of u, pop down to the edge from u to v. That set is one block.',
      narration: 'When the search finishes a child v of u, and the low value of v is at least the discovery time of u, pop edges off the stack until the edge from u to v comes off. The popped set is one block, complete and maximal.',
      detail: 'The pop boundary falls exactly between blocks, because the edges pushed since the last pop are precisely those that could not escape above u. That is why the set is maximal and not just a cycle.',
      keyword: 'pop down to the edge from u to v' },

    { id: 'k3', scene: 'blocks', start: 226, end: 236,
      caption: 'Seven pops, seven blocks: the triangle ABC, the bridge CD, the bridge DK, the four-vertex piece, the bridge FG, the triangle GHI, the bridge IJ.',
      narration: 'Seven tree edges satisfy the weak test, so seven blocks come out: the triangle on A, B and C; the single edge C to D; the single edge D to K; the four-vertex piece on D, E, F and L; the single edge F to G; the triangle on G, H and I; and the single edge I to J.',
      detail: 'The four one-edge blocks are exactly the four bridges. That is the theorem from the definitions scene appearing as an output: a bridge is a block of one edge.',
      keyword: 'Seven pops, seven blocks' },

    { id: 'k4', scene: 'blocks', start: 236, end: 244,
      caption: 'Three, one, one, five, one, three, one: fifteen edges, and every one of them in exactly one block.',
      narration: 'Three plus one plus one plus five plus one plus three plus one is fifteen, which is every edge of the graph, and no edge is in two blocks. The partition is checked on the page against the brute-force definition: two edges together when a common cycle carries both.',
      detail: 'On all one thousand and twenty-four undirected graphs with five vertices, the stack algorithm and the brute-force partition agree exactly, with no disagreements.',
      keyword: 'every one of them in exactly one block' },

    /* ---- 9. the block-cut tree --------------------------------------------- */
    { id: 't1', scene: 'tree', start: 244, end: 252,
      caption: 'Draw one node per block and one per articulation point, and join a point to a block when the point lies in it. The block-cut tree.',
      narration: 'Draw one node for each block and one node for each articulation point, and join a point to a block exactly when the point lies in that block. The result is the block-cut tree, and it records the whole structure of the graph in one picture.',
      detail: 'Only articulation points get their own node. A vertex in a single block is represented by that block alone, which is why the tree is small.',
      keyword: 'block-cut tree' },

    { id: 't2', scene: 'tree', start: 252, end: 260,
      caption: 'Twelve nodes and eleven edges: seven blocks plus five points, and it is a tree, as it must be for a connected graph.',
      narration: 'Here that is twelve nodes and eleven edges: seven blocks plus five articulation points, and eleven edges is exactly one fewer than twelve, so the result is a tree. It always is, for a connected graph.',
      detail: 'Each edge of the block-cut tree is a containment, not a graph edge. A path in the tree is the sequence of blocks you must cross to travel between two vertices, which is why the tree is the right object for reliability questions.',
      keyword: 'it is a tree' },

    { id: 't3', scene: 'tree', start: 260, end: 268,
      caption: 'A counting identity: the block sizes add up to the vertices, plus one extra copy for every block past the first that a vertex is in. Eighteen is twelve plus six.',
      narration: 'One counting identity falls out. Add up the number of vertices in each block: three plus two plus two plus four plus two plus three plus two is eighteen. That equals the twelve vertices, plus one extra copy for every block past the first that a vertex belongs to: six here, from C, D, F, G and I.',
      detail: 'Only articulation points can be in more than one block, so the extra copies are exactly the articulation points, counted with multiplicity. This is a fast check that a block decomposition is complete.',
      keyword: 'Eighteen is twelve plus six' },

    { id: 't4', scene: 'tree', start: 268, end: 274,
      caption: 'And the criterion: a vertex is an articulation point exactly when it lies in two or more blocks.',
      narration: 'The tree also gives the criterion in one line. A vertex is an articulation point exactly when it lies in two or more blocks, because that is exactly when deleting it separates one block from another.',
      detail: 'On the drawn graph the block counts per articulation point are two, three, two, two and two, and every other vertex appears in exactly one block.',
      keyword: 'two or more blocks' },

    /* ---- 10. four beliefs -------------------------------------------------- */
    { id: 'w1', scene: 'wrong', start: 274, end: 282,
      caption: 'First belief: the vertex test can use the strict inequality. It fails first on four vertices: a pendant edge into a triangle.',
      narration: 'First belief: that the vertex test can use the strict inequality, the same one as the edge test. It fails on four vertices: a pendant edge from A into a triangle on B, C and D. At B the child C climbs back exactly to B, so B is a cut vertex, and the strict test misses it entirely.',
      detail: 'The discovery times are zero to three and the low values are zero, one, one, one. Equality is the case that carries the whole difference, and it is not rare: the drawn graph has it too.',
      keyword: 'It fails first on four vertices',
      trap: 'Swapping the two symbols is the most common error in this topic, and it costs the articulation points whose children climb back exactly to them.' },

    { id: 'w2', scene: 'wrong', start: 282, end: 290,
      caption: 'Second: no bridge means no articulation point. The bowtie refutes it: two triangles sharing one vertex.',
      narration: 'Second belief: that a graph with no bridge has no articulation point. The bowtie refutes it: two triangles sharing exactly one vertex, five vertices and six edges. Every edge lies on a cycle, so no edge is a bridge, and the shared vertex is an articulation point.',
      detail: 'Five vertices is the smallest size at which this happens, found by searching graphs in order of size rather than by choosing an example.',
      keyword: 'The bowtie refutes it' },

    { id: 'w3', scene: 'wrong', start: 290, end: 298,
      caption: 'Third: every bridge has an articulation point at one end. A single edge refutes it: the edge is a bridge and neither end is a cut vertex.',
      narration: 'Third belief: that every bridge has an articulation point at one of its ends. A single edge refutes it. The edge is a bridge, and both of its endpoints have degree one, so neither is an articulation point.',
      detail: 'The repaired statement needs a size condition: in a connected graph with at least three vertices, every bridge does have at least one endpoint that is a cut vertex, because one side of the bridge then holds at least two vertices.',
      keyword: 'A single edge refutes it' },

    { id: 'w4', scene: 'wrong', start: 298, end: 304,
      caption: 'Fourth: deleting an articulation point adds exactly one component. A star with three leaves adds two.',
      narration: 'Fourth belief: that deleting an articulation point adds exactly one component. A star with three leaves adds two: one piece becomes three. The increase is the number of children in the search tree, which the root rule bounds below by two. For a bridge, by contrast, the increase is always exactly one.',
      detail: 'The bridge half of that claim is checked on the page over every graph with five and six vertices, with no exceptions found.',
      keyword: 'adds exactly one component' },

    /* ---- 11. the two items ------------------------------------------------- */
    { id: 'g1', scene: 'gate', start: 304, end: 312,
      caption: 'GATE CSE 2021, Set 1: four statements about articulation points and a DFS tree. One of them survives.',
      narration: 'GATE CSE 2021, Set 1 asks which four statements about articulation points and a depth-first search tree are correct. The four are about all paths passing through the point, a leaf of the tree being a point, the root with two children, and the root never being one.',
      detail: 'The page recomputes all four rather than quoting a key: each statement is tested against the definitions on graphs found by search.',
      keyword: 'One of them survives' },

    { id: 'g2', scene: 'gate', start: 312, end: 320,
      caption: 'Three fail. All paths need not pass through u: four vertices suffice. A leaf is never a point: nothing found up to six vertices. A root can be one: three vertices.',
      narration: 'Three of the four fail, each on the smallest graph that breaks it. All paths need not pass through the point: on four vertices, the ancestor and the descendant are joined directly. A leaf of the search tree is never an articulation point: no graph up to six vertices has one. And a root can certainly be one: three vertices in a path, searched from an end.',
      detail: 'The leaf statement is the one worth internalising: a leaf of the search tree touches only vertices discovered before it, so its removal cannot separate them.',
      keyword: 'Three of the four fail' },

    { id: 'g3', scene: 'gate', start: 320, end: 328,
      caption: 'The survivor is the root rule: the root is an articulation point if and only if it has two or more children. Verified on every graph to six vertices.',
      narration: 'The statement that survives is the root rule: the root of the search tree is an articulation point if and only if it has at least two children. It agrees with brute force on every graph with five and six vertices, searched from every possible start vertex.',
      detail: 'That is thirty-three thousand seven hundred and ninety-two graphs, each searched from each of its vertices, with no disagreement. The proof is the argument on the build-up tab; the check is the evidence.',
      keyword: 'the root rule' },

    { id: 'g4', scene: 'gate', start: 328, end: 334,
      caption: 'GATE CSE 2015, Set 2: a bridge cannot lie on a simple cycle. Checked directly: no bridge ever shared a block with another edge.',
      narration: 'GATE CSE 2015, Set 2 asks for the true statement about bridges, and the answer is that a bridge cannot be part of a simple cycle: an edge on a cycle has a detour, so removing it changes nothing. The page checks the contrapositive over every graph to six vertices, and no bridge ever shared a block with another edge.',
      detail: 'The other three options fail on a tree, on a clique, and on the bowtie respectively, which are the same counterexamples the misconceptions tab already uses.',
      keyword: 'cannot lie on a simple cycle' },

    /* ---- 12. the procedure ------------------------------------------------- */
    { id: 'p1', scene: 'proc', start: 334, end: 342,
      caption: 'One search. Record the discovery time on the way in, compute the low value on the way out, classify each edge as tree or back.',
      narration: 'The procedure is one search. Record the discovery time on the way in, compute the low value on the way out, and classify each edge as a tree edge or a back edge. Everything else in the topic is a comparison against those two numbers.',
      detail: 'The cost is the cost of the traversal: vertices plus edges, with no second pass and no matrix.',
      keyword: 'One search' },

    { id: 'p2', scene: 'proc', start: 342, end: 350,
      caption: 'Then: weak test for vertices with the root rule, strict test for edges, pop the stack for blocks. Check one answer by deletion.',
      narration: 'Then apply three comparisons. The weak test for vertices, with the root rule instead of the test at the root. The strict test for edges. And the pop at every weak tree edge for the blocks. If time allows, check one of the three answers by deleting a vertex or an edge and recounting the pieces.',
      detail: 'The check costs nothing on a small drawn graph, and it is the only way to be sure the root rule was applied where it belonged.',
      keyword: 'three comparisons' }
  ]
};
