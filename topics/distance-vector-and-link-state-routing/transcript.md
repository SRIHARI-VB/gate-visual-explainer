# Distance Vector and Link State Routing — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/distance-vector-and-link-state-routing/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Routing: two ways to know the way

*0:00 – 0:30 · objective: Separate forwarding from routing, and see that the two routing families differ in what a router is allowed to know.*

**0:00–0:07** — A router does one small thing for every packet. It looks the destination up in a table and sends the packet to one neighbour. That is forwarding, and the table it reads is a list of destinations, each with a next hop and a cost.

> Caption: A router does one small thing per packet: look up the destination and send it to one neighbour.

Exam-trap caption mode adds: *The table stores the next hop, not the whole path. A router usually does not know the full route the packet will follow.*

**0:07–0:15** — Building the table is a different job, called routing. There are two honest ways to do it. You can ask your neighbours what they believe and combine their answers, or you can collect every link in the network and compute on the whole map.

> Caption: Building that table is routing, and there are two honest ways to do it.

Exam-trap caption mode adds: *Routing and forwarding are different words. A question that says routing is asking how the table was built; forwarding is asking how one packet is handled.*

**0:15–0:22** — So the difference is knowledge. A distance vector router knows only what its neighbours tell it. A link state router knows the whole graph. Everything else follows from that: how fast they converge, how many messages they send, how much memory they need, and whether they can form a loop.

> Caption: Distance vector knows only its neighbours. Link state knows the whole graph.

Exam-trap caption mode adds: *A distance vector router is not given a copy of the graph and then restricted. It genuinely never sees one.*

**0:22–0:30** — The algorithm follows from the knowledge. Distance vector is the distributed Bellman-Ford equation. Link state is Dijkstra on a map every router holds. GATE 2025 Set 2 asked this matching for one mark.

> Caption: Distance vector runs Bellman-Ford. Link state runs Dijkstra.

Exam-trap caption mode adds: *Dijkstra needs the whole graph. A router that only has neighbour vectors cannot run it, which is why the pairing is not a matter of taste.*

## Scene 2. The Bellman-Ford equation, on GATE 2021 numbers

*0:30 – 1:00 · objective: Compute a distance-vector update from three neighbour vectors, and read off the cost and the next hop as two separate answers.*

**0:30–0:37** — The whole of distance vector is one line. The distance from x to y is the smallest, over all neighbours v, of the cost of the link from x to v plus the distance that v reports to y. That is the Bellman-Ford equation.

> Caption: The whole of distance vector is one line: the best route through any neighbour.

Exam-trap caption mode adds: *The minimisation is over neighbours, not over all routers. x never uses a number from a router it cannot reach directly.*

**0:37–0:45** — GATE 2021 Set 2 gives router R three neighbours at distance three, two and five. Their vectors say router P is seven, six and five away. So the three candidate costs to P are ten, eight and ten.

> Caption: GATE CSE 2021 Set 2 gives R three neighbours and asks for its new table.

Exam-trap caption mode adds: *Add the link cost first, then compare. Comparing the neighbour vectors before adding gives the wrong minimum.*

**0:45–0:52** — Eight is the cost, and it was achieved through Y, so Y becomes the next hop. One computation gives two answers: the value, and which neighbour produced it. The 2021 option that says ten is quoting a candidate, not the minimum.

> Caption: Eight is the cost, and it came through Y, so Y is the next hop.

Exam-trap caption mode adds: *A question can ask for the cost, the next hop, or both. Answering the one that was not asked scores zero.*

**0:52–1:00** — For router Q the same three neighbours give seven, eight and thirteen, so the cost is seven through X. Two destinations, two different next hops, from the same three vectors. That is why a distance vector is a whole row of numbers.

> Caption: For Q the three sums are 7, 8 and 13, so the cost is 7 through X.

Exam-trap caption mode adds: *Do not carry the next hop from one destination to another. Each column of the vector has its own argmin.*

## Scene 3. One round of exchange: GATE 2011, both questions

*1:00 – 1:30 · objective: Recompute one node vector from its neighbours alone, then watch a link failure raise a cost even though a shorter path exists.*

**1:00–1:07** — GATE 2011 gives five routers with stabilised vectors, five numbers each, and then changes one link cost. The rows are consistent with a graph, and the direct links are visible as the smallest nonzero entries in each row.

> Caption: GATE CSE 2011 gives five stabilised vectors and then changes one link.

Exam-trap caption mode adds: *A stabilised vector is a fixed point: recomputing it from its neighbours reproduces it exactly. The page checks that property on all five rows.*

