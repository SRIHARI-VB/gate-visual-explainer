# Eccentricity, Radius, Diameter and Centre: One Distance Table, Two Theorems About Trees — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/graph-eccentricity-radius-diameter-centre/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Distance is a count of edges

*0:00 – 0:30 · objective: Read a distance as the fewest edges on a path, and see why breadth-first search is what computes it.*

**0:00–0:08** — Distance between two vertices is the fewest edges on any path between them. It is a count, and it is a minimum over all the paths.

> Caption: Distance is the fewest edges on a path between two vertices, not the shortest straight line.

Exam-trap caption mode adds: *Measuring distance along the drawn line instead of along the edges. A long edge is one step; two short edges are two steps.*

**0:08–0:16** — Breadth-first search from vertex zero labels each vertex with its distance. It expands in layers, so the layer is the distance.

> Caption: Breadth-first search from vertex 0 labels every vertex with that count: 0, then 1, then 2, then 3, then 4.

Exam-trap caption mode adds: *Reading distances off a depth-first search. A DFS tree is deeper than necessary, so its depths are not distances.*

**0:16–0:23** — The picture misleads. Vertex six looks close to vertex zero and is four edges away, because the route goes back through the middle.

> Caption: The drawing misleads: vertex 6 looks close to vertex 0 and is four edges away.

Exam-trap caption mode adds: *Trusting the drawing. Every figure in this lesson is computed from the edge list, and the drawing only shows that list.*

**0:23–0:30** — Everything in this lesson is read from one table of these counts. Seven vertices, seven rows, and the diagonal is zero.

> Caption: Everything in this lesson is read from one table of these counts.

Exam-trap caption mode adds: *Forgetting the diagonal. Distance from a vertex to itself is zero, and that zero is an entry when a row maximum is taken.*

## Scene 2. Eccentricity: the worst case from one vertex

*0:30 – 1:00 · objective: Read eccentricity off one row of the distance table: it is that row's largest entry.*

**0:30–0:38** — The eccentricity of a vertex is the largest number in its own row. It is the distance to the farthest vertex.

> Caption: The eccentricity of a vertex is the largest entry in its own row: its distance to the farthest vertex.

Exam-trap caption mode adds: *Taking the average of a row. Eccentricity is a maximum; the average is a different quantity and answers no exam question here.*

**0:38–0:46** — Row zero reads nought, one, two, three, four, three, four. Its largest entry is four, so the eccentricity of vertex zero is four.

> Caption: Row 0 reads 0 1 2 3 4 3 4, so the eccentricity of vertex 0 is 4.

Exam-trap caption mode adds: *Counting the vertex itself as one step. The diagonal zero is not a step, and the count starts at zero.*

**0:46–0:54** — Row two reads two, one, nought, one, two, one, two. Its largest entry is two. Vertex two is never more than two edges from anything.

> Caption: Row 2 reads 2 1 0 1 2 1 2, so the eccentricity of vertex 2 is 2 — it is never more than two edges from anything.

Exam-trap caption mode adds: *Assuming the middle of the drawing has the smallest eccentricity. Here it does, but the drawing is not the argument.*

**0:54–1:00** — Eccentricity is a worst case taken from one vertex, and every vertex of a connected graph has one.

> Caption: Eccentricity is a worst case taken from one vertex. Every vertex has one.

Exam-trap caption mode adds: *Believing leaves are always the farthest-apart pair. In a star the two leaves are two apart while the hub is one from everything.*

## Scene 3. Four numbers, one list

*1:00 – 1:30 · objective: Define diameter, radius, centre and periphery as the maximum, the minimum and the two arg-sets of one list of eccentricities.*

**1:00–1:08** — Read the seven eccentricities as one list: four, three, two, three, four, three, four.

> Caption: Read the seven eccentricities as one list: 4, 3, 2, 3, 4, 3, 4.

Exam-trap caption mode adds: *Treating the list as a multiset to be summarised by its mean. The mean of these seven numbers is not a graph quantity.*

**1:08–1:16** — The largest is the diameter, four. The smallest is the radius, two.

> Caption: The largest is the diameter, 4. The smallest is the radius, 2.

