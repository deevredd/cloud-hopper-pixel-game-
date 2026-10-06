/**
 * Multi-Tier Cloud Platforms for Lo-Fi Cloud Hopper
 * - Pink (Standard Soft Cloud)
 * - Matcha Spring (Mega Jump Launch)
 * - Lavender Vapor (Fades and dissolves)
 * - Rainbow Star (Speed & Point boost)
 * - Moving Horizontal Cloud
 */

export class CloudPlatform {
  constructor(x, y, width, type = 'pink', isMoving = false, worldWidth = 800) {
    this.x = x;
    this.y = y;
    this.width = width || 95;
    this.height = 24;
    this.type = type; // 'pink', 'matcha', 'lavender', 'rainbow'
    this.isMoving = isMoving;
    this.moveSpeed = (Math.random() < 0.5 ? 1 : -1) * (1.1 + Math.random() * 0.9);
    this.minX = Math.max(20, x - 120);
    this.maxX = Math.min(worldWidth - width - 20, x + 120);

    // Vapor cloud decay
    this.steppedOn = false;
    this.decayTimer = 55;
    this.opacity = 1.0;
    this.active = true;
    this.respawnTimer = 0;

    // Matcha spring compression
    this.springSquash = 1.0;

    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update() {
    this.bobOffset += 0.035;

    // Moving horizontal clouds
    if (this.isMoving && this.active) {
      this.x += this.moveSpeed;
      if (this.x < this.minX || this.x > this.maxX) {
        this.moveSpeed *= -1;
      }
    }

    // Spring return
    this.springSquash += (1.0 - this.springSquash) * 0.15;

    // Lavender fading logic
    if (this.type === 'lavender') {
      if (this.steppedOn && this.active) {
        this.decayTimer--;
        this.opacity = Math.max(0, this.decayTimer / 55);
        if (this.decayTimer <= 0) {
          this.active = false;
          this.respawnTimer = 160;
        }
      } else if (!this.active) {
        this.respawnTimer--;
        if (this.respawnTimer <= 0) {
          this.active = true;
          this.steppedOn = false;
          this.decayTimer = 55;
          this.opacity = 1.0;
        }
      }
    }
  }

  triggerSpring() {
    this.springSquash = 0.5;
  }

  draw(ctx, isCafe = false) {
    if (!this.active && this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    const bob = Math.sin(this.bobOffset) * 2.5;
    const px = Math.floor(this.x);
    const py = Math.floor(this.y + bob);

    let mainColor, highlightColor, shadowColor, puffColor;
    if (isCafe) {
      // Warm Cafe: Toasted Marshmallow, Creamy Matcha Latte, and Honey Caramel
      if (this.type === 'matcha') {
        mainColor = '#C8E6C9';
        highlightColor = '#E8F5E9';
        shadowColor = '#A5D6A7';
        puffColor = '#DCEDC8';
      } else if (this.type === 'lavender') {
        mainColor = '#D7CCC8';
        highlightColor = '#EFEBE9';
        shadowColor = '#BCAAA4';
        puffColor = '#F5F0EE';
      } else if (this.type === 'rainbow') {
        mainColor = '#FFE082';
        highlightColor = '#FFF9C4';
        shadowColor = '#FFA726';
        puffColor = '#FFF3E0';
      } else {
        // Toasted Marshmallow Cream
        mainColor = '#FFE8DF';
        highlightColor = '#FFF5EE';
        shadowColor = '#FFCCBC';
        puffColor = '#FFF0EB';
      }
    } else {
      if (this.type === 'matcha') {
        mainColor = '#A8E6CF';
        highlightColor = '#DCEDC1';
        shadowColor = '#7BCBA8';
        puffColor = '#C1F0DC';
      } else if (this.type === 'lavender') {
        mainColor = '#D1C4E9';
        highlightColor = '#EDE7F6';
        shadowColor = '#B39DDB';
        puffColor = '#E1D8F2';
      } else if (this.type === 'rainbow') {
        mainColor = '#FFE082';
        highlightColor = '#FFF9C4';
        shadowColor = '#FFB74D';
        puffColor = '#FFF59D';
      } else {
        mainColor = '#FFD1DC';
        highlightColor = '#FFF0F5';
        shadowColor = '#FFB6C1';
        puffColor = '#FFE4E1';
      }
    }

    if (this.type === 'rainbow') {
      ctx.shadowColor = isCafe ? '#FFA726' : '#FF80AB';
      ctx.shadowBlur = 12;
    }

    // Cloud Base
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.roundRect(px, py + 8, this.width, 16 * this.springSquash, 8);
    ctx.fill();

    // Cloud Puffs
    const puffCount = Math.max(3, Math.floor(this.width / 24));
    const step = this.width / puffCount;

    for (let i = 0; i < puffCount; i++) {
      const puffX = px + i * step + step / 2;
      const puffRadius = 11 + (i % 2 === 1 ? 4 : 0);

      ctx.fillStyle = shadowColor;
      ctx.beginPath();
      ctx.arc(puffX, py + 12, puffRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = puffColor;
      ctx.beginPath();
      ctx.arc(puffX, py + 8, puffRadius - 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = highlightColor;
      ctx.beginPath();
      ctx.arc(puffX - 2, py + 5, puffRadius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Special Decal / Spring
    if (this.type === 'matcha') {
      // Coiled Spring Flower
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const springMid = px + this.width / 2;
      ctx.moveTo(springMid, py + 8);
      ctx.lineTo(springMid - 4, py + 2);
      ctx.lineTo(springMid + 4, py - 3);
      ctx.lineTo(springMid, py - 8 * this.springSquash);
      ctx.stroke();

      // Little flower blossom
      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.arc(springMid, py - 9 * this.springSquash, 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'rainbow') {
      // Little rainbow star
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.arc(px + this.width / 2, py + 8, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.isMoving) {
      // Direction arrows
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(this.moveSpeed > 0 ? '▶' : '◀', px + this.width / 2 - 4, py + 12);
    }

    ctx.restore();
  }
}
