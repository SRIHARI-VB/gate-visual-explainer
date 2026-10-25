/* ==========================================================================
   Pinned drawing library reference.

   Lesson: pointers-in-c
   Renderer: p5.js 1.11.3 (pinned, not "latest") loaded from jsDelivr:
     https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js

   Why this version: 1.x is the long-standing stable line whose instance-mode
   API (new p5(sketch, node), sk.createCanvas, sk.noLoop, sk.redraw) is the one
   this lesson is written against. Pinning keeps the lesson reproducible.

   p5.brush is NOT used anywhere in this lesson. The method forbids brush for
   anything whose geometry carries the mathematics, and every mark in this
   lesson is geometry: byte cells sit at computed addresses, arrows must land
   exactly on box edges, and a label must never be nudged by a random stroke
   offset. All drawing is therefore exact vector primitives (rect / line /
   triangle / text) issued through a tiny painter object.

   Degradation: if the CDN does not load, the page does not depend on p5 to
   remain readable. topics/pointers-in-c/index.html falls back to the browser's
   own Canvas2D context and draws the identical frames through the same painter
   interface, and the caption band plus all written tabs stay fully available.
   ========================================================================== */

window.P5_PIN = {
  version: '1.11.3',
  url: 'https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js',
  brush: null,
  note: 'Plain p5.js vector primitives only; no brush layer.'
};
