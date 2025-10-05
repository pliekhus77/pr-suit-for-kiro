import { FileSystemOperations } from '../file-system';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as fsTypes from 'fs';
import * as path from 'path';

// Mock fs/promises module
jest.mock('fs/promises');

/**
 * Task 18.2: Boundary condition tests
 * 
 * Tests file operations with:
 * - Empty workspace (no files)
 * - Workspace containing only .kiro/ file (not directory)
 * - Very long file paths (>260 chars on Windows)
 * - Special characters in filenames (Unicode, emojis)
 * - Circular symlinks in .kiro/steering/
 * 
 * Requirements: All
 */
describe('FileSystemOperations - Boundary Conditions (Task 18.2)', () => {
  let fileSystem: FileSystemOperations;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    fileSystem = new FileSystemOperations();
    mockFs = fs as jest.Mocked<typeof fs>;
    jest.clearAllMocks();

    // Setup default workspace
    const mockWorkspace = vscode.workspace as unknown as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
    mockWorkspace.workspaceFolders = [
      { uri: { fsPath: '/workspace' } } as vscode.WorkspaceFolder
    ];
  });

  describe('Empty workspace (no files)', () => {
    it('should handle listFiles in empty directory', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue([] as any);

      const result = await fileSystem.listFiles('/empty/dir');

      expect(result).toEqual([]);
      expect(mockFs.readdir).toHaveBeenCalledWith('/empty/dir', { withFileTypes: true });
    });

    it('should handle getSteeringPath when .kiro/steering/ is empty', () => {
      const steeringPath = fileSystem.getSteeringPath();

      expect(steeringPath).toBe(path.join('/workspace', '.kiro', 'steering'));
    });

    it('should create directory in empty workspace', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      await fileSystem.ensureDirectory('/empty/workspace/newdir');

      expect(mockFs.mkdir).toHaveBeenCalledWith('/empty/workspace/newdir', { recursive: true });
    });

    it('should handle writeFile in empty directory', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/empty/dir/file.txt', 'content');

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalledWith('/empty/dir/file.txt', 'content', 'utf-8');
    });

    it('should return false for fileExists in empty directory', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.stat.mockRejectedValue(error);

      const result = await fileSystem.fileExists('/empty/dir/nonexistent.txt');

      expect(result).toBe(false);
    });

    it('should return false for directoryExists in empty workspace', async () => {
      const error = new Error('Directory not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFs.stat.mockRejectedValue(error);

      const result = await fileSystem.directoryExists('/empty/workspace/nonexistent');

      expect(result).toBe(false);
    });

    it('should handle getKiroPath when workspace has no .kiro directory', () => {
      const kiroPath = fileSystem.getKiroPath();

      expect(kiroPath).toBe(path.join('/workspace', '.kiro'));
    });
  });

  describe('Workspace with .kiro/ as file (not directory)', () => {
    it('should detect .kiro as file when checking directoryExists', async () => {
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true
      } as unknown as fsTypes.Stats);

      const result = await fileSystem.directoryExists('/workspace/.kiro');

      expect(result).toBe(false);
    });

    it('should throw error when trying to create directory inside .kiro file', async () => {
      const error = new Error('Not a directory') as NodeJS.ErrnoException;
      error.code = 'ENOTDIR';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('/workspace/.kiro/steering'))
        .rejects.toThrow('Failed to create directory /workspace/.kiro/steering: Not a directory');
    });

    it('should throw error when trying to list files in .kiro file', async () => {
      const error = new Error('Not a directory') as NodeJS.ErrnoException;
      error.code = 'ENOTDIR';
      mockFs.readdir.mockRejectedValue(error);

      await expect(fileSystem.listFiles('/workspace/.kiro'))
        .rejects.toThrow('Failed to list files in /workspace/.kiro: Not a directory');
    });

    it('should throw error when trying to write file inside .kiro file', async () => {
      const error = new Error('Not a directory') as NodeJS.ErrnoException;
      error.code = 'ENOTDIR';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.writeFile('/workspace/.kiro/steering/file.md', 'content'))
        .rejects.toThrow('Not a directory');
    });

    it('should handle getKiroPath when .kiro is a file', () => {
      const kiroPath = fileSystem.getKiroPath();

      // Should still return the path, validation happens elsewhere
      expect(kiroPath).toBe(path.join('/workspace', '.kiro'));
    });
  });

  describe('Very long file paths (>260 chars on Windows)', () => {
    const longDirName = 'a'.repeat(100);
    const veryLongPath = `/workspace/${longDirName}/${longDirName}/${longDirName}/file.txt`; // ~310 chars

    it('should handle reading file with very long path', async () => {
      mockFs.readFile.mockResolvedValue('content from long path');

      const result = await fileSystem.readFile(veryLongPath);

      expect(result).toBe('content from long path');
      expect(mockFs.readFile).toHaveBeenCalledWith(veryLongPath, 'utf-8');
    });

    it('should handle writing file with very long path', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile(veryLongPath, 'content');

      expect(mockFs.mkdir).toHaveBeenCalled();
      expect(mockFs.writeFile).toHaveBeenCalledWith(veryLongPath, 'content', 'utf-8');
    });

    it('should throw error when Windows MAX_PATH exceeded (ENAMETOOLONG)', async () => {
      const error = new Error('File name too long') as NodeJS.ErrnoException;
      error.code = 'ENAMETOOLONG';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile(veryLongPath))
        .rejects.toThrow('Failed to read file');
    });

    it('should handle creating directory with very long path', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);

      await fileSystem.ensureDirectory(veryLongPath);

      expect(mockFs.mkdir).toHaveBeenCalledWith(veryLongPath, { recursive: true });
    });

    it('should throw error when directory path too long (ENAMETOOLONG)', async () => {
      const error = new Error('File name too long') as NodeJS.ErrnoException;
      error.code = 'ENAMETOOLONG';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory(veryLongPath))
        .rejects.toThrow('Failed to create directory');
    });

    it('should handle listing files in directory with very long path', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockDirents = [
        { name: 'file1.txt', isFile: () => true, isDirectory: () => false },
        { name: 'file2.txt', isFile: () => true, isDirectory: () => false }
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue(mockDirents as any);

      const result = await fileSystem.listFiles(veryLongPath);

      expect(result).toEqual(['file1.txt', 'file2.txt']);
    });

    it('should handle copying file with very long source path', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      await fileSystem.copyFile(veryLongPath, '/dest/file.txt');

      expect(mockFs.copyFile).toHaveBeenCalledWith(veryLongPath, '/dest/file.txt');
    });

    it('should handle copying file with very long destination path', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.copyFile.mockResolvedValue(undefined);

      await fileSystem.copyFile('/source/file.txt', veryLongPath);

      expect(mockFs.copyFile).toHaveBeenCalledWith('/source/file.txt', veryLongPath);
    });

    it('should handle deleting file with very long path', async () => {
      mockFs.unlink.mockResolvedValue(undefined);

      await fileSystem.deleteFile(veryLongPath);

      expect(mockFs.unlink).toHaveBeenCalledWith(veryLongPath);
    });

    it('should handle checking existence of file with very long path', async () => {
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false,
        isFile: () => true
      } as unknown as fsTypes.Stats);

      const result = await fileSystem.fileExists(veryLongPath);

      expect(result).toBe(true);
    });
  });

  describe('Special characters in filenames (Unicode, emojis)', () => {
    const unicodeFilenames = [
      'файл.txt', // Cyrillic
      '文件.txt', // Chinese
      'ファイル.txt', // Japanese
      'αρχείο.txt', // Greek
      'קוֹבֶץ.txt', // Hebrew
      'ملف.txt', // Arabic
      'tệp.txt', // Vietnamese
      'dosya.txt', // Turkish
      'fájl.txt', // Hungarian with accent
      'café-résumé.txt', // French accents
    ];

    const emojiFilenames = [
      '😀-happy.txt',
      '🚀-rocket.txt',
      '📁-folder.txt',
      '✅-check.txt',
      '❤️-heart.txt',
      '🎉-party.txt',
      '🔥-fire.txt',
      '💻-computer.txt',
      '📝-note.txt',
      '🌟-star.txt',
    ];

    const specialCharFilenames = [
      'file with spaces.txt',
      'file-with-dashes.txt',
      'file_with_underscores.txt',
      'file.multiple.dots.txt',
      'file(with)parens.txt',
      'file[with]brackets.txt',
      'file{with}braces.txt',
      'file@with@at.txt',
      'file#with#hash.txt',
      'file$with$dollar.txt',
      'file%with%percent.txt',
      'file&with&ampersand.txt',
      'file+with+plus.txt',
      'file=with=equals.txt',
      'file~with~tilde.txt',
      'file`with`backtick.txt',
      "file'with'quote.txt",
    ];

    describe('Unicode filenames', () => {
      unicodeFilenames.forEach((filename) => {
        it(`should handle reading file with Unicode name: ${filename}`, async () => {
          const filePath = `/workspace/.kiro/steering/${filename}`;
          mockFs.readFile.mockResolvedValue('unicode content');

          const result = await fileSystem.readFile(filePath);

          expect(result).toBe('unicode content');
          expect(mockFs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
        });

        it(`should handle writing file with Unicode name: ${filename}`, async () => {
          const filePath = `/workspace/.kiro/steering/${filename}`;
          mockFs.mkdir.mockResolvedValue(undefined);
          mockFs.writeFile.mockResolvedValue(undefined);

          await fileSystem.writeFile(filePath, 'unicode content');

          expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, 'unicode content', 'utf-8');
        });
      });

      it('should handle listing directory with Unicode filenames', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockDirents = unicodeFilenames.map(name => ({ name, isFile: () => true, isDirectory: () => false }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockFs.readdir.mockResolvedValue(mockDirents as any);

        const result = await fileSystem.listFiles('/workspace/.kiro/steering');

        expect(result).toEqual(unicodeFilenames);
      });

      it('should handle copying file with Unicode name', async () => {
        const sourcePath = `/workspace/.kiro/steering/${unicodeFilenames[0]}`;
        const destPath = `/workspace/.kiro/backup/${unicodeFilenames[0]}`;
        mockFs.mkdir.mockResolvedValue(undefined);
        mockFs.copyFile.mockResolvedValue(undefined);

        await fileSystem.copyFile(sourcePath, destPath);

        expect(mockFs.copyFile).toHaveBeenCalledWith(sourcePath, destPath);
      });

      it('should handle deleting file with Unicode name', async () => {
        const filePath = `/workspace/.kiro/steering/${unicodeFilenames[0]}`;
        mockFs.unlink.mockResolvedValue(undefined);

        await fileSystem.deleteFile(filePath);

        expect(mockFs.unlink).toHaveBeenCalledWith(filePath);
      });
    });

    describe('Emoji filenames', () => {
      emojiFilenames.forEach((filename) => {
        it(`should handle reading file with emoji name: ${filename}`, async () => {
          const filePath = `/workspace/.kiro/steering/${filename}`;
          mockFs.readFile.mockResolvedValue('emoji content');

          const result = await fileSystem.readFile(filePath);

          expect(result).toBe('emoji content');
          expect(mockFs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
        });

        it(`should handle writing file with emoji name: ${filename}`, async () => {
          const filePath = `/workspace/.kiro/steering/${filename}`;
          mockFs.mkdir.mockResolvedValue(undefined);
          mockFs.writeFile.mockResolvedValue(undefined);

          await fileSystem.writeFile(filePath, 'emoji content');

          expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, 'emoji content', 'utf-8');
        });
      });

      it('should handle listing directory with emoji filenames', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockDirents = emojiFilenames.map(name => ({ name, isFile: () => true, isDirectory: () => false }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockFs.readdir.mockResolvedValue(mockDirents as any);

        const result = await fileSystem.listFiles('/workspace/.kiro/steering');

        expect(result).toEqual(emojiFilenames);
      });

      it('should handle checking existence of file with emoji name', async () => {
        const filePath = `/workspace/.kiro/steering/${emojiFilenames[0]}`;
        mockFs.stat.mockResolvedValue({
          isDirectory: () => false,
          isFile: () => true
        } as unknown as fsTypes.Stats);

        const result = await fileSystem.fileExists(filePath);

        expect(result).toBe(true);
      });
    });

    describe('Special character filenames', () => {
      specialCharFilenames.forEach((filename) => {
        it(`should handle reading file with special chars: ${filename}`, async () => {
          const filePath = `/workspace/.kiro/steering/${filename}`;
          mockFs.readFile.mockResolvedValue('special content');

          const result = await fileSystem.readFile(filePath);

          expect(result).toBe('special content');
          expect(mockFs.readFile).toHaveBeenCalledWith(filePath, 'utf-8');
        });

        it(`should handle writing file with special chars: ${filename}`, async () => {
          const filePath = `/workspace/.kiro/steering/${filename}`;
          mockFs.mkdir.mockResolvedValue(undefined);
          mockFs.writeFile.mockResolvedValue(undefined);

          await fileSystem.writeFile(filePath, 'special content');

          expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, 'special content', 'utf-8');
        });
      });

      it('should handle listing directory with special character filenames', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockDirents = specialCharFilenames.map(name => ({ name, isFile: () => true, isDirectory: () => false }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockFs.readdir.mockResolvedValue(mockDirents as any);

        const result = await fileSystem.listFiles('/workspace/.kiro/steering');

        expect(result).toEqual(specialCharFilenames);
      });
    });

    describe('Invalid/problematic filenames', () => {
      it('should handle error when filename contains null byte', async () => {
        const invalidPath = '/workspace/.kiro/steering/file\0.txt';
        const error = new Error('Invalid argument') as NodeJS.ErrnoException;
        error.code = 'EINVAL';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile(invalidPath))
          .rejects.toThrow('Failed to read file');
      });

      it('should handle Windows reserved names (CON, PRN, AUX, NUL)', async () => {
        const reservedNames = ['CON.txt', 'PRN.txt', 'AUX.txt', 'NUL.txt', 'COM1.txt', 'LPT1.txt'];
        
        for (const name of reservedNames) {
          const filePath = `/workspace/.kiro/steering/${name}`;
          mockFs.readFile.mockResolvedValue('content');

          const result = await fileSystem.readFile(filePath);

          expect(result).toBe('content');
        }
      });

      it('should handle filenames with trailing dots (Windows)', async () => {
        const filePath = '/workspace/.kiro/steering/file...txt';
        mockFs.readFile.mockResolvedValue('content');

        const result = await fileSystem.readFile(filePath);

        expect(result).toBe('content');
      });

      it('should handle filenames with trailing spaces (Windows)', async () => {
        const filePath = '/workspace/.kiro/steering/file   .txt';
        mockFs.readFile.mockResolvedValue('content');

        const result = await fileSystem.readFile(filePath);

        expect(result).toBe('content');
      });
    });

    describe('Mixed Unicode and special characters', () => {
      it('should handle filename with Unicode and emojis', async () => {
        const filename = '文件-📁-file.txt';
        const filePath = `/workspace/.kiro/steering/${filename}`;
        mockFs.readFile.mockResolvedValue('mixed content');

        const result = await fileSystem.readFile(filePath);

        expect(result).toBe('mixed content');
      });

      it('should handle filename with multiple Unicode scripts', async () => {
        const filename = 'file-文件-ファイル-файл.txt';
        const filePath = `/workspace/.kiro/steering/${filename}`;
        mockFs.writeFile.mockResolvedValue(undefined);
        mockFs.mkdir.mockResolvedValue(undefined);

        await fileSystem.writeFile(filePath, 'multi-script content');

        expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, 'multi-script content', 'utf-8');
      });
    });
  });

  describe('Circular symlinks in .kiro/steering/', () => {
    it('should throw error when encountering circular symlink (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/workspace/.kiro/steering/circular-link.txt'))
        .rejects.toThrow('Failed to read file /workspace/.kiro/steering/circular-link.txt: Too many levels of symbolic links');
    });

    it('should throw error when listing directory with circular symlinks (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.readdir.mockRejectedValue(error);

      await expect(fileSystem.listFiles('/workspace/.kiro/steering'))
        .rejects.toThrow('Failed to list files in /workspace/.kiro/steering: Too many levels of symbolic links');
    });

    it('should throw error when checking existence with circular symlink (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.stat.mockRejectedValue(error);

      await expect(fileSystem.fileExists('/workspace/.kiro/steering/circular-link.txt'))
        .rejects.toThrow('Too many levels of symbolic links');
    });

    it('should throw error when writing through circular symlink (ELOOP)', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.writeFile.mockRejectedValue(error);

      await expect(fileSystem.writeFile('/workspace/.kiro/steering/circular-link.txt', 'content'))
        .rejects.toThrow('Failed to write file /workspace/.kiro/steering/circular-link.txt: Too many levels of symbolic links');
    });

    it('should throw error when copying file with circular symlink source (ELOOP)', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.copyFile.mockRejectedValue(error);

      await expect(fileSystem.copyFile('/workspace/.kiro/steering/circular-link.txt', '/dest/file.txt'))
        .rejects.toThrow('Failed to copy file from /workspace/.kiro/steering/circular-link.txt to /dest/file.txt: Too many levels of symbolic links');
    });

    it('should throw error when deleting file through circular symlink (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.unlink.mockRejectedValue(error);

      await expect(fileSystem.deleteFile('/workspace/.kiro/steering/circular-link.txt'))
        .rejects.toThrow('Failed to delete file /workspace/.kiro/steering/circular-link.txt: Too many levels of symbolic links');
    });

    it('should throw error when creating directory through circular symlink (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('/workspace/.kiro/steering/circular-link/subdir'))
        .rejects.toThrow('Failed to create directory /workspace/.kiro/steering/circular-link/subdir: Too many levels of symbolic links');
    });

    it('should throw error when checking directory existence with circular symlink (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.stat.mockRejectedValue(error);

      await expect(fileSystem.directoryExists('/workspace/.kiro/steering/circular-link'))
        .rejects.toThrow('Too many levels of symbolic links');
    });
  });

  describe('Combined boundary conditions', () => {
    it('should handle empty workspace with Unicode filename', async () => {
      mockFs.readdir.mockResolvedValue([]);
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      await fileSystem.writeFile('/empty/workspace/文件.txt', 'content');

      expect(mockFs.writeFile).toHaveBeenCalledWith('/empty/workspace/文件.txt', 'content', 'utf-8');
    });

    it('should handle very long path with Unicode characters', async () => {
      const longUnicodePath = `/workspace/${'文'.repeat(50)}/${'件'.repeat(50)}/file.txt`;
      mockFs.readFile.mockResolvedValue('content');

      const result = await fileSystem.readFile(longUnicodePath);

      expect(result).toBe('content');
    });

    it('should handle very long path with emojis', async () => {
      const longEmojiPath = `/workspace/${'😀'.repeat(30)}/${'🚀'.repeat(30)}/file.txt`;
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.mkdir.mockResolvedValue(undefined);

      await fileSystem.writeFile(longEmojiPath, 'emoji content');

      expect(mockFs.writeFile).toHaveBeenCalledWith(longEmojiPath, 'emoji content', 'utf-8');
    });

    it('should handle .kiro as file with Unicode filename attempt', async () => {
      const error = new Error('Not a directory') as NodeJS.ErrnoException;
      error.code = 'ENOTDIR';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.writeFile('/workspace/.kiro/文件.txt', 'content'))
        .rejects.toThrow('Not a directory');
    });

    it('should handle circular symlink with Unicode name (ELOOP)', async () => {
      const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
      error.code = 'ELOOP';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/workspace/.kiro/steering/循環リンク.txt'))
        .rejects.toThrow('Too many levels of symbolic links');
    });

    it('should handle empty directory listing with pattern filter', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFs.readdir.mockResolvedValue([]);

      const result = await fileSystem.listFiles('/empty/dir', '\\.md$');

      expect(result).toEqual([]);
    });

    it('should handle very long path exceeding system limits (ENAMETOOLONG)', async () => {
      const extremelyLongPath = `/workspace/${'a'.repeat(500)}/file.txt`;
      const error = new Error('File name too long') as NodeJS.ErrnoException;
      error.code = 'ENAMETOOLONG';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile(extremelyLongPath))
        .rejects.toThrow('Failed to read file');
    });

    it('should handle workspace path resolution with no workspace folders', () => {
      const mockWorkspace = vscode.workspace as unknown as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      const workspacePath = fileSystem.getWorkspacePath();

      expect(workspacePath).toBeUndefined();
    });

    it('should handle getKiroPath with no workspace', () => {
      const mockWorkspace = vscode.workspace as unknown as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      const kiroPath = fileSystem.getKiroPath();

      expect(kiroPath).toBeUndefined();
    });

    it('should handle getSteeringPath with no workspace', () => {
      const mockWorkspace = vscode.workspace as unknown as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
      mockWorkspace.workspaceFolders = undefined;

      expect(() => fileSystem.getSteeringPath()).toThrow('No workspace open or .kiro directory not found');
    });
  });
});
