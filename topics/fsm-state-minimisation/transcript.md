# FSM State Minimisation: Equivalent States, Partition Refinement and the Minimum-State Machine — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/fsm-state-minimisation/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. Two states that behave the same are one state

*0:00 – 0:30 · objective: See that a state is only what it does, so two states with the same behaviour can be merged without changing anything observable.*

**0:00–0:07** — Here is the idea the whole lesson rests on. A state is not a thing. It is a promise about what happens next. If two states keep exactly the same promise, no experiment can tell them apart.

> Caption: A state is not a thing. It is a promise about what happens next.

Exam-trap caption mode adds: *Treating a state as a name. The letter A is a label, not a behaviour, and two different letters can be the same behaviour.*

**0:07–0:15** — The easy case first. P and Q both go to R on zero and to R on one, and both print the same outputs. Every row is the same. Merge them into one state and the machine does exactly what it did before.

> Caption: Two states whose rows are identical: merge them and nothing changes.

Exam-trap caption mode adds: *Identical rows are sufficient for a merge, but they are not necessary. The hard case is two states with different rows that are still equivalent.*

**0:15–0:22** — You can check the promise by experiment. Give both states the same input strings and compare the outputs they print. Here every string agrees. That is evidence. The definition needs agreement on every string there is, and the next scene says how to get it without testing them all.

> Caption: Feed both states the same strings and compare the output sequences.

Exam-trap caption mode adds: *Testing a handful of strings and concluding equivalence. No finite list of tests proves equivalence; only the algorithm does.*

**0:22–0:30** — So the question becomes: which states make the same promise? The answer is a grouping, where two states sit together exactly when they are equivalent. A grouping of a set into non-empty classes with no state in two classes is called a partition, and the whole lesson is about computing one.

> Caption: So the question is: which states make the same promise? That is a partition.

Exam-trap caption mode adds: *A merge that puts three states in a class when only two are equivalent. The partition must be exact, not generous.*

## Scene 2. Equivalence, stated for every input string

*0:30 – 1:00 · objective: State the definition of equivalent states and see why it quantifies over every string, not over one row of the table.*

**0:30–0:37** — The definition, in one sentence. Two states are equivalent when every input string produces the same output sequence from both. Not one string, not a sample of strings. Every string.

> Caption: Definition: p and q are equivalent when every input string produces the same output sequence from both.

Exam-trap caption mode adds: *Reading the definition as "same output on one input". One input is the first test, never the whole test.*

**0:37–0:45** — Here is the machine from GATE 1996. Look at B and C. On zero both go to A. On one, B goes to C and C goes to B. The rows differ, so a row comparison says these are different states. The definition says otherwise.

> Caption: GATE CSE 1996 Q2.23: states B and C have different next states, yet they are equivalent.

Exam-trap caption mode adds: *Comparing rows and stopping there. This pair is the standard counterexample, and the answer key counts three states, not four.*

**0:45–0:52** — The page runs every input string up to length eight through both states. That is five hundred and eleven strings, and B and C agree on all of them. A finite test is still only evidence, so the page also runs the exact pair search, which decides equivalence for every string at once.

> Caption: All 511 input strings up to length eight give identical outputs from B and from C.

Exam-trap caption mode adds: *Believing a finite test is a proof. It is a check on the model, and the proof is the pair search.*

**0:52–1:00** — The other direction is cheap. To prove two states are different you only need one string that separates them. A and B agree on zero, but on zero-zero their outputs differ. That string is called a distinguishing string, and one witness is a complete proof of difference.

> Caption: A and B are separated by the string 00. A single witness is all it takes to prove two states differ.

Exam-trap caption mode adds: *A witness that only shows the states are different on that string does not show which pairs are equivalent. Both directions are needed.*

## Scene 3. P0: bucket the states by their outputs

*1:00 – 1:30 · objective: Build the first partition from the output vector of each state, which is the one thing a single input can distinguish.*

**1:00–1:07** — Now the machine from GATE 2025, Set one, question fifty-nine. Eight states, A to H, one input X, one output f. The question asks for the minimum number of states needed to realise it. That is a state minimisation question, and the answer is a partition.

> Caption: The 2025 paper machine: eight states, one input X, one output f.

Exam-trap caption mode adds: *Assuming the answer is eight because eight states are listed. Every such question is asking you to remove some.*

**1:07–1:15** — The first partition comes free. If two states print different outputs on the same input, then a one-letter string already separates them, and they can never be merged. So group the states by their output vector. That grouping is the coarsest partition that is certainly correct, and every later step only splits it further.

> Caption: Start from outputs: one input can only distinguish states whose output on that input differs.

Exam-trap caption mode adds: *Splitting first by next states. Outputs are the only thing a length-one string can see, so the first partition must be by outputs.*

