/* USAODATOV — hero scene
 * A moonlit, pointillist meadow (nodding to Monet's late-summer fields) with
 * two children — a 10-year-old girl and her 7-year-old brother — running
 * in loose circles, chasing one another, then slowing to talk before
 * running off again. Everything is drawn as soft painterly daubs rather
 * than literal figures, in keeping with the impressionist treatment.
 */

(() => {
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PALETTE = {
    dot: ['#8a6f9e', '#5c6f9e', '#3c5f52', '#6b5a8e', '#7a4a5a', '#8c8452', '#4a7a92', '#5c7a4a'],
  };

  let W = 0, H = 0, DPR = 1;
  let bg = document.createElement('canvas'); // offscreen static background (sky + grass)
  let bgCtx = bg.getContext('2d');
  let horizonY = 0;
  let meadow = []; // pointillist dots
  let meetSpot = { x: 0, y: 0 };
  let camp = {}; // campsite layout, lower-left family vignette

  // Joshua (boy) / Maria (girl) head-anchor points in page coordinates,
  // refreshed every frame in render() — used to position speech bubbles.
  const anchors = {
    maria: { x: 0, y: 0 },
    joshua: { x: 0, y: 0 },
    owl: { x: 0, y: 0 },
  };
  let charDistance = Infinity;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    if (W === 0 || H === 0) return; // viewport not laid out yet; the next resize/frame retries
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    bg.width = W * DPR;
    bg.height = H * DPR;
    bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

    horizonY = H * 0.38;
    meetSpot = { x: W * 0.54, y: H * 0.66 };
    computeCampLayout();

    buildMeadow();
    paintBackground();
  }

  // Right-side campsite vignette: tent, fire pit, chairs — all
  // anchored off one base point whose ground line sits ~80% down the frame
  // (base of the cluster in the bottom 20% band). Mirrored left-right from
  // its original bottom-left layout (tent/fire/chair offsets and chair
  // facings all flip sign) so the internal composition reads the same way
  // reflected against the right edge instead of the left.
  function computeCampLayout() {
    const s = clamp(W / 650, 1.8, 4.0);
    const baseX = Math.min(W * 0.86, W - 100 * s);
    const baseY = H * 0.80;
    camp.scale = s;
    camp.clearingX = baseX - 5 * s;
    camp.clearingY = baseY + 6 * s;
    camp.tent = { x: baseX + 55 * s, y: baseY + 2 * s };
    camp.fire = { x: baseX - 55 * s, y: baseY + 12 * s };
    camp.chairFather = { x: camp.fire.x + 42 * s, y: camp.fire.y + 2 * s, facing: -1 };
    camp.chairMother = { x: camp.fire.x - 42 * s, y: camp.fire.y + 2 * s, facing: 1 };
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function buildMeadow() {
    meadow = [];
    const count = Math.floor((W * H) / 900);
    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = far (near horizon), 1 = near (bottom)
      const y = lerp(horizonY, H, Math.pow(depth, 0.85));
      const x = rand(-20, W + 20);
      const near = (y - horizonY) / (H - horizonY);
      const size = lerp(1.1, 4.6, near) * rand(0.7, 1.3);
      const color = PALETTE.dot[Math.floor(Math.random() * PALETTE.dot.length)];
      const angle = rand(-0.6, 0.6);
      const len = size * rand(1.6, 3.2);
      meadow.push({ x, y, size, color, angle, len });
    }
    meadow.sort((a, b) => a.y - b.y);
  }

  function paintBackground() {
    // sky
    const sky = bgCtx.createLinearGradient(0, 0, 0, horizonY * 1.05);
    sky.addColorStop(0, '#0e1c3a');
    sky.addColorStop(0.55, '#28406b');
    sky.addColorStop(1, '#6f7fa3');
    bgCtx.fillStyle = sky;
    bgCtx.fillRect(0, 0, W, horizonY + 2);

    // stars
    for (let i = 0; i < W / 9; i++) {
      const sx = rand(0, W);
      const sy = rand(0, horizonY * 0.85);
      bgCtx.fillStyle = `rgba(255, 255, 255, ${rand(0.2, 0.85)})`;
      bgCtx.beginPath();
      bgCtx.arc(sx, sy, rand(0.4, 1.3), 0, Math.PI * 2);
      bgCtx.fill();
    }

    // moon glow
    const moonX = W * 0.78, moonY = horizonY * 0.32;
    const glow = bgCtx.createRadialGradient(moonX, moonY, 4, moonX, moonY, W * 0.28);
    glow.addColorStop(0, 'rgba(226, 236, 255, 0.55)');
    glow.addColorStop(0.35, 'rgba(196, 214, 255, 0.22)');
    glow.addColorStop(1, 'rgba(196, 214, 255, 0)');
    bgCtx.fillStyle = glow;
    bgCtx.fillRect(0, 0, W, horizonY + 2);

    // moon disc
    const moonR = W * 0.02;
    bgCtx.save();
    bgCtx.beginPath();
    bgCtx.fillStyle = '#f2f5fb';
    bgCtx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    bgCtx.fill();
    // soft craters
    bgCtx.clip();
    bgCtx.fillStyle = 'rgba(190, 200, 220, 0.35)';
    bgCtx.beginPath();
    bgCtx.arc(moonX - moonR * 0.35, moonY - moonR * 0.25, moonR * 0.28, 0, Math.PI * 2);
    bgCtx.arc(moonX + moonR * 0.3, moonY + moonR * 0.2, moonR * 0.2, 0, Math.PI * 2);
    bgCtx.arc(moonX + moonR * 0.05, moonY - moonR * 0.45, moonR * 0.14, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();

    // distant tree/hedge line, loose daubs
    for (let i = 0; i < W / 14; i++) {
      const x = i * 14 + rand(-6, 6);
      const h = rand(8, 22);
      bgCtx.fillStyle = `rgba(30, 42, 36, ${rand(0.35, 0.6)})`;
      bgCtx.beginPath();
      bgCtx.ellipse(x, horizonY - h * 0.3, rand(9, 16), h, 0, 0, Math.PI * 2);
      bgCtx.fill();
    }

    // base grass gradient
    const grass = bgCtx.createLinearGradient(0, horizonY, 0, H);
    grass.addColorStop(0, '#3f5a3f');
    grass.addColorStop(1, '#20301f');
    bgCtx.fillStyle = grass;
    bgCtx.fillRect(0, horizonY, W, H - horizonY);

    // pointillist field
    for (const d of meadow) {
      bgCtx.save();
      bgCtx.translate(d.x, d.y);
      bgCtx.rotate(d.angle);
      bgCtx.fillStyle = d.color;
      bgCtx.globalAlpha = 0.82;
      bgCtx.beginPath();
      bgCtx.ellipse(0, 0, d.len, d.size, 0, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.restore();
    }
    bgCtx.globalAlpha = 1;

    paintCampsiteStatic();
  }

  // --- campsite (static parts baked into bg; fire/figures animate per frame) --

  function paintCampsiteStatic() {
    paintClearing(camp.clearingX, camp.clearingY, camp.scale);
    paintTentFabric(camp.tent.x, camp.tent.y, camp.scale);
    paintChair(camp.chairFather.x, camp.chairFather.y, camp.scale, camp.chairFather.facing);
    paintChair(camp.chairMother.x, camp.chairMother.y, camp.scale, camp.chairMother.facing);
    paintFireLogs(camp.fire.x, camp.fire.y, camp.scale);
    paintStoneRing(camp.fire.x, camp.fire.y + 2 * camp.scale, camp.scale);
  }

  function paintClearing(x, y, scale) {
    bgCtx.save();
    const w = 170 * scale, h = 46 * scale;
    const grad = bgCtx.createRadialGradient(x, y, 4, x, y, w);
    grad.addColorStop(0, 'rgba(58, 48, 34, 0.35)');
    grad.addColorStop(1, 'rgba(58, 48, 34, 0)');
    bgCtx.fillStyle = grad;
    bgCtx.beginPath();
    bgCtx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();
  }

  function paintTentFabric(x, y, scale) {
    bgCtx.save();
    bgCtx.translate(x, y);
    bgCtx.scale(scale, scale);
    const width = 46, height = 34;

    bgCtx.fillStyle = 'rgba(232, 226, 208, 0.95)';
    bgCtx.beginPath();
    bgCtx.moveTo(-width * 0.55, 0);
    bgCtx.quadraticCurveTo(-width * 0.5, -height * 0.95, 0, -height);
    bgCtx.quadraticCurveTo(width * 0.5, -height * 0.95, width * 0.55, 0);
    bgCtx.closePath();
    bgCtx.fill();

    // shaded flank for volume
    bgCtx.fillStyle = 'rgba(150, 140, 116, 0.4)';
    bgCtx.beginPath();
    bgCtx.moveTo(0, -height);
    bgCtx.quadraticCurveTo(width * 0.5, -height * 0.95, width * 0.55, 0);
    bgCtx.lineTo(width * 0.12, 0);
    bgCtx.closePath();
    bgCtx.fill();

    bgCtx.strokeStyle = 'rgba(110, 100, 80, 0.4)';
    bgCtx.lineWidth = 1.2;
    bgCtx.beginPath();
    bgCtx.moveTo(0, -height);
    bgCtx.lineTo(0, 0);
    bgCtx.stroke();

    bgCtx.strokeStyle = 'rgba(50, 45, 35, 0.35)';
    bgCtx.lineWidth = 1;
    bgCtx.beginPath();
    bgCtx.moveTo(-width * 0.55, 0); bgCtx.lineTo(-width * 0.85, 7);
    bgCtx.moveTo(width * 0.55, 0); bgCtx.lineTo(width * 0.85, 7);
    bgCtx.stroke();

    // loose painterly texture daubs on the canvas fabric
    for (let i = 0; i < 10; i++) {
      bgCtx.fillStyle = `rgba(255, 255, 255, ${rand(0.03, 0.1)})`;
      bgCtx.beginPath();
      bgCtx.ellipse(rand(-width * 0.4, width * 0.4), rand(-height * 0.9, -4), rand(3, 7), rand(1.5, 3), rand(-0.4, 0.4), 0, Math.PI * 2);
      bgCtx.fill();
    }
    bgCtx.restore();
  }

  function paintChair(x, y, scale, facing) {
    bgCtx.save();
    bgCtx.translate(x, y);
    bgCtx.scale(scale * facing, scale);
    bgCtx.strokeStyle = 'rgba(70, 52, 36, 0.85)';
    bgCtx.lineWidth = 2.4;
    bgCtx.lineCap = 'round';
    bgCtx.beginPath();
    bgCtx.moveTo(-9, 6); bgCtx.lineTo(6, -20);
    bgCtx.moveTo(9, 6); bgCtx.lineTo(-6, -20);
    bgCtx.stroke();
    bgCtx.fillStyle = 'rgba(96, 66, 46, 0.55)';
    bgCtx.beginPath();
    bgCtx.moveTo(-8, 4);
    bgCtx.lineTo(8, 4);
    bgCtx.lineTo(6, -22);
    bgCtx.lineTo(-6, -22);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.restore();
  }

  function paintFireLogs(x, y, scale) {
    bgCtx.save();
    bgCtx.translate(x, y);
    bgCtx.scale(scale, scale);
    bgCtx.strokeStyle = '#3b2a1e';
    bgCtx.lineWidth = 3;
    bgCtx.lineCap = 'round';
    bgCtx.beginPath();
    bgCtx.moveTo(-10, 3); bgCtx.lineTo(9, -5);
    bgCtx.moveTo(-9, -5); bgCtx.lineTo(10, 3);
    bgCtx.stroke();
    bgCtx.fillStyle = 'rgba(60, 52, 46, 0.5)';
    bgCtx.beginPath();
    bgCtx.ellipse(0, 2, 13, 5, 0, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();
  }

  function paintStoneRing(x, y, scale) {
    const r = 20 * scale;
    const stoneCount = 9;
    for (let i = 0; i < stoneCount; i++) {
      const a = (i / stoneCount) * Math.PI * 2 + rand(-0.06, 0.06);
      const sx = x + Math.cos(a) * r;
      const sy = y + Math.sin(a) * r * 0.45;
      const size = rand(3.4, 5.2) * scale;
      bgCtx.fillStyle = `rgba(${100 + Math.floor(rand(-10, 15))}, ${96 + Math.floor(rand(-10, 15))}, ${92 + Math.floor(rand(-10, 15))}, 0.85)`;
      bgCtx.beginPath();
      bgCtx.ellipse(sx, sy, size, size * 0.72, a, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      bgCtx.beginPath();
      bgCtx.ellipse(sx - size * 0.2, sy - size * 0.2, size * 0.4, size * 0.28, a, 0, Math.PI * 2);
      bgCtx.fill();
    }
  }

  // --- figures --------------------------------------------------------

  // Draws one loosely-painted running/standing child.
  // x, y: feet position (ground contact). scale: perspective size.
  // facing: -1 left, 1 right. legPhase: running cycle. legAmp/armAmp: 0..1 motion amount.
  // palette: {skin, hair, top, bottom}. tall: relative height (girl taller).
  function drawChild(x, y, scale, facing, legPhase, legAmp, gestureT, palette, tall, skirt) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * facing, scale);

    const legSwing = Math.sin(legPhase) * (10 * legAmp);
    const legSwing2 = Math.sin(legPhase + Math.PI) * (10 * legAmp);
    const armSwing = Math.sin(legPhase + Math.PI) * (9 * legAmp) + Math.sin(gestureT * 1.3) * (1 - legAmp) * 4;
    const armSwing2 = Math.sin(legPhase) * (9 * legAmp) - Math.sin(gestureT * 1.7) * (1 - legAmp) * 3;
    const bob = Math.abs(Math.sin(legPhase)) * (2.5 * legAmp) + Math.sin(gestureT * 1.1) * (1 - legAmp) * 0.8;

    const hipY = -18 * tall - bob;
    const shoulderY = hipY - 13 * tall;
    const headY = shoulderY - 8 * tall;

    // back leg
    drawLimb(0, hipY, legSwing2 * 0.6, hipY + 16 * tall, palette.skin, 3.4);
    // back arm
    drawLimb(0, shoulderY, armSwing2 * 0.5, shoulderY + 11 * tall, palette.skin, 2.6);

    // torso / skirt
    ctx.fillStyle = palette.top;
    ctx.beginPath();
    if (skirt) {
      ctx.moveTo(-6.5, shoulderY);
      ctx.lineTo(6.5, shoulderY);
      ctx.lineTo(10, hipY + 6);
      ctx.lineTo(-10, hipY + 6);
      ctx.closePath();
    } else {
      ctx.ellipse(0, (hipY + shoulderY) / 2, 6.4, (hipY - shoulderY) / 2 + 1, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // front leg
    drawLimb(0, hipY, legSwing * 0.6, hipY + 16 * tall, palette.bottom, 3.6);
    // front arm
    drawLimb(0, shoulderY, armSwing * 0.5, shoulderY + 11 * tall, palette.top, 2.8);

    // head
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.ellipse(0, headY, 5.6 * tall, 6 * tall, 0, 0, Math.PI * 2);
    ctx.fill();

    // hair (simple painterly cap)
    ctx.fillStyle = palette.hair;
    ctx.beginPath();
    ctx.ellipse(0, headY - 1.5 * tall, 6.1 * tall, 4.6 * tall, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (!skirt) {
      // short hair fringe for the boy
      ctx.beginPath();
      ctx.ellipse(-2, headY - 2, 3, 2.2, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // pair of loose "pigtail" daubs for the girl
      ctx.beginPath();
      ctx.ellipse(-6 * tall, headY + 1, 2.4, 3.4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(6 * tall, headY + 1, 2.4, 3.4, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    function drawLimb(x1, y1, x2, y2, color, width) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // Draws one seated parent, reclined in a camping chair. facing: -1/1, so
  // the pair (facing +1 and -1) reads as sitting across the fire from each
  // other. gestureT drives the idle "mid-conversation" sway — head turning
  // toward the other, hands gesturing gently — independent of any walk cycle.
  function drawParent(x, y, scale, facing, gestureT, palette, isMother) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * facing, scale);

    const headTurn = Math.sin(gestureT * 0.55) * 0.16 + Math.sin(gestureT * 1.3) * 0.04;
    const armGesture = Math.sin(gestureT * 0.9) * 6;
    const armGesture2 = Math.sin(gestureT * 0.9 + 1.1) * 5;
    const breathe = Math.sin(gestureT * 0.7) * 0.6;

    const hipY = -8;
    const shoulderY = hipY - 15 + breathe * 0.2;
    const headY = shoulderY - 9;

    // legs, extended forward onto the chair's footrest
    ctx.strokeStyle = palette.bottom;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, hipY); ctx.lineTo(15, hipY + 9);
    ctx.moveTo(0, hipY); ctx.lineTo(17, hipY + 8);
    ctx.stroke();

    // torso, reclined back against the chair
    ctx.save();
    ctx.translate(0, (hipY + shoulderY) / 2);
    ctx.rotate(-0.25);
    ctx.fillStyle = palette.top;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, (hipY - shoulderY) / 2 + 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // arms, gesturing gently as though mid-conversation
    drawLimb(0, shoulderY, armGesture, shoulderY + 10, palette.skin, 3);
    drawLimb(0, shoulderY, armGesture2 * 0.6, shoulderY + 9, palette.skin, 2.6);

    // head, turning toward the other parent and back
    ctx.save();
    ctx.translate(0, headY);
    ctx.rotate(headTurn);
    ctx.fillStyle = palette.skin;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 6.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.hair;
    ctx.beginPath();
    if (isMother) {
      ctx.ellipse(0, -1.4, 6.6, 5, 0, Math.PI, Math.PI * 2);
      ctx.ellipse(-5.5, 2, 2.2, 4, -0.3, 0, Math.PI * 2);
    } else {
      ctx.ellipse(0, -1.6, 6.2, 4.4, 0, Math.PI, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();

    ctx.restore();

    function drawLimb(x1, y1, x2, y2, color, width) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // --- campsite: per-frame animated parts (fire, flicker, figures) -------

  function drawCampsiteDynamic(t) {
    drawCampAmbientGlow(t);
    drawTentFlicker(camp.tent.x, camp.tent.y, camp.scale, t);
    drawChairOccupant(camp.chairFather, t, false);
    drawChairOccupant(camp.chairMother, t + 3.3, true);
    drawCampfireDynamic(camp.fire.x, camp.fire.y - 2 * camp.scale, camp.scale, t);
  }

  function drawCampAmbientGlow(t) {
    const pulse = Math.sin(t * 3.1) * 0.5 + 0.5;
    const r = 130 * camp.scale;
    const g = ctx.createRadialGradient(camp.fire.x, camp.fire.y, 10, camp.fire.x, camp.fire.y, r);
    g.addColorStop(0, `rgba(255, 150, 70, ${0.14 + pulse * 0.05})`);
    g.addColorStop(1, 'rgba(255, 150, 70, 0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(camp.fire.x, camp.fire.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTentFlicker(x, y, scale, t) {
    const flick = Math.sin(t * 5) * 0.5 + Math.sin(t * 11) * 0.3 + 0.5;
    const height = 34;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalCompositeOperation = 'lighter';

    const glowR = 34 + flick * 4;
    const glow = ctx.createRadialGradient(0, -height * 0.5, 2, 0, -height * 0.5, glowR);
    glow.addColorStop(0, `rgba(255, 195, 120, ${0.22 + flick * 0.1})`);
    glow.addColorStop(1, 'rgba(255, 195, 120, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -height * 0.5, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 190, 110, ${0.45 + flick * 0.18})`;
    ctx.beginPath();
    ctx.moveTo(-4.6, 0);
    ctx.lineTo(0, -height * 0.55);
    ctx.lineTo(4.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawChairOccupant(chair, gestureT, isMother) {
    const palette = isMother
      ? { skin: '#d2a888', hair: '#6b3f28', top: '#7a4a5a', bottom: '#5c3646' }
      : { skin: '#caa07a', hair: '#4a3626', top: '#3f5540', bottom: '#33452f' };
    drawParent(chair.x, chair.y - 4 * camp.scale, camp.scale, chair.facing, gestureT, palette, isMother);
  }

  function drawCampfireDynamic(x, y, scale, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const pulse = Math.sin(t * 6) * 0.5 + Math.sin(t * 2.3) * 0.5;
    const glowR = 30 + pulse * 3;
    const glow = ctx.createRadialGradient(0, -4, 2, 0, -4, glowR);
    glow.addColorStop(0, `rgba(255, 140, 50, ${0.45 + pulse * 0.08})`);
    glow.addColorStop(1, 'rgba(255, 120, 40, 0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -4, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawFlames(t);
    drawEmbers(t);
    ctx.restore();
  }

  function drawFlames(t) {
    const flameLayers = [
      { count: 3, hMin: 14, hMax: 22, wMin: 5, wMax: 8, c1: 'rgba(220, 60, 20, 0.95)', c2: 'rgba(255, 150, 40, 0.9)' },
      { count: 2, hMin: 9, hMax: 14, wMin: 3.4, wMax: 5, c1: 'rgba(255, 170, 50, 0.95)', c2: 'rgba(255, 225, 130, 0.9)' },
    ];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    let seed = 0;
    for (const layer of flameLayers) {
      for (let i = 0; i < layer.count; i++) {
        seed += 1;
        const phase = seed * 2.1;
        const sway = Math.sin(t * 6 + phase) * 2.2 + Math.sin(t * 13 + phase * 1.7) * 0.9;
        const h = lerp(layer.hMin, layer.hMax, Math.sin(t * 8.5 + phase) * 0.5 + 0.5);
        const w = lerp(layer.wMin, layer.wMax, Math.sin(t * 5.5 + phase * 1.3) * 0.5 + 0.5);
        const baseX = (i - (layer.count - 1) / 2) * 4.5 + sway * 0.4;
        const grad = ctx.createLinearGradient(baseX, 0, baseX, -h);
        grad.addColorStop(0, layer.c1);
        grad.addColorStop(1, layer.c2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(baseX - w * 0.5, 0);
        ctx.quadraticCurveTo(baseX - w * 0.3 + sway, -h * 0.55, baseX + sway * 1.4, -h);
        ctx.quadraticCurveTo(baseX + w * 0.3 + sway, -h * 0.55, baseX + w * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawEmbers(t) {
    ctx.save();
    const count = 7;
    for (let i = 0; i < count; i++) {
      const seed = i * 12.9;
      const life = (t * 0.35 + seed * 0.13) % 1;
      const ex = Math.sin(seed + t * 1.4) * 7;
      const ey = -6 - life * 34;
      const alpha = (1 - life) * 0.85;
      const size = lerp(1.6, 0.4, life);
      ctx.fillStyle = `rgba(255, ${160 + Math.floor(60 * (1 - life))}, 70, ${alpha})`;
      ctx.beginPath();
      ctx.arc(ex, ey, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- scene state ------------------------------------------------------

  const CYCLE = 16; // seconds per full chase -> meet -> chase cycle

  function meetFactor(t) {
    const local = t % CYCLE;
    if (local < 7) return 0;
    if (local < 9) return smoothstep(7, 9, local);
    if (local < 13) return 1;
    if (local < 15) return 1 - smoothstep(13, 15, local);
    return 0;
  }

  function computeFigure(t, centerX, centerY, radius, omega, phase, squash) {
    const angle = t * omega + phase;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * squash;
    const vx = -Math.sin(angle) * omega * radius; // horizontal velocity, for facing
    return { x, y, angle, vx };
  }

  function render(tSeconds) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bg, 0, 0, W, H);
    drawCampsiteDynamic(tSeconds);

    const mf = meetFactor(tSeconds);

    const centerX = W * 0.5, centerY = H * 0.64;
    const girlRaw = computeFigure(tSeconds, centerX, centerY, Math.min(90, W * 0.09), 0.62, 0, 0.42);
    const boyRaw = computeFigure(tSeconds, centerX, centerY, Math.min(120, W * 0.12), 0.62, -2.1, 0.42);

    const gap = Math.max(22, W * 0.02);
    const girlMeet = { x: meetSpot.x - gap, y: meetSpot.y, vx: -1 };
    const boyMeet = { x: meetSpot.x + gap, y: meetSpot.y, vx: 1 };

    const girlPos = {
      x: lerp(girlRaw.x, girlMeet.x, mf),
      y: lerp(girlRaw.y, girlMeet.y, mf),
      vx: lerp(girlRaw.vx, girlMeet.vx, mf),
    };
    const boyPos = {
      x: lerp(boyRaw.x, boyMeet.x, mf),
      y: lerp(boyRaw.y, boyMeet.y, mf),
      vx: lerp(boyRaw.vx, boyMeet.vx, mf),
    };

    const yMin = centerY - Math.max(120, W * 0.12) * 0.42;
    const yMax = centerY + Math.max(120, W * 0.12) * 0.42;

    const legAmp = lerp(1, 0.12, mf);
    const legSpeed = lerp(9.5, 2, mf);

    charDistance = Math.hypot(girlPos.x - boyPos.x, girlPos.y - boyPos.y);

    drawOne(girlPos, tSeconds, true);
    drawOne(boyPos, tSeconds, false);
    drawOwl(tSeconds);

    function drawOne(pos, t, isGirl) {
      const near = clamp((pos.y - yMin) / (yMax - yMin), 0, 1);
      const scale = lerp(0.8, 1.25, near) * 1.5; // ~50% larger — read as the "parent" pair, clearly bigger than the campfire kids
      let facing = pos.vx >= 0 ? 1 : -1;
      const palette = isGirl
        ? { skin: '#d99a72', hair: '#7a4a2b', top: '#c1477a', bottom: '#b23a63' }
        : { skin: '#d99a72', hair: '#5a3a24', top: '#4c8c6b', bottom: '#3d6e54' };
      const tall = isGirl ? 1.12 : 1;

      // approximate head position (feet minus head/torso offset) for speech bubbles
      const headOffset = 40 * tall * scale;
      const who = isGirl ? 'maria' : 'joshua';
      anchors[who].x = pos.x;
      anchors[who].y = pos.y - headOffset;

      drawChild(
        pos.x, pos.y, scale, facing,
        t * legSpeed + (isGirl ? 0 : 1.4),
        legAmp,
        t + (isGirl ? 0 : 3),
        palette, tall, isGirl
      );
    }
  }

  // --- owl ----------------------------------------------------------------
  // A white owl now and then flies in from a random corner, circles high above
  // the children, and leaves through another corner. Flight is parametrised in
  // a pseudo-3D space: z (0 far .. 1 near) drives both its on-screen size and
  // its height on screen, so it grows/shrinks as it swings toward and away
  // from the viewer.

  const OWL_LINES = ['Hoo hoo!', 'Whooo?', 'Hoot, hoot!', 'Hoo-hoo-hooo!', 'Whoo-whoo!', 'Twit-twoo!', 'Hooo!', 'Hoo, hoo, hooo!', 'Screee!'];
  const owl = { active: false, t0: null };

  function spawnOwl() {
    if (owl.active) return;
    const corner = () => ({
      x: Math.random() < 0.5 ? -0.14 : 1.14,
      y: Math.random() < 0.5 ? -0.12 : 1.1,
      z: rand(0.15, 1),
    });
    const entry = corner();
    let exit = corner();
    if (exit.x === entry.x && exit.y === entry.y) exit = { ...exit, x: 1 - exit.x };
    Object.assign(owl, {
      active: true,
      t0: null,
      dur: rand(15, 19),
      entry,
      exit,
      a0: entry.x < 0.5 ? Math.PI : 0,
      dir: Math.random() < 0.5 ? 1 : -1,
      loops: rand(1.2, 1.6),
      phase: 0,
      lastT: 0,
      facing: entry.x < 0.5 ? 1 : -1,
      prevX: null,
      nextHoot: 0,
    });
  }

  function owlOrbitPoint(a) {
    const z = 0.5 + 0.5 * Math.sin(a);
    return { x: W * 0.5 + Math.cos(a) * W * 0.24, y: H * 0.30 + (z - 0.5) * H * 0.16, z };
  }

  function drawOwl(t) {
    if (!owl.active) return;
    if (owl.t0 === null) {
      owl.t0 = t;
      owl.lastT = t;
      owl.nextHoot = t + rand(1.2, 2.2);
    }
    const u = (t - owl.t0) / owl.dur;
    if (u >= 1) {
      owl.active = false;
      hideSpeechBubble('owl');
      return;
    }
    const dt = Math.min(0.1, t - owl.lastT);
    owl.lastT = t;

    const E1 = 0.26, E2 = 0.76;
    const toPx = (p) => ({ x: p.x * W, y: p.y * H, z: p.z });
    const mix = (p, q, k) => ({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), z: lerp(p.z, q.z, k) });
    let pos;
    if (u < E1) {
      const k = u / E1;
      pos = mix(toPx(owl.entry), owlOrbitPoint(owl.a0), 0.5 * k + 0.5 * k * (2 - k));
    } else if (u < E2) {
      const k = (u - E1) / (E2 - E1);
      pos = owlOrbitPoint(owl.a0 + owl.dir * Math.PI * 2 * owl.loops * k);
    } else {
      const k = (u - E2) / (1 - E2);
      const a1 = owl.a0 + owl.dir * Math.PI * 2 * owl.loops;
      pos = mix(owlOrbitPoint(a1), toPx(owl.exit), 0.5 * k + 0.5 * k * k);
    }

    const s = clamp(W / 1300, 0.8, 1.8) * lerp(0.42, 1.9, pos.z);
    const flutter = Math.sin(t * 2.3) * 4 * s;
    const x = pos.x, y = pos.y + flutter;

    owl.phase += dt * (u < E1 || u > E2 ? 11 : 7.5);
    if (owl.prevX !== null && Math.abs(x - owl.prevX) > 0.05) {
      const target = x > owl.prevX ? 1 : -1;
      owl.facing += (target - owl.facing) * Math.min(1, dt * 6);
    }
    owl.prevX = x;

    drawOwlSprite(x, y, s, owl.facing, owl.phase);

    anchors.owl.x = x;
    anchors.owl.y = y - 40 * s;
    const onScreen = x > 60 && x < W - 60 && y > 90 && y < H - 30;
    const b = bubbles.owl;
    if (b && b.visible && !onScreen) hideSpeechBubble('owl');
    if (b && onScreen && !b.visible && t >= owl.nextHoot) {
      showSpeechBubble('owl', OWL_LINES[Math.floor(Math.random() * OWL_LINES.length)]);
      owl.nextHoot = t + rand(3, 4.6);
    }
  }

  function drawOwlSprite(x, y, s, facing, phase) {
    const flap = Math.sin(phase);
    ctx.save();
    ctx.translate(x, y + Math.sin(phase - 0.6) * 1.5 * s);
    ctx.scale(s * (Math.abs(facing) < 0.12 ? 0.12 * Math.sign(facing || 1) : facing), s);

    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 48);
    glow.addColorStop(0, 'rgba(235, 240, 255, 0.22)');
    glow.addColorStop(1, 'rgba(235, 240, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();

    const wing = (fill, offsetX, lag) => {
      const f = Math.sin(phase - lag);
      ctx.save();
      ctx.translate(offsetX, -3);
      ctx.rotate(lerp(2.6, -0.35, (f + 1) / 2));
      ctx.fillStyle = fill;
      ctx.strokeStyle = 'rgba(120, 130, 165, 0.55)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.quadraticCurveTo(-22, -14, -15, -36);
      ctx.quadraticCurveTo(-9, -30, -6, -34);
      ctx.quadraticCurveTo(-1, -26, 3, -28);
      ctx.quadraticCurveTo(8, -14, 6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, -4); ctx.lineTo(-9, -26);
      ctx.moveTo(0, -4); ctx.lineTo(-2, -24);
      ctx.stroke();
      ctx.restore();
    };

    wing('#cdd2e6', -2, 0.25); // far wing

    // tail fan
    ctx.fillStyle = '#e9e8ef';
    ctx.beginPath();
    ctx.moveTo(-12, -3); ctx.lineTo(-31, -7); ctx.lineTo(-32, 0); ctx.lineTo(-30, 7); ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();

    // body
    ctx.fillStyle = '#f6f3ea';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(120, 105, 90, 0.35)';
    for (const [dx, dy] of [[-6, -3], [-1, 2], [4, -2], [-9, 3], [2, 5]]) {
      ctx.beginPath();
      ctx.ellipse(dx, dy, 1.6, 1, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // head
    ctx.fillStyle = '#fbf9f3';
    ctx.beginPath();
    ctx.arc(14, -5, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f1c232';
    ctx.beginPath();
    ctx.arc(17.5, -6, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16161d';
    ctx.beginPath();
    ctx.arc(18, -6, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(21.5, -4); ctx.lineTo(26, -2.5); ctx.lineTo(21.5, -1);
    ctx.closePath();
    ctx.fill();

    wing('#ffffff', 0, 0); // near wing

    ctx.restore();
  }

  // --- speech bubbles ---------------------------------------------------
  // Joshua only says things a little brother would say to Maria; Maria only
  // says things a big sister would say to Joshua. 315 unique lines each.

  const joshuaLines = [
    "You're so nice, Maria!", "Maria, save me!", "Maria, that was awesome!", "No peeking!",
    "No fair, Maria!", "Maria, I love playing with you!", "Last one loses!", "You'll never find me, Maria!",
    "I love playing with you, Maria!", "Maria, across the meadow!", "You found me, Maria!", "That tickles, Maria!",
    "First one wins!", "Maria, I'm over here!", "Big hug!", "Ready, set, go!",
    "Close one!", "Maria, wait up!", "Come on, sis!", "Maria, I see you!",
    "I saw that, Maria!", "Your turn to hide, Maria!", "Stay close to me, Maria!", "So silly, Maria!",
    "Maria, around the tree!", "Come here for a hug!", "Unfreeze me, Maria!", "You're awesome, Maria!",
    "You missed me, Maria!", "Ready or not, Maria!", "One more lap, Maria!", "Base is safe, Maria!",
    "I see you, Maria!", "I'm over here!", "Maria, tag back!", "I'm it now, Maria!",
    "Maria, you can't get me!", "Maria, I'll always find you!", "Maria, come chase me!", "Let's be best friends, Maria!",
    "I'll count first!", "You take care of me, Maria!", "Maria, behind the tree!", "I'm dizzy, Maria!",
    "Maria, no fair!", "Again! Again, Maria!", "Maria, I'm so happy!", "You're frozen, Maria!",
    "Home base, Maria!", "I'm way faster!", "Can't catch me now!", "Keep up!",
    "I'm faster!", "Maria, you're frozen!", "Over the hill, Maria!", "Don't go far!",
    "Ready or not!", "Maria, ready, set, go!", "Tag me if you can, Maria!", "My turn to hide, Maria!",
    "Your turn now!", "I'm hiding!", "Maria, I'm safe!", "You'll never catch me, Maria!",
    "Maria, you're my favorite!", "I feel safe with you, Maria!", "I saw that!", "Maria, big hug!",
    "Too slow, too slow, Maria!", "Wait for me, Maria!", "Wait up, Maria!", "Maria, don't go far!",
    "Maria, you take care of me!", "Try to catch me, Maria!", "Base is safe!", "Maria, you'll never find me!",
    "Look how fast I am!", "Come and get me!", "Tag, you're it, Maria!", "You found me!",
    "Maria, I saw that!", "You can't catch me, Maria!", "Come find me!", "Race you there, Maria!",
    "Maria, so happy you're here!", "This is fun!", "You're too slow!", "Maria, this way!",
    "Save me, Maria!", "Nice try!", "Maria, freeze tag!", "Let's race!",
    "I'll always find you!", "I missed you, Maria!", "Faster, faster, Maria!", "Down the field!",
    "Best game ever, Maria!", "Maria, I win again!", "Love you, Maria!", "I'm the fastest!",
    "Maria, I can't stop laughing!", "Catch me!", "Gotcha, Maria!", "Maria, again, again!",
    "Maria, come here for a hug!", "Love you!", "You make me laugh, Maria!", "Maria, you almost got me!",
    "Fastest kid ever, Maria!", "You'll never find me!", "Fastest kid ever!", "Maria, unfreeze me!",
    "Maria, I'm the fastest!", "I'm getting away, Maria!", "So happy you're here!", "You're my best sister!",
    "Maria, got you!", "Around the tree, Maria!", "You can't get me!", "I'm glad you're my sister, Maria!",
    "Bet I win!", "I'm safe, Maria!", "Missed me, Maria!", "You're my best friend!",
    "Let's be best friends!", "Maria, I'm dizzy!", "You're silly, Maria!", "Safe zone, Maria!",
    "Maria, hurry, hide!", "Count to ten, Maria!", "Come and get me, Maria!", "Maria, ready or not!",
    "Best sister ever, Maria!", "Maria, you'll never catch me!", "Watch me run, Maria!", "I'm so happy!",
    "Maria, this is fun!", "Maria, thanks for playing with me!", "Maria, I'm hiding!", "I'm way faster, Maria!",
    "Maria, I like playing with you!", "Maria, best sister in the world!", "Maria, so close!", "I missed you!",
    "Best day ever, Maria!", "Maria, your turn now!", "Maria, too slow, too slow!", "Maria, missed me!",
    "Run, run, run, Maria!", "Maria, fastest kid ever!", "Ready, set, go, Maria!", "Tag me if you can!",
    "Come find me, Maria!", "I win again, Maria!", "This is the best!", "Too slow, too slow!",
    "Maria, best day ever!", "Maria, I'll count first!", "I'll always find you, Maria!", "I'm gonna win!",
    "Maria, you're so kind!", "Maria, so silly!", "Look at me, Maria!", "Maria, slow down!",
    "Count to ten!", "Thanks for playing with me, Maria!", "You almost got me!", "Let's race, Maria!",
    "I'm lucky to have you, Maria!", "Maria, speed up!", "Catch me, Maria!", "Tag back, Maria!",
    "I'm the fastest, Maria!", "Chase me!", "Can't catch me now, Maria!", "I'm safe!",
    "I'm lucky to have you!", "Maria, follow me!", "Maria, watch this!", "You're so fun!",
    "Maria, you're not safe!", "I'm so happy, Maria!", "I like playing with you!", "Over here!",
    "Faster, faster!", "I see you!", "Maria, you're my best friend!", "Maria, count to ten!",
    "Maria, faster, faster!", "Through the grass, Maria!", "Maria, you're awesome!", "Maria, that's cheating!",
    "You're my favorite!", "Maria, I'm faster!", "Come chase me!", "Run, run, run!",
    "You're the greatest, Maria!", "I'm hiding, Maria!", "Got you!", "First one wins, Maria!",
    "Your turn to hide!", "Maria, this is the best!", "Not it, Maria!", "No peeking, Maria!",
    "Speed up, Maria!", "Maria, tag me if you can!", "Best sister in the world, Maria!", "I'm dizzy!",
    "I'll save you!", "This way, Maria!", "Maria, I'm gonna win!", "Ha ha ha, Maria!",
    "No tag backs!", "You can't catch me!", "Maria, whee!", "Over here, Maria!",
    "So happy you're here, Maria!", "Best afternoon ever, Maria!", "Hurry, hide, Maria!", "Behind the tree, Maria!",
    "You're the best!", "Maria, last tag wins!", "I win again!", "You're my favorite, Maria!",
    "Maria, base is safe!", "Almost caught me!", "Maria, close one!", "Maria, yay!",
    "Race you there!", "Maria, through the grass!", "Maria, gotcha!", "Keep up, Maria!",
    "I'm faster, Maria!", "Maria, last one loses!", "Whee, Maria!", "You almost got me, Maria!",
    "Across the meadow, Maria!", "Let's go again, Maria!", "Around the tree!", "Maria, I'm lucky to have you!",
    "Don't go far, Maria!", "Maria, catch me!", "Maria, down the field!", "Ha ha ha!",
    "Gotcha!", "That tickles!", "Follow me, Maria!", "Follow me!",
    "Maria, you make me laugh!", "Maria, you're the best!", "You're too slow, Maria!", "One more race!",
    "Maria, stay close to me!", "Maria, safe zone!", "Maria, you missed me!", "Over the hill!",
    "That's cheating!", "Almost caught me, Maria!", "Yay!", "You take care of me!",
    "Close one, Maria!", "I can't stop laughing, Maria!", "Maria, you go first!", "Bet I win, Maria!",
    "Freeze tag, Maria!", "Nice try, Maria!", "I love playing with you!", "Big hug, Maria!",
    "Best day ever!", "Maria, you're the greatest!", "Last tag wins!", "Found me, Maria!",
    "Maria, one more race!", "Maria, you can't catch me!", "Again, again, Maria!", "I can't stop laughing!",
    "Maria, let's go again!", "One more lap!", "Maria, beat you there!", "Got you, Maria!",
    "You're so nice!", "Last one loses, Maria!", "You'll never catch me!", "You're so kind!",
    "My turn to hide!", "Maria, I'm getting away!", "That's cheating, Maria!", "No fair!",
    "Maria, one more lap!", "Whee!", "Freeze tag!", "Home base!",
    "Maria, home base!", "Again, again!", "You're frozen!", "You're not safe!",
    "Beat you there!", "Maria, let's race!", "One more race, Maria!", "So close!",
    "Best sister ever!", "Maria, come and get me!", "Chase me, Maria!", "Maria, tag, you're it!",
    "Maria, found me!", "Not it!", "Found me!", "Down the field, Maria!",
    "Come chase me, Maria!", "Maria, run, run, run!", "Maria, race you there!", "Maria, not it!",
    "Maria, my turn to hide!", "Maria, I missed you!", "I'm over here, Maria!",
  ];

  const mariaLines = [
    "Joshua, so close, try again!", "Slow down, silly!", "So close!", "Joshua, you're so sweet!",
    "Joshua, I'll unfreeze you!", "Home base is there!", "You'll have to try harder!", "Joshua, watch out, here I come!",
    "You're safe there!", "You can't hide, Joshua!", "Joshua, that was awesome!", "Joshua, I missed you!",
    "Hide somewhere good!", "So close, Joshua!", "Joshua, best chase ever!", "Joshua, let's race!",
    "You're so silly!", "I like playing with you!", "Count to ten!", "So happy you're here!",
    "Keep up, Joshua!", "Again! Again!", "Almost, almost, Joshua!", "Joshua, race you home!",
    "Joshua, you found me!", "Let's play again, Joshua!", "You're my best brother, Joshua!", "I'm coming!",
    "This way, quick, Joshua!", "Joshua, wait for me!", "Joshua, count to ten!", "Joshua, I see you hiding!",
    "You're my little buddy!", "Come out, come out!", "You take care of me too!", "Joshua, I'm too quick for you!",
    "Race you home!", "Joshua, stay close!", "Joshua, this way, quick!", "Joshua, freeze!",
    "Come out, come out, Joshua!", "Found you, Joshua!", "Stay close to me!", "Big hug!",
    "Joshua, first one wins!", "I'm so happy!", "Joshua, you're growing so fast!", "Look behind you!",
    "Come here for a hug!", "Best chase ever!", "Stay close!", "You're getting better, Joshua!",
    "That's silly, Joshua!", "You can't win!", "I know you're close, Joshua!", "Joshua, don't fall behind!",
    "Almost got you, Joshua!", "Joshua, follow me!", "Joshua, so much fun!", "Don't fall behind, Joshua!",
    "Last one home loses, Joshua!", "You're so sweet!", "Joshua, love you!", "You're growing so fast, Joshua!",
    "Hide somewhere good, Joshua!", "Ha ha ha!", "No escaping me!", "Peekaboo!",
    "Tag, you're it!", "Joshua, run!", "That was close, Joshua!", "Joshua, whee!",
    "Catch me now, Joshua!", "Last one home loses!", "I'm right here, Joshua!", "Joshua, best friend and brother!",
    "Thanks for playing with me!", "Joshua, my hiding spot is better!", "Joshua, I'm coming!", "Joshua, come here, silly!",
    "Joshua, I'm so happy!", "Best friend and brother, Joshua!", "Joshua, I'll find you!", "Joshua, you're so funny!",
    "You're getting slow, Joshua!", "Joshua, my turn to chase!", "I'll always find you, Joshua!", "Joshua, almost got you!",
    "Joshua, last lap, let's go!", "Joshua, you'll never catch me!", "You're safe there, Joshua!", "I see you hiding!",
    "Joshua, you'll have to try harder!", "Keep running!", "You're the best, Joshua!", "Over the hill, hurry, Joshua!",
    "Joshua, again, again!", "One more round, Joshua!", "Best brother ever!", "Joshua, no escaping me!",
    "You can't win, Joshua!", "I feel happy with you, Joshua!", "I'll find you!", "Wait for me, Joshua!",
    "Joshua, watch me go!", "Best friend and brother!", "Look at me!", "My turn to chase, Joshua!",
    "Joshua, bet you can't find me!", "Where are you hiding, Joshua?", "I won't peek!", "I'm flying, Joshua!",
    "Best brother ever, Joshua!", "Best game ever, Joshua!", "Come here, silly!", "Joshua, let's play again!",
    "Ready or not, here I come!", "Not bad, little brother!", "I'm too quick for you!", "Look over there, Joshua!",
    "Joshua, not safe yet!", "You're my favorite, Joshua!", "Tag back!", "Where are you hiding?",
    "You're so brave, Joshua!", "Peekaboo, Joshua!", "First one wins!", "Joshua, you're such a good brother!",
    "Keep running, Joshua!", "Come back here!", "You go first this time, Joshua!", "You're getting slow!",
    "Let's race!", "Not safe yet, Joshua!", "Joshua, come out, come out!", "Joshua, you go first this time!",
    "Love you!", "Joshua, look at me!", "Joshua, you're my little buddy!", "You're it!",
    "I like playing with you, Joshua!", "You're my best brother!", "I always catch you, Joshua!", "I'm proud of you, Joshua!",
    "Joshua, I feel happy with you!", "Joshua, last one home loses!", "Love you, Joshua!", "You're my little buddy, Joshua!",
    "Follow me!", "I love playing with you, Joshua!", "I missed you, Joshua!", "Tag back, Joshua!",
    "Let's play again!", "Best afternoon ever!", "You're such a fast runner!", "Big hug, Joshua!",
    "Let's go again, Joshua!", "Joshua, so happy you're here!", "Joshua, no tag backs!", "Let's go again!",
    "Joshua, I know you're close!", "This is so fun, Joshua!", "First one wins, Joshua!", "Come back here, Joshua!",
    "Bet you can't find me!", "Run, Joshua!", "Joshua, look over there!", "I'll find you, Joshua!",
    "That tickles!", "One more chase!", "Joshua, thanks for playing with me!", "Joshua, you're getting slow!",
    "Slow down, silly, Joshua!", "I won't peek, Joshua!", "No tag backs!", "You'll have to try harder, Joshua!",
    "Across the field!", "Joshua, let's always play together!", "Joshua, best game ever!", "Joshua, I'll beat you there!",
    "Almost got you!", "Joshua, one more chase!", "You make me smile!", "So much fun, Joshua!",
    "Joshua, you're my favorite!", "Joshua, look behind you!", "Come here for a hug, Joshua!", "I'm dizzy, Joshua!",
    "Through the grass!", "Joshua, I always catch you!", "Again, again, Joshua!", "Woo hoo!",
    "Joshua, I'm dizzy!", "I'm right behind you!", "Faster, Joshua!", "I see you hiding, Joshua!",
    "Joshua, ready, set, go!", "Love you, brother!", "Gotcha, Joshua!", "That tickles, Joshua!",
    "Joshua, you're safe there!", "You can't run forever, Joshua!", "You're my favorite!", "Look over there!",
    "Here I come!", "Watch this, Joshua!", "That was close!", "You're growing so fast!",
    "Again, again!", "Joshua, hurry and hide!", "So close, try again, Joshua!", "Whee, Joshua!",
    "Joshua, here I come!", "Joshua, come find me!", "Joshua, home base is there!", "Again! Again, Joshua!",
    "Watch me go, Joshua!", "You're such a fast runner, Joshua!", "Come here, silly, Joshua!", "Best game ever!",
    "No tag backs, Joshua!", "One more round!", "Joshua, over the hill, hurry!", "Thanks for playing with me, Joshua!",
    "Across the field, Joshua!", "Hurry and hide, Joshua!", "You're so brave!", "Joshua, nice try, buddy!",
    "Joshua, slow down, silly!", "Ready, set, go!", "Let's race, Joshua!", "Joshua, gotcha!",
    "Best chase ever, Joshua!", "Watch out, here I come!", "Catch me now!", "Ready or not, here I come, Joshua!",
    "My turn to chase!", "Woo hoo, Joshua!", "Ready, set, go, Joshua!", "Wait for me!",
    "I feel happy with you!", "Around the tree, quick, Joshua!", "Joshua, peekaboo!", "I'll always find you!",
    "Try and catch me, Joshua!", "This way, quick!", "I'm too quick for you, Joshua!", "You found me!",
    "Here I come, Joshua!", "Joshua, ha ha ha!", "Hurry and hide!", "Your turn to run, Joshua!",
    "Joshua, that tickles!", "Freeze!", "Got you now, Joshua!", "Joshua, best brother ever!",
    "You're it, Joshua!", "Try and catch me!", "I'm flying!", "Gotcha!",
    "You take care of me too, Joshua!", "Got you now!", "Almost, almost!", "Joshua, you're so silly!",
    "Joshua, you're the best!", "You can't hide!", "Joshua, big hug!", "I'm glad you're my brother, Joshua!",
    "Joshua, where are you hiding?", "Joshua, I'll always find you!", "You go first this time!", "Joshua, that's silly!",
    "Let's always play together, Joshua!", "Joshua, you're frozen now!", "Joshua, I'm right behind you!", "I know you're close!",
    "Nice try, buddy, Joshua!", "Joshua, you can't hide!", "Over the hill, hurry!", "Around the tree, quick!",
    "You're such a good brother!", "Joshua, around the tree, quick!", "My hiding spot is better!", "Joshua, tag, you're it!",
    "I always catch you!", "Watch me go!", "Joshua, across the field!", "Stay close, Joshua!",
    "Joshua, almost, almost!", "Joshua, tag back!", "Impressive, Joshua!", "Home base is there, Joshua!",
    "Last lap, let's go, Joshua!", "So happy you're here, Joshua!", "Joshua, hide somewhere good!", "Joshua, I won't peek!",
    "You'll never catch me, Joshua!", "Bet you can't find me, Joshua!", "I'll beat you there!", "Joshua, keep running!",
    "Race you home, Joshua!", "Not bad, little brother, Joshua!", "Joshua, come back here!", "I'm lucky to have you, Joshua!",
    "Joshua, you take care of me too!", "Joshua, so close!", "Through the grass, Joshua!", "Let's always play together!",
    "You're getting better!", "Joshua, your turn to run!", "Joshua, you're getting better!", "Your turn to run!",
    "Nice try, buddy!", "Stay close to me, Joshua!", "Joshua, found you!",
  ];

  // A handful of two-line exchanges so it occasionally feels like they're
  // actually responding to one another, rather than only speaking at random.
  const pairedDialogues = [
    { first: { who: 'joshua', line: 'Maria, catch me!' }, second: { who: 'maria', line: "I'm coming, Joshua!" }, gap: 1400 },
    { first: { who: 'maria', line: 'Race you!' }, second: { who: 'joshua', line: "You're on!" }, gap: 1100 },
    { first: { who: 'joshua', line: 'Where are you?' }, second: { who: 'maria', line: 'Behind you!' }, gap: 1300 },
    { first: { who: 'maria', line: 'Wait for me!' }, second: { who: 'joshua', line: 'Come on, Maria!' }, gap: 1500 },
    { first: { who: 'joshua', line: 'Love you, sis!' }, second: { who: 'maria', line: 'Love you too!' }, gap: 1800 },
    { first: { who: 'maria', line: 'Got you!' }, second: { who: 'joshua', line: 'No fair!' }, gap: 1200 },
    { first: { who: 'joshua', line: "Tag, you're it!" }, second: { who: 'maria', line: "I'll get you back!" }, gap: 1300 },
    { first: { who: 'maria', line: 'Ready?' }, second: { who: 'joshua', line: 'Go!' }, gap: 1000 },
    { first: { who: 'joshua', line: "Can't catch me!" }, second: { who: 'maria', line: "We'll see about that!" }, gap: 1200 },
    { first: { who: 'maria', line: 'Found you!' }, second: { who: 'joshua', line: 'Aw, so close!' }, gap: 1000 },
  ];

  // Small context-aware pools used occasionally instead of the main random
  // lines, based on how far apart Joshua and Maria currently are.
  const FAR_LINES = {
    joshua: ['Wait for me!', 'Come back!', 'Where are you?', 'Maria, wait up!'],
    maria: ['Wait for me!', 'Where are you, Joshua?', 'Come back here!', "Don't go too far!"],
  };
  const CLOSE_LINES = {
    joshua: ['Got you!', 'Tag!', 'Found you!', 'Hi, Maria!'],
    maria: ['Got you!', 'Tag!', 'Found you!', 'Hi, Joshua!'],
  };

  const recentHistory = { joshua: [], maria: [] };
  const HISTORY_SIZE = 40;

  function getRandomLine(who, pool) {
    const recent = recentHistory[who];
    let choice, guard = 0;
    do {
      choice = pool[Math.floor(Math.random() * pool.length)];
      guard++;
    } while (recent.includes(choice) && guard < 12 && pool.length > 1);
    recent.push(choice);
    if (recent.length > HISTORY_SIZE) recent.shift();
    return choice;
  }

  function pickNormalLine(who) {
    const mainPool = who === 'joshua' ? joshuaLines : mariaLines;
    const farThreshold = Math.max(160, W * 0.16);
    const closeThreshold = Math.max(50, W * 0.05);
    if (charDistance > farThreshold && Math.random() < 0.35) {
      return getRandomLine(who, FAR_LINES[who]);
    }
    if (charDistance < closeThreshold && Math.random() < 0.35) {
      return getRandomLine(who, CLOSE_LINES[who]);
    }
    return getRandomLine(who, mainPool);
  }

  // One reusable DOM bubble per character (never create-per-line elements).
  const bubbles = {};

  function createBubble() {
    const anchor = document.createElement('div');
    anchor.className = 'speech-bubble-anchor';
    anchor.setAttribute('data-tail', 'top');
    const inner = document.createElement('div');
    inner.className = 'speech-bubble';
    inner.setAttribute('aria-hidden', 'true');
    anchor.appendChild(inner);
    document.body.appendChild(anchor);
    return { anchor, inner, hideTimer: null, visible: false };
  }

  function initBubbles() {
    bubbles.joshua = createBubble();
    bubbles.maria = createBubble();
    bubbles.owl = createBubble();
  }

  function positionBubble(who) {
    const b = bubbles[who];
    const a = anchors[who];
    if (!b || !a) return;

    const margin = 12;
    let tail = 'top'; // bubble sits above the character, tail points down
    if (a.y - 100 < margin) {
      tail = 'bottom';
      if (a.y + 100 > H - margin) {
        tail = a.x < W / 2 ? 'left' : 'right';
      }
    }
    b.anchor.setAttribute('data-tail', tail);

    const x = clamp(a.x, margin + 100, Math.max(margin + 100, W - margin - 100));
    const y = clamp(a.y, margin + 24, Math.max(margin + 24, H - margin - 24));
    b.anchor.style.left = x + 'px';
    b.anchor.style.top = y + 'px';
  }

  function updateVisibleBubblePositions() {
    if (bubbles.joshua && bubbles.joshua.visible) positionBubble('joshua');
    if (bubbles.maria && bubbles.maria.visible) positionBubble('maria');
    if (bubbles.owl && bubbles.owl.visible) positionBubble('owl');
  }

  function hideSpeechBubble(who) {
    const b = bubbles[who];
    if (!b) return;
    b.inner.classList.remove('is-visible');
    b.visible = false;
    if (b.hideTimer) {
      clearTimeout(b.hideTimer);
      b.hideTimer = null;
    }
  }

  function showSpeechBubble(who, text) {
    const b = bubbles[who];
    if (!b) return;
    if (b.hideTimer) clearTimeout(b.hideTimer);
    b.inner.textContent = text;
    b.visible = true;
    positionBubble(who);
    void b.inner.offsetWidth; // restart the pop/fade transition
    b.inner.classList.add('is-visible');
    const duration = rand(2500, 4000);
    b.hideTimer = setTimeout(() => hideSpeechBubble(who), duration);
  }

  let conversationActive = false;

  function triggerPairedDialogue(pair) {
    conversationActive = true;
    showSpeechBubble(pair.first.who, pair.first.line);
    setTimeout(() => {
      showSpeechBubble(pair.second.who, pair.second.line);
      setTimeout(() => { conversationActive = false; }, 2600);
    }, pair.gap);
  }

  function speakOnce() {
    if (conversationActive) return;
    if (Math.random() < 0.14) {
      triggerPairedDialogue(pairedDialogues[Math.floor(Math.random() * pairedDialogues.length)]);
      return;
    }
    const who = Math.random() < 0.5 ? 'joshua' : 'maria';
    showSpeechBubble(who, pickNormalLine(who));
  }

  function scheduleNextSpeech(isFirst) {
    const delay = isFirst ? rand(3000, 7000) : rand(4000, 10000);
    setTimeout(() => {
      speakOnce();
      scheduleNextSpeech(false);
    }, delay);
  }

  function scheduleOwl(isFirst) {
    setTimeout(() => {
      spawnOwl();
      scheduleOwl(false);
    }, isFirst ? rand(9000, 16000) : rand(25000, 55000));
  }

  // --- city time overlay --------------------------------------------------

  const timeFormatter = {
    krakow: new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    london: new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
  };

  function updateCityTimes() {
    const now = new Date();
    const krakowEl = document.getElementById('time-krakow');
    const londonEl = document.getElementById('time-london');
    if (krakowEl) krakowEl.textContent = `Kraków ${timeFormatter.krakow.format(now)}`;
    if (londonEl) londonEl.textContent = `London ${timeFormatter.london.format(now)}`;
  }

  let raf = null;
  function loop(now) {
    try {
      if (W === 0 || H === 0) resize(); // retry until the viewport has real dimensions
      if (bg.width > 0 && bg.height > 0) {
        render(now / 1000);
        updateVisibleBubblePositions();
      }
    } catch (err) {
      console.error(err);
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    initBubbles();
    if (reduceMotion) {
      render(3); // a calm mid-chase frame, then hold still
    } else {
      raf = requestAnimationFrame(loop);
    }
    scheduleNextSpeech(true);
    if (!reduceMotion) scheduleOwl(true);
    updateCityTimes();
    setInterval(updateCityTimes, 15000);
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (reduceMotion) render(3);
      updateVisibleBubblePositions();
    }, 150);
  });

  // Hidden moon link — no visual affordance, matches the moon's drawn
  // position/radius from paintBackground() with a slightly generous hit area.
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const moonX = W * 0.78, moonY = horizonY * 0.32, moonR = W * 0.02;
    if (Math.hypot(x - moonX, y - moonY) <= moonR * 1.6) {
      window.location.href = 'https://quickconnect.to/usaodatov-nas';
    }
  });

  start();
})();
