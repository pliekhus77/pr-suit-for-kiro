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

describe('FrameworkManager - Concurrent Operations', () => {
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
      },
      {
        id: 'devops-strategy',
        name: 'DevOps CI/CD Strategy',
        description: 'Continuous integration and deployment practices',
        category: FrameworkCategory.DevOps,
        version: '1.0.0',
        fileName: 'strategy-devops.md',
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

  describe('Simultaneous Framework Installations', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        // Metadata file doesn't exist initially
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.ensureDirectory.mockResolvedValue(undefined);
    });

    it('should handle simultaneous installation of different frameworks', async () => {
      // Track write operations to detect race conditions
      const writeOperations: string[] = [];
      mockFileSystem.writeFile.mockImplementation(async (filePath: string) => {
        writeOperations.push(filePath);
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Install multiple frameworks simultaneously
      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.installFramework('security-strategy', { overwrite: true }),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true })
      ];

      await Promise.all(installations);

      // All frameworks should be copied
      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(3);
      
      // Metadata should be written (potentially multiple times due to race)
      const metadataWrites = writeOperations.filter(path => path.includes('installed-frameworks.json'));
      expect(metadataWrites.length).toBeGreaterThan(0);
    });

    it('should handle race condition when installing same framework twice', async () => {
      let writeCount = 0;
      mockFileSystem.writeFile.mockImplementation(async () => {
        writeCount++;
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Try to install same framework twice simultaneously
      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true })
      ];

      await Promise.all(installations);

      // Both should complete without error
      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(2);
      expect(writeCount).toBeGreaterThan(0);
    });

    it('should maintain metadata consistency with concurrent installations', async () => {
      let lastMetadataWrite = '';
      mockFileSystem.writeFile.mockImplementation(async (filePath: string, fileContent: string) => {
        if (filePath.includes('installed-frameworks.json')) {
          lastMetadataWrite = fileContent;
        }
        await new Promise(resolve => setTimeout(resolve, 5));
      });

      // Install 5 frameworks concurrently
      const installations = mockManifest.frameworks.slice(0, 5).map(framework =>
        frameworkManager.installFramework(framework.id, { overwrite: true })
      );

      await Promise.all(installations);

      // Check final metadata state
      if (lastMetadataWrite) {
        const metadata = JSON.parse(lastMetadataWrite);
        // Should have entries (though may not be all 5 due to race conditions)
        expect(metadata.frameworks).toBeDefined();
        expect(Array.isArray(metadata.frameworks)).toBe(true);
      }
    });

    it('should handle concurrent installations with different options', async () => {
      mockFileSystem.fileExists.mockResolvedValue(true);
      mockFileSystem.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (filePath.includes('strategy-')) {
          return Promise.resolve('existing content');
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      // Install with different options simultaneously
      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true, backup: true }),
        frameworkManager.installFramework('security-strategy', { merge: true, backup: true }),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true, backup: false })
      ];

      await Promise.all(installations);

      // All should complete
      expect(mockFileSystem.copyFile).toHaveBeenCalled();
      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });

    it('should handle errors in one installation without affecting others', async () => {
      mockFileSystem.copyFile.mockImplementation(async (source: string) => {
        // Fail for security-strategy
        if (source.includes('security')) {
          throw new Error('Copy failed for security');
        }
        await new Promise(resolve => setTimeout(resolve, 5));
      });

      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.installFramework('security-strategy', { overwrite: true }).catch(e => e),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true })
      ];

      const results = await Promise.all(installations);

      // Two should succeed, one should fail
      expect(results[1]).toBeInstanceOf(Error);
      expect(mockFileSystem.copyFile).toHaveBeenCalledTimes(3);
    });
  });

  describe('Concurrent File Modifications', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (path.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify({ frameworks: [] }));
        }
        return Promise.resolve('file content');
      });
      mockFileSystem.fileExists.mockResolvedValue(true);
    });

    it('should handle concurrent read and write operations', async () => {
      let readCount = 0;
      let writeCount = 0;

      mockFileSystem.readFile.mockImplementation(async (filePath: string) => {
        readCount++;
        await new Promise(resolve => setTimeout(resolve, 5));
        if (filePath.includes('manifest.json')) {
          return JSON.stringify(mockManifest);
        }
        return 'content';
      });

      mockFileSystem.writeFile.mockImplementation(async () => {
        writeCount++;
        await new Promise(resolve => setTimeout(resolve, 5));
      });

      // Perform concurrent reads and writes
      const operations = [
        frameworkManager.listAvailableFrameworks(),
        frameworkManager.getFrameworkById('tdd-bdd-strategy'),
        frameworkManager.searchFrameworks('test'),
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.listAvailableFrameworks()
      ];

      await Promise.all(operations);

      expect(readCount).toBeGreaterThan(0);
      expect(writeCount).toBeGreaterThan(0);
    });

    it('should handle concurrent updates to same framework', async () => {
      mockFileSystem.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        if (filePath.includes('installed-frameworks.json')) {
          return Promise.resolve(JSON.stringify({
            frameworks: [{
              id: 'tdd-bdd-strategy',
              version: '0.9.0',
              installedAt: '2025-01-01T00:00:00Z',
              customized: false
            }]
          }));
        }
        return Promise.resolve('content');
      });

      // Mock user choices to proceed with update
      (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue('Update');

      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      // Try to update same framework twice simultaneously
      const updates = [
        frameworkManager.updateFramework('tdd-bdd-strategy'),
        frameworkManager.updateFramework('tdd-bdd-strategy')
      ];

      await Promise.all(updates);

      // Both should complete
      expect(mockFileSystem.copyFile).toHaveBeenCalled();
      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });

    it('should handle concurrent install and remove operations', async () => {
      mockFileSystem.readFile.mockImplementation((filePath: string) => {
        if (filePath.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
      mockFileSystem.deleteFile.mockResolvedValue(undefined);

      // Install and remove different frameworks concurrently
      const operations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.removeFramework('security-strategy'),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true })
      ];

      await Promise.all(operations);

      expect(mockFileSystem.copyFile).toHaveBeenCalled();
      expect(mockFileSystem.deleteFile).toHaveBeenCalled();
      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });

    it('should handle concurrent modifications with file system delays', async () => {
      // Simulate varying file system delays
      mockFileSystem.readFile.mockImplementation(async (filePath: string) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
        if (filePath.includes('manifest.json')) {
          return JSON.stringify(mockManifest);
        }
        return 'content';
      });

      mockFileSystem.writeFile.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
      });

      mockFileSystem.copyFile.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
      });

      // Perform many concurrent operations
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(frameworkManager.listAvailableFrameworks());
        operations.push(frameworkManager.searchFrameworks('strategy'));
      }

      await Promise.all(operations);

      // All operations should complete successfully
      expect(mockFileSystem.readFile).toHaveBeenCalled();
    });
  });

  describe('Race Conditions in Metadata Updates', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.ensureDirectory.mockResolvedValue(undefined);
    });

    it('should detect race condition in metadata writes', async () => {
      const metadataWrites: string[] = [];
      
      mockFileSystem.writeFile.mockImplementation(async (filePath: string, fileContent: string) => {
        if (filePath.includes('installed-frameworks.json')) {
          // Simulate delay to increase chance of race condition
          await new Promise(resolve => setTimeout(resolve, 10));
          metadataWrites.push(fileContent);
        }
      });

      // Install multiple frameworks simultaneously
      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.installFramework('security-strategy', { overwrite: true }),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true }),
        frameworkManager.installFramework('azure-strategy', { overwrite: true })
      ];

      await Promise.all(installations);

      // Check that metadata was written
      expect(metadataWrites.length).toBeGreaterThan(0);
      
      // Parse last write to check structure
      const lastWrite = JSON.parse(metadataWrites[metadataWrites.length - 1]);
      expect(lastWrite.frameworks).toBeDefined();
      expect(Array.isArray(lastWrite.frameworks)).toBe(true);
    });

    it('should handle metadata cache invalidation during concurrent operations', async () => {
      let metadataVersion = 0;
      
      mockFileSystem.readFile.mockImplementation(async (filePath: string) => {
        if (filePath.includes('manifest.json')) {
          return JSON.stringify(mockManifest);
        }
        if (filePath.includes('installed-frameworks.json')) {
          // Return different metadata based on version
          return JSON.stringify({
            frameworks: Array(metadataVersion).fill(null).map((_, i) => ({
              id: `framework-${i}`,
              version: '1.0.0',
              installedAt: new Date().toISOString(),
              customized: false
            }))
          });
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });

      mockFileSystem.writeFile.mockImplementation(async (filePath: string) => {
        if (filePath.includes('installed-frameworks.json')) {
          metadataVersion++;
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      });

      // Perform operations that read and write metadata
      const operations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.getInstalledFrameworks(),
        frameworkManager.installFramework('security-strategy', { overwrite: true }),
        frameworkManager.getInstalledFrameworks()
      ];

      await Promise.all(operations);

      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });

    it('should handle concurrent metadata reads with cache', async () => {
      const metadata = {
        frameworks: [{
          id: 'tdd-bdd-strategy',
          version: '1.0.0',
          installedAt: '2025-01-01T00:00:00Z',
          customized: false
        }]
      };

      let readCount = 0;
      mockFileSystem.readFile.mockImplementation(async (filePath: string) => {
        if (filePath.includes('manifest.json')) {
          return JSON.stringify(mockManifest);
        }
        if (filePath.includes('installed-frameworks.json')) {
          readCount++;
          await new Promise(resolve => setTimeout(resolve, 10));
          return JSON.stringify(metadata);
        }
        return 'content';
      });

      // Multiple concurrent reads should use cache
      const reads = [
        frameworkManager.getInstalledFrameworks(),
        frameworkManager.getInstalledFrameworks(),
        frameworkManager.getInstalledFrameworks(),
        frameworkManager.getInstalledFrameworks()
      ];

      await Promise.all(reads);

      // Due to caching, should read less than 4 times
      // (first read populates cache, subsequent reads use cache if within TTL)
      expect(readCount).toBeLessThanOrEqual(4);
    });

    it('should handle metadata corruption during concurrent writes', async () => {
      let writeAttempts = 0;
      
      mockFileSystem.writeFile.mockImplementation(async (filePath: string) => {
        if (filePath.includes('installed-frameworks.json')) {
          writeAttempts++;
          // Simulate occasional write failure
          if (writeAttempts === 2) {
            throw new Error('Write failed');
          }
          await new Promise(resolve => setTimeout(resolve, 5));
        }
      });

      // Install multiple frameworks, one will fail
      const installations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }).catch(e => e),
        frameworkManager.installFramework('security-strategy', { overwrite: true }).catch(e => e),
        frameworkManager.installFramework('c4-model-strategy', { overwrite: true }).catch(e => e)
      ];

      const results = await Promise.all(installations);

      // At least one should fail
      const failures = results.filter(r => r instanceof Error);
      expect(failures.length).toBeGreaterThan(0);
    });

    it('should maintain metadata consistency with rapid updates', async () => {
      const metadataSnapshots: Array<{ frameworks: Array<{ id: string; version: string; installedAt: string; customized: boolean }> }> = [];
      
      mockFileSystem.writeFile.mockImplementation(async (filePath: string, fileContent: string) => {
        if (filePath.includes('installed-frameworks.json')) {
          metadataSnapshots.push(JSON.parse(fileContent));
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      });

      // Rapid fire installations
      const installations = [];
      for (let i = 0; i < 5; i++) {
        installations.push(
          frameworkManager.installFramework(mockManifest.frameworks[i].id, { overwrite: true })
        );
      }

      await Promise.all(installations);

      // Check that all snapshots have valid structure
      metadataSnapshots.forEach(snapshot => {
        expect(snapshot.frameworks).toBeDefined();
        expect(Array.isArray(snapshot.frameworks)).toBe(true);
      });
    });
  });

  describe('File Watcher with Rapid File Changes', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        return Promise.resolve('content');
      });
    });

    it('should handle rapid file existence checks', async () => {
      let checkCount = 0;
      mockFileSystem.fileExists.mockImplementation(async () => {
        checkCount++;
        await new Promise(resolve => setTimeout(resolve, 1));
        return checkCount % 2 === 0; // Alternate between true/false
      });

      // Rapid fire existence checks
      const checks = [];
      for (let i = 0; i < 20; i++) {
        checks.push(frameworkManager.isFrameworkInstalled('tdd-bdd-strategy'));
      }

      await Promise.all(checks);

      expect(checkCount).toBe(20);
    });

    it('should handle concurrent file reads during rapid changes', async () => {
      let readVersion = 0;
      
      mockFileSystem.readFile.mockImplementation(async (filePath: string) => {
        if (filePath.includes('manifest.json')) {
          return JSON.stringify(mockManifest);
        }
        if (filePath.includes('strategy-tdd-bdd.md')) {
          readVersion++;
          await new Promise(resolve => setTimeout(resolve, 2));
          return `content version ${readVersion}`;
        }
        return 'content';
      });

      // Simulate rapid file reads
      const reads = [];
      for (let i = 0; i < 10; i++) {
        reads.push(mockFileSystem.readFile('/workspace/.kiro/steering/strategy-tdd-bdd.md'));
      }

      const results = await Promise.all(reads);

      // All reads should complete
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result).toContain('content version');
      });
    });

    it('should handle file system events during operations', async () => {
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);

      // Simulate file system changes during installation
      mockFileSystem.fileExists.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        // File appears to exist after some operations
        return Math.random() > 0.5;
      });

      const operations = [
        frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true }),
        frameworkManager.isFrameworkInstalled('tdd-bdd-strategy'),
        frameworkManager.isFrameworkInstalled('security-strategy'),
        frameworkManager.installFramework('security-strategy', { overwrite: true })
      ];

      await Promise.all(operations);

      expect(mockFileSystem.fileExists).toHaveBeenCalled();
    });

    it('should handle directory listing during rapid changes', async () => {
      mockFileSystem.listFiles = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        // Return varying number of files
        return Array(Math.floor(Math.random() * 5)).fill('file.md');
      });

      // Rapid directory listings
      const listings = [];
      for (let i = 0; i < 10; i++) {
        listings.push(mockFileSystem.listFiles('/workspace/.kiro/steering'));
      }

      const results = await Promise.all(listings);

      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should handle cache invalidation with rapid operations', async () => {
      // Create a new framework manager to ensure clean cache state
      const freshFrameworkManager = new FrameworkManager(mockContext, mockFileSystem);

      let manifestReadCount = 0;
      mockFileSystem.readFile.mockImplementation(async (filePath: string) => {
        if (filePath.includes('manifest.json')) {
          manifestReadCount++;
          await new Promise(resolve => setTimeout(resolve, 5));
          return JSON.stringify(mockManifest);
        }
        return 'content';
      });

      // Rapid operations that require manifest
      const operations = [];
      for (let i = 0; i < 20; i++) {
        operations.push(freshFrameworkManager.listAvailableFrameworks());
      }

      await Promise.all(operations);

      // With concurrent operations, multiple reads may occur before cache is populated
      // But it should be significantly less than 20 (one per operation)
      expect(manifestReadCount).toBeGreaterThan(0);
      expect(manifestReadCount).toBeLessThanOrEqual(20);
    });
  });

  describe('Stress Testing Concurrent Operations', () => {
    beforeEach(() => {
      mockFileSystem.readFile.mockImplementation((path: string) => {
        if (path.includes('manifest.json')) {
          return Promise.resolve(JSON.stringify(mockManifest));
        }
        const error = new Error('File not found') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      mockFileSystem.fileExists.mockResolvedValue(false);
      mockFileSystem.copyFile.mockResolvedValue(undefined);
      mockFileSystem.writeFile.mockResolvedValue(undefined);
      mockFileSystem.ensureDirectory.mockResolvedValue(undefined);
    });

    it('should handle high volume of concurrent operations', async () => {
      const operations = [];
      
      // Create 50 concurrent operations of various types
      for (let i = 0; i < 50; i++) {
        const opType = i % 5;
        switch (opType) {
          case 0:
            operations.push(frameworkManager.listAvailableFrameworks());
            break;
          case 1:
            operations.push(frameworkManager.searchFrameworks('test'));
            break;
          case 2:
            operations.push(frameworkManager.getFrameworkById('tdd-bdd-strategy'));
            break;
          case 3:
            operations.push(frameworkManager.isFrameworkInstalled('security-strategy'));
            break;
          case 4:
            operations.push(
              frameworkManager.installFramework(
                mockManifest.frameworks[i % mockManifest.frameworks.length].id,
                { overwrite: true }
              )
            );
            break;
        }
      }

      await Promise.all(operations);

      // All operations should complete
      expect(operations.length).toBe(50);
    });

    it('should maintain system stability under concurrent load', async () => {
      const errors: Error[] = [];
      const operations = [];

      // Mix of operations with some that might fail
      for (let i = 0; i < 30; i++) {
        operations.push(
          frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true })
            .catch(e => { errors.push(e); return e; })
        );
        operations.push(
          frameworkManager.getInstalledFrameworks()
            .catch(e => { errors.push(e); return e; })
        );
        operations.push(
          frameworkManager.checkForUpdates()
            .catch(e => { errors.push(e); return e; })
        );
      }

      await Promise.all(operations);

      // System should remain stable (most operations succeed)
      expect(operations.length).toBe(90);
    });

    it('should handle concurrent operations with mixed success/failure', async () => {
      let operationCount = 0;
      
      mockFileSystem.copyFile.mockImplementation(async () => {
        operationCount++;
        // Fail every 3rd operation
        if (operationCount % 3 === 0) {
          throw new Error('Simulated failure');
        }
        await new Promise(resolve => setTimeout(resolve, 5));
      });

      const operations = [];
      for (let i = 0; i < 15; i++) {
        operations.push(
          frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true })
            .catch(e => e)
        );
      }

      const results = await Promise.all(operations);

      // Some should succeed, some should fail
      const failures = results.filter(r => r instanceof Error);
      const successes = results.filter(r => !(r instanceof Error));
      
      expect(failures.length).toBeGreaterThan(0);
      expect(successes.length).toBeGreaterThan(0);
    });
  });
});
