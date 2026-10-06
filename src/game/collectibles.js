/**
 * Collectibles: Coffee Beans, Star Crystals, Boba Shield, Catnip, Golden Fish, and Cat Hearts
 */

export class Collectible {
  constructor(x, y, type = 'bean') {
    this.x = x;
    this.y = y;
    this.type = type; // 'bean', 'star', 'boba', 'catnip', 'fish', 'heart', 'ring'
    this.collected = false;
    this.width = type === 'ring' ? 44 : 22;
    this.height = type === 'ring' ? 24 : 22;
    this.floatTimer = Math.random() * Math.PI * 2;
  }

  update(player) {
    this.floatTimer += 0.05;

    // Natural gentle magnetic pull for all collectibles within 110px!
    // (And extra strong 220px magnetic pull during Caffeine Rush)
    if (player && !this.collected && this.type !== 'ring') {
      const magnetRange = player.caffeineTimer > 0 ? 240 : 110;
      const dx = (player.x + 18) - (this.x + 11);
      const dy = (player.y + 18) - (this.y + 11);
      const dist = Math.hypot(dx, dy);

      if (dist < magnetRange) {
        const pullSpeed = player.caffeineTimer > 0 ? 8.5 : 4.5;
        this.x += (dx / dist) * pullSpeed;
        this.y += (dy / dist) * pullSpeed;
      }
    }
  }

  draw(ctx) {
    if (this.collected) return;
    ctx.save();

    const bob = Math.sin(this.floatTimer) * 4.5;
    const cx = Math.floor(this.x + this.width / 2);
    const cy = Math.floor(this.y + this.height / 2 + bob);

    if (this.type === 'bean') {
      // Warm roasted coffee bean
      ctx.fillStyle = '#6D4C41';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 7, 9, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0.4, 2.7);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      const steamY = cy - 12 + Math.sin(this.floatTimer * 2) * 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy - 9);
      ctx.quadraticCurveTo(cx + 3, steamY, cx - 1, steamY - 5);
      ctx.stroke();

    } else if (this.type === 'star') {
      // Glowing Star Crystal
      ctx.fillStyle = '#FFF176';
      ctx.shadowColor = '#FFEE58';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      const points = 5;
      const outer = 9;
      const inner = 4;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const angle = (i * Math.PI) / points - Math.PI / 2 + this.floatTimer * 0.4;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

    } else if (this.type === 'fish') {
      // Golden Fish Cat Snack 🐟
      ctx.fillStyle = '#FFD54F';
      ctx.shadowColor = '#FFA000';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      // Fish body
      ctx.ellipse(cx - 2, cy, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail fin
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy);
      ctx.lineTo(cx + 12, cy - 5);
      ctx.lineTo(cx + 12, cy + 5);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(cx - 7, cy - 2, 2, 2);

    } else if (this.type === 'heart') {
      // Cat Heart ❤️
      ctx.fillStyle = '#FF4081';
      ctx.shadowColor = '#FF80AB';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 2, 4.5, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy - 2, 4.5, 0, Math.PI * 2);
      ctx.moveTo(cx - 8.5, cy);
      ctx.lineTo(cx, cy + 8.5);
      ctx.lineTo(cx + 8.5, cy);
      ctx.fill();

    } else if (this.type === 'boba') {
      // Boba Bubble Shield
      ctx.shadowColor = '#80DEEA';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(128, 222, 234, 0.35)';
      ctx.strokeStyle = '#E0F7FA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.arc(cx, cy + 2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'catnip') {
      // Catnip
      ctx.shadowColor = '#69F0AE';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#69F0AE';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 5, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(cx, cy, 5, 10, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'ring') {
      // Rainbow Boost Launch Ring ⭕
      ctx.shadowColor = '#FF80AB';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3.5;
      const rGrad = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
      rGrad.addColorStop(0, '#FF80AB');
      rGrad.addColorStop(0.5, '#FFE082');
      rGrad.addColorStop(1, '#80DEEA');
      ctx.strokeStyle = rGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 20, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFF9C4';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▲ BOOST ▲', cx, cy + 3);
    }

    ctx.restore();
  }
}
