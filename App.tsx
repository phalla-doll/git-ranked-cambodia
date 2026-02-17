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
  LayoutDashboard,
  Trophy,
  ArrowRight
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
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
  const [totalCount, setTotalCount] = useState(0);
  const [rateLimitHit, setRateLimitHit] = useState(false);

  // Autocomplete State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const inputWrapperRef = useRef<HTMLFormElement>(null);

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
    setError(null);
    setRateLimitHit(false);
    setShowSuggestions(false);
    try {
      const { users: fetchedUsers, total_count, rateLimited, error: apiError } = await searchUsersInLocation(loc, sortBy, 1, apiKey);
      
      if (apiError) {
        setError(apiError);
      } else {
        setUsers(fetchedUsers);
        setTotalCount(total_count);
        setRateLimitHit(rateLimited);
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred while processing your request.");
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

  const getListTitle = () => {
    switch (sortBy) {
      case SortOption.FOLLOWERS: return "Top Profiles by Followers";
      case SortOption.REPOS: return "Top Profiles by Repositories";
      case SortOption.CONTRIBUTIONS: return "Top Profiles by Contributions";
      case SortOption.JOINED: return "Newest Members";
      default: return "Top Profiles";
    }
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
    <div className="min-h-screen font-sans text-apple-text bg-apple-bg selection:bg-apple-blue selection:text-white">
      
      {/* Rate Limit Banner */}
      {rateLimitHit && (
        <div className="bg-orange-50 border-b border-orange-100 relative z-50">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                <span className="text-xs font-medium text-orange-800">
                  Rate limit reached. Showing cached data.
                </span>
              </div>
              <button 
                onClick={() => setShowKeyInput(true)}
                className="text-[10px] font-semibold text-orange-700 bg-white border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors"
              >
                Add Key
              </button>
           </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                  <Terminal className="text-white h-5 w-5" />
               </div>
               <div className="flex flex-col">
                  <span className="font-bold text-lg text-apple-text leading-none tracking-tight">
                    GitRanked
                  </span>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Search Input */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-apple-blue/20 transition-all w-64">
                <Search size={16} className="text-gray-400" />
                <input 
                  type="text"
                  placeholder="Find user..."
                  className="bg-transparent border-none focus:outline-none text-sm w-full text-apple-text placeholder-gray-400 font-medium"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onKeyDown={handleUserSearchKeyDown}
                  disabled={isSearchingUser}
                />
                {isSearchingUser && <Loader2 size={14} className="text-apple-blue animate-spin" />}
              </div>

              <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`p-2 rounded-full transition-all ${
                  apiKey 
                  ? 'text-apple-blue bg-blue-50' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
                title="API Settings"
              >
                <Key size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* API Key Modal Overlay */}
      {showKeyInput && (
        <div className="absolute top-16 right-0 left-0 z-30 bg-white/90 border-b border-gray-200 backdrop-blur-xl animate-in slide-in-from-top-2 shadow-lg">
           <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
             <div className="text-sm text-apple-text">
               <p className="font-semibold mb-1">GitHub Access Token</p>
               <p className="text-gray-500">Add a token to increase API rate limits.</p>
             </div>
             <div className="flex w-full md:w-auto gap-2">
               <input 
                  type="password" 
                  placeholder="ghp_..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm w-full md:w-80 focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue transition-all"
               />
               <button 
                 onClick={handleSaveApiKey}
                 className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors"
               >
                 Save
               </button>
             </div>
           </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-8 justify-between items-end">
          <div className="w-full md:max-w-lg">
             <h1 className="text-3xl font-bold tracking-tight mb-6">Developer Rankings</h1>
             <form onSubmit={handleSearch} className="relative group" ref={inputWrapperRef}>
                <div className="relative shadow-soft rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-0 ring-1 ring-gray-200 text-apple-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 transition-all font-medium text-lg"
                    placeholder="Enter location..."
                    value={location}
                    onChange={handleLocationChange}
                    onFocus={() => {
                        if (location.trim().length > 0 && suggestions.length > 0) setShowSuggestions(true);
                    }}
                    autoComplete="off"
                  />
                  <div className="absolute inset-y-2 right-2">
                    <button type="submit" className="h-full px-6 bg-apple-blue hover:bg-apple-blueHover text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                      Search
                    </button>
                  </div>
                </div>
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ul 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-hover border border-gray-100 z-50 max-h-60 overflow-y-auto py-2"
                  >
                    {suggestions.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black cursor-pointer transition-colors"
                      >
                         {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
             </form>
          </div>

          {/* Pill Tabs */}
          <div className="flex overflow-x-auto custom-scrollbar bg-white/60 backdrop-blur-xl p-1.5 rounded-full border border-gray-200/50 shadow-soft w-full md:w-auto">
             {[
               { id: SortOption.FOLLOWERS, label: 'Followers' },
               { id: SortOption.CONTRIBUTIONS, label: 'Contributions' },
               { id: SortOption.REPOS, label: 'Repositories' },
               { id: SortOption.JOINED, label: 'Newest' }
             ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`flex-1 md:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ease-out whitespace-nowrap ${
                    sortBy === option.id 
                      ? 'bg-white text-apple-text shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 font-semibold scale-100' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50 scale-95'
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
            label="Total Developers" 
            value={totalCount > 0 ? (totalCount > 1000 ? `${(totalCount/1000).toFixed(1)}K+` : totalCount) : 0} 
            icon={Users} 
          />
          <StatCard 
            label="Top Influence" 
            value={topUser ? topUser.followers.toLocaleString() : '-'} 
            icon={Activity}
            trend={topUser ? topUser.login : ''}
          />
          <StatCard 
            label="Total Repositories" 
            value={totalRepos.toLocaleString()} 
            icon={GitBranch} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-apple-text">{getListTitle()}</h2>
             </div>
             <LeaderboardTable users={users} sortBy={sortBy} loading={loading} error={error} />
             
             {/* Self-check prompt */}
             <div className="bg-blue-50 rounded-2xl p-6 flex items-center justify-between mt-4 border border-blue-100">
                <div>
                  <h4 className="font-semibold text-apple-blue mb-1">Are you a developer in {location}?</h4>
                  <p className="text-sm text-blue-800/70 max-w-sm">
                    If you don't see yourself here, try searching for your username directly in the top bar to verify your stats.
                  </p>
                </div>
                <div className="hidden sm:block p-3 bg-white rounded-full text-apple-blue shadow-sm">
                   <ArrowRight size={20} />
                </div>
             </div>
          </div>

          {/* Sidebar / Charts */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100">
              <h3 className="text-sm font-semibold text-apple-text mb-6">Follower Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{fill: '#86868b', fontSize: 11, fontWeight: 500}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f5f5f7'}}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        backgroundColor: '#fff',
                        color: '#1d1d1f',
                      }}
                    />
                    <Bar 
                      dataKey="followers" 
                      radius={[0, 4, 4, 0]} 
                      barSize={16}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0071e3' : '#9bbbe3'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Cpu size={100} />
               </div>
               <h3 className="text-sm font-semibold text-white mb-2 relative z-10">Ranking Algorithm</h3>
               <p className="text-gray-400 text-xs leading-relaxed relative z-10 mb-6">
                 We analyze public data points including follower count, repository volume, and contribution history to determine developer influence scores.
               </p>
               <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-wide uppercase text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Activity size={12} />
                  <span>Version 2.1</span>
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