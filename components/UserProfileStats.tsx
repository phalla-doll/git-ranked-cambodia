import React from 'react';
import { Users, BookOpen, UserPlus, Calendar } from 'lucide-react';
import { GitHubUserDetail, SortOption } from '../types';

interface UserProfileStatsProps {
  user: GitHubUserDetail;
  sortBy: SortOption;
  className?: string;
  flat?: boolean;
}

const StatBox = ({ 
  label, 
  value, 
  icon: Icon, 
  highlight = false 
}: { 
  label: string, 
  value: string | number, 
  icon?: React.ElementType, 
  highlight?: boolean 
}) => (
  <div className={`flex flex-col items-center justify-center py-3 px-1 sm:py-4 sm:px-2 h-full transition-colors relative group/stat ${highlight ? 'bg-neon-500/5' : 'bg-transparent hover:bg-dark-bg/50'}`}>
    {highlight && <div className="absolute inset-x-0 top-0 h-0.5 bg-neon-500 shadow-[0_0_8px_rgba(46,255,163,0.5)]"></div>}
    
    <span className={`text-sm sm:text-base font-semibold leading-none ${highlight ? 'text-neon-400' : 'text-white'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
    
    <div className="flex items-center gap-1.5 mt-2">
      {Icon && <Icon size={11} className={`opacity-70 ${highlight ? 'text-neon-400' : 'text-dark-text'}`} />}
      <span className={`text-[9px] sm:text-[10px] uppercase font-medium tracking-wide ${highlight ? 'text-neon-400/80' : 'text-dark-text/70'}`}>
        {label}
      </span>
    </div>
  </div>
);

export const UserProfileStats: React.FC<UserProfileStatsProps> = ({ user, sortBy, className = '', flat = false }) => {
  return (
    <div className={`grid grid-cols-4 divide-x divide-dark-border ${flat ? '' : 'border border-dark-border bg-dark-bg/30 rounded-sm'} overflow-hidden h-full ${className}`}>
      <StatBox 
        label="Repos" 
        value={user.public_repos} 
        icon={BookOpen}
        highlight={sortBy === SortOption.REPOS} 
      />
      <StatBox 
        label="Followers" 
        value={user.followers} 
        icon={Users}
        highlight={sortBy === SortOption.FOLLOWERS} 
      />
      <StatBox 
        label="Following" 
        value={user.following} 
        icon={UserPlus}
      />
      <StatBox 
        label="Contribs" 
        value={user.recent_activity_count !== undefined ? user.recent_activity_count : '-'} 
        icon={Calendar}
        highlight={sortBy === SortOption.CONTRIBUTIONS} 
      />
    </div>
  );
};