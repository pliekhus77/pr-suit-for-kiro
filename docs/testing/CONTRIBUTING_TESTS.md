# Testing Guidelines for Contributors

## Overview

This document provides guidelines for contributors on how to write and maintain tests for the Pragmatic Rhino SUIT extension.

## Testing Philosophy

### Test-Driven Development (TDD)

We follow TDD practices for all new features:

1. **Red:** Write a failing test
2. **Green:** Write minimal code to make it pass
3. **Refactor:** Improve code quality while keeping tests green

### Test Pyramid

Our test distribution follows the test pyramid:

```
        /\
       /  \      E2E/BDD (10%)
      /____\     
     /      \    Integration (30%)
    /________\   
   /          \  Unit (60%)
  /____________\ 
```

- **60% Unit Tests:** Fast, isolated, many
- **30% Integration Tests:** Medium speed, component interaction
- **10% BDD Tests:** Slow, full workflow, user-focused

## When to Write Tests

### Always Write Tests For

- ✅ New features
- ✅ Bug fixes
- ✅ Refactoring
- ✅ Public APIs
- ✅ Critical paths
- ✅ Complex logic
- ✅ Edge cases

### Optional Tests For

- ⚠️ Simple getters/setters
- ⚠️ Trivial utility functions
- ⚠️ Generated code
- ⚠️ Third-party library wrappers (if well-tested upstream)

## Test Types

### Unit Tests

**Purpose:** Test individual components in isolation

**When to use:**
- Testing a single class or function
- Testing business logic
- Testing error handling
- Testing edge cases

**Example:**
```typescript
describe('FrameworkManager', () => {
  describe('installFramework', () => {
    it('should install framework to .kiro/steering/', async () => {
      // Arrange
      const mockFileSystem = createMockFileSystem();
      const manager = new FrameworkManager(mockContext, mockFileSystem);

      // Act
      await manager.installFramework('tdd-bdd-strategy');

      // Assert
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.any(String)
      );
    });
  });
});
```

### Integration Tests

**Purpose:** Test component interactions

**When to use:**
- Testing command execution
- Testing VS Code API integration
- Testing file system operations
- Testing user workflows

**Example:**
```typescript
suite('Framework Installation Integration Tests', () => {
  let testWorkspace: TestWorkspace;

  setup(async () => {
    testWorkspace = new TestWorkspace();
    await testWorkspace.initialize();
  });

  teardown(async () => {
    await testWorkspace.cleanup();
  });

  test('should install framework via command', async () => {
    // Act
    await vscode.commands.executeCommand(
      'agentic-reviewer.installFramework',
      'tdd-bdd-strategy'
    );

    // Assert
    const fileUri = vscode.Uri.file(
      path.join(testWorkspace.getPath(), '.kiro/steering/strategy-tdd-bdd.md')
    );
    const stat = await vscode.workspace.fs.stat(fileUri);
    assert.ok(stat.size > 0);
  });
});
```

### BDD Tests

**Purpose:** Test user-facing behavior

**When to use:**
- Testing complete user workflows
- Testing acceptance criteria
- Documenting expected behavior
- Communicating with non-technical stakeholders

**Example:**
```gherkin
Feature: Framework Installation
  As a developer
  I want to install framework steering documents
  So that Kiro can guide me with best practices

  Scenario: Install framework successfully
    Given I have an initialized Kiro workspace
    When I browse available frameworks
    And I select "TDD/BDD Testing Strategy"
    And I click "Install"
    Then the framework file should be created at ".kiro/steering/strategy-tdd-bdd.md"
    And I should see a success notification
    And the tree view should show the installed framework
```

## Writing Good Tests

### Test Structure (AAA Pattern)

```typescript
it('should do something', async () => {
  // Arrange: Set up test data and dependencies
  const mockFileSystem = createMockFileSystem();
  const manager = new FrameworkManager(mockContext, mockFileSystem);
  const frameworkId = 'test-framework';

  // Act: Execute the code under test
  await manager.installFramework(frameworkId);

  // Assert: Verify the expected outcome
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

### Test Naming

Use descriptive names that explain what is being tested:

```typescript
// ❌ Bad: Vague
it('should work', () => {});
it('test install', () => {});

// ✅ Good: Descriptive
it('should install framework to .kiro/steering/ directory', () => {});
it('should throw error when framework ID is invalid', () => {});
it('should create backup before overwriting existing framework', () => {});
```

**Pattern:** `should [expected behavior] when [condition]`

### One Assertion Per Test

Focus each test on a single behavior:

```typescript
// ❌ Bad: Multiple assertions
it('should install framework', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
  expect(mockFileSystem.ensureDirectory).toHaveBeenCalled();
  expect(manager.isInstalled('test')).toBe(true);
  expect(metadata.frameworks).toHaveLength(1);
});

// ✅ Good: Single assertion per test
it('should write framework file when installing', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});

it('should ensure directory exists when installing', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.ensureDirectory).toHaveBeenCalled();
});

