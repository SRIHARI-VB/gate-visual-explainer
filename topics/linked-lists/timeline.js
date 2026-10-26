/* ==========================================================================
   linked-lists — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'chained',
      n: 1,
      title: 'A node is a value plus the address of the next one',
      start: 0, end: 30,
      objective: 'See that a linked list replaces index arithmetic with a stored address, and name the one cost and the one gain that follow.'
    },
    {
      id: 'node',
      n: 2,
      title: 'The node in C, and what it does not store',
      start: 30, end: 60,
      objective: 'Read the self-referential struct, the NULL terminator, and the padding, then say where the length lives (nowhere).'
    },
    {
      id: 'splice',
      n: 3,
      title: 'Pointer surgery: insert after, delete after',
      start: 60, end: 90,
      objective: 'Write the two assignments in the safe order, then trace GATE 1998 by addresses rather than by arrows.'
    },
    {
      id: 'head',
      n: 4,
      title: 'The head pointer is the list',
      start: 90, end: 120,
      objective: 'Explain why a by-value head cannot report a new first node, and trace GATE 2010 move_to_front.'
    },
    {
      id: 'costs',
      n: 5,
      title: 'What a list buys, and what it costs',
      start: 120, end: 150,
      objective: 'Build the array-versus-list cost table from the operations, and separate "given the node" from "must find the node".'
    },
    {
      id: 'doubly',
      n: 6,
      title: 'Two links, four assignments, one invariant',
      start: 150, end: 180,
      objective: 'State the doubly linked invariant, splice with four writes, and delete in O(1) from a node pointer alone.'
    },
    {
      id: 'circular',
      n: 7,
      title: 'No NULL: the last node points at the first',
      start: 180, end: 210,
      objective: 'Use a single rear pointer so both enqueue and dequeue are O(1), and concatenate two lists without a walk.'
    },
    {
      id: 'reverse',
      n: 8,
      title: 'Reversal, one link at a time',
      start: 210, end: 240,
      objective: 'Run the three-cursor loop, say why next must be saved first, and count the work: n link writes, O(1) space.'
    },
    {
      id: 'twolists',
      n: 9,
      title: 'Two cursors on one list',
      start: 240, end: 270,
      objective: 'Merge two sorted lists in place, then detect a cycle with a tortoise and a hare and bound the steps.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure, and where this goes next',
      start: 270, end: 300,
      objective: 'Fix four questions that decide almost every linked-list option, and name what replaces the single link next.'
    }
  ],

  events: [

    /* ---- scene 1: chained ---- */
    {
      id: 'chn-1', start: 0, end: 7, scene: 'chained',
      caption: 'An array is one block, and the address of element i is arithmetic. A linked list is not a block at all.',
      detail: 'In an array the elements sit next to each other, so the address of the i-th one is the base address plus i times the element size. In a linked list the elements sit wherever the allocator had room, so no arithmetic on a base can find the next one.',
      keyword: 'not a block at all',
      trap: 'Do not picture a linked list as boxes drawn in a row. The row in the drawing is a convention; in memory the nodes can be in any order, and the drawing usually puts them in the order the links visit them.',
      narration: 'An array is one block, and the address of element i is arithmetic. A linked list is not a block at all.'
    },
    {
      id: 'chn-2', start: 7, end: 15, scene: 'chained',
      caption: 'Each element is a node: it holds a value and the address of the next node. Following that address is called a link.',
      detail: 'The pointer field is not an index and not an offset. It is a full address of another object, so the two nodes need not be anywhere near each other. Reading the field and jumping to what it names is one memory access.',
      keyword: 'the address of the next node',
      trap: 'A link is not "the next index". Index arithmetic is what the array does; the list stores the address, which is why the address can be anything.',
      narration: 'Each element is a node. It holds a value and the address of the next node. Following that address is called a link.'
    },
    {
      id: 'chn-3', start: 15, end: 23, scene: 'chained',
      caption: 'So reaching the k-th node costs k link reads, not one multiplication. Random access becomes a walk.',
      detail: 'Access in an array is constant time because the address is computed. Access in a list is linear because the address is discovered. Everything else in this lesson follows from that one trade: the list gives up direct access and buys cheap local rearrangement.',
      keyword: 'k link reads',
      trap: 'The trade is not "lists are faster". A list is faster only for the operations that change links near a place you already hold. It is slower for everything that needs to arrive somewhere.',
      narration: 'So reaching the k-th node costs k link reads, not one multiplication. Random access becomes a walk.'
    },
    {
      id: 'chn-4', start: 23, end: 30, scene: 'chained',
      caption: 'The list is not an object in memory. It is a head pointer plus whatever chain of nodes that pointer reaches.',
      detail: 'Nothing in the language or the machine holds the collection together. If the head pointer is overwritten, the nodes remain allocated and each still points at the next, but no name reaches them. That is why losing the head is the classic pointer bug.',
      keyword: 'a head pointer plus a chain',
      trap: 'A linked list has no length field unless you add one. Counting the nodes, printing them, and freeing them all cost a full walk, and all three need a stopping rule.',
      narration: 'The list is not an object in memory. It is a head pointer plus whatever chain of nodes that pointer reaches.'
    },

    /* ---- scene 2: node ---- */
    {
      id: 'nod-1', start: 30, end: 37, scene: 'node',
      caption: 'struct node { int data; struct node *next; } — a struct may hold a pointer to its own type, but not an object of its own type.',
      detail: 'The pointer needs only the name of the type, which is already declared by the time the member is read. An object of the type would need the type to be complete, which it is not yet. That is exactly why the link is a pointer and not a nested struct.',
      keyword: 'a pointer to its own type',
      trap: 'The struct tag must be repeated inside the member: struct node *next. Writing node *next inside the definition works only if a typedef of that name already exists.',
      narration: 'A struct may hold a pointer to its own type, but not an object of its own type.'
    },
    {
      id: 'nod-2', start: 37, end: 45, scene: 'node',
      caption: 'The next field holds an address, or NULL. NULL ends the list: the empty list is head == NULL, and the last node points at nothing.',
      detail: 'NULL is a null pointer constant, and dereferencing it is undefined behaviour. Every traversal therefore has the shape "while p is not NULL, visit p, then move to the next", and the test comes before the visit, not after.',
      keyword: 'NULL ends the list',
      trap: 'An empty list and a list of one node are different states, and a function that treats them alike usually crashes on one of them. Test head == NULL before touching head->next.',
      narration: 'The next field holds an address, or NULL. NULL ends the list. The empty list is head equals NULL, and the last node points at nothing.'
    },
    {
      id: 'nod-3', start: 45, end: 53, scene: 'node',
      caption: 'sizeof of the node is not the sum of the members: the compiler inserts padding so the pointer starts at an aligned address.',
      detail: 'On a typical 64-bit machine an int takes four bytes and a pointer eight. Four bytes of padding follow the int so the pointer begins on a multiple of eight, and the node occupies sixteen bytes rather than twelve. The exact numbers are an implementation detail, not a language rule.',
      keyword: 'the compiler inserts padding',
      trap: 'The standard fixes only the order of the members and guarantees no padding before the first one. Any arithmetic on sizeof(struct node) is a bet on one ABI, which is why a question that needs it states the sizes.',
      narration: 'The size of a node is not the sum of its members. The compiler inserts padding so the pointer starts at an aligned address.'
    },
    {
      id: 'nod-4', start: 53, end: 60, scene: 'node',
      caption: 'Nothing stores the length. So counting the nodes costs a walk — unless you keep a separate count, which is a design choice with its own cost.',
      detail: 'An array knows its length from its type, and even that knowledge is lost once it decays to a pointer. A linked list never knew it. Storing a count makes length constant time but makes every insert and delete responsible for maintaining the count, including the error paths.',
      keyword: 'Nothing stores the length',
      trap: 'A question that asks for the length of a linked list in constant time is asking about a different data structure. Say so rather than inventing a stored length.',
      narration: 'Nothing stores the length. So counting the nodes costs a walk, unless you keep a separate count, which is a design choice with its own cost.'
    },

    /* ---- scene 3: splice ---- */
    {
      id: 'spl-1', start: 60, end: 67, scene: 'splice',
      caption: 'Inserting after p needs no search and no shifting: x->next = p->next, then p->next = x. Two assignments.',
      detail: 'The first assignment copies the old successor into the new node, so the rest of the list is now reachable from x. The second makes p point at x. Because the rest of the list is already held by x, nothing is lost.',
      keyword: 'Two assignments',
      trap: 'The order is not a style preference. Writing p->next = x first overwrites the only pointer to the rest of the list, and the tail becomes unreachable — a leak, not a compile error.',
      narration: 'Inserting after p needs no search and no shifting. Set x next to p next, then set p next to x. Two assignments.'
    },
    {
      id: 'spl-2', start: 67, end: 75, scene: 'splice',
      caption: 'GATE 1998 asked what four assignments do: q = p->next; p->next = q->next; q->next = (q->next)->next; (p->next)->next = q.',
      detail: 'The four lines are the standard swap of the two nodes that follow p. Line one holds the first of them in q. Line two makes p skip it. Line three makes q skip its own successor. Line four reattaches q after that successor.',
      keyword: 'swap the two nodes after p',
      trap: 'The fourth line reads (p->next)->next, not p->next. By then p->next is the node that was third, so the target is the field after it. Reading the line lazily is how the wrong option looks right.',
      narration: 'GATE 1998 asked what four assignments do. They swap the two nodes that follow p.'
    },
    {
      id: 'spl-3', start: 75, end: 83, scene: 'splice',
      caption: 'Trace with addresses, not arrows. Give each node a number, write the field values, and the swap becomes four overwrites.',
      detail: 'Suppose p is at 1000 and the nodes after it at 2000, 3000, 4000. Line one puts 2000 in q. Line two writes 3000 into the next field at 1000. Line three writes 4000 into the next field at 2000. Line four writes 2000 into the next field at 3000. The order 3000, 2000, 4000 is the swap.',
      keyword: 'Trace with addresses',
      trap: 'Arrow diagrams are drawn in the final order, so they show the answer rather than the process. Only the addresses show which field is written when.',
      narration: 'Trace with addresses, not arrows. Give each node a number, write the field values, and the swap becomes four overwrites.'
    },
    {
      id: 'spl-4', start: 83, end: 90, scene: 'splice',
      caption: 'Deleting after p is one assignment, but save the victim first or the memory leaks. Deleting p itself is the harder problem.',
      detail: 'p->next = p->next->next unlinks the successor, and the successor is then unreachable and still allocated. Assign it to a temporary and free it. Deleting p itself needs the node before p, which a singly linked list cannot reach from p.',
      keyword: 'save the victim first',
      trap: 'Unlinking is not deleting. In a garbage-collected language the distinction is invisible; in C the leak is the bug, and a question about freeing memory is testing exactly this.',
      narration: 'Deleting after p is one assignment, but save the victim first or the memory leaks. Deleting p itself is the harder problem.'
    },

    /* ---- scene 4: head ---- */
    {
      id: 'hed-1', start: 90, end: 97, scene: 'head',
      caption: 'Inserting at the front changes which node is first, so it changes the head pointer itself.',
      detail: 'Every other insertion leaves the head alone: the chain still starts where it started. A front insertion is the one operation whose result is a new head value, and that value has to travel back to whoever holds the head.',
      keyword: 'changes the head pointer itself',
      trap: 'The distinction is about which variable changes, not about where in the list the node lands. Appending at the rear does not change the head; it changes the last node, which the head can reach.',
      narration: 'Inserting at the front changes which node is first, so it changes the head pointer itself.'
    },
    {
      id: 'hed-2', start: 97, end: 105, scene: 'head',
      caption: 'A parameter node *head is a copy. Assigning to it inside the function changes the copy, and the caller never sees it.',
      detail: 'C passes arguments by value. The function receives a pointer, which is a value, so it can change what the pointer points at but not which pointer the caller holds. There are three honest repairs: return the new head, take node **head, or use a dummy header node.',
      keyword: 'A parameter node *head is a copy',
      trap: 'The function appears to work when the list is non-empty and the new node happens to reuse the old address, which is why this bug survives casual testing. The type, not the test, is the evidence.',
      narration: 'A parameter of type pointer to node is a copy. Assigning to it inside the function changes the copy, and the caller never sees it.'
    },
    {
      id: 'hed-3', start: 105, end: 113, scene: 'head',
      caption: 'GATE 2010: after the loop, p is the last node and q the one before it. The blank is q->next = NULL; p->next = head; head = p.',
      detail: 'The guard returns early for an empty list and for a single node, so the loop always runs at least once and q is never NULL at the end. Detaching the tail first, then attaching it to the old front, then moving the head, is the only order in which nothing is lost.',
      keyword: 'q->next = NULL; p->next = head; head = p',
      trap: 'Option B assigns head = p before p->next = head, so the node ends up pointing at itself. Option C reverses the two ends instead of moving one. Both look plausible when read quickly.',
      narration: 'GATE 2010: after the loop, p is the last node and q the one before it. The blank is: set q next to NULL, set p next to head, then set head to p.'
    },
    {
      id: 'hed-4', start: 113, end: 120, scene: 'head',
      caption: 'The order rule: detach the tail, then attach it to the old front, then move the head. Reverse the last two and the list is lost.',
      detail: 'Once head = p runs, the old head is no longer named by head. If p->next has not yet been set to it, nothing refers to the old front and the whole list is unreachable except through p.',
      keyword: 'detach, attach, then move',
      trap: 'Writing the three statements in the order they appear in the answer rather than the order they must execute is the most common way to lose this mark.',
      narration: 'The order rule: detach the tail, then attach it to the old front, then move the head. Reverse the last two and the list is lost.'
    },

    /* ---- scene 5: costs ---- */
    {
      id: 'cst-1', start: 120, end: 127, scene: 'costs',
      caption: 'Reaching the k-th element: constant time in an array, k steps in a list. That one row drives most of the table.',
      detail: 'The array computes an address. The list follows links. Everything that needs to arrive at a position — access, insert at position k, delete at position k, binary search — inherits the difference.',
      keyword: 'k steps in a list',
      trap: 'Indexing an array is not a lookup in a table either. Both are honest mechanisms; one is arithmetic and one is a chase.',
      narration: 'Reaching the k-th element is constant time in an array and k steps in a list. That one row drives most of the table.'
    },
    {
      id: 'cst-2', start: 127, end: 135, scene: 'costs',
      caption: 'Binary search needs the middle, and a list cannot reach the middle without walking to it. So a sorted list searches in linear time.',
      detail: 'Binary search discards half the candidates per comparison, which requires constant-time access to the middle of the remaining range. In a list the middle of a range is only reachable by a walk, so the saving disappears and the walk dominates.',
      keyword: 'a list cannot reach the middle',
      trap: 'A sorted linked list is not a search structure. The fact that the data is sorted buys nothing without random access, which is why balanced trees and skip lists exist.',
      narration: 'Binary search needs the middle, and a list cannot reach the middle without walking to it. So a sorted list searches in linear time.'
    },
    {
      id: 'cst-3', start: 135, end: 143, scene: 'costs',
      caption: 'Given a pointer to the node, insertion is constant time in both. Deleting the node you were given is O(n) in a singly linked list and O(1) in a doubly linked one.',
      detail: 'Insertion after p rewrites two fields in a singly linked list, so the node being held is all that is needed. Deletion needs the predecessor to change its next field, and a singly linked node does not name its predecessor. A doubly linked node does.',
      keyword: 'O(n) singly, O(1) doubly',
      trap: 'The word "given" is doing the work. Without it, the search dominates and both are linear. Every option in these questions differs in whether the pointer is supplied.',
      narration: 'Given a pointer to the node, insertion is constant time in both. Deleting the node you were given is linear in a singly linked list and constant in a doubly linked one.'
    },
    {
      id: 'cst-4', start: 143, end: 150, scene: 'costs',
      caption: 'Copying the successor into the given node gives O(1) deletion in a singly linked list, but it fails on the last node, so the worst case stays O(n).',
      detail: 'The trick overwrites the given node with its successor data, then unlinks the successor. It needs a successor to copy, so the last node is excluded, and the worst case is exactly that node. GATE 2023 and GATE IT 2004 both ask for the worst case, and both answer linear.',
      keyword: 'it fails on the last node',
      trap: 'The trick also changes which node object survives, so any other pointer to the deleted node now silently sees different data. Constant time, wrong identity — a bad trade in most programs.',
      narration: 'Copying the successor into the given node gives constant-time deletion in a singly linked list, but it fails on the last node, so the worst case stays linear.'
    },

    /* ---- scene 6: doubly ---- */
    {
      id: 'dbl-1', start: 150, end: 157, scene: 'doubly',
      caption: 'A doubly linked node stores prev and next. The invariant: for every node b, b->next->prev == b and b->prev->next == b.',
      detail: 'Both directions must agree about every adjacency. A splice that updates next but not prev leaves a list that walks forward correctly and backwards into the wrong node, which is worse than a crash because it is silent.',
      keyword: 'b->next->prev == b',
      trap: 'The invariant is stated for interior nodes. At the two ends one of the two links is NULL, so a check that dereferences prev on the first node is itself a bug.',
      narration: 'A doubly linked node stores prev and next. The invariant: for every node b, the prev of the next node is b, and the next of the prev node is b.'
    },
    {
      id: 'dbl-2', start: 157, end: 165, scene: 'doubly',
      caption: 'Splicing x between a and b touches four pointers: x->next = b, x->prev = a, a->next = x, b->prev = x.',
      detail: 'The two links on the new node are written first, while a and b are still named. Then the two existing nodes are pointed at the new one. Any order works as long as neither a nor b is overwritten before its old value has been used.',
      keyword: 'four pointers',
      trap: 'A singly linked splice touches two. Quoting four without saying where is what makes the doubly linked list sound expensive; the extra two are the price of the backward direction.',
      narration: 'Splicing a new node between two others touches four pointers: two on the new node, two on its neighbours.'
    },
    {
      id: 'dbl-3', start: 165, end: 173, scene: 'doubly',
      caption: 'Deleting x from a pointer to x alone: x->prev->next = x->next; x->next->prev = x->prev. Two assignments, no walk.',
      detail: 'The predecessor is already stored, so the search that a singly linked list must perform disappears. This is the O(1) deletion that GATE 2023 is really asking about, and it is why a doubly linked list is the right structure for an LRU cache.',
      keyword: 'Two assignments, no walk',
      trap: 'The two assignments must not be swapped in a way that reads x->next after it has been overwritten. Save the neighbours first, then write both fields, then free x.',
      narration: 'Deleting x from a pointer to x alone takes two assignments and no walk, because the predecessor is already stored.'
    },
    {
      id: 'dbl-4', start: 173, end: 180, scene: 'doubly',
      caption: 'GATE 2016 Set 2: N deletes cost N, N finds cost N squared over log factors, but N decrease-keys each walk forward, giving N squared overall.',
      detail: 'Deleting a pointed-to record is constant time. Finding a key is a walk. Decreasing a key in a sorted list must move the record toward the front to restore order, and that move is a walk. The decrease-key term dominates every other.',
      keyword: 'decrease-key dominates',
      trap: 'The delete count is given as N and the insert count as log N. Multiplying the wrong count by the wrong per-operation cost is how option B, O(N), is produced.',
      narration: 'GATE 2016 Set 2: the decrease-key operations dominate, because each one walks forward to restore the sorted order, giving N squared overall.'
    },

    /* ---- scene 7: circular ---- */
    {
      id: 'cir-1', start: 180, end: 187, scene: 'circular',
      caption: 'In a circular list the last node points at the first, not at NULL. There is no terminator, so you must supply the stopping rule.',
      detail: 'A traversal that tests for NULL on a circular list never stops. The two honest stopping rules are a count of nodes, or remembering where you started and stopping when you come back to it. Both need care when the list can be empty.',
      keyword: 'you must supply the stopping rule',
      trap: 'The absence of NULL is not a defect and not a guarantee of a cycle bug. It is a representation choice: the same ring serves as a queue with one pointer, or as a list with a sentinel.',
      narration: 'In a circular list the last node points at the first, not at NULL. There is no terminator, so you must supply the stopping rule.'
    },
    {
      id: 'cir-2', start: 187, end: 195, scene: 'circular',
      caption: 'GATE 2004: point the single pointer at the rear. The front is then p->next, so dequeue is one assignment and enqueue is one insertion.',
      detail: 'Enqueue inserts after the rear and moves the rear to the new node. Dequeue removes p->next, which is the front, and the new front is the node after it. Neither operation walks, so both are constant time.',
      keyword: 'point the single pointer at the rear',
      trap: 'The reason rear wins is that the rear is the end you cannot otherwise reach from the front. The front is free from the rear, because the ring closes.',
      narration: 'GATE 2004: point the single pointer at the rear. The front is then the next node, so dequeue is one assignment and enqueue is one insertion.'
    },
    {
      id: 'cir-3', start: 195, end: 203, scene: 'circular',
      caption: 'Point it at the front instead and dequeue stays constant, but enqueue needs the rear, which is a full walk.',
      detail: 'That asymmetry is the entire content of the question. One pointer can hold one end; the question is which end makes the other end free. In a ring, the node before the front is the rear, and only a pointer to the rear makes both ends reachable in one step.',
      keyword: 'a full walk',
      trap: 'In a non-circular list the same argument gives the opposite conclusion for a different reason: there the front does not reveal the rear at all, so a tail pointer must be kept separately.',
      narration: 'Point it at the front instead and dequeue stays constant, but enqueue needs the rear, which is a full walk.'
    },
    {
      id: 'cir-4', start: 203, end: 210, scene: 'circular',
      caption: 'GATE 1997: concatenating two lists in constant time needs the last node of the first without a walk. A circular doubly linked list gives it as head->prev.',
      detail: 'Four pointer writes join the two rings: the tail of the first points at the head of the second and back, and the tail of the second points at the head of the first and back. A singly linked list must walk to the first tail; an array must copy both.',
      keyword: 'head->prev',
      trap: 'A plain doubly linked list with only a head pointer still has to walk to the tail. The circularity is what makes the tail one hop from the head.',
      narration: 'GATE 1997: concatenating two lists in constant time needs the last node of the first without a walk. A circular doubly linked list gives it as the prev of the head.'
    },

    /* ---- scene 8: reverse ---- */
    {
      id: 'rev-1', start: 210, end: 217, scene: 'reverse',
      caption: 'Reversal rewrites every node next to point backwards. Three cursors: prev, curr and next.',
      detail: 'At the start prev is NULL, because the first node will become the last and must terminate. curr starts at the head. next is not a cursor you keep for later; it exists only to hold the rest of the list across the moment the link is broken.',
      keyword: 'Three cursors',
      trap: 'Two cursors are not enough. The instant curr->next is overwritten, the only reference to the remaining list is whatever you saved. That is why the third variable is not optional.',
      narration: 'Reversal rewrites every node next to point backwards. Three cursors: previous, current and next.'
    },
    {
      id: 'rev-2', start: 217, end: 225, scene: 'reverse',
      caption: 'Each step: save next = curr->next; curr->next = prev; prev = curr; curr = next. The save comes first.',
      detail: 'The four statements are one rotation. Save the forward link, overwrite it with the backward one, advance prev to the node just processed, advance curr to the saved node. After the last node curr is NULL and prev is the old tail, which is the new head.',
      keyword: 'The save comes first',
      trap: 'Writing curr->next = prev before saving curr->next destroys the only route to the rest of the list. The loop then walks backwards from a node that still points at its old predecessor, and the program hangs or crashes.',
      narration: 'Each step: save the next node, point the current node backwards, move previous forward, move current to the saved node. The save comes first.'
    },
    {
      id: 'rev-3', start: 225, end: 233, scene: 'reverse',
      caption: 'n nodes, n link writes, n steps: linear time in constant extra space. That is exactly GATE 2022.',
      detail: 'Every node is visited once and exactly one field is rewritten per node, so the count of work is proportional to n and cannot be less, because each link must change. The three cursors are three variables, so the extra space is constant.',
      keyword: 'linear time in constant extra space',
      trap: 'Reversing by copying values into an array is also linear time but linear space, so it does not answer a question that fixes the space. Read the space clause before choosing the method.',
      narration: 'n nodes, n link writes, n steps: linear time in constant extra space. That is exactly GATE 2022.'
    },
    {
      id: 'rev-4', start: 233, end: 240, scene: 'reverse',
      caption: 'The recursive reversal is also linear time, but its recursion depth is n, so its space is linear. Only the loop is O(1) space.',
      detail: 'The recursive version reverses the rest of the list and then fixes two links on the way back up the call stack. The time is linear and the space is the depth of that stack. Both are correct algorithms; the question decides which one is admissible.',
      keyword: 'its recursion depth is n',
      trap: 'A tail-recursive formulation is not automatically constant space in C: the standard does not require tail-call elimination, and a compiler that omits it keeps the frames.',
      narration: 'The recursive reversal is also linear time, but its recursion depth is n, so its space is linear. Only the loop uses constant space.'
    },

    /* ---- scene 9: twolists ---- */
    {
      id: 'two-1', start: 240, end: 247, scene: 'twolists',
      caption: 'Merging two sorted lists: two cursors, one output cursor, and take the smaller head each time.',
      detail: 'Nothing is copied. The nodes of the two input lists are relinked into one chain, so the merge is a rearrangement and the total number of nodes is unchanged. When one list empties, the remainder of the other is attached in one assignment.',
      keyword: 'take the smaller head each time',
      trap: 'Merging is not concatenation. Concatenation puts one whole list after another and does not need the elements to be ordered; merging interleaves and does.',
      narration: 'Merging two sorted lists uses two cursors and one output cursor, and takes the smaller head each time.'
    },
    {
      id: 'two-2', start: 247, end: 255, scene: 'twolists',
      caption: 'Comparisons: at most n1 + n2 − 1, because each comparison consumes one node and the last node is attached without one.',
      detail: 'Every comparison advances one of the two input cursors past a node, and the process stops when one list is exhausted, which happens after at most n1 + n2 − 1 consumptions. The final node of the surviving list needs no comparison.',
      keyword: 'n1 + n2 − 1',
      trap: 'This bound is for the number of comparisons, not for the running time of an arbitrary merge sort, where the recursion contributes a logarithmic factor.',
      narration: 'Comparisons: at most n1 plus n2 minus one, because each comparison consumes one node and the last node is attached without one.'
    },
    {
      id: 'two-3', start: 255, end: 263, scene: 'twolists',
      caption: 'A cycle is found by two cursors at different speeds: the tortoise moves one link, the hare moves two. If there is a cycle they meet.',
      detail: 'If the list terminates, the hare reaches NULL and the answer is no. If it does not, both cursors are eventually inside the cycle, and the hare closes the gap by one node per step, so they must coincide.',
      keyword: 'the hare moves two',
      trap: 'Meeting proves a cycle; failing to meet proves none only because the hare reaches NULL, which needs the NULL test to be on the hare. Testing the tortoise for NULL is the wrong loop condition.',
      narration: 'A cycle is found by two cursors at different speeds: the tortoise moves one link, the hare moves two. If there is a cycle they meet.'
    },
    {
      id: 'two-4', start: 263, end: 270, scene: 'twolists',
      caption: 'With the cycle entering after mu links and repeating every lambda, the hare gains one link per step, so they meet within mu + lambda steps.',
      detail: 'Before both are inside the cycle the tortoise needs at most mu steps to arrive, and then the gap is less than lambda and closes at one node per step. The bound is on the number of steps, not on the meeting node, which is generally not the entry point.',
      keyword: 'within mu + lambda steps',
      trap: 'Finding the entry point needs a second phase: restart one cursor at the head and advance both one link at a time; they meet at the entry. Stopping at the first meeting gives the wrong node.',
      narration: 'With the cycle entering after mu links and repeating every lambda, the hare gains one link per step, so they meet within mu plus lambda steps.'
    },

    /* ---- scene 10: procedure ---- */
    {
      id: 'prc-1', start: 270, end: 277, scene: 'procedure',
      caption: 'First question: is a pointer to the node given, or must it be found? That decides constant against linear in almost every option.',
      detail: 'Insert after this node, delete this node, splice between these two — all constant when the pointer is supplied. Insert at position k, delete the node with value v, find the middle — all linear because the arrival costs a walk.',
      keyword: 'is a pointer to the node given',
      trap: 'Options are written to differ only in that word. Reading the code before reading the words is how a constant-time option looks correct for a linear-time question.',
      narration: 'First question: is a pointer to the node given, or must it be found? That decides constant against linear in almost every option.'
    },
    {
      id: 'prc-2', start: 277, end: 285, scene: 'procedure',
      caption: 'Second: which pointers must change — next only, or next and prev? Third: is the head itself changing?',
      detail: 'A change of head cannot be reported through a by-value parameter, so any option that assigns to the parameter and returns nothing is wrong. A doubly linked splice must update both directions or the invariant breaks silently.',
      keyword: 'is the head itself changing',
      trap: 'An option can update every pointer correctly and still be wrong because the new head never reaches the caller. Check the interface, not only the surgery.',
      narration: 'Second: which pointers must change, next only or next and prev? Third: is the head itself changing?'
    },
    {
      id: 'prc-3', start: 285, end: 293, scene: 'procedure',
      caption: 'Fourth: is the list circular or NULL-terminated? A loop that tests for NULL on a circular list never terminates.',
      detail: 'The two representations need different stopping rules and different empty cases. A circular list is usually accessed through a rear or tail pointer, and the empty state is a NULL pointer rather than a node pointing at itself.',
      keyword: 'circular or NULL-terminated',
      trap: 'An option that walks a circular list looking for NULL is not merely inefficient; it is non-terminating. That is a different kind of wrong from a wrong complexity.',
      narration: 'Fourth: is the list circular or NULL-terminated? A loop that tests for NULL on a circular list never terminates.'
    },
    {
      id: 'prc-4', start: 293, end: 300, scene: 'procedure',
      caption: 'Next in this repository: trees, binary search trees and heaps — a node with two links instead of one, and the same pointer surgery.',
      detail: 'Every technique in this lesson reappears there. Insertion into a binary search tree is pointer surgery on a NULL child; a rotation is three or four link writes; a heap is an array pretending to be a tree, which is the array trade coming back.',
      keyword: 'two links instead of one',
      trap: 'The list is not a special case of the tree that can be skipped. The tree lessons assume the splice, the reversal and the two-cursor walk are already fluent.',
      narration: 'Next in this repository: trees, binary search trees and heaps. A node with two links instead of one, and the same pointer surgery.'
    }
  ]
};
