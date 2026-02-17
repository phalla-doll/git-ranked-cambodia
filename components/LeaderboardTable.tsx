import React from 'react';
import { GitHubUserDetail, SortOption } from '../types';
import { Users, BookOpen, Star, MapPin, ExternalLink, Activity } from 'lucide-react';

interface LeaderboardTableProps {
  users: GitHubUserDetail[];
  sortBy: SortOption;
  loading: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, sortBy, loading }) => {
  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
        <p className="text-slate-500 font-medium">Scanning GitHub for developers...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center min-h-[400px] flex items-center justify-center">
        <p className="text-slate-500 font-medium">No developers found in this location.</p>
      </div>
    );
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100";
    if (index === 1) return "bg-slate-100 text-slate-700 border-slate-200";
    if (index === 2) return "bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-100";
    return "bg-white text-slate-500 border-slate-100";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ring-1 ring-slate-100">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 backdrop-blur-sm sticky top-0 z-10">
              <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-20 text-center truncate">Rank</th>
              <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[200px]">Developer</th>
              <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right truncate">
                <div className="flex items-center justify-end gap-1.5">
                   <Activity size={14} className={sortBy === SortOption.CONTRIBUTIONS ? "text-indigo-600" : ""} />
                   <span className="truncate">Est. Activity</span>
                </div>
              </th>
              <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right truncate">
                <div className="flex items-center justify-end gap-1.5">
                   <Users size={14} /> 
                   <span className="truncate">Followers</span>
                </div>
              </th>
              <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right hidden sm:table-cell truncate">
                <div className="flex items-center justify-end gap-1.5">
                   <BookOpen size={14} /> 
                   <span className="truncate">Repos</span>
                </div>
              </th>
              <th className="py-5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center truncate">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="py-5 px-6 text-center">
                   <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border ${getRankBadge(index)} shadow-sm`}>
                     {index + 1}
                   </span>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={user.avatar_url} 
                      alt={user.login} 
                      className="w-11 h-11 rounded-full border border-slate-200 shadow-sm shrink-0 bg-slate-100 group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                         <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-[200px]">
                            {user.name || user.login}
                         </span>
                         {user.company && (
                           <span className="hidden lg:inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-medium truncate max-w-[120px] border border-slate-200">
                             {user.company}
                           </span>
                         )}
                      </div>
                      <div className="text-sm text-slate-500 font-mono truncate mt-0.5">@{user.login}</div>
                      {user.location && (
                         <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate max-w-[200px]">
                           <MapPin size={11} className="shrink-0" /> 
                           <span className="truncate">{user.location}</span>
                         </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6 text-right">
                   <div className="flex flex-col items-end">
                      <span className={`font-mono font-semibold ${sortBy === SortOption.CONTRIBUTIONS ? 'text-indigo-600 text-xl' : 'text-slate-700 text-lg'}`}>
                        {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px] font-medium uppercase tracking-wide">recent events</span>
                   </div>
                </td>
                <td className="py-5 px-6 text-right">
                  <span className={`font-mono font-semibold ${sortBy === SortOption.FOLLOWERS ? 'text-indigo-600 text-xl' : 'text-slate-700 text-lg'}`}>
                    {user.followers.toLocaleString()}
                  </span>
                </td>
                <td className="py-5 px-6 text-right hidden sm:table-cell">
                  <span className={`font-mono font-semibold ${sortBy === SortOption.REPOS ? 'text-indigo-600 text-xl' : 'text-slate-700 text-lg'}`}>
                    {user.public_repos.toLocaleString()}
                  </span>
                </td>
                <td className="py-5 px-6 text-center">
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent hover:border-indigo-100"
                    title="View GitHub Profile"
                  >
                    <ExternalLink size={18} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && users.length > 0 && (
          <div className="p-4 text-center text-slate-500 text-sm border-t border-slate-100 bg-slate-50/50">
             <div className="flex items-center justify-center gap-2">
               <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
               <span className="font-medium">Loading more developers...</span>
             </div>
          </div>
      )}
    </div>
  );
};