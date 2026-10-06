/**
 * Audio-Reactive Fullscreen Parallax Background & Weather Engine
 * Presets:
 * 1. Dynamic Altitude (Neon City -> Twilight Sakura -> Aurora -> Cosmic Void)
 * 2. Midnight Neon (Rainy night, neon reflections)
 * 3. Sunset Sakura (Purple sunset with drifting cherry blossoms)
 * 4. Aurora Lights (Cyan/Magenta northern lights ribbons & halo moon)
 * 5. Warm Cafe (Cozy mahogany & honey amber, warm fairy string lights, rainy cafe window bokeh, hanging ivy, steaming tea)
 */

export class LoFiBackground {
  constructor(width, height) {
    this.timer = 0;
    this.lightningTimer = 0;
    this.lightningFlash = 0;

    // Ambiance Settings
    this.rainIntensity = 0.6;
    this.atmospherePreset = 'cafe'; // Default to warm cafe as requested!

    this.petals = [];
    this.stars = [];
    this.dustMotes = [];
    this.bokehLights = [];
    this.initAtmosphere();
    this.resize(width, height);
  }

  setRainIntensity(val) {
    this.rainIntensity = Math.max(0.1, Math.min(1.0, val));
    this.initRain();
  }

  setAtmosphere(preset) {
    this.atmospherePreset = preset;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    this.buildings = [];
    let curX = 0;
    while (curX < width + 200) {
      const bWidth = 60 + Math.random() * 55;
      const bHeight = 220 + Math.random() * 260;
      this.buildings.push({
        x: curX,
        width: bWidth,
        height: bHeight,
        windows: this.generateWindows(bWidth, bHeight),
        roofSign: Math.random() < 0.45 ? this.getRandomSign() : null
      });
      curX += bWidth + 12;
    }

    // Generate cafe bokeh lights seen through the rainy window
    this.bokehLights = [];
    for (let i = 0; i < 22; i++) {
      this.bokehLights.push({
        x: Math.random() * width,
        y: 80 + Math.random() * (height - 200),
        radius: 20 + Math.random() * 40,
        color: ['#FFE082', '#FFB74D', '#FF8A65', '#80CBC4', '#FFAB91'][i % 5],
        opacity: 0.12 + Math.random() * 0.18,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    this.initRain();
  }

  initRain() {
    this.rainDrops = [];
    this.ripples = [];
    const count = Math.floor((this.width / 6) * this.rainIntensity);
    for (let i = 0; i < count; i++) {
      this.rainDrops.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        length: 8 + this.rainIntensity * 12 + Math.random() * 6,
        speed: 6 + this.rainIntensity * 7 + Math.random() * 4,
        opacity: 0.15 + this.rainIntensity * 0.4
      });
    }
  }

  getRandomSign() {
    const signs = [
      { text: '☕ LO-FI CAFE', color: '#FF80AB' },
      { text: 'RAMEN 24H 🍜', color: '#00E5FF' },
      { text: 'CAT LOUNGE 🐾', color: '#B39DDB' },
      { text: 'BOBA & TEA 🧋', color: '#A8E6CF' },
      { text: 'CHILL ♫', color: '#FFE082' }
    ];
    return signs[Math.floor(Math.random() * signs.length)];
  }

  generateWindows(w, h) {
    const wins = [];
    const cols = Math.floor(w / 14);
    const rows = Math.floor(h / 18);
    for (let r = 2; r < rows; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (Math.random() < 0.38) {
          const type = Math.random();
          let color = '#FFE082';
          if (type < 0.25) color = '#80DEEA';
          else if (type < 0.45) color = '#F48FB1';
          wins.push({ c, r, color });
        }
      }
    }
    return wins;
  }

