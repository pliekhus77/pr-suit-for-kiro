# CI/CD Onboarding Checklist

## Overview

This document provides a comprehensive onboarding checklist for new team members joining the Pragmatic Rhino SUIT project. It covers all necessary access requirements, setup steps, and role-specific responsibilities for working with the GitHub Actions CI/CD pipeline.

**Target Audience:** New developers, maintainers, and DevOps engineers joining the project

**Time to Complete:** 1-2 hours (depending on role and access approval times)

---

## Table of Contents

1. [Team Roles and Responsibilities](#team-roles-and-responsibilities)
2. [Access Requirements by Role](#access-requirements-by-role)
3. [General Setup Checklist](#general-setup-checklist)
4. [Developer-Specific Setup](#developer-specific-setup)
5. [Maintainer-Specific Setup](#maintainer-specific-setup)
6. [DevOps Engineer-Specific Setup](#devops-engineer-specific-setup)
7. [Verification Steps](#verification-steps)
8. [Additional Resources](#additional-resources)

---

## Team Roles and Responsibilities

### Developer

**Primary Responsibilities:**
- Write and commit code following conventional commit standards
- Create pull requests with proper descriptions
- Respond to PR quality gate failures
- Fix build and test failures
- Maintain code coverage above 80%

**CI/CD Interactions:**
- Trigger build workflows on commits
- Monitor PR quality gate results
- Review test results and coverage reports
- Address security vulnerabilities

**Required Knowledge:**
- Conventional commit message format
- How to interpret build failures
- Code coverage requirements
- Security scanning results

---

### Maintainer

**Primary Responsibilities:**
- Review and merge pull requests
- Create GitHub releases
- Monitor deployment status
- Execute rollback procedures when needed
- Manage version tags

**CI/CD Interactions:**
- Approve pull requests (triggers merge to main)
- Create releases (triggers deployment)
- Manually trigger rollback workflow
- Monitor marketplace deployment status
- Respond to deployment notifications

**Required Knowledge:**
- Release creation process
- Rollback procedures
- Deployment verification
- Marketplace publishing process

---

### DevOps Engineer

**Primary Responsibilities:**
- Maintain and update workflow files
- Manage GitHub secrets and credentials
- Configure environment settings
- Monitor pipeline performance
- Troubleshoot workflow failures
- Implement pipeline improvements

**CI/CD Interactions:**
- Modify workflow YAML files
- Rotate secrets (VSCE_PAT)
- Configure environment variables
- Review workflow audit logs
- Optimize build performance

**Required Knowledge:**
- GitHub Actions syntax and features
- Secret management best practices
- Workflow debugging techniques
- Performance optimization strategies

---

## Access Requirements by Role

### All Team Members

- [ ] GitHub account with 2FA enabled
- [ ] Added to GitHub repository as collaborator
- [ ] Access to team communication channels (Slack/Teams)
- [ ] Read access to workflow documentation

### Developers

- [ ] **Repository Access:** Write permission
- [ ] **Branch Protection:** Can create branches and PRs
- [ ] **Actions Access:** Can view workflow runs
- [ ] **Artifacts Access:** Can download test results and coverage reports

### Maintainers

- [ ] **Repository Access:** Maintain or Admin permission
- [ ] **Branch Protection:** Can approve and merge PRs
- [ ] **Actions Access:** Can manually trigger workflows
- [ ] **Releases Access:** Can create and publish releases
- [ ] **Secrets Access:** Read-only (view secret names, not values)

### DevOps Engineers

- [ ] **Repository Access:** Admin permission
- [ ] **Actions Access:** Full access to workflows and settings
- [ ] **Secrets Access:** Full access (create, update, delete)
- [ ] **Settings Access:** Can modify repository settings
- [ ] **Azure DevOps Access:** Can create Personal Access Tokens for VSCE_PAT

---

## General Setup Checklist

### Prerequisites

Complete these steps before starting role-specific setup:

- [ ] **GitHub Account Setup**
  - Create GitHub account (if needed)
  - Enable two-factor authentication (2FA)
  - Add SSH key or configure Git credentials
  - Set up Git user name and email

- [ ] **Development Environment**
  - Install Node.js 18.x or later
  - Install npm (comes with Node.js)
  - Install Git
  - Install VS Code (recommended IDE)

- [ ] **Repository Access**
  - Request repository access from team lead
  - Accept GitHub repository invitation
  - Clone repository locally
  - Verify you can push to a test branch

- [ ] **Documentation Review**
  - Read `README.md` for project overview
  - Review `CONTRIBUTING.md` for contribution guidelines
  - Read `docs/deployment/WORKFLOWS.md` for pipeline overview
  - Bookmark `docs/deployment/TROUBLESHOOTING.md`

### Initial Setup Commands

```bash
# Clone the repository
git clone https://github.com/pragmatic-rhino/pragmatic-rhino-suit.git
cd pragmatic-rhino-suit

# Install dependencies
npm install

# Verify build works locally
npm run compile

# Run tests locally
npm test

# Check code coverage
npm run test:coverage

# Run linting
npm run lint
```

### Verify Local Environment

- [ ] TypeScript compiles without errors
- [ ] All tests pass locally
- [ ] Code coverage report generates
- [ ] ESLint runs without errors
- [ ] Extension can be debugged in VS Code (F5)

---

## Developer-Specific Setup

### 1. Learn Conventional Commits

**Why:** Commit messages determine automatic version bumping

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `chore:` - Maintenance (patch version bump)
- `docs:` - Documentation only
- `test:` - Test changes only
- `refactor:` - Code refactoring

**Breaking Changes:**
- Add `BREAKING CHANGE:` in footer (major version bump)
- Or add `!` after type: `feat!:` (major version bump)

**Examples:**
```bash
# Minor version bump (new feature)
git commit -m "feat: add diagram preview panel"

# Patch version bump (bug fix)
git commit -m "fix: resolve spec validation error"

# Major version bump (breaking change)
git commit -m "feat!: change spec file structure

BREAKING CHANGE: Spec files now require testing-plan.md"
```

**Practice:**
- [ ] Read [Conventional Commits specification](https://www.conventionalcommits.org/)
- [ ] Review recent commits in repository for examples
- [ ] Install commit message linter (optional): `npm install -g @commitlint/cli`

### 2. Understand PR Quality Gates

**What Happens When You Create a PR:**

1. **Build Workflow** runs automatically
   - Compiles TypeScript
   - Runs ESLint
   - Executes all tests
   - Generates coverage report

2. **Quality Checks** must pass:
   - ✅ All tests pass
   - ✅ Code coverage ≥ 80%
   - ✅ No ESLint errors
   - ✅ No critical/high security vulnerabilities
   - ✅ Valid semantic version in package.json

3. **PR Status** updated:
   - Green checkmark = All checks passed
   - Red X = One or more checks failed
   - Yellow dot = Checks in progress

**How to Fix Failed Checks:**

```bash
# If tests fail
npm test -- --verbose

# If coverage is low
npm run test:coverage
# Add tests for uncovered code

# If linting fails
npm run lint
npm run lint:fix  # Auto-fix some issues

# If security vulnerabilities found
npm audit
npm audit fix  # Fix automatically if possible
```

**Checklist:**
- [ ] Review PR quality gate requirements
- [ ] Practice creating a test PR
- [ ] Intentionally fail a check to see the error message
- [ ] Fix the failure and see the check pass

### 3. Monitor Build Status

**Where to Check:**
- GitHub PR page (status checks section)
- Actions tab → Your branch workflow runs
- Email notifications (if enabled)

**What to Look For:**
- Build duration (should be < 5 minutes)
- Test results (all should pass)
- Coverage percentage (should be ≥ 80%)
- Security scan results (no critical/high)

**Checklist:**
- [ ] Know how to navigate to Actions tab
- [ ] Can view workflow run details
- [ ] Can download test result artifacts
- [ ] Can interpret coverage reports

---

## Maintainer-Specific Setup

### 1. Understand Release Process

**Release Workflow:**

1. **Merge to Main** → Version workflow runs
   - Analyzes commits since last version
   - Bumps version in package.json
   - Updates CHANGELOG.md
   - Creates version tag (e.g., v1.2.3)

2. **Create GitHub Release** → Deploy workflow runs
   - Downloads VSIX artifact
   - Publishes to VS Code Marketplace
   - Verifies deployment
   - Posts success comment

**Checklist:**
- [ ] Read `docs/deployment/RUNBOOK.md`
- [ ] Understand semantic versioning rules
- [ ] Know how to create a GitHub release
- [ ] Understand when to use pre-release flag

### 2. Learn Rollback Procedures

**When to Rollback:**
- Extension causes VS Code crashes
- Critical bugs in production
- Security vulnerability discovered
- High error rate on marketplace

**How to Rollback:**

1. Navigate to Actions → Rollback Deployment
2. Click "Run workflow"
3. Enter version to rollback to (e.g., `v1.2.2`)
4. Monitor rollback progress
5. Verify on marketplace

**Checklist:**
- [ ] Read `docs/deployment/MANUAL_TRIGGERS.md`
- [ ] Practice rollback in test environment (if available)
- [ ] Know how to find previous version numbers
- [ ] Understand rollback verification steps

### 3. Configure Notifications

**Recommended Setup:**
- Enable GitHub email notifications for:
  - Workflow failures
  - Deployment completions
  - Security alerts

**How to Configure:**

1. GitHub Settings → Notifications
2. Enable "Actions" notifications
3. Choose email or web notifications
4. Set up mobile notifications (optional)

**Checklist:**
- [ ] Configure GitHub notifications
- [ ] Test notification delivery
- [ ] Join team communication channel
- [ ] Know escalation procedures for critical failures

### 4. Practice Release Creation

**Test Release Checklist:**

- [ ] Merge a test PR to main
- [ ] Verify version workflow creates tag
- [ ] Create a test release (mark as pre-release)
- [ ] Monitor deploy workflow
- [ ] Verify extension on marketplace (if test publisher available)
- [ ] Practice rollback to previous version

---

## DevOps Engineer-Specific Setup

### 1. Azure DevOps Access

**Required For:** Creating and rotating VSCE_PAT

**Setup Steps:**

- [ ] Request Azure DevOps access from admin
- [ ] Verify access to publisher organization
- [ ] Confirm permissions to create Personal Access Tokens
- [ ] Review token creation process in `docs/deployment/SECRETS.md`

### 2. GitHub Secrets Management

**Access Required:**
- Repository Admin role
- Ability to view and modify secrets

**Setup Steps:**

- [ ] Navigate to repository Settings → Secrets and variables → Actions
- [ ] Verify VSCE_PAT secret exists
- [ ] Note secret creation date for rotation tracking
- [ ] Review secret rotation procedures
- [ ] Set calendar reminder for 90-day rotation

**Checklist:**
- [ ] Can access GitHub Secrets page
- [ ] Understand secret rotation schedule
- [ ] Know how to create new secrets
- [ ] Know how to update existing secrets
- [ ] Understand secret masking in logs

### 3. Workflow Maintenance

**Files to Understand:**

```
.github/workflows/
├── build.yml              # Core build pipeline
├── pr-quality-gates.yml   # PR validation
├── version.yml            # Automatic versioning
├── package.yml            # VSIX creation
├── deploy.yml             # Marketplace publishing
└── rollback.yml           # Rollback capability
```

**Checklist:**
- [ ] Review all workflow YAML files
- [ ] Understand workflow triggers
- [ ] Know how workflows depend on each other
- [ ] Understand artifact flow between workflows
- [ ] Can modify and test workflow changes

### 4. Monitoring and Audit

**What to Monitor:**
- Workflow execution times
- Build success rates
- Deployment frequency
- Secret access logs
- Artifact storage usage

**Tools:**
- GitHub Actions dashboard
- Workflow run history
- Audit log (Settings → Audit log)

**Checklist:**
- [ ] Know how to access workflow metrics
- [ ] Can review audit logs
- [ ] Understand artifact retention policies
- [ ] Can identify performance bottlenecks
- [ ] Know how to export workflow data

### 5. Emergency Procedures

**Critical Scenarios:**

1. **Secret Compromised**
   - Immediately rotate VSCE_PAT
   - Review audit logs for unauthorized access
   - Notify team of potential impact
   - Follow incident response procedures

2. **Workflow Failure**
   - Check workflow run logs
   - Identify failure point
   - Determine if issue is transient or persistent
   - Fix and re-run or escalate

3. **Marketplace Outage**
   - Verify marketplace status
   - Pause deployments if needed
   - Communicate with team
   - Resume when service restored

**Checklist:**
- [ ] Read `docs/deployment/TROUBLESHOOTING.md`
- [ ] Know escalation contacts
- [ ] Understand incident response procedures
- [ ] Have access to status pages (GitHub, Azure DevOps, VS Code Marketplace)

---

## Verification Steps

### For All Team Members

After completing your role-specific setup, verify your access and knowledge:

- [ ] **Repository Access**
  - Can clone repository
  - Can create branches
  - Can view Actions tab
  - Can view workflow runs

- [ ] **Documentation**
  - Have bookmarked key documentation
  - Understand where to find help
  - Know who to contact for questions

- [ ] **Communication**
  - Added to team channels
  - Notifications configured
  - Know escalation procedures

### For Developers

- [ ] Successfully created a test branch
- [ ] Made a commit with conventional commit format
- [ ] Created a test PR
- [ ] Saw PR quality gates run
- [ ] Reviewed test results and coverage
- [ ] Merged or closed test PR

### For Maintainers

- [ ] Can approve pull requests
- [ ] Can create GitHub releases
- [ ] Can manually trigger rollback workflow
- [ ] Understand deployment verification process
- [ ] Know how to respond to deployment failures

### For DevOps Engineers

- [ ] Can access GitHub Secrets
- [ ] Can modify workflow files
- [ ] Can view audit logs
- [ ] Understand secret rotation process
- [ ] Can troubleshoot workflow failures

---

## Additional Resources

### Documentation

- **Workflows:** `docs/deployment/WORKFLOWS.md` - Overview of all workflows
- **Secrets:** `docs/deployment/SECRETS.md` - Secret management guide
- **Runbook:** `docs/deployment/RUNBOOK.md` - Deployment procedures
- **Troubleshooting:** `docs/deployment/TROUBLESHOOTING.md` - Common issues and solutions
- **Manual Triggers:** `docs/deployment/MANUAL_TRIGGERS.md` - How to manually trigger workflows

### External Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Azure DevOps Personal Access Tokens](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)

### Team Contacts

**For Questions About:**
- Code and development: Contact development team lead
- Releases and deployments: Contact maintainer team
- Pipeline and infrastructure: Contact DevOps engineer
- Secrets and access: Contact repository admin

### Training Sessions

**Recommended Training:**
- Conventional Commits workshop (30 minutes)
- CI/CD pipeline walkthrough (1 hour)
- Rollback procedure practice (30 minutes)
- Secret rotation drill (quarterly)

---

## Onboarding Completion

### Sign-Off Checklist

Once you've completed all applicable sections, have your onboarding verified:

- [ ] **General Setup** - Verified by: _________________ Date: _______
- [ ] **Role-Specific Setup** - Verified by: _________________ Date: _______
- [ ] **Verification Steps** - Verified by: _________________ Date: _______
- [ ] **First Contribution** - Merged PR #: _______ Date: _______

### Feedback

Help us improve this onboarding process:

- What was unclear or confusing?
- What additional information would have been helpful?
- How long did onboarding actually take?
- Suggestions for improvement?

**Submit feedback to:** [Create an issue with label "onboarding-feedback"]

---

## Maintenance

**Document Owner:** DevOps Team

**Review Schedule:** Quarterly or when pipeline changes

**Last Updated:** [Date will be added when document is created]

**Version:** 1.0.0

