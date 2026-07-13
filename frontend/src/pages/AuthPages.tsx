import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Key, Mail, User, Shield, Terminal, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';

interface AuthPagesProps {
  initialMode: 'login' | 'signup' | 'forgot';
  setActivePage: (page: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialMode, setActivePage }) => {
  const { login, signup, forgotPassword, resetPassword, isDemoMode } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  
  // Forms state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UX helper states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!username || !password) {
      setErrorMsg("All fields are required");
      return;
    }
    
    setSubmitting(true);
    try {
      await login({ username, password });
      setActivePage('dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to authenticate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!username || !email || !password) {
      setErrorMsg("All fields are required");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    
    setSubmitting(true);
    try {
      await signup({ username, email, password });
      setSuccessMsg("Account registered successfully. If in sandbox mode, verify details instantly.");
      setTimeout(() => {
        setActivePage('dashboard');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!email) {
      setErrorMsg("Email address is required");
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccessMsg("A reset token has been generated. check the browser console or backend logs.");
      setTimeout(() => {
        setMode('reset');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Reset request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!resetToken || !newPassword) {
      setErrorMsg("All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token: resetToken, newPassword });
      setSuccessMsg("Password reset successfully. You can log in now.");
      setTimeout(() => {
        setMode('login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || "Password reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center scanline-grid px-4 py-12">
      {/* Background Radial Glow */}
      <div className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <GlassCard variant="cyber" className="hover-glow shadow-2xl transition-all duration-300">
          
          {/* Header Terminal Style */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-900/60 mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyber-green" />
              <span className="text-xs font-semibold tracking-widest font-cyber text-slate-300">
                {mode === 'login' && 'ACCESS CONTROL'}
                {mode === 'signup' && 'REGISTRATION TERMINAL'}
                {mode === 'forgot' && 'CREDENTIAL RECOVERY'}
                {mode === 'reset' && 'CREDENTIAL RESET'}
              </span>
            </div>
            {isDemoMode && (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-cyber-green rounded font-cyber uppercase">
                Sandbox Mode
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold font-cyber text-slate-100 mb-6 text-center">
            {mode === 'login' && 'Login to SecurePass'}
            {mode === 'signup' && 'Create Secure Account'}
            {mode === 'forgot' && 'Recover Account'}
            {mode === 'reset' && 'Set New Password'}
          </h2>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start space-x-2 font-cyber">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-cyber-green rounded-xl text-xs flex items-start space-x-2 font-cyber">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-slate-500 hover:text-cyber-green hover:underline font-cyber"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.2)] disabled:opacity-50 transition-all font-cyber text-sm"
              >
                {submitting ? 'Verifying Credentials...' : 'Authenticate'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>

              <div className="text-center pt-4 border-t border-slate-900/60 mt-4 text-xs text-slate-500 font-cyber">
                First time?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-cyber-green hover:underline"
                >
                  Create authorization key
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose unique handle"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Master Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.2)] disabled:opacity-50 transition-all font-cyber text-sm"
              >
                {submitting ? 'Generating Identity Keys...' : 'Register Account'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </button>

              <div className="text-center pt-4 border-t border-slate-900/60 mt-4 text-xs text-slate-500 font-cyber">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-cyber-green hover:underline"
                >
                  Return to terminal login
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-slate-400 font-cyber mb-4">
                Enter your registered email below to receive a password reset token.
              </p>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all font-cyber text-sm"
              >
                {submitting ? 'Generating Recovery Hash...' : 'Request Recovery'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-300 font-cyber"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Reset Password */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">Recovery Token</label>
                <div className="relative">
                  <Terminal className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-cyber mb-1.5">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-950/80 border border-slate-900 focus:border-emerald-500/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 flex items-center justify-center py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all font-cyber text-sm"
              >
                {submitting ? 'Resetting Password...' : 'Save New Password'}
              </button>
            </form>
          )}

        </GlassCard>
      </div>
    </div>
  );
};
export default AuthPages;
