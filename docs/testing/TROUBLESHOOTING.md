# Test Troubleshooting Guide

## Overview

This guide helps you diagnose and fix common test failures in the Pragmatic Rhino SUIT extension project.

## Quick Diagnosis

### Test Failure Checklist

1. **Read the error message carefully** - It usually tells you what's wrong
2. **Check if tests pass locally** - Run `npm test` on your machine
3. **Check if it's a flaky test** - Run the test multiple times
4. **Check recent changes** - What changed since tests last passed?
5. **Check dependencies** - Are all dependencies installed?
6. **Check environment** - Are you using the correct Node.js version?

## Common Issues

### 1. Tests Fail to Run

#### Issue: "Cannot find module"

**Error:**
```
Error: Cannot find module '../src/services/framework-manager'
```

**Cause:** TypeScript not compiled or incorrect import path

**Solution:**
```bash
# Recompile TypeScript
npm run compile

# Check if output files exist
ls out/src/services/

# Verify import path is correct
# Should be: import { FrameworkManager } from '../../../src/services/framework-manager';
```

#### Issue: "npm test" command not found

**Error:**
```
'npm' is not recognized as an internal or external command
```

**Cause:** Node.js/npm not installed or not in PATH

**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Verify installation
node --version
npm --version

# Should show v18.x or higher
```

#### Issue: Dependencies not installed

**Error:**
```
Error: Cannot find module 'jest'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
# Install dependencies
npm install

# Verify jest is installed
npm list jest
```

### 2. Unit Test Failures

#### Issue: Mock not working

**Error:**
```
Expected mock function to have been called, but it was not called.
```

**Cause:** Mock not properly configured or code not calling mocked function

**Solution:**
```typescript
// ❌ Bad: Mock not configured
const mockFileSystem = {} as FileSystemOperations;

// ✅ Good: Properly configured mock
const mockFileSystem: jest.Mocked<FileSystemOperations> = {
  readFile: jest.fn().mockResolvedValue('content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  // ... other methods
};

// Verify mock was called
console.log('Mock calls:', mockFileSystem.writeFile.mock.calls);
```

#### Issue: Async test timing out

**Error:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Cause:** Async operation not completing or missing await

**Solution:**
```typescript
// ❌ Bad: Missing await
it('should install framework', async () => {
  manager.installFramework('test'); // Missing await!
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});

// ✅ Good: Proper await
it('should install framework', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});

