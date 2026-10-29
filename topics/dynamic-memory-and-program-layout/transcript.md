# Dynamic Memory and Program Layout: malloc, calloc, realloc, free and Where the Bytes Live — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/dynamic-memory-and-program-layout/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Four storage durations, one memory map

*0:00 – 0:30 · objective: Place every C object into one of four storage durations, and see where each duration is implemented in a process image.*

**0:00–0:08** — Storage duration is a lifetime, not a location. It says when the object comes into existence and when it stops existing.

> Caption: Every C object has one of four storage durations: automatic, static, allocated, or thread.

**0:08–0:16** — The code sits lowest, then initialised data, then zeroed data, then the heap, and the stack at the top.

> Caption: Each duration is implemented in a region of the process image: text, data, bss, heap and stack.

Exam-trap caption mode adds: *The C standard fixes none of this layout. The segment order is a linker and loader convention, so a question that asks "which segment" is asking about an implementation.*

**0:16–0:23** — The same type, three different homes, because the homes are chosen by storage duration and not by type.

> Caption: A local int lives on the stack; a global int lives in data or bss; a malloc block lives on the heap.

**0:23–0:30** — Zero for the static ones is a promise in the standard. For the others there is no promise at all.

> Caption: Static objects are zeroed before main; automatic and allocated objects start with whatever bytes were there.

Exam-trap caption mode adds: *A block-scope static int is also zeroed, and only once. That is the difference between static int count; inside a function and int count; inside the same function.*

## Scene 2. The heap is a table of chunks

*0:30 – 1:00 · objective: Read a glibc chunk: an 8-byte header, a 16-byte alignment rule and a 32-byte minimum, so the bytes you asked for are not the bytes you got.*

**0:30–0:38** — Every block begins with a hidden word that records its size, and the allocator needs that word to free the block later.

> Caption: The allocator does not hand you n bytes; it hands you a chunk that contains n bytes plus a header.

**0:38–0:45** — Sixteen keeps every chunk aligned for any type; thirty-two is the smallest chunk that can also hold a free list when it is released.

> Caption: Chunks are rounded up to a multiple of 16 and never smaller than 32 bytes.

**0:45–0:52** — Usable is always chunk minus eight, and usable is never less than what you asked for.

> Caption: Ask for 1 byte and you get a 32-byte chunk with 24 usable bytes; ask for 25 and you get 48 with 40 usable.

**0:52–1:00** — The standard promises n bytes. The extra is an implementation detail that a different allocator may not give you.

> Caption: Using the spare usable bytes is legal on glibc and is not portable C; only n bytes are yours by the standard.

Exam-trap caption mode adds: *malloc_usable_size tells you the real figure, but writing past n and relying on it is the kind of code that breaks on another libc or under a sanitiser.*

## Scene 3. malloc gives garbage, calloc gives zeros

*1:00 – 1:30 · objective: State exactly what malloc, calloc and realloc put in the bytes they hand back, and why all-bits-zero is not a portable zero.*

**1:00–1:08** — Eight bytes, all indeterminate. The standard says nothing about their contents.

> Caption: malloc returns uninitialised bytes. Whatever was in that memory before is what you will read.

**1:08–1:16** — calloc of eight objects of one byte is eight zero bytes, and the multiplication is done for you.

> Caption: calloc takes two arguments and zeroes every byte it returns.

**1:16–1:23** — On every common platform it does mean those things, and the standard still does not say so.

> Caption: All-bits-zero is zero for integers, but the standard does not promise it means 0.0 or a null pointer.

Exam-trap caption mode adds: *calloc guarantees zero bytes, not zero values. For an array of pointers or doubles, initialise explicitly if you need the null pointer or 0.0 by the letter of the standard.*

**1:23–1:30** — Zero is not an error and not a guarantee. If you get a pointer, free it; if you get NULL, that is not a failure.

> Caption: malloc(0) may return NULL or a unique pointer you must not dereference. The behaviour is implementation-defined.

## Scene 4. realloc: grow, copy, or move

*1:30 – 2:00 · objective: Trace the three outcomes of realloc and the one rule that survives all of them: the old pointer is invalid whatever happened.*

**1:30–1:38** — It may extend the block where it is, it may move it somewhere else, or it may fail.

