import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, color = "text-indigo-600" }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex items-start justify-between transition-all duration-200 hover:shadow-md">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight font-mono">{value}</h3>
        {trend && (
          <p className="text-xs text-slate-400 mt-2">
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-slate-50 ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};