/* ==========================================================================
   disjoint-set-forests-union-find — THE timeline.
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
      id: 'question', n: 1,
      title: 'Are these two in the same group? The partition and its forest',
      start: 0, end: 30,
      objective: 'State the problem union-find answers, name its three operations, and see that every answer is read off the shape of a forest of parent pointers.'
    },
    {
      id: 'chain', n: 2,
      title: 'Naive linking builds a chain, and one find costs n − 1 hops',
      start: 30, end: 60,
      objective: 'Link always in the same direction on eight elements, measure the height of the resulting chain and the hops a single find walks, and see why the worst case is Theta of n.'
    },
    {
      id: 'rank', n: 3,
      title: 'Union by rank: attach the shorter tree under the taller',
      start: 60, end: 90,
      objective: 'Apply the linking rule that keeps trees shallow, verify the invariant rank at most floor of log base two of n, and read the final parent array of an eight-element trace.'
    },
    {
      id: 'compress', n: 4,
      title: 'Path compression: find rewires the path it just walked',
      start: 90, end: 120,
      objective: 'Watch one find flatten a chain, measure the second find on the same node, and see that compression changes parent pointers but never a rank, a root or the set membership.'
    },
    {
      id: 'bounds', n: 5,
      title: 'Four implementations, four bounds, one measured table',
      start: 120, end: 150,
      objective: 'Separate the four combinations of linking rule and compression by their bounds, and check the measured hop counts against them on the same sequence.'
    },
    {
      id: 'alpha', n: 6,
      title: 'Alpha of n is not one, and it is not a constant',
      start: 150, end: 180,
      objective: 'Define the inverse Ackermann function from its own recursion, compute its thresholds, and say exactly what the O of m alpha of n bound does and does not claim.'
    },
    {
      id: 'kruskal', n: 7,
      title: 'Kruskal: the cycle test is one comparison of two roots',
      start: 180, end: 210,
      objective: 'Run Kruskal on a six-vertex graph with union-find as the cycle test, count the finds, the unions and the rejects, and state the complexity with the sorting removed.'
    },
    {
      id: 'counting', n: 8,
      title: 'Counting components without tracing the forest',
      start: 210, end: 240,
      objective: 'Read the number of sets off the number of successful unions and off the number of roots, and treat a union that changes nothing as the answer rather than an error.'
    },
    {
      id: 'limits', n: 9,
      title: 'What a disjoint-set forest cannot do',
      start: 240, end: 270,
      objective: 'Name the four things this structure cannot answer — splits, paths, directed cycles and set membership lists — and the data structure that can.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The procedure, and the four traps',
      start: 270, end: 300,
      objective: 'Reduce the topic to four questions asked in order, and name the four traps that decide the mark.'
    }
  ],

  events: [

    /* ---------- scene 1: question ---------- */
    { id: 's1-1', scene: 'question', start: 0, end: 7.5,
      caption: 'Six elements, each alone in its own set. A union merges two sets. A find asks which set an element is in.',
      detail: 'A disjoint-set structure maintains a partition: every element belongs to exactly one set, and the sets never overlap. Three operations act on it. MAKE-SET creates a set holding one element. FIND returns the name of the set an element belongs to. UNION merges the two sets containing two given elements. Nothing else is offered, and no operation ever splits a set.',
      narration: 'Six elements, each alone in its own set. A union merges two sets. A find asks which set an element is in.',
      keyword: 'a union merges two sets' },

    { id: 's1-2', scene: 'question', start: 7.5, end: 15,
      caption: 'The usual representation is a forest: one parent pointer per element, and the root of each tree names the set.',
      detail: 'Each set is a rooted tree drawn upside down, with the root at the top. Every element stores one number, its parent. A root is its own parent. The whole structure is therefore one array of n numbers, which is why the implementation is so small: no child pointers, no adjacency lists, no edge weights.',
      narration: 'The usual representation is a forest. One parent pointer per element, and the root of each tree names the set.',
      keyword: 'the root of each tree names the set' },

    { id: 's1-3', scene: 'question', start: 15, end: 22.5,
      caption: 'Find follows parent pointers to a root. Union points one root at the other. The cost of both is the number of hops.',
      detail: 'FIND x walks from x up to a root and returns it, so its cost is the length of that path. UNION x y finds both roots and, if they differ, changes exactly one pointer: one root becomes the child of the other. The pointer change itself is constant, so the cost of a union is the cost of its two finds.',
      narration: 'Find follows parent pointers to a root. Union points one root at the other. The cost of both is the number of hops.',
      keyword: 'the cost of both is the number of hops' },

    { id: 's1-4', scene: 'question', start: 22.5, end: 30,
      caption: 'Two correct implementations can produce different trees, so the tree shape is the whole subject.',
      detail: 'Both answers below are right: after union of one and two, either one may be the root. That freedom is why the data structure has a design question inside it. Choosing badly costs a factor of n; choosing well costs a factor that grows more slowly than any function you would write down.',
      narration: 'Two correct implementations can produce different trees, so the tree shape is the whole subject.',
      keyword: 'the tree shape is the whole subject' },

    /* ---------- scene 2: chain ---------- */
    { id: 's2-1', scene: 'chain', start: 30, end: 37.5,
      caption: 'Link every new element under the previous one and the eight elements form a chain of height seven.',
      detail: 'The sequence is union of zero with one, then one with two, and so on. The rule used here is "the first root becomes a child of the second", applied without looking at either tree. After seven unions the parent array reads one two three four five six seven seven: each element points at the next, and the last points at itself.',
      narration: 'Link every new element under the previous one, and the eight elements form a chain of height seven.',
      keyword: 'a chain of height seven' },

    { id: 's2-2', scene: 'chain', start: 37.5, end: 45,
      caption: 'Find of zero now walks seven edges. At n elements that same call walks n minus one, so a single find is Theta of n.',
      detail: 'The cost of a find is the depth of the node it starts from, and here the depth of zero is seven out of a possible seven. Nothing in the structure is broken — the answers are all correct — but the cost has grown with the size of the input in the worst possible way.',
      narration: 'Find of zero now walks seven edges. At n elements that same call walks n minus one, so a single find is Theta of n.',
      keyword: 'a single find is Theta of n',
      trap: 'A chain is not a bug in find. Every pointer is valid and every answer is right. The cost comes from the linking rule, which looked at nothing.' },

    { id: 's2-3', scene: 'chain', start: 45, end: 52.5,
      caption: 'Repeat that find m times with no repair and the total is Theta of m times n: the sequence is quadratic for no reason.',
      detail: 'The chain does not improve on its own. Each find re-walks the same seven edges because nothing was changed by the last one. Ten finds of the deepest node on a chain of sixty-four elements cost six hundred and thirty hops, measured on this page.',
      narration: 'Repeat that find m times with no repair and the total is Theta of m times n. The sequence is quadratic for no reason.',
      keyword: 'the sequence is quadratic' },

    { id: 's2-4', scene: 'chain', start: 52.5, end: 60,
      caption: 'Two independent repairs exist: change which root goes under which, and change what find leaves behind.',
      detail: 'The first repair is a rule for choosing the direction of the link, and it is applied at union time. The second is a rewrite of the path, and it is applied at find time. They are independent: either works alone, and together they give the bound this lesson is about. Everything after this scene is one of those two ideas.',
      narration: 'Two independent repairs exist. Change which root goes under which, and change what find leaves behind.',
      keyword: 'two independent repairs' },

    /* ---------- scene 3: rank ---------- */
    { id: 's3-1', scene: 'rank', start: 60, end: 67.5,
      caption: 'Union by rank: keep a rank per node, start it at zero, and attach the lower-ranked root under the higher.',
      detail: 'Rank is an upper bound on the height of a node, not the height itself. When the two ranks differ, the higher-ranked root stays on top and no rank changes. When they are equal, either root may stay on top and its rank increases by one, because the tree just grew one level taller.',
      narration: 'Union by rank. Keep a rank per node, start it at zero, and attach the lower-ranked root under the higher.',
      keyword: 'attach the lower-ranked root under the higher' },

    { id: 's3-2', scene: 'rank', start: 67.5, end: 75,
      caption: 'A root of rank k holds at least two to the k nodes, so no rank exceeds log base two of n. Measured: no violation up to 64.',
      detail: 'The proof is an induction on k. A rank of zero is a single node, which is one node and two to the zero. A root of rank k is created only by merging two roots of rank k minus one, and by the induction hypothesis each holds at least two to the k minus one, so the new tree holds at least two to the k. Taking logs gives rank at most log base two of n, and the depth of any node is at most its rank.',
      narration: 'A root of rank k holds at least two to the k nodes, so no rank exceeds log base two of n. Measured: no violation up to sixty-four.',
      keyword: 'at least two to the k nodes' },

    { id: 's3-3', scene: 'rank', start: 75, end: 82.5,
      caption: 'Eight elements, seven unions: the parent array is 0 0 0 2 0 4 4 6, the root holds all eight, and the height is three.',
      detail: 'The unions are the four pairs, then zero with two, four with six, and finally zero with four. On every tie the first argument\'s root stays on top, which is the rule a hand-graded question must state, because a different tie rule gives a different array. The height of three matches the rank of the root, because no compression has happened yet.',
      narration: 'Eight elements, seven unions. The parent array is zero zero zero two zero four four six, the root holds all eight, and the height is three.',
      keyword: 'the height is three' },

    { id: 's3-4', scene: 'rank', start: 82.5, end: 90,
      caption: 'Union by size is the same rule counted differently: it stores a node count, not a rank. Different array, same logarithmic bound.',
      detail: 'Size doubles the same way rank does, so the height bound is identical, but the two rules can disagree about which root wins a tie, and they then produce different parent arrays for the same sequence of unions. A question that asks for an array must say which rule it means; a question that asks for a bound need not.',
      narration: 'Union by size is the same rule counted differently. It stores a node count, not a rank. Different array, same logarithmic bound.',
      keyword: 'same rule counted differently',
      trap: 'Union by rank and union by size are not interchangeable in a question that asks for the final parent array. They are interchangeable in a question that asks for the height bound.' },

    /* ---------- scene 4: compress ---------- */
    { id: 's4-1', scene: 'compress', start: 90, end: 97.5,
      caption: 'Find of zero on the chain walks seven edges and returns the root. Path compression then makes every node on that path point at the root.',
      detail: 'The walk happens first and it is not cheaper than before: seven hops. What changes is what is left behind. Every node visited is rewritten to point directly at the root, so the chain becomes a star with the root in the middle. The root itself is unchanged, and no element changes set.',
      narration: 'Find of zero on the chain walks seven edges and returns the root. Path compression then makes every node on that path point at the root.',
      keyword: 'makes every node on that path point at the root' },

    { id: 's4-2', scene: 'compress', start: 97.5, end: 105,
      caption: 'The same find again costs one hop. Measured on eight elements: seven hops, then one, then one.',
      detail: 'This is the whole point of compression. The first query pays for the shape it inherits; every later query on that path pays one hop. On a chain of sixty-four elements, ten finds of the deepest node cost seventy-two hops with compression and six hundred and thirty without: sixty-three for the first find, then one hop each for the nine that follow, against sixty-three every time with no compression at all.',
      narration: 'The same find again costs one hop. Measured on eight elements: seven hops, then one, then one.',
      keyword: 'seven hops, then one' },

    { id: 's4-3', scene: 'compress', start: 105, end: 112.5,
      caption: 'Compression never changes a rank, so after find of seven the root still has rank three while the real height has fallen to two.',
      detail: 'Rank records what the height would be without compression, and it is never decreased, because the other branches of the tree are untouched and the true height is not known cheaply. So height is at most rank, and the inequality can be strict. That is why the field is called a rank rather than a height, and it is why the analysis has to be amortised rather than a simple depth count.',
      narration: 'Compression never changes a rank, so after find of seven the root still has rank three while the real height has fallen to two.',
      keyword: 'never changes a rank',
      trap: 'Rank is an upper bound on height and can exceed it. An answer that treats rank and height as the same number is wrong the moment compression is switched on.' },

    { id: 's4-4', scene: 'compress', start: 112.5, end: 120,
      caption: 'Three rewiring variants: two-pass compression, path halving, path splitting. Different pointers, same purpose.',
      detail: 'Two-pass compression walks to the root and then rewrites every node on the way back. Path halving rewrites every second node to point at its grandparent during a single walk. Path splitting points each node at its grandparent as it goes. All three leave the root and the partition alone, and all three support the same asymptotic bound; they differ in constant factors and in how the parent array ends up.',
      narration: 'Three rewiring variants. Two-pass compression, path halving, path splitting. Different pointers, same purpose.',
      keyword: 'different pointers, same purpose' },

    /* ---------- scene 5: bounds ---------- */
    { id: 's5-1', scene: 'bounds', start: 120, end: 127.5,
      caption: 'No repair: a find is Theta of n in the worst case, because the chain is always available as an input sequence.',
      detail: 'The worst case is over sequences, not over single calls, and the chain is a legal sequence of unions. So a structure with neither repair answers a find in time proportional to n, and m operations cost m times n. This is the row of the table that a question is testing when it offers O of n as an option.',
      narration: 'No repair. A find is Theta of n in the worst case, because the chain is always available as an input sequence.',
      keyword: 'Theta of n in the worst case' },

    { id: 's5-2', scene: 'bounds', start: 127.5, end: 135,
      caption: 'Union by rank alone: every find is O of log n, and the bound is tight, because a balanced merge sequence attains log base two of n.',
      detail: 'The upper bound comes from the rank invariant. The lower bound needs a witness, and the witness is the balanced merge: union pairs of equal-rank roots, then pairs of those, and so on. On this page that construction attains exactly log base two of n for n equal to 2, 4, 8, 16, 32 and 64, so O of log n cannot be improved to a constant while the linking rule is the only repair.',
      narration: 'Union by rank alone. Every find is O of log n, and the bound is tight, because a balanced merge sequence attains log base two of n.',
      keyword: 'the bound is tight' },

    { id: 's5-3', scene: 'bounds', start: 135, end: 142.5,
      caption: 'Compression alone: one find can still cost n, but any sequence of m operations costs O of m log n. Tarjan and van Leeuwen, 1984.',
      detail: 'Compression is applied at find time, so it cannot stop a later union from lengthening a path. The chain is still reachable, so a single find is still Theta of n in the worst case. What compression does buy is a total bound over a sequence: with arbitrary linking, m finds and n minus one unions cost O of m log n, which is the theorem proved by Tarjan and van Leeuwen.',
      narration: 'Compression alone. One find can still cost n, but any sequence of m operations costs O of m log n. Tarjan and van Leeuwen, nineteen eighty-four.',
      keyword: 'O of m log n' },

    { id: 's5-4', scene: 'bounds', start: 142.5, end: 150,
      caption: 'Both together: O of m alpha of n for the whole sequence. Measured here at 1.93 hops per operation against 60.93 with no repair.',
      detail: 'The measurement is a random sequence of two thousand unions on two hundred and fifty-six elements, with the same sequence given to each implementation. Hop counts per operation: no repair 60.93, union by rank alone 3.31, compression alone 2.59, both 1.93. The ordering matches the four bounds, and the absolute numbers are properties of this sequence, not of the structure.',
      narration: 'Both together. O of m alpha of n for the whole sequence. Measured here at one point nine three hops per operation against sixty point nine three with no repair.',
      keyword: 'O of m alpha of n' },

    /* ---------- scene 6: alpha ---------- */
    { id: 's6-1', scene: 'alpha', start: 150, end: 157.5,
      caption: 'Ackermann of k and j: A of zero and j is j plus one; A of k and zero is A of k minus one and one; otherwise it is A of k minus one applied to A of k and j minus one.',
      detail: 'The recursion is short and the growth is not. The first row is a successor, the second row is addition, the third is multiplication doubled, the fourth is exponentiation, and each later row is the previous row iterated. Alpha of n is the smallest k of at least one for which A of k and one reaches n, so alpha inverts that growth.',
      narration: 'Ackermann of k and j. A of zero and j is j plus one. A of k and zero is A of k minus one and one. Otherwise A of k minus one applied to A of k and j minus one.',
      keyword: 'Ackermann' },

    { id: 's6-2', scene: 'alpha', start: 157.5, end: 165,
      caption: 'A of k and one gives 2, 3, 5, 13, 65533. So alpha is 1 up to 3, 2 up to 5, 3 up to 13, 4 up to 65533, and 5 after that.',
      detail: 'Each row of the table is computed from the recursion, not quoted. The jump from thirteen to sixty-five thousand five hundred and thirty-three is the fourth row taking over, and the fifth row reaches past two to the sixty-five thousand five hundred and thirty-sixth power, which is about ten to the nineteen thousand seven hundred and twenty-eighth. There are only about ten to the eightieth atoms in the observable universe.',
      narration: 'A of k and one gives two, three, five, thirteen, sixty-five thousand five hundred and thirty-three. So alpha is one up to three, two up to five, three up to thirteen, four up to sixty-five thousand five hundred and thirty-three, and five after that.',
      keyword: '4 up to 65533' },

    { id: 's6-3', scene: 'alpha', start: 165, end: 172.5,
      caption: 'So alpha of n is not one, and it is not a constant: it grows without bound, just astronomically slowly.',
      detail: 'The correct statement is amortised O of alpha of n per operation, or O of m alpha of n for a sequence of m. "Effectively constant" is a remark about how the function behaves for sizes a computer can hold, not a substitution in a proof, and a question that offers both O of one and O of alpha of n wants the second.',
      narration: 'So alpha of n is not one, and it is not a constant. It grows without bound, just astronomically slowly.',
      keyword: 'not one, and it is not a constant',
      trap: 'Answering O of one when O of alpha of n is offered. The first is false as a theorem, even though the two differ by less than a factor of five for every input that fits in memory.' },

    { id: 's6-4', scene: 'alpha', start: 172.5, end: 180,
      caption: 'And the bound is on a sequence: one operation in that sequence may still walk a long path. Amortised is not per operation.',
      detail: 'A single find immediately after a run of unions that lengthened a path can walk many edges; the average over the sequence is what alpha bounds. This is the same distinction the amortised-analysis lesson makes for a doubling table, and it is the reason a real-time system cannot simply read the bound as a latency guarantee.',
      narration: 'And the bound is on a sequence. One operation in that sequence may still walk a long path. Amortised is not per operation.',
      keyword: 'amortised is not per operation' },

    /* ---------- scene 7: kruskal ---------- */
    { id: 's7-1', scene: 'kruskal', start: 180, end: 187.5,
      caption: 'Kruskal sorts the edges and asks one question per edge: are these two endpoints already connected? Two finds answer it.',
      detail: 'If the two roots differ, the edge joins two components and cannot create a cycle, so it is added and the components are merged with one union. If the roots agree, the endpoints are already connected, the edge would close a cycle, and it is rejected. The graph is never traversed: the partition carries exactly the information the question needs.',
      narration: 'Kruskal sorts the edges and asks one question per edge. Are these two endpoints already connected? Two finds answer it.',
      keyword: 'two finds answer it' },

    { id: 's7-2', scene: 'kruskal', start: 187.5, end: 195,
      caption: 'Six vertices, nine edges: five accepted with total weight 14, four rejected. Eighteen finds and five unions, twelve hops.',
      detail: 'The accepted edges in weight order are B C with weight two, D E with two, C D with three, E F with three and A B with four, which totals fourteen. The rejected edges are A C with four, B D with five, D F with six and C E with six, each rejected because its endpoints were already in one component. Every hop count on the canvas comes from running this graph through the model.',
      narration: 'Six vertices, nine edges. Five accepted with total weight fourteen, four rejected. Eighteen finds and five unions, twelve hops.',
      keyword: 'total weight 14' },

    { id: 's7-3', scene: 'kruskal', start: 195, end: 202.5,
      caption: 'The counts are fixed by the graph, not by the weights: two finds per edge, n minus one unions, and m minus n plus one rejects.',
      detail: 'Kruskal examines edges in order and stops when it has accepted n minus one of them, so it may not look at every edge. If it does look at all m, it performs two finds per edge and exactly n minus one successful unions, and the rest are rejections. Those counts are what turn a bound per operation into a bound for the whole algorithm.',
      narration: 'The counts are fixed by the graph, not by the weights. Two finds per edge, n minus one unions, and m minus n plus one rejects.',
      keyword: 'two finds per edge' },

    { id: 's7-4', scene: 'kruskal', start: 202.5, end: 210,
      caption: 'With the sorting removed the cost is the union-find cost: O of m alpha of n with both repairs, O of m log n with rank alone.',
      detail: 'Sorting m edges costs O of m log m, and that term usually dominates. GATE 1992 asked for the complexity when the edges are already sorted, which removes the sorting term and leaves the disjoint-set work — and the answer therefore depends on which implementation the candidate assumes, which is exactly why that question is remembered. Both answers and their conditions are on the Practice tab.',
      narration: 'With the sorting removed the cost is the union-find cost. O of m alpha of n with both repairs, O of m log n with rank alone.',
      keyword: 'the answer depends on the implementation',
      trap: 'Quoting O of m log m for the sorted case. The sort is given away by the question, so the only term left is the disjoint-set work.' },

    /* ---------- scene 8: counting ---------- */
    { id: 's8-1', scene: 'counting', start: 210, end: 217.5,
      caption: 'Ten elements, eight union calls, seven successful: three sets remain, which is n minus the successful unions.',
      detail: 'The eighth call joined one and two, which were already together, so it changed nothing and the count did not move. This is the cheapest way to answer a counting question: count the calls that merged two different trees, subtract from n, and never draw the forest. The page verifies the two routes agree on the same sequence.',
      narration: 'Ten elements, eight union calls, seven successful. Three sets remain, which is n minus the successful unions.',
      keyword: 'n minus the successful unions' },

    { id: 's8-2', scene: 'counting', start: 217.5, end: 225,
      caption: 'The same number is read the other way: count the roots, the elements that are their own parent. Three here.',
      detail: 'Each tree has exactly one root, and each set is exactly one tree, so counting roots counts sets. It is also the fastest audit of a finished parent array, because it needs no traversal: one pass, one comparison per element. If the two routes disagree, the sequence was traced wrongly.',
      narration: 'The same number is read the other way. Count the roots, the elements that are their own parent. Three here.',
      keyword: 'count the roots' },

    { id: 's8-3', scene: 'counting', start: 225, end: 232.5,
      caption: 'After n minus one successful unions on n elements, one set remains: the graph is connected, and the forest is a single tree.',
      detail: 'This is why Kruskal can stop at n minus one accepted edges, and why a connectivity question needs at most n minus one unions. It also bounds the useful work: any further union must fail, because the only two roots are already the same root.',
      narration: 'After n minus one successful unions on n elements, one set remains. The graph is connected, and the forest is a single tree.',
      keyword: 'one set remains' },

    { id: 's8-4', scene: 'counting', start: 232.5, end: 240,
      caption: 'A union that returns false is information, not an error: the two elements are already connected, and in Kruskal that is a cycle.',
      detail: 'Implementations that treat a failed union as an exception throw away the most useful signal in the structure. The cycle test in Kruskal is exactly a union that would have failed, and the component count is exactly the number of unions that succeeded.',
      narration: 'A union that returns false is information, not an error. The two elements are already connected, and in Kruskal that is a cycle.',
      keyword: 'information, not an error' },

    /* ---------- scene 9: limits ---------- */
    { id: 's9-1', scene: 'limits', start: 240, end: 247.5,
      caption: 'A disjoint-set forest only merges. There is no split, no delete, and no way to undo a union.',
      detail: 'The operations are monotone: the number of sets only falls. A problem that needs to separate elements again — an edge deletion, a rollback in a search — needs a different structure, such as a dynamic connectivity structure or a link-cut tree, and those are far beyond what GATE asks.',
      narration: 'A disjoint-set forest only merges. There is no split, no delete, and no way to undo a union.',
      keyword: 'only merges' },

    { id: 's9-2', scene: 'limits', start: 247.5, end: 255,
      caption: 'It answers same or different, not how. The parent pointers are not a path in the graph.',
      detail: 'After a union the parent pointer of a root is a bookkeeping device, not an edge of the original graph. Reconstructing the path between two connected vertices needs an adjacency list and a traversal, and a question that asks for the path is not asking about union-find even when both appear in the same problem.',
      narration: 'It answers same or different, not how. The parent pointers are not a path in the graph.',
      keyword: 'not how' },

    { id: 's9-3', scene: 'limits', start: 255, end: 262.5,
      caption: 'It detects cycles in undirected graphs only. Two vertices joined in both directions are a directed cycle and not an undirected one.',
      detail: 'Kruskal runs on undirected graphs, which is why the cycle test is valid there. On a directed graph the test is simply wrong: an edge from a to b and an edge from b to a leave the undirected structure acyclic-looking, while the directed graph has a two-cycle. Directed cycle detection needs a DFS colouring or a topological sort.',
      narration: 'It detects cycles in undirected graphs only. Two vertices joined in both directions are a directed cycle and not an undirected one.',
      keyword: 'undirected graphs only',
      trap: 'Using find of u against find of v as a directed-cycle test. It answers a question about the underlying undirected graph, which is a different question.' },

    { id: 's9-4', scene: 'limits', start: 262.5, end: 270,
      caption: 'It cannot list the members of a set either. That needs a second structure, such as a member list per root.',
      detail: 'The forest stores one pointer per element, pointing up, so there is no way to walk down from a root to its members. Printing a set therefore costs a scan of all n elements and a find on each. A member list kept per root, spliced on union, restores listing without changing the asymptotic cost of find.',
      narration: 'It cannot list the members of a set either. That needs a second structure, such as a member list per root.',
      keyword: 'cannot list the members' },

    /* ---------- scene 10: procedure ---------- */
    { id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'First: which linking rule? Without one, the parent array is not determined, and a question that asks for it must have said.',
      detail: 'Naive, by rank, or by size, and on a tie which root stays on top. Three rules, three different arrays for the same sequence of unions. If a question asks for an array and does not say, the honest answer names the assumption; if it asks for a bound, the rule only matters at the level of log n against n.',
      narration: 'First, which linking rule? Without one, the parent array is not determined, and a question that asks for it must have said.',
      keyword: 'which linking rule' },

    { id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Second: is compression on? It makes the array depend on the order of the finds, not only on the unions.',
      detail: 'This is the single most common source of a wrong parent array. A sequence of unions fixes an array only if no find rewires anything. The moment compression is on, every query can change the answer to the next question, so the queries are part of the input.',
      narration: 'Second, is compression on? It makes the array depend on the order of the finds, not only on the unions.',
      keyword: 'is compression on',
      trap: 'Tracing unions only, then answering a question that had finds in the middle. The finds rewired the paths the unions left behind.' },

    { id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Third: count hops, not operations, and state n and m. A bound without its two parameters is not a bound.',
      detail: 'The unit of cost is the pointer hop, which is what a find spends. A sequence of m operations on n elements is the shape every bound in this topic takes, and a question that quotes O of m alpha of n is quoting a total, not a per-operation figure.',
      narration: 'Third, count hops, not operations, and state n and m. A bound without its two parameters is not a bound.',
      keyword: 'count hops, not operations' },

    { id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Three sentences to write: no repair Theta of n; rank alone O of log n and tight; both together O of m alpha of n amortised.',
      detail: 'Each sentence carries its assumption, and the third is a statement about a sequence. With those three, every option list in this topic can be eliminated or confirmed, and every parent array can be traced once the linking rule and the query order are known.',
      narration: 'Three sentences to write. No repair, Theta of n. Rank alone, O of log n and tight. Both together, O of m alpha of n amortised.',
      keyword: 'three sentences' }
  ]
};
