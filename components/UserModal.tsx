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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Banner area */}
        <div className="relative h-24 bg-gradient-to-r from-indigo-600 to-purple-600">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <img 
              src={user.avatar_url} 
              alt={user.login} 
              className="w-24 h-24 rounded-xl border-4 border-white shadow-md bg-white"
            />
            <a 
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Github size={16} />
              View Profile
            </a>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">{user.name || user.login}</h2>
            <p className="text-slate-500 font-mono text-sm">@{user.login}</p>
          </div>

          {user.bio && (
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              {user.bio}
            </p>
          )}

          <div className="grid grid-cols-4 gap-2 mb-6 border-y border-slate-100 py-4">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900 font-mono">{user.public_repos}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Repos</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-xl font-bold text-slate-900 font-mono">{user.followers}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Followers</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-xl font-bold text-slate-900 font-mono">{user.following}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Following</div>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="text-xl font-bold text-indigo-600 font-mono">
                  {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">Activity</div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            {user.location && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-slate-400" />
                <span>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3">
                <Building size={16} className="text-slate-400" />
                <span>{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-3">
                <LinkIcon size={16} className="text-slate-400" />
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate max-w-[250px]">
                  {user.blog}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
                 <Activity size={16} className="text-slate-400" />
                 <span className="text-xs text-slate-500">Activity count based on last 90 days public events</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};