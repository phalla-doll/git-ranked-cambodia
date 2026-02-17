import { GitHubUserDetail, GitHubUserSummary, SearchResponse, SortOption } from '../types';

const BASE_URL = 'https://api.github.com';
const GRAPHQL_URL = 'https://api.github.com/graphql';

// Base mock data
const BASE_MOCK_USERS: GitHubUserDetail[] = [
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
    recent_activity_count: 890
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
    recent_activity_count: 2400
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
    recent_activity_count: 420
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
    recent_activity_count: 1500
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
    recent_activity_count: 350
  }
];

// Generate 50 mock users
const generateMockUsers = (count: number): GitHubUserDetail[] => {
  const users = [...BASE_MOCK_USERS];
  const companies = ["Freelance", "TechKhmer", "StartupKH", "AngkorDev", "MekongSoft", "Smart Axiata", null];
  const locations = ["Phnom Penh", "Siem Reap", "Battambang", "Kampot", "Sihanoukville", "Cambodia"];
  const firstNames = ["Chan", "Sok", "Dara", "Vireak", "Srey", "Piseth", "Rithy", "Nary", "Bona", "Sophea"];
  const lastNames = ["Heng", "Lim", "Ng", "Chea", "Ly", "Keo", "Ouk", "Seng", "Mao", "Sok"];

  for (let i = users.length; i < count; i++) {
    const template = users[i % users.length];
    const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const randomLogin = randomName.toLowerCase().replace(" ", "_") + Math.floor(Math.random() * 1000);
    
    users.push({
        ...template,
        id: 2000 + i,
        login: randomLogin,
        name: randomName,
        followers: Math.floor(template.followers * (0.1 + Math.random() * 0.8)),
        public_repos: Math.floor(template.public_repos * (0.2 + Math.random() * 1.5)),
        recent_activity_count: Math.floor((template.recent_activity_count || 0) * (0.2 + Math.random() * 2.5)),
        company: companies[Math.floor(Math.random() * companies.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        avatar_url: `https://picsum.photos/200/200?random=${i + 10}`,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 100000000000)).toISOString()
    });
  }
  
  // Return sorted by default (followers) for mock consistency
  return users.sort((a, b) => b.followers - a.followers);
};

const MOCK_USERS_CAMBODIA = generateMockUsers(50);

// Fallback logic for REST API (when no token is provided)
const calculateCommitsFromEvents = (events: any[]): number => {
    if (!Array.isArray(events)) return 0;
    return events.reduce((acc, event) => {
        // Only count PushEvents
        if (event.type === 'PushEvent' && event.payload?.size) {
            return acc + (Number(event.payload.size) || 0);
        }
        return acc;
    }, 0);
};

// --- GraphQL Helpers ---

