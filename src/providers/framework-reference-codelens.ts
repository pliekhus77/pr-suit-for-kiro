import * as vscode from 'vscode';
import * as path from 'path';
import { FileSystemOperations } from '../utils/file-system';

/**
 * Code Lens Provider for Framework References
 * Shows "View Framework Reference" at the top of steering documents
 */
export class FrameworkReferenceCodeLensProvider implements vscode.CodeLensProvider {
  private fileSystem: FileSystemOperations;

  constructor(fileSystem?: FileSystemOperations) {
    this.fileSystem = fileSystem || new FileSystemOperations();
  }

  /**
   * Provide code lenses for a document
   */
  provideCodeLenses(
    document: vscode.TextDocument,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    // Only provide code lens for steering documents in .kiro/steering/
    if (!this.isSteeringDocument(document)) {
      return [];
    }

    // Get framework reference file name from steering document
    const referenceFileName = this.getFrameworkReferenceFileName(document);
    if (!referenceFileName) {
      return [];
    }

    // Create code lens at the top of the document (line 0)
    const topOfDocument = new vscode.Range(0, 0, 0, 0);
    const codeLens = new vscode.CodeLens(topOfDocument, {
      title: '📖 View Framework Reference',
      command: 'agentic-reviewer.viewFrameworkReference',
      arguments: [referenceFileName]
    });

    return [codeLens];
  }

  /**
   * Check if document is a steering document
   */
  private isSteeringDocument(document: vscode.TextDocument): boolean {
    try {
      const steeringPath = this.fileSystem.getSteeringPath();
      const documentPath = document.uri.fsPath;
      return documentPath.startsWith(steeringPath) && documentPath.endsWith('.md');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get framework reference file name from steering document
   * Maps steering document names to framework reference files
   */
  private getFrameworkReferenceFileName(document: vscode.TextDocument): string | null {
    const fileName = path.basename(document.uri.fsPath);

    // Mapping of steering documents to framework reference files
    const referenceMap: Record<string, string> = {
      'strategy-tdd-bdd.md': 'test-driven-development.md',
      'strategy-security.md': 'sabsa-framework.md',
      'strategy-c4-model.md': 'c4-model.md',
      'strategy-azure.md': 'azure-well-architected.md',
      'strategy-devops.md': 'devops-frameworks.md',
      'strategy-iac.md': 'pulumi.md',
      'strategy-4d-safe.md': '4d-sdlc.md',
      'strategy-ea.md': 'domain-driven-design.md', // EA uses DDD concepts
      'tech.md': 'net-best-practices.md',
      'product.md': '4d-sdlc.md',
      'structure.md': 'net-best-practices.md'
    };

    return referenceMap[fileName] || null;
  }
}
