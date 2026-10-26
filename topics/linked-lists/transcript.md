# Linked Lists — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/linked-lists/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A node is a value plus the address of the next one

*0:00 – 0:30 · objective: See that a linked list replaces index arithmetic with a stored address, and name the one cost and the one gain that follow.*

**0:00–0:07** — An array is one block, and the address of element i is arithmetic. A linked list is not a block at all.

> Caption: An array is one block, and the address of element i is arithmetic. A linked list is not a block at all.

Exam-trap caption mode adds: *Do not picture a linked list as boxes drawn in a row. The row in the drawing is a convention; in memory the nodes can be in any order, and the drawing usually puts them in the order the links visit them.*

**0:07–0:15** — Each element is a node. It holds a value and the address of the next node. Following that address is called a link.

> Caption: Each element is a node: it holds a value and the address of the next node. Following that address is called a link.

Exam-trap caption mode adds: *A link is not "the next index". Index arithmetic is what the array does; the list stores the address, which is why the address can be anything.*

**0:15–0:23** — So reaching the k-th node costs k link reads, not one multiplication. Random access becomes a walk.

> Caption: So reaching the k-th node costs k link reads, not one multiplication. Random access becomes a walk.

Exam-trap caption mode adds: *The trade is not "lists are faster". A list is faster only for the operations that change links near a place you already hold. It is slower for everything that needs to arrive somewhere.*

**0:23–0:30** — The list is not an object in memory. It is a head pointer plus whatever chain of nodes that pointer reaches.

> Caption: The list is not an object in memory. It is a head pointer plus whatever chain of nodes that pointer reaches.

Exam-trap caption mode adds: *A linked list has no length field unless you add one. Counting the nodes, printing them, and freeing them all cost a full walk, and all three need a stopping rule.*

## Scene 2. The node in C, and what it does not store

*0:30 – 1:00 · objective: Read the self-referential struct, the NULL terminator, and the padding, then say where the length lives (nowhere).*

**0:30–0:37** — A struct may hold a pointer to its own type, but not an object of its own type.

> Caption: struct node { int data; struct node *next; } — a struct may hold a pointer to its own type, but not an object of its own type.

Exam-trap caption mode adds: *The struct tag must be repeated inside the member: struct node *next. Writing node *next inside the definition works only if a typedef of that name already exists.*

**0:37–0:45** — The next field holds an address, or NULL. NULL ends the list. The empty list is head equals NULL, and the last node points at nothing.

> Caption: The next field holds an address, or NULL. NULL ends the list: the empty list is head == NULL, and the last node points at nothing.

Exam-trap caption mode adds: *An empty list and a list of one node are different states, and a function that treats them alike usually crashes on one of them. Test head == NULL before touching head->next.*

**0:45–0:53** — The size of a node is not the sum of its members. The compiler inserts padding so the pointer starts at an aligned address.

> Caption: sizeof of the node is not the sum of the members: the compiler inserts padding so the pointer starts at an aligned address.

Exam-trap caption mode adds: *The standard fixes only the order of the members and guarantees no padding before the first one. Any arithmetic on sizeof(struct node) is a bet on one ABI, which is why a question that needs it states the sizes.*

**0:53–1:00** — Nothing stores the length. So counting the nodes costs a walk, unless you keep a separate count, which is a design choice with its own cost.

> Caption: Nothing stores the length. So counting the nodes costs a walk — unless you keep a separate count, which is a design choice with its own cost.

Exam-trap caption mode adds: *A question that asks for the length of a linked list in constant time is asking about a different data structure. Say so rather than inventing a stored length.*

## Scene 3. Pointer surgery: insert after, delete after

*1:00 – 1:30 · objective: Write the two assignments in the safe order, then trace GATE 1998 by addresses rather than by arrows.*

**1:00–1:07** — Inserting after p needs no search and no shifting. Set x next to p next, then set p next to x. Two assignments.

> Caption: Inserting after p needs no search and no shifting: x->next = p->next, then p->next = x. Two assignments.

Exam-trap caption mode adds: *The order is not a style preference. Writing p->next = x first overwrites the only pointer to the rest of the list, and the tail becomes unreachable — a leak, not a compile error.*

**1:07–1:15** — GATE 1998 asked what four assignments do. They swap the two nodes that follow p.

> Caption: GATE 1998 asked what four assignments do: q = p->next; p->next = q->next; q->next = (q->next)->next; (p->next)->next = q.

Exam-trap caption mode adds: *The fourth line reads (p->next)->next, not p->next. By then p->next is the node that was third, so the target is the field after it. Reading the line lazily is how the wrong option looks right.*

