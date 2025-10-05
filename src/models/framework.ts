/**
 * Framework category enumeration
 */
export enum FrameworkCategory {
  Architecture = 'architecture',
  Testing = 'testing',
  Security = 'security',
  DevOps = 'devops',
  Cloud = 'cloud',
  Infrastructure = 'infrastructure',
  WorkManagement = 'work-management'
}

/**
 * Framework metadata interface
 */
export interface Framework {
  id: string;
  name: string;
  description: string;
  category: FrameworkCategory;
  version: string;
  fileName: string;
  dependencies?: string[];
}

/**
 * Framework manifest interface
 */
export interface FrameworkManifest {
  version: string;
  frameworks: Framework[];
}

/**
 * Installation options interface
 */
export interface InstallOptions {
  overwrite?: boolean;
  merge?: boolean;
  backup?: boolean;
}

/**
 * Framework update information
 */
export interface FrameworkUpdate {
  frameworkId: string;
  currentVersion: string;
  latestVersion: string;
  changes: string[];
}

/**
 * Installed framework metadata
 */
export interface InstalledFramework {
  id: string;
  version: string;
  installedAt: string;
  customized: boolean;
  customizedAt?: string;
}

/**
 * Installed frameworks metadata file structure
 */
export interface InstalledFrameworksMetadata {
  frameworks: InstalledFramework[];
}
