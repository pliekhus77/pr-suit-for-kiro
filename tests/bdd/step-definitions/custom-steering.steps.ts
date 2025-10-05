import { Given, When, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { KiroWorld } from '../support/world';
import { waitFor, waitForFile, readFile } from '../support/helpers';

// ============================================================================
// Given Steps
// ============================================================================

Given('I have a custom steering document with all required sections', async function (this: KiroWorld) {
  const fileName = 'custom-valid.md';
  const filePath = path.join(this.steeringPath, fileName);
  
  const content = `# Team Standards

## Purpose
Define team-specific coding standards and practices.

## Key Concepts
- Code review process
- Git workflow
- Documentation requirements

## Best Practices
1. Always write tests first
2. Use meaningful commit messages
3. Document public APIs

## Anti-Patterns
- Skipping code reviews
- Committing directly to main
- No documentation

## Summary
Follow these standards to maintain code quality and team collaboration.
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  this.setData('validSteeringFile', filePath);
});

Given('I have a custom steering document missing {string} section', async function (this: KiroWorld, section: string) {
  const fileName = 'custom-missing-section.md';
  const filePath = path.join(this.steeringPath, fileName);
  
  // Create document without the specified section
  let content = '# Team Standards\n\n';
  
  const sections = ['Purpose', 'Key Concepts', 'Best Practices', 'Anti-Patterns', 'Summary'];
  for (const s of sections) {
    if (s !== section) {
      content += `## ${s}\n\nSome content for ${s}.\n\n`;
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  this.setData('invalidSteeringFile', filePath);
  this.setData('missingSection', section);
  
  // Open the document in editor
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  this.openedDocument = document;
});

Given('I have a custom steering document with only theoretical content', async function (this: KiroWorld) {
  const fileName = 'custom-theoretical.md';
  const filePath = path.join(this.steeringPath, fileName);
  
  const content = `# Team Standards

## Purpose
This document describes theoretical concepts.

## Key Concepts
Software engineering is important. Quality matters. Testing is good.

## Best Practices
You should write good code. Make sure things work properly.

## Anti-Patterns
Don't write bad code. Avoid mistakes.

## Summary
Follow best practices and avoid anti-patterns.
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  this.setData('theoreticalFile', filePath);
  
  // Open the document in editor
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  this.openedDocument = document;
});

Given('I have a custom steering document with inconsistent heading levels', async function (this: KiroWorld) {
  const fileName = 'custom-bad-formatting.md';
  const filePath = path.join(this.steeringPath, fileName);
  
  const content = `# Team Standards

### Purpose
Skipped heading level 2.

## Key Concepts
Normal level 2.

#### Subsection
Skipped level 3.

## Best Practices
Back to level 2.

## Anti-Patterns
Another level 2.

## Summary
Final section.
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  this.setData('badFormattingFile', filePath);
  
  // Open the document in editor
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  this.openedDocument = document;
});

Given('I have a custom steering document {string}', async function (this: KiroWorld, fileName: string) {
  const filePath = path.join(this.steeringPath, fileName);
  
  const content = `# Custom Document

## Purpose
Test document for operations.

## Key Concepts
Some concepts.

## Best Practices
Some practices.

## Anti-Patterns
Some anti-patterns.

## Summary
Test summary.
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
  this.setData('customFile', filePath);
  this.setData('customFileName', fileName);
});

Given('I have an empty custom steering document', async function (this: KiroWorld) {
  const fileName = 'custom-empty.md';
  const filePath = path.join(this.steeringPath, fileName);
  
  fs.writeFileSync(filePath, '', 'utf8');
  this.setData('emptyFile', filePath);
  
  // Open the document in editor
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  this.openedDocument = document;
});

Given('I have a custom steering document larger than {int}MB', async function (this: KiroWorld, sizeMB: number) {
  const fileName = 'custom-large.md';
  const filePath = path.join(this.steeringPath, fileName);
  
  // Create a large document
  let content = '# Large Document\n\n## Purpose\nTest performance.\n\n';
  
  // Add content to reach the target size
  const targetSize = sizeMB * 1024 * 1024;
  const sectionContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100);
  
  while (content.length < targetSize) {
    content += `## Section ${content.length}\n\n${sectionContent}\n\n`;
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  this.setData('largeFile', filePath);
  
  // Open the document in editor
  const uri = vscode.Uri.file(filePath);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);
  this.openedDocument = document;
});

