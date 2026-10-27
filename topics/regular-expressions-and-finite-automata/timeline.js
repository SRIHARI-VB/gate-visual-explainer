/* ==========================================================================
   regular-expressions-and-finite-automata - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 320,

  scenes: [
    {
      id: 'language',
      n: 1,
      title: 'A language is a set of strings',
      start: 0, end: 32,
      objective: 'Read a language as a set of strings and a machine as a yes-or-no answer for each one, then name the five parts of a deterministic machine.'
    },
    {
      id: 'dfa',
      n: 2,
      title: 'Five parts and one walk',
      start: 32, end: 64,
      objective: 'Run a deterministic machine on a concrete string, and see that the state after a prefix is the only memory the machine has.'
    },
    {
      id: 'nfa',
      n: 3,
      title: 'Nondeterminism is a set of live states',
      start: 64, end: 96,
      objective: 'Treat an NFA run as a set of states rather than one state, and fold in the epsilon-closure so that epsilon arrows cost nothing.'
    },
    {
      id: 'subset',
      n: 4,
      title: 'One DFA state per set of NFA states',
      start: 96, end: 128,
      objective: 'Build the equivalent DFA by subset construction, count the reachable sets, and read the 2-to-the-n bound as an upper limit rather than a law.'
    },
    {
      id: 'counting',
      n: 5,
      title: 'Counting the states you cannot avoid',
      start: 128, end: 160,
      objective: 'Use distinguishability by suffix to justify a state count, and apply it to the three suffix patterns that dominate previous-year papers.'
    },
    {
      id: 'minimise',
      n: 6,
      title: 'Merging what no string can separate',
      start: 160, end: 192,
      objective: 'Run table filling on a seven-state machine, read the merge classes off the table, and check the quotient against the original by brute force.'
    },
    {
      id: 'modulo',
      n: 7,
      title: 'Counters multiply; the answer is the lcm',
      start: 192, end: 224,
      objective: 'Build a machine that counts one symbol modulo m, take the product with a count modulo n, and explain why the size is the least common multiple.'
    },
    {
      id: 'regex',
      n: 8,
      title: 'Regular expressions and the Thompson construction',
      start: 224, end: 256,
      objective: 'Read a regular expression as three operations, then build an epsilon-NFA from it by Thompson\'s rule and count the states that construction produces.'
    },
    {
      id: 'closure',
      n: 9,
      title: 'From a picture to an expression, and what closure buys',
      start: 256, end: 288,
      objective: 'Recover a regular expression by state elimination, and use the product and complement constructions to decide membership of combined languages.'
    },
    {
      id: 'pumping',
      n: 10,
      title: 'Why a finite machine cannot count',
      start: 288, end: 320,
      objective: 'Derive the pumping lemma from the pigeonhole principle, use it to refute a-to-the-n b-to-the-n, and leave with the four-step procedure and the traps.'
    }
  ],

  events: [

    /* ---------------- scene 1: language ---------------- */
    {
      id: 'lg-1', start: 0, end: 8, scene: 'language',
      caption: 'A language is just a set of strings. A machine is a yes-or-no answer for every string.',
      detail: 'An alphabet, written Sigma, is a finite set of symbols; here it is the two symbols 0 and 1. A string is any finite sequence of symbols, and the empty string, written epsilon, is the string of length zero. Sigma-star is the set of all strings over the alphabet. A language is any subset of Sigma-star: the empty set, a finite list, or an infinite set defined by a rule. Nothing more is required.',
      keyword: 'a language is just a set of strings',
      trap: 'Believing a language must be infinite, or must come from a rule. The empty set is a language, and so is the single string 0101. A machine that says no to everything accepts the empty language, and that is a perfectly good machine.',
      narration: 'A language is just a set of strings. A machine is a yes-or-no answer for every string.'
    },
    {
      id: 'lg-2', start: 8, end: 16, scene: 'language',
      caption: 'Five parts make a deterministic machine: states, alphabet, transition rule, start state, accepting states.',
      detail: 'A deterministic finite automaton is a five-tuple: a finite set of states Q, an alphabet Sigma, a transition function delta that takes a state and a symbol and returns exactly one state, a start state q0, and a set of accepting states F. Deterministic means delta is single-valued and total: every state has exactly one arrow for every symbol, with no choice and no gap.',
      keyword: 'five parts',
      trap: 'Leaving an arrow out and calling the machine deterministic. A missing arrow is a gap, not a rejection. The usual repair is to add one dead state that loops to itself, which is exactly what the four-state machine for "does not contain 111" does.',
      narration: 'Five parts make a deterministic machine: states, alphabet, transition rule, start state, accepting states.'
    },
    {
      id: 'lg-3', start: 16, end: 24, scene: 'language',
      caption: 'The state is the only memory the machine has. After a prefix it knows nothing else.',
      detail: 'The machine reads the string once, left to right, and never looks back. Whatever it must remember about the prefix it has already read has to be encoded in which state it is standing in. There is no counter, no stack and no tape. This single fact is the source of every state count in this lesson and of the pumping lemma at the end.',
      keyword: 'the state is the only memory',
      trap: 'Assuming the machine can compare two halves of a string. It cannot: by the time the second half arrives, the first half has been compressed into one state, and there are only finitely many states.',
      narration: 'The state is the only memory the machine has. After a prefix it knows nothing else.'
    },
    {
      id: 'lg-4', start: 24, end: 32, scene: 'language',
      caption: 'So every question in this topic reduces to one: how much must the machine remember, and in how few states?',
      detail: 'Given a language, the design question is which distinctions about the prefix matter and which can be forgotten. Given a machine, the analysis question is which of its states say the same thing. Those two questions are the same question asked from opposite ends, and they organise the whole lesson: construction, counting, minimisation, and the limit of what is possible.',
      keyword: 'how much must the machine remember',
      trap: 'Designing a machine by drawing arrows until it feels right. Start from the list of distinctions the language forces, and the arrows follow.',
      narration: 'So every question here reduces to one: how much must the machine remember, and in how few states?'
    },

    /* ---------------- scene 2: the DFA walk ---------------- */
    {
      id: 'df-1', start: 32, end: 40, scene: 'dfa',
      caption: 'Delta takes a state and one symbol and gives exactly one state. Single-valued is what deterministic means.',
      detail: 'The transition function is a table with one row per state and one column per symbol. Every cell holds exactly one state name. Because there is exactly one entry per cell, the run of the machine on a string is completely determined: no guessing, no backtracking, and no two different runs on the same string.',
      keyword: 'exactly one state',
      trap: 'Confusing deterministic with complete. A machine can be deterministic and still be missing an arrow, in which case the run simply dies. GATE papers usually assume a complete machine, so add the dead state explicitly rather than relying on the omission.',
      narration: 'Delta takes a state and one symbol and gives exactly one state. Single-valued is what deterministic means.'
    },
    {
      id: 'df-2', start: 40, end: 48, scene: 'dfa',
      caption: 'The extended function folds a whole string one symbol at a time, starting from the start state.',
      detail: 'Write delta-hat of q and w for the state reached from q after reading all of w. It is defined by recursion: delta-hat of q and the empty string is q, and delta-hat of q and w followed by symbol a is delta applied to delta-hat of q and w. That is the entire semantics of the machine, and every membership question is one evaluation of it.',
      keyword: 'one symbol at a time',
      trap: 'Reading the string right to left. Automata read left to right, and a language that looks regular one way may not be regular the other. Reversal is a separate theorem, not a convention.',
      narration: 'The extended function folds a whole string one symbol at a time, starting from the start state.'
    },
    {
      id: 'df-3', start: 48, end: 56, scene: 'dfa',
      caption: 'Reading 0011 through the four-state machine ends in the accepting state, so 0011 is in the language.',
      detail: 'The machine tracks the longest suffix of what it has read that is a prefix of the pattern 011. From the start state a 0 moves it to the state meaning "I hold a 0", a second 0 keeps it there, a 1 moves it to "I hold 01", and the next 1 moves it to "I hold 011", which accepts. Four states, one for each length of matched prefix.',
      keyword: 'ends in the accepting state',
      trap: 'Reading the four states as "how many 1s I have seen". They are lengths of a matched prefix, not counts. The same picture serves both only when the pattern happens to be a run of one symbol.',
      narration: 'Reading 0011 through the four-state machine ends in the accepting state, so 0011 is in the language.'
    },
    {
      id: 'df-4', start: 56, end: 64, scene: 'dfa',
      caption: 'Change one arrow and the language changes. The machine is the language, written out.',
      detail: 'For "ends with 011" the state holding 011 must fall back when it reads a 0, because the new suffix is 0110 and the longest prefix of the pattern it ends with is a single 0. For "contains 011" the same state becomes a sink that loops to itself, because once the pattern has appeared it can never be undone. Two machines, both with four states, and two different languages.',
      keyword: 'the machine is the language',
      trap: 'Treating "contains" and "ends with" as the same question. They cost the same number of states here, which is exactly why the difference is easy to miss and worth a question.',
      narration: 'Change one arrow and the language changes. The machine is the language, written out.'
    },

    /* ---------------- scene 3: NFA ---------------- */
    {
      id: 'nf-1', start: 64, end: 72, scene: 'nfa',
      caption: 'A nondeterministic machine may have zero, one or many arrows for the same state and the same symbol.',
      detail: 'In an NFA the transition function returns a set of states rather than a single state. The run is no longer a path but a tree: at each symbol the machine may follow any arrow that carries that symbol, and arrows that carry a different symbol are simply not taken. An absent arrow means the branch dies, which is a third possibility that a DFA does not have.',
      keyword: 'zero, one or many arrows',
      trap: 'Thinking an NFA guesses and is therefore more powerful. It has exactly the same power: every NFA has an equivalent DFA. Nondeterminism buys shorter descriptions, not more languages.',
      narration: 'A nondeterministic machine may have zero, one or many arrows for the same state and the same symbol.'
    },
    {
      id: 'nf-2', start: 72, end: 80, scene: 'nfa',
      caption: 'Run it and you do not have a state; you have a set of states that are all still possible.',
      detail: 'At every moment the NFA is in a set of states, one for each branch that has survived. Reading a symbol replaces the set by the union of the targets of every arrow leaving any state in the set. The set can shrink, stay the same size, or grow, and it can become empty, at which point the run has died and no further symbol can revive it.',
      keyword: 'a set of states that are all still possible',
      trap: 'Tracking only the "best" branch. There is no best branch: the machine accepts if any branch accepts, so discarding a branch can turn an accept into a reject.',
      narration: 'Run it and you do not have a state; you have a set of states that are all still possible.'
    },
    {
      id: 'nf-3', start: 80, end: 88, scene: 'nfa',
      caption: 'An epsilon arrow reads nothing and costs nothing. The epsilon-closure adds every state reachable by epsilon alone.',
      detail: 'Epsilon is the empty string. An arrow labelled epsilon may be followed without consuming an input symbol, so it can be followed any number of times in a row, including immediately after another epsilon arrow. The epsilon-closure of a set is that set plus everything reachable from it along epsilon arrows only. Every NFA operation begins and ends by taking a closure.',
      keyword: 'the epsilon-closure',
      trap: 'Forgetting to close the start set. A machine whose start state has an epsilon arrow begins in the closure of the start state, not in the start state alone, and every later step must be closed too.',
      narration: 'An epsilon arrow reads nothing and costs nothing. The epsilon-closure adds every state reachable by epsilon alone.'
    },
    {
      id: 'nf-4', start: 88, end: 96, scene: 'nfa',
      caption: 'The machine accepts if any one live state is accepting. One lucky guess is enough.',
      detail: 'Acceptance for an NFA is existential: the string is in the language if at least one run of the machine ends in an accepting state. Equivalently, after reading the whole string, the set of live states intersects the accepting set. This is the same rule that makes the subset construction work, because a set intersects the accepting states exactly when the DFA state built from it is accepting.',
      keyword: 'any one live state is accepting',
      trap: 'Requiring every branch to accept. That is the rule for the universal reading, which is a different machine. An NFA says yes if one path says yes.',
      narration: 'The machine accepts if any one live state is accepting. One lucky guess is enough.'
    },

    /* ---------------- scene 4: subset construction ---------------- */
    {
      id: 'sc-1', start: 96, end: 104, scene: 'subset',
      caption: 'The subset construction makes one DFA state out of each reachable set of NFA states.',
      detail: 'Start from the epsilon-closure of the NFA start state, which becomes the DFA start state. For each DFA state, which is a set, and each symbol, collect the targets of every arrow carrying that symbol out of every state in the set, close under epsilon, and make the result a new DFA state. Repeat until nothing new appears. The result is deterministic because the union of a collection of sets is one set.',
      keyword: 'one DFA state per reachable set',
      trap: 'Building all 2-to-the-n subsets. Only reachable sets become states, and in practice the reachable count is far smaller than the bound.',
      narration: 'The subset construction makes one DFA state out of each reachable set of NFA states.'
    },
    {
      id: 'sc-2', start: 104, end: 112, scene: 'subset',
      caption: 'This NFA has four states, so sixteen subsets exist, but only four are reachable.',
      detail: 'The four reachable sets are the start state alone, the start state with the "I hold a 0" state, the start state with "I hold 01", and the start state with "I hold 011". Each symbol carries the start state forward because the NFA loops on itself there, which is why every set contains it. Twelve of the sixteen subsets never arise.',
      keyword: 'only four are reachable',
      trap: 'Reporting 2-to-the-n as the answer to "how many states does the DFA have". It is the worst case, and a question that asks for the actual number wants the reachable count.',
      narration: 'This NFA has four states, so sixteen subsets exist, but only four are reachable.'
    },
    {
      id: 'sc-3', start: 112, end: 120, scene: 'subset',
      caption: 'So an n-state NFA becomes a DFA of at most 2 to the n states. That is an upper bound.',
      detail: 'The construction never creates more states than there are subsets, so the DFA has at most 2-to-the-n states before minimisation. GATE 2018 asked exactly this and the correct option was k less than or equal to 2-to-the-n. It is a bound on the blow-up, and it is tight for some languages, which is why nondeterminism can be exponentially more compact.',
      keyword: 'at most 2 to the n states',
      trap: 'Reading the bound as a lower bound and concluding k is at least n. That is false, and the next beat gives the counterexample.',
      narration: 'So an n-state NFA becomes a DFA of at most 2 to the n states. That is an upper bound.'
    },
    {
      id: 'sc-4', start: 120, end: 128, scene: 'subset',
      caption: 'The bound is an upper limit, not a floor: a four-state NFA can have a one-state minimal DFA.',
      detail: 'Take four states where one loops to itself on both symbols and is accepting, and the other three are unreachable decoration with epsilon arrows into it. The only reachable subset is that one state, so the minimal DFA has a single state and accepts everything. The NFA is four times larger than it needs to be, which is exactly the half of the 2018 question that was false.',
      keyword: 'not a floor',
      trap: 'Assuming a minimal DFA is never smaller than the NFA it came from. It usually is smaller, and it can be smaller by an unbounded factor.',
      narration: 'The bound is an upper limit, not a floor: a four-state NFA can have a one-state minimal DFA.'
    },

    /* ---------------- scene 5: counting states ---------------- */
    {
      id: 'ct-1', start: 128, end: 136, scene: 'counting',
      caption: 'Two strings are distinguishable if some suffix puts one in the language and the other out.',
      detail: 'Fix a language L and two strings u and v. Call them distinguishable if there is a suffix w such that exactly one of uw and vw is in L. If no such suffix exists they are indistinguishable. Distinguishability is an equivalence relation on strings, and its classes are exactly the states of the minimal deterministic machine for L. This is the Myhill-Nerode statement, and it is the only honest way to prove a state count.',
      keyword: 'distinguishable if some suffix',
      trap: 'Proving a machine is minimal by failing to see a merge. A picture that looks irreducible is not a proof; either exhibit a distinguishing suffix for every pair, or run table filling.',
      narration: 'Two strings are distinguishable if some suffix puts one in the language and the other out.'
    },
    {
      id: 'ct-2', start: 136, end: 144, scene: 'counting',
      caption: 'A DFA state is a class of strings no suffix can separate, so the count is forced, not chosen.',
      detail: 'If two strings are indistinguishable then any correct machine must end in the same state after reading either one, because from that state the same suffixes must be accepted. If they are distinguishable the machine must end in different states. So the number of states of the minimal machine equals the number of classes, and no cleverer design can do better.',
      keyword: 'the count is forced',
      trap: 'Counting states by counting the conditions in the English sentence. Conditions can overlap or imply one another, and then the count is smaller than the sentence suggests.',
      narration: 'A DFA state is a class of strings no suffix can separate, so the count is forced, not chosen.'
    },
    {
      id: 'ct-3', start: 144, end: 152, scene: 'counting',
      caption: '"Ends with 10" needs three states: nothing yet, a 1 seen, a 10 seen.',
      detail: 'The three classes are: strings whose last symbol is not 1, strings ending in a single 1 with nothing after it, and strings ending in 10. They are pairwise distinguishable. From the first, the suffix 10 leads to acceptance; from the second, the suffix 0 leads to acceptance; from the third, the empty suffix is already accepting. GATE 2015 Set 2 asked for this count and the answer was 3.',
      keyword: 'needs three states',
      trap: 'Adding a fourth state for the empty string. The empty string behaves exactly like "last symbol is not 1", so it joins that class rather than needing its own.',
      narration: '"Ends with 10" needs three states: nothing yet, a 1 seen, a 10 seen.'
    },
    {
      id: 'ct-4', start: 152, end: 160, scene: 'counting',
      caption: '"Does not contain 111" needs four: run length 0, 1, 2, and one dead state.',
      detail: 'Track the length of the current run of 1s, capped at three. Runs of 0, 1 and 2 are all accepting because the forbidden pattern has not appeared. A run of 3 is a dead state that loops to itself and never accepts, and it cannot be merged with anything because it rejects the empty suffix while the other three accept it. GATE 2023 asked for this count and the answer was 4.',
      keyword: 'four: run length 0, 1, 2, and one dead state',
      trap: 'Answering 3 by forgetting the dead state. Without it the machine is incomplete, and completing it adds exactly one more state.',
      narration: '"Does not contain 111" needs four: run length 0, 1, 2, and one dead state.'
    },

    /* ---------------- scene 6: minimisation ---------------- */
    {
      id: 'mn-1', start: 160, end: 168, scene: 'minimise',
      caption: 'Write the last two symbols into the state and you get seven: empty, a, b, aa, ab, ba, bb.',
      detail: 'For the language of strings whose second-to-last symbol is b, the obvious machine remembers the last two symbols it has read, because the next symbol pushes the current last one into the second-to-last position. That needs one state for nothing read, two for one symbol read, and four for two symbols read: seven states in total.',
      keyword: 'seven: empty, a, b, aa, ab, ba, bb',
      trap: 'Stopping at the first machine that works. A correct machine is not a minimal machine, and previous-year papers almost always ask for the minimum.',
      narration: 'Write the last two symbols into the state and you get seven: empty, a, b, aa, ab, ba, bb.'
    },
    {
      id: 'mn-2', start: 168, end: 176, scene: 'minimise',
      caption: 'Mark pairs that differ on acceptance, then propagate: if a pair leads to a marked pair, mark it.',
      detail: 'Table filling keeps one cell per unordered pair of states. Round zero marks every pair where exactly one state is accepting, because the empty suffix distinguishes them. Then repeat: a pair is marked if some symbol sends the two states to a pair that is already marked. Stop when a full pass marks nothing. The unmarked cells are the merge classes.',
      keyword: 'if a pair leads to a marked pair, mark it',
      trap: 'Merging states that are equivalent but unreachable, or forgetting to drop unreachable states first. Remove unreachable states before you fill the table, or the count will be too high.',
      narration: 'Mark pairs that differ on acceptance, then propagate: if a pair leads to a marked pair, mark it.'
    },
    {
      id: 'mn-3', start: 176, end: 184, scene: 'minimise',
      caption: 'Three states collapse into one and two into another, so seven becomes four.',
      detail: 'The empty string, a and aa merge, because none of them has a b in the second-to-last position and none ends in b. The strings b and ab merge. What survives is four classes: the non-accepting class of things ending in a or empty, the non-accepting class ending in b with no b before it, and two accepting classes where the second-to-last symbol is b.',
      keyword: 'seven becomes four',
      trap: 'Assuming the answer is seven because the obvious machine had seven states. The quotient machine is checked here against the original on every string up to length nine.',
      narration: 'Three states collapse into one and two into another, so seven becomes four.'
    },
    {
      id: 'mn-4', start: 184, end: 192, scene: 'minimise',
      caption: 'GATE 2017 Set 1 asked exactly this: the smallest machine for (a+b)*b(a+b) has four states.',
      detail: 'The regular expression (a+b)*b(a+b) describes strings of length at least two whose second-to-last symbol is b, which is the language just minimised. The published answer is 4. Two independent archives give the same key, and the model here reaches it by table filling rather than by quoting.',
      keyword: 'has four states',
      trap: 'Reading the expression as "contains b". The last group (a+b) is exactly one symbol, which is what forces the second-to-last condition and the four states.',
      narration: 'GATE 2017 Set 1 asked exactly this: the smallest machine for (a+b)*b(a+b) has four states.'
    },

    /* ---------------- scene 7: modulo counters ---------------- */
    {
      id: 'md-1', start: 192, end: 200, scene: 'modulo',
      caption: 'To count the symbol a modulo 2 you need two states; modulo 3 you need three.',
      detail: 'The state records the count so far reduced modulo the modulus. Reading the counted symbol adds one, reading any other symbol leaves the count alone. Because the machine must distinguish every residue, all the residues are pairwise distinguishable and the machine is minimal. The accepting residues are chosen to match the condition in the question.',
      keyword: 'modulo 2 you need two states',
      trap: 'Building a chain of states for each occurrence instead of a cycle. A chain of n states accepts only up to n; a cycle of m states accepts every multiple of m, forever.',
      narration: 'To count the symbol a modulo 2 you need two states; modulo 3 you need three.'
    },
    {
      id: 'md-2', start: 200, end: 208, scene: 'modulo',
      caption: 'To do both at once you need the pairs, so the size is the least common multiple, which is six.',
      detail: 'A machine that must satisfy two independent counting conditions has to know both residues, so its states are the ordered pairs. There are two times three of them, and the pair machine is the product construction applied to the two counter machines. In general the product of a machine with m states and one with n states has m times n states before minimisation, and the minimal size divides that.',
      keyword: 'the least common multiple',
      trap: 'Multiplying without checking whether the two conditions interact. When one condition implies the other, the product collapses, and the answer is the smaller count.',
      narration: 'To do both at once you need the pairs, so the size is the least common multiple, which is six.'
    },
    {
      id: 'md-3', start: 208, end: 216, scene: 'modulo',
      caption: 'Divisible by 2 but not by 3 is the same six states with only two of them accepting.',
      detail: 'The six states are the counts modulo six. A count is divisible by 2 and not by 3 exactly when its residue modulo six is 2 or 4, since 0 is divisible by both. Marking those two states accepting gives the language, and all six states remain distinguishable, so six is the minimum. GATE CSE 2020 asked for this count and the key is 6.',
      keyword: 'only two of them accepting',
      trap: 'Marking residue 0 as accepting. Zero is divisible by 2 and also by 3, so it is excluded by the "but not" clause. That single mark is the difference between the right answer and a wrong one.',
      narration: 'Divisible by 2 but not by 3 is the same six states with only two of them accepting.'
    },
    {
      id: 'md-4', start: 216, end: 224, scene: 'modulo',
      caption: 'A product modulo 7 also needs six, because the six nonzero residues form a closed group.',
      detail: 'GATE 2025 Set 2 gave the alphabet 1 to 4 and asked for the strings whose product of symbols is 2 modulo 7. Every nonzero residue is reachable, because 3 generates the whole multiplicative group modulo 7, and the six residues are pairwise distinguishable. The machine therefore has six states, one per nonzero residue, with the residue 2 accepting.',
      keyword: 'the six nonzero residues',
      trap: 'Assuming the answer is 7 because the modulus is 7. The residue 0 is unreachable, because a product of nonzero residues is never divisible by 7. The modulus minus one is the count.',
      narration: 'A product modulo 7 also needs six, because the six nonzero residues form a closed group.'
    },

    /* ---------------- scene 8: regular expressions ---------------- */
    {
      id: 're-1', start: 224, end: 232, scene: 'regex',
      caption: 'A regular expression is built from three operations: union, concatenation and star.',
      detail: 'The base cases are a single symbol, the empty string, and the empty set. Union, written with a plus, means either part. Concatenation, written by juxtaposition, means the first then the second. Star means zero or more repetitions. Every regular expression over an alphabet is a finite expression built from those three operations, and nothing else is needed.',
      keyword: 'union, concatenation and star',
      trap: 'Treating plus as an optional character rather than a choice between whole expressions. The plus binds loosest, so a + bc means a or bc, never (a+b)c.',
      narration: 'A regular expression is built from three operations: union, concatenation and star.'
    },
    {
      id: 're-2', start: 232, end: 240, scene: 'regex',
      caption: 'Union branches, concatenation joins, star loops back. Every operation is a picture.',
      detail: 'Union needs a new entry point that can go to either branch, and a new exit that both branches reach. Concatenation needs no new states at all if the first fragment\'s exit is fused to the second\'s entry. Star needs a new entry that either enters the loop or skips it, and a new exit that the loop can reach or bypass. All three are drawn with epsilon arrows.',
      keyword: 'union branches, concatenation joins, star loops back',
      trap: 'Drawing star as a loop on the fragment itself. Without the bypass arrow the expression would mean one or more, not zero or more, and the empty string would be lost.',
      narration: 'Union branches, concatenation joins, star loops back. Every operation is a picture.'
    },
    {
      id: 're-3', start: 240, end: 248, scene: 'regex',
      caption: 'Thompson gives each operation its own two-state wrapper and joins the fragments with epsilon arrows.',
      detail: 'A symbol costs two states and one arrow. The empty string costs two states and one epsilon arrow. Union and star each cost two new states plus up to four epsilon arrows. Concatenation costs nothing extra, because the fragments share the join. The construction is mechanical, which is why it is safe to trust: it never inspects the expression, only its shape.',
      keyword: 'its own two-state wrapper',
      trap: 'Expecting the construction to give a small machine. Thompson\'s output is usually far from minimal, and the next step after building it is always minimisation.',
      narration: 'Thompson gives each operation its own two-state wrapper and joins the fragments with epsilon arrows.'
    },
    {
      id: 're-4', start: 248, end: 256, scene: 'regex',
      caption: 'For (a|b)*abb the count is 2+2+2+2+6, which is 14 states, and the machine accepts exactly the strings ending abb.',
      detail: 'Two states for a, two for b, two for their union, two for the star, and six for the literal abb, giving fourteen. The machine was run here against all 511 strings of length at most eight and it accepted exactly those ending in abb, which is the check that makes the construction trustworthy rather than merely plausible.',
      keyword: '14 states',
      trap: 'Confusing the two directions. The construction takes an expression to a machine; recovering an expression from a machine is state elimination, a different procedure with a different cost.',
      narration: 'For (a|b)*abb the count is fourteen states, and the machine accepts exactly the strings ending abb.'
    },

    /* ---------------- scene 9: elimination and closure ---------------- */
    {
      id: 'cl-1', start: 256, end: 264, scene: 'closure',
      caption: 'State elimination deletes one state at a time and rewrites the arcs that survive.',
      detail: 'Label every arc with a regular expression, starting with single symbols and epsilon. To delete a state k, for every pair of neighbours i and j replace the arc from i to j by the union of what it was and the path i to k, then k to k any number of times, then k to j. Delete until one arc remains from start to accept, and that arc is the answer.',
      keyword: 'deletes one state at a time',
      trap: 'Deleting a state without adding the self-loop term. The loop on k is what makes the middle piece "any number of times", and dropping it silently loses repetitions.',
      narration: 'State elimination deletes one state at a time and rewrites the arcs that survive.'
    },
    {
      id: 'cl-2', start: 264, end: 272, scene: 'closure',
      caption: 'Delete the odd state of a two-state machine and the answer is (0 + 10*1)*.',
      detail: 'The machine has an even-count state that accepts and an odd-count state that does not, with a self-loop on 0 in each and crossing arrows on 1. Eliminating the odd state leaves the even state with the loop 0 plus 1 followed by any number of 0s followed by 1. The whole language is that loop repeated, which is zero or more pairs of 1s separated by any number of 0s.',
      keyword: '(0 + 10*1)*',
      trap: 'Forgetting that the answer must be starred. The machine accepts the empty string because its start state accepts, and only the star produces the empty string here.',
      narration: 'Delete the odd state of a two-state machine and the answer is (0 + 10*1)*.'
    },
    {
      id: 'cl-3', start: 272, end: 280, scene: 'closure',
      caption: 'Union and intersection come from running the two machines side by side and reading both answers.',
      detail: 'The product construction pairs a state of the first machine with a state of the second. Each symbol advances both at once, so the pair machine reads the same string twice and remembers two answers. Marking a pair accepting when the first accepts gives the intersection; marking it when either accepts gives the union. The pair machine has at most the product of the two state counts.',
      keyword: 'running the two machines side by side',
      trap: 'Trying to build the union by gluing the two start states with an epsilon arrow and calling it deterministic. That is a valid NFA, not a DFA, and its state count is not the product.',
      narration: 'Union and intersection come from running the two machines side by side and reading both answers.'
    },
    {
      id: 'cl-4', start: 280, end: 288, scene: 'closure',
      caption: 'Complement flips the accepting marks, so a k-state minimal machine gives a complement of at most k states.',
      detail: 'Complementing a deterministic machine means accepting exactly the strings it rejected, so swap the accepting and non-accepting sets and leave every arrow alone. The machine must be complete for this to be correct, because a dead branch would otherwise be counted as rejection in one machine and as a missing transition in the other. Minimising afterwards can only reduce the count, so k is an upper bound on the complement too.',
      keyword: 'flips the accepting marks',
      trap: 'Complementing an NFA by flipping its accepting states. That gives a different language entirely. Complement only works directly on a deterministic, complete machine.',
      narration: 'Complement flips the accepting marks, so a k-state minimal machine gives a complement of at most k states.'
    },

    /* ---------------- scene 10: pumping lemma ---------------- */
    {
      id: 'pm-1', start: 288, end: 296, scene: 'pumping',
      caption: 'With p states, the p+1 prefixes of a long string must share a state. That is a pigeonhole.',
      detail: 'Take a string of length at least p and look at the state after each of its first p+1 prefixes. There are p+1 prefixes and only p states, so two prefixes land in the same state. Those two positions cut the string into three pieces: x before the first, y between them, and z after the second. The piece y is non-empty because the two positions are different.',
      keyword: 'a pigeonhole',
      trap: 'Forgetting that y must be non-empty. If the two positions could coincide the argument would prove nothing, which is why the split is taken between distinct prefix lengths.',
      narration: 'With p states, the p+1 prefixes of a long string must share a state. That is a pigeonhole.'
    },
    {
      id: 'pm-2', start: 296, end: 304, scene: 'pumping',
      caption: 'Repeating y keeps the string in the language, because the machine returns to the same state.',
      detail: 'The two prefixes end in the same state, so from that state the machine reads y and comes back to it. It can therefore read y any number of times, including zero, and still be in the same state before reading z. So x y-to-the-k z is in the language for every k of zero or more. That is the pumping lemma for regular languages, and it follows from finiteness alone.',
      keyword: 'repeating y keeps the string in the language',
      trap: 'Using the lemma to prove a language regular. The lemma is necessary, not sufficient: some non-regular languages satisfy it. It can only ever refute.',
      narration: 'Repeating y keeps the string in the language, because the machine returns to the same state.'
    },
    {
      id: 'pm-3', start: 304, end: 312, scene: 'pumping',
      caption: 'For a to the n b to the n, repeating y breaks the balance, so the language is not regular.',
      detail: 'Assume the language is regular with pumping length p and take the string of p a\'s followed by p b\'s. Any split puts y entirely inside the run of a\'s, because the first p characters are all a. Pumping y to zero repetitions gives fewer than p a\'s against p b\'s, which is not in the language. That contradicts the lemma, so no such p exists and the language is not regular.',
      keyword: 'repeating y breaks the balance',
      trap: 'Choosing a string that can be pumped. A proof that fails on one badly chosen string proves nothing; you must show that every legal split fails, as this one does.',
      narration: 'For a to the n b to the n, repeating y breaks the balance, so the language is not regular.'
    },
    {
      id: 'pm-4', start: 312, end: 320, scene: 'pumping',
      caption: 'The recipe: assume a pumping length, choose a string, split it three ways, and name the contradiction.',
      detail: 'Four steps. Assume the language is regular with pumping length p. Choose a string in the language longer than p, usually one whose length depends on p. Note that every legal split into x, y, z fails for some k. Conclude that the assumption was false. The five traps of this topic are: contains against ends with, a missing dead state, rounding a count down, merging unreachable states, and treating the 2-to-the-n bound as a floor.',
      keyword: 'assume a pumping length',
      trap: 'Memorising the five traps without the reason for each. Every one of them is attached to a specific previous-year question, and the reason is what transfers to a new question.',
      narration: 'The recipe: assume a pumping length, choose a string, split it three ways, and name the contradiction.'
    }
  ]
};
