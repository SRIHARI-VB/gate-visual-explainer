# Ear Decomposition and Robbins' Theorem: building a bridgeless graph from one cycle, and orienting it strongly — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/ear-decomposition-and-robbins-orientation/index.html`
- Total duration: 6:00 (360 seconds), 12 scenes, 48 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Eight stations, eleven streets, one question

*0:00 – 0:30 · objective: State the question — can every street be made one-way while everyone still reaches everyone — and see one orientation that fails and one that works.*

**0:00–0:07** — Eight stations and eleven streets, every one of them two-way. You can walk from any station to any other.

> Caption: Eight stations, eleven two-way streets.

**0:07–0:15** — Now make each street one-way, in the laziest way: point it from the station the search reached first to the one it reached later. A still reaches every station, but not one station can get back to A.

> Caption: Made one-way badly, the map breaks: nothing can get back to A.

Exam-trap caption mode adds: *An orientation that keeps every station reachable from A is not strong: strong means reachable in both directions, from every station.*

**0:15–0:22** — So the question is not whether a choice can be made. It is which maps admit some choice of directions that keeps every station reachable from every other.

> Caption: One station reaching all is not enough. Which maps admit a choice that works both ways?

Exam-trap caption mode adds: *The question quantifies over orientations: "there exists an orientation", not "this orientation works".*

**0:22–0:30** — This map does admit such a choice, and the picture shows one. The lesson gives the test for any map, the construction that produces the orientation, and the proof that the test is right.

> Caption: This map does. The lesson gives the test, the construction and the proof.

## Scene 2. The obstruction: one street that is the only way across

*0:30 – 1:00 · objective: Show that a bridge can never be crossed in both directions, so a map with a bridge has no strong orientation at all.*

**0:30–0:37** — Two triangles joined by a single street. Delete that street and the map falls into two separate pieces, so the street is a bridge.

> Caption: Two triangles joined by one street: that street is a bridge.

**0:37–0:45** — Point it left to right. Nothing now leaves the right triangle: any route back to the left side would have to use the bridge against its direction.

> Caption: Point the bridge either way and one side is cut off.

Exam-trap caption mode adds: *Reversing the bridge does not help. It only moves which side is stranded.*

**0:45–0:52** — So a map with a bridge has no strong orientation at all, whatever we do with its other streets. One bridge is enough to settle the question with a no.

> Caption: One bridge is enough to kill every strong orientation.

**0:52–1:00** — That gives one half of Robbins' theorem: no bridge is necessary. The other half, that no bridge is enough, is the hard direction, and it needs a new idea.

> Caption: No bridge is necessary. Whether it is sufficient is the hard direction.

## Scene 3. An ear: a path through new ground

*1:00 – 1:30 · objective: Define an ear and see its three shapes — a multi-edge path, a single edge, and a closed path that is a cycle.*

**1:00–1:07** — Here is the new idea. An ear is a path whose two ends already sit in the part of the map we have built, and whose inside stations are all new.

> Caption: An ear is a path that starts and ends on ground already built.

**1:07–1:15** — The path from B to E to F to D is an ear. B and D were already built, and E and F have not been used before.

> Caption: B-E-F-D: both ends built, both inside stations new.

Exam-trap caption mode adds: *An ear is not any path: an inside station may not already be built, and an edge may not already be used.*

**1:15–1:22** — An ear can be as short as one edge, like C to H. It can also be closed, starting and ending at the same built station; then the ear is a cycle.

> Caption: An ear may be one edge, or a closed path that is a cycle.

**1:22–1:30** — Two rules hold in every ear. It uses each edge at most once, and no inside station of it belongs to the part already built.

> Caption: Two rules hold in every ear: no edge twice, no old ground inside.

## Scene 4. The four clauses of an ear decomposition

*1:30 – 2:00 · objective: State the definition clause by clause: a partition of the edges, a cycle first, both ends of every later ear already built, interiors new.*

**1:30–1:37** — An ear decomposition is a way of writing the whole edge set as a list of ears, in an order that builds the map up.

> Caption: An ear decomposition writes all the edges as a list of ears.

**1:37–1:45** — The first ear must be a cycle: at the start there is no built ground for an open ear to land on.

> Caption: The first ear is a cycle, because nothing is built yet.

**1:45–1:52** — Every later ear must have both of its ends in the ears before it, and its inside stations must appear for the first time.

> Caption: Every later ear has both ends in the ears before it.

Exam-trap caption mode adds: *The endpoints may be the same station. That is a closed ear, and the definition allows it.*

