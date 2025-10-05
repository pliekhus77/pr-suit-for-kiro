import { FileSystemOperations } from '../file-system';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import type { Stats } from 'fs';
import * as path from 'path';

// Mock fs/promises module
jest.mock('fs/promises');

describe('FileSystemOperations', () => {
  let fileSystem: FileSystemOperations;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    fileSystem = new FileSystemOperations();
    mockFs = fs as jest.Mocked<typeof fs>;
    jest.clearAllMocks();
  });

  describe('ensureDirectory', () => {
    it('should create directory with recursive option', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      await fileSystem.ensureDirectory('/test/path');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/path', { recursive: true });
    });

    it('should not throw error if directory already exists (EEXIST)', async () => {
      const error = new Error('Directory exists') as NodeJS.ErrnoException;
      error.code = 'EEXIST';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('/test/path')).resolves.not.toThrow();
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('/test/path'))
        .rejects.toThrow('Failed to create directory /test/path: Permission denied');
    });
  });

  describe('directoryExists', () => {
    it('should return true if directory exists', async () => {
      const mockStats = {
        isDirectory: () => true,
        isFile: () => false
      } as Stats;
      mockFs.stat.mockResolvedValue(mockStats);

      const result = await fileSystem.directoryExists('/test/path');

      expect(result).toBe(true);
      expect(mockFs.stat).toHaveBeenCalledWith('/test/path');
    });

    it('should return false if path is a file', async () => {
      const mockStats = {
        isDirectory: () => false,
        isFile: () => true
      } as Stats;
      mockFs.stat.mockResolvedValue(mockStats);

      const result = await fileSystem.directoryExists('/test/file.txt');

      expect(result).toBe(false);
    });

    it('should return false if directory does not exist (ENOENT)', async () => {
      const error = new Error('Not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.stat.mockRejectedValue(error);

      const result = await fileSystem.directoryExists('/test/path');

      expect(result).toBe(false);
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.stat.mockRejectedValue(error);

      await expect(fileSystem.directoryExists('/test/path')).rejects.toThrow();
    });
  });

  describe('listFiles', () => {
    it('should list all files in directory', async () => {
      const mockDirents = [
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'file2.md', isFile: () => true, isDirectory: () => false },
        { name: 'subdir', isFile: () => false, isDirectory: () => true }
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(mockDirents as any);

      const result = await fileSystem.listFiles('/test/path');

      expect(result).toEqual(['file1.txt', 'file2.md']);
      expect(mockFs.readdir).toHaveBeenCalledWith('/test/path', { withFileTypes: true });
    });

    it('should filter files by pattern', async () => {
      const mockDirents = [
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'file2.md', isFile: () => true, isDirectory: () => false },
        { name: 'file3.txt', isFile: () => true, isDirectory: () => false }
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(mockDirents as any);

      const result = await fileSystem.listFiles('/test/path', '\\.md$');

      expect(result).toEqual(['file2.md']);
    });

    it('should return empty array if directory does not exist (ENOENT)', async () => {
      const error = new Error('Not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readdir.mockRejectedValue(error);

      const result = await fileSystem.listFiles('/test/path');

      expect(result).toEqual([]);
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.readdir.mockRejectedValue(error);

      await expect(fileSystem.listFiles('/test/path'))
        .rejects.toThrow('Failed to list files in /test/path: Permission denied');
    });
  });

  describe('readFile', () => {
    it('should read file content as string', async () => {
      mockFs.readFile.mockResolvedValue('file content');

      const result = await fileSystem.readFile('/test/file.txt');

      expect(result).toBe('file content');
      expect(mockFs.readFile).toHaveBeenCalledWith('/test/file.txt', 'utf-8');
    });

    it('should throw error if file not found (ENOENT)', async () => {
      const error = new Error('Not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/test/file.txt'))
        .rejects.toThrow('File not found: /test/file.txt');
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/test/file.txt'))
        .rejects.toThrow('Failed to read file /test/file.txt: Permission denied');
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/path/file.txt', 'content');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/path', { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/path/file.txt', 'content', 'utf-8');
    });

    it('should throw error if permission denied (EACCES)', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.writeFile.mockRejectedValue(error);

      await expect(fileSystem.writeFile('/test/file.txt', 'content'))
        .rejects.toThrow('Permission denied writing to /test/file.txt');
    });

    it('should throw error for other failures', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Disk full') as NodeJS.ErrnoException;
      error.code = 'ENOSPC';
      mockFs.writeFile.mockRejectedValue(error);

      await expect(fileSystem.writeFile('/test/file.txt', 'content'))
        .rejects.toThrow('Failed to write file /test/file.txt: Disk full');
    });
  });

  describe('copyFile', () => {
    it('should copy file from source to destination', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      await fileSystem.copyFile('/source/file.txt', '/dest/file.txt');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/dest', { recursive: true });
      expect(mockFs.copyFile).toHaveBeenCalledWith('/source/file.txt', '/dest/file.txt');
    });

    it('should throw error if source file not found (ENOENT)', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.copyFile.mockRejectedValue(error);

      await expect(fileSystem.copyFile('/source/file.txt', '/dest/file.txt'))
        .rejects.toThrow('Source file not found: /source/file.txt');
    });

    it('should throw error for other failures', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.copyFile.mockRejectedValue(error);

      await expect(fileSystem.copyFile('/source/file.txt', '/dest/file.txt'))
        .rejects.toThrow('Failed to copy file from /source/file.txt to /dest/file.txt: Permission denied');
    });
  });

  describe('deleteFile', () => {
    it('should delete file', async () => {
      mockFs.unlink.mockResolvedValue(undefined);

      await fileSystem.deleteFile('/test/file.txt');

      expect(mockFs.unlink).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should not throw error if file does not exist (ENOENT)', async () => {
      const error = new Error('Not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.unlink.mockRejectedValue(error);

      await expect(fileSystem.deleteFile('/test/file.txt')).resolves.not.toThrow();
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.unlink.mockRejectedValue(error);

      await expect(fileSystem.deleteFile('/test/file.txt'))
        .rejects.toThrow('Failed to delete file /test/file.txt: Permission denied');
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      const mockStats = {
        isFile: () => true,
        isDirectory: () => false
      } as Stats;
      mockFs.stat.mockResolvedValue(mockStats);

      const result = await fileSystem.fileExists('/test/file.txt');

      expect(result).toBe(true);
      expect(mockFs.stat).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should return false if path is a directory', async () => {
      const mockStats = {
        isFile: () => false,
        isDirectory: () => true
      } as Stats;
      mockFs.stat.mockResolvedValue(mockStats);

      const result = await fileSystem.fileExists('/test/path');

      expect(result).toBe(false);
    });

    it('should return false if file does not exist (ENOENT)', async () => {
      const error = new Error('Not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.stat.mockRejectedValue(error);

      const result = await fileSystem.fileExists('/test/file.txt');

      expect(result).toBe(false);
    });

    it('should throw error for other failures', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.stat.mockRejectedValue(error);

      await expect(fileSystem.fileExists('/test/file.txt')).rejects.toThrow();
    });
  });

  describe('getWorkspacePath', () => {
    it('should return workspace path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getWorkspacePath();

      expect(result).toBe('/workspace/path');
    });

    it('should return undefined if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      const result = fileSystem.getWorkspacePath();

      expect(result).toBeUndefined();
    });

    it('should return undefined if workspace folders array is empty', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [];

      const result = fileSystem.getWorkspacePath();

      expect(result).toBeUndefined();
    });

    it('should return first workspace folder if multiple exist', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path1' } } as vscode.WorkspaceFolder,
        { uri: { fsPath: '/workspace/path2' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getWorkspacePath();

      expect(result).toBe('/workspace/path1');
    });
  });

  describe('getKiroPath', () => {
    it('should return .kiro path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getKiroPath();

      expect(result).toBe(path.join('/workspace/path', '.kiro'));
    });

    it('should return undefined if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      const result = fileSystem.getKiroPath();

      expect(result).toBeUndefined();
    });
  });

  describe('getSteeringPath', () => {
    it('should return steering path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getSteeringPath();

      expect(result).toBe(path.join('/workspace/path', '.kiro', 'steering'));
    });

    it('should throw error if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      expect(() => fileSystem.getSteeringPath())
        .toThrow('No workspace open or .kiro directory not found');
    });
  });

  describe('getFrameworksPath', () => {
    it('should return frameworks path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getFrameworksPath();

      expect(result).toBe(path.join('/workspace/path', 'frameworks'));
    });

    it('should throw error if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      expect(() => fileSystem.getFrameworksPath())
        .toThrow('No workspace open');
    });
  });

  describe('getMetadataPath', () => {
    it('should return metadata path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getMetadataPath();

      expect(result).toBe(path.join('/workspace/path', '.kiro', '.metadata'));
    });

    it('should throw error if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      expect(() => fileSystem.getMetadataPath())
        .toThrow('No workspace open or .kiro directory not found');
    });
  });

  describe('getSpecsPath', () => {
    it('should return specs path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getSpecsPath();

      expect(result).toBe(path.join('/workspace/path', '.kiro', 'specs'));
    });

    it('should throw error if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      expect(() => fileSystem.getSpecsPath())
        .toThrow('No workspace open or .kiro directory not found');
    });
  });

  describe('getSettingsPath', () => {
    it('should return settings path if workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace/path' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getSettingsPath();

      expect(result).toBe(path.join('/workspace/path', '.kiro', 'settings'));
    });

    it('should throw error if no workspace is open', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      expect(() => fileSystem.getSettingsPath())
        .toThrow('No workspace open or .kiro directory not found');
    });
  });

  // Task 13.1: Comprehensive unit tests for FileSystemOperations
  describe('ensureDirectory - comprehensive', () => {
    it('should handle EPERM error', async () => {
      const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
      error.code = 'EPERM';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('/test/path'))
        .rejects.toThrow('Failed to create directory /test/path: Operation not permitted');
    });

    it('should create nested directories', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      await fileSystem.ensureDirectory('/test/deep/nested/path');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/deep/nested/path', { recursive: true });
    });

    it('should handle very deep directory structures', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const deepPath = '/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p';

      await fileSystem.ensureDirectory(deepPath);

      expect(mockFs.mkdir).toHaveBeenCalledWith(deepPath, { recursive: true });
    });
  });

  describe('readFile - comprehensive', () => {
    it('should handle EACCES error', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/test/file.txt'))
        .rejects.toThrow('Failed to read file /test/file.txt: Permission denied');
    });

    it('should handle invalid encoding gracefully', async () => {
      const error = new Error('Invalid encoding') as NodeJS.ErrnoException;
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/test/file.txt'))
        .rejects.toThrow('Failed to read file /test/file.txt: Invalid encoding');
    });

    it('should read files with UTF-8 encoding', async () => {
      mockFs.readFile.mockResolvedValue('UTF-8 content with émojis 🎉');

      const result = await fileSystem.readFile('/test/file.txt');

      expect(result).toBe('UTF-8 content with émojis 🎉');
      expect(mockFs.readFile).toHaveBeenCalledWith('/test/file.txt', 'utf-8');
    });
  });

  describe('writeFile - comprehensive', () => {
    it('should handle special characters in filenames', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/file with spaces & special!.txt', 'content');

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/test/file with spaces & special!.txt',
        'content',
        'utf-8'
      );
    });

    it('should handle Unicode characters in filenames', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/文件名.txt', 'content');

      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/文件名.txt', 'content', 'utf-8');
    });

    it('should handle emoji in filenames', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/file-🎉.txt', 'content');

      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/file-🎉.txt', 'content', 'utf-8');
    });

    it('should create parent directory before writing', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/nested/deep/file.txt', 'content');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/test/nested/deep', { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/nested/deep/file.txt', 'content', 'utf-8');
    });
  });

  describe('getKiroPath - edge cases', () => {
    it('should return undefined when no workspace folders exist', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      const result = fileSystem.getKiroPath();

      expect(result).toBeUndefined();
    });

    it('should return undefined when workspace folders is empty array', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [];

      const result = fileSystem.getKiroPath();

      expect(result).toBeUndefined();
    });

    it('should handle multiple workspace folders by using first', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace1' } } as vscode.WorkspaceFolder,
        { uri: { fsPath: '/workspace2' } } as vscode.WorkspaceFolder,
        { uri: { fsPath: '/workspace3' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getKiroPath();

      expect(result).toBe(path.join('/workspace1', '.kiro'));
    });

    it('should handle workspace path with special characters', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: '/workspace with spaces/project-name' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getKiroPath();

      expect(result).toBe(path.join('/workspace with spaces/project-name', '.kiro'));
    });
  });

  describe('atomic operations and race conditions', () => {
    it('should handle concurrent ensureDirectory calls', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      const promises = [
        fileSystem.ensureDirectory('/test/path'),
        fileSystem.ensureDirectory('/test/path'),
        fileSystem.ensureDirectory('/test/path')
      ];

      await Promise.all(promises);

      // All calls should succeed
      expect(mockFs.mkdir).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent writeFile calls to same directory', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const promises = [
        fileSystem.writeFile('/test/file1.txt', 'content1'),
        fileSystem.writeFile('/test/file2.txt', 'content2'),
        fileSystem.writeFile('/test/file3.txt', 'content3')
      ];

      await Promise.all(promises);

      expect(mockFs.writeFile).toHaveBeenCalledTimes(3);
    });

    it('should handle race condition when directory is created between check and create', async () => {
      const error = new Error('Directory exists') as NodeJS.ErrnoException;
      error.code = 'EEXIST';
      mockFs.mkdir.mockRejectedValue(error);

      // Should not throw even if directory was created by another process
      await expect(fileSystem.ensureDirectory('/test/path')).resolves.not.toThrow();
    });
  });

  describe('edge cases - empty and whitespace', () => {
    it('should handle empty file content', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/empty.txt', '');

      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/empty.txt', '', 'utf-8');
    });

    it('should handle whitespace-only file content', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/whitespace.txt', '   \n\t  ');

      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/whitespace.txt', '   \n\t  ', 'utf-8');
    });

    it('should read empty file', async () => {
      mockFs.readFile.mockResolvedValue('');

      const result = await fileSystem.readFile('/test/empty.txt');

      expect(result).toBe('');
    });
  });

  describe('large file operations', () => {
    it('should handle large file content', async () => {
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      mockFs.readFile.mockResolvedValue(largeContent);

      const result = await fileSystem.readFile('/test/large.txt');

      expect(result.length).toBe(10 * 1024 * 1024);
    });

    it('should write large file content', async () => {
      const largeContent = 'y'.repeat(5 * 1024 * 1024); // 5MB
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/test/large.txt', largeContent);

      expect(mockFs.writeFile).toHaveBeenCalledWith('/test/large.txt', largeContent, 'utf-8');
    });
  });

  describe('path normalization', () => {
    it('should handle paths with forward slashes on Windows', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: 'C:\\workspace\\project' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getKiroPath();

      expect(result).toBeTruthy();
      expect(result).toContain('.kiro');
    });

    it('should handle paths with backslashes', () => {
      const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = [
        { uri: { fsPath: 'C:\\Users\\Test\\workspace' } } as vscode.WorkspaceFolder
      ];

      const result = fileSystem.getSteeringPath();

      expect(result).toBeTruthy();
      expect(result).toContain('.kiro');
      expect(result).toContain('steering');
    });
  });
});
