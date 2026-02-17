import React from 'react';
import { GitHubUserDetail, SortOption } from '../types';
import { Users, BookOpen, ExternalLink, Activity, Terminal } from 'lucide-react';

interface LeaderboardTableProps {
  users: GitHubUserDetail[];
  sortBy: SortOption;
  loading: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, sortBy, loading }) => {
  if (loading && users.length === 0) {
    return (
      <div className="bg-dark-surface border border-dark-border p-16 flex flex-col items-center justify-center min-h-[400px] relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-dark-border"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-dark-border"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-dark-border"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-dark-border"></div>
        
        <div className="animate-spin h-10 w-10 border-2 border-neon-400 border-t-transparent mb-6"></div>
        <p className="text-dark-heading font-medium">Synchronizing Data...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-dark-surface border border-dark-border p-16 text-center min-h-[400px] flex flex-col items-center justify-center relative">
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-dark-border"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-dark-border"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-dark-border"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-dark-border"></div>

        <div className="w-16 h-16 bg-dark-bg flex items-center justify-center mb-4 border border-dark-border">
            <Terminal size={32} className="text-dark-text" />
        </div>
        <h3 className="text-dark-heading font-semibold text-lg">No Results Found</h3>
        <p className="text-dark-text mt-2 max-w-xs mx-auto">Try adjusting your location filter or search criteria.</p>
      </div>
    );
  }

  const getRankStyle = (index: number) => {
    if (index === 0) return "text-white bg-neon-500 shadow-[0_0_15px_rgba(0,208,132,0.4)] border-transparent";
    if (index === 1) return "text-dark-heading bg-dark-border border-transparent";
    if (index === 2) return "text-dark-heading bg-dark-bg border-dark-border";
    return "text-dark-text bg-transparent border-transparent";
  };

  return (
    <div className="bg-dark-surface border border-dark-border flex flex-col shadow-xl shadow-black/20 relative min-h-[500px]">
      {/* Container Corner Chevrons */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-neon-500 z-10"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-neon-500 z-10"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-neon-500 z-10"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-neon-500 z-10"></div>

      {/* Header - Hidden on mobile, visible on lg */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-dark-border bg-dark-surface/50 text-xs font-medium text-dark-text uppercase tracking-wider">
        <div className="col-span-1 text-center">Rank</div>
        <div className="col-span-5">Developer</div>
        <div className="col-span-2 text-right flex justify-end gap-2 items-center">
            <Activity size={14} className={sortBy === SortOption.CONTRIBUTIONS ? "text-neon-400" : ""} />
            Activity
        </div>
        <div className="col-span-2 text-right flex justify-end gap-2 items-center">
            <Users size={14} />
            Followers
        </div>
        <div className="col-span-1 text-right flex justify-end gap-2 items-center">
            <BookOpen size={14} />
            Repos
        </div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-dark-border">
        {users.map((user, index) => (
          <div 
            key={user.id} 
            className="group relative hover:bg-dark-hover/30 transition-colors p-4 lg:px-6 lg:py-4"
          >
             {/* Row Hover Marker */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                
                {/* Mobile Top Row: Rank + Profile */}
                <div className="col-span-1 lg:col-span-6 flex items-center gap-4">
                   {/* Rank Badge */}
                   <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs font-bold border ${getRankStyle(index)}`}>
                      {index + 1}
                   </div>
                   
                   {/* Avatar & Name */}
                   <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img 
                            src={user.avatar_url} 
                            alt={user.login} 
                            className="w-10 h-10 lg:w-12 lg:h-12 border border-dark-border bg-dark-bg object-cover"
                            loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2">
                             <span className="font-semibold text-dark-heading text-sm group-hover:text-neon-400 transition-colors truncate">
                                {user.name || user.login}
                             </span>
                             {user.company && (
                               <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-dark-bg border border-dark-border text-dark-text truncate max-w-[100px]">
                                 {user.company}
                               </span>
                             )}
                          </div>
                          <div className="text-xs text-dark-text truncate mt-0.5">@{user.login}</div>
                      </div>
                   </div>
                </div>

                {/* Mobile Bottom Row / Desktop Columns: Stats */}
                <div className="col-span-1 lg:col-span-5 grid grid-cols-3 gap-2 lg:gap-4 mt-2 lg:mt-0 pl-12 lg:pl-0">
                    
                    {/* Activity */}
                    <div className="flex flex-col lg:items-end justify-center">
                        <span className="lg:hidden text-[10px] text-dark-text uppercase mb-1 flex items-center gap-1">
                            <Activity size={10} /> Activity
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className={`font-semibold text-sm ${sortBy === SortOption.CONTRIBUTIONS ? 'text-neon-400' : 'text-dark-heading'}`}>
                                {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
                            </span>
                            <span className="text-[10px] text-dark-text hidden lg:inline">events</span>
                        </div>
                    </div>

                    {/* Followers */}
                    <div className="flex flex-col lg:items-end justify-center">
                        <span className="lg:hidden text-[10px] text-dark-text uppercase mb-1 flex items-center gap-1">
                             <Users size={10} /> Followers
                        </span>
                        <span className={`font-semibold text-sm ${sortBy === SortOption.FOLLOWERS ? 'text-neon-400' : 'text-dark-heading'}`}>
                            {user.followers.toLocaleString()}
                        </span>
                    </div>

                    {/* Repos */}
                    <div className="flex flex-col lg:items-end lg:col-span-1 justify-center">
                        <span className="lg:hidden text-[10px] text-dark-text uppercase mb-1 flex items-center gap-1">
                            <BookOpen size={10} /> Repos
                        </span>
                        <span className={`font-semibold text-sm ${sortBy === SortOption.REPOS ? 'text-neon-400' : 'text-dark-heading'}`}>
                             {user.public_repos.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Action Button */}
                <div className="absolute right-4 top-4 lg:static lg:col-span-1 flex justify-center lg:justify-center">
                    <a 
                      href={user.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 bg-dark-bg border border-dark-border text-dark-text hover:text-white hover:bg-neon-500 hover:border-neon-500 transition-all focus:outline-none"
                      title="Access GitHub Profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                </div>

             </div>
          </div>
        ))}
      </div>

      {loading && users.length > 0 && (
          <div className="p-4 text-center text-dark-text text-xs bg-dark-surface border-t border-dark-border">
             <div className="flex items-center justify-center gap-2">
               <div className="animate-spin h-3 w-3 border-2 border-neon-400 border-t-transparent"></div>
               <span>Loading more...</span>
             </div>
          </div>
      )}
    </div>
  );
};