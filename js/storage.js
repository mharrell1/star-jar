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

export class StorageService {
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
