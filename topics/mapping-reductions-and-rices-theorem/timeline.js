/* ==========================================================================
   mapping-reductions-and-rices-theorem — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every figure quoted in a caption below is computed by the model in lesson.js
   and asserted there: the seven reduction instances, the seven-of-seven
   correspondence counts, the fifteen sampled strings, the two machines that
   share one language, and the state counts four and seven.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'gap',
      n: 1,
      title: 'Two problems, one arrow',
      start: 0, end: 30,
      objective: 'See a reduction as a translation from one problem to another, and see that the arrow points from the problem being given up on to the problem being assumed solved.'
    },
    {
      id: 'def',
      n: 2,
      title: 'The definition, and its two obligations',
      start: 30, end: 60,
      objective: 'State mapping reducibility with a computable total function and an if-and-only-if, and see why each half is load-bearing.'
    },
    {
      id: 'props',
      n: 3,
      title: 'Two laws, and the direction they travel',
      start: 60, end: 90,
      objective: 'Derive the two propagation laws from one procedure, and see that they have the same hypothesis and opposite conclusions.'
    },
    {
      id: 'wrong',
      n: 4,
      title: 'The wrong direction, run on fifteen strings',
      start: 90, end: 120,
      objective: 'Kill the belief that L reduces to a hard problem therefore L is hard, by exhibiting the empty language reducing to the acceptance problem.'
    },
    {
      id: 'build',
      n: 5,
      title: 'Building the wrapper machine',
      start: 120, end: 150,
      objective: 'Construct the reduction from the acceptance problem to the halting problem and see that the deliberate infinite loop is what turns a rejection into a non-halting.'
    },
    {
      id: 'run',
      n: 6,
      title: 'The wrapper, run on seven instances',
      start: 150, end: 180,
      objective: 'Watch the constructed machine actually run on seven instances and check the answer correspondence instance by instance.'
    },
    {
      id: 'equiv',
      n: 7,
      title: 'Both directions, so the same difficulty',
      start: 180, end: 210,
      objective: 'Build the reverse reduction, conclude the two problems are equivalent under the order, and check reflexivity and transitivity on the same sample.'
    },
    {
      id: 'rice',
      n: 8,
      title: 'Rice: two machines, one language',
      start: 210, end: 240,
      objective: 'See a syntactic property split two machines that share one language, which is why no semantic property can be decided from a description.'
    },
    {
      id: 'ricetrap',
      n: 9,
      title: 'Where Rice stops',
      start: 240, end: 270,
      objective: 'Sort properties into semantic and syntactic, trivial and non-trivial, and separate undecidable from unrecognisable.'
    },
    {
      id: 'table',
      n: 10,
      title: 'Which tool for which question',
      start: 270, end: 300,
      objective: 'Match the four exam shapes to the tool that settles each, and read the two previous-year questions through that table.'
    }
  ],

  events: [
    /* ---------------- scene 1: gap ---------------- */
    { id: 'e01', scene: 'gap', start: 0, end: 6,
      caption: 'A reduction is a translation, not a comparison. You rewrite one question as another question.',
      detail: 'The word reduction suggests making something smaller, and that is misleading. Nothing gets smaller. An instance of one decision problem is rewritten, by a fixed procedure, into an instance of a second decision problem, chosen so that the two instances always have the same yes-or-no answer.',
      narration: 'A reduction is a translation, not a comparison. You rewrite one question as another question.',
      keyword: 'a translation, not a comparison' },

    { id: 'e02', scene: 'gap', start: 6, end: 12,
      caption: 'Two questions to keep apart. The acceptance problem: does M accept the string w? The halting problem: does M stop on w at all?',
      detail: 'Both take a machine and a string. Accepting means reaching the accepting state. Halting means stopping, in either the accepting state or the rejecting state. Every accepting run halts; a rejecting run also halts; a looping run does neither. So halting is the weaker requirement.',
      narration: 'Two questions to keep apart. The acceptance problem asks whether M accepts w. The halting problem asks whether M stops on w at all.',
      keyword: 'accepting' },

    { id: 'e03', scene: 'gap', start: 12, end: 18,
      caption: 'Nobody compares the two problems directly. One instance of the first is turned into one instance of the second.',
      detail: 'A direct comparison would need to reason about all machines at once, and no such argument works. The reduction reasons about one instance at a time: here is an instance of question one, here is the instance of question two it becomes, and here is why the two answers must agree.',
      narration: 'Nobody compares the two problems directly. One instance of the first is turned into one instance of the second.',
      keyword: 'one instance' },

    { id: 'e04', scene: 'gap', start: 18, end: 24,
      caption: 'A machine and a string become a different machine and a string. The string may be copied; the machine is rebuilt.',
      detail: 'The instance on the left is a pair, a machine M and a string w. The instance on the right is also a pair, a machine M-prime and a string. The reduction is a program that reads the first pair and writes the second. It never runs M for an unbounded time, because it has to stop and print an answer.',
      narration: 'A machine and a string become a different machine and a string. The string may be copied; the machine is rebuilt.',
      keyword: 'rebuilt' },

    { id: 'e05', scene: 'gap', start: 24, end: 30,
      caption: 'The arrow points from the problem you give up on to the problem you assume solved. Read it as: no harder than.',
      detail: 'The notation A reduces to B means that a solver for B gives you a solver for A for free. So A is no harder than B. The arrow always points at the problem that is being assumed easier, or at least assumed available. Reversing it reverses the whole argument.',
      narration: 'The arrow points from the problem you give up on to the problem you assume solved. Read it as, no harder than.',
      keyword: 'no harder than' },

    /* ---------------- scene 2: def ---------------- */
    { id: 'e06', scene: 'def', start: 30, end: 36,
      caption: 'First obligation: the function must be computable, which means one Turing machine that halts on every input and leaves the answer on the tape.',
      detail: 'A function from strings to strings is computable when some Turing machine, started with the input string, halts with exactly the output string on its tape. The requirement is on every input, not on most inputs. A procedure that loops on some inputs does not define a computable function in this sense.',
      narration: 'First obligation. The function must be computable, which means one Turing machine that halts on every input and leaves the answer on the tape.',
      keyword: 'halts on every input' },

    { id: 'e07', scene: 'def', start: 36, end: 42,
      caption: 'Then A is mapping reducible to B when there is such a function with: w is in A exactly when f of w is in B.',
      detail: 'Written A is at most B under the mapping order. The function f takes a string to a string. The condition is a biconditional, and it must hold for every string in the alphabet, not only for the strings that happen to be in A or in B.',
      narration: 'Then A is mapping reducible to B when there is such a function with, w is in A exactly when f of w is in B.',
      keyword: 'exactly when' },

    { id: 'e08', scene: 'def', start: 42, end: 48,
      caption: 'Exactly when is two directions. Yes stays yes and no stays no. A one-way implication is not a reduction.',
      detail: 'If only the forward direction held, a yes answer for B could come from a no instance of A, and the solver for B would be useless for A. The converse is the trap on the other side: a reduction for the complement is a different function and a different statement.',
      narration: 'Exactly when is two directions. Yes stays yes and no stays no. A one-way implication is not a reduction.',
      keyword: 'two directions' },

    { id: 'e09', scene: 'def', start: 48, end: 54,
      caption: 'Both directions together are one sentence: A is the preimage of B under f. Nothing about the sizes of the two sets is claimed.',
      detail: 'The biconditional says that A equals the set of strings that f carries into B. That is why the map is called many-one: many strings of A may land on one string of B, and strings outside A must land outside B. There is no requirement that f be injective or surjective.',
      narration: 'Both directions together are one sentence. A is the preimage of B under f. Nothing about the sizes of the two sets is claimed.',
      keyword: 'preimage' },

    { id: 'e10', scene: 'def', start: 54, end: 60,
      caption: 'Why totality matters: to decide A you run f and then the decider for B. If f might not stop, the procedure is not a decider.',
      detail: 'The candidate decider for A is: on input w, compute f of w, then run the decider for B on that. Two halting computations compose into a halting computation. If the first may run forever, the composed procedure may run forever, and a procedure that may run forever is not a decider.',
      narration: 'Why totality matters. To decide A you run f and then the decider for B. If f might not stop, the procedure is not a decider.',
      keyword: 'totality' },

    /* ---------------- scene 3: props ---------------- */
    { id: 'e11', scene: 'props', start: 60, end: 66,
      caption: 'Law one, good news travels backwards. If A reduces to B and B is decidable, then A is decidable.',
      detail: 'This is the procedure from the last scene, read as a theorem. The decider for A exists because the reduction exists and the decider for B exists. The hypothesis names both. Nothing is assumed about A beforehand.',
      narration: 'Law one, good news travels backwards. If A reduces to B and B is decidable, then A is decidable.',
      keyword: 'backwards' },

    { id: 'e12', scene: 'props', start: 66, end: 72,
      caption: 'Law two, bad news travels forwards. If A reduces to B and A is undecidable, then B is undecidable.',
      detail: 'This is law one in contrapositive form, and it is the law every undecidability proof uses. Suppose B were decidable. Then by law one A would be decidable, which contradicts the hypothesis. So B is not decidable. The contradiction is the whole proof.',
      narration: 'Law two, bad news travels forwards. If A reduces to B and A is undecidable, then B is undecidable.',
      keyword: 'forwards' },

    { id: 'e13', scene: 'props', start: 72, end: 78,
      caption: 'Same hypothesis, opposite conclusions. Decidability is inherited by the left end. Undecidability is inherited by the right end.',
      detail: 'The two laws are not symmetric, and that asymmetry is the point. A property of the left side flows rightwards only when it is the bad property. A property of the right side flows leftwards only when it is the good property. Learn the picture, not the words.',
      narration: 'Same hypothesis, opposite conclusions. Decidability is inherited by the left end. Undecidability is inherited by the right end.',
      keyword: 'opposite conclusions' },

    { id: 'e14', scene: 'props', start: 78, end: 84,
      caption: 'So the trap: from A reduces to B, and B undecidable, nothing follows about A. The arrow tells you about the left end, not the right.',
      detail: 'B being undecidable is consistent with A being decidable, because the arrow only carries difficulty to the right. A may be a very easy problem that happens to be translatable into a hard one. The next scene exhibits exactly that with a real reduction, computed.',
      narration: 'So the trap. From A reduces to B, and B undecidable, nothing follows about A. The arrow tells you about the left end, not the right.',
      keyword: 'nothing follows about A' },

    { id: 'e15', scene: 'props', start: 84, end: 90,
      caption: 'The rest is the same picture: recognisability travels backwards, non-recognisability forwards, and the complement of A reduces to the complement of B by the same f.',
      detail: 'A recogniser for B becomes a recogniser for A, because accepting f of w is the same event as accepting w. So recognisability flows leftwards. Applying that to complements gives non-recognisability flowing rightwards. The complement statement needs no new function: the same f works, since the biconditional is symmetric in negation.',
      narration: 'The rest is the same picture. Recognisability travels backwards, non-recognisability forwards, and the complement of A reduces to the complement of B by the same f.',
      keyword: 'same f' },

    /* ---------------- scene 4: wrong ---------------- */
    { id: 'e16', scene: 'wrong', start: 90, end: 96,
      caption: 'Here is a claim worth testing with a computation: if L reduces to the acceptance problem, then L is undecidable.',
      detail: 'The claim is tempting because the acceptance problem is the standard first undecidable language, so it feels as though anything connected to it must share the disease. The way to test a universal-sounding claim is to look for the smallest counterexample, and the smallest language is the empty one.',
      narration: 'Here is a claim worth testing with a computation. If L reduces to the acceptance problem, then L is undecidable.',
      keyword: 'claim worth testing' },

    { id: 'e17', scene: 'wrong', start: 96, end: 102,
      caption: 'Take L to be the empty language. Send every string to one fixed instance, the machine that rejects at once paired with the string zero.',
      detail: 'A constant function is computable: ignore the input, print the constant. So there is a computable f from every string to that one instance. The instance is a machine R whose every transition goes to the rejecting state, paired with the string zero. R rejects zero, so the instance is not in the acceptance problem.',
      narration: 'Take L to be the empty language. Send every string to one fixed instance, the machine that rejects at once paired with the string zero.',
      keyword: 'constant function' },

    { id: 'e18', scene: 'wrong', start: 102, end: 108,
      caption: 'Computed on all fifteen strings of length at most three: no string is in the empty language, and no image is in the acceptance problem. The biconditional holds fifteen times out of fifteen.',
      detail: 'The page builds all fifteen strings over zero and one up to length three, maps each one through f, and runs both membership tests. Fifteen strings, zero disagreements. The reduction is therefore a genuine mapping reduction, checked rather than asserted.',
      narration: 'Computed on all fifteen strings of length at most three. No string is in the empty language, and no image is in the acceptance problem. The biconditional holds fifteen times out of fifteen.',
      keyword: 'fifteen times out of fifteen' },

    { id: 'e19', scene: 'wrong', start: 108, end: 114,
      caption: 'So the empty language reduces to the acceptance problem. And the empty language is decidable: one machine, reject everything, one step.',
      detail: 'The decider for the empty language ignores its input and rejects. That is a complete algorithm, so the empty language is decidable. We now have a decidable language on the left of an arrow whose right end is undecidable, which refutes the claim by counterexample.',
      narration: 'So the empty language reduces to the acceptance problem. And the empty language is decidable. One machine, reject everything, one step.',
      keyword: 'decidable' },

    { id: 'e20', scene: 'wrong', start: 114, end: 120,
      caption: 'The right end of the arrow can be as hard as you like. Difficulty travels only to the right, so the right end never constrains the left.',
      detail: 'This is the single most examined misconception in the topic, and it is not a technicality. Half the marks in a reduction question are for the direction. When a question says L reduces to the halting problem and asks what follows, the answer is nothing, and a counterexample settles it.',
      narration: 'The right end of the arrow can be as hard as you like. Difficulty travels only to the right, so the right end never constrains the left.',
      keyword: 'never constrains the left' },

    /* ---------------- scene 5: build ---------------- */
    { id: 'e21', scene: 'build', start: 120, end: 126,
      caption: 'Now the honest direction. To show the acceptance problem reduces to the halting problem, given M and w, build M-prime.',
      detail: 'The left problem is acceptance, which is known undecidable. Law two then gives that halting is undecidable. The instance being built is a pair: the new machine M-prime and the string w. Everything the reduction knows about M and w is frozen into the description of M-prime.',
      narration: 'Now the honest direction. To show the acceptance problem reduces to the halting problem, given M and w, build M-prime.',
      keyword: 'build M-prime' },

    { id: 'e22', scene: 'build', start: 126, end: 132,
      caption: 'M-prime ignores its own input. It runs M on w. If M accepts, M-prime accepts. If M rejects, M-prime loops forever.',
      detail: 'Ignoring the input is what makes the new machine a machine at all: it has a start state, it writes the frozen string w on a fresh tape, and it then simulates M. The simulation is a finite program because M is a finite object and w is a finite string.',
      narration: 'M-prime ignores its own input. It runs M on w. If M accepts, M-prime accepts. If M rejects, M-prime loops forever.',
      keyword: 'ignores its own input' },

    { id: 'e23', scene: 'build', start: 132, end: 138,
      caption: 'Then M-prime halts on w exactly when M accepts w. The if-and-only-if is built into the loop, not checked afterwards.',
      detail: 'If M accepts w, M-prime accepts and halts. If M does not accept w, either M rejects, and M-prime loops, or M never halts, and M-prime never gets past the simulation. In both cases M-prime does not halt. So halting matches accepting, in both directions.',
      narration: 'Then M-prime halts on w exactly when M accepts w. The if-and-only-if is built into the loop, not checked afterwards.',
      keyword: 'built into the loop' },

    { id: 'e24', scene: 'build', start: 138, end: 144,
      caption: 'The infinite loop is not a defect. It is the construction: it turns a rejection into a non-halting, which is the only difference the two problems have.',
      detail: 'Acceptance and halting differ on exactly one case: a machine that halts and rejects. Acceptance says no there, halting says yes. The wrapper removes that case by replacing rejection with looping, so the two questions coincide on the new instance. That is the entire idea of the reduction.',
      narration: 'The infinite loop is not a defect. It is the construction. It turns a rejection into a non-halting, which is the only difference the two problems have.',
      keyword: 'not a defect' },

    { id: 'e25', scene: 'build', start: 144, end: 150,
      caption: 'And the description of M-prime is produced by a fixed procedure from M and w, so the function f is computable and total.',
      detail: 'The procedure is: read the encoding of M and w, write the encoding of the three-part machine just described. It does not simulate anything unbounded, so it always terminates. Both obligations of the definition are met, and the reduction is complete.',
      narration: 'And the description of M-prime is produced by a fixed procedure from M and w, so the function f is computable and total.',
      keyword: 'computable and total' },

    /* ---------------- scene 6: run ---------------- */
    { id: 'e26', scene: 'run', start: 150, end: 156,
      caption: 'Seven instances, five machines, and the simulation really runs. Each row is one instance of the acceptance problem.',
      detail: 'The page carries a small tape machine simulator with a step cap of four hundred. Five machines are defined: one accepting strings that end in one, one counting zeros for even parity, one accepting all-ones strings, one rejecting everything, and one that loops forever.',
      narration: 'Seven instances, five machines, and the simulation really runs. Each row is one instance of the acceptance problem.',
      keyword: 'really runs' },

    { id: 'e27', scene: 'run', start: 156, end: 162,
      caption: 'The first machine accepts one, so its wrapper halts. It rejects zero, so its wrapper never halts.',
      detail: 'Two instances that differ only in the string, and they split in both problems: in the acceptance problem one is a yes and one is a no; in the halting problem, after the wrapper, one is a yes and one is a no. The reduction preserves the split.',
      narration: 'The first machine accepts one, so its wrapper halts. It rejects zero, so its wrapper never halts.',
      keyword: 'split' },

    { id: 'e28', scene: 'run', start: 162, end: 168,
      caption: 'The reject-everything machine rejects zero at once, so its wrapper loops. The looping machine never stops, so its wrapper never stops either.',
      detail: 'These two rows test the two ways of not accepting. Rejecting is a halting non-acceptance, and the wrapper converts it into divergence. Looping is already divergence, and the wrapper passes it through. Both are correctly reported as not halting.',
      narration: 'The reject-everything machine rejects zero at once, so its wrapper loops. The looping machine never stops, so its wrapper never stops either.',
      keyword: 'two ways of not accepting' },

    { id: 'e29', scene: 'run', start: 168, end: 174,
      caption: 'The correspondence holds on seven rows out of seven. Note the three rows that halt and do not accept: in the halting problem, not in the acceptance problem.',
      detail: 'Three rows halt and do not accept, and they are what makes the reduction worth writing. Each belongs to the halting problem and not to the acceptance problem, so the wrapper cannot be the identity: it must turn those three rejections into divergence. On the images the two problems coincide.',
      narration: 'The correspondence holds on seven rows out of seven. Note the three rows that halt and do not accept. In the halting problem, not in the acceptance problem.',
      keyword: 'seven rows out of seven' },

    { id: 'e30', scene: 'run', start: 174, end: 180,
      caption: 'A four hundred step cap can only say: no acceptance within four hundred steps. The seven instances are chosen so that this equals the truth.',
      detail: 'This is the honest limit of any simulation on a page. The general theorem is what makes the correspondence hold for all instances; the run demonstrates it on seven and claims no more. The looping machine is the one case where a cap cannot distinguish not-yet from never, and it is included deliberately, labelled as such.',
      narration: 'A four hundred step cap can only say, no acceptance within four hundred steps. The seven instances are chosen so that this equals the truth.',
      keyword: 'the honest limit' },

    /* ---------------- scene 7: equiv ---------------- */
    { id: 'e31', scene: 'equiv', start: 180, end: 186,
      caption: 'Reverse it. To reduce halting to acceptance, build M-double-prime, which runs M on w and accepts whatever happens, as long as it halts.',
      detail: 'The wrapper here accepts on both outcomes of the inner run. That is legal: a machine accepts if it reaches the accepting state, and it may reach it after simulating a rejection, because the simulation is just a computation. What matters is only whether the simulation finished.',
      narration: 'Reverse it. To reduce halting to acceptance, build M-double-prime, which runs M on w and accepts whatever happens, as long as it halts.',
      keyword: 'accepts whatever happens' },

    { id: 'e32', scene: 'equiv', start: 186, end: 192,
      caption: 'Then M-double-prime accepts w exactly when M halts on w. Computed on the same seven instances: seven out of seven again.',
      detail: 'The same seven instances are reused, so the two reductions are checked against identical evidence. Both correspondences hold on all seven. The reverse reduction is the easier one to state and the easier one to get wrong, because accepting a rejecting run feels illegal until you remember the inner machine is only being simulated.',
      narration: 'Then M-double-prime accepts w exactly when M halts on w. Computed on the same seven instances, seven out of seven again.',
      keyword: 'seven out of seven again' },

    { id: 'e33', scene: 'equiv', start: 192, end: 198,
      caption: 'Both arrows hold, so the two problems are equivalent under the order. Equally hard, in the only sense the order can express.',
      detail: 'Two languages with reductions in both directions are called equivalent, written with the three-bar symbol. Equivalence under this order does not mean the languages are equal, and it does not mean their complements behave alike. It means each is a decidable-or-not question exactly when the other is.',
      narration: 'Both arrows hold, so the two problems are equivalent under the order. Equally hard, in the only sense the order can express.',
      keyword: 'equivalent under the order' },

    { id: 'e34', scene: 'equiv', start: 198, end: 204,
      caption: 'The order is reflexive and transitive. The identity function proves reflexivity; composition of computable functions proves transitivity. Both checked on fifteen strings.',
      detail: 'Reflexivity: the identity is computable and preserves membership trivially. Transitivity: if f carries A into B and g carries B into C, then g after f carries A into C, and a composition of two computable functions is computable. Composition of two always-halting procedures always halts.',
      narration: 'The order is reflexive and transitive. The identity function proves reflexivity, and composition of computable functions proves transitivity. Both checked on fifteen strings.',
      keyword: 'reflexive and transitive' },

    { id: 'e35', scene: 'equiv', start: 204, end: 210,
      caption: 'Transitivity is what lets a proof chain. Any language reducing to acceptance also reduces to halting, in one composed step.',
      detail: 'This is how the standard library of undecidable problems is built: one reduction from the acceptance problem, then chains outwards. It is also why a question that gives you one reduction already done, and asks about a third problem, is a transitivity question in disguise.',
      narration: 'Transitivity is what lets a proof chain. Any language reducing to acceptance also reduces to halting, in one composed step.',
      keyword: 'chain' },

    /* ---------------- scene 8: rice ---------------- */
    { id: 'e36', scene: 'rice', start: 210, end: 216,
      caption: 'Two machines. Run both on all fifteen strings of length at most three. Each accepts exactly seven, and the seven are the same seven.',
      detail: 'The first machine accepts strings ending in one. The second is the same machine with three unreachable states added. On the sample both accept one, zero-one, one-one, zero-zero-one, zero-one-one, one-zero-one and one-one-one. Identical sets.',
      narration: 'Two machines. Run both on all fifteen strings of length at most three. Each accepts exactly seven, and the seven are the same seven.',
      keyword: 'the same seven' },

    { id: 'e37', scene: 'rice', start: 216, end: 222,
      caption: 'One machine has four states, the other seven. Three unreachable states were bolted on and the language did not move.',
      detail: 'The three added states are never entered from the start state, so no run ever visits them and no string changes its verdict. Padding a description is always legal and always invisible to the language. This is the cheapest possible demonstration that a description carries more information than its language.',
      narration: 'One machine has four states, the other seven. Three unreachable states were bolted on and the language did not move.',
      keyword: 'unreachable states' },

    { id: 'e38', scene: 'rice', start: 222, end: 228,
      caption: 'So the property has at most five states is true of one and false of the other, while their languages are the same on every string tested.',
      detail: 'That property is decided by counting the states in the encoding, which is a finite read. It is decidable, and it is not a property of the language at all. Any property that can split two machines with one language cannot be a property of the language.',
      narration: 'So the property has at most five states is true of one and false of the other, while their languages are the same on every string tested.',
      keyword: 'not a property of the language' },

    { id: 'e39', scene: 'rice', start: 228, end: 234,
      caption: 'Rice: every non-trivial property of the language of a machine is undecidable. A property of the language cannot be read off the description.',
      detail: 'The theorem is proved by a reduction from the acceptance problem, using one machine whose language has the property and one whose language does not, which is exactly what non-trivial supplies. The proof is uniform in the property, which is why one theorem settles an unlimited family of questions.',
      narration: 'Rice. Every non-trivial property of the language of a machine is undecidable. A property of the language cannot be read off the description.',
      keyword: 'non-trivial' },

    { id: 'e40', scene: 'rice', start: 234, end: 240,
      caption: 'Non-trivial means some language has it and some language does not. That is the theorem\'s only hypothesis, and the only thing to check.',
      detail: 'Two trivial properties exist: the property true of every recognisable language, and the property false of every one. Both are decidable, by the machine that always says yes and the machine that always says no. Every other property is non-trivial and undecidable.',
      narration: 'Non-trivial means some language has it and some language does not. That is the theorem\'s only hypothesis, and the only thing to check.',
      keyword: 'only hypothesis' },

    /* ---------------- scene 9: ricetrap ---------------- */
    { id: 'e41', scene: 'ricetrap', start: 240, end: 246,
      caption: 'Rice says nothing about syntactic properties. Has four states, has at least twenty-one transitions, reaches q in exactly one hundred steps: all decidable.',
      detail: 'Each of these is answered by reading the finite encoding and simulating a fixed number of steps. No search over inputs is involved. The mistake is to apply Rice to a property of the machine, when the theorem speaks only about properties of the language.',
      narration: 'Rice says nothing about syntactic properties. Has four states, has at least twenty-one transitions, reaches q in exactly one hundred steps, all decidable.',
      keyword: 'syntactic properties' },

    { id: 'e42', scene: 'ricetrap', start: 246, end: 252,
      caption: 'Nor about trivial ones. The language is recognisable is true of every machine; the language is not recognisable is true of none. Both decidable.',
      detail: 'The trivial properties are the two that need no inspection of the instance. Rice excludes them because its proof needs one machine on each side of the property, and a trivial property has no machine on one side. This is why the word non-trivial is in the statement and must be in your answer.',
      narration: 'Nor about trivial ones. The language is recognisable is true of every machine, and the language is not recognisable is true of none. Both decidable.',
      keyword: 'trivial' },

    { id: 'e43', scene: 'ricetrap', start: 252, end: 258,
      caption: 'Rice gives undecidability, never unrecognisability. The language is non-empty is undecidable and still recognisable: run the machine on every string in parallel.',
      detail: 'Dovetailing is the recogniser: enumerate all strings, run the machine on each for a growing number of steps, and accept as soon as any run accepts. Every yes is confirmed in finite time. Every no runs forever, which is allowed for a recogniser and not allowed for a decider.',
      narration: 'Rice gives undecidability, never unrecognisability. The language is non-empty is undecidable and still recognisable. Run the machine on every string in parallel.',
      keyword: 'never unrecognisability' },

    { id: 'e44', scene: 'ricetrap', start: 258, end: 264,
      caption: 'The language is empty is not even recognisable. Undecidable and unrecognisable are two verdicts, and a question can ask for either.',
      detail: 'If the empty language property had a recogniser, then together with the recogniser for its complement you would have a decider, by running both and taking whichever answers first. Since it is undecidable, one of the two is missing, and it is this one: no finite run can certify emptiness.',
      narration: 'The language is empty is not even recognisable. Undecidable and unrecognisable are two verdicts, and a question can ask for either.',
      keyword: 'two verdicts' },

    { id: 'e45', scene: 'ricetrap', start: 264, end: 270,
      caption: 'Two blank-tape questions, different answers: halts on the empty string is undecidable; has at least two thousand and sixteen states is decidable.',
      detail: 'The first is the halting problem with the string fixed, and fixing the string does not help. The second is a count in the encoding. GATE has asked exactly this pair, with the count of states and the count of transitions, and the answer was both counting questions decidable.',
      narration: 'Two blank-tape questions, different answers. Halts on the empty string is undecidable. Has at least two thousand and sixteen states is decidable.',
      keyword: 'different answers' },

    /* ---------------- scene 10: table ---------------- */
    { id: 'e46', scene: 'table', start: 270, end: 276,
      caption: 'Four exam shapes: decide a property of a language, construct a reduction, spot a wrong direction, and sort several languages into decidable and not.',
      detail: 'Nearly every question in this topic is one of those four. Naming the shape first tells you which tool applies, and the tool is usually Rice for the first and third, a constructed function for the second, and a mixture for the fourth.',
      narration: 'Four exam shapes. Decide a property of a language, construct a reduction, spot a wrong direction, and sort several languages into decidable and not.',
      keyword: 'four exam shapes' },

    { id: 'e47', scene: 'table', start: 276, end: 282,
      caption: 'Shape one, a property of the language: Rice, unless the property is trivial or syntactic. Check those two exclusions before anything else.',
      detail: 'The order of the check matters and saves time. First, is the property about the language or about the description. Second, is it true of all languages or of none. Only if the answer is language and non-trivial does Rice apply, and then the answer is undecidable in one line.',
      narration: 'Shape one, a property of the language. Rice, unless the property is trivial or syntactic. Check those two exclusions before anything else.',
      keyword: 'check those two exclusions' },

    { id: 'e48', scene: 'table', start: 282, end: 288,
      caption: 'Shape two, comparing two machines: equality of their languages is a semantic property of the pair, non-trivial, so undecidable.',
      detail: 'Equality is true of some pairs, for example a machine and itself, and false of others, so it is non-trivial. It is a property of the two languages, not of the two descriptions. Rice applies to the natural generalisation, and the direct reduction from the acceptance problem also works.',
      narration: 'Shape two, comparing two machines. Equality of their languages is a semantic property of the pair, non-trivial, so undecidable.',
      keyword: 'equality of their languages' },

    { id: 'e49', scene: 'table', start: 288, end: 294,
      caption: 'Shape three, the exception that looks semantic: takes more than one thousand and seventy-three steps on every string is decidable, because in that many steps the head sees only that many symbols.',
      detail: 'Simulate on every string up to length one thousand and seventy-three for that many steps. A longer string cannot behave differently in that budget, because the head has not travelled far enough to see the difference. This is the option that was not undecidable in the 2022 question, and the reason is a bound, not a theorem.',
      narration: 'Shape three, the exception that looks semantic. Takes more than one thousand and seventy-three steps on every string is decidable, because in that many steps the head sees only that many symbols.',
      keyword: 'the exception' },

    { id: 'e50', scene: 'table', start: 294, end: 300,
      caption: 'The line to carry: the direction of the arrow is the argument. Everything else on the page is decoration around that one arrow.',
      detail: 'Every reduction proof has the same skeleton. Name the problem you are reducing from, name the problem you are reducing to, build the computable function, and check the biconditional. The direction is decided before the function is written, and getting it wrong is the failure that costs marks.',
      narration: 'The line to carry. The direction of the arrow is the argument. Everything else on the page is decoration around that one arrow.',
      keyword: 'the direction of the arrow' }
  ]
};
