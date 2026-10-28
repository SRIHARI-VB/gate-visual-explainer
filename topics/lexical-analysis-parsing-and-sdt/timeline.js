/* ==========================================================================
   lexical-analysis-parsing-and-sdt - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'scan',
      n: 1,
      title: 'Characters become tokens',
      start: 0, end: 30,
      objective: 'See the boundary between the two phases: the scanner turns a character string into a token stream using longest match, and the parser never sees a character again.'
    },
    {
      id: 'firstfollow',
      n: 2,
      title: 'FIRST and FOLLOW, computed by fixed point',
      start: 30, end: 60,
      objective: 'Compute FIRST and FOLLOW on the GATE 2012 grammar by repeated passes, and see why FOLLOW is a backward-closed condition while FIRST only looks forward.'
    },
    {
      id: 'll1',
      n: 3,
      title: 'The LL(1) table and the meaning of a conflict',
      start: 60, end: 90,
      objective: 'Fill a predictive parsing table from FIRST and FOLLOW, and read a cell holding two productions as the definition of "not LL(1)" rather than as an arithmetic slip.'
    },
    {
      id: 'shiftreduce',
      n: 4,
      title: 'Shift, reduce and the handle',
      start: 90, end: 120,
      objective: 'Run a shift-reduce parser on aaadbbb, and see the stack always holding a viable prefix and every reduce closing one internal node of the parse tree.'
    },
    {
      id: 'lr0',
      n: 5,
      title: 'LR(0) items, closure and goto',
      start: 120, end: 150,
      objective: 'Build the canonical LR(0) collection for S to CC, and see that the automaton is shared by SLR, LALR and LR(1) while the reduce policy is not.'
    },
    {
      id: 'ladder',
      n: 6,
      title: 'SLR, LALR and canonical LR(1)',
      start: 150, end: 180,
      objective: 'Use the GATE 2025 grammar to show SLR reducing too eagerly, LALR repairing it by carrying exact lookaheads, and the state count staying at the LR(0) figure.'
    },
    {
      id: 'precedence',
      n: 7,
      title: 'Associativity and precedence from the grammar',
      start: 180, end: 210,
      objective: 'Read associativity off the side the nonterminal recurs on, precedence off the depth of the grammar, and the dangling else off a shift-over-reduce policy.'
    },
    {
      id: 'sdt',
      n: 8,
      title: 'Syntax-directed translation',
      start: 210, end: 240,
      objective: 'Evaluate an S-attributed definition in reduce order, emit three-address code from the same tree, and check the code against direct evaluation.'
    },
    {
      id: 'papers',
      n: 9,
      title: 'Four previous-year items, recomputed',
      start: 240, end: 270,
      objective: 'Read four real GATE items in this clause and see that each answer is a number or a verdict this page computed, not a key it copied.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The decision procedure',
      start: 270, end: 300,
      objective: 'Fix the five-step order that answers "is this grammar LL(1), SLR(1), LALR(1) or LR(1)?", and the four slips that cost marks.'
    }
  ],

  events: [
    /* ---------------- scene 1: the scanner ---------------- */
    {
      id: 'scan-1', scene: 'scan', start: 0, end: 7.5,
      caption: 'The scanner reads characters and emits tokens. The parser only ever sees tokens.',
      detail: 'A token is a class and a lexeme. The class is what the parser reasons about - id, num, relop, keyword, punctuation - and the lexeme is the exact text, kept for the symbol table and for error messages. On this line the scanner emits twelve tokens from twenty-six characters.',
      narration: 'A compiler reads characters but reasons about tokens. The scanner is the phase that crosses that boundary. It reads the character string left to right and emits a token each time it finishes one - here twelve tokens from a line of twenty-six characters. The parser downstream never sees a character again, only the token classes.',
      keyword: 'tokens',
      trap: 'A token is not a character and not a word. It is a class plus a lexeme, so the two occurrences of x2 in this line are two tokens of the same class, and they are not the same token.'
    },
    {
      id: 'scan-2', scene: 'scan', start: 7.5, end: 15,
      caption: 'Longest match: at every position take the longest legal token, then start again.',
      detail: 'The rule is maximal munch. Reading less than, the scanner could stop at the single character or continue to the two-character relop. It continues, because a longer legal token exists. Only when no longer token matches does it settle for the shorter one.',
      narration: 'The rule that decides the boundary is longest match. Standing at a less-than sign, the scanner could emit a single character token, or it could look one further and find a two-character relational operator. It takes the longer one. Two tokens are emitted only when no two-character token matches, which is why the comparison is one token and the shift operators in a language that has them are one token each.',
      keyword: 'longest match',
      trap: 'Longest match is why a plus followed by a plus in a language with an increment operator is one token, and why spacing can change the meaning of a line. The scanner has no notion of intent; it has a rule about length.'
    },
    {
      id: 'scan-3', scene: 'scan', start: 15, end: 22.5,
      caption: 'Twelve tokens: one keyword, three identifiers, two numbers, one relational operator, five punctuation marks.',
      detail: 'The classes and their counts are computed by the page from the line itself. Identifiers and numbers are the two classes that need a loop rather than a fixed string, which is why a scanner is a finite automaton with a cycle on the letter and digit transitions.',
      narration: 'Counting what came out: one keyword, three identifiers, two numbers, one relational operator and five punctuation marks. Two of those classes cannot be recognised by a fixed list of strings - identifiers and numbers are recognised by a loop, a cycle in the automaton that keeps consuming while the character class matches. That cycle is the whole reason the regular-expression-to-DFA machinery from the theory lesson is a prerequisite here.',
      keyword: 'three identifiers',
      trap: 'Counting tokens is a favourite one-mark question, and the usual error is counting the semicolon as part of the previous token or forgetting the parentheses. Count punctuation separately.'
    },
    {
      id: 'scan-4', scene: 'scan', start: 22.5, end: 30,
      caption: 'Every scanner decision fits in a finite automaton, so the scanner cannot remember context.',
      detail: 'This is the structural reason the two phases are separate. The scanner is a regular-language recogniser and cannot check that a variable was declared, or that parentheses balance. Those need a stack, and a stack is exactly what the parser phase supplies.',
      narration: 'Every decision the scanner makes is local. It can look ahead within the current token, and that is all. It cannot check that a name was declared, or that the brackets balance, because both of those need memory proportional to the input, and a finite automaton has none. That limit is not a design flaw; it is what makes the scanner fast and what makes the parser2019s job well defined.',
      keyword: 'finite automaton',
      trap: 'A lexical error and a syntactic error are different answers. An unterminated string or a stray character is lexical; a missing semicolon is syntactic; a type mismatch is semantic. Examiners ask you to classify.'
    },

    /* ---------------- scene 2: FIRST and FOLLOW ---------------- */
    {
      id: 'ff-1', scene: 'firstfollow', start: 30, end: 37.5,
      caption: 'FIRST(A) is the set of terminals that can begin a string derived from A, plus epsilon if A can vanish.',
      detail: 'The definition is a closure condition: a terminal begins A if some production of A begins with that terminal, or begins with a nonterminal that can begin with it. So the sets are computed by repeating passes over the productions until a pass changes nothing.',
      narration: 'FIRST of a nonterminal is the set of terminals that can be the first symbol of a string derived from it, and it contains the empty string if the nonterminal can vanish. The definition is circular - a terminal begins A if a production of A begins with that terminal, or begins with a nonterminal that can begin with it - so the only way to compute it is to sweep the productions again and again until a sweep changes nothing.',
      keyword: 'closure condition',
      trap: 'Epsilon belongs in FIRST only when the nonterminal can derive the empty string, not when it merely has one production that can. Chains of nullable nonterminals must all be followed.'
    },
    {
      id: 'ff-2', scene: 'firstfollow', start: 37.5, end: 45,
      caption: 'Three passes settle this grammar: FIRST(S) = FIRST(A) = FIRST(B) = {a, b, epsilon}.',
      detail: 'The first pass gives S its a, b and epsilon from its own productions. The second pass carries those sets through A to S and B to S. The third pass changes nothing, which is the stopping condition. The page prints the set after every pass so the growth is visible rather than asserted.',
      narration: 'Watch the sets grow. The first pass reads only the productions of S and gives it a, b and epsilon. The second pass pushes those through the two unit productions, so A and B inherit them. The third pass changes nothing, and that is how the computation knows it has finished. Fixed point is not a figure of speech here; it is the stopping test.',
      keyword: 'third pass changes nothing',
      trap: 'A grammar with a cycle among its nonterminals does not diverge - the sets are finite and the passes only add. The danger is stopping too early, after one pass, which silently loses every inherited terminal.'
    },
    {
      id: 'ff-3', scene: 'firstfollow', start: 45, end: 52.5,
      caption: 'FOLLOW(A) is the set of terminals that can appear immediately after A, and the start symbol always gets the end marker.',
      detail: 'Two rules push symbols into FOLLOW: if B goes to alpha A beta then everything in FIRST(beta) except epsilon is in FOLLOW(A), and if beta can vanish then FOLLOW(B) is in FOLLOW(A) as well. The end marker is seeded only into the start symbol.',
      narration: 'FOLLOW asks the opposite question: what can come next. Two rules push symbols into it. If a production has a nonterminal followed by something, the first symbols of that something follow it. And if that something can vanish, then whatever follows the left-hand side follows the nonterminal too. The end marker is seeded into the start symbol alone, and everything else has to reach it.',
      keyword: 'end marker',
      trap: 'Leaving the end marker out of FOLLOW of the start symbol is the single most common error in this clause. Every nullable production of the start symbol then loses its table entry, and the grammar appears to reject valid input.'
    },
    {
      id: 'ff-4', scene: 'firstfollow', start: 52.5, end: 60,
      caption: 'FOLLOW(A) is {a, b} and FOLLOW(B) is {a, b, dollar}: the only difference is the end marker.',
      detail: 'Both A and B derive S, and both sit in the two long productions, so both receive a and b. Only B receives the end marker, because only B can be the last symbol of the whole string. This page recomputes FOLLOW a second way - by expanding sentential forms and reading off what follows each nonterminal - and the two methods agree.',
      narration: 'Both nonterminals can appear where a or b comes next, so both receive a and b. The difference is the end marker, and it is not an accident: B is the last symbol of the first production, so B can be the last symbol of a complete string. A cannot. That is why the two sets differ by exactly one symbol, and it is exactly what decides whether a production ending in B may be reduced at the end of the input.',
      keyword: 'the only difference',
      trap: 'A page that computes FOLLOW only from the fixed-point equations can be wrong in a way nothing catches. This lesson checks it against a bounded leftmost derivation, which never uses those equations.'
    },

    /* ---------------- scene 3: the LL(1) table ---------------- */
    {
      id: 'll1-1', scene: 'll1', start: 60, end: 67.5,
      caption: 'A production goes into M[A, a] for every a in FIRST of its right side, and into FOLLOW(A) if the right side can vanish.',
      detail: 'That is the whole construction. Two lines, applied to every production. The table is a function from a nonterminal and a lookahead token to the production to expand, and a top-down parser with a stack needs nothing else.',
      narration: 'The table has one rule with two branches. For a production of A, put it in the cell named by A and each terminal that can begin its right-hand side. If the right-hand side can vanish, also put it in the cells named by everything that can follow A. That is the entire construction, and a parser with a stack needs nothing else.',
      keyword: 'two branches',
      trap: 'The nullable branch is the one people forget. A grammar with no nullable nonterminals never needs it, which is why the error survives practice on easy grammars and appears on the first one with an epsilon production.'
    },
    {
      id: 'll1-2', scene: 'll1', start: 67.5, end: 75,
      caption: 'M[S, a] holds two productions, because epsilon is legal exactly when a can follow S - and a can.',
      detail: 'S has the production aAbB, which starts with a, and the production epsilon, whose FIRST is epsilon so it is placed in FOLLOW(S). FOLLOW(S) contains a, so the cell holds both. Two entries in one cell means the parser cannot decide without more lookahead, and that is the definition of not being LL(1).',
      narration: 'Here is the conflict, and it is not an arithmetic slip. S has a production that starts with a, so that production goes in the cell for a. S also has the empty production, and an empty production is legal exactly when the next token may follow S. The token a may follow S, so the empty production also goes in the cell for a. Two entries, one cell, and the parser has no rule to choose between them.',
      keyword: 'not LL(1)',
      trap: 'The GATE 2012 linked question asked you to fill the cells, and the correct answer is a cell holding two productions. Reading the question as "make it LL(1)" and dropping one entry is the mistake it is testing.'
    },
    {
      id: 'll1-3', scene: 'll1', start: 75, end: 82.5,
      caption: 'On the GATE 2010 grammar every cell holds exactly one production, so that grammar is LL(1).',
      detail: 'S goes to a S a, b S or c. FIRST of the three right sides are a, b and c, disjoint, and no production is nullable, so the nullable branch never fires. One entry per cell. The page also builds the canonical LR(1) table for the same grammar and finds no conflict, which is the other half of that question.',
      narration: 'Now the same construction on a grammar that works. Its three right-hand sides begin with a, b and c, the three sets are disjoint, and no production is nullable, so the nullable branch never fires and no cell can collect two entries. That is what being LL(1) means, operationally. The same grammar also builds a conflict-free LR(1) table, which is why the answer to the 2010 item is that it is both.',
      keyword: 'disjoint',
      trap: 'Disjoint FIRST sets are sufficient only when nothing is nullable. A grammar whose FIRST sets are disjoint but which has an epsilon production can still conflict through the FOLLOW branch.'
    },
    {
      id: 'll1-4', scene: 'll1', start: 82.5, end: 90,
      caption: 'The parser keeps a stack and matches the top against the lookahead; a match pops, an expansion pushes the right side reversed.',
      detail: 'On the input aacaa the stack starts with S and the end marker, expands to a S a, matches the a, then expands S again to a S a and matches, then expands to c and matches, then unwinds. Nothing is guessed, so no backtracking is needed - which is what predictive means.',
      narration: 'The parser holds a stack. It looks at the top and at the next token. If the top is a terminal that matches, it pops both. If the top is a nonterminal, it looks the pair up in the table and pushes the right-hand side reversed. On this input it expands, matches, expands, matches, and then unwinds to the end marker. At no point does it guess, and that is why there is no backtracking.',
      keyword: 'no backtracking',
      trap: 'An LL parser builds a leftmost derivation, so the stack grows on the left. Reading the stack top-to-bottom as the derivation order rather than the reverse is a common transcription error.'
    },

    /* ---------------- scene 4: shift-reduce ---------------- */
    {
      id: 'sr-1', scene: 'shiftreduce', start: 90, end: 97.5,
      caption: 'A shift pushes the next token onto the stack. A reduce replaces a right-hand side on top of the stack by its left side.',
      detail: 'The stack holds grammar symbols, not just states, in this view. The parser shifts while the top of the stack cannot yet be reduced, and reduces as soon as a complete right-hand side sits there. On aaadbbb it shifts four times before the first reduce, because S goes to d only after the three a symbols are on the stack.',
      narration: 'Bottom-up parsing has two moves. Shift takes the next input token and pushes it. Reduce takes a string on top of the stack that matches the right-hand side of a production and replaces it by the left-hand side. On this input the parser shifts four times before it can reduce anything, because the only production that consumes a d is the one that also needs the three a symbols beneath it.',
      keyword: 'shift and reduce',
      trap: 'The stack here holds symbols. In a real LR implementation it holds state numbers, and the symbol view is a projection. Both are correct; mixing them in one trace is not.'
    },
    {
      id: 'sr-2', scene: 'shiftreduce', start: 97.5, end: 105,
      caption: 'A handle is a right-hand side sitting on top of the stack at the moment it is correct to replace it.',
      detail: 'Not every right-hand side that appears on the stack is a handle. The handle is the one whose replacement keeps the parse on a rightmost derivation, read backwards. That is why the parser must know which production to reduce by, and why the automaton exists.',
      narration: 'A handle is the right-hand side that is on top of the stack at the moment replacing it is the correct next step. The qualification matters: a string of symbols on the stack may match several right-hand sides, and only one of them keeps the parse reconstructing a rightmost derivation. Deciding which one is the parser automaton\u2019s entire job.',
      keyword: 'handle',
      trap: 'A handle is a position as well as a production. Two GATE items ask exactly this, and the answer is always the pair, never the production alone.'
    },
    {
      id: 'sr-3', scene: 'shiftreduce', start: 105, end: 112.5,
      caption: 'At every valid state the stack holds a viable prefix: a prefix of a right-sentential form that stops at the handle.',
      detail: 'This is the invariant that makes shift-reduce parsing correct, and it is the answer to the GATE 2015 item. The stack never holds an arbitrary string; it holds something that could be the beginning of a right-sentential form of this grammar, and it never extends past the handle.',
      narration: 'There is an invariant that holds after every move: whatever is on the stack is a viable prefix. A viable prefix is a prefix of a right-sentential form that does not extend past the handle. That is a strong statement - it says the stack can never hold a string the grammar could not have produced as a beginning - and it is exactly what the 2015 question asked you to recognise.',
      keyword: 'viable prefix',
      trap: 'The tempting wrong answers say viable prefixes appear only at the top or only at the bottom. The true statement is that the stack as a whole is one viable prefix, not a collection of them.'
    },
    {
      id: 'sr-4', scene: 'shiftreduce', start: 112.5, end: 120,
      caption: 'Seven reduces and eight shifts accept aaadbbb, and each reduce is one internal node of the parse tree.',
      detail: 'The counting identity is worth remembering: the number of reduces equals one minus the number of tokens plus the sum of the right-hand-side lengths. With every right-hand side of length two, that forces at most n minus one reduces. A production whose right side is a single symbol adds a reduce without using any of that budget, which is the boundary case.',
      narration: 'Seven reduces and eight shifts accept this input. There is a counting identity behind those numbers: reduces equal one minus the number of tokens plus the sum of the right-hand-side lengths. If every right-hand side has two symbols, that forces at most n minus one reduces. A production whose right side is a single symbol, like A to a, adds a reduce without spending any of that budget, and the page exhibits one.',
      keyword: 'counting identity',
      trap: 'The familiar statement that the maximum is n minus one silently assumes every right-hand side has at least two symbols. State the assumption or lose the argument.'
    },

    /* ---------------- scene 5: LR(0) items ---------------- */
    {
      id: 'lr0-1', scene: 'lr0', start: 120, end: 127.5,
      caption: 'An item is a production with a dot showing how much of its right side the parser has already seen.',
      detail: 'The dot position is the parser state. A dot at the left means nothing of the right side has been read; a dot at the right means the whole right side is on the stack and the production can be reduced. A state of the automaton is a set of items, because the parser cannot tell which production it is following until the dot decides.',
      narration: 'An item is a production with a dot in it. The dot marks how much of the right-hand side has already been seen on the stack. Dot at the left, nothing read. Dot at the right, the whole right side is there and a reduce is possible. The parser cannot know in advance which of several productions it is inside, so a state is a set of items, not one.',
      keyword: 'the dot',
      trap: 'Writing the dot after a nonterminal rather than before it changes which closure items you add. The dot sits between symbols, and the symbol after the dot is the one that drives goto.'
    },
    {
      id: 'lr0-2', scene: 'lr0', start: 127.5, end: 135,
      caption: 'Closure: if the dot sits before a nonterminal, add every production of that nonterminal with the dot at the left.',
      detail: 'One item closes into four here. This is what makes a state mean "we might be inside any of these". The closure is idempotent, and the page checks on every state that closing it again adds nothing, which is the property that the construction is supposed to have.',
      narration: 'Closure is the rule that turns one item into a state. If the dot sits immediately before a nonterminal, then the parser might be about to begin any production of that nonterminal, so every such production is added with its dot at the left. One item closes into four. The page checks the defining property directly: closing a state again must add nothing.',
      keyword: 'closure',
      trap: 'Closure adds productions of the nonterminal after the dot, not productions whose right side contains it. Confusing the two produces a state that looks plausible and parses nothing.'
    },
    {
      id: 'lr0-3', scene: 'lr0', start: 135, end: 142.5,
      caption: 'Goto moves every dot one symbol right and closes again. The collection here has seven states.',
      detail: 'The automaton is deterministic: each state and symbol pair has at most one successor. This grammar needs seven LR(0) states, and the page verifies every goto edge against an independent recomputation rather than trusting the construction.',
      narration: 'Goto takes a state and a symbol, moves the dot past that symbol in every item that has it there, and closes the result. Doing that from the start state in every direction gives the canonical collection - seven states here. The page does not trust its own construction: it recomputes each edge independently and compares.',
      keyword: 'seven states',
      trap: 'Counting states is a standard question, and the count depends on whether you include the augmented start production. Always say which convention you used.'
    },
    {
      id: 'lr0-4', scene: 'lr0', start: 142.5, end: 150,
      caption: 'On the GATE 2026 grammar the LR(0) table has five shift-reduce conflicts, and SLR(1) on the same automaton has none.',
      detail: 'The automaton is identical in both cases. Only the reduce policy changed: LR(0) reduces on every terminal, SLR reduces only on the terminals that can follow the left side. That is the whole difference between the two rungs, and it is why conflict counts must always be quoted with the parser named.',
      narration: 'Here is the same automaton under two policies. Under LR(0), a completed item reduces on every terminal, so five cells in the ACTION table hold both a shift and a reduce. Under SLR, the same completed item reduces only on the terminals that can follow its left side, and every one of those five conflicts disappears. Nothing about the automaton changed. Only what each state is allowed to do with its completed items.',
      keyword: 'five shift-reduce conflicts',
      trap: 'A conflict count is meaningless without naming the parser. LR(0), SLR, LALR and LR(1) have different counts on the same grammar, and the same count on different grammars.'
    },

    /* ---------------- scene 6: the ladder ---------------- */
    {
      id: 'lad-1', scene: 'ladder', start: 150, end: 157.5,
      caption: 'One grammar, one LR(0) automaton of eleven states, and three ways of deciding when a state may reduce.',
      detail: 'The GATE 2025 Set 2 grammar is the textbook example of the gap between SLR and LALR. The grammar is unambiguous and has an LR(1) parser, so the question is only which of the simplified constructions can build one.',
      narration: 'This grammar is small enough to check by hand and it separates the rungs cleanly. It has eleven LR(0) states. It is unambiguous. It has a conflict-free LR(1) parser. So the only question is whether the cheaper constructions can find it, and the answer differs between SLR and LALR.',
      keyword: 'eleven states',
      trap: 'An unambiguous grammar need not be in any of these classes, and a grammar in none of them may still have an unambiguous language. Grammar class and language class are different questions.'
    },
    {
      id: 'lad-2', scene: 'ladder', start: 157.5, end: 165,
      caption: 'SLR reduces A to d on every terminal in FOLLOW(A), and c is in FOLLOW(A) - but only because of a different production.',
      detail: 'In state four the parser has seen a d and could be reducing A to d, or could be inside the production d c and about to shift a c. SLR asks whether c can ever follow A, and the answer is yes, so it reduces, and the shift is lost. The information SLR uses is real but too coarse: it is a fact about the grammar, not about this state.',
      narration: 'State four holds two items: the production that has just finished, A to d, and the production that has only read the d of d c. SLR asks a question about the whole grammar - can c ever follow A - and answers yes, so it reduces. But the c that follows A comes from a different production entirely, and in this state the correct move is to shift. The lookahead SLR uses is true but not local.',
      keyword: 'too coarse',
      trap: 'FOLLOW is a global set. Every SLR conflict in every exam question is the same story: a terminal is in FOLLOW for a reason that does not apply in this particular state.'
    },
    {
      id: 'lad-3', scene: 'ladder', start: 165, end: 172.5,
      caption: 'LALR keeps an exact lookahead per item and merges only states with the same core, so the conflict disappears.',
      detail: 'In the canonical LR(1) construction the completed item A to d carries the lookahead a only, because that is the terminal that can actually follow it here. Merging states that share a core keeps that precision in this grammar, since no two states with the same core carry different lookaheads for this item. The result is conflict-free.',
      narration: 'The canonical construction attaches a lookahead to each item rather than to the nonterminal. The completed item A to d carries the lookahead a, and only a, because that is what can actually come next in this state. So the reduce never competes with the shift on c. LALR keeps exactly that information and merges states that share a core - and in this grammar the merge costs nothing, so the parser is conflict-free.',
      keyword: 'exact lookahead',
      trap: 'Merging can create reduce-reduce conflicts, and a classic grammar shows it: the four-production grammar with E to e and F to e is LR(1) but not LALR(1). Merging cannot create a shift-reduce conflict, which is the 2008 item.'
    },
    {
      id: 'lad-4', scene: 'ladder', start: 172.5, end: 180,
      caption: 'LALR always has exactly as many states as LR(0): here eleven, and on S to CC seven against ten for canonical LR(1).',
      detail: 'This is the trade LALR makes and the reason yacc and bison use it. Same table size as SLR, almost the same power as LR(1). The page checks the state counts and also checks, over six grammars, that LALR has a shift-reduce conflict exactly when canonical LR(1) does.',
      narration: 'The point of LALR is the table size. It merges LR(1) states by core, so its state count is always the LR(0) count: eleven here, and seven on the S to CC grammar, where canonical LR(1) needs ten. That is the trade - the same table size as SLR with almost all of the power of LR(1). The page checks the counts, and checks on six grammars that a shift-reduce conflict in LALR appears exactly when one appears in canonical LR(1).',
      keyword: 'same table size',
      trap: 'LALR is not "more powerful than LR(1)". The order is LR(0), then SLR, then LALR, then canonical LR(1), and only the last one parses every deterministic context-free language.'
    },

    /* ---------------- scene 7: precedence ---------------- */
    {
      id: 'prec-1', scene: 'precedence', start: 180, end: 187.5,
      caption: 'T goes to T star U: the nonterminal recurs on the left of its own operator, so star groups to the left.',
      detail: 'Read the tree rather than the sentence. For a star b star c the inner star, the one that binds first, is the left one. That is left associativity, and it is a property of which side the recursive nonterminal sits on - not of the operator symbol.',
      narration: 'Here is the tree the grammar produces for a star b star c. The left star is deeper, so it binds first, and the expression groups as a star b, then times c. That is left associativity. And the reason is visible in the production: T appears on the left of its own star, so the recursion grows to the left and the tree leans that way.',
      keyword: 'recurs on the left',
      trap: 'The same operator symbol can be left associative in one grammar and right associative in another. Associativity is a fact about the grammar, never about the character.'
    },
    {
      id: 'prec-2', scene: 'precedence', start: 187.5, end: 195,
      caption: 'P goes to Q plus P: the recursion is on the right, so plus groups to the right.',
      detail: 'The two operators in this single grammar behave in opposite ways, which is exactly what the GATE 2014 Set 2 item tests. The answer is that star is left associative and plus is right associative, and it follows from the two productions alone.',
      narration: 'Now the same grammar\u2019s other operator. P appears on the right of its own plus, so the recursion grows to the right, the tree leans right, and the expression groups as a plus, then b plus c. One grammar, two operators, opposite associativity - and you can read both off the productions without drawing anything.',
      keyword: 'recursion on the right',
      trap: 'This is the item where most candidates answer from memory of C. C has plus left associative; this grammar does not. Read the grammar in front of you.'
    },
    {
      id: 'prec-3', scene: 'precedence', start: 195, end: 202.5,
      caption: 'Precedence comes from depth: star binds tighter because S reaches T and T reaches U, one level below.',
      detail: 'A nonterminal that sits lower in the grammar binds tighter, because a deeper subtree is finished earlier by a bottom-up parser. So the level structure of the grammar is the precedence table, and an ambiguous expression grammar with one level has no precedence at all.',
      narration: 'Precedence is a different question from associativity and it has a different answer. The operator handled by the nonterminal that sits lower in the grammar binds tighter, because a deeper subtree is completed earlier and reduced first. So the grammar\u2019s level structure is the precedence table, and a single-level expression grammar has no precedence - which is precisely why it is ambiguous.',
      keyword: 'depth',
      trap: 'An ambiguous grammar like E to E plus E or E star E has no precedence and no associativity. You impose both with a precedence table in the parser, not by reading the grammar.'
    },
    {
      id: 'prec-4', scene: 'precedence', start: 202.5, end: 210,
      caption: 'The dangling else is a shift-reduce conflict that every language resolves the same way: shift.',
      detail: 'In if E then if E then S else S the else can attach to either if. The grammar is ambiguous, so it is not LL(1) and not LR(1) as written. Resolving the conflict in favour of shift attaches the else to the nearest if, which is the rule C, Java and every other curly-brace language follows.',
      narration: 'The last conflict in this scene is not about arithmetic. If a statement can be an if-then-statement, and the else branch is optional, then in a nested if the else could belong to either one. The grammar is ambiguous as written. A shift-reduce parser hits a conflict in the state that has just finished an if-then-statement and sees else next, and the resolution every language chooses is to shift - which attaches the else to the inner if.',
      keyword: 'shift',
      trap: 'The dangling-else grammar is the standard example of a grammar that is not LL(1) because it is ambiguous. Resolving it in the parser leaves the grammar ambiguous; resolving it in the grammar means rewriting it.'
    },

    /* ---------------- scene 8: syntax-directed translation ---------------- */
    {
      id: 'sdt-1', scene: 'sdt', start: 210, end: 217.5,
      caption: 'A syntax-directed definition attaches attributes to grammar symbols and a rule to each production.',
      detail: 'Synthesised attributes are computed from the children, so a bottom-up parser can evaluate them as it reduces. Inherited attributes are computed from the parent or a sibling, so they need the tree in a different order - and a definition that uses only synthesised attributes is called S-attributed.',
      narration: 'A syntax-directed definition puts an attribute on each grammar symbol and a rule on each production. When an attribute of the left side is computed from attributes of the right side, it is synthesised, and a bottom-up parser can compute it at the moment it reduces, because the children are already done. When it is computed from the parent or from a sibling, it is inherited, and the evaluation order has to change.',
      keyword: 'synthesised',
      trap: 'S-attributed definitions can always be evaluated bottom-up. L-attributed definitions need a left-to-right pass and cannot in general be evaluated by a plain bottom-up parser - which is one of the GATE 2009 statements.'
    },
    {
      id: 'sdt-2', scene: 'sdt', start: 217.5, end: 225,
      caption: 'On aab the actions fire in reduce order - 2, then 3, then 1 - so the scheme prints 231.',
      detail: 'The grammar is S to a A with action 1, S to a with action 2, and A to S b with action 3. A bottom-up parser finishes the innermost subtree first, which is the single a, so action 2 fires before action 3, and the outermost action 1 last. The page runs the real parser and reads the order off the trace.',
      narration: 'The actions are attached to productions, so they fire when those productions are reduced. A bottom-up parser reduces the innermost subtree first, so the single a is reduced first and prints 2, then the A to S b reduction prints 3, and the outermost reduction prints 1. The output is 231. This page does not reason about it - it runs the parser and reads the order off the trace.',
      keyword: '231',
      trap: 'An action written in the middle of a right-hand side does not fire in the middle of the reduction; it fires when the parser reaches that point in a left-to-right traversal. Mid-rule actions are the classic trap here.'
    },
    {
      id: 'sdt-3', scene: 'sdt', start: 225, end: 232.5,
      caption: 'The same tree emits three-address code: one temporary per operator, deepest subtree first.',
      detail: 'Each rule creates a new temporary and emits one instruction. Because the tree for 8 star 2 plus 3 star 5 puts the multiplications deeper than the addition, both multiplications are emitted before the addition, which is exactly the precedence the grammar encoded.',
      narration: 'Now let the same tree emit code instead of printing. Every rule that combines two operands creates a new temporary and emits one instruction naming it. The multiplications sit deeper in the tree than the addition, so both of them are emitted first, and the addition last, naming the two temporaries. Precedence stops being a rule and becomes the shape of the instruction sequence.',
      keyword: 'one temporary per operator',
      trap: 'Three-address code has at most one operator per instruction and at most three addresses. A question that shows a four-address line is showing you something that is not three-address code.'
    },
    {
      id: 'sdt-4', scene: 'sdt', start: 232.5, end: 240,
      caption: 'GATE 2022: 20 hash 10 percent 5 hash 8 percent 2 percent 2 evaluates to 80.',
      detail: 'The hash is left recursive at the S level and the percent is left recursive at the T level, so percent binds tighter and groups left. That gives 20 times two, times two, which is eighty. The page computes it by walking the translation rules, and the value is the same whether you reduce the expression first or evaluate the tree.',
      narration: 'The 2022 item is the same idea with arithmetic in place of printing. The percent operator is handled by the nonterminal one level below the hash, so it binds tighter. Both are left recursive, so both group to the left. Twenty times ten over five is forty, then times eight over two over two is two - forty times two is eighty. The page evaluates the rules directly and gets the same number.',
      keyword: '80',
      trap: 'The subscripted nonterminals in that question - S one, T one - mean "the instance on the right-hand side", not a new symbol. Reading them as new nonterminals loses the whole evaluation.'
    },

    /* ---------------- scene 9: the papers ---------------- */
    {
      id: 'pap-1', scene: 'papers', start: 240, end: 247.5,
      caption: 'GATE 2010: S to a S a, b S or c has no LL(1) conflict and no LR(1) conflict, so it is both.',
      detail: 'The three right-hand sides begin with a, b and c, nothing is nullable, and the LR(1) construction finds no conflict either. The page builds both tables and counts, rather than recalling the answer.',
      narration: 'First item, 2010. The three right-hand sides begin with three different terminals and nothing can vanish, so no LL(1) cell collects two entries. The page also builds the canonical LR(1) table for the same grammar and finds no conflict, so the grammar is in both classes. The option that says so is the answer.',
      keyword: 'both',
      trap: 'Being LL(1) implies being LR(1), but not the other way round. A grammar that is LR(1) and not LL(1) is the normal case, not a contradiction.'
    },
    {
      id: 'pap-2', scene: 'papers', start: 247.5, end: 255,
      caption: 'GATE 2007: the if-then-else grammar is not LL(1) because it is ambiguous - the page counts two parse trees.',
      detail: 'The grammar has an else production and an epsilon for the optional else, which is exactly the dangling else. Two entries appear in the cell for the terminal e, and the page independently counts the parse trees of i b t i b t a e a and finds more than one. Ambiguity is the cause; the table conflict is the symptom.',
      narration: 'Second item, 2007. This is the dangling else grammar written with terminals i, t, e for if, then and else. The cell for the terminal e holds two productions, and the page counts the parse trees of a nested if and finds two of them. So the grammar is not LL(1), and the reason offered in the correct option is the cause rather than the symptom: it is ambiguous.',
      keyword: 'ambiguous',
      trap: 'The distractors say "left recursive" and "right recursive". Neither applies here. Recursion is not the reason this grammar fails; the optional else is.'
    },
    {
      id: 'pap-3', scene: 'papers', start: 255, end: 262.5,
      caption: 'GATE 2025 Set 2: SLR reduces in state four on c, LALR does not, so the grammar is LALR(1) but not SLR(1).',
      detail: 'The page builds all three tables for this grammar and reports the counts. SLR has two conflicts, one in state four on the terminal c and one in state seven on the terminal a. LALR has none, and canonical LR(1) has none. So the grammar sits between the two rungs, which is exactly the option the question wants.',
      narration: 'Third item, 2025 Set 2. The page builds the SLR table, the LALR table and the canonical LR(1) table for this grammar. SLR reports two conflicts, in state four on c and state seven on a. LALR reports none. LR(1) reports none. So the grammar is LALR but not SLR, and that is the option.',
      keyword: 'LALR but not SLR',
      trap: 'This grammar is the standard witness for the SLR and LALR gap, and it appears in textbooks. Recognising it saves the construction time.'
    },
    {
      id: 'pap-4', scene: 'papers', start: 262.5, end: 270,
      caption: 'GATE 2026 Set 2: the LR(0) ACTION table for that grammar has five shift-reduce conflicts.',
      detail: 'The grammar has eleven LR(0) states, and five of their cells hold both a shift and a reduce. The page counts them on the automaton it built. The same automaton under SLR gives no conflicts at all, which is the sharpest illustration in this lesson of why the parser must be named.',
      narration: 'Fourth item, the 2026 Set 2 paper. The grammar has eleven LR(0) states, and the page counts five cells in the ACTION table that hold both a shift and a reduce. Five is the answer. And the same automaton under SLR produces no conflicts, which is worth noticing: the number belongs to the parser, not to the grammar.',
      keyword: 'five',
      trap: 'Count conflicts as cells, not as states. One state can hold several conflicting cells, and two questions in this clause differ only in which of the two they ask for.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'proc-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step one: augment the grammar. Step two: compute FIRST and FOLLOW to a fixed point and stop when a pass changes nothing.',
      detail: 'Augmenting means adding a fresh start symbol with one production to the old start. Without it the LR construction has no single item to begin from and no accept action to place. The fixed point is the only correct stopping rule for the two sets.',
      narration: 'The procedure starts with two steps that are easy to rush. Augment the grammar: add a fresh start symbol with a single production to the old start. Without it the LR construction has nothing to begin from. Then compute FIRST and FOLLOW by repeated passes, and stop only when a pass changes nothing. Any other stopping rule is a guess.',
      keyword: 'fixed point',
      trap: 'Forgetting to augment changes every state number and every goto in the LR construction. If your state count disagrees with the key by exactly one, check this first.'
    },
    {
      id: 'proc-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step three: build the LL(1) table and count the productions inside each cell, not the cells.',
      detail: 'A cell with one entry is fine. A cell with two entries means the grammar is not LL(1), and no amount of rewriting the table fixes that - the grammar has to change, by left factoring or by removing the nullable production.',
      narration: 'Step three is the LL(1) test, and the counting is the part that goes wrong. Build the table, then look inside each cell and count the productions in it. A cell with two is a conflict and the grammar is not LL(1). Changing the table does not help; the grammar has to change, by factoring a common prefix or by removing a nullable production.',
      keyword: 'inside each cell',
      trap: 'Counting non-empty cells, or counting cells rather than entries, both give the wrong verdict. The question is always how many productions share a cell.'
    },
    {
      id: 'proc-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Steps four and five: build the LR(0) automaton once, then add lookaheads one rung at a time.',
      detail: 'The automaton is shared. SLR reduces on FOLLOW, LALR on the merged core lookaheads, canonical LR(1) on the exact ones. So the automaton work is done once and the three tables are three policies on top of it - which is why the state counts for SLR and LALR always agree.',
      narration: 'Steps four and five are where the ladder becomes mechanical. Build the LR(0) automaton once - closure, then goto. Then apply three different reduce policies to that same automaton: everything for LR(0), FOLLOW for SLR, merged cores for LALR, exact lookaheads for canonical LR(1). Because the automaton is shared, SLR and LALR always have the same state count.',
      keyword: 'the automaton is shared',
      trap: 'Rebuilding a different automaton for each parser is the most common waste of time in the exam hall. There is one automaton and three policies.'
    },
    {
      id: 'proc-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Four slips: a missing end marker, associativity read off the operator, LALR assumed to have more states, and cells counted instead of entries.',
      detail: 'Each of the four has appeared as a distractor in a real paper in this clause. The end marker decides nullable reductions, associativity comes from the recursion side, LALR matches LR(0) in state count, and a conflict is a cell with two entries.',
      narration: 'Four slips account for most of the lost marks here. Leaving the end marker out of FOLLOW of the start symbol, so nullable reductions disappear. Reading associativity off the operator instead of the recursion side. Assuming LALR has more states than SLR, when the whole point is that it does not. And counting table cells instead of counting the productions inside a cell.',
      keyword: 'four slips',
      trap: 'Every one of these four has been an option in a real paper. None of them is a calculation error; each is a definition applied to the wrong object.'
    }
  ]
};
