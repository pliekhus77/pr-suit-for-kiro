# Test Structure and Organization

## Overview

This document describes how tests are organized in the Pragmatic Rhino SUIT extension project.

## Directory Structure

```
agentic-reviewer/
├── src/                           # Source code
│   ├── commands/
│   ├── services/
│   ├── providers/
│   ├── utils/
│   └── extension.ts
├── tests/                         # Test files
│   ├── unit/                      # Unit tests (Jest)
│   │   ├── services/
│   │   │   ├── framework-manager.test.ts
│   │   │   ├── steering-validator.test.ts
│   │   │   └── template-engine.test.ts
│   │   ├── utils/
│   │   │   └── file-system.test.ts
│   │   └── commands/
│   │       ├── framework-commands.test.ts
│   │       └── steering-commands.test.ts
│   ├── integration/               # Integration tests (VS Code)
│   │   ├── framework-installation.test.ts
│   │   ├── tree-view.test.ts
│   │   ├── validation.test.ts
│   │   └── workspace-init.test.ts
│   ├── bdd/                       # BDD tests (Cucumber/Reqnroll)
│   │   ├── features/
│   │   │   ├── framework-installation.feature
│   │   │   ├── framework-management.feature
│   │   │   ├── custom-steering.feature
│   │   │   └── workspace-initialization.feature
│   │   ├── step-definitions/
│   │   │   ├── framework-steps.ts
│   │   │   ├── steering-steps.ts
│   │   │   └── workspace-steps.ts
│   │   └── support/
│   │       ├── hooks.ts
│   │       └── world.ts
│   ├── fixtures/                  # Test data
│   │   ├── manifests/
│   │   ├── steering-documents/
│   │   └── workspaces/
│   ├── builders/                  # Test data builders
│   │   ├── framework-builder.ts
│   │   ├── manifest-builder.ts
│   │   └── steering-builder.ts
│   └── utils/                     # Test utilities
│       ├── test-workspace.ts
│       └── mock-helpers.ts
├── coverage/                      # Coverage reports
└── test-workspaces/              # Test workspace templates
    ├── empty/
    ├── initialized/
    └── with-frameworks/
```

## Test File Naming Conventions

### Unit Tests
- **Pattern:** `{ClassName}.test.ts`
- **Examples:**
  - `framework-manager.test.ts`
  - `steering-validator.test.ts`
  - `file-system.test.ts`

### Integration Tests
- **Pattern:** `{feature-name}.test.ts`
- **Examples:**
  - `framework-installation.test.ts`
  - `tree-view.test.ts`
  - `workspace-init.test.ts`

### BDD Feature Files
- **Pattern:** `{feature-name}.feature`
- **Examples:**
  - `framework-installation.feature`
  - `custom-steering.feature`

### BDD Step Definitions
- **Pattern:** `{feature-name}-steps.ts`
- **Examples:**
  - `framework-steps.ts`
  - `steering-steps.ts`

## Test Organization Principles

### 1. Mirror Source Structure

Unit tests mirror the source code structure:

```
src/services/framework-manager.ts
  → tests/unit/services/framework-manager.test.ts

src/utils/file-system.ts
  → tests/unit/utils/file-system.test.ts
```

### 2. Group by Feature

Integration tests are grouped by feature/workflow:

```
tests/integration/
├── framework-installation.test.ts    # All installation scenarios
├── framework-updates.test.ts         # All update scenarios
└── tree-view.test.ts                 # All tree view scenarios
```

### 3. Separate Test Types

Keep unit, integration, and BDD tests in separate directories:

- **Unit tests:** Fast, isolated, many
- **Integration tests:** Medium speed, component interaction
- **BDD tests:** Slow, full workflow, user-focused

## Test Suite Structure

### Unit Test Suite

```typescript
// tests/unit/services/framework-manager.test.ts

import { FrameworkManager } from '../../../src/services/framework-manager';
import { MockFileSystem } from '../../utils/mock-helpers';

describe('FrameworkManager', () => {
  let manager: FrameworkManager;
  let mockFileSystem: MockFileSystem;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    manager = new FrameworkManager(mockContext, mockFileSystem);
  });

  describe('listAvailableFrameworks', () => {
    it('should return all frameworks from manifest', async () => {
      // Test implementation
    });

    it('should handle corrupted manifest gracefully', async () => {
      // Test implementation
    });
  });

  describe('installFramework', () => {
    it('should install framework to .kiro/steering/', async () => {
      // Test implementation
    });

    it('should throw error if framework not found', async () => {
      // Test implementation
    });
  });
});
```

### Integration Test Suite

```typescript
// tests/integration/framework-installation.test.ts

import * as vscode from 'vscode';
import * as path from 'path';
import { TestWorkspace } from '../utils/test-workspace';

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
    // Test implementation
  });

  test('should handle installation conflicts', async () => {
    // Test implementation
  });
});
```

### BDD Test Suite

