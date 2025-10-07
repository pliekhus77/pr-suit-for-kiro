import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * File system operations utility class
 * Provides abstraction over file system operations with proper error handling
 */
export class FileSystemOperations {
  /**
   * Ensure a directory exists, creating it and parent directories if necessary
   */
  async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw new Error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Check if a directory exists
   */
  async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath);
      return stat.isDirectory();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * List files in a directory, optionally filtered by pattern
   * Pattern can be a glob pattern (e.g., '*.md') or a regex pattern
   */
  async listFiles(directory: string, pattern?: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      let files = entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name);

      if (pattern) {
        // Convert glob pattern to regex if it looks like a glob
        let regex: RegExp;
        if (pattern.includes('*') || pattern.includes('?')) {
          // Convert glob to regex: * -> .*, ? -> ., escape other special chars
          const regexPattern = pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
            .replace(/\*/g, '.*')                  // * -> .*
            .replace(/\?/g, '.');                  // ? -> .
          regex = new RegExp(`^${regexPattern}$`);
        } else {
          // Use as-is regex pattern
          regex = new RegExp(pattern);
        }
        files = files.filter(file => regex.test(file));
      }

      return files;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to list files in ${directory}: ${(error as Error).message}`);
    }
  }

  /**
   * Read file content as string
   */
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Ensure parent directory exists
      const dir = path.dirname(filePath);
      await this.ensureDirectory(dir);
      
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(`Permission denied writing to ${filePath}`);
      }
      throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
    }
  }

  /**
   * Copy a file from source to destination
   */
  async copyFile(source: string, destination: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const dir = path.dirname(destination);
      await this.ensureDirectory(dir);
      
      await fs.copyFile(source, destination);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Source file not found: ${source}`);
      }
      throw new Error(`Failed to copy file from ${source} to ${destination}: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, consider it deleted
        return;
      }
      throw new Error(`Failed to delete file ${filePath}: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath);
      return stat.isFile();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the workspace root path
   */
  getWorkspacePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }
    return workspaceFolders[0].uri.fsPath;
  }

  /**
   * Get the .kiro directory path
   */
  getKiroPath(): string | undefined {
    const workspacePath = this.getWorkspacePath();
    if (!workspacePath) {
      return undefined;
    }
    return path.join(workspacePath, '.kiro');
  }

  /**
   * Get the .kiro/steering directory path
   */
  getSteeringPath(): string {
    const kiroPath = this.getKiroPath();
    if (!kiroPath) {
      throw new Error('No workspace open or .kiro directory not found');
    }
    return path.join(kiroPath, 'steering');
  }

  /**
   * Get the frameworks directory path
   */
  getFrameworksPath(): string {
    const workspacePath = this.getWorkspacePath();
    if (!workspacePath) {
      throw new Error('No workspace open');
    }
    return path.join(workspacePath, 'frameworks');
  }

  /**
   * Get the .kiro/.metadata directory path
   */
  getMetadataPath(): string {
    const kiroPath = this.getKiroPath();
    if (!kiroPath) {
      throw new Error('No workspace open or .kiro directory not found');
    }
    return path.join(kiroPath, '.metadata');
  }

  /**
   * Get the .kiro/specs directory path
   */
  getSpecsPath(): string {
    const kiroPath = this.getKiroPath();
    if (!kiroPath) {
      throw new Error('No workspace open or .kiro directory not found');
    }
    return path.join(kiroPath, 'specs');
  }

  /**
   * Get the .kiro/settings directory path
   */
  getSettingsPath(): string {
    const kiroPath = this.getKiroPath();
    if (!kiroPath) {
      throw new Error('No workspace open or .kiro directory not found');
    }
    return path.join(kiroPath, 'settings');
  }
}
