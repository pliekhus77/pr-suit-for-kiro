import * as vscode from 'vscode';
import * as path from 'path';
import { FileSystemOperations } from '../utils/file-system';
import { SteeringItem } from '../models/steering';

/**
 * Create Custom Steering Command
 * Prompts for document name, validates format, creates template, and opens in editor
 */
export async function createCustomSteeringCommand(
  fileSystem: FileSystemOperations
): Promise<void> {
  try {
    // Prompt for document name
    const documentName = await vscode.window.showInputBox({
      prompt: 'Enter custom steering document name',
      placeHolder: 'my-custom-practice',
      validateInput: validateDocumentName
    });

    if (!documentName) {
      // User cancelled
      return;
    }

    // Create file name with custom- prefix
    const fileName = `custom-${documentName}.md`;
    const steeringPath = fileSystem.getSteeringPath();
    const filePath = path.join(steeringPath, fileName);

    // Check if file already exists
    const exists = await fileSystem.fileExists(filePath);
    if (exists) {
      const overwrite = await vscode.window.showWarningMessage(
        `File "${fileName}" already exists. Overwrite?`,
        { modal: true },
        'Overwrite',
        'Cancel'
      );

      if (overwrite !== 'Overwrite') {
        return;
      }
    }

    // Generate template content
    const template = generateCustomSteeringTemplate(documentName);

    // Write file
    await fileSystem.writeFile(filePath, template);

    // Open in editor
    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    // Show success message
    vscode.window.showInformationMessage(
      `Custom steering document created: ${fileName}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to create custom steering document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate document name is in kebab-case format
 */
function validateDocumentName(value: string): string | undefined {
  if (!value) {
    return 'Document name is required';
  }

  // Check for kebab-case format: lowercase letters, numbers, and hyphens only
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  
  if (!kebabCaseRegex.test(value)) {
    return 'Document name must be in kebab-case format (lowercase letters, numbers, and hyphens only)';
  }

  // Check for valid length
  if (value.length < 3) {
    return 'Document name must be at least 3 characters long';
  }

  if (value.length > 50) {
    return 'Document name must be 50 characters or less';
  }

  // Check doesn't start or end with hyphen
  if (value.startsWith('-') || value.endsWith('-')) {
    return 'Document name cannot start or end with a hyphen';
  }

  return undefined;
}

/**
 * Generate custom steering document template
 */
function generateCustomSteeringTemplate(documentName: string): string {
  // Convert kebab-case to Title Case for display
  const displayName = documentName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const currentDate = new Date().toISOString().split('T')[0];

  return `# ${displayName} Guide

**Created:** ${currentDate}  
**Status:** Draft

## Purpose

Define the purpose and scope of this custom steering document. Explain what problem it solves and when it should be applied.

**Key Questions:**
- What problem does this practice solve?
- When should this guidance be applied?
- Who is the target audience?

## Key Concepts

List and explain the core concepts that developers need to understand.

### Concept 1

Explain the first key concept with clear definitions and context.

### Concept 2

Explain the second key concept with clear definitions and context.

## Best Practices

Define the recommended practices and patterns to follow.

### Practice 1: [Name]

**Description:** Explain what this practice is and why it's important.

**When to Use:** Describe the scenarios where this practice applies.

**How to Implement:**
1. Step-by-step instructions
2. Code examples or configuration samples
3. Expected outcomes

**Example:**
\`\`\`
// Provide concrete code examples
\`\`\`

### Practice 2: [Name]

**Description:** Explain what this practice is and why it's important.

**When to Use:** Describe the scenarios where this practice applies.

**How to Implement:**
1. Step-by-step instructions
2. Code examples or configuration samples
3. Expected outcomes

## Anti-Patterns

Identify common mistakes and what to avoid.

### Anti-Pattern 1: [Name]

**Problem:** Describe the problematic approach.

**Why It's Bad:** Explain the negative consequences.

**Instead Do:** Provide the correct alternative approach.

**Example:**
\`\`\`
❌ Bad approach
// Show what NOT to do

✅ Good approach
// Show the correct way
\`\`\`

### Anti-Pattern 2: [Name]

**Problem:** Describe the problematic approach.

**Why It's Bad:** Explain the negative consequences.

**Instead Do:** Provide the correct alternative approach.

## Integration with Development Process

Explain how this guidance integrates with the development workflow.

### Requirements Phase

How this practice applies during requirements gathering.

### Design Phase

How this practice applies during design.

### Development Phase

How this practice applies during implementation.

### Testing Phase

How this practice applies during testing.

## Quality Standards

Define measurable quality criteria for this practice.

**Checklist:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Tools and Resources

List relevant tools, libraries, and reference materials.

**Tools:**
- Tool 1: Description and link
- Tool 2: Description and link

**References:**
- Reference 1: Link and description
- Reference 2: Link and description

## Summary

Provide a concise summary of the key takeaways.

**Core Principles:**
1. Principle 1
2. Principle 2
3. Principle 3

**Quick Reference:**
- Do: List of recommended actions
- Don't: List of things to avoid

**Golden Rule:** State the single most important principle in one sentence.
`;
}

/**
 * Rename Custom Steering Command
 * Renames a custom steering document
 */
export async function renameCustomSteeringCommand(
  fileSystem: FileSystemOperations,
  item?: SteeringItem
): Promise<void> {
  try {
    if (!item || !item.resourceUri) {
      vscode.window.showErrorMessage('No steering document selected');
      return;
    }

    // Verify it's a custom document
    if (!item.isCustom) {
      vscode.window.showErrorMessage('Only custom steering documents can be renamed');
      return;
    }

    const currentPath = item.resourceUri;
    const currentName = path.basename(currentPath, '.md');
    
    // Extract the name without 'custom-' prefix
    const currentDisplayName = currentName.replace(/^custom-/, '');

    // Prompt for new name
    const newName = await vscode.window.showInputBox({
      prompt: 'Enter new document name',
      value: currentDisplayName,
      validateInput: validateDocumentName
    });

    if (!newName) {
      // User cancelled
      return;
    }

    // If name hasn't changed, do nothing
    if (newName === currentDisplayName) {
      return;
    }

    // Create new file name with custom- prefix
    const newFileName = `custom-${newName}.md`;
    const steeringPath = fileSystem.getSteeringPath();
    const newPath = path.join(steeringPath, newFileName);

    // Check if new file already exists
    const exists = await fileSystem.fileExists(newPath);
    if (exists) {
      vscode.window.showErrorMessage(
        `File "${newFileName}" already exists. Choose a different name.`
      );
      return;
    }

    // Read current content
    const content = await fileSystem.readFile(currentPath);

    // Write to new location
    await fileSystem.writeFile(newPath, content);

    // Delete old file
    await fileSystem.deleteFile(currentPath);

    // Open renamed file in editor
    const uri = vscode.Uri.file(newPath);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    // Show success message
    vscode.window.showInformationMessage(
      `Renamed "${currentName}.md" to "${newFileName}"`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to rename steering document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Delete Custom Steering Command
 * Deletes a custom steering document with confirmation
 */
export async function deleteCustomSteeringCommand(
  fileSystem: FileSystemOperations,
  item?: SteeringItem
): Promise<void> {
  try {
    if (!item || !item.resourceUri) {
      vscode.window.showErrorMessage('No steering document selected');
      return;
    }

    // Verify it's a custom document
    if (!item.isCustom) {
      vscode.window.showErrorMessage('Only custom steering documents can be deleted');
      return;
    }

    const fileName = path.basename(item.resourceUri);

    // Confirm deletion
    const confirm = await vscode.window.showWarningMessage(
      `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
      { modal: true },
      'Delete',
      'Cancel'
    );

    if (confirm !== 'Delete') {
      return;
    }

    // Delete the file
    await fileSystem.deleteFile(item.resourceUri);

    // Show success message
    vscode.window.showInformationMessage(
      `Deleted "${fileName}"`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to delete steering document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Export Custom Steering to Library Command
 * Placeholder for future enhancement to export custom documents to the framework library
 */
export async function exportCustomSteeringCommand(
  item?: SteeringItem
): Promise<void> {
  if (!item || !item.resourceUri) {
    vscode.window.showErrorMessage('No steering document selected');
    return;
  }

  // Verify it's a custom document
  if (!item.isCustom) {
    vscode.window.showErrorMessage('Only custom steering documents can be exported');
    return;
  }

  vscode.window.showInformationMessage(
    'Export to Library feature will be available in a future release. ' +
    'This will allow you to share your custom steering documents with the community.'
  );
}

/**
 * Validate Steering Document Command
 * Validates the current steering document against quality standards
 */
export async function validateSteeringCommand(
  validator: import('../services/steering-validator').SteeringValidator,
  diagnosticCollection: vscode.DiagnosticCollection
): Promise<void> {
  try {
    // Get active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor. Open a steering document to validate.');
      return;
    }

    const document = editor.document;

    // Check if it's a markdown file in .kiro/steering/
    if (document.languageId !== 'markdown') {
      vscode.window.showWarningMessage('Active document is not a markdown file.');
      return;
    }

    const filePath = document.uri.fsPath;
    if (!filePath.includes('.kiro') || !filePath.includes('steering')) {
      vscode.window.showWarningMessage('Active document is not in .kiro/steering/ directory.');
      return;
    }

    // Run validation
    const result = await validator.validate(document);

    // Clear previous diagnostics for this document
    diagnosticCollection.delete(document.uri);

    // Convert validation issues to diagnostics
    const diagnostics: vscode.Diagnostic[] = [];
    
    // Add errors
    for (const issue of result.issues) {
      const diagnostic = new vscode.Diagnostic(
        issue.range,
        issue.message,
        issue.severity
      );
      diagnostic.code = issue.code;
      diagnostic.source = 'agentic-reviewer';
      diagnostics.push(diagnostic);
    }

    // Add warnings
    for (const warning of result.warnings) {
      const diagnostic = new vscode.Diagnostic(
        warning.range,
        warning.message,
        warning.severity
      );
      diagnostic.code = warning.code;
      diagnostic.source = 'agentic-reviewer';
      diagnostics.push(diagnostic);
    }

    // Set diagnostics
    diagnosticCollection.set(document.uri, diagnostics);

    // Show result message
    if (result.isValid && result.warnings.length === 0) {
      vscode.window.showInformationMessage(
        '✓ Steering document validation passed with no issues!'
      );
    } else if (result.isValid) {
      vscode.window.showInformationMessage(
        `✓ Steering document validation passed with ${result.warnings.length} warning(s). Check the Problems panel for details.`
      );
    } else {
      vscode.window.showWarningMessage(
        `✗ Steering document validation failed with ${result.issues.length} error(s) and ${result.warnings.length} warning(s). Check the Problems panel for details.`
      );
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to validate steering document: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
