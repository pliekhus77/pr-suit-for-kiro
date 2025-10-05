/**
 * Unit Tests for Test Cleanup Utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestCleanupManager, globalCleanupManager } from './cleanup';

describe('TestCleanupManager', () => {
  let cleanup: TestCleanupManager;
  let testDir: string;
  
  beforeEach(() => {
    cleanup = new TestCleanupManager();
    testDir = path.join(__dirname, '../../test-workspace/cleanup-tests');
    
    // Ensure test directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  describe('File Cleanup', () => {
    it('should register and cleanup a temporary file', () => {
      // Arrange
      const tempFile = path.join(testDir, 'temp.txt');
      fs.writeFileSync(tempFile, 'test content');
      cleanup.registerTempFile(tempFile);
      
      // Act
      cleanup.cleanupFile(tempFile);
      
      // Assert
      expect(fs.existsSync(tempFile)).toBe(false);
    });
    
    it('should cleanup all registered files', () => {
      // Arrange
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');
      cleanup.registerTempFile(file1);
      cleanup.registerTempFile(file2);
      
      // Act
      cleanup.cleanupAllFiles();
      
      // Assert
      expect(fs.existsSync(file1)).toBe(false);
      expect(fs.existsSync(file2)).toBe(false);
    });
    
    it('should handle non-existent files gracefully', () => {
      // Arrange
      const nonExistentFile = path.join(testDir, 'does-not-exist.txt');
      
      // Act & Assert
      expect(() => cleanup.cleanupFile(nonExistentFile, { verbose: true })).not.toThrow();
    });
    
    it('should force cleanup locked files', () => {
      // Arrange
      const tempFile = path.join(testDir, 'locked.txt');
      fs.writeFileSync(tempFile, 'content');
      fs.chmodSync(tempFile, 0o444); // Read-only
      
      // Act
      cleanup.cleanupFile(tempFile, { force: true });
      
      // Assert
      expect(fs.existsSync(tempFile)).toBe(false);
    });
  });
  
  describe('Directory Cleanup', () => {
    it('should register and cleanup a temporary directory', () => {
      // Arrange
      const tempDir = path.join(testDir, 'temp-dir');
      fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(path.join(tempDir, 'file.txt'), 'content');
      cleanup.registerTempDir(tempDir);
      
      // Act
      cleanup.cleanupDirectory(tempDir);
      
      // Assert
      expect(fs.existsSync(tempDir)).toBe(false);
    });
    
    it('should cleanup all registered directories', () => {
      // Arrange
      const dir1 = path.join(testDir, 'dir1');
      const dir2 = path.join(testDir, 'dir2');
      fs.mkdirSync(dir1, { recursive: true });
      fs.mkdirSync(dir2, { recursive: true });
      cleanup.registerTempDir(dir1);
      cleanup.registerTempDir(dir2);
      
      // Act
      cleanup.cleanupAllDirectories();
      
      // Assert
      expect(fs.existsSync(dir1)).toBe(false);
      expect(fs.existsSync(dir2)).toBe(false);
    });
    
    it('should cleanup nested directories', () => {
      // Arrange
      const parentDir = path.join(testDir, 'parent');
      const childDir = path.join(parentDir, 'child');
      fs.mkdirSync(childDir, { recursive: true });
      fs.writeFileSync(path.join(childDir, 'file.txt'), 'content');
      cleanup.registerTempDir(parentDir);
      
      // Act
      cleanup.cleanupDirectory(parentDir);
      
      // Assert
      expect(fs.existsSync(parentDir)).toBe(false);
    });
  });
  
  describe('Backup and Restore', () => {
    it('should backup a file', () => {
      // Arrange
      const file = path.join(testDir, 'original.txt');
      const content = 'original content';
      fs.writeFileSync(file, content);
      
      // Act
      const backup = cleanup.backupFile(file);
      
      // Assert
      expect(fs.existsSync(backup.backupPath)).toBe(true);
      expect(fs.readFileSync(backup.backupPath, 'utf-8')).toBe(content);
      expect(backup.originalPath).toBe(file);
      expect(backup.size).toBeGreaterThan(0);
    });
    
    it('should restore a file from backup', () => {
      // Arrange
      const file = path.join(testDir, 'original.txt');
      const originalContent = 'original content';
      fs.writeFileSync(file, originalContent);
      cleanup.backupFile(file);
      
      // Modify file
      fs.writeFileSync(file, 'modified content');
      
      // Act
      cleanup.restoreFile(file);
      
      // Assert
      const restoredContent = fs.readFileSync(file, 'utf-8');
      expect(restoredContent).toBe(originalContent);
    });
    
    it('should backup a directory', () => {
      // Arrange
      const dir = path.join(testDir, 'original-dir');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'file1.txt'), 'content1');
      fs.writeFileSync(path.join(dir, 'file2.txt'), 'content2');
      
      // Act
      const backup = cleanup.backupDirectory(dir);
      
      // Assert
      expect(fs.existsSync(backup.backupPath)).toBe(true);
      expect(fs.existsSync(path.join(backup.backupPath, 'file1.txt'))).toBe(true);
      expect(fs.existsSync(path.join(backup.backupPath, 'file2.txt'))).toBe(true);
    });
    
    it('should restore a directory from backup', () => {
      // Arrange
      const dir = path.join(testDir, 'original-dir');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'file1.txt'), 'content1');
      cleanup.backupDirectory(dir);
      
      // Modify directory
      fs.unlinkSync(path.join(dir, 'file1.txt'));
      fs.writeFileSync(path.join(dir, 'file2.txt'), 'content2');
      
      // Act
      cleanup.restoreDirectory(dir);
      
      // Assert
      expect(fs.existsSync(path.join(dir, 'file1.txt'))).toBe(true);
      expect(fs.existsSync(path.join(dir, 'file2.txt'))).toBe(false);
    });
    
    it('should restore all backups', () => {
      // Arrange
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');
      cleanup.backupFile(file1);
      cleanup.backupFile(file2);
      
      // Modify files
      fs.writeFileSync(file1, 'modified1');
      fs.writeFileSync(file2, 'modified2');
      
      // Act
      cleanup.restoreAll();
      
      // Assert
      expect(fs.readFileSync(file1, 'utf-8')).toBe('content1');
      expect(fs.readFileSync(file2, 'utf-8')).toBe('content2');
    });
    
    it('should throw error when backing up non-existent file', () => {
      // Arrange
      const nonExistentFile = path.join(testDir, 'does-not-exist.txt');
      
      // Act & Assert
      expect(() => cleanup.backupFile(nonExistentFile)).toThrow();
    });
    
    it('should throw error when restoring without backup', () => {
      // Arrange
      const file = path.join(testDir, 'no-backup.txt');
      
      // Act & Assert
      expect(() => cleanup.restoreFile(file)).toThrow();
    });
  });
  
  describe('Workspace State Management', () => {
    it('should capture workspace state', () => {
      // Arrange
      const workspace = path.join(testDir, 'workspace');
      fs.mkdirSync(workspace, { recursive: true });
      fs.writeFileSync(path.join(workspace, 'file1.txt'), 'content1');
      fs.mkdirSync(path.join(workspace, 'subdir'), { recursive: true });
      fs.writeFileSync(path.join(workspace, 'subdir', 'file2.txt'), 'content2');
      
      // Act
      const state = cleanup.captureWorkspaceState(workspace);
      
      // Assert
      expect(state.rootPath).toBe(workspace);
      expect(state.files).toContain('file1.txt');
      expect(state.files).toContain(path.join('subdir', 'file2.txt'));
      expect(state.directories).toContain('subdir');
      expect(state.timestamp).toBeGreaterThan(0);
    });
    
    it('should reset workspace to captured state', () => {
      // Arrange
      const workspace = path.join(testDir, 'workspace');
      fs.mkdirSync(workspace, { recursive: true });
      fs.writeFileSync(path.join(workspace, 'original.txt'), 'content');
      cleanup.captureWorkspaceState(workspace);
      
      // Modify workspace
      fs.writeFileSync(path.join(workspace, 'new.txt'), 'new content');
      fs.unlinkSync(path.join(workspace, 'original.txt'));
      
      // Act
      cleanup.resetWorkspace(workspace);
      
      // Assert
      expect(fs.existsSync(path.join(workspace, 'new.txt'))).toBe(false);
      // Note: original.txt won't be restored (reset only removes new files)
    });
    
    it('should throw error when capturing non-existent workspace', () => {
      // Arrange
      const nonExistentWorkspace = path.join(testDir, 'does-not-exist');
      
      // Act & Assert
      expect(() => cleanup.captureWorkspaceState(nonExistentWorkspace)).toThrow();
    });
  });
  
  describe('Cleanup All', () => {
    it('should cleanup all files and directories', () => {
      // Arrange
      const file = path.join(testDir, 'file.txt');
      const dir = path.join(testDir, 'dir');
      fs.writeFileSync(file, 'content');
      fs.mkdirSync(dir, { recursive: true });
      cleanup.registerTempFile(file);
      cleanup.registerTempDir(dir);
      
      // Act
      cleanup.cleanupAll();
      
      // Assert
      expect(fs.existsSync(file)).toBe(false);
      expect(fs.existsSync(dir)).toBe(false);
    });
    
    it('should cleanup with backup option', () => {
      // Arrange
      const file = path.join(testDir, 'file.txt');
      fs.writeFileSync(file, 'content');
      cleanup.registerTempFile(file);
      
      // Act
      cleanup.cleanupAll({ backup: true });
      
      // Assert
      expect(fs.existsSync(file)).toBe(false);
      // Backup should exist
      const backupDir = path.join(testDir, '.backups');
      expect(fs.existsSync(backupDir)).toBe(true);
    });
  });
  
  describe('Statistics', () => {
    it('should return correct statistics', () => {
      // Arrange
      const file1 = path.join(testDir, 'file1.txt');
      const file2 = path.join(testDir, 'file2.txt');
      const dir1 = path.join(testDir, 'dir1');
      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');
      fs.mkdirSync(dir1, { recursive: true });
      
      cleanup.registerTempFile(file1);
      cleanup.registerTempFile(file2);
      cleanup.registerTempDir(dir1);
      cleanup.backupFile(file1);
      
      // Act
      const stats = cleanup.getStats();
      
      // Assert
      expect(stats.tempFiles).toBe(2);
      expect(stats.tempDirs).toBe(1);
      expect(stats.backups).toBe(1);
    });
  });
  
  describe('Reset', () => {
    it('should reset all state', () => {
      // Arrange
      const file = path.join(testDir, 'file.txt');
      fs.writeFileSync(file, 'content');
      cleanup.registerTempFile(file);
      cleanup.backupFile(file);
      
      // Act
      cleanup.reset();
      
      // Assert
      const stats = cleanup.getStats();
      expect(stats.tempFiles).toBe(0);
      expect(stats.tempDirs).toBe(0);
      expect(stats.backups).toBe(0);
    });
  });
  
  describe('Clear Operations', () => {
    it('should clear registry', () => {
      // Arrange
      cleanup.registerTempFile('/tmp/file.txt');
      cleanup.registerTempDir('/tmp/dir');
      
      // Act
      cleanup.clearRegistry();
      
      // Assert
      const stats = cleanup.getStats();
      expect(stats.tempFiles).toBe(0);
      expect(stats.tempDirs).toBe(0);
    });
    
    it('should clear backups without deleting files', () => {
      // Arrange
      const file = path.join(testDir, 'file.txt');
      fs.writeFileSync(file, 'content');
      const backup = cleanup.backupFile(file);
      
      // Act
      cleanup.clearBackups(false);
      
      // Assert
      expect(cleanup.getStats().backups).toBe(0);
      expect(fs.existsSync(backup.backupPath)).toBe(true);
    });
    
    it('should clear backups and delete files', () => {
      // Arrange
      const file = path.join(testDir, 'file.txt');
      fs.writeFileSync(file, 'content');
      const backup = cleanup.backupFile(file);
      
      // Act
      cleanup.clearBackups(true);
      
      // Assert
      expect(cleanup.getStats().backups).toBe(0);
      expect(fs.existsSync(backup.backupPath)).toBe(false);
    });
  });
});

describe('Global Cleanup Manager', () => {
  it('should provide a global instance', () => {
    expect(globalCleanupManager).toBeInstanceOf(TestCleanupManager);
  });
  
  it('should maintain state across calls', () => {
    // Arrange
    globalCleanupManager.reset();
    globalCleanupManager.registerTempFile('/tmp/test.txt');
    
    // Act
    const stats = globalCleanupManager.getStats();
    
    // Assert
    expect(stats.tempFiles).toBe(1);
    
    // Cleanup
    globalCleanupManager.reset();
  });
});
