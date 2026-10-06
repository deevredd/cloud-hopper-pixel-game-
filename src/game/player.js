/**
 * Player: Chibi White Kitten with Retro Glowing Headphones
 * Features:
 * - Floaty & Forgiving Physics (Coyote time, Jump buffering, Glide umbrella)
 * - 3 Cat Hearts / Lives (Angel Rescue on fall)
 * - Squash & Stretch procedural animation
 * - Built-in gentle magnet for collectibles
 * - In-game Hat Wardrobe: Strawberry, Wizard, Detective, Crown, Halo, Sakura
 */

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 36;
    this.height = 36;

    // Movement physics - floatier & more forgiving
    this.vx = 0;
    this.vy = 0;
    this.baseSpeed = 5.6;
    this.speed = this.baseSpeed;
    this.gravity = 0.36;
    this.jumpForce = -10.4;
    this.bounceForce = -15.5;

    // Forgiving Jump Mechanics
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.coyoteTimer = 0; // Frames allowed to jump after leaving platform
    this.jumpBuffer = 0;  // Frames allowed to pre-press jump before landing
    this.isGliding = false;

    // 3 Cat Lives ❤️❤️❤️
    this.lives = 3;
    this.maxLives = 3;
    this.invincibleTimer = 0;

    // Dashing
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.facing = 1;
    this.state = 'idle'; // 'idle', 'run', 'jump', 'fall', 'spin', 'dash', 'glide'
    this.animTimer = 0;
    this.spinAngle = 0;

    // Squash & Stretch
    this.scaleX = 1.0;
    this.scaleY = 1.0;

    // Trail
    this.trail = [];

    // Power-ups
    this.caffeineTimer = 0;
    this.hasBubbleShield = false;
    this.bubbleTimer = 0;

    // Hat Wardrobe
    this.hat = 'strawberry';
    this.headphoneColor = '#38ef7d';
  }

  setHat(hatName) {
    this.hat = hatName;
    if (hatName === 'wizard') this.headphoneColor = '#FFE082';
    else if (hatName === 'detective') this.headphoneColor = '#80DEEA';
    else if (hatName === 'crown') this.headphoneColor = '#FFD54F';
    else if (hatName === 'halo') this.headphoneColor = '#FFF9C4';
    else if (hatName === 'sakura') this.headphoneColor = '#FF80AB';
    else this.headphoneColor = '#38ef7d';
  }

  activateCaffeineRush(duration = 420) {
    this.caffeineTimer = duration;
    this.speed = this.baseSpeed * 1.35;
  }

  activateBubbleShield() {
    this.hasBubbleShield = true;
  }

  update(input, audio) {
    this.animTimer += 0.15;

    // Smooth squash return
    this.scaleX += (1.0 - this.scaleX) * 0.14;
    this.scaleY += (1.0 - this.scaleY) * 0.14;

    if (this.invincibleTimer > 0) this.invincibleTimer--;

    // Caffeine Rush timer
    if (this.caffeineTimer > 0) {
      this.caffeineTimer--;
      if (this.caffeineTimer <= 0) {
        this.speed = this.baseSpeed;
      }
      if (Math.random() < 0.6) {
        const colors = ['#FF80AB', '#80DEEA', '#FFE082', '#A8E6CF', '#B39DDB'];
        this.trail.push({
          x: this.x,
          y: this.y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 26,
          life: 16
        });
      }
    }

    if (this.hasBubbleShield) {
      this.bubbleTimer += 0.08;
    }

    // Dash
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.isDashing) {
      this.dashTimer--;
      this.vx = this.facing * 12.0;
      this.vy = 0;
      this.scaleX = 1.35;
      this.scaleY = 0.75;

      this.trail.push({
        x: this.x,
        y: this.y,
        color: 'rgba(255, 128, 171, 0.7)',
        size: 28,
        life: 14
      });

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx *= 0.35;
      }
      return;
    }

    // Horizontal Movement - responsive and smooth
    if (input.left) {
      this.vx = -this.speed;
      this.facing = -1;
      if (this.isGrounded) this.state = 'run';
    } else if (input.right) {
      this.vx = this.speed;
      this.facing = 1;
      if (this.isGrounded) this.state = 'run';
    } else {
      this.vx *= 0.75;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
      if (this.isGrounded) this.state = 'idle';
    }

    // Coyote Time & Jump Buffering
    if (this.isGrounded) {
      this.coyoteTimer = 10; // Can jump for 10 frames after leaving a cloud!
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    if (input.jumpJustPressed) {
      this.jumpBuffer = 8; // Buffer jump press for 8 frames
    } else if (this.jumpBuffer > 0) {
      this.jumpBuffer--;
    }

    // Jump Execution
    if (this.jumpBuffer > 0) {
      if (this.isGrounded || this.coyoteTimer > 0) {
        this.vy = this.jumpForce;
        this.isGrounded = false;
        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
        this.canDoubleJump = true;
        this.state = 'jump';
        this.scaleX = 0.8;
        this.scaleY = 1.3;
        if (audio) audio.playJump();
      } else if (this.canDoubleJump) {
        this.vy = this.jumpForce * 0.96;
        this.canDoubleJump = false;
        this.jumpBuffer = 0;
        this.state = 'spin';
        this.spinAngle = 0;
        this.scaleX = 1.1;
        this.scaleY = 1.1;
        if (audio) audio.playDoubleJump();

        for (let i = 0; i < 7; i++) {
          this.trail.push({
            x: this.x + 18,
            y: this.y + 18,
            color: '#FFE082',
            size: 6,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 22
          });
        }
      }
    }

    // Dash
    if (input.dashJustPressed && this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashTimer = 14;
      this.dashCooldown = 32;
      this.state = 'dash';
      if (audio) audio.playDash();
    }

    // --- GLIDE MECHANIC (Hold Space while falling to float gently!) ---
    this.isGliding = false;
    if (!this.isGrounded && this.vy > 0.5 && input.jump) {
      this.isGliding = true;
      this.vy = Math.min(this.vy, 2.2); // Cap falling speed softly!
      this.state = 'glide';

      // Gentle cloud puff particles while gliding
      if (Math.random() < 0.3) {
        this.trail.push({
          x: this.x + 10 + Math.random() * 16,
          y: this.y + 36,
          color: 'rgba(255, 255, 255, 0.6)',
          size: 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.5,
          life: 14
        });
      }
    } else {
      this.vy += this.gravity;
      if (this.vy > 12) this.vy = 12;
    }

    if (!this.isGrounded && !this.isGliding) {
      if (this.state === 'spin') {
        this.spinAngle += 0.4 * this.facing;
      } else {
        this.state = this.vy < 0 ? 'jump' : 'fall';
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Trail cleanup
    this.trail.forEach(p => {
      p.life--;
      if (p.vx) p.x += p.vx;
      if (p.vy) p.y += p.vy;
    });
    this.trail = this.trail.filter(p => p.life > 0);
  }

  land() {
    this.scaleX = 1.35;
    this.scaleY = 0.7;
    this.isGrounded = true;
    this.canDoubleJump = true;
    this.coyoteTimer = 10;
    this.state = 'idle';
  }

  bounce(multiplier = 1, audio = null) {
    this.vy = this.bounceForce * multiplier;
    this.isGrounded = false;
    this.canDoubleJump = true;
    this.coyoteTimer = 0;
    this.state = 'jump';
    this.scaleX = 0.75;
    this.scaleY = 1.45;
    if (audio) {
      if (multiplier > 1.2) audio.playMatchaLaunch();
      else audio.playJump();
    }
  }

  draw(ctx) {
    ctx.save();

    // Flash when invincible
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Trail Particles
    this.trail.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 20;
      ctx.beginPath();
      ctx.arc(p.x + 16, p.y + 16, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    const cx = Math.floor(this.x + this.width / 2);
    const cy = Math.floor(this.y + this.height / 2);
    ctx.translate(cx, cy);

    // Squash & Stretch
    ctx.scale(this.scaleX, this.scaleY);

    if (this.facing === -1) {
      ctx.scale(-1, 1);
    }

    if (this.state === 'spin') {
      ctx.rotate(this.spinAngle);
    }

    let bob = 0;
    if (this.state === 'idle') bob = Math.sin(this.animTimer * 1.5) * 1.5;
    if (this.state === 'run') bob = Math.abs(Math.sin(this.animTimer * 4)) * 3;

    // --- Cute Leaf Umbrella while Gliding ---
    if (this.isGliding) {
      ctx.save();
      // Green Leaf Canopy
      ctx.fillStyle = '#66BB6A';
      ctx.beginPath();
      ctx.ellipse(0, -28 + bob, 18, 9, 0, Math.PI, 0);
      ctx.fill();
      // Umbrella Stem
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -28 + bob);
      ctx.lineTo(0, -12 + bob);
      ctx.stroke();
      ctx.restore();
    }

    // --- Cat Body (Chibi Round Loaf) ---
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-14, -11 + bob, 28, 23, 10);
    ctx.fill();

    // Cute Cheeks
    ctx.fillStyle = '#FFF5F8';
    ctx.beginPath();
    ctx.arc(-11, bob, 4.5, 0, Math.PI * 2);
    ctx.arc(11, bob, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Outer Ears
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-11, -9 + bob);
    ctx.lineTo(-7, -20 + bob);
    ctx.lineTo(-2, -10 + bob);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(2, -10 + bob);
    ctx.lineTo(7, -20 + bob);
    ctx.lineTo(11, -9 + bob);
    ctx.fill();

    // Pink Inner Ears
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(-9, -10 + bob);
    ctx.lineTo(-7, -17 + bob);
    ctx.lineTo(-4, -10 + bob);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(4, -10 + bob);
    ctx.lineTo(7, -17 + bob);
    ctx.lineTo(9, -10 + bob);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#261F38';
    if (this.state === 'spin' || this.isGliding || (this.state === 'idle' && Math.sin(this.animTimer * 0.4) > 0.94)) {
      // Happy Closed Eyes (^ _ ^)
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#261F38';
      ctx.beginPath();
      ctx.arc(-5, -2 + bob, 3, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(5, -2 + bob, 3, Math.PI, 0);
      ctx.stroke();
    } else {
      // Big Anime Pixel Eyes
      ctx.fillRect(-7, -3 + bob, 4, 5);
      ctx.fillRect(3, -3 + bob, 4, 5);
      // Sparkle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -3 + bob, 2, 2);
      ctx.fillRect(3, -3 + bob, 2, 2);
    }

    // Rosy Pink Cheeks
    ctx.fillStyle = 'rgba(255, 128, 171, 0.7)';
    ctx.beginPath();
    ctx.arc(-9, 3 + bob, 3, 0, Math.PI * 2);
    ctx.arc(9, 3 + bob, 3, 0, Math.PI * 2);
    ctx.fill();

    // Cute Nose
    ctx.fillStyle = '#FF80AB';
    ctx.fillRect(-1.5, 1 + bob, 3, 2);

    // Tail waving
    const tailWiggle = Math.sin(this.animTimer * 2.8) * 5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, 5 + bob);
    ctx.quadraticCurveTo(-20, 1 + bob + tailWiggle, -18, -7 + bob + tailWiggle);
    ctx.stroke();

    // Backpack
    ctx.fillStyle = '#B39DDB';
    ctx.beginPath();
    ctx.roundRect(-15, -3 + bob, 5, 9, 2.5);
    ctx.fill();

    // --- Retro Glowing Headphones ---
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, -10 + bob, 13, Math.PI * 0.95, Math.PI * 2.05);
    ctx.stroke();

    ctx.shadowColor = this.headphoneColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.headphoneColor;
    ctx.beginPath();
    ctx.roundRect(-15, -11 + bob, 4.5, 12, 2);
    ctx.roundRect(10.5, -11 + bob, 4.5, 12, 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-14, -8 + bob, 2, 5);
    ctx.fillRect(11.5, -8 + bob, 2, 5);

    // --- Hats ---
    if (this.hat === 'strawberry') {
      ctx.fillStyle = '#FF5252';
      ctx.beginPath();
      ctx.arc(0, -18 + bob, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(-3, -26 + bob, 6, 2.5);
      ctx.fillStyle = '#FFF176';
      ctx.fillRect(-2, -18 + bob, 1.5, 1.5);
      ctx.fillRect(2, -16 + bob, 1.5, 1.5);
    } else if (this.hat === 'wizard') {
      ctx.fillStyle = '#7C4DFF';
      ctx.beginPath();
      ctx.moveTo(-9, -15 + bob);
      ctx.lineTo(0, -29 + bob);
      ctx.lineTo(9, -15 + bob);
      ctx.fill();
      ctx.fillStyle = '#FFD54F';
      ctx.fillRect(-2, -24 + bob, 4, 2.5);
    } else if (this.hat === 'detective') {
      ctx.fillStyle = '#8D6E63';
      ctx.beginPath();
      ctx.roundRect(-12, -18 + bob, 24, 6, 2.5);
      ctx.fill();
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(-8, -23 + bob, 16, 6);
    } else if (this.hat === 'crown') {
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.moveTo(-8, -16 + bob);
      ctx.lineTo(-8, -24 + bob);
      ctx.lineTo(-4, -19 + bob);
      ctx.lineTo(0, -26 + bob);
      ctx.lineTo(4, -19 + bob);
      ctx.lineTo(8, -24 + bob);
      ctx.lineTo(8, -16 + bob);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FF1744';
      ctx.fillRect(-1, -21 + bob, 2, 2);
    } else if (this.hat === 'halo') {
      ctx.strokeStyle = '#FFF59D';
      ctx.shadowColor = '#FFF59D';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -24 + bob, 10, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (this.hat === 'sakura') {
      ctx.fillStyle = '#FF80AB';
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        const px = Math.cos(ang) * 5;
        const py = -18 + bob + Math.sin(ang) * 5;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#FFF9C4';
      ctx.beginPath();
      ctx.arc(0, -18 + bob, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Boba Bubble Shield Overlay ---
    if (this.hasBubbleShield) {
      const bFloat = Math.sin(this.bubbleTimer * 2) * 2;
      ctx.save();
      ctx.shadowColor = '#80DEEA';
      ctx.shadowBlur = 14;
      const bGrad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 26);
      bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      bGrad.addColorStop(0.7, 'rgba(128, 222, 234, 0.3)');
      bGrad.addColorStop(1, 'rgba(255, 128, 171, 0.5)');
      ctx.fillStyle = bGrad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, bFloat, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-10, -10 + bFloat, 5, 2.5, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
