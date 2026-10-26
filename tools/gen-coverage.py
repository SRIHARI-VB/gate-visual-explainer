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
    [
     "a function as a total, single-valued relation",
     "domain, codomain and range",
     "injective, surjective, bijective",
     "the finite equal-size collapse",
     "counting functions, injections, surjections and bijections",
     "composition of functions",
     "the inverse function versus the preimage of a set",
     "images and preimages under union, intersection and complement"
     ],
    prereq=["sets and set operations", "relations and their properties"],
    related=["relations and their properties", "counting and combinatorics", "partial orders and lattices", "monoids and groups"],
    importance="medium",
    evidence="Named in the syllabus item 'Sets, relations, functions, partial orders and lattices'. Official GATE 2027 CS syllabus, IIT Madras (Section 1: Engineering Mathematics, Discrete Mathematics)",
    difficulty="easy-medium",
    status="PUBLISHED",
    slug="functions-and-their-properties",
    path="topics/functions-and-their-properties/index.html",
    execution="published 2026-10-26",
    microtopics=[
     "function as a relation with exactly one 1 in every row of its matrix",
     "totality and single-valuedness as separate promises; a relation failing each",
     "relations versus functions: 2^(mn) against n^m, both counted by enumeration",
     "domain is declared, codomain is declared, range is computed",
     "range is a subset of the codomain; equality exactly when onto",
     "injective: f(a)=f(b) implies a=b; at most one 1 per column; the colliding-pair witness",
     "surjective: every b is reached; at least one 1 per column; the uncovered-element witness",
     "bijective: exactly one 1 per column; the matrix becomes a permutation matrix",
     "pigeonhole: injective forces m <= n, surjective forces m >= n, so m > n gives zero injections",
     "for finite equal sizes injective, surjective and bijective are the same condition",
     "the collapse needs finiteness: successor on the naturals is injective and not surjective",
     "counts: n^m, n!/(n-m)!, inclusion-exclusion for surjections, n! for bijections",
     "the wrong onto shortcut n! x C(m,n) and why it only works when m = n",
     "composition: order of application, associativity, failure of commutativity",
     "injective after injective is injective; surjective after surjective is surjective",
     "composite injective forces the inner function only; composite onto forces the outer function only",
     "inverse function exists iff bijective; f-inv after f is the identity both ways",
     "preimage of a set is defined for every function, bijection or not",
     "x -> x^2 is not invertible on R; restricting the domain restores bijectivity",
     "f(S u T) = f(S) u f(T) always; f(S n T) inside f(S) n f(T) with equality iff injective",
     "preimage commutes exactly with union, intersection and complement",
     "cardinality argument: two bijections give equations, then bound and solve in integers"
     ]))

topics.append(topic(
    DM, "Partial orders", "Partial orders and lattices",
    ["partial order definitions", "Hasse diagrams", "maximal, minimal, greatest, least elements",
     "upper and lower bounds", "lattices and their properties", "distributive and complemented lattices"],
    prereq=["relations and their properties"],
    related=["equivalence relations", "graph theory", "boolean algebra"],
    importance="high",
    evidence="Named in the syllabus item 'Sets, relations, functions, partial orders and lattices'. " + SYL,
    difficulty="medium",
    status="PUBLISHED",
    slug="partial-orders-and-lattices",
    path="topics/partial-orders-and-lattices/index.html",
    execution="published 2026-10-26",
    microtopics=["total vs partial order", "drawing a Hasse diagram correctly",
                 "least upper bound vs greatest element", "lattice as a poset with joins and meets",
                 "covering relation and transitive reduction", "chain versus antichain",
                 "maximal versus greatest on a finite poset", "join and meet as lub and glb",
                 "the two shapes that stop a poset being a lattice",
                 "M3 and N5 as the distributivity obstructions",
                 "complement counts and the Boolean-algebra ladder",
                 "counting linear extensions of a poset",
                 "number of partial orders on a small set (Dedekind numbers)"]))

