/* ==========================================================================
   ambiguity-of-context-free-grammars — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js, and
   the model checks assert that the figure a caption states is the figure the
   computation produced.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'gap',
      n: 1,
      title: 'One string, two trees, two questions',
      start: 0, end: 30,
      objective: 'Separate two questions that share a word: is this grammar ambiguous, and could any grammar for these strings be unambiguous.'
    },
    {
      id: 'def',
      n: 2,
      title: 'A tree, not a derivation order',
      start: 30, end: 60,
      objective: 'State ambiguity as two distinct parse trees for one string, and show why two derivation orders are not two trees.'
    },
    {
      id: 'count',
      n: 3,
      title: 'The counter: one number per piece of the string',
      start: 60, end: 90,
      objective: 'Fill the span table for i+i+i, read the count of trees off the whole-string cell, and see why this settles one string in cubic time.'
    },
    {
      id: 'witness',
      n: 4,
      title: 'i+i*i, and the Catalan count',
      start: 90, end: 120,
      objective: 'Draw the two trees of i+i*i, and read the tree counts 1, 1, 2, 5, 14, 42 as the Catalan numbers over the operands.'
    },
    {
      id: 'repair',
      n: 5,
      title: 'Same language, one tree each',
      start: 120, end: 150,
      objective: 'Split one nonterminal into three levels, watch every count fall to 1, and check that no string changed sides.'
    },
    {
      id: 'dangle',
      n: 6,
      title: 'The dangling else: a repair that does not repair',
      start: 150, end: 180,
      objective: 'See the same failure in a language, and see that the obvious matched/unmatched repair stays ambiguous while the correct one does not.'
    },
    {
      id: 'derivs',
      n: 7,
      title: 'Three counters, not one',
      start: 180, end: 210,
      objective: 'Keep trees, leftmost derivations and derivation sequences apart, with the three numbers for i+i and i+i+i.'
    },
    {
      id: 'lang',
      n: 8,
      title: 'A grammar can be repaired; a language may not be',
      start: 210, end: 240,
      objective: 'Count the two trees of a to the n b to the n c to the n in the standard grammar for the inherently ambiguous language, and name the theorem.'
    },
    {
      id: 'reduce',
      n: 9,
      title: 'Why no program can decide it',
      start: 240, end: 270,
      objective: 'Build the grammar from a set of dominoes, and see that a match produces exactly the string with two trees while no match never does.'
    },
    {
      id: 'table',
      n: 10,
      title: 'What is decidable, and the four question shapes',
      start: 270, end: 300,
      objective: 'Sort the four decision problems, name the infinitely ambiguous grammar, and reduce every exam question to one of four shapes.'
    }
  ],

  events: [
    /* ---------------- scene 1: the gap ---------------- */
    { id: 'e1', scene: 'gap', start: 0, end: 6,
      caption: 'A grammar says how to build strings. Nothing in it promises to build each string in one way only.',
      detail: 'A context-free grammar is a finite set of rules. It defines a language, the set of strings it can build. It says nothing about how many different ways a particular string can be built, and that is what ambiguity is about.',
      narration: 'A grammar says how to build strings. Nothing in it promises to build each string in one way only.',
      keyword: 'one way only' },

    { id: 'e2', scene: 'gap', start: 6, end: 12,
      caption: 'The expression grammar E goes to E plus E, or E times E, or the operand i, builds i plus i times i in two ways.',
      detail: 'E is a nonterminal: a symbol that stands for a piece of a string. The vertical bars separate alternatives, and i is a single operand, written id in the exam papers. Read the three rules as: an expression is a sum, or a product, or an operand.',
      narration: 'The expression grammar E goes to E plus E, or E times E, or the operand i, builds i plus i times i in two ways.',
      keyword: 'two ways' },

    { id: 'e3', scene: 'gap', start: 12, end: 18,
      caption: 'The two ways are i plus i, all times i, and i plus, i times i. Different trees, different arithmetic.',
      detail: 'The first grouping adds before multiplying and gives two i squared; the second multiplies first and gives i plus i squared. The strings are identical. Only the structure differs, and the structure is the meaning.',
      narration: 'The two ways are i plus i, all times i, and i plus, i times i. Different trees, different arithmetic.',
      keyword: 'different trees' },

    { id: 'e4', scene: 'gap', start: 18, end: 24,
      caption: 'That is ambiguity of a grammar: one string, two parse trees. It is a property of the rules you were handed.',
      detail: 'A parse tree records which rule produced which piece of the string. Two distinct trees for the same string means the grammar is ambiguous. The claim is about this grammar, and it is proved by exhibiting the string and the two trees.',
      narration: 'That is ambiguity of a grammar: one string, two parse trees. It is a property of the rules you were handed.',
      keyword: 'two parse trees',
      trap: 'Two trees for one string proves the grammar ambiguous. It proves nothing about the language, which may well have another grammar with one tree per string.' },

    { id: 'e5', scene: 'gap', start: 24, end: 30,
      caption: 'The second question is about the language: is there any grammar for these strings with one tree each?',
      detail: 'A context-free language is inherently ambiguous when every grammar that generates it is ambiguous. That is a statement about all grammars at once, so no single example can establish it and no single counterexample can refute it.',
      narration: 'The second question is about the language: is there any grammar for these strings with one tree each?',
      keyword: 'about the language' },

    /* ---------------- scene 2: definition ---------------- */
    { id: 'e6', scene: 'def', start: 30, end: 36,
      caption: 'A parse tree has the start symbol at the root, one node per rule used, and the string along the bottom.',
      detail: 'Each internal node is a rule application: its label is the nonterminal on the left, and its children are the symbols on the right, in order. Reading the leaves left to right gives the string. So the tree is a picture of the derivation with the order of steps forgotten.',
      narration: 'A parse tree has the start symbol at the root, one node per rule used, and the string along the bottom.',
      keyword: 'parse tree' },

    { id: 'e7', scene: 'def', start: 36, end: 42,
      caption: 'A grammar is ambiguous when some string in its language has two different parse trees.',
      detail: 'This is the definition to carry. One string is enough: the grammar is ambiguous if any single string in its language has two trees. A grammar with no such string is unambiguous.',
      narration: 'A grammar is ambiguous when some string in its language has two different parse trees.',
      keyword: 'two different parse trees',
      trap: 'The word is any, not every. One string with two trees settles it; most strings of an ambiguous grammar may still have exactly one tree.' },

    { id: 'e8', scene: 'def', start: 42, end: 48,
      caption: 'Equivalently, two different leftmost derivations: always expand the leftmost nonterminal next.',
      detail: 'A leftmost derivation is a derivation in which every step rewrites the leftmost nonterminal of the current form. Fixing that order removes the freedom of choosing which branch to expand, so leftmost derivations and parse trees stand in one-to-one correspondence.',
      narration: 'Equivalently, two different leftmost derivations: always expand the leftmost nonterminal next.',
      keyword: 'leftmost derivations' },

    { id: 'e9', scene: 'def', start: 48, end: 54,
      caption: 'Not two different derivations. Expanding the right branch first is the same tree written in another order.',
      detail: 'A derivation is a sequence of steps. The same tree can be written as several sequences, because independent branches may be expanded in either order. Counting sequences therefore overcounts trees, and the definition of ambiguity has to exclude that freedom.',
      narration: 'Not two different derivations. Expanding the right branch first is the same tree written in another order.',
      keyword: 'same tree' },

    { id: 'e10', scene: 'def', start: 54, end: 60,
      caption: 'So ambiguity is about the tree, never about the order in which the steps are written down.',
      detail: 'This distinction is the single most common source of wrong answers on the topic. Knuth makes the same point in his 1965 paper on translation: a grammar can be unambiguous even though several sequences of derivations are possible.',
      narration: 'So ambiguity is about the tree, never about the order in which the steps are written down.',
      keyword: 'about the tree',
      trap: 'If an option says the grammar is ambiguous because a string has two derivations, check which kind. Only leftmost derivations, or trees, decide it.' },

    /* ---------------- scene 3: the counter ---------------- */
    { id: 'e11', scene: 'count', start: 60, end: 66,
      caption: 'Deciding one string is mechanical. Fill one cell for each piece of the string, shortest pieces first.',
      detail: 'The table has a cell for every pair of positions, so about n squared over two cells for a string of n letters. A cell holds the number of trees that build that piece from one nonterminal, and it is filled from the shorter pieces inside it.',
      narration: 'Deciding one string is mechanical. Fill one cell for each piece of the string, shortest pieces first.',
      keyword: 'one cell for each piece' },

    { id: 'e12', scene: 'count', start: 66, end: 72,
      caption: 'The cell for a piece counts the trees that build it from E. A piece that is one letter holds 1.',
      detail: 'Only the rule E to id builds a single letter, and it does so in exactly one way, so every one-letter cell holds 1. Every other cell is a sum over the rules: for each rule, the number of ways to cut the piece among its parts, multiplied by the counts already in those parts.',
      narration: 'The cell for a piece counts the trees that build it from E. A piece that is one letter holds 1.',
      keyword: 'holds 1' },

    { id: 'e13', scene: 'count', start: 72, end: 78,
      caption: 'For i plus i plus i the six pieces hold 1, 1, 1, 1, 1 and then 2 for the whole string.',
      detail: 'The three one-letter pieces hold 1 each. The two pieces of three letters hold 1 each, because a sum can only be split there in one way. The whole string holds 2, because the last plus can be the top of the tree or sit one level down.',
      narration: 'For i plus i plus i the six pieces hold 1, 1, 1, 1, 1 and then 2 for the whole string.',
      keyword: 'and then 2' },

    { id: 'e14', scene: 'count', start: 78, end: 84,
      caption: 'Two is the answer: the string has two trees, so this grammar is ambiguous. Nothing was guessed.',
      detail: 'The table is not an approximation and not a search with a bound. It counts every tree exactly once, so a 2 in the whole-string cell is a proof of ambiguity and a 1 is a proof of unambiguity for that string.',
      narration: 'Two is the answer: the string has two trees, so this grammar is ambiguous. Nothing was guessed.',
      keyword: 'nothing was guessed' },

    { id: 'e15', scene: 'count', start: 84, end: 90,
      caption: 'The work is cubic in the length, so a machine settles one string quickly and a person should not try by hand.',
      detail: 'There are about n squared over two cells, and filling one cell costs about n times the number of rules, which gives a cubic total. That is why every count on this page is computed rather than claimed.',
      narration: 'The work is cubic in the length, so a machine settles one string quickly and a person should not try by hand.',
      keyword: 'cubic' },

    /* ---------------- scene 4: the witness ---------------- */
    { id: 'e16', scene: 'witness', start: 90, end: 96,
      caption: 'Count the operands and the answer is a Catalan number: 1, 1, 2, 5, 14, 42 for one operand to six.',
      detail: 'With no precedence written into the grammar, every full binary tree over the operands is a tree of the string, and the number of full binary trees with k leaves is the Catalan number at k minus one. The six counts on screen match the closed form exactly.',
      narration: 'Count the operands and the answer is a Catalan number: 1, 1, 2, 5, 14, 42 for one operand to six.',
      keyword: 'Catalan number' },

    { id: 'e17', scene: 'witness', start: 96, end: 102,
      caption: 'Two operands cannot be ambiguous here; three are enough. The shortest witness is i plus i plus i.',
      detail: 'A string of one or two operands has only one shape available, so its count is 1. At three operands the middle operator can sit at the top or one level down, and the count becomes 2. The scan over every string up to length seven finds i plus i plus i first.',
      narration: 'Two operands cannot be ambiguous here; three are enough. The shortest witness is i plus i plus i.',
      keyword: 'shortest witness' },

    { id: 'e18', scene: 'witness', start: 102, end: 108,
      caption: 'With a multiplication in the string the two trees also disagree about the value: eight against six when i is 2.',
      detail: 'Take i equal to 2. The left grouping adds first and doubles, giving 8; the right grouping multiplies first and gives 2 plus 4, which is 6. At i equal to 1 the two readings happen to agree, which is exactly why one test value proves nothing.',
      narration: 'With a multiplication in the string the two trees also disagree about the value: eight against six when i is 2.',
      keyword: 'disagree' },

    { id: 'e19', scene: 'witness', start: 108, end: 114,
      caption: 'The count belongs to the rules, not to the strings. Another grammar for the same strings counts differently.',
      detail: 'Ambiguity is a property of the grammar, so two grammars for one language may disagree about it. That is exactly what makes the repair possible: keep the language, change the rules.',
      narration: 'The count belongs to the rules, not to the strings. Another grammar for the same strings counts differently.',
      keyword: 'belongs to the rules' },

    { id: 'e20', scene: 'witness', start: 114, end: 120,
      caption: 'Six operands already give 42 trees, so the growth is fast and a hand count stops being a proof.',
      detail: 'The count grows faster than any polynomial, so on a real expression the number of trees is astronomical. The exam asks for small strings for exactly this reason, and the method stays the same.',
      narration: 'Six operands already give 42 trees, so the growth is fast and a hand count stops being a proof.',
      keyword: '42 trees' },

    /* ---------------- scene 5: the repair ---------------- */
    { id: 'e21', scene: 'repair', start: 120, end: 126,
      caption: 'The repair splits one nonterminal into three levels: E for plus, T for times, F for an operand.',
      detail: 'A level per precedence rank. E can only be built from sums of T, T only from products of F, and F is an operand or a bracketed E. The nesting of the levels is the precedence, written into the rules instead of left to the reader.',
      narration: 'The repair splits one nonterminal into three levels: E for plus, T for times, F for an operand.',
      keyword: 'three levels' },

    { id: 'e22', scene: 'repair', start: 126, end: 132,
      caption: 'E goes to E plus T or T, T goes to T times F or F, F goes to id. Each string now has one tree.',
      detail: 'The levels force the top of the tree to be a sum, its children to be products, and their children to be operands. There is no longer a choice about which operator sits highest, so the tree is determined by the string.',
      narration: 'E goes to E plus T or T, T goes to T times F or F, F goes to id. Each string now has one tree.',
      keyword: 'one tree' },

    { id: 'e23', scene: 'repair', start: 132, end: 138,
      caption: 'Computed: the six counts fall from 1, 1, 2, 5, 14, 42 to 1, 1, 1, 1, 1, 1.',
      detail: 'The same six strings, recounted against the levelled grammar. Every count is 1. The change is not cosmetic: the language is the same and the trees are now unique.',
      narration: 'Computed: the six counts fall from 1, 1, 2, 5, 14, 42 to 1, 1, 1, 1, 1, 1.',
      keyword: 'to 1, 1, 1, 1, 1, 1' },

    { id: 'e24', scene: 'repair', start: 138, end: 144,
      caption: 'The language did not change: 363 strings tested, none changed sides, and no levelled count went above 1.',
      detail: 'Every string over the three symbols up to length five was counted in both grammars. The two sets of accepted strings are identical, and the largest count in the levelled grammar is 1. A repair that changed the language would be worthless.',
      narration: 'The language did not change: 363 strings tested, none changed sides, and no levelled count went above 1.',
      keyword: '363 strings' },

    { id: 'e25', scene: 'repair', start: 144, end: 150,
      caption: 'Precedence and associativity are decisions the grammar makes. Leaving them out is what created the ambiguity.',
      detail: 'The original grammar did not say whether plus binds tighter than times, so both readings were derivations. Writing the levels down is making the decision. This is the same reason a parser generator reports a shift-reduce conflict and asks which way to resolve it.',
      narration: 'Precedence and associativity are decisions the grammar makes. Leaving them out is what created the ambiguity.',
      keyword: 'decisions the grammar makes',
      trap: 'A left-recursive grammar is not ambiguous by itself, and a grammar with both left and right recursion is not automatically ambiguous either. Count trees; do not use the shape of the rules as a test.' },

    /* ---------------- scene 6: dangling else ---------------- */
    { id: 'e26', scene: 'dangle', start: 150, end: 156,
      caption: 'The dangling else is the same failure in a language: if c then if c then x else x.',
      detail: 'Written with one letter per token: i for if, c for the condition, t for then, e for else, x for any other statement. The string is i c t i c t x e x, nine characters long, and it is the shortest witness for this grammar.',
      narration: 'The dangling else is the same failure in a language: if c then if c then x else x.',
      keyword: 'dangling else' },

    { id: 'e27', scene: 'dangle', start: 156, end: 162,
      caption: 'The else can belong to the inner if or to the outer one. Both trees are legal, so the grammar is ambiguous.',
      detail: 'The rule set is S to i c t S, or i c t S e S, or x. Nothing in those three rules says which if owns an else, so the string has two derivations: one where the else closes the inner statement, one where it closes the outer.',
      narration: 'The else can belong to the inner if or to the outer one. Both trees are legal, so the grammar is ambiguous.',
      keyword: 'both trees are legal' },

    { id: 'e28', scene: 'dangle', start: 162, end: 168,
      caption: 'The textbook repair splits statements into matched and unmatched, so an else always closes the nearest if.',
      detail: 'M is a statement whose ifs all have their else. U is a statement with at least one if still waiting. Then U to i c t S, and U to i c t M e U: the else branch of an unmatched statement must itself be unmatched, which is what forces the else to the nearest open if.',
      narration: 'The textbook repair splits statements into matched and unmatched, so an else always closes the nearest if.',
      keyword: 'matched and unmatched' },

    { id: 'e29', scene: 'dangle', start: 168, end: 174,
      caption: 'A repair that lets the else branch be any statement stays ambiguous: computed, the same string still has 2 trees.',
      detail: 'Write U to i c t M e S instead, with the general S after else. The string then has a tree through M and a second through U, because the inner statement can be read either way. The repair looks right and is not: only the count shows it.',
      narration: 'A repair that lets the else branch be any statement stays ambiguous: computed, the same string still has 2 trees.',
      keyword: 'still has 2 trees',
      trap: 'A grammar that "looks unambiguous" is not evidence. The difference between the two repairs here is one symbol, and it changes the count from 2 to 1.' },

    { id: 'e30', scene: 'dangle', start: 174, end: 180,
      caption: 'The version whose else branch is unmatched gives 1, and 782 tested strings agree on the language.',
      detail: 'Every string of length seven or less that can begin with the keyword sequence, plus the single statement x, was counted in both grammars. The accepted sets agree exactly and the largest count in the repaired grammar is 1.',
      narration: 'The version whose else branch is unmatched gives 1, and 782 tested strings agree on the language.',
      keyword: 'gives 1' },

    /* ---------------- scene 7: three counters ---------------- */
    { id: 'e31', scene: 'derivs', start: 180, end: 186,
      caption: 'Three different numbers hide behind the word derivation. Keep them apart and the definition stops wobbling.',
      detail: 'A parse tree, a leftmost derivation and a derivation sequence are three objects. Two of them decide ambiguity and one of them does not, so an answer that says "two derivations" without naming the kind is incomplete.',
      narration: 'Three different numbers hide behind the word derivation. Keep them apart and the definition stops wobbling.',
      keyword: 'three different numbers' },

    { id: 'e32', scene: 'derivs', start: 186, end: 192,
      caption: 'For i plus i: one tree, one leftmost derivation, and two derivation sequences.',
      detail: 'The tree is unique. Fixing the leftmost order gives exactly one sequence. Allowing any order gives two, because the two operands can be expanded in either order, and both orders describe the same tree.',
      narration: 'For i plus i: one tree, one leftmost derivation, and two derivation sequences.',
      keyword: 'two derivation sequences' },

    { id: 'e33', scene: 'derivs', start: 192, end: 198,
      caption: 'For i plus i plus i: two trees, two leftmost derivations, and sixteen sequences.',
      detail: 'Two trees, each with five rule applications: the root, one inner sum, and three operands. Each tree has eight orders in which those five applications may be written, so the sequence count is sixteen while the tree count is two.',
      narration: 'For i plus i plus i: two trees, two leftmost derivations, and sixteen sequences.',
      keyword: 'sixteen sequences' },

    { id: 'e34', scene: 'derivs', start: 198, end: 204,
      caption: 'So "two derivations" is a test only if you mean leftmost, or if you count trees. Otherwise it overcounts.',
      detail: 'The sequence count is never smaller than the tree count and is usually much larger, so a test written on sequences would call almost every grammar ambiguous. The two safe objects are the tree and the leftmost derivation, and they agree by construction.',
      narration: 'So two derivations is a test only if you mean leftmost, or if you count trees. Otherwise it overcounts.',
      keyword: 'overcounts',
      trap: 'Sixteen against two: an option that says "the string has many derivations, so the grammar is ambiguous" is false for a grammar that is unambiguous.' },

    { id: 'e35', scene: 'derivs', start: 204, end: 210,
      caption: 'A grammar with many derivation orders and one tree per string is unambiguous, and Knuth says so about his own.',
      detail: 'In his 1965 paper on the translation of languages from left to right, Knuth writes of one of his grammars that it is clearly unambiguous even though several sequences of derivations are possible. The primary source makes the same distinction this page is making.',
      narration: 'A grammar with many derivation orders and one tree per string is unambiguous, and Knuth says so about his own.',
      keyword: 'Knuth' },

    /* ---------------- scene 8: the language ---------------- */
    { id: 'e36', scene: 'lang', start: 210, end: 216,
      caption: 'Now the harder question: is the language itself ambiguous, whatever grammar anybody writes for it?',
      detail: 'Inherent ambiguity is a property of the language, quantified over every grammar that generates it. To prove it you must show that no grammar works, which takes a lemma rather than an example. To disprove it, one unambiguous grammar is enough.',
      narration: 'Now the harder question: is the language itself ambiguous, whatever grammar anybody writes for it?',
      keyword: 'the language itself' },

    { id: 'e37', scene: 'lang', start: 216, end: 222,
      caption: 'Take strings a to the i, b to the j, c to the k with i equal to j, or j equal to k. Two families, one language.',
      detail: 'The first family matches the block of a with the block of b; the second matches the block of b with the block of c. A single grammar joins them with one nonterminal: S to L C, or to A D, where L builds a to the n b to the n, C builds c to the m, A builds a to the p and D builds b to the m c to the m.',
      narration: 'Take strings a to the i, b to the j, c to the k with i equal to j, or j equal to k. Two families, one language.',
      keyword: 'two families' },

    { id: 'e38', scene: 'lang', start: 222, end: 228,
      caption: 'The overlap strings a to the n b to the n c to the n belong to both families, so they get 2 trees.',
      detail: 'Computed for n equal to 1 up to 6: every one of those six strings has exactly 2 trees, one from the first family and one from the second. Off the overlap, where only one family applies, the count is 1, computed for four such strings.',
      narration: 'The overlap strings a to the n b to the n c to the n belong to both families, so they get 2 trees.',
      keyword: '2 trees' },

    { id: 'e39', scene: 'lang', start: 228, end: 234,
      caption: 'So this grammar is ambiguous on infinitely many strings and on nothing else. That is still ambiguity.',
      detail: 'The definition needs one string with two trees, and here there are infinitely many, each with exactly two. A grammar can be ambiguous on a single string or on infinitely many; both count.',
      narration: 'So this grammar is ambiguous on infinitely many strings and on nothing else. That is still ambiguity.',
      keyword: 'infinitely many strings' },

    { id: 'e40', scene: 'lang', start: 234, end: 240,
      caption: 'Ginsburg and Ullian proved in 1966 that no grammar for this language escapes it. That is inherent ambiguity.',
      detail: 'The proof runs through Ogden\'s lemma with a counting argument: any grammar for the language must, on a long enough string of the overlap, have two different structures. The result is a theorem about all grammars, so it cannot be checked by counting, and this page does not claim to.',
      narration: 'Ginsburg and Ullian proved in 1966 that no grammar for this language escapes it. That is inherent ambiguity.',
      keyword: 'inherent ambiguity',
      trap: 'Showing one grammar for a language is ambiguous proves nothing about the language. Inherent ambiguity needs the theorem, or a proof by Ogden\'s lemma.' },

    /* ---------------- scene 9: the reduction ---------------- */
    { id: 'e41', scene: 'reduce', start: 240, end: 246,
      caption: 'Why can no program decide ambiguity? Because a decider would also decide Post\'s correspondence problem.',
      detail: 'Post\'s correspondence problem gives a finite set of dominoes, each with a top string and a bottom string, and asks whether some sequence of dominoes makes the two rows read the same. That question is undecidable, so anything that answers it is undecidable too.',
      narration: 'Why can no program decide ambiguity? Because a decider would also decide Post\'s correspondence problem.',
      keyword: 'Post\'s correspondence problem' },

    { id: 'e42', scene: 'reduce', start: 246, end: 252,
      caption: 'From the dominoes build one grammar: S goes to U or to V, and U spells the top row while V spells the bottom.',
      detail: 'Each domino i contributes U to u sub i U c sub i and U to u sub i c sub i, and the same two rules for V with v sub i. The symbols c sub i are distinct separators, so the sequence of dominoes is recorded in the string and can be read back from it.',
      narration: 'From the dominoes build one grammar: S goes to U or to V, and U spells the top row while V spells the bottom.',
      keyword: 'U spells the top row' },

    { id: 'e43', scene: 'reduce', start: 252, end: 258,
      caption: 'A matching sequence makes one string that both halves generate, so that string has exactly 2 trees.',
      detail: 'If a sequence of dominoes matches, the string built from it is generated by U and also by V. The start symbol produces it in two ways, one through each half, and no other rule can produce it, so the count is exactly 2.',
      narration: 'A matching sequence makes one string that both halves generate, so that string has exactly 2 trees.',
      keyword: 'exactly 2 trees' },

    { id: 'e44', scene: 'reduce', start: 258, end: 264,
      caption: 'Computed: with a match, 2 strings sit in both halves and carry 2 trees each; with no match, 0 and never more than 1.',
      detail: 'Two instances were built and run. In the matching instance the two halves share 2 strings and each has 2 trees; the 90 strings in only one half have 1 tree. In the non-matching instance the halves share nothing, and the largest count over 77 one-sided strings is 1.',
      narration: 'Computed: with a match, 2 strings sit in both halves and carry 2 trees each; with no match, 0 and never more than 1.',
      keyword: '0 and never more than 1' },

    { id: 'e45', scene: 'reduce', start: 264, end: 270,
      caption: 'So a decider for ambiguity would answer the domino question, which is undecidable. Cantor, Floyd, Chomsky and Schützenberger, 1962 to 1963.',
      detail: 'The reduction turns every instance of the domino problem into a grammar, so an algorithm that decided ambiguity would decide the domino problem. Since the domino problem is undecidable, so is ambiguity. The result was published independently three times within two years.',
      narration: 'So a decider for ambiguity would answer the domino question, which is undecidable. Cantor, Floyd, Chomsky and Schützenberger, 1962 to 1963.',
      keyword: 'undecidable',
      trap: 'Undecidable does not mean no instance can be decided. One grammar and one string are always decidable; what fails is one algorithm for all grammars.' },

    /* ---------------- scene 10: the table ---------------- */
    { id: 'e46', scene: 'table', start: 270, end: 276,
      caption: 'So: ambiguity of a string is decidable, ambiguity of a grammar is not, inherent ambiguity of a language is not.',
      detail: 'Three objects, three answers. Fix the string and the count is a computation. Quantify over strings of one grammar and it becomes undecidable, by the reduction just shown. Quantify over grammars of one language and it is undecidable again, by Ginsburg and Ullian.',
      narration: 'So: ambiguity of a string is decidable, ambiguity of a grammar is not, inherent ambiguity of a language is not.',
      keyword: 'three objects, three answers' },

    { id: 'e47', scene: 'table', start: 276, end: 282,
      caption: 'A regular grammar is decidable and always repairable: 510 strings tested, never more than 1 tree.',
      detail: 'For a right-linear grammar the nonterminals are the states of a finite automaton, and the grammar is ambiguous exactly when that automaton has two runs on one string, which a product construction detects. Since a deterministic automaton has one run per string, every regular language has an unambiguous grammar.',
      narration: 'A regular grammar is decidable and always repairable: 510 strings tested, never more than 1 tree.',
      keyword: 'never more than 1 tree' },

    { id: 'e48', scene: 'table', start: 282, end: 288,
      caption: 'A grammar can even be infinitely ambiguous: S to S S, or a, or epsilon gives the empty string infinitely many trees.',
      detail: 'The counter refuses to settle rather than returning a number, and that refusal is the answer. Any tree for the empty string can be wrapped in a further S to S S, so there are infinitely many. The same happens with S to a S b, S S, epsilon from GATE 2003.',
      narration: 'A grammar can even be infinitely ambiguous: S to S S, or a, or epsilon gives the empty string infinitely many trees.',
      keyword: 'infinitely many trees' },

    { id: 'e49', scene: 'table', start: 288, end: 294,
      caption: 'Four exam shapes: which grammar is ambiguous, how many trees, is the language inherently ambiguous, what is decidable.',
      detail: 'Every question on this topic is one of those four. Name the shape first, then the object it quantifies over, then answer. Most errors come from answering a language question with a grammar fact.',
      narration: 'Four exam shapes: which grammar is ambiguous, how many trees, is the language inherently ambiguous, what is decidable.',
      keyword: 'four exam shapes' },

    { id: 'e50', scene: 'table', start: 294, end: 300,
      caption: 'The line to carry: name the object first — string, grammar, or language — and the answer follows.',
      detail: 'A string has a number of trees. A grammar is ambiguous or not. A language is inherently ambiguous or not. Each of the three has its own decision procedure, and two of the three do not exist.',
      narration: 'The line to carry: name the object first, string, grammar, or language, and the answer follows.',
      keyword: 'name the object first' }
  ]
};
