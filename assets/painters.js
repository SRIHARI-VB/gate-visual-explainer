/* ==========================================================================
   GATE Visual Explainer — shared painters
   One drawing vocabulary, two backends: p5.js and the browser's own Canvas2D.
   A lesson supplies geometry and data; this file supplies the primitives, so
   the identical frames still draw when the p5 CDN is unreachable.

   Usage in a lesson:
     var P = window.Painters.makePainterP5(sk, W, H);
     var P = window.Painters.makePainter2D(ctx2d, W, H);
   Both return the same interface: alpha, clear, rect, line, arrow, circle,
   tri, text.
   ========================================================================== */

(function () {
  'use strict';

  function cssVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  var PAL = {
    ink: cssVar('--text', '#0f1720'),
    dim: cssVar('--text-dim', '#566573'),
    faint: cssVar('--text-faint', '#7d8b98'),
    surface: cssVar('--surface', '#ffffff'),
    surface2: cssVar('--surface-2', '#eef2f4'),
    border: cssVar('--border-strong', '#c8d2d8'),
    accent: cssVar('--accent', '#0f766e'),
    accentDim: cssVar('--accent-dim', '#d6efeb'),
    valid: cssVar('--valid', '#15803d'),
    invalid: cssVar('--invalid', '#b3261e'),
    invalidDim: cssVar('--invalid-dim', '#fbe4e2'),
    warn: cssVar('--warn', '#9a5406'),
    warnDim: cssVar('--warn-dim', '#fbeed3'),
    info: cssVar('--info', '#1d4e89')
  };

  function rgba(colour, alpha) {
    if (alpha === undefined || alpha === null) alpha = 1;
    if (!colour) return 'rgba(0,0,0,0)';
    var c = String(colour).trim();

    if (c.charAt(0) === '#') {
      if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      var hr = parseInt(c.substr(1, 2), 16);
      var hg = parseInt(c.substr(3, 2), 16);
      var hb = parseInt(c.substr(5, 2), 16);
      return 'rgba(' + hr + ',' + hg + ',' + hb + ',' + alpha + ')';
    }

    // Some palette entries are rgb()/rgba() (the border tokens). Their own
    // alpha must be multiplied by ours, never dropped.
    var m = c.match(/^rgba?\(([^)]+)\)$/i);
    if (m) {
      var parts = m[1].split(',').map(function (v) { return parseFloat(v); });
      if (parts.length >= 3) {
        var base = parts.length > 3 ? parts[3] : 1;
        return 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + (base * alpha) + ')';
      }
    }
    return c;
  }

  function headPoints(x1, y1, x2, y2, size) {
    var ang = Math.atan2(y2 - y1, x2 - x1);
    var a1 = ang + Math.PI - 0.42;
    var a2 = ang + Math.PI + 0.42;
    return [
      [x2, y2],
      [x2 + size * Math.cos(a1), y2 + size * Math.sin(a1)],
      [x2 + size * Math.cos(a2), y2 + size * Math.sin(a2)]
    ];
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (!r) { ctx.rect(x, y, w, h); return; }
    r = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function makePainter2D(ctx, W, H) {
    var P = { W: W, H: H, a: 1 };
    P.alpha = function (v) { P.a = v < 0 ? 0 : v > 1 ? 1 : v; };
    P.clear = function () { ctx.clearRect(0, 0, W, H); };
    P.rect = function (x, y, w, h, o) {
      o = o || {};
      ctx.save();
      if (o.dash) ctx.setLineDash(o.dash);
      if (o.fill) { ctx.fillStyle = rgba(o.fill, P.a); ctx.beginPath(); roundRect(ctx, x, y, w, h, o.radius || 0); ctx.fill(); }
      if (o.stroke) { ctx.strokeStyle = rgba(o.stroke, P.a); ctx.lineWidth = o.sw || 1.5; ctx.beginPath(); roundRect(ctx, x, y, w, h, o.radius || 0); ctx.stroke(); }
      ctx.restore();
    };
    P.line = function (x1, y1, x2, y2, o) {
      o = o || {};
      ctx.save();
      if (o.dash) ctx.setLineDash(o.dash);
      ctx.strokeStyle = rgba(o.stroke || PAL.border, P.a);
      ctx.lineWidth = o.sw || 1.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.restore();
    };
    P.arrow = function (x1, y1, x2, y2, o) {
      o = o || {};
      P.line(x1, y1, x2, y2, o);
      var pts = headPoints(x1, y1, x2, y2, o.head || 10);
      ctx.save();
      ctx.fillStyle = rgba(o.stroke || PAL.border, P.a);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.lineTo(pts[2][0], pts[2][1]);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    P.circle = function (x, y, r, o) {
      o = o || {};
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (o.fill) { ctx.fillStyle = rgba(o.fill, P.a); ctx.fill(); }
      if (o.stroke) { ctx.strokeStyle = rgba(o.stroke, P.a); ctx.lineWidth = o.sw || 1.5; ctx.stroke(); }
      ctx.restore();
    };
    P.tri = function (x1, y1, x2, y2, x3, y3, o) {
      o = o || {};
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath();
      if (o.fill) { ctx.fillStyle = rgba(o.fill, P.a); ctx.fill(); }
      if (o.stroke) { ctx.strokeStyle = rgba(o.stroke, P.a); ctx.lineWidth = o.sw || 1.5; ctx.stroke(); }
      ctx.restore();
    };
    P.text = function (x, y, s, o) {
      o = o || {};
      var size = o.size || 14;
      var fam = o.mono ? '"IBM Plex Mono", ui-monospace, Menlo, monospace'
                       : '"IBM Plex Sans", system-ui, sans-serif';
      ctx.save();
      ctx.font = (o.bold ? '600 ' : '400 ') + size + 'px ' + fam;
      ctx.fillStyle = rgba(o.color || PAL.ink, P.a);
      ctx.textAlign = o.align === 'center' ? 'center' : o.align === 'right' ? 'right' : 'left';
      ctx.textBaseline = o.base === 'middle' ? 'middle' : o.base === 'bottom' ? 'bottom' : 'top';
      ctx.fillText(String(s), x, y);
      ctx.restore();
    };
    return P;
  }

  function makePainterP5(sk, W, H) {
    var P = { W: W, H: H, a: 1 };
    P.alpha = function (v) { P.a = v < 0 ? 0 : v > 1 ? 1 : v; };
    P.clear = function () { sk.clear(); };
    P.rect = function (x, y, w, h, o) {
      o = o || {};
      sk.push();
      var dc = sk.drawingContext;
      if (o.dash) dc.setLineDash(o.dash); else dc.setLineDash([]);
      if (o.fill) sk.fill(rgba(o.fill, P.a)); else sk.noFill();
      if (o.stroke) { sk.stroke(rgba(o.stroke, P.a)); sk.strokeWeight(o.sw || 1.5); } else sk.noStroke();
      sk.rect(x, y, w, h, o.radius || 0);
      dc.setLineDash([]);
      sk.pop();
    };
    P.line = function (x1, y1, x2, y2, o) {
      o = o || {};
      sk.push();
      var dc = sk.drawingContext;
      if (o.dash) dc.setLineDash(o.dash); else dc.setLineDash([]);
      sk.stroke(rgba(o.stroke || PAL.border, P.a));
      sk.strokeWeight(o.sw || 1.5);
      sk.line(x1, y1, x2, y2);
      dc.setLineDash([]);
      sk.pop();
    };
    P.arrow = function (x1, y1, x2, y2, o) {
      o = o || {};
      P.line(x1, y1, x2, y2, o);
      var pts = headPoints(x1, y1, x2, y2, o.head || 10);
      P.tri(pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1],
            { fill: o.stroke || PAL.border });
    };
    P.circle = function (x, y, r, o) {
      o = o || {};
      sk.push();
      if (o.fill) sk.fill(rgba(o.fill, P.a)); else sk.noFill();
      if (o.stroke) { sk.stroke(rgba(o.stroke, P.a)); sk.strokeWeight(o.sw || 1.5); } else sk.noStroke();
      sk.circle(x, y, r * 2);
      sk.pop();
    };
    P.tri = function (x1, y1, x2, y2, x3, y3, o) {
      o = o || {};
      sk.push();
      if (o.fill) sk.fill(rgba(o.fill, P.a)); else sk.noFill();
      if (o.stroke) { sk.stroke(rgba(o.stroke, P.a)); sk.strokeWeight(o.sw || 1.5); } else sk.noStroke();
      sk.triangle(x1, y1, x2, y2, x3, y3);
      sk.pop();
    };
    P.text = function (x, y, s, o) {
      o = o || {};
      sk.push();
      sk.noStroke();
      sk.fill(rgba(o.color || PAL.ink, P.a));
      sk.textFont(o.mono ? 'IBM Plex Mono' : 'IBM Plex Sans');
      sk.textSize(o.size || 14);
      sk.textStyle(o.bold ? sk.BOLD : sk.NORMAL);
      var hAlign = o.align === 'center' ? sk.CENTER : o.align === 'right' ? sk.RIGHT : sk.LEFT;
      var vAlign = o.base === 'middle' ? sk.CENTER : o.base === 'bottom' ? sk.BOTTOM : sk.TOP;
      sk.textAlign(hAlign, vAlign);
      sk.text(String(s), x, y);
      sk.pop();
    };
    return P;
  }

  window.Painters = {
    PAL: PAL,
    rgba: rgba,
    cssVar: cssVar,
    makePainter2D: makePainter2D,
    makePainterP5: makePainterP5
  };
})();