topics.append(topic(
    DM, "Algebraic structures", "Monoids and groups",
    ["binary operations and closure", "semigroups and monoids", "groups, subgroups",
     "cyclic groups and generators", "order of an element", "cosets and Lagrange's theorem"],
    prereq=["functions", "relations"],
    related=["partial orders and lattices", "number theory"],
    importance="medium",
    evidence="Named in the syllabus: 'Monoids, Groups'. " + SYL,
    difficulty="medium-hard",
    status="PUBLISHED",
    slug="monoids-and-groups",
    path="topics/monoids-and-groups/index.html",
    execution="published 2026-10-26 (earlier run)",
    microtopics=["checking the four group axioms", "subgroup tests", "order divides group order"]))

# The syllabus names "Graphs: connectivity, matching, colouring" as one item. It is
# too large for one screen-based lesson, so it is split into two independently
# teachable topics that keep the prerequisite order: connectivity first, then
# matching and colouring (which both need bipartiteness, taught in the first).
topics.append(topic(
    DM, "Graph theory", "Graphs: connectivity and structure",
    ["graph as two sets, adjacency matrix and adjacency list",
     "degree sequences and the handshake lemma",
     "walks, trails, paths, cycles, components and distance",
     "trees and their three equivalent tests", "spanning trees",
     "cut vertices and bridges", "vertex and edge connectivity",
     "bipartite graphs and odd cycles", "Euler trails and Hamiltonian cycles"],
    prereq=["sets and set operations", "relations", "counting and combinatorics"],
    related=["algorithms: graph traversals", "matching and colouring",
             "partial orders", "combinatorics"],
    importance="high",
    evidence="Named in the syllabus: 'Graphs: connectivity, matching, colouring'. " + SYL,
    difficulty="medium",
    status="PUBLISHED",
    slug="graphs-connectivity",
    path="topics/graphs-connectivity/index.html",
    execution="published 2026-10-26",
    microtopics=["handshake lemma and the parity of odd-degree vertices",
                 "degree sum equals twice the edge count",
                 "tree iff connected and acyclic iff |E| = n - 1",
                 "every connected graph has a spanning tree",
                 "Cayley n^(n-2) for complete graphs only",
                 "cut vertex vs bridge", "kappa <= lambda <= delta (Whitney)",
                 "kappa of a complete graph is n - 1 by convention",
                 "bipartite iff no odd cycle, decided by BFS parity",
                 "Euler criterion and its one-component condition",
                 "Euler and Hamiltonian are independent",
                 "cycle rank |E| - |V| + components"]))

topics.append(topic(
    DM, "Graph theory", "Graphs: matching and colouring",
    ["matchings and maximum matchings", "perfect and maximum matchings",
     "Hall's condition and Hall's theorem", "vertex colouring and the chromatic number",
     "edge colouring", "greedy colouring bounds", "planarity basics"],
    prereq=["graphs: connectivity and structure", "counting and combinatorics"],
    related=["bipartite graphs", "sets and set operations", "combinatorics"],
    importance="high",
    evidence="Named in the syllabus: 'Graphs: connectivity, matching, colouring'. " + SYL,
    difficulty="medium-hard",
    status="PUBLISHED",
    slug="matching-and-colouring",
    path="topics/matching-and-colouring/index.html",
    execution="published 2026-10-26",
    microtopics=["matching, saturated, free, maximal, maximum, perfect, near-perfect, matching number",
                 "Berge's theorem and the augmenting-path algorithm",
                 "Hall's condition as a necessary and sufficient test for a matching saturating one side",
                 "Konig's theorem, the constructive cover, and its failure on an odd cycle",
                 "chromatic number of common families (cycles, complete graphs, bipartite graphs, trees)",
                 "clique number as a lower bound, and the Mycielskian gap",
                 "first-fit greedy, order dependence, chromatic number at most maximum degree plus one",
                 "Brooks' theorem and its two exceptions",
                 "edge colouring, Konig's bipartite equality, Vizing's window, class one and class two",
                 "Euler's formula, m <= 3n - 6, m <= 2n - 4, K5 and K(3,3) not planar, four colours"]))

