/**
 * Test Fixtures Index
 * 
 * This module provides easy access to all test fixtures.
 * Fixtures are pre-built test data that can be used across multiple tests.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Fixture paths
 */
export const FixturePaths = {
  // Steering document fixtures
  validSteeringDocument: path.join(__dirname, 'validSteeringDocument.md'),
  invalidSteeringDocument: path.join(__dirname, 'invalidSteeringDocument.md'),
  largeSteeringDocument: path.join(__dirname, 'largeSteeringDocument.md'),
  customizedFramework: path.join(__dirname, 'customizedFramework.md'),
  
  // Manifest fixtures
  manifest100Frameworks: path.join(__dirname, 'manifest-100-frameworks.json'),
  manifestCorrupted: path.join(__dirname, 'manifest-corrupted.json'),
  
  // Metadata fixtures
  metadata50Installed: path.join(__dirname, 'metadata-50-installed.json'),
  
  // Workspace fixtures
  workspace50Frameworks: path.join(__dirname, 'workspace-50-frameworks')
};

/**
 * Fixture loaders
 */
export class Fixtures {
  /**
   * Load a valid steering document with all required sections
   */
  static loadValidSteeringDocument(): string {
    return fs.readFileSync(FixturePaths.validSteeringDocument, 'utf-8');
  }

  /**
   * Load an invalid steering document missing required sections
   */
  static loadInvalidSteeringDocument(): string {
    return fs.readFileSync(FixturePaths.invalidSteeringDocument, 'utf-8');
  }

  /**
   * Load a large steering document (>1MB) for performance testing
   */
  static loadLargeSteeringDocument(): string {
    return fs.readFileSync(FixturePaths.largeSteeringDocument, 'utf-8');
  }

  /**
   * Load a customized framework steering document
   */
  static loadCustomizedFramework(): string {
    return fs.readFileSync(FixturePaths.customizedFramework, 'utf-8');
  }

  /**
   * Load a manifest with 100 frameworks for performance testing
   */
  static loadManifest100Frameworks(): any {
    const content = fs.readFileSync(FixturePaths.manifest100Frameworks, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load a manifest with 100 frameworks as JSON string
   */
  static loadManifest100FrameworksAsString(): string {
    return fs.readFileSync(FixturePaths.manifest100Frameworks, 'utf-8');
  }

  /**
   * Load a corrupted manifest for error handling testing
   */
  static loadManifestCorrupted(): any {
    const content = fs.readFileSync(FixturePaths.manifestCorrupted, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load a corrupted manifest as JSON string
   */
  static loadManifestCorruptedAsString(): string {
    return fs.readFileSync(FixturePaths.manifestCorrupted, 'utf-8');
  }

  /**
   * Load metadata for 50 installed frameworks
   */
  static loadMetadata50Installed(): any {
    const content = fs.readFileSync(FixturePaths.metadata50Installed, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Load metadata for 50 installed frameworks as JSON string
   */
  static loadMetadata50InstalledAsString(): string {
    return fs.readFileSync(FixturePaths.metadata50Installed, 'utf-8');
  }

  /**
   * Get the path to the workspace with 50 installed frameworks
   */
  static getWorkspace50FrameworksPath(): string {
    return FixturePaths.workspace50Frameworks;
  }

  /**
   * Check if a fixture file exists
   */
  static exists(fixturePath: string): boolean {
    return fs.existsSync(fixturePath);
  }

  /**
   * Get the size of a fixture file in bytes
   */
  static getSize(fixturePath: string): number {
    const stats = fs.statSync(fixturePath);
    return stats.size;
  }

  /**
   * Get the size of a fixture file in MB
   */
  static getSizeInMB(fixturePath: string): number {
    return this.getSize(fixturePath) / 1024 / 1024;
  }
}

/**
 * Fixture statistics
 */
export class FixtureStats {
  /**
   * Get statistics about the valid steering document
   */
  static getValidSteeringDocumentStats() {
    const content = Fixtures.loadValidSteeringDocument();
    return {
      size: content.length,
      sizeInKB: (content.length / 1024).toFixed(2),
      lines: content.split('\n').length,
      sections: (content.match(/^## /gm) || []).length,
      codeBlocks: (content.match(/```/g) || []).length / 2
    };
  }

  /**
   * Get statistics about the large steering document
   */
  static getLargeSteeringDocumentStats() {
    const size = Fixtures.getSize(FixturePaths.largeSteeringDocument);
    return {
      size: size,
      sizeInMB: (size / 1024 / 1024).toFixed(2),
      exists: Fixtures.exists(FixturePaths.largeSteeringDocument)
    };
  }

  /**
   * Get statistics about the manifest with 100 frameworks
   */
  static getManifest100FrameworksStats() {
    const manifest = Fixtures.loadManifest100Frameworks();
    return {
      frameworkCount: manifest.frameworks.length,
      version: manifest.version,
      size: Fixtures.getSize(FixturePaths.manifest100Frameworks),
      sizeInKB: (Fixtures.getSize(FixturePaths.manifest100Frameworks) / 1024).toFixed(2)
    };
  }

  /**
   * Get statistics about the metadata with 50 installed frameworks
   */
  static getMetadata50InstalledStats() {
    const metadata = Fixtures.loadMetadata50Installed();
    return {
      frameworkCount: metadata.frameworks.length,
      customizedCount: metadata.frameworks.filter((f: any) => f.customized).length,
      size: Fixtures.getSize(FixturePaths.metadata50Installed),
      sizeInKB: (Fixtures.getSize(FixturePaths.metadata50Installed) / 1024).toFixed(2)
    };
  }

  /**
   * Get statistics about the workspace with 50 frameworks
   */
  static getWorkspace50FrameworksStats() {
    const workspacePath = FixturePaths.workspace50Frameworks;
    const steeringPath = path.join(workspacePath, '.kiro', 'steering');
    
    if (!fs.existsSync(steeringPath)) {
      return {
        exists: false,
        frameworkCount: 0
      };
    }

    const files = fs.readdirSync(steeringPath);
    return {
      exists: true,
      frameworkCount: files.length,
      files: files
    };
  }
}

// Export all for convenience
export default {
  Fixtures,
  FixturePaths,
  FixtureStats
};
