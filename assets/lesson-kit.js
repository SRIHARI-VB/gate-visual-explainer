/* ==========================================================================
   GATE Visual Explainer — shared lesson kit
   Tabs, one timeline clock, caption renderer, transport controls, pagers.
   Loaded by every lesson. The lesson supplies data and a pure draw function.
   ========================================================================== */

(function () {
  'use strict';

  var K = {};
  window.LessonKit = K;

  /* ---------- helpers ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function fmtTime(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + pad(s);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  K.fmtTime = fmtTime;

  /* ---------- state ---------- */

  K.state = {
    timeline: null,
    duration: 1,
    scenes: [],
    events: [],
    elapsed: 0,
    playing: false,
    speed: 1,
    captionsOn: true,
    captionMode: 'standard',
    reducedMotion: false,
    sceneIndex: 0,
    voiceOn: false,
    started: false
  };

  var hooks = { draw: null, onScene: null, onEvent: null };
  var els = {};
  var rafId = null;
  var lastTs = 0;
  var lastEventId = null;

  /* ---------- lookup ---------- */

  function sceneAt(t) {
    var sc = K.state.scenes;
    for (var i = sc.length - 1; i >= 0; i--) {
      if (t >= sc[i].start - 1e-6) return i;
    }
    return 0;
  }

  function eventAt(t) {
    var ev = K.state.events;
    for (var i = 0; i < ev.length; i++) {
      if (t >= ev[i].start - 1e-6 && t < ev[i].end - 1e-6) return ev[i];
    }
    if (ev.length && t >= ev[ev.length - 1].start) return ev[ev.length - 1];
    return ev.length ? ev[0] : null;
  }

  K.sceneAt = sceneAt;
  K.eventAt = eventAt;

  K.sceneProgress = function (t) {
    var i = sceneAt(t);
    var s = K.state.scenes[i];
    if (!s) return 0;
    var span = Math.max(0.001, s.end - s.start);
    var p = (t - s.start) / span;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  };

  /* ---------- caption rendering ---------- */

  function emphasise(text, keyword) {
    if (!keyword) return esc(text);
    var safe = esc(text);
    var kw = esc(keyword);
    var re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (!re.test(safe)) return safe;
    return safe.replace(re, function (m) { return '<span class="kw">' + m + '</span>'; });
  }

  function renderCaption() {
    if (!els.capText) return;
    var st = K.state;
    var ev = eventAt(st.elapsed);

    if (!st.captionsOn || st.captionMode === 'off') {
      els.capText.innerHTML = '<span class="muted">Captions are off. The animation keeps running.</span>';
      els.capBand.classList.add('hidden-caps');
      return;
    }
    els.capBand.classList.remove('hidden-caps');
    if (!ev) { els.capText.textContent = ''; return; }

    var html;
    if (st.captionMode === 'detailed') {
      html = esc(ev.detail || ev.caption);
    } else if (st.captionMode === 'keyword') {
      html = emphasise(ev.caption, ev.keyword);
    } else if (st.captionMode === 'trap') {
      if (ev.trap) {
        html = '<span class="trapmark">exam trap</span>' + esc(ev.trap);
      } else {
        html = '<span class="trapmark">no trap</span>' + esc(ev.caption);
      }
    } else {
      html = esc(ev.caption);
    }
    els.capText.innerHTML = html;
  }

  /* ---------- scene + narration panel ---------- */

  function renderMeta() {
    var st = K.state;
    var i = sceneAt(st.elapsed);
    var sc = st.scenes[i];
    var ev = eventAt(st.elapsed);
    if (!sc) return;

    if (i !== st.sceneIndex) {
      st.sceneIndex = i;
      if (hooks.onScene) hooks.onScene(i, sc);
    }

    if (els.sceneTitle) els.sceneTitle.textContent = sc.title;
    if (els.sceneCount) els.sceneCount.textContent = 'Scene ' + (i + 1) + ' of ' + st.scenes.length;
    if (els.narration) els.narration.textContent = ev ? (ev.narration || ev.caption) : '';

    if (els.btnPrev) els.btnPrev.disabled = i === 0;
    if (els.btnNext) els.btnNext.disabled = i === st.scenes.length - 1;

    // browser speech: speak each new narration line once, while playing
    if (st.voiceOn && ev && ev.id !== lastEventId && st.playing) {
      lastEventId = ev.id;
      speak(ev.narration || ev.caption);
    } else if (ev && ev.id !== lastEventId) {
      lastEventId = ev.id;
    }
  }

  var synth = window.speechSynthesis;

  function speak(text) {
    if (!synth || !text) return;
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 0.98;
      u.pitch = 1;
      synth.speak(u);
    } catch (e) { /* voice is optional */ }
  }

  function stopSpeech() {
    if (synth) { try { synth.cancel(); } catch (e) {} }
  }

  /* ---------- transport ---------- */

  function render() {
    var st = K.state;
    if (els.scrub && document.activeElement !== els.scrub) {
      els.scrub.value = String(Math.round(st.elapsed * 10) / 10);
    }
    if (els.timeCur) els.timeCur.textContent = fmtTime(st.elapsed);
    renderCaption();
    renderMeta();
    if (hooks.draw) hooks.draw(st.elapsed, st);
  }

  K.render = render;

  function tick(ts) {
    var st = K.state;
    if (!st.playing) { rafId = null; return; }
    if (!lastTs) lastTs = ts;
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;
    if (dt > 0.25) dt = 0.25;           // tab was in the background; do not leap
    st.elapsed += dt * st.speed;
    if (st.elapsed >= st.duration) {
      st.elapsed = st.duration;
      st.playing = false;
      syncPlayButtons();
      stopSpeech();
    }
    render();
    if (st.playing) rafId = requestAnimationFrame(tick);
    else rafId = null;
  }

  function syncPlayButtons() {
    var playing = K.state.playing;
    if (els.btnPlay) els.btnPlay.setAttribute('aria-pressed', playing ? 'true' : 'false');
    if (els.btnPlay) els.btnPlay.textContent = playing ? 'Playing' : 'Play';
    if (els.btnPause) els.btnPause.disabled = !playing;
  }

  K.play = function () {
    var st = K.state;
    st.started = true;
    if (st.elapsed >= st.duration - 0.01) st.elapsed = 0;
    st.playing = true;
    lastTs = 0;
    syncPlayButtons();
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  K.pause = function () {
    K.state.playing = false;
    lastTs = 0;
    syncPlayButtons();
    stopSpeech();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  };

  K.toggle = function () { K.state.playing ? K.pause() : K.play(); };

  K.seek = function (t, keepPlaying) {
    var st = K.state;
    st.elapsed = Math.max(0, Math.min(st.duration, t));
    lastEventId = null;
    render();
    if (keepPlaying && !st.playing) K.play();
  };

  K.restart = function () {
    K.pause();
    K.state.elapsed = 0;
    K.state.sceneIndex = -1;
    lastEventId = null;
    render();
  };

  K.prevScene = function () {
    var i = sceneAt(K.state.elapsed);
    var s = K.state.scenes[i];
    // if we are more than 1.2s into the scene, go to its start; else previous scene
    if (s && K.state.elapsed - s.start > 1.2 && i > 0) { K.seek(s.start); return; }
    if (i > 0) K.seek(K.state.scenes[i - 1].start);
    else K.seek(0);
  };

  K.nextScene = function () {
    var i = sceneAt(K.state.elapsed);
    if (i < K.state.scenes.length - 1) K.seek(K.state.scenes[i + 1].start);
    else K.seek(K.state.duration);
  };

  K.setSpeed = function (v) {
    K.state.speed = Number(v) || 1;
  };

  /* ---------- tabs ---------- */

  var tabIds = [];

  function showTab(id, push) {
    if (tabIds.indexOf(id) < 0) id = tabIds[0];
    tabIds.forEach(function (t) {
      var btn = document.querySelector('.tab[data-tab="' + t + '"]');
      var panel = document.getElementById('panel-' + t);
      var on = t === id;
      if (btn) btn.setAttribute('aria-selected', on ? 'true' : 'false');
      if (panel) panel.classList.toggle('active', on);
    });
    // keep the tab in the URL so a section can be linked and reloaded.
    // replaceState is preferred (no history spam); some file:// contexts
    // refuse it, so fall back to setting the fragment directly.
    try {
      history.replaceState(null, '', '#' + id);
      if (location.hash !== '#' + id) location.hash = id;
    } catch (e) {
      try { location.hash = id; } catch (e2) { /* last resort: no deep link */ }
    }

    if (id === 'animation') {
      if (!K.state.started) { K.state.started = true; K.play(); }
      else render();
      resizeCanvas();
    }
  }

  K.showTab = showTab;

  function initTabs() {
    var btns = Array.prototype.slice.call(document.querySelectorAll('.tab[data-tab]'));
    tabIds = btns.map(function (b) { return b.getAttribute('data-tab'); });
    btns.forEach(function (b, idx) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-tab'), true); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = btns[(idx + d + btns.length) % btns.length];
        n.focus();
        showTab(n.getAttribute('data-tab'), true);
      });
    });
    var want = (location.hash || '').replace('#', '');
    showTab(tabIds.indexOf(want) >= 0 ? want : tabIds[0], false);
  }

  /* ---------- canvas resize ---------- */

  var resizeFn = null;

  K.onResize = function (fn) { resizeFn = fn; };

  function resizeCanvas() {
    if (resizeFn) { try { resizeFn(); } catch (e) { console.warn('resize failed', e); } }
  }

  /* ---------- pagers + question reveal ---------- */

  function initPagers() {
    document.querySelectorAll('[data-pager]').forEach(function (root) {
      var pages = Array.prototype.slice.call(root.querySelectorAll('.pager-page'));
      if (!pages.length) return;
      var cur = 0;
      var prev = root.querySelector('[data-pager-prev]');
      var next = root.querySelector('[data-pager-next]');
      var count = root.querySelector('[data-pager-count]');
      function paint() {
        pages.forEach(function (p, i) { p.classList.toggle('active', i === cur); });
        if (prev) prev.disabled = cur === 0;
        if (next) next.disabled = cur === pages.length - 1;
        if (count) count.textContent = 'Page ' + (cur + 1) + ' of ' + pages.length;
      }
      if (prev) prev.addEventListener('click', function () { if (cur > 0) { cur--; paint(); } });
      if (next) next.addEventListener('click', function () { if (cur < pages.length - 1) { cur++; paint(); } });
      paint();
    });
  }

  function initReveals() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.reveal');
      if (!btn) return;
      var q = btn.closest('.question');
      if (!q) return;
      var ans = q.querySelector('.answer');
      if (!ans) return;
      var open = !ans.hasAttribute('hidden');
      if (open) { ans.setAttribute('hidden', ''); btn.textContent = 'Show answer'; }
      else { ans.removeAttribute('hidden'); btn.textContent = 'Hide answer'; }
    });

    var mock = document.getElementById('mock-toggle');
    var submitAll = document.getElementById('mock-submit');
    if (mock) {
      mock.addEventListener('change', function () {
        document.body.classList.toggle('mock-mode', mock.checked);
        document.querySelectorAll('.question .answer').forEach(function (a) { a.setAttribute('hidden', ''); });
        document.querySelectorAll('.question .reveal').forEach(function (b) { b.textContent = 'Show answer'; });
        if (submitAll) submitAll.hidden = !mock.checked;
      });
    }
    if (submitAll) {
      submitAll.addEventListener('click', function () {
        document.querySelectorAll('.question .answer').forEach(function (a) { a.removeAttribute('hidden'); });
        document.querySelectorAll('.question .reveal').forEach(function (b) { b.textContent = 'Hide answer'; });
      });
    }
  }

  /* ---------- boot ---------- */

  K.init = function (opts) {
    var st = K.state;
    st.timeline = opts.timeline;
    st.scenes = opts.timeline.scenes;
    st.events = opts.timeline.events.slice().sort(function (a, b) { return a.start - b.start; });
    st.duration = opts.timeline.duration;

    hooks.draw = opts.draw || null;
    hooks.onScene = opts.onScene || null;

    els = {
      capText: document.getElementById('cap-text'),
      capBand: document.getElementById('caption-band'),
      sceneTitle: document.getElementById('scene-title'),
      sceneCount: document.getElementById('scene-count'),
      narration: document.getElementById('narration'),
      btnPlay: document.getElementById('btn-play'),
      btnPause: document.getElementById('btn-pause'),
      btnRestart: document.getElementById('btn-restart'),
      btnPrev: document.getElementById('btn-prev'),
      btnNext: document.getElementById('btn-next'),
      scrub: document.getElementById('scrub'),
      timeCur: document.getElementById('time-cur'),
      timeTotal: document.getElementById('time-total')
    };

    if (els.timeTotal) els.timeTotal.textContent = fmtTime(st.duration);
    if (els.scrub) { els.scrub.min = '0'; els.scrub.max = String(st.duration); els.scrub.step = '0.1'; els.scrub.value = '0'; }

    if (els.btnPlay) els.btnPlay.addEventListener('click', function () { K.play(); });
    if (els.btnPause) els.btnPause.addEventListener('click', function () { K.pause(); });
    if (els.btnRestart) els.btnRestart.addEventListener('click', K.restart);
    if (els.btnPrev) els.btnPrev.addEventListener('click', K.prevScene);
    if (els.btnNext) els.btnNext.addEventListener('click', K.nextScene);

    if (els.scrub) {
      els.scrub.addEventListener('input', function () {
        K.pause();
        K.seek(Number(els.scrub.value));
      });
    }

    var speed = document.getElementById('speed');
    if (speed) speed.addEventListener('change', function () { K.setSpeed(speed.value); });

    var capToggle = document.getElementById('cap-toggle');
    if (capToggle) {
      capToggle.addEventListener('click', function () {
        st.captionsOn = !st.captionsOn;
        capToggle.setAttribute('aria-pressed', st.captionsOn ? 'true' : 'false');
        capToggle.textContent = st.captionsOn ? 'Captions on' : 'Captions off';
        renderCaption();
      });
    }

    var capMode = document.getElementById('cap-mode');
    if (capMode) {
      capMode.addEventListener('change', function () {
        st.captionMode = capMode.value;
        st.captionsOn = capMode.value !== 'off';
        if (capToggle) {
          capToggle.setAttribute('aria-pressed', st.captionsOn ? 'true' : 'false');
          capToggle.textContent = st.captionsOn ? 'Captions on' : 'Captions off';
        }
        renderCaption();
      });
    }

    var motion = document.getElementById('motion-toggle');
    if (motion) {
      var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      st.reducedMotion = !!prefersReduce;
      motion.setAttribute('aria-pressed', st.reducedMotion ? 'true' : 'false');
      motion.textContent = st.reducedMotion ? 'Reduced motion: on' : 'Reduced motion: off';
      motion.addEventListener('click', function () {
        st.reducedMotion = !st.reducedMotion;
        motion.setAttribute('aria-pressed', st.reducedMotion ? 'true' : 'false');
        motion.textContent = st.reducedMotion ? 'Reduced motion: on' : 'Reduced motion: off';
        render();
      });
    }

    var voice = document.getElementById('btn-voice');
    if (voice) {
      if (!synth) {
        voice.disabled = true;
        voice.title = 'Speech synthesis is not available in this browser';
      }
      voice.addEventListener('click', function () {
        st.voiceOn = !st.voiceOn;
        voice.setAttribute('aria-pressed', st.voiceOn ? 'true' : 'false');
        if (!st.voiceOn) stopSpeech();
        else { lastEventId = null; }
      });
    }

    var full = document.getElementById('btn-fullscreen');
    if (full) {
      full.addEventListener('click', function () {
        var wrap = document.querySelector('.canvas-wrap');
        if (!wrap) return;
        if (document.fullscreenElement) { document.exitFullscreen(); return; }
        if (wrap.requestFullscreen) wrap.requestFullscreen();
        else full.disabled = true;
      });
      document.addEventListener('fullscreenchange', function () { setTimeout(resizeCanvas, 60); });
    }

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (e.key === ' ') { e.preventDefault(); K.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); K.nextScene(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); K.prevScene(); }
    });

    initTabs();
    initPagers();
    initReveals();
    syncPlayButtons();
    render();

    window.addEventListener('resize', function () { resizeCanvas(); });
  };

  /* ---------- small utility for lessons ---------- */

  K.ease = function (t) {
    if (K.state.reducedMotion) return t <= 0 ? 0 : 1;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);   // smoothstep
  };

  K.clamp01 = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };

  // local progress of a sub-beat inside the current scene
  K.beat = function (elapsed, startSec, durSec) {
    return K.clamp01((elapsed - startSec) / Math.max(0.001, durSec));
  };
})();
