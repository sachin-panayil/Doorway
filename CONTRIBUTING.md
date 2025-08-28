# How to Contribute

We encourage you to read this project's CONTRIBUTING policy (you are here), its [LICENSE](LICENSE.md), and its [README](README.md).

## Getting Started

We welcome contributions from developers of all skill levels. If you're new to open source, look for issues labeled with `good-first-issue` or `help-wanted` to get started.

### Team Structure

Doorway is maintained by a community of contributors. For information about our team structure, community guidelines, and code of conduct, please see [COMMUNITY.md](COMMUNITY.md).

## Development Setup

### Prerequisites

- Node.js 16 or higher
- Git
- A GitHub account
- A personal access token with repo permissions (for testing)

### Building Dependencies

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/your-username/doorway.git
   cd doorway
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** for testing:
   ```bash
   export GITHUB_TOKEN=your_personal_access_token
   export GITHUB_REPOSITORY_OWNER=your-username
   export GITHUB_REPOSITORY=your-username/doorway
   ```

### Building the Project

Doorway is a static website with no build step required for the frontend. However, you can test the setup script:

1. **Run the setup script**:
   ```bash
   node setup.js
   ```

2. **Serve the site locally**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   
   # Visit http://localhost:8000
   ```

3. **Test functionality**:
   - Navigate through all pages
   - Test filtering and search
   - Verify discussion links work
   - Check mobile responsiveness

### Getting Help

- **Technical Questions**: Start a discussion in [Q&A](../../discussions/categories/q-a)
- **Process Questions**: Comment on relevant issues or discussions
- **General Chat**: Use [General discussions](../../discussions/categories/general)

Thank you for contributing to Doorway and helping make professional support accessible to all open source projects!