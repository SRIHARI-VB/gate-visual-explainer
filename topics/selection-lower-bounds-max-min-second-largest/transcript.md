# Selection Lower Bounds: Maximum, Minimum and Second Largest in the Fewest Comparisons — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/selection-lower-bounds-max-min-second-largest/index.html`
- Total duration: 5:48 (348 seconds), 11 scenes, 44 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. The question is a count, not a growth rate

*0:00 – 0:30 · objective: see that "how many comparisons" is a different question from "how fast does it grow", and that every count below is exact*

**0:00–0:08** — Eight numbers, and the job is to find the largest. The only operation you are allowed to use compares two of them and tells you which is bigger. Every question in this lesson is about how many such comparisons the job costs.

> Caption: Eight numbers. Find the largest. The only operation you may use compares two of them.

**0:08–0:15** — A growth rate hides the constant factor. Saying that finding the maximum takes linear time is true and useless when the question asks for a number. A count does not hide anything: seven, or nine, or one hundred and forty-eight.

> Caption: A growth rate hides the constant. A count does not. GATE asks for the count.

**0:15–0:23** — The counter starts at zero. Everything that follows is a ledger: each comparison is paid for once, and the total at the end is the answer.

> Caption: The counter starts at zero. Every comparison below is paid for, and none is free.

**0:23–0:30** — There are three jobs in this lesson, and they have three different answers. The largest alone. The largest and the smallest together. And the second largest, which is the one people get wrong.

> Caption: Three jobs, three different counts: the largest alone, the largest and smallest together, and the second largest.

Exam-trap caption mode adds: *Do not answer "find the largest and smallest" with 2n - 2 without checking whether a cheaper method exists. It does, and the whole difference is one comparison per pair.*

## Scene 2. The maximum costs n minus 1, and cannot cost less

*0:30 – 1:00 · objective: count the knockouts a maximum needs, and see the adversary stop an algorithm one comparison early*

**0:30–0:38** — Scan the numbers once and keep the best so far. The first number is free, and each of the other seven costs one comparison against the champion. Seven comparisons for eight numbers, which is n minus 1.

> Caption: Scan once, keeping the best so far: seven comparisons for eight numbers.

**0:38–0:45** — Read the same scan as a knockout tournament. A comparison between two undefeated candidates eliminates exactly one of them. To be left with a single candidate, seven of the eight must be eliminated, so seven comparisons are needed.

> Caption: Every comparison knocks one candidate out of the race. Seven knockouts leave one standing.

**0:45–0:52** — Suppose an algorithm stops after six comparisons. Two candidates have never lost, so both could be the largest, and the adversary is free to declare whichever one the algorithm did not pick. The answer is not determined, so the algorithm is wrong on some input.

> Caption: Stop after six comparisons and two candidates are still undefeated. The adversary says either could be the largest.

**0:52–1:00** — So n minus 1 is exact: it is achieved by the scan and it cannot be beaten. From here on, every count in this lesson has that same two-part shape, an algorithm that attains the number and an argument that no algorithm can go below it.

> Caption: So n minus 1 is exact: achievable and unavoidable. That pairing of words is what the rest of the lesson repeats.

Exam-trap caption mode adds: *A lower bound proved for one algorithm is not a lower bound for the problem. The knockout argument constrains every algorithm because it only counts eliminations, which every correct algorithm must achieve.*

## Scene 3. Minimum and maximum the obvious way: 2n minus 2

*1:00 – 1:32 · objective: count the independent-scan algorithm exactly, and see where its comparisons are wasted*

**1:00–1:08** — Now the job is to find both the smallest and the largest. The obvious method runs the scan twice: once for the largest, once for the smallest.

> Caption: Now find both the smallest and the largest. The obvious method scans twice.

**1:08–1:16** — Two scans cost two lots of n minus 1, which is 2n minus 2. At n equal to one hundred that is one hundred and ninety-eight comparisons.

> Caption: Two scans cost two lots of n minus 1, which is 2n minus 2. At n = 100 that is 198.

