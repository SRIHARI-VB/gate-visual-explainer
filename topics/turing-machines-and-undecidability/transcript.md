# Turing Machines And Undecidability — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/turing-machines-and-undecidability/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A Turing machine: one tape, one head, one move

*0:00 – 0:30 · objective: Read the seven parts of a Turing machine, follow one move, and see that a configuration is the whole of the machine state that decides the future.*

**0:00–0:07** — A Turing machine has seven parts. A finite set of states. A tape alphabet, which always contains a blank symbol. An input alphabet, which is the part of the tape alphabet the input may use. A transition function. A start state. And a set of accepting states.

> Caption: A Turing machine has seven parts: states, tape alphabet, blank symbol, input alphabet, transition function, start state, accepting states.

Exam-trap caption mode adds: *The tape alphabet and the input alphabet are not the same set. A machine that writes a marker symbol uses a tape symbol that no input may contain, which is why Sigma is a proper subset of Gamma in almost every exam question.*

**0:07–0:15** — One move is four things at once. Read the symbol under the head. Write a new symbol there. Step the head one cell left or right. And change state. Here the machine is in state q1 reading a 1, so it writes Y, steps left, and enters q2.

> Caption: One move is four things at once: read the symbol under the head, write a new one, step left or right, change state.

Exam-trap caption mode adds: *A move writes before it moves, so the symbol that was read is destroyed. The machine must remember it in its state, which is why these machines carry states such as "I have seen the first 1".*

**0:15–0:22** — A configuration is everything that decides the future: the state, the whole tape, and where the head is. On the input 0011 the machine runs for thirteen moves, marking a 0 as X, finding the matching 1, marking it Y, and walking back. Then it accepts.

> Caption: A configuration is the state, the tape and the head position. The table plus the configuration fixes every later step.

Exam-trap caption mode adds: *The tape is not part of the configuration in the sense of the input. It is the current tape, which the run has already changed. Quoting the original input as the tape at step seven is a common slip in trace questions.*

**0:22–0:30** — The tape is unbounded. That is the whole difference from a finite automaton: the machine can write, come back and read again, so it has memory that grows with the problem. That is why this machine, and not the finite one, is the model of what a program can do.

> Caption: The tape is unbounded, so the machine has unlimited memory. That single change from a finite automaton is what makes it a computer.

Exam-trap caption mode adds: *Unbounded is not infinite in time. The tape has finitely many non-blank cells at every step; only the supply of blank cells is unlimited. A run may still never end.*

## Scene 2. Three fates: accept, reject, loop

*0:30 – 1:00 · objective: Separate halting from looping, and separate a decider from a recogniser, because every undecidability result in this lesson is about the difference.*

**0:30–0:37** — Every run ends in one of three ways. It accepts. It rejects. Or it never halts. The third is not a bug. A machine is allowed to run for ever, and no rule of the model forbids it.

> Caption: Every run ends in one of three ways: accept, reject, or never halt. The third is not a failure of the machine; it is a legal outcome.

Exam-trap caption mode adds: *A machine that runs out of moves is not "looping". In these tables a missing transition means the machine halts and rejects, which is a different thing from a run that keeps going. Read the table, not the outcome.*

**0:37–0:45** — A decider halts on every input. A recogniser only has to halt on the strings it accepts. On a non-member it may run for ever, and then the answer never comes. So every decidable language is recognisable, and not the other way round.

> Caption: A decider halts on every input. A recogniser only has to halt on the strings it accepts.

Exam-trap caption mode adds: *Saying "the machine decides L" when it only recognises L is the single most expensive slip in this topic. Decides means halts on all inputs with the right answer, both yes and no.*

**0:45–0:52** — GATE asked this in 2026, in Set 2, question thirteen. What does it mean to say a machine decides a language? It means it accepts every string in the language and rejects every string outside it. Not "accepts the members". Rejects the others as well.

> Caption: GATE CSE 2026 Set 2 Q13 asks what "M decides L" means: accept every string in L and reject every string outside it.

Exam-trap caption mode adds: *The wrong options in that question all describe recognition rather than decision: "M accepts all strings of L" is true of a recogniser too, so it cannot be equivalent to deciding.*

**0:52–1:00** — Two machines can accept exactly the same language and differ only in whether they halt on the strings they reject. That difference is the whole of this subject. The languages a machine can decide form a proper part of the languages a machine can recognise, and the next scenes find the gap.

> Caption: Two machines can accept the same language and differ only in whether they halt. That difference is the whole subject.

