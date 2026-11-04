# Mapping Reductions and Rice's Theorem: Which Way the Arrow Points, and Where the Theorem Stops — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/mapping-reductions-and-rices-theorem/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two problems, one arrow

*0:00 – 0:30 · objective: See a reduction as a translation from one problem to another, and see that the arrow points from the problem being given up on to the problem being assumed solved.*

**0:00–0:06** — A reduction is a translation, not a comparison. You rewrite one question as another question.

> Caption: A reduction is a translation, not a comparison. You rewrite one question as another question.

**0:06–0:12** — Two questions to keep apart. The acceptance problem asks whether M accepts w. The halting problem asks whether M stops on w at all.

> Caption: Two questions to keep apart. The acceptance problem: does M accept the string w? The halting problem: does M stop on w at all?

**0:12–0:18** — Nobody compares the two problems directly. One instance of the first is turned into one instance of the second.

> Caption: Nobody compares the two problems directly. One instance of the first is turned into one instance of the second.

**0:18–0:24** — A machine and a string become a different machine and a string. The string may be copied; the machine is rebuilt.

> Caption: A machine and a string become a different machine and a string. The string may be copied; the machine is rebuilt.

**0:24–0:30** — The arrow points from the problem you give up on to the problem you assume solved. Read it as, no harder than.

> Caption: The arrow points from the problem you give up on to the problem you assume solved. Read it as: no harder than.

## Scene 2. The definition, and its two obligations

*0:30 – 1:00 · objective: State mapping reducibility with a computable total function and an if-and-only-if, and see why each half is load-bearing.*

**0:30–0:36** — First obligation. The function must be computable, which means one Turing machine that halts on every input and leaves the answer on the tape.

> Caption: First obligation: the function must be computable, which means one Turing machine that halts on every input and leaves the answer on the tape.

**0:36–0:42** — Then A is mapping reducible to B when there is such a function with, w is in A exactly when f of w is in B.

> Caption: Then A is mapping reducible to B when there is such a function with: w is in A exactly when f of w is in B.

**0:42–0:48** — Exactly when is two directions. Yes stays yes and no stays no. A one-way implication is not a reduction.

> Caption: Exactly when is two directions. Yes stays yes and no stays no. A one-way implication is not a reduction.

**0:48–0:54** — Both directions together are one sentence. A is the preimage of B under f. Nothing about the sizes of the two sets is claimed.

> Caption: Both directions together are one sentence: A is the preimage of B under f. Nothing about the sizes of the two sets is claimed.

**0:54–1:00** — Why totality matters. To decide A you run f and then the decider for B. If f might not stop, the procedure is not a decider.

> Caption: Why totality matters: to decide A you run f and then the decider for B. If f might not stop, the procedure is not a decider.

## Scene 3. Two laws, and the direction they travel

*1:00 – 1:30 · objective: Derive the two propagation laws from one procedure, and see that they have the same hypothesis and opposite conclusions.*

**1:00–1:06** — Law one, good news travels backwards. If A reduces to B and B is decidable, then A is decidable.

> Caption: Law one, good news travels backwards. If A reduces to B and B is decidable, then A is decidable.

**1:06–1:12** — Law two, bad news travels forwards. If A reduces to B and A is undecidable, then B is undecidable.

> Caption: Law two, bad news travels forwards. If A reduces to B and A is undecidable, then B is undecidable.

**1:12–1:18** — Same hypothesis, opposite conclusions. Decidability is inherited by the left end. Undecidability is inherited by the right end.

> Caption: Same hypothesis, opposite conclusions. Decidability is inherited by the left end. Undecidability is inherited by the right end.

**1:18–1:24** — So the trap. From A reduces to B, and B undecidable, nothing follows about A. The arrow tells you about the left end, not the right.

> Caption: So the trap: from A reduces to B, and B undecidable, nothing follows about A. The arrow tells you about the left end, not the right.

**1:24–1:30** — The rest is the same picture. Recognisability travels backwards, non-recognisability forwards, and the complement of A reduces to the complement of B by the same f.

> Caption: The rest is the same picture: recognisability travels backwards, non-recognisability forwards, and the complement of A reduces to the complement of B by the same f.

## Scene 4. The wrong direction, run on fifteen strings

*1:30 – 2:00 · objective: Kill the belief that L reduces to a hard problem therefore L is hard, by exhibiting the empty language reducing to the acceptance problem.*

**1:30–1:36** — Here is a claim worth testing with a computation. If L reduces to the acceptance problem, then L is undecidable.

> Caption: Here is a claim worth testing with a computation: if L reduces to the acceptance problem, then L is undecidable.

**1:36–1:42** — Take L to be the empty language. Send every string to one fixed instance, the machine that rejects at once paired with the string zero.

> Caption: Take L to be the empty language. Send every string to one fixed instance, the machine that rejects at once paired with the string zero.