**1:16–1:24** — Look at what a single comparison already tells you. Compare two numbers and you learn which is the larger and which is the smaller. That one comparison has produced one candidate for the maximum and one candidate for the minimum, at the same time.

> Caption: Look at what one comparison tells you: of two numbers, one is a candidate for the largest and the other for the smallest.

**1:24–1:32** — So the naive count is not the minimum. It pays one comparison per pair more than it needs to, and the next scene shows the method that stops paying it.

> Caption: So the naive count is not the minimum. It is one comparison per pair too many, and the next scene collects that.

## Scene 4. The pairing trick: 3n/2 minus 2

*1:32 – 2:06 · objective: run the pairwise algorithm, count its three parts, and land on 148 for n = 100*

**1:32–1:40** — First compare the numbers in pairs. At n equal to one hundred that is fifty comparisons, and every pair is now ordered, so each pair has a larger member and a smaller member.

> Caption: First compare the numbers in pairs. Fifty comparisons at n = 100, and every pair is now ordered.

**1:40–1:48** — Now the largest of all must be one of the fifty larger members, because every smaller member lost its own pair. Finding the largest among fifty candidates costs forty-nine comparisons.

> Caption: Now the largest must be among the fifty larger members. Finding it costs 49 comparisons.

**1:48–1:56** — By the same argument the smallest must be one of the fifty smaller members, and finding it costs another forty-nine comparisons.

> Caption: And the smallest must be among the fifty smaller members: another 49 comparisons.

**1:56–2:06** — Fifty plus forty-nine plus forty-nine is one hundred and forty-eight. In general the count is floor of n over 2 for the pairs, plus two lots of ceil of n over 2 minus 1 for the two searches, which for even n is 3n over 2 minus 2.

> Caption: Fifty plus 49 plus 49 is 148. In general floor(n/2) plus 2 times ceil(n/2) minus 2, which is 3n/2 minus 2 for even n.

Exam-trap caption mode adds: *The saving is not asymptotic. 148 and 198 are both linear, and a question that asks for the constant is not answered by saying "O(n)".*

## Scene 5. Why 3n/2 minus 2 cannot be beaten

*2:06 – 2:40 · objective: run the four-category adversary accounting: 2n - 2 points are needed and only floor(n/2) comparisons can pay two at once*

**2:06–2:14** — To prove that no method can beat one hundred and forty-eight, track every element in one of four states: untouched, has only won, has only lost, or has both won and lost.

> Caption: To prove no method beats 148, track each element in one of four states.

**2:14–2:22** — When the algorithm finishes, the maximum has only won, the minimum has only lost, and every other element has both a win and a loss, because it is neither the largest nor the smallest.

> Caption: At the end, one element has only won, one has only lost, and the other n minus 2 have both.

**2:22–2:30** — A comparison between two untouched elements can pay two units at once, because the winner gains a win and the loser gains a loss. Every other kind of comparison pays at most one, and some pay none.

> Caption: A comparison between two untouched elements pays two units. Every other comparison pays at most one.

**2:30–2:40** — At most floor of n over 2 comparisons can be of the generous kind, because each one consumes two untouched elements. So the total is at least 2n minus 2 minus floor of n over 2, which is ceil of 3n over 2 minus 2. The bound is exact.

> Caption: At most floor(n/2) comparisons can be generous, so at least 2n minus 2 minus floor(n/2) comparisons are needed: ceil(3n/2) minus 2.

Exam-trap caption mode adds: *The bound counts information, not comparisons of a particular shape. That is why it applies to every possible algorithm, including ones nobody has invented.*

## Scene 6. Odd n, the leftover element, and the exact formula

*2:40 – 3:08 · objective: repair the count for odd n and check the closed form against the running algorithm for n = 2 to 12*

**2:40–2:48** — With an odd number of elements, one element is left over after the pairs are made. Compare it with the current largest and with the current smallest, which costs two comparisons, and the count becomes 3 times n minus 3, all over 2.

> Caption: With an odd count one element is left over after pairing. Compare it to both champions: two more comparisons.

