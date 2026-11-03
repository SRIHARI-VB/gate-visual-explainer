# Symbol Table Organisation And Scope — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/symbol-table-organisation-and-scope/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 50 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A dictionary of declarations

*0:00 – 0:30 · objective: See the symbol table as a map from a declared name to the attributes the compiler knows, created by the lexer and read by every phase after it.*

**0:00–0:06** — A symbol table is a dictionary. The key is a name from the source program. The value is everything the compiler has worked out about that name.

> Caption: A symbol table maps every declared name to what the compiler knows about it.

**0:06–0:12** — For the name count the record might read: integer, block scope, automatic storage, offset minus four. Four facts, one line.

> Caption: The key is the name; the value is the attributes.

Exam-trap caption mode adds: *The record holds the address at which the value will live, never the value itself.*

**0:12–0:18** — Every symbol table offers the same two core operations. Insert adds a binding. Lookup retrieves the binding for a name.

> Caption: Two operations, insert and lookup, and nothing else is essential.

**0:18–0:24** — The lexer meets the first identifier and the table begins there. The parser adds declarations. Semantic analysis reads and writes types. Code generation reads offsets.

> Caption: Created in lexical analysis, read by every phase after it.

Exam-trap caption mode adds: *"Created in lexical analysis" and "used only by lexical analysis" are different claims, and only the first is true.*

**0:24–0:30** — One structure records what the compiler decided. A different structure, built later and at run time, holds the values a running program stores.

> Caption: A table of declarations is not a table of data.

## Scene 2. The linear list, counted

*0:30 – 1:00 · objective: Establish that an unsorted list must scan to find a duplicate, so eight names cost a triangle of 28 comparisons, and that this is quadratic in the number of names.*

**0:30–0:36** — Here are eight names from one small program, in the order they appear. The simplest organisation appends each one to the end of a single list.

> Caption: Eight names arrive in the order the compiler meets them.

**0:36–0:42** — Appending is free. Finding out whether the name is already there is not. The insert walks the entries already present, one comparison each.

> Caption: Before appending, the insert scans for a duplicate.

**0:42–0:48** — So the comparisons per insert are zero, then one, then two, up to seven for the last name. The work grows with every name already in the table.

> Caption: The first insert scans nothing; the eighth scans seven.

**0:48–0:54** — Add the eight counts and the answer is twenty-eight. In general n names cost n times n minus one, divided by two.

> Caption: Twenty-eight comparisons in total, which is eight times seven over two.

Exam-trap caption mode adds: *Answering 8 counts the entries; answering 36 forgets to subtract the missing term.*

**0:54–1:00** — The same scan answers a lookup. A name that is present at the end, or absent altogether, costs a comparison against every entry.

> Caption: A lookup in the worst case walks the whole list.

## Scene 3. The search tree, and the order that ruins it

*1:00 – 1:30 · objective: Show the same eight names in two trees: alphabetical insertion gives a chain of height seven costing 28 comparisons, median-first insertion gives height three costing 13.*

**1:00–1:06** — A binary search tree keeps names ordered. Each comparison rules out one side, so the work of an insert is the depth at which the name lands.

> Caption: A search tree compares once per level, so the height is the cost.

**1:06–1:12** — Here the same eight names arrive in alphabetical order. Each is larger than all of its predecessors, so each becomes the right child of the previous one.

> Caption: Inserted alphabetically, every name hangs off the right of the last.

**1:12–1:18** — The chain gives depths zero to seven, so the total is again twenty-eight. A search tree built from sorted input is not faster than a list; it is the same work with more machinery.

> Caption: That tree costs twenty-eight comparisons, exactly the list.

Exam-trap caption mode adds: *The insertion order decides the shape. A question that does not state the order does not fix the cost.*

**1:18–1:24** — Now the same eight names arrive in an order that puts the middle name first. The tree branches instead of stretching, and its height falls to three.

> Caption: Inserted median-first, the tree stays shallow: height three.

**1:24–1:30** — The total falls from twenty-eight to thirteen. Same names, same algorithm, half the work, and the only thing that changed was the sequence.

> Caption: Thirteen comparisons against twenty-eight, from the order alone.

## Scene 4. Eleven buckets, eight names

