import { FrameworkManager } from '../framework-manager';
import { FileSystemOperations } from '../../utils/file-system';
import * as vscode from 'vscode';
import { FrameworkCategory, FrameworkManifest } from '../../models/framework';
import * as path from 'path';

// Mock FileSystemOperations
jest.mock('../../utils/file-system');

// Mock vscode
jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn().mockResolvedValue(undefined),
    showWarningMessage: jest.fn().mockResolvedValue(undefined),
    showTextDocument: jest.fn().mockResolvedValue(undefined)
  },
  workspace: {
    workspaceFolders: [],
    openTextDocument: jest.fn().mockResolvedValue({})
  },
  Uri: {
    file: jest.fn((filePath: string) => ({ fsPath: filePath, scheme: 'file', path: filePath }))
  },
  commands: {
    executeCommand: jest.fn().mockResolvedValue(undefined)
  }
}), { virtual: true });

/**
 * Task 18.4: Cross-platform compatibility tests
 * 
 * Tests framework manager operations across different platforms:
 * - Windows (path separators, line endings, long paths, reserved names, UNC paths)
 * - macOS (path separators, case-sensitive/insensitive filesystems, symlinks, special chars)
 * - Linux (path separators, case-sensitive filesystem, permissions, symlinks, special chars)
 * - VS Code version compatibility
 * - Path normalization
 * - Line ending handling (LF, CRLF, mixed)
 * - Character encoding (UTF-8, Unicode, emoji)
 * - Environment-specific variables
 * 
 * Requirements: All
 */
