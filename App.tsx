import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Code2, 
  GitBranch, 
  Terminal, 
  AlertCircle,
  Key,
  Loader2,
  ExternalLink,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { GitHubUserDetail, SortOption } from './types';
import { searchUsersInLocation, getUserByName } from './services/githubService';
import { StatCard } from './components/StatCard';
import { LeaderboardTable } from './components/LeaderboardTable';
import { UserModal } from './components/UserModal';
import { POPULAR_LOCATIONS } from './data/locations';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function App() {
  const [location, setLocation] = useState('Cambodia');
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gitranked_api_key') || '';
    }
    return '';
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [users, setUsers] = useState<GitHubUserDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
  const [totalCount, setTotalCount] = useState(0);
  const [rateLimitHit, setRateLimitHit] = useState(false);

  // Autocomplete State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [modalUser, setModalUser] = useState<GitHubUserDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputWrapperRef.current && 
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Main search function
  const fetchUsers = useCallback(async (loc: string = location) => {
    setLoading(true);
    setUsers([]); 
    setRateLimitHit(false);
    setShowSuggestions(false);
    try {
      const { users: fetchedUsers, total_count, rateLimited } = await searchUsersInLocation(loc, sortBy, 1, apiKey);
      setUsers(fetchedUsers);
      setTotalCount(total_count);
      setRateLimitHit(rateLimited);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [location, sortBy, apiKey]);

  // Initial load
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Reload when sort or api key changes, but NOT when location changes (wait for submit)
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, apiKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.trim().length > 0) {
      const filtered = POPULAR_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(value.toLowerCase()) && 
        loc.toLowerCase() !== value.toLowerCase()
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    fetchUsers(suggestion);
  };

  const handleUserSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userSearchQuery.trim()) {
      setIsSearchingUser(true);
      try {
        const user = await getUserByName(userSearchQuery.trim(), apiKey);
        if (user) {
          setModalUser(user);
          setIsModalOpen(true);
          setUserSearchQuery(''); // Clear input on success
        } else {
          alert('User not found!');
        }
      } catch (err) {
        console.error(err);
        alert('Error searching for user.');
      } finally {
        setIsSearchingUser(false);
      }
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gitranked_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gitranked_api_key');
    }
    setShowKeyInput(false);
    fetchUsers();
  };

  // Stats for the top cards
  const topUser = users.length > 0 ? users[0] : null;
  const totalFollowers = users.reduce((acc, user) => acc + user.followers, 0);
  const totalRepos = users.reduce((acc, user) => acc + user.public_repos, 0);

  // Data for Chart
  const chartData = users.slice(0, 10).map(u => ({
    name: u.login,
    followers: u.followers,
    repos: u.public_repos
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-sm ring-1 ring-indigo-600/10">
                <Terminal className="text-white h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
                Git<span className="text-indigo-600">Ranked</span>
              </span>
              <span className="font-bold text-xl tracking-tight text-slate-900 sm:hidden">
                GR
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Search Input */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100/80 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all border border-transparent focus-within:border-indigo-200 focus-within:bg-white">
                {isSearchingUser ? (
                  <Loader2 size={16} className="text-indigo-500 animate-spin" />
                ) : (
                  <Search size={16} className="text-slate-400" />
                )}
                <input 
                  type="text"
                  placeholder="Find user (Press Enter)"
                  className="bg-transparent border-none focus:outline-none text-sm w-32 lg:w-48 text-slate-700 placeholder-slate-400 font-medium"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={handleUserSearchKeyDown}
                  disabled={isSearchingUser}
                />
              </div>

              <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                <Key size={18} />
                <span className="hidden sm:inline">API Key</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Rate Limit Banner */}
      {rateLimitHit && (
        <div className="bg-amber-50 border-b border-amber-200 animate-in slide-in-from-top-2 duration-300">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <span className="text-sm text-amber-800 leading-tight">
                  <span className="font-bold">API Rate Limit Reached.</span> You are viewing demo data.
                </span>
              </div>
              <button 
                onClick={() => setShowKeyInput(true)}
                className="text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-full transition-colors"
              >
                Add API Key to Restore
              </button>
           </div>
        </div>
      )}

      {/* API Key Modal / Dropdown */}
      {showKeyInput && (
        <div className="bg-slate-900 text-white p-6 animate-in slide-in-from-top-5 duration-200 shadow-xl">
           <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">
             <div className="flex-1 space-y-2">
               <div className="flex items-center gap-2">
                 <p className="text-base font-medium text-slate-200">Enter GitHub Personal Access Token (Optional)</p>
                 <a 
                   href="https://github.com/settings/tokens/new?description=GitRanked&scopes=read:user" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 hover:underline bg-indigo-500/10 px-2 py-1 rounded"
                 >
                   Generate Token <ExternalLink size={12} />
                 </a>
               </div>
               <p className="text-sm text-slate-400">Increases rate limit from 60 to 5000 requests/hour. Stored locally in your browser.</p>
             </div>
             <div className="flex w-full sm:w-auto gap-3">
               <input 
                  type="password" 
                  placeholder="ghp_..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
               />
               <button 
                 onClick={handleSaveApiKey}
                 className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
               >
                 Save & Reload
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Hero / Filter Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-xl w-full">
               <h1 className="text-4xl font-semibold text-slate-900 mb-4 tracking-tight">
                 GitRanked <span className="text-indigo-600">{location}</span>
               </h1>
               <p className="text-slate-500 mb-8 text-lg leading-relaxed font-light">
                 Discover the most active, influential, and cracked developers in your area. 
                 Ranking based on public activity and community engagement.
               </p>

               <form onSubmit={handleSearch} className="relative group" ref={inputWrapperRef}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-base"
                    placeholder="Enter location (e.g., Cambodia, Phnom Penh, Tokyo)"
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => {
                        if (location.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true);
                    }}
                    autoComplete="off"
                  />
                  
                  {/* Autocomplete Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto"
                    >
                      {suggestions.map((suggestion, index) => (
                        <li 
                          key={index}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="px-5 py-3.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <MapPin size={16} className="text-slate-400" />
                          <span dangerouslySetInnerHTML={{
                             __html: suggestion.replace(new RegExp(`(${escapeRegExp(location)})`, 'gi'), '<span class="font-bold text-indigo-600">$1</span>')
                          }} />
                        </li>
                      ))}
                    </ul>
                  )}

                  <button type="submit" className="absolute inset-y-2 right-2 bg-slate-900 text-white px-6 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform active:scale-95">
                    Search
                  </button>
               </form>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl self-start lg:self-end overflow-x-auto shadow-inner">
              <button
                onClick={() => setSortBy(SortOption.FOLLOWERS)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  sortBy === SortOption.FOLLOWERS 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Most Followed
              </button>
              <button
                onClick={() => setSortBy(SortOption.CONTRIBUTIONS)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  sortBy === SortOption.CONTRIBUTIONS 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <Activity size={16} className={sortBy === SortOption.CONTRIBUTIONS ? 'text-indigo-500' : 'text-slate-400'} />
                Most Contributions
              </button>
              <button
                onClick={() => setSortBy(SortOption.REPOS)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  sortBy === SortOption.REPOS 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Most Public Repos
              </button>
               <button
                onClick={() => setSortBy(SortOption.JOINED)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  sortBy === SortOption.JOINED 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Developers Found" 
            value={totalCount > 0 ? (totalCount > 1000 ? '1000+' : totalCount) : 0} 
            icon={Users} 
            color="text-indigo-600 bg-indigo-50"
          />
          <StatCard 
            label="Top Developer Followers" 
            value={topUser ? topUser.followers.toLocaleString() : '-'} 
            icon={Users}
            trend={topUser ? `Held by @${topUser.login}` : ''}
            color="text-emerald-600 bg-emerald-50"
          />
          <StatCard 
            label="Total Repos (Top 10)" 
            value={totalRepos.toLocaleString()} 
            icon={GitBranch} 
            color="text-blue-600 bg-blue-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2.5 tracking-tight">
                  <div className="p-1.5 bg-indigo-100 rounded-md">
                    <Code2 className="text-indigo-600 h-5 w-5" />
                  </div>
                  Top Developers in {location}
                </h2>
                <span className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                  Rate Limit Safe
                </span>
             </div>
             <LeaderboardTable users={users} sortBy={sortBy} loading={loading} />
          </div>

          {/* Sidebar / Charts */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-8">
                Follower Distribution
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="followers" 
                      fill="#4f46e5" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-xl shadow-lg p-8 text-white relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                 <GitBranch size={160} />
               </div>
               <h3 className="text-lg font-semibold mb-3 relative z-10 tracking-tight">Api Limitations</h3>
               <p className="text-indigo-100/80 text-sm leading-relaxed relative z-10 mb-6 font-light">
                 GitHub's free API limits searches to prevent abuse. 
                 This dashboard ranks users by Followers and Repositories as proxies for contribution, 
                 since contribution graphs are private data.
               </p>
               <div className="flex items-start gap-3 text-xs text-indigo-200 bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/50 backdrop-blur-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-indigo-300" />
                  <span className="leading-relaxed">
                    If data stops loading, you may have hit the 60 requests/hr limit. 
                    Add a token in the top bar to increase this to 5000.
                  </span>
               </div>
            </div>
          </div>
        </div>

        <UserModal 
          user={modalUser} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </main>
    </div>
  );
}

export default App;