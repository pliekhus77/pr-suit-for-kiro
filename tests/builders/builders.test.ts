import { FrameworkBuilder, SteeringDocumentBuilder, ManifestBuilder, MetadataBuilder } from './index';
import { FrameworkCategory } from '../../src/models/framework';
import { SteeringCategory } from '../../src/models/steering';

describe('Test Data Builders', () => {
  describe('FrameworkBuilder', () => {
    it('should create a framework with default values', () => {
      const framework = FrameworkBuilder.create().build();

      expect(framework.id).toBe('test-framework');
      expect(framework.name).toBe('Test Framework');
      expect(framework.category).toBe(FrameworkCategory.Testing);
      expect(framework.version).toBe('1.0.0');
    });

    it('should create a framework with custom values', () => {
      const framework = FrameworkBuilder.create()
        .withId('custom-id')
        .withName('Custom Name')
        .withVersion('2.0.0')
        .build();

      expect(framework.id).toBe('custom-id');
      expect(framework.name).toBe('Custom Name');
      expect(framework.version).toBe('2.0.0');
    });

    it('should create TDD/BDD framework preset', () => {
      const framework = FrameworkBuilder.create()
        .asTddBddFramework()
        .build();

      expect(framework.id).toBe('tdd-bdd-strategy');
      expect(framework.name).toBe('TDD/BDD Testing Strategy');
      expect(framework.category).toBe(FrameworkCategory.Testing);
    });

    it('should add dependencies', () => {
      const framework = FrameworkBuilder.create()
        .addDependency('dep1')
        .addDependency('dep2')
        .build();

      expect(framework.dependencies).toEqual(['dep1', 'dep2']);
    });

    it('should support method chaining', () => {
      const framework = FrameworkBuilder.create()
        .withId('test')
        .withName('Test')
        .withVersion('1.0.0')
        .addDependency('dep1')
        .build();

      expect(framework.id).toBe('test');
      expect(framework.dependencies).toEqual(['dep1']);
    });

    it('should create immutable builds', () => {
      const builder = FrameworkBuilder.create().withId('test');
      const framework1 = builder.build();
      const framework2 = builder.withVersion('2.0.0').build();

      expect(framework1.version).toBe('1.0.0');
      expect(framework2.version).toBe('2.0.0');
    });
  });

  describe('SteeringDocumentBuilder', () => {
    it('should create a steering document with default values', () => {
      const doc = SteeringDocumentBuilder.create().build();

      expect(doc.label).toBe('test-steering.md');
      expect(doc.category).toBe(SteeringCategory.Custom);
      expect(doc.isCustom).toBe(true);
    });

    it('should create a product document preset', () => {
      const doc = SteeringDocumentBuilder.create()
        .asProductDocument()
        .build();

      expect(doc.label).toBe('product.md');
      expect(doc.category).toBe(SteeringCategory.Product);
      expect(doc.isCustom).toBe(false);
    });

    it('should create a TDD/BDD strategy preset', () => {
      const doc = SteeringDocumentBuilder.create()
        .asTddBddStrategy()
        .build();

      expect(doc.label).toBe('strategy-tdd-bdd.md');
      expect(doc.frameworkId).toBe('tdd-bdd-strategy');
      expect(doc.version).toBe('1.0.0');
    });

    it('should create a category node', () => {
      const doc = SteeringDocumentBuilder.create()
        .asCategoryNode('Test Category', SteeringCategory.Strategy)
        .build();

      expect(doc.label).toBe('Test Category');
      expect(doc.isCategory).toBe(true);
      expect(doc.contextValue).toBe('steeringCategory');
    });
  });

  describe('ManifestBuilder', () => {
    it('should create a manifest with default values', () => {
      const manifest = ManifestBuilder.create().build();

      expect(manifest.version).toBe('1.0.0');
      expect(manifest.frameworks).toEqual([]);
    });

    it('should add frameworks', () => {
      const framework = FrameworkBuilder.create().build();
      const manifest = ManifestBuilder.create()
        .addFramework(framework)
        .build();

      expect(manifest.frameworks).toHaveLength(1);
      expect(manifest.frameworks[0].id).toBe('test-framework');
    });

    it('should add frameworks from builder', () => {
      const manifest = ManifestBuilder.create()
        .addFrameworkFromBuilder(FrameworkBuilder.create().asTddBddFramework())
        .addFrameworkFromBuilder(FrameworkBuilder.create().asSecurityFramework())
        .build();

      expect(manifest.frameworks).toHaveLength(2);
      expect(manifest.frameworks[0].id).toBe('tdd-bdd-strategy');
      expect(manifest.frameworks[1].id).toBe('security-strategy');
    });

    it('should create manifest with all strategy frameworks', () => {
      const manifest = ManifestBuilder.create()
        .withAllStrategyFrameworks()
        .build();

      expect(manifest.frameworks).toHaveLength(8);
    });

    it('should create manifest with specific count', () => {
      const manifest = ManifestBuilder.create()
        .withFrameworkCount(5)
        .build();

      expect(manifest.frameworks).toHaveLength(5);
    });

    it('should build as JSON', () => {
      const json = ManifestBuilder.create()
        .withVersion('2.0.0')
        .buildAsJson();

      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('2.0.0');
    });

    it('should create default manifest', () => {
      const manifest = ManifestBuilder.createDefault().build();

      expect(manifest.frameworks).toHaveLength(8);
    });
  });

  describe('MetadataBuilder', () => {
    it('should create metadata with default values', () => {
      const metadata = MetadataBuilder.create().build();

      expect(metadata.frameworks).toEqual([]);
    });

    it('should add installed frameworks', () => {
      const metadata = MetadataBuilder.create()
        .addInstalledFramework('test-framework', '1.0.0', false)
        .build();

      expect(metadata.frameworks).toHaveLength(1);
      expect(metadata.frameworks[0].id).toBe('test-framework');
      expect(metadata.frameworks[0].customized).toBe(false);
    });

    it('should add customized framework with date', () => {
      const metadata = MetadataBuilder.create()
        .addInstalledFramework('test-framework', '1.0.0', true)
        .build();

      expect(metadata.frameworks[0].customized).toBe(true);
      expect(metadata.frameworks[0].customizedAt).toBeDefined();
    });

    it('should add preset frameworks', () => {
      const metadata = MetadataBuilder.create()
        .withTddBddInstalled()
        .withSecurityInstalled()
        .build();

      expect(metadata.frameworks).toHaveLength(2);
      expect(metadata.frameworks[0].id).toBe('tdd-bdd-strategy');
      expect(metadata.frameworks[1].id).toBe('security-strategy');
    });

    it('should add recommended frameworks', () => {
      const metadata = MetadataBuilder.create()
        .withRecommendedFrameworks()
        .build();

      expect(metadata.frameworks).toHaveLength(4);
    });

    it('should add all strategy frameworks', () => {
      const metadata = MetadataBuilder.create()
        .withAllStrategyFrameworks()
        .build();

      expect(metadata.frameworks).toHaveLength(8);
    });

    it('should create mixed customization', () => {
      const metadata = MetadataBuilder.create()
        .withMixedCustomization()
        .build();

      const customized = metadata.frameworks.filter(f => f.customized);
      const notCustomized = metadata.frameworks.filter(f => !f.customized);

      expect(customized.length).toBeGreaterThan(0);
      expect(notCustomized.length).toBeGreaterThan(0);
    });

    it('should create outdated frameworks', () => {
      const metadata = MetadataBuilder.create()
        .withOutdatedFrameworks()
        .build();

      const outdated = metadata.frameworks.filter(f => f.version !== '1.0.0');
      expect(outdated.length).toBeGreaterThan(0);
    });

    it('should build as JSON', () => {
      const json = MetadataBuilder.create()
        .withTddBddInstalled()
        .buildAsJson();

      const parsed = JSON.parse(json);
      expect(parsed.frameworks).toHaveLength(1);
    });

    it('should create default metadata', () => {
      const metadata = MetadataBuilder.createDefault().build();

      expect(metadata.frameworks).toHaveLength(4);
    });
  });
});
