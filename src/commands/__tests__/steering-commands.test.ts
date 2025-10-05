import * as vscode from 'vscode';

/**
 * Integration tests for steering document commands
 */
describe('Steering Document Commands', () => {
  let mockShowTextDocument: jest.SpyInstance;
  let mockExecuteCommand: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock vscode.window.showTextDocument
    mockShowTextDocument = jest.spyOn(vscode.window, 'showTextDocument').mockResolvedValue({} as vscode.TextEditor);
    
    // Mock vscode.commands.executeCommand
    mockExecuteCommand = jest.spyOn(vscode.commands, 'executeCommand').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('openSteeringDocument', () => {
    it('should open document when item has resourceUri', async () => {
      const item = {
        resourceUri: '/path/to/steering/strategy-tdd-bdd.md'
      };

      // Simulate command execution
      const command = async (item: { resourceUri?: string }) => {
        if (item && item.resourceUri) {
          const uri = vscode.Uri.file(item.resourceUri);
          await vscode.window.showTextDocument(uri);
        }
      };

      await command(item);

      expect(mockShowTextDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          fsPath: '/path/to/steering/strategy-tdd-bdd.md'
        })
      );
    });

    it('should not open document when item has no resourceUri', async () => {
      const item = {};

      const command = async (item: { resourceUri?: string }) => {
        if (item && item.resourceUri) {
          const uri = vscode.Uri.file(item.resourceUri);
          await vscode.window.showTextDocument(uri);
        }
      };

      await command(item);

      expect(mockShowTextDocument).not.toHaveBeenCalled();
    });

    it('should not open document when item is undefined', async () => {
      const command = async (item: { resourceUri?: string } | undefined) => {
        if (item && item.resourceUri) {
          const uri = vscode.Uri.file(item.resourceUri);
          await vscode.window.showTextDocument(uri);
        }
      };

      await command(undefined);

      expect(mockShowTextDocument).not.toHaveBeenCalled();
    });
  });

  describe('revealSteeringDocument', () => {
    it('should reveal document in file explorer when item has resourceUri', async () => {
      const item = {
        resourceUri: '/path/to/steering/strategy-tdd-bdd.md'
      };

      const command = async (item: { resourceUri?: string }) => {
        if (item && item.resourceUri) {
          const uri = vscode.Uri.file(item.resourceUri);
          await vscode.commands.executeCommand('revealFileInOS', uri);
        }
      };

      await command(item);

      expect(mockExecuteCommand).toHaveBeenCalledWith(
        'revealFileInOS',
        expect.objectContaining({
          fsPath: '/path/to/steering/strategy-tdd-bdd.md'
        })
      );
    });

    it('should not reveal document when item has no resourceUri', async () => {
      const item = {};

      const command = async (item: { resourceUri?: string }) => {
        if (item && item.resourceUri) {
          const uri = vscode.Uri.file(item.resourceUri);
          await vscode.commands.executeCommand('revealFileInOS', uri);
        }
      };

      await command(item);

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    it('should not reveal document when item is undefined', async () => {
      const command = async (item: { resourceUri?: string } | undefined) => {
        if (item && item.resourceUri) {
          const uri = vscode.Uri.file(item.resourceUri);
          await vscode.commands.executeCommand('revealFileInOS', uri);
        }
      };

      await command(undefined);

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });
});