> Caption: realloc asks for a new size for a block you already own.

**1:38–1:45** — Same address, more bytes, and the new bytes at the end are undefined.

> Caption: If the block can grow in place, the address does not change and nothing is copied.

**1:45–1:52** — Copy eight ints, free the old block, and return a different address. Your old pointer is now a dangling pointer.

> Caption: If it cannot grow in place, realloc allocates elsewhere, copies the smaller of the two sizes, and frees the old block.

Exam-trap caption mode adds: *Even when realloc grows the block in place, the standard invalidates the pointer you passed in. The only valid pointer is the one realloc returns.*

**1:52–2:00** — The classic one-liner throws away the only pointer to a block that is still allocated.

> Caption: If it fails, realloc returns NULL and does not free the old block, so p = realloc(p, n) leaks on failure.

Exam-trap caption mode adds: *Write t = realloc(p, n); if (t) p = t; else { /* p is still valid */ }. Assigning the result straight back to p loses the old block when the call fails.*

## Scene 5. free releases a chunk, it does not erase it

*2:00 – 2:30 · objective: Separate what free does (returns the chunk to a bin) from what it does not do (zero the bytes, change your pointer, or end the object).*

**2:00–2:08** — The bytes are still there and still readable. That is exactly what makes use-after-free so quiet.

> Caption: free returns the chunk to the allocator. It does not zero the bytes and it does not change your pointer.

**2:08–2:16** — Reuse is the point. It is also why two live pointers to one block can appear without any mistake on your part.

> Caption: The released chunk goes on a free list, so the next allocation of that size may get the same address.

**2:16–2:23** — Setting it to NULL is a discipline, not a requirement, and it does not help a second pointer to the same block.

> Caption: After free, the pointer still holds the old address: it dangles, and reading through it is undefined behaviour.

Exam-trap caption mode adds: *free(p); p = NULL; prevents one class of bug. If q = p was taken earlier, q still dangles and nothing warns you.*

**2:23–2:30** — And char *p; *p = a is the third fault, an uninitialised pointer used before it was ever given an address.

> Caption: GATE CSE 2000 Q1.12 asks exactly this: m = malloc(5); m = NULL is lost memory, free(n) then n->value is dangling.

Exam-trap caption mode adds: *X is not dangling: m = NULL means there is no pointer left at all, so the block cannot be reached or freed. Lost memory and dangling are different faults.*

## Scene 6. Four ways to misuse the heap

*2:30 – 3:00 · objective: Name the four classic heap faults and match them to the GATE items that ask about them.*

**2:30–2:38** — A thousand allocations in a loop with no free is a thousand blocks the program can never reclaim.

> Caption: Leak: the block is still allocated but no pointer to it survives.

**2:38–2:45** — Undefined means the compiler may assume it never happens, so anything at all is a permitted outcome.

> Caption: Use after free: the block is gone but the pointer is used. The result is undefined, not necessarily a crash.

Exam-trap caption mode adds: *A program that prints the old value is not evidence that the code is correct. Undefined behaviour is allowed to look like it worked.*

**2:45–2:53** — free must receive a value that came back from an allocation function, and must receive it once.

> Caption: Double free and freeing a pointer you did not get from the allocator are both undefined behaviour.

**2:53–3:00** — P1 returns a dead stack address, P2 writes through garbage, P3 returns live heap memory. The answer is P1 and P2.

> Caption: GATE CSE 2001 Q2.18: returning the address of a local, or writing through an uninitialised pointer, are the faults; the malloc version is fine.

Exam-trap caption mode adds: *The word "likely" in the question is doing work. P3 is only wrong if malloc fails, which is rare; P1 and P2 are wrong on every run.*

## Scene 7. Doubling: why appending is amortised O(1)

*3:00 – 3:30 · objective: Count the copies made by a doubling growth policy and show the total is below 2n, so the average cost per append is a constant.*

**3:00–3:08** — Every append reallocates and copies everything, so appending n items copies about n squared over two elements.

> Caption: Growing an array by one each time costs 1 + 2 + 3 + ... copies, which is quadratic.

**3:08–3:15** — Each element is copied at most once per doubling it survives, and there are only log n doublings.

> Caption: Doubling the capacity makes the copies 1, 2, 4, 8, ..., whose total is below 2n.

