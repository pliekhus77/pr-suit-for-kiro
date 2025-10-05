import * as vscode from 'vscode';
import * as path from 'path';
import { SteeringItem, SteeringCategory } from '../models/steering';
import { FileSystemOperations } from '../utils/file-system';
import { FrameworkManager } from '../services/framework-manager';

/**
 * Tree data provider for steering documents
 */
export class SteeringTreeProvider implements vscode.TreeDataProvider<SteeringItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<SteeringItem | undefined | null | void> = new vscode.EventEmitter<SteeringItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<SteeringItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(
    private fileSystem: FileSystemOperations,
    private frameworkManager: FrameworkManager
  ) {}

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item representation
   */
  getTreeItem(element: SteeringItem): vscode.TreeItem {
    const collapsibleState = element.isCategory 
      ? vscode.TreeItemCollapsibleState.Expanded 
      : vscode.TreeItemCollapsibleState.None;
    
    const treeItem = new vscode.TreeItem(element.label, collapsibleState);
    
    // Explicitly set label and collapsibleState to ensure they're set
    // (workaround for potential mock issues in tests)
    treeItem.label = element.label;
    treeItem.collapsibleState = collapsibleState;

    if (element.isCategory) {
      // Category node
      treeItem.contextValue = 'steeringCategory';
      treeItem.iconPath = this.getCategoryIcon(element.category);
    } else {
      // File node
      treeItem.resourceUri = vscode.Uri.file(element.resourceUri);
      treeItem.command = {
        command: 'vscode.open',
        title: 'Open Steering Document',
        arguments: [treeItem.resourceUri]
      };
      treeItem.contextValue = element.contextValue;
      treeItem.iconPath = this.getFileIcon(element.category);
      
      // Set tooltip with framework name and last modified date
      // Start with label, then update asynchronously
      treeItem.tooltip = element.label;
      this.createTooltip(element).then(tooltip => {
        treeItem.tooltip = tooltip;
      }).catch(() => {
        // Fallback to simple label if tooltip creation fails
        treeItem.tooltip = element.label;
      });
    }

    return treeItem;
  }

  /**
   * Get children for tree view
   */
  async getChildren(element?: SteeringItem): Promise<SteeringItem[]> {
    let steeringPath: string;
    try {
      steeringPath = this.fileSystem.getSteeringPath();
    } catch (error) {
      // No workspace or .kiro directory
      return [];
    }
    
    if (!steeringPath) {
      return [];
    }

    // Check if steering directory exists
    const steeringExists = await this.fileSystem.directoryExists(steeringPath);
    if (!steeringExists) {
      return [];
    }

    if (!element) {
      // Root level - return categories
      return this.getCategories(steeringPath);
    } else if (element.isCategory) {
      // Category level - return files in that category
      return this.getFilesForCategory(steeringPath, element.category);
    }

    return [];
  }

  /**
   * Get category nodes
   */
  private async getCategories(steeringPath: string): Promise<SteeringItem[]> {
    const categories: SteeringItem[] = [];
    const files = await this.fileSystem.listFiles(steeringPath, '*.md');

    // Check which categories have files
    const hasStrategies = files.some(f => path.basename(f).startsWith('strategy-'));
    const hasProduct = files.some(f => path.basename(f) === 'product.md');
    const hasTech = files.some(f => path.basename(f) === 'tech.md');
    const hasStructure = files.some(f => path.basename(f) === 'structure.md');
    const hasCustom = files.some(f => {
      const basename = path.basename(f);
      return basename.startsWith('custom-') || 
             (!basename.startsWith('strategy-') && 
              basename !== 'product.md' && 
              basename !== 'tech.md' && 
              basename !== 'structure.md');
    });

    if (hasStrategies) {
      categories.push({
        label: 'Strategies (Installed)',
        resourceUri: '',
        category: SteeringCategory.Strategy,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      });
    }

    if (hasProduct || hasTech || hasStructure) {
      categories.push({
        label: 'Project (Team-Created)',
        resourceUri: '',
        category: SteeringCategory.Product,
        isCustom: false,
        contextValue: 'steeringCategory',
        isCategory: true
      });
    }

    if (hasCustom) {
      categories.push({
        label: 'Custom (Team-Created)',
        resourceUri: '',
        category: SteeringCategory.Custom,
        isCustom: true,
        contextValue: 'steeringCategory',
        isCategory: true
      });
    }

    return categories;
  }

  /**
   * Get files for a specific category
   */
  private async getFilesForCategory(steeringPath: string, category: SteeringCategory): Promise<SteeringItem[]> {
    const files = await this.fileSystem.listFiles(steeringPath, '*.md');
    const items: SteeringItem[] = [];

    for (const file of files) {
      const basename = path.basename(file);
      const fileCategory = this.categorizeFile(basename);

      if (this.matchesCategory(fileCategory, category)) {
        const filePath = path.join(steeringPath, file);
        const frameworkId = this.extractFrameworkId(basename);
        
        items.push({
          label: basename,
          resourceUri: filePath,
          category: fileCategory,
          frameworkId,
          isCustom: fileCategory === SteeringCategory.Custom,
          contextValue: this.getContextValue(fileCategory)
        });
      }
    }

    // Sort alphabetically
    items.sort((a, b) => a.label.localeCompare(b.label));

    return items;
  }

  /**
   * Categorize a file based on its name
   */
  private categorizeFile(filename: string): SteeringCategory {
    if (filename.startsWith('strategy-')) {
      return SteeringCategory.Strategy;
    } else if (filename === 'product.md') {
      return SteeringCategory.Product;
    } else if (filename === 'tech.md') {
      return SteeringCategory.Technical;
    } else if (filename === 'structure.md') {
      return SteeringCategory.Structure;
    } else {
      return SteeringCategory.Custom;
    }
  }

  /**
   * Check if a file category matches the display category
   */
  private matchesCategory(fileCategory: SteeringCategory, displayCategory: SteeringCategory): boolean {
    if (displayCategory === SteeringCategory.Strategy) {
      return fileCategory === SteeringCategory.Strategy;
    } else if (displayCategory === SteeringCategory.Product) {
      return fileCategory === SteeringCategory.Product || 
             fileCategory === SteeringCategory.Technical || 
             fileCategory === SteeringCategory.Structure;
    } else if (displayCategory === SteeringCategory.Custom) {
      return fileCategory === SteeringCategory.Custom;
    }
    return false;
  }

  /**
   * Extract framework ID from filename
   */
  private extractFrameworkId(filename: string): string | undefined {
    if (filename.startsWith('strategy-')) {
      // Remove 'strategy-' prefix and '.md' suffix
      return filename.replace('strategy-', '').replace('.md', '') + '-strategy';
    }
    return undefined;
  }

  /**
   * Get context value for context menu
   */
  private getContextValue(category: SteeringCategory): string {
    if (category === SteeringCategory.Strategy) {
      return 'steeringStrategy';
    } else if (category === SteeringCategory.Custom) {
      return 'steeringCustom';
    } else {
      return 'steeringProject';
    }
  }

  /**
   * Create tooltip for steering item
   */
  private async createTooltip(element: SteeringItem): Promise<string> {
    let tooltip = element.label;

    // Add framework name if available
    if (element.frameworkId) {
      try {
        const framework = await this.frameworkManager.getFrameworkById(element.frameworkId);
        if (framework) {
          tooltip += `\n${framework.name}`;
        }
      } catch (error) {
        // Framework not found, skip
      }
    }

    // Add last modified date
    try {
      const stats = await vscode.workspace.fs.stat(vscode.Uri.file(element.resourceUri));
      const modifiedDate = new Date(stats.mtime);
      tooltip += `\nLast modified: ${modifiedDate.toLocaleDateString()}`;
    } catch (error) {
      // File not found or error reading stats
    }

    return tooltip;
  }

  /**
   * Get icon for category
   */
  private getCategoryIcon(category: SteeringCategory): vscode.ThemeIcon {
    switch (category) {
      case SteeringCategory.Strategy:
        return new vscode.ThemeIcon('library');
      case SteeringCategory.Product:
        return new vscode.ThemeIcon('briefcase');
      case SteeringCategory.Custom:
        return new vscode.ThemeIcon('edit');
      default:
        return new vscode.ThemeIcon('folder');
    }
  }

  /**
   * Get icon for file based on category
   */
  private getFileIcon(category: SteeringCategory): vscode.ThemeIcon {
    switch (category) {
      case SteeringCategory.Strategy:
        return new vscode.ThemeIcon('book', new vscode.ThemeColor('charts.blue'));
      case SteeringCategory.Product:
        return new vscode.ThemeIcon('file-text');
      case SteeringCategory.Technical:
        return new vscode.ThemeIcon('file-code');
      case SteeringCategory.Structure:
        return new vscode.ThemeIcon('file-directory');
      case SteeringCategory.Custom:
        return new vscode.ThemeIcon('file', new vscode.ThemeColor('charts.green'));
      default:
        return new vscode.ThemeIcon('file');
    }
  }
}
