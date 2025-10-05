# Integration Examples for Test Cleanup Utilities

This document provides practical examples of integrating the cleanup utilities into existing test suites.

## Example 1: Updating BDD Helpers

### Before (tests/bdd/support/helpers.ts)

```typescript
export function createTestWorkspace(name: string): string {
  const workspacePath = path.join(__dirname, '../../../test-workspace', name);
  
  if (fs.existsSync(workspacePath)) {
    // Clean up existing workspace
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
  
  fs.mkdirSync(workspacePath, { recursive: true });
  return workspacePath;
}

export function cleanupTestWorkspace(workspacePath: string): void {
  if (fs.existsSync(workspacePath)) {
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}
```

### After (with cleanup utilities)

```typescript
import { TestCleanupManager } from '../../utils';

// Global cleanup manager for BDD tests
const bddCleanup = new TestCleanupManager();

export function createTestWorkspace(name: string): string {
  const workspacePath = path.join(__dirname, '../../../test-workspace', name);
  
  // Register for automatic cleanup
  bddCleanup.registerTempDir(workspacePath);
  
  if (fs.existsSync(workspacePath)) {
    bddCleanup.cleanupDirectory(workspacePath, { force: true });
  }
  
  fs.mkdirSync(workspacePath, { recursive: true });
  return workspacePath;
}

export function cleanupTestWorkspace(workspacePath: string): void {
  bddCleanup.cleanupDirectory(workspacePath, { force: true });
}

// Export cleanup manager for use in hooks
export { bddCleanup };
```

### Update hooks.ts

```typescript
import { bddCleanup } from './helpers';

After(async function(this: ExtensionWorld, { pickle, result }) {
  // ... existing code ...
  
  // Cleanup all registered temporary files/directories
  bddCleanup.cleanupAll({ force: true, verbose: false });
});

AfterAll(async function() {
  console.log('✅ BDD test suite completed');
  
  // Final cleanup and reset
  bddCleanup.reset();
});
```

## Example 2: Unit Test with Fixtures

### Before

```typescript
describe('FrameworkManager', () => {
  let tempDir: string;
  
  beforeEach(() => {
    tempDir = path.join(__dirname, '../../test-workspace/framework-tests');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  it('should install framework', async () => {
    const steeringPath = path.join(tempDir, '.kiro', 'steering');
    fs.mkdirSync(steeringPath, { recursive: true });
    
    await frameworkManager.installFramework('test-framework');
    
    expect(fs.existsSync(path.join(steeringPath, 'test-framework.md'))).toBe(true);
  });
});
```

### After (with cleanup utilities)

```typescript
import { setupTestCleanup } from '../utils';

describe('FrameworkManager', () => {
  const cleanup = setupTestCleanup({ verbose: true });
  let tempDir: string;
  
  beforeEach(() => {
    tempDir = path.join(__dirname, '../../test-workspace/framework-tests');
    cleanup.registerTempDir(tempDir);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });
  
  it('should install framework', async () => {
    const steeringPath = path.join(tempDir, '.kiro', 'steering');
    fs.mkdirSync(steeringPath, { recursive: true });
    
    await frameworkManager.installFramework('test-framework');
    
    expect(fs.existsSync(path.join(steeringPath, 'test-framework.md'))).toBe(true);
    
    // No manual cleanup needed - handled automatically
  });
});
```

## Example 3: Integration Test with Backup

### Before

```typescript
describe('Framework Update', () => {
  const testFile = '/path/to/framework.md';
  let originalContent: string;
  
  beforeEach(() => {
    originalContent = fs.readFileSync(testFile, 'utf-8');
  });
  
  afterEach(() => {
    fs.writeFileSync(testFile, originalContent);
  });
  
  it('should update framework', async () => {
    await frameworkManager.updateFramework('test-framework');
    
    const updatedContent = fs.readFileSync(testFile, 'utf-8');
    expect(updatedContent).not.toBe(originalContent);
  });
});
```

### After (with cleanup utilities)

```typescript
import { setupTestCleanupWithBackup } from '../utils';

describe('Framework Update', () => {
  const cleanup = setupTestCleanupWithBackup();
  const testFile = '/path/to/framework.md';
  
  beforeEach(() => {
    // Backup file before each test
    cleanup.backupFile(testFile);
  });
  
  it('should update framework', async () => {
    await frameworkManager.updateFramework('test-framework');
    
    const updatedContent = fs.readFileSync(testFile, 'utf-8');
    const originalContent = fs.readFileSync(
      cleanup.backupFile(testFile).backupPath,
      'utf-8'
    );
    expect(updatedContent).not.toBe(originalContent);
    
    // File automatically restored after test
  });
});
```

## Example 4: Workspace Isolation

### Before

```typescript
describe('Workspace Operations', () => {
  const workspacePath = '/path/to/test-workspace';
  let initialFiles: string[];
  
  beforeEach(() => {
    initialFiles = fs.readdirSync(workspacePath);
  });
  
  afterEach(() => {
    const currentFiles = fs.readdirSync(workspacePath);
    const newFiles = currentFiles.filter(f => !initialFiles.includes(f));
    
    for (const file of newFiles) {
      fs.unlinkSync(path.join(workspacePath, file));
    }
  });
  
  it('should create new files', () => {
    fs.writeFileSync(path.join(workspacePath, 'new.txt'), 'content');
    expect(fs.existsSync(path.join(workspacePath, 'new.txt'))).toBe(true);
  });
});
```

### After (with cleanup utilities)