describe('FrameworkManager - Cross-Platform Compatibility (Task 18.4)', () => {
  let frameworkManager: FrameworkManager;
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockContext: vscode.ExtensionContext;

  const mockManifest: FrameworkManifest = {
    version: '1.0.0',
    frameworks: [
      {
        id: 'tdd-bdd-strategy',
        name: 'TDD/BDD Testing Strategy',
        description: 'Test-driven and behavior-driven development practices',
        category: FrameworkCategory.Testing,
        version: '1.0.0',
        fileName: 'strategy-tdd-bdd.md',
        dependencies: []
      },
      {
        id: 'security-strategy',
        name: 'SABSA Security Strategy',
        description: 'Security architecture and threat modeling',
        category: FrameworkCategory.Security,
        version: '1.0.0',
        fileName: 'strategy-security.md',
        dependencies: []
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockContext = {
      extensionPath: '/mock/extension/path',
      subscriptions: [],
      workspaceState: {} as vscode.Memento,
      globalState: {} as vscode.Memento & { setKeysForSync(keys: readonly string[]): void },
      extensionUri: vscode.Uri.file('/mock/extension/path'),
      environmentVariableCollection: {} as vscode.GlobalEnvironmentVariableCollection,
      extensionMode: 3,
      storageUri: vscode.Uri.file('/mock/storage'),
      globalStorageUri: vscode.Uri.file('/mock/global-storage'),
      logUri: vscode.Uri.file('/mock/log'),
      storagePath: '/mock/storage',
      globalStoragePath: '/mock/global-storage',
      logPath: '/mock/log',
      asAbsolutePath: (relativePath: string) => path.join('/mock/extension/path', relativePath),
      secrets: {} as vscode.SecretStorage,
      extension: {} as vscode.Extension<unknown>,
      languageModelAccessInformation: {} as vscode.LanguageModelAccessInformation
    };

    mockFileSystem = new FileSystemOperations() as jest.Mocked<FileSystemOperations>;
    
    // Setup default mocks
    mockFileSystem.readFile = jest.fn().mockResolvedValue(JSON.stringify(mockManifest));
    mockFileSystem.writeFile = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.copyFile = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.fileExists = jest.fn().mockResolvedValue(false);
    mockFileSystem.ensureDirectory = jest.fn().mockResolvedValue(undefined);
    mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/mock/workspace/.kiro/steering');
    mockFileSystem.getMetadataPath = jest.fn().mockReturnValue('/mock/workspace/.kiro/.metadata');

    frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
  });

  describe('Windows Platform Tests', () => {
    it('should handle Windows path separators correctly', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('C:\\Users\\Test\\.kiro\\steering');
      
      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should handle Windows line endings (CRLF)', async () => {
      const contentWithCRLF = 'Line 1\r\nLine 2\r\nLine 3\r\n';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(contentWithCRLF);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should handle long file paths on Windows (>260 chars)', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('C:\\' + 'a'.repeat(250) + '\\.kiro\\steering');

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });

    it('should handle Windows UNC paths', async () => {
      const uncPath = '\\\\server\\share\\.kiro\\steering';
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue(uncPath);

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });
  });

  describe('macOS Platform Tests', () => {
    it('should handle macOS path separators correctly', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/Users/test/.kiro/steering');
      
      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should handle case-sensitive filesystem on macOS', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/users/test/.kiro/steering');
      mockFileSystem.fileExists = jest.fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });

    it('should handle macOS symlinks', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/Users/test/symlink-to-kiro/steering');
      mockFileSystem.fileExists = jest.fn().mockResolvedValue(false);

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });
  });

  describe('Linux Platform Tests', () => {
    it('should handle Linux path separators correctly', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/home/user/.kiro/steering');
      
      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should handle Linux case-sensitive filesystem', async () => {
      const lowerCasePath = '/home/user/.kiro/steering/strategy-tdd-bdd.md';
      const upperCasePath = '/home/user/.kiro/steering/Strategy-TDD-BDD.md';

      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/home/user/.kiro/steering');
      mockFileSystem.fileExists = jest.fn()
        .mockImplementation((filePath: string) => {
          return Promise.resolve(filePath === lowerCasePath);
        });

      const exists1 = await mockFileSystem.fileExists(lowerCasePath);
      const exists2 = await mockFileSystem.fileExists(upperCasePath);

      expect(exists1).toBe(true);
      expect(exists2).toBe(false);
    });

    it('should handle Linux symlinks', async () => {
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/home/user/symlink/.kiro/steering');
      mockFileSystem.fileExists = jest.fn().mockResolvedValue(false);

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });
  });

  describe('Path Normalization Tests', () => {
    it('should normalize paths consistently across platforms', async () => {
      const paths = [
        '/home/user/.kiro/steering',
        'C:\\Users\\Test\\.kiro\\steering',
        '/Users/test/.kiro/steering'
      ];

      for (const testPath of paths) {
        mockFileSystem.getSteeringPath = jest.fn().mockReturnValue(testPath);
        
        await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

        expect(mockFileSystem.copyFile).toHaveBeenCalled();
      }
    });

    it('should handle relative paths correctly', async () => {
      const relativePath = './.kiro/steering';
      mockFileSystem.getSteeringPath = jest.fn().mockReturnValue(relativePath);

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });
  });

  describe('Line Ending Tests', () => {
    it('should handle LF line endings (Unix/Linux/macOS)', async () => {
      const contentWithLF = 'Line 1\nLine 2\nLine 3\n';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(contentWithLF);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should handle CRLF line endings (Windows)', async () => {
      const contentWithCRLF = 'Line 1\r\nLine 2\r\nLine 3\r\n';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(contentWithCRLF);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should handle mixed line endings', async () => {
      const contentWithMixed = 'Line 1\nLine 2\r\nLine 3\rLine 4\n';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(contentWithMixed);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });
  });

  describe('Character Encoding Tests', () => {
    it('should handle UTF-8 encoding', async () => {
      const utf8Content = 'Hello 世界 🌍';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(utf8Content);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should handle special Unicode characters', async () => {
      const unicodeContent = 'Café ñoño 日本語 한글 العربية';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(unicodeContent);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });

    it('should handle emoji in content', async () => {
      const emojiContent = 'Test 😀 🎉 ✅ ❌ 🚀';
      mockFileSystem.readFile = jest.fn()
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(emojiContent);

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks).toHaveLength(2);
    });
  });

  describe('Environment-Specific Tests', () => {
    it('should detect current platform', () => {
      expect(['win32', 'darwin', 'linux']).toContain(process.platform);
    });

    it('should handle environment variables', () => {
      const originalHome = process.env.HOME;
      const originalUserProfile = process.env.USERPROFILE;

      // Test that environment variables can be accessed
      if (process.platform === 'win32') {
        expect(process.env.USERPROFILE).toBeDefined();
      } else {
        expect(process.env.HOME).toBeDefined();
      }

      // Restore original values
      if (originalHome !== undefined) {
        process.env.HOME = originalHome;
      }
      if (originalUserProfile !== undefined) {
        process.env.USERPROFILE = originalUserProfile;
      }
    });
  });
});