*1:30 – 2:00 · objective: Draw the bucket array and the chains, and read the occupation density, the longest chain and the number of comparisons a lookup costs from the drawing.*

**1:30–1:36** — The third organisation does not search at all. It computes. The characters of the name are combined into a number, and the remainder gives a bucket.

> Caption: A hash table turns the name into a bucket number.

**1:36–1:42** — main hashes to three and so does count. Two different names, one bucket. That is a collision, and it is normal rather than an error.

> Caption: main and count both land in bucket three.

**1:42–1:48** — All eight names fit into six of the eleven buckets, and two of those buckets hold two names each. The longest chain is therefore two.

> Caption: Eight entries, six buckets used, longest chain two.

**1:48–1:54** — The load on the table is eight entries in eleven buckets, about zero point seven three. That fraction is what decides how long the chains tend to be.

> Caption: Occupation density is entries over buckets: eight elevenths.

Exam-trap caption mode adds: *Inverting the fraction gives buckets per entry, which is a different quantity and answers nothing.*

**1:54–2:00** — Looking up main costs one bucket computation and at most two comparisons. The whole table is never scanned, and the number of entries elsewhere does not matter.

> Caption: A lookup probes one bucket and compares against its chain.

## Scene 5. Three costs side by side

*2:00 – 2:30 · objective: Put the deciding quantity of each organisation next to its cost, and see that every cost is a claim about an assumption rather than a property of the word "table".*

**2:00–2:06** — For the list it is the number of entries already present. For the tree it is the height. For the hash table it is the length of the chain the key lands in.

> Caption: Each organisation has one quantity that decides its cost.

**2:06–2:12** — Building the table of eight names costs twenty-eight comparisons as a list, thirteen as a well-shaped tree, and one bucket computation per name as a hash table.

> Caption: Building: twenty-eight against thirteen against eight inserts.

**2:12–2:18** — A lookup in the list walks entries. A lookup in the tree walks levels. A lookup in the hash table computes an address and walks a chain.

> Caption: Looking up: the list scans, the tree descends, the bucket is computed.

**2:18–2:24** — The tree is logarithmic only if it is balanced. The hash table is constant only if the function spreads and the load stays low. The list is linear always.

> Caption: Every cost is a claim about an assumption.

Exam-trap caption mode adds: *The worst case of a hash table is linear, and one bad bucket reaches it.*

**2:24–2:30** — A complete answer has three parts. Name the structure. Name the quantity that decides it. Say whether you mean the average or the worst case.

> Caption: Which is why the answer names the structure, the quantity and the case.

## Scene 6. One name, two meanings

*2:30 – 3:00 · objective: Read a program with a shadowed name and see that the two declarations are two entries, and that the inner one is what a use inside the block resolves to.*

**2:30–2:36** — Here is a program with a name declared twice. Once in the body of main, and once again inside an inner pair of braces.

> Caption: This program declares count twice, in two different blocks.

**2:36–2:42** — So the table does not hold one line for count. It holds two, in two different tables, with different attributes and different offsets.

> Caption: Two declarations mean two entries, not one.

Exam-trap caption mode adds: *Counting distinct spellings gives one too few for this program.*

**2:42–2:48** — When the statement inside the block assigns to count, the compiler resolves it to the inner entry. The outer variable is not touched at all.

> Caption: Inside the block, count means the inner declaration.

**2:48–2:54** — At the closing brace the inner declaration goes out of scope, and the same spelling means the outer variable again.

> Caption: The closing brace ends the inner meaning.

**2:54–3:00** — At the deepest point the program has six entries and five names that can be reached. The difference is the shadowed count.

> Caption: Six entries, five reachable names.

## Scene 7. The stack of tables

*3:00 – 3:30 · objective: Walk a lookup outward from the innermost table, count the probes for each name, and see the pop that makes the hidden binding visible again.*

**3:00–3:06** — The usual implementation keeps one table per scope, in a stack. The brace pushes a new table and the closing brace pops it.

> Caption: Entering a block pushes a table; leaving it pops one.

**3:06–3:12** — To resolve a name, the compiler looks in the innermost table first, then the next one out, and stops at the first match.

> Caption: A lookup starts at the top and walks outward.

