# Staging Environment Configuration

## Overview

The staging environment is configured to automatically manage versioning when code is merged to the `main` branch. This document describes the configuration, how it works, and how to test it.

## Configuration Summary

### Main Branch Triggers ✅

**Version Workflow** (`.github/workflows/version.yml`):
- **Trigger**: Push to `main` branch (after PR merge)
- **Purpose**: Automated semantic versioning and changelog generation
- **Runs on**: Every merge to main (unless commit contains `[skip ci]` or `[skip version]`)
- **Includes**: Version analysis, package.json update, changelog generation, git tagging

**Trigger Configuration**:
```yaml
on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.github/**'
      - '!.github/workflows/**'
```

**Skip Conditions**:
- Commits with `[skip ci]` in message
- Commits with `[skip version]` in message
- Changes only to markdown files (except workflow files)
- Changes only to docs directory

### Version Workflow Process

The version workflow follows these steps:

1. **Checkout Repository**: Fetches full git history for version analysis
2. **Setup Node.js**: Configures Node.js 18.x environment
3. **Install Dependencies**: Runs `npm ci` to install packages
4. **Configure Git**: Sets up git user for automated commits
5. **Get Current Version**: Reads version from package.json
6. **Get Last Tag**: Finds the last version tag (or initial commit if none)
7. **Analyze Commits**: Determines version bump type based on conventional commits
8. **Update Version**: Updates package.json and package-lock.json
9. **Generate Changelog**: Creates CHANGELOG.md entries from commits
10. **Commit Changes**: Commits version and changelog updates with `[skip ci]`
11. **Create Tag**: Creates and pushes version tag (e.g., `v1.2.3`)
12. **Summary**: Generates workflow summary with version details

### Conventional Commit Analysis

The workflow analyzes commit messages to determine the version bump:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `BREAKING CHANGE:` or `!` | Major (1.0.0 → 2.0.0) | `feat!: redesign API` |
| `feat:` | Minor (1.0.0 → 1.1.0) | `feat: add new feature` |
| `fix:` | Patch (1.0.0 → 1.0.1) | `fix: resolve bug` |
| `chore:`, `docs:`, `style:` | Patch (1.0.0 → 1.0.1) | `chore: update dependencies` |
| No conventional commits | No bump | `update readme` |

### Concurrency Control

The workflow uses concurrency control to prevent multiple version workflows from running simultaneously:

```yaml
concurrency:
  group: version-${{ github.ref }}
  cancel-in-progress: false
```

This ensures that version bumps are processed sequentially and prevents race conditions.

### Permissions

The workflow requires the following permissions:

```yaml
permissions:
  contents: write  # Required to push commits and tags
```

This allows the workflow to:
- Commit version and changelog changes
- Create and push git tags
- Update the main branch

## Testing Version Bumping

### Test Scenario 1: Patch Version Bump (Fix)

**Objective**: Verify that a `fix:` commit triggers a patch version bump

**Steps**:

1. Create a feature branch:
```bash
git checkout -b fix/test-patch-bump
```

2. Make a change and commit with `fix:` prefix:
```bash
echo "// Bug fix" >> src/extension.ts
git add src/extension.ts
git commit -m "fix: resolve issue with extension activation"
git push origin fix/test-patch-bump
```

3. Create and merge a pull request:
```bash
gh pr create --title "Fix: Test Patch Bump" --body "Testing patch version bump"
gh pr merge --squash --delete-branch
```

4. Verify version workflow runs:
   - Go to GitHub Actions → Version Management workflow
   - Verify workflow triggered on main branch push
   - Check workflow summary shows patch bump (e.g., 1.0.0 → 1.0.1)

5. Verify version changes:
```bash
git checkout main
git pull
cat package.json | grep version  # Should show new patch version
git tag --list | tail -1          # Should show new tag (e.g., v1.0.1)
cat CHANGELOG.md | head -20       # Should show new changelog entry
```

**Expected Results**:
- ✅ Version workflow runs automatically
- ✅ Patch version incremented (e.g., 1.0.0 → 1.0.1)
- ✅ package.json updated with new version
- ✅ package-lock.json updated
- ✅ CHANGELOG.md contains new entry with fix commit
- ✅ Git tag created (e.g., v1.0.1)
- ✅ Tag pushed to remote
- ✅ Commit message includes `[skip ci]` to prevent loop

### Test Scenario 2: Minor Version Bump (Feature)

**Objective**: Verify that a `feat:` commit triggers a minor version bump

**Steps**:

1. Create a feature branch:
```bash
git checkout -b feat/test-minor-bump
```

2. Make a change and commit with `feat:` prefix:
```bash
echo "// New feature" >> src/extension.ts
git add src/extension.ts
git commit -m "feat: add new command for spec validation"
git push origin feat/test-minor-bump
```

