import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { DashboardSkeleton } from '../components/common/LoadingSkeleton';
import { 
  ShieldAlert, ShieldCheck, History, Search, Trash2, Award, 
  TrendingUp, ClipboardCheck 
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiService.getDashboardMetrics();
      setMetrics(data);
      
      const hist = await apiService.getHistory();
      setHistoryList(hist);
    } catch (e) {
      console.error("Dashboard metrics failed to load:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle history search filtering
  useEffect(() => {
    const filterHistory = async () => {
      if (!user || loading) return;
      setHistoryLoading(true);
      try {
        if (searchQuery) {
          const filtered = await apiService.searchHistory(searchQuery);
          setHistoryList(filtered);
        } else {
          const hist = await apiService.getHistory();
          setHistoryList(hist);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setHistoryLoading(false);
      }
    };

    const delayDebounce = setTimeout(filterHistory, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, user]);

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all your password audit history? This action is irreversible.")) return;
    try {
      await apiService.clearHistory();
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recent';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-500';
    if (score < 60) return 'text-amber-500';
    if (score < 80) return 'text-yellow-400';
    return 'text-emerald-500';
  };

  // SVG Chart path generator for score trends
  const renderTrendSvg = (trendPoints: any[]) => {
    if (!trendPoints || trendPoints.length < 2) {
      return (
        <div className="h-full flex items-center justify-center text-xs text-slate-600 font-cyber">
          Accumulate at least 2 logs to trace trend profiles
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 20;

    const pointsCount = trendPoints.length;
    
    // Map points to SVG coordinates
    const coordinates = trendPoints.map((p, i) => {
      const x = padding + (i * (width - 2 * padding)) / (pointsCount - 1);
      // Invert Y coordinate since SVG (0,0) is top-left
      const y = height - padding - (p.score * (height - 2 * padding)) / 100;
      return { x, y };
    });

    // Build SVG Path 'd' attribute
    let pathD = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 1; i < coordinates.length; i++) {
      pathD += ` L ${coordinates[i].x} ${coordinates[i].y}`;
    }

    // Fill area below trend line path
    const fillD = `${pathD} L ${coordinates[coordinates.length - 1].x} ${height - padding} L ${coordinates[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Fill Area Gradient */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00ff66" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00ff66" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <path d={fillD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="#00ff66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Plot Dots */}
        {coordinates.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="5" fill="#050b14" stroke="#00ff66" strokeWidth="2" />
            <circle cx={c.x} cy={c.y} r="8" fill="#00ff66" fillOpacity="0.15" className="animate-ping" style={{ animationDuration: '3s' }} />
          </g>
        ))}
      </svg>
    );
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold font-cyber text-slate-100">Access Restricted</h2>
        <p className="text-slate-400 text-sm">
          Please log in or register a developer session to view metrics dashboards and saved passwords.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="border-b border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider font-cyber bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            SECURITY STANDING & METRICS
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-cyber mt-1">
            Posture Assessment & Analytics Terminal
          </p>
        </div>
        <span className="text-xs px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-cyber">
          OPERATOR: <span className="text-slate-200 font-semibold uppercase">{user.username}</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Score */}
        <GlassCard variant="cyber" className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-cyber text-slate-500 uppercase tracking-wider block">Average Health Score</span>
              <span className="text-3xl font-bold font-cyber text-slate-100 mt-2 block">
                {metrics?.averagePasswordScore || 0}%
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <ClipboardCheck className="w-5 h-5 text-cyber-green" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-cyber text-slate-400">
            <span>Overall Score Across Audited Runs</span>
          </div>
        </GlassCard>

        {/* Total Checked */}
        <GlassCard className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-cyber text-slate-500 uppercase tracking-wider block">Total Audits Ran</span>
              <span className="text-3xl font-bold font-cyber text-slate-100 mt-2 block">
                {metrics?.totalPasswordsChecked || 0}
              </span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
              <History className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-cyber text-slate-500">
            <span>Unique password evaluations logged</span>
          </div>
        </GlassCard>

        {/* Weak Count */}
        <GlassCard className="p-5 border-red-500/10">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-cyber text-slate-500 uppercase tracking-wider block">Weak Passwords</span>
              <span className="text-3xl font-bold font-cyber text-red-400 mt-2 block">
                {metrics?.weakPasswordCount || 0}
              </span>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-cyber text-red-500/70">
            <span>Score &lt; 40 (Requires Action)</span>
          </div>
        </GlassCard>

        {/* Strong Count */}
        <GlassCard className="p-5 border-emerald-500/10">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-cyber text-slate-500 uppercase tracking-wider block">Strong/Excellent</span>
              <span className="text-3xl font-bold font-cyber text-emerald-400 mt-2 block">
                {metrics?.strongPasswordCount || 0}
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-cyber text-emerald-400/70">
            <span>Score &ge; 80 (Good Standard)</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Row: Chart & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-md font-bold font-cyber text-slate-300 mb-6 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-cyber-green" />
              Security Standing Trend
            </h3>
            <div className="h-56 flex items-end">
              {metrics && renderTrendSvg(metrics.securityImprovementTrend)}
            </div>
          </GlassCard>
        </div>

        {/* Badges Column */}
        <div>
          <GlassCard className="h-full">
            <h3 className="text-md font-bold font-cyber text-slate-300 mb-6 flex items-center">
              <Award className="w-4 h-4 mr-2 text-cyber-green" />
              Earned Quiz Badges
            </h3>

            {metrics?.badgesEarned && metrics.badgesEarned.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {metrics.badgesEarned.map((badge: string, i: number) => (
                  <div key={i} className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl text-center flex flex-col items-center">
                    <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-2">
                      <Award className="w-6 h-6 text-cyber-green" />
                    </div>
                    <span className="text-xs font-bold font-cyber text-slate-200">{badge}</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Verified</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center border border-dashed border-slate-900 rounded-xl text-center text-xs text-slate-600 font-cyber p-4">
                <Award className="w-8 h-8 text-slate-800 mb-2" />
                <span>No badges achieved yet. Complete safety academy quizzes to prove competence!</span>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* History log list */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900/60 mb-6">
          <h3 className="text-md font-bold font-cyber text-slate-300 flex items-center">
            <History className="w-4 h-4 mr-2 text-cyber-green" />
            Audit History logs
          </h3>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history grade..."
                className="w-full sm:w-60 bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
            {historyList.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-2 border border-slate-850 hover:border-red-500/20 bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl text-xs flex items-center transition"
                title="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            <div className="h-14 bg-slate-900/40 rounded-xl animate-pulse"></div>
            <div className="h-14 bg-slate-900/40 rounded-xl animate-pulse"></div>
          </div>
        ) : historyList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-[10px] font-cyber text-slate-500 uppercase tracking-widest">
                  <th className="pb-3">Analyzed Date</th>
                  <th className="pb-3">Health Score</th>
                  <th className="pb-3">Evaluation</th>
                  <th className="pb-3">Entropy</th>
                  <th className="pb-3">Brute Crack Time</th>
                  <th className="pb-3 text-right">Symbols</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-xs font-cyber text-slate-300">
                {historyList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition">
                    <td className="py-3 text-slate-500">{formatDate(item.analyzedAt)}</td>
                    <td className={`py-3 font-bold ${getScoreColor(item.score)}`}>{item.score}/100</td>
                    <td className="py-3 uppercase font-bold">{item.grade}</td>
                    <td className="py-3 text-slate-400">{item.entropy} Bits</td>
                    <td className="py-3 text-slate-400 capitalize">{item.crackTimeEstimated}</td>
                    <td className="py-3 text-right font-mono text-slate-500">
                      U:{item.uppercaseCount} L:{item.lowercaseCount} N:{item.numbersCount} S:{item.specialCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-600 font-cyber">
            No password audits match your query. Go to the Analyzer to generate static reports!
          </div>
        )}
      </GlassCard>

    </div>
  );
};
export default DashboardPage;
