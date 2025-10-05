import { FrameworkManager } from '../framework-manager';
import { FileSystemOperations } from '../../utils/file-system';
import * as vscode from 'vscode';
import { FrameworkCategory, FrameworkManifest } from '../../models/framework';

// Mock FileSystemOperations
jest.mock('../../utils/file-system');

// Mock vscode window methods
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
    file: jest.fn((path: string) => ({ fsPath: path, scheme: 'file', path }))
  },
  commands: {
    executeCommand: jest.fn().mockResolvedValue(undefined)
  }
}), { virtual: true });

describe('FrameworkManager', () => {
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
        description: 'Security architecture and threat modeling practices',
        category: FrameworkCategory.Security,
        version: '1.0.0',
        fileName: 'strategy-security.md',
        dependencies: []
      },
      {
        id: 'c4-model-strategy',
        name: 'C4 Model Architecture',
        description: 'When and how to use C4 diagrams in specs',
        category: FrameworkCategory.Architecture,
        version: '1.0.0',
        fileName: 'strategy-c4-model.md',
        dependencies: []
      },
      {
        id: 'azure-strategy',
        name: 'Azure Hosting Strategy',
        description: 'Azure service selection and hosting patterns',
        category: FrameworkCategory.Cloud,
        version: '1.0.0',
        fileName: 'strategy-azure.md',
        dependencies: []
      }
    ]
  };

  beforeEach(() => {
    // Create mock context
    mockContext = {
      extensionPath: '/extension/path'
    } as vscode.ExtensionContext;

    // Create mock file system
    mockFileSystem = new FileSystemOperations() as jest.Mocked<FileSystemOperations>;
    
    // Setup default mock implementations
    mockFileSystem.readFile = jest.fn();
    mockFileSystem.writeFile = jest.fn();
    mockFileSystem.copyFile = jest.fn();
    mockFileSystem.deleteFile = jest.fn();
    mockFileSystem.fileExists = jest.fn();
    mockFileSystem.ensureDirectory = jest.fn();
    mockFileSystem.getSteeringPath = jest.fn().mockReturnValue('/workspace/.kiro/steering');
    mockFileSystem.getMetadataPath = jest.fn().mockReturnValue('/workspace/.kiro/.metadata');

    // Create framework manager with mocked file system
    frameworkManager = new FrameworkManager(mockContext, mockFileSystem);

    jest.clearAllMocks();
  });

  describe('Manifest Loading and Parsing', () => {
    it('should load manifest from resources directory', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(mockFileSystem.readFile).toHaveBeenCalledWith(
        expect.stringContaining('manifest.json')
      );
      expect(frameworks).toEqual(mockManifest.frameworks);
    });

    it('should cache manifest after first load', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      // First call
      await frameworkManager.listAvailableFrameworks();
      // Second call
      await frameworkManager.listAvailableFrameworks();

      // Should only read file once
      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error if manifest file not found', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFileSystem.readFile.mockRejectedValue(error);

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow('File not found');
    });

    it('should throw error if manifest JSON is invalid', async () => {
      mockFileSystem.readFile.mockResolvedValue('invalid json {');

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow();
    });

    it('should parse manifest with all framework properties', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(frameworks[0]).toHaveProperty('id');
      expect(frameworks[0]).toHaveProperty('name');
      expect(frameworks[0]).toHaveProperty('description');
      expect(frameworks[0]).toHaveProperty('category');
      expect(frameworks[0]).toHaveProperty('version');
      expect(frameworks[0]).toHaveProperty('fileName');
    });
  });

  describe('Framework Listing by Category', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should list all available frameworks', async () => {
      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(frameworks).toHaveLength(4);
      expect(frameworks).toEqual(mockManifest.frameworks);
    });

    it('should get frameworks by testing category', async () => {
      const frameworks = await frameworkManager.getFrameworksByCategory(FrameworkCategory.Testing);

      expect(frameworks).toHaveLength(1);
      expect(frameworks[0].id).toBe('tdd-bdd-strategy');
      expect(frameworks[0].category).toBe(FrameworkCategory.Testing);
    });

    it('should get frameworks by security category', async () => {
      const frameworks = await frameworkManager.getFrameworksByCategory(FrameworkCategory.Security);

      expect(frameworks).toHaveLength(1);
      expect(frameworks[0].id).toBe('security-strategy');
      expect(frameworks[0].category).toBe(FrameworkCategory.Security);
    });

    it('should get frameworks by architecture category', async () => {
      const frameworks = await frameworkManager.getFrameworksByCategory(FrameworkCategory.Architecture);

      expect(frameworks).toHaveLength(1);
      expect(frameworks[0].id).toBe('c4-model-strategy');
    });

    it('should return empty array for category with no frameworks', async () => {
      const frameworks = await frameworkManager.getFrameworksByCategory(FrameworkCategory.DevOps);

      expect(frameworks).toHaveLength(0);
    });

    it('should get framework by ID', async () => {
      const framework = await frameworkManager.getFrameworkById('tdd-bdd-strategy');

      expect(framework).toBeDefined();
      expect(framework?.id).toBe('tdd-bdd-strategy');
      expect(framework?.name).toBe('TDD/BDD Testing Strategy');
    });

    it('should return undefined for non-existent framework ID', async () => {
      const framework = await frameworkManager.getFrameworkById('non-existent-id');

      expect(framework).toBeUndefined();
    });
  });

  describe('Framework Search Functionality', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should search frameworks by name', async () => {
      const results = await frameworkManager.searchFrameworks('TDD');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('tdd-bdd-strategy');
    });

    it('should search frameworks by description', async () => {
      const results = await frameworkManager.searchFrameworks('threat modeling');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('security-strategy');
    });

    it('should search frameworks by category', async () => {
      const results = await frameworkManager.searchFrameworks('cloud');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('azure-strategy');
    });

    it('should be case-insensitive', async () => {
      const results = await frameworkManager.searchFrameworks('AZURE');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('azure-strategy');
    });

    it('should return multiple matches', async () => {
      const results = await frameworkManager.searchFrameworks('strategy');

      expect(results.length).toBeGreaterThan(1);
    });

    it('should return empty array for no matches', async () => {
      const results = await frameworkManager.searchFrameworks('nonexistent');

      expect(results).toHaveLength(0);
    });

    it('should return all frameworks for empty query', async () => {
      const results = await frameworkManager.searchFrameworks('');

      expect(results).toHaveLength(4);
    });

    it('should return all frameworks for whitespace-only query', async () => {
      const results = await frameworkManager.searchFrameworks('   ');

      expect(results).toHaveLength(4);
    });
  });

  describe('Caching Behavior', () => {
    it('should cache manifest after first load', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      // Multiple operations that require manifest
      await frameworkManager.listAvailableFrameworks();
      await frameworkManager.getFrameworkById('tdd-bdd-strategy');
      await frameworkManager.searchFrameworks('test');
      await frameworkManager.getFrameworksByCategory(FrameworkCategory.Testing);

      // Should only read file once
      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(1);
    });

    it('should use cached manifest for subsequent calls', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      const firstCall = await frameworkManager.listAvailableFrameworks();
      const secondCall = await frameworkManager.listAvailableFrameworks();

      expect(firstCall).toEqual(secondCall);
      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(1);
    });

    it('should cache manifest across different operations', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      await frameworkManager.listAvailableFrameworks();
      await frameworkManager.getFrameworkById('tdd-bdd-strategy');

      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling for Invalid Manifest', () => {
    it('should handle missing manifest file', async () => {
      const error = new Error('File not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFileSystem.readFile.mockRejectedValue(error);

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow('File not found');
    });

    it('should handle invalid JSON in manifest', async () => {
      mockFileSystem.readFile.mockResolvedValue('{ invalid json');

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow();
    });

    it('should handle empty manifest file', async () => {
      mockFileSystem.readFile.mockResolvedValue('');

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow();
    });

    it('should handle manifest with missing frameworks array', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({ version: '1.0.0' }));

      const frameworks = await frameworkManager.listAvailableFrameworks();
      
      // TypeScript will allow accessing undefined frameworks property
      expect(frameworks).toBeUndefined();
    });

    it('should handle permission denied error', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFileSystem.readFile.mockRejectedValue(error);

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow('Permission denied');
    });

    it('should handle corrupted manifest with invalid framework structure', async () => {
      const invalidManifest = {
        version: '1.0.0',
        frameworks: [
          { id: 'test' } // Missing required fields
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(invalidManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();
      
      // Should still parse but framework will be incomplete
      expect(frameworks[0]).toHaveProperty('id');
      expect(frameworks[0].id).toBe('test');
    });
  });

  describe('Framework Installation Status', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should check if framework is installed', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);

      const isInstalled = await frameworkManager.isFrameworkInstalled('tdd-bdd-strategy');

      expect(isInstalled).toBe(true);
      expect(mockFileSystem.fileExists).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should return false if framework file does not exist', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);

      const isInstalled = await frameworkManager.isFrameworkInstalled('tdd-bdd-strategy');

      expect(isInstalled).toBe(false);
    });

    it('should return false for non-existent framework ID', async () => {
      const isInstalled = await frameworkManager.isFrameworkInstalled('non-existent');

      expect(isInstalled).toBe(false);
      expect(mockFileSystem.fileExists).not.toHaveBeenCalled();
    });
  });

  describe('Get Installed Frameworks', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should return installed frameworks from metadata', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };
      
      mockFileSystem.readFile
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(JSON.stringify(metadata));

      const installed = await frameworkManager.getInstalledFrameworks();

      expect(installed).toHaveLength(1);
      expect(installed[0].id).toBe('tdd-bdd-strategy');
    });

    it('should return empty array if no frameworks installed', async () => {
      // First call loads manifest, second call tries to load metadata and fails
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      const installed = await frameworkManager.getInstalledFrameworks();

      expect(installed).toHaveLength(0);
    });

    it('should filter out frameworks not in manifest', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          },
          {
            id: 'deleted-framework',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };
      
      mockFileSystem.readFile
        .mockResolvedValueOnce(JSON.stringify(mockManifest))
        .mockResolvedValueOnce(JSON.stringify(metadata));

      const installed = await frameworkManager.getInstalledFrameworks();

      expect(installed).toHaveLength(1);
      expect(installed[0].id).toBe('tdd-bdd-strategy');
    });
  });

  describe('Framework Installation', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
      mockFileSystem.ensureDirectory.mockResolvedValue(undefined);
    });

    it('should install framework successfully when file does not exist', async () => {
      // Mock metadata file doesn't exist initially
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringContaining('strategy-tdd-bdd.md')
      );
      expect(mockFileSystem.ensureDirectory).toHaveBeenCalled();
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('installed-frameworks.json'),
        expect.any(String)
      );
    });

    it('should throw error if framework not found', async () => {
      await expect(frameworkManager.installFramework('non-existent-id'))
        .rejects.toThrow('Framework not found: non-existent-id');

      expect(mockFileSystem.copyFile).not.toHaveBeenCalled();
    });

    it('should create backup when overwriting existing file', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true, backup: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringMatching(/strategy-tdd-bdd\.md\.backup-/)
      );
    });

    it('should update metadata after successful installation', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('installed-frameworks.json'),
        expect.stringContaining('tdd-bdd-strategy')
      );
    });

    it('should update existing framework in metadata', async () => {
      const existingMetadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-01T10:00:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(existingMetadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      const writeCall = mockFileSystem.writeFile.mock.calls.find(call => 
        call[0].includes('installed-frameworks.json')
      );
      expect(writeCall).toBeDefined();
      
      const writtenMetadata = JSON.parse(writeCall![1]);
      expect(writtenMetadata.frameworks).toHaveLength(1);
      expect(writtenMetadata.frameworks[0].version).toBe('1.0.0');
    });

    it('should handle merge option by combining content', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);
      
      const existingContent = '# Existing Content\n\nSome custom content';
      const newContent = '# New Framework Content\n\nFramework guidance';
      
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('strategy-tdd-bdd.md') && path.includes('resources')) {
          return Promise.resolve(newContent);
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(existingContent);
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { merge: true, backup: true });

      const writeCall = mockFileSystem.writeFile.mock.calls.find(call => 
        call[0].includes('strategy-tdd-bdd.md') && !call[0].includes('installed-frameworks.json')
      );
      
      expect(writeCall).toBeDefined();
      expect(writeCall![1]).toContain('Existing Content');
      expect(writeCall![1]).toContain('New Framework Content');
      expect(writeCall![1]).toContain('MERGE CONFLICT');
    });
  });

  describe('Conflict Detection', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should detect existing file before installation', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);

      // Without options, should throw error about existing file
      await expect(frameworkManager.installFramework('tdd-bdd-strategy'))
        .rejects.toThrow();

      expect(mockFileSystem.fileExists).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should allow installation with overwrite option', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });

    it('should allow installation with merge option', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve('existing content');
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await frameworkManager.installFramework('tdd-bdd-strategy', { merge: true });

      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });
  });

  describe('Error Handling During Installation', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(false);
    });

    it('should handle permission denied error', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockFileSystem.copyFile.mockRejectedValue(error);

      await expect(frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }))
        .rejects.toThrow('Permission denied');
    });

    it('should handle disk full error', async () => {
      const error = new Error('No space left on device') as NodeJS.ErrnoException;
      error.code = 'ENOSPC';
      mockFileSystem.writeFile.mockRejectedValue(error);

      await expect(frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }))
        .rejects.toThrow();
    });

    it('should handle source file not found', async () => {
      const error = new Error('Source file not found') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockFileSystem.copyFile.mockRejectedValue(error);

      await expect(frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }))
        .rejects.toThrow('Source file not found');
    });

    it('should rollback on metadata write failure', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }))
        .rejects.toThrow('Write failed');
    });
  });

  describe('Update Detection', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should detect no updates when versions match', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const updates = await frameworkManager.checkForUpdates();

      expect(updates).toHaveLength(0);
    });

    it('should detect updates when version differs', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const updates = await frameworkManager.checkForUpdates();

      expect(updates).toHaveLength(1);
      expect(updates[0].frameworkId).toBe('tdd-bdd-strategy');
      expect(updates[0].currentVersion).toBe('0.9.0');
      expect(updates[0].latestVersion).toBe('1.0.0');
      expect(updates[0].changes).toContain('Updated to version 1.0.0');
    });

    it('should detect multiple updates', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          },
          {
            id: 'security-strategy',
            version: '0.8.0',
            installedAt: '2025-01-15T10:31:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const updates = await frameworkManager.checkForUpdates();

      expect(updates).toHaveLength(2);
      expect(updates.map(u => u.frameworkId)).toContain('tdd-bdd-strategy');
      expect(updates.map(u => u.frameworkId)).toContain('security-strategy');
    });

    it('should return empty array when no frameworks installed', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      const updates = await frameworkManager.checkForUpdates();

      expect(updates).toHaveLength(0);
    });

    it('should skip frameworks not in manifest', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'deleted-framework',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const updates = await frameworkManager.checkForUpdates();

      expect(updates).toHaveLength(0);
    });

    it('should include version info in update object', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.5.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const updates = await frameworkManager.checkForUpdates();

      expect(updates[0]).toHaveProperty('frameworkId');
      expect(updates[0]).toHaveProperty('currentVersion');
      expect(updates[0]).toHaveProperty('latestVersion');
      expect(updates[0]).toHaveProperty('changes');
      expect(Array.isArray(updates[0].changes)).toBe(true);
    });
  });

  describe('Framework Update with Customization Detection', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
      mockFileSystem.ensureDirectory.mockResolvedValue(undefined);
    });

    it('should detect non-customized framework and update without warning', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      const frameworkContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(frameworkContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user choosing to update
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('Update framework'),
        'Show Diff',
        'Update',
        'Cancel'
      );
      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });

    it('should detect customized framework and warn user', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      const installedContent = '# TDD/BDD Strategy\n\nCustomized content';
      const sourceContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('resources') && path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(sourceContent);
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(installedContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user choosing to update with backup
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Update with Backup');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        expect.stringContaining('has been customized'),
        expect.any(Object),
        'Show Diff',
        'Update with Backup',
        'Cancel'
      );
      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringMatching(/strategy-tdd-bdd\.md\.backup-/)
      );
    });

    it('should show diff preview when user requests it', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      const frameworkContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(frameworkContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user choosing to show diff, then update
      (vscode.window.showInformationMessage as jest.Mock)
        .mockResolvedValueOnce('Show Diff')
        .mockResolvedValueOnce('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'vscode.diff',
        expect.any(Object),
        expect.any(Object),
        expect.stringContaining('Current ↔ New Version')
      );
    });

    it('should cancel update when user chooses cancel', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve('content');
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user choosing cancel (returns undefined)
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);

      await expect(frameworkManager.updateFramework('tdd-bdd-strategy'))
        .rejects.toThrow('Update cancelled by user');

      expect(mockFileSystem.copyFile).not.toHaveBeenCalled();
    });

    it('should create backup with timestamp for customized framework', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      const installedContent = '# TDD/BDD Strategy\n\nCustomized content';
      const sourceContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('resources') && path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(sourceContent);
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(installedContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Update with Backup');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      const backupCall = mockFileSystem.copyFile.mock.calls.find(call =>
        call[1].includes('.backup-')
      );
      expect(backupCall).toBeDefined();
      expect(backupCall![1]).toMatch(/\.backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
    });

    it('should update metadata to mark framework as not customized after update', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: true,
            customizedAt: '2025-01-16T14:20:00Z'
          }
        ]
      };

      const installedContent = '# TDD/BDD Strategy\n\nCustomized content';
      const sourceContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('resources') && path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(sourceContent);
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(installedContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Update with Backup');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      const metadataWriteCall = mockFileSystem.writeFile.mock.calls.find(call =>
        call[0].includes('installed-frameworks.json')
      );
      expect(metadataWriteCall).toBeDefined();
      
      const writtenMetadata = JSON.parse(metadataWriteCall![1]);
      expect(writtenMetadata.frameworks[0].customized).toBe(false);
      expect(writtenMetadata.frameworks[0].customizedAt).toBeUndefined();
    });

    it('should throw error if framework not installed', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);

      await expect(frameworkManager.updateFramework('tdd-bdd-strategy'))
        .rejects.toThrow('Framework not installed: tdd-bdd-strategy');
    });

    it('should throw error if framework not found in manifest', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);

      await expect(frameworkManager.updateFramework('non-existent-id'))
        .rejects.toThrow('Framework not installed: non-existent-id');
    });

    it('should show success message after update', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      const frameworkContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(frameworkContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('Framework updated: TDD/BDD Testing Strategy')
      );
    });

    it('should handle diff preview for customized framework', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      const installedContent = '# TDD/BDD Strategy\n\nCustomized content';
      const sourceContent = '# TDD/BDD Strategy\n\nOriginal content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('resources') && path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(sourceContent);
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(installedContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      (vscode.window.showWarningMessage as jest.Mock)
        .mockResolvedValueOnce('Show Diff')
        .mockResolvedValueOnce('Update with Backup');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
        'vscode.diff',
        expect.any(Object),
        expect.any(Object),
        expect.stringContaining('Current ↔ New Version')
      );
    });
  });

  describe('Mark Framework as Customized', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should mark framework as customized', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      await frameworkManager.markFrameworkAsCustomized('tdd-bdd-strategy');

      const writeCall = mockFileSystem.writeFile.mock.calls.find(call =>
        call[0].includes('installed-frameworks.json')
      );
      expect(writeCall).toBeDefined();
      
      const writtenMetadata = JSON.parse(writeCall![1]);
      expect(writtenMetadata.frameworks[0].customized).toBe(true);
      expect(writtenMetadata.frameworks[0].customizedAt).toBeDefined();
    });

    it('should not fail if framework not in metadata', async () => {
      const metadata = {
        frameworks: []
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      await expect(frameworkManager.markFrameworkAsCustomized('tdd-bdd-strategy'))
        .resolves.not.toThrow();
    });
  });

  describe('Get Installed Framework Metadata', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should return metadata for installed framework', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: true,
            customizedAt: '2025-01-16T14:20:00Z'
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const result = await frameworkManager.getInstalledFrameworkMetadata('tdd-bdd-strategy');

      expect(result).toBeDefined();
      expect(result?.id).toBe('tdd-bdd-strategy');
      expect(result?.customized).toBe(true);
      expect(result?.customizedAt).toBe('2025-01-16T14:20:00Z');
    });

    it('should return undefined for non-installed framework', async () => {
      const metadata = {
        frameworks: []
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const result = await frameworkManager.getInstalledFrameworkMetadata('tdd-bdd-strategy');

      expect(result).toBeUndefined();
    });
  });

  describe('Update Detection Logic', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
    });

    it('should show information message for non-customized framework update', async () => {
      const content = '# Framework Content\n\nGuidance';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(content);
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      // Mock user confirmation for non-customized update
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      // Should show info message for non-customized framework
      expect(vscode.window.showInformationMessage).toHaveBeenCalled();
      expect(vscode.window.showWarningMessage).not.toHaveBeenCalled();
    });

    it('should handle content comparison errors gracefully', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('resources')) {
          return Promise.reject(new Error('Source file not found'));
        }
        return Promise.resolve('# Content');
      });

      // Mock user confirmation
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      // Should proceed with update even if comparison fails
      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });
  });

  describe('Backup Creation', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
    });

    it('should not create backup for non-customized framework', async () => {
      const content = '# Content';
      
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(content);
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      // Mock user confirmation
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      const backupCall = mockFileSystem.copyFile.mock.calls.find(call => 
        call[1].includes('.backup-')
      );
      
      expect(backupCall).toBeUndefined();
    });

    it('should handle file copy operations during update', async () => {
      const content = '# Content';
      
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(content);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user confirmation
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      // Should copy the framework file
      expect(mockFileSystem.copyFile).toHaveBeenCalled();
    });
  });

  describe('Framework Update Flow', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
    });

    it('should update framework successfully', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should update metadata with new version', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      const writeCall = mockFileSystem.writeFile.mock.calls.find(call => 
        call[0].includes('installed-frameworks.json')
      );
      
      expect(writeCall).toBeDefined();
      const writtenMetadata = JSON.parse(writeCall![1]);
      expect(writtenMetadata.frameworks[0].version).toBe('1.0.0');
    });

    it('should throw error for non-existent framework', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);
      
      await expect(frameworkManager.updateFramework('non-existent'))
        .rejects.toThrow('Framework not installed: non-existent');
    });

    it('should throw error if framework not installed', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);

      await expect(frameworkManager.updateFramework('tdd-bdd-strategy'))
        .rejects.toThrow('Framework not installed: tdd-bdd-strategy');
    });

    it('should handle user cancellation during update', async () => {
      const content = '# Content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(content);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user cancellation
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Cancel');

      // Should throw error when user cancels
      await expect(frameworkManager.updateFramework('tdd-bdd-strategy'))
        .rejects.toThrow('Update cancelled by user');

      // Should not proceed with copy when user cancels
      const updateCopyCall = mockFileSystem.copyFile.mock.calls.find(call => 
        !call[1].includes('.backup-')
      );
      expect(updateCopyCall).toBeUndefined();
    });

    it('should update all outdated frameworks', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          },
          {
            id: 'security-strategy',
            version: '0.8.0',
            installedAt: '2025-01-15T10:31:00Z',
            customized: false
          }
        ]
      };

      const content = '# Content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('.md')) {
          return Promise.resolve(content);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user confirmation for all updates
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateAllFrameworks();

      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(2);
      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.stringContaining('strategy-tdd-bdd.md')
      );
      expect(mockFileSystem.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-security.md'),
        expect.stringContaining('strategy-security.md')
      );
    });

    it('should call updateFramework for each outdated framework', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          },
          {
            id: 'security-strategy',
            version: '0.8.0',
            installedAt: '2025-01-15T10:31:00Z',
            customized: false
          }
        ]
      };

      const content = '# Content';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('.md')) {
          return Promise.resolve(content);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user confirmation for both updates
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateAllFrameworks();

      // Should copy files for both frameworks
      const tddCopies = mockFileSystem.copyFile.mock.calls.filter(call => 
        call[0].includes('strategy-tdd-bdd.md')
      );
      const securityCopies = mockFileSystem.copyFile.mock.calls.filter(call => 
        call[0].includes('strategy-security.md')
      );

      expect(tddCopies.length).toBeGreaterThan(0);
      expect(securityCopies.length).toBeGreaterThan(0);
    });

    it('should handle partial update failures gracefully', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          },
          {
            id: 'security-strategy',
            version: '0.8.0',
            installedAt: '2025-01-15T10:31:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      // First update succeeds, second fails
      mockFileSystem.copyFile
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Update failed'));

      await expect(frameworkManager.updateAllFrameworks())
        .rejects.toThrow();
    });

    it('should mark framework as not customized after update', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '0.9.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: true,
            customizedAt: '2025-01-16T14:20:00Z'
          }
        ]
      };

      const originalContent = '# Original';
      const customizedContent = '# Original\n\n## Custom';

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        if (path.includes('resources') && path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(originalContent);
        }
        if (path.includes('.kiro/steering') && path.includes('strategy-tdd-bdd.md')) {
          return Promise.resolve(customizedContent);
        }
        return Promise.reject(new Error('File not found'));
      });

      // Mock user confirmation
      (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Update');

      await frameworkManager.updateFramework('tdd-bdd-strategy');

      const writeCall = mockFileSystem.writeFile.mock.calls.find(call => 
        call[0].includes('installed-frameworks.json')
      );
      
      expect(writeCall).toBeDefined();
      const writtenMetadata = JSON.parse(writeCall![1]);
      expect(writtenMetadata.frameworks[0].customized).toBe(false);
      expect(writtenMetadata.frameworks[0].customizedAt).toBeUndefined();
    });
  });

  // Task 13.2: Comprehensive unit tests for FrameworkManager
  describe('listAvailableFrameworks - corrupted manifest', () => {
    it('should handle manifest with missing fields', async () => {
      const corruptedManifest = {
        version: '1.0.0',
        frameworks: [
          { id: 'test-1' }, // Missing name, description, etc.
          { id: 'test-2', name: 'Test 2' } // Missing other fields
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(corruptedManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(frameworks).toHaveLength(2);
      expect(frameworks[0].id).toBe('test-1');
      expect(frameworks[1].id).toBe('test-2');
    });

    it('should handle manifest with null frameworks array', async () => {
      const corruptedManifest = {
        version: '1.0.0',
        frameworks: null
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(corruptedManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(frameworks).toBeNull();
    });

    it('should handle manifest with frameworks as object instead of array', async () => {
      const corruptedManifest = {
        version: '1.0.0',
        frameworks: { id: 'test' } // Object instead of array
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(corruptedManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      // TypeScript will treat this as the frameworks property
      expect(frameworks).toBeDefined();
    });
  });

  describe('searchFrameworks - comprehensive', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should return all frameworks with empty query', async () => {
      const results = await frameworkManager.searchFrameworks('');

      expect(results).toHaveLength(4);
      expect(results).toEqual(mockManifest.frameworks);
    });

    it('should handle special characters in query', async () => {
      const results = await frameworkManager.searchFrameworks('C4 Model');

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('c4-model-strategy');
    });

    it('should handle regex special characters safely', async () => {
      // Should not throw error with regex special chars
      const results = await frameworkManager.searchFrameworks('test.*[abc]');

      expect(results).toHaveLength(0);
    });

    it('should handle very long query strings', async () => {
      const longQuery = 'a'.repeat(1000);
      const results = await frameworkManager.searchFrameworks(longQuery);

      expect(results).toHaveLength(0);
    });

    it('should handle Unicode characters in query', async () => {
      const results = await frameworkManager.searchFrameworks('策略');

      expect(results).toHaveLength(0);
    });

    it('should handle query with only whitespace', async () => {
      const results = await frameworkManager.searchFrameworks('   \t\n  ');

      expect(results).toHaveLength(4);
    });
  });

  describe('isFrameworkInstalled - comprehensive', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should return false when framework ID does not exist', async () => {
      const result = await frameworkManager.isFrameworkInstalled('non-existent-framework');

      expect(result).toBe(false);
      expect(mockFileSystem.fileExists).not.toHaveBeenCalled();
    });

    it('should check file existence for valid framework', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);

      const result = await frameworkManager.isFrameworkInstalled('tdd-bdd-strategy');

      expect(result).toBe(true);
      expect(mockFileSystem.fileExists).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md')
      );
    });

    it('should handle empty framework ID', async () => {
      const result = await frameworkManager.isFrameworkInstalled('');

      expect(result).toBe(false);
    });

    it('should handle null framework ID', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await frameworkManager.isFrameworkInstalled(null as any);

      expect(result).toBe(false);
    });

    it('should handle undefined framework ID', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await frameworkManager.isFrameworkInstalled(undefined as any);

      expect(result).toBe(false);
    });
  });

  describe('framework dependency checking', () => {
    it('should handle frameworks with dependencies', async () => {
      const manifestWithDeps = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'base-framework',
            name: 'Base Framework',
            description: 'Base framework',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'base.md',
            dependencies: []
          },
          {
            id: 'dependent-framework',
            name: 'Dependent Framework',
            description: 'Depends on base',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'dependent.md',
            dependencies: ['base-framework']
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestWithDeps));

      const framework = await frameworkManager.getFrameworkById('dependent-framework');

      expect(framework).toBeDefined();
      expect(framework?.dependencies).toEqual(['base-framework']);
    });

    it('should handle frameworks with multiple dependencies', async () => {
      const manifestWithDeps = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'multi-dep-framework',
            name: 'Multi Dependency Framework',
            description: 'Has multiple dependencies',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'multi-dep.md',
            dependencies: ['dep1', 'dep2', 'dep3']
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestWithDeps));

      const framework = await frameworkManager.getFrameworkById('multi-dep-framework');

      expect(framework?.dependencies).toHaveLength(3);
    });

    it('should handle circular dependencies gracefully', async () => {
      const manifestWithCircular = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'framework-a',
            name: 'Framework A',
            description: 'Depends on B',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'a.md',
            dependencies: ['framework-b']
          },
          {
            id: 'framework-b',
            name: 'Framework B',
            description: 'Depends on A',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'b.md',
            dependencies: ['framework-a']
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestWithCircular));

      const frameworkA = await frameworkManager.getFrameworkById('framework-a');
      const frameworkB = await frameworkManager.getFrameworkById('framework-b');

      expect(frameworkA?.dependencies).toContain('framework-b');
      expect(frameworkB?.dependencies).toContain('framework-a');
    });
  });

  describe('range and boundary conditions', () => {
    it('should handle manifest with 0 frameworks', async () => {
      const emptyManifest = {
        version: '1.0.0',
        frameworks: []
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(emptyManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(frameworks).toHaveLength(0);
    });

    it('should handle manifest with 100 frameworks', async () => {
      const largeManifest = {
        version: '1.0.0',
        frameworks: Array.from({ length: 100 }, (_, i) => ({
          id: `framework-${i}`,
          name: `Framework ${i}`,
          description: `Description ${i}`,
          category: FrameworkCategory.Architecture,
          version: '1.0.0',
          fileName: `framework-${i}.md`,
          dependencies: []
        }))
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(largeManifest));

      const frameworks = await frameworkManager.listAvailableFrameworks();

      expect(frameworks).toHaveLength(100);
    });

    it('should handle very long framework IDs (>255 chars)', async () => {
      const longId = 'a'.repeat(300);
      const manifestWithLongId = {
        version: '1.0.0',
        frameworks: [
          {
            id: longId,
            name: 'Long ID Framework',
            description: 'Framework with very long ID',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'long-id.md',
            dependencies: []
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestWithLongId));

      const framework = await frameworkManager.getFrameworkById(longId);

      expect(framework).toBeDefined();
      expect(framework?.id).toBe(longId);
      expect(framework?.id.length).toBe(300);
    });

    it('should handle framework with very long name', async () => {
      const longName = 'Framework Name '.repeat(50);
      const manifestWithLongName = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'long-name-framework',
            name: longName,
            description: 'Description',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'long-name.md',
            dependencies: []
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestWithLongName));

      const framework = await frameworkManager.getFrameworkById('long-name-framework');

      expect(framework?.name).toBe(longName);
    });

    it('should handle framework with very long description', async () => {
      const longDescription = 'Description text '.repeat(100);
      const manifestWithLongDesc = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'long-desc-framework',
            name: 'Framework',
            description: longDescription,
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'long-desc.md',
            dependencies: []
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestWithLongDesc));

      const framework = await frameworkManager.getFrameworkById('long-desc-framework');

      expect(framework?.description).toBe(longDescription);
    });
  });

  describe('manifest caching and cache invalidation', () => {
    it('should cache manifest after first load', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      await frameworkManager.listAvailableFrameworks();
      await frameworkManager.listAvailableFrameworks();
      await frameworkManager.listAvailableFrameworks();

      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when clearCaches is called', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      await frameworkManager.listAvailableFrameworks();
      frameworkManager.clearCaches();
      await frameworkManager.listAvailableFrameworks();

      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(2);
    });

    it('should use cached manifest across different method calls', async () => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));

      await frameworkManager.listAvailableFrameworks();
      await frameworkManager.getFrameworkById('tdd-bdd-strategy');
      await frameworkManager.searchFrameworks('test');
      await frameworkManager.getFrameworksByCategory(FrameworkCategory.Testing);

      expect(mockFileSystem.readFile).toHaveBeenCalledTimes(1);
    });

    it('should cache metadata with TTL', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      // First call loads metadata
      await frameworkManager.getInstalledFrameworks();
      // Second call within TTL should use cache
      await frameworkManager.getInstalledFrameworks();

      // Should read manifest once and metadata once (cached on second call)
      const metadataReads = mockFileSystem.readFile.mock.calls.filter(
        call => call[0].includes('installed-frameworks.json')
      );
      expect(metadataReads).toHaveLength(1);
    });
  });

  describe('concurrent framework operations', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
      mockFileSystem.ensureDirectory.mockResolvedValue(undefined);
    });

    it('should handle concurrent framework installations', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.installFramework('security-strategy', { overwrite: true }),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true })
      ];

      await Promise.all(installations);

      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent searches', async () => {
      const searches = [
        frameworkManager.searchFrameworks('test'),
        frameworkManager.searchFrameworks('security'),
        frameworkManager.searchFrameworks('architecture')
      ];

      const results = await Promise.all(searches);

      expect(results).toHaveLength(3);
      // Note: Concurrent calls may each trigger a read before cache is set
      expect(mockFileSystem.readFile).toHaveBeenCalled();
    });

    it('should handle concurrent getFrameworkById calls', async () => {
      const gets = [
        frameworkManager.getFrameworkById('tdd-bdd-strategy'),
        frameworkManager.getFrameworkById('security-strategy'),
        frameworkManager.getFrameworkById('c4-model-strategy')
      ];

      const results = await Promise.all(gets);

      expect(results.filter(r => r !== undefined)).toHaveLength(3);
      // Note: Concurrent calls may each trigger a read before cache is set
      expect(mockFileSystem.readFile).toHaveBeenCalled();
    });

    it('should handle race condition in metadata updates', async () => {
      let metadataReadCount = 0;
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          metadataReadCount++;
          if (metadataReadCount === 1) {
            return Promise.resolve(JSON.stringify({ frameworks: [] }));
          }
          return Promise.resolve(JSON.stringify({
            frameworks: [
              {
                id: 'tdd-bdd-strategy',
                version: '1.0.0',
                installedAt: '2025-01-15T10:30:00Z',
                customized: false
              }
            ]
          }));
        }
        return Promise.reject(new Error('File not found'));
      });

      // Concurrent installations might read stale metadata
      await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });

      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });
  });

  describe('edge cases - special framework properties', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(mockManifest));
    });

    it('should handle framework with empty dependencies array', async () => {
      const framework = await frameworkManager.getFrameworkById('tdd-bdd-strategy');

      expect(framework?.dependencies).toEqual([]);
    });

    it('should handle framework with undefined dependencies', async () => {
      const manifestNoDeps = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'no-deps',
            name: 'No Dependencies',
            description: 'Framework without dependencies property',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'no-deps.md'
            // No dependencies property
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestNoDeps));

      const framework = await frameworkManager.getFrameworkById('no-deps');

      expect(framework?.dependencies).toBeUndefined();
    });

    it('should handle framework with special characters in fileName', async () => {
      const manifestSpecialChars = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'special-chars',
            name: 'Special Chars',
            description: 'Framework with special chars in filename',
            category: FrameworkCategory.Architecture,
            version: '1.0.0',
            fileName: 'strategy-special_chars-v1.0.md',
            dependencies: []
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestSpecialChars));

      const framework = await frameworkManager.getFrameworkById('special-chars');

      expect(framework?.fileName).toBe('strategy-special_chars-v1.0.md');
    });

    it('should handle framework with version containing pre-release tags', async () => {
      const manifestPreRelease = {
        version: '1.0.0',
        frameworks: [
          {
            id: 'pre-release',
            name: 'Pre-release Framework',
            description: 'Framework with pre-release version',
            category: FrameworkCategory.Architecture,
            version: '1.0.0-beta.1',
            fileName: 'pre-release.md',
            dependencies: []
          }
        ]
      };
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(manifestPreRelease));

      const framework = await frameworkManager.getFrameworkById('pre-release');

      expect(framework?.version).toBe('1.0.0-beta.1');
    });
  });

  describe('getInstalledFrameworkMetadata', () => {
    it('should return metadata for installed framework', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      const result = await frameworkManager.getInstalledFrameworkMetadata('tdd-bdd-strategy');

      expect(result).toBeDefined();
      expect(result?.id).toBe('tdd-bdd-strategy');
      expect(result?.version).toBe('1.0.0');
      expect(result?.customized).toBe(false);
    });

    it('should return undefined for non-installed framework', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      const result = await frameworkManager.getInstalledFrameworkMetadata('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('markFrameworkAsCustomized', () => {
    it('should mark framework as customized', async () => {
      const metadata = {
        frameworks: [
          {
            id: 'tdd-bdd-strategy',
            version: '1.0.0',
            installedAt: '2025-01-15T10:30:00Z',
            customized: false
          }
        ]
      };

      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify(metadata));
        }
        return Promise.reject(new Error('File not found'));
      });

      await frameworkManager.markFrameworkAsCustomized('tdd-bdd-strategy');

      const writeCall = mockFileSystem.writeFile.mock.calls.find(call =>
        call[0].includes('installed-frameworks.json')
      );
      expect(writeCall).toBeDefined();

      const writtenMetadata = JSON.parse(writeCall![1]);
      expect(writtenMetadata.frameworks[0].customized).toBe(true);
      expect(writtenMetadata.frameworks[0].customizedAt).toBeDefined();
    });

    it('should not throw error for non-existent framework', async () => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      await expect(
        frameworkManager.markFrameworkAsCustomized('non-existent')
      ).resolves.not.toThrow();
    });
  });
});
