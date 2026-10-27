/* ==========================================================================
   file-organisation-and-indexing — THE timeline.
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
      id: 'cost',
      n: 1,
      title: 'Why a database keeps a tree beside its data',
      start: 0, end: 30,
      objective: 'Turn "the file is on disk" into a cost: one block read per level, and see the ratio an index buys.'
    },
    {
      id: 'files',
      n: 2,
      title: 'File organisation, and the four adjectives an index can carry',
      start: 30, end: 60,
      objective: 'Separate heap, sorted and hashed files, then place dense, sparse, clustered and unclustered indexes on the right axis.'
    },
    {
      id: 'btree',
      n: 3,
      title: 'The B-tree: order, occupancy, and where the records live',
      start: 60, end: 90,
      objective: 'Read a B-tree node as p child pointers and p-1 keys, each key carrying a record pointer, with every leaf at the same depth.'
    },
    {
      id: 'bplus',
      n: 4,
      title: 'The B+ tree: separators above, every record below',
      start: 90, end: 120,
      objective: 'State the copy-up rule, place every key at the leaf level, and connect the leaves into the chain a range scan walks.'
    },
    {
      id: 'order',
      n: 5,
      title: 'Order is arithmetic: the block equation',
      start: 120, end: 150,
      objective: 'Derive the internal-node and leaf-node capacities from a block size, and round down — the four verified numbers.'
    },
    {
      id: 'insert',
      n: 6,
      title: 'Insertion: fill, split, copy up, and the one way the tree grows taller',
      start: 150, end: 180,
      objective: 'Run nine insertions on a tree with room for three keys and watch three splits and one root split.'
    },
    {
      id: 'del',
      n: 7,
      title: 'Deletion: borrow from a sibling, or merge and cascade',
      start: 180, end: 210,
      objective: 'Repair underflow in the right order — borrow first, merge second — and see the only way the tree gets shorter.'
    },
    {
      id: 'query',
      n: 8,
      title: 'Counting what a query costs',
      start: 210, end: 240,
      objective: 'Count nodes fetched, not keys compared, on the GATE 2015 Set 2 index: five nodes for the range [7, 15).'
    },
    {
      id: 'why',
      n: 9,
      title: 'Why databases chose the B+ tree over the B-tree',
      start: 240, end: 270,
      objective: 'Compare the two on the same nine keys: three levels against two, nine key copies against twelve, and a chain against a traversal.'
    },
    {
      id: 'decide',
      n: 10,
      title: 'The five-step procedure these questions actually reward',
      start: 270, end: 300,
      objective: 'Fix an order of operations for every order, occupancy, cost and node-count question in this area.'
    }
  ],

  events: [
    /* ---------------- scene 1: cost ---------------- */
    {
      id: 'cost-1', scene: 'cost', start: 0, end: 7.5,
      caption: 'A database file lives on disk in blocks. One block is one disk read, and a disk read is thousands of times slower than a memory read.',
      narration: 'A table is not a list you can walk cheaply. It is a set of fixed-size blocks, and every block you need is a separate read from the disk. So the only cost that matters is how many blocks a query touches.',
      keyword: 'blocks',
      detail: 'One block is one unit of transfer. A table of one million records at one hundred records per block occupies ten thousand blocks. Nothing in this lesson is about CPU time; all of it is about block counts.'
    },
    {
      id: 'cost-2', scene: 'cost', start: 7.5, end: 15,
      caption: 'Without an index, finding one record means reading blocks until it appears. On average that is half the file: five thousand block reads here.',
      narration: 'An unordered file gives no shortcut. You read block after block until the record shows up, so the expected cost is half the file. Ten thousand blocks, five thousand reads, for one row.',
      trap: 'The worst case is the whole file, not half. GATE asks for the average when it says "on average", and for the worst case otherwise. Read which one is being asked.',
      keyword: 'half the file'
    },
    {
      id: 'cost-3', scene: 'cost', start: 15, end: 22.5,
      caption: 'An index is a second, much smaller file: sorted (key, block pointer) entries, organised as a tree whose nodes are blocks too.',
      narration: 'The index stores the search key and the address of the record, sorted, and it is small because it holds no other column. Because it is sorted, one descent through its levels finds any key.',
      keyword: 'index',
      detail: 'An index entry is a search key plus a pointer. Nothing else is copied. That is why ten thousand data blocks might need only a few hundred index blocks, and those fit in a tree three levels deep.'
    },
    {
      id: 'cost-4', scene: 'cost', start: 22.5, end: 30,
      caption: 'Three index blocks plus the one record block: four reads instead of five thousand. That ratio is the whole reason this topic exists.',
      narration: 'Three levels of index, one read each, then the record itself. Four reads against five thousand. Every later question in this lesson is a variation on that single comparison.',
      trap: 'The record block is a fourth read and candidates forget it. GATE 2020 keyed four, not three, for exactly this reason.',
      keyword: 'four reads'
    },

    /* ---------------- scene 2: files ---------------- */
    {
      id: 'files-1', scene: 'files', start: 30, end: 37.5,
      caption: 'How records are laid out is a separate decision from how they are indexed. Heap: append anywhere, search by scanning.',
      narration: 'File organisation is the placement of records. A heap file puts each new record in any block with room, so inserts are cheap and every search is a scan. There is no order to exploit.',
      keyword: 'heap',
      detail: 'Heap organisation: O(1) insert if a free slot exists, full scan to search. Sorted organisation: binary search on the key, but an insert may have to shift records across blocks. Hashed organisation: one block per bucket, so equality is one read and range queries are useless.'
    },
    {
      id: 'files-2', scene: 'files', start: 37.5, end: 45,
      caption: 'A sorted file allows a sparse index: one entry per block, pointing at that block\'s first key. A heap file needs a dense index: one entry per record.',
      narration: 'Dense means an entry for every record. Sparse means an entry for some records, and here "some" means one per block, because the file is sorted and a block holds a contiguous key range. Sparse is smaller, but it needs the file to be ordered on the key.',
      trap: 'A sparse index is only possible on a sorted file. Drawing a sparse index over a heap file is the standard wrong answer.',
      keyword: 'sparse'
    },
    {
      id: 'files-3', scene: 'files', start: 45, end: 52.5,
      caption: 'Clustered: the file is sorted on the index key, so matching records sit in neighbouring blocks. Unclustered: each match can be on any block.',
      narration: 'Clustered is the same idea as primary. Because the file order matches the key order, a range query reads consecutive blocks. Unclustered, or secondary, has the records scattered, so a thousand matches can cost a thousand reads.',
      trap: 'Clustered and dense are different axes. An index can be clustered and sparse, or unclustered and dense. GATE 2015 asked only for the word "clustered".',
      keyword: 'Clustered'
    },
    {
      id: 'files-4', scene: 'files', start: 52.5, end: 60,
      caption: 'The index is a file too, so it can be indexed. That is a multilevel index, and its top level is usually small enough to stay in memory.',
      narration: 'One index level may still be too big to search cheaply, so you build an index over the index. Each additional level multiplies the fan-out, which is how a million records end up three levels deep. The top level is small enough to be cached, so the descent starts in memory.',
      keyword: 'multilevel'
    },

    /* ---------------- scene 3: btree ---------------- */
    {
      id: 'btree-1', scene: 'btree', start: 60, end: 67.5,
      caption: 'The order p is the maximum number of children a node may have. Such a node holds p-1 keys and p pointers, and each key carries a record pointer.',
      narration: 'Order counts children, not keys. A node of order p has at most p child pointers and therefore at most p minus one keys, and in a B-tree every one of those keys points at a record.',
      trap: 'Order p means at most p-1 keys, never p keys. GATE 2005 asked for the maximum keys in a node of order five, and the answer is four.',
      keyword: 'order'
    },
    {
      id: 'btree-2', scene: 'btree', start: 67.5, end: 75,
      caption: 'In a B-tree each key appears exactly once in the whole tree, so a search can stop at an internal node — the record is right there.',
      narration: 'This is the structural difference to hold on to. The B-tree stores the record pointer beside the key wherever the key lives, including in the root. A successful search may therefore end early, without reaching a leaf.',
      keyword: 'exactly once'
    },
    {
      id: 'btree-3', scene: 'btree', start: 75, end: 82.5,
      caption: 'Every leaf is at the same depth. That is what "balanced" means, and it is the answer GATE 2016 Set 2 keys: equal root-to-leaf path lengths.',
      narration: 'Balanced is not "within one of each other", and it is not about the number of records per leaf. It means every path from the root to a leaf has exactly the same length, which is why the worst-case search cost is the height.',
      trap: 'Options that say paths differ by at most one, or that sibling nodes have similar child counts, are the decoys. Equal, not nearly equal.',
      keyword: 'same depth'
    },
    {
      id: 'btree-4', scene: 'btree', start: 82.5, end: 90,
      caption: 'Occupancy: every node except the root holds between ceil(p/2)-1 and p-1 keys. The root is exempt, and may hold as little as one key.',
      narration: 'Half-full is the rule, with two adjustments. Round the children up, then subtract one for the key. And the root is exempt, because a tree with two levels has a root holding a single key.',
      trap: 'GATE 2010 gave maximum keys five, so order six, so minimum children three, so minimum keys two. Answering three is the classic slip: it is the child count, not the key count.',
      keyword: 'ceil(p/2)-1'
    },

    /* ---------------- scene 4: bplus ---------------- */
    {
      id: 'bplus-1', scene: 'bplus', start: 90, end: 97.5,
      caption: 'The B+ tree moves every record pointer down to the leaves. Internal nodes keep only separators, so they hold more keys per block.',
      narration: 'An internal node in a B+ tree stores keys and child pointers and nothing else. No record addresses, no data. That is the entire design change, and everything else about the structure follows from it.',
      keyword: 'separators',
      detail: 'Because an internal node carries no record pointer, the same block holds more keys, so the fan-out rises, so the height falls. For the same order, the B+ tree is shorter or equal — the comparison scene measures this on one key set.'
    },
    {
      id: 'bplus-2', scene: 'bplus', start: 97.5, end: 105,
      caption: 'A separator equals the smallest key in the subtree to its right. This is the copy-up rule GATE 2025 Set 2 states outright.',
      narration: 'The key stored in the parent is a copy, not a move. It equals the smallest key of the child to its right, so the search rule is simple: if your key is at least the separator, go right.',
      trap: 'Two conventions exist in textbooks: separator equals the minimum of the right child, or the maximum of the left. A question that draws the tree has already fixed the convention; read the figure, do not impose one.',
      keyword: 'smallest key'
    },
    {
      id: 'bplus-3', scene: 'bplus', start: 105, end: 112.5,
      caption: 'The leaves are chained left to right, in key order. A range scan is one descent plus a walk along that chain.',
      narration: 'This is the reason databases chose the B+ tree. Once you are at the first leaf in range, the answer is the next leaf, then the next, with no return to the root. A B-tree has no such chain and must re-descend for each successor.',
      keyword: 'chained'
    },
    {
      id: 'bplus-4', scene: 'bplus', start: 112.5, end: 120,
      caption: 'So every successful search costs exactly the height, leaves included, and a key may appear twice: once in a leaf, once as a separator above it.',
      narration: 'Because no record pointer sits above the leaf level, no search can end early. Every search reaches a leaf, so every search costs the same number of block reads, which is the height. And separators are duplicates, so the key count in the tree exceeds the number of records.',
      trap: 'Counting distinct keys in a B+ tree as "keys in leaves plus keys above" double-counts the separators. The number of records is the number of leaf entries.',
      keyword: 'height'
    },

    /* ---------------- scene 5: order ---------------- */
    {
      id: 'order-1', scene: 'order', start: 120, end: 127.5,
      caption: 'Order is not chosen, it is solved. A node must fit in one block: p child pointers plus p-1 keys, each of known size.',
      narration: 'Every order question is one inequality. The bytes a full node needs must not exceed the block. Write that down and the answer is arithmetic, not memory.',
      keyword: 'one block'
    },
    {
      id: 'order-2', scene: 'order', start: 127.5, end: 135,
      caption: 'GATE 2015 Set 3: block 1024, key 12, pointer 8. So 8p + 12(p-1) is at most 1024, giving p at most 51, so at most 50 keys.',
      narration: 'Twenty p minus twelve is at most one thousand and twenty-four, so p is at most fifty-one point eight, and p must be a whole number, so fifty-one. The question asks for keys, so subtract one: fifty.',
      trap: 'The record pointer size, ten bytes, is a decoy here. Non-leaf nodes in a B+ tree hold no record pointers. Including it gives the wrong inequality.',
      keyword: '8p + 12(p-1)'
    },
    {
      id: 'order-3', scene: 'order', start: 135, end: 142.5,
      caption: 'A leaf holds (key, record pointer) pairs plus one pointer to the next leaf. GATE 2007: 16n + 6 is at most 1024, so n is 63.',
      narration: 'The leaf equation has a different shape. Each entry costs the key plus the record pointer, and there is exactly one extra pointer, the link to the next leaf. Ten twenty-four minus six is one thousand and eighteen, over sixteen, is sixty-three point six, so sixty-three.',
      trap: 'Forgetting the single next-leaf pointer gives 64. That is option B in the original paper, and it is wrong for exactly one pointer.',
      keyword: '16n + 6'
    },
    {
      id: 'order-4', scene: 'order', start: 142.5, end: 150,
      caption: 'GATE 2020: order 205, leaf capacity 204, one million records, so three levels, so three index reads plus one for the record: four.',
      narration: 'Fan-out first, then levels. Four thousand and ninety-six plus twelve, over twenty, is two hundred and five. The leaf holds two hundred and four. One million over two hundred and four is four thousand nine hundred and two leaves, which fit under twenty-four internal nodes, under one root. Three levels, plus the record: four reads.',
      trap: 'Always round the order down. Rounding to nearest, or up, produces an option that is present but wrong.',
      keyword: '205'
    },

    /* ---------------- scene 6: insert ---------------- */
    {
      id: 'insert-1', scene: 'insert', start: 150, end: 157.5,
      caption: 'Insertion begins with one descent to the leaf that owns the key. Here the tree allows at most three keys per node, so a fourth forces a split.',
      narration: 'The order is four, so at most three keys per node. We insert ten, twenty, thirty, and the fourth key forty makes the leaf overflow. Everything that follows is repair.',
      keyword: 'descent'
    },
    {
      id: 'insert-2', scene: 'insert', start: 157.5, end: 165,
      caption: 'The overflowed leaf splits into two halves, and the smallest key of the new right leaf is copied up into the parent.',
      narration: 'Two keys left, two keys right, and the smallest key of the right half is copied into the parent as the separator. The key is copied, not moved, so it now exists in two places.',
      trap: 'The separator is the smallest key of the right node. Using the largest key of the left node instead gives a tree that still searches correctly but is not the one the figure shows.',
      keyword: 'copied up'
    },
    {
      id: 'insert-3', scene: 'insert', start: 165, end: 172.5,
      caption: 'The parent can now overflow too, and repairs the same way one level up. Nine keys, three splits in this run.',
      narration: 'The repair is the same rule at every level, which is why the algorithm is short. Insert the separator, and if the parent is now over-full, split it and copy a separator to its parent. Three splits for these nine keys.',
      keyword: 'three splits'
    },
    {
      id: 'insert-4', scene: 'insert', start: 172.5, end: 180,
      caption: 'A split at the root creates a new root. That is the only way a B+ tree grows taller, so the height rises by one and never by more.',
      narration: 'When the root itself splits, a new root is created above it holding one key and two children. The height therefore increases by exactly one, and only here. This is why all leaves stay at the same depth however the keys arrive.',
      trap: 'The height never grows by two in one insertion, and a split in the middle of the tree never changes the height. Only a root split does.',
      keyword: 'new root'
    },

    /* ---------------- scene 7: del ---------------- */
    {
      id: 'del-1', scene: 'del', start: 180, end: 187.5,
      caption: 'Deletion removes the key from its leaf. If the leaf still holds at least the minimum number of keys, nothing else changes.',
      narration: 'Deletion starts like insertion: find the leaf and remove the entry. With the minimum at one key for this tree, most deletions stop here. The separator above may now be stale, so it is refreshed to the leaf\'s new smallest key.',
      keyword: 'removes'
    },
    {
      id: 'del-2', scene: 'del', start: 187.5, end: 195,
      caption: 'Underflow means fewer keys than the minimum. The first repair is to borrow from an adjacent sibling that has a key to spare.',
      narration: 'If the leaf drops below the minimum, look at its neighbour. If that neighbour is above the minimum, move one entry across. The tree keeps its shape and the total number of nodes is unchanged.',
      trap: 'Borrowing changes the separator above the sibling, not just the one above the emptied node. Both must be refreshed.',
      keyword: 'borrow'
    },
    {
      id: 'del-3', scene: 'del', start: 195, end: 202.5,
      caption: 'If both siblings are already at the minimum, borrow is impossible. Merge the two nodes into one and drop the separator that divided them.',
      narration: 'When nobody can spare a key, the two nodes become one. That removes a child from the parent, and the parent loses the separator that pointed between them. One fewer node, one fewer separator.',
      keyword: 'merge'
    },
    {
      id: 'del-4', scene: 'del', start: 202.5, end: 210,
      caption: 'A merge can make the parent underfull, so the repair cascades upward. If the root ends with no keys, its only child becomes the root.',
      narration: 'The cascade is why deletion is harder to trace than insertion. If the root loses its last key, it is discarded and its single child becomes the new root, which is the only way the height decreases.',
      trap: 'The root is allowed to hold one key and two children. Do not "repair" a root that looks too empty; only a root with no keys at all is contracted.',
      keyword: 'cascades'
    },

    /* ---------------- scene 8: query ---------------- */
    {
      id: 'query-1', scene: 'query', start: 210, end: 217.5,
      caption: 'A point query fetches one node per level, so its cost is exactly the height. The comparison is in block reads, never in key comparisons.',
      narration: 'Every level is one block read, and the height is the same for every key because the tree is balanced. So a point query costs the height, which is why the fan-out matters so much.',
      keyword: 'height'
    },
    {
      id: 'query-2', scene: 'query', start: 217.5, end: 225,
      caption: 'A range query costs the descent plus one extra read for each additional leaf it must visit. The chain turns a range into a walk.',
      narration: 'The first leaf is reached by a descent. Every leaf after that is one more read, taken from the chain rather than from the root. So the cost is the height plus the number of extra leaves.',
      keyword: 'descent'
    },
    {
      id: 'query-3', scene: 'query', start: 225, end: 232.5,
      caption: 'GATE 2015 Set 2: for keys from 7 up to but not including 15, the model fetches five nodes — root, one internal node, and three leaves.',
      narration: 'Seven is less than the root separator nine, so we go left. Seven is at least five, so we go right to the leaf holding five and seven. Then the chain gives nine and eleven, then thirteen and fifteen. Five nodes in total.',
      trap: 'Counting the descent as one read rather than three loses the internal levels. Counting only the leaves gives three.',
      keyword: 'five nodes'
    },
    {
      id: 'query-4', scene: 'query', start: 232.5, end: 240,
      caption: 'Fifteen is excluded, so the last leaf is still needed for thirteen. The bound is on nodes fetched, which is why the answer is five and not four.',
      narration: 'The upper bound is open, so thirteen qualifies and fifteen does not. The leaf containing both must still be read, because it holds thirteen. Four would be right only if the range ended at twelve.',
      trap: 'Whether the upper bound is inclusive changes the answer. Read "less than" and "at most" as different words, because they are.',
      keyword: 'excluded'
    },

    /* ---------------- scene 9: why ---------------- */
    {
      id: 'why-1', scene: 'why', start: 240, end: 247.5,
      caption: 'Same nine keys, same minimum degree: the B-tree needs three levels and the B+ tree needs two. The model builds both and measures.',
      narration: 'Insert the same nine keys into a B-tree and into a B+ tree with the same minimum degree. The B-tree is three levels deep, the B+ tree two. Nothing about the keys caused that; the node contents did.',
      keyword: 'three levels'
    },
    {
      id: 'why-2', scene: 'why', start: 247.5, end: 255,
      caption: 'The B-tree spends block space on record pointers in every node. The B+ tree spends it on keys, so more keys fit, so the fan-out is larger.',
      narration: 'A B-tree internal node holds p minus one keys and p minus one record pointers and p child pointers. A B+ tree internal node holds no record pointers at all. For the same block, the B+ node holds more keys, so it has more children, so it is shorter.',
      keyword: 'fan-out'
    },
    {
      id: 'why-3', scene: 'why', start: 255, end: 262.5,
      caption: 'The B+ tree stores nine keys as twelve copies: nine in the leaves and three separators. The B-tree stores nine, once each. That is the price.',
      narration: 'Duplication is the cost of the B+ tree, and it is small because only keys are duplicated, never records. The B-tree avoids the duplication and pays for it with a shorter fan-out and no leaf chain.',
      trap: 'Counting separators as records inflates the record count. The number of records equals the number of leaf entries.',
      keyword: 'twelve'
    },
    {
      id: 'why-4', scene: 'why', start: 262.5, end: 270,
      caption: 'A full scan of a B+ tree is a walk along the leaf chain. In a B-tree it is a traversal. Range queries decided the choice.',
      narration: 'Real queries ask for ranges far more often than for single keys. The leaf chain makes a range scan sequential, which the disk likes. That is why the B+ tree is what a database actually builds, and why the syllabus writes them in that order.',
      keyword: 'leaf chain'
    },

    /* ---------------- scene 10: decide ---------------- */
    {
      id: 'dec-1', scene: 'decide', start: 270, end: 277.5,
      caption: 'Step one: decide which node the question is about, then write that node\'s byte equation. Internal and leaf equations have different shapes.',
      narration: 'Before computing anything, ask what sits in the node being sized. An internal node of a B+ tree holds keys and child pointers. A leaf holds key and record pointer pairs plus one chain pointer. A B-tree node adds record pointers at every level.',
      trap: 'Using the leaf equation for an internal node, or including record pointers in a B+ internal node, are the two errors that cost these marks.',
      keyword: 'byte equation'
    },
    {
      id: 'dec-2', scene: 'decide', start: 277.5, end: 285,
      caption: 'Step two: solve the inequality and round down. The largest integer that fits is the order, and the key count is one less.',
      narration: 'The solution is always a floor, because a node that does not fit is not a node. Then read the question again: does it want pointers, keys, or entries? Those are three different numbers.',
      keyword: 'round down'
    },
    {
      id: 'dec-3', scene: 'decide', start: 285, end: 292.5,
      caption: 'Step three, for occupancy: order is maximum keys plus one, and the minimum for a non-root node is ceil(order/2) minus one. The root is exempt.',
      narration: 'Occupancy questions are pure arithmetic on the order, with the root exempted. Compute the children first, then subtract one. GATE 2010 is exactly this computation with maximum keys five.',
      keyword: 'ceil(order/2)-1'
    },
    {
      id: 'dec-4', scene: 'decide', start: 292.5, end: 300,
      caption: 'Steps four and five: for cost, fan-out, then levels, then the record block. For a drawn tree, count the descent plus the leaves scanned.',
      narration: 'Cost questions want the number of block reads: build the fan-out, count the levels, add one for the record. Figure questions want the nodes fetched: the descent to the first leaf, then each additional leaf the range touches. Both are counts of blocks, never of comparisons.',
      trap: 'The most common lost mark is forgetting the final record block. The second most common is treating an open bound as closed.',
      keyword: 'block reads'
    }
  ]
};
