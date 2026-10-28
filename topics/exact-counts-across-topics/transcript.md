# Exact counts: comparisons, probes, transfers and multiplications — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/exact-counts-across-topics/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Four units, one procedure

*0:00 – 0:30 · objective: See that "how many comparisons" and "how much work" are different questions about the same algorithm, and that every exact count on the paper is built by the same four steps.*

**0:00–0:07** — Section five asks for asymptotic worst case complexity. The paper then asks for an integer. Those are two different questions.

> Caption: Section 5 of the syllabus asks for "asymptotic worst case time and space complexity" — and the paper then asks for an integer.

Exam-trap caption mode adds: *A correct Big-O tells you nothing about the integer on the answer sheet. n log n does not say 17.*

**0:07–0:15** — Four units cover the syllabus: a comparison, a probe, a block transfer, and a multiplication. Each structure counts its own.

> Caption: Four units cover every count the syllabus asks for: a comparison, a probe, a block transfer, a multiplication.

Exam-trap caption mode adds: *Swapping the unit is the commonest error: reporting merge sort work as comparisons, or comparisons as work.*

**0:15–0:22** — Merge sort on eight elements does twenty-four units of work and at most seventeen comparisons. Both are right, and they answer different questions.

> Caption: Merge sort on eight elements does 24 units of work and at most 17 comparisons. Both are right; they answer different questions.

Exam-trap caption mode adds: *The 24 is not a comparison count and the 17 is not a work count. Writing 24 when the question says comparisons is a lost mark.*

**0:22–0:30** — The procedure has four steps: name the unit, count the units per level, sum with the structure identity, and check by a second route.

> Caption: The procedure: name the unit, count the units per level, sum with the structure's identity, then check by a second route.

Exam-trap caption mode adds: *Skipping step 4 is how a plausible formula survives. The page runs step 4 for every number it shows.*

## Scene 2. Merge sort: work counted by level, comparisons counted exactly

*0:30 – 1:00 · objective: Count merge sort two ways at n = 8 — 24 units of level work and 17 comparisons in the worst case — and check the closed form against every ordering.*

**0:30–0:37** — Merge sort on eight elements has three levels below the root, eight leaves, and seven merges.

> Caption: Merge sort on eight elements: three levels below the root, eight leaves, seven merges.

Exam-trap caption mode adds: *Counting the root as a level gives four and shifts every later number.*

**0:37–0:45** — Every level moves all eight elements once, so the total is eight times three, twenty-four units of work.

> Caption: Work: every level moves all eight elements once, so the total is 8 times 3 = 24 units.

Exam-trap caption mode adds: *The level count is a work count. Reading it as a comparison count is the error the next beat fixes.*

**0:45–0:52** — Comparisons are twelve at best, seventeen at worst, and fifteen point seven three on average, over all forty thousand three hundred and twenty orderings.

> Caption: Comparisons: 12 best, 17 worst, 15.73 on average, over all 40,320 orderings of eight elements.

Exam-trap caption mode adds: *A merge costs at most m + n - 1 comparisons, not m + n. The minus one is the copy that needs no test.*

**0:52–1:00** — The closed form, n times ceil of log base two n, minus two to that power, plus one, gives seventeen at n equals eight, and matches the enumeration at every size from one to eight.

> Caption: The closed form n times ceil(lg n) minus 2 to the ceil(lg n) plus 1 gives 17 at n = 8, and matches the enumeration at every n from 1 to 8.

Exam-trap caption mode adds: *The formula is for a power-of-two-friendly split and for this exact merge sort. Another split rule gives another constant.*

## Scene 3. Quicksort: n - 1 comparisons per partition

*1:00 – 1:30 · objective: Derive n(n-1)/2 as the worst case from the number of element pairs, and count the two GATE CSE 2014 Set 1 inputs exactly: 10 against 7.*

**1:00–1:07** — A partition compares the pivot with every other element in its range, so exactly n minus one comparisons.

> Caption: A partition compares the pivot with every other element in its range: exactly n - 1 comparisons for n elements.

Exam-trap caption mode adds: *Comparing the pivot with itself, or with elements outside the range, inflates the count by one per partition.*

**1:07–1:15** — In the worst case every partition splits off one element, so the counts are seven, six, five, four, three, two, one, which is twenty-eight at n equals eight.

> Caption: Worst case: every partition splits off one element, so the counts are 7 + 6 + 5 + 4 + 3 + 2 + 1 = 28 at n = 8.

