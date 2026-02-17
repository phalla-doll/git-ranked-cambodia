import React from 'react';
import { X, MapPin, Link as LinkIcon, Building, Github, Activity, Terminal } from 'lucide-react';
import { GitHubUserDetail } from '../types';

interface UserModalProps {
  user: GitHubUserDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-dark-surface shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-dark-border relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Corner Chevrons */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-neon-500 z-50"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-neon-500 z-50"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-neon-500 z-50"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-neon-500 z-50"></div>

        {/* Header/Banner area */}
        <div className="relative h-28 bg-gradient-to-br from-dark-bg to-dark-surface border-b border-dark-border">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-neon-500/20 text-dark-text hover:text-neon-400 transition-colors z-20"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-5 flex justify-between items-end">
            <div className="relative">
              <img 
                src={user.avatar_url} 
                alt={user.login} 
                className="w-24 h-24 border-4 border-dark-surface shadow-xl bg-dark-bg"
              />
            </div>
            <a 
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-1 px-4 py-2 bg-neon-500 text-white text-xs font-medium hover:bg-neon-400 transition-all flex items-center gap-2 shadow-lg shadow-neon-500/20"
            >
              <Github size={14} />
              View Profile
            </a>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white tracking-tight">{user.name || user.login}</h2>
            <div className="flex items-center gap-2 text-dark-text text-sm mt-1">
               <span className="opacity-50">@</span>
               <span className="font-medium">{user.login}</span>
            </div>
          </div>

          {user.bio && (
            <p className="text-dark-text/80 mb-6 text-sm leading-relaxed font-normal">
              {user.bio}
            </p>
          )}

          <div className="grid grid-cols-4 gap-2 mb-8 bg-dark-bg p-4 border border-dark-border">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">{user.public_repos}</div>
              <div className="text-[9px] text-dark-text uppercase font-medium mt-1">Repos</div>
            </div>
            <div className="text-center border-l border-dark-border">
              <div className="text-lg font-semibold text-white">{user.followers}</div>
              <div className="text-[9px] text-dark-text uppercase font-medium mt-1">Followers</div>
            </div>
            <div className="text-center border-l border-dark-border">
              <div className="text-lg font-semibold text-white">{user.following}</div>
              <div className="text-[9px] text-dark-text uppercase font-medium mt-1">Following</div>
            </div>
            <div className="text-center border-l border-dark-border">
              <div className="text-lg font-semibold text-neon-400">
                  {user.recent_activity_count !== undefined ? user.recent_activity_count : '-'}
              </div>
              <div className="text-[9px] text-dark-text uppercase font-medium mt-1">Activity</div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-dark-text/70">
            {user.location && (
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-dark-text" />
                <span className="font-medium text-dark-heading">{user.location}</span>
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3">
                <Building size={14} className="text-dark-text" />
                <span className="font-medium text-dark-heading">{user.company}</span>
              </div>
            )}
            {user.blog && (
              <div className="flex items-center gap-3">
                <LinkIcon size={14} className="text-dark-text" />
                <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="text-neon-400 hover:underline truncate max-w-[250px] font-medium">
                  {user.blog}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};