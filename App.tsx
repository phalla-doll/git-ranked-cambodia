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
  Activity,
  Cpu,
  LayoutDashboard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
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
  const chartData = users.slice(0, 7).map(u => ({
    name: u.login,
    followers: u.followers,
    repos: u.public_repos
  }));

  return (
    <div className="min-h-screen font-sans text-dark-text bg-dark-bg selection:bg-neon-500 selection:text-white">
      
      {/* Rate Limit Banner */}
      {rateLimitHit && (
        <div className="bg-red-500/10 border-b border-red-500/20 backdrop-blur-md relative z-50">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-xs font-medium text-red-200">
                  Rate limit reached. Showing cached data.
                </span>
              </div>
              <button 
                onClick={() => setShowKeyInput(true)}
                className="text-[10px] font-bold bg-red-500/20 hover:bg-red-500/30 text-red-100 px-3 py-1 rounded transition-colors"
              >
                FIX NOW
              </button>
           </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-dark-border bg-dark-bg/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 items-center py-3">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-neon-500 rounded-xl flex items-center justify-center shadow-lg shadow-neon-500/20">
                  <Terminal className="text-white h-5 w-5" />
               </div>
               <div className="flex flex-col">
                  <span className="font-bold text-lg text-white leading-none">
                    GitRanked
                  </span>
                  <span className="text-[10px] font-medium text-dark-text mt-1">
                    Market Intelligence
                  </span>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Search Input */}
              <div className="hidden md:flex items-center gap-2 bg-dark-surface border border-dark-border rounded-full px-4 py-2 focus-within:border-neon-500/50 focus-within:ring-1 focus-within:ring-neon-500/20 transition-all w-64">
                <Search size={14} className="text-dark-text" />
                <input 
                  type="text"
                  placeholder="Search user..."
                  className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-dark-text/50 font-medium"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={handleUserSearchKeyDown}
                  disabled={isSearchingUser}
                />
                {isSearchingUser && <Loader2 size={14} className="text-neon-400 animate-spin" />}
              </div>

              <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`p-2 rounded-full border transition-all ${
                  apiKey 
                  ? 'border-neon-500/30 text-neon-400 bg-neon-500/10' 
                  : 'border-dark-border text-dark-text hover:text-white hover:bg-dark-surface'
                }`}
                title="API Settings"
              >
                <Key size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* API Key Modal Overlay */}
      {showKeyInput && (
        <div className="absolute top-16 right-0 left-0 z-30 bg-dark-surface/95 border-b border-dark-border backdrop-blur-md animate-in slide-in-from-top-2">
           <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
             <div className="text-sm text-dark-text">
               <p className="text-white font-medium mb-1">Github Access Token</p>
               <p className="opacity-70">Add a token to increase rate limits from 60 to 5,000 requests/hr.</p>
             </div>
             <div className="flex w-full md:w-auto gap-2">
               <input 
                  type="password" 
                  placeholder="Paste ghp_... token here" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-sm w-full md:w-80 focus:outline-none focus:border-neon-500 text-white"
               />
               <button 
                 onClick={handleSaveApiKey}
                 className="bg-neon-500 hover:bg-neon-400 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
               >
                 Save
               </button>
             </div>
           </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
          <div className="w-full md:max-w-md">
             <label className="text-xs font-semibold text-dark-text uppercase mb-2 block ml-1">Location Scope</label>
             <form onSubmit={handleSearch} className="relative group" ref={inputWrapperRef}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neon-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3.5 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-dark-text focus:outline-none focus:border-neon-500 focus:ring-1 focus:ring-neon-500/20 transition-all font-medium text-lg shadow-sm"
                    placeholder="Enter location..."
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => {
                        if (location.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true);
                    }}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-1.5 right-1.5">
                    <button type="submit" className="h-full px-5 bg-neon-500 hover:bg-neon-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-neon-500/20">
                      Update
                    </button>
                  </div>
                </div>
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-dark-surface border border-dark-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="px-5 py-3 text-sm text-dark-text hover:bg-dark-hover hover:text-white cursor-pointer transition-colors border-b border-dark-border/50 last:border-0"
                      >
                         {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
             </form>
          </div>

          <div className="flex bg-dark-surface p-1 rounded-xl border border-dark-border overflow-x-auto">
             {[
               { id: SortOption.FOLLOWERS, label: 'Followers' },
               { id: SortOption.CONTRIBUTIONS, label: 'Activity' },
               { id: SortOption.REPOS, label: 'Repositories' },
               { id: SortOption.JOINED, label: 'Newest' }
             ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    sortBy === option.id 
                      ? 'bg-neon-500 text-white shadow-md' 
                      : 'text-dark-text hover:text-white hover:bg-dark-bg'
                  }`}
                >
                  {option.label}
                </button>
             ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Developers Found" 
            value={totalCount > 0 ? (totalCount > 1000 ? '1K+' : totalCount) : 0} 
            icon={Users} 
            color="text-neon-400 bg-neon-400/10 border-neon-400/20"
          />
          <StatCard 
            label="Top Influence" 
            value={topUser ? topUser.followers.toLocaleString() : '-'} 
            icon={Activity}
            trend={topUser ? `Lead: ${topUser.login}` : ''}
            color="text-blue-400 bg-blue-400/10 border-blue-400/20"
          />
          <StatCard 
            label="Code Volume" 
            value={totalRepos.toLocaleString()} 
            icon={GitBranch} 
            color="text-purple-400 bg-purple-400/10 border-purple-400/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-5">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <LayoutDashboard className="text-neon-400" size={18} />
                  Market Leaders
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neon-500/10 border border-neon-500/20">
                   <div className="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-neon-400 uppercase tracking-wide">Live Data</span>
                </div>
             </div>
             <LeaderboardTable users={users} sortBy={sortBy} loading={loading} />
          </div>

          {/* Sidebar / Charts */}
          <div className="space-y-6">
            <div className="bg-dark-surface rounded-2xl border border-dark-border p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-white mb-6 flex items-center justify-between">
                <span>Distribution</span>
                <span className="text-xs text-dark-text font-normal">Top 7</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#21262d" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{fill: '#8b949e', fontSize: 11, fontWeight: 500}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#21262d', opacity: 0.4}}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid #30363d', 
                        backgroundColor: '#161b22',
                        color: '#f0f6fc',
                      }}
                      itemStyle={{ color: '#2effa3' }}
                    />
                    <Bar 
                      dataKey="followers" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#00d084' : '#238636'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-dark-border p-6 relative overflow-hidden group bg-gradient-to-br from-dark-surface to-dark-bg">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Cpu size={120} />
               </div>
               <h3 className="text-sm font-semibold text-white mb-2 relative z-10">Data Intelligence</h3>
               <p className="text-dark-text text-xs leading-relaxed relative z-10 mb-4">
                 Our ranking algorithm prioritizes community engagement (Followers) and public output (Repositories) as key signals of developer influence.
               </p>
               <div className="inline-flex items-center gap-2 text-[10px] font-bold text-neon-400 bg-neon-500/10 px-3 py-1.5 rounded-lg border border-neon-500/20">
                  <Activity size={12} />
                  <span>ALGORITHM V2.1 ACTIVE</span>
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