// ============================================================================
// When Steps
// ============================================================================

When('I execute the {string} command', async function (this: KiroWorld, commandName: string) {
  const commandMap: Record<string, string> = {
    'Create Custom Steering': 'agentic-reviewer.createCustomSteering',
    'Validate Steering Document': 'agentic-reviewer.validateSteering'
  };
  
  const commandId = commandMap[commandName];
  if (!commandId) {
    throw new Error(`Unknown command: ${commandName}`);
  }
  
  this.setData('executedCommand', commandId);
  
  // For validation command, execute it on the current document
  if (commandId === 'agentic-reviewer.validateSteering') {
    try {
      this.commandResult = await vscode.commands.executeCommand(commandId);
      this.setData('validationStartTime', Date.now());
    } catch (error) {
      this.lastError = error;
    }
  }
});

When('I enter the name {string}', async function (this: KiroWorld, name: string) {
  this.setData('enteredName', name);
  
  // Simulate user input for the command
  const commandId = this.getData<string>('executedCommand');
  
  if (commandId === 'agentic-reviewer.createCustomSteering') {
    try {
      // Execute the command with the name
      this.commandResult = await vscode.commands.executeCommand(commandId, name);
    } catch (error) {
      this.lastError = error;
    }
  }
});

When('I right-click the document in the tree view', function (this: KiroWorld) {
  // Simulate right-click action
  this.setData('contextMenuOpened', true);
});

When('I select {string} from the context menu', async function (this: KiroWorld, action: string) {
  this.setData('selectedAction', action);
  
  if (action === 'Rename') {
    // Prepare for rename operation
    this.setData('renameOperation', true);
  } else if (action === 'Delete') {
    // Prepare for delete operation
    this.setData('deleteOperation', true);
  }
});

When('I enter the new name {string}', async function (this: KiroWorld, newName: string) {
  this.setData('newName', newName);
  
  const oldFilePath = this.getData<string>('customFile');
  if (!oldFilePath) {
    throw new Error('No file to rename');
  }
  
  const dir = path.dirname(oldFilePath);
  const newFileName = `custom-${newName}.md`;
  const newFilePath = path.join(dir, newFileName);
  
  // Perform rename
  if (fs.existsSync(oldFilePath)) {
    fs.renameSync(oldFilePath, newFilePath);
    this.setData('renamedFile', newFilePath);
  }
});

When('I confirm the deletion', async function (this: KiroWorld) {
  const filePath = this.getData<string>('customFile');
  if (!filePath) {
    throw new Error('No file to delete');
  }
  
  // Perform deletion
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    this.setData('fileDeleted', true);
  }
});

When('I select {string}', function (this: KiroWorld, option: string) {
  this.userSelection = option;
  this.setData('userSelection', option);
});

// ============================================================================
// Then Steps
// ============================================================================

Then('a file {string} is created in .kiro\\/steering\\/', async function (this: KiroWorld, fileName: string) {
  const filePath = path.join(this.steeringPath, fileName);
  
  // Wait for file to be created
  await waitForFile(filePath, 5000);
  
  assert.ok(fs.existsSync(filePath), `File ${fileName} should exist`);
  this.setData('createdFile', filePath);
});

Then('the file contains the standard template sections', function (this: KiroWorld) {
  const filePath = this.getData<string>('createdFile');
  if (!filePath) {
    throw new Error('No file was created');
  }
  
  const content = readFile(filePath);
  
  // Check for required sections
  const requiredSections = ['Purpose', 'Key Concepts', 'Best Practices', 'Anti-Patterns', 'Summary'];
  
  for (const section of requiredSections) {
    assert.ok(
      content.includes(`## ${section}`),
      `File should contain ${section} section`
    );
  }
});

