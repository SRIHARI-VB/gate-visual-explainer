# Type Checking And Type Systems — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/type-checking-and-type-systems/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Where the type checker sits, and what it is asked

*0:00 – 0:30 · objective: Place the type checker after parsing and before intermediate code, and settle the phase question that GATE has asked twice, in 1998 and in 2018.*

**0:00–0:07** — A type checker asks one question at every operation. Are these values of a kind this operation accepts?

> Caption: A type checker asks one question at every operation: are these values of a kind this operation accepts?

Exam-trap caption mode adds: *A type error is not a syntax error. The parser can accept x = 1 + "two" as a perfectly well-formed assignment; only the type checker objects.*

**0:07–0:15** — It runs after parsing and before intermediate code. It needs the syntax tree, and it hands on an annotated tree.

> Caption: It runs after parsing and before intermediate code: it needs the syntax tree, and it hands on an annotated tree.

**0:15–0:22** — GATE C S E 2018 asked which statement was false. Type checking is done before parsing was the false one.

> Caption: GATE CSE 2018 asked which statement was false. "Type checking is done before parsing" was the false one.

**0:22–0:30** — GATE C S E 1998 asked when type checking is normally done. The answer is during semantic analysis.

> Caption: GATE CSE 1998 asked when type checking is normally done. The answer is during semantic analysis.

## Scene 2. Type expressions: a small tree that describes values, not syntax

*0:30 – 1:00 · objective: Build the type expression for an array, a pointer, a record and a function, count their nodes, and separate the type expression from the syntax tree it is computed from.*

**0:30–0:37** — A type expression is a small tree. A base type, or a constructor applied to type expressions.

> Caption: A type expression is a small tree: a base type, or a constructor applied to type expressions.

**0:37–0:45** — array of ten and int says ten elements, each an int. Pointer to char says a pointer to a char.

> Caption: array(10, int) says ten elements, each an int. pointer(char) says a pointer to a char.

Exam-trap caption mode adds: *Two arrays that differ only in length are different types under both equivalence schemes. A question that treats them as the same type is treating the length as a run-time property, which it is not in this type system.*

**0:45–0:52** — A function type maps a product of parameter types to a result. Int times float, to bool.

> Caption: A function type maps a product of parameter types to a result: (int x float) to bool.

**0:52–1:00** — A type expression is not a syntax tree. The tree says how the program is written. The type says what the values may be.

> Caption: A type expression is not a syntax tree. The tree says how the program is written; the type says what the values may be.

## Scene 3. Structural equivalence: same shape, recursively

*1:00 – 1:30 · objective: Decide type equality by walking two type graphs together, see that the record tag is not part of the comparison but the field name is, and handle a recursive type without looping.*

**1:00–1:07** — Structural equivalence. Same constructor, and recursively equivalent components.

> Caption: Structural equivalence: same constructor, and recursively equivalent components.

**1:07–1:15** — The record tag is not part of the comparison, so point and vec with the same fields are one type.

> Caption: The record tag is not part of the comparison, so point and vec with the same fields are one type.

**1:15–1:22** — The field name is part of the comparison, because the product carries name and type for each field.

> Caption: The field name is part of the comparison, because the product carries name and type for each field.

Exam-trap caption mode adds: *A record compared by field types alone is a different equivalence relation from the one used here. Read which form a question assumes before answering.*

**1:22–1:30** — A recursive type makes the comparison a graph walk, so visited pairs are marked to stop it looping.

> Caption: A recursive type makes the comparison a graph walk, so visited pairs are marked to stop it looping.

## Scene 4. Name equivalence, the typedef rule, and what C actually does

*1:30 – 2:00 · objective: Partition the same nine declarations by structure and by name, count the two classes, and state the rule C really uses: structural everywhere except struct and union.*

**1:30–1:37** — Name equivalence. Two types are equal only if they carry the same name.

> Caption: Name equivalence: two types are equal only if they carry the same name.

**1:37–1:45** — On the same nine declarations, structure gives five classes and name gives seven, and the page counts both.

> Caption: On the same nine declarations, structure gives five classes and name gives seven, and the page counts both.

**1:45–1:52** — A typedef is not a new type. It is another name for an existing one, under both schemes.

> Caption: A typedef is not a new type. It is another name for an existing one, under both schemes.

Exam-trap caption mode adds: *Counting every declared name as a distinct type is the classic miscount. A synonym declaration adds no type; a record, union or class declaration does.*

**1:52–2:00** — C uses structural equivalence except for struct and union, where the tag is the identity.

> Caption: C uses structural equivalence except for struct and union, where the tag is the identity.

## Scene 5. Static against dynamic, strong against weak: two questions, four boxes

*2:00 – 2:30 · objective: Separate when a type is checked from whether every type error is caught, and show why "strongly typed" needs the definition a question supplies.*

**2:00–2:07** — Static checking happens before execution. Dynamic checking happens during execution, using a tag.

> Caption: Static checking happens before execution; dynamic checking happens during execution, using a tag.

**2:07–2:15** — Strong typing is a different question. It asks whether type errors are always caught.

> Caption: Strong typing is a different question: it asks whether type errors are always caught.

**2:15–2:22** — Two questions give four boxes. Java static and strong, C static and weak, Python dynamic and strong.

> Caption: Two questions give four boxes: Java static and strong, C static and weak, Python dynamic and strong.

Exam-trap caption mode adds: *Treating static as a synonym for strong is the misconception. The two words answer different questions, and a question that offers them as one property is testing exactly this.*

