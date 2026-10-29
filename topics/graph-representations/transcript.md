# Graph Representations — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/graph-representations/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. One graph, three ways of writing it down

*0:00 – 0:30 · objective: See that a representation is a bookkeeping choice about the same seven edges, not a different graph.*

**0:00–0:07** — Six vertices, seven edges. Every representation in this lesson will describe exactly this graph, so any difference you see later is a difference in bookkeeping, not in the graph.

> Caption: Here is one undirected graph: six vertices, and seven edges. Nothing about it is a choice yet.

**0:07–0:15** — A grid with six rows and six columns. Entry i j is one when i and j are joined, and zero otherwise. That is the adjacency matrix.

> Caption: The first register is a square grid: one row and one column per vertex, and a 1 where an edge runs.

**0:15–0:22** — One card per vertex. On each card, only the vertices actually joined to it. The zeros are never written down, and that omission is the whole point.

> Caption: The second register is a card per vertex, listing only that vertex neighbours.

**0:22–0:30** — Or write the edges themselves: seven pairs. Three ways of writing one object. From here on the question is never which is correct, but which is cheap.

> Caption: The third register is a list of edges: seven pairs. Three registers, one graph.

## Scene 2. The adjacency matrix, filled edge by edge

*0:30 – 1:00 · objective: Read one edge as two cells in a square grid, and see why the grid is symmetric with a zero diagonal.*

**0:30–0:37** — An empty grid, rows and columns labelled by the same vertex order. Fix that order first: the matrix is only defined once the vertices are numbered.

> Caption: Start with an empty six by six grid and number the rows and columns by the same vertex order.

**0:37–0:45** — The edge between A and B sets the cell in row A, column B, and the cell in row B, column A. One undirected edge costs two cells.

> Caption: The edge A-B sets cell A,B and cell B,A. One edge, two cells.

**0:45–0:52** — Seven edges, fourteen ones, and the picture is symmetric about the main diagonal. Fourteen is twice seven, and that is not a coincidence.

> Caption: Seven edges later, fourteen cells are set and the grid is mirror-symmetric about its diagonal.

**0:52–1:00** — Nothing sits on the diagonal. A one there would mean a vertex joined to itself, and a simple graph has no such edge. Some texts write a loop as 2 on the diagonal, so read the convention before you add a row.

> Caption: The diagonal stays zero because a simple graph has no loop. A loop would put a 1 on the diagonal.

Exam-trap caption mode adds: *A one on the diagonal means a self-loop, not a vertex joined to all its neighbours. And a loop is counted twice in the degree, so it adds 2 to the row sum in the usual convention.*

## Scene 3. Counting straight off the matrix

*1:00 – 1:30 · objective: Recover m from the sum of all entries, and the degree of each vertex from a row sum.*

**1:00–1:07** — Add the row for A: two ones, so A has degree two. Row C has four ones. The row sums are the degrees, with no extra work.

> Caption: Add each row and you get the degree of that vertex: 2, 2, 4, 2, 2, 2.

**1:07–1:15** — All thirty-six cells add to fourteen. Every edge contributed exactly two ones, so the total is two m. That is the fastest way to check a matrix you have been handed.

> Caption: Add the whole grid instead and you get fourteen, which is twice the number of edges.

**1:15–1:22** — The degrees add to fourteen, the edges number seven. The handshake lemma is not a separate fact to memorise: it is the same double count, once by rows and once by edges.

> Caption: So the degrees must add to twice the edge count. This is the handshake lemma, read off the grid.

**1:22–1:30** — Sorted, the degree sequence is four twos and a four. Hold on to that list: later in this lesson two different graphs will share one degree sequence, and that is where marks are lost.

> Caption: The list 2, 2, 4, 2, 2, 2 is the degree sequence. It is not the graph.

## Scene 4. The adjacency list

*1:30 – 2:00 · objective: Build one chain per vertex and count its entries: 2m for an undirected graph, m for a directed one.*

**1:30–1:37** — An array of six heads, one per vertex. Each head starts a chain, and the chain holds the neighbours and nothing else.

> Caption: The list keeps one head per vertex, then a chain of that vertex neighbours.

**1:37–1:45** — Look at C: it appears four times, once on each neighbour card. A appears twice. A vertex appears on exactly as many chains as it has neighbours, so the entries total twice the edges.

> Caption: C appears on four chains because C has four neighbours; A appears on two.

