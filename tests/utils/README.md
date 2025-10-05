# Test Utilities

This directory contains utility modules for test data management, cleanup, and test isolation.

## Modules

### `cleanup.ts`

Core cleanup utilities for managing temporary test files, backups, and workspace state.

**Key Classes:**
- `TestCleanupManager` - Main cleanup manager with backup/restore capabilities
- `globalCleanupManager` - Global singleton instance

**Key Features:**
- Register temporary files and directories for automatic cleanup
- Backup and restore files/directories
- Capture and reset workspace state
- Force cleanup with retry logic
- Detailed statistics and logging

### `jest-helpers.ts`

Jest-specific helpers that integrate cleanup utilities with Jest lifecycle hooks.

**Key Functions:**
- `setupTestCleanup()` - Basic automatic cleanup after each test
- `setupTestCleanupWithBackup()` - Cleanup with backup/restore
- `setupWorkspaceIsolation()` - Workspace state isolation
- `createTempTestDir()` - Create temporary directories
- `createTempTestFile()` - Create temporary files

## Usage Examples

### Basic Cleanup

```typescript
import { setupTestCleanup } from '../utils';

describe('FileOperations', () => {
  const cleanup = setupTestCleanup();
  
  it('should create temporary file', () => {
    const tempFile = '/tmp/test.txt';
    cleanup.registerTempFile(tempFile);
    
    fs.writeFileSync(tempFile, 'test content');
    
    // File will be automatically cleaned up after test
  });
});
```

### Cleanup with Backup

```typescript
import { setupTestCleanupWithBackup } from '../utils';

describe('FileModification', () => {
  const cleanup = setupTestCleanupWithBackup({
    backupDir: '/tmp/backups',
    verbose: true
  });
  
  it('should modify file and restore', () => {
    const file = '/path/to/important.txt';
    
    // Backup before modification
    cleanup.backupFile(file);
    
    // Modify file
    fs.writeFileSync(file, 'modified content');
    
    // File will be restored to original state after test
  });
});
```

### Workspace Isolation

```typescript
import { setupWorkspaceIsolation } from '../utils';

describe('WorkspaceOperations', () => {
  const workspacePath = '/path/to/test-workspace';
  const cleanup = setupWorkspaceIsolation(workspacePath);
  
  it('should modify workspace', () => {
    // Create new files in workspace
    fs.writeFileSync(path.join(workspacePath, 'new-file.txt'), 'content');
    
    // Workspace will be reset to original state after test
  });
});
```

### Temporary Directories

```typescript
import { createTempTestDir } from '../utils';

describe('DirectoryOperations', () => {
  const getTempDir = createTempTestDir('/tmp/test-dirs');
  
  it('should use temporary directory', () => {
    const tempDir = getTempDir();
    
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'file.txt'), 'content');
    
    // Directory will be automatically cleaned up after test
  });
});
```

### Temporary Files

```typescript
import { createTempTestFile } from '../utils';

describe('FileOperations', () => {
  const getTempFile = createTempTestFile('/tmp/test-files');
  
  it('should use temporary file', () => {
    const tempFile = getTempFile('test.txt');
    
    fs.writeFileSync(tempFile, 'test content');
    
    // File will be automatically cleaned up after test
  });
});
```

### Manual Cleanup Management

```typescript
import { TestCleanupManager } from '../utils';

describe('ManualCleanup', () => {
  let cleanup: TestCleanupManager;
  
  beforeEach(() => {
    cleanup = new TestCleanupManager();
  });
  
  afterEach(() => {
    cleanup.cleanupAll({ force: true, verbose: true });
  });
  
  it('should manage cleanup manually', () => {
    const tempFile = '/tmp/manual-test.txt';
    cleanup.registerTempFile(tempFile);
    
    fs.writeFileSync(tempFile, 'content');
    
    // Manually cleanup if needed
    cleanup.cleanupFile(tempFile);
  });
});
```

### Backup and Restore

