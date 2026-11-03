/* ==========================================================================
   lexical-errors-and-lexer-recovery — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'stream', n: 1,
      title: 'Characters in, tokens out',
      start: 0, end: 30,
      objective: 'Say what a token is — a class plus the exact text — and see that the lexer makes only two decisions: where a token starts, and where it ends.'
    },
    {
      id: 'dfa', n: 2,
      title: 'The automaton that makes those decisions',
      start: 30, end: 60,
      objective: 'Read the 24-state automaton, see which states accept and which class each names, and check it against an independently written matcher.'
    },
    {
      id: 'munch', n: 3,
      title: 'Longest match, and what it decides',
      start: 60, end: 90,
      objective: 'Watch the automaton run past an accepting state, and compare longest match with a lexer that stops at the first accepting state.'
    },
    {
      id: 'nofinish', n: 4,
      title: 'The only two ways to fail',
      start: 90, end: 120,
      objective: 'Separate "no move from the start state" from "a move that can never finish", and see where the error is reported against where the cause is.'
    },
    {
      id: 'fallback', n: 5,
      title: 'The comment has a fallback, the quote does not',
      start: 120, end: 150,
      objective: 'See why pure longest match cannot report an unterminated comment, and what a real lexer does instead.'
    },
    {
      id: 'classify', n: 6,
      title: 'Lexical, syntactic, semantic',
      start: 150, end: 180,
      objective: 'Apply the three phase tests to a string, and see that a well-formed token in the wrong place is never a lexical error.'
    },
    {
      id: 'panic', n: 7,
      title: 'Panic mode in a lexer: delete to a token start',
      start: 180, end: 210,
      objective: 'Run the rule — delete characters until one can begin a token — and count the deletions and the reports on two inputs.'
    },
    {
      id: 'guard', n: 8,
      title: 'The rule loops, so it needs a guard',
      start: 210, end: 240,
      objective: 'See a pass that deletes nothing, add the guard, and measure what the repaired token stream becomes.'
    },
    {
      id: 'count', n: 9,
      title: 'The counting question, worked',
      start: 240, end: 270,
      objective: 'Count the tokens of the GATE CSE 2026 Set 2 string under that question\'s own rules, and see why the word count is wrong.'
    },
    {
      id: 'proc', n: 10,
      title: 'The five steps and the four traps',
      start: 270, end: 300,
      objective: 'Fix the order in which the questions are answered, and the four statements that cost the mark.'
    }
  ],

  events: [
    /* ---------- scene 1 ---------- */
    {
      id: 's-1', scene: 'stream', start: 0, end: 7.5,
      caption: 'A lexer reads characters and writes tokens. A token is a class plus the exact text it matched.',
      detail: 'The classes in this lesson\'s language are keyword, identifier, number, string literal, operator, comment and whitespace. The text a token matched is called its lexeme. Every later phase sees only the token stream, never the characters.',
      narration: 'A lexer reads characters and writes tokens. A token is a class plus the exact text it matched.',
      keyword: 'class plus the text',
      trap: 'Thinking the lexer decides whether the program is correct. It decides only whether each character can be part of a token.'
    },
    {
      id: 's-2', scene: 'stream', start: 7.5, end: 15,
      caption: 'It makes two decisions: where a token starts, and where it ends. The second one is the longest match.',
      detail: 'At each position the automaton runs as far as it can and remembers the last accepting state it passed. The token ends at that remembered state, not at the first accepting one.',
      narration: 'It makes two decisions: where a token starts, and where it ends. The second one is the longest match.',
      keyword: 'longest match',
      trap: 'Assuming the lexer stops at the first accepting state. It keeps going while a longer token is still possible.'
    },
    {
      id: 's-3', scene: 'stream', start: 15, end: 22.5,
      caption: 'On x1 23mm 78 y 7z the longest match gives seven tokens, not five.',
      detail: '23mm is two tokens: number 23, then identifier mm, because an identifier must begin with a letter. The five blank-separated words are five lexemes of the input and seven tokens of the output.',
      narration: 'On x1 23mm 78 y 7z the longest match gives seven tokens, not five.',
      keyword: 'seven tokens',
      trap: 'Counting words instead of tokens. Five words, seven tokens.'
    },
    {
      id: 's-4', scene: 'stream', start: 22.5, end: 30,
      caption: 'So a lexical error is a position where no token can be formed. Everything else belongs to another phase.',
      detail: 'The lexer has no view of order, of types, or of meaning. A well-formed token in the wrong place is not its business, and a misspelt keyword is just an identifier.',
      narration: 'So a lexical error is a position where no token can be formed. Everything else belongs to another phase.',
      keyword: 'no token can be formed',
      trap: 'Calling every compiler error a lexical error.'
    },

    /* ---------- scene 2 ---------- */
    {
      id: 'd-1', scene: 'dfa', start: 30, end: 37.5,
      caption: 'Here is the automaton for this language: 24 states, 18 of them accepting.',
      detail: 'One state is the start state, one skips whitespace, one is the comment, and the rest are the token shapes. A token is recognised when the run stops at an accepting state.',
      narration: 'Here is the automaton for this language: 24 states, 18 of them accepting.',
      keyword: '24 states',
      trap: 'Confusing the number of token classes with the number of states. There are 18 accepting states and 24 states in all.'
    },
    {
      id: 'd-2', scene: 'dfa', start: 37.5, end: 45,
      caption: 'Each state remembers how far into a token the lexer has read. Each accepting state names the class.',
      detail: 'That is why a token class can need several states: the string literal needs four, because the opening quote, the body, an escape and the closing quote are different amounts of progress.',
      narration: 'Each state remembers how far into a token the lexer has read. Each accepting state names the class.',
      keyword: 'how far it has read',
      trap: 'Reading a state as a character. A state is a set of positions the lexer could be in.'
    },
    {
      id: 'd-3', scene: 'dfa', start: 45, end: 52.5,
      caption: 'It is deterministic: from every state, one character leads to at most one place. That is checked, not assumed.',
      detail: 'The transition table is built by asking each rule about every character, and the builder refuses to record two different targets for one character in one state. A conflict would be a bug in the rules, not a property of the input.',
      narration: 'It is deterministic: from every state, one character leads to at most one place. That is checked, not assumed.',
      keyword: 'checked, not assumed',
      trap: 'Assuming a set of regular-expression rules is automatically deterministic. Their union is a non-deterministic automaton until it is converted.'
    },
    {
      id: 'd-4', scene: 'dfa', start: 52.5, end: 60,
      caption: 'It agrees with an independently written matcher on all 2,955 strings of length up to three, and on all 13 corpus strings.',
      detail: 'The second matcher never walks the automaton: it tries the longest prefix against a plain predicate for each class. Two different implementations, the same answers everywhere they were compared.',
      narration: 'It agrees with an independently written matcher on all 2,955 strings of length up to three, and on all 13 corpus strings.',
      keyword: '2,955 strings',
      trap: 'Treating a diagram as the proof. The diagram is drawn from the table, and the table is what the checks test.'
    },

    /* ---------- scene 3 ---------- */
    {
      id: 'm-1', scene: 'munch', start: 60, end: 67.5,
      caption: 'Longest match decides that a/*b*/c is two tokens and a / * b / c is six. The spaces change the program.',
      detail: 'In the packed form the slash is followed by a star, so the automaton leaves the division token and enters the comment. In the spaced form the star stands alone and no comment is ever started.',
      narration: 'Longest match decides that a/*b*/c is two tokens and a / * b / c is six. The spaces change the program.',
      keyword: 'the spaces change the program',
      trap: 'Believing a comment is found by the parser or by a text pass. It is decided by the lexer, character by character.'
    },
    {
      id: 'm-2', scene: 'munch', start: 67.5, end: 75,
      caption: 'The run passes an accepting state and keeps going: / is a token, but /* might be a longer one.',
      detail: 'The automaton records the slash as the last accepting state, then reads the star and moves into the comment body. If the comment never closes, that recorded slash is all it has to fall back on.',
      narration: 'The run passes an accepting state and keeps going: slash is a token, but slash star might be a longer one.',
      keyword: 'passes an accepting state',
      trap: 'Thinking longest match means "the longest token that exists". It means the longest prefix that the automaton accepts.'
    },
    {
      id: 'm-3', scene: 'munch', start: 75, end: 82.5,
      caption: 'A lexer that stopped at the first accepting state would disagree on 6 of the 13 corpus strings.',
      detail: 'On x == 3; it would read two single equals. On ifx = 1; it would read the keyword if and then the identifier x. On 23mm it would read 2, 3, m, m. Every one of those is a wrong program.',
      narration: 'A lexer that stopped at the first accepting state would disagree on 6 of the 13 corpus strings.',
      keyword: '6 of the 13',
      trap: 'Implementing the automaton with "stop as soon as a state accepts", which looks tidier and is wrong.'
    },
    {
      id: 'm-4', scene: 'munch', start: 82.5, end: 90,
      caption: 'Keywords are not decided by the automaton here: five of them spelled out as paths would add 21 states.',
      detail: 'So the identifier is recognised by the automaton and its text is looked up in a keyword table afterwards. A trie over the five keywords needs 21 states; the table needs no states and one lookup per identifier.',
      narration: 'Keywords are not decided by the automaton here: five of them spelled out as paths would add 21 states.',
      keyword: '21 states',
      trap: 'Believing a keyword must be matched before an identifier inside the automaton. Either design works; only one is what most lexers do.'
    },

    /* ---------- scene 4 ---------- */
    {
      id: 'n-1', scene: 'nofinish', start: 90, end: 97.5,
      caption: 'There are exactly two ways to fail. No move at all from the start state: in x = 3 $ y; that is character 7.',
      detail: 'The dollar matches no rule. The automaton never leaves the start state, so there is not even a partial token to report — only a character that cannot begin one.',
      narration: 'There are exactly two ways to fail. No move at all from the start state: in x = 3 $ y; that is character 7.',
      keyword: 'no move at all',
      trap: 'Reporting "unexpected token" for an illegal character. No token was formed, so no token can be named.'
    },
    {
      id: 'n-2', scene: 'nofinish', start: 97.5, end: 105,
      caption: 'The second failure is a move that can never finish: the run leaves the start state and reaches no accepting state.',
      detail: 'The string literal and the comment are the two shapes here that can do this, because both begin with a character that opens something and must be closed later.',
      narration: 'The second failure is a move that can never finish: the run leaves the start state and reaches no accepting state.',
      keyword: 'can never finish',
      trap: 'Treating the two failures as one. One has a partial token and a class to name; the other has a character and nothing else.'
    },
    {
      id: 'n-3', scene: 'nofinish', start: 105, end: 112.5,
      caption: 'In x = "abc and a newline, the quote opens at character 5 and the error is reported at character 9.',
      detail: 'The automaton cannot cross a newline inside a literal, so it stops there. Four characters of input have been consumed and thrown away.',
      narration: 'In x = "abc and a newline, the quote opens at character 5 and the error is reported at character 9.',
      keyword: 'character 5 and character 9',
      trap: 'Reading the reported position as the position of the mistake. It is the position where the lexer gave up.'
    },
    {
      id: 'n-4', scene: 'nofinish', start: 112.5, end: 120,
      caption: 'The position in the message is where the run gave up, not where the cause is. Keep both numbers.',
      detail: 'This is the same distinction the parser lesson makes with the blank cell: the report names the place the machine stopped, and the learner has to walk back to the cause.',
      narration: 'The position in the message is where the run gave up, not where the cause is. Keep both numbers.',
      keyword: 'both numbers',
      trap: 'Deleting at the reported position. That removes the newline, not the quote.'
    },

    /* ---------- scene 5 ---------- */
    {
      id: 'f-1', scene: 'fallback', start: 120, end: 127.5,
      caption: 'A string literal has no fallback: a lone quote is not a token, so the failure is reported.',
      detail: 'The start state has a move on the quote, so the run begins; but no state reached from it accepts until the closing quote arrives. Nothing to fall back on means an error.',
      narration: 'A string literal has no fallback: a lone quote is not a token, so the failure is reported.',
      keyword: 'no fallback',
      trap: 'Expecting a "best effort" token. A lexer reports rather than guessing when it has nothing accepted.'
    },
    {
      id: 'f-2', scene: 'fallback', start: 127.5, end: 135,
      caption: 'A comment does have one. The slash is a token by itself, so /* unterminated yields three tokens and no error.',
      detail: 'The run records the slash, enters the comment on the star, and never finds the closing pair. Longest match falls back to the slash, and the next pass reads the star and then the word as an identifier.',
      narration: 'A comment does have one. The slash is a token by itself, so slash star unterminated yields three tokens and no error.',
      keyword: 'three tokens and no error',
      trap: 'Assuming an unterminated comment is reported by the automaton. Under pure longest match it is not reported at all.'
    },
    {
      id: 'f-3', scene: 'fallback', start: 135, end: 142.5,
      caption: 'So a real lexer commits: on seeing /* it enters the comment and reports the missing */ at the end of the input.',
      detail: 'That commitment is a rule outside the automaton — a decision made by the scanner driver, not by the transition table. It is why the error can name the comment rather than a stray star.',
      narration: 'So a real lexer commits: on seeing slash star it enters the comment and reports the missing closing pair at the end of the input.',
      keyword: 'commits',
      trap: 'Thinking every lexer behaviour can be read off the DFA. The driver makes some of the decisions.'
    },
    {
      id: 'f-4', scene: 'fallback', start: 142.5, end: 150,
      caption: 'That is also why the same two characters mean a comment in one place and a division in another.',
      detail: 'The pair is decided by what came before it: after a value, a slash followed by a star is still a comment, because the automaton prefers the longer token. Nothing about the characters alone settles it.',
      narration: 'That is also why the same two characters mean a comment in one place and a division in another.',
      keyword: 'the same two characters',
      trap: 'Deciding the class from the characters without asking which state the run is in.'
    },

    /* ---------- scene 6 ---------- */
    {
      id: 'c-1', scene: 'classify', start: 150, end: 157.5,
      caption: 'Three phases, three tests. Lexical: can this character be part of any token?',
      detail: 'That is the whole of the lexical test, and it is answered by the automaton with no knowledge of the rest of the file. A character that fits no rule fails it; a character that fits a rule passes it.',
      narration: 'Three phases, three tests. Lexical: can this character be part of any token?',
      keyword: 'can this character be part of any token',
      trap: 'Widening the lexical test to "is this the token I expected here", which is the parser\'s question.'
    },
    {
      id: 'c-2', scene: 'classify', start: 157.5, end: 165,
      caption: 'Syntactic: may these well-formed tokens appear in this order? Semantic: do the types and names obey the rules?',
      detail: 'A missing semicolon, an unbalanced bracket and a statement that starts with a number are all syntactic. An undeclared name, a type mismatch and a wrong argument count are semantic.',
      narration: 'Syntactic: may these well-formed tokens appear in this order? Semantic: do the types and names obey the rules?',
      keyword: 'in this order',
      trap: 'Calling a type mismatch a syntactic error because it "looks wrong".'
    },
    {
      id: 'c-3', scene: 'classify', start: 165, end: 172.5,
      caption: 'GATE CSE 2026 Set 1 asked exactly this of three statements: S1 is the lexical error, S3 the semantic one, answer C.',
      detail: 'S1 opens a string literal that never closes, so no token can be formed: lexical. S2 closes it and is fine. S3 is lexically and syntactically clean and breaks a type rule: semantic.',
      narration: 'GATE CSE 2026 Set 1 asked exactly this of three statements: S1 is the lexical error, S3 the semantic one, answer C.',
      keyword: 'S1 lexical, S3 semantic',
      trap: 'Reading S2 as an error because the semicolon sits inside the quotes. Inside a literal, it is just a character.'
    },
    {
      id: 'c-4', scene: 'classify', start: 172.5, end: 180,
      caption: 'The parser sees only tokens. On 3 + 4 ; every token is fine and the statement cannot start with a number.',
      detail: 'The lexer produced number, operator, number, operator without complaint. The parser rejects the first token, and the error belongs to the phase that found it.',
      narration: 'The parser sees only tokens. On 3 + 4 ; every token is fine and the statement cannot start with a number.',
      keyword: 'every token is fine',
      trap: 'Blaming the lexer because the fault is at the first token.'
    },

    /* ---------- scene 7 ---------- */
    {
      id: 'p-1', scene: 'panic', start: 180, end: 187.5,
      caption: 'Panic mode in a lexer: delete characters until one appears that can begin a token, then resume.',
      detail: 'Nothing is pushed and nothing is popped, because a lexer has no stack. The only thing recovery can change is the input position, so the count that matters is characters deleted.',
      narration: 'Panic mode in a lexer: delete characters until one appears that can begin a token, then resume.',
      keyword: 'characters deleted',
      trap: 'Carrying the parser\'s pop-and-discard picture into the lexer. There is nothing to pop.'
    },
    {
      id: 'p-2', scene: 'panic', start: 187.5, end: 195,
      caption: 'On x = 3 $ y; that is one deletion, and the run continues with x = 3 y ;.',
      detail: 'The dollar is deleted, the space can begin whitespace, and scanning resumes normally. One report, one character gone, and the rest of the line is tokenised.',
      narration: 'On x = 3 $ y; that is one deletion, and the run continues with x = 3 y ;.',
      keyword: 'one deletion',
      trap: 'Deleting to the end of the line. The rule stops at the first character that can begin a token.'
    },
    {
      id: 'p-3', scene: 'panic', start: 195, end: 202.5,
      caption: 'On x = @@@ 3; it is three deletions in one pass, and the run continues with x = 3 ;.',
      detail: 'Three characters cannot begin a token, so all three go before the scan resumes. The recovery does not report three errors, because it never stopped three times.',
      narration: 'On x = @@@ 3; it is three deletions in one pass, and the run continues with x = 3 ;.',
      keyword: 'three deletions',
      trap: 'Reporting one error per deleted character.'
    },
    {
      id: 'p-4', scene: 'panic', start: 202.5, end: 210,
      caption: 'Recovery counts characters; the report counts positions. One error can cost three characters.',
      detail: 'That difference is why a compiler can print one message for a run of junk. The message names the position where the run began, and the recovery quietly removes the rest.',
      narration: 'Recovery counts characters; the report counts positions. One error can cost three characters.',
      keyword: 'characters against positions',
      trap: 'Assuming the number of messages equals the number of mistakes.'
    },

    /* ---------- scene 8 ---------- */
    {
      id: 'g-1', scene: 'guard', start: 210, end: 217.5,
      caption: 'The rule needs a guard. At an unterminated literal the offending character is a newline, and whitespace can begin a token.',
      detail: 'The rule asks for a character that can begin a token, and a newline begins whitespace. So the very character that stopped the run satisfies the rule, and the deletion count is zero.',
      narration: 'The rule needs a guard. At an unterminated literal the offending character is a newline, and whitespace can begin a token.',
      keyword: 'the deletion count is zero',
      trap: 'Reading "can begin a token" as "can begin a useful token". Whitespace counts.'
    },
    {
      id: 'g-2', scene: 'guard', start: 217.5, end: 225,
      caption: 'So nothing is deleted, the same error returns, and the loop never ends. The guard: if a pass deletes nothing, delete the offending character.',
      detail: 'The guard is one line and it is what makes the procedure terminate. Every recovery rule in a compiler needs one, for the same reason: the rule is written to preserve as much input as possible, and sometimes that means preserving all of it.',
      narration: 'So nothing is deleted, the same error returns, and the loop never ends. The guard: if a pass deletes nothing, delete the offending character.',
      keyword: 'if a pass deletes nothing',
      trap: 'Trusting a recovery rule to terminate because it looks sensible.'
    },
    {
      id: 'g-3', scene: 'guard', start: 225, end: 232.5,
      caption: 'Now one deletion, one report, and the tokens are x = y = 2 ; — the literal has silently disappeared.',
      detail: 'The newline is deleted, scanning resumes at the next line, and the text of the unterminated literal is gone. The stream that remains is shorter than the program that was written.',
      narration: 'Now one deletion, one report, and the tokens are x = y = 2 ; — the literal has silently disappeared.',
      keyword: 'silently disappeared',
      trap: 'Believing recovery preserves the program. It preserves the scan, not the text.'
    },
    {
      id: 'g-4', scene: 'guard', start: 232.5, end: 240,
      caption: 'Skipping to a delimiter instead deletes four characters on x = @ y ; z = 1; and resumes at the semicolon.',
      detail: 'The delimiter is kept, so the parser still sees a statement ending where the programmer meant one. That is the point of syncing to a semicolon: the token stream keeps its shape.',
      narration: 'Skipping to a delimiter instead deletes four characters on x = @ y ; z = 1; and resumes at the semicolon.',
      keyword: 'four characters',
      trap: 'Deleting the delimiter too, which destroys the boundary the parser needs.'
    },

    /* ---------- scene 9 ---------- */
    {
      id: 'k-1', scene: 'count', start: 240, end: 247.5,
      caption: 'The counting question: GATE CSE 2026 Set 2 gives the token rules and asks how many tokens a string makes.',
      detail: 'The rules given are letter, digit, identifier, number and whitespace, with no keywords and no operators. The answer is one integer, so a single miscounted word loses the mark.',
      narration: 'The counting question: GATE CSE 2026 Set 2 gives the token rules and asks how many tokens a string makes.',
      keyword: 'one integer',
      trap: 'Counting with the full rules of C instead of the rules the question printed.'
    },
    {
      id: 'k-2', scene: 'count', start: 247.5, end: 255,
      caption: 'Nine blank-separated words, thirteen tokens. 23mm is number 23 and identifier mm.',
      detail: 'An identifier begins with a letter, so a run of digits cannot be followed by letters inside one token. The digits end the number and the letters start a new identifier.',
      narration: 'Nine blank-separated words, thirteen tokens. 23mm is number 23 and identifier mm.',
      keyword: 'nine words, thirteen tokens',
      trap: 'Answering 9. That is the number of words, and words are not a unit of the token stream.'
    },
    {
      id: 'k-3', scene: 'count', start: 255, end: 262.5,
      caption: 'The rule that decides it: an identifier begins with a letter, so after digits a letter starts a new token.',
      detail: 'The same rule that makes x1 one identifier makes 23mm two tokens: the digit run can only be a number, and a number cannot contain a letter. The asymmetry is the whole question.',
      narration: 'The rule that decides it: an identifier begins with a letter, so after digits a letter starts a new token.',
      keyword: 'begins with a letter',
      trap: 'Assuming both directions are symmetric, so that 23mm and x1 behave the same way. They do not.'
    },
    {
      id: 'k-4', scene: 'count', start: 262.5, end: 270,
      caption: 'Count per word and add: one, two, one, one, two, one, two, two, one is thirteen.',
      detail: 'Each word is scanned on its own here because the blanks separate them, and the longest match inside a word is decided by the two rules. The sum is the answer, and the page recomputes it from the scanner.',
      narration: 'Count per word and add: one, two, one, one, two, one, two, two, one is thirteen.',
      keyword: 'thirteen',
      trap: 'Adding the digits rather than the tokens.'
    },

    /* ---------- scene 10 ---------- */
    {
      id: 'x-1', scene: 'proc', start: 270, end: 277.5,
      caption: 'Five steps: scan with longest match, name the failing character and position, decide which failure it is, recover with a guard, report.',
      detail: 'The order matters because each step uses the previous one. The character and the position make the message; the kind of failure chooses the recovery; the guard is what makes it terminate.',
      narration: 'Five steps: scan with longest match, name the failing character and position, decide which failure it is, recover with a guard, report.',
      keyword: 'five steps',
      trap: 'Jumping to the recovery before naming the character and the position.'
    },
    {
      id: 'x-2', scene: 'proc', start: 277.5, end: 285,
      caption: 'Four traps: counting words, calling a misplaced token lexical, reading the reported position as the cause, forgetting the comment\'s fallback.',
      detail: 'Each one is measured on this page. Nine words against thirteen tokens; six strings where all tokens are well formed; four characters between the quote and the report; three tokens and no error on an unterminated comment.',
      narration: 'Four traps: counting words, calling a misplaced token lexical, reading the reported position as the cause, forgetting the comment fallback.',
      keyword: 'four traps',
      trap: 'Memorising the traps without the numbers that expose them.'
    },
    {
      id: 'x-3', scene: 'proc', start: 285, end: 292.5,
      caption: 'Every recovery here changes characters, not tokens. Carry two counts: characters deleted and errors reported.',
      detail: 'A lexer has no stack, so there is nothing else to count. Panic mode changes the position, syncing changes it further, and neither one edits the token stream it has already emitted.',
      narration: 'Every recovery here changes characters, not tokens. Carry two counts: characters deleted and errors reported.',
      keyword: 'two counts',
      trap: 'Treating the two lexer strategies as different mechanisms. They differ only in where the scan restarts.'
    },
    {
      id: 'x-4', scene: 'proc', start: 292.5, end: 300,
      caption: 'And a repaired program is not a correct program: x = y = 2 ; is what the guard left, and the parser rejects it.',
      detail: 'Recovery buys the compiler a way to keep reading. The verdict on the program is a separate question, answered by every later phase.',
      narration: 'And a repaired program is not a correct program: x = y = 2 ; is what the guard left, and the parser rejects it.',
      keyword: 'not a correct program',
      trap: 'Concluding that recovery made the program valid.'
    }
  ]
};
