#!/usr/bin/env python3
"""Build syllabus-coverage.json for the GATE CSE 2027 syllabus.

The subject and topic list mirrors the verified GATE 2027 CS syllabus
(Section 1 Engineering Mathematics, Sections 2-10 core CS). Statuses are the
only thing that changes between runs; this script is re-run to regenerate the
tracker from the topic data below.
"""
import json

TODAY = "2026-10-26"

def topic(subject, unit, name, subtopics, prereq=None, related=None,
          importance="medium", evidence="", difficulty="medium",
          status="NOT_STARTED", slug=None, path=None, execution=None,
          microtopics=None):
    return {
        "subject": subject,
        "unit": unit,
        "topic": name,
        "subtopics": subtopics,
        "microtopics": microtopics or [],
        "prerequisites": prereq or [],
        "related_topics": related or [],
        "estimated_importance": importance,
        "importance_evidence": evidence,
        "learning_difficulty": difficulty,
        "coverage_status": status,
        "lesson_slug": slug,
        "repo_path": path,
        "last_verified_date": TODAY,
        "last_execution_status": execution,
    }

SYL = "Official GATE 2027 CS syllabus, IIT Madras (Section 1: Engineering Mathematics, Discrete Mathematics)"

DM = "Discrete Mathematics"
EM = "Engineering Mathematics"

topics = []

# ---------------------------------------------------------------- Discrete Mathematics
topics.append(topic(
    DM, "Logic", "Propositional logic",
    ["propositions and truth values", "the five connectives", "truth tables",
     "logical equivalence", "tautology, contradiction, contingency",
     "valid argument forms", "satisfiability"],
    prereq=["none"],
    related=["first-order logic", "boolean algebra (Digital Logic)", "sets"],
    importance="high",
    evidence="Named verbatim as the first item of Discrete Mathematics in the GATE 2027 syllabus. " + SYL,
    difficulty="easy-medium",
    status="PUBLISHED",
    slug="propositional-logic",
    path="topics/propositional-logic/index.html",
    execution="published 2026-10-25",
    microtopics=[
        "declarative vs open vs command sentences",
        "negation, conjunction, disjunction (inclusive)",
        "exclusive or and biconditional",
        "implication and its single false row",
        "vacuous truth",
        "converse, inverse, contrapositive",
        "precedence and right associativity of implication",
        "P implies Q is equivalent to not P or Q",
        "De Morgan's two laws",
        "distribution",
        "tautology / contradiction / contingency classification",
        "modus ponens and modus tollens",
        "affirming the consequent and denying the antecedent (invalid)",
        "validity as a tautology test",
        "row count 2^n and function count 2^(2^n)",
        "English phrasings: only if, unless, necessary, sufficient",
    ]))

topics.append(topic(
    DM, "Logic", "First-order logic",
    ["predicates and the domain of discourse", "universal and existential quantifiers",
     "nested quantifiers and order", "quantifier negation",
     "translating English into quantified formulas", "free and bound variables"],
    prereq=["propositional logic"],
    related=["propositional logic", "sets", "relations"],
    importance="high",
    evidence="Named verbatim alongside propositional logic in the GATE 2027 syllabus. " + SYL,
    difficulty="medium",
    status="PUBLISHED",
    slug="first-order-logic",
    path="topics/first-order-logic/index.html",
    execution="published 2026-10-26",
    microtopics=["predicate vs proposition; the domain as part of the meaning",
                 "for-all as a conjunction over the domain; vacuous truth on the empty domain",
                 "there-exists as a disjunction; the witness; exists is false on the empty domain",
                 "same formula, different domains, different truth value",
                 "not-for-all is exists-not; not-exists is for-all-not",
                 "nested quantifiers read off a relation grid (rows vs columns)",
                 "order of unlike quantifiers; for-all-there-exists vs there-exists-for-all",
                 "same-kind quantifiers commute; mixed ones do not",
                 "there-exists-for-all implies for-all-there-exists, never the reverse",
                 "distribution: for-all over conjunction, there-exists over disjunction",
                 "non-distribution: for-all over disjunction, there-exists over conjunction",
                 "implication for a restricted for-all, conjunction for a restricted there-exists",
                 "free and bound variables; scope; the definition of a sentence",
                 "validity and satisfiability; tautology vs validity in FOL",
                 "counting relations 2^(n*n) and predicates 2^n"]))

