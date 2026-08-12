// StarJar — Bundled App (Safari & Cross-Platform Compatible)
/**
 * storage.js
 * Manages local storage persistence, activity items, completion history,
 * user authentication state, intelligent cross-device merging, and cloud sync hooks.
 */

const STORAGE_KEYS = {
  ACTIVITIES: 'starjar_activities',
  HISTORY: 'starjar_history',
  USER: 'starjar_user',
  ACCOUNTS: 'starjar_accounts_db',
  LAST_SYNCED: 'starjar_last_synced'
};

// Default sample activities to populate jar if empty
const DEFAULT_ACTIVITIES = [
  {
    id: 'sample-1',
    title: 'Sketch a cozy dream room',
    link: 'https://www.youtube.com/results?search_query=perspective+room+sketching',
    time: 15,
    type: 'creative',
    color: 'star_pink.png',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'sample-2',
    title: 'Declutter and wipe desk space',
    link: '',
    time: 10,
    type: 'productive',
    color: 'star_teal.png',
    createdAt: new Date(Date.now() - 72000000).toISOString()
  },
  {
    id: 'sample-3',
    title: 'Write a quick 50-word micro poem',
    link: 'https://poets.org',
    time: 5,
    type: 'creative',
    color: 'star_yellow.png',
    createdAt: new Date(Date.now() - 50000000).toISOString()
  },
  {
    id: 'sample-4',
    title: 'Organize digital bookmarks and tabs',
    link: '',
    time: 20,
    type: 'productive',
    color: 'star_blue.png',
    createdAt: new Date(Date.now() - 36000000).toISOString()
  },
  {
    id: 'sample-5',
    title: 'Design a whimsical sticker concept',
    link: 'https://pinterest.com',
    time: 30,
    type: 'both',
    color: 'star_purple.png',
    createdAt: new Date(Date.now() - 20000000).toISOString()
  },
  {
    id: 'sample-6',
    title: '10-minute mindfulness stretching routine',
    link: 'https://youtube.com',
    time: 10,
    type: 'both',
    color: 'star_lavender.png',
    createdAt: new Date(Date.now() - 10000000).toISOString()
  }
];

class StorageService {
  constructor() {
    this.syncListeners = [];
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(DEFAULT_ACTIVITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    }
  }

