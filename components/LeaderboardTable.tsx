import React from 'react';
import { GitHubUserDetail, SortOption } from '../types';
import { ExternalLink, Activity, AlertTriangle, SearchX, Trophy, Medal } from 'lucide-react';
import { UserProfileStats } from './UserProfileStats';

interface LeaderboardTableProps {
  users: GitHubUserDetail[];
  sortBy: SortOption;
  loading: boolean;
  error?: string | null;
}

const RankBadge = ({ rank }: { rank: number }) => {
  let colorClass = "bg-gray-100 text-gray-500 border-gray-200";
  let icon = null;

  if (rank === 1) {
    colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
    icon = <Trophy size={12} className="mr-1" />;
  } else if (rank === 2) {
    colorClass = "bg-gray-100 text-gray-600 border-gray-300";
    icon = <Medal size={12} className="mr-1" />;
  } else if (rank === 3) {
    colorClass = "bg-orange-50 text-orange-700 border-orange-200";
    icon = <Medal size={12} className="mr-1" />;
  }

  return (
    <div className={`flex items-center px-2.5 py-1 text-[11px] font-semibold border rounded-full ${colorClass}`}>
      {icon}
      #{rank}
    </div>
  );
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ users, sortBy, loading, error }) => {
  
  // Loading State
  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <Activity className="text-gray-400" size={20} />
          </div>
          <p className="text-apple-text font-medium text-lg">Loading profiles...</p>
          <p className="text-apple-gray text-sm mt-1">Analyzing GitHub data.</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={20} />
        </div>
        <h3 className="text-apple-text font-semibold text-lg">Connection Issue</h3>
        <p className="text-apple-gray text-sm text-center max-w-xs mt-2">{error}</p>
      </div>
    );
  }

  // Empty State
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <SearchX size={32} className="text-gray-300" />
        </div>
        <h3 className="text-apple-text font-medium text-lg">No Developers Found</h3>
        <p className="text-apple-gray mt-2 max-w-sm text-center text-sm">
          Try adjusting your location or search terms.
        </p>
      </div>
    );
  }

  // List Layout
  return (
    <div className="flex flex-col gap-4 relative min-h-[500px]">
      {users.map((user, index) => (
        <div 
          key={user.id} 
          className="group relative bg-white rounded-2xl border border-white shadow-soft hover:shadow-hover transition-all duration-300 overflow-hidden flex flex-col"
        >
             {/* Top Section */}
             <div className="p-5 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                           <img 
                              src={user.avatar_url} 
                              alt={user.login} 
                              className="w-14 h-14 rounded-full border border-gray-100 bg-gray-50 object-cover shadow-sm"
                              loading="lazy"
                           />
                           {index < 3 && (
                               <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'}`}></div>
                                </div>
                           )}
                        </div>
                        
                        {/* Name Block */}
                        <div className="min-w-0 flex flex-col">
                            <h3 className="font-semibold text-apple-text text-lg truncate group-hover:text-apple-blue transition-colors">
                                {user.name || user.login}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <a 
                                 href={user.html_url} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="text-sm text-apple-gray hover:text-apple-text transition-colors"
                              >
                                  @{user.login}
                              </a>
                              
                              {(user.location || user.company) && (
                                 <>
                                 <span className="w-0.5 h-3 bg-gray-200"></span>
                                 <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                   {user.company || user.location}
                                 </span>
                                 </>
                              )}
                            </div>
                        </div>
                    </div>

                    <RankBadge rank={index + 1} />
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed max-w-3xl mb-1">
                      {user.bio}
                  </div>
                )}
             </div>

             {/* Bottom Stats Section */}
             <div className="mt-auto border-t border-gray-50 bg-gray-50/50">
                <UserProfileStats user={user} sortBy={sortBy} flat={true} />
             </div>
             
             {/* Action Button */}
             <a 
                href={user.html_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute top-5 right-5 p-2 bg-gray-50 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-apple-blue hover:bg-blue-50 transition-all transform scale-90 group-hover:scale-100"
             >
                 <ExternalLink size={16} />
             </a>
        </div>
      ))}
      
      {loading && (
        <div className="flex justify-center py-6">
           <div className="w-6 h-6 border-2 border-gray-200 border-t-apple-blue rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};