**2:22–2:30** — The definition of strong varies by author, so read the definition a question gives you.

> Caption: The definition of strong varies by author, so read the definition a question gives you.

## Scene 6. A type system is a set of rules, and a program is a derivation

*2:30 – 3:00 · objective: Read a typing rule as premises over a conclusion, apply the rules for addition, assignment and if, and identify the error as the node where no rule fires.*

**2:30–2:37** — A type system is a set of rules of the form, if these premises hold, this expression has this type.

> Caption: A type system is a set of rules of the form: if these premises hold, this expression has this type.

**2:37–2:45** — The rule for addition. Both operands numeric, and the result is the wider of the two.

> Caption: The rule for addition: both operands numeric, and the result is the wider of the two.

**2:45–2:52** — The rule for if. The condition must be bool, and both branches must have compatible types.

> Caption: The rule for if: the condition must be bool, and both branches must have compatible types.

**2:52–3:00** — A program is well typed when every node has a rule that fires. The node with no firing rule is the error.

> Caption: A program is well typed when every node has a rule that fires. The node with no firing rule is the error.

## Scene 7. Compatibility, coercion, cast and overload resolution

*3:00 – 3:30 · objective: Count the assignable pairs under strict and under coercing rules, place coercion and cast on the right side of the compiler-versus-programmer line, and resolve an overloaded call.*

**3:00–3:07** — Compatibility is not equality. Identical, assignable and coercible are three different relations.

> Caption: Compatibility is not equality: identical, assignable and coercible are three different relations.

**3:07–3:15** — Coercion is a conversion the compiler inserts. A cast is one the programmer writes.

> Caption: Coercion is a conversion the compiler inserts; a cast is one the programmer writes.

**3:15–3:22** — On this three type lattice, strict assignment allows three of nine pairs and coercing assignment allows four.

> Caption: On this three-type lattice, strict assignment allows three of nine pairs and coercing assignment allows four.

Exam-trap caption mode adds: *Counting float to int as a coercion is the error. It is a narrowing, so it needs a cast; a rule that permits it silently has stopped being a type check.*

**3:22–3:30** — Overloading is resolved by applicability, then exactness. Two candidates that both need a widening is an ambiguity.

> Caption: Overloading is resolved by applicability, then exactness. Two candidates that both need a widening is an ambiguity.

## Scene 8. A simple type checker: one attribute, and a poison type

*3:30 – 4:00 · objective: Run a syntax-directed checker over one expression tree, watch the error type propagate, and count the messages with and without the poison.*

**3:30–3:37** — A simple type checker is a syntax directed definition with one attribute, type, on every expression.

> Caption: A simple type checker is a syntax-directed definition with one attribute, type, on every expression.

**3:37–3:45** — Leaves take their type from the symbol table. Each operator node applies its rule to its children types.

> Caption: Leaves take their type from the symbol table; each operator node applies its rule to its children types.

**3:45–3:52** — A failing rule sets the error type, and error poisons its parents, so one mistake gives one message.

> Caption: A failing rule sets the error type, and error poisons its parents, so one mistake gives one message.

**3:52–4:00** — Without the poison the same six node tree reports four messages instead of one.

> Caption: Without the poison the same six-node tree reports four messages instead of one.

## Scene 9. Statements and declarations: the rules that are not about expressions

*4:00 – 4:30 · objective: Check declare-before-use, argument count, parameter types and return types, and place the two GATE questions that test an SDD or an SDT for declarations.*

**4:00–4:07** — Statements need their own rules. A condition must be boolean, and a loop body must be a statement.

> Caption: Statements need their own rules: a condition must be boolean, and a loop body must be a statement.

**4:07–4:15** — A name must be declared before use, and a call must match arity and parameter types.

> Caption: A name must be declared before use, and a call must match arity and parameter types.

**4:15–4:22** — GATE C S E 2021 Set 1 asked what one S D T could type check. It handled the integer part and not the boolean part.

> Caption: GATE CSE 2021 Set 1 asked what one SDT could type-check: it handled the integer part and not the boolean part.

**4:22–4:30** — GATE C S E 2026 Set 1 compared two S D Ds for declarations. Same language, same entries, one S attributed.

> Caption: GATE CSE 2026 Set 1 compared two SDDs for declarations: same language, same entries, one S-attributed.

## Scene 10. Sound but incomplete, and the four-step procedure

*4:30 – 5:00 · objective: Exhibit one program the checker accepts that fails at run time and one it rejects that would have run, then reduce the topic to four steps and three distinctions.*

**4:30–4:37** — Static checking is sound but incomplete. It never lets a guaranteed failure through, and it rejects some programs that would run.

> Caption: Static checking is sound but incomplete: it never lets a guaranteed failure through, and it rejects some programs that would run.

Exam-trap caption mode adds: *Calling the checker wrong in either case is the mistake. Accepting a program that fails is incompleteness; rejecting one that would run is the price of deciding at compile time. Neither is a bug.*

**4:37–4:45** — Step one. Build the type expression for every declaration and store it with the name.

> Caption: Step one: build the type expression for every declaration and store it with the name.

**4:45–4:52** — Step two. Walk the tree bottom up, applying one rule per node, with error as a type and not an exception.

> Caption: Step two: walk the tree bottom-up, applying one rule per node, with error as a type and not an exception.

**4:52–5:00** — Step three reports the failing node and checks statements. Step four keeps equivalence and compatibility apart.

> Caption: Step three reports the failing node and checks statements. Step four keeps equivalence and compatibility apart.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
