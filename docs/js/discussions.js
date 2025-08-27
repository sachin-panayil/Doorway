/**
 * Client-side JavaScript to load and display discussions from static JSON
 */

// State management
let discussionsData = null;
let filteredDiscussions = [];
let currentView = 'grid'; // Default to grid view
let currentPage = 1;
const itemsPerPage = 20;

// DOM elements
const elements = {
  container: null,
  loadingState: null,
  emptyState: null,
  resultsCount: null,
  loadMoreSection: null,
  showingCount: null,
  totalCount: null
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  setupEventListeners();
  await loadDiscussions();
  handleSearchFromURL();
});

function initializeElements() {
  elements.container = document.getElementById('discussions-container');
  elements.loadingState = document.getElementById('loading-state');
  elements.emptyState = document.getElementById('empty-state');
  elements.resultsCount = document.getElementById('results-count');
  elements.loadMoreSection = document.getElementById('load-more-section');
  elements.showingCount = document.getElementById('showing-count');
  elements.totalCount = document.getElementById('total-count');
}

function setupEventListeners() {
  // Category modal
  document.getElementById('start-discussion-btn')?.addEventListener('click', showCategoryModal);
  document.getElementById('empty-start-discussion')?.addEventListener('click', showCategoryModal);
  document.getElementById('modal-close-btn')?.addEventListener('click', hideCategoryModal);
  
  // Category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = card.dataset.category;
      createDiscussion(category);
    });
  });
  
  // Filters
  document.getElementById('category-filter')?.addEventListener('change', applyFilters);
  document.getElementById('status-filter')?.addEventListener('change', applyFilters);
  document.getElementById('sort-filter')?.addEventListener('change', applyFilters);
  document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
  
  // Load more
  document.getElementById('load-more-btn')?.addEventListener('click', loadMore);
  
  // Search
  document.getElementById('global-search')?.addEventListener('input', debounce(handleSearch, 300));
}

async function loadDiscussions() {
  try {
    // Show loading state
    elements.loadingState.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
    elements.container.innerHTML = '';
    
    // Try to fetch the static JSON data
    try {
      const response = await fetch('data/discussions.json');
      if (!response.ok) throw new Error('Failed to load discussions data');
      discussionsData = await response.json();
    } catch (fetchError) {
        console.error('Error loading discussions:', error);
        showError('Failed to load discussions. Please refresh the page.');
    }
    
    applyFilters();
    
  } catch (error) {
    console.error('Error loading discussions:', error);
    showError('Failed to load discussions. Please refresh the page.');
  } finally {
    elements.loadingState.classList.add('hidden');
  }
}