topics.append(topic(
    DM, "Combinatorics", "Counting and combinatorics",
    ["sum and product rules", "permutations and combinations", "pigeonhole principle",
     "binomial coefficients and identities", "inclusion-exclusion"],
    prereq=["sets and set operations"],
    related=["probability", "recurrence relations", "graph theory"],
    importance="high",
    evidence="Named in the syllabus: 'Combinatorics: counting, recurrence relations, generating functions'. " + SYL,
    difficulty="medium",
    status="PUBLISHED",
    slug="counting-and-combinatorics",
    path="topics/counting-and-combinatorics/index.html",
    execution="published 2026-10-26",
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
    status="PUBLISHED",
    slug="recurrence-relations",
    path="topics/recurrence-relations/index.html",
    execution="published 2026-10-26",
    microtopics=["distinct roots vs repeated roots", "particular solution guessing",
                 "master theorem cases and their conditions"]))

topics.append(topic(
    DM, "Combinatorics", "Generating functions",
    ["ordinary generating functions", "operations on generating functions",
     "solving recurrences with generating functions", "coefficient extraction",
     "exponential generating functions"],
    prereq=["recurrence relations", "counting and combinatorics"],
    related=["recurrence relations", "counting and combinatorics", "functions and their properties"],
    importance="medium",
    evidence="Named in the syllabus: 'Combinatorics: counting, recurrence relations, generating functions'. " + SYL + " Community observation: five questions in the public archives (2014 Set 1 Q49, 2016 Set 1 Q26, 2017 Set 2 Q47, 2018 Q1, 2022 Q26) use it; a reading of those papers, not a weightage figure.",
    difficulty="hard",
    status="PUBLISHED",
    slug="generating-functions",
    path="topics/generating-functions/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "formal power series: x is a placeholder, never evaluated",
        "coefficient extraction [x^n] as the terminal operation",
        "1/(1-x) and its derivatives; x/(1-x)^2 is n, x(1+x)/(1-x)^3 is n^2",
        "1/(1-x)^k has coefficient C(n+k-1, k-1): stars and bars",
        "substituting x -> x^2 as the parity filter",
        "the shift rule [x^n] x^k G = [x^(n-k)] G",
        "multiplication by 1/(1-x) as prefix sums",
        "sum rule for disjoint cases, product rule for independent choices",
        "a product of series is a convolution, not a coefficient product",
        "rational closed form <-> linear recurrence; the denominator is the recurrence",
        "base cases live in the numerator (x/(1-x-x^2) against 1/(1-x-x^2))",
        "solving a recurrence: multiply by x^n, sum, solve for G, cancel or use partial fractions",
        "the 2024 Set 2 Q15 cancellation that removes the 3^n term",
        "quadratic functional equations: Catalan C = 1 + xC^2",
        "the branch test: reject any branch with a negative power; a_0 decides",
        "ordinary against exponential generating functions; n! under the EGF",
        "rewriting a correct answer into the shape the options use (2022 Q26)",
        "verify by expanding four terms"]))

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
    ["Boolean functions and truth tables", "Boolean identities and duality",
     "algebraic minimisation (absorption, consensus)",
     "canonical SOP and POS forms", "Karnaugh maps",
     "don't-care conditions", "prime implicants and essential prime implicants",
     "minimal cover and product-of-sums minimisation",
     "tabular (Quine-McCluskey) minimisation"],
    prereq=["propositional logic"],
    related=["propositional logic", "partial orders and lattices", "combinational circuits"],
    importance="high",
    evidence="GATE 2027 Section 2 names 'Boolean algebra and minimization - algebraic technique, Karnaugh map, tabular method', so all three methods are explicitly examinable; five previous-year questions are worked in the lesson (2004, 2015 Set 3 Q43, 2016 Set 2 Q33, 2017 Set 2 Q28, 2018 Q49). Past frequency is an observation about old papers, not a prediction.",
    difficulty="medium",
    status="PUBLISHED",
    slug="boolean-algebra-and-minimisation",
    path="topics/boolean-algebra-and-minimisation/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "Boolean function as a truth-table column; 2^(2^n) functions",
        "literal, product term, sum term, two-level SOP and POS",
        "the ten identities and the four consequences",
        "duality: swap + with ., and 0 with 1, leaving literals alone",
        "dual against complement (De Morgan) as a closely confused pair",
        "absorption x + xy = x and its dual",
        "consensus xy + x'z + yz = xy + x'z and its dual",
        "why algebraic rewriting cannot certify minimality",
        "minterm numbering depends on the declared variable order",
        "maxterm i is the complement of minterm i",
        "canonical SOP from the ones and canonical POS from the zeros",
        "canonical forms are unique and never minimal",
        "the map as a folded truth table",
        "Gray-code axis labels 00 01 11 10 and why counting order fails",
        "wrapping edges: columns and rows are adjacent cyclically",
        "five-variable map as two four-variable maps, mirror cells adjacent",
        "block of 2^k cells keeps n-k literals",
        "the five grouping rules",
        "prime implicant as a maximal block, not a useful one",
        "essential prime implicant owns a one no other prime implicant covers",
        "don't-cares are optional in both directions and never essential",
        "product of sums by grouping the zeros and applying De Morgan",
        "cyclic maps: no essential implicant, minimum chosen by comparing covers",
        "fewest terms then fewest literals as the definition of minimal",
        "the tabular method: group by number of ones, dash notation, rounds",
        "unticked survivors are the prime implicants",
        "the cover chart and the essential row",
        "checking an option on one row instead of expanding it",
        "minimum number of gates as a third cost model",
    ]))