Exam-trap caption mode adds: *The gap is not empty and it is not everything. Some languages are recognisable but not decidable, and some are not even recognisable. Keeping those two failures apart is what the ladder table is for.*

## Scene 3. Count the machines, then count the languages

*1:00 – 1:30 · objective: See that strings and machine descriptions are countable while languages are not, and read the diagonal argument as the flip of a table.*

**1:00–1:07** — List every string in shortlex order. The empty string first, then the two strings of length one, then the four of length two, and so on. Every string is finite, so every string gets a finite index. That is what countable means, and it is why we can talk about the i-th string.

> Caption: List every string in shortlex order: the empty string, then 0 and 1, then 00, 01, 10, 11, and so on. Every string gets a finite index.

Exam-trap caption mode adds: *Countable does not mean finite. The list never ends; what matters is that each member has a finite position. A set is uncountable when no such list can exist.*

**1:07–1:15** — A machine description is a string too. Write down its table and you have a finite word. So the machines can be listed in the same order as the strings: M zero, M one, M two. There are countably many machines, and each one can be handed to another machine as input.

> Caption: A machine description is a string, so machines can be listed the same way: M0, M1, M2, and so on. There are countably many machines.

Exam-trap caption mode adds: *The encoding must be fixed and decodable, otherwise "the i-th machine" means nothing. Every result in this lesson assumes one agreed encoding, and the choice of encoding never changes an answer.*

**1:15–1:22** — A language is a set of strings, so it is a subset of that list. The number of subsets of a countable list is uncountable. Over the thirty one strings of length at most four there are already two to the thirty one languages, more than two thousand million, and only thirty one descriptions of length at most four.

> Caption: A language is a set of strings, so there are as many languages as subsets of the list. That is 2 to the countably many, which is uncountable.

Exam-trap caption mode adds: *A common wrong answer says the languages are countable because each language is a set of countable things. Counting the elements of a set and counting its subsets are different operations; the second is always strictly larger.*

**1:22–1:30** — Now the table. Row i is the language of machine i. Column i is the i-th string. Flip every cell on the diagonal, and the language you get differs from machine i at exactly the i-th string. So it is the language of no machine in the list, and since the list was arbitrary, some language has no machine at all.

> Caption: Flip every diagonal cell of the table and you have a language that differs from every listed machine at its own string. Some languages have no machine.

Exam-trap caption mode adds: *This proves that a language with no machine exists. It does not name one. Naming one is a different and harder job, and it is what the halting problem does.*

## Scene 4. The halting problem cannot be decided

*1:30 – 2:00 · objective: Follow the diagonal construction: assume a decider, build a machine that contradicts it on its own description, and check that both possible answers fail.*

**1:30–1:37** — The halting problem asks one question: given a machine and an input, does the run end? Write H for the set of pairs where the answer is yes. H is a well defined set. The question is whether any machine can decide membership in it.

> Caption: The halting problem asks: given a machine and an input, does the run end? The set of yes instances is written H.

Exam-trap caption mode adds: *H is not about accepting. A machine that halts and rejects is in H. Halting means the run stops, whatever it stops with.*

**1:37–1:45** — Suppose a decider D exists. It always halts, and it prints halt or loop. Now build a machine N. N takes a description, asks D whether that machine halts on its own description, and then does the opposite of the answer. N is legal, because all it does is run D.

> Caption: Suppose a decider D exists: it always halts and says halt or loop. Build N, which asks D about a machine applied to itself and then does the opposite.

Exam-trap caption mode adds: *N is not a paradox and not a trick. It is an ordinary machine with a description like any other, which is exactly why it can be handed to itself.*

**1:45–1:52** — Now run N on its own description. If D says N halts, then N loops, so D was wrong. If D says N loops, then N halts, so D was wrong again. There is no third answer, so no such decider can be right on every input.

> Caption: Run N on its own description. If D says halt, N loops. If D says loop, N halts. Both answers are wrong.

Exam-trap caption mode adds: *The contradiction is not "D cannot be built". It is "D, if it existed, would be wrong on this one input". A decider that is wrong somewhere is not a decider.*

**1:52–2:00** — So H cannot be decided. But it is still recognisable: run the machine, and if it halts, say yes. That answer is always correct, because a halting run is finite. What no machine can do is say no, since waiting longer never proves that a run is infinite. H is recognisable and not decidable.

> Caption: So H is undecidable. It is still recognisable: run the machine and answer yes when it halts. Only the no answer is missing.

