# Running Tests Guide

## Overview

This guide explains how to run different test suites in the Pragmatic Rhino SUIT extension project.

## Prerequisites

### Required Software

- **Node.js:** 18.x or higher
- **npm:** 9.x or higher
- **VS Code:** 1.85.0 or higher

### Installation

```bash
# Clone repository
git clone https://github.com/pragmatic-rhino/agentic-reviewer.git
cd agentic-reviewer

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

## Quick Start

```bash
# Run all unit tests
npm test

# Run all tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run specific test file
npm test -- framework-manager.test.ts

# Run tests in watch mode
npm run test:watch
```

## Unit Tests (Jest)

### Run All Unit Tests

```bash
npm test
```

This runs all tests in the `tests/unit/` directory using Jest.

### Run Specific Test File

```bash
# By file name
npm test -- framework-manager.test.ts

# By path
npm test -- tests/unit/services/framework-manager.test.ts
```

### Run Tests Matching Pattern

```bash
# Run all tests with "install" in the name
npm test -- --testNamePattern="install"

# Run all tests in services directory
npm test -- tests/unit/services/
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

Watch mode automatically re-runs tests when files change. Useful during development.

**Watch Mode Commands:**
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename pattern
- `t` - Filter by test name pattern
- `q` - Quit watch mode

### Run Tests with Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
# Windows
start coverage/lcov-report/index.html

# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

### Run Tests in Debug Mode

**VS Code:**
1. Open test file
2. Set breakpoint
3. Press `F5` or click "Run and Debug"
4. Select "Jest: Current File"

**Command Line:**
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then attach debugger from VS Code or Chrome DevTools.

## Integration Tests (VS Code Extension Test Runner)

### Run All Integration Tests

```bash
npm run test:integration
```

This launches VS Code Extension Development Host and runs tests in `tests/integration/`.

### Run Specific Integration Test

```bash
npm run test:integration -- --grep "Framework Installation"
```

### Run Integration Tests in Debug Mode

**VS Code:**
1. Open `Run and Debug` panel (`Ctrl+Shift+D`)
2. Select "Extension Tests" configuration
3. Press `F5`

This launches Extension Development Host with debugger attached.

### Integration Test Environment

Integration tests run in a real VS Code instance with:
- Extension loaded and activated
- Real file system access
- Real VS Code API
- Temporary test workspaces

**Test Workspace Location:**
```
{temp-dir}/vscode-test-workspace-{random}/
```

Workspaces are automatically cleaned up after tests.

## BDD Tests (Cucumber/Reqnroll)

### Run All BDD Tests

```bash
npm run test:bdd
```

### Run Specific Feature

```bash
npm run test:bdd -- tests/bdd/features/framework-installation.feature
```

### Run Specific Scenario

```bash
npm run test:bdd -- --name "Install framework successfully"
```

### BDD Test Reports

BDD tests generate reports in `test-results/bdd/`:

```
test-results/bdd/
├── cucumber-report.html    # HTML report
├── cucumber-report.json    # JSON report
└── screenshots/            # Screenshots on failure
```

## Performance Tests

### Run Performance Tests

```bash
npm run test:performance
```

Performance tests measure:
- Extension activation time (< 500ms)
- Framework installation time (< 1s)
- Tree view refresh time (< 200ms)
- Validation execution time (< 500ms)

### Performance Test Output

```
Performance Test Results:
✓ Extension activation: 342ms (target: < 500ms)
✓ Framework installation: 876ms (target: < 1s)
✓ Tree view refresh: 145ms (target: < 200ms)
✓ Validation execution: 423ms (target: < 500ms)
```

## Test Suites

### Run Specific Test Suite

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# BDD tests only
npm run test:bdd

# Performance tests only
npm run test:performance
```

### Run All Tests

```bash
npm run test:all
```

This runs all test suites in sequence:
1. Unit tests
2. Integration tests
3. BDD tests
4. Performance tests

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Every push to any branch
- Every pull request
- Scheduled nightly builds

**Workflow:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - run: npm install
      - run: npm run compile
      - run: npm test
      - run: npm run test:integration
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Local CI Simulation

Run the same checks as CI locally:

```bash
# Run all checks
npm run ci

