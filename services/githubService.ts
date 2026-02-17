import { GitHubUserDetail, GitHubUserSummary, SearchResponse, SortOption } from '../types';

const BASE_URL = 'https://api.github.com';

// Mock data to use when rate limited or for demo purposes
const MOCK_USERS_CAMBODIA: GitHubUserDetail[] = [
  {
    login: "tharith-p",
    id: 101,
    avatar_url: "https://picsum.photos/200/200?random=1",
    html_url: "https://github.com/tharith-p",
    name: "Tharith Pangs",
    company: "GitRanked KH",
    blog: "https://gitranked.kh",
    location: "Phnom Penh, Cambodia",
    email: null,
    bio: "Full stack developer passionate about React and Node.js.",
    public_repos: 45,
    public_gists: 12,
    followers: 1205,
    following: 110,
    created_at: "2018-01-15T10:20:30Z",
    recent_activity_count: 156
  },
  {
    login: "sopheak-dev",
    id: 102,
    avatar_url: "https://picsum.photos/200/200?random=2",
    html_url: "https://github.com/sopheak-dev",
    name: "Sopheak",
    company: "KhmerCode",
    blog: "",
    location: "Siem Reap, Cambodia",
    email: null,
    bio: "Open source contributor. Rust enthusiast.",
    public_repos: 82,
    public_gists: 5,
    followers: 890,
    following: 45,
    created_at: "2019-05-10T08:00:00Z",
    recent_activity_count: 89
  },
  {
    login: "vireak-codes",
    id: 103,
    avatar_url: "https://picsum.photos/200/200?random=3",
    html_url: "https://github.com/vireak-codes",
    name: "Vireak Roth",
    company: "StartUp Inc",
    blog: "",
    location: "Cambodia",
    email: null,
    bio: "Building the future of tech in SEA.",
    public_repos: 24,
    public_gists: 2,
    followers: 650,
    following: 300,
    created_at: "2020-03-22T14:15:00Z",
    recent_activity_count: 245
  },
  {
    login: "dara-js",
    id: 104,
    avatar_url: "https://picsum.photos/200/200?random=4",
    html_url: "https://github.com/dara-js",
    name: "Dara Ly",
    company: null,
    blog: "",
    location: "Battambang, Cambodia",
    email: null,
    bio: "JavaScript all the way.",
    public_repos: 112,
    public_gists: 20,
    followers: 430,
    following: 12,
    created_at: "2016-11-02T09:30:00Z",
    recent_activity_count: 12
  },
  {
    login: "bopha-design",
    id: 105,
    avatar_url: "https://picsum.photos/200/200?random=5",
    html_url: "https://github.com/bopha-design",
    name: "Bopha Chan",
    company: "Creative Studio",
    blog: "https://bopha.design",
    location: "Phnom Penh",
    email: null,
    bio: "Frontend Engineer & UI Designer.",
    public_repos: 18,
    public_gists: 1,
    followers: 340,
    following: 80,
    created_at: "2021-01-05T11:00:00Z",
    recent_activity_count: 34
  }
];

