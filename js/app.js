// StarJar — Bundled App
/**
 * storage.js
 * Manages local storage persistence, activity items, completion history,
 * user authentication state, and cloud sync hooks.
 */

const STORAGE_KEYS = {
  ACTIVITIES: 'starjar_activities',
  HISTORY: 'starjar_history',
  USER: 'starjar_user',
  ACCOUNTS: 'starjar_accounts_db'
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

  // User Accounts & Authentication (Local + Cloud Simulation)
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

  registerUser(email, password, name) {
    const accounts = this.getRegisteredAccounts();
    if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: 'usr-' + Date.now(),
      email: email.trim(),
      password, // in real cloud apps, hashed on server
      name: name.trim() || email.split('@')[0],
      createdAt: new Date().toISOString(),
      activities: this.getActivities(),
      history: this.getHistory()
    };
    accounts.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    this.setCurrentUser(newUser);
    return newUser;
  }

  loginUser(email, password) {
    const accounts = this.getRegisteredAccounts();
    const found = accounts.find(
      acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
    );
    if (!found) {
      throw new Error('Invalid email or password.');
    }
    // Load their cloud data
    if (found.activities) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(found.activities));
    }
    if (found.history) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(found.history));
    }
    this.setCurrentUser(found);
    return found;
  }

  setCurrentUser(user) {
    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  triggerSync() {
    const user = this.getCurrentUser();
    if (user) {
      const accounts = this.getRegisteredAccounts();
      const idx = accounts.findIndex(acc => acc.id === user.id);
      if (idx !== -1) {
        accounts[idx].activities = this.getActivities();
        accounts[idx].history = this.getHistory();
        accounts[idx].lastSynced = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }
    }
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

    triggerHaptic([50, 40, 50, 40, 60]);
    jarEngine.shake(900);

    setTimeout(() => {
      openTaskModal(selected);
    }, 700);
  }
  // --------------------------------------------------------------------------
  // Mobile / iPhone Shake Sensor Integration
  // --------------------------------------------------------------------------
  let lastX = 0, lastY = 0, lastZ = 0;
  let lastUpdate = 0;
  const SHAKE_THRESHOLD = 8;
  let motionPermissionGranted = false;

  const mobileSensorPill = document.getElementById('mobileSensorPill');
  const motionPermissionBtn = document.getElementById('requestMotionPermissionBtn');

  function handleDeviceMotion(event) {
    const current = event.accelerationIncludingGravity;
    if (!current) return;

    const currentTime = performance.now();
    if ((currentTime - lastUpdate) > 100) {
      const diffTime = currentTime - lastUpdate;
      lastUpdate = currentTime;

      const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

      if (speed > SHAKE_THRESHOLD) {
        if (!jarEngine.isShaking && !taskModal.classList.contains('active') && !resolutionModal.classList.contains('active')) {
          performDraw();
        }
      }

      lastX = current.x;
      lastY = current.y;
      lastZ = current.z;
    }
  }

  function enableMotionSensor() {
    motionPermissionGranted = true;
    window.addEventListener('devicemotion', handleDeviceMotion);
    if (mobileSensorPill) mobileSensorPill.style.display = 'none';
    triggerHaptic([60, 40, 60]);
    showToast('🫙 Shake your phone to draw a star!');
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (window.DeviceMotionEvent) {
    if (isIOS && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ — must request permission from user gesture
      // Show the pill banner so user knows to tap it
      if (mobileSensorPill) mobileSensorPill.style.display = 'flex';

      // Pill button: ONLY requests permission, does not draw
      if (motionPermissionBtn) {
        motionPermissionBtn.addEventListener('click', () => {
          DeviceMotionEvent.requestPermission()
            .then(state => {
              if (state === 'granted') {
                enableMotionSensor();
              } else {
                showToast('Motion access denied — use the Shake button instead.');
                if (mobileSensorPill) mobileSensorPill.style.display = 'none';
              }
            })
            .catch(() => {
              if (mobileSensorPill) mobileSensorPill.style.display = 'none';
            });
        });
      }
    } else if (isIOS) {
      // iOS < 13 — no permission needed
      window.addEventListener('devicemotion', handleDeviceMotion);
    } else {
      // Android / desktop
      window.addEventListener('devicemotion', handleDeviceMotion);
    }
  }

  // Shake/draw buttons: draw a star (and request permission on first tap if still needed)
  function drawWithPermissionCheck() {
    if (isIOS && typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function' &&
        !motionPermissionGranted) {
      // Grant permission silently on first draw tap too
      DeviceMotionEvent.requestPermission()
        .then(state => {
          if (state === 'granted') enableMotionSensor();
        })
        .catch(() => {});
    }
    performDraw();
  }

  const shakeBtn = document.getElementById('shakeJarBtn');
  if (shakeBtn) shakeBtn.addEventListener('click', drawWithPermissionCheck);

  const mobileShakeBtn = document.getElementById('mobileShakeBtn');
  if (mobileShakeBtn) mobileShakeBtn.addEventListener('click', drawWithPermissionCheck);

  const jarClickArea = document.getElementById('jarClickArea');
  if (jarClickArea) jarClickArea.addEventListener('click', drawWithPermissionCheck);

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

    taskModal.classList.add('active');
  }

  function closeTaskModal() {
    taskModal.classList.remove('active');
  }

  document.getElementById('closeModalBtn').addEventListener('click', closeTaskModal);

  document.getElementById('redrawBtn').addEventListener('click', () => {
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

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const name = document.getElementById('authName').value;

    try {
      if (isSignUpMode) {
        storage.registerUser(email, password, name);
        showToast(`Welcome, ${name || email}! Account created & synced.`);
      } else {
        storage.loginUser(email, password);
        showToast(`Welcome back! Data synced.`);
      }
      refreshJarAndUI();
      authForm.reset();
    } catch (err) {
      showToast(err.message || 'Authentication error.');
    }
  });

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
