import api from './api';
import { mockApi, clientAnalyzePassword } from './mockApi';

// Helper to determine if we are in demo mode
export const checkIsDemoMode = (): boolean => {
  const saved = localStorage.getItem('isDemoMode');
  // Default to demo mode true so the app is instantly evaluatable
  if (saved === null) {
    localStorage.setItem('isDemoMode', 'true');
    return true;
  }
  return saved === 'true';
};

export const apiService = {
  // Theme and config
  isDemoMode() {
    return checkIsDemoMode();
  },

  setDemoMode(val: boolean) {
    localStorage.setItem('isDemoMode', val ? 'true' : 'false');
  },

  // Password analysis
  async analyzePassword(password: string): Promise<any> {
    if (checkIsDemoMode()) {
      const res = await clientAnalyzePassword(password);
      // Automatically save to local history in mock mode if user logged in
      const user = localStorage.getItem('mock_user');
      if (user) {
        await mockApi.addHistoryItem(res);
      }
      return res;
    } else {
      const response = await api.post('/api/password/analyze', { password });
      return response.data;
    }
  },

  async upgradePassword(password: string): Promise<any> {
    if (checkIsDemoMode()) {
      // Direct mock logic
      const result = await clientAnalyzePassword(password);
      const upgradedPass = password
        .replace(/a/gi, '@')
        .replace(/o/gi, '0')
        .replace(/e/gi, '3')
        .replace(/i/gi, '1')
        .replace(/s/gi, '$');
      
      const finalUpgraded = upgradedPass.length < 12 ? upgradedPass + '#2026!' : upgradedPass + '!';
      const upgradedResult = await clientAnalyzePassword(finalUpgraded);

      return {
        originalPassword: password,
        upgradedPassword: finalUpgraded,
        originalScore: result.score,
        upgradedScore: upgradedResult.score,
        explanation: "Capitalized characters, made leetspeak substitutions (e.g. 'a' -> '@', 's' -> '$'), and appended security symbol blocks ('#2026!') to boost complexity and password length."
      };
    } else {
      const response = await api.post('/api/password/upgrade', { password });
      return response.data;
    }
  },

  async generatePassword(options: any): Promise<string> {
    if (checkIsDemoMode()) {
      // Local implementation
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const nums = "0123456789";
      const syms = "!@#$%^&*()_+-=[]{}|;:',.<>/?";
      const similar = "lI1oO0s5S2Z";

      let filter = (src: string) => {
        if (!options.excludeSimilar && !options.easyToRead) return src;
        return src.split('').filter(c => !similar.includes(c)).join('');
      };

      let activeLower = filter(lower);
      let activeUpper = filter(upper);
      let activeNums = filter(nums);
      let activeSyms = options.easyToType ? "!@#$%^&*()_+-=" : filter(syms);

      let pool = "";
      const required: string[] = [];

      if (options.includeLowercase) {
        pool += activeLower;
        required.push(activeLower[Math.floor(Math.random() * activeLower.length)]);
      }
      if (options.includeUppercase) {
        pool += activeUpper;
        required.push(activeUpper[Math.floor(Math.random() * activeUpper.length)]);
      }
      if (options.includeNumbers) {
        pool += activeNums;
        required.push(activeNums[Math.floor(Math.random() * activeNums.length)]);
      }
      if (options.includeSymbols) {
        pool += activeSyms;
        required.push(activeSyms[Math.floor(Math.random() * activeSyms.length)]);
      }

      if (pool.length === 0) pool = activeLower + activeNums;

      let pass: string[] = [...required];
      while (pass.length < options.length) {
        pass.push(pool[Math.floor(Math.random() * pool.length)]);
      }

      // Shuffle
      pass = pass.sort(() => Math.random() - 0.5);
      return pass.join('');
    } else {
      const response = await api.post('/api/password/suggest', options);
      return response.data.message;
    }
  },

  // Password History
  async getHistory(): Promise<any[]> {
    if (checkIsDemoMode()) {
      return mockApi.getHistory();
    } else {
      const response = await api.get('/api/history');
      return response.data;
    }
  },

  async searchHistory(q: string): Promise<any[]> {
    if (checkIsDemoMode()) {
      return mockApi.searchHistory(q);
    } else {
      const response = await api.get(`/api/history/search?q=${encodeURIComponent(q)}`);
      return response.data;
    }
  },

  async clearHistory(): Promise<any> {
    if (checkIsDemoMode()) {
      return mockApi.clearHistory();
    } else {
      const response = await api.delete('/api/history/clear');
      return response.data;
    }
  },

  // Saved passwords vault
  async getSavedPasswords(): Promise<any[]> {
    if (checkIsDemoMode()) {
      return mockApi.getSavedPasswords();
    } else {
      const response = await api.get('/api/saved-passwords');
      return response.data;
    }
  },

  async savePassword(data: any): Promise<any> {
    if (checkIsDemoMode()) {
      return mockApi.savePassword(data);
    } else {
      const response = await api.post('/api/saved-passwords', data);
      return response.data;
    }
  },

  async deleteSavedPassword(id: number): Promise<any> {
    if (checkIsDemoMode()) {
      return mockApi.deleteSavedPassword(id);
    } else {
      const response = await api.delete(`/api/saved-passwords/${id}`);
      return response.data;
    }
  },

  async searchSavedPasswords(q: string): Promise<any[]> {
    if (checkIsDemoMode()) {
      return mockApi.searchSavedPasswords(q);
    } else {
      const response = await api.get(`/api/saved-passwords/search?q=${encodeURIComponent(q)}`);
      return response.data;
    }
  },

  // Dashboard metrics
  async getDashboardMetrics(): Promise<any> {
    if (checkIsDemoMode()) {
      return mockApi.getDashboardMetrics();
    } else {
      const response = await api.get('/api/dashboard/metrics');
      return response.data;
    }
  },

  // Quizzes
  async getQuizHistory(): Promise<any[]> {
    if (checkIsDemoMode()) {
      return mockApi.getQuizHistory();
    } else {
      const response = await api.get('/api/quiz/history');
      return response.data;
    }
  },

  async submitQuizScore(data: any): Promise<any> {
    if (checkIsDemoMode()) {
      return mockApi.submitQuizScore(data);
    } else {
      const response = await api.post('/api/quiz/submit', data);
      return response.data;
    }
  }
};
