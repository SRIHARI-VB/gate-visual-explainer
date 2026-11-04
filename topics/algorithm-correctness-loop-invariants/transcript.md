# Algorithm Correctness: Loop Invariants, the Three Obligations and the Variant — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/algorithm-correctness-loop-invariants/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A loop is a claim, not a machine

*0:00 – 0:30 · objective: Separate the three questions a loop can be asked — does it stop, is the answer right, how fast is it — because one answer never implies the others.*

**0:00–0:07** — A loop is a claim about every input, not a machine you watch once.

> Caption: A loop is a claim about every input, not a machine you watch once.

**0:07–0:15** — Two separate questions: does it stop, and is the answer right when it stops?

> Caption: Two separate questions: does it stop, and is the answer right when it stops?

**0:15–0:22** — Both together are total correctness. Speed is a third question and implies neither.

> Caption: Both together are total correctness. Speed is a third question and implies neither.

Exam-trap caption mode adds: *O(log n) says how long it runs, never that the answer is right.*

**0:22–0:30** — The tool that answers the first two is one sentence, true at the top of every iteration.

> Caption: The tool that answers the first two is one sentence, true at the top of every iteration.

## Scene 2. The candidate window: one sentence that stays true

*0:30 – 1:00 · objective: State the binary-search invariant in words, and watch the window it describes shrink as three probes are made for a value that is present.*

**0:30–0:37** — Ten sorted values. Search for twenty-three. The candidate window starts as positions zero to nine.

> Caption: Ten sorted values. Search for 23. The candidate window starts as positions 0 to 9.

**0:37–0:45** — Invariant: if twenty-three occurs at all, at least one occurrence lies inside the window. Probe the middle, position four, value sixteen.

> Caption: Invariant: if 23 occurs at all, at least one occurrence lies inside the window. Probe the middle, position 4, value 16.

**0:45–0:52** — Sixteen is below twenty-three, so every position up to four holds something smaller. The window moves to five to nine.

> Caption: 16 is below 23, so every position up to 4 holds something smaller. The window moves to 5 to 9.

**0:52–1:00** — Probe position seven, value fifty-six. Above twenty-three, so the window becomes five to six. Probe five: twenty-three. Found in three probes.

> Caption: Probe position 7, value 56. Above 23, so the window becomes 5 to 6. Probe 5: 23. Found in three probes.

## Scene 3. Initialization and maintenance

*1:00 – 1:30 · objective: Prove the invariant twice: once before the loop, once per iteration — and see that nothing is claimed about the middle of the body.*

**1:00–1:07** — Initialization: before the first iteration the window is zero to nine, which is every position.

> Caption: Initialization: before the first iteration the window is 0 to 9, which is every position.

**1:07–1:15** — Maintenance: assume it holds now. The probe either finds the value or removes a side that cannot hold it.

> Caption: Maintenance: assume it holds now. The probe either finds the value or removes a side that cannot hold it.

**1:15–1:22** — So it is true again at the top of the next iteration. That single step is the induction.

> Caption: So it is true again at the top of the next iteration. That single step is the induction.

**1:22–1:30** — Nothing is claimed about the middle of the body. The invariant is checked at the loop boundary, twice per iteration.

> Caption: Nothing is claimed about the middle of the body. The invariant is checked at the loop boundary, twice per iteration.

Exam-trap caption mode adds: *An invariant holds at the top of the loop, not on every line inside it.*

## Scene 4. The exit: invariant plus not-guard

*1:30 – 2:00 · objective: Derive the postcondition from the invariant and the negation of the loop guard, on a search for a value that is absent.*

**1:30–1:37** — Now the exit. The loop stops when the window is empty: lo greater than hi. Search for three.

> Caption: Now the exit. The loop stops when the window is empty: lo greater than hi. Search for 3.

**1:37–1:45** — Probes sixteen, then five, then two. After two the window is one to zero, which is empty, and the loop stops.

> Caption: Probes 16, then 5, then 2. After 2 the window is 1 to 0, which is empty, and the loop stops.

**1:45–1:52** — Invariant plus not-guard gives the postcondition: an empty window holds no occurrence, so three is absent.

> Caption: Invariant plus not-guard gives the postcondition: an empty window holds no occurrence, so 3 is absent.

**1:52–2:00** — That is a proof, not a test. It is why the printed answer "not in the array" can be trusted.

> Caption: That is a proof, not a test. It is why the printed answer "not in the array" can be trusted.

## Scene 5. Termination needs its own witness

*2:00 – 2:30 · objective: Meet the variant: a positive integer that strictly decreases every iteration, and see the window sizes 10, 4, 2, 1, 0.*

**2:00–2:07** — Termination needs its own witness: a quantity that is a positive integer every iteration and strictly decreases.

> Caption: Termination needs its own witness: a quantity that is a positive integer every iteration and strictly decreases.

**2:07–2:15** — Here it is the window size, hi minus lo plus one: ten, then four, then one, then zero.

> Caption: Here it is the window size, hi minus lo plus one: 10, then 4, then 1, then 0.

**2:15–2:22** — A positive integer cannot strictly decrease forever, so the loop stops, after at most n iterations.

> Caption: A positive integer cannot strictly decrease forever, so the loop stops — after at most n iterations.

**2:22–2:30** — Both moves shrink it. The enumeration over three thousand six hundred and eighty-eight cases found no iteration where the size failed to drop.

> Caption: Both moves shrink it. The enumeration over 3,688 cases found no iteration where the size failed to drop.

## Scene 6. The GATE CSE 2008 program and its 2-cycle

*2:30 – 3:00 · objective: Run the erroneous binary search on an absent target and watch the window size stall at 2 — termination fails, and the variant names why.*

