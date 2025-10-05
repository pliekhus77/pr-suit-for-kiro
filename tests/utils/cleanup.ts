/**
 * Test Data Cleanup Utilities
 * 
 * Provides utilities for cleaning up temporary test files, backing up/restoring
 * test data, and resetting test workspaces to ensure test isolation.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Options for cleanup operations
 */
export interface CleanupOptions {
  /**
   * Whether to force cleanup even if files are locked
   */
  force?: boolean;
  
  /**
   * Whether to create a backup before cleanup
   */
  backup?: boolean;
  
  /**
   * Directory to store backups
   */
  backupDir?: string;
  
  /**
   * Whether to log cleanup operations
   */
  verbose?: boolean;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  /**
   * Original path that was backed up
   */
  originalPath: string;
  
  /**
   * Backup path
   */
  backupPath: string;
  
  /**
   * Timestamp when backup was created
   */
  timestamp: number;
  
  /**
   * Size of backed up data in bytes
   */
  size: number;
}

/**
 * Test workspace state
 */
export interface WorkspaceState {
  /**
   * Workspace root path
   */
  rootPath: string;
  
  /**
   * Files in the workspace
   */
  files: string[];
  
  /**
   * Directories in the workspace
   */
  directories: string[];
  
  /**
   * Timestamp when state was captured
   */
  timestamp: number;
}

/**
 * Cleanup manager for test data
 */
export class TestCleanupManager {
  private backups: Map<string, BackupMetadata> = new Map();
  private tempFiles: Set<string> = new Set();
  private tempDirs: Set<string> = new Set();
  private workspaceStates: Map<string, WorkspaceState> = new Map();
  
  /**
   * Register a temporary file for cleanup
   */
  registerTempFile(filePath: string): void {
    this.tempFiles.add(filePath);
  }
  
  /**
   * Register a temporary directory for cleanup
   */
  registerTempDir(dirPath: string): void {
    this.tempDirs.add(dirPath);
  }
  
