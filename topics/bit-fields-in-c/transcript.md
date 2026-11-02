# Bit Fields in C: widths, allocation units, and the six things the standard leaves open — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/bit-fields-in-c/index.html`
- Total duration: 6:00 (360 seconds), 12 scenes, 48 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Three small numbers, twelve bytes

*0:00 – 0:30 · objective: See the waste a struct of ints carries for values that need five or six bits, and the same three values packed into one unit.*

**0:00–0:07** — Three ordinary unsigned members, one after another. Each takes four bytes.

> Caption: Three ordinary unsigned members. Each one takes four bytes, whatever value it holds.

Exam-trap caption mode adds: *The size of the struct is the sum of the member sizes plus padding, not the size of the values stored.*

**0:07–0:15** — Hours run to twenty-three and minutes to fifty-nine, so most of those bits are always zero.

> Caption: Hours run to 23 and minutes to 59, so most of those thirty-two bits are always zero.

Exam-trap caption mode adds: *The unused bits are not free: they are in the object, and they count in sizeof.*

**0:15–0:22** — The same three values as bit-fields: five, six and six bits, seventeen in all, inside one unit.

> Caption: The same three values as bit-fields: 5 + 6 + 6 = 17 bits, inside one unit, so four bytes.

Exam-trap caption mode adds: *The struct is not three bytes. The unit is rounded up to its own size, so the answer is four.*

**0:22–0:30** — Twelve bytes became four, and no value was lost. But a bit-field is not an int.

> Caption: Twelve bytes became four, and nothing was lost: the values still fit. But a field is not an int.

Exam-trap caption mode adds: *Reading a field as if it were an int is the mistake the rest of the lesson is about.*

## Scene 2. The declaration and its four constraints

*0:30 – 1:00 · objective: Read the name-colon-width form and state the four rules the standard places on a bit-field declaration.*

**0:30–0:37** — A bit-field is a member name, a colon, and a width in bits.

> Caption: A bit-field is a member name, a colon, and a width in bits: kind : 3.

Exam-trap caption mode adds: *The width is not a byte count and not a type size; it is a number of bits.*

**0:37–0:45** — The type must be one of those, or another type the implementation allows.

> Caption: The type must be _Bool, signed int, unsigned int, or a type the implementation allows.

Exam-trap caption mode adds: *char and long bit-fields are extensions, not standard C, so a question using them is about one compiler.*

**0:45–0:52** — The width may not exceed the bits in the type, so thirty-three is refused.

> Caption: The width may not exceed the bits in that type: 33 for an unsigned int is a constraint violation.

Exam-trap caption mode adds: *A width equal to the type width is legal: unsigned int a : 32 is allowed, and 33 is not.*

**0:52–1:00** — A bit-field is a named run of bits inside a unit, and it has no address of its own.

> Caption: A bit-field is a named run of bits in a unit. It has no address of its own.

Exam-trap caption mode adds: *This is a definition, not a limitation of one compiler. Every implementation behaves this way.*

## Scene 3. One allocation unit, thirty-two bits

*1:00 – 1:30 · objective: See the unit as thirty-two numbered bits, with bit zero at the right, and fields packed from the low end.*

**1:00–1:07** — One allocation unit, thirty-two numbered bits, with bit thirty-one on the left.

> Caption: One allocation unit: thirty-two numbered bits, bit 31 on the left and bit 0 on the right.

Exam-trap caption mode adds: *The unit is not a byte. A bit-field can span bytes inside one unit.*

**1:07–1:15** — Bit b sits in byte b over eight, at position b mod eight. Nothing is stored per field.

> Caption: Bit b sits in byte b/8, at position b mod 8. Nothing is stored per field.

Exam-trap caption mode adds: *A field of width 3 does not occupy three bytes or three bits of its own object; it is three bits of the unit.*

**1:15–1:22** — The first field goes into the low-order bits, and the next continues where it stopped.

> Caption: The first field goes into the low-order bits, and the next continues where it stopped.

Exam-trap caption mode adds: *That packing rule is required; which end it starts from is not.*

**1:22–1:30** — Which end is first is implementation-defined. This page draws the choice GCC makes.

> Caption: Which end is first is implementation-defined. This page draws the choice GCC makes on x86-64.

Exam-trap caption mode adds: *A big-endian target of the same compiler packs from the other end, so the bits move while sizeof stays.*

## Scene 4. Four fields, one unit, four bytes

*1:30 – 2:00 · objective: Pack widths 5, 11, 6 and 2 into one unit and read the size as four bytes rather than three.*

**1:30–1:37** — b one is five bits, so it takes bits zero to four.

> Caption: b1 is five bits, so it takes bits 0 to 4 of the unit.

Exam-trap caption mode adds: *Five bits hold thirty-two values, 0 to 31. A value of 32 does not fit and will not be stored as itself.*

**1:37–1:45** — The unnamed field takes the next eleven bits and gives them to nobody.

> Caption: The unnamed field takes the next eleven bits and gives them to nobody.

Exam-trap caption mode adds: *Padding is not zeroed. Its bits have no defined value and are not preserved by assignment.*

**1:45–1:52** — b two takes bits sixteen to twenty-one, b three takes twenty-two and twenty-three.

> Caption: b2 takes bits 16 to 21 and b3 takes 22 and 23. Bits 24 to 31 are left unused.

Exam-trap caption mode adds: *The unused bits at the top are still part of the object: sizeof counts the whole unit.*

**1:52–2:00** — The widths sum to twenty-four bits, which is three bytes, but the size is four.

> Caption: Widths sum to 24 bits, which is three bytes, but sizeof is four: the unit is rounded up.

Exam-trap caption mode adds: *Adding the widths and dividing by eight is the commonest wrong method, and it is wrong by a whole unit here.*

## Scene 5. When a field does not fit, a new unit starts

*2:00 – 2:30 · objective: Apply the fit rule to 20 + 20 and to 28 + 8, and say where the second field begins in each case.*

**2:00–2:07** — A twenty-bit field leaves twelve bits of the unit free.

> Caption: A twenty-bit field leaves twelve bits of the unit free.

Exam-trap caption mode adds: *Twelve free bits is not a promise that the next field fits; the next field needs twenty.*

**2:07–2:15** — The second field needs twenty bits and only twelve remain, so it begins a new unit.

> Caption: b needs twenty bits and only twelve remain, so b begins a new unit.

Exam-trap caption mode adds: *The lost bits are the cost of not straddling; a compiler that straddles would use them and could be smaller.*

**2:15–2:22** — Twenty-eight bits leave four free, and an eight-bit field still does not fit.

> Caption: A twenty-eight-bit field leaves four free bits, and an eight-bit field still does not fit.

Exam-trap caption mode adds: *An eight-bit field fits in a thirty-two-bit unit but not in the four bits that are left.*

**2:22–2:30** — So the second field starts at bit thirty-two, not twenty-eight.

> Caption: So the second field starts at bit 32, not at bit 28. Straddling is implementation-defined.

Exam-trap caption mode adds: *Both layouts are legal, so a question asking which bits a field occupies must name the compiler.*

## Scene 6. The zero-width field ends the unit

*2:30 – 3:00 · objective: Show one declaration with a zero-width field and the same declaration without it, and account for the four bytes.*

**2:30–2:37** — Here b one is followed by a colon and a zero. That takes no bits at all.

> Caption: Here b1 is followed by a colon and a zero. That is a zero-width field, and it takes no bits.

Exam-trap caption mode adds: *A zero width is not an empty member that can be read; it is a layout instruction.*

**2:37–2:45** — It ends the unit, so the next fields start in a new unit and the size doubles.

> Caption: It ends the unit. b2 and b3 start in a new unit, so the struct is eight bytes.

Exam-trap caption mode adds: *The bits thrown away are not padding you can reach; they are simply not part of any field.*

**2:45–2:52** — Delete the colon and the zero, change nothing else, and all three fit in one unit.

> Caption: Delete the colon and the zero, change nothing else, and all three fields fit in one unit.

Exam-trap caption mode adds: *The difference is one token, and it changes both the size and every field position after it.*

**2:52–3:00** — Eight bytes against four, from a single zero.

> Caption: Eight bytes against four, from one zero. That is the sharpest example of layout as a declaration.

Exam-trap caption mode adds: *Do not read the zero-width field as padding of width zero in the sense of the unnamed four-bit field.*

## Scene 7. Unnamed fields: padding you can place

*3:00 – 3:30 · objective: Distinguish an unnamed field of width four from a zero-width field, and see what each does to the layout.*

**3:00–3:07** — An unnamed field of width four takes four bits and gives them to nobody.

> Caption: An unnamed field of width four takes four bits of the unit and gives them to nobody.

Exam-trap caption mode adds: *This one keeps the unit going: it consumes bits rather than ending the unit.*

**3:07–3:15** — b follows it inside the same unit, at bits eight and nine.

> Caption: b follows it inside the same unit, at bits 8 and 9.

Exam-trap caption mode adds: *Skipping the four bits instead of placing them would put b at bits 4 and 5.*

**3:15–3:22** — The zero-width field after b is a different instruction: it ends the unit.

> Caption: The zero-width field after b is a different instruction: it ends the unit, so c starts a new one.

Exam-trap caption mode adds: *The two unnamed forms look similar and do opposite things to the unit.*

**3:22–3:30** — Padding fields exist to place a field at a chosen bit, usually to match an external format.

> Caption: Padding fields exist to place a field at a chosen bit, usually to match a format someone else defined.

Exam-trap caption mode adds: *Padding bits are not zeroed, so a struct cannot be compared byte for byte after being filled.*

## Scene 8. A full member ends the unit

*3:30 – 4:00 · objective: Trace a struct that mixes bit-fields with one int member and reach sixteen bytes.*

**3:30–3:37** — Two one-bit fields at bits zero and one, and then an ordinary int member.

> Caption: Two one-bit fields at bits 0 and 1, and then an ordinary int member.

Exam-trap caption mode adds: *The thirty bits between the fields and the int are lost, not reused.*

**3:37–3:45** — The int starts at offset four, which ends the unit above it.

> Caption: The int starts at offset 4, which ends the unit above it.

Exam-trap caption mode adds: *The unit is not shrunk to the two bits used; it occupies its full four bytes.*

**3:45–3:52** — Four more fields pack into a third unit: ac, four bits of padding, and clock.

> Caption: Four more fields pack into a third unit: ac, four bits of padding, and clock.

Exam-trap caption mode adds: *The padding here is placed, so clock lands at bit 8 of the unit, not at bit 4.*

**3:52–4:00** — The zero-width field forces a fourth unit for flag, so the struct is sixteen bytes.

> Caption: The zero-width field forces a fourth unit for flag, so the whole struct is sixteen bytes.

Exam-trap caption mode adds: *Without the zero-width field the last field would share unit three and the size would be twelve.*

## Scene 9. The width decides the range and the reading

*4:00 – 4:30 · objective: Read the same three bits as unsigned and as signed, and store an out-of-range value to see it wrap.*

**4:00–4:07** — Three bits hold eight patterns. Read as unsigned, they are zero to seven.

> Caption: Three bits hold eight patterns. Read as unsigned, they are 0 to 7.

Exam-trap caption mode adds: *The width sets the range; the declared type sets how the patterns are read.*

**4:07–4:15** — Read as signed, the top bit is the sign, so the last four patterns are negative.

> Caption: Read as signed, the top bit is the sign, so the same eight patterns are 0 to 3 and then -4 to -1.

Exam-trap caption mode adds: *Six and minus two are the same three bits; which one prints depends on the declared type.*

**4:15–4:22** — A store is reduced modulo eight, so nine becomes one and seven plus one becomes zero.

> Caption: A store is reduced modulo eight: 9 becomes 1, and incrementing 7 gives 0.

Exam-trap caption mode adds: *This is wrapping, not undefined behaviour: an unsigned field is defined here, unlike signed overflow.*

**4:22–4:30** — For a plain int field, whether it is signed or unsigned is implementation-defined.

> Caption: For a plain int field, whether it is signed or unsigned is implementation-defined.

Exam-trap caption mode adds: *So a question that prints a plain int field of width 3 has no portable answer for 110.*

## Scene 10. A bit-field has no address

*4:30 – 5:00 · objective: Name the four constructs a bit-field refuses, and say why they all fail for the same reason.*

**4:30–4:37** — Taking the address of a field is a constraint violation.

> Caption: Taking the address of a field is a constraint violation: the operand of & may not be a bit-field.

Exam-trap caption mode adds: *The compiler must diagnose it. This is not a warning that can be switched off.*

**4:37–4:45** — sizeof of a field is not allowed either.

> Caption: sizeof of a field is not allowed either: sizeof takes an object or a type, and a field is neither.

Exam-trap caption mode adds: *sizeof of the struct is fine and is the question actually asked; sizeof of the field is not.*

**4:45–4:52** — There are no arrays of bit-fields, and offsetof on one has no defined answer.

> Caption: There are no arrays of bit-fields, and offsetof on one has no defined answer.

Exam-trap caption mode adds: *offsetof is defined in terms of the address of a member, which is exactly what a field lacks.*

**4:52–5:00** — All four fail for one reason: a field may start in the middle of a byte.

> Caption: All four fail for one reason: a field may start mid-byte, so no byte address designates it.

Exam-trap caption mode adds: *Copying the field out into an int and taking the address of that int is the working alternative.*

## Scene 11. Six things the standard leaves open

*5:00 – 5:30 · objective: List what is implementation-defined or unspecified, and what a question must therefore tell you.*

**5:00–5:07** — Six properties are left open, starting with the order inside a unit.

> Caption: Six properties are left open: the order inside a unit, and whether a field may straddle it.

Exam-trap caption mode adds: *Two of the six are the ones almost every exam question turns on, and both are in this list.*

**5:07–5:15** — Also open: the signedness of a plain int field, and which other types are allowed.

> Caption: Also open: the signedness of a plain int field, and which other types are allowed at all.

Exam-trap caption mode adds: *Writing signed int or unsigned int removes the signedness question, which is why it is worth doing.*

**5:15–5:22** — So a question that asks for a size or for bit positions must name the platform.

> Caption: So a question that asks for sizeof, or for the bits a field occupies, must name the platform.

Exam-trap caption mode adds: *A question that does name the compiler is asking you to apply that compiler’s rule, not the standard.*

**5:22–5:30** — What is fixed: a following field packs in if it fits, and the width sets the range.

> Caption: What is fixed: a following field packs in if it fits, and the width sets the range.

Exam-trap caption mode adds: *Everything this page computes assumes the open items resolved the GCC-on-x86-64 way.*

## Scene 12. The five-step reading procedure

*5:30 – 6:00 · objective: Turn the rule into a checklist that sizes any bit-field struct in five steps.*

**5:30–5:37** — Step one: find the colon. Step two: read the declared type.

> Caption: Step one: find the colon. Step two: read the declared type, which fixes the unit and the range.

Exam-trap caption mode adds: *A member with a colon after a cast is not a bit-field; only the declaration form counts.*

**5:37–5:45** — Step three: pack in order. Step four: handle the two unnamed forms.

> Caption: Step three: pack in order, and start a new unit when a field does not fit. Step four: handle the unnamed forms.

Exam-trap caption mode adds: *Treating the two unnamed forms as the same is the error that costs a whole unit.*

**5:45–5:52** — Step five: round the total up to the unit size, then to the struct alignment.

> Caption: Step five: round the total up to the unit size, then to the alignment of the whole struct.

Exam-trap caption mode adds: *Rounding to a byte instead of to the unit is what produces three where the answer is four.*

**5:52–6:00** — Two worked lines: the first fits one unit, and the second needs two.

> Caption: Two worked lines: 5 + 6 + 15 fits one unit, and the same fields with a zero-width field need two.

Exam-trap caption mode adds: *Check one line by hand: 26 bits is four bytes only because the unit is four bytes, not because 26 rounds to 4.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
