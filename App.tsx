import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Code2, 
  GitBranch, 
  Terminal, 
  AlertCircle,
  Key,
  Loader2
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

function App() {
  const [location, setLocation] = useState('Cambodia');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [users, setUsers] = useState<GitHubUserDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.FOLLOWERS);
  const [totalCount, setTotalCount] = useState(0);

  // User Search State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [modalUser, setModalUser] = useState<GitHubUserDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounced search trigger could go here, but doing submit-based for rate limit safety
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setUsers([]); // Clear current list on new search
    try {
      const { users: fetchedUsers, total_count } = await searchUsersInLocation(location, sortBy, 1, apiKey);
      setUsers(fetchedUsers);
      setTotalCount(total_count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [location, sortBy, apiKey]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
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
              <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all border border-transparent focus-within:border-indigo-200">
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
                className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Key size={16} />
                <span className="hidden sm:inline">API Key</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* API Key Modal / Dropdown */}
      {showKeyInput && (
        <div className="bg-slate-900 text-white p-4">
           <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
             <div className="flex-1">
               <p className="text-sm font-medium text-slate-300 mb-1">Enter GitHub Personal Access Token (Optional)</p>
               <p className="text-xs text-slate-500">Increases rate limit from 60 to 5000 requests/hour. Stored only in memory.</p>
             </div>
             <div className="flex w-full sm:w-auto gap-2">
               <input 
                  type="password" 
                  placeholder="ghp_..." 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-indigo-500"
               />
               <button 
                 onClick={() => { setShowKeyInput(false); fetchUsers(); }}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
               >
                 Save & Reload
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Hero / Filter Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-xl w-full">
               <h1 className="text-3xl font-bold text-slate-900 mb-2">
                 GitRanked <span className="text-indigo-600">{location}</span>
               </h1>
               <p className="text-slate-500 mb-6">
                 Discover the most active and influential developers in your area. 
                 Ranking based on public activity and community engagement.
               </p>

               <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow sm:text-sm shadow-sm"
                    placeholder="Enter location (e.g., Cambodia, Phnom Penh, Tokyo)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <button type="submit" className="absolute inset-y-1.5 right-1.5 bg-slate-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                    Search
                  </button>
               </form>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start lg:self-end">
              <button
                onClick={() => setSortBy(SortOption.FOLLOWERS)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === SortOption.FOLLOWERS 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Most Followed
              </button>
              <button
                onClick={() => setSortBy(SortOption.REPOS)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === SortOption.REPOS 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Most Active
              </button>
               <button
                onClick={() => setSortBy(SortOption.JOINED)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sortBy === SortOption.JOINED 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
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
          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Code2 className="text-indigo-600 h-5 w-5" />
                  Top Developers in {location}
                </h2>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  Rate Limit Safe
                </span>
             </div>
             <LeaderboardTable users={users} sortBy={sortBy} loading={loading} />
          </div>

          {/* Sidebar / Charts */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-6">
                Follower Distribution
              </h3>
              <div className="h-64 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{fill: '#64748b', fontSize: 10}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar 
                      dataKey="followers" 
                      fill="#4f46e5" 
                      radius={[0, 4, 4, 0]} 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <GitBranch size={120} />
               </div>
               <h3 className="text-lg font-bold mb-2 relative z-10">Api Limitations</h3>
               <p className="text-indigo-200 text-sm leading-relaxed relative z-10 mb-4">
                 GitHub's free API limits searches to prevent abuse. 
                 This dashboard ranks users by Followers and Repositories as proxies for contribution, 
                 since contribution graphs are private data.
               </p>
               <div className="flex items-start gap-2 text-xs text-indigo-300 bg-indigo-800/50 p-3 rounded border border-indigo-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>
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