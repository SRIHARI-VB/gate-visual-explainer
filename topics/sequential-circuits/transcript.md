# Sequential Circuits — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/sequential-circuits/index.html`
- Total duration: 5:00 (300 seconds), 10 scenes, 40 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A circuit that remembers: state, not rows

*0:00 – 0:30 · objective: Define a sequential circuit as a next-state function plus an output function, show why its description is a state table rather than a truth table, and separate Moore from Mealy.*

**0:00–0:07** — A sequential circuit has memory. Its output depends on the inputs present now and on the state it stored before.

> Caption: A sequential circuit has memory. Its output depends on the inputs present now and on the state it stored before.

Exam-trap caption mode adds: *Reading the stored value as if it were an ordinary input is the first mistake in this topic. It is not an input: it is produced by the circuit, and the circuit can only change it at a clock edge.*

**0:07–0:15** — So the description is a state table: for each present state and each input, the next state and the output.

> Caption: So the description is a state table: for each present state and each input, the next state and the output.

Exam-trap caption mode adds: *A state table is not a bigger truth table. Filling it in as though the state were an input gives a table that describes a combinational circuit and predicts nothing about time.*

**0:15–0:22** — One flip-flop holds one bit, so n of them hold at most 2 to the power n states. The number of states is what fixes the number of flip-flops.

> Caption: One flip-flop holds one bit, so n of them hold at most 2 to the power n states. The number of states is what fixes the number of flip-flops.

Exam-trap caption mode adds: *More flip-flops does not mean more states used. A mod-6 counter built from three flip-flops holds six states and leaves two encodings unused - and those two are a real design question, not a formality.*

**0:22–0:30** — Moore puts the output on the state alone. Mealy puts it on the state and the input, so it can react inside the cycle instead of at the edge.

> Caption: Moore puts the output on the state alone. Mealy puts it on the state and the input, so it can react inside the cycle instead of at the edge.

Exam-trap caption mode adds: *A Mealy output is not registered. It changes as soon as its input does, halfway between clock edges. Reading a Mealy output as though it were held for the cycle is the standard error in timing questions.*

## Scene 2. The SR latch: memory made from one loop

*0:30 – 1:00 · objective: Cross-couple two NOR gates, find the two stable states that make the loop a memory, and see the forbidden input and the race that follows it - both computed, not quoted.*

**0:30–0:37** — Cross-couple two NOR gates - each output into the other input - and the loop holds a value with no clock at all.

> Caption: Cross-couple two NOR gates - each output into the other input - and the loop holds a value with no clock at all.

Exam-trap caption mode adds: *The loop is not a feedback mistake to be removed. It is the entire mechanism. Remove it and you have two inverters and no memory.*

**0:37–0:45** — Set drives the output to one, reset drives it to zero, and with both inputs at zero the latch holds whatever it had.

> Caption: Set drives the output to one, reset drives it to zero, and with both inputs at zero the latch holds whatever it had.

Exam-trap caption mode adds: *Holding is not the absence of behaviour. With both inputs zero the latch is actively maintaining a value, which is why cutting its power loses the bit and why it needs no refresh in between.*

**0:45–0:52** — Both inputs at one is not a fourth function. Both outputs go to zero, so the pair is no longer complementary and the state is not a state.

> Caption: Both inputs at one is not a fourth function. Both outputs go to zero, so the pair is no longer complementary and the state is not a state.

Exam-trap caption mode adds: *The combination is called forbidden or invalid, not because it damages the gates, but because it leaves the latch with no valid stored state and no defined next state. Calling it a reset is a different circuit.*

**0:52–1:00** — Release both inputs at once and the latch races: the pair never settles, so which value wins is decided by gate delays, not by logic.

> Caption: Release both inputs at once and the latch races: the pair never settles, so which value wins is decided by gate delays, not by logic.

Exam-trap caption mode adds: *This is the one place in the topic where the honest answer is that the outcome is not determined. Do not invent a next state for it; say the next state is undefined.*

## Scene 3. The D latch and the edge-triggered D flip-flop

