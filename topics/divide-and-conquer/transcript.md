# Divide And Conquer — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/divide-and-conquer/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 41 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. What Section 5 asks for

*0:00 – 0:30 · objective: See that divide-and-conquer is a named design technique with three steps, and that two numbers — how many parts, and how much smaller each part is — decide the recurrence.*

**0:00–0:08** — Section five names three design techniques: greedy, dynamic programming and divide and conquer. The technique is the topic, not the sort.

> Caption: Section 5 of the GATE 2027 syllabus names divide-and-conquer as one of three design techniques.

Exam-trap caption mode adds: *The syllabus names the technique, not the algorithms. Merge sort is an example of it, not the item itself.*

**0:08–0:15** — Three steps: divide the problem, conquer each part by the same method, combine the answers.

> Caption: Three steps: divide the problem, conquer each part recursively, combine the answers.

Exam-trap caption mode adds: *A method that keeps only one part — binary search, quickselect — is decrease and conquer, not divide and conquer.*

**0:15–0:22** — Two numbers decide the shape: a, how many parts, and b, how much smaller each part is.

> Caption: Two numbers decide the shape: a, how many parts, and b, how much smaller each part is.

Exam-trap caption mode adds: *A split into one part of size n-1 is a = 1, b = 1: that is quicksort's worst case, and it is not logarithmic.*

**0:22–0:30** — Add the combine cost and you have the recurrence. The recurrence, not the code, is what the exam asks about.

> Caption: Add the combine cost f(n) and the three numbers give the recurrence; the recurrence gives the time.

Exam-trap caption mode adds: *Writing the recurrence from the code is the step people skip, and it is the step every question depends on.*

## Scene 2. Merge sort: the recursion tree of eight elements

*0:30 – 1:00 · objective: Count the levels, the leaves and the merges of a divide-and-conquer sort, and see that each level does one n of work.*

**0:30–0:38** — Eight elements, split into halves of four, then two, then one. The split is by position, so the shape never changes.

> Caption: Eight elements, split into two halves of four, then two, then one.

Exam-trap caption mode adds: *The tree is balanced because the split is by position. Quicksort splits by value, and there the tree is not balanced.*

**0:38–0:45** — Three levels of splitting, and eight one-element lists at the bottom. The leaves are the base cases.

> Caption: Three levels of splitting, and eight one-element lists at the bottom.

Exam-trap caption mode adds: *Counting nodes instead of levels is the usual slip: the levels are log_b n, the nodes are about twice that.*

**0:45–0:52** — Coming back up, seven merges: four of size two, two of size four, one of size eight.

> Caption: Coming back up, seven merges: four of size two, two of size four, one of size eight.

Exam-trap caption mode adds: *n - 1 merges, not n: the leaves are sorted for free, and each merge removes one list.*

**0:52–1:00** — Each level does one n of work, and there are three levels: twenty-four. That is n log n.

> Caption: Each level does at most one n of work, and there are three levels: 24 units, which is n log n.

Exam-trap caption mode adds: *n log n comes from levels times work per level. It is not a formula to memorise separately from the tree.*

## Scene 3. What one merge costs

*1:00 – 1:30 · objective: Bound a merge between min(m,n) and m+n-1 comparisons, and get the exact worst case for eight elements by enumeration and by the closed form.*

**1:00–1:08** — Merging two sorted lists costs between the smaller size and one less than the total.

> Caption: Merging two sorted lists of sizes m and n costs between min(m,n) and m+n-1 comparisons.

Exam-trap caption mode adds: *A merge is not always m+n comparisons: the last element needs no comparison, and one list may run out early.*

**1:08–1:16** — Both bounds are exact. Enumerate every interleaving and you reach both ends.

> Caption: Both bounds are exact: enumerate every interleaving and the extremes are reached.

Exam-trap caption mode adds: *A bound being safe does not make it tight. This one is tight, and the enumeration is what shows it.*

**1:16–1:24** — For eight elements the worst case is seventeen comparisons and the best is twelve, over all forty thousand orderings.

