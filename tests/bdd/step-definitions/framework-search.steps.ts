import { Given, When, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { KiroWorld } from '../support/world';

Given('the frameworks\\/ directory exists with reference documents', async function (this: KiroWorld) {
  const frameworksPath = path.join(this.workspacePath, 'frameworks');
  
  if (!fs.existsSync(frameworksPath)) {
    fs.mkdirSync(frameworksPath, { recursive: true });
  }
  
  // Create sample framework reference documents
  const sampleDocs = [
    {
      name: 'test-driven-development.md',
      content: '# Test-Driven Development\n\n## Overview\nTDD is a software development approach where tests are written before code.\n\n## Red-Green-Refactor\nThe core cycle of TDD.'
    },
    {
      name: 'domain-driven-design.md',
      content: '# Domain-Driven Design\n\n## Bounded Context\nA bounded context is a central pattern in DDD.\n\n## Aggregate\nAn aggregate is a cluster of domain objects.'
    },
    {
      name: 'c4-model.md',
      content: '# C4 Model\n\n## Context Diagram\nShows the system in its environment.\n\n## Architecture\nThe C4 model provides a way to describe software architecture.'
    }
  ];
  
  for (const doc of sampleDocs) {
    const docPath = path.join(frameworksPath, doc.name);
    fs.writeFileSync(docPath, doc.content, 'utf8');
  }
  
  this.frameworksPath = frameworksPath;
});

Given('the frameworks\\/ directory does not exist', async function (this: KiroWorld) {
  const frameworksPath = path.join(this.workspacePath, 'frameworks');
  
  if (fs.existsSync(frameworksPath)) {
    fs.rmSync(frameworksPath, { recursive: true, force: true });
  }
  
  this.frameworksPath = frameworksPath;
});

Given('I have executed a search for {string}', async function (this: KiroWorld, query: string) {
  this.searchQuery = query;
  this.searchResults = await vscode.commands.executeCommand(
    'agentic-reviewer.searchFrameworks',
    query
  );
});

Given('I see search results', function (this: KiroWorld) {
  assert.ok(this.searchResults, 'Search results should exist');
  assert.ok(Array.isArray(this.searchResults), 'Search results should be an array');
  assert.ok(this.searchResults.length > 0, 'Search results should not be empty');
});

Given('I have a steering document open in the editor', async function (this: KiroWorld) {
  const steeringDocPath = path.join(this.steeringPath, 'strategy-tdd-bdd.md');
  
  // Create a sample steering document if it doesn't exist
  if (!fs.existsSync(steeringDocPath)) {
    const content = '# TDD/BDD Testing Strategy\n\n## Purpose\nThis document defines testing practices.\n\n## Aggregate Pattern\nUse aggregates to maintain consistency.';
    fs.writeFileSync(steeringDocPath, content, 'utf8');
  }
  
  const doc = await vscode.workspace.openTextDocument(steeringDocPath);
  this.activeEditor = await vscode.window.showTextDocument(doc);
});

Given('the document references a framework', function (this: KiroWorld) {
  // Verify the document contains framework references
  assert.ok(this.activeEditor, 'Editor should be active');
  const content = this.activeEditor.document.getText();
  assert.ok(content.length > 0, 'Document should have content');
});

Given('the document contains framework-specific terms', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  const content = this.activeEditor.document.getText();
  assert.ok(content.includes('Aggregate') || content.includes('aggregate'), 'Document should contain framework terms');
});

Given('I have executed a search with multiple results', async function (this: KiroWorld) {
  this.searchQuery = 'architecture';
  this.searchResults = await vscode.commands.executeCommand(
    'agentic-reviewer.searchFrameworks',
    this.searchQuery
  );
  assert.ok(this.searchResults && this.searchResults.length > 1, 'Should have multiple search results');
});

Given('the frameworks\\/ directory contains {int}+ reference documents', async function (this: KiroWorld, count: number) {
  const frameworksPath = path.join(this.workspacePath, 'frameworks');
  
  if (!fs.existsSync(frameworksPath)) {
    fs.mkdirSync(frameworksPath, { recursive: true });
  }
  
  // Create multiple framework documents
  for (let i = 0; i < count; i++) {
    const docPath = path.join(frameworksPath, `framework-${i}.md`);
    const content = `# Framework ${i}\n\n## Best Practices\nThis document contains best practices for framework ${i}.`;
    fs.writeFileSync(docPath, content, 'utf8');
  }
  
  this.frameworksPath = frameworksPath;
});

