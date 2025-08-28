# Doorway

A zero-cost help desk solution that transforms GitHub Discussions and Wiki into a professional support portal for open source organizations.

## About the Project

Doorway serves as the "front door" for all community support across a GitHub Organization, providing a unified, user-friendly interface over GitHub's native support features without any hosting costs or infrastructure requirements.

### Project Vision

To democratize professional support experiences for open source projects by leveraging GitHub's existing infrastructure, enabling any organization to provide world-class community support without the traditional costs and complexity of help desk solutions.

### Key Features

- **Zero Infrastructure Costs**: Built entirely on GitHub Pages, Discussions, and Actions
- **Professional Interface**: Clean, responsive design that makes community support more approachable
- **One-Click Setup**: Automated configuration through GitHub Actions
- **Search & Filtering**: Advanced search and categorization for better discoverability
- **Analytics Dashboard**: Community health metrics and support performance insights

### How It Works

1. **Fork this repository** to your organization
2. **Run the setup workflow** from the Actions tab
3. **Your help desk is live** at `https://your-org.github.io/Doorway`

## Quick Start

### Prerequisites

- GitHub organization or personal account
- Repository with GitHub Discussions enabled (automatically handled by setup)

### Installation

1. **Use this template**: Click "Use this template" to create a new repository in your organization

2. **Run setup**: Go to the Actions tab in your new repository and run the "Setup and Sync Doorway Help Desk" workflow

3. **Access your help desk**: Visit `https://your-org.github.io/repository-name`

### Configuration

The setup process automatically creates a `js/config.js` file with your repository details:

```javascript
window.DOORWAY_CONFIG = {
  repository: {
    owner: 'your-org',
    name: 'your-repo'
  },
  settings: {
    enableAnalytics: true,
    defaultItemsPerPage: 20
  }
};
```

You can customize this configuration as needed for your project.

## Repository Structure

```
Doorway/
├── .github/
│   └── workflows/
│       └── sync-discussions.yml    # Automated setup and sync
├── css/
│   └── styles.css                  # GitHub-inspired dark theme
├── js/
│   ├── config.js                   # Repository configuration
│   ├── main.js                     # Shared functionality
│   ├── discussions.js              # Discussion page logic
│   └── knowledge-base.js           # Knowledge base functionality
├── index.html                      # Home page
├── discussions.html                # Discussions browser
├── knowledge-base.html             # Documentation portal
├── analytics.html                  # Community analytics
├── setup.js                       # Automated setup script
├── discussions.json                # Cached discussion data
└── package.json                    # Node.js dependencies
```

## Documentation

### For Users

- **[User Guide](docs/USER_GUIDE.md)**: How to navigate and use the help desk
- **[Community Guidelines](COMMUNITY.md)**: Participation guidelines and code of conduct

### For Maintainers

- **[Setup Guide](docs/SETUP.md)**: Detailed setup and configuration instructions
- **[Maintenance](docs/MAINTENANCE.md)**: Keeping your help desk updated
- **[Customization](docs/CUSTOMIZATION.md)**: Styling and feature customization

### For Developers

- **[Architecture](docs/ARCHITECTURE.md)**: Technical overview and design decisions
- **[API Reference](docs/API.md)**: GitHub API integration details
- **[Contributing Guide](CONTRIBUTING.md)**: How to contribute to Doorway

## Local Development

### Setup

```bash
# Clone your fork
git clone https://github.com/your-org/your-doorway-repo.git
cd your-doorway-repo

# Install dependencies
npm install

# Set up environment variables
export GITHUB_TOKEN=your_personal_access_token
export GITHUB_REPOSITORY_OWNER=your-org
export GITHUB_REPOSITORY=your-org/your-repo

# Run setup script
node setup.js
```

### Testing

```bash
# Serve locally
python -m http.server 8000
# or
npx serve .

# Visit http://localhost:8000
```

### Syncing Data

To refresh discussion data during development:

```bash
node setup.js
```

Or use the GitHub Actions workflow for automated updates.

## Contributing

Thank you for considering contributing to Doorway! We welcome contributions from the community to help improve this open source project.

### Ways to Contribute

- **Bug Reports**: Found an issue? Report it in our [Issues](../../issues)
- **Feature Requests**: Have ideas for improvements? Share them in [Discussions](../../discussions)
- **Code Contributions**: Submit pull requests with bug fixes or new features
- **Documentation**: Help improve our guides and documentation
- **Community Support**: Help other users in discussions and issues

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

For more detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Community

Doorway takes a community-first and open source approach to development. We believe that support tools should be accessible to all open source projects regardless of budget or technical resources.

### Community Principles

- **Inclusivity**: We welcome contributors from all backgrounds and skill levels
- **Transparency**: All development happens in the open
- **Sustainability**: Solutions should be maintainable by volunteer communities
- **Accessibility**: Both the tool and its development process should be accessible

### Getting Help

- **Documentation Issues**: Check our [docs](docs/) or open an issue
- **Technical Questions**: Start a discussion in the [Q&A category](../../discussions/categories/q-a)
- **Feature Ideas**: Share in our [Ideas discussions](../../discussions/categories/ideas)
- **General Chat**: Join our [General discussions](../../discussions/categories/general)

### Community Guidelines

Principles and guidelines for participating in our open source community can be found in [COMMUNITY.md](COMMUNITY.md). Please read them before joining or starting a conversation in this repo or community channels.

All community members are expected to adhere to our code of conduct when participating in:
- Code repositories
- Discussion forums  
- Issues and pull requests
- Community events

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with GitHub's powerful community features
- Inspired by the needs of open source maintainers worldwide
- Designed for sustainability and ease of maintenance

---

**Ready to get started?** [Use this template](../../generate) to create your own help desk!