> Caption: For eight elements the worst case is seventeen comparisons, and the best is twelve.

Exam-trap caption mode adds: *n log n counts units of work, not comparisons. Quoting 24 as a comparison count is the standard error here.*

**1:24–1:30** — The closed form gives seventeen, and the enumeration agrees for every size from one to eight.

> Caption: The closed form n·ceil(lg n) - 2^ceil(lg n) + 1 gives 17, and the enumeration agrees for every n from 1 to 8.

Exam-trap caption mode adds: *The formula is for the worst case only. The average is lower, and the best case is about half of it.*

## Scene 4. From the tree to the recurrence

*1:30 – 2:00 · objective: Read T(n) = aT(n/b) + f(n) off the tree: log_b n levels, n^(log_b a) leaves, and the work at each level.*

**1:30–1:38** — One recurrence covers the family: a subproblems, each of size n over b, plus the cost of dividing and combining.

> Caption: One recurrence for the whole family: T(n) = a·T(n/b) + f(n).

Exam-trap caption mode adds: *f(n) is the whole of the non-recursive work. Leaving out the partition cost makes quicksort look logarithmic.*

**1:38–1:46** — The tree has log base b of n levels and a to the log base b of n leaves, which is n to the log base b of a.

> Caption: The tree has log_b n levels and a^(log_b n) leaves, and that leaf count equals n^(log_b a).

Exam-trap caption mode adds: *a^(log_b n) and n^(log_b a) are the same number, but only the second tells you the exponent in n.*

**1:46–1:54** — Three quantities: the leaves, the work per level, and the height. Whichever dominates decides the answer.

> Caption: Three quantities: the leaves, the work per level, and the height. Whichever dominates sets the answer.

Exam-trap caption mode adds: *Do not add the three. One of them dominates and the others are absorbed by the Theta.*

**1:54–2:00** — For merge sort the leaves and the level work are both n, so every level counts and the answer is n log n.

> Caption: For merge sort a = 2, b = 2, f(n) = n: height log2 n, leaves n, work n per level.

Exam-trap caption mode adds: *The exact solution carries a +n. The asymptotic answer hides it, and GATE sometimes asks for the exact value.*

## Scene 5. The three cases, computed

*2:00 – 2:30 · objective: Choose between leaves, levels and root by comparing f(n) with n^(log_b a), and check each case against an exact count at n = 256.*

**2:00–2:08** — Case one: the leaves dominate, when the combine cost is smaller than n to the log base b of a.

> Caption: Case one: the leaves dominate, when f(n) is smaller than n^(log_b a).

Exam-trap caption mode adds: *Case one is not "small f". It is f smaller than n^(log_b a) by a polynomial factor, which is a statement about exponents.*

**2:08–2:16** — Case two: every level costs the same, and the answer gains one factor of log n.

> Caption: Case two: every level costs the same, when f(n) is exactly n^(log_b a); the answer gains a factor of log n.

Exam-trap caption mode adds: *This is the case where the extra log appears. In the other two cases there is no extra log.*

**2:16–2:24** — Case three: the root dominates, and the answer is the combine cost itself.

> Caption: Case three: the root dominates, when f(n) is bigger; the answer is f(n).

Exam-trap caption mode adds: *Case three needs the regularity condition a·f(n/b) <= c·f(n) for some c < 1. It holds for polynomials and fails for some wild functions.*

**2:24–2:30** — At n equals 256: twenty-three hundred and four, one hundred thirty thousand, and thirty-three million. Each matches its closed form.

> Caption: Checked at n = 256: 2304, 130816 and 33488896, each matched to its closed form.

Exam-trap caption mode adds: *Two different recurrences giving the same number is a warning: 4T(n/2)+n and 2T(n/2)+n^2 are both n^2, by different cases.*

## Scene 6. Quicksort: the same shape, a different split

*2:30 – 3:00 · objective: Count quicksort comparisons exactly: n-1 per partition, n(n-1)/2 worst, and 2(n+1)H_n - 4n average, confirmed by enumerating every ordering.*

