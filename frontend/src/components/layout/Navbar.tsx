import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Menu, X, LogOut, Activity, Key, BookOpen, User } from 'lucide-react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { user, logout, isDemoMode, toggleDemoMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Analyzer', page: 'analyzer', icon: Activity, protected: false },
    { name: 'Generator', page: 'generator', icon: Key, protected: false },
    { name: 'Dashboard', page: 'dashboard', icon: Shield, protected: true },
    { name: 'Security Hub', page: 'learning', icon: BookOpen, protected: false }
  ];

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('landing')}>
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mr-3">
              <Shield className="w-6 h-6 text-cyber-green animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-wider font-cyber bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              SECUREPASS AI
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              if (item.protected && !user) return null;
              const Icon = item.icon;
              const isActive = activePage === item.page;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.page)}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-cyber-green border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Connection Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => toggleDemoMode(true)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  isDemoMode ? 'bg-emerald-500/20 text-cyber-green font-semibold' : 'text-slate-400'
                }`}
                title="Run completely locally in mock sandbox mode"
              >
                Sandbox
              </button>
              <button
                onClick={() => toggleDemoMode(false)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  !isDemoMode ? 'bg-blue-500/20 text-blue-400 font-semibold' : 'text-slate-400'
                }`}
                title="Connect to Spring Boot REST endpoints"
              >
                Live Server
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-all ${
                    activePage === 'profile' ? 'bg-slate-900 text-slate-100' : ''
                  }`}
                  title="Profile Settings"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={logout}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => toggleDemoMode(!isDemoMode)}
              className="px-2 py-1 text-[10px] rounded border border-slate-800 bg-slate-900 text-slate-400"
            >
              {isDemoMode ? 'Sandbox' : 'Live'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => {
              if (item.protected && !user) return null;
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.page)}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <Icon className="w-5 h-5 mr-3 text-emerald-400" />
                  {item.name}
                </button>
              );
            })}

            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                >
                  <User className="w-5 h-5 mr-3 text-emerald-400" />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="py-2.5 rounded-xl border border-slate-800 text-center text-sm font-medium text-slate-300 hover:bg-slate-900"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick('signup')}
                  className="py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-center text-sm font-semibold hover:bg-emerald-400"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