*1:00 – 1:30 · objective: Remove the forbidden input with one inverter, watch the D latch stay transparent for a whole level, and see two latches with opposite enables sample exactly once at the edge.*

**1:00–1:07** — Put one inverter between the two inputs and the forbidden combination becomes impossible: one data line, one enable line.

> Caption: Put one inverter between the two inputs and the forbidden combination becomes impossible: one data line, one enable line.

Exam-trap caption mode adds: *The enable is not a clock. It is a level, and while it is high the latch is listening continuously. Treating it as an edge is the next trap, and it is the one that separates a latch from a flip-flop.*

**1:07–1:15** — While the enable is high the latch is transparent: the output follows the input, including every glitch that lands on it.

> Caption: While the enable is high the latch is transparent: the output follows the input, including every glitch that lands on it.

Exam-trap caption mode adds: *A transparent latch passes narrow pulses that a flip-flop would ignore. If a design assumes edge behaviour but was built from latches, the circuit works on the bench and fails on the first noisy input.*

**1:15–1:22** — Two latches in series with opposite enables make a master-slave flip-flop: the first samples, the second holds, and only one of them is open at a time.

> Caption: Two latches in series with opposite enables make a master-slave flip-flop: the first samples, the second holds, and only one of them is open at a time.

Exam-trap caption mode adds: *The pair is not two flip-flops. It is one flip-flop made of two latches, and the second one is what makes the sampling edge-triggered rather than transparent.*

**1:22–1:30** — One sentence holds the distinction: a latch is level-sensitive and transparent, a flip-flop is edge-triggered and samples once.

> Caption: One sentence holds the distinction: a latch is level-sensitive and transparent, a flip-flop is edge-triggered and samples once.

Exam-trap caption mode adds: *GATE papers use flip-flop and latch precisely, and a question that says latch expects transparency. Reading latch as flip-flop silently changes the answer.*

## Scene 4. JK and T: four modes, and the race-around condition

*1:30 – 2:00 · objective: Repair the forbidden combination into a toggle, read the characteristic equation as the four-mode table, and show why a level-triggered JK toggles many times while the clock is high.*

**1:30–1:37** — JK keeps the two set and reset lines and repairs the forbidden combination: with both at one, the output toggles instead of fighting.

> Caption: JK keeps the two set and reset lines and repairs the forbidden combination: with both at one, the output toggles instead of fighting.

Exam-trap caption mode adds: *The toggle is a repair of the level-triggered circuit, and it brings its own problem. Scene 4 ends on it, and the fix is the edge, not a third input.*

**1:37–1:45** — The characteristic equation Q next equals J and not-Q, or not-K and Q, is the whole four-row table in one line.

> Caption: The characteristic equation Q next equals J and not-Q, or not-K and Q, is the whole four-row table in one line.

Exam-trap caption mode adds: *The equation describes the next state, not the output. In a JK flip-flop the output is the state, which is why the same letter Q appears on both sides of the equals sign with a prime marker for time.*

**1:45–1:52** — A level-triggered JK with both inputs at one does not toggle once. While the clock is high it keeps toggling, and how many times depends on how wide the clock is.

> Caption: A level-triggered JK with both inputs at one does not toggle once. While the clock is high it keeps toggling, and how many times depends on how wide the clock is.

Exam-trap caption mode adds: *The race is not the same as the SR race. There, two gates disagree about a value; here, one gate agrees with itself repeatedly and the count depends on time. Both are cured by sampling once, not by adding inputs.*

**1:52–2:00** — Edge-triggering samples once per edge and ends the race. Tie J and K together and you have the T flip-flop: Q next equals Q exclusive-OR T.

> Caption: Edge-triggering samples once per edge and ends the race. Tie J and K together and you have the T flip-flop: Q next equals Q exclusive-OR T.

Exam-trap caption mode adds: *The T flip-flop is not a separate component in most libraries; it is a JK with the two inputs tied. Questions that say "using T flip-flops" still mean the same next-state equation.*

## Scene 5. Setup, hold and the maximum clock frequency

*2:00 – 2:30 · objective: Name the three flip-flop numbers, derive the setup constraint over the slowest register-to-register path, and show that hold is a separate check no clock period can fix.*

