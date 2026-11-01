/* ==========================================================================
   extendible-hashing-directory-and-depths — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   captions.vtt, captions.srt and transcript.md are derived from this file by
   tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is produced by the model in lesson.js, which
   builds the structure, inserts and deletes, and re-checks the four defining
   properties after every single operation before anything is drawn.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 370,

  scenes: [
    {
      id: 'overflow', n: 1,
      title: 'A fixed number of buckets, and a chain that grows',
      start: 0, end: 28,
      objective: 'See static hashing overflow on a file larger than its bucket count, and measure the lookup cost that follows.'
    },
    {
      id: 'directory', n: 2,
      title: 'The directory: an array of pointers chosen by the low bits',
      start: 28, end: 54,
      objective: 'Read the directory index as the low d bits of the hash, and count the block reads a lookup costs.'
    },
    {
      id: 'depths', n: 3,
      title: 'Two depths: the directory has one, each bucket has one',
      start: 54, end: 82,
      objective: 'Distinguish global depth from local depth, and derive the 2^(d-d\u2032) pointers that reach one bucket.'
    },
    {
      id: 'insert', n: 4,
      title: 'An insert with room changes nothing structural',
      start: 82, end: 108,
      objective: 'Walk a key from its bits to its entry to its bucket, and see that a non-overflowing insert is free.'
    },
    {
      id: 'split', n: 5,
      title: 'Overflow with a spare pointer: split, do not double',
      start: 108, end: 138,
      objective: 'Split a bucket whose local depth is below the global depth, redistributing on bit d\u2032 and moving half the pointers.'
    },
    {
      id: 'double', n: 6,
      title: 'Overflow with no spare pointer: double the directory',
      start: 138, end: 170,
      objective: 'See why doubling is a copy of the pointer array, and why only least-significant-bit indexing allows it.'
    },
    {
      id: 'trace', n: 7,
      title: 'Ten records, computed end to end',
      start: 170, end: 204,
      objective: 'Follow one insertion order through every doubling and split to a finished structure whose counts can be checked.'
    },
    {
      id: 'counts', n: 8,
      title: 'Four counts that answer the questions',
      start: 204, end: 232,
      objective: 'Compute pointers per bucket, maximum records, minimum global depth and directory size in bytes.'
    },
    {
      id: 'lookup', n: 9,
      title: 'One block read, and the query it cannot answer',
      start: 232, end: 256,
      objective: 'Count the reads for an equality lookup, then measure what a range query costs and why a B+ tree beats it.'
    },
    {
      id: 'merge', n: 10,
      title: 'Deletion: the buddy merge and the halving',
      start: 256, end: 286,
      objective: 'Apply both merge conditions on a real deletion sequence, then halve the directory when every depth has fallen below it.'
    },
    {
      id: 'skew', n: 11,
      title: 'The failure mode: five keys that share their low bits',
      start: 286, end: 314,
      objective: 'See the directory grow to 64 entries for five records, and state the assumption the structure rests on.'
    },
    {
      id: 'compare', n: 12,
      title: 'Extendible against static, against linear, against a B+ tree',
      start: 314, end: 342,
      objective: 'Place the four schemes on one table by what each guarantees, and name the operation hashing cannot do.'
    },
    {
      id: 'procedure', n: 13,
      title: 'The five-step procedure, and the four properties to recheck',
      start: 342, end: 370,
      objective: 'Fix an order of operations for an exam question, and a checklist that catches a corrupted pointer array.'
    }
  ],

  events: [
    /* ---------- 1. overflow ---------- */
    {
      id: 'e01', scene: 'overflow', start: 0, end: 7,
      caption: 'Static hashing fixes the bucket count first: h(k) = k mod 10, ten buckets, two records each.',
      detail: 'The bucket for a record is decided by a remainder, computed from the key alone. The number of buckets is chosen before the first record arrives, so the number of records per bucket is whatever the data happens to give.',
      narration: 'Static hashing chooses the number of buckets before it sees a single record.',
      keyword: 'fixes the bucket count'
    },
    {
      id: 'e02', scene: 'overflow', start: 7, end: 14,
      caption: 'Twenty-four keys into five buckets gives five, five, five, five and four records where two fit.',
      detail: 'The same 24 keys that spread as three, three, three, three, two, two, two, two, two, two over ten buckets land as five, five, five, five and four over five. Halving the buckets doubles the load per bucket, and the capacity did not change.',
      narration: 'Halve the buckets and every bucket holds more than it can.',
      keyword: 'five, five, five, five and four'
    },
    {
      id: 'e03', scene: 'overflow', start: 14, end: 21,
      caption: 'The excess goes to overflow blocks chained to the bucket, so the worst key costs four block reads instead of one.',
      detail: 'A bucket holding five records with capacity two has a chain of three extra blocks. Reaching a record at the end of the chain is one read for the primary block plus three for the chain. The hash still works; the cost stopped being constant.',
      narration: 'The chain turns one block read into four for the unlucky key.',
      keyword: 'four block reads',
      trap: 'An overflow chain is not a defect in the hash function. Any fixed bucket count overflows as soon as the file outgrows it, however good the hash is.'
    },
    {
      id: 'e04', scene: 'overflow', start: 21, end: 28,
      caption: 'The chain grows with the file and nothing in the structure notices. A directory is the fix.',
      detail: 'To grow a static file you must choose a new bucket count and rehash every record, which rewrites the whole file. Extendible hashing replaces that one big reorganisation with many small ones.',
      narration: 'Growing a static hash file means rehashing everything. That is the problem the next scene removes.',
      keyword: 'A directory is the fix'
    },

    /* ---------- 2. directory ---------- */
    {
      id: 'e05', scene: 'directory', start: 28, end: 35,
      caption: 'Keep an array of pointers, two to the power d of them, and index it by the low d bits of h(k).',
      detail: 'The array is the directory. Its length is a power of two so that a d-bit number always lands inside it, and the index is read from the low-order end of the hash value so that growing the array is a copy.',
      narration: 'A directory of two to the d pointers, indexed by the low d bits of the hash.',
      keyword: 'low d bits'
    },
    {
      id: 'e06', scene: 'directory', start: 35, end: 42,
      caption: 'd is the global depth: the number of low-order bits the directory reads to choose a bucket.',
      detail: 'Global depth is a property of the directory, not of any bucket. It is also the largest local depth in the structure, so it is the number of bits the directory must read to tell any two buckets apart.',
      narration: 'd is the global depth, and it is one number for the whole directory.',
      keyword: 'global depth'
    },
    {
      id: 'e07', scene: 'directory', start: 42, end: 48,
      caption: 'A lookup is one directory entry and one pointer. If the directory is resident, that is one block read, always.',
      detail: 'The directory is small: two to the d pointers. At four bytes a pointer and depth twenty it is four mebibytes, so it is normally kept in main memory. The data bucket is then the only disk access, and that count does not rise as the file grows.',
      narration: 'One directory lookup, one bucket read. The count does not grow with the file.',
      keyword: 'one block read'
    },
    {
      id: 'e08', scene: 'directory', start: 48, end: 54,
      caption: 'Two keys with different low d bits cannot share a bucket. Two keys with the same low d bits must.',
      detail: 'This is the whole promise of the structure, and it is a biconditional. It is what makes a single directory probe sufficient, and it is what forces a split when a bucket overflows: the only way to separate records that share their low bits is to read one more bit.',
      narration: 'Same low bits, same bucket. That rule is what the split has to break.',
      keyword: 'must'
    },

    /* ---------- 3. depths ---------- */
    {
      id: 'e09', scene: 'depths', start: 54, end: 61,
      caption: 'Each bucket also records a local depth: how many bits were actually needed to separate the records it holds.',
      detail: 'The local depth of a bucket is written as d prime, or d-prime. It answers a narrower question than the global depth: not how many bits the directory reads, but how many bits the directory would have needed for this one bucket.',
      narration: 'The local depth is the number of bits this one bucket actually needed.',
      keyword: 'local depth'
    },
    {
      id: 'e10', scene: 'depths', start: 61, end: 68,
      caption: 'A bucket at local depth two is reached by four entries of an eight-entry directory: two to the power d minus d prime.',
      detail: 'With d equal to three and d prime equal to two, eight entries point at four buckets, and each bucket takes two of them. The formula is two to the power (d minus d prime), and it is the count of directory entries, not of records.',
      narration: 'Two to the power d minus d prime entries reach one bucket.',
      keyword: 'two to the power d minus d prime'
    },
    {
      id: 'e11', scene: 'depths', start: 68, end: 75,
      caption: 'Every entry that points at one bucket agrees on the low d-prime bits. That is what makes the pointer array legal.',
      detail: 'Entries 011 and 111 both reach the bucket at local depth two, and both end in 11. If two entries pointed at one bucket and disagreed on a bit below the local depth, then some record in that bucket would have a different low-bit pattern from the entry that reached it, and the probe would be wrong.',
      narration: 'All pointers to a bucket share its low d-prime bits.',
      keyword: 'agrees on the low d-prime bits'
    },
    {
      id: 'e12', scene: 'depths', start: 75, end: 82,
      caption: 'The global depth is the largest local depth, and no local depth can exceed it.',
      detail: 'd equals the maximum of the local depths, and d prime is at most d for every bucket. If some local depth were smaller than d, that bucket simply has more than one pointer. If a local depth equalled d, that bucket has exactly one pointer.',
      narration: 'Global depth is the maximum of the local depths. Never less.',
      keyword: 'largest local depth'
    },

    /* ---------- 4. insert ---------- */
    {
      id: 'e13', scene: 'insert', start: 82, end: 89,
      caption: 'Insert 22. Its binary form ends in 110, so with d equal to three the entry is 110.',
      detail: 'Reading from the right: 22 is 10110 in binary, the last three bits are 110, and 110 is six. So 22 belongs to directory entry six. Nothing else about the key is consulted.',
      narration: 'Read the last three bits: 110, entry six.',
      keyword: 'the entry is 110'
    },
    {
      id: 'e14', scene: 'insert', start: 89, end: 96,
      caption: 'Entry six holds one record, 6, so 22 goes in beside it. The directory does not change.',
      detail: 'A bucket with spare room absorbs the record and nothing else happens: no pointer moves, no depth changes, no other bucket is read or written. Most inserts are this case.',
      narration: 'There is room, so the insert is free.',
      keyword: 'does not change'
    },
    {
      id: 'e15', scene: 'insert', start: 96, end: 102,
      caption: 'Insert 24 into entry 000, which already holds 16. Two records, capacity two: full, but not yet overflowing.',
      detail: 'Full means the next record that maps here cannot be stored. It is worth separating the two states, because a full bucket costs nothing and only the record that does not fit starts a reorganisation.',
      narration: 'Two records, capacity two. Full, but still fine.',
      keyword: 'full, but not yet overflowing'
    },
    {
      id: 'e16', scene: 'insert', start: 102, end: 108,
      caption: 'The next record that lands there is the one that forces a decision, and the depths decide which decision.',
      detail: 'There are exactly two cases, and they are decided before any record is moved: compare the local depth of the overflowing bucket with the global depth of the directory. Equal means double; smaller means split alone.',
      narration: 'The next record there forces a choice, and the two depths make it.',
      keyword: 'forces a decision'
    },

    /* ---------- 5. split ---------- */
    {
      id: 'e17', scene: 'split', start: 108, end: 115,
      caption: 'If the local depth is below the global depth, split the bucket and leave the directory alone.',
      detail: 'A local depth below the global depth means the bucket already has more than one pointer aimed at it, so there is a spare pointer available for the new bucket. No entry has to be added.',
      narration: 'Local depth below global: split, and the directory stays as it is.',
      keyword: 'leave the directory alone'
    },
    {
      id: 'e18', scene: 'split', start: 115, end: 122,
      caption: 'Redistribute on one more bit: bit number d prime, counting from zero. A zero stays, a one moves.',
      detail: 'The old bucket used d prime bits. The split reads bit d prime as well, so both halves are distinguished by d prime plus one bits. Every record is re-examined on that single bit; nothing else about a record changes.',
      narration: 'One more bit decides who stays and who moves.',
      keyword: 'bit number d prime'
    },
    {
      id: 'e19', scene: 'split', start: 122, end: 130,
      caption: 'Half the pointers follow the new bucket. Four pointers at local depth two become two and two at local depth three.',
      detail: 'A bucket with two to the power (d minus d prime) pointers splits into two buckets with two to the power (d minus d prime minus one) pointers each. The pointer count is conserved: the halves add back to the original.',
      narration: 'The pointers are divided between the two halves, none are added.',
      keyword: 'Half the pointers'
    },
    {
      id: 'e20', scene: 'split', start: 130, end: 138,
      caption: 'No other bucket moves and no entry changes its index. Only the pointers that reached the split bucket are rewritten.',
      detail: 'The split is local. That is the property that makes the structure usable: the cost of an overflow is one bucket read, one bucket write and one pointer rewrite per pointer that reached the bucket.',
      narration: 'The reorganisation is confined to one bucket and its pointers.',
      keyword: 'Only the pointers',
      trap: 'The split bit is the bit at position d prime, counted from the right starting at zero. Splitting on the top bit of the hash, or on bit d, redistributes nothing useful and the same bucket overflows again immediately.'
    },

    /* ---------- 6. double ---------- */
    {
      id: 'e21', scene: 'double', start: 138, end: 145,
      caption: 'Now the other case: the bucket is full and its local depth already equals the global depth.',
      detail: 'The comparison is made before the split, on the overflowing bucket as it stands. Equality means the directory has read exactly as many bits as this bucket needed, and one more bit is required to separate its records.',
      narration: 'Local depth equal to global depth. One more bit is needed, and the directory has not got it.',
      keyword: 'equals the global depth'
    },
    {
      id: 'e22', scene: 'double', start: 145, end: 152,
      caption: 'Only one pointer reaches it, so splitting in place would leave the new bucket with no entry pointing at it.',
      detail: 'At local depth equal to global depth the pointer count is two to the power zero, which is one. The split produces two buckets, so a second pointer has to come from somewhere. It comes from a new entry, and a new entry means a longer directory.',
      narration: 'One pointer, two buckets. A pointer has to be created.',
      keyword: 'no entry pointing at it'
    },
    {
      id: 'e23', scene: 'double', start: 152, end: 162,
      caption: 'Doubling is a copy: the new entry at i plus two to the d is a copy of entry i.',
      detail: 'The old array is written twice, one after the other. Position i plus two to the d holds the same pointer as position i, because a d-bit index and a d-plus-one-bit index that agree on the low d bits differ only in the new bit. That is exactly why the index is taken from the low end: prefix indexing would need every entry rewritten in a new position.',
      narration: 'Copy the array after itself. That is the whole doubling.',
      keyword: 'i plus two to the d'
    },
    {
      id: 'e24', scene: 'double', start: 162, end: 170,
      caption: 'Then the split runs as before on the new bit. The global depth rises by one and the two halves take local depth d plus one.',
      detail: 'The order matters: double first, then split. After doubling, the overflowing bucket has two pointers, its local depth is now below the global depth, and the ordinary split case applies. The two halves end at the new global depth.',
      narration: 'Double, then split. The halves take the new depth.',
      keyword: 'Then the split runs as before'
    },

    /* ---------- 7. trace ---------- */
    {
      id: 'e25', scene: 'trace', start: 170, end: 178,
      caption: 'Ten records, capacity two, inserted in the order 16, 4, 6, 22, 24, 10, 31, 7, 9, 20.',
      detail: 'The hash here is the identity, so a key is its own bit string and the low bits can be read straight off the decimal number. This is the standard textbook illustration and it keeps the arithmetic checkable by hand.',
      narration: 'Ten records, capacity two, one fixed insertion order.',
      keyword: '16, 4, 6, 22, 24, 10, 31, 7, 9, 20'
    },
    {
      id: 'e26', scene: 'trace', start: 178, end: 186,
      caption: 'Three doublings and five splits take the global depth from zero to three and the directory from one entry to eight.',
      detail: 'Starting at depth zero means one bucket, one entry, and the first overflow doubles immediately. The model records the type of every structural event, so the three and the five are counted rather than estimated.',
      narration: 'Three doublings, five splits, depth zero to depth three.',
      keyword: 'Three doublings and five splits'
    },
    {
      id: 'e27', scene: 'trace', start: 186, end: 195,
      caption: 'Six buckets hold ten records, so ten of twelve slots are used. Two buckets have local depth two and are shared by two entries each.',
      detail: 'Six buckets at capacity two is twelve slots, and ten records is 83 per cent occupancy. The two shared buckets are the ones whose records happened to need fewer bits, which is the saving the directory pays for: eight entries for six buckets.',
      narration: 'Six buckets, ten records, ten of twelve slots full.',
      keyword: 'Six buckets hold ten records'
    },
    {
      id: 'e28', scene: 'trace', start: 195, end: 204,
      caption: 'Every number here is recomputed by this page, and the four defining properties are re-checked after each of the ten inserts.',
      detail: 'The checks are: the array has two to the d entries; the global depth equals the largest local depth; each bucket is reached by exactly two to the power (d minus d prime) entries, all agreeing on its low bits; and no bucket holds more than its capacity.',
      narration: 'The four properties are rechecked after every insert, not just at the end.',
      keyword: 're-checked after each'
    },

    /* ---------- 8. counts ---------- */
    {
      id: 'e29', scene: 'counts', start: 204, end: 211,
      caption: 'Pointers reaching one bucket: two to the power d minus d prime. Depth four and local depth two gives four.',
      detail: 'This is the most-asked single number, because it is the one that tells you whether a split will need a new entry. If the answer is one, the next overflow doubles the directory.',
      narration: 'Two to the power d minus d prime pointers reach a bucket.',
      keyword: 'two to the power d minus d prime'
    },
    {
      id: 'e30', scene: 'counts', start: 211, end: 218,
      caption: 'Most records the structure can hold: two to the d times the capacity. Minimum depth for N records: the smallest d with two to the d at least N over the capacity.',
      detail: 'For 100 records at capacity eight, N over the capacity is 12.5, rounded up to 13, and the smallest d with two to the d at least 13 is four, giving sixteen entries and a ceiling of 128 records. The bound is necessary and not sufficient: skew can force a larger directory.',
      narration: 'Multiply for a ceiling, divide and take a ceiling for a floor.',
      keyword: 'two to the d times the capacity'
    },
    {
      id: 'e31', scene: 'counts', start: 218, end: 225,
      caption: 'Directory size in bytes: two to the d times the pointer width. Four-byte pointers at depth twenty is four mebibytes.',
      detail: 'Two to the twentieth is 1,048,576 entries, and four bytes each is 4,194,304 bytes, which is four mebibytes. That is the whole directory for about two million records at capacity two, which is why the resident-directory assumption usually holds.',
      narration: 'Depth twenty with four-byte pointers is a four mebibyte directory.',
      keyword: 'four mebibytes'
    },
    {
      id: 'e32', scene: 'counts', start: 225, end: 232,
      caption: 'Two to the d is an upper bound on the number of buckets, not the count. Shared entries make the count smaller.',
      detail: 'The trace had eight entries and six buckets. Every bucket has at least one entry, so the count is at most two to the d and at least the number of records divided by the capacity. Between those two bounds the exact count depends on the data.',
      narration: 'The directory length bounds the bucket count from above, never pins it.',
      keyword: 'upper bound',
      trap: 'Two to the d is not the number of buckets. A question that asks for the number of buckets after a given insertion sequence must be traced, because shared entries are the whole point of the structure.'
    },

    /* ---------- 9. lookup ---------- */
    {
      id: 'e33', scene: 'lookup', start: 232, end: 239,
      caption: 'A lookup reads one directory entry, then one bucket. One block read if the directory is resident, two if it is not.',
      detail: 'The directory is addressed arithmetically, so it needs no search of its own. The bucket is then read once and scanned. Neither step grows with the number of records, which is what a hash index is for.',
      narration: 'One directory entry, one bucket. That is the whole lookup.',
      keyword: 'One block read'
    },
    {
      id: 'e34', scene: 'lookup', start: 239, end: 246,
      caption: 'A range query is the failure. Twenty records in twelve buckets: eight consecutive keys touch eight different buckets.',
      detail: 'Keys that are adjacent in value are adjacent in no bit pattern that the directory reads, so consecutive keys land in unrelated buckets. A range of eight keys therefore reads eight buckets, which is most of a twelve-bucket file.',
      narration: 'Eight consecutive keys, eight different buckets.',
      keyword: 'eight different buckets'
    },
    {
      id: 'e35', scene: 'lookup', start: 246, end: 256,
      caption: 'A B+ tree reads one leaf and then follows the chain. A hash index has nothing to follow.',
      detail: 'The B+ tree orders its leaves, so a range is one descent plus a walk along the leaf chain. The hash index deliberately destroys that order to get equality in one read. This is a trade, and it is the reason a database offers both index types.',
      narration: 'The B+ tree follows a chain. The hash index has no chain to follow.',
      keyword: 'nothing to follow',
      trap: 'A hash index cannot answer a range, a prefix match or an ordered scan efficiently. If a question asks which index supports BETWEEN or ORDER BY, the answer is never the hash index.'
    },

    /* ---------- 10. merge ---------- */
    {
      id: 'e36', scene: 'merge', start: 256, end: 263,
      caption: 'Deletion runs the split backwards. A bucket and its split image may merge if their combined records fit in one bucket.',
      detail: 'The split image, also called the buddy, is the bucket reached by flipping bit d prime minus one. Two conditions must both hold: the two buckets must have the same local depth, and their combined record count must be within capacity.',
      narration: 'Merge needs both: the same local depth, and room for both sets of records.',
      keyword: 'combined records fit'
    },
    {
      id: 'e37', scene: 'merge', start: 263, end: 271,
      caption: 'Deleting 20 leaves a candidate of three records, so no merge. Deleting 24 leaves two, so the merge happens and the local depth falls by one.',
      detail: 'After deleting 20 the bucket holds one record and its buddy holds two; three is more than capacity two, so the merge is refused. After deleting 24 the pair is one and one, which fits, so they coalesce and the surviving bucket drops from local depth three to two.',
      narration: 'Three records do not fit. Two do.',
      keyword: 'no merge'
    },
    {
      id: 'e38', scene: 'merge', start: 271, end: 278,
      caption: 'When every local depth is below the global depth, the directory halves: each pair of entries agrees, so one of the pair is redundant.',
      detail: 'Halving is the exact inverse of doubling. Entry i and entry i plus two to the d minus one point at the same bucket for every i, so the second half of the array is deleted and the global depth drops by one.',
      narration: 'If every pair of entries agrees, throw half the array away.',
      keyword: 'the directory halves'
    },
    {
      id: 'e39', scene: 'merge', start: 278, end: 286,
      caption: 'Here the halving takes the depth from three to two. Delete every record and the structure returns to one empty bucket at depth zero.',
      detail: 'The model deletes all ten records and checks that the structure comes back to a single bucket, a single directory entry and global depth zero. That round trip is the strongest single test of the deletion path.',
      narration: 'Delete everything and the structure returns to where it started.',
      keyword: 'depth zero',
      trap: 'A merge needs the same local depth on both sides and a combined count within capacity. Dropping either condition leaves a pointer array that disagrees with its buckets, which is the one error a lookup cannot detect.'
    },

    /* ---------- 11. skew ---------- */
    {
      id: 'e40', scene: 'skew', start: 286, end: 293,
      caption: 'Nothing here is free. Five keys all congruent to one modulo sixteen share their low four bits.',
      detail: 'The keys 1, 17, 33, 49 and 65 differ by multiples of sixteen, so every one of them ends in 0001 in binary. The directory reads the low bits, so no amount of doubling separates them until it reaches bit four.',
      narration: 'Five keys that agree on every low bit the directory has read so far.',
      keyword: 'share their low four bits'
    },
    {
      id: 'e41', scene: 'skew', start: 293, end: 301,
      caption: 'Each split leaves them in the same bucket, because the bit being examined is the same for all five. The directory doubles six times.',
      detail: 'The split redistributes on bit d prime. If all five keys have a one at that position, all five move to the new bucket and it overflows again immediately, so the next bit is read, and the same thing happens. The model counts six doublings to reach depth six.',
      narration: 'Every split puts all five in the same half, so the next bit is read, and again.',
      keyword: 'doubles six times'
    },
    {
      id: 'e42', scene: 'skew', start: 301, end: 308,
      caption: 'Sixty-four directory entries, seven buckets, five records. The directory grew and the records did not spread.',
      detail: 'That is the worst case, and it is worth stating precisely: the directory can grow to about as many entries as there are records, even though the data is tiny. Nothing is wrong with the algorithm; the assumption that a hash distributes keys uniformly has failed.',
      narration: 'Sixty-four entries for five records. The directory grew, the data did not spread.',
      keyword: 'Sixty-four directory entries'
    },
    {
      id: 'e43', scene: 'skew', start: 308, end: 314,
      caption: 'Real implementations allow a few overflow blocks and double only when overflow becomes common.',
      detail: 'The usual repair is a threshold: keep an overflow chain on each bucket and double the directory only when the fraction of buckets with overflow crosses a small bound. That caps the directory at the cost of an occasional second read.',
      narration: 'A small overflow allowance caps the directory. That is the engineering answer.',
      keyword: 'a few overflow blocks'
    },

    /* ---------- 12. compare ---------- */
    {
      id: 'e44', scene: 'compare', start: 314, end: 321,
      caption: 'Static: one read until it overflows, then a chain, and a full rehash to grow.',
      detail: 'Growth is the problem. Changing the bucket count changes every record home, so the whole file is read and rewritten. That is a maintenance operation on a live database, which is why the scheme is used only when the size is known.',
      narration: 'Static hashing pays for growth with a full rehash.',
      keyword: 'a full rehash'
    },
    {
      id: 'e45', scene: 'compare', start: 321, end: 328,
      caption: 'Extendible: one read always, a directory that doubles, and no overflow chain except for duplicate keys.',
      detail: 'The guarantee is the one-read equality lookup, and the price is a directory that can grow large under skew. Duplicates are the documented exception: two records with the same full hash value cannot be separated by any number of bits.',
      narration: 'One read always, paid for with a directory.',
      keyword: 'one read always'
    },
    {
      id: 'e46', scene: 'compare', start: 328, end: 335,
      caption: 'Linear hashing: no directory at all, splits round-robin, and an overflow chain allowed in exchange.',
      detail: 'Linear hashing splits the next bucket in a fixed order rather than the bucket that overflowed, so it needs no directory to find a bucket. The cost is that overflow chains reappear, because the split does not necessarily relieve the bucket that is full.',
      narration: 'Linear hashing trades the directory for overflow chains and a fixed split order.',
      keyword: 'no directory at all'
    },
    {
      id: 'e47', scene: 'compare', start: 335, end: 342,
      caption: 'And a B+ tree answers ranges and ordered scans, which no hash index can.',
      detail: 'The table on this page puts the four side by side on equality cost, range cost, growth cost and the extra structure each one needs. No single row wins; each scheme pays for its guarantee with the thing the other schemes avoid.',
      narration: 'Only the B+ tree answers a range. That is the line to remember.',
      keyword: 'which no hash index can'
    },

    /* ---------- 13. procedure ---------- */
    {
      id: 'e48', scene: 'procedure', start: 342, end: 349,
      caption: 'Five steps: read d, take the low d bits, follow the pointer, then choose split or double by comparing the two depths.',
      detail: 'The order is fixed because each step uses the previous one. The depth comparison comes last because it is only asked when the bucket is full, and it is asked of the bucket you just reached, before any record is moved.',
      narration: 'Five steps in a fixed order, with the depth comparison last.',
      keyword: 'Five steps'
    },
    {
      id: 'e49', scene: 'procedure', start: 349, end: 357,
      caption: 'Write the binary of the key first and count bits from the right. Most wrong answers come from reading the wrong end.',
      detail: 'Some presentations index by the first d bits and some by the last d. Both are consistent within themselves, and both appear in textbooks and question papers, so the question usually says which. What is never valid is mixing the two inside one calculation.',
      narration: 'Write the binary first, and count from the right unless the question says otherwise.',
      keyword: 'count bits from the right',
      trap: 'Check whether the question indexes by the first d bits or the last d. The depths and the split behaviour are the same; the entry numbers are not.'
    },
    {
      id: 'e50', scene: 'procedure', start: 357, end: 364,
      caption: 'After any split, recheck four things: array length, the two depths, pointers per bucket, and no bucket over capacity.',
      detail: 'These are the four properties the model checks after every operation in this lesson, and they catch every structural error except a wrong bucket count. They are cheap to check by hand: count the entries, take the largest local depth, and count the pointers to one bucket.',
      narration: 'Four properties, checked after every split. They catch nearly every mistake.',
      keyword: 'four things'
    },
    {
      id: 'e51', scene: 'procedure', start: 364, end: 370,
      caption: 'Then answer the question that was actually asked: the depth, the entry, the bucket count, or the block reads.',
      detail: 'Four different numbers are easy to confuse: global depth, the number of buckets, the number of directory entries, and the number of block reads. Each has its own formula, and a question usually wants exactly one of them.',
      narration: 'Four numbers are easy to confuse. Answer the one that was asked.',
      keyword: 'the question that was actually asked'
    }
  ]
};
