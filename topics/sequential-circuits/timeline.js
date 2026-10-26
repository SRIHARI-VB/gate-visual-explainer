/* ==========================================================================
   sequential-circuits - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 300,

  scenes: [
    {
      id: 'state',
      n: 1,
      title: 'A circuit that remembers: state, not rows',
      start: 0, end: 30,
      objective: 'Define a sequential circuit as a next-state function plus an output function, show why its description is a state table rather than a truth table, and separate Moore from Mealy.'
    },
    {
      id: 'latch',
      n: 2,
      title: 'The SR latch: memory made from one loop',
      start: 30, end: 60,
      objective: 'Cross-couple two NOR gates, find the two stable states that make the loop a memory, and see the forbidden input and the race that follows it - both computed, not quoted.'
    },
    {
      id: 'dff',
      n: 3,
      title: 'The D latch and the edge-triggered D flip-flop',
      start: 60, end: 90,
      objective: 'Remove the forbidden input with one inverter, watch the D latch stay transparent for a whole level, and see two latches with opposite enables sample exactly once at the edge.'
    },
    {
      id: 'jk',
      n: 4,
      title: 'JK and T: four modes, and the race-around condition',
      start: 90, end: 120,
      objective: 'Repair the forbidden combination into a toggle, read the characteristic equation as the four-mode table, and show why a level-triggered JK toggles many times while the clock is high.'
    },
    {
      id: 'timing',
      n: 5,
      title: 'Setup, hold and the maximum clock frequency',
      start: 120, end: 150,
      objective: 'Name the three flip-flop numbers, derive the setup constraint over the slowest register-to-register path, and show that hold is a separate check no clock period can fix.'
    },
    {
      id: 'counter',
      n: 6,
      title: 'Counters: ripple, synchronous, and the count of flip-flops',
      start: 150, end: 180,
      objective: 'Divide the clock by two per ripple stage, convert a 64-microsecond period into 250 kHz, compute the ripple settling time, and separate the synchronous toggle rule from the ceiling of log2 N.'
    },
    {
      id: 'shift',
      n: 7,
      title: 'Shift registers, ring counters and Johnson counters',
      start: 180, end: 210,
      objective: 'Move a bit one place per clock, close the loop unchanged for n states and complemented for 2n, and read the 0000 Johnson sequence as a computed cycle rather than a remembered list.'
    },
    {
      id: 'design',
      n: 8,
      title: 'Designing a machine: diagram, table, excitation, gates',
      start: 210, end: 240,
      objective: 'Walk the five-step design flow, show that state assignment is a free choice that changes only the size, read the excitation tables, and treat the unused states as a deliberate decision with a lock-out check.'
    },
    {
      id: 'analyse',
      n: 9,
      title: 'Analysing a circuit you were handed',
      start: 240, end: 270,
      objective: 'Write one next-state equation per flip-flop, tabulate, find the cycle, and finish the job by asking where the unused states go.'
    },
    {
      id: 'table',
      n: 10,
      title: 'One table to hold: the pairs, the traps, the rule',
      start: 270, end: 300,
      objective: 'Hold the five confused pairs against each other, name the five traps, and fix the order of operations for any sequential question.'
    }
  ],

  events: [

    /* ---------------- scene 1: state ---------------- */
    {
      id: 'st-1', start: 0, end: 7.5, scene: 'state',
      caption: 'A sequential circuit has memory. Its output depends on the inputs present now and on the state it stored before.',
      detail: 'The combinational lesson said: no memory, so the truth table is the whole description. Add one stored bit and that sentence stops being true. The circuit now needs a second argument - what it was holding - and the description becomes a function of two things instead of one.',
      keyword: 'depends on the state it stored',
      trap: 'Reading the stored value as if it were an ordinary input is the first mistake in this topic. It is not an input: it is produced by the circuit, and the circuit can only change it at a clock edge.',
      narration: 'A sequential circuit has memory. Its output depends on the inputs present now and on the state it stored before.'
    },
    {
      id: 'st-2', start: 7.5, end: 15, scene: 'state',
      caption: 'So the description is a state table: for each present state and each input, the next state and the output.',
      detail: 'One row per state-and-input pair, not one row per input vector. A two-state machine with one input has four rows; the same circuit as a plain truth table would have only two, and two rows cannot describe a memory. The next-state function and the output function are the whole machine.',
      keyword: 'the next state and the output',
      trap: 'A state table is not a bigger truth table. Filling it in as though the state were an input gives a table that describes a combinational circuit and predicts nothing about time.',
      narration: 'So the description is a state table: for each present state and each input, the next state and the output.'
    },
    {
      id: 'st-3', start: 15, end: 22.5, scene: 'state',
      caption: 'One flip-flop holds one bit, so n of them hold at most 2 to the power n states. The number of states is what fixes the number of flip-flops.',
      detail: 'The relationship runs one way only: a machine with N states needs at least the ceiling of log base 2 of N flip-flops, and having more flip-flops than that does not give you more states unless the design uses them. States you never reach still exist in the encoding, which is why the next scene asks where they go.',
      keyword: 'at most 2 to the power n states',
      trap: 'More flip-flops does not mean more states used. A mod-6 counter built from three flip-flops holds six states and leaves two encodings unused - and those two are a real design question, not a formality.',
      narration: 'One flip-flop holds one bit, so n of them hold at most 2 to the power n states. The number of states is what fixes the number of flip-flops.'
    },
    {
      id: 'st-4', start: 22.5, end: 30, scene: 'state',
      caption: 'Moore puts the output on the state alone. Mealy puts it on the state and the input, so it can react inside the cycle instead of at the edge.',
      detail: 'Both describe the same behaviour and either can be built. Moore is safer - the output settles with the state and never glitches with a changing input - and it usually needs one more state. Mealy is smaller and one cycle faster, and its output can glitch whenever the input does, because it is combinational.',
      keyword: 'Moore on the state alone, Mealy on state and input',
      trap: 'A Mealy output is not registered. It changes as soon as its input does, halfway between clock edges. Reading a Mealy output as though it were held for the cycle is the standard error in timing questions.',
      narration: 'Moore puts the output on the state alone. Mealy puts it on the state and the input, so it can react inside the cycle instead of at the edge.'
    },

    /* ---------------- scene 2: SR latch ---------------- */
    {
      id: 'lt-1', start: 30, end: 37.5, scene: 'latch',
      caption: 'Cross-couple two NOR gates - each output into the other input - and the loop holds a value with no clock at all.',
      detail: 'Gate one computes Q from R and the other output; gate two computes the other output from S and Q. Because each feeds the other, the pair has to be solved as a pair. A value that reproduces itself through both gates is a stable state, and that self-reproduction is the memory.',
      keyword: 'each output into the other input',
      trap: 'The loop is not a feedback mistake to be removed. It is the entire mechanism. Remove it and you have two inverters and no memory.',
      narration: 'Cross-couple two NOR gates - each output into the other input - and the loop holds a value with no clock at all.'
    },
    {
      id: 'lt-2', start: 37.5, end: 45, scene: 'latch',
      caption: 'Set drives the output to one, reset drives it to zero, and with both inputs at zero the latch holds whatever it had.',
      detail: 'The page iterates the two gate equations until they stop changing and records the answer. Starting from zero with S equal to one, the pair settles at one and zero. Starting from one with R equal to one, it settles at zero and one. With both inputs zero, both starting points stay where they are: two stable states, one latch.',
      keyword: 'the latch holds whatever it had',
      trap: 'Holding is not the absence of behaviour. With both inputs zero the latch is actively maintaining a value, which is why cutting its power loses the bit and why it needs no refresh in between.',
      narration: 'Set drives the output to one, reset drives it to zero, and with both inputs at zero the latch holds whatever it had.'
    },
    {
      id: 'lt-3', start: 45, end: 52.5, scene: 'latch',
      caption: 'Both inputs at one is not a fourth function. Both outputs go to zero, so the pair is no longer complementary and the state is not a state.',
      detail: 'With S and R both one, each NOR gate is forced low whatever the other says: the loop is broken by the inputs and both outputs sit at zero. The latch is not storing anything at that moment, and the two outputs agree, which contradicts the whole idea of a stored bit and its complement.',
      keyword: 'both outputs go to zero',
      trap: 'The combination is called forbidden or invalid, not because it damages the gates, but because it leaves the latch with no valid stored state and no defined next state. Calling it a reset is a different circuit.',
      narration: 'Both inputs at one is not a fourth function. Both outputs go to zero, so the pair is no longer complementary and the state is not a state.'
    },
    {
      id: 'lt-4', start: 52.5, end: 60, scene: 'latch',
      caption: 'Release both inputs at once and the latch races: the pair never settles, so which value wins is decided by gate delays, not by logic.',
      detail: 'From the both-zero output state with S and R back at zero, the next step sends both outputs to one, and the step after that sends both back to zero. The iteration oscillates forever. Physically the two gates are never exactly matched, so the faster one wins and the result is unpredictable and irreproducible.',
      keyword: 'the pair never settles',
      trap: 'This is the one place in the topic where the honest answer is that the outcome is not determined. Do not invent a next state for it; say the next state is undefined.',
      narration: 'Release both inputs at once and the latch races: the pair never settles, so which value wins is decided by gate delays, not by logic.'
    },

    /* ---------------- scene 3: D latch and D flip-flop ---------------- */
    {
      id: 'df-1', start: 60, end: 67.5, scene: 'dff',
      caption: 'Put one inverter between the two inputs and the forbidden combination becomes impossible: one data line, one enable line.',
      detail: 'The data line drives set directly and reset through the inverter, so set and reset can never both be asserted. That is the D latch. The cost of removing the forbidden state is a second input - the enable - which decides whether the latch is listening at all.',
      keyword: 'one data line, one enable line',
      trap: 'The enable is not a clock. It is a level, and while it is high the latch is listening continuously. Treating it as an edge is the next trap, and it is the one that separates a latch from a flip-flop.',
      narration: 'Put one inverter between the two inputs and the forbidden combination becomes impossible: one data line, one enable line.'
    },
    {
      id: 'df-2', start: 67.5, end: 75, scene: 'dff',
      caption: 'While the enable is high the latch is transparent: the output follows the input, including every glitch that lands on it.',
      detail: 'Transparent is the precise word. The path from data to output is open, so a change on the data line reaches the output after one gate delay. Whatever the data does during the high level, the output does too. The page checks this for every data value.',
      keyword: 'the latch is transparent',
      trap: 'A transparent latch passes narrow pulses that a flip-flop would ignore. If a design assumes edge behaviour but was built from latches, the circuit works on the bench and fails on the first noisy input.',
      narration: 'While the enable is high the latch is transparent: the output follows the input, including every glitch that lands on it.'
    },
    {
      id: 'df-3', start: 75, end: 82.5, scene: 'dff',
      caption: 'Two latches in series with opposite enables make a master-slave flip-flop: the first samples, the second holds, and only one of them is open at a time.',
      detail: 'The master follows the data while the clock is low. At the rising edge the master closes, keeping the value it had, and the slave opens and takes that value. For the rest of the high level the master is shut, so changes on the data line cannot reach the slave. One sample per cycle, taken at the edge.',
      keyword: 'only one of them is open at a time',
      trap: 'The pair is not two flip-flops. It is one flip-flop made of two latches, and the second one is what makes the sampling edge-triggered rather than transparent.',
      narration: 'Two latches in series with opposite enables make a master-slave flip-flop: the first samples, the second holds, and only one of them is open at a time.'
    },
    {
      id: 'df-4', start: 82.5, end: 90, scene: 'dff',
      caption: 'One sentence holds the distinction: a latch is level-sensitive and transparent, a flip-flop is edge-triggered and samples once.',
      detail: 'Everything else in this topic is downstream of that sentence. A flip-flop has a well-defined setup window because it samples at one instant; a latch does not, which is why timing analysis is written for flip-flops. The page checks the sampling behaviour of the master-slave pair on a waveform where the data moves while the clock is high.',
      keyword: 'level-sensitive against edge-triggered',
      trap: 'GATE papers use flip-flop and latch precisely, and a question that says latch expects transparency. Reading latch as flip-flop silently changes the answer.',
      narration: 'One sentence holds the distinction: a latch is level-sensitive and transparent, a flip-flop is edge-triggered and samples once.'
    },

    /* ---------------- scene 4: JK and T ---------------- */
    {
      id: 'jk-1', start: 90, end: 97.5, scene: 'jk',
      caption: 'JK keeps the two set and reset lines and repairs the forbidden combination: with both at one, the output toggles instead of fighting.',
      detail: 'The repair is mechanical. Each input is gated with the opposite output, so when both are asserted neither gate can win and the loop inverts instead. That is exactly what a toggle is, and it is why the JK flip-flop is the general-purpose one: set, reset, hold and toggle are all available from two lines.',
      keyword: 'the output toggles instead of fighting',
      trap: 'The toggle is a repair of the level-triggered circuit, and it brings its own problem. Scene 4 ends on it, and the fix is the edge, not a third input.',
      narration: 'JK keeps the two set and reset lines and repairs the forbidden combination: with both at one, the output toggles instead of fighting.'
    },
    {
      id: 'jk-2', start: 97.5, end: 105, scene: 'jk',
      caption: 'The characteristic equation Q next equals J and not-Q, or not-K and Q, is the whole four-row table in one line.',
      detail: 'Substitute the four input pairs. With J and K both zero only the second term survives, so the state holds. With K equal to one and J zero only the first term vanishes, so the state clears. With J one and K zero it sets. With both one, the two terms cover both values of Q and the state inverts. The page checks all eight combinations of J, K and Q.',
      keyword: 'the four-row table in one line',
      trap: 'The equation describes the next state, not the output. In a JK flip-flop the output is the state, which is why the same letter Q appears on both sides of the equals sign with a prime marker for time.',
      narration: 'The characteristic equation Q next equals J and not-Q, or not-K and Q, is the whole four-row table in one line.'
    },
    {
      id: 'jk-3', start: 105, end: 112.5, scene: 'jk',
      caption: 'A level-triggered JK with both inputs at one does not toggle once. While the clock is high it keeps toggling, and how many times depends on how wide the clock is.',
      detail: 'Each toggle takes one propagation delay. If the high level lasts three delays, the output toggles three times; make the clock wider and it toggles more. That is the race-around condition. The final state is a function of the clock width rather than of the logic, which is not a usable flip-flop.',
      keyword: 'it keeps toggling',
      trap: 'The race is not the same as the SR race. There, two gates disagree about a value; here, one gate agrees with itself repeatedly and the count depends on time. Both are cured by sampling once, not by adding inputs.',
      narration: 'A level-triggered JK with both inputs at one does not toggle once. While the clock is high it keeps toggling, and how many times depends on how wide the clock is.'
    },
    {
      id: 'jk-4', start: 112.5, end: 120, scene: 'jk',
      caption: 'Edge-triggering samples once per edge and ends the race. Tie J and K together and you have the T flip-flop: Q next equals Q exclusive-OR T.',
      detail: 'With T equal to zero the state holds; with T equal to one it inverts. One line, two functions, and the equation is a single exclusive-OR. Every binary counter in the next scene is a row of T flip-flops, either in a chain or with a toggle condition computed from the other bits.',
      keyword: 'samples once per edge',
      trap: 'The T flip-flop is not a separate component in most libraries; it is a JK with the two inputs tied. Questions that say "using T flip-flops" still mean the same next-state equation.',
      narration: 'Edge-triggering samples once per edge and ends the race. Tie J and K together and you have the T flip-flop: Q next equals Q exclusive-OR T.'
    },

    /* ---------------- scene 5: timing ---------------- */
    {
      id: 'tm-1', start: 120, end: 127.5, scene: 'timing',
      caption: 'Three numbers describe a flip-flop: clock-to-Q, how long after the edge the output moves; setup time; and hold time.',
      detail: 'Clock-to-Q is the delay from the active edge to a stable output. Setup time is how long before the next edge the data must already be stable. Hold time is how long after the edge it must stay stable. A fourth number, the contamination delay, is the shortest clock-to-Q and matters only for hold.',
      keyword: 'clock-to-Q, setup time, hold time',
      trap: 'Setup and hold are properties of the flip-flop, not of the circuit. They are quoted in the question and are never something you design; what you design is the logic between the flip-flops.',
      narration: 'Three numbers describe a flip-flop: clock-to-Q, how long after the edge the output moves; setup time; and hold time.'
    },
    {
      id: 'tm-2', start: 127.5, end: 135, scene: 'timing',
      caption: 'The setup constraint: one clock period must cover the launch delay, the longest logic path, and the capture setup time.',
      detail: 'Data leaves the launching flip-flop clock-to-Q after the edge, crosses the combinational logic, and must arrive at the capturing flip-flop at least one setup time before the next edge. Add the three numbers and that sum is the shortest period the circuit can tolerate. The page computes it for a worked set of values and prints the resulting frequency.',
      keyword: 'launch delay, longest path, capture setup',
      trap: 'The setup time belongs to the flip-flop that captures the data, and the clock-to-Q belongs to the one that launches it. Pairing them the wrong way round is a silent error whenever the two flip-flops differ.',
      narration: 'The setup constraint: one clock period must cover the launch delay, the longest logic path, and the capture setup time.'
    },
    {
      id: 'tm-3', start: 135, end: 142.5, scene: 'timing',
      caption: 'So the maximum frequency is one over that sum, taken over the slowest register-to-register path - not the longest path in the drawing.',
      detail: 'Every path from a flip-flop output to a flip-flop input is a constraint, and the clock has to satisfy all of them, so the binding one is the path with the largest total. A path with fewer gates can be slower if it starts at a slow flip-flop or ends at a flip-flop with a large setup time. That is why the answer is a maximum over paths and not a sum.',
      keyword: 'the slowest register-to-register path',
      trap: 'Do not add the delays of two paths together. They run in parallel, in the same cycle. Only the worst one sets the period.',
      narration: 'So the maximum frequency is one over that sum, taken over the slowest register-to-register path - not the longest path in the drawing.'
    },
    {
      id: 'tm-4', start: 142.5, end: 150, scene: 'timing',
      caption: 'Hold is a different check and contains no clock period at all: the shortest path must not arrive too early. Slowing the clock cannot fix it.',
      detail: 'The hold constraint compares the shortest launch-plus-logic delay against the capture hold time. Because the clock period does not appear, no choice of frequency helps; the repair is to lengthen the short path or to change the flip-flops. A circuit that fails hold fails at every frequency, including a stopped clock.',
      keyword: 'slowing the clock cannot fix it',
      trap: 'This is the pair people merge. Setup is about data arriving too late and is fixed by slowing down. Hold is about data arriving too early and is not. A question that says "maximum frequency" is asking only about setup.',
      narration: 'Hold is a different check and contains no clock period at all: the shortest path must not arrive too early. Slowing the clock cannot fix it.'
    },

    /* ---------------- scene 6: counters ---------------- */
    {
      id: 'ct-1', start: 150, end: 157.5, scene: 'counter',
      caption: 'An n-bit ripple counter is n toggle stages in a chain. Each stage halves the frequency, so the last output has a period 2 to the n times the clock period.',
      detail: 'Only the first flip-flop sees the external clock; every later one is clocked by the output of the stage before it, and every stage is in toggle mode. Halving the frequency is doubling the period, so four stages multiply the period by sixteen. That division is the counter: it counts clocks by dividing them.',
      keyword: 'each stage halves the frequency',
      trap: 'The divisor is 2 to the n, not n. Dividing by the number of flip-flops instead of by two to that number is the single most common arithmetic slip in this topic.',
      narration: 'An n-bit ripple counter is n toggle stages in a chain. Each stage halves the frequency, so the last output has a period 2 to the n times the clock period.'
    },
    {
      id: 'ct-2', start: 157.5, end: 165, scene: 'counter',
      caption: 'A 64-microsecond period at the last of four stages means a 4-microsecond clock: 250 kilohertz. That is GATE CSE 2025 Set 2, Question 34.',
      detail: 'Divide 64 microseconds by sixteen to get the clock period, then invert it. The page computes this from the divider rather than from the quoted answer, and prints the intermediate period as well as the frequency, so the arithmetic can be checked.',
      keyword: 'a 4-microsecond clock',
      trap: 'The question asks for the frequency of the counter, which is its input clock, not the frequency at its last stage. Answering with the last stage frequency gives 15.6 kilohertz and loses the mark.',
      narration: 'A 64-microsecond period at the last of four stages means a 4-microsecond clock: 250 kilohertz. That is GATE CSE 2025 Set 2, Question 34.'
    },
    {
      id: 'ct-3', start: 165, end: 172.5, scene: 'counter',
      caption: 'The ripple has a cost: the delays add down the chain, so the worst transition settles only after n propagation delays and the maximum clock is one over n times that delay.',
      detail: 'The page simulates the chain with unit delays and finds the settling time of every transition; the maximum over all transitions is exactly the number of stages. In a four-bit counter that is four delays, which is why the same question asked in 1991 with ten-nanosecond flip-flops gives a period of forty nanoseconds.',
      keyword: 'the delays add down the chain',
      trap: 'The maximum clock frequency of a ripple counter depends on n and gets worse as the counter gets wider. A ripple is the cheap design, never the fast one.',
      narration: 'The ripple has a cost: the delays add down the chain, so the worst transition settles only after n propagation delays and the maximum clock is one over n times that delay.'
    },
    {
      id: 'ct-4', start: 172.5, end: 180, scene: 'counter',
      caption: 'A synchronous counter clocks every flip-flop together and decides with logic: bit k toggles exactly when every lower bit is one. And a mod-N counter needs the ceiling of log base 2 of N flip-flops.',
      detail: 'One flip-flop delay however wide the counter, with the combinational logic setting the period instead. For the count of flip-flops, N states need at least the ceiling of log base 2 of N; a mod-258 counter needs nine, because eight flip-flops give 256 states and that is two short. That is GATE CSE 2011, Question 15.',
      keyword: 'the ceiling of log base 2 of N',
      trap: 'Synchronous is not automatically faster. The toggle logic for a wide binary counter is an AND of every lower bit, and that path grows with n. The advantage is that it is a known path you can compute, not that it is short.',
      narration: 'A synchronous counter clocks every flip-flop together and decides with logic: bit k toggles exactly when every lower bit is one. And a mod-N counter needs the ceiling of log base 2 of N flip-flops.'
    },

    /* ---------------- scene 7: shift registers, ring and Johnson ---------------- */
    {
      id: 'sh-1', start: 180, end: 187.5, scene: 'shift',
      caption: 'A shift register is flip-flops in a line, each passing its bit to the next on every clock. n bits move one place per cycle.',
      detail: 'The wiring is one connection per pair, and the only logic is the input at one end and the output at the other. Taking the bits out in parallel instead of serially is a wiring choice, which is why serial-in parallel-out and parallel-in serial-out are the same register with different taps.',
      keyword: 'n bits move one place per cycle',
      trap: 'A shift register is not a counter. It counts nothing; it stores and moves. A question that asks for the state after k clocks wants the shift, not the binary count.',
      narration: 'A shift register is flip-flops in a line, each passing its bit to the next on every clock. n bits move one place per cycle.'
    },
    {
      id: 'sh-2', start: 187.5, end: 195, scene: 'shift',
      caption: 'Feed the last output back unchanged and you get a ring counter: one 1 circulates, so there are n states, and all zeros is a locked state it can never leave.',
      detail: 'The circulating single one makes the state one-hot, which is convenient because the state is read without a decoder. The price is that the counter must be initialised into the pattern: from all zeros the feedback is zero forever, and the counter sits still. A self-starting version needs extra logic to inject the one.',
      keyword: 'all zeros is a locked state',
      trap: 'The locked state is not a bug in the flip-flops, it is a property of the feedback. Any question that starts a ring counter at zero and asks for its sequence is testing whether you notice.',
      narration: 'Feed the last output back unchanged and you get a ring counter: one 1 circulates, so there are n states, and all zeros is a locked state it can never leave.'
    },
    {
      id: 'sh-3', start: 195, end: 202.5, scene: 'shift',
      caption: 'Feed back the complement and you get a Johnson counter: 2n states from n flip-flops, and all zeros is no longer a trap.',
      detail: 'Inverting the feedback doubles the number of states for the same hardware, because the pattern that circulates is a block of ones and a block of zeros rather than a single one. From all zeros the first shift writes a one, so the counter moves immediately. That is the twisted-ring counter.',
      keyword: '2n states from n flip-flops',
      trap: 'Twice as many states does not make it a mod-2n binary counter. The states are not in binary order, so decoding the count needs a decoder; only the cycle length is 2n.',
      narration: 'Feed back the complement and you get a Johnson counter: 2n states from n flip-flops, and all zeros is no longer a trap.'
    },
    {
      id: 'sh-4', start: 202.5, end: 210, scene: 'shift',
      caption: 'Four flip-flops from 0000 give 0, 8, 12, 14, 15, 7, 3, 1 and back to 0. That sequence is GATE CSE 2015 Set 1, Question 11.',
      detail: 'Each step shifts the register and puts the complement of the bit that fell off into the empty end. Written as decimal values the sequence looks arbitrary, which is exactly why the paper offers it as a list to match. The page generates the cycle from the shift rule and prints the same numbers.',
      keyword: '0, 8, 12, 14, 15, 7, 3, 1',
      trap: 'Which end is the most significant decides whether the sequence reads 0, 8, 12 and so on or its mirror image 0, 1, 3, 7. The paper states the order; the mirror is a legitimate sequence for the other convention.',
      narration: 'Four flip-flops from 0000 give 0, 8, 12, 14, 15, 7, 3, 1 and back to 0. That sequence is GATE CSE 2015 Set 1, Question 11.'
    },

    /* ---------------- scene 8: FSM design ---------------- */
    {
      id: 'ds-1', start: 210, end: 217.5, scene: 'design',
      caption: 'The design flow is five steps and none of them is clever: state diagram, state table, state assignment, flip-flop inputs, minimised expressions.',
      detail: 'Draw what the machine must remember as circles and label the transitions with input and output. Turn the picture into a table, one row per state and input. Give each state a bit pattern. Convert each required transition into the flip-flop input that produces it. Minimise each input as a function of the state bits and the machine inputs.',
      keyword: 'five steps, none of them clever',
      trap: 'Skipping the diagram and going straight to a table is where extra states appear. The diagram is where you find out that two states you drew are actually the same state.',
      narration: 'The design flow is five steps and none of them is clever: state diagram, state table, state assignment, flip-flop inputs, minimised expressions.'
    },
    {
      id: 'ds-2', start: 217.5, end: 225, scene: 'design',
      caption: 'State assignment is a free choice. It does not change the behaviour, only the size of the circuit, so two designers can produce different expressions for the same machine.',
      detail: 'Any injective assignment of bit patterns to states gives a correct machine. The expressions, the gate count and the critical path all change with the assignment, and finding the cheapest one is a hard problem in general. The page verifies that two different assignments produce the same state sequence, which is what "same machine" means.',
      keyword: 'a free choice',
      trap: 'Two different correct answers to a design question are not a contradiction. If the paper asks for the minimum number of gates, it has fixed something else - usually the assignment - and that clause is part of the question.',
      narration: 'State assignment is a free choice. It does not change the behaviour, only the size of the circuit, so two designers can produce different expressions for the same machine.'
    },
    {
      id: 'ds-3', start: 225, end: 232.5, scene: 'design',
      caption: 'The excitation table turns "this bit must go from 0 to 1" into the input that does it. For D the input is the next state itself; for T it is the exclusive-OR of present and next.',
      detail: 'For a JK flip-flop two of the four transitions have a don\'t-care input, because either value works. That is where multiple minimal solutions come from in JK design questions. The page checks every transition against every flip-flop type, so the tables are derived rather than quoted.',
      keyword: 'the input that does it',
      trap: 'The excitation table is the inverse of the characteristic table, and mixing the two directions is the classic slip. Characteristic: given the input, what is the next state. Excitation: given the transition, what input is needed.',
      narration: 'The excitation table turns "this bit must go from 0 to 1" into the input that does it. For D the input is the next state itself; for T it is the exclusive-OR of present and next.'
    },
    {
      id: 'ds-4', start: 232.5, end: 240, scene: 'design',
      caption: 'The unused states are a decision, not an accident: treat them as don\'t-cares and the circuit is smaller, but check where they go.',
      detail: 'A mod-6 counter in three flip-flops leaves two encodings unused. Marking their next states as don\'t-cares lets the minimiser pick the cheapest expressions, and those expressions still send the unused states somewhere. A machine is self-starting only if every unused state eventually reaches the cycle; otherwise one glitch can park it forever.',
      keyword: 'check where they go',
      trap: 'The don\'t-care that shrinks the circuit is the same one that can create a lock-out. Both facts come from the same decision, so the check is not optional bookkeeping - it is the other half of the design.',
      narration: 'The unused states are a decision, not an accident: treat them as don\'t-cares and the circuit is smaller, but check where they go.'
    },

    /* ---------------- scene 9: analysis ---------------- */
    {
      id: 'an-1', start: 240, end: 247.5, scene: 'analyse',
      caption: 'Do not simulate in your head. Write one next-state equation per flip-flop, straight from the gate network, and nothing else.',
      detail: 'Label every gate output with an expression, as in the combinational lesson, and stop when you reach each flip-flop input. Then convert the input to a next state by the flip-flop type: for D the input is the next state, for T it is the exclusive-OR with the present state, for JK it is the characteristic equation. Three lines of algebra replace a page of guessing.',
      keyword: 'one next-state equation per flip-flop',
      trap: 'The output function is a separate equation. A circuit can have perfectly clear next-state equations and an output that also depends on the input, which makes it Mealy. Do not assume Moore because the diagram is small.',
      narration: 'Do not simulate in your head. Write one next-state equation per flip-flop, straight from the gate network, and nothing else.'
    },
    {
      id: 'an-2', start: 247.5, end: 255, scene: 'analyse',
      caption: 'Then tabulate: every present state in a column, its next state in the next column, for every input. The cycle appears as a repeat.',
      detail: 'This is the state table read backwards from the equations. Two flip-flops give four rows, so the whole table fits on a line, and the transitions can be followed by eye. The page builds the table for a worked circuit and follows it until a state repeats.',
      keyword: 'every present state in a column',
      trap: 'The table has one row per state, not per clock. A sequence question asks what happens after k clocks, which is a walk of k steps through the table, not k rows.',
      narration: 'Then tabulate: every present state in a column, its next state in the next column, for every input. The cycle appears as a repeat.'
    },
    {
      id: 'an-3', start: 255, end: 262.5, scene: 'analyse',
      caption: 'From 11 with the T flip-flop driven by the other output and the D flip-flop fed from it, the states go 11, 01, 10, 11: a three-state cycle. That is GATE CSE 2017 Set 1, Question 33.',
      detail: 'The equations are Q1 next equals Q1 exclusive-OR Q0, and Q0 next equals Q1. Starting at 11 the walk is 11, 01, 10 and back to 11, so after three clocks the pair is 11 again and after four it is 01. The page simulates the same circuit and prints the walk.',
      keyword: '11, 01, 10, 11',
      trap: 'The question asks for the value after the third and fourth cycles, and counting the initial state as cycle one shifts both answers. Write the clock number next to each row before answering.',
      narration: 'From 11 with the T flip-flop driven by the other output and the D flip-flop fed from it, the states go 11, 01, 10, 11: a three-state cycle. That is GATE CSE 2017 Set 1, Question 33.'
    },
    {
      id: 'an-4', start: 262.5, end: 270, scene: 'analyse',
      caption: 'The last step is the one people skip: list the states the cycle never visits and ask where they go.',
      detail: 'Every encoding that is not in the cycle is a state the machine can be in after power-on, after a glitch, or after a single-event upset. If the circuit sends each of them into the cycle within a few clocks, the machine is self-starting. If one of them maps to itself or to another unused state, the machine can lock out and no amount of clocking will recover it.',
      keyword: 'where do the unused states go',
      trap: 'A correct cycle and a self-starting machine are two different claims. Most design questions only ask for the cycle; a good answer states which claim it has proved.',
      narration: 'The last step is the one people skip: list the states the cycle never visits and ask where they go.'
    },

    /* ---------------- scene 10: the table ---------------- */
    {
      id: 'tb-1', start: 270, end: 277.5, scene: 'table',
      caption: 'Latch or flip-flop: level-sensitive and transparent, against edge-triggered and sampled once. Everything else in the topic follows from that line.',
      detail: 'It decides the timing model, the setup window, the race-around question and the difference between a ripple built from latches and one built from flip-flops. If a question uses the words level and edge, it is asking this.',
      keyword: 'level-sensitive against edge-triggered',
      trap: 'A transparent latch built into a counter produces a design that works at one clock speed and fails at another. The distinction is not vocabulary.',
      narration: 'Latch or flip-flop: level-sensitive and transparent, against edge-triggered and sampled once. Everything else in the topic follows from that line.'
    },
    {
      id: 'tb-2', start: 277.5, end: 285, scene: 'table',
      caption: 'Ripple or synchronous: the ripple is cheaper and slower by a factor of n; the synchronous is one flip-flop delay plus whatever logic the toggle rule needs.',
      detail: 'The ripple period is n propagation delays; the synchronous period is clock-to-Q plus the longest toggle path plus setup. For small n the ripple wins on simplicity; for large n the chain of AND gates in the toggle rule is the thing to count, not the number of flip-flops.',
      keyword: 'cheaper and slower by a factor of n',
      trap: '"Synchronous is faster" is a habit, not a theorem. Count the toggle logic before saying it.',
      narration: 'Ripple or synchronous: the ripple is cheaper and slower by a factor of n; the synchronous is one flip-flop delay plus whatever logic the toggle rule needs.'
    },
    {
      id: 'tb-3', start: 285, end: 292.5, scene: 'table',
      caption: 'The five traps: the forbidden SR input, race-around, hold mistaken for setup, an uninitialised ring counter, and an unused state that locks out.',
      detail: 'Each one is a single mark lost on a question whose concept was understood. Two are about invalid states, two about time, one about a decision that has a second consequence. All five are cheap to check and expensive to miss.',
      keyword: 'The five traps',
      trap: 'Four of the five can be caught by writing one extra line: the next state of the invalid encoding, the width of the clock, the shortest path, and the feedback of the all-zeros state.',
      narration: 'The five traps: the forbidden SR input, race-around, hold mistaken for setup, an uninitialised ring counter, and an unused state that locks out.'
    },
    {
      id: 'tb-4', start: 292.5, end: 300, scene: 'table',
      caption: 'The rule: name the state, write the next-state function, then count the clock. Every sequential question is those three steps in that order.',
      detail: 'Naming the state fixes the table. The next-state function fixes the cycle. Counting the clock fixes the timing answer. An answer that starts from the clock is a guess that sometimes looks right, and an answer that starts from the picture is a guess that sometimes is right.',
      keyword: 'name the state, write the function, count the clock',
      trap: 'Starting from the clock is the commonest order error: it produces a timing number for a circuit whose state you have not established, and both halves are then unverifiable.',
      narration: 'The rule: name the state, write the next-state function, then count the clock. Every sequential question is those three steps in that order.'
    }
  ]
};