topics.append(topic(
    DM, "Sets", "Sets and set operations",
    ["set notation and membership", "subset and proper subset", "union, intersection, complement, difference",
     "power set", "Cartesian product", "cardinality and counting of finite sets",
     "principle of inclusion-exclusion"],
    prereq=["propositional logic"],
    related=["relations", "functions", "counting"],
    importance="high",
    evidence="Sets are named in the syllabus item 'Sets, relations, functions, partial orders and lattices'. " + SYL,
    difficulty="easy",
    status="PUBLISHED",
    slug="sets-and-set-operations",
    path="topics/sets-and-set-operations/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "membership as the primitive relation",
        "roster form vs set-builder form",
        "order and repetition are not part of a set",
        "empty set vs the set holding zero vs the set holding the empty set",
        "braces add a level: ∅, {∅}, {∅,{∅}}",
        "subset as an implication over the universe",
        "subset is not membership",
        "empty set is a subset of every set; and an element of every power set",
        "equality by double inclusion",
        "power set size 2^n; |P(∅)| = 1; |P(P(∅))| = 2",
        "union, intersection, difference, symmetric difference, complement",
        "difference does not commute; the complement needs a stated universe",
        "De Morgan's two laws for sets and their logical source",
        "distributivity and absorption",
        "inclusion-exclusion for two and for three sets",
        "union bounds: at least the largest set, at most the sum",
        "Cartesian product, ordered pairs, |A x B| = |A|.|B|",
        "A x B differs from B x A; A x ∅ is empty",
        "subsets as bit strings; the 2^n bijection",
        "counting subset pairs A ⊆ B as 3^n",
        "inclusive integer range size b - a + 1"]))

topics.append(topic(
    DM, "Relations", "Relations and their properties",
    ["binary relations as subsets of a product", "reflexive, symmetric, antisymmetric, transitive",
     "equivalence relations and partitions", "closure of a relation",
     "representation as matrices and digraphs", "composition of relations"],
    prereq=["sets and set operations", "propositional logic"],
    related=["functions", "partial orders", "graph theory"],
    importance="high",
    evidence="Named in the syllabus item 'Sets, relations, functions, partial orders and lattices'. " + SYL,
    difficulty="medium",
    status="PUBLISHED",
    slug="relations-and-their-properties",
    path="topics/relations-and-their-properties/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "a relation as a subset of A cross A; 2^(n^2) relations on n elements",
        "domain, range, inverse; the matrix of the inverse is the transpose",
        "matrix and digraph representations of one relation",
        "reflexive: the whole diagonal is 1; irreflexive: the whole diagonal is 0",
        "not reflexive is not irreflexive (existential vs universal negation)",
        "symmetric: the matrix equals its transpose; symmetric iff R = R inverse",
        "antisymmetric: at most one of each mirror pair for distinct elements",
        "antisymmetric is not the negation of symmetric; both, neither, exactly one",
        "asymmetric = irreflexive + antisymmetric",
        "transitive: a two-step path forces a one-step shortcut",
        "symmetric plus transitive does not imply reflexive; minimal counterexample {(1,1)} on {1,2}",
        "reflexive, symmetric and transitive closures, and minimality of each",
        "transitive closure as reachability; Warshall-style iteration",
        "equivalence relations, classes, and the partition they induce",
        "partition to relation: a block of size k contributes k^2 pairs",
        "counting relations with a given property by free cells",
        "counts for reflexive, irreflexive, symmetric, antisymmetric, asymmetric, both, reflexive-and-symmetric",
        "no closed form for transitive relations: 1, 2, 13, 171, 3994",
        "equivalence relations are the Bell numbers: 1, 2, 5, 15",
        "composition of relations, associativity, (S after R) inverse = R inverse after S inverse",
        "properties inherited by subsets: prohibitions pass, requirements do not",
        "equivalence relations on a small set containing a given pair"]))

