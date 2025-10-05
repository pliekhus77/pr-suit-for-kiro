/**
 * Unit Tests for Jest Helper Functions
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  setupTestCleanup,
  setupTestCleanupWithBackup,
  setupWorkspaceIsolation,
  createTempTestDir,
  createTempTestFile
} from './jest-helpers';

describe('Jest Helpers', () => {
  const testBaseDir = path.join(__dirname, '../../test-workspace/jest-helpers-tests');
  
  beforeAll(() => {
    // Ensure test base directory exists
    if (!fs.existsSync(testBaseDir)) {
      fs.mkdirSync(testBaseDir, { recursive: true });
    }
  });
  
  afterAll(() => {
    // Clean up test base directory
    if (fs.existsSync(testBaseDir)) {
      fs.rmSync(testBaseDir, { recursive: true, force: true });
    }
  });
  
  describe('setupTestCleanup', () => {
    it('should provide cleanup manager', () => {
      const cleanup = setupTestCleanup();
      expect(cleanup).toBeDefined();
      expect(typeof cleanup.registerTempFile).toBe('function');
    });
    
    it('should cleanup registered files after test', () => {
      const cleanup = setupTestCleanup();
      const tempFile = path.join(testBaseDir, 'setup-cleanup-test.txt');
      
      fs.writeFileSync(tempFile, 'test content');
      cleanup.registerTempFile(tempFile);
      
      expect(fs.existsSync(tempFile)).toBe(true);
      
      // File will be cleaned up by afterEach hook
    });
  });
  
  describe('setupTestCleanupWithBackup', () => {
    it('should provide cleanup manager with backup', () => {
      const cleanup = setupTestCleanupWithBackup();
      expect(cleanup).toBeDefined();
      expect(typeof cleanup.backupFile).toBe('function');
    });
    
    it('should backup and restore files', () => {
      const cleanup = setupTestCleanupWithBackup();
      const file = path.join(testBaseDir, 'backup-test.txt');
      const originalContent = 'original content';
      
      fs.writeFileSync(file, originalContent);
      cleanup.backupFile(file);
      
      // Modify file
      fs.writeFileSync(file, 'modified content');
      
      // File will be restored by afterEach hook
    });
  });
  
  describe('setupWorkspaceIsolation', () => {
    const workspacePath = path.join(testBaseDir, 'isolated-workspace');
    
    beforeAll(() => {
      // Create workspace with initial files
      if (!fs.existsSync(workspacePath)) {
        fs.mkdirSync(workspacePath, { recursive: true });
      }
      fs.writeFileSync(path.join(workspacePath, 'original.txt'), 'original');
    });
    
    it('should provide cleanup manager for workspace', () => {
      const cleanup = setupWorkspaceIsolation(workspacePath);
      expect(cleanup).toBeDefined();
    });
    
    it('should isolate workspace modifications', () => {
      setupWorkspaceIsolation(workspacePath);
      
      // Add new file
      const newFile = path.join(workspacePath, 'new.txt');
      fs.writeFileSync(newFile, 'new content');
      
      expect(fs.existsSync(newFile)).toBe(true);
      
      // Workspace will be reset by afterEach hook
    });
  });
  
  describe('createTempTestDir', () => {
    it('should create unique temporary directories', () => {
      const getTempDir = createTempTestDir(path.join(testBaseDir, 'temp-dirs'));
      
      const dir1 = getTempDir();
      const dir2 = getTempDir();
      
      expect(dir1).not.toBe(dir2);
      expect(dir1).toContain('temp-dirs');
      expect(dir2).toContain('temp-dirs');
    });
    
    it('should register directories for cleanup', () => {
      const getTempDir = createTempTestDir(path.join(testBaseDir, 'temp-dirs-cleanup'));
      
      const tempDir = getTempDir();
      fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(path.join(tempDir, 'file.txt'), 'content');
      
      expect(fs.existsSync(tempDir)).toBe(true);
      
      // Directory will be cleaned up by afterEach hook
    });
  });
  
  describe('createTempTestFile', () => {
    it('should create unique temporary file paths', () => {
      const getTempFile = createTempTestFile(path.join(testBaseDir, 'temp-files'));
      
      const file1 = getTempFile('test1.txt');
      const file2 = getTempFile('test2.txt');
      
      expect(file1).not.toBe(file2);
      expect(file1).toContain('test1.txt');
      expect(file2).toContain('test2.txt');
    });
    
    it('should register files for cleanup', () => {
      const getTempFile = createTempTestFile(path.join(testBaseDir, 'temp-files-cleanup'));
      
      const tempFile = getTempFile('test.txt');
      fs.writeFileSync(tempFile, 'test content');
      
      expect(fs.existsSync(tempFile)).toBe(true);
      
      // File will be cleaned up by afterEach hook
    });
  });
  
  describe('Integration Tests', () => {
    it('should work with multiple cleanup managers', () => {
      const cleanup1 = setupTestCleanup();
      const cleanup2 = setupTestCleanup();
      
      const file1 = path.join(testBaseDir, 'multi-cleanup-1.txt');
      const file2 = path.join(testBaseDir, 'multi-cleanup-2.txt');
      
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');
      
      cleanup1.registerTempFile(file1);
      cleanup2.registerTempFile(file2);
      
      expect(fs.existsSync(file1)).toBe(true);
      expect(fs.existsSync(file2)).toBe(true);
      
      // Both files will be cleaned up by their respective afterEach hooks
    });
    
    it('should handle nested test suites', () => {
      const cleanup = setupTestCleanup();
      
      describe('Nested Suite', () => {
        it('should use parent cleanup', () => {
          const tempFile = path.join(testBaseDir, 'nested-test.txt');
          fs.writeFileSync(tempFile, 'nested content');
          cleanup.registerTempFile(tempFile);
          
          expect(fs.existsSync(tempFile)).toBe(true);
        });
      });
    });
  });
});
