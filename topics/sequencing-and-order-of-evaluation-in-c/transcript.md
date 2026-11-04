# Sequencing And Order Of Evaluation In C — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/sequencing-and-order-of-evaluation-in-c/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Precedence groups the syntax, it does not order the run

*0:00 – 0:30 · objective: Separate two questions that look like one: which operator binds which operand, and which subexpression is computed first.*

**0:00–0:07** — Precedence groups the syntax. It does not schedule the run.

> Caption: Precedence decides which operator takes which operand. It says nothing about which operand is computed first.

**0:07–0:15** — The tree is fixed. The schedule is free.

> Caption: The tree is fixed by the grammar. The schedule is not fixed by anything in the source text.

Exam-trap caption mode adds: *Reading left-to-right associativity as left-to-right execution is the single most common error on this topic.*

**0:15–0:22** — Three schedules, one tree, one value.

> Caption: Three schedules, one tree, one value: g then h then f, or f then g then h, or h then g then f.

**0:22–0:30** — Two questions, two answers. Grouping by precedence, order by the standard.

> Caption: So two questions: grouping, answered by precedence and associativity; order of evaluation, answered by the standard as unspecified.

## Scene 2. One evaluation, two parts: a value and a side effect

*0:30 – 1:00 · objective: Split i++ and ++i into the value computation and the store, and say which of the two the standard calls the side effect.*

**0:30–0:37** — One expression, two parts: the value and the store.

> Caption: Evaluating i++ does two things: it computes the value 5, and it stores 6. Only the store is a side effect.

**0:37–0:45** — Value first, store second. That is the whole difference between i plus plus and plus plus i.

> Caption: For i++ the value computation comes first and the store after: that is why it yields the old value.

**0:45–0:52** — An assignment stores last, and only after both sides have been valued.

> Caption: An assignment is also two events: the value computations of both sides, then the store to the left side.

**0:52–1:00** — Four events, and one question: which may be reordered.

> Caption: Every question on this topic is a question about these small events and which of them may be reordered.

## Scene 3. Where the barriers are

*1:00 – 1:30 · objective: Name the places the standard puts a sequence point, and state what a sequence point orders: every value and every side effect on one side before everything on the other.*

**1:00–1:07** — A sequence point is a barrier in time.

> Caption: A sequence point is a barrier: everything before it is complete, including side effects, before anything after it begins.

**1:07–1:15** — The call, and or, comma, conditional, and the end of the statement.

> Caption: The barriers that decide expression questions: the call, &&, ||, the comma operator, ?:, and the end of a full expression.

**1:15–1:22** — One statement, one segment. The semicolon is a barrier.

> Caption: A full expression ends at the semicolon, the condition of if or while, each part of a for header, or the expression in return.

**1:22–1:30** — Inside a segment, nothing is ordered. That is where the trouble lives.

> Caption: Inside a segment nothing is ordered. That gap is where every undefined answer in this lesson lives.

Exam-trap caption mode adds: *The value computations of operands are ordered before the result, but the side effects are not. Questions turn on exactly that difference.*

## Scene 4. The rule that decides every question on this topic

*1:30 – 2:00 · objective: State the C11 rule on an unsequenced side effect on a scalar object, and apply it to i = i++ + 1.*

**1:30–1:37** — Same object, two unsequenced accesses, one of them a write: undefined.

> Caption: The rule: if a side effect on a scalar object is unsequenced with another side effect on it, or with a read of it, the behaviour is undefined.

**1:37–1:45** — Undefined does not mean unpredictable. It means unconstrained.

> Caption: Undefined is not unknown. It is the absence of any requirement: the compiler may do anything at all.

**1:45–1:52** — Two stores to one variable, no barrier: undefined.

> Caption: i = i++ + 1 has two stores to i and no barrier between them, so the whole statement is undefined.

**1:52–2:00** — Both orderings give six. And the statement is still undefined.

> Caption: And the answer still comes out as 6 on every ordering. One answer does not make the statement defined.

Exam-trap caption mode adds: *A program with undefined behaviour can produce the expected output. Correct output is not evidence of defined behaviour.*

## Scene 5. Six allowable orderings, two answers

*2:00 – 2:30 · objective: Enumerate every ordering of i++ + i++ with i = 5, collect the sums, and see two distinct answers where a student writes one.*

**2:00–2:07** — Four events, two of them stores.

> Caption: Take i equal to 5 and the expression i++ + i++. Four events: read, store, read, store.

**2:07–2:15** — Six orderings. Four give ten, two give eleven.

> Caption: Six orderings are legal. Two of them give 11, and the other four give 10.

**2:15–2:22** — Two answers, three unsequenced pairs. The statement is undefined.

> Caption: So the set of answers is 10 and 11, and three pairs of events are unsequenced: each read against the other store, and the two stores against each other.

**2:22–2:30** — No answer to mark. The statement is undefined.

> Caption: A question that asks for the value of i++ + i++ has no answer to mark. The defensible answer is that the behaviour is undefined.