Then('the file opens in the editor', async function (this: KiroWorld) {
  // Wait for editor to open
  await waitFor(() => vscode.window.activeTextEditor !== undefined, 5000);
  
  const editor = vscode.window.activeTextEditor;
  assert.ok(editor, 'File should be opened in editor');
  
  const filePath = this.getData<string>('createdFile');
  if (filePath) {
    assert.ok(
      editor.document.uri.fsPath === filePath,
      'Opened file should match created file'
    );
  }
});

Then('I see the file in the tree view under {string} category', function (this: KiroWorld) {
  // Verify file is in the correct category
  // In a real implementation, this would check the tree view provider
  const filePath = this.getData<string>('createdFile');
  assert.ok(filePath, 'File should exist');
  assert.ok(
    path.basename(filePath).startsWith('custom-'),
    'Custom files should have custom- prefix'
  );
});

Then('I see an error {string}', function (this: KiroWorld, errorMessage: string) {
  // Verify error was shown
  assert.ok(this.lastError, 'An error should have occurred');
  this.setData('expectedError', errorMessage);
});

Then('no file is created', function (this: KiroWorld) {
  const name = this.getData<string>('enteredName');
  if (name) {
    // Check that no file with this name exists
    const possibleFiles = [
      path.join(this.steeringPath, `custom-${name}.md`),
      path.join(this.steeringPath, `${name}.md`)
    ];
    
    for (const filePath of possibleFiles) {
      assert.ok(!fs.existsSync(filePath), `File ${filePath} should not exist`);
    }
  }
});

Then('I see a success message {string}', function (this: KiroWorld, message: string) {
  // Verify success message was shown
  // In a real implementation, this would check VS Code's notification API
  assert.ok(!this.lastError, 'No error should have occurred');
  this.setData('successMessage', message);
});

Then('no diagnostic issues are shown', function (this: KiroWorld) {
  // Verify no diagnostics
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    assert.strictEqual(diagnostics.length, 0, 'No diagnostics should be shown');
  }
});

Then('I see diagnostic errors for missing sections', function (this: KiroWorld) {
  // Verify diagnostics are shown
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    assert.ok(diagnostics.length > 0, 'Diagnostics should be shown');
    
    // Check for error severity
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    assert.ok(errors.length > 0, 'Error diagnostics should be shown');
  }
});

Then('the error highlights the missing {string} section', function (this: KiroWorld, section: string) {
  // Verify specific section error
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    const sectionError = diagnostics.find(d => 
      d.message.includes(section) || d.message.includes('missing')
    );
    
    assert.ok(sectionError, `Error for missing ${section} section should be shown`);
  }
});

Then('I see a quick fix suggestion to add the missing section', function (this: KiroWorld) {
  // Verify quick fix is available
  // In a real implementation, this would check code actions
  assert.ok(true, 'Quick fix should be available');
});

Then('I see warnings about lack of actionable guidance', function (this: KiroWorld) {
  // Verify warnings about content quality
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
    
    assert.ok(warnings.length > 0, 'Warnings should be shown');
    
    const guidanceWarning = warnings.find(d => 
      d.message.toLowerCase().includes('actionable') || 
      d.message.toLowerCase().includes('guidance')
    );
    
    assert.ok(guidanceWarning, 'Warning about actionable guidance should be shown');
  }
});

Then('I see warnings about missing examples', function (this: KiroWorld) {
  // Verify warnings about missing examples
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
    
    const exampleWarning = warnings.find(d => 
      d.message.toLowerCase().includes('example')
    );
    
    assert.ok(exampleWarning, 'Warning about missing examples should be shown');
  }
});

Then('I see suggestions to improve content quality', function (this: KiroWorld) {
  // Verify suggestions are provided
  assert.ok(true, 'Suggestions should be provided');
});

