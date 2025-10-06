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

#### `package.yml` - Extension Packaging
**Trigger:** Tag push matching `v*.*.*`  
**Purpose:** Create VSIX package for marketplace deployment  
**Key Steps:**
- Validate tag format
- Checkout tagged commit
- Install production dependencies
- Compile TypeScript
- Run vsce package
- Validate VSIX structure
- Upload artifact (90-day retention)

---

#### `deploy.yml` - Marketplace Deployment
**Trigger:** GitHub release published  
**Purpose:** Publish extension to VS Code Marketplace  
**Key Steps:**
- Download VSIX artifact
- Authenticate with marketplace (VSCE_PAT)
- Publish using vsce
- Verify deployment
- Post success comment
- Send notifications

**Required Secrets:**
- `VSCE_PAT` - VS Code Marketplace Personal Access Token

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
version.yml (creates tag)
    ↓
package.yml (on tag push)
    ↓
Maintainer creates release
    ↓
deploy.yml (publishes to marketplace)
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

## Manual Workflow Triggers

Some workflows can be triggered manually:

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
