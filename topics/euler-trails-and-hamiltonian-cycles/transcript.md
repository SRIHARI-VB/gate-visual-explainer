# Euler Trails and Hamiltonian Cycles: The One-Line Test and the Question That Has None — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/euler-trails-and-hamiltonian-cycles/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two questions that differ by one word

*0:00 – 0:30 · objective: Separate "use every edge once" from "visit every vertex once", and see that neither question implies the other.*

**0:00–0:07** — An Euler circuit uses every edge of the graph exactly once, and comes back to where it started.

> Caption: An Euler circuit uses every edge exactly once and returns to where it started.

Exam-trap caption mode adds: *Reading "Euler" as "visits every vertex". The vertex question is the Hamiltonian one, and it is a different problem.*

**0:07–0:15** — A Hamiltonian cycle visits every vertex exactly once and returns to the start. It uses n edges and ignores the rest.

> Caption: A Hamiltonian cycle visits every vertex exactly once and returns to the start.

Exam-trap caption mode adds: *Assuming a Hamiltonian cycle must use all the edges. It uses exactly as many edges as there are vertices, no more.*

**0:15–0:23** — A walk repeats nothing by rule. A trail repeats no edge, a path repeats no vertex, and a circuit is a closed trail.

> Caption: Trail, path, circuit: a trail repeats no edge, a path repeats no vertex, a circuit is a closed trail.

Exam-trap caption mode adds: *Using "path" and "trail" as synonyms in a solution. A question that says trail is asking about edges, and one that says path is asking about vertices.*

**0:23–0:30** — Neither property implies the other. One graph here has the Euler trail and no Hamiltonian cycle, and another has the Hamiltonian cycle and no Euler trail.

> Caption: The two questions are independent: the page shows a graph with each property and not the other.

Exam-trap caption mode adds: *Answering one question with the other question's criterion. It is the most common wrong answer on this topic.*

## Scene 2. The degree count is forced, not guessed

*0:30 – 1:00 · objective: Derive the parity condition from what a trail does at each vertex, and apply it to the seven bridges.*

**0:30–0:37** — Each time a trail passes through a vertex it uses two edges there, one arriving and one leaving.

> Caption: Every time a trail passes through a vertex it uses two of that vertex's edges: one to arrive, one to leave.

Exam-trap caption mode adds: *Counting visits instead of edges. The argument is about how many edges of the vertex the trail uses, not how many times it arrives.*

**0:37–0:45** — If the tour closes, every vertex uses its edges in pairs, so every degree is even. That is necessary, and it took one sentence.

> Caption: So a closed tour leaves every vertex with an even degree: the parity condition is necessary.

Exam-trap caption mode adds: *Thinking the parity condition needs connectivity. Necessity does not: an even-degree vertex is forced by the tour alone.*

**0:45–0:53** — An open trail leaves one extra edge at its start and arrives one extra at its end, so exactly two vertices are odd, and those two are the ends.

> Caption: An open trail has exactly two exceptions: the vertex it starts at and the vertex it ends at.

Exam-trap caption mode adds: *Trying to start an open trail at an even-degree vertex. The odd vertices are the only legal endpoints, and there are exactly two of them.*

**0:53–1:00** — In Königsberg the four land masses have degrees three, three, three and five. Four odd vertices, and a trail allows two, so no such walk exists.

> Caption: Königsberg: the four land masses have degrees 3, 3, 3 and 5. Four odd vertices, so no trail at all.

Exam-trap caption mode adds: *Remembering "Euler's theorem says odd degree is impossible" instead of the exact count. Two odd vertices are fine: they give a trail that does not close.*

## Scene 3. Even degrees and one component is enough

*1:00 – 1:30 · objective: State the Euler criterion with its connectivity hypothesis, and see the two ways it is misapplied.*

**1:00–1:07** — The converse is also true: if the graph is connected and every degree is even, an Euler circuit exists. Euler stated it, Hierholzer proved it.

> Caption: The converse is a theorem: connected with every degree even is necessary and sufficient.

Exam-trap caption mode adds: *Treating the criterion as one-directional and searching for a tour anyway after the degrees check out. Once the hypothesis holds, the tour is guaranteed.*

**1:07–1:15** — Two separate triangles have all degrees even and still no Euler circuit, because no walk crosses from one to the other.