```gherkin
# tests/bdd/features/framework-installation.feature

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

## Test Data Management

### Fixtures

Store static test data in `tests/fixtures/`:

```typescript
// tests/fixtures/manifests/valid-manifest.json
{
  "version": "1.0.0",
  "frameworks": [
    {
      "id": "tdd-bdd-strategy",
      "name": "TDD/BDD Testing Strategy",
      "version": "1.0.0",
      "fileName": "strategy-tdd-bdd.md"
    }
  ]
}
```

### Builders

Use builders for dynamic test data:

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
    content: '# Test Framework\n\nTest content'
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

// Usage in tests
const framework = new FrameworkBuilder()
  .withId('custom-id')
  .withName('Custom Framework')
  .build();
```

### Test Workspaces

Use test workspace utilities for integration tests:

```typescript
// tests/utils/test-workspace.ts

export class TestWorkspace {
  private workspacePath: string;

  async initialize(): Promise<void> {
    this.workspacePath = await this.createTempDirectory();
    await this.createKiroStructure();
  }

  async cleanup(): Promise<void> {
    await fs.rm(this.workspacePath, { recursive: true });
  }

  getPath(): string {
    return this.workspacePath;
  }

  async createFile(relativePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.workspacePath, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }
}
```

## Test Isolation

### Unit Tests

- Mock all external dependencies
- No file system access
- No VS Code API calls
- Fast execution (< 100ms per test)

```typescript
describe('FrameworkManager', () => {
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockContext: jest.Mocked<vscode.ExtensionContext>;

  beforeEach(() => {
    mockFileSystem = {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      // ... other mocks
    } as any;

    mockContext = {
      extensionPath: '/test/path',
      // ... other mocks
    } as any;
  });

  // Tests use mocks, no real I/O
});
```

### Integration Tests

- Use real VS Code API
- Create temporary test workspaces
- Clean up after each test
- Medium execution time (< 5s per test)

```typescript
suite('Framework Installation', () => {
  let testWorkspace: TestWorkspace;

  setup(async () => {
    testWorkspace = new TestWorkspace();
    await testWorkspace.initialize();
  });

  teardown(async () => {
    await testWorkspace.cleanup();
  });

  // Tests use real file system and VS Code API
});
```

## Test Categories

Use test categories to run specific subsets:

```typescript
// Unit test
describe('FrameworkManager', () => {
  // Automatically categorized as unit test by location
});

// Integration test
suite('Framework Installation', () => {
  // Automatically categorized as integration test by location
});

// Performance test
describe('Performance: Framework Installation', () => {
  it('should install framework in < 1s', async () => {
    const start = Date.now();
    await manager.installFramework('test-framework');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000);
  });
});
```

## Code Coverage

### Coverage Configuration

```json
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/test/**'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Coverage Reports

Coverage reports are generated in `coverage/`:

```
coverage/
├── lcov-report/          # HTML report (open index.html)
├── lcov.info             # LCOV format (for CI)
└── coverage-final.json   # JSON format
```

## Test Execution Order

Tests are executed in this order:

1. **Unit tests** (fastest, run first)
2. **Integration tests** (medium speed)
3. **BDD tests** (slowest, run last)

This ensures fast feedback during development.

## Best Practices

### 1. One Assertion Per Test

```typescript
// ❌ Bad: Multiple assertions
it('should install framework', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
  expect(mockFileSystem.ensureDirectory).toHaveBeenCalled();
  expect(manager.isInstalled('test')).toBe(true);
});

// ✅ Good: Single assertion
it('should write framework file', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.writeFile).toHaveBeenCalled();
});

it('should ensure directory exists', async () => {
  await manager.installFramework('test');
  expect(mockFileSystem.ensureDirectory).toHaveBeenCalled();
});

it('should mark framework as installed', async () => {
  await manager.installFramework('test');
  expect(await manager.isInstalled('test')).toBe(true);
});
```

### 2. Descriptive Test Names

```typescript
// ❌ Bad: Vague name
it('should work', async () => { });

// ✅ Good: Descriptive name
it('should install framework to .kiro/steering/ directory', async () => { });
```

### 3. AAA Pattern

```typescript
it('should install framework', async () => {
  // Arrange
  const manager = new FrameworkManager(mockContext, mockFileSystem);
  const frameworkId = 'test-framework';

  // Act
  await manager.installFramework(frameworkId);

  // Assert
  expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
    expect.stringContaining('strategy-test.md'),
    expect.any(String)
  );
});
```

### 4. Test Independence

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
    expect(frameworks).toContain(installedFramework); // Depends on previous test
  });
});

// ✅ Good: Independent tests
describe('FrameworkManager', () => {
  it('should install framework', async () => {
    await manager.installFramework('test');
    expect(mockFileSystem.writeFile).toHaveBeenCalled();
  });

  it('should list installed frameworks', async () => {
    // Arrange: Set up state for this test
    await manager.installFramework('test1');
    await manager.installFramework('test2');

    // Act
    const frameworks = await manager.listInstalled();

    // Assert
    expect(frameworks).toHaveLength(2);
  });
});
```

## Summary

- **Mirror source structure** for unit tests
- **Group by feature** for integration tests
- **Separate test types** (unit, integration, BDD)
- **Use fixtures** for static data
- **Use builders** for dynamic data
- **Isolate tests** (mocks for unit, temp workspaces for integration)
- **Follow AAA pattern** (Arrange, Act, Assert)
- **One assertion per test** (focused tests)
- **Descriptive names** (clear intent)
- **Independent tests** (no dependencies between tests)
