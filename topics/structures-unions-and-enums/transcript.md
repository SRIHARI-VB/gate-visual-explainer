# Structures, Unions and Enumerations: layout, padding and type punning — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/structures-unions-and-enums/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A struct is one block with named slots

*0:00 – 0:30 · objective: See a struct type as a fixed map from member names to byte offsets inside one object.*

**0:00–0:08** — A struct declaration creates a type. It decides where each member sits inside one block of bytes.

> Caption: Declaring a struct creates a type, not an object. The type fixes one offset for every member.

Exam-trap caption mode adds: *The declaration reserves no memory. Only an object of the type does.*

**0:08–0:15** — Three characters need one byte each and no padding, so they sit at offsets zero, one and two.

> Caption: struct Ournode { char x, y, z; } holds three bytes at offsets 0, 1 and 2.

Exam-trap caption mode adds: *Offset is measured from the start of the object, never from the previous member.*

**0:15–0:23** — The size is three, and the order of declaration is the order in memory. That is all the 2018 question needs.

> Caption: sizeof is 3, and member order is byte order. GATE CSE 2018 Q2 reads those bytes through a char pointer.

Exam-trap caption mode adds: *Casting a struct pointer to char star and adding 1 lands on the second member only when no padding sits between them.*

**0:23–0:30** — Now put an integer in the middle. The offsets change, and the rule that changes them is alignment.

> Caption: Replace one char with an int and the offsets stop being 0, 1, 2. Something else is deciding them.

Exam-trap caption mode adds: *Assuming offsets follow declaration order is the single most common error in this topic.*

## Scene 2. Alignment: a rule about addresses

*0:30 – 1:00 · objective: State the alignment rule for a member and give the x86-64 sizes and alignments the page uses.*

**0:30–0:38** — Alignment constrains the address a member starts at, not the value it holds.

> Caption: Alignment is a rule about addresses: an object whose size is 4 must begin at a multiple of 4.

Exam-trap caption mode adds: *Alignment is not about the value stored. Any value may sit in an aligned slot.*

**0:38–0:46** — These are the sizes the page uses. Each type is self-aligned, so its alignment equals its size.

> Caption: On x86-64, char is 1 byte, short 2, int and float 4, double, long and pointers 8. Alignment equals size.

Exam-trap caption mode adds: *These numbers are ABI facts, not C facts. Only sizeof(char) is fixed at 1 by the standard.*

**0:46–0:54** — One address is legal for an integer and the other is not, and the difference is a single byte.

> Caption: An int at address 4 is aligned. At address 3 it would straddle a four-byte boundary, so it is never placed there.

Exam-trap caption mode adds: *A misaligned access is not a compile error in general; on some machines it is slow, on some it faults.*

**0:54–1:00** — Those skipped bytes are the padding, and they are counted in sizeof even though they hold nothing.

> Caption: Padding is how the compiler obeys the rule: it skips the bytes it cannot use.

Exam-trap caption mode adds: *Padding bytes have unspecified values. Copying a struct with memcmp can compare padding and fail.*

## Scene 3. Three rules, one layout

*1:00 – 1:30 · objective: Apply the offset rule and the total-size rule to char, int, char and account for every byte.*

**1:00–1:08** — Three rules are enough. Round up, place, and round the whole block up at the end.

> Caption: Rule 1: round the running offset up to the member's alignment. Rule 2: place the member. Rule 3: round the total up.

Exam-trap caption mode adds: *Rule 3 is the one people forget, and it is worth the trailing bytes.*

**1:08–1:16** — The character takes offset zero. The integer cannot take offset one, so the layout jumps to four.

> Caption: char c sits at 0, so the offset becomes 1. An int must start at 4, so three bytes are skipped.

Exam-trap caption mode adds: *The padding belongs before the int, not after the char. It is placed to satisfy the next member.*

**1:16–1:24** — A character is happy at any address, so the second one goes straight in at eight.

> Caption: After the int the offset is 8, and the second char sits at 8 with no padding before it.

Exam-trap caption mode adds: *Two characters in a row never need padding between them; both have alignment 1.*

**1:24–1:30** — Nine bytes are used and twelve are counted. The three extra bytes keep arrays of this struct aligned.

> Caption: The members end at 9. Rounding up to a multiple of 4 gives 12, so 6 of the 12 bytes are padding.

Exam-trap caption mode adds: *sizeof 12 is correct even though the last member ends at offset 8 and nothing is stored after it.*

## Scene 4. Field order changes the size

*1:30 – 2:00 · objective: Enumerate every arrangement of the same three members and show that sizeof is a property of the declaration.*

**1:30–1:38** — The language promises declaration order and says nothing about the gaps, so the gaps are the ABI's business.

> Caption: C fixes the order of members, never their offsets. The compiler may pad between them as it likes.