Exam-trap caption mode adds: *28 is the worst case for this pivot rule. A median-of-three pivot can beat it on sorted input.*

**1:15–1:22** — The average is sixteen point nine two at n equals eight, matching two times n plus one times the n-th harmonic number minus four n. The best case is thirteen.

> Caption: Average: 16.92 at n = 8, matching 2(n+1)H(n) - 4n. Best case: 13.

Exam-trap caption mode adds: *The average case is not the balanced case. A random pivot averages 16.92, while the ideal split gives 13.*

**1:22–1:30** — GATE CSE two thousand fourteen set one asked for two inputs. The sorted one takes ten comparisons and the second takes six, so t one is greater than t two.

> Caption: GATE CSE 2014 Set 1 asked for two inputs: {1,2,3,4,5} takes 10 comparisons and {4,1,5,3,2} takes 6, so t1 > t2.

Exam-trap caption mode adds: *Counting only the first partition gives 4 for both and makes the answers look equal. The recursion is where the difference lives: it adds 6 to the first input and 2 to the second.*

## Scene 4. Binary search: one comparison per level

*1:30 – 2:00 · objective: Read floor(lg n) + 1 off the halving, verify it against every size and every target up to 64, and settle the counting convention of GATE CSE 2007 Q15.*

**1:30–1:37** — Binary search makes one comparison per level, and the range halves each time, so there are floor of log base two n, plus one, levels.

> Caption: Binary search makes one comparison per level, and the range halves each time, so there are floor(lg n) + 1 levels.

Exam-trap caption mode adds: *ceil(lg n) + 1 is the count including the exit test in some loop forms; the two differ exactly at powers of two.*

**1:37–1:45** — Checked against every size and every target up to sixty-four, the worst case is always floor of log base two n plus one, and an unsuccessful search costs the same.

> Caption: Checked against every size and every target up to 64: the worst case is always floor(lg n) + 1, and an unsuccessful search costs the same.

Exam-trap caption mode adds: *A search that fails is not cheaper. It walks to an empty range, which is the same number of levels.*

**1:45–1:52** — At n equals one thousand and twenty-four that is eleven comparisons: ten halvings reach one element, and the eleventh is the test on it.

> Caption: At n = 1024 that is 11 comparisons: ten halvings reach one element, and the eleventh is the test on it.

Exam-trap caption mode adds: *Saying 10 because 2 to the 10 is 1024 drops the last test. lg n counts halvings, not tests.*

**1:52–2:00** — GATE CSE two thousand seven question fifteen counts a doubling loop. Floor of log base two n plus one is the answer, because the exit test is not a comparison made while the loop runs.

> Caption: GATE CSE 2007 Q15 counts a doubling loop: floor(lg n) + 1 is the answer, because the exit test is not a comparison made while the loop runs.

Exam-trap caption mode adds: *This is a counting-convention question, not an asymptotics question. Read what the paper says is counted before choosing a formula.*

## Scene 5. Hashing: probes, and the load factor that multiplies them

*2:00 – 2:30 · objective: Count probes in a real chained table (1.4 successful, 2.43 unsuccessful), then see why the estimate 1/(1-alpha) is a statement about random hash functions rather than about one table.*

**2:00–2:07** — Ten keys in seven chained slots give a load factor of ten over seven, one point four three.

> Caption: Ten keys in seven chained slots: the load factor alpha is 10/7 = 1.43.

Exam-trap caption mode adds: *Open addressing cannot reach alpha above one, so a chain example and a probing example are not interchangeable.*

**2:07–2:15** — Successful search costs fourteen probes over ten keys, an average of one point four. Unsuccessful costs seventeen probes over seven home slots, an average of two point four three.

> Caption: Successful search: 14 probes over 10 keys, an average of 1.4. Unsuccessful: 17 probes over 7 home slots, an average of 2.43.

Exam-trap caption mode adds: *The unsuccessful count is one more than the chain length, because the terminating null still has to be read.*

**2:15–2:22** — The estimates one plus alpha over two and alpha are averages over random hash functions, not predictions for one table.

> Caption: The estimates 1 + alpha/2 and alpha are averages over random hash functions, not predictions for one table.

Exam-trap caption mode adds: *Using alpha as an exact answer for a stated table is the error. A stated table is counted by simulation.*

**2:22–2:30** — For open addressing the estimate is one over one minus alpha, which is two at alpha equals nought point five and ten at nought point nine. GATE DS and AI two thousand twenty-four question eleven asked exactly this.

