/* ==========================================================================
   dynamic-memory-and-program-layout — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'map',
      n: 1,
      title: 'Four storage durations, one memory map',
      start: 0, end: 30,
      objective: 'Place every C object into one of four storage durations, and see where each duration is implemented in a process image.'
    },
    {
      id: 'chunk',
      n: 2,
      title: 'The heap is a table of chunks',
      start: 30, end: 60,
      objective: 'Read a glibc chunk: an 8-byte header, a 16-byte alignment rule and a 32-byte minimum, so the bytes you asked for are not the bytes you got.'
    },
    {
      id: 'init',
      n: 3,
      title: 'malloc gives garbage, calloc gives zeros',
      start: 60, end: 90,
      objective: 'State exactly what malloc, calloc and realloc put in the bytes they hand back, and why all-bits-zero is not a portable zero.'
    },
    {
      id: 'grow',
      n: 4,
      title: 'realloc: grow, copy, or move',
      start: 90, end: 120,
      objective: 'Trace the three outcomes of realloc and the one rule that survives all of them: the old pointer is invalid whatever happened.'
    },
    {
      id: 'free',
      n: 5,
      title: 'free releases a chunk, it does not erase it',
      start: 120, end: 150,
      objective: 'Separate what free does (returns the chunk to a bin) from what it does not do (zero the bytes, change your pointer, or end the object).'
    },
    {
      id: 'wrong',
      n: 6,
      title: 'Four ways to misuse the heap',
      start: 150, end: 180,
      objective: 'Name the four classic heap faults and match them to the GATE items that ask about them.'
    },
    {
      id: 'double',
      n: 7,
      title: 'Doubling: why appending is amortised O(1)',
      start: 180, end: 210,
      objective: 'Count the copies made by a doubling growth policy and show the total is below 2n, so the average cost per append is a constant.'
    },
    {
      id: 'arith',
      n: 8,
      title: 'The malloc arithmetic traps',
      start: 210, end: 240,
      objective: 'Show how n * sizeof(T) wraps in a 32-bit size_t, and what sizeof(p) versus sizeof(*p) costs you.'
    },
    {
      id: 'frag',
      n: 9,
      title: 'Fragmentation: free bytes that do not fit',
      start: 240, end: 270,
      objective: 'Distinguish total free bytes from the largest free hole, and see why the second number is the one an allocation needs.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The five questions for any malloc program',
      start: 270, end: 300,
      objective: 'Reduce every heap question to five checks, and separate what the C standard guarantees from what one implementation happens to do.'
    }
  ],

  events: [
    /* ---------------- scene 1: map ---------------- */
    {
      id: 'map-1', start: 0, end: 8, scene: 'map',
      visualAction: 'show-durations',
      caption: 'Every C object has one of four storage durations: automatic, static, allocated, or thread.',
      narration: 'Storage duration is a lifetime, not a location. It says when the object comes into existence and when it stops existing.',
      keyword: 'storage duration',
      detail: 'The C standard names four storage durations: automatic (created when a block is entered, destroyed when it is left), static (the whole run of the program, initialised before main), allocated (created and destroyed only when you call the allocator), and thread (the lifetime of one thread).'
    },
    {
      id: 'map-2', start: 8, end: 16, scene: 'map',
      visualAction: 'draw-map',
      caption: 'Each duration is implemented in a region of the process image: text, data, bss, heap and stack.',
      narration: 'The code sits lowest, then initialised data, then zeroed data, then the heap, and the stack at the top.',
      keyword: 'process image',
      detail: 'On a Linux x86-64 ELF process the order from low address to high is: text (the machine code), read-only data such as string literals, data (initialised globals and statics), bss (zero-initialised globals and statics), the heap growing upward, and the stack growing downward from a high address.',
      trap: 'The C standard fixes none of this layout. The segment order is a linker and loader convention, so a question that asks "which segment" is asking about an implementation.'
    },
    {
      id: 'map-3', start: 16, end: 23, scene: 'map',
      visualAction: 'place-objects',
      caption: 'A local int lives on the stack; a global int lives in data or bss; a malloc block lives on the heap.',
      narration: 'The same type, three different homes, because the homes are chosen by storage duration and not by type.',
      keyword: 'stack data bss heap',
      detail: 'int g = 7; at file scope is static duration and lands in data because it has an initialiser. int z; at file scope is static duration and lands in bss because it has none. A block-scope int is automatic and lives in the current stack frame. malloc returns bytes from the heap, and those bytes have allocated duration.'
    },
    {
      id: 'map-4', start: 23, end: 30, scene: 'map',
      visualAction: 'lifetimes',
      caption: 'Static objects are zeroed before main; automatic and allocated objects start with whatever bytes were there.',
      narration: 'Zero for the static ones is a promise in the standard. For the others there is no promise at all.',
      keyword: 'zero-initialised',
      detail: 'Objects with static storage duration and no explicit initialiser are zero-initialised before the program starts, so int z; really is 0. An automatic object and a freshly malloc-ed block are indeterminate: reading them is not a value you can predict.',
      trap: 'A block-scope static int is also zeroed, and only once. That is the difference between static int count; inside a function and int count; inside the same function.'
    },

    /* ---------------- scene 2: chunk ---------------- */
    {
      id: 'chunk-1', start: 30, end: 38, scene: 'chunk',
      visualAction: 'draw-chunk',
      caption: 'The allocator does not hand you n bytes; it hands you a chunk that contains n bytes plus a header.',
      narration: 'Every block begins with a hidden word that records its size, and the allocator needs that word to free the block later.',
      keyword: 'chunk',
      detail: 'glibc stores two 8-byte fields immediately before the pointer it returns: the size of the previous chunk (used only when that chunk is free) and the size of this chunk together with three flag bits. That is 16 bytes of bookkeeping per allocation.'
    },
    {
      id: 'chunk-2', start: 38, end: 45, scene: 'chunk',
      visualAction: 'alignment-rule',
      caption: 'Chunks are rounded up to a multiple of 16 and never smaller than 32 bytes.',
      narration: 'Sixteen keeps every chunk aligned for any type; thirty-two is the smallest chunk that can also hold a free list when it is released.',
      keyword: 'sixteen byte alignment',
      detail: 'The rounding is request2size(req) = max(32, (req + 8 + 15) & ~15). The 8 is the size word that must fit, and the mask rounds up to the next multiple of 16.'
    },
    {
      id: 'chunk-3', start: 45, end: 52, scene: 'chunk',
      visualAction: 'table-req-chunk',
      caption: 'Ask for 1 byte and you get a 32-byte chunk with 24 usable bytes; ask for 25 and you get 48 with 40 usable.',
      narration: 'Usable is always chunk minus eight, and usable is never less than what you asked for.',
      keyword: 'usable size',
      detail: 'The table on screen is computed by the page: request 1, 8, 16, 17 and 24 all give a 32-byte chunk and 24 usable bytes. Request 25 gives 48 and 40 usable. Request 1000 gives 1008 and 1000 usable.'
    },
    {
      id: 'chunk-4', start: 52, end: 60, scene: 'chunk',
      visualAction: 'warn-usable',
      caption: 'Using the spare usable bytes is legal on glibc and is not portable C; only n bytes are yours by the standard.',
      narration: 'The standard promises n bytes. The extra is an implementation detail that a different allocator may not give you.',
      keyword: 'portable',
      trap: 'malloc_usable_size tells you the real figure, but writing past n and relying on it is the kind of code that breaks on another libc or under a sanitiser.'
    },

    /* ---------------- scene 3: init ---------------- */
    {
      id: 'init-1', start: 60, end: 68, scene: 'init',
      visualAction: 'malloc-bytes',
      caption: 'malloc returns uninitialised bytes. Whatever was in that memory before is what you will read.',
      narration: 'Eight bytes, all indeterminate. The standard says nothing about their contents.',
      keyword: 'uninitialised',
      detail: 'malloc allocates uninitialised storage. A freed block that is handed straight back often still contains the previous tenant\'s data, which is why an uninitialised read frequently looks plausible and hides the bug.'
    },
    {
      id: 'init-2', start: 68, end: 76, scene: 'init',
      visualAction: 'calloc-bytes',
      caption: 'calloc takes two arguments and zeroes every byte it returns.',
      narration: 'calloc of eight objects of one byte is eight zero bytes, and the multiplication is done for you.',
      keyword: 'calloc',
      detail: 'calloc(num, size) allocates num times size bytes and sets all of them to zero. Its two-argument form also lets the implementation check the multiplication for overflow, which the single-argument malloc form cannot do.'
    },
    {
      id: 'init-3', start: 76, end: 83, scene: 'init',
      visualAction: 'zero-trap',
      caption: 'All-bits-zero is zero for integers, but the standard does not promise it means 0.0 or a null pointer.',
      narration: 'On every common platform it does mean those things, and the standard still does not say so.',
      keyword: 'all bits zero',
      trap: 'calloc guarantees zero bytes, not zero values. For an array of pointers or doubles, initialise explicitly if you need the null pointer or 0.0 by the letter of the standard.'
    },
    {
      id: 'init-4', start: 83, end: 90, scene: 'init',
      visualAction: 'size-zero',
      caption: 'malloc(0) may return NULL or a unique pointer you must not dereference. The behaviour is implementation-defined.',
      narration: 'Zero is not an error and not a guarantee. If you get a pointer, free it; if you get NULL, that is not a failure.',
      keyword: 'malloc of zero',
      detail: 'If size is zero, the result is implementation-defined: a null pointer may be returned, or a non-null pointer that must not be dereferenced and must still be passed to free.'
    },

    /* ---------------- scene 4: grow ---------------- */
    {
      id: 'grow-1', start: 90, end: 98, scene: 'grow',
      visualAction: 'draw-realloc',
      caption: 'realloc asks for a new size for a block you already own.',
      narration: 'It may extend the block where it is, it may move it somewhere else, or it may fail.',
      keyword: 'realloc',
      detail: 'realloc(ptr, new_size) reallocates a block previously returned by malloc, calloc or realloc. If ptr is NULL it behaves like malloc; if new_size is zero the behaviour is implementation-defined.'
    },
    {
      id: 'grow-2', start: 98, end: 105, scene: 'grow',
      visualAction: 'realloc-inplace',
      caption: 'If the block can grow in place, the address does not change and nothing is copied.',
      narration: 'Same address, more bytes, and the new bytes at the end are undefined.',
      keyword: 'in place',
      detail: 'Growing in place leaves the original contents unchanged up to the old size. The bytes beyond the old size are undefined, not zero.'
    },
    {
      id: 'grow-3', start: 105, end: 112, scene: 'grow',
      visualAction: 'realloc-move',
      caption: 'If it cannot grow in place, realloc allocates elsewhere, copies the smaller of the two sizes, and frees the old block.',
      narration: 'Copy eight ints, free the old block, and return a different address. Your old pointer is now a dangling pointer.',
      keyword: 'copy and free',
      trap: 'Even when realloc grows the block in place, the standard invalidates the pointer you passed in. The only valid pointer is the one realloc returns.'
    },
    {
      id: 'grow-4', start: 112, end: 120, scene: 'grow',
      visualAction: 'realloc-fail',
      caption: 'If it fails, realloc returns NULL and does not free the old block, so p = realloc(p, n) leaks on failure.',
      narration: 'The classic one-liner throws away the only pointer to a block that is still allocated.',
      keyword: 'realloc failure',
      trap: 'Write t = realloc(p, n); if (t) p = t; else { /* p is still valid */ }. Assigning the result straight back to p loses the old block when the call fails.'
    },

    /* ---------------- scene 5: free ---------------- */
    {
      id: 'free-1', start: 120, end: 128, scene: 'free',
      visualAction: 'draw-free',
      caption: 'free returns the chunk to the allocator. It does not zero the bytes and it does not change your pointer.',
      narration: 'The bytes are still there and still readable. That is exactly what makes use-after-free so quiet.',
      keyword: 'free',
      detail: 'free(p) deallocates the space. If p is null it does nothing. It does not write zeros into the block, and it cannot change the value of your variable p, because it receives a copy of the address.'
    },
    {
      id: 'free-2', start: 128, end: 136, scene: 'free',
      visualAction: 'bins',
      caption: 'The released chunk goes on a free list, so the next allocation of that size may get the same address.',
      narration: 'Reuse is the point. It is also why two live pointers to one block can appear without any mistake on your part.',
      keyword: 'free list',
      detail: 'glibc keeps freed chunks in bins. A later malloc of a compatible size reuses one, so a stale pointer may silently start pointing at a different object.'
    },
    {
      id: 'free-3', start: 136, end: 143, scene: 'free',
      visualAction: 'dangling',
      caption: 'After free, the pointer still holds the old address: it dangles, and reading through it is undefined behaviour.',
      narration: 'Setting it to NULL is a discipline, not a requirement, and it does not help a second pointer to the same block.',
      keyword: 'dangling pointer',
      trap: 'free(p); p = NULL; prevents one class of bug. If q = p was taken earlier, q still dangles and nothing warns you.'
    },
    {
      id: 'free-4', start: 143, end: 150, scene: 'free',
      visualAction: 'gate-2000',
      caption: 'GATE CSE 2000 Q1.12 asks exactly this: m = malloc(5); m = NULL is lost memory, free(n) then n->value is dangling.',
      narration: 'And char *p; *p = a is the third fault, an uninitialised pointer used before it was ever given an address.',
      keyword: 'GATE 2000 Q1.12',
      detail: 'The matching is X with lost memory, Y with using dangling pointers, Z with using uninitialised pointers, which is option D. The question is about which fault each line commits, not about what the program prints.',
      trap: 'X is not dangling: m = NULL means there is no pointer left at all, so the block cannot be reached or freed. Lost memory and dangling are different faults.'
    },

    /* ---------------- scene 6: wrong ---------------- */
    {
      id: 'wrong-1', start: 150, end: 158, scene: 'wrong',
      visualAction: 'four-faults',
      caption: 'Leak: the block is still allocated but no pointer to it survives.',
      narration: 'A thousand allocations in a loop with no free is a thousand blocks the program can never reclaim.',
      keyword: 'leak',
      detail: 'A leak is allocated memory that can no longer be reached. It is not an error the C runtime reports: the process simply keeps growing until it exits.'
    },
    {
      id: 'wrong-2', start: 158, end: 165, scene: 'wrong',
      visualAction: 'dangling-fault',
      caption: 'Use after free: the block is gone but the pointer is used. The result is undefined, not necessarily a crash.',
      narration: 'Undefined means the compiler may assume it never happens, so anything at all is a permitted outcome.',
      keyword: 'use after free',
      trap: 'A program that prints the old value is not evidence that the code is correct. Undefined behaviour is allowed to look like it worked.'
    },
    {
      id: 'wrong-3', start: 165, end: 173, scene: 'wrong',
      visualAction: 'double-free',
      caption: 'Double free and freeing a pointer you did not get from the allocator are both undefined behaviour.',
      narration: 'free must receive a value that came back from an allocation function, and must receive it once.',
      keyword: 'double free',
      detail: 'The behaviour is undefined if the pointer does not equal a value returned earlier by an allocation function, or if that block has already been deallocated. Freeing a pointer into the middle of a block is the same fault: it is not the value that was returned.'
    },
    {
      id: 'wrong-4', start: 173, end: 180, scene: 'wrong',
      visualAction: 'gate-2001',
      caption: 'GATE CSE 2001 Q2.18: returning the address of a local, or writing through an uninitialised pointer, are the faults; the malloc version is fine.',
      narration: 'P1 returns a dead stack address, P2 writes through garbage, P3 returns live heap memory. The answer is P1 and P2.',
      keyword: 'GATE 2001 Q2.18',
      detail: 'The correct option is "only P1 and P2". P3 is not a fault, though its caller must free the block to avoid a leak, and though malloc can in principle return NULL and must be checked in real code.',
      trap: 'The word "likely" in the question is doing work. P3 is only wrong if malloc fails, which is rare; P1 and P2 are wrong on every run.'
    },

    /* ---------------- scene 7: double ---------------- */
    {
      id: 'double-1', start: 180, end: 188, scene: 'double',
      visualAction: 'growth-bars',
      caption: 'Growing an array by one each time costs 1 + 2 + 3 + ... copies, which is quadratic.',
      narration: 'Every append reallocates and copies everything, so appending n items copies about n squared over two elements.',
      keyword: 'quadratic',
      detail: 'If the capacity grows by exactly one on each append, appending n items performs 0 + 1 + 2 + ... + (n-1) copies, which is n(n-1)/2, so the average cost per append grows with n.'
    },
    {
      id: 'double-2', start: 188, end: 195, scene: 'double',
      visualAction: 'doubling-bars',
      caption: 'Doubling the capacity makes the copies 1, 2, 4, 8, ..., whose total is below 2n.',
      narration: 'Each element is copied at most once per doubling it survives, and there are only log n doublings.',
      keyword: 'doubling',
      detail: 'With capacities 1, 2, 4, 8, ... the copies performed are the old capacities: 0, 1, 2, 4, 8 and so on. Their sum before a capacity of 2^k is 2^k - 1.'
    },
    {
      id: 'double-3', start: 195, end: 203, scene: 'double',
      visualAction: 'copies-table',
      caption: 'Appending 16 items from empty copies 15 elements in total, and 17 items copy 31.',
      narration: 'Fifteen for sixteen items, because the sum 1 + 2 + 4 + 8 is one less than the final capacity.',
      keyword: 'total copies',
      detail: 'The page computes this table rather than quoting it: for n items the total copies equal 2^ceil(log2 n) - 1, which is n - 1 exactly when n is a power of two. Every row is checked against the running simulation.'
    },
    {
      id: 'double-4', start: 203, end: 210, scene: 'double',
      visualAction: 'amortised',
      caption: 'So the average cost per append is a constant, even though one append can cost O(n).',
      narration: 'Amortised does not mean every operation is cheap. It means the total is linear, so the average is constant.',
      keyword: 'amortised O(1)',
      trap: 'A single append can still take O(n). If a question asks for the worst case of one append, the answer is O(n); only the sequence is O(n) in total.'
    },

    /* ---------------- scene 8: arith ---------------- */
    {
      id: 'arith-1', start: 210, end: 218, scene: 'arith',
      visualAction: 'sizeof-trap',
      caption: 'malloc(sizeof(p)) allocates the size of a pointer, not of the object it points at.',
      narration: 'Eight bytes instead of forty, and the first write past byte eight corrupts the heap.',
      keyword: 'sizeof pointer',
      detail: 'sizeof(p) is the size of the pointer, 8 on x86-64. sizeof(*p) is the size of one element, 4 for an int. For ten ints the allocation must be 40 bytes, so sizeof(p) gives 8 and is wrong by 32 bytes.'
    },
    {
      id: 'arith-2', start: 218, end: 225, scene: 'arith',
      visualAction: 'multiply-overflow',
      caption: 'n * sizeof(int) is computed in size_t. If n is 2^30 on a 32-bit size_t, the product is 2^32, which wraps to 0.',
      narration: 'Two to the thirty times four is exactly four gigabytes, and a 32-bit product cannot hold it, so you ask for zero bytes.',
      keyword: 'integer overflow',
      detail: 'The multiplication happens before malloc is called, in type size_t. On a 32-bit size_t the product 2^30 * 4 is 2^32, which is congruent to 0, so malloc receives 0 and the following writes run off the end of a tiny block.'
    },
    {
      id: 'arith-3', start: 225, end: 233, scene: 'arith',
      visualAction: 'overflow-check',
      caption: 'The fix is a division check before the multiplication, or calloc, which performs the check itself.',
      narration: 'Compare n against SIZE_MAX divided by the element size. Division cannot overflow, so the test is safe.',
      keyword: 'SIZE_MAX',
      detail: 'if (n > SIZE_MAX / sizeof *p) { /* refuse */ } else p = malloc(n * sizeof *p);. calloc(num, size) is specified to return NULL when the product cannot be represented, which is why it takes two arguments.'
    },
    {
      id: 'arith-4', start: 233, end: 240, scene: 'arith',
      visualAction: 'string-plus-one',
      caption: 'A string of length L needs L + 1 bytes: the terminator is a byte too.',
      narration: 'Five characters need six bytes, and strcpy writes all six.',
      keyword: 'plus one',
      trap: 'strlen("hello") is 5. malloc(strlen(s)) allocates 5 bytes and strcpy writes 6, so the terminator lands one byte past the block.'
    },

    /* ---------------- scene 9: frag ---------------- */
    {
      id: 'frag-1', start: 240, end: 248, scene: 'frag',
      visualAction: 'six-chunks',
      caption: 'Six chunks of 32 bytes, all allocated, fill a 192-byte region.',
      narration: 'The region is contiguous and every chunk is in use, so there is no free space at all.',
      keyword: 'allocated region',
      detail: 'The page models the region as six chunks of 32 bytes each, which is what glibc gives for six requests of 24 bytes or fewer. The total is 192 bytes.'
    },
    {
      id: 'frag-2', start: 248, end: 255, scene: 'frag',
      visualAction: 'free-three',
      caption: 'Freeing the second, fourth and sixth leaves three holes of 32 bytes: 96 free bytes in total.',
      narration: 'Ninety-six bytes are available and they are in three pieces, because the surviving blocks sit between them.',
      keyword: 'holes',
      detail: 'The free bytes are not adjacent, so no single free region is larger than 32 bytes even though the total is 96.'
    },
    {
      id: 'frag-3', start: 255, end: 263, scene: 'frag',
      visualAction: 'request-40',
      caption: 'A request for 40 bytes needs a 48-byte chunk, and no hole is that big, so the allocator takes new memory.',
      narration: 'Ninety-six free bytes, and the request still goes elsewhere. This is external fragmentation.',
      keyword: 'external fragmentation',
      detail: 'The required chunk is 48 bytes because request2size(40) is 48. The largest hole is 32, so the allocation cannot be satisfied in place and the region grows even though it holds 96 unused bytes.'
    },
    {
      id: 'frag-4', start: 263, end: 270, scene: 'frag',
      visualAction: 'largest-hole',
      caption: 'So the number that matters is the largest free hole, not the total free bytes.',
      narration: 'An allocation asks one question: is there a single piece big enough. Total free is the wrong statistic.',
      keyword: 'largest hole',
      trap: 'Compaction would fix it, and C cannot compact because it hands out real addresses. That is why a copying collector needs to be able to move objects, which C cannot promise.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 'proc-1', start: 270, end: 278, scene: 'procedure',
      visualAction: 'five-questions',
      caption: 'Five questions decide almost every heap question: who owns it, when is it freed, is it initialised, is the result checked, does anything outlive the block.',
      narration: 'Ownership, lifetime, initialisation, failure, and escape. Ask them in that order and the answer usually writes itself.',
      keyword: 'five questions',
      detail: 'Ownership: which pointer is responsible for the free. Lifetime: at which point the block must still exist. Initialisation: whether the first read is defined. Failure: whether NULL was tested. Escape: whether a pointer to a dead block leaves the scope that owned it.'
    },
    {
      id: 'proc-2', start: 278, end: 285, scene: 'procedure',
      visualAction: 'guaranteed-vs-impl',
      caption: 'The standard guarantees n bytes, alignment for any type, NULL on failure, and nothing about where they are.',
      narration: 'Everything else on this page is one implementation: the 16-byte rounding, the 32-byte minimum, the bins, the segments.',
      keyword: 'guaranteed',
      detail: 'Guaranteed by the standard: a block of at least n bytes, suitably aligned for any object type with fundamental alignment, uninitialised, and NULL on failure. Not guaranteed: the address, the extra usable bytes, the layout of the process image, and what free leaves in the bytes.'
    },
    {
      id: 'proc-3', start: 285, end: 293, scene: 'procedure',
      visualAction: 'cross-links',
      caption: 'The heap is also an operating-system object: malloc asks the kernel for pages with sbrk or mmap when its own region runs out.',
      narration: 'So this topic is the bridge between C pointers and the memory-management lesson in Operating Systems.',
      keyword: 'sbrk and mmap',
      detail: 'glibc serves most requests from memory it already holds, and asks the kernel for more with sbrk or mmap only when it must. That is why malloc does not always cause a system call, which is what GATE CSE 2021 Set 1 asks.'
    },
    {
      id: 'proc-4', start: 293, end: 300, scene: 'procedure',
      visualAction: 'close',
      caption: 'A block is a lifetime, not a variable: the pointer is yours, the bytes are borrowed, and the address is never guaranteed.',
      narration: 'Hold those three apart and the heap stops being mysterious.',
      keyword: 'lifetime',
      trap: 'A pointer is not the block. Copying the pointer does not copy the bytes, and freeing one copy does not tell the other copies anything.'
    }
  ]
};
