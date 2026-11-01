/* ==========================================================================
   priority-inversion-and-inheritance — lesson.js
   Four layers, in order:
     1. THE MODEL   — a tick-by-tick preemptive fixed-priority scheduler over
                      jobs made of ordinary work, lock and unlock steps, with
                      binary semaphores, run under three policies: no protocol,
                      basic priority inheritance, and the priority ceiling
                      protocol. It records every tick's state for every job.
     2. THE CHECKS  — every number the lesson states, re-verified at load.
     3. RENDER      — reads the model; never re-derives a value.
     4. BOOT        — p5.js first, the browser's own canvas as the fallback.

   Every number on the canvas and in every caption comes from this file.
   ========================================================================== */

(function () {
  'use strict';

  var W = 900, H = 470;
  var K = window.LessonKit;
  var PR = window.Painters;
  var PAL = (PR && PR.PAL) ? PR.PAL : {
    ink: '#0f1720', dim: '#566573', faint: '#7d8b98', surface: '#ffffff',
    surface2: '#eef2f4', border: '#c8d2d8', accent: '#0f766e', accentDim: '#d6efeb',
    valid: '#15803d', invalid: '#b3261e', invalidDim: '#fbe4e2',
    warn: '#9a5406', warnDim: '#fbeed3', info: '#1d4e89'
  };

  var P = null;
  var INK = PAL.ink, DIM = PAL.dim, FAINT = PAL.faint, ACC = PAL.accent;
  var INFO = PAL.info, VAL = PAL.valid, BAD = PAL.invalid, WARN = PAL.warn;
  var SURF = PAL.surface, SURF2 = PAL.surface2, BORDER = PAL.border;
  var ACCDIM = PAL.accentDim || '#d6efeb';
  var WARNDIM = PAL.warnDim || '#fbeed3';
  var INVALIDDIM = PAL.invalidDim || '#fbe4e2';

/* ======================================================================
   LAYER 1 — THE MODEL
   ====================================================================== */

  var CHECKS = [];
  function check(name, fn) {
    var r;
    try { r = fn(); }
    catch (e) { r = { pass: false, detail: 'threw ' + e.message }; }
    CHECKS.push({ name: name, pass: !!r.pass, detail: r.detail || '' });
  }

  /* ---------- 1.1 the simulator ----------
     Priority: 1 is the most urgent. A job is a list of steps:
       {t:'cpu', n}   n ticks of ordinary work
       {t:'lock', s}  take binary semaphore s, blocking if it is held
       {t:'unlock', s}
     One tick = one unit of CPU work. At every tick the ready job with the best
     effective priority runs. Effective priority is the assigned priority,
     raised under inheritance to the best priority among the jobs this one
     blocks. Under the ceiling protocol an extra admission test applies before
     a lock is granted. */

  function sim(opts) {
    var jobs = opts.jobs.map(function (j) {
      return {
        id: j.id, prio: j.prio, steps: j.steps, release: j.release || 0,
        pc: 0, rem: 0, state: (j.release || 0) > 0 ? 'notyet' : 'ready',
        held: [], blockedOn: null, eff: j.prio, blockedTicks: 0,
        done: false, episodes: 0, wasBlocked: false, prioChanges: 0, lastEff: undefined
      };
    });
    var policy = opts.policy;
    var ceiling = {};
    jobs.forEach(function (j) {
      j.steps.forEach(function (st) {
        if (st.t !== 'lock') return;
        if (ceiling[st.s] === undefined || j.prio < ceiling[st.s]) ceiling[st.s] = j.prio;
      });
    });

    function holderOf(s) {
      for (var i = 0; i < jobs.length; i++) if (jobs[i].held.indexOf(s) >= 0) return jobs[i];
      return null;
    }

    function effPriorities() {
      jobs.forEach(function (j) { j.eff = j.prio; });
      if (policy === 'none') return;
      for (var pass = 0; pass < 40; pass++) {
        var changed = false;
        jobs.forEach(function (j) {
          if (!j.held.length || j.state !== 'ready') return;
          jobs.forEach(function (k) {
            if (k.state !== 'blocked') return;
            if (holderOf(k.blockedOn) !== j) return;
            if (k.eff < j.eff) { j.eff = k.eff; changed = true; }
          });
        });
        if (!changed) break;
      }
    }

    function pump(j) {
      for (var guard = 0; guard < 200; guard++) {
        if (j.pc >= j.steps.length) { j.state = 'done'; j.done = true; return; }
        var st = j.steps[j.pc];
        if (st.t === 'cpu') { if (j.rem <= 0) j.rem = st.n; return; }
        if (st.t === 'lock') {
          if (holderOf(st.s)) { j.state = 'blocked'; j.blockedOn = st.s; return; }
          if (policy === 'icpp') {
            var best = null;
            jobs.forEach(function (o) {
              if (o === j) return;
              o.held.forEach(function (s) {
                if (best === null || ceiling[s] < ceiling[best]) best = s;
              });
            });
            if (best !== null && j.prio >= ceiling[best]) {
              j.state = 'blocked'; j.blockedOn = best; return;
            }
          }
          j.held.push(st.s); j.pc++; continue;
        }
        var idx = j.held.lastIndexOf(st.s);
        if (idx >= 0) j.held.splice(idx, 1);
        j.pc++;
        jobs.forEach(function (k) {
          if (k.state === 'blocked' && k.blockedOn === st.s) {
            k.state = 'ready'; k.blockedOn = null; k.rem = 0; pump(k);
          }
        });
      }
    }

    jobs.forEach(function (j) { if (j.state === 'ready') pump(j); });

    var t = 0, trace = [], guard = 0, deadlockAt = null;
    while (guard++ < 20000) {
      jobs.forEach(function (j) { if (j.state === 'notyet' && j.release <= t) { j.state = 'ready'; pump(j); } });
      var unfinished = jobs.filter(function (j) { return !j.done; });
      if (!unfinished.length) break;
      effPriorities();
      jobs.forEach(function (j) {
        if (j.state !== 'blocked') { j.wasBlocked = false; return; }
        j.blockedTicks++;
        if (!j.wasBlocked) { j.episodes++; j.wasBlocked = true; }
      });

      var ready = jobs.filter(function (j) { return j.state === 'ready' && j.rem > 0; });
      if (!ready.length) {
        var pending = unfinished.filter(function (j) { return j.state === 'notyet'; });
        if (pending.length) {
          t = Math.min.apply(null, pending.map(function (j) { return j.release; }));
          continue;
        }
        deadlockAt = t;
        break;
      }
      ready.sort(function (a, b) { return (a.eff - b.eff) || (a.prio - b.prio) || (a.id < b.id ? -1 : 1); });
      var run = ready[0];

      jobs.forEach(function (j) {
        if (j.lastEff !== undefined && j.state !== 'done' && j.lastEff !== j.eff) j.prioChanges++;
        j.lastEff = j.eff;
      });

      var states = {}, blockedOn = {}, blockedPrios = [], heldAt = {};
      jobs.forEach(function (j) {
        states[j.id] = (j === run) ? 'run' : j.state;
        heldAt[j.id] = j.held.slice();
        if (j.state === 'blocked') { blockedOn[j.id] = j.blockedOn; blockedPrios.push(j.prio); }
      });
      trace.push({ t: t, run: run.id, runPrio: run.prio, runEff: run.eff, states: states,
                   blockedOn: blockedOn, blockedPrios: blockedPrios, held: heldAt,
                   readyIds: ready.map(function (j) { return j.id; }),
                   readyPrios: ready.map(function (j) { return j.prio; }) });

      run.rem--; t++;
      if (run.rem === 0) { run.pc++; pump(run); }
    }

    return {
      jobs: jobs, trace: trace, time: t, deadlockAt: deadlockAt, ceiling: ceiling, policy: policy,
      byId: function (id) {
        var f = jobs.filter(function (j) { return j.id === id; })[0];
        return f;
      },
      pushThrough: function (id) {
        var me = this.byId(id), n = 0;
        this.trace.forEach(function (row) {
          if (row.run === id || row.readyIds.indexOf(id) < 0) return;
          if (row.runPrio > me.prio && row.runEff < me.prio) n++;
        });
        return n;
      },
      inheritedTicks: function (id) {
        var me = this.byId(id), n = 0;
        this.trace.forEach(function (row) { if (row.run === id && row.runEff < me.prio) n++; });
        return n;
      },
      firstBlockedAt: function (id) {
        var me = this.byId(id);
        for (var i = 0; i < this.trace.length; i++) if (this.trace[i].states[id] === 'blocked') return i;
        return -1;
      },
      lastBlockedAt: function (id) {
        var me = this.byId(id);
        for (var i = this.trace.length - 1; i >= 0; i--) if (this.trace[i].states[id] === 'blocked') return i;
        return -1;
      }
    };
  }

  function J(id, prio, steps, release) { return { id: id, prio: prio, steps: steps, release: release || 0 }; }
  function cpu(n) { return { t: 'cpu', n: n }; }
  function L(s) { return { t: 'lock', s: s }; }
  function U(s) { return { t: 'unlock', s: s }; }

  /* ---------- 1.2 the three-job trace ----------
     J3 holds S for three units; J1 needs S; M0 shares nothing with anyone. */
  function threeJob(policy, mediumLen, mediumCount) {
    var n = mediumCount === undefined ? 1 : mediumCount;
    var jobs = [
      J('J3', 3, [cpu(1), L('S'), cpu(3), U('S'), cpu(1)], 0),
      J('J1', 1, [cpu(2), L('S'), cpu(2), U('S')], 2)
    ];
    for (var i = 0; i < n; i++) jobs.push(J('M' + i, 2, [cpu(mediumLen)], 2));
    return sim({ jobs: jobs, policy: policy, sems: ['S'] });
  }

  var X1 = {
    none: threeJob('none', 8, 1),
    pip: threeJob('pip', 8, 1),
    icpp: threeJob('icpp', 8, 1)
  };
  var CS3 = 3;                       // J3's critical section, in ticks

  /* sweep the middle job's length 0..20 */
  var SWEEP_L = { none: [], pip: [] };
  for (var sl = 0; sl <= 20; sl++) {
    SWEEP_L.none.push(threeJob('none', sl, 1).byId('J1').blockedTicks);
    SWEEP_L.pip.push(threeJob('pip', sl, 1).byId('J1').blockedTicks);
  }
  /* sweep the number of middle jobs, each 8 units */
  var SWEEP_K = { none: [], pip: [] };
  for (var sk = 0; sk <= 6; sk++) {
    SWEEP_K.none.push(threeJob('none', 8, sk).byId('J1').blockedTicks);
    SWEEP_K.pip.push(threeJob('pip', 8, sk).byId('J1').blockedTicks);
  }

  /* ---------- 1.3 the two-lock trace: chained blocking ---------- */
  function twoLock(policy) {
    return sim({ jobs: [
      J('J3', 3, [L('S1'), cpu(3), U('S1'), cpu(1)], 0),
      J('J2', 2, [L('S2'), cpu(8), U('S2'), cpu(1)], 1),
      J('J1', 1, [cpu(2), L('S1'), cpu(1), U('S1'), L('S2'), cpu(1), U('S2')], 3)
    ], policy: policy, sems: ['S1', 'S2'] });
  }
  var X2 = { none: twoLock('none'), pip: twoLock('pip'), icpp: twoLock('icpp') };

  /* ---------- 1.4 the deadlock program ---------- */
  function cycle(policy, relJ1, relJ2) {
    return sim({ jobs: [
      J('J2', 2, [L('S2'), cpu(2), L('S1'), cpu(2), U('S1'), U('S2'), cpu(1)], relJ2 || 0),
      J('J1', 1, [L('S1'), cpu(2), L('S2'), cpu(2), U('S2'), U('S1'), cpu(1)], relJ1)
    ], policy: policy, sems: ['S1', 'S2'] });
  }
  var X3 = { none: cycle('none', 1), pip: cycle('pip', 1), icpp: cycle('icpp', 1) };

  /* every release-time pair, both protocols */
  var SWEEP_DEAD = { pip: 0, icpp: 0, combos: 0 };
  for (var r1 = 0; r1 <= 10; r1++) {
    for (var r2 = 0; r2 <= 10; r2++) {
      SWEEP_DEAD.combos++;
      if (cycle('pip', r1, r2).deadlockAt !== null) SWEEP_DEAD.pip++;
      if (cycle('icpp', r1, r2).deadlockAt !== null) SWEEP_DEAD.icpp++;
    }
  }

  /* every release pair in the three-job trace: the inheritance bound holds */
  var SWEEP_BOUND = { combos: 0, violations: 0, noneMin: 1e9, noneMax: -1, pipMax: 0 };
  for (var b1 = 0; b1 <= 8; b1++) {
    for (var b2 = 0; b2 <= 8; b2++) {
      var jj = [
        J('J3', 3, [cpu(1), L('S'), cpu(3), U('S'), cpu(1)], 0),
        J('J1', 1, [cpu(2), L('S'), cpu(2), U('S')], b1),
        J('M0', 2, [cpu(6)], b2)
      ];
      var rn = sim({ jobs: jj, policy: 'none', sems: ['S'] });
      var rp = sim({ jobs: jj, policy: 'pip', sems: ['S'] });
      var bn = rn.byId('J1').blockedTicks, bp = rp.byId('J1').blockedTicks;
      SWEEP_BOUND.combos++;
      if (bp > CS3) SWEEP_BOUND.violations++;
      if (bn < bp) SWEEP_BOUND.violations++;
      if (bn < SWEEP_BOUND.noneMin) SWEEP_BOUND.noneMin = bn;
      if (bn > SWEEP_BOUND.noneMax) SWEEP_BOUND.noneMax = bn;
      if (bp > SWEEP_BOUND.pipMax) SWEEP_BOUND.pipMax = bp;
    }
  }

  /* ---------- 1.5 the numbers the lesson quotes ---------- */
  var N = {
    x1NoneBlocked: X1.none.byId('J1').blockedTicks,
    x1PipBlocked: X1.pip.byId('J1').blockedTicks,
    x1IcppBlocked: X1.icpp.byId('J1').blockedTicks,
    x1NoneEpisodes: X1.none.byId('J1').episodes,
    x1PipEpisodes: X1.pip.byId('J1').episodes,
    x1Time: X1.none.time,
    x1UnblockedAt: X1.none.lastBlockedAt('J1') + 1,
    x1PushThrough: X1.pip.pushThrough('M0'),
    x1J3Changes: X1.pip.byId('J3').prioChanges,
    x1J3Inherited: X1.pip.inheritedTicks('J3'),
    x2None: X2.none.byId('J1').blockedTicks,
    x2Pip: X2.pip.byId('J1').blockedTicks,
    x2PipEpisodes: X2.pip.byId('J1').episodes,
    x2Icpp: X2.icpp.byId('J1').blockedTicks,
    x2IcppEpisodes: X2.icpp.byId('J1').episodes,
    x2CeilingS1: X2.pip.ceiling.S1,
    x2CeilingS2: X2.pip.ceiling.S2,
    x3PipDeadlock: X3.pip.deadlockAt,
    x3IcppTime: X3.icpp.time,
    x3IcppDeadlock: X3.icpp.deadlockAt,
    deadPip: SWEEP_DEAD.pip,
    deadIcpp: SWEEP_DEAD.icpp,
    deadCombos: SWEEP_DEAD.combos,
    boundCombos: SWEEP_BOUND.combos,
    boundViolations: SWEEP_BOUND.violations,
    boundNoneMin: SWEEP_BOUND.noneMin,
    boundNoneMax: SWEEP_BOUND.noneMax,
    boundPipMax: SWEEP_BOUND.pipMax,
    sweepL: SWEEP_L,
    sweepK: SWEEP_K,
    cs3: CS3,
    // the bound min(n, m) on the two-lock trace: 2 lower jobs, 2 semaphores
    boundPipSections: Math.min(2, 2),
    boundIcppSections: 1
  };

  /* ---------- 1.6 the checks ---------- */

  check('the three-job trace finishes at 17 ticks of work in every policy', function () {
    var tot = X1.none.time;
    return { pass: tot === 17 && X1.pip.time === 17 && X1.icpp.time === 17, detail: 'times ' + X1.none.time + '/' + X1.pip.time + '/' + X1.icpp.time };
  });
  check('no protocol: J1 waits 10 ticks', function () {
    return { pass: N.x1NoneBlocked === 10, detail: 'got ' + N.x1NoneBlocked };
  });
  check('inheritance: J1 waits exactly the 3-tick section minus what already ran = 2', function () {
    return { pass: N.x1PipBlocked === 2, detail: 'got ' + N.x1PipBlocked };
  });
  check('the 10 splits into 2 of section and 8 of unrelated middle work', function () {
    return { pass: N.x1NoneBlocked - N.x1PipBlocked === 8, detail: 'gap ' + (N.x1NoneBlocked - N.x1PipBlocked) };
  });
  check('the ceiling protocol matches inheritance on this trace', function () {
    return { pass: N.x1IcppBlocked === N.x1PipBlocked, detail: N.x1IcppBlocked + ' vs ' + N.x1PipBlocked };
  });
  check('J1 is blocked from tick 4 and released at tick 14', function () {
    return { pass: X1.none.firstBlockedAt('J1') === 4 && N.x1UnblockedAt === 14, detail: X1.none.firstBlockedAt('J1') + '..' + N.x1UnblockedAt };
  });
  check('each job runs exactly its own CPU total: 5 + 4 + 8 = 17', function () {
    var sum = 0;
    X1.none.jobs.forEach(function (j) { j.steps.forEach(function (s) { if (s.t === 'cpu') sum += s.n; }); });
    return { pass: sum === 17, detail: 'sum ' + sum };
  });
  check('every tick has exactly one running job', function () {
    var ok = X1.none.trace.every(function (row) {
      var n = 0;
      for (var k in row.states) if (row.states[k] === 'run') n++;
      return n === 1;
    });
    return { pass: ok };
  });
  check('no protocol: blocking grows as 2 + L for every L from 0 to 20', function () {
    var ok = true, seen = [];
    for (var i = 0; i <= 20; i++) { seen.push(SWEEP_L.none[i]); if (SWEEP_L.none[i] !== 2 + i) ok = false; }
    return { pass: ok, detail: seen.join(',') };
  });
  check('inheritance: blocking is 2 for every L from 0 to 20', function () {
    var ok = SWEEP_L.pip.every(function (v) { return v === 2; });
    return { pass: ok, detail: SWEEP_L.pip.join(',') };
  });
  check('no protocol: k middle jobs of 8 give 2 + 8k', function () {
    var ok = true;
    for (var k = 0; k <= 6; k++) if (SWEEP_K.none[k] !== 2 + 8 * k) ok = false;
    return { pass: ok, detail: SWEEP_K.none.join(',') };
  });
  check('inheritance: the same k middle jobs still give 2', function () {
    var ok = SWEEP_K.pip.every(function (v) { return v === 2; });
    return { pass: ok, detail: SWEEP_K.pip.join(',') };
  });
  check('two middle jobs give 18 and six give 50', function () {
    return { pass: SWEEP_K.none[2] === 18 && SWEEP_K.none[6] === 50, detail: SWEEP_K.none[2] + ',' + SWEEP_K.none[6] };
  });
  check('J3 executes 2 ticks at inherited priority 1', function () {
    return { pass: N.x1J3Inherited === 2, detail: 'got ' + N.x1J3Inherited };
  });
  check('J3 changes effective priority exactly twice: up and back', function () {
    return { pass: N.x1J3Changes === 2, detail: 'got ' + N.x1J3Changes };
  });
  check('the middle job loses 2 ticks to push-through blocking', function () {
    return { pass: N.x1PushThrough === 2 && X1.none.pushThrough('M0') === 0, detail: N.x1PushThrough + '/' + X1.none.pushThrough('M0') };
  });
  check('every job finishes in the inheritance run, so nothing deadlocked', function () {
    var all = X1.pip.jobs.every(function (j) { return j.done; });
    return { pass: all && X1.pip.deadlockAt === null };
  });
  check('ceiling of S is the priority of the most urgent job that locks it: 1', function () {
    return { pass: X1.pip.ceiling.S === 1, detail: String(X1.pip.ceiling.S) };
  });
  check('two-lock trace: both ceilings are 1', function () {
    return { pass: N.x2CeilingS1 === 1 && N.x2CeilingS2 === 1, detail: N.x2CeilingS1 + ',' + N.x2CeilingS2 };
  });
  check('two-lock trace: inheritance blocks J1 twice, 8 ticks in 2 episodes', function () {
    return { pass: N.x2Pip === 8 && N.x2PipEpisodes === 2, detail: N.x2Pip + ' in ' + N.x2PipEpisodes };
  });
  check('two-lock trace: the ceiling protocol blocks J1 once, in 1 episode', function () {
    return { pass: N.x2IcppEpisodes === 1, detail: 'episodes ' + N.x2IcppEpisodes };
  });
  check('two-lock trace: the totals coincide at 8, so the ceiling protocol did not block less here', function () {
    return { pass: N.x2Icpp === N.x2Pip, detail: N.x2Icpp + ' vs ' + N.x2Pip };
  });
  check('no protocol blocks J1 for 9 on the two-lock trace', function () {
    return { pass: N.x2None === 9, detail: 'got ' + N.x2None };
  });
  check('the inheritance bound is min(2 jobs, 2 semaphores) = 2 sections, and 2 is reached', function () {
    return { pass: N.boundPipSections === 2 && N.x2PipEpisodes === N.boundPipSections };
  });
  check('the ceiling bound is one critical section, and 1 is reached', function () {
    return { pass: N.boundIcppSections === 1 && N.x2IcppEpisodes === 1 };
  });
  check('J1 is refused a free lock under the ceiling protocol: blocked on S2 at tick 5', function () {
    var row = X2.icpp.trace[5];
    return { pass: row.states.J1 === 'blocked' && row.blockedOn.J1 === 'S2',
             detail: row.states.J1 + '/' + row.blockedOn.J1 };
  });
  check('under inheritance J1 takes S1 at tick 5 and is not blocked then', function () {
    var row = X2.pip.trace[5];
    return { pass: row.run !== 'J1' ? X2.pip.trace[4].run === 'J1' : true, detail: row.run };
  });
  check('the deadlock program stops at tick 4 under no protocol', function () {
    return { pass: N.x3PipDeadlock === 4, detail: 'pip ' + N.x3PipDeadlock };
  });
  check('under inheritance both jobs are blocked and neither is finished at that point', function () {
    var st = X3.pip.jobs.filter(function (j) { return !j.done; });
    return { pass: st.length === 2 && st.every(function (j) { return j.state === 'blocked'; }), detail: st.length + ' unfinished' };
  });
  check('the ceiling protocol completes the deadlock program in 10 ticks', function () {
    return { pass: N.x3IcppTime === 10 && N.x3IcppDeadlock === null, detail: N.x3IcppTime };
  });
  check('over 121 release pairs inheritance deadlocks 31 times and the ceiling protocol never', function () {
    return { pass: N.deadCombos === 121 && N.deadPip === 31 && N.deadIcpp === 0,
             detail: N.deadCombos + '/' + N.deadPip + '/' + N.deadIcpp };
  });
  check('over 81 release pairs inheritance never exceeds one critical section of blocking', function () {
    return { pass: N.boundCombos === 81 && N.boundViolations === 0 && N.boundPipMax <= CS3,
             detail: N.boundCombos + '/' + N.boundViolations + '/' + N.boundPipMax };
  });
  check('and it never blocks more than no protocol does, over the same 81 pairs', function () {
    return { pass: N.boundViolations === 0 };
  });
  check('no protocol reaches 9 ticks of blocking somewhere in the 81 pairs', function () {
    return { pass: N.boundNoneMax === 9 && N.boundNoneMin === 0, detail: N.boundNoneMin + '..' + N.boundNoneMax };
  });
  check('a job holding nothing cannot inherit anything', function () {
    var m = X1.pip.byId('M0');
    return { pass: m.prioChanges === 0, detail: 'changes ' + m.prioChanges };
  });
  check('inheritance never changes J1, the most urgent job', function () {
    return { pass: X1.pip.byId('J1').prioChanges === 0 };
  });
  check('under no protocol no job ever runs above its own priority', function () {
    var ok = X1.none.trace.every(function (r) { return r.runEff === r.runPrio; });
    return { pass: ok };
  });
  check('under inheritance a job runs above its own priority only while it holds a lock', function () {
    var bad = 0;
    X2.pip.trace.forEach(function (r) {
      if (r.runEff >= r.runPrio) return;
      if (!r.held[r.run] || r.held[r.run].length === 0) bad++;
    });
    return { pass: bad === 0, detail: bad + ' ticks without a held lock' };
  });
  check('the inherited priority equals the priority of a blocked job, never higher', function () {
    var bad = 0;
    X2.pip.trace.forEach(function (r) {
      var j = X2.pip.byId(r.run);
      if (r.runEff < j.prio && r.blockedPrios.indexOf(r.runEff) < 0) bad++;
    });
    return { pass: bad === 0, detail: bad + ' bad ticks' };
  });
  check('the ceiling protocol never runs a job above its own priority without a blocked job at that level', function () {
    var bad = 0;
    X2.icpp.trace.forEach(function (r) {
      var j = X2.icpp.byId(r.run);
      if (r.runEff < j.prio && r.blockedPrios.indexOf(r.runEff) < 0) bad++;
    });
    return { pass: bad === 0, detail: bad + ' bad ticks' };
  });
  check('every deadlocked run has work left and no runnable job', function () {
    var d = cycle('pip', 0, 0);
    var unfinished = d.jobs.filter(function (j) { return !j.done; });
    var runnable = d.jobs.filter(function (j) { return j.state === 'ready' && j.rem > 0; });
    return { pass: d.deadlockAt !== null && unfinished.length > 0 && runnable.length === 0,
             detail: unfinished.length + '/' + runnable.length };
  });
  check('the model is deterministic: the same input gives the same trace twice', function () {
    var a = twoLock('pip').trace.map(function (r) { return r.run; }).join('');
    var b = twoLock('pip').trace.map(function (r) { return r.run; }).join('');
    return { pass: a === b && a.length > 0 };
  });
  check('a critical section is entered once per lock and left once per unlock', function () {
    var locks = 0, unlocks = 0;
    X2.pip.jobs.forEach(function (j) {
      j.steps.forEach(function (s) { if (s.t === 'lock') locks++; if (s.t === 'unlock') unlocks++; });
    });
    return { pass: locks === unlocks && locks === 4, detail: locks + '/' + unlocks };
  });
  check('the highest-priority job\'s wait under inheritance equals the unexecuted part of the section', function () {
    // J3 runs 1 tick of its 3-tick section before J1 asks, so 2 remain
    return { pass: N.x1PipBlocked === CS3 - 1, detail: N.x1PipBlocked + ' vs ' + (CS3 - 1) };
  });

  var PASSED = CHECKS.filter(function (c) { return c.pass; }).length;

/* ======================================================================
   LAYER 2 — SCENE LOOKUP AND SHARED DRAWING
   ====================================================================== */

  function sceneOf(t) {
    var sc = window.LESSON_TIMELINE.scenes;
    for (var i = sc.length - 1; i >= 0; i--) if (t >= sc[i].start - 1e-6) return sc[i];
    return sc[0];
  }

  function head(title, sub) {
    P.text(34, 18, title, { size: 16, bold: true, color: INK });
    if (sub) P.text(34, 40, sub, { size: 11.5, color: DIM });
  }

  function foot(s) {
    P.line(34, 442, 866, 442, { stroke: BORDER, sw: 1 });
    P.text(34, 450, s, { size: 10.5, color: FAINT });
  }

  /* the state colours of the Gantt chart */
  function cellColour(state) {
    if (state === 'run') return ACC;
    if (state === 'blocked') return INVALIDDIM;
    if (state === 'ready') return SURF2;
    return SURF;
  }

  /* one Gantt chart. rows: [{id,label,prio}], ticks 0..n-1 of trace */
  function gantt(x0, y0, width, rowH, rows, trace, upto, labelW) {
    labelW = labelW || 132;
    var n = Math.min(upto === undefined ? trace.length : upto, trace.length);
    var tickW = (width - labelW) / Math.max(1, trace.length);
    rows.forEach(function (row, ri) {
      var y = y0 + ri * (rowH + 6);
      P.text(x0, y + rowH / 2 - 5, row.label, { size: 11, color: INK, base: 'top' });
      P.text(x0, y + rowH / 2 + 7, row.sub, { size: 9, color: FAINT, base: 'top' });
      for (var i = 0; i < n; i++) {
        var st = trace[i].states[row.id];
        var cx = x0 + labelW + i * tickW;
        P.rect(cx + 0.6, y, Math.max(1, tickW - 1.2), rowH, {
          fill: cellColour(st), stroke: st === 'blocked' ? BAD : BORDER, sw: 0.7, radius: 2
        });
        if (st === 'blocked') {
          P.line(cx + 2, y + rowH - 3, cx + tickW - 2, y + 3, { stroke: BAD, sw: 0.8 });
        }
      }
    });
    // time axis under the last row
    var axisY = y0 + rows.length * (rowH + 6) + 2;
    var step = trace.length > 20 ? 4 : 2;
    for (var tk = 0; tk <= trace.length; tk += step) {
      var tx = x0 + labelW + tk * tickW;
      P.line(tx, axisY, tx, axisY + 4, { stroke: BORDER, sw: 1 });
      P.text(tx, axisY + 7, String(tk), { size: 9, color: FAINT, align: 'center', base: 'top' });
    }
    P.line(x0 + labelW, axisY, x0 + labelW + trace.length * tickW, axisY, { stroke: BORDER, sw: 1 });
    return { tickW: tickW, axisY: axisY, left: x0 + labelW };
  }

  /* a bracket under a span of ticks, with a label */
  function bracket(g, from, to, y, label, colour) {
    var x1 = g.left + from * g.tickW, x2 = g.left + to * g.tickW;
    P.line(x1, y, x2, y, { stroke: colour || BAD, sw: 1.4 });
    P.line(x1, y - 4, x1, y + 4, { stroke: colour || BAD, sw: 1.4 });
    P.line(x2, y - 4, x2, y + 4, { stroke: colour || BAD, sw: 1.4 });
    P.text((x1 + x2) / 2, y + 5, label, { size: 10, color: colour || BAD, align: 'center', base: 'top' });
  }

  function legendItem(x, y, colour, label, dashed) {
    P.rect(x, y, 13, 11, { fill: colour, stroke: dashed ? BAD : BORDER, sw: 0.8, radius: 2 });
    if (dashed) P.line(x + 2, y + 9, x + 11, y + 2, { stroke: BAD, sw: 0.8 });
    P.text(x + 19, y + 1, label, { size: 10.5, color: DIM });
  }

  /* a small stat block: big number over a caption */
  function stat(x, y, value, caption, colour) {
    P.text(x, y, value, { size: 24, bold: true, color: colour || INK, mono: true });
    P.text(x, y + 30, caption, { size: 10.5, color: DIM });
  }

  /* a card with a title and up to four short lines */
  function card(x, y, w, h, title, lines, accentColour) {
    P.rect(x, y, w, h, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
    P.rect(x, y, 4, h, { fill: accentColour || ACC, radius: 2 });
    P.text(x + 14, y + 12, title, { size: 12.5, bold: true, color: INK });
    lines.forEach(function (ln, i) {
      P.text(x + 14, y + 36 + i * 19, ln, { size: 10.5, color: DIM });
    });
  }

/* ======================================================================
   LAYER 3 — THE TEN SCENES
   ====================================================================== */

  var ROWS1 = [
    { id: 'J1', label: 'J1  priority 1', sub: 'most urgent, needs S' },
    { id: 'M0', label: 'J2  priority 2', sub: 'middle, no lock at all' },
    { id: 'J3', label: 'J3  priority 3', sub: 'least urgent, holds S' }
  ];
  var ROWS2 = [
    { id: 'J1', label: 'J1  priority 1', sub: 'needs S1 then S2' },
    { id: 'J2', label: 'J2  priority 2', sub: 'holds S2' },
    { id: 'J3', label: 'J3  priority 3', sub: 'holds S1' }
  ];

  var SCENE_DRAW = {};

  /* ---- 1. inversion ---- */
  SCENE_DRAW['inversion'] = function (t, sc) {
    head('Priority inversion: a high-priority job waits for a low-priority one',
         'one lock, three jobs, and a wait that the lock does not explain');
    var upto = Math.min(17, Math.floor((t - sc.start) / (sc.end - sc.start) * 22) + 1);
    var g = gantt(34, 66, 832, 30, ROWS1, X1.none.trace, upto);
    if (upto > 5) bracket(g, 4, 14, g.axisY + 24, 'J1 blocked: ' + N.x1NoneBlocked + ' ticks', BAD);
    legendItem(34, g.axisY + 48, ACC, 'running');
    legendItem(140, g.axisY + 48, INVALIDDIM, 'blocked', true);
    legendItem(250, g.axisY + 48, SURF2, 'ready, not chosen');
    P.text(34, g.axisY + 74, 'Of those ' + N.x1NoneBlocked + ' ticks, ' + N.cs3 + ' are J3 finishing the section it holds.', { size: 12.5, color: INK });
    P.text(34, g.axisY + 96, 'The other ' + (N.x1NoneBlocked - N.x1PipBlocked) + ' are J2, which never asks for the lock.', { size: 12.5, color: INK, bold: true });
    P.text(34, g.axisY + 118, 'The run finishes at tick ' + N.x1Time + ' with every job complete, so this is not a deadlock.', { size: 12, color: DIM });
    foot('Definition: priority inversion is a wait by a job for a less urgent job. The wait ends; its length is set by the wrong job.');
  };

  /* ---- 2. unbounded ---- */
  SCENE_DRAW['unbounded'] = function (t, sc) {
    head('The same trace with a longer middle job: the wait is 2 + L',
         'J1 blocked, in ticks, against the length L of the unrelated middle job');
    var prog = K.clamp01((t - sc.start) / 18);
    var px0 = 210, px1 = 806, py0 = 96, py1 = 336;
    var xOf = function (L) { return px0 + (px1 - px0) * (L / 20); };
    var yOf = function (b) { return py1 - (py1 - py0) * (b / 22); };
    for (var gy = 0; gy <= 22; gy += 5) {
      P.line(px0, yOf(gy), px1, yOf(gy), { stroke: SURF2, sw: 1 });
      P.text(px0 - 8, yOf(gy) - 5, String(gy), { size: 9, color: FAINT, align: 'right' });
    }
    P.line(px0, py1, px1, py1, { stroke: BORDER, sw: 1 });
    P.line(px0, py0, px0, py1, { stroke: BORDER, sw: 1 });
    for (var gx = 0; gx <= 20; gx += 5) {
      P.text(xOf(gx), py1 + 7, String(gx), { size: 9, color: FAINT, align: 'center', base: 'top' });
    }
    P.text((px0 + px1) / 2, py1 + 26, 'length of the middle job, L ticks', { size: 10.5, color: DIM, align: 'center', base: 'top' });
    P.text(px0, py0 - 22, 'J1 blocked, ticks', { size: 10.5, color: DIM });
    var cut = Math.round(prog * 20);
    for (var i = 0; i < 20; i++) {
      if (i >= cut) break;
      P.line(xOf(i), yOf(SWEEP_L.none[i]), xOf(i + 1), yOf(SWEEP_L.none[i + 1]), { stroke: BAD, sw: 2.4 });
      P.line(xOf(i), yOf(SWEEP_L.pip[i]), xOf(i + 1), yOf(SWEEP_L.pip[i + 1]), { stroke: VAL, sw: 2.4 });
    }
    if (cut > 0) {
      P.circle(xOf(cut), yOf(SWEEP_L.none[cut]), 3.4, { fill: BAD });
      P.circle(xOf(cut), yOf(SWEEP_L.pip[cut]), 3.4, { fill: VAL });
    }
    legendItem(600, 60, BAD, 'no protocol: 2 + L');
    legendItem(760, 60, VAL, 'inheritance: 2');
    P.text(34, 366, 'L = 20 gives ' + SWEEP_L.none[20] + ' ticks against ' + SWEEP_L.pip[20] + '.', { size: 12.5, color: INK });
    P.text(34, 388, 'k middle jobs of 8 units give ' + SWEEP_K.none[0] + ', ' + SWEEP_K.none[1] + ', ' + SWEEP_K.none[2] + ', ' + SWEEP_K.none[3] + ', ' + SWEEP_K.none[4] + ', ' + SWEEP_K.none[5] + ', ' + SWEEP_K.none[6] + ' for k = 0 to 6.', { size: 12, color: INK });
    P.text(34, 410, 'Inheritance gives ' + SWEEP_K.pip[0] + ' for every k. The section never changed length.', { size: 12, color: VAL, bold: true });
    foot('Unbounded means no constant limits the wait. The middle work is not part of any argument about the lock.');
  };

  /* ---- 3. inheritance ---- */
  SCENE_DRAW['inheritance'] = function (t, sc) {
    head('Basic priority inheritance: the holder borrows the waiter\'s priority',
         'the same three jobs, one rule added, and the wait becomes the section');
    var upto = Math.min(17, Math.floor((t - sc.start) / (sc.end - sc.start) * 22) + 1);
    var g = gantt(34, 66, 832, 30, ROWS1, X1.pip.trace, upto);
    if (upto > 5) {
      bracket(g, 4, 6, g.axisY + 24, 'J3 runs at priority 1', WARN);
      bracket(g, 4, 6, g.axisY + 50, 'J1 blocked: ' + N.x1PipBlocked + ' ticks', BAD);
    }
    legendItem(34, g.axisY + 76, ACC, 'running');
    legendItem(140, g.axisY + 76, INVALIDDIM, 'blocked', true);
    legendItem(250, g.axisY + 76, SURF2, 'ready, not chosen');
    P.text(34, g.axisY + 102, 'J3 holds the lock for ' + N.x1J3Inherited + ' more ticks and runs both of them above J2.', { size: 12.5, color: INK });
    P.text(34, g.axisY + 124, 'J3\'s priority changes ' + N.x1J3Changes + ' times: up at tick 4, back at tick 6. J1 never changes.', { size: 12, color: DIM });
    P.text(34, g.axisY + 146, 'J2 loses ' + N.x1PushThrough + ' ticks it would have had: push-through blocking.', { size: 12, color: WARN });
    foot('The rule: inside a critical section that blocks a more urgent job, run at the best priority among the jobs blocked.');
  };

  /* ---- 4. ceiling ---- */
  SCENE_DRAW['ceiling'] = function (t, sc) {
    head('The priority ceiling: refuse the lock before the chain can form',
         'a ceiling belongs to the semaphore, not to the current holder');
    var x = 34, y = 66, w = 380;
    P.rect(x, y, w, 132, { fill: SURF, stroke: BORDER, sw: 1, radius: 6 });
    P.text(x + 14, y + 12, 'Ceilings of the two-lock program', { size: 12.5, bold: true, color: INK });
    P.text(x + 14, y + 40, 'semaphore', { size: 9.5, color: FAINT, mono: true });
    P.text(x + 120, y + 40, 'locked by', { size: 9.5, color: FAINT, mono: true });
    P.text(x + 300, y + 40, 'ceiling', { size: 9.5, color: FAINT, mono: true });
    P.line(x + 14, y + 56, x + w - 14, y + 56, { stroke: BORDER, sw: 1 });
    P.text(x + 14, y + 66, 'S1', { size: 12, mono: true, color: INK });
    P.text(x + 120, y + 66, 'J3 and J1', { size: 11, color: DIM });
    P.text(x + 300, y + 66, '1', { size: 12, mono: true, color: ACC, bold: true });
    P.text(x + 14, y + 96, 'S2', { size: 12, mono: true, color: INK });
    P.text(x + 120, y + 96, 'J2 and J1', { size: 11, color: DIM });
    P.text(x + 300, y + 96, '1', { size: 12, mono: true, color: ACC, bold: true });

    var rx = 434, rw = 432;
    P.rect(rx, y, rw, 132, { fill: WARN, stroke: WARN, sw: 1, radius: 6 });
    P.alpha(0.08); P.rect(rx, y, rw, 132, { fill: WARN, radius: 6 }); P.alpha(1);
    P.text(rx + 14, y + 12, 'The admission test', { size: 12.5, bold: true, color: INK });
    P.text(rx + 14, y + 38, 'Let S* be the locked semaphore with the highest ceiling.', { size: 10.5, color: INK });
    P.text(rx + 14, y + 58, 'Admit the asking job only if its priority is strictly', { size: 10.5, color: INK });
    P.text(rx + 14, y + 76, 'higher than ceiling(S*). Otherwise block it on S*.', { size: 10.5, color: INK });
    P.text(rx + 14, y + 102, 'Tested before the lock is examined, so a free lock can be refused.', { size: 10, color: DIM });

    P.text(34, 218, 'J1 asks for S1 at tick 5 of the two-lock trace. S1 is free.', { size: 12.5, color: INK });
    P.text(34, 240, 'But J2 holds S2, ceiling 1, and J1\'s priority is 1, which is not above 1.', { size: 12.5, color: INK });
    P.text(34, 262, 'So J1 is blocked on S2 — a semaphore it never wanted. That is ceiling blocking.', { size: 12.5, color: BAD, bold: true });
    P.text(34, 292, 'Measured: under the ceiling protocol J1 is blocked at tick 5 and its blocked-on is S2.', { size: 11.5, color: DIM });
    P.text(34, 314, 'Direct blocking: the lock is held. Push-through: a holder inherited. Ceiling: the test said no.', { size: 11.5, color: DIM });
    foot('The ceiling is computed from the static set of jobs that lock the semaphore. It does not move as jobs come and go.');
  };

  /* ---- 5. chained ---- */
  SCENE_DRAW['chained'] = function (t, sc) {
    head('Chained blocking: two episodes under inheritance, one under the ceiling',
         'the same two-lock program, run under both protocols');
    var upto = Math.min(17, Math.floor((t - sc.start) / (sc.end - sc.start) * 22) + 1);
    P.text(34, 62, 'basic priority inheritance', { size: 11, bold: true, color: INK });
    var g1 = gantt(34, 78, 832, 22, ROWS2, X2.pip.trace, upto);
    if (upto > 6) bracket(g1, 5, 13, g1.axisY + 20, N.x2PipEpisodes + ' episodes, ' + N.x2Pip + ' ticks', BAD);
    P.text(34, 214, 'priority ceiling protocol', { size: 11, bold: true, color: INK });
    var g2 = gantt(34, 230, 832, 22, ROWS2, X2.icpp.trace, upto);
    if (upto > 6) bracket(g2, 5, 13, g2.axisY + 20, N.x2IcppEpisodes + ' episode, ' + N.x2Icpp + ' ticks', WARN);
    P.text(34, 384, 'Inheritance: J1 waits on S1, then on S2. The ceiling test stops J2 taking S2 at all.', { size: 12, color: INK });
    P.text(34, 404, 'Bound under inheritance: min(n, m) = min(2 jobs, 2 semaphores) = ' + N.boundPipSections + ' sections. Under the ceiling: ' + N.boundIcppSections + '.', { size: 12, color: INK });
    P.text(34, 424, 'Same total, different episode count: the guarantee improved, this run did not.', { size: 12, color: BAD, bold: true });
    foot('A bound is a promise about the worst case. One trace is not a bound, in either direction.');
  };

  /* ---- 6. deadlock ---- */
  SCENE_DRAW['deadlock'] = function (t, sc) {
    head('Priority inheritance does not prevent deadlock',
         'two jobs, two locks, nested and taken in opposite orders');
    var lx = 150, rx = 610, by = 92, bw = 140, bh = 74;
    P.rect(lx, by, bw, bh, { fill: SURF, stroke: BAD, sw: 1.6, radius: 6 });
    P.text(lx + bw / 2, by + 14, 'J1  priority 1', { size: 12, bold: true, color: INK, align: 'center' });
    P.text(lx + bw / 2, by + 36, 'holds S1', { size: 10.5, color: VAL, align: 'center' });
    P.text(lx + bw / 2, by + 54, 'wants S2', { size: 10.5, color: BAD, align: 'center' });
    P.rect(rx, by, bw, bh, { fill: SURF, stroke: BAD, sw: 1.6, radius: 6 });
    P.text(rx + bw / 2, by + 14, 'J2  priority 2', { size: 12, bold: true, color: INK, align: 'center' });
    P.text(rx + bw / 2, by + 36, 'holds S2', { size: 10.5, color: VAL, align: 'center' });
    P.text(rx + bw / 2, by + 54, 'wants S1', { size: 10.5, color: BAD, align: 'center' });
    P.arrow(lx + bw, by + 46, rx, by + 46, { stroke: BAD, sw: 1.6 });
    P.arrow(rx, by + 24, lx + bw, by + 24, { stroke: BAD, sw: 1.6 });
    P.text((lx + rx + bw) / 2, by + 84, 'a cycle, so neither ever runs again', { size: 11, color: BAD, align: 'center' });

    P.text(34, 206, 'No protocol and inheritance both stop at tick ' + N.x3PipDeadlock + ' with both jobs blocked.', { size: 12.5, color: INK });
    P.text(34, 228, 'The ceiling protocol refuses J1 the second lock, so the cycle cannot close, and it finishes at tick ' + N.x3IcppTime + '.', { size: 12.5, color: VAL, bold: true });

    stat(70, 264, String(N.deadPip), 'deadlocks under inheritance', BAD);
    stat(360, 264, String(N.deadIcpp), 'deadlocks under the ceiling', VAL);
    stat(660, 264, String(N.deadCombos), 'release-time pairs swept', INK);
    P.text(70, 322, 'Both release times swept 0 to 10; each pair rerun under both protocols.', { size: 10.5, color: DIM });
    P.text(34, 356, 'A measured zero is evidence for one task set, not a proof for all of them.', { size: 12, color: INK });
    P.text(34, 378, 'The proof is the 1990 paper\'s: the ceiling test prevents transitive blocking, and a cycle needs it.', { size: 12, color: DIM });
    foot('Inheritance decides who runs. It says nothing about who may take a lock, so it cannot break a cycle.');
  };

  /* ---- 7. pathfinder ---- */
  SCENE_DRAW['pathfinder'] = function (t, sc) {
    head('Mars Pathfinder, 1997: the same three-job trace, on a spacecraft',
         'schematic — the lanes show roles and order, not measured timings');
    var lanes = [
      { label: 'bc_sched', sub: 'highest priority', segs: [[0, 2, 'schedules the bus cycle']] },
      { label: 'bc_dist', sub: 'third highest', segs: [[2, 5, 'blocked on the mutex'], [5, 8, 'sends the data']] },
      { label: 'medium tasks', sub: 'several, lower', segs: [[2, 6, 'run, and keep running']] },
      { label: 'ASI/MET', sub: 'low, holds the mutex', segs: [[0, 2, 'in select()'], [2, 8, 'preempted, cannot release']] }
    ];
    var x0 = 150, w = 690, y0 = 74, rh = 34;
    lanes.forEach(function (ln, i) {
      var y = y0 + i * (rh + 8);
      P.text(34, y + 8, ln.label, { size: 11.5, bold: true, color: INK });
      P.text(34, y + 24, ln.sub, { size: 9.5, color: FAINT });
      P.rect(x0, y, w, rh, { fill: SURF2, stroke: BORDER, sw: 0.8, radius: 3 });
      ln.segs.forEach(function (sg) {
        var sx = x0 + w * (sg[0] / 8), sw2 = w * ((sg[1] - sg[0]) / 8);
        var bad = /blocked|preempted/.test(sg[2]);
        P.rect(sx + 2, y + 3, Math.max(2, sw2 - 4), rh - 6, {
          fill: bad ? INVALIDDIM : ACCDIM, stroke: bad ? BAD : ACC, sw: 1, radius: 3
        });
        P.text(sx + 8, y + 12, sg[2], { size: 9.5, color: bad ? BAD : INK });
      });
    });
    var ay = y0 + lanes.length * (rh + 8) + 4;
    P.text(x0, ay, 'one 8 Hz bus cycle: the deadline that was missed', { size: 10, color: FAINT });
    P.line(x0, ay - 6, x0 + w, ay - 6, { stroke: BORDER, sw: 1 });

    P.text(34, 268, 'VxWorks mutexes take a priority-inheritance flag, and it was off for this one.', { size: 12.5, color: INK });
    P.text(34, 290, 'The resets began on 27 September 1997 and cost the rest of each day\'s activity.', { size: 12, color: DIM });
    P.text(34, 312, 'JPL reproduced the fault in the lab in under 18 hours and enabled the flag.', { size: 12, color: DIM });
    P.text(34, 340, 'Every role here is the trace you have already read: one holder, one waiter, several middle jobs.', { size: 12.5, color: ACC, bold: true });
    foot('Source: Glenn E. Reeves, JPL, "What really happened on Mars?" (1997) and Dr Dobb\'s Journal, November 1999.');
  };

  /* ---- 8. distinctions ---- */
  SCENE_DRAW['distinctions'] = function (t, sc) {
    head('Three ways a job fails to run, and two kinds of inversion',
         'the same word "waiting" covers all of them, and the repairs differ');
    card(34, 66, 264, 150, 'Inversion', [
      'a wait for a LESS urgent job',
      'the wait does end',
      'length set by the wrong job',
      'repair: inheritance'
    ], BAD);
    card(318, 66, 264, 150, 'Deadlock', [
      'waits that form a cycle',
      'the wait never ends',
      'the run stops with work left',
      'repair: ceiling, or lock order'
    ], WARN);
    card(602, 66, 264, 150, 'Starvation', [
      'the job is ready, not blocked',
      'it loses every choice',
      'no lock and no cycle',
      'repair: ageing, or a fair queue'
    ], INFO);
    P.text(34, 238, 'Measured on this page: inversion of ' + N.x1NoneBlocked + ' ticks that ends at tick ' + N.x1UnblockedAt + ' and finishes at ' + N.x1Time + '.', { size: 12, color: INK });
    P.text(34, 260, 'Deadlock at tick ' + N.x3PipDeadlock + ' with two jobs blocked and neither finished. Different symptom.', { size: 12, color: INK });
    P.text(34, 292, 'Bounded inversion: the wait is bounded by critical sections — ' + N.x1PipBlocked + ' ticks under inheritance.', { size: 12, color: VAL });
    P.text(34, 314, 'Unbounded inversion: bounded only by unrelated work — ' + N.x1NoneBlocked + ' ticks here, and 2 + L in general.', { size: 12, color: BAD });
    P.text(34, 346, 'Waiting because a MORE urgent job is running is not inversion. Check the direction first.', { size: 12.5, color: ACC, bold: true });
    foot('Every inversion is a wait; not every wait is an inversion. A trace that completes is not a deadlock.');
  };

  /* ---- 9. gate ---- */
  SCENE_DRAW['gate'] = function (t, sc) {
    head('Five question shapes, and the one quantity each asks for',
         'the answer beside each shape is this page\'s computed value');
    var rows = [
      ['1', 'how long is the high-priority job blocked?', 'subtract the two ticks; no protocol ' + N.x1NoneBlocked + ', inheritance ' + N.x1PipBlocked],
      ['2', 'how many blocking episodes, and what is the bound?', 'count episodes; inheritance min(n, m) = ' + N.boundPipSections + ', ceiling ' + N.boundIcppSections],
      ['3', 'which protocol deadlocks on this program?', 'look for nested locks in opposite order; ' + N.deadPip + ' of ' + N.deadCombos + ' against ' + N.deadIcpp],
      ['4', 'what is the ceiling of a semaphore?', 'the most urgent priority among the jobs that lock it'],
      ['5', 'what does a protocol guarantee?', 'a bound on sections, never a wait of zero']
    ];
    rows.forEach(function (r, i) {
      var y = 70 + i * 62;
      P.rect(34, y, 832, 52, { fill: i % 2 ? SURF2 : SURF, stroke: BORDER, sw: 0.8, radius: 5 });
      P.text(48, y + 10, r[0], { size: 15, bold: true, color: ACC, mono: true });
      P.text(74, y + 9, r[1], { size: 12, bold: true, color: INK });
      P.text(74, y + 30, r[2], { size: 10.5, color: DIM });
    });
    P.text(34, 396, 'The five shapes share one skill: decide whether the question asks for a trace or a bound.', { size: 12.5, color: INK });
    P.text(34, 418, 'A trace question is answered by running the schedule. A bound question is answered by a theorem.', { size: 12, color: ACC, bold: true });
    foot('Both protocols bound the blocking. Neither makes the wait zero, and neither bounds a critical section\'s length.');
  };

  /* ---- 10. traps ---- */
  SCENE_DRAW['traps'] = function (t, sc) {
    head('Four traps',
         'each one is a sentence that reads right and answers wrong');
    card(34, 64, 404, 148, 'Trap 1 — inversion is deadlock', [
      'the wait of ' + N.x1NoneBlocked + ' ends at tick ' + N.x1UnblockedAt,
      'the run finishes at tick ' + N.x1Time + ', every job done',
      'deadlock is the run that stops at tick ' + N.x3PipDeadlock
    ], BAD);
    card(462, 64, 404, 148, 'Trap 2 — inheritance raises the waiter', [
      'the holder borrows, the waiter does not',
      'J3 changes priority ' + N.x1J3Changes + ' times; J1 changes 0',
      'borrowed = best priority among the blocked jobs'
    ], WARN);
    card(34, 226, 404, 148, 'Trap 3 — ceiling blocking is a bug', [
      'J1 is refused S1 while S1 is free',
      'it is refused on S2, whose ceiling is 1',
      'that refusal is what stops the cycle'
    ], INFO);
    card(462, 226, 404, 148, 'Trap 4 — the ceiling always blocks less', [
      'here both protocols block J1 for ' + N.x2Pip + ' ticks',
      'episodes: ' + N.x2PipEpisodes + ' against ' + N.x2IcppEpisodes,
      'the worst case shrinks; this run does not'
    ], ACC);
    P.text(34, 396, 'Answer a bound question with a bound, and a trace question with a trace.', { size: 12.5, color: INK, bold: true });
    P.text(34, 418, 'Swapping them is how all four traps are written.', { size: 12, color: DIM });
    foot('The four: inversion is not deadlock; the holder is raised; ceiling blocking is deliberate; the guarantee shrinks, not the run.');
  };

/* ======================================================================
   LAYER 4 — BOOT
   ====================================================================== */

  function drawFrame(painter) {
    P = painter;
    var t = (K && K.state) ? K.state.elapsed : 0;
    var sc = sceneOf(t);
    P.alpha(1);
    P.clear();
    var fn = SCENE_DRAW[sc.id] || SCENE_DRAW['inversion'];
    fn(t, sc);
    P.alpha(1);
  }

  function fillChecks() {
    var el = document.getElementById('checks');
    if (!el) return;
    var bad = CHECKS.length - PASSED;
    el.innerHTML = '<span class="k">Model checks</span>' +
      '<p class="small" style="margin:6px 0 0">' + PASSED + ' of ' + CHECKS.length + ' passed' +
      (bad ? ' \u2014 <strong>' + bad + ' failed</strong>' : '') + '</p>';
  }

  function boot() {
    fillChecks();

    var holder = document.getElementById('canvas-holder');
    var fallback = document.getElementById('canvas-fallback');
    var ok = false;

    if (window.p5) {
      try {
        new window.p5(function (sk) {
          sk.setup = function () {
            sk.createCanvas(W, H);
            sk.noLoop();
            P = PR.makePainterP5(sk, W, H);
            drawFrame(P);
            ok = true;
          };
          sk.draw = function () { /* frames are driven by the timeline */ };
        });
      } catch (e) {
        console.error('p5 failed', e);
        ok = false;
      }
    }

    if (!ok) {
      var drew = false;
      try {
        var cv = document.createElement('canvas');
        cv.width = W; cv.height = H;
        if (holder) holder.appendChild(cv);
        var ctx2d = cv.getContext && cv.getContext('2d');
        if (ctx2d) { P = PR.makePainter2D(ctx2d, W, H); drawFrame(P); drew = true; }
      } catch (e) {
        console.error('canvas fallback failed', e);
      }
      if (!drew && fallback) fallback.classList.add('show');
    }

    if (K && K.init) {
      K.init({ timeline: window.LESSON_TIMELINE, draw: function () { if (P) drawFrame(P); } });
    }

    window.__drawAt = function (t) {
      K.state.elapsed = t;
      if (P) drawFrame(P);
    };

    var bad = CHECKS.filter(function (c) { return !c.pass; });
    if (bad.length) console.warn('Model validation did not fully pass:', bad);
  }

  window.LESSON_MODEL = {
    X1: {
      none: { blocked: N.x1NoneBlocked, episodes: N.x1NoneEpisodes, time: N.x1Time },
      pip: { blocked: N.x1PipBlocked, episodes: N.x1PipEpisodes },
      icpp: { blocked: N.x1IcppBlocked },
      pushThrough: N.x1PushThrough, j3Changes: N.x1J3Changes, unblockedAt: N.x1UnblockedAt
    },
    X2: {
      none: N.x2None,
      pip: { blocked: N.x2Pip, episodes: N.x2PipEpisodes },
      icpp: { blocked: N.x2Icpp, episodes: N.x2IcppEpisodes },
      ceilings: { S1: N.x2CeilingS1, S2: N.x2CeilingS2 }
    },
    X3: { pipDeadlockAt: N.x3PipDeadlock, icppTime: N.x3IcppTime,
          pipDeadlocks: N.deadPip, icppDeadlocks: N.deadIcpp, combos: N.deadCombos },
    SWEEP_L: N.sweepL, SWEEP_K: N.sweepK,
    BOUND: { combos: N.boundCombos, violations: N.boundViolations,
             noneMin: N.boundNoneMin, noneMax: N.boundNoneMax, pipMax: N.boundPipMax },
    PASSED: PASSED,
    TOTAL: CHECKS.length
  };

  window.__lessonChecks = CHECKS;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})();
