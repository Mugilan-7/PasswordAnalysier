import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'cyber' | 'blue' | 'purple' | 'default';
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  hoverable = false
}) => {
  const baseStyle = variant === 'cyber' 
    ? 'glass-card-cyber' 
    : variant === 'blue'
    ? 'glass-card-blue'
    : variant === 'purple'
    ? 'glass-card-purple'
    : 'glass-card';

  const hoverStyle = hoverable 
    ? variant === 'blue' 
      ? 'hover-glow-blue' 
      : 'hover-glow' 
    : '';

  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 ${baseStyle} ${hoverStyle} ${className}`}>
      {children}
    </div>
  );
};
export default GlassCard;