**1:15–1:22** — Four different output pairs, so four classes. A, B, C and E all print zero and zero. D and H print one and zero. G prints zero and one. F prints one and one. Eight states are now at most four states, and the next step decides whether the big class splits.

> Caption: Four output vectors, so four classes: {A,B,C,E} with 00, {D,H} with 10, {G} with 01, {F} with 11.

Exam-trap caption mode adds: *Counting four classes and answering four. The big class can still split, and it does.*

**1:22–1:30** — This partition is called P-zero, and its classes are the one-equivalent classes: no single input tells two members apart. The refinement step will build P-one, then P-two, where the classes agree on longer and longer strings. The sequence only ever gets finer.

> Caption: This is P0. Its classes are the 1-equivalent states: those no single input can tell apart.

Exam-trap caption mode adds: *Thinking P0 is the answer when it is only the starting point. It is correct only for machines where nothing more can be learned.*

## Scene 4. The refinement step

*1:30 – 2:00 · objective: Split a class when two of its states move to different classes on the same input, using the 2025 paper machine.*

**1:30–1:37** — Now the one real step of the algorithm. Take the class holding A, B, C and E. For each member, write where it goes on zero and where it goes on one. Then replace each of those next states by the class it sits in. What matters is not the state, but the class of the state.

> Caption: Take the class {A,B,C,E} and look where each member goes on each input.

Exam-trap caption mode adds: *Comparing next states instead of their classes. Two different next states in the same class are equivalent, so they must not separate a class.*

**1:37–1:45** — A and C both go to F and then into the big class. B and E both go to D and C, which is a different pattern of classes. So the four states divide into A with C, and B with E. The other classes are unchanged: D and H both go to G and A, and single states cannot split.

> Caption: A and C go to F and B; B and E go to D and C. Different class vectors, so the class splits.

Exam-trap caption mode adds: *Splitting a class because two members differ on the state they reach, when those two states are in the same class. Read the class, not the label.*

**1:45–1:52** — That is the rule, and it is worth saying slowly. Two states stay together only if, for every input, their next states land in the same class. If any input sends them to different classes, they separate. This is the only test in the algorithm.

> Caption: The rule: two states stay together only if, for every input, their next states lie in the same class.

Exam-trap caption mode adds: *Applying the test to one input only. Every input must agree, and one disagreement is enough to split.*

**1:52–2:00** — On this machine one pass is enough. The second pass changes nothing, so the partition is stable at five classes. The answer to the paper question is five states, and the exact pair search in this page independently arrives at the same five classes.

> Caption: Here the partition stabilises after one pass: five classes, so five states.

Exam-trap caption mode adds: *Generalising from this machine. One pass is enough here by luck, and the next scene shows a machine where it is not.*

## Scene 5. Iterate until nothing splits

*2:00 – 2:30 · objective: Run the passes on a machine that needs more than one, and see what stopping early gets wrong.*

**2:00–2:07** — Here is a machine built to punish a single pass. Two chains run forward. The first reaches A3, the only state that prints one. The second, from B0 through B1 and B2, also ends at A3. Input one sends everything back to A0. The two chains look different and are the same.

> Caption: A machine built to need more than one pass: two chains that converge on the same state.

Exam-trap caption mode adds: *Assuming a machine with more states needs more passes. The pass count depends on the longest distinguishing string, not on the state count.*

**2:07–2:15** — P-zero has two classes. The first pass separates A2 and B2, which reach the one-output state in one step. The second pass separates A1 and B1 from A0 and B0. The third pass changes nothing, so the partition is stable at four classes.

> Caption: P0 has two classes; one pass gives three; the second pass gives four and stops.

Exam-trap caption mode adds: *Reporting three states after one pass. The true answer here is four, and the missing class is exactly the pair the second pass finds.*

**2:15–2:22** — Stopping early always errs in one direction. Each pass only splits, so the class count only goes up. A partition that has not stabilised is too coarse, and too coarse means it has merged states that are not equivalent. So an early stop under-counts, and here it would claim three states where the answer is four.

> Caption: Stopping early under-counts. Here it claims three states where the answer is four.

Exam-trap caption mode adds: *Stopping when the count stops changing for one pass. Stop when a whole pass makes no change, not when one class looks settled.*

**2:22–2:30** — There is a clean relation. Each pass lengthens, by one, the strings the partition can distinguish. So the number of passes equals the longest shortest distinguishing string minus one. Here that longest string has length three, so two passes. On the 2025 machine it has length two, so one pass.

> Caption: The number of passes equals the longest shortest distinguishing string, minus one.

Exam-trap caption mode adds: *No upper bound is needed in practice, but if you want one: each pass either changes nothing or adds at least one class, and there are at most n classes, so at most n minus one passes for n states.*

