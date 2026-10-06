/**
 * Fullscreen Lo-Fi Cloud Hopper Engine
 * Features:
 * - Dynamic Fullscreen Resizing
 * - Soundtrack-Reactive Neon & World Pulse
 * - Cozy Cloud Companions & Mini-Missions (Pip the Duck, Mocha Pigeon, Mochi Bunny)
 * - Lo-Fi Weather & Ambiance Controller (Rain, Vinyl, Sky Presets)
 * - In-Game Hat Wardrobe
 */

import { Player } from './player.js';
import { CloudPlatform } from './platforms.js';
import { Collectible } from './collectibles.js';
import { LoFiBackground } from './background.js';
import { LoFiAudio } from './audio.js';
import { CloudCompanion } from './npcs.js';

export class GameEngine {
  constructor(canvas, uiHooks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.uiHooks = uiHooks;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Services
    this.audio = new LoFiAudio();
    this.bg = new LoFiBackground(this.width, this.height);

    // Entities
    this.player = new Player(this.width / 2 - 17, this.height - 120);
    this.platforms = [];
    this.collectibles = [];
    this.companions = [];
    this.particles = [];

    // Camera & Altitude
    this.cameraY = 0;
    this.highestY = this.player.y;
    this.nextSpawnY = this.height - 180;
    this.currentAltitude = 0;

    // Score & Economy
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('lofi_cloud_hopper_highscore') || '0', 10);
    this.beansCollected = 0;
    this.totalBeans = parseInt(localStorage.getItem('lofi_cloud_hopper_beans') || '0', 10);
    this.starsCollected = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.comboTimer = 0;

    // Caffeine Gauge (0 to 100)
    this.caffeineGauge = 0;

    // Active Mini-Mission
    this.activeMission = null;

    // Milestones
    this.currentMilestone = '';
    this.milestoneTimer = 0;

    // State: 'start', 'playing', 'paused', 'gameover', 'wardrobe', 'ambiance'
    this.state = 'start';

    // Inputs
    this.input = {
      left: false,
      right: false,
      jump: false,
      jumpJustPressed: false,
      dashJustPressed: false
    };

