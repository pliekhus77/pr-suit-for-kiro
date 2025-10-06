# Development Environment Configuration

## Overview

The development environment is configured to provide fast feedback to developers on every commit to any branch. This document describes the configuration and how to test it.

## Configuration Summary

### Branch-Based Triggers ✅

**Build Workflow** (`.github/workflows/build.yml`):
- **Trigger**: Push to any branch (`branches: - '**'`)
- **Purpose**: Fast feedback on code quality
- **Runs on**: Every commit to any branch
- **Includes**: Compilation, linting, tests, coverage

**PR Quality Gates** (`.github/workflows/pr-quality-gates.yml`):
- **Trigger**: Pull request events (opened, synchronize, reopened)
- **Target branches**: `main`, `develop`
- **Purpose**: Quality validation before merge
- **Includes**: All build checks + security scan + version validation

**Test Coverage** (`.github/workflows/test-coverage.yml`):
- **Trigger**: Push to `main` or `develop`, PRs to these branches
- **Purpose**: Comprehensive coverage reporting
- **Matrix**: Node.js 18.x and 20.x
- **Integrations**: Codecov, Coveralls

### Artifact Retention ✅

All development artifacts are configured with appropriate retention periods:

| Artifact Type | Retention Period | Workflow |
|---------------|------------------|----------|
| Test Results | 30 days | `build.yml`, `pr-quality-gates.yml` |
| Coverage Reports | 30 days | `build.yml`, `pr-quality-gates.yml`, `test-coverage.yml` |
| Security Scan Results | 30 days | `pr-quality-gates.yml` |

**Artifact Naming Convention**:
- Build workflow: `test-results`, `coverage-reports`
- PR workflow: `pr-test-results-{PR_NUMBER}`, `pr-coverage-reports-{PR_NUMBER}`, `pr-security-scan-{PR_NUMBER}`
- Coverage workflow: `coverage-report-{NODE_VERSION}`

### Quality Gates ✅

The following quality gates are enforced in the development environment:

1. **TypeScript Compilation**: Must compile without errors
2. **ESLint**: Must pass with no errors (warnings allowed)
3. **Unit Tests**: All tests must pass
4. **Code Coverage**: Minimum 80% coverage required (lines, statements, functions, branches)
5. **Security Scan** (PR only): No critical or high severity vulnerabilities
6. **Version Validation** (PR only): Valid semantic version format

## Testing on Feature Branches

### Step 1: Create a Feature Branch

```bash
git checkout -b feature/test-dev-environment
```

### Step 2: Make a Change

Create or modify a file to trigger the build:

```bash
echo "// Test change" >> src/extension.ts
git add src/extension.ts
git commit -m "test: verify development environment configuration"
git push origin feature/test-dev-environment
```

### Step 3: Verify Build Workflow Runs

1. Go to GitHub Actions tab
2. Find the "Build and Test" workflow run
3. Verify it runs automatically on push
4. Check that all steps complete successfully:
   - ✅ Checkout code
   - ✅ Setup Node.js 18.x
   - ✅ Install dependencies
   - ✅ Compile TypeScript
   - ✅ Run ESLint
   - ✅ Run tests with coverage
   - ✅ Check coverage threshold
   - ✅ Upload test results
   - ✅ Upload coverage reports
   - ✅ Generate build status summary

### Step 4: Create a Pull Request

```bash
# Create PR from feature branch to main
gh pr create --title "Test: Development Environment" --body "Testing dev environment configuration"
```

### Step 5: Verify PR Quality Gates

1. Go to the pull request page
2. Verify "PR Quality Gates" workflow runs automatically
3. Check that all quality checks pass:
   - ✅ TypeScript Compilation
   - ✅ ESLint
   - ✅ Unit Tests
   - ✅ Security Scan
   - ✅ Code Coverage (≥80%)
   - ✅ Version Validation
4. Verify PR status comment is posted with results
5. Verify merge is blocked if any check fails

### Step 6: Verify Artifacts

1. Go to the workflow run page
2. Check "Artifacts" section at the bottom
3. Verify the following artifacts are available:
   - `test-results` (from build workflow)
   - `coverage-reports` (from build workflow)
   - `pr-test-results-{PR_NUMBER}` (from PR workflow)
   - `pr-coverage-reports-{PR_NUMBER}` (from PR workflow)
   - `pr-security-scan-{PR_NUMBER}` (from PR workflow)
