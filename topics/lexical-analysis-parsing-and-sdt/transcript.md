# Lexical Analysis Parsing And Sdt — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/lexical-analysis-parsing-and-sdt/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Characters become tokens

*0:00 – 0:30 · objective: See the boundary between the two phases: the scanner turns a character string into a token stream using longest match, and the parser never sees a character again.*

**0:00–0:07** — A compiler reads characters but reasons about tokens. The scanner is the phase that crosses that boundary. It reads the character string left to right and emits a token each time it finishes one - here twelve tokens from a line of twenty-six characters. The parser downstream never sees a character again, only the token classes.

> Caption: The scanner reads characters and emits tokens. The parser only ever sees tokens.

Exam-trap caption mode adds: *A token is not a character and not a word. It is a class plus a lexeme, so the two occurrences of x2 in this line are two tokens of the same class, and they are not the same token.*

**0:07–0:15** — The rule that decides the boundary is longest match. Standing at a less-than sign, the scanner could emit a single character token, or it could look one further and find a two-character relational operator. It takes the longer one. Two tokens are emitted only when no two-character token matches, which is why the comparison is one token and the shift operators in a language that has them are one token each.

> Caption: Longest match: at every position take the longest legal token, then start again.

Exam-trap caption mode adds: *Longest match is why a plus followed by a plus in a language with an increment operator is one token, and why spacing can change the meaning of a line. The scanner has no notion of intent; it has a rule about length.*

**0:15–0:22** — Counting what came out: one keyword, three identifiers, two numbers, one relational operator and five punctuation marks. Two of those classes cannot be recognised by a fixed list of strings - identifiers and numbers are recognised by a loop, a cycle in the automaton that keeps consuming while the character class matches. That cycle is the whole reason the regular-expression-to-DFA machinery from the theory lesson is a prerequisite here.

> Caption: Twelve tokens: one keyword, three identifiers, two numbers, one relational operator, five punctuation marks.

Exam-trap caption mode adds: *Counting tokens is a favourite one-mark question, and the usual error is counting the semicolon as part of the previous token or forgetting the parentheses. Count punctuation separately.*

**0:22–0:30** — Every decision the scanner makes is local. It can look ahead within the current token, and that is all. It cannot check that a name was declared, or that the brackets balance, because both of those need memory proportional to the input, and a finite automaton has none. That limit is not a design flaw; it is what makes the scanner fast and what makes the parser2019s job well defined.

> Caption: Every scanner decision fits in a finite automaton, so the scanner cannot remember context.

Exam-trap caption mode adds: *A lexical error and a syntactic error are different answers. An unterminated string or a stray character is lexical; a missing semicolon is syntactic; a type mismatch is semantic. Examiners ask you to classify.*

## Scene 2. FIRST and FOLLOW, computed by fixed point

*0:30 – 1:00 · objective: Compute FIRST and FOLLOW on the GATE 2012 grammar by repeated passes, and see why FOLLOW is a backward-closed condition while FIRST only looks forward.*

**0:30–0:37** — FIRST of a nonterminal is the set of terminals that can be the first symbol of a string derived from it, and it contains the empty string if the nonterminal can vanish. The definition is circular - a terminal begins A if a production of A begins with that terminal, or begins with a nonterminal that can begin with it - so the only way to compute it is to sweep the productions again and again until a sweep changes nothing.

> Caption: FIRST(A) is the set of terminals that can begin a string derived from A, plus epsilon if A can vanish.

Exam-trap caption mode adds: *Epsilon belongs in FIRST only when the nonterminal can derive the empty string, not when it merely has one production that can. Chains of nullable nonterminals must all be followed.*

**0:37–0:45** — Watch the sets grow. The first pass reads only the productions of S and gives it a, b and epsilon. The second pass pushes those through the two unit productions, so A and B inherit them. The third pass changes nothing, and that is how the computation knows it has finished. Fixed point is not a figure of speech here; it is the stopping test.

> Caption: Three passes settle this grammar: FIRST(S) = FIRST(A) = FIRST(B) = {a, b, epsilon}.

Exam-trap caption mode adds: *A grammar with a cycle among its nonterminals does not diverge - the sets are finite and the passes only add. The danger is stopping too early, after one pass, which silently loses every inherited terminal.*