**2:48–2:56** — One formula covers both parities: ceil of 3n over 2, minus 2. For two numbers it gives one comparison, which is right, because comparing them settles both questions. For three numbers it gives three.

> Caption: One formula covers both parities: ceil(3n/2) minus 2. Two numbers: 1, and three numbers: 3.

**2:56–3:04** — The table runs n from 2 to 12 and puts three numbers side by side: the naive 2n minus 2, the count the pairing algorithm actually makes, and the closed form. The last two agree on every row.

> Caption: The table for n from 2 to 12: naive 2n minus 2, the pairing count, and the formula. They agree on every row.

**3:04–3:08** — The saving over the naive method is exactly floor of n over 2, one comparison for every pair. That is the second piece of information the naive method discards, priced exactly.

> Caption: The saving over the naive method is exactly floor(n/2): one comparison for each pair.

## Scene 7. The second largest the obvious way: 2n minus 3

*3:08 – 3:40 · objective: count the two-pass method and see why almost all of its comparisons are wasted*

**3:08–3:16** — Now the second largest. The obvious method finds the largest, removes it from consideration, and finds the largest of what remains.

> Caption: The second largest. The obvious method: find the largest, then find the largest of the rest.

**3:16–3:24** — At n equal to eight the obvious method costs thirteen comparisons. The best possible is nine. That gap of four is what the rest of this lesson closes.

> Caption: At n = 8 that is 13 comparisons. The answer is 9, and the gap is the whole lesson.

**3:24–3:32** — Think about who could possibly be the second largest. Someone who lost a comparison to a third element is certainly smaller than that element, so they cannot be second. Only an element that lost directly to the largest can be second.

> Caption: Think about who can be second. Only someone who lost directly to the largest can be.

**3:32–3:40** — So the second search does not need the whole array at all. It needs one list, the list of elements the largest beat, and that list is short if the tournament is organised well.

> Caption: So the second search does not need the whole array. It needs one list: the elements the largest beat.

Exam-trap caption mode adds: *An unbalanced tournament can make the winner play n - 1 matches, and then the candidate list is long and the method saves nothing. The tree shape is part of the algorithm.*

## Scene 8. The tournament tree: n plus log n minus 2

*3:40 – 4:12 · objective: build the knockout tree, keep the beaten lists, and find the second largest among the winner's own victims*

**3:40–3:48** — Eight leaves, four matches in the first round, two in the second, one in the final. Seven comparisons, which is n minus 1, and the winner is the largest.

> Caption: Eight leaves, four matches, then two, then one: seven comparisons to find the largest.

**3:48–3:56** — The winner played exactly three matches, so it beat exactly three elements. Those three are the only candidates for second place, and there are no others.

> Caption: The winner played three matches. Its three victims are the only candidates for second place.

**3:56–4:04** — Find the largest among the three candidates, which costs two comparisons. Seven plus two is nine, and nine is n plus ceil(log2 n) minus 2 at n equal to eight.

> Caption: Find the largest of those three: two comparisons. Total 7 plus 2 is 9.

**4:04–4:12** — The saving over the two-pass method is n minus 1 minus ceil of log base 2 of n. At n equal to eight that is four, and it grows with n, so the advantage is not a constant.

> Caption: The saving over 2n minus 3 is n minus 1 minus ceil(log2 n). At n = 8 that is 4, and it grows.

## Scene 9. Why fewer comparisons cannot find the second largest

*4:12 – 4:42 · objective: see the adversary force the winner to beat ceil(log2 n) elements, every one of them still a candidate*

**4:12–4:20** — Why can no method use fewer than n plus log n minus 2? Because of what the winner must have beaten. If the winner beat only a few elements, the adversary still has freedom.

> Caption: Why can no method use fewer than n plus log n minus 2? Count what the winner must have beaten.

**4:20–4:28** — Suppose the winner beat only two elements. Then an element that never met the winner has lost only to something smaller than the winner, so the adversary can promote it to second place. The answer is not determined.

> Caption: If the winner beat only two elements, either of the others could be second and the adversary may choose it.

