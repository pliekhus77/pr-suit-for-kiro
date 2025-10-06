# Code Coverage Documentation

## Overview

This project maintains a minimum code coverage threshold of **80%** across all metrics (branches, functions, lines, and statements). Coverage is measured using Jest with Istanbul/nyc for comprehensive reporting.

## Coverage Requirements

### Global Thresholds

| Metric | Minimum | Target | Critical Paths |
|--------|---------|--------|----------------|
| **Branches** | 80% | 85% | 100% |
| **Functions** | 80% | 85% | 100% |
| **Lines** | 80% | 85% | 100% |
| **Statements** | 80% | 85% | 100% |

### Component-Specific Targets

| Component | Target Coverage | Notes |
|-----------|----------------|-------|
| **FileSystemOperations** | 90% | Critical infrastructure |
| **FrameworkManager** | 90% | Core business logic |
| **SteeringValidator** | 85% | Validation logic |
| **TemplateEngine** | 80% | Template processing |
| **Commands** | 80% | User-facing commands |
| **Providers** | 80% | Tree view and UI |

## Running Coverage Reports

### Local Development

```bash
# Run tests with coverage
npm run test:coverage

# Watch mode with coverage
npm run test:coverage:watch

# Generate coverage report
npm run coverage:report

# Check coverage thresholds
npm run coverage:check
```

### CI/CD Pipeline

Coverage is automatically checked in the CI/CD pipeline:

```bash
# CI-optimized coverage run
npm run test:coverage:ci
```

The pipeline will fail if coverage falls below 80% on any metric.

## Coverage Reports

### Report Formats

The following coverage report formats are generated:

1. **Text Summary** - Console output for quick review
2. **HTML Report** - Interactive browser-based report (`coverage/index.html`)
3. **LCOV** - Standard format for CI/CD integration (`coverage/lcov.info`)
4. **JSON** - Machine-readable format (`coverage/coverage-final.json`)
5. **JSON Summary** - Aggregated metrics (`coverage/coverage-summary.json`)
6. **Cobertura** - XML format for Azure DevOps (`coverage/cobertura-coverage.xml`)

### Viewing Reports Locally

```bash
# Generate and open HTML report
npm run test:coverage
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### Coverage Badges

Coverage badges are displayed in the README:

- **Coveralls**: Real-time coverage from CI/CD
- **Codecov**: Detailed coverage analysis and trends
- **Static Badge**: Minimum threshold indicator

## CI/CD Integration

### GitHub Actions

The `.github/workflows/test-coverage.yml` workflow:

1. Runs tests with coverage on every push and PR
2. Checks coverage thresholds (fails if below 80%)
3. Uploads coverage to Codecov and Coveralls
4. Archives coverage reports as artifacts (30-day retention)
5. Comments coverage summary on pull requests

### Coverage Services

#### Codecov

- **Dashboard**: https://codecov.io/gh/pliekhus77/pr-suit-for-kiro
- **Features**: 
  - Line-by-line coverage visualization
  - Coverage trends over time
  - Pull request coverage diff
  - Sunburst and tree visualizations

#### Coveralls

- **Dashboard**: https://coveralls.io/github/pliekhus77/pr-suit-for-kiro
- **Features**:
  - Historical coverage tracking
  - Branch comparison
  - File-level coverage details
  - Build status integration

## Excluded from Coverage

The following files/directories are excluded from coverage:

- `src/**/*.d.ts` - TypeScript declaration files
- `src/**/__tests__/**` - Test files themselves
- `src/**/__mocks__/**` - Mock implementations
- `src/test/**` - VS Code extension test infrastructure
- `**/*.test.ts` - Test files
- `**/*.spec.ts` - Spec files

## Coverage Best Practices

### Writing Testable Code

1. **Single Responsibility**: Each function should do one thing
2. **Dependency Injection**: Use constructor injection for dependencies
3. **Pure Functions**: Prefer pure functions over stateful code
4. **Small Functions**: Keep functions small and focused
5. **Avoid Side Effects**: Minimize side effects in business logic

### Achieving High Coverage

1. **Test Happy Paths**: Cover primary use cases first
2. **Test Error Paths**: Cover all error conditions
3. **Test Edge Cases**: Cover boundary conditions
4. **Test State Transitions**: Cover all state changes
5. **Test Integration Points**: Cover external dependencies

### Coverage Anti-Patterns

❌ **Don't**: Write tests just to increase coverage  
✅ **Do**: Write meaningful tests that validate behavior

❌ **Don't**: Exclude code from coverage to meet thresholds  
✅ **Do**: Refactor untestable code to make it testable

❌ **Don't**: Focus only on line coverage  
✅ **Do**: Ensure branch coverage is also high

❌ **Don't**: Test implementation details  
✅ **Do**: Test public APIs and behavior

## Critical Path Coverage

The following components require 100% coverage:

### Framework Installation Flow
- `FrameworkManager.installFramework()`
- `FrameworkManager.isFrameworkInstalled()`
- Conflict detection and resolution

### Update Detection and Application
- `FrameworkManager.checkForUpdates()`
- `FrameworkManager.updateFramework()`
- Customization detection

### Workspace Initialization
- `WorkspaceCommands.initializeWorkspace()`
- Directory structure creation
- Recommended framework installation

### Validation Logic
- `SteeringValidator.validate()`
- `SteeringValidator.validateStructure()`
- `SteeringValidator.validateContent()`

## Monitoring Coverage Trends

### Weekly Review

Review coverage trends weekly:

1. Check Codecov dashboard for trends
2. Identify files with declining coverage
3. Review uncovered lines in critical paths
4. Plan coverage improvement tasks

### Pull Request Reviews

Every PR must:

1. Maintain or improve overall coverage
2. Include tests for new functionality
3. Not decrease coverage of existing code
4. Pass all coverage threshold checks

### Coverage Debt

If coverage falls below target:

1. Create GitHub issue with "coverage-debt" label
2. Prioritize in next sprint
3. Add tests to bring coverage back to target
4. Update this document with lessons learned

## Troubleshooting

### Coverage Not Generated

**Problem**: No coverage report after running tests

**Solution**:
```bash
# Clean coverage directory
rm -rf coverage .nyc_output

# Run tests with coverage
npm run test:coverage
```

### Coverage Threshold Failures

**Problem**: Tests pass but coverage check fails

**Solution**:
1. Review coverage report: `open coverage/index.html`
2. Identify uncovered lines
3. Add tests for uncovered code
4. Re-run coverage check

### Coverage Upload Failures

**Problem**: Coverage not uploading to Codecov/Coveralls

**Solution**:
1. Check GitHub Actions logs
2. Verify `CODECOV_TOKEN` secret is set
3. Verify `GITHUB_TOKEN` has correct permissions
4. Check network connectivity in CI

## Configuration Files

### Jest Configuration (`jest.config.js`)

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

### NYC Configuration (`.nycrc.json`)

```json
{
  "branches": 80,
  "lines": 80,
  "functions": 80,
  "statements": 80
}
```

## Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [Istanbul Documentation](https://istanbul.js.org/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Coveralls Documentation](https://docs.coveralls.io/)

## Changelog

### 2025-01-15
- Initial coverage configuration
- Set 80% minimum threshold
- Integrated Codecov and Coveralls
- Added coverage badges to README
- Created CI/CD workflow for coverage

