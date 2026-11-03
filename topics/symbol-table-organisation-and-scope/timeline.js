/* ==========================================================================
   symbol-table-organisation-and-scope — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'dict', n: 1,
      title: 'A dictionary of declarations',
      start: 0, end: 30,
      objective: 'See the symbol table as a map from a declared name to the attributes the compiler knows, created by the lexer and read by every phase after it.'
    },
    {
      id: 'list', n: 2,
      title: 'The linear list, counted',
      start: 30, end: 60,
      objective: 'Establish that an unsorted list must scan to find a duplicate, so eight names cost a triangle of 28 comparisons, and that this is quadratic in the number of names.'
    },
    {
      id: 'tree', n: 3,
      title: 'The search tree, and the order that ruins it',
      start: 60, end: 90,
      objective: 'Show the same eight names in two trees: alphabetical insertion gives a chain of height seven costing 28 comparisons, median-first insertion gives height three costing 13.'
    },
    {
      id: 'hash', n: 4,
      title: 'Eleven buckets, eight names',
      start: 90, end: 120,
      objective: 'Draw the bucket array and the chains, and read the occupation density, the longest chain and the number of comparisons a lookup costs from the drawing.'
    },
    {
      id: 'cost', n: 5,
      title: 'Three costs side by side',
      start: 120, end: 150,
      objective: 'Put the deciding quantity of each organisation next to its cost, and see that every cost is a claim about an assumption rather than a property of the word "table".'
    },
    {
      id: 'scope', n: 6,
      title: 'One name, two meanings',
      start: 150, end: 180,
      objective: 'Read a program with a shadowed name and see that the two declarations are two entries, and that the inner one is what a use inside the block resolves to.'
    },
    {
      id: 'stack', n: 7,
      title: 'The stack of tables',
      start: 180, end: 210,
      objective: 'Walk a lookup outward from the innermost table, count the probes for each name, and see the pop that makes the hidden binding visible again.'
    },
    {
      id: 'one', n: 8,
      title: 'One table, duplicates and a log',
      start: 210, end: 240,
      objective: 'Compare the stack of tables with the single table that keeps duplicate keys and a log of what each scope added, and read the cost of each choice.'
    },
    {
      id: 'entry', n: 9,
      title: 'Where each entry goes',
      start: 240, end: 270,
      objective: 'Place a function name in the enclosing table and its parameters in its own, count the six entries of the worked program, and see why a prototype is needed.'
    },
    {
      id: 'gate', n: 10,
      title: 'What a question actually asks',
      start: 270, end: 300,
      objective: 'Reduce the topic to the three question shapes and the five-step procedure that answers all of them.'
    }
  ],

  events: [
    /* ---------------- scene 1: a dictionary ---------------- */
    {
      id: 'e01', scene: 'dict', start: 0, end: 6,
      caption: 'A symbol table maps every declared name to what the compiler knows about it.',
      narration: 'A symbol table is a dictionary. The key is a name from the source program. The value is everything the compiler has worked out about that name.',
      detail: 'The value is a record, not a single field. For a variable it holds a type, a scope, a storage class and an offset; for a function it holds the parameter types and the return type. Nothing in the record is a run-time value.',
      keyword: 'a dictionary'
    },
    {
      id: 'e02', scene: 'dict', start: 6, end: 12,
      caption: 'The key is the name; the value is the attributes.',
      narration: 'For the name count the record might read: integer, block scope, automatic storage, offset minus four. Four facts, one line.',
      detail: 'Which attributes are mandatory depends on the language. A language with no static types needs fewer of them at compile time, and that is a fact about the language rather than about the table.',
      keyword: 'the attributes',
      trap: 'The record holds the address at which the value will live, never the value itself.'
    },
    {
      id: 'e03', scene: 'dict', start: 12, end: 18,
      caption: 'Two operations, insert and lookup, and nothing else is essential.',
      narration: 'Every symbol table offers the same two core operations. Insert adds a binding. Lookup retrieves the binding for a name.',
      detail: 'Real implementations add more: delete, and a scope push and pop. Those are conveniences built on the same two, and the cost questions on this page are all questions about insert and lookup.',
      keyword: 'insert and lookup'
    },
    {
      id: 'e04', scene: 'dict', start: 18, end: 24,
      caption: 'Created in lexical analysis, read by every phase after it.',
      narration: 'The lexer meets the first identifier and the table begins there. The parser adds declarations. Semantic analysis reads and writes types. Code generation reads offsets.',
      detail: 'That is why a statement saying the table is not needed after parsing is false. Every phase touches it, which is exactly what makes the table a shared structure rather than a lexer detail.',
      keyword: 'every phase after it',
      trap: '"Created in lexical analysis" and "used only by lexical analysis" are different claims, and only the first is true.'
    },
    {
      id: 'e05', scene: 'dict', start: 24, end: 30,
      caption: 'A table of declarations is not a table of data.',
      narration: 'One structure records what the compiler decided. A different structure, built later and at run time, holds the values a running program stores.',
      detail: 'The first is the symbol table. The second is the activation record. A question about the address of a variable in a recursive call is about the second; a question about how many entries a program creates is about the first.',
      keyword: 'not a table of data'
    },

    /* ---------------- scene 2: linear list ---------------- */
    {
      id: 'e06', scene: 'list', start: 30, end: 36,
      caption: 'Eight names arrive in the order the compiler meets them.',
      narration: 'Here are eight names from one small program, in the order they appear. The simplest organisation appends each one to the end of a single list.',
      detail: 'The order is the order of the source text, not alphabetical order. A list has no reason to sort, and sorting would cost work at every insert.',
      keyword: 'in the order'
    },
    {
      id: 'e07', scene: 'list', start: 36, end: 42,
      caption: 'Before appending, the insert scans for a duplicate.',
      narration: 'Appending is free. Finding out whether the name is already there is not. The insert walks the entries already present, one comparison each.',
      detail: 'The scan is not optional. Without it a name declared twice in the same scope would silently produce two entries, and the error the compiler owes the programmer would never be reported.',
      keyword: 'scans for a duplicate'
    },
    {
      id: 'e08', scene: 'list', start: 42, end: 48,
      caption: 'The first insert scans nothing; the eighth scans seven.',
      narration: 'So the comparisons per insert are zero, then one, then two, up to seven for the last name. The work grows with every name already in the table.',
      detail: 'These are counts, not estimates. Each number is the length of the list at the moment of that insert, and the model computes it by running the inserts.',
      keyword: 'scans nothing'
    },
    {
      id: 'e09', scene: 'list', start: 48, end: 54,
      caption: 'Twenty-eight comparisons in total, which is eight times seven over two.',
      narration: 'Add the eight counts and the answer is twenty-eight. In general n names cost n times n minus one, divided by two.',
      detail: 'That formula is the sum of the first n minus one integers. It is quadratic in n, so doubling the number of names multiplies the build cost by about four.',
      keyword: 'Twenty-eight',
      trap: 'Answering 8 counts the entries; answering 36 forgets to subtract the missing term.'
    },
    {
      id: 'e10', scene: 'list', start: 54, end: 60,
      caption: 'A lookup in the worst case walks the whole list.',
      narration: 'The same scan answers a lookup. A name that is present at the end, or absent altogether, costs a comparison against every entry.',
      detail: 'On average a present name costs half the list, which is why the average is quoted as n over two. The worst case is what a GATE option usually means by the cost of the structure.',
      keyword: 'walks the whole list'
    },

    /* ---------------- scene 3: search tree ---------------- */
    {
      id: 'e11', scene: 'tree', start: 60, end: 66,
      caption: 'A search tree compares once per level, so the height is the cost.',
      narration: 'A binary search tree keeps names ordered. Each comparison rules out one side, so the work of an insert is the depth at which the name lands.',
      detail: 'The tree is ordered by the comparison the language allows on identifiers, usually a lexicographic order. Every node left of a name is smaller and every node right of it is larger.',
      keyword: 'the height is the cost'
    },
    {
      id: 'e12', scene: 'tree', start: 66, end: 72,
      caption: 'Inserted alphabetically, every name hangs off the right of the last.',
      narration: 'Here the same eight names arrive in alphabetical order. Each is larger than all of its predecessors, so each becomes the right child of the previous one.',
      detail: 'The result has one path and no branching. Its height is seven, which is n minus one, and it is a linked list that happens to carry two pointers per node.',
      keyword: 'hangs off the right'
    },
    {
      id: 'e13', scene: 'tree', start: 72, end: 78,
      caption: 'That tree costs twenty-eight comparisons, exactly the list.',
      narration: 'The chain gives depths zero to seven, so the total is again twenty-eight. A search tree built from sorted input is not faster than a list; it is the same work with more machinery.',
      detail: 'This is the counterexample to "a tree is logarithmic". The logarithmic claim is about a balanced tree, and nothing in the plain insertion algorithm balances anything.',
      keyword: 'exactly the list',
      trap: 'The insertion order decides the shape. A question that does not state the order does not fix the cost.'
    },
    {
      id: 'e14', scene: 'tree', start: 78, end: 84,
      caption: 'Inserted median-first, the tree stays shallow: height three.',
      narration: 'Now the same eight names arrive in an order that puts the middle name first. The tree branches instead of stretching, and its height falls to three.',
      detail: 'Each comparison still rules out one side, but now each level halves what remains. That is where the logarithm comes from, and it needs the shape, not just the word tree.',
      keyword: 'height three'
    },
    {
      id: 'e15', scene: 'tree', start: 84, end: 90,
      caption: 'Thirteen comparisons against twenty-eight, from the order alone.',
      narration: 'The total falls from twenty-eight to thirteen. Same names, same algorithm, half the work, and the only thing that changed was the sequence.',
      detail: 'That is why compilers that use a tree usually use a balanced one: an AVL or red-black tree keeps the height logarithmic whatever order the source presents, at the price of rotations on insert.',
      keyword: 'Thirteen'
    },

    /* ---------------- scene 4: hash table ---------------- */
    {
      id: 'e16', scene: 'hash', start: 90, end: 96,
      caption: 'A hash table turns the name into a bucket number.',
      narration: 'The third organisation does not search at all. It computes. The characters of the name are combined into a number, and the remainder gives a bucket.',
      detail: 'The function here adds the character codes and takes the remainder modulo eleven, the number of buckets. Any spreading function would do; this one is small enough to follow by hand.',
      keyword: 'into a bucket number'
    },
    {
      id: 'e17', scene: 'hash', start: 96, end: 102,
      caption: 'main and count both land in bucket three.',
      narration: 'main hashes to three and so does count. Two different names, one bucket. That is a collision, and it is normal rather than an error.',
      detail: 'Chaining resolves it: each bucket is the head of a short list, and every entry whose key hashes there is appended to that list. Nothing is overwritten and nothing is moved.',
      keyword: 'one bucket'
    },
    {
      id: 'e18', scene: 'hash', start: 102, end: 108,
      caption: 'Eight entries, six buckets used, longest chain two.',
      narration: 'All eight names fit into six of the eleven buckets, and two of those buckets hold two names each. The longest chain is therefore two.',
      detail: 'The chain lengths must add up to the number of entries, and here they do: one plus two plus two plus one plus one plus one is eight. That sum is the check that catches an arithmetic slip.',
      keyword: 'longest chain two'
    },
    {
      id: 'e19', scene: 'hash', start: 108, end: 114,
      caption: 'Occupation density is entries over buckets: eight elevenths.',
      narration: 'The load on the table is eight entries in eleven buckets, about zero point seven three. That fraction is what decides how long the chains tend to be.',
      detail: 'With chaining the density can exceed one and the structure still works, since each bucket is a list. With open addressing it cannot, because a full table has nowhere to put a new key.',
      keyword: 'eight elevenths',
      trap: 'Inverting the fraction gives buckets per entry, which is a different quantity and answers nothing.'
    },
    {
      id: 'e20', scene: 'hash', start: 114, end: 120,
      caption: 'A lookup probes one bucket and compares against its chain.',
      narration: 'Looking up main costs one bucket computation and at most two comparisons. The whole table is never scanned, and the number of entries elsewhere does not matter.',
      detail: 'That last sentence is the whole promise of hashing, and it holds only while the chains stay short. A hash function that sends every name to bucket zero restores the list and its full scan.',
      keyword: 'one bucket'
    },

    /* ---------------- scene 5: three costs ---------------- */
    {
      id: 'e21', scene: 'cost', start: 120, end: 126,
      caption: 'Each organisation has one quantity that decides its cost.',
      narration: 'For the list it is the number of entries already present. For the tree it is the height. For the hash table it is the length of the chain the key lands in.',
      detail: 'Naming that quantity is most of the answer to a cost question. The rest is arithmetic on the numbers the question gave.',
      keyword: 'one quantity'
    },
    {
      id: 'e22', scene: 'cost', start: 126, end: 132,
      caption: 'Building: twenty-eight against thirteen against eight inserts.',
      narration: 'Building the table of eight names costs twenty-eight comparisons as a list, thirteen as a well-shaped tree, and one bucket computation per name as a hash table.',
      detail: 'The hash table also compares inside the chains, so its build cost is eight bucket computations plus two comparisons against existing entries: ten operations in this arrangement, against 28 comparisons for the list.',
      keyword: 'Building'
    },
    {
      id: 'e23', scene: 'cost', start: 132, end: 138,
      caption: 'Looking up: the list scans, the tree descends, the bucket is computed.',
      narration: 'A lookup in the list walks entries. A lookup in the tree walks levels. A lookup in the hash table computes an address and walks a chain.',
      detail: 'The three are not three speeds of one idea. They are three different amounts of work, and the amount is fixed by the structure rather than by the size of the program.',
      keyword: 'Looking up'
    },
    {
      id: 'e24', scene: 'cost', start: 138, end: 144,
      caption: 'Every cost is a claim about an assumption.',
      narration: 'The tree is logarithmic only if it is balanced. The hash table is constant only if the function spreads and the load stays low. The list is linear always.',
      detail: 'So a cost quoted without its assumption is not a fact about symbol tables at all. It is a fact about one arrangement of one structure, and a question can be built to punish the missing half.',
      keyword: 'about an assumption',
      trap: 'The worst case of a hash table is linear, and one bad bucket reaches it.'
    },
    {
      id: 'e25', scene: 'cost', start: 144, end: 150,
      caption: 'Which is why the answer names the structure, the quantity and the case.',
      narration: 'A complete answer has three parts. Name the structure. Name the quantity that decides it. Say whether you mean the average or the worst case.',
      detail: 'That sentence is the marking scheme for every cost question on this topic, and it is also the sentence that makes the answer checkable by someone else.',
      keyword: 'three parts'
    },

    /* ---------------- scene 6: one name, two meanings ---------------- */
    {
      id: 'e26', scene: 'scope', start: 150, end: 156,
      caption: 'This program declares count twice, in two different blocks.',
      narration: 'Here is a program with a name declared twice. Once in the body of main, and once again inside an inner pair of braces.',
      detail: 'The language allows it. The inner declaration is a new variable with the same spelling, and for the length of that block the spelling means the new one.',
      keyword: 'declares count twice'
    },
    {
      id: 'e27', scene: 'scope', start: 156, end: 162,
      caption: 'Two declarations mean two entries, not one.',
      narration: 'So the table does not hold one line for count. It holds two, in two different tables, with different attributes and different offsets.',
      detail: 'This is the single most common counting error on the topic. A question that asks for the number of entries is asking for declarations, and a name that is declared twice contributes twice.',
      keyword: 'two entries',
      trap: 'Counting distinct spellings gives one too few for this program.'
    },
    {
      id: 'e28', scene: 'scope', start: 162, end: 168,
      caption: 'Inside the block, count means the inner declaration.',
      narration: 'When the statement inside the block assigns to count, the compiler resolves it to the inner entry. The outer variable is not touched at all.',
      detail: 'That is shadowing. The outer binding still exists, still holds whatever it held, and is simply not reachable by that spelling while the inner declaration is in force.',
      keyword: 'the inner declaration'
    },
    {
      id: 'e29', scene: 'scope', start: 168, end: 174,
      caption: 'The closing brace ends the inner meaning.',
      narration: 'At the closing brace the inner declaration goes out of scope, and the same spelling means the outer variable again.',
      detail: 'Nothing was undone in the outer record. The inner binding was removed from the compiler\'s view, and the outer one was never changed, which is why shadowing costs nothing at run time.',
      keyword: 'ends the inner meaning'
    },
    {
      id: 'e30', scene: 'scope', start: 174, end: 180,
      caption: 'Six entries, five reachable names.',
      narration: 'At the deepest point the program has six entries and five names that can be reached. The difference is the shadowed count.',
      detail: 'Both numbers are answers to real questions, and they are different questions: how many entries the tables hold, and how many names this statement can see.',
      keyword: 'Six entries'
    },

    /* ---------------- scene 7: the stack ---------------- */
    {
      id: 'e31', scene: 'stack', start: 180, end: 186,
      caption: 'Entering a block pushes a table; leaving it pops one.',
      narration: 'The usual implementation keeps one table per scope, in a stack. The brace pushes a new table and the closing brace pops it.',
      detail: 'Each push and each pop is one operation on the stack, independent of how many entries the table holds. That is why scope entry and exit are cheap even in a long program.',
      keyword: 'pushes a table'
    },
    {
      id: 'e32', scene: 'stack', start: 186, end: 192,
      caption: 'A lookup starts at the top and walks outward.',
      narration: 'To resolve a name, the compiler looks in the innermost table first, then the next one out, and stops at the first match.',
      detail: 'Stopping at the first match is what makes shadowing work. Continuing past it would find the hidden binding and resolve the name to the wrong declaration.',
      keyword: 'walks outward'
    },
    {
      id: 'e33', scene: 'stack', start: 192, end: 198,
      caption: 'count costs one probe; total costs three.',
      narration: 'Inside the inner block, count is found in the top table after one probe. total is not there, nor in main\'s table, so it is found in the global table after three.',
      detail: 'The probes are counted, not estimated. Each probe is a constant-time hash lookup, so the cost of the walk is the number of tables, which is the nesting depth.',
      keyword: 'three'
    },
    {
      id: 'e34', scene: 'stack', start: 198, end: 204,
      caption: 'So a lookup costs the depth, not one operation.',
      narration: 'A table of tables is not one constant-time lookup. It is one constant-time lookup per enclosing scope, so the cost is proportional to how deeply the name is buried.',
      detail: 'In ordinary programs the depth is small, which is why the structure is used. The claim that must survive a question, though, is the accurate one: constant per probe, linear in the number of probes.',
      keyword: 'costs the depth',
      trap: 'Saying "hash tables are O(1), so the symbol table is O(1)" drops the walk entirely.'
    },
    {
      id: 'e35', scene: 'stack', start: 204, end: 210,
      caption: 'The pop is what brings the outer binding back.',
      narration: 'When the block ends, its table is discarded. The outer count is now the first match, so the same spelling resolves to it with no change to any record.',
      detail: 'This is why the two-table arrangement needs no delete operation on individual entries: the whole table goes, and every binding it held goes with it.',
      keyword: 'brings the outer binding back'
    },

    /* ---------------- scene 8: one table with a log ---------------- */
    {
      id: 'e36', scene: 'one', start: 210, end: 216,
      caption: 'A single table can do the same job, with duplicate keys.',
      narration: 'The alternative keeps one table for the whole program and allows the same key to appear more than once, in the same bucket.',
      detail: 'The newest binding is put at the head of its chain, so the first match walking the chain is the innermost declaration. Scope order is stored in the chain rather than in a stack of tables.',
      keyword: 'duplicate keys'
    },
    {
      id: 'e37', scene: 'one', start: 216, end: 222,
      caption: 'The first match in the bucket is the innermost binding.',
      narration: 'Because the newest entry sits at the front, a lookup is one hash and one comparison against the head of the chain. No walk through scopes is needed.',
      detail: 'That is the attraction. The cost of resolving a name stops depending on the nesting depth, because the depth is encoded in the order of the chain.',
      keyword: 'first match'
    },
    {
      id: 'e38', scene: 'one', start: 222, end: 228,
      caption: 'A log records what each scope added, so the exit can undo it.',
      narration: 'Leaving a block has to remove exactly the bindings that block added. A log of insertions, with a marker at each scope entry, gives the exit that list.',
      detail: 'The log is a list of the keys inserted, in order, with a marker pushed on each scope entry. On exit the log is unwound back to the marker and each key is removed from its chain.',
      keyword: 'A log'
    },
    {
      id: 'e39', scene: 'one', start: 228, end: 234,
      caption: 'So lookup is constant and the exit is constant on average.',
      narration: 'The result is one hash per lookup whatever the depth, and an exit whose cost is the number of bindings that block added, spread over the inserts that created them.',
      detail: 'The exit is amortised constant because every entry removed was inserted once. Total work over the whole compilation is proportional to the number of insertions, not to the number of scopes.',
      keyword: 'constant on average'
    },
    {
      id: 'e40', scene: 'one', start: 234, end: 240,
      caption: 'The stack is easier to build; the single table is faster to read.',
      narration: 'Two arrangements, two trade-offs. The stack of tables is simpler and discards a scope wholesale. The single table is faster per lookup and needs a log to unwind.',
      detail: 'Both are used by real compilers. A question that describes one of them and asks for the cost is testing whether you can see which quantity the arrangement makes cheap.',
      keyword: 'two trade-offs'
    },

    /* ---------------- scene 9: where each entry goes ---------------- */
    {
      id: 'e41', scene: 'entry', start: 240, end: 246,
      caption: 'The global table holds total and main.',
      narration: 'Start at the outermost scope. The variable total is declared there, and so is the function main. Two entries in the global table.',
      detail: 'The function\'s name belongs here because this is the scope that calls it. A caller looks in its own table, so a name placed anywhere else would be invisible to the code that needs it.',
      keyword: 'total and main'
    },
    {
      id: 'e42', scene: 'entry', start: 246, end: 252,
      caption: 'main\'s own table holds count and rate, and not main.',
      narration: 'Inside the function, two more declarations. They go in a new table, which is pushed when the body begins. The function\'s own name is not repeated here.',
      detail: 'Parameters would go in this same table, because only the body uses them. The name is outward and the parameters are inward, and that split is one of the most frequently tested details on the topic.',
      keyword: 'count and rate',
      trap: 'Putting the function name in its own table leaves callers unable to find it.'
    },
    {
      id: 'e43', scene: 'entry', start: 252, end: 258,
      caption: 'The inner block adds a second count and code.',
      narration: 'The braces push a third table, holding the inner count and the character code. Six entries now exist across the three tables.',
      detail: 'Two plus two plus two. The count is the sum over scopes, not the number of distinct names, and that is why the answer to the entry-count question is six rather than five.',
      keyword: 'second count and code'
    },
    {
      id: 'e44', scene: 'entry', start: 258, end: 264,
      caption: 'Which is why a later function cannot be called without a prototype.',
      narration: 'An entry exists only from the point the declaration is met. A body compiled before a later function\'s declaration cannot see it, because it is not in the table yet.',
      detail: 'A prototype places the name and its signature in the enclosing table early, so that bodies compiled before the definition can still resolve the call. That is what a prototype is for, and it is a fact about the table rather than about syntax.',
      keyword: 'without a prototype'
    },
    {
      id: 'e45', scene: 'entry', start: 264, end: 270,
      caption: 'Six entries, three tables, one shadowed name.',
      narration: 'So the worked program has six entries, in three tables, and exactly one name that is hidden rather than absent.',
      detail: 'Every number here is produced by the model and re-derived a second way: the entry count by summing per-scope counts, and again by counting the declarations in the source text.',
      keyword: 'three tables'
    },

    /* ---------------- scene 10: what a question asks ---------------- */
    {
      id: 'e46', scene: 'gate', start: 270, end: 276,
      caption: 'Shape one: which statement about the table is false.',
      narration: 'The first shape gives four statements and asks which one is wrong. The reasoning is a check of each statement against the list of phases.',
      detail: 'The statements that are usually true are: created during lexical analysis, used by all phases, implementable as a tree or a hash table, and responsible for scope. The false one is usually a claim that it stops being needed.',
      keyword: 'which statement'
    },
    {
      id: 'e47', scene: 'gate', start: 276, end: 282,
      caption: 'Shape two: how many entries, or which binding.',
      narration: 'The second shape gives a program with nested blocks and asks for the number of entries, or for the declaration a particular use resolves to.',
      detail: 'The procedure is fixed: one table per block, one entry per declaration, the function name outward, the parameters inward, and a lookup that walks from the innermost table and stops at the first match.',
      keyword: 'how many entries',
      trap: 'Counting spellings instead of declarations is the error this shape is built to catch.'
    },
    {
      id: 'e48', scene: 'gate', start: 282, end: 288,
      caption: 'Shape three: which organisation is faster, and why.',
      narration: 'The third shape compares organisations or asks for a count of comparisons. The reasoning names the deciding quantity and computes it.',
      detail: 'Prior entries for a list, height for a tree, chain length for a hash table. Then the case: average or worst. A degenerate tree matches the list exactly, and that equality is a favourite wrong option.',
      keyword: 'which organisation'
    },
    {
      id: 'e49', scene: 'gate', start: 288, end: 294,
      caption: 'Three shapes, three pictures, one procedure.',
      narration: 'The bucket array answers the cost questions. The stack of tables answers the scope questions. The phase list answers the statement questions.',
      detail: 'Nothing on this page needs a memorised number. The twenty-eight, the thirteen, the two and the six all come from running the structure, and the page runs it.',
      keyword: 'three pictures'
    },
    {
      id: 'e50', scene: 'gate', start: 294, end: 300,
      caption: 'Draw the structure, name the quantity, state the case.',
      narration: 'That is the whole method. Draw the structure the question describes. Name the quantity that decides its cost. State whether you mean the average or the worst case, and where the assumption is.',
      detail: 'Then answer with the number that structure actually produces. A symbol table question is never about remembering a fact; it is about running a small structure by hand and reporting what it did.',
      keyword: 'Draw the structure'
    }
  ]
};