```typescript
import { TestCleanupManager } from '../utils';

describe('BackupRestore', () => {
  const cleanup = new TestCleanupManager();
  
  afterEach(() => {
    cleanup.restoreAll();
    cleanup.clearBackups(true);
  });
  
  it('should backup and restore file', () => {
    const file = '/path/to/file.txt';
    const originalContent = fs.readFileSync(file, 'utf-8');
    
    // Backup file
    const backup = cleanup.backupFile(file);
    console.log(`Backed up to: ${backup.backupPath}`);
    
    // Modify file
    fs.writeFileSync(file, 'modified content');
    
    // Restore file
    cleanup.restoreFile(file);
    
    // Verify restoration
    const restoredContent = fs.readFileSync(file, 'utf-8');
    expect(restoredContent).toBe(originalContent);
  });
});
```

### Workspace State Management

```typescript
import { TestCleanupManager } from '../utils';

describe('WorkspaceState', () => {
  const cleanup = new TestCleanupManager();
  const workspacePath = '/path/to/workspace';
  
  beforeAll(() => {
    // Capture initial state
    cleanup.captureWorkspaceState(workspacePath);
  });
  
  afterEach(() => {
    // Reset to initial state
    cleanup.resetWorkspace(workspacePath);
  });
  
  it('should reset workspace state', () => {
    // Add new files
    fs.writeFileSync(path.join(workspacePath, 'new.txt'), 'content');
    
    // Delete existing files
    fs.unlinkSync(path.join(workspacePath, 'existing.txt'));
    
    // After test, workspace will be reset to initial state
  });
});
```

## Cleanup Options

All cleanup functions accept an optional `CleanupOptions` object:

```typescript
interface CleanupOptions {
  force?: boolean;      // Force cleanup even if files are locked
  backup?: boolean;     // Create backup before cleanup
  backupDir?: string;   // Directory to store backups
  verbose?: boolean;    // Log cleanup operations
}
```

## Best Practices

1. **Use setupTestCleanup() for most tests** - Simplest and most common pattern
2. **Use setupTestCleanupWithBackup() for destructive tests** - When modifying important files
3. **Use setupWorkspaceIsolation() for integration tests** - When testing workspace modifications
4. **Register temp files/dirs immediately after creation** - Don't forget to register
5. **Use verbose mode for debugging** - Helps identify cleanup issues
6. **Use force mode for stubborn files** - When dealing with locked files
7. **Clean up backups after tests** - Don't leave backup files around

## Integration with Existing Tests

### BDD Tests

The BDD tests already use cleanup utilities in `tests/bdd/support/helpers.ts`. You can enhance them:

```typescript
import { TestCleanupManager } from '../../utils';

export function createTestWorkspace(name: string): string {
  const cleanup = new TestCleanupManager();
  const workspacePath = path.join(__dirname, '../../../test-workspace', name);
  
  cleanup.registerTempDir(workspacePath);
  
  if (fs.existsSync(workspacePath)) {
    cleanup.cleanupDirectory(workspacePath);
  }
  
  fs.mkdirSync(workspacePath, { recursive: true });
  return workspacePath;
}
```

### Unit Tests

Add cleanup to existing unit tests:

```typescript
import { setupTestCleanup } from '../utils';

describe('FrameworkManager', () => {
  const cleanup = setupTestCleanup({ verbose: true });
  
  // ... existing tests ...
});
```

## Troubleshooting

### Files Not Being Cleaned Up

- Check if files are registered: `cleanup.getStats()`
- Use `force: true` option for locked files
- Use `verbose: true` to see cleanup operations

### Backups Not Being Restored

- Ensure `restoreAll()` is called in `afterEach` or `afterAll`
- Check backup directory exists and has correct permissions
- Verify backup metadata is stored correctly

### Workspace Reset Not Working

- Ensure workspace state is captured before modifications
- Check that workspace path is correct
- Verify file permissions allow deletion

## Related Documentation

- [Test Fixtures](../fixtures/README.md) - Static test data
- [Test Builders](../builders/README.md) - Dynamic test data
- [BDD Tests](../bdd/README.md) - Behavior-driven testing