Exam-trap caption mode adds: *Swapping them. Diameter is the maximum and radius the minimum, and a radius larger than the diameter is impossible.*

**1:16–1:24** — The vertices that attain the radius form the centre, which here is only vertex two. Those that attain the diameter form the periphery: zero, four and six.

> Caption: The vertices attaining the radius form the centre — here only vertex 2. Those attaining the diameter form the periphery: 0, 4 and 6.

Exam-trap caption mode adds: *Answering with one vertex when the centre has two. A tree with an odd diameter always has two.*

**1:24–1:30** — Four numbers from one list. Radius is a minimum, diameter a maximum, and neither of them is an average.

> Caption: Four numbers from one list. Radius is a minimum, diameter a maximum, and neither is an average.

Exam-trap caption mode adds: *Reporting the mean eccentricity. It is a legitimate quantity, but it is not the radius and no GATE question asks for it.*

## Scene 4. Half the diameter is a floor, the diameter is a ceiling

*1:30 – 2:00 · objective: Prove and use the two bounds, and see that the upper one is attained by self-centred graphs.*

**1:30–1:38** — For any connected graph the radius is at least half the diameter, rounded up, and at most the diameter itself.

> Caption: For any connected graph, the radius is at least half the diameter and at most the diameter.

Exam-trap caption mode adds: *Dropping the ceiling. With diameter 5 the floor of half is 2, and a radius of 2 is impossible.*

**1:38–1:46** — Take a centre vertex and a pair at the diameter apart. Each is within the radius of the centre, so by the triangle inequality the diameter is at most twice the radius.

> Caption: The lower bound: two vertices at distance d are each within r of a centre vertex, so d is at most 2r.

Exam-trap caption mode adds: *Using a vertex that is not a centre. The bound uses the minimum eccentricity, so a peripheral vertex proves nothing.*

**1:46–1:54** — The upper bound is reached: a six-cycle has diameter three and radius three, and all six vertices are in the centre.

> Caption: The upper bound is attained: a six-cycle has diameter 3 and radius 3, and every vertex is in its centre.

Exam-trap caption mode adds: *Thinking radius and diameter must differ. They coincide whenever every vertex is equally far from the worst case.*

**1:54–2:00** — A graph whose radius equals its diameter is called self-centred, and cycles and complete graphs are the standard examples.

> Caption: A graph whose radius equals its diameter is called self-centred. Cycles and complete graphs are.

Exam-trap caption mode adds: *Assuming a self-centred graph is rare. Every cycle and every complete graph is one, so it is the common case in small examples.*

## Scene 5. On a tree the floor is always reached

*2:00 – 2:30 · objective: See that a tree has radius exactly half its diameter rounded up, and a centre of one vertex or two adjacent ones.*

**2:00–2:08** — On a tree the floor is always reached. The radius is exactly half the diameter, rounded up.

> Caption: On a tree the floor is always reached: the radius equals half the diameter, rounded up.

Exam-trap caption mode adds: *Applying this to a graph with a cycle. A four-cycle has diameter 2 and radius 2, not 1.*

**2:08–2:16** — An odd diameter forces two centre vertices, and they are adjacent. An even diameter forces exactly one.

> Caption: So an odd diameter forces two adjacent centre vertices, and an even diameter forces exactly one.

Exam-trap caption mode adds: *Believing the two centre vertices can be far apart. They are always joined by an edge, so the centre is either a single vertex or one edge.*

**2:16–2:24** — Every labelled tree on two to seven vertices was checked on this page: eighteen thousand two hundred and forty-eight of them, and not one exception.

> Caption: All 18248 labelled trees on 2 to 7 vertices were checked here: no exception, and every two-vertex centre is an edge.

Exam-trap caption mode adds: *Treating a check over small trees as a proof. It is evidence, and the proof is the argument about the middle of a diameter path.*

**2:24–2:30** — The centre is also the middle of any diameter path, which is a tree fact. On a general graph it fails, and the next scene shows how.

> Caption: The centre is also the middle of any diameter path. That is a tree fact, and it fails on general graphs.

Exam-trap caption mode adds: *Finding the centre by taking the middle of a longest path in a graph with cycles. It can give a vertex that is not in the centre.*

