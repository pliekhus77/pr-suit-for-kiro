/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';
import * as path from 'path';
import { FrameworkReferenceManager } from '../framework-reference-manager';
import { FileSystemOperations } from '../../utils/file-system';

// Mock vscode module
jest.mock('vscode');

describe('FrameworkReferenceManager', () => {
  let manager: FrameworkReferenceManager;
  let mockContext: jest.Mocked<vscode.ExtensionContext>;
  let mockFileSystem: jest.Mocked<FileSystemOperations>;

  beforeEach(() => {
    // Create mock context
    mockContext = {
      extensionPath: '/extension',
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn()
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn()
      }
    } as any;

    // Create mock file system
    mockFileSystem = {
      getSteeringPath: jest.fn().mockReturnValue('/workspace/.kiro/steering'),
      getWorkspacePath: jest.fn().mockReturnValue('/workspace'),
      getKiroPath: jest.fn().mockReturnValue('/workspace/.kiro'),
      getFrameworksPath: jest.fn().mockReturnValue('/workspace/frameworks'),
      getMetadataPath: jest.fn().mockReturnValue('/workspace/.kiro/.metadata'),
      ensureDirectory: jest.fn().mockResolvedValue(undefined),
      directoryExists: jest.fn().mockResolvedValue(true),
      listFiles: jest.fn().mockResolvedValue(['c4-model.md', 'test-driven-development.md']),
      readFile: jest.fn().mockResolvedValue('# Framework Content\n\nThis is test content with TDD and BDD.'),
      writeFile: jest.fn().mockResolvedValue(undefined),
      copyFile: jest.fn().mockResolvedValue(undefined),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      fileExists: jest.fn().mockResolvedValue(true)
    } as any;

    manager = new FrameworkReferenceManager(mockContext, mockFileSystem);
  });

  describe('frameworksDirectoryExists', () => {
    it('should return true when frameworks directory exists', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(true);

      const exists = await manager.frameworksDirectoryExists();

      expect(exists).toBe(true);
      expect(mockFileSystem.directoryExists).toHaveBeenCalled();
    });

    it('should return false when frameworks directory does not exist', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(false);

      const exists = await manager.frameworksDirectoryExists();

      expect(exists).toBe(false);
    });

    it('should return false when error occurs', async () => {
      mockFileSystem.directoryExists.mockRejectedValue(new Error('Test error'));

      const exists = await manager.frameworksDirectoryExists();

      expect(exists).toBe(false);
    });
  });

  describe('initializeFrameworksDirectory', () => {
    it('should create frameworks directory and copy files', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.listFiles.mockResolvedValue(['c4-model.md', 'test-driven-development.md']);

      await manager.initializeFrameworksDirectory();

      expect(mockFileSystem.ensureDirectory).toHaveBeenCalledWith('/workspace/frameworks');
      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(2);
    });

    it('should not overwrite existing files', async () => {
      mockFileSystem.fileExists
        .mockResolvedValueOnce(true)  // First file exists
        .mockResolvedValueOnce(false); // Second file doesn't exist
      mockFileSystem.listFiles.mockResolvedValue(['c4-model.md', 'test-driven-development.md']);

      await manager.initializeFrameworksDirectory();

      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no workspace is open', async () => {
      mockFileSystem.getWorkspacePath.mockReturnValue(undefined);

      await expect(manager.initializeFrameworksDirectory()).rejects.toThrow('No workspace folder open');
    });
  });

  describe('openFrameworkReference', () => {
    it('should open framework reference when it exists', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.fileExists.mockResolvedValue(true);

      await manager.openFrameworkReference('c4-model.md');

      expect(mockFileSystem.fileExists).toHaveBeenCalledWith(
        path.join('/workspace/frameworks', 'c4-model.md')
      );
    });

    it('should offer to initialize when frameworks directory does not exist', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(false);
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Cancel');

      await manager.openFrameworkReference('c4-model.md');

      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
    });

    it('should show error when file does not exist', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.fileExists.mockResolvedValue(false);

      await manager.openFrameworkReference('nonexistent.md');

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        'Framework reference not found: nonexistent.md'
      );
    });
  });

  describe('searchFrameworkReferences', () => {
    it('should search and return results', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue(['c4-model.md', 'test-driven-development.md']);
      mockFileSystem.readFile.mockResolvedValue('# Framework\n\nThis is about TDD and testing.\nAnother line here.');

      const results = await manager.searchFrameworkReferences('TDD');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].fileName).toBe('c4-model.md');
      expect(results[0].line).toContain('TDD');
    });

    it('should return empty array when frameworks directory does not exist', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(false);

      const results = await manager.searchFrameworkReferences('TDD');

      expect(results).toEqual([]);
    });

    it('should handle search errors gracefully', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue(['c4-model.md']);
      mockFileSystem.readFile.mockRejectedValue(new Error('Read error'));

      const results = await manager.searchFrameworkReferences('TDD');

      expect(results).toEqual([]);
    });

    it('should perform case-insensitive search', async () => {
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue(['test.md']);
      mockFileSystem.readFile.mockResolvedValue('This is about TDD');

      const results = await manager.searchFrameworkReferences('tdd');

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getFrameworkReferenceForSteering', () => {
    it('should return correct reference for strategy-tdd-bdd.md', () => {
      const reference = manager.getFrameworkReferenceForSteering('strategy-tdd-bdd.md');
      expect(reference).toBe('test-driven-development.md');
    });

    it('should return correct reference for strategy-security.md', () => {
      const reference = manager.getFrameworkReferenceForSteering('strategy-security.md');
      expect(reference).toBe('sabsa-framework.md');
    });

    it('should return correct reference for strategy-c4-model.md', () => {
      const reference = manager.getFrameworkReferenceForSteering('strategy-c4-model.md');
      expect(reference).toBe('c4-model.md');
    });

    it('should return null for unknown steering documents', () => {
      const reference = manager.getFrameworkReferenceForSteering('unknown.md');
      expect(reference).toBeNull();
    });
  });
});
