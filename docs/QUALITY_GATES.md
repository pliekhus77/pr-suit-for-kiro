# Quality Gates Documentation

This document describes the quality gates implemented in the project to ensure code quality, test coverage, and overall project health.

## Overview

Quality gates are automated checks that must pass before code can be merged into protected branches. They enforce standards for code quality, test coverage, security, and build integrity.

## Quality Gate Levels

### Level 1: Pre-Commit (Local)
**Trigger:** Before each commit  
**Tool:** Husky pre-commit hooks  
**Duration:** ~30 seconds

**Checks:**
- ✅ ESLint code quality checks
- ✅ Unit tests execution
- ✅ TypeScript compilation

**Configuration:** `.husky/pre-commit`

**Bypass:** Not recommended. Use `git commit --no-verify` only in emergencies.

### Level 2: Continuous Integration (CI)
**Trigger:** On push to any branch  
**Tool:** GitHub Actions  
**Duration:** ~5-10 minutes

**Checks:**
- ✅ Linting (ESLint)
- ✅ TypeScript compilation
- ✅ Unit tests (Node 18.x and 20.x)
- ✅ Code coverage ≥ 80%
- ✅ Integration tests
- ✅ BDD acceptance tests
- ✅ Security scanning
- ✅ Build verification

**Configuration:** `.github/workflows/ci.yml`

### Level 3: Pull Request (PR)
**Trigger:** When PR is opened or updated  
**Tool:** GitHub Branch Protection + Actions  
**Duration:** ~5-10 minutes

**Checks:**
- ✅ All CI checks must pass
- ✅ Code coverage ≥ 80% enforced
- ✅ At least 1 approval required
- ✅ All conversations resolved
- ✅ Branch up to date with target

**Configuration:** `.github/BRANCH_PROTECTION.md`

### Level 4: Post-Merge Monitoring
**Trigger:** After merge to main/develop  
**Tool:** GitHub Actions + Notifications  
**Duration:** Continuous

**Checks:**
- ✅ Test failure notifications
- ✅ Coverage trend monitoring
- ✅ Security vulnerability alerts
- ✅ Performance regression detection

**Configuration:** `.github/workflows/test-failure-notification.yml`

## Coverage Requirements

### Global Thresholds
All code must meet these minimum coverage thresholds:

| Metric | Minimum | Target | Excellent |
|--------|---------|--------|-----------|
| Lines | 80% | 85% | 90%+ |
| Branches | 80% | 85% | 90%+ |
| Functions | 80% | 85% | 90%+ |
| Statements | 80% | 85% | 90%+ |

### Critical Path Coverage
Code in critical paths must have 100% coverage:
- Authentication and authorization logic
- Data validation and sanitization
- Security-related functions
- Payment processing (if applicable)
- Data persistence operations

### Exclusions
The following are excluded from coverage requirements:
- Type definitions (*.d.ts)
- Test files (*.test.ts, *.spec.ts)
- Mock implementations (__mocks__/)
- VS Code test runner (src/test/)
- Generated code

**Configuration:** `jest.config.js`, `.nycrc.json`

## Test Execution Strategy

### Test Pyramid
Our test distribution follows the test pyramid:

```
        /\
       /  \  10% - BDD/E2E Tests
      /____\
     /      \  30% - Integration Tests
    /________\
   /          \  60% - Unit Tests
  /____________\
```

### Test Types

#### Unit Tests (60%)
- **Purpose:** Test individual components in isolation
- **Speed:** Fast (<100ms per test)
- **Tool:** Jest
- **Location:** `src/**/__tests__/**/*.test.ts`
- **Run:** `npm run test`

#### Integration Tests (30%)
- **Purpose:** Test component interactions
- **Speed:** Medium (100ms-1s per test)
- **Tool:** VS Code Extension Test Runner
- **Location:** `src/test/`
- **Run:** `npm run test:integration`

#### BDD Acceptance Tests (10%)
- **Purpose:** Test user-facing behavior
- **Speed:** Slow (1s-10s per test)
- **Tool:** Cucumber + Playwright
- **Location:** `tests/bdd/`
- **Run:** `npm run test:bdd`

## Enforcement Mechanisms

### 1. Pre-Commit Hook
**File:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged for code quality checks
npx lint-staged

# Run unit tests to ensure nothing is broken
echo "Running unit tests..."
npm run test -- --passWithNoTests --bail

