/* ==========================================================================
   fsm-state-minimisation — THE timeline.
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
      id: 'why',
      n: 1,
      title: 'Two states that behave the same are one state',
      start: 0, end: 30,
      objective: 'See that a state is only what it does, so two states with the same behaviour can be merged without changing anything observable.'
    },
    {
      id: 'definition',
      n: 2,
      title: 'Equivalence, stated for every input string',
      start: 30, end: 60,
      objective: 'State the definition of equivalent states and see why it quantifies over every string, not over one row of the table.'
    },
    {
      id: 'p0',
      n: 3,
      title: 'P0: bucket the states by their outputs',
      start: 60, end: 90,
      objective: 'Build the first partition from the output vector of each state, which is the one thing a single input can distinguish.'
    },
    {
      id: 'refine',
      n: 4,
      title: 'The refinement step',
      start: 90, end: 120,
      objective: 'Split a class when two of its states move to different classes on the same input, using the 2025 paper machine.'
    },
    {
      id: 'iterate',
      n: 5,
      title: 'Iterate until nothing splits',
      start: 120, end: 150,
      objective: 'Run the passes on a machine that needs more than one, and see what stopping early gets wrong.'
    },
    {
      id: 'reduced',
      n: 6,
      title: 'The minimal machine, and the proof it behaves the same',
      start: 150, end: 180,
      objective: 'Read the reduced table off the stable partition and check it against the original on every input string up to length eight.'
    },
    {
      id: 'hardware',
      n: 7,
      title: 'What minimisation actually saves',
      start: 180, end: 210,
      objective: 'Compute the flip-flop count before and after, and see that fewer states do not always mean fewer flip-flops.'
    },
    {
      id: 'moore',
      n: 8,
      title: 'Moore against Mealy, and the machines this does not cover',
      start: 210, end: 240,
      objective: 'Apply the same algorithm to a Moore machine, and see why the same behaviour can need different state counts.'
    },
    {
      id: 'gate',
      n: 9,
      title: 'The three question shapes',
      start: 240, end: 270,
      objective: 'Recognise what the paper is asking for, and the three checks that catch a wrong answer in each shape.'
    },
    {
      id: 'procedure',
      n: 10,
      title: 'The procedure and the traps',
      start: 270, end: 300,
      objective: 'Write the four-line procedure down once and name the five traps that survive a careless check.'
    }
  ],

  events: [
    /* ---------------- scene 1: why ---------------- */
    {
      id: 's1-1', scene: 'why', start: 0, end: 7.5,
      caption: 'A state is not a thing. It is a promise about what happens next.',
      detail: 'A state has no content of its own. Everything a learner can observe about a state is the sequence of outputs that follows it, for each sequence of inputs. Two states that make the same promise are indistinguishable from outside.',
      narration: 'Here is the idea the whole lesson rests on. A state is not a thing. It is a promise about what happens next. If two states keep exactly the same promise, no experiment can tell them apart.',
      keyword: 'a promise about what happens next',
      trap: 'Treating a state as a name. The letter A is a label, not a behaviour, and two different letters can be the same behaviour.'
    },
    {
      id: 's1-2', scene: 'why', start: 7.5, end: 15,
      caption: 'Two states whose rows are identical: merge them and nothing changes.',
      detail: 'On the left, states P and Q both go to R on input 0 and to R on input 1, and both print the same output on each input. Every future observation is identical, so one state can replace the other.',
      narration: 'The easy case first. P and Q both go to R on zero and to R on one, and both print the same outputs. Every row is the same. Merge them into one state and the machine does exactly what it did before.',
      keyword: 'identical rows',
      trap: 'Identical rows are sufficient for a merge, but they are not necessary. The hard case is two states with different rows that are still equivalent.'
    },
    {
      id: 's1-3', scene: 'why', start: 15, end: 22.5,
      caption: 'Feed both states the same strings and compare the output sequences.',
      detail: 'The table on the right runs four input strings through P and through Q. The empty string, 0, 1, 01 and 10 all produce the same output sequence from both states. Agreement on these strings is evidence; agreement on every string is the definition.',
      narration: 'You can check the promise by experiment. Give both states the same input strings and compare the outputs they print. Here every string agrees. That is evidence. The definition needs agreement on every string there is, and the next scene says how to get it without testing them all.',
      keyword: 'every string',
      trap: 'Testing a handful of strings and concluding equivalence. No finite list of tests proves equivalence; only the algorithm does.'
    },
    {
      id: 's1-4', scene: 'why', start: 22.5, end: 30,
      caption: 'So the question is: which states make the same promise? That is a partition.',
      detail: 'The answer to the question is a grouping of the states into classes, where two states share a class exactly when they are equivalent. That grouping is called a partition, and the rest of the lesson computes it.',
      narration: 'So the question becomes: which states make the same promise? The answer is a grouping, where two states sit together exactly when they are equivalent. A grouping of a set into non-empty classes with no state in two classes is called a partition, and the whole lesson is about computing one.',
      keyword: 'partition',
      trap: 'A merge that puts three states in a class when only two are equivalent. The partition must be exact, not generous.'
    },

    /* ---------------- scene 2: definition ---------------- */
    {
      id: 's2-1', scene: 'definition', start: 30, end: 37.5,
      caption: 'Definition: p and q are equivalent when every input string produces the same output sequence from both.',
      detail: 'Two states p and q of a Mealy machine are equivalent when, for every input string w, the output sequence produced starting from p equals the output sequence produced starting from q. Written with a symbol, p is equivalent to q exactly when output of p on w equals output of q on w for all w.',
      narration: 'The definition, in one sentence. Two states are equivalent when every input string produces the same output sequence from both. Not one string, not a sample of strings. Every string.',
      keyword: 'every input string',
      trap: 'Reading the definition as "same output on one input". One input is the first test, never the whole test.'
    },
    {
      id: 's2-2', scene: 'definition', start: 37.5, end: 45,
      caption: 'GATE CSE 1996 Q2.23: states B and C have different next states, yet they are equivalent.',
      detail: 'In the 1996 machine, B goes to A on 0 and to C on 1, while C goes to A on 0 and to B on 1. The rows are different. Every output is still the same for every string, so B and C are one state.',
      narration: 'Here is the machine from GATE 1996. Look at B and C. On zero both go to A. On one, B goes to C and C goes to B. The rows differ, so a row comparison says these are different states. The definition says otherwise.',
      keyword: 'different next states',
      trap: 'Comparing rows and stopping there. This pair is the standard counterexample, and the answer key counts three states, not four.'
    },
    {
      id: 's2-3', scene: 'definition', start: 45, end: 52.5,
      caption: 'All 511 input strings up to length eight give identical outputs from B and from C.',
      detail: 'The page runs every input string of length zero to eight through both states. There are 511 such strings over a two-letter alphabet, and B and C agree on all of them. The exact pair search then proves they agree on every string, including the longer ones.',
      narration: 'The page runs every input string up to length eight through both states. That is five hundred and eleven strings, and B and C agree on all of them. A finite test is still only evidence, so the page also runs the exact pair search, which decides equivalence for every string at once.',
      keyword: '511 strings',
      trap: 'Believing a finite test is a proof. It is a check on the model, and the proof is the pair search.'
    },
    {
      id: 's2-4', scene: 'definition', start: 52.5, end: 60,
      caption: 'A and B are separated by the string 00. A single witness is all it takes to prove two states differ.',
      detail: 'States A and B of the 1996 machine both print 0 on input 0, so the first test does not separate them. On the string 00 the outputs differ. One string that separates two states is called a distinguishing string, and one witness settles the pair forever.',
      narration: 'The other direction is cheap. To prove two states are different you only need one string that separates them. A and B agree on zero, but on zero-zero their outputs differ. That string is called a distinguishing string, and one witness is a complete proof of difference.',
      keyword: 'distinguishing string',
      trap: 'A witness that only shows the states are different on that string does not show which pairs are equivalent. Both directions are needed.'
    },

    /* ---------------- scene 3: p0 ---------------- */
    {
      id: 's3-1', scene: 'p0', start: 60, end: 67.5,
      caption: 'The 2025 paper machine: eight states, one input X, one output f.',
      detail: 'GATE CSE 2025 Set 1 Question 59 gives an eight-state machine with one input X and one output f, as a table with a next state and an output for each input. The question asks for the minimum number of states required to realise it.',
      narration: 'Now the machine from GATE 2025, Set one, question fifty-nine. Eight states, A to H, one input X, one output f. The question asks for the minimum number of states needed to realise it. That is a state minimisation question, and the answer is a partition.',
      keyword: 'eight states',
      trap: 'Assuming the answer is eight because eight states are listed. Every such question is asking you to remove some.'
    },
    {
      id: 's3-2', scene: 'p0', start: 67.5, end: 75,
      caption: 'Start from outputs: one input can only distinguish states whose output on that input differs.',
      detail: 'If two states print different outputs on the same input, a string of length one separates them. So the finest partition that can possibly be right is the one grouping states by their output vector, which for two inputs is the pair of outputs on 0 and on 1.',
      narration: 'The first partition comes free. If two states print different outputs on the same input, then a one-letter string already separates them, and they can never be merged. So group the states by their output vector. That grouping is the coarsest partition that is certainly correct, and every later step only splits it further.',
      keyword: 'output vector',
      trap: 'Splitting first by next states. Outputs are the only thing a length-one string can see, so the first partition must be by outputs.'
    },
    {
      id: 's3-3', scene: 'p0', start: 75, end: 82.5,
      caption: 'Four output vectors, so four classes: {A,B,C,E} with 00, {D,H} with 10, {G} with 01, {F} with 11.',
      detail: 'A, B, C and E all print 0 on both inputs. D and H print 1 on zero and 0 on one. G prints 0 on zero and 1 on one. F prints 1 on both. That is four classes, so eight states are already down to at most four states before any refinement.',
      narration: 'Four different output pairs, so four classes. A, B, C and E all print zero and zero. D and H print one and zero. G prints zero and one. F prints one and one. Eight states are now at most four states, and the next step decides whether the big class splits.',
      keyword: 'four classes',
      trap: 'Counting four classes and answering four. The big class can still split, and it does.'
    },
    {
      id: 's3-4', scene: 'p0', start: 82.5, end: 90,
      caption: 'This is P0. Its classes are the 1-equivalent states: those no single input can tell apart.',
      detail: 'The partition built from outputs is written P0, and its classes are called the 1-equivalent classes because every pair inside a class agrees on every string of length at most one. Refinement will produce P1, P2 and so on, whose classes agree on longer and longer strings.',
      narration: 'This partition is called P-zero, and its classes are the one-equivalent classes: no single input tells two members apart. The refinement step will build P-one, then P-two, where the classes agree on longer and longer strings. The sequence only ever gets finer.',
      keyword: '1-equivalent',
      trap: 'Thinking P0 is the answer when it is only the starting point. It is correct only for machines where nothing more can be learned.'
    },

    /* ---------------- scene 4: refine ---------------- */
    {
      id: 's4-1', scene: 'refine', start: 90, end: 97.5,
      caption: 'Take the class {A,B,C,E} and look where each member goes on each input.',
      detail: 'A refinement pass examines each class separately. For the class containing A, B, C and E, write down the next state of each member on input 0 and on input 1, and then replace each next state by the class it belongs to.',
      narration: 'Now the one real step of the algorithm. Take the class holding A, B, C and E. For each member, write where it goes on zero and where it goes on one. Then replace each of those next states by the class it sits in. What matters is not the state, but the class of the state.',
      keyword: 'the class of the state',
      trap: 'Comparing next states instead of their classes. Two different next states in the same class are equivalent, so they must not separate a class.'
    },
    {
      id: 's4-2', scene: 'refine', start: 97.5, end: 105,
      caption: 'A and C go to F and B; B and E go to D and C. Different class vectors, so the class splits.',
      detail: 'A goes to F on 0 and B on 1, which is the class of F then the class of the big class. C goes to F and E, the same class vector. B goes to D and C, and E goes to D and C, a different class vector. So the class splits into two.',
      narration: 'A and C both go to F and then into the big class. B and E both go to D and C, which is a different pattern of classes. So the four states divide into A with C, and B with E. The other classes are unchanged: D and H both go to G and A, and single states cannot split.',
      keyword: 'class vector',
      trap: 'Splitting a class because two members differ on the state they reach, when those two states are in the same class. Read the class, not the label.'
    },
    {
      id: 's4-3', scene: 'refine', start: 105, end: 112.5,
      caption: 'The rule: two states stay together only if, for every input, their next states lie in the same class.',
      detail: 'This is the whole refinement rule. States p and q in one class stay together when for every input a, the next states of p and q on a belong to the same class of the current partition. If some input sends them to different classes, they separate.',
      narration: 'That is the rule, and it is worth saying slowly. Two states stay together only if, for every input, their next states land in the same class. If any input sends them to different classes, they separate. This is the only test in the algorithm.',
      keyword: 'for every input',
      trap: 'Applying the test to one input only. Every input must agree, and one disagreement is enough to split.'
    },
    {
      id: 's4-4', scene: 'refine', start: 112.5, end: 120,
      caption: 'Here the partition stabilises after one pass: five classes, so five states.',
      detail: 'On the 2025 machine the second pass changes nothing, so the stable partition is five classes. The paper answer is five states, and the exact pair search on this page independently produces the same five classes.',
      narration: 'On this machine one pass is enough. The second pass changes nothing, so the partition is stable at five classes. The answer to the paper question is five states, and the exact pair search in this page independently arrives at the same five classes.',
      keyword: 'stabilises after one pass',
      trap: 'Generalising from this machine. One pass is enough here by luck, and the next scene shows a machine where it is not.'
    },

    /* ---------------- scene 5: iterate ---------------- */
    {
      id: 's5-1', scene: 'iterate', start: 120, end: 127.5,
      caption: 'A machine built to need more than one pass: two chains that converge on the same state.',
      detail: 'This machine is a Moore machine with two inputs. One chain runs A0 to A1 to A2 to A3, and A3 is the only state whose output is 1. A second chain runs B0 to B1 to B2, and B2 also goes to A3. Input 1 returns every state to A0.',
      narration: 'Here is a machine built to punish a single pass. Two chains run forward. The first reaches A3, the only state that prints one. The second, from B0 through B1 and B2, also ends at A3. Input one sends everything back to A0. The two chains look different and are the same.',
      keyword: 'two chains that converge',
      trap: 'Assuming a machine with more states needs more passes. The pass count depends on the longest distinguishing string, not on the state count.'
    },
    {
      id: 's5-2', scene: 'iterate', start: 127.5, end: 135,
      caption: 'P0 has two classes; one pass gives three; the second pass gives four and stops.',
      detail: 'P0 groups the six output-0 states together and A3 alone. The first pass separates A2 and B2 from the rest, because they reach A3. The second pass separates A1 and B1 from A0 and B0. The third pass changes nothing.',
      narration: 'P-zero has two classes. The first pass separates A2 and B2, which reach the one-output state in one step. The second pass separates A1 and B1 from A0 and B0. The third pass changes nothing, so the partition is stable at four classes.',
      keyword: 'two passes',
      trap: 'Reporting three states after one pass. The true answer here is four, and the missing class is exactly the pair the second pass finds.'
    },
    {
      id: 's5-3', scene: 'iterate', start: 135, end: 142.5,
      caption: 'Stopping early under-counts. Here it claims three states where the answer is four.',
      detail: 'Every pass only splits, so the class count only rises. A partition that has not stabilised is too coarse, so it merges states that are not equivalent. Stopping early therefore always under-counts, never over-counts.',
      narration: 'Stopping early always errs in one direction. Each pass only splits, so the class count only goes up. A partition that has not stabilised is too coarse, and too coarse means it has merged states that are not equivalent. So an early stop under-counts, and here it would claim three states where the answer is four.',
      keyword: 'under-counts',
      trap: 'Stopping when the count stops changing for one pass. Stop when a whole pass makes no change, not when one class looks settled.'
    },
    {
      id: 's5-4', scene: 'iterate', start: 142.5, end: 150,
      caption: 'The number of passes equals the longest shortest distinguishing string, minus one.',
      detail: 'On this machine the longest shortest distinguishing string has length three, and two passes were needed. On the 2025 machine the longest is length two, and one pass was needed. Each pass lengthens the strings the partition can see by one.',
      narration: 'There is a clean relation. Each pass lengthens, by one, the strings the partition can distinguish. So the number of passes equals the longest shortest distinguishing string minus one. Here that longest string has length three, so two passes. On the 2025 machine it has length two, so one pass.',
      keyword: 'longest shortest distinguishing string',
      trap: 'No upper bound is needed in practice, but if you want one: each pass either changes nothing or adds at least one class, and there are at most n classes, so at most n minus one passes for n states.'
    },

    /* ---------------- scene 6: reduced ---------------- */
    {
      id: 's6-1', scene: 'reduced', start: 150, end: 157.5,
      caption: 'One state per class: {A,C}, {B,E}, {D,H}, {F}, {G}. The reduced table has five rows.',
      detail: 'The reduced machine has one state per class of the stable partition. Its next-state entry for a class and an input is the class containing the original next state. Its output is the output of any member, which is well defined because all members agree.',
      narration: 'The reduced machine has one state per class. Its next-state entry is the class of the original next state, and its output is the output of any member of the class. That is well defined, because the partition was built so that all members agree on outputs and on where they go.',
      keyword: 'one state per class',
      trap: 'Writing the next state as a member of the class instead of the class itself. The reduced table has no A in it any more.'
    },
    {
      id: 's6-2', scene: 'reduced', start: 157.5, end: 165,
      caption: 'The reduced table is well defined: every member of a class produces the same output and lands in one class.',
      detail: 'Well-definedness is not a hope, it is a check. For each class and each input, the page verifies that every member produces the same output and that every member lands in the same class. That is what makes the reduced table a table at all.',
      narration: 'A reduced table is only meaningful if it is well defined, and that is a check rather than a hope. For every class and every input, the page verifies that all members print the same output and all members land in one class. If that failed, the partition would not have been stable.',
      keyword: 'well defined',
      trap: 'Assuming any grouping gives a valid reduced table. Only a stable partition does, and that is exactly what the check tests.'
    },
    {
      id: 's6-3', scene: 'reduced', start: 165, end: 172.5,
      caption: '4,088 string evaluations against the original: no mismatch anywhere.',
      detail: 'The page runs every input string up to length eight from every state of the original machine, and compares with the reduced machine from the corresponding class. That is eight states times 511 strings, 4,088 evaluations, and none differs.',
      narration: 'Then the check that matters. Every input string up to length eight is run from every state of the original, and the output sequence is compared with the reduced machine starting from that state class. That is four thousand and eighty-eight comparisons, and not one differs.',
      keyword: 'no mismatch',
      trap: 'Comparing only the first output. The sequences must match for the whole string, not just the first symbol.'
    },
    {
      id: 's6-4', scene: 'reduced', start: 172.5, end: 180,
      caption: 'The minimal machine is unique up to renaming: the partition is the equivalence relation, and it is forced.',
      detail: 'There is exactly one coarsest correct partition, so the minimal machine is unique once the state names are forgotten. Two independent computations agree on it here: the refinement passes, and an exact pair search that decides equivalence for each of the 28 pairs of states.',
      narration: 'And the answer is unique. There is one coarsest correct partition, so the minimal machine is unique up to renaming its states. Two independent computations agree: the refinement passes, and an exact pair search over all twenty-eight pairs of states.',
      keyword: 'unique up to renaming',
      trap: 'Believing a different minimal machine exists. Any two minimal machines for the same behaviour are isomorphic.'
    },

    /* ---------------- scene 7: hardware ---------------- */
    {
      id: 's7-1', scene: 'hardware', start: 180, end: 187.5,
      caption: 'n states need the ceiling of log base 2 of n flip-flops.',
      detail: 'A machine with n states needs enough flip-flops to hold n distinct encodings. With k flip-flops there are 2 to the k encodings, so k is the ceiling of log base 2 of n. This is the only link between the state count and the hardware.',
      narration: 'Now what the reduction buys. A machine with n states needs enough flip-flops to hold n different encodings. With k flip-flops there are two to the k encodings, so k is the ceiling of log base two of n. That step function is the whole story.',
      keyword: 'ceiling of log base 2',
      trap: 'Using log base 2 without the ceiling. Five states need three flip-flops, not two point three two.'
    },
    {
      id: 's7-2', scene: 'hardware', start: 187.5, end: 195,
      caption: 'Eight states to five states: three flip-flops to three flip-flops. Nothing saved.',
      detail: 'Both eight and five lie between four and eight, so both need three flip-flops. On the 2025 machine the state count falls by three and the flip-flop count does not fall at all. The saving is in the table and the logic, not in the registers.',
      narration: 'Here is the surprise. Eight states need three flip-flops. Five states also need three flip-flops, because four is the largest power of two below five. So this reduction removes three states and saves no flip-flop at all.',
      keyword: 'no flip-flop saved',
      trap: 'Claiming a hardware saving from a state reduction that does not cross a power of two. Check the ceiling before you claim it.'
    },
    {
      id: 's7-3', scene: 'hardware', start: 195, end: 202.5,
      caption: 'The table does shrink: sixteen transitions become ten, and every row is a row of logic.',
      detail: 'The original machine has eight states and two inputs, so sixteen next-state entries and sixteen output entries. The reduced machine has five states and two inputs, so ten of each. That is what the next-state logic sees, and it shrinks whether or not a flip-flop is saved.',
      narration: 'What always shrinks is the table. Sixteen next-state entries become ten, and the same for outputs. Every entry is a row the next-state logic must implement, so the reduction is real even when the register count does not move.',
      keyword: 'sixteen to ten',
      trap: 'Judging a reduction by flip-flops alone. The combinational logic is usually the larger part of the saving.'
    },
    {
      id: 's7-4', scene: 'hardware', start: 202.5, end: 210,
      caption: 'The twin machine does save one: seven states to four, three flip-flops to two.',
      detail: 'Seven states need three flip-flops and four states need two, so that reduction crosses the power of two and saves a register. Whether a state reduction saves hardware is decided by the ceiling, not by how many states disappeared.',
      narration: 'The twin machine is the other case. Seven states need three flip-flops. Four states need two. That reduction crosses a power of two and saves a register. So whether a reduction saves hardware is decided by the ceiling, not by how many states disappeared.',
      keyword: 'crosses a power of two',
      trap: 'Reporting a saved flip-flop whenever states disappear. It is the ceiling that decides.'
    },

    /* ---------------- scene 8: moore ---------------- */
    {
      id: 's8-1', scene: 'moore', start: 210, end: 217.5,
      caption: 'A Moore machine prints from the state. P0 is then built from each state\'s own output.',
      detail: 'In a Moore machine the output depends on the state alone, so the output vector of a state is a single bit. The first partition groups states by that bit, and every later step is identical to the Mealy case.',
      narration: 'Everything so far assumed a Mealy machine, where the output sits on the transition. In a Moore machine the output sits on the state. The first partition then groups states by their single output bit, and every later step is exactly the same.',
      keyword: 'output sits on the state',
      trap: 'Using the Mealy rule for P0 on a Moore machine. With one bit per state the first partition has at most two classes.'
    },
    {
      id: 's8-2', scene: 'moore', start: 217.5, end: 225,
      caption: 'The same behaviour, detect 11: two states as a Mealy machine, three as a Moore machine.',
      detail: 'A Mealy machine detecting two consecutive ones needs two states, because the output can be printed on the transition into the second one. A Moore machine needs three, because the output must sit on a state and the third state is the only one that can carry a one.',
      narration: 'Here is a fact worth carrying into the exam. Detect two consecutive ones. As a Mealy machine, two states are enough, because the output can be printed on the transition that sees the second one. As a Moore machine, three states are needed, because the output must live on a state.',
      keyword: 'two against three',
      trap: 'Answering a minimum-state question without noticing whether the machine is Moore or Mealy. The same behaviour has different minima.'
    },
    {
      id: 's8-3', scene: 'moore', start: 225, end: 232.5,
      caption: 'Both of those machines are already minimal: partition refinement changes neither.',
      detail: 'The page runs the same refinement on both detectors and neither splits. That is the point: two is minimal for the Mealy version and three is minimal for the Moore version, so the gap is a property of the machine type, not of a missed merge.',
      narration: 'And neither of those numbers is a mistake. The page runs the same refinement on both, and neither machine splits. Two is minimal for the Mealy version, three is minimal for the Moore version. The gap comes from the machine type, not from a missed merge.',
      keyword: 'already minimal',
      trap: 'Trying to reduce a Moore detector to the Mealy count. The output placement forbids it.'
    },
    {
      id: 's8-4', scene: 'moore', start: 232.5, end: 240,
      caption: 'One boundary: an incompletely specified machine is not decided by partition refinement.',
      detail: 'When some next state or output is a don\'t-care, states are not equivalent or inequivalent but compatible, and compatibility is not transitive. Merging then needs a maximal compatible set, which is a different and harder problem. GATE has asked the completely specified case.',
      narration: 'One honest boundary. If some entries of the table are don\'t-cares, states are no longer equivalent or inequivalent. They are compatible, and compatibility is not transitive, so a partition cannot even represent the answer. That case needs maximal compatible sets. Every paper question in this family I could verify is completely specified.',
      keyword: 'compatible is not transitive',
      trap: 'Applying partition refinement to a table with don\'t-cares. The classes it produces need not be mergeable sets.'
    },

    /* ---------------- scene 9: gate ---------------- */
    {
      id: 's9-1', scene: 'gate', start: 240, end: 247.5,
      caption: 'Shape 1: "minimum number of states required" is a NAT, and the answer is the class count.',
      detail: 'The commonest shape, seen as GATE CSE 2025 Set 1 Question 59: a table is given and the minimum number of states is asked. Run refinement to stability and count the classes. The answer is an integer, and it is at most the number of rows given.',
      narration: 'First shape, and the commonest. A table is given, and the minimum number of states is asked. Run the passes until nothing splits, and count the classes. The answer is an integer no larger than the number of rows you were given, and that bound is a one-second check.',
      keyword: 'count the classes',
      trap: 'Answering more states than the table had. A reduction cannot create states.'
    },
    {
      id: 's9-2', scene: 'gate', start: 247.5, end: 255,
      caption: 'Shape 2: "which states are equivalent" is an MCQ, and the answer is a class, not a pair.',
      detail: 'The second shape asks for the set of states that can be merged, or for the number of equivalent pairs. Read the classes off the stable partition. On the 2025 machine there are three equivalent pairs, A with C, B with E, and D with H, out of twenty-eight pairs in all.',
      narration: 'Second shape: which states are equivalent, or how many equivalent pairs there are. The answer is read off the stable partition. On the 2025 machine, three of the twenty-eight pairs are equivalent: A with C, B with E, and D with H. Every other pair is separated by some string.',
      keyword: 'three of twenty-eight pairs',
      trap: 'Giving a pair that is in the same class of an unstable partition. Only the stable partition answers this.'
    },
    {
      id: 's9-3', scene: 'gate', start: 255, end: 262.5,
      caption: 'Shape 3: design from a description, then minimise. The design is not the answer.',
      detail: 'The third shape gives a behavioural description and asks for the number of states of the machine, or of the minimum machine. Design first, which usually produces one state too many, then run refinement. The 1996 item is the pure form: four states given, three required.',
      narration: 'Third shape: design a machine from a description, and then the question asks for the number of states. Design first, and expect one state too many, then minimise. The 1996 item is the pure form of this: four states given, three required.',
      keyword: 'design, then minimise',
      trap: 'Stopping at the design. A designed machine is rarely minimal, and the question usually knows that.'
    },
    {
      id: 's9-4', scene: 'gate', start: 262.5, end: 270,
      caption: 'A check that costs one line: every state of the reduced machine must be reachable.',
      detail: 'A state that cannot be reached from the start state contributes nothing to the behaviour. On the twin machine only four of the seven states are reachable, and the reduced machine has exactly those four classes. If a question asks for the states of the machine, decide whether it means the table or the reachable part.',
      narration: 'One check before you answer. A state nobody can reach contributes nothing, so a machine with unreachable states has fewer states than its table suggests. On the twin machine only four of seven are reachable, and the reduced machine has exactly those four classes. Read the question for which one it wants.',
      keyword: 'reachable',
      trap: 'Counting unreachable states as if they were part of the machine, or deleting them when the question asked about the whole table.'
    },

    /* ---------------- scene 10: procedure ---------------- */
    {
      id: 's10-1', scene: 'procedure', start: 270, end: 277.5,
      caption: 'Four lines: output partition, then repeat the split rule until nothing changes, then count, then read the table.',
      detail: 'Line one: group the states by their output vector. Line two: for each class, replace each next state by its class and split where the class vectors differ. Line three: repeat until a whole pass changes nothing, and count the classes. Line four: read the reduced table off the classes.',
      narration: 'Four lines and the question is arithmetic. Group by outputs. Then repeatedly replace each next state by its class and split where those class vectors differ. Repeat until a whole pass changes nothing, and count the classes. Then read the reduced table off the classes.',
      keyword: 'group, split, repeat, read',
      trap: 'Skipping the repeat. The 2025 machine needs one pass, the twin machine needs two, and a paper can ask for either.'
    },
    {
      id: 's10-2', scene: 'procedure', start: 277.5, end: 285,
      caption: 'Trap one: comparing rows instead of classes. Trap two: stopping after one pass.',
      detail: 'Comparing rows is the commonest error, and the 1996 pair B and C is the counterexample: different rows, equivalent states. Stopping after one pass under-counts, and the twin machine is the counterexample: three classes instead of four.',
      narration: 'Two traps by sight. Comparing rows instead of classes, which the 1996 machine punishes, because B and C have different rows and are the same state. And stopping after one pass, which the twin machine punishes, because one pass gives three classes where the answer is four.',
      keyword: 'rows against classes',
      trap: 'Both errors produce a plausible integer that appears among the options.'
    },
    {
      id: 's10-3', scene: 'procedure', start: 285, end: 292.5,
      caption: 'Trap three: claiming a saved flip-flop. Trap four: mixing Moore and Mealy minima.',
      detail: 'Eight states to five saves no flip-flop, because both need three. And the minimum state count depends on whether the machine is Moore or Mealy, so a question that does not say has not been read carefully enough.',
      narration: 'Two more. Claiming a saved flip-flop when the reduction did not cross a power of two: eight to five saves nothing. And mixing Moore with Mealy: the same behaviour needs two states one way and three the other.',
      keyword: 'the ceiling, and the machine type',
      trap: 'A question that gives a Moore machine and an answer computed for Mealy, or the reverse.'
    },
    {
      id: 's10-4', scene: 'procedure', start: 292.5, end: 300,
      caption: 'Trap five: don\'t-cares. Then write the answer, and check it is at most the rows you were given.',
      detail: 'Partition refinement needs every entry specified. With don\'t-cares the right object is a maximal compatible set, which is a different problem. And the final check: the number of states cannot exceed the number of rows in the given table, and cannot be less than the number of classes P0 forces.',
      narration: 'And the last trap: don\'t-cares, which this algorithm does not handle. With all entries specified, write the answer and run one check. The state count cannot exceed the rows you were given, and it cannot be smaller than the classes the outputs already force.',
      keyword: 'between P0 and the table',
      trap: 'An answer below the number of distinct output vectors, or above the number of rows. Either one is wrong before any arithmetic.'
    }
  ]
};