Exam-trap caption mode adds: *Undecidable does not mean unrecognisable. The halting language is the standard example of a language that is recognisable and undecidable; its complement is the standard example of one that is not recognisable at all.*

## Scene 5. Reduction: carry undecidability backwards

*2:00 – 2:30 · objective: Use many-one reduction in the correct direction, and build the wrapper that turns a halting question into a question about the language of a machine.*

**2:00–2:07** — A reduces to B when a computable function turns every instance of A into an instance of B with the same answer. If you can decide B, and you can rewrite A into B, then you can decide A. That is the whole idea, and the direction is what people get wrong.

> Caption: A reduces to B when a computable function turns every instance of A into an instance of B with the same answer.

Exam-trap caption mode adds: *The function must be computable. A reduction that needs an undecidable step proves nothing, and exam questions occasionally hide one in an option.*

**2:07–2:15** — Three implications hold. If B is decidable, A is decidable. If A is undecidable, B is undecidable. If B is recognisable, A is recognisable. Two do not hold: knowing A is easy says nothing about B, and knowing B is hard says nothing about A.

> Caption: Three implications hold and two do not. Easiness travels along the arrow; hardness travels against it.

Exam-trap caption mode adds: *GATE CSE 2014 Set 2 Q16 asks which implication about many-one reducibility is false, and the false one is always a reversed direction of this table.*

**2:15–2:22** — Here is the gadget that does the work. A wrapper machine W ignores its own input completely, runs M on w, and accepts when that run halts. So if M halts on w, W accepts everything. If M never halts on w, W accepts nothing. Deciding emptiness of W would decide halting.

> Caption: The wrapper W ignores its input, runs M on w, and accepts when M halts. So the language of W is everything or nothing.

Exam-trap caption mode adds: *The wrapper accepts on halting, not on accepting. It does not matter whether M accepts or rejects w; both mean the run ended, and both make W accept every string.*

**2:22–2:30** — So emptiness of the language of a machine is undecidable. The page builds the wrapper for six machine and input pairs and checks both lines on each one. The same wrapper works for universality, for regularity, and for almost every property of the language, which is the next scene.

> Caption: That proves emptiness of a Turing machine language is undecidable. Six machine and input pairs on this page are checked against it.

Exam-trap caption mode adds: *This says nothing about emptiness of a context-free grammar, which is decidable. The wrapper needs a machine whose run can be infinite, and a grammar is not a machine with a run.*

## Scene 6. Rice’s theorem and its boundary

*2:30 – 3:00 · objective: State Rice’s theorem, test non-triviality with two witnesses, and see exactly which properties escape it: the ones bounded by a number of steps.*

**2:30–2:37** — Rice’s theorem says one thing. Take any property of the language of a machine. If the property is not trivial, meaning some languages have it and some do not, then no machine can decide whether a given machine’s language has it.

> Caption: Rice’s theorem: every non-trivial property of the language of a machine is undecidable. The property must be about the language.

Exam-trap caption mode adds: *Trivial means true for every language or false for every language. "The language is recursively enumerable" is trivial, and decidable: the answer is always yes.*

**2:37–2:45** — Emptiness. Universality. Finiteness. Regularity. Having at least twenty one strings. Every one of these is a property of the language, and every one splits the same pair of machines: the one that rejects everything and the one that accepts everything. So every one is undecidable.

> Caption: Emptiness, universality, finiteness, regularity and "at least 21 strings" are all semantic and all non-trivial, so all are undecidable.

Exam-trap caption mode adds: *"At least 21 strings" feels finite and therefore checkable. It is not: the twenty first string may take arbitrarily long to appear, and may never appear.*

**2:45–2:52** — Now the boundary. A property of the run is not a property of the language, so Rice says nothing about it. And if the property mentions a number of steps, it is a finite question: in k steps the head reads at most k cells, so only finitely many inputs can matter.

> Caption: But a property of the run is not a property of the language, so Rice says nothing about it. A bound of k steps is a finite table.

Exam-trap caption mode adds: *The bound must be fixed in the question. "Takes more than 2016 steps" has a fixed bound and is decidable; "takes more than finitely many steps", meaning never halts, is the halting problem again.*

**2:52–3:00** — Four papers turn on exactly this line. The decidable option is the one with a number of steps in it. The undecidable options are the ones about the language. The page tests the six-step procedure against a search over longer inputs, and the two agree on every machine it runs.

> Caption: Four papers turn on this one line: 2020 Q26, 2021 Set 1 Q39, 2016 Set 2 Q44 and 2022 Q46.