**1:07–1:15** — The cost of the link between N2 and N3 drops to two. N3 recomputes each column using only its own neighbours, N2, N4 and N5, and using their vectors as they stood before the round.

> Caption: The link N2 to N3 drops to 2. N3 keeps only its neighbours N2, N4 and N5.

Exam-trap caption mode adds: *Using the updated N2 vector inside the same round is the standard mistake. One round means one pass over the previous vectors.*

**1:15–1:22** — The new row at N3 is three, two, zero, two, five, which is option A of that question. To N1 the candidates are three and ten, so three. To N5 they are five and six, so five.

> Caption: The new row at N3 is 3, 2, 0, 2, 5 — option A of GATE CSE 2011.

Exam-trap caption mode adds: *The zero stays zero. A router is always at distance zero from itself, and no neighbour can improve on that.*

**1:22–1:30** — Then the link from N1 to N2 fails. N2 reports infinity to N1, N4 still reports eight, so N3 records two plus eight, which is ten. The true shortest path after the failure is nine, through N5. The algorithm finds that in a later round, not this one.

> Caption: Then N1 to N2 fails, and the next round gives N3 a cost of 10 to N1.

Exam-trap caption mode adds: *Ten is the correct answer to the question and the wrong value for the network. After one round the tables are still transient.*

## Scene 4. Count to infinity: why a dead route stays alive

*1:30 – 2:00 · objective: Follow the climbing costs of a two-router loop, and see why RIP defines 16 as infinity instead of a very large number.*

**1:30–1:37** — A network hangs off router B. A reaches it in two hops, B in one. Then the link to the network dies. B notices at once and sets its distance to infinity. A has heard nothing yet, and still believes the destination is two hops away through B.

> Caption: A network hangs off B. A reaches it in 2, B in 1. Then that link dies.

Exam-trap caption mode adds: *The problem is not that the news is wrong. The problem is that it is late, and that B will believe A.*

**1:37–1:45** — Before B can tell A, A advertises its distance of two. B adds its own link cost and now believes the destination is three away, through A. The number B hears was built from B own old value.

> Caption: Before B can tell A, A advertises 2. B now believes 3 through A.

Exam-trap caption mode adds: *Nothing in the message says where the route originally came from. That missing provenance is the whole cause.*

**1:45–1:52** — Then A hears three and takes four, B hears four and takes five, and the number climbs by one at every exchange. The two routers keep handing each other an inflated value. Nothing can stop it except a ceiling.

> Caption: Then A hears 3 and takes 4, B hears 4 and takes 5, and it climbs by one each time.

Exam-trap caption mode adds: *The cost rises; it never corrects itself downwards. A packet sent during the climb loops between the two routers.*

**1:52–2:00** — RIP decides that sixteen means infinity. So the climb stops at sixteen and the route is finally declared dead. That is why RIP allows at most fifteen hops: sixteen is reserved for unreachable. A small ceiling makes the failure quick, and also limits the size of network RIP can serve.

> Caption: RIP makes 16 mean infinity, so the climb stops at 16 and the route dies.

Exam-trap caption mode adds: *Sixteen is not a distance a RIP route can have. It is the value meaning no route, so fifteen hops is the largest usable path.*

## Scene 5. Split horizon, poison reverse, and what they do not fix

*2:00 – 2:30 · objective: State each repair as a rule about what may be advertised, then watch the three-router case that survives all of them.*

**2:00–2:07** — Split horizon is a rule about what may be advertised. Never advertise a route back out of the interface you learned it from. B learned this route through A, so B says nothing about it to A. The two-router loop becomes impossible.

> Caption: Split horizon: never advertise a route back out of the interface you learned it from.

Exam-trap caption mode adds: *Split horizon suppresses information. It does not correct it, and it can slow down legitimate re-learning.*

**2:07–2:15** — Poison reverse says the same thing out loud. The route is advertised back, but with a metric of sixteen instead of being left out. Silence and a poisoned advertisement have the same effect; poison reverse just removes the ambiguity.

> Caption: Poison reverse says the same thing out loud: advertise it back, but as infinity.

Exam-trap caption mode adds: *Poison reverse is split horizon with a different encoding. They prevent the same class of loop, not two different classes.*

**2:15–2:22** — Two timers help. A triggered update sends the bad news immediately instead of waiting for the next periodic advertisement. A hold-down timer refuses to believe good news about a route for a while after bad news, which stops the inflated values being believed straight away.

> Caption: Triggered updates and hold-down timers cut the delay that the loop feeds on.

Exam-trap caption mode adds: *These shorten the window; they do not remove the possibility. A loop can still form between the failure and the update arriving.*

