import * as vscode from 'vscode';
import { FrameworkManager } from '../services/framework-manager';
import { FrameworkReferenceManager } from '../services/framework-reference-manager';
import { Framework, FrameworkCategory } from '../models/framework';

/**
 * Framework Quick Pick Item interface
 * Extends VS Code QuickPickItem with framework-specific properties
 */
export interface FrameworkQuickPickItem extends vscode.QuickPickItem {
  frameworkId: string;
  category: FrameworkCategory;
  version: string;
  installed: boolean;
  framework: Framework;
}

/**
 * Category labels for display
 */
const CATEGORY_LABELS: Record<FrameworkCategory, string> = {
  [FrameworkCategory.Architecture]: 'Architecture',
  [FrameworkCategory.Testing]: 'Testing',
  [FrameworkCategory.Security]: 'Security',
  [FrameworkCategory.DevOps]: 'DevOps',
  [FrameworkCategory.Cloud]: 'Cloud',
  [FrameworkCategory.Infrastructure]: 'Infrastructure',
  [FrameworkCategory.WorkManagement]: 'Work Management'
};

/**
 * Browse Frameworks Command
 * Shows a quick pick with all available frameworks grouped by category
 */
export async function browseFrameworksCommand(
  context: vscode.ExtensionContext,
  frameworkManager: FrameworkManager,
  referenceManager?: FrameworkReferenceManager
): Promise<void> {
  try {
    // Get all available frameworks
    const frameworks = await frameworkManager.listAvailableFrameworks();
    
    // Get installed frameworks to mark them
    const installedFrameworks = await frameworkManager.getInstalledFrameworks();
    const installedIds = new Set(installedFrameworks.map(f => f.id));

    // Create quick pick items grouped by category
    const items = await createFrameworkQuickPickItems(frameworks, installedIds);

    // Show quick pick
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a framework to view details',
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      // Show framework preview
      await showFrameworkPreview(context, frameworkManager, selected, referenceManager);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to browse frameworks: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create framework quick pick items grouped by category
 */
async function createFrameworkQuickPickItems(
  frameworks: Framework[],
  installedIds: Set<string>
): Promise<FrameworkQuickPickItem[]> {
  const items: FrameworkQuickPickItem[] = [];

  // Group frameworks by category
  const categorized = new Map<FrameworkCategory, Framework[]>();
  for (const framework of frameworks) {
    if (!categorized.has(framework.category)) {
      categorized.set(framework.category, []);
    }
    categorized.get(framework.category)!.push(framework);
  }

  // Sort categories for consistent display
  const sortedCategories = Array.from(categorized.keys()).sort();

  // Create items with category separators
  for (const category of sortedCategories) {
    const categoryFrameworks = categorized.get(category)!;
    
    // Add category separator
    items.push({
      label: CATEGORY_LABELS[category],
      kind: vscode.QuickPickItemKind.Separator,
      frameworkId: '',
      category,
      version: '',
      installed: false,
      framework: {} as Framework
    });

    // Add frameworks in this category
    for (const framework of categoryFrameworks) {
      const isInstalled = installedIds.has(framework.id);
      
      items.push({
        label: `${isInstalled ? '$(check) ' : ''}${framework.name}`,
        description: `v${framework.version}`,
        detail: framework.description,
        frameworkId: framework.id,
        category: framework.category,
        version: framework.version,
        installed: isInstalled,
        framework
      });
    }
  }

  return items;
}

/**
 * Show framework preview with action buttons
 */
async function showFrameworkPreview(
  context: vscode.ExtensionContext,
  frameworkManager: FrameworkManager,
  item: FrameworkQuickPickItem,
  referenceManager?: FrameworkReferenceManager
): Promise<void> {
  const framework = item.framework;
  
  // Build preview message with description and key concepts
  const previewMessage = buildPreviewMessage(framework, item.installed);
  
  // Define action buttons
  const actions: string[] = [];
  
  if (item.installed) {
    actions.push('Uninstall');
  } else {
    actions.push('Install');
  }
  
  actions.push('View Full Documentation');
  
  // Show preview with action buttons
  const selection = await vscode.window.showInformationMessage(
    previewMessage,
    { modal: true },
    ...actions
  );
  
  // Handle user selection
  if (selection === 'Install') {
    await handleInstallAction(frameworkManager, framework);
  } else if (selection === 'Uninstall') {
    await handleUninstallAction(frameworkManager, framework);
  } else if (selection === 'View Full Documentation') {
    await handleViewDocumentationAction(context, framework, referenceManager);
  }
  // No selection (user dismissed) - do nothing
}

/**
 * Build preview message with framework details
 */
function buildPreviewMessage(framework: Framework, isInstalled: boolean): string {
  const statusBadge = isInstalled ? '✓ Installed' : 'Not Installed';
  
  let message = `${framework.name} (v${framework.version}) - ${statusBadge}\n\n`;
  message += `Category: ${CATEGORY_LABELS[framework.category]}\n\n`;
  message += `Description:\n${framework.description}\n\n`;
  
  if (framework.dependencies && framework.dependencies.length > 0) {
    message += `Dependencies: ${framework.dependencies.join(', ')}\n\n`;
  }
  
  message += `This framework provides guidance for ${CATEGORY_LABELS[framework.category].toLowerCase()} practices.`;
  
  return message;
}

/**
 * Handle Install action
 */
async function handleInstallAction(
  frameworkManager: FrameworkManager,
  framework: Framework
): Promise<void> {
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Installing ${framework.name}...`,
        cancellable: false
      },
      async () => {
        await frameworkManager.installFramework(framework.id);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to install framework: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Handle Uninstall action
 */
async function handleUninstallAction(
  frameworkManager: FrameworkManager,
  framework: Framework
): Promise<void> {
  try {
    // Confirm uninstall
    const confirmation = await vscode.window.showWarningMessage(
      `Are you sure you want to uninstall "${framework.name}"? This will remove the file from your .kiro/steering/ directory.`,
      { modal: true },
      'Uninstall'
    );
    
    if (confirmation !== 'Uninstall') {
      return;
    }
    
    // Perform uninstall with progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Uninstalling ${framework.name}...`,
        cancellable: false
      },
      async () => {
        await frameworkManager.removeFramework(framework.id);
      }
    );
    
    vscode.window.showInformationMessage(
      `Framework uninstalled: ${framework.name}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to uninstall framework: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Handle View Full Documentation action
 */
async function handleViewDocumentationAction(
  context: vscode.ExtensionContext,
  framework: Framework,
  referenceManager?: FrameworkReferenceManager
): Promise<void> {
  try {
    // Check if frameworks/ directory exists in workspace
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showWarningMessage('No workspace folder open');
      return;
    }
    
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const frameworksPath = vscode.Uri.file(`${workspaceRoot}/frameworks`);
    
    // Try to find the reference document
    // Map framework file names to reference doc names
    const referenceDocName = getReferencDocName(framework.fileName);
    const referencePath = vscode.Uri.joinPath(frameworksPath, referenceDocName);
    
    try {
      // Try to open the reference document
      const doc = await vscode.workspace.openTextDocument(referencePath);
      await vscode.window.showTextDocument(doc);
    } catch {
      // If reference doesn't exist, offer to initialize frameworks directory
      const choice = await vscode.window.showInformationMessage(
        `Framework reference documentation not found. Would you like to initialize the frameworks/ directory with all reference documents?`,
        'Initialize',
        'Cancel'
      );
      
      if (choice === 'Initialize') {
        if (!referenceManager) {
          vscode.window.showErrorMessage('Reference manager not available');
          return;
        }
        
        // Initialize frameworks directory with progress
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Initializing frameworks directory...',
            cancellable: false
          },
          async () => {
            await referenceManager.initializeFrameworksDirectory();
          }
        );
        
        // Try to open the document again after initialization
        try {
          const doc = await vscode.workspace.openTextDocument(referencePath);
          await vscode.window.showTextDocument(doc);
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to open documentation after initialization: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to open documentation: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Map steering file name to reference document name
 */
function getReferencDocName(fileName: string): string {
  // Map strategy files to their reference docs
  const mapping: Record<string, string> = {
    'strategy-tdd-bdd.md': 'test-driven-development.md',
    'strategy-security.md': 'sabsa-framework.md',
    'strategy-c4-model.md': 'c4-model.md',
    'strategy-azure.md': 'azure-well-architected.md',
    'strategy-devops.md': 'devops-frameworks.md',
    'strategy-iac.md': 'pulumi.md',
    'strategy-4d-safe.md': '4d-sdlc.md',
    'strategy-ea.md': 'domain-driven-design.md'
  };
  
  return mapping[fileName] || fileName;
}

/**
 * Update Framework Command
 * Updates a specific framework from the library
 */
export async function updateFrameworkCommand(
  frameworkManager: FrameworkManager,
  frameworkId?: string
): Promise<void> {
  try {
    // If no frameworkId provided, show picker
    if (!frameworkId) {
      const updates = await frameworkManager.checkForUpdates();
      
      if (updates.length === 0) {
        vscode.window.showInformationMessage('All frameworks are up to date');
        return;
      }
      
      const items = updates.map(update => ({
        label: update.frameworkId,
        description: `${update.currentVersion} → ${update.latestVersion}`,
        detail: update.changes.join(', '),
        frameworkId: update.frameworkId
      }));
      
      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a framework to update',
        matchOnDescription: true,
        matchOnDetail: true
      });
      
      if (!selected) {
        return;
      }
      
      frameworkId = selected.frameworkId;
    }
    
    // Show progress while updating
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Updating ${frameworkId}...`,
        cancellable: false
      },
      async () => {
        await frameworkManager.updateFramework(frameworkId!);
      }
    );
    
    // Show success message
    vscode.window.showInformationMessage(
      `Framework updated successfully: ${frameworkId}`
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to update framework: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Update All Frameworks Command
 * Updates all outdated frameworks from the library
 */
export async function updateAllFrameworksCommand(
  frameworkManager: FrameworkManager
): Promise<void> {
  try {
    // Check for updates
    const updates = await frameworkManager.checkForUpdates();
    
    if (updates.length === 0) {
      vscode.window.showInformationMessage('All frameworks are up to date');
      return;
    }
    
    // Confirm with user
    const message = updates.length === 1
      ? `Update 1 framework?`
      : `Update ${updates.length} frameworks?`;
    
    const updateList = updates.map(u => `• ${u.frameworkId} (${u.currentVersion} → ${u.latestVersion})`).join('\n');
    
    const choice = await vscode.window.showInformationMessage(
      `${message}\n\n${updateList}`,
      { modal: true },
      'Update All',
      'Cancel'
    );
    
    if (choice !== 'Update All') {
      return;
    }
    
    // Update all frameworks with progress
    let successCount = 0;
    let failureCount = 0;
    const failures: string[] = [];
    
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Updating frameworks...',
        cancellable: false
      },
      async (progress) => {
        for (let i = 0; i < updates.length; i++) {
          const update = updates[i];
          
          progress.report({
            message: `${i + 1}/${updates.length}: ${update.frameworkId}`,
            increment: (100 / updates.length)
          });
          
          try {
            await frameworkManager.updateFramework(update.frameworkId);
            successCount++;
          } catch (error) {
            failureCount++;
            failures.push(`${update.frameworkId}: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    );
    
    // Show summary
    showUpdateSummary(successCount, failureCount, failures);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to update frameworks: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Show update summary after completion
 */
function showUpdateSummary(successCount: number, failureCount: number, failures: string[]): void {
  if (failureCount === 0) {
    vscode.window.showInformationMessage(
      `Successfully updated ${successCount} framework${successCount === 1 ? '' : 's'}`
    );
  } else if (successCount === 0) {
    vscode.window.showErrorMessage(
      `Failed to update all frameworks:\n${failures.join('\n')}`
    );
  } else {
    vscode.window.showWarningMessage(
      `Updated ${successCount} framework${successCount === 1 ? '' : 's'}, ${failureCount} failed:\n${failures.join('\n')}`
    );
  }
}