  // Activity Management
  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load activities', e);
      return [];
    }
  }

  saveActivities(activities) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    this.triggerSync();
  }

  addActivity(activity) {
    const activities = this.getActivities();
    activities.push(activity);
    this.saveActivities(activities);
    return activity;
  }

  updateActivity(id, updatedFields) {
    const activities = this.getActivities();
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updatedFields };
      this.saveActivities(activities);
      return activities[index];
    }
    return null;
  }

  removeActivity(id) {
    const activities = this.getActivities().filter(a => a.id !== id);
    this.saveActivities(activities);
    return activities;
  }

  // History & Archive Management
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load history', e);
      return [];
    }
  }

  logCompletion(activity, keptInJar = true) {
    const history = this.getHistory();
    const entry = {
      id: 'hist-' + Date.now(),
      activityId: activity.id,
      title: activity.title,
      type: activity.type,
      timeSpent: activity.time,
      link: activity.link || '',
      keptInJar: keptInJar,
      completedAt: new Date().toISOString()
    };
    history.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    this.triggerSync();
    return entry;
  }

  clearHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    this.triggerSync();
  }

  // Helper to check if activities list is only the initial default sample set
  isDefaultSampleList(list) {
    if (!Array.isArray(list) || list.length === 0) return true;
    if (list.length !== DEFAULT_ACTIVITIES.length) return false;
    return list.every((item, i) => item.id === DEFAULT_ACTIVITIES[i].id);
  }

  // Intelligent Merge Helpers (Preserves local custom stars when logging in)
  mergeActivities(localList, cloudList) {
    if (!cloudList || !Array.isArray(cloudList) || cloudList.length === 0) {
      return localList || [];
    }
    if (!localList || !Array.isArray(localList) || localList.length === 0 || this.isDefaultSampleList(localList)) {
      return cloudList;
    }

    const merged = [...cloudList];
    const cloudTitles = new Set(cloudList.map(a => (a.title || '').trim().toLowerCase()));
    const cloudIds = new Set(cloudList.map(a => a.id));

    for (const localItem of localList) {
      // Don't merge generic sample stars into established cloud account
      if (localItem.id && String(localItem.id).startsWith('sample-')) continue;
      const cleanTitle = (localItem.title || '').trim().toLowerCase();
      if (!cloudTitles.has(cleanTitle) && !cloudIds.has(localItem.id)) {
        merged.push(localItem);
        cloudTitles.add(cleanTitle);
        cloudIds.add(localItem.id);
      }
    }
    return merged;
  }

  mergeHistory(localHist, cloudHist) {
    if (!cloudHist || !Array.isArray(cloudHist) || cloudHist.length === 0) {
      return localHist || [];
    }
    if (!localHist || !Array.isArray(localHist) || localHist.length === 0) {
      return cloudHist;
    }

    const merged = [...cloudHist];
    const seenIds = new Set(cloudHist.map(h => h.id));

    for (const localEntry of localHist) {
      if (!seenIds.has(localEntry.id)) {
        merged.push(localEntry);
        seenIds.add(localEntry.id);
      }
    }
    return merged;
  }

  // User Accounts & Authentication (Local + Cloud API Sync)
  getCurrentUser() {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  getRegisteredAccounts() {
    try {
      const accounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return accounts ? JSON.parse(accounts) : [];
    } catch {
      return [];
    }
  }

  saveLocalAccount(user, password, activities = null, history = null) {
    const accounts = this.getRegisteredAccounts();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const idx = accounts.findIndex(acc => (acc.email || '').toLowerCase() === cleanEmail);
    const accData = {
      id: user.id || 'usr-' + Date.now(),
      email: cleanEmail,
      password: password || (idx !== -1 ? accounts[idx].password : ''),
      name: user.name || cleanEmail.split('@')[0],
      createdAt: user.createdAt || new Date().toISOString(),
      activities: activities || user.activities || this.getActivities(),
      history: history || user.history || this.getHistory()
    };

    if (idx !== -1) {
      accounts[idx] = accData;
    } else {
      accounts.push(accData);
    }
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  async registerUser(email, password, name) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const currentActivities = this.getActivities();
    const currentHistory = this.getHistory();

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        name: cleanName,
        activities: currentActivities,
        history: currentHistory
      })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to create account.');
    }

    const user = data.user;
    this.setCurrentUser({ ...user, password });
    this.saveLocalAccount(user, password, user.activities, user.history);
    this.setLastSynced(Date.now());
    return user;
  }

  async loginUser(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const currentLocalActivities = this.getActivities();
    const currentLocalHistory = this.getHistory();

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    const user = data.user;
    const cloudActivities = user.activities || [];
    const cloudHistory = user.history || [];

    // Intelligently merge any local custom stars with cloud stars
    const mergedActivities = this.mergeActivities(currentLocalActivities, cloudActivities);
    const mergedHistory = this.mergeHistory(currentLocalHistory, cloudHistory);

    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(mergedActivities));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(mergedHistory));
    this.setCurrentUser({ ...user, password });
    this.saveLocalAccount(user, password, mergedActivities, mergedHistory);
    this.setLastSynced(Date.now());

    // If local device had extra custom stars, push merged set to cloud immediately
    if (mergedActivities.length !== cloudActivities.length || mergedHistory.length !== cloudHistory.length) {
      await this.triggerSync();
    }
    return user;
  }

  setCurrentUser(user) {
    const session = {
      id: user.id,
      email: (user.email || '').trim().toLowerCase(),
      name: user.name || (user.email || '').split('@')[0],
      password: user.password,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNCED);
  }

  async triggerSync() {
    const user = this.getCurrentUser();
    if (!user || !user.email) return;

    const activities = this.getActivities();
    const history = this.getHistory();

    this.saveLocalAccount(user, user.password, activities, history);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          activities,
          history
        })
      });
      if (res.ok) {
        this.setLastSynced(Date.now());
      }
    } catch (e) {
      console.warn('Cloud sync background warning:', e);
    }
  }

  // Cross-device automatic sync from cloud
  async syncFromCloud() {
    const user = this.getCurrentUser();
    if (!user || !user.email) return { success: false, reason: 'not_logged_in' };

    try {
      const res = await fetch(`/api/user?email=${encodeURIComponent(user.email)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user data from cloud.');
      }
      const data = await res.json();
      if (data.user) {
        const cloudActivities = data.user.activities || [];
        const cloudHistory = data.user.history || [];

        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(cloudActivities));
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(cloudHistory));
        this.saveLocalAccount(data.user, user.password, cloudActivities, cloudHistory);
        this.setLastSynced(Date.now());
        this.notifySyncListeners();
        return { success: true, activitiesCount: cloudActivities.length, historyCount: cloudHistory.length };
      }
      return { success: false, reason: 'no_user_returned' };
    } catch (err) {
      console.warn('Cloud sync error:', err);
      return { success: false, error: err.message };
    }
  }

  getLastSynced() {
    const ts = localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
    return ts ? parseInt(ts, 10) : null;
  }

  setLastSynced(timestamp) {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, timestamp.toString());
  }

  getLastSyncedText() {
    const ts = this.getLastSynced();
    if (!ts) return 'Active';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'Synced just now';
    if (diff < 60) return `Synced ${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `Synced ${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Synced ${hours}h ago`;
    return `Synced ${new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  addSyncListener(callback) {
    if (typeof callback === 'function') {
      this.syncListeners.push(callback);
    }
  }

  notifySyncListeners() {
    this.syncListeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('Sync listener error:', e); }
    });
  }
}


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

class JarEngine {
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


/**
 * main.js
 * Application controller for StarJar: binds user interactions,
 * coordinates Canvas physics, handles iPhone shake sensor, and manages mobile bottom tabs.
 */




document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements Declaration
  const userAccountLabel = document.getElementById('userAccountLabel');
  const loggedInView = document.getElementById('loggedInView');
  const loggedOutView = document.getElementById('loggedOutView');
  const syncStatusText = document.getElementById('syncStatusText');
  const manualSyncBtn = document.getElementById('manualSyncBtn');
  
  // Desktop Add Form
  const addForm = document.getElementById('addActivityForm');
  const timePresets = document.querySelectorAll('#timePresets .chip');
  const taskTypeBtns = document.querySelectorAll('#taskTypeGroup .type-toggle-btn');
  const taskTimeInput = document.getElementById('taskTime');

  // Mobile Add Bottom Sheet Form
  const mobileAddModal = document.getElementById('mobileAddModalOverlay');
  const mobileAddForm = document.getElementById('mobileAddActivityForm');
  const mobileTimePresets = document.querySelectorAll('#mobileTimePresets .chip');
  const mobileTaskTypeBtns = document.querySelectorAll('#mobileTaskTypeGroup .type-toggle-btn');
  const mobileTaskTimeInput = document.getElementById('mobileTaskTime');
  const closeMobileAddBtn = document.getElementById('closeMobileAddBtn');
  let isMobileAddType = 'creative';

  // Draw Activity Controls
  const drawTimeChips = document.querySelectorAll('#drawTimeChips .chip');
  const drawTypeBtns = document.querySelectorAll('#drawTypeGroup .type-toggle-btn');
  const taskModal = document.getElementById('taskModalOverlay');
  const popupStarImage = document.getElementById('popupStarImage');
  const popupTaskTitle = document.getElementById('popupTaskTitle');
  const popupCategoryBadge = document.getElementById('popupCategoryBadge');
  const popupTimeBadge = document.getElementById('popupTimeBadge');
  const popupTaskLink = document.getElementById('popupTaskLink');
  const resolutionModal = document.getElementById('resolutionModalOverlay');
  
  // Drawers
  const historyDrawer = document.getElementById('historyDrawer');
  const historyOverlay = document.getElementById('historyDrawerOverlay');
  const promptsDrawer = document.getElementById('promptsDrawer');
  const promptsOverlay = document.getElementById('promptsDrawerOverlay');
  const accountDrawer = document.getElementById('accountDrawer');
  const accountOverlay = document.getElementById('accountDrawerOverlay');

  // Bottom Tabs (Mobile)
  const tabJarBtn = document.getElementById('tabJarBtn');
  const tabAddStarBtn = document.getElementById('tabAddStarBtn');
  const tabPromptsBtn = document.getElementById('tabPromptsBtn');
  const tabHistoryBtn = document.getElementById('tabHistoryBtn');
  const tabAccountBtn = document.getElementById('tabAccountBtn');

  // Edit Modal
  const editModalOverlay = document.getElementById('editModalOverlay');
  const editActivityForm = document.getElementById('editActivityForm');
  const editTaskId = document.getElementById('editTaskId');
  const editTaskTitle = document.getElementById('editTaskTitle');
  const editTaskLink = document.getElementById('editTaskLink');
  const editTaskTime = document.getElementById('editTaskTime');
  const editTaskTypeBtns = document.querySelectorAll('#editTaskTypeGroup .type-toggle-btn');
  let editSelectedType = 'creative';

  // Auth Form
  const authForm = document.getElementById('authForm');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
  const nameFieldGroup = document.getElementById('nameFieldGroup');
  const headerAddStarBtn = document.getElementById('headerAddStarBtn');

  const storage = new StorageService();
  const canvas = document.getElementById('jarCanvas');
  const jarEngine = new JarEngine(canvas);

  let currentDrawnActivity = null;
  let isAddType = 'creative';
  let isDrawType = 'any';
  let selectedDrawTime = 30;
  let isSignUpMode = false;
  let shakeCooldown = false;

  // Initialize Jar with saved activities
  function refreshJarAndUI() {
    const activities = storage.getActivities();
    jarEngine.syncStarsWithActivities(activities);
    updateStarCounter();
    renderHistory();
    renderPromptsList();
    updateAccountUI();
  }

  jarEngine.onAssetsLoaded = () => {
    refreshJarAndUI();
  };
  refreshJarAndUI();

  // --------------------------------------------------------------------------
  // UI Helpers & Toasts
  // --------------------------------------------------------------------------
  function triggerHaptic(pattern = [30]) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function updateStarCounter() {
    const count = storage.getActivities().length;
    const badge = document.getElementById('starCountDisplay');
    if (badge) {
      badge.textContent = `${count} ${count === 1 ? 'Star' : 'Stars'}`;
    }
  }

  // --------------------------------------------------------------------------
  // Mobile Bottom Navigation Tabs
  // --------------------------------------------------------------------------
  function setActiveTab(button) {
    document.querySelectorAll('.bottom-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (button) button.classList.add('active');
  }

  if (tabJarBtn) {
    tabJarBtn.addEventListener('click', () => {
      setActiveTab(tabJarBtn);
      closeHistory();
      closePromptsDrawer();
      closeAccountDrawer();
      closeMobileAddModal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (tabAddStarBtn) {
    tabAddStarBtn.addEventListener('click', () => {
      openMobileAddModal();
    });
  }

  if (headerAddStarBtn) {
    headerAddStarBtn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        openMobileAddModal();
      } else {
        const titleInput = document.getElementById('taskTitle');
        if (titleInput) titleInput.focus();
      }
    });
  }

  if (tabPromptsBtn) {
    tabPromptsBtn.addEventListener('click', () => {
      setActiveTab(tabPromptsBtn);
      openPromptsDrawer();
    });
  }

  if (tabHistoryBtn) {
    tabHistoryBtn.addEventListener('click', () => {
      setActiveTab(tabHistoryBtn);
      openHistory();
    });
  }

  if (tabAccountBtn) {
    tabAccountBtn.addEventListener('click', () => {
      setActiveTab(tabAccountBtn);
      openAccountDrawer();
    });
  }

  // --------------------------------------------------------------------------
  // Mobile Add Star Modal (Bottom Sheet)
  // --------------------------------------------------------------------------
  function openMobileAddModal() {
    if (mobileAddModal) {
      mobileAddModal.classList.add('active');
      const input = document.getElementById('mobileTaskTitle');
      if (input) setTimeout(() => input.focus(), 250);
    }
  }

  function closeMobileAddModal() {
    if (mobileAddModal) {
      mobileAddModal.classList.remove('active');
    }
  }

  if (closeMobileAddBtn) {
    closeMobileAddBtn.addEventListener('click', closeMobileAddModal);
  }

  mobileTimePresets.forEach(chip => {
    chip.addEventListener('click', () => {
      mobileTimePresets.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      mobileTaskTimeInput.value = chip.dataset.time;
    });
  });

  mobileTaskTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mobileTaskTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      isMobileAddType = btn.dataset.type;
    });
  });

  if (mobileAddForm) {
    mobileAddForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('mobileTaskTitle').value.trim();
      const link = document.getElementById('mobileTaskLink').value.trim();
      const time = parseInt(mobileTaskTimeInput.value, 10) || 15;

      if (!title) return;

      const newActivity = {
        id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        title,
        link,
        time,
        type: isMobileAddType,
        color: jarEngine.getRandomImageForType(isMobileAddType),
        createdAt: new Date().toISOString()
      };

      storage.addActivity(newActivity);
      jarEngine.spawnStar(newActivity, true);
      updateStarCounter();
      renderPromptsList();

      triggerHaptic([40, 30, 40]);
      showToast(`✨ Folded "${title}" into the jar!`);
      mobileAddForm.reset();
      mobileTaskTimeInput.value = 15;
      mobileTimePresets.forEach(c => c.classList.toggle('active', c.dataset.time === '15'));
      closeMobileAddModal();
    });
  }

  // --------------------------------------------------------------------------
  // Desktop Add Activity Form
  // --------------------------------------------------------------------------
  timePresets.forEach(chip => {
    chip.addEventListener('click', () => {
      timePresets.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      taskTimeInput.value = chip.dataset.time;
    });
  });

  taskTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      taskTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      isAddType = btn.dataset.type;
    });
  });

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const link = document.getElementById('taskLink').value.trim();
    const time = parseInt(taskTimeInput.value, 10) || 15;

    if (!title) return;

    const newActivity = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title,
      link,
      time,
      type: isAddType,
      color: jarEngine.getRandomImageForType(isAddType),
      createdAt: new Date().toISOString()
    };

    storage.addActivity(newActivity);
    jarEngine.spawnStar(newActivity, true);
    updateStarCounter();
    renderPromptsList();

    triggerHaptic([40, 30, 40]);
    showToast(`✨ Folded "${title}" into the jar!`);
    addForm.reset();
    taskTimeInput.value = 15;
    timePresets.forEach(c => c.classList.toggle('active', c.dataset.time === '15'));
  });

  // --------------------------------------------------------------------------
  // Draw Activity Controls
  // --------------------------------------------------------------------------
  drawTimeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      drawTimeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedDrawTime = parseInt(chip.dataset.drawTime, 10);
    });
  });

  drawTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      drawTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      isDrawType = btn.dataset.drawType;
    });
  });

  function performDraw() {
    const activities = storage.getActivities();
    if (activities.length === 0) {
      showToast('Your jar is currently empty! Add some stars first.');
      return;
    }

    const filtered = activities.filter(act => {
      const timeMatches = act.time <= selectedDrawTime;
      const typeMatches = (isDrawType === 'any') || 
                          (act.type === isDrawType) || 
                          (act.type === 'both');
      return timeMatches && typeMatches;
    });

    if (filtered.length === 0) {
      showToast('No stars match your exact time/mood! Shaking for any activity...');
    }

    const pool = filtered.length > 0 ? filtered : activities;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    // Block motion sensor drawing
    shakeCooldown = true;

    triggerHaptic([50, 40, 50, 40, 60]);
    jarEngine.shake(900);

    openTaskModal(selected);
  }

  // --------------------------------------------------------------------------
  // Mobile Shake Sensor (Noise-Gated Directional Reversal Engine)
  // --------------------------------------------------------------------------
  let lastX = null, lastY = null, lastZ = null;
  let lastDeltaX = 0, lastDeltaY = 0, lastDeltaZ = 0;
  let accumulatedMotion = 0;
  let lastDrawTime = 0;
  let motionPermissionGranted = false;
  let lastFormInteractionTime = 0;
  let reversalCount = 0;
  let lastReversalTime = 0;

  // Calibrated thresholds for physical phone shake without false triggers from typing:
  const MIN_DELTA_NOISE_GATE = 4.2;   // Discard sub-4.2 m/s² micro-deltas (typing/tapping noise)
  const MOTION_TRIGGER_ENERGY = 16.0; // Requires firm deliberate shaking energy
  const MOTION_DECAY = 0.78;          // Fast energy decay
  const DRAW_COOLDOWN_MS = 2500;      // 2.5s cooldown after a draw

  const mobileSensorPill = document.getElementById('mobileSensorPill');
  const motionPermissionBtn = document.getElementById('requestMotionPermissionBtn');

  // Typing & Form interaction tracking to suppress shake false triggers
  function updateFormInteractionLock() {
    lastFormInteractionTime = Date.now();
    accumulatedMotion = 0;
    reversalCount = 0;
    lastX = null;
    lastY = null;
    lastZ = null;
  }

  document.addEventListener('focusin', updateFormInteractionLock, { passive: true });
  document.addEventListener('focusout', updateFormInteractionLock, { passive: true });
  document.addEventListener('input', updateFormInteractionLock, { passive: true });
  document.addEventListener('keydown', updateFormInteractionLock, { passive: true });
  document.addEventListener('keyup', updateFormInteractionLock, { passive: true });

  document.querySelectorAll('input, textarea, select, form, .chip, .type-toggle-btn').forEach(el => {
    el.addEventListener('touchstart', updateFormInteractionLock, { passive: true });
    el.addEventListener('pointerdown', updateFormInteractionLock, { passive: true });
  });

  function isMotionSuppressed() {
    // 1. Cooldown or jar currently animating
    if (jarEngine.isShaking || (Date.now() - lastDrawTime < DRAW_COOLDOWN_MS)) return true;

    // 2. Active input/textarea focus
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
      return true;
    }

    // 3. User typed or interacted with form controls within last 2.5 seconds
    if (Date.now() - lastFormInteractionTime < 2500) {
      return true;
    }

    // 4. Any modal or side drawer is currently visible
    const openModalOrDrawer = document.querySelector('.modal-overlay.active, .drawer.active');
    if (openModalOrDrawer) {
      return true;
    }

    return false;
  }

  function handleDeviceMotion(event) {
    if (isMotionSuppressed()) {
      accumulatedMotion = 0;
      reversalCount = 0;
      lastX = null;
      lastY = null;
      lastZ = null;
      return;
    }

    const current = event.accelerationIncludingGravity || event.acceleration;
    if (!current || current.x === null || current.y === null || current.z === null) return;

    if (lastX === null || lastY === null || lastZ === null) {
      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
      accumulatedMotion = 0;
      reversalCount = 0;
      return;
    }

    const deltaX = current.x - lastX;
    const deltaY = current.y - lastY;
    const deltaZ = current.z - lastZ;

    lastX = current.x;
    lastY = current.y;
    lastZ = current.z;

    const frameMag = Math.hypot(deltaX, deltaY * 1.15, deltaZ);

    // NOISE GATE: Discard frame if delta is below threshold
    if (frameMag < MIN_DELTA_NOISE_GATE) {
      accumulatedMotion *= MOTION_DECAY;
      if (accumulatedMotion < 0.2) accumulatedMotion = 0;
      if (Date.now() - lastReversalTime > 700) reversalCount = 0;
      return;
    }

    // Check for directional reversals (sign changes in acceleration delta)
    const now = Date.now();
    const isReversalX = (deltaX > 2.5 && lastDeltaX < -2.5) || (deltaX < -2.5 && lastDeltaX > 2.5);
    const isReversalY = (deltaY > 2.5 && lastDeltaY < -2.5) || (deltaY < -2.5 && lastDeltaY > 2.5);
    const isReversalZ = (deltaZ > 2.5 && lastDeltaZ < -2.5) || (deltaZ < -2.5 && lastDeltaZ > 2.5);

    if (isReversalX || isReversalY || isReversalZ) {
      if (now - lastReversalTime < 650) {
        reversalCount++;
      } else {
        reversalCount = 1;
      }
      lastReversalTime = now;
    }

    lastDeltaX = deltaX;
    lastDeltaY = deltaY;
    lastDeltaZ = deltaZ;

    // Accumulate motion energy with fast decay
    accumulatedMotion = (accumulatedMotion * MOTION_DECAY) + frameMag;

    // Trigger draw ONLY if energy threshold is reached AND at least 2 directional reversals detected
    if (accumulatedMotion >= MOTION_TRIGGER_ENERGY && reversalCount >= 2) {
      accumulatedMotion = 0;
      reversalCount = 0;
      lastDrawTime = Date.now();
      lastX = null;
      lastY = null;
      lastZ = null;
      performDraw();
    }
  }

  function enableMotionSensor() {
    motionPermissionGranted = true;
    lastDrawTime = Date.now() + 2000;
    accumulatedMotion = 0;
    lastX = null;
    lastY = null;
    lastZ = null;
    window.addEventListener('devicemotion', handleDeviceMotion, { passive: true });
  }

  // Detect if browser requires explicit permission (iOS 13+ Safari)
  const isIOSPermissionRequired = (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function');

  if (isIOSPermissionRequired) {
    if (mobileSensorPill) mobileSensorPill.style.display = 'flex';

    if (motionPermissionBtn) {
      const handlePermissionRequest = async (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        accumulatedMotion = 0;
        lastDrawTime = Date.now() + 2500;
        lastX = null;
        lastY = null;
        lastZ = null;

        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
          try {
            const state = await DeviceMotionEvent.requestPermission();
            if (state === 'granted') {
              enableMotionSensor();
              motionPermissionBtn.innerHTML = '<span>✓ Motion Sensor Active — Shake Phone!</span>';
              motionPermissionBtn.style.background = 'linear-gradient(135deg, #06d6a0, #118ab2)';
              motionPermissionBtn.style.color = '#fff';
              showToast('✨ Motion sensor activated! Shake your phone to draw.');
              setTimeout(() => {
                if (mobileSensorPill) {
                  mobileSensorPill.style.transition = 'opacity 0.4s ease';
                  mobileSensorPill.style.opacity = '0';
                  setTimeout(() => {
                    mobileSensorPill.style.display = 'none';
                  }, 400);
                }
              }, 2000);
            } else {
              motionPermissionBtn.innerHTML = '<span>❌ Permission Denied (Check Safari Settings)</span>';
              showToast('Motion access denied — check Safari Settings.');
            }
          } catch (err) {
            console.error('DeviceMotion permission catch:', err);
            showToast('Motion permission error: ' + err.message);
          }
        }
      };

      motionPermissionBtn.addEventListener('click', handlePermissionRequest);
      motionPermissionBtn.addEventListener('touchend', handlePermissionRequest);
    }
  } else if ('ontouchstart' in window && window.DeviceMotionEvent) {
    enableMotionSensor();
    if (mobileSensorPill) mobileSensorPill.style.display = 'none';
  } else {
    if (mobileSensorPill) mobileSensorPill.style.display = 'none';
  }

  // Shake/draw buttons: draw a star
  function drawWithPermissionCheck(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    accumulatedMotion = 0;
    lastDrawTime = Date.now() + 2000;
    lastX = null;
    lastY = null;
    lastZ = null;
    performDraw();
  }

  const shakeBtn = document.getElementById('shakeJarBtn');
  if (shakeBtn) shakeBtn.addEventListener('click', drawWithPermissionCheck);

  const mobileShakeBtn = document.getElementById('mobileShakeBtn');
  if (mobileShakeBtn) mobileShakeBtn.addEventListener('click', drawWithPermissionCheck);

  // --------------------------------------------------------------------------
  // Task Details Modal
  // --------------------------------------------------------------------------
  function openTaskModal(activity) {
    currentDrawnActivity = activity;

    popupStarImage.src = `assets/stars/${activity.color || 'star_pink.png'}`;
    popupTaskTitle.textContent = activity.title;
    popupTimeBadge.textContent = `${activity.time} mins`;

    popupCategoryBadge.className = `badge badge-${activity.type}`;
    popupCategoryBadge.textContent = activity.type === 'both' ? 'Creative & Productive' : activity.type;

    if (activity.link && activity.link.startsWith('http')) {
      popupTaskLink.href = activity.link;
      popupTaskLink.style.display = 'inline-flex';
    } else {
      popupTaskLink.style.display = 'none';
    }

    accumulatedMotion = 0;
    lastDrawTime = Date.now() + 2000;
    lastX = null;
    lastY = null;
    lastZ = null;
    taskModal.classList.add('active');
  }

  function closeTaskModal() {
    taskModal.classList.remove('active');
    accumulatedMotion = 0;
    lastDrawTime = Date.now() + 2000;
    lastX = null;
    lastY = null;
    lastZ = null;
  }
  window.closeTaskModal = closeTaskModal;

  const closeModalBtn = document.getElementById('closeModalBtn');
  const closePopupIconBtn = document.getElementById('closePopupIconBtn');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeTaskModal();
    });
  }

  if (closePopupIconBtn) {
    closePopupIconBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeTaskModal();
    });
  }

  // Tapping backdrop overlay also dismisses the prompt modal
  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
      closeTaskModal();
    }
  });

  document.getElementById('redrawBtn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeTaskModal();
    setTimeout(() => {
      performDraw();
    }, 250);
  });

  // --------------------------------------------------------------------------
  // Task Completion & Resolution
  // --------------------------------------------------------------------------
  document.getElementById('markCompleteBtn').addEventListener('click', () => {
    closeTaskModal();
    resolutionModal.classList.add('active');
  });

  document.getElementById('keepStarInJarBtn').addEventListener('click', () => {
    if (currentDrawnActivity) {
      storage.logCompletion(currentDrawnActivity, true);
      triggerHaptic([40, 50, 40]);
      showToast(`🎉 Logged "${currentDrawnActivity.title}"! Kept in jar.`);
      renderHistory();
    }
    resolutionModal.classList.remove('active');
  });

  document.getElementById('removeStarFromJarBtn').addEventListener('click', () => {
    if (currentDrawnActivity) {
      storage.logCompletion(currentDrawnActivity, false);
      storage.removeActivity(currentDrawnActivity.id);
      refreshJarAndUI();
      triggerHaptic([60, 40, 60]);
      showToast(`🌟 Completed & removed star from jar!`);
    }
    resolutionModal.classList.remove('active');
  });

  // --------------------------------------------------------------------------
  // All Prompts Drawer & Management
  // --------------------------------------------------------------------------
  function openPromptsDrawer() {
    renderPromptsList();
    promptsDrawer.classList.add('active');
    promptsOverlay.classList.add('active');
  }

  function closePromptsDrawer() {
    promptsDrawer.classList.remove('active');
    promptsOverlay.classList.remove('active');
  }

  document.getElementById('promptsDrawerBtn').addEventListener('click', openPromptsDrawer);
  document.getElementById('closePromptsDrawerBtn').addEventListener('click', closePromptsDrawer);
  promptsOverlay.addEventListener('click', closePromptsDrawer);

  function renderPromptsList() {
    const container = document.getElementById('promptsListContainer');
    const activities = storage.getActivities();

    if (activities.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.9rem;">
          No stars in the jar yet! Fold a new star to get started.
        </div>`;
      return;
    }

    container.innerHTML = activities.map(act => {
      return `
        <div class="prompt-item" data-id="${act.id}">
          <div class="prompt-item-top">
            <img src="assets/stars/${act.color || 'star_pink.png'}" class="prompt-star-thumb" alt="Star">
            <div class="prompt-title-wrap">
              <div class="prompt-item-title" title="${escapeHtml(act.title)}">${escapeHtml(act.title)}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${act.time} mins ${act.link ? '• Has Link' : ''}</div>
            </div>
          </div>
          <div class="prompt-item-bottom">
            <span class="badge badge-${act.type}" style="font-size: 0.72rem; padding: 0.2rem 0.6rem;">${act.type}</span>
            <div class="prompt-actions">
              <button class="btn-icon btn-edit-prompt" data-id="${act.id}">
                ✎ Edit
              </button>
              <button class="btn-icon btn-icon-delete btn-delete-prompt" data-id="${act.id}">
                🗑 Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-edit-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const act = storage.getActivities().find(a => a.id === id);
        if (act) {
          openEditModal(act);
        }
      });
    });

    container.querySelectorAll('.btn-delete-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const act = storage.getActivities().find(a => a.id === id);
        if (act && confirm(`Remove "${act.title}" from the jar?`)) {
          storage.removeActivity(id);
          refreshJarAndUI();
          showToast(`🗑 Removed "${act.title}" from jar.`);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Edit Prompt Modal Handling
  // --------------------------------------------------------------------------
  function openEditModal(activity) {
    editTaskId.value = activity.id;
    editTaskTitle.value = activity.title;
    editTaskLink.value = activity.link || '';
    editTaskTime.value = activity.time || 15;
    editSelectedType = activity.type || 'creative';

    editTaskTypeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.editType === editSelectedType);
    });

    editModalOverlay.classList.add('active');
  }

  function closeEditModal() {
    editModalOverlay.classList.remove('active');
  }

  document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);

  editTaskTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      editTaskTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      editSelectedType = btn.dataset.editType;
    });
  });

  editActivityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editTaskId.value;
    const title = editTaskTitle.value.trim();
    const link = editTaskLink.value.trim();
    const time = parseInt(editTaskTime.value, 10) || 15;

    if (!title) return;

    storage.updateActivity(id, {
      title,
      link,
      time,
      type: editSelectedType
    });

    refreshJarAndUI();
    closeEditModal();
    showToast(`✓ Updated "${title}"!`);
  });

  // --------------------------------------------------------------------------
  // History Drawer
  // --------------------------------------------------------------------------
  function openHistory() {
    renderHistory();
    historyDrawer.classList.add('active');
    historyOverlay.classList.add('active');
  }

  function closeHistory() {
    historyDrawer.classList.remove('active');
    historyOverlay.classList.remove('active');
  }

  document.getElementById('historyDrawerBtn').addEventListener('click', openHistory);
  document.getElementById('closeHistoryDrawerBtn').addEventListener('click', closeHistory);
  historyOverlay.addEventListener('click', closeHistory);

  function renderHistory() {
    const container = document.getElementById('historyListContainer');
    const history = storage.getHistory();

    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.9rem;">
          No completed activities yet. Shake the jar to draw your first inspiration!
        </div>`;
      return;
    }

    container.innerHTML = history.map(item => {
      const date = new Date(item.completedAt);
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div class="history-item-title">${escapeHtml(item.title)}</div>
          <div class="history-item-meta">
            <span class="badge badge-${item.type}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">${item.type}</span>
            <span>${item.timeSpent}m • ${dateStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your activity history?')) {
      storage.clearHistory();
      renderHistory();
      showToast('Activity history cleared.');
    }
  });

  // --------------------------------------------------------------------------
  // Account & Cloud Sync Drawer
  // --------------------------------------------------------------------------
  function openAccountDrawer() {
    updateAccountUI();
    accountDrawer.classList.add('active');
    accountOverlay.classList.add('active');
  }

  function closeAccountDrawer() {
    accountDrawer.classList.remove('active');
    accountOverlay.classList.remove('active');
  }

  document.getElementById('accountDrawerBtn').addEventListener('click', openAccountDrawer);
  document.getElementById('closeAccountDrawerBtn').addEventListener('click', closeAccountDrawer);
  accountOverlay.addEventListener('click', closeAccountDrawer);

  function updateAccountUI() {
    const user = storage.getCurrentUser();
    if (user) {
      userAccountLabel.textContent = user.name.split(' ')[0];
      loggedOutView.style.display = 'none';
      loggedInView.style.display = 'block';
      document.getElementById('profileName').textContent = user.name;
      document.getElementById('profileEmail').textContent = user.email;
      if (syncStatusText) {
        syncStatusText.textContent = storage.getLastSyncedText();
      }
    } else {
      userAccountLabel.textContent = 'Account';
      loggedOutView.style.display = 'block';
      loggedInView.style.display = 'none';
    }
  }

  toggleAuthModeBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    if (isSignUpMode) {
      authSubmitBtn.textContent = 'Sign Up';
      toggleAuthModeBtn.textContent = 'Already have an account? Log in';
      nameFieldGroup.style.display = 'block';
    } else {
      authSubmitBtn.textContent = 'Log In';
      toggleAuthModeBtn.textContent = "Don't have an account? Sign up";
      nameFieldGroup.style.display = 'none';
    }
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName').value;

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Syncing...';

    try {
      if (isSignUpMode) {
        await storage.registerUser(email, password, name);
        showToast(`Welcome, ${name || email}! Account created & synced to cloud.`);
      } else {
        await storage.loginUser(email, password);
        showToast(`Welcome back! Imported progress across devices.`);
      }
      refreshJarAndUI();
      authForm.reset();
      updateAccountUI();
    } catch (err) {
      showToast(err.message || 'Authentication error.');
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.textContent = isSignUpMode ? 'Sign Up' : 'Log In';
    }
  });

  if (manualSyncBtn) {
    manualSyncBtn.addEventListener('click', async () => {
      manualSyncBtn.disabled = true;
      manualSyncBtn.innerHTML = '<span>☁️ Syncing...</span>';
      try {
        const res = await storage.syncFromCloud();
        if (res.success) {
          refreshJarAndUI();
          updateAccountUI();
          showToast(`✓ Cloud sync complete (${res.activitiesCount} stars)!`);
        } else {
          showToast('Sync failed: ' + (res.error || 'Server error'));
        }
      } catch (err) {
        showToast('Sync failed: ' + err.message);
      } finally {
        manualSyncBtn.disabled = false;
        manualSyncBtn.innerHTML = '<span>☁️ Sync with Cloud Now</span>';
      }
    });
  }

  // Cross-device auto-sync hooks
  storage.addSyncListener(() => {
    refreshJarAndUI();
    updateAccountUI();
  });

  // 1. On startup
  storage.syncFromCloud().then((res) => {
    if (res && res.success) {
      refreshJarAndUI();
      updateAccountUI();
    }
  }).catch(() => {});

  // 2. When user switches back to this browser tab / device
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      storage.syncFromCloud().then((res) => {
        if (res && res.success) {
          refreshJarAndUI();
          updateAccountUI();
        }
      }).catch(() => {});
    }
  });

  window.addEventListener('focus', () => {
    storage.syncFromCloud().then((res) => {
      if (res && res.success) {
        refreshJarAndUI();
        updateAccountUI();
      }
    }).catch(() => {});
  });

  // 3. Periodic background sync every 60s
  setInterval(() => {
    if (storage.getCurrentUser()) {
      storage.syncFromCloud().then((res) => {
        if (res && res.success) {
          refreshJarAndUI();
          updateAccountUI();
        }
      }).catch(() => {});
    }
  }, 60000);

  document.getElementById('logoutBtn').addEventListener('click', () => {
    storage.logout();
    updateAccountUI();
    showToast('Logged out.');
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
});