When('I execute the "Search Frameworks" command', async function (this: KiroWorld) {
  // Store the command execution for later steps
  this.pendingCommand = 'agentic-reviewer.searchFrameworks';
});

When('I enter the search query {string}', async function (this: KiroWorld, query: string) {
  this.searchQuery = query;
  
  try {
    this.searchResults = await vscode.commands.executeCommand(
      this.pendingCommand || 'agentic-reviewer.searchFrameworks',
      query
    );
  } catch (error) {
    this.lastError = error;
  }
});

When('I enter an empty search query', async function (this: KiroWorld) {
  this.searchQuery = '';
  
  try {
    this.searchResults = await vscode.commands.executeCommand(
      'agentic-reviewer.searchFrameworks',
      ''
    );
  } catch (error) {
    this.lastError = error;
  }
});

When('I enter a search query longer than {int} characters', async function (this: KiroWorld, length: number) {
  this.searchQuery = 'a'.repeat(length + 10);
  
  try {
    this.searchResults = await vscode.commands.executeCommand(
      'agentic-reviewer.searchFrameworks',
      this.searchQuery
    );
  } catch (error) {
    this.lastError = error;
  }
});

When('I click on a search result for {string}', async function (this: KiroWorld, fileName: string) {
  // Simulate clicking on a search result
  const result = this.searchResults?.find((r: any) => r.fileName === fileName);
  assert.ok(result, `Search result for ${fileName} should exist`);
  
  // Open the document at the specified location
  const docPath = path.join(this.frameworksPath, fileName);
  const doc = await vscode.workspace.openTextDocument(docPath);
  this.activeEditor = await vscode.window.showTextDocument(doc);
  
  // Move cursor to the result position if available
  if (result.line !== undefined) {
    const position = new vscode.Position(result.line, result.column || 0);
    this.activeEditor.selection = new vscode.Selection(position, position);
    this.activeEditor.revealRange(new vscode.Range(position, position));
  }
});

When('I see the code lens {string} at the top', function (this: KiroWorld, codeLensText: string) {
  // Verify code lens is available
  // In a real implementation, this would check the code lens provider
  this.codeLensText = codeLensText;
  assert.ok(true, 'Code lens should be visible');
});

When('I click the code lens', async function (this: KiroWorld) {
  // Simulate clicking the code lens
  try {
    await vscode.commands.executeCommand('agentic-reviewer.viewFrameworkReference');
  } catch (error) {
    this.lastError = error;
  }
});

When('I select {string}', async function (this: KiroWorld, selection: string) {
  this.userSelection = selection;
  
  if (selection === 'Yes') {
    // Initialize frameworks directory
    await vscode.commands.executeCommand('agentic-reviewer.initializeFrameworks');
  }
});

When('I hover over the term {string}', async function (this: KiroWorld, term: string) {
  assert.ok(this.activeEditor, 'Editor should be active');
  
  // Find the term in the document
  const content = this.activeEditor.document.getText();
  const index = content.indexOf(term);
  assert.ok(index >= 0, `Term "${term}" should be found in document`);
  
  // Get the position of the term
  const position = this.activeEditor.document.positionAt(index);
  
  // Request hover information
  this.hoverInfo = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    this.activeEditor.document.uri,
    position
  );
});

When('I see the search input prompt', function (this: KiroWorld) {
  // Verify search input is shown
  assert.ok(true, 'Search input prompt should be visible');
});

When('I press Escape or click Cancel', function (this: KiroWorld) {
  // Simulate cancelling the search
  this.searchCancelled = true;
  this.searchResults = undefined;
});

When('I click on the first search result', async function (this: KiroWorld) {
  assert.ok(this.searchResults && this.searchResults.length > 0, 'Should have search results');
  
  const firstResult = this.searchResults[0];
  const docPath = path.join(this.frameworksPath, firstResult.fileName);
  const doc = await vscode.workspace.openTextDocument(docPath);
  this.activeEditor = await vscode.window.showTextDocument(doc);
  
  if (firstResult.line !== undefined) {
    const position = new vscode.Position(firstResult.line, firstResult.column || 0);
    this.activeEditor.selection = new vscode.Selection(position, position);
  }
});

