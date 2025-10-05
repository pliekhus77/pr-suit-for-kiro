import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import { FileSystemOperations } from '../../utils/file-system';

suite('File System Operations Performance Tests', () => {
  let fileSystem: FileSystemOperations;
  let testDir: string;

  setup(async () => {
    fileSystem = new FileSystemOperations();
    // Create a temporary directory for tests
    testDir = path.join(os.tmpdir(), `fs-perf-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  teardown(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to clean up test directory: ${error}`);
    }
  });

  suite('Directory Scanning Performance', () => {
    test('should scan directory with 1000+ files in reasonable time', async function() {
      this.timeout(30000); // 30 second timeout

      // Create 1000 files
      const fileCount = 1000;
      const createStart = Date.now();
      
      const createPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `file-${i}.txt`);
        createPromises.push(fs.writeFile(filePath, `Content ${i}`));
      }
      await Promise.all(createPromises);
      
      const createTime = Date.now() - createStart;
      console.log(`Created ${fileCount} files in ${createTime}ms`);

      // Benchmark directory scanning
      const scanStart = Date.now();
      const files = await fileSystem.listFiles(testDir);
      const scanTime = Date.now() - scanStart;

      console.log(`Scanned ${files.length} files in ${scanTime}ms`);
      
      assert.strictEqual(files.length, fileCount, 'Should find all files');
      assert.ok(scanTime < 5000, `Scan should complete in under 5 seconds (took ${scanTime}ms)`);
    });

    test('should scan directory with pattern filter efficiently', async function() {
      this.timeout(20000);

      // Create mixed file types
      const fileCount = 500;
      const createPromises = [];
      
      for (let i = 0; i < fileCount; i++) {
        const ext = i % 3 === 0 ? '.md' : i % 3 === 1 ? '.txt' : '.json';
        const filePath = path.join(testDir, `file-${i}${ext}`);
        createPromises.push(fs.writeFile(filePath, `Content ${i}`));
      }
      await Promise.all(createPromises);

      // Benchmark filtered scanning
      const scanStart = Date.now();
      const mdFiles = await fileSystem.listFiles(testDir, '\\.md$');
      const scanTime = Date.now() - scanStart;

      console.log(`Filtered scan found ${mdFiles.length} .md files in ${scanTime}ms`);
      
      assert.ok(mdFiles.length > 0, 'Should find .md files');
      assert.ok(scanTime < 3000, `Filtered scan should complete in under 3 seconds (took ${scanTime}ms)`);
    });

    test('should handle nested directory scanning', async function() {
      this.timeout(30000);

      // Create nested directory structure
      const depth = 5;
      const filesPerDir = 50;
      
      const createNested = async (currentPath: string, currentDepth: number) => {
        if (currentDepth > depth) {
          return;
        }

        await fs.mkdir(currentPath, { recursive: true });
        
        // Create files in current directory
        const filePromises = [];
        for (let i = 0; i < filesPerDir; i++) {
          const filePath = path.join(currentPath, `file-${i}.txt`);
          filePromises.push(fs.writeFile(filePath, `Content at depth ${currentDepth}`));
        }
        await Promise.all(filePromises);

        // Create subdirectories
        for (let i = 0; i < 3; i++) {
          const subDir = path.join(currentPath, `subdir-${i}`);
          await createNested(subDir, currentDepth + 1);
        }
      };

      const createStart = Date.now();
      await createNested(testDir, 0);
      const createTime = Date.now() - createStart;
      console.log(`Created nested structure in ${createTime}ms`);

      // Benchmark scanning top-level directory
      const scanStart = Date.now();
      const files = await fileSystem.listFiles(testDir);
      const scanTime = Date.now() - scanStart;

      console.log(`Scanned top-level directory in ${scanTime}ms (found ${files.length} files)`);
      
      assert.strictEqual(files.length, filesPerDir, 'Should only find top-level files');
      assert.ok(scanTime < 2000, `Top-level scan should be fast (took ${scanTime}ms)`);
    });
  });

  suite('File Watcher Performance', () => {
    test('should handle rapid file changes efficiently', async function() {
      this.timeout(20000);

      const testFile = path.join(testDir, 'watched-file.txt');
      await fs.writeFile(testFile, 'Initial content');

      let changeCount = 0;
      const changes: number[] = [];

      // Simulate file watcher (in real extension, this would use vscode.workspace.createFileSystemWatcher)
      const watchInterval = setInterval(async () => {
        try {
          const content = await fs.readFile(testFile, 'utf-8');
          if (content !== `Content ${changeCount - 1}`) {
            const detectTime = Date.now();
            changes.push(detectTime);
          }
        } catch (error) {
          // File might not exist yet
        }
      }, 50); // Check every 50ms

      // Perform rapid file changes
      const changeStart = Date.now();
      const rapidChanges = 100;
      
      for (let i = 0; i < rapidChanges; i++) {
        await fileSystem.writeFile(testFile, `Content ${i}`);
        changeCount++;
        // Small delay to simulate realistic change rate
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const changeTime = Date.now() - changeStart;
      
      // Wait a bit for watcher to catch up
      await new Promise(resolve => setTimeout(resolve, 500));
      clearInterval(watchInterval);

      console.log(`Performed ${rapidChanges} file changes in ${changeTime}ms`);
      console.log(`Watcher detected ${changes.length} changes`);
      
      assert.ok(changeTime < 5000, `Rapid changes should complete in reasonable time (took ${changeTime}ms)`);
    });

    test('should handle multiple file watchers without performance degradation', async function() {
      this.timeout(15000);

      const fileCount = 50;
      const files: string[] = [];
      
      // Create multiple files
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `watched-${i}.txt`);
        await fs.writeFile(filePath, `Initial ${i}`);
        files.push(filePath);
      }

      // Simulate multiple watchers
      const watchers: NodeJS.Timeout[] = [];
      const detections = new Map<string, number>();

      files.forEach(file => {
        const watcher = setInterval(async () => {
          try {
            await fs.stat(file);
            detections.set(file, (detections.get(file) || 0) + 1);
          } catch (error) {
            // File might not exist
          }
        }, 100);
        watchers.push(watcher);
      });

      // Perform changes to random files
      const changeStart = Date.now();
      for (let i = 0; i < 100; i++) {
        const randomFile = files[Math.floor(Math.random() * files.length)];
        await fileSystem.writeFile(randomFile, `Updated ${i}`);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      const changeTime = Date.now() - changeStart;

      // Wait for watchers to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clean up watchers
      watchers.forEach(w => clearInterval(w));

      console.log(`Multiple watchers handled ${detections.size} files in ${changeTime}ms`);
      
      assert.ok(changeTime < 10000, `Multiple watchers should not cause significant slowdown (took ${changeTime}ms)`);
    });
  });

  suite('Concurrent File Operations', () => {
    test('should handle concurrent file reads efficiently', async function() {
      this.timeout(15000);

      // Create test files
      const fileCount = 100;
      const createPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `read-${i}.txt`);
        createPromises.push(fs.writeFile(filePath, `Content for file ${i}`.repeat(100)));
      }
      await Promise.all(createPromises);

      // Benchmark concurrent reads
      const readStart = Date.now();
      const readPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `read-${i}.txt`);
        readPromises.push(fileSystem.readFile(filePath));
      }
      const contents = await Promise.all(readPromises);
      const readTime = Date.now() - readStart;

      console.log(`Read ${fileCount} files concurrently in ${readTime}ms`);
      
      assert.strictEqual(contents.length, fileCount, 'Should read all files');
      assert.ok(readTime < 5000, `Concurrent reads should be fast (took ${readTime}ms)`);
    });

    test('should handle concurrent file writes efficiently', async function() {
      this.timeout(15000);

      const fileCount = 100;
      
      // Benchmark concurrent writes
      const writeStart = Date.now();
      const writePromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `write-${i}.txt`);
        const content = `Content for file ${i}`.repeat(100);
        writePromises.push(fileSystem.writeFile(filePath, content));
      }
      await Promise.all(writePromises);
      const writeTime = Date.now() - writeStart;

      console.log(`Wrote ${fileCount} files concurrently in ${writeTime}ms`);
      
      // Verify all files were written
      const files = await fileSystem.listFiles(testDir);
      const writtenFiles = files.filter(f => f.startsWith('write-'));
      
      assert.strictEqual(writtenFiles.length, fileCount, 'Should write all files');
      assert.ok(writeTime < 5000, `Concurrent writes should be fast (took ${writeTime}ms)`);
    });

    test('should handle concurrent copy operations', async function() {
      this.timeout(15000);

      // Create source files
      const fileCount = 50;
      const sourceDir = path.join(testDir, 'source');
      const destDir = path.join(testDir, 'dest');
      
      await fs.mkdir(sourceDir, { recursive: true });
      await fs.mkdir(destDir, { recursive: true });

      const createPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(sourceDir, `file-${i}.txt`);
        createPromises.push(fs.writeFile(filePath, `Content ${i}`.repeat(50)));
      }
      await Promise.all(createPromises);

      // Benchmark concurrent copies
      const copyStart = Date.now();
      const copyPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const source = path.join(sourceDir, `file-${i}.txt`);
        const dest = path.join(destDir, `file-${i}.txt`);
        copyPromises.push(fileSystem.copyFile(source, dest));
      }
      await Promise.all(copyPromises);
      const copyTime = Date.now() - copyStart;

      console.log(`Copied ${fileCount} files concurrently in ${copyTime}ms`);
      
      // Verify all files were copied
      const copiedFiles = await fileSystem.listFiles(destDir);
      
      assert.strictEqual(copiedFiles.length, fileCount, 'Should copy all files');
      assert.ok(copyTime < 5000, `Concurrent copies should be fast (took ${copyTime}ms)`);
    });

    test('should handle mixed concurrent operations', async function() {
      this.timeout(20000);

      const operationCount = 30;
      
      // Create some initial files
      const initialFiles = [];
      for (let i = 0; i < operationCount; i++) {
        const filePath = path.join(testDir, `initial-${i}.txt`);
        await fs.writeFile(filePath, `Initial ${i}`);
        initialFiles.push(filePath);
      }

      // Benchmark mixed operations
      const mixedStart = Date.now();
      const operations = [];

      // Mix of reads, writes, copies, and deletes
      for (let i = 0; i < operationCount; i++) {
        const opType = i % 4;
        
        if (opType === 0) {
          // Read
          operations.push(fileSystem.readFile(initialFiles[i]));
        } else if (opType === 1) {
          // Write
          const filePath = path.join(testDir, `new-${i}.txt`);
          operations.push(fileSystem.writeFile(filePath, `New content ${i}`));
        } else if (opType === 2) {
          // Copy
          const source = initialFiles[i];
          const dest = path.join(testDir, `copy-${i}.txt`);
          operations.push(fileSystem.copyFile(source, dest));
        } else {
          // Check existence
          operations.push(fileSystem.fileExists(initialFiles[i]));
        }
      }

      await Promise.all(operations);
      const mixedTime = Date.now() - mixedStart;

      console.log(`Performed ${operationCount} mixed operations concurrently in ${mixedTime}ms`);
      
      assert.ok(mixedTime < 8000, `Mixed concurrent operations should complete in reasonable time (took ${mixedTime}ms)`);
    });
  });

  suite('Memory Usage with Large Files', () => {
    test('should handle large file reads without excessive memory usage', async function() {
      this.timeout(20000);

      // Create a large file (10MB)
      const largeFilePath = path.join(testDir, 'large-file.txt');
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunks = 10;
      
      let content = '';
      for (let i = 0; i < chunks; i++) {
        content += 'x'.repeat(chunkSize);
      }

      const writeStart = Date.now();
      await fs.writeFile(largeFilePath, content);
      const writeTime = Date.now() - writeStart;
      console.log(`Wrote ${chunks}MB file in ${writeTime}ms`);

      // Measure memory before read
      const memBefore = process.memoryUsage();

      // Benchmark large file read
      const readStart = Date.now();
      const readContent = await fileSystem.readFile(largeFilePath);
      const readTime = Date.now() - readStart;

      // Measure memory after read
      const memAfter = process.memoryUsage();
      const memIncrease = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

      console.log(`Read ${chunks}MB file in ${readTime}ms`);
      console.log(`Memory increase: ${memIncrease.toFixed(2)}MB`);
      
      assert.strictEqual(readContent.length, content.length, 'Should read entire file');
      assert.ok(readTime < 5000, `Large file read should complete in reasonable time (took ${readTime}ms)`);
      assert.ok(memIncrease < 50, `Memory increase should be reasonable (${memIncrease.toFixed(2)}MB)`);
    });

    test('should handle multiple large file operations', async function() {
      this.timeout(30000);

      const fileCount = 5;
      const fileSize = 5 * 1024 * 1024; // 5MB each
      const content = 'x'.repeat(fileSize);

      // Measure memory before operations
      const memBefore = process.memoryUsage();

      // Create large files
      const createStart = Date.now();
      const createPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `large-${i}.txt`);
        createPromises.push(fs.writeFile(filePath, content));
      }
      await Promise.all(createPromises);
      const createTime = Date.now() - createStart;

      // Read large files
      const readStart = Date.now();
      const readPromises = [];
      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(testDir, `large-${i}.txt`);
        readPromises.push(fileSystem.readFile(filePath));
      }
      await Promise.all(readPromises);
      const readTime = Date.now() - readStart;

      // Measure memory after operations
      const memAfter = process.memoryUsage();
      const memIncrease = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

      console.log(`Created ${fileCount} large files (${fileSize / 1024 / 1024}MB each) in ${createTime}ms`);
      console.log(`Read ${fileCount} large files in ${readTime}ms`);
      console.log(`Total memory increase: ${memIncrease.toFixed(2)}MB`);
      
      assert.ok(createTime < 10000, `Large file creation should complete in reasonable time (took ${createTime}ms)`);
      assert.ok(readTime < 10000, `Large file reads should complete in reasonable time (took ${readTime}ms)`);
      assert.ok(memIncrease < 100, `Memory increase should be manageable (${memIncrease.toFixed(2)}MB)`);
    });
  });

  suite('Performance Regression Tests', () => {
    test('should maintain consistent performance across multiple runs', async function() {
      this.timeout(30000);

      const runs = 5;
      const fileCount = 100;
      const times: number[] = [];

      for (let run = 0; run < runs; run++) {
        const runDir = path.join(testDir, `run-${run}`);
        await fs.mkdir(runDir, { recursive: true });

        // Create files
        const createPromises = [];
        for (let i = 0; i < fileCount; i++) {
          const filePath = path.join(runDir, `file-${i}.txt`);
          createPromises.push(fs.writeFile(filePath, `Content ${i}`));
        }
        await Promise.all(createPromises);

        // Measure scan time
        const scanStart = Date.now();
        await fileSystem.listFiles(runDir);
        const scanTime = Date.now() - scanStart;
        times.push(scanTime);

        console.log(`Run ${run + 1}: ${scanTime}ms`);
      }

      // Calculate statistics
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);

      console.log(`Average: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms, StdDev: ${stdDev.toFixed(2)}ms`);
      
      // Performance should be consistent (standard deviation should be low)
      assert.ok(stdDev < avgTime * 0.5, `Performance should be consistent (StdDev: ${stdDev.toFixed(2)}ms, Avg: ${avgTime.toFixed(2)}ms)`);
    });
  });
});