topics.append(topic(
    DM, "Functions", "Functions and their properties",
    ["domain, codomain, range", "injective, surjective, bijective",
     "composition and inverse", "cardinality arguments for finite functions",
     "counting functions, injections, bijections"],
    prereq=["sets and set operations"],
    related=["relations", "counting", "pigeonhole principle"],
    importance="medium",
    evidence="Named in the syllabus item 'Sets, relations, functions, partial orders and lattices'. " + SYL,
    difficulty="easy-medium",
    microtopics=["bijection iff inverse exists", "counting injections between finite sets"]))

topics.append(topic(
    DM, "Partial orders", "Partial orders and lattices",
    ["partial order definitions", "Hasse diagrams", "maximal, minimal, greatest, least elements",
     "upper and lower bounds", "lattices and their properties", "distributive and complemented lattices"],
    prereq=["relations and their properties"],
    related=["equivalence relations", "graph theory", "boolean algebra"],
    importance="high",
    evidence="Named in the syllabus item 'Sets, relations, functions, partial orders and lattices'. " + SYL,
    difficulty="medium",
    microtopics=["total vs partial order", "drawing a Hasse diagram correctly",
                 "least upper bound vs greatest element", "lattice as a poset with joins and meets"]))

topics.append(topic(
    DM, "Algebraic structures", "Monoids and groups",
    ["binary operations and closure", "semigroups and monoids", "groups, subgroups",
     "cyclic groups and generators", "order of an element", "cosets and Lagrange's theorem"],
    prereq=["functions", "relations"],
    related=["partial orders and lattices", "number theory"],
    importance="medium",
    evidence="Named in the syllabus: 'Monoids, Groups'. " + SYL,
    difficulty="medium-hard",
    microtopics=["checking the four group axioms", "subgroup tests", "order divides group order"]))

topics.append(topic(
    DM, "Graph theory", "Graphs: connectivity, matching, colouring",
    ["graph representations", "paths, cycles, degree sequences",
     "connectivity and cut vertices", "Euler and Hamiltonian paths",
     "trees and spanning trees", "matching", "graph colouring", "planarity basics"],
    prereq=["sets and set operations", "relations"],
    related=["algorithms: graph traversals", "partial orders", "combinatorics"],
    importance="high",
    evidence="Named in the syllabus: 'Graphs: connectivity, matching, colouring'. " + SYL,
    difficulty="medium",
    microtopics=["handshake lemma", "bipartite iff no odd cycle", "Hall's condition for matching",
                 "chromatic number of common families", "tree edge counts"]))

topics.append(topic(
    DM, "Combinatorics", "Counting and combinatorics",
    ["sum and product rules", "permutations and combinations", "pigeonhole principle",
     "binomial coefficients and identities", "inclusion-exclusion"],
    prereq=["sets and set operations"],
    related=["probability", "recurrence relations", "graph theory"],
    importance="high",
    evidence="Named in the syllabus: 'Combinatorics: counting, recurrence relations, generating functions'. " + SYL,
    difficulty="medium",
    microtopics=["stars and bars", "circular permutations", "pigeonhole with generalised form"]))

topics.append(topic(
    DM, "Combinatorics", "Recurrence relations",
    ["linear homogeneous recurrences", "characteristic roots and repeated roots",
     "non-homogeneous recurrences", "solving by substitution and by master theorem",
     "recurrences from divide-and-conquer algorithms"],
    prereq=["counting and combinatorics", "functions"],
    related=["algorithms: asymptotic complexity", "generating functions"],
    importance="high",
    evidence="Named in the syllabus: 'Combinatorics: counting, recurrence relations, generating functions'. " + SYL,
    difficulty="medium-hard",
    microtopics=["distinct roots vs repeated roots", "particular solution guessing",
                 "master theorem cases and their conditions"]))

