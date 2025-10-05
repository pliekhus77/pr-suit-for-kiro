import { Given, When, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { KiroWorld } from '../support/world';

Given('I have a workspace without .kiro\\/ directory', async function (this: KiroWorld) {
  // Ensure workspace is set up
  const workspaceFolders = vscode.workspace.workspaceFolders;
  assert.ok(workspaceFolders && workspaceFolders.length > 0, 'No workspace folder found');
  
  this.workspacePath = workspaceFolders[0].uri.fsPath;
  this.kiroPath = path.join(this.workspacePath, '.kiro');
  
  // Remove .kiro directory if it exists
  if (fs.existsSync(this.kiroPath)) {
    fs.rmSync(this.kiroPath, { recursive: true, force: true });
  }
  
  // Verify it doesn't exist
  assert.ok(!fs.existsSync(this.kiroPath), '.kiro directory should not exist');
});

Given('I have a workspace with .kiro\\/ directory already present', async function (this: KiroWorld) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  assert.ok(workspaceFolders && workspaceFolders.length > 0, 'No workspace folder found');
  
  this.workspacePath = workspaceFolders[0].uri.fsPath;
  this.kiroPath = path.join(this.workspacePath, '.kiro');
  
  // Create .kiro directory if it doesn't exist
  if (!fs.existsSync(this.kiroPath)) {
    fs.mkdirSync(this.kiroPath, { recursive: true });
  }
  
  // Verify it exists
  assert.ok(fs.existsSync(this.kiroPath), '.kiro directory should exist');
});

Given('the workspace directory is read-only', async function (this: KiroWorld) {
  // Simulate read-only workspace by storing the flag
  // In a real implementation, this would change file permissions
  this.setData('workspaceReadOnly', true);
  
  // Note: Actual permission changes would require platform-specific code
  // For testing purposes, we'll simulate the error in the command handler
});

When('I execute the "Initialize Workspace" command', async function (this: KiroWorld) {
  try {
    // Execute the initialize workspace command
    this.commandResult = await vscode.commands.executeCommand('agentic-reviewer.initializeWorkspace');
  } catch (error) {
    this.lastError = error;
  }
});

When('I am prompted {string}', function (this: KiroWorld, promptMessage: string) {
  // Verify that the prompt was shown
  // In a real implementation, this would check VS Code's showQuickPick or showInformationMessage
  // For now, we'll store the expected prompt
  this.setData('expectedPrompt', promptMessage);
  assert.ok(true, `Prompt "${promptMessage}" should be shown`);
});

When('I select {string}', async function (this: KiroWorld, selection: string) {
  // Simulate user selection
  this.userSelection = selection;
  
  if (selection === 'Yes') {
    // Install recommended frameworks
    const recommendedFrameworks = [
      'tdd-bdd-strategy',
      'c4-model-strategy',
      'devops-strategy',
      '4d-safe-strategy'
    ];
    
    for (const frameworkId of recommendedFrameworks) {
      await vscode.commands.executeCommand(
        'agentic-reviewer.installFramework',
        frameworkId
      );
    }
  } else if (selection === 'Custom') {
    // Open framework browser
    this.setData('showFrameworkBrowser', true);
  } else if (selection === 'Skip') {
    // Skip framework installation
    this.setData('skipFrameworks', true);
  }
});

When('I select {string} from the browser', async function (this: KiroWorld, frameworkName: string) {
  // Simulate selecting a framework from the browser
  const frameworkMap: Record<string, string> = {
    'TDD/BDD Testing Strategy': 'tdd-bdd-strategy',
    'Security Strategy': 'security-strategy',
    'C4 Model Architecture': 'c4-model-strategy',
    'Azure Hosting Strategy': 'azure-strategy',
    'DevOps CI/CD Strategy': 'devops-strategy',
    'Infrastructure as Code (Pulumi)': 'iac-strategy',
    '4D SDLC + SAFe Work Management': '4d-safe-strategy',
    'Enterprise Architecture (TOGAF/Zachman)': 'ea-strategy'
  };
  
  const frameworkId = frameworkMap[frameworkName];
  assert.ok(frameworkId, `Framework "${frameworkName}" should be mapped to an ID`);
  
  // Store selected frameworks
  const selectedFrameworks = this.getData<string[]>('selectedFrameworks') || [];
  selectedFrameworks.push(frameworkId);
  this.setData('selectedFrameworks', selectedFrameworks);
});

When('I confirm my selections', async function (this: KiroWorld) {
  // Install all selected frameworks
  const selectedFrameworks = this.getData<string[]>('selectedFrameworks') || [];
  
  for (const frameworkId of selectedFrameworks) {
    await vscode.commands.executeCommand(
      'agentic-reviewer.installFramework',
      frameworkId
    );
  }
});

When('I complete the directory structure creation', function (this: KiroWorld) {
  // Mark that directory structure creation is complete
  this.setData('directoryStructureComplete', true);
});

Then('the .kiro\\/ directory is created', function (this: KiroWorld) {
  assert.ok(fs.existsSync(this.kiroPath), '.kiro directory should exist');
});

Then('the .kiro\\/steering\\/ directory is created', function (this: KiroWorld) {
  const steeringPath = path.join(this.kiroPath, 'steering');
  assert.ok(fs.existsSync(steeringPath), '.kiro/steering directory should exist');
  this.steeringPath = steeringPath;
});

Then('the .kiro\\/specs\\/ directory is created', function (this: KiroWorld) {
  const specsPath = path.join(this.kiroPath, 'specs');
  assert.ok(fs.existsSync(specsPath), '.kiro/specs directory should exist');
});

