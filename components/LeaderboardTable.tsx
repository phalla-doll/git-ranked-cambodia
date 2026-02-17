import React from 'react';
import { GitHubUserDetail, SortOption } from '../types';
import { Users, BookOpen, MapPin, ExternalLink, Activity, Terminal } from 'lucide-react';

interface LeaderboardTableProps {
  users: GitHubUserDetail[];
  sortBy: SortOption;
  loading: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, sortBy, loading }) => {
  if (loading && users.length === 0) {
    return (
      <div className="bg-dark-surface rounded-2xl border border-dark-border p-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-neon-400 border-t-transparent mb-6"></div>
        <p className="text-dark-heading font-medium">Synchronizing Data...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-dark-surface rounded-2xl border border-dark-border p-16 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mb-4 border border-dark-border">
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
    <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden flex flex-col shadow-xl shadow-black/20">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-dark-surface border-b border-dark-border">
              <th className="py-5 px-6 text-xs font-medium text-dark-text uppercase tracking-wider w-20 text-center">Rank</th>
              <th className="py-5 px-6 text-xs font-medium text-dark-text uppercase tracking-wider">Developer</th>
              <th className="py-5 px-6 text-xs font-medium text-dark-text uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-2">
                   <Activity size={14} className={sortBy === SortOption.CONTRIBUTIONS ? "text-neon-400" : ""} />
                   <span>Activity</span>
                </div>
              </th>
              <th className="py-5 px-6 text-xs font-medium text-dark-text uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-2">
                   <Users size={14} /> 
                   <span>Followers</span>
                </div>
              </th>
              <th className="py-5 px-6 text-xs font-medium text-dark-text uppercase tracking-wider text-right hidden sm:table-cell">
                <div className="flex items-center justify-end gap-2">
                   <BookOpen size={14} /> 
                   <span>Repos</span>
                </div>
              </th>
              <th className="py-5 px-6 text-xs font-medium text-dark-text uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-dark-hover/50 transition-colors group">
                <td className="py-4 px-6 text-center">
                   <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${getRankStyle(index)}`}>
                     {index + 1}
                   </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={user.avatar_url} 
                        alt={user.login} 
                        className="w-12 h-12 rounded-xl border border-dark-border shadow-sm bg-dark-bg object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                         <span className="font-semibold text-dark-heading text-sm truncate max-w-[180px] group-hover:text-neon-400 transition-colors">
                            {user.name || user.login}
                         </span>
                         {user.company && (
                           <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-dark-bg border border-dark-border text-dark-text truncate max-w-[120px]">
                             {user.company}
                           </span>
                         )}
                      </div>
                      <div className="text-xs text-dark-text truncate mt-1">@{user.login}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                   <div className="flex flex-col items-end">
                      <span className={`font-semibold text-sm ${sortBy === SortOption.CONTRIBUTIONS ? 'text-neon-400' : 'text-dark-heading'}`}>
                        {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
                      </span>
                      <span className="text-[10px] text-dark-text">events</span>
                   </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className={`font-semibold text-sm ${sortBy === SortOption.FOLLOWERS ? 'text-neon-400' : 'text-dark-heading'}`}>
                    {user.followers.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right hidden sm:table-cell">
                  <span className={`font-semibold text-sm ${sortBy === SortOption.REPOS ? 'text-neon-400' : 'text-dark-heading'}`}>
                    {user.public_repos.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-dark-bg border border-dark-border text-dark-text hover:text-white hover:bg-neon-500 hover:border-neon-500 transition-all focus:outline-none"
                    title="Access GitHub Profile"
                  >
                    <ExternalLink size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && users.length > 0 && (
          <div className="p-4 text-center text-dark-text text-xs bg-dark-surface border-t border-dark-border">
             <div className="flex items-center justify-center gap-2">
               <div className="animate-spin rounded-full h-3 w-3 border-2 border-neon-400 border-t-transparent"></div>
               <span>Loading more...</span>
             </div>
          </div>
      )}
    </div>
  );
};