import { FrameworkManifest, Framework, FrameworkCategory } from '../../src/models/framework';
import { FrameworkBuilder } from './FrameworkBuilder';

/**
 * Builder for creating test FrameworkManifest objects with fluent API
 */
export class ManifestBuilder {
  private manifest: FrameworkManifest;

  constructor() {
    // Default manifest with sensible test values
    this.manifest = {
      version: '1.0.0',
      frameworks: []
    };
  }

  /**
   * Set the manifest version
   */
  withVersion(version: string): ManifestBuilder {
    this.manifest.version = version;
    return this;
  }

  /**
   * Set the frameworks array
   */
  withFrameworks(frameworks: Framework[]): ManifestBuilder {
    this.manifest.frameworks = frameworks;
    return this;
  }

  /**
   * Add a single framework
   */
  addFramework(framework: Framework): ManifestBuilder {
    this.manifest.frameworks.push(framework);
    return this;
  }

  /**
   * Add a framework using a builder
   */
  addFrameworkFromBuilder(builder: FrameworkBuilder): ManifestBuilder {
    this.manifest.frameworks.push(builder.build());
    return this;
  }

  /**
   * Add multiple frameworks
   */
  addFrameworks(frameworks: Framework[]): ManifestBuilder {
    this.manifest.frameworks.push(...frameworks);
    return this;
  }

  /**
   * Clear all frameworks
   */
  withoutFrameworks(): ManifestBuilder {
    this.manifest.frameworks = [];
    return this;
  }

  /**
   * Add all default strategy frameworks
   */
  withAllStrategyFrameworks(): ManifestBuilder {
    this.manifest.frameworks = [
      FrameworkBuilder.create().asTddBddFramework().build(),
      FrameworkBuilder.create().asSecurityFramework().build(),
      FrameworkBuilder.create().asC4ModelFramework().build(),
      FrameworkBuilder.create().asAzureFramework().build(),
      FrameworkBuilder.create().asDevOpsFramework().build(),
      FrameworkBuilder.create()
        .withId('iac-strategy')
        .withName('Infrastructure as Code (Pulumi)')
        .withDescription('IaC patterns and best practices with Pulumi')
        .withCategory(FrameworkCategory.Infrastructure)
        .withFileName('strategy-iac.md')
        .build(),
      FrameworkBuilder.create()
        .withId('4d-safe-strategy')
        .withName('4D SDLC + SAFe Work Management')
        .withDescription('Work management combining 4D phases with SAFe practices')
        .withCategory(FrameworkCategory.WorkManagement)
        .withFileName('strategy-4d-safe.md')
        .build(),
      FrameworkBuilder.create()
        .withId('ea-strategy')
        .withName('Enterprise Architecture (TOGAF/Zachman)')
        .withDescription('EA questions for product planning and feature design')
        .withCategory(FrameworkCategory.Architecture)
        .withFileName('strategy-ea.md')
        .build()
    ];
    return this;
  }

  /**
   * Add a specific number of test frameworks
   */
  withFrameworkCount(count: number): ManifestBuilder {
    this.manifest.frameworks = [];
    for (let i = 0; i < count; i++) {
      this.manifest.frameworks.push(
        FrameworkBuilder.create()
          .withId(`test-framework-${i}`)
          .withName(`Test Framework ${i}`)
          .withDescription(`Test framework number ${i}`)
          .withFileName(`test-framework-${i}.md`)
          .build()
      );
    }
    return this;
  }

  /**
   * Create a manifest with corrupted data (for error testing)
   */
  asCorrupted(): ManifestBuilder {
    // This will be used to test error handling
    // We'll return a manifest that's technically valid but has unusual data
    this.manifest.version = '';
    this.manifest.frameworks = [
      {
        id: '',
        name: '',
        description: '',
        category: FrameworkCategory.Testing,
        version: '',
        fileName: ''
      }
    ];
    return this;
  }

  /**
   * Create an empty manifest
   */
  asEmpty(): ManifestBuilder {
    this.manifest.frameworks = [];
    return this;
  }

  /**
   * Create a large manifest (for performance testing)
   */
  asLarge(frameworkCount: number = 100): ManifestBuilder {
    return this.withFrameworkCount(frameworkCount);
  }

  /**
   * Build and return the manifest object
   */
  build(): FrameworkManifest {
    return {
      version: this.manifest.version,
      frameworks: [...this.manifest.frameworks]
    };
  }

  /**
   * Build and return as JSON string
   */
  buildAsJson(pretty: boolean = false): string {
    return JSON.stringify(this.manifest, null, pretty ? 2 : 0);
  }

  /**
   * Create a new builder instance (static factory method)
   */
  static create(): ManifestBuilder {
    return new ManifestBuilder();
  }

  /**
   * Create a default manifest with common frameworks
   */
  static createDefault(): ManifestBuilder {
    return new ManifestBuilder().withAllStrategyFrameworks();
  }
}
