/**
 * Test Helpers
 * 
 * Common utility functions for BDD tests
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await sleep(intervalMs);
  }
  
  throw new Error(`Timeout waiting for condition after ${timeoutMs}ms`);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a temporary test workspace
 */
export async function createTestWorkspace(name: string): Promise<string> {
  const workspacePath = path.join(__dirname, '../../../test-workspace', name);
  
  if (fs.existsSync(workspacePath)) {
    // Clean up existing workspace
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
  
  fs.mkdirSync(workspacePath, { recursive: true });
  return workspacePath;
}

/**
 * Clean up test workspace
 */
export function cleanupTestWorkspace(workspacePath: string): void {
  if (fs.existsSync(workspacePath)) {
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}

/**
 * Create .kiro directory structure
 */
export function createKiroStructure(workspacePath: string): void {
  const kiroPath = path.join(workspacePath, '.kiro');
  const steeringPath = path.join(kiroPath, 'steering');
  const specsPath = path.join(kiroPath, 'specs');
  const settingsPath = path.join(kiroPath, 'settings');
  const metadataPath = path.join(kiroPath, '.metadata');
  
  fs.mkdirSync(steeringPath, { recursive: true });
  fs.mkdirSync(specsPath, { recursive: true });
  fs.mkdirSync(settingsPath, { recursive: true });
  fs.mkdirSync(metadataPath, { recursive: true });
}

/**
 * Execute VS Code command and wait for completion
 */
export async function executeCommand<T = unknown>(
  command: string,
  ...args: unknown[]
): Promise<T> {
  return await vscode.commands.executeCommand<T>(command, ...args);
}

/**
 * Open a file in VS Code editor
 */
export async function openFile(filePath: string): Promise<vscode.TextEditor> {
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  return await vscode.window.showTextDocument(document);
}

/**
 * Get active text editor
 */
export function getActiveEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}

/**
 * Wait for file to exist
 */
export async function waitForFile(
  filePath: string,
  timeoutMs: number = 5000
): Promise<void> {
  await waitFor(() => fs.existsSync(filePath), timeoutMs);
}

/**
 * Read file content
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Write file content
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Get all files in directory matching pattern
 */
export function getFilesInDirectory(
  dirPath: string,
  pattern?: RegExp
): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  const files = fs.readdirSync(dirPath);
  
  if (pattern) {
    return files.filter(file => pattern.test(file));
  }
  
  return files;
}

/**
 * Assert that a condition is true
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert that two values are equal
 */
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    const msg = message || `Expected ${expected} but got ${actual}`;
    throw new Error(`Assertion failed: ${msg}`);
  }
}

/**
 * Assert that a value is truthy
 */
export function assertTruthy(value: unknown, message?: string): void {
  if (!value) {
    const msg = message || `Expected truthy value but got ${value}`;
    throw new Error(`Assertion failed: ${msg}`);
  }
}

/**
 * Assert that a value is falsy
 */
export function assertFalsy(value: unknown, message?: string): void {
  if (value) {
    const msg = message || `Expected falsy value but got ${value}`;
    throw new Error(`Assertion failed: ${msg}`);
  }
}

/**
 * Assert that an array contains a value
 */
export function assertContains<T>(array: T[], value: T, message?: string): void {
  if (!array.includes(value)) {
    const msg = message || `Expected array to contain ${value}`;
    throw new Error(`Assertion failed: ${msg}`);
  }
}

/**
 * Assert that a string matches a pattern
 */
export function assertMatches(text: string, pattern: RegExp, message?: string): void {
  if (!pattern.test(text)) {
    const msg = message || `Expected "${text}" to match pattern ${pattern}`;
    throw new Error(`Assertion failed: ${msg}`);
  }
}