**3:15–3:23** — Fifteen for sixteen items, because the sum 1 + 2 + 4 + 8 is one less than the final capacity.

> Caption: Appending 16 items from empty copies 15 elements in total, and 17 items copy 31.

**3:23–3:30** — Amortised does not mean every operation is cheap. It means the total is linear, so the average is constant.

> Caption: So the average cost per append is a constant, even though one append can cost O(n).

Exam-trap caption mode adds: *A single append can still take O(n). If a question asks for the worst case of one append, the answer is O(n); only the sequence is O(n) in total.*

## Scene 8. The malloc arithmetic traps

*3:30 – 4:00 · objective: Show how n * sizeof(T) wraps in a 32-bit size_t, and what sizeof(p) versus sizeof(*p) costs you.*

**3:30–3:38** — Eight bytes instead of forty, and the first write past byte eight corrupts the heap.

> Caption: malloc(sizeof(p)) allocates the size of a pointer, not of the object it points at.

**3:38–3:45** — Two to the thirty times four is exactly four gigabytes, and a 32-bit product cannot hold it, so you ask for zero bytes.

> Caption: n * sizeof(int) is computed in size_t. If n is 2^30 on a 32-bit size_t, the product is 2^32, which wraps to 0.

**3:45–3:53** — Compare n against SIZE_MAX divided by the element size. Division cannot overflow, so the test is safe.

> Caption: The fix is a division check before the multiplication, or calloc, which performs the check itself.

**3:53–4:00** — Five characters need six bytes, and strcpy writes all six.

> Caption: A string of length L needs L + 1 bytes: the terminator is a byte too.

Exam-trap caption mode adds: *strlen("hello") is 5. malloc(strlen(s)) allocates 5 bytes and strcpy writes 6, so the terminator lands one byte past the block.*

## Scene 9. Fragmentation: free bytes that do not fit

*4:00 – 4:30 · objective: Distinguish total free bytes from the largest free hole, and see why the second number is the one an allocation needs.*

**4:00–4:08** — The region is contiguous and every chunk is in use, so there is no free space at all.

> Caption: Six chunks of 32 bytes, all allocated, fill a 192-byte region.

**4:08–4:15** — Ninety-six bytes are available and they are in three pieces, because the surviving blocks sit between them.

> Caption: Freeing the second, fourth and sixth leaves three holes of 32 bytes: 96 free bytes in total.

**4:15–4:23** — Ninety-six free bytes, and the request still goes elsewhere. This is external fragmentation.

> Caption: A request for 40 bytes needs a 48-byte chunk, and no hole is that big, so the allocator takes new memory.

**4:23–4:30** — An allocation asks one question: is there a single piece big enough. Total free is the wrong statistic.

> Caption: So the number that matters is the largest free hole, not the total free bytes.

Exam-trap caption mode adds: *Compaction would fix it, and C cannot compact because it hands out real addresses. That is why a copying collector needs to be able to move objects, which C cannot promise.*

## Scene 10. The five questions for any malloc program

*4:30 – 5:00 · objective: Reduce every heap question to five checks, and separate what the C standard guarantees from what one implementation happens to do.*

**4:30–4:38** — Ownership, lifetime, initialisation, failure, and escape. Ask them in that order and the answer usually writes itself.

> Caption: Five questions decide almost every heap question: who owns it, when is it freed, is it initialised, is the result checked, does anything outlive the block.

**4:38–4:45** — Everything else on this page is one implementation: the 16-byte rounding, the 32-byte minimum, the bins, the segments.

> Caption: The standard guarantees n bytes, alignment for any type, NULL on failure, and nothing about where they are.

**4:45–4:53** — So this topic is the bridge between C pointers and the memory-management lesson in Operating Systems.

> Caption: The heap is also an operating-system object: malloc asks the kernel for pages with sbrk or mmap when its own region runs out.

**4:53–5:00** — Hold those three apart and the heap stops being mysterious.

> Caption: A block is a lifetime, not a variable: the pointer is yours, the bytes are borrowed, and the address is never guaranteed.

Exam-trap caption mode adds: *A pointer is not the block. Copying the pointer does not copy the bytes, and freeing one copy does not tell the other copies anything.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