**1:52–2:00** — So far this is only a definition, and a map could fail to have one. The theorem is that exactly the connected maps with no bridge have such a decomposition.

> Caption: The definition is not yet a theorem. The theorem says who has one.

## Scene 5. Building the map one ear at a time

*2:00 – 2:30 · objective: Run the construction on the worked map: four ears, eleven edges, every edge in exactly one ear.*

**2:00–2:07** — Start anywhere and find any cycle. Call it ear one, and treat every station it touches as built.

> Caption: Start anywhere: find a cycle and call it ear one.

**2:07–2:15** — Now take a built station that still has an unused edge, and follow unused edges until the walk arrives back at built ground. That walk is ear two: B to E to F to D.

> Caption: From a built station, follow unused edges until you come home.

**2:15–2:22** — Repeat. Ear three runs from C through G and H to D. Ear four is the single edge from C to H. No edge is left over.

> Caption: Ear three, then ear four, until no edge is left.

Exam-trap caption mode adds: *Ear four is one edge long. A decomposition is not a list of cycles.*

**2:22–2:30** — Four ears cover all eleven edges, and no edge appears twice. That is an ear decomposition of this map.

> Caption: Four ears, eleven edges, each edge in exactly one ear.

## Scene 6. Why the walk always comes home

*2:30 – 3:00 · objective: Give the counting argument that makes the construction work, and show where it dies when a bridge is present.*

**2:30–2:37** — Why must the walk come home? Look at a station that is not built yet.

> Caption: Why must the walk come home? Count the unused edges at a new station.

**2:37–2:45** — No ear has touched it, so every edge at it is unused. And it has at least two edges, because a station with only one edge is the end of a bridge, and this map has none.

> Caption: No built ear touches it, so all its edges are unused, and there are at least two.

Exam-trap caption mode adds: *The argument uses bridgelessness twice: for the degree of a new station, and for the walk never stalling.*

**2:45–2:52** — So when the walk arrives, it always has another unused edge to leave by. It cannot get stuck, and the map is finite, so it must arrive back at built ground.

> Caption: So there is always another unused edge to leave by: it cannot stall.

**2:52–3:00** — Take the bridge away from the hypothesis and the argument fails at once. The walk reaches the far side of the bridge, finds one edge, and stops.

> Caption: With a bridge the same walk dies at the far end of it.

## Scene 7. The number of ears is not a choice

*3:00 – 3:30 · objective: Derive ears = |E| - |V| + 1 from what one ear adds, and check it on three maps.*

**3:00–3:07** — Count what one ear does to the numbers. An ear with k edges brings k edges and k minus one new stations, so edges minus stations rises by exactly one.

> Caption: One ear with k edges brings k-1 new stations.

**3:07–3:15** — That quantity is the circuit rank of a connected map: edges minus stations plus one. Every ear raises it by one, so the number of ears equals it.

> Caption: So the number of ears is fixed: edges minus stations plus one.

Exam-trap caption mode adds: *The count is fixed by the map, not by the construction. Any ear decomposition of the same map has the same number of ears.*

**3:15–3:22** — For this map, eleven edges minus eight stations plus one is four, and the construction produced exactly four ears.

> Caption: Eleven minus eight plus one is four: four ears, as found.

**3:22–3:30** — The bowtie has six edges and five stations, so two ears. The complete graph on four stations has six edges and four stations, so three.

> Caption: The bowtie gives two. The complete graph on four stations gives three.

## Scene 8. Orient each ear: Robbins, 1939

*3:30 – 4:00 · objective: Turn the decomposition into a strong orientation by pointing ear one round and each later ear end to end, and state the theorem.*

**3:30–3:37** — Now for the other half of the theorem. Take an ear decomposition and give every ear a direction.

> Caption: Now give every ear a direction.

**3:37–3:45** — Ear one is a cycle, so send it round. From any station on it you can reach any other by following the arrows.

> Caption: Ear one becomes a directed cycle: every station on it reaches every other.

**3:45–3:52** — Every later ear is a path, so point it from one end to the other. Its two ends are already built, so it joins two places that already reach each other.

> Caption: Each later ear becomes a directed path between two built stations.

Exam-trap caption mode adds: *Pointing an ear from one end to the other is not the same as pointing it in a circle: a later ear need not be a cycle.*

**3:52–4:00** — The result is Robbins' theorem: a map can be made strongly one-way exactly when it is connected and has no bridge.

