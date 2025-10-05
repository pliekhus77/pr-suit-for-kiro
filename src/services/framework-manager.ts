import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileSystemOperations } from '../utils/file-system';
import {
  Framework,
  FrameworkManifest,
  FrameworkCategory,
  InstallOptions,
  FrameworkUpdate,
  InstalledFramework,
  InstalledFrameworksMetadata
} from '../models/framework';

/**
 * Framework Manager Service
 * Handles framework discovery, installation, updates, and removal
 */
export class FrameworkManager {
  private fileSystem: FileSystemOperations;
  private manifestCache: FrameworkManifest | null = null;
  private metadataCache: InstalledFrameworksMetadata | null = null;
  private metadataCacheTime: number = 0;
  private readonly METADATA_CACHE_TTL = 5000; // 5 seconds
  private extensionPath: string;

  constructor(context: vscode.ExtensionContext, fileSystem?: FileSystemOperations) {
    this.extensionPath = context.extensionPath;
    this.fileSystem = fileSystem || new FileSystemOperations();
  }

  /**
   * Get the path to the bundled frameworks directory
   */
  private getResourcesPath(): string {
    return path.join(this.extensionPath, 'resources', 'frameworks');
  }

  /**
   * Load the framework manifest from resources
   */
  private async loadManifest(): Promise<FrameworkManifest> {
    if (this.manifestCache) {
      return this.manifestCache;
    }

    const manifestPath = path.join(this.getResourcesPath(), 'manifest.json');
    const content = await this.fileSystem.readFile(manifestPath);
    this.manifestCache = JSON.parse(content) as FrameworkManifest;
    return this.manifestCache;
  }

  /**
   * List all available frameworks
   */
  async listAvailableFrameworks(): Promise<Framework[]> {
    const manifest = await this.loadManifest();
    return manifest.frameworks;
  }

  /**
   * Get a framework by ID
   */
  async getFrameworkById(id: string): Promise<Framework | undefined> {
    const frameworks = await this.listAvailableFrameworks();
    return frameworks.find(f => f.id === id);
  }