**2:30–2:38** — Quicksort divides around a pivot: n minus one comparisons, then two independent subproblems.

> Caption: Quicksort divides around a pivot: n-1 comparisons to partition, then two independent subproblems.

Exam-trap caption mode adds: *The pivot is not compared with itself, and it is not compared again in either subproblem.*

**2:38–2:46** — Sorted input with the first element as pivot gives the worst case: twenty-eight comparisons for eight elements.

> Caption: Sorted input with the first element as pivot gives the worst case: 28 comparisons for eight elements.

Exam-trap caption mode adds: *Reverse-sorted input is equally bad. "Already sorted" is not a safe input for a first-element pivot.*

**2:46–2:54** — The average is two n plus one times the harmonic number minus four n: sixteen point nine two, matching the enumeration.

> Caption: The average is 2(n+1)H_n - 4n: 16.92 for eight elements, which is what the enumeration gives.

Exam-trap caption mode adds: *An average over all inputs says nothing about the input you are given. Sorted data is not average data.*

**2:54–3:00** — Best thirteen, average sixteen point nine two, worst twenty-eight. Only the worst case is quadratic.

> Caption: Best 13, average 16.92, worst 28 — best and average are both n log n, the worst is not.

Exam-trap caption mode adds: *A balanced split needs a good pivot. Choosing the median of three, or at random, is what makes the good case likely.*

## Scene 7. Decrease and conquer

*3:00 – 3:30 · objective: Separate one subproblem from many: binary search takes floor(lg n) + 1 comparisons, and that is why it is log n and not n log n.*

**3:00–3:08** — Decrease and conquer keeps one subproblem. Binary search halves the range and discards the other half.

> Caption: Decrease and conquer keeps one subproblem: binary search halves the range and discards the rest.

Exam-trap caption mode adds: *Binary search is not divide and conquer. It is one recursive call, and its tree is a path, not a tree.*

**3:08–3:16** — The worst case is floor of log n plus one: four comparisons for any size from eight to fifteen.

> Caption: The worst case is floor(lg n) + 1 comparisons: 4 for every n from 8 to 15.

Exam-trap caption mode adds: *Ceiling and floor differ at powers of two. Count the levels and you cannot get it wrong.*

**3:16–3:24** — Divide keeps a subproblems, decrease keeps one. That one number is the gap between n log n and log n.

> Caption: Divide keeps a subproblems; decrease keeps one. That is the gap between n log n and log n.

Exam-trap caption mode adds: *A recursive program is not automatically divide and conquer. Count the recursive calls in the body.*

**3:24–3:30** — Quickselect is decrease and conquer with a partition: linear on average, quadratic in the worst case.

> Caption: Quickselect is decrease and conquer with a partition: expected linear, worst quadratic.

Exam-trap caption mode adds: *Expected linear is not linear. The worst case still exists, and a question that says "worst case" wants n^2.*

## Scene 8. Karatsuba: fewer subproblems, a smaller exponent

*3:30 – 4:00 · objective: See 3^k scalar products replace 4^k, and the exponent fall from 2 to log2 3 = 1.585, with the crossover computed rather than assumed.*

**3:30–3:38** — Schoolbook multiplication does four half-size products, so the recurrence is four T of n over two plus n.

> Caption: Multiplying two n-digit numbers: the schoolbook method does four half-size products.

Exam-trap caption mode adds: *Splitting alone does not help. Four subproblems of half the size is still n squared.*

**3:38–3:46** — Karatsuba does three products by adding first: three to the k against four to the k.

> Caption: Karatsuba does three, by adding before multiplying: 3^k products instead of 4^k.

Exam-trap caption mode adds: *The saving is in multiplications only. Karatsuba does more additions, which is why it is not faster at every size.*

**3:46–3:54** — The exponent falls from two to one point five eight five, and three to the k is exactly n to that power.

> Caption: The exponent falls from 2 to log2 3 = 1.585, and 3^k is exactly n^(log2 3).

