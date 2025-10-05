/**
 * Jest Test Helpers
 * 
 * Provides Jest-specific helpers for automatic cleanup in test suites
 */

import { TestCleanupManager, CleanupOptions } from './cleanup';

/**
 * Setup automatic cleanup for Jest tests
 * 
 * @example
 * ```typescript
 * describe('MyTest', () => {
 *   const cleanup = setupTestCleanup();
 *   
 *   it('should do something', () => {
 *     const tempFile = '/tmp/test.txt';
 *     cleanup.registerTempFile(tempFile);
 *     // ... test code ...
 *     // File will be automatically cleaned up after test
 *   });
 * });
 * ```
 */
export function setupTestCleanup(options: CleanupOptions = {}): TestCleanupManager {
  const manager = new TestCleanupManager();
  
  // Cleanup after each test
  afterEach(() => {
    manager.cleanupAll(options);
  });
  
  // Reset manager after all tests
  afterAll(() => {
    manager.reset();
  });
  
  return manager;
}

/**
 * Setup automatic cleanup with backup/restore for Jest tests
 * 
 * @example
 * ```typescript
 * describe('MyTest', () => {
 *   const cleanup = setupTestCleanupWithBackup({ backupDir: '/tmp/backups' });
 *   
 *   it('should modify file', () => {
 *     const file = '/tmp/important.txt';
 *     cleanup.backupFile(file);
 *     // ... modify file ...
 *     // File will be restored after test
 *   });
 * });
 * ```
 */
export function setupTestCleanupWithBackup(options: CleanupOptions = {}): TestCleanupManager {
  const manager = new TestCleanupManager();
  
  // Cleanup after each test
  afterEach(() => {
    manager.cleanupAll(options);
  });
  
  // Restore backups after each test
  afterEach(() => {
    try {
      manager.restoreAll();
    } catch (error) {
      console.error('Error restoring backups:', error);
    }
  });
  
  // Clear backups and reset after all tests
  afterAll(() => {
    manager.clearBackups(true);
    manager.reset();
  });
  
  return manager;
}

/**
 * Setup workspace isolation for Jest tests
 * 
 * Captures workspace state before tests and resets after each test
 * 
 * @example
 * ```typescript
 * describe('MyTest', () => {
 *   const cleanup = setupWorkspaceIsolation('/path/to/workspace');
 *   
 *   it('should modify workspace', () => {
 *     // ... modify workspace ...
 *     // Workspace will be reset to original state after test
 *   });
 * });
 * ```
 */
export function setupWorkspaceIsolation(
  workspacePath: string,
  options: CleanupOptions = {}
): TestCleanupManager {
  const manager = new TestCleanupManager();
  
  // Capture initial state before all tests
  beforeAll(() => {
    manager.captureWorkspaceState(workspacePath);
  });
  
  // Reset workspace after each test
  afterEach(() => {
    try {
      manager.resetWorkspace(workspacePath);
    } catch (error) {
      console.error('Error resetting workspace:', error);
    }
  });
  
  // Cleanup after all tests
  afterAll(() => {
    manager.cleanupAll(options);
    manager.reset();
  });
  
  return manager;
}

/**
 * Create a temporary test directory that will be automatically cleaned up
 * 
 * @example
 * ```typescript
 * describe('MyTest', () => {
 *   const getTempDir = createTempTestDir();
 *   
 *   it('should use temp directory', () => {
 *     const tempDir = getTempDir();
 *     // ... use tempDir ...
 *     // Directory will be automatically cleaned up after test
 *   });
 * });
 * ```
 */
export function createTempTestDir(
  basePath: string = '/tmp/test',
  options: CleanupOptions = {}
): () => string {
  const manager = new TestCleanupManager();
  let counter = 0;
  
  // Cleanup after each test
  afterEach(() => {
    manager.cleanupAll(options);
  });
  
  // Reset after all tests
  afterAll(() => {
    manager.reset();
  });
  
  return () => {
    const tempDir = `${basePath}-${Date.now()}-${counter++}`;
    manager.registerTempDir(tempDir);
    return tempDir;
  };
}

/**
 * Create a temporary test file that will be automatically cleaned up
 * 
 * @example
 * ```typescript
 * describe('MyTest', () => {
 *   const getTempFile = createTempTestFile();
 *   
 *   it('should use temp file', () => {
 *     const tempFile = getTempFile('test.txt');
 *     // ... use tempFile ...
 *     // File will be automatically cleaned up after test
 *   });
 * });
 * ```
 */
export function createTempTestFile(
  basePath: string = '/tmp/test',
  options: CleanupOptions = {}
): (filename: string) => string {
  const manager = new TestCleanupManager();
  let counter = 0;
  
  // Cleanup after each test
  afterEach(() => {
    manager.cleanupAll(options);
  });
  
  // Reset after all tests
  afterAll(() => {
    manager.reset();
  });
  
  return (filename: string) => {
    const tempFile = `${basePath}-${Date.now()}-${counter++}-${filename}`;
    manager.registerTempFile(tempFile);
    return tempFile;
  };
}