3. Create and merge a pull request:
```bash
gh pr create --title "Feature: Test Minor Bump" --body "Testing minor version bump"
gh pr merge --squash --delete-branch
```

4. Verify version workflow runs and check results (same as Test Scenario 1)

**Expected Results**:
- ✅ Version workflow runs automatically
- ✅ Minor version incremented (e.g., 1.0.1 → 1.1.0)
- ✅ All version files updated
- ✅ CHANGELOG.md contains new entry with feat commit
- ✅ Git tag created and pushed

### Test Scenario 3: Major Version Bump (Breaking Change)

**Objective**: Verify that a breaking change triggers a major version bump

**Steps**:

1. Create a feature branch:
```bash
git checkout -b feat/test-major-bump
```

2. Make a change and commit with breaking change indicator:
```bash
echo "// Breaking change" >> src/extension.ts
git add src/extension.ts
git commit -m "feat!: redesign extension API

BREAKING CHANGE: The extension API has been redesigned. Old commands are no longer supported."
git push origin feat/test-major-bump
```

3. Create and merge a pull request:
```bash
gh pr create --title "Feature: Test Major Bump" --body "Testing major version bump with breaking change"
gh pr merge --squash --delete-branch
```

4. Verify version workflow runs and check results

**Expected Results**:
- ✅ Version workflow runs automatically
- ✅ Major version incremented (e.g., 1.1.0 → 2.0.0)
- ✅ All version files updated
- ✅ CHANGELOG.md contains breaking change notice
- ✅ Git tag created and pushed

### Test Scenario 4: No Version Bump

**Objective**: Verify that non-conventional commits don't trigger version bumps

**Steps**:

1. Create a feature branch:
```bash
git checkout -b docs/update-readme
```

2. Make a documentation change:
```bash
echo "# Updated" >> README.md
git add README.md
git commit -m "update readme with new information"
git push origin docs/update-readme
```

3. Create and merge a pull request:
```bash
gh pr create --title "Docs: Update README" --body "Testing no version bump"
gh pr merge --squash --delete-branch
```

4. Verify version workflow behavior:
   - Workflow should run but skip version bump
   - Workflow summary should indicate "No version bump needed"
   - No new tag created
   - package.json version unchanged

**Expected Results**:
- ✅ Version workflow runs
- ✅ Workflow summary shows "No version bump needed"
- ✅ No changes to package.json
- ✅ No new git tag created
- ✅ Helpful message about conventional commits displayed

### Test Scenario 5: Multiple Commit Types

**Objective**: Verify that the highest priority commit type determines the bump

**Steps**:

1. Create a feature branch with multiple commits:
```bash
git checkout -b multi/test-priority
echo "// Fix 1" >> src/extension.ts
git add src/extension.ts
git commit -m "fix: resolve minor bug"

echo "// Feature 1" >> src/extension.ts
git add src/extension.ts
git commit -m "feat: add new functionality"

echo "// Chore" >> src/extension.ts
git add src/extension.ts
git commit -m "chore: update dependencies"

git push origin multi/test-priority
```

2. Create and merge PR (squash merge will combine commits):
```bash
gh pr create --title "Multi: Test Priority" --body "Testing multiple commit types"
gh pr merge --squash --delete-branch
```

3. Verify version workflow:
   - Should detect the `feat:` commit (highest priority after breaking changes)
   - Should bump minor version

**Expected Results**:
- ✅ Minor version bump (feat: takes priority over fix: and chore:)
- ✅ CHANGELOG.md includes all commit types
- ✅ Proper version tag created

## Changelog Generation

