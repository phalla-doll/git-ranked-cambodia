import React from 'react';
import { GitHubUserDetail, SortOption } from '../types';
import { Users, BookOpen, ExternalLink, Activity, UserPlus, Terminal, AlertTriangle, SearchX, MapPin, Building } from 'lucide-react';

interface LeaderboardTableProps {
  users: GitHubUserDetail[];
  sortBy: SortOption;
  loading: boolean;
  error?: string | null;
}

const StatBox = ({ label, value, icon: Icon, highlight = false }: { label: string, value: string | number, icon?: React.ElementType, highlight?: boolean }) => (
  <div className={`flex flex-col items-center justify-center p-2 sm:p-3 min-w-[70px] sm:min-w-[80px] transition-colors ${highlight ? 'bg-neon-500/5' : 'bg-dark-bg'}`}>
    <span className={`text-sm sm:text-base font-bold ${highlight ? 'text-neon-400' : 'text-white'}`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </span>
    <div className="flex items-center gap-1 mt-1">
      {Icon && <Icon size={10} className="text-dark-text/70" />}
      <span className="text-[9px] sm:text-[10px] text-dark-text/70 uppercase font-medium tracking-wide">{label}</span>
    </div>
  </div>
);

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, sortBy, loading, error }) => {
  
  // Loading State
  if (loading && users.length === 0) {
    return (
      <div className="bg-dark-surface border border-dark-border flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(63,185,80,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_2s_linear_infinite]"></div>
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-dark-border group-hover:border-neon-400 transition-colors"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-dark-border group-hover:border-neon-400 transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-dark-border group-hover:border-neon-400 transition-colors"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-dark-border group-hover:border-neon-400 transition-colors"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center border border-dark-border mb-6 relative">
             <div className="absolute inset-0 rounded-full border-2 border-neon-500/20 border-t-neon-500 animate-spin"></div>
             <Activity className="text-neon-400" size={24} />
          </div>
          <p className="text-white font-semibold text-lg tracking-tight">Scanning GitHub Registry...</p>
          <p className="text-dark-text text-xs mt-2 font-mono text-center max-w-xs">
            Fetching developer profiles and analyzing public metrics.
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-dark-surface border border-red-500/20 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5"></div>
        <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center border border-red-500/30 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Connection Interrupted</h3>
            <p className="text-red-200/70 text-sm max-w-md mb-6 border border-red-500/20 bg-dark-bg p-3 font-mono rounded">
               {error}
            </p>
            <p className="text-dark-text text-sm max-w-sm">
               We couldn't retrieve the latest data. Please check your internet connection or API settings.
            </p>
        </div>
      </div>
    );
  }

  // Empty State
  if (users.length === 0) {
    return (
      <div className="bg-dark-surface border border-dark-border flex flex-col items-center justify-center min-h-[400px] relative">
        <div className="w-20 h-20 bg-dark-bg flex items-center justify-center mb-6 border border-dark-border shadow-inner">
            <SearchX size={40} className="text-dark-text opacity-50" />
        </div>
        <h3 className="text-white font-semibold text-xl">No Developers Found</h3>
        <p className="text-dark-text mt-2 max-w-sm text-center text-sm">
          We couldn't find any public profiles matching your location filter. Try broadening your search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative min-h-[500px]">
      {users.map((user, index) => (
        <div 
          key={user.id} 
          className="group relative bg-dark-surface border border-dark-border hover:border-dark-text/30 transition-all p-0 flex flex-col md:flex-row shadow-sm hover:shadow-lg hover:shadow-black/20 overflow-hidden"
        >
             {/* Hover Glow */}
             <div className="absolute inset-0 bg-gradient-to-r from-neon-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

             {/* Rank Badge */}
             <div className={`absolute top-0 left-0 z-10 px-3 py-1 text-xs font-bold border-r border-b border-dark-border font-mono shadow-sm
                ${index === 0 ? 'bg-neon-500 text-white' : 
                  index === 1 ? 'bg-white text-dark-bg' : 
                  index === 2 ? 'bg-dark-text text-white' : 'bg-dark-bg text-dark-text'}`}>
                #{index + 1}
             </div>

             {/* Main Content Area */}
             <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative z-0">
                
                {/* Profile Info */}
                <div className="flex items-center gap-5 flex-1 min-w-0 w-full md:w-auto mt-6 md:mt-0">
                    <div className="relative shrink-0">
                      <img 
                          src={user.avatar_url} 
                          alt={user.login} 
                          className="w-16 h-16 sm:w-20 sm:h-20 border border-dark-border bg-dark-bg object-cover shadow-md"
                          loading="lazy"
                      />
                      {index < 3 && (
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-dark-surface border border-dark-border flex items-center justify-center rounded-full text-[10px]">
                           {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold text-white truncate group-hover:text-neon-400 transition-colors">
                              {user.name || user.login}
                          </h3>
                          <span className="text-sm text-dark-text font-mono">@{user.login}</span>
                        </div>
                        
                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-y-1 gap-x-3 mt-2 text-xs text-dark-text/80">
                           {user.location && (
                             <div className="flex items-center gap-1">
                               <MapPin size={10} />
                               <span className="truncate max-w-[150px]">{user.location}</span>
                             </div>
                           )}
                           {user.company && (
                             <div className="flex items-center gap-1">
                               <Building size={10} />
                               <span className="truncate max-w-[150px]">{user.company}</span>
                             </div>
                           )}
                        </div>

                        {user.bio && (
                          <p className="text-xs text-dark-text/60 truncate mt-2 max-w-lg hidden sm:block">
                            {user.bio}
                          </p>
                        )}
                    </div>
                </div>

                {/* Stats Grid - "UserModal" Style */}
                <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                   <div className="grid grid-cols-4 border border-dark-border divide-x divide-dark-border bg-dark-bg/50 rounded-sm overflow-hidden">
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
                </div>

                {/* Desktop Action */}
                <div className="hidden md:block">
                    <a 
                      href={user.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full border border-dark-border text-dark-text hover:text-white hover:bg-neon-500 hover:border-neon-500 transition-all shadow-sm"
                      title="View on GitHub"
                    >
                      <ExternalLink size={18} />
                    </a>
                </div>
             </div>

             {/* Mobile Footer Action */}
             <a 
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden flex items-center justify-between px-5 py-3 bg-dark-bg/50 border-t border-dark-border text-xs text-dark-text hover:text-neon-400 hover:bg-dark-bg transition-colors"
             >
                <span className="font-medium">View GitHub Profile</span>
                <ExternalLink size={14} />
             </a>
        </div>
      ))}

      {loading && users.length > 0 && (
          <div className="p-4 text-center text-dark-text text-xs bg-dark-surface border border-dark-border">
             <div className="flex items-center justify-center gap-2">
               <div className="animate-spin h-3 w-3 border-2 border-neon-400 border-t-transparent"></div>
               <span>Loading more...</span>
             </div>
          </div>
      )}
    </div>
  );
};