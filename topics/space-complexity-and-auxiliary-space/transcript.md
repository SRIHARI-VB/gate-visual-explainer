# Space Complexity And Auxiliary Space — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/space-complexity-and-auxiliary-space/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Space is a peak, not a total

*0:00 – 0:30 · objective: See that space counts the cells alive at the worst instant, not the work done over the run, by putting a recursive function beside an iterative one that makes the same number of calls.*

**0:00–0:07** — Two functions of the same n. Time asks how many steps. Space asks how many cells are alive at once.

> Caption: Two functions of the same n: time asks how many steps, space asks how many cells are alive at once.

**0:07–0:15** — The recursive sum holds n plus one frames at once, so its space is Theta of n, even though each frame is constant.

> Caption: sum(n) = n + sum(n − 1) holds n + 1 frames at once, so its space is Θ(n) even though each frame is constant.

**0:15–0:22** — The loop version makes the same n calls and never has two frames alive. Constant space.

> Caption: The loop version makes the same n calls and never has two frames alive: Θ(1) space.

**0:22–0:30** — So space is a peak, not a total. Find the worst instant, then count what is live at it.

> Caption: So: space is a peak, not a total. Find the worst instant, then count what is live at it.

## Scene 2. Total space and auxiliary space

*0:30 – 1:00 · objective: Split a space answer into the input and the addition, and see why only the auxiliary column separates two algorithms.*

**0:30–0:37** — Total space is the input plus everything the algorithm adds. Auxiliary space counts only the addition.

> Caption: Total space is the input plus everything the algorithm adds. Auxiliary space counts only the addition.

**0:37–0:45** — Every comparison sort has total space Theta of n, because the array is the input. That sentence separates nothing.

> Caption: Every comparison sort has total space Θ(n), because the array is the input. That sentence separates nothing.

**0:45–0:52** — Auxiliary space separates them. Insertion and heapsort hold a constant. Merge sort holds n cells. Quick sort holds its stack.

> Caption: Auxiliary space separates them: insertion and heapsort hold a constant, merge sort holds n cells, quick sort holds its stack.

**0:52–1:00** — When a paper writes space complexity it means total. When it writes extra space it means auxiliary. Read which one is asked.

> Caption: When GATE writes "space complexity" it means total; when it writes "extra space" it means auxiliary. Read which one is asked.

Exam-trap caption mode adds: *The trap: an option list may contain both n and 1 for merge sort, one being the total and one the auxiliary. Deciding which convention the question uses is part of the question.*

## Scene 3. GATE 2005 Q81a: two to the n calls, n plus one frames

*1:00 – 1:30 · objective: Run the 2005 function, count both quantities the question invites you to confuse, and get O(n).*

**1:00–1:07** — GATE 2005, question eighty one a. foo of n loops i from zero to n minus one, and calls foo of i inside the loop.

> Caption: GATE CSE 2005 Q81a: foo(n) loops i from 0 to n − 1 and calls foo(i) inside the loop.

**1:07–1:15** — The deepest chain is foo of n down to foo of zero. n plus one frames alive together.

> Caption: The deepest chain is foo(n) → foo(n − 1) → … → foo(0): n + 1 frames alive together.

**1:15–1:22** — It makes two to the n calls in all, two hundred and fifty six at n equals eight, while at most nine frames exist at any instant.

> Caption: It makes 2ⁿ calls in all — 256 of them at n = 8 — while at most 9 frames exist at any instant.

**1:22–1:30** — So the space is Theta of n, not Theta of two to the n. Counting calls over time is a time measurement.

> Caption: So the space is Θ(n), not Θ(2ⁿ). Counting calls over time is a time measurement.

Exam-trap caption mode adds: *O(n!) and nⁿ are the two options that punish counting calls rather than frames; both are larger than the correct O(n) and both are wrong for the same reason.*

## Scene 4. Space is the height of the call tree

*1:30 – 2:00 · objective: Separate the number of nodes in a call tree from its height, using naive Fibonacci.*

**1:30–1:37** — Naive Fibonacci calls itself twice per step. At n equals twenty that is twenty one thousand, eight hundred and ninety one calls.

> Caption: Naive Fibonacci calls itself twice per step. At n = 20 that is 21,891 calls.

**1:37–1:45** — Yet the stack never holds more than twenty frames. The right hand call begins only after the left one returns.

> Caption: Yet the stack never holds more than 20 frames: the right-hand call begins only after the left one returns.

**1:45–1:52** — Space is the height of the call tree, not the number of its nodes.

> Caption: Space is the height of the call tree, not the number of its nodes.

**1:52–2:00** — Time is two times F of n plus one, minus one. Space is n. At n equals thirty the ratio is about eighty nine thousand to one.

> Caption: Time is 2·F(n + 1) − 1 and space is n. At n = 30 the ratio is about 89,751 to 1.

Exam-trap caption mode adds: *An option list for this program will often include O(2ⁿ) as the space answer. It is the time answer wearing the wrong label.*

## Scene 5. Merge sort: a shallow stack and a big buffer

*2:00 – 2:30 · objective: Add the two components of a divide-and-conquer space answer and see which one dominates.*

**2:00–2:07** — Merge sort on one thousand and twenty four keys recurses eleven levels deep.

> Caption: Merge sort on 1,024 keys recurses 11 levels deep: ⌈log₂ 1,024⌉ + 1.

**2:07–2:15** — Its buffer holds one thousand and twenty four cells and its stack holds eleven frames. The peak is one thousand and thirty five cells, not eleven.

> Caption: Its buffer holds 1,024 cells and its stack holds 11 frames. The peak is 1,035 cells, not 11.

**2:15–2:22** — Peak equals buffer plus stack, which is n plus log n plus one. So the answer is Theta of n. The buffer decides it.

