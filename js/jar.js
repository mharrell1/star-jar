/**
 * jar.js
 * High-performance HTML5 Canvas physics engine for rendering origami stars
 * inside the glass activity jar with realistic dropping, stacking, and shaking animations.
 */

const STAR_ASSETS = {
  creative: ['star_pink.png', 'star_red.png'],
  productive: ['star_blue.png', 'star_teal.png'],
  fun: ['star_yellow.png', 'star_green.png'],
  both: ['star_purple.png', 'star_lavender.png', 'star_white.png']
};

export class JarEngine {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.images = {};
    this.isShaking = false;
    this.shakeIntensity = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.initCanvasDimensions();
    this.loadImages();

    // Re-init after short delay to catch correct mobile dimensions
    // (iOS Safari may report 0 on first paint)
    setTimeout(() => this.initCanvasDimensions(), 200);
    setTimeout(() => this.initCanvasDimensions(), 600);

    window.addEventListener('resize', () => this.initCanvasDimensions());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.initCanvasDimensions(), 300);
    });
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvasDimensions() {
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();

    let w = rect.width;
    let h = rect.height;

    if (!w || w < 10) {
      w = parseFloat(getComputedStyle(parent).width) || 320;
    }
    if (!h || h < 10) {
      h = parseFloat(getComputedStyle(parent).height) || 400;
    }

    this.width = w;
    this.height = h;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    this.jarBounds = {
      neckTop: 45,
      neckBottom: 85,
      neckLeft: this.width * 0.28,
      neckRight: this.width * 0.72,
      bodyTop: 95,
      bodyBottom: this.height - 40,
      bodyLeft: this.width * 0.12,
      bodyRight: this.width * 0.88,
      radius: this.width * 0.38
    };
  }

  loadImages() {
    const allFiles = [
      'star_blue.png', 'star_pink.png', 'star_purple.png',
      'star_red.png', 'star_teal.png', 'star_green.png',
      'star_yellow.png', 'star_lavender.png', 'star_white.png'
    ];

    let loadedCount = 0;
    allFiles.forEach(filename => {
      const img = new Image();
      img.src = `assets/stars/${filename}`;
      img.onload = () => {
        this.images[filename] = img;
        loadedCount++;
        if (loadedCount === allFiles.length && this.onAssetsLoaded) {
          this.onAssetsLoaded();
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load asset: ${filename}`);
      };
    });
  }

  getRandomImageForType(type) {
    const list = STAR_ASSETS[type] || STAR_ASSETS['both'];
    return list[Math.floor(Math.random() * list.length)];
  }

  syncStarsWithActivities(activities) {
    // Keep existing matching stars or spawn new ones
    const currentActivityIds = new Set(activities.map(a => a.id));
    this.stars = this.stars.filter(s => currentActivityIds.has(s.activityId));

    const existingIds = new Set(this.stars.map(s => s.activityId));
    activities.forEach((act, index) => {
      if (!existingIds.has(act.id)) {
        this.spawnStar(act, false, index);
      }
    });
  }

  spawnStar(activity, isNewDrop = true, initialIndex = 0) {
    const imageName = activity.color || this.getRandomImageForType(activity.type);
    const starRadius = 22;

    let startX, startY, startVy;
    if (isNewDrop) {
      // Spawn at the jar opening at the top
      startX = this.width / 2 + (Math.random() - 0.5) * 30;
      startY = this.jarBounds.neckTop - 30;
      startVy = 4.5 + Math.random() * 2;
    } else {
      // Settle in bottom stack
      const cols = 5;
      const col = initialIndex % cols;
      const row = Math.floor(initialIndex / cols);
      startX = this.jarBounds.bodyLeft + 35 + col * 40 + (Math.random() - 0.5) * 15;
      startY = this.jarBounds.bodyBottom - 30 - row * 32 - Math.random() * 10;
      startVy = 0;
    }

    const star = {
      id: 'star-p-' + Math.random().toString(36).substr(2, 9),
      activityId: activity.id,
      activity: activity,
      imageName: imageName,
      x: Math.max(this.jarBounds.bodyLeft + starRadius, Math.min(startX, this.jarBounds.bodyRight - starRadius)),
      y: startY,
      vx: (Math.random() - 0.5) * 2,
      vy: startVy,
      radius: starRadius,
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.08,
      isGlow: isNewDrop
    };

    this.stars.push(star);
  }

  shake(durationMs = 1200) {
    this.isShaking = true;
    this.shakeIntensity = 1.0;

    // Apply sudden chaotic impulses to all stars
    this.stars.forEach(star => {
      star.vy -= 10 + Math.random() * 12;
      star.vx += (Math.random() - 0.5) * 14;
      star.vAngle = (Math.random() - 0.5) * 0.3;
    });

    const startTime = performance.now();
    const decay = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < durationMs) {
        this.shakeIntensity = 1.0 - (elapsed / durationMs);
        // Add random turbulence during shake
        this.stars.forEach(star => {
          star.vx += (Math.random() - 0.5) * 2.5 * this.shakeIntensity;
          star.vy += (Math.random() - 0.5) * 2.5 * this.shakeIntensity;
        });
        requestAnimationFrame(decay);
      } else {
        this.isShaking = false;
        this.shakeIntensity = 0;
      }
    };
    requestAnimationFrame(decay);
  }

  updatePhysics() {
    const gravity = 0.42;
    const damping = 0.94;
    const bounce = 0.45;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Gravity & Velocity
      s.vy += gravity;
      s.vx *= damping;
      s.vy *= damping;
      s.x += s.vx;
      s.y += s.vy;
      s.angle += s.vAngle;
      s.vAngle *= 0.97;

      // Jar Boundary Collisions
      // Bottom floor
      if (s.y + s.radius > this.jarBounds.bodyBottom) {
        s.y = this.jarBounds.bodyBottom - s.radius;
        s.vy = -Math.abs(s.vy) * bounce;
        s.vx *= 0.8;
      }

      // Left & Right walls
      if (s.x - s.radius < this.jarBounds.bodyLeft) {
        s.x = this.jarBounds.bodyLeft + s.radius;
        s.vx = Math.abs(s.vx) * bounce;
      } else if (s.x + s.radius > this.jarBounds.bodyRight) {
        s.x = this.jarBounds.bodyRight - s.radius;
        s.vx = -Math.abs(s.vx) * bounce;
      }

      // Star-to-Star Collisions (Soft circle physics)
      for (let j = i + 1; j < this.stars.length; j++) {
        const s2 = this.stars[j];
        const dx = s2.x - s.x;
        const dy = s2.y - s.y;
        const dist = Math.hypot(dx, dy);
        const minDist = s.radius + s2.radius - 4; // Slight overlap for natural paper star stack

        if (dist < minDist && dist > 0.001) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart
          s.x -= nx * overlap;
          s.y -= ny * overlap;
          s2.x += nx * overlap;
          s2.y += ny * overlap;

          // Momentum exchange
          const kx = s.vx - s2.vx;
          const ky = s.vy - s2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          s.vx -= p * nx * 0.5;
          s.vy -= p * ny * 0.5;
          s2.vx += p * nx * 0.5;
          s2.vy += p * ny * 0.5;
        }
      }
    }
  }

  drawJarBackground() {
    const { bodyLeft, bodyRight, bodyTop, bodyBottom, neckLeft, neckRight, neckTop, neckBottom } = this.jarBounds;

    this.ctx.save();

    const grad = this.ctx.createLinearGradient(bodyLeft, bodyTop, bodyRight, bodyBottom);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.06)');

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(neckLeft, neckTop);
    this.ctx.lineTo(neckRight, neckTop);
    this.ctx.lineTo(neckRight, neckBottom);
    this.ctx.bezierCurveTo(neckRight + 20, bodyTop, bodyRight, bodyTop - 10, bodyRight, bodyTop + 40);
    this.ctx.lineTo(bodyRight, bodyBottom - 30);
    this.ctx.quadraticCurveTo(bodyRight, bodyBottom, bodyRight - 40, bodyBottom);
    this.ctx.lineTo(bodyLeft + 40, bodyBottom);
    this.ctx.quadraticCurveTo(bodyLeft, bodyBottom, bodyLeft, bodyBottom - 30);
    this.ctx.lineTo(bodyLeft, bodyTop + 40);
    this.ctx.bezierCurveTo(bodyLeft, bodyTop - 10, neckLeft - 20, bodyTop, neckLeft, neckBottom);
    this.ctx.closePath();
    this.ctx.fill();

    // Cork/Lid Top
    this.ctx.fillStyle = 'rgba(212, 163, 115, 0.85)';
    this.ctx.beginPath();
    this.ctx.roundRect(neckLeft - 6, neckTop - 14, (neckRight - neckLeft) + 12, 18, 5);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(166, 124, 82, 0.9)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawJarGlassOverlay() {
    const { bodyLeft, bodyRight, bodyTop, bodyBottom, neckLeft, neckRight, neckTop, neckBottom } = this.jarBounds;

    this.ctx.save();

    // Outer Glass Rim stroke
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(neckLeft, neckTop);
    this.ctx.lineTo(neckRight, neckTop);
    this.ctx.lineTo(neckRight, neckBottom);
    this.ctx.bezierCurveTo(neckRight + 20, bodyTop, bodyRight, bodyTop - 10, bodyRight, bodyTop + 40);
    this.ctx.lineTo(bodyRight, bodyBottom - 30);
    this.ctx.quadraticCurveTo(bodyRight, bodyBottom, bodyRight - 40, bodyBottom);
    this.ctx.lineTo(bodyLeft + 40, bodyBottom);
    this.ctx.quadraticCurveTo(bodyLeft, bodyBottom, bodyLeft, bodyBottom - 30);
    this.ctx.lineTo(bodyLeft, bodyTop + 40);
    this.ctx.bezierCurveTo(bodyLeft, bodyTop - 10, neckLeft - 20, bodyTop, neckLeft, neckBottom);
    this.ctx.closePath();
    this.ctx.stroke();

    // Glossy reflection stripe on left edge
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(bodyLeft + 12, bodyTop + 55);
    this.ctx.lineTo(bodyLeft + 12, bodyBottom - 45);
    this.ctx.stroke();

    // Smaller curved highlight at the bottom right
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(bodyRight - 15, bodyTop + 70);
    this.ctx.lineTo(bodyRight - 15, bodyBottom - 60);
    this.ctx.stroke();

    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Apply jar shaking offset
    this.ctx.save();
    if (this.isShaking && this.shakeIntensity > 0) {
      const offsetX = (Math.random() - 0.5) * 16 * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * 8 * this.shakeIntensity;
      const rot = (Math.random() - 0.5) * 0.05 * this.shakeIntensity;
      this.ctx.translate(this.width / 2 + offsetX, this.height / 2 + offsetY);
      this.ctx.rotate(rot);
      this.ctx.translate(-this.width / 2, -this.height / 2);
    }

    this.drawJarBackground();
    this.updatePhysics();

    // Render Stars
    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.translate(star.x, star.y);
      this.ctx.rotate(star.angle);

      const img = this.images[star.imageName];
      const size = star.radius * 2;

      if (img && img.complete) {
        // Draw subtle soft shadow underneath star
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetY = 3;
        this.ctx.drawImage(img, -star.radius, -star.radius, size, size);
      } else {
        // Fallback colored diamond/star
        this.ctx.fillStyle = '#ff9ebb';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, star.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    this.drawJarGlassOverlay();
    this.ctx.restore();

    requestAnimationFrame(this.animate);
  }
}
