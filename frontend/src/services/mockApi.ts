import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

const zxcvbnObj = new ZxcvbnFactory(options);
const zxcvbn = (password: string) => zxcvbnObj.check(password);

// Helper to simulate network latency
export const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

// Simple SHA-1 hash for HIBP simulation or real range query from client
async function getSha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Zero-trust Have I Been Pwned check from client
export async function clientCheckBreaches(password: string): Promise<{ pwned: boolean; breachCount: number }> {
  try {
    const sha1 = await getSha1(password);
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return { pwned: false, breachCount: 0 };
    
    const text = await response.text();
    const lines = text.split('\n');
    for (const line of lines) {
      const [returnedSuffix, count] = line.trim().split(':');
      if (returnedSuffix.toUpperCase() === suffix) {
        return { pwned: true, breachCount: parseInt(count, 10) };
      }
    }
  } catch (error) {
    console.error("HIBP client-side request failed:", error);
  }
  return { pwned: false, breachCount: 0 };
}

// Real-time strength analyzer in TypeScript
export async function clientAnalyzePassword(password: string): Promise<any> {
  const result = zxcvbn(password);
  
  // Custom score 0 to 100
  let score = result.score * 25; // 0, 25, 50, 75, 100 base
  if (password.length > 0 && score === 0) score = 10; // offset

  // Let's add refinement factors based on actual length and sets
  let uppercase = 0, lowercase = 0, numbers = 0, symbols = 0;
  for (const c of password.split('')) {
    if (/[a-z]/.test(c)) lowercase++;
    else if (/[A-Z]/.test(c)) uppercase++;
    else if (/[0-9]/.test(c)) numbers++;
    else symbols++;
  }

  let poolSize = 0;
  if (lowercase > 0) poolSize += 26;
  if (uppercase > 0) poolSize += 26;
  if (numbers > 0) poolSize += 10;
  if (symbols > 0) poolSize += 32;
  if (poolSize === 0) poolSize = 1;

  const entropy = password.length * (Math.log(poolSize) / Math.log(2));

  // Dynamic suggestions
  const suggestions = result.feedback.suggestions.length > 0 
    ? [...result.feedback.suggestions] 
    : [];
    
  if (password.length < 12) {
    suggestions.push("Increase length to at least 12-16 characters.");
  }
  if (uppercase === 0) suggestions.push("Add uppercase letters (A-Z).");
  if (lowercase === 0) suggestions.push("Add lowercase letters (a-z).");
  if (numbers === 0) suggestions.push("Add numbers (0-9).");
  if (symbols === 0) suggestions.push("Add special characters (e.g. @, #, $, !).");
  
  if (suggestions.length === 0) {
    suggestions.push("Excellent choice! This is an extremely secure password.");
  }

  const { pwned, breachCount } = await clientCheckBreaches(password);

  let grade = "Weak";
  if (score >= 90) grade = "Excellent";
  else if (score >= 75) grade = "Strong";
  else if (score >= 50) grade = "Good";
  else if (score >= 25) grade = "Fair";

  // Friendly crack time formatting
  const offlineCrackTime = result.crackTimes.offlineFastHashingXPerSecond.display;

  return {
    score,
    entropy: Math.round(entropy * 100) / 100,
    grade,
    crackTimeEstimated: offlineCrackTime,
    crackTimeSeconds: result.crackTimes.offlineFastHashingXPerSecond.seconds,
    characterCount: password.length,
    uppercaseCount: uppercase,
    lowercaseCount: lowercase,
    numbersCount: numbers,
    specialCount: symbols,
    suggestions,
    pwned,
    breachCount
  };
}

// Local storage mocks
const STORAGE_KEYS = {
  USER: 'mock_user',
  HISTORY: 'mock_history',
  SAVED_PASSWORDS: 'mock_saved_passwords',
  QUIZZES: 'mock_quizzes',
  PREFS: 'mock_preferences'
};