> Caption: The hypothesis is about the component that holds the edges: two disjoint triangles have all even degrees and no tour.

Exam-trap caption mode adds: *Checking the degrees and forgetting the components. This is the standard trap, and it is the reason the criterion has two clauses.*

**1:15–1:23** — Join the two triangles at a single vertex and a tour exists: it uses the shared vertex twice, once for each triangle.

> Caption: Join the triangles at one vertex and the tour exists: the shared vertex is used twice, once per triangle.

Exam-trap caption mode adds: *Believing a tour may not revisit a vertex. Revisiting vertices is allowed and usually necessary; only edges are rationed.*

**1:23–1:30** — On a directed graph, in-degree must equal out-degree at every vertex, and the edges must sit in one component.

> Caption: Directed version: in-degree equals out-degree everywhere, and the vertices with edges are in one component.

Exam-trap caption mode adds: *Using the undirected degree rule on a directed graph. Two edges into a vertex and two out of it look balanced in total degree and are not balanced in direction.*

## Scene 4. Hierholzer: build the tour instead of guessing

*1:30 – 2:00 · objective: Run Hierholzer's walk-and-splice on one graph and see why the construction is linear in the number of edges.*

**1:30–1:37** — Hierholzer walks from the start until there is no unused edge to take. The walk closes, and may be short.

> Caption: Hierholzer's idea: walk from any vertex until you are stuck, then splice in what is left.

Exam-trap caption mode adds: *Stopping when stuck and calling that the answer. The first walk usually leaves edges behind, and the splice is the algorithm.*

**1:37–1:45** — Starting at vertex zero the walk closes at once: zero, one, two, zero. Half the edges are still unused.

> Caption: From vertex 0 the greedy walk closes immediately: 0, 1, 2, 0. Three of the six edges are used.

Exam-trap caption mode adds: *Reading the closed walk as a proof of failure. A closed walk that misses edges is the first step, not the answer.*

**1:45–1:53** — Vertex one still has unused edges, so its cycle one, three, four, one is spliced in at vertex one. The tour now uses every edge.

> Caption: Vertex 1 still has unused edges, so splice its cycle 1, 3, 4, 1 into the tour at vertex 1.

Exam-trap caption mode adds: *Splicing at the wrong vertex. The cycle must be inserted at a vertex it shares with the tour, or the result is not a walk.*

**1:53–2:00** — Every edge is used once, so the algorithm is linear. Fleury's rule is the same idea, paid for with a bridge test at every step.

> Caption: Every edge is taken once and each splice is a pointer change, so the decision and the tour are linear.

Exam-trap caption mode adds: *Claiming Fleury is linear. It is not: the bridge test at each step is what makes it slower, and GATE questions distinguish the two.*

## Scene 5. How many tours, and the cycles inside

*2:00 – 2:30 · objective: See the cycle decomposition that proves sufficiency, and count the distinct Euler circuits of a small graph exactly.*

**2:00–2:07** — Every Eulerian graph splits into edge-disjoint cycles. Walk until you close a cycle, delete it, and repeat: every degree stays even.

> Caption: An Eulerian graph splits into edge-disjoint cycles, and that splitting is the proof of sufficiency.

Exam-trap caption mode adds: *Confusing edge-disjoint with vertex-disjoint. These cycles share vertices freely, and on K(5) they must.*

**2:07–2:15** — The complete graph on five vertices splits into two five-cycles that share every vertex and no edge.

> Caption: K5 splits into two 5-cycles that share all five vertices and no edge: 0,1,2,3,4,0 and 0,2,4,1,3,0.

Exam-trap caption mode adds: *Assuming a decomposition into cycles must be unique. It is not, and the number of tours is not the number of decompositions.*

**2:15–2:23** — Counting carefully, the complete graph on five vertices has one hundred and thirty-two Euler circuits, where rotating or reversing a circuit does not make a new one.

> Caption: K5 has 132 Euler circuits when a circuit is a cyclic edge sequence, counted once up to rotation and reversal.

Exam-trap caption mode adds: *Counting tours as sequences and forgetting that a cyclic tour has no first edge. Rotation and reversal are the same circuit.*

**2:23–2:30** — The count is a curiosity. The exam asks whether a tour exists, and that question has a one-line test.

> Caption: The count is not what GATE asks for. What it asks is whether a tour exists, and the criterion answers that.

