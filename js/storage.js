/**
 * storage.js
 * Manages local storage persistence, activity items, completion history,
 * user authentication state, intelligent cross-device merging, and cloud sync hooks.
 */

export const STORAGE_KEYS = {
  ACTIVITIES: 'starjar_activities',
  HISTORY: 'starjar_history',
  USER: 'starjar_user',
  ACCOUNTS: 'starjar_accounts_db',
  LAST_SYNCED: 'starjar_last_synced'
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