**2:30–2:37** — GATE C S E two thousand and eight asked for the correction to this program. Line six sets i to k, or j to k.

> Caption: GATE CSE 2008 asked for the correction to this program. Line 6 sets i to k, or j to k.

**2:37–2:45** — Search for three. Probes sixteen, eight, five, two, and then position zero again, with the window unchanged at zero to one.

> Caption: Search for 3. Probes 16, 8, 5, 2 — and then position 0 again, with the window unchanged at 0 to 1.

**2:45–2:52** — The window size is stuck at two. The variant never decreases, so the loop never ends.

> Caption: The window size is stuck at 2. The variant never decreases, so the loop never ends.

Exam-trap caption mode adds: *A hang produces no wrong output, so an output-comparing test can look like it simply did not run.*

**2:52–3:00** — The defect is the missing plus one: the probe just compared is kept as a candidate.

> Caption: The defect is the missing plus one: the probe just compared is kept as a candidate.

## Scene 7. The claims, checked by enumeration

*3:00 – 3:30 · objective: Count invariant violations, wrong answers and hangs over all 3,688 small cases, for the correct loop and for the 2008 one.*

**3:00–3:07** — Every claim here is checked by enumeration: four hundred and sixty-one sorted arrays of length one to five over values one to six, times eight targets, is three thousand six hundred and eighty-eight cases.

> Caption: Every claim here is checked by enumeration: 461 sorted arrays of length 1 to 5 over values 1 to 6, times 8 targets, is 3,688 cases.

**3:07–3:15** — The correct loop: zero invariant violations, zero wrong answers, eight thousand and ninety-one probes, at most three per search.

> Caption: The correct loop: zero invariant violations, zero wrong answers, 8,091 probes, at most 3 per search.

**3:15–3:22** — The two thousand and eight program: it never answers wrongly, but it hangs on two hundred and forty-six of the one thousand two hundred and sixty cases where the target is present.

> Caption: The 2008 program: it never answers wrongly, but it hangs on 246 of the 1,260 cases where the target is present.

Exam-trap caption mode adds: *Zero wrong answers is not zero failures: count the cases that never finish.*

**3:22–3:30** — And on one thousand four hundred and ninety of the two thousand four hundred and twenty-eight absent cases. A program that hangs is not a program that answers.

> Caption: And on 1,490 of the 2,428 absent cases. A program that hangs is not a program that answers.

## Scene 8. The intended correction is not the complete fix

*3:30 – 4:00 · objective: Apply option A of the 2008 question: termination is restored, yet 407 of 1,260 present targets are reported absent, and the invariant says which window is skipped.*

**3:30–3:37** — Option A sets i to mid plus one and j to mid minus one. Termination is restored: no hangs at all.

> Caption: Option A sets i to mid plus one and j to mid minus one. Termination is restored: no hangs at all.

**3:37–3:45** — But the guard still reads i less than j, so a window of one position is never probed.

> Caption: But the guard still reads i less than j, so a window of one position is never probed.

**3:45–3:52** — It reports not present for four hundred and seven of the one thousand two hundred and sixty present cases. On this array, for the targets two, twelve, thirty-eight and ninety-one.

> Caption: It reports "not present" for 407 of the 1,260 present cases — on this array, for targets 2, 12, 38 and 91.

Exam-trap caption mode adds: *A correction can restore termination and leave the answer wrong. Check both, separately.*

**3:52–4:00** — Change the guard to i less than or equal to j and the missed present targets fall to zero.

> Caption: Change the guard to i less than or equal to j and the missed present targets fall to zero.

## Scene 9. A second loop: the maximum of a prefix

*4:00 – 4:30 · objective: Apply the same three obligations to a loop that is not a search, where the invariant is about a prefix that grows by one.*

**4:00–4:07** — A second loop, no searching: the maximum of six values. Start best at the first, scan from position one.

> Caption: A second loop, no searching: the maximum of six values. Start best at the first, scan from position 1.

**4:07–4:15** — Invariant: at the top of iteration i, best is the maximum of positions zero to i minus one.

> Caption: Invariant: at the top of iteration i, best is the maximum of positions 0 to i minus 1.

**4:15–4:22** — Three, then nine, then nine, then nine, then nine, then nine. After the last iteration best is the maximum of the whole array.

> Caption: 3, then 9, then 9, then 9, then 9, then 9. After the last iteration best is the maximum of the whole array.

**4:22–4:30** — The prefix grows by one each iteration, so the same three obligations prove this loop too.

> Caption: The prefix grows by one each iteration, so the same three obligations prove this loop too.

## Scene 10. Why testing is not proof

*4:30 – 5:00 · objective: Count the test cases one array length would need, and put the four-line proof beside it.*

**4:30–4:37** — Why not just test? Ten distinct values have three million six hundred and twenty-eight thousand eight hundred orderings, and ten targets make thirty-six million two hundred and eighty-eight thousand cases.

> Caption: Why not just test? Ten distinct values have 3,628,800 orderings, and ten targets make 36,288,000 cases.

**4:37–4:45** — The proof above is four lines and covers every length at once. A passing suite is evidence, never proof.

> Caption: The proof above is four lines and covers every length at once. A passing suite is evidence, never proof.

**4:45–4:52** — Initialization, maintenance, termination: the invariant carries the answer, the variant carries the ending.

> Caption: Initialization, maintenance, termination: the invariant carries the answer, the variant carries the ending.

Exam-trap caption mode adds: *The invariant proves the answer; only the variant proves the loop ends.*

**4:52–5:00** — Read any loop as these three claims, and "what does this print" becomes a question you can answer.

> Caption: Read any loop as these three claims, and "what does this print" becomes a question you can answer.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
