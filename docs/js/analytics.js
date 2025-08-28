/**
 * Enhanced analytics.js with personal/organization account support
 */

let analyticsData = null;
let isPersonalAccount = false;
let ownerInfo = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  checkAccountType();
  adaptUIForAccountType();
  await loadAnalytics();
  setupEventListeners();
});

function checkAccountType() {
  // Check if we have config data about the account type
  if (window.DOORWAY_CONFIG && window.DOORWAY_CONFIG.owner) {
    isPersonalAccount = window.DOORWAY_CONFIG.owner.isPersonal;
    ownerInfo = window.DOORWAY_CONFIG.owner;
    console.log(`Account type from config: ${isPersonalAccount ? 'Personal' : 'Organization'}`);
  } else {
    // Fallback: try to detect from hostname or default to personal
    const hostname = window.location.hostname;
    if (hostname.endsWith('.github.io')) {
      // GitHub Pages personal sites are usually personal accounts
      isPersonalAccount = true;
      console.log('Detected personal account from GitHub Pages URL');
    } else {
      isPersonalAccount = true; // Default to personal
      console.log('Defaulting to personal account');
    }
  }
}

function adaptUIForAccountType() {
  // Update page title and headers based on account type
  const pageTitle = document.querySelector('.page-header h1');
  const sectionTitle = document.querySelector('#team-performance');
  
  if (pageTitle) {
    pageTitle.textContent = isPersonalAccount ? 'Repository Analytics' : 'Organization Analytics';
  }
  
  // Update analytics section title
  const analyticsSection = document.querySelector('.discussions-section h2');
  if (analyticsSection && analyticsSection.textContent.includes('Organization')) {
    analyticsSection.textContent = isPersonalAccount 
      ? 'Repository Analytics' 
      : 'Organization Analytics';
  }
}

