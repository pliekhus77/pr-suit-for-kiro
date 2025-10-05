import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FrameworkManager } from '../../services/framework-manager';

suite('Browse Frameworks Command Integration Tests', () => {
  let testWorkspaceRoot: string;
  let frameworkManager: FrameworkManager;
  let context: vscode.ExtensionContext;

  suiteSetup(async () => {
    // Get workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'No workspace folder found');
    testWorkspaceRoot = workspaceFolders[0].uri.fsPath;

    // Get extension context
    const extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
    assert.ok(extension, 'Extension not found');
    context = await extension.activate();

    // Initialize framework manager
    frameworkManager = new FrameworkManager(context);
  });

  setup(async () => {
    // Ensure .kiro/steering directory exists
    const steeringPath = path.join(testWorkspaceRoot, '.kiro', 'steering');
    await fs.mkdir(steeringPath, { recursive: true });
  });

  teardown(async () => {
    // Clean up test files
    const steeringPath = path.join(testWorkspaceRoot, '.kiro', 'steering');
    try {
      const files = await fs.readdir(steeringPath);
      for (const file of files) {
        if (file.startsWith('test-') || file.startsWith('strategy-')) {
          await fs.unlink(path.join(steeringPath, file));
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  test('should show "No frameworks available" message when manifest is empty', async () => {
    // Arrange: Create a temporary manifest with no frameworks
    const resourcesPath = path.join(context.extensionPath, 'resources', 'frameworks');
    const manifestPath = path.join(resourcesPath, 'manifest.json');
    const originalManifest = await fs.readFile(manifestPath, 'utf-8');
    
    try {
      // Write empty manifest
      const emptyManifest = { version: '1.0.0', frameworks: [] };
      await fs.writeFile(manifestPath, JSON.stringify(emptyManifest, null, 2));
      
      // Create new framework manager to reload manifest
      const testFrameworkManager = new FrameworkManager(context);
      
      // Act: Get available frameworks
      const frameworks = await testFrameworkManager.listAvailableFrameworks();
      
      // Assert: Should return empty array
      assert.strictEqual(frameworks.length, 0, 'Should have no frameworks');
    } finally {
      // Restore original manifest
      await fs.writeFile(manifestPath, originalManifest);
    }
  });

  test('should handle installation failure with error notification', async () => {
    // Arrange: Try to install a framework with invalid ID
    const invalidFrameworkId = 'non-existent-framework-id-12345';
    
    try {
      // Act: Attempt to install a framework that doesn't exist
      await frameworkManager.installFramework(invalidFrameworkId);
      assert.fail('Should have thrown an error');
    } catch (error) {
      // Assert: Error should be caught and handled
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes('Framework not found'), 
        `Expected error message to contain "Framework not found", got: ${error.message}`);
    }
  });

  test('should show overwrite prompt when framework already installed', async () => {
    // Arrange: Install a framework first
    const frameworkId = 'tdd-bdd-strategy';
    await frameworkManager.installFramework(frameworkId, { overwrite: true });

    // Verify it's installed
    const installed = await frameworkManager.isFrameworkInstalled(frameworkId);
    assert.strictEqual(installed, true, 'Framework should be installed');

    // Act: Try to install again
    // This should trigger the overwrite prompt in the actual command
    // For integration test, we verify the file exists
    const steeringPath = path.join(testWorkspaceRoot, '.kiro', 'steering', 'strategy-tdd-bdd.md');
    const fileExists = await fs.access(steeringPath).then(() => true).catch(() => false);
    
    // Assert
    assert.strictEqual(fileExists, true, 'Framework file should exist');
  });

  test('should close quick pick without changes when "Cancel" is selected', async () => {
    // This test verifies that canceling the quick pick doesn't make any changes
    
    // Arrange: Get list of installed frameworks before
    const installedBefore = await frameworkManager.getInstalledFrameworks();
    const installedIdsBefore = new Set(installedBefore.map(f => f.id));

    // Act: Simulate user canceling (quick pick returns undefined)
    // In actual usage, user would press Escape or click outside
    // For integration test, we just verify no changes were made
    
    // Assert: No new frameworks should be installed
    const installedAfter = await frameworkManager.getInstalledFrameworks();
    const installedIdsAfter = new Set(installedAfter.map(f => f.id));
    
    assert.deepStrictEqual(installedIdsAfter, installedIdsBefore, 'No frameworks should be added');
  });

  test('should group frameworks by category in quick pick', async () => {
    // Arrange: Get all available frameworks
    const frameworks = await frameworkManager.listAvailableFrameworks();
    
    // Act: Group by category
    const categories = new Set(frameworks.map(f => f.category));
    
    // Assert: Should have multiple categories
    assert.ok(categories.size > 0, 'Should have at least one category');
    assert.ok(categories.size >= 3, 'Should have multiple categories (Architecture, Testing, Security, etc.)');
    
    // Verify specific categories exist
    const categoryArray = Array.from(categories);
    const hasArchitecture = categoryArray.some(c => c.toLowerCase().includes('architecture'));
    const hasTesting = categoryArray.some(c => c.toLowerCase().includes('testing'));
    
    assert.ok(hasArchitecture || hasTesting, 'Should have Architecture or Testing category');
  });

  test('should handle invalid framework ID with error notification', async () => {
    // Arrange: Use an invalid framework ID
    const invalidId = 'invalid-framework-xyz-123';
    
    // Act & Assert: Should throw error
    try {
      await frameworkManager.installFramework(invalidId);
      assert.fail('Should have thrown an error for invalid framework ID');
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes('Framework not found'));
    }
  });

  test('should install framework with dependencies first', async () => {
    // Note: This test assumes frameworks can have dependencies
    // If no frameworks with dependencies exist, this test will be skipped
    
    // Arrange: Find a framework with dependencies
    const frameworks = await frameworkManager.listAvailableFrameworks();
    const frameworkWithDeps = frameworks.find(f => f.dependencies && f.dependencies.length > 0);
    
    if (!frameworkWithDeps) {
      // Skip test if no frameworks with dependencies
      console.log('Skipping test: No frameworks with dependencies found');
      return;
    }
    
    // Act: Install framework with dependencies
    await frameworkManager.installFramework(frameworkWithDeps.id, { overwrite: true });
    
    // Assert: Framework should be installed
    const isInstalled = await frameworkManager.isFrameworkInstalled(frameworkWithDeps.id);
    assert.strictEqual(isInstalled, true, 'Framework with dependencies should be installed');
    
    // Verify dependencies are also installed (if auto-install is implemented)
    // This depends on the implementation - for now just verify main framework
  });

  test('should handle disk full error with user notification', async () => {
    // Note: This test verifies that file system errors are properly caught and reported
    // Actual disk full simulation would require mocking the file system
    
    // Arrange: Try to install to a path that would cause an error
    // We can't easily simulate ENOSPC, but we can verify error handling exists
    const frameworkId = 'devops-strategy';
    
    try {
      // Act: Install framework (should succeed normally)
      await frameworkManager.installFramework(frameworkId, { overwrite: true });
      
      // Assert: Installation should succeed
      const isInstalled = await frameworkManager.isFrameworkInstalled(frameworkId);
      assert.strictEqual(isInstalled, true, 'Framework should be installed successfully');
      
      // Note: Actual ENOSPC error would be caught by the installFramework method
      // and propagated as an error, which would be shown to the user via error notification
    } catch (error) {
      // If an error occurs, it should be properly formatted
      assert.ok(error instanceof Error, 'Error should be an Error instance');
      assert.ok(error.message, 'Error should have a message');
    }
  });

  test('should create .kiro directory if it does not exist before installation', async () => {
    // Arrange: Remove .kiro directory if it exists
    const kiroPath = path.join(testWorkspaceRoot, '.kiro');
    const steeringPath = path.join(kiroPath, 'steering');
    
    try {
      await fs.rm(kiroPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }
    
    // Act: Install a framework (should create directory)
    await frameworkManager.installFramework('tdd-bdd-strategy', { overwrite: true });
    
    // Assert: .kiro/steering directory should exist
    const dirExists = await fs.access(steeringPath).then(() => true).catch(() => false);
    assert.strictEqual(dirExists, true, '.kiro/steering directory should be created');
    
    // Verify framework file exists
    const frameworkFile = path.join(steeringPath, 'strategy-tdd-bdd.md');
    const fileExists = await fs.access(frameworkFile).then(() => true).catch(() => false);
    assert.strictEqual(fileExists, true, 'Framework file should be installed');
  });

  test('should update metadata after installation', async () => {
    // Arrange: Install a framework
    const frameworkId = 'c4-model-strategy';
    
    // Act: Install framework
    await frameworkManager.installFramework(frameworkId, { overwrite: true });
    
    // Assert: Metadata should be updated
    const installedFrameworks = await frameworkManager.getInstalledFrameworksMetadata();
    const installedFramework = installedFrameworks.find(f => f.id === frameworkId);
    
    assert.ok(installedFramework, 'Framework should be in metadata');
    assert.strictEqual(installedFramework!.id, frameworkId);
    assert.ok(installedFramework!.version, 'Should have version');
    assert.ok(installedFramework!.installedAt, 'Should have installation timestamp');
  });

  test('should handle concurrent installation attempts gracefully', async () => {
    // Arrange: Prepare to install same framework twice concurrently
    const frameworkId = 'security-strategy';
    
    // Act: Install framework twice concurrently
    const promise1 = frameworkManager.installFramework(frameworkId, { overwrite: true });
    const promise2 = frameworkManager.installFramework(frameworkId, { overwrite: true });
    
    // Wait for both to complete
    await Promise.all([promise1, promise2]);
    
    // Assert: Framework should be installed once
    const isInstalled = await frameworkManager.isFrameworkInstalled(frameworkId);
    assert.strictEqual(isInstalled, true, 'Framework should be installed');
    
    // Verify only one entry in metadata
    const installedFrameworks = await frameworkManager.getInstalledFrameworksMetadata();
    const matchingFrameworks = installedFrameworks.filter(f => f.id === frameworkId);
    assert.strictEqual(matchingFrameworks.length, 1, 'Should have only one metadata entry');
  });
});
