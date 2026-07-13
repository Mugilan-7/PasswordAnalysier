import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, Settings, Database, ShieldAlert, CheckCircle, 
  Trash2, Mail, Terminal, ToggleLeft, ToggleRight 
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { apiService } from '../services/apiService';

export const ProfilePage: React.FC = () => {
  const { user, preferences, updatePreferences, logout, isDemoMode, toggleDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings states
  const [preferredLength, setPreferredLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state on preferences fetch
  useEffect(() => {
    if (preferences) {
      setPreferredLength(preferences.preferredLength);
      setIncludeUppercase(preferences.includeUppercase);
      setIncludeLowercase(preferences.includeLowercase);
      setIncludeNumbers(preferences.includeNumbers);
      setIncludeSymbols(preferences.includeSymbols);
      setExcludeSimilar(preferences.excludeSimilar);
    }
  }, [preferences]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updatePreferences({
        theme,
        preferredLength,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeSimilar
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to delete all password audit histories? This cannot be undone.")) return;
    try {
      await apiService.clearHistory();
      alert("Audit history has been wiped clean.");
    } catch (e) {
      console.error(e);
    }
  };


  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold font-cyber text-slate-100">Access Restricted</h2>
        <p className="text-slate-400 text-sm">
          Please log in or register a developer session to manage user preferences and profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="border-b border-slate-900 pb-4">
        <h1 className="text-3xl font-extrabold tracking-wider font-cyber bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          ACCOUNT SETTINGS
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-cyber mt-1">
          Identity Profile & System Configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Account Profile details */}
        <div className="space-y-6">
          <GlassCard className="text-center p-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h3 className="text-lg font-bold font-cyber text-slate-100 uppercase">{user.username}</h3>
            <span className="text-[10px] text-slate-500 font-cyber font-mono">{user.email}</span>

            <div className="mt-4 w-full border-t border-slate-900/60 pt-4 text-xs text-left space-y-3 font-cyber">
              <div className="flex justify-between">
                <span className="text-slate-500">Verification Posture:</span>
                {user.emailVerified ? (
                  <span className="text-emerald-400 font-bold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 animate-pulse" />
                    Pending
                  </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Key ID:</span>
                <span className="text-slate-400 font-mono">USR-{user.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </GlassCard>

          {/* Connection Mode Settings */}
          <GlassCard variant="cyber">
            <h3 className="text-sm font-bold font-cyber text-slate-200 mb-4 flex items-center">
              <Database className="w-4 h-4 mr-2 text-cyber-green" />
              API Connection Mode
            </h3>
            
            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed font-cyber">
                SecurePass AI features a local simulated sandbox environment alongside live database integration.
              </p>
              
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                <div>
                  <span className="text-xs font-bold font-cyber text-slate-200 block">
                    {isDemoMode ? 'Mock Sandbox Mode' : 'Live REST API'}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-cyber block mt-0.5">
                    {isDemoMode ? 'Running in-browser db' : 'Connected to port 8080'}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleDemoMode(!isDemoMode)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                  title="Switch modes"
                >
                  {isDemoMode ? (
                    <ToggleLeft className="w-9 h-9 text-slate-500" />
                  ) : (
                    <ToggleRight className="w-9 h-9 text-blue-400" />
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Preferences config & Actions */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-md font-bold font-cyber text-slate-300 mb-6 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-cyber-green" />
              Password Generator Defaults
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-6 font-cyber text-xs">
              
              {/* Length selection */}
              <div>
                <div className="flex justify-between text-slate-400 mb-2">
                  <span>DEFAULT LENGTH:</span>
                  <span className="text-cyber-green font-bold">{preferredLength} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={preferredLength}
                  onChange={(e) => setPreferredLength(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Checkbox matrices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 bg-slate-950/60 p-3 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Include Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center space-x-3 bg-slate-950/60 p-3 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Include Lowercase (a-z)</span>
                </label>

                <label className="flex items-center space-x-3 bg-slate-950/60 p-3 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Include Numbers (0-9)</span>
                </label>

                <label className="flex items-center space-x-3 bg-slate-950/60 p-3 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Include Special Symbols</span>
                </label>
              </div>

              <div className="border-t border-slate-900/60 pt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-300 block">Exclude Similar Characters</span>
                    <span className="text-[10px] text-slate-500">Always omit confusing characters (e.g. l, 1, o, 0)</span>
                  </div>
                </label>
              </div>

              {/* Theme toggle */}
              <div className="border-t border-slate-900/60 pt-4 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-300 block">Application Theme Mode</span>
                  <span className="text-[10px] text-slate-500">Toggle light or dark styling parameters</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2 border border-slate-800 bg-slate-900 rounded-xl text-slate-200 hover:text-slate-100 uppercase"
                >
                  {theme} Mode
                </button>
              </div>

              {/* Submit */}
              <div className="border-t border-slate-900/60 pt-4 flex justify-between items-center gap-4">
                {saveSuccess && (
                  <span className="text-cyber-green text-[10px] font-bold uppercase tracking-wider animate-fadeIn">
                    Preferences Synced successfully!
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl disabled:opacity-50 transition shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                >
                  {saving ? 'Syncing...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </GlassCard>

          {/* Destructive Actions */}
          <GlassCard className="border-red-500/10">
            <h3 className="text-sm font-bold font-cyber text-red-400 mb-4 flex items-center">
              <Terminal className="w-4 h-4 mr-2" />
              Administrative Operations
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClearHistory}
                className="flex-1 py-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 rounded-xl text-xs font-cyber font-bold transition flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Audit Logs
              </button>
              <button
                onClick={logout}
                className="flex-1 py-3 border border-slate-850 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-cyber font-bold transition"
              >
                End Current Session
              </button>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
export default ProfilePage;
