/* ==========================================================================
   turing-machines-and-undecidability — THE timeline.
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
      id: 'machine',
      n: 1,
      title: 'A Turing machine: one tape, one head, one move',
      start: 0, end: 30,
      objective: 'Read the seven parts of a Turing machine, follow one move, and see that a configuration is the whole of the machine state that decides the future.'
    },
    {
      id: 'fates',
      n: 2,
      title: 'Three fates: accept, reject, loop',
      start: 30, end: 60,
      objective: 'Separate halting from looping, and separate a decider from a recogniser, because every undecidability result in this lesson is about the difference.'
    },
    {
      id: 'count',
      n: 3,
      title: 'Count the machines, then count the languages',
      start: 60, end: 90,
      objective: 'See that strings and machine descriptions are countable while languages are not, and read the diagonal argument as the flip of a table.'
    },
    {
      id: 'halt',
      n: 4,
      title: 'The halting problem cannot be decided',
      start: 90, end: 120,
      objective: 'Follow the diagonal construction: assume a decider, build a machine that contradicts it on its own description, and check that both possible answers fail.'
    },
    {
      id: 'reduce',
      n: 5,
      title: 'Reduction: carry undecidability backwards',
      start: 120, end: 150,
      objective: 'Use many-one reduction in the correct direction, and build the wrapper that turns a halting question into a question about the language of a machine.'
    },
    {
      id: 'rice',
      n: 6,
      title: 'Rice\u2019s theorem and its boundary',
      start: 150, end: 180,
      objective: 'State Rice\u2019s theorem, test non-triviality with two witnesses, and see exactly which properties escape it: the ones bounded by a number of steps.'
    },
    {
      id: 'ladder',
      n: 7,
      title: 'The decidability ladder',
      start: 180, end: 210,
      objective: 'Read the five decision problems off one table for regular, context-free, recursive, recursively enumerable and non-RE languages.'
    },
    {
      id: 'closure',
      n: 8,
      title: 'Closure and Post\u2019s theorem',
      start: 210, end: 240,
      objective: 'Name what each class is closed under, see why complement is the single asymmetry, and use dovetailing to prove that RE plus co-RE gives a decider.'
    },
    {
      id: 'papers',
      n: 9,
      title: 'Four shapes the paper keeps using',
      start: 240, end: 270,
      objective: 'Recognise the question shapes from 2014 to 2026 and solve one instance of each from its own numbers.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The procedure, and the four slips',
      start: 270, end: 300,
      objective: 'Fix a five-step routine and the four errors that cost marks in this clause.'
    }
  ],

  events: [
    /* ---------------- scene 1: the machine ---------------- */
    {
      id: 'machine-1', scene: 'machine', start: 0, end: 7.5,
      caption: 'A Turing machine has seven parts: states, tape alphabet, blank symbol, input alphabet, transition function, start state, accepting states.',
      detail: 'M = (Q, Gamma, b, Sigma, delta, q0, F). Q is a finite set of states. Gamma is the tape alphabet and contains the blank b. Sigma is the input alphabet, a subset of Gamma minus b. delta maps a state and a tape symbol to a new state, a symbol to write, and a direction. q0 is the start state and F the set of accepting states.',
      narration: 'A Turing machine has seven parts. A finite set of states. A tape alphabet, which always contains a blank symbol. An input alphabet, which is the part of the tape alphabet the input may use. A transition function. A start state. And a set of accepting states.',
      keyword: 'seven parts',
      trap: 'The tape alphabet and the input alphabet are not the same set. A machine that writes a marker symbol uses a tape symbol that no input may contain, which is why Sigma is a proper subset of Gamma in almost every exam question.'
    },
    {
      id: 'machine-2', scene: 'machine', start: 7.5, end: 15,
      caption: 'One move is four things at once: read the symbol under the head, write a new one, step left or right, change state.',
      detail: 'delta(q1, 1) = (q2, Y, L) means: in state q1 reading a 1, write Y, move the head one cell left, and enter q2. There is exactly one move for each state and symbol pair in a deterministic machine, so the whole future of the run is fixed by the table.',
      narration: 'One move is four things at once. Read the symbol under the head. Write a new symbol there. Step the head one cell left or right. And change state. Here the machine is in state q1 reading a 1, so it writes Y, steps left, and enters q2.',
      keyword: 'read, write, move, change state',
      trap: 'A move writes before it moves, so the symbol that was read is destroyed. The machine must remember it in its state, which is why these machines carry states such as "I have seen the first 1".'
    },
    {
      id: 'machine-3', scene: 'machine', start: 15, end: 22.5,
      caption: 'A configuration is the state, the tape and the head position. The table plus the configuration fixes every later step.',
      detail: 'Writing a configuration as state, tape, head position is the standard notation for an instantaneous description. The page traces the run of the machine for 0 to the n 1 to the n on the input 0011 and prints every configuration in order.',
      narration: 'A configuration is everything that decides the future: the state, the whole tape, and where the head is. On the input 0011 the machine runs for thirteen moves, marking a 0 as X, finding the matching 1, marking it Y, and walking back. Then it accepts.',
      keyword: 'configuration',
      trap: 'The tape is not part of the configuration in the sense of the input. It is the current tape, which the run has already changed. Quoting the original input as the tape at step seven is a common slip in trace questions.'
    },
    {
      id: 'machine-4', scene: 'machine', start: 22.5, end: 30,
      caption: 'The tape is unbounded, so the machine has unlimited memory. That single change from a finite automaton is what makes it a computer.',
      detail: 'A finite automaton has a fixed number of states and no store. A pushdown machine adds one stack. A Turing machine adds a tape that can be read and rewritten anywhere, which is why it can compute anything a program can compute. GATE 2027 Section 6 names this machine as the model of computation.',
      narration: 'The tape is unbounded. That is the whole difference from a finite automaton: the machine can write, come back and read again, so it has memory that grows with the problem. That is why this machine, and not the finite one, is the model of what a program can do.',
      keyword: 'unbounded tape',
      trap: 'Unbounded is not infinite in time. The tape has finitely many non-blank cells at every step; only the supply of blank cells is unlimited. A run may still never end.'
    },

    /* ---------------- scene 2: three fates ---------------- */
    {
      id: 'fates-1', scene: 'fates', start: 30, end: 37.5,
      caption: 'Every run ends in one of three ways: accept, reject, or never halt. The third is not a failure of the machine; it is a legal outcome.',
      detail: 'A deterministic machine has at most one move at each configuration, so a run is a single path. Either it reaches an accepting state, or a rejecting state, or it keeps moving for ever. The page runs four machines with a budget of four hundred moves and prints which of the three happened.',
      narration: 'Every run ends in one of three ways. It accepts. It rejects. Or it never halts. The third is not a bug. A machine is allowed to run for ever, and no rule of the model forbids it.',
      keyword: 'three fates',
      trap: 'A machine that runs out of moves is not "looping". In these tables a missing transition means the machine halts and rejects, which is a different thing from a run that keeps going. Read the table, not the outcome.'
    },
    {
      id: 'fates-2', scene: 'fates', start: 37.5, end: 45,
      caption: 'A decider halts on every input. A recogniser only has to halt on the strings it accepts.',
      detail: 'The language of a machine that always halts and answers correctly is called recursive, or decidable. The language of a machine that halts on members and may loop on non-members is called recursively enumerable, or recognisable. Every decidable language is recognisable and not the other way round.',
      narration: 'A decider halts on every input. A recogniser only has to halt on the strings it accepts. On a non-member it may run for ever, and then the answer never comes. So every decidable language is recognisable, and not the other way round.',
      keyword: 'decider against recogniser',
      trap: 'Saying "the machine decides L" when it only recognises L is the single most expensive slip in this topic. Decides means halts on all inputs with the right answer, both yes and no.'
    },
    {
      id: 'fates-3', scene: 'fates', start: 45, end: 52.5,
      caption: 'GATE CSE 2026 Set 2 Q13 asks what "M decides L" means: accept every string in L and reject every string outside it.',
      detail: 'The question gives the assertion "Turing machine M decides the language L" and asks for an equivalent statement. The key is that deciding requires halting on both sides: acceptance for members and explicit rejection for non-members. A machine that merely accepts members recognises the language; it does not decide it.',
      narration: 'GATE asked this in 2026, in Set 2, question thirteen. What does it mean to say a machine decides a language? It means it accepts every string in the language and rejects every string outside it. Not "accepts the members". Rejects the others as well.',
      keyword: 'decides',
      trap: 'The wrong options in that question all describe recognition rather than decision: "M accepts all strings of L" is true of a recogniser too, so it cannot be equivalent to deciding.'
    },
    {
      id: 'fates-4', scene: 'fates', start: 52.5, end: 60,
      caption: 'Two machines can accept the same language and differ only in whether they halt. That difference is the whole subject.',
      detail: 'The set of languages recognised by Turing machines is the recursively enumerable sets. The set of languages decided by them is the recursive sets, a proper subset. The gap is exactly the languages that some machine recognises but no machine decides, and the halting problem is the first example.',
      narration: 'Two machines can accept exactly the same language and differ only in whether they halt on the strings they reject. That difference is the whole of this subject. The languages a machine can decide form a proper part of the languages a machine can recognise, and the next scenes find the gap.',
      keyword: 'the gap',
      trap: 'The gap is not empty and it is not everything. Some languages are recognisable but not decidable, and some are not even recognisable. Keeping those two failures apart is what the ladder table is for.'
    },

    /* ---------------- scene 3: counting ---------------- */
    {
      id: 'count-1', scene: 'count', start: 60, end: 67.5,
      caption: 'List every string in shortlex order: the empty string, then 0 and 1, then 00, 01, 10, 11, and so on. Every string gets a finite index.',
      detail: 'Shortlex orders by length and then alphabetically inside a length. Because every string is finite, every string appears at some finite position, so the set of strings over a finite alphabet is countably infinite. There are 2 to the n strings of length n, and 2 to the n plus 1 minus 1 of length at most n.',
      narration: 'List every string in shortlex order. The empty string first, then the two strings of length one, then the four of length two, and so on. Every string is finite, so every string gets a finite index. That is what countable means, and it is why we can talk about the i-th string.',
      keyword: 'shortlex',
      trap: 'Countable does not mean finite. The list never ends; what matters is that each member has a finite position. A set is uncountable when no such list can exist.'
    },
    {
      id: 'count-2', scene: 'count', start: 67.5, end: 75,
      caption: 'A machine description is a string, so machines can be listed the same way: M0, M1, M2, and so on. There are countably many machines.',
      detail: 'Any Turing machine can be written down as a finite string over a finite alphabet, for instance by listing its transition table. Descriptions are strings, strings are countable, so machines are countable. This is why an input of the form angle-bracket M is a legal input: it is just a string.',
      narration: 'A machine description is a string too. Write down its table and you have a finite word. So the machines can be listed in the same order as the strings: M zero, M one, M two. There are countably many machines, and each one can be handed to another machine as input.',
      keyword: 'countably many machines',
      trap: 'The encoding must be fixed and decodable, otherwise "the i-th machine" means nothing. Every result in this lesson assumes one agreed encoding, and the choice of encoding never changes an answer.'
    },
    {
      id: 'count-3', scene: 'count', start: 75, end: 82.5,
      caption: 'A language is a set of strings, so there are as many languages as subsets of the list. That is 2 to the countably many, which is uncountable.',
      detail: 'With 31 strings of length at most 4 there are 2 to the 31, that is 2,147,483,648, languages over just those 31 strings. There are only 31 descriptions of length at most 4. The gap is not a technicality: it grows without bound as the length grows.',
      narration: 'A language is a set of strings, so it is a subset of that list. The number of subsets of a countable list is uncountable. Over the thirty one strings of length at most four there are already two to the thirty one languages, more than two thousand million, and only thirty one descriptions of length at most four.',
      keyword: 'uncountable',
      trap: 'A common wrong answer says the languages are countable because each language is a set of countable things. Counting the elements of a set and counting its subsets are different operations; the second is always strictly larger.'
    },
    {
      id: 'count-4', scene: 'count', start: 82.5, end: 90,
      caption: 'Flip every diagonal cell of the table and you have a language that differs from every listed machine at its own string. Some languages have no machine.',
      detail: 'Row i of the table is the language of machine Mi, and column i is the i-th string. Change the cell on the diagonal and the resulting language differs from row i at exactly that string, for every i. So it is not the language of any machine in the list, and the argument does not depend on which machines were listed.',
      narration: 'Now the table. Row i is the language of machine i. Column i is the i-th string. Flip every cell on the diagonal, and the language you get differs from machine i at exactly the i-th string. So it is the language of no machine in the list, and since the list was arbitrary, some language has no machine at all.',
      keyword: 'the diagonal',
      trap: 'This proves that a language with no machine exists. It does not name one. Naming one is a different and harder job, and it is what the halting problem does.'
    },

    /* ---------------- scene 4: halting ---------------- */
    {
      id: 'halt-1', scene: 'halt', start: 90, end: 97.5,
      caption: 'The halting problem asks: given a machine and an input, does the run end? The set of yes instances is written H.',
      detail: 'H is the set of strings consisting of a description of a machine, a separator, and a string, such that the machine halts on that string. H is a perfectly well-defined set. The question is whether some machine decides membership in it, and the answer is no.',
      narration: 'The halting problem asks one question: given a machine and an input, does the run end? Write H for the set of pairs where the answer is yes. H is a well defined set. The question is whether any machine can decide membership in it.',
      keyword: 'H',
      trap: 'H is not about accepting. A machine that halts and rejects is in H. Halting means the run stops, whatever it stops with.'
    },
    {
      id: 'halt-2', scene: 'halt', start: 97.5, end: 105,
      caption: 'Suppose a decider D exists: it always halts and says halt or loop. Build N, which asks D about a machine applied to itself and then does the opposite.',
      detail: 'N takes a description, asks D whether that machine halts on its own description, and then loops if D says halt and halts if D says loop. N never simulates anything itself, so N is a legal machine whenever D is. This is the diagonal step in machine form: N is built to disagree with row i at column i.',
      narration: 'Suppose a decider D exists. It always halts, and it prints halt or loop. Now build a machine N. N takes a description, asks D whether that machine halts on its own description, and then does the opposite of the answer. N is legal, because all it does is run D.',
      keyword: 'build N',
      trap: 'N is not a paradox and not a trick. It is an ordinary machine with a description like any other, which is exactly why it can be handed to itself.'
    },
    {
      id: 'halt-3', scene: 'halt', start: 105, end: 112.5,
      caption: 'Run N on its own description. If D says halt, N loops. If D says loop, N halts. Both answers are wrong.',
      detail: 'Case one: D claims N halts on its own description. By construction N then loops, so D was wrong. Case two: D claims N loops on its own description. By construction N then halts, so D was wrong. There is no third case, so no decider of this shape is correct on every input.',
      narration: 'Now run N on its own description. If D says N halts, then N loops, so D was wrong. If D says N loops, then N halts, so D was wrong again. There is no third answer, so no such decider can be right on every input.',
      keyword: 'both answers wrong',
      trap: 'The contradiction is not "D cannot be built". It is "D, if it existed, would be wrong on this one input". A decider that is wrong somewhere is not a decider.'
    },
    {
      id: 'halt-4', scene: 'halt', start: 112.5, end: 120,
      caption: 'So H is undecidable. It is still recognisable: run the machine and answer yes when it halts. Only the no answer is missing.',
      detail: 'Simulating the machine answers yes correctly, because a halting run is finite. It cannot answer no, because waiting longer never proves the run is infinite. H is therefore recursively enumerable and not recursive, and its complement is not even recognisable. GATE 2013 Q17 and 2018 Q7 both test this asymmetry.',
      narration: 'So H cannot be decided. But it is still recognisable: run the machine, and if it halts, say yes. That answer is always correct, because a halting run is finite. What no machine can do is say no, since waiting longer never proves that a run is infinite. H is recognisable and not decidable.',
      keyword: 'recognisable, not decidable',
      trap: 'Undecidable does not mean unrecognisable. The halting language is the standard example of a language that is recognisable and undecidable; its complement is the standard example of one that is not recognisable at all.'
    },

    /* ---------------- scene 5: reduction ---------------- */
    {
      id: 'reduce-1', scene: 'reduce', start: 120, end: 127.5,
      caption: 'A reduces to B when a computable function turns every instance of A into an instance of B with the same answer.',
      detail: 'Written A is many-one reducible to B, or A at most B. The function f must be computable, and must satisfy: w is in A exactly when f(w) is in B. So a decider for B plus the reduction gives a decider for A.',
      narration: 'A reduces to B when a computable function turns every instance of A into an instance of B with the same answer. If you can decide B, and you can rewrite A into B, then you can decide A. That is the whole idea, and the direction is what people get wrong.',
      keyword: 'reduces',
      trap: 'The function must be computable. A reduction that needs an undecidable step proves nothing, and exam questions occasionally hide one in an option.'
    },
    {
      id: 'reduce-2', scene: 'reduce', start: 127.5, end: 135,
      caption: 'Three implications hold and two do not. Easiness travels along the arrow; hardness travels against it.',
      detail: 'If A reduces to B and B is decidable then A is decidable. If A reduces to B and A is undecidable then B is undecidable. If A reduces to B and B is recognisable then A is recognisable. The two invalid directions are: A decidable does not make B decidable, and B undecidable does not make A undecidable.',
      narration: 'Three implications hold. If B is decidable, A is decidable. If A is undecidable, B is undecidable. If B is recognisable, A is recognisable. Two do not hold: knowing A is easy says nothing about B, and knowing B is hard says nothing about A.',
      keyword: 'direction',
      trap: 'GATE CSE 2014 Set 2 Q16 asks which implication about many-one reducibility is false, and the false one is always a reversed direction of this table.'
    },
    {
      id: 'reduce-3', scene: 'reduce', start: 135, end: 142.5,
      caption: 'The wrapper W ignores its input, runs M on w, and accepts when M halts. So the language of W is everything or nothing.',
      detail: 'If M halts on w, W accepts every input, so its language is all of Sigma star. If M never halts, W accepts nothing, so its language is empty. Deciding whether the language of a machine is empty would therefore decide halting, and that is a contradiction.',
      narration: 'Here is the gadget that does the work. A wrapper machine W ignores its own input completely, runs M on w, and accepts when that run halts. So if M halts on w, W accepts everything. If M never halts on w, W accepts nothing. Deciding emptiness of W would decide halting.',
      keyword: 'the wrapper',
      trap: 'The wrapper accepts on halting, not on accepting. It does not matter whether M accepts or rejects w; both mean the run ended, and both make W accept every string.'
    },
    {
      id: 'reduce-4', scene: 'reduce', start: 142.5, end: 150,
      caption: 'That proves emptiness of a Turing machine language is undecidable. Six machine and input pairs on this page are checked against it.',
      detail: 'The page builds the wrapper for six pairs and verifies both lines: the wrapper language is all of Sigma star exactly when the run halts, and empty exactly when it does not. The same wrapper proves that universality, regularity, and almost every other semantic property is undecidable, which is the next scene.',
      narration: 'So emptiness of the language of a machine is undecidable. The page builds the wrapper for six machine and input pairs and checks both lines on each one. The same wrapper works for universality, for regularity, and for almost every property of the language, which is the next scene.',
      keyword: 'emptiness is undecidable',
      trap: 'This says nothing about emptiness of a context-free grammar, which is decidable. The wrapper needs a machine whose run can be infinite, and a grammar is not a machine with a run.'
    },

    /* ---------------- scene 6: Rice ---------------- */
    {
      id: 'rice-1', scene: 'rice', start: 150, end: 157.5,
      caption: 'Rice\u2019s theorem: every non-trivial property of the language of a machine is undecidable. The property must be about the language.',
      detail: 'A property of recursively enumerable languages assigns true or false to each language. It is non-trivial when some language has it and some language does not. Rice says that no machine can decide, for an arbitrary machine, whether its language has such a property.',
      narration: 'Rice\u2019s theorem says one thing. Take any property of the language of a machine. If the property is not trivial, meaning some languages have it and some do not, then no machine can decide whether a given machine\u2019s language has it.',
      keyword: 'non-trivial property',
      trap: 'Trivial means true for every language or false for every language. "The language is recursively enumerable" is trivial, and decidable: the answer is always yes.'
    },
    {
      id: 'rice-2', scene: 'rice', start: 157.5, end: 165,
      caption: 'Emptiness, universality, finiteness, regularity and "at least 21 strings" are all semantic and all non-trivial, so all are undecidable.',
      detail: 'Each one splits a pair of machines: the machine that rejects everything has the empty language, the machine that accepts everything has all strings. Empty is finite and regular; all strings is infinite and not finite. So each property is non-trivial and Rice applies to each.',
      narration: 'Emptiness. Universality. Finiteness. Regularity. Having at least twenty one strings. Every one of these is a property of the language, and every one splits the same pair of machines: the one that rejects everything and the one that accepts everything. So every one is undecidable.',
      keyword: 'all undecidable',
      trap: '"At least 21 strings" feels finite and therefore checkable. It is not: the twenty first string may take arbitrarily long to appear, and may never appear.'
    },
    {
      id: 'rice-3', scene: 'rice', start: 165, end: 172.5,
      caption: 'But a property of the run is not a property of the language, so Rice says nothing about it. A bound of k steps is a finite table.',
      detail: 'In k steps the head can read at most k cells, so a run of k steps depends only on the first k symbols of the input. There are finitely many such prefixes, so the question "does M do this within k steps" is answered by filling in a finite table. That is why step-bounded properties are decidable.',
      narration: 'Now the boundary. A property of the run is not a property of the language, so Rice says nothing about it. And if the property mentions a number of steps, it is a finite question: in k steps the head reads at most k cells, so only finitely many inputs can matter.',
      keyword: 'bounded by k steps',
      trap: 'The bound must be fixed in the question. "Takes more than 2016 steps" has a fixed bound and is decidable; "takes more than finitely many steps", meaning never halts, is the halting problem again.'
    },
    {
      id: 'rice-4', scene: 'rice', start: 172.5, end: 180,
      caption: 'Four papers turn on this one line: 2020 Q26, 2021 Set 1 Q39, 2016 Set 2 Q44 and 2022 Q46.',
      detail: 'In each of them the decidable option is the one with a step bound, and the undecidable options are semantic properties. The page tests the k-step decision procedure for k equal to six against a brute-force search over inputs up to length ten, and the two agree for every machine.',
      narration: 'Four papers turn on exactly this line. The decidable option is the one with a number of steps in it. The undecidable options are the ones about the language. The page tests the six-step procedure against a search over longer inputs, and the two agree on every machine it runs.',
      keyword: 'the decidable option has a number',
      trap: 'A bound on the length of the input is not the same as a bound on steps, and neither is a bound on the size of the language. Check what the number in the question actually counts.'
    },

    /* ---------------- scene 7: the ladder ---------------- */
    {
      id: 'ladder-1', scene: 'ladder', start: 180, end: 187.5,
      caption: 'Five classes down the side, five decision problems across: membership, emptiness, universality, equivalence, finiteness.',
      detail: 'The classes are regular, context-free, recursive, recursively enumerable, and languages outside even that. D means decidable, U means undecidable, and a dash means not even recognisable, so no procedure answers yes correctly on every member.',
      narration: 'Five classes down the side: regular, context-free, recursive, recursively enumerable, and languages beyond even that. Five questions across: membership, emptiness, universality, equivalence, and finiteness. Each cell is decidable, undecidable, or not even recognisable.',
      keyword: 'five by five',
      trap: 'The rows are classes of language, not models of machine. A language can be recursive and have a machine that is not a decider; the class is a property of the language, not of the machine you happen to hold.'
    },
    {
      id: 'ladder-2', scene: 'ladder', start: 187.5, end: 195,
      caption: 'Regular and recursive languages answer every one of the five. Recursively enumerable languages answer none of them.',
      detail: 'For a DFA every one of the five is decidable by product constructions and reachability. For a decidable language the same questions are answered by running the decider. For an arbitrary machine, all five become the halting problem in disguise.',
      narration: 'For regular languages all five questions are decidable. For recursive languages all five are decidable too, by running the decider. For an arbitrary machine, every one of the five turns into the halting problem.',
      keyword: 'top and bottom rows',
      trap: 'Membership for an arbitrary machine is undecidable even though membership for a regular or context-free language is easy. The class of the language decides the cell, not the intuition that "membership is always easy".'
    },
    {
      id: 'ladder-3', scene: 'ladder', start: 195, end: 202.5,
      caption: 'The context-free row is the one worth memorising: membership, emptiness and finiteness decidable; universality and equivalence not.',
      detail: 'CFG emptiness is decided by marking the nonterminals that can reach a terminal string. Universality and equivalence are undecidable because a grammar can simulate a machine. GATE 2025 Set 2 Q25 asks which of four questions about grammars is decidable, and the answer is emptiness.',
      narration: 'The context-free row is the one to memorise. Membership, emptiness and finiteness are decidable. Universality and equivalence are not. GATE asked exactly this in 2025, Set 2, question twenty five, and the decidable option was emptiness.',
      keyword: 'context-free row',
      trap: 'Do not carry the CFL row over to deterministic context-free languages without checking: the deterministic class is closed under complement, and that changes some cells.'
    },
    {
      id: 'ladder-4', scene: 'ladder', start: 202.5, end: 210,
      caption: 'Every undecidable cell is a theorem, not a computation. The page checks only the two cells it can: grammar emptiness and machine emptiness.',
      detail: 'No program can verify an undecidability claim by testing it, because the claim is about all machines. The page therefore checks the decidable side by construction: the marking algorithm for CFG emptiness, and the wrapper for TM emptiness. The undecidable cells are cited to the papers and textbooks on the Sources tab.',
      narration: 'Every undecidable cell in that table is a theorem, not a computation. No program can check it by trying cases. So the page checks only what can be checked: the marking algorithm that decides emptiness of a grammar, and the wrapper that proves emptiness of a machine language undecidable.',
      keyword: 'theorem, not computation',
      trap: 'A page that claims to have "verified" an undecidability result by simulation has verified nothing. What can be simulated is the decidable side, or a finite instance of the diagonal argument.'
    },

    /* ---------------- scene 8: closure ---------------- */
    {
      id: 'closure-1', scene: 'closure', start: 210, end: 217.5,
      caption: 'Recursive languages are closed under union, intersection, complement, concatenation and star. Every row says closed.',
      detail: 'Closure under complement is immediate: swap the accepting and rejecting states of the decider. Union and intersection run two deciders and combine their answers, which is legal because both halt. Concatenation and star need a machine that guesses a split, which is why they are proved with nondeterminism.',
      narration: 'Recursive languages are closed under everything in this table. Union, intersection, complement, concatenation, star. Complement is the easy one: swap the accepting and rejecting states, and the same machine decides the complement.',
      keyword: 'all closed',
      trap: 'Closure under complement needs a decider, not a recogniser. Swapping the states of a recogniser produces a machine that still may not halt, so it proves nothing.'
    },
    {
      id: 'closure-2', scene: 'closure', start: 217.5, end: 225,
      caption: 'Recursively enumerable languages are closed under four of the five. Complement is the exception, and it is the only one.',
      detail: 'The recogniser for a union runs the two recognisers in parallel. The recogniser for an intersection runs them in sequence, which is safe because a recogniser that says yes is always right. For the complement there is nothing to run: a recogniser can say yes and nothing else.',
      narration: 'Recursively enumerable languages are closed under four of the five. Union, intersection, concatenation, star. Complement is the exception, and it is the only one. Everything else here can be done by running the machines you already have.',
      keyword: 'complement is the exception',
      trap: 'Closed under intersection but not complement looks inconsistent, since De Morgan would give one from the other. The escape is that RE is not closed under complement, so De Morgan cannot be applied inside the class.'
    },
    {
      id: 'closure-3', scene: 'closure', start: 225, end: 232.5,
      caption: 'Post\u2019s theorem: if a language and its complement are both recognisable, the language is decidable.',
      detail: 'Run the two recognisers in parallel, one step each, and stop when either says yes. On a member the first answers, on a non-member the second answers, so the combined machine always halts and always answers correctly. This is dovetailing, and it is the standard proof that RE plus co-RE equals recursive.',
      narration: 'Post\u2019s theorem. If a language is recognisable and its complement is recognisable too, then the language is decidable. Run both machines in parallel, a step at a time, and stop when either says yes. One of them must, so the answer always comes.',
      keyword: 'dovetailing',
      trap: 'Running them one after the other does not work: the first may run for ever. The parallelism is the proof, not a detail of implementation.'
    },
    {
      id: 'closure-4', scene: 'closure', start: 232.5, end: 240,
      caption: 'The page dovetails two recognisers and decides all 31 strings of length at most 4, in at most 14 rounds.',
      detail: 'One recogniser accepts the members of 0 to the n 1 to the n and loops on everything else; the other accepts the non-members and loops on the members. Neither is a decider on its own. The dovetailed machine is, and the page checks its answer against the definition of the language on every string of length at most four.',
      narration: 'The page builds two recognisers: one accepts the balanced strings and loops on the rest, the other accepts the rest and loops on the balanced ones. Neither decides anything alone. Run them in parallel and the result decides, and the page checks every string of length at most four.',
      keyword: 'checked on 31 strings',
      trap: 'Dovetailing does not bound the time. It proves the answer arrives, not that it arrives quickly, and no bound on the number of rounds exists in general.'
    },

    /* ---------------- scene 9: the papers ---------------- */
    {
      id: 'papers-1', scene: 'papers', start: 240, end: 247.5,
      caption: 'GATE 2020 Q26: of four languages, three are undecidable. The one about reaching a state in exactly 100 steps is decidable.',
      detail: 'The three undecidable ones are emptiness, "the language is not recursive", and "the language has at least 21 members". All three are semantic and non-trivial. The fourth is a bounded run: simulate for a hundred steps and look at the state.',
      narration: 'GATE 2020, question twenty six. Four languages, and the answer is that three are undecidable. Emptiness, not recursive, and at least twenty one members. The fourth asks whether the machine reaches a state in exactly a hundred steps, and that one is decidable, because a hundred steps is a finite table.',
      keyword: '2020 Q26',
      trap: 'The option that looks like the odd one out is the decidable one. In these clusters the odd one out is usually the bounded property, not the semantic one.'
    },
    {
      id: 'papers-2', scene: 'papers', start: 247.5, end: 255,
      caption: 'GATE 2022 Q46: equality of two machine languages, regularity, and accepting all strings are undecidable. A 1073-step bound is not.',
      detail: 'The first three are semantic properties and fall to Rice. The fourth says the machine takes more than 1073 steps on every string, which is decided by running it for 1074 steps on every input of length at most 1073 and observing that no longer input can behave differently.',
      narration: 'GATE 2022, question forty six. Equality of two machine languages, regularity, and accepting every string are undecidable. The fourth option says the machine takes more than a thousand and seventy three steps on every string, and that is decidable, because no longer input can behave differently in that many steps.',
      keyword: '2022 Q46',
      trap: 'The bound is on steps, and the reason it works is that the head cannot read past cell k in k steps. If the bound were on the number of states instead, the argument would not go through.'
    },
    {
      id: 'papers-3', scene: 'papers', start: 255, end: 262.5,
      caption: 'GATE 2021 Set 1 Q39: "more than 2021 steps on all inputs" and "on some input" are both decidable.',
      detail: 'For the first, run the machine for 2022 steps on every input of length at most 2021. If none halts earlier, the property holds for every input, since a longer input cannot finish sooner. For the second, the same finite search finds the witness if one exists.',
      narration: 'GATE 2021, Set 1, question thirty nine. Two languages: more than 2021 steps on all inputs, and more than 2021 steps on some input. Both are decidable. Search every input of length at most 2021 for 2022 steps, and the finite table answers both questions.',
      keyword: '2021 S1 Q39',
      trap: '"On all inputs" over an infinite set feels like the harder one. Here it is the easier one, because a single short counterexample would have to appear among the short inputs.'
    },
    {
      id: 'papers-4', scene: 'papers', start: 262.5, end: 270,
      caption: 'GATE 2016 Set 2 Q44: the two step-bounded languages are recursive, and "M accepts the empty string" is not.',
      detail: 'Accepting epsilon is a semantic property of the language, so Rice makes it undecidable. The two step-bounded languages are decided by bounded simulation. GATE 2014 Set 2 Q35 is the same contrast in one question: accepting some string of length 2014 is undecidable but recognisable.',
      narration: 'GATE 2016, Set 2, question forty four. The two step-bounded languages are recursive, and accepting the empty string is not. Accepting epsilon is a property of the language, so Rice applies. And 2014 Set 2 question thirty five gives the pair in one question: some string of length 2014, undecidable but recognisable.',
      keyword: '2016 S2 Q44',
      trap: 'Recognisable and decidable come apart in that 2014 question. The answer is "undecidable but recursively enumerable", and both halves of that phrase have to be justified.'
    },

    /* ---------------- scene 10: the procedure ---------------- */
    {
      id: 'decide-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: is the question about a run or about a language? A run is simulated; a language is a candidate for Rice.',
      detail: 'The word "language" or the notation L(M) is the signal. A question about steps, states, tape contents or a particular input is a question about runs, and it is decided by simulating a finite amount. This one distinction settles most of the paper.',
      narration: 'Step one. Is the question about a run or about a language? If it mentions steps, states, or a particular input, it is about a run, and you simulate. If it mentions the language of the machine, it is a candidate for Rice.',
      keyword: 'run or language',
      trap: 'A question can mention a machine and still be about its language, as "M accepts epsilon" does. The signal is whether the answer depends on the language rather than on how the machine got there.'
    },
    {
      id: 'decide-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: is there a number in the property? A fixed bound makes it a finite table, so it is decidable.',
      detail: 'A bound on steps, on the length of the input, or on the size of the tape turns an infinite question into a finite one. The bound must be fixed by the question, not by the machine. Then simulate within the bound and read off the answer.',
      narration: 'Step two. Is there a number in the property? A fixed bound on steps, or on the length of the input, makes the question finite, and a finite question is decidable. Simulate up to the bound and read the answer off the table.',
      keyword: 'a fixed bound',
      trap: 'A number that counts something else, such as "at least 21 strings in the language", is not a bound on the run. That one is semantic and undecidable.'
    },
    {
      id: 'decide-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three: if it is semantic, is it non-trivial? Exhibit two machines with different answers, then cite Rice.',
      detail: 'Non-triviality is the only hypothesis Rice needs. The machine that rejects everything and the machine that accepts everything split almost every property in the syllabus, and both are machines you can write in three lines. If the property is trivial, it is decidable, and the answer is always yes or always no.',
      narration: 'Step three. If it is a semantic property, is it non-trivial? Exhibit two machines with different answers, and Rice does the rest. The machine that rejects everything and the machine that accepts everything split almost every property you will be asked about.',
      keyword: 'two witnesses',
      trap: 'A property can be non-trivial and still decidable, but only when it is not semantic. Rice needs both conditions, and dropping one is the usual mistake.'
    },
    {
      id: 'decide-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Steps four and five: fix the direction of the reduction, and read the class off the ladder. Then check the four slips.',
      detail: 'The reduction points from the problem you want to the problem you have, so hardness flows against the arrow. For a class question, read the ladder row rather than reasoning from scratch. The four slips are Rice on a bounded property, the arrow reversed, recognition confused with decision, and undecidable read as unrecognisable.',
      narration: 'Steps four and five. Fix the direction of the reduction, because hardness flows against the arrow. Then read the class off the ladder instead of reasoning from scratch. And watch the four slips: Rice on a bounded property, the arrow reversed, recognition confused with decision, and undecidable read as unrecognisable.',
      keyword: 'the four slips',
      trap: 'The four slips account for most lost marks in this clause, and three of them are about one word: which of decidable, recognisable and unrecognisable the question actually asked.'
    }
  ]
};
