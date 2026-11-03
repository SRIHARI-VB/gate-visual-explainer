/* ==========================================================================
   euler-trails-and-hamiltonian-cycles — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'two',
      n: 1,
      title: 'Two questions that differ by one word',
      start: 0, end: 30,
      objective: 'Separate "use every edge once" from "visit every vertex once", and see that neither question implies the other.'
    },
    {
      id: 'degree',
      n: 2,
      title: 'The degree count is forced, not guessed',
      start: 30, end: 60,
      objective: 'Derive the parity condition from what a trail does at each vertex, and apply it to the seven bridges.'
    },
    {
      id: 'suff',
      n: 3,
      title: 'Even degrees and one component is enough',
      start: 60, end: 90,
      objective: 'State the Euler criterion with its connectivity hypothesis, and see the two ways it is misapplied.'
    },
    {
      id: 'hier',
      n: 4,
      title: 'Hierholzer: build the tour instead of guessing',
      start: 90, end: 120,
      objective: 'Run Hierholzer\'s walk-and-splice on one graph and see why the construction is linear in the number of edges.'
    },
    {
      id: 'count',
      n: 5,
      title: 'How many tours, and the cycles inside',
      start: 120, end: 150,
      objective: 'See the cycle decomposition that proves sufficiency, and count the distinct Euler circuits of a small graph exactly.'
    },
    {
      id: 'np',
      n: 6,
      title: 'Hamilton has no test, and that is a theorem',
      start: 150, end: 180,
      objective: 'Contrast a linear-time decision with an NP-complete one, and count what brute force would have to examine.'
    },
    {
      id: 'cond',
      n: 7,
      title: 'Sufficient conditions certify; they do not decide',
      start: 180, end: 210,
      objective: 'Use Dirac and Ore to certify a cycle, and see on a six-cycle that failing them proves nothing.'
    },
    {
      id: 'petersen',
      n: 8,
      title: 'The Petersen graph, checked three ways',
      start: 210, end: 240,
      objective: 'Meet the standard non-Hamiltonian graph, verify it exhaustively, and see the line-graph link between the two questions.'
    },
    {
      id: 'pyq',
      n: 9,
      title: 'GATE CSE 2007, Question 23, recomputed',
      start: 240, end: 270,
      objective: 'Decide each of the four options from the criterion, with every degree computed on the page.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'One procedure and five traps',
      start: 270, end: 300,
      objective: 'Leave with a fixed order of questions to ask, and the five mistakes that produce an option-list answer.'
    }
  ],

  events: [
    /* ---- scene 1: two questions ---- */
    {
      id: 't-1', scene: 'two', start: 0, end: 7,
      caption: 'An Euler circuit uses every edge exactly once and returns to where it started.',
      detail: 'A circuit is a closed trail. "Every edge exactly once" is the whole requirement: a vertex may be visited as often as the tour likes, and a vertex with no edges is simply not on the tour.',
      narration: 'An Euler circuit uses every edge of the graph exactly once, and comes back to where it started.',
      keyword: 'every edge exactly once',
      trap: 'Reading "Euler" as "visits every vertex". The vertex question is the Hamiltonian one, and it is a different problem.'
    },
    {
      id: 't-2', scene: 'two', start: 7, end: 15,
      caption: 'A Hamiltonian cycle visits every vertex exactly once and returns to the start.',
      detail: 'The Hamiltonian requirement is about vertices. It says nothing about edges: a Hamiltonian cycle uses exactly n edges, one leaving each vertex on the cycle, and ignores every other edge of the graph.',
      narration: 'A Hamiltonian cycle visits every vertex exactly once and returns to the start. It uses n edges and ignores the rest.',
      keyword: 'every vertex exactly once',
      trap: 'Assuming a Hamiltonian cycle must use all the edges. It uses exactly as many edges as there are vertices, no more.'
    },
    {
      id: 't-3', scene: 'two', start: 15, end: 23,
      caption: 'Trail, path, circuit: a trail repeats no edge, a path repeats no vertex, a circuit is a closed trail.',
      detail: 'The vocabulary is what the two questions are built from. A walk may repeat anything. A trail may not repeat an edge. A path may not repeat a vertex, and a path is therefore also a trail. A circuit is a trail that ends where it began.',
      narration: 'A walk repeats nothing by rule. A trail repeats no edge, a path repeats no vertex, and a circuit is a closed trail.',
      keyword: 'trail, path, circuit',
      trap: 'Using "path" and "trail" as synonyms in a solution. A question that says trail is asking about edges, and one that says path is asking about vertices.'
    },
    {
      id: 't-4', scene: 'two', start: 23, end: 30,
      caption: 'The two questions are independent: the page shows a graph with each property and not the other.',
      detail: 'Two five-vertex examples settle it. The complete bipartite graph K(2,3) has an Euler trail and no Hamiltonian cycle. The six-cycle with two chords has a Hamiltonian cycle and four odd degrees, so no Euler trail at all.',
      narration: 'Neither property implies the other. One graph here has the Euler trail and no Hamiltonian cycle, and another has the Hamiltonian cycle and no Euler trail.',
      keyword: 'independent',
      trap: 'Answering one question with the other question\'s criterion. It is the most common wrong answer on this topic.'
    },

    /* ---- scene 2: degree count ---- */
    {
      id: 'd-1', scene: 'degree', start: 30, end: 37,
      caption: 'Every time a trail passes through a vertex it uses two of that vertex\'s edges: one to arrive, one to leave.',
      detail: 'Pair the arrival with the departure. Each visit consumes an even number of edges at that vertex, so whatever is left over must be the ends of the trail.',
      narration: 'Each time a trail passes through a vertex it uses two edges there, one arriving and one leaving.',
      keyword: 'two of that vertex\'s edges',
      trap: 'Counting visits instead of edges. The argument is about how many edges of the vertex the trail uses, not how many times it arrives.'
    },
    {
      id: 'd-2', scene: 'degree', start: 37, end: 45,
      caption: 'So a closed tour leaves every vertex with an even degree: the parity condition is necessary.',
      detail: 'If the tour returns to its start, then even the start vertex is only passed through, so every vertex pairs its edges and every degree is even. Nothing about the shape of the graph has been assumed: this holds for any graph at all.',
      narration: 'If the tour closes, every vertex uses its edges in pairs, so every degree is even. That is necessary, and it took one sentence.',
      keyword: 'every degree is even',
      trap: 'Thinking the parity condition needs connectivity. Necessity does not: an even-degree vertex is forced by the tour alone.'
    },
    {
      id: 'd-3', scene: 'degree', start: 45, end: 53,
      caption: 'An open trail has exactly two exceptions: the vertex it starts at and the vertex it ends at.',
      detail: 'At the start the trail leaves once more than it arrives, and at the end it arrives once more than it leaves. Every other vertex is still paired, so exactly two vertices are odd, and they are the two endpoints.',
      narration: 'An open trail leaves one extra edge at its start and arrives one extra at its end, so exactly two vertices are odd, and those two are the ends.',
      keyword: 'exactly two vertices are odd',
      trap: 'Trying to start an open trail at an even-degree vertex. The odd vertices are the only legal endpoints, and there are exactly two of them.'
    },
    {
      id: 'd-4', scene: 'degree', start: 53, end: 60,
      caption: 'Königsberg: the four land masses have degrees 3, 3, 3 and 5. Four odd vertices, so no trail at all.',
      detail: 'The seven bridges give four land masses of degree three, three, three and five. Since four vertices are odd and a trail allows at most two, no walk crosses each bridge once. The page computes the degrees from the edge list and searches for a trail as well, and both answers agree.',
      narration: 'In Königsberg the four land masses have degrees three, three, three and five. Four odd vertices, and a trail allows two, so no such walk exists.',
      keyword: 'degrees 3, 3, 3 and 5',
      trap: 'Remembering "Euler\'s theorem says odd degree is impossible" instead of the exact count. Two odd vertices are fine: they give a trail that does not close.'
    },

    /* ---- scene 3: sufficiency ---- */
    {
      id: 's-1', scene: 'suff', start: 60, end: 67,
      caption: 'The converse is a theorem: connected with every degree even is necessary and sufficient.',
      detail: 'Euler stated the sufficiency in 1736 without a proof; the first complete proof was published by Hierholzer in 1873. The statement is an if-and-only-if, so the parity count decides the question outright.',
      narration: 'The converse is also true: if the graph is connected and every degree is even, an Euler circuit exists. Euler stated it, Hierholzer proved it.',
      keyword: 'necessary and sufficient',
      trap: 'Treating the criterion as one-directional and searching for a tour anyway after the degrees check out. Once the hypothesis holds, the tour is guaranteed.'
    },
    {
      id: 's-2', scene: 'suff', start: 67, end: 75,
      caption: 'The hypothesis is about the component that holds the edges: two disjoint triangles have all even degrees and no tour.',
      detail: 'Two disjoint triangles have six vertices of degree two, and no single walk covers both triangles because no walk can leave one of them. The condition is "all the vertices with nonzero degree lie in one component", not "all the degrees are even".',
      narration: 'Two separate triangles have all degrees even and still no Euler circuit, because no walk crosses from one to the other.',
      keyword: 'one component',
      trap: 'Checking the degrees and forgetting the components. This is the standard trap, and it is the reason the criterion has two clauses.'
    },
    {
      id: 's-3', scene: 'suff', start: 75, end: 83,
      caption: 'Join the triangles at one vertex and the tour exists: the shared vertex is used twice, once per triangle.',
      detail: 'The bowtie has one vertex of degree four and four of degree two. Its Euler circuit passes the shared vertex twice, once for each triangle, which is exactly the even-degree pairing the proof relies on.',
      narration: 'Join the two triangles at a single vertex and a tour exists: it uses the shared vertex twice, once for each triangle.',
      keyword: 'used twice',
      trap: 'Believing a tour may not revisit a vertex. Revisiting vertices is allowed and usually necessary; only edges are rationed.'
    },
    {
      id: 's-4', scene: 'suff', start: 83, end: 90,
      caption: 'Directed version: in-degree equals out-degree everywhere, and the vertices with edges are in one component.',
      detail: 'On a directed graph the arrival and departure counts are separate, so the condition is that in-degree equals out-degree at every vertex, plus connectivity of the edge-carrying part. The page checks the directed criterion against a brute-force search on every directed graph with three vertices.',
      narration: 'On a directed graph, in-degree must equal out-degree at every vertex, and the edges must sit in one component.',
      keyword: 'in-degree equals out-degree',
      trap: 'Using the undirected degree rule on a directed graph. Two edges into a vertex and two out of it look balanced in total degree and are not balanced in direction.'
    },

    /* ---- scene 4: Hierholzer ---- */
    {
      id: 'h-1', scene: 'hier', start: 90, end: 97,
      caption: 'Hierholzer\'s idea: walk from any vertex until you are stuck, then splice in what is left.',
      detail: 'The walk cannot get stuck anywhere except its start, because every vertex it enters has an unused edge to leave by, except the one it came from last. So the first walk is a closed tour, possibly a short one.',
      narration: 'Hierholzer walks from the start until there is no unused edge to take. The walk closes, and may be short.',
      keyword: 'walk until you are stuck',
      trap: 'Stopping when stuck and calling that the answer. The first walk usually leaves edges behind, and the splice is the algorithm.'
    },
    {
      id: 'h-2', scene: 'hier', start: 97, end: 105,
      caption: 'From vertex 0 the greedy walk closes immediately: 0, 1, 2, 0. Three of the six edges are used.',
      detail: 'The bowtie is the worked graph. Starting at vertex 0, the walk takes 0-1, then 1-2, then 2-0, and at 0 there is no unused edge left. The tour is closed but incomplete.',
      narration: 'Starting at vertex zero the walk closes at once: zero, one, two, zero. Half the edges are still unused.',
      keyword: 'closes immediately',
      trap: 'Reading the closed walk as a proof of failure. A closed walk that misses edges is the first step, not the answer.'
    },
    {
      id: 'h-3', scene: 'hier', start: 105, end: 113,
      caption: 'Vertex 1 still has unused edges, so splice its cycle 1, 3, 4, 1 into the tour at vertex 1.',
      detail: 'The splice inserts a closed walk at a vertex that already appears in the tour. The result is a longer closed walk: 0, 1, 3, 4, 1, 2, 0, which uses all six edges exactly once. The page checks that the tour is closed and uses every edge once.',
      narration: 'Vertex one still has unused edges, so its cycle one, three, four, one is spliced in at vertex one. The tour now uses every edge.',
      keyword: 'splice',
      trap: 'Splicing at the wrong vertex. The cycle must be inserted at a vertex it shares with the tour, or the result is not a walk.'
    },
    {
      id: 'h-4', scene: 'hier', start: 113, end: 120,
      caption: 'Every edge is taken once and each splice is a pointer change, so the decision and the tour are linear.',
      detail: 'Hierholzer costs O(V + E): each edge is traversed once, and the splicing can be done with a stack so no edge is moved twice. Fleury\'s older rule picks a non-bridge at each step, which is the same idea at a higher price because testing for a bridge costs a search.',
      narration: 'Every edge is used once, so the algorithm is linear. Fleury\'s rule is the same idea, paid for with a bridge test at every step.',
      keyword: 'linear',
      trap: 'Claiming Fleury is linear. It is not: the bridge test at each step is what makes it slower, and GATE questions distinguish the two.'
    },

    /* ---- scene 5: counting ---- */
    {
      id: 'c-1', scene: 'count', start: 120, end: 127,
      caption: 'An Eulerian graph splits into edge-disjoint cycles, and that splitting is the proof of sufficiency.',
      detail: 'Walk from any vertex until you return to it: the walk is a cycle. Remove its edges and every degree is still even, so repeat. The cycles found this way are edge-disjoint and cover every edge, and they can be spliced together into one tour.',
      narration: 'Every Eulerian graph splits into edge-disjoint cycles. Walk until you close a cycle, delete it, and repeat: every degree stays even.',
      keyword: 'edge-disjoint cycles',
      trap: 'Confusing edge-disjoint with vertex-disjoint. These cycles share vertices freely, and on K(5) they must.'
    },
    {
      id: 'c-2', scene: 'count', start: 127, end: 135,
      caption: 'K5 splits into two 5-cycles that share all five vertices and no edge: 0,1,2,3,4,0 and 0,2,4,1,3,0.',
      detail: 'K5 has ten edges and every degree is four. The two listed cycles use five edges each, and the page checks that no edge is repeated and that all ten edges are covered.',
      narration: 'The complete graph on five vertices splits into two five-cycles that share every vertex and no edge.',
      keyword: 'two 5-cycles',
      trap: 'Assuming a decomposition into cycles must be unique. It is not, and the number of tours is not the number of decompositions.'
    },
    {
      id: 'c-3', scene: 'count', start: 135, end: 143,
      caption: 'K5 has 132 Euler circuits when a circuit is a cyclic edge sequence, counted once up to rotation and reversal.',
      detail: 'The page counts them by exhaustive search and reports 132. A second, independent count of traversals that begin at vertex 0 gives 528, which is 132 times two directions times two visits to vertex 0, and the two counts agree.',
      narration: 'Counting carefully, the complete graph on five vertices has one hundred and thirty-two Euler circuits, where rotating or reversing a circuit does not make a new one.',
      keyword: '132',
      trap: 'Counting tours as sequences and forgetting that a cyclic tour has no first edge. Rotation and reversal are the same circuit.'
    },
    {
      id: 'c-4', scene: 'count', start: 143, end: 150,
      caption: 'The count is not what GATE asks for. What it asks is whether a tour exists, and the criterion answers that.',
      detail: 'Counting Euler circuits is a different problem from deciding whether one exists, and the deciding problem is the one with the one-line test. The page keeps the two apart on purpose, because a counting argument is not a criterion.',
      narration: 'The count is a curiosity. The exam asks whether a tour exists, and that question has a one-line test.',
      keyword: 'whether, not how many',
      trap: 'Answering a counting question with the existence criterion, or the reverse. They are different questions with different answers.'
    },

    /* ---- scene 6: NP-completeness ---- */
    {
      id: 'n-1', scene: 'np', start: 150, end: 157,
      caption: 'Deciding whether a graph has a Hamiltonian cycle is NP-complete.',
      detail: 'Karp listed both the directed and the undirected Hamiltonian circuit among the twenty-one problems he proved NP-complete in 1972. No polynomial-time algorithm is known, and a fast one would settle P against NP.',
      narration: 'Deciding whether a Hamiltonian cycle exists is NP-complete. Karp listed it in 1972 among his twenty-one problems.',
      keyword: 'NP-complete',
      trap: 'Assuming that because the definition is short, the test must be short. Euler has a one-line test and Hamilton has none known.'
    },
    {
      id: 'n-2', scene: 'np', start: 157, end: 165,
      caption: 'Brute force on the complete graph would examine (n − 1)! / 2 cycles: 181,440 at n = 10 and about 3.1 × 10^23 at n = 25.',
      detail: 'Every Hamiltonian cycle of a complete graph is an ordering of the vertices up to rotation and reversal, which is (n−1)!/2 of them. The page verifies that formula against exhaustive enumeration for n from 3 to 7.',
      narration: 'Brute force has to look at factorially many cycles: one hundred and eighty-one thousand at ten vertices, and about three times ten to the twenty-three at twenty-five.',
      keyword: 'factorial',
      trap: 'Believing a bigger computer fixes it. At a billion checks a second the twenty-five-vertex case still runs for millions of years.'
    },
    {
      id: 'n-3', scene: 'np', start: 165, end: 173,
      caption: 'So a sufficient condition is a certificate, never a test: it can say yes, and it can never say no.',
      detail: 'Dirac and Ore prove that a cycle exists when their hypotheses hold. When the hypothesis fails, the theorem says nothing at all, because the implication runs one way. Deciding no needs an argument about the graph itself.',
      narration: 'A sufficient condition can certify that a cycle exists. It can never certify that none does, because the implication only runs one way.',
      keyword: 'certificate, not a test',
      trap: 'Concluding "not Hamiltonian" from a failed Dirac check. That reverses an implication, and it is a standard exam trap.'
    },
    {
      id: 'n-4', scene: 'np', start: 173, end: 180,
      caption: 'One question has a linear test, the other has none known. That asymmetry is the point of the pair.',
      detail: 'The two questions look like twins and sit on opposite sides of a complexity boundary. Euler is decided by a degree count and a connectivity check; Hamilton is decided by search, with sufficient conditions as shortcuts.',
      narration: 'One question is decided in linear time and the other has no known polynomial test. That asymmetry is the reason the two are taught together.',
      keyword: 'asymmetry',
      trap: 'Expecting a symmetric treatment. There is no Euler-style parity theorem for Hamiltonian cycles, and none is expected.'
    },

    /* ---- scene 7: sufficient conditions ---- */
    {
      id: 'q-1', scene: 'cond', start: 180, end: 187,
      caption: 'Dirac, 1952: with at least three vertices, if every degree is at least n/2 then a Hamiltonian cycle exists.',
      detail: 'The hypothesis is on the smallest degree. A graph with n vertices where every vertex has degree at least n/2 is dense enough that a longest path can always be closed into a cycle.',
      narration: 'Dirac in nineteen fifty-two: with n at least three, if every vertex has degree at least half of n, a Hamiltonian cycle exists.',
      keyword: 'degree at least n/2',
      trap: 'Dropping the n at least 3 condition. With two vertices the hypothesis is vacuous and there is no cycle to speak of.'
    },
    {
      id: 'q-2', scene: 'cond', start: 187, end: 195,
      caption: 'Ore, 1960: if every pair of non-adjacent vertices has degree sum at least n, a Hamiltonian cycle exists.',
      detail: 'Ore\'s hypothesis is weaker than Dirac\'s and gives the same conclusion: if two non-adjacent vertices have small degree sums, a longest path could not be closed, so the graph is dense along its non-edges instead of everywhere.',
      narration: 'Ore in nineteen sixty: if every two non-adjacent vertices have degrees summing to at least n, a Hamiltonian cycle exists.',
      keyword: 'degree sum at least n',
      trap: 'Applying Ore to adjacent pairs. The hypothesis is only about non-adjacent pairs, and checking adjacent ones changes the test.'
    },
    {
      id: 'q-3', scene: 'cond', start: 195, end: 203,
      caption: 'The six-cycle fails Dirac and fails Ore, and is Hamiltonian: both theorems are sufficient, not necessary.',
      detail: 'Every vertex of the six-cycle has degree two, which is below three, and two non-adjacent vertices have degree sum four, which is below six. The graph is nevertheless a Hamiltonian cycle, which is the shortest possible counterexample to any claim that these conditions are necessary.',
      narration: 'The six-cycle fails both hypotheses and is Hamiltonian. The conditions are sufficient, and they are not necessary.',
      keyword: 'sufficient, not necessary',
      trap: 'Reading a failed hypothesis as evidence against a cycle. The six-cycle is the counterexample to memorise.'
    },
    {
      id: 'q-4', scene: 'cond', start: 203, end: 210,
      caption: 'Necessary conditions that do work: a bipartite graph needs equal sides, and c(G − S) is at most |S|.',
      detail: 'A cycle alternates sides in a bipartite graph, so the sides must be the same size; K(2,3) is therefore not Hamiltonian. Deleting a set S of vertices leaves at most |S| components, because a cycle passes through S at most |S| times. Both are necessary and neither is sufficient.',
      narration: 'Two necessary conditions do work: a bipartite graph needs equal sides, and deleting any set of vertices leaves no more components than its size.',
      keyword: 'necessary',
      trap: 'Using these as sufficient. The Petersen graph satisfies the component condition and is not Hamiltonian, which the next scene shows.'
    },

    /* ---- scene 8: Petersen ---- */
    {
      id: 'p-1', scene: 'petersen', start: 210, end: 217,
      caption: 'The Petersen graph: ten vertices, fifteen edges, every degree three, girth five.',
      detail: 'It is the standard small graph that defeats most intuitions: it is regular, highly symmetric, non-planar, and it has no triangle and no four-cycle. Everything on this page about it is computed from its edge list.',
      narration: 'The Petersen graph has ten vertices, fifteen edges and every degree three. It is the graph that defeats most quick intuitions.',
      keyword: 'every degree three',
      trap: 'Judging it by the drawing. Its usual picture has crossings, and the crossing points are not vertices.'
    },
    {
      id: 'p-2', scene: 'petersen', start: 217, end: 225,
      caption: 'It has no Hamiltonian cycle, and the page proves it by exhausting every cycle, not by inspecting the picture.',
      detail: 'The exhaustive search returns zero Hamiltonian cycles. A proof is short too: a Hamiltonian cycle plus the five remaining edges would be a three-edge-colouring of the graph, and the Petersen graph has none.',
      narration: 'It has no Hamiltonian cycle. The page establishes that by exhausting every possible cycle, and there is also a short counting proof.',
      keyword: 'no Hamiltonian cycle',
      trap: 'Concluding non-Hamiltonicity from a degree or connectivity test. The Petersen graph satisfies the component-count condition and still fails.'
    },
    {
      id: 'p-3', scene: 'petersen', start: 225, end: 233,
      caption: 'Delete any single vertex and the rest is Hamiltonian. That property is called hypohamiltonian.',
      detail: 'The page runs the search ten times, once per deleted vertex, and finds a Hamiltonian cycle each time. So no single vertex is the obstruction: the difficulty is global, which is exactly why a local test cannot exist.',
      narration: 'Delete any one vertex and what remains is Hamiltonian. A graph like this is called hypohamiltonian.',
      keyword: 'hypohamiltonian',
      trap: 'Thinking one obstruction vertex must exist. Non-Hamiltonicity can be a global property with no local witness.'
    },
    {
      id: 'p-4', scene: 'petersen', start: 233, end: 240,
      caption: 'It also has no Euler trail: all ten degrees are odd, so the two questions both answer no, for different reasons.',
      detail: 'Ten odd vertices exceed the two an Euler trail allows. The two refusals are unrelated: one is a parity count that decides in linear time, the other is a search. The line graph of a graph is Eulerian exactly when the graph is Hamiltonian, which is the structural link between the questions.',
      narration: 'It also has no Euler trail, because all ten degrees are odd. The two no answers come from different arguments.',
      keyword: 'all ten degrees odd',
      trap: 'Treating the two refusals as one fact. A graph can be Eulerian and not Hamiltonian, Hamiltonian and not Eulerian, both, or neither.'
    },

    /* ---- scene 9: the previous-year question ---- */
    {
      id: 'y-1', scene: 'pyq', start: 240, end: 247,
      caption: 'GATE CSE 2007, Question 23: which of these graphs has an Eulerian circuit?',
      detail: 'The four options are: any k-regular graph where k is even; a complete graph on 90 vertices; the complement of a cycle on 25 vertices; none of the above. The page recomputes each verdict rather than quoting a key.',
      narration: 'A previous-year question: which of these graphs has an Eulerian circuit? A k-regular graph with even k, a complete graph on ninety vertices, or the complement of a cycle on twenty-five vertices.',
      keyword: 'Eulerian circuit',
      trap: 'Answering from a remembered key without checking the connectivity clause, which is what separates two of the options.'
    },
    {
      id: 'y-2', scene: 'pyq', start: 247, end: 255,
      caption: 'Option A fails: a 2-regular graph can be two disjoint triangles, all even and not Eulerian.',
      detail: 'Even degrees alone do not decide. Two disjoint triangles are 2-regular, every degree is even, and no single walk covers both. The word "any" in the option is what breaks it.',
      narration: 'Option A fails, because a two-regular graph can be two separate triangles: all degrees even, and no tour.',
      keyword: 'two disjoint triangles',
      trap: 'Accepting a statement about "any" graph from one example. One counterexample refutes a universal claim.'
    },
    {
      id: 'y-3', scene: 'pyq', start: 255, end: 263,
      caption: 'Option B fails: every vertex of K(90) has degree 89, which is odd. Option C: the complement has degree 22 everywhere.',
      detail: 'K(90) is connected but every degree is odd, so it fails parity and has not even an Euler trail. The complement of a 25-cycle gives each vertex 24 minus 2, which is 22, and the page checks connectivity directly.',
      narration: 'Option B fails because ninety vertices give every vertex degree eighty-nine, which is odd. Option C gives degree twenty-two everywhere.',
      keyword: 'degree 89 and degree 22',
      trap: 'Forgetting to subtract the two cycle edges when computing the complement\'s degree. It is n minus one minus two, not n minus one.'
    },
    {
      id: 'y-4', scene: 'pyq', start: 263, end: 270,
      caption: 'Option C is the answer: every degree 22, one component, so an Euler circuit exists.',
      detail: 'The page verifies on the 25 vertices that the complement is connected and that every degree is 22, then applies the criterion. The answer is C, and the reasoning is the two-clause criterion rather than a remembered key.',
      narration: 'The answer is C: every degree is twenty-two and the graph is connected, so an Euler circuit exists.',
      keyword: 'answer C',
      trap: 'Stopping at the parity check. Without the connectivity argument, option C is not yet established, and that is the mark the question is testing.'
    },

    /* ---- scene 10: procedure ---- */
    {
      id: 'r-1', scene: 'proc', start: 270, end: 277,
      caption: 'First question: does the problem ration edges or vertices? That decides which criterion applies.',
      detail: 'Read the sentence that names the object. "Every road once" is an edge question. "Every city once" is a vertex question. The two criteria are not interchangeable, and answering the wrong one is the most common error.',
      narration: 'Ask first whether the problem rations edges or vertices. That single reading decides which criterion you are allowed to use.',
      keyword: 'edges or vertices',
      trap: 'Choosing the criterion you remember better. The question\'s wording fixes the criterion, not your preference.'
    },
    {
      id: 'r-2', scene: 'proc', start: 277, end: 284,
      caption: 'Edge question: count degrees, count odd vertices, then check that the edges sit in one component.',
      detail: 'Zero odd vertices gives a circuit, two gives a trail between them, four or more gives nothing. Then check the component condition, which the degree count does not supply. On a directed graph, count in-degree against out-degree instead.',
      narration: 'For an edge question: count the odd degrees, then check the edges are in one component. Zero odd gives a circuit and two give a trail.',
      keyword: 'count, then check components',
      trap: 'Skipping the component check because the degrees looked right. That is exactly the option A trap of the previous-year question.'
    },
    {
      id: 'r-3', scene: 'proc', start: 284, end: 292,
      caption: 'Vertex question: try Dirac and Ore to certify a cycle, and look for a reason it cannot exist.',
      detail: 'A successful certificate ends the question. Otherwise look for a structural obstruction: unequal sides in a bipartite graph, a cut set with too many components, or a known non-Hamiltonian graph. Never report "not Hamiltonian" from a failed certificate alone.',
      narration: 'For a vertex question, use Dirac or Ore to certify a cycle, and look for a structural obstruction before concluding that none exists.',
      keyword: 'certify, then obstruct',
      trap: 'Reporting a no from a failed sufficient condition. The Petersen graph shows how far that can be from the truth.'
    },
    {
      id: 'r-4', scene: 'proc', start: 292, end: 300,
      caption: 'Five traps, one defence: name the object, name the hypothesis, and never let one answer the other question.',
      detail: 'The traps are: confusing the two questions; using the parity count without connectivity; reading the drawing instead of the edge list; treating a sufficient condition as a test; and forgetting that revisiting vertices is allowed on a trail.',
      narration: 'Five traps and one defence: name the object the question rations, name the hypothesis of the theorem you use, and keep the two questions apart.',
      keyword: 'name the object',
      trap: 'Checking the arithmetic twice and the hypothesis never. Every trap here produces a number that is on the option list.'
    }
  ]
};