> Caption: For open addressing the estimate is 1/(1 - alpha), which is 2 at alpha = 0.5 and 10 at alpha = 0.9. GATE DS&AI 2024 Q11 asked exactly this.

Exam-trap caption mode adds: *The successful-search figure is smaller than the insertion figure. Using it for an insertion understates the cost.*

## Scene 6. Cache: block transfers for one access sequence

*2:30 – 3:00 · objective: Count misses for the same sixteen accesses in row-major and column-major order — 4 against 16 — and turn the count into an average memory access time.*

**2:30–2:37** — Sixteen words in a four by four array, block size four words, a two-block cache. One block transfer per miss.

> Caption: Sixteen words in a four-by-four array, block size four words, a two-block cache. One block transfer per miss.

Exam-trap caption mode adds: *A block transfer moves a whole block. Counting transfers per word instead of per block multiplies the answer by four.*

**2:37–2:45** — Row-major order gives four misses and twelve hits, because each block is used four times before it is evicted.

> Caption: Row-major order: 4 misses and 12 hits, because each block is used four times before it is evicted.

Exam-trap caption mode adds: *The first access to each block always misses. Sixteen accesses to four blocks cannot cost fewer than four transfers.*

**2:45–2:52** — Column-major order gives sixteen misses and no hits. Every consecutive access wants a different row, and the cache holds two.

> Caption: Column-major order: 16 misses and no hits. Every consecutive access wants a different row, and the cache holds two.

Exam-trap caption mode adds: *The same array and the same cache give four times the traffic. Traversal order is part of the count.*

**2:52–3:00** — Turn the count into a time: with a one-cycle hit and a forty-cycle miss penalty, average access time is eleven cycles row-major and forty-one column-major.

> Caption: Turn the count into a time: with a one-cycle hit and a 40-cycle miss penalty, average access time is 11 cycles row-major and 41 column-major.

Exam-trap caption mode adds: *Multiplying the miss penalty by the number of misses rather than by the miss rate gives 160 and 640. The formula wants a rate.*

## Scene 7. Dynamic programming: count the cells before you fill them

*3:00 – 3:30 · objective: Count subproblems and split points for matrix-chain multiplication (10 and 20 at n = 5) and table cells for LCS (30 at 4 by 5), from the table shape rather than from memory.*

**3:00–3:07** — Matrix-chain multiplication on five matrices has ten subproblems: the contiguous ranges, counted as five times four over two.

> Caption: Matrix-chain multiplication on five matrices: the subproblems are the contiguous ranges, and there are 5 times 4 / 2 = 10 of them.

Exam-trap caption mode adds: *The count is pairs of boundaries, not n squared. A square table would over-count by the diagonal and by one half.*

**3:07–3:15** — Filling it costs one split test per possible break, twenty split points, which is n times n squared minus one over six.

> Caption: Filling it costs one split test per possible break: 4 + 6 + 6 + 4 = 20 split points, which is n(n squared - 1)/6.

Exam-trap caption mode adds: *The number of cells is quadratic and the number of transitions is cubic. The paper usually asks for one of them, not both.*

**3:15–3:22** — A different shape, a different count: LCS on strings of length four and five fills thirty cells, five rows by six columns.

> Caption: A different shape, a different count: LCS on strings of length 4 and 5 fills (4+1)(5+1) = 30 cells.

Exam-trap caption mode adds: *Dropping the empty row and column gives 20. The base row and column are what make the recurrence total.*

**3:22–3:30** — The rule: cells are counted from the shape of the table, transitions from what each cell reads. Neither is a complexity class.

> Caption: The rule: cells are counted from the table's shape, transitions from what each cell reads. Neither is a complexity class.

Exam-trap caption mode adds: *Writing n cubed for matrix chain because the algorithm is cubic, when the question asks for the number of subproblems, which is quadratic.*

## Scene 8. Karatsuba: count multiplications, not steps

*3:30 – 4:00 · objective: Count 3^k against 4^k scalar products, and see that the exponent log base 2 of 3 = 1.585 is a count of leaves in a tree, not a rate.*

**3:30–3:37** — Schoolbook multiplication makes four half-size products, so at depth k there are four to the k scalar products.

> Caption: Schoolbook multiplication of two n-digit numbers makes four half-size products, so at depth k there are 4 to the k scalar products.

Exam-trap caption mode adds: *The four calls are the multiplication count. The additions are a different unit and are usually ignored by the question.*

**3:37–3:45** — Karatsuba reuses two products to get the middle term, so there are only three to the k: two hundred and forty-three against one thousand and twenty-four at k equals five.