**2:00–2:07** — Three numbers describe a flip-flop: clock-to-Q, how long after the edge the output moves; setup time; and hold time.

> Caption: Three numbers describe a flip-flop: clock-to-Q, how long after the edge the output moves; setup time; and hold time.

Exam-trap caption mode adds: *Setup and hold are properties of the flip-flop, not of the circuit. They are quoted in the question and are never something you design; what you design is the logic between the flip-flops.*

**2:07–2:15** — The setup constraint: one clock period must cover the launch delay, the longest logic path, and the capture setup time.

> Caption: The setup constraint: one clock period must cover the launch delay, the longest logic path, and the capture setup time.

Exam-trap caption mode adds: *The setup time belongs to the flip-flop that captures the data, and the clock-to-Q belongs to the one that launches it. Pairing them the wrong way round is a silent error whenever the two flip-flops differ.*

**2:15–2:22** — So the maximum frequency is one over that sum, taken over the slowest register-to-register path - not the longest path in the drawing.

> Caption: So the maximum frequency is one over that sum, taken over the slowest register-to-register path - not the longest path in the drawing.

Exam-trap caption mode adds: *Do not add the delays of two paths together. They run in parallel, in the same cycle. Only the worst one sets the period.*

**2:22–2:30** — Hold is a different check and contains no clock period at all: the shortest path must not arrive too early. Slowing the clock cannot fix it.

> Caption: Hold is a different check and contains no clock period at all: the shortest path must not arrive too early. Slowing the clock cannot fix it.

Exam-trap caption mode adds: *This is the pair people merge. Setup is about data arriving too late and is fixed by slowing down. Hold is about data arriving too early and is not. A question that says "maximum frequency" is asking only about setup.*

## Scene 6. Counters: ripple, synchronous, and the count of flip-flops

*2:30 – 3:00 · objective: Divide the clock by two per ripple stage, convert a 64-microsecond period into 250 kHz, compute the ripple settling time, and separate the synchronous toggle rule from the ceiling of log2 N.*

**2:30–2:37** — An n-bit ripple counter is n toggle stages in a chain. Each stage halves the frequency, so the last output has a period 2 to the n times the clock period.

> Caption: An n-bit ripple counter is n toggle stages in a chain. Each stage halves the frequency, so the last output has a period 2 to the n times the clock period.

Exam-trap caption mode adds: *The divisor is 2 to the n, not n. Dividing by the number of flip-flops instead of by two to that number is the single most common arithmetic slip in this topic.*

**2:37–2:45** — A 64-microsecond period at the last of four stages means a 4-microsecond clock: 250 kilohertz. That is GATE CSE 2025 Set 2, Question 34.

> Caption: A 64-microsecond period at the last of four stages means a 4-microsecond clock: 250 kilohertz. That is GATE CSE 2025 Set 2, Question 34.

Exam-trap caption mode adds: *The question asks for the frequency of the counter, which is its input clock, not the frequency at its last stage. Answering with the last stage frequency gives 15.6 kilohertz and loses the mark.*

**2:45–2:52** — The ripple has a cost: the delays add down the chain, so the worst transition settles only after n propagation delays and the maximum clock is one over n times that delay.

> Caption: The ripple has a cost: the delays add down the chain, so the worst transition settles only after n propagation delays and the maximum clock is one over n times that delay.

Exam-trap caption mode adds: *The maximum clock frequency of a ripple counter depends on n and gets worse as the counter gets wider. A ripple is the cheap design, never the fast one.*

**2:52–3:00** — A synchronous counter clocks every flip-flop together and decides with logic: bit k toggles exactly when every lower bit is one. And a mod-N counter needs the ceiling of log base 2 of N flip-flops.

> Caption: A synchronous counter clocks every flip-flop together and decides with logic: bit k toggles exactly when every lower bit is one. And a mod-N counter needs the ceiling of log base 2 of N flip-flops.

Exam-trap caption mode adds: *Synchronous is not automatically faster. The toggle logic for a wide binary counter is an AND of every lower bit, and that path grows with n. The advantage is that it is a known path you can compute, not that it is short.*