topics.append(topic(
    "Digital Logic", "Number representation", "Number representation and arithmetic",
    ["fixed point representations", "signed number systems", "floating point (IEEE 754)",
     "binary arithmetic and overflow"],
    prereq=["binary number system"],
    related=["Boolean algebra", "computer organisation"],
    importance="high",
    evidence="GATE 2027 Section 2 names 'Number representation and arithmetic (fixed and floating point)'. "
             "Past-paper coverage checked for this run: 2012 Q7, 2013 Q4, 2014 Set 2 Q45, 2016 Set 1 Q7, "
             "2016 Set 2 Q9, 2017 Set 1 Q7, 2017 Set 1 Q9, 2019 Q4, 2019 Q8, 2021 Set 1 Q24, 2021 Set 2 Q4, "
             "2025 Set 1 Q25 - no marks distribution is claimed.",
    difficulty="medium",
    status="PUBLISHED",
    slug="number-representation-and-arithmetic",
    path="topics/number-representation-and-arithmetic/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "a bit pattern has no meaning without its representation",
        "fixed point: weights 2^k from k = -f to i-1, i = n - f",
        "fixed point range 0 to 2^i - 2^-f and step 2^-f",
        "resolution against range at fixed width",
        "sign-magnitude, ones' complement, two's complement encodings",
        "two zeros in sign-magnitude and ones' complement, one in two's complement",
        "distinct values 2^n against 2^n - 1 (GATE 2016 Set 2 Q9)",
        "two's complement decode as unsigned minus 2^n, or a negative top weight",
        "the pattern wheel and arithmetic modulo 2^n",
        "negation as invert-and-add-one, and its single fixed point",
        "range -2^(n-1) to 2^(n-1)-1 and the smallest integer (GATE 2013 Q4)",
        "sign extension against zero padding (GATE 2019 Q4)",
        "the one-pass negation shortcut",
        "one adder for addition and subtraction; the discarded carry",
        "subtracting the most negative value and its spurious overflow",
        "carry out as the fifth bit of an unsigned sum",
        "overflow as carry-in xor carry-out of the sign column (GATE 2017 Set 1 Q9)",
        "overflow without carry and carry without overflow",
        "sign-magnitude overflow as a magnitude question",
        "normalised binary scientific notation and the implied leading one",
        "exponent bias 127 and 1023, and why a bias rather than a sign bit",
        "IEEE 754 single 1/8/23 and double 1/11/52 field layout",
        "decoding a field triple, a bit string or a hex constant",
        "encoding a decimal value and checking by decoding (GATE 2014 Set 2 Q45)",
        "the 2021 decode to -7.75 (GATE 2021 Set 1 Q24)",
        "four exponent regimes: zero, denormal, normal, infinity and NaN",
        "denormals: hidden bit 0, exponent pinned at -126, spacing 2^-149",
        "smallest normalised positive number 2^-126 (GATE 2021 Set 2 Q4)",
        "largest finite single (2 - 2^-23) x 2^127",
        "signed zero and NaN not equal to itself",
        "precision 24 bits against range: the gap at 1 is 2^-23",
        "inexact decimals: 0.1 as 13421773/2^27 and as 3602879701896397/2^55",
        "alignment loss: 2^24 + 1 = 2^24",
        "rounding to nearest, ties to even",
        "the five-step procedure and the four traps",
    ]))

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
    "Programming and Data Structures", "Programming in C", "C fundamentals: types, operators and control flow",
    ["data types and conversions", "operator precedence and associativity",
     "conditionals and loops", "expression evaluation and side effects",
     "undefined, unspecified and implementation-defined behaviour"],
    prereq=["none"],
    related=["pointers in C", "recursion"],
    importance="high",
    evidence="GATE 2027 Section 4 opens with 'Programming in C'.",
    difficulty="medium",
    status="PUBLISHED",
    slug="c-fundamentals",
    path="topics/c-fundamentals/index.html",
    execution="published 2026-10-26"))

