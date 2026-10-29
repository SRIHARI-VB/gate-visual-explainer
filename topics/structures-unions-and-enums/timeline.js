/* ==========================================================================
   structures-unions-and-enums — THE timeline.
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
      id: 'record',
      n: 1,
      title: 'A struct is one block with named slots',
      start: 0, end: 30,
      objective: 'See a struct type as a fixed map from member names to byte offsets inside one object.'
    },
    {
      id: 'align',
      n: 2,
      title: 'Alignment: a rule about addresses',
      start: 30, end: 60,
      objective: 'State the alignment rule for a member and give the x86-64 sizes and alignments the page uses.'
    },
    {
      id: 'algorithm',
      n: 3,
      title: 'Three rules, one layout',
      start: 60, end: 90,
      objective: 'Apply the offset rule and the total-size rule to char, int, char and account for every byte.'
    },
    {
      id: 'reorder',
      n: 4,
      title: 'Field order changes the size',
      start: 90, end: 120,
      objective: 'Enumerate every arrangement of the same three members and show that sizeof is a property of the declaration.'
    },
    {
      id: 'nested',
      n: 5,
      title: 'A struct inside a struct',
      start: 120, end: 150,
      objective: 'Take a nested struct member\'s alignment as the largest alignment among its own members.'
    },
    {
      id: 'array',
      n: 6,
      title: 'An array of structs, and its stride',
      start: 150, end: 180,
      objective: 'Read the stride of an array of structs as sizeof, and count the bytes for ten elements.'
    },
    {
      id: 'union',
      n: 7,
      title: 'A union overlaps instead of stacking',
      start: 180, end: 210,
      objective: 'Compute a union\'s size as its largest member rounded to its largest alignment, and read GATE CSE 2000 Q1.17.'
    },
    {
      id: 'punning',
      n: 8,
      title: 'Same bytes, two readings',
      start: 210, end: 240,
      objective: 'Trace a write to one union member and a read of another, and name what the standard does and does not promise.'
    },
    {
      id: 'enum',
      n: 9,
      title: 'Enumerations are named integers',
      start: 240, end: 270,
      objective: 'Read an enum as a list of integer constants with a chosen underlying type, not as a string or a checked type.'
    },
    {
      id: 'selfref',
      n: 10,
      title: 'A struct that points at itself',
      start: 270, end: 300,
      objective: 'See why a pointer to the struct\'s own type is legal, why a member of its own type is not, and size a list node.'
    }
  ],

  events: [
    /* ---------------- scene 1: record ---------------- */
    {
      id: 'record-1', start: 0, end: 8, scene: 'record',
      visualAction: 'draw-empty-block',
      caption: 'Declaring a struct creates a type, not an object. The type fixes one offset for every member.',
      narration: 'A struct declaration creates a type. It decides where each member sits inside one block of bytes.',
      trap: 'The declaration reserves no memory. Only an object of the type does.'
    },
    {
      id: 'record-2', start: 8, end: 15, scene: 'record',
      visualAction: 'draw-three-chars',
      caption: 'struct Ournode { char x, y, z; } holds three bytes at offsets 0, 1 and 2.',
      narration: 'Three characters need one byte each and no padding, so they sit at offsets zero, one and two.',
      trap: 'Offset is measured from the start of the object, never from the previous member.'
    },
    {
      id: 'record-3', start: 15, end: 23, scene: 'record',
      visualAction: 'label-offsets',
      caption: 'sizeof is 3, and member order is byte order. GATE CSE 2018 Q2 reads those bytes through a char pointer.',
      narration: 'The size is three, and the order of declaration is the order in memory. That is all the 2018 question needs.',
      trap: 'Casting a struct pointer to char star and adding 1 lands on the second member only when no padding sits between them.'
    },
    {
      id: 'record-4', start: 23, end: 30, scene: 'record',
      visualAction: 'swap-in-int',
      caption: 'Replace one char with an int and the offsets stop being 0, 1, 2. Something else is deciding them.',
      narration: 'Now put an integer in the middle. The offsets change, and the rule that changes them is alignment.',
      trap: 'Assuming offsets follow declaration order is the single most common error in this topic.'
    },

    /* ---------------- scene 2: align ---------------- */
    {
      id: 'align-1', start: 30, end: 38, scene: 'align',
      visualAction: 'draw-ruler',
      caption: 'Alignment is a rule about addresses: an object whose size is 4 must begin at a multiple of 4.',
      narration: 'Alignment constrains the address a member starts at, not the value it holds.',
      trap: 'Alignment is not about the value stored. Any value may sit in an aligned slot.'
    },
    {
      id: 'align-2', start: 38, end: 46, scene: 'align',
      visualAction: 'draw-type-table',
      caption: 'On x86-64, char is 1 byte, short 2, int and float 4, double, long and pointers 8. Alignment equals size.',
      narration: 'These are the sizes the page uses. Each type is self-aligned, so its alignment equals its size.',
      trap: 'These numbers are ABI facts, not C facts. Only sizeof(char) is fixed at 1 by the standard.'
    },
    {
      id: 'align-3', start: 46, end: 54, scene: 'align',
      visualAction: 'place-aligned-vs-unaligned',
      caption: 'An int at address 4 is aligned. At address 3 it would straddle a four-byte boundary, so it is never placed there.',
      narration: 'One address is legal for an integer and the other is not, and the difference is a single byte.',
      trap: 'A misaligned access is not a compile error in general; on some machines it is slow, on some it faults.'
    },
    {
      id: 'align-4', start: 54, end: 60, scene: 'align',
      visualAction: 'mark-padding',
      caption: 'Padding is how the compiler obeys the rule: it skips the bytes it cannot use.',
      narration: 'Those skipped bytes are the padding, and they are counted in sizeof even though they hold nothing.',
      trap: 'Padding bytes have unspecified values. Copying a struct with memcmp can compare padding and fail.'
    },

    /* ---------------- scene 3: algorithm ---------------- */
    {
      id: 'algorithm-1', start: 60, end: 68, scene: 'algorithm',
      visualAction: 'show-three-rules',
      caption: 'Rule 1: round the running offset up to the member\'s alignment. Rule 2: place the member. Rule 3: round the total up.',
      narration: 'Three rules are enough. Round up, place, and round the whole block up at the end.',
      trap: 'Rule 3 is the one people forget, and it is worth the trailing bytes.'
    },
    {
      id: 'algorithm-2', start: 68, end: 76, scene: 'algorithm',
      visualAction: 'place-char-then-int',
      caption: 'char c sits at 0, so the offset becomes 1. An int must start at 4, so three bytes are skipped.',
      narration: 'The character takes offset zero. The integer cannot take offset one, so the layout jumps to four.',
      trap: 'The padding belongs before the int, not after the char. It is placed to satisfy the next member.'
    },
    {
      id: 'algorithm-3', start: 76, end: 84, scene: 'algorithm',
      visualAction: 'place-second-char',
      caption: 'After the int the offset is 8, and the second char sits at 8 with no padding before it.',
      narration: 'A character is happy at any address, so the second one goes straight in at eight.',
      trap: 'Two characters in a row never need padding between them; both have alignment 1.'
    },
    {
      id: 'algorithm-4', start: 84, end: 90, scene: 'algorithm',
      visualAction: 'round-total',
      caption: 'The members end at 9. Rounding up to a multiple of 4 gives 12, so 6 of the 12 bytes are padding.',
      narration: 'Nine bytes are used and twelve are counted. The three extra bytes keep arrays of this struct aligned.',
      trap: 'sizeof 12 is correct even though the last member ends at offset 8 and nothing is stored after it.'
    },

    /* ---------------- scene 4: reorder ---------------- */
    {
      id: 'reorder-1', start: 90, end: 98, scene: 'reorder',
      visualAction: 'show-declaration-order',
      caption: 'C fixes the order of members, never their offsets. The compiler may pad between them as it likes.',
      narration: 'The language promises declaration order and says nothing about the gaps, so the gaps are the ABI\'s business.',
      trap: 'A program that assumes a layout is relying on one compiler on one platform.'
    },
    {
      id: 'reorder-2', start: 98, end: 106, scene: 'reorder',
      visualAction: 'draw-three-bars',
      caption: 'char, int, char is 12. char, char, int is 8. int, char, char is 8.',
      narration: 'The same three members, three arrangements, and only two sizes, because two of them are the same arrangement up to the names.',
      trap: 'The two chars are interchangeable, so six permutations collapse to three distinct layouts.'
    },
    {
      id: 'reorder-3', start: 106, end: 114, scene: 'reorder',
      visualAction: 'annotate-padding-counts',
      caption: 'Every one of the six permutations was laid out by the same function and measured, not assumed.',
      narration: 'The page ran the layout on all six orders and grouped the results by size.',
      trap: 'A question that gives you the order is asking you to obey it, not to find the smallest size.'
    },
    {
      id: 'reorder-4', start: 114, end: 120, scene: 'reorder',
      visualAction: 'sort-by-alignment',
      caption: 'Putting the widest member first usually shrinks the struct, because the small ones then pack together.',
      narration: 'Sort by decreasing alignment and the padding tends to collapse, which is why that advice exists.',
      trap: 'It is a heuristic, not a theorem: a packed or bit-field struct can break the pattern.'
    },

    /* ---------------- scene 5: nested ---------------- */
    {
      id: 'nested-1', start: 120, end: 128, scene: 'nested',
      visualAction: 'draw-inner-struct',
      caption: 'A struct member is laid out like any other object. Its alignment is the largest alignment among its own members.',
      narration: 'A struct is itself an object with a size and an alignment, so it can be a member of another struct.',
      trap: 'The alignment of a struct is not its size. It is the maximum of its members\' alignments.'
    },
    {
      id: 'nested-2', start: 128, end: 136, scene: 'nested',
      visualAction: 'size-inner',
      caption: 'struct Inner { char a; int b; } is 8 bytes: a at 0, three pad, b at 4. Its alignment is 4.',
      narration: 'The inner struct is eight bytes with alignment four, because four is the largest alignment inside it.',
      trap: 'Its own trailing padding is already inside the eight bytes; do not add it again in the outer struct.'
    },
    {
      id: 'nested-3', start: 136, end: 144, scene: 'nested',
      visualAction: 'place-inner-in-outer',
      caption: 'struct Outer { char c; struct Inner in; } puts c at 0 and must reach offset 4 before placing in.',
      narration: 'The outer struct pads three bytes to bring the inner struct to a multiple of four.',
      trap: 'The gap is three bytes because the outer\'s first member is one byte, not because of the inner size.'
    },
    {
      id: 'nested-4', start: 144, end: 150, scene: 'nested',
      visualAction: 'size-outer',
      caption: 'The outer block is 12 bytes: 1 + 3 pad + 8, and 12 is already a multiple of 4.',
      narration: 'Twelve bytes in total, and no trailing padding is needed because twelve is already aligned.',
      trap: 'Nesting never shrinks a struct. It can only add the outer padding.'
    },

    /* ---------------- scene 6: array ---------------- */
    {
      id: 'array-1', start: 150, end: 158, scene: 'array',
      visualAction: 'draw-three-elements',
      caption: 'In an array of structs the stride is sizeof, so element k starts at base + k times sizeof.',
      narration: 'Elements are contiguous, so each one starts where the previous one ended, including its padding.',
      trap: 'Stride and size of the useful fields are different numbers, and questions often quote the second.'
    },
    {
      id: 'array-2', start: 158, end: 166, scene: 'array',
      visualAction: 'label-stride',
      caption: 'struct P { char c; int i; } is 8 bytes. Ten of them occupy 80 bytes, not 50.',
      narration: 'Eight bytes each, so ten elements take eighty, while the fields themselves hold only fifty.',
      trap: 'Summing the member sizes gives 5 per element and undercounts by 60 per cent.'
    },
    {
      id: 'array-3', start: 166, end: 174, scene: 'array',
      visualAction: 'show-per-element-padding',
      caption: 'Padding is per element. It cannot be shared, because every element must satisfy the rule on its own.',
      narration: 'Each element carries its own gap, since each element must start aligned by itself.',
      trap: 'A packed array is a different declaration, not a different way of counting the same one.'
    },
    {
      id: 'array-4', start: 174, end: 180, scene: 'array',
      visualAction: 'state-alignment-premise',
      caption: 'If the first element is aligned, every later element is too, because the stride is a multiple of the alignment.',
      narration: 'One aligned base is enough, and that is why rule three rounds the struct size up at all.',
      trap: 'This is exactly the premise a question states when it says the array starts at an address divisible by 8.'
    },

    /* ---------------- scene 7: union ---------------- */
    {
      id: 'union-1', start: 180, end: 188, scene: 'union',
      visualAction: 'draw-overlapping-members',
      caption: 'A union is the opposite arrangement: every member starts at offset 0 and they overlap completely.',
      narration: 'In a union the members share one address, so writing one overwrites what the others would read.',
      trap: 'A union of five members is not five times anything. Only one member is meaningful at a time.'
    },
    {
      id: 'union-2', start: 188, end: 196, scene: 'union',
      visualAction: 'size-union',
      caption: 'Its size is the largest member, rounded up to the largest alignment. union { char s[5]; int i; } is 8.',
      narration: 'The largest member is five bytes, and five rounds up to eight because the alignment is four.',
      trap: 'Saying 5 is the classic slip; the trailing bytes exist so arrays of the union stay aligned.'
    },
    {
      id: 'union-3', start: 196, end: 204, scene: 'union',
      visualAction: 'gate2000-arithmetic',
      caption: 'GATE CSE 2000 Q1.17: short s[5] is 10 bytes, the union of float and long is 8, so ignoring alignment the answer is 18.',
      narration: 'The question asks you to ignore alignment, so the members simply add: ten plus eight.',
      trap: 'The question says "ignoring alignment". With alignment on x86-64 the same object is 24 bytes, and that is not the asked answer.'
    },
    {
      id: 'union-4', start: 204, end: 210, scene: 'union',
      visualAction: 'compare-struct-union',
      caption: 'A struct stacks its members; a union overlaps them. Same keyword shape, opposite arithmetic.',
      narration: 'That single difference is the whole distinction between the two, and it decides every size question.',
      trap: 'A union inside a struct behaves like a struct member: it is placed, then the layout continues after it.'
    },

    /* ---------------- scene 8: punning ---------------- */
    {
      id: 'punning-1', start: 210, end: 218, scene: 'punning',
      visualAction: 'write-int',
      caption: 'Because members overlap, writing one and reading another reinterprets the same bytes.',
      narration: 'Write the integer member, then read the character array, and you are reading the integer\'s bytes.',
      trap: 'No conversion happens. The bits are not changed; only the reading type is.'
    },
    {
      id: 'punning-2', start: 218, end: 226, scene: 'punning',
      visualAction: 'little-endian-bytes',
      caption: '0x12345678 read as four chars gives 78 56 34 12 on a little-endian machine.',
      narration: 'Little-endian stores the least significant byte first, so the lowest address holds 0x78.',
      trap: 'Byte order is a property of the machine, not of the language, so the output is not portable.'
    },
    {
      id: 'punning-3', start: 226, end: 234, scene: 'punning',
      visualAction: 'big-endian-bytes',
      caption: 'The same write on a big-endian machine gives 12 34 56 78. Identical C, different output.',
      narration: 'Big-endian stores the most significant byte first, and the four values reverse.',
      trap: 'A question that does not state the byte order has no single answer for this program.'
    },
    {
      id: 'punning-4', start: 234, end: 240, scene: 'punning',
      visualAction: 'state-standard-position',
      caption: 'Reading through a char pointer is always allowed. Reading a different non-character member reinterprets an object representation.',
      narration: 'Character access is explicitly permitted; other reinterpretations are allowed but may yield a trap representation.',
      trap: 'A union is not a licence to reinterpret a float as an int and get a number that means anything.'
    },

    /* ---------------- scene 9: enum ---------------- */
    {
      id: 'enum-1', start: 240, end: 248, scene: 'enum',
      visualAction: 'list-enumerators',
      caption: 'An enumeration names integer constants. It stores no strings and adds no check on assignment.',
      narration: 'An enum is a list of names for integer values, and nothing more than that.',
      trap: 'printf with %s on an enumerator is undefined; an enumerator is an int, so %d is the format.'
    },
    {
      id: 'enum-2', start: 248, end: 256, scene: 'enum',
      visualAction: 'show-values',
      caption: 'enum colour { RED, GREEN, BLUE } gives 0, 1 and 2, because an unwritten first value is 0 and each next is one more.',
      narration: 'The values count up from zero unless you write them, and each one may be written explicitly.',
      trap: 'Writing only the first value does not reset the others; the counting continues from it.'
    },
    {
      id: 'enum-3', start: 256, end: 264, scene: 'enum',
      visualAction: 'show-size',
      caption: 'The underlying type is implementation-defined but must hold every value. For a small enum on x86-64 it is int, so sizeof is 4.',
      narration: 'An enumeration object occupies one integer, four bytes here, whatever the number of enumerators.',
      trap: 'sizeof(enum) is not the number of enumerators, and it is not the size of the longest name.'
    },
    {
      id: 'enum-4', start: 264, end: 270, scene: 'enum',
      visualAction: 'show-duplicates',
      caption: 'Two enumerators may share a value, and an enum variable may hold a value no enumerator names.',
      narration: 'Duplicates are legal and the compiler will not complain, so distinctness is your job, not the type\'s.',
      trap: 'Assigning an out-of-range integer to an enum variable is allowed in C; it is a compile error only in C++ in some modes.'
    },

    /* ---------------- scene 10: selfref ---------------- */
    {
      id: 'selfref-1', start: 270, end: 278, scene: 'selfref',
      visualAction: 'draw-node-box',
      caption: 'A struct may contain a pointer to its own type, because a pointer has a fixed size known in advance.',
      narration: 'The member is a pointer, not the struct, so its size is already known when the struct is being laid out.',
      trap: 'The pointer must be to a tagged type, struct node, not to a typedef that does not exist yet.'
    },
    {
      id: 'selfref-2', start: 278, end: 286, scene: 'selfref',
      visualAction: 'size-node',
      caption: 'struct node { int elt; struct node *next; } is 16 bytes: 4 for the int, 4 of padding, 8 for the pointer.',
      narration: 'Sixteen bytes, because the pointer needs an eight-aligned address and four bytes are skipped to reach it.',
      trap: 'On a 32-bit machine the same declaration is 8 bytes, so a size question without an ABI has no answer.'
    },
    {
      id: 'selfref-3', start: 286, end: 293, scene: 'selfref',
      visualAction: 'show-illegal-member',
      caption: 'It may not contain itself by value: that would need its own size before it had one.',
      narration: 'A member of its own type would require an infinite size, so C forbids it and the compiler says so.',
      trap: 'An incomplete type may only be used through a pointer, which is exactly why the tag is enough here.'
    },
    {
      id: 'selfref-4', start: 293, end: 300, scene: 'selfref',
      visualAction: 'count-pointer-array',
      caption: 'struct node *s[10] is an array of ten pointers, 80 bytes, and not ten nodes. GATE CSE 2000 Q1.31 asks exactly this.',
      narration: 'Ten pointers of eight bytes each, which is eighty, and no nodes at all.',
      trap: 'The star binds to the name, not to the array: the array is of pointers, and each element still needs allocating.'
    }
  ]
};
