# Strongly Connected Components — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/strongly-connected-components/index.html`
- Total duration: 5:40 (340 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One-way streets: the question is whether you can get back

*0:00 – 0:30 · objective: state what "strongly connected" adds to "reachable", and why the answer is a property of a whole set of vertices*

**0:00–0:08** — A directed graph is a set of one-way streets. Going from one vertex to another is easy to check. The interesting question is the return trip: from the second vertex, can you get back to the first?

> Caption: A directed graph is a set of one-way streets. Reachable is easy; the interesting question is whether you can get back.

**0:08–0:15** — When the return trip exists, the two vertices are mutually reachable, and we say they lie in the same strongly connected component. The word strong is the return trip: a weakly connected graph only needs the edges to work in one direction.

> Caption: If the return trip exists, the two vertices are mutually reachable, and they are in the same strongly connected component.

**0:15–0:23** — One boundary case first, because it decides many answers. A single vertex is always its own component, even when no edge touches it, because a vertex reaches itself by a path of length zero. A graph with no edges at all has one component per vertex.

> Caption: A single vertex is always its own component, even with no edges at all, because a vertex reaches itself by the empty path.

Exam-trap caption mode adds: *An isolated vertex is a strongly connected component. Questions that say "how many components" are counting it, and answers that skip it are off by the number of isolated vertices.*

**0:23–0:30** — So the object is not an edge and not a path. It is a set of vertices, every pair of which can reach the other in both directions. That is the object the rest of this lesson computes.

> Caption: So the question is not about edges. It is about a whole set of vertices that can all reach each other, in both directions, every pair.

## Scene 2. The definition, and the partition it forces

*0:30 – 0:58 · objective: define u ~ v as mutual reachability, show it is an equivalence relation, and read the components as its classes*

**0:30–0:38** — Write u tilde v when there is a path from u to v and also a path from v to u. Paths of length zero count, so every vertex is related to itself. That single convention is what makes the relation reflexive.

> Caption: Write u ~ v when there is a path from u to v and a path from v to u. The empty path counts, so u ~ u always.

**0:38–0:46** — The relation is reflexive, symmetric and transitive. Reflexive because of the empty path; symmetric because the definition asks for both directions; transitive because two paths can be joined end to end. An equivalence relation on a set always splits the set into disjoint classes, and those classes are exactly the strongly connected components.

> Caption: The relation is reflexive, symmetric and transitive, so it is an equivalence relation, and its classes are the components.

**0:46–0:52** — Two consequences follow immediately and both are used in every question. The components are pairwise disjoint, because a vertex in two of them would make all their vertices mutually reachable. And together they cover every vertex, because every vertex is related to itself.

> Caption: Two consequences, both used in every question: the components are disjoint, and they cover every vertex exactly once.

**0:52–0:58** — A graph is called strongly connected when it has exactly one component. That is the whole of the term, and it is why the object here is the component and not the graph: most graphs have several.

> Caption: A graph is strongly connected exactly when it has one component, which is why the phrase is "component", not "strongly connected set".

## Scene 3. One graph, four components, counted

*0:58 – 1:30 · objective: find the components of the drawn graph by hand, and see that the count is a fact about mutual reachability and nothing else*

**0:58–1:06** — Here is the graph this lesson works on. Nine vertices and thirteen edges. Reading it by eye, the components are A B C, then D and E, then F and G, then H and I. Four components, of sizes three, two, two and two.

> Caption: Nine vertices, thirteen edges. The components are A B C, D E, F G, and H I: four of them.

**1:06–1:14** — Inside a component every pair reaches every other, by going round the cycle. Between components the traffic runs one way only: C reaches D, and there is no path from D back to C. That one-way edge is exactly why the two sets stay separate.

> Caption: Within a component every pair reaches every other. Between components the traffic runs one way: C reaches D, but nothing returns.

**1:14–1:22** — So the count is four. Checking that by hand, without an algorithm, means this: for one vertex, list everything it can reach, then list everything that can reach it, and intersect the two lists. The intersection is its component. Doing that for every vertex is the definition, and it is also the slow method.

> Caption: The count is 4. Checking it by hand means, for each vertex, finding everything it reaches and everything that reaches it, and intersecting.

**1:22–1:30** — Two traversals are enough. Kosaraju uses two passes, and Tarjan uses one, and both run in time proportional to the vertices plus the edges. The next six scenes are the two passes and the reason they work.

> Caption: Two traversals are enough. Kosaraju needs two passes over the graph; Tarjan needs one. Both are linear in vertices plus edges.

## Scene 4. Kosaraju pass 1: finish every vertex, and record the order

*1:30 – 2:06 · objective: run a depth-first search on the graph and read off the discovery and finish times and the finish order*

**1:30–1:38** — Pass one is an ordinary depth-first search, with one addition: every vertex is given two timestamps. The discovery time, written d, is when the search first arrives; the finish time, written f, is when it leaves for good, after every vertex reachable from it has been dealt with. The search starts at E, then A, then F.

> Caption: Pass one is an ordinary depth-first search of the graph, started at E, then A, then F. Every vertex gets a discovery and a finish time.

**1:38–1:46** — Starting at E, the search first takes the edge to D. D has nothing left to explore, so D finishes at 3, and the search returns to E. From E it takes the skip edge to F, then G, then H, then I, and each of those finishes in turn as the recursion unwinds. E itself finishes at 12. Then a fresh search starts at A, goes to B, to C, and back, and A finishes last, at 18.

> Caption: From E the search goes to D, which finishes at 3; then E walks to F, G, H, I and finishes at 12. A finishes last, at 18.

**1:46–1:54** — Now the one addition that matters. As each vertex finishes, push it on a stack. Reading the stack from the bottom, the order is D, I, H, G, F, E, C, B, A. That is exactly the order in which the vertices finished, which is also the order of the finish times.

> Caption: Push each vertex on a stack as it finishes. The stack reads D I H G F E C B A: the order the search finished, bottom to top.

**1:54–2:06** — Pass one has not found a single component. It has produced one list, and that is all. The next scene states the property of the list that makes it worth producing, and pass two consumes it from the top down.

> Caption: Pass one proves nothing on its own. It produces one list, and the second pass consumes that list from the top down.

## Scene 5. The lemma that makes the order useful

*2:06 – 2:38 · objective: state and use the fact that the vertex with the largest finish time lies in a source component, and that finishing order respects the condensation*

**2:06–2:14** — Here is the lemma. Take the vertex with the largest finish time. It lies in a source component, meaning a component with no edge entering it from any other component. In this graph that vertex is A, and the component is A B C, which is indeed the source.

> Caption: The vertex with the largest finish time, here A, lies in a source component: one with no edge coming into it from another component.

**2:14–2:22** — The reason is a comparison between two components. Suppose there is an edge from component X into component Y. Then the last vertex of X to finish finishes after the last vertex of Y does. Whichever of the two components the search enters first, the other one is fully dealt with before the first one can finish.

> Caption: The reason: if component X has an edge into component Y, the last vertex of X finishes after the last vertex of Y.

**2:22–2:30** — So if you contract each component to one vertex and order the components by their largest finish time, decreasing, you get a topological order of that contracted graph. Edges always run from a component that finishes later to one that finishes earlier.

> Caption: So ordering the components by their largest finish time gives a topological order of the condensation, largest first.

**2:30–2:38** — That is the whole value of pass one. The list it produces is the condensation, in topological order, written out in vertices rather than in components. Pass two only has to cut the list into the pieces that belong together.

> Caption: That is why the list from pass one is worth keeping: it is the condensation in topological order, written in vertices.

Exam-trap caption mode adds: *A graph with a cycle has no topological order of its vertices. The order above is a topological order of the components, which always exists because the condensation is always acyclic.*

## Scene 6. Kosaraju pass 2: the transpose, in that order

*2:38 – 3:12 · objective: run the second depth-first search on the reversed graph in decreasing finish order, and read each tree as one component*

**2:38–2:46** — Pass two does two things. It reverses every edge, producing the transpose, and it runs the same depth-first search on that reversed graph, taking the starting vertices in decreasing finish order, that is, from the top of the stack.

> Caption: Pass two reverses every edge, and runs the same search on the reversed graph, taking the vertices in decreasing finish order.

**2:46–2:54** — The first tree is rooted at A. In the reversed graph, the edge that used to run from C to D now runs from D to C, so from inside A B C there is no way out. The tree reaches A, B and C and stops. That is the first component.

> Caption: The first tree is rooted at A and reaches only A B C. In the reversed graph, nothing outside that component leads back in.

**2:54–3:02** — The next vertex in the order that has not been visited is E, and its tree is D and E. Then F, whose tree is F and G. Then H, whose tree is H and I. Four trees, and the four trees are the four components.

> Caption: The next unvisited vertex in the order is E, then F, then H. Four trees, four components: A B C, D E, F G, H I.

**3:02–3:12** — That is the algorithm. Two depth-first searches, each linear in vertices plus edges, and the trees of the second search are exactly the components. The page checks the partition against the slow definition on every directed graph with up to four vertices, and on sixteen hundred random graphs with five to eight.

> Caption: Two passes, each linear. Every tree of the second pass is one component, and every component is exactly one tree.

## Scene 7. Why the transpose, and why that order

*3:12 – 3:40 · objective: see on a two-vertex counterexample what goes wrong with the original graph or with the ascending order, and why the first tree cannot escape its component*

**3:12–3:20** — Both details are load-bearing, and the smallest counterexample is two vertices with a single edge from A to B. On the original graph, pass two starts at A, walks the edge, and reports one component A B. The truth is two components. The edge runs one way, and the search cannot tell the difference.

> Caption: Both details are load-bearing. Run pass two on the original graph and the answer is wrong on a graph with two vertices and one edge.

Exam-trap caption mode adds: *Reversing the edges is not a detail of implementation. On the original graph the second search follows edges forward, which merges a component with anything downstream of it.*

**3:20–3:28** — The order is load-bearing too. On the transpose, taking the vertices in ascending finish order means starting at B, whose reversed edge leads to A, so one tree covers both vertices again. The order has to be decreasing, which is the top of the stack.

> Caption: Take the vertices in ascending finish order instead and the same two vertices break it again: B first, then A, and one tree covers both.

**3:28–3:36** — With both details right, the argument closes. Suppose the first tree left its component through some edge of the transpose. Reversing that edge gives an edge of the original graph that enters the component from outside. But the component of the largest finish time is a source, so no such edge exists. The tree is trapped inside the component, and the component is exactly what it reaches.

> Caption: With both details right, the first tree cannot escape: an edge leaving the tree in the transpose would be an edge entering the component in the original.

**3:36–3:40** — So the recipe is four steps: search the graph and stack each vertex as it finishes; reverse every edge; search the reversed graph, taking vertices from the top of the stack; and read each tree as one component.

> Caption: So the recipe is: search, stack on finish, transpose, search again in stack order, and each tree is a component.

## Scene 8. The condensation: contract every component

*3:40 – 4:12 · objective: contract the four components to four vertices, check the result is acyclic, and read the condensation as the graph that survives*

**3:40–3:48** — Now contract. Replace each component by a single vertex. Nine vertices become four, and the thirteen edges collapse into four distinct ones: the first component to the second, the second to the third, the third to the fourth, and the second to the fourth directly, through the skip edge.

> Caption: Contract each component to a single vertex. Nine vertices become four, and thirteen edges become four distinct ones.

**3:48–3:56** — The contracted graph never has a cycle, and the reason is short. A cycle among contracted vertices would mean each of those components reaches the next and the last reaches the first, so all of them are mutually reachable. But then they were never separate components. So the contraction is always acyclic.

> Caption: The result has no cycle, always. If it had one, those components would all be mutually reachable and would have been one component.

**3:56–4:04** — So the condensation is the graph that survives the analysis. It is acyclic, so it has a topological order, and here that order is the first component, the second, the third, the fourth. It is also where the words source and sink belong: one source here, one sink, and no isolated component.

> Caption: The condensation is the graph that survives: it is a DAG, it has a topological order, and it is where source and sink questions live.

**4:04–4:12** — Two counts are worth knowing and both are read off the condensation. The number of components is its number of vertices, and the number of distinct edges between components is its number of edges. On this graph those are four and four.

> Caption: Two counts worth knowing: the number of components, and the number of distinct edges between them. Both are read off the condensation.

## Scene 9. Tarjan: one pass, and a number per vertex

*4:12 – 4:42 · objective: compute the low-link value, see low equal the discovery index exactly at a component root, and pop a component when they meet*

**4:12–4:20** — Tarjan finds the same partition in a single pass. Each vertex gets the discovery index it already had, and one more number called the low-link value: the smallest discovery index reachable from that vertex by following tree edges and at most one edge back into the current search.

> Caption: Tarjan finds the same partition in one pass, by giving each vertex a second number: the low-link value.

**4:20–4:28** — On the drawn graph, with indices numbered from zero in the order A, B, C, D, E, F, G, H, I, the low-link values are zero for A, B and C; three for D and E; five for F and G; seven for H and I. Inside a component the values agree, and across components they strictly increase.

> Caption: On the drawn graph the values come out 0 0 0 for the first component, 3 3, 5 5, 7 7. Equal within a component, larger across components.

**4:28–4:36** — The rule is one line. When a vertex finishes and finds that its low-link value equals its own discovery index, everything on the stack above it, itself included, is one component, and it is popped off. The vertices above it are exactly the ones that could climb back to it.

> Caption: When a vertex finds low equal to its own index, everything on the stack above it is one component, and it is popped.

**4:36–4:42** — So Tarjan needs one pass and no transpose, and returns the same partition. The page checks that agreement on every directed graph with two, three and four vertices, and on sixteen hundred random graphs with five to eight, with the slow definition as the referee.

> Caption: One pass instead of two, no transpose, same answer. The two algorithms agree on every graph this page can enumerate.

## Scene 10. How many edges make it strongly connected

*4:42 – 5:12 · objective: state the Eswaran-Tarjan count max(sources, sinks) + isolated on the condensation, and refute the shortcut that drops the isolated term*

**4:42–4:50** — A standard question asks how many edges must be added so that the whole graph becomes strongly connected. Here the answer is one: an edge from the sink component back to the source component. Every vertex can then reach the source, and the source reaches everything.

> Caption: A standard question: how many edges must be added to make the whole graph strongly connected? Add one here, from the sink back to the source.

**4:50–4:58** — The rule is read off the condensation. Count the sources, meaning components with no edge coming in; count the sinks, meaning components with no edge going out; and count the isolated components, which have neither. The number of edges to add is the larger of the source count and the sink count, plus the number of isolated components.

> Caption: On the condensation: count the sources, the sinks, and the isolated components. The answer is the larger of the first two, plus the isolated count.

**4:58–5:06** — The term that gets dropped is the isolated one, and dropping it gives a wrong answer. Take one edge from A to B and a third vertex C with no edges. There is one source, one sink and one isolated component, so the count is two. The shortcut that takes only the larger of source and sink says one, and one edge cannot give C both an incoming and an outgoing edge.

> Caption: Dropping the isolated term is wrong: one edge A to B plus an isolated C needs two edges, not the one the shortcut gives.

Exam-trap caption mode adds: *A single vertex with no edges is already strongly connected, so the answer there is zero. That is why the formula carries the condition that the condensation has more than one component.*

**5:06–5:12** — Two boundaries close the rule. If the condensation has a single component, the graph is already strongly connected and the answer is zero. If the condensation is two isolated components, the answer is two, one edge each way, which is what the formula gives because the isolated term counts both.

> Caption: Two boundaries: a one-component graph needs nothing, and a condensation with two isolated components needs two edges.

## Scene 11. A previous-year item, recomputed

*5:12 – 5:40 · objective: answer the 2014 Set 1 question from the definition rather than from memory, and state the five-step procedure*

**5:12–5:20** — GATE CSE 2014, Set 1 asks which of four graphs built from a directed graph G has the same strongly connected components. The four are the complement, the transpose, the graph of paths of length at most two, and the graph with the isolated vertices deleted.

> Caption: GATE CSE 2014, Set 1: which of four derived graphs has the same strongly connected components as G?

**5:20–5:28** — The answer is the transpose. Reversing every edge reverses every path, so the statement that u reaches v becomes the statement that v reaches u. Mutual reachability is therefore unchanged for every pair, so every component is unchanged. The page checks it on all four thousand and ninety-six directed graphs with four vertices.

> Caption: The transpose. Reversing every edge reverses every path, so u reaches v becomes v reaches u, and mutual reachability is untouched.

**5:28–5:34** — One honest note. On every graph the page searched, the graph of paths of length at most two also preserved the components, and a two-step induction says why: any path can be cut into steps of length one or two. So that option is arguably correct as well. The paper keys the transpose, and the transpose is the answer to give, with the reason above.

> Caption: The page reports honestly that the length-two option also preserved the components in its search, so the item is best read as asking for the definitional answer.

**5:34–5:40** — Five steps answer the questions in this topic. Define the components as the classes of mutual reachability. Find them by the two passes or by Tarjan. Contract to the condensation. Check it is acyclic. Then answer whichever the question asks: the count, the topological order, or the number of edges to add.

> Caption: Five steps: define mutual reachability, contract, read the condensation, then answer the count, the order, or the augmentation.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