**1:15–1:23** — Trace with addresses, not arrows. Give each node a number, write the field values, and the swap becomes four overwrites.

> Caption: Trace with addresses, not arrows. Give each node a number, write the field values, and the swap becomes four overwrites.

Exam-trap caption mode adds: *Arrow diagrams are drawn in the final order, so they show the answer rather than the process. Only the addresses show which field is written when.*

**1:23–1:30** — Deleting after p is one assignment, but save the victim first or the memory leaks. Deleting p itself is the harder problem.

> Caption: Deleting after p is one assignment, but save the victim first or the memory leaks. Deleting p itself is the harder problem.

Exam-trap caption mode adds: *Unlinking is not deleting. In a garbage-collected language the distinction is invisible; in C the leak is the bug, and a question about freeing memory is testing exactly this.*

## Scene 4. The head pointer is the list

*1:30 – 2:00 · objective: Explain why a by-value head cannot report a new first node, and trace GATE 2010 move_to_front.*

**1:30–1:37** — Inserting at the front changes which node is first, so it changes the head pointer itself.

> Caption: Inserting at the front changes which node is first, so it changes the head pointer itself.

Exam-trap caption mode adds: *The distinction is about which variable changes, not about where in the list the node lands. Appending at the rear does not change the head; it changes the last node, which the head can reach.*

**1:37–1:45** — A parameter of type pointer to node is a copy. Assigning to it inside the function changes the copy, and the caller never sees it.

> Caption: A parameter node *head is a copy. Assigning to it inside the function changes the copy, and the caller never sees it.

Exam-trap caption mode adds: *The function appears to work when the list is non-empty and the new node happens to reuse the old address, which is why this bug survives casual testing. The type, not the test, is the evidence.*

**1:45–1:53** — GATE 2010: after the loop, p is the last node and q the one before it. The blank is: set q next to NULL, set p next to head, then set head to p.

> Caption: GATE 2010: after the loop, p is the last node and q the one before it. The blank is q->next = NULL; p->next = head; head = p.

Exam-trap caption mode adds: *Option B assigns head = p before p->next = head, so the node ends up pointing at itself. Option C reverses the two ends instead of moving one. Both look plausible when read quickly.*

**1:53–2:00** — The order rule: detach the tail, then attach it to the old front, then move the head. Reverse the last two and the list is lost.

> Caption: The order rule: detach the tail, then attach it to the old front, then move the head. Reverse the last two and the list is lost.

Exam-trap caption mode adds: *Writing the three statements in the order they appear in the answer rather than the order they must execute is the most common way to lose this mark.*

## Scene 5. What a list buys, and what it costs

*2:00 – 2:30 · objective: Build the array-versus-list cost table from the operations, and separate "given the node" from "must find the node".*

**2:00–2:07** — Reaching the k-th element is constant time in an array and k steps in a list. That one row drives most of the table.

> Caption: Reaching the k-th element: constant time in an array, k steps in a list. That one row drives most of the table.

Exam-trap caption mode adds: *Indexing an array is not a lookup in a table either. Both are honest mechanisms; one is arithmetic and one is a chase.*

**2:07–2:15** — Binary search needs the middle, and a list cannot reach the middle without walking to it. So a sorted list searches in linear time.

> Caption: Binary search needs the middle, and a list cannot reach the middle without walking to it. So a sorted list searches in linear time.

Exam-trap caption mode adds: *A sorted linked list is not a search structure. The fact that the data is sorted buys nothing without random access, which is why balanced trees and skip lists exist.*

**2:15–2:23** — Given a pointer to the node, insertion is constant time in both. Deleting the node you were given is linear in a singly linked list and constant in a doubly linked one.

> Caption: Given a pointer to the node, insertion is constant time in both. Deleting the node you were given is O(n) in a singly linked list and O(1) in a doubly linked one.

Exam-trap caption mode adds: *The word "given" is doing the work. Without it, the search dominates and both are linear. Every option in these questions differs in whether the pointer is supplied.*

**2:23–2:30** — Copying the successor into the given node gives constant-time deletion in a singly linked list, but it fails on the last node, so the worst case stays linear.

> Caption: Copying the successor into the given node gives O(1) deletion in a singly linked list, but it fails on the last node, so the worst case stays O(n).

Exam-trap caption mode adds: *The trick also changes which node object survives, so any other pointer to the deleted node now silently sees different data. Constant time, wrong identity — a bad trade in most programs.*

## Scene 6. Two links, four assignments, one invariant

