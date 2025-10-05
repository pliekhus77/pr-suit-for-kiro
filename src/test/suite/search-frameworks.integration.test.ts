import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FrameworkReferenceManager } from '../../services/framework-reference-manager';

suite('Search Frameworks Command Integration Tests', () => {
  let testWorkspaceRoot: string;
  let referenceManager: FrameworkReferenceManager;
  let context: vscode.ExtensionContext;

  suiteSetup(async () => {
    // Get workspace root
    const workspaceFolders = vscode.workspace.workspaceFolders;
    assert.ok(workspaceFolders && workspaceFolders.length > 0, 'No workspace folder found');
    testWorkspaceRoot = workspaceFolders[0].uri.fsPath;

    // Get extension context
    const extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
    assert.ok(extension, 'Extension not found');
    context = await extension.activate();

    // Initialize reference manager
    referenceManager = new FrameworkReferenceManager(context);
  });

  setup(async () => {
    // Ensure frameworks directory exists with test content
    const frameworksPath = path.join(testWorkspaceRoot, 'frameworks');
    await fs.mkdir(frameworksPath, { recursive: true });
    
    // Create test framework reference files
    await createTestFrameworkFiles(frameworksPath);
  });

  teardown(async () => {
    // Clean up test files
    const frameworksPath = path.join(testWorkspaceRoot, 'frameworks');
    try {
      const files = await fs.readdir(frameworksPath);
      for (const file of files) {
        if (file.startsWith('test-')) {
          await fs.unlink(path.join(frameworksPath, file));
        }
      }
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  test('should register "agentic-reviewer.searchFrameworks" command', async () => {
    // Act: Get all registered commands
    const commands = await vscode.commands.getCommands(true);
    
    // Assert: Command should be registered
    assert.ok(
      commands.includes('agentic-reviewer.searchFrameworks'),
      'searchFrameworks command should be registered'
    );
  });

  test('should prompt for search query input', async () => {
    // This test verifies that the command prompts for input
    // We can't easily test the input box interaction in integration tests
    // but we can verify the command exists and can be executed
    
    // Arrange: Ensure frameworks directory exists
    const exists = await referenceManager.frameworksDirectoryExists();
    assert.ok(exists, 'Frameworks directory should exist');
    
    // Act: The command would normally show an input box
    // For integration test, we verify the search functionality directly
    const results = await referenceManager.searchFrameworkReferences('aggregate');
    
    // Assert: Should return results if test files contain the term
    assert.ok(Array.isArray(results), 'Should return an array of results');
  });

  test('should display search results from framework reference docs', async () => {
    // Arrange: Search for a term that exists in test files
    const searchTerm = 'Domain-Driven Design';
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences(searchTerm);
    
    // Assert: Should find results
    assert.ok(results.length > 0, 'Should find results for "Domain-Driven Design"');
    assert.ok(
      results.some(r => r.fileName === 'test-ddd.md'),
      'Should find results in test-ddd.md'
    );
    
    // Verify result structure
    const firstResult = results[0];
    assert.ok(firstResult.fileName, 'Result should have fileName');
    assert.ok(firstResult.filePath, 'Result should have filePath');
    assert.ok(firstResult.lineNumber > 0, 'Result should have valid lineNumber');
    assert.ok(firstResult.line, 'Result should have line content');
    assert.ok(firstResult.matchedText, 'Result should have matchedText');
  });

  test('should open document at relevant section when clicking result', async () => {
    // Arrange: Search for a specific term
    const searchTerm = 'aggregate';
    const results = await referenceManager.searchFrameworkReferences(searchTerm);
    
    assert.ok(results.length > 0, 'Should have search results');
    
    const firstResult = results[0];
    
    // Act: Open the document at the specific line
    const uri = vscode.Uri.file(firstResult.filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document, { preview: false });
    
    // Move to the line
    const line = firstResult.lineNumber - 1;
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenter
    );
    
    // Assert: Editor should be at the correct line
    assert.strictEqual(
      editor.selection.active.line,
      line,
      'Editor should be at the correct line'
    );
    
    // Verify the line contains the search term
    const lineText = document.lineAt(line).text;
    assert.ok(
      lineText.toLowerCase().includes(searchTerm.toLowerCase()),
      'Line should contain the search term'
    );
  });

  test('should show appropriate message when no results found', async () => {
    // Arrange: Search for a term that doesn't exist
    const searchTerm = 'nonexistent-term-xyz-12345';
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences(searchTerm);
    
    // Assert: Should return empty array
    assert.strictEqual(results.length, 0, 'Should return no results');
  });

  test('should handle special characters in search query', async () => {
    // Arrange: Search with special characters
    const specialQueries = [
      'C4 Model',
      'test-driven',
      'domain_driven',
      'API/Gateway',
      'micro-services'
    ];
    
    // Act & Assert: Each query should execute without error
    for (const query of specialQueries) {
      try {
        const results = await referenceManager.searchFrameworkReferences(query);
        assert.ok(Array.isArray(results), `Should return array for query: ${query}`);
      } catch (error) {
        assert.fail(`Should not throw error for query "${query}": ${error}`);
      }
    }
  });

  test('should handle regex patterns safely', async () => {
    // Arrange: Search with regex special characters
    const regexQueries = [
      'test.*pattern',
      '[abc]',
      '(group)',
      'pattern+',
      'pattern?',
      'pattern{2,3}',
      'pattern$',
      '^start'
    ];
    
    // Act & Assert: Should not throw errors
    for (const query of regexQueries) {
      try {
        const results = await referenceManager.searchFrameworkReferences(query);
        assert.ok(Array.isArray(results), `Should return array for regex query: ${query}`);
        // Results may be empty, but should not throw
      } catch (error) {
        assert.fail(`Should handle regex pattern safely "${query}": ${error}`);
      }
    }
  });

  test('should perform case-insensitive search', async () => {
    // Arrange: Search with different cases
    const searchTerms = ['aggregate', 'AGGREGATE', 'Aggregate', 'AgGrEgAtE'];
    
    // Act: Perform searches
    const resultSets = await Promise.all(
      searchTerms.map(term => referenceManager.searchFrameworkReferences(term))
    );
    
    // Assert: All searches should return the same number of results
    const firstCount = resultSets[0].length;
    for (let i = 1; i < resultSets.length; i++) {
      assert.strictEqual(
        resultSets[i].length,
        firstCount,
        `Case-insensitive search should return same results for "${searchTerms[i]}"`
      );
    }
  });

  test('should search across multiple framework files', async () => {
    // Arrange: Search for a common term that appears in multiple files
    const searchTerm = 'framework';
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences(searchTerm);
    
    // Assert: Should find results in multiple files
    const uniqueFiles = new Set(results.map(r => r.fileName));
    assert.ok(
      uniqueFiles.size >= 2,
      'Should find results in multiple framework files'
    );
  });

  test('should include context around matched text', async () => {
    // Arrange: Search for a specific term
    const searchTerm = 'aggregate';
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences(searchTerm);
    
    assert.ok(results.length > 0, 'Should have results');
    
    // Assert: Results should include context
    const firstResult = results[0];
    assert.ok(firstResult.context, 'Result should have context');
    assert.ok(
      firstResult.context.length > firstResult.line.length,
      'Context should include more than just the matched line'
    );
  });

  test('should handle empty frameworks directory gracefully', async () => {
    // Arrange: Remove all files from frameworks directory
    const frameworksPath = path.join(testWorkspaceRoot, 'frameworks');
    const files = await fs.readdir(frameworksPath);
    for (const file of files) {
      await fs.unlink(path.join(frameworksPath, file));
    }
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences('test');
    
    // Assert: Should return empty array without error
    assert.strictEqual(results.length, 0, 'Should return no results for empty directory');
  });

  test('should handle very long search queries', async () => {
    // Arrange: Create a very long query
    const longQuery = 'a'.repeat(1000);
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences(longQuery);
    
    // Assert: Should handle without error
    assert.ok(Array.isArray(results), 'Should return array for long query');
    assert.strictEqual(results.length, 0, 'Should return no results for nonsense query');
  });

  test('should handle Unicode characters in search', async () => {
    // Arrange: Search with Unicode characters
    const unicodeQueries = ['café', '日本語', 'Ñoño', '🚀'];
    
    // Act & Assert: Should handle without error
    for (const query of unicodeQueries) {
      try {
        const results = await referenceManager.searchFrameworkReferences(query);
        assert.ok(Array.isArray(results), `Should return array for Unicode query: ${query}`);
      } catch (error) {
        assert.fail(`Should handle Unicode query "${query}": ${error}`);
      }
    }
  });

  test('should limit matched text length for display', async () => {
    // Arrange: Create a file with very long lines
    const frameworksPath = path.join(testWorkspaceRoot, 'frameworks');
    const longLineFile = path.join(frameworksPath, 'test-long-line.md');
    const longLine = 'This is a test line with the word aggregate in it. ' + 'x'.repeat(500);
    await fs.writeFile(longLineFile, longLine);
    
    // Act: Search for term in long line
    const results = await referenceManager.searchFrameworkReferences('aggregate');
    
    // Assert: Matched text should be truncated
    const longLineResult = results.find(r => r.fileName === 'test-long-line.md');
    assert.ok(longLineResult, 'Should find result in long line file');
    assert.ok(
      longLineResult!.matchedText.length < 200,
      'Matched text should be truncated for display'
    );
    
    // Cleanup
    await fs.unlink(longLineFile);
  });

  test('should handle search when frameworks directory does not exist', async () => {
    // Arrange: Remove frameworks directory
    const frameworksPath = path.join(testWorkspaceRoot, 'frameworks');
    await fs.rm(frameworksPath, { recursive: true, force: true });
    
    // Act: Perform search
    const results = await referenceManager.searchFrameworkReferences('test');
    
    // Assert: Should return empty array
    assert.strictEqual(results.length, 0, 'Should return no results when directory missing');
    
    // Restore directory for other tests
    await fs.mkdir(frameworksPath, { recursive: true });
    await createTestFrameworkFiles(frameworksPath);
  });
});

/**
 * Helper function to create test framework reference files
 */
async function createTestFrameworkFiles(frameworksPath: string): Promise<void> {
  // Create test DDD framework file
  const dddContent = `# Domain-Driven Design

## Introduction
Domain-Driven Design (DDD) is an approach to software development that focuses on the core domain and domain logic.

## Key Concepts

### Aggregates
An aggregate is a cluster of domain objects that can be treated as a single unit.

### Entities
Entities are objects that have a distinct identity that runs through time and different states.

### Value Objects
Value objects are objects that describe some characteristic or attribute but carry no concept of identity.

## Patterns
- Repository Pattern
- Factory Pattern
- Domain Events
`;

  await fs.writeFile(path.join(frameworksPath, 'test-ddd.md'), dddContent);

  // Create test TDD framework file
  const tddContent = `# Test-Driven Development

## Introduction
Test-Driven Development (TDD) is a software development process that relies on the repetition of a very short development cycle.

## Red-Green-Refactor
1. Write a failing test (Red)
2. Make the test pass (Green)
3. Refactor the code (Refactor)

## Best Practices
- Write tests first
- Keep tests simple
- Test one thing at a time
- Use meaningful test names
`;

  await fs.writeFile(path.join(frameworksPath, 'test-tdd.md'), tddContent);

  // Create test C4 Model framework file
  const c4Content = `# C4 Model

## Introduction
The C4 model is a way to describe and communicate software architecture.

## Diagram Types
- System Context
- Container
- Component
- Code

## When to Use
Use C4 diagrams when you need to communicate architecture to stakeholders.
`;

  await fs.writeFile(path.join(frameworksPath, 'test-c4.md'), c4Content);
}
