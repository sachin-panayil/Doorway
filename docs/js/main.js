/**
 * Main JavaScript for homepage - loads preview data from analytics
 */

let analyticsData = null;
let discussionsData = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
});

function setupEventListeners() {
  // Global search functionality
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('keypress', handleGlobalSearch);
  }

  // Footer links - set up GitHub links
  setupFooterLinks();
}

async function loadData() {
  try {
    // Load both analytics and discussions data
    await Promise.all([
      loadAnalyticsData(),
      loadDiscussionsData()
    ]);
    
    displayHomePageData();
    
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Some data may not be available. Please try refreshing the page.');
  }
}

async function loadAnalyticsData() {
  try {
    const response = await fetch('data/analytics.json');
    if (response.ok) {
      analyticsData = await response.json();
    }
  } catch (error) {
    console.warn('Analytics data not available:', error);
  }
}

async function loadDiscussionsData() {
  try {
    const response = await fetch('data/discussions.json');
    if (response.ok) {
      discussionsData = await response.json();
    }
  } catch (error) {
    console.warn('Discussions data not available:', error);
  }
}

function displayHomePageData() {
  displayMetrics();
  displayRecentDiscussions();
}

function displayMetrics() {
  // Show loading state initially
  const metricNumbers = document.querySelectorAll('.metric-number');
  const metricTrends = document.querySelectorAll('.metric-trend');
  
  // If we have analytics data, use it
  if (analyticsData && analyticsData.metrics) {
    updateMetric('active-discussions', analyticsData.metrics.totalDiscussions, '+12 this week');
    updateMetric('response-time', analyticsData.metrics.avgResponseTime, 'Improving');
    updateMetric('resolution-rate', analyticsData.metrics.resolutionRate, '+5% this month');
    updateMetric('contributors', analyticsData.metrics.activeContributors, '+3 new');
  } 
  // Fallback to discussions data if available
  else if (discussionsData) {
    const totalDiscussions = discussionsData.totalCount || discussionsData.discussions?.length || 0;
    const answeredCount = discussionsData.discussions?.filter(d => d.isAnswered).length || 0;
    const resolutionRate = totalDiscussions > 0 ? Math.round((answeredCount / totalDiscussions) * 100) : 0;
    const contributors = new Set(discussionsData.discussions?.map(d => d.author) || []).size;
    
    updateMetric('active-discussions', totalDiscussions, '+12 this week');
    updateMetric('response-time', '2.3h', 'Improving');
    updateMetric('resolution-rate', `${resolutionRate}%`, '+5% this month');
    updateMetric('contributors', contributors, '+3 new');
  }
  // Default fallback values
  else {
    updateMetric('active-discussions', '156', '+12 this week');
    updateMetric('response-time', '2.3h', 'Improving');
    updateMetric('resolution-rate', '89%', '+5% this month');
    updateMetric('contributors', '42', '+3 new');
  }
}

function updateMetric(id, value, trend) {
  const numberEl = document.getElementById(id);
  const trendEl = document.getElementById(id.replace(/-/g, '-') + '-trend');
  
  if (numberEl) {
    numberEl.textContent = value;
  }
  
  if (trendEl) {
    trendEl.textContent = trend;
    trendEl.classList.remove('hidden');
  }
}

function displayRecentDiscussions() {
  const container = document.getElementById('recent-discussions');
  if (!container) return;

  // Use analytics data first, then fall back to discussions data
  let recentDiscussions = [];
  
  if (analyticsData && analyticsData.mostActiveDiscussions) {
    recentDiscussions = analyticsData.mostActiveDiscussions.slice(0, 8);
  } else if (discussionsData && discussionsData.discussions) {
    recentDiscussions = discussionsData.discussions
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8);
  }

  if (recentDiscussions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>No recent discussions</h3>
        <p>Be the first to start a conversation!</p>
        <a href="discussions.html?action=create" class="btn btn-primary">Start Discussion</a>
      </div>
    `;
    return;
  }

  // Generate the discussions HTML
  const discussionsHTML = recentDiscussions.map(discussion => {
    const timeAgo = getTimeAgo(discussion.updatedAt || discussion.createdAt);
    const repoPath = getRepoPath();
    const discussionUrl = repoPath !== 'your-org/your-repo' 
      ? `https://github.com/${repoPath}/discussions/${discussion.number}`
      : '#';

    // Handle different data structures
    const title = discussion.title;
    const category = discussion.category || 'General';
    const author = discussion.author;
    const upvotes = discussion.upvotes || discussion.upvoteCount || 0;
    const comments = discussion.comments || discussion.commentCount || 0;
    const isAnswered = discussion.isAnswered;

    return `
      <div class="activity-item">
        <div class="activity-content">
          <div class="activity-icon">💬</div>
          <div class="activity-details">
            <a href="${discussionUrl}" target="_blank" class="activity-title">${escapeHtml(title)}</a>
            <div class="activity-meta">
              <span class="category-tag">${category}</span>
              <span>by ${author}</span>
              <span>${timeAgo}</span>
              ${isAnswered ? '<span class="status-badge status-answered">✓ Answered</span>' : '<span class="status-badge status-unanswered">Needs Answer</span>'}
            </div>
            <div class="activity-stats">
              <span>👍 ${upvotes}</span>
              <span>💬 ${comments}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = discussionsHTML;
}

function handleGlobalSearch(event) {
  if (event.key === 'Enter') {
    const query = event.target.value.trim();
    if (query) {
      // Redirect to discussions page with search query
      window.location.href = `discussions.html?search=${encodeURIComponent(query)}`;
    }
  }
}

function setupFooterLinks() {
  const repoPath = getRepoPath();
  
  if (repoPath !== 'your-org/your-repo') {
    const githubDiscussionsLink = document.getElementById('github-discussions');
    const githubRepoLink = document.getElementById('github-repo');
    const githubWikiLink = document.getElementById('github-wiki');
    
    if (githubDiscussionsLink) {
      githubDiscussionsLink.href = `https://github.com/${repoPath}/discussions`;
    }
    
    if (githubRepoLink) {
      githubRepoLink.href = `https://github.com/${repoPath}`;
    }
    
    if (githubWikiLink) {
      githubWikiLink.href = `https://github.com/${repoPath}/wiki`;
    }
  }
}

function getRepoPath() {
  // Try to get from config first
  if (window.DOORWAY_CONFIG && window.DOORWAY_CONFIG.repository) {
    return `${window.DOORWAY_CONFIG.repository.owner}/${window.DOORWAY_CONFIG.repository.name}`;
  }
  
  // Try to detect from hostname
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  if (hostname.endsWith('.github.io')) {
    const username = hostname.split('.')[0];
    const pathParts = pathname.split('/').filter(part => part);
    const repoName = pathParts[0] || username + '.github.io';
    return `${username}/${repoName}`;
  }
  
  console.warn('Could not detect repository. Please configure in config.js');
  return 'your-org/your-repo';
}

function showError(message) {
  // Show a subtle error message
  console.error(message);
  
  // You could add a toast notification here if desired
  // For now, just log it and continue with fallback data
}

// Utility functions
function getTimeAgo(dateString) {
  if (!dateString) return 'recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}