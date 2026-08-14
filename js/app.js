// StarJar — Bundled App (Safari & Cross-Platform Compatible)
/**
 * storage.js
 * Manages local storage persistence, multi-jar creation, custom jar naming,
 * jar-specific activities and completion histories, user authentication state,
 * intelligent cross-device merging, and cloud sync hooks with offline/file-protocol resilience.
 */

const STORAGE_KEYS = {
  ACTIVITIES: 'starjar_activities',
  HISTORY: 'starjar_history',
  JARS: 'starjar_jars',
  ACTIVE_JAR_ID: 'starjar_active_jar_id',
  USER: 'starjar_user',
  ACCOUNTS: 'starjar_accounts_db',
  LAST_SYNCED: 'starjar_last_synced'
};

// Starter Templates for instant jar creation
const JAR_TEMPLATES = {
  creative: {
    name: 'Creative & Art Studio',
    description: 'Spark your imagination with artistic experiments, sketches, and writing prompts.',
    icon: '',
    theme: 'pink',
    activities: [
      { id: 't-cr-1', title: 'Sketch a cozy dream room in 1-point perspective', link: 'https://www.youtube.com/results?search_query=perspective+room+sketching', time: 15, type: 'creative', color: 'star_pink.png' },
      { id: 't-cr-2', title: 'Write a whimsical 50-word micro poem', link: 'https://poets.org', time: 5, type: 'creative', color: 'star_yellow.png' },
      { id: 't-cr-3', title: 'Design a cute sticker concept on paper or tablet', link: 'https://pinterest.com', time: 30, type: 'creative', color: 'star_purple.png' },
      { id: 't-cr-4', title: 'Watercolor or digital gradient abstract splash', link: 'https://youtube.com', time: 20, type: 'creative', color: 'star_teal.png' },
      { id: 't-cr-5', title: 'Create a mood board for your ideal season', link: 'https://pinterest.com', time: 15, type: 'creative', color: 'star_lavender.png' },
      { id: 't-cr-6', title: 'Fold 3 physical origami lucky paper stars', link: 'https://youtube.com', time: 10, type: 'creative', color: 'star_blue.png' }
    ]
  },
  selfcare: {
    name: 'Self-Care & Mindfulness',
    description: 'Nourish your mind and body with calming rituals, gentle movement, and rest.',
    icon: '',
    theme: 'teal',
    activities: [
      { id: 't-sc-1', title: '5-minute deep 4-7-8 breathing meditation', link: '', time: 5, type: 'both', color: 'star_teal.png' },
      { id: 't-sc-2', title: 'Brew a calming cup of chamomile or herbal tea screen-free', link: '', time: 10, type: 'fun', color: 'star_yellow.png' },
      { id: 't-sc-3', title: 'Write down 3 specific things you appreciate today', link: '', time: 5, type: 'creative', color: 'star_pink.png' },
      { id: 't-sc-4', title: '15-minute gentle full-body stretch & tension release', link: 'https://youtube.com', time: 15, type: 'productive', color: 'star_lavender.png' },
      { id: 't-sc-5', title: 'Step outside for a 15-minute fresh air mindful walk', link: '', time: 15, type: 'both', color: 'star_green.png' },
      { id: 't-sc-6', title: 'Put on a soothing playlist and rest your eyes in silence', link: 'https://spotify.com', time: 10, type: 'fun', color: 'star_blue.png' }
    ]
  },
  productivity: {
    name: 'Focus & Productivity',
    description: 'Quick wins and high-impact administrative resets to declutter your space and mind.',
    icon: '',
    theme: 'blue',
    activities: [
      { id: 't-pr-1', title: 'Clear and wipe down your workspace surface', link: '', time: 10, type: 'productive', color: 'star_blue.png' },
      { id: 't-pr-2', title: 'Delete 25 unwanted emails & clear notifications', link: '', time: 10, type: 'productive', color: 'star_teal.png' },
      { id: 't-pr-3', title: '25-minute Pomodoro focus sprint on your top priority task', link: '', time: 30, type: 'productive', color: 'star_purple.png' },
      { id: 't-pr-4', title: 'Organize digital downloads and browser bookmarks', link: '', time: 15, type: 'productive', color: 'star_yellow.png' },
      { id: 't-pr-5', title: 'Plan and write your top 3 goals for tomorrow', link: '', time: 5, type: 'productive', color: 'star_pink.png' },
      { id: 't-pr-6', title: 'Drink a tall glass of water and do 10 posture resets', link: '', time: 5, type: 'both', color: 'star_lavender.png' }
    ]
  },
  datenight: {
    name: 'Date Night & Connections',
    description: 'Memorable, fun activities and bonding ideas for couples, friends, and loved ones.',
    icon: '',
    theme: 'pink',
    activities: [
      { id: 't-dn-1', title: 'Bake a batch of warm homemade cookies together', link: 'https://allrecipes.com', time: 45, type: 'fun', color: 'star_pink.png' },
      { id: 't-dn-2', title: 'Watch a nostalgic movie or cozy indie film', link: '', time: 90, type: 'fun', color: 'star_purple.png' },
      { id: 't-dn-3', title: 'Play a head-to-head card game or tabletop board game', link: '', time: 30, type: 'fun', color: 'star_yellow.png' },
      { id: 't-dn-4', title: 'Go sunset watching or stargazing with hot cocoa', link: '', time: 30, type: 'both', color: 'star_lavender.png' },
      { id: 't-dn-5', title: 'Cook a brand-new foreign cuisine recipe from scratch', link: 'https://youtube.com', time: 60, type: 'creative', color: 'star_teal.png' },
      { id: 't-dn-6', title: 'Create a shared travel and adventure bucket list', link: '', time: 20, type: 'creative', color: 'star_blue.png' }
    ]
  },
  adventure: {
    name: 'Fun & Boredom Busters',
    description: 'Exciting, spontaneous ideas when you are bored and looking for something new.',
    icon: '',
    theme: 'yellow',
    activities: [
      { id: 't-av-1', title: 'Listen to a critically acclaimed music album from a genre you never explore', link: 'https://spotify.com', time: 40, type: 'fun', color: 'star_yellow.png' },
      { id: 't-av-2', title: 'Learn 5 practical conversational phrases in a new language', link: 'https://duolingo.com', time: 10, type: 'both', color: 'star_teal.png' },
      { id: 't-av-3', title: 'Build a super cozy living room blanket & pillow fort', link: '', time: 20, type: 'fun', color: 'star_pink.png' },
      { id: 't-av-4', title: 'Go on a 15-minute neighborhood photo scavenger hunt', link: '', time: 15, type: 'creative', color: 'star_blue.png' },
      { id: 't-av-5', title: 'Make a personalized upbeat playlist for a good friend', link: 'https://spotify.com', time: 15, type: 'fun', color: 'star_purple.png' },
      { id: 't-av-6', title: 'Try an intriguing mystery YouTube documentary rabbit hole', link: 'https://youtube.com', time: 25, type: 'fun', color: 'star_lavender.png' }
    ]
  },
  blank: {
    name: 'Custom Jar',
    description: 'A brand new empty jar ready for your own custom inspiration and activities.',
    icon: '',
    theme: 'purple',
    activities: []
  }
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

  getApiBase() {
    if (typeof window === 'undefined') return '';
    if (window.location.protocol === 'file:' || !window.location.host) {
      return 'http://localhost:8000';
    }
    return '';
  }

  initStorage() {
    let legacyActivities = null;
    let legacyHistory = null;
    try {
      const actData = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (actData) legacyActivities = JSON.parse(actData);
    } catch (e) { console.error('Error reading legacy activities', e); }

    try {
      const histData = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (histData) legacyHistory = JSON.parse(histData);
    } catch (e) { console.error('Error reading legacy history', e); }

    let jars = null;
    try {
      const jarsData = localStorage.getItem(STORAGE_KEYS.JARS);
      if (jarsData) jars = JSON.parse(jarsData);
    } catch (e) { console.error('Error reading jars', e); }

    if (!Array.isArray(jars) || jars.length === 0) {
      const initialActivities = (Array.isArray(legacyActivities) && legacyActivities.length > 0)
        ? legacyActivities
        : DEFAULT_ACTIVITIES;
      const initialHistory = Array.isArray(legacyHistory) ? legacyHistory : [];

      const defaultJar = {
        id: 'jar-default',
        name: 'Main Star Jar',
        description: 'Creative, productive, and mindful activities',
        icon: '',
        theme: 'purple',
        activities: initialActivities,
        history: initialHistory,
        createdAt: new Date().toISOString(),
        isDefault: true
      };

      jars = [defaultJar];
      localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(jars));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JAR_ID, defaultJar.id);
    }

    let activeJarId = localStorage.getItem(STORAGE_KEYS.ACTIVE_JAR_ID);
    if (!activeJarId || !jars.some(j => j.id === activeJarId)) {
      activeJarId = jars[0].id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JAR_ID, activeJarId);
    }

    this.syncLegacyMirrors();

    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    }
  }

  syncLegacyMirrors() {
    const activeJar = this.getActiveJar();
    if (activeJar) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activeJar.activities || []));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(activeJar.history || []));
    }
  }

  getJars() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JARS);
      const jars = data ? JSON.parse(data) : [];
      return Array.isArray(jars) && jars.length > 0 ? jars : [];
    } catch (e) {
      console.error('Failed to load jars', e);
      return [];
    }
  }

  saveJars(jars) {
    localStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(jars));
    this.syncLegacyMirrors();
    this.triggerSync();
  }

  getActiveJarId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_JAR_ID) || (this.getJars()[0] ? this.getJars()[0].id : 'jar-default');
  }

  getActiveJar() {
    const jars = this.getJars();
    const activeId = this.getActiveJarId();
    return jars.find(j => j.id === activeId) || jars[0] || null;
  }

  setActiveJar(jarId) {
    const jars = this.getJars();
    const exists = jars.some(j => j.id === jarId);
    if (exists) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JAR_ID, jarId);
      this.syncLegacyMirrors();
      this.notifySyncListeners();
      this.triggerSync();
      return true;
    }
    return false;
  }

  createJar({ name, description = '', icon = '', theme = 'purple', template = 'blank' }) {
    const jars = this.getJars();
    const templateData = JAR_TEMPLATES[template] || JAR_TEMPLATES.blank;
    
    let starterActivities = [];
    if (templateData && templateData.activities && templateData.activities.length > 0) {
      starterActivities = templateData.activities.map((a, idx) => ({
        ...a,
        id: `act-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString()
      }));
    }

    const cleanName = (name || '').trim() || templateData.name || 'New Star Jar';
    const cleanDesc = (description || '').trim() || templateData.description || '';

    const newJar = {
      id: 'jar-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      name: cleanName,
      description: cleanDesc,
      icon: icon || '',
      theme: theme || templateData.theme || 'purple',
      activities: starterActivities,
      history: [],
      createdAt: new Date().toISOString(),
      isDefault: jars.length === 0
    };

    jars.push(newJar);
    this.saveJars(jars);
    this.setActiveJar(newJar.id);
    return newJar;
  }

  updateJar(jarId, updatedFields) {
    const jars = this.getJars();
    const idx = jars.findIndex(j => j.id === jarId);
    if (idx !== -1) {
      const allowed = ['name', 'description', 'icon', 'theme'];
      allowed.forEach(field => {
        if (updatedFields[field] !== undefined) {
          jars[idx][field] = updatedFields[field];
        }
      });
      this.saveJars(jars);
      this.notifySyncListeners();
      return jars[idx];
    }
    return null;
  }

  deleteJar(jarId) {
    const jars = this.getJars();
    if (jars.length <= 1) {
      throw new Error('You must keep at least one Star Jar.');
    }

    const remaining = jars.filter(j => j.id !== jarId);
    const activeId = this.getActiveJarId();

    let newActiveId = activeId;
    if (activeId === jarId) {
      newActiveId = remaining[0].id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JAR_ID, newActiveId);
    }

    this.saveJars(remaining);
    this.notifySyncListeners();
    return remaining;
  }

  getActivities(jarId = null) {
    const jars = this.getJars();
    const targetJarId = jarId || this.getActiveJarId();
    const jar = jars.find(j => j.id === targetJarId);
    return jar && Array.isArray(jar.activities) ? jar.activities : [];
  }

  saveActivities(activities, jarId = null) {
    const jars = this.getJars();
    const targetJarId = jarId || this.getActiveJarId();
    const idx = jars.findIndex(j => j.id === targetJarId);
    if (idx !== -1) {
      jars[idx].activities = activities;
      this.saveJars(jars);
    }
  }

  addActivity(activity, jarId = null) {
    const targetJarId = jarId || this.getActiveJarId();
    const activities = this.getActivities(targetJarId);
    activities.push(activity);
    this.saveActivities(activities, targetJarId);
    return activity;
  }

  updateActivity(id, updatedFields, jarId = null) {
    const targetJarId = jarId || this.getActiveJarId();
    const activities = this.getActivities(targetJarId);
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...updatedFields };
      this.saveActivities(activities, targetJarId);
      return activities[index];
    }
    return null;
  }

  removeActivity(id, jarId = null) {
    const targetJarId = jarId || this.getActiveJarId();
    const activities = this.getActivities(targetJarId).filter(a => a.id !== id);
    this.saveActivities(activities, targetJarId);
    return activities;
  }

  moveActivity(activityId, fromJarId, toJarId) {
    if (fromJarId === toJarId) return false;
    const jars = this.getJars();
    const fromJar = jars.find(j => j.id === fromJarId);
    const toJar = jars.find(j => j.id === toJarId);
    if (!fromJar || !toJar) return false;

    const actIndex = fromJar.activities.findIndex(a => a.id === activityId);
    if (actIndex === -1) return false;

    const [movedAct] = fromJar.activities.splice(actIndex, 1);
    toJar.activities.push(movedAct);
    this.saveJars(jars);
    this.notifySyncListeners();
    return true;
  }

  getHistory(jarId = null) {
    const jars = this.getJars();
    if (jarId === 'all') {
      const allHist = [];
      jars.forEach(jar => {
        (jar.history || []).forEach(entry => {
          allHist.push({
            ...entry,
            jarId: jar.id,
            jarName: jar.name,
            jarIcon: jar.icon || ''
          });
        });
      });
      return allHist.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
    }

    const targetJarId = jarId || this.getActiveJarId();
    const jar = jars.find(j => j.id === targetJarId);
    const hist = jar && Array.isArray(jar.history) ? jar.history : [];
    return hist.map(entry => ({
      ...entry,
      jarId: jar ? jar.id : targetJarId,
      jarName: jar ? jar.name : 'Star Jar',
      jarIcon: jar ? (jar.icon || '') : ''
    }));
  }

  logCompletion(activity, keptInJar = true, jarId = null) {
    const targetJarId = jarId || this.getActiveJarId();
    const activeJar = this.getActiveJar();
    const jars = this.getJars();
    const jar = jars.find(j => j.id === targetJarId) || activeJar;

    const entry = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      activityId: activity.id,
      title: activity.title,
      type: activity.type,
      timeSpent: activity.time,
      link: activity.link || '',
      keptInJar: keptInJar,
      jarId: targetJarId,
      jarName: jar ? jar.name : 'Main Star Jar',
      completedAt: new Date().toISOString()
    };

    if (jar) {
      if (!Array.isArray(jar.history)) jar.history = [];
      jar.history.unshift(entry);
      this.saveJars(jars);
    }
    return entry;
  }

  clearHistory(jarId = null) {
    const jars = this.getJars();
    if (jarId === 'all') {
      jars.forEach(j => { j.history = []; });
      this.saveJars(jars);
      return;
    }

    const targetJarId = jarId || this.getActiveJarId();
    const jar = jars.find(j => j.id === targetJarId);
    if (jar) {
      jar.history = [];
      this.saveJars(jars);
    }
  }

  isDefaultSampleList(list) {
    if (!Array.isArray(list) || list.length === 0) return true;
    if (list.length !== DEFAULT_ACTIVITIES.length) return false;
    return list.every((item, i) => item.id === DEFAULT_ACTIVITIES[i].id);
  }

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

  mergeJars(localJars, cloudJars) {
    if (!cloudJars || !Array.isArray(cloudJars) || cloudJars.length === 0) {
      return localJars || [];
    }
    if (!localJars || !Array.isArray(localJars) || localJars.length === 0) {
      return cloudJars;
    }

    const merged = [];
    const cloudMap = new Map(cloudJars.map(j => [j.id, j]));
    const cloudNameMap = new Map(cloudJars.map(j => [(j.name || '').trim().toLowerCase(), j]));

    for (const lJar of localJars) {
      const cleanName = (lJar.name || '').trim().toLowerCase();
      let matchedCloud = cloudMap.get(lJar.id) || cloudNameMap.get(cleanName);

      if (matchedCloud) {
        merged.push({
          ...matchedCloud,
          name: lJar.name || matchedCloud.name,
          description: lJar.description || matchedCloud.description,
          icon: lJar.icon || matchedCloud.icon || '',
          theme: lJar.theme || matchedCloud.theme,
          activities: this.mergeActivities(lJar.activities || [], matchedCloud.activities || []),
          history: this.mergeHistory(lJar.history || [], matchedCloud.history || [])
        });
        cloudMap.delete(matchedCloud.id);
        cloudNameMap.delete((matchedCloud.name || '').trim().toLowerCase());
      } else {
        merged.push(lJar);
      }
    }

    for (const cJar of cloudMap.values()) {
      merged.push(cJar);
    }

    return merged;
  }

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

  saveLocalAccount(user, password, jars = null) {
    const accounts = this.getRegisteredAccounts();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    const idx = accounts.findIndex(acc => (acc.email || '').toLowerCase() === cleanEmail);
    const currentJars = jars || user.jars || this.getJars();
    
    const accData = {
      id: user.id || 'usr-' + Date.now(),
      email: cleanEmail,
      password: password || (idx !== -1 ? accounts[idx].password : ''),
      name: user.name || cleanEmail.split('@')[0],
      createdAt: user.createdAt || new Date().toISOString(),
      jars: currentJars,
      activities: this.getActivities(),
      history: this.getHistory()
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
    const cleanPassword = password.trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const currentJars = this.getJars();
    const currentActivities = this.getActivities();
    const currentHistory = this.getHistory();
    let user = null;

    try {
      const res = await fetch(`${this.getApiBase()}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          name: cleanName,
          jars: currentJars,
          activities: currentActivities,
          history: currentHistory
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create account.');
      }
      user = data.user;
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        throw err;
      }
      // Fallback to local accounts database for offline / file:// usage
      const accounts = this.getRegisteredAccounts();
      if (accounts.some(a => (a.email || '').toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email already exists.');
      }
      user = {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        name: cleanName,
        jars: currentJars
      };
    }

    this.setCurrentUser({ ...user, password: cleanPassword });
    this.saveLocalAccount(user, cleanPassword, user.jars || currentJars);
    this.setLastSynced(Date.now());
    return user;
  }

  async loginUser(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const currentLocalJars = this.getJars();
    let user = null;
    let cloudJars = [];

    try {
      const res = await fetch(`${this.getApiBase()}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid email or password.');
      }
      user = data.user;
      cloudJars = user.jars || [];
    } catch (err) {
      if (err.message && (err.message.toLowerCase().includes('password') || err.message.toLowerCase().includes('invalid email'))) {
        throw err;
      }

      // Offline / file protocol fallback: check local registered accounts
      const accounts = this.getRegisteredAccounts();
      const localAcc = accounts.find(a => (a.email || '').toLowerCase() === cleanEmail);
      if (localAcc) {
        if (localAcc.password && localAcc.password !== cleanPassword) {
          throw new Error('Invalid email or password.');
        }
        user = {
          id: localAcc.id,
          email: localAcc.email,
          name: localAcc.name,
          jars: localAcc.jars || currentLocalJars
        };
        cloudJars = localAcc.jars || [];
      } else {
        if (err.message && err.message.toLowerCase().includes('no account found')) {
          throw err;
        }
        throw new Error('No account found with this email. Please click "Sign Up" below.');
      }
    }

    const mergedJars = this.mergeJars(currentLocalJars, cloudJars);

    this.saveJars(mergedJars);
    this.setCurrentUser({ ...user, password: cleanPassword });
    this.saveLocalAccount(user, cleanPassword, mergedJars);
    this.setLastSynced(Date.now());

    try {
      await this.triggerSync();
    } catch {}
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

    const jars = this.getJars();
    const activities = this.getActivities();
    const history = this.getHistory();

    this.saveLocalAccount(user, user.password, jars);

    try {
      const res = await fetch(`${this.getApiBase()}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          jars,
          activities,
          history
        })
      });
      if (res.ok) {
        this.setLastSynced(Date.now());
      }
    } catch (e) {
      // Graceful background sync catch
    }
  }

  async syncFromCloud() {
    const user = this.getCurrentUser();
    if (!user || !user.email) return { success: false, reason: 'not_logged_in' };

    try {
      const res = await fetch(`${this.getApiBase()}/api/user?email=${encodeURIComponent(user.email)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user data from cloud.');
      }
      const data = await res.json();
      if (data.user) {
        const cloudJars = data.user.jars || [];
        if (cloudJars.length > 0) {
          this.saveJars(cloudJars);
        }
        this.saveLocalAccount(data.user, user.password, cloudJars);
        this.setLastSynced(Date.now());
        this.notifySyncListeners();
        return { success: true, jarsCount: cloudJars.length };
      }
      return { success: false, reason: 'no_user_returned' };
    } catch (err) {
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
 * inside the glass activity jar with realistic dropping, stacking, and stationary resting physics.
 * Supports unlimited user prompts while keeping the visual jar display beautifully capped at 100 stars.
 */

const STAR_ASSETS = {
  creative: ['star_pink.png', 'star_red.png'],
  productive: ['star_blue.png', 'star_teal.png'],
  fun: ['star_yellow.png', 'star_green.png'],
  both: ['star_purple.png', 'star_lavender.png', 'star_white.png']
};

const MAX_VISUAL_STARS = 100;

class JarEngine {
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
    const effectiveCount = Math.min(count, MAX_VISUAL_STARS);
    const baseDim = Math.min(this.width * 0.068, this.height * 0.055);
    let scale = 1.0;

    if (effectiveCount > 75) scale = 0.58;
    else if (effectiveCount > 50) scale = 0.67;
    else if (effectiveCount > 35) scale = 0.75;
    else if (effectiveCount > 20) scale = 0.84;
    else if (effectiveCount > 10) scale = 0.92;

    return Math.max(11.5, Math.min(22, baseDim * scale));
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
      const t = (y - neckBottom) / (bodyTop + 40 - neckBottom);
      const ease = t * t * (3 - 2 * t);
      const left = neckLeft + (bodyLeft - neckLeft) * ease;
      const right = neckRight + (bodyRight - neckRight) * ease;
      minX = left + starRadius;
      maxX = right - starRadius;
    } else if (y <= bodyBottom - 30) {
      minX = bodyLeft + starRadius;
      maxX = bodyRight - starRadius;
    } else {
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
    const visualCount = Math.min(count, MAX_VISUAL_STARS);
    if (visualCount === 0) return [];

    const radius = this.getStarRadius(visualCount);
    const positions = [];
    const { bodyBottom } = this.jarBounds;

    const colSpacing = radius * 1.82;
    const rowSpacing = radius * 1.56;
    let currentY = bodyBottom - radius - 6;
    let starIndex = 0;

    while (positions.length < visualCount && currentY > this.jarBounds.neckTop) {
      const bounds = this.getJarBoundariesAtY(currentY, radius);
      const availableW = Math.max(colSpacing, bounds.maxX - bounds.minX);
      const maxInRow = Math.max(1, Math.floor(availableW / colSpacing));
      const countInRow = Math.min(maxInRow, visualCount - positions.length);

      const rowWidth = (countInRow - 1) * colSpacing;
      const startX = (bounds.minX + bounds.maxX - rowWidth) / 2;

      for (let col = 0; col < countInRow; col++) {
        const hash = (starIndex * 9301 + 49297) % 233280;
        const jitterX = ((hash % 9) - 4) * 0.5;
        const jitterY = (((hash >> 4) % 7) - 3) * 0.4;
        const jitterAngle = ((hash % 100) / 100) * Math.PI * 2;

        const posX = Math.max(bounds.minX + 1, Math.min(startX + col * colSpacing + jitterX, bounds.maxX - 1));
        const posY = Math.min(bounds.maxY - 1, currentY + jitterY);

        positions.push({
          x: posX,
          y: posY,
          angle: jitterAngle,
          radius: radius
        });
        starIndex++;
      }

      currentY -= rowSpacing;
    }

    return positions;
  }

  syncStarsWithActivities(activities, forceReset = false) {
    const visualActivities = activities.length > MAX_VISUAL_STARS
      ? activities.slice(activities.length - MAX_VISUAL_STARS)
      : activities;

    const currentActivityIds = new Set(visualActivities.map(a => a.id));
    this.stars = this.stars.filter(s => currentActivityIds.has(s.activityId));

    const existingMap = new Map(this.stars.map(s => [s.activityId, s]));
    const targetRadius = this.getStarRadius(visualActivities.length);
    const stationaryPositions = this.calculateStationaryPositions(visualActivities.length);

    const newStarsList = [];
    let hasActiveStar = false;

    visualActivities.forEach((act, index) => {
      const pos = stationaryPositions[index] || {
        x: this.width / 2,
        y: this.jarBounds.bodyBottom - targetRadius - 10,
        angle: 0,
        radius: targetRadius
      };

      if (existingMap.has(act.id)) {
        const s = existingMap.get(act.id);
        s.radius = targetRadius;
        if (forceReset) {
          s.x = pos.x;
          s.y = pos.y;
          s.angle = pos.angle;
          s.vx = 0;
          s.vy = 0;
          s.vAngle = 0;
          s.isSleeping = true;
        } else if (!s.isSleeping) {
          hasActiveStar = true;
        }
        newStarsList.push(s);
      } else {
        const imageName = act.color || this.getRandomImageForType(act.type);
        if (forceReset) {
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
        } else {
          // Drop new star with physics from top neck
          const startX = this.width / 2 + (Math.random() - 0.5) * 20;
          const startY = this.jarBounds.neckTop - 15;
          const star = {
            id: 'star-p-' + Math.random().toString(36).substr(2, 9),
            activityId: act.id,
            activity: act,
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
          newStarsList.push(star);
          hasActiveStar = true;
        }
      }
    });

    this.stars = newStarsList;
    if (hasActiveStar) {
      this.isSimulating = true;
    } else if (forceReset && !this.isShaking) {
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
    const nextCount = Math.min(this.stars.length + 1, MAX_VISUAL_STARS);
    const targetRadius = this.getStarRadius(nextCount);
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

      if (this.stars.length > MAX_VISUAL_STARS) {
        this.stars.shift();
      }

      this.stars.forEach(s => {
        s.isSleeping = false;
        s.radius = targetRadius;
      });
      this.isSimulating = true;
    } else {
      const posIndex = Math.min(this.stars.length, MAX_VISUAL_STARS - 1);
      const stationaryPositions = this.calculateStationaryPositions(nextCount);
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

      if (this.stars.length > MAX_VISUAL_STARS) {
        this.stars.shift();
      }
    }
  }

  shake(durationMs = 1200) {
    this.isShaking = true;
    this.isSimulating = true;
    this.shakeIntensity = 1.0;

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

    const SUB_STEPS = 6;
    for (let step = 0; step < SUB_STEPS; step++) {
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

            s1.x -= nx * overlap;
            s1.y -= ny * overlap;
            s2.x += nx * overlap;
            s2.y += ny * overlap;

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

            if (!s1.isSleeping && s2.isSleeping) s2.isSleeping = false;
            if (!s2.isSleeping && s1.isSleeping) s1.isSleeping = false;
          }
        }
      }

      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        const bounds = this.getJarBoundariesAtY(s.y, s.radius);

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

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(bodyLeft + 12, bodyTop + 55);
    this.ctx.lineTo(bodyLeft + 12, bodyBottom - 45);
    this.ctx.stroke();

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

    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.translate(star.x, star.y);
      this.ctx.rotate(star.angle);

      const img = this.images[star.imageName];
      const size = star.radius * 2;

      if (img && img.complete) {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowOffsetY = 3;
        this.ctx.drawImage(img, -star.radius, -star.radius, size, size);
      } else {
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
 * Application Controller
 */
document.addEventListener('DOMContentLoaded', () => {
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
  let currentHistoryScope = 'current';
  let selectedJarTemplate = 'blank';
  let isEditingJar = false;

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

  // Jars Management Drawer & Switcher
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

    jarsListContainer.querySelectorAll('.btn-edit-jar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const jar = storage.getJars().find(j => j.id === btn.dataset.jarId);
        if (jar) openEditJarModal(jar);
      });
    });

    jarsListContainer.querySelectorAll('.btn-delete-jar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const jar = storage.getJars().find(j => j.id === btn.dataset.jarId);
        if (jar && confirm(`Are you sure you want to delete "${jar.name}" and all of its folded stars and history?`)) {
          storage.deleteJar(jar.id);
          refreshJarAndUI(true);
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

  // Create / Edit Jar Modal Handling
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

  // Mobile Bottom Navigation Tabs
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

  // Mobile Add Star Modal
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

  // Desktop Add Activity Form
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

  // Draw Activity Controls
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

  // Mobile Shake Sensor & Motion Suppression System
  let lastX = null, lastY = null, lastZ = null;
  let lastDeltaX = 0, lastDeltaY = 0, lastDeltaZ = 0;
  let accumulatedMotion = 0;
  let lastDrawTime = 0;
  let motionPermissionGranted = false;
  let motionSuppressedUntil = 0;
  let reversalCount = 0;
  let lastReversalTime = 0;

  // Calibrated for responsive gentle wrist shake with strict UI touch suppression
  const MIN_DELTA_NOISE_GATE = 1.2;        // Highly responsive to gentle wrist motion
  const MOTION_TRIGGER_ENERGY = 2.8;       // Sensitive threshold: quick gentle shake
  const MOTION_DECAY = 0.92;               // Smooth energy accumulation across frames
  const REVERSAL_THRESHOLD = 0.8;          // Sensitive directional change threshold
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
      if (accumulatedMotion < 0.15) accumulatedMotion = 0;
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

  // Task Details Modal
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

  // Task Completion & Resolution
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

  // All Prompts Drawer & Management
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

  // Move Activity Modal Handling
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

  // Edit Prompt Modal Handling
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

  // History Drawer
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

  // Account & Cloud Sync Drawer
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
        showToast(`Welcome, ${name || email}! Jars & account saved.`);
      } else {
        await storage.loginUser(email, password);
        showToast(`Welcome back! Jars synced successfully.`);
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
          showToast(`Sync complete (${res.jarsCount || storage.getJars().length} jars).`);
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

  storage.addSyncListener(() => {
    refreshJarAndUI();
    updateAccountUI();
  });

  storage.syncFromCloud().then((res) => {
    if (res && res.success) {
      refreshJarAndUI();
      updateAccountUI();
    }
  }).catch(() => {});

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