```typescript
import { setupWorkspaceIsolation } from '../utils';

describe('Workspace Operations', () => {
  const workspacePath = '/path/to/test-workspace';
  const cleanup = setupWorkspaceIsolation(workspacePath);
  
  it('should create new files', () => {
    fs.writeFileSync(path.join(workspacePath, 'new.txt'), 'content');
    expect(fs.existsSync(path.join(workspacePath, 'new.txt'))).toBe(true);
    
    // Workspace automatically reset after test
  });
});
```

## Example 5: Temporary Test Files

### Before

```typescript
describe('File Operations', () => {
  const tempFiles: string[] = [];
  
  afterEach(() => {
    for (const file of tempFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
    tempFiles.length = 0;
  });
  
  it('should process file', () => {
    const tempFile = `/tmp/test-${Date.now()}.txt`;
    tempFiles.push(tempFile);
    
    fs.writeFileSync(tempFile, 'content');
    processFile(tempFile);
    
    expect(fs.existsSync(tempFile)).toBe(true);
  });
});
```

### After (with cleanup utilities)

```typescript
import { createTempTestFile } from '../utils';

describe('File Operations', () => {
  const getTempFile = createTempTestFile('/tmp/test-files');
  
  it('should process file', () => {
    const tempFile = getTempFile('test.txt');
    
    fs.writeFileSync(tempFile, 'content');
    processFile(tempFile);
    
    expect(fs.existsSync(tempFile)).toBe(true);
    
    // File automatically cleaned up after test
  });
});
```

## Example 6: Performance Tests with Cleanup

```typescript
import { setupTestCleanup } from '../utils';

describe('Performance Tests', () => {
  const cleanup = setupTestCleanup({ verbose: false });
  
  it('should handle large file operations', () => {
    const largeFile = '/tmp/large-file.txt';
    cleanup.registerTempFile(largeFile);
    
    // Create large file
    const content = 'x'.repeat(10 * 1024 * 1024); // 10MB
    fs.writeFileSync(largeFile, content);
    
    const startTime = Date.now();
    processLargeFile(largeFile);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000);
    
    // Large file automatically cleaned up
  });
});
```

## Example 7: Error Handling Tests

```typescript
import { setupTestCleanupWithBackup } from '../utils';

describe('Error Handling', () => {
  const cleanup = setupTestCleanupWithBackup({ force: true });
  
  it('should handle file corruption', () => {
    const file = '/path/to/important.txt';
    cleanup.backupFile(file);
    
    // Corrupt file
    fs.writeFileSync(file, 'corrupted data');
    
    expect(() => processFile(file)).toThrow();
    
    // File automatically restored from backup
  });
});
```

## Example 8: Concurrent Test Isolation

```typescript
import { TestCleanupManager } from '../utils';

describe('Concurrent Operations', () => {
  it('should isolate concurrent tests', async () => {
    const cleanup1 = new TestCleanupManager();
    const cleanup2 = new TestCleanupManager();
    
    const file1 = '/tmp/concurrent-1.txt';
    const file2 = '/tmp/concurrent-2.txt';
    
    cleanup1.registerTempFile(file1);
    cleanup2.registerTempFile(file2);
    
    await Promise.all([
      processFile(file1),
      processFile(file2)
    ]);
    
    cleanup1.cleanupAll();
    cleanup2.cleanupAll();
    
    expect(fs.existsSync(file1)).toBe(false);
    expect(fs.existsSync(file2)).toBe(false);
  });
});
```

## Migration Checklist

When migrating existing tests to use cleanup utilities:

- [ ] Identify manual cleanup code (afterEach, afterAll)
- [ ] Replace with appropriate cleanup helper (setupTestCleanup, etc.)
- [ ] Register temporary files/directories immediately after creation
- [ ] Remove manual cleanup code
- [ ] Test that cleanup works correctly
- [ ] Add verbose logging if debugging needed
- [ ] Update test documentation

## Best Practices

1. **Choose the right helper:**
   - `setupTestCleanup()` - Most common, basic cleanup
   - `setupTestCleanupWithBackup()` - Destructive operations
   - `setupWorkspaceIsolation()` - Workspace modifications
   - `createTempTestDir()` / `createTempTestFile()` - Temporary resources

2. **Register immediately:**
   ```typescript
   const tempFile = getTempFile('test.txt');
   // Use tempFile immediately
   ```

3. **Use verbose mode for debugging:**
   ```typescript
   const cleanup = setupTestCleanup({ verbose: true });
   ```

4. **Force cleanup for stubborn files:**
   ```typescript
   const cleanup = setupTestCleanup({ force: true });
   ```

5. **Backup important files:**
   ```typescript
   cleanup.backupFile(importantFile);
   // Modify file
   // Automatically restored
   ```

## Troubleshooting

### Files not being cleaned up
- Check if files are registered: `cleanup.getStats()`
- Use `force: true` option
- Use `verbose: true` to see operations

### Backups not being restored
- Ensure `setupTestCleanupWithBackup()` is used
- Check backup directory exists
- Verify file permissions

### Workspace reset not working
- Ensure state is captured before modifications
- Check workspace path is correct
- Verify file permissions

## Summary

The cleanup utilities provide a clean, consistent way to manage test data:

- ✅ Automatic cleanup after tests
- ✅ Backup and restore for safety
- ✅ Workspace isolation
- ✅ Temporary file/directory management
- ✅ Force cleanup for locked files
- ✅ Detailed logging and statistics
- ✅ Easy integration with existing tests

Start with simple examples and gradually migrate existing tests to use the cleanup utilities.