# Check if tests passed
if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed. Please fix the tests before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
```

**What it does:**
- Runs ESLint on staged TypeScript files
- Executes all unit tests
- Blocks commit if any check fails

**How to bypass (emergency only):**
```bash
git commit --no-verify -m "Emergency fix"
```

### 2. CI Pipeline
**File:** `.github/workflows/ci.yml`

**Jobs:**
1. **Lint** - ESLint + TypeScript compilation
2. **Unit Tests** - Jest with coverage (Node 18.x, 20.x)
3. **Integration Tests** - VS Code extension tests
4. **BDD Tests** - Cucumber scenarios
5. **Security Scan** - npm audit + Snyk
6. **Build** - Webpack production build
7. **Quality Gate** - Summary of all checks

**Failure handling:**
- Failed jobs block PR merge
- Notifications sent to issue tracker
- Coverage reports posted to PR

### 3. Branch Protection
**File:** `.github/BRANCH_PROTECTION.md`

**Rules for `main` branch:**
- Require PR before merge
- Require 1 approval
- Require status checks to pass:
  - `test-coverage / test-coverage (18.x)`
  - `test-coverage / test-coverage (20.x)`
- Require conversations resolved
- Require branch up to date
- Enforce for administrators

**Setup instructions:** See `.github/BRANCH_PROTECTION.md`

### 4. Coverage Enforcement
**File:** `.github/workflows/test-coverage.yml`

**Enforcement steps:**
1. Run Jest with coverage
2. Check coverage thresholds (jest.config.js)
3. Explicit 80% check using coverage-summary.json
4. Upload coverage to Codecov/Coveralls
5. Post coverage report to PR

**Failure conditions:**
- Any metric below 80%
- Coverage decreased from previous commit
- Critical paths not fully covered

## Notifications

### Test Failure Notifications
**File:** `.github/workflows/test-failure-notification.yml`

**When tests fail:**
1. GitHub Issue created automatically
   - Title: "🔴 Test Failure: [Workflow] on [Branch]"
   - Assigned to: Person who triggered the workflow
   - Labels: `test-failure`, `automated`, `priority-high`
   - Body: Workflow details, commit info, action items

2. Slack notification sent (if configured)
   - Channel: #ci-alerts (or configured channel)
   - Message: Test failure details with link to workflow run

**When tests pass again:**
- Related GitHub issues automatically closed
- Comment added: "✅ Tests are now passing"

### Setting up Slack notifications:
1. Create Slack webhook URL
2. Add to repository secrets: `SLACK_WEBHOOK_URL`
3. Notifications will be sent automatically

## Monitoring and Metrics

### Coverage Trends
- Track coverage over time
- Alert on coverage decrease
- Identify areas needing improvement

**View reports:**
- Local: `coverage/index.html`
- CI: Artifacts in GitHub Actions
- Online: Codecov dashboard

### DORA Metrics
Track these metrics for continuous improvement:

| Metric | Current | Target |
|--------|---------|--------|
| Deployment Frequency | - | Daily |
| Lead Time for Changes | - | <1 day |
| Mean Time to Recovery | - | <1 hour |
| Change Failure Rate | - | <15% |

### Test Health Metrics
- Test execution time
- Flaky test rate
- Test coverage trend
- Test failure rate

## Troubleshooting

### Pre-commit hook not running
```bash
# Reinstall husky
npm run prepare

# Make hook executable (Unix/Mac)
chmod +x .husky/pre-commit
```

### Coverage below threshold locally
```bash
# Run coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html  # Mac
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux

# Identify uncovered lines and add tests
```

### CI tests passing locally but failing in CI
- Check Node.js version matches CI (18.x or 20.x)
- Ensure all dependencies are in package.json
- Check for environment-specific issues
- Review CI logs for specific errors

### PR blocked by coverage check
1. Run `npm run test:coverage` locally
2. Review coverage report
3. Add tests for uncovered code
4. Push changes to trigger re-check

### False positive in security scan
1. Review vulnerability details
2. Check if it affects production code
3. If false positive, add to ignore list
4. Document decision in PR

## Best Practices

### Writing Tests
- Write tests before code (TDD)
- One assertion per test (when possible)
- Use descriptive test names
- Test happy path, error cases, and edge cases
- Mock external dependencies

### Maintaining Coverage
- Add tests for new code immediately
- Don't decrease coverage with new PRs
- Refactor tests as code evolves
- Remove tests for deleted code

### Handling Failures
- Fix broken tests immediately
- Don't disable tests to make CI pass
- Investigate flaky tests and fix root cause
- Use `skip` temporarily, create issue to fix

### Code Review
- Verify tests are comprehensive
- Check coverage report in PR
- Ensure tests are maintainable
- Look for missing edge cases

## Configuration Files

| File | Purpose |
|------|---------|
| `.husky/pre-commit` | Pre-commit hook script |
| `package.json` | npm scripts and lint-staged config |
| `jest.config.js` | Jest test runner and coverage config |
| `.nycrc.json` | NYC coverage tool config |
| `.github/workflows/ci.yml` | Main CI pipeline |
| `.github/workflows/test-coverage.yml` | Coverage-focused workflow |
| `.github/workflows/test-failure-notification.yml` | Notification workflow |
| `.github/BRANCH_PROTECTION.md` | Branch protection setup guide |
| `.github/pull_request_template.md` | PR template with checklist |

## Continuous Improvement

### Monthly Review
- Review coverage trends
- Identify slow tests
- Update thresholds if needed
- Refactor flaky tests

### Quarterly Goals
- Increase coverage target
- Reduce test execution time
- Improve test quality
- Update tooling

## Support

For questions or issues with quality gates:
1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Check existing issues for similar problems
4. Create new issue with `quality-gate` label

## References

- [Jest Documentation](https://jestjs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
