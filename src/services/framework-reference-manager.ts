import * as vscode from 'vscode';
import * as path from 'path';
import { FileSystemOperations } from '../utils/file-system';

/**
 * Framework Reference Manager
 * Handles framework reference documentation operations
 */
export class FrameworkReferenceManager {
  private fileSystem: FileSystemOperations;
  private extensionPath: string;

  constructor(context: vscode.ExtensionContext, fileSystem?: FileSystemOperations) {
    this.extensionPath = context.extensionPath;
    this.fileSystem = fileSystem || new FileSystemOperations();
  }

  /**
   * Get the path to bundled framework reference docs
   */
  private getBundledFrameworksPath(): string {
    return path.join(this.extensionPath, 'frameworks');
  }

  /**
   * Get the workspace frameworks directory path
   */
  private getWorkspaceFrameworksPath(): string {
    return this.fileSystem.getFrameworksPath();
  }

  /**
   * Check if frameworks directory exists in workspace
   */
  async frameworksDirectoryExists(): Promise<boolean> {
    try {
      const frameworksPath = this.getWorkspaceFrameworksPath();
      return await this.fileSystem.directoryExists(frameworksPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize frameworks directory with bundled reference docs
   */
  async initializeFrameworksDirectory(): Promise<void> {
    const workspacePath = this.fileSystem.getWorkspacePath();
    if (!workspacePath) {
      throw new Error('No workspace folder open');
    }

    const frameworksPath = this.getWorkspaceFrameworksPath();
    const bundledPath = this.getBundledFrameworksPath();

    // Create frameworks directory
    await this.fileSystem.ensureDirectory(frameworksPath);

    // Copy all framework reference files from bundled resources
    const files = await this.fileSystem.listFiles(bundledPath, '*.md');
    
    let copiedCount = 0;
    for (const file of files) {
      const fileName = path.basename(file);
      const sourcePath = path.join(bundledPath, fileName);
      const destPath = path.join(frameworksPath, fileName);

      // Only copy if file doesn't exist (don't overwrite user modifications)
      const exists = await this.fileSystem.fileExists(destPath);
      if (!exists) {
        await this.fileSystem.copyFile(sourcePath, destPath);
        copiedCount++;
      }
    }

    vscode.window.showInformationMessage(
      `Initialized frameworks directory with ${copiedCount} reference document${copiedCount === 1 ? '' : 's'}`
    );
  }

  /**
   * Open framework reference document
   */
  async openFrameworkReference(referenceFileName: string): Promise<void> {
    // Check if frameworks directory exists
    const exists = await this.frameworksDirectoryExists();
    
    if (!exists) {
      // Offer to initialize frameworks directory
      const choice = await vscode.window.showInformationMessage(
        'Framework reference documentation not found. Would you like to initialize the frameworks directory?',
        'Initialize',
        'Cancel'
      );

      if (choice === 'Initialize') {
        await this.initializeFrameworksDirectory();
      } else {
        return;
      }
    }

    // Open the framework reference file
    const frameworksPath = this.getWorkspaceFrameworksPath();
    const filePath = path.join(frameworksPath, referenceFileName);

    const fileExists = await this.fileSystem.fileExists(filePath);
    if (!fileExists) {
      vscode.window.showErrorMessage(
        `Framework reference not found: ${referenceFileName}`
      );
      return;
    }

    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, { preview: false });
  }

  /**
   * Search across all framework reference documents
   */
  async searchFrameworkReferences(query: string): Promise<SearchResult[]> {
    const exists = await this.frameworksDirectoryExists();
    if (!exists) {
      return [];
    }

    const frameworksPath = this.getWorkspaceFrameworksPath();
    const files = await this.fileSystem.listFiles(frameworksPath, '*.md');
    
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const file of files) {
      const fileName = path.basename(file);
      const filePath = path.join(frameworksPath, fileName);
      
      try {
        const content = await this.fileSystem.readFile(filePath);
        const lines = content.split('\n');

        // Search for query in each line
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.toLowerCase().includes(lowerQuery)) {
            // Get context (line before and after)
            const contextStart = Math.max(0, i - 1);
            const contextEnd = Math.min(lines.length - 1, i + 1);
            const context = lines.slice(contextStart, contextEnd + 1).join('\n');

            results.push({
              fileName,
              filePath,
              lineNumber: i + 1,
              line: line.trim(),
              context,
              matchedText: this.extractMatchedText(line, query)
            });
          }
        }
      } catch (error) {
        console.error(`Error searching file ${fileName}:`, error);
      }
    }

    return results;
  }

  /**
   * Extract the matched text with surrounding context
   */
  private extractMatchedText(line: string, query: string): string {
    const lowerLine = line.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerLine.indexOf(lowerQuery);
    
    if (index === -1) {
      return line.substring(0, 100);
    }

    // Get 50 characters before and after the match
    const start = Math.max(0, index - 50);
    const end = Math.min(line.length, index + query.length + 50);
    
    let result = line.substring(start, end);
    if (start > 0) {
      result = '...' + result;
    }
    if (end < line.length) {
      result = result + '...';
    }
    
    return result;
  }

  /**
   * Get framework reference file path for a steering document
   */
  getFrameworkReferenceForSteering(steeringFileName: string): string | null {
    const referenceMap: Record<string, string> = {
      'strategy-tdd-bdd.md': 'test-driven-development.md',
      'strategy-security.md': 'sabsa-framework.md',
      'strategy-c4-model.md': 'c4-model.md',
      'strategy-azure.md': 'azure-well-architected.md',
      'strategy-devops.md': 'devops-frameworks.md',
      'strategy-iac.md': 'pulumi.md',
      'strategy-4d-safe.md': '4d-sdlc.md',
      'strategy-ea.md': 'domain-driven-design.md',
      'tech.md': 'net-best-practices.md',
      'product.md': '4d-sdlc.md',
      'structure.md': 'net-best-practices.md'
    };

    return referenceMap[steeringFileName] || null;
  }
}

/**
 * Search result interface
 */
export interface SearchResult {
  fileName: string;
  filePath: string;
  lineNumber: number;
  line: string;
  context: string;
  matchedText: string;
}
