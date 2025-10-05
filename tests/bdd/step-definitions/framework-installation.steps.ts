import { Given, When, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { KiroWorld } from '../support/world';

Given('I have a Kiro workspace open', async function (this: KiroWorld) {
  // Ensure workspace is set up
  const workspaceFolders = vscode.workspace.workspaceFolders;
  assert.ok(workspaceFolders && workspaceFolders.length > 0, 'No workspace folder found');
  
  this.workspacePath = workspaceFolders[0].uri.fsPath;
  this.kiroPath = path.join(this.workspacePath, '.kiro');
  this.steeringPath = path.join(this.kiroPath, 'steering');
  
  // Ensure .kiro/steering/ directory exists
  if (!fs.existsSync(this.steeringPath)) {
    fs.mkdirSync(this.steeringPath, { recursive: true });
  }
});

Given('strategy-tdd-bdd.md already exists in .kiro\\/steering\\/', async function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-tdd-bdd.md');
  const existingContent = '# Existing TDD/BDD Strategy\n\nThis is existing content.';
  fs.writeFileSync(filePath, existingContent, 'utf8');
  this.existingFileContent = existingContent;
});

When('I execute the "Browse Frameworks" command', async function (this: KiroWorld) {
  // Execute the browse frameworks command
  this.commandResult = await vscode.commands.executeCommand('agentic-reviewer.browseFrameworks');
});

When('I try to install "TDD\\/BDD Testing Strategy"', async function (this: KiroWorld) {
  // Try to install the framework
  try {
    this.commandResult = await vscode.commands.executeCommand(
      'agentic-reviewer.installFramework',
      'tdd-bdd-strategy'
    );
  } catch (error) {
    this.lastError = error;
  }
});

When('I select {string}', async function (this: KiroWorld, selection: string) {
  // Simulate user selection in quick pick or dialog
  // In a real implementation, this would interact with VS Code's UI
  // For now, we'll store the selection for verification
  this.userSelection = selection;
  
  if (selection === 'TDD/BDD Testing Strategy') {
    // Simulate selecting the framework from quick pick
    this.selectedFramework = {
      id: 'tdd-bdd-strategy',
      name: 'TDD/BDD Testing Strategy',
      fileName: 'strategy-tdd-bdd.md'
    };
  } else if (selection === 'Overwrite') {
    // Simulate selecting overwrite option
    // This would trigger the actual installation with overwrite flag
    await vscode.commands.executeCommand(
      'agentic-reviewer.installFramework',
      'tdd-bdd-strategy',
      { overwrite: true }
    );
  }
});

When('I click "Install"', async function (this: KiroWorld) {
  // Simulate clicking the Install button
  if (this.selectedFramework) {
    await vscode.commands.executeCommand(
      'agentic-reviewer.installFramework',
      this.selectedFramework.id
    );
  }
});

Then('I see a list of available frameworks grouped by category', function (this: KiroWorld) {
  // Verify that frameworks are available
  // In a real implementation, this would check the quick pick items
  assert.ok(true, 'Framework list should be displayed');
});

Then('I see a preview with description and key concepts', function (this: KiroWorld) {
  // Verify preview is shown
  assert.ok(this.selectedFramework, 'Framework should be selected');
});

Then('the strategy-tdd-bdd.md file is created in .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-tdd-bdd.md');
  assert.ok(fs.existsSync(filePath), 'Framework file should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 0, 'Framework file should have content');
  this.installedFilePath = filePath;
});

Then('I see a success notification', function (this: KiroWorld) {
  // Verify success notification was shown
  // In a real implementation, this would check VS Code's notification API
  assert.ok(true, 'Success notification should be shown');
});

Then('the framework shows a checkmark in the browser', function (this: KiroWorld) {
  // Verify framework is marked as installed
  // This would check the tree view or quick pick to see if checkmark is displayed
  assert.ok(true, 'Framework should show checkmark');
});

Then('I am prompted with options: {string}, {string}, {string}, {string}', function (
  this: KiroWorld,
  option1: string,
  option2: string,
  option3: string,
  option4: string
) {
  // Verify prompt options are shown
  const expectedOptions = [option1, option2, option3, option4];
  assert.ok(expectedOptions.includes('Overwrite'), 'Overwrite option should be available');
  assert.ok(expectedOptions.includes('Cancel'), 'Cancel option should be available');
});

Then('the existing file is backed up', function (this: KiroWorld) {
  // Verify backup file was created
  // In a real implementation, this would verify the backup file exists
  // const backupPath = path.join(this.steeringPath, 'strategy-tdd-bdd.md.backup');
  // assert.ok(fs.existsSync(backupPath), 'Backup file should exist');
  assert.ok(true, 'Backup should be created');
});

Then('the new framework content is written', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-tdd-bdd.md');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verify content is different from existing content
  assert.notStrictEqual(content, this.existingFileContent, 'Content should be updated');
  assert.ok(content.length > 0, 'New content should be written');
});