## Scene 6. The minimal machine, and the proof it behaves the same

*2:30 – 3:00 · objective: Read the reduced table off the stable partition and check it against the original on every input string up to length eight.*

**2:30–2:37** — The reduced machine has one state per class. Its next-state entry is the class of the original next state, and its output is the output of any member of the class. That is well defined, because the partition was built so that all members agree on outputs and on where they go.

> Caption: One state per class: {A,C}, {B,E}, {D,H}, {F}, {G}. The reduced table has five rows.

Exam-trap caption mode adds: *Writing the next state as a member of the class instead of the class itself. The reduced table has no A in it any more.*

**2:37–2:45** — A reduced table is only meaningful if it is well defined, and that is a check rather than a hope. For every class and every input, the page verifies that all members print the same output and all members land in one class. If that failed, the partition would not have been stable.

> Caption: The reduced table is well defined: every member of a class produces the same output and lands in one class.

Exam-trap caption mode adds: *Assuming any grouping gives a valid reduced table. Only a stable partition does, and that is exactly what the check tests.*

**2:45–2:52** — Then the check that matters. Every input string up to length eight is run from every state of the original, and the output sequence is compared with the reduced machine starting from that state class. That is four thousand and eighty-eight comparisons, and not one differs.

> Caption: 4,088 string evaluations against the original: no mismatch anywhere.

Exam-trap caption mode adds: *Comparing only the first output. The sequences must match for the whole string, not just the first symbol.*

**2:52–3:00** — And the answer is unique. There is one coarsest correct partition, so the minimal machine is unique up to renaming its states. Two independent computations agree: the refinement passes, and an exact pair search over all twenty-eight pairs of states.

> Caption: The minimal machine is unique up to renaming: the partition is the equivalence relation, and it is forced.

Exam-trap caption mode adds: *Believing a different minimal machine exists. Any two minimal machines for the same behaviour are isomorphic.*

## Scene 7. What minimisation actually saves

*3:00 – 3:30 · objective: Compute the flip-flop count before and after, and see that fewer states do not always mean fewer flip-flops.*

**3:00–3:07** — Now what the reduction buys. A machine with n states needs enough flip-flops to hold n different encodings. With k flip-flops there are two to the k encodings, so k is the ceiling of log base two of n. That step function is the whole story.

> Caption: n states need the ceiling of log base 2 of n flip-flops.

Exam-trap caption mode adds: *Using log base 2 without the ceiling. Five states need three flip-flops, not two point three two.*

**3:07–3:15** — Here is the surprise. Eight states need three flip-flops. Five states also need three flip-flops, because four is the largest power of two below five. So this reduction removes three states and saves no flip-flop at all.

> Caption: Eight states to five states: three flip-flops to three flip-flops. Nothing saved.

Exam-trap caption mode adds: *Claiming a hardware saving from a state reduction that does not cross a power of two. Check the ceiling before you claim it.*

**3:15–3:22** — What always shrinks is the table. Sixteen next-state entries become ten, and the same for outputs. Every entry is a row the next-state logic must implement, so the reduction is real even when the register count does not move.

> Caption: The table does shrink: sixteen transitions become ten, and every row is a row of logic.

Exam-trap caption mode adds: *Judging a reduction by flip-flops alone. The combinational logic is usually the larger part of the saving.*

**3:22–3:30** — The twin machine is the other case. Seven states need three flip-flops. Four states need two. That reduction crosses a power of two and saves a register. So whether a reduction saves hardware is decided by the ceiling, not by how many states disappeared.

> Caption: The twin machine does save one: seven states to four, three flip-flops to two.

Exam-trap caption mode adds: *Reporting a saved flip-flop whenever states disappear. It is the ceiling that decides.*

## Scene 8. Moore against Mealy, and the machines this does not cover

*3:30 – 4:00 · objective: Apply the same algorithm to a Moore machine, and see why the same behaviour can need different state counts.*

**3:30–3:37** — Everything so far assumed a Mealy machine, where the output sits on the transition. In a Moore machine the output sits on the state. The first partition then groups states by their single output bit, and every later step is exactly the same.

> Caption: A Moore machine prints from the state. P0 is then built from each state's own output.

Exam-trap caption mode adds: *Using the Mealy rule for P0 on a Moore machine. With one bit per state the first partition has at most two classes.*

**3:37–3:45** — Here is a fact worth carrying into the exam. Detect two consecutive ones. As a Mealy machine, two states are enough, because the output can be printed on the transition that sees the second one. As a Moore machine, three states are needed, because the output must live on a state.

> Caption: The same behaviour, detect 11: two states as a Mealy machine, three as a Moore machine.