Exam-trap caption mode adds: *A program that assumes a layout is relying on one compiler on one platform.*

**1:38–1:46** — The same three members, three arrangements, and only two sizes, because two of them are the same arrangement up to the names.

> Caption: char, int, char is 12. char, char, int is 8. int, char, char is 8.

Exam-trap caption mode adds: *The two chars are interchangeable, so six permutations collapse to three distinct layouts.*

**1:46–1:54** — The page ran the layout on all six orders and grouped the results by size.

> Caption: Every one of the six permutations was laid out by the same function and measured, not assumed.

Exam-trap caption mode adds: *A question that gives you the order is asking you to obey it, not to find the smallest size.*

**1:54–2:00** — Sort by decreasing alignment and the padding tends to collapse, which is why that advice exists.

> Caption: Putting the widest member first usually shrinks the struct, because the small ones then pack together.

Exam-trap caption mode adds: *It is a heuristic, not a theorem: a packed or bit-field struct can break the pattern.*

## Scene 5. A struct inside a struct

*2:00 – 2:30 · objective: Take a nested struct member's alignment as the largest alignment among its own members.*

**2:00–2:08** — A struct is itself an object with a size and an alignment, so it can be a member of another struct.

> Caption: A struct member is laid out like any other object. Its alignment is the largest alignment among its own members.

Exam-trap caption mode adds: *The alignment of a struct is not its size. It is the maximum of its members' alignments.*

**2:08–2:16** — The inner struct is eight bytes with alignment four, because four is the largest alignment inside it.

> Caption: struct Inner { char a; int b; } is 8 bytes: a at 0, three pad, b at 4. Its alignment is 4.

Exam-trap caption mode adds: *Its own trailing padding is already inside the eight bytes; do not add it again in the outer struct.*

**2:16–2:24** — The outer struct pads three bytes to bring the inner struct to a multiple of four.

> Caption: struct Outer { char c; struct Inner in; } puts c at 0 and must reach offset 4 before placing in.

Exam-trap caption mode adds: *The gap is three bytes because the outer's first member is one byte, not because of the inner size.*

**2:24–2:30** — Twelve bytes in total, and no trailing padding is needed because twelve is already aligned.

> Caption: The outer block is 12 bytes: 1 + 3 pad + 8, and 12 is already a multiple of 4.

Exam-trap caption mode adds: *Nesting never shrinks a struct. It can only add the outer padding.*

## Scene 6. An array of structs, and its stride

*2:30 – 3:00 · objective: Read the stride of an array of structs as sizeof, and count the bytes for ten elements.*

**2:30–2:38** — Elements are contiguous, so each one starts where the previous one ended, including its padding.

> Caption: In an array of structs the stride is sizeof, so element k starts at base + k times sizeof.

Exam-trap caption mode adds: *Stride and size of the useful fields are different numbers, and questions often quote the second.*

**2:38–2:46** — Eight bytes each, so ten elements take eighty, while the fields themselves hold only fifty.

> Caption: struct P { char c; int i; } is 8 bytes. Ten of them occupy 80 bytes, not 50.

Exam-trap caption mode adds: *Summing the member sizes gives 5 per element and undercounts by 60 per cent.*

**2:46–2:54** — Each element carries its own gap, since each element must start aligned by itself.

> Caption: Padding is per element. It cannot be shared, because every element must satisfy the rule on its own.

Exam-trap caption mode adds: *A packed array is a different declaration, not a different way of counting the same one.*

**2:54–3:00** — One aligned base is enough, and that is why rule three rounds the struct size up at all.

> Caption: If the first element is aligned, every later element is too, because the stride is a multiple of the alignment.

Exam-trap caption mode adds: *This is exactly the premise a question states when it says the array starts at an address divisible by 8.*

## Scene 7. A union overlaps instead of stacking

*3:00 – 3:30 · objective: Compute a union's size as its largest member rounded to its largest alignment, and read GATE CSE 2000 Q1.17.*

**3:00–3:08** — In a union the members share one address, so writing one overwrites what the others would read.

> Caption: A union is the opposite arrangement: every member starts at offset 0 and they overlap completely.

Exam-trap caption mode adds: *A union of five members is not five times anything. Only one member is meaningful at a time.*

**3:08–3:16** — The largest member is five bytes, and five rounds up to eight because the alignment is four.

> Caption: Its size is the largest member, rounded up to the largest alignment. union { char s[5]; int i; } is 8.

Exam-trap caption mode adds: *Saying 5 is the classic slip; the trailing bytes exist so arrays of the union stay aligned.*

**3:16–3:24** — The question asks you to ignore alignment, so the members simply add: ten plus eight.

> Caption: GATE CSE 2000 Q1.17: short s[5] is 10 bytes, the union of float and long is 8, so ignoring alignment the answer is 18.

