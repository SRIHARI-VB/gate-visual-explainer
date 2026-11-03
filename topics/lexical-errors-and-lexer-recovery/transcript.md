# Lexical Errors and Lexer Recovery: Longest Match, the Two Failures, Panic Mode and the Guard — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/lexical-errors-and-lexer-recovery/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Characters in, tokens out

*0:00 – 0:30 · objective: Say what a token is — a class plus the exact text — and see that the lexer makes only two decisions: where a token starts, and where it ends.*

**0:00–0:07** — A lexer reads characters and writes tokens. A token is a class plus the exact text it matched.

> Caption: A lexer reads characters and writes tokens. A token is a class plus the exact text it matched.

Exam-trap caption mode adds: *Thinking the lexer decides whether the program is correct. It decides only whether each character can be part of a token.*

**0:07–0:15** — It makes two decisions: where a token starts, and where it ends. The second one is the longest match.

> Caption: It makes two decisions: where a token starts, and where it ends. The second one is the longest match.

Exam-trap caption mode adds: *Assuming the lexer stops at the first accepting state. It keeps going while a longer token is still possible.*

**0:15–0:22** — On x1 23mm 78 y 7z the longest match gives seven tokens, not five.

> Caption: On x1 23mm 78 y 7z the longest match gives seven tokens, not five.

Exam-trap caption mode adds: *Counting words instead of tokens. Five words, seven tokens.*

**0:22–0:30** — So a lexical error is a position where no token can be formed. Everything else belongs to another phase.

> Caption: So a lexical error is a position where no token can be formed. Everything else belongs to another phase.

Exam-trap caption mode adds: *Calling every compiler error a lexical error.*

## Scene 2. The automaton that makes those decisions

*0:30 – 1:00 · objective: Read the 24-state automaton, see which states accept and which class each names, and check it against an independently written matcher.*

**0:30–0:37** — Here is the automaton for this language: 24 states, 18 of them accepting.

> Caption: Here is the automaton for this language: 24 states, 18 of them accepting.

Exam-trap caption mode adds: *Confusing the number of token classes with the number of states. There are 18 accepting states and 24 states in all.*

**0:37–0:45** — Each state remembers how far into a token the lexer has read. Each accepting state names the class.

> Caption: Each state remembers how far into a token the lexer has read. Each accepting state names the class.

Exam-trap caption mode adds: *Reading a state as a character. A state is a set of positions the lexer could be in.*

**0:45–0:52** — It is deterministic: from every state, one character leads to at most one place. That is checked, not assumed.

> Caption: It is deterministic: from every state, one character leads to at most one place. That is checked, not assumed.

Exam-trap caption mode adds: *Assuming a set of regular-expression rules is automatically deterministic. Their union is a non-deterministic automaton until it is converted.*

**0:52–1:00** — It agrees with an independently written matcher on all 2,955 strings of length up to three, and on all 13 corpus strings.

> Caption: It agrees with an independently written matcher on all 2,955 strings of length up to three, and on all 13 corpus strings.

Exam-trap caption mode adds: *Treating a diagram as the proof. The diagram is drawn from the table, and the table is what the checks test.*

## Scene 3. Longest match, and what it decides

*1:00 – 1:30 · objective: Watch the automaton run past an accepting state, and compare longest match with a lexer that stops at the first accepting state.*

**1:00–1:07** — Longest match decides that a/*b*/c is two tokens and a / * b / c is six. The spaces change the program.

> Caption: Longest match decides that a/*b*/c is two tokens and a / * b / c is six. The spaces change the program.

Exam-trap caption mode adds: *Believing a comment is found by the parser or by a text pass. It is decided by the lexer, character by character.*

**1:07–1:15** — The run passes an accepting state and keeps going: slash is a token, but slash star might be a longer one.

