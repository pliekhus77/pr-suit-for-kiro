# Testing Documentation

## Overview

This directory contains comprehensive testing documentation for the Pragmatic Rhino SUIT extension.

## Documentation Structure

### 📋 [Test Structure and Organization](TEST_STRUCTURE.md)
Learn how tests are organized in the project, including:
- Directory structure and file naming conventions
- Test suite organization (unit, integration, BDD)
- Test data management (fixtures, builders)
- Test isolation strategies
- Code coverage configuration

**Read this if you want to:**
- Understand the project's test organization
- Know where to place new tests
- Learn about test data patterns
- Understand coverage requirements

### 🚀 [Running Tests Guide](RUNNING_TESTS.md)
Comprehensive guide on running different test suites, including:
- Quick start commands
- Running unit tests (Jest)
- Running integration tests (VS Code Extension Test Runner)
- Running BDD tests (Cucumber/Reqnroll)
- Performance testing
- CI/CD integration

**Read this if you want to:**
- Run tests locally
- Run specific test files or suites
- Generate coverage reports
- Debug tests
- Understand CI/CD test execution

### ✍️ [Testing Guidelines for Contributors](CONTRIBUTING_TESTS.md)
Best practices for writing and maintaining tests, including:
- Testing philosophy (TDD, test pyramid)
- When to write tests
- Writing good tests (AAA pattern, naming, assertions)
- Mocking strategies
- Code coverage requirements
- Common patterns and anti-patterns

**Read this if you want to:**
- Write new tests
- Follow testing best practices
- Understand TDD workflow
- Learn mocking techniques
- Improve test quality

### 🔧 [Test Troubleshooting Guide](TROUBLESHOOTING.md)
Solutions for common test failures, including:
- Quick diagnosis checklist
- Common issues and solutions
- Debugging strategies
- Getting help
- Reporting issues

**Read this if you want to:**
- Fix failing tests
- Debug test issues
- Understand error messages
- Report test problems
- Prevent common issues

## Quick Links

### For New Contributors

1. Start with [Test Structure](TEST_STRUCTURE.md) to understand organization
2. Read [Running Tests](RUNNING_TESTS.md) to run tests locally
3. Follow [Contributing Guidelines](CONTRIBUTING_TESTS.md) when writing tests
4. Use [Troubleshooting Guide](TROUBLESHOOTING.md) when tests fail

### For Experienced Contributors

- **Writing tests?** → [Contributing Guidelines](CONTRIBUTING_TESTS.md)
- **Tests failing?** → [Troubleshooting Guide](TROUBLESHOOTING.md)
- **Need to run specific tests?** → [Running Tests](RUNNING_TESTS.md)
- **Understanding coverage?** → [Test Structure](TEST_STRUCTURE.md)

## Test Commands Reference

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run BDD tests
npm run test:bdd

# Run all tests
npm run test:all

# Run CI checks
npm run ci
```

## Test Types

### Unit Tests (60% of suite)
- **Location:** `tests/unit/`
- **Framework:** Jest
- **Purpose:** Test individual components in isolation
- **Speed:** Fast (< 100ms per test)
- **Coverage Target:** 80% minimum

### Integration Tests (30% of suite)
- **Location:** `tests/integration/`
- **Framework:** VS Code Extension Test Runner
- **Purpose:** Test component interactions
- **Speed:** Medium (< 5s per test)
- **Coverage Target:** All commands and workflows

### BDD Tests (10% of suite)
- **Location:** `tests/bdd/`
- **Framework:** Cucumber/Reqnroll
- **Purpose:** Test user-facing behavior
- **Speed:** Slow (< 30s per scenario)
- **Coverage Target:** All acceptance criteria

## Coverage Requirements

| Component | Minimum Coverage |
|-----------|------------------|
| Overall | 80% |
| Critical Paths | 100% |
| Public APIs | 100% |
| Business Logic | 90% |
| Services | 85% |
| Utils | 90% |

## Quality Gates

Before merging to main:
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All BDD scenarios pass
- ✅ Coverage ≥ 80%
- ✅ No critical/high security vulnerabilities
- ✅ No console errors or warnings

## Testing Philosophy

### Test-Driven Development (TDD)

We follow the Red-Green-Refactor cycle:

1. **Red:** Write a failing test
2. **Green:** Write minimal code to make it pass
3. **Refactor:** Improve code quality while keeping tests green

### Test Pyramid

Our test distribution follows the test pyramid:

```
        /\
       /  \      BDD (10%)
      /____\     
     /      \    Integration (30%)
    /________\   
   /          \  Unit (60%)
  /____________\ 
```

- **Many unit tests:** Fast feedback, isolated components
- **Some integration tests:** Component interactions
- **Few BDD tests:** Complete user workflows

### Key Principles

- **Write tests first** (TDD)
- **One assertion per test** (focused tests)
- **Test behavior, not implementation** (black box)
- **Keep tests independent** (no dependencies between tests)
- **Mock external dependencies** (file system, network, VS Code API)
- **Test edge cases and errors** (not just happy path)
- **Maintain high coverage** (80% minimum)

## Common Patterns

### AAA Pattern (Arrange-Act-Assert)

```typescript
it('should install framework', async () => {
  // Arrange: Set up test data and dependencies
  const manager = new FrameworkManager(mockContext, mockFileSystem);
  const frameworkId = 'test-framework';

  // Act: Execute the code under test
  await manager.installFramework(frameworkId);

  // Assert: Verify the expected outcome
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

### Test Data Builders

```typescript
const framework = new FrameworkBuilder()
  .withId('custom-id')
  .withName('Custom Framework')
  .build();
```

### Test Fixtures

```typescript
import validManifest from '../fixtures/manifests/valid-manifest.json';
```

## Getting Help

### Documentation

- Read the relevant guide above
- Check [main TESTING.md](../TESTING.md) for overview
- Review [framework testing strategy](../../.kiro/steering/strategy-tdd-bdd.md)

### Issues

- Search [existing issues](https://github.com/pragmatic-rhino/agentic-reviewer/issues)
- Check [troubleshooting guide](TROUBLESHOOTING.md)
- Open new issue with diagnostic information

### Community

- Open a discussion on GitHub
- Ask in team chat
- Pair with another developer

## Contributing

When contributing tests:

1. **Read** [Contributing Guidelines](CONTRIBUTING_TESTS.md)
2. **Write** tests following TDD
3. **Run** tests locally (`npm test`)
4. **Check** coverage (`npm run test:coverage`)
5. **Submit** PR with tests

## Maintenance

### Regular Tasks

- **Daily:** Run tests before committing
- **Weekly:** Review coverage reports
- **Monthly:** Update dependencies
- **Quarterly:** Review and refactor test suite

### Test Health Metrics

Monitor:
- Test execution time (should be fast)
- Flaky tests (should be zero)
- Coverage trends (should be stable or increasing)
- Test count (should grow with features)

## Resources

### Internal

- [Main Testing Guide](../TESTING.md)
- [TDD/BDD Strategy](../../.kiro/steering/strategy-tdd-bdd.md)
- [Testing Plan Template](../../.kiro/specs/framework-steering-management/testing-plan.md)

### External

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Summary

This testing documentation provides everything you need to:
- ✅ Understand test organization
- ✅ Run tests locally and in CI
- ✅ Write high-quality tests
- ✅ Debug and fix test failures
- ✅ Maintain test suite health

**Start here:** [Test Structure](TEST_STRUCTURE.md) → [Running Tests](RUNNING_TESTS.md) → [Contributing](CONTRIBUTING_TESTS.md)

**Need help?** [Troubleshooting Guide](TROUBLESHOOTING.md)
