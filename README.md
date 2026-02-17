# GitRanked Cambodia 🇰🇭

A modern, minimalist leaderboard that ranks GitHub users in Cambodia (and any other location) based on public activity and community engagement. Built with React, Tailwind CSS, and the GitHub API.

## 🚀 Features

- **Location-Based Ranking**: Automatically fetches and ranks users from a specific location (default: Cambodia).
- **Dynamic Filtering**: Sort users by:
  - Most Followed
  - Most Active (Public Repos)
  - Newest Members
- **User Search**: Directly search for any GitHub user to view their detailed profile card.
- **Detailed Stats**: View followers, following, repo counts, bio, and more in a sleek modal.
- **Data Visualization**: Interactive charts showing follower distribution among top developers.
- **Rate Limit Handling**: Graceful degradation with mock data when GitHub API limits are reached, plus support for Personal Access Tokens to increase limits.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Typography**: Inter (Sans) & Roboto Mono (Monospace)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gitranked-cambodia.git
   cd gitranked-cambodia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔑 API Key Configuration

GitHub's free API has a rate limit of **60 requests per hour** for unauthenticated requests. 
To increase this to **5,000 requests per hour**:

1. Click the **"API Key"** button in the top right of the app.
2. Enter your GitHub Personal Access Token (Classic).
   - You can generate one [here](https://github.com/settings/tokens).
   - No specific scopes are required for reading public user data.
3. The key is stored in memory only and is not saved to local storage for security reasons.

## 📝 License

This project is licensed under the MIT License.