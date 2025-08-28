# Doorway

A zero-cost help desk solution that transforms GitHub Discussions and Wiki into a professional support portal for open source organizations.

## About the Project

Doorway serves as the "front door" for all community support across a GitHub Organization or personal account, providing a unified, user-friendly interface over GitHub's native support features without any hosting costs or infrastructure requirements.

### Project Vision

To democratize professional support experiences for open source projects by leveraging GitHub's existing infrastructure, enabling any organization or individual to provide world-class community support without the traditional costs and complexity of help desk solutions.

### Key Features

- **Zero Infrastructure Costs**: Built entirely on GitHub Pages, Discussions, and Actions
- **Professional Interface**: Clean, responsive design that makes community support more approachable
- **One-Click Setup**: Automated configuration through GitHub Actions
- **Search & Filtering**: Advanced search and categorization for better discoverability
- **Analytics Dashboard**: Community health metrics and support performance insights

### How It Works

1. **Fork this repository** to your organization or personal account
2. **Create a Personal Access Token** with required permissions
3. **Add the token as a repository secret**
4. **Your help desk goes live automatically** at `https://your-username.github.io/repository-name`

## Quick Start

### Prerequisites

- GitHub organization or personal account
- Personal Access Token with appropriate permissions

### Installation

1. **Use this template**: Click "Use this template" to create a new repository

2. **Create Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with these permissions:
     - `repo` (full repository access)
     - `discussions` (read/write discussions)
     - `pages` (deploy GitHub Pages)
     - For organizations: also add `read:org` `write:org` (read/write organization data)

3. **Add token as repository secret**:
   - In your new repository, go to Settings → Secrets and variables → Actions
   - Create new repository secret named `PERSONAL_ACCESS_TOKEN`
   - Paste your Personal Access Token as the value

4. **Setup runs automatically**: The setup workflow triggers on repository creation and handles:
   - Account type detection (personal vs organization)
   - GitHub Discussions and Pages enablement
   - Discussion category creation
   - Analytics configuration
   - Welcome discussion creation

5. **Access your help desk**: Visit `https://your-username.github.io/repository-name` (available after ~5-10 minutes)

### Configuration

The setup process automatically creates account-appropriate configuration:

```javascript
window.DOORWAY_CONFIG = {
  repository: {
    owner: 'your-username',
    name: 'your-repo'
  },
  owner: {
    type: 'User', // or 'Organization'
    isPersonal: true,
    name: 'Display Name'
  },
  settings: {
    enableAnalytics: true,
    showOrgSpecificFeatures: false // true for orgs
  }
};
```

## Repository Structure

```
repository-name/
├── .github/
│   └── workflows/
│       ├── setup.yml              # Initial setup workflow
│       ├── update-data.yml        # Automated data sync
│       └── contributors.yml       # Contributors sync
├── docs/                          # GitHub Pages content
│   ├── css/
│   │   └── styles.css            # GitHub-inspired dark theme
│   ├── js/
│   │   ├── config.js             # Auto-generated configuration
│   │   ├── main.js               # Homepage functionality
│   │   ├── discussions.js        # Discussion page logic
│   │   └── analytics.js          # Analytics dashboard
│   ├── api/
│   │   ├── main.js               # Data sync orchestrator
│   │   ├── discussions.js        # Discussion data fetcher
│   │   └── analytics.js          # Analytics data processor
│   ├── data/
│   │   ├── discussions.json      # Cached discussion data
│   │   └── analytics.json        # Analytics data
│   ├── index.html                # Home page
│   ├── discussions.html          # Discussions browser
│   └── analytics.html            # Community analytics
├── setup.js                      # Automated setup script
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## Troubleshooting

### Setup Issues

- **"Analytics not loading"**: Ensure your Personal Access Token has `read:org` and `write:org` permission for organizations
- **"Discussions not appearing"**: Check that GitHub Discussions are enabled on your repository
- **"Pages not deploying"**: Verify GitHub Pages is enabled in repository settings under Settings → Pages

### Permission Requirements

**Personal Accounts**: Standard `repo`, `discussions`, `pages` permissions sufficient
**Organizations**: Requires additional `read:org` permission, and the PAT must be created by an organization owner/admin

## Documentation

- **[User Guide](README.md)**: How to navigate and use the help desk
- **[Contributing Guide](CONTRIBUTING.md)**: How to contribute to Doorway
- **[Community Guidelines](COMMUNITY.md)**: Participation guidelines and code of conduct
- **[More Information](CONTEXT.md)**: More information on what the project is

## Local Development

### Setup

```bash
# Clone your fork
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install

# Set up environment variables
export GITHUB_TOKEN=your_personal_access_token
export REPO_OWNER=your-username
export REPO_NAME=your-repo

# Run setup script
node setup.js

# Serve locally
npm start
# or
python -m http.server 8000 --directory docs
```

Visit http://localhost:8000

### Manual Data Sync

```bash
node docs/api/main.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.