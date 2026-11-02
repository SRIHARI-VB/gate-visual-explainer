/* ==========================================================================
   ear-decomposition-and-robbins-orientation — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 360,

  scenes: [
    {
      id: 'question', n: 1,
      title: 'Eight stations, eleven streets, one question',
      start: 0, end: 30,
      objective: 'State the question — can every street be made one-way while everyone still reaches everyone — and see one orientation that fails and one that works.'
    },
    {
      id: 'bridge', n: 2,
      title: 'The obstruction: one street that is the only way across',
      start: 30, end: 60,
      objective: 'Show that a bridge can never be crossed in both directions, so a map with a bridge has no strong orientation at all.'
    },
    {
      id: 'ear', n: 3,
      title: 'An ear: a path through new ground',
      start: 60, end: 90,
      objective: 'Define an ear and see its three shapes — a multi-edge path, a single edge, and a closed path that is a cycle.'
    },
    {
      id: 'definition', n: 4,
      title: 'The four clauses of an ear decomposition',
      start: 90, end: 120,
      objective: 'State the definition clause by clause: a partition of the edges, a cycle first, both ends of every later ear already built, interiors new.'
    },
    {
      id: 'build', n: 5,
      title: 'Building the map one ear at a time',
      start: 120, end: 150,
      objective: 'Run the construction on the worked map: four ears, eleven edges, every edge in exactly one ear.'
    },
    {
      id: 'why', n: 6,
      title: 'Why the walk always comes home',
      start: 150, end: 180,
      objective: 'Give the counting argument that makes the construction work, and show where it dies when a bridge is present.'
    },
    {
      id: 'count', n: 7,
      title: 'The number of ears is not a choice',
      start: 180, end: 210,
      objective: 'Derive ears = |E| - |V| + 1 from what one ear adds, and check it on three maps.'
    },
    {
      id: 'orient', n: 8,
      title: 'Orient each ear: Robbins, 1939',
      start: 210, end: 240,
      objective: 'Turn the decomposition into a strong orientation by pointing ear one round and each later ear end to end, and state the theorem.'
    },
    {
      id: 'dfs', n: 9,
      title: 'The orientation a search can actually build',
      start: 240, end: 270,
      objective: 'Give the linear-time construction — tree edges away from the root, the rest back up — and show the tempting variant that fails.'
    },
    {
      id: 'twoquestions', n: 10,
      title: 'Edges failing against vertices failing',
      start: 270, end: 300,
      objective: 'Separate bridgeless from 2-vertex-connected on the bowtie, and closed ears from open ear decompositions.'
    },
    {
      id: 'boundaries', n: 11,
      title: 'What the theorem does not say',
      start: 300, end: 330,
      objective: 'Run the four boundary cases — disconnected, tree, single vertex, and the count of orientations — and say what each one shows.'
    },
    {
      id: 'procedure', n: 12,
      title: 'The five-step procedure',
      start: 330, end: 360,
      objective: 'Turn the theorem into a decision procedure that answers an exam question and justifies it.'
    }
  ],

  events: [
    /* ---------- scene 1: the question ---------- */
    {
      id: 'q1', scene: 'question', start: 0, end: 7.5,
      caption: 'Eight stations, eleven two-way streets.',
      narration: 'Eight stations and eleven streets, every one of them two-way. You can walk from any station to any other.'
    },
    {
      id: 'q2', scene: 'question', start: 7.5, end: 15,
      caption: 'Made one-way badly, the map breaks: nothing can get back to A.',
      narration: 'Now make each street one-way, in the laziest way: point it from the station the search reached first to the one it reached later. A still reaches every station, but not one station can get back to A.',
      trap: 'An orientation that keeps every station reachable from A is not strong: strong means reachable in both directions, from every station.'
    },
    {
      id: 'q3', scene: 'question', start: 15, end: 22.5,
      caption: 'One station reaching all is not enough. Which maps admit a choice that works both ways?',
      narration: 'So the question is not whether a choice can be made. It is which maps admit some choice of directions that keeps every station reachable from every other.',
      trap: 'The question quantifies over orientations: "there exists an orientation", not "this orientation works".'
    },
    {
      id: 'q4', scene: 'question', start: 22.5, end: 30,
      caption: 'This map does. The lesson gives the test, the construction and the proof.',
      narration: 'This map does admit such a choice, and the picture shows one. The lesson gives the test for any map, the construction that produces the orientation, and the proof that the test is right.'
    },

    /* ---------- scene 2: the bridge ---------- */
    {
      id: 'b1', scene: 'bridge', start: 30, end: 37.5,
      caption: 'Two triangles joined by one street: that street is a bridge.',
      narration: 'Two triangles joined by a single street. Delete that street and the map falls into two separate pieces, so the street is a bridge.'
    },
    {
      id: 'b2', scene: 'bridge', start: 37.5, end: 45,
      caption: 'Point the bridge either way and one side is cut off.',
      narration: 'Point it left to right. Nothing now leaves the right triangle: any route back to the left side would have to use the bridge against its direction.',
      trap: 'Reversing the bridge does not help. It only moves which side is stranded.'
    },
    {
      id: 'b3', scene: 'bridge', start: 45, end: 52.5,
      caption: 'One bridge is enough to kill every strong orientation.',
      narration: 'So a map with a bridge has no strong orientation at all, whatever we do with its other streets. One bridge is enough to settle the question with a no.'
    },
    {
      id: 'b4', scene: 'bridge', start: 52.5, end: 60,
      caption: 'No bridge is necessary. Whether it is sufficient is the hard direction.',
      narration: 'That gives one half of Robbins\' theorem: no bridge is necessary. The other half, that no bridge is enough, is the hard direction, and it needs a new idea.'
    },

    /* ---------- scene 3: the ear ---------- */
    {
      id: 'e1', scene: 'ear', start: 60, end: 67.5,
      caption: 'An ear is a path that starts and ends on ground already built.',
      narration: 'Here is the new idea. An ear is a path whose two ends already sit in the part of the map we have built, and whose inside stations are all new.'
    },
    {
      id: 'e2', scene: 'ear', start: 67.5, end: 75,
      caption: 'B-E-F-D: both ends built, both inside stations new.',
      narration: 'The path from B to E to F to D is an ear. B and D were already built, and E and F have not been used before.',
      trap: 'An ear is not any path: an inside station may not already be built, and an edge may not already be used.'
    },
    {
      id: 'e3', scene: 'ear', start: 75, end: 82.5,
      caption: 'An ear may be one edge, or a closed path that is a cycle.',
      narration: 'An ear can be as short as one edge, like C to H. It can also be closed, starting and ending at the same built station; then the ear is a cycle.'
    },
    {
      id: 'e4', scene: 'ear', start: 82.5, end: 90,
      caption: 'Two rules hold in every ear: no edge twice, no old ground inside.',
      narration: 'Two rules hold in every ear. It uses each edge at most once, and no inside station of it belongs to the part already built.'
    },

    /* ---------- scene 4: the definition ---------- */
    {
      id: 'd1', scene: 'definition', start: 90, end: 97.5,
      caption: 'An ear decomposition writes all the edges as a list of ears.',
      narration: 'An ear decomposition is a way of writing the whole edge set as a list of ears, in an order that builds the map up.'
    },
    {
      id: 'd2', scene: 'definition', start: 97.5, end: 105,
      caption: 'The first ear is a cycle, because nothing is built yet.',
      narration: 'The first ear must be a cycle: at the start there is no built ground for an open ear to land on.'
    },
    {
      id: 'd3', scene: 'definition', start: 105, end: 112.5,
      caption: 'Every later ear has both ends in the ears before it.',
      narration: 'Every later ear must have both of its ends in the ears before it, and its inside stations must appear for the first time.',
      trap: 'The endpoints may be the same station. That is a closed ear, and the definition allows it.'
    },
    {
      id: 'd4', scene: 'definition', start: 112.5, end: 120,
      caption: 'The definition is not yet a theorem. The theorem says who has one.',
      narration: 'So far this is only a definition, and a map could fail to have one. The theorem is that exactly the connected maps with no bridge have such a decomposition.'
    },

    /* ---------- scene 5: the build ---------- */
    {
      id: 'w1', scene: 'build', start: 120, end: 127.5,
      caption: 'Start anywhere: find a cycle and call it ear one.',
      narration: 'Start anywhere and find any cycle. Call it ear one, and treat every station it touches as built.'
    },
    {
      id: 'w2', scene: 'build', start: 127.5, end: 135,
      caption: 'From a built station, follow unused edges until you come home.',
      narration: 'Now take a built station that still has an unused edge, and follow unused edges until the walk arrives back at built ground. That walk is ear two: B to E to F to D.'
    },
    {
      id: 'w3', scene: 'build', start: 135, end: 142.5,
      caption: 'Ear three, then ear four, until no edge is left.',
      narration: 'Repeat. Ear three runs from C through G and H to D. Ear four is the single edge from C to H. No edge is left over.',
      trap: 'Ear four is one edge long. A decomposition is not a list of cycles.'
    },
    {
      id: 'w4', scene: 'build', start: 142.5, end: 150,
      caption: 'Four ears, eleven edges, each edge in exactly one ear.',
      narration: 'Four ears cover all eleven edges, and no edge appears twice. That is an ear decomposition of this map.'
    },

    /* ---------- scene 6: why ---------- */
    {
      id: 'y1', scene: 'why', start: 150, end: 157.5,
      caption: 'Why must the walk come home? Count the unused edges at a new station.',
      narration: 'Why must the walk come home? Look at a station that is not built yet.'
    },
    {
      id: 'y2', scene: 'why', start: 157.5, end: 165,
      caption: 'No built ear touches it, so all its edges are unused, and there are at least two.',
      narration: 'No ear has touched it, so every edge at it is unused. And it has at least two edges, because a station with only one edge is the end of a bridge, and this map has none.',
      trap: 'The argument uses bridgelessness twice: for the degree of a new station, and for the walk never stalling.'
    },
    {
      id: 'y3', scene: 'why', start: 165, end: 172.5,
      caption: 'So there is always another unused edge to leave by: it cannot stall.',
      narration: 'So when the walk arrives, it always has another unused edge to leave by. It cannot get stuck, and the map is finite, so it must arrive back at built ground.'
    },
    {
      id: 'y4', scene: 'why', start: 172.5, end: 180,
      caption: 'With a bridge the same walk dies at the far end of it.',
      narration: 'Take the bridge away from the hypothesis and the argument fails at once. The walk reaches the far side of the bridge, finds one edge, and stops.'
    },

    /* ---------- scene 7: the count ---------- */
    {
      id: 'c1', scene: 'count', start: 180, end: 187.5,
      caption: 'One ear with k edges brings k-1 new stations.',
      narration: 'Count what one ear does to the numbers. An ear with k edges brings k edges and k minus one new stations, so edges minus stations rises by exactly one.'
    },
    {
      id: 'c2', scene: 'count', start: 187.5, end: 195,
      caption: 'So the number of ears is fixed: edges minus stations plus one.',
      narration: 'That quantity is the circuit rank of a connected map: edges minus stations plus one. Every ear raises it by one, so the number of ears equals it.',
      trap: 'The count is fixed by the map, not by the construction. Any ear decomposition of the same map has the same number of ears.'
    },
    {
      id: 'c3', scene: 'count', start: 195, end: 202.5,
      caption: 'Eleven minus eight plus one is four: four ears, as found.',
      narration: 'For this map, eleven edges minus eight stations plus one is four, and the construction produced exactly four ears.'
    },
    {
      id: 'c4', scene: 'count', start: 202.5, end: 210,
      caption: 'The bowtie gives two. The complete graph on four stations gives three.',
      narration: 'The bowtie has six edges and five stations, so two ears. The complete graph on four stations has six edges and four stations, so three.'
    },

    /* ---------- scene 8: orient ---------- */
    {
      id: 'o1', scene: 'orient', start: 210, end: 217.5,
      caption: 'Now give every ear a direction.',
      narration: 'Now for the other half of the theorem. Take an ear decomposition and give every ear a direction.'
    },
    {
      id: 'o2', scene: 'orient', start: 217.5, end: 225,
      caption: 'Ear one becomes a directed cycle: every station on it reaches every other.',
      narration: 'Ear one is a cycle, so send it round. From any station on it you can reach any other by following the arrows.'
    },
    {
      id: 'o3', scene: 'orient', start: 225, end: 232.5,
      caption: 'Each later ear becomes a directed path between two built stations.',
      narration: 'Every later ear is a path, so point it from one end to the other. Its two ends are already built, so it joins two places that already reach each other.',
      trap: 'Pointing an ear from one end to the other is not the same as pointing it in a circle: a later ear need not be a cycle.'
    },
    {
      id: 'o4', scene: 'orient', start: 232.5, end: 240,
      caption: 'Robbins, 1939: a strong orientation exists exactly when connected and bridgeless.',
      narration: 'The result is Robbins\' theorem: a map can be made strongly one-way exactly when it is connected and has no bridge.'
    },

    /* ---------- scene 9: the search ---------- */
    {
      id: 's1', scene: 'dfs', start: 240, end: 247.5,
      caption: 'The ears prove the theorem; a search builds the orientation.',
      narration: 'The ears prove the theorem. To compute an orientation on a real map you can use a depth-first search instead.'
    },
    {
      id: 's2', scene: 'dfs', start: 247.5, end: 255,
      caption: 'Tree edges point away from the root; the others point back up.',
      narration: 'Point each edge of the search tree away from the root, and every edge that is not in the tree from the deeper end to the shallower end.'
    },
    {
      id: 's3', scene: 'dfs', start: 255, end: 262.5,
      caption: 'On a bridgeless map the result is strongly connected.',
      narration: 'On a bridgeless map every edge outside the tree joins a station to one of its ancestors, and the result is strongly connected. On this map all eight stations are reached and return.'
    },
    {
      id: 's4', scene: 'dfs', start: 262.5, end: 270,
      caption: 'Pointing every edge from the earlier-discovered end is a different rule, and it fails.',
      narration: 'The tempting variant points every edge from the earlier discovered end to the later. That makes a map with no way back at all, and it is not the same rule.',
      trap: '"Orient from the earlier DFS number to the later" gives an acyclic orientation. It can never be strong when there is an edge.'
    },

    /* ---------- scene 10: two questions ---------- */
    {
      id: 't1', scene: 'twoquestions', start: 270, end: 277.5,
      caption: 'Two different questions: how many edges must fail, and how many stations.',
      narration: 'Now the trap. Bridgeless is a statement about edges: how many must be deleted to split the map. Being 2-vertex-connected is a statement about stations.'
    },
    {
      id: 't2', scene: 'twoquestions', start: 277.5, end: 285,
      caption: 'The bowtie is bridgeless: every edge lies on one of its two cycles.',
      narration: 'The bowtie has no bridge, because every edge lies on one of its two cycles. Its ear decomposition has two ears, and it does have a strong orientation.'
    },
    {
      id: 't3', scene: 'twoquestions', start: 285, end: 292.5,
      caption: 'Its second ear is closed: both ends are the shared station.',
      narration: 'But its second ear begins and ends at the shared station, because that station is the only way from one triangle to the other. The ear is closed, and the definition allows that.'
    },
    {
      id: 't4', scene: 'twoquestions', start: 292.5, end: 300,
      caption: 'An open decomposition needs no cut station: Whitney, 1932.',
      narration: 'An open ear decomposition, where both ends are distinct every time, exists exactly for the 2-vertex-connected maps, by Whitney\'s theorem. The bowtie has a cut station, so it has none.',
      trap: 'Bridgeless does not imply 2-vertex-connected. The bowtie is the smallest map that separates them.'
    },

    /* ---------- scene 11: boundaries ---------- */
    {
      id: 'x1', scene: 'boundaries', start: 300, end: 307.5,
      caption: 'A disconnected map is out, even with no bridge anywhere.',
      narration: 'Three things the theorem does not say. First, a disconnected map is out even when none of its edges is a bridge, because no direction can cross a missing edge.'
    },
    {
      id: 'x2', scene: 'boundaries', start: 307.5, end: 315,
      caption: 'A tree is out: no cycle, so no first ear.',
      narration: 'Second, a tree is out. It has no cycle at all, so the first ear cannot even begin. Two stations joined by one edge is the smallest failure.'
    },
    {
      id: 'x3', scene: 'boundaries', start: 315, end: 322.5,
      caption: 'One station and no streets is in, by convention: nothing to reach.',
      narration: 'Third, a single station with no streets is in. It is connected, it has no bridge, and the requirement is vacuous because there is no other station to reach.'
    },
    {
      id: 'x4', scene: 'boundaries', start: 322.5, end: 330,
      caption: 'The theorem promises an orientation, not only one.',
      narration: 'Finally, the theorem promises some orientation, not one only. The complete graph on four stations has twenty-four strong orientations out of sixty-four.'
    },

    /* ---------- scene 12: the procedure ---------- */
    {
      id: 'p1', scene: 'procedure', start: 330, end: 337.5,
      caption: 'Step one: is the map connected?',
      narration: 'The procedure. Step one: is the map connected? If it is not, there is no strong orientation, and the proof is a missing edge.'
    },
    {
      id: 'p2', scene: 'procedure', start: 337.5, end: 345,
      caption: 'Step two: look for a bridge, by deletion or by the low-number test.',
      narration: 'Step two: look for a bridge. Delete each edge in turn and recount the pieces, or run the low-number test from the earlier lesson.'
    },
    {
      id: 'p3', scene: 'procedure', start: 345, end: 352.5,
      caption: 'Step three: a bridge means no, and the cut is the reason.',
      narration: 'If a bridge turns up, the answer is no, and the reason is the cut it makes: one direction of the bridge is always unusable.'
    },
    {
      id: 'p4', scene: 'procedure', start: 352.5, end: 360,
      caption: 'Step four: otherwise orient by search and check it by walking from every station.',
      narration: 'Otherwise the answer is yes. Build the orientation with the search rule, then check it by walking from every station, which is what the model on this page does.',
      trap: 'A yes answer needs a construction and a check. Saying "no bridge, so it works" is a claim, not a demonstration.'
    }
  ]
};
