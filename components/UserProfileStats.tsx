import React from 'react';
import { Users, BookOpen, Activity, UserPlus } from 'lucide-react';
import { GitHubUserDetail, SortOption } from '../types';

interface UserProfileStatsProps {
  user: GitHubUserDetail;
  sortBy: SortOption;
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
  <div className={`flex flex-col items-center justify-center p-2 sm:p-3 min-w-[70px] sm:min-w-[80px] h-full transition-colors ${highlight ? 'bg-neon-500/10' : 'bg-dark-bg/50 hover:bg-dark-bg'}`}>
    <span className={`text-sm sm:text-base font-bold ${highlight ? 'text-neon-400' : 'text-white'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
    <div className="flex items-center gap-1 mt-1">
      {Icon && <Icon size={10} className={`opacity-70 ${highlight ? 'text-neon-400' : 'text-dark-text'}`} />}
      <span className={`text-[9px] sm:text-[10px] uppercase font-medium tracking-wide ${highlight ? 'text-neon-400/80' : 'text-dark-text/70'}`}>{label}</span>
    </div>
  </div>
);

export const UserProfileStats: React.FC<UserProfileStatsProps> = ({ user, sortBy }) => {
  return (
    <div className="grid grid-cols-4 border border-dark-border divide-x divide-dark-border bg-dark-bg/30 rounded-sm overflow-hidden h-full">
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
        label="Activity" 
        value={user.recent_activity_count !== undefined ? user.recent_activity_count : '-'} 
        icon={Activity}
        highlight={sortBy === SortOption.CONTRIBUTIONS} 
      />
    </div>
  );
};