  /**
   * Clean up a specific file
   */
  cleanupFile(filePath: string, options: CleanupOptions = {}): void {
    if (!fs.existsSync(filePath)) {
      if (options.verbose) {
        console.log(`File does not exist, skipping: ${filePath}`);
      }
      return;
    }
    
    try {
      // Create backup if requested
      if (options.backup) {
        this.backupFile(filePath, options.backupDir);
      }
      
      // Delete the file
      fs.unlinkSync(filePath);
      
      if (options.verbose) {
        console.log(`Cleaned up file: ${filePath}`);
      }
      
      // Remove from temp files set
      this.tempFiles.delete(filePath);
    } catch (error) {
      if (options.force) {
        // Try harder to delete
        try {
          fs.chmodSync(filePath, 0o666);
          fs.unlinkSync(filePath);
        } catch (retryError) {
          console.error(`Failed to cleanup file: ${filePath}`, retryError);
        }
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Clean up a specific directory
   */
  cleanupDirectory(dirPath: string, options: CleanupOptions = {}): void {
    if (!fs.existsSync(dirPath)) {
      if (options.verbose) {
        console.log(`Directory does not exist, skipping: ${dirPath}`);
      }
      return;
    }
    
    try {
      // Create backup if requested
      if (options.backup) {
        this.backupDirectory(dirPath, options.backupDir);
      }
      
      // Delete the directory recursively
      fs.rmSync(dirPath, { recursive: true, force: options.force || false });
      
      if (options.verbose) {
        console.log(`Cleaned up directory: ${dirPath}`);
      }
      
      // Remove from temp dirs set
      this.tempDirs.delete(dirPath);
    } catch (error) {
      if (options.force) {
        // Try harder to delete
        try {
          this.forceDeleteDirectory(dirPath);
        } catch (retryError) {
          console.error(`Failed to cleanup directory: ${dirPath}`, retryError);
        }
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Clean up all registered temporary files
   */
  cleanupAllFiles(options: CleanupOptions = {}): void {
    const files = Array.from(this.tempFiles);
    
    for (const filePath of files) {
      try {
        this.cleanupFile(filePath, options);
      } catch (error) {
        console.error(`Error cleaning up file: ${filePath}`, error);
      }
    }
  }
  
  /**
   * Clean up all registered temporary directories
   */
  cleanupAllDirectories(options: CleanupOptions = {}): void {
    const dirs = Array.from(this.tempDirs);
    
    for (const dirPath of dirs) {
      try {
        this.cleanupDirectory(dirPath, options);
      } catch (error) {
        console.error(`Error cleaning up directory: ${dirPath}`, error);
      }
    }
  }
  
  /**
   * Clean up all registered temporary files and directories
   */
  cleanupAll(options: CleanupOptions = {}): void {
    this.cleanupAllFiles(options);
    this.cleanupAllDirectories(options);
  }
  
  /**
   * Backup a file
   */
  backupFile(filePath: string, backupDir?: string): BackupMetadata {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Cannot backup non-existent file: ${filePath}`);
    }
    
    const timestamp = Date.now();
    const fileName = path.basename(filePath);
    const backupDirPath = backupDir || path.join(path.dirname(filePath), '.backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    const backupPath = path.join(backupDirPath, `${fileName}.${timestamp}.bak`);
    
    // Copy file to backup location
    fs.copyFileSync(filePath, backupPath);
    
    const stats = fs.statSync(backupPath);
    const metadata: BackupMetadata = {
      originalPath: filePath,
      backupPath: backupPath,
      timestamp: timestamp,
      size: stats.size
    };
    
    this.backups.set(filePath, metadata);
    
    return metadata;
  }
  
  /**
   * Backup a directory
   */
  backupDirectory(dirPath: string, backupDir?: string): BackupMetadata {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Cannot backup non-existent directory: ${dirPath}`);
    }
    
    const timestamp = Date.now();
    const dirName = path.basename(dirPath);
    const backupDirPath = backupDir || path.join(path.dirname(dirPath), '.backups');
    
    // Ensure backup directory exists
    if (!fs.existsSync(backupDirPath)) {
      fs.mkdirSync(backupDirPath, { recursive: true });
    }
    
    const backupPath = path.join(backupDirPath, `${dirName}.${timestamp}.bak`);
    
    // Copy directory recursively
    this.copyDirectoryRecursive(dirPath, backupPath);
    
    const size = this.getDirectorySize(backupPath);
    const metadata: BackupMetadata = {
      originalPath: dirPath,
      backupPath: backupPath,
      timestamp: timestamp,
      size: size
    };
    
    this.backups.set(dirPath, metadata);
    
    return metadata;
  }
  
  /**
   * Restore a file from backup
   */
  restoreFile(filePath: string): void {
    const metadata = this.backups.get(filePath);
    
    if (!metadata) {
      throw new Error(`No backup found for: ${filePath}`);
    }
    
    if (!fs.existsSync(metadata.backupPath)) {
      throw new Error(`Backup file does not exist: ${metadata.backupPath}`);
    }
    
    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    
    // Copy backup back to original location
    fs.copyFileSync(metadata.backupPath, filePath);
  }
  
  /**
   * Restore a directory from backup
   */
  restoreDirectory(dirPath: string): void {
    const metadata = this.backups.get(dirPath);
    
    if (!metadata) {
      throw new Error(`No backup found for: ${dirPath}`);
    }
    
    if (!fs.existsSync(metadata.backupPath)) {
      throw new Error(`Backup directory does not exist: ${metadata.backupPath}`);
    }
    
    // Remove existing directory if it exists
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
    
    // Copy backup back to original location
    this.copyDirectoryRecursive(metadata.backupPath, dirPath);
  }
  
  /**
   * Restore all backups
   */
  restoreAll(): void {
    for (const [originalPath, metadata] of this.backups) {
      try {
        if (fs.statSync(metadata.backupPath).isDirectory()) {
          this.restoreDirectory(originalPath);
        } else {
          this.restoreFile(originalPath);
        }
      } catch (error) {
        console.error(`Error restoring: ${originalPath}`, error);
      }
    }
  }
  
  /**
   * Capture the current state of a workspace
   */
  captureWorkspaceState(workspacePath: string): WorkspaceState {
    if (!fs.existsSync(workspacePath)) {
      throw new Error(`Workspace does not exist: ${workspacePath}`);
    }
    
    const files: string[] = [];
    const directories: string[] = [];
    
    this.scanDirectory(workspacePath, workspacePath, files, directories);
    
    const state: WorkspaceState = {
      rootPath: workspacePath,
      files: files,
      directories: directories,
      timestamp: Date.now()
    };
    
    this.workspaceStates.set(workspacePath, state);
    
    return state;
  }
  
  /**
   * Reset workspace to a previously captured state
   */
  resetWorkspace(workspacePath: string): void {
    const state = this.workspaceStates.get(workspacePath);
    
    if (!state) {
      throw new Error(`No state captured for workspace: ${workspacePath}`);
    }
    
    // Remove all files and directories not in the captured state
    if (fs.existsSync(workspacePath)) {
      const currentFiles: string[] = [];
      const currentDirs: string[] = [];
      this.scanDirectory(workspacePath, workspacePath, currentFiles, currentDirs);
      
      // Remove files not in original state
      for (const file of currentFiles) {
        if (!state.files.includes(file)) {
          const fullPath = path.join(workspacePath, file);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
      
      // Remove directories not in original state (in reverse order)
      for (const dir of currentDirs.reverse()) {
        if (!state.directories.includes(dir)) {
          const fullPath = path.join(workspacePath, dir);
          if (fs.existsSync(fullPath)) {
            try {
              fs.rmdirSync(fullPath);
            } catch (error) {
              // Directory might not be empty, skip
            }
          }
        }
      }
    }
  }
  
  /**
   * Clear all backups
   */
  clearBackups(deleteFiles: boolean = false): void {
    if (deleteFiles) {
      for (const metadata of this.backups.values()) {
        try {
          if (fs.existsSync(metadata.backupPath)) {
            if (fs.statSync(metadata.backupPath).isDirectory()) {
              fs.rmSync(metadata.backupPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(metadata.backupPath);
            }
          }
        } catch (error) {
          console.error(`Error deleting backup: ${metadata.backupPath}`, error);
        }
      }
    }
    
    this.backups.clear();
  }
  
  /**
   * Clear all registered temporary files and directories
   */
  clearRegistry(): void {
    this.tempFiles.clear();
    this.tempDirs.clear();
  }
  
  /**
   * Clear all workspace states
   */
  clearWorkspaceStates(): void {
    this.workspaceStates.clear();
  }
  
  /**
   * Reset the cleanup manager
   */
  reset(): void {
    this.clearRegistry();
    this.clearBackups(false);
    this.clearWorkspaceStates();
  }
  
  /**
   * Get statistics about registered items
   */
  getStats() {
    return {
      tempFiles: this.tempFiles.size,
      tempDirs: this.tempDirs.size,
      backups: this.backups.size,
      workspaceStates: this.workspaceStates.size
    };
  }
  
  // Private helper methods
  
  private forceDeleteDirectory(dirPath: string): void {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.forceDeleteDirectory(filePath);
      } else {
        try {
          fs.chmodSync(filePath, 0o666);
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete file: ${filePath}`, error);
        }
      }
    }
    
    try {
      fs.rmdirSync(dirPath);
    } catch (error) {
      console.error(`Failed to delete directory: ${dirPath}`, error);
    }
  }
  
  private copyDirectoryRecursive(source: string, destination: string): void {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        this.copyDirectoryRecursive(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }
  
  private getDirectorySize(dirPath: string): number {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
    
    return size;
  }
  
  private scanDirectory(
    rootPath: string,
    currentPath: string,
    files: string[],
    directories: string[]
  ): void {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const relativePath = path.relative(rootPath, itemPath);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        directories.push(relativePath);
        this.scanDirectory(rootPath, itemPath, files, directories);
      } else {
        files.push(relativePath);
      }
    }
  }
}

/**
 * Global cleanup manager instance
 */
export const globalCleanupManager = new TestCleanupManager();

/**
 * Automatic cleanup decorator for test functions
 */
export function withCleanup(options: CleanupOptions = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const manager = new TestCleanupManager();
      
      try {
        // Execute the test
        return await originalMethod.apply(this, [...args, manager]);
      } finally {
        // Cleanup after test
        manager.cleanupAll(options);
      }
    };
    
    return descriptor;
  };
}