> Caption: Karatsuba reuses two products to get the middle term, so there are only 3 to the k: 243 against 1024 at k = 5.

Exam-trap caption mode adds: *Karatsuba is not free: it adds more additions. The win is in multiplications only, and on real machines that is not always the binding cost.*

**3:45–3:52** — The exponent is log base two of three, one point five eight five, and the model checks that three to the k equals n to the one point five eight five at n equals one thousand and twenty-four.

> Caption: The exponent is log base 2 of 3 = 1.585, and the model checks the identity 3 to the k equals n to the 1.585 at n = 1024.

Exam-trap caption mode adds: *1.585 is an exponent, not a rate. Writing 1.585 n is meaningless; the count is n to that power.*

**3:52–4:00** — At n equals one thousand and twenty-four the two counts are fifty-nine thousand and forty-nine, and one million forty-eight thousand five hundred and seventy-six: a factor of about eighteen, from one changed call.

> Caption: At n = 1024 the two counts are 59049 and 1048576 — a factor of about 18, from one changed call.

Exam-trap caption mode adds: *The ratio is not constant. It grows with n, so a small test case understates the gain.*

## Scene 9. One n, four units: 1024

*4:00 – 4:30 · objective: Put the four counts side by side at the same n, so that 11, 9217, 256 and 59049 are each seen to be correct for its own question and wrong for the others.*

**4:00–4:07** — One size, one thousand and twenty-four elements, and four questions. Binary search: eleven comparisons.

> Caption: One size, 1024 elements, and four questions. Binary search: 11 comparisons.

Exam-trap caption mode adds: *Eleven is not a small version of the sort counts. It is a different operation on the same data.*

**4:07–4:15** — Merge sort: ten thousand two hundred and forty units of work, and at most nine thousand two hundred and seventeen comparisons in the worst case.

> Caption: Merge sort: 10240 units of work, and at most 9217 comparisons in the worst case.

Exam-trap caption mode adds: *The gap between work and comparisons grows with n. At n = 8 it was 7; at n = 1024 it is 1023.*

**4:15–4:22** — Quicksort worst case: five hundred and twenty-three thousand seven hundred and seventy-six comparisons. The cache: two hundred and fifty-six block transfers.

> Caption: Quicksort worst case: 1024 times 1023 / 2 = 523776 comparisons. Cache: 1024 words in 256 blocks is 256 transfers.

Exam-trap caption mode adds: *The cache number depends on block size and traversal order; 256 is for a sequential scan with block size four.*

**4:22–4:30** — Karatsuba: fifty-nine thousand and forty-nine multiplications, against one million forty-eight thousand five hundred and seventy-six. Four correct answers, one n.

> Caption: Karatsuba: 59049 multiplications, against 1048576 for the schoolbook method. Four correct answers, one n.

Exam-trap caption mode adds: *Any of these four numbers looks plausible on the answer sheet. Only the unit in the question tells you which one is wanted.*

## Scene 10. The procedure, and the five traps

*4:30 – 5:00 · objective: Fix the four-step counting procedure and the five ways an exact count goes wrong, with the counterexample that exposes each one.*

**4:30–4:37** — Step one and two: name the unit, then count the units in one level, one partition, one call.

> Caption: Step 1 and 2: name the unit, then count the units in one level, one partition, one call.

Exam-trap caption mode adds: *Starting from a formula you remember is how the unit gets chosen for you by accident.*

**4:37–4:45** — Step three and four: multiply by the structure identity, then reach the same integer a second way.

> Caption: Step 3 and 4: multiply by the structure's own identity, then reach the same integer a second way.

Exam-trap caption mode adds: *Two routes that share an assumption are one route. Enumerate a different quantity, or use a different formula.*

**4:45–4:52** — The five traps: work for comparisons, the root counted as a level, log n without its plus one, a rate used as a count, and a table average used as its answer.

> Caption: The five traps: work for comparisons, the root counted as a level, lg n without its plus one, a rate used as a count, a table's average used as its answer.

Exam-trap caption mode adds: *All five produce an answer that is one line of arithmetic away from correct, which is why they are worth a mark.*

**4:52–5:00** — Nothing here replaces the asymptotic class. The class tells you what grows; the count tells you what the paper is asking for.

> Caption: Nothing here replaces the asymptotic class. The class tells you what grows; the count tells you what the paper is asking for.

Exam-trap caption mode adds: *Answering a count question with a complexity class, or a complexity question with a number, is the same error in two directions.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