topics.append(topic(
    "Programming and Data Structures", "Programming in C",
    "Functions, scope, lifetime and the preprocessor",
    ["function declaration, definition and prototype",
     "parameter passing and pass by value",
     "return values and the void return",
     "scope: block, function, file, function prototype",
     "lifetime and storage duration: automatic, static, allocated",
     "linkage: external, internal, none; static and extern",
     "the preprocessor: #define, macros, #include, conditional compilation"],
    prereq=["C fundamentals: types, operators and control flow"],
    related=["pointers in C", "recursion", "compiler runtime environments",
             "operating system processes"],
    importance="high",
    evidence="GATE 2027 Section 4 begins 'Programming in C.' Functions, scope and the "
             "preprocessor are part of that phrase and are the mechanism behind the recursion "
             "and pointers items in the same section. Official GATE 2027 CS syllabus, IIT Madras.",
    difficulty="medium",
    status="PUBLISHED",
    slug="functions-scope-and-preprocessor",
    path="topics/functions-scope-and-preprocessor/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "a prototype lets the compiler convert each argument, as if by assignment",
        "without a prototype the default argument promotions apply",
        "only float is promoted; double passes unchanged",
        "arguments are copies; a parameter is a new object each call",
        "arrays and functions: a parameter of array type is adjusted to a pointer",
        "why a swap needs pointers, and why returning a pointer to a local is wrong",
        "sizeof inside a callee is the size of a pointer, not of the array",
        "scope against storage duration: four combinations, all real",
        "name lookup from the innermost block outward",
        "shadowing: two objects, one spelling, no diagnostic",
        "static local keeps its value across calls and is initialised once",
        "a static local with no initialiser still starts at zero",
        "static at file scope gives internal linkage",
        "extern declares without defining; a plain file-scope int defines",
        "the four storage classes and their default initial values",
        "object macros against function macros and the missing-parentheses trap",
        "outer parentheses around the body do not fix a compound argument",
        "macro side effects: the argument is substituted once per use",
        "parentheses fix precedence, never duplication",
        "#include is textual inclusion and needs include guards",
        "conditional compilation and the meaning of NDEBUG at the point of inclusion",
        "the compilation pipeline: preprocess, compile, assemble, link",
        "declaration against definition, and one external definition per name",
    ]))