## Scene 7. Shift registers, ring counters and Johnson counters

*3:00 – 3:30 · objective: Move a bit one place per clock, close the loop unchanged for n states and complemented for 2n, and read the 0000 Johnson sequence as a computed cycle rather than a remembered list.*

**3:00–3:07** — A shift register is flip-flops in a line, each passing its bit to the next on every clock. n bits move one place per cycle.

> Caption: A shift register is flip-flops in a line, each passing its bit to the next on every clock. n bits move one place per cycle.

Exam-trap caption mode adds: *A shift register is not a counter. It counts nothing; it stores and moves. A question that asks for the state after k clocks wants the shift, not the binary count.*

**3:07–3:15** — Feed the last output back unchanged and you get a ring counter: one 1 circulates, so there are n states, and all zeros is a locked state it can never leave.

> Caption: Feed the last output back unchanged and you get a ring counter: one 1 circulates, so there are n states, and all zeros is a locked state it can never leave.

Exam-trap caption mode adds: *The locked state is not a bug in the flip-flops, it is a property of the feedback. Any question that starts a ring counter at zero and asks for its sequence is testing whether you notice.*

**3:15–3:22** — Feed back the complement and you get a Johnson counter: 2n states from n flip-flops, and all zeros is no longer a trap.

> Caption: Feed back the complement and you get a Johnson counter: 2n states from n flip-flops, and all zeros is no longer a trap.

Exam-trap caption mode adds: *Twice as many states does not make it a mod-2n binary counter. The states are not in binary order, so decoding the count needs a decoder; only the cycle length is 2n.*

**3:22–3:30** — Four flip-flops from 0000 give 0, 8, 12, 14, 15, 7, 3, 1 and back to 0. That sequence is GATE CSE 2015 Set 1, Question 11.

> Caption: Four flip-flops from 0000 give 0, 8, 12, 14, 15, 7, 3, 1 and back to 0. That sequence is GATE CSE 2015 Set 1, Question 11.

Exam-trap caption mode adds: *Which end is the most significant decides whether the sequence reads 0, 8, 12 and so on or its mirror image 0, 1, 3, 7. The paper states the order; the mirror is a legitimate sequence for the other convention.*

## Scene 8. Designing a machine: diagram, table, excitation, gates

*3:30 – 4:00 · objective: Walk the five-step design flow, show that state assignment is a free choice that changes only the size, read the excitation tables, and treat the unused states as a deliberate decision with a lock-out check.*

**3:30–3:37** — The design flow is five steps and none of them is clever: state diagram, state table, state assignment, flip-flop inputs, minimised expressions.

> Caption: The design flow is five steps and none of them is clever: state diagram, state table, state assignment, flip-flop inputs, minimised expressions.

Exam-trap caption mode adds: *Skipping the diagram and going straight to a table is where extra states appear. The diagram is where you find out that two states you drew are actually the same state.*

**3:37–3:45** — State assignment is a free choice. It does not change the behaviour, only the size of the circuit, so two designers can produce different expressions for the same machine.

> Caption: State assignment is a free choice. It does not change the behaviour, only the size of the circuit, so two designers can produce different expressions for the same machine.

Exam-trap caption mode adds: *Two different correct answers to a design question are not a contradiction. If the paper asks for the minimum number of gates, it has fixed something else - usually the assignment - and that clause is part of the question.*

**3:45–3:52** — The excitation table turns "this bit must go from 0 to 1" into the input that does it. For D the input is the next state itself; for T it is the exclusive-OR of present and next.

> Caption: The excitation table turns "this bit must go from 0 to 1" into the input that does it. For D the input is the next state itself; for T it is the exclusive-OR of present and next.

Exam-trap caption mode adds: *The excitation table is the inverse of the characteristic table, and mixing the two directions is the classic slip. Characteristic: given the input, what is the next state. Excitation: given the transition, what input is needed.*

**3:52–4:00** — The unused states are a decision, not an accident: treat them as don't-cares and the circuit is smaller, but check where they go.

> Caption: The unused states are a decision, not an accident: treat them as don't-cares and the circuit is smaller, but check where they go.

