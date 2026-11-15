/**
 * ============================================================================
 * AROHI & ZEBRA ❤️ (15th November)
 * 3D Background, Web Audio Synthesizer, 3D Book Logic & Celebration Engine
 * ============================================================================
 */

(function () {
  'use strict';

  // --- DOM Elements ---
  const bgCanvas = document.getElementById('bg-canvas');
  const bgCtx = bgCanvas.getContext('2d');

  const fireworksCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fireworksCanvas.getContext('2d');

  const bookWrapper = document.getElementById('book-wrapper');
  const royalBook = document.getElementById('royal-book');
  const coverPage = document.getElementById('cover-page');
  const openBtn = document.getElementById('open-btn');
  const pagesDeck = document.getElementById('pages-deck');
  const pageSheets = Array.from(document.querySelectorAll('.page-sheet'));

  const bookControls = document.getElementById('book-controls');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const dotsContainer = document.getElementById('dots-container');

  const celebrateBtn = document.getElementById('celebrate-btn');
  const celebrationMsg = document.getElementById('celebration-msg');
  const restartHint = document.getElementById('restart-book-hint');

  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const musicText = document.getElementById('music-text');
  const cursorTrail = document.getElementById('cursor-trail');

  // --- State Variables ---
  let isBookOpen = false;
  let currentPage = 1;
  const totalPages = pageSheets.length;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // ==========================================================================
  // 1. DYNAMIC SCREEN SIZING
  // ==========================================================================
  function resizeCanvases() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvases);
  resizeCanvases();

  // ==========================================================================
  // 2. 3D FLOATING RED HEARTS & STARDUST BACKGROUND ENGINE
  // ==========================================================================
  const HEART_COUNT = 50;
  const STAR_COUNT = 70;
  const hearts = [];
  const stars = [];

  class Heart3D {
    constructor() {
      this.reset(true);
    }

    reset(init = false) {
      this.x = (Math.random() - 0.5) * window.innerWidth * 1.5;
      this.y = init ? (Math.random() - 0.5) * window.innerHeight * 1.5 : window.innerHeight / 2 + 150;
      this.z = Math.random() * 800 + 100;
      this.baseSize = Math.random() * 20 + 14;
      this.speedY = Math.random() * 0.95 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.rot = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.opacity = Math.random() * 0.55 + 0.35;
      this.hue = Math.random() > 0.3 ? 348 : 340;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + (mouseX - window.innerWidth / 2) * 0.0003;
      this.rot += this.rotSpeed;

      if (this.y < -window.innerHeight / 2 - 100) {
        this.reset(false);
      }
    }

    draw(ctx) {
      const fov = 450;
      const scale = fov / (fov + this.z);
      const projX = window.innerWidth / 2 + this.x * scale;
      const projY = window.innerHeight / 2 + this.y * scale;
      const projSize = this.baseSize * scale;

      if (projX < -50 || projX > window.innerWidth + 50 || projY < -50 || projY > window.innerHeight + 50) return;

      ctx.save();
      ctx.translate(projX, projY);
      ctx.rotate(this.rot);
      ctx.scale(projSize / 20, projSize / 20);
      ctx.globalAlpha = this.opacity * (scale * 1.2);

      // SVG Heart Path
      ctx.fillStyle = `hsl(${this.hue}, 88%, ${45 + scale * 15}%)`;
      ctx.shadowColor = 'rgba(230, 28, 71, 0.65)';
      ctx.shadowBlur = 14 * scale;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-12, -14, -24, 4, 0, 22);
      ctx.bezierCurveTo(24, 4, 12, -14, 0, 0);
      ctx.fill();

      ctx.restore();
    }
  }

  class StarParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.size = Math.random() * 2 + 0.8;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.03 + 0.015;
    }
    update() {
      this.twinkle += this.twinkleSpeed;
    }
    draw(ctx) {
      const alpha = 0.3 + Math.sin(this.twinkle) * 0.3;
      ctx.fillStyle = `rgba(255, 235, 175, ${Math.max(0, alpha)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < HEART_COUNT; i++) hearts.push(new Heart3D());
  for (let i = 0; i < STAR_COUNT; i++) stars.push(new StarParticle());

  function renderBackground() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw(bgCtx);
    }

    for (let i = 0; i < hearts.length; i++) {
      hearts[i].update();
      hearts[i].draw(bgCtx);
    }

    requestAnimationFrame(renderBackground);
  }
  renderBackground();

  // ==========================================================================
  // 3. 3D PARALLAX TILT LOGIC FOR THE BOOK
  // ==========================================================================
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const normX = (mouseX / window.innerWidth) - 0.5;
    const normY = (mouseY / window.innerHeight) - 0.5;

    targetTiltY = normX * 14;
    targetTiltX = -normY * 12;

    spawnSparkle(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mouseX = touch.clientX;
      mouseY = touch.clientY;

      const normX = (mouseX / window.innerWidth) - 0.5;
      const normY = (mouseY / window.innerHeight) - 0.5;

      targetTiltY = normX * 12;
      targetTiltX = -normY * 10;
      spawnSparkle(touch.clientX, touch.clientY);
    }
  }, { passive: true });

  function updateTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;

    if (bookWrapper) {
      bookWrapper.style.transform = `rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
    }
    requestAnimationFrame(updateTilt);
  }
  updateTilt();

  // Floating sparkle cursor trail
  let lastSparkleTime = 0;
  function spawnSparkle(x, y) {
    const now = Date.now();
    if (now - lastSparkleTime < 50) return;
    lastSparkleTime = now;

    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle-particle';
    const symbols = ['❤️', '✨', '💖', '⭐', '🌸', '🦓', '🐼'];
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.fontSize = `${Math.random() * 12 + 10}px`;

    cursorTrail.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 900);
  }

  // ==========================================================================
  // 4. WEB AUDIO SYNTHESIZER (Pianistic Chords & Page Flip Sound Effects)
  // ==========================================================================
  let audioCtx = null;
  let isMusicPlaying = false;
  let musicInterval = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Romantic chord progressions: Cmaj9, Amin9, Fmaj7, G7sus4
  const chordProgressions = [
    [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
    [220.00, 261.63, 329.63, 392.00, 493.88], // Amin9
    [174.61, 261.63, 329.63, 349.23, 440.00], // Fmaj7
    [196.00, 293.66, 392.00, 440.00, 523.25]  // G9
  ];
  let currentChordIndex = 0;

  function playHarpNote(freq, delaySec = 0) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delaySec);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, audioCtx.currentTime + delaySec);

    const startTime = audioCtx.currentTime + delaySec;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + 2.6);
  }

  function playArpeggioChord() {
    const chord = chordProgressions[currentChordIndex];
    currentChordIndex = (currentChordIndex + 1) % chordProgressions.length;

    chord.forEach((freq, i) => {
      playHarpNote(freq, i * 0.32);
    });
  }

  function toggleMusic() {
    initAudio();
    if (!isMusicPlaying) {
      isMusicPlaying = true;
      musicToggle.classList.add('playing');
      musicIcon.textContent = '🎶';
      musicText.textContent = 'Melody: Playing';
      playArpeggioChord();
      musicInterval = setInterval(playArpeggioChord, 3800);
    } else {
      isMusicPlaying = false;
      musicToggle.classList.remove('playing');
      musicIcon.textContent = '🎵';
      musicText.textContent = 'Melody: Off';
      clearInterval(musicInterval);
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // Sound Effect: Page Flip
  function playPageFlipSound() {
    if (!audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.14;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.8, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Audio fallback
    }
  }

  // Sound Effect: Magical Chime for Book Open & Celebration
  function playMagicalChime() {
    if (!audioCtx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      playHarpNote(freq, idx * 0.12);
    });
  }

  // ==========================================================================
  // 5. 3D BOOK INTERACTION & PAGE NAVIGATION
  // ==========================================================================
  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === currentPage ? 'active' : ''}`;
      dot.title = `Go to Chapter ${i}`;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToPage(i);
      });
      dotsContainer.appendChild(dot);
    }
  }
  buildDots();

  function updatePageDisplay() {
    pageSheets.forEach((sheet, idx) => {
      const sheetPage = idx + 1;
      sheet.classList.remove('active', 'flipped-prev');

      if (sheetPage === currentPage) {
        sheet.classList.add('active');
      } else if (sheetPage < currentPage) {
        sheet.classList.add('flipped-prev');
      }
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === currentPage);
    });

    prevBtn.disabled = currentPage === 1;
    prevBtn.style.opacity = currentPage === 1 ? '0.45' : '1';

    if (currentPage === totalPages) {
      nextBtn.style.opacity = '0.5';
    } else {
      nextBtn.style.opacity = '1';
    }
  }

  function goToPage(target) {
    if (target < 1 || target > totalPages) return;
    if (target !== currentPage) {
      playPageFlipSound();
      currentPage = target;
      updatePageDisplay();
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }

  function openBook() {
    if (isBookOpen) return;
    initAudio();
    isBookOpen = true;
    royalBook.classList.add('is-open');
    bookControls.classList.add('visible');
    playMagicalChime();

    if (!isMusicPlaying) {
      toggleMusic();
    }

    currentPage = 1;
    updatePageDisplay();
  }

  function closeBook() {
    isBookOpen = false;
    royalBook.classList.remove('is-open');
    bookControls.classList.remove('visible');
    playMagicalChime();
    celebrationMsg.classList.remove('show');
  }

  coverPage.addEventListener('click', openBook);
  openBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openBook();
  });

  pageSheets.forEach((sheet) => {
    sheet.addEventListener('click', (e) => {
      if (e.target.closest('#celebrate-btn') || e.target.closest('#restart-book-hint')) {
        return;
      }
      if (currentPage < totalPages) {
        nextPage();
      }
    });
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prevPage();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextPage();
  });

  restartHint.addEventListener('click', (e) => {
    e.stopPropagation();
    closeBook();
  });

  window.addEventListener('keydown', (e) => {
    if (!isBookOpen) {
      if (e.key === ' ' || e.key === 'Enter') openBook();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      nextPage();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevPage();
    } else if (e.key === 'Escape') {
      closeBook();
    }
  });

  // ==========================================================================
  // 6. FINALE CELEBRATION EXPLOSION
  // ==========================================================================
  const activeParticles = [];

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 4;
      this.gravity = 0.22;
      this.friction = 0.96;
      this.size = Math.random() * 8 + 6;
      this.color = ['#ffd700', '#ff2a5f', '#ffffff', '#ff6699', '#ffb3c6', '#d4af37'][Math.floor(Math.random() * 6)];
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 15;
      this.opacity = 1;
      this.isHeart = Math.random() > 0.4;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.opacity -= 0.012;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.isHeart) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-6, -7, -12, 2, 0, 11);
        ctx.bezierCurveTo(12, 2, 6, -7, 0, 0);
        ctx.fill();
      } else {
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      }
      ctx.restore();
    }
  }

  function launchCelebration() {
    celebrationMsg.classList.add('show');
    initAudio();
    playMagicalChime();

    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.6;

    for (let i = 0; i < 200; i++) {
      activeParticles.push(new ConfettiParticle(originX, originY));
    }

    setTimeout(() => {
      for (let i = 0; i < 90; i++) {
        activeParticles.push(new ConfettiParticle(window.innerWidth * 0.25, window.innerHeight * 0.45));
      }
    }, 300);

    setTimeout(() => {
      for (let i = 0; i < 90; i++) {
        activeParticles.push(new ConfettiParticle(window.innerWidth * 0.75, window.innerHeight * 0.45));
      }
    }, 600);
  }

  celebrateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    launchCelebration();
  });

  function renderFireworks() {
    fwCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    for (let i = activeParticles.length - 1; i >= 0; i--) {
      const p = activeParticles[i];
      p.update();
      p.draw(fwCtx);
      if (p.opacity <= 0) {
        activeParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(renderFireworks);
  }
  renderFireworks();

})();
