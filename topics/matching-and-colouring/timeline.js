/* ==========================================================================
   matching-and-colouring — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 330,

  scenes: [
    {
      id: 'questions', n: 1, title: 'Two questions on one graph',
      start: 0, end: 30,
      objective: 'See that a matching chooses edges while a colouring partitions vertices, that both are about avoiding a shared endpoint, and that neither is a property of the drawing.'
    },
    {
      id: 'vocab', n: 2, title: 'What a matching is, and is not',
      start: 30, end: 60,
      objective: 'Separate a matching from a maximal matching from a maximum matching, define saturated and perfect, and see a maximal matching that is not maximum.'
    },
    {
      id: 'augmenting', n: 3, title: 'The augmenting path',
      start: 60, end: 90,
      objective: 'Trace an alternating path between two free vertices, flip its edges, and see why Berge\u2019s theorem makes "no augmenting path" the exact test for maximum.'
    },
    {
      id: 'hall', n: 4, title: "Hall's condition",
      start: 90, end: 120,
      objective: 'State Hall\u2019s condition over every subset of one side, find the violating subset in a graph that fails, and see why the condition is sufficient as well as necessary.'
    },
    {
      id: 'konig', n: 5, title: "Konig's theorem and the cover",
      start: 120, end: 150,
      objective: 'Define a vertex cover, watch the maximum matching and the minimum cover meet in a bipartite graph, and see equality fail on a triangle.'
    },
    {
      id: 'families', n: 6, title: 'Chromatic number of the standard families',
      start: 150, end: 180,
      objective: 'Read the chromatic number of complete graphs, cycles, trees and bipartite graphs from their structure, and use the clique number as a lower bound without treating it as equal.'
    },
    {
      id: 'greedy', n: 7, title: 'Greedy colouring and maximum degree plus one',
      start: 180, end: 210,
      objective: 'Run first-fit greedy, prove the bound at most maximum degree plus one, and see the same graph need three colours in one order and two in another.'
    },
    {
      id: 'brooks', n: 8, title: "Brooks' theorem and the gap to delta",
      start: 210, end: 240,
      objective: 'State Brooks\u2019 theorem with both of its exceptions, and see how far the chromatic number can sit below the maximum degree.'
    },
    {
      id: 'edge', n: 9, title: 'Edge colouring',
      start: 240, end: 270,
      objective: 'Define the chromatic index, see that it equals the maximum degree on every bipartite graph, and place every graph within Vizing\u2019s one-colour window.'
    },
    {
      id: 'planar', n: 10, title: 'Planarity: what cannot be drawn flat',
      start: 270, end: 300,
      objective: 'Use Euler\u2019s formula to get the edge bounds, see K5 and K3,3 break them, and know why every planar graph is 4-colourable but not necessarily 3-colourable.'
    },
    {
      id: 'procedure', n: 11, title: 'The procedure and three traps',
      start: 300, end: 330,
      objective: 'Run a fixed five-question procedure on an unfamiliar matching or colouring question, and recognise the three traps that cost marks.'
    }
  ],

  events: [

    /* ---------------- scene 1: two questions ---------------- */
    {
      id: 'q-1', start: 0, end: 7, scene: 'questions',
      caption: 'Two questions, one graph. A matching picks edges that share no endpoint. A colouring splits the vertices into groups with no edge inside a group.',
      detail: 'A matching is a set of edges, no two of which touch the same vertex. A colouring is a labelling of the vertices so that the two ends of every edge get different labels. The number of labels used is the number of colours.',
      keyword: 'matching',
      narration: 'Two questions on one graph. A matching picks edges that share no endpoint. A colouring splits the vertices into groups with no edge inside a group.'
    },
    {
      id: 'q-2', start: 7, end: 15, scene: 'questions',
      caption: 'Here the three thick edges are a matching of size 3. No two of them meet, so no vertex is used twice.',
      detail: 'Size means the number of edges in the matching, not the number of vertices it touches. A matching of size 3 covers six endpoints, so on this six-vertex graph it covers every vertex exactly once.',
      keyword: 'size 3',
      narration: 'Here the three thick edges are a matching of size three. No two of them meet, so no vertex is used twice.'
    },
    {
      id: 'q-3', start: 15, end: 23, scene: 'questions',
      caption: 'On the same graph, three colours suffice: each colour class is an independent set, and every edge crosses between two classes.',
      detail: 'A colour class is the set of vertices carrying one colour. Saying no edge has both ends the same colour is the same as saying every colour class is an independent set, which is the same as saying every edge crosses between two classes.',
      keyword: 'independent set',
      trap: 'The two questions are duals of a kind: a matching is a set of edges that behave like a colour class, and a colour class is a set of vertices that behave like the endpoints of a matching edge.',
      narration: 'On the same graph, three colours suffice. Each colour class is an independent set, and every edge crosses between two classes.'
    },
    {
      id: 'q-4', start: 23, end: 30, scene: 'questions',
      caption: 'Both numbers are computed from the vertex set and the edge set. Move the vertices and nothing changes; the picture is not the object.',
      detail: 'A matching and a colouring are both defined on the pair of sets. Any redrawing of the same graph gives the same maximum matching size and the same chromatic number, because neither definition mentions where a vertex is drawn.',
      keyword: 'computed',
      narration: 'Both numbers are computed from the vertex set and the edge set. Move the vertices and nothing changes. The picture is not the object.'
    },

    /* ---------------- scene 2: matching vocabulary ---------------- */
    {
      id: 'v-1', start: 30, end: 37, scene: 'vocab',
      caption: 'A matching M is a set of edges with no shared endpoint. A vertex is saturated by M if an edge of M touches it, and free otherwise.',
      detail: 'Two edges that share a vertex are said to be adjacent. A matching is a set of pairwise non-adjacent edges. Saturated and free describe vertices with respect to one particular matching, so the same vertex can be saturated by one matching and free by another.',
      keyword: 'saturated',
      narration: 'A matching is a set of edges with no shared endpoint. A vertex is saturated if an edge of the matching touches it, and free otherwise.'
    },
    {
      id: 'v-2', start: 37, end: 45, scene: 'vocab',
      caption: 'Maximal means no further edge can be added. Maximum means no matching on this graph is larger. The first is about this set, the second about the whole graph.',
      detail: 'A maximal matching cannot be extended by adding one more edge. A maximum matching has the largest possible size among all matchings of the graph. Every maximum matching is maximal, and this scene shows a maximal matching of size 2 next to a maximum one of size 3.',
      keyword: 'maximal',
      trap: 'Maximal and maximum are different words with different definitions. A maximal matching can be strictly smaller than a maximum matching, so "cannot be extended" never proves "is largest".',
      narration: 'Maximal means no further edge can be added. Maximum means no matching on this graph is larger. The first is about this set, the second about the whole graph.'
    },
    {
      id: 'v-3', start: 45, end: 52, scene: 'vocab',
      caption: 'The two thick edges are maximal: every other edge touches a saturated vertex. Yet three edges fit, so they are not maximum.',
      detail: 'Here the greedy choice of two edges blocks every remaining edge at both ends. The alternative set of three edges uses different vertices entirely, and no edge of it touches another. Both sets are matchings; only one is maximum.',
      keyword: 'maximal',
      narration: 'The two thick edges are maximal, because every other edge touches a saturated vertex. Yet three edges fit, so they are not maximum.'
    },
    {
      id: 'v-4', start: 52, end: 60, scene: 'vocab',
      caption: 'A perfect matching saturates every vertex, so it exists only when the vertex count is even. Maximum matching size is written with the Greek letter nu.',
      detail: 'A perfect matching has size exactly n divided by 2, which forces n to be even. A near-perfect matching leaves exactly one vertex free, which forces n to be odd. The size of a largest matching is written nu of G, and it is always at most n divided by 2.',
      keyword: 'perfect',
      trap: 'A perfect matching is a maximum matching of a special size, not a different kind of object. Every perfect matching is maximum; a maximum matching is perfect only when it saturates everything.',
      narration: 'A perfect matching saturates every vertex, so it exists only when the vertex count is even. The size of a largest matching is written nu of G.'
    },

    /* ---------------- scene 3: augmenting paths ---------------- */
    {
      id: 'a-1', start: 60, end: 67, scene: 'augmenting',
      caption: 'An alternating path starts at a free vertex, alternates between edges not in the matching and edges in it, and ends at a free vertex.',
      detail: 'Alternating means the edges take turns: outside the matching, inside it, outside it, and so on. Because the path starts and ends outside the matching, it has one more non-matching edge than matching edges.',
      keyword: 'alternating',
      narration: 'An alternating path starts at a free vertex, alternates between edges not in the matching and edges in it, and ends at a free vertex.'
    },
    {
      id: 'a-2', start: 67, end: 75, scene: 'augmenting',
      caption: 'Such a path is called augmenting. Swap every edge on it: drop the matching edges, take the others. The matching grows by exactly one.',
      detail: 'The path has k plus one non-matching edges and k matching edges. After the swap it has k plus one matching edges and k non-matching ones, so the size rises by one, and every vertex still has at most one matching edge at it.',
      keyword: 'augmenting',
      narration: 'Such a path is called augmenting. Swap every edge on it: drop the matching edges, take the others. The matching grows by exactly one.'
    },
    {
      id: 'a-3', start: 75, end: 82, scene: 'augmenting',
      caption: "Berge's theorem: a matching is maximum exactly when no augmenting path exists. So the test for maximum is a search, not a comparison.",
      detail: 'If an augmenting path exists, the matching is not maximum, because the swap gives a bigger one. If the matching is not maximum, then some maximum matching is larger, and the symmetric difference of the two contains an augmenting path. Both directions are proved, so the condition is exact.',
      keyword: 'exactly when',
      trap: 'Berge gives a test for maximum, not a formula for the size. To find the size you still have to search, and each successful search raises the size by one.',
      narration: 'Berge theorem: a matching is maximum exactly when no augmenting path exists. So the test for maximum is a search, not a comparison.'
    },
    {
      id: 'a-4', start: 82, end: 90, scene: 'augmenting',
      caption: 'Repeating the search gives an algorithm: start with any matching, augment until no path is left. Each round adds one edge, so it stops after at most n/2 rounds.',
      detail: 'On a bipartite graph the search for an augmenting path is a breadth-first or depth-first walk that alternates sides, which is why the whole procedure is polynomial. On a general graph the same idea needs the blossom contraction of Edmonds, which is outside this syllabus.',
      keyword: 'algorithm',
      narration: 'Repeating the search gives an algorithm. Start with any matching and augment until no path is left. Each round adds one edge.'
    },

    /* ---------------- scene 4: Hall ---------------- */
    {
      id: 'h-1', start: 90, end: 97, scene: 'hall',
      caption: 'Take a bipartite graph with the left side L and the right side R. Write N(S) for the set of neighbours of a subset S of L.',
      detail: 'Bipartite means every edge joins a vertex of L to a vertex of R, with no edge inside either side. The neighbourhood N of S is the set of all right-side vertices joined to at least one vertex of S.',
      keyword: 'neighbours',
      narration: 'Take a bipartite graph with a left side and a right side. Write N of S for the set of neighbours of a subset S of the left side.'
    },
    {
      id: 'h-2', start: 97, end: 105, scene: 'hall',
      caption: 'Here three left vertices share only two neighbours. A matching cannot saturate all three, because each of them needs a different partner.',
      detail: 'A matching saturating L assigns to each left vertex a distinct right vertex that it is joined to. Three vertices and two available partners make that impossible, whatever the rest of the graph looks like. The subset is the certificate.',
      keyword: 'share only two',
      trap: 'The failure is local. You do not have to examine the whole graph, only to find one subset whose neighbourhood is too small.',
      narration: 'Here three left vertices share only two neighbours. A matching cannot saturate all three, because each of them needs a different partner.'
    },
    {
      id: 'h-3', start: 105, end: 112, scene: 'hall',
      caption: "Hall's condition: for every subset S of L, the size of N(S) is at least the size of S. Hall's theorem: that condition is also sufficient.",
      detail: 'The condition is necessary because S needs distinct partners inside N of S. Sufficiency is the real content: if no subset is short of neighbours, an augmenting path argument shows that a matching saturating L exists.',
      keyword: 'also sufficient',
      narration: 'Hall condition: for every subset S of the left side, the size of N of S is at least the size of S. Hall theorem: that condition is also sufficient.'
    },
    {
      id: 'h-4', start: 112, end: 120, scene: 'hall',
      caption: 'Add one edge and the smallest short subset disappears. Now every subset has enough neighbours, and a matching saturating L exists.',
      detail: 'The condition must be checked on every subset, not only on the whole side. Adding a single edge can repair the one short subset and nothing else, and that is enough to change the answer.',
      keyword: 'every subset',
      trap: 'Checking only the whole of L is the commonest error. A graph can have at least as many right vertices as left vertices overall and still fail Hall on a small subset.',
      narration: 'Add one edge and the smallest short subset disappears. Now every subset has enough neighbours, and a matching saturating the left side exists.'
    },

    /* ---------------- scene 5: Konig ---------------- */
    {
      id: 'k-1', start: 120, end: 127, scene: 'konig',
      caption: 'A vertex cover is a set of vertices touching every edge. Here four vertices cover all the edges of this bipartite graph.',
      detail: 'Cover means every edge has at least one endpoint in the set. A cover is a set of vertices, not a set of edges, so a cover and a matching count different kinds of object.',
      keyword: 'vertex cover',
      narration: 'A vertex cover is a set of vertices touching every edge. Here four vertices cover all the edges of this bipartite graph.'
    },
    {
      id: 'k-2', start: 127, end: 135, scene: 'konig',
      caption: 'A matching and a cover never share more than one vertex per matching edge, so the matching is never larger than the cover.',
      detail: 'Each edge of a matching has two distinct endpoints, and the cover must contain at least one of them. Since the matching edges are disjoint, the cover needs a different vertex for each, so the matching size is at most the cover size. This holds in every graph.',
      keyword: 'never larger',
      narration: 'A matching and a cover never share more than one vertex per matching edge, so the matching is never larger than the cover.'
    },
    {
      id: 'k-3', start: 135, end: 142, scene: 'konig',
      caption: "Konig's theorem: in a bipartite graph the two numbers are equal. The largest matching and the smallest cover have the same size.",
      detail: 'The proof builds the cover from a maximum matching by alternating reachability: start at the unmatched left vertices, walk along non-matching edges to the right and matching edges back to the left. The cover is the unreached left vertices together with the reached right vertices, and it has exactly the matching size.',
      keyword: 'equal',
      trap: 'Equality is a theorem about bipartite graphs. It is not a definition, and it is not true in general.',
      narration: 'Konig theorem: in a bipartite graph the two numbers are equal. The largest matching and the smallest cover have the same size.'
    },
    {
      id: 'k-4', start: 142, end: 150, scene: 'konig',
      caption: 'On a triangle the equality fails: the largest matching has one edge and the smallest cover needs two vertices. The odd cycle is what breaks it.',
      detail: 'This is the standard warning. The triangle is not bipartite, and the theorem does not apply. The same failure appears on every odd cycle, where the matching is one smaller than the cover.',
      keyword: 'fails',
      trap: 'Quoting Konig on a graph that is not bipartite is a wrong answer, not a rounding error. Check bipartiteness first, by the two-colouring test.',
      narration: 'On a triangle the equality fails. The largest matching has one edge and the smallest cover needs two vertices. The odd cycle is what breaks it.'
    },

    /* ---------------- scene 6: families ---------------- */
    {
      id: 'f-1', start: 150, end: 157, scene: 'families',
      caption: 'The chromatic number, written chi, is the fewest colours in a proper colouring. A complete graph on n vertices needs n colours: every pair is joined.',
      detail: 'In a complete graph every two vertices are adjacent, so no two may share a colour, and each of the n vertices needs its own. This is the one family where the count is forced by the definition rather than found by search.',
      keyword: 'fewest colours',
      narration: 'The chromatic number, written chi, is the fewest colours in a proper colouring. A complete graph on n vertices needs n colours, because every pair is joined.'
    },
    {
      id: 'f-2', start: 157, end: 165, scene: 'families',
      caption: 'A cycle needs two colours when its length is even and three when it is odd. Walk the colours round: an odd number of steps returns you to the start with the wrong colour.',
      detail: 'On an even cycle the colours alternate and close correctly. On an odd cycle the alternation closes one step wrong, so a third colour is needed somewhere, and three always suffice.',
      keyword: 'odd',
      narration: 'A cycle needs two colours when its length is even and three when it is odd. An odd number of steps returns you to the start with the wrong colour.'
    },
    {
      id: 'f-3', start: 165, end: 172, scene: 'families',
      caption: 'A tree needs two, and so does every bipartite graph, because bipartite is exactly the same as two-colourable. Petersen needs three.',
      detail: 'A bipartite graph comes with a split of its vertices, and colouring each side with its own colour is a proper colouring. Conversely any two-colouring is such a split. So bipartite, two-colourable, and no odd cycle are three names for one property.',
      keyword: 'two-colourable',
      narration: 'A tree needs two colours, and so does every bipartite graph, because bipartite is exactly the same as two-colourable. Petersen needs three.'
    },
    {
      id: 'f-4', start: 172, end: 180, scene: 'families',
      caption: 'The clique number is a lower bound on chi, never an equality. The Mycielskian of a five-cycle has no triangle at all and still needs four colours.',
      detail: 'A clique needs one colour per vertex, so the clique number omega is at most chi. The gap can be large: the Mycielskian construction turns a graph needing k colours into a triangle-free graph needing k plus one, and repeating it makes the gap as wide as you like.',
      keyword: 'lower bound',
      trap: 'Chi equals omega on every perfect graph, which includes bipartite graphs, and that is why the two are so often confused. They are equal there, not in general.',
      narration: 'The clique number is a lower bound on chi, never an equality. The Mycielskian of a five-cycle has no triangle at all and still needs four colours.'
    },

    /* ---------------- scene 7: greedy ---------------- */
    {
      id: 'g-1', start: 180, end: 187, scene: 'greedy',
      caption: 'First-fit greedy takes the vertices in some order and gives each the smallest colour no neighbour already has.',
      detail: 'The algorithm never backtracks. At each vertex it looks only at the neighbours already coloured, picks the smallest free number, and moves on. It is fast, and its result depends on the order.',
      keyword: 'smallest colour',
      narration: 'First-fit greedy takes the vertices in some order and gives each the smallest colour no neighbour already has.'
    },
    {
      id: 'g-2', start: 187, end: 195, scene: 'greedy',
      caption: 'At most delta plus one colours: when a vertex is coloured, at most delta neighbours are already coloured, so among delta plus one colours one is always free.',
      detail: 'Delta is the largest degree in the graph. A vertex has at most delta neighbours, so at most delta colours are forbidden at it, and with delta plus one colours available one survives. The argument is local and needs no hypothesis about the graph.',
      keyword: 'delta plus one',
      trap: 'This bound is on the algorithm, not on the graph. It says greedy never needs more than delta plus one, not that the graph needs that many.',
      narration: 'At most delta plus one colours. When a vertex is coloured, at most delta neighbours are already coloured, so one colour is always free.'
    },
    {
      id: 'g-3', start: 195, end: 202, scene: 'greedy',
      caption: 'The order matters. This bipartite graph is two-colourable, yet one order makes greedy use three colours.',
      detail: 'Colour the three vertices on one side first: each takes colour one, because none of them is adjacent to another. Then a vertex adjacent to two of them sees colour one twice and must take colour two, and a later vertex is forced to a third. A different order finds the two-colouring.',
      keyword: 'order matters',
      trap: 'Greedy returning k colours proves only that k colours suffice. It never proves that fewer are impossible, so a greedy count is an upper bound and nothing more.',
      narration: 'The order matters. This bipartite graph is two-colourable, yet one order makes greedy use three colours.'
    },
    {
      id: 'g-4', start: 202, end: 210, scene: 'greedy',
      caption: 'So greedy gives an upper bound and the clique gives a lower bound. When the two meet, the chromatic number is settled without any search.',
      detail: 'A greedy colouring with k colours proves chi at most k. A clique of size k proves chi at least k. If both happen at the same k, chi equals k exactly, which is the fastest route in an exam.',
      keyword: 'meet',
      narration: 'So greedy gives an upper bound and the clique gives a lower bound. When the two meet, the chromatic number is settled without any search.'
    },

    /* ---------------- scene 8: Brooks ---------------- */
    {
      id: 'b-1', start: 210, end: 217, scene: 'brooks',
      caption: "Brooks' theorem: a connected graph needs at most delta colours, unless it is complete or an odd cycle.",
      detail: 'Delta is the maximum degree. For a connected graph that is neither complete nor an odd cycle, chi is at most delta, which is one better than the greedy bound. The two exceptions are exactly the families where chi equals delta plus one.',
      keyword: 'at most delta',
      narration: 'Brooks theorem: a connected graph needs at most delta colours, unless it is complete or an odd cycle.'
    },
    {
      id: 'b-2', start: 217, end: 225, scene: 'brooks',
      caption: 'The exceptions are real: a complete graph needs delta plus one, and an odd cycle needs three against a delta of two.',
      detail: 'In a complete graph every vertex has degree n minus one, so delta is n minus one and chi is n, one more. On an odd cycle every degree is two, so delta is two and chi is three, again one more. Both are connected, and both escape the theorem.',
      keyword: 'exceptions',
      trap: 'Brooks is an if-and-only-if in practice: drop the exceptions and the bound can fail. State the exceptions whenever you use it.',
      narration: 'The exceptions are real. A complete graph needs delta plus one, and an odd cycle needs three against a delta of two.'
    },
    {
      id: 'b-3', start: 225, end: 232, scene: 'brooks',
      caption: 'The gap can be large. A star has maximum degree n minus one and needs only two colours, so chi sits far below delta.',
      detail: 'Delta measures the busiest single vertex; chi measures how the whole graph interlocks. A star concentrates all its edges at one vertex, which is easy to colour, while a sparse graph with long odd cycles can be harder than its degree suggests.',
      keyword: 'gap',
      narration: 'The gap can be large. A star has maximum degree n minus one and needs only two colours, so chi sits far below delta.'
    },
    {
      id: 'b-4', start: 232, end: 240, scene: 'brooks',
      caption: 'Useful bounds together: the clique number is at most chi, which is at most delta plus one, and at most delta once Brooks applies.',
      detail: 'The lower bound comes from a clique, which you can often find by eye. The upper bound comes from greedy, or from Brooks when the graph is connected and not one of the two exceptions. Chi is trapped between them.',
      keyword: 'between',
      narration: 'Useful bounds together: the clique number is at most chi, which is at most delta plus one, and at most delta once Brooks applies.'
    },

    /* ---------------- scene 9: edge colouring ---------------- */
    {
      id: 'e-1', start: 240, end: 247, scene: 'edge',
      caption: 'Edge colouring colours the edges so that edges meeting at a vertex get different colours. The fewest colours is the chromatic index, chi prime.',
      detail: 'Two edges that share an endpoint are adjacent edges. The chromatic index is the smallest number of colours in a proper edge colouring. It is a different number from the chromatic number, computed on a different object.',
      keyword: 'chromatic index',
      narration: 'Edge colouring colours the edges so that edges meeting at a vertex get different colours. The fewest colours is the chromatic index, chi prime.'
    },
    {
      id: 'e-2', start: 247, end: 255, scene: 'edge',
      caption: 'Every colour class is a matching, so the edges at one vertex need distinct colours: the index is at least delta. On a bipartite graph it is exactly delta.',
      detail: 'A set of edges of one colour has no two sharing a vertex, which is precisely a matching. A vertex of degree delta therefore needs delta different colours on its edges. For bipartite graphs Konig proved that delta colours always suffice.',
      keyword: 'exactly delta',
      trap: 'Chi prime at least delta holds always. Chi prime equal to delta holds for bipartite graphs, and fails elsewhere, so the equality needs the bipartite hypothesis.',
      narration: 'Every colour class is a matching, so the index is at least delta. On a bipartite graph it is exactly delta.'
    },
    {
      id: 'e-3', start: 255, end: 262, scene: 'edge',
      caption: "Vizing's theorem: for every simple graph the index is delta or delta plus one. So an edge-colouring question has only two candidate answers.",
      detail: 'This is a striking fact. Unlike vertex colouring, where the chromatic number can be far below the maximum degree, the edge chromatic number of a simple graph is always within one of delta. Graphs needing delta are called class one, and those needing delta plus one class two.',
      keyword: 'delta plus one',
      narration: 'Vizing theorem: for every simple graph the index is delta or delta plus one. So an edge-colouring question has only two candidate answers.'
    },
    {
      id: 'e-4', start: 262, end: 270, scene: 'edge',
      caption: 'A triangle has delta two and index three, so it is class two. The cube graph is bipartite with delta three, so its index is three while its chromatic number is two.',
      detail: 'The cube graph shows the two numbers diverging in the other direction: two colours for the vertices, three for the edges. An odd cycle always needs three edge colours, because alternating two colours round an odd cycle closes wrong.',
      keyword: 'class two',
      trap: 'Chi and chi prime are different questions with different answers. The cube graph answers 2 and 3 to them, so neither number predicts the other.',
      narration: 'A triangle has delta two and index three, so it is class two. The cube is bipartite with delta three, so its index is three while its chromatic number is two.'
    },

    /* ---------------- scene 10: planarity ---------------- */
    {
      id: 'p-1', start: 270, end: 277, scene: 'planar',
      caption: 'A graph is planar if it can be drawn in the plane with no two edges crossing. For a connected planar drawing, n minus m plus f equals two.',
      detail: 'Here f counts faces, including the unbounded outside face. Euler\u2019s formula is the single identity behind every planarity bound in the syllabus, and it is a counting statement, not a drawing convention.',
      keyword: 'n minus m plus f',
      narration: 'A graph is planar if it can be drawn in the plane with no two edges crossing. For a connected planar drawing, n minus m plus f equals two.'
    },
    {
      id: 'p-2', start: 277, end: 285, scene: 'planar',
      caption: 'Every face has at least three edges, and every edge borders two faces, so m is at most 3n minus 6. In a bipartite planar graph the bound tightens to 2n minus 4.',
      detail: 'Counting edge-sides gives 2m at least 3f, and substituting f from Euler gives the bound. A bipartite graph has no triangles, so every face has at least four edges and the count tightens.',
      keyword: '3n minus 6',
      trap: 'The bound is necessary, not sufficient. A graph can satisfy it and still be non-planar, so it rules graphs out and never rules them in.',
      narration: 'Every face has at least three edges, and every edge borders two faces, so m is at most 3n minus 6. In a bipartite planar graph the bound is 2n minus 4.'
    },
    {
      id: 'p-3', start: 285, end: 292, scene: 'planar',
      caption: 'K5 has ten edges where nine is the limit, and K3,3 has nine where eight is the limit. Both are non-planar, and Kuratowski says every non-planar graph contains one of them.',
      detail: 'K5 is the smallest graph breaking the general bound and K3,3 the smallest breaking the bipartite one. Kuratowski\u2019s theorem states that a graph is planar exactly when it contains no subdivision of either, which is a characterisation rather than a bound.',
      keyword: 'K5',
      narration: 'K5 has ten edges where nine is the limit, and K3,3 has nine where eight is the limit. Both are non-planar.'
    },
    {
      id: 'p-4', start: 292, end: 300, scene: 'planar',
      caption: 'Every planar graph is four-colourable, and three colours do not always suffice: an odd cycle drawn flat already needs three, and there are planar graphs needing four.',
      detail: 'The four-colour theorem settles the upper bound. The lower bound is easier: a planar graph may contain an odd cycle, which needs three, and planar graphs such as the one formed from an odd wheel need four.',
      keyword: 'four-colourable',
      trap: 'Planar gives at most four, not at most three. GATE has asked for the number of colours sufficient for every planar graph, and the answer is four.',
      narration: 'Every planar graph is four-colourable, and three colours do not always suffice. An odd cycle drawn flat already needs three.'
    },

    /* ---------------- scene 11: procedure and traps ---------------- */
    {
      id: 'r-1', start: 300, end: 307, scene: 'procedure',
      caption: 'A fixed procedure: name the object, check bipartiteness, find a bound from each side, then look for a certificate.',
      detail: 'Name the object first, because a matching question and a colouring question use different formulas. Bipartiteness changes which theorems apply. Bounds come from a clique below and greedy or Brooks above, and a certificate is a clique, a colouring, a cover or an augmenting path.',
      keyword: 'procedure',
      narration: 'A fixed procedure. Name the object, check bipartiteness, find a bound from each side, then look for a certificate.'
    },
    {
      id: 'r-2', start: 307, end: 315, scene: 'procedure',
      caption: 'Trap one: answering maximal when the question said maximum, or quoting Konig on a graph that is not bipartite.',
      detail: 'Both mistakes come from a word being read as a near-synonym. Maximal and maximum differ by a whole edge in this lesson\u2019s example, and Konig\u2019s equality fails by one on every odd cycle.',
      keyword: 'maximal',
      trap: 'Read the adjective, then check the hypothesis. Two seconds here saves the mark.',
      narration: 'Trap one: answering maximal when the question said maximum, or quoting Konig on a graph that is not bipartite.'
    },
    {
      id: 'r-3', start: 315, end: 323, scene: 'procedure',
      caption: 'Trap two: treating the clique number as the chromatic number, or greedy as exact. One is a bound below, the other a bound above.',
      detail: 'The Mycielskian of C5 separates them sharply: no triangle, yet four colours. And greedy depends on the order, so its count can exceed the chromatic number of a two-colourable graph.',
      keyword: 'bound',
      trap: 'A bound is not a value. Say which bound you are using and whether it is tight here.',
      narration: 'Trap two: treating the clique number as the chromatic number, or greedy as exact. One is a bound below, the other a bound above.'
    },
    {
      id: 'r-4', start: 323, end: 330, scene: 'procedure',
      caption: 'Trap three: confusing vertex colours with edge colours, and forgetting that Vizing allows two answers. Delta or delta plus one, decided by a construction.',
      detail: 'The cube graph has chromatic number two and chromatic index three, so the two numbers are independent. Vizing narrows an edge-colouring question to two candidates, and only a construction or a class-two argument decides which.',
      keyword: 'vertex colours',
      trap: 'For edge colouring, delta is a lower bound always and the answer on bipartite graphs; delta plus one is the ceiling. Anything else is wrong.',
      narration: 'Trap three: confusing vertex colours with edge colours, and forgetting that Vizing allows two answers. Delta or delta plus one, decided by a construction.'
    }
  ]
};