// Or increase timeout for slow operations
it('should install framework', async () => {
  jest.setTimeout(10000); // 10 seconds
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

#### Issue: Test passes in isolation but fails in suite

**Error:**
```
Expected 1 call but received 2 calls
```

**Cause:** Mocks not reset between tests

**Solution:**
```typescript
describe('FrameworkManager', () => {
  let mockFileSystem: jest.Mocked<FileSystemOperations>;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockFileSystem = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      // ...
    };
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  // Tests...
});
```

#### Issue: Assertion fails with unexpected value

**Error:**
```
Expected: "strategy-tdd-bdd.md"
Received: "strategy-tdd-bdd.md.tmp"
```

**Cause:** Code behavior changed or test expectation incorrect

**Solution:**
```typescript
// Debug: Log actual value
it('should create correct filename', async () => {
  await manager.installFramework('tdd-bdd-strategy');
  
  const calls = mockFileSystem.writeFile.mock.calls;
  console.log('writeFile calls:', calls);
  
  expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
    expect.stringContaining('strategy-tdd-bdd.md'),
    expect.any(String)
  );
});
```

### 3. Integration Test Failures

#### Issue: Extension not activating

**Error:**
```
Extension 'pragmatic-rhino.agentic-reviewer' failed to activate
```

**Cause:** Extension activation error or missing dependencies

**Solution:**
```bash
# Check extension logs
# Open VS Code Developer Tools: Help > Toggle Developer Tools
# Look for errors in Console tab

# Verify extension is packaged correctly
npm run package

# Check package.json activation events
# Should include: "workspaceContains:.kiro/"
```

#### Issue: Test workspace not found

**Error:**
```
ENOENT: no such file or directory, stat '/tmp/vscode-test-workspace-xyz/.kiro'
```

**Cause:** Test workspace not properly initialized

**Solution:**
```typescript
suite('Framework Installation', () => {
  let testWorkspace: TestWorkspace;

  setup(async () => {
    testWorkspace = new TestWorkspace();
    await testWorkspace.initialize(); // Ensure this completes
    
    // Verify workspace exists
    const workspacePath = testWorkspace.getPath();
    console.log('Test workspace:', workspacePath);
    
    const exists = await fs.access(workspacePath).then(() => true).catch(() => false);
    assert.ok(exists, 'Test workspace should exist');
  });

  teardown(async () => {
    await testWorkspace.cleanup();
  });

  // Tests...
});
```

#### Issue: Command not found

**Error:**
```
Command 'agentic-reviewer.installFramework' not found
```

**Cause:** Extension not activated or command not registered

**Solution:**
```typescript
test('should register command', async () => {
  // Ensure extension is activated
  const ext = vscode.extensions.getExtension('pragmatic-rhino.agentic-reviewer');
  assert.ok(ext, 'Extension should be installed');
  
  if (!ext.isActive) {
    await ext.activate();
  }
  
  // Verify command is registered
  const commands = await vscode.commands.getCommands();
  assert.ok(
    commands.includes('agentic-reviewer.installFramework'),
    'Command should be registered'
  );
});
```

#### Issue: File system operations fail

**Error:**
```
EACCES: permission denied, mkdir '/test-workspace/.kiro'
```

**Cause:** Insufficient permissions or directory already exists

**Solution:**
```typescript
// Ensure clean workspace
setup(async () => {
  testWorkspace = new TestWorkspace();
  
  // Clean up any existing workspace
  const workspacePath = testWorkspace.getPath();
  if (await fs.access(workspacePath).then(() => true).catch(() => false)) {
    await fs.rm(workspacePath, { recursive: true, force: true });
  }
  
  await testWorkspace.initialize();
});

// Or use unique workspace names
class TestWorkspace {
  private workspacePath: string;

  constructor() {
    this.workspacePath = path.join(
      os.tmpdir(),
      `vscode-test-${Date.now()}-${Math.random().toString(36).substring(7)}`
    );
  }
}
```

### 4. BDD Test Failures

#### Issue: Step definition not found

**Error:**
```
Undefined step: "I have an initialized Kiro workspace"
```

**Cause:** Step definition not implemented or not loaded

**Solution:**
```typescript
// Ensure step definition is exported
// tests/bdd/step-definitions/workspace-steps.ts

import { Given, When, Then } from '@cucumber/cucumber';

Given('I have an initialized Kiro workspace', async function() {
  this.workspace = new TestWorkspace();
  await this.workspace.initialize();
});

// Verify step definitions are loaded
// Check cucumber.js configuration
module.exports = {
  default: {
    require: ['tests/bdd/step-definitions/**/*.ts'],
    // ...
  }
};
```

#### Issue: Scenario fails at specific step

**Error:**
```
AssertionError: Expected file to exist at .kiro/steering/strategy-tdd-bdd.md
```

**Cause:** Previous step didn't complete successfully or assertion incorrect

**Solution:**
```typescript
// Add debugging to steps
When('I click "Install"', async function() {
  console.log('Clicking Install button');
  
  await vscode.commands.executeCommand(
    'agentic-reviewer.installFramework',
    this.selectedFramework
  );
  
  console.log('Install command executed');
});

Then('the framework file should be created', async function() {
  const filePath = path.join(
    this.workspace.getPath(),
    '.kiro/steering/strategy-tdd-bdd.md'
  );
  
  console.log('Checking file at:', filePath);
  
  const exists = await fs.access(filePath).then(() => true).catch(() => false);
  
  if (!exists) {
    // List directory contents for debugging
    const files = await fs.readdir(path.dirname(filePath));
    console.log('Files in directory:', files);
  }
  
  assert.ok(exists, `File should exist at ${filePath}`);
});
```

### 5. Coverage Issues

#### Issue: Coverage below threshold

**Error:**
```
Coverage for lines (75%) does not meet global threshold (80%)
```

**Cause:** Insufficient test coverage

**Solution:**
```bash
# Generate detailed coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Identify uncovered lines (highlighted in red)
# Add tests for uncovered code

# Example: If line 45 is uncovered
# 45: if (framework.dependencies) {
# Add test:
it('should install dependencies when framework has dependencies', async () => {
  const framework = new FrameworkBuilder()
    .withDependencies(['dep1'])
    .build();
  
  await manager.installFramework(framework.id);
  
  expect(manager.installDependencies).toHaveBeenCalled();
});
```

#### Issue: Coverage report not generated

**Error:**
```
No coverage information was collected
```

**Cause:** Coverage not configured or tests not running

**Solution:**
```bash
# Verify jest.config.js has coverage configuration
# Should include:
# collectCoverage: true
# collectCoverageFrom: ['src/**/*.ts']

# Run tests with coverage explicitly
npm test -- --coverage

# Check if tests are actually running
npm test -- --verbose
```

### 6. Performance Issues

#### Issue: Tests running slowly

**Symptom:** Test suite takes > 60 seconds

**Cause:** Too many integration tests or inefficient test setup

**Solution:**
```bash
# Run tests with timing information
npm test -- --verbose

# Identify slow tests (> 1s)
# Optimize or move to separate suite

# Run only unit tests during development
npm run test:unit

# Run integration tests separately
npm run test:integration
```

#### Issue: Watch mode consuming too much CPU

**Symptom:** High CPU usage when running `npm run test:watch`

**Cause:** Too many files being watched

**Solution:**
```javascript
// jest.config.js
module.exports = {
  // Ignore unnecessary directories
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/out/',
    '/coverage/',
    '/.vscode-test/'
  ],
  
  // Or use polling (slower but more stable)
  watchman: false
};
```

### 7. CI/CD Failures

#### Issue: Tests pass locally but fail in CI

**Cause:** Environment differences (OS, Node version, timing)

**Solution:**
```yaml
# .github/workflows/test.yml
# Ensure CI uses same Node version as local
- uses: actions/setup-node@v3
  with:
    node-version: '18'  # Match your local version

# Run tests with same commands as local
- run: npm install
- run: npm run compile
- run: npm test
- run: npm run test:integration
```

#### Issue: Flaky tests in CI

**Symptom:** Tests pass sometimes, fail other times

**Cause:** Race conditions, timing issues, or external dependencies

**Solution:**
```typescript
// ❌ Bad: Depends on timing
it('should update after delay', async () => {
  manager.scheduleUpdate();
  await new Promise(resolve => setTimeout(resolve, 100)); // Flaky!
  expect(manager.isUpdated()).toBe(true);
});

// ✅ Good: Wait for specific condition
it('should update when triggered', async () => {
  const updatePromise = manager.waitForUpdate();
  manager.triggerUpdate();
  await updatePromise;
  expect(manager.isUpdated()).toBe(true);
});

// Or increase timeout for CI
if (process.env.CI) {
  jest.setTimeout(30000); // 30 seconds in CI
}
```

## Debugging Strategies

### 1. Isolate the Problem

```bash
# Run single test file
npm test -- framework-manager.test.ts

# Run single test
npm test -- --testNamePattern="should install framework"

# Run with verbose output
npm test -- --verbose
```

### 2. Add Logging

```typescript
it('should install framework', async () => {
  console.log('Starting test');
  console.log('Mock setup:', mockFileSystem);
  
  await manager.installFramework('test');
  
  console.log('Mock calls:', mockFileSystem.writeFile.mock.calls);
  
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

### 3. Use Debugger

**VS Code:**
1. Set breakpoint in test file
2. Open "Run and Debug" panel
3. Select "Jest: Current File"
4. Press F5

**Chrome DevTools:**
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
# Open chrome://inspect in Chrome
# Click "inspect" on the Node process
```

### 4. Check Test Output

```bash
# Run tests with detailed output
npm test -- --verbose --no-coverage

# Check for console.log output
# Check for error stack traces
# Check for timing information
```

### 5. Verify Environment

```bash
# Check Node version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 9.x or higher

# Check VS Code version
code --version  # Should be 1.85.0 or higher

# Check installed dependencies
npm list
```

## Getting Help

### Before Asking for Help

1. **Search existing issues** on GitHub
2. **Check this troubleshooting guide**
3. **Try debugging strategies** above
4. **Collect diagnostic information** (see below)

### Diagnostic Information to Collect

```bash
# System information
node --version
npm --version
code --version
uname -a  # or `ver` on Windows

# Test output
npm test -- --verbose > test-output.txt 2>&1

# Coverage report
npm run test:coverage

# Extension logs
# Open VS Code Developer Tools: Help > Toggle Developer Tools
# Copy Console output
```

### Reporting Issues

When reporting test failures, include:

1. **Description:** What were you trying to do?
2. **Steps to reproduce:** Exact commands run
3. **Expected behavior:** What should happen?
4. **Actual behavior:** What actually happened?
5. **Error messages:** Full error output
6. **Environment:** OS, Node version, VS Code version
7. **Diagnostic information:** From above

**Template:**
```markdown
## Description
Tests fail when running `npm test`

## Steps to Reproduce
1. Clone repository
2. Run `npm install`
3. Run `npm test`

## Expected Behavior
All tests should pass

## Actual Behavior
Tests fail with error: "Cannot find module..."

## Error Output
```
[paste error output]
```

## Environment
- OS: Windows 11
- Node: v18.17.0
- npm: v9.8.1
- VS Code: 1.85.0

## Additional Context
Tests pass on macOS but fail on Windows
```

## Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| Cannot find module | `npm run compile` |
| Dependencies missing | `npm install` |
| Mock not working | Reset mocks in `beforeEach` |
| Async timeout | Add `await` or increase timeout |
| Extension not activating | Check activation events |
| Test workspace not found | Verify `setup()` completes |
| Coverage below threshold | Add tests for uncovered code |
| Tests slow | Run unit tests only during dev |
| Flaky tests | Remove timing dependencies |
| CI failures | Match CI environment to local |

## Prevention

### Write Robust Tests

- Use AAA pattern (Arrange, Act, Assert)
- One assertion per test
- Test edge cases and errors
- Mock external dependencies
- Keep tests independent
- Avoid timing dependencies

### Maintain Tests

- Run tests before committing
- Fix failing tests immediately
- Update tests when code changes
- Remove obsolete tests
- Refactor duplicated test code

### Monitor Test Health

- Track test execution time
- Monitor flaky tests
- Review coverage reports
- Update dependencies regularly

## Resources

- [Jest Troubleshooting](https://jestjs.io/docs/troubleshooting)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [GitHub Issues](https://github.com/pragmatic-rhino/agentic-reviewer/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/jest)