function applyFilters() {
  const categoryFilter = document.getElementById('category-filter')?.value;
  const statusFilter = document.getElementById('status-filter')?.value;
  const sortFilter = document.getElementById('sort-filter')?.value || 'updated';
  const searchQuery = document.getElementById('global-search')?.value.toLowerCase();
  
  // Start with all discussions
  filteredDiscussions = [...(discussionsData?.discussions || [])];
  
  // Apply category filter
  if (categoryFilter) {
    filteredDiscussions = filteredDiscussions.filter(d => 
      d.category.toUpperCase().replace(/\s+/g, '_') === categoryFilter
    );
  }
  
  // Apply status filter
  if (statusFilter === 'answered') {
    filteredDiscussions = filteredDiscussions.filter(d => d.isAnswered);
  } else if (statusFilter === 'unanswered') {
    filteredDiscussions = filteredDiscussions.filter(d => !d.isAnswered);
  }
  
  // Apply search filter
  if (searchQuery) {
    filteredDiscussions = filteredDiscussions.filter(d => 
      d.title.toLowerCase().includes(searchQuery) ||
      d.body.toLowerCase().includes(searchQuery) ||
      d.author.toLowerCase().includes(searchQuery)
    );
  }
  
  // Apply sorting
  filteredDiscussions.sort((a, b) => {
    switch(sortFilter) {
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'upvotes':
        return (b.upvotes || 0) - (a.upvotes || 0);
      case 'comments':
        return (b.commentCount || 0) - (a.commentCount || 0);
      case 'updated':
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });
  
  // Reset to first page
  currentPage = 1;
  displayDiscussions();
}

function displayDiscussions() {
  // Clear container and set grid view
  elements.container.innerHTML = '';
  elements.container.className = 'discussions-list view-grid';
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageDiscussions = filteredDiscussions.slice(0, endIndex);
  
  // Update counts
  elements.resultsCount.textContent = `${filteredDiscussions.length} discussions found`;
  elements.totalCount.textContent = filteredDiscussions.length;
  elements.showingCount.textContent = `Showing 1-${Math.min(endIndex, filteredDiscussions.length)}`;
  
  // Show/hide empty state
  if (filteredDiscussions.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.loadMoreSection.classList.add('hidden');
    return;
  } else {
    elements.emptyState.classList.add('hidden');
  }
  
  // Render discussions
  pageDiscussions.forEach(discussion => {
    elements.container.appendChild(createDiscussionElement(discussion));
  });
  
  // Show/hide load more button
  if (endIndex < filteredDiscussions.length) {
    elements.loadMoreSection.classList.remove('hidden');
  } else {
    elements.loadMoreSection.classList.add('hidden');
  }
}

function createDiscussionElement(discussion) {
  const div = document.createElement('div');
  div.className = 'discussion-item';
  
  const timeAgo = getTimeAgo(discussion.updatedAt);
  const statusBadge = discussion.isAnswered 
    ? '<span class="badge badge-success">✓ Answered</span>' 
    : '<span class="badge badge-warning">Needs Answer</span>';
  
  const repoPath = getRepoPath();
  const discussionUrl = repoPath !== 'your-org/your-repo' 
    ? `https://github.com/${repoPath}/discussions/${discussion.number}`
    : '#';

  div.innerHTML = `
    <div class="discussion-header">
      <div class="discussion-meta">
        <span class="category-tag">${discussion.categoryEmoji} ${discussion.category}</span>
        ${statusBadge}
        <span class="discussion-number">#${discussion.number}</span>
      </div>
    </div>
    <h3 class="discussion-title">
      <a href="${discussionUrl}" target="_blank" style="color: inherit; text-decoration: none;">
        ${escapeHtml(discussion.title)}
      </a>
    </h3>
    <p class="discussion-body">${escapeHtml(discussion.body)}</p>
    <div class="discussion-footer">
      <div class="author-info" style="display: flex; align-items: center; gap: 8px;">
        ${discussion.authorAvatar ? `<img src="${discussion.authorAvatar}" alt="${discussion.author}" class="author-avatar" style="width: 24px; height: 24px; border-radius: 50%;">` : ''}
        <span class="author-name">${discussion.author}</span>
      </div>
      <span class="timestamp">${timeAgo}</span>
    </div>
    <div class="discussion-stats" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-primary);">
      <span class="stat">👍 ${discussion.upvotes}</span>
      <span class="stat">💬 ${discussion.commentCount}</span>
    </div>
  `;
  
  return div;
}

function loadMore() {
  currentPage++;
  applyFilters();
}

function clearFilters() {
  document.getElementById('category-filter').value = '';
  document.getElementById('status-filter').value = '';
  document.getElementById('sort-filter').value = 'updated';
  document.getElementById('global-search').value = '';
  applyFilters();
}

function handleSearch(e) {
  applyFilters();
}

function showCategoryModal() {
  document.getElementById('category-modal')?.classList.remove('hidden');
}

function hideCategoryModal() {
  document.getElementById('category-modal')?.classList.add('hidden');
}

function createDiscussion(category) {
  const repoPath = getRepoPath();
  if (repoPath === 'your-org/your-repo') {
    alert('Repository not configured. Please set up config.js with your repository details.');
    return;
  }

  const url = `https://github.com/${repoPath}/discussions/new?category=${category}`;
  window.open(url, '_blank');
  hideCategoryModal();
}

function getRepoPath() {
  if (window.DOORWAY_CONFIG?.repository) {
    return `${window.DOORWAY_CONFIG.repository.owner}/${window.DOORWAY_CONFIG.repository.name}`;
  }
  
  // detection fallback
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

function handleSearchFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  const action = urlParams.get('action');
  
  if (searchQuery) {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.value = searchQuery;
      setTimeout(() => {
        applyFilters();
      }, 500);
    }
  }
  
  if (action === 'create') {
    setTimeout(() => {
      showCategoryModal();
    }, 500);
  }
}

function showError(message) {
  elements.container.innerHTML = `
    <div class="error-state">
      <p>⚠️ ${message}</p>
    </div>
  `;
}

// Utility functions
function getTimeAgo(dateString) {
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
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}