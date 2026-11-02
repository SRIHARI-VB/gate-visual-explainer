# Flip-Flop Conversion: Building One Flip-Flop From Another, and the Gate Count Each Direction Costs — transcript

Full narration and caption text in reading order, with scene headings. This is the
accessibility fallback and the printable study document for the lesson.

- Lesson: `topics/flip-flop-conversion/index.html`
- Total duration: 6:06 (366 seconds), 12 scenes, 47 caption segments
- **Timings are estimated** from the timeline at a normal speaking rate. They were not measured from recorded audio, because no audio file is shipped with this lesson.
- Subtitle files derived from the same timeline: `captions.vtt`, `captions.srt`

---

## Scene 1. A chip stocks one flip-flop; the design needs another

*0:00 – 0:28 · objective: undefined*

**0:00–0:08** — You have a J K flip-flop in the parts box, and the design asks for a T flip-flop. Conversion is the question of what to wire to the inputs.

> Caption: You have a JK flip-flop in the parts box and the design asks for a T flip-flop. Conversion is the question of what to wire to the inputs.

Exam-trap caption mode adds: *A conversion is not a new flip-flop. It is the old one with gates in front of it, so it inherits the old one's clock, setup time and hold time.*

**0:08–0:16** — Two things are given. The behaviour you want, called the target. The device you have, called the host. The answer is a Boolean equation for every input of the host.

> Caption: Two things are given: the behaviour you want, and the device you have. The answer is a Boolean equation for each input of the device.

**0:16–0:23** — Four standard types, S R, J K, D and T, give twelve conversions: four possible hosts, and three possible targets for each host.

> Caption: Four types means twelve conversions: four possible hosts, three possible targets each.

**0:23–0:28** — Every conversion on this page is computed, and then simulated on every input row, before it is drawn.

> Caption: Every conversion on this page is computed and then simulated on every input row before it is drawn.

## Scene 2. Four types, one question: hold, set, reset, toggle

*0:28 – 0:58 · objective: undefined*

**0:28–0:36** — A flip-flop is a one-bit memory with a small menu. Hold the bit, set it to one, reset it to zero, or flip it.

> Caption: A flip-flop is a one-bit memory with a small menu: hold the bit, set it, reset it, or flip it.

**0:36–0:44** — D names the next state directly. T says flip, or do not flip. S R says set or reset. J K says both, and defines what the both case means.

> Caption: D names the next state directly. T says flip or do not flip. SR says set or reset. JK says both, and defines the both case.

**0:44–0:51** — The two-input types have four input rows each. The one-input types have two.

> Caption: The two-input types have four input rows each. The one-input types have two.

Exam-trap caption mode adds: *Row count is the number of input combinations, not the number of transitions. Every type has exactly four possible transitions, from Q to Q-plus.*

**0:51–0:58** — S R has one forbidden row, where both inputs are one. That single missing row is what makes some conversions cheaper than their mirror image.

> Caption: SR has one forbidden row. That single missing row is what makes some conversions cheaper than their mirror image.

Exam-trap caption mode adds: *The forbidden row does not disappear when SR is the target. A conversion into SR is only required to work where SR itself is defined.*

## Scene 3. The excitation table is the characteristic table read backwards

*0:58 – 1:30 · objective: undefined*

**0:58–1:06** — The characteristic table goes from inputs to next state. Design needs the other direction.

> Caption: The characteristic table goes from inputs to next state. Design needs the other direction.

**1:06–1:15** — Read the excitation table as an instruction. To go from the present state to the next state, drive the input like this.

> Caption: Read the excitation table as: to go from Q to Q-plus, drive the input like this.

**1:15–1:23** — D and T are single-valued, one input value for each transition. J K leaves one of its inputs free on all four of its transitions, and S R on two of them.

> Caption: D and T are single-valued: one input value per transition. JK leaves an input free on all four of its transitions, SR on two.

Exam-trap caption mode adds: *X in an excitation table means you may choose, not that the hardware chooses. The choice is yours and it is what minimisation spends.*

**1:23–1:30** — Those free entries are the whole reason one direction of a conversion can be cheaper than the other.

> Caption: Those free entries are the whole reason one direction of a conversion can be cheaper than the other.

## Scene 4. The four steps that produce the input equations

*1:30 – 2:02 · objective: undefined*

**1:30–1:38** — Step one. Write the characteristic table of the target, and delete any row the target itself forbids.

> Caption: Step one: write the target's characteristic table, and delete any row the target itself forbids.

**1:38–1:46** — Step two. For each row, read the host excitation table to get the host inputs that produce that transition.

> Caption: Step two: for each row, read the host's excitation table to get the host inputs that produce that transition.