**2:22–2:30** — But take three routers in a line, with the destination hanging off the first. Split horizon silences the middle router in both directions. The two outer routers then flip between a finite cost and infinity, and the finite value keeps growing, so no round ever settles. The loop persists, and that is why GATE 2014 Set 1 marks the claim that split horizon avoids persistent loops as false.

> Caption: With three routers in a line, split horizon still loops: the page simulates it.

Exam-trap caption mode adds: *Split horizon removes two-router loops. It does not remove loops that close through a third router.*

## Scene 6. Link state: flood the truth, then compute locally

*2:30 – 3:00 · objective: See why an identical map at every router removes the loop, and what that consistency costs in messages.*

**2:30–2:37** — A link state router describes only itself. It reports which neighbours it has and what each link costs. It does not report a distance to anything. Adjacency and cost are facts it can check itself, not beliefs it has been told.

> Caption: A link state router describes only itself: its links and their costs.

Exam-trap caption mode adds: *A link state packet carries no distances. If a question shows a distance inside one, that is not a link state advertisement.*

**2:37–2:45** — Those advertisements are flooded to every router. Each router collects them into a database, and because flooding is reliable and each router keeps the newest copy, every database ends up describing the same graph.

> Caption: Those advertisements are flooded, so every router ends with the same map.

Exam-trap caption mode adds: *Identical is the point, not a side effect. Different maps at different routers would put the loop straight back.*

**2:45–2:52** — Each router then runs Dijkstra on that same map with itself as the root. Two routers get different trees from the same graph, and both are right, because the tree is rooted at the router. Because the trees come from one consistent map, the resulting paths are loop-free.

> Caption: Each router runs Dijkstra with itself as the root, on that same map.

Exam-trap caption mode adds: *The trees differ; the map does not. A question asking whether all routers hold the same routing table is asking a different thing from whether they hold the same graph.*

**2:52–3:00** — The price is communication and computation. Every router receives every advertisement, and every router runs a full shortest-path computation. That is why GATE 2014 Set 1 says link state has the higher computational overhead, and in the same question why it converges faster.

> Caption: The price is messages: flooding costs more than telling your neighbours.

Exam-trap caption mode adds: *Higher overhead and faster convergence are both true. Neither contradicts the other.*

## Scene 7. Dijkstra on six routers, one greedy step at a time

*3:00 – 3:30 · objective: Run the extract-min and relax steps, and see which assumption the greedy choice depends on.*

**3:00–3:07** — Dijkstra keeps two things. A set of routers whose cost is settled, and a tentative cost for everybody else. It starts with only the source settled, at cost zero.

> Caption: Dijkstra keeps a set of settled routers and a tentative cost for the rest.

Exam-trap caption mode adds: *A settled cost is final. Later steps never revise it, which is exactly the claim that has to be justified.*

**3:07–3:15** — Then repeat one step. Take the unsettled router with the smallest tentative cost, and settle it. Offer each of its neighbours the settled cost plus the link cost, and keep the smaller number. The smallest tentative cost is safe to settle because no other route can be cheaper.

> Caption: Take the unsettled router with the smallest tentative cost, then relax its links.

Exam-trap caption mode adds: *That safety argument needs non-negative link costs. With a negative link a later route could undercut a settled one.*

**3:15–3:22** — On the six-router graph the settled order is A, then C, then B, then D, then E, then F, with costs zero, two, three, eight, ten and thirteen. The settled costs never decrease, and that monotone column is a quick check that the run is right.

> Caption: On six routers the settled order is A, C, B, D, E, F with costs 0, 2, 3, 8, 10, 13.

Exam-trap caption mode adds: *The settlement order is not the alphabetical order and not the order of the drawing. It is the order of the tentative costs.*

**3:22–3:30** — The result is a tree, not just a list of costs. One shortest path per destination, all rooted at the source. The tree records each predecessor, and following the chain back to the root gives the next hop.

> Caption: The result is a tree, and the tree is what a routing table is made from.

Exam-trap caption mode adds: *Equal-cost routes break the tree into a graph. The cost answer stays unique; the next hop may not.*

## Scene 8. From shortest-path tree to routing table

*3:30 – 4:00 · objective: Convert a tree into next hops, then check that distance vector converged to the same numbers on the same graph.*

**3:30–3:37** — The next hop is the first step from the root along the tree, not the last. For a destination two steps down, the table stores the child of the root, because that is the only router the source can actually hand the packet to.

> Caption: The next hop is the first step from the root along the tree, not the last.

Exam-trap caption mode adds: *Writing the destination itself, or the second router on the path, is the most common table-building error.*

**3:37–3:45** — Now run distance vector from scratch on the very same graph. Exchange until nothing changes. Every entry matches the Dijkstra distances, because both are computing shortest paths in the same graph.