// Split array into chunks to avoid giant queries
const chunkArray = (arr: any[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// Fetch details for multiple users via GraphQL to save requests and get accurate contribution data
const fetchGraphQLUserDetails = async (usernames: string[], token: string): Promise<Record<string, GitHubUserDetail>> => {
  // We can't query too many at once due to complexity limits, but 20-25 should be safe for this specific query.
  const chunks = chunkArray(usernames, 25);
  let allUsers: Record<string, GitHubUserDetail> = {};

  for (const chunk of chunks) {
    const queries = chunk.map((username, index) => {
      // Use clean alias by removing special chars from username for the key, but passing real login to func
      const safeKey = `user_${index}`; 
      return `
        ${safeKey}: user(login: "${username}") {
          login
          databaseId
          avatarUrl
          url
          name
          company
          websiteUrl
          location
          email
          bio
          createdAt
          followers { totalCount }
          following { totalCount }
          repositories(privacy: PUBLIC) { totalCount }
          gists(privacy: PUBLIC) { totalCount }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
        }
      `;
    }).join('\n');

    const query = `query { ${queries} }`;

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      
      if (result.data) {
        chunk.forEach((username, index) => {
           const safeKey = `user_${index}`;
           const data = result.data[safeKey];
           if (data) {
             allUsers[username.toLowerCase()] = {
               login: data.login,
               id: data.databaseId,
               avatar_url: data.avatarUrl,
               html_url: data.url,
               name: data.name,
               company: data.company,
               blog: data.websiteUrl,
               location: data.location,
               email: data.email,
               bio: data.bio,
               public_repos: data.repositories?.totalCount || 0,
               public_gists: data.gists?.totalCount || 0,
               followers: data.followers?.totalCount || 0,
               following: data.following?.totalCount || 0,
               created_at: data.createdAt,
               recent_activity_count: data.contributionsCollection?.contributionCalendar?.totalContributions || 0
             };
           }
        });
      }
    } catch (e) {
      console.warn("GraphQL chunk fetch failed", e);
    }
  }

  return allUsers;
};

// --- Main Service Functions ---

export const getUserByName = async (username: string, apiKey?: string): Promise<GitHubUserDetail | null> => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (apiKey) {
    headers['Authorization'] = `token ${apiKey}`;
    
    // Try GraphQL first if token exists for maximum accuracy
    try {
      const map = await fetchGraphQLUserDetails([username], apiKey);
      if (map[username.toLowerCase()]) {
        return map[username.toLowerCase()];
      }
    } catch (e) {
      console.warn("GraphQL single fetch failed, falling back to REST");
    }
  }

  // Fallback to REST
  try {
    const response = await fetch(`${BASE_URL}/users/${username}`, { headers });
    if (!response.ok) return null;
    const user = await response.json() as GitHubUserDetail;
    
    // Fetch activity Proxy via REST Events (Inaccurate but works without token)
    try {
       const eventsRes = await fetch(`${BASE_URL}/users/${username}/events?per_page=100`, { headers });
       if (eventsRes.ok) {
          const events = await eventsRes.json();
          user.recent_activity_count = calculateCommitsFromEvents(events);
       }
    } catch (e) {
       user.recent_activity_count = 0;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

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
  
  try {
    const q = `location:${location} type:user`;
    const apiSort = sort === SortOption.CONTRIBUTIONS ? 'repositories' : sort;
    
    // 1. Get the list of users via REST Search (Best for finding by location)
    const searchUrl = `${BASE_URL}/search/users?q=${encodeURIComponent(q)}&sort=${apiSort}&order=desc&per_page=50&page=${page}`;
    
    const searchRes = await fetch(searchUrl, { headers });

    if (!searchRes.ok) {
        if (searchRes.status === 403 || searchRes.status === 429) {
             console.warn("Rate limited. Returning mock data.");
             await new Promise(resolve => setTimeout(resolve, 800));
             
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
        return { 
          users: [], 
          total_count: 0, 
          rateLimited: false, 
          error: `API Error (${searchRes.status}): ${searchRes.statusText}` 
        };
    }

    const searchData: SearchResponse = await searchRes.json();
    const usernames = searchData.items.map(i => i.login);

    // 2. Hydrate details
    let detailedUsers: GitHubUserDetail[] = [];

    if (apiKey && usernames.length > 0) {
       // STRATEGY A: High Accuracy via GraphQL (With Token)
       // This gets the REAL contribution count (green squares)
       try {
         const usersMap = await fetchGraphQLUserDetails(usernames, apiKey);
         detailedUsers = Object.values(usersMap);
         
         // Maintain order from search result if possible, or just re-sort below
       } catch (e) {
         console.error("GraphQL hydration failed", e);
         // If GraphQL fails, detailedUsers is empty, code will fall through? 
         // Ideally we should fallback to REST loop below, but simpler to return error or empty.
         // Let's assume if provided token is valid, this works.
       }
    } 
    
    if (detailedUsers.length === 0) {
       // STRATEGY B: Fallback via REST (No Token or GraphQL failed)
       // Fetches details one by one and estimates activity from public events
        const detailPromises = searchData.items.map(async (item: GitHubUserSummary) => {
            try {
                const detailRes = await fetch(`${BASE_URL}/users/${item.login}`, { headers });
                if (!detailRes.ok) return null;
                const userDetail = await detailRes.json() as GitHubUserDetail;

                // Estimate activity
                try {
                    const eventsRes = await fetch(`${BASE_URL}/users/${item.login}/events?per_page=100`, { headers });
                    if (eventsRes.ok) {
                        const events = await eventsRes.json();
                        userDetail.recent_activity_count = calculateCommitsFromEvents(events);
                    } else {
                        userDetail.recent_activity_count = 0;
                    }
                } catch (e) {
                    userDetail.recent_activity_count = 0;
                }
                return userDetail;
            } catch (e) {
                return null;
            }
        });
        detailedUsers = (await Promise.all(detailPromises)).filter((u): u is GitHubUserDetail => u !== null);
    }
    
    // Check for rate limits during detail fetching
    if (detailedUsers.length === 0 && searchData.items.length > 0) {
        return { users: MOCK_USERS_CAMBODIA, total_count: 500, rateLimited: true };
    }

    // Sort locally based on the fetched high-fidelity data
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
    return { 
      users: [], 
      total_count: 0, 
      rateLimited: false, 
      error: error instanceof Error ? error.message : "Connection failed." 
    };
  }
};