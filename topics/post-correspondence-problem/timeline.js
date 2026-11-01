/* ==========================================================================
   post-correspondence-problem — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js, which
   searches the instances, checks the prefix invariant, counts the nodes, runs
   the unary decider, performs the MPCP-to-PCP padding and builds the ambiguity
   word — and re-checks each one by a second route before anything is drawn.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 372,

  scenes: [
    {
      id: "dominoes", n: 1,
      title: "An instance is a handful of dominoes",
      start: 0, end: 30,
      objective: "State what one PCP instance is, and what a match is, without any notation."
    },
    {
      id: "match", n: 2,
      title: "One instance, one match, built a domino at a time",
      start: 30, end: 60,
      objective: "Assemble a real match and see the two strings agree only at the end."
    },
    {
      id: "prefix", n: 3,
      title: "The overhang: the only pruning a search has",
      start: 60, end: 92,
      objective: "State and use the invariant that at every partial match one string is a prefix of the other."
    },
    {
      id: "search", n: 4,
      title: "The search, and what it costs",
      start: 92, end: 124,
      objective: "Count the work of a pruned search against an unpruned enumeration, and see why the match is minimal."
    },
    {
      id: "neverends", n: 5,
      title: "The instance where the search never ends",
      start: 124, end: 158,
      objective: "Watch an overhang grow without bound, and see why no finite run can report 'no match'."
    },
    {
      id: "mpcp", n: 6,
      title: "Fixing the first domino: MPCP and its padding",
      start: 158, end: 192,
      objective: "Define MPCP and convert it to PCP by padding, so that the first domino is forced."
    },
    {
      id: "reduction", n: 7,
      title: "The reduction: a match is an accepting history",
      start: 192, end: 228,
      objective: "See the seven kinds of domino that make a match equivalent to a halting computation, and state the theorem."
    },
    {
      id: "ambiguity", n: 8,
      title: "Consequence: grammar ambiguity is undecidable",
      start: 228, end: 262,
      objective: "Build the grammar L_U union L_V and see a PCP match become two derivations of one word."
    },
    {
      id: "emptiness", n: 9,
      title: "Consequences: intersection, equivalence, and where the line is",
      start: 262, end: 292,
      objective: "Separate the undecidable questions about context-free grammars from the decidable ones about regular languages."
    },
    {
      id: "unary", n: 10,
      title: "The boundary: one letter makes it decidable",
      start: 292, end: 324,
      objective: "Run the three-line decider for a one-letter alphabet and see exactly which condition it turns on."
    },
    {
      id: "traps", n: 11,
      title: "The four slips that cost marks",
      start: 324, end: 352,
      objective: "Separate 'undecidable' from 'no solution', 'not found' from 'not there', and PCP from Rice."
    },
    {
      id: "summary", n: 12,
      title: "One object, four consequences",
      start: 352, end: 372,
      objective: "Consolidate the definition, the invariant, the theorem and the one alphabet where it fails."
    },
  ],

  events: [
    /* ---------------- scene 1: dominoes ---------------- */
    {
      id: "e1", scene: "dominoes", start: 0, end: 6,
      caption: "A domino has a string on top and a string on the bottom. That is all an instance is made of.",
      detail: "Each domino is a pair of finite strings over a fixed alphabet. Four such pairs are drawn here, and the whole of this lesson is about what can be done with them.",
      narration: "A domino carries a string on top and a string on the bottom.",
      keyword: "a string on top and a string on the bottom",
      trap: "The two strings of a domino are independent. Nothing forces them to have the same length, or the same first letter."
    },
    {
      id: "e2", scene: "dominoes", start: 6, end: 12,
      caption: "You are given a finite set of dominoes, and you may use each one as many times as you like.",
      detail: "The input is a finite list of pairs. Repetition is allowed, so the search space is infinite even though the input is finite. This is the first place a student assumes a bound that does not exist.",
      narration: "You may reuse any domino any number of times.",
      keyword: "as many times as you like",
      trap: "Reuse is allowed. A search that forbids reuse is solving a different, easier problem."
    },
    {
      id: "e3", scene: "dominoes", start: 12, end: 18,
      caption: "A match is an ordering of dominoes whose top strings, read in order, equal its bottom strings, read in order.",
      detail: "Formally, a nonempty sequence of indices i1 to ik is a match when the concatenation of the top strings equals the concatenation of the bottom strings for the same index sequence.",
      narration: "A match is an ordering where the two rows read the same string.",
      keyword: "an ordering of dominoes",
      trap: "The same index sequence is used on both rows. A 'match' that picks one order for the top and another for the bottom is not a match."
    },
    {
      id: "e4", scene: "dominoes", start: 18, end: 24,
      caption: "The problem is not to find a match. It is to decide, for an arbitrary instance, whether one exists.",
      detail: "Finding a match when one is given to you is easy. Deciding existence for every possible instance is the decision problem, and that is what is undecidable.",
      narration: "The question is existence, for every instance.",
      keyword: "decide",
      trap: "This distinction decides half the questions on the topic. Checking a candidate is trivial; deciding whether one exists is not."
    },
    {
      id: "e5", scene: "dominoes", start: 24, end: 30,
      caption: "Emil Post posed exactly this in 1946, and called it the correspondence decision problem.",
      detail: "Post's 1946 paper states the problem over the two-letter alphabet and proves it recursively unsolvable. It is named the Post Correspondence Problem today, and it is the standard tool for proving other problems undecidable.",
      narration: "Post posed it in 1946 and proved it unsolvable.",
      keyword: "1946",
      trap: "PCP is not a toy. It is used to prove that grammar ambiguity, CFL intersection emptiness and CFG equivalence are undecidable."
    },

    /* ---------------- scene 2: match ---------------- */
    {
      id: "e6", scene: "match", start: 30, end: 36,
      caption: "Here is one instance: a over ab, b over aa, aa over a, ab over b.",
      detail: "Four dominoes, two letters, no domino with equal strings. The model searches this instance exhaustively before anything is claimed about it.",
      narration: "Four dominoes over two letters.",
      keyword: "four dominoes",
      trap: "No domino has equal top and bottom, so a length-one match is already impossible. That is the first thing to check, and it is cheap."
    },
    {
      id: "e7", scene: "match", start: 36, end: 42,
      caption: "Place domino one: top reads a, bottom reads ab. The bottom is one letter ahead.",
      detail: "After one domino the two rows already disagree in length. They are allowed to disagree while the match is being built; only the finished row must be equal.",
      narration: "The rows may disagree while you are still building.",
      keyword: "one letter ahead",
      trap: "A partial match is not required to be equal. Requiring equality at every step would reject every real match."
    },
    {
      id: "e8", scene: "match", start: 42, end: 48,
      caption: "Add domino two: top ab, bottom abaa. Add domino three: top abaa, bottom abaaa.",
      detail: "Each added domino appends to both rows at once. The gap never reverses direction here: the bottom stays ahead of the top at every step.",
      narration: "Each domino appends to both rows.",
      keyword: "appends to both rows",
      trap: "The gap can change sign in other instances. Here it does not, which is why one branch survives."
    },
    {
      id: "e9", scene: "match", start: 48, end: 54,
      caption: "Add domino three again, and the two rows both read abaaaa.",
      detail: "The sequence 1, 2, 3, 3 is a match. Both rows read the same six letters. The model verifies the equality character by character rather than trusting the display.",
      narration: "Both rows read the same six letters.",
      keyword: "abaaaa",
      trap: "The index sequence 1, 2, 3, 3 repeats domino three. A search that disallowed repetition would miss this match entirely."
    },
    {
      id: "e10", scene: "match", start: 54, end: 60,
      caption: "Nothing was needed beyond the four dominoes: the match is the ordering 1, 2, 3, 3.",
      detail: "The match uses three of the four dominoes and one of them twice. The page's model found it by search, then re-checked the concatenations independently.",
      narration: "One match, four dominoes, one of them twice.",
      keyword: "1, 2, 3, 3",
      trap: "A match is an ordering, not a subset. Two different orderings of the same dominoes are two different matches."
    },

    /* ---------------- scene 3: prefix ---------------- */
    {
      id: "e11", scene: "prefix", start: 60, end: 66,
      caption: "At every step of a match, one row is a prefix of the other. That is the invariant.",
      detail: "If the finished rows are equal, then every prefix of the build has one row a prefix of the other: the shorter row can only be the beginning of the longer one. This is forced, not assumed.",
      narration: "At every step, one row is a prefix of the other.",
      keyword: "a prefix of the other",
      trap: "The invariant is necessary, never sufficient. Satisfying it at every step does not guarantee a match exists."
    },
    {
      id: "e12", scene: "prefix", start: 66, end: 72,
      caption: "The unmatched tail is called the overhang, and its length is the difference of the two row lengths.",
      detail: "After domino one the bottom is one letter ahead, so the overhang is the single letter b on the bottom. The overhang is what a search must eventually cancel.",
      narration: "The unmatched tail is the overhang.",
      keyword: "overhang",
      trap: "The overhang is a string, not a count. Two branches with the same overhang length can behave completely differently."
    },
    {
      id: "e13", scene: "prefix", start: 72, end: 78,
      caption: "A branch survives only if the new overhang stays compatible. This is the only pruning there is.",
      detail: "When a domino is appended, the two rows must still agree on the shorter length. If they differ inside that common part, no future domino can repair it, because appending never changes letters already written.",
      narration: "Appending never repairs a letter already written.",
      keyword: "only pruning",
      trap: "This is why the search is a tree and not a finite graph: there is no way to merge branches, because the overhang string is unbounded."
    },
    {
      id: "e14", scene: "prefix", start: 78, end: 84,
      caption: "On this match the overhang is b, then aa, then a, then nothing.",
      detail: "Each row of the panel shows one step. The lengths are one against two, two against four, four against five, then six against six. The overhang never vanishes until the last step.",
      narration: "b, then aa, then a, then nothing.",
      keyword: "then nothing",
      trap: "An overhang that shrinks to nothing is a match. An overhang that returns to a value already seen is not automatically a cycle, because the strings may differ."
    },
    {
      id: "e15", scene: "prefix", start: 84, end: 92,
      caption: "Every prefix of the model's match was checked, and all four satisfy the invariant.",
      detail: "The page's model tests the prefix condition at each of the four steps of the found match and reports the result under the canvas. The check is on the strings, not on the picture.",
      narration: "All four prefixes satisfy the invariant.",
      keyword: "checked",
      trap: "The invariant is what makes the search a search. Without it the tree has no pruning at all and the arithmetic in the next scene is wrong."
    },

    /* ---------------- scene 4: search ---------------- */
    {
      id: "e16", scene: "search", start: 92, end: 98,
      caption: "A search grows level by level: every sequence of one domino, then two, then three.",
      detail: "Level k of the tree holds the surviving sequences of exactly k dominoes. The tree is explored breadth first so that the first match found is the shortest one.",
      narration: "Breadth first, so the first match is the shortest.",
      keyword: "breadth first",
      trap: "Depth-first search can wander down an infinite branch and never return, even when a match exists three levels away."
    },
    {
      id: "e17", scene: "search", start: 98, end: 104,
      caption: "Unpruned, the first three levels hold 4, 16 and 64 sequences: 84 in all.",
      detail: "With four dominoes there are four sequences of length one, sixteen of length two and sixty-four of length three. Every one of them must be built and compared if nothing is pruned.",
      narration: "Four, sixteen and sixty-four, so eighty-four.",
      keyword: "84",
      trap: "The count grows as four to the k. A bound of twenty dominoes is already a trillion sequences."
    },
    {
      id: "e18", scene: "search", start: 104, end: 110,
      caption: "With the prefix test the same three levels hold 2, 2 and 4 survivors, and twelve nodes are examined in total.",
      detail: "The pruning removes almost everything, because most sequences break the prefix condition within two dominoes. Twelve nodes against eighty-four sequences is the whole value of the invariant.",
      narration: "Twelve nodes against eighty-four sequences.",
      keyword: "twelve nodes",
      trap: "Pruning changes the constant, never the fact that the tree is infinite. It is not an algorithm for deciding the problem."
    },
    {
      id: "e19", scene: "search", start: 110, end: 116,
      caption: "The match sits at level four, and the model confirms no match exists at levels one, two or three.",
      detail: "Minimality is not inferred from the breadth-first order alone: the model enumerates every sequence of lengths one to three and checks for equality, and reports that none is a match.",
      narration: "No match exists below level four.",
      keyword: "levels one, two or three",
      trap: "'Breadth-first found it at level four' and 'nothing matches below four' are two different claims. Only the second is a proof of minimality."
    },
    {
      id: "e20", scene: "search", start: 116, end: 124,
      caption: "This run terminated because a match exists. When none exists, the same run never stops.",
      detail: "A search that halts on success is a semidecision procedure: it says yes correctly, and says nothing at all in the no case. That asymmetry is exactly what undecidability means here.",
      narration: "A search that halts on success is only half a decider.",
      keyword: "semidecision",
      trap: "A program that answers yes correctly and loops otherwise is not a decider. Writing one is not a proof that the problem is decidable."
    },

    /* ---------------- scene 5: neverends ---------------- */
    {
      id: "e21", scene: "neverends", start: 124, end: 130,
      caption: "Here is an instance with no match: a over ab, b over bb, ba over b.",
      detail: "Three dominoes. The model searches to depth twelve and finds nothing, and reports the frontier at each depth rather than a verdict.",
      narration: "An instance with no match.",
      keyword: "no match",
      trap: "The phrase 'the model found no match' is an observation about a bound. It is not a proof that no match exists."
    },
    {
      id: "e22", scene: "neverends", start: 130, end: 136,
      caption: "Every surviving branch has the bottom longer than the top, by one more letter at each level.",
      detail: "The overhang length runs one, two, three, four, five and so on. The gap never closes, so no branch ever reaches equality.",
      narration: "The gap grows by one letter per domino.",
      keyword: "one more letter",
      trap: "A growing overhang is evidence, not proof. The undecidability theorem is what rules out any cleverer search."
    },
    {
      id: "e23", scene: "neverends", start: 136, end: 142,
      caption: "Two branches survive at every depth after the first, forever. The frontier never empties.",
      detail: "An empty frontier would end the search with a correct no. A frontier that stays nonempty forever gives the search nothing to report, at any depth.",
      narration: "The frontier never empties.",
      keyword: "never empties",
      trap: "'The frontier is nonempty' means 'not finished yet'. It does not mean 'a match is coming'."
    },
    {
      id: "e24", scene: "neverends", start: 142, end: 148,
      caption: "So a bounded search can prove a yes and can never prove a no.",
      detail: "Running to depth k and finding a match is a proof of yes. Running to depth k and finding nothing is a statement about depth k only.",
      narration: "A bounded search can prove yes, never no.",
      keyword: "never prove a no",
      trap: "This asymmetry is the same one that separates recursively enumerable from recursive, and GATE asks it in that language too."
    },
    {
      id: "e25", scene: "neverends", start: 148, end: 152,
      caption: "There is one cheap no: if every top begins with a and every bottom with b, no match can start.",
      detail: "Post's own paper notes this case. A single letter test on the first characters settles the instance, and the frontier dies at depth one with nothing to explore.",
      narration: "One cheap no: the first letters disagree everywhere.",
      keyword: "first letters",
      trap: "A sufficient condition for no match is not a decision procedure. It settles some instances and says nothing about the rest."
    },
    {
      id: "e26", scene: "neverends", start: 152, end: 158,
      caption: "Special cases are decidable. The general problem is not, and that is a theorem, not an observation.",
      detail: "The distinction matters: 'we could not decide this instance' and 'no algorithm decides every instance' are different claims, and only the second is Post's theorem.",
      narration: "Special cases decide; the general problem does not.",
      keyword: "a theorem, not an observation",
      trap: "Never present a failed search as a proof of undecidability. The proof is the reduction in the next two scenes."
    },

    /* ---------------- scene 6: mpcp ---------------- */
    {
      id: "e27", scene: "mpcp", start: 158, end: 164,
      caption: "MPCP is the same problem with one extra rule: the match must start with the first domino.",
      detail: "The input names a distinguished domino, and every match must begin with it. This restriction makes the reduction from Turing machines much easier to write, because a computation has a fixed starting configuration.",
      narration: "MPCP forces the match to start with domino one.",
      keyword: "must start with the first domino",
      trap: "MPCP is not easier in the sense that matters: it is undecidable too, and it reduces to PCP, not the other way round."
    },
    {
      id: "e28", scene: "mpcp", start: 164, end: 170,
      caption: "This MPCP instance has the match 1, 3: a over aa, then aa over a, both rows reading aaa.",
      detail: "Three dominoes, and the match uses the first and the third. The model searches with the first domino fixed and verifies the two rows agree.",
      narration: "The match is one then three, both rows aaa.",
      keyword: "aaa",
      trap: "In MPCP the first domino is not optional. A match that happens to start elsewhere is not a match for the MPCP instance."
    },
    {
      id: "e29", scene: "mpcp", start: 170, end: 176,
      caption: "To turn it into a PCP instance, interleave a new symbol between every pair of letters.",
      detail: "Write a star before every letter on the top, and a star after every letter on the bottom. The original letters then sit in the even positions of any match, and the stars cannot be confused with them.",
      narration: "Interleave a star through every string.",
      keyword: "interleave",
      trap: "The padding must go on opposite sides of the two rows. Padding both rows the same way leaves the first-domino requirement unenforced."
    },
    {
      id: "e30", scene: "mpcp", start: 176, end: 182,
      caption: "The first domino is padded on both sides, so it is the only one whose two rows start with the same symbol.",
      detail: "That single fact forces every PCP match to begin with domino one, which is exactly the MPCP condition, now built into the instance instead of stated outside it.",
      narration: "Only domino one can start a match.",
      keyword: "the only one",
      trap: "Check this claim on the actual instance. If two dominoes could start, the padding has been done wrong."
    },
    {
      id: "e31", scene: "mpcp", start: 182, end: 188,
      caption: "One extra domino adds the missing star at the end, and the match is complete.",
      detail: "The final domino is a star-at over at. It contributes the trailing star the top still needs, and it cannot be used anywhere else.",
      narration: "One domino closes the match.",
      keyword: "closes the match",
      trap: "Without the closing domino the padded instance has no match even when the MPCP instance does. The construction is only correct as a whole."
    },
    {
      id: "e32", scene: "mpcp", start: 188, end: 192,
      caption: "The padded match is 1, 4, 5 and reads star a star a star a star at on both rows.",
      detail: "Stripping the stars and the closing domino recovers the MPCP match 1, 3. The model checks both directions on this instance and reports the result.",
      narration: "Strip the stars and the MPCP match is back.",
      keyword: "strip the stars",
      trap: "The correspondence is an if-and-only-if. A construction that maps matches one way only does not prove undecidability."
    },

    /* ---------------- scene 7: reduction ---------------- */
    {
      id: "e33", scene: "reduction", start: 192, end: 198,
      caption: "The reduction starts from a Turing machine and its input, and builds dominoes out of the machine's own rules.",
      detail: "The machine is described by a tape alphabet, a state set and a transition table. The dominoes are built from the transition table, one kind per row of the table.",
      narration: "Dominoes are built out of the machine's transition table.",
      keyword: "out of the machine's own rules",
      trap: "The reduction goes from the halting problem to PCP. It does not go from PCP to the halting problem, and the direction is what carries undecidability backwards."
    },
    {
      id: "e34", scene: "reduction", start: 198, end: 204,
      caption: "One domino starts the history, one copies a tape symbol, and one pair per transition moves the head.",
      detail: "The starting domino carries the initial configuration. A copy domino repeats a symbol that the head has left behind. A transition domino rewrites one symbol and moves the state marker left or right.",
      narration: "Start, copy, move.",
      keyword: "start, copy, move",
      trap: "The copy dominoes are what let the tape grow. Without them the match could only ever reproduce a fixed-length configuration."
    },
    {
      id: "e35", scene: "reduction", start: 204, end: 210,
      caption: "Two more kinds of domino let the accepting state eat the rest of the tape and finish.",
      detail: "Once the machine accepts, dominoes absorb the remaining symbols one at a time, and a final domino supplies the closing marker. Until the machine accepts, no match is possible.",
      narration: "The accepting state finishes the match.",
      keyword: "until the machine accepts",
      trap: "If the machine loops, no match exists. That is the whole content of the reduction: a match exists exactly when the machine accepts."
    },
    {
      id: "e36", scene: "reduction", start: 210, end: 216,
      caption: "So a match is exactly an accepting computation history, written twice.",
      detail: "The top row carries the history with the head marker, and the bottom row carries the same history one step behind. Equality at the end means the history is complete and ends in the accepting state.",
      narration: "A match is an accepting history, written twice.",
      keyword: "accepting computation history",
      trap: "The top and bottom rows are not two different histories. They are the same history read at a one-step offset, which is why a domino appends to both."
    },
    {
      id: "e37", scene: "reduction", start: 216, end: 222,
      caption: "If PCP were decidable, the halting problem would be, and it is not. So PCP is undecidable.",
      detail: "This is Post's 1946 theorem, and the modern proof runs through the halting problem: a decider for PCP would decide whether an arbitrary machine accepts an arbitrary input.",
      narration: "A decider for PCP would decide halting.",
      keyword: "would decide halting",
      trap: "The argument is a contradiction, not a construction. Nothing here computes an answer for a particular instance."
    },
    {
      id: "e38", scene: "reduction", start: 222, end: 228,
      caption: "The theorem needs at least two letters. With one letter the problem is decidable, and the next scenes show both sides.",
      detail: "The alphabet size is part of the hypothesis of the theorem. A statement of PCP's undecidability that omits it is false, and the unary case later in this lesson is the counterexample.",
      narration: "Two letters are needed for the theorem.",
      keyword: "at least two letters",
      trap: "State the hypothesis with the theorem. 'PCP is undecidable' without 'over an alphabet of at least two letters' is a false statement."
    },

    /* ---------------- scene 8: ambiguity ---------------- */
    {
      id: "e39", scene: "ambiguity", start: 228, end: 234,
      caption: "Give each domino its own marker letter, and build two languages, one from the tops and one from the bottoms.",
      detail: "The top language holds every word of the form tops followed by the markers in reverse order. The bottom language holds the same shape built from the bottom strings.",
      narration: "Two languages, one from the tops and one from the bottoms.",
      keyword: "markers in reverse order",
      trap: "The markers are what record the index sequence. Without them a word could not be traced back to the dominoes that produced it."
    },
    {
      id: "e40", scene: "ambiguity", start: 234, end: 240,
      caption: "Each language is context-free: one nonterminal, one production per domino.",
      detail: "The grammar for the top language has a production that emits a top string and pushes its marker onto the end. The same shape gives the bottom language.",
      narration: "One production per domino, and the language is context-free.",
      keyword: "one production per domino",
      trap: "The union of two context-free languages is context-free. Closure under union is one of the few operations that costs nothing here."
    },
    {
      id: "e41", scene: "ambiguity", start: 240, end: 246,
      caption: "A word in both languages has two derivations, and the markers force the same index sequence in both.",
      detail: "The marker suffix is read right to left, so two words that agree on the markers agree on the index sequence. Agreement on the tops and bottoms then means the sequence is a match.",
      narration: "The markers force the same index sequence.",
      keyword: "the same index sequence",
      trap: "This is why the construction needs distinct markers. With one shared marker the index sequences could differ and the argument collapses."
    },
    {
      id: "e42", scene: "ambiguity", start: 246, end: 252,
      caption: "On this instance the match 1, 2, 3, 3 gives one word with two derivations.",
      detail: "The word is the six letters of the match followed by the markers of 3, 3, 2, 1 in reverse. The model builds it from the top side and from the bottom side and compares the two strings.",
      narration: "One word, two derivations.",
      keyword: "two derivations",
      trap: "The word is ambiguous as a word of the union. A word that lies in only one of the two languages has exactly one derivation, however it looks."
    },
    {
      id: "e43", scene: "ambiguity", start: 252, end: 258,
      caption: "A sequence that is not a match gives two different words, so it produces no ambiguity.",
      detail: "For the sequence 1, 2 the top word and the bottom word differ in the letter positions. The model checks the inequality, so the construction is tested in both directions.",
      narration: "A non-match gives two different words.",
      keyword: "two different words",
      trap: "Ambiguity of a grammar is a property of the grammar, not of a word. The reduction builds a grammar that is ambiguous exactly when the instance has a match."
    },
    {
      id: "e44", scene: "ambiguity", start: 258, end: 262,
      caption: "So deciding ambiguity would decide PCP. Ambiguity of a context-free grammar is undecidable.",
      detail: "The contrapositive is the useful form: no algorithm reads an arbitrary grammar and correctly answers 'ambiguous' or 'unambiguous' for all of them.",
      narration: "Deciding ambiguity would decide PCP.",
      keyword: "undecidable",
      trap: "For a particular grammar you can often answer. Undecidability is about one algorithm covering every input, not about every input being hard."
    },

    /* ---------------- scene 9: emptiness ---------------- */
    {
      id: "e45", scene: "emptiness", start: 262, end: 268,
      caption: "The same construction settles two more questions about context-free grammars.",
      detail: "Whether two context-free grammars generate a common word, and whether two generate the same language, are both undecidable, and both follow from a PCP reduction.",
      narration: "Two more questions fall the same way.",
      keyword: "two more questions",
      trap: "These are questions about grammars given as input. A single pair of grammars may be settled by hand; the general question has no algorithm."
    },
    {
      id: "e46", scene: "emptiness", start: 268, end: 274,
      caption: "Intersection emptiness is undecidable for two context-free languages.",
      detail: "Deciding whether two context-free grammars share a word would decide PCP, because the two languages of the previous scene share a word exactly when the instance has a match.",
      narration: "Intersection emptiness is undecidable.",
      keyword: "intersection emptiness",
      trap: "Do not confuse this with non-closure. Non-closure says the intersection may not be context-free; it does not say emptiness cannot be decided."
    },
    {
      id: "e47", scene: "emptiness", start: 274, end: 280,
      caption: "But intersection with a regular language is decidable, and so is everything about regular languages.",
      detail: "Emptiness, finiteness, membership, universality and equivalence are all decidable for regular languages, and emptiness of a context-free language intersected with a regular one is decidable too.",
      narration: "Regular languages keep every one of these decisions.",
      keyword: "decidable",
      trap: "The line is the class, not the operation. The same question flips from decidable to undecidable when a regular language becomes context-free."
    },
    {
      id: "e48", scene: "emptiness", start: 280, end: 286,
      caption: "Equivalence of two context-free grammars is undecidable; equivalence of two regular expressions is decidable.",
      detail: "For regular expressions the product construction gives a finite check. For context-free grammars no such construction exists, and the PCP reduction is what proves it.",
      narration: "Equivalence: decidable for regular, undecidable for context-free.",
      keyword: "equivalence",
      trap: "This pair is asked directly. Answer by class first, then by question."
    },
    {
      id: "e49", scene: "emptiness", start: 286, end: 292,
      caption: "Every one of these results is a PCP reduction wearing different clothes.",
      detail: "The same dominoes prove ambiguity, intersection emptiness and inequivalence. Learning the reduction once buys all three answers.",
      narration: "One reduction, three answers.",
      keyword: "PCP reduction",
      trap: "If a question asks why a CFL problem is undecidable, the acceptable answer names a reduction. A search that failed is not an answer."
    },

    /* ---------------- scene 10: unary ---------------- */
    {
      id: "e50", scene: "unary", start: 292, end: 298,
      caption: "Now the counterexample to the theorem's hypothesis: an alphabet with one letter.",
      detail: "Every string is a run of the same letter, so a domino is fully described by two lengths. The problem changes character completely.",
      narration: "One letter, and everything is a length.",
      keyword: "one letter",
      trap: "This is the counterexample that makes the hypothesis load-bearing. Without it the theorem would be false, not merely imprecise."
    },
    {
      id: "e51", scene: "unary", start: 298, end: 304,
      caption: "Each domino has a difference: top length minus bottom length. A match needs differences that sum to zero.",
      detail: "In the unary case the prefix condition is free, because any two runs of the same letter are prefix-comparable. So the only condition left is that the differences cancel.",
      narration: "Only the differences matter.",
      keyword: "differences that sum to zero",
      trap: "This simplification is special to one letter. With two letters, two different strings of the same length are not comparable, and the prefix test is real work."
    },
    {
      id: "e52", scene: "unary", start: 304, end: 310,
      caption: "Three cases decide it. A zero difference wins at once; all differences the same sign loses at once.",
      detail: "A domino whose two strings are equal is a match by itself. If every difference is positive the sum can never be zero, and the same if every difference is negative.",
      narration: "Zero wins; one sign loses.",
      keyword: "zero wins, one sign loses",
      trap: "The zero case is easy to miss, and it is the case the second example on this page turns on."
    },
    {
      id: "e53", scene: "unary", start: 310, end: 316,
      caption: "Otherwise one domino is positive and one is negative, and a fixed number of copies of each cancels exactly.",
      detail: "If the positive difference is a and the negative is minus b, then b copies of the positive domino and a copies of the negative one give a total of zero. The construction is explicit, so the decider can print the match.",
      narration: "Copies of each cancel exactly.",
      keyword: "cancel exactly",
      trap: "The construction needs both signs present. With one sign present the sum never returns to zero, whatever the multiplicities."
    },
    {
      id: "e54", scene: "unary", start: 316, end: 320,
      caption: "The model runs this decider on three instances and agrees with a brute-force search on all three.",
      detail: "One instance has differences plus one and minus two, one has plus one and plus two, and one has a zero difference. The decider and the search give the same verdict every time.",
      narration: "The decider agrees with brute force.",
      keyword: "agrees with brute force",
      trap: "Agreement on three instances is a check of the implementation, not a proof of the decider. The proof is the three-case argument above."
    },
    {
      id: "e55", scene: "unary", start: 320, end: 324,
      caption: "So the undecidability theorem is about two letters, and the encoding into two letters is why that is enough.",
      detail: "Any finite alphabet can be encoded into two letters, and the encoding preserves matches. Two letters are therefore the hardest case, and the theorem needs no more.",
      narration: "Two letters are enough to be hard.",
      keyword: "two letters are enough",
      trap: "Do not state the result as 'PCP is undecidable' without the alphabet. The unary case is a counterexample, not an exception to be ignored."
    },

    /* ---------------- scene 11: traps ---------------- */
    {
      id: "e56", scene: "traps", start: 324, end: 330,
      caption: "First slip: 'the search found no match, so there is none'.",
      detail: "A bounded search proves a yes when it finds a match, and proves nothing when it does not. This is the single most common wrong answer on the topic.",
      narration: "Finding nothing proves nothing.",
      keyword: "proves nothing",
      trap: "Write the bound into the sentence. 'No match of length at most k' is a true statement; 'no match' is not."
    },
    {
      id: "e57", scene: "traps", start: 330, end: 336,
      caption: "Second slip: 'undecidable' taken to mean 'this instance has no solution'.",
      detail: "Undecidability is a statement about the absence of one algorithm covering all instances. A particular instance may have a match that you can print, or may have none that you can prove.",
      narration: "Undecidable is about algorithms, not instances.",
      keyword: "about algorithms",
      trap: "A decidable problem can have hard instances, and an undecidable problem can have easy ones. The words are about the general question."
    },
    {
      id: "e58", scene: "traps", start: 336, end: 342,
      caption: "Third slip: confusing checking a given match with deciding whether one exists.",
      detail: "Checking a proposed sequence is a walk along two strings and costs time proportional to their total length. Deciding existence is the undecidable question.",
      narration: "Checking is easy; deciding is not.",
      keyword: "checking is easy",
      trap: "If a question hands you a sequence and asks whether it is a match, that question is trivial. Read which question is being asked."
    },
    {
      id: "e59", scene: "traps", start: 342, end: 346,
      caption: "Fourth slip: reaching for Rice's theorem, which is about properties of languages, not about dominoes.",
      detail: "Rice's theorem classifies properties of the language a machine recognises. PCP is a different problem with its own reduction, and citing Rice for it is a non-answer.",
      narration: "Rice is about properties of languages.",
      keyword: "properties of languages",
      trap: "Both are undecidability results. Naming the wrong one costs the marks even when the verdict is right."
    },
    {
      id: "e60", scene: "traps", start: 346, end: 352,
      caption: "Every one of the four is a sentence that is true in one setting and false in the one being asked about.",
      detail: "Bound the claim, name the class, name the question, name the theorem. Four words of precision decide four marks.",
      narration: "Bound the claim and name the theorem.",
      keyword: "bound the claim",
      trap: "Precision here is not pedantry: the exam is testing exactly this distinction."
    },

    /* ---------------- scene 12: summary ---------------- */
    {
      id: "e61", scene: "summary", start: 352, end: 357.5,
      caption: "An instance is a finite set of pairs. A match is an ordering whose two rows read the same string.",
      detail: "Reuse is allowed, the rows need not agree until the end, and the question is existence for every instance.",
      narration: "Pairs, an ordering, two equal rows.",
      keyword: "two equal rows"
    },
    {
      id: "e62", scene: "summary", start: 357.5, end: 363,
      caption: "One row is always a prefix of the other. That is the only pruning, and it makes the search a tree.",
      detail: "The invariant is forced by the definition and it is the reason a search can be written at all. It never turns the search into a decider.",
      narration: "One prefix of the other, always.",
      keyword: "the only pruning"
    },
    {
      id: "e63", scene: "summary", start: 363, end: 366.5,
      caption: "Over two letters or more the problem is undecidable, and every CFL decision result follows from it.",
      detail: "Ambiguity, intersection emptiness and inequivalence of context-free grammars are the three consequences this lesson builds.",
      narration: "Undecidable over two letters, and three consequences.",
      keyword: "three consequences"
    },
    {
      id: "e64", scene: "summary", start: 366.5, end: 372,
      caption: "Over one letter it is decidable in three cases, and that is the counterexample the hypothesis needs.",
      detail: "The alphabet size is part of the theorem, not a detail of the proof. A learner who can state both halves can answer every question the syllabus asks about this problem.",
      narration: "One letter decides, and that is the counterexample.",
      keyword: "the counterexample"
    },
  ]
};
