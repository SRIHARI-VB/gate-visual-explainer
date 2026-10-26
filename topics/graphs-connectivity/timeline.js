/* ==========================================================================
   graphs-connectivity — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'sets', n: 1, title: 'A graph is two sets',
      start: 0, end: 30,
      objective: 'State the definition of a simple undirected graph as a vertex set and an edge set, read a graph from an adjacency matrix and from an adjacency list, and read a degree off either one.'
    },
    {
      id: 'handshake', n: 2, title: 'The handshake lemma',
      start: 30, end: 60,
      objective: 'Derive the degree sum equals twice the edge count by counting each edge at both ends, and use it to force the odd-degree vertices to come in pairs.'
    },
    {
      id: 'components', n: 3, title: 'Walks, paths, cycles, components',
      start: 60, end: 90,
      objective: 'Separate walk, trail, path and cycle by what may repeat, then define connected, component and distance, and count the components of a graph that is not connected.'
    },
    {
      id: 'trees', n: 4, title: 'Trees: three equivalent statements',
      start: 90, end: 120,
      objective: 'Recognise the three interchangeable tests for a tree on n vertices — connected and acyclic, exactly n − 1 edges, exactly one path between every pair — and know why each implies the others.'
    },
    {
      id: 'spanning', n: 5, title: 'Spanning trees always exist',
      start: 120, end: 150,
      objective: 'Prove by edge deletion that every connected graph has a spanning tree, and check the count on K4 against Cayley n^(n−2) by two independent computations.'
    },
    {
      id: 'cuts', n: 6, title: 'Cut vertices and bridges',
      start: 150, end: 180,
      objective: 'Define a cut vertex and a bridge by the increase in component count, find both in one graph, and see that they are different objects counted by different words.'
    },
    {
      id: 'kappa', n: 7, title: 'How connected? kappa, lambda, delta',
      start: 180, end: 210,
      objective: 'Define vertex connectivity and edge connectivity as the sizes of the smallest cuts, state and justify Whitney\u2019s chain kappa at most lambda at most delta, and see that the chain bounds rather than determines.'
    },
    {
      id: 'bipartite', n: 8, title: 'Bipartite is no odd cycle',
      start: 210, end: 240,
      objective: 'Define bipartite by a two-way split and by a 2-colouring, watch an odd cycle defeat every colouring, and decide bipartiteness by breadth-first parity.'
    },
    {
      id: 'euler', n: 9, title: 'Euler and Hamilton',
      start: 240, end: 270,
      objective: 'Distinguish using every edge once from visiting every vertex once, state the Euler criterion with its connectivity condition, and see that Hamiltonian cycles have no such test.'
    },
    {
      id: 'procedure', n: 10, title: 'The decision procedure and three traps',
      start: 270, end: 300,
      objective: 'Run a fixed five-question procedure on an unfamiliar graph question, and recognise the three traps that cost marks: reading the picture, confusing the pairs, and applying a criterion outside its condition.'
    }
  ],

  events: [

    /* ---------------- scene 1: a graph is two sets ---------------- */
    {
      id: 'se-1', start: 0, end: 8, scene: 'sets',
      caption: 'A graph is two sets: V, the vertices, and E, a set of unordered pairs of vertices — the edges.',
      detail: 'Everything in this lesson is a simple undirected graph: no loop joining a vertex to itself, and at most one edge between a pair. Directed graphs and multigraphs are different objects and their connectivity questions have different answers, so the definition comes first.',
      keyword: 'two sets',
      trap: null,
      narration: 'A graph is two sets. V holds the vertices, and E holds the edges, each edge an unordered pair of vertices.'
    },
    {
      id: 'se-2', start: 8, end: 16, scene: 'sets',
      caption: 'Two representations: a matrix whose rows are vertices and whose 1s mark edges, or a list of neighbours for each vertex.',
      detail: 'The matrix is symmetric for an undirected graph, because the edge from a to b is also the edge from b to a. It costs n squared entries whether or not the graph is sparse. The list costs two entries per edge, which is why algorithms use it.',
      keyword: 'matrix',
      trap: null,
      narration: 'Two representations. A matrix with a one wherever two vertices are joined, or a list of neighbours for each vertex.'
    },
    {
      id: 'se-3', start: 16, end: 23, scene: 'sets',
      caption: 'The degree of a vertex is the number of edges at it — the row sum of the matrix, the length of the list.',
      detail: 'A loop would add two to a degree, which is one more reason the simple-graph assumption is stated. Here the degrees are 2, 3, 3, 2, 2, read off the row sums of the matrix shown.',
      keyword: 'degree',
      trap: 'A degree counts edges, not distinct neighbours, only when there is at most one edge between any pair. In a multigraph the two numbers differ.',
      narration: 'The degree of a vertex is how many edges meet it. That is the row sum of the matrix, and the length of the neighbour list.'
    },
    {
      id: 'se-4', start: 23, end: 30, scene: 'sets',
      caption: 'Every number on this page is computed from those two sets, never read off the drawing.',
      detail: 'The drawing is a convenience. Two drawings that look nothing alike can be the same graph, and a question that asks about connectivity is asking about the sets, not about the positions of the dots.',
      keyword: 'computed',
      trap: null,
      narration: 'Every number in this lesson is computed from the two sets. The picture is only a way of seeing them.'
    },

    /* ---------------- scene 2: the handshake lemma ---------------- */
    {
      id: 'ha-1', start: 30, end: 38, scene: 'handshake',
      caption: 'Add up all the degrees and every edge has been counted twice, once at each end. The sum is twice the number of edges.',
      detail: 'This is the whole proof. Each edge has exactly two endpoints, so it contributes exactly one to the degree of each, and the sum over all vertices therefore counts every edge exactly twice. No assumption beyond simple and undirected is used.',
      keyword: 'twice',
      trap: null,
      narration: 'Add up all the degrees. Every edge is counted twice, once at each end, so the sum is twice the number of edges.'
    },
    {
      id: 'ha-2', start: 38, end: 46, scene: 'handshake',
      caption: 'So the degree sum is always even, and the vertices of odd degree must come in pairs.',
      detail: 'Write the sum as the even degrees plus the odd degrees. The even degrees contribute an even number, and the total is even, so the odd degrees must contribute an even number, which happens exactly when there are evenly many of them.',
      keyword: 'pairs',
      trap: null,
      narration: 'The degree sum is always even. So the vertices of odd degree must come in pairs. There can never be exactly one.'
    },
    {
      id: 'ha-3', start: 46, end: 53, scene: 'handshake',
      caption: 'Here the degrees 2, 3, 3, 2, 2 sum to 12, so there are exactly 6 edges — and vertices 1 and 2 are the two odd ones.',
      detail: 'The lemma works in both directions as a consistency check. If someone hands you a degree sequence summing to an odd number, no graph has it, and if it sums to 12 then any graph realising it has 6 edges. Whether a sequence with an even sum is realisable is a separate and harder question.',
      keyword: '12',
      trap: 'An even degree sum is necessary, not sufficient. The sequence 4, 4, 4, 0 sums to 12 but is not realisable on four vertices, because a vertex of degree 0 is isolated from vertices that must have degree 4.',
      narration: 'The degrees here are two, three, three, two, two. They sum to twelve, so there are six edges, and vertices one and two are the odd ones.'
    },
    {
      id: 'ha-4', start: 53, end: 60, scene: 'handshake',
      caption: 'The lemma rules things out: you cannot have a graph with exactly one vertex of odd degree.',
      detail: 'This is the standard shape of a GATE question on the lemma: give a degree sequence and ask whether a graph exists, or ask how many edges a graph must have. The lemma answers the first only when the parity is wrong, and answers the second immediately.',
      keyword: 'rules out',
      trap: null,
      narration: 'The lemma rules things out. A graph with exactly one vertex of odd degree cannot exist, and a degree sequence with an odd sum cannot either.'
    },

    /* ---------------- scene 3: walks, paths, cycles, components ---------------- */
    {
      id: 'co-1', start: 60, end: 68, scene: 'components',
      caption: 'A walk may repeat vertices and edges; a path repeats neither. A cycle is a closed path of length at least three.',
      detail: 'The four words are ordered by what they forbid. A walk forbids nothing. A trail forbids repeating an edge. A path forbids repeating a vertex. A closed path is a cycle, and in a simple graph the shortest cycle has length three.',
      keyword: 'walk',
      trap: 'A cycle of length two needs two parallel edges, which a simple graph does not have. That is why the minimum length is three.',
      narration: 'A walk may repeat vertices and edges. A path repeats neither. A cycle is a closed path, and in a simple graph its length is at least three.'
    },
    {
      id: 'co-2', start: 68, end: 76, scene: 'components',
      caption: 'A graph is connected when a path joins every pair of vertices. A component is a maximal connected piece.',
      detail: 'Maximal is doing real work: a single vertex inside a triangle is a connected piece, but it is not a component, because it can be enlarged. The components partition the vertices, so every vertex lies in exactly one.',
      keyword: 'component',
      trap: null,
      narration: 'A graph is connected when a path joins every pair of vertices. A component is a maximal connected piece, and the components split the vertices between them.'
    },
    {
      id: 'co-3', start: 76, end: 83, scene: 'components',
      caption: 'This graph has three: the triangle, the two-vertex path, and vertex 5 alone. An isolated vertex is its own component.',
      detail: 'A single vertex counts as a connected piece, so a graph with no edges at all on n vertices has n components. That is the case most often forgotten, and it is exactly the case that breaks the naive statement that a connected graph has fewer than n components.',
      keyword: 'three',
      trap: 'An isolated vertex is a component. Counting components in a drawing and skipping the lone dots is the commonest counting error on this topic.',
      narration: 'This graph has three components: the triangle, the two-vertex path, and vertex five on its own.'
    },
    {
      id: 'co-4', start: 83, end: 90, scene: 'components',
      caption: 'Distance is the length of the shortest path, and it is defined only inside one component.',
      detail: 'Distance from vertex 0 is 0 to itself, 1 to vertices 1 and 2, and 2 to vertices 3 and 4, computed by breadth-first search. Between vertices in different components the distance is not large, it is undefined.',
      keyword: 'distance',
      trap: null,
      narration: 'Distance is the length of the shortest path. It exists only inside one component. Between components the distance is not big, it is undefined.'
    },

    /* ---------------- scene 4: trees ---------------- */
    {
      id: 'tr-1', start: 90, end: 98, scene: 'trees',
      caption: 'A tree is a connected graph with no cycle. Three statements then say the same thing about a graph on n vertices.',
      detail: 'The three statements are: connected and acyclic; exactly n − 1 edges; exactly one path between every pair of vertices. Any one of them may be used as the definition and the other two follow as theorems.',
      keyword: 'no cycle',
      trap: null,
      narration: 'A tree is a connected graph with no cycle. For a graph on n vertices, three statements then say the same thing.'
    },
    {
      id: 'tr-2', start: 98, end: 105, scene: 'trees',
      caption: 'Connected and acyclic; exactly n − 1 edges; and exactly one path between every pair of vertices.',
      detail: 'Each of the three is a test you can run on a graph you are given. Counting the edges is the cheapest. The statement was verified here by brute force on all 1,099 labelled graphs with at most five vertices: the three tests agreed on every one, and the number of trees found was 1, 1, 3, 16, 125, which is Cayley\u2019s n^(n−2).',
      keyword: 'n − 1',
      trap: 'Two of the three do not suffice. Acyclic with n − 1 edges is not enough on its own unless you know it is acyclic, and connected with n − 1 edges is a tree, but acyclic with fewer edges is a forest, not a tree.',
      narration: 'Connected and acyclic. Exactly n minus one edges. Exactly one path between every pair. Any one of the three implies the other two.'
    },
    {
      id: 'tr-3', start: 105, end: 113, scene: 'trees',
      caption: 'Each is a test you can run: count the edges, look for a cycle, or ask whether two routes exist.',
      detail: 'For a graph handed to you in an exam, the edge count is a single addition. A cycle test is a traversal. The one-path test is the same traversal, asking whether any edge leads back to a visited vertex.',
      keyword: 'test',
      trap: null,
      narration: 'Each statement is a test. Count the edges, or look for a cycle, or ask whether two different routes join a pair.'
    },
    {
      id: 'tr-4', start: 113, end: 120, scene: 'trees',
      caption: 'Adding any edge to a tree creates exactly one cycle, and deleting any edge disconnects it.',
      detail: 'Adding the edge from u to v closes the unique u-to-v path into exactly one cycle, and the cycle is unique because the path was. Deleting an edge destroys the only route between its endpoints, so the tree splits into two components.',
      keyword: 'exactly one',
      trap: null,
      narration: 'Add an edge to a tree and exactly one cycle appears. Delete an edge and the tree falls into two pieces.'
    },

    /* ---------------- scene 5: spanning trees ---------------- */
    {
      id: 'sp-1', start: 120, end: 128, scene: 'spanning',
      caption: 'Every connected graph has a spanning tree: a tree on all the vertices, using some of the edges.',
      detail: 'A spanning tree keeps every vertex and only enough edges to stay connected. It is the smallest connected spanning subgraph, and it is what makes the minimum spanning tree question meaningful in the algorithms paper.',
      keyword: 'spanning tree',
      trap: null,
      narration: 'Every connected graph has a spanning tree. It is a tree on all the vertices, built from some of the edges.'
    },
    {
      id: 'sp-2', start: 128, end: 136, scene: 'spanning',
      caption: 'Find a cycle, delete one of its edges, and repeat. Each deletion keeps the graph connected and removes a cycle, so the process must stop — at a tree.',
      detail: 'Deleting an edge of a cycle leaves the endpoints joined by the rest of that cycle, so connectivity survives. Each step reduces the edge count by one, so the process terminates, and it terminates only when no cycle remains. This is a proof, not an algorithm to run in an exam.',
      keyword: 'delete',
      trap: 'Deleting an edge that is not on a cycle breaks the graph. The instruction is specifically to delete an edge of a cycle.',
      narration: 'Find a cycle and delete one of its edges. Connectivity survives, one edge is gone, and the process stops when no cycle is left.'
    },
    {
      id: 'sp-3', start: 136, end: 143, scene: 'spanning',
      caption: 'K4 has 16 spanning trees. Cayley says a complete graph on n vertices has n to the power n − 2, which is 4 squared here.',
      detail: 'Cayley\u2019s formula counts the spanning trees of a complete graph. It is a statement about complete graphs only: a graph that is missing edges has fewer spanning trees, and the count then needs the matrix-tree theorem or a direct argument.',
      keyword: '16',
      trap: 'Cayley\u2019s n^(n−2) is for complete graphs. Applying it to a sparse graph over-counts, because the trees it counts use edges the graph does not have.',
      narration: 'K4 has sixteen spanning trees. Cayley\u2019s formula gives n to the power n minus two, which here is four squared, sixteen.'
    },
    {
      id: 'sp-4', start: 143, end: 150, scene: 'spanning',
      caption: 'Two independent computations of the same number, which is the only reason to trust either.',
      detail: 'The page lists every 3-edge subset of the six edges of K4 and keeps the ones that form a tree: 16. The formula gives 16. A check fails loudly if the two disagree.',
      keyword: 'independent',
      trap: null,
      narration: 'The page counts them by listing every subset, and the formula gives the same number. That agreement is the check.'
    },

    /* ---------------- scene 6: cut vertices and bridges ---------------- */
    {
      id: 'cu-1', start: 150, end: 158, scene: 'cuts',
      caption: 'A cut vertex is a vertex whose removal increases the number of components. A bridge is an edge with the same property.',
      detail: 'Removing a vertex removes its incident edges too, which is why a single vertex can do more damage than a single edge. Removing an edge never removes a vertex, so the vertex set is unchanged and only the routes are lost.',
      keyword: 'cut vertex',
      trap: null,
      narration: 'A cut vertex is a vertex whose removal increases the number of components. A bridge is an edge with that same property.'
    },
    {
      id: 'cu-2', start: 158, end: 166, scene: 'cuts',
      caption: 'They are different objects. This graph has two cut vertices, 2 and 5, and one bridge — the edge between them.',
      detail: 'The components rise from 1 to 2 when vertex 2 is removed and again when vertex 5 is removed. Deleting the edge 2–5 also gives 2 components. No other vertex or edge changes the count, and the page tests every one of them.',
      keyword: 'two',
      trap: null,
      narration: 'Two cut vertices and one bridge. The words count different things: vertices on one side, edges on the other.'
    },
    {
      id: 'cu-3', start: 166, end: 173, scene: 'cuts',
      caption: 'A bridge\u2019s endpoints are cut vertices only when they have degree at least two.',
      detail: 'On two vertices with a single edge, the edge is a bridge, but removing either vertex leaves one vertex and one component, so neither endpoint is a cut vertex. The count of components has not increased.',
      keyword: 'degree',
      trap: 'A bridge does not always come with two cut vertices. The two-vertex graph is the counterexample, and it is small enough to check in the exam.',
      narration: 'A bridge does not guarantee two cut vertices. In the two-vertex graph the edge is a bridge and neither endpoint is a cut vertex.'
    },
    {
      id: 'cu-4', start: 173, end: 180, scene: 'cuts',
      caption: 'No cycle has either, because every edge of a cycle sits on an alternative route.',
      detail: 'Delete any edge of a cycle and its endpoints are still joined the long way round. Delete any vertex and its two cycle-neighbours are still joined by the rest of the cycle. This is why a cycle has connectivity two rather than one.',
      keyword: 'cycle',
      trap: null,
      narration: 'A cycle has no cut vertex and no bridge. Every edge of a cycle has an alternative route around it.'
    },

    /* ---------------- scene 7: kappa, lambda, delta ---------------- */
    {
      id: 'ka-1', start: 180, end: 188, scene: 'kappa',
      caption: 'How connected is a connected graph? Count the fewest things you must delete to break it.',
      detail: 'Connected is a yes-or-no word, and most real networks are connected. The useful question is how much damage they survive, which is what makes this the natural measure of reliability in a network.',
      keyword: 'fewest',
      trap: null,
      narration: 'How connected is a connected graph? Count the fewest things you must delete before it breaks apart.'
    },
    {
      id: 'ka-2', start: 188, end: 196, scene: 'kappa',
      caption: 'Vertex connectivity kappa deletes vertices; edge connectivity lambda deletes edges; delta is the smallest degree.',
      detail: 'For a complete graph there is no vertex cut at all, and the convention is kappa equal to n − 1. A disconnected graph has kappa zero. Both conventions are needed for the inequality to hold at the edges of the definition.',
      keyword: 'kappa',
      trap: 'Kappa of a complete graph is n − 1 by convention, not undefined and not zero. Kappa of a disconnected graph is zero, not one.',
      narration: 'Kappa deletes vertices. Lambda deletes edges. Delta is the smallest degree in the graph.'
    },
    {
      id: 'ka-3', start: 196, end: 203, scene: 'kappa',
      caption: 'Whitney\u2019s inequality: kappa is at most lambda, and lambda is at most delta.',
      detail: 'The second inequality is immediate: deleting every edge at a smallest-degree vertex isolates that vertex, so some edge cut has size at most delta. The first is a real theorem, proved by Whitney, and it is the one worth remembering rather than re-deriving under time pressure.',
      keyword: 'at most',
      trap: 'The chain is an inequality, not an equation. Reading kappa = lambda = delta from it is the standard error; the page shows a graph where the three values are 1, 2 and 3.',
      narration: 'Whitney\u2019s chain. Kappa at most lambda, lambda at most delta. The edges at the smallest-degree vertex always form a cut.'
    },
    {
      id: 'ka-4', start: 203, end: 210, scene: 'kappa',
      caption: 'Here kappa and lambda are 1 because of the bridge, while delta is 2. The chain bounds the answer; it does not fix it.',
      detail: 'On this graph the three values are 1, 1 and 2, so the chain is tight at its first link and strict at its second. The page also verifies a 12-vertex graph with values 1, 2 and 3, where all three differ.',
      keyword: 'bounds',
      trap: null,
      narration: 'Here kappa and lambda are one, because of the bridge, and delta is two. The chain gives a bound, not a value.'
    },

    /* ---------------- scene 8: bipartite ---------------- */
    {
      id: 'bi-1', start: 210, end: 218, scene: 'bipartite',
      caption: 'A graph is bipartite when the vertices split into two sides and every edge crosses between them.',
      detail: 'The two sides are called parts, and the split must cover every vertex. No edge may join two vertices on the same side. The complete bipartite graph with parts of size m and n is written K(m, n).',
      keyword: 'two sides',
      trap: null,
      narration: 'A graph is bipartite when the vertices split into two sides and every edge goes from one side to the other.'
    },
    {
      id: 'bi-2', start: 218, end: 226, scene: 'bipartite',
      caption: 'Equivalently: colour one side 0 and the other 1, so every edge joins different colours. That is a 2-colouring.',
      detail: 'The 4-cycle here colours 0, 1, 0, 1 around the ring and every edge joins different colours. The colouring and the split are the same information written two ways, so a question may use either word.',
      keyword: '2-colouring',
      trap: null,
      narration: 'Equivalently, colour one side zero and the other one. Every edge then joins different colours. That is a two-colouring.'
    },
    {
      id: 'bi-3', start: 226, end: 233, scene: 'bipartite',
      caption: 'The obstruction is an odd cycle. Walking a 5-cycle forces alternating colours, and the last edge meets its own colour.',
      detail: 'Alternating colours around an odd number of steps returns you to the starting colour, and the closing edge then joins two vertices of the same colour. The same argument shows any odd cycle is fatal, and conversely a graph with no odd cycle can always be coloured by breadth-first parity.',
      keyword: 'odd cycle',
      trap: 'It is the oddness that obstructs, not the length. A 6-cycle is bipartite and a 5-cycle is not, although both are cycles of similar size.',
      narration: 'An odd cycle is the obstruction. Alternate the colours around five edges and the closing edge joins two vertices of the same colour.'
    },
    {
      id: 'bi-4', start: 233, end: 240, scene: 'bipartite',
      caption: 'So bipartite is the same as no odd cycle, and a breadth-first search decides it by parity of distance.',
      detail: 'The equivalence was checked here on all 1,099 labelled graphs with at most five vertices: the 2-colouring test and the shortest-cycle test gave the same verdict on every one. Breadth-first search colours by the parity of the distance from the start, in time proportional to the number of edges.',
      keyword: 'parity',
      trap: null,
      narration: 'Bipartite means no odd cycle. A breadth-first search decides it, by colouring each vertex with the parity of its distance.'
    },

    /* ---------------- scene 9: Euler and Hamilton ---------------- */
    {
      id: 'eu-1', start: 240, end: 248, scene: 'euler',
      caption: 'An Euler circuit uses every edge exactly once and returns to the start. A Hamiltonian cycle visits every vertex exactly once.',
      detail: 'One word is about edges and the other about vertices, and the two questions have completely different characters. Euler is a condition on degrees. Hamilton is a search.',
      keyword: 'every edge',
      trap: null,
      narration: 'An Euler circuit uses every edge once and comes back to the start. A Hamiltonian cycle visits every vertex once.'
    },
    {
      id: 'eu-2', start: 248, end: 256, scene: 'euler',
      caption: 'Euler has a one-line test: every edge in one component and every degree even. Zero odd vertices gives a circuit, two gives a trail that is not closed.',
      detail: 'Every time a circuit passes through a vertex it uses two of that vertex\u2019s edges, so every degree must be even. With exactly two odd vertices the trail must start at one and end at the other. The component condition matters: a graph with an isolated vertex elsewhere still has an Euler circuit among its edges.',
      keyword: 'even',
      trap: 'The degree test alone is not enough. It must be applied to the component that actually holds the edges; four odd vertices in a second component do not stop a circuit in the first.',
      narration: 'Euler has a one-line test. All edges in one component, and every degree even. Two odd vertices give a trail that does not close.'
    },
    {
      id: 'eu-3', start: 256, end: 263, scene: 'euler',
      caption: 'Hamilton has no such test. No simple necessary-and-sufficient condition is known, and deciding it is NP-complete.',
      detail: 'This is a statement about what is currently known, not a theorem that no criterion can exist. Diract and Ore give sufficient conditions, and a necessary condition is that every vertex has degree at least two, but neither is an exact test.',
      keyword: 'NP-complete',
      trap: 'A sufficient condition is not a test. Dirac\u2019s condition proves a Hamiltonian cycle exists when it holds, but a graph failing it may still be Hamiltonian.',
      narration: 'Hamilton has no such test. No simple exact condition is known, and deciding the question is NP-complete.'
    },
    {
      id: 'eu-4', start: 263, end: 270, scene: 'euler',
      caption: 'They are independent: the two-triangle graph has an Euler trail but no Hamiltonian cycle; K4 minus an edge has a Hamiltonian cycle but no Euler circuit.',
      detail: 'Both directions were checked by exhaustive search, not by inspection. In the two-triangle graph a Hamiltonian cycle would have to cross the bridge and return, which no cycle may do. In K4 minus an edge the cycle exists, but two vertices have odd degree, so no Euler circuit can.',
      keyword: 'independent',
      trap: null,
      narration: 'The two questions are independent. One graph has an Euler trail but no Hamiltonian cycle, and another has the reverse.'
    },

    /* ---------------- scene 10: procedure and traps ---------------- */
    {
      id: 'pr-1', start: 270, end: 278, scene: 'procedure',
      caption: 'The procedure: count vertices and edges, check the degrees, find the components, then ask what the question wants broken.',
      detail: 'The first two counts answer the handshake and tree questions immediately. The component count answers connectivity. Only then is it worth asking about cuts, colourings or trails, because each of those has a cheap precondition.',
      keyword: 'procedure',
      trap: null,
      narration: 'The procedure. Count the vertices and the edges, check the degrees, find the components, then ask what the question wants broken.'
    },
    {
      id: 'pr-2', start: 278, end: 285, scene: 'procedure',
      caption: 'Trap one: reading the picture instead of the structure. Two drawings of the same graph look different and answer the same.',
      detail: 'A drawing can put a vertex in the middle where it looks central, or cross two edges that do not meet. Relabel the vertices or redraw with one vertex outside, and the answers do not change, because every property in this lesson is defined on the sets.',
      keyword: 'picture',
      trap: 'A crossing in the drawing is not a vertex. Two edges that cross on the page share no vertex unless a dot is drawn there.',
      narration: 'Trap one. Read the structure, not the picture. Two drawings of the same graph have the same answers.'
    },
    {
      id: 'pr-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Trap two: confusing a cut vertex with a bridge, or Euler with Hamilton. Each pair counts different objects.',
      detail: 'A cut vertex is a vertex and a bridge is an edge, so a graph can have many of one and none of the other. Euler counts edges used and Hamilton counts vertices visited, so a graph can satisfy one condition and fail the other, as the previous scene showed in both directions.',
      keyword: 'confusing',
      trap: 'Answering the cut-vertex count when the question asked for bridges is a whole mark, and the two numbers usually differ.',
      narration: 'Trap two. Do not confuse a cut vertex with a bridge, or Euler with Hamilton. Each pair counts different objects.'
    },
    {
      id: 'pr-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Trap three: applying a criterion outside its condition. The all-even-degrees test needs every edge in one component.',
      detail: 'The same discipline applies to the tree test, which needs the graph connected as well as acyclic, to Cayley\u2019s formula, which needs a complete graph, and to Whitney\u2019s chain, which bounds rather than determines. Check the hypothesis before you use the conclusion.',
      keyword: 'condition',
      trap: 'Every criterion in this lesson has a hypothesis. A remembered formula applied to a graph that fails the hypothesis is the commonest way to lose this mark.',
      narration: 'Trap three. Every criterion has a condition. Check the condition before you use the criterion.'
    }
  ]
};