> Caption: The run passes an accepting state and keeps going: / is a token, but /* might be a longer one.

Exam-trap caption mode adds: *Thinking longest match means "the longest token that exists". It means the longest prefix that the automaton accepts.*

**1:15–1:22** — A lexer that stopped at the first accepting state would disagree on 6 of the 13 corpus strings.

> Caption: A lexer that stopped at the first accepting state would disagree on 6 of the 13 corpus strings.

Exam-trap caption mode adds: *Implementing the automaton with "stop as soon as a state accepts", which looks tidier and is wrong.*

**1:22–1:30** — Keywords are not decided by the automaton here: five of them spelled out as paths would add 21 states.

> Caption: Keywords are not decided by the automaton here: five of them spelled out as paths would add 21 states.

Exam-trap caption mode adds: *Believing a keyword must be matched before an identifier inside the automaton. Either design works; only one is what most lexers do.*

## Scene 4. The only two ways to fail

*1:30 – 2:00 · objective: Separate "no move from the start state" from "a move that can never finish", and see where the error is reported against where the cause is.*

**1:30–1:37** — There are exactly two ways to fail. No move at all from the start state: in x = 3 $ y; that is character 7.

> Caption: There are exactly two ways to fail. No move at all from the start state: in x = 3 $ y; that is character 7.

Exam-trap caption mode adds: *Reporting "unexpected token" for an illegal character. No token was formed, so no token can be named.*

**1:37–1:45** — The second failure is a move that can never finish: the run leaves the start state and reaches no accepting state.

> Caption: The second failure is a move that can never finish: the run leaves the start state and reaches no accepting state.

Exam-trap caption mode adds: *Treating the two failures as one. One has a partial token and a class to name; the other has a character and nothing else.*

**1:45–1:52** — In x = "abc and a newline, the quote opens at character 5 and the error is reported at character 9.

> Caption: In x = "abc and a newline, the quote opens at character 5 and the error is reported at character 9.

Exam-trap caption mode adds: *Reading the reported position as the position of the mistake. It is the position where the lexer gave up.*

**1:52–2:00** — The position in the message is where the run gave up, not where the cause is. Keep both numbers.

> Caption: The position in the message is where the run gave up, not where the cause is. Keep both numbers.

Exam-trap caption mode adds: *Deleting at the reported position. That removes the newline, not the quote.*

## Scene 5. The comment has a fallback, the quote does not

*2:00 – 2:30 · objective: See why pure longest match cannot report an unterminated comment, and what a real lexer does instead.*

**2:00–2:07** — A string literal has no fallback: a lone quote is not a token, so the failure is reported.

> Caption: A string literal has no fallback: a lone quote is not a token, so the failure is reported.

Exam-trap caption mode adds: *Expecting a "best effort" token. A lexer reports rather than guessing when it has nothing accepted.*

**2:07–2:15** — A comment does have one. The slash is a token by itself, so slash star unterminated yields three tokens and no error.

> Caption: A comment does have one. The slash is a token by itself, so /* unterminated yields three tokens and no error.

Exam-trap caption mode adds: *Assuming an unterminated comment is reported by the automaton. Under pure longest match it is not reported at all.*

**2:15–2:22** — So a real lexer commits: on seeing slash star it enters the comment and reports the missing closing pair at the end of the input.

> Caption: So a real lexer commits: on seeing /* it enters the comment and reports the missing */ at the end of the input.

Exam-trap caption mode adds: *Thinking every lexer behaviour can be read off the DFA. The driver makes some of the decisions.*

**2:22–2:30** — That is also why the same two characters mean a comment in one place and a division in another.

> Caption: That is also why the same two characters mean a comment in one place and a division in another.

Exam-trap caption mode adds: *Deciding the class from the characters without asking which state the run is in.*

## Scene 6. Lexical, syntactic, semantic

*2:30 – 3:00 · objective: Apply the three phase tests to a string, and see that a well-formed token in the wrong place is never a lexical error.*

**2:30–2:37** — Three phases, three tests. Lexical: can this character be part of any token?

> Caption: Three phases, three tests. Lexical: can this character be part of any token?

Exam-trap caption mode adds: *Widening the lexical test to "is this the token I expected here", which is the parser's question.*

**2:37–2:45** — Syntactic: may these well-formed tokens appear in this order? Semantic: do the types and names obey the rules?

> Caption: Syntactic: may these well-formed tokens appear in this order? Semantic: do the types and names obey the rules?

Exam-trap caption mode adds: *Calling a type mismatch a syntactic error because it "looks wrong".*

**2:45–2:52** — GATE CSE 2026 Set 1 asked exactly this of three statements: S1 is the lexical error, S3 the semantic one, answer C.

> Caption: GATE CSE 2026 Set 1 asked exactly this of three statements: S1 is the lexical error, S3 the semantic one, answer C.

Exam-trap caption mode adds: *Reading S2 as an error because the semicolon sits inside the quotes. Inside a literal, it is just a character.*

**2:52–3:00** — The parser sees only tokens. On 3 + 4 ; every token is fine and the statement cannot start with a number.

> Caption: The parser sees only tokens. On 3 + 4 ; every token is fine and the statement cannot start with a number.

Exam-trap caption mode adds: *Blaming the lexer because the fault is at the first token.*

## Scene 7. Panic mode in a lexer: delete to a token start

*3:00 – 3:30 · objective: Run the rule — delete characters until one can begin a token — and count the deletions and the reports on two inputs.*

**3:00–3:07** — Panic mode in a lexer: delete characters until one appears that can begin a token, then resume.

> Caption: Panic mode in a lexer: delete characters until one appears that can begin a token, then resume.

Exam-trap caption mode adds: *Carrying the parser's pop-and-discard picture into the lexer. There is nothing to pop.*

**3:07–3:15** — On x = 3 $ y; that is one deletion, and the run continues with x = 3 y ;.

> Caption: On x = 3 $ y; that is one deletion, and the run continues with x = 3 y ;.

Exam-trap caption mode adds: *Deleting to the end of the line. The rule stops at the first character that can begin a token.*

