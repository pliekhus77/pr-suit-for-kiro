/**
 * Example Step Definitions
 * 
 * These step definitions demonstrate how to write BDD tests
 * for the Pragmatic Rhino SUIT extension.
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { ExtensionWorld } from '../support/world';
import * as vscode from 'vscode';
import { assert, assertEqual, assertContains } from '../support/helpers';

/**
 * Background step - ensure extension is activated
 */
Given('the extension is installed and activated', async function(this: ExtensionWorld) {
  await this.activateExtension();
  const ext = this.getExtension();
  assert(ext.isActive, 'Extension should be active');
});

/**
 * Check extension status
 */
When('I check the extension status', function(this: ExtensionWorld) {
  const ext = this.getExtension();
  this.setData('extension', ext);
});

/**
 * Verify extension is active
 */
Then('the extension should be active', function(this: ExtensionWorld) {
  const ext = this.getData<vscode.Extension<unknown>>('extension');
  assert(ext !== undefined, 'Extension should be defined');
  assert(ext!.isActive, 'Extension should be active');
});

/**
 * Verify extension ID
 */
Then('the extension ID should be {string}', function(this: ExtensionWorld, expectedId: string) {
  const ext = this.getData<vscode.Extension<unknown>>('extension');
  assert(ext !== undefined, 'Extension should be defined');
  assertEqual(ext!.id, expectedId, `Extension ID should be ${expectedId}`);
});

/**
 * List all extension commands
 */
When('I list all extension commands', async function(this: ExtensionWorld) {
  const commands = await vscode.commands.getCommands(true);
  
  // Filter to only extension commands
  const extensionCommands = commands.filter(cmd => 
    cmd.startsWith('agentic-reviewer.')
  );
  
  this.setData('commands', extensionCommands);
});

/**
 * Verify command exists in list
 */
Then('the command list should include {string}', function(this: ExtensionWorld, commandName: string) {
  const commands = this.getData<string[]>('commands');
  assert(commands !== undefined, 'Commands should be defined');
  assertContains(commands!, commandName, `Command list should include ${commandName}`);
});
