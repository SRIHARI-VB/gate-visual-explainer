/* ==========================================================================
   strongly-connected-components - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 340,

  scenes: [
    { id: 'oneway',     n: 1,  title: 'One-way streets: the question is whether you can get back', objective: 'state what "strongly connected" adds to "reachable", and why the answer is a property of a whole set of vertices', start: 0,   end: 30  },
    { id: 'formal',     n: 2,  title: 'The definition, and the partition it forces', objective: 'define u ~ v as mutual reachability, show it is an equivalence relation, and read the components as its classes', start: 30,  end: 58  },
    { id: 'graph',      n: 3,  title: 'One graph, four components, counted', objective: 'find the components of the drawn graph by hand, and see that the count is a fact about mutual reachability and nothing else', start: 58,  end: 90  },
    { id: 'pass1',      n: 4,  title: 'Kosaraju pass 1: finish every vertex, and record the order', objective: 'run a depth-first search on the graph and read off the discovery and finish times and the finish order', start: 90,  end: 126 },
    { id: 'lemma',      n: 5,  title: 'The lemma that makes the order useful', objective: 'state and use the fact that the vertex with the largest finish time lies in a source component, and that finishing order respects the condensation', start: 126, end: 158 },
    { id: 'pass2',      n: 6,  title: 'Kosaraju pass 2: the transpose, in that order', objective: 'run the second depth-first search on the reversed graph in decreasing finish order, and read each tree as one component', start: 158, end: 192 },
    { id: 'why',        n: 7,  title: 'Why the transpose, and why that order', objective: 'see on a two-vertex counterexample what goes wrong with the original graph or with the ascending order, and why the first tree cannot escape its component', start: 192, end: 220 },
    { id: 'condense',   n: 8,  title: 'The condensation: contract every component', objective: 'contract the four components to four vertices, check the result is acyclic, and read the condensation as the graph that survives', start: 220, end: 252 },
    { id: 'tarjan',     n: 9,  title: 'Tarjan: one pass, and a number per vertex', objective: 'compute the low-link value, see low equal the discovery index exactly at a component root, and pop a component when they meet', start: 252, end: 282 },
    { id: 'augment',    n: 10, title: 'How many edges make it strongly connected', objective: 'state the Eswaran-Tarjan count max(sources, sinks) + isolated on the condensation, and refute the shortcut that drops the isolated term', start: 282, end: 312 },
    { id: 'gate',       n: 11, title: 'A previous-year item, recomputed', objective: 'answer the 2014 Set 1 question from the definition rather than from memory, and state the five-step procedure', start: 312, end: 340 }
  ],

  events: [
    /* ---- 1. one-way streets ------------------------------------------------ */
    { id: 'o1', scene: 'oneway', start: 0, end: 8,
      caption: 'A directed graph is a set of one-way streets. Reachable is easy; the interesting question is whether you can get back.',
      narration: 'A directed graph is a set of one-way streets. Going from one vertex to another is easy to check. The interesting question is the return trip: from the second vertex, can you get back to the first?',
      detail: 'Reachability is not symmetric. An edge u to v says nothing at all about v to u, which is why every question in this topic begins by fixing a pair and asking about both directions.',
      keyword: 'whether you can get back' },

    { id: 'o2', scene: 'oneway', start: 8, end: 15,
      caption: 'If the return trip exists, the two vertices are mutually reachable, and they are in the same strongly connected component.',
      narration: 'When the return trip exists, the two vertices are mutually reachable, and we say they lie in the same strongly connected component. The word strong is the return trip: a weakly connected graph only needs the edges to work in one direction.',
      detail: 'A component is maximal: you cannot add another vertex to it and keep every pair mutually reachable. That maximality is what makes the components a partition rather than an arbitrary family of sets.',
      keyword: 'mutually reachable' },

    { id: 'o3', scene: 'oneway', start: 15, end: 23,
      caption: 'A single vertex is always its own component, even with no edges at all, because a vertex reaches itself by the empty path.',
      narration: 'One boundary case first, because it decides many answers. A single vertex is always its own component, even when no edge touches it, because a vertex reaches itself by a path of length zero. A graph with no edges at all has one component per vertex.',
      detail: 'This is the case that most counting questions turn on, and the case that a shortcut written as the maximum of two counts usually gets wrong. It returns in scene 10.',
      keyword: 'its own component',
      trap: 'An isolated vertex is a strongly connected component. Questions that say "how many components" are counting it, and answers that skip it are off by the number of isolated vertices.' },

    { id: 'o4', scene: 'oneway', start: 23, end: 30,
      caption: 'So the question is not about edges. It is about a whole set of vertices that can all reach each other, in both directions, every pair.',
      narration: 'So the object is not an edge and not a path. It is a set of vertices, every pair of which can reach the other in both directions. That is the object the rest of this lesson computes.',
      detail: 'Every definition below is a restatement of that sentence, and every algorithm below is a way to find those sets without testing all pairs.',
      keyword: 'a whole set of vertices' },

    /* ---- 2. the definition ------------------------------------------------- */
    { id: 'f1', scene: 'formal', start: 30, end: 38,
      caption: 'Write u ~ v when there is a path from u to v and a path from v to u. The empty path counts, so u ~ u always.',
      narration: 'Write u tilde v when there is a path from u to v and also a path from v to u. Paths of length zero count, so every vertex is related to itself. That single convention is what makes the relation reflexive.',
      detail: 'The relation is defined on the vertex set, not on the edges. Two vertices in the same component may have no edge between them at all: in the drawn graph, A and C are in one component without an edge joining them directly.',
      keyword: 'u tilde v' },

    { id: 'f2', scene: 'formal', start: 38, end: 46,
      caption: 'The relation is reflexive, symmetric and transitive, so it is an equivalence relation, and its classes are the components.',
      narration: 'The relation is reflexive, symmetric and transitive. Reflexive because of the empty path; symmetric because the definition asks for both directions; transitive because two paths can be joined end to end. An equivalence relation on a set always splits the set into disjoint classes, and those classes are exactly the strongly connected components.',
      detail: 'Transitivity is the one worth checking: if u reaches v and v reaches w, then following the first path and then the second reaches w; the return paths join in the other order. Nothing else is needed.',
      keyword: 'an equivalence relation' },

    { id: 'f3', scene: 'formal', start: 46, end: 52,
      caption: 'Two consequences, both used in every question: the components are disjoint, and they cover every vertex exactly once.',
      narration: 'Two consequences follow immediately and both are used in every question. The components are pairwise disjoint, because a vertex in two of them would make all their vertices mutually reachable. And together they cover every vertex, because every vertex is related to itself.',
      detail: 'So the number of components is a partition count, and any algorithm that returns overlapping sets has a bug, whatever its output looks like.',
      keyword: 'disjoint, and they cover every vertex' },

    { id: 'f4', scene: 'formal', start: 52, end: 58,
      caption: 'A graph is strongly connected exactly when it has one component, which is why the phrase is "component", not "strongly connected set".',
      narration: 'A graph is called strongly connected when it has exactly one component. That is the whole of the term, and it is why the object here is the component and not the graph: most graphs have several.',
      detail: 'The complement of the statement is the useful one in questions: a graph is not strongly connected exactly when its component count exceeds one.',
      keyword: 'exactly one component' },

    /* ---- 3. the drawn graph ------------------------------------------------ */
    { id: 'g1', scene: 'graph', start: 58, end: 66,
      caption: 'Nine vertices, thirteen edges. The components are A B C, D E, F G, and H I: four of them.',
      narration: 'Here is the graph this lesson works on. Nine vertices and thirteen edges. Reading it by eye, the components are A B C, then D and E, then F and G, then H and I. Four components, of sizes three, two, two and two.',
      detail: 'Each triple or pair is a cycle: A to B to C back to A, D to E back to D, F to G back to F, H to I back to H. Between the components the edges run one way only, which is what stops them merging.',
      keyword: 'four of them' },

    { id: 'g2', scene: 'graph', start: 66, end: 74,
      caption: 'Within a component every pair reaches every other. Between components the traffic runs one way: C reaches D, but nothing returns.',
      narration: 'Inside a component every pair reaches every other, by going round the cycle. Between components the traffic runs one way only: C reaches D, and there is no path from D back to C. That one-way edge is exactly why the two sets stay separate.',
      detail: 'The same test applies to the skip edge from E to H: it leaves the second component for the fourth and returns nothing, so it does not merge them.',
      keyword: 'the traffic runs one way' },

    { id: 'g3', scene: 'graph', start: 74, end: 82,
      caption: 'The count is 4. Checking it by hand means, for each vertex, finding everything it reaches and everything that reaches it, and intersecting.',
      narration: 'So the count is four. Checking that by hand, without an algorithm, means this: for one vertex, list everything it can reach, then list everything that can reach it, and intersect the two lists. The intersection is its component. Doing that for every vertex is the definition, and it is also the slow method.',
      detail: 'The slow method costs one traversal per vertex, so n traversals. Every algorithm in the rest of this lesson finds the same partition in two traversals or one, which is the point of the subject.',
      keyword: 'The count is 4' },

    { id: 'g4', scene: 'graph', start: 82, end: 90,
      caption: 'Two traversals are enough. Kosaraju needs two passes over the graph; Tarjan needs one. Both are linear in vertices plus edges.',
      narration: 'Two traversals are enough. Kosaraju uses two passes, and Tarjan uses one, and both run in time proportional to the vertices plus the edges. The next six scenes are the two passes and the reason they work.',
      detail: 'Linear here means the cost is bounded by a constant times the number of vertices plus the number of edges, with no log and no quadratic term. The page checks that both algorithms return the same partition as the slow definition on every directed graph with up to four vertices.',
      keyword: 'Two traversals are enough' },

    /* ---- 4. pass 1 --------------------------------------------------------- */
    { id: 'p1', scene: 'pass1', start: 90, end: 98,
      caption: 'Pass one is an ordinary depth-first search of the graph, started at E, then A, then F. Every vertex gets a discovery and a finish time.',
      narration: 'Pass one is an ordinary depth-first search, with one addition: every vertex is given two timestamps. The discovery time, written d, is when the search first arrives; the finish time, written f, is when it leaves for good, after every vertex reachable from it has been dealt with. The search starts at E, then A, then F.',
      detail: 'The clock is a single counter that goes up by one at each of those two moments, so the numbers are 1 to 18 on a nine-vertex graph. They are an artefact of the order of the search, not a property of the graph.',
      keyword: 'discovery and a finish time' },

    { id: 'p2', scene: 'pass1', start: 98, end: 106,
      caption: 'From E the search goes to D, which finishes at 3; then E walks to F, G, H, I and finishes at 12. A finishes last, at 18.',
      narration: 'Starting at E, the search first takes the edge to D. D has nothing left to explore, so D finishes at 3, and the search returns to E. From E it takes the skip edge to F, then G, then H, then I, and each of those finishes in turn as the recursion unwinds. E itself finishes at 12. Then a fresh search starts at A, goes to B, to C, and back, and A finishes last, at 18.',
      detail: 'D finishes before E, and E before A. The nesting is the parenthesis property: the interval from d to f for a vertex contains the intervals of everything discovered from it, and two intervals are either nested or disjoint, never overlapping.',
      keyword: 'A finishes last, at 18' },

    { id: 'p3', scene: 'pass1', start: 106, end: 114,
      caption: 'Push each vertex on a stack as it finishes. The stack reads D I H G F E C B A: the order the search finished, bottom to top.',
      narration: 'Now the one addition that matters. As each vertex finishes, push it on a stack. Reading the stack from the bottom, the order is D, I, H, G, F, E, C, B, A. That is exactly the order in which the vertices finished, which is also the order of the finish times.',
      detail: 'Reading the stack from the top gives the decreasing finish order, which is the order pass two consumes. The two readings are the same list reversed, and mixing them up is the commonest error in the algorithm.',
      keyword: 'the order the search finished' },

    { id: 'p4', scene: 'pass1', start: 114, end: 126,
      caption: 'Pass one proves nothing on its own. It produces one list, and the second pass consumes that list from the top down.',
      narration: 'Pass one has not found a single component. It has produced one list, and that is all. The next scene states the property of the list that makes it worth producing, and pass two consumes it from the top down.',
      detail: 'A useful way to remember the shape: pass one sorts the vertices by when the search gave up on them; pass two visits them in the opposite order, which is the order in which the search gave up last.',
      keyword: 'Pass one proves nothing on its own' },

    /* ---- 5. the lemma ------------------------------------------------------ */
    { id: 'l1', scene: 'lemma', start: 126, end: 134,
      caption: 'The vertex with the largest finish time, here A, lies in a source component: one with no edge coming into it from another component.',
      narration: 'Here is the lemma. Take the vertex with the largest finish time. It lies in a source component, meaning a component with no edge entering it from any other component. In this graph that vertex is A, and the component is A B C, which is indeed the source.',
      detail: 'This is a fact about every graph and every start order, not about this one. The page checks it on every directed graph with up to four vertices: the maximum finish time always lands inside a source component of the condensation.',
      keyword: 'a source component' },

    { id: 'l2', scene: 'lemma', start: 134, end: 142,
      caption: 'The reason: if component X has an edge into component Y, the last vertex of X finishes after the last vertex of Y.',
      narration: 'The reason is a comparison between two components. Suppose there is an edge from component X into component Y. Then the last vertex of X to finish finishes after the last vertex of Y does. Whichever of the two components the search enters first, the other one is fully dealt with before the first one can finish.',
      detail: 'Case one: the search enters X first. From X it can reach Y through the edge, so every vertex of Y is discovered inside that search and finishes before the vertex of X does. Case two: the search enters Y first. Then Y finishes entirely before any vertex of X is even discovered, so its last finish is smaller again.',
      keyword: 'finishes after the last vertex of Y' },

    { id: 'l3', scene: 'lemma', start: 142, end: 150,
      caption: 'So ordering the components by their largest finish time gives a topological order of the condensation, largest first.',
      narration: 'So if you contract each component to one vertex and order the components by their largest finish time, decreasing, you get a topological order of that contracted graph. Edges always run from a component that finishes later to one that finishes earlier.',
      detail: 'On the drawn graph the four components finish last at 18, 12, 11 and 9, which orders them A B C, then D E, then F G, then H I: exactly the order the edges run in. The page checks that this ordering is a topological order on every graph it can enumerate.',
      keyword: 'a topological order' },

    { id: 'l4', scene: 'lemma', start: 150, end: 158,
      caption: 'That is why the list from pass one is worth keeping: it is the condensation in topological order, written in vertices.',
      narration: 'That is the whole value of pass one. The list it produces is the condensation, in topological order, written out in vertices rather than in components. Pass two only has to cut the list into the pieces that belong together.',
      detail: 'Notice what the lemma does not say: it does not say that consecutive vertices in the list are in the same component, and it does not say the list is a topological order of the original graph, which may have cycles and therefore no topological order at all.',
      keyword: 'the condensation in topological order',
      trap: 'A graph with a cycle has no topological order of its vertices. The order above is a topological order of the components, which always exists because the condensation is always acyclic.' },

    /* ---- 6. pass 2 --------------------------------------------------------- */
    { id: 's1', scene: 'pass2', start: 158, end: 166,
      caption: 'Pass two reverses every edge, and runs the same search on the reversed graph, taking the vertices in decreasing finish order.',
      narration: 'Pass two does two things. It reverses every edge, producing the transpose, and it runs the same depth-first search on that reversed graph, taking the starting vertices in decreasing finish order, that is, from the top of the stack.',
      detail: 'The transpose has the same vertices and the same components, because reversing every edge reverses every path, so mutual reachability is unchanged. That invariance is exactly what the 2014 previous-year item asks about, in scene 11.',
      keyword: 'reverses every edge' },

    { id: 's2', scene: 'pass2', start: 166, end: 174,
      caption: 'The first tree is rooted at A and reaches only A B C. In the reversed graph, nothing outside that component leads back in.',
      narration: 'The first tree is rooted at A. In the reversed graph, the edge that used to run from C to D now runs from D to C, so from inside A B C there is no way out. The tree reaches A, B and C and stops. That is the first component.',
      detail: 'The reason is the lemma read backwards: in the transpose, the source component of the original has become a sink, and a sink has no outgoing edge, so a search inside it cannot leave.',
      keyword: 'reaches only A B C' },

    { id: 's3', scene: 'pass2', start: 174, end: 182,
      caption: 'The next unvisited vertex in the order is E, then F, then H. Four trees, four components: A B C, D E, F G, H I.',
      narration: 'The next vertex in the order that has not been visited is E, and its tree is D and E. Then F, whose tree is F and G. Then H, whose tree is H and I. Four trees, and the four trees are the four components.',
      detail: 'The roots are A, E, F and H: one per component, each the first vertex of its component in the decreasing finish order. Note that the root is not always the last vertex of the component to finish, which is why the lemma is stated about components and not about vertices.',
      keyword: 'Four trees, four components' },

    { id: 's4', scene: 'pass2', start: 182, end: 192,
      caption: 'Two passes, each linear. Every tree of the second pass is one component, and every component is exactly one tree.',
      narration: 'That is the algorithm. Two depth-first searches, each linear in vertices plus edges, and the trees of the second search are exactly the components. The page checks the partition against the slow definition on every directed graph with up to four vertices, and on sixteen hundred random graphs with five to eight.',
      detail: 'The cost is linear because each vertex is visited once per pass and each edge is examined once per pass. The sort by finish time is avoided by the stack, which is why the algorithm is linear rather than linear times a log.',
      keyword: 'the trees of the second search are exactly the components' },

    /* ---- 7. why ------------------------------------------------------------ */
    { id: 'w1', scene: 'why', start: 192, end: 200,
      caption: 'Both details are load-bearing. Run pass two on the original graph and the answer is wrong on a graph with two vertices and one edge.',
      narration: 'Both details are load-bearing, and the smallest counterexample is two vertices with a single edge from A to B. On the original graph, pass two starts at A, walks the edge, and reports one component A B. The truth is two components. The edge runs one way, and the search cannot tell the difference.',
      detail: 'The page found that counterexample by searching the graphs in order of size, not by choosing it: it is the first graph, in the enumeration, on which the variant fails. The same two-vertex graph also breaks the second variant, so both errors are caught by the smallest possible example.',
      keyword: 'the answer is wrong on a graph with two vertices',
      trap: 'Reversing the edges is not a detail of implementation. On the original graph the second search follows edges forward, which merges a component with anything downstream of it.' },

    { id: 'w2', scene: 'why', start: 200, end: 208,
      caption: 'Take the vertices in ascending finish order instead and the same two vertices break it again: B first, then A, and one tree covers both.',
      narration: 'The order is load-bearing too. On the transpose, taking the vertices in ascending finish order means starting at B, whose reversed edge leads to A, so one tree covers both vertices again. The order has to be decreasing, which is the top of the stack.',
      detail: 'The two failures are dual: the wrong graph needs the wrong direction, and the wrong order needs the wrong comparison. A candidate who remembers "reverse something" without remembering which has a fifty per cent chance on each of the two choices.',
      keyword: 'ascending finish order' },

    { id: 'w3', scene: 'why', start: 208, end: 216,
      caption: 'With both details right, the first tree cannot escape: an edge leaving the tree in the transpose would be an edge entering the component in the original.',
      narration: 'With both details right, the argument closes. Suppose the first tree left its component through some edge of the transpose. Reversing that edge gives an edge of the original graph that enters the component from outside. But the component of the largest finish time is a source, so no such edge exists. The tree is trapped inside the component, and the component is exactly what it reaches.',
      detail: 'After the first component is removed, the argument repeats: the remaining vertices, in the same order, satisfy the same hypothesis, so the next tree is the next component. That induction is the proof, and it is why the algorithm needs no backtracking.',
      keyword: 'The tree is trapped inside the component' },

    { id: 'w4', scene: 'why', start: 216, end: 220,
      caption: 'So the recipe is: search, stack on finish, transpose, search again in stack order, and each tree is a component.',
      narration: 'So the recipe is four steps: search the graph and stack each vertex as it finishes; reverse every edge; search the reversed graph, taking vertices from the top of the stack; and read each tree as one component.',
      detail: 'Written that way it is short enough to reproduce in an exam, and every clause has a reason stated in this scene. The next scene looks at the object the algorithm has really computed.',
      keyword: 'four steps' },

    /* ---- 8. the condensation ----------------------------------------------- */
    { id: 'c1', scene: 'condense', start: 220, end: 228,
      caption: 'Contract each component to a single vertex. Nine vertices become four, and thirteen edges become four distinct ones.',
      narration: 'Now contract. Replace each component by a single vertex. Nine vertices become four, and the thirteen edges collapse into four distinct ones: the first component to the second, the second to the third, the third to the fourth, and the second to the fourth directly, through the skip edge.',
      detail: 'Edges inside a component disappear, because both ends become the same vertex. Parallel edges between two components collapse into one, because the condensation is a simple graph. The page counts distinct pairs, not original edges.',
      keyword: 'Nine vertices become four' },

    { id: 'c2', scene: 'condense', start: 228, end: 236,
      caption: 'The result has no cycle, always. If it had one, those components would all be mutually reachable and would have been one component.',
      narration: 'The contracted graph never has a cycle, and the reason is short. A cycle among contracted vertices would mean each of those components reaches the next and the last reaches the first, so all of them are mutually reachable. But then they were never separate components. So the contraction is always acyclic.',
      detail: 'This is why the condensation is the right object for the questions that follow: every hard question about a directed graph becomes a question about a directed acyclic graph, where topological order, longest path and reachability all have simple answers.',
      keyword: 'The result has no cycle, always' },

    { id: 'c3', scene: 'condense', start: 236, end: 244,
      caption: 'The condensation is the graph that survives: it is a DAG, it has a topological order, and it is where source and sink questions live.',
      narration: 'So the condensation is the graph that survives the analysis. It is acyclic, so it has a topological order, and here that order is the first component, the second, the third, the fourth. It is also where the words source and sink belong: one source here, one sink, and no isolated component.',
      detail: 'Two paths run from the source to the sink: through the third component, or straight through the skip edge. A path count in a DAG is a dynamic-programming question, and the existing lesson on dynamic programming is the right place for it.',
      keyword: 'the graph that survives' },

    { id: 'c4', scene: 'condense', start: 244, end: 252,
      caption: 'Two counts worth knowing: the number of components, and the number of distinct edges between them. Both are read off the condensation.',
      narration: 'Two counts are worth knowing and both are read off the condensation. The number of components is its number of vertices, and the number of distinct edges between components is its number of edges. On this graph those are four and four.',
      detail: 'A third count that questions ask for is the number of components of size one, which is the number of isolated vertices of the condensation. The page reports all three for the drawn graph.',
      keyword: 'the number of components' },

    /* ---- 9. Tarjan --------------------------------------------------------- */
    { id: 't1', scene: 'tarjan', start: 252, end: 260,
      caption: 'Tarjan finds the same partition in one pass, by giving each vertex a second number: the low-link value.',
      narration: 'Tarjan finds the same partition in a single pass. Each vertex gets the discovery index it already had, and one more number called the low-link value: the smallest discovery index reachable from that vertex by following tree edges and at most one edge back into the current search.',
      detail: 'The low-link value is a measure of how far up the search tree a vertex can climb back. A vertex whose low-link equals its own discovery index cannot climb at all, and that is precisely a component root.',
      keyword: 'the low-link value' },

    { id: 't2', scene: 'tarjan', start: 260, end: 268,
      caption: 'On the drawn graph the values come out 0 0 0 for the first component, 3 3, 5 5, 7 7. Equal within a component, larger across components.',
      narration: 'On the drawn graph, with indices numbered from zero in the order A, B, C, D, E, F, G, H, I, the low-link values are zero for A, B and C; three for D and E; five for F and G; seven for H and I. Inside a component the values agree, and across components they strictly increase.',
      detail: 'The equality inside a component is not a coincidence: every vertex of a component can climb back to the component root, so all of them share the root index as their low value. The root is the first vertex of the component that the search discovered.',
      keyword: 'Equal within a component' },

    { id: 't3', scene: 'tarjan', start: 268, end: 276,
      caption: 'When a vertex finds low equal to its own index, everything on the stack above it is one component, and it is popped.',
      narration: 'The rule is one line. When a vertex finishes and finds that its low-link value equals its own discovery index, everything on the stack above it, itself included, is one component, and it is popped off. The vertices above it are exactly the ones that could climb back to it.',
      detail: 'The stack here is not the finish stack of Kosaraju. It holds the vertices currently in the search, and a vertex is popped exactly once, which is why the total work is linear.',
      keyword: 'pops a component' },

    { id: 't4', scene: 'tarjan', start: 276, end: 282,
      caption: 'One pass instead of two, no transpose, same answer. The two algorithms agree on every graph this page can enumerate.',
      narration: 'So Tarjan needs one pass and no transpose, and returns the same partition. The page checks that agreement on every directed graph with two, three and four vertices, and on sixteen hundred random graphs with five to eight, with the slow definition as the referee.',
      detail: 'Neither algorithm is examined for its code here. What is examined is the partition, the count, and the two properties that make the algorithms work: finishing order respects the condensation, and low equal to index marks a component root.',
      keyword: 'One pass instead of two' },

    /* ---- 10. augmentation -------------------------------------------------- */
    { id: 'a1', scene: 'augment', start: 282, end: 290,
      caption: 'A standard question: how many edges must be added to make the whole graph strongly connected? Add one here, from the sink back to the source.',
      narration: 'A standard question asks how many edges must be added so that the whole graph becomes strongly connected. Here the answer is one: an edge from the sink component back to the source component. Every vertex can then reach the source, and the source reaches everything.',
      detail: 'The question is about adding edges, never removing them, and the edges added may join any two vertices, including vertices in the same component.',
      keyword: 'how many edges must be added' },

    { id: 'a2', scene: 'augment', start: 290, end: 298,
      caption: 'On the condensation: count the sources, the sinks, and the isolated components. The answer is the larger of the first two, plus the isolated count.',
      narration: 'The rule is read off the condensation. Count the sources, meaning components with no edge coming in; count the sinks, meaning components with no edge going out; and count the isolated components, which have neither. The number of edges to add is the larger of the source count and the sink count, plus the number of isolated components.',
      detail: 'This is the Eswaran and Tarjan count. The lower bound is immediate: every source needs an incoming edge and every sink needs an outgoing edge, and an isolated component needs both, so it costs one edge of its own.',
      keyword: 'plus the isolated count' },

    { id: 'a3', scene: 'augment', start: 298, end: 306,
      caption: 'Dropping the isolated term is wrong: one edge A to B plus an isolated C needs two edges, not the one the shortcut gives.',
      narration: 'The term that gets dropped is the isolated one, and dropping it gives a wrong answer. Take one edge from A to B and a third vertex C with no edges. There is one source, one sink and one isolated component, so the count is two. The shortcut that takes only the larger of source and sink says one, and one edge cannot give C both an incoming and an outgoing edge.',
      detail: 'The page verifies the formula against a brute-force search on every acyclic directed graph with up to four vertices: five hundred and seventy-one graphs, no disagreement. The brute force tries every set of added edges of size one, then two, until the graph is strongly connected.',
      keyword: 'needs two edges, not the one',
      trap: 'A single vertex with no edges is already strongly connected, so the answer there is zero. That is why the formula carries the condition that the condensation has more than one component.' },

    { id: 'a4', scene: 'augment', start: 306, end: 312,
      caption: 'Two boundaries: a one-component graph needs nothing, and a condensation with two isolated components needs two edges.',
      narration: 'Two boundaries close the rule. If the condensation has a single component, the graph is already strongly connected and the answer is zero. If the condensation is two isolated components, the answer is two, one edge each way, which is what the formula gives because the isolated term counts both.',
      detail: 'Both boundaries are computed in the page and checked against the brute force, so the rule is stated with the hypothesis it needs rather than as a slogan.',
      keyword: 'Two boundaries' },

    /* ---- 11. previous-year item -------------------------------------------- */
    { id: 'q1', scene: 'gate', start: 312, end: 320,
      caption: 'GATE CSE 2014, Set 1: which of four derived graphs has the same strongly connected components as G?',
      narration: 'GATE CSE 2014, Set 1 asks which of four graphs built from a directed graph G has the same strongly connected components. The four are the complement, the transpose, the graph of paths of length at most two, and the graph with the isolated vertices deleted.',
      detail: 'The question is answered from the definition, not from a remembered key: the components are the classes of mutual reachability, so a construction preserves them exactly when it preserves every pair of mutual reachability relations.',
      keyword: 'the same strongly connected components' },

    { id: 'q2', scene: 'gate', start: 320, end: 328,
      caption: 'The transpose. Reversing every edge reverses every path, so u reaches v becomes v reaches u, and mutual reachability is untouched.',
      narration: 'The answer is the transpose. Reversing every edge reverses every path, so the statement that u reaches v becomes the statement that v reaches u. Mutual reachability is therefore unchanged for every pair, so every component is unchanged. The page checks it on all four thousand and ninety-six directed graphs with four vertices.',
      detail: 'The complement fails badly: it differs on three thousand six hundred and eighty-four of those four thousand and ninety-six graphs. Deleting the isolated vertices fails on two hundred and thirty-five, because an isolated vertex is a component of its own and deleting it changes the count.',
      keyword: 'The transpose' },

    { id: 'q3', scene: 'gate', start: 328, end: 334,
      caption: 'The page reports honestly that the length-two option also preserved the components in its search, so the item is best read as asking for the definitional answer.',
      narration: 'One honest note. On every graph the page searched, the graph of paths of length at most two also preserved the components, and a two-step induction says why: any path can be cut into steps of length one or two. So that option is arguably correct as well. The paper keys the transpose, and the transpose is the answer to give, with the reason above.',
      detail: 'Saying this is better than pretending the search refuted an option it did not. The lesson reports what it checked and what it found, and the exam advice stands on the definition rather than on the key.',
      keyword: 'also preserved the components' },

    { id: 'q4', scene: 'gate', start: 334, end: 340,
      caption: 'Five steps: define mutual reachability, contract, read the condensation, then answer the count, the order, or the augmentation.',
      narration: 'Five steps answer the questions in this topic. Define the components as the classes of mutual reachability. Find them by the two passes or by Tarjan. Contract to the condensation. Check it is acyclic. Then answer whichever the question asks: the count, the topological order, or the number of edges to add.',
      detail: 'The step candidates skip is the contraction. Almost every hard question in this topic is easy once the condensation is on the page, and almost every wrong answer comes from answering about the original graph.',
      keyword: 'Five steps' }
  ]
};