export const getUserByName = async (username: string, apiKey?: string): Promise<GitHubUserDetail | null> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (apiKey) {
    headers['Authorization'] = `token ${apiKey}`;
  }

  try {
    const response = await fetch(`${BASE_URL}/users/${username}`, { headers });
    if (!response.ok) return null;
    const user = await response.json() as GitHubUserDetail;
    
    // Also fetch activity for single user
    try {
       const eventsRes = await fetch(`${BASE_URL}/users/${username}/events?per_page=30`, { headers });
       if (eventsRes.ok) {
          const events = await eventsRes.json();
          user.recent_activity_count = Array.isArray(events) ? events.length : 0;
       }
    } catch (e) {
       // Ignore event fetch error
       user.recent_activity_count = 0;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

/**
 * Github Search API only provides summaries. 
 * We need to fetch details for each user to get accurate follower/repo counts 
 * if we want to display them or sort locally beyond the search API capabilities.
 */
export const searchUsersInLocation = async (
  location: string,
  sort: SortOption,
  page: number = 1,
  apiKey?: string
): Promise<{ users: GitHubUserDetail[], total_count: number, rateLimited: boolean, error?: string }> => {
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (apiKey) {
    headers['Authorization'] = `token ${apiKey}`;
  }

  // API Limitation: For unauthenticated requests, rate limit is 60/hr.
  
  try {
    const q = `location:${location} type:user`;
    // Map CONTRIBUTIONS sort to REPOSITORIES for the API query as a proxy, 
    // then we will re-sort locally based on actual events.
    const apiSort = sort === SortOption.CONTRIBUTIONS ? 'repositories' : sort;
    
    const searchUrl = `${BASE_URL}/search/users?q=${encodeURIComponent(q)}&sort=${apiSort}&order=desc&per_page=10&page=${page}`;
    
    const searchRes = await fetch(searchUrl, { headers });

    if (!searchRes.ok) {
        if (searchRes.status === 403 || searchRes.status === 429) {
             console.warn("Rate limited. Returning mock data.");
             // Simulate network delay for mock
             await new Promise(resolve => setTimeout(resolve, 800));
             
             // Sort mock data locally if needed
             let mockUsers = [...MOCK_USERS_CAMBODIA];
             if (sort === SortOption.CONTRIBUTIONS) {
                 mockUsers.sort((a, b) => (b.recent_activity_count || 0) - (a.recent_activity_count || 0));
             } else if (sort === SortOption.FOLLOWERS) {
                 mockUsers.sort((a, b) => b.followers - a.followers);
             } else if (sort === SortOption.REPOS) {
                 mockUsers.sort((a, b) => b.public_repos - a.public_repos);
             }
             
             return { users: mockUsers, total_count: 500, rateLimited: true }; 
        }
        
        // Return explicit error for other status codes (e.g., 500, 404, etc.)
        return { 
          users: [], 
          total_count: 0, 
          rateLimited: false, 
          error: `API Error (${searchRes.status}): ${searchRes.statusText}` 
        };
    }

    const searchData: SearchResponse = await searchRes.json();
    
    // The search result items lack detailed stats (followers, repos). 
    // We must fetch details for each user.
    // We also fetch 'events' to estimate contribution activity.
    
    const detailPromises = searchData.items.map(async (item: GitHubUserSummary) => {
        try {
            // 1. Fetch User Details
            const detailRes = await fetch(`${BASE_URL}/users/${item.login}`, { headers });
            if (!detailRes.ok) return null;
            const userDetail = await detailRes.json() as GitHubUserDetail;

            // 2. Fetch Recent Events (Activity Proxy)
            // Limit to 30 to save bandwidth, we just want a "pulse" count
            try {
                const eventsRes = await fetch(`${BASE_URL}/users/${item.login}/events?per_page=100`, { headers });
                if (eventsRes.ok) {
                    const events = await eventsRes.json();
                    userDetail.recent_activity_count = Array.isArray(events) ? events.length : 0;
                } else {
                    userDetail.recent_activity_count = 0;
                }
            } catch (e) {
                console.warn(`Failed to fetch events for ${item.login}`, e);
                userDetail.recent_activity_count = 0;
            }

            return userDetail;
        } catch (e) {
            return null;
        }
    });

    let detailedUsers = (await Promise.all(detailPromises)).filter((u): u is GitHubUserDetail => u !== null);

    // If sorting by CONTRIBUTIONS, we need to re-sort the page results based on the fetched activity count
    // Note: This only sorts the *current page* of results, not the entire database (GitHub API limitation).
    if (sort === SortOption.CONTRIBUTIONS) {
        detailedUsers.sort((a, b) => (b.recent_activity_count || 0) - (a.recent_activity_count || 0));
    }

    return {
        users: detailedUsers,
        total_count: searchData.total_count,
        rateLimited: false
    };

  } catch (error) {
    console.error("Failed to fetch GitHub data", error);
    // Return error message for network failures
    return { 
      users: [], 
      total_count: 0, 
      rateLimited: false, 
      error: error instanceof Error ? error.message : "Connection failed. Please check your internet." 
    };
  }
};