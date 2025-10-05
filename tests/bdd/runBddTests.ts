/**
 * BDD Test Runner for VS Code Extension
 * 
 * This runner executes Cucumber BDD tests within the VS Code Extension Host environment.
 * This is necessary because the tests require access to the VS Code API.
 */

import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test script
    const extensionTestsPath = path.resolve(__dirname, './index');

    // Download VS Code, unzip it and run the integration test
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        '--disable-extensions', // Disable other extensions
        '--disable-gpu',
        path.resolve(__dirname, '../../test-workspace') // Test workspace
      ]
    });
  } catch (err) {
    console.error('Failed to run BDD tests:', err);
    process.exit(1);
  }
}

main();