**1:42–1:48** — Computed on all fifteen strings of length at most three. No string is in the empty language, and no image is in the acceptance problem. The biconditional holds fifteen times out of fifteen.

> Caption: Computed on all fifteen strings of length at most three: no string is in the empty language, and no image is in the acceptance problem. The biconditional holds fifteen times out of fifteen.

**1:48–1:54** — So the empty language reduces to the acceptance problem. And the empty language is decidable. One machine, reject everything, one step.

> Caption: So the empty language reduces to the acceptance problem. And the empty language is decidable: one machine, reject everything, one step.

**1:54–2:00** — The right end of the arrow can be as hard as you like. Difficulty travels only to the right, so the right end never constrains the left.

> Caption: The right end of the arrow can be as hard as you like. Difficulty travels only to the right, so the right end never constrains the left.

## Scene 5. Building the wrapper machine

*2:00 – 2:30 · objective: Construct the reduction from the acceptance problem to the halting problem and see that the deliberate infinite loop is what turns a rejection into a non-halting.*

**2:00–2:06** — Now the honest direction. To show the acceptance problem reduces to the halting problem, given M and w, build M-prime.

> Caption: Now the honest direction. To show the acceptance problem reduces to the halting problem, given M and w, build M-prime.

**2:06–2:12** — M-prime ignores its own input. It runs M on w. If M accepts, M-prime accepts. If M rejects, M-prime loops forever.

> Caption: M-prime ignores its own input. It runs M on w. If M accepts, M-prime accepts. If M rejects, M-prime loops forever.

**2:12–2:18** — Then M-prime halts on w exactly when M accepts w. The if-and-only-if is built into the loop, not checked afterwards.

> Caption: Then M-prime halts on w exactly when M accepts w. The if-and-only-if is built into the loop, not checked afterwards.

**2:18–2:24** — The infinite loop is not a defect. It is the construction. It turns a rejection into a non-halting, which is the only difference the two problems have.

> Caption: The infinite loop is not a defect. It is the construction: it turns a rejection into a non-halting, which is the only difference the two problems have.

**2:24–2:30** — And the description of M-prime is produced by a fixed procedure from M and w, so the function f is computable and total.

> Caption: And the description of M-prime is produced by a fixed procedure from M and w, so the function f is computable and total.

## Scene 6. The wrapper, run on seven instances

*2:30 – 3:00 · objective: Watch the constructed machine actually run on seven instances and check the answer correspondence instance by instance.*

**2:30–2:36** — Seven instances, five machines, and the simulation really runs. Each row is one instance of the acceptance problem.

> Caption: Seven instances, five machines, and the simulation really runs. Each row is one instance of the acceptance problem.

**2:36–2:42** — The first machine accepts one, so its wrapper halts. It rejects zero, so its wrapper never halts.

> Caption: The first machine accepts one, so its wrapper halts. It rejects zero, so its wrapper never halts.

**2:42–2:48** — The reject-everything machine rejects zero at once, so its wrapper loops. The looping machine never stops, so its wrapper never stops either.

> Caption: The reject-everything machine rejects zero at once, so its wrapper loops. The looping machine never stops, so its wrapper never stops either.

**2:48–2:54** — The correspondence holds on seven rows out of seven. Note the three rows that halt and do not accept. In the halting problem, not in the acceptance problem.

> Caption: The correspondence holds on seven rows out of seven. Note the three rows that halt and do not accept: in the halting problem, not in the acceptance problem.

**2:54–3:00** — A four hundred step cap can only say, no acceptance within four hundred steps. The seven instances are chosen so that this equals the truth.

> Caption: A four hundred step cap can only say: no acceptance within four hundred steps. The seven instances are chosen so that this equals the truth.

## Scene 7. Both directions, so the same difficulty

*3:00 – 3:30 · objective: Build the reverse reduction, conclude the two problems are equivalent under the order, and check reflexivity and transitivity on the same sample.*

**3:00–3:06** — Reverse it. To reduce halting to acceptance, build M-double-prime, which runs M on w and accepts whatever happens, as long as it halts.

> Caption: Reverse it. To reduce halting to acceptance, build M-double-prime, which runs M on w and accepts whatever happens, as long as it halts.

**3:06–3:12** — Then M-double-prime accepts w exactly when M halts on w. Computed on the same seven instances, seven out of seven again.

> Caption: Then M-double-prime accepts w exactly when M halts on w. Computed on the same seven instances: seven out of seven again.

**3:12–3:18** — Both arrows hold, so the two problems are equivalent under the order. Equally hard, in the only sense the order can express.

> Caption: Both arrows hold, so the two problems are equivalent under the order. Equally hard, in the only sense the order can express.

**3:18–3:24** — The order is reflexive and transitive. The identity function proves reflexivity, and composition of computable functions proves transitivity. Both checked on fifteen strings.

