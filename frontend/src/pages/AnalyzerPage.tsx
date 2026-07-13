import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { 
  ShieldAlert, ShieldCheck, Eye, EyeOff, Cpu, Lock, Copy, Check, 
  Sparkles, AlertCircle, RefreshCw, BarChart2, Bomb 
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';


export const AnalyzerPage: React.FC = () => {
  useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [analysis, setAnalysis] = useState<any>(null);
  const [upgraded, setUpgraded] = useState<any>(null);
  
  const [copied, setCopied] = useState<'original' | 'upgraded' | null>(null);

  // Run analysis in real-time as password changes
  useEffect(() => {
    if (!password) {
      setAnalysis(null);
      setUpgraded(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiService.analyzePassword(password);
        setAnalysis(res);
        
        // Also pre-fetch upgraded suggestion
        const upg = await apiService.upgradePassword(password);
        setUpgraded(upg);
      } catch (err) {
        console.error("Analysis request failed:", err);
      }
    }, 250); // slight debounce for smooth typing

    return () => clearTimeout(timer);
  }, [password]);

  const copyToClipboard = (text: string, type: 'original' | 'upgraded') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 60) return 'text-amber-500';
    if (score < 80) return 'text-yellow-400';
    return 'text-emerald-500';
  };

  const getScoreBorder = (score: number) => {
    if (score < 40) return 'border-red-500/20';
    if (score < 60) return 'border-amber-500/20';
    if (score < 80) return 'border-yellow-400/20';
    return 'border-emerald-500/20';
  };

  // Attack simulator values based on analysis
  const getAttackData = () => {
    if (!analysis) return [];
    
    return [
      {
        name: 'Brute Force Attack',
        desc: 'Cracking with an offline consumer graphics rig (e.g. 1 RTX 4090)',
        speed: '10 Billion guesses/sec',
        time: analysis.crackTimeEstimated,
        vulnerability: analysis.score < 50 ? 'Critical Risk' : analysis.score < 80 ? 'Moderate' : 'Secured',
        vulnColor: analysis.score < 50 ? 'text-red-400' : analysis.score < 80 ? 'text-yellow-400' : 'text-emerald-400'
      },
      {
        name: 'Dictionary Attack',
        desc: 'Testing word variations against known lists (e.g. RockYou2024)',
        speed: 'Instant lookup lists',
        time: analysis.pwned ? 'Instant' : 'Low matching probability',
        vulnerability: analysis.pwned ? 'Leaked' : 'Protected',
        vulnColor: analysis.pwned ? 'text-red-400' : 'text-emerald-400'
      },
      {
        name: 'Hybrid & Rules Attack',
        desc: 'Dictionary combined with numbers, shifts, or symbols additions',
        speed: '100 Million guesses/sec',
        time: analysis.score < 60 ? 'Minutes' : 'Years',
        vulnerability: analysis.score < 60 ? 'High Risk' : 'Low Risk',
        vulnColor: analysis.score < 60 ? 'text-red-400' : 'text-emerald-400'
      },
      {
        name: 'Credential Stuffing',
        desc: 'Using automated scripts to test leaked keys across websites',
        speed: 'Distributed botnets',
        time: analysis.pwned ? 'Instant Breaches' : 'Safe',
        vulnerability: analysis.pwned ? 'High Exploitability' : 'Isolated',
        vulnColor: analysis.pwned ? 'text-red-400' : 'text-emerald-400'
      }
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Page Header */}
      <div className="border-b border-slate-900 pb-4">
        <h1 className="text-3xl font-extrabold tracking-wider font-cyber bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          REAL-TIME PASSWORD ANALYZER
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-cyber mt-1">
          Static and Network Leak Evaluation Vault
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Password Inputs & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard variant="cyber">
            <h2 className="text-lg font-bold font-cyber text-slate-200 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-cyber-green" />
              Audited Password Input
            </h2>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type a password to test security posture..."
                className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-4 pr-12 py-4 text-slate-100 placeholder-slate-600 focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => copyToClipboard(password, 'original')}
                  className="flex items-center text-xs text-slate-500 hover:text-cyber-green transition"
                >
                  {copied === 'original' ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Password
                    </>
                  )}
                </button>
              </div>
            )}
          </GlassCard>

          {analysis ? (
            <>
              {/* Characteristics Breakdown */}
              <GlassCard>
                <h3 className="text-md font-bold font-cyber text-slate-300 mb-4 flex items-center">
                  <BarChart2 className="w-4 h-4 mr-2 text-cyber-green" />
                  Entropy & Character Posture
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-cyber text-slate-500 block">Length</span>
                    <span className="text-2xl font-bold font-cyber text-slate-200 mt-1 block">
                      {analysis.characterCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-cyber text-slate-500 block">Uppercase</span>
                    <span className="text-2xl font-bold font-cyber text-slate-200 mt-1 block">
                      {analysis.uppercaseCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-cyber text-slate-500 block">Lowercase</span>
                    <span className="text-2xl font-bold font-cyber text-slate-200 mt-1 block">
                      {analysis.lowercaseCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-cyber text-slate-500 block">Numbers</span>
                    <span className="text-2xl font-bold font-cyber text-slate-200 mt-1 block">
                      {analysis.numbersCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl text-center">
                    <span className="text-[10px] uppercase font-cyber text-slate-500 block">Special</span>
                    <span className="text-2xl font-bold font-cyber text-slate-200 mt-1 block">
                      {analysis.specialCount}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-2xl gap-4">
                  <div className="flex items-center space-x-3">
                    <Cpu className="w-8 h-8 text-blue-400" />
                    <div>
                      <h4 className="text-sm font-bold font-cyber text-slate-300">Entropy Calculations</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Calculates bit combinations and guesswork pool size.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-cyber text-blue-400">{analysis.entropy} Bits</span>
                    <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Entropy Grade</span>
                  </div>
                </div>
              </GlassCard>

              {/* Password Attack Simulator */}
              <GlassCard>
                <h3 className="text-md font-bold font-cyber text-slate-300 mb-4 flex items-center">
                  <Bomb className="w-4 h-4 mr-2 text-red-500" />
                  Password Attack Simulator
                </h3>
                
                <div className="space-y-4">
                  {getAttackData().map((attack, i) => (
                    <div key={i} className="p-4 bg-slate-950/60 border border-slate-900/60 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-sm font-bold font-cyber text-slate-200 block">{attack.name}</span>
                        <span className="text-xs text-slate-500 mt-0.5 block">{attack.desc}</span>
                        <span className="text-[10px] font-cyber text-slate-500 block uppercase mt-1">Attack Velocity: {attack.speed}</span>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-xs text-slate-400 block font-cyber uppercase">Time to Crack</span>
                        <span className="font-semibold text-slate-100 font-cyber capitalize block text-sm mt-0.5">{attack.time}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-cyber ${attack.vulnColor}`}>{attack.vulnerability}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-2xl text-slate-600 font-cyber space-y-3">
              <Lock className="w-12 h-12 text-slate-800" />
              <span>Enter credentials to populate security vectors</span>
            </div>
          )}

        </div>

        {/* Right Column: Score, Upgrades & Advisor */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* Score Gauge card */}
              <GlassCard className={`border ${getScoreBorder(analysis.score)}`}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex items-center justify-center w-36 h-36">
                    {/* Ring background */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-slate-900"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className={`${
                          analysis.score < 40 ? 'stroke-red-500' : 
                          analysis.score < 60 ? 'stroke-amber-500' : 
                          analysis.score < 80 ? 'stroke-yellow-400' : 'stroke-emerald-500'
                        } transition-all duration-1000`}
                        strokeWidth="8"
                        strokeDasharray={376.8}
                        strokeDashoffset={376.8 - (376.8 * analysis.score) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold font-cyber text-slate-100">{analysis.score}</span>
                      <span className="text-[10px] font-bold font-cyber text-slate-500 uppercase tracking-widest mt-0.5">SCORE</span>
                    </div>
                  </div>

                  <h3 className={`text-xl font-bold font-cyber uppercase mt-4 ${getScoreColor(analysis.score)}`}>
                    {analysis.grade} Grade
                  </h3>
                  
                  {analysis.pwned ? (
                    <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-cyber flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>Found in {analysis.breachCount.toLocaleString()} public breaches!</span>
                    </div>
                  ) : (
                    <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-cyber-green rounded-xl text-xs font-cyber flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      <span>Zero breaches found in public leaks</span>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* AI Advisor recommendations */}
              <GlassCard>
                <h3 className="text-md font-bold font-cyber text-slate-300 mb-4 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 text-cyber-green" />
                  AI Security Advisor
                </h3>

                <div className="space-y-3">
                  {analysis.suggestions.map((sug: string, i: number) => (
                    <div key={i} className="flex items-start space-x-2 text-xs font-cyber text-slate-400 p-2.5 bg-slate-950/40 border border-slate-900 rounded-xl">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Password Upgrade Assistant */}
              {upgraded && (
                <GlassCard variant="blue" className="hover-glow-blue">
                  <h3 className="text-md font-bold font-cyber text-slate-200 mb-4 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                    Credential Upgrade Assistant
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-cyber block uppercase">Weak Input:</span>
                      <span className="text-sm font-mono text-slate-400 break-all">{password}</span>
                    </div>

                    <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-blue-400 font-cyber uppercase font-bold">Suggested Upgrade:</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] bg-blue-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                            Score: {upgraded.upgradedScore}/100
                          </span>
                        </div>
                      </div>
                      <span className="text-md font-mono text-slate-100 break-all mt-1.5 block font-bold">
                        {upgraded.upgradedPassword}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-cyber leading-relaxed">
                      {upgraded.explanation}
                    </p>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => copyToClipboard(upgraded.upgradedPassword, 'upgraded')}
                        className="flex-1 flex items-center justify-center py-2.5 border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 font-bold rounded-xl text-xs transition font-cyber"
                      >
                        {copied === 'upgraded' ? (
                          <>
                            <Check className="w-4 h-4 mr-1.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1.5" />
                            Copy Suggested
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPassword(upgraded.upgradedPassword)}
                        className="p-2.5 border border-slate-800 bg-slate-900 rounded-xl hover:bg-slate-850 hover:text-slate-100 text-slate-300 transition"
                        title="Load into Analyzer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard className="h-64 flex items-center justify-center border-dashed border-slate-900">
              <div className="text-center font-cyber text-xs text-slate-600">
                Awaiting credentials audit...
              </div>
            </GlassCard>
          )}
        </div>

      </div>
    </div>
  );
};
export default AnalyzerPage;
