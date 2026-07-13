import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { 
  RefreshCw, Copy, Check, ShieldAlert, Sparkles, FolderLock, 
  Trash2, Search, PlusCircle 
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { clientAnalyzePassword } from '../services/mockApi';

export const GeneratorPage: React.FC = () => {
  const { user, preferences, updatePreferences } = useAuth();
  
  // Generator Settings state
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [easyToRead, setEasyToRead] = useState(false);
  const [easyToType, setEasyToType] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [strengthAnalysis, setStrengthAnalysis] = useState<any>(null);
  
  // Vault state
  const [label, setLabel] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [vaultList, setVaultList] = useState<any[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UX UI helpers
  const [copied, setCopied] = useState<number | 'generated' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync preferences on load if user is logged in
  useEffect(() => {
    if (preferences) {
      setLength(preferences.preferredLength);
      setIncludeUppercase(preferences.includeUppercase);
      setIncludeLowercase(preferences.includeLowercase);
      setIncludeNumbers(preferences.includeNumbers);
      setIncludeSymbols(preferences.includeSymbols);
      setExcludeSimilar(preferences.excludeSimilar);
    }
  }, [preferences]);

  // Run generator
  const triggerGenerate = async () => {
    const pass = await apiService.generatePassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      easyToRead,
      easyToType,
      excludeSimilar
    });
    setGeneratedPassword(pass);
    
    // Check score of generated password
    const analysis = await clientAnalyzePassword(pass);
    setStrengthAnalysis(analysis);
  };

  // Generate on setting changes
  useEffect(() => {
    triggerGenerate();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, easyToRead, easyToType, excludeSimilar]);

  // Fetch Vault items
  const fetchVault = async () => {
    if (!user) return;
    setVaultLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await apiService.searchSavedPasswords(searchQuery);
      } else {
        data = await apiService.getSavedPasswords();
      }
      setVaultList(data);
    } catch (e) {
      console.error("Failed to read vault:", e);
    } finally {
      setVaultLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, [user, searchQuery]);

  const copyToClipboard = (text: string, id: number | 'generated') => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveToVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    
    setSubmitting(true);
    try {
      await apiService.savePassword({
        label: label.trim(),
        password: generatedPassword
      });
      setLabel('');
      setShowSaveDialog(false);
      fetchVault();
    } catch (e) {
      console.error("Vault save failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVaultItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this secret from your vault?")) return;
    try {
      await apiService.deleteSavedPassword(id);
      fetchVault();
    } catch (e) {
      console.error("Vault delete failed:", e);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    try {
      await updatePreferences({
        theme: preferences?.theme || 'dark',
        preferredLength: length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        excludeSimilar
      });
      alert("Generator settings saved to your user profile!");
    } catch (e) {
      console.error(e);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-400';
    if (score < 60) return 'text-amber-400';
    if (score < 80) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="border-b border-slate-900 pb-4">
        <h1 className="text-3xl font-extrabold tracking-wider font-cyber bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          AI PASSWORD GENERATOR & VAULT
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-cyber mt-1">
          Cryptographically Strong Entropy Engine
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Generator Settings & Output */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Output Box */}
          <GlassCard variant="cyber" className="shadow-2xl">
            <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-lg font-mono tracking-wider text-slate-100 break-all select-all font-bold">
                {generatedPassword || 'Generating...'}
              </span>
              
              <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={triggerGenerate}
                  className="flex-1 sm:flex-initial p-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 rounded-xl transition"
                  title="Regenerate Password"
                >
                  <RefreshCw className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => copyToClipboard(generatedPassword, 'generated')}
                  className="flex-1 sm:flex-initial p-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-850 rounded-xl transition"
                  title="Copy Password"
                >
                  {copied === 'generated' ? <Check className="w-5 h-5 text-cyber-green mx-auto" /> : <Copy className="w-5 h-5 mx-auto" />}
                </button>
                {user && (
                  <button
                    onClick={() => setShowSaveDialog(!showSaveDialog)}
                    className="flex-1 sm:flex-initial flex items-center justify-center px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition text-sm font-cyber shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Quick strength visual */}
            {strengthAnalysis && (
              <div className="mt-4 flex items-center justify-between text-xs font-cyber px-2">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">STRENGTH:</span>
                  <span className={`font-bold ${getScoreColor(strengthAnalysis.score)}`}>
                    {strengthAnalysis.grade} ({strengthAnalysis.score}/100)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">ENTROPY:</span>
                  <span className="font-semibold text-slate-300 ml-1">{strengthAnalysis.entropy} bits</span>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Dialog to Save to Vault */}
          {showSaveDialog && (
            <GlassCard variant="blue" className="animate-fadeIn">
              <h3 className="text-md font-bold font-cyber text-slate-200 mb-4">Save Password to Vault</h3>
              <form onSubmit={handleSaveToVault} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">
                    Account Label / Site Name
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. My Google Credentials, Server SSH Key"
                    className="w-full bg-slate-950 border border-slate-900 focus:border-blue-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none text-sm"
                  />
                </div>
                <div className="flex space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(false)}
                    className="px-4 py-2 text-xs font-cyber border border-slate-800 bg-slate-900 rounded-xl text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-cyber bg-blue-500 text-slate-950 font-bold rounded-xl hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                  >
                    {submitting ? 'Encrypting & Saving...' : 'Encrypt & Save'}
                  </button>
                </div>
              </form>
            </GlassCard>
          )}

          {/* Configuration Form */}
          <GlassCard>
            <h3 className="text-md font-bold font-cyber text-slate-300 mb-6 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-cyber-green" />
              Entropy Parameters
            </h3>

            <div className="space-y-6">
              {/* Length Slider */}
              <div>
                <div className="flex justify-between text-xs font-cyber text-slate-400 mb-2">
                  <span>PASSWORD LENGTH:</span>
                  <span className="text-cyber-green font-bold">{length} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Character set checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-900 focus:ring-0 focus:outline-none"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">UPPERCASE (A-Z)</span>
                    <span className="text-[10px] text-slate-500">Adds 26 possibilities/char</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-900 focus:ring-0 focus:outline-none"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">LOWERCASE (a-z)</span>
                    <span className="text-[10px] text-slate-500">Adds 26 possibilities/char</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-900 focus:ring-0 focus:outline-none"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">NUMBERS (0-9)</span>
                    <span className="text-[10px] text-slate-500">Adds 10 possibilities/char</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 bg-slate-950/60 p-3.5 border border-slate-900 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded border-slate-900 focus:ring-0 focus:outline-none"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">SPECIAL SYMBOLS</span>
                    <span className="text-[10px] text-slate-500">Adds 32 possibilities/char</span>
                  </div>
                </label>
              </div>

              {/* Additional Options */}
              <div className="border-t border-slate-900/60 pt-4 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeSimilar}
                    onChange={(e) => setExcludeSimilar(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">Exclude Similar Characters</span>
                    <span className="text-[10px] text-slate-500">Omit confusing glyphs (e.g. l, I, 1, o, O, 0)</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={easyToRead}
                    onChange={(e) => setEasyToRead(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">Easy to Read</span>
                    <span className="text-[10px] text-slate-500">Filter symbols and confusing layouts</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={easyToType}
                    onChange={(e) => setEasyToType(e.target.checked)}
                    className="w-4.5 h-4.5 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold font-cyber text-slate-300 block">Easy to Type</span>
                    <span className="text-[10px] text-slate-500">Prioritizes row clusters on standard keyboards</span>
                  </div>
                </label>
              </div>

              {user && (
                <div className="flex justify-end border-t border-slate-900/60 pt-4">
                  <button
                    onClick={savePreferences}
                    className="flex items-center px-4 py-2 border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-cyber font-bold rounded-xl text-slate-200"
                  >
                    Save as Profile Default
                  </button>
                </div>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Right Column: Decrypted Vault list */}
        <div className="space-y-6">
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-md font-bold font-cyber text-slate-300 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <FolderLock className="w-5 h-5 mr-2 text-blue-400" />
                Credential Vault
              </span>
              {user && (
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded px-2 py-0.5 uppercase font-cyber">
                  AES-256 GCM
                </span>
              )}
            </h3>

            {user ? (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search vault labels..."
                    className="w-full bg-slate-950 border border-slate-900 focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {vaultLoading ? (
                  <div className="space-y-3 mt-4">
                    <div className="h-16 bg-slate-900/50 border border-slate-950 rounded-xl animate-pulse"></div>
                    <div className="h-16 bg-slate-900/50 border border-slate-950 rounded-xl animate-pulse"></div>
                    <div className="h-16 bg-slate-900/50 border border-slate-950 rounded-xl animate-pulse"></div>
                  </div>
                ) : vaultList.length > 0 ? (
                  <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1 flex-1">
                    {vaultList.map((item: any) => (
                      <div key={item.id} className="p-3 bg-slate-950/60 border border-slate-900/60 rounded-xl flex items-center justify-between gap-3 group">
                        <div className="min-w-0">
                          <span className="text-xs font-bold font-cyber text-slate-200 block truncate" title={item.label}>
                            {item.label}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block truncate select-all mt-1 break-all">
                            {item.decryptedPassword}
                          </span>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyToClipboard(item.decryptedPassword, item.id)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg border border-slate-800/80 transition"
                            title="Copy Password"
                          >
                            {copied === item.id ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteVaultItem(item.id)}
                            className="p-1.5 bg-slate-900 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg border border-slate-800/80 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-xl p-8 text-center text-xs text-slate-600 font-cyber mt-2">
                    <FolderLock className="w-8 h-8 text-slate-800 mb-2" />
                    <span>No passwords saved to this vault. Generate and save some!</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-xl p-6 text-center text-xs text-slate-500 font-cyber space-y-4">
                <ShieldAlert className="w-8 h-8 text-slate-700" />
                <div>
                  <span className="font-bold block text-slate-400 mb-1">Vault Locked</span>
                  <p>Authenticate your session to unlock GCM-encrypted vaults and default settings.</p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
};
export default GeneratorPage;
