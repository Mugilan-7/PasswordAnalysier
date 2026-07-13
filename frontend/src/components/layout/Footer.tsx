import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950/60 border-t border-slate-900/60 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-emerald-500 mr-2" />
          <span className="text-sm font-semibold tracking-wider font-cyber text-slate-400">
            SECUREPASS AI &copy; 2026
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-4 md:mt-0 font-cyber">
          Zero-trust client processing. Passwords are evaluated in memory and never transmitted in plain text.
        </p>
      </div>
    </footer>
  );
};
export default Footer;
