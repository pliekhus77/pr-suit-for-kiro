import * as vscode from 'vscode';
import { SteeringTreeProvider } from '../steering-tree-provider';
import { FileSystemOperations } from '../../utils/file-system';
import { FrameworkManager } from '../../services/framework-manager';
import { SteeringCategory } from '../../models/steering';

// Mock vscode
jest.mock('vscode');

describe('SteeringTreeProvider', () => {
  let provider: SteeringTreeProvider;
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockFrameworkManager: jest.Mocked<FrameworkManager>;

  beforeEach(() => {
    // Reset modules to ensure fresh mocks
    jest.resetModules();
    
    // Create mocks
    mockFileSystem = {
      getSteeringPath: jest.fn(),
      directoryExists: jest.fn(),
      listFiles: jest.fn(),
      ensureDirectory: jest.fn(),
      fileExists: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      copyFile: jest.fn(),
      deleteFile: jest.fn(),
      getWorkspacePath: jest.fn(),
      getKiroPath: jest.fn(),
      getFrameworksPath: jest.fn(),
      getMetadataPath: jest.fn(),
      getSpecsPath: jest.fn(),
      getSettingsPath: jest.fn()
    } as unknown as jest.Mocked<FileSystemOperations>;

    mockFrameworkManager = {
      getFrameworkById: jest.fn(),
      listAvailableFrameworks: jest.fn(),
      installFramework: jest.fn(),
      isFrameworkInstalled: jest.fn(),
      checkForUpdates: jest.fn(),
      updateFramework: jest.fn(),
      updateAllFrameworks: jest.fn(),
      removeFramework: jest.fn(),
      searchFrameworks: jest.fn(),
      getFrameworksByCategory: jest.fn(),
      getInstalledFrameworks: jest.fn()
    } as unknown as jest.Mocked<FrameworkManager>;

    provider = new SteeringTreeProvider(mockFileSystem, mockFrameworkManager);
  });

  describe('getChildren', () => {
    it('should return empty array when steering path throws error', async () => {
      mockFileSystem.getSteeringPath.mockImplementation(() => {
        throw new Error('No workspace open');
      });

      const children = await provider.getChildren();

      expect(children).toEqual([]);
    });

    it('should return empty array when steering directory does not exist', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(false);

      const children = await provider.getChildren();

      expect(children).toEqual([]);
      expect(mockFileSystem.directoryExists).toHaveBeenCalledWith('/workspace/.kiro/steering');
    });

    it('should return categories when no element provided', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'strategy-tdd-bdd.md',
        'strategy-security.md',
        'product.md',
        'tech.md',
        'custom-team.md'
      ]);

      const children = await provider.getChildren();

      expect(children).toHaveLength(3);
      expect(children[0].label).toBe('Strategies (Installed)');
      expect(children[0].category).toBe(SteeringCategory.Strategy);
      expect(children[0].isCategory).toBe(true);
      
      expect(children[1].label).toBe('Project (Team-Created)');
      expect(children[1].category).toBe(SteeringCategory.Product);
      expect(children[1].isCategory).toBe(true);
      
      expect(children[2].label).toBe('Custom (Team-Created)');
      expect(children[2].category).toBe(SteeringCategory.Custom);
      expect(children[2].isCategory).toBe(true);
    });

    it('should return only Strategies category when only strategy files exist', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'strategy-tdd-bdd.md',
        'strategy-security.md'
      ]);

      const children = await provider.getChildren();

      expect(children).toHaveLength(1);
      expect(children[0].label).toBe('Strategies (Installed)');
      expect(children[0].category).toBe(SteeringCategory.Strategy);
    });

    it('should return files for Strategy category', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'strategy-tdd-bdd.md',
        'strategy-security.md',
        'product.md'
      ]);

      const categoryItem = {
        label: 'Strategies (Installed)',
        resourceUri: '',
        category: SteeringCategory.Strategy,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      };

      const children = await provider.getChildren(categoryItem);

      expect(children).toHaveLength(2);
      expect(children[0].label).toBe('strategy-security.md');
      expect(children[0].category).toBe(SteeringCategory.Strategy);
      expect(children[0].frameworkId).toBe('security-strategy');
      expect(children[0].contextValue).toBe('steeringStrategy');
      
      expect(children[1].label).toBe('strategy-tdd-bdd.md');
      expect(children[1].category).toBe(SteeringCategory.Strategy);
      expect(children[1].frameworkId).toBe('tdd-bdd-strategy');
    });

    it('should return files for Project category', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'product.md',
        'tech.md',
        'structure.md',
        'strategy-tdd-bdd.md'
      ]);

      const categoryItem = {
        label: 'Project (Team-Created)',
        resourceUri: '',
        category: SteeringCategory.Product,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      };

      const children = await provider.getChildren(categoryItem);

      expect(children).toHaveLength(3);
      expect(children.map(c => c.label)).toEqual(['product.md', 'structure.md', 'tech.md']);
      expect(children[0].contextValue).toBe('steeringProject');
    });

    it('should return files for Custom category', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'custom-team.md',
        'custom-standards.md',
        'product.md'
      ]);

      const categoryItem = {
        label: 'Custom (Team-Created)',
        resourceUri: '',
        category: SteeringCategory.Custom,
        isCustom: true,
        contextValue: 'steeringCategory',
        isCategory: true
      };

      const children = await provider.getChildren(categoryItem);

      expect(children).toHaveLength(2);
      expect(children.map(c => c.label)).toEqual(['custom-standards.md', 'custom-team.md']);
      expect(children[0].category).toBe(SteeringCategory.Custom);
      expect(children[0].isCustom).toBe(true);
      expect(children[0].contextValue).toBe('steeringCustom');
    });
  });

  describe('getTreeItem', () => {
    it('should return tree item for category', () => {
      const categoryItem = {
        label: 'Strategies (Installed)',
        resourceUri: '',
        category: SteeringCategory.Strategy,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      };

      const treeItem = provider.getTreeItem(categoryItem);

      expect(treeItem).toBeDefined();
      expect(treeItem).toBeInstanceOf(vscode.TreeItem);
      expect(treeItem.label).toBe('Strategies (Installed)');
      expect(treeItem.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Expanded);
      expect(treeItem.contextValue).toBe('steeringCategory');
    });

    it('should return tree item for file with command', () => {
      const fileItem = {
        label: 'strategy-tdd-bdd.md',
        resourceUri: '/workspace/.kiro/steering/strategy-tdd-bdd.md',
        category: SteeringCategory.Strategy,
        frameworkId: 'tdd-bdd-strategy',
        isCustom: false,
        contextValue: 'steeringStrategy'
      };

      const treeItem = provider.getTreeItem(fileItem);

      expect(treeItem.label).toBe('strategy-tdd-bdd.md');
      expect(treeItem.collapsibleState).toBe(vscode.TreeItemCollapsibleState.None);
      expect(treeItem.contextValue).toBe('steeringStrategy');
      expect(treeItem.command).toBeDefined();
      expect(treeItem.command?.command).toBe('vscode.open');
    });
  });

  describe('refresh', () => {
    it('should call refresh method without errors', () => {
      // Just verify that refresh can be called without throwing
      expect(() => provider.refresh()).not.toThrow();
    });
  });

  describe('categorization', () => {
    it('should categorize strategy files correctly', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'strategy-tdd-bdd.md',
        'strategy-c4-model.md',
        'strategy-azure.md'
      ]);

      const children = await provider.getChildren();
      expect(children).toHaveLength(1);
      expect(children[0].category).toBe(SteeringCategory.Strategy);
    });

    it('should categorize project files correctly', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'product.md',
        'tech.md',
        'structure.md'
      ]);

      const children = await provider.getChildren();
      expect(children).toHaveLength(1);
      expect(children[0].category).toBe(SteeringCategory.Product);
    });

    it('should categorize custom files correctly', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue([
        'custom-team.md',
        'my-custom-doc.md'
      ]);

      const children = await provider.getChildren();
      expect(children).toHaveLength(1);
      expect(children[0].category).toBe(SteeringCategory.Custom);
    });
  });

  describe('framework ID extraction', () => {
    it('should extract framework ID from strategy files', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue(['strategy-tdd-bdd.md']);

      const categoryItem = {
        label: 'Strategies (Installed)',
        resourceUri: '',
        category: SteeringCategory.Strategy,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      };

      const children = await provider.getChildren(categoryItem);

      expect(children[0].frameworkId).toBe('tdd-bdd-strategy');
    });

    it('should not have framework ID for non-strategy files', async () => {
      mockFileSystem.getSteeringPath.mockReturnValue('/workspace/.kiro/steering');
      mockFileSystem.directoryExists.mockResolvedValue(true);
      mockFileSystem.listFiles.mockResolvedValue(['product.md']);

      const categoryItem = {
        label: 'Project (Team-Created)',
        resourceUri: '',
        category: SteeringCategory.Product,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      };

      const children = await provider.getChildren(categoryItem);

      expect(children[0].frameworkId).toBeUndefined();
    });
  });
});
