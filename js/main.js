/**
 * main.js
 * Application controller for StarJar: binds user interactions,
 * coordinates Canvas physics, handles multi-jar management and switching,
 * manages prompt & history isolation, handles iPhone shake sensor, and mobile bottom tabs.
 */

import { StorageService, JAR_TEMPLATES } from './storage.js';
import { JarEngine } from './jar.js';

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements Declaration
  const userAccountLabel = document.getElementById('userAccountLabel');
  const loggedInView = document.getElementById('loggedInView');
  const loggedOutView = document.getElementById('loggedOutView');
  const syncStatusText = document.getElementById('syncStatusText');
  const manualSyncBtn = document.getElementById('manualSyncBtn');
  
  // Jar Switcher & Stage Elements
  const jarSwitcherBtn = document.getElementById('jarSwitcherBtn');
  const currentJarTitle = document.getElementById('currentJarTitle');
  const currentJarStarCount = document.getElementById('currentJarStarCount');
  const stageJarNamePill = document.getElementById('stageJarNamePill');
  const panelActiveJarTag = document.getElementById('panelActiveJarTag');
  const drawPanelActiveJarTag = document.getElementById('drawPanelActiveJarTag');
  const mobileAddJarTag = document.getElementById('mobileAddJarTag');
  const promptsJarSubtitle = document.getElementById('promptsJarSubtitle');
  const historyJarSubtitle = document.getElementById('historyJarSubtitle');
  const starCountDisplay = document.getElementById('starCountDisplay');

  // Jars Management Drawer
  const jarsDrawer = document.getElementById('jarsDrawer');
  const jarsDrawerOverlay = document.getElementById('jarsDrawerOverlay');
  const closeJarsDrawerBtn = document.getElementById('closeJarsDrawerBtn');
  const openCreateJarBtn = document.getElementById('openCreateJarBtn');
  const jarsListContainer = document.getElementById('jarsListContainer');

  // Create / Edit Jar Modal
  const jarModalOverlay = document.getElementById('jarModalOverlay');
  const jarModalTitle = document.getElementById('jarModalTitle');
  const jarModalSubtitle = document.getElementById('jarModalSubtitle');
  const jarForm = document.getElementById('jarForm');
  const jarEditId = document.getElementById('jarEditId');
  const jarNameInput = document.getElementById('jarNameInput');
  const jarDescInput = document.getElementById('jarDescInput');
  const jarTemplateGroup = document.getElementById('jarTemplateGroup');
  const templateChipBtns = document.querySelectorAll('#jarTemplatePicker .template-chip');
  const saveJarSubmitBtn = document.getElementById('saveJarSubmitBtn');
  const cancelJarModalBtn = document.getElementById('cancelJarModalBtn');

  // Move Activity Modal
  const moveModalOverlay = document.getElementById('moveModalOverlay');
  const moveActivityId = document.getElementById('moveActivityId');
  const moveModalPromptTitle = document.getElementById('moveModalPromptTitle');
  const moveJarsListContainer = document.getElementById('moveJarsListContainer');
  const cancelMoveBtn = document.getElementById('cancelMoveBtn');

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
  const popupJarBadge = document.getElementById('popupJarBadge');
  const popupTaskLink = document.getElementById('popupTaskLink');
  const resolutionModal = document.getElementById('resolutionModalOverlay');
  
  // Drawers
  const historyDrawer = document.getElementById('historyDrawer');
  const historyOverlay = document.getElementById('historyDrawerOverlay');
  const promptsDrawer = document.getElementById('promptsDrawer');
  const promptsOverlay = document.getElementById('promptsDrawerOverlay');
  const accountDrawer = document.getElementById('accountDrawer');
  const accountOverlay = document.getElementById('accountDrawerOverlay');

  // History Filter Tabs
  const historyTabBtns = document.querySelectorAll('#historyFilterTabs .history-tab-btn');
  const histCountCurrent = document.getElementById('histCountCurrent');
  const histCountAll = document.getElementById('histCountAll');

  // Bottom Tabs (Mobile)
  const tabJarBtn = document.getElementById('tabJarBtn');
  const tabJarsBtn = document.getElementById('tabJarsBtn');
  const tabAddStarBtn = document.getElementById('tabAddStarBtn');
  const tabPromptsBtn = document.getElementById('tabPromptsBtn');
  const tabHistoryBtn = document.getElementById('tabHistoryBtn');

  // Edit Prompt Modal
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
  let currentHistoryScope = 'current'; // 'current' | 'all'
  let selectedJarTemplate = 'blank';
  let isEditingJar = false;

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

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // --------------------------------------------------------------------------
  // Multi-Jar Synchronization & UI Refresh
  // --------------------------------------------------------------------------
  function updateActiveJarLabels() {
    const jar = storage.getActiveJar();
    if (!jar) return;

    const count = (jar.activities || []).length;
    const starCountText = `${count} ${count === 1 ? 'star' : 'stars'}`;

    if (currentJarTitle) currentJarTitle.textContent = jar.name;
    if (currentJarStarCount) currentJarStarCount.textContent = starCountText;
    
    if (stageJarNamePill) stageJarNamePill.textContent = jar.name;
    if (panelActiveJarTag) panelActiveJarTag.textContent = `Fold into: ${jar.name}`;
    if (drawPanelActiveJarTag) drawPanelActiveJarTag.textContent = `From: ${jar.name}`;
    if (mobileAddJarTag) mobileAddJarTag.textContent = `Fold into: ${jar.name}`;
    if (promptsJarSubtitle) promptsJarSubtitle.textContent = jar.name;
    if (historyJarSubtitle) historyJarSubtitle.textContent = jar.name;
    
    if (starCountDisplay) {
      starCountDisplay.textContent = `${count} ${count === 1 ? 'Star' : 'Stars'}`;
    }
  }

  function updateUIState() {
    updateActiveJarLabels();
    renderJarsList();
    renderPromptsList();
    renderHistory();
    updateAccountUI();
  }

  function refreshJarAndUI(forceReset = false) {
    updateActiveJarLabels();
    const activities = storage.getActivities();
    jarEngine.syncStarsWithActivities(activities, forceReset);
    renderJarsList();
    renderPromptsList();
    renderHistory();
    updateAccountUI();
  }

  jarEngine.onAssetsLoaded = () => {
    refreshJarAndUI(true);
  };
  refreshJarAndUI(true);

  // --------------------------------------------------------------------------
  // Jars Management Drawer & Switcher
  // --------------------------------------------------------------------------
  function openJarsDrawer() {
    renderJarsList();
    jarsDrawer.classList.add('active');
    jarsDrawerOverlay.classList.add('active');
  }

  function closeJarsDrawer() {
    jarsDrawer.classList.remove('active');
    jarsDrawerOverlay.classList.remove('active');
  }

  if (jarSwitcherBtn) jarSwitcherBtn.addEventListener('click', openJarsDrawer);
  if (closeJarsDrawerBtn) closeJarsDrawerBtn.addEventListener('click', closeJarsDrawer);
  if (jarsDrawerOverlay) jarsDrawerOverlay.addEventListener('click', closeJarsDrawer);

  function renderJarsList() {
    if (!jarsListContainer) return;
    const jars = storage.getJars();
    const activeId = storage.getActiveJarId();

    jarsListContainer.innerHTML = jars.map(jar => {
      const isActive = jar.id === activeId;
      const starCount = (jar.activities || []).length;
      const histCount = (jar.history || []).length;
      const canDelete = jars.length > 1;

      return `
        <div class="jar-card ${isActive ? 'active-jar' : ''}" data-jar-id="${jar.id}">
          <div class="jar-card-top">
            <div class="jar-card-info">
              <div class="jar-card-title">
                <span>${escapeHtml(jar.name)}</span>
              </div>
              ${jar.description ? `<div class="jar-card-desc">${escapeHtml(jar.description)}</div>` : ''}
              <div class="jar-card-badges">
                ${isActive ? `<span class="jar-card-badge active-badge">Active Jar</span>` : ''}
                <span class="jar-card-badge stars-badge">${starCount} ${starCount === 1 ? 'star' : 'stars'}</span>
                <span class="jar-card-badge hist-badge">${histCount} completed</span>
              </div>
            </div>
            <div class="jar-card-actions" onclick="event.stopPropagation();">
              <button class="jar-action-icon-btn btn-edit-jar" data-jar-id="${jar.id}" title="Rename & Edit Jar">
                ✎
              </button>
              ${canDelete ? `
                <button class="jar-action-icon-btn delete btn-delete-jar" data-jar-id="${jar.id}" title="Delete Jar">
                  🗑
                </button>
              ` : ''}
            </div>
          </div>
          ${!isActive ? `
            <button class="btn-secondary btn-switch-jar" data-jar-id="${jar.id}" style="width: 100%; margin-top: 0.5rem; padding: 0.45rem; font-size: 0.8rem;">
              Switch to this Jar
            </button>
          ` : ''}
        </div>
      `;
    }).join('');

    // Switch jar click
    jarsListContainer.querySelectorAll('.jar-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.jar-card-actions')) return;
        const id = card.dataset.jarId;
        if (id && id !== activeId) {
          switchJar(id);
        }
      });
    });

    jarsListContainer.querySelectorAll('.btn-switch-jar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchJar(btn.dataset.jarId);
      });
    });

    // Edit jar
    jarsListContainer.querySelectorAll('.btn-edit-jar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const jar = storage.getJars().find(j => j.id === btn.dataset.jarId);
        if (jar) openEditJarModal(jar);
      });
    });

    // Delete jar
    jarsListContainer.querySelectorAll('.btn-delete-jar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const jar = storage.getJars().find(j => j.id === btn.dataset.jarId);
        if (jar && confirm(`Are you sure you want to delete "${jar.name}" and all of its folded stars and history?`)) {
          storage.deleteJar(jar.id);
          refreshJarAndUI();
          triggerHaptic([50, 40]);
          showToast(`Deleted "${jar.name}".`);
        }
      });
    });
  }

  function switchJar(jarId) {
    suppressMotion(2500);
    if (storage.setActiveJar(jarId)) {
      triggerHaptic([40, 50, 40]);
      const activeJar = storage.getActiveJar();
      refreshJarAndUI(true);
      closeJarsDrawer();
      showToast(`Switched to "${activeJar.name}".`);
    }
  }

  // --------------------------------------------------------------------------
  // Create / Edit Jar Modal Handling
  // --------------------------------------------------------------------------
  function openCreateJarModal() {
    isEditingJar = false;
    jarModalTitle.textContent = 'Create a New Star Jar';
    jarModalSubtitle.textContent = 'Give your jar a unique name and purpose for your activities.';
    saveJarSubmitBtn.textContent = 'Create Jar';
    jarEditId.value = '';
    jarNameInput.value = '';
    jarDescInput.value = '';
    jarTemplateGroup.style.display = 'block';

    selectedJarTemplate = 'blank';
    templateChipBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.template === 'blank'));

    jarModalOverlay.classList.add('active');
    setTimeout(() => jarNameInput.focus(), 250);
  }

  function openEditJarModal(jar) {
    isEditingJar = true;
    jarModalTitle.textContent = 'Edit Star Jar';
    jarModalSubtitle.textContent = 'Update your jar name or purpose description.';
    saveJarSubmitBtn.textContent = 'Save Changes';
    jarEditId.value = jar.id;
    jarNameInput.value = jar.name;
    jarDescInput.value = jar.description || '';
    jarTemplateGroup.style.display = 'none';

    jarModalOverlay.classList.add('active');
    setTimeout(() => jarNameInput.focus(), 250);
  }

  function closeJarModal() {
    jarModalOverlay.classList.remove('active');
  }

  if (openCreateJarBtn) openCreateJarBtn.addEventListener('click', openCreateJarModal);
  if (cancelJarModalBtn) cancelJarModalBtn.addEventListener('click', closeJarModal);
  jarModalOverlay.addEventListener('click', (e) => {
    if (e.target === jarModalOverlay) closeJarModal();
  });

  templateChipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      templateChipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedJarTemplate = btn.dataset.template;

      const templateData = JAR_TEMPLATES[selectedJarTemplate];
      if (templateData && templateData.name && !isEditingJar) {
        if (!jarNameInput.value || Object.values(JAR_TEMPLATES).some(t => t.name === jarNameInput.value)) {
          jarNameInput.value = templateData.name;
        }
        if (!jarDescInput.value || Object.values(JAR_TEMPLATES).some(t => t.description === jarDescInput.value)) {
          jarDescInput.value = templateData.description;
        }
      }
    });
  });

  jarForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = jarNameInput.value.trim();
    const description = jarDescInput.value.trim();

    if (!name) return;

    if (isEditingJar) {
      const id = jarEditId.value;
      storage.updateJar(id, { name, description });
      refreshJarAndUI(false);
      closeJarModal();
      showToast(`Updated "${name}".`);
    } else {
      const newJar = storage.createJar({
        name,
        description,
        template: selectedJarTemplate
      });
      refreshJarAndUI(true);
      closeJarModal();
      closeJarsDrawer();
      triggerHaptic([40, 60, 40]);
      showToast(`Created "${newJar.name}" with ${newJar.activities.length} stars.`);
    }
  });

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
      closeJarsDrawer();
      closeAccountDrawer();
      closeMobileAddModal();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (tabJarsBtn) {
    tabJarsBtn.addEventListener('click', () => {
      setActiveTab(tabJarsBtn);
      openJarsDrawer();
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

  // --------------------------------------------------------------------------
  // Mobile Add Star Modal (Bottom Sheet)
  // --------------------------------------------------------------------------
  function openMobileAddModal() {
    if (mobileAddModal) {
      updateActiveJarLabels();
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
      updateUIState();

      triggerHaptic([40, 30, 40]);
      const activeJar = storage.getActiveJar();
      showToast(`Folded "${title}" into ${activeJar.name}.`);
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
    updateUIState();

    triggerHaptic([40, 30, 40]);
    const activeJar = storage.getActiveJar();
    showToast(`Folded "${title}" into ${activeJar.name}.`);
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
    const activeJar = storage.getActiveJar();

    if (activities.length === 0) {
      showToast(`"${activeJar.name}" is currently empty. Fold a new star above.`);
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
      showToast('No stars match your exact time/mood. Shaking for any activity...');
    }

    const pool = filtered.length > 0 ? filtered : activities;
    const selected = pool[Math.floor(Math.random() * pool.length)];

    triggerHaptic([50, 40, 50, 40, 60]);
    jarEngine.shake(900);

    openTaskModal(selected);
  }

  // --------------------------------------------------------------------------
  // Mobile Shake Sensor & Motion Suppression System
  // --------------------------------------------------------------------------
  let lastX = null, lastY = null, lastZ = null;
  let lastDeltaX = 0, lastDeltaY = 0, lastDeltaZ = 0;
  let accumulatedMotion = 0;
  let lastDrawTime = 0;
  let motionPermissionGranted = false;
  let motionSuppressedUntil = 0;
  let reversalCount = 0;
  let lastReversalTime = 0;

  // Calibrated for ultra-responsive gentle wrist shake (+15% sensitivity increase) with strict UI touch suppression
  const MIN_DELTA_NOISE_GATE = 0.54;       // Ultra-responsive to gentle wrist motion (15% more sensitive)
  const MOTION_TRIGGER_ENERGY = 1.25;      // Effortless threshold: quick light shake (15% lower energy threshold)
  const MOTION_DECAY = 0.92;               // Smooth energy accumulation across frames
  const REVERSAL_THRESHOLD = 0.36;         // Sensitive directional change threshold (15% more sensitive)
  const DRAW_COOLDOWN_MS = 2500;

  const mobileSensorPill = document.getElementById('mobileSensorPill');
  const motionPermissionBtn = document.getElementById('requestMotionPermissionBtn');

  function suppressMotion(ms = 2200) {
    accumulatedMotion = 0;
    reversalCount = 0;
    lastX = null;
    lastY = null;
    lastZ = null;
    motionSuppressedUntil = Math.max(motionSuppressedUntil, Date.now() + ms);
  }

  function handleUIInteraction(e) {
    const target = e.target;
    if (!target) return;
    // Suppress motion when tapping any button, tab, card, input, drawer, or modal
    if (target.closest('button, a, input, textarea, select, form, .chip, .type-toggle-btn, .jar-card, .drawer, .modal-overlay, .bottom-nav-bar, .app-header, .panel, .icon-choice, .template-chip, .prompt-item, .history-item, .history-tab-btn')) {
      // Only the explicit Shake buttons bypass the suppression
      if (!target.closest('#shakeJarBtn, #mobileShakeBtn')) {
        suppressMotion(2200);
      }
    }
  }

  document.addEventListener('pointerdown', handleUIInteraction, { passive: true });
  document.addEventListener('touchstart', handleUIInteraction, { passive: true });
  document.addEventListener('click', handleUIInteraction, { passive: true });
  document.addEventListener('focusin', () => suppressMotion(2500), { passive: true });
  document.addEventListener('focusout', () => suppressMotion(2500), { passive: true });
  document.addEventListener('input', () => suppressMotion(2500), { passive: true });
  document.addEventListener('keydown', () => suppressMotion(2500), { passive: true });

  function isMotionSuppressed() {
    if (Date.now() < motionSuppressedUntil) return true;
    if (jarEngine.isShaking || (Date.now() - lastDrawTime < DRAW_COOLDOWN_MS)) return true;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
      return true;
    }
    const openModalOrDrawer = document.querySelector('.modal-overlay.active, .drawer.active');
    if (openModalOrDrawer) return true;
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

    const frameMag = Math.hypot(deltaX, deltaY * 1.25, deltaZ);

    if (frameMag < MIN_DELTA_NOISE_GATE) {
      accumulatedMotion *= MOTION_DECAY;
      if (accumulatedMotion < 0.06) accumulatedMotion = 0;
      if (Date.now() - lastReversalTime > 700) reversalCount = 0;
      return;
    }

    const now = Date.now();
    const isReversalX = (deltaX > REVERSAL_THRESHOLD && lastDeltaX < -REVERSAL_THRESHOLD) || (deltaX < -REVERSAL_THRESHOLD && lastDeltaX > REVERSAL_THRESHOLD);
    const isReversalY = (deltaY > REVERSAL_THRESHOLD && lastDeltaY < -REVERSAL_THRESHOLD) || (deltaY < -REVERSAL_THRESHOLD && lastDeltaY > REVERSAL_THRESHOLD);
    const isReversalZ = (deltaZ > REVERSAL_THRESHOLD && lastDeltaZ < -REVERSAL_THRESHOLD) || (deltaZ < -REVERSAL_THRESHOLD && lastDeltaZ > REVERSAL_THRESHOLD);

    if (isReversalX || isReversalY || isReversalZ) {
      if (now - lastReversalTime < 700) {
        reversalCount++;
      } else {
        reversalCount = 1;
      }
      lastReversalTime = now;
    }

    lastDeltaX = deltaX;
    lastDeltaY = deltaY;
    lastDeltaZ = deltaZ;

    accumulatedMotion = (accumulatedMotion * MOTION_DECAY) + frameMag;

    if (accumulatedMotion >= MOTION_TRIGGER_ENERGY && reversalCount >= 1) {
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
              showToast('Motion sensor activated! Shake your phone to draw.');
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
    const activeJar = storage.getActiveJar();

    popupStarImage.src = `assets/stars/${activity.color || 'star_pink.png'}`;
    popupTaskTitle.textContent = activity.title;
    popupTimeBadge.textContent = `${activity.time} mins`;

    popupCategoryBadge.className = `badge badge-${activity.type}`;
    popupCategoryBadge.textContent = activity.type === 'both' ? 'Creative & Productive' : activity.type;

    if (popupJarBadge && activeJar) {
      popupJarBadge.textContent = activeJar.name;
    }

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
  // Task Completion & Resolution (Logged into Active Jar)
  // --------------------------------------------------------------------------
  document.getElementById('markCompleteBtn').addEventListener('click', () => {
    closeTaskModal();
    resolutionModal.classList.add('active');
  });

  document.getElementById('keepStarInJarBtn').addEventListener('click', () => {
    if (currentDrawnActivity) {
      const activeJar = storage.getActiveJar();
      storage.logCompletion(currentDrawnActivity, true, activeJar.id);
      triggerHaptic([40, 50, 40]);
      showToast(`Logged "${currentDrawnActivity.title}" in ${activeJar.name}.`);
      refreshJarAndUI();
    }
    resolutionModal.classList.remove('active');
  });

  document.getElementById('removeStarFromJarBtn').addEventListener('click', () => {
    if (currentDrawnActivity) {
      const activeJar = storage.getActiveJar();
      storage.logCompletion(currentDrawnActivity, false, activeJar.id);
      storage.removeActivity(currentDrawnActivity.id, activeJar.id);
      refreshJarAndUI();
      triggerHaptic([60, 40, 60]);
      showToast(`Completed and removed from ${activeJar.name}.`);
    }
    resolutionModal.classList.remove('active');
  });

  // --------------------------------------------------------------------------
  // All Prompts Drawer & Management (Scoped to Jar)
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

  const drawerAddPromptBtn = document.getElementById('drawerAddPromptBtn');
  if (drawerAddPromptBtn) {
    drawerAddPromptBtn.addEventListener('click', () => {
      closePromptsDrawer();
      if (window.innerWidth <= 768) {
        openMobileAddModal();
      } else {
        const titleInput = document.getElementById('taskTitle');
        if (titleInput) {
          titleInput.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });
  }

  function renderPromptsList() {
    const container = document.getElementById('promptsListContainer');
    const activities = storage.getActivities();
    const activeJar = storage.getActiveJar();
    const allJars = storage.getJars();

    if (activities.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.9rem;">
          No stars in "${activeJar ? escapeHtml(activeJar.name) : 'this jar'}" yet. Fold a new star to get started.
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
        if (act) openEditModal(act);
      });
    });

    container.querySelectorAll('.btn-delete-prompt').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const act = storage.getActivities().find(a => a.id === id);
        if (act && confirm(`Remove "${act.title}" from this jar?`)) {
          storage.removeActivity(id);
          refreshJarAndUI();
          showToast(`Removed "${act.title}" from jar.`);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // Move Activity Modal Handling
  // --------------------------------------------------------------------------
  function openMoveModal(activity) {
    moveActivityId.value = activity.id;
    moveModalPromptTitle.textContent = `Move "${activity.title}" to another Star Jar:`;
    
    const jars = storage.getJars();
    const currentJarId = storage.getActiveJarId();
    const targetJars = jars.filter(j => j.id !== currentJarId);

    moveJarsListContainer.innerHTML = targetJars.map(jar => `
      <button type="button" class="move-jar-option" data-target-jar-id="${jar.id}">
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          <strong style="font-size: 1rem;">${escapeHtml(jar.name)}</strong>
        </span>
        <span style="font-size: 0.78rem; color: var(--primary-accent);">
          ${(jar.activities || []).length} stars ➔
        </span>
      </button>
    `).join('');

    moveJarsListContainer.querySelectorAll('.move-jar-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.targetJarId;
        const targetJar = jars.find(j => j.id === targetId);
        if (targetId && targetJar) {
          storage.moveActivity(activity.id, currentJarId, targetId);
          refreshJarAndUI();
          closeMoveModal();
          triggerHaptic([30, 40]);
          showToast(`Moved "${activity.title}" to "${targetJar.name}".`);
        }
      });
    });

    moveModalOverlay.classList.add('active');
  }

  function closeMoveModal() {
    moveModalOverlay.classList.remove('active');
  }

  if (cancelMoveBtn) cancelMoveBtn.addEventListener('click', closeMoveModal);
  moveModalOverlay.addEventListener('click', (e) => {
    if (e.target === moveModalOverlay) closeMoveModal();
  });

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
    showToast(`Updated "${title}".`);
  });

  // --------------------------------------------------------------------------
  // History Drawer (Scoped per Jar + All Jars View)
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

  historyTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      historyTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHistoryScope = btn.dataset.historyScope || 'current';
      renderHistory();
    });
  });

  function renderHistory() {
    const container = document.getElementById('historyListContainer');
    const clearBtn = document.getElementById('clearHistoryBtn');
    const activeJar = storage.getActiveJar();
    const currentHist = storage.getHistory();
    const allHist = storage.getHistory('all');

    if (histCountCurrent) histCountCurrent.textContent = currentHist.length;
    if (histCountAll) histCountAll.textContent = allHist.length;

    const displayList = currentHistoryScope === 'all' ? allHist : currentHist;

    if (clearBtn) {
      clearBtn.textContent = currentHistoryScope === 'all'
        ? 'Clear History across All Jars'
        : `Clear History for ${activeJar ? activeJar.name : 'this Jar'}`;
    }

    if (displayList.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.9rem;">
          ${currentHistoryScope === 'all' 
            ? 'No completed activities recorded across any jars yet.' 
            : `No completed activities in "${activeJar ? escapeHtml(activeJar.name) : 'this jar'}" yet.`}
        </div>`;
      return;
    }

    container.innerHTML = displayList.map(item => {
      const date = new Date(item.completedAt);
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div class="history-item-title">${escapeHtml(item.title)}</div>
          <div class="history-item-meta">
            <span class="badge badge-${item.type}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">${item.type}</span>
            ${currentHistoryScope === 'all' ? `
              <span class="badge badge-jar" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">${escapeHtml(item.jarName || 'Jar')}</span>
            ` : ''}
            <span>${item.timeSpent}m • ${dateStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    const activeJar = storage.getActiveJar();
    const promptMsg = currentHistoryScope === 'all'
      ? 'Are you sure you want to clear activity history across ALL star jars?'
      : `Are you sure you want to clear history for "${activeJar ? activeJar.name : 'this jar'}"?`;

    if (confirm(promptMsg)) {
      storage.clearHistory(currentHistoryScope === 'all' ? 'all' : null);
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
    authSubmitBtn.textContent = isSignUpMode ? 'Creating Account...' : 'Logging In...';

    try {
      if (isSignUpMode) {
        await storage.registerUser(email, password, name);
        showToast(`Welcome, ${name || email}! Jars & account saved to cloud.`);
      } else {
        await storage.loginUser(email, password);
        showToast(`Welcome back! Jars synced across your devices.`);
      }
      refreshJarAndUI();
      authForm.reset();
      updateAccountUI();
    } catch (err) {
      const msg = err.message || 'Authentication error.';
      showToast(msg);
      if (!isSignUpMode && msg.toLowerCase().includes('no account found')) {
        isSignUpMode = true;
        authSubmitBtn.textContent = 'Sign Up';
        toggleAuthModeBtn.textContent = 'Already have an account? Log in';
        nameFieldGroup.style.display = 'block';
        setTimeout(() => {
          showToast('Tap "Sign Up" above to create your account with these credentials!');
        }, 1200);
      }
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
          showToast(`Cloud sync complete (${res.jarsCount || storage.getJars().length} jars).`);
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
});
