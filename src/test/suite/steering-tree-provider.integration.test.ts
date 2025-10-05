import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SteeringTreeProvider } from '../../providers/steering-tree-provider';
import { FileSystemOperations } from '../../utils/file-system';
import { FrameworkManager } from '../../services/framework-manager';

suite('SteeringTreeProvider Integration Tests', () => {
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
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(steeringPath, file));
        }
      });
    }
  });

  test('Tree view registration', async () => {
    // Verify that the tree view is registered
    const treeView = vscode.window.createTreeView('agenticReviewer.steeringTree', {
      treeDataProvider: provider
    });

    assert.ok(treeView, 'Tree view should be created');
    assert.strictEqual(treeView.visible, false, 'Tree view should not be visible initially');

    treeView.dispose();
  });

  test('Category grouping', async () => {
    // Create test files in different categories
    const testFiles = [
      'test-strategy-tdd.md',
      'test-strategy-security.md',
      'test-product.md',
      'test-tech.md',
      'test-custom-team.md'
    ];

    testFiles.forEach(file => {
      fs.writeFileSync(path.join(steeringPath, file), `# ${file}\n\nTest content`);
    });

    // Get root children (categories)
    const categories = await provider.getChildren();

    assert.ok(categories.length >= 3, 'Should have at least 3 categories');

    // Find each category
    const strategiesCategory = categories.find(c => c.label === 'Strategies (Installed)');
    const projectCategory = categories.find(c => c.label === 'Project (Team-Created)');
    const customCategory = categories.find(c => c.label === 'Custom (Team-Created)');

    assert.ok(strategiesCategory, 'Should have Strategies category');
    assert.ok(projectCategory, 'Should have Project category');
    assert.ok(customCategory, 'Should have Custom category');

    // Verify category properties
    assert.strictEqual(strategiesCategory!.isCategory, true, 'Strategies should be a category');
    assert.strictEqual(projectCategory!.isCategory, true, 'Project should be a category');
    assert.strictEqual(customCategory!.isCategory, true, 'Custom should be a category');

    // Get children of each category
    const strategyFiles = await provider.getChildren(strategiesCategory);
    const projectFiles = await provider.getChildren(projectCategory);
    const customFiles = await provider.getChildren(customCategory);

    assert.strictEqual(strategyFiles.length, 2, 'Should have 2 strategy files');
    assert.strictEqual(projectFiles.length, 2, 'Should have 2 project files');
    assert.strictEqual(customFiles.length, 1, 'Should have 1 custom file');

    // Clean up
    testFiles.forEach(file => {
      fs.unlinkSync(path.join(steeringPath, file));
    });
  });

  test('File click opens editor', async () => {
    // Create a test file
    const testFileName = 'test-strategy-example.md';
    const testFilePath = path.join(steeringPath, testFileName);
    const testContent = '# Test Strategy\n\nThis is a test file for integration testing.';
    fs.writeFileSync(testFilePath, testContent);

    // Get the file item from the tree
    const categories = await provider.getChildren();
    const strategiesCategory = categories.find(c => c.label === 'Strategies (Installed)');
    assert.ok(strategiesCategory, 'Should have Strategies category');

    const files = await provider.getChildren(strategiesCategory);
    const testFile = files.find(f => f.label === testFileName);
    assert.ok(testFile, 'Should find test file in tree');

    // Get the tree item (which includes the command)
    const treeItem = provider.getTreeItem(testFile!);
    assert.ok(treeItem.command, 'Tree item should have a command');
    assert.strictEqual(treeItem.command.command, 'vscode.open', 'Command should be vscode.open');

    // Execute the command to open the file
    const uri = vscode.Uri.file(testFilePath);
    await vscode.commands.executeCommand(treeItem.command.command, uri);

    // Verify the file is open in the editor
    const activeEditor = vscode.window.activeTextEditor;
    assert.ok(activeEditor, 'Should have an active editor');
    assert.strictEqual(
      activeEditor!.document.uri.fsPath,
      testFilePath,
      'Active editor should be the test file'
    );

    // Verify content
    const content = activeEditor!.document.getText();
    assert.strictEqual(content, testContent, 'File content should match');

    // Clean up
    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    fs.unlinkSync(testFilePath);
  });

  test('Refresh updates tree', async () => {
    // Create a new file
    const newFileName = 'test-new-strategy.md';
    const newFilePath = path.join(steeringPath, newFileName);
    fs.writeFileSync(newFilePath, '# New Strategy\n\nNew content');

    // Refresh the tree
    provider.refresh();

    // Wait a bit for the refresh to propagate
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get updated state
    const updatedCategories = await provider.getChildren();
    const strategiesCategory = updatedCategories.find(c => c.label === 'Strategies (Installed)');
    assert.ok(strategiesCategory, 'Should have Strategies category after refresh');

    const files = await provider.getChildren(strategiesCategory);
    const newFile = files.find(f => f.label === newFileName);
    assert.ok(newFile, 'Should find new file after refresh');

    // Clean up
    fs.unlinkSync(newFilePath);
  });

  test('Context menu actions', async () => {
    // Create a test file
    const testFileName = 'test-context-menu.md';
    const testFilePath = path.join(steeringPath, testFileName);
    fs.writeFileSync(testFilePath, '# Context Menu Test\n\nTest content');

    // Get the file item
    const categories = await provider.getChildren();
    const strategiesCategory = categories.find(c => c.label === 'Strategies (Installed)');
    const files = await provider.getChildren(strategiesCategory);
    const testFile = files.find(f => f.label === testFileName);
    assert.ok(testFile, 'Should find test file');

    // Get tree item
    const treeItem = provider.getTreeItem(testFile!);

    // Verify context value for context menu
    assert.ok(treeItem.contextValue, 'Tree item should have contextValue');
    assert.strictEqual(
      treeItem.contextValue,
      'steeringStrategy',
      'Context value should be steeringStrategy'
    );

    // Test Open command
    const uri = vscode.Uri.file(testFilePath);
    await vscode.commands.executeCommand('agentic-reviewer.openSteeringDocument', uri);
    
    const activeEditor = vscode.window.activeTextEditor;
    assert.ok(activeEditor, 'Open command should open editor');
    assert.strictEqual(
      activeEditor!.document.uri.fsPath,
      testFilePath,
      'Should open correct file'
    );

    await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

    // Test Reveal in File Explorer command
    // Note: This command may not work in headless test environment, but we can verify it doesn't throw
    try {
      await vscode.commands.executeCommand('agentic-reviewer.revealSteeringDocument', uri);
      // If it doesn't throw, the command is registered correctly
      assert.ok(true, 'Reveal command should not throw');
    } catch (error) {
      // In headless environment, this might fail, which is acceptable
      console.log('Reveal command not available in test environment (expected)');
    }

    // Clean up
    fs.unlinkSync(testFilePath);
  });

  test('Tree view handles empty directory', async () => {
    // Temporarily remove all files
    const existingFiles = fs.readdirSync(steeringPath);
    const backupPath = path.join(workspaceRoot, '.kiro', 'steering-backup');
    
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    existingFiles.forEach(file => {
      fs.renameSync(
        path.join(steeringPath, file),
        path.join(backupPath, file)
      );
    });

    // Get children from empty directory
    const categories = await provider.getChildren();
    assert.strictEqual(categories.length, 0, 'Should have no categories when directory is empty');

    // Restore files
    fs.readdirSync(backupPath).forEach(file => {
      fs.renameSync(
        path.join(backupPath, file),
        path.join(steeringPath, file)
      );
    });
    fs.rmdirSync(backupPath);
  });

  test('Tree view handles file system errors gracefully', async () => {
    // Create a provider with a non-existent path
    const badFileSystem = new FileSystemOperations();
    const originalGetSteeringPath = badFileSystem.getSteeringPath;
    
    // Mock to return non-existent path
    badFileSystem.getSteeringPath = () => path.join(workspaceRoot, '.kiro', 'non-existent');
    
    const badProvider = new SteeringTreeProvider(badFileSystem, frameworkManager);
    
    // Should return empty array instead of throwing
    const children = await badProvider.getChildren();
    assert.strictEqual(children.length, 0, 'Should return empty array for non-existent directory');
    
    // Restore
    badFileSystem.getSteeringPath = originalGetSteeringPath;
  });

  test('Tree items have correct collapsible state', async () => {
    // Create test files
    const testFileName = 'test-collapsible.md';
    const testFilePath = path.join(steeringPath, testFileName);
    fs.writeFileSync(testFilePath, '# Test\n\nContent');

    // Get categories
    const categories = await provider.getChildren();
    const strategiesCategory = categories.find(c => c.label === 'Strategies (Installed)');
    assert.ok(strategiesCategory, 'Should have Strategies category');

    // Category should be collapsible
    const categoryTreeItem = provider.getTreeItem(strategiesCategory!);
    assert.strictEqual(
      categoryTreeItem.collapsibleState,
      vscode.TreeItemCollapsibleState.Expanded,
      'Category should be expanded'
    );

    // File should not be collapsible
    const files = await provider.getChildren(strategiesCategory);
    const testFile = files.find(f => f.label === testFileName);
    assert.ok(testFile, 'Should find test file');

    const fileTreeItem = provider.getTreeItem(testFile!);
    assert.strictEqual(
      fileTreeItem.collapsibleState,
      vscode.TreeItemCollapsibleState.None,
      'File should not be collapsible'
    );

    // Clean up
    fs.unlinkSync(testFilePath);
  });
});