The version workflow automatically generates CHANGELOG.md entries following the [Keep a Changelog](https://keepachangelog.com/) format.

### Changelog Structure

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-01-15

### Added
- New command for spec validation
- Support for custom templates

### Fixed
- Resolve issue with extension activation
- Fix memory leak in file watcher

### Changed
- Update dependencies to latest versions

## [1.0.0] - 2024-01-01

### Added
- Initial release
- Core spec management features
```

### Commit Type Mapping

| Commit Type | Changelog Section |
|-------------|-------------------|
| `feat:` | Added |
| `fix:` | Fixed |
| `chore:`, `refactor:` | Changed |
| `docs:` | Documentation |
| `perf:` | Performance |
| `test:` | Testing |
| `BREAKING CHANGE:` | Breaking Changes (at top) |

## Troubleshooting

### Version Workflow Doesn't Run

**Symptom**: No version workflow triggered after merging to main

**Possible Causes**:
1. Commit message contains `[skip ci]` or `[skip version]`
2. Only markdown or docs files changed
3. Workflow file has syntax errors

**Solution**:
1. Check commit message for skip keywords
2. Verify changes include code files
3. Validate workflow YAML syntax
4. Check GitHub Actions tab for workflow status

### Version Not Bumped

**Symptom**: Workflow runs but version stays the same

**Possible Causes**:
1. No conventional commit messages found
2. Only non-versioning commit types (docs, style)
3. Commit messages don't follow conventional format

**Solution**:
1. Review commit messages in the PR
2. Ensure at least one commit uses conventional format
3. Use `feat:`, `fix:`, or `BREAKING CHANGE:` for version bumps
4. Check workflow summary for analysis details

### Git Push Fails

**Symptom**: Workflow fails at "Commit version changes" or "Create and push tag" step

**Possible Causes**:
1. Insufficient permissions (contents: write not granted)
2. Branch protection rules blocking automated commits
3. Concurrent workflow runs causing conflicts

**Solution**:
1. Verify workflow has `contents: write` permission
2. Configure branch protection to allow github-actions[bot]
3. Check concurrency settings in workflow
4. Review workflow logs for specific error messages

### Changelog Not Generated

**Symptom**: Version bumped but CHANGELOG.md not updated

**Possible Causes**:
1. Changelog generation script error
2. CHANGELOG.md file doesn't exist
3. Script can't parse commit messages

**Solution**:
1. Check workflow logs for script errors
2. Ensure CHANGELOG.md exists in repository root
3. Verify commit messages are properly formatted
4. Run `node scripts/generate-changelog.js` locally to test

### Tag Already Exists

**Symptom**: Workflow fails with "tag already exists" error

**Possible Causes**:
1. Tag was manually created
2. Previous workflow run partially completed
3. Version in package.json not incremented

**Solution**:
1. Delete the existing tag: `git tag -d v1.2.3 && git push origin :refs/tags/v1.2.3`
2. Manually increment version in package.json
3. Re-run the workflow or push a new commit

## Configuration Files

### Version Workflow
- **File**: `.github/workflows/version.yml`
- **Trigger**: Push to `main` branch
- **Node.js**: 18.x
- **Permissions**: `contents: write`
- **Concurrency**: Sequential execution only

### Scripts
- **Version Analysis**: `scripts/analyze-version.js`
- **Changelog Generation**: `scripts/generate-changelog.js`
- **Update Version**: `scripts/update-version.js` (if exists)

## Success Criteria

The staging environment configuration is complete when:

- ✅ Version workflow runs on every merge to main
- ✅ Conventional commits trigger appropriate version bumps
- ✅ package.json and package-lock.json are updated automatically
- ✅ CHANGELOG.md is generated with proper formatting
- ✅ Git tags are created and pushed successfully
- ✅ Workflow summary shows version bump details
- ✅ No version bump occurs for non-conventional commits
- ✅ Workflow handles edge cases (no previous tags, multiple commit types)
- ✅ All test scenarios pass successfully

## Next Steps

After verifying the staging environment configuration:

1. **Configure Production Environment** (Task 9.3):
   - Set up release triggers for deployment
   - Add optional manual approval
   - Configure production secrets (VSCE_PAT)

2. **Implement Environment-Specific Settings** (Task 9.4):
   - Create GitHub environment configurations
   - Set up environment-specific secrets
   - Document environment differences

3. **Test End-to-End Flow**:
   - Merge a feature to main
   - Verify version bump and tag creation
   - Create a GitHub release from the tag
   - Verify deployment workflow triggers

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Actions - Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Actions - Permissions](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

## Monitoring and Metrics

### Key Metrics to Track

- **Version Bump Frequency**: How often versions are bumped
- **Bump Type Distribution**: Ratio of major/minor/patch bumps
- **Workflow Success Rate**: Percentage of successful version workflows
- **Time to Version**: Time from merge to tag creation
- **Changelog Quality**: Completeness and accuracy of changelog entries

### Monitoring Dashboard

Track these metrics in your project dashboard:

1. **Last Version**: Current version number
2. **Last Bump**: Date and type of last version bump
3. **Pending Changes**: Commits since last version
4. **Workflow Status**: Success/failure of recent version workflows
5. **Tag Count**: Total number of version tags

## Best Practices

### Commit Message Guidelines

1. **Use Conventional Commits**: Always use the conventional commit format
2. **Be Descriptive**: Write clear, concise commit messages
3. **One Concern Per Commit**: Each commit should address one issue
4. **Reference Issues**: Include issue numbers when applicable
5. **Breaking Changes**: Clearly document breaking changes in commit body

### Version Management

1. **Review Before Merge**: Check that PR commits follow conventions
2. **Squash Merge**: Use squash merge to create clean commit history
3. **Monitor Workflow**: Check version workflow after each merge
4. **Verify Tags**: Ensure tags are created successfully
5. **Review Changelog**: Periodically review changelog for accuracy

### Troubleshooting Tips

1. **Check Workflow Logs**: Always start with the workflow run logs
2. **Test Locally**: Run scripts locally to reproduce issues
3. **Validate Commits**: Use `git log` to check commit message format
4. **Check Permissions**: Verify GitHub token has required permissions
5. **Review Branch Protection**: Ensure rules allow automated commits
