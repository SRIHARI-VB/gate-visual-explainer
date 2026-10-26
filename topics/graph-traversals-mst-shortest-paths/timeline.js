/* ==========================================================================
   graph-traversals-mst-shortest-paths — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 330,

  scenes: [
    {
      id: 'what',
      n: 1,
      title: 'A graph, a representation, and three different questions',
      start: 0, end: 30,
      objective: 'Separate the three things GATE asks about graphs - can I reach it, how cheaply can I connect everything, how cheaply can I travel - and see that each has its own algorithm.'
    },
    {
      id: 'bfs',
      n: 2,
      title: 'Breadth-first search: a queue, levels, and a shortest-path tree',
      start: 30, end: 60,
      objective: 'Watch the frontier expand one level at a time, and see why a BFS tree records the fewest-edges distance from the source.'
    },
    {
      id: 'dfs',
      n: 3,
      title: 'Depth-first search: a stack, timestamps, and back edges',
      start: 60, end: 90,
      objective: 'Follow one branch to the end, and read discovery and finish times off the recursion to classify every edge.'
    },
    {
      id: 'compare',
      n: 4,
      title: 'BFS or DFS: what each one actually guarantees, and what it costs',
      start: 90, end: 120,
      objective: 'Hold the two traversals against each other on guarantee, cost and use, and kill the claim that a DFS tree is a shortest-path tree.'
    },
    {
      id: 'cutcycle',
      n: 5,
      title: 'The cut property and the cycle property: which edges an MST must contain',
      start: 120, end: 150,
      objective: 'Use the two properties that make Kruskal and Prim correct, and separate "minimum weight" from "unique".'
    },
    {
      id: 'kruskal',
      n: 6,
      title: 'Kruskal: sort the edges, then refuse to make a cycle',
      start: 150, end: 180,
      objective: 'Run Kruskal on a six-vertex graph, see the union-find decide each edge, and get a total of 24.'
    },
    {
      id: 'prim',
      n: 7,
      title: 'Prim: grow one tree and keep the cheapest way out',
      start: 180, end: 210,
      objective: 'Run Prim from the same vertex, read the key array round by round, and get the same total weight from a different set of edges.'
    },
    {
      id: 'countmst',
      n: 8,
      title: 'Counting minimum spanning trees: the GATE 2024 question',
      start: 210, end: 240,
      objective: 'Collapse forced edges into components, count the independent choices, and reach 9 the way the official key does.'
    },
    {
      id: 'dijkstra',
      n: 9,
      title: 'Dijkstra: settle the nearest unsettled vertex, then relax its edges',
      start: 240, end: 270,
      objective: 'Trace extraction and relaxation on a directed graph, and see that a settled distance is never revised.'
    },
    {
      id: 'negative',
      n: 10,
      title: 'Where Dijkstra breaks, and the three algorithms that do not',
      start: 270, end: 300,
      objective: 'Watch a negative edge make Dijkstra report 2 for a vertex whose true distance is 1, then place Bellman-Ford, DAG shortest path and Floyd-Warshall against it.'
    },
    {
      id: 'decide',
      n: 11,
      title: 'One table: the question, the algorithm, the cost, the guarantee',
      start: 300, end: 330,
      objective: 'Choose the right algorithm in four questions, and hold the seven costs in one row of memory.'
    }
  ],

  events: [

    /* ---------------- scene 1: what a graph algorithm is handed ---------------- */
    {
      id: 'what-1', start: 0, end: 7.5, scene: 'what',
      caption: 'A graph is a set of vertices and a set of edges. An algorithm is handed one of two representations, and the choice changes its running time.',
      detail: 'An adjacency list stores, for each vertex, the list of its neighbours; the total size is the number of vertices plus twice the number of edges, because each undirected edge appears in two lists. An adjacency matrix stores an n-by-n table of zeros and ones, so its size is n squared whatever the number of edges.',
      keyword: 'two representations',
      trap: 'The same algorithm has two costs, one per representation. A question that names the algorithm but not the representation has not fixed the answer, so a good answer names both.',
      narration: 'A graph is a set of vertices and a set of edges. An algorithm is handed one of two representations, and the choice changes its running time.'
    },
    {
      id: 'what-2', start: 7.5, end: 15, scene: 'what',
      caption: 'The first question is reachability: starting from a source, which vertices can I get to, and how far away are they in edges?',
      detail: 'Reachability is answered by a traversal. It needs no weights at all, only the shape of the graph. Breadth-first search answers it with the fewest edges, depth-first search answers it with a nested structure of discovery and finish times.',
      keyword: 'how far away are they in edges',
      trap: 'Distance in edges is not distance in weight. A vertex three edges away can be cheaper to reach than a vertex one edge away, once edges carry weights.',
      narration: 'The first question is reachability: starting from a source, which vertices can I get to, and how far away are they in edges?'
    },
    {
      id: 'what-3', start: 15, end: 22.5, scene: 'what',
      caption: 'The second question is connection: can I join every vertex into one tree of minimum total weight? That is the minimum spanning tree.',
      detail: 'A spanning tree of a connected graph on n vertices has exactly n minus one edges, touches every vertex, and contains no cycle. Among all such trees the minimum spanning tree has the smallest possible sum of edge weights. It says nothing about the distance between two particular vertices.',
      keyword: 'minimum total weight',
      trap: 'A minimum spanning tree is not a shortest-path tree. The tree that minimises the total weight can make the path between two particular vertices much longer than necessary.',
      narration: 'The second question is connection: can I join every vertex into one tree of minimum total weight? That is the minimum spanning tree.'
    },
    {
      id: 'what-4', start: 22.5, end: 30, scene: 'what',
      caption: 'The third question is travel: from one source, what is the cheapest route to every other vertex? Three families answer it, and which one is legal depends on the weights.',
      detail: 'Dijkstra needs non-negative weights. Bellman-Ford tolerates negative edges and reports a negative cycle if one is reachable. On a directed acyclic graph, one pass in topological order is enough. Floyd-Warshall answers all pairs at once.',
      keyword: 'which one is legal depends on the weights',
      trap: 'The three families are not interchangeable. Choosing Dijkstra because it is fastest, on a graph with a negative edge, gives a wrong number rather than a slow one.',
      narration: 'The third question is travel: from one source, what is the cheapest route to every other vertex? Three families answer it, and which one is legal depends on the weights.'
    },

    /* ---------------- scene 2: BFS ---------------- */
    {
      id: 'bfs-1', start: 30, end: 37.5, scene: 'bfs',
      caption: 'Breadth-first search from A. A holds a queue, and the source goes in first with distance zero.',
      detail: 'The queue holds vertices that have been discovered but whose own edges have not yet been examined. Marking a vertex when it is enqueued, not when it is dequeued, is what keeps the work at one examination per edge.',
      keyword: 'the source goes in first with distance zero',
      trap: 'Marking on dequeue instead of enqueue lets a vertex enter the queue several times, and the running time then depends on the number of paths rather than the number of edges.',
      narration: 'Breadth-first search from A. A holds a queue, and the source goes in first with distance zero.'
    },
    {
      id: 'bfs-2', start: 37.5, end: 45, scene: 'bfs',
      caption: 'Dequeue A, and give every unvisited neighbour the distance one and a place in the queue. That is level one: B and C.',
      detail: 'The neighbours are taken in the order the adjacency list stores them. Every vertex discovered from A gets distance one and parent A, so the two tree edges A-B and A-C are fixed at this moment and never revised.',
      keyword: 'That is level one: B and C',
      trap: 'The order inside a level depends on the adjacency order, so the BFS order is not unique. The level of each vertex is unique, and that is the part questions ask about.',
      narration: 'Dequeue A, and give every unvisited neighbour the distance one and a place in the queue. That is level one: B and C.'
    },
    {
      id: 'bfs-3', start: 45, end: 52.5, scene: 'bfs',
      caption: 'Level two is D, E and F; level three is G; level four is H. The tree records one shortest route to each vertex.',
      detail: 'Distances come out as A zero, B and C one, D, E and F two, G three, H four. A separate brute-force relaxation over all edges, run independently of the search, produces the same numbers, which is the check the page performs.',
      keyword: 'The tree records one shortest route to each vertex',
      trap: 'A BFS tree is a shortest-path tree only when every edge costs the same. Put weights on the edges and the tree stops being shortest.',
      narration: 'Level two is D, E and F; level three is G; level four is H. The tree records one shortest route to each vertex.'
    },
    {
      id: 'bfs-4', start: 52.5, end: 60, scene: 'bfs',
      caption: 'Every edge that is not in the BFS tree joins two vertices whose levels differ by at most one. That is the property GATE asked about in 2015.',
      detail: 'An edge inside a level is fine, and an edge between adjacent levels is fine. An edge whose endpoints differ by two levels would contradict the search: when the nearer endpoint was dequeued, the farther one would have been discovered one level lower.',
      keyword: 'whose levels differ by at most one',
      trap: 'The difference can be zero, one or minus one. The value that cannot occur is any magnitude of two or more, which is why the 2015 answer is the option giving two.',
      narration: 'Every edge that is not in the BFS tree joins two vertices whose levels differ by at most one. That is the property GATE asked about in 2015.'
    },

    /* ---------------- scene 3: DFS ---------------- */
    {
      id: 'dfs-1', start: 60, end: 67.5, scene: 'dfs',
      caption: 'Depth-first search from A. Instead of a queue it uses a stack, which is what a recursive call amounts to.',
      detail: 'The search goes as deep as it can, then returns and tries the next neighbour of the vertex it came from. The stack holds the vertices on the current path, so its height is the depth reached, not the number of vertices.',
      keyword: 'it uses a stack',
      trap: 'Recursion depth is not the number of vertices. It is the longest path followed before a return, which is why a DFS can overflow a small stack on a long chain.',
      narration: 'Depth-first search from A. Instead of a queue it uses a stack, which is what a recursive call amounts to.'
    },
    {
      id: 'dfs-2', start: 67.5, end: 75, scene: 'dfs',
      caption: 'Discovery times are written on the way in: A gets one, B two, D three, and so on down the chain to H at eight.',
      detail: 'Each vertex receives a discovery time when it is first met and a finish time when all of its neighbours have been dealt with. Both counters come from one clock that ticks once per event, so the two sets of times interleave.',
      keyword: 'Discovery times are written on the way in',
      trap: 'The discovery time is not the distance from the source. H is discovered eighth and sits four edges from A, while in a different graph the eighth discovery could be two edges away.',
      narration: 'Discovery times are written on the way in: A gets one, B two, D three, and so on down the chain to H at eight.'
    },
    {
      id: 'dfs-3', start: 75, end: 82.5, scene: 'dfs',
      caption: 'Finish times are written on the way out, so every vertex finishes after all of its descendants. That nesting is the parenthesis property.',
      detail: 'A finishes last, at sixteen. The intervals either nest or are disjoint, never partly overlap: if u is discovered inside v and v finishes after u, then the whole of u sits inside v. The page checks every pair of intervals for exactly that.',
      keyword: 'every vertex finishes after all of its descendants',
      trap: 'Timestamps are not comparable across different runs. Two correct runs on the same graph can number the vertices differently, so a question must fix the adjacency order before asking for a time.',
      narration: 'Finish times are written on the way out, so every vertex finishes after all of its descendants. That nesting is the parenthesis property.'
    },
    {
      id: 'dfs-4', start: 82.5, end: 90, scene: 'dfs',
      caption: 'Three edges are not in the DFS tree: A-C, D-E and C-F. Each joins a vertex to its own ancestor, so each is a back edge.',
      detail: 'In an undirected graph every non-tree edge is a back edge. There are no forward edges and no cross edges, because the first time either endpoint of an edge is visited, the other is still unvisited and becomes a child.',
      keyword: 'each is a back edge',
      trap: 'The claim "no cross edges" is a property of undirected graphs only. In a directed graph a cross edge between two finished branches is perfectly possible, and that is what makes SCC algorithms work.',
      narration: 'Three edges are not in the DFS tree: A-C, D-E and C-F. Each joins a vertex to its own ancestor, so each is a back edge.'
    },

    /* ---------------- scene 4: BFS against DFS ---------------- */
    {
      id: 'compare-1', start: 90, end: 97.5, scene: 'compare',
      caption: 'Both traversals visit every vertex and every edge once, so both cost the number of vertices plus the number of edges on a list.',
      detail: 'On an adjacency list, each vertex enters the queue or the stack once and each edge is examined at most twice, once from each endpoint. On an adjacency matrix every vertex scans a whole row, so the cost is the number of vertices squared even when there are almost no edges.',
      keyword: 'the number of vertices plus the number of edges',
      trap: 'The two costs coincide on a dense graph and differ enormously on a sparse one. Saying a traversal is linear without naming the representation is an incomplete answer.',
      narration: 'Both traversals visit every vertex and every edge once, so both cost the number of vertices plus the number of edges on a list.'
    },
    {
      id: 'compare-2', start: 97.5, end: 105, scene: 'compare',
      caption: 'BFS gives the fewest-edges distance. DFS gives no distance at all, and on this graph its tree is seven levels deep where BFS needs four.',
      detail: 'The BFS tree from A has height four, which is the true eccentricity of A. The DFS tree from A has height seven, because the search followed A-B-D-C-E-F-G-H rather than the short route through C. Both are spanning trees of the same graph.',
      keyword: 'seven levels deep where BFS needs four',
      trap: 'This is the 2025 statement that a DFS tree is a shortest-path tree. It is false, and this one graph is the refutation, not an illustration of a difficulty.',
      narration: 'BFS gives the fewest-edges distance. DFS gives no distance at all, and on this graph its tree is seven levels deep where BFS needs four.'
    },
    {
      id: 'compare-3', start: 105, end: 112.5, scene: 'compare',
      caption: 'So each traversal is the tool for a different job: BFS for distance and levels, DFS for structure, cycles, and order.',
      detail: 'BFS answers distance, level, and bipartiteness. DFS answers connectivity of a directed graph through strongly connected components, finds articulation points and bridges through discovery times, and produces a topological order of a DAG by reversing finish times.',
      keyword: 'BFS for distance and levels, DFS for structure',
      trap: 'Both find connected components of an undirected graph, so a statement saying only one can is false. The split appears in directed graphs and in structural questions.',
      narration: 'So each traversal is the tool for a different job: BFS for distance and levels, DFS for structure, cycles, and order.'
    },
    {
      id: 'compare-4', start: 112.5, end: 120, scene: 'compare',
      caption: 'Neither traversal looks at weights, so neither can answer a question about cost. Weighted questions need the two algorithms of the next scenes.',
      detail: 'A traversal minimises the number of edges. A weighted graph asks about the sum of weights. Those are different objectives, which is why a minimum spanning tree and a shortest-path tree can be different trees on the same graph, and why the algorithms that compute them are different algorithms.',
      keyword: 'Neither traversal looks at weights',
      trap: 'Reading a BFS off a weighted graph and calling the result shortest is the single most common mistake in this topic. It answers an unweighted question that was not asked.',
      narration: 'Neither traversal looks at weights, so neither can answer a question about cost. Weighted questions need the two algorithms of the next scenes.'
    },

    /* ---------------- scene 5: cut and cycle properties ---------------- */
    {
      id: 'cutcycle-1', start: 120, end: 127.5, scene: 'cutcycle',
      caption: 'A cut splits the vertices into two groups. An edge crosses the cut when its two ends are in different groups.',
      detail: 'A cut is written as a pair of sets whose union is every vertex and which share nothing. In a connected graph at least one edge crosses every cut, and a spanning tree must cross every cut at least once, or it could not be connected.',
      keyword: 'An edge crosses the cut when its two ends are in different groups',
      trap: 'The cut is a partition of the vertices, not of the edges. An edge inside one side of the cut is irrelevant to it, however heavy or light it is.',
      narration: 'A cut splits the vertices into two groups. An edge crosses the cut when its two ends are in different groups.'
    },
    {
      id: 'cutcycle-2', start: 127.5, end: 135, scene: 'cutcycle',
      caption: 'The cut property: the lightest edge crossing a cut belongs to some minimum spanning tree. If its weight is unique, it belongs to every one.',
      detail: 'The proof is an exchange. Take a minimum tree that omits the lightest crossing edge e. Adding e makes a cycle, and that cycle must cross the cut again somewhere, at an edge f of weight at least that of e. Swap f for e: the tree stays a tree and its weight does not increase, so a minimum tree containing e exists.',
      keyword: 'belongs to some minimum spanning tree',
      trap: 'The property gives membership in some minimum tree, not in all of them. Uniqueness of the weight is what upgrades the claim, and without it a tie can send different trees different ways.',
      narration: 'The cut property: the lightest edge crossing a cut belongs to some minimum spanning tree. If its weight is unique, it belongs to every one.'
    },
    {
      id: 'cutcycle-3', start: 135, end: 142.5, scene: 'cutcycle',
      caption: 'The cycle property: the heaviest edge on a cycle belongs to no minimum spanning tree, provided it is strictly heavier than the rest.',
      detail: 'Take a tree that contains the heaviest edge of some cycle. Removing it splits the tree in two, and the rest of the cycle provides another edge across that split, of strictly smaller weight. Adding that edge reconnects the tree more cheaply, which contradicts minimality.',
      keyword: 'belongs to no minimum spanning tree',
      trap: 'Strictly heavier is required. If the cycle has two edges of the same maximum weight, one of them may well be in a minimum tree, so the property as usually quoted needs its condition.',
      narration: 'The cycle property: the heaviest edge on a cycle belongs to no minimum spanning tree, provided it is strictly heavier than the rest.'
    },
    {
      id: 'cutcycle-4', start: 142.5, end: 150, scene: 'cutcycle',
      caption: 'Distinct weights force a unique minimum tree, but a unique minimum tree does not need distinct weights. The implication runs one way only.',
      detail: 'If two different minimum trees existed with all weights distinct, the symmetric difference of the two trees contains a cycle on which one tree uses a strictly heavier edge, and the exchange would improve it. The converse fails: the four-vertex instance in this lesson has repeated weights and still exactly one minimum tree.',
      keyword: 'The implication runs one way only',
      trap: 'A question that says "weights are distinct, so the minimum tree is unique" is using the true direction. A question that concludes "the minimum tree is unique, so the weights are distinct" is using the false one.',
      narration: 'Distinct weights force a unique minimum tree, but a unique minimum tree does not need distinct weights. The implication runs one way only.'
    },

    /* ---------------- scene 6: Kruskal ---------------- */
    {
      id: 'kruskal-1', start: 150, end: 157.5, scene: 'kruskal',
      caption: 'Kruskal sorts all nine edges by weight and walks the list once, from the lightest to the heaviest.',
      detail: 'The sort is the only preparation. After it, each edge is either accepted into the forest or rejected, and no edge is ever reconsidered. Sorting nine edges costs a constant; on m edges it costs m log m comparisons.',
      keyword: 'walks the list once',
      trap: 'The sort dominates the running time, so Kruskal is m log m, not m. Saying it is linear because the scan is linear leaves out the expensive half.',
      narration: 'Kruskal sorts all nine edges by weight and walks the list once, from the lightest to the heaviest.'
    },
    {
      id: 'kruskal-2', start: 157.5, end: 165, scene: 'kruskal',
      caption: 'An edge is accepted unless its two endpoints are already connected. Union-find answers that question in almost constant time per edge.',
      detail: 'Each accepted edge merges two components. B-C at weight two is accepted and merges B and C. A-B at weight four is accepted. A-C at weight four is rejected, because A and C are already in the same component through B, and adding it would close a cycle.',
      keyword: 'unless its two endpoints are already connected',
      trap: 'The rejection test is connectivity, not "does this edge form a triangle". A long cycle is rejected exactly the same way, on its last edge, when both ends are already in one component.',
      narration: 'An edge is accepted unless its two endpoints are already connected. Union-find answers that question in almost constant time per edge.'
    },
    {
      id: 'kruskal-3', start: 165, end: 172.5, scene: 'kruskal',
      caption: 'Five edges are accepted and four are rejected. The accepted set is B-C, A-B, B-D, D-F and E-F, with total weight 24.',
      detail: 'Six vertices need five edges, so the forest is complete before the list ends. The remaining edges are rejected because their endpoints are already connected, and the two edges of weight nine are never even needed.',
      keyword: 'total weight 24',
      trap: 'Stopping as soon as five edges are accepted is correct only when the graph is connected. On a disconnected graph the forest has fewer edges and the answer is a minimum spanning forest.',
      narration: 'Five edges are accepted and four are rejected. The accepted set is B-C, A-B, B-D, D-F and E-F, with total weight 24.'
    },
    {
      id: 'kruskal-4', start: 172.5, end: 180, scene: 'kruskal',
      caption: 'Why it is correct: every accepted edge is the lightest edge across the cut formed by its two components at that moment, so the cut property applies.',
      detail: 'Because the list is in increasing weight order, when an edge is considered no lighter edge crosses the cut between its two components, or one would have been accepted earlier and the components would already be joined. The accepted edge is therefore the lightest crossing edge, and the cut property admits it into some minimum tree.',
      keyword: 'the lightest edge across the cut formed by its two components',
      trap: 'This argument depends on processing in sorted order. Take the edges in an arbitrary order, accept every edge that does not close a cycle, and you get a spanning tree that is usually not minimum.',
      narration: 'Why it is correct: every accepted edge is the lightest edge across the cut formed by its two components at that moment, so the cut property applies.'
    },

    /* ---------------- scene 7: Prim ---------------- */
    {
      id: 'prim-1', start: 180, end: 187.5, scene: 'prim',
      caption: 'Prim also starts at A, but it grows one tree instead of a forest. Every vertex outside the tree keeps a key: the cheapest edge joining it to the tree.',
      detail: 'The key array starts at zero for the source and infinity for everyone else. After each vertex joins the tree, the keys of its neighbours are lowered if a cheaper joining edge has appeared. The parent array records which tree vertex offered that key.',
      keyword: 'the cheapest edge joining it to the tree',
      trap: 'The key of a vertex is a single edge weight, not a path length. Prim is not accumulating distance, which is exactly what separates it from Dijkstra.',
      narration: 'Prim also starts at A, but it grows one tree instead of a forest. Every vertex outside the tree keeps a key: the cheapest edge joining it to the tree.'
    },
    {
      id: 'prim-2', start: 187.5, end: 195, scene: 'prim',
      caption: 'Extract the smallest key, add that vertex, then lower the keys of its neighbours. From A, B and C both offer four, so the tie is broken by the rule this page states.',
      detail: 'The tie-break here takes the later label first, so C joins at four and A-C is taken. B immediately improves to two through C, and joins next. This is a legal minimum tree and a different set of edges from Kruskal, which is the point of the scene.',
      keyword: 'so the tie is broken by the rule this page states',
      trap: 'Kruskal and Prim can return different edge sets and must return the same total weight. A question asking for the weight has one answer; one asking for the edges may have several.',
      narration: 'Extract the smallest key, add that vertex, then lower the keys of its neighbours. From A, B and C both offer four, so the tie is broken by the rule this page states.'
    },
    {
      id: 'prim-3', start: 195, end: 202.5, scene: 'prim',
      caption: 'The extraction order is A, C, B, D, F, E and the total is 24, the same number Kruskal produced by a different route.',
      detail: 'Each extracted key is the weight of the edge that joins that vertex to the tree: A zero, C four, B two, D five, F six, E seven. Their sum is twenty-four. The exhaustive enumeration of all fifty-five spanning trees of this graph confirms that twenty-four is the minimum.',
      keyword: 'the same number Kruskal produced by a different route',
      trap: 'Agreement between the two algorithms is a check on the arithmetic, not a proof of either. Both are proved by the cut property, and the agreement follows from that.',
      narration: 'The extraction order is A, C, B, D, F, E and the total is 24, the same number Kruskal produced by a different route.'
    },
    {
      id: 'prim-4', start: 202.5, end: 210, scene: 'prim',
      caption: 'The cost depends on the data structure: a binary heap gives E log V, a plain array scanning for the minimum gives V squared.',
      detail: 'The array version does V extractions, each scanning V keys, plus V squared updates, so V squared overall, which is better on dense graphs. The heap version does V extractions and E key updates at logarithmic cost, so E log V, which is better on sparse graphs.',
      keyword: 'a binary heap gives E log V',
      trap: 'Neither is simply "the complexity of Prim". GATE has asked for both, and the correct answer follows the data structure named in the question, not the algorithm name.',
      narration: 'The cost depends on the data structure: a binary heap gives E log V, a plain array scanning for the minimum gives V squared.'
    },

    /* ---------------- scene 8: counting minimum spanning trees ---------------- */
    {
      id: 'countmst-1', start: 210, end: 217.5, scene: 'countmst',
      caption: 'The 2024 question gives a seven-vertex graph and asks how many distinct minimum spanning trees it has.',
      detail: 'Seven vertices need six edges. The edge weights are four ones, six twos and two threes. Any minimum tree uses six edges, and the question is how many different sets of six reach the minimum total.',
      keyword: 'how many distinct minimum spanning trees',
      trap: 'Distinct means a different set of edges. Two trees that differ only in which endpoint is called the parent are the same tree, and an undirected tree has no parent.',
      narration: 'The 2024 question gives a seven-vertex graph and asks how many distinct minimum spanning trees it has.'
    },
    {
      id: 'countmst-2', start: 217.5, end: 225, scene: 'countmst',
      caption: 'All four weight-one edges are forced. No cheaper path joins their endpoints, so by the cut property every minimum tree contains all four.',
      detail: 'The four edges are A-B, A-F, C-D and D-E. They form two small stars and contain no cycle. For each of them, the endpoints cannot be joined by a route using only other weight-one edges, so the edge is the lightest across the cut that separates its component from the rest.',
      keyword: 'All four weight-one edges are forced',
      trap: 'Being light is not the same as being forced. An edge is forced when no equal or lighter alternative path exists between its endpoints, which has to be checked rather than assumed.',
      narration: 'All four weight-one edges are forced. No cheaper path joins their endpoints, so by the cut property every minimum tree contains all four.'
    },
    {
      id: 'countmst-3', start: 225, end: 232.5, scene: 'countmst',
      caption: 'Those four edges collapse the graph into three pieces: the pair A, B, F; the triple C, D, E; and the centre vertex G on its own.',
      detail: 'Two more edges are needed to join three pieces into one, and both must have weight two, since every edge of weight three costs more. The only weight-two edges available are the six joining G to each of the other vertices.',
      keyword: 'three pieces',
      trap: 'Counting the ways to pick two of the six weight-two edges gives fifteen, which is wrong. Most pairs leave a piece unconnected or close a cycle.',
      narration: 'Those four edges collapse the graph into three pieces: the pair A, B, F; the triple C, D, E; and the centre vertex G on its own.'
    },
    {
      id: 'countmst-4', start: 232.5, end: 240, scene: 'countmst',
      caption: 'One edge must join G to the first piece and one to the second, chosen independently: three ways each, so nine trees, total weight eight.',
      detail: 'The three choices from G into the first piece are G-A, G-B, G-F, and the three into the second are G-C, G-D, G-E. Each of the nine combinations is a spanning tree of total weight four plus two plus two, which is eight. The page enumerates all three hundred and twenty spanning trees of the graph and finds exactly nine at weight eight, matching the official key.',
      keyword: 'three ways each, so nine trees',
      trap: 'The multiplication is valid only because the two choices are independent. If a single edge could serve both pieces, the product would double-count.',
      narration: 'One edge must join G to the first piece and one to the second, chosen independently: three ways each, so nine trees, total weight eight.'
    },

    /* ---------------- scene 9: Dijkstra ---------------- */
    {
      id: 'dijkstra-1', start: 240, end: 247.5, scene: 'dijkstra',
      caption: 'Dijkstra on a directed graph with non-negative weights. Every distance starts at infinity except the source, which is zero.',
      detail: 'The tentative distance of a vertex is the best route found so far. Dijkstra repeatedly takes the unsettled vertex with the smallest tentative distance, declares it settled, and relaxes its outgoing edges.',
      keyword: 'Every distance starts at infinity',
      trap: 'The tentative distance is not a distance until the vertex is settled. Reading the array mid-run and calling the numbers the answer is the most common tracing error.',
      narration: 'Dijkstra on a directed graph with non-negative weights. Every distance starts at infinity except the source, which is zero.'
    },
    {
      id: 'dijkstra-2', start: 247.5, end: 255, scene: 'dijkstra',
      caption: 'Settle s, then relax: A becomes four and B becomes one. B is the smallest unsettled, so B is settled next.',
      detail: 'Relaxing means comparing the tentative distance with the settled distance plus the edge weight, and keeping the smaller. From s, the edges give A four and B one, and D is not reachable directly from s in this graph.',
      keyword: 'B is the smallest unsettled, so B is settled next',
      trap: 'Settling order is by tentative distance, not by label and not by discovery order. A vertex with a large label can be settled before a vertex with a small one.',
      narration: 'Settle s, then relax: A becomes four and B becomes one. B is the smallest unsettled, so B is settled next.'
    },
    {
      id: 'dijkstra-3', start: 255, end: 262.5, scene: 'dijkstra',
      caption: 'B settles at one and improves A to three. Then A at three, D at seven, C at eight, and finally T at eight.',
      detail: 'From B, A improves from four to three and D becomes seven. From A, C becomes eight and T would be fourteen, so it stays at infinity for now. From D, T becomes eight. From C, nothing improves. The final array is s zero, B one, A three, D seven, C eight, T eight.',
      keyword: 'finally T at eight',
      trap: 'The route to T is s-B-D-T at eight, not the direct-looking s-A-T at fifteen. Reading the parent array is how the route is recovered, and the parent of T is D.',
      narration: 'B settles at one and improves A to three. Then A at three, D at seven, C at eight, and finally T at eight.'
    },
    {
      id: 'dijkstra-4', start: 262.5, end: 270, scene: 'dijkstra',
      caption: 'The guarantee rests on one fact: once a vertex is settled, no later route can be shorter, because every edge is non-negative.',
      detail: 'Suppose a shorter route to a settled vertex u existed. It would leave the settled set at some edge, and the vertex just outside the set would have a tentative distance no larger than that route, so u could not have been the smallest. Non-negativity is what makes "no larger" hold.',
      keyword: 'no later route can be shorter',
      trap: 'That argument needs every edge to be non-negative. One negative edge breaks the step where a route through an unsettled vertex is assumed no cheaper, and the algorithm then reports a wrong number silently.',
      narration: 'The guarantee rests on one fact: once a vertex is settled, no later route can be shorter, because every edge is non-negative.'
    },

    /* ---------------- scene 10: where Dijkstra breaks ---------------- */
    {
      id: 'negative-1', start: 270, end: 277.5, scene: 'negative',
      caption: 'Four vertices, one negative edge: s to A costs one, s to B costs two, and B to A costs minus two. The true distance to A is zero.',
      detail: 'The route s to B to A costs two minus two, which is zero, and beats the direct edge. The true distance to T is then zero plus one, which is one. Any correct algorithm must report those numbers.',
      keyword: 'The true distance to A is zero',
      trap: 'A negative edge is not the same as a negative cycle. This graph has no cycle at all, so shortest paths are perfectly well defined; the difficulty is entirely Dijkstra\'s.',
      narration: 'Four vertices, one negative edge: s to A costs one, s to B costs two, and B to A costs minus two. The true distance to A is zero.'
    },
    {
      id: 'negative-2', start: 277.5, end: 285, scene: 'negative',
      caption: 'Dijkstra settles A at one, before B is even considered, and never revisits it. It reports two for T where the answer is one.',
      detail: 'The extraction order is s, then A at one, then B at two. When B is settled its negative edge would improve A from one to zero, but A is already settled and a settled distance is final by definition, so the improvement is discarded. T keeps the value two that it received from A.',
      keyword: 'never revisits it',
      trap: 'The failure is silent. Nothing crashes, no flag is raised, and the array looks plausible. Only a second algorithm, or an explicit check for negative weights, catches it.',
      narration: 'Dijkstra settles A at one, before B is even considered, and never revisits it. It reports two for T where the answer is one.'
    },
    {
      id: 'negative-3', start: 285, end: 292.5, scene: 'negative',
      caption: 'Bellman-Ford relaxes every edge once per round, for one round fewer than there are vertices, and gets the true distances.',
      detail: 'Two rounds are enough here. The first round finds A at one and B at two; the second finds the improvement to A at zero and then to T at one. A further round with an improvement would mean a negative cycle is reachable, which is how the algorithm reports one.',
      keyword: 'one round fewer than there are vertices',
      trap: 'The round count is vertices minus one, not vertices. Running one extra round is the detection step, not part of the distance computation.',
      narration: 'Bellman-Ford relaxes every edge once per round, for one round fewer than there are vertices, and gets the true distances.'
    },
    {
      id: 'negative-4', start: 292.5, end: 300, scene: 'negative',
      caption: 'Three more tools: one topological pass on a DAG, Floyd-Warshall for all pairs, and the rule that picks between them.',
      detail: 'On a directed acyclic graph, processing vertices in topological order settles each distance in one pass, because when a vertex is processed all routes into it are already final. Floyd-Warshall relaxes through each possible intermediate vertex in turn, which is three nested loops over the vertex set.',
      keyword: 'one topological pass on a DAG',
      trap: 'Floyd-Warshall tolerates negative edges but not negative cycles, and it costs the cube of the vertex count. Using it for a single source on a sparse graph is legal and wasteful.',
      narration: 'Three more tools: one topological pass on a DAG, Floyd-Warshall for all pairs, and the rule that picks between them.'
    },

    /* ---------------- scene 11: the table ---------------- */
    {
      id: 'decide-1', start: 300, end: 307.5, scene: 'decide',
      caption: 'Ask four questions in order. Is there a source, or do I need all pairs? Are there weights? Are any weights negative? Is the graph acyclic?',
      detail: 'The answers pick the algorithm mechanically. No weights means a traversal. All pairs means Floyd-Warshall unless the graph is sparse and positive. Negative weights rule out Dijkstra. Acyclic rules out the need for rounds.',
      keyword: 'Ask four questions in order',
      trap: 'The order matters. Asking "which is fastest" first leads to Dijkstra on a graph that has a negative edge, which is the wrong answer with the right running time.',
      narration: 'Ask four questions in order. Is there a source, or do I need all pairs? Are there weights? Are any weights negative? Is the graph acyclic?'
    },
    {
      id: 'decide-2', start: 307.5, end: 315, scene: 'decide',
      caption: 'BFS and DFS cost V plus E on a list and V squared on a matrix. Kruskal costs E log E. Prim costs E log V with a heap or V squared with an array.',
      detail: 'These five costs are the ones that appear in questions. The logarithmic factors come from a sort or a heap, and the squared ones come from scanning a row or an array of keys.',
      keyword: 'BFS and DFS cost V plus E on a list',
      trap: 'E log E and E log V are both correct for Kruskal, since E is at most V squared and the log differs by a constant factor. Both are accepted; E log V is the more usual form.',
      narration: 'BFS and DFS cost V plus E on a list and V squared on a matrix. Kruskal costs E log E. Prim costs E log V with a heap or V squared with an array.'
    },
    {
      id: 'decide-3', start: 315, end: 322.5, scene: 'decide',
      caption: 'Dijkstra costs E log V, Bellman-Ford V times E, a DAG pass V plus E, and Floyd-Warshall V cubed.',
      detail: 'Bellman-Ford on a complete graph is V rounds of V squared edges, so V cubed, which is the 2013 question. A DAG pass is linear because each edge is relaxed once. Floyd-Warshall is cubic on any graph.',
      keyword: 'Dijkstra costs E log V',
      trap: 'Dijkstra with a plain array is V squared, not E log V. The heap is what buys the logarithm, and GATE has asked for both versions.',
      narration: 'Dijkstra costs E log V, Bellman-Ford V times E, a DAG pass V plus E, and Floyd-Warshall V cubed.'
    },
    {
      id: 'decide-4', start: 322.5, end: 330, scene: 'decide',
      caption: 'One sentence to keep: a minimum spanning tree minimises the total, a shortest-path tree minimises each route, and the two are different trees.',
      detail: 'On the six-vertex graph of this lesson the minimum tree has weight twenty-four, and the route it offers from A to E costs twenty-two, while the cheapest route in the graph costs thirteen. Both trees are correct for their own question, and neither substitutes for the other.',
      keyword: 'the two are different trees',
      trap: 'Every MST question and every shortest-path question is a different question. An answer that uses one to settle the other is wrong even when the numbers happen to look reasonable.',
      narration: 'One sentence to keep: a minimum spanning tree minimises the total, a shortest-path tree minimises each route, and the two are different trees.'
    }
  ]
};