**0:45–0:52** — FOLLOW asks the opposite question: what can come next. Two rules push symbols into it. If a production has a nonterminal followed by something, the first symbols of that something follow it. And if that something can vanish, then whatever follows the left-hand side follows the nonterminal too. The end marker is seeded into the start symbol alone, and everything else has to reach it.

> Caption: FOLLOW(A) is the set of terminals that can appear immediately after A, and the start symbol always gets the end marker.

Exam-trap caption mode adds: *Leaving the end marker out of FOLLOW of the start symbol is the single most common error in this clause. Every nullable production of the start symbol then loses its table entry, and the grammar appears to reject valid input.*

**0:52–1:00** — Both nonterminals can appear where a or b comes next, so both receive a and b. The difference is the end marker, and it is not an accident: B is the last symbol of the first production, so B can be the last symbol of a complete string. A cannot. That is why the two sets differ by exactly one symbol, and it is exactly what decides whether a production ending in B may be reduced at the end of the input.

> Caption: FOLLOW(A) is {a, b} and FOLLOW(B) is {a, b, dollar}: the only difference is the end marker.

Exam-trap caption mode adds: *A page that computes FOLLOW only from the fixed-point equations can be wrong in a way nothing catches. This lesson checks it against a bounded leftmost derivation, which never uses those equations.*

## Scene 3. The LL(1) table and the meaning of a conflict

*1:00 – 1:30 · objective: Fill a predictive parsing table from FIRST and FOLLOW, and read a cell holding two productions as the definition of "not LL(1)" rather than as an arithmetic slip.*

**1:00–1:07** — The table has one rule with two branches. For a production of A, put it in the cell named by A and each terminal that can begin its right-hand side. If the right-hand side can vanish, also put it in the cells named by everything that can follow A. That is the entire construction, and a parser with a stack needs nothing else.

> Caption: A production goes into M[A, a] for every a in FIRST of its right side, and into FOLLOW(A) if the right side can vanish.

Exam-trap caption mode adds: *The nullable branch is the one people forget. A grammar with no nullable nonterminals never needs it, which is why the error survives practice on easy grammars and appears on the first one with an epsilon production.*

**1:07–1:15** — Here is the conflict, and it is not an arithmetic slip. S has a production that starts with a, so that production goes in the cell for a. S also has the empty production, and an empty production is legal exactly when the next token may follow S. The token a may follow S, so the empty production also goes in the cell for a. Two entries, one cell, and the parser has no rule to choose between them.

> Caption: M[S, a] holds two productions, because epsilon is legal exactly when a can follow S - and a can.

Exam-trap caption mode adds: *The GATE 2012 linked question asked you to fill the cells, and the correct answer is a cell holding two productions. Reading the question as "make it LL(1)" and dropping one entry is the mistake it is testing.*

**1:15–1:22** — Now the same construction on a grammar that works. Its three right-hand sides begin with a, b and c, the three sets are disjoint, and no production is nullable, so the nullable branch never fires and no cell can collect two entries. That is what being LL(1) means, operationally. The same grammar also builds a conflict-free LR(1) table, which is why the answer to the 2010 item is that it is both.

> Caption: On the GATE 2010 grammar every cell holds exactly one production, so that grammar is LL(1).

Exam-trap caption mode adds: *Disjoint FIRST sets are sufficient only when nothing is nullable. A grammar whose FIRST sets are disjoint but which has an epsilon production can still conflict through the FOLLOW branch.*

**1:22–1:30** — The parser holds a stack. It looks at the top and at the next token. If the top is a terminal that matches, it pops both. If the top is a nonterminal, it looks the pair up in the table and pushes the right-hand side reversed. On this input it expands, matches, expands, matches, and then unwinds to the end marker. At no point does it guess, and that is why there is no backtracking.

> Caption: The parser keeps a stack and matches the top against the lookahead; a match pops, an expansion pushes the right side reversed.

Exam-trap caption mode adds: *An LL parser builds a leftmost derivation, so the stack grows on the left. Reading the stack top-to-bottom as the derivation order rather than the reverse is a common transcription error.*

## Scene 4. Shift, reduce and the handle

*1:30 – 2:00 · objective: Run a shift-reduce parser on aaadbbb, and see the stack always holding a viable prefix and every reduce closing one internal node of the parse tree.*

**1:30–1:37** — Bottom-up parsing has two moves. Shift takes the next input token and pushes it. Reduce takes a string on top of the stack that matches the right-hand side of a production and replaces it by the left-hand side. On this input the parser shifts four times before it can reduce anything, because the only production that consumes a d is the one that also needs the three a symbols beneath it.

