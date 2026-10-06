import { GameEngine } from './game/engine.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const trackBtn = document.getElementById('trackBtn');
  const ambianceBtn = document.getElementById('ambianceBtn');
  const muteBtn = document.getElementById('muteBtn');
  const wardrobeBtn = document.getElementById('wardrobeBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const toast = document.getElementById('toast');

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }

  const engine = new GameEngine(canvas);

  // Track Selector
  trackBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    engine.audio.resume();
    const trackName = engine.audio.cycleTrack();
    trackBtn.innerHTML = `🎵 <span>${trackName}</span>`;
    showToast(`Track: ${trackName} ♫`);
  });

  // Ambiance / Weather Settings Modal
  ambianceBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    engine.audio.resume();
    engine.state = engine.state === 'ambiance' ? 'playing' : 'ambiance';
  });

  // Mute Toggle
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    engine.audio.resume();
    const isMuted = engine.audio.toggleMute();
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    showToast(isMuted ? 'Sound Muted' : 'Sound Unmuted ♫');
  });

  // Wardrobe / Hats Modal
  wardrobeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    engine.audio.resume();
    engine.state = engine.state === 'wardrobe' ? 'playing' : 'wardrobe';
  });

  // Fullscreen Toggle
  fullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      fullscreenBtn.textContent = '⛶ Exit';
    } else {
      document.exitFullscreen().catch(() => {});
      fullscreenBtn.textContent = '⛶ Fullscreen';
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenBtn.textContent = '⛶ Exit';
    } else {
      fullscreenBtn.textContent = '⛶ Fullscreen';
    }
    engine.handleResize();
  });

  // Handle clicks inside modals (Wardrobe & Ambiance)
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (engine.state === 'wardrobe') {
      const mw = 480;
      const mh = 340;
      const mx = (engine.width - mw) / 2;
      const my = (engine.height - mh) / 2;

      const hats = ['strawberry', 'wizard', 'detective', 'crown', 'halo', 'sakura'];

      hats.forEach((h, i) => {
        const hx = mx + 45 + (i % 3) * 135;
        const hy = my + 100 + Math.floor(i / 3) * 80;
        if (clickX >= hx && clickX <= hx + 120 && clickY >= hy && clickY <= hy + 60) {
          engine.player.setHat(h);
          showToast(`Equipped ${h.toUpperCase()} Hat! ✨`);
        }
      });

      const btnY = my + mh - 55;
      if (clickX >= mx + 60 && clickX <= mx + mw - 60 && clickY >= btnY && clickY <= btnY + 38) {
        engine.state = 'playing';
      }
    } else if (engine.state === 'ambiance') {
      const mw = 480;
      const mh = 360;
      const mx = (engine.width - mw) / 2;
      const my = (engine.height - mh) / 2;

      const presets = ['dynamic', 'midnight', 'sunset', 'aurora', 'cafe'];
      presets.forEach((p, i) => {
        const px = mx + 30 + (i % 2) * 215;
        const py = my + 100 + Math.floor(i / 2) * 55;
        if (clickX >= px && clickX <= px + 200 && clickY >= py && clickY <= py + 44) {
          engine.bg.setAtmosphere(p);
          showToast(`Atmosphere: ${p.toUpperCase()} ✨`);
        }
      });

      const btnY = my + mh - 55;
      if (clickX >= mx + 60 && clickX <= mx + mw - 60 && clickY >= btnY && clickY <= btnY + 38) {
        engine.state = 'playing';
      }
    }
  });

  // Animation Loop
  function loop() {
    engine.update();
    engine.draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});