**3:15–3:22** — On x = @@@ 3; it is three deletions in one pass, and the run continues with x = 3 ;.

> Caption: On x = @@@ 3; it is three deletions in one pass, and the run continues with x = 3 ;.

Exam-trap caption mode adds: *Reporting one error per deleted character.*

**3:22–3:30** — Recovery counts characters; the report counts positions. One error can cost three characters.

> Caption: Recovery counts characters; the report counts positions. One error can cost three characters.

Exam-trap caption mode adds: *Assuming the number of messages equals the number of mistakes.*

## Scene 8. The rule loops, so it needs a guard

*3:30 – 4:00 · objective: See a pass that deletes nothing, add the guard, and measure what the repaired token stream becomes.*

**3:30–3:37** — The rule needs a guard. At an unterminated literal the offending character is a newline, and whitespace can begin a token.

> Caption: The rule needs a guard. At an unterminated literal the offending character is a newline, and whitespace can begin a token.

Exam-trap caption mode adds: *Reading "can begin a token" as "can begin a useful token". Whitespace counts.*

**3:37–3:45** — So nothing is deleted, the same error returns, and the loop never ends. The guard: if a pass deletes nothing, delete the offending character.

> Caption: So nothing is deleted, the same error returns, and the loop never ends. The guard: if a pass deletes nothing, delete the offending character.

Exam-trap caption mode adds: *Trusting a recovery rule to terminate because it looks sensible.*

**3:45–3:52** — Now one deletion, one report, and the tokens are x = y = 2 ; — the literal has silently disappeared.

> Caption: Now one deletion, one report, and the tokens are x = y = 2 ; — the literal has silently disappeared.

Exam-trap caption mode adds: *Believing recovery preserves the program. It preserves the scan, not the text.*

**3:52–4:00** — Skipping to a delimiter instead deletes four characters on x = @ y ; z = 1; and resumes at the semicolon.

> Caption: Skipping to a delimiter instead deletes four characters on x = @ y ; z = 1; and resumes at the semicolon.

Exam-trap caption mode adds: *Deleting the delimiter too, which destroys the boundary the parser needs.*

## Scene 9. The counting question, worked

*4:00 – 4:30 · objective: Count the tokens of the GATE CSE 2026 Set 2 string under that question's own rules, and see why the word count is wrong.*

**4:00–4:07** — The counting question: GATE CSE 2026 Set 2 gives the token rules and asks how many tokens a string makes.

> Caption: The counting question: GATE CSE 2026 Set 2 gives the token rules and asks how many tokens a string makes.

Exam-trap caption mode adds: *Counting with the full rules of C instead of the rules the question printed.*

**4:07–4:15** — Nine blank-separated words, thirteen tokens. 23mm is number 23 and identifier mm.

> Caption: Nine blank-separated words, thirteen tokens. 23mm is number 23 and identifier mm.

Exam-trap caption mode adds: *Answering 9. That is the number of words, and words are not a unit of the token stream.*

**4:15–4:22** — The rule that decides it: an identifier begins with a letter, so after digits a letter starts a new token.

> Caption: The rule that decides it: an identifier begins with a letter, so after digits a letter starts a new token.

Exam-trap caption mode adds: *Assuming both directions are symmetric, so that 23mm and x1 behave the same way. They do not.*

**4:22–4:30** — Count per word and add: one, two, one, one, two, one, two, two, one is thirteen.

> Caption: Count per word and add: one, two, one, one, two, one, two, two, one is thirteen.

Exam-trap caption mode adds: *Adding the digits rather than the tokens.*

## Scene 10. The five steps and the four traps

*4:30 – 5:00 · objective: Fix the order in which the questions are answered, and the four statements that cost the mark.*

**4:30–4:37** — Five steps: scan with longest match, name the failing character and position, decide which failure it is, recover with a guard, report.

> Caption: Five steps: scan with longest match, name the failing character and position, decide which failure it is, recover with a guard, report.

Exam-trap caption mode adds: *Jumping to the recovery before naming the character and the position.*

**4:37–4:45** — Four traps: counting words, calling a misplaced token lexical, reading the reported position as the cause, forgetting the comment fallback.

> Caption: Four traps: counting words, calling a misplaced token lexical, reading the reported position as the cause, forgetting the comment's fallback.

Exam-trap caption mode adds: *Memorising the traps without the numbers that expose them.*

**4:45–4:52** — Every recovery here changes characters, not tokens. Carry two counts: characters deleted and errors reported.

> Caption: Every recovery here changes characters, not tokens. Carry two counts: characters deleted and errors reported.

Exam-trap caption mode adds: *Treating the two lexer strategies as different mechanisms. They differ only in where the scan restarts.*

**4:52–5:00** — And a repaired program is not a correct program: x = y = 2 ; is what the guard left, and the parser rejects it.

> Caption: And a repaired program is not a correct program: x = y = 2 ; is what the guard left, and the parser rejects it.

Exam-trap caption mode adds: *Concluding that recovery made the program valid.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