> Caption: A shift pushes the next token onto the stack. A reduce replaces a right-hand side on top of the stack by its left side.

Exam-trap caption mode adds: *The stack here holds symbols. In a real LR implementation it holds state numbers, and the symbol view is a projection. Both are correct; mixing them in one trace is not.*

**1:37–1:45** — A handle is the right-hand side that is on top of the stack at the moment replacing it is the correct next step. The qualification matters: a string of symbols on the stack may match several right-hand sides, and only one of them keeps the parse reconstructing a rightmost derivation. Deciding which one is the parser automaton’s entire job.

> Caption: A handle is a right-hand side sitting on top of the stack at the moment it is correct to replace it.

Exam-trap caption mode adds: *A handle is a position as well as a production. Two GATE items ask exactly this, and the answer is always the pair, never the production alone.*

**1:45–1:52** — There is an invariant that holds after every move: whatever is on the stack is a viable prefix. A viable prefix is a prefix of a right-sentential form that does not extend past the handle. That is a strong statement - it says the stack can never hold a string the grammar could not have produced as a beginning - and it is exactly what the 2015 question asked you to recognise.

> Caption: At every valid state the stack holds a viable prefix: a prefix of a right-sentential form that stops at the handle.

Exam-trap caption mode adds: *The tempting wrong answers say viable prefixes appear only at the top or only at the bottom. The true statement is that the stack as a whole is one viable prefix, not a collection of them.*

**1:52–2:00** — Seven reduces and eight shifts accept this input. There is a counting identity behind those numbers: reduces equal one minus the number of tokens plus the sum of the right-hand-side lengths. If every right-hand side has two symbols, that forces at most n minus one reduces. A production whose right side is a single symbol, like A to a, adds a reduce without spending any of that budget, and the page exhibits one.

> Caption: Seven reduces and eight shifts accept aaadbbb, and each reduce is one internal node of the parse tree.

Exam-trap caption mode adds: *The familiar statement that the maximum is n minus one silently assumes every right-hand side has at least two symbols. State the assumption or lose the argument.*

## Scene 5. LR(0) items, closure and goto

*2:00 – 2:30 · objective: Build the canonical LR(0) collection for S to CC, and see that the automaton is shared by SLR, LALR and LR(1) while the reduce policy is not.*

**2:00–2:07** — An item is a production with a dot in it. The dot marks how much of the right-hand side has already been seen on the stack. Dot at the left, nothing read. Dot at the right, the whole right side is there and a reduce is possible. The parser cannot know in advance which of several productions it is inside, so a state is a set of items, not one.

> Caption: An item is a production with a dot showing how much of its right side the parser has already seen.

Exam-trap caption mode adds: *Writing the dot after a nonterminal rather than before it changes which closure items you add. The dot sits between symbols, and the symbol after the dot is the one that drives goto.*

**2:07–2:15** — Closure is the rule that turns one item into a state. If the dot sits immediately before a nonterminal, then the parser might be about to begin any production of that nonterminal, so every such production is added with its dot at the left. One item closes into four. The page checks the defining property directly: closing a state again must add nothing.

> Caption: Closure: if the dot sits before a nonterminal, add every production of that nonterminal with the dot at the left.

Exam-trap caption mode adds: *Closure adds productions of the nonterminal after the dot, not productions whose right side contains it. Confusing the two produces a state that looks plausible and parses nothing.*

**2:15–2:22** — Goto takes a state and a symbol, moves the dot past that symbol in every item that has it there, and closes the result. Doing that from the start state in every direction gives the canonical collection - seven states here. The page does not trust its own construction: it recomputes each edge independently and compares.

> Caption: Goto moves every dot one symbol right and closes again. The collection here has seven states.

Exam-trap caption mode adds: *Counting states is a standard question, and the count depends on whether you include the augmented start production. Always say which convention you used.*

**2:22–2:30** — Here is the same automaton under two policies. Under LR(0), a completed item reduces on every terminal, so five cells in the ACTION table hold both a shift and a reduce. Under SLR, the same completed item reduces only on the terminals that can follow its left side, and every one of those five conflicts disappears. Nothing about the automaton changed. Only what each state is allowed to do with its completed items.

> Caption: On the GATE 2026 grammar the LR(0) table has five shift-reduce conflicts, and SLR(1) on the same automaton has none.

