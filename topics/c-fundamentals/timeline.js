/* ==========================================================================
   c-fundamentals — THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs — never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'types',
      n: 1,
      title: 'A type is a promise about width',
      start: 0, end: 28,
      objective: 'Separate what the C standard guarantees about a type from what this machine happens to do.'
    },
    {
      id: 'literals',
      n: 2,
      title: 'Every literal already has a type',
      start: 28, end: 56,
      objective: 'Read the type of 42, 42u, 3.0, 3.0f, \'a\' and "a" from the way each is written.'
    },
    {
      id: 'promotion',
      n: 3,
      title: 'Integer promotion lifts small types to int',
      start: 56, end: 86,
      objective: 'See char arithmetic happen in int, with sign extension, and why the answer can leave the char range.'
    },
    {
      id: 'conversion',
      n: 4,
      title: 'Usual arithmetic conversions, and the signedness trap',
      start: 86, end: 118,
      objective: 'Apply the conversion ladder and explain why -1 < 1u is false.'
    },
    {
      id: 'wrap',
      n: 5,
      title: 'Unsigned wraps by definition; signed overflow does not',
      start: 118, end: 146,
      objective: 'Distinguish modulo arithmetic, which the standard defines, from signed overflow, which it does not.'
    },
    {
      id: 'divmod',
      n: 6,
      title: 'Division truncates; remainder follows the dividend',
      start: 146, end: 174,
      objective: 'Derive -7/2 and -7%2 from the identity (a/b)*b + a%b == a.'
    },
    {
      id: 'precedence',
      n: 7,
      title: 'Precedence and associativity decide the grouping',
      start: 174, end: 202,
      objective: 'Group an unparenthesised expression by the table, not by reading left to right.'
    },
    {
      id: 'shortcircuit',
      n: 8,
      title: '&& and || stop as soon as the answer is known',
      start: 202, end: 232,
      objective: 'Count which operands are evaluated, and see why the guarded index is safe.'
    },
    {
      id: 'loops',
      n: 9,
      title: 'Three loops, and the one that never ends',
      start: 232, end: 264,
      objective: 'Count iterations for while, for and do-while, then spot the unsigned countdown that cannot terminate.'
    },
    {
      id: 'switch',
      n: 10,
      title: 'switch falls through until a break',
      start: 264, end: 300,
      objective: 'Trace execution from the matching case label downwards, and see why a missing break changes the output.'
    }
  ],

  events: [

    /* ---- scene 1: types ---- */
    {
      id: 'types-1', start: 0, end: 7, scene: 'types',
      caption: 'A type is not a size. It is a promise about what the compiler will let you store.',
      detail: 'The C standard fixes the minimum range of each integer type and the rank order, and leaves the byte count to the implementation.',
      keyword: 'not a size',
      trap: 'Never write down a size as if C guaranteed it. Read the sizes the question states, or assume the usual 4-byte int.',
      narration: 'A type is not a size. It is a promise about what the compiler will let you store.'
    },
    {
      id: 'types-2', start: 7, end: 14, scene: 'types',
      caption: 'The standard guarantees char is one byte, and that the rank order char < short < int < long is respected.',
      detail: 'Only sizeof(char) is fixed at exactly 1. Everything else has a guaranteed minimum, not a guaranteed value.',
      keyword: 'one byte',
      trap: 'sizeof(int) is 4 on the machines GATE uses, but that is a platform fact, not a language rule.',
      narration: 'The standard guarantees char is one byte, and that the rank order char, short, int, long is respected.'
    },
    {
      id: 'types-3', start: 14, end: 21, scene: 'types',
      caption: 'The range follows from the width: an n-bit unsigned type runs 0 to 2^n - 1, and signed runs -2^(n-1) to 2^(n-1) - 1.',
      detail: 'Both formulas assume two\'s complement, which is what every machine GATE uses does. C23 makes it mandatory.',
      keyword: '2^n - 1',
      trap: 'A signed type of n bits holds one more negative value than positive. That asymmetry is what breaks -x at the minimum.',
      narration: 'The range follows from the width. An n-bit unsigned type runs from zero to two to the n minus one.'
    },
    {
      id: 'types-4', start: 21, end: 28, scene: 'types',
      caption: 'char is the awkward one: it is a distinct type, and whether it is signed is the implementation\'s choice.',
      detail: 'Plain char is neither signed char nor unsigned char; it is a third type with the same size and rank.',
      keyword: 'implementation\'s choice',
      trap: 'A program that compares a plain char against 200 behaves differently on a signed-char and an unsigned-char machine.',
      narration: 'char is the awkward one. It is a distinct type, and whether it is signed is the implementation choice.'
    },

    /* ---- scene 2: literals ---- */
    {
      id: 'literals-1', start: 28, end: 35, scene: 'literals',
      caption: 'A literal is not untyped. The way you write it decides the type before any operator sees it.',
      detail: 'The type of a constant is the first type in a fixed list that can represent its value, with the suffix and the base narrowing that list.',
      keyword: 'decides the type',
      trap: 'Integer promotion does not apply to a literal that is already int or wider.',
      narration: 'A literal is not untyped. The way you write it decides the type before any operator sees it.'
    },
    {
      id: 'literals-2', start: 35, end: 42, scene: 'literals',
      caption: '42 is int. Adding u makes it unsigned, adding L makes it long, and 42LL is long long.',
      detail: 'For decimal constants without a suffix the list is int, then long, then long long. Hex and octal start at int and may take unsigned forms.',
      keyword: '42 is int',
      trap: 'Write 1u, not 1, when you mean an unsigned value. The suffix is the only control you have over a literal.',
      narration: 'Forty two is an int. Adding u makes it unsigned, adding L makes it long.'
    },
    {
      id: 'literals-3', start: 42, end: 49, scene: 'literals',
      caption: '3.0 is a double even though it looks like an int, and 3.0f is the float. The default is double.',
      detail: 'So float f = 3.0; converts a double down to float, and 1/2 is int division while 1/2.0 is not.',
      keyword: 'double',
      trap: 'The classic trap is 1/2 == 0. One operand written as 2.0 turns the whole division into floating point.',
      narration: 'Three point zero is a double even though it looks like an int. Three point zero f is the float.'
    },
    {
      id: 'literals-4', start: 49, end: 56, scene: 'literals',
      caption: 'In C a character constant has type int, so sizeof(\'a\') is 4, not 1. The string "a" is a char array of length 2.',
      detail: 'Character constants are int in C (in C++ they are char). A string literal is a char array sized to include the terminating zero.',
      keyword: 'type int',
      trap: 'sizeof("a") is 2 because of the trailing null byte, and sizeof(\'a\') is sizeof(int). Both surprise people.',
      narration: 'In C a character constant has type int, so sizeof of a character constant is four, not one.'
    },

    /* ---- scene 3: promotion ---- */
    {
      id: 'promotion-1', start: 56, end: 63.5, scene: 'promotion',
      caption: 'char and short are narrower than int, so in arithmetic they are first converted to int.',
      detail: 'The rule is called integer promotion: a type of rank below int is lifted to int if int can hold every value of that type.',
      keyword: 'converted to int',
      trap: 'Promotion is not an assignment. It happens inside the expression, and the result has type int, not char.',
      narration: 'char and short are narrower than int, so in arithmetic they are first converted to int.'
    },
    {
      id: 'promotion-2', start: 63.5, end: 71, scene: 'promotion',
      caption: 'Lifting a signed char copies the sign bit upwards. Lifting an unsigned char pads with zeros.',
      detail: 'The value is preserved either way. A signed char holding -56 becomes the int -56; an unsigned char holding 200 becomes the int 200.',
      keyword: 'sign bit upwards',
      trap: 'The two paths differ only because the source type differed, not because the stored pattern differed.',
      narration: 'Lifting a signed char copies the sign bit upwards. Lifting an unsigned char pads with zeros.'
    },
    {
      id: 'promotion-3', start: 71, end: 78.5, scene: 'promotion',
      caption: 'So char c = 200 stores -56 on a signed-char machine, and c + 1 is the int -55.',
      detail: '200 does not fit in a signed 8-bit char, so the conversion is implementation-defined and wraps to -56 here.',
      keyword: 'c + 1 is the int -55',
      trap: 'The answer -55 is wider than a char. Assigning it back to a char would convert again.',
      narration: 'So a char holding two hundred actually stores minus fifty six, and adding one gives minus fifty five.'
    },
    {
      id: 'promotion-4', start: 78.5, end: 86, scene: 'promotion',
      caption: 'unsigned char u = 200 is exactly 200, and u + 1 is 201. Same pattern, different declared type.',
      detail: 'Both bytes are 11001000. The declared type decides how the byte is read, and therefore what the promotion produces.',
      keyword: 'same pattern',
      trap: 'A question that says "assume char is signed" or "assume char is unsigned" is telling you which column to use.',
      narration: 'An unsigned char holding two hundred is exactly two hundred, and adding one gives two hundred one.'
    },

    /* ---- scene 4: conversion ---- */
    {
      id: 'conversion-1', start: 86, end: 94, scene: 'conversion',
      caption: 'Two operands of different types are converted to one common type before the operator runs.',
      detail: 'The ladder is long double, then double, then float, then the integer rules. The result has that common type.',
      keyword: 'one common type',
      trap: 'The common type is the type of the result. 5/2 is int because both operands are int.',
      narration: 'Two operands of different types are converted to one common type before the operator runs.'
    },
    {
      id: 'conversion-2', start: 94, end: 102, scene: 'conversion',
      caption: 'For two integers the rule is short: promote both, then the wider type wins, and unsigned beats signed of equal rank.',
      detail: 'If the unsigned type has rank greater than or equal to the signed type, the signed operand becomes unsigned.',
      keyword: 'unsigned beats signed',
      trap: 'This single sentence explains almost every surprising comparison in a GATE C program.',
      narration: 'For two integers the rule is short. Promote both, then the wider type wins, and unsigned beats signed of equal rank.'
    },
    {
      id: 'conversion-3', start: 102, end: 110, scene: 'conversion',
      caption: 'So in -1 < 1u the -1 becomes 4294967295, and the comparison is false.',
      detail: 'The signed int -1 is converted to unsigned int, which adds 2^32 to bring it into range: 4294967295.',
      keyword: 'the comparison is false',
      trap: 'The comparison is well defined and the answer is not the mathematical one. Nothing here is undefined behaviour.',
      narration: 'So in minus one less than one u, the minus one becomes four billion two hundred ninety four million.'
    },
    {
      id: 'conversion-4', start: 110, end: 118, scene: 'conversion',
      caption: 'The same conversion is behind the warning on -1 < sizeof(int): sizeof has type size_t, which is unsigned.',
      detail: 'size_t is an unsigned integer type. Any comparison against sizeof converts the other side to it.',
      keyword: 'size_t',
      trap: 'Cast to int, or compare against 0u, when you really mean a signed test.',
      narration: 'The same conversion is behind the warning on comparing minus one with sizeof, because sizeof has an unsigned type.'
    },

    /* ---- scene 5: wrap ---- */
    {
      id: 'wrap-1', start: 118, end: 125, scene: 'wrap',
      caption: 'Unsigned arithmetic is defined to be modulo 2^n, where n is the number of value bits.',
      detail: 'Adding one to the largest unsigned value gives zero. Subtracting one from zero gives the largest value. Both are defined.',
      keyword: 'modulo 2^n',
      trap: 'This is arithmetic, not undefined behaviour. A wrap-around answer is a correct answer.',
      narration: 'Unsigned arithmetic is defined to be modulo two to the n, where n is the number of value bits.'
    },
    {
      id: 'wrap-2', start: 125, end: 132, scene: 'wrap',
      caption: 'So an unsigned char holding 250, plus 10, is 4. The odometer rolls past 255 and continues at 0.',
      detail: '260 mod 256 = 4. The intermediate value is computed in int, then converted back to unsigned char on assignment.',
      keyword: 'is 4',
      trap: 'The conversion back to the narrow type is the wrapping step, and it is fully defined for unsigned targets.',
      narration: 'So an unsigned char holding two hundred fifty, plus ten, is four. The odometer rolls past two fifty five.'
    },
    {
      id: 'wrap-3', start: 132, end: 139, scene: 'wrap',
      caption: 'Signed overflow is different: the standard says the behaviour is undefined, so there is no answer to give.',
      detail: 'INT_MAX + 1 is undefined. A compiler may wrap it, trap on it, or assume it never happens and delete your check.',
      keyword: 'undefined',
      trap: 'If a GATE question asks for the output of signed overflow, the honest answer is that it is undefined, not the wrapped value.',
      narration: 'Signed overflow is different. The standard says the behaviour is undefined, so there is no answer to give.'
    },
    {
      id: 'wrap-4', start: 139, end: 146, scene: 'wrap',
      caption: 'Keep the two apart: unsigned wrap is a rule you can compute with, signed overflow is a rule that does not exist.',
      detail: 'The same bit pattern can result, which is exactly why the distinction is easy to lose.',
      keyword: 'Keep the two apart',
      trap: 'Use unsigned when you want defined wraparound, for example in hashing and counters.',
      narration: 'Keep the two apart. Unsigned wrap is a rule you can compute with. Signed overflow is a rule that does not exist.'
    },

    /* ---- scene 6: divmod ---- */
    {
      id: 'divmod-1', start: 146, end: 153, scene: 'divmod',
      caption: 'Integer division throws the fraction away. Since C99 the direction is fixed: truncate towards zero.',
      detail: 'Before C99 the rounding direction was implementation-defined when an operand was negative. C99 and later truncate.',
      keyword: 'towards zero',
      trap: 'Truncation towards zero is not the same as the floor. They differ exactly when the true quotient is negative.',
      narration: 'Integer division throws the fraction away. Since C99 the direction is fixed: truncate towards zero.'
    },
    {
      id: 'divmod-2', start: 153, end: 160, scene: 'divmod',
      caption: 'So -7/2 is -3, not -4. Minus 3.5 moves towards zero, and floor would have moved away from it.',
      detail: 'The quotient is the algebraic quotient with the fractional part discarded.',
      keyword: '-3, not -4',
      trap: 'Python floors, C truncates. A habit from one language gives the wrong answer in the other.',
      narration: 'So minus seven over two is minus three, not minus four. Minus three point five moves towards zero.'
    },
    {
      id: 'divmod-3', start: 160, end: 167, scene: 'divmod',
      caption: 'The remainder is fixed by one identity: (a/b)*b + a%b equals a. That forces -7%2 to be -1.',
      detail: 'With a/b = -3 and b = 2, a%b must be -7 - (-6) = -1. The sign of the remainder follows the dividend.',
      keyword: 'equals a',
      trap: 'The remainder takes the sign of the dividend, not of the divisor. 7%-2 is 1.',
      narration: 'The remainder is fixed by one identity: the quotient times the divisor plus the remainder equals the dividend.'
    },
    {
      id: 'divmod-4', start: 167, end: 174, scene: 'divmod',
      caption: 'Two more facts: division by zero is undefined, and INT_MIN / -1 overflows, so it is undefined too.',
      detail: 'The quotient of the most negative value by -1 is not representable, which makes both / and % undefined there.',
      keyword: 'undefined too',
      trap: 'INT_MIN % -1 is not zero in the standard. It is undefined behaviour.',
      narration: 'Two more facts. Division by zero is undefined, and the most negative value divided by minus one overflows.'
    },

    /* ---- scene 7: precedence ---- */
    {
      id: 'precedence-1', start: 174, end: 181, scene: 'precedence',
      caption: 'Precedence decides which operator binds first. Associativity decides the order between equals.',
      detail: 'Both are properties of the grammar, not of the values. They are decided before anything is evaluated.',
      keyword: 'which operator binds first',
      trap: 'Precedence is not evaluation order. Which subexpression is computed first is a separate question.',
      narration: 'Precedence decides which operator binds first. Associativity decides the order between equals.'
    },
    {
      id: 'precedence-2', start: 181, end: 188, scene: 'precedence',
      caption: 'Unary, then multiplicative, then additive, then shift, then relational, then equality, then the bitwise three, then logical.',
      detail: 'The full ladder also puts postfix highest, then prefix, and assignment lowest with right associativity.',
      keyword: 'then multiplicative',
      trap: 'Bitwise AND, XOR and OR sit below equality, which is why a & b == c parses as a & (b == c).',
      narration: 'Unary, then multiplicative, then additive, then shift, then relational, then equality, then the bitwise three, then logical.'
    },
    {
      id: 'precedence-3', start: 188, end: 195, scene: 'precedence',
      caption: 'In 2 + 3 * 4 % 5 - 1 the multiplicative pair binds first, left to right: 3*4 is 12, then 12%5 is 2.',
      detail: 'Multiplication and remainder share a precedence level and group left to right, so 3*4%5 is (3*4)%5.',
      keyword: 'left to right',
      trap: 'Right associativity is rare: assignment, the conditional operator, and unary operators are the ones that use it.',
      narration: 'In this expression the multiplicative pair binds first, left to right. Three times four is twelve, then twelve mod five is two.'
    },
    {
      id: 'precedence-4', start: 195, end: 202, scene: 'precedence',
      caption: 'So the expression is 2 + 2 - 1, which is 3. Assignment is right associative, so a = b = 0 stores 0 in b first.',
      detail: 'a = b = 0 parses as a = (b = 0), and the value of the inner assignment is the value stored.',
      keyword: '3',
      trap: 'a = b = 0 is not the same shape as a = b == 0, which stores a boolean instead.',
      narration: 'So the expression is two plus two minus one, which is three. Assignment is right associative.'
    },

    /* ---- scene 8: shortcircuit ---- */
    {
      id: 'shortcircuit-1', start: 202, end: 209.5, scene: 'shortcircuit',
      caption: '&& evaluates its left operand, and stops if that operand is false. The right side is never touched.',
      detail: 'The result is an int: 0 or 1. The left operand is always evaluated; the right operand is conditional.',
      keyword: 'stops',
      trap: 'This is guaranteed by the standard, so a guarded access is genuinely safe, not accidentally safe.',
      narration: 'Logical and evaluates its left operand, and stops if that operand is false. The right side is never touched.'
    },
    {
      id: 'shortcircuit-2', start: 209.5, end: 217, scene: 'shortcircuit',
      caption: '|| is the mirror image: it stops when the left operand is true.',
      detail: 'So 1 || f() never calls f, and 0 && f() never calls f either.',
      keyword: 'mirror image',
      trap: 'Swapping && for & removes the short circuit and evaluates both sides. That is a different operator.',
      narration: 'Logical or is the mirror image. It stops when the left operand is true.'
    },
    {
      id: 'shortcircuit-3', start: 217, end: 224.5, scene: 'shortcircuit',
      caption: 'So if (i < n && a[i] == key) is safe: when i is out of range the array is never indexed.',
      detail: 'The left operand i < n is false, so the right operand, which contains the subscript, is not evaluated.',
      keyword: 'is safe',
      trap: 'Writing the tests in the other order reads a[i] before checking i. The order of the operands is the whole safety.',
      narration: 'So the guarded test is safe. When the index is out of range the array is never indexed.'
    },
    {
      id: 'shortcircuit-4', start: 224.5, end: 232, scene: 'shortcircuit',
      caption: 'Count the side effects, not the operands: in 0 && f() the call happens zero times.',
      detail: 'A function call inside the right operand of a short-circuited && is simply not evaluated, so its side effects do not occur.',
      keyword: 'zero times',
      trap: 'This is how a question hides a counter that does not increment, or a printf that does not print.',
      narration: 'Count the side effects, not the operands. In zero and f, the call happens zero times.'
    },

    /* ---- scene 9: loops ---- */
    {
      id: 'loops-1', start: 232, end: 240, scene: 'loops',
      caption: 'while tests first, for is a while with the bookkeeping moved into the header, and do-while tests last.',
      detail: 'The only structural difference that changes an answer is where the test sits: do-while always runs its body at least once.',
      keyword: 'do-while tests last',
      trap: 'for(;;) and while(1) are both infinite by construction, not by accident.',
      narration: 'while tests first. for is a while with the bookkeeping moved into the header. do-while tests last.'
    },
    {
      id: 'loops-2', start: 240, end: 248, scene: 'loops',
      caption: 'for (i = 0; i < n; i++) runs exactly n times when n is positive, and zero times when n is zero.',
      detail: 'Count the values of i for which the test is true: 0 up to n-1 is n values.',
      keyword: 'exactly n times',
      trap: 'i <= n runs n+1 times. Read the comparison symbol, not the shape of the loop.',
      narration: 'A for loop counting from zero while less than n runs exactly n times.'
    },
    {
      id: 'loops-3', start: 248, end: 256, scene: 'loops',
      caption: 'Now the trap: for (i = n; i >= 0; i--) with i declared unsigned never terminates.',
      detail: 'An unsigned value is never negative, so i >= 0 is always true, and the step past zero wraps to the largest value.',
      keyword: 'never terminates',
      trap: 'This exact loop is a standard GATE trap. The compiler may warn, and the program still hangs.',
      narration: 'Now the trap. Counting down to zero with an unsigned counter never terminates.'
    },
    {
      id: 'loops-4', start: 256, end: 264, scene: 'loops',
      caption: 'break leaves the loop at once; continue jumps to the next test, skipping the rest of the body.',
      detail: 'In a for loop, continue still performs the increment. In a while loop it does not, which is how infinite loops are written by mistake.',
      keyword: 'continue',
      trap: 'A continue that skips the increment in a while loop produces an infinite loop with no undefined behaviour at all.',
      narration: 'break leaves the loop at once. continue jumps to the next test, skipping the rest of the body.'
    },

    /* ---- scene 10: switch ---- */
    {
      id: 'switch-1', start: 264, end: 273, scene: 'switch',
      caption: 'switch evaluates its expression once, then jumps to the matching case label.',
      detail: 'The controlling expression must have integer type, and every case label must be an integer constant expression.',
      keyword: 'jumps to the matching case',
      trap: 'A case label cannot be a variable, and two labels cannot share a value.',
      narration: 'switch evaluates its expression once, then jumps to the matching case label.'
    },
    {
      id: 'switch-2', start: 273, end: 282, scene: 'switch',
      caption: 'From that label execution runs straight on into the following cases. That is fall-through, and it is the default.',
      detail: 'case labels are jump targets, not blocks. Nothing stops execution at the end of a case.',
      keyword: 'fall-through',
      trap: 'Missing break is not a syntax error. It silently changes the output.',
      narration: 'From that label execution runs straight on into the following cases. That is fall-through, and it is the default.'
    },
    {
      id: 'switch-3', start: 282, end: 291, scene: 'switch',
      caption: 'With x = 1, case 1 increments a, falls into case 2 and increments b, then break stops it. c is untouched.',
      detail: 'The trace visits every statement between the matched label and the first break, or the end of the switch.',
      keyword: 'then break stops it',
      trap: 'The answer is often the sum of two counters, which is what makes the question discriminating.',
      narration: 'With x equal to one, case one increments a, falls into case two and increments b, then break stops it.'
    },
    {
      id: 'switch-4', start: 291, end: 300, scene: 'switch',
      caption: 'A default label is optional, and it is only used when no case matches. A missing match with no default does nothing.',
      detail: 'default may also sit in the middle, where it falls through like any other label. Its position does not matter, only whether it is reached.',
      keyword: 'no case matches',
      trap: 'default in the middle still falls through. Position is not what makes it run last.',
      narration: 'A default label is optional, and it is only used when no case matches.'
    }
  ]
};
