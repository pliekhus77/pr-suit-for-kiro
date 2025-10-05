/**
 * Performance tests for extension activation
 * Tests activation time, memory usage, and behavior with various workspace configurations
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FileSystemOperations } from '../../utils/file-system';

suite('Extension Activation Performance Tests', () => {
  const fileSystem = new FileSystemOperations();
  let testWorkspaceRoot: string;
  let activationTimes: number[] = [];

  suiteSetup(async function() {
    // Increase timeout for performance tests
    this.timeout(60000);
    
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found for testing');
    }
    testWorkspaceRoot = workspaceFolders[0].uri.fsPath;
  });

  setup(async function() {
    this.timeout(30000);
    activationTimes = [];
  });

  teardown(async function() {
    this.timeout(30000);
    // Clean up test artifacts
    try {
      const kiroPath = path.join(testWorkspaceRoot, '.kiro');
      if (fs.existsSync(kiroPath)) {
        // Clean up test frameworks but preserve original structure
        const steeringPath = path.join(kiroPath, 'steering');
        if (fs.existsSync(steeringPath)) {
          const files = fs.readdirSync(steeringPath);
          for (const file of files) {
            if (file.startsWith('test-framework-') || file.startsWith('perf-test-')) {
              const filePath = path.join(steeringPath, file);
              fs.unlinkSync(filePath);
            }
          }
        }
      }
    } catch (error) {
      console.error('Teardown error:', error);
    }
  });

  /**
   * Helper function to measure activation time
   */
  async function measureActivationTime(): Promise<number> {
    const startTime = Date.now();
    
    // Get extension
    const extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
    assert.ok(extension, 'Extension should be installed');
    
    // Activate if not already active
    if (!extension.isActive) {
      await extension.activate();
    }
    
    const activationTime = Date.now() - startTime;
    activationTimes.push(activationTime);
    
    return activationTime;
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
      const frameworkId = `test-framework-${i}`;
      const fileName = `test-framework-${i}.md`;
      const filePath = path.join(steeringPath, fileName);
      
      // Create framework file
      const content = `# Test Framework ${i}

## Purpose
Performance testing framework ${i}

## Key Concepts
- Concept 1
- Concept 2
- Concept 3

## Best Practices
- Practice 1
- Practice 2

## Summary
Test framework for performance testing
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
   * Helper function to corrupt metadata
   */
  async function corruptMetadata(): Promise<void> {
    const metadataPath = path.join(testWorkspaceRoot, '.kiro', '.metadata');
    await fileSystem.ensureDirectory(metadataPath);
    
    const metadataFile = path.join(metadataPath, 'installed-frameworks.json');
    // Write invalid JSON
    await fileSystem.writeFile(metadataFile, '{ invalid json content }');
  }

  /**
   * Helper function to get memory usage
   */
  function getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024) // MB
    };
  }

  test('Baseline: Extension activation time should be < 500ms', async function() {
    this.timeout(10000);
    
    const activationTime = await measureActivationTime();
    
    console.log(`Baseline activation time: ${activationTime}ms`);
    assert.ok(activationTime < 500, `Activation time ${activationTime}ms should be < 500ms`);
  });

  test('Performance: Activation with 10 installed frameworks', async function() {
    this.timeout(30000);
    
    // Create 10 test frameworks
    await createTestFrameworks(10);
    
    // Force reload to test activation
    await vscode.commands.executeCommand('workbench.action.reloadWindow');
    
    const activationTime = await measureActivationTime();
    
    console.log(`Activation time with 10 frameworks: ${activationTime}ms`);
    assert.ok(activationTime < 1000, `Activation time ${activationTime}ms should be < 1000ms with 10 frameworks`);
  });

  test('Performance: Activation with 50 installed frameworks', async function() {
    this.timeout(60000);
    
    // Create 50 test frameworks
    await createTestFrameworks(50);
    
    const activationTime = await measureActivationTime();
    
    console.log(`Activation time with 50 frameworks: ${activationTime}ms`);
    assert.ok(activationTime < 2000, `Activation time ${activationTime}ms should be < 2000ms with 50 frameworks`);
  });

  test('Resilience: Activation with corrupted metadata should gracefully degrade', async function() {
    this.timeout(30000);
    
    // Corrupt metadata
    await corruptMetadata();
    
    const activationTime = await measureActivationTime();
    
    console.log(`Activation time with corrupted metadata: ${activationTime}ms`);
    
    // Should still activate, just without framework metadata
    assert.ok(activationTime < 1000, `Activation time ${activationTime}ms should be < 1000ms even with corrupted metadata`);
    
    // Extension should still be active
    const extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
    assert.ok(extension?.isActive, 'Extension should be active despite corrupted metadata');
  });

  test('Memory: Memory usage during activation should be reasonable', async function() {
    this.timeout(30000);
    
    const beforeMemory = getMemoryUsage();
    console.log('Memory before activation:', beforeMemory);
    
    await measureActivationTime();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const afterMemory = getMemoryUsage();
    console.log('Memory after activation:', afterMemory);
    
    const memoryIncrease = afterMemory.heapUsed - beforeMemory.heapUsed;
    console.log(`Memory increase: ${memoryIncrease}MB`);
    
    // Memory increase should be reasonable (< 50MB for baseline)
    assert.ok(memoryIncrease < 50, `Memory increase ${memoryIncrease}MB should be < 50MB`);
  });

  test('Memory: Memory usage with 50 frameworks should be reasonable', async function() {
    this.timeout(60000);
    
    // Create 50 test frameworks
    await createTestFrameworks(50);
    
    const beforeMemory = getMemoryUsage();
    console.log('Memory before activation (50 frameworks):', beforeMemory);
    
    await measureActivationTime();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const afterMemory = getMemoryUsage();
    console.log('Memory after activation (50 frameworks):', afterMemory);
    
    const memoryIncrease = afterMemory.heapUsed - beforeMemory.heapUsed;
    console.log(`Memory increase with 50 frameworks: ${memoryIncrease}MB`);
    
    // Memory increase should be reasonable even with many frameworks (< 100MB)
    assert.ok(memoryIncrease < 100, `Memory increase ${memoryIncrease}MB should be < 100MB with 50 frameworks`);
  });

  test('Lazy Loading: Framework manifest should be loaded lazily', async function() {
    this.timeout(30000);
    
    const activationTime = await measureActivationTime();
    
    // Activation should be fast because manifest is loaded lazily
    assert.ok(activationTime < 500, `Activation time ${activationTime}ms should be < 500ms (lazy loading)`);
    
    // Now trigger manifest loading by browsing frameworks
    const startBrowse = Date.now();
    await vscode.commands.executeCommand('agentic-reviewer.browseFrameworks');
    const browseTime = Date.now() - startBrowse;
    
    console.log(`First browse time (manifest load): ${browseTime}ms`);
    
    // First browse may be slower due to manifest loading
    assert.ok(browseTime < 2000, `First browse time ${browseTime}ms should be < 2000ms`);
    
    // Second browse should be faster (cached)
    const startBrowse2 = Date.now();
    await vscode.commands.executeCommand('agentic-reviewer.browseFrameworks');
    const browseTime2 = Date.now() - startBrowse2;
    
    console.log(`Second browse time (cached): ${browseTime2}ms`);
    
    // Second browse should be much faster
    assert.ok(browseTime2 < browseTime, 'Second browse should be faster than first (caching)');
  });

  test('Statistics: Activation time statistics across multiple runs', async function() {
    this.timeout(60000);
    
    const runs = 5;
    const times: number[] = [];
    
    for (let i = 0; i < runs; i++) {
      const time = await measureActivationTime();
      times.push(time);
      console.log(`Run ${i + 1}: ${time}ms`);
      
      // Small delay between runs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const stdDev = Math.sqrt(
      times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length
    );
    
    console.log(`\nActivation Statistics (${runs} runs):`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  Min: ${min}ms`);
    console.log(`  Max: ${max}ms`);
    console.log(`  Std Dev: ${stdDev.toFixed(2)}ms`);
    
    // Average should be under target
    assert.ok(avg < 500, `Average activation time ${avg.toFixed(2)}ms should be < 500ms`);
    
    // Standard deviation should be reasonable (consistent performance)
    assert.ok(stdDev < 200, `Standard deviation ${stdDev.toFixed(2)}ms should be < 200ms (consistent performance)`);
  });

  test('Stress Test: Activation with 100 frameworks', async function() {
    this.timeout(120000);
    
    // Create 100 test frameworks (stress test)
    await createTestFrameworks(100);
    
    const activationTime = await measureActivationTime();
    
    console.log(`Activation time with 100 frameworks: ${activationTime}ms`);
    
    // Should still be reasonable even with many frameworks
    assert.ok(activationTime < 3000, `Activation time ${activationTime}ms should be < 3000ms with 100 frameworks`);
  });

  test('Concurrent Operations: Activation should handle concurrent file operations', async function() {
    this.timeout(30000);
    
    // Create some frameworks
    await createTestFrameworks(10);
    
    // Start activation
    const activationPromise = measureActivationTime();
    
    // Simulate concurrent file operations
    const steeringPath = fileSystem.getSteeringPath();
    const concurrentOps = [];
    
    for (let i = 0; i < 5; i++) {
      concurrentOps.push(
        fileSystem.writeFile(
          path.join(steeringPath, `perf-test-concurrent-${i}.md`),
          `# Concurrent Test ${i}`
        )
      );
    }
    
    // Wait for both activation and concurrent operations
    const [activationTime] = await Promise.all([
      activationPromise,
      Promise.all(concurrentOps)
    ]);
    
    console.log(`Activation time with concurrent operations: ${activationTime}ms`);
    
    // Should handle concurrent operations gracefully
    assert.ok(activationTime < 1000, `Activation time ${activationTime}ms should be < 1000ms with concurrent operations`);
  });
});
