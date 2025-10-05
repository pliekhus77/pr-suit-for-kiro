import * as vscode from 'vscode';
import { browseFrameworksCommand, updateFrameworkCommand, updateAllFrameworksCommand, FrameworkQuickPickItem } from '../framework-commands';
import { FrameworkManager } from '../../services/framework-manager';
import { Framework, FrameworkCategory, FrameworkUpdate } from '../../models/framework';

// Mock VS Code API
jest.mock('vscode');

describe('Framework Commands Integration Tests', () => {
  let mockContext: vscode.ExtensionContext;
  let mockFrameworkManager: jest.Mocked<FrameworkManager>;
  let mockFrameworks: Framework[];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock context
    mockContext = {
      extensionPath: '/mock/extension/path',
      subscriptions: [],
      globalState: {
        get: jest.fn(),
        update: jest.fn()
      }
    } as unknown as vscode.ExtensionContext;

    // Create mock frameworks
    mockFrameworks = [
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
      }
    ];

    // Create mock framework manager
    mockFrameworkManager = {
      listAvailableFrameworks: jest.fn().mockResolvedValue(mockFrameworks),
      getInstalledFrameworks: jest.fn().mockResolvedValue([mockFrameworks[0]]), // First one is installed
      installFramework: jest.fn().mockResolvedValue(undefined),
      updateFramework: jest.fn().mockResolvedValue(undefined),
      checkForUpdates: jest.fn().mockResolvedValue([]),
      getFrameworkById: jest.fn((id: string) => 
        Promise.resolve(mockFrameworks.find(f => f.id === id))
      )
    } as unknown as jest.Mocked<FrameworkManager>;
  });

  describe('browseFrameworksCommand', () => {
    it('should display quick pick with all available frameworks', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      mockShowQuickPick.mockResolvedValue(undefined); // User cancels

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.listAvailableFrameworks).toHaveBeenCalled();
      expect(mockFrameworkManager.getInstalledFrameworks).toHaveBeenCalled();
      expect(mockShowQuickPick).toHaveBeenCalled();

      // Verify quick pick items structure
      const quickPickCall = mockShowQuickPick.mock.calls[0];
      const items = quickPickCall[0] as FrameworkQuickPickItem[];
      
      // Should have category separators + frameworks
      expect(items.length).toBeGreaterThan(mockFrameworks.length);
      
      // Check for category separators
      const separators = items.filter(item => item.kind === vscode.QuickPickItemKind.Separator);
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should group frameworks by category', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      mockShowQuickPick.mockResolvedValue(undefined);

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      const quickPickCall = mockShowQuickPick.mock.calls[0];
      const items = quickPickCall[0] as FrameworkQuickPickItem[];
      
      // Find category separators
      const architectureSeparator = items.find(
        item => item.kind === vscode.QuickPickItemKind.Separator && item.label === 'Architecture'
      );
      const testingSeparator = items.find(
        item => item.kind === vscode.QuickPickItemKind.Separator && item.label === 'Testing'
      );
      const securitySeparator = items.find(
        item => item.kind === vscode.QuickPickItemKind.Separator && item.label === 'Security'
      );

      expect(architectureSeparator).toBeDefined();
      expect(testingSeparator).toBeDefined();
      expect(securitySeparator).toBeDefined();
    });

    it('should indicate installed frameworks with checkmark icon', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      mockShowQuickPick.mockResolvedValue(undefined);

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      const quickPickCall = mockShowQuickPick.mock.calls[0];
      const items = quickPickCall[0] as FrameworkQuickPickItem[];
      
      // Find the installed framework (first one)
      const installedItem = items.find(
        item => item.frameworkId === 'tdd-bdd-strategy'
      );
      
      expect(installedItem).toBeDefined();
      expect(installedItem!.label).toContain('$(check)');
      expect(installedItem!.installed).toBe(true);
    });

    it('should not show checkmark for non-installed frameworks', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      mockShowQuickPick.mockResolvedValue(undefined);

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      const quickPickCall = mockShowQuickPick.mock.calls[0];
      const items = quickPickCall[0] as FrameworkQuickPickItem[];
      
      // Find a non-installed framework
      const notInstalledItem = items.find(
        item => item.frameworkId === 'security-strategy'
      );
      
      expect(notInstalledItem).toBeDefined();
      expect(notInstalledItem!.label).not.toContain('$(check)');
      expect(notInstalledItem!.installed).toBe(false);
    });

    it('should show framework preview when framework is selected', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      
      // Mock user selecting a framework
      const selectedFramework = mockFrameworks[1]; // Security strategy
      mockShowQuickPick.mockResolvedValue({
        frameworkId: selectedFramework.id,
        category: selectedFramework.category,
        version: selectedFramework.version,
        installed: false,
        framework: selectedFramework,
        label: selectedFramework.name,
        description: `v${selectedFramework.version}`,
        detail: selectedFramework.description
      } as FrameworkQuickPickItem);
      
      mockShowInformationMessage.mockResolvedValue('Cancel');

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      expect(mockShowInformationMessage).toHaveBeenCalled();
      
      // Verify preview message contains framework details
      const previewCall = mockShowInformationMessage.mock.calls[0];
      const message = previewCall[0] as string;
      
      expect(message).toContain(selectedFramework.name);
      expect(message).toContain(selectedFramework.version);
      expect(message).toContain('Not Installed');
    });

    it('should handle installation from preview', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      
      const selectedFramework = mockFrameworks[1];
      mockShowQuickPick.mockResolvedValue({
        frameworkId: selectedFramework.id,
        category: selectedFramework.category,
        version: selectedFramework.version,
        installed: false,
        framework: selectedFramework
      } as FrameworkQuickPickItem);
      
      mockShowInformationMessage.mockResolvedValue('Install');
      mockWithProgress.mockImplementation(async (options, task) => {
        await task();
      });

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.installFramework).toHaveBeenCalledWith(selectedFramework.id);
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const mockShowErrorMessage = vscode.window.showErrorMessage as jest.Mock;
      mockFrameworkManager.listAvailableFrameworks.mockRejectedValue(
        new Error('Failed to load frameworks')
      );

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      expect(mockShowErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('Failed to browse frameworks')
      );
    });

    it('should show correct options for installed frameworks', async () => {
      // Arrange
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      
      const installedFramework = mockFrameworks[0];
      mockShowQuickPick.mockResolvedValue({
        frameworkId: installedFramework.id,
        category: installedFramework.category,
        version: installedFramework.version,
        installed: true,
        framework: installedFramework
      } as FrameworkQuickPickItem);
      
      mockShowInformationMessage.mockResolvedValue('Cancel');

      // Act
      await browseFrameworksCommand(mockContext, mockFrameworkManager);

      // Assert
      const previewCall = mockShowInformationMessage.mock.calls[0];
      const options = previewCall.slice(2); // Skip message and modal option
      
      // Should not have "Install" option for installed frameworks
      expect(options).not.toContain('Install');
      expect(options).toContain('View Full Documentation');
      expect(options).toContain('Cancel');
    });
  });

  describe('updateFrameworkCommand', () => {
    it('should show message when all frameworks are up to date', async () => {
      // Arrange
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockFrameworkManager.checkForUpdates.mockResolvedValue([]);

      // Act
      await updateFrameworkCommand(mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.checkForUpdates).toHaveBeenCalled();
      expect(mockShowInformationMessage).toHaveBeenCalledWith('All frameworks are up to date');
    });

    it('should show quick pick when updates are available and no frameworkId provided', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: ['Added new testing patterns', 'Updated examples']
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      mockShowQuickPick.mockResolvedValue(undefined); // User cancels

      // Act
      await updateFrameworkCommand(mockFrameworkManager);

      // Assert
      expect(mockShowQuickPick).toHaveBeenCalled();
      const quickPickCall = mockShowQuickPick.mock.calls[0];
      const items = quickPickCall[0];
      
      expect(items).toHaveLength(1);
      expect(items[0].label).toBe('tdd-bdd-strategy');
      expect(items[0].description).toBe('1.0.0 → 1.1.0');
    });

    it('should update framework when selected from quick pick', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: ['Added new testing patterns']
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowQuickPick = vscode.window.showQuickPick as jest.Mock;
      mockShowQuickPick.mockResolvedValue({
        frameworkId: 'tdd-bdd-strategy'
      });
      
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      mockWithProgress.mockImplementation(async (options, task) => {
        await task();
      });
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;

      // Act
      await updateFrameworkCommand(mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.updateFramework).toHaveBeenCalledWith('tdd-bdd-strategy');
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        'Framework updated successfully: tdd-bdd-strategy'
      );
    });

    it('should update framework directly when frameworkId is provided', async () => {
      // Arrange
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      mockWithProgress.mockImplementation(async (options, task) => {
        await task();
      });
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;

      // Act
      await updateFrameworkCommand(mockFrameworkManager, 'tdd-bdd-strategy');

      // Assert
      expect(mockFrameworkManager.checkForUpdates).not.toHaveBeenCalled();
      expect(mockFrameworkManager.updateFramework).toHaveBeenCalledWith('tdd-bdd-strategy');
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        'Framework updated successfully: tdd-bdd-strategy'
      );
    });

    it('should handle update errors gracefully', async () => {
      // Arrange
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      mockWithProgress.mockImplementation(async (options, task) => {
        await task();
      });
      
      mockFrameworkManager.updateFramework.mockRejectedValue(
        new Error('Update failed')
      );
      
      const mockShowErrorMessage = vscode.window.showErrorMessage as jest.Mock;

      // Act
      await updateFrameworkCommand(mockFrameworkManager, 'tdd-bdd-strategy');

      // Assert
      expect(mockShowErrorMessage).toHaveBeenCalledWith(
        'Failed to update framework: Update failed'
      );
    });
  });

  describe('updateAllFrameworksCommand', () => {
    it('should show message when all frameworks are up to date', async () => {
      // Arrange
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockFrameworkManager.checkForUpdates.mockResolvedValue([]);

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.checkForUpdates).toHaveBeenCalled();
      expect(mockShowInformationMessage).toHaveBeenCalledWith('All frameworks are up to date');
    });

    it('should show confirmation dialog with update list', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: ['Added new patterns']
        },
        {
          frameworkId: 'security-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.2.0',
          changes: ['Security improvements']
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockShowInformationMessage.mockResolvedValue('Cancel');

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      expect(mockShowInformationMessage).toHaveBeenCalled();
      const messageCall = mockShowInformationMessage.mock.calls[0];
      const message = messageCall[0] as string;
      
      expect(message).toContain('Update 2 frameworks?');
      expect(message).toContain('tdd-bdd-strategy');
      expect(message).toContain('security-strategy');
    });

    it('should update all frameworks when confirmed', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: []
        },
        {
          frameworkId: 'security-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.2.0',
          changes: []
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockShowInformationMessage.mockResolvedValue('Update All');
      
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      mockWithProgress.mockImplementation(async (options, task) => {
        await task({ report: jest.fn() });
      });

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.updateFramework).toHaveBeenCalledTimes(2);
      expect(mockFrameworkManager.updateFramework).toHaveBeenCalledWith('tdd-bdd-strategy');
      expect(mockFrameworkManager.updateFramework).toHaveBeenCalledWith('security-strategy');
    });

    it('should show success summary when all updates succeed', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: []
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockShowInformationMessage.mockResolvedValue('Update All');
      
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      mockWithProgress.mockImplementation(async (options, task) => {
        await task({ report: jest.fn() });
      });

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      // First call is confirmation, second is success message
      expect(mockShowInformationMessage).toHaveBeenCalledTimes(2);
      const successCall = mockShowInformationMessage.mock.calls[1];
      expect(successCall[0]).toContain('Successfully updated 1 framework');
    });

    it('should show warning summary when some updates fail', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: []
        },
        {
          frameworkId: 'security-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.2.0',
          changes: []
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockShowInformationMessage.mockResolvedValue('Update All');
      
      const mockShowWarningMessage = vscode.window.showWarningMessage as jest.Mock;
      
      // First update succeeds, second fails
      mockFrameworkManager.updateFramework
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Update failed'));
      
      const mockWithProgress = vscode.window.withProgress as jest.Mock;
      mockWithProgress.mockImplementation(async (options, task) => {
        await task({ report: jest.fn() });
      });

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      expect(mockShowWarningMessage).toHaveBeenCalled();
      const warningCall = mockShowWarningMessage.mock.calls[0];
      const message = warningCall[0] as string;
      
      expect(message).toContain('Updated 1 framework');
      expect(message).toContain('1 failed');
      expect(message).toContain('security-strategy');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockFrameworkManager.checkForUpdates.mockRejectedValue(
        new Error('Failed to check updates')
      );
      
      const mockShowErrorMessage = vscode.window.showErrorMessage as jest.Mock;

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      expect(mockShowErrorMessage).toHaveBeenCalledWith(
        'Failed to update frameworks: Failed to check updates'
      );
    });

    it('should not update when user cancels', async () => {
      // Arrange
      const mockUpdates: FrameworkUpdate[] = [
        {
          frameworkId: 'tdd-bdd-strategy',
          currentVersion: '1.0.0',
          latestVersion: '1.1.0',
          changes: []
        }
      ];
      mockFrameworkManager.checkForUpdates.mockResolvedValue(mockUpdates);
      
      const mockShowInformationMessage = vscode.window.showInformationMessage as jest.Mock;
      mockShowInformationMessage.mockResolvedValue('Cancel');

      // Act
      await updateAllFrameworksCommand(mockFrameworkManager);

      // Assert
      expect(mockFrameworkManager.updateFramework).not.toHaveBeenCalled();
    });
  });
});
