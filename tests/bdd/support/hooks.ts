/**
 * Cucumber Hooks
 * 
 * Hooks run before/after scenarios and steps.
 * Used for setup, teardown, and cleanup.
 */

import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { ExtensionWorld } from './world';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Global setup - runs once before all scenarios
 */
BeforeAll(async function() {
  console.log('🚀 Starting BDD test suite for Pragmatic Rhino SUIT extension');
  
  // Ensure test workspace exists
  const testWorkspacePath = path.join(__dirname, '../../../test-workspace');
  if (!fs.existsSync(testWorkspacePath)) {
    fs.mkdirSync(testWorkspacePath, { recursive: true });
  }
});

/**
 * Global teardown - runs once after all scenarios
 */
AfterAll(async function() {
  console.log('✅ BDD test suite completed');
});

/**
 * Scenario setup - runs before each scenario
 */
Before(async function(this: ExtensionWorld, { pickle }) {
  console.log(`\n📝 Starting scenario: ${pickle.name}`);
  
  // Clear test data from previous scenario
  this.clearData();
  
  // Initialize browser if scenario has @webview tag
  const tags = pickle.tags.map(tag => tag.name);
  if (tags.includes('@webview')) {
    await this.initBrowser();
  }
  
  // Activate extension if scenario has @extension tag
  if (tags.includes('@extension')) {
    await this.activateExtension();
  }
});

/**
 * Scenario teardown - runs after each scenario
 */
After(async function(this: ExtensionWorld, { pickle, result }) {
  // Log scenario result
  const status = result?.status || Status.UNKNOWN;
  const emoji = status === Status.PASSED ? '✅' : status === Status.FAILED ? '❌' : '⚠️';
  console.log(`${emoji} Scenario ${status}: ${pickle.name}`);
  
  // Take screenshot on failure if browser is open
  if (status === Status.FAILED && this.page) {
    const screenshotPath = path.join(
      __dirname,
      '../reports/screenshots',
      `${pickle.name.replace(/\s+/g, '-')}-${Date.now()}.png`
    );
    
    // Ensure screenshots directory exists
    const screenshotsDir = path.dirname(screenshotPath);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }
  
  // Close browser if it was opened
  if (this.browser) {
    await this.closeBrowser();
  }
  
  // Clear test data
  this.clearData();
});

/**
 * Step hook - runs before each step (optional, for debugging)
 */
// BeforeStep(async function(this: ExtensionWorld, { pickleStep }) {
//   console.log(`  ▶️  ${pickleStep.text}`);
// });

/**
 * Step hook - runs after each step (optional, for debugging)
 */
// AfterStep(async function(this: ExtensionWorld, { pickleStep, result }) {
//   const status = result?.status || Status.UNKNOWN;
//   const emoji = status === Status.PASSED ? '✅' : status === Status.FAILED ? '❌' : '⚠️';
//   console.log(`  ${emoji} ${pickleStep.text}`);
// });