Exam-trap caption mode adds: *A conflict count is meaningless without naming the parser. LR(0), SLR, LALR and LR(1) have different counts on the same grammar, and the same count on different grammars.*

## Scene 6. SLR, LALR and canonical LR(1)

*2:30 – 3:00 · objective: Use the GATE 2025 grammar to show SLR reducing too eagerly, LALR repairing it by carrying exact lookaheads, and the state count staying at the LR(0) figure.*

**2:30–2:37** — This grammar is small enough to check by hand and it separates the rungs cleanly. It has eleven LR(0) states. It is unambiguous. It has a conflict-free LR(1) parser. So the only question is whether the cheaper constructions can find it, and the answer differs between SLR and LALR.

> Caption: One grammar, one LR(0) automaton of eleven states, and three ways of deciding when a state may reduce.

Exam-trap caption mode adds: *An unambiguous grammar need not be in any of these classes, and a grammar in none of them may still have an unambiguous language. Grammar class and language class are different questions.*

**2:37–2:45** — State four holds two items: the production that has just finished, A to d, and the production that has only read the d of d c. SLR asks a question about the whole grammar - can c ever follow A - and answers yes, so it reduces. But the c that follows A comes from a different production entirely, and in this state the correct move is to shift. The lookahead SLR uses is true but not local.

> Caption: SLR reduces A to d on every terminal in FOLLOW(A), and c is in FOLLOW(A) - but only because of a different production.

Exam-trap caption mode adds: *FOLLOW is a global set. Every SLR conflict in every exam question is the same story: a terminal is in FOLLOW for a reason that does not apply in this particular state.*

**2:45–2:52** — The canonical construction attaches a lookahead to each item rather than to the nonterminal. The completed item A to d carries the lookahead a, and only a, because that is what can actually come next in this state. So the reduce never competes with the shift on c. LALR keeps exactly that information and merges states that share a core - and in this grammar the merge costs nothing, so the parser is conflict-free.

> Caption: LALR keeps an exact lookahead per item and merges only states with the same core, so the conflict disappears.

Exam-trap caption mode adds: *Merging can create reduce-reduce conflicts, and a classic grammar shows it: the four-production grammar with E to e and F to e is LR(1) but not LALR(1). Merging cannot create a shift-reduce conflict, which is the 2008 item.*

**2:52–3:00** — The point of LALR is the table size. It merges LR(1) states by core, so its state count is always the LR(0) count: eleven here, and seven on the S to CC grammar, where canonical LR(1) needs ten. That is the trade - the same table size as SLR with almost all of the power of LR(1). The page checks the counts, and checks on six grammars that a shift-reduce conflict in LALR appears exactly when one appears in canonical LR(1).

> Caption: LALR always has exactly as many states as LR(0): here eleven, and on S to CC seven against ten for canonical LR(1).

Exam-trap caption mode adds: *LALR is not "more powerful than LR(1)". The order is LR(0), then SLR, then LALR, then canonical LR(1), and only the last one parses every deterministic context-free language.*

## Scene 7. Associativity and precedence from the grammar

*3:00 – 3:30 · objective: Read associativity off the side the nonterminal recurs on, precedence off the depth of the grammar, and the dangling else off a shift-over-reduce policy.*

**3:00–3:07** — Here is the tree the grammar produces for a star b star c. The left star is deeper, so it binds first, and the expression groups as a star b, then times c. That is left associativity. And the reason is visible in the production: T appears on the left of its own star, so the recursion grows to the left and the tree leans that way.

> Caption: T goes to T star U: the nonterminal recurs on the left of its own operator, so star groups to the left.

Exam-trap caption mode adds: *The same operator symbol can be left associative in one grammar and right associative in another. Associativity is a fact about the grammar, never about the character.*

**3:07–3:15** — Now the same grammar’s other operator. P appears on the right of its own plus, so the recursion grows to the right, the tree leans right, and the expression groups as a plus, then b plus c. One grammar, two operators, opposite associativity - and you can read both off the productions without drawing anything.

> Caption: P goes to Q plus P: the recursion is on the right, so plus groups to the right.

Exam-trap caption mode adds: *This is the item where most candidates answer from memory of C. C has plus left associative; this grammar does not. Read the grammar in front of you.*

**3:15–3:22** — Precedence is a different question from associativity and it has a different answer. The operator handled by the nonterminal that sits lower in the grammar binds tighter, because a deeper subtree is completed earlier and reduced first. So the grammar’s level structure is the precedence table, and a single-level expression grammar has no precedence - which is precisely why it is ambiguous.