> Caption: Distance vector, started from scratch on the same graph, reaches the same six numbers.

Exam-trap caption mode adds: *Agreement at convergence says nothing about agreement during convergence. The two families differ exactly there.*

**3:45–3:52** — Both are checked against a third method: an all-pairs dynamic programme that uses neither algorithm. The page compares the two against it on four graphs and prints how many checks passed.

> Caption: Both are checked against an independent all-pairs computation.

Exam-trap caption mode adds: *Two algorithms agreeing is weak evidence if they share a bug. The third method is what makes the check worth something.*

**3:52–4:00** — So the choice between the two is never about the final distances. It is about what a router must know, how many messages that takes, and how long convergence lasts.

> Caption: So the choice is never about the final answer. It is about knowledge, messages and time.

Exam-trap caption mode adds: *A question that asks which protocol finds shorter paths has no correct option. Both find shortest paths.*

## Scene 9. RIP and OSPF: the facts GATE asks for

*4:00 – 4:30 · objective: Fix the protocol facts that decide the one-mark questions: algorithm, metric, transport, limit, scope.*

**4:00–4:07** — RIP is distance vector with hop count as the metric. Every link costs one, fifteen is the largest usable distance and sixteen means unreachable. Its messages travel in UDP on port five hundred and twenty, and updates are periodic.

> Caption: RIP is distance vector in hops, carried in UDP on port 520, capped at 15 hops.

Exam-trap caption mode adds: *RIP runs over UDP, not TCP, and not directly over IP. That is a one-mark fact and it is asked.*

**4:07–4:15** — OSPF is link state. Its metric is a cost, its advertisements are flooded, and it runs Dijkstra. It is carried directly in IP using protocol number eighty-nine, not in TCP and not in UDP. It also supports areas, with one backbone area.

> Caption: OSPF is link state with a cost metric, carried directly in IP protocol 89.

Exam-trap caption mode adds: *OSPF over TCP is the single most common wrong statement about it, and GATE 2023 built a question on it.*

**4:15–4:22** — Both RIP and OSPF are interior gateway protocols, used inside one domain. Neither is used between domains; that is the job of an exterior protocol such as BGP. Calling OSPF inter-domain is wrong, and GATE 2023 asks for exactly that.

> Caption: Both are interior gateway protocols. Neither is used between domains.

Exam-trap caption mode adds: *Hierarchical routing inside OSPF is not inter-domain routing. Areas are inside one domain.*

**4:22–4:30** — Sort every protocol fact into five slots: algorithm, metric, transport, limit and scope. RIP is Bellman-Ford, hop count, UDP port five hundred and twenty, fifteen hops, interior. OSPF is Dijkstra, cost, IP protocol eighty-nine, areas, interior.

> Caption: Sort every protocol fact into five slots and the one-mark questions become recall.

Exam-trap caption mode adds: *Mixing the two protocols within a slot is how a matching question is lost. Keep the rows separate.*

## Scene 10. The procedure, and the traps that cost marks

*4:30 – 5:00 · objective: Fix a five-step routine that covers every question shape in this clause.*

**4:30–4:37** — Step one is to name the family. A vector update is arithmetic on one row of numbers. A Dijkstra question gives a graph and asks for costs or next hops. A protocol question is recall against five slots.

> Caption: Step one: is the question about a distance vector update, a Dijkstra run, or protocol facts?

Exam-trap caption mode adds: *A question can hand you a graph and still be a vector-update question. Look at what is given, not at what is drawn.*

**4:37–4:45** — Step two, for a vector update: list only the neighbours of the router being updated. Write one candidate sum per neighbour, using the vectors from before the round. Take the minimum and note which neighbour gave it.

> Caption: Step two: for a vector update, use only the neighbours and only the previous round.

Exam-trap caption mode adds: *A non-neighbour that happens to be on the shortest path contributes nothing directly. Its information arrives through a neighbour.*

**4:45–4:52** — Step three, for a Dijkstra question: draw the graph from the edge list first. Then run extract minimum and relax, settling in increasing cost. Finally walk back from each destination to the root to read the next hop.

> Caption: Step three: for a Dijkstra question, build the graph, then run extract-min, then read the first hop.

Exam-trap caption mode adds: *Skipping the drawing is where most errors start. The edge list is not a graph until it is laid out.*

**4:52–5:00** — Step four: check the answer against the traps. Sixteen means unreachable, not a distance. One round is not convergence. Split horizon is not a cure. Link state trees differ while the map does not. Then check the magnitude: no distance can be smaller than the cheapest link it uses.

> Caption: Step four: check the answer against the traps, then against the size of the numbers.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