Exam-trap caption mode adds: *Answering a counting question with the existence criterion, or the reverse. They are different questions with different answers.*

## Scene 6. Hamilton has no test, and that is a theorem

*2:30 – 3:00 · objective: Contrast a linear-time decision with an NP-complete one, and count what brute force would have to examine.*

**2:30–2:37** — Deciding whether a Hamiltonian cycle exists is NP-complete. Karp listed it in 1972 among his twenty-one problems.

> Caption: Deciding whether a graph has a Hamiltonian cycle is NP-complete.

Exam-trap caption mode adds: *Assuming that because the definition is short, the test must be short. Euler has a one-line test and Hamilton has none known.*

**2:37–2:45** — Brute force has to look at factorially many cycles: one hundred and eighty-one thousand at ten vertices, and about three times ten to the twenty-three at twenty-five.

> Caption: Brute force on the complete graph would examine (n − 1)! / 2 cycles: 181,440 at n = 10 and about 3.1 × 10^23 at n = 25.

Exam-trap caption mode adds: *Believing a bigger computer fixes it. At a billion checks a second the twenty-five-vertex case still runs for millions of years.*

**2:45–2:53** — A sufficient condition can certify that a cycle exists. It can never certify that none does, because the implication only runs one way.

> Caption: So a sufficient condition is a certificate, never a test: it can say yes, and it can never say no.

Exam-trap caption mode adds: *Concluding "not Hamiltonian" from a failed Dirac check. That reverses an implication, and it is a standard exam trap.*

**2:53–3:00** — One question is decided in linear time and the other has no known polynomial test. That asymmetry is the reason the two are taught together.

> Caption: One question has a linear test, the other has none known. That asymmetry is the point of the pair.

Exam-trap caption mode adds: *Expecting a symmetric treatment. There is no Euler-style parity theorem for Hamiltonian cycles, and none is expected.*

## Scene 7. Sufficient conditions certify; they do not decide

*3:00 – 3:30 · objective: Use Dirac and Ore to certify a cycle, and see on a six-cycle that failing them proves nothing.*

**3:00–3:07** — Dirac in nineteen fifty-two: with n at least three, if every vertex has degree at least half of n, a Hamiltonian cycle exists.

> Caption: Dirac, 1952: with at least three vertices, if every degree is at least n/2 then a Hamiltonian cycle exists.

Exam-trap caption mode adds: *Dropping the n at least 3 condition. With two vertices the hypothesis is vacuous and there is no cycle to speak of.*

**3:07–3:15** — Ore in nineteen sixty: if every two non-adjacent vertices have degrees summing to at least n, a Hamiltonian cycle exists.

> Caption: Ore, 1960: if every pair of non-adjacent vertices has degree sum at least n, a Hamiltonian cycle exists.

Exam-trap caption mode adds: *Applying Ore to adjacent pairs. The hypothesis is only about non-adjacent pairs, and checking adjacent ones changes the test.*

**3:15–3:23** — The six-cycle fails both hypotheses and is Hamiltonian. The conditions are sufficient, and they are not necessary.

> Caption: The six-cycle fails Dirac and fails Ore, and is Hamiltonian: both theorems are sufficient, not necessary.

Exam-trap caption mode adds: *Reading a failed hypothesis as evidence against a cycle. The six-cycle is the counterexample to memorise.*

**3:23–3:30** — Two necessary conditions do work: a bipartite graph needs equal sides, and deleting any set of vertices leaves no more components than its size.

> Caption: Necessary conditions that do work: a bipartite graph needs equal sides, and c(G − S) is at most |S|.

Exam-trap caption mode adds: *Using these as sufficient. The Petersen graph satisfies the component condition and is not Hamiltonian, which the next scene shows.*

## Scene 8. The Petersen graph, checked three ways

*3:30 – 4:00 · objective: Meet the standard non-Hamiltonian graph, verify it exhaustively, and see the line-graph link between the two questions.*

**3:30–3:37** — The Petersen graph has ten vertices, fifteen edges and every degree three. It is the graph that defeats most quick intuitions.

> Caption: The Petersen graph: ten vertices, fifteen edges, every degree three, girth five.

Exam-trap caption mode adds: *Judging it by the drawing. Its usual picture has crossings, and the crossing points are not vertices.*

**3:37–3:45** — It has no Hamiltonian cycle. The page establishes that by exhausting every possible cycle, and there is also a short counting proof.

