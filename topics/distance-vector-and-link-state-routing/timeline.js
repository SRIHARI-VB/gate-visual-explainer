/* ==========================================================================
   distance-vector-and-link-state-routing — THE timeline.
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
      id: 'problem',
      n: 1,
      title: 'Routing: two ways to know the way',
      start: 0, end: 30,
      objective: 'Separate forwarding from routing, and see that the two routing families differ in what a router is allowed to know.'
    },
    {
      id: 'bellman',
      n: 2,
      title: 'The Bellman-Ford equation, on GATE 2021 numbers',
      start: 30, end: 60,
      objective: 'Compute a distance-vector update from three neighbour vectors, and read off the cost and the next hop as two separate answers.'
    },
    {
      id: 'exchange',
      n: 3,
      title: 'One round of exchange: GATE 2011, both questions',
      start: 60, end: 90,
      objective: 'Recompute one node vector from its neighbours alone, then watch a link failure raise a cost even though a shorter path exists.'
    },
    {
      id: 'counttoinf',
      n: 4,
      title: 'Count to infinity: why a dead route stays alive',
      start: 90, end: 120,
      objective: 'Follow the climbing costs of a two-router loop, and see why RIP defines 16 as infinity instead of a very large number.'
    },
    {
      id: 'fixes',
      n: 5,
      title: 'Split horizon, poison reverse, and what they do not fix',
      start: 120, end: 150,
      objective: 'State each repair as a rule about what may be advertised, then watch the three-router case that survives all of them.'
    },
    {
      id: 'lsa',
      n: 6,
      title: 'Link state: flood the truth, then compute locally',
      start: 150, end: 180,
      objective: 'See why an identical map at every router removes the loop, and what that consistency costs in messages.'
    },
    {
      id: 'dijkstra',
      n: 7,
      title: "Dijkstra on six routers, one greedy step at a time",
      start: 180, end: 210,
      objective: 'Run the extract-min and relax steps, and see which assumption the greedy choice depends on.'
    },
    {
      id: 'tables',
      n: 8,
      title: 'From shortest-path tree to routing table',
      start: 210, end: 240,
      objective: 'Convert a tree into next hops, then check that distance vector converged to the same numbers on the same graph.'
    },
    {
      id: 'protocols',
      n: 9,
      title: 'RIP and OSPF: the facts GATE asks for',
      start: 240, end: 270,
      objective: 'Fix the protocol facts that decide the one-mark questions: algorithm, metric, transport, limit, scope.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The procedure, and the traps that cost marks',
      start: 270, end: 300,
      objective: 'Fix a five-step routine that covers every question shape in this clause.'
    }
  ],

  events: [
    /* ---------------- scene 1: the problem ---------------- */
    {
      id: 'problem-1', scene: 'problem', start: 0, end: 7.5,
      caption: 'A router does one small thing per packet: look up the destination and send it to one neighbour.',
      detail: 'Forwarding is per packet and local: consult the table, take the next hop, move on. A routing table is therefore just a map from destination to next hop, with a cost beside it.',
      narration: 'A router does one small thing for every packet. It looks the destination up in a table and sends the packet to one neighbour. That is forwarding, and the table it reads is a list of destinations, each with a next hop and a cost.',
      keyword: 'next hop',
      trap: 'The table stores the next hop, not the whole path. A router usually does not know the full route the packet will follow.'
    },
    {
      id: 'problem-2', scene: 'problem', start: 7.5, end: 15,
      caption: 'Building that table is routing, and there are two honest ways to do it.',
      detail: 'One way is to ask the neighbours what they believe and combine the answers. The other is to collect every link in the network and compute on the whole map. These are distance vector and link state.',
      narration: 'Building the table is a different job, called routing. There are two honest ways to do it. You can ask your neighbours what they believe and combine their answers, or you can collect every link in the network and compute on the whole map.',
      keyword: 'routing versus forwarding',
      trap: 'Routing and forwarding are different words. A question that says routing is asking how the table was built; forwarding is asking how one packet is handled.'
    },
    {
      id: 'problem-3', scene: 'problem', start: 15, end: 22.5,
      caption: 'Distance vector knows only its neighbours. Link state knows the whole graph.',
      detail: 'That single difference explains every later contrast: convergence speed, message volume, memory, and whether a routing loop is possible at all.',
      narration: 'So the difference is knowledge. A distance vector router knows only what its neighbours tell it. A link state router knows the whole graph. Everything else follows from that: how fast they converge, how many messages they send, how much memory they need, and whether they can form a loop.',
      keyword: 'local versus global knowledge',
      trap: 'A distance vector router is not given a copy of the graph and then restricted. It genuinely never sees one.'
    },
    {
      id: 'problem-4', scene: 'problem', start: 22.5, end: 30,
      caption: 'Distance vector runs Bellman-Ford. Link state runs Dijkstra.',
      detail: 'GATE CSE 2025 Set 2 asks exactly this matching as a one-mark question, so it is worth having as a reflex rather than a derivation.',
      narration: 'The algorithm follows from the knowledge. Distance vector is the distributed Bellman-Ford equation. Link state is Dijkstra on a map every router holds. GATE 2025 Set 2 asked this matching for one mark.',
      keyword: 'Bellman-Ford and Dijkstra',
      trap: 'Dijkstra needs the whole graph. A router that only has neighbour vectors cannot run it, which is why the pairing is not a matter of taste.'
    },

    /* ---------------- scene 2: the Bellman-Ford equation ---------------- */
    {
      id: 'bellman-1', scene: 'bellman', start: 30, end: 37.5,
      caption: 'The whole of distance vector is one line: the best route through any neighbour.',
      detail: 'D of x to y is the minimum over neighbours v of the link cost c of x to v plus the distance v reports to y. Every router applies this to every destination, using only numbers its neighbours sent.',
      narration: 'The whole of distance vector is one line. The distance from x to y is the smallest, over all neighbours v, of the cost of the link from x to v plus the distance that v reports to y. That is the Bellman-Ford equation.',
      keyword: 'Bellman-Ford equation',
      trap: 'The minimisation is over neighbours, not over all routers. x never uses a number from a router it cannot reach directly.'
    },
    {
      id: 'bellman-2', scene: 'bellman', start: 37.5, end: 45,
      caption: 'GATE CSE 2021 Set 2 gives R three neighbours and asks for its new table.',
      detail: 'R sits 3, 2 and 5 from X, Y and Z. The vectors say P is 7, 6 and 5 away from X, Y and Z. So the three candidate costs to P are 10, 8 and 10.',
      narration: 'GATE 2021 Set 2 gives router R three neighbours at distance three, two and five. Their vectors say router P is seven, six and five away. So the three candidate costs to P are ten, eight and ten.',
      keyword: 'three candidate sums',
      trap: 'Add the link cost first, then compare. Comparing the neighbour vectors before adding gives the wrong minimum.'
    },
    {
      id: 'bellman-3', scene: 'bellman', start: 45, end: 52.5,
      caption: 'Eight is the cost, and it came through Y, so Y is the next hop.',
      detail: 'Cost and next hop are two answers from one computation: the minimum value and the neighbour that achieved it. Option A of that question says 10, which is a candidate, not the minimum.',
      narration: 'Eight is the cost, and it was achieved through Y, so Y becomes the next hop. One computation gives two answers: the value, and which neighbour produced it. The 2021 option that says ten is quoting a candidate, not the minimum.',
      keyword: 'value and argmin',
      trap: 'A question can ask for the cost, the next hop, or both. Answering the one that was not asked scores zero.'
    },
    {
      id: 'bellman-4', scene: 'bellman', start: 52.5, end: 60,
      caption: 'For Q the three sums are 7, 8 and 13, so the cost is 7 through X.',
      detail: 'Two destinations, two different next hops, from the same three neighbour vectors. This is why a distance vector is a row, not a single number.',
      narration: 'For router Q the same three neighbours give seven, eight and thirteen, so the cost is seven through X. Two destinations, two different next hops, from the same three vectors. That is why a distance vector is a whole row of numbers.',
      keyword: 'two destinations, two next hops',
      trap: 'Do not carry the next hop from one destination to another. Each column of the vector has its own argmin.'
    },

    /* ---------------- scene 3: one round of exchange ---------------- */
    {
      id: 'exchange-1', scene: 'exchange', start: 60, end: 67.5,
      caption: 'GATE CSE 2011 gives five stabilised vectors and then changes one link.',
      detail: 'Five routers, each with a row of five numbers. The rows are consistent with a graph whose links can be read off: the smallest nonzero entries are the direct links.',
      narration: 'GATE 2011 gives five routers with stabilised vectors, five numbers each, and then changes one link cost. The rows are consistent with a graph, and the direct links are visible as the smallest nonzero entries in each row.',
      keyword: 'stabilised vectors',
      trap: 'A stabilised vector is a fixed point: recomputing it from its neighbours reproduces it exactly. The page checks that property on all five rows.'
    },
    {
      id: 'exchange-2', scene: 'exchange', start: 67.5, end: 75,
      caption: 'The link N2 to N3 drops to 2. N3 keeps only its neighbours N2, N4 and N5.',
      detail: 'N3 recomputes each column as a minimum over exactly those three routers, using the vectors as they stood before this round. No other router contributes.',
      narration: 'The cost of the link between N2 and N3 drops to two. N3 recomputes each column using only its own neighbours, N2, N4 and N5, and using their vectors as they stood before the round.',
      keyword: 'recompute from neighbours only',
      trap: 'Using the updated N2 vector inside the same round is the standard mistake. One round means one pass over the previous vectors.'
    },
    {
      id: 'exchange-3', scene: 'exchange', start: 75, end: 82.5,
      caption: 'The new row at N3 is 3, 2, 0, 2, 5 — option A of GATE CSE 2011.',
      detail: 'To N1 the candidates are 2 plus 1 and 2 plus 8, so 3. To N5 they are 2 plus 3 and 2 plus 4, so 5. Every entry is a minimum over three neighbours.',
      narration: 'The new row at N3 is three, two, zero, two, five, which is option A of that question. To N1 the candidates are three and ten, so three. To N5 they are five and six, so five.',
      keyword: '3, 2, 0, 2, 5',
      trap: 'The zero stays zero. A router is always at distance zero from itself, and no neighbour can improve on that.'
    },
    {
      id: 'exchange-4', scene: 'exchange', start: 82.5, end: 90,
      caption: 'Then N1 to N2 fails, and the next round gives N3 a cost of 10 to N1.',
      detail: 'N2 reports infinity, N4 still reports 8, so the minimum is 2 plus 8. The true shortest path after the failure is 9 through N5, which the algorithm reaches only in a later round.',
      narration: 'Then the link from N1 to N2 fails. N2 reports infinity to N1, N4 still reports eight, so N3 records two plus eight, which is ten. The true shortest path after the failure is nine, through N5. The algorithm finds that in a later round, not this one.',
      keyword: 'one round is not convergence',
      trap: 'Ten is the correct answer to the question and the wrong value for the network. After one round the tables are still transient.'
    },

    /* ---------------- scene 4: count to infinity ---------------- */
    {
      id: 'counttoinf-1', scene: 'counttoinf', start: 90, end: 97.5,
      caption: 'A network hangs off B. A reaches it in 2, B in 1. Then that link dies.',
      detail: 'B notices immediately and sets its distance to infinity. A has not heard anything yet and still believes the destination is two hops away through B.',
      narration: 'A network hangs off router B. A reaches it in two hops, B in one. Then the link to the network dies. B notices at once and sets its distance to infinity. A has heard nothing yet, and still believes the destination is two hops away through B.',
      keyword: 'the failure is noticed by one router only',
      trap: 'The problem is not that the news is wrong. The problem is that it is late, and that B will believe A.'
    },
    {
      id: 'counttoinf-2', scene: 'counttoinf', start: 97.5, end: 105,
      caption: 'Before B can tell A, A advertises 2. B now believes 3 through A.',
      detail: 'B has no memory that the 2 it hears from A was itself the source of A that number. It adds its own link cost and accepts three.',
      narration: 'Before B can tell A, A advertises its distance of two. B adds its own link cost and now believes the destination is three away, through A. The number B hears was built from B own old value.',
      keyword: 'mutual belief',
      trap: 'Nothing in the message says where the route originally came from. That missing provenance is the whole cause.'
    },
    {
      id: 'counttoinf-3', scene: 'counttoinf', start: 105, end: 112.5,
      caption: 'Then A hears 3 and takes 4, B hears 4 and takes 5, and it climbs by one each time.',
      detail: 'The two routers keep handing each other an inflated number. The cost rises monotonically until something stops it, and no packet can reach the dead destination in the meantime.',
      narration: 'Then A hears three and takes four, B hears four and takes five, and the number climbs by one at every exchange. The two routers keep handing each other an inflated value. Nothing can stop it except a ceiling.',
      keyword: 'the climb',
      trap: 'The cost rises; it never corrects itself downwards. A packet sent during the climb loops between the two routers.'
    },
    {
      id: 'counttoinf-4', scene: 'counttoinf', start: 112.5, end: 120,
      caption: 'RIP makes 16 mean infinity, so the climb stops at 16 and the route dies.',
      detail: 'That ceiling is why RIP allows at most 15 hops: 16 is reserved for unreachable. A small ceiling shortens the agony, and also caps the size of network RIP can serve.',
      narration: 'RIP decides that sixteen means infinity. So the climb stops at sixteen and the route is finally declared dead. That is why RIP allows at most fifteen hops: sixteen is reserved for unreachable. A small ceiling makes the failure quick, and also limits the size of network RIP can serve.',
      keyword: '16 is infinity',
      trap: 'Sixteen is not a distance a RIP route can have. It is the value meaning no route, so fifteen hops is the largest usable path.'
    },

    /* ---------------- scene 5: the repairs ---------------- */
    {
      id: 'fixes-1', scene: 'fixes', start: 120, end: 127.5,
      caption: 'Split horizon: never advertise a route back out of the interface you learned it from.',
      detail: 'B learned the route through A, so B simply does not mention it to A. The two-router loop is then impossible, because neither side can offer the other its own belief.',
      narration: 'Split horizon is a rule about what may be advertised. Never advertise a route back out of the interface you learned it from. B learned this route through A, so B says nothing about it to A. The two-router loop becomes impossible.',
      keyword: 'split horizon',
      trap: 'Split horizon suppresses information. It does not correct it, and it can slow down legitimate re-learning.'
    },
    {
      id: 'fixes-2', scene: 'fixes', start: 127.5, end: 135,
      caption: 'Poison reverse says the same thing out loud: advertise it back, but as infinity.',
      detail: 'The route is mentioned with metric 16 instead of being omitted. Silence and a poisoned advertisement are equivalent in effect, and poison reverse removes the ambiguity of silence.',
      narration: 'Poison reverse says the same thing out loud. The route is advertised back, but with a metric of sixteen instead of being left out. Silence and a poisoned advertisement have the same effect; poison reverse just removes the ambiguity.',
      keyword: 'poison reverse',
      trap: 'Poison reverse is split horizon with a different encoding. They prevent the same class of loop, not two different classes.'
    },
    {
      id: 'fixes-3', scene: 'fixes', start: 135, end: 142.5,
      caption: 'Triggered updates and hold-down timers cut the delay that the loop feeds on.',
      detail: 'A triggered update sends the bad news at once rather than waiting for the next periodic timer. A hold-down refuses to believe good news about a route too soon after bad news.',
      narration: 'Two timers help. A triggered update sends the bad news immediately instead of waiting for the next periodic advertisement. A hold-down timer refuses to believe good news about a route for a while after bad news, which stops the inflated values being believed straight away.',
      keyword: 'triggered updates and hold-down',
      trap: 'These shorten the window; they do not remove the possibility. A loop can still form between the failure and the update arriving.'
    },
    {
      id: 'fixes-4', scene: 'fixes', start: 142.5, end: 150,
      caption: 'With three routers in a line, split horizon still loops: the page simulates it.',
      detail: 'A to B to C, with the destination on A. Split horizon silences B in both directions. A and C then flip between a finite cost and infinity, and the finite value keeps growing: no round ever settles. This is why GATE CSE 2014 Set 1 calls the claim that split horizon avoids persistent loops false.',
      narration: 'But take three routers in a line, with the destination hanging off the first. Split horizon silences the middle router in both directions. The two outer routers then flip between a finite cost and infinity, and the finite value keeps growing, so no round ever settles. The loop persists, and that is why GATE 2014 Set 1 marks the claim that split horizon avoids persistent loops as false.',
      keyword: 'the three-router counterexample',
      trap: 'Split horizon removes two-router loops. It does not remove loops that close through a third router.'
    },

    /* ---------------- scene 6: link state ---------------- */
    {
      id: 'lsa-1', scene: 'lsa', start: 150, end: 157.5,
      caption: 'A link state router describes only itself: its links and their costs.',
      detail: 'It does not report distances to anything. It reports adjacency and cost, which are facts it can verify locally rather than beliefs it has been told.',
      narration: 'A link state router describes only itself. It reports which neighbours it has and what each link costs. It does not report a distance to anything. Adjacency and cost are facts it can check itself, not beliefs it has been told.',
      keyword: 'link state advertisement',
      trap: 'A link state packet carries no distances. If a question shows a distance inside one, that is not a link state advertisement.'
    },
    {
      id: 'lsa-2', scene: 'lsa', start: 157.5, end: 165,
      caption: 'Those advertisements are flooded, so every router ends with the same map.',
      detail: 'The collected advertisements form the link state database. Because flooding is reliable and every router keeps the newest copy, the databases converge to one identical graph.',
      narration: 'Those advertisements are flooded to every router. Each router collects them into a database, and because flooding is reliable and each router keeps the newest copy, every database ends up describing the same graph.',
      keyword: 'identical link state database',
      trap: 'Identical is the point, not a side effect. Different maps at different routers would put the loop straight back.'
    },
    {
      id: 'lsa-3', scene: 'lsa', start: 165, end: 172.5,
      caption: 'Each router runs Dijkstra with itself as the root, on that same map.',
      detail: 'Two routers compute different trees from the same graph, and both are correct, because a shortest-path tree is rooted. The union of the trees is loop-free by construction.',
      narration: 'Each router then runs Dijkstra on that same map with itself as the root. Two routers get different trees from the same graph, and both are right, because the tree is rooted at the router. Because the trees come from one consistent map, the resulting paths are loop-free.',
      keyword: 'rooted shortest-path tree',
      trap: 'The trees differ; the map does not. A question asking whether all routers hold the same routing table is asking a different thing from whether they hold the same graph.'
    },
    {
      id: 'lsa-4', scene: 'lsa', start: 172.5, end: 180,
      caption: 'The price is messages: flooding costs more than telling your neighbours.',
      detail: 'Every router receives every advertisement, and every router runs a full shortest-path computation. That is why GATE CSE 2014 Set 1 says link state has the higher computational overhead, and why it converges faster.',
      narration: 'The price is communication and computation. Every router receives every advertisement, and every router runs a full shortest-path computation. That is why GATE 2014 Set 1 says link state has the higher computational overhead, and in the same question why it converges faster.',
      keyword: 'the cost of a global map',
      trap: 'Higher overhead and faster convergence are both true. Neither contradicts the other.'
    },

    /* ---------------- scene 7: Dijkstra ---------------- */
    {
      id: 'dijkstra-1', scene: 'dijkstra', start: 180, end: 187.5,
      caption: 'Dijkstra keeps a set of settled routers and a tentative cost for the rest.',
      detail: 'Start with only the source settled at cost zero. Every other cost begins as infinity, or as the direct link cost where a link exists.',
      narration: 'Dijkstra keeps two things. A set of routers whose cost is settled, and a tentative cost for everybody else. It starts with only the source settled, at cost zero.',
      keyword: 'settled set',
      trap: 'A settled cost is final. Later steps never revise it, which is exactly the claim that has to be justified.'
    },
    {
      id: 'dijkstra-2', scene: 'dijkstra', start: 187.5, end: 195,
      caption: 'Take the unsettled router with the smallest tentative cost, then relax its links.',
      detail: 'Relaxing means offering each neighbour the settled cost plus the link cost, and keeping whichever is smaller. The smallest tentative cost is chosen because no other route can beat it.',
      narration: 'Then repeat one step. Take the unsettled router with the smallest tentative cost, and settle it. Offer each of its neighbours the settled cost plus the link cost, and keep the smaller number. The smallest tentative cost is safe to settle because no other route can be cheaper.',
      keyword: 'extract minimum, then relax',
      trap: 'That safety argument needs non-negative link costs. With a negative link a later route could undercut a settled one.'
    },
    {
      id: 'dijkstra-3', scene: 'dijkstra', start: 195, end: 202.5,
      caption: 'On six routers the settled order is A, C, B, D, E, F with costs 0, 2, 3, 8, 10, 13.',
      detail: 'The order of settlement is non-decreasing in cost, which is the visible signature of a correct run. Any decrease in that column means an arithmetic slip.',
      narration: 'On the six-router graph the settled order is A, then C, then B, then D, then E, then F, with costs zero, two, three, eight, ten and thirteen. The settled costs never decrease, and that monotone column is a quick check that the run is right.',
      keyword: 'monotone settled costs',
      trap: 'The settlement order is not the alphabetical order and not the order of the drawing. It is the order of the tentative costs.'
    },
    {
      id: 'dijkstra-4', scene: 'dijkstra', start: 202.5, end: 210,
      caption: 'The result is a tree, and the tree is what a routing table is made from.',
      detail: 'Dijkstra produces one shortest path per destination, so the union of those paths is a tree rooted at the source. The tree stores the predecessor, and the predecessor chain gives the next hop.',
      narration: 'The result is a tree, not just a list of costs. One shortest path per destination, all rooted at the source. The tree records each predecessor, and following the chain back to the root gives the next hop.',
      keyword: 'shortest-path tree',
      trap: 'Equal-cost routes break the tree into a graph. The cost answer stays unique; the next hop may not.'
    },

    /* ---------------- scene 8: from tree to table ---------------- */
    {
      id: 'tables-1', scene: 'tables', start: 210, end: 217.5,
      caption: 'The next hop is the first step from the root along the tree, not the last.',
      detail: 'For a destination two steps down the tree, the routing table stores the child of the root, because that is the only router the source can hand the packet to.',
      narration: 'The next hop is the first step from the root along the tree, not the last. For a destination two steps down, the table stores the child of the root, because that is the only router the source can actually hand the packet to.',
      keyword: 'first step, not last',
      trap: 'Writing the destination itself, or the second router on the path, is the most common table-building error.'
    },
    {
      id: 'tables-2', scene: 'tables', start: 217.5, end: 225,
      caption: 'Distance vector, started from scratch on the same graph, reaches the same six numbers.',
      detail: 'The page runs the exchange until nothing changes and compares every entry with the Dijkstra distances. They agree, because both compute shortest paths in the same graph.',
      narration: 'Now run distance vector from scratch on the very same graph. Exchange until nothing changes. Every entry matches the Dijkstra distances, because both are computing shortest paths in the same graph.',
      keyword: 'same answer at convergence',
      trap: 'Agreement at convergence says nothing about agreement during convergence. The two families differ exactly there.'
    },
    {
      id: 'tables-3', scene: 'tables', start: 225, end: 232.5,
      caption: 'Both are checked against an independent all-pairs computation.',
      detail: 'A third method, the all-pairs dynamic programme, computes every distance without using either algorithm. The page compares both against it on four graphs and reports the count of passing checks.',
      narration: 'Both are checked against a third method: an all-pairs dynamic programme that uses neither algorithm. The page compares the two against it on four graphs and prints how many checks passed.',
      keyword: 'independent check',
      trap: 'Two algorithms agreeing is weak evidence if they share a bug. The third method is what makes the check worth something.'
    },
    {
      id: 'tables-4', scene: 'tables', start: 232.5, end: 240,
      caption: 'So the choice is never about the final answer. It is about knowledge, messages and time.',
      detail: 'Same distances, different machinery: neighbour-only messages versus flooding, slow convergence with possible loops versus fast convergence with a global map.',
      narration: 'So the choice between the two is never about the final distances. It is about what a router must know, how many messages that takes, and how long convergence lasts.',
      keyword: 'what actually differs',
      trap: 'A question that asks which protocol finds shorter paths has no correct option. Both find shortest paths.'
    },

    /* ---------------- scene 9: protocols ---------------- */
    {
      id: 'protocols-1', scene: 'protocols', start: 240, end: 247.5,
      caption: 'RIP is distance vector in hops, carried in UDP on port 520, capped at 15 hops.',
      detail: 'Every link counts one, sixteen means unreachable, updates are periodic, and a route not refreshed in time expires. The cap is the direct answer to count to infinity.',
      narration: 'RIP is distance vector with hop count as the metric. Every link costs one, fifteen is the largest usable distance and sixteen means unreachable. Its messages travel in UDP on port five hundred and twenty, and updates are periodic.',
      keyword: 'RIP facts',
      trap: 'RIP runs over UDP, not TCP, and not directly over IP. That is a one-mark fact and it is asked.'
    },
    {
      id: 'protocols-2', scene: 'protocols', start: 247.5, end: 255,
      caption: 'OSPF is link state with a cost metric, carried directly in IP protocol 89.',
      detail: 'It floods link state advertisements, refreshes them periodically, supports areas with a backbone, and runs Dijkstra. It is not carried in TCP or UDP at all.',
      narration: 'OSPF is link state. Its metric is a cost, its advertisements are flooded, and it runs Dijkstra. It is carried directly in IP using protocol number eighty-nine, not in TCP and not in UDP. It also supports areas, with one backbone area.',
      keyword: 'OSPF facts',
      trap: 'OSPF over TCP is the single most common wrong statement about it, and GATE 2023 built a question on it.'
    },
    {
      id: 'protocols-3', scene: 'protocols', start: 255, end: 262.5,
      caption: 'Both are interior gateway protocols. Neither is used between domains.',
      detail: 'Inter-domain routing is the job of an exterior protocol such as BGP. Calling OSPF inter-domain is incorrect, and that is one of the two wrong statements in GATE CSE 2023 Q25.',
      narration: 'Both RIP and OSPF are interior gateway protocols, used inside one domain. Neither is used between domains; that is the job of an exterior protocol such as BGP. Calling OSPF inter-domain is wrong, and GATE 2023 asks for exactly that.',
      keyword: 'interior versus exterior',
      trap: 'Hierarchical routing inside OSPF is not inter-domain routing. Areas are inside one domain.'
    },
    {
      id: 'protocols-4', scene: 'protocols', start: 262.5, end: 270,
      caption: 'Sort every protocol fact into five slots and the one-mark questions become recall.',
      detail: 'Algorithm, metric, transport, limit and scope. RIP is Bellman-Ford, hops, UDP 520, fifteen hops, interior. OSPF is Dijkstra, cost, IP 89, area-based, interior.',
      narration: 'Sort every protocol fact into five slots: algorithm, metric, transport, limit and scope. RIP is Bellman-Ford, hop count, UDP port five hundred and twenty, fifteen hops, interior. OSPF is Dijkstra, cost, IP protocol eighty-nine, areas, interior.',
      keyword: 'five slots',
      trap: 'Mixing the two protocols within a slot is how a matching question is lost. Keep the rows separate.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'decide-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: is the question about a distance vector update, a Dijkstra run, or protocol facts?',
      detail: 'A vector update is arithmetic on one row. A Dijkstra question gives a graph and asks for costs or next hops. A protocol question is recall against a fixed list of slots.',
      narration: 'Step one is to name the family. A vector update is arithmetic on one row of numbers. A Dijkstra question gives a graph and asks for costs or next hops. A protocol question is recall against five slots.',
      keyword: 'name the family',
      trap: 'A question can hand you a graph and still be a vector-update question. Look at what is given, not at what is drawn.'
    },
    {
      id: 'decide-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: for a vector update, use only the neighbours and only the previous round.',
      detail: 'List the neighbours of the router being updated, write the candidate sum for each, take the minimum, and record which neighbour gave it. Never mix in a router that is not a neighbour.',
      narration: 'Step two, for a vector update: list only the neighbours of the router being updated. Write one candidate sum per neighbour, using the vectors from before the round. Take the minimum and note which neighbour gave it.',
      keyword: 'neighbours only',
      trap: 'A non-neighbour that happens to be on the shortest path contributes nothing directly. Its information arrives through a neighbour.'
    },
    {
      id: 'decide-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three: for a Dijkstra question, build the graph, then run extract-min, then read the first hop.',
      detail: 'Draw the graph from the edge list, keep a settled set and a tentative column, and settle in increasing cost. Then walk back from each destination to the root to get the next hop.',
      narration: 'Step three, for a Dijkstra question: draw the graph from the edge list first. Then run extract minimum and relax, settling in increasing cost. Finally walk back from each destination to the root to read the next hop.',
      keyword: 'graph, then Dijkstra, then first hop',
      trap: 'Skipping the drawing is where most errors start. The edge list is not a graph until it is laid out.'
    },
    {
      id: 'decide-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Step four: check the answer against the traps, then against the size of the numbers.',
      detail: 'Sixteen is unreachable, not a distance. One round is not convergence. Split horizon is not a cure. Link state trees differ while the map does not. A cost answer must be at least the direct link cost it uses.',
      narration: 'Step four: check the answer against the traps. Sixteen means unreachable, not a distance. One round is not convergence. Split horizon is not a cure. Link state trees differ while the map does not. Then check the magnitude: no distance can be smaller than the cheapest link it uses.',
      keyword: 'check against the traps'
    }
  ]
};
