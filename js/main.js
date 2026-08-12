/**
 * main.js
 * Application controller for StarJar: binds user interactions,
 * coordinates Canvas physics, handles iPhone shake sensor, and manages mobile bottom tabs.
 */

import { StorageService } from './storage.js';
import { JarEngine } from './jar.js';

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
  // Mobile / iPhone Shake Sensor Integration (High-Sensitivity Energy Engine)
  // --------------------------------------------------------------------------
  let lastX = null, lastY = null, lastZ = null;
  let accumulatedMotion = 0;
  let lastDrawTime = 0;
  let motionPermissionGranted = false;

  // Ultra-responsive energy threshold: senses gentle up/down & omnidirectional motion
  const MOTION_TRIGGER_ENERGY = 1.4;  // Low threshold — gentle rocking triggers draw
  const MOTION_DECAY = 0.94;          // Slow decay — energy builds up quickly across frames
  const DRAW_COOLDOWN_MS = 2000;      // 2.0s cooldown between draws

  const mobileSensorPill = document.getElementById('mobileSensorPill');
  const motionPermissionBtn = document.getElementById('requestMotionPermissionBtn');

  function handleDeviceMotion(event) {
    // If modal is active or jar is shaking or in cooldown, ignore motion completely
    if (taskModal.classList.contains('active') || 
        resolutionModal.classList.contains('active') || 
        jarEngine.isShaking ||
        Date.now() - lastDrawTime < DRAW_COOLDOWN_MS) {
      accumulatedMotion = 0;
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
      return;
    }

    const deltaX = current.x - lastX;
    const deltaY = current.y - lastY;
    const deltaZ = current.z - lastZ;

    lastX = current.x;
    lastY = current.y;
    lastZ = current.z;

    // 3D delta magnitude for this frame (with extra vertical boost for up/down motion)
    const frameMag = Math.hypot(deltaX, deltaY * 1.25, deltaZ);

    // Accumulate motion energy with smooth exponential decay
    accumulatedMotion = (accumulatedMotion * MOTION_DECAY) + frameMag;

    // Trigger draw as soon as active movement energy builds up
    if (accumulatedMotion > MOTION_TRIGGER_ENERGY) {
      accumulatedMotion = 0;
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
