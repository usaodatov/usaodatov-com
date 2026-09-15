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

  // Joshua (boy) / Maria (girl) head-anchor points in page coordinates,
  // refreshed every frame in render() — used to position speech bubbles.
  const anchors = {
    maria: { x: 0, y: 0 },
    joshua: { x: 0, y: 0 },
  };
  let charDistance = Infinity;

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

    charDistance = Math.hypot(girlPos.x - boyPos.x, girlPos.y - boyPos.y);

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

  let raf = null;
  function loop(now) {
    render(now / 1000);
    updateVisibleBubblePositions();
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

  start();
})();