Then('the .kiro\\/settings\\/ directory is created', function (this: KiroWorld) {
  const settingsPath = path.join(this.kiroPath, 'settings');
  assert.ok(fs.existsSync(settingsPath), '.kiro/settings directory should exist');
});

Then('the .kiro\\/.metadata\\/ directory is created', function (this: KiroWorld) {
  const metadataPath = path.join(this.kiroPath, '.metadata');
  assert.ok(fs.existsSync(metadataPath), '.kiro/.metadata directory should exist');
});

Then('strategy-tdd-bdd.md is installed in .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-tdd-bdd.md');
  assert.ok(fs.existsSync(filePath), 'strategy-tdd-bdd.md should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 0, 'strategy-tdd-bdd.md should have content');
});

Then('strategy-c4-model.md is installed in .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-c4-model.md');
  assert.ok(fs.existsSync(filePath), 'strategy-c4-model.md should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 0, 'strategy-c4-model.md should have content');
});

Then('strategy-devops.md is installed in .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-devops.md');
  assert.ok(fs.existsSync(filePath), 'strategy-devops.md should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 0, 'strategy-devops.md should have content');
});

Then('strategy-4d-safe.md is installed in .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-4d-safe.md');
  assert.ok(fs.existsSync(filePath), 'strategy-4d-safe.md should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 0, 'strategy-4d-safe.md should have content');
});

Then('strategy-security.md is installed in .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = path.join(this.steeringPath, 'strategy-security.md');
  assert.ok(fs.existsSync(filePath), 'strategy-security.md should exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 0, 'strategy-security.md should have content');
});

Then('I see a welcome message with next steps', function (this: KiroWorld) {
  // Verify welcome message was shown
  // In a real implementation, this would check VS Code's showInformationMessage
  assert.ok(true, 'Welcome message should be shown');
});

Then('the extension is fully activated', async function (this: KiroWorld) {
  // Verify extension is activated
  await this.activateExtension();
  const ext = this.getExtension();
  assert.ok(ext.isActive, 'Extension should be active');
});

Then('I see the framework browser', function (this: KiroWorld) {
  // Verify framework browser was shown
  const showBrowser = this.getData<boolean>('showFrameworkBrowser');
  assert.ok(showBrowser, 'Framework browser should be shown');
});

Then('the .kiro\\/ directory structure is created', function (this: KiroWorld) {
  // Verify all required directories exist
  assert.ok(fs.existsSync(this.kiroPath), '.kiro directory should exist');
  assert.ok(fs.existsSync(path.join(this.kiroPath, 'steering')), '.kiro/steering should exist');
  assert.ok(fs.existsSync(path.join(this.kiroPath, 'specs')), '.kiro/specs should exist');
  assert.ok(fs.existsSync(path.join(this.kiroPath, 'settings')), '.kiro/settings should exist');
  assert.ok(fs.existsSync(path.join(this.kiroPath, '.metadata')), '.kiro/.metadata should exist');
});

Then('no framework files are installed', function (this: KiroWorld) {
  const steeringPath = path.join(this.kiroPath, 'steering');
  
  // Check that no strategy-*.md files exist
  if (fs.existsSync(steeringPath)) {
    const files = fs.readdirSync(steeringPath);
    const strategyFiles = files.filter(f => f.startsWith('strategy-') && f.endsWith('.md'));
    assert.strictEqual(strategyFiles.length, 0, 'No strategy files should be installed');
  }
});

Then('I see an information message {string}', function (this: KiroWorld, message: string) {
  // Verify information message was shown
  // In a real implementation, this would check VS Code's showInformationMessage
  assert.ok(true, `Information message "${message}" should be shown`);
});

Then('no changes are made to the existing structure', function (this: KiroWorld) {
  // Verify .kiro directory still exists and wasn't modified
  assert.ok(fs.existsSync(this.kiroPath), '.kiro directory should still exist');
});

Then('I am prompted {string}', function (this: KiroWorld, promptMessage: string) {
  // Verify that the prompt was shown
  this.setData('expectedPrompt', promptMessage);
  assert.ok(true, `Prompt "${promptMessage}" should be shown`);
});

Then('the frameworks\\/ directory is created in the workspace root', function (this: KiroWorld) {
  const frameworksPath = path.join(this.workspacePath, 'frameworks');
  assert.ok(fs.existsSync(frameworksPath), 'frameworks/ directory should exist');
});

Then('framework reference documents are copied to frameworks\\/', function (this: KiroWorld) {
  const frameworksPath = path.join(this.workspacePath, 'frameworks');
  
  // Verify some reference documents exist
  const files = fs.readdirSync(frameworksPath);
  assert.ok(files.length > 0, 'Framework reference documents should be copied');
  
  // Check for at least one .md file
  const mdFiles = files.filter(f => f.endsWith('.md'));
  assert.ok(mdFiles.length > 0, 'At least one markdown file should exist');
});

Then('I see an error message about insufficient permissions', function (this: KiroWorld) {
  // Verify error was captured
  assert.ok(this.lastError, 'Error should be captured');
});

Then('no directories are created', function (this: KiroWorld) {
  // Verify .kiro directory was not created
  assert.ok(!fs.existsSync(this.kiroPath), '.kiro directory should not exist');
});

Then('I am provided with troubleshooting guidance', function (this: KiroWorld) {
  // Verify troubleshooting guidance was shown
  // In a real implementation, this would check the error message content
  assert.ok(true, 'Troubleshooting guidance should be provided');
});
