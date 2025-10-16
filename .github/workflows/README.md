# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the CI/CD pipeline that builds, tests, packages, and deploys the Pragmatic Rhino SUIT VS Code extension to the Visual Studio Code Marketplace.

## Workflows Overview

### Core Workflows

#### `build.yml` - Automated Build Pipeline
**Trigger:** Push to any branch, pull request events  
**Purpose:** Compile, test, and validate code on every commit  
**Key Steps:**
- Restore npm dependencies
- Compile TypeScript
- Run ESLint
- Execute Jest tests
- Generate coverage reports
- Upload artifacts

**Quality Gates:**
- Compilation must succeed
- Linting must pass
- All tests must pass
- Coverage must be ≥ 80%

---

#### `pr-quality-gates.yml` - Pull Request Validation
**Trigger:** PR opened, synchronized, reopened  
**Purpose:** Enforce quality standards before merge  
**Key Steps:**
- Run full build pipeline
- Security vulnerability scanning (npm audit)
- Version validation
- Post status comment with results

**Quality Gates:**
- All build checks pass
- No critical/high vulnerabilities
- Valid semantic version
- Coverage ≥ 80%

---

#### `version.yml` - Automated Versioning
**Trigger:** Push to main branch  
**Purpose:** Manage semantic versioning based on commit messages  
**Key Steps:**
- Analyze commit messages
- Determine version bump (major/minor/patch)
- Update package.json
- Generate CHANGELOG.md
- Create and push git tag

**Versioning Rules:**
- `BREAKING CHANGE:` or `!` → Major version
- `feat:` → Minor version
- `fix:` or `chore:` → Patch version

---

#### `release.yml` - Complete Release Pipeline ⭐ **NEW**
**Trigger:** Tag push matching `v*.*.*`  
**Purpose:** End-to-end release process with VSIX creation and GitHub release  
**Key Steps:**
- Validate semantic version tag format
- Build and test extension (full quality gates)
- Create VSIX package with validation
- Generate changelog and create GitHub release
- Attach VSIX to release as downloadable asset
- Optionally publish to VS Code Marketplace
- Send completion notifications

**Features:**
- ✅ Complete release automation in single workflow
- 📦 VSIX attached to GitHub releases for manual installation
- 🌐 Automatic marketplace publishing (if VSCE_PAT configured)
- 🔍 Pre-release detection (versions with `-alpha`, `-beta`, `-rc`)
- 📊 Release metrics and verification
- 🚀 Helper script: `npm run release:patch`

---

#### `package.yml` - Extension Packaging (Legacy)
**Trigger:** Tag push matching `v*.*.*`  
**Purpose:** Create VSIX package only (superseded by release.yml)  
**Status:** ⚠️ Legacy - Use `release.yml` for new releases

---

#### `deploy.yml` - Marketplace Deployment (Legacy)
**Trigger:** GitHub release published  
**Purpose:** Publish to VS Code Marketplace only (superseded by release.yml)  
**Status:** ⚠️ Legacy - Use `release.yml` for new releases

---

#### `rollback.yml` - Rollback Capability
**Trigger:** Manual workflow dispatch  
**Purpose:** Rollback to a previous version  
**Key Steps:**
- Select version to rollback to
- Download VSIX artifact
- Republish to marketplace
- Update release notes
- Send notification

**Access:** Repository maintainers only

---

## Workflow Dependencies

```
Developer Commit
    ↓
build.yml (on any branch)
    ↓
pr-quality-gates.yml (on PR)
    ↓
Merge to main
    ↓
Create version tag (manual or script)
    ↓
release.yml (complete release pipeline)
    ├── Build & Test
    ├── Package VSIX
    ├── Create GitHub Release
    └── Publish to Marketplace (optional)
```

### Legacy Flow (Deprecated)
```
version.yml (creates tag) → package.yml → deploy.yml
```

## Environment Configuration

### Development
- **Trigger:** Every commit
- **Tests:** Unit tests only
- **Coverage:** Report but don't enforce
- **Artifacts:** 30-day retention

### Pull Request
- **Trigger:** PR opened/updated
- **Tests:** Unit + integration
- **Coverage:** Enforce 80% threshold
- **Security:** npm audit (fail on critical/high)

### Staging (Main Branch)
- **Trigger:** Merge to main
- **Tests:** Full test suite
- **Versioning:** Automatic version bump
- **Artifacts:** Git tag created

### Production
- **Trigger:** Release published
- **Approval:** Optional manual approval
- **Tests:** Smoke tests post-deployment
- **Artifacts:** VSIX (90-day retention)