*2:30 – 3:00 · objective: State the doubly linked invariant, splice with four writes, and delete in O(1) from a node pointer alone.*

**2:30–2:37** — A doubly linked node stores prev and next. The invariant: for every node b, the prev of the next node is b, and the next of the prev node is b.

> Caption: A doubly linked node stores prev and next. The invariant: for every node b, b->next->prev == b and b->prev->next == b.

Exam-trap caption mode adds: *The invariant is stated for interior nodes. At the two ends one of the two links is NULL, so a check that dereferences prev on the first node is itself a bug.*

**2:37–2:45** — Splicing a new node between two others touches four pointers: two on the new node, two on its neighbours.

> Caption: Splicing x between a and b touches four pointers: x->next = b, x->prev = a, a->next = x, b->prev = x.

Exam-trap caption mode adds: *A singly linked splice touches two. Quoting four without saying where is what makes the doubly linked list sound expensive; the extra two are the price of the backward direction.*

**2:45–2:53** — Deleting x from a pointer to x alone takes two assignments and no walk, because the predecessor is already stored.

> Caption: Deleting x from a pointer to x alone: x->prev->next = x->next; x->next->prev = x->prev. Two assignments, no walk.

Exam-trap caption mode adds: *The two assignments must not be swapped in a way that reads x->next after it has been overwritten. Save the neighbours first, then write both fields, then free x.*

**2:53–3:00** — GATE 2016 Set 2: the decrease-key operations dominate, because each one walks forward to restore the sorted order, giving N squared overall.

> Caption: GATE 2016 Set 2: N deletes cost N, N finds cost N squared over log factors, but N decrease-keys each walk forward, giving N squared overall.

Exam-trap caption mode adds: *The delete count is given as N and the insert count as log N. Multiplying the wrong count by the wrong per-operation cost is how option B, O(N), is produced.*

## Scene 7. No NULL: the last node points at the first

*3:00 – 3:30 · objective: Use a single rear pointer so both enqueue and dequeue are O(1), and concatenate two lists without a walk.*

**3:00–3:07** — In a circular list the last node points at the first, not at NULL. There is no terminator, so you must supply the stopping rule.

> Caption: In a circular list the last node points at the first, not at NULL. There is no terminator, so you must supply the stopping rule.

Exam-trap caption mode adds: *The absence of NULL is not a defect and not a guarantee of a cycle bug. It is a representation choice: the same ring serves as a queue with one pointer, or as a list with a sentinel.*

**3:07–3:15** — GATE 2004: point the single pointer at the rear. The front is then the next node, so dequeue is one assignment and enqueue is one insertion.

> Caption: GATE 2004: point the single pointer at the rear. The front is then p->next, so dequeue is one assignment and enqueue is one insertion.

Exam-trap caption mode adds: *The reason rear wins is that the rear is the end you cannot otherwise reach from the front. The front is free from the rear, because the ring closes.*

**3:15–3:23** — Point it at the front instead and dequeue stays constant, but enqueue needs the rear, which is a full walk.

> Caption: Point it at the front instead and dequeue stays constant, but enqueue needs the rear, which is a full walk.

Exam-trap caption mode adds: *In a non-circular list the same argument gives the opposite conclusion for a different reason: there the front does not reveal the rear at all, so a tail pointer must be kept separately.*

**3:23–3:30** — GATE 1997: concatenating two lists in constant time needs the last node of the first without a walk. A circular doubly linked list gives it as the prev of the head.

> Caption: GATE 1997: concatenating two lists in constant time needs the last node of the first without a walk. A circular doubly linked list gives it as head->prev.

Exam-trap caption mode adds: *A plain doubly linked list with only a head pointer still has to walk to the tail. The circularity is what makes the tail one hop from the head.*

## Scene 8. Reversal, one link at a time

*3:30 – 4:00 · objective: Run the three-cursor loop, say why next must be saved first, and count the work: n link writes, O(1) space.*

**3:30–3:37** — Reversal rewrites every node next to point backwards. Three cursors: previous, current and next.

> Caption: Reversal rewrites every node next to point backwards. Three cursors: prev, curr and next.

Exam-trap caption mode adds: *Two cursors are not enough. The instant curr->next is overwritten, the only reference to the remaining list is whatever you saved. That is why the third variable is not optional.*

**3:37–3:45** — Each step: save the next node, point the current node backwards, move previous forward, move current to the saved node. The save comes first.

> Caption: Each step: save next = curr->next; curr->next = prev; prev = curr; curr = next. The save comes first.

