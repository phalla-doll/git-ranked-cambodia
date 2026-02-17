import React from 'react';
import { X, MapPin, Link as LinkIcon, Building, Github, Activity } from 'lucide-react';
import { GitHubUserDetail } from '../types';

interface UserModalProps {
  user: GitHubUserDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Banner area */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-600 to-violet-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/10 hover:bg-black/20 rounded-full text-white/90 transition-colors backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-14 mb-5 flex justify-between items-end">
            <img 
              src={user.avatar_url} 
              alt={user.login} 
              className="w-28 h-28 rounded-2xl border-[5px] border-white shadow-lg bg-white"
            />
            <a 
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
            >
              <Github size={18} />
              View Profile
            </a>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{user.name || user.login}</h2>
            <p className="text-slate-500 font-mono text-sm mt-0.5">@{user.login}</p>
          </div>

          {user.bio && (
            <p className="text-slate-600 mb-8 text-sm leading-relaxed font-light">
              {user.bio}
            </p>
          )}

          <div className="grid grid-cols-4 gap-4 mb-8 border-y border-slate-100 py-6">
            <div className="text-center">
              <div className="text-xl font-semibold text-slate-900 font-mono">{user.public_repos}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Repos</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-xl font-semibold text-slate-900 font-mono">{user.followers}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Followers</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-xl font-semibold text-slate-900 font-mono">{user.following}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Following</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-xl font-semibold text-indigo-600 font-mono">
                  {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Activity</div>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            {user.location && (
              <div className="flex items-center gap-3.5">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                   <MapPin size={16} />
                </div>
                <span className="font-medium">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3.5">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                   <Building size={16} />
                </div>
                <span className="font-medium">{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-3.5">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                   <LinkIcon size={16} />
                </div>
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate max-w-[250px] font-medium">
                  {user.blog}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3.5 pt-2">
                 <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400">
                   <Activity size={16} />
                 </div>
                 <span className="text-xs text-slate-500 leading-tight">Activity count estimated based on last 90 days public events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};