# Quality Gates Quick Reference

## Quick Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Run integration tests
npm run test:integration

# Run BDD tests
npm run test:bdd

# Check coverage threshold
npm run coverage:check

# Build extension
npm run package
```

## Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Lines | 80% |
| Branches | 80% |
| Functions | 80% |
| Statements | 80% |

## Quality Gate Checklist

### Before Commit
- [ ] Code compiles (`npm run compile`)
- [ ] Linter passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Coverage ≥ 80% (`npm run test:coverage`)

### Before PR
- [ ] All commits follow convention
- [ ] Branch up to date with target
- [ ] All tests pass in CI
- [ ] Coverage meets threshold
- [ ] No security vulnerabilities
- [ ] Documentation updated

### Before Merge
- [ ] At least 1 approval
- [ ] All conversations resolved
- [ ] CI checks passing
- [ ] Coverage ≥ 80%
- [ ] No merge conflicts

## Common Issues

### Pre-commit hook fails
```bash
# Fix linting issues
npm run lint -- --fix

# Run tests to see failures
npm test

# Bypass hook (emergency only)
git commit --no-verify
```

### Coverage below threshold
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Add tests for uncovered code
# Then commit and push
```

### CI tests fail
1. Check GitHub Actions logs
2. Run same tests locally
3. Fix issues
4. Push new commit

## Notification Channels

- **GitHub Issues:** Auto-created for test failures
- **Slack:** #ci-alerts (if configured)
- **Email:** GitHub notifications

## Emergency Procedures

### Bypass pre-commit hook
```bash
git commit --no-verify -m "Emergency fix"
```

### Bypass branch protection
1. Temporarily disable in Settings → Branches
2. Merge critical fix
3. Re-enable immediately
4. Document in post-incident review

## Support

- Documentation: `docs/QUALITY_GATES.md`
- Branch Protection: `.github/BRANCH_PROTECTION.md`
- Issues: Create with `quality-gate` label