function setupEventListeners() {
  // Time range filter (if you want to add filtering later)
  const timeRangeFilter = document.getElementById('time-range-filter');
  if (timeRangeFilter) {
    timeRangeFilter.addEventListener('change', applyTimeFilter);
  }

  // Export data button
  const exportBtn = document.getElementById('export-data-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
}

async function loadAnalytics() {
  try {
    showLoadingStates();
    
    const response = await fetch('data/analytics.json');
    if (!response.ok) {
      throw new Error(`Failed to load analytics data: ${response.status}`);
    }
    
    analyticsData = await response.json();
    
    // Update account type info from analytics data if available
    if (analyticsData.ownerInfo) {
      isPersonalAccount = analyticsData.ownerInfo.isPersonal;
      ownerInfo = analyticsData.ownerInfo;
    }
    
    console.log('Analytics data loaded:', analyticsData);
    displayAnalytics();
    
  } catch (error) {
    console.error('Error loading analytics:', error);
    showError('Failed to load analytics data. Please try again later.');
    hideLoadingStates();
  }
}

function displayAnalytics() {
  if (!analyticsData) {
    console.error('No analytics data available');
    return;
  }
  
  console.log('Displaying analytics data...');
  displayMetrics();
  displayCharts();
  displayOwnerAnalytics(); // Renamed from displayOrganizationAnalytics
  displayMostActiveDiscussions();
  hideLoadingStates();
}

function displayMetrics() {
  const metrics = analyticsData.metrics;
  const trends = analyticsData.trends;
  
  // Update metric cards
  updateMetricCard('total-discussions', metrics.totalDiscussions, trends.discussions);
  updateMetricCard('response-time', metrics.avgResponseTime, trends.responseTime);
  updateMetricCard('resolution-rate', metrics.resolutionRate, trends.resolution);
  updateMetricCard('satisfaction-score', metrics.satisfactionScore, { trend: '+', change: 0.1 });
  updateMetricCard('active-contributors', metrics.activeContributors, { trend: '+', change: 2 });
}

function updateMetricCard(id, value, trend) {
  const numberEl = document.getElementById(id);
  const trendEl = document.getElementById(id.replace(/-/g, '-') + '-trend');
  
  if (numberEl) {
    numberEl.textContent = value;
    console.log(`Updated ${id} to ${value}`);
  }
  if (trendEl && trend) {
    const trendText = trend.change > 0 ? `↑ ${trend.change} this month` : 
                     trend.change < 0 ? `↓ ${Math.abs(trend.change)} this month` : 
                     '→ No change';
    trendEl.textContent = trendText;
    trendEl.className = `metric-trend ${trend.change > 0 ? 'positive' : trend.change < 0 ? 'negative' : 'neutral'}`;
  }
}

function displayCharts() {
  displayDiscussionVolumeChart();
  displayCategoriesChart();
  displayResolutionChart();
  displayResponseTimeChart();
}

function displayDiscussionVolumeChart() {
  const container = document.getElementById('discussions-chart');
  if (!container || !analyticsData.charts.discussionVolume) return;
  
  const data = analyticsData.charts.discussionVolume;
  
  // Calculate max height based on data to prevent overflow
  const maxCount = Math.max(...data.map(item => item.count));
  const heightMultiplier = maxCount > 0 ? Math.min(120 / maxCount, 10) : 5;
  
  const chartHTML = `
    <div class="simple-chart">
      ${data.map(item => `
        <div class="chart-bar">
          <div class="bar" style="height: ${Math.max(item.count * heightMultiplier, 5)}px"></div>
          <div class="bar-label">${new Date(item.week).toLocaleDateString('en', {month: 'short', day: 'numeric'})}</div>
          <div class="bar-value">${item.count}</div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.innerHTML = chartHTML;
}

function displayCategoriesChart() {
  const container = document.getElementById('categories-chart');
  if (!container || !analyticsData.charts.categories) return;
  
  const categories = analyticsData.charts.categories;
  const total = categories.reduce((sum, cat) => sum + cat.count, 0);
  
  const chartHTML = `
    <div class="category-chart">
      ${categories.map(cat => {
        const percentage = Math.round((cat.count / total) * 100);
        return `
          <div class="category-item">
            <div class="category-bar">
              <div class="category-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="category-info">
              <span class="category-name">${cat.category}</span>
              <span class="category-count">${cat.count} (${percentage}%)</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  container.innerHTML = chartHTML;
}

function displayResolutionChart() {
  const container = document.getElementById('resolution-chart');
  if (!container || !analyticsData.charts.resolutionStatus) return;
  
  const data = analyticsData.charts.resolutionStatus;
  const total = data.answered + data.unanswered;
  const answeredPercentage = Math.round((data.answered / total) * 100);
  
  const chartHTML = `
    <div class="resolution-chart">
      <div class="resolution-summary">
        <div class="resolution-item answered">
          <div class="resolution-icon">✅</div>
          <div class="resolution-info">
            <div class="resolution-number">${data.answered}</div>
            <div class="resolution-label">Answered (${answeredPercentage}%)</div>
          </div>
        </div>
        <div class="resolution-item unanswered">
          <div class="resolution-icon">❓</div>
          <div class="resolution-info">
            <div class="resolution-number">${data.unanswered}</div>
            <div class="resolution-label">Needs Answer (${100 - answeredPercentage}%)</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
}

function displayResponseTimeChart() {
  const container = document.getElementById('response-chart');
  if (!container) return;
  
  const chartHTML = `
    <div class="response-time-chart">
      <div class="metric-large">
        <div class="metric-number-large">${analyticsData.metrics.avgResponseTime}</div>
        <div class="metric-label-large">Average Response Time</div>
      </div>
      <div class="trend-indicator">
        <span class="trend-text">Response times have been consistent</span>
      </div>
    </div>
  `;
  
  container.innerHTML = chartHTML;
}

function displayOwnerAnalytics() {
  const container = document.getElementById('team-performance');
  if (!container) return;
  
  const owner = analyticsData.owner;
  const contributors = analyticsData.contributors || [];
  
  if (!owner) {
    container.innerHTML = `<p>${isPersonalAccount ? 'Repository' : 'Organization'} data not available</p>`;
    return;
  }
  
  // Clear any inherited classes and set proper structure
  container.className = 'owner-analytics-container';
  
  // Adaptive content based on account type
  const isOrg = owner.type === 'Organization';
  const title = isOrg ? `${owner.name} Analytics` : `${owner.name}'s Repository Analytics`;
  const memberText = isOrg 
    ? `👥 ${owner.totalMembers} members` 
    : `👤 Personal Account`;
  const contributorTitle = isOrg ? 'Top Organization Contributors' : 'Top Repository Contributors';
  const repoTitle = isOrg ? 'Most Popular Organization Repositories' : 'Most Popular Repositories';
  
  const ownerHTML = `
    <div class="owner-overview">
      <div class="owner-header">
        <h3>${title}</h3>
        <div class="owner-stats">
          <span class="owner-stat">${memberText}</span>
          <span class="owner-stat">📁 ${owner.totalRepositories} repositories</span>
          ${isOrg ? `<span class="owner-stat">🏢 Organization</span>` : `<span class="owner-stat">👤 Personal</span>`}
        </div>
      </div>
      
      <div class="contributors-section">
        <h4>${contributorTitle}</h4>
        <div class="contributors-list">
          ${contributors.slice(0, 10).map(contributor => `
            <div class="contributor-item">
              <div class="contributor-info">
                <img src="${contributor.avatar}" alt="${contributor.login}" class="contributor-avatar">
                <div class="contributor-details">
                  <div class="contributor-name">${contributor.login}</div>
                  <div class="contributor-stats">${contributor.contributions} contributions</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${owner.topRepositories && owner.topRepositories.length > 0 ? `
        <div class="top-repos-section">
          <h4>${repoTitle}</h4>
          <div class="repos-list">
            ${owner.topRepositories.slice(0, 5).map(repo => `
              <div class="repo-item">
                <div class="repo-info">
                  <div class="repo-name">${repo.name}</div>
                  <div class="repo-stats">
                    <span>⭐ ${repo.stars}</span>
                    <span>🍴 ${repo.forks}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  container.innerHTML = ownerHTML;
}

function displayMostActiveDiscussions() {
  const container = document.getElementById('top-discussions');
  if (!container || !analyticsData.mostActiveDiscussions) return;
  
  const discussions = analyticsData.mostActiveDiscussions.slice(0, 8);
  
  const discussionsHTML = discussions.map(discussion => `
    <div class="activity-item">
      <div class="activity-content">
        <div class="activity-icon">💬</div>
        <div class="activity-details">
          <a href="#" class="activity-title">${discussion.title}</a>
          <div class="activity-meta">
            <span>${discussion.category || 'General'}</span>
            <span>by ${discussion.author}</span>
            <span>👍 ${discussion.upvotes}</span>
            <span>💬 ${discussion.comments}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = discussionsHTML;
}

function showLoadingStates() {
  const loadingElements = document.querySelectorAll('.loading-state');
  loadingElements.forEach(el => el.classList.remove('hidden'));
}

function hideLoadingStates() {
  const loadingElements = document.querySelectorAll('.loading-state');
  loadingElements.forEach(el => el.classList.add('hidden'));
}

function showError(message) {
  const container = document.querySelector('.analytics-charts');
  if (container) {
    container.innerHTML = `
      <div class="error-state">
        <h3>⚠️ Error Loading Analytics</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

function applyTimeFilter(event) {
  console.log('Time filter changed:', event.target.value);
  // Could implement time filtering here if needed
}

function exportData() {
  if (!analyticsData) return;
  
  // Include account type information in export
  const exportData = {
    ...analyticsData,
    exportInfo: {
      exportedAt: new Date().toISOString(),
      accountType: isPersonalAccount ? 'Personal' : 'Organization',
      ownerInfo: ownerInfo
    }
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  const accountType = isPersonalAccount ? 'personal' : 'org';
  link.download = `doorway-analytics-${accountType}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}