it('should mark framework as installed after installation', async () => {
  await manager.installFramework('test');
  expect(await manager.isInstalled('test')).toBe(true);
});
```

### Test Independence

Each test should be independent and not rely on other tests:

```typescript
// ❌ Bad: Tests depend on each other
describe('FrameworkManager', () => {
  let installedFramework: string;

  it('should install framework', async () => {
    installedFramework = await manager.installFramework('test');
  });

  it('should list installed frameworks', async () => {
    const frameworks = await manager.listInstalled();
    expect(frameworks).toContain(installedFramework); // Depends on previous test!
  });
});

// ✅ Good: Independent tests
describe('FrameworkManager', () => {
  it('should install framework', async () => {
    await manager.installFramework('test');
    expect(mockFileSystem.writeFile).toHaveBeenCalled();
  });

  it('should list installed frameworks', async () => {
    // Arrange: Set up state for this specific test
    await manager.installFramework('test1');
    await manager.installFramework('test2');

    // Act
    const frameworks = await manager.listInstalled();

    // Assert
    expect(frameworks).toHaveLength(2);
  });
});
```

### Test Edge Cases

Always test edge cases and error conditions:

```typescript
describe('FrameworkManager.installFramework', () => {
  // Happy path
  it('should install framework successfully', async () => {
    await manager.installFramework('valid-id');
    expect(mockFileSystem.writeFile).toHaveBeenCalled();
  });

  // Edge cases
  it('should throw error when framework ID is empty', async () => {
    await expect(manager.installFramework('')).rejects.toThrow('Framework ID cannot be empty');
  });

  it('should throw error when framework ID is null', async () => {
    await expect(manager.installFramework(null as any)).rejects.toThrow();
  });

  it('should throw error when framework does not exist', async () => {
    await expect(manager.installFramework('non-existent')).rejects.toThrow('Framework not found');
  });

  it('should handle file system errors gracefully', async () => {
    mockFileSystem.writeFile.mockRejectedValue(new Error('EACCES: permission denied'));
    await expect(manager.installFramework('test')).rejects.toThrow('permission denied');
  });
});
```

## Mocking

### When to Mock

- External dependencies (file system, network, VS Code API)
- Slow operations (database, API calls)
- Non-deterministic behavior (random, time)
- Complex dependencies

### How to Mock

**Using Jest:**
```typescript
// Mock entire module
jest.mock('fs');

// Mock specific function
const mockReadFile = jest.fn();
jest.mock('fs', () => ({
  readFile: mockReadFile
}));

// Mock implementation
mockReadFile.mockResolvedValue('file content');

// Verify mock was called
expect(mockReadFile).toHaveBeenCalledWith('path/to/file');
```

**Using Test Doubles:**
```typescript
// Create mock object
const mockFileSystem: jest.Mocked<FileSystemOperations> = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  ensureDirectory: jest.fn(),
  // ... other methods
};

// Use in test
const manager = new FrameworkManager(mockContext, mockFileSystem);
```

### Mock Best Practices

```typescript
// ✅ Good: Clear mock setup
beforeEach(() => {
  mockFileSystem.readFile.mockResolvedValue('content');
  mockFileSystem.writeFile.mockResolvedValue(undefined);
});

// ✅ Good: Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// ❌ Bad: Overly complex mocks
mockFileSystem.readFile.mockImplementation((path) => {
  if (path.includes('manifest')) {
    return Promise.resolve(JSON.stringify(manifest));
  } else if (path.includes('metadata')) {
    return Promise.resolve(JSON.stringify(metadata));
  } else {
    return Promise.reject(new Error('File not found'));
  }
});

// ✅ Good: Use test fixtures instead
mockFileSystem.readFile.mockImplementation((path) => {
  return Promise.resolve(fixtures[path]);
});
```

## Test Data

### Using Fixtures

Store static test data in `tests/fixtures/`:

```typescript
// tests/fixtures/manifests/valid-manifest.json
{
  "version": "1.0.0",
  "frameworks": [...]
}

// Load in test
import validManifest from '../fixtures/manifests/valid-manifest.json';

it('should parse valid manifest', () => {
  const result = parseManifest(validManifest);
  expect(result.frameworks).toHaveLength(8);
});
```

### Using Builders

Create test data builders for complex objects:

```typescript
// tests/builders/framework-builder.ts
export class FrameworkBuilder {
  private framework: Framework = {
    id: 'test-framework',
    name: 'Test Framework',
    description: 'Test description',
    category: FrameworkCategory.Testing,
    version: '1.0.0',
    fileName: 'test-framework.md',
    content: '# Test Framework'
  };

  withId(id: string): this {
    this.framework.id = id;
    return this;
  }

  withName(name: string): this {
    this.framework.name = name;
    return this;
  }

  build(): Framework {
    return { ...this.framework };
  }
}

// Use in tests
const framework = new FrameworkBuilder()
  .withId('custom-id')
  .withName('Custom Framework')
  .build();
```

## Code Coverage

### Coverage Requirements

- **Overall:** 80% minimum
- **Critical paths:** 100%
- **Public APIs:** 100%
- **Business logic:** 90%+

### Checking Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Improving Coverage

1. **Identify uncovered code** in coverage report
2. **Add tests** for uncovered lines
3. **Verify coverage** increased

```typescript
// Coverage report shows line 45 is uncovered
45: if (framework.dependencies) {
46:   await this.installDependencies(framework.dependencies);
47: }

