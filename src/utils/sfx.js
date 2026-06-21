// RPG Retro Web Audio API Sound Synthesizer & Canvas Confetti System

// 1. Particle Confetti Explosion
export const triggerConfetti = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const particles = [];
  const colors = ['#FFD700', '#FF4500', '#FF1493', '#00FF00', '#00FFFF', '#FF00FF', '#7c3aed', '#0284c7'];

  // Spawn particles from different starting points to fill the screen
  const particleCount = 150;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * 50,
      y: height / 2 + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 6,
      radius: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.012 + 0.01,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, width, height);
    let alive = false;

    particles.forEach(p => {
      if (p.alpha > 0) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity force
        p.vx *= 0.98; // wind resistance
        p.alpha -= p.decay;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.radius, -p.radius / 2, p.radius * 2, p.radius);
        ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      window.removeEventListener('resize', handleResize);
      canvas.remove();
    }
  };

  animate();
};

// 2. Synthesize 8-Bit Coin sound (high-pitch double tone)
export const playCoinSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq, time, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };
    
    const now = ctx.currentTime;
    playTone(987.77, now, 0.08); // B5 note
    playTone(1318.51, now + 0.08, 0.25); // E6 note
  } catch (e) {
    console.warn("Web Audio API not allowed or supported yet:", e);
  }
};

// 3. Synthesize Glorious Level Up fanfare (ascending major triad)
export const playLevelUpSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const playTone = (freq, time, duration, type = 'triangle') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };
    
    // C4, E4, G4, C5, E5, G5, C6 (Ascending arpeggio)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const delay = index * 0.08;
      const duration = index === notes.length - 1 ? 0.6 : 0.15;
      const type = index === notes.length - 1 ? 'sawtooth' : 'triangle';
      playTone(freq, now + delay, duration, type);
    });
  } catch (e) {
    console.warn("Audio Context block:", e);
  }
};

// 4. Synthesize Card Draw Shaking sound (quick low-pitch pulses)
export const playGachaShakeSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    for (let i = 0; i < 6; i++) {
      const time = now + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150 + Math.random() * 50, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.1);
    }
  } catch (e) {}
};

// 5. Synthesize Reveal Card sound (chord base chime based on rarity)
export const playGachaRevealSound = (rarity) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    let baseFreq = 523.25; // Common (C5)
    if (rarity === 'Rare') baseFreq = 659.25; // E5
    else if (rarity === 'Epic') baseFreq = 783.99; // G5
    else if (rarity === 'Legendary') baseFreq = 1046.50; // C6
    else if (rarity === 'Mythic') baseFreq = 1318.51; // E6
    
    const harmonics = [1, 1.25, 1.5, 2];
    harmonics.forEach((h, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * h, now + index * 0.04);
      gain.gain.setValueAtTime(0.06, now + index * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.04);
      osc.stop(now + 0.8);
    });
  } catch (e) {}
};
