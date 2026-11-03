/* ==========================================================================
   graph-eccentricity-radius-diameter-centre — THE timeline.
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
      id: 'dist',
      n: 1,
      title: 'Distance is a count of edges',
      start: 0, end: 30,
      objective: 'Read a distance as the fewest edges on a path, and see why breadth-first search is what computes it.'
    },
    {
      id: 'ecc',
      n: 2,
      title: 'Eccentricity: the worst case from one vertex',
      start: 30, end: 60,
      objective: 'Read eccentricity off one row of the distance table: it is that row\'s largest entry.'
    },
    {
      id: 'four',
      n: 3,
      title: 'Four numbers, one list',
      start: 60, end: 90,
      objective: 'Define diameter, radius, centre and periphery as the maximum, the minimum and the two arg-sets of one list of eccentricities.'
    },
    {
      id: 'bounds',
      n: 4,
      title: 'Half the diameter is a floor, the diameter is a ceiling',
      start: 90, end: 120,
      objective: 'Prove and use the two bounds, and see that the upper one is attained by self-centred graphs.'
    },
    {
      id: 'tree',
      n: 5,
      title: 'On a tree the floor is always reached',
      start: 120, end: 150,
      objective: 'See that a tree has radius exactly half its diameter rounded up, and a centre of one vertex or two adjacent ones.'
    },
    {
      id: 'peel',
      n: 6,
      title: 'Peeling leaves finds the centre in one pass',
      start: 150, end: 180,
      objective: 'Run the leaf-peeling algorithm by hand and see it agree with the distance table.'
    },
    {
      id: 'twobfs',
      n: 7,
      title: 'Two sweeps find a diameter — on a tree only',
      start: 180, end: 210,
      objective: 'See the double-sweep algorithm succeed on every tree and fail on a four-vertex diamond.'
    },
    {
      id: 'limits',
      n: 8,
      title: 'Three places the intuitions break',
      start: 210, end: 240,
      objective: 'Meet a centre vertex on no diameter path, a disconnected graph with no eccentricity, and the centre-centroid-median confusion.'
    },
    {
      id: 'pyq',
      n: 9,
      title: 'Two previous-year questions, recomputed',
      start: 240, end: 270,
      objective: 'Solve the GATE CSE 2025 Set 1 and GATE CSE 2021 Set 1 questions on this topic from the definitions, not from a key.'
    },
    {
      id: 'proc',
      n: 10,
      title: 'One procedure and five traps',
      start: 270, end: 300,
      objective: 'Leave with a decision procedure and the five mistakes that produce an answer that is on the option list.'
    }
  ],

  events: [
    /* ---- scene 1: distance ---- */
    {
      id: 'd-1', scene: 'dist', start: 0, end: 8,
      caption: 'Distance is the fewest edges on a path between two vertices, not the shortest straight line.',
      detail: 'Distance is defined on the edges, so it is a count, and it is a minimum over all paths. Two vertices in different components have no distance at all.',
      narration: 'Distance between two vertices is the fewest edges on any path between them. It is a count, and it is a minimum over all the paths.',
      keyword: 'fewest edges',
      trap: 'Measuring distance along the drawn line instead of along the edges. A long edge is one step; two short edges are two steps.'
    },
    {
      id: 'd-2', scene: 'dist', start: 8, end: 16,
      caption: 'Breadth-first search from vertex 0 labels every vertex with that count: 0, then 1, then 2, then 3, then 4.',
      detail: 'BFS expands in layers, so the layer a vertex lands in is its distance from the source. Nothing else in this lesson needs an algorithm: one BFS per vertex fills the table.',
      narration: 'Breadth-first search from vertex zero labels each vertex with its distance. It expands in layers, so the layer is the distance.',
      keyword: 'BFS in layers',
      trap: 'Reading distances off a depth-first search. A DFS tree is deeper than necessary, so its depths are not distances.'
    },
    {
      id: 'd-3', scene: 'dist', start: 16, end: 23,
      caption: 'The drawing misleads: vertex 6 looks close to vertex 0 and is four edges away.',
      detail: 'Vertex 6 sits near vertex 0 on the canvas and is reached by 0-1-2-5-6, which is four edges. Position on the page carries no information.',
      narration: 'The picture misleads. Vertex six looks close to vertex zero and is four edges away, because the route goes back through the middle.',
      keyword: 'four edges away',
      trap: 'Trusting the drawing. Every figure in this lesson is computed from the edge list, and the drawing only shows that list.'
    },
    {
      id: 'd-4', scene: 'dist', start: 23, end: 30,
      caption: 'Everything in this lesson is read from one table of these counts.',
      detail: 'Seven vertices give a seven by seven table. Its diagonal is zero, it is symmetric, and each entry is a whole number or a dash for unreachable.',
      narration: 'Everything in this lesson is read from one table of these counts. Seven vertices, seven rows, and the diagonal is zero.',
      keyword: 'one table',
      trap: 'Forgetting the diagonal. Distance from a vertex to itself is zero, and that zero is an entry when a row maximum is taken.'
    },

    /* ---- scene 2: eccentricity ---- */
    {
      id: 'e-1', scene: 'ecc', start: 30, end: 38,
      caption: 'The eccentricity of a vertex is the largest entry in its own row: its distance to the farthest vertex.',
      detail: 'Written e(v) = max over u of d(v,u). The word eccentricity here has nothing to do with the everyday sense; it is a worst-case distance.',
      narration: 'The eccentricity of a vertex is the largest number in its own row. It is the distance to the farthest vertex.',
      keyword: 'largest entry in its row',
      trap: 'Taking the average of a row. Eccentricity is a maximum; the average is a different quantity and answers no exam question here.'
    },
    {
      id: 'e-2', scene: 'ecc', start: 38, end: 46,
      caption: 'Row 0 reads 0 1 2 3 4 3 4, so the eccentricity of vertex 0 is 4.',
      detail: 'Vertex 0 reaches 4 and 6 at distance 4 and everything else nearer. The maximum is 4, so e(0) = 4.',
      narration: 'Row zero reads nought, one, two, three, four, three, four. Its largest entry is four, so the eccentricity of vertex zero is four.',
      keyword: 'eccentricity of vertex 0 is 4',
      trap: 'Counting the vertex itself as one step. The diagonal zero is not a step, and the count starts at zero.'
    },
    {
      id: 'e-3', scene: 'ecc', start: 46, end: 54,
      caption: 'Row 2 reads 2 1 0 1 2 1 2, so the eccentricity of vertex 2 is 2 — it is never more than two edges from anything.',
      detail: 'Vertex 2 is the middle of the tree, and its whole row is at most 2. Compare row 0, whose maximum is 4.',
      narration: 'Row two reads two, one, nought, one, two, one, two. Its largest entry is two. Vertex two is never more than two edges from anything.',
      keyword: 'never more than two edges',
      trap: 'Assuming the middle of the drawing has the smallest eccentricity. Here it does, but the drawing is not the argument.'
    },
    {
      id: 'e-4', scene: 'ecc', start: 54, end: 60,
      caption: 'Eccentricity is a worst case taken from one vertex. Every vertex has one.',
      detail: 'A leaf usually has a large eccentricity and a centre vertex a small one, but neither is a rule: in a complete graph every vertex has eccentricity 1.',
      narration: 'Eccentricity is a worst case taken from one vertex, and every vertex of a connected graph has one.',
      keyword: 'a worst case from one vertex',
      trap: 'Believing leaves are always the farthest-apart pair. In a star the two leaves are two apart while the hub is one from everything.'
    },

    /* ---- scene 3: the four numbers ---- */
    {
      id: 'f-1', scene: 'four', start: 60, end: 68,
      caption: 'Read the seven eccentricities as one list: 4, 3, 2, 3, 4, 3, 4.',
      detail: 'One number per vertex. The four graph quantities are all read from this list, and none of them needs anything else.',
      narration: 'Read the seven eccentricities as one list: four, three, two, three, four, three, four.',
      keyword: 'one list',
      trap: 'Treating the list as a multiset to be summarised by its mean. The mean of these seven numbers is not a graph quantity.'
    },
    {
      id: 'f-2', scene: 'four', start: 68, end: 76,
      caption: 'The largest is the diameter, 4. The smallest is the radius, 2.',
      detail: 'Diameter = max of the eccentricities = 4. Radius = min of the eccentricities = 2. Both are attained, so both are exact, not bounds.',
      narration: 'The largest is the diameter, four. The smallest is the radius, two.',
      keyword: 'largest diameter, smallest radius',
      trap: 'Swapping them. Diameter is the maximum and radius the minimum, and a radius larger than the diameter is impossible.'
    },
    {
      id: 'f-3', scene: 'four', start: 76, end: 84,
      caption: 'The vertices attaining the radius form the centre — here only vertex 2. Those attaining the diameter form the periphery: 0, 4 and 6.',
      detail: 'Centre = vertices with eccentricity equal to the radius. Periphery = vertices with eccentricity equal to the diameter. Both are sets, and both can hold several vertices.',
      narration: 'The vertices that attain the radius form the centre, which here is only vertex two. Those that attain the diameter form the periphery: zero, four and six.',
      keyword: 'centre and periphery are sets',
      trap: 'Answering with one vertex when the centre has two. A tree with an odd diameter always has two.'
    },
    {
      id: 'f-4', scene: 'four', start: 84, end: 90,
      caption: 'Four numbers from one list. Radius is a minimum, diameter a maximum, and neither is an average.',
      detail: 'Eccentricity is per vertex; radius, diameter, centre and periphery are per graph. The per-vertex object is what gets computed, and the rest is reading.',
      narration: 'Four numbers from one list. Radius is a minimum, diameter a maximum, and neither of them is an average.',
      keyword: 'neither is an average',
      trap: 'Reporting the mean eccentricity. It is a legitimate quantity, but it is not the radius and no GATE question asks for it.'
    },

    /* ---- scene 4: the bounds ---- */
    {
      id: 'b-1', scene: 'bounds', start: 90, end: 98,
      caption: 'For any connected graph, the radius is at least half the diameter and at most the diameter.',
      detail: 'In symbols, ceil(d/2) <= r <= d. The ceiling is needed because both quantities are whole numbers and the diameter can be odd.',
      narration: 'For any connected graph the radius is at least half the diameter, rounded up, and at most the diameter itself.',
      keyword: 'at least half, at most all',
      trap: 'Dropping the ceiling. With diameter 5 the floor of half is 2, and a radius of 2 is impossible.'
    },
    {
      id: 'b-2', scene: 'bounds', start: 98, end: 106,
      caption: 'The lower bound: two vertices at distance d are each within r of a centre vertex, so d is at most 2r.',
      detail: 'Take a centre c and a diameter pair u,v. Then d = d(u,v) <= d(u,c) + d(c,v) <= r + r. The inequality is the triangle inequality, and the two inner distances are bounded because r is the largest distance from c.',
      narration: 'Take a centre vertex and a pair at the diameter apart. Each is within the radius of the centre, so by the triangle inequality the diameter is at most twice the radius.',
      keyword: 'triangle inequality',
      trap: 'Using a vertex that is not a centre. The bound uses the minimum eccentricity, so a peripheral vertex proves nothing.'
    },
    {
      id: 'b-3', scene: 'bounds', start: 106, end: 114,
      caption: 'The upper bound is attained: a six-cycle has diameter 3 and radius 3, and every vertex is in its centre.',
      detail: 'In C6 every vertex has eccentricity 3, so radius equals diameter. Compare the six-vertex path, whose radius is 3 against a diameter of 5: the floor is reached there instead.',
      narration: 'The upper bound is reached: a six-cycle has diameter three and radius three, and all six vertices are in the centre.',
      keyword: 'radius equals diameter',
      trap: 'Thinking radius and diameter must differ. They coincide whenever every vertex is equally far from the worst case.'
    },
    {
      id: 'b-4', scene: 'bounds', start: 114, end: 120,
      caption: 'A graph whose radius equals its diameter is called self-centred. Cycles and complete graphs are.',
      detail: 'Self-centred means every vertex has the same eccentricity, so the centre is the whole vertex set. The Petersen graph is the standard small example, and it is computed on this page.',
      narration: 'A graph whose radius equals its diameter is called self-centred, and cycles and complete graphs are the standard examples.',
      keyword: 'self-centred',
      trap: 'Assuming a self-centred graph is rare. Every cycle and every complete graph is one, so it is the common case in small examples.'
    },

    /* ---- scene 5: trees ---- */
    {
      id: 't-1', scene: 'tree', start: 120, end: 128,
      caption: 'On a tree the floor is always reached: the radius equals half the diameter, rounded up.',
      detail: 'For a tree, r = ceil(d/2). The reason is that a tree has exactly one path between any two vertices, so a diameter path is also a shortest path and the middle of it serves everything.',
      narration: 'On a tree the floor is always reached. The radius is exactly half the diameter, rounded up.',
      keyword: 'on a tree, exactly half',
      trap: 'Applying this to a graph with a cycle. A four-cycle has diameter 2 and radius 2, not 1.'
    },
    {
      id: 't-2', scene: 'tree', start: 128, end: 136,
      caption: 'So an odd diameter forces two adjacent centre vertices, and an even diameter forces exactly one.',
      detail: 'A diameter path of d edges has d+1 vertices. Taking its middle leaves one vertex when d is even and two adjacent ones when d is odd. No other vertex can be in the centre.',
      narration: 'An odd diameter forces two centre vertices, and they are adjacent. An even diameter forces exactly one.',
      keyword: 'one or two adjacent',
      trap: 'Believing the two centre vertices can be far apart. They are always joined by an edge, so the centre is either a single vertex or one edge.'
    },
    {
      id: 't-3', scene: 'tree', start: 136, end: 144,
      caption: 'All 18248 labelled trees on 2 to 7 vertices were checked here: no exception, and every two-vertex centre is an edge.',
      detail: 'The page enumerates every labelled tree through its Prufer sequence, builds the distance table, and re-checks four properties: r = ceil(d/2); the centre has one or two vertices; two centres are adjacent; the centre is the middle of a diameter path.',
      narration: 'Every labelled tree on two to seven vertices was checked on this page: eighteen thousand two hundred and forty-eight of them, and not one exception.',
      keyword: 'no exception',
      trap: 'Treating a check over small trees as a proof. It is evidence, and the proof is the argument about the middle of a diameter path.'
    },
    {
      id: 't-4', scene: 'tree', start: 144, end: 150,
      caption: 'The centre is also the middle of any diameter path. That is a tree fact, and it fails on general graphs.',
      detail: 'On a tree, every diameter path passes through the centre. The next scenes show a five-vertex graph where a centre vertex lies on no diameter path at all.',
      narration: 'The centre is also the middle of any diameter path, which is a tree fact. On a general graph it fails, and the next scene shows how.',
      keyword: 'a tree fact',
      trap: 'Finding the centre by taking the middle of a longest path in a graph with cycles. It can give a vertex that is not in the centre.'
    },

    /* ---- scene 6: peeling ---- */
    {
      id: 'p-1', scene: 'peel', start: 150, end: 158,
      caption: 'Peeling finds the centre with no distance table: remove every leaf, then repeat on what is left.',
      detail: 'A leaf is a vertex of degree one. Removing all leaves at once is one round. Stop when one or two vertices remain; those are the centre.',
      narration: 'Peeling finds the centre without any distance table. Remove every leaf, then repeat on what is left.',
      keyword: 'remove every leaf',
      trap: 'Removing leaves one at a time. Whole rounds matter: a round removes the same distance from every side at once.'
    },
    {
      id: 'p-2', scene: 'peel', start: 158, end: 166,
      caption: 'On the eight-vertex path the first round removes both ends, and three rounds leave vertices 3 and 4.',
      detail: 'Round 1 removes 0 and 7, round 2 removes 1 and 6, round 3 removes 2 and 5, and the two that remain, 3 and 4, are the centre. The path has eight vertices and a diameter of 7, so its radius is 4.',
      narration: 'On the eight-vertex path the first round removes both ends. Three rounds leave vertices three and four, which are the two centres.',
      keyword: 'three rounds',
      trap: 'Stopping as soon as one vertex has degree at most one. Several vertices reach degree one in the same round, and all must go together.'
    },
    {
      id: 'p-3', scene: 'peel', start: 166, end: 174,
      caption: 'The same rule on the seven-vertex tree leaves the single vertex 2, in two rounds.',
      detail: 'Round 1 removes the three leaves 0, 4 and 6; round 2 removes 1, 3 and 5, and vertex 2 is left alone. The distance table gave vertex 2 the eccentricity 2, which is the radius.',
      narration: 'The same rule on the seven-vertex tree removes three leaves, then three more, and leaves the single vertex two, which is what the distance table said.',
      keyword: 'leaves vertex 2',
      trap: 'Reporting the round count as the radius. The eight-vertex path takes three rounds and its radius is four, so the two numbers are not the same.'
    },
    {
      id: 'p-4', scene: 'peel', start: 174, end: 180,
      caption: 'One pass over the edges, so linear time: no all-pairs table is built.',
      detail: 'Each vertex enters the queue once and each edge is examined twice, so the cost is proportional to the number of vertices and edges. Building the table instead costs one search per vertex.',
      narration: 'The peel is one pass over the edges, so its cost is linear. No table of all pairs is ever built.',
      keyword: 'linear time',
      trap: 'Claiming linear time for the distance-table method. One search per vertex is quadratic on a dense graph.'
    },

    /* ---- scene 7: two sweeps ---- */
    {
      id: 'w-1', scene: 'twobfs', start: 180, end: 188,
      caption: 'A diameter can be found with two searches: sweep from any vertex, then sweep from the farthest one reached.',
      detail: 'The first search finds a vertex at maximum distance from an arbitrary start; the second finds a vertex at maximum distance from that one. The distance between them is reported as the diameter.',
      narration: 'A diameter can be found with two breadth-first searches. Sweep from any vertex, then sweep from the farthest vertex the first sweep reached.',
      keyword: 'two sweeps',
      trap: 'Believing this works on every graph. It is a theorem about trees and about weighted trees, not about graphs in general.'
    },
    {
      id: 'w-2', scene: 'twobfs', start: 188, end: 196,
      caption: 'On every one of the 18248 trees the two sweeps return the true diameter.',
      detail: 'The page runs the double sweep on each enumerated tree and compares the answer with the diameter computed from the full distance table. All 18248 agree.',
      narration: 'On every one of the eighteen thousand two hundred and forty-eight trees, the two sweeps return the true diameter.',
      keyword: 'all 18248 agree',
      trap: 'Concluding from the tree case that the method is general. The next caption is the counterexample.'
    },
    {
      id: 'w-3', scene: 'twobfs', start: 196, end: 204,
      caption: 'On the diamond — four vertices, five edges — it returns 1 where the diameter is 2.',
      detail: 'The diamond is the complete graph on four vertices with one edge removed. Its eccentricities are 1, 1, 2, 2, so the radius is 1 and the diameter 2. The two sweeps report 1.',
      narration: 'On the diamond, four vertices and five edges, the two sweeps report one where the diameter is two.',
      keyword: 'reports 1, diameter is 2',
      trap: 'Using two sweeps on a graph with cycles and trusting the number. It is a lower bound on the diameter in general, not the diameter.'
    },
    {
      id: 'w-4', scene: 'twobfs', start: 204, end: 210,
      caption: 'Sweep from 0 reaches 1 first, and 1 is one step from 0. The far pair, 2 and 3, is never visited as a start.',
      detail: 'The first sweep from 0 finds vertices 1, 2 and 3 all at distance 1 and takes the first of them, vertex 1. The second sweep from 1 again finds only distance 1. The diameter pair 2 and 3 is at distance 2 and is missed.',
      narration: 'Sweep from zero and the farthest vertex is one, because it is one step away and the tie is broken by order. Sweep from one and again the answer is one. The pair two and three, two apart, is never used as a start.',
      keyword: 'the tie is broken by order',
      trap: 'Thinking the failure comes from a tie in distance. The real cause is that a start vertex need not be a diameter endpoint.'
    },

    /* ---- scene 8: limits ---- */
    {
      id: 'l-1', scene: 'limits', start: 210, end: 218,
      caption: 'First limit: on a general graph a centre vertex need not lie on any diameter path.',
      detail: 'On a tree the centre is the middle of every diameter path. With cycles present a vertex can be central and still be off every longest path.',
      narration: 'First limit: on a general graph, a centre vertex need not lie on any diameter path.',
      keyword: 'off every diameter path',
      trap: 'Finding a centre by taking the middle of a longest path in a cyclic graph. It can return a vertex that is not in the centre.'
    },
    {
      id: 'l-2', scene: 'limits', start: 218, end: 226,
      caption: 'In this five-vertex graph the diameter is 3 and the radius 2, and vertex 2 is in the centre but on no diameter path.',
      detail: 'The eccentricities are 2, 2, 2, 3, 3. The only pair at distance 3 is 3 and 4, and every shortest path between them runs 3-1-0-4, which avoids vertex 2. Vertex 2 is nonetheless within 2 of everything.',
      narration: 'Here the diameter is three and the radius two. Vertex two is in the centre, yet every path of length three goes around it.',
      keyword: 'in the centre, off the path',
      trap: 'Concluding that the centre is empty of diameter endpoints. Here two of the three centre vertices are endpoints of no diameter either.'
    },
    {
      id: 'l-3', scene: 'limits', start: 226, end: 234,
      caption: 'Second limit: a disconnected graph has no finite eccentricity, so it has no radius and no diameter.',
      detail: 'If some vertex is unreachable the maximum over distances is taken over an empty or infinite set, and the answer is not a number. Two components are sometimes handled by defining the diameter as infinite, which is a convention and must be stated.',
      narration: 'Second limit: a disconnected graph has no finite eccentricity at all, so it has no radius and no diameter.',
      keyword: 'no finite eccentricity',
      trap: 'Adding the two component diameters, or taking their maximum without saying so. A sum is not a distance: no path joins the components.'
    },
    {
      id: 'l-4', scene: 'limits', start: 234, end: 240,
      caption: 'Third limit: centre, centroid and median are three different vertices. Here the centre is 3 and 4; the centroid and the median are only 3.',
      detail: 'The centre minimises the largest distance; the centroid minimises the largest remaining component; the median minimises the sum of distances. On this seven-vertex pan graph all three answers differ.',
      narration: 'Third limit: centre, centroid and median are three different vertices. On this graph the centre is three and four, while the centroid and the median are only three.',
      keyword: 'three different vertices',
      trap: 'Answering a centre question with the centroid. The two agree often enough on small examples to hide the difference.'
    },

    /* ---- scene 9: previous-year questions ---- */
    {
      id: 'q-1', scene: 'pyq', start: 240, end: 248,
      caption: 'GATE CSE 2025 Set 1, Q43: a 100-vertex graph with diameter 30, and any breadth-first-search tree of it.',
      detail: 'The question asks what must be true of the height of any BFS tree of such a graph. The 100 vertices matter only as a size; the diameter is the whole input.',
      narration: 'GATE CSE 2025, Set one, question forty-three. A graph on a hundred vertices with diameter thirty, and any breadth-first-search tree of it.',
      keyword: 'diameter 30',
      trap: 'Trying to build such a graph. The question quantifies over every graph with diameter 30, so one example cannot answer it.'
    },
    {
      id: 'q-2', scene: 'pyq', start: 248, end: 256,
      caption: 'The height of a BFS tree is the eccentricity of its root, and the diameter is at most twice any eccentricity — so the height is at least 15.',
      detail: 'For any root r and any pair u,v, d(u,v) <= d(u,r) + d(r,v) <= 2 e(r). So 30 <= 2 e(r) and e(r) >= 15. The answer is that the height is at least 15, not exactly 15.',
      narration: 'The height of a BFS tree is the eccentricity of its root. The diameter is at most twice any eccentricity, so thirty is at most twice the height, and the height is at least fifteen.',
      keyword: 'at least 15',
      trap: 'Answering exactly 15. A root that is not central gives a height of up to 30, so only the lower bound is forced.'
    },
    {
      id: 'q-3', scene: 'pyq', start: 256, end: 264,
      caption: 'GATE CSE 2021 Set 1, Q20: add an edge between every pair at distance two. The diameter becomes half the old one, rounded up.',
      detail: 'The new graph is the square of the old one. Walking a diameter path in steps of two shows the new diameter is at most ceil(d/2); expanding each new edge into at most two old ones shows it is at least that. The page checks equality on all 27475 connected graphs with at most six vertices.',
      narration: 'GATE CSE 2021, Set one, question twenty. Join every pair at distance two, and the diameter becomes half the old one rounded up, so the correct option is the upper bound by the ceiling.',
      keyword: 'half, rounded up',
      trap: 'Choosing the option that says the diameter strictly grows. Squaring a graph can only shorten distances, never lengthen them.'
    },
    {
      id: 'q-4', scene: 'pyq', start: 264, end: 270,
      caption: 'Both answers were recomputed here on the page\'s own graphs, not copied from a key.',
      detail: 'The 2025 answer is the inequality above with 30 substituted. The 2021 answer is checked as an equality on every connected graph up to six vertices, and the two numbers 15 and 3 appear on the canvas from that computation.',
      narration: 'Both answers are recomputed on this page from the definitions, rather than copied from an answer key.',
      keyword: 'recomputed, not copied',
      trap: 'Quoting a community answer without checking it. The inequality is two lines of algebra and can be verified in the exam.'
    },

    /* ---- scene 10: procedure ---- */
    {
      id: 'r-1', scene: 'proc', start: 270, end: 278,
      caption: 'One procedure: build the distance table, read each row maximum, then take the smallest and the largest.',
      detail: 'The table costs one search per vertex. The row maxima are the eccentricities, and the two extreme values plus their arg-sets are the four quantities.',
      narration: 'One procedure. Build the distance table, read each row maximum, then take the smallest and the largest of those maxima.',
      keyword: 'row maximum, then extremes',
      trap: 'Computing the radius before the diameter, or the other way round. One table gives both, and doing it twice invites a transcription error.'
    },
    {
      id: 'r-2', scene: 'proc', start: 278, end: 286,
      caption: 'If the graph is a tree, skip the table: peel leaves until one or two remain, and take half the diameter rounded up.',
      detail: 'Peeling is linear and gives the centre exactly. The radius then follows as ceil(d/2), and the diameter is the round count doubled, or the round count doubled minus one for a two-vertex centre.',
      narration: 'If the graph is a tree, skip the table. Peel leaves until one or two remain, and the radius is half the diameter rounded up.',
      keyword: 'skip the table',
      trap: 'Peeling a graph that is not a tree. On a cycle no vertex has degree one, so the peel never starts.'
    },
    {
      id: 'r-3', scene: 'proc', start: 286, end: 293,
      caption: 'Traps one and two: halving the diameter on a graph with a cycle, and assuming the centre lies on a diameter path.',
      detail: 'The first trap is the four-cycle, diameter 2 and radius 2. The second is the five-vertex graph whose centre vertex 2 is on no diameter path.',
      narration: 'Trap one: halving the diameter on a graph that is not a tree. Trap two: assuming the centre lies on a diameter path.',
      keyword: 'not on a tree, not on a path',
      trap: 'Both traps give numbers that appear among the options, so a quick check does not catch them.'
    },
    {
      id: 'r-4', scene: 'proc', start: 293, end: 300,
      caption: 'Traps three to five: a leaf\'s eccentricity is not the height, two sweeps are not general, and a disconnected graph has none.',
      detail: 'A leaf can be far from the root and near the far end of a long branch. Two sweeps are correct on trees and give only a lower bound elsewhere. A disconnected graph has no finite eccentricity, so no radius and no diameter.',
      narration: 'Three more. A leaf is not necessarily the farthest vertex from the root. Two sweeps are not general. And a disconnected graph has no eccentricity at all.',
      keyword: 'the last three traps',
      trap: 'Reporting a number for a disconnected graph. Say that it has none, or state the convention being used.'
    }
  ]
};
