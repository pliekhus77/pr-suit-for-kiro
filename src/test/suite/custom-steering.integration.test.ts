import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SteeringTreeProvider } from '../../providers/steering-tree-provider';
import { FileSystemOperations } from '../../utils/file-system';
import { FrameworkManager } from '../../services/framework-manager';
import { createCustomSteeringCommand, renameCustomSteeringCommand, deleteCustomSteeringCommand } from '../../commands/steering-commands';

suite('Custom Steering Integration Tests', () => {
  let workspaceRoot: string;
  let steeringPath: string;
  let provider: SteeringTreeProvider;
  let fileSystem: FileSystemOperations;
  let frameworkManager: FrameworkManager;
  let extensionContext: vscode.ExtensionContext;

  suiteSetup(async () => {
    // Get the extension context
    const extension = vscode.extensions.getExtension('pragmatic-rhino.agentic-reviewer');
    assert.ok(extension, 'Extension should be available');
    
    if (!extension.isActive) {
      await extension.activate();
    }
    
    extensionContext = extension.exports?.context;
    assert.ok(extensionContext, 'Extension context should be available');

    // Get workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'No workspace folder open');
    workspaceRoot = workspaceFolders[0].uri.fsPath;
    steeringPath = path.join(workspaceRoot, '.kiro', 'steering');

    // Ensure .kiro/steering directory exists
    if (!fs.existsSync(steeringPath)) {
      fs.mkdirSync(steeringPath, { recursive: true });
    }

    // Initialize services
    fileSystem = new FileSystemOperations();
    frameworkManager = new FrameworkManager(extensionContext, fileSystem);
    provider = new SteeringTreeProvider(fileSystem, frameworkManager);
  });

  suiteTeardown(() => {
    // Clean up test files
    if (fs.existsSync(steeringPath)) {
      const files = fs.readdirSync(steeringPath);
      files.forEach(file => {
        if (file.startsWith('custom-test-')) {
          fs.unlinkSync(path.join(steeringPath, file));
        }
      });
    }
  });

  test('Custom document creation - valid name', async () => {
    const documentName = 'test-practice';
    const expectedFileName = `custom-${documentName}.md`;
    const expectedFilePath = path.join(steeringPath, expectedFileName);

    // Mock user input
    const originalShowInputBox = vscode.window.showInputBox;
    vscode.window.showInputBox = async (options?: any) => {
      return documentName;
    };

    try {
      // Create custom steering document
      await createCustomSteeringCommand(fileSystem);

      // Verify file was created
      assert.ok(fs.existsSync(expectedFilePath), 'Custom steering file should be created');

      // Verify file content has template structure
      const content = fs.readFileSync(expectedFilePath, 'utf-8');
      assert.ok(content.includes('# Test Practice Guide'), 'Should have title');
      assert.ok(content.includes('## Purpose'), 'Should have Purpose section');
      assert.ok(content.includes('## Key Concepts'), 'Should have Key Concepts section');
      assert.ok(content.includes('## Best Practices'), 'Should have Best Practices section');
      assert.ok(content.includes('## Anti-Patterns'), 'Should have Anti-Patterns section');
      assert.ok(content.includes('## Summary'), 'Should have Summary section');

      // Verify file appears in tree view
      const categories = await provider.getChildren();
      const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');
      assert.ok(customCategory, 'Should have Custom category');

      const files = await provider.getChildren(customCategory);
      const customFile = files.find(f => f.label === expectedFileName);
      assert.ok(customFile, 'Custom file should appear in tree view');
      assert.strictEqual(customFile!.isCustom, true, 'File should be marked as custom');
      assert.strictEqual(customFile!.contextValue, 'steeringCustom', 'Should have custom context value');

      // Clean up
      fs.unlinkSync(expectedFilePath);
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
    }
  });

  test('Custom document creation - name validation', async () => {
    const invalidNames = [
      'Test Practice', // Contains space
      'test_practice', // Contains underscore
      'TestPractice', // Contains uppercase
      'test-', // Ends with hyphen
      '-test', // Starts with hyphen
      'ab', // Too short
      'a'.repeat(51), // Too long
      '', // Empty
    ];

    for (const invalidName of invalidNames) {
      // Mock user input
      const originalShowInputBox = vscode.window.showInputBox;
      let validationError: string | undefined;
      
      vscode.window.showInputBox = async (options?: any) => {
        if (options?.validateInput) {
          validationError = options.validateInput(invalidName);
        }
        return undefined; // Cancel
      };

      try {
        await createCustomSteeringCommand(fileSystem);
        
        // Verify validation error was returned
        assert.ok(validationError, `Should have validation error for "${invalidName}"`);
      } finally {
        vscode.window.showInputBox = originalShowInputBox;
      }
    }
  });

  test('Custom document creation - overwrite existing', async () => {
    const documentName = 'test-overwrite';
    const fileName = `custom-${documentName}.md`;
    const filePath = path.join(steeringPath, fileName);
    const originalContent = '# Original Content\n\nThis is the original file.';

    // Create initial file
    fs.writeFileSync(filePath, originalContent);

    // Mock user input to overwrite
    const originalShowInputBox = vscode.window.showInputBox;
    const originalShowWarningMessage = vscode.window.showWarningMessage;
    
    vscode.window.showInputBox = async (options?: any) => {
      return documentName;
    };
    
    vscode.window.showWarningMessage = async (message: string, options?: any, ...items: any[]) => {
      return 'Overwrite';
    };

    try {
      await createCustomSteeringCommand(fileSystem);

      // Verify file was overwritten with template
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(content.includes('## Purpose'), 'Should have template content');
      assert.ok(!content.includes('Original Content'), 'Should not have original content');

      // Clean up
      fs.unlinkSync(filePath);
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
      vscode.window.showWarningMessage = originalShowWarningMessage;
    }
  });

  test('Custom document creation - cancel overwrite', async () => {
    const documentName = 'test-cancel-overwrite';
    const fileName = `custom-${documentName}.md`;
    const filePath = path.join(steeringPath, fileName);
    const originalContent = '# Original Content\n\nThis is the original file.';

    // Create initial file
    fs.writeFileSync(filePath, originalContent);

    // Mock user input to cancel
    const originalShowInputBox = vscode.window.showInputBox;
    const originalShowWarningMessage = vscode.window.showWarningMessage;
    
    vscode.window.showInputBox = async (options?: any) => {
      return documentName;
    };
    
    vscode.window.showWarningMessage = async (message: string, options?: any, ...items: any[]) => {
      return 'Cancel';
    };

    try {
      await createCustomSteeringCommand(fileSystem);

      // Verify file was NOT overwritten
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.strictEqual(content, originalContent, 'Should keep original content');

      // Clean up
      fs.unlinkSync(filePath);
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
      vscode.window.showWarningMessage = originalShowWarningMessage;
    }
  });

  test('Rename custom document', async () => {
    const originalName = 'test-rename-original';
    const newName = 'test-rename-new';
    const originalFileName = `custom-${originalName}.md`;
    const newFileName = `custom-${newName}.md`;
    const originalFilePath = path.join(steeringPath, originalFileName);
    const newFilePath = path.join(steeringPath, newFileName);
    const content = '# Test Content\n\nThis is test content.';

    // Create original file
    fs.writeFileSync(originalFilePath, content);

    // Get the steering item
    const categories = await provider.getChildren();
    const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');
    const files = await provider.getChildren(customCategory);
    const steeringItem = files.find(f => f.label === originalFileName);
    assert.ok(steeringItem, 'Should find original file');

    // Mock user input
    const originalShowInputBox = vscode.window.showInputBox;
    vscode.window.showInputBox = async (options?: any) => {
      return newName;
    };

    try {
      await renameCustomSteeringCommand(fileSystem, steeringItem);

      // Verify old file is gone
      assert.ok(!fs.existsSync(originalFilePath), 'Original file should be deleted');

      // Verify new file exists with same content
      assert.ok(fs.existsSync(newFilePath), 'New file should be created');
      const newContent = fs.readFileSync(newFilePath, 'utf-8');
      assert.strictEqual(newContent, content, 'Content should be preserved');

      // Clean up
      fs.unlinkSync(newFilePath);
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
    }
  });

  test('Rename custom document - name conflict', async () => {
    const originalName = 'test-rename-conflict1';
    const conflictName = 'test-rename-conflict2';
    const originalFileName = `custom-${originalName}.md`;
    const conflictFileName = `custom-${conflictName}.md`;
    const originalFilePath = path.join(steeringPath, originalFileName);
    const conflictFilePath = path.join(steeringPath, conflictFileName);

    // Create both files
    fs.writeFileSync(originalFilePath, '# Original');
    fs.writeFileSync(conflictFilePath, '# Conflict');

    // Get the steering item
    const categories = await provider.getChildren();
    const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');
    const files = await provider.getChildren(customCategory);
    const steeringItem = files.find(f => f.label === originalFileName);

    // Mock user input to use conflicting name
    const originalShowInputBox = vscode.window.showInputBox;
    vscode.window.showInputBox = async (options?: any) => {
      return conflictName;
    };

    try {
      await renameCustomSteeringCommand(fileSystem, steeringItem);

      // Verify original file still exists (rename failed)
      assert.ok(fs.existsSync(originalFilePath), 'Original file should still exist');
      assert.ok(fs.existsSync(conflictFilePath), 'Conflict file should still exist');

      // Clean up
      fs.unlinkSync(originalFilePath);
      fs.unlinkSync(conflictFilePath);
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
    }
  });

  test('Delete custom document', async () => {
    const documentName = 'test-delete';
    const fileName = `custom-${documentName}.md`;
    const filePath = path.join(steeringPath, fileName);

    // Create file
    fs.writeFileSync(filePath, '# Test Delete\n\nContent to delete');

    // Get the steering item
    const categories = await provider.getChildren();
    const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');
    const files = await provider.getChildren(customCategory);
    const steeringItem = files.find(f => f.label === fileName);
    assert.ok(steeringItem, 'Should find file to delete');

    // Mock user confirmation
    const originalShowWarningMessage = vscode.window.showWarningMessage;
    vscode.window.showWarningMessage = async (message: string, options?: any, ...items: any[]) => {
      return 'Delete';
    };

    try {
      await deleteCustomSteeringCommand(fileSystem, steeringItem);

      // Verify file is deleted
      assert.ok(!fs.existsSync(filePath), 'File should be deleted');
    } finally {
      vscode.window.showWarningMessage = originalShowWarningMessage;
    }
  });

  test('Delete custom document - cancel', async () => {
    const documentName = 'test-delete-cancel';
    const fileName = `custom-${documentName}.md`;
    const filePath = path.join(steeringPath, fileName);
    const content = '# Test Delete Cancel\n\nContent to keep';

    // Create file
    fs.writeFileSync(filePath, content);

    // Get the steering item
    const categories = await provider.getChildren();
    const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');
    const files = await provider.getChildren(customCategory);
    const steeringItem = files.find(f => f.label === fileName);

    // Mock user cancellation
    const originalShowWarningMessage = vscode.window.showWarningMessage;
    vscode.window.showWarningMessage = async (message: string, options?: any, ...items: any[]) => {
      return 'Cancel';
    };

    try {
      await deleteCustomSteeringCommand(fileSystem, steeringItem);

      // Verify file still exists
      assert.ok(fs.existsSync(filePath), 'File should still exist');
      const existingContent = fs.readFileSync(filePath, 'utf-8');
      assert.strictEqual(existingContent, content, 'Content should be unchanged');

      // Clean up
      fs.unlinkSync(filePath);
    } finally {
      vscode.window.showWarningMessage = originalShowWarningMessage;
    }
  });

  test('Context menu actions only for custom documents', async () => {
    // Create a strategy file (not custom)
    const strategyFileName = 'test-strategy-example.md';
    const strategyFilePath = path.join(steeringPath, strategyFileName);
    fs.writeFileSync(strategyFilePath, '# Strategy');

    // Create a custom file
    const customFileName = 'custom-test-example.md';
    const customFilePath = path.join(steeringPath, customFileName);
    fs.writeFileSync(customFilePath, '# Custom');

    // Get items
    const categories = await provider.getChildren();
    const strategiesCategory = categories.find(c => c.label === 'Strategies (Installed)');
    const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');

    const strategyFiles = await provider.getChildren(strategiesCategory);
    const customFiles = await provider.getChildren(customCategory);

    const strategyItem = strategyFiles.find(f => f.label === strategyFileName);
    const customItem = customFiles.find(f => f.label === customFileName);

    // Verify context values
    assert.strictEqual(strategyItem!.contextValue, 'steeringStrategy', 'Strategy should have strategy context');
    assert.strictEqual(customItem!.contextValue, 'steeringCustom', 'Custom should have custom context');

    // Verify isCustom flag
    assert.strictEqual(strategyItem!.isCustom, false, 'Strategy should not be custom');
    assert.strictEqual(customItem!.isCustom, true, 'Custom should be custom');

    // Try to rename strategy file (should fail)
    const originalShowInputBox = vscode.window.showInputBox;
    vscode.window.showInputBox = async (options?: any) => {
      return 'new-name';
    };

    try {
      await renameCustomSteeringCommand(fileSystem, strategyItem);
      // Should not rename - verify file still exists with original name
      assert.ok(fs.existsSync(strategyFilePath), 'Strategy file should not be renamed');
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
    }

    // Clean up
    fs.unlinkSync(strategyFilePath);
    fs.unlinkSync(customFilePath);
  });

  test('Template generation includes all required sections', async () => {
    const documentName = 'test-template';
    const fileName = `custom-${documentName}.md`;
    const filePath = path.join(steeringPath, fileName);

    // Mock user input
    const originalShowInputBox = vscode.window.showInputBox;
    vscode.window.showInputBox = async (options?: any) => {
      return documentName;
    };

    try {
      await createCustomSteeringCommand(fileSystem);

      // Read generated content
      const content = fs.readFileSync(filePath, 'utf-8');

      // Verify all required sections
      const requiredSections = [
        '# Test Template Guide',
        '## Purpose',
        '## Key Concepts',
        '## Best Practices',
        '## Anti-Patterns',
        '## Integration with Development Process',
        '## Quality Standards',
        '## Tools and Resources',
        '## Summary'
      ];

      for (const section of requiredSections) {
        assert.ok(content.includes(section), `Should include section: ${section}`);
      }

      // Verify has examples and placeholders
      assert.ok(content.includes('**Description:**'), 'Should have description placeholders');
      assert.ok(content.includes('**When to Use:**'), 'Should have when-to-use placeholders');
      assert.ok(content.includes('**How to Implement:**'), 'Should have implementation placeholders');
      assert.ok(content.includes('❌ Bad approach'), 'Should have anti-pattern examples');
      assert.ok(content.includes('✅ Good approach'), 'Should have good practice examples');
      assert.ok(content.includes('**Golden Rule:**'), 'Should have golden rule');

      // Clean up
      fs.unlinkSync(filePath);
    } finally {
      vscode.window.showInputBox = originalShowInputBox;
    }
  });
});