**1:46–1:54** — Step three, minimise each host input over the target inputs and Q. Step four, simulate every row again and check the host now behaves as the target.

> Caption: Step three: minimise each host input over the target's inputs and Q. Step four: simulate every row again.

Exam-trap caption mode adds: *Step four is the step that catches a K-map slip. It is cheap: eight rows for a two-input target, four for a one-input target.*

**1:54–2:02** — The variable list is the target inputs, then Q. Never the host inputs, which are what you are solving for.

> Caption: The variable list is the target's inputs, then Q. Never the host's inputs, which are what you are solving for.

Exam-trap caption mode adds: *The answer is always a function of the target inputs and the present state. If your equation mentions a host input, you have solved the wrong direction.*

## Scene 5. Two conversions need no gates at all

*2:02 – 2:32 · objective: undefined*

**2:02–2:10** — J K to T. Tie J and K together, and drive both with T. Zero gates.

> Caption: JK to T: tie J and K together and drive both with T. Zero gates.

**2:10–2:18** — J K to S R. Drive J with S and K with R. Zero gates, and S equals R equals one is still forbidden.

> Caption: JK to SR: drive J with S and K with R. Zero gates, and S = R = 1 is still forbidden.

Exam-trap caption mode adds: *A converted SR flip-flop does not lose its forbidden input. It inherits a defined behaviour there, but the SR interface still says the input is illegal.*

**2:18–2:25** — Both free conversions use J K as the host, because J K already has a toggle and a hold built in.

> Caption: Both free conversions use JK as the host, because JK already has a toggle and a hold built in.

Exam-trap caption mode adds: *Do not generalise this to "conversions are free". Only two of the twelve are, and both need JK as the host.*

**2:25–2:32** — The reverse direction is not free. T to J K needs three gates, and S R to J K needs two.

> Caption: The reverse direction is not free: T to JK needs three gates, and SR to JK needs two.

## Scene 6. SR to JK: the toggle has to be built from Q and not-Q

*2:32 – 3:04 · objective: undefined*

**2:32–2:40** — S R to J K. The naive wiring is S equal to J and R equal to K, and it fails.

> Caption: SR to JK. The naive wiring is S equal to J and R equal to K, and it fails.

Exam-trap caption mode adds: *This is the conversion most often got wrong. The wiring looks like the JK to SR answer read backwards, and it is not.*

**2:40–2:49** — The fix. S is J and not-Q, R is K and Q. The toggle is steered by the present state.

> Caption: The fix: S is J and not-Q, R is K and Q. The toggle is steered by the present state.

**2:49–2:57** — Two AND gates, and the Q and not-Q wires come from the flip-flop's own outputs.

> Caption: Two AND gates, and the Q and not-Q wires come from the flip-flop's own outputs.

**2:57–3:04** — Check that the forbidden row is never reached. With these equations, S and R are never both one.

> Caption: Check the forbidden row is never reached: with these equations S and R are never both one.

Exam-trap caption mode adds: *A conversion into an SR host must be checked for forbidden-input generation. An equation that is correct on the transitions can still drive S = R = 1.*

## Scene 7. From a one-input host: the equation carries Q

*3:04 – 3:36 · objective: undefined*

**3:04–3:12** — Now the host has only one input, D, so there is exactly one equation, and it must carry the whole target.

> Caption: Now the host has only one input, so there is exactly one equation, and it must carry the whole target.

**3:12–3:21** — D to J K. D is J and not-Q, or not-K and Q. That is the J K characteristic equation itself.

> Caption: D to JK: D is J and not-Q, or not-K and Q. That is the JK characteristic equation itself.

**3:21–3:29** — D to S R. D is S, or not-R and Q. Three gates, and S equals R equals one is excluded.

> Caption: D to SR: D is S, or not-R and Q. Three gates, and S = R = 1 is excluded.

**3:29–3:36** — A one-input host is the most expensive host. Its three conversions cost eleven gates between them.

> Caption: A one-input host is the most expensive host: its three conversions cost eleven gates between them.

## Scene 8. D and T: the one pair that costs the same both ways

*3:36 – 4:06 · objective: undefined*

**3:36–3:44** — D to T is D equal to T exclusive or Q. T to D is T equal to D exclusive or Q.

> Caption: D to T is D equal to T exclusive-or Q. T to D is T equal to D exclusive-or Q.

**3:44–3:52** — In and, or and not form each costs four gates. As a single exclusive-or gate, each costs one.

> Caption: In AND, OR and NOT form each costs four gates. As a single exclusive-or gate, each costs one.

Exam-trap caption mode adds: *Never mix conventions inside one comparison. A gate count is only meaningful against the stated gate set.*