  /**
   * Search frameworks by query string
   */
  async searchFrameworks(query: string): Promise<Framework[]> {
    const frameworks = await this.listAvailableFrameworks();
    
    if (!query || query.trim() === '') {
      return frameworks;
    }

    const lowerQuery = query.toLowerCase();
    return frameworks.filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get frameworks by category
   */
  async getFrameworksByCategory(category: FrameworkCategory): Promise<Framework[]> {
    const frameworks = await this.listAvailableFrameworks();
    return frameworks.filter(f => f.category === category);
  }

  /**
   * Check if a framework is installed
   */
  async isFrameworkInstalled(frameworkId: string): Promise<boolean> {
    const framework = await this.getFrameworkById(frameworkId);
    if (!framework) {
      return false;
    }

    const steeringPath = this.fileSystem.getSteeringPath();
    const filePath = path.join(steeringPath, framework.fileName);
    return await this.fileSystem.fileExists(filePath);
  }

  /**
   * Get installed frameworks metadata (with caching)
   */
  private async getInstalledMetadata(): Promise<InstalledFrameworksMetadata> {
    // Check if cache is valid
    const now = Date.now();
    if (this.metadataCache && (now - this.metadataCacheTime) < this.METADATA_CACHE_TTL) {
      return this.metadataCache;
    }

    const metadataPath = this.fileSystem.getMetadataPath();
    const metadataFile = path.join(metadataPath, 'installed-frameworks.json');

    try {
      const content = await this.fileSystem.readFile(metadataFile);
      this.metadataCache = JSON.parse(content) as InstalledFrameworksMetadata;
      this.metadataCacheTime = now;
      return this.metadataCache;
    } catch (error) {
      // If file doesn't exist, return empty metadata
      const emptyMetadata = { frameworks: [] };
      this.metadataCache = emptyMetadata;
      this.metadataCacheTime = now;
      return emptyMetadata;
    }
  }

  /**
   * Save installed frameworks metadata (and update cache)
   */
  private async saveInstalledMetadata(metadata: InstalledFrameworksMetadata): Promise<void> {
    const metadataPath = this.fileSystem.getMetadataPath();
    await this.fileSystem.ensureDirectory(metadataPath);
    
    const metadataFile = path.join(metadataPath, 'installed-frameworks.json');
    await this.fileSystem.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
    
    // Update cache
    this.metadataCache = metadata;
    this.metadataCacheTime = Date.now();
  }

  /**
   * Install a framework with conflict handling
   */
  async installFramework(frameworkId: string, options?: InstallOptions): Promise<void> {
    const framework = await this.getFrameworkById(frameworkId);
    if (!framework) {
      throw new Error(`Framework not found: ${frameworkId}`);
    }

    const steeringPath = this.fileSystem.getSteeringPath();
    const destinationPath = path.join(steeringPath, framework.fileName);

    // Check if file already exists
    const exists = await this.fileSystem.fileExists(destinationPath);
    
    if (exists && !options?.overwrite && !options?.merge) {
      // File exists and no resolution option provided - need user input
      const action = await this.promptForConflictResolution(framework.fileName);
      
      if (action === 'cancel') {
        throw new Error('Installation cancelled by user');
      }
      
      if (action === 'keep') {
        // Keep existing, don't install
        return;
      }
      
      if (action === 'overwrite') {
        options = { ...options, overwrite: true, backup: true };
      }
      
      if (action === 'merge') {
        options = { ...options, merge: true, backup: true };
      }
    }

    // Create backup if file exists and backup is requested
    if (exists && options?.backup) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${destinationPath}.backup-${timestamp}`;
      await this.fileSystem.copyFile(destinationPath, backupPath);
    }

    // Handle merge option
    if (exists && options?.merge) {
      await this.mergeFrameworkContent(destinationPath, framework);
    } else {
      // Copy framework file from resources (overwrite or new install)
      const sourcePath = path.join(this.getResourcesPath(), framework.fileName);
      await this.fileSystem.copyFile(sourcePath, destinationPath);
    }

    // Update metadata
    const metadata = await this.getInstalledMetadata();
    const existingIndex = metadata.frameworks.findIndex(f => f.id === frameworkId);
    
    const installedFramework: InstalledFramework = {
      id: frameworkId,
      version: framework.version,
      installedAt: new Date().toISOString(),
      customized: false
    };

    if (existingIndex >= 0) {
      metadata.frameworks[existingIndex] = installedFramework;
    } else {
      metadata.frameworks.push(installedFramework);
    }

    await this.saveInstalledMetadata(metadata);

    // Show success notification
    vscode.window.showInformationMessage(
      `Framework installed: ${framework.name}`,
      'Open File'
    ).then(selection => {
      if (selection === 'Open File') {
        vscode.workspace.openTextDocument(destinationPath).then(doc => {
          vscode.window.showTextDocument(doc);
        });
      }
    });
  }

  /**
   * Prompt user for conflict resolution action
   */
  private async promptForConflictResolution(fileName: string): Promise<'overwrite' | 'merge' | 'keep' | 'cancel'> {
    const choice = await vscode.window.showWarningMessage(
      `Framework file "${fileName}" already exists. What would you like to do?`,
      { modal: true },
      'Overwrite',
      'Merge',
      'Keep Existing',
      'Cancel'
    );

    switch (choice) {
      case 'Overwrite':
        return 'overwrite';
      case 'Merge':
        return 'merge';
      case 'Keep Existing':
        return 'keep';
      default:
        return 'cancel';
    }
  }

  /**
   * Merge framework content with existing file
   */
  private async mergeFrameworkContent(destinationPath: string, framework: Framework): Promise<void> {
    const existingContent = await this.fileSystem.readFile(destinationPath);
    const sourcePath = path.join(this.getResourcesPath(), framework.fileName);
    const newContent = await this.fileSystem.readFile(sourcePath);

    // Simple merge strategy: append new content with conflict markers
    const mergedContent = `${existingContent}

<!-- ========== MERGE CONFLICT: New Framework Content Below ========== -->
<!-- Review and integrate the content below, then remove conflict markers -->

${newContent}

<!-- ========== END MERGE CONFLICT ========== -->
`;

    await this.fileSystem.writeFile(destinationPath, mergedContent);
  }

  /**
   * Check for framework updates
   */
  async checkForUpdates(): Promise<FrameworkUpdate[]> {
    const metadata = await this.getInstalledMetadata();
    const updates: FrameworkUpdate[] = [];

    for (const installed of metadata.frameworks) {
      const framework = await this.getFrameworkById(installed.id);
      if (!framework) {
        continue;
      }

      if (framework.version !== installed.version) {
        updates.push({
          frameworkId: installed.id,
          currentVersion: installed.version,
          latestVersion: framework.version,
          changes: [`Updated to version ${framework.version}`]
        });
      }
    }

    return updates;
  }

  /**
   * Calculate content hash for a file
   */
  private async calculateContentHash(filePath: string): Promise<string> {
    const content = await this.fileSystem.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Check if a framework file has been customized
   */
  private async isFrameworkCustomized(frameworkId: string): Promise<boolean> {
    const framework = await this.getFrameworkById(frameworkId);
    if (!framework) {
      return false;
    }

    const steeringPath = this.fileSystem.getSteeringPath();
    const installedPath = path.join(steeringPath, framework.fileName);
    const sourcePath = path.join(this.getResourcesPath(), framework.fileName);

    try {
      const installedHash = await this.calculateContentHash(installedPath);
      const sourceHash = await this.calculateContentHash(sourcePath);
      return installedHash !== sourceHash;
    } catch (error) {
      // If we can't read files, assume not customized
      return false;
    }
  }

  /**
   * Show diff preview between current and new framework version
   */
  private async showDiffPreview(frameworkId: string): Promise<void> {
    const framework = await this.getFrameworkById(frameworkId);
    if (!framework) {
      return;
    }

    const steeringPath = this.fileSystem.getSteeringPath();
    const currentPath = path.join(steeringPath, framework.fileName);
    const newPath = path.join(this.getResourcesPath(), framework.fileName);

    const currentUri = vscode.Uri.file(currentPath);
    const newUri = vscode.Uri.file(newPath);

    await vscode.commands.executeCommand(
      'vscode.diff',
      currentUri,
      newUri,
      `${framework.name}: Current ↔ New Version`
    );
  }

  /**
   * Update a framework with customization detection and backup
   */
  async updateFramework(frameworkId: string): Promise<void> {
    const isInstalled = await this.isFrameworkInstalled(frameworkId);
    if (!isInstalled) {
      throw new Error(`Framework not installed: ${frameworkId}`);
    }

    const framework = await this.getFrameworkById(frameworkId);
    if (!framework) {
      throw new Error(`Framework not found: ${frameworkId}`);
    }

    // Check if framework has been customized
    const isCustomized = await this.isFrameworkCustomized(frameworkId);

    if (isCustomized) {
      // Warn user about customization
      const choice = await vscode.window.showWarningMessage(
        `The framework "${framework.name}" has been customized. Updating will overwrite your changes.`,
        { modal: true },
        'Show Diff',
        'Update with Backup',
        'Cancel'
      );

      if (choice === 'Cancel' || !choice) {
        throw new Error('Update cancelled by user');
      }

      if (choice === 'Show Diff') {
        // Show diff preview
        await this.showDiffPreview(frameworkId);

        // Ask again after showing diff
        const confirmChoice = await vscode.window.showWarningMessage(
          `Do you want to proceed with the update? A backup will be created.`,
          { modal: true },
          'Update with Backup',
          'Cancel'
        );

        if (confirmChoice !== 'Update with Backup') {
          throw new Error('Update cancelled by user');
        }
      }

      // Create backup before updating
      const steeringPath = this.fileSystem.getSteeringPath();
      const filePath = path.join(steeringPath, framework.fileName);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${filePath}.backup-${timestamp}`;
      
      await this.fileSystem.copyFile(filePath, backupPath);

      vscode.window.showInformationMessage(
        `Backup created: ${path.basename(backupPath)}`
      );
    } else {
      // Not customized, show diff preview option
      const choice = await vscode.window.showInformationMessage(
        `Update framework "${framework.name}" to version ${framework.version}?`,
        'Show Diff',
        'Update',
        'Cancel'
      );

      if (choice === 'Cancel' || !choice) {
        throw new Error('Update cancelled by user');
      }

      if (choice === 'Show Diff') {
        await this.showDiffPreview(frameworkId);

        const confirmChoice = await vscode.window.showInformationMessage(
          `Proceed with the update?`,
          'Update',
          'Cancel'
        );

        if (confirmChoice !== 'Update') {
          throw new Error('Update cancelled by user');
        }
      }
    }

    // Perform the update
    await this.installFramework(frameworkId, { overwrite: true, backup: false });

    // Update metadata to mark as not customized (since we just installed fresh version)
    const metadata = await this.getInstalledMetadata();
    const installedIndex = metadata.frameworks.findIndex(f => f.id === frameworkId);
    
    if (installedIndex >= 0) {
      metadata.frameworks[installedIndex].customized = false;
      metadata.frameworks[installedIndex].customizedAt = undefined;
      await this.saveInstalledMetadata(metadata);
    }

    vscode.window.showInformationMessage(
      `Framework updated: ${framework.name} (v${framework.version})`
    );
  }