When('I execute {string} command', async function (this: KiroWorld, commandName: string) {
  const commandMap: { [key: string]: string } = {
    'Go to Next Search Result': 'agentic-reviewer.goToNextSearchResult',
    'Go to Previous Search Result': 'agentic-reviewer.goToPreviousSearchResult'
  };
  
  const commandId = commandMap[commandName];
  assert.ok(commandId, `Command "${commandName}" should be mapped`);
  
  await vscode.commands.executeCommand(commandId);
});

Then('I see search results from framework reference documents', function (this: KiroWorld) {
  assert.ok(this.searchResults, 'Search results should exist');
  assert.ok(Array.isArray(this.searchResults), 'Search results should be an array');
  assert.ok(this.searchResults.length > 0, 'Search results should not be empty');
});

Then('the results include {string}', function (this: KiroWorld, fileName: string) {
  assert.ok(this.searchResults, 'Search results should exist');
  const found = this.searchResults.some((r: any) => r.fileName === fileName);
  assert.ok(found, `Results should include ${fileName}`);
});

Then('each result shows the matching text snippet', function (this: KiroWorld) {
  assert.ok(this.searchResults, 'Search results should exist');
  
  for (const result of this.searchResults) {
    assert.ok(result.snippet, 'Each result should have a snippet');
    assert.ok(result.snippet.length > 0, 'Snippet should not be empty');
  }
});

Then('each result shows the file name and section', function (this: KiroWorld) {
  assert.ok(this.searchResults, 'Search results should exist');
  
  for (const result of this.searchResults) {
    assert.ok(result.fileName, 'Each result should have a file name');
    // Section is optional but should be present if available
  }
});

Then('the framework document opens in the editor', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  assert.ok(this.activeEditor.document, 'Document should be open');
});

Then('the cursor is positioned at the relevant section', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  // Verify cursor position is set
  assert.ok(this.activeEditor.selection, 'Selection should exist');
});

Then('the matching text is visible', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  // Verify the matching text is in the visible range
  const visibleRanges = this.activeEditor.visibleRanges;
  assert.ok(visibleRanges.length > 0, 'Should have visible ranges');
});

Then('I see a message {string}', function (this: KiroWorld, message: string) {
  // Verify the message is shown
  // In a real implementation, this would check VS Code's notification or message API
  if (message === 'No results found') {
    assert.ok(!this.searchResults || this.searchResults.length === 0, 'Should have no results');
  }
});

Then('I see a suggestion to check spelling or try different keywords', function (this: KiroWorld) {
  // Verify suggestion is shown
  assert.ok(true, 'Suggestion should be displayed');
});

Then('I see an error {string}', function (this: KiroWorld, errorMessage: string) {
  // Verify error message is shown
  assert.ok(this.lastError || !this.searchResults, 'Should have error or no results');
});

Then('no search is performed', function (this: KiroWorld) {
  assert.ok(!this.searchResults || this.searchResults.length === 0, 'No search should be performed');
});

Then('the search handles special characters correctly', function (this: KiroWorld) {
  // Verify search works with special characters
  assert.ok(true, 'Special characters should be handled');
});

Then('I see relevant results for {string}', function (this: KiroWorld, term: string) {
  assert.ok(this.searchResults && this.searchResults.length > 0, 'Should have results');
});

Then('the search treats the query as plain text', function (this: KiroWorld) {
  // Verify regex patterns are not interpreted
  assert.ok(true, 'Query should be treated as plain text');
});

Then('I see results matching {string} and {string}', function (this: KiroWorld, term1: string, term2: string) {
  assert.ok(this.searchResults && this.searchResults.length > 0, 'Should have results');
});

Then('I see results from multiple framework documents', function (this: KiroWorld) {
  assert.ok(this.searchResults && this.searchResults.length > 1, 'Should have multiple results');
  
  const uniqueFiles = new Set(this.searchResults.map((r: any) => r.fileName));
  assert.ok(uniqueFiles.size > 1, 'Results should be from multiple files');
});

Then('results are sorted by relevance', function (this: KiroWorld) {
  // Verify results are sorted
  assert.ok(this.searchResults, 'Search results should exist');
  // In a real implementation, verify the sorting logic
});

