import { InstalledFrameworksMetadata, InstalledFramework } from '../../src/models/framework';

/**
 * Builder for creating test InstalledFrameworksMetadata objects with fluent API
 */
export class MetadataBuilder {
  private metadata: InstalledFrameworksMetadata;

  constructor() {
    // Default metadata with sensible test values
    this.metadata = {
      frameworks: []
    };
  }

  /**
   * Set the frameworks array
   */
  withFrameworks(frameworks: InstalledFramework[]): MetadataBuilder {
    this.metadata.frameworks = frameworks;
    return this;
  }

  /**
   * Add a single installed framework
   */
  addFramework(framework: InstalledFramework): MetadataBuilder {
    this.metadata.frameworks.push(framework);
    return this;
  }

  /**
   * Add multiple installed frameworks
   */
  addFrameworks(frameworks: InstalledFramework[]): MetadataBuilder {
    this.metadata.frameworks.push(...frameworks);
    return this;
  }

  /**
   * Add an installed framework with specific properties
   */
  addInstalledFramework(
    id: string,
    version: string = '1.0.0',
    customized: boolean = false
  ): MetadataBuilder {
    const framework: InstalledFramework = {
      id,
      version,
      installedAt: new Date().toISOString(),
      customized
    };

    if (customized) {
      framework.customizedAt = new Date().toISOString();
    }

    this.metadata.frameworks.push(framework);
    return this;
  }

  /**
   * Clear all frameworks
   */
  withoutFrameworks(): MetadataBuilder {
    this.metadata.frameworks = [];
    return this;
  }

  /**
   * Add TDD/BDD framework as installed
   */
  withTddBddInstalled(customized: boolean = false): MetadataBuilder {
    return this.addInstalledFramework('tdd-bdd-strategy', '1.0.0', customized);
  }

  /**
   * Add security framework as installed
   */
  withSecurityInstalled(customized: boolean = false): MetadataBuilder {
    return this.addInstalledFramework('security-strategy', '1.0.0', customized);
  }

  /**
   * Add C4 model framework as installed
   */
  withC4ModelInstalled(customized: boolean = false): MetadataBuilder {
    return this.addInstalledFramework('c4-model-strategy', '1.0.0', customized);
  }

  /**
   * Add Azure framework as installed
   */
  withAzureInstalled(customized: boolean = false): MetadataBuilder {
    return this.addInstalledFramework('azure-strategy', '1.0.0', customized);
  }

  /**
   * Add DevOps framework as installed
   */
  withDevOpsInstalled(customized: boolean = false): MetadataBuilder {
    return this.addInstalledFramework('devops-strategy', '1.0.0', customized);
  }

  /**
   * Add all recommended frameworks as installed
   */
  withRecommendedFrameworks(customized: boolean = false): MetadataBuilder {
    return this
      .withTddBddInstalled(customized)
      .withC4ModelInstalled(customized)
      .withDevOpsInstalled(customized)
      .addInstalledFramework('4d-safe-strategy', '1.0.0', customized);
  }

  /**
   * Add all strategy frameworks as installed
   */
  withAllStrategyFrameworks(customized: boolean = false): MetadataBuilder {
    return this
      .withTddBddInstalled(customized)
      .withSecurityInstalled(customized)
      .withC4ModelInstalled(customized)
      .withAzureInstalled(customized)
      .withDevOpsInstalled(customized)
      .addInstalledFramework('iac-strategy', '1.0.0', customized)
      .addInstalledFramework('4d-safe-strategy', '1.0.0', customized)
      .addInstalledFramework('ea-strategy', '1.0.0', customized);
  }

  /**
   * Add a specific number of installed frameworks
   */
  withFrameworkCount(count: number, customized: boolean = false): MetadataBuilder {
    this.metadata.frameworks = [];
    for (let i = 0; i < count; i++) {
      this.addInstalledFramework(`test-framework-${i}`, '1.0.0', customized);
    }
    return this;
  }

  /**
   * Add an outdated framework (older version)
   */
  addOutdatedFramework(
    id: string,
    currentVersion: string = '0.9.0',
    customized: boolean = false
  ): MetadataBuilder {
    return this.addInstalledFramework(id, currentVersion, customized);
  }

  /**
   * Add a customized framework with custom date
   */
  addCustomizedFramework(
    id: string,
    version: string = '1.0.0',
    installedAt: string = new Date().toISOString(),
    customizedAt: string = new Date().toISOString()
  ): MetadataBuilder {
    this.metadata.frameworks.push({
      id,
      version,
      installedAt,
      customized: true,
      customizedAt
    });
    return this;
  }

  /**
   * Create an empty metadata file
   */
  asEmpty(): MetadataBuilder {
    this.metadata.frameworks = [];
    return this;
  }

  /**
   * Create a large metadata file (for performance testing)
   */
  asLarge(frameworkCount: number = 50): MetadataBuilder {
    return this.withFrameworkCount(frameworkCount);
  }

  /**
   * Create metadata with mixed customization states
   */
  withMixedCustomization(): MetadataBuilder {
    return this
      .withTddBddInstalled(false)
      .withSecurityInstalled(true)
      .withC4ModelInstalled(false)
      .withAzureInstalled(true)
      .withDevOpsInstalled(false);
  }

  /**
   * Create metadata with outdated frameworks
   */
  withOutdatedFrameworks(): MetadataBuilder {
    return this
      .addOutdatedFramework('tdd-bdd-strategy', '0.9.0')
      .addOutdatedFramework('security-strategy', '0.8.5')
      .addInstalledFramework('c4-model-strategy', '1.0.0');
  }

  /**
   * Build and return the metadata object
   */
  build(): InstalledFrameworksMetadata {
    return {
      frameworks: [...this.metadata.frameworks]
    };
  }

  /**
   * Build and return as JSON string
   */
  buildAsJson(pretty: boolean = false): string {
    return JSON.stringify(this.metadata, null, pretty ? 2 : 0);
  }

  /**
   * Create a new builder instance (static factory method)
   */
  static create(): MetadataBuilder {
    return new MetadataBuilder();
  }

  /**
   * Create default metadata with recommended frameworks
   */
  static createDefault(): MetadataBuilder {
    return new MetadataBuilder().withRecommendedFrameworks();
  }
}
