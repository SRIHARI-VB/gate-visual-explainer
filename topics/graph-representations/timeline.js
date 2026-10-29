/* ==========================================================================
   graph-representations — THE timeline.
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
      id: 'three-registers',
      n: 1,
      title: 'One graph, three ways of writing it down',
      start: 0, end: 30,
      objective: 'See that a representation is a bookkeeping choice about the same seven edges, not a different graph.'
    },
    {
      id: 'matrix',
      n: 2,
      title: 'The adjacency matrix, filled edge by edge',
      start: 30, end: 60,
      objective: 'Read one edge as two cells in a square grid, and see why the grid is symmetric with a zero diagonal.'
    },
    {
      id: 'count',
      n: 3,
      title: 'Counting straight off the matrix',
      start: 60, end: 90,
      objective: 'Recover m from the sum of all entries, and the degree of each vertex from a row sum.'
    },
    {
      id: 'list',
      n: 4,
      title: 'The adjacency list',
      start: 90, end: 120,
      objective: 'Build one chain per vertex and count its entries: 2m for an undirected graph, m for a directed one.'
    },
    {
      id: 'space',
      n: 5,
      title: 'Space: bits against pointers',
      start: 120, end: 150,
      objective: 'Compute the memory each representation needs, and find the density at which the list overtakes the matrix.'
    },
    {
      id: 'cost',
      n: 6,
      title: 'The edge test and the neighbour walk',
      start: 150, end: 180,
      objective: 'Price the two operations that decide a representation: asking about one edge, and walking every neighbour.'
    },
    {
      id: 'square',
      n: 7,
      title: 'A squared counts walks of length two',
      start: 180, end: 210,
      objective: 'Read A squared as a walk counter, and see its diagonal as the degree sequence.'
    },
    {
      id: 'cube',
      n: 8,
      title: 'A cubed counts triangles',
      start: 210, end: 240,
      objective: 'Derive triangles = trace(A cubed) / 6 and see why the divisor is six.'
    },
    {
      id: 'incidence',
      n: 9,
      title: 'The incidence matrix',
      start: 240, end: 270,
      objective: 'Read a vertex-by-edge table, and see the cycle count appear as its nullity.'
    },
    {
      id: 'choose',
      n: 10,
      title: 'Choosing, and the trap in the degree sequence',
      start: 270, end: 300,
      objective: 'Decide a representation from four questions, and see two non-isomorphic graphs with identical degrees.'
    }
  ],

  events: [

    /* ---------------- scene 1: three registers ---------------- */
    {
      id: 'reg-1', start: 0, end: 7.5, scene: 'three-registers',
      visualAction: 'draw-graph',
      caption: 'Here is one undirected graph: six vertices, and seven edges. Nothing about it is a choice yet.',
      narration: 'Six vertices, seven edges. Every representation in this lesson will describe exactly this graph, so any difference you see later is a difference in bookkeeping, not in the graph.',
      keyword: 'seven edges',
      detail: 'Vertex set A to F, edge set A-B, B-C, C-A, C-D, D-E, E-F, F-C. Seven edges, six vertices, and it is connected.'
    },
    {
      id: 'reg-2', start: 7.5, end: 15, scene: 'three-registers',
      visualAction: 'show-matrix',
      caption: 'The first register is a square grid: one row and one column per vertex, and a 1 where an edge runs.',
      narration: 'A grid with six rows and six columns. Entry i j is one when i and j are joined, and zero otherwise. That is the adjacency matrix.',
      keyword: 'square grid',
      detail: 'A square grid of n by n cells, holding 0 or 1. Six vertices give thirty-six cells, of which fourteen are set.'
    },
    {
      id: 'reg-3', start: 15, end: 22.5, scene: 'three-registers',
      visualAction: 'show-list',
      caption: 'The second register is a card per vertex, listing only that vertex neighbours.',
      narration: 'One card per vertex. On each card, only the vertices actually joined to it. The zeros are never written down, and that omission is the whole point.',
      keyword: 'only the neighbours',
      detail: 'An array of n lists. The list for u holds exactly the vertices v with an edge from u to v, so the empty cells of the matrix are never stored.'
    },
    {
      id: 'reg-4', start: 22.5, end: 30, scene: 'three-registers',
      visualAction: 'show-edges',
      caption: 'The third register is a list of edges: seven pairs. Three registers, one graph.',
      narration: 'Or write the edges themselves: seven pairs. Three ways of writing one object. From here on the question is never which is correct, but which is cheap.',
      keyword: 'seven pairs',
      detail: 'An edge list holds m pairs. An incidence matrix holds the same information as n by m cells with two ones per column.'
    },

    /* ---------------- scene 2: the matrix ---------------- */
    {
      id: 'mat-1', start: 30, end: 37.5, scene: 'matrix',
      visualAction: 'empty-grid',
      caption: 'Start with an empty six by six grid and number the rows and columns by the same vertex order.',
      narration: 'An empty grid, rows and columns labelled by the same vertex order. Fix that order first: the matrix is only defined once the vertices are numbered.',
      keyword: 'same vertex order',
      detail: 'The row index and the column index both run over the same ordering of V. Change the ordering and you permute rows and columns together.'
    },
    {
      id: 'mat-2', start: 37.5, end: 45, scene: 'matrix',
      visualAction: 'edge-AB',
      caption: 'The edge A-B sets cell A,B and cell B,A. One edge, two cells.',
      narration: 'The edge between A and B sets the cell in row A, column B, and the cell in row B, column A. One undirected edge costs two cells.',
      keyword: 'two cells',
      detail: 'For an undirected graph A[i][j] equals A[j][i] for every pair, so the matrix is symmetric about its diagonal.'
    },
    {
      id: 'mat-3', start: 45, end: 52.5, scene: 'matrix',
      visualAction: 'all-edges',
      caption: 'Seven edges later, fourteen cells are set and the grid is mirror-symmetric about its diagonal.',
      narration: 'Seven edges, fourteen ones, and the picture is symmetric about the main diagonal. Fourteen is twice seven, and that is not a coincidence.',
      keyword: 'symmetric',
      detail: 'The number of set cells is 2m for an undirected graph. The entries above the diagonal alone number exactly m.'
    },
    {
      id: 'mat-4', start: 52.5, end: 60, scene: 'matrix',
      visualAction: 'diagonal',
      caption: 'The diagonal stays zero because a simple graph has no loop. A loop would put a 1 on the diagonal.',
      narration: 'Nothing sits on the diagonal. A one there would mean a vertex joined to itself, and a simple graph has no such edge. Some texts write a loop as 2 on the diagonal, so read the convention before you add a row.',
      keyword: 'no loop',
      detail: 'A[i][i] = 0 for every i in a simple graph. With loops, some conventions store 1 and some store 2, because a loop adds two to the degree; GATE questions on simple graphs avoid the ambiguity.',
      trap: 'A one on the diagonal means a self-loop, not a vertex joined to all its neighbours. And a loop is counted twice in the degree, so it adds 2 to the row sum in the usual convention.'
    },

    /* ---------------- scene 3: counting ---------------- */
    {
      id: 'cnt-1', start: 60, end: 67.5, scene: 'count',
      visualAction: 'row-sums',
      caption: 'Add each row and you get the degree of that vertex: 2, 2, 4, 2, 2, 2.',
      narration: 'Add the row for A: two ones, so A has degree two. Row C has four ones. The row sums are the degrees, with no extra work.',
      keyword: 'row sums are the degrees',
      detail: 'For an undirected simple graph the row sum of row i counts the neighbours of i, which is deg(i). For a directed graph the row sum is the out-degree and the column sum is the in-degree.'
    },
    {
      id: 'cnt-2', start: 67.5, end: 75, scene: 'count',
      visualAction: 'total-sum',
      caption: 'Add the whole grid instead and you get fourteen, which is twice the number of edges.',
      narration: 'All thirty-six cells add to fourteen. Every edge contributed exactly two ones, so the total is two m. That is the fastest way to check a matrix you have been handed.',
      keyword: 'twice the number of edges',
      detail: 'Sum of all entries of A equals 2m for an undirected graph, and equals m for a directed graph with no loops.'
    },
    {
      id: 'cnt-3', start: 75, end: 82.5, scene: 'count',
      visualAction: 'handshake',
      caption: 'So the degrees must add to twice the edge count. This is the handshake lemma, read off the grid.',
      narration: 'The degrees add to fourteen, the edges number seven. The handshake lemma is not a separate fact to memorise: it is the same double count, once by rows and once by edges.',
      keyword: 'handshake lemma',
      detail: 'The sum of the degrees equals 2m, so the number of odd-degree vertices is even. Here every degree is even, so there are none.'
    },
    {
      id: 'cnt-4', start: 82.5, end: 90, scene: 'count',
      visualAction: 'degree-sequence',
      caption: 'The list 2, 2, 4, 2, 2, 2 is the degree sequence. It is not the graph.',
      narration: 'Sorted, the degree sequence is four twos and a four. Hold on to that list: later in this lesson two different graphs will share one degree sequence, and that is where marks are lost.',
      keyword: 'degree sequence',
      detail: 'The degree sequence is the multiset of degrees in non-increasing order: 4, 2, 2, 2, 2, 2 here. It is invariant under relabelling but does not determine the graph.'
    },

    /* ---------------- scene 4: the list ---------------- */
    {
      id: 'lst-1', start: 90, end: 97.5, scene: 'list',
      visualAction: 'heads',
      caption: 'The list keeps one head per vertex, then a chain of that vertex neighbours.',
      narration: 'An array of six heads, one per vertex. Each head starts a chain, and the chain holds the neighbours and nothing else.',
      keyword: 'one head per vertex',
      detail: 'The head array has n entries. In an array-based implementation the heads are the first index of each vertex block, which is why the list is often stored as one flat array of size n + 2m.'
    },
    {
      id: 'lst-2', start: 97.5, end: 105, scene: 'list',
      visualAction: 'chains',
      caption: 'C appears on four chains because C has four neighbours; A appears on two.',
      narration: 'Look at C: it appears four times, once on each neighbour card. A appears twice. A vertex appears on exactly as many chains as it has neighbours, so the entries total twice the edges.',
      keyword: 'twice the edges',
      detail: 'Sum of the chain lengths is 2m for an undirected graph: each edge {u,v} contributes v to the chain of u and u to the chain of v.'
    },
    {
      id: 'lst-3', start: 105, end: 112.5, scene: 'list',
      visualAction: 'directed',
      caption: 'For a directed graph each edge appears once, so the chains hold m entries, not two m.',
      narration: 'Direction changes the count. In a digraph the chain of u holds the vertices u points to, so an edge is stored once. To find who points at u you need a second set of chains, the in-lists, or a scan of everything.',
      keyword: 'm entries',
      detail: 'Out-chains hold m entries in total for a digraph. In-degree then costs a full scan, Theta(n + m), unless a separate in-list is kept, which doubles the storage.'
    },
    {
      id: 'lst-4', start: 112.5, end: 120, scene: 'list',
      visualAction: 'twin',
      caption: 'Both copies of an edge are called twins, and setting a twin pointer in every entry costs Theta(n + m).',
      narration: 'GATE asked in 2016 Set 2 how fast you can link each entry to its twin. The answer is linear: one pass over all the entries, with a table keyed by the edge.',
      keyword: 'twin pointer',
      detail: 'GATE CSE 2016 Set 2 Q41: with 2m entries and no memory limit, one pass with a hash table or a bucketed index pairs every entry with its twin in Theta(n + m).',
      trap: 'Searching the neighbour chain for the twin looks cheap per entry but costs O(m^2) overall on a dense graph. The linear bound needs a table, not a nested scan.'
    },

    /* ---------------- scene 5: space ---------------- */
    {
      id: 'spc-1', start: 120, end: 127.5, scene: 'space',
      visualAction: 'matrix-bytes',
      caption: 'The matrix always costs n squared cells, whether the graph is empty or complete.',
      narration: 'The matrix is sized by the vertices alone: six vertices, thirty-six cells. Add a thousand isolated vertices and it grows by a million cells while the edge count stays put.',
      keyword: 'n squared',
      detail: 'One bit per entry packs the matrix into ceil(n^2 / 8) bytes; one 32-bit integer per entry costs 4n^2 bytes. Either way the cost is independent of m.'
    },
    {
      id: 'spc-2', start: 127.5, end: 135, scene: 'space',
      visualAction: 'list-bytes',
      caption: 'The list costs a head per vertex and eight bytes per entry: here 24 bytes plus 112.',
      narration: 'The list is sized by vertices and edges together. Six heads at four bytes, fourteen entries at eight bytes each, so one hundred and thirty-six bytes. For this small graph that is more than a packed matrix needs.',
      keyword: 'four bytes a head',
      detail: 'The figures assume a 4-byte vertex index for heads and an 8-byte node (4-byte index plus 4-byte pointer). Other layouts shift the numbers but not the growth rates.'
    },
    {
      id: 'spc-3', start: 135, end: 142.5, scene: 'space',
      visualAction: 'sparse',
      caption: 'At a thousand vertices and two thousand edges the list needs 36,000 bytes against 125,000 for a packed matrix.',
      narration: 'Now a sparse graph: a thousand vertices, two thousand edges. The list is a third of the packed matrix and a fraction of the integer matrix. Sparsity is where the list earns its keep.',
      keyword: 'sparse',
      detail: 'Packed matrix: ceil(1000^2 / 8) = 125,000 bytes. 32-bit matrix: 4,000,000 bytes. List: 4,000 + 32,000 = 36,000 bytes.'
    },
    {
      id: 'spc-4', start: 142.5, end: 150, scene: 'space',
      visualAction: 'dense',
      caption: 'Make the graph dense and the order reverses: 6,404,000 bytes of list against 125,000 of packed matrix.',
      narration: 'Four hundred thousand edges: the list now needs 6,404,000 bytes, fifty times the packed matrix. So the honest rule is about density, not about which structure is modern.',
      keyword: 'density',
      detail: 'At n = 1000 the list is smaller exactly while m is under 7,562, which is the crossover where 4n + 16m meets ceil(n^2 / 8).'
    },

    /* ---------------- scene 6: cost ---------------- */
    {
      id: 'cst-1', start: 150, end: 157.5, scene: 'cost',
      visualAction: 'has-edge-matrix',
      caption: 'Is A joined to D? The matrix reads one cell and answers in constant time.',
      narration: 'Ask whether A and D are adjacent. The matrix reads row A, column D, and that single cell is the answer. One read, whatever the graph.',
      keyword: 'constant time',
      detail: 'The adjacency matrix answers hasEdge(u, v) in O(1). The adjacency list must scan the chain of u, which costs O(deg(u)), or O(n) in the worst case.'
    },
    {
      id: 'cst-2', start: 157.5, end: 165, scene: 'cost',
      visualAction: 'has-edge-list',
      caption: 'The list walks A chain instead: two entries here, but up to the degree of A.',
      narration: 'The list has to look. A chain holds two entries, so the scan is short here. On a hub vertex it would not be, and that difference is what a complexity question is really asking about.',
      keyword: 'walks the chain',
      detail: 'The cost is Theta(1 + deg(u)) with a linear scan, or O(1) if each chain is also hashed. A question that says "adjacency list" and does not mention a hash means the scan.'
    },
    {
      id: 'cst-3', start: 165, end: 172.5, scene: 'cost',
      visualAction: 'traverse-matrix',
      caption: 'Walking the whole graph on a matrix reads all 36 cells; on a list it takes 6 heads plus 14 entries.',
      narration: 'Now walk everything, as BFS or DFS does. On the matrix each vertex forces a full row read, so thirty-six cell inspections. On the list, six heads and fourteen entries: twenty steps.',
      keyword: '36 against 20',
      detail: 'Matrix traversal inspects every row in full, so Theta(n^2). List traversal touches every head and every entry once, so Theta(n + m).'
    },
    {
      id: 'cst-4', start: 172.5, end: 180, scene: 'cost',
      visualAction: 'traverse-bound',
      caption: 'So DFS is Theta(n squared) on a matrix and Theta(n + m) on a list, and GATE has asked exactly that.',
      narration: 'The tightest bound on DFS with an adjacency matrix is n squared, and that was a GATE question in 2014. Note the word tightest: n cubed is also an upper bound, and it is the wrong answer.',
      keyword: 'tightest bound',
      detail: 'GATE CSE 2014 Set 1: the tightest upper bound on the running time of DFS with an adjacency matrix is Theta(n^2), not Theta(n + m), which is the list figure.',
      trap: 'Theta(n + m) is the list answer. Theta(m^2) and Theta(n) are wrong in different directions. Read which representation the question names before choosing.'
    },

    /* ---------------- scene 7: A squared ---------------- */
    {
      id: 'sq-1', start: 180, end: 187.5, scene: 'square',
      visualAction: 'multiply',
      caption: 'Multiply the matrix by itself. Entry i,j of A squared counts the walks of length two from i to j.',
      narration: 'A squared is just A times A. The i j entry is the sum over k of A i k times A k j, and each k that contributes is one intermediate vertex: one walk of two steps.',
      keyword: 'walks of length two',
      detail: 'A^2[i][j] = sum over k of A[i][k] A[k][j]. Every k with both entries 1 gives one walk i -> k -> j, so the entry counts walks of length exactly 2.'
    },
    {
      id: 'sq-2', start: 187.5, end: 195, scene: 'square',
      visualAction: 'diagonal',
      caption: 'The diagonal of A squared is the degree sequence: 2, 2, 4, 2, 2, 2.',
      narration: 'Look at the diagonal. A squared at A,A is two, which is the degree of A. In a simple graph a closed walk of length two is exactly an edge out and back, so the count is the degree.',
      keyword: 'diagonal is the degree',
      detail: 'A^2[i][i] = sum over k of A[i][k]^2 = sum over k of A[i][k] = deg(i), because each entry is 0 or 1. This is option (a) of GATE CSE 2022 Q10, and it is the true one.'
    },
    {
      id: 'sq-3', start: 195, end: 202.5, scene: 'square',
      visualAction: 'off-diagonal',
      caption: 'Off the diagonal it counts common neighbours: A and C share B, so the entry is 1.',
      narration: 'A and C have one vertex joined to both, namely B. So A squared at A,C is one. A and D share nothing, so that entry is zero. The matrix has become a statement about two-step reachability.',
      keyword: 'common neighbours',
      detail: 'A^2[i][j] equals the number of common neighbours of i and j, which is the number of distinct length-2 walks when the graph is simple and i is not j.'
    },
    {
      id: 'sq-4', start: 202.5, end: 210, scene: 'square',
      visualAction: 'sum',
      caption: 'Add all of A squared and you get every walk of length two: 36 of them here.',
      narration: 'The total of the whole matrix is thirty-six walks of length two, which also equals the sum of the squared degrees. Two different counts, one answer: that agreement is the check.',
      keyword: 'every walk of length two',
      detail: 'Sum of all entries of A^2 = sum over i,j of the common-neighbour count = sum over k of deg(k)^2. Here 4 + 4 + 16 + 4 + 4 + 4 = 36.'
    },

    /* ---------------- scene 8: A cubed ---------------- */
    {
      id: 'cb-1', start: 210, end: 217.5, scene: 'cube',
      visualAction: 'diagonal-a3',
      caption: 'The diagonal of A cubed counts closed walks of length three: two at each corner of a triangle, zero elsewhere.',
      narration: 'A cubed counts walks of length three. A closed walk of length three is a triangle walked round, and each corner of a triangle starts two of them, one in each direction.',
      keyword: 'closed walks',
      detail: 'A^3[i][i] = 2 times the number of triangles containing i. Here A, B and C are the corners of the only triangle, so their diagonal entries are 2 and the others are 0.'
    },
    {
      id: 'cb-2', start: 217.5, end: 225, scene: 'cube',
      visualAction: 'trace',
      caption: 'The trace adds the diagonal: 2 + 2 + 2 = 6. One triangle contributed all six.',
      narration: 'The trace is the sum of the diagonal, six. One triangle, six closed walks. So the trace is six times the triangle count, and dividing by six recovers it.',
      keyword: 'trace is six',
      detail: 'trace(A^3) = 6 here, and the graph has exactly one triangle, so triangles = 6 / 6 = 1. The page also counts triangles by brute force and compares.'
    },
    {
      id: 'cb-3', start: 225, end: 232.5, scene: 'cube',
      visualAction: 'why-six',
      caption: 'Six is three corners times two directions: that is why the divisor is six and not three.',
      narration: 'Why six? A triangle can be entered at any of its three corners and walked in either direction. Three times two is six, and all six appear in the trace.',
      keyword: 'three corners, two directions',
      detail: 'GATE CSE 2022 Q12 asks for the number of 3-cycles in terms of A^3; the answer is trace(A^3) divided by 6. Dividing by 3 counts each triangle twice, once per direction.'
    },
    {
      id: 'cb-4', start: 232.5, end: 240, scene: 'cube',
      visualAction: 'self-inverse',
      caption: 'Powers of A answer structural questions, so the matrix is more than a storage format.',
      narration: 'A is its own inverse only when every row holds exactly one one, and that forces the graph to be a perfect matching: that was GATE 2024 Set 2. Powers of A are a tool, and the matrix is what makes them available.',
      keyword: 'a tool, not a format',
      detail: 'GATE CSE 2024 Set 2 Q7: A symmetric with A = A inverse implies A^2 = I, so every diagonal entry of A^2, which is a degree, equals 1. Every degree is 1, so G is a perfect matching.',
      trap: 'A^2 = I does not mean A = I. The identity has ones on the diagonal and A has zeros there, so the graph is a matching, never the empty graph and never a cycle.'
    },

    /* ---------------- scene 9: incidence ---------------- */
    {
      id: 'inc-1', start: 240, end: 247.5, scene: 'incidence',
      visualAction: 'grid',
      caption: 'The incidence matrix has a row per vertex and a column per edge: six rows, seven columns.',
      narration: 'A different grid: rows are vertices, but columns are edges. Six rows and seven columns, and each column belongs to one edge.',
      keyword: 'a column per edge',
      detail: 'The vertex-edge incidence matrix is n by m. For an undirected graph each column has exactly two ones, in the rows of the edge two endpoints.'
    },
    {
      id: 'inc-2', start: 247.5, end: 255, scene: 'incidence',
      visualAction: 'two-ones',
      caption: 'Every column holds exactly two ones, one at each end of that edge, and the column sums are all 2.',
      narration: 'Each edge has two ends, so each column has two ones. Fourteen ones in all, which is twice the seven edges. Same double count, different grid.',
      keyword: 'two ones per column',
      detail: 'The total number of ones is 2m. A loop would put a single 2, or two ones in one row, depending on convention; on simple graphs the column sum is exactly 2.'
    },
    {
      id: 'inc-3', start: 255, end: 262.5, scene: 'incidence',
      visualAction: 'row-sums',
      caption: 'Row sums are the degrees again. Over GF(2) the rank is n minus the number of components.',
      narration: 'Row sums give degrees, so nothing new there. The interesting number is the rank: five over GF(2) for a connected graph on six vertices. One row is always redundant, because every column sums to two, which is zero mod two.',
      keyword: 'rank n minus components',
      detail: 'Over GF(2) the incidence matrix of a graph with c components has rank n - c and nullity m - n + c. Here 6 - 1 = 5 and 7 - 6 + 1 = 2. Over the reals the unsigned matrix has rank n - c only when the graph is bipartite; this graph has a triangle, so its real rank is 6.'
    },
    {
      id: 'inc-4', start: 262.5, end: 270, scene: 'incidence',
      visualAction: 'cycles',
      caption: 'That nullity is the number of independent cycles: two here, a triangle and a four-cycle.',
      narration: 'The nullity over GF(2) is two, and this graph has exactly two independent cycles: the triangle and the four-cycle. The incidence matrix knows about cycles, which is why it is the natural home for flow and cycle-space arguments.',
      keyword: 'independent cycles',
      detail: 'Over GF(2) the cycle space has dimension m - n + c = 2, spanned here by the triangle A-B-C and the four-cycle C-D-E-F. The cost of the extra knowledge is n times m cells.'
    },

    /* ---------------- scene 10: choosing ---------------- */
    {
      id: 'ch-1', start: 270, end: 277.5, scene: 'choose',
      visualAction: 'checklist',
      caption: 'Four questions pick the structure: how dense, which query, is memory tight, do you need powers of A.',
      narration: 'Dense graph, and edge tests matter: the matrix. Sparse graph, and you mostly walk neighbours: the list. Need powers of A, or spectral information: the matrix, and no substitute.',
      keyword: 'four questions',
      detail: 'Density decides space. The dominant query decides time. A^k and eigenvalues need a matrix. Enumerating one vertex neighbours needs a list. A digraph needing in-degrees needs in-lists.'
    },
    {
      id: 'ch-2', start: 277.5, end: 285, scene: 'choose',
      visualAction: 'k33',
      caption: 'Now the trap. These two graphs have the same degree sequence: 3, 3, 3, 3, 3, 3.',
      narration: 'Left, the complete bipartite graph K three three. Right, a triangular prism. Both are three-regular on six vertices with nine edges. One has no triangles; the other has two.',
      keyword: 'same degree sequence',
      detail: 'Both are 3-regular on 6 vertices with 9 edges, so their degree sequences are identical. K3,3 has 0 triangles; the prism has 2. They are not isomorphic.'
    },
    {
      id: 'ch-3', start: 285, end: 292.5, scene: 'choose',
      visualAction: 'non-isomorphic',
      caption: 'So a degree sequence never settles a graph question. Triangle counts, or A cubed, separate them.',
      narration: 'The degrees agree and the graphs differ. If a question gives you degrees and asks what must be true, the answer is usually that almost nothing must be. Use triangle counts, connectivity or trace of A cubed.',
      keyword: 'never settles it',
      detail: 'The degree sequence is necessary but not sufficient for isomorphism. K3,3 and the prism are the smallest counterexample pair for a 3-regular graph on 6 vertices.'
    },
    {
      id: 'ch-4', start: 292.5, end: 300, scene: 'choose',
      visualAction: 'close',
      caption: 'A representation never changes the graph. It only decides what is cheap, and every claim here was computed on this page.',
      narration: 'The graph is the object; the matrix, the list and the incidence table are three sets of prices. Pick the one whose expensive operation you do not need.',
      keyword: 'what is cheap',
      detail: 'All figures on this page are computed in the lesson model and checked against their own definitions: 14 ones, 36 cells, trace(A^3) = 6, incidence rank 5, nullity 2, and a list crossover at m = 7,562 for n = 1,000.',
      trap: 'Theta(n^2) is not "slower" in the abstract: for a dense graph n^2 is the size of the input, so a matrix traversal is linear in the input size. Quote the cost against m and n, never as a slogan.'
    }
  ]
};