topics.append(topic(
    DM, "Combinatorics", "Generating functions",
    ["ordinary generating functions", "operations on generating functions",
     "solving recurrences with generating functions", "coefficient extraction",
     "exponential generating functions"],
    prereq=["recurrence relations", "counting and combinatorics"],
    related=["recurrence relations", "probability"],
    importance="medium",
    evidence="Named in the syllabus: 'Combinatorics: counting, recurrence relations, generating functions'. " + SYL,
    difficulty="hard",
    microtopics=["1/(1-x) and its derivatives", "partial fractions for coefficients"]))

# ---------------------------------------------------------------- Engineering Mathematics
topics.append(topic(
    EM, "Linear algebra", "Matrices, determinants and systems of linear equations",
    ["matrix operations", "determinants and their properties", "rank",
     "solving systems: consistency and uniqueness", "LU decomposition",
     "eigenvalues and eigenvectors", "diagonalisation"],
    prereq=["basic algebra"],
    related=["recurrence relations", "probability"],
    importance="high",
    evidence="Section 1 of the GATE 2027 CS syllabus lists 'Matrices, determinants, system of linear equations, eigenvalues and eigenvectors, LU decomposition'.",
    difficulty="medium",
    microtopics=["rank-nullity", "consistency via rank comparison", "eigenvalue properties of special matrices"]))

topics.append(topic(
    EM, "Calculus", "Limits, continuity, differentiability, maxima and minima",
    ["limits and standard forms", "continuity", "differentiation rules",
     "mean value theorem", "maxima and minima", "integration"],
    prereq=["basic algebra"],
    related=["probability"],
    importance="medium",
    evidence="Section 1 of the GATE 2027 CS syllabus lists 'Limits, continuity and differentiability, Maxima and minima, Mean value theorem, Integration'.",
    difficulty="medium",
    microtopics=["L'Hopital where applicable", "first and second derivative tests"]))

topics.append(topic(
    EM, "Probability and statistics", "Probability, random variables and distributions",
    ["sample space and axioms", "conditional probability and independence",
     "Bayes' theorem", "random variables and expectation", "variance",
     "uniform, normal, exponential, Poisson, binomial distributions",
     "mean, median, mode, standard deviation"],
    prereq=["counting and combinatorics"],
    related=["algorithms: randomised analysis", "hashing"],
    importance="high",
    evidence="Section 1 of the GATE 2027 CS syllabus lists random variables, the five named distributions, mean/median/mode/standard deviation, conditional probability and Bayes theorem.",
    difficulty="medium",
    microtopics=["linearity of expectation", "memorylessness of the exponential",
                 "Poisson approximation", "Bayes with a partition"]))

# ---------------------------------------------------------------- Core CS
topics.append(topic(
    "Digital Logic", "Boolean algebra", "Boolean algebra and minimisation",
    ["Boolean identities", "canonical SOP and POS forms", "Karnaugh maps",
     "tabular (Quine-McCluskey) minimisation", "don't-care conditions"],
    prereq=["propositional logic"],
    related=["propositional logic", "combinational circuits"],
    importance="high",
    evidence="GATE 2027 Section 2 names 'Boolean algebra and minimization - algebraic technique, Karnaugh map, tabular method'.",
    difficulty="medium"))

topics.append(topic(
    "Digital Logic", "Number representation", "Number representation and arithmetic",
    ["fixed point representations", "signed number systems", "floating point (IEEE 754)",
     "binary arithmetic and overflow"],
    prereq=["binary number system"],
    related=["Boolean algebra", "computer organisation"],
    importance="high",
    evidence="GATE 2027 Section 2 names 'Number representation and arithmetic (fixed and floating point)'.",
    difficulty="medium"))

topics.append(topic(
    "Digital Logic", "Circuits", "Combinational and sequential circuits",
    ["multiplexers and decoders", "adders and subtractors", "latches and flip-flops",
     "registers and counters", "finite state machines", "timing behaviour"],
    prereq=["Boolean algebra", "number representation"],
    related=["computer organisation"],
    importance="high",
    evidence="GATE 2027 Section 2 names 'Design of combinational and sequential circuits'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Computer Organization and Architecture", "Instruction set", "Instruction set and addressing modes",
    ["instruction formats", "addressing modes", "instruction execution"],
    prereq=["number representation"],
    related=["control unit design", "pipelining"],
    importance="high",
    evidence="GATE 2027 Section 3 names 'Instruction set and addressing modes'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Organization and Architecture", "Datapath", "ALU and control unit design",
    ["arithmetic and logic unit design", "hardwired control", "microprogrammed control",
     "interfacing"],
    prereq=["combinational and sequential circuits"],
    related=["instruction set", "pipelining"],
    importance="high",
    evidence="GATE 2027 Section 3 names 'Design of arithmetic and logic unit (ALU). Design of control unit and hardwired and microprogrammed. Instruction pipelining, pipeline hazards. Memory hierarchy: cache memory - mapping. I/O interface (interrupt and DMA).'",
    difficulty="medium-hard"))