## Required Secrets

Configure these secrets in repository settings:

| Secret | Description | Rotation |
|--------|-------------|----------|
| `VSCE_PAT` | VS Code Marketplace Personal Access Token | 90 days |
| `GITHUB_TOKEN` | Automatic token (provided by Actions) | Per run |

### Setting Up VSCE_PAT

1. Go to https://dev.azure.com/
2. Create a Personal Access Token with Marketplace (Publish) scope
3. Add to GitHub repository secrets as `VSCE_PAT`
4. Document expiration date

See `docs/deployment/SECRETS.md` for detailed instructions.

## Monitoring and Metrics

### Build Metrics
- Build duration (target: < 5 minutes)
- Test execution time (target: < 2 minutes)
- Code coverage (target: ≥ 80%)
- Build success rate (target: ≥ 95%)

### Deployment Metrics
- Deployment frequency (target: multiple per week)
- Lead time (commit to production) (target: < 1 day)
- Deployment success rate (target: ≥ 98%)
- Time to rollback (target: < 15 minutes)

## Troubleshooting

### Common Issues

**Build Failures:**
- Check compilation errors in logs
- Verify dependencies are up to date
- Check test failures and coverage

**Deployment Failures:**
- Verify VSCE_PAT is valid and not expired
- Check marketplace status
- Verify VSIX artifact exists

**Version Conflicts:**
- Ensure commit messages follow conventional commits
- Check version in package.json
- Verify tag doesn't already exist

### Getting Help

1. Check workflow run logs in GitHub Actions tab
2. Review `docs/deployment/` documentation
3. Check `.kiro/specs/github-actions-marketplace-deploy/` for requirements and design
4. Contact repository maintainers

## Release Process

### Quick Release (Recommended)
Use the helper script for automated releases:

```bash
# Patch release (1.2.3 → 1.2.4)
npm run release:patch

# Minor release (1.2.3 → 1.3.0)  
npm run release:minor

# Major release (1.2.3 → 2.0.0)
npm run release:major

# Custom version
npm run release 1.2.3-beta.1
```

The script will:
1. ✅ Validate git state (clean working directory)
2. 🧪 Run tests and check coverage
3. 📝 Update package.json version
4. 🏷️ Create and push git tag
5. 🚀 Trigger automated release workflow

### Manual Release
For manual control:

```bash
# Update version in package.json
npm version patch  # or minor, major

# Create and push tag
git tag v1.2.3
git push origin v1.2.3
```

### Pre-releases
Create pre-release versions for testing:

```bash
# Beta release
git tag v1.2.3-beta.1
git push origin v1.2.3-beta.1

# Alpha release
git tag v1.2.3-alpha.1  
git push origin v1.2.3-alpha.1

# Release candidate
git tag v1.2.3-rc.1
git push origin v1.2.3-rc.1
```

**Note:** Pre-releases create GitHub pre-releases and do NOT publish to marketplace.

### Installation Options

**From GitHub Release (Always Available):**
1. Go to [Releases page](../../releases)
2. Download `.vsix` file from latest release
3. Install: `code --install-extension pragmatic-rhino-suit-1.2.3.vsix`

**From VS Code Marketplace (If Published):**
1. Search "Pragmatic Rhino SUIT" in VS Code Extensions
2. Or install: `code --install-extension pragmatic-rhino.pragmatic-rhino-suit`

## Manual Workflow Triggers

### Rollback Workflow
1. Go to Actions tab
2. Select "Rollback" workflow  
3. Click "Run workflow"
4. Enter version tag to rollback to
5. Confirm execution

## Best Practices

### Commit Messages
Follow Conventional Commits specification:
```
feat: add new feature
fix: fix bug
chore: update dependencies
docs: update documentation
BREAKING CHANGE: breaking change description
```

### Pull Requests
- Ensure all checks pass before requesting review
- Address all PR comments
- Keep PRs focused and small
- Update documentation as needed

### Releases
- Create release from main branch only
- Use semantic version tags (v1.2.3)
- Include release notes
- Test in staging before production release

## Documentation

For detailed information:
- Requirements: `.kiro/specs/github-actions-marketplace-deploy/requirements.md`
- Design: `.kiro/specs/github-actions-marketplace-deploy/design.md`
- Tasks: `.kiro/specs/github-actions-marketplace-deploy/tasks.md`
- Secrets Setup: `docs/deployment/SECRETS.md` (to be created)
- Runbook: `docs/deployment/RUNBOOK.md` (to be created)
