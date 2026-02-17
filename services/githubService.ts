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
    created_at: "2018-01-15T10:20:30Z"
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
    created_at: "2019-05-10T08:00:00Z"
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
    created_at: "2020-03-22T14:15:00Z"
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
    created_at: "2016-11-02T09:30:00Z"
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
    created_at: "2021-01-05T11:00:00Z"
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
    return await response.json() as GitHubUserDetail;
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
): Promise<{ users: GitHubUserDetail[], total_count: number }> => {
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (apiKey) {
    headers['Authorization'] = `token ${apiKey}`;
  }

  // API Limitation: For unauthenticated requests, rate limit is 60/hr.
  // Use mock data if request fails or purely for demo if no API key is present and quota exceeded.
  
  try {
    const q = `location:${location} type:user`;
    const searchUrl = `${BASE_URL}/search/users?q=${encodeURIComponent(q)}&sort=${sort}&order=desc&per_page=10&page=${page}`;
    
    const searchRes = await fetch(searchUrl, { headers });

    if (!searchRes.ok) {
        if (searchRes.status === 403 || searchRes.status === 429) {
             console.warn("Rate limited. Returning mock data.");
             // Simulate network delay for mock
             await new Promise(resolve => setTimeout(resolve, 800));
             return { users: MOCK_USERS_CAMBODIA, total_count: 500 }; 
        }
        throw new Error(`GitHub Search API Error: ${searchRes.statusText}`);
    }

    const searchData: SearchResponse = await searchRes.json();
    
    // The search result items lack detailed stats (followers, repos). 
    // We must fetch details for each user.
    // Be careful: 1 search + 10 details = 11 requests per page.
    
    const detailPromises = searchData.items.map(async (item: GitHubUserSummary) => {
        const detailRes = await fetch(`${BASE_URL}/users/${item.login}`, { headers });
        if (!detailRes.ok) return null; // Skip if fail
        return detailRes.json() as Promise<GitHubUserDetail>;
    });

    const detailedUsers = (await Promise.all(detailPromises)).filter((u): u is GitHubUserDetail => u !== null);

    return {
        users: detailedUsers,
        total_count: searchData.total_count
    };

  } catch (error) {
    console.error("Failed to fetch GitHub data", error);
    // Fallback to mock data on error for better UX in this demo
    return { users: MOCK_USERS_CAMBODIA, total_count: 500 };
  }
};