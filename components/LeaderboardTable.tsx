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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500">Scanning GitHub for developers...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <p className="text-slate-500">No developers found in this location.</p>
      </div>
    );
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (index === 1) return "bg-slate-100 text-slate-700 border-slate-200";
    if (index === 2) return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-transparent text-slate-500 border-transparent";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 text-center">Rank</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Developer</th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">
                   <Activity size={14} className={sortBy === SortOption.CONTRIBUTIONS ? "text-indigo-600" : ""} /> Est. Activity
                </div>
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                <div className="flex items-center justify-end gap-1">
                   <Users size={14} /> Followers
                </div>
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right hidden sm:table-cell">
                <div className="flex items-center justify-end gap-1">
                   <BookOpen size={14} /> Repos
                </div>
              </th>
              <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 text-center">
                   <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getRankBadge(index)}`}>
                     {index + 1}
                   </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={user.avatar_url} 
                      alt={user.login} 
                      className="w-10 h-10 rounded-full border border-slate-200 shadow-sm"
                    />
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {user.name || user.login}
                        {user.company && <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-normal truncate max-w-[120px]">{user.company}</span>}
                      </div>
                      <div className="text-sm text-slate-500 font-mono">@{user.login}</div>
                      {user.location && (
                         <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                           <MapPin size={10} /> {user.location}
                         </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                   <div className="flex flex-col items-end">
                      <span className={`font-mono font-medium ${sortBy === SortOption.CONTRIBUTIONS ? 'text-indigo-600 font-bold text-lg' : 'text-slate-600'}`}>
                        {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
                      </span>
                      <span className="text-[10px] text-slate-400">recent events</span>
                   </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className={`font-mono font-medium ${sortBy === SortOption.FOLLOWERS ? 'text-indigo-600 font-bold text-lg' : 'text-slate-600'}`}>
                    {user.followers.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right hidden sm:table-cell">
                  <span className={`font-mono font-medium ${sortBy === SortOption.REPOS ? 'text-indigo-600 font-bold text-lg' : 'text-slate-600'}`}>
                    {user.public_repos.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <a 
                    href={user.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="View GitHub Profile"
                  >
                    <ExternalLink size={16} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && users.length > 0 && (
          <div className="p-4 text-center text-slate-500 text-sm border-t border-slate-100 bg-slate-50">
             Loading more developers...
          </div>
      )}
    </div>
  );
};