**3:52–3:59** — Every other pair is asymmetric. J K to S R is free, while S R to J K is two gates.

> Caption: Every other pair is asymmetric: JK to SR is free while SR to JK is two gates.

**3:59–4:06** — So the direction of the question matters. Convert A to B and convert B to A are different circuits.

> Caption: So the direction of a question matters. "Convert A to B" and "convert B to A" are different circuits.

Exam-trap caption mode adds: *Find the words "using" and "into". "Design a T flip-flop using a JK flip-flop" is JK to T, which is free. The reverse is not.*

## Scene 9. All twelve conversions, and what each direction costs

*4:06 – 4:42 · objective: undefined*

**4:06–4:14** — Here is the whole square. Twelve conversions, each with its equations, its gate count and its verification.

> Caption: Here is the whole square: twelve conversions, each with its equations, its gate count and its verification.

**4:14–4:22** — Six conversions need one equation and six need two, exactly matching whether the host has one input or two.

> Caption: Six conversions need one equation and six need two, exactly matching whether the host has one input or two.

**4:22–4:31** — Eight of the twelve need Q on the input path. Only four are pure functions of the target inputs.

> Caption: Eight of the twelve need Q on the input path. Only four are pure functions of the target inputs.

**4:31–4:42** — Total cost, twenty seven gates. With J K as the host the three conversions cost one gate, with S R five, with T ten, and with D eleven.

> Caption: Total cost: twenty-seven gates. JK as host costs one, SR five, T ten, D eleven.

Exam-trap caption mode adds: *Do not memorise the totals. Derive the two equations you need from the excitation tables; the totals are a check, not a shortcut.*

## Scene 10. Verification: every row, and the wiring that fails two

*4:42 – 5:12 · objective: undefined*

**4:42–4:50** — Verification is not optional. Each conversion is simulated on every row of its domain.

> Caption: Verification is not optional. Each conversion is simulated on every row of its domain.

**4:50–4:58** — A conversion into S R has six rows, not eight, because S equals R equals one is outside the target domain.

> Caption: A conversion into SR has six rows, not eight, because S = R = 1 is outside the target's domain.

Exam-trap caption mode adds: *If you verify a conversion into SR on all eight rows, you will reject a correct answer, because the two forbidden rows have no required behaviour.*

**4:58–5:06** — The naive S R to J K wiring fails on exactly two rows, and both of them are J equals K equals one.

> Caption: The naive SR to JK wiring fails on exactly two rows, and both are J = K = 1.

**5:06–5:12** — All twelve conversions pass every row of their domain. The page runs its checks on every load and reports them beside the animation.

> Caption: All twelve conversions pass every row of their domain. That is thirty-four model checks, run on load.

## Scene 11. How GATE asks it, and the two sequences it wants

*5:12 – 5:42 · objective: undefined*

**5:12–5:20** — Four question shapes. Derive the equations, count the gates, trace an output, or spot the wrong circuit.

> Caption: Four question shapes: derive the equations, count the gates, trace an output, or spot the wrong circuit.

**5:20–5:29** — GATE CSE 2015 Set one wires a D flip-flop to a J K flip-flop and asks for the output sequence. The sequence is zero, one, one, and it repeats.

> Caption: GATE CSE 2015 Set 1 wires a D flip-flop to a JK flip-flop and asks for the output sequence: 0, 1, 1, repeating.

**5:29–5:37** — GATE CSE 2017 Set two gives a saturating counter and asks for the T inputs. T one is Q one bar and Q zero. T zero is Q one bar or Q zero bar.

> Caption: GATE CSE 2017 Set 2 gives a saturating counter and asks for the T inputs: T1 is Q1-bar Q0, T0 is Q1-bar or Q0-bar.

**5:37–5:42** — In every shape the first move is the same. Write the target table, then read the host backwards.

> Caption: In every shape the first move is the same: write the target's table, then read the host backwards.

## Scene 12. One screen to hold

*5:42 – 6:06 · objective: undefined*

**5:42–5:50** — A conversion is an equation problem. The target fixes the transition, and the host supplies the input.

> Caption: A conversion is an equation problem: the target fixes the transition, the host supplies the input.

**5:50–5:58** — The free entries in an excitation table are the currency. J K spends them, S R spends two, and D and T spend none.

> Caption: The free entries in an excitation table are the currency. JK spends them, SR spends two, D and T spend none.

**5:58–6:06** — Derive, minimise, then simulate every row. That order is the whole topic.

> Caption: Derive, minimise, then simulate every row. That order is the whole topic.

---

Captions are on by default in the lesson and can be switched to Detailed, Keyword,
Exam trap or Off without restarting. Narration audio is not shipped; the lesson offers
optional browser speech synthesis, whose voice availability differs by platform.