topics.append(topic(
    "Computer Organization and Architecture", "Pipelining", "Pipelining and hazards",
    ["pipeline performance", "structural, data and control hazards",
     "forwarding and stalling", "speedup and efficiency calculations"],
    prereq=["ALU and control unit design"],
    related=["instruction set"],
    importance="high",
    evidence="GATE 2027 Section 3 names 'Instruction pipelining, pipeline hazards'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Organization and Architecture", "Memory", "Memory hierarchy and cache",
    ["cache mapping: direct, associative, set-associative", "replacement policies",
     "cache performance and AMAT", "write policies"],
    prereq=["memory basics"],
    related=["operating systems: virtual memory"],
    importance="high",
    evidence="GATE 2027 Section 3 names 'Memory hierarchy: cache memory - mapping'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Organization and Architecture", "I/O", "I/O interface, interrupts and DMA",
    ["programmed I/O", "interrupt-driven I/O", "DMA transfer"],
    prereq=["instruction set"],
    related=["operating systems: I/O"],
    importance="medium",
    evidence="GATE 2027 Section 3 names 'I/O interface (interrupt and DMA)'.",
    difficulty="medium"))

topics.append(topic(
    "Programming and Data Structures", "Programming in C", "Pointers in C",
    ["addresses and dereferencing", "pointer arithmetic", "array decay",
     "sizeof semantics", "pointer to pointer", "dangling pointers"],
    prereq=["variables, types and functions in C"],
    related=["arrays and strings", "memory layout", "linked lists"],
    importance="high",
    evidence="'Programming in C' is named in GATE 2027 Section 4; pointers are the mechanism behind every data structure in that section, so this is class B (prerequisite) rather than class A.",
    difficulty="medium-hard",
    status="PUBLISHED",
    slug="pointers-in-c",
    path="topics/pointers-in-c/index.html",
    execution="published 2026-10-25 (earlier run)"))

topics.append(topic(
    "Programming and Data Structures", "Programming in C", "C fundamentals: types, operators, control flow",
    ["data types and conversions", "operator precedence and associativity",
     "conditionals and loops", "functions and parameter passing", "scope, lifetime, storage class",
     "preprocessor", "undefined behaviour"],
    prereq=["none"],
    related=["pointers in C", "recursion"],
    importance="high",
    evidence="GATE 2027 Section 4 opens with 'Programming in C'.",
    difficulty="medium",
    status="READY"))