Exam-trap caption mode adds: *Writing curr->next = prev before saving curr->next destroys the only route to the rest of the list. The loop then walks backwards from a node that still points at its old predecessor, and the program hangs or crashes.*

**3:45–3:53** — n nodes, n link writes, n steps: linear time in constant extra space. That is exactly GATE 2022.

> Caption: n nodes, n link writes, n steps: linear time in constant extra space. That is exactly GATE 2022.

Exam-trap caption mode adds: *Reversing by copying values into an array is also linear time but linear space, so it does not answer a question that fixes the space. Read the space clause before choosing the method.*

**3:53–4:00** — The recursive reversal is also linear time, but its recursion depth is n, so its space is linear. Only the loop uses constant space.

> Caption: The recursive reversal is also linear time, but its recursion depth is n, so its space is linear. Only the loop is O(1) space.

Exam-trap caption mode adds: *A tail-recursive formulation is not automatically constant space in C: the standard does not require tail-call elimination, and a compiler that omits it keeps the frames.*

## Scene 9. Two cursors on one list

*4:00 – 4:30 · objective: Merge two sorted lists in place, then detect a cycle with a tortoise and a hare and bound the steps.*

**4:00–4:07** — Merging two sorted lists uses two cursors and one output cursor, and takes the smaller head each time.

> Caption: Merging two sorted lists: two cursors, one output cursor, and take the smaller head each time.

Exam-trap caption mode adds: *Merging is not concatenation. Concatenation puts one whole list after another and does not need the elements to be ordered; merging interleaves and does.*

**4:07–4:15** — Comparisons: at most n1 plus n2 minus one, because each comparison consumes one node and the last node is attached without one.

> Caption: Comparisons: at most n1 + n2 − 1, because each comparison consumes one node and the last node is attached without one.

Exam-trap caption mode adds: *This bound is for the number of comparisons, not for the running time of an arbitrary merge sort, where the recursion contributes a logarithmic factor.*

**4:15–4:23** — A cycle is found by two cursors at different speeds: the tortoise moves one link, the hare moves two. If there is a cycle they meet.

> Caption: A cycle is found by two cursors at different speeds: the tortoise moves one link, the hare moves two. If there is a cycle they meet.

Exam-trap caption mode adds: *Meeting proves a cycle; failing to meet proves none only because the hare reaches NULL, which needs the NULL test to be on the hare. Testing the tortoise for NULL is the wrong loop condition.*

**4:23–4:30** — With the cycle entering after mu links and repeating every lambda, the hare gains one link per step, so they meet within mu plus lambda steps.

> Caption: With the cycle entering after mu links and repeating every lambda, the hare gains one link per step, so they meet within mu + lambda steps.

Exam-trap caption mode adds: *Finding the entry point needs a second phase: restart one cursor at the head and advance both one link at a time; they meet at the entry. Stopping at the first meeting gives the wrong node.*

## Scene 10. The procedure, and where this goes next

*4:30 – 5:00 · objective: Fix four questions that decide almost every linked-list option, and name what replaces the single link next.*

**4:30–4:37** — First question: is a pointer to the node given, or must it be found? That decides constant against linear in almost every option.

> Caption: First question: is a pointer to the node given, or must it be found? That decides constant against linear in almost every option.

Exam-trap caption mode adds: *Options are written to differ only in that word. Reading the code before reading the words is how a constant-time option looks correct for a linear-time question.*

**4:37–4:45** — Second: which pointers must change, next only or next and prev? Third: is the head itself changing?

> Caption: Second: which pointers must change — next only, or next and prev? Third: is the head itself changing?

Exam-trap caption mode adds: *An option can update every pointer correctly and still be wrong because the new head never reaches the caller. Check the interface, not only the surgery.*

**4:45–4:53** — Fourth: is the list circular or NULL-terminated? A loop that tests for NULL on a circular list never terminates.

> Caption: Fourth: is the list circular or NULL-terminated? A loop that tests for NULL on a circular list never terminates.

Exam-trap caption mode adds: *An option that walks a circular list looking for NULL is not merely inefficient; it is non-terminating. That is a different kind of wrong from a wrong complexity.*

**4:53–5:00** — Next in this repository: trees, binary search trees and heaps. A node with two links instead of one, and the same pointer surgery.

> Caption: Next in this repository: trees, binary search trees and heaps — a node with two links instead of one, and the same pointer surgery.

Exam-trap caption mode adds: *The list is not a special case of the tree that can be skipped. The tree lessons assume the splice, the reversal and the two-cursor walk are already fluent.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