**3:12–3:18** — Inside the inner block, count is found in the top table after one probe. total is not there, nor in main's table, so it is found in the global table after three.

> Caption: count costs one probe; total costs three.

**3:18–3:24** — A table of tables is not one constant-time lookup. It is one constant-time lookup per enclosing scope, so the cost is proportional to how deeply the name is buried.

> Caption: So a lookup costs the depth, not one operation.

Exam-trap caption mode adds: *Saying "hash tables are O(1), so the symbol table is O(1)" drops the walk entirely.*

**3:24–3:30** — When the block ends, its table is discarded. The outer count is now the first match, so the same spelling resolves to it with no change to any record.

> Caption: The pop is what brings the outer binding back.

## Scene 8. One table, duplicates and a log

*3:30 – 4:00 · objective: Compare the stack of tables with the single table that keeps duplicate keys and a log of what each scope added, and read the cost of each choice.*

**3:30–3:36** — The alternative keeps one table for the whole program and allows the same key to appear more than once, in the same bucket.

> Caption: A single table can do the same job, with duplicate keys.

**3:36–3:42** — Because the newest entry sits at the front, a lookup is one hash and one comparison against the head of the chain. No walk through scopes is needed.

> Caption: The first match in the bucket is the innermost binding.

**3:42–3:48** — Leaving a block has to remove exactly the bindings that block added. A log of insertions, with a marker at each scope entry, gives the exit that list.

> Caption: A log records what each scope added, so the exit can undo it.

**3:48–3:54** — The result is one hash per lookup whatever the depth, and an exit whose cost is the number of bindings that block added, spread over the inserts that created them.

> Caption: So lookup is constant and the exit is constant on average.

**3:54–4:00** — Two arrangements, two trade-offs. The stack of tables is simpler and discards a scope wholesale. The single table is faster per lookup and needs a log to unwind.

> Caption: The stack is easier to build; the single table is faster to read.

## Scene 9. Where each entry goes

*4:00 – 4:30 · objective: Place a function name in the enclosing table and its parameters in its own, count the six entries of the worked program, and see why a prototype is needed.*

**4:00–4:06** — Start at the outermost scope. The variable total is declared there, and so is the function main. Two entries in the global table.

> Caption: The global table holds total and main.

**4:06–4:12** — Inside the function, two more declarations. They go in a new table, which is pushed when the body begins. The function's own name is not repeated here.

> Caption: main's own table holds count and rate, and not main.

Exam-trap caption mode adds: *Putting the function name in its own table leaves callers unable to find it.*

**4:12–4:18** — The braces push a third table, holding the inner count and the character code. Six entries now exist across the three tables.

> Caption: The inner block adds a second count and code.

**4:18–4:24** — An entry exists only from the point the declaration is met. A body compiled before a later function's declaration cannot see it, because it is not in the table yet.

> Caption: Which is why a later function cannot be called without a prototype.

**4:24–4:30** — So the worked program has six entries, in three tables, and exactly one name that is hidden rather than absent.

> Caption: Six entries, three tables, one shadowed name.

## Scene 10. What a question actually asks

*4:30 – 5:00 · objective: Reduce the topic to the three question shapes and the five-step procedure that answers all of them.*

**4:30–4:36** — The first shape gives four statements and asks which one is wrong. The reasoning is a check of each statement against the list of phases.

> Caption: Shape one: which statement about the table is false.

**4:36–4:42** — The second shape gives a program with nested blocks and asks for the number of entries, or for the declaration a particular use resolves to.

> Caption: Shape two: how many entries, or which binding.

Exam-trap caption mode adds: *Counting spellings instead of declarations is the error this shape is built to catch.*

**4:42–4:48** — The third shape compares organisations or asks for a count of comparisons. The reasoning names the deciding quantity and computes it.

> Caption: Shape three: which organisation is faster, and why.

**4:48–4:54** — The bucket array answers the cost questions. The stack of tables answers the scope questions. The phase list answers the statement questions.

> Caption: Three shapes, three pictures, one procedure.

**4:54–5:00** — That is the whole method. Draw the structure the question describes. Name the quantity that decides its cost. State whether you mean the average or the worst case, and where the assumption is.

> Caption: Draw the structure, name the quantity, state the case.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