Exam-trap caption mode adds: *A bound on the length of the input is not the same as a bound on steps, and neither is a bound on the size of the language. Check what the number in the question actually counts.*

## Scene 7. The decidability ladder

*3:00 – 3:30 · objective: Read the five decision problems off one table for regular, context-free, recursive, recursively enumerable and non-RE languages.*

**3:00–3:07** — Five classes down the side: regular, context-free, recursive, recursively enumerable, and languages beyond even that. Five questions across: membership, emptiness, universality, equivalence, and finiteness. Each cell is decidable, undecidable, or not even recognisable.

> Caption: Five classes down the side, five decision problems across: membership, emptiness, universality, equivalence, finiteness.

Exam-trap caption mode adds: *The rows are classes of language, not models of machine. A language can be recursive and have a machine that is not a decider; the class is a property of the language, not of the machine you happen to hold.*

**3:07–3:15** — For regular languages all five questions are decidable. For recursive languages all five are decidable too, by running the decider. For an arbitrary machine, every one of the five turns into the halting problem.

> Caption: Regular and recursive languages answer every one of the five. Recursively enumerable languages answer none of them.

Exam-trap caption mode adds: *Membership for an arbitrary machine is undecidable even though membership for a regular or context-free language is easy. The class of the language decides the cell, not the intuition that "membership is always easy".*

**3:15–3:22** — The context-free row is the one to memorise. Membership, emptiness and finiteness are decidable. Universality and equivalence are not. GATE asked exactly this in 2025, Set 2, question twenty five, and the decidable option was emptiness.

> Caption: The context-free row is the one worth memorising: membership, emptiness and finiteness decidable; universality and equivalence not.

Exam-trap caption mode adds: *Do not carry the CFL row over to deterministic context-free languages without checking: the deterministic class is closed under complement, and that changes some cells.*

**3:22–3:30** — Every undecidable cell in that table is a theorem, not a computation. No program can check it by trying cases. So the page checks only what can be checked: the marking algorithm that decides emptiness of a grammar, and the wrapper that proves emptiness of a machine language undecidable.

> Caption: Every undecidable cell is a theorem, not a computation. The page checks only the two cells it can: grammar emptiness and machine emptiness.

Exam-trap caption mode adds: *A page that claims to have "verified" an undecidability result by simulation has verified nothing. What can be simulated is the decidable side, or a finite instance of the diagonal argument.*

## Scene 8. Closure and Post’s theorem

*3:30 – 4:00 · objective: Name what each class is closed under, see why complement is the single asymmetry, and use dovetailing to prove that RE plus co-RE gives a decider.*

**3:30–3:37** — Recursive languages are closed under everything in this table. Union, intersection, complement, concatenation, star. Complement is the easy one: swap the accepting and rejecting states, and the same machine decides the complement.

> Caption: Recursive languages are closed under union, intersection, complement, concatenation and star. Every row says closed.

Exam-trap caption mode adds: *Closure under complement needs a decider, not a recogniser. Swapping the states of a recogniser produces a machine that still may not halt, so it proves nothing.*

**3:37–3:45** — Recursively enumerable languages are closed under four of the five. Union, intersection, concatenation, star. Complement is the exception, and it is the only one. Everything else here can be done by running the machines you already have.

> Caption: Recursively enumerable languages are closed under four of the five. Complement is the exception, and it is the only one.

Exam-trap caption mode adds: *Closed under intersection but not complement looks inconsistent, since De Morgan would give one from the other. The escape is that RE is not closed under complement, so De Morgan cannot be applied inside the class.*

**3:45–3:52** — Post’s theorem. If a language is recognisable and its complement is recognisable too, then the language is decidable. Run both machines in parallel, a step at a time, and stop when either says yes. One of them must, so the answer always comes.

> Caption: Post’s theorem: if a language and its complement are both recognisable, the language is decidable.

Exam-trap caption mode adds: *Running them one after the other does not work: the first may run for ever. The parallelism is the proof, not a detail of implementation.*

**3:52–4:00** — The page builds two recognisers: one accepts the balanced strings and loops on the rest, the other accepts the rest and loops on the balanced ones. Neither decides anything alone. Run them in parallel and the result decides, and the page checks every string of length at most four.

> Caption: The page dovetails two recognisers and decides all 31 strings of length at most 4, in at most 14 rounds.

Exam-trap caption mode adds: *Dovetailing does not bound the time. It proves the answer arrives, not that it arrives quickly, and no bound on the number of rounds exists in general.*

