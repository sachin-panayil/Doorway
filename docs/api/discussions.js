const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER; // process.env.GITHUB_REPOSITORY_OWNER || 'your-org';
const REPO_NAME = process.env.REPO_NAME; // process.env.GITHUB_REPOSITORY?.split('/')[1] || 'your-repo';
const OUTPUT_FILE = 'docs/data/discussions.json';

// GraphQL query to fetch discussions
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
            id
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
            id
            body
            author {
              login
            }
            createdAt
          }
          comments {
            totalCount
          }
          labels(first: 10) {
            nodes {
              name
              color
            }
          }
        }
      }
      discussionCategories(first: 10) {
        nodes {
          id
          name
          emoji
          description
        }
      }
    }
  }
`;

async function fetchDiscussions() {
  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: DISCUSSIONS_QUERY,
        variables: {
          owner: REPO_OWNER,
          repo: REPO_NAME,
          first: 100 // Fetch up to 100 discussions
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data.repository;
  } catch (error) {
    console.error('Error fetching discussions:', error);
    throw error;
  }
}

function processDiscussions(rawData) {
  // Process and simplify the data structure
  const discussions = rawData.discussions.nodes.map(discussion => ({
    id: discussion.id,
    number: discussion.number,
    title: discussion.title,
    body: discussion.body?.substring(0, 200) + '...', // Truncate body for preview
    category: discussion.category?.name || 'General',
    categoryEmoji: discussion.category?.emoji || '💬',
    author: discussion.author?.login || 'Unknown',
    authorAvatar: discussion.author?.avatarUrl || '',
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,
    upvotes: discussion.upvoteCount,
    isAnswered: discussion.isAnswered,
    commentCount: discussion.comments.totalCount,
    labels: discussion.labels.nodes || []
  }));

  // Count discussions by category
  const categoryCounts = {};
  discussions.forEach(d => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  return {
    lastUpdated: new Date().toISOString(),
    totalCount: rawData.discussions.totalCount,
    discussions: discussions,
    categories: rawData.discussionCategories.nodes,
    categoryCounts: categoryCounts
  };
}

async function main() {
  console.log('Fetching GitHub Discussions...');
  
  try {
    const rawData = await fetchDiscussions();
    const processedData = processDiscussions(rawData);

    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2));
    
    console.log(`✅ Successfully fetched ${processedData.discussions.length} discussions`);
    
  } catch (error) {
    console.error('❌ Failed to fetch discussions:', error);
    process.exit(1);
  }
}

main();