# This runs:
# 1. Linting
# 2. Type checking
# 3. Unit tests
# 4. Integration tests
# 5. Coverage check
```

## Test Configuration

### Jest Configuration

Configuration in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### VS Code Test Configuration

Configuration in `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/tests/integration"
      ],
      "outFiles": ["${workspaceFolder}/out/**/*.js"]
    }
  ]
}
```

## Test Output

### Console Output

```
PASS tests/unit/services/framework-manager.test.ts
  FrameworkManager
    listAvailableFrameworks
      ✓ should return all frameworks from manifest (5ms)
      ✓ should handle corrupted manifest gracefully (3ms)
    installFramework
      ✓ should install framework to .kiro/steering/ (8ms)
      ✓ should throw error if framework not found (2ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.345s
```

### Coverage Output

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   85.23 |    82.14 |   87.50 |   85.23 |
 services           |   90.12 |    88.23 |   92.30 |   90.12 |
  framework-manager |   92.45 |    90.12 |   95.00 |   92.45 | 45-48,67
  steering-validator|   88.76 |    86.54 |   90.00 |   88.76 | 23-25,89-92
 utils              |   95.67 |    93.45 |   96.00 |   95.67 |
  file-system       |   95.67 |    93.45 |   96.00 |   95.67 | 12-14
--------------------|---------|----------|---------|---------|-------------------
```

## Troubleshooting

### Tests Fail to Run

**Problem:** `npm test` fails with "Cannot find module"

**Solution:**
```bash
# Recompile TypeScript
npm run compile

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Integration Tests Timeout

**Problem:** Integration tests timeout after 30 seconds

**Solution:**
```bash
# Increase timeout in test file
test('should install framework', async function() {
  this.timeout(60000); // 60 seconds
  // Test code
});
```

### Coverage Below Threshold

**Problem:** Coverage check fails with "Coverage for X (Y%) does not meet threshold (80%)"

**Solution:**
1. Identify uncovered code in coverage report
2. Add tests for uncovered code
3. Run coverage again

```bash
# View detailed coverage
npm run test:coverage
open coverage/lcov-report/index.html
```

### VS Code Extension Tests Fail

**Problem:** Extension tests fail with "Extension host terminated unexpectedly"

**Solution:**
1. Close all VS Code instances
2. Delete `.vscode-test` directory
3. Run tests again

```bash
rm -rf .vscode-test
npm run test:integration
```

### Watch Mode Not Working

**Problem:** Watch mode doesn't detect file changes

**Solution:**
```bash
# Increase file watcher limit (Linux/macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or use polling
npm test -- --watch --watchAll
```

## Performance Tips

### Speed Up Unit Tests

```bash
# Run tests in parallel (default)
npm test

# Run tests in band (sequential, slower but more stable)
npm test -- --runInBand

# Run only changed tests
npm test -- --onlyChanged

# Skip coverage collection
npm test -- --coverage=false
```

### Speed Up Integration Tests

```bash
# Run specific test file
npm run test:integration -- --grep "Framework Installation"

# Skip slow tests during development
test.skip('slow test', async () => {
  // Test code
});
```

## Test Data

### Using Test Fixtures

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const manifest = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/manifests/valid-manifest.json'), 'utf-8')
);
```

### Using Test Builders

```typescript
import { FrameworkBuilder } from '../builders/framework-builder';

const framework = new FrameworkBuilder()
  .withId('test-framework')
  .withName('Test Framework')
  .build();
```

## Best Practices

1. **Run tests before committing**
   ```bash
   npm run test:all
   ```

2. **Use watch mode during development**
   ```bash
   npm run test:watch
   ```

3. **Check coverage regularly**
   ```bash
   npm run test:coverage
   ```

4. **Run integration tests before pushing**
   ```bash
   npm run test:integration
   ```

5. **Run full CI suite before creating PR**
   ```bash
   npm run ci
   ```

## Summary

| Command | Purpose | Speed |
|---------|---------|-------|
| `npm test` | Run unit tests | Fast (< 10s) |
| `npm run test:watch` | Watch mode | Continuous |
| `npm run test:coverage` | Coverage report | Fast (< 15s) |
| `npm run test:integration` | Integration tests | Medium (< 60s) |
| `npm run test:bdd` | BDD tests | Slow (< 120s) |
| `npm run test:all` | All tests | Slow (< 180s) |
| `npm run ci` | Full CI suite | Slow (< 240s) |

**Recommended Workflow:**
1. Development: `npm run test:watch`
2. Before commit: `npm test`
3. Before push: `npm run test:integration`
4. Before PR: `npm run ci`