topics.append(topic(
    "Programming and Data Structures", "Programming in C", "Recursion",
    ["recursive functions in C", "recursion vs iteration", "recursion trees",
     "tail recursion", "recursion with arrays and strings",
     "termination: base case and its reachability",
     "the call stack, frames and unwinding",
     "calls against peak depth",
     "storage class and pointers inside a recursion",
     "cost recurrences for a recursion"],
    prereq=["C fundamentals", "pointers in C"],
    related=["recurrence relations", "divide and conquer", "trees"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'Recursion'. " + SYL.replace(
        "Section 1: Engineering Mathematics, Discrete Mathematics",
        "Section 4: Programming and Data Structures"),
    difficulty="medium",
    status="PUBLISHED",
    slug="recursion",
    path="topics/recursion/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "a recursive definition: smaller copy plus a base case",
        "two obligations: the argument moves, the base case is on the path",
        "no syntax marks a function as recursive in C",
        "one frame per call: own parameters, own locals, own return address",
        "nothing is computed on the way down; values combine on the way up",
        "sumTo(3): 4 calls, 4 frames, returns 0, 1, 3, 6",
        "fact(n) and sumTo(n): calls = depth = n+1",
        "naive fib(n): calls = 2F(n+1)-1, depth = n",
        "fib(10) = 177 calls at depth 10; fib(30) = 2692537 calls at depth 30",
        "GATE 2015 Set 2 fun(5) = 51, and its call count 3^(n-1) = 81",
        "the loop bound k < n excludes the k = n term",
        "x starts at 1, so the leading 1 is part of the answer",
        "GATE 2021 Set 2 SomeFunction is gcd by repeated subtraction; 15",
        "GATE 2011 foo(n, r) is the base-r digit sum; foo(513,2) = 2",
        "integer division is what makes the digit recursion terminate",
        "GATE 2014 Set 2 tolerance base case; official range 1.72 to 1.74",
        "the update x/2 + 1.5/x is Newton's step for x*x = 3",
        "a fixed point answers 'for which q does f(q) return q'",
        "abs() takes an int in C, so the snippet is answered as mathematics",
        "missing base case: stack exhaustion, undefined behaviour in C",
        "unreachable base case: f(n) = f(n-2) with base n == 1 misses even n",
        "a test placed after the recursive call can never stop the descent",
        "tail position: no work left after the call",
        "the C standard does not require tail call optimisation",
        "accumulator, loop and plain recursion agree on 1..n",
        "static local inside a recursion is one object shared by all frames",
        "array parameter is a pointer, so every frame writes one array",
        "a local array inside the function is a fresh copy per frame",
        "returning the address of an automatic local dangles",
        "two calls in one expression have no defined evaluation order",
        "T(n) = T(n-1) + 1 gives n+1 calls; T(n) = 2T(n/2) + n gives n log2 n + n",
        "g(n) = 2g(n/2) makes 2n-1 calls at depth 1 + log2 n",
        "a print on both sides of a recursive call gives 3 2 1 1 2 3",
        "value question and cost question are two computations over one tree",
    ]))

