# Branch Protection Rules

This document describes the required branch protection rules for the repository to enforce quality gates.

## Main Branch Protection

The `main` branch should have the following protection rules enabled:

### Required Status Checks
- [x] Require status checks to pass before merging
- [x] Require branches to be up to date before merging

**Required checks:**
- `test-coverage / test-coverage (18.x)` - Tests and coverage on Node 18
- `test-coverage / test-coverage (20.x)` - Tests and coverage on Node 20

### Pull Request Requirements
- [x] Require a pull request before merging
- [x] Require approvals: **1** (minimum)
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners (if CODEOWNERS file exists)

### Additional Restrictions
- [x] Require conversation resolution before merging
- [x] Require signed commits (recommended)
- [x] Include administrators (apply rules to admins too)
- [x] Restrict who can push to matching branches (optional)

### Status Check Details

The following checks must pass:
1. **Linting** - Code must pass ESLint checks
2. **Unit Tests** - All unit tests must pass
3. **Coverage Threshold** - Minimum 80% code coverage required
4. **Coverage Enforcement** - Explicit check that coverage meets 80%

## Develop Branch Protection (if using)

If using a `develop` branch, apply similar rules:
- Require status checks to pass
- Require 1 approval
- Require conversation resolution

## Setting Up Branch Protection

### Via GitHub UI:
1. Go to repository **Settings** → **Branches**
2. Click **Add rule** or edit existing rule
3. Enter branch name pattern: `main`
4. Enable the checkboxes listed above
5. Select required status checks from the list
6. Click **Create** or **Save changes**

### Via GitHub CLI:
```bash
# Protect main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test-coverage / test-coverage (18.x)","test-coverage / test-coverage (20.x)"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## Coverage Requirements

### Global Thresholds (jest.config.js)
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

### Enforcement Points
1. **Pre-commit hook** - Runs tests before allowing commit
2. **CI/CD Pipeline** - Fails build if coverage < 80%
3. **PR Status Check** - Blocks merge if coverage < 80%
4. **Coverage Report** - Posted as PR comment for visibility

## Bypassing Protection (Emergency Only)

In rare emergency situations, administrators can:
1. Temporarily disable branch protection
2. Merge critical hotfix
3. Re-enable branch protection immediately
4. Create follow-up issue to add missing tests

**Note:** All bypasses must be documented in a post-incident review.

## Monitoring Compliance

### Weekly Review
- Check for any protection rule bypasses
- Review coverage trends
- Identify areas needing test improvement

### Quarterly Audit
- Verify all protection rules are active
- Review and update required checks
- Assess if thresholds should be increased

## Troubleshooting

### "Required status check is not passing"
- Check the Actions tab for failure details
- Review test output and coverage report
- Fix failing tests or add missing coverage
- Push new commit to trigger re-check

### "Coverage below threshold"
- Run `npm run test:coverage` locally
- Review coverage report in `coverage/index.html`
- Add tests for uncovered code paths
- Ensure new code has adequate tests

### "Stale approval"
- New commits invalidate previous approvals
- Request re-approval from reviewer
- Ensure all feedback is addressed

## Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Status Checks Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#coveragethreshold-object)
