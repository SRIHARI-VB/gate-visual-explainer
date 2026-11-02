/* ==========================================================================
   flip-flop-conversion - THE timeline.
   Single source of truth for: animation state, captions, narration, scene
   boundaries, subtitle files and the transcript. Nothing else hardcodes a time.
   Generated files (captions.vtt, captions.srt, transcript.md) are derived from
   this file by tools/gen-captions.mjs - never edited by hand.
   ========================================================================== */

window.LESSON_TIMELINE = {
  duration: 366,

  scenes: [
    { id: 'why',       n: 1,  title: 'A chip stocks one flip-flop; the design needs another', start: 0,   end: 28  },
    { id: 'four',      n: 2,  title: 'Four types, one question: hold, set, reset, toggle',      start: 28,  end: 58  },
    { id: 'excite',    n: 3,  title: 'The excitation table is the characteristic table read backwards', start: 58, end: 90 },
    { id: 'procedure', n: 4,  title: 'The four steps that produce the input equations',         start: 90,  end: 122 },
    { id: 'free',      n: 5,  title: 'Two conversions need no gates at all',                    start: 122, end: 152 },
    { id: 'sr2jk',     n: 6,  title: 'SR to JK: the toggle has to be built from Q and not-Q',   start: 152, end: 184 },
    { id: 'd2jk',      n: 7,  title: 'From a one-input host: the equation carries Q',           start: 184, end: 216 },
    { id: 'xor',       n: 8,  title: 'D and T: the one pair that costs the same both ways',      start: 216, end: 246 },
    { id: 'table',     n: 9,  title: 'All twelve conversions, and what each direction costs',    start: 246, end: 282 },
    { id: 'verify',    n: 10, title: 'Verification: every row, and the wiring that fails two',  start: 282, end: 312 },
    { id: 'gate',      n: 11, title: 'How GATE asks it, and the two sequences it wants',         start: 312, end: 342 },
    { id: 'hold',      n: 12, title: 'One screen to hold',                                      start: 342, end: 366 }
  ],

  events: [
    /* ---- 1. why -------------------------------------------------------- */
    { id: 'y1', scene: 'why', start: 0, end: 8,
      caption: 'You have a JK flip-flop in the parts box and the design asks for a T flip-flop. Conversion is the question of what to wire to the inputs.',
      narration: 'You have a J K flip-flop in the parts box, and the design asks for a T flip-flop. Conversion is the question of what to wire to the inputs.',
      detail: 'The storage element is not replaced. The host flip-flop stays exactly as it is; only the logic in front of its inputs changes.',
      keyword: 'wire to the inputs',
      trap: 'A conversion is not a new flip-flop. It is the old one with gates in front of it, so it inherits the old one\'s clock, setup time and hold time.' },

    { id: 'y2', scene: 'why', start: 8, end: 16,
      caption: 'Two things are given: the behaviour you want, and the device you have. The answer is a Boolean equation for each input of the device.',
      narration: 'Two things are given. The behaviour you want, called the target. The device you have, called the host. The answer is a Boolean equation for every input of the host.',
      detail: 'Target = the type whose characteristic table must be reproduced. Host = the type physically present. Every conversion is written host to target.',
      keyword: 'target' },

    { id: 'y3', scene: 'why', start: 16, end: 23,
      caption: 'Four types means twelve conversions: four possible hosts, three possible targets each.',
      narration: 'Four standard types, S R, J K, D and T, give twelve conversions: four possible hosts, and three possible targets for each host.',
      detail: 'The four by four square has sixteen cells; four of them are a type converted to itself, which is a straight wire and is not counted.',
      keyword: 'twelve' },

    { id: 'y4', scene: 'why', start: 23, end: 28,
      caption: 'Every conversion on this page is computed and then simulated on every input row before it is drawn.',
      narration: 'Every conversion on this page is computed, and then simulated on every input row, before it is drawn.',
      detail: 'The page derives the excitation tables by search, derives each input equation by minimisation, and then re-simulates the host to confirm it reproduces the target.',
      keyword: 'simulated' },

    /* ---- 2. four ------------------------------------------------------- */
    { id: 'f1', scene: 'four', start: 28, end: 36,
      caption: 'A flip-flop is a one-bit memory with a small menu: hold the bit, set it, reset it, or flip it.',
      narration: 'A flip-flop is a one-bit memory with a small menu. Hold the bit, set it to one, reset it to zero, or flip it.',
      detail: 'Every type in the standard family is one way of assigning input combinations to those four actions.',
      keyword: 'menu' },

    { id: 'f2', scene: 'four', start: 36, end: 44,
      caption: 'D names the next state directly. T says flip or do not flip. SR says set or reset. JK says both, and defines the both case.',
      narration: 'D names the next state directly. T says flip, or do not flip. S R says set or reset. J K says both, and defines what the both case means.',
      detail: 'D: Q+ = D. T: Q+ = T xor Q. JK: Q+ = J not-Q + not-K Q. SR: Q+ = S + not-R Q, with S R = 1 excluded.',
      keyword: 'directly' },

    { id: 'f3', scene: 'four', start: 44, end: 51,
      caption: 'The two-input types have four input rows each. The one-input types have two.',
      narration: 'The two-input types have four input rows each. The one-input types have two.',
      detail: 'This row count is why the conversion cost differs: a two-input host needs two equations and a one-input host needs one.',
      keyword: 'four input rows',
      trap: 'Row count is the number of input combinations, not the number of transitions. Every type has exactly four possible transitions, from Q to Q-plus.' },

    { id: 'f4', scene: 'four', start: 51, end: 58,
      caption: 'SR has one forbidden row. That single missing row is what makes some conversions cheaper than their mirror image.',
      narration: 'S R has one forbidden row, where both inputs are one. That single missing row is what makes some conversions cheaper than their mirror image.',
      detail: 'Because S R = 1 is never exercised, the host SR is free to output anything on that row, which is exactly the freedom the SR to JK conversion needs.',
      keyword: 'forbidden',
      trap: 'The forbidden row does not disappear when SR is the target. A conversion into SR is only required to work where SR itself is defined.' },

    /* ---- 3. excite ----------------------------------------------------- */
    { id: 'e1', scene: 'excite', start: 58, end: 66,
      caption: 'The characteristic table goes from inputs to next state. Design needs the other direction.',
      narration: 'The characteristic table goes from inputs to next state. Design needs the other direction.',
      detail: 'Design fixes the transition and asks which input produces it. That reversed table is the excitation table.',
      keyword: 'other direction' },

    { id: 'e2', scene: 'excite', start: 66, end: 75,
      caption: 'Read the excitation table as: to go from Q to Q-plus, drive the input like this.',
      narration: 'Read the excitation table as an instruction. To go from the present state to the next state, drive the input like this.',
      detail: 'Four rows, one per transition: zero to zero, zero to one, one to zero, one to one. The table is derived here by searching every input combination, not copied.',
      keyword: 'instruction' },

    { id: 'e3', scene: 'excite', start: 75, end: 83,
      caption: 'D and T are single-valued: one input value per transition. JK leaves an input free on all four of its transitions, SR on two.',
      narration: 'D and T are single-valued, one input value for each transition. J K leaves one of its inputs free on all four of its transitions, and S R on two of them.',
      detail: 'For JK, a zero to one transition needs J = 1 and leaves K free, because J alone forces the output. The free entry is written X and is a genuine don\'t-care.',
      keyword: 'free entry',
      trap: 'X in an excitation table means you may choose, not that the hardware chooses. The choice is yours and it is what minimisation spends.' },

    { id: 'e4', scene: 'excite', start: 83, end: 90,
      caption: 'Those free entries are the whole reason one direction of a conversion can be cheaper than the other.',
      narration: 'Those free entries are the whole reason one direction of a conversion can be cheaper than the other.',
      detail: 'A host with free entries can absorb part of the target\'s behaviour for nothing. A host with no free entries must have every bit of the target computed for it.',
      keyword: 'free entries' },

    /* ---- 4. procedure -------------------------------------------------- */
    { id: 'p1', scene: 'procedure', start: 90, end: 98,
      caption: 'Step one: write the target\'s characteristic table, and delete any row the target itself forbids.',
      narration: 'Step one. Write the characteristic table of the target, and delete any row the target itself forbids.',
      detail: 'Deleting the row is not cosmetic. The deleted row becomes a don\'t-care in step three, and using it is what makes an SR to JK conversion cost two gates instead of four.',
      keyword: 'Step one' },

    { id: 'p2', scene: 'procedure', start: 98, end: 106,
      caption: 'Step two: for each row, read the host\'s excitation table to get the host inputs that produce that transition.',
      narration: 'Step two. For each row, read the host excitation table to get the host inputs that produce that transition.',
      detail: 'Where the host\'s excitation row has a free entry, the corresponding cell of the host input function is a don\'t-care.',
      keyword: 'Step two' },

    { id: 'p3', scene: 'procedure', start: 106, end: 114,
      caption: 'Step three: minimise each host input over the target\'s inputs and Q. Step four: simulate every row again.',
      narration: 'Step three, minimise each host input over the target inputs and Q. Step four, simulate every row again and check the host now behaves as the target.',
      detail: 'The minimisation here is exact: prime implicants are enumerated and the smallest cover is chosen, so the gate counts on this page are minimal for two-level sum-of-products form under the stated counting convention.',
      keyword: 'simulate',
      trap: 'Step four is the step that catches a K-map slip. It is cheap: eight rows for a two-input target, four for a one-input target.' },

    { id: 'p4', scene: 'procedure', start: 114, end: 122,
      caption: 'The variable list is the target\'s inputs, then Q. Never the host\'s inputs, which are what you are solving for.',
      narration: 'The variable list is the target inputs, then Q. Never the host inputs, which are what you are solving for.',
      detail: 'Writing the host\'s own inputs as the map variables is the single most common way to produce a plausible equation that is wrong.',
      keyword: 'then Q',
      trap: 'The answer is always a function of the target inputs and the present state. If your equation mentions a host input, you have solved the wrong direction.' },

    /* ---- 5. free ------------------------------------------------------- */
    { id: 'fr1', scene: 'free', start: 122, end: 130,
      caption: 'JK to T: tie J and K together and drive both with T. Zero gates.',
      narration: 'J K to T. Tie J and K together, and drive both with T. Zero gates.',
      detail: 'T = 0 gives J = K = 0, which is JK hold. T = 1 gives J = K = 1, which is JK toggle. The two cases line up exactly with the two states of T.',
      keyword: 'Zero gates' },

    { id: 'fr2', scene: 'free', start: 130, end: 138,
      caption: 'JK to SR: drive J with S and K with R. Zero gates, and S = R = 1 is still forbidden.',
      narration: 'J K to S R. Drive J with S and K with R. Zero gates, and S equals R equals one is still forbidden.',
      detail: 'The conversion is only required on the valid SR domain, S R = 0, and there J = S and K = R reproduce SR exactly. On the forbidden row the host would toggle, but that row can never be requested.',
      keyword: 'still forbidden',
      trap: 'A converted SR flip-flop does not lose its forbidden input. It inherits a defined behaviour there, but the SR interface still says the input is illegal.' },

    { id: 'fr3', scene: 'free', start: 138, end: 145,
      caption: 'Both free conversions use JK as the host, because JK already has a toggle and a hold built in.',
      narration: 'Both free conversions use J K as the host, because J K already has a toggle and a hold built in.',
      detail: 'A host that already contains the target\'s actions as input rows needs no logic to expose them. That is why the richest host is the cheapest one to convert from.',
      keyword: 'already has',
      trap: 'Do not generalise this to "conversions are free". Only two of the twelve are, and both need JK as the host.' },

    { id: 'fr4', scene: 'free', start: 145, end: 152,
      caption: 'The reverse direction is not free: T to JK needs three gates, and SR to JK needs two.',
      narration: 'The reverse direction is not free. T to J K needs three gates, and S R to J K needs two.',
      detail: 'T as a host has no free entries in its excitation table, so every bit of JK behaviour must be computed by gates. The asymmetry is a property of the tables, not of the drawing.',
      keyword: 'not free' },

    /* ---- 6. sr2jk ------------------------------------------------------ */
    { id: 's1', scene: 'sr2jk', start: 152, end: 160,
      caption: 'SR to JK. The naive wiring is S equal to J and R equal to K, and it fails.',
      narration: 'S R to J K. The naive wiring is S equal to J and R equal to K, and it fails.',
      detail: 'When J = K = 1 the naive wiring asks the SR host for S = R = 1, which is its forbidden input. That happens on two of the eight rows: both values of Q.',
      keyword: 'fails',
      trap: 'This is the conversion most often got wrong. The wiring looks like the JK to SR answer read backwards, and it is not.' },

    { id: 's2', scene: 'sr2jk', start: 160, end: 169,
      caption: 'The fix: S is J and not-Q, R is K and Q. The toggle is steered by the present state.',
      narration: 'The fix. S is J and not-Q, R is K and Q. The toggle is steered by the present state.',
      detail: 'If the output is currently zero, the only way to flip it is to set, so the set input is enabled. If the output is currently one, the only way to flip it is to reset, so the reset input is enabled.',
      keyword: 'steered' },

    { id: 's3', scene: 'sr2jk', start: 169, end: 177,
      caption: 'Two AND gates, and the Q and not-Q wires come from the flip-flop\'s own outputs.',
      narration: 'Two AND gates, and the Q and not-Q wires come from the flip-flop\'s own outputs.',
      detail: 'Most flip-flops expose both Q and its complement, so no inverter is charged. If only Q were available, one more gate would be needed, which is a convention of the parts box, not of the algebra.',
      keyword: 'Two AND gates' },

    { id: 's4', scene: 'sr2jk', start: 177, end: 184,
      caption: 'Check the forbidden row is never reached: with these equations S and R are never both one.',
      narration: 'Check that the forbidden row is never reached. With these equations, S and R are never both one.',
      detail: 'S is J and not-Q, R is K and Q. For both to be one, Q would have to be zero and one at once. The page checks all eight rows and finds no violation.',
      keyword: 'never both one',
      trap: 'A conversion into an SR host must be checked for forbidden-input generation. An equation that is correct on the transitions can still drive S = R = 1.' },

    /* ---- 7. d2jk ------------------------------------------------------- */
    { id: 'd1', scene: 'd2jk', start: 184, end: 192,
      caption: 'Now the host has only one input, so there is exactly one equation, and it must carry the whole target.',
      narration: 'Now the host has only one input, D, so there is exactly one equation, and it must carry the whole target.',
      detail: 'D names the next state directly, so the required D is simply the target\'s next-state expression written in terms of the target\'s inputs and Q.',
      keyword: 'one equation' },

    { id: 'd2', scene: 'd2jk', start: 192, end: 201,
      caption: 'D to JK: D is J and not-Q, or not-K and Q. That is the JK characteristic equation itself.',
      narration: 'D to J K. D is J and not-Q, or not-K and Q. That is the J K characteristic equation itself.',
      detail: 'Four gates: two AND, one OR, one NOT for not-K. Q and not-Q come from the host for free.',
      keyword: 'characteristic equation' },

    { id: 'd3', scene: 'd2jk', start: 201, end: 209,
      caption: 'D to SR: D is S, or not-R and Q. Three gates, and S = R = 1 is excluded.',
      narration: 'D to S R. D is S, or not-R and Q. Three gates, and S equals R equals one is excluded.',
      detail: 'The term S stands alone because S = 1 forces the next state to one regardless of R and Q. The second term covers the hold case.',
      keyword: 'Three gates' },

    { id: 'd4', scene: 'd2jk', start: 209, end: 216,
      caption: 'A one-input host is the most expensive host: its three conversions cost eleven gates between them.',
      narration: 'A one-input host is the most expensive host. Its three conversions cost eleven gates between them.',
      detail: 'D to SR three, D to JK four, D to T four. The host contributes nothing but a wire, so every term of the target has to be built.',
      keyword: 'eleven gates' },

    /* ---- 8. xor -------------------------------------------------------- */
    { id: 'x1', scene: 'xor', start: 216, end: 224,
      caption: 'D to T is D equal to T exclusive-or Q. T to D is T equal to D exclusive-or Q.',
      narration: 'D to T is D equal to T exclusive or Q. T to D is T equal to D exclusive or Q.',
      detail: 'Both equations are the same shape, because exclusive-or is symmetric in its two arguments. That is the only reason this pair is symmetric.',
      keyword: 'exclusive-or' },

    { id: 'x2', scene: 'xor', start: 224, end: 232,
      caption: 'In AND, OR and NOT form each costs four gates. As a single exclusive-or gate, each costs one.',
      narration: 'In and, or and not form each costs four gates. As a single exclusive-or gate, each costs one.',
      detail: 'The four gates are two AND, one OR and one NOT. The counting convention is stated on the page and the same convention is applied to all twelve conversions.',
      keyword: 'four gates',
      trap: 'Never mix conventions inside one comparison. A gate count is only meaningful against the stated gate set.' },

    { id: 'x3', scene: 'xor', start: 232, end: 239,
      caption: 'Every other pair is asymmetric: JK to SR is free while SR to JK is two gates.',
      narration: 'Every other pair is asymmetric. J K to S R is free, while S R to J K is two gates.',
      detail: 'The three asymmetric pairs are SR and JK, SR and D, and JK and D. Their cost differences are two, two and three gates.',
      keyword: 'asymmetric' },

    { id: 'x4', scene: 'xor', start: 239, end: 246,
      caption: 'So the direction of a question matters. "Convert A to B" and "convert B to A" are different circuits.',
      narration: 'So the direction of the question matters. Convert A to B and convert B to A are different circuits.',
      detail: 'Reading the direction backwards is the second most common error after misreading the excitation table.',
      keyword: 'direction',
      trap: 'Find the words "using" and "into". "Design a T flip-flop using a JK flip-flop" is JK to T, which is free. The reverse is not.' },

    /* ---- 9. table ------------------------------------------------------ */
    { id: 't1', scene: 'table', start: 246, end: 254,
      caption: 'Here is the whole square: twelve conversions, each with its equations, its gate count and its verification.',
      narration: 'Here is the whole square. Twelve conversions, each with its equations, its gate count and its verification.',
      detail: 'Rows are the host, columns are the target. The diagonal is a straight wire and is not a conversion.',
      keyword: 'whole square' },

    { id: 't2', scene: 'table', start: 254, end: 262,
      caption: 'Six conversions need one equation and six need two, exactly matching whether the host has one input or two.',
      narration: 'Six conversions need one equation and six need two, exactly matching whether the host has one input or two.',
      detail: 'A one-input host, D or T, needs one equation. A two-input host, SR or JK, needs two. The count is a property of the host alone.',
      keyword: 'one equation' },

    { id: 't3', scene: 'table', start: 262, end: 271,
      caption: 'Eight of the twelve need Q on the input path. Only four are pure functions of the target inputs.',
      narration: 'Eight of the twelve need Q on the input path. Only four are pure functions of the target inputs.',
      detail: 'The four that ignore Q are SR to D, JK to SR, JK to D and JK to T. Each has a host or a target whose input already names the next state or the action.',
      keyword: 'Nine' },

    { id: 't4', scene: 'table', start: 271, end: 282,
      caption: 'Total cost: twenty-seven gates. JK as host costs one, SR five, T ten, D eleven.',
      narration: 'Total cost, twenty seven gates. With J K as the host the three conversions cost one gate, with S R five, with T ten, and with D eleven.',
      detail: 'The ordering is the ordering of the host\'s excitation freedom: JK has four free entries, SR two, and D and T none.',
      keyword: 'twenty-seven',
      trap: 'Do not memorise the totals. Derive the two equations you need from the excitation tables; the totals are a check, not a shortcut.' },

    /* ---- 10. verify ---------------------------------------------------- */
    { id: 'v1', scene: 'verify', start: 282, end: 290,
      caption: 'Verification is not optional. Each conversion is simulated on every row of its domain.',
      narration: 'Verification is not optional. Each conversion is simulated on every row of its domain.',
      detail: 'Sixty-six rows in total: six for each conversion into SR, eight into JK, and four into D or T.',
      keyword: 'every row' },

    { id: 'v2', scene: 'verify', start: 290, end: 298,
      caption: 'A conversion into SR has six rows, not eight, because S = R = 1 is outside the target\'s domain.',
      narration: 'A conversion into S R has six rows, not eight, because S equals R equals one is outside the target domain.',
      detail: 'The domain is the set of input combinations the target defines. A conversion is correct when it agrees there, and is not required to agree anywhere else.',
      keyword: 'six rows',
      trap: 'If you verify a conversion into SR on all eight rows, you will reject a correct answer, because the two forbidden rows have no required behaviour.' },

    { id: 'v3', scene: 'verify', start: 298, end: 306,
      caption: 'The naive SR to JK wiring fails on exactly two rows, and both are J = K = 1.',
      narration: 'The naive S R to J K wiring fails on exactly two rows, and both of them are J equals K equals one.',
      detail: 'Those are the two toggle rows. On them the naive wiring requests S = R = 1, so the host has no next state to give.',
      keyword: 'exactly two rows' },

    { id: 'v4', scene: 'verify', start: 306, end: 312,
      caption: 'All twelve conversions pass every row of their domain. That is thirty-four model checks, run on load.',
      narration: 'All twelve conversions pass every row of their domain. The page runs its checks on every load and reports them beside the animation.',
      detail: 'The checks compare the derived equation against the target row by row, and compare each gate count against the equation it came from.',
      keyword: 'pass' },

    /* ---- 11. gate ------------------------------------------------------ */
    { id: 'g1', scene: 'gate', start: 312, end: 320,
      caption: 'Four question shapes: derive the equations, count the gates, trace an output, or spot the wrong circuit.',
      narration: 'Four question shapes. Derive the equations, count the gates, trace an output, or spot the wrong circuit.',
      detail: 'The first two are direct conversions. The third composes two converted devices. The fourth gives a wiring and asks what is wrong with it.',
      keyword: 'Four question shapes' },

    { id: 'g2', scene: 'gate', start: 320, end: 329,
      caption: 'GATE CSE 2015 Set 1 wires a D flip-flop to a JK flip-flop and asks for the output sequence: 0, 1, 1, repeating.',
      narration: 'GATE CSE 2015 Set one wires a D flip-flop to a J K flip-flop and asks for the output sequence. The sequence is zero, one, one, and it repeats.',
      detail: 'Each flip-flop is the other\'s input, so the pair behaves as one machine with four states and a cycle of length three: 011 repeating, from the initial zero.',
      keyword: 'sequence' },

    { id: 'g3', scene: 'gate', start: 329, end: 337,
      caption: 'GATE CSE 2017 Set 2 gives a saturating counter and asks for the T inputs: T1 is Q1-bar Q0, T0 is Q1-bar or Q0-bar.',
      narration: 'GATE CSE 2017 Set two gives a saturating counter and asks for the T inputs. T one is Q one bar and Q zero. T zero is Q one bar or Q zero bar.',
      detail: 'The excitation table of T is one line: T is the exclusive-or of the present and next state, so each bit\'s T input is read straight off the transition.',
      keyword: 'T inputs' },

    { id: 'g4', scene: 'gate', start: 337, end: 342,
      caption: 'In every shape the first move is the same: write the target\'s table, then read the host backwards.',
      narration: 'In every shape the first move is the same. Write the target table, then read the host backwards.',
      detail: 'Nothing in this topic rewards memorising twelve answers. The procedure is four steps and it produces each answer in under a minute.',
      keyword: 'the same' },

    /* ---- 12. hold ------------------------------------------------------ */
    { id: 'h1', scene: 'hold', start: 342, end: 350,
      caption: 'A conversion is an equation problem: the target fixes the transition, the host supplies the input.',
      narration: 'A conversion is an equation problem. The target fixes the transition, and the host supplies the input.',
      detail: 'The storage element never changes. Only the logic in front of it does, and that logic is what the gate count measures.',
      keyword: 'equation problem' },

    { id: 'h2', scene: 'hold', start: 350, end: 358,
      caption: 'The free entries in an excitation table are the currency. JK spends them, SR spends two, D and T spend none.',
      narration: 'The free entries in an excitation table are the currency. J K spends them, S R spends two, and D and T spend none.',
      detail: 'This is why the host with the richest input table is the cheapest to convert from, and why the direction of the question changes the answer.',
      keyword: 'currency' },

    { id: 'h3', scene: 'hold', start: 358, end: 366,
      caption: 'Derive, minimise, then simulate every row. That order is the whole topic.',
      narration: 'Derive, minimise, then simulate every row. That order is the whole topic.',
      detail: 'Every number on this page came from that order, and the page re-runs it on every load.',
      keyword: 'simulate every row' }
  ]
};
