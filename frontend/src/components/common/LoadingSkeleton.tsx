import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({ rows = 4, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      <div className="h-6 bg-slate-800/60 rounded-lg w-1/3 mb-6"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-800/40 rounded-md w-full"></div>
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-96 md:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
      <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse"></div>
    </div>
  );
};
