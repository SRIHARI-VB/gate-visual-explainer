/* ==========================================================================
   space-complexity-and-auxiliary-space — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas, so the two agree by construction.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'peak', n: 1,
      title: 'Space is a peak, not a total',
      start: 0, end: 30,
      objective: 'See that space counts the cells alive at the worst instant, not the work done over the run, by putting a recursive function beside an iterative one that makes the same number of calls.'
    },
    {
      id: 'whatcounts', n: 2,
      title: 'Total space and auxiliary space',
      start: 30, end: 60,
      objective: 'Split a space answer into the input and the addition, and see why only the auxiliary column separates two algorithms.'
    },
    {
      id: 'frames', n: 3,
      title: 'GATE 2005 Q81a: two to the n calls, n plus one frames',
      start: 60, end: 90,
      objective: 'Run the 2005 function, count both quantities the question invites you to confuse, and get O(n).'
    },
    {
      id: 'shape', n: 4,
      title: 'Space is the height of the call tree',
      start: 90, end: 120,
      objective: 'Separate the number of nodes in a call tree from its height, using naive Fibonacci.'
    },
    {
      id: 'divide', n: 5,
      title: 'Merge sort: a shallow stack and a big buffer',
      start: 120, end: 150,
      objective: 'Add the two components of a divide-and-conquer space answer and see which one dominates.'
    },
    {
      id: 'quick', n: 6,
      title: "Quick sort's worst stack",
      start: 150, end: 180,
      objective: 'See an algorithm that sorts in place while holding a linear stack, and find what the pivot decides.'
    },
    {
      id: 'inplace', n: 7,
      title: 'Three meanings of "in place"',
      start: 180, end: 210,
      objective: 'Name the three definitions in use and place each standard algorithm under one of them.'
    },
    {
      id: 'graphs', n: 8,
      title: 'BFS holds a frontier, DFS holds a path',
      start: 210, end: 240,
      objective: 'Compute the two graph space quantities on one graph, and add the representation cost.'
    },
    {
      id: 'trade', n: 9,
      title: 'Space is a lever, not a given',
      start: 240, end: 270,
      objective: 'Watch one computation carry three different space answers, and see what each one buys.'
    },
    {
      id: 'procedure', n: 10,
      title: 'The routine and the four traps',
      start: 270, end: 300,
      objective: 'Leave with a three-step routine that produces an answer, and the four slips that produce the wrong one.'
    }
  ],

  events: [

    /* ---------- scene 1: peak ---------- */
    { id: 's1-1', scene: 'peak', start: 0, end: 7.5,
      caption: 'Two functions of the same n: time asks how many steps, space asks how many cells are alive at once.',
      detail: 'Time complexity counts the work done over the whole run. Space complexity counts the memory occupied at the single worst instant. A run that touches a million cells one at a time and lets each go before the next may need constant space. A run that touches only n cells but holds all n at once needs linear space. The two questions are answered by different measurements of the same execution.',
      narration: 'Two functions of the same n. Time asks how many steps. Space asks how many cells are alive at once.',
      keyword: 'alive at once' },

    { id: 's1-2', scene: 'peak', start: 7.5, end: 15,
      caption: 'sum(n) = n + sum(n − 1) holds n + 1 frames at once, so its space is Θ(n) even though each frame is constant.',
      detail: 'The recursive sum cannot finish its own frame until the call below it returns, so every frame on the chain stays alive. For an input of n the chain is sum(n), sum(n−1), …, sum(0): n + 1 frames. Each frame is a constant number of words, so the space is c(n + 1), which is Θ(n). The time is also Θ(n) — but for a different reason, and the two answers must be argued separately.',
      narration: 'The recursive sum holds n plus one frames at once, so its space is Theta of n, even though each frame is constant.',
      keyword: 'n + 1 frames' },

    { id: 's1-3', scene: 'peak', start: 15, end: 22.5,
      caption: 'The loop version makes the same n calls and never has two frames alive: Θ(1) space.',
      detail: 'A loop that calls a helper n times creates n frames over the run, but each one returns before the next begins. At no instant are two alive, so the peak is one frame. This is the distinction the whole lesson rests on: the number of calls made over time is a time quantity, and the number of calls alive together is a space quantity.',
      narration: 'The loop version makes the same n calls and never has two frames alive. Constant space.',
      keyword: 'never has two frames alive' },

    { id: 's1-4', scene: 'peak', start: 22.5, end: 30,
      caption: 'So: space is a peak, not a total. Find the worst instant, then count what is live at it.',
      detail: 'The procedure that follows from this is short. Find the moment at which the most memory is occupied. Count what is occupied at that moment — buffers, arrays, queues, and every stack frame still waiting. Ignore everything that has already been freed. That count, as a function of the input size, is the space complexity.',
      narration: 'So space is a peak, not a total. Find the worst instant, then count what is live at it.',
      keyword: 'a peak, not a total' },

    /* ---------- scene 2: whatcounts ---------- */
    { id: 's2-1', scene: 'whatcounts', start: 30, end: 37.5,
      caption: 'Total space is the input plus everything the algorithm adds. Auxiliary space counts only the addition.',
      detail: 'Two conventions exist and both are used in print. Total space complexity includes the memory that holds the input. Auxiliary space complexity counts only the memory the algorithm allocates for itself, beyond that input. Neither is wrong; they answer different questions, and a question that does not say which one it means is answered by naming your convention and using it consistently.',
      narration: 'Total space is the input plus everything the algorithm adds. Auxiliary space counts only the addition.',
      keyword: 'input plus everything' },

    { id: 's2-2', scene: 'whatcounts', start: 37.5, end: 45,
      caption: 'Every comparison sort has total space Θ(n), because the array is the input. That sentence separates nothing.',
      detail: 'An array of n keys occupies n cells before the algorithm starts. So the total space of every sort that works on an array of n keys is at least Θ(n), whatever the algorithm does. A comparison on total space therefore cannot distinguish insertion sort from merge sort. This is why the auxiliary column exists, and why a question about "extra space" is asking the sharper question.',
      narration: 'Every comparison sort has total space Theta of n, because the array is the input. That sentence separates nothing.',
      keyword: 'separates nothing' },

    { id: 's2-3', scene: 'whatcounts', start: 45, end: 52.5,
      caption: 'Auxiliary space separates them: insertion and heapsort hold a constant, merge sort holds n cells, quick sort holds its stack.',
      detail: 'Insertion sort and selection sort move keys inside the given array and need a constant number of variables, so their auxiliary space is Θ(1). Merge sort needs a second array of n cells to merge into, so its auxiliary space is Θ(n). Quick sort partitions inside the array and needs no buffer at all, but its recursion holds a stack whose depth depends on the pivot — Θ(log n) on balanced splits and Θ(n) on the worst split.',
      narration: 'Auxiliary space separates them. Insertion and heapsort hold a constant. Merge sort holds n cells. Quick sort holds its stack.',
      keyword: 'Auxiliary space separates them' },

    { id: 's2-4', scene: 'whatcounts', start: 52.5, end: 60,
      caption: 'When GATE writes "space complexity" it means total; when it writes "extra space" it means auxiliary. Read which one is asked.',
      detail: 'The 2027 syllabus clause says "asymptotic worst case time and space complexity" and does not fix a convention, so a question must supply its own. Questions that intend auxiliary usually say "extra", "additional" or "auxiliary". Questions that intend total say "space" plainly. If a question supplies neither, compute the auxiliary space, state that you have done so, and note that the total differs only by the input term.',
      narration: 'When a paper writes space complexity it means total. When it writes extra space it means auxiliary. Read which one is asked.',
      keyword: 'Read which one is asked',
      trap: 'The trap: an option list may contain both n and 1 for merge sort, one being the total and one the auxiliary. Deciding which convention the question uses is part of the question.' },

    /* ---------- scene 3: frames ---------- */
    { id: 's3-1', scene: 'frames', start: 60, end: 67.5,
      caption: 'GATE CSE 2005 Q81a: foo(n) loops i from 0 to n − 1 and calls foo(i) inside the loop.',
      detail: 'The function is double foo(int n) { int i; double sum; if (n == 0) return 1.0; sum = 0.0; for (i = 0; i < n; i++) sum += foo(i); return sum; }. The question asks for the space complexity of this code. Everything the answer needs is in the shape of the call: one frame alive per level of the chain, and the chain is what has to be measured.',
      narration: 'GATE 2005, question eighty one a. foo of n loops i from zero to n minus one, and calls foo of i inside the loop.',
      keyword: 'foo(n) loops' },

    { id: 's3-2', scene: 'frames', start: 67.5, end: 75,
      caption: 'The deepest chain is foo(n) → foo(n − 1) → … → foo(0): n + 1 frames alive together.',
      detail: 'Inside foo(k) the loop calls foo(0), then foo(1), and so on. Each of those returns before the next is called, so they never overlap. The overlap happens down the chain: foo(k) is still alive when it calls foo(k−1), which is still alive when it calls foo(k−2). The longest such chain is n + 1 frames deep, reached by following the last iteration every time.',
      narration: 'The deepest chain is foo of n down to foo of zero. n plus one frames alive together.',
      keyword: 'n + 1 frames alive together' },

    { id: 's3-3', scene: 'frames', start: 75, end: 82.5,
      caption: 'It makes 2ⁿ calls in all — 256 of them at n = 8 — while at most 9 frames exist at any instant.',
      detail: 'The total number of calls satisfies C(0) = 1 and C(n) = 1 + C(0) + C(1) + … + C(n−1), which solves to C(n) = 2ⁿ. At n = 8 that is 256 calls. The page computes both quantities by running the recursion, and the two numbers are wildly different: 256 frames created over the run, 9 alive at the peak. Only the second is a space quantity.',
      narration: 'It makes two to the n calls in all, two hundred and fifty six at n equals eight, while at most nine frames exist at any instant.',
      keyword: '256 of them at n = 8' },

    { id: 's3-4', scene: 'frames', start: 82.5, end: 90,
      caption: 'So the space is Θ(n), not Θ(2ⁿ). Counting calls over time is a time measurement.',
      detail: 'The published key for this question is O(n), and the reasoning is exactly the one just given: local variables only, so the space is the depth of the recursion, and the depth is n + 1. The tempting wrong answer is O(2ⁿ), produced by counting the calls instead of the frames. A call that has already returned occupies nothing.',
      narration: 'So the space is Theta of n, not Theta of two to the n. Counting calls over time is a time measurement.',
      keyword: 'not Θ(2ⁿ)',
      trap: 'O(n!) and nⁿ are the two options that punish counting calls rather than frames; both are larger than the correct O(n) and both are wrong for the same reason.' },

    /* ---------- scene 4: shape ---------- */
    { id: 's4-1', scene: 'shape', start: 90, end: 97.5,
      caption: 'Naive Fibonacci calls itself twice per step. At n = 20 that is 21,891 calls.',
      detail: 'The function fib(n) returns n for n < 2 and otherwise returns fib(n−1) + fib(n−2). The number of calls satisfies C(n) = C(n−1) + C(n−2) + 1 with C(0) = C(1) = 1, which gives C(n) = 2·F(n+1) − 1 where F is the Fibonacci sequence. At n = 20 that is 21,891. The page enumerates the calls and checks the closed form against the enumeration.',
      narration: 'Naive Fibonacci calls itself twice per step. At n equals twenty that is twenty one thousand, eight hundred and ninety one calls.',
      keyword: '21,891 calls' },

    { id: 's4-2', scene: 'shape', start: 97.5, end: 105,
      caption: 'Yet the stack never holds more than 20 frames: the right-hand call begins only after the left one returns.',
      detail: 'The evaluation order is fixed: fib(n−1) is computed to completion, its whole subtree of frames is released, and only then is fib(n−2) called. So the frames alive at any instant lie on one root-to-leaf path, and the longest path is n long. Twenty frames at n = 20, not twenty-one thousand.',
      narration: 'Yet the stack never holds more than twenty frames. The right hand call begins only after the left one returns.',
      keyword: 'never holds more than 20 frames' },

    { id: 's4-3', scene: 'shape', start: 105, end: 112.5,
      caption: 'Space is the height of the call tree, not the number of its nodes.',
      detail: 'This is the general rule for recursion. The number of nodes in the call tree is the number of calls, which is a time quantity. The height of the tree is the maximum number of frames alive together, which is the space quantity. A tree can be enormous and shallow, or tiny and deep; the two numbers move independently, and only the height enters the space answer.',
      narration: 'Space is the height of the call tree, not the number of its nodes.',
      keyword: 'height of the call tree' },

    { id: 's4-4', scene: 'shape', start: 112.5, end: 120,
      caption: 'Time is 2·F(n + 1) − 1 and space is n. At n = 30 the ratio is about 89,751 to 1.',
      detail: 'At n = 30 the call count is 2,692,537 and the frame count is 30, a ratio of 89,751 to 1. The exponential lives entirely in the time answer. This is the cleanest example in the syllabus of two answers to one program that are not even the same order of magnitude, and it is why "the recursion is exponential, so the space is exponential" is a mistake worth naming.',
      narration: 'Time is two times F of n plus one, minus one. Space is n. At n equals thirty the ratio is about eighty nine thousand to one.',
      keyword: '89,751 to 1',
      trap: 'An option list for this program will often include O(2ⁿ) as the space answer. It is the time answer wearing the wrong label.' },

    /* ---------- scene 5: divide ---------- */
    { id: 's5-1', scene: 'divide', start: 120, end: 127.5,
      caption: 'Merge sort on 1,024 keys recurses 11 levels deep: ⌈log₂ 1,024⌉ + 1.',
      detail: 'Each level halves the interval, so the number of levels is the number of halvings needed to reach a single element, plus one for the level that holds the whole array. For 1,024 keys that is 10 + 1 = 11. The page computes this by actually splitting and checks it against ⌈log₂ n⌉ + 1 for every n up to 256, including the non-powers of two where the ceiling matters.',
      narration: 'Merge sort on one thousand and twenty four keys recurses eleven levels deep.',
      keyword: '11 levels deep' },

    { id: 's5-2', scene: 'divide', start: 127.5, end: 135,
      caption: 'Its buffer holds 1,024 cells and its stack holds 11 frames. The peak is 1,035 cells, not 11.',
      detail: 'The merge step needs somewhere to put the merged run. A standard implementation allocates one buffer of n cells and reuses it at every level, so the buffer contributes n = 1,024. The stack contributes 11 frames, each of a constant number of words. Both are alive at the same time — the deepest frame is merging while the outer frames wait — so the peak is the sum.',
      narration: 'Its buffer holds one thousand and twenty four cells and its stack holds eleven frames. The peak is one thousand and thirty five cells, not eleven.',
      keyword: '1,035 cells' },

    { id: 's5-3', scene: 'divide', start: 135, end: 142.5,
      caption: 'Peak = buffer + stack = n + ⌈log₂ n⌉ + 1, so the answer is Θ(n) — the buffer decides it.',
      detail: 'Adding a logarithmic term to a linear one does not change the order: n + log n is Θ(n). So the auxiliary space of array merge sort is Θ(n), and the recursion depth, though real and countable, is not what determines the answer. A student who quotes Θ(log n) for merge sort has counted the stack and forgotten the buffer.',
      narration: 'Peak equals buffer plus stack, which is n plus log n plus one. So the answer is Theta of n. The buffer decides it.',
      keyword: 'the buffer decides it' },

    { id: 's5-4', scene: 'divide', start: 142.5, end: 150,
      caption: 'A shallow recursion does not mean a small space. Count both parts, then keep the larger.',
      detail: 'The same structure appears in every divide-and-conquer algorithm: a recursion depth that is usually logarithmic, and a working set that may be linear or quadratic. Both are part of the peak, and after the addition the larger term survives. Quoting only the depth is the commonest way to under-report a space answer.',
      narration: 'A shallow recursion does not mean a small space. Count both parts, then keep the larger.',
      keyword: 'Count both parts' },

    /* ---------- scene 6: quick ---------- */
    { id: 's6-1', scene: 'quick', start: 150, end: 157.5,
      caption: 'Sorted input with the last element as pivot: every partition splits off exactly one key.',
      detail: 'With the last element as pivot and an already-sorted array, the pivot is the largest key, so the partition puts everything else to its left and nothing to its right. The recursive call on the right is empty and the call on the left has n − 1 keys. The recursion therefore forms a chain rather than a balanced tree, and the chain is as long as the array.',
      narration: 'Sorted input with the last element as pivot. Every partition splits off exactly one key.',
      keyword: 'splits off exactly one key' },

    { id: 's6-2', scene: 'quick', start: 157.5, end: 165,
      caption: 'At n = 64 the recursion goes 64 levels deep and makes 2,016 comparisons, which is 64·63/2.',
      detail: 'The page runs the partition on a sorted array of 64 keys and records both numbers. Comparisons: the first call makes 63, the next 62, and so on down to 1, totalling 2,016 = 64·63/2, which is the quadratic worst case. Depth: 64, one frame per key removed. Time and space are both worst case here, and for the same structural reason.',
      narration: 'At n equals sixty four the recursion goes sixty four levels deep and makes two thousand and sixteen comparisons.',
      keyword: '64 levels deep' },

    { id: 's6-3', scene: 'quick', start: 165, end: 172.5,
      caption: 'The array is sorted in place — but the stack is Θ(n). Both statements are true at once.',
      detail: 'Quick sort needs no second array: it moves keys inside the given array, so its buffer is constant. Its recursion, however, holds one frame per level, and on this input the level count is n. So the auxiliary space is Θ(n) in the worst case even though the algorithm is "in place" in the sense of not copying the array. A question can test either statement.',
      narration: 'The array is sorted in place, but the stack is Theta of n. Both statements are true at once.',
      keyword: 'the stack is Θ(n)' },

    { id: 's6-4', scene: 'quick', start: 172.5, end: 180,
      caption: 'With a median or random pivot the depth is ⌈log₂ n⌉ + 1, so Θ(log n). The pivot decides the space as well as the time.',
      detail: 'A balanced split halves the interval at each level, so the depth is logarithmic and the stack is Θ(log n). This is why quick sort is normally described as needing O(log n) auxiliary space: the average case is assumed. Recurse on the smaller side and loop on the larger, and the worst case also becomes O(log n), at the cost of a slightly more complex implementation.',
      narration: 'With a median or random pivot the depth is logarithmic, so Theta of log n. The pivot decides the space as well as the time.',
      keyword: 'The pivot decides the space',
      trap: 'Two different worst-case answers for quick sort circulate: O(n) for the plain recursive version and O(log n) for the version that recurses on the smaller half only. The question must say which version it means.' },

    /* ---------- scene 7: inplace ---------- */
    { id: 's7-1', scene: 'inplace', start: 180, end: 187.5,
      caption: '"In place" is used for three different claims, and a question can turn on which one is meant.',
      detail: 'The phrase appears in three senses. Strict: the algorithm uses O(1) auxiliary space. Loose: it uses O(log n) auxiliary space, usually a recursion stack, and the array itself is never copied. Informal: it sorts the array you gave it rather than returning a new one. Under the third sense even a merge sort that allocates a buffer is sometimes called in place, which is why the phrase alone is not a specification.',
      narration: 'In place is used for three different claims, and a question can turn on which one is meant.',
      keyword: 'three different claims' },

    { id: 's7-2', scene: 'inplace', start: 187.5, end: 195,
      caption: 'Strict O(1): insertion, selection, bubble, and heapsort with an iterative sift-down.',
      detail: 'Each of these moves keys inside the array using a constant number of variables. Heapsort qualifies only if the sift-down is written as a loop: the recursive version holds log n frames and is therefore O(log n), not O(1). That single implementation detail changes the answer, which is exactly the kind of thing a well-set question fixes in its wording.',
      narration: 'Strict constant space: insertion, selection, bubble, and heapsort with an iterative sift down.',
      keyword: 'Strict O(1)' },

    { id: 's7-3', scene: 'inplace', start: 195, end: 202.5,
      caption: 'Loose O(log n): quick sort, and heapsort with a recursive sift-down. The array is never copied.',
      detail: 'These algorithms do not allocate an array proportional to the input, but their recursion does hold a logarithmic stack. Many textbooks call them in place because the input array is the only array. The distinction matters in a question that offers both O(1) and O(log n) as options: the answer depends on whether the stack is being counted, and it always should be.',
      narration: 'Loose logarithmic space: quick sort, and heapsort with a recursive sift down. The array is never copied.',
      keyword: 'Loose O(log n)' },

    { id: 's7-4', scene: 'inplace', start: 202.5, end: 210,
      caption: 'Merge sort is not in place for arrays — n cells — but is for linked lists, where the stack is all it needs.',
      detail: 'Merging two sorted linked lists needs no buffer: the links are rewired, so the only extra space is the recursion, Θ(log n), or Θ(1) for a bottom-up implementation. So the same algorithm has two space answers depending on the representation of the input. A question that does not say array or list has not fully specified the answer.',
      narration: 'Merge sort is not in place for arrays, but is for linked lists, where the stack is all it needs.',
      keyword: 'not in place for arrays' },

    /* ---------- scene 8: graphs ---------- */
    { id: 's8-1', scene: 'graphs', start: 210, end: 217.5,
      caption: 'BFS holds a frontier. On this nine-vertex graph the widest layer holds 4 vertices, so the queue is Θ(V).',
      detail: 'Breadth-first search keeps a queue of discovered but unprocessed vertices. The queue is never wider than the widest layer of the graph, and no layer can hold more than V vertices, so the queue is O(V) whatever the graph. On the graph drawn here — one hub of degree four with a chain hanging off it — the widest layer is the hub\'s four neighbours, so the peak is 4.',
      narration: 'Breadth first search holds a frontier. On this nine vertex graph the widest layer holds four vertices, so the queue is Theta of V.',
      keyword: 'widest layer holds 4' },

    { id: 's8-2', scene: 'graphs', start: 217.5, end: 225,
      caption: 'DFS holds a path. The deepest chain here is 6 vertices, and in general up to V.',
      detail: 'Depth-first search keeps one frame per vertex on the current path, so its stack is as deep as the longest simple path it happens to follow — up to V on a graph that is one long chain. Here the hub is explored first, its three leaf neighbours return immediately, and the fourth leads down a chain of five more vertices, giving a peak of 6 frames. Both traversals are O(V) in space, and for different reasons.',
      narration: 'Depth first search holds a path. The deepest chain here is six vertices, and in general up to V.',
      keyword: 'deepest chain here is 6' },

    { id: 's8-3', scene: 'graphs', start: 225, end: 232.5,
      caption: 'Storing the graph: a matrix is V² = 81 cells here; a list is V + 2E = 25 slots.',
      detail: 'An adjacency matrix always costs V² cells, whether the graph is dense or empty. An adjacency list costs one head per vertex plus one entry per edge endpoint, which for an undirected graph is V + 2E. With 9 vertices and 8 edges that is 81 against 25. The matrix wins only when E is close to V², which is why the choice is itself a space question with a computable crossover.',
      narration: 'Storing the graph: a matrix is eighty one cells here, a list is twenty five slots.',
      keyword: '81 against 25' },

    { id: 's8-4', scene: 'graphs', start: 232.5, end: 240,
      caption: "A graph question's space is the representation plus the frontier or the path, plus the visited set.",
      detail: 'Three terms, all countable: the representation (V² or V + 2E), the traversal structure (a queue of up to V, or a stack of up to V), and the visited array of V flags. Which of them dominates depends on the representation: with a matrix the V² term wins, with a list the V + E term wins. Quoting only the traversal structure under-reports the answer for a matrix.',
      narration: 'A graph question space is the representation plus the frontier or the path, plus the visited set.',
      keyword: 'representation plus the frontier' },

    /* ---------- scene 9: trade ---------- */
    { id: 's9-1', scene: 'trade', start: 240, end: 247.5,
      caption: 'Memoising Fibonacci turns 2ⁿ calls into n, and costs n cells to remember them.',
      detail: 'Storing each computed value in an array of n + 1 cells makes every subproblem be solved once, so the call count becomes Θ(n) and the time becomes Θ(n). The space becomes Θ(n) as well — the table, plus a stack of depth n unless the recursion is converted to a loop. Bottom-up, with only the last two values kept, the space returns to Θ(1) while the time stays Θ(n).',
      narration: 'Memoising Fibonacci turns two to the n calls into n, and costs n cells to remember them.',
      keyword: 'costs n cells' },

    { id: 's9-2', scene: 'trade', start: 247.5, end: 255,
      caption: 'Longest common subsequence of two strings of 1,000: the full table is 1,000,000 cells; two rolling rows are 2,000.',
      detail: 'The recurrence for LCS refers to the previous row and the current row only, so the whole table is never needed. Keeping two rows of min(m, n) cells reduces 1,000,000 cells to 2,000 — a factor of 500 — with no change in time. If the subsequence itself must be reconstructed, a different technique is needed, and that is the price of the saving.',
      narration: 'Longest common subsequence of two strings of a thousand: the full table is a million cells; two rolling rows are two thousand.',
      keyword: 'two rolling rows are 2,000' },

    { id: 's9-3', scene: 'trade', start: 255, end: 262.5,
      caption: 'Floyd–Warshall keeps V² distances: 10,000 cells at 100 vertices, and Θ(V³) time.',
      detail: 'The algorithm updates a matrix of all-pairs distances in place, one intermediate vertex at a time, so its space is exactly V² and cannot be rolled the way LCS can — every entry is read again at the next intermediate. At 100 vertices that is 10,000 cells against 1,000,000 for a matrix of paths. Time is Θ(V³), which is 1,000,000 steps at the same size.',
      narration: 'Floyd Warshall keeps V squared distances: ten thousand cells at a hundred vertices, and cubic time.',
      keyword: 'V² distances' },

    { id: 's9-4', scene: 'trade', start: 262.5, end: 270,
      caption: 'So space is a lever, not a given. The same computation has several space answers; say which one you are quoting.',
      detail: 'One problem, several algorithms, several space answers: naive Fibonacci Θ(n), memoised Θ(n), bottom-up with two variables Θ(1). A space question is therefore never answered by naming the problem; it is answered by naming the algorithm and counting its peak. When a question offers two space bounds for the same problem, it is usually asking which technique achieves which.',
      narration: 'So space is a lever, not a given. The same computation has several space answers. Say which one you are quoting.',
      keyword: 'a lever, not a given' },

    /* ---------- scene 10: procedure ---------- */
    { id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Step 1: fix the model — one cell is one word, one frame is a constant number of words.',
      detail: 'Without a model the arithmetic is arbitrary. The standard model charges one unit per word stored, and a constant per activation record, ignoring the actual byte count of a compiler. Under that model "constant space" means a number of cells independent of n. State the model in one line and every later step is arithmetic rather than opinion.',
      narration: 'Step one: fix the model. One cell is one word, one frame is a constant number of words.',
      keyword: 'fix the model' },

    { id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step 2: add what is live at the worst instant — buffers, frontier or path, and stack depth.',
      detail: 'List the three kinds of live memory and count each: arrays and buffers the algorithm allocates, any queue, stack or set it maintains, and the recursion depth times the frame size. Then add them, because they coexist. Do not add anything that has already been released, and do not multiply the depth by the number of calls.',
      narration: 'Step two: add what is live at the worst instant. Buffers, frontier or path, and stack depth.',
      keyword: 'live at the worst instant' },

    { id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step 3: separate input from auxiliary, and answer the one the question asked for.',
      detail: 'The input is Θ(n) for an array of n keys, Θ(V²) for a matrix, Θ(n + m) for two strings. Add it if the question asks for total space; leave it out if it asks for extra or auxiliary space. Then simplify: keep the largest term and drop constants, exactly as in a time answer.',
      narration: 'Step three: separate input from auxiliary, and answer the one the question asked for.',
      keyword: 'separate input from auxiliary' },

    { id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'The four traps: calls counted over time, tree size for tree height, in place for constant, total for auxiliary.',
      detail: 'Each trap produces a specific wrong option. Counting calls gives 2ⁿ where n was wanted. Reading the tree size instead of its height does the same. Treating "in place" as a promise of constant space hides quick sort\'s stack. And answering total space when auxiliary was asked turns a sharp comparison into a constant one. Naming the trap is usually enough to avoid it.',
      narration: 'The four traps: calls counted over time, tree size for tree height, in place for constant, total for auxiliary.',
      keyword: 'The four traps',
      trap: 'A fifth slip is arithmetic rather than conceptual: forgetting the +1 in ⌈log₂ n⌉ + 1, which turns 11 into 10 for 1,024 keys.' }
  ]
};
