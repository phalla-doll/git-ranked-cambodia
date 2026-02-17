import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, color = "text-neon-400" }) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-6 border border-dark-border flex items-start justify-between transition-all duration-300 hover:border-dark-text/30 hover:shadow-lg hover:shadow-black/20 group relative overflow-hidden">
       {/* Background glow effect on hover */}
       <div className="absolute inset-0 bg-gradient-to-br from-neon-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
       
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg bg-dark-bg border border-dark-border ${color}`}>
                <Icon size={18} />
            </div>
            <p className="text-dark-text text-xs font-medium uppercase tracking-wide">{label}</p>
        </div>
        <h3 className="text-3xl font-bold text-dark-heading tracking-tight">{value}</h3>
        {trend && (
          <p className="text-xs text-dark-text/70 mt-2 font-medium">
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};