> Caption: It has no Hamiltonian cycle, and the page proves it by exhausting every cycle, not by inspecting the picture.

Exam-trap caption mode adds: *Concluding non-Hamiltonicity from a degree or connectivity test. The Petersen graph satisfies the component-count condition and still fails.*

**3:45–3:53** — Delete any one vertex and what remains is Hamiltonian. A graph like this is called hypohamiltonian.

> Caption: Delete any single vertex and the rest is Hamiltonian. That property is called hypohamiltonian.

Exam-trap caption mode adds: *Thinking one obstruction vertex must exist. Non-Hamiltonicity can be a global property with no local witness.*

**3:53–4:00** — It also has no Euler trail, because all ten degrees are odd. The two no answers come from different arguments.

> Caption: It also has no Euler trail: all ten degrees are odd, so the two questions both answer no, for different reasons.

Exam-trap caption mode adds: *Treating the two refusals as one fact. A graph can be Eulerian and not Hamiltonian, Hamiltonian and not Eulerian, both, or neither.*

## Scene 9. GATE CSE 2007, Question 23, recomputed

*4:00 – 4:30 · objective: Decide each of the four options from the criterion, with every degree computed on the page.*

**4:00–4:07** — A previous-year question: which of these graphs has an Eulerian circuit? A k-regular graph with even k, a complete graph on ninety vertices, or the complement of a cycle on twenty-five vertices.

> Caption: GATE CSE 2007, Question 23: which of these graphs has an Eulerian circuit?

Exam-trap caption mode adds: *Answering from a remembered key without checking the connectivity clause, which is what separates two of the options.*

**4:07–4:15** — Option A fails, because a two-regular graph can be two separate triangles: all degrees even, and no tour.

> Caption: Option A fails: a 2-regular graph can be two disjoint triangles, all even and not Eulerian.

Exam-trap caption mode adds: *Accepting a statement about "any" graph from one example. One counterexample refutes a universal claim.*

**4:15–4:23** — Option B fails because ninety vertices give every vertex degree eighty-nine, which is odd. Option C gives degree twenty-two everywhere.

> Caption: Option B fails: every vertex of K(90) has degree 89, which is odd. Option C: the complement has degree 22 everywhere.

Exam-trap caption mode adds: *Forgetting to subtract the two cycle edges when computing the complement's degree. It is n minus one minus two, not n minus one.*

**4:23–4:30** — The answer is C: every degree is twenty-two and the graph is connected, so an Euler circuit exists.

> Caption: Option C is the answer: every degree 22, one component, so an Euler circuit exists.

Exam-trap caption mode adds: *Stopping at the parity check. Without the connectivity argument, option C is not yet established, and that is the mark the question is testing.*

## Scene 10. One procedure and five traps

*4:30 – 5:00 · objective: Leave with a fixed order of questions to ask, and the five mistakes that produce an option-list answer.*

**4:30–4:37** — Ask first whether the problem rations edges or vertices. That single reading decides which criterion you are allowed to use.

> Caption: First question: does the problem ration edges or vertices? That decides which criterion applies.

Exam-trap caption mode adds: *Choosing the criterion you remember better. The question's wording fixes the criterion, not your preference.*

**4:37–4:44** — For an edge question: count the odd degrees, then check the edges are in one component. Zero odd gives a circuit and two give a trail.

> Caption: Edge question: count degrees, count odd vertices, then check that the edges sit in one component.

Exam-trap caption mode adds: *Skipping the component check because the degrees looked right. That is exactly the option A trap of the previous-year question.*

**4:44–4:52** — For a vertex question, use Dirac or Ore to certify a cycle, and look for a structural obstruction before concluding that none exists.

> Caption: Vertex question: try Dirac and Ore to certify a cycle, and look for a reason it cannot exist.

Exam-trap caption mode adds: *Reporting a no from a failed sufficient condition. The Petersen graph shows how far that can be from the truth.*

**4:52–5:00** — Five traps and one defence: name the object the question rations, name the hypothesis of the theorem you use, and keep the two questions apart.

> Caption: Five traps, one defence: name the object, name the hypothesis, and never let one answer the other question.

Exam-trap caption mode adds: *Checking the arithmetic twice and the hypothesis never. Every trap here produces a number that is on the option list.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