**4:28–4:36** — So the winner must have beaten at least ceil of log base 2 of n elements, and the second largest is the largest of them, which needs ceil of log base 2 of n minus 1 further comparisons. Adding the n minus 1 to find the winner gives n plus ceil(log2 n) minus 2.

> Caption: So the winner must beat at least ceil(log2 n) elements, and each must be compared against the others: ceil(log2 n) minus 1 more.

Exam-trap caption mode adds: *The logarithm is not optional decoration. It comes from the number of matches the winner plays, which is the depth of the bracket, and an unbalanced bracket breaks the bound in the other direction.*

**4:36–4:42** — The same style of argument gives the maximum alone as n minus 1, and the pair as ceil of 3n over 2 minus 2. Three counts, three proofs, and one method: count what any correct algorithm must know.

> Caption: The same argument gives the maximum alone as n minus 1, and the pair as ceil(3n/2) minus 2: three counts, three proofs.

## Scene 10. Searching every strategy for n up to 5

*4:42 – 5:12 · objective: exhaust the space of comparison strategies and confirm 1, 3, 4, 6 - then find where the two formulas part company*

**4:42–4:50** — Do not take the formulas on trust. For two, three, four and five numbers the page searches every possible comparison strategy, with the adversary choosing the worst answer at every step, and reports the best worst-case count.

> Caption: Do not take the formulas on trust. Search every comparison strategy for two, three, four and five numbers.

**4:50–4:58** — The answers are one, three, four and six, for both jobs, and they are exactly what the two formulas predict. The formulas are not approximations.

> Caption: The answers are 1, 3, 4 and 6 for both jobs: the same numbers the formulas give.

**4:58–5:06** — For n up to six the two formulas give the same number: one, three, four, six, seven, seven. At n equal to seven they part company: nine for the pair, eight for the second largest.

> Caption: For n up to 6 the two formulas coincide: 1, 3, 4, 6, 7, 7. At n = 7 they part: 9 against 8.

Exam-trap caption mode adds: *The coincidence at small n is why so many answers to "second largest" are given as 3n/2 - 2. Check n = 8: the pair costs 10, the second largest 9.*

**5:06–5:12** — The exhaustive search is only a check on small cases; the proof is the adversary argument. Where both apply they agree, which is what a check is for.

> Caption: The search is only a check. The proof is the adversary, and the two agree wherever both apply.

## Scene 11. Two previous-year items, recomputed

*5:12 – 5:48 · objective: answer GATE CSE 2014 Set 1 Q39 and GATE CSE 2021 Set 1 Q2 from the count, not from memory*

**5:12–5:20** — GATE CSE 2014, Set 1, question 39 asks for the minimum number of comparisons needed to find the minimum and the maximum of one hundred numbers.

> Caption: GATE CSE 2014 Set 1, question 39: the minimum comparisons to find the minimum and maximum of 100 numbers.

**5:20–5:28** — One hundred is even, so the count is 3n over 2 minus 2, which is one hundred and forty-eight. The published key is one hundred and forty-eight, accepted over the range one hundred and forty-seven point one to one hundred and forty-eight point one.

> Caption: n = 100 is even, so the count is 3n/2 minus 2, which is 148. The published key is 148, accepted over 147.1 to 148.1.

**5:28–5:38** — GATE CSE 2021, Set 1, question 2 asks which statement about the lowest upper bound t is correct. The answer is that t is greater than n and at most 3 times ceil of n over 2, which is what the exact count satisfies.

> Caption: GATE CSE 2021 Set 1, question 2: t is the lowest upper bound on the comparisons. Answer: t is above n and at most 3 ceil(n/2).

**5:38–5:48** — Four steps answer any question of this family. Name the facts the answer needs. Count how many of them one comparison can deliver. Divide, and round up. Then exhibit an algorithm that attains the number, because a lower bound without an algorithm is only half an answer.

> Caption: Four steps: name the facts the answer needs, count what one comparison can deliver, divide, then exhibit the algorithm that attains it.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
