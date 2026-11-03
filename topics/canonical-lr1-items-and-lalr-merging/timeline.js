/* ==========================================================================
   canonical-lr1-items-and-lalr-merging — THE timeline.
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
      id: 'slr', n: 1,
      title: 'SLR reduces on a grammar-wide answer',
      start: 0, end: 30,
      objective: 'See that FOLLOW(A) is a property of the grammar rather than of the state, and find the state where that costs a conflict.'
    },
    {
      id: 'item', n: 2,
      title: 'The item grows a second field',
      start: 30, end: 60,
      objective: 'Read an LR(1) item as a production with a dot plus one terminal, and say exactly what that terminal records.'
    },
    {
      id: 'closure', n: 3,
      title: 'Closure carries the lookahead forward',
      start: 60, end: 90,
      objective: 'Apply the closure rule with FIRST(beta a) on the grammar S -> C C, and see six items where LR(0) has three.'
    },
    {
      id: 'collection', n: 4,
      title: 'GOTO, and ten states instead of seven',
      start: 90, end: 120,
      objective: 'Build the canonical collection for S -> C C and find the three pairs of states that differ only in lookahead.'
    },
    {
      id: 'local', n: 5,
      title: 'The reduce rule is local',
      start: 120, end: 150,
      objective: 'Place a reduce only in the lookahead column, and see the LR(1) row as a subset of the SLR row.'
    },
    {
      id: 'merge', n: 6,
      title: 'LALR: merge the states that share a core',
      start: 150, end: 180,
      objective: 'Merge by core, union the lookaheads, and see why the LALR state count is always the LR(0) count.'
    },
    {
      id: 'gb', n: 7,
      title: 'The merge that costs a language',
      start: 180, end: 210,
      objective: 'Watch two disjoint lookahead sets become one conflicting cell, and count the strings the merged parser loses.'
    },
    {
      id: 'what', n: 8,
      title: 'What a merge can and cannot create',
      start: 210, end: 240,
      objective: 'Prove that merging preserves shift/reduce conflicts exactly, show that reduce/reduce is different, and find a conflict that no merge caused.'
    },
    {
      id: 'counts', n: 9,
      title: 'The four rungs, counted',
      start: 240, end: 270,
      objective: 'Read the state counts and conflict kinds for six grammars off one table, and name a witness for each strict step of the ladder.'
    },
    {
      id: 'proc', n: 10,
      title: 'The decision procedure, and the four traps',
      start: 270, end: 300,
      objective: 'Fix the five-step order that answers "is this grammar LALR(1)?", and the four slips that cost the mark.'
    }
  ],

  events: [
    /* ---------- scene 1 ---------- */
    {
      id: 's-1', scene: 'slr', start: 0, end: 7.5,
      caption: 'SLR writes a reduce into every column of FOLLOW of the production head.',
      detail: 'The LR(0) automaton has no lookahead at all, so SLR borrows one from the grammar: when a production A -> alpha is complete, it reduces on every terminal in FOLLOW(A). That set is computed once, from the whole grammar, before any state is examined.',
      narration: 'SLR writes a reduce into every column of FOLLOW of the production head.',
      keyword: 'every column',
      trap: 'Reading FOLLOW(A) as if it were a property of the state. It is a property of the grammar.'
    },
    {
      id: 's-2', scene: 'slr', start: 7.5, end: 15,
      caption: 'So two states that finish the same production get the same reduce row.',
      detail: 'Whatever led to the state, the row is the same. That is convenient and it is also the weakness: the lookahead the state can actually see may be a proper subset of FOLLOW, and the reduce is written into columns the state can never be followed by.',
      narration: 'So two states that finish the same production get the same reduce row.',
      keyword: 'same reduce row',
      trap: 'Assuming a wider lookahead set is safer. A wider set puts more actions into cells that may already hold a shift.'
    },
    {
      id: 's-3', scene: 'slr', start: 15, end: 22.5,
      caption: 'On S -> L = R | R, L -> * R | id, R -> L the state after L breaks it.',
      detail: 'That state holds two items: S -> L . = R, whose dot is before the equals sign, and R -> L . , which is complete. The first demands a shift on equals. The second demands a reduce, because FOLLOW(R) is the pair equals and end-marker.',
      narration: 'On the assignment grammar, the state after reading L breaks it.',
      keyword: 'state after L',
      trap: 'Thinking the two items must be about the same thing. They are about the same prefix and different futures.'
    },
    {
      id: 's-4', scene: 'slr', start: 22.5, end: 30,
      caption: 'One cell, a shift and a reduce: SLR conflicts, and LALR does not.',
      detail: 'The page builds all three tables for this grammar. SLR reports one shift/reduce conflict, on the equals sign. Canonical LR(1) reports none, and LALR reports none, because the local lookahead for R -> L in that state is the end marker alone.',
      narration: 'One cell, a shift and a reduce. SLR conflicts here and LALR does not.',
      keyword: 'shift/reduce',
      trap: 'Calling the grammar ambiguous. It is unambiguous; only the coarse lookahead is wrong.'
    },

    /* ---------- scene 2 ---------- */
    {
      id: 'i-1', scene: 'item', start: 30, end: 37.5,
      caption: 'An LR(1) item is a production with a dot, plus one terminal.',
      detail: 'Written as A -> alpha . beta comma a. The dot is the same dot as in LR(0): it separates what has been read from what remains. The terminal is new, and it is called the lookahead.',
      narration: 'An LR(1) item is a production with a dot, plus one terminal.',
      keyword: 'plus one terminal',
      trap: 'Reading the terminal as part of the right-hand side. It is not a symbol of the production.'
    },
    {
      id: 'i-2', scene: 'item', start: 37.5, end: 45,
      caption: 'The lookahead says which terminal may follow the whole right-hand side.',
      detail: 'It is a promise about the future of this state, not about the production. Two states can hold the same production at the same dot with different lookaheads, and then they are different items.',
      narration: 'The lookahead says which terminal may follow the whole right-hand side.',
      keyword: 'may follow',
      trap: 'Confusing the lookahead with the next symbol on the stack. It is the next input terminal, after the reduction.'
    },
    {
      id: 'i-3', scene: 'item', start: 45, end: 52.5,
      caption: 'Erase the lookahead and what is left is the core.',
      detail: 'The core is the set of production-and-dot pairs. It is what the LR(0) automaton already knows, and it is the thing LALR will merge on. Two items with the same core and different lookaheads are two items and one core.',
      narration: 'Erase the lookahead and what is left is the core.',
      keyword: 'core',
      trap: 'Thinking two items with the same core are the same item. They are distinct until they are merged.'
    },
    {
      id: 'i-4', scene: 'item', start: 52.5, end: 60,
      caption: 'State I3 of S -> C C holds 6 items over 3 cores; I0 holds 6 over 4.',
      detail: 'The count of items is not the count of cores, and it is the count of cores that decides the LALR state count. The page prints both numbers for every state it builds.',
      narration: 'State I3 holds six items over three cores; state I0 holds six over four.',
      keyword: 'cores',
      trap: 'Counting items when the question asks for states. Merging is by core.'
    },

    /* ---------- scene 3 ---------- */
    {
      id: 'c-1', scene: 'closure', start: 60, end: 67.5,
      caption: 'Closure: for A -> alpha . B beta with lookahead a, add B productions.',
      detail: 'The rule is the LR(0) closure with one change. In LR(0) the new items carry no lookahead. In LR(1) each new item B -> . gamma carries every terminal in FIRST of beta followed by a.',
      narration: 'Closure adds the productions of B, and gives each one a lookahead from FIRST of beta a.',
      keyword: 'FIRST(beta a)',
      trap: 'Giving the new items the same lookahead a. The lookahead is FIRST of what comes after B, and only falls back to a when that can vanish.'
    },
    {
      id: 'c-2', scene: 'closure', start: 67.5, end: 75,
      caption: 'On S -> C C the kernel gives S -> . C C with lookahead $, so FIRST(C $) = {c, d}.',
      detail: 'The first C is followed by the second C, so its lookahead set is FIRST(C). The page computes FIRST by fixed point and prints it: both S and C have FIRST equal to c and d, and neither is nullable.',
      narration: 'On S to C C, the first C is followed by C, so its lookahead is FIRST of C.',
      keyword: '{c, d}',
      trap: 'Writing the end marker into every closure item. It belongs to the item whose beta is empty.'
    },
    {
      id: 'c-3', scene: 'closure', start: 75, end: 82.5,
      caption: 'The same kernel produces six items, where the LR(0) closure produces three.',
      detail: 'Two productions of C, each with two possible lookaheads. That doubling is the whole cost of canonical LR(1), and it is why the canonical collection is larger than the LR(0) collection on the same grammar.',
      narration: 'Six items where LR(0) has three: each C production appears once per possible lookahead.',
      keyword: 'six against three',
      trap: 'Thinking the extra items are redundant. They differ in exactly the field the reduce rule reads.'
    },
    {
      id: 'c-4', scene: 'closure', start: 82.5, end: 90,
      caption: 'In state I2 the second C is followed by the end marker, so there the lookahead is $.',
      detail: 'I2 holds S -> C . C with lookahead end-marker, and nothing follows the second C. So its closure has three items, not six. The lookahead is recomputed from the state every time, never carried over from another state.',
      narration: 'In state I2 the second C is followed by the end marker, so the lookahead is $ alone.',
      keyword: '$ alone',
      trap: 'Assuming a nonterminal always has the same lookahead. It has whatever this state allows.'
    },

    /* ---------- scene 4 ---------- */
    {
      id: 'k-1', scene: 'collection', start: 90, end: 97.5,
      caption: 'GOTO moves the dot over one symbol and closes again.',
      detail: 'goto(I, X) takes the items of I whose dot sits before X, advances each dot by one, and closes the result under the LR(1) closure rule. Repeating this from the start state, and keeping every distinct set, gives the canonical collection.',
      narration: 'GOTO moves the dot over one symbol and closes again.',
      keyword: 'moves the dot',
      trap: 'Forgetting the closure after the move. GOTO without closure is not a state.'
    },
    {
      id: 'k-2', scene: 'collection', start: 97.5, end: 105,
      caption: 'On S -> C C the collection has 10 states; LR(0) has 7 on the same grammar.',
      detail: 'The page builds both and counts them. The extra three states are not new structure: they are states that LR(0) would have merged because it cannot tell them apart.',
      narration: 'Ten states for canonical LR(1), seven for LR(0), on the same grammar.',
      keyword: 'ten against seven',
      trap: 'Believing canonical LR(1) sees more of the grammar. It sees the same grammar with a finer partition.'
    },
    {
      id: 'k-3', scene: 'collection', start: 105, end: 112.5,
      caption: 'I3 and I6 hold the same items and differ only in lookahead.',
      detail: 'I4 and I7 likewise, and I8 and I9 likewise. Three pairs, each pair sharing a core. On the canvas the lookahead column shows it directly: c and d in one state, the end marker in the other.',
      narration: 'Three pairs of states hold the same items and differ only in lookahead.',
      keyword: 'three pairs',
      trap: 'Treating the pairs as an accident of this grammar. Every LR(0) state is a core, and cores can repeat.'
    },
    {
      id: 'k-4', scene: 'collection', start: 112.5, end: 120,
      caption: 'The table built from these ten states accepts exactly the language of the grammar.',
      detail: 'The page runs the canonical table and an independently written recognizer on all 63 strings of length at most five over the terminals c and d, and they agree on every one. That is the operational meaning of a correct table.',
      narration: 'The ten-state table accepts exactly the language, on all 63 strings of length at most five.',
      keyword: 'exactly the language',
      trap: 'Checking a table on one sentence. One accepted string says nothing about the rejected ones.'
    },

    /* ---------- scene 5 ---------- */
    {
      id: 'l-1', scene: 'local', start: 120, end: 127.5,
      caption: 'A completed item writes a reduce in its lookahead column, and nowhere else.',
      detail: 'I4 holds C -> d . with lookaheads c and d, so it reduces on c and d. I7 holds C -> d . with lookahead the end marker, so it reduces on the end marker alone. Same production, two states, two rows.',
      narration: 'A completed item writes a reduce in its lookahead column, and nowhere else.',
      keyword: 'lookahead column',
      trap: 'Writing the reduce into every column of FOLLOW out of habit. That is the SLR rule, not this one.'
    },
    {
      id: 'l-2', scene: 'local', start: 127.5, end: 135,
      caption: 'So the LR(1) reduce row is always a subset of the SLR row.',
      detail: 'Every lookahead in a canonical item is a terminal that can genuinely follow the head, so it is in FOLLOW. The reverse fails: FOLLOW can contain terminals this state never allows. The page checks the containment on every completed item of every state.',
      narration: 'So the LR(1) reduce row is always a subset of the SLR row.',
      keyword: 'subset',
      trap: 'Believing the two rules can disagree in either direction. The local set is never wider.'
    },
    {
      id: 'l-3', scene: 'local', start: 135, end: 142.5,
      caption: 'Of the 27 completed items here, exactly one has a lookahead set strictly inside FOLLOW.',
      detail: 'That one is R -> L in state 2 of the assignment grammar: FOLLOW of R is the pair equals and end-marker, but in that state only the end marker can follow. Strictness is rare, which is why SLR works as often as it does.',
      narration: 'Of the twenty-seven completed items here, exactly one is strictly narrower than FOLLOW.',
      keyword: 'exactly one',
      trap: 'Concluding that the local rule is a small improvement. It is small and it is decisive, because that is where conflicts live.'
    },
    {
      id: 'l-4', scene: 'local', start: 142.5, end: 150,
      caption: 'The extra terminal is the whole conflict: the state cannot be followed by it.',
      detail: 'SLR reduces on the equals sign because FOLLOW says so, while the state has a shift on the equals sign from a different production entirely. Narrowing the reduce row to the end marker removes the second action and the cell becomes single-valued.',
      narration: 'The extra terminal is the whole conflict, and the state cannot be followed by it.',
      keyword: 'the extra terminal',
      trap: 'Reading the conflict as a sign of ambiguity. It is a sign that the lookahead set was too coarse.'
    },

    /* ---------- scene 6 ---------- */
    {
      id: 'm-1', scene: 'merge', start: 150, end: 157.5,
      caption: 'LALR merges states with equal cores and unions their lookaheads.',
      detail: 'Build the canonical collection, group the states whose cores are equal, and replace each group by one state. On an item, the lookahead becomes the union of the lookaheads that item had in the members of the group.',
      narration: 'LALR merges states with equal cores and unions their lookaheads.',
      keyword: 'unions',
      trap: 'Unioning lookaheads across different items. Only the same production-and-dot pairs are merged.'
    },
    {
      id: 'm-2', scene: 'merge', start: 157.5, end: 165,
      caption: 'On S -> C C three merges take 10 states down to 7.',
      detail: 'I3 merges with I6, I4 with I7, I8 with I9. The item C -> d . keeps lookaheads c and d from one member and the end marker from the other, so the merged lookahead is the union of all three.',
      narration: 'Three merges take ten states down to seven.',
      keyword: 'three merges',
      trap: 'Expecting the merged count to be a compromise. It is exactly the LR(0) count.'
    },
    {
      id: 'm-3', scene: 'merge', start: 165, end: 172.5,
      caption: 'Here the union is exactly FOLLOW of C, so no cell gains a second action.',
      detail: 'On this grammar the merge is free: the merged lookahead set happens to be the full FOLLOW set, and no cell ends up holding both a shift and a reduce. The page confirms zero conflicts in the merged table.',
      narration: 'Here the union is exactly FOLLOW of C, so no cell gains a second action.',
      keyword: 'free',
      trap: 'Assuming every merge is free. The next scene is a grammar where it is not.'
    },
    {
      id: 'm-4', scene: 'merge', start: 172.5, end: 180,
      caption: 'The LALR count is the LR(0) count, always: every core is one state.',
      detail: 'Every LR(0) state is a core, and every distinct core becomes exactly one LALR state. So the two counts are equal, and both are equal to the SLR count. On the six grammars here, 69 canonical states merge into 51.',
      narration: 'The LALR count is the LR(0) count, always, because every core is one state.',
      keyword: 'always',
      trap: 'The commonest wrong option on this topic: that LALR has more states than SLR.'
    },

    /* ---------- scene 7 ---------- */
    {
      id: 'g-1', scene: 'gb', start: 180, end: 187.5,
      caption: 'This grammar generates four strings: acd, bcd, ace and bce.',
      detail: 'S -> a A d gives acd, S -> b B d gives bcd, S -> a B e gives ace, and S -> b A e gives bce. The grammar is unambiguous and it is LR(1): the page builds 14 canonical states with no conflict.',
      narration: 'This grammar generates four strings, and the canonical table for it is clean.',
      keyword: 'four strings',
      trap: 'Judging a grammar by its size. Six productions are enough to separate the two classes.'
    },
    {
      id: 'g-2', scene: 'gb', start: 187.5, end: 195,
      caption: 'After ac the state says B on e and A on d; after bc the two are swapped.',
      detail: 'Both states hold A -> c . and B -> c . , so both have the same core. In the first the lookaheads are e for B and d for A. In the second they are e for A and d for B. Each cell holds one action, so neither state conflicts.',
      narration: 'After ac the state says B on e and A on d; after bc the two are swapped.',
      keyword: 'swapped',
      trap: 'Seeing two states with the same items and assuming they are the same state. The lookahead is the difference.'
    },
    {
      id: 'g-3', scene: 'gb', start: 195, end: 202.5,
      caption: 'Merged, both lookaheads become d and e, so d and e each call two reductions.',
      detail: 'The union puts A -> c . and B -> c . on both terminals in the same cell. That is a reduce/reduce conflict on d and on e. The count goes from 14 states to 13 with a single merge, and two cells break.',
      narration: 'Merged, both lookaheads become d and e, so each of them calls two reductions.',
      keyword: 'two reductions',
      trap: 'Looking for a shift/reduce conflict. Merging cannot create one; this is reduce/reduce.'
    },
    {
      id: 'g-4', scene: 'gb', start: 202.5, end: 210,
      caption: 'Resolved in favour of the earlier production, the merged parser keeps 2 of the 4 strings.',
      detail: 'A generator that prefers the first production reduces c to A on both terminals. That is right for acd and for bce, and wrong for bcd and for ace. The canonical parser accepts all four. So the grammar is LR(1) and not LALR(1), and the difference is two strings.',
      narration: 'Resolved to the earlier production, the merged parser keeps two of the four strings.',
      keyword: '2 of 4',
      trap: 'Thinking the merged parser is merely less efficient. It rejects strings of the language.'
    },

    /* ---------- scene 8 ---------- */
    {
      id: 'w-1', scene: 'what', start: 210, end: 217.5,
      caption: 'A merge cannot create a shift/reduce conflict.',
      detail: 'Suppose the merged state both shifts and reduces on a terminal a. The shift needs an item with the dot before a, and whether such an item exists depends only on the core, so every member of the group has it too.',
      narration: 'A merge cannot create a shift/reduce conflict.',
      keyword: 'cannot',
      trap: 'Assuming any merge can produce any conflict. The two kinds behave differently.'
    },
    {
      id: 'w-2', scene: 'what', start: 217.5, end: 225,
      caption: 'A member that also holds the completed item was already in conflict.',
      detail: 'Take the member that holds A -> alpha . with lookahead a. It has the shift, from the core item, and the reduce, from its own completed item. So the conflict existed before the merge. Merging preserves shift/reduce conflicts exactly.',
      narration: 'A member that also holds the completed item was already in conflict, so the merge adds nothing.',
      keyword: 'already in conflict',
      trap: 'Forgetting that the shift side is core-determined while the reduce side is not.'
    },
    {
      id: 'w-3', scene: 'what', start: 225, end: 232.5,
      caption: 'Reduce/reduce is different: two members can hold different completed items.',
      detail: 'A -> c . and B -> c . are different items, so different members can complete different ones with complementary lookaheads. The union then puts both reductions in one cell. That is exactly what happens on the four-string grammar.',
      narration: 'Reduce/reduce is different, because two members can complete different items.',
      keyword: 'different items',
      trap: 'Treating reduce/reduce as the harmless kind. It is the only kind merging can create.'
    },
    {
      id: 'w-4', scene: 'what', start: 232.5, end: 240,
      caption: 'S -> A | B with A -> a and B -> a conflicts in LR(1) itself: 5 states, no merges.',
      detail: 'This grammar is ambiguous, so no LR table can be conflict-free. The reduce/reduce cell on the end marker is present in the canonical table with nothing merged at all. Merging is a source of conflicts, not the source.',
      narration: 'S to A or B with both producing a conflicts in LR(1) itself, with no merges at all.',
      keyword: 'no merges',
      trap: 'Blaming LALR for every reduce/reduce conflict. Some grammars are simply not LR(1).'
    },

    /* ---------- scene 9 ---------- */
    {
      id: 'n-1', scene: 'counts', start: 240, end: 247.5,
      caption: 'Six grammars, four automata each: the page builds and counts all of them.',
      detail: 'The table shows the LR(0), SLR, LALR and canonical LR(1) counts and the conflicts each table has. Nothing in it is remembered: every cell comes from the tables built at load time.',
      narration: 'Six grammars, four automata each, all built and counted on load.',
      keyword: 'built on load',
      trap: 'Memorising a state count from a textbook. The question usually changes the grammar.'
    },
    {
      id: 'n-2', scene: 'counts', start: 247.5, end: 255,
      caption: 'SLR and LALR always tie; canonical LR(1) never has fewer states.',
      detail: 'Both use the LR(0) automaton, so both have its state count. Canonical LR(1) refines it and can only split states, never merge them, so its count is at least as large. On these six grammars it is 69 against 51.',
      narration: 'SLR and LALR always tie, and canonical LR(1) never has fewer states.',
      keyword: 'never fewer',
      trap: 'Reading a larger state count as more parsing power in the wrong direction.'
    },
    {
      id: 'n-3', scene: 'counts', start: 255, end: 262.5,
      caption: 'GC is the witness for SLR below LALR: one shift/reduce for SLR, none for LALR.',
      detail: 'The assignment grammar has a shift/reduce conflict in its SLR table and a clean LALR table, on the same ten states. That is the strict step between the second and third rungs, and it needs no change of automaton at all.',
      narration: 'The assignment grammar witnesses SLR below LALR: one conflict for SLR and none for LALR.',
      keyword: 'witness',
      trap: 'Assuming a grammar that is not SLR must be LALR. It may be neither.'
    },
    {
      id: 'n-4', scene: 'counts', start: 262.5, end: 270,
      caption: 'GB witnesses LALR below LR(1); GE and GF fail at LR(1) itself.',
      detail: 'So each strict step of the ladder has a witness here, and two of the six grammars sit outside it entirely. That is the shape of the four classes: nested, each inclusion strict, and not everything inside the outermost one.',
      narration: 'GB witnesses LALR below LR(1), and two grammars fail at LR(1) itself.',
      keyword: 'strict steps',
      trap: 'Believing every unambiguous grammar is LR(1). None of these four classes contains all of them.'
    },

    /* ---------- scene 10 ---------- */
    {
      id: 'p-1', scene: 'proc', start: 270, end: 277.5,
      caption: 'Five steps: grammar, FIRST, LR(0) automaton, canonical items, merge.',
      detail: 'Add the augmented start production first. Compute FIRST and nullable to a fixed point. Build the LR(0) automaton. Then rebuild it with lookaheads, and only then merge equal cores and union the lookaheads.',
      narration: 'Five steps: the grammar, FIRST, the LR(0) automaton, the canonical items, and the merge.',
      keyword: 'five steps',
      trap: 'Merging before the canonical items exist. There is nothing to union yet.'
    },
    {
      id: 'p-2', scene: 'proc', start: 277.5, end: 285,
      caption: 'If the canonical table already conflicts, stop: the grammar is not LR(1).',
      detail: 'Merging cannot remove a conflict, because every canonical action survives the union. So a conflict in the canonical table settles the question, and no amount of state merging helps. GE and GF are the two examples on this page.',
      narration: 'If the canonical table already conflicts, stop: the grammar is not LR(1).',
      keyword: 'stop',
      trap: 'Continuing to merge in the hope that the conflict disappears. The union only adds actions.'
    },
    {
      id: 'p-3', scene: 'proc', start: 285, end: 292.5,
      caption: 'GATE 2005: S -> ( S ) | a gives 6 SLR, 10 canonical and 6 LALR states.',
      detail: 'So the SLR count and the LALR count are equal and both are smaller than the canonical count. The page computes the three numbers rather than quoting them, and gets the same answer on the other reading of the production that the compilation garbles.',
      narration: 'On the GATE 2005 grammar, six SLR states, ten canonical and six LALR.',
      keyword: '6, 10, 6',
      trap: 'Answering from a remembered pattern without checking that the grammar is the one in the question.'
    },
    {
      id: 'p-4', scene: 'proc', start: 292.5, end: 300,
      caption: 'Four traps: counts tie, no new shift/reduce, LR(1) can conflict, counts are not power.',
      detail: 'LALR and SLR have the same state count. Merging preserves shift/reduce conflicts and can only create reduce/reduce. A canonical table can conflict, because some grammars are not LR(1). And a count is a count, not a measure of what the parser can accept.',
      narration: 'Four traps: the counts tie, merging cannot create shift/reduce, LR(1) can conflict, and counts are not power.',
      keyword: 'four traps',
      trap: 'Choosing the option that sounds strongest rather than the one the table proves.'
    }
  ]
};