topics.append(topic(
    "Programming and Data Structures", "Data structures", "Arrays, stacks and queues",
    ["array storage and indexing", "two-dimensional arrays: row-major and column-major",
     "bounds, decay and sizeof in C",
     "stacks and their applications", "postfix evaluation and infix to postfix",
     "reachable stack permutations",
     "queues, circular queues, deques", "implementation trade-offs",
     "one structure built from another, and their costs"],
    prereq=["C fundamentals", "pointers in C"],
    related=["linked lists", "graph traversals", "trees and heaps", "compiler design"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'Arrays, stacks, queues' inside Programming and Data "
             "Structures. Five previous-year questions are worked in the lesson (1994 Q1.14, "
             "1998 Q2.14, 2007 Q38, 2012 Q35, 2015 Set 3 Q12). Past frequency is an observation "
             "about old papers, not a prediction.",
    difficulty="easy-medium",
    status="PUBLISHED",
    slug="arrays-stacks-queues",
    path="topics/arrays-stacks-queues/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "an array is one contiguous block plus index arithmetic; nothing stores the index",
        "address of a[i] = base + (i - L) * w, with w the size of the element type",
        "a[i] is defined as *(a+i), so indexing is pointer arithmetic plus a dereference",
        "random access is O(1); insert or delete in the middle is O(n) shifts",
        "row-major: the second index varies fastest, so the multiplier is the number of columns",
        "column-major: the first index varies fastest, so the multiplier is the number of rows",
        "the two orders agree exactly when one dimension has length 1",
        "GATE 1998: A[1..10][1..15], w=1, base 100, row-major gives 15i + j + 84",
        "C does not check bounds; a[n] on T a[n] compiles and is undefined behaviour",
        "a[-1] is undefined for the same reason: the pointer leaves the object",
        "an array name decays to a pointer except under sizeof, unary &, and string initialisation",
        "sizeof inside a callee measures a pointer, so the length must be passed",
        "a stack is LIFO: one insertion end, one deletion end, the same end",
        "on an array: top = -1, push writes a[++top], pop reads a[top--]",
        "empty is top == -1 and full is top == N-1; capacity N holds N elements",
        "overflow and underflow belong to the array implementation, not to the ADT",
        "postfix places each operator after its operands, so no precedence rules are needed",
        "the first pop is the right operand; only minus and divide expose an order error",
        "GATE 2015 Set 3: 10 5 + 60 6 / * 8 - is 142",
        "GATE 2007: after the first * the top two are 6 and 1, not the final value 2",
        "infix to postfix by a precedence stack, and a bracket matcher as the minimal stack use",
        "reachability: push until the wanted element is on top, then pop; if it is buried, reject",
        "GATE 1994: of the four orders only 3,4,5,2,1 is reachable",
        "3, 1, 2 is impossible: it contains the pattern 312",
        "the number of reachable orders is Catalan C(n) = (2n)!/((n+1)! n!)",
        "a queue is FIFO: insertion at the rear, deletion at the front",
        "a linear array queue drifts: rear reaches the end while front cells are unusable",
        "circular queue: rear = (rear+1) mod N, and front the same",
        "front == rear means both empty and full once every cell may be filled",
        "sacrifice convention: empty front == rear, full (rear+1) mod N == front, capacity N-1",
        "count convention: empty count == 0, full count == N, capacity N",
        "count = (rear - front + N) mod N under the sacrifice convention",
        "GATE 2012: capacity n-1 in an array of n gives the sacrifice pair, answer A",
        "queue from two stacks: pour only when the output stack is empty",
        "that queue is amortised O(1) because each element crosses at most once",
        "stack from two queues: every pop is Theta(n); there is no amortisation",
        "two stacks in one array: overflow exactly when top1 + 1 == top2, holding all N",
    ]))