## Scene 6. Peeling leaves finds the centre in one pass

*2:30 – 3:00 · objective: Run the leaf-peeling algorithm by hand and see it agree with the distance table.*

**2:30–2:38** — Peeling finds the centre without any distance table. Remove every leaf, then repeat on what is left.

> Caption: Peeling finds the centre with no distance table: remove every leaf, then repeat on what is left.

Exam-trap caption mode adds: *Removing leaves one at a time. Whole rounds matter: a round removes the same distance from every side at once.*

**2:38–2:46** — On the eight-vertex path the first round removes both ends. Three rounds leave vertices three and four, which are the two centres.

> Caption: On the eight-vertex path the first round removes both ends, and three rounds leave vertices 3 and 4.

Exam-trap caption mode adds: *Stopping as soon as one vertex has degree at most one. Several vertices reach degree one in the same round, and all must go together.*

**2:46–2:54** — The same rule on the seven-vertex tree removes three leaves, then three more, and leaves the single vertex two, which is what the distance table said.

> Caption: The same rule on the seven-vertex tree leaves the single vertex 2, in two rounds.

Exam-trap caption mode adds: *Reporting the round count as the radius. The eight-vertex path takes three rounds and its radius is four, so the two numbers are not the same.*

**2:54–3:00** — The peel is one pass over the edges, so its cost is linear. No table of all pairs is ever built.

> Caption: One pass over the edges, so linear time: no all-pairs table is built.

Exam-trap caption mode adds: *Claiming linear time for the distance-table method. One search per vertex is quadratic on a dense graph.*

## Scene 7. Two sweeps find a diameter — on a tree only

*3:00 – 3:30 · objective: See the double-sweep algorithm succeed on every tree and fail on a four-vertex diamond.*

**3:00–3:08** — A diameter can be found with two breadth-first searches. Sweep from any vertex, then sweep from the farthest vertex the first sweep reached.

> Caption: A diameter can be found with two searches: sweep from any vertex, then sweep from the farthest one reached.

Exam-trap caption mode adds: *Believing this works on every graph. It is a theorem about trees and about weighted trees, not about graphs in general.*

**3:08–3:16** — On every one of the eighteen thousand two hundred and forty-eight trees, the two sweeps return the true diameter.

> Caption: On every one of the 18248 trees the two sweeps return the true diameter.

Exam-trap caption mode adds: *Concluding from the tree case that the method is general. The next caption is the counterexample.*

**3:16–3:24** — On the diamond, four vertices and five edges, the two sweeps report one where the diameter is two.

> Caption: On the diamond — four vertices, five edges — it returns 1 where the diameter is 2.

Exam-trap caption mode adds: *Using two sweeps on a graph with cycles and trusting the number. It is a lower bound on the diameter in general, not the diameter.*

**3:24–3:30** — Sweep from zero and the farthest vertex is one, because it is one step away and the tie is broken by order. Sweep from one and again the answer is one. The pair two and three, two apart, is never used as a start.

> Caption: Sweep from 0 reaches 1 first, and 1 is one step from 0. The far pair, 2 and 3, is never visited as a start.

Exam-trap caption mode adds: *Thinking the failure comes from a tie in distance. The real cause is that a start vertex need not be a diameter endpoint.*

## Scene 8. Three places the intuitions break

*3:30 – 4:00 · objective: Meet a centre vertex on no diameter path, a disconnected graph with no eccentricity, and the centre-centroid-median confusion.*

**3:30–3:38** — First limit: on a general graph, a centre vertex need not lie on any diameter path.

> Caption: First limit: on a general graph a centre vertex need not lie on any diameter path.

Exam-trap caption mode adds: *Finding a centre by taking the middle of a longest path in a cyclic graph. It can return a vertex that is not in the centre.*

**3:38–3:46** — Here the diameter is three and the radius two. Vertex two is in the centre, yet every path of length three goes around it.

> Caption: In this five-vertex graph the diameter is 3 and the radius 2, and vertex 2 is in the centre but on no diameter path.

Exam-trap caption mode adds: *Concluding that the centre is empty of diameter endpoints. Here two of the three centre vertices are endpoints of no diameter either.*

