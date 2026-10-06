/**
 * Cozy Cloud Companions & Mini-Missions
 * Characters: Pip the Barista Duck 🦆, Mocha the Scholar Pigeon 🐦, Mochi the Boba Bunny 🐰
 */

export class CloudCompanion {
  constructor(x, y, type = 'duck') {
    this.x = x;
    this.y = y;
    this.type = type; // 'duck', 'pigeon', 'bunny'
    this.width = 30;
    this.height = 30;
    this.animTimer = Math.random() * Math.PI * 2;
    this.hasTriggered = false;
    this.heartTimer = 0;

    // Associated mission
    this.mission = this.generateMission();
  }

  generateMission() {
    const list = [
      {
        id: 'beans',
        title: '☕ Bean Rush!',
        desc: 'Collect 4 coffee beans!',
        target: 4,
        current: 0,
        timeLimit: 18 * 60, // 18 seconds
        timeLeft: 18 * 60
      },
      {
        id: 'combo',
        title: '★ Cloud Acrobat!',
        desc: 'Pull off a 5x Combo!',
        target: 5,
        current: 0,
        timeLimit: 15 * 60,
        timeLeft: 15 * 60
      },
      {
        id: 'climb',
        title: '🚀 Sky Climber!',
        desc: 'Climb 250m higher!',
        target: 250,
        startAltitude: 0,
        timeLimit: 20 * 60,
        timeLeft: 20 * 60
      }
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  update(player, onMeet) {
    this.animTimer += 0.08;
    if (this.heartTimer > 0) this.heartTimer--;

    if (!this.hasTriggered && player) {
      const dist = Math.hypot(
        (player.x + 17) - (this.x + 15),
        (player.y + 17) - (this.y + 15)
      );
      if (dist < 45) {
        this.hasTriggered = true;
        this.heartTimer = 120; // 2 seconds heart emote
        if (onMeet) onMeet(this);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    const bob = Math.sin(this.animTimer * 2) * 2;
    const cx = Math.floor(this.x + this.width / 2);
    const cy = Math.floor(this.y + this.height / 2 + bob);

    ctx.translate(cx, cy);

    if (this.type === 'duck') {
      // --- Pip the Barista Duck ---
      // Yellow round body
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Duck Head
      ctx.beginPath();
      ctx.arc(4, -8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.moveTo(9, -8);
      ctx.lineTo(16, -6);
      ctx.lineTo(9, -4);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#261C3D';
      ctx.fillRect(5, -10, 2.5, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(5, -10, 1, 1);

      // Green Barista Apron
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.roundRect(-5, -2, 10, 12, 3);
      ctx.fill();

      // Tiny Coffee Cup in wing
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-9, 1, 6, 7);
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(-8, 2, 4, 3);

    } else if (this.type === 'pigeon') {
      // --- Mocha the Pigeon ---
      // Soft grey body
      ctx.fillStyle = '#90A4AE';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#78909C';
      ctx.beginPath();
      ctx.arc(6, -7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = '#FFE082';
      ctx.beginPath();
      ctx.moveTo(11, -7);
      ctx.lineTo(15, -6);
      ctx.lineTo(11, -5);
      ctx.fill();

      // Tiny round glasses
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(8, -8, 3, 0, Math.PI * 2);
      ctx.stroke();

      // Red Cozy Scarf
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.roundRect(1, -2, 8, 4, 2);
      ctx.fill();

    } else {
      // --- Mochi the Boba Bunny ---
      // White bunny body
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-3, -13, 3, 7, -0.2, 0, Math.PI * 2);
      ctx.ellipse(4, -13, 3, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF80AB';
      ctx.beginPath();
      ctx.ellipse(-3, -13, 1.5, 4.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(4, -13, 1.5, 4.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#261C3D';
      ctx.fillRect(2, -2, 2.5, 3);
      // Cheeks
      ctx.fillStyle = 'rgba(255, 128, 171, 0.7)';
      ctx.beginPath();
      ctx.arc(4, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Boba Cup
      ctx.fillStyle = '#80DEEA';
      ctx.fillRect(-8, -1, 5, 8);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(-7, 4, 3, 2);
    }

    // Heart / Exclamation Emote above head
    if (this.heartTimer > 0) {
      ctx.fillStyle = '#FF4081';
      ctx.shadowColor = '#FF80AB';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const hx = 0;
      const hy = -26;
      ctx.arc(hx - 3, hy, 3.5, 0, Math.PI * 2);
      ctx.arc(hx + 3, hy, 3.5, 0, Math.PI * 2);
      ctx.moveTo(hx - 6, hy + 2);
      ctx.lineTo(hx, hy + 8);
      ctx.lineTo(hx + 6, hy + 2);
      ctx.fill();
    } else if (!this.hasTriggered) {
      // Glowing "!"
      ctx.fillStyle = '#FFE082';
      ctx.shadowColor = '#FFE082';
      ctx.shadowBlur = 6;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -22);
    }

    ctx.restore();
  }
}
