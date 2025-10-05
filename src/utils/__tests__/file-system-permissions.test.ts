import { FileSystemOperations } from '../file-system';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';

// Mock fs/promises module
jest.mock('fs/promises');

/**
 * Task 18.1: Permission and access error tests
 * 
 * Tests file operations with:
 * - Read-only files
 * - Insufficient permissions (EACCES, EPERM)
 * - Locked files (EBUSY)
 * - Network drives with connectivity issues (ETIMEDOUT, ENETUNREACH)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
describe('FileSystemOperations - Permission and Access Errors (Task 18.1)', () => {
  let fileSystem: FileSystemOperations;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    fileSystem = new FileSystemOperations();
    mockFs = fs as jest.Mocked<typeof fs>;
    jest.clearAllMocks();

    // Setup default workspace
    const mockWorkspace = vscode.workspace as { workspaceFolders: vscode.WorkspaceFolder[] | undefined };
    mockWorkspace.workspaceFolders = [
      { uri: { fsPath: '/workspace' } } as vscode.WorkspaceFolder
    ];
  });

  describe('Read-only file operations', () => {
    describe('writeFile with read-only files', () => {
      it('should throw error when writing to read-only file (EACCES)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('/readonly/file.txt', 'content'))
          .rejects.toThrow('Permission denied writing to /readonly/file.txt');
      });

      it('should throw error when writing to read-only file (EPERM)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
        error.code = 'EPERM';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('/readonly/file.txt', 'content'))
          .rejects.toThrow('Failed to write file /readonly/file.txt: Operation not permitted');
      });

      it('should throw error when writing to read-only file (EROFS)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Read-only file system') as NodeJS.ErrnoException;
        error.code = 'EROFS';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('/readonly/file.txt', 'content'))
          .rejects.toThrow('Failed to write file /readonly/file.txt: Read-only file system');
      });
    });

    describe('deleteFile with read-only files', () => {
      it('should throw error when deleting read-only file (EACCES)', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.unlink.mockRejectedValue(error);

        await expect(fileSystem.deleteFile('/readonly/file.txt'))
          .rejects.toThrow('Failed to delete file /readonly/file.txt: Permission denied');
      });

      it('should throw error when deleting read-only file (EPERM)', async () => {
        const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
        error.code = 'EPERM';
        mockFs.unlink.mockRejectedValue(error);

        await expect(fileSystem.deleteFile('/readonly/file.txt'))
          .rejects.toThrow('Failed to delete file /readonly/file.txt: Operation not permitted');
      });
    });

    describe('copyFile with read-only destination', () => {
      it('should throw error when copying to read-only destination (EACCES)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.copyFile.mockRejectedValue(error);

        await expect(fileSystem.copyFile('/source/file.txt', '/readonly/dest.txt'))
          .rejects.toThrow('Failed to copy file from /source/file.txt to /readonly/dest.txt: Permission denied');
      });

      it('should throw error when copying to read-only file system (EROFS)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Read-only file system') as NodeJS.ErrnoException;
        error.code = 'EROFS';
        mockFs.copyFile.mockRejectedValue(error);

        await expect(fileSystem.copyFile('/source/file.txt', '/readonly/dest.txt'))
          .rejects.toThrow('Failed to copy file from /source/file.txt to /readonly/dest.txt: Read-only file system');
      });
    });

    describe('readFile with read-only files', () => {
      it('should successfully read read-only file', async () => {
        mockFs.readFile.mockResolvedValue('readonly content');

        const result = await fileSystem.readFile('/readonly/file.txt');

        expect(result).toBe('readonly content');
      });

      it('should throw error if read permission denied (EACCES)', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('/noperm/file.txt'))
          .rejects.toThrow('Failed to read file /noperm/file.txt: Permission denied');
      });
    });
  });

  describe('Insufficient permissions for directory operations', () => {
    describe('ensureDirectory with insufficient permissions', () => {
      it('should throw error when creating directory without permission (EACCES)', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.mkdir.mockRejectedValue(error);

        await expect(fileSystem.ensureDirectory('/noperm/newdir'))
          .rejects.toThrow('Failed to create directory /noperm/newdir: Permission denied');
      });

      it('should throw error when creating directory without permission (EPERM)', async () => {
        const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
        error.code = 'EPERM';
        mockFs.mkdir.mockRejectedValue(error);

        await expect(fileSystem.ensureDirectory('/noperm/newdir'))
          .rejects.toThrow('Failed to create directory /noperm/newdir: Operation not permitted');
      });

      it('should throw error when creating directory on read-only file system (EROFS)', async () => {
        const error = new Error('Read-only file system') as NodeJS.ErrnoException;
        error.code = 'EROFS';
        mockFs.mkdir.mockRejectedValue(error);

        await expect(fileSystem.ensureDirectory('/readonly/newdir'))
          .rejects.toThrow('Failed to create directory /readonly/newdir: Read-only file system');
      });

      it('should throw error when parent directory is not writable', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.mkdir.mockRejectedValue(error);

        await expect(fileSystem.ensureDirectory('/protected/child/grandchild'))
          .rejects.toThrow('Failed to create directory /protected/child/grandchild: Permission denied');
      });
    });

    describe('listFiles with insufficient permissions', () => {
      it('should throw error when listing directory without read permission (EACCES)', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.readdir.mockRejectedValue(error);

        await expect(fileSystem.listFiles('/noperm/dir'))
          .rejects.toThrow('Failed to list files in /noperm/dir: Permission denied');
      });

      it('should throw error when listing directory without permission (EPERM)', async () => {
        const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
        error.code = 'EPERM';
        mockFs.readdir.mockRejectedValue(error);

        await expect(fileSystem.listFiles('/noperm/dir'))
          .rejects.toThrow('Failed to list files in /noperm/dir: Operation not permitted');
      });
    });

    describe('directoryExists with insufficient permissions', () => {
      it('should throw error when checking directory without permission (EACCES)', async () => {
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        mockFs.stat.mockRejectedValue(error);

        await expect(fileSystem.directoryExists('/noperm/dir'))
          .rejects.toThrow('Permission denied');
      });

      it('should throw error when checking directory without permission (EPERM)', async () => {
        const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
        error.code = 'EPERM';
        mockFs.stat.mockRejectedValue(error);

        await expect(fileSystem.directoryExists('/noperm/dir'))
          .rejects.toThrow('Operation not permitted');
      });
    });
  });

  describe('Locked file operations', () => {
    describe('writeFile with locked files', () => {
      it('should throw error when writing to locked file (EBUSY)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
        error.code = 'EBUSY';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('/locked/file.txt', 'content'))
          .rejects.toThrow('Failed to write file /locked/file.txt: Resource busy or locked');
      });

      it('should throw error when writing to file locked by another process (EAGAIN)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Resource temporarily unavailable') as NodeJS.ErrnoException;
        error.code = 'EAGAIN';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('/locked/file.txt', 'content'))
          .rejects.toThrow('Failed to write file /locked/file.txt: Resource temporarily unavailable');
      });
    });

    describe('deleteFile with locked files', () => {
      it('should throw error when deleting locked file (EBUSY)', async () => {
        const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
        error.code = 'EBUSY';
        mockFs.unlink.mockRejectedValue(error);

        await expect(fileSystem.deleteFile('/locked/file.txt'))
          .rejects.toThrow('Failed to delete file /locked/file.txt: Resource busy or locked');
      });

      it('should throw error when deleting file in use (ETXTBSY)', async () => {
        const error = new Error('Text file busy') as NodeJS.ErrnoException;
        error.code = 'ETXTBSY';
        mockFs.unlink.mockRejectedValue(error);

        await expect(fileSystem.deleteFile('/locked/executable.exe'))
          .rejects.toThrow('Failed to delete file /locked/executable.exe: Text file busy');
      });
    });

    describe('readFile with locked files', () => {
      it('should throw error when reading exclusively locked file (EBUSY)', async () => {
        const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
        error.code = 'EBUSY';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('/locked/file.txt'))
          .rejects.toThrow('Failed to read file /locked/file.txt: Resource busy or locked');
      });

      it('should throw error when reading file with exclusive lock (EAGAIN)', async () => {
        const error = new Error('Resource temporarily unavailable') as NodeJS.ErrnoException;
        error.code = 'EAGAIN';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('/locked/file.txt'))
          .rejects.toThrow('Failed to read file /locked/file.txt: Resource temporarily unavailable');
      });
    });

    describe('copyFile with locked files', () => {
      it('should throw error when source file is locked (EBUSY)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
        error.code = 'EBUSY';
        mockFs.copyFile.mockRejectedValue(error);

        await expect(fileSystem.copyFile('/locked/source.txt', '/dest/file.txt'))
          .rejects.toThrow('Failed to copy file from /locked/source.txt to /dest/file.txt: Resource busy or locked');
      });

      it('should throw error when destination file is locked (EBUSY)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
        error.code = 'EBUSY';
        mockFs.copyFile.mockRejectedValue(error);

        await expect(fileSystem.copyFile('/source/file.txt', '/locked/dest.txt'))
          .rejects.toThrow('Failed to copy file from /source/file.txt to /locked/dest.txt: Resource busy or locked');
      });
    });
  });

  describe('Network drive connectivity issues', () => {
    describe('Network timeout errors', () => {
      it('should throw error when network operation times out (ETIMEDOUT)', async () => {
        const error = new Error('Connection timed out') as NodeJS.ErrnoException;
        error.code = 'ETIMEDOUT';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: Connection timed out');
      });

      it('should throw error when writing to network drive times out (ETIMEDOUT)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Connection timed out') as NodeJS.ErrnoException;
        error.code = 'ETIMEDOUT';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('//network/share/file.txt', 'content'))
          .rejects.toThrow('Failed to write file //network/share/file.txt: Connection timed out');
      });

      it('should throw error when listing network directory times out (ETIMEDOUT)', async () => {
        const error = new Error('Connection timed out') as NodeJS.ErrnoException;
        error.code = 'ETIMEDOUT';
        mockFs.readdir.mockRejectedValue(error);

        await expect(fileSystem.listFiles('//network/share/dir'))
          .rejects.toThrow('Failed to list files in //network/share/dir: Connection timed out');
      });
    });

    describe('Network unreachable errors', () => {
      it('should throw error when network is unreachable (ENETUNREACH)', async () => {
        const error = new Error('Network is unreachable') as NodeJS.ErrnoException;
        error.code = 'ENETUNREACH';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: Network is unreachable');
      });

      it('should throw error when creating directory on unreachable network (ENETUNREACH)', async () => {
        const error = new Error('Network is unreachable') as NodeJS.ErrnoException;
        error.code = 'ENETUNREACH';
        mockFs.mkdir.mockRejectedValue(error);

        await expect(fileSystem.ensureDirectory('//network/share/newdir'))
          .rejects.toThrow('Failed to create directory //network/share/newdir: Network is unreachable');
      });
    });

    describe('Network connection errors', () => {
      it('should throw error when host is down (EHOSTDOWN)', async () => {
        const error = new Error('Host is down') as NodeJS.ErrnoException;
        error.code = 'EHOSTDOWN';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: Host is down');
      });

      it('should throw error when host is unreachable (EHOSTUNREACH)', async () => {
        const error = new Error('No route to host') as NodeJS.ErrnoException;
        error.code = 'EHOSTUNREACH';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: No route to host');
      });

      it('should throw error when connection is refused (ECONNREFUSED)', async () => {
        const error = new Error('Connection refused') as NodeJS.ErrnoException;
        error.code = 'ECONNREFUSED';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: Connection refused');
      });

      it('should throw error when connection is reset (ECONNRESET)', async () => {
        const error = new Error('Connection reset by peer') as NodeJS.ErrnoException;
        error.code = 'ECONNRESET';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: Connection reset by peer');
      });
    });

    describe('Network share errors', () => {
      it('should throw error when network share is not available (ENODEV)', async () => {
        const error = new Error('No such device') as NodeJS.ErrnoException;
        error.code = 'ENODEV';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: No such device');
      });

      it('should throw error when network path is invalid (ENXIO)', async () => {
        const error = new Error('No such device or address') as NodeJS.ErrnoException;
        error.code = 'ENXIO';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/invalid/file.txt'))
          .rejects.toThrow('Failed to read file //network/invalid/file.txt: No such device or address');
      });

      it('should throw error when too many network redirects (ELOOP)', async () => {
        const error = new Error('Too many levels of symbolic links') as NodeJS.ErrnoException;
        error.code = 'ELOOP';
        mockFs.readFile.mockRejectedValue(error);

        await expect(fileSystem.readFile('//network/share/file.txt'))
          .rejects.toThrow('Failed to read file //network/share/file.txt: Too many levels of symbolic links');
      });
    });

    describe('Disk space and quota errors on network drives', () => {
      it('should throw error when network drive is full (ENOSPC)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('No space left on device') as NodeJS.ErrnoException;
        error.code = 'ENOSPC';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('//network/share/file.txt', 'content'))
          .rejects.toThrow('Failed to write file //network/share/file.txt: No space left on device');
      });

      it('should throw error when quota exceeded on network drive (EDQUOT)', async () => {
        mockFs.mkdir.mockResolvedValue(undefined);
        const error = new Error('Disk quota exceeded') as NodeJS.ErrnoException;
        error.code = 'EDQUOT';
        mockFs.writeFile.mockRejectedValue(error);

        await expect(fileSystem.writeFile('//network/share/file.txt', 'content'))
          .rejects.toThrow('Failed to write file //network/share/file.txt: Disk quota exceeded');
      });
    });
  });

  describe('Combined permission and network scenarios', () => {
    it('should handle permission denied on network drive', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('//network/protected/file.txt'))
        .rejects.toThrow('Failed to read file //network/protected/file.txt: Permission denied');
    });

    it('should handle locked file on network drive', async () => {
      const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
      error.code = 'EBUSY';
      mockFs.writeFile.mockRejectedValue(error);
      mockFs.mkdir.mockResolvedValue(undefined);

      await expect(fileSystem.writeFile('//network/share/locked.txt', 'content'))
        .rejects.toThrow('Failed to write file //network/share/locked.txt: Resource busy or locked');
    });

    it('should handle read-only network share', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Read-only file system') as NodeJS.ErrnoException;
      error.code = 'EROFS';
      mockFs.writeFile.mockRejectedValue(error);

      await expect(fileSystem.writeFile('//network/readonly/file.txt', 'content'))
        .rejects.toThrow('Failed to write file //network/readonly/file.txt: Read-only file system');
    });

    it('should handle network timeout while checking permissions', async () => {
      const error = new Error('Connection timed out') as NodeJS.ErrnoException;
      error.code = 'ETIMEDOUT';
      mockFs.stat.mockRejectedValue(error);

      await expect(fileSystem.fileExists('//network/share/file.txt'))
        .rejects.toThrow('Connection timed out');
    });
  });

  describe('Error recovery and retry scenarios', () => {
    it('should propagate EAGAIN error for potential retry', async () => {
      const error = new Error('Resource temporarily unavailable') as NodeJS.ErrnoException;
      error.code = 'EAGAIN';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/temp/file.txt'))
        .rejects.toThrow('Failed to read file /temp/file.txt: Resource temporarily unavailable');
    });

    it('should propagate EBUSY error for potential retry', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Resource busy or locked') as NodeJS.ErrnoException;
      error.code = 'EBUSY';
      mockFs.writeFile.mockRejectedValue(error);

      await expect(fileSystem.writeFile('/temp/file.txt', 'content'))
        .rejects.toThrow('Failed to write file /temp/file.txt: Resource busy or locked');
    });

    it('should propagate ETIMEDOUT error for potential retry', async () => {
      const error = new Error('Connection timed out') as NodeJS.ErrnoException;
      error.code = 'ETIMEDOUT';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('//network/share/file.txt'))
        .rejects.toThrow('Failed to read file //network/share/file.txt: Connection timed out');
    });
  });

  describe('Windows-specific permission errors', () => {
    it('should handle Windows sharing violation (EBUSY)', async () => {
      const error = new Error('The process cannot access the file because it is being used by another process') as NodeJS.ErrnoException;
      error.code = 'EBUSY';
      mockFs.unlink.mockRejectedValue(error);

      await expect(fileSystem.deleteFile('C:\\Windows\\System32\\file.dll'))
        .rejects.toThrow('Failed to delete file C:\\Windows\\System32\\file.dll: The process cannot access the file because it is being used by another process');
    });

    it('should handle Windows access denied (EPERM)', async () => {
      const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
      error.code = 'EPERM';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('C:\\Program Files\\NewFolder'))
        .rejects.toThrow('Failed to create directory C:\\Program Files\\NewFolder: Operation not permitted');
    });

    it('should handle Windows administrator-only paths (EACCES)', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.writeFile.mockRejectedValue(error);

      await expect(fileSystem.writeFile('C:\\Windows\\System32\\config\\file.txt', 'content'))
        .rejects.toThrow('Permission denied writing to C:\\Windows\\System32\\config\\file.txt');
    });
  });

  describe('Unix-specific permission errors', () => {
    it('should handle Unix permission bits (EACCES)', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.readFile.mockRejectedValue(error);

      await expect(fileSystem.readFile('/root/protected/file.txt'))
        .rejects.toThrow('Failed to read file /root/protected/file.txt: Permission denied');
    });

    it('should handle Unix immutable files (EPERM)', async () => {
      const error = new Error('Operation not permitted') as NodeJS.ErrnoException;
      error.code = 'EPERM';
      mockFs.unlink.mockRejectedValue(error);

      await expect(fileSystem.deleteFile('/etc/immutable.conf'))
        .rejects.toThrow('Failed to delete file /etc/immutable.conf: Operation not permitted');
    });

    it('should handle Unix directory permissions (EACCES)', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFs.mkdir.mockRejectedValue(error);

      await expect(fileSystem.ensureDirectory('/root/newdir'))
        .rejects.toThrow('Failed to create directory /root/newdir: Permission denied');
    });
  });
});