4. Download and inspect artifacts to verify content

## Expected Behavior

### On Every Commit to Any Branch

- Build workflow triggers automatically
- Runs in ~3-5 minutes
- Provides fast feedback on code quality
- Uploads artifacts with 30-day retention
- Sends notification on failure

### On Pull Request Events

- PR quality gates workflow triggers automatically
- Runs all build checks plus additional validations
- Posts status comment on PR with detailed results
- Blocks merge if any check fails
- Updates comment on each new commit

### On Push to Main or Develop

- Test coverage workflow triggers automatically
- Runs tests on multiple Node.js versions (18.x, 20.x)
- Uploads coverage to Codecov and Coveralls
- Archives coverage reports as artifacts

## Troubleshooting

### Build Fails on Feature Branch

**Symptom**: Build workflow fails with compilation or test errors

**Solution**:
1. Review the workflow logs for specific error messages
2. Run `npm run compile` locally to check for TypeScript errors
3. Run `npm run lint` locally to check for linting errors
4. Run `npm test` locally to check for test failures
5. Fix issues and push again

### Coverage Below 80%

**Symptom**: Build fails with "Coverage threshold not met" error

**Solution**:
1. Review the coverage report in the workflow summary
2. Identify uncovered files and functions
3. Add tests to increase coverage
4. Run `npm test -- --coverage` locally to verify
5. Push changes once coverage is above 80%

### PR Quality Gates Fail

**Symptom**: PR is blocked from merging due to failed quality checks

**Solution**:
1. Review the PR status comment for specific failures
2. Click on the workflow run link for detailed logs
3. Fix the issues identified (compilation, linting, tests, security, version)
4. Push fixes to the PR branch
5. Wait for quality gates to re-run and pass

### Security Vulnerabilities Detected

**Symptom**: PR quality gates fail with "Critical or high severity vulnerabilities detected"

**Solution**:
1. Review the vulnerability details in the workflow summary
2. Run `npm audit` locally to see the full report
3. Run `npm audit fix` to automatically fix vulnerabilities
4. If automatic fix doesn't work, manually update vulnerable dependencies
5. Push the fixes and verify the security scan passes

### Version Validation Fails

**Symptom**: PR quality gates fail with "Invalid version format" or "Version not incremented"

**Solution**:
1. Check `package.json` version follows semantic versioning (e.g., `1.2.3`)
2. Ensure version is incremented from the base branch
3. Update version if needed: `npm version patch` (or `minor` or `major`)
4. Commit and push the version change

## Configuration Files

### Build Workflow
- **File**: `.github/workflows/build.yml`
- **Triggers**: Push to any branch, pull request events
- **Node.js**: 18.x
- **Artifact Retention**: 30 days

### PR Quality Gates Workflow
- **File**: `.github/workflows/pr-quality-gates.yml`
- **Triggers**: PR opened, synchronized, reopened
- **Target Branches**: `main`, `develop`
- **Additional Checks**: Security scan, version validation
- **Artifact Retention**: 30 days

### Test Coverage Workflow
- **File**: `.github/workflows/test-coverage.yml`
- **Triggers**: Push to `main` or `develop`, PRs to these branches
- **Node.js Matrix**: 18.x, 20.x
- **Integrations**: Codecov, Coveralls
- **Artifact Retention**: 30 days

## Success Criteria

The development environment configuration is complete when:

- ✅ Build workflow runs on every commit to any branch
- ✅ PR quality gates run on every PR event
- ✅ Test coverage workflow runs on main/develop branches
- ✅ All quality gates enforce 80% coverage threshold
- ✅ Artifacts are uploaded with 30-day retention
- ✅ PR status comments are posted with detailed results
- ✅ Merge is blocked when quality gates fail
- ✅ Notifications are sent on build failures
- ✅ Feature branch testing confirms all workflows work correctly

## Next Steps

After verifying the development environment configuration:

1. **Configure Staging Environment** (Task 9.2):
   - Set up main branch triggers for version workflow
   - Test version bumping on merge to main
   - Verify changelog generation

2. **Configure Production Environment** (Task 9.3):
   - Set up release triggers for deployment
   - Add optional manual approval
   - Configure production secrets

3. **Implement Environment-Specific Settings** (Task 9.4):
   - Create GitHub environment configurations
   - Set up environment-specific secrets
   - Document environment differences

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Artifact Retention](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