**1:45–1:52** — Direction changes the count. In a digraph the chain of u holds the vertices u points to, so an edge is stored once. To find who points at u you need a second set of chains, the in-lists, or a scan of everything.

> Caption: For a directed graph each edge appears once, so the chains hold m entries, not two m.

**1:52–2:00** — GATE asked in 2016 Set 2 how fast you can link each entry to its twin. The answer is linear: one pass over all the entries, with a table keyed by the edge.

> Caption: Both copies of an edge are called twins, and setting a twin pointer in every entry costs Theta(n + m).

Exam-trap caption mode adds: *Searching the neighbour chain for the twin looks cheap per entry but costs O(m^2) overall on a dense graph. The linear bound needs a table, not a nested scan.*

## Scene 5. Space: bits against pointers

*2:00 – 2:30 · objective: Compute the memory each representation needs, and find the density at which the list overtakes the matrix.*

**2:00–2:07** — The matrix is sized by the vertices alone: six vertices, thirty-six cells. Add a thousand isolated vertices and it grows by a million cells while the edge count stays put.

> Caption: The matrix always costs n squared cells, whether the graph is empty or complete.

**2:07–2:15** — The list is sized by vertices and edges together. Six heads at four bytes, fourteen entries at eight bytes each, so one hundred and thirty-six bytes. For this small graph that is more than a packed matrix needs.

> Caption: The list costs a head per vertex and eight bytes per entry: here 24 bytes plus 112.

**2:15–2:22** — Now a sparse graph: a thousand vertices, two thousand edges. The list is a third of the packed matrix and a fraction of the integer matrix. Sparsity is where the list earns its keep.

> Caption: At a thousand vertices and two thousand edges the list needs 36,000 bytes against 125,000 for a packed matrix.

**2:22–2:30** — Four hundred thousand edges: the list now needs 6,404,000 bytes, fifty times the packed matrix. So the honest rule is about density, not about which structure is modern.

> Caption: Make the graph dense and the order reverses: 6,404,000 bytes of list against 125,000 of packed matrix.

## Scene 6. The edge test and the neighbour walk

*2:30 – 3:00 · objective: Price the two operations that decide a representation: asking about one edge, and walking every neighbour.*

**2:30–2:37** — Ask whether A and D are adjacent. The matrix reads row A, column D, and that single cell is the answer. One read, whatever the graph.

> Caption: Is A joined to D? The matrix reads one cell and answers in constant time.

**2:37–2:45** — The list has to look. A chain holds two entries, so the scan is short here. On a hub vertex it would not be, and that difference is what a complexity question is really asking about.

> Caption: The list walks A chain instead: two entries here, but up to the degree of A.

**2:45–2:52** — Now walk everything, as BFS or DFS does. On the matrix each vertex forces a full row read, so thirty-six cell inspections. On the list, six heads and fourteen entries: twenty steps.

> Caption: Walking the whole graph on a matrix reads all 36 cells; on a list it takes 6 heads plus 14 entries.

**2:52–3:00** — The tightest bound on DFS with an adjacency matrix is n squared, and that was a GATE question in 2014. Note the word tightest: n cubed is also an upper bound, and it is the wrong answer.

> Caption: So DFS is Theta(n squared) on a matrix and Theta(n + m) on a list, and GATE has asked exactly that.

Exam-trap caption mode adds: *Theta(n + m) is the list answer. Theta(m^2) and Theta(n) are wrong in different directions. Read which representation the question names before choosing.*

## Scene 7. A squared counts walks of length two

*3:00 – 3:30 · objective: Read A squared as a walk counter, and see its diagonal as the degree sequence.*

**3:00–3:07** — A squared is just A times A. The i j entry is the sum over k of A i k times A k j, and each k that contributes is one intermediate vertex: one walk of two steps.

> Caption: Multiply the matrix by itself. Entry i,j of A squared counts the walks of length two from i to j.

**3:07–3:15** — Look at the diagonal. A squared at A,A is two, which is the degree of A. In a simple graph a closed walk of length two is exactly an edge out and back, so the count is the degree.

> Caption: The diagonal of A squared is the degree sequence: 2, 2, 4, 2, 2, 2.

**3:15–3:22** — A and C have one vertex joined to both, namely B. So A squared at A,C is one. A and D share nothing, so that entry is zero. The matrix has become a statement about two-step reachability.