> Caption: Robbins, 1939: a strong orientation exists exactly when connected and bridgeless.

## Scene 9. The orientation a search can actually build

*4:00 – 4:30 · objective: Give the linear-time construction — tree edges away from the root, the rest back up — and show the tempting variant that fails.*

**4:00–4:07** — The ears prove the theorem. To compute an orientation on a real map you can use a depth-first search instead.

> Caption: The ears prove the theorem; a search builds the orientation.

**4:07–4:15** — Point each edge of the search tree away from the root, and every edge that is not in the tree from the deeper end to the shallower end.

> Caption: Tree edges point away from the root; the others point back up.

**4:15–4:22** — On a bridgeless map every edge outside the tree joins a station to one of its ancestors, and the result is strongly connected. On this map all eight stations are reached and return.

> Caption: On a bridgeless map the result is strongly connected.

**4:22–4:30** — The tempting variant points every edge from the earlier discovered end to the later. That makes a map with no way back at all, and it is not the same rule.

> Caption: Pointing every edge from the earlier-discovered end is a different rule, and it fails.

Exam-trap caption mode adds: *"Orient from the earlier DFS number to the later" gives an acyclic orientation. It can never be strong when there is an edge.*

## Scene 10. Edges failing against vertices failing

*4:30 – 5:00 · objective: Separate bridgeless from 2-vertex-connected on the bowtie, and closed ears from open ear decompositions.*

**4:30–4:37** — Now the trap. Bridgeless is a statement about edges: how many must be deleted to split the map. Being 2-vertex-connected is a statement about stations.

> Caption: Two different questions: how many edges must fail, and how many stations.

**4:37–4:45** — The bowtie has no bridge, because every edge lies on one of its two cycles. Its ear decomposition has two ears, and it does have a strong orientation.

> Caption: The bowtie is bridgeless: every edge lies on one of its two cycles.

**4:45–4:52** — But its second ear begins and ends at the shared station, because that station is the only way from one triangle to the other. The ear is closed, and the definition allows that.

> Caption: Its second ear is closed: both ends are the shared station.

**4:52–5:00** — An open ear decomposition, where both ends are distinct every time, exists exactly for the 2-vertex-connected maps, by Whitney's theorem. The bowtie has a cut station, so it has none.

> Caption: An open decomposition needs no cut station: Whitney, 1932.

Exam-trap caption mode adds: *Bridgeless does not imply 2-vertex-connected. The bowtie is the smallest map that separates them.*

## Scene 11. What the theorem does not say

*5:00 – 5:30 · objective: Run the four boundary cases — disconnected, tree, single vertex, and the count of orientations — and say what each one shows.*

**5:00–5:07** — Three things the theorem does not say. First, a disconnected map is out even when none of its edges is a bridge, because no direction can cross a missing edge.

> Caption: A disconnected map is out, even with no bridge anywhere.

**5:07–5:15** — Second, a tree is out. It has no cycle at all, so the first ear cannot even begin. Two stations joined by one edge is the smallest failure.

> Caption: A tree is out: no cycle, so no first ear.

**5:15–5:22** — Third, a single station with no streets is in. It is connected, it has no bridge, and the requirement is vacuous because there is no other station to reach.

> Caption: One station and no streets is in, by convention: nothing to reach.

**5:22–5:30** — Finally, the theorem promises some orientation, not one only. The complete graph on four stations has twenty-four strong orientations out of sixty-four.

> Caption: The theorem promises an orientation, not only one.

## Scene 12. The five-step procedure

*5:30 – 6:00 · objective: Turn the theorem into a decision procedure that answers an exam question and justifies it.*

**5:30–5:37** — The procedure. Step one: is the map connected? If it is not, there is no strong orientation, and the proof is a missing edge.

> Caption: Step one: is the map connected?

**5:37–5:45** — Step two: look for a bridge. Delete each edge in turn and recount the pieces, or run the low-number test from the earlier lesson.

> Caption: Step two: look for a bridge, by deletion or by the low-number test.

**5:45–5:52** — If a bridge turns up, the answer is no, and the reason is the cut it makes: one direction of the bridge is always unusable.

> Caption: Step three: a bridge means no, and the cut is the reason.

**5:52–6:00** — Otherwise the answer is yes. Build the orientation with the search rule, then check it by walking from every station, which is what the model on this page does.

> Caption: Step four: otherwise orient by search and check it by walking from every station.

Exam-trap caption mode adds: *A yes answer needs a construction and a check. Saying "no bridge, so it works" is a claim, not a demonstration.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