> Caption: The order is reflexive and transitive. The identity function proves reflexivity; composition of computable functions proves transitivity. Both checked on fifteen strings.

**3:24–3:30** — Transitivity is what lets a proof chain. Any language reducing to acceptance also reduces to halting, in one composed step.

> Caption: Transitivity is what lets a proof chain. Any language reducing to acceptance also reduces to halting, in one composed step.

## Scene 8. Rice: two machines, one language

*3:30 – 4:00 · objective: See a syntactic property split two machines that share one language, which is why no semantic property can be decided from a description.*

**3:30–3:36** — Two machines. Run both on all fifteen strings of length at most three. Each accepts exactly seven, and the seven are the same seven.

> Caption: Two machines. Run both on all fifteen strings of length at most three. Each accepts exactly seven, and the seven are the same seven.

**3:36–3:42** — One machine has four states, the other seven. Three unreachable states were bolted on and the language did not move.

> Caption: One machine has four states, the other seven. Three unreachable states were bolted on and the language did not move.

**3:42–3:48** — So the property has at most five states is true of one and false of the other, while their languages are the same on every string tested.

> Caption: So the property has at most five states is true of one and false of the other, while their languages are the same on every string tested.

**3:48–3:54** — Rice. Every non-trivial property of the language of a machine is undecidable. A property of the language cannot be read off the description.

> Caption: Rice: every non-trivial property of the language of a machine is undecidable. A property of the language cannot be read off the description.

**3:54–4:00** — Non-trivial means some language has it and some language does not. That is the theorem's only hypothesis, and the only thing to check.

> Caption: Non-trivial means some language has it and some language does not. That is the theorem's only hypothesis, and the only thing to check.

## Scene 9. Where Rice stops

*4:00 – 4:30 · objective: Sort properties into semantic and syntactic, trivial and non-trivial, and separate undecidable from unrecognisable.*

**4:00–4:06** — Rice says nothing about syntactic properties. Has four states, has at least twenty-one transitions, reaches q in exactly one hundred steps, all decidable.

> Caption: Rice says nothing about syntactic properties. Has four states, has at least twenty-one transitions, reaches q in exactly one hundred steps: all decidable.

**4:06–4:12** — Nor about trivial ones. The language is recognisable is true of every machine, and the language is not recognisable is true of none. Both decidable.

> Caption: Nor about trivial ones. The language is recognisable is true of every machine; the language is not recognisable is true of none. Both decidable.

**4:12–4:18** — Rice gives undecidability, never unrecognisability. The language is non-empty is undecidable and still recognisable. Run the machine on every string in parallel.

> Caption: Rice gives undecidability, never unrecognisability. The language is non-empty is undecidable and still recognisable: run the machine on every string in parallel.

**4:18–4:24** — The language is empty is not even recognisable. Undecidable and unrecognisable are two verdicts, and a question can ask for either.

> Caption: The language is empty is not even recognisable. Undecidable and unrecognisable are two verdicts, and a question can ask for either.

**4:24–4:30** — Two blank-tape questions, different answers. Halts on the empty string is undecidable. Has at least two thousand and sixteen states is decidable.

> Caption: Two blank-tape questions, different answers: halts on the empty string is undecidable; has at least two thousand and sixteen states is decidable.

## Scene 10. Which tool for which question

*4:30 – 5:00 · objective: Match the four exam shapes to the tool that settles each, and read the two previous-year questions through that table.*

**4:30–4:36** — Four exam shapes. Decide a property of a language, construct a reduction, spot a wrong direction, and sort several languages into decidable and not.

> Caption: Four exam shapes: decide a property of a language, construct a reduction, spot a wrong direction, and sort several languages into decidable and not.

**4:36–4:42** — Shape one, a property of the language. Rice, unless the property is trivial or syntactic. Check those two exclusions before anything else.

> Caption: Shape one, a property of the language: Rice, unless the property is trivial or syntactic. Check those two exclusions before anything else.

**4:42–4:48** — Shape two, comparing two machines. Equality of their languages is a semantic property of the pair, non-trivial, so undecidable.

> Caption: Shape two, comparing two machines: equality of their languages is a semantic property of the pair, non-trivial, so undecidable.

**4:48–4:54** — Shape three, the exception that looks semantic. Takes more than one thousand and seventy-three steps on every string is decidable, because in that many steps the head sees only that many symbols.

> Caption: Shape three, the exception that looks semantic: takes more than one thousand and seventy-three steps on every string is decidable, because in that many steps the head sees only that many symbols.

**4:54–5:00** — The line to carry. The direction of the arrow is the argument. Everything else on the page is decoration around that one arrow.

> Caption: The line to carry: the direction of the arrow is the argument. Everything else on the page is decoration around that one arrow.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
