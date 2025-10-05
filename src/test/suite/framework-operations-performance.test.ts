/**
 * Performance tests for framework operations
 * Tests installation, tree view refresh, validation, and operations with large datasets
 * 
 * Targets:
 * - Framework installation: < 1s
 * - Tree view refresh: < 200ms
 * - Validation execution: < 500ms
 * - Large document validation (>1MB): < 1s
 * - 100 frameworks in manifest: reasonable performance
 * - 50 installed frameworks: reasonable performance
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FileSystemOperations } from '../../utils/file-system';
import { FrameworkManager } from '../../services/framework-manager';
import { SteeringTreeProvider } from '../../providers/steering-tree-provider';
import { SteeringValidator } from '../../services/steering-validator';

suite('Framework Operations Performance Tests', () => {
  const fileSystem = new FileSystemOperations();
  let testWorkspaceRoot: string;
  let frameworkManager: FrameworkManager;
  let steeringTreeProvider: SteeringTreeProvider;
  let validator: SteeringValidator;

  suiteSetup(async function() {
    this.timeout(60000);
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found for testing');
    }
    testWorkspaceRoot = workspaceFolders[0].uri.fsPath;
    
    // Get extension context
    const extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
    if (!extension) {
      throw new Error('Extension not found');
    }
    
    if (!extension.isActive) {
      await extension.activate();
    }
    
    const context = extension.exports?.context || (extension as any).extensionContext;
    if (!context) {
      throw new Error('Extension context not available');
    }
    
    frameworkManager = new FrameworkManager(context, fileSystem);
    steeringTreeProvider = new SteeringTreeProvider(fileSystem, frameworkManager);
    validator = new SteeringValidator();
  });

  setup(async function() {
    this.timeout(30000);
    // Clean up before each test
    await cleanupTestArtifacts();
  });

  teardown(async function() {
    this.timeout(30000);
    // Clean up after each test
    await cleanupTestArtifacts();
    
    // Clear caches
    frameworkManager.clearCaches();
  });

  /**
   * Helper function to clean up test artifacts
   */
  async function cleanupTestArtifacts(): Promise<void> {
    try {
      const kiroPath = path.join(testWorkspaceRoot, '.kiro');
      if (fs.existsSync(kiroPath)) {
        const steeringPath = path.join(kiroPath, 'steering');
        if (fs.existsSync(steeringPath)) {
          const files = fs.readdirSync(steeringPath);
          for (const file of files) {
            if (file.startsWith('perf-test-') || file.startsWith('large-doc-')) {
              const filePath = path.join(steeringPath, file);
              fs.unlinkSync(filePath);
            }
          }
        }
        
        // Clean up metadata
        const metadataPath = path.join(kiroPath, '.metadata');
        if (fs.existsSync(metadataPath)) {
          const metadataFile = path.join(metadataPath, 'installed-frameworks.json');
          if (fs.existsSync(metadataFile)) {
            // Reset to empty
            fs.writeFileSync(metadataFile, JSON.stringify({ frameworks: [] }, null, 2));
          }
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Helper function to create test frameworks
   */
  async function createTestFrameworks(count: number): Promise<void> {
    const steeringPath = fileSystem.getSteeringPath();
    await fileSystem.ensureDirectory(steeringPath);
    
    const metadataPath = path.join(testWorkspaceRoot, '.kiro', '.metadata');
    await fileSystem.ensureDirectory(metadataPath);
    
    interface FrameworkMetadata {
      id: string;
      version: string;
      installedAt: string;
      customized: boolean;
    }
    
    const frameworks: FrameworkMetadata[] = [];
    
    for (let i = 0; i < count; i++) {
      const frameworkId = `perf-test-framework-${i}`;
      const fileName = `perf-test-framework-${i}.md`;
      const filePath = path.join(steeringPath, fileName);
      
      const content = `# Performance Test Framework ${i}

## Purpose
Performance testing framework ${i} for benchmarking operations.

## Key Concepts
- Concept 1: High-performance operations
- Concept 2: Scalability testing
- Concept 3: Load handling

## Best Practices
- Practice 1: Optimize for speed
- Practice 2: Cache effectively
- Practice 3: Minimize I/O operations

## Examples
\`\`\`typescript
// Example code
function performanceTest() {
  console.log('Testing framework ${i}');
}
\`\`\`

## Summary
This framework is used for performance testing and benchmarking.
`;
      
      await fileSystem.writeFile(filePath, content);
      
      frameworks.push({
        id: frameworkId,
        version: '1.0.0',
        installedAt: new Date().toISOString(),
        customized: false
      });
    }
    
    // Update metadata
    const metadataFile = path.join(metadataPath, 'installed-frameworks.json');
    await fileSystem.writeFile(metadataFile, JSON.stringify({ frameworks }, null, 2));
  }

  /**
   * Helper function to create a large document (>1MB)
   */
  async function createLargeDocument(): Promise<string> {
    const steeringPath = fileSystem.getSteeringPath();
    await fileSystem.ensureDirectory(steeringPath);
    
    const filePath = path.join(steeringPath, 'large-doc-test.md');
    
    // Generate content > 1MB
    let content = `# Large Document Performance Test

## Purpose
Testing validation performance with large documents.

## Key Concepts
`;
    
    // Add enough content to exceed 1MB
    const targetSize = 1024 * 1024; // 1MB
    const sectionTemplate = `
### Concept ${'{i}'}
This is a detailed explanation of concept ${'{i}'}. It includes multiple paragraphs
of text to simulate a real-world large document. The content is repeated to reach
the target size for performance testing.

- Point 1: Detailed explanation with examples
- Point 2: More detailed information
- Point 3: Additional context and use cases

\`\`\`typescript
// Example code for concept ${'{i}'}
function concept${'{i}'}() {
  console.log('Implementing concept ${'{i}'}');
  return true;
}
\`\`\`

`;
    
    let i = 0;
    while (content.length < targetSize) {
      content += sectionTemplate.replace(/\{i\}/g, i.toString());
      i++;
    }
    
    content += `
## Best Practices
- Practice 1: Handle large documents efficiently
- Practice 2: Optimize validation algorithms
- Practice 3: Use streaming where possible

## Summary
This large document tests the performance of validation and other operations
on documents exceeding 1MB in size.
`;
    
    await fileSystem.writeFile(filePath, content);
    
    return filePath;
  }

  /**
   * Helper function to create a large manifest (100 frameworks)
   */
  async function createLargeManifest(): Promise<void> {
    const resourcesPath = path.join(testWorkspaceRoot, 'resources', 'frameworks');
    await fileSystem.ensureDirectory(resourcesPath);
    
    const manifestPath = path.join(resourcesPath, 'manifest.json');
    
    // Backup original manifest
    const backupPath = manifestPath + '.backup';
    if (fs.existsSync(manifestPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(manifestPath, backupPath);
    }
    
    interface Framework {
      id: string;
      name: string;
      description: string;
      category: string;
      version: string;
      fileName: string;
      dependencies: string[];
    }
    
    const frameworks: Framework[] = [];
    
    for (let i = 0; i < 100; i++) {
      frameworks.push({
        id: `perf-test-framework-${i}`,
        name: `Performance Test Framework ${i}`,
        description: `Framework ${i} for performance testing and benchmarking`,
        category: i % 2 === 0 ? 'testing' : 'architecture',
        version: '1.0.0',
        fileName: `perf-test-framework-${i}.md`,
        dependencies: []
      });
    }
    
    const manifest = {
      version: '1.0.0',
      frameworks
    };
    
    await fileSystem.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  /**
   * Helper function to restore original manifest
   */
  async function restoreOriginalManifest(): Promise<void> {
    const resourcesPath = path.join(testWorkspaceRoot, 'resources', 'frameworks');
    const manifestPath = path.join(resourcesPath, 'manifest.json');
    const backupPath = manifestPath + '.backup';
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, manifestPath);
      fs.unlinkSync(backupPath);
    }
  }

  // ========== Framework Installation Performance ==========

  test('Performance: Framework installation should complete in < 1s', async function() {
    this.timeout(30000);
    
    // Get a real framework to install
    const frameworks = await frameworkManager.listAvailableFrameworks();
    assert.ok(frameworks.length > 0, 'Should have frameworks available');
    
    const framework = frameworks[0];
    
    const startTime = Date.now();
    await frameworkManager.installFramework(framework.id, { overwrite: true });
    const installTime = Date.now() - startTime;
    
    console.log(`Framework installation time: ${installTime}ms`);
    assert.ok(installTime < 1000, `Installation time ${installTime}ms should be < 1000ms`);
    
    // Verify installation
    const isInstalled = await frameworkManager.isFrameworkInstalled(framework.id);
    assert.ok(isInstalled, 'Framework should be installed');
  });

  test('Performance: Multiple framework installations should be efficient', async function() {
    this.timeout(60000);
    
    const frameworks = await frameworkManager.listAvailableFrameworks();
    const frameworksToInstall = frameworks.slice(0, 5);
    
    const startTime = Date.now();
    
    for (const framework of frameworksToInstall) {
      await frameworkManager.installFramework(framework.id, { overwrite: true });
    }
    
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / frameworksToInstall.length;
    
    console.log(`Total time for ${frameworksToInstall.length} installations: ${totalTime}ms`);
    console.log(`Average time per installation: ${avgTime.toFixed(2)}ms`);
    
    assert.ok(avgTime < 1000, `Average installation time ${avgTime.toFixed(2)}ms should be < 1000ms`);
  });

  // ========== Tree View Refresh Performance ==========

  test('Performance: Tree view refresh should complete in < 200ms (baseline)', async function() {
    this.timeout(30000);
    
    // Create a few frameworks
    await createTestFrameworks(5);
    
    const startTime = Date.now();
    steeringTreeProvider.refresh();
    
    // Get children to trigger actual refresh
    await steeringTreeProvider.getChildren();
    
    const refreshTime = Date.now() - startTime;
    
    console.log(`Tree view refresh time (5 frameworks): ${refreshTime}ms`);
    assert.ok(refreshTime < 200, `Refresh time ${refreshTime}ms should be < 200ms`);
  });

  test('Performance: Tree view refresh with 50 frameworks should be < 200ms', async function() {
    this.timeout(60000);
    
    // Create 50 frameworks
    await createTestFrameworks(50);
    
    const startTime = Date.now();
    steeringTreeProvider.refresh();
    
    // Get children to trigger actual refresh
    await steeringTreeProvider.getChildren();
    
    const refreshTime = Date.now() - startTime;
    
    console.log(`Tree view refresh time (50 frameworks): ${refreshTime}ms`);
    assert.ok(refreshTime < 200, `Refresh time ${refreshTime}ms should be < 200ms with 50 frameworks`);
  });

  test('Performance: Tree view refresh with 100 frameworks should be reasonable', async function() {
    this.timeout(120000);
    
    // Create 100 frameworks (stress test)
    await createTestFrameworks(100);
    
    const startTime = Date.now();
    steeringTreeProvider.refresh();
    
    // Get children to trigger actual refresh
    await steeringTreeProvider.getChildren();
    
    const refreshTime = Date.now() - startTime;
    
    console.log(`Tree view refresh time (100 frameworks): ${refreshTime}ms`);
    assert.ok(refreshTime < 500, `Refresh time ${refreshTime}ms should be < 500ms with 100 frameworks`);
  });

  test('Performance: Multiple consecutive tree view refreshes should be fast (caching)', async function() {
    this.timeout(30000);
    
    await createTestFrameworks(20);
    
    const times: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      steeringTreeProvider.refresh();
      await steeringTreeProvider.getChildren();
      const refreshTime = Date.now() - startTime;
      
      times.push(refreshTime);
      console.log(`Refresh ${i + 1}: ${refreshTime}ms`);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Average refresh time: ${avgTime.toFixed(2)}ms`);
    
    assert.ok(avgTime < 200, `Average refresh time ${avgTime.toFixed(2)}ms should be < 200ms`);
  });

  // ========== Validation Performance ==========

  test('Performance: Validation should complete in < 500ms (normal document)', async function() {
    this.timeout(30000);
    
    // Create a normal-sized document
    const steeringPath = fileSystem.getSteeringPath();
    await fileSystem.ensureDirectory(steeringPath);
    
    const filePath = path.join(steeringPath, 'perf-test-validation.md');
    const content = `# Validation Performance Test

## Purpose
Testing validation performance with a normal-sized document.

## Key Concepts
- Concept 1: Fast validation
- Concept 2: Efficient algorithms
- Concept 3: Minimal overhead

## Best Practices
- Practice 1: Validate incrementally
- Practice 2: Cache results
- Practice 3: Optimize regex patterns

\`\`\`typescript
// Example code
function validate() {
  return true;
}
\`\`\`

## Summary
This document tests validation performance.
`;
    
    await fileSystem.writeFile(filePath, content);
    
    // Open document
    const doc = await vscode.workspace.openTextDocument(filePath);
    
    const startTime = Date.now();
    const result = await validator.validate(doc);
    const validationTime = Date.now() - startTime;
    
    console.log(`Validation time (normal document): ${validationTime}ms`);
    console.log(`Issues found: ${result.issues.length}, Warnings: ${result.warnings.length}`);
    
    assert.ok(validationTime < 500, `Validation time ${validationTime}ms should be < 500ms`);
  });

  test('Performance: Validation with large document (>1MB) should complete in < 1s', async function() {
    this.timeout(60000);
    
    // Create large document
    const filePath = await createLargeDocument();
    
    // Verify size
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    console.log(`Document size: ${sizeInMB.toFixed(2)}MB`);
    assert.ok(sizeInMB > 1, 'Document should be > 1MB');
    
    // Open document
    const doc = await vscode.workspace.openTextDocument(filePath);
    
    const startTime = Date.now();
    const result = await validator.validate(doc);
    const validationTime = Date.now() - startTime;
    
    console.log(`Validation time (${sizeInMB.toFixed(2)}MB document): ${validationTime}ms`);
    console.log(`Issues found: ${result.issues.length}, Warnings: ${result.warnings.length}`);
    
    assert.ok(validationTime < 1000, `Validation time ${validationTime}ms should be < 1000ms for large document`);
  });

  test('Performance: Multiple validations should be consistent', async function() {
    this.timeout(60000);
    
    const steeringPath = fileSystem.getSteeringPath();
    await fileSystem.ensureDirectory(steeringPath);
    
    const filePath = path.join(steeringPath, 'perf-test-multi-validation.md');
    const content = `# Multi-Validation Test

## Purpose
Testing multiple validation runs.

## Key Concepts
- Concept 1
- Concept 2

## Best Practices
- Practice 1
- Practice 2

## Summary
Test document.
`;
    
    await fileSystem.writeFile(filePath, content);
    const doc = await vscode.workspace.openTextDocument(filePath);
    
    const times: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await validator.validate(doc);
      const validationTime = Date.now() - startTime;
      
      times.push(validationTime);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log(`Validation statistics (10 runs):`);
    console.log(`  Average: ${avgTime.toFixed(2)}ms`);
    console.log(`  Min: ${minTime}ms`);
    console.log(`  Max: ${maxTime}ms`);
    
    assert.ok(avgTime < 500, `Average validation time ${avgTime.toFixed(2)}ms should be < 500ms`);
  });

  // ========== Large Dataset Performance ==========

  test('Performance: Operations with 100 frameworks in manifest', async function() {
    this.timeout(120000);
    
    // Create large manifest
    await createLargeManifest();
    
    // Clear cache to force reload
    frameworkManager.clearCaches();
    
    // Test listing frameworks
    const startList = Date.now();
    const frameworks = await frameworkManager.listAvailableFrameworks();
    const listTime = Date.now() - startList;
    
    console.log(`List 100 frameworks: ${listTime}ms`);
    assert.ok(frameworks.length === 100, 'Should have 100 frameworks');
    assert.ok(listTime < 1000, `List time ${listTime}ms should be < 1000ms`);
    
    // Test searching frameworks
    const startSearch = Date.now();
    const searchResults = await frameworkManager.searchFrameworks('test');
    const searchTime = Date.now() - startSearch;
    
    console.log(`Search 100 frameworks: ${searchTime}ms`);
    assert.ok(searchResults.length > 0, 'Should have search results');
    assert.ok(searchTime < 500, `Search time ${searchTime}ms should be < 500ms`);
    
    // Test getting framework by ID
    const startGet = Date.now();
    const framework = await frameworkManager.getFrameworkById('perf-test-framework-50');
    const getTime = Date.now() - startGet;
    
    console.log(`Get framework by ID: ${getTime}ms`);
    assert.ok(framework !== undefined, 'Should find framework');
    assert.ok(getTime < 100, `Get time ${getTime}ms should be < 100ms`);
    
    // Restore original manifest
    await restoreOriginalManifest();
  });

  test('Performance: Operations with 50 installed frameworks', async function() {
    this.timeout(120000);
    
    // Create 50 installed frameworks
    await createTestFrameworks(50);
    
    // Test getting installed frameworks
    const startInstalled = Date.now();
    const installed = await frameworkManager.getInstalledFrameworks();
    const installedTime = Date.now() - startInstalled;
    
    console.log(`Get 50 installed frameworks: ${installedTime}ms`);
    assert.ok(installed.length === 50, 'Should have 50 installed frameworks');
    assert.ok(installedTime < 1000, `Get installed time ${installedTime}ms should be < 1000ms`);
    
    // Test checking if framework is installed (should use cache)
    const startCheck = Date.now();
    const isInstalled = await frameworkManager.isFrameworkInstalled('perf-test-framework-25');
    const checkTime = Date.now() - startCheck;
    
    console.log(`Check if framework installed: ${checkTime}ms`);
    assert.ok(isInstalled, 'Framework should be installed');
    assert.ok(checkTime < 100, `Check time ${checkTime}ms should be < 100ms`);
    
    // Test tree view with 50 frameworks
    const startTree = Date.now();
    steeringTreeProvider.refresh();
    const categories = await steeringTreeProvider.getChildren();
    const treeTime = Date.now() - startTree;
    
    console.log(`Tree view with 50 frameworks: ${treeTime}ms`);
    assert.ok(categories.length > 0, 'Should have categories');
    assert.ok(treeTime < 200, `Tree time ${treeTime}ms should be < 200ms`);
  });

  // ========== Concurrent Operations Performance ==========

  test('Performance: Concurrent framework installations', async function() {
    this.timeout(60000);
    
    const frameworks = await frameworkManager.listAvailableFrameworks();
    const frameworksToInstall = frameworks.slice(0, 3);
    
    const startTime = Date.now();
    
    // Install concurrently
    await Promise.all(
      frameworksToInstall.map(f => 
        frameworkManager.installFramework(f.id, { overwrite: true })
      )
    );
    
    const totalTime = Date.now() - startTime;
    
    console.log(`Concurrent installation of ${frameworksToInstall.length} frameworks: ${totalTime}ms`);
    
    // Should be faster than sequential (but not necessarily 3x faster due to I/O)
    assert.ok(totalTime < 3000, `Concurrent installation time ${totalTime}ms should be < 3000ms`);
    
    // Verify all installed
    for (const framework of frameworksToInstall) {
      const isInstalled = await frameworkManager.isFrameworkInstalled(framework.id);
      assert.ok(isInstalled, `Framework ${framework.id} should be installed`);
    }
  });

  test('Performance: Concurrent validations', async function() {
    this.timeout(60000);
    
    // Create multiple documents
    const steeringPath = fileSystem.getSteeringPath();
    await fileSystem.ensureDirectory(steeringPath);
    
    const docPaths: string[] = [];
    for (let i = 0; i < 5; i++) {
      const filePath = path.join(steeringPath, `perf-test-concurrent-${i}.md`);
      const content = `# Concurrent Validation Test ${i}

## Purpose
Testing concurrent validation.

## Key Concepts
- Concept 1
- Concept 2

## Best Practices
- Practice 1
- Practice 2

## Summary
Test document ${i}.
`;
      await fileSystem.writeFile(filePath, content);
      docPaths.push(filePath);
    }
    
    // Open all documents
    const docs = await Promise.all(
      docPaths.map(p => vscode.workspace.openTextDocument(p))
    );
    
    const startTime = Date.now();
    
    // Validate concurrently
    const results = await Promise.all(
      docs.map(doc => validator.validate(doc))
    );
    
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / docs.length;
    
    console.log(`Concurrent validation of ${docs.length} documents: ${totalTime}ms`);
    console.log(`Average time per document: ${avgTime.toFixed(2)}ms`);
    
    assert.ok(results.length === docs.length, 'Should have all results');
    assert.ok(avgTime < 500, `Average validation time ${avgTime.toFixed(2)}ms should be < 500ms`);
  });

  // ========== Memory Performance ==========

  test('Memory: Framework operations should not leak memory', async function() {
    this.timeout(120000);
    
    const getMemoryUsage = () => {
      const usage = process.memoryUsage();
      return Math.round(usage.heapUsed / 1024 / 1024); // MB
    };
    
    const beforeMemory = getMemoryUsage();
    console.log(`Memory before operations: ${beforeMemory}MB`);
    
    // Perform many operations
    for (let i = 0; i < 10; i++) {
      await createTestFrameworks(5);
      steeringTreeProvider.refresh();
      await steeringTreeProvider.getChildren();
      await cleanupTestArtifacts();
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const afterMemory = getMemoryUsage();
    console.log(`Memory after operations: ${afterMemory}MB`);
    
    const memoryIncrease = afterMemory - beforeMemory;
    console.log(`Memory increase: ${memoryIncrease}MB`);
    
    // Memory increase should be minimal (< 20MB)
    assert.ok(memoryIncrease < 20, `Memory increase ${memoryIncrease}MB should be < 20MB`);
  });
});
