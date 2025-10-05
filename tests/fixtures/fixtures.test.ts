/**
 * Test suite for verifying all fixtures are properly created and accessible
 */

import { Fixtures, FixturePaths, FixtureStats } from './index';
import * as fs from 'fs';

describe('Test Fixtures', () => {
  describe('Steering Document Fixtures', () => {
    it('should load valid steering document', () => {
      const content = Fixtures.loadValidSteeringDocument();
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('# Valid Steering Document for Testing');
      expect(content).toContain('## Purpose');
      expect(content).toContain('## Key Concepts');
      expect(content).toContain('## Best Practices');
      expect(content).toContain('## Anti-Patterns');
      expect(content).toContain('## Summary');
    });

    it('should load invalid steering document', () => {
      const content = Fixtures.loadInvalidSteeringDocument();
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('# Invalid Steering Document for Testing');
      expect(content).not.toContain('## Purpose');
      expect(content).not.toContain('## Summary');
    });

    it('should load large steering document', () => {
      const content = Fixtures.loadLargeSteeringDocument();
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(1024 * 1024); // > 1MB
      expect(content).toContain('# Large Steering Document for Performance Testing');
    });

    it('should load customized framework', () => {
      const content = Fixtures.loadCustomizedFramework();
      
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('CUSTOMIZED');
      expect(content).toContain('TEAM CUSTOMIZATION');
      expect(content).toContain('CUSTOMIZATION HISTORY');
    });

    it('should get valid steering document stats', () => {
      const stats = FixtureStats.getValidSteeringDocumentStats();
      
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.lines).toBeGreaterThan(0);
      expect(stats.sections).toBeGreaterThan(0);
      expect(stats.codeBlocks).toBeGreaterThan(0);
    });

    it('should get large steering document stats', () => {
      const stats = FixtureStats.getLargeSteeringDocumentStats();
      
      expect(stats.exists).toBe(true);
      expect(parseFloat(stats.sizeInMB)).toBeGreaterThan(1);
    });
  });

  describe('Manifest Fixtures', () => {
    it('should load manifest with 100 frameworks', () => {
      const manifest = Fixtures.loadManifest100Frameworks();
      
      expect(manifest).toBeDefined();
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.frameworks).toHaveLength(100);
      expect(manifest.frameworks[0]).toHaveProperty('id');
      expect(manifest.frameworks[0]).toHaveProperty('name');
      expect(manifest.frameworks[0]).toHaveProperty('description');
      expect(manifest.frameworks[0]).toHaveProperty('category');
      expect(manifest.frameworks[0]).toHaveProperty('version');
      expect(manifest.frameworks[0]).toHaveProperty('fileName');
    });

    it('should load manifest with 100 frameworks as string', () => {
      const manifestString = Fixtures.loadManifest100FrameworksAsString();
      
      expect(manifestString).toBeDefined();
      expect(manifestString.length).toBeGreaterThan(0);
      expect(() => JSON.parse(manifestString)).not.toThrow();
    });

    it('should load corrupted manifest', () => {
      const manifest = Fixtures.loadManifestCorrupted();
      
      expect(manifest).toBeDefined();
      expect(manifest.version).toBe('');
      expect(manifest.frameworks).toBeDefined();
      expect(manifest.frameworks.length).toBeGreaterThan(0);
      
      // Check for various corruption scenarios
      const emptyIdFramework = manifest.frameworks.find((f: any) => f.id === '');
      expect(emptyIdFramework).toBeDefined();
      
      const missingFieldsFramework = manifest.frameworks.find((f: any) => f.id === 'missing-fields');
      expect(missingFieldsFramework).toBeDefined();
      expect(missingFieldsFramework.description).toBeUndefined();
      
      const invalidVersionFramework = manifest.frameworks.find((f: any) => f.id === 'invalid-version');
      expect(invalidVersionFramework).toBeDefined();
      expect(invalidVersionFramework.version).toBe('not-a-version');
    });

    it('should get manifest 100 frameworks stats', () => {
      const stats = FixtureStats.getManifest100FrameworksStats();
      
      expect(stats.frameworkCount).toBe(100);
      expect(stats.version).toBe('1.0.0');
      expect(stats.size).toBeGreaterThan(0);
      expect(parseFloat(stats.sizeInKB)).toBeGreaterThan(0);
    });
  });

  describe('Metadata Fixtures', () => {
    it('should load metadata with 50 installed frameworks', () => {
      const metadata = Fixtures.loadMetadata50Installed();
      
      expect(metadata).toBeDefined();
      expect(metadata.frameworks).toHaveLength(50);
      expect(metadata.frameworks[0]).toHaveProperty('id');
      expect(metadata.frameworks[0]).toHaveProperty('version');
      expect(metadata.frameworks[0]).toHaveProperty('installedAt');
      expect(metadata.frameworks[0]).toHaveProperty('customized');
    });

    it('should load metadata with 50 installed frameworks as string', () => {
      const metadataString = Fixtures.loadMetadata50InstalledAsString();
      
      expect(metadataString).toBeDefined();
      expect(metadataString.length).toBeGreaterThan(0);
      expect(() => JSON.parse(metadataString)).not.toThrow();
    });

    it('should have customized frameworks in metadata', () => {
      const metadata = Fixtures.loadMetadata50Installed();
      const customizedFrameworks = metadata.frameworks.filter((f: any) => f.customized);
      
      expect(customizedFrameworks.length).toBeGreaterThan(0);
      customizedFrameworks.forEach((f: any) => {
        expect(f.customizedAt).toBeDefined();
      });
    });

    it('should get metadata 50 installed stats', () => {
      const stats = FixtureStats.getMetadata50InstalledStats();
      
      expect(stats.frameworkCount).toBe(50);
      expect(stats.customizedCount).toBeGreaterThan(0);
      expect(stats.size).toBeGreaterThan(0);
      expect(parseFloat(stats.sizeInKB)).toBeGreaterThan(0);
    });
  });

  describe('Workspace Fixtures', () => {
    it('should have workspace with 50 frameworks', () => {
      const workspacePath = Fixtures.getWorkspace50FrameworksPath();
      
      expect(workspacePath).toBeDefined();
      expect(fs.existsSync(workspacePath)).toBe(true);
    });

    it('should have .kiro directory structure', () => {
      const workspacePath = Fixtures.getWorkspace50FrameworksPath();
      const kiroPath = `${workspacePath}/.kiro`;
      const steeringPath = `${kiroPath}/steering`;
      const metadataPath = `${kiroPath}/.metadata`;
      
      expect(fs.existsSync(kiroPath)).toBe(true);
      expect(fs.existsSync(steeringPath)).toBe(true);
      expect(fs.existsSync(metadataPath)).toBe(true);
    });

    it('should have 50 steering documents', () => {
      const workspacePath = Fixtures.getWorkspace50FrameworksPath();
      const steeringPath = `${workspacePath}/.kiro/steering`;
      const files = fs.readdirSync(steeringPath);
      
      expect(files.length).toBe(50);
      files.forEach(file => {
        expect(file).toMatch(/^strategy-framework-\d+\.md$/);
      });
    });

    it('should have installed-frameworks.json metadata', () => {
      const workspacePath = Fixtures.getWorkspace50FrameworksPath();
      const metadataPath = `${workspacePath}/.kiro/.metadata/installed-frameworks.json`;
      
      expect(fs.existsSync(metadataPath)).toBe(true);
      
      const content = fs.readFileSync(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);
      
      expect(metadata.frameworks).toHaveLength(50);
    });

    it('should get workspace 50 frameworks stats', () => {
      const stats = FixtureStats.getWorkspace50FrameworksStats();
      
      expect(stats.exists).toBe(true);
      expect(stats.frameworkCount).toBe(50);
      expect(stats.files).toHaveLength(50);
    });
  });

  describe('Fixture Paths', () => {
    it('should have all fixture paths defined', () => {
      expect(FixturePaths.validSteeringDocument).toBeDefined();
      expect(FixturePaths.invalidSteeringDocument).toBeDefined();
      expect(FixturePaths.largeSteeringDocument).toBeDefined();
      expect(FixturePaths.customizedFramework).toBeDefined();
      expect(FixturePaths.manifest100Frameworks).toBeDefined();
      expect(FixturePaths.manifestCorrupted).toBeDefined();
      expect(FixturePaths.metadata50Installed).toBeDefined();
      expect(FixturePaths.workspace50Frameworks).toBeDefined();
    });

    it('should have all fixture files exist', () => {
      expect(Fixtures.exists(FixturePaths.validSteeringDocument)).toBe(true);
      expect(Fixtures.exists(FixturePaths.invalidSteeringDocument)).toBe(true);
      expect(Fixtures.exists(FixturePaths.largeSteeringDocument)).toBe(true);
      expect(Fixtures.exists(FixturePaths.customizedFramework)).toBe(true);
      expect(Fixtures.exists(FixturePaths.manifest100Frameworks)).toBe(true);
      expect(Fixtures.exists(FixturePaths.manifestCorrupted)).toBe(true);
      expect(Fixtures.exists(FixturePaths.metadata50Installed)).toBe(true);
      expect(Fixtures.exists(FixturePaths.workspace50Frameworks)).toBe(true);
    });
  });

  describe('Fixture Utilities', () => {
    it('should get file size in bytes', () => {
      const size = Fixtures.getSize(FixturePaths.validSteeringDocument);
      expect(size).toBeGreaterThan(0);
    });

    it('should get file size in MB', () => {
      const sizeInMB = Fixtures.getSizeInMB(FixturePaths.largeSteeringDocument);
      expect(sizeInMB).toBeGreaterThan(1);
    });
  });
});