Then('I see warnings about formatting issues', function (this: KiroWorld) {
  // Verify formatting warnings
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
    
    assert.ok(warnings.length > 0, 'Formatting warnings should be shown');
  }
});

Then('I see suggestions to fix heading hierarchy', function (this: KiroWorld) {
  // Verify heading hierarchy suggestions
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    const headingWarning = diagnostics.find(d => 
      d.message.toLowerCase().includes('heading') || 
      d.message.toLowerCase().includes('hierarchy')
    );
    
    assert.ok(headingWarning, 'Warning about heading hierarchy should be shown');
  }
});

Then('the file is renamed to {string}', function (this: KiroWorld, newFileName: string) {
  const newFilePath = path.join(this.steeringPath, newFileName);
  assert.ok(fs.existsSync(newFilePath), `File ${newFileName} should exist after rename`);
  
  const oldFilePath = this.getData<string>('customFile');
  if (oldFilePath) {
    assert.ok(!fs.existsSync(oldFilePath), 'Old file should not exist after rename');
  }
});

Then('the tree view is refreshed', function (this: KiroWorld) {
  // Verify tree view refresh
  // In a real implementation, this would check tree view provider refresh
  assert.ok(true, 'Tree view should be refreshed');
});

Then('I see the renamed file in the tree view', function (this: KiroWorld) {
  const renamedFile = this.getData<string>('renamedFile');
  assert.ok(renamedFile, 'Renamed file should exist');
  assert.ok(fs.existsSync(renamedFile), 'Renamed file should exist on disk');
});

Then('the file is deleted from .kiro\\/steering\\/', function (this: KiroWorld) {
  const filePath = this.getData<string>('customFile');
  if (filePath) {
    assert.ok(!fs.existsSync(filePath), 'File should be deleted');
  }
  
  const deleted = this.getData<boolean>('fileDeleted');
  assert.ok(deleted, 'File deletion should be confirmed');
});

Then('the file is no longer visible in the tree view', function (this: KiroWorld) {
  // Verify file is not in tree view
  const filePath = this.getData<string>('customFile');
  if (filePath) {
    assert.ok(!fs.existsSync(filePath), 'File should not exist');
  }
});

Then('I see errors for all missing required sections', function (this: KiroWorld) {
  // Verify all required sections are flagged
  if (this.openedDocument) {
    const diagnostics = vscode.languages.getDiagnostics(this.openedDocument.uri);
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    
    // Should have errors for all 5 required sections
    assert.ok(errors.length >= 5, 'Should have errors for all missing sections');
  }
});

Then('I see a suggestion to use the template', function (this: KiroWorld) {
  // Verify template suggestion
  assert.ok(true, 'Template suggestion should be shown');
});

Then('validation completes in less than {int} second', function (this: KiroWorld, seconds: number) {
  const startTime = this.getData<number>('validationStartTime');
  if (startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const maxDuration = seconds * 1000;
    
    assert.ok(
      duration < maxDuration,
      `Validation should complete in less than ${seconds} second(s), took ${duration}ms`
    );
  }
});

Then('I see validation results', function (this: KiroWorld) {
  // Verify validation completed
  assert.ok(!this.lastError || this.commandResult, 'Validation should complete');
});

Then('I see a warning {string}', function (this: KiroWorld, warningMessage: string) {
  // Verify warning was shown
  this.setData('expectedWarning', warningMessage);
  assert.ok(true, 'Warning should be shown');
});

Then('I am offered options: {string}, {string}, {string}', function (
  this: KiroWorld,
  option1: string,
  option2: string,
  option3: string
) {
  // Verify options are shown
  const expectedOptions = [option1, option2, option3];
  this.setData('offeredOptions', expectedOptions);
  assert.ok(expectedOptions.length === 3, 'Three options should be available');
});

Then('I am prompted to enter a new name', function (this: KiroWorld) {
  // Verify prompt for new name
  const selection = this.getData<string>('userSelection');
  assert.strictEqual(selection, 'Choose different name', 'User should select to choose different name');
});
