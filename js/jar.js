/**
 * jar.js
 * High-performance HTML5 Canvas physics engine for rendering origami stars
 * inside the glass activity jar with realistic dropping, stacking, and stationary resting physics.
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
    this.isSimulating = false;
    this.dpr = window.devicePixelRatio || 1;

    this.initCanvasDimensions();
    this.loadImages();

    // Re-init after short delay to catch correct mobile dimensions
    // (iOS Safari may report 0 on first paint)
    setTimeout(() => this.initCanvasDimensions(), 200);
    setTimeout(() => this.initCanvasDimensions(), 600);

    window.addEventListener('resize', () => {
      this.initCanvasDimensions();
      this.repositionStationaryStars();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.initCanvasDimensions();
        this.repositionStationaryStars();
      }, 300);
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

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
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

  getStarRadius(count = this.stars.length) {
    const baseDim = Math.min(this.width * 0.068, this.height * 0.055);
    let scale = 1.0;
    if (count > 40) scale = 0.72;
    else if (count > 28) scale = 0.78;
    else if (count > 18) scale = 0.86;
    else if (count > 10) scale = 0.94;

    return Math.max(13, Math.min(22, baseDim * scale));
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

  getJarBoundariesAtY(y, starRadius) {
    const { bodyLeft, bodyRight, bodyTop, bodyBottom, neckLeft, neckRight, neckTop, neckBottom } = this.jarBounds;

    let minX, maxX;
    if (y <= neckBottom) {
      minX = neckLeft + starRadius;
      maxX = neckRight - starRadius;
    } else if (y < bodyTop + 40) {
      // Curved shoulder transition
      const t = (y - neckBottom) / (bodyTop + 40 - neckBottom);
      const ease = t * t * (3 - 2 * t);
      const left = neckLeft + (bodyLeft - neckLeft) * ease;
      const right = neckRight + (bodyRight - neckRight) * ease;
      minX = left + starRadius;
      maxX = right - starRadius;
    } else if (y <= bodyBottom - 30) {
      // Main jar body
      minX = bodyLeft + starRadius;
      maxX = bodyRight - starRadius;
    } else {
      // Rounded bottom corners
      const t = Math.min(1, Math.max(0, (y - (bodyBottom - 30)) / 30));
      const inset = (1 - Math.sqrt(Math.max(0, 1 - t * t))) * 32;
      minX = bodyLeft + inset + starRadius;
      maxX = bodyRight - inset - starRadius;
    }

    if (minX > maxX) {
      const mid = (minX + maxX) / 2;
      minX = mid - 1;
      maxX = mid + 1;
    }

    const maxY = bodyBottom - starRadius;
    const minY = neckTop - 20;

    return { minX, maxX, minY, maxY };
  }

  calculateStationaryPositions(count) {
    const radius = this.getStarRadius(count);
    const positions = [];
    const { bodyLeft, bodyRight, bodyBottom } = this.jarBounds;
    const availableWidth = (bodyRight - bodyLeft) - 2 * radius - 16;
    const colSpacing = radius * 1.85;
    const cols = Math.max(4, Math.floor(availableWidth / colSpacing));
    const rowSpacing = radius * 1.55;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const rowOffset = (row % 2 === 1) ? (radius * 0.9) : 0;
      const hash = (i * 9301 + 49297) % 233280;
      const jitterX = ((hash % 11) - 5) * 0.8;
      const jitterY = (((hash >> 4) % 9) - 4) * 0.6;
      const jitterAngle = ((hash % 100) / 100) * Math.PI * 2;

      const rawX = bodyLeft + radius + 12 + rowOffset + col * colSpacing + jitterX;
      const rawY = bodyBottom - radius - 8 - row * rowSpacing + jitterY;

      const bounds = this.getJarBoundariesAtY(rawY, radius);
      const clampedX = Math.max(bounds.minX + 2, Math.min(rawX, bounds.maxX - 2));
      const clampedY = Math.min(rawY, bounds.maxY - 2);

      positions.push({
        x: clampedX,
        y: clampedY,
        angle: jitterAngle,
        radius: radius
      });
    }

    return positions;
  }

  syncStarsWithActivities(activities) {
    const currentActivityIds = new Set(activities.map(a => a.id));
    this.stars = this.stars.filter(s => currentActivityIds.has(s.activityId));

    const existingMap = new Map(this.stars.map(s => [s.activityId, s]));
    const targetRadius = this.getStarRadius(activities.length);
    const stationaryPositions = this.calculateStationaryPositions(activities.length);

    const newStarsList = [];
    activities.forEach((act, index) => {
      const pos = stationaryPositions[index] || {
        x: this.width / 2,
        y: this.jarBounds.bodyBottom - targetRadius - 10,
        angle: 0,
        radius: targetRadius
      };

      if (existingMap.has(act.id)) {
        const s = existingMap.get(act.id);
        s.radius = targetRadius;
        if (!this.isSimulating) {
          s.x = pos.x;
          s.y = pos.y;
          s.angle = pos.angle;
          s.vx = 0;
          s.vy = 0;
          s.vAngle = 0;
          s.isSleeping = true;
        }
        newStarsList.push(s);
      } else {
        const imageName = act.color || this.getRandomImageForType(act.type);
        const star = {
          id: 'star-p-' + Math.random().toString(36).substr(2, 9),
          activityId: act.id,
          activity: act,
          imageName: imageName,
          x: pos.x,
          y: pos.y,
          vx: 0,
          vy: 0,
          radius: targetRadius,
          angle: pos.angle,
          vAngle: 0,
          isSleeping: true,
          isGlow: false
        };
        newStarsList.push(star);
      }
    });

    this.stars = newStarsList;
    if (!this.isShaking) {
      this.isSimulating = false;
    }
  }

  repositionStationaryStars() {
    if (this.isSimulating || this.isShaking) return;
    const stationaryPositions = this.calculateStationaryPositions(this.stars.length);
    this.stars.forEach((star, index) => {
      const pos = stationaryPositions[index];
      if (pos) {
        star.x = pos.x;
        star.y = pos.y;
        star.radius = pos.radius;
        star.angle = pos.angle;
        star.vx = 0;
        star.vy = 0;
        star.vAngle = 0;
        star.isSleeping = true;
      }
    });
  }

  spawnStar(activity, isNewDrop = true) {
    const currentCount = this.stars.length + 1;
    const targetRadius = this.getStarRadius(currentCount);
    const imageName = activity.color || this.getRandomImageForType(activity.type);

    let star;
    if (isNewDrop) {
      const startX = this.width / 2 + (Math.random() - 0.5) * 20;
      const startY = this.jarBounds.neckTop - 15;
      star = {
        id: 'star-p-' + Math.random().toString(36).substr(2, 9),
        activityId: activity.id,
        activity: activity,
        imageName: imageName,
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 4.5 + Math.random() * 1.5,
        radius: targetRadius,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.1,
        isSleeping: false,
        isGlow: true
      };
      this.stars.push(star);
      // Wake up stars so the incoming star settles naturally into the stack
      this.stars.forEach(s => {
        s.isSleeping = false;
        s.radius = targetRadius;
      });
      this.isSimulating = true;
    } else {
      const posIndex = this.stars.length;
      const stationaryPositions = this.calculateStationaryPositions(currentCount);
      const pos = stationaryPositions[posIndex] || {
        x: this.width / 2,
        y: this.jarBounds.bodyBottom - targetRadius - 10,
        angle: 0,
        radius: targetRadius
      };
      star = {
        id: 'star-p-' + Math.random().toString(36).substr(2, 9),
        activityId: activity.id,
        activity: activity,
        imageName: imageName,
        x: pos.x,
        y: pos.y,
        vx: 0,
        vy: 0,
        radius: targetRadius,
        angle: pos.angle,
        vAngle: 0,
        isSleeping: true,
        isGlow: false
      };
      this.stars.push(star);
    }
  }

  shake(durationMs = 1200) {
    this.isShaking = true;
    this.isSimulating = true;
    this.shakeIntensity = 1.0;

    // Wake up all stars and apply upward chaotic impulses
    this.stars.forEach(star => {
      star.isSleeping = false;
      star.vy -= 9 + Math.random() * 10;
      star.vx += (Math.random() - 0.5) * 12;
      star.vAngle = (Math.random() - 0.5) * 0.25;
    });

    const startTime = performance.now();
    const decay = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < durationMs) {
        this.shakeIntensity = 1.0 - (elapsed / durationMs);
        this.stars.forEach(star => {
          star.vx += (Math.random() - 0.5) * 2.2 * this.shakeIntensity;
          star.vy += (Math.random() - 0.5) * 2.2 * this.shakeIntensity;
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
    if (!this.isSimulating) return;

    const gravity = 0.38;
    const airDamping = 0.94;
    let allResting = !this.isShaking;

    // Step 1: Integrate active stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      if (s.isSleeping) continue;

      s.vy += gravity;
      s.vx *= airDamping;
      s.vy *= airDamping;
      s.vAngle *= 0.92;

      s.x += s.vx;
      s.y += s.vy;
      s.angle += s.vAngle;

      if (Math.hypot(s.vx, s.vy) > 0.15 || Math.abs(s.vAngle) > 0.005) {
        allResting = false;
      }
    }

    // Step 2: Multi-pass Position-Based Dynamics (PBD) Constraint Solver
    const SUB_STEPS = 6;
    for (let step = 0; step < SUB_STEPS; step++) {
      // Star-to-star distance constraints
      for (let i = 0; i < this.stars.length; i++) {
        const s1 = this.stars[i];
        for (let j = i + 1; j < this.stars.length; j++) {
          const s2 = this.stars[j];
          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = s1.radius + s2.radius - 2;

          if (dist < minDist && dist > 0.001) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push apart positions directly (relaxation)
            s1.x -= nx * overlap;
            s1.y -= ny * overlap;
            s2.x += nx * overlap;
            s2.y += ny * overlap;

            // Inelastic collision damping & Coulomb tangential friction
            const rvx = s2.vx - s1.vx;
            const rvy = s2.vy - s1.vy;
            const normalVel = rvx * nx + rvy * ny;

            if (normalVel < 0) {
              const impulse = normalVel * 0.35;
              s1.vx += impulse * nx;
              s1.vy += impulse * ny;
              s2.vx -= impulse * nx;
              s2.vy -= impulse * ny;

              const tx = -ny;
              const ty = nx;
              const tangVel = rvx * tx + rvy * ty;
              const friction = tangVel * 0.3;
              s1.vx += friction * tx;
              s1.vy += friction * ty;
              s2.vx -= friction * tx;
              s2.vy -= friction * ty;
            }

            // Wake up neighbor if sleeping
            if (!s1.isSleeping && s2.isSleeping) s2.isSleeping = false;
            if (!s2.isSleeping && s1.isSleeping) s1.isSleeping = false;
          }
        }
      }

      // Jar geometry containment constraints
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        const bounds = this.getJarBoundariesAtY(s.y, s.radius);

        // Floor collision
        if (s.y > bounds.maxY) {
          s.y = bounds.maxY;
          if (Math.abs(s.vy) < 0.75) {
            s.vy = 0;
          } else {
            s.vy = -s.vy * 0.2;
          }
          s.vx *= 0.75;
          s.vAngle *= 0.8;
        }

        // Left / Right wall collisions
        if (s.x < bounds.minX) {
          s.x = bounds.minX;
          if (Math.abs(s.vx) < 0.5) {
            s.vx = 0;
          } else {
            s.vx = -s.vx * 0.2;
          }
          s.vy *= 0.85;
        } else if (s.x > bounds.maxX) {
          s.x = bounds.maxX;
          if (Math.abs(s.vx) < 0.5) {
            s.vx = 0;
          } else {
            s.vx = -s.vx * 0.2;
          }
          s.vy *= 0.85;
        }
      }
    }

    // Step 3: Sleep / Settling check
    if (!this.isShaking) {
      let activeCount = 0;
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        const speed = Math.hypot(s.vx, s.vy);
        if (speed < 0.15 && Math.abs(s.vAngle) < 0.006) {
          s.vx = 0;
          s.vy = 0;
          s.vAngle = 0;
          s.isSleeping = true;
          s.isGlow = false;
        } else {
          activeCount++;
        }
      }
      if (activeCount === 0) {
        this.isSimulating = false;
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
