# Pragmatic Rhino SUIT
## Standards-Unified Integration Toolkit

![Pragmatic Rhino SUIT - SUIT Up. Standardize. Ship It.](resources/images/hero-banner.png)

> **SUIT Up. Standardize. Ship It.**
> 
> Framework-based guidance for Amazon Kiro

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/pliekhus77/pr-suit-for-kiro)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://github.com/pliekhus77/pr-suit-for-kiro/workflows/Build/badge.svg)](https://github.com/pliekhus77/pr-suit-for-kiro/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/pliekhus77/pr-suit-for-kiro/badge.svg?branch=main)](https://coveralls.io/github/pliekhus77/pr-suit-for-kiro?branch=main)
[![codecov](https://codecov.io/gh/pliekhus77/pr-suit-for-kiro/branch/main/graph/badge.svg)](https://codecov.io/gh/pliekhus77/pr-suit-for-kiro)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-green.svg)](https://github.com/pliekhus77/pr-suit-for-kiro)

## Overview

Pragmatic Rhino SUIT (Standards-Unified Integration Toolkit) is a VS Code extension that provides a curated library of framework-based steering documents to guide Kiro's behavior. Install proven frameworks (TDD/BDD, SABSA Security, C4 Model, Azure, DevOps, etc.) with a single command to ensure your Kiro projects follow best practices from day one.

Think of it as a framework manager for Kiro guidance - browse, install, update, and manage framework steering documents that shape how Kiro creates specs, designs architectures, and implements features.

## ✨ Features

### 🔍 Browse & Install Frameworks
Discover and install framework steering documents from a curated library with a single command.

<!-- TODO: Add screenshot of framework browser -->

### 📁 Tree View Management
Manage all your steering documents through an intuitive tree view organized by category:
- **Strategies (Installed)**: Framework-based strategies from the library
- **Project (Team-Created)**: Project-specific guidance (product.md, tech.md, structure.md)
- **Custom (Team-Created)**: Team-specific custom steering documents

<!-- TODO: Add screenshot of tree view -->

### 🔄 Automatic Updates
Get notified when framework updates are available and update with a single click. The extension detects customizations and offers to create backups before updating.

### ✅ Document Validation
Validate steering documents against quality standards to ensure they provide clear, actionable guidance to Kiro.

### 🚀 Workspace Initialization
Set up new Kiro workspaces with recommended frameworks in seconds.

### 📝 Custom Steering Documents
Create team-specific steering documents with templates and validation support.

## 📚 Available Frameworks

| Framework | Category | Description |
|-----------|----------|-------------|
| **TDD/BDD Testing Strategy** | Testing | Test-driven and behavior-driven development practices with testing-plan.md requirements |
| **SABSA Security Strategy** | Security | Security architecture, threat modeling (STRIDE), and compliance (GDPR, HIPAA, SOC2) |
| **C4 Model Architecture** | Architecture | When and how to use C4 diagrams in specs (System Context, Container, Component, Dynamic) |
| **AWS Hosting Strategy** | Cloud | AWS service selection, Well-Architected Framework (6 pillars), and hosting patterns |
| **Azure Hosting Strategy** | Cloud | Azure service selection, Well-Architected principles, and hosting patterns |
| **DevOps CI/CD Strategy** | DevOps | Continuous integration/deployment, DORA metrics, and deployment strategies |
| **Infrastructure as Code (Pulumi)** | Infrastructure | IaC patterns and best practices with Pulumi (real programming languages) |
| **Domain-Driven Design (DDD)** | Architecture | Strategic and tactical DDD patterns for complex business domains |
| **.NET Best Practices** | Development | .NET 8.0 development standards for performance, security, and maintainability |
| **4D SDLC + SAFe Work Management** | Work Management | Define-Design-Develop-Deploy phases with SAFe practices and WSJF prioritization |
| **Enterprise Architecture (TOGAF/Zachman)** | Architecture | Strategic planning questions for product and feature design |

## 🚀 Getting Started

### For Existing Kiro Workspaces

1. **Open your Kiro workspace** (contains `.kiro/` directory)
2. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. **Run** `Pragmatic Rhino SUIT: Browse Frameworks`
4. **Select frameworks** to install (or choose "Install Recommended")
5. **Start using Kiro** - it will now follow the installed framework guidance

### For New Projects

1. **Open Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. **Run** `Pragmatic Rhino SUIT: Initialize Workspace`
3. **Choose** to install recommended frameworks or browse the library
4. **Start building** with best practices from day one

### Quick Example

```bash
# Open your project in VS Code
code my-project/

# Press Ctrl+Shift+P and type "Browse Frameworks"
# Select "TDD/BDD Testing Strategy" and "Azure Hosting Strategy"
# Files are installed to .kiro/steering/

# Now when you create a spec with Kiro, it will:
# - Require a testing-plan.md with all test scenarios
# - Guide you on Azure service selection
# - Apply TDD/BDD practices during implementation
```

## Requirements

- VS Code 1.85.0 or higher
- Amazon Kiro workspace (`.kiro/` directory)

## Extension Settings

This extension contributes the following settings:

* `pragmaticRhinoSuit.autoCheckUpdates`: Automatically check for framework updates on startup (default: true)

## 📋 Commands

All commands are available through the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description | When to Use |
|---------|-------------|-------------|
| `Browse Frameworks` | Browse and install available frameworks | When you want to add framework guidance to your project |
| `Initialize Workspace` | Set up a new Kiro workspace | When starting a new project |
| `Create Custom Steering` | Create a custom steering document | When you need team-specific guidance |
| `Validate Steering Document` | Validate current steering document | Before committing steering changes |
| `Update Framework` | Update a specific framework | When a framework has a new version |
| `Update All Frameworks` | Update all installed frameworks | To get latest guidance across all frameworks |
| `Search Frameworks` | Search framework reference documentation | When you need to understand framework concepts |
| `View Framework Reference` | Open framework reference documentation | When viewing a steering document |

## 🎯 Usage Examples

### Installing Your First Framework

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Browse Frameworks"
3. Select a framework (e.g., "TDD/BDD Testing Strategy")
4. Click "Install"
5. The framework is now in `.kiro/steering/strategy-tdd-bdd.md`

### Creating a Custom Steering Document

1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Create Custom Steering"
3. Enter a name (e.g., "team-standards")
4. Edit the template with your team's guidance
5. Save and Kiro will use it alongside framework strategies

### Updating Frameworks

When updates are available, you'll see a notification. To update:

1. Click the notification, or
2. Open Command Palette and run "Update All Frameworks"
3. Review changes in the diff preview
4. Confirm to update

If you've customized a framework, the extension will:
- Warn you before overwriting
- Offer to create a backup
- Show you what changed

### Validating Steering Documents

Before committing changes to steering documents:

1. Open the steering document
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run "Validate Steering Document"
4. Fix any issues highlighted in the editor
5. Re-validate until all checks pass

## 🔧 How It Works

### Framework Installation

When you install a framework:
1. The extension copies the framework markdown file to `.kiro/steering/`
2. The file is named `strategy-{framework}.md` (e.g., `strategy-tdd-bdd.md`)
3. Metadata is stored in `.kiro/.metadata/installed-frameworks.json`
4. Kiro automatically discovers and uses the guidance

### Steering Document Structure

All steering documents follow a consistent structure:
- **Purpose**: What this guidance is for
- **Key Concepts**: Core principles and patterns
- **Best Practices**: Recommended approaches
- **Anti-Patterns**: What to avoid
- **Summary**: Quick reference

### Integration with Kiro

Kiro reads steering documents from `.kiro/steering/` and uses them to:
- Guide spec creation (requirements, design, tasks)
- Apply framework-specific patterns
- Validate implementations against best practices
- Generate appropriate documentation

## 🏗️ Project Structure

After installing frameworks, your project will look like:

```
your-project/
├── .kiro/
│   ├── steering/                    # Steering documents
│   │   ├── strategy-tdd-bdd.md      # Installed framework
│   │   ├── strategy-security.md     # Installed framework
│   │   ├── strategy-azure.md        # Installed framework
│   │   ├── product.md               # Project-specific (you create)
│   │   ├── tech.md                  # Project-specific (you create)
│   │   └── custom-team.md           # Custom (you create)
│   ├── specs/                       # Feature specs (Kiro creates)
│   ├── settings/                    # Extension settings
│   └── .metadata/                   # Extension metadata
│       └── installed-frameworks.json
├── frameworks/                      # Framework references (optional)
└── ...
```

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment to the VS Code Marketplace.

### Pipeline Overview

```
Commit → Build → Test → Package → Deploy → Monitor
```

**Automated Workflows:**
- **Build**: Runs on every push - compiles TypeScript, runs tests, validates coverage (80%+)
- **PR Quality Gates**: Runs on pull requests - security scanning, version validation, status reporting
- **Version**: Runs on main branch merge - analyzes commits, bumps version, generates changelog
- **Package**: Runs on version tag - creates VSIX package, validates structure, uploads artifacts
- **Deploy**: Runs on release - publishes to VS Code Marketplace, verifies deployment
- **Rollback**: Manual trigger - rolls back to previous version if needed

### Build Status

| Workflow | Status | Description |
|----------|--------|-------------|
| Build | [![Build](https://github.com/pliekhus77/pr-suit-for-kiro/workflows/Build/badge.svg)](https://github.com/pliekhus77/pr-suit-for-kiro/actions/workflows/build.yml) | Compile, test, and validate |
| PR Quality Gates | [![PR Quality](https://github.com/pliekhus77/pr-suit-for-kiro/workflows/PR%20Quality%20Gates/badge.svg)](https://github.com/pliekhus77/pr-suit-for-kiro/actions/workflows/pr-quality-gates.yml) | Security and quality checks |
| Package | [![Package](https://github.com/pliekhus77/pr-suit-for-kiro/workflows/Package/badge.svg)](https://github.com/pliekhus77/pr-suit-for-kiro/actions/workflows/package.yml) | Create VSIX package |
| Deploy | [![Deploy](https://github.com/pliekhus77/pr-suit-for-kiro/workflows/Deploy/badge.svg)](https://github.com/pliekhus77/pr-suit-for-kiro/actions/workflows/deploy.yml) | Publish to marketplace |

### Deployment Process

1. **Commit with Conventional Commits** (e.g., `feat:`, `fix:`, `BREAKING CHANGE:`)
2. **Merge to main** - Version workflow analyzes commits and creates version tag
3. **Version tag pushed** - Package workflow creates VSIX artifact
4. **Create GitHub Release** - Deploy workflow publishes to VS Code Marketplace
5. **Verification** - Automated checks confirm extension is live

### Deployment Documentation

- **Secrets Setup**: [docs/deployment/SECRETS.md](docs/deployment/SECRETS.md)
- **Deployment Runbook**: [docs/deployment/RUNBOOK.md](docs/deployment/RUNBOOK.md)
- **Troubleshooting**: [docs/deployment/TROUBLESHOOTING.md](docs/deployment/TROUBLESHOOTING.md)
- **Onboarding Checklist**: [docs/deployment/ONBOARDING_CHECKLIST.md](docs/deployment/ONBOARDING_CHECKLIST.md)

### Manual Deployment

If needed, you can manually trigger deployment:

```bash
# Create a release through GitHub UI or CLI
gh release create v1.0.0 --title "Release 1.0.0" --notes "Release notes here"

# Or manually publish with vsce
vsce publish
```

### Rollback

To rollback to a previous version:

1. Go to Actions → Rollback workflow
2. Click "Run workflow"
3. Enter the version to rollback to (e.g., `1.0.0`)
4. Confirm execution

See [docs/deployment/RUNBOOK.md](docs/deployment/RUNBOOK.md) for detailed rollback procedures.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/pliekhus77/pr-suit-for-kiro.git
cd pr-suit-for-kiro

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test commands in the Command Palette

### Running Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Package Extension

```bash
# Build production bundle
npm run package

# Create VSIX package
vsce package
```

## 📝 Troubleshooting

### Extension Not Activating

**Problem**: Extension doesn't appear in Command Palette

**Solution**: Ensure your workspace contains a `.kiro/` directory, or use "Pragmatic Rhino SUIT: Initialize Workspace" command

### Frameworks Not Installing

**Problem**: "Install Framework" command fails

**Solution**: 
1. Check that `.kiro/steering/` directory exists
2. Verify you have write permissions
3. Check VS Code output panel for errors

### Tree View Not Showing

**Problem**: "Framework Steering" tree view is empty

**Solution**:
1. Ensure `.kiro/steering/` directory exists
2. Install at least one framework
3. Click the refresh button in the tree view

### Updates Not Detected

**Problem**: Extension doesn't notify about updates

**Solution**:
1. Check that `pragmaticRhinoSuit.autoCheckUpdates` is enabled
2. Manually run "Update All Frameworks" command
3. Verify internet connection (if checking remote versions)

## 🛡️ Quality Gates

This project enforces strict quality standards through automated quality gates:

### Coverage Requirements
- **Minimum Coverage**: 80% (lines, branches, functions, statements)
- **Critical Paths**: 100% coverage required
- **Enforcement**: Pre-commit hooks, CI/CD pipeline, PR checks

### Quality Levels
1. **Pre-Commit** - Fast local checks (~30s)
   - ESLint code quality
   - Unit tests execution
   - TypeScript compilation

2. **Continuous Integration** - Comprehensive checks (~5-10min)
   - Multi-version testing (Node 18.x, 20.x)
   - Unit, integration, and BDD tests
   - Security scanning
   - Build verification

3. **Pull Request** - Merge requirements
   - All CI checks pass
   - Coverage ≥ 80%
   - 1 approval required
   - Conversations resolved

4. **Post-Merge** - Monitoring
   - Automated test failure notifications
   - Coverage trend tracking
   - Security alerts

### Documentation
- **Comprehensive Guide**: [docs/QUALITY_GATES.md](docs/QUALITY_GATES.md)
- **Quick Reference**: [docs/QUALITY_GATES_QUICK_REFERENCE.md](docs/QUALITY_GATES_QUICK_REFERENCE.md)
- **Setup Summary**: [docs/QUALITY_GATES_SETUP_SUMMARY.md](docs/QUALITY_GATES_SETUP_SUMMARY.md)
- **Branch Protection**: [.github/BRANCH_PROTECTION.md](.github/BRANCH_PROTECTION.md)

## Release Notes

### 0.1.0

Initial release with core framework management features:
- Framework browsing and installation
- Tree view for managing installed frameworks
- Workspace initialization
- Custom steering document creation
- Steering document validation
- Comprehensive quality gates with 80% coverage enforcement

## License

MIT

## Links

- **GitHub Repository**: https://github.com/pliekhus77/pr-suit-for-kiro
- **Issues**: https://github.com/pliekhus77/pr-suit-for-kiro/issues
- **Kiro Documentation**: https://docs.aws.amazon.com/kiro/