**3:46–3:54** — Second limit: a disconnected graph has no finite eccentricity at all, so it has no radius and no diameter.

> Caption: Second limit: a disconnected graph has no finite eccentricity, so it has no radius and no diameter.

Exam-trap caption mode adds: *Adding the two component diameters, or taking their maximum without saying so. A sum is not a distance: no path joins the components.*

**3:54–4:00** — Third limit: centre, centroid and median are three different vertices. On this graph the centre is three and four, while the centroid and the median are only three.

> Caption: Third limit: centre, centroid and median are three different vertices. Here the centre is 3 and 4; the centroid and the median are only 3.

Exam-trap caption mode adds: *Answering a centre question with the centroid. The two agree often enough on small examples to hide the difference.*

## Scene 9. Two previous-year questions, recomputed

*4:00 – 4:30 · objective: Solve the GATE CSE 2025 Set 1 and GATE CSE 2021 Set 1 questions on this topic from the definitions, not from a key.*

**4:00–4:08** — GATE CSE 2025, Set one, question forty-three. A graph on a hundred vertices with diameter thirty, and any breadth-first-search tree of it.

> Caption: GATE CSE 2025 Set 1, Q43: a 100-vertex graph with diameter 30, and any breadth-first-search tree of it.

Exam-trap caption mode adds: *Trying to build such a graph. The question quantifies over every graph with diameter 30, so one example cannot answer it.*

**4:08–4:16** — The height of a BFS tree is the eccentricity of its root. The diameter is at most twice any eccentricity, so thirty is at most twice the height, and the height is at least fifteen.

> Caption: The height of a BFS tree is the eccentricity of its root, and the diameter is at most twice any eccentricity — so the height is at least 15.

Exam-trap caption mode adds: *Answering exactly 15. A root that is not central gives a height of up to 30, so only the lower bound is forced.*

**4:16–4:24** — GATE CSE 2021, Set one, question twenty. Join every pair at distance two, and the diameter becomes half the old one rounded up, so the correct option is the upper bound by the ceiling.

> Caption: GATE CSE 2021 Set 1, Q20: add an edge between every pair at distance two. The diameter becomes half the old one, rounded up.

Exam-trap caption mode adds: *Choosing the option that says the diameter strictly grows. Squaring a graph can only shorten distances, never lengthen them.*

**4:24–4:30** — Both answers are recomputed on this page from the definitions, rather than copied from an answer key.

> Caption: Both answers were recomputed here on the page's own graphs, not copied from a key.

Exam-trap caption mode adds: *Quoting a community answer without checking it. The inequality is two lines of algebra and can be verified in the exam.*

## Scene 10. One procedure and five traps

*4:30 – 5:00 · objective: Leave with a decision procedure and the five mistakes that produce an answer that is on the option list.*

**4:30–4:38** — One procedure. Build the distance table, read each row maximum, then take the smallest and the largest of those maxima.

> Caption: One procedure: build the distance table, read each row maximum, then take the smallest and the largest.

Exam-trap caption mode adds: *Computing the radius before the diameter, or the other way round. One table gives both, and doing it twice invites a transcription error.*

**4:38–4:46** — If the graph is a tree, skip the table. Peel leaves until one or two remain, and the radius is half the diameter rounded up.

> Caption: If the graph is a tree, skip the table: peel leaves until one or two remain, and take half the diameter rounded up.

Exam-trap caption mode adds: *Peeling a graph that is not a tree. On a cycle no vertex has degree one, so the peel never starts.*

**4:46–4:53** — Trap one: halving the diameter on a graph that is not a tree. Trap two: assuming the centre lies on a diameter path.

> Caption: Traps one and two: halving the diameter on a graph with a cycle, and assuming the centre lies on a diameter path.

Exam-trap caption mode adds: *Both traps give numbers that appear among the options, so a quick check does not catch them.*

**4:53–5:00** — Three more. A leaf is not necessarily the farthest vertex from the root. Two sweeps are not general. And a disconnected graph has no eccentricity at all.

> Caption: Traps three to five: a leaf's eccentricity is not the height, two sweeps are not general, and a disconnected graph has none.

Exam-trap caption mode adds: *Reporting a number for a disconnected graph. Say that it has none, or state the convention being used.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