> Caption: Precedence comes from depth: star binds tighter because S reaches T and T reaches U, one level below.

Exam-trap caption mode adds: *An ambiguous grammar like E to E plus E or E star E has no precedence and no associativity. You impose both with a precedence table in the parser, not by reading the grammar.*

**3:22–3:30** — The last conflict in this scene is not about arithmetic. If a statement can be an if-then-statement, and the else branch is optional, then in a nested if the else could belong to either one. The grammar is ambiguous as written. A shift-reduce parser hits a conflict in the state that has just finished an if-then-statement and sees else next, and the resolution every language chooses is to shift - which attaches the else to the inner if.

> Caption: The dangling else is a shift-reduce conflict that every language resolves the same way: shift.

Exam-trap caption mode adds: *The dangling-else grammar is the standard example of a grammar that is not LL(1) because it is ambiguous. Resolving it in the parser leaves the grammar ambiguous; resolving it in the grammar means rewriting it.*

## Scene 8. Syntax-directed translation

*3:30 – 4:00 · objective: Evaluate an S-attributed definition in reduce order, emit three-address code from the same tree, and check the code against direct evaluation.*

**3:30–3:37** — A syntax-directed definition puts an attribute on each grammar symbol and a rule on each production. When an attribute of the left side is computed from attributes of the right side, it is synthesised, and a bottom-up parser can compute it at the moment it reduces, because the children are already done. When it is computed from the parent or from a sibling, it is inherited, and the evaluation order has to change.

> Caption: A syntax-directed definition attaches attributes to grammar symbols and a rule to each production.

Exam-trap caption mode adds: *S-attributed definitions can always be evaluated bottom-up. L-attributed definitions need a left-to-right pass and cannot in general be evaluated by a plain bottom-up parser - which is one of the GATE 2009 statements.*

**3:37–3:45** — The actions are attached to productions, so they fire when those productions are reduced. A bottom-up parser reduces the innermost subtree first, so the single a is reduced first and prints 2, then the A to S b reduction prints 3, and the outermost reduction prints 1. The output is 231. This page does not reason about it - it runs the parser and reads the order off the trace.

> Caption: On aab the actions fire in reduce order - 2, then 3, then 1 - so the scheme prints 231.

Exam-trap caption mode adds: *An action written in the middle of a right-hand side does not fire in the middle of the reduction; it fires when the parser reaches that point in a left-to-right traversal. Mid-rule actions are the classic trap here.*

**3:45–3:52** — Now let the same tree emit code instead of printing. Every rule that combines two operands creates a new temporary and emits one instruction naming it. The multiplications sit deeper in the tree than the addition, so both of them are emitted first, and the addition last, naming the two temporaries. Precedence stops being a rule and becomes the shape of the instruction sequence.

> Caption: The same tree emits three-address code: one temporary per operator, deepest subtree first.

Exam-trap caption mode adds: *Three-address code has at most one operator per instruction and at most three addresses. A question that shows a four-address line is showing you something that is not three-address code.*

**3:52–4:00** — The 2022 item is the same idea with arithmetic in place of printing. The percent operator is handled by the nonterminal one level below the hash, so it binds tighter. Both are left recursive, so both group to the left. Twenty times ten over five is forty, then times eight over two over two is two - forty times two is eighty. The page evaluates the rules directly and gets the same number.

> Caption: GATE 2022: 20 hash 10 percent 5 hash 8 percent 2 percent 2 evaluates to 80.

Exam-trap caption mode adds: *The subscripted nonterminals in that question - S one, T one - mean "the instance on the right-hand side", not a new symbol. Reading them as new nonterminals loses the whole evaluation.*

## Scene 9. Four previous-year items, recomputed

*4:00 – 4:30 · objective: Read four real GATE items in this clause and see that each answer is a number or a verdict this page computed, not a key it copied.*

**4:00–4:07** — First item, 2010. The three right-hand sides begin with three different terminals and nothing can vanish, so no LL(1) cell collects two entries. The page also builds the canonical LR(1) table for the same grammar and finds no conflict, so the grammar is in both classes. The option that says so is the answer.

> Caption: GATE 2010: S to a S a, b S or c has no LL(1) conflict and no LR(1) conflict, so it is both.

