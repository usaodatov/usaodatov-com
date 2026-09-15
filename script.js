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

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
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

    buildMeadow();
    paintBackground();
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

    drawOne(girlPos, tSeconds, true);
    drawOne(boyPos, tSeconds, false);

    function drawOne(pos, t, isGirl) {
      const near = clamp((pos.y - yMin) / (yMax - yMin), 0, 1);
      const scale = lerp(0.8, 1.25, near);
      let facing = pos.vx >= 0 ? 1 : -1;
      const palette = isGirl
        ? { skin: '#d99a72', hair: '#7a4a2b', top: '#c1477a', bottom: '#b23a63' }
        : { skin: '#d99a72', hair: '#5a3a24', top: '#4c8c6b', bottom: '#3d6e54' };
      const tall = isGirl ? 1.12 : 1;
      drawChild(
        pos.x, pos.y, scale, facing,
        t * legSpeed + (isGirl ? 0 : 1.4),
        legAmp,
        t + (isGirl ? 0 : 3),
        palette, tall, isGirl
      );
    }
  }

  let raf = null;
  function loop(now) {
    render(now / 1000);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    if (reduceMotion) {
      render(3); // a calm mid-chase frame, then hold still
    } else {
      raf = requestAnimationFrame(loop);
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (reduceMotion) render(3);
    }, 150);
  });

  start();
})();
