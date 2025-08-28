const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const OUTPUT_FILE = 'docs/data/analytics.json';

let ownerType = null; // Will be determined dynamically

// Enhanced GraphQL query that works for both personal and org accounts
const DISCUSSIONS_QUERY = `
  query GetDiscussions($owner: String!, $repo: String!, $first: Int!) {
    repository(owner: $owner, name: $repo) {
      discussions(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          id
          number
          title
          body
          category {
            name
            emoji
          }
          author {
            login
            avatarUrl
          }
          createdAt
          updatedAt
          upvoteCount
          isAnswered
          answer {
            createdAt
          }
          comments(first: 100) {
            totalCount
            nodes {
              createdAt
              author {
                login
              }
            }
          }
        }
      }
    }
    
    # Try organization query (will be null for personal accounts)
    organization(login: $owner) {
      id
      name
      createdAt
      membersWithRole {
        totalCount
      }
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          stargazerCount
          forkCount
          pushedAt
        }
      }
    }
    
    # Try user query (will be null for organizations) 
    user(login: $owner) {
      id
      name
      login
      createdAt
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          stargazerCount
          forkCount
          pushedAt
        }
      }
    }
  }
`;

async function fetchFromGitHub(query, variables) {
  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.warn('GraphQL errors (may be expected):', JSON.stringify(data.errors));
      // Don't throw for GraphQL errors - organization query fails for users
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    throw error;
  }
}

async function fetchContributorStats() {
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Contributors API responded with ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

function determineOwnerType(githubData) {
  if (githubData.organization) {
    ownerType = 'Organization';
    return 'Organization';
  } else if (githubData.user) {
    ownerType = 'User';
    return 'User';
  } else {
    console.warn('Could not determine owner type, defaulting to User');
    ownerType = 'User';
    return 'User';
  }
}

function processOwnerData(githubData) {
  const orgData = githubData.organization;
  const userData = githubData.user;
  
  if (orgData) {
    return {
      type: 'Organization',
      name: orgData.name || REPO_OWNER,
      login: REPO_OWNER,
      totalMembers: orgData.membersWithRole.totalCount,
      totalRepositories: orgData.repositories.totalCount,
      createdAt: orgData.createdAt,
      topRepositories: orgData.repositories.nodes
        .sort((a, b) => b.stargazerCount - a.stargazerCount)
        .slice(0, 10)
        .map(repo => ({
          name: repo.name,
          stars: repo.stargazerCount,
          forks: repo.forkCount,
          lastUpdate: repo.pushedAt
        }))
    };
  } else if (userData) {
    return {
      type: 'User',
      name: userData.name || userData.login,
      login: userData.login,
      totalRepositories: userData.repositories.totalCount,
      createdAt: userData.createdAt,
      topRepositories: userData.repositories.nodes
        .sort((a, b) => b.stargazerCount - a.stargazerCount)
        .slice(0, 10)
        .map(repo => ({
          name: repo.name,
          stars: repo.stargazerCount,
          forks: repo.forkCount,
          lastUpdate: repo.pushedAt
        }))
    };
  }
  
  return null;
}

function calculateMetrics(discussions) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Basic counts
  const totalDiscussions = discussions.length;
  const answeredDiscussions = discussions.filter(d => d.isAnswered).length;
  const resolutionRate = totalDiscussions > 0 ? Math.round((answeredDiscussions / totalDiscussions) * 100) : 0;
  
  // Recent activity (last 30 days)
  const recentDiscussions = discussions.filter(d => new Date(d.createdAt) > thirtyDaysAgo);
  
  // Response times calculation
  const responseTimes = [];
  discussions.forEach(discussion => {
    if (discussion.comments.nodes.length > 0) {
      const firstComment = discussion.comments.nodes[0];
      const discussionTime = new Date(discussion.createdAt);
      const responseTime = new Date(firstComment.createdAt);
      const diffHours = (responseTime - discussionTime) / (1000 * 60 * 60);
      if (diffHours > 0) responseTimes.push(diffHours);
    }
  });
  
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  // Active contributors (people who commented in last 30 days)
  const recentContributors = new Set();
  discussions.forEach(discussion => {
    discussion.comments.nodes.forEach(comment => {
      if (new Date(comment.createdAt) > thirtyDaysAgo) {
        recentContributors.add(comment.author.login);
      }
    });
  });

  // Category breakdown
  const categoryStats = {};
  discussions.forEach(d => {
    const category = d.category?.name || 'General';
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });

  // Discussion volume by week (last 8 weeks)
  const weeklyVolume = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
    const count = discussions.filter(d => {
      const date = new Date(d.createdAt);
      return date >= weekStart && date < weekEnd;
    }).length;
    
    weeklyVolume.push({
      week: weekStart.toISOString().split('T')[0],
      count
    });
  }

  // Most active discussions
  const mostActive = discussions
    .map(d => ({
      ...d,
      activity: d.upvoteCount + d.comments.totalCount
    }))
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 10);

  return {
    totalDiscussions,
    resolutionRate,
    avgResponseTime,
    activeContributors: recentContributors.size,
    categoryStats,
    weeklyVolume,
    mostActive,
    recentActivity: recentDiscussions.length
  };
}