## Scene 9. Four shapes the paper keeps using

*4:00 – 4:30 · objective: Recognise the question shapes from 2014 to 2026 and solve one instance of each from its own numbers.*

**4:00–4:07** — GATE 2020, question twenty six. Four languages, and the answer is that three are undecidable. Emptiness, not recursive, and at least twenty one members. The fourth asks whether the machine reaches a state in exactly a hundred steps, and that one is decidable, because a hundred steps is a finite table.

> Caption: GATE 2020 Q26: of four languages, three are undecidable. The one about reaching a state in exactly 100 steps is decidable.

Exam-trap caption mode adds: *The option that looks like the odd one out is the decidable one. In these clusters the odd one out is usually the bounded property, not the semantic one.*

**4:07–4:15** — GATE 2022, question forty six. Equality of two machine languages, regularity, and accepting every string are undecidable. The fourth option says the machine takes more than a thousand and seventy three steps on every string, and that is decidable, because no longer input can behave differently in that many steps.

> Caption: GATE 2022 Q46: equality of two machine languages, regularity, and accepting all strings are undecidable. A 1073-step bound is not.

Exam-trap caption mode adds: *The bound is on steps, and the reason it works is that the head cannot read past cell k in k steps. If the bound were on the number of states instead, the argument would not go through.*

**4:15–4:22** — GATE 2021, Set 1, question thirty nine. Two languages: more than 2021 steps on all inputs, and more than 2021 steps on some input. Both are decidable. Search every input of length at most 2021 for 2022 steps, and the finite table answers both questions.

> Caption: GATE 2021 Set 1 Q39: "more than 2021 steps on all inputs" and "on some input" are both decidable.

Exam-trap caption mode adds: *"On all inputs" over an infinite set feels like the harder one. Here it is the easier one, because a single short counterexample would have to appear among the short inputs.*

**4:22–4:30** — GATE 2016, Set 2, question forty four. The two step-bounded languages are recursive, and accepting the empty string is not. Accepting epsilon is a property of the language, so Rice applies. And 2014 Set 2 question thirty five gives the pair in one question: some string of length 2014, undecidable but recognisable.

> Caption: GATE 2016 Set 2 Q44: the two step-bounded languages are recursive, and "M accepts the empty string" is not.

Exam-trap caption mode adds: *Recognisable and decidable come apart in that 2014 question. The answer is "undecidable but recursively enumerable", and both halves of that phrase have to be justified.*

## Scene 10. The procedure, and the four slips

*4:30 – 5:00 · objective: Fix a five-step routine and the four errors that cost marks in this clause.*

**4:30–4:37** — Step one. Is the question about a run or about a language? If it mentions steps, states, or a particular input, it is about a run, and you simulate. If it mentions the language of the machine, it is a candidate for Rice.

> Caption: Step one: is the question about a run or about a language? A run is simulated; a language is a candidate for Rice.

Exam-trap caption mode adds: *A question can mention a machine and still be about its language, as "M accepts epsilon" does. The signal is whether the answer depends on the language rather than on how the machine got there.*

**4:37–4:45** — Step two. Is there a number in the property? A fixed bound on steps, or on the length of the input, makes the question finite, and a finite question is decidable. Simulate up to the bound and read the answer off the table.

> Caption: Step two: is there a number in the property? A fixed bound makes it a finite table, so it is decidable.

Exam-trap caption mode adds: *A number that counts something else, such as "at least 21 strings in the language", is not a bound on the run. That one is semantic and undecidable.*

**4:45–4:52** — Step three. If it is a semantic property, is it non-trivial? Exhibit two machines with different answers, and Rice does the rest. The machine that rejects everything and the machine that accepts everything split almost every property you will be asked about.

> Caption: Step three: if it is semantic, is it non-trivial? Exhibit two machines with different answers, then cite Rice.

Exam-trap caption mode adds: *A property can be non-trivial and still decidable, but only when it is not semantic. Rice needs both conditions, and dropping one is the usual mistake.*

**4:52–5:00** — Steps four and five. Fix the direction of the reduction, because hardness flows against the arrow. Then read the class off the ladder instead of reasoning from scratch. And watch the four slips: Rice on a bounded property, the arrow reversed, recognition confused with decision, and undecidable read as unrecognisable.

> Caption: Steps four and five: fix the direction of the reduction, and read the class off the ladder. Then check the four slips.

Exam-trap caption mode adds: *The four slips account for most lost marks in this clause, and three of them are about one word: which of decidable, recognisable and unrecognisable the question actually asked.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