topics.append(topic(
    "Programming and Data Structures", "Data structures", "Linked lists",
    ["singly and doubly linked lists", "insertion and deletion",
     "the head pointer and pointer surgery",
     "cost trade-offs against arrays",
     "circular lists", "reversal and merging", "cycle detection"],
    prereq=["pointers in C", "arrays, stacks and queues"],
    related=["stacks and queues", "trees", "recursion"],
    importance="high",
    evidence="GATE 2027 Section 4 names 'linked lists'. Eight previous-year questions are worked in the lesson (1997 Q1.4, 1998 Q19a, 2003, 2004 Q36, 2010 Q36, 2016 Set 2 Q15, 2017 Set 1 Q08, 2022 Q05, 2023 Q03, plus GATE IT 2004). Past frequency is an observation about old papers, not a prediction.",
    difficulty="medium",
    status="PUBLISHED",
    slug="linked-lists",
    path="topics/linked-lists/index.html",
    execution="published 2026-10-26",
    microtopics=[
        "a node holds a value and the address of the next node; a link is an address, not an index",
        "index arithmetic is replaced by a stored address, so access becomes O(k) instead of O(1)",
        "the list is not an object: it is the head pointer plus the chain that pointer reaches",
        "struct node may contain struct node * because the pointer needs only the name, not the complete type",
        "NULL terminates the list; the empty list is head == NULL and dereferencing NULL is undefined behaviour",
        "sizeof(struct node) includes padding, so it is not the sum of the members",
        "no length is stored: counting costs a walk, or a separate count every mutation must maintain",
        "insert after p: x->next = p->next; p->next = x — two writes, and the order is mandatory",
        "writing p->next = x first makes the old successor unreachable: a leak, not a compile error",
        "GATE 1998 Q19a: q = p->next; p->next = q->next; q->next = (q->next)->next; (p->next)->next = q swaps the two nodes after p",
        "the fourth line reads (p->next)->next, whose target has already changed by then",
        "delete after p is one write, but the victim must be saved before it is unlinked",
        "inserting at the front changes the head; a by-value head parameter cannot report it",
        "three repairs: return the new head, take node **, or use a dummy header node",
        "GATE 2010 Q36: q->next = NULL; p->next = head; head = p — detach, attach, then move",
        "reach element k: O(1) array, O(k) list",
        "a sorted linked list cannot be binary-searched: the middle is only reachable by a walk",
        "insert at position k is O(n) in both, for different reasons: shifting against walking",
        "delete the node you were given: O(n) singly, O(1) doubly — GATE 2023 Q03, GATE IT 2004",
        "the copy-the-successor trick is O(1) for interior nodes and has no move for the last node, so the worst case stays O(n)",
        "the trick also changes which node object survives, so other pointers to it silently see different data",
        "doubly linked invariant: b->next->prev == b and b->prev->next == b",
        "a doubly linked splice in the middle writes four fields; a singly linked one writes two",
        "deleting x from a pointer to x: x->prev->next = x->next; x->next->prev = x->prev — two writes, no walk",
        "GATE 2016 Set 2 Q15: the decrease-key term dominates, because restoring sorted order is a walk, giving O(N^2)",
        "a circular list has no NULL; a traversal needs a supplied count or a saved starting node",
        "GATE 2004 Q36: point the single pointer at the rear, so the front is one link away and both operations are O(1)",
        "pointing at the front instead makes enqueue walk the whole ring",
        "GATE 1997 Q1.4: concatenation in O(1) needs the tail without a walk — circular doubly linked, head->prev, four writes",
        "reversal uses three cursors; next must be saved before curr->next is overwritten",
        "reversal writes exactly n links in n steps: Theta(n) time, O(1) extra space — GATE 2022 Q05",
        "the recursive reversal is Theta(n) time but Theta(n) space, so it does not answer an O(1)-space question",
        "merging two sorted lists relinks existing nodes and needs at most n1 + n2 - 1 comparisons",
        "cycle detection: tortoise one link, hare two; meeting proves a cycle, the hare reaching NULL disproves it",
        "with the cycle entering after mu links and repeating every lambda, they meet within mu + lambda steps",
        "the meeting node is not the entry node; a second phase with one cursor restarted at the head finds it",
        "GATE 2017 Set 1 Q08: a valid NULL-terminated list may be empty, so join may dereference NULL",
        "GATE 2003: f(p) returns 1 exactly when the list is non-decreasing",
        "inserting n keys into a sorted list costs n(n-1)/2 comparisons, so the total is quadratic (GATE 2020)",
    ]))

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

# ---------------------------------------------------------------- preservation
# The tracker is regenerated from this file, so anything an earlier run recorded
# about a published lesson must survive regeneration. Without this step, running
# the script silently resets a published lesson to NOT_STARTED and drops the
# microtopics that run verified.
import os
PRESERVE = ("coverage_status", "lesson_slug", "repo_path", "last_execution_status",
            "microtopics", "coverage_note")
if os.path.exists("syllabus-coverage.json"):
    try:
        with open("syllabus-coverage.json") as f:
            _old = json.load(f)
        _old_by_key = {(t["subject"], t["topic"]): t for t in _old.get("topics", [])}
        for _t in topics:
            _o = _old_by_key.get((_t["subject"], _t["topic"]))
            if not _o:
                continue
            if _o.get("coverage_status") in ("PUBLISHED", "NEEDS_REVIEW"):
                for _k in PRESERVE:
                    if _o.get(_k):
                        _t[_k] = _o[_k]
    except Exception as _e:
        print("warning: could not merge the existing tracker:", _e)

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