## Scene 6. Three verdicts, not two

*2:30 – 3:00 · objective: Distinguish one answer with free order, several answers, and no answer at all, using f() + g(), f(i++, i) and x = i + 1.*

**2:30–2:37** — Free order, one answer, well defined.

> Caption: One answer with free order: f() + g(). Two orderings, the same sum, and the program is well defined.

**2:37–2:45** — Two possible argument pairs. Undefined, not unspecified.

> Caption: Several answers: f(i++, i). Three orderings give the argument pairs 5,5 and 5,6, so the call may see either.

**2:45–2:52** — Fixed order, one answer, defined.

> Caption: One answer with fixed order: x = i + 1. One ordering, one value, defined.

**2:52–3:00** — Three verdicts, not two.

> Caption: Three verdicts: defined with one answer, defined with an order the standard leaves open, and undefined.

Exam-trap caption mode adds: *Calling f() + g() undefined because the order is unspecified is the second most common error on this topic.*

## Scene 7. The operators that build their own barrier

*3:00 – 3:30 · objective: Show why i < n && a[i] == x is safe: &&, ||, the comma operator and ?: each carry a sequence point, and the comma in an argument list is not the comma operator.*

**3:00–3:07** — The ampersands are a barrier. That is why the index check works.

> Caption: i < n && a[i] == x is safe because && puts a barrier after its first operand.

**3:07–3:15** — Swap the operands and the guard protects nothing.

> Caption: Written the other way round, a[i] == x && i < n, the read of a[i] happens before the guard, and the guard protects nothing.

**3:15–3:22** — Comma as operator: a barrier. Comma as separator: no barrier.

> Caption: The comma operator and ?: also carry a barrier. The comma between arguments does not.

**3:22–3:30** — Buy a barrier with a comma, and the expression becomes defined.

> Caption: So a barrier can be bought with a comma operator, and that is the usual repair: x = (i++, i) has one ordering and one answer.

## Scene 8. Four forms, four rewrites

*3:30 – 4:00 · objective: Give the verdict and the defined rewrite for the four shapes that appear in questions, including the one that has a single answer and is still undefined.*

**3:30–3:37** — Shape one: undefined, two answers.

> Caption: Four shapes, four verdicts. i++ + i++: undefined, two answers, and no rewrite is needed because nobody wants it.

**3:37–3:45** — Shape two: the index and the increment fight.

> Caption: a[i] = i++: undefined, because the store to i is unsequenced with the read of i used as the index.

**3:45–3:52** — Shape three: two arguments, one variable.

> Caption: f(i++, i): undefined, because the two arguments are unsequenced and one writes what the other reads.

**3:52–4:00** — Shape four: one answer, still undefined.

> Caption: i = i++ + 1: undefined with a single answer of 6. That is the one that teaches the rule, because the answer looks right.

Exam-trap caption mode adds: *The exam-shaped trap: the answer 6 is not a proof that the expression is well defined.*

## Scene 9. The five-step decision procedure

*4:00 – 4:30 · objective: Turn the rule into a procedure that works on any expression, and name the two shapes a well-posed question can legally take.*

**4:00–4:07** — Find the statement, then mark the barriers.

> Caption: Step one: find the full expression. Step two: mark the barriers inside it.

**4:07–4:15** — List the accesses, mark the writes.

> Caption: Step three: list every access to each variable in the segment, and mark which are writes.

**4:15–4:22** — Two unsequenced accesses, one a write: stop, undefined.

> Caption: Step four: if two of them are unsequenced and at least one is a write, stop. The answer is undefined.

**4:22–4:30** — No conflict: the answer is fixed. Otherwise the answer is the verdict.

> Caption: Step five, only if no conflict: the answer is fixed, and the only freedom left is the order of calls that touch nothing shared.

## Scene 10. The chain, and the six slips

*4:30 – 5:00 · objective: Assemble the five statements that carry the topic, then the six slips that cost marks, each with its counterexample.*

**4:30–4:37** — Events, barriers, gaps, and the rule.

> Caption: The chain: an expression is events; barriers order the events; a gap lets them reorder; two unsequenced accesses with a write are undefined.

**4:37–4:45** — Six slips, each with a counterexample on this page.

> Caption: Six slips: reading associativity as execution, calling unspecified undefined, forgetting the argument comma is not an operator, trusting one printed answer, and two more.

**4:45–4:52** — Name the barriers, then ask what writes and what reads inside the gap.

> Caption: The one-line test: name the barriers, then ask whether anything in the gap writes what anything else in the gap reads.

**4:52–5:00** — Three verdicts, four rewrites, and the counts recomputed at load.

> Caption: The revision sheet keeps the three verdicts and the four rewrites; the practice set keeps the arithmetic of the enumeration.

Exam-trap caption mode adds: *The last trap is the quietest: a program with undefined behaviour that prints the expected answer teaches the wrong lesson.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