Exam-trap caption mode adds: *The don't-care that shrinks the circuit is the same one that can create a lock-out. Both facts come from the same decision, so the check is not optional bookkeeping - it is the other half of the design.*

## Scene 9. Analysing a circuit you were handed

*4:00 – 4:30 · objective: Write one next-state equation per flip-flop, tabulate, find the cycle, and finish the job by asking where the unused states go.*

**4:00–4:07** — Do not simulate in your head. Write one next-state equation per flip-flop, straight from the gate network, and nothing else.

> Caption: Do not simulate in your head. Write one next-state equation per flip-flop, straight from the gate network, and nothing else.

Exam-trap caption mode adds: *The output function is a separate equation. A circuit can have perfectly clear next-state equations and an output that also depends on the input, which makes it Mealy. Do not assume Moore because the diagram is small.*

**4:07–4:15** — Then tabulate: every present state in a column, its next state in the next column, for every input. The cycle appears as a repeat.

> Caption: Then tabulate: every present state in a column, its next state in the next column, for every input. The cycle appears as a repeat.

Exam-trap caption mode adds: *The table has one row per state, not per clock. A sequence question asks what happens after k clocks, which is a walk of k steps through the table, not k rows.*

**4:15–4:22** — From 11 with the T flip-flop driven by the other output and the D flip-flop fed from it, the states go 11, 01, 10, 11: a three-state cycle. That is GATE CSE 2017 Set 1, Question 33.

> Caption: From 11 with the T flip-flop driven by the other output and the D flip-flop fed from it, the states go 11, 01, 10, 11: a three-state cycle. That is GATE CSE 2017 Set 1, Question 33.

Exam-trap caption mode adds: *The question asks for the value after the third and fourth cycles, and counting the initial state as cycle one shifts both answers. Write the clock number next to each row before answering.*

**4:22–4:30** — The last step is the one people skip: list the states the cycle never visits and ask where they go.

> Caption: The last step is the one people skip: list the states the cycle never visits and ask where they go.

Exam-trap caption mode adds: *A correct cycle and a self-starting machine are two different claims. Most design questions only ask for the cycle; a good answer states which claim it has proved.*

## Scene 10. One table to hold: the pairs, the traps, the rule

*4:30 – 5:00 · objective: Hold the five confused pairs against each other, name the five traps, and fix the order of operations for any sequential question.*

**4:30–4:37** — Latch or flip-flop: level-sensitive and transparent, against edge-triggered and sampled once. Everything else in the topic follows from that line.

> Caption: Latch or flip-flop: level-sensitive and transparent, against edge-triggered and sampled once. Everything else in the topic follows from that line.

Exam-trap caption mode adds: *A transparent latch built into a counter produces a design that works at one clock speed and fails at another. The distinction is not vocabulary.*

**4:37–4:45** — Ripple or synchronous: the ripple is cheaper and slower by a factor of n; the synchronous is one flip-flop delay plus whatever logic the toggle rule needs.

> Caption: Ripple or synchronous: the ripple is cheaper and slower by a factor of n; the synchronous is one flip-flop delay plus whatever logic the toggle rule needs.

Exam-trap caption mode adds: *"Synchronous is faster" is a habit, not a theorem. Count the toggle logic before saying it.*

**4:45–4:52** — The five traps: the forbidden SR input, race-around, hold mistaken for setup, an uninitialised ring counter, and an unused state that locks out.

> Caption: The five traps: the forbidden SR input, race-around, hold mistaken for setup, an uninitialised ring counter, and an unused state that locks out.

Exam-trap caption mode adds: *Four of the five can be caught by writing one extra line: the next state of the invalid encoding, the width of the clock, the shortest path, and the feedback of the all-zeros state.*

**4:52–5:00** — The rule: name the state, write the next-state function, then count the clock. Every sequential question is those three steps in that order.

> Caption: The rule: name the state, write the next-state function, then count the clock. Every sequential question is those three steps in that order.

Exam-trap caption mode adds: *Starting from the clock is the commonest order error: it produces a timing number for a circuit whose state you have not established, and both halves are then unverifiable.*

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
