import React, { useState } from 'react';
import { Shield, Key, ArrowRight, Activity, Terminal, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { clientAnalyzePassword } from '../services/mockApi';

interface LandingPageProps {
  setActivePage: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage }) => {
  const [previewPass, setPreviewPass] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const handlePreviewChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPreviewPass(val);
    if (val.length === 0) {
      setAnalysis(null);
      return;
    }
    const result = await clientAnalyzePassword(val);
    setAnalysis(result);
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 60) return 'text-amber-500';
    if (score < 80) return 'text-yellow-400';
    return 'text-emerald-500';
  };

  const getScoreBg = (score: number) => {
    if (score < 40) return 'bg-red-500';
    if (score < 60) return 'bg-amber-500';
    if (score < 80) return 'bg-yellow-400';
    return 'bg-emerald-500';
  };

  return (
    <div className="relative min-h-screen scanline-grid flex flex-col justify-center">
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyber-green font-cyber tracking-wider">
              <Terminal className="w-4 h-4 animate-pulse" />
              <span>AI-POWERED AUDITING AGENT v2.6</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-cyber leading-tight">
              Audit & Fortify <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Your Credentials
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-lg">
              SecurePass AI evaluates your credential integrity in real-time, simulating brute-force breaches and leveraging zero-trust models to test your posture.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => setActivePage('analyzer')}
                className="flex items-center px-6 py-3 rounded-xl font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all duration-200 shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:scale-105"
              >
                Launch Analyzer
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => setActivePage('learning')}
                className="flex items-center px-6 py-3 rounded-xl font-bold border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-200 hover:text-slate-100 transition-all"
              >
                Security Academy
              </button>
            </div>
          </div>

          {/* Hero Right Widget (Quick Analyzer) */}
          <div>
            <GlassCard variant="cyber" className="hover-glow transition-all duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-900/60">
                <div className="flex items-center space-x-2">
                  <Key className="w-5 h-5 text-cyber-green" />
                  <span className="text-sm font-semibold tracking-widest font-cyber text-slate-300">SANDBOX TESTER</span>
                </div>
                <div className="w-2.5 h-2.5 bg-cyber-green rounded-full animate-ping"></div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="preview-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-2">
                    Enter Password to Test
                  </label>
                  <input
                    id="preview-password"
                    type="password"
                    value={previewPass}
                    onChange={handlePreviewChange}
                    placeholder="Type a password..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-200"
                  />
                </div>

                {analysis ? (
                  <div className="space-y-4 mt-4 animate-fadeIn">
                    {/* Gauge bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-cyber mb-1">
                        <span className="text-slate-400">STRENGTH GRADE:</span>
                        <span className={`font-bold uppercase ${getScoreColor(analysis.score)}`}>
                          {analysis.grade} ({analysis.score}/100)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className={`h-full ${getScoreBg(analysis.score)} transition-all duration-500`}
                          style={{ width: `${analysis.score}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-cyber bg-slate-950/40 p-3.5 border border-slate-900 rounded-xl">
                      <div>
                        <span className="text-slate-500 block">CRACK TIME:</span>
                        <span className="font-semibold text-slate-300 capitalize">{analysis.crackTimeEstimated}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ENTROPY:</span>
                        <span className="font-semibold text-slate-300">{analysis.entropy} bits</span>
                      </div>
                    </div>

                    {analysis.pwned && (
                      <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-cyber">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold">BREACH DETECTED:</span>
                          <p className="mt-0.5 text-red-300/80">Found in {analysis.breachCount.toLocaleString()} public breaches.</p>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/90 rounded-xl text-[11px] font-cyber space-y-1">
                      <span className="font-bold block uppercase text-[10px] tracking-wider text-emerald-500">Advisory:</span>
                      <p className="line-clamp-2">{analysis.suggestions[0]}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center border border-dashed border-slate-900 rounded-xl text-xs text-slate-600 font-cyber">
                    Enter characters to trigger static audits
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="default" hoverable className="hover-glow transition-all duration-300">
            <Activity className="w-8 h-8 text-cyber-green mb-4" />
            <h3 className="text-lg font-bold font-cyber text-slate-200">Simulate Attacks</h3>
            <p className="text-sm text-slate-400 mt-2">
              Visualizes cracking duration against dictionary, hybrid, and brute-force rigs under offline conditions.
            </p>
          </GlassCard>

          <GlassCard variant="default" hoverable className="hover-glow-blue transition-all duration-300">
            <Key className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold font-cyber text-slate-200">AI Upgrade Assistant</h3>
            <p className="text-sm text-slate-400 mt-2">
              Replaces weak portions with secure leetspeak equivalents and symbol blocks while maintaining phonetic memory.
            </p>
          </GlassCard>

          <GlassCard variant="default" hoverable className="hover-glow transition-all duration-300">
            <Shield className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold font-cyber text-slate-200">Cyber Hub & Quiz</h3>
            <p className="text-sm text-slate-400 mt-2">
              Reinforces password guidelines and lets you complete safety challenges to earn ranking badges.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default LandingPage;
