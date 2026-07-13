import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { mockApi } from '../services/mockApi';
import { apiService, checkIsDemoMode } from '../services/apiService';

interface User {
  id: number;
  username: string;
  email: string;
  emailVerified: boolean;
}

interface Preferences {
  theme: string;
  preferredLength: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  preferences: Preferences | null;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  toggleDemoMode: (val: boolean) => void;
  updatePreferences: (prefs: Preferences) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(checkIsDemoMode());
  const [preferences, setPreferences] = useState<Preferences | null>(null);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (isDemoMode) {
          const profile = await mockApi.getProfile();
          setUser(profile);
          const prefs = await mockApi.getPreferences();
          setPreferences(prefs);
        } else {
          // Fetch from live server
          const profileRes = await api.get('/api/users/profile');
          setUser(profileRes.data);
          const prefsRes = await api.get('/api/users/preferences');
          setPreferences(prefsRes.data);
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
        // On live connection failure, fallback to demo mode to keep UI interactive
        if (!isDemoMode) {
          console.warn("Live backend unreachable. Falling back to Demo Mode.");
          setIsDemoMode(true);
          apiService.setDemoMode(true);
          const profile = await mockApi.getProfile().catch(() => null);
          setUser(profile);
          const prefs = await mockApi.getPreferences().catch(() => null);
          setPreferences(prefs);
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isDemoMode]);

  const login = async (data: any) => {
    setLoading(true);
    try {
      if (isDemoMode) {
        const res = await mockApi.login(data);
        localStorage.setItem('token', res.token);
        setUser({ id: res.id, username: res.username, email: res.email, emailVerified: res.emailVerified });
        const prefs = await mockApi.getPreferences();
        setPreferences(prefs);
      } else {
        const res = await api.post('/api/auth/login', data);
        localStorage.setItem('token', res.data.token);
        setUser({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          emailVerified: res.data.emailVerified
        });
        const prefs = await api.get('/api/users/preferences');
        setPreferences(prefs.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: any) => {
    setLoading(true);
    try {
      if (isDemoMode) {
        const res = await mockApi.signup(data);
        localStorage.setItem('token', res.token);
        setUser({ id: res.id, username: res.username, email: res.email, emailVerified: res.emailVerified });
        const prefs = await mockApi.getPreferences();
        setPreferences(prefs);
      } else {
        await api.post('/api/auth/signup', data);
        // Trigger login automatically after sign up for seamless UX
        await login({ username: data.username, password: data.password });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPreferences(null);
  };

  const toggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    apiService.setDemoMode(val);
    // Reload components
    window.location.reload();
  };

  const updatePreferences = async (newPrefs: Preferences) => {
    try {
      if (isDemoMode) {
        const res = await mockApi.updatePreferences(newPrefs);
        setPreferences(res);
      } else {
        const res = await api.put('/api/users/preferences', newPrefs);
        setPreferences(res.data);
      }
    } catch (e) {
      console.error("Preferences update failed:", e);
      throw e;
    }
  };

  const verifyEmail = async (token: string) => {
    if (isDemoMode) {
      await mockApi.verifyEmail(token);
      if (user) setUser({ ...user, emailVerified: true });
    } else {
      await api.get(`/api/auth/verify?token=${token}`);
      if (user) setUser({ ...user, emailVerified: true });
    }
  };

  const forgotPassword = async (email: string) => {
    if (isDemoMode) {
      await mockApi.forgotPassword(email);
    } else {
      await api.post('/api/auth/forgot-password', { email });
    }
  };

  const resetPassword = async (data: any) => {
    if (isDemoMode) {
      await mockApi.resetPassword(data);
    } else {
      await api.post('/api/auth/reset-password', data);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemoMode,
      preferences,
      login,
      signup,
      logout,
      toggleDemoMode,
      updatePreferences,
      verifyEmail,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