// Add test for this branch
it('should install dependencies when framework has dependencies', async () => {
  const framework = new FrameworkBuilder()
    .withDependencies(['dep1', 'dep2'])
    .build();
  
  await manager.installFramework(framework.id);
  
  expect(manager.installDependencies).toHaveBeenCalledWith(['dep1', 'dep2']);
});
```

## Common Patterns

### Testing Async Code

```typescript
// ✅ Good: Use async/await
it('should install framework', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});

// ❌ Bad: Forgetting await
it('should install framework', async () => {
  manager.installFramework('test'); // Missing await!
  expect(mockFileSystem.writeFile).toHaveBeenCalled(); // May fail
});
```

### Testing Error Handling

```typescript
it('should throw error when framework not found', async () => {
  await expect(manager.installFramework('invalid'))
    .rejects
    .toThrow('Framework not found: invalid');
});

it('should handle file system errors', async () => {
  mockFileSystem.writeFile.mockRejectedValue(new Error('EACCES'));
  
  await expect(manager.installFramework('test'))
    .rejects
    .toThrow('EACCES');
});
```

### Testing Events

```typescript
it('should emit event when framework installed', async () => {
  const eventSpy = jest.fn();
  manager.on('frameworkInstalled', eventSpy);

  await manager.installFramework('test');

  expect(eventSpy).toHaveBeenCalledWith({
    frameworkId: 'test',
    timestamp: expect.any(Number)
  });
});
```

### Testing VS Code Commands

```typescript
test('should register command', async () => {
  const commands = await vscode.commands.getCommands();
  assert.ok(commands.includes('agentic-reviewer.installFramework'));
});

test('should execute command', async () => {
  await vscode.commands.executeCommand(
    'agentic-reviewer.installFramework',
    'test-framework'
  );

  // Verify side effects
  const fileUri = vscode.Uri.file('.kiro/steering/test-framework.md');
  const stat = await vscode.workspace.fs.stat(fileUri);
  assert.ok(stat.size > 0);
});
```

## Performance Testing

### Measuring Performance

```typescript
it('should install framework in < 1s', async () => {
  const start = Date.now();
  
  await manager.installFramework('test');
  
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000);
});
```

### Performance Targets

- Extension activation: < 500ms
- Framework installation: < 1s
- Tree view refresh: < 200ms
- Validation execution: < 500ms

## Debugging Tests

### VS Code Debugger

1. Set breakpoint in test file
2. Open "Run and Debug" panel
3. Select "Jest: Current File"
4. Press F5

### Console Logging

```typescript
it('should install framework', async () => {
  console.log('Before install');
  await manager.installFramework('test');
  console.log('After install');
  
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

### Inspecting Mocks

```typescript
it('should call writeFile with correct arguments', async () => {
  await manager.installFramework('test');
  
  console.log('writeFile calls:', mockFileSystem.writeFile.mock.calls);
  console.log('writeFile call count:', mockFileSystem.writeFile.mock.calls.length);
  
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] All new code has tests
- [ ] All tests pass (`npm test`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] Coverage meets threshold (`npm run test:coverage`)
- [ ] No console errors or warnings
- [ ] Tests follow naming conventions
- [ ] Tests are independent
- [ ] Edge cases are covered
- [ ] Documentation is updated

## Common Mistakes

### ❌ Not Testing Error Cases

```typescript
// Bad: Only testing happy path
it('should install framework', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});

// Good: Also testing error cases
it('should throw error when framework not found', async () => {
  await expect(manager.installFramework('invalid')).rejects.toThrow();
});
```

### ❌ Testing Implementation Details

```typescript
// Bad: Testing private methods
it('should call private method', () => {
  const spy = jest.spyOn(manager as any, '_privateMethod');
  manager.publicMethod();
  expect(spy).toHaveBeenCalled();
});

// Good: Testing public behavior
it('should install framework', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});
```

### ❌ Flaky Tests

```typescript
// Bad: Depends on timing
it('should update after delay', async () => {
  manager.scheduleUpdate();
  await new Promise(resolve => setTimeout(resolve, 100)); // Flaky!
  expect(manager.isUpdated()).toBe(true);
});

// Good: Use deterministic approach
it('should update when triggered', async () => {
  await manager.triggerUpdate();
  expect(manager.isUpdated()).toBe(true);
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## Getting Help

- **Questions:** Open a discussion on GitHub
- **Bugs:** Open an issue with test reproduction
- **Contributions:** Follow this guide and submit a PR

## Summary

**Key Principles:**
- Write tests first (TDD)
- Follow test pyramid (60% unit, 30% integration, 10% BDD)
- Use AAA pattern (Arrange, Act, Assert)
- One assertion per test
- Test edge cases and errors
- Keep tests independent
- Mock external dependencies
- Maintain 80%+ coverage

**Before Submitting PR:**
- All tests pass
- Coverage meets threshold
- Tests follow conventions
- Documentation updated