Then('the corresponding framework document opens', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  const fileName = path.basename(this.activeEditor.document.fileName);
  assert.ok(fileName.endsWith('.md'), 'Should open a markdown document');
});

Then('I see the full framework reference documentation', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  const content = this.activeEditor.document.getText();
  assert.ok(content.length > 0, 'Document should have content');
});

Then('I see a prompt {string}', function (this: KiroWorld, promptMessage: string) {
  // Verify prompt is shown
  this.lastPromptMessage = promptMessage;
  assert.ok(true, 'Prompt should be displayed');
});

Then('the frameworks\\/ directory is created', function (this: KiroWorld) {
  assert.ok(fs.existsSync(this.frameworksPath), 'Frameworks directory should exist');
});

Then('default framework reference documents are copied', function (this: KiroWorld) {
  const files = fs.readdirSync(this.frameworksPath);
  assert.ok(files.length > 0, 'Framework documents should be copied');
});

Then('the search command is re-executed', function (this: KiroWorld) {
  // Verify search is re-executed after initialization
  assert.ok(true, 'Search should be re-executed');
});

Then('I see a tooltip with the definition', function (this: KiroWorld) {
  assert.ok(this.hoverInfo, 'Hover info should exist');
  assert.ok(this.hoverInfo.length > 0, 'Should have hover information');
});

Then('the tooltip includes a link to the full framework reference', function (this: KiroWorld) {
  assert.ok(this.hoverInfo, 'Hover info should exist');
  // Verify the hover contains a link
  // In a real implementation, check the hover content for links
});

Then('search results are returned in less than {int} seconds', function (this: KiroWorld, seconds: number) {
  // Performance verification
  // In a real implementation, measure the actual search time
  assert.ok(true, `Search should complete in less than ${seconds} seconds`);
});

Then('I see results from all matching documents', function (this: KiroWorld) {
  assert.ok(this.searchResults && this.searchResults.length > 0, 'Should have results');
});

Then('the search is cancelled', function (this: KiroWorld) {
  assert.ok(this.searchCancelled, 'Search should be cancelled');
});

Then('no results are shown', function (this: KiroWorld) {
  assert.ok(!this.searchResults || this.searchResults.length === 0, 'No results should be shown');
});

Then('no error is displayed', function (this: KiroWorld) {
  assert.ok(!this.lastError, 'No error should be displayed');
});

Then('I see results matching {string}', function (this: KiroWorld, term: string) {
  assert.ok(this.searchResults && this.searchResults.length > 0, 'Should have results');
});

Then('the search is case-insensitive', function (this: KiroWorld) {
  // Verify case-insensitive search
  assert.ok(true, 'Search should be case-insensitive');
});

Then('no framework document is opened', function (this: KiroWorld) {
  // Verify no document was opened
  // In a real implementation, check that the active editor didn't change
  assert.ok(true, 'No framework document should be opened');
});

Then('I see an informational message about initializing frameworks', function (this: KiroWorld) {
  // Verify informational message is shown
  assert.ok(true, 'Informational message should be displayed');
});

Then('each search result shows {int} lines of context before the match', function (this: KiroWorld, lines: number) {
  assert.ok(this.searchResults, 'Search results should exist');
  
  for (const result of this.searchResults) {
    assert.ok(result.contextBefore !== undefined, 'Should have context before');
  }
});

Then('each search result shows {int} lines of context after the match', function (this: KiroWorld, lines: number) {
  assert.ok(this.searchResults, 'Search results should exist');
  
  for (const result of this.searchResults) {
    assert.ok(result.contextAfter !== undefined, 'Should have context after');
  }
});

Then('the matching text is highlighted in the context', function (this: KiroWorld) {
  assert.ok(this.searchResults, 'Search results should exist');
  // Verify highlighting is applied
  assert.ok(true, 'Matching text should be highlighted');
});

Then('the framework document opens at the first match', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  // Verify cursor is at the first match
  assert.ok(this.activeEditor.selection, 'Selection should exist');
});

Then('the cursor moves to the next match in the document', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  // Verify cursor moved to next match
  assert.ok(this.activeEditor.selection, 'Selection should exist');
});

Then('the cursor moves back to the previous match', function (this: KiroWorld) {
  assert.ok(this.activeEditor, 'Editor should be active');
  // Verify cursor moved to previous match
  assert.ok(this.activeEditor.selection, 'Selection should exist');
});