Exam-trap caption mode adds: *Answering a minimum-state question without noticing whether the machine is Moore or Mealy. The same behaviour has different minima.*

**3:45–3:52** — And neither of those numbers is a mistake. The page runs the same refinement on both, and neither machine splits. Two is minimal for the Mealy version, three is minimal for the Moore version. The gap comes from the machine type, not from a missed merge.

> Caption: Both of those machines are already minimal: partition refinement changes neither.

Exam-trap caption mode adds: *Trying to reduce a Moore detector to the Mealy count. The output placement forbids it.*

**3:52–4:00** — One honest boundary. If some entries of the table are don't-cares, states are no longer equivalent or inequivalent. They are compatible, and compatibility is not transitive, so a partition cannot even represent the answer. That case needs maximal compatible sets. Every paper question in this family I could verify is completely specified.

> Caption: One boundary: an incompletely specified machine is not decided by partition refinement.

Exam-trap caption mode adds: *Applying partition refinement to a table with don't-cares. The classes it produces need not be mergeable sets.*

## Scene 9. The three question shapes

*4:00 – 4:30 · objective: Recognise what the paper is asking for, and the three checks that catch a wrong answer in each shape.*

**4:00–4:07** — First shape, and the commonest. A table is given, and the minimum number of states is asked. Run the passes until nothing splits, and count the classes. The answer is an integer no larger than the number of rows you were given, and that bound is a one-second check.

> Caption: Shape 1: "minimum number of states required" is a NAT, and the answer is the class count.

Exam-trap caption mode adds: *Answering more states than the table had. A reduction cannot create states.*

**4:07–4:15** — Second shape: which states are equivalent, or how many equivalent pairs there are. The answer is read off the stable partition. On the 2025 machine, three of the twenty-eight pairs are equivalent: A with C, B with E, and D with H. Every other pair is separated by some string.

> Caption: Shape 2: "which states are equivalent" is an MCQ, and the answer is a class, not a pair.

Exam-trap caption mode adds: *Giving a pair that is in the same class of an unstable partition. Only the stable partition answers this.*

**4:15–4:22** — Third shape: design a machine from a description, and then the question asks for the number of states. Design first, and expect one state too many, then minimise. The 1996 item is the pure form of this: four states given, three required.

> Caption: Shape 3: design from a description, then minimise. The design is not the answer.

Exam-trap caption mode adds: *Stopping at the design. A designed machine is rarely minimal, and the question usually knows that.*

**4:22–4:30** — One check before you answer. A state nobody can reach contributes nothing, so a machine with unreachable states has fewer states than its table suggests. On the twin machine only four of seven are reachable, and the reduced machine has exactly those four classes. Read the question for which one it wants.

> Caption: A check that costs one line: every state of the reduced machine must be reachable.

Exam-trap caption mode adds: *Counting unreachable states as if they were part of the machine, or deleting them when the question asked about the whole table.*

## Scene 10. The procedure and the traps

*4:30 – 5:00 · objective: Write the four-line procedure down once and name the five traps that survive a careless check.*

**4:30–4:37** — Four lines and the question is arithmetic. Group by outputs. Then repeatedly replace each next state by its class and split where those class vectors differ. Repeat until a whole pass changes nothing, and count the classes. Then read the reduced table off the classes.

> Caption: Four lines: output partition, then repeat the split rule until nothing changes, then count, then read the table.

Exam-trap caption mode adds: *Skipping the repeat. The 2025 machine needs one pass, the twin machine needs two, and a paper can ask for either.*

**4:37–4:45** — Two traps by sight. Comparing rows instead of classes, which the 1996 machine punishes, because B and C have different rows and are the same state. And stopping after one pass, which the twin machine punishes, because one pass gives three classes where the answer is four.

> Caption: Trap one: comparing rows instead of classes. Trap two: stopping after one pass.

Exam-trap caption mode adds: *Both errors produce a plausible integer that appears among the options.*

**4:45–4:52** — Two more. Claiming a saved flip-flop when the reduction did not cross a power of two: eight to five saves nothing. And mixing Moore with Mealy: the same behaviour needs two states one way and three the other.

> Caption: Trap three: claiming a saved flip-flop. Trap four: mixing Moore and Mealy minima.

Exam-trap caption mode adds: *A question that gives a Moore machine and an answer computed for Mealy, or the reverse.*

**4:52–5:00** — And the last trap: don't-cares, which this algorithm does not handle. With all entries specified, write the answer and run one check. The state count cannot exceed the rows you were given, and it cannot be smaller than the classes the outputs already force.

> Caption: Trap five: don't-cares. Then write the answer, and check it is at most the rows you were given.

Exam-trap caption mode adds: *An answer below the number of distinct output vectors, or above the number of rows. Either one is wrong before any arithmetic.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
