import React from 'react';
import { GitHubUserDetail, SortOption } from '../types';
import { ExternalLink, Activity, AlertTriangle, SearchX, MapPin, Building, Trophy, Medal } from 'lucide-react';
import { UserProfileStats } from './UserProfileStats';

interface LeaderboardTableProps {
  users: GitHubUserDetail[];
  sortBy: SortOption;
  loading: boolean;
  error?: string | null;
}

const RankBadge = ({ rank }: { rank: number }) => {
  let color = "bg-dark-surface text-dark-text border-dark-border";
  let icon = null;

  if (rank === 1) {
    color = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
    icon = <Trophy size={10} className="mr-1" />;
  } else if (rank === 2) {
    color = "bg-slate-300/10 text-slate-300 border-slate-300/20";
    icon = <Medal size={10} className="mr-1" />;
  } else if (rank === 3) {
    color = "bg-amber-700/10 text-amber-600 border-amber-700/20";
    icon = <Medal size={10} className="mr-1" />;
  }

  return (
    <div className={`flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full ${color}`}>
      {icon}
      #{rank}
    </div>
  );
};

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
          <p className="text-white font-medium text-lg tracking-tight">Scanning GitHub Registry...</p>
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
            <h3 className="text-white font-semibold text-xl mb-2">Connection Interrupted</h3>
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
        <h3 className="text-white font-medium text-xl">No Developers Found</h3>
        <p className="text-dark-text mt-2 max-w-sm text-center text-sm">
          We couldn't find any public profiles matching your location filter. Try broadening your search terms.
        </p>
      </div>
    );
  }

  // 2-Column Grid Layout (Responsive)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 relative min-h-[500px]">
      {users.map((user, index) => (
        <div 
          key={user.id} 
          className="group relative bg-dark-surface border border-dark-border hover:border-dark-text/30 transition-all shadow-sm hover:shadow-lg hover:shadow-black/20 overflow-hidden flex flex-col h-full"
        >
             {/* Hover Glow */}
             <div className="absolute inset-0 bg-gradient-to-br from-neon-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

             {/* Top Section */}
             <div className="p-5 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                           <img 
                              src={user.avatar_url} 
                              alt={user.login} 
                              className="w-12 h-12 rounded-sm border border-dark-border bg-dark-bg object-cover shadow-sm group-hover:border-neon-500/50 transition-colors"
                              loading="lazy"
                           />
                           {index < 3 && (
                               <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-500 rounded-full border-2 border-dark-surface"></div>
                           )}
                        </div>
                        
                        {/* Name Block */}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-white text-base truncate max-w-[120px] sm:max-w-[150px] group-hover:text-neon-400 transition-colors">
                                    {user.name || user.login}
                                </h3>
                            </div>
                            <a 
                               href={user.html_url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-xs text-dark-text hover:text-white font-mono flex items-center gap-1"
                            >
                                @{user.login}
                            </a>
                        </div>
                    </div>

                    <RankBadge rank={index + 1} />
                </div>

                {/* Bio */}
                <div className="mb-4 h-8">
                    {user.bio ? (
                        <p className="text-xs text-dark-text/70 line-clamp-2 leading-relaxed">
                            {user.bio}
                        </p>
                    ) : (
                        <p className="text-xs text-dark-text/30 italic">No bio available</p>
                    )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 text-[10px] text-dark-text/60 font-medium">
                   {user.location && (
                     <div className="flex items-center gap-1 bg-dark-bg/50 px-2 py-1 rounded border border-dark-border/50">
                       <MapPin size={10} />
                       <span className="truncate max-w-[100px]">{user.location}</span>
                     </div>
                   )}
                   {user.company && (
                     <div className="flex items-center gap-1 bg-dark-bg/50 px-2 py-1 rounded border border-dark-border/50">
                       <Building size={10} />
                       <span className="truncate max-w-[100px]">{user.company}</span>
                     </div>
                   )}
                </div>
             </div>

             {/* Bottom Stats Section */}
             <div className="mt-auto border-t border-dark-border bg-dark-bg/20 relative z-10">
                <UserProfileStats user={user} sortBy={sortBy} flat={true} />
             </div>
             
             {/* Action Button (Hidden but accessible via whole card click or specific link) */}
             <a 
                href={user.html_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute top-5 right-5 text-dark-text opacity-0 group-hover:opacity-100 hover:text-white transition-all translate-x-2 group-hover:translate-x-0"
             >
                 <ExternalLink size={16} />
             </a>
        </div>
      ))}

      {loading && users.length > 0 && (
          <div className="col-span-full p-4 text-center text-dark-text text-xs bg-dark-surface border border-dark-border">
             <div className="flex items-center justify-center gap-2">
               <div className="animate-spin h-3 w-3 border-2 border-neon-400 border-t-transparent"></div>
               <span>Loading more developers...</span>
             </div>
          </div>
      )}
    </div>
  );
};