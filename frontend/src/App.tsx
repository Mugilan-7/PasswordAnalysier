import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import AnalyzerPage from './pages/AnalyzerPage';
import GeneratorPage from './pages/GeneratorPage';
import DashboardPage from './pages/DashboardPage';
import LearningPage from './pages/LearningPage';
import ProfilePage from './pages/ProfilePage';
import AuthPages from './pages/AuthPages';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

const InnerApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<string>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 animate-pulse mb-2">
          <Shield className="w-12 h-12 text-cyber-green animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <span className="text-xs font-cyber tracking-widest text-slate-500 uppercase animate-pulse">
          Initializing secure environments...
        </span>
      </div>
    );
  }

  // Route router logic with protection filters
  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={setActivePage} />;
      case 'analyzer':
        return <AnalyzerPage />;
      case 'generator':
        return <GeneratorPage />;
      case 'dashboard':
        return user ? <DashboardPage /> : <AuthPages initialMode="login" setActivePage={setActivePage} />;
      case 'learning':
        return <LearningPage />;
      case 'profile':
        return user ? <ProfilePage /> : <AuthPages initialMode="login" setActivePage={setActivePage} />;
      case 'login':
        return <AuthPages initialMode="login" setActivePage={setActivePage} />;
      case 'signup':
        return <AuthPages initialMode="signup" setActivePage={setActivePage} />;
      case 'forgot':
        return <AuthPages initialMode="forgot" setActivePage={setActivePage} />;
      default:
        return <LandingPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      {/* Visual background scanning lines */}
      <div className="fixed inset-0 pointer-events-none scanline-overlay z-0 opacity-15"></div>
      
      {/* Navbar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Page Layout Wrapper */}
      <main className="flex-grow z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