  /**
   * Update all frameworks
   */
  async updateAllFrameworks(): Promise<void> {
    const updates = await this.checkForUpdates();
    
    for (const update of updates) {
      await this.updateFramework(update.frameworkId);
    }
  }

  /**
   * Remove a framework
   */
  async removeFramework(frameworkId: string): Promise<void> {
    const framework = await this.getFrameworkById(frameworkId);
    if (!framework) {
      throw new Error(`Framework not found: ${frameworkId}`);
    }

    const steeringPath = this.fileSystem.getSteeringPath();
    const filePath = path.join(steeringPath, framework.fileName);
    
    await this.fileSystem.deleteFile(filePath);

    // Update metadata
    const metadata = await this.getInstalledMetadata();
    metadata.frameworks = metadata.frameworks.filter(f => f.id !== frameworkId);
    await this.saveInstalledMetadata(metadata);
  }

  /**
   * Get all installed frameworks
   */
  async getInstalledFrameworks(): Promise<Framework[]> {
    const metadata = await this.getInstalledMetadata();
    const installed: Framework[] = [];

    for (const installedMeta of metadata.frameworks) {
      const framework = await this.getFrameworkById(installedMeta.id);
      if (framework) {
        installed.push(framework);
      }
    }

    return installed;
  }

  /**
   * Mark a framework as customized
   */
  async markFrameworkAsCustomized(frameworkId: string): Promise<void> {
    const metadata = await this.getInstalledMetadata();
    const installedIndex = metadata.frameworks.findIndex(f => f.id === frameworkId);
    
    if (installedIndex >= 0) {
      metadata.frameworks[installedIndex].customized = true;
      metadata.frameworks[installedIndex].customizedAt = new Date().toISOString();
      await this.saveInstalledMetadata(metadata);
    }
  }

  /**
   * Get installed framework metadata
   */
  async getInstalledFrameworkMetadata(frameworkId: string): Promise<InstalledFramework | undefined> {
    const metadata = await this.getInstalledMetadata();
    return metadata.frameworks.find(f => f.id === frameworkId);
  }

  /**
   * Clear all caches (for testing or manual refresh)
   */
  clearCaches(): void {
    this.manifestCache = null;
    this.metadataCache = null;
    this.metadataCacheTime = 0;
  }
}
