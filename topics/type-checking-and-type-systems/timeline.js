/* ==========================================================================
   type-checking-and-type-systems — THE timeline.
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
      id: 'position', n: 1,
      title: 'Where the type checker sits, and what it is asked',
      start: 0, end: 30,
      objective: 'Place the type checker after parsing and before intermediate code, and settle the phase question that GATE has asked twice, in 1998 and in 2018.'
    },
    {
      id: 'typeexpr', n: 2,
      title: 'Type expressions: a small tree that describes values, not syntax',
      start: 30, end: 60,
      objective: 'Build the type expression for an array, a pointer, a record and a function, count their nodes, and separate the type expression from the syntax tree it is computed from.'
    },
    {
      id: 'structural', n: 3,
      title: 'Structural equivalence: same shape, recursively',
      start: 60, end: 90,
      objective: 'Decide type equality by walking two type graphs together, see that the record tag is not part of the comparison but the field name is, and handle a recursive type without looping.'
    },
    {
      id: 'name', n: 4,
      title: 'Name equivalence, the typedef rule, and what C actually does',
      start: 90, end: 120,
      objective: 'Partition the same nine declarations by structure and by name, count the two classes, and state the rule C really uses: structural everywhere except struct and union.'
    },
    {
      id: 'staticdynamic', n: 5,
      title: 'Static against dynamic, strong against weak: two questions, four boxes',
      start: 120, end: 150,
      objective: 'Separate when a type is checked from whether every type error is caught, and show why "strongly typed" needs the definition a question supplies.'
    },
    {
      id: 'rules', n: 6,
      title: 'A type system is a set of rules, and a program is a derivation',
      start: 150, end: 180,
      objective: 'Read a typing rule as premises over a conclusion, apply the rules for addition, assignment and if, and identify the error as the node where no rule fires.'
    },
    {
      id: 'coercion', n: 7,
      title: 'Compatibility, coercion, cast and overload resolution',
      start: 180, end: 210,
      objective: 'Count the assignable pairs under strict and under coercing rules, place coercion and cast on the right side of the compiler-versus-programmer line, and resolve an overloaded call.'
    },
    {
      id: 'checker', n: 8,
      title: 'A simple type checker: one attribute, and a poison type',
      start: 210, end: 240,
      objective: 'Run a syntax-directed checker over one expression tree, watch the error type propagate, and count the messages with and without the poison.'
    },
    {
      id: 'statements', n: 9,
      title: 'Statements and declarations: the rules that are not about expressions',
      start: 240, end: 270,
      objective: 'Check declare-before-use, argument count, parameter types and return types, and place the two GATE questions that test an SDD or an SDT for declarations.'
    },
    {
      id: 'procedure', n: 10,
      title: 'Sound but incomplete, and the four-step procedure',
      start: 270, end: 300,
      objective: 'Exhibit one program the checker accepts that fails at run time and one it rejects that would have run, then reduce the topic to four steps and three distinctions.'
    }
  ],

  events: [
    /* ---------- scene 1: position ---------- */
    { id: 's1-1', scene: 'position', start: 0, end: 7.5,
      caption: 'A type checker asks one question at every operation: are these values of a kind this operation accepts?',
      detail: 'Type checking is the activity of ensuring that the operands of an operator are of compatible types, where a compatible type is one that is either legal for the operator or allowed by the language to be converted to a legal type. The definition is standard and appears in this wording in compiler-course material.',
      narration: 'A type checker asks one question at every operation. Are these values of a kind this operation accepts?',
      keyword: 'are these values of a kind this operation accepts',
      trap: 'A type error is not a syntax error. The parser can accept x = 1 + "two" as a perfectly well-formed assignment; only the type checker objects.' },

    { id: 's1-2', scene: 'position', start: 7.5, end: 15,
      caption: 'It runs after parsing and before intermediate code: it needs the syntax tree, and it hands on an annotated tree.',
      detail: 'The checker consumes the parse tree or abstract syntax tree that the parser produced, and produces a tree whose expression nodes carry types. Intermediate code generation then reads those types to choose operations and widths. This ordering is what makes the phase question answerable at all: there is nothing to check before the tree exists.',
      narration: 'It runs after parsing and before intermediate code. It needs the syntax tree, and it hands on an annotated tree.',
      keyword: 'after parsing and before intermediate code' },

    { id: 's1-3', scene: 'position', start: 15, end: 22.5,
      caption: 'GATE CSE 2018 asked which statement was false. "Type checking is done before parsing" was the false one.',
      detail: 'The question offered four statements and one of them was that type checking is done before parsing. The official answer key marks that statement as the false one, because type checking belongs to semantic analysis, which follows syntax analysis.',
      narration: 'GATE C S E 2018 asked which statement was false. Type checking is done before parsing was the false one.',
      keyword: 'the false one' },

    { id: 's1-4', scene: 'position', start: 22.5, end: 30,
      caption: 'GATE CSE 1998 asked when type checking is normally done. The answer is during semantic analysis.',
      detail: 'The 1998 item is a one-line phase question with the same content as the 2018 option: the type checker is part of semantic analysis. Twenty years apart, the same fact, which is a good reason to know it cold rather than to guess.',
      narration: 'GATE C S E 1998 asked when type checking is normally done. The answer is during semantic analysis.',
      keyword: 'during semantic analysis' },

    /* ---------- scene 2: typeexpr ---------- */
    { id: 's2-1', scene: 'typeexpr', start: 30, end: 37.5,
      caption: 'A type expression is a small tree: a base type, or a constructor applied to type expressions.',
      detail: 'Base types are the atomic ones the language provides. Type constructors build larger expressions: array of a size and a type, pointer to a type, product of named field types, and function from a product of parameter types to a result type. Every type expression is therefore finite, and its size is the number of nodes.',
      narration: 'A type expression is a small tree. A base type, or a constructor applied to type expressions.',
      keyword: 'a constructor applied to type expressions' },

    { id: 's2-2', scene: 'typeexpr', start: 37.5, end: 45,
      caption: 'array(10, int) says ten elements, each an int. pointer(char) says a pointer to a char.',
      detail: 'The size is part of the array type expression, so array(10, int) and array(20, int) are different types even though both are arrays of int. This is why an array length written into the type matters for equivalence: it is one of the two components the comparison must check.',
      narration: 'array of ten and int says ten elements, each an int. Pointer to char says a pointer to a char.',
      keyword: 'ten elements',
      trap: 'Two arrays that differ only in length are different types under both equivalence schemes. A question that treats them as the same type is treating the length as a run-time property, which it is not in this type system.' },

    { id: 's2-3', scene: 'typeexpr', start: 45, end: 52.5,
      caption: 'A function type maps a product of parameter types to a result: (int x float) to bool.',
      detail: 'The arrow is the constructor; the left side is a product, not a set, because argument order and repetition both matter. Two functions with the same parameters in a different order have different types, and so do two with the same parameter multiset and different result types.',
      narration: 'A function type maps a product of parameter types to a result. Int times float, to bool.',
      keyword: 'product of parameter types' },

    { id: 's2-4', scene: 'typeexpr', start: 52.5, end: 60,
      caption: 'A type expression is not a syntax tree. The tree says how the program is written; the type says what the values may be.',
      detail: 'The syntax tree of 2 + 3 has a plus node with two literal children. The type of that expression is int, a single node. Confusing the two is the most common structural mistake in this topic, and it is why a checker keeps a separate type representation rather than reusing the syntax tree.',
      narration: 'A type expression is not a syntax tree. The tree says how the program is written. The type says what the values may be.',
      keyword: 'not a syntax tree' },

    /* ---------- scene 3: structural ---------- */
    { id: 's3-1', scene: 'structural', start: 60, end: 67.5,
      caption: 'Structural equivalence: same constructor, and recursively equivalent components.',
      detail: 'The test is a recursion over the two expressions at once. Two base types are equivalent when they are the same base type. Two constructed types are equivalent when the constructors agree, any size or arity agrees, and every pair of corresponding components is equivalent.',
      narration: 'Structural equivalence. Same constructor, and recursively equivalent components.',
      keyword: 'recursively equivalent components' },

    { id: 's3-2', scene: 'structural', start: 67.5, end: 75,
      caption: 'The record tag is not part of the comparison, so point and vec with the same fields are one type.',
      detail: 'A record type expression is a product of field name and field type. The name of the record itself does not appear in that product, so two differently named records with identical fields are structurally equivalent. That is exactly the freedom name equivalence removes.',
      narration: 'The record tag is not part of the comparison, so point and vec with the same fields are one type.',
      keyword: 'not part of the comparison' },

    { id: 's3-3', scene: 'structural', start: 75, end: 82.5,
      caption: 'The field name is part of the comparison, because the product carries name and type for each field.',
      detail: 'Renaming x to u changes the type expression, so the two records stop being structurally equivalent. This is a genuine design choice rather than a universal law: a language could compare records by field types alone and ignore the labels. The lesson uses the standard product-with-labels form and says so.',
      narration: 'The field name is part of the comparison, because the product carries name and type for each field.',
      keyword: 'field name is part of the comparison',
      trap: 'A record compared by field types alone is a different equivalence relation from the one used here. Read which form a question assumes before answering.' },

    { id: 's3-4', scene: 'structural', start: 82.5, end: 90,
      caption: 'A recursive type makes the comparison a graph walk, so visited pairs are marked to stop it looping.',
      detail: 'A node type that contains a pointer to itself has a type graph with a cycle. A naive recursion never terminates on it. The standard repair is to keep the set of pairs already under comparison and treat a repeated pair as provisionally equal, which is the coinductive reading. The page implements that and checks it on a cyclic type.',
      narration: 'A recursive type makes the comparison a graph walk, so visited pairs are marked to stop it looping.',
      keyword: 'visited pairs are marked' },

    /* ---------- scene 4: name ---------- */
    { id: 's4-1', scene: 'name', start: 90, end: 97.5,
      caption: 'Name equivalence: two types are equal only if they carry the same name.',
      detail: 'Under name equivalence a named type is treated as an atom. Two declarations that spell the same structure are still different types if their names differ. The test becomes cheap, because it is an identity test on the name, but it is also more restrictive.',
      narration: 'Name equivalence. Two types are equal only if they carry the same name.',
      keyword: 'carry the same name' },

    { id: 's4-2', scene: 'name', start: 97.5, end: 105,
      caption: 'On the same nine declarations, structure gives five classes and name gives seven, and the page counts both.',
      detail: 'The two schemes agree on thirty-four of the thirty-six ordered pairs and differ on two: the pair of records with identical fields and different tags, and the pair of pointers to those records. Name equivalence always refines structural equivalence, never the other way round, and the page checks that containment.',
      narration: 'On the same nine declarations, structure gives five classes and name gives seven, and the page counts both.',
      keyword: 'five classes and name gives seven' },

    { id: 's4-3', scene: 'name', start: 105, end: 112.5,
      caption: 'A typedef is not a new type. It is another name for an existing one, under both schemes.',
      detail: 'This is the one place where the two schemes agree for a reason worth remembering: a type synonym introduces a spelling, not a type. So Meters and Seconds, both synonyms for int, are the same type even under name equivalence, which is why the name partition has seven classes rather than nine.',
      narration: 'A typedef is not a new type. It is another name for an existing one, under both schemes.',
      keyword: 'not a new type',
      trap: 'Counting every declared name as a distinct type is the classic miscount. A synonym declaration adds no type; a record, union or class declaration does.' },

    { id: 's4-4', scene: 'name', start: 112.5, end: 120,
      caption: 'C uses structural equivalence except for struct and union, where the tag is the identity.',
      detail: 'Two struct declarations with identical members and different tags are different types in C, while two pointer or array types built from the same components are the same type. Several compiler-course notes state exactly this split for C, and it is the reason a question can be about C specifically rather than about equivalence in the abstract.',
      narration: 'C uses structural equivalence except for struct and union, where the tag is the identity.',
      keyword: 'except for struct and union' },

    /* ---------- scene 5: staticdynamic ---------- */
    { id: 's5-1', scene: 'staticdynamic', start: 120, end: 127.5,
      caption: 'Static checking happens before execution; dynamic checking happens during execution, using a tag.',
      detail: 'In a statically checked language the type of an expression is fixed at compile time and stored in the tree. In a dynamically checked one the type travels with the value at run time, which needs a tag on the object and a check before each operation.',
      narration: 'Static checking happens before execution. Dynamic checking happens during execution, using a tag.',
      keyword: 'before execution' },

    { id: 's5-2', scene: 'staticdynamic', start: 127.5, end: 135,
      caption: 'Strong typing is a different question: it asks whether type errors are always caught.',
      detail: 'The standard definition of a strongly typed language is that no application of an operator to arguments can lead to a run-time type error. That is a statement about the guarantee, not about the moment of checking. A language can be statically checked and still weak, if some holes let a wrong type through.',
      narration: 'Strong typing is a different question. It asks whether type errors are always caught.',
      keyword: 'whether type errors are always caught' },

    { id: 's5-3', scene: 'staticdynamic', start: 135, end: 142.5,
      caption: 'Two questions give four boxes: Java static and strong, C static and weak, Python dynamic and strong.',
      detail: 'C is statically checked but not strongly typed, because a union or an unchecked cast lets a value of one type be read as another. Python checks at run time and still catches the misuse, so it is dynamic and strong. Assembly, with no types at all, sits outside the grid rather than in a corner of it.',
      narration: 'Two questions give four boxes. Java static and strong, C static and weak, Python dynamic and strong.',
      keyword: 'four boxes',
      trap: 'Treating static as a synonym for strong is the misconception. The two words answer different questions, and a question that offers them as one property is testing exactly this.' },

    { id: 's5-4', scene: 'staticdynamic', start: 142.5, end: 150,
      caption: 'The definition of strong varies by author, so read the definition a question gives you.',
      detail: 'Some texts call a language strongly typed when all type bindings are static; others use the no-run-time-type-error definition. Both usages are in print. When a question supplies a definition, that definition decides the answer; when it supplies none, the guarantee reading is the one most course notes use, and saying which reading you used is part of a complete answer.',
      narration: 'The definition of strong varies by author, so read the definition a question gives you.',
      keyword: 'read the definition' },

    /* ---------- scene 6: rules ---------- */
    { id: 's6-1', scene: 'rules', start: 150, end: 157.5,
      caption: 'A type system is a set of rules of the form: if these premises hold, this expression has this type.',
      detail: 'A rule is written with its premises above a line and its conclusion below. The conclusion is a judgment that an expression has a type in an environment. The environment maps each identifier in scope to its type, so the same expression can have different types in different environments.',
      narration: 'A type system is a set of rules of the form, if these premises hold, this expression has this type.',
      keyword: 'if these premises hold' },

    { id: 's6-2', scene: 'rules', start: 157.5, end: 165,
      caption: 'The rule for addition: both operands numeric, and the result is the wider of the two.',
      detail: 'The premise is that each operand has a numeric type. The conclusion is that the sum has the wider of the two types, where wider follows the language widening order. If either premise fails there is no conclusion, and the node is a type error rather than an expression of some default type.',
      narration: 'The rule for addition. Both operands numeric, and the result is the wider of the two.',
      keyword: 'the wider of the two' },

    { id: 's6-3', scene: 'rules', start: 165, end: 172.5,
      caption: 'The rule for if: the condition must be bool, and both branches must have compatible types.',
      detail: 'Two premises, and each is separately failable. A numeric condition fails the first even when the branches agree. Two branches that differ but are coercible to a common wider type satisfy the second through the compatibility relation rather than through equality, which is why the compatibility relation has to be defined before the rule can be written.',
      narration: 'The rule for if. The condition must be bool, and both branches must have compatible types.',
      keyword: 'condition must be bool' },

    { id: 's6-4', scene: 'rules', start: 172.5, end: 180,
      caption: 'A program is well typed when every node has a rule that fires. The node with no firing rule is the error.',
      detail: 'This is the operational meaning of a derivation: start at the leaves, apply one rule per node, and the program is accepted when the root receives a type. Rejection is not a special mechanism; it is the absence of a rule whose premises are satisfied at some node, reported at that node.',
      narration: 'A program is well typed when every node has a rule that fires. The node with no firing rule is the error.',
      keyword: 'no rule that fires' },

    /* ---------- scene 7: coercion ---------- */
    { id: 's7-1', scene: 'coercion', start: 180, end: 187.5,
      caption: 'Compatibility is not equality: identical, assignable and coercible are three different relations.',
      detail: 'Equality is symmetric. Assignability is not: a value of a narrower type fits a wider variable and not the reverse. Coercibility is about whether the compiler may insert the conversion silently. A question that says "compatible" is asking which of the three it means, and the safe move is to state the reading.',
      narration: 'Compatibility is not equality. Identical, assignable and coercible are three different relations.',
      keyword: 'three different relations' },

    { id: 's7-2', scene: 'coercion', start: 187.5, end: 195,
      caption: 'Coercion is a conversion the compiler inserts; a cast is one the programmer writes.',
      detail: 'A coercion appears only where the language rules allow the widening, and it is invisible in the source. A cast is written, is the programmer taking responsibility, and can narrow. That is why a cast is the standard escape hatch that makes a statically checked language not strongly typed.',
      narration: 'Coercion is a conversion the compiler inserts. A cast is one the programmer writes.',
      keyword: 'the compiler inserts' },

    { id: 's7-3', scene: 'coercion', start: 195, end: 202.5,
      caption: 'On this three-type lattice, strict assignment allows three of nine pairs and coercing assignment allows four.',
      detail: 'The page enumerates all nine ordered pairs over int, float and bool. Under equality only the three diagonal pairs are legal. Allowing widening adds int to float and nothing else, because bool is not numeric and float to int is a narrowing. Both counts are computed rather than quoted.',
      narration: 'On this three type lattice, strict assignment allows three of nine pairs and coercing assignment allows four.',
      keyword: 'three of nine pairs',
      trap: 'Counting float to int as a coercion is the error. It is a narrowing, so it needs a cast; a rule that permits it silently has stopped being a type check.' },

    { id: 's7-4', scene: 'coercion', start: 202.5, end: 210,
      caption: 'Overloading is resolved by applicability, then exactness. Two candidates that both need a widening is an ambiguity.',
      detail: 'A call is applicable to an overload when every argument is assignable to the corresponding parameter. Among applicable candidates, an exact match on every argument wins outright. If two candidates remain applicable and neither is exact, the call is ambiguous and the language must reject it rather than pick one.',
      narration: 'Overloading is resolved by applicability, then exactness. Two candidates that both need a widening is an ambiguity.',
      keyword: 'applicability, then exactness' },

    /* ---------- scene 8: checker ---------- */
    { id: 's8-1', scene: 'checker', start: 210, end: 217.5,
      caption: 'A simple type checker is a syntax-directed definition with one attribute, type, on every expression.',
      detail: 'One synthesized attribute is enough for expressions, because a node type is computed from its children. Declarations need an inherited attribute or a side effect on the symbol table, which is the seam between this topic and syntax-directed translation.',
      narration: 'A simple type checker is a syntax directed definition with one attribute, type, on every expression.',
      keyword: 'one attribute, type' },

    { id: 's8-2', scene: 'checker', start: 217.5, end: 225,
      caption: 'Leaves take their type from the symbol table; each operator node applies its rule to its children types.',
      detail: 'An identifier leaf looks its name up in the environment. A literal leaf has a type by construction. Every internal node reads the type attributes already computed for its children and writes its own, which is why a bottom-up order, and therefore an S-attributed definition, is sufficient for expressions.',
      narration: 'Leaves take their type from the symbol table. Each operator node applies its rule to its children types.',
      keyword: 'from the symbol table' },

    { id: 's8-3', scene: 'checker', start: 225, end: 232.5,
      caption: 'A failing rule sets the error type, and error poisons its parents, so one mistake gives one message.',
      detail: 'The error type is equivalent to every type. That is deliberate: once a subexpression has failed, its parent cannot meaningfully fail again, so the parent accepts error and passes it upward. The alternative is a cascade of messages that all point at the same one real mistake.',
      narration: 'A failing rule sets the error type, and error poisons its parents, so one mistake gives one message.',
      keyword: 'one mistake gives one message' },

    { id: 's8-4', scene: 'checker', start: 232.5, end: 240,
      caption: 'Without the poison the same six-node tree reports four messages instead of one.',
      detail: 'The page runs the checker twice on one expression, once with the error type matching everything and once with it matching nothing. The one real mistake sits at the lowest operator, and the four operators above it each fail in turn. Both counts are computed on the same tree.',
      narration: 'Without the poison the same six node tree reports four messages instead of one.',
      keyword: 'four messages instead of one' },

    /* ---------- scene 9: statements ---------- */
    { id: 's9-1', scene: 'statements', start: 240, end: 247.5,
      caption: 'Statements need their own rules: a condition must be boolean, and a loop body must be a statement.',
      detail: 'The expression rules say what a value is; the statement rules say what is well formed. A while header needs a boolean and a body that is a statement, and the type of a statement is not a value type but a separate judgment. Languages that use a truthy convention replace the first premise, not the rule.',
      narration: 'Statements need their own rules. A condition must be boolean, and a loop body must be a statement.',
      keyword: 'their own rules' },

    { id: 's9-2', scene: 'statements', start: 247.5, end: 255,
      caption: 'A name must be declared before use, and a call must match arity and parameter types.',
      detail: 'Both are semantic checks that no grammar can make. Declare-before-use is a lookup that fails; arity and parameter types are a comparison between the argument type list and the parameter type list. The compiler reports them in semantic analysis, not in lexical or syntax analysis.',
      narration: 'A name must be declared before use, and a call must match arity and parameter types.',
      keyword: 'declared before use' },

    { id: 's9-3', scene: 'statements', start: 255, end: 262.5,
      caption: 'GATE CSE 2021 Set 1 asked what one SDT could type-check: it handled the integer part and not the boolean part.',
      detail: 'The scheme recorded declarations and checked that both operands of plus were int. But the rule for an identifier set its type to int unconditionally, so a boolean variable used where a boolean was required could not be distinguished from an integer one. That is why the correct option is the one that names integer declarations and integer expressions only.',
      narration: 'GATE C S E 2021 Set 1 asked what one S D T could type check. It handled the integer part and not the boolean part.',
      keyword: 'not the boolean part' },

    { id: 's9-4', scene: 'statements', start: 262.5, end: 270,
      caption: 'GATE CSE 2026 Set 1 compared two SDDs for declarations: same language, same entries, one S-attributed.',
      detail: 'The first definition passes the type down the variable list as an inherited attribute, so it is L-attributed and uses both kinds of attribute. The second builds the list from the left and puts each entry as it goes, so every attribute is synthesized. Both add the same identifier and type pairs, and both generate the same language.',
      narration: 'GATE C S E 2026 Set 1 compared two S D Ds for declarations. Same language, same entries, one S attributed.',
      keyword: 'one S-attributed' },

    /* ---------- scene 10: procedure ---------- */
    { id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Static checking is sound but incomplete: it never lets a guaranteed failure through, and it rejects some programs that would run.',
      detail: 'The checker cannot decide a run-time index, so it accepts an out-of-bounds access that is written as a literal. It also rejects an unreachable branch whose type is wrong, although that branch never runs. Both witnesses are built and evaluated on the page rather than asserted.',
      narration: 'Static checking is sound but incomplete. It never lets a guaranteed failure through, and it rejects some programs that would run.',
      keyword: 'sound but incomplete',
      trap: 'Calling the checker wrong in either case is the mistake. Accepting a program that fails is incompleteness; rejecting one that would run is the price of deciding at compile time. Neither is a bug.' },

    { id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Step one: build the type expression for every declaration and store it with the name.',
      detail: 'A declaration is turned into a type expression once, and the symbol table holds that expression rather than its source text. Everything later compares expressions, so a badly built expression contaminates every check that reads it. This is why the type expression, not the syntax tree, is the data structure of the topic.',
      narration: 'Step one. Build the type expression for every declaration and store it with the name.',
      keyword: 'build the type expression' },

    { id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Step two: walk the tree bottom-up, applying one rule per node, with error as a type and not an exception.',
      detail: 'The walk is the derivation. A node whose premises fail receives the error type, which then matches everything, so the walk continues and the report names the lowest failing node. Stopping at the first failure with an exception would lose the chance to report the other independent errors.',
      narration: 'Step two. Walk the tree bottom up, applying one rule per node, with error as a type and not an exception.',
      keyword: 'error as a type' },

    { id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Step three reports the failing node and checks statements. Step four keeps equivalence and compatibility apart.',
      detail: 'The last step is the one that decides marks: equality asks whether two types are the same type, and compatibility asks whether a value of one may be used where the other is expected. A question about assignment is a compatibility question, and answering it with an equality test gives the wrong option half the time.',
      narration: 'Step three reports the failing node and checks statements. Step four keeps equivalence and compatibility apart.',
      keyword: 'equivalence and compatibility apart' }
  ]
};