  initAtmosphere() {
    this.petals = [];
    for (let i = 0; i < 40; i++) {
      this.petals.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: 3 + Math.random() * 4.5,
        vx: 0.6 + Math.random() * 1.3,
        vy: 0.7 + Math.random() * 0.9,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.03 + Math.random() * 0.04
      });
    }

    this.stars = [];
    for (let i = 0; i < 140; i++) {
      this.stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: 1 + Math.random() * 2.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.05
      });
    }

    // Warm golden dust motes floating in cozy cafe lamp light
    this.dustMotes = [];
    for (let i = 0; i < 55; i++) {
      this.dustMotes.push({
        x: Math.random() * 2000,
        y: Math.random() * 2000,
        size: 1.5 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5, // gently drift upwards
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.2 + Math.random() * 0.5
      });
    }
  }

  update(cameraY) {
    this.timer += 0.04;

    this.lightningTimer += 0.016;
    if (this.lightningTimer > 18) {
      if (Math.random() < 0.04) {
        this.lightningFlash = 0.4;
        this.lightningTimer = 0;
      }
    }
    if (this.lightningFlash > 0) this.lightningFlash -= 0.02;

    this.rainDrops.forEach(drop => {
      drop.x -= 1.6;
      drop.y += drop.speed;
      if (drop.y > this.height) {
        if (Math.random() < 0.25 * this.rainIntensity) {
          this.ripples.push({
            x: drop.x,
            y: this.height - 10 + Math.random() * 8,
            radius: 2,
            life: 1.0
          });
        }
        drop.y = -15;
        drop.x = Math.random() * (this.width + 150);
      }
    });

    this.ripples.forEach(r => {
      r.radius += 0.5;
      r.life -= 0.045;
    });
    this.ripples = this.ripples.filter(r => r.life > 0);

    this.petals.forEach(p => {
      p.sway += p.swaySpeed;
      p.x += Math.sin(p.sway) * 1.2 + p.vx;
      p.y += p.vy;
      if (p.x > this.width + 50) p.x = -20;
      if (p.y > this.height + 50) p.y = -20;
    });

    this.stars.forEach(s => {
      s.twinkle += s.speed;
    });

    // Update cafe dust motes
    this.dustMotes.forEach(m => {
      m.sway += m.swaySpeed;
      m.x += Math.sin(m.sway) * 0.6 + m.vx;
      m.y += m.vy;
      if (m.y < -20) m.y = this.height + 20;
      if (m.x < -20) m.x = this.width + 20;
      if (m.x > this.width + 20) m.x = -20;
    });
  }

  draw(ctx, cameraY, beatEnergy = 0) {
    ctx.save();

    const altitude = Math.max(0, Math.floor(cameraY));

    let activeMode = this.atmospherePreset;
    if (activeMode === 'dynamic') {
      if (altitude < 1200) activeMode = 'cafe'; // Default starting biome is cozy cafe!
      else if (altitude < 2800) activeMode = 'sunset';
      else if (altitude < 5000) activeMode = 'aurora';
      else activeMode = 'cosmic';
    }

    if (activeMode === 'cafe') {
      // --- WARM CAFE AESTHETIC ---
      this.drawWarmCafe(ctx, cameraY, beatEnergy);
    } else {
      // Standard Outdoor Atmospheric Presets
      this.drawOutdoorSky(ctx, cameraY, beatEnergy, activeMode, altitude);
    }

    ctx.restore();
  }

  /**
   * Dedicated Warm Cafe Atmospheric Renderer:
   * Warm mahogany wood panels, glowing hanging fairy string lights,
   * rainy windowpane with soft bokeh city lights outside, hanging ivy, and steaming tea.
   */
  drawWarmCafe(ctx, cameraY, beatEnergy) {
    // 1. Rich Mahogany & Honey Amber Cafe Gradient
    const cafeGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    cafeGrad.addColorStop(0, '#1c1014');    // Deep espresso roast
    cafeGrad.addColorStop(0.35, '#2b161b'); // Dark chestnut
    cafeGrad.addColorStop(0.7, '#482425');  // Warm mahogany
    cafeGrad.addColorStop(1, '#66322b');    // Warm amber glow near floor
    ctx.fillStyle = cafeGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Out-of-Focus City Bokeh Circles (seen through the rainy glass window)
    ctx.save();
    this.bokehLights.forEach((b, i) => {
      const pulse = Math.sin(this.timer * 1.5 + b.pulseOffset) * 0.06;
      ctx.globalAlpha = Math.max(0.04, b.opacity + pulse + beatEnergy * 0.08);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * (1 + beatEnergy * 0.1), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 3. Cafe Window Mullions & Wooden Frames (subtle architectural depth)
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 20, 24, 0.45)';
    ctx.lineWidth = 14;
    // Vertical window dividers
    const windowColCount = Math.max(3, Math.floor(this.width / 320));
    for (let c = 1; c < windowColCount; c++) {
      const wx = c * (this.width / windowColCount);
      ctx.beginPath();
      ctx.moveTo(wx, 0);
      ctx.lineTo(wx, this.height);
      ctx.stroke();
    }
    // Horizontal window crossbeam
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.42);
    ctx.lineTo(this.width, this.height * 0.42);
    ctx.stroke();
    ctx.restore();

    // 4. Warm Hanging Ivy Plants at Top Corners
    ctx.save();
    this.drawHangingIvy(ctx, 40, -10, 14, 90);
    this.drawHangingIvy(ctx, 160, -15, 10, 70);
    this.drawHangingIvy(ctx, this.width - 60, -10, 13, 85);
    this.drawHangingIvy(ctx, this.width - 180, -15, 9, 65);
    ctx.restore();

    // 5. Glowing Fairy String Lights across the top!
    ctx.save();
    this.drawFairyLights(ctx, beatEnergy);
    ctx.restore();

    // 6. Floating Warm Golden Dust Motes
    ctx.save();
    this.dustMotes.forEach(m => {
      ctx.fillStyle = '#FFE082';
      ctx.globalAlpha = m.opacity * (0.8 + beatEnergy * 0.3);
      ctx.shadowColor = '#FFA000';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(m.x % this.width, m.y % this.height, m.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 7. Warm Golden Rain on the Window Glass
    ctx.save();
    ctx.strokeStyle = `rgba(255, 236, 179, ${0.3 + this.rainIntensity * 0.25})`;
    ctx.lineWidth = 1.2;
    this.rainDrops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1.2, d.y + d.length * 0.9);
      ctx.stroke();
    });
    ctx.restore();

    // 8. Warm Wooden Bar Counter at the bottom (when near altitude 0)
    if (cameraY < 400) {
      const counterY = this.height - 36 + cameraY;
      ctx.save();
      // Wooden counter surface
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(0, counterY, this.width, 36);
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(0, counterY, this.width, 6);

      // Warm Amber Counter Reflection
      const counterGlow = ctx.createLinearGradient(0, counterY, 0, counterY + 24);
      counterGlow.addColorStop(0, `rgba(255, 183, 77, ${0.35 + beatEnergy * 0.2})`);
      counterGlow.addColorStop(1, 'rgba(62, 39, 35, 0)');
      ctx.fillStyle = counterGlow;
      ctx.fillRect(0, counterY + 6, this.width, 24);

      // Steaming Warm Coffee Cup on Counter (Left side)
      const cupX = 75;
      const cupY = counterY - 14;
      // Cup body
      ctx.fillStyle = '#FFF8E1';
      ctx.beginPath();
      ctx.roundRect(cupX, cupY, 18, 14, [2, 2, 6, 6]);
      ctx.fill();
      // Handle
      ctx.strokeStyle = '#FFF8E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cupX + 18, cupY + 6, 4, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // Steaming swirls
      ctx.strokeStyle = 'rgba(255, 248, 225, 0.55)';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 2; s++) {
        const steamShift = Math.sin(this.timer * 2 + s * 1.5) * 3;
        ctx.beginPath();
        ctx.moveTo(cupX + 6 + s * 6, cupY);
        ctx.quadraticCurveTo(cupX + 8 + s * 6 + steamShift, cupY - 10, cupX + 5 + s * 6, cupY - 18);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /**
   * Draws glowing string fairy lights draped gracefully along the top
   */
  drawFairyLights(ctx, beatEnergy) {
    const bulbCount = Math.floor(this.width / 55);
    const sag = 24;

    // Glowing string wire
    ctx.strokeStyle = 'rgba(120, 80, 60, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 15);
    for (let i = 0; i <= bulbCount; i++) {
      const bx = i * (this.width / bulbCount);
      const midX = bx - (this.width / bulbCount) / 2;
      ctx.quadraticCurveTo(midX, 15 + sag, bx, 15);
    }
    ctx.stroke();

    // Glowing warm amber & gold bulbs
    for (let i = 0; i < bulbCount; i++) {
      const bx = i * (this.width / bulbCount) + (this.width / bulbCount) / 2;
      const by = 15 + sag * 0.75 + Math.sin(i * 1.2) * 4;

      const bulbColor = i % 3 === 0 ? '#FFE082' : i % 3 === 1 ? '#FFD54F' : '#FFA726';
      const glowSize = 10 + beatEnergy * 14;

      // Glow halo
      ctx.shadowColor = bulbColor;
      ctx.shadowBlur = glowSize;
      ctx.fillStyle = bulbColor;
      ctx.beginPath();
      ctx.arc(bx, by, 4 + beatEnergy * 1, 0, Math.PI * 2);
      ctx.fill();

      // Bulb socket
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(bx - 2, by - 6, 4, 3);
    }
  }

  /**
   * Draws hanging green ivy vines dangling from rafters
   */
  drawHangingIvy(ctx, startX, startY, leafCount, length) {
    ctx.strokeStyle = '#33691E';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + 8, startY + length * 0.5, startX - 4, startY + length);
    ctx.stroke();

    // Leaves
    for (let i = 0; i < leafCount; i++) {
      const progress = i / leafCount;
      const lx = startX + Math.sin(progress * Math.PI) * 8 + (i % 2 === 0 ? -5 : 5);
      const ly = startY + progress * length;
      ctx.fillStyle = i % 2 === 0 ? '#558B2F' : '#689F38';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4.5, 3, (i % 2 === 0 ? -0.4 : 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Outdoor skies (Midnight, Sunset, Aurora, Cosmic)
   */
  drawOutdoorSky(ctx, cameraY, beatEnergy, activeMode, altitude) {
    const sky = ctx.createLinearGradient(0, 0, 0, this.height);

    if (activeMode === 'midnight') {
      sky.addColorStop(0, '#131126');
      sky.addColorStop(0.5, '#1e1838');
      sky.addColorStop(1, '#342552');
    } else if (activeMode === 'sunset') {
      sky.addColorStop(0, '#1c1538');
      sky.addColorStop(0.45, '#3b204e');
      sky.addColorStop(1, '#662d5a');
    } else if (activeMode === 'aurora') {
      sky.addColorStop(0, '#0c0b1a');
      sky.addColorStop(0.5, '#17193b');
      sky.addColorStop(1, '#27204e');
    } else {
      sky.addColorStop(0, '#05040a');
      sky.addColorStop(0.5, '#0d0b1a');
      sky.addColorStop(1, '#191530');
    }

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.lightningFlash > 0) {
      ctx.fillStyle = `rgba(200, 180, 255, ${this.lightningFlash})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Aurora Waves
    if (activeMode === 'aurora' || (activeMode === 'dynamic' && altitude > 1800)) {
      ctx.save();
      const auroraAlpha = activeMode === 'aurora' ? 0.45 : Math.min(0.45, (altitude - 1800) / 1500);
      ctx.globalAlpha = auroraAlpha + beatEnergy * 0.12;
      for (let i = 0; i < 3; i++) {
        const aGrad = ctx.createLinearGradient(0, 50 + i * 80, this.width, 180 + i * 80);
        aGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
        aGrad.addColorStop(0.3, i % 2 === 0 ? 'rgba(105, 240, 174, 0.45)' : 'rgba(255, 128, 171, 0.45)');
        aGrad.addColorStop(0.7, 'rgba(179, 157, 219, 0.35)');
        aGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.moveTo(0, 100 + i * 70);
        for (let x = 0; x <= this.width; x += 40) {
          const wave = Math.sin(this.timer * 0.8 + x * 0.005 + i * 1.5) * 45;
          ctx.lineTo(x, 120 + i * 70 + wave);
        }
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Stars
    ctx.save();
    this.stars.forEach(s => {
      const opacity = (Math.sin(s.twinkle) + 1) * 0.45 + 0.1;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(s.x % this.width, s.y % this.height, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Giant Moon
    ctx.save();
    const moonGlow = 16 + beatEnergy * 16;
    ctx.shadowColor = '#FFF9C4';
    ctx.shadowBlur = moonGlow;
    ctx.fillStyle = '#FFF9C4';
    const moonX = this.width - 120;
    const moonY = 110;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32 + beatEnergy * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#17142a';
    ctx.beginPath();
    ctx.arc(moonX - 14, moonY - 8, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // City Skyline
    if (activeMode === 'midnight' || (activeMode === 'dynamic' && altitude < 4000)) {
      const cityAlpha = activeMode === 'dynamic' ? Math.max(0, 1 - (altitude - 1000) / 2500) : 1.0;
      ctx.save();
      ctx.globalAlpha = cityAlpha;
      const skyParallax = cameraY * 0.18;

      this.buildings.forEach(b => {
        const by = this.height - b.height + skyParallax;
        ctx.fillStyle = '#1c162e';
        ctx.fillRect(b.x, by, b.width, b.height + 300);

        b.windows.forEach(w => {
          ctx.fillStyle = w.color;
          ctx.globalAlpha = (0.5 + beatEnergy * 0.2) * cityAlpha;
          ctx.fillRect(b.x + w.c * 14, by + w.r * 18, 6, 9);
        });
        ctx.globalAlpha = cityAlpha;

        if (b.roofSign && by > -100 && by < this.height) {
          ctx.save();
          const neonBlur = 12 + beatEnergy * 22;
          ctx.shadowColor = b.roofSign.color;
          ctx.shadowBlur = neonBlur;
          ctx.strokeStyle = b.roofSign.color;
          ctx.lineWidth = 2 + beatEnergy * 1.5;
          ctx.strokeRect(b.x + 4, by - 26, b.width - 8, 22);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(b.roofSign.text, b.x + b.width / 2, by - 12);
          ctx.restore();
        }
      });
      ctx.restore();
    }

    // Sakura Petals
    if (activeMode === 'sunset' || (activeMode === 'dynamic' && altitude > 800 && altitude < 3800)) {
      ctx.save();
      ctx.fillStyle = '#FFB6C1';
      this.petals.forEach(p => {
        ctx.beginPath();
        ctx.ellipse(p.x % this.width, p.y % this.height, p.size, p.size * 0.6, p.sway, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Street Puddle
    if (cameraY < 400) {
      const streetY = this.height - 30 + cameraY;
      ctx.fillStyle = '#161122';
      ctx.fillRect(0, streetY, this.width, 30);

      const puddle = ctx.createLinearGradient(0, streetY, 0, streetY + 25);
      puddle.addColorStop(0, `rgba(255, 128, 171, ${0.35 + beatEnergy * 0.2})`);
      puddle.addColorStop(0.5, `rgba(0, 229, 255, ${0.3 + beatEnergy * 0.2})`);
      puddle.addColorStop(1, 'rgba(105, 240, 174, 0.2)');
      ctx.fillStyle = puddle;
      ctx.beginPath();
      ctx.ellipse(this.width * 0.3, streetY + 12, 100 + beatEnergy * 15, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(this.width * 0.75, streetY + 14, 130 + beatEnergy * 20, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      this.ripples.forEach(r => {
        ctx.strokeStyle = `rgba(180, 220, 255, ${r.life * 0.5})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y + cameraY, r.radius * 2, r.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Rain
    ctx.strokeStyle = `rgba(210, 235, 255, ${0.4 + this.rainIntensity * 0.2})`;
    ctx.lineWidth = 1 + this.rainIntensity * 0.5;
    this.rainDrops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 2, d.y + d.length);
      ctx.stroke();
    });
  }
}
