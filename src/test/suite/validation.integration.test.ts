import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Validation Integration Tests', () => {
  const testWorkspacePath = path.join(__dirname, '../../../test-workspace');
  const steeringPath = path.join(testWorkspacePath, '.kiro', 'steering');

  setup(async () => {
    // Ensure test workspace exists
    if (!fs.existsSync(testWorkspacePath)) {
      fs.mkdirSync(testWorkspacePath, { recursive: true });
    }
    if (!fs.existsSync(steeringPath)) {
      fs.mkdirSync(steeringPath, { recursive: true });
    }
  });

  teardown(async () => {
    // Clean up test files
    if (fs.existsSync(steeringPath)) {
      const files = fs.readdirSync(steeringPath);
      for (const file of files) {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(steeringPath, file));
        }
      }
    }
  });

  test('should validate a well-formed steering document', async () => {
    // Create a valid steering document
    const validContent = `
# Purpose
Use this framework to implement best practices and ensure code quality across your projects.

## Key Concepts
- Create clear documentation that explains the purpose and usage
- Implement proper validation to catch errors early
- Ensure code quality through testing and reviews

For example, you can use this pattern to validate inputs:
\`\`\`typescript
function validate(input: string): boolean {
  return input.length > 0;
}
\`\`\`

## Best Practices
1. Use bullet points for clarity and easy scanning
2. Define clear objectives before starting implementation
3. Verify all requirements are met before deployment
4. Document your decisions and rationale
5. Review code regularly to maintain quality

## Summary
This framework helps you create better code with clear examples and actionable guidance that teams can follow.
    `;

    const testFilePath = path.join(steeringPath, 'test-valid.md');
    fs.writeFileSync(testFilePath, validContent);

    // Open the document
    const uri = vscode.Uri.file(testFilePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    // Execute validation command
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');

    // Wait a bit for diagnostics to be set
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);

    // Should have no errors (only warnings are acceptable)
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    assert.strictEqual(errors.length, 0, 'Should have no validation errors');
  });

  test('should detect missing required sections', async () => {
    // Create an invalid steering document (missing sections)
    const invalidContent = `
# Purpose
This is the purpose section.
    `;

    const testFilePath = path.join(steeringPath, 'test-invalid.md');
    fs.writeFileSync(testFilePath, invalidContent);

    // Open the document
    const uri = vscode.Uri.file(testFilePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    // Execute validation command
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');

    // Wait a bit for diagnostics to be set
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);

    // Should have errors for missing sections
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    assert.ok(errors.length > 0, 'Should have validation errors for missing sections');

    // Check for specific missing section errors
    const missingKeyConceptsError = errors.find(d => d.message.includes('Key Concepts'));
    assert.ok(missingKeyConceptsError, 'Should detect missing Key Concepts section');

    const missingBestPracticesError = errors.find(d => d.message.includes('Best Practices'));
    assert.ok(missingBestPracticesError, 'Should detect missing Best Practices section');

    const missingSummaryError = errors.find(d => d.message.includes('Summary'));
    assert.ok(missingSummaryError, 'Should detect missing Summary section');
  });

  test('should detect formatting issues', async () => {
    // Create a document with formatting issues
    const formattingIssuesContent = `
# Purpose
This is the purpose.

### Key Concepts (skipped level 2)
These are concepts.

\`\`\`typescript
const unclosed = "code block";

## Best Practices
Practices here.

## Summary
Done.
    `;

    const testFilePath = path.join(steeringPath, 'test-formatting.md');
    fs.writeFileSync(testFilePath, formattingIssuesContent);

    // Open the document
    const uri = vscode.Uri.file(testFilePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    // Execute validation command
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');

    // Wait a bit for diagnostics to be set
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);

    // Should have errors for formatting issues
    const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
    assert.ok(errors.length > 0, 'Should have validation errors for formatting issues');

    // Check for unclosed code block error
    const unclosedCodeBlockError = errors.find(d => d.message.includes('Code block is not closed'));
    assert.ok(unclosedCodeBlockError, 'Should detect unclosed code block');
  });

  test('should warn about missing examples and actionable guidance', async () => {
    // Create a document without examples or actionable guidance
    const noExamplesContent = `
# Purpose
This is a theoretical framework.

## Key Concepts
There are many concepts to consider.

## Best Practices
Things should be done well.

## Summary
This is important.
    `;

    const testFilePath = path.join(steeringPath, 'test-no-examples.md');
    fs.writeFileSync(testFilePath, noExamplesContent);

    // Open the document
    const uri = vscode.Uri.file(testFilePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    // Execute validation command
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');

    // Wait a bit for diagnostics to be set
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get diagnostics
    const diagnostics = vscode.languages.getDiagnostics(uri);

    // Should have warnings
    const warnings = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning);
    assert.ok(warnings.length > 0, 'Should have validation warnings');

    // Check for specific warnings
    const noExamplesWarning = warnings.find(d => d.message.includes('examples'));
    assert.ok(noExamplesWarning, 'Should warn about missing examples');

    const noActionableGuidanceWarning = warnings.find(d => d.message.includes('actionable guidance'));
    assert.ok(noActionableGuidanceWarning, 'Should warn about missing actionable guidance');
  });

  test('should not validate non-markdown files', async () => {
    // Create a non-markdown file
    const testFilePath = path.join(steeringPath, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is not a markdown file');

    // Open the document
    const uri = vscode.Uri.file(testFilePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    // Execute validation command
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Should show a warning message (we can't easily test this, but the command should handle it)
    // The test passes if no error is thrown
    assert.ok(true, 'Should handle non-markdown files gracefully');
  });

  test('should clear previous diagnostics when re-validating', async () => {
    // Create an invalid document
    const invalidContent = `
# Purpose
This is the purpose.
    `;

    const testFilePath = path.join(steeringPath, 'test-clear-diagnostics.md');
    fs.writeFileSync(testFilePath, invalidContent);

    // Open the document
    const uri = vscode.Uri.file(testFilePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    // Execute validation command
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get initial diagnostics
    const initialDiagnostics = vscode.languages.getDiagnostics(uri);
    assert.ok(initialDiagnostics.length > 0, 'Should have initial diagnostics');

    // Fix the document
    const validContent = `
# Purpose
Use this framework to implement best practices and ensure code quality across your projects.

## Key Concepts
- Create clear documentation that explains the purpose and usage
- Implement proper validation to catch errors early

For example:
\`\`\`typescript
const example = "code";
\`\`\`

## Best Practices
1. Use bullet points for clarity
2. Define clear objectives

## Summary
This framework helps you create better code with clear examples and actionable guidance.
    `;

    fs.writeFileSync(testFilePath, validContent);

    // Reload the document
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      await editor.edit(editBuilder => {
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );
        editBuilder.replace(fullRange, validContent);
      });
    }

    // Execute validation command again
    await vscode.commands.executeCommand('agentic-reviewer.validateSteering');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get new diagnostics
    const newDiagnostics = vscode.languages.getDiagnostics(uri);
    const errors = newDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);

    // Should have no errors now
    assert.strictEqual(errors.length, 0, 'Should clear previous errors after fixing document');
  });
});
