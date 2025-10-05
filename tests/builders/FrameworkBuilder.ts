import { Framework, FrameworkCategory } from '../../src/models/framework';

/**
 * Builder for creating test Framework objects with fluent API
 */
export class FrameworkBuilder {
  private framework: Framework;

  constructor() {
    // Default framework with sensible test values
    this.framework = {
      id: 'test-framework',
      name: 'Test Framework',
      description: 'A test framework for unit testing',
      category: FrameworkCategory.Testing,
      version: '1.0.0',
      fileName: 'test-framework.md',
      dependencies: []
    };
  }

  /**
   * Set the framework ID
   */
  withId(id: string): FrameworkBuilder {
    this.framework.id = id;
    return this;
  }

  /**
   * Set the framework name
   */
  withName(name: string): FrameworkBuilder {
    this.framework.name = name;
    return this;
  }

  /**
   * Set the framework description
   */
  withDescription(description: string): FrameworkBuilder {
    this.framework.description = description;
    return this;
  }

  /**
   * Set the framework category
   */
  withCategory(category: FrameworkCategory): FrameworkBuilder {
    this.framework.category = category;
    return this;
  }

  /**
   * Set the framework version
   */
  withVersion(version: string): FrameworkBuilder {
    this.framework.version = version;
    return this;
  }

  /**
   * Set the framework file name
   */
  withFileName(fileName: string): FrameworkBuilder {
    this.framework.fileName = fileName;
    return this;
  }

  /**
   * Set the framework dependencies
   */
  withDependencies(dependencies: string[]): FrameworkBuilder {
    this.framework.dependencies = dependencies;
    return this;
  }

  /**
   * Add a single dependency
   */
  addDependency(dependency: string): FrameworkBuilder {
    if (!this.framework.dependencies) {
      this.framework.dependencies = [];
    }
    this.framework.dependencies.push(dependency);
    return this;
  }

  /**
   * Remove all dependencies
   */
  withoutDependencies(): FrameworkBuilder {
    this.framework.dependencies = undefined;
    return this;
  }

  /**
   * Create a TDD/BDD testing framework
   */
  asTddBddFramework(): FrameworkBuilder {
    this.framework.id = 'tdd-bdd-strategy';
    this.framework.name = 'TDD/BDD Testing Strategy';
    this.framework.description = 'Test-driven and behavior-driven development practices';
    this.framework.category = FrameworkCategory.Testing;
    this.framework.fileName = 'strategy-tdd-bdd.md';
    return this;
  }

  /**
   * Create a security framework
   */
  asSecurityFramework(): FrameworkBuilder {
    this.framework.id = 'security-strategy';
    this.framework.name = 'SABSA Security Strategy';
    this.framework.description = 'Security architecture and threat modeling practices';
    this.framework.category = FrameworkCategory.Security;
    this.framework.fileName = 'strategy-security.md';
    return this;
  }

  /**
   * Create a C4 model framework
   */
  asC4ModelFramework(): FrameworkBuilder {
    this.framework.id = 'c4-model-strategy';
    this.framework.name = 'C4 Model Architecture';
    this.framework.description = 'When and how to use C4 diagrams in specs';
    this.framework.category = FrameworkCategory.Architecture;
    this.framework.fileName = 'strategy-c4-model.md';
    return this;
  }

  /**
   * Create an Azure framework
   */
  asAzureFramework(): FrameworkBuilder {
    this.framework.id = 'azure-strategy';
    this.framework.name = 'Azure Hosting Strategy';
    this.framework.description = 'Azure service selection and hosting patterns';
    this.framework.category = FrameworkCategory.Cloud;
    this.framework.fileName = 'strategy-azure.md';
    return this;
  }

  /**
   * Create a DevOps framework
   */
  asDevOpsFramework(): FrameworkBuilder {
    this.framework.id = 'devops-strategy';
    this.framework.name = 'DevOps CI/CD Strategy';
    this.framework.description = 'Continuous integration and deployment practices';
    this.framework.category = FrameworkCategory.DevOps;
    this.framework.fileName = 'strategy-devops.md';
    return this;
  }

  /**
   * Build and return the framework object
   */
  build(): Framework {
    return { ...this.framework };
  }

  /**
   * Create a new builder instance (static factory method)
   */
  static create(): FrameworkBuilder {
    return new FrameworkBuilder();
  }
}
