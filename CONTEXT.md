# Project Context

This document provides background on Doorway's development journey and the design decisions that shaped the final implementation.

## Project Origins

Doorway started from observing that open source projects often need community support infrastructure, but traditional help desk solutions either cost money or require significant technical setup. The goal was to create a free alternative that leverages GitHub's existing community features while providing a more polished, user-friendly interface.

The initial concept explored several approaches - from a full GitHub Marketplace app to repository templates with manual setup. We ultimately chose a hybrid approach using repository templates with GitHub Actions automation, which provides meaningful setup automation while keeping users in full control of their code and avoiding complex marketplace approval processes.

## Technical Approach

The final architecture combines static site generation with GitHub's APIs to create a responsive help desk interface. Users fork a template repository and run a GitHub Actions workflow that automatically enables discussions, creates categories, configures GitHub Pages, and sets up data synchronization. This approach eliminates the need for external hosting while providing professional-looking community support portals.

## Design Decisions and Trade-offs

We prioritized zero infrastructure costs and user ownership over more advanced features that would require ongoing server maintenance. This constraint influenced several key decisions: using static JSON files for data storage rather than databases, implementing client-side search instead of server-side indexing, and relying on GitHub's built-in authentication rather than custom user management.

The template repository approach means users maintain their own installations rather than depending on centralized services. This provides autonomy and customization flexibility but also means updates require manual integration. We included automation to help with data synchronization and configuration management.

## Value Proposition

Doorway addresses the gap between GitHub's powerful but developer-centric tools and the needs of diverse open source communities. It provides professional presentation of community support resources without requiring budget allocation or technical infrastructure management.

The automation saves time during initial setup and ongoing maintenance, while the improved interface can help projects build more inclusive and accessible communities. For projects that prioritize community building and want to present a polished support experience, Doorway offers genuine utility.

## Target Use Cases

Doorway works best for established open source projects that have active GitHub Discussions but want to provide a more welcoming interface for their broader community. It's particularly valuable for projects where community members may be less familiar with GitHub's interface or where maintainers want to present a more branded, professional support experience.

The solution is less suitable for projects that need advanced workflow automation, complex ticketing features, or integration with external systems. It complements rather than replaces GitHub's native tools.

## Challenges and Pitfalls

Several fundamental challenges became apparent during development. The core issue is that Doorway essentially duplicates functionality that GitHub already provides through Discussions, creating a read-only interface for data that users can access more directly and interact with more effectively on GitHub itself. The time savings from automation amount to perhaps 10 minutes of one-time setup work, while users take on ongoing maintenance responsibilities for their forked installations.

The template repository approach creates a maintenance burden for users who must keep their installations updated with bug fixes and improvements from the upstream template. Unlike traditional software libraries where updates are managed through package managers, template forks require manual intervention to stay current.

The split user experience presents another challenge - users browse discussions through the help desk interface but must navigate to GitHub to actually participate in conversations. This context switching can create confusion about where to find specific discussions or how to follow ongoing conversations.

The static data approach, while avoiding server costs, means discussion data can become stale between synchronization runs. Users may see outdated information until they manually trigger the sync workflow, potentially missing recent answers or new discussions.

Setup complexity remains higher than initially envisioned. While the GitHub Actions automation helps, users still need to understand repository forking, workflow execution, and GitHub Pages deployment. Projects with less technical resources may find the initial configuration challenging.