> Caption: Off the diagonal it counts common neighbours: A and C share B, so the entry is 1.

**3:22–3:30** — The total of the whole matrix is thirty-six walks of length two, which also equals the sum of the squared degrees. Two different counts, one answer: that agreement is the check.

> Caption: Add all of A squared and you get every walk of length two: 36 of them here.

## Scene 8. A cubed counts triangles

*3:30 – 4:00 · objective: Derive triangles = trace(A cubed) / 6 and see why the divisor is six.*

**3:30–3:37** — A cubed counts walks of length three. A closed walk of length three is a triangle walked round, and each corner of a triangle starts two of them, one in each direction.

> Caption: The diagonal of A cubed counts closed walks of length three: two at each corner of a triangle, zero elsewhere.

**3:37–3:45** — The trace is the sum of the diagonal, six. One triangle, six closed walks. So the trace is six times the triangle count, and dividing by six recovers it.

> Caption: The trace adds the diagonal: 2 + 2 + 2 = 6. One triangle contributed all six.

**3:45–3:52** — Why six? A triangle can be entered at any of its three corners and walked in either direction. Three times two is six, and all six appear in the trace.

> Caption: Six is three corners times two directions: that is why the divisor is six and not three.

**3:52–4:00** — A is its own inverse only when every row holds exactly one one, and that forces the graph to be a perfect matching: that was GATE 2024 Set 2. Powers of A are a tool, and the matrix is what makes them available.

> Caption: Powers of A answer structural questions, so the matrix is more than a storage format.

Exam-trap caption mode adds: *A^2 = I does not mean A = I. The identity has ones on the diagonal and A has zeros there, so the graph is a matching, never the empty graph and never a cycle.*

## Scene 9. The incidence matrix

*4:00 – 4:30 · objective: Read a vertex-by-edge table, and see the cycle count appear as its nullity.*

**4:00–4:07** — A different grid: rows are vertices, but columns are edges. Six rows and seven columns, and each column belongs to one edge.

> Caption: The incidence matrix has a row per vertex and a column per edge: six rows, seven columns.

**4:07–4:15** — Each edge has two ends, so each column has two ones. Fourteen ones in all, which is twice the seven edges. Same double count, different grid.

> Caption: Every column holds exactly two ones, one at each end of that edge, and the column sums are all 2.

**4:15–4:22** — Row sums give degrees, so nothing new there. The interesting number is the rank: five over GF(2) for a connected graph on six vertices. One row is always redundant, because every column sums to two, which is zero mod two.

> Caption: Row sums are the degrees again. Over GF(2) the rank is n minus the number of components.

**4:22–4:30** — The nullity over GF(2) is two, and this graph has exactly two independent cycles: the triangle and the four-cycle. The incidence matrix knows about cycles, which is why it is the natural home for flow and cycle-space arguments.

> Caption: That nullity is the number of independent cycles: two here, a triangle and a four-cycle.

## Scene 10. Choosing, and the trap in the degree sequence

*4:30 – 5:00 · objective: Decide a representation from four questions, and see two non-isomorphic graphs with identical degrees.*

**4:30–4:37** — Dense graph, and edge tests matter: the matrix. Sparse graph, and you mostly walk neighbours: the list. Need powers of A, or spectral information: the matrix, and no substitute.

> Caption: Four questions pick the structure: how dense, which query, is memory tight, do you need powers of A.

**4:37–4:45** — Left, the complete bipartite graph K three three. Right, a triangular prism. Both are three-regular on six vertices with nine edges. One has no triangles; the other has two.

> Caption: Now the trap. These two graphs have the same degree sequence: 3, 3, 3, 3, 3, 3.

**4:45–4:52** — The degrees agree and the graphs differ. If a question gives you degrees and asks what must be true, the answer is usually that almost nothing must be. Use triangle counts, connectivity or trace of A cubed.

> Caption: So a degree sequence never settles a graph question. Triangle counts, or A cubed, separate them.

**4:52–5:00** — The graph is the object; the matrix, the list and the incidence table are three sets of prices. Pick the one whose expensive operation you do not need.

> Caption: A representation never changes the graph. It only decides what is cheap, and every claim here was computed on this page.

Exam-trap caption mode adds: *Theta(n^2) is not "slower" in the abstract: for a dense graph n^2 is the size of the input, so a matrix traversal is linear in the input size. Quote the cost against m and n, never as a slogan.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