topics.append(topic(
    "Programming and Data Structures", "Programming in C", "Recursion",
    ["recursive functions in C", "recursion vs iteration", "recursion trees",
     "tail recursion", "recursion with arrays and strings"],
    prereq=["C fundamentals", "pointers in C"],
    related=["recurrence relations", "divide and conquer", "trees"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'Recursion'.",
    difficulty="medium"))

topics.append(topic(
    "Programming and Data Structures", "Data structures", "Arrays, stacks and queues",
    ["array storage and indexing", "stacks and their applications",
     "queues, circular queues, deques", "implementation trade-offs"],
    prereq=["C fundamentals", "pointers in C"],
    related=["linked lists", "graph traversals"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'Arrays, stacks, queues'.",
    difficulty="easy-medium"))

topics.append(topic(
    "Programming and Data Structures", "Data structures", "Linked lists",
    ["singly and doubly linked lists", "insertion and deletion",
     "cycle detection", "reversal and merging"],
    prereq=["pointers in C"],
    related=["stacks and queues", "trees"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'linked lists'.",
    difficulty="medium"))

topics.append(topic(
    "Programming and Data Structures", "Data structures", "Trees, binary search trees and heaps",
    ["tree terminology and traversals", "BST operations and properties",
     "balanced tree ideas", "binary heaps and heap operations", "heapsort"],
    prereq=["linked lists", "recursion"],
    related=["sorting", "priority queues", "B-trees"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'trees, binary search trees, binary heaps'.",
    difficulty="medium"))

topics.append(topic(
    "Algorithms", "Analysis", "Asymptotic complexity and recurrences",
    ["big-O, big-Omega, big-Theta", "best, average, worst case",
     "solving recurrences", "space complexity"],
    prereq=["recurrence relations", "logarithms"],
    related=["every algorithm topic"],
    importance="high",
    evidence="GATE 2027 Section 5 names 'Asymptotic worst case time and space complexity'.",
    difficulty="medium"))

topics.append(topic(
    "Algorithms", "Searching and sorting", "Searching, sorting and hashing",
    ["binary search and variants", "comparison sorts and their bounds",
     "quicksort and mergesort analysis", "hash functions and collision resolution",
     "expected probe counts"],
    prereq=["arrays", "asymptotic complexity"],
    related=["trees and heaps", "probability"],
    importance="high",
    evidence="GATE 2027 Section 5 names 'Searching, sorting, hashing'.",
    difficulty="medium"))

topics.append(topic(
    "Algorithms", "Design techniques", "Greedy, dynamic programming and divide-and-conquer",
    ["greedy choice property and exchange arguments", "DP formulation and tables",
     "classic DP problems", "divide-and-conquer recurrences"],
    prereq=["asymptotic complexity", "recursion"],
    related=["graph algorithms", "recurrence relations"],
    importance="high",
    evidence="GATE 2027 Section 5 names 'Algorithm design techniques: greedy, dynamic programming and divide-and-conquer'.",
    difficulty="hard"))

topics.append(topic(
    "Algorithms", "Graph algorithms", "Traversals, MSTs and shortest paths",
    ["BFS and DFS", "topological order", "Prim and Kruskal", "Dijkstra and Bellman-Ford",
     "correctness and complexity of each"],
    prereq=["graph theory", "greedy algorithms"],
    related=["graph theory", "computer networks: routing"],
    importance="high",
    evidence="GATE 2027 Section 5 names 'Graph traversals, minimum spanning trees, shortest paths'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Theory of Computation", "Regular languages", "Regular expressions and finite automata",
    ["DFA and NFA", "subset construction", "regular expressions to automata",
     "closure properties", "pumping lemma for regular languages"],
    prereq=["sets and functions", "propositional logic"],
    related=["compiler design: lexical analysis"],
    importance="high",
    evidence="GATE 2027 Section 6 names 'Regular expressions and finite automata'.",
    difficulty="medium"))

topics.append(topic(
    "Theory of Computation", "Context-free languages", "CFG, PDA and pumping lemma",
    ["grammars and derivations", "ambiguity", "pushdown automata",
     "CFL closure properties", "pumping lemma for CFLs"],
    prereq=["regular expressions and finite automata"],
    related=["compiler design: parsing"],
    importance="high",
    evidence="GATE 2027 Section 6 names 'Context-free grammars and push-down automata. Regular and context-free languages, pumping lemma'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Theory of Computation", "Computability", "Turing machines and undecidability",
    ["Turing machine variants", "decidable and undecidable problems",
     "reductions", "Rice's theorem for the syllabus level"],
    prereq=["context-free languages"],
    related=["complexity classes"],
    importance="high",
    evidence="GATE 2027 Section 6 names 'Turing machines and undecidability'.",
    difficulty="hard"))

topics.append(topic(
    "Compiler Design", "Analysis", "Lexical analysis, parsing and syntax-directed translation",
    ["tokens and regular expressions", "LL(1) parsing and FIRST/FOLLOW",
     "LR parsing", "syntax-directed definitions"],
    prereq=["regular expressions and finite automata", "CFG"],
    related=["theory of computation"],
    importance="high",
    evidence="GATE 2027 Section 7 names 'Lexical analysis, parsing, syntax-directed translation'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Compiler Design", "Back end", "Runtime environments, intermediate code and optimisation",
    ["activation records", "intermediate representations",
     "local optimisation", "data-flow analyses: constant propagation, liveness, common subexpression elimination"],
    prereq=["parsing", "C fundamentals"],
    related=["operating systems: memory"],
    importance="medium",
    evidence="GATE 2027 Section 7 names 'Runtime environments. Intermediate code generation. Local optimisation, Data flow analyses: constant propagation, liveness analysis, common sub expression elimination'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Operating Systems", "Processes", "Processes, threads and IPC",
    ["process states", "context switching", "threads", "inter-process communication",
     "system calls"],
    prereq=["C fundamentals"],
    related=["CPU scheduling", "synchronisation"],
    importance="high",
    evidence="GATE 2027 Section 8 names 'System calls, processes, threads, inter-process communication'.",
    difficulty="medium"))

topics.append(topic(
    "Operating Systems", "Concurrency", "Synchronisation and deadlock",
    ["critical sections", "semaphores and monitors", "classical problems",
     "deadlock conditions and avoidance", "banker's algorithm", "detection"],
    prereq=["processes and threads"],
    related=["CPU scheduling"],
    importance="high",
    evidence="GATE 2027 Section 8 names 'concurrency and synchronization. Deadlock'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Operating Systems", "Scheduling", "CPU and I/O scheduling",
    ["FCFS, SJF, SRTF, round robin, priority", "average waiting and turnaround time",
     "I/O scheduling"],
    prereq=["processes and threads"],
    related=["deadlock", "disk scheduling"],
    importance="high",
    evidence="GATE 2027 Section 8 names 'CPU and I/O scheduling'.",
    difficulty="easy-medium"))

topics.append(topic(
    "Operating Systems", "Memory", "Memory management, virtual memory and file systems",
    ["contiguous allocation and fragmentation", "paging and segmentation",
     "page replacement algorithms", "thrashing", "file systems and allocation methods"],
    prereq=["processes and threads"],
    related=["cache memory", "compiler runtime environments"],
    importance="high",
    evidence="GATE 2027 Section 8 names 'Memory management and virtual memory. File systems'.",
    difficulty="medium"))

topics.append(topic(
    "Databases", "Relational model", "Relational algebra, tuple calculus and SQL",
    ["relational algebra operators", "tuple relational calculus", "SQL queries, joins and subqueries",
     "ER to relational mapping"],
    prereq=["sets and relations"],
    related=["normalisation", "indexing"],
    importance="high",
    evidence="GATE 2027 Section 9 names 'ER-model. Relational model: relational algebra, tuple calculus, SQL'.",
    difficulty="medium"))

topics.append(topic(
    "Databases", "Design", "Functional dependencies, normal forms and decomposition",
    ["functional dependencies and closure", "candidate keys", "1NF to BCNF",
     "lossless join decomposition", "dependency preservation"],
    prereq=["relational algebra"],
    related=["relational model"],
    importance="high",
    evidence="GATE 2027 Section 9 names 'Integrity constraints, normal forms'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Databases", "Storage", "File organisation and indexing (B and B+ trees)",
    ["file organisation", "B-tree and B+ tree structure", "insertion and deletion",
     "indexing and query cost"],
    prereq=["trees and heaps"],
    related=["normalisation"],
    importance="high",
    evidence="GATE 2027 Section 9 names 'File organization, indexing (e.g., B and B+ trees)'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Databases", "Transactions", "Transactions and concurrency control",
    ["ACID properties", "conflict serialisability", "precedence graphs",
     "locking protocols", "recovery"],
    prereq=["relational model"],
    related=["operating systems: concurrency"],
    importance="high",
    evidence="GATE 2027 Section 9 names 'Transactions and concurrency control'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Computer Networks", "Fundamentals", "Layering, switching and performance metrics",
    ["principles of layering", "circuit, packet and virtual circuit switching",
     "bandwidth, delay, throughput calculations"],
    prereq=["none"],
    related=["data link layer", "transport layer"],
    importance="high",
    evidence="GATE 2027 Section 10 names 'Principles of Layering; Basics of switching (circuit, packet and virtual circuit) and performance metrics'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Networks", "Data link layer", "Error detection, MAC and Ethernet",
    ["parity, checksum and CRC", "ALOHA, CSMA/CD and CSMA/CA", "Ethernet framing and bridging",
     "sliding window protocols"],
    prereq=["layering and performance metrics"],
    related=["IP layer"],
    importance="high",
    evidence="GATE 2027 Section 10 names 'data link layer: error detection, Medium Access Control, Ethernet'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Networks", "Routing", "Distance vector and link state routing",
    ["distance vector algorithm and count-to-infinity", "link state and Dijkstra",
     "routing tables"],
    prereq=["graph algorithms: shortest paths"],
    related=["IP layer"],
    importance="high",
    evidence="GATE 2027 Section 10 names 'Distance vector and link state routing'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Networks", "Network layer", "IP fragmentation, CIDR and NAT",
    ["IPv4 addressing and subnetting", "fragmentation and reassembly",
     "CIDR notation", "network address translation"],
    prereq=["layering and performance metrics"],
    related=["routing", "transport layer"],
    importance="high",
    evidence="GATE 2027 Section 10 names 'IPv4 - Fragmentation, CIDR Notation, Network Address Translation'.",
    difficulty="medium"))

topics.append(topic(
    "Computer Networks", "Transport layer", "TCP flow control, congestion control and sockets",
    ["TCP header and connection management", "flow control and window scaling",
     "congestion control algorithms", "UDP", "socket API"],
    prereq=["IP layer"],
    related=["application layer"],
    importance="high",
    evidence="GATE 2027 Section 10 names 'TCP - flow control and congestion control, socket API'.",
    difficulty="medium-hard"))

topics.append(topic(
    "Computer Networks", "Application layer", "DNS and HTTP",
    ["DNS resolution and records", "HTTP request and response", "caching and persistence"],
    prereq=["transport layer"],
    related=["TCP"],
    importance="medium",
    evidence="GATE 2027 Section 10 names 'DNS and HTTP'.",
    difficulty="easy-medium"))

topics.append(topic(
    "General Aptitude", "Aptitude", "Verbal, quantitative, analytical and spatial aptitude",
    ["verbal ability", "numerical estimation", "data interpretation",
     "logical and analytical reasoning", "spatial aptitude"],
    prereq=["none"],
    related=["probability", "counting"],
    importance="high",
    evidence="General Aptitude is common to all GATE papers and carries 15 of 100 marks (GATE 2026 brochure, section 4; the same split is stated for GATE 2027).",
    difficulty="easy-medium"))

doc = {
    "repo": "gate-visual-explainer",
    "schema": 1,
    "exam": "GATE Computer Science and Information Technology (CS)",
    "exam_year": 2027,
    "syllabus_source": {
        "document": "GATE 2027 CS syllabus PDF, IIT Madras",
        "url": "https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/CS_GATE2027_Syllabus.pdf",
        "verified_on": TODAY,
        "note": "Section 1 Engineering Mathematics (Discrete Mathematics, Linear Algebra, Calculus, Probability and Statistics); Sections 2-10 core CS. Subjects and topic wording above follow that document."
    },
    "statuses": ["NOT_STARTED", "READY", "IN_PROGRESS", "PUBLISHED", "NEEDS_REVIEW", "BLOCKED"],
    "updated": TODAY,
    "counts": {
        "topics": len(topics),
        "published": sum(1 for t in topics if t["coverage_status"] == "PUBLISHED"),
        "ready": sum(1 for t in topics if t["coverage_status"] == "READY"),
        "not_started": sum(1 for t in topics if t["coverage_status"] == "NOT_STARTED"),
    },
    "topics": topics,
}

with open("syllabus-coverage.json", "w") as f:
    json.dump(doc, f, indent=2, ensure_ascii=False)
    f.write("\n")

print("topics:", len(topics), "published:", doc["counts"]["published"], "ready:", doc["counts"]["ready"])