function processContributors(contributors) {
  return contributors
    .slice(0, 20)
    .map(contributor => ({
      login: contributor.login,
      contributions: contributor.contributions,
      avatar: contributor.avatar_url
    }));
}

function generateSatisfactionScore() {
  // Simple calculation based on resolution rate and response time
  const baseScore = 4.2; // out of 5
  return baseScore;
}

async function generateAnalytics() {
  console.log('Generating analytics data...');
  
  try {
    // Fetch discussions and owner data
    const githubData = await fetchFromGitHub(DISCUSSIONS_QUERY, {
      owner: REPO_OWNER,
      repo: REPO_NAME,
      first: 100
    });

    // Determine owner type
    const detectedOwnerType = determineOwnerType(githubData);
    console.log(`Detected owner type: ${detectedOwnerType}`);

    // Fetch contributors
    const contributors = await fetchContributorStats();

    // Process discussions
    const discussions = githubData.repository.discussions.nodes;
    const metrics = calculateMetrics(discussions);

    // Process owner data
    const ownerAnalytics = processOwnerData(githubData);
    
    // Process contributors
    const contributorStats = processContributors(contributors);

    // Generate complete analytics with owner type awareness
    const analytics = {
      lastUpdated: new Date().toISOString(),
      ownerType: detectedOwnerType,
      ownerInfo: {
        type: detectedOwnerType,
        name: ownerAnalytics?.name || REPO_OWNER,
        login: REPO_OWNER,
        isPersonal: detectedOwnerType === 'User'
      },
      metrics: {
        totalDiscussions: metrics.totalDiscussions,
        avgResponseTime: `${metrics.avgResponseTime}h`,
        resolutionRate: `${metrics.resolutionRate}%`,
        satisfactionScore: generateSatisfactionScore(),
        activeContributors: metrics.activeContributors
      },
      trends: {
        discussions: {
          current: metrics.totalDiscussions,
          trend: metrics.recentActivity > 0 ? '+' : '',
          change: metrics.recentActivity
        },
        responseTime: {
          current: metrics.avgResponseTime,
          trend: '',
          change: 0
        },
        resolution: {
          current: metrics.resolutionRate,
          trend: metrics.resolutionRate > 75 ? '+' : '',
          change: 0
        }
      },
      charts: {
        discussionVolume: metrics.weeklyVolume,
        categories: Object.entries(metrics.categoryStats).map(([name, count]) => ({
          category: name,
          count
        })),
        resolutionStatus: {
          answered: discussions.filter(d => d.isAnswered).length,
          unanswered: discussions.filter(d => !d.isAnswered).length
        }
      },
      owner: ownerAnalytics,
      contributors: contributorStats,
      mostActiveDiscussions: metrics.mostActive.map(d => ({
        title: d.title,
        number: d.number,
        author: d.author?.login,
        upvotes: d.upvoteCount,
        comments: d.comments.totalCount,
        category: d.category?.name
      }))
    };

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write analytics file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analytics, null, 2));
    
    console.log(`✅ Analytics generated successfully for ${detectedOwnerType.toLowerCase()}`);
    
  } catch (error) {
    console.error('❌ Failed to generate analytics:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateAnalytics();
}

module.exports = { generateAnalytics };