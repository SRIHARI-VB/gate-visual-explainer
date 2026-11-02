/* ==========================================================================
   bit-fields-in-c — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.

   Every number quoted in a caption is computed by the model in lesson.js and
   printed on the canvas; the two agree because both read the same computation.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 360,

  scenes: [
    {
      id: 'waste', n: 1,
      title: 'Three small numbers, twelve bytes',
      start: 0, end: 30,
      objective: 'See the waste a struct of ints carries for values that need five or six bits, and the same three values packed into one unit.'
    },
    {
      id: 'decl', n: 2,
      title: 'The declaration and its four constraints',
      start: 30, end: 60,
      objective: 'Read the name-colon-width form and state the four rules the standard places on a bit-field declaration.'
    },
    {
      id: 'unit', n: 3,
      title: 'One allocation unit, thirty-two bits',
      start: 60, end: 90,
      objective: 'See the unit as thirty-two numbered bits, with bit zero at the right, and fields packed from the low end.'
    },
    {
      id: 'pack', n: 4,
      title: 'Four fields, one unit, four bytes',
      start: 90, end: 120,
      objective: 'Pack widths 5, 11, 6 and 2 into one unit and read the size as four bytes rather than three.'
    },
    {
      id: 'full', n: 5,
      title: 'When a field does not fit, a new unit starts',
      start: 120, end: 150,
      objective: 'Apply the fit rule to 20 + 20 and to 28 + 8, and say where the second field begins in each case.'
    },
    {
      id: 'zero', n: 6,
      title: 'The zero-width field ends the unit',
      start: 150, end: 180,
      objective: 'Show one declaration with a zero-width field and the same declaration without it, and account for the four bytes.'
    },
    {
      id: 'unnamed', n: 7,
      title: 'Unnamed fields: padding you can place',
      start: 180, end: 210,
      objective: 'Distinguish an unnamed field of width four from a zero-width field, and see what each does to the layout.'
    },
    {
      id: 'mixed', n: 8,
      title: 'A full member ends the unit',
      start: 210, end: 240,
      objective: 'Trace a struct that mixes bit-fields with one int member and reach sixteen bytes.'
    },
    {
      id: 'range', n: 9,
      title: 'The width decides the range and the reading',
      start: 240, end: 270,
      objective: 'Read the same three bits as unsigned and as signed, and store an out-of-range value to see it wrap.'
    },
    {
      id: 'noaddress', n: 10,
      title: 'A bit-field has no address',
      start: 270, end: 300,
      objective: 'Name the four constructs a bit-field refuses, and say why they all fail for the same reason.'
    },
    {
      id: 'impl', n: 11,
      title: 'Six things the standard leaves open',
      start: 300, end: 330,
      objective: 'List what is implementation-defined or unspecified, and what a question must therefore tell you.'
    },
    {
      id: 'procedure', n: 12,
      title: 'The five-step reading procedure',
      start: 330, end: 360,
      objective: 'Turn the rule into a checklist that sizes any bit-field struct in five steps.'
    }
  ],

  events: [
    /* ---------------- scene 1: waste ---------------- */
    {
      id: 'waste-1', start: 0, end: 7.5, scene: 'waste',
      visualAction: 'draw-three-ints',
      caption: 'Three ordinary unsigned members. Each one takes four bytes, whatever value it holds.',
      narration: 'Three ordinary unsigned members, one after another. Each takes four bytes.',
      detail: 'struct time { unsigned h, m, s; } occupies twelve bytes on a platform where unsigned int is four bytes.',
      trap: 'The size of the struct is the sum of the member sizes plus padding, not the size of the values stored.'
    },
    {
      id: 'waste-2', start: 7.5, end: 15, scene: 'waste',
      visualAction: 'show-unused-bits',
      caption: 'Hours run to 23 and minutes to 59, so most of those thirty-two bits are always zero.',
      narration: 'Hours run to twenty-three and minutes to fifty-nine, so most of those bits are always zero.',
      detail: '5 bits hold 32 values, which covers 0 to 23; 6 bits hold 64 values, which covers 0 to 59.',
      trap: 'The unused bits are not free: they are in the object, and they count in sizeof.'
    },
    {
      id: 'waste-3', start: 15, end: 22.5, scene: 'waste',
      visualAction: 'pack-fields',
      caption: 'The same three values as bit-fields: 5 + 6 + 6 = 17 bits, inside one unit, so four bytes.',
      narration: 'The same three values as bit-fields: five, six and six bits, seventeen in all, inside one unit.',
      detail: 'One allocation unit is 32 bits. Seventeen are used, fifteen are not, and the unit is four bytes.',
      trap: 'The struct is not three bytes. The unit is rounded up to its own size, so the answer is four.'
    },
    {
      id: 'waste-4', start: 22.5, end: 30, scene: 'waste',
      visualAction: 'compare-sizes',
      caption: 'Twelve bytes became four, and nothing was lost: the values still fit. But a field is not an int.',
      narration: 'Twelve bytes became four, and no value was lost. But a bit-field is not an int.',
      detail: 'Every figure on this scene is computed by the page from the declared widths, not copied from a compiler run.',
      trap: 'Reading a field as if it were an int is the mistake the rest of the lesson is about.'
    },

    /* ---------------- scene 2: decl ---------------- */
    {
      id: 'decl-1', start: 30, end: 37.5, scene: 'decl',
      visualAction: 'show-declaration',
      caption: 'A bit-field is a member name, a colon, and a width in bits: kind : 3.',
      narration: 'A bit-field is a member name, a colon, and a width in bits.',
      detail: 'The width is an integer constant expression, so it is known before the program runs.',
      trap: 'The width is not a byte count and not a type size; it is a number of bits.'
    },
    {
      id: 'decl-2', start: 37.5, end: 45, scene: 'decl',
      visualAction: 'show-constraints',
      caption: 'The type must be _Bool, signed int, unsigned int, or a type the implementation allows.',
      narration: 'The type must be one of those, or another type the implementation allows.',
      detail: 'Clause 6.7.2.1 of the C standard states this constraint. Other types are implementation-defined.',
      trap: 'char and long bit-fields are extensions, not standard C, so a question using them is about one compiler.'
    },
    {
      id: 'decl-3', start: 45, end: 52.5, scene: 'decl',
      visualAction: 'show-width-rule',
      caption: 'The width may not exceed the bits in that type: 33 for an unsigned int is a constraint violation.',
      narration: 'The width may not exceed the bits in the type, so thirty-three is refused.',
      detail: 'A constraint violation requires a diagnostic. No object is produced, so no size can be asked for.',
      trap: 'A width equal to the type width is legal: unsigned int a : 32 is allowed, and 33 is not.'
    },
    {
      id: 'decl-4', start: 52.5, end: 60, scene: 'decl',
      visualAction: 'show-no-address',
      caption: 'A bit-field is a named run of bits in a unit. It has no address of its own.',
      narration: 'A bit-field is a named run of bits inside a unit, and it has no address of its own.',
      detail: 'The standard says the address-of operator cannot be applied to a bit-field, so there are no pointers to fields.',
      trap: 'This is a definition, not a limitation of one compiler. Every implementation behaves this way.'
    },

    /* ---------------- scene 3: unit ---------------- */
    {
      id: 'unit-1', start: 60, end: 67.5, scene: 'unit',
      visualAction: 'draw-unit',
      caption: 'One allocation unit: thirty-two numbered bits, bit 31 on the left and bit 0 on the right.',
      narration: 'One allocation unit, thirty-two numbered bits, with bit thirty-one on the left.',
      detail: 'The unit is the addressable storage object the fields live in. Its size is that of the declared type.',
      trap: 'The unit is not a byte. A bit-field can span bytes inside one unit.'
    },
    {
      id: 'unit-2', start: 67.5, end: 75, scene: 'unit',
      visualAction: 'show-bit-address',
      caption: 'Bit b sits in byte b/8, at position b mod 8. Nothing is stored per field.',
      narration: 'Bit b sits in byte b over eight, at position b mod eight. Nothing is stored per field.',
      detail: 'This is why a field can begin mid-byte and why no byte address designates it.',
      trap: 'A field of width 3 does not occupy three bytes or three bits of its own object; it is three bits of the unit.'
    },
    {
      id: 'unit-3', start: 75, end: 82.5, scene: 'unit',
      visualAction: 'pack-low-first',
      caption: 'The first field goes into the low-order bits, and the next continues where it stopped.',
      narration: 'The first field goes into the low-order bits, and the next continues where it stopped.',
      detail: 'The standard requires a following field to be packed into adjacent bits if enough space remains.',
      trap: 'That packing rule is required; which end it starts from is not.'
    },
    {
      id: 'unit-4', start: 82.5, end: 90, scene: 'unit',
      visualAction: 'show-order-warning',
      caption: 'Which end is first is implementation-defined. This page draws the choice GCC makes on x86-64.',
      narration: 'Which end is first is implementation-defined. This page draws the choice GCC makes.',
      detail: 'Clause 6.7.2.1: the order of allocation of bit-fields within a unit is implementation-defined.',
      trap: 'A big-endian target of the same compiler packs from the other end, so the bits move while sizeof stays.'
    },

    /* ---------------- scene 4: pack ---------------- */
    {
      id: 'pack-1', start: 90, end: 97.5, scene: 'pack',
      visualAction: 'place-b1',
      caption: 'b1 is five bits, so it takes bits 0 to 4 of the unit.',
      narration: 'b one is five bits, so it takes bits zero to four.',
      detail: 'The field occupies the lowest five bits, which are the five rightmost cells of the drawing.',
      trap: 'Five bits hold thirty-two values, 0 to 31. A value of 32 does not fit and will not be stored as itself.'
    },
    {
      id: 'pack-2', start: 97.5, end: 105, scene: 'pack',
      visualAction: 'place-padding',
      caption: 'The unnamed field takes the next eleven bits and gives them to nobody.',
      narration: 'The unnamed field takes the next eleven bits and gives them to nobody.',
      detail: 'It is written as a colon and a width with no name, so there is nothing to read or write.',
      trap: 'Padding is not zeroed. Its bits have no defined value and are not preserved by assignment.'
    },
    {
      id: 'pack-3', start: 105, end: 112.5, scene: 'pack',
      visualAction: 'place-b2-b3',
      caption: 'b2 takes bits 16 to 21 and b3 takes 22 and 23. Bits 24 to 31 are left unused.',
      narration: 'b two takes bits sixteen to twenty-one, b three takes twenty-two and twenty-three.',
      detail: 'Every field stayed inside the unit because 5 + 11 + 6 + 2 = 24 does not exceed 32.',
      trap: 'The unused bits at the top are still part of the object: sizeof counts the whole unit.'
    },
    {
      id: 'pack-4', start: 112.5, end: 120, scene: 'pack',
      visualAction: 'show-size',
      caption: 'Widths sum to 24 bits, which is three bytes, but sizeof is four: the unit is rounded up.',
      narration: 'The widths sum to twenty-four bits, which is three bytes, but the size is four.',
      detail: 'The page computes four bytes for this declaration, which is the size cppreference prints for it.',
      trap: 'Adding the widths and dividing by eight is the commonest wrong method, and it is wrong by a whole unit here.'
    },

    /* ---------------- scene 5: full ---------------- */
    {
      id: 'full-1', start: 120, end: 127.5, scene: 'full',
      visualAction: 'place-a20',
      caption: 'A twenty-bit field leaves twelve bits of the unit free.',
      narration: 'A twenty-bit field leaves twelve bits of the unit free.',
      detail: 'The field occupies bits 0 to 19, and bits 20 to 31 remain.',
      trap: 'Twelve free bits is not a promise that the next field fits; the next field needs twenty.'
    },
    {
      id: 'full-2', start: 127.5, end: 135, scene: 'full',
      visualAction: 'start-new-unit',
      caption: 'b needs twenty bits and only twelve remain, so b begins a new unit.',
      narration: 'The second field needs twenty bits and only twelve remain, so it begins a new unit.',
      detail: 'The twelve free bits are lost, and sizeof becomes eight bytes with twenty-four bits never used.',
      trap: 'The lost bits are the cost of not straddling; a compiler that straddles would use them and could be smaller.'
    },
    {
      id: 'full-3', start: 135, end: 142.5, scene: 'full',
      visualAction: 'place-a28',
      caption: 'A twenty-eight-bit field leaves four free bits, and an eight-bit field still does not fit.',
      narration: 'Twenty-eight bits leave four free, and an eight-bit field still does not fit.',
      detail: 'The fit test is width against remaining bits, not width against the unit size.',
      trap: 'An eight-bit field fits in a thirty-two-bit unit but not in the four bits that are left.'
    },
    {
      id: 'full-4', start: 142.5, end: 150, scene: 'full',
      visualAction: 'show-second-position',
      caption: 'So the second field starts at bit 32, not at bit 28. Straddling is implementation-defined.',
      narration: 'So the second field starts at bit thirty-two, not twenty-eight.',
      detail: 'This page models the non-straddling choice. A straddling implementation would place it at bits 28 to 35.',
      trap: 'Both layouts are legal, so a question asking which bits a field occupies must name the compiler.'
    },

    /* ---------------- scene 6: zero ---------------- */
    {
      id: 'zero-1', start: 150, end: 157.5, scene: 'zero',
      visualAction: 'show-first-unit',
      caption: 'Here b1 is followed by a colon and a zero. That is a zero-width field, and it takes no bits.',
      narration: 'Here b one is followed by a colon and a zero. That takes no bits at all.',
      detail: 'The declaration has no name, which is required: a zero width may not be given a name.',
      trap: 'A zero width is not an empty member that can be read; it is a layout instruction.'
    },
    {
      id: 'zero-2', start: 157.5, end: 165, scene: 'zero',
      visualAction: 'show-second-unit',
      caption: 'It ends the unit. b2 and b3 start in a new unit, so the struct is eight bytes.',
      narration: 'It ends the unit, so the next fields start in a new unit and the size doubles.',
      detail: 'Twenty-seven of the first unit\u2019s bits are never used, and that is exactly what the declaration asked for.',
      trap: 'The bits thrown away are not padding you can reach; they are simply not part of any field.'
    },
    {
      id: 'zero-3', start: 165, end: 172.5, scene: 'zero',
      visualAction: 'show-without-zero',
      caption: 'Delete the colon and the zero, change nothing else, and all three fields fit in one unit.',
      narration: 'Delete the colon and the zero, change nothing else, and all three fit in one unit.',
      detail: '5 + 6 + 15 = 26 bits, so one unit is enough and sizeof is four.',
      trap: 'The difference is one token, and it changes both the size and every field position after it.'
    },
    {
      id: 'zero-4', start: 172.5, end: 180, scene: 'zero',
      visualAction: 'compare',
      caption: 'Eight bytes against four, from one zero. That is the sharpest example of layout as a declaration.',
      narration: 'Eight bytes against four, from a single zero.',
      detail: 'Both sizes are computed by the page and both agree with the sizes cppreference prints for these declarations.',
      trap: 'Do not read the zero-width field as padding of width zero in the sense of the unnamed four-bit field.'
    },

    /* ---------------- scene 7: unnamed ---------------- */
    {
      id: 'unnamed-1', start: 180, end: 187.5, scene: 'unnamed',
      visualAction: 'place-a-and-pad',
      caption: 'An unnamed field of width four takes four bits of the unit and gives them to nobody.',
      narration: 'An unnamed field of width four takes four bits and gives them to nobody.',
      detail: 'It is written with a colon and a width but no name, so there is no member to read.',
      trap: 'This one keeps the unit going: it consumes bits rather than ending the unit.'
    },
    {
      id: 'unnamed-2', start: 187.5, end: 195, scene: 'unnamed',
      visualAction: 'place-b',
      caption: 'b follows it inside the same unit, at bits 8 and 9.',
      narration: 'b follows it inside the same unit, at bits eight and nine.',
      detail: 'Padding is placed, not skipped: the next field continues after it.',
      trap: 'Skipping the four bits instead of placing them would put b at bits 4 and 5.'
    },
    {
      id: 'unnamed-3', start: 195, end: 202.5, scene: 'unnamed',
      visualAction: 'place-zero-and-c',
      caption: 'The zero-width field after b is a different instruction: it ends the unit, so c starts a new one.',
      narration: 'The zero-width field after b is a different instruction: it ends the unit.',
      detail: 'Two units, so sizeof is eight bytes for a struct holding ten bits of named data.',
      trap: 'The two unnamed forms look similar and do opposite things to the unit.'
    },
    {
      id: 'unnamed-4', start: 202.5, end: 210, scene: 'unnamed',
      visualAction: 'explain-purpose',
      caption: 'Padding fields exist to place a field at a chosen bit, usually to match a format someone else defined.',
      narration: 'Padding fields exist to place a field at a chosen bit, usually to match an external format.',
      detail: 'The standard notes this purpose for the unnamed field: it is useful for externally imposed layouts.',
      trap: 'Padding bits are not zeroed, so a struct cannot be compared byte for byte after being filled.'
    },

    /* ---------------- scene 8: mixed ---------------- */
    {
      id: 'mixed-1', start: 210, end: 217.5, scene: 'mixed',
      visualAction: 'place-light-toast',
      caption: 'Two one-bit fields at bits 0 and 1, and then an ordinary int member.',
      narration: 'Two one-bit fields at bits zero and one, and then an ordinary int member.',
      detail: 'The int needs four-byte alignment, so the bit-field unit cannot continue through it.',
      trap: 'The thirty bits between the fields and the int are lost, not reused.'
    },
    {
      id: 'mixed-2', start: 217.5, end: 225, scene: 'mixed',
      visualAction: 'place-int',
      caption: 'The int starts at offset 4, which ends the unit above it.',
      narration: 'The int starts at offset four, which ends the unit above it.',
      detail: 'A non-bit-field member and an adjacent bit-field are in separate memory locations by definition.',
      trap: 'The unit is not shrunk to the two bits used; it occupies its full four bytes.'
    },
    {
      id: 'mixed-3', start: 225, end: 232.5, scene: 'mixed',
      visualAction: 'place-ac-clock',
      caption: 'Four more fields pack into a third unit: ac, four bits of padding, and clock.',
      narration: 'Four more fields pack into a third unit: ac, four bits of padding, and clock.',
      detail: 'Nine bits are used in that unit, and twenty-three are not.',
      trap: 'The padding here is placed, so clock lands at bit 8 of the unit, not at bit 4.'
    },
    {
      id: 'mixed-4', start: 232.5, end: 240, scene: 'mixed',
      visualAction: 'show-total',
      caption: 'The zero-width field forces a fourth unit for flag, so the whole struct is sixteen bytes.',
      narration: 'The zero-width field forces a fourth unit for flag, so the struct is sixteen bytes.',
      detail: 'Sixteen bytes for seven small values and one int; a reported run prints sixteen for this declaration.',
      trap: 'Without the zero-width field the last field would share unit three and the size would be twelve.'
    },

    /* ---------------- scene 9: range ---------------- */
    {
      id: 'range-1', start: 240, end: 247.5, scene: 'range',
      visualAction: 'show-eight-values',
      caption: 'Three bits hold eight patterns. Read as unsigned, they are 0 to 7.',
      narration: 'Three bits hold eight patterns. Read as unsigned, they are zero to seven.',
      detail: 'A width of w gives 2^w patterns, so the unsigned range is 0 to 2^w - 1.',
      trap: 'The width sets the range; the declared type sets how the patterns are read.'
    },
    {
      id: 'range-2', start: 247.5, end: 255, scene: 'range',
      visualAction: 'show-signed-reading',
      caption: 'Read as signed, the top bit is the sign, so the same eight patterns are 0 to 3 and then -4 to -1.',
      narration: 'Read as signed, the top bit is the sign, so the last four patterns are negative.',
      detail: 'A signed field of width w holds -2^(w-1) to 2^(w-1) - 1, which is -4 to 3 for three bits.',
      trap: 'Six and minus two are the same three bits; which one prints depends on the declared type.'
    },
    {
      id: 'range-3', start: 255, end: 262.5, scene: 'range',
      visualAction: 'show-wrap',
      caption: 'A store is reduced modulo eight: 9 becomes 1, and incrementing 7 gives 0.',
      narration: 'A store is reduced modulo eight, so nine becomes one and seven plus one becomes zero.',
      detail: 'For an unsigned field the value kept is v modulo 2^w, which the page computes and checks.',
      trap: 'This is wrapping, not undefined behaviour: an unsigned field is defined here, unlike signed overflow.'
    },
    {
      id: 'range-4', start: 262.5, end: 270, scene: 'range',
      visualAction: 'show-plain-int',
      caption: 'For a plain int field, whether it is signed or unsigned is implementation-defined.',
      narration: 'For a plain int field, whether it is signed or unsigned is implementation-defined.',
      detail: 'Note that int elsewhere means signed int; inside a bit-field declaration it does not.',
      trap: 'So a question that prints a plain int field of width 3 has no portable answer for 110.'
    },

    /* ---------------- scene 10: noaddress ---------------- */
    {
      id: 'noaddress-1', start: 270, end: 277.5, scene: 'noaddress',
      visualAction: 'show-address-of',
      caption: 'Taking the address of a field is a constraint violation: the operand of & may not be a bit-field.',
      narration: 'Taking the address of a field is a constraint violation.',
      detail: 'Clause 6.5.3.2 lists what the operand of & may be, and a bit-field is excluded.',
      trap: 'The compiler must diagnose it. This is not a warning that can be switched off.'
    },
    {
      id: 'noaddress-2', start: 277.5, end: 285, scene: 'noaddress',
      visualAction: 'show-sizeof',
      caption: 'sizeof of a field is not allowed either: sizeof takes an object or a type, and a field is neither.',
      narration: 'sizeof of a field is not allowed either.',
      detail: 'A bit-field has no type of its own in the sense sizeof needs, and no complete object.',
      trap: 'sizeof of the struct is fine and is the question actually asked; sizeof of the field is not.'
    },
    {
      id: 'noaddress-3', start: 285, end: 292.5, scene: 'noaddress',
      visualAction: 'show-array',
      caption: 'There are no arrays of bit-fields, and offsetof on one has no defined answer.',
      narration: 'There are no arrays of bit-fields, and offsetof on one has no defined answer.',
      detail: 'The standard states that there are no pointers to or arrays of bit-field objects.',
      trap: 'offsetof is defined in terms of the address of a member, which is exactly what a field lacks.'
    },
    {
      id: 'noaddress-4', start: 292.5, end: 300, scene: 'noaddress',
      visualAction: 'explain-reason',
      caption: 'All four fail for one reason: a field may start mid-byte, so no byte address designates it.',
      narration: 'All four fail for one reason: a field may start in the middle of a byte.',
      detail: 'So scanf cannot be given the address of a field; the value has to be copied into an object first.',
      trap: 'Copying the field out into an int and taking the address of that int is the working alternative.'
    },

    /* ---------------- scene 11: impl ---------------- */
    {
      id: 'impl-1', start: 300, end: 307.5, scene: 'impl',
      visualAction: 'list-open-items',
      caption: 'Six properties are left open: the order inside a unit, and whether a field may straddle it.',
      narration: 'Six properties are left open, starting with the order inside a unit.',
      detail: 'Clause 6.7.2.1 makes the allocation order and the straddling question implementation-defined.',
      trap: 'Two of the six are the ones almost every exam question turns on, and both are in this list.'
    },
    {
      id: 'impl-2', start: 307.5, end: 315, scene: 'impl',
      visualAction: 'list-signedness',
      caption: 'Also open: the signedness of a plain int field, and which other types are allowed at all.',
      narration: 'Also open: the signedness of a plain int field, and which other types are allowed.',
      detail: 'The standard also leaves the alignment of the unit unspecified and atomic bit-fields optional.',
      trap: 'Writing signed int or unsigned int removes the signedness question, which is why it is worth doing.'
    },
    {
      id: 'impl-3', start: 315, end: 322.5, scene: 'impl',
      visualAction: 'show-question-rule',
      caption: 'So a question that asks for sizeof, or for the bits a field occupies, must name the platform.',
      narration: 'So a question that asks for a size or for bit positions must name the platform.',
      detail: 'Without that, the question has more than one defensible answer and cannot be marked.',
      trap: 'A question that does name the compiler is asking you to apply that compiler\u2019s rule, not the standard.'
    },
    {
      id: 'impl-4', start: 322.5, end: 330, scene: 'impl',
      visualAction: 'show-fixed-rules',
      caption: 'What is fixed: a following field packs in if it fits, and the width sets the range.',
      narration: 'What is fixed: a following field packs in if it fits, and the width sets the range.',
      detail: 'Those two are the parts a question can rely on without naming a compiler.',
      trap: 'Everything this page computes assumes the open items resolved the GCC-on-x86-64 way.'
    },

    /* ---------------- scene 12: procedure ---------------- */
    {
      id: 'procedure-1', start: 330, end: 337.5, scene: 'procedure',
      visualAction: 'step-1-2',
      caption: 'Step one: find the colon. Step two: read the declared type, which fixes the unit and the range.',
      narration: 'Step one: find the colon. Step two: read the declared type.',
      detail: 'A member without a colon is an ordinary member and takes its whole type, aligned normally.',
      trap: 'A member with a colon after a cast is not a bit-field; only the declaration form counts.'
    },
    {
      id: 'procedure-2', start: 337.5, end: 345, scene: 'procedure',
      visualAction: 'step-3-4',
      caption: 'Step three: pack in order, and start a new unit when a field does not fit. Step four: handle the unnamed forms.',
      narration: 'Step three: pack in order. Step four: handle the two unnamed forms.',
      detail: 'A zero width ends the unit; a nonzero unnamed width only consumes bits inside it.',
      trap: 'Treating the two unnamed forms as the same is the error that costs a whole unit.'
    },
    {
      id: 'procedure-3', start: 345, end: 352.5, scene: 'procedure',
      visualAction: 'step-5',
      caption: 'Step five: round the total up to the unit size, then to the alignment of the whole struct.',
      narration: 'Step five: round the total up to the unit size, then to the struct alignment.',
      detail: 'The size is always a whole number of units, which the page checks for every declaration it draws.',
      trap: 'Rounding to a byte instead of to the unit is what produces three where the answer is four.'
    },
    {
      id: 'procedure-4', start: 352.5, end: 360, scene: 'procedure',
      visualAction: 'worked-line',
      caption: 'Two worked lines: 5 + 6 + 15 fits one unit, and the same fields with a zero-width field need two.',
      narration: 'Two worked lines: the first fits one unit, and the second needs two.',
      detail: 'This procedure is a reading checklist for exam questions. It is not a proof of the standard\u2019s rules.',
      trap: 'Check one line by hand: 26 bits is four bytes only because the unit is four bytes, not because 26 rounds to 4.'
    }
  ]
};