    this.initInputs();
    this.initLevel();

    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.bg.resize(this.width, this.height);
  }

  initLevel() {
    this.platforms = [];
    this.collectibles = [];
    this.companions = [];
    this.particles = [];
    this.activeMission = null;

    // Starting solid cloud
    this.platforms.push(new CloudPlatform(this.width / 2 - 140, this.height - 50, 280, 'pink', false, this.width));

    // Initial staircase with clean, airy spacing (95 - 115px apart)
    let currY = this.height - 130;
    while (currY > -200) {
      this.spawnPlatformAt(currY);
      currY -= 95 + Math.random() * 20;
    }
    this.nextSpawnY = currY;
  }

  spawnPlatformAt(y) {
    // 1 primary cloud per height layer with natural organic positioning
    const minW = 130;
    const maxW = 180;
    const width = minW + Math.random() * (maxW - minW);

    // Pick an organic horizontal position (leaving plenty of open sky)
    const margin = 60;
    const x = margin + Math.random() * (this.width - width - margin * 2);

    // Cloud types: 55% comfy pink, 22% bouncy matcha, 15% lavender, 8% rainbow
    const r = Math.random();
    let type = 'pink';
    if (r < 0.22) type = 'matcha';
    else if (r < 0.30) type = 'rainbow';
    else if (r < 0.45) type = 'lavender';

    const isMoving = Math.random() < 0.25 && y < this.height - 300;
    this.platforms.push(new CloudPlatform(x, y, width, type, isMoving, this.width));

    // Optional 2nd alternate cloud (only 20% chance on wide screens)
    if (this.width > 900 && Math.random() < 0.2) {
      const altWidth = 120 + Math.random() * 40;
      const altX = (x > this.width / 2) 
        ? margin + Math.random() * (this.width * 0.4 - altWidth)
        : (this.width * 0.6) + Math.random() * (this.width * 0.35 - altWidth);
      this.platforms.push(new CloudPlatform(altX, y + (Math.random() - 0.5) * 20, altWidth, 'pink', false, this.width));
    }

    // Cozy Animal Companion (rare, 1 every ~1200m)
    const altitudeApprox = Math.floor(-y);
    if (altitudeApprox > 400 && Math.random() < 0.05 && this.companions.length < 2) {
      const types = ['duck', 'pigeon', 'bunny'];
      const compType = types[Math.floor(Math.random() * types.length)];
      this.companions.push(new CloudCompanion(x + width / 2 - 15, y - 30, compType));
    } else if (Math.random() < 0.35) {
      // Uncluttered, rewarding pickups (only ~35% of clouds have an item)
      const pickR = Math.random();
      let itemType = 'bean';
      if (pickR < 0.40) itemType = 'star';
      else if (pickR < 0.52) itemType = 'fish';
      else if (pickR < 0.62) itemType = 'boba';
      else if (pickR < 0.70) itemType = 'heart';
      else if (pickR < 0.76) itemType = 'ring'; // Rare, exciting boost ring

      const itemX = x + width / 2 - (itemType === 'ring' ? 20 : 10);
      const itemY = y - (itemType === 'ring' ? 34 : 26);
      this.collectibles.push(new Collectible(itemX, itemY, itemType));
    }
  }

  start() {
    this.audio.resume();
    this.state = 'playing';
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.beansCollected = 0;
    this.starsCollected = 0;
    this.caffeineGauge = 0;
    this.activeMission = null;

    const currentHat = this.player.hat;
    this.player = new Player(this.width / 2 - 17, this.height - 100);
    this.player.setHat(currentHat);

    this.cameraY = 0;
    this.highestY = this.player.y;
    this.initLevel();
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      this.audio.resume();

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!this.input.jump) this.input.jumpJustPressed = true;
        this.input.jump = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
        this.input.dashJustPressed = true;
      }

      // Wardrobe toggle ('H')
      if (e.code === 'KeyH') {
        this.state = this.state === 'wardrobe' ? 'playing' : 'wardrobe';
      }

      // Ambiance / Weather Settings toggle ('O')
      if (e.code === 'KeyO') {
        this.state = this.state === 'ambiance' ? 'playing' : 'ambiance';
      }

      // Pause toggle ('P' or ESC)
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'playing') this.state = 'paused';
        else if (this.state === 'paused' || this.state === 'wardrobe' || this.state === 'ambiance') this.state = 'playing';
      }

      if ((this.state === 'start' || this.state === 'gameover') && (e.code === 'Space' || e.code === 'Enter')) {
        this.start();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.input.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.input.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') this.input.jump = false;
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this.audio.resume();
      if (this.state === 'start' || this.state === 'gameover') {
        this.start();
        return;
      }
      if (this.state === 'wardrobe' || this.state === 'ambiance') {
        this.state = 'playing';
        return;
      }
      const touch = e.touches[0];
      const x = touch.clientX;
      if (x < this.width * 0.35) this.input.left = true;
      else if (x > this.width * 0.65) this.input.right = true;
      else this.input.jumpJustPressed = true;
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.input.left = false;
      this.input.right = false;
    }, { passive: true });
  }

  update() {
    this.audio.updateBeatEnergy();

    if (this.state !== 'playing') {
      this.bg.update(this.cameraY);
      return;
    }

    // 1. Update Player
    this.player.update(this.input, this.audio);
    this.input.jumpJustPressed = false;
    this.input.dashJustPressed = false;

    // Wrap around screen
    if (this.player.x < -this.player.width) this.player.x = this.width;
    if (this.player.x > this.width) this.player.x = -this.player.width;

    // 2. Camera Smooth Tracking
    const targetCameraY = (this.height * 0.55) - this.player.y;
    if (targetCameraY > this.cameraY) {
      this.cameraY += (targetCameraY - this.cameraY) * 0.1;
    }

    // 3. Altitude Milestones
    this.currentAltitude = Math.max(0, Math.floor(this.cameraY));
    this.checkMilestones();

    if (this.player.y < this.highestY) {
      const diff = Math.floor(this.highestY - this.player.y);
      this.score += Math.floor(diff * this.combo);
      this.highestY = this.player.y;

      // Update Climb Mission
      if (this.activeMission && this.activeMission.id === 'climb') {
        this.activeMission.current = Math.min(this.activeMission.target, this.currentAltitude - this.activeMission.startAltitude);
        if (this.activeMission.current >= this.activeMission.target) {
          this.completeMission();
        }
      }
    }

    // 4. Update Platforms & Collisions
    this.player.isGrounded = false;
    const playerFeet = this.player.y + this.player.height;
    const prevFeet = playerFeet - this.player.vy;

    this.platforms.forEach(plat => {
      plat.update();
      if (!plat.active) return;

      if (this.player.vy > 0) {
        if (
          this.player.x + this.player.width > plat.x + 6 &&
          this.player.x < plat.x + plat.width - 6 &&
          prevFeet <= plat.y + 6 &&
          playerFeet >= plat.y - 6
        ) {
          plat.triggerSpring();

          if (plat.type === 'matcha') {
            this.player.bounce(1.55, this.audio);
            this.triggerCombo();
            this.spawnPuff(plat.x + plat.width / 2, plat.y, '#A8E6CF');
          } else if (plat.type === 'rainbow') {
            this.player.bounce(1.25, this.audio);
            this.score += 350;
            this.triggerCombo();
            this.spawnPuff(plat.x + plat.width / 2, plat.y, '#FFE082');
          } else {
            this.player.y = plat.y - this.player.height;
            this.player.vy = 0;
            this.player.land();
            this.spawnPuff(plat.x + plat.width / 2, plat.y, '#FFD1DC');
          }

          if (plat.type === 'lavender') {
            plat.steppedOn = true;
          }
        }
      }
    });

    // 5. Update Cloud Companions & Meeting Trigger
    this.companions.forEach(comp => {
      comp.update(this.player, (c) => {
        if (!this.activeMission) {
          this.activeMission = { ...c.mission, companion: c.type };
          if (this.activeMission.id === 'climb') {
            this.activeMission.startAltitude = this.currentAltitude;
          }
          const animalName = c.type === 'duck' ? 'Pip the Duck 🦆' : c.type === 'pigeon' ? 'Mocha Pigeon 🐦' : 'Mochi Bunny 🐰';
          this.showMilestone(`NEW MISSION from ${animalName}: ${this.activeMission.desc}`);
          this.audio.playPowerup();
        }
      });
    });

    // 6. Update Active Mini-Mission Timer
    if (this.activeMission) {
      this.activeMission.timeLeft--;
      if (this.activeMission.timeLeft <= 0) {
        this.showMilestone('Mission expired! Try again next time ☁️');
        this.activeMission = null;
      }
    }

    // 7. Update Collectibles & Collisions
    this.collectibles.forEach(item => {
      item.update(this.player);
      if (!item.collected) {
        const dist = Math.hypot(
          (this.player.x + 17) - (item.x + 10),
          (this.player.y + 17) - (item.y + 10)
        );
        if (dist < 28) {
          item.collected = true;

          if (item.type === 'bean') {
            this.beansCollected++;
            this.totalBeans++;
            localStorage.setItem('lofi_cloud_hopper_beans', this.totalBeans.toString());
            this.score += 150 * this.combo;
            this.audio.playBeanCollect();

            // Check Bean Mission
            if (this.activeMission && this.activeMission.id === 'beans') {
              this.activeMission.current++;
              if (this.activeMission.current >= this.activeMission.target) {
                this.completeMission();
              }
            }

            // Fill Caffeine Gauge
            this.caffeineGauge = Math.min(100, this.caffeineGauge + 12);
            if (this.caffeineGauge >= 100) {
              this.player.activateCaffeineRush();
              this.audio.playPowerup();
              this.caffeineGauge = 0;
              this.showMilestone('⚡ CAFFEINE RUSH ACTIVATED! ⚡');
            }
          } else if (item.type === 'star') {
            this.starsCollected++;
            this.score += 400 * this.combo;
            this.audio.playStarCollect();
            this.triggerCombo();
          } else if (item.type === 'fish') {
            this.score += 800 * this.combo;
            this.player.bounce(1.3, this.audio);
            this.audio.playPowerup();
            this.showMilestone('🐟 YUMMY FISH TREAT! +800 PTS!');
            this.triggerCombo();
          } else if (item.type === 'heart') {
            this.player.lives = Math.min(this.player.maxLives, this.player.lives + 1);
            this.audio.playPowerup();
            this.showMilestone('❤️ CAT HEART RESTORED! (Max 3)');
          } else if (item.type === 'ring') {
            // Rainbow Boost Launch Ring!
            this.score += 600 * this.combo;
            this.player.bounce(2.2, this.audio);
            this.audio.playPowerup();
            this.showMilestone('🌈 SKY BOOST RING! 🚀');
            this.triggerCombo(true);
          } else if (item.type === 'boba') {
            this.player.activateBubbleShield();
            this.audio.playPowerup();
            this.showMilestone('🧋 BOBA SHIELD ACQUIRED!');
          } else if (item.type === 'catnip') {
            this.triggerCombo(true);
            this.audio.playPowerup();
            this.showMilestone('🌿 CATNIP COMBO FRENZY!');
          }

          this.spawnItemSparkles(item.x + 10, item.y + 10, item.type);
        }
      }
    });

    // 8. Combo Timer & Check Combo Mission
    if (this.combo > 1) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
      if (this.activeMission && this.activeMission.id === 'combo') {
        this.activeMission.current = Math.max(this.activeMission.current, this.combo);
        if (this.activeMission.current >= this.activeMission.target) {
          this.completeMission();
        }
      }
    }

    // 9. Procedural Spawning with clean, airy vertical pacing
    while (this.nextSpawnY > -this.cameraY - 200) {
      this.spawnPlatformAt(this.nextSpawnY);
      this.nextSpawnY -= 95 + Math.random() * 20;
    }

    const cleanupThreshold = -this.cameraY + this.height + 150;
    this.platforms = this.platforms.filter(p => p.y < cleanupThreshold);
    this.collectibles = this.collectibles.filter(c => c.y < cleanupThreshold && !c.collected);
    this.companions = this.companions.filter(c => c.y < cleanupThreshold);

    // 10. Update Background & Particles
    this.bg.update(this.cameraY);

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // 11. Check Fall & 3-Life Angel Rescue!
    if (this.player.y > -this.cameraY + this.height + 25) {
      if (this.player.hasBubbleShield) {
        this.player.hasBubbleShield = false;
        this.player.bounce(1.8, this.audio);
        this.audio.playBubbleShieldPop();
        this.showMilestone('🫧 BOBA BUBBLE RESCUE!');
        this.spawnPuff(this.player.x + 16, this.player.y + 16, '#80DEEA');
      } else if (this.player.lives > 1) {
        // Cat Life Angel Rescue!
        this.player.lives--;
        this.player.invincibleTimer = 140;
        this.player.bounce(2.1, this.audio);
        this.audio.playBubbleShieldPop();
        this.showMilestone(`❤️ CAT ANGEL RESCUE! (${this.player.lives} Hearts Left)`);
        this.spawnPuff(this.player.x + 16, this.player.y + 16, '#FF80AB');
      } else {
        this.player.lives = 0;
        this.gameOver();
      }
    }
  }

  completeMission() {
    this.audio.playMissionSuccess();
    this.score += 2000;
    this.player.activateCaffeineRush(420); // 7s caffeine rush
    this.showMilestone(`🎉 MISSION COMPLETE! +2,000 PTS & CAFFEINE RUSH!`);

    // Golden Confetti Explosion
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: this.player.x + 16,
        y: this.player.y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#FFE082', '#FF80AB', '#80DEEA', '#A8E6CF', '#FFD54F'][i % 5],
        size: 5,
        life: 45
      });
    }

    this.activeMission = null;
  }

  checkMilestones() {
    if (this.milestoneTimer > 0) this.milestoneTimer--;

    const alt = this.currentAltitude;
    if (alt >= 1200 && !this.m1200) {
      this.m1200 = true;
      this.showMilestone('🌸 REACHED TWILIGHT SAKURA (1,200m)!');
    } else if (alt >= 2800 && !this.m2800) {
      this.m2800 = true;
      this.showMilestone('✨ ENTERING AURORA STRATOSPHERE (2,800m)!');
    } else if (alt >= 5000 && !this.m5000) {
      this.m5000 = true;
      this.showMilestone('🚀 REACHED COSMIC ORBIT (5,000m)!');
    }
  }

  showMilestone(text) {
    this.currentMilestone = text;
    this.milestoneTimer = 180;
  }

  triggerCombo(superBoost = false) {
    this.combo = Math.min(15, this.combo + (superBoost ? 3 : 1));
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.comboTimer = 200;
  }

  spawnPuff(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (1.2 + Math.random()),
        vy: Math.sin(angle) * (0.8 + Math.random()),
        color,
        size: 5,
        life: 18
      });
    }
  }

  spawnItemSparkles(x, y, type) {
    const colors = type === 'boba' ? ['#80DEEA', '#E0F7FA'] :
                   type === 'catnip' ? ['#69F0AE', '#B9F6CA'] :
                   ['#FFF59D', '#FF80AB', '#B39DDB'];
    for (let i = 0; i < 9; i++) {
      const angle = (Math.PI * 2 * i) / 9;
      const speed = 2 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 4,
        life: 22
      });
    }
  }

  gameOver() {
    this.state = 'gameover';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('lofi_cloud_hopper_highscore', this.highScore.toString());
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Fullscreen Parallax Background with Audio-Reactive Beat Energy!
    this.bg.draw(this.ctx, this.cameraY, this.audio.getBeatEnergy());

    // 2. World Space
    this.ctx.save();
    this.ctx.translate(0, Math.floor(this.cameraY));

    // Draw Platforms (with Warm Cafe theme support)
    const isCafe = this.bg.atmospherePreset === 'cafe' || (this.bg.atmospherePreset === 'dynamic' && this.currentAltitude < 1200);
    this.platforms.forEach(p => p.draw(this.ctx, isCafe));

    // Draw Companions
    this.companions.forEach(c => c.draw(this.ctx));

    // Draw Collectibles
    this.collectibles.forEach(c => c.draw(this.ctx));

    // Draw Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life / 22;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    // Draw Player
    this.player.draw(this.ctx);

    this.ctx.restore();

    // 3. Fullscreen Glassmorphism HUD Overlay
    this.drawHUD();
  }

  drawHUD() {
    const ctx = this.ctx;
    ctx.save();

    // Top Floating Stats Pill docked on top-left (leaving top-right open for buttons)
    const hudX = 20;
    const hudY = 16;
    const hudW = Math.min(540, this.width - 40);

    ctx.fillStyle = 'rgba(18, 15, 32, 0.82)';
    ctx.beginPath();
    ctx.roundRect(hudX, hudY, hudW, 50, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 128, 171, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Score
    ctx.fillStyle = '#FFE082';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('SCORE', hudX + 18, hudY + 19);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 17px "Courier New", monospace';
    ctx.fillText(this.score.toLocaleString(), hudX + 18, hudY + 40);

    // Altitude
    ctx.fillStyle = '#80DEEA';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('ALTITUDE', hudX + 110, hudY + 19);
    ctx.fillStyle = '#E0F7FA';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillText(`${this.currentAltitude}m`, hudX + 110, hudY + 40);

    // Beans
    ctx.fillStyle = '#FF80AB';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('☕ BEANS', hudX + 198, hudY + 19);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillText(`${this.beansCollected}`, hudX + 198, hudY + 40);

    // 3 Cat Lives Hearts
    ctx.fillStyle = '#FF80AB';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('LIVES', hudX + 278, hudY + 19);
    for (let h = 0; h < 3; h++) {
      const isAlive = h < this.player.lives;
      ctx.fillStyle = isAlive ? '#FF4081' : 'rgba(255, 255, 255, 0.2)';
      ctx.font = '14px sans-serif';
      ctx.fillText(isAlive ? '❤️' : '🤍', hudX + 276 + h * 17, hudY + 40);
    }

    // Caffeine Gauge Bar
    const gaugeX = hudX + 348;
    const gaugeW = Math.max(60, hudW - 368);
    ctx.fillStyle = '#B39DDB';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('CAFFEINE RUSH', gaugeX, hudY + 19);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(gaugeX, hudY + 25, gaugeW, 14, 6);
    ctx.fill();

    const fillRatio = this.player.caffeineTimer > 0 ? (this.player.caffeineTimer / 360) : (this.caffeineGauge / 100);
    if (fillRatio > 0) {
      const grad = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeW, 0);
      grad.addColorStop(0, '#FF80AB');
      grad.addColorStop(1, '#FFE082');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(gaugeX, hudY + 25, gaugeW * fillRatio, 14, 6);
      ctx.fill();
    }

    // Active Mission HUD Banner (Floats right under HUD)
    if (this.activeMission) {
      const mX = this.width / 2;
      const mY = hudY + 68;
      ctx.save();
      ctx.fillStyle = 'rgba(25, 20, 48, 0.88)';
      ctx.beginPath();
      ctx.roundRect(mX - 170, mY, 340, 30, 8);
      ctx.fill();
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#FFE082';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${this.activeMission.title} (${this.activeMission.current}/${this.activeMission.target})`, mX - 155, mY + 19);

      // Remaining Time
      const secondsLeft = Math.ceil(this.activeMission.timeLeft / 60);
      ctx.fillStyle = secondsLeft <= 5 ? '#FF5252' : '#80DEEA';
      ctx.textAlign = 'right';
      ctx.fillText(`⏱ ${secondsLeft}s`, mX + 155, mY + 19);
      ctx.restore();
    }

    // Combo Pill
    if (this.combo > 1) {
      const cX = this.width / 2;
      const cY = hudY + (this.activeMission ? 104 : 76);
      ctx.save();
      ctx.shadowColor = '#FF4081';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.roundRect(cX - 55, cY, 110, 30, 10);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${this.combo}x COMBO`, cX, cY + 20);
      ctx.restore();
    }

    // Milestone Toast Banner
    if (this.milestoneTimer > 0) {
      ctx.save();
      const alpha = Math.min(1.0, this.milestoneTimer / 30);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 16;
      ctx.fillStyle = 'rgba(25, 20, 45, 0.92)';
      const mw = Math.min(480, this.width - 40);
      ctx.beginPath();
      ctx.roundRect((this.width - mw) / 2, hudY + 144, mw, 38, 12);
      ctx.fill();
      ctx.strokeStyle = '#80DEEA';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#E0F7FA';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.currentMilestone, this.width / 2, hudY + 168);
      ctx.restore();
    }

    // Modals
    if (this.state === 'start') {
      this.drawModal(
        'LO-FI CLOUD HOPPER ♫',
        'Leap across dreamlike clouds, complete cozy missions, and chill to lo-fi beats!',
        [
          '• A / D or ← / → : Steer the Kitten',
          '• Space / W : Jump (Tap in air for Spin Double Jump!)',
          '• Shift / X : Air Dash',
          '• Meet Pip the Duck 🦆 & Mocha Pigeon 🐦 for cozy mini-missions!',
          '• Press O to adjust Rain, Vinyl, and Atmosphere anytime!'
        ],
        'PRESS SPACE OR TAP TO HOP'
      );
    } else if (this.state === 'gameover') {
      this.drawModal(
        'RUN FINISHED ☕',
        `Final Score: ${this.score.toLocaleString()} | Altitude: ${this.currentAltitude}m`,
        [
          `• Coffee Beans Gathered: ☕ ${this.beansCollected}`,
          `• Star Crystals: ★ ${this.starsCollected}`,
          `• Max Combo: ${this.maxCombo}x`,
          `• All-Time High Score: ${this.highScore.toLocaleString()}`
        ],
        'PRESS SPACE TO PLAY AGAIN'
      );
    } else if (this.state === 'paused') {
      this.drawModal(
        'GAME PAUSED ☕',
        'Take a sip of tea and chill.',
        [
          '• Press P or ESC to Resume',
          '• Press H for Kitty Wardrobe',
          '• Press O for Weather & Ambiance Controller'
        ],
        'PRESS P TO RESUME'
      );
    } else if (this.state === 'wardrobe') {
      this.drawWardrobeModal();
    } else if (this.state === 'ambiance') {
      this.drawAmbianceModal();
    }

    ctx.restore();
  }

  drawAmbianceModal() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(15, 12, 28, 0.88)';
    ctx.fillRect(0, 0, this.width, this.height);

    const mw = 480;
    const mh = 360;
    const mx = (this.width - mw) / 2;
    const my = (this.height - mh) / 2;

    ctx.fillStyle = '#231b38';
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 18);
    ctx.fill();
    ctx.strokeStyle = '#80DEEA';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = '#80DEEA';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#E0F7FA';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☕ WEATHER & AMBIANCE', this.width / 2, my + 42);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#B39DDB';
    ctx.font = '12px sans-serif';
    ctx.fillText('Customize your cozy soundscape & visual atmosphere:', this.width / 2, my + 70);

    // Presets
    const presets = [
      { id: 'dynamic', label: 'Dynamic Altitude ☁️' },
      { id: 'midnight', label: 'Midnight Neon 🌙' },
      { id: 'sunset', label: 'Sunset Sakura 🌸' },
      { id: 'aurora', label: 'Aurora Lights ✨' },
      { id: 'cafe', label: 'Warm Cafe ☕' }
    ];

    presets.forEach((p, i) => {
      const px = mx + 30 + (i % 2) * 215;
      const py = my + 100 + Math.floor(i / 2) * 55;
      const isSel = this.bg.atmospherePreset === p.id;

      ctx.fillStyle = isSel ? 'rgba(128, 222, 234, 0.35)' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(px, py, 200, 44, 8);
      ctx.fill();
      ctx.strokeStyle = isSel ? '#80DEEA' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSel ? '#FFFFFF' : '#E0E0E0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, px + 100, py + 26);
    });

    // Close button
    const btnY = my + mh - 55;
    ctx.fillStyle = '#00B0FF';
    ctx.beginPath();
    ctx.roundRect(mx + 60, btnY, mw - 120, 38, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS O OR SPACE TO CLOSE', this.width / 2, btnY + 24);
  }

  drawWardrobeModal() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(15, 12, 28, 0.88)';
    ctx.fillRect(0, 0, this.width, this.height);

    const mw = 480;
    const mh = 340;
    const mx = (this.width - mw) / 2;
    const my = (this.height - mh) / 2;

    ctx.fillStyle = '#231b38';
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 18);
    ctx.fill();
    ctx.strokeStyle = '#FF80AB';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = '#FF80AB';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFF0F5';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🐱 KITTY WARDROBE', this.width / 2, my + 42);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#B39DDB';
    ctx.font = '12px sans-serif';
    ctx.fillText('Select your favorite hat to hop with:', this.width / 2, my + 70);

    const hats = [
      { id: 'strawberry', name: 'Strawberry 🍓' },
      { id: 'wizard', name: 'Wizard 🧙' },
      { id: 'detective', name: 'Detective 🔍' },
      { id: 'crown', name: 'Royal Crown 👑' },
      { id: 'halo', name: 'Angel Halo 😇' },
      { id: 'sakura', name: 'Sakura 🌸' }
    ];

    hats.forEach((h, i) => {
      const hx = mx + 45 + (i % 3) * 135;
      const hy = my + 100 + Math.floor(i / 3) * 80;
      const isSelected = this.player.hat === h.id;

      ctx.fillStyle = isSelected ? 'rgba(255, 128, 171, 0.35)' : 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(hx, hy, 120, 60, 10);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#FF80AB' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#FFF0F5' : '#E0E0E0';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(h.name, hx + 60, hy + 35);
    });

    const btnY = my + mh - 55;
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.roundRect(mx + 60, btnY, mw - 120, 38, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS H OR SPACE TO CLOSE', this.width / 2, btnY + 24);
  }

  drawModal(title, subtitle, bullets, actionText) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(12, 10, 24, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);

    const mw = Math.min(500, this.width - 40);
    const mh = 330;
    const mx = (this.width - mw) / 2;
    const my = (this.height - mh) / 2;

    ctx.fillStyle = '#221936';
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 18);
    ctx.fill();
    ctx.strokeStyle = '#FF80AB';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowColor = '#FF80AB';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFF0F5';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, my + 44);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#B39DDB';
    ctx.font = '12px sans-serif';
    ctx.fillText(subtitle, this.width / 2, my + 72);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#E8E8E8';
    ctx.font = '13px monospace';
    bullets.forEach((b, i) => {
      ctx.fillText(b, mx + 36, my + 115 + i * 26);
    });

    ctx.textAlign = 'center';
    const btnY = my + mh - 54;
    ctx.fillStyle = '#FF4081';
    ctx.beginPath();
    ctx.roundRect(mx + 45, btnY, mw - 90, 38, 10);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(actionText, this.width / 2, btnY + 24);
  }
}
