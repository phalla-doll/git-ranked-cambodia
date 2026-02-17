import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string; // Kept for API compatibility, but usually ignored in minimal theme
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend }) => {
  return (
    <div className="bg-apple-surface p-6 rounded-2xl shadow-soft border border-white hover:shadow-hover transition-all duration-300 flex flex-col justify-between h-32 group">
      <div className="flex items-start justify-between">
        <div>
           <p className="text-apple-gray text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
           <h3 className="text-3xl font-medium text-apple-text tracking-tight -ml-0.5">{value}</h3>
        </div>
        <div className="p-2 bg-gray-50 rounded-full text-apple-gray group-hover:text-apple-blue group-hover:bg-blue-50 transition-colors">
            <Icon size={20} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-auto">
          <p className="text-xs text-apple-gray font-normal">
            {trend}
          </p>
        </div>
      )}
    </div>
  );
};