export const mockApi = {
  // Auth endpoints
  async signup(data: any) {
    await delay();
    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
    const user = { id: 1, username: data.username, email: data.email, emailVerified: false };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem('token', token);
    
    // Create default preferences
    const defaultPrefs = {
      theme: 'dark',
      preferredLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false
    };
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(defaultPrefs));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAVED_PASSWORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify([]));

    return { token, ...user };
  },

  async login(data: any) {
    await delay();
    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null') || {
      id: 1,
      username: data.username,
      email: data.username + '@securepass.ai',
      emailVerified: true
    };
    localStorage.setItem('token', token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { token, ...user };
  },

  async verifyEmail(_tokenStr: string) {
    await delay();
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    if (user) {
      user.emailVerified = true;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return { message: "Email verified successfully" };
  },

  async forgotPassword(_email: string) {
    await delay();
    return { message: "Reset code generated in console log: mock_reset_token" };
  },

  async resetPassword(_data: any) {
    await delay();
    return { message: "Password updated successfully" };
  },

  // Users preferences & profile
  async getProfile() {
    await delay(100);
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
    if (!user) throw new Error("Unauthorized");
    return user;
  },

  async getPreferences() {
    await delay(100);
    const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFS) || 'null');
    return prefs || {
      theme: 'dark',
      preferredLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false
    };
  },

  async updatePreferences(prefs: any) {
    await delay(100);
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
    return prefs;
  },

  // Password History
  async getHistory() {
    await delay(200);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  },

  async searchHistory(query: string) {
    await delay(100);
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    return history.filter((h: any) => 
      h.grade.toLowerCase().includes(query.toLowerCase()) || 
      h.crackTimeEstimated.toLowerCase().includes(query.toLowerCase())
    );
  },

  async clearHistory() {
    await delay(200);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    return [];
  },

  async addHistoryItem(analysis: any) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    const newItem = {
      id: Date.now(),
      score: analysis.score,
      entropy: analysis.entropy,
      grade: analysis.grade,
      crackTimeEstimated: analysis.crackTimeEstimated,
      crackTimeSeconds: analysis.crackTimeSeconds,
      characterCount: analysis.characterCount,
      uppercaseCount: analysis.uppercaseCount,
      lowercaseCount: analysis.lowercaseCount,
      numbersCount: analysis.numbersCount,
      specialCount: analysis.specialCount,
      analyzedAt: new Date().toISOString()
    };
    history.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  // Saved Passwords (Vault)
  async getSavedPasswords() {
    await delay(200);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PASSWORDS) || '[]');
  },

  async savePassword(data: any) {
    await delay(300);
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PASSWORDS) || '[]');
    const newItem = {
      id: Date.now(),
      label: data.label,
      decryptedPassword: data.password,
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.SAVED_PASSWORDS, JSON.stringify(list));
    return newItem;
  },

  async deleteSavedPassword(id: number) {
    await delay(200);
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PASSWORDS) || '[]');
    const filtered = list.filter((item: any) => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_PASSWORDS, JSON.stringify(filtered));
  },

  async searchSavedPasswords(query: string) {
    await delay(100);
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PASSWORDS) || '[]');
    return list.filter((item: any) => item.label.toLowerCase().includes(query.toLowerCase()));
  },

  // Dashboard Metrics
  async getDashboardMetrics() {
    await delay(300);
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    const quizzes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || '[]');
    
    const totalChecked = history.length;
    let averageScore = 0;
    let weakCount = 0;
    let strongCount = 0;

    if (totalChecked > 0) {
      const sum = history.reduce((acc: number, cur: any) => acc + cur.score, 0);
      averageScore = sum / totalChecked;
      weakCount = history.filter((h: any) => h.score < 40).length;
      strongCount = history.filter((h: any) => h.score >= 80).length;
    }

    // Trend points
    const trend = history.slice(0, 10).reverse().map((h: any) => ({
      date: h.analyzedAt,
      score: h.score
    }));

    const badges = quizzes
      .map((q: any) => q.badgeEarned)
      .filter((b: any) => b && b.trim() !== '');
    
    // Deduplicate
    const uniqueBadges = Array.from(new Set(badges));

    return {
      averagePasswordScore: Math.round(averageScore * 10) / 10,
      totalPasswordsChecked: totalChecked,
      weakPasswordCount: weakCount,
      strongPasswordCount: strongCount,
      securityImprovementTrend: trend,
      badgesEarned: uniqueBadges
    };
  },

  // Quizzes & badges
  async getQuizHistory() {
    await delay(200);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || '[]');
  },

  async submitQuizScore(data: any) {
    await delay(300);
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZZES) || '[]');
    
    let badge = data.badgeEarned;
    if (!badge) {
      const pct = data.score / data.totalQuestions;
      if (pct >= 1.0) badge = "RootMaster";
      else if (pct >= 0.9) badge = "CyberSentry";
      else if (pct >= 0.8) badge = "PassShield";
      else if (pct >= 0.6) badge = "CryptoNovice";
    }

    const newItem = {
      id: Date.now(),
      score: data.score,
      totalQuestions: data.totalQuestions,
      badgeEarned: badge,
      completedAt: new Date().toISOString()
    };
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(list));
    return newItem;
  }
};