Exam-trap caption mode adds: *The question says "ignoring alignment". With alignment on x86-64 the same object is 24 bytes, and that is not the asked answer.*

**3:24–3:30** — That single difference is the whole distinction between the two, and it decides every size question.

> Caption: A struct stacks its members; a union overlaps them. Same keyword shape, opposite arithmetic.

Exam-trap caption mode adds: *A union inside a struct behaves like a struct member: it is placed, then the layout continues after it.*

## Scene 8. Same bytes, two readings

*3:30 – 4:00 · objective: Trace a write to one union member and a read of another, and name what the standard does and does not promise.*

**3:30–3:38** — Write the integer member, then read the character array, and you are reading the integer's bytes.

> Caption: Because members overlap, writing one and reading another reinterprets the same bytes.

Exam-trap caption mode adds: *No conversion happens. The bits are not changed; only the reading type is.*

**3:38–3:46** — Little-endian stores the least significant byte first, so the lowest address holds 0x78.

> Caption: 0x12345678 read as four chars gives 78 56 34 12 on a little-endian machine.

Exam-trap caption mode adds: *Byte order is a property of the machine, not of the language, so the output is not portable.*

**3:46–3:54** — Big-endian stores the most significant byte first, and the four values reverse.

> Caption: The same write on a big-endian machine gives 12 34 56 78. Identical C, different output.

Exam-trap caption mode adds: *A question that does not state the byte order has no single answer for this program.*

**3:54–4:00** — Character access is explicitly permitted; other reinterpretations are allowed but may yield a trap representation.

> Caption: Reading through a char pointer is always allowed. Reading a different non-character member reinterprets an object representation.

Exam-trap caption mode adds: *A union is not a licence to reinterpret a float as an int and get a number that means anything.*

## Scene 9. Enumerations are named integers

*4:00 – 4:30 · objective: Read an enum as a list of integer constants with a chosen underlying type, not as a string or a checked type.*

**4:00–4:08** — An enum is a list of names for integer values, and nothing more than that.

> Caption: An enumeration names integer constants. It stores no strings and adds no check on assignment.

Exam-trap caption mode adds: *printf with %s on an enumerator is undefined; an enumerator is an int, so %d is the format.*

**4:08–4:16** — The values count up from zero unless you write them, and each one may be written explicitly.

> Caption: enum colour { RED, GREEN, BLUE } gives 0, 1 and 2, because an unwritten first value is 0 and each next is one more.

Exam-trap caption mode adds: *Writing only the first value does not reset the others; the counting continues from it.*

**4:16–4:24** — An enumeration object occupies one integer, four bytes here, whatever the number of enumerators.

> Caption: The underlying type is implementation-defined but must hold every value. For a small enum on x86-64 it is int, so sizeof is 4.

Exam-trap caption mode adds: *sizeof(enum) is not the number of enumerators, and it is not the size of the longest name.*

**4:24–4:30** — Duplicates are legal and the compiler will not complain, so distinctness is your job, not the type's.

> Caption: Two enumerators may share a value, and an enum variable may hold a value no enumerator names.

Exam-trap caption mode adds: *Assigning an out-of-range integer to an enum variable is allowed in C; it is a compile error only in C++ in some modes.*

## Scene 10. A struct that points at itself

*4:30 – 5:00 · objective: See why a pointer to the struct's own type is legal, why a member of its own type is not, and size a list node.*

**4:30–4:38** — The member is a pointer, not the struct, so its size is already known when the struct is being laid out.

> Caption: A struct may contain a pointer to its own type, because a pointer has a fixed size known in advance.

Exam-trap caption mode adds: *The pointer must be to a tagged type, struct node, not to a typedef that does not exist yet.*

**4:38–4:46** — Sixteen bytes, because the pointer needs an eight-aligned address and four bytes are skipped to reach it.

> Caption: struct node { int elt; struct node *next; } is 16 bytes: 4 for the int, 4 of padding, 8 for the pointer.

Exam-trap caption mode adds: *On a 32-bit machine the same declaration is 8 bytes, so a size question without an ABI has no answer.*

**4:46–4:53** — A member of its own type would require an infinite size, so C forbids it and the compiler says so.

> Caption: It may not contain itself by value: that would need its own size before it had one.

Exam-trap caption mode adds: *An incomplete type may only be used through a pointer, which is exactly why the tag is enough here.*

**4:53–5:00** — Ten pointers of eight bytes each, which is eighty, and no nodes at all.

> Caption: struct node *s[10] is an array of ten pointers, 80 bytes, and not ten nodes. GATE CSE 2000 Q1.31 asks exactly this.

Exam-trap caption mode adds: *The star binds to the name, not to the array: the array is of pointers, and each element still needs allocating.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
