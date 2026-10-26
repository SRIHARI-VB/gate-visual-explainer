# Graphs: Matching and Colouring — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/matching-and-colouring/index.html`
- Total duration: 5:30 (330 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two questions on one graph

*0:00 – 0:30 · objective: See that a matching chooses edges while a colouring partitions vertices, that both are about avoiding a shared endpoint, and that neither is a property of the drawing.*

**0:00–0:07** — Two questions on one graph. A matching picks edges that share no endpoint. A colouring splits the vertices into groups with no edge inside a group.

> Caption: Two questions, one graph. A matching picks edges that share no endpoint. A colouring splits the vertices into groups with no edge inside a group.

**0:07–0:15** — Here the three thick edges are a matching of size three. No two of them meet, so no vertex is used twice.

> Caption: Here the three thick edges are a matching of size 3. No two of them meet, so no vertex is used twice.

**0:15–0:23** — On the same graph, three colours suffice. Each colour class is an independent set, and every edge crosses between two classes.

> Caption: On the same graph, three colours suffice: each colour class is an independent set, and every edge crosses between two classes.

Exam-trap caption mode adds: *The two questions are duals of a kind: a matching is a set of edges that behave like a colour class, and a colour class is a set of vertices that behave like the endpoints of a matching edge.*

**0:23–0:30** — Both numbers are computed from the vertex set and the edge set. Move the vertices and nothing changes. The picture is not the object.

> Caption: Both numbers are computed from the vertex set and the edge set. Move the vertices and nothing changes; the picture is not the object.

## Scene 2. What a matching is, and is not

*0:30 – 1:00 · objective: Separate a matching from a maximal matching from a maximum matching, define saturated and perfect, and see a maximal matching that is not maximum.*

**0:30–0:37** — A matching is a set of edges with no shared endpoint. A vertex is saturated if an edge of the matching touches it, and free otherwise.

> Caption: A matching M is a set of edges with no shared endpoint. A vertex is saturated by M if an edge of M touches it, and free otherwise.

**0:37–0:45** — Maximal means no further edge can be added. Maximum means no matching on this graph is larger. The first is about this set, the second about the whole graph.

> Caption: Maximal means no further edge can be added. Maximum means no matching on this graph is larger. The first is about this set, the second about the whole graph.

Exam-trap caption mode adds: *Maximal and maximum are different words with different definitions. A maximal matching can be strictly smaller than a maximum matching, so "cannot be extended" never proves "is largest".*

**0:45–0:52** — The two thick edges are maximal, because every other edge touches a saturated vertex. Yet three edges fit, so they are not maximum.

> Caption: The two thick edges are maximal: every other edge touches a saturated vertex. Yet three edges fit, so they are not maximum.

**0:52–1:00** — A perfect matching saturates every vertex, so it exists only when the vertex count is even. The size of a largest matching is written nu of G.

> Caption: A perfect matching saturates every vertex, so it exists only when the vertex count is even. Maximum matching size is written with the Greek letter nu.

Exam-trap caption mode adds: *A perfect matching is a maximum matching of a special size, not a different kind of object. Every perfect matching is maximum; a maximum matching is perfect only when it saturates everything.*

## Scene 3. The augmenting path

*1:00 – 1:30 · objective: Trace an alternating path between two free vertices, flip its edges, and see why Berge’s theorem makes "no augmenting path" the exact test for maximum.*

**1:00–1:07** — An alternating path starts at a free vertex, alternates between edges not in the matching and edges in it, and ends at a free vertex.

> Caption: An alternating path starts at a free vertex, alternates between edges not in the matching and edges in it, and ends at a free vertex.

**1:07–1:15** — Such a path is called augmenting. Swap every edge on it: drop the matching edges, take the others. The matching grows by exactly one.

> Caption: Such a path is called augmenting. Swap every edge on it: drop the matching edges, take the others. The matching grows by exactly one.

**1:15–1:22** — Berge theorem: a matching is maximum exactly when no augmenting path exists. So the test for maximum is a search, not a comparison.

> Caption: Berge's theorem: a matching is maximum exactly when no augmenting path exists. So the test for maximum is a search, not a comparison.

Exam-trap caption mode adds: *Berge gives a test for maximum, not a formula for the size. To find the size you still have to search, and each successful search raises the size by one.*

**1:22–1:30** — Repeating the search gives an algorithm. Start with any matching and augment until no path is left. Each round adds one edge.

> Caption: Repeating the search gives an algorithm: start with any matching, augment until no path is left. Each round adds one edge, so it stops after at most n/2 rounds.

## Scene 4. Hall's condition

*1:30 – 2:00 · objective: State Hall’s condition over every subset of one side, find the violating subset in a graph that fails, and see why the condition is sufficient as well as necessary.*

**1:30–1:37** — Take a bipartite graph with a left side and a right side. Write N of S for the set of neighbours of a subset S of the left side.

> Caption: Take a bipartite graph with the left side L and the right side R. Write N(S) for the set of neighbours of a subset S of L.

**1:37–1:45** — Here three left vertices share only two neighbours. A matching cannot saturate all three, because each of them needs a different partner.

> Caption: Here three left vertices share only two neighbours. A matching cannot saturate all three, because each of them needs a different partner.

Exam-trap caption mode adds: *The failure is local. You do not have to examine the whole graph, only to find one subset whose neighbourhood is too small.*

**1:45–1:52** — Hall condition: for every subset S of the left side, the size of N of S is at least the size of S. Hall theorem: that condition is also sufficient.

> Caption: Hall's condition: for every subset S of L, the size of N(S) is at least the size of S. Hall's theorem: that condition is also sufficient.

**1:52–2:00** — Add one edge and the smallest short subset disappears. Now every subset has enough neighbours, and a matching saturating the left side exists.

> Caption: Add one edge and the smallest short subset disappears. Now every subset has enough neighbours, and a matching saturating L exists.

Exam-trap caption mode adds: *Checking only the whole of L is the commonest error. A graph can have at least as many right vertices as left vertices overall and still fail Hall on a small subset.*

## Scene 5. Konig's theorem and the cover

*2:00 – 2:30 · objective: Define a vertex cover, watch the maximum matching and the minimum cover meet in a bipartite graph, and see equality fail on a triangle.*

**2:00–2:07** — A vertex cover is a set of vertices touching every edge. Here four vertices cover all the edges of this bipartite graph.

> Caption: A vertex cover is a set of vertices touching every edge. Here four vertices cover all the edges of this bipartite graph.

**2:07–2:15** — A matching and a cover never share more than one vertex per matching edge, so the matching is never larger than the cover.

> Caption: A matching and a cover never share more than one vertex per matching edge, so the matching is never larger than the cover.

**2:15–2:22** — Konig theorem: in a bipartite graph the two numbers are equal. The largest matching and the smallest cover have the same size.

> Caption: Konig's theorem: in a bipartite graph the two numbers are equal. The largest matching and the smallest cover have the same size.

Exam-trap caption mode adds: *Equality is a theorem about bipartite graphs. It is not a definition, and it is not true in general.*

**2:22–2:30** — On a triangle the equality fails. The largest matching has one edge and the smallest cover needs two vertices. The odd cycle is what breaks it.

> Caption: On a triangle the equality fails: the largest matching has one edge and the smallest cover needs two vertices. The odd cycle is what breaks it.

Exam-trap caption mode adds: *Quoting Konig on a graph that is not bipartite is a wrong answer, not a rounding error. Check bipartiteness first, by the two-colouring test.*

## Scene 6. Chromatic number of the standard families

*2:30 – 3:00 · objective: Read the chromatic number of complete graphs, cycles, trees and bipartite graphs from their structure, and use the clique number as a lower bound without treating it as equal.*

**2:30–2:37** — The chromatic number, written chi, is the fewest colours in a proper colouring. A complete graph on n vertices needs n colours, because every pair is joined.

> Caption: The chromatic number, written chi, is the fewest colours in a proper colouring. A complete graph on n vertices needs n colours: every pair is joined.

**2:37–2:45** — A cycle needs two colours when its length is even and three when it is odd. An odd number of steps returns you to the start with the wrong colour.

> Caption: A cycle needs two colours when its length is even and three when it is odd. Walk the colours round: an odd number of steps returns you to the start with the wrong colour.

**2:45–2:52** — A tree needs two colours, and so does every bipartite graph, because bipartite is exactly the same as two-colourable. Petersen needs three.

> Caption: A tree needs two, and so does every bipartite graph, because bipartite is exactly the same as two-colourable. Petersen needs three.

**2:52–3:00** — The clique number is a lower bound on chi, never an equality. The Mycielskian of a five-cycle has no triangle at all and still needs four colours.

> Caption: The clique number is a lower bound on chi, never an equality. The Mycielskian of a five-cycle has no triangle at all and still needs four colours.

Exam-trap caption mode adds: *Chi equals omega on every perfect graph, which includes bipartite graphs, and that is why the two are so often confused. They are equal there, not in general.*

## Scene 7. Greedy colouring and maximum degree plus one

*3:00 – 3:30 · objective: Run first-fit greedy, prove the bound at most maximum degree plus one, and see the same graph need three colours in one order and two in another.*

**3:00–3:07** — First-fit greedy takes the vertices in some order and gives each the smallest colour no neighbour already has.

> Caption: First-fit greedy takes the vertices in some order and gives each the smallest colour no neighbour already has.

**3:07–3:15** — At most delta plus one colours. When a vertex is coloured, at most delta neighbours are already coloured, so one colour is always free.

> Caption: At most delta plus one colours: when a vertex is coloured, at most delta neighbours are already coloured, so among delta plus one colours one is always free.

Exam-trap caption mode adds: *This bound is on the algorithm, not on the graph. It says greedy never needs more than delta plus one, not that the graph needs that many.*

**3:15–3:22** — The order matters. This bipartite graph is two-colourable, yet one order makes greedy use three colours.

> Caption: The order matters. This bipartite graph is two-colourable, yet one order makes greedy use three colours.

Exam-trap caption mode adds: *Greedy returning k colours proves only that k colours suffice. It never proves that fewer are impossible, so a greedy count is an upper bound and nothing more.*

**3:22–3:30** — So greedy gives an upper bound and the clique gives a lower bound. When the two meet, the chromatic number is settled without any search.

> Caption: So greedy gives an upper bound and the clique gives a lower bound. When the two meet, the chromatic number is settled without any search.

## Scene 8. Brooks' theorem and the gap to delta

*3:30 – 4:00 · objective: State Brooks’ theorem with both of its exceptions, and see how far the chromatic number can sit below the maximum degree.*

**3:30–3:37** — Brooks theorem: a connected graph needs at most delta colours, unless it is complete or an odd cycle.

> Caption: Brooks' theorem: a connected graph needs at most delta colours, unless it is complete or an odd cycle.

**3:37–3:45** — The exceptions are real. A complete graph needs delta plus one, and an odd cycle needs three against a delta of two.

> Caption: The exceptions are real: a complete graph needs delta plus one, and an odd cycle needs three against a delta of two.

Exam-trap caption mode adds: *Brooks is an if-and-only-if in practice: drop the exceptions and the bound can fail. State the exceptions whenever you use it.*

**3:45–3:52** — The gap can be large. A star has maximum degree n minus one and needs only two colours, so chi sits far below delta.

> Caption: The gap can be large. A star has maximum degree n minus one and needs only two colours, so chi sits far below delta.

**3:52–4:00** — Useful bounds together: the clique number is at most chi, which is at most delta plus one, and at most delta once Brooks applies.

> Caption: Useful bounds together: the clique number is at most chi, which is at most delta plus one, and at most delta once Brooks applies.

## Scene 9. Edge colouring

*4:00 – 4:30 · objective: Define the chromatic index, see that it equals the maximum degree on every bipartite graph, and place every graph within Vizing’s one-colour window.*

**4:00–4:07** — Edge colouring colours the edges so that edges meeting at a vertex get different colours. The fewest colours is the chromatic index, chi prime.

> Caption: Edge colouring colours the edges so that edges meeting at a vertex get different colours. The fewest colours is the chromatic index, chi prime.

**4:07–4:15** — Every colour class is a matching, so the index is at least delta. On a bipartite graph it is exactly delta.

> Caption: Every colour class is a matching, so the edges at one vertex need distinct colours: the index is at least delta. On a bipartite graph it is exactly delta.

Exam-trap caption mode adds: *Chi prime at least delta holds always. Chi prime equal to delta holds for bipartite graphs, and fails elsewhere, so the equality needs the bipartite hypothesis.*

**4:15–4:22** — Vizing theorem: for every simple graph the index is delta or delta plus one. So an edge-colouring question has only two candidate answers.

> Caption: Vizing's theorem: for every simple graph the index is delta or delta plus one. So an edge-colouring question has only two candidate answers.

**4:22–4:30** — A triangle has delta two and index three, so it is class two. The cube is bipartite with delta three, so its index is three while its chromatic number is two.

> Caption: A triangle has delta two and index three, so it is class two. The cube graph is bipartite with delta three, so its index is three while its chromatic number is two.

Exam-trap caption mode adds: *Chi and chi prime are different questions with different answers. The cube graph answers 2 and 3 to them, so neither number predicts the other.*

## Scene 10. Planarity: what cannot be drawn flat

*4:30 – 5:00 · objective: Use Euler’s formula to get the edge bounds, see K5 and K3,3 break them, and know why every planar graph is 4-colourable but not necessarily 3-colourable.*

**4:30–4:37** — A graph is planar if it can be drawn in the plane with no two edges crossing. For a connected planar drawing, n minus m plus f equals two.

> Caption: A graph is planar if it can be drawn in the plane with no two edges crossing. For a connected planar drawing, n minus m plus f equals two.

**4:37–4:45** — Every face has at least three edges, and every edge borders two faces, so m is at most 3n minus 6. In a bipartite planar graph the bound is 2n minus 4.

> Caption: Every face has at least three edges, and every edge borders two faces, so m is at most 3n minus 6. In a bipartite planar graph the bound tightens to 2n minus 4.

Exam-trap caption mode adds: *The bound is necessary, not sufficient. A graph can satisfy it and still be non-planar, so it rules graphs out and never rules them in.*

**4:45–4:52** — K5 has ten edges where nine is the limit, and K3,3 has nine where eight is the limit. Both are non-planar.

> Caption: K5 has ten edges where nine is the limit, and K3,3 has nine where eight is the limit. Both are non-planar, and Kuratowski says every non-planar graph contains one of them.

**4:52–5:00** — Every planar graph is four-colourable, and three colours do not always suffice. An odd cycle drawn flat already needs three.

> Caption: Every planar graph is four-colourable, and three colours do not always suffice: an odd cycle drawn flat already needs three, and there are planar graphs needing four.

Exam-trap caption mode adds: *Planar gives at most four, not at most three. GATE has asked for the number of colours sufficient for every planar graph, and the answer is four.*

## Scene 11. The procedure and three traps

*5:00 – 5:30 · objective: Run a fixed five-question procedure on an unfamiliar matching or colouring question, and recognise the three traps that cost marks.*

**5:00–5:07** — A fixed procedure. Name the object, check bipartiteness, find a bound from each side, then look for a certificate.

> Caption: A fixed procedure: name the object, check bipartiteness, find a bound from each side, then look for a certificate.

**5:07–5:15** — Trap one: answering maximal when the question said maximum, or quoting Konig on a graph that is not bipartite.

> Caption: Trap one: answering maximal when the question said maximum, or quoting Konig on a graph that is not bipartite.

Exam-trap caption mode adds: *Read the adjective, then check the hypothesis. Two seconds here saves the mark.*

**5:15–5:23** — Trap two: treating the clique number as the chromatic number, or greedy as exact. One is a bound below, the other a bound above.

> Caption: Trap two: treating the clique number as the chromatic number, or greedy as exact. One is a bound below, the other a bound above.

Exam-trap caption mode adds: *A bound is not a value. Say which bound you are using and whether it is tight here.*

**5:23–5:30** — Trap three: confusing vertex colours with edge colours, and forgetting that Vizing allows two answers. Delta or delta plus one, decided by a construction.

> Caption: Trap three: confusing vertex colours with edge colours, and forgetting that Vizing allows two answers. Delta or delta plus one, decided by a construction.

Exam-trap caption mode adds: *For edge colouring, delta is a lower bound always and the answer on bipartite graphs; delta plus one is the ceiling. Anything else is wrong.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