Exam-trap caption mode adds: *Being LL(1) implies being LR(1), but not the other way round. A grammar that is LR(1) and not LL(1) is the normal case, not a contradiction.*

**4:07–4:15** — Second item, 2007. This is the dangling else grammar written with terminals i, t, e for if, then and else. The cell for the terminal e holds two productions, and the page counts the parse trees of a nested if and finds two of them. So the grammar is not LL(1), and the reason offered in the correct option is the cause rather than the symptom: it is ambiguous.

> Caption: GATE 2007: the if-then-else grammar is not LL(1) because it is ambiguous - the page counts two parse trees.

Exam-trap caption mode adds: *The distractors say "left recursive" and "right recursive". Neither applies here. Recursion is not the reason this grammar fails; the optional else is.*

**4:15–4:22** — Third item, 2025 Set 2. The page builds the SLR table, the LALR table and the canonical LR(1) table for this grammar. SLR reports two conflicts, in state four on c and state seven on a. LALR reports none. LR(1) reports none. So the grammar is LALR but not SLR, and that is the option.

> Caption: GATE 2025 Set 2: SLR reduces in state four on c, LALR does not, so the grammar is LALR(1) but not SLR(1).

Exam-trap caption mode adds: *This grammar is the standard witness for the SLR and LALR gap, and it appears in textbooks. Recognising it saves the construction time.*

**4:22–4:30** — Fourth item, the 2026 Set 2 paper. The grammar has eleven LR(0) states, and the page counts five cells in the ACTION table that hold both a shift and a reduce. Five is the answer. And the same automaton under SLR produces no conflicts, which is worth noticing: the number belongs to the parser, not to the grammar.

> Caption: GATE 2026 Set 2: the LR(0) ACTION table for that grammar has five shift-reduce conflicts.

Exam-trap caption mode adds: *Count conflicts as cells, not as states. One state can hold several conflicting cells, and two questions in this clause differ only in which of the two they ask for.*

## Scene 10. The decision procedure

*4:30 – 5:00 · objective: Fix the five-step order that answers "is this grammar LL(1), SLR(1), LALR(1) or LR(1)?", and the four slips that cost marks.*

**4:30–4:37** — The procedure starts with two steps that are easy to rush. Augment the grammar: add a fresh start symbol with a single production to the old start. Without it the LR construction has nothing to begin from. Then compute FIRST and FOLLOW by repeated passes, and stop only when a pass changes nothing. Any other stopping rule is a guess.

> Caption: Step one: augment the grammar. Step two: compute FIRST and FOLLOW to a fixed point and stop when a pass changes nothing.

Exam-trap caption mode adds: *Forgetting to augment changes every state number and every goto in the LR construction. If your state count disagrees with the key by exactly one, check this first.*

**4:37–4:45** — Step three is the LL(1) test, and the counting is the part that goes wrong. Build the table, then look inside each cell and count the productions in it. A cell with two is a conflict and the grammar is not LL(1). Changing the table does not help; the grammar has to change, by factoring a common prefix or by removing a nullable production.

> Caption: Step three: build the LL(1) table and count the productions inside each cell, not the cells.

Exam-trap caption mode adds: *Counting non-empty cells, or counting cells rather than entries, both give the wrong verdict. The question is always how many productions share a cell.*

**4:45–4:52** — Steps four and five are where the ladder becomes mechanical. Build the LR(0) automaton once - closure, then goto. Then apply three different reduce policies to that same automaton: everything for LR(0), FOLLOW for SLR, merged cores for LALR, exact lookaheads for canonical LR(1). Because the automaton is shared, SLR and LALR always have the same state count.

> Caption: Steps four and five: build the LR(0) automaton once, then add lookaheads one rung at a time.

Exam-trap caption mode adds: *Rebuilding a different automaton for each parser is the most common waste of time in the exam hall. There is one automaton and three policies.*

**4:52–5:00** — Four slips account for most of the lost marks here. Leaving the end marker out of FOLLOW of the start symbol, so nullable reductions disappear. Reading associativity off the operator instead of the recursion side. Assuming LALR has more states than SLR, when the whole point is that it does not. And counting table cells instead of counting the productions inside a cell.

> Caption: Four slips: a missing end marker, associativity read off the operator, LALR assumed to have more states, and cells counted instead of entries.

Exam-trap caption mode adds: *Every one of these four has been an option in a real paper. None of them is a calculation error; each is a definition applied to the wrong object.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