> Caption: Peak = buffer + stack = n + ⌈log₂ n⌉ + 1, so the answer is Θ(n) — the buffer decides it.

**2:22–2:30** — A shallow recursion does not mean a small space. Count both parts, then keep the larger.

> Caption: A shallow recursion does not mean a small space. Count both parts, then keep the larger.

## Scene 6. Quick sort's worst stack

*2:30 – 3:00 · objective: See an algorithm that sorts in place while holding a linear stack, and find what the pivot decides.*

**2:30–2:37** — Sorted input with the last element as pivot. Every partition splits off exactly one key.

> Caption: Sorted input with the last element as pivot: every partition splits off exactly one key.

**2:37–2:45** — At n equals sixty four the recursion goes sixty four levels deep and makes two thousand and sixteen comparisons.

> Caption: At n = 64 the recursion goes 64 levels deep and makes 2,016 comparisons, which is 64·63/2.

**2:45–2:52** — The array is sorted in place, but the stack is Theta of n. Both statements are true at once.

> Caption: The array is sorted in place — but the stack is Θ(n). Both statements are true at once.

**2:52–3:00** — With a median or random pivot the depth is logarithmic, so Theta of log n. The pivot decides the space as well as the time.

> Caption: With a median or random pivot the depth is ⌈log₂ n⌉ + 1, so Θ(log n). The pivot decides the space as well as the time.

Exam-trap caption mode adds: *Two different worst-case answers for quick sort circulate: O(n) for the plain recursive version and O(log n) for the version that recurses on the smaller half only. The question must say which version it means.*

## Scene 7. Three meanings of "in place"

*3:00 – 3:30 · objective: Name the three definitions in use and place each standard algorithm under one of them.*

**3:00–3:07** — In place is used for three different claims, and a question can turn on which one is meant.

> Caption: "In place" is used for three different claims, and a question can turn on which one is meant.

**3:07–3:15** — Strict constant space: insertion, selection, bubble, and heapsort with an iterative sift down.

> Caption: Strict O(1): insertion, selection, bubble, and heapsort with an iterative sift-down.

**3:15–3:22** — Loose logarithmic space: quick sort, and heapsort with a recursive sift down. The array is never copied.

> Caption: Loose O(log n): quick sort, and heapsort with a recursive sift-down. The array is never copied.

**3:22–3:30** — Merge sort is not in place for arrays, but is for linked lists, where the stack is all it needs.

> Caption: Merge sort is not in place for arrays — n cells — but is for linked lists, where the stack is all it needs.

## Scene 8. BFS holds a frontier, DFS holds a path

*3:30 – 4:00 · objective: Compute the two graph space quantities on one graph, and add the representation cost.*

**3:30–3:37** — Breadth first search holds a frontier. On this nine vertex graph the widest layer holds four vertices, so the queue is Theta of V.

> Caption: BFS holds a frontier. On this nine-vertex graph the widest layer holds 4 vertices, so the queue is Θ(V).

**3:37–3:45** — Depth first search holds a path. The deepest chain here is six vertices, and in general up to V.

> Caption: DFS holds a path. The deepest chain here is 6 vertices, and in general up to V.

**3:45–3:52** — Storing the graph: a matrix is eighty one cells here, a list is twenty five slots.

> Caption: Storing the graph: a matrix is V² = 81 cells here; a list is V + 2E = 25 slots.

**3:52–4:00** — A graph question space is the representation plus the frontier or the path, plus the visited set.

> Caption: A graph question's space is the representation plus the frontier or the path, plus the visited set.

## Scene 9. Space is a lever, not a given

*4:00 – 4:30 · objective: Watch one computation carry three different space answers, and see what each one buys.*

**4:00–4:07** — Memoising Fibonacci turns two to the n calls into n, and costs n cells to remember them.

> Caption: Memoising Fibonacci turns 2ⁿ calls into n, and costs n cells to remember them.

**4:07–4:15** — Longest common subsequence of two strings of a thousand: the full table is a million cells; two rolling rows are two thousand.

> Caption: Longest common subsequence of two strings of 1,000: the full table is 1,000,000 cells; two rolling rows are 2,000.

**4:15–4:22** — Floyd Warshall keeps V squared distances: ten thousand cells at a hundred vertices, and cubic time.

> Caption: Floyd–Warshall keeps V² distances: 10,000 cells at 100 vertices, and Θ(V³) time.

**4:22–4:30** — So space is a lever, not a given. The same computation has several space answers. Say which one you are quoting.

> Caption: So space is a lever, not a given. The same computation has several space answers; say which one you are quoting.

## Scene 10. The routine and the four traps

*4:30 – 5:00 · objective: Leave with a three-step routine that produces an answer, and the four slips that produce the wrong one.*

**4:30–4:37** — Step one: fix the model. One cell is one word, one frame is a constant number of words.

> Caption: Step 1: fix the model — one cell is one word, one frame is a constant number of words.

**4:37–4:45** — Step two: add what is live at the worst instant. Buffers, frontier or path, and stack depth.

> Caption: Step 2: add what is live at the worst instant — buffers, frontier or path, and stack depth.

**4:45–4:52** — Step three: separate input from auxiliary, and answer the one the question asked for.

> Caption: Step 3: separate input from auxiliary, and answer the one the question asked for.

**4:52–5:00** — The four traps: calls counted over time, tree size for tree height, in place for constant, total for auxiliary.

> Caption: The four traps: calls counted over time, tree size for tree height, in place for constant, total for auxiliary.

Exam-trap caption mode adds: *A fifth slip is arithmetic rather than conceptual: forgetting the +1 in ⌈log₂ n⌉ + 1, which turns 11 into 10 for 1,024 keys.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
