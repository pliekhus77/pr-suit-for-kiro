import * as vscode from 'vscode';
import { FileSystemOperations } from '../utils/file-system';

/**
 * Hover Provider for Framework Terms
 * Shows tooltips with definitions for framework-specific terms
 */
export class FrameworkHoverProvider implements vscode.HoverProvider {
  private fileSystem: FileSystemOperations;
  private termDefinitions: Map<string, string>;

  constructor(fileSystem?: FileSystemOperations) {
    this.fileSystem = fileSystem || new FileSystemOperations();
    this.termDefinitions = this.initializeTermDefinitions();
  }

  /**
   * Initialize framework term definitions
   */
  private initializeTermDefinitions(): Map<string, string> {
    const definitions = new Map<string, string>();

    // TDD/BDD terms
    definitions.set('TDD', '**Test-Driven Development**: A software development approach where tests are written before the code. Follow the Red-Green-Refactor cycle.');
    definitions.set('BDD', '**Behavior-Driven Development**: An extension of TDD that focuses on the behavior of the application from the end user\'s perspective using Given-When-Then scenarios.');
    definitions.set('Red-Green-Refactor', '**Red-Green-Refactor**: The TDD cycle - write a failing test (Red), make it pass (Green), then improve the code (Refactor).');
    definitions.set('Given-When-Then', '**Given-When-Then**: BDD scenario format - Given (context), When (action), Then (expected outcome).');
    definitions.set('Gherkin', '**Gherkin**: A business-readable language for BDD scenarios using Given-When-Then syntax.');

    // C4 Model terms
    definitions.set('C4 Model', '**C4 Model**: A hierarchical set of software architecture diagrams - System Context, Container, Component, and Code.');
    definitions.set('System Context', '**System Context**: The highest level C4 diagram showing the system in scope and its relationships with users and external systems.');
    definitions.set('Container', '**Container**: A C4 diagram showing the high-level technology choices and how containers communicate (apps, databases, file systems).');
    definitions.set('Component', '**Component**: A C4 diagram showing the internal structure of a container with major components and their relationships.');

    // DDD terms
    definitions.set('Domain-Driven Design', '**Domain-Driven Design (DDD)**: An approach to software development that focuses on modeling the business domain.');
    definitions.set('Aggregate', '**Aggregate**: A cluster of domain objects that can be treated as a single unit with a root entity.');
    definitions.set('Entity', '**Entity**: A domain object with a unique identity that persists over time.');
    definitions.set('Value Object', '**Value Object**: An immutable domain object defined by its attributes rather than identity.');
    definitions.set('Bounded Context', '**Bounded Context**: A boundary within which a domain model is defined and applicable.');
    definitions.set('Ubiquitous Language', '**Ubiquitous Language**: A common language shared by developers and domain experts.');

    // Security terms
    definitions.set('SABSA', '**SABSA**: Sherwood Applied Business Security Architecture - A framework for developing risk-driven enterprise security architectures.');
    definitions.set('STRIDE', '**STRIDE**: A threat modeling framework - Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.');
    definitions.set('Zero Trust', '**Zero Trust**: A security model that assumes no implicit trust and verifies every access request.');
    definitions.set('Defense in Depth', '**Defense in Depth**: A layered security approach with multiple defensive mechanisms.');

    // DevOps terms
    definitions.set('CI/CD', '**Continuous Integration/Continuous Deployment**: Automated practices for building, testing, and deploying software.');
    definitions.set('DORA Metrics', '**DORA Metrics**: DevOps Research and Assessment metrics - Deployment Frequency, Lead Time, MTTR, Change Failure Rate.');
    definitions.set('Blue-Green Deployment', '**Blue-Green Deployment**: A deployment strategy with two identical environments for zero-downtime releases.');
    definitions.set('Canary Deployment', '**Canary Deployment**: Gradual rollout to a small subset of users before full deployment.');

    // Azure terms
    definitions.set('App Service', '**Azure App Service**: A fully managed platform for building, deploying, and scaling web apps.');
    definitions.set('Container Apps', '**Azure Container Apps**: A serverless container platform for running microservices and containerized applications.');
    definitions.set('AKS', '**Azure Kubernetes Service**: Managed Kubernetes container orchestration service.');
    definitions.set('Managed Identity', '**Managed Identity**: Azure AD identity for Azure resources to authenticate without storing credentials.');

    // IaC terms
    definitions.set('Pulumi', '**Pulumi**: Infrastructure as Code platform using general-purpose programming languages.');
    definitions.set('Infrastructure as Code', '**Infrastructure as Code (IaC)**: Managing infrastructure through code rather than manual processes.');
    definitions.set('Immutable Infrastructure', '**Immutable Infrastructure**: Infrastructure that is replaced rather than modified when changes are needed.');

    // SAFe terms
    definitions.set('SAFe', '**Scaled Agile Framework**: A framework for scaling agile practices across large enterprises.');
    definitions.set('WSJF', '**Weighted Shortest Job First**: A prioritization method based on Cost of Delay and job size.');
    definitions.set('PI Planning', '**Program Increment Planning**: A cadence-based event for aligning teams to a shared mission and vision.');
    definitions.set('Agile Release Train', '**Agile Release Train (ART)**: A long-lived team of agile teams that incrementally develops and delivers value.');

    return definitions;
  }

  /**
   * Provide hover information for a position in a document
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    // Only provide hover for steering documents
    if (!this.isSteeringDocument(document)) {
      return null;
    }

    // Get the word at the current position
    const wordRange = document.getWordRangeAtPosition(position, /[\w\s-]+/);
    if (!wordRange) {
      return null;
    }

    const word = document.getText(wordRange);
    
    // Check if we have a definition for this term
    const definition = this.findDefinition(word);
    if (!definition) {
      return null;
    }

    // Create hover with markdown content
    const markdown = new vscode.MarkdownString(definition);
    markdown.isTrusted = true;
    
    return new vscode.Hover(markdown, wordRange);
  }

  /**
   * Find definition for a term (case-insensitive, handles partial matches)
   */
  private findDefinition(term: string): string | null {
    const normalizedTerm = term.trim();
    
    // Try exact match first
    if (this.termDefinitions.has(normalizedTerm)) {
      return this.termDefinitions.get(normalizedTerm)!;
    }

    // Try case-insensitive match
    for (const [key, value] of this.termDefinitions.entries()) {
      if (key.toLowerCase() === normalizedTerm.toLowerCase()) {
        return value;
      }
    }

    // Try partial match (term contains the key)
    for (const [key, value] of this.termDefinitions.entries()) {
      if (normalizedTerm.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return null;
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
}