Exam-trap caption mode adds: *log2 3 is about 1.585, not 1.5. Rounding the exponent changes the predicted work substantially.*

**3:54–4:00** — Under one unit per operation Karatsuba wins from n equals four and loses at n equals two. The crossover is a constant-factor question.

> Caption: Counting one unit per multiplication and per addition, Karatsuba wins from n = 4 and loses at n = 2.

Exam-trap caption mode adds: *An asymptotic improvement is not a promise at small n. The constant decides, and it must be computed, not assumed.*

## Scene 9. Four past papers, reproduced

*4:00 – 4:30 · objective: Reproduce the answers to GATE CSE 2019 Q25, 2015 Set 1, 2014 Set 2 and 2021 Set 2 from this page's own computations.*

**4:00–4:08** — Twenty nineteen, question twenty-five: the maximum subarray sum of fourteen numbers is twenty-nine.

> Caption: GATE CSE 2019 Q25: the maximum of S(i,j) over fourteen numbers, with divide and conquer allowed. The answer is 29.

Exam-trap caption mode adds: *S(i,j) is a contiguous sum. Summing the positive values gives 42, which is the subsequence reading, and it is wrong.*

**4:08–4:16** — The divide-and-conquer code returns twenty-nine, and brute force over all one hundred and five pairs agrees.

> Caption: The page's own divide-and-conquer code returns 29, and brute force over all 105 pairs agrees.

Exam-trap caption mode adds: *The crossing case is the part people forget. Best-left plus best-right is not the crossing sum.*

**4:16–4:24** — Twenty fifteen set one: the worst case is T of n minus one plus O of n, option B, and it solves to n squared.

> Caption: GATE CSE 2015 Set 1: the worst-case recurrence for quicksort is T(n) = T(n-1) + O(n), option B.

Exam-trap caption mode adds: *Two recursive calls of half size is the best case. Reading "quicksort" and writing the merge-sort recurrence is the classic error.*

**4:24–4:30** — Twenty fourteen: the recurrence sums a geometric series to three to the k plus one minus one over two, which is n to the one point five eight five.

> Caption: GATE CSE 2014 Set 2: T(2^k) = 3T(2^(k-1)) + 1 gives (3^(k+1) - 1)/2, which is Theta(3^k) = Theta(n^(log2 3)).

Exam-trap caption mode adds: *The recurrence is not in n. Substitute n = 2^k first, solve in k, then convert back, or the exponent comes out wrong.*

## Scene 10. The procedure and the five traps

*4:30 – 5:00 · objective: Fix the order of decisions — write the recurrence, count levels and leaves, compare with n^(log_b a), check the split, check the base case.*

**4:30–4:36** — Step one: name a, b and f of n, and write the recurrence before solving anything.

> Caption: Step one: name a, b and f(n), and write the recurrence before solving anything.

Exam-trap caption mode adds: *Solving a recurrence you did not derive is how a plausible-looking wrong answer appears.*

**4:36–4:42** — Step two: count the levels and the leaves, not the calls you can see in the code.

> Caption: Step two: count the levels and the leaves, not the calls you can see in the code.

Exam-trap caption mode adds: *Nodes and levels are different counts. Two to the level count is the node count.*

**4:42–4:48** — Step three: compare f of n with n to the log base b of a to pick the case.

> Caption: Step three: compare f(n) with n^(log_b a) to pick the case.

Exam-trap caption mode adds: *Case two needs exact equality up to a constant, not merely the same order of magnitude at one value of n.*

**4:48–4:54** — Step four: if the split can be unbalanced, the balanced recurrence is not the answer.

> Caption: Step four: if the split can be unbalanced, the balanced recurrence is not the answer.

Exam-trap caption mode adds: *A recurrence describes the worst case only if you write the worst split into it.*

**4:54–5:00** — Step five: check the base case and the exact count. An asymptotic answer hides the constant.

> Caption: Step five: check the base case and the exact count. An asymptotic answer hides the constant.

Exam-trap caption mode adds: *Theta(n log n) does not tell you 17. A NAT question asking for comparisons needs the exact count.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
