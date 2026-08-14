/**
 * storage.js
 * Manages local storage persistence, multi-jar creation, custom jar naming,
 * jar-specific activities and completion histories, user authentication state,
 * intelligent cross-device merging, and cloud sync hooks with offline/file-protocol resilience.
 */

export const STORAGE_KEYS = {
  ACTIVITIES: 'starjar_activities',
  HISTORY: 'starjar_history',
  JARS: 'starjar_jars',
  ACTIVE_JAR_ID: 'starjar_active_jar_id',
  USER: 'starjar_user',
  ACCOUNTS: 'starjar_accounts_db',
  LAST_SYNCED: 'starjar_last_synced'
};

// Starter Templates for instant jar creation
export const JAR_TEMPLATES = {
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
export const DEFAULT_ACTIVITIES = [
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

export class StorageService {
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
