import * as vscode from 'vscode';
import { FrameworkManager } from './services/framework-manager';
import { SteeringValidator } from './services/steering-validator';
import { FrameworkReferenceManager } from './services/framework-reference-manager';
import { browseFrameworksCommand, updateFrameworkCommand, updateAllFrameworksCommand } from './commands/framework-commands';
import { createCustomSteeringCommand, renameCustomSteeringCommand, deleteCustomSteeringCommand, exportCustomSteeringCommand, validateSteeringCommand } from './commands/steering-commands';
import { initializeWorkspaceCommand, searchFrameworksCommand, viewFrameworkReferenceCommand } from './commands/workspace-commands';
import { SteeringTreeProvider } from './providers/steering-tree-provider';
import { FrameworkReferenceCodeLensProvider } from './providers/framework-reference-codelens';
import { FrameworkHoverProvider } from './providers/framework-hover-provider';
import { FileSystemOperations } from './utils/file-system';
import { FrameworkUpdate } from './models/framework';
import { SteeringItem } from './models/steering';

/**
 * Extension activation function
 * Called when the extension is activated (workspace contains .kiro/ or initializeWorkspace command is executed)
 */
export function activate(context: vscode.ExtensionContext): { context: vscode.ExtensionContext } {
  const activationStart = Date.now();
  console.log('Agentic Reviewer extension is now active');

  // Set context for conditional UI elements
  vscode.commands.executeCommand('setContext', 'agenticReviewer.activated', true);

  // Initialize services
  const fileSystem = new FileSystemOperations();
  const frameworkManager = new FrameworkManager(context);
  const steeringValidator = new SteeringValidator();
  const referenceManager = new FrameworkReferenceManager(context);
  const steeringTreeProvider = new SteeringTreeProvider(fileSystem, frameworkManager);

  // Create diagnostic collection for validation issues
  const diagnosticCollection = vscode.languages.createDiagnosticCollection('agentic-reviewer');
  context.subscriptions.push(diagnosticCollection);

  // Register commands
  registerCommands(context, frameworkManager, steeringTreeProvider, fileSystem, steeringValidator, diagnosticCollection, referenceManager);

  // Register tree view providers
  registerTreeViews(context, steeringTreeProvider, fileSystem);

  // Register language feature providers
  registerLanguageProviders(context, fileSystem);

  // Show welcome message on first activation
  showWelcomeMessage(context);

  // Check for framework updates on activation (async, don't block)
  checkForFrameworkUpdates(frameworkManager);

  // Log activation time
  const activationTime = Date.now() - activationStart;
  console.log(`Agentic Reviewer activated in ${activationTime}ms`);
  
  // Warn if activation is slow (target < 500ms)
  if (activationTime > 500) {
    console.warn(`Activation time exceeded target: ${activationTime}ms > 500ms`);
  }

  // Return context for testing
  return { context };
}

/**
 * Extension deactivation function
 * Called when the extension is deactivated
 */
export function deactivate(): void {
  console.log('Agentic Reviewer extension is now deactivated');
}

/**
 * Register all extension commands
 */
function registerCommands(
  context: vscode.ExtensionContext, 
  frameworkManager: FrameworkManager,
  steeringTreeProvider: SteeringTreeProvider,
  fileSystem: FileSystemOperations,
  steeringValidator: SteeringValidator,
  diagnosticCollection: vscode.DiagnosticCollection,
  referenceManager: FrameworkReferenceManager
): void {
  // Framework commands
  const browseFrameworks = vscode.commands.registerCommand(
    'agentic-reviewer.browseFrameworks',
    async () => {
      await browseFrameworksCommand(context, frameworkManager);
    }
  );

  const installFramework = vscode.commands.registerCommand(
    'agentic-reviewer.installFramework',
    async () => {
      vscode.window.showInformationMessage('Install Framework - Coming soon!');
    }
  );

  const updateFramework = vscode.commands.registerCommand(
    'agentic-reviewer.updateFramework',
    async (item?: SteeringItem) => {
      const frameworkId = item?.frameworkId;
      await updateFrameworkCommand(frameworkManager, frameworkId);
      steeringTreeProvider.refresh();
    }
  );

  const updateAllFrameworks = vscode.commands.registerCommand(
    'agentic-reviewer.updateAllFrameworks',
    async () => {
      await updateAllFrameworksCommand(frameworkManager);
      steeringTreeProvider.refresh();
    }
  );

  const removeFramework = vscode.commands.registerCommand(
    'agentic-reviewer.removeFramework',
    async () => {
      vscode.window.showInformationMessage('Remove Framework - Coming soon!');
    }
  );

  // Steering commands
  const createCustomSteering = vscode.commands.registerCommand(
    'agentic-reviewer.createCustomSteering',
    async () => {
      await createCustomSteeringCommand(fileSystem);
      steeringTreeProvider.refresh();
    }
  );

  const validateSteering = vscode.commands.registerCommand(
    'agentic-reviewer.validateSteering',
    async () => {
      await validateSteeringCommand(steeringValidator, diagnosticCollection);
    }
  );

  const renameCustomSteering = vscode.commands.registerCommand(
    'agentic-reviewer.renameCustomSteering',
    async (item?: SteeringItem) => {
      await renameCustomSteeringCommand(fileSystem, item);
      steeringTreeProvider.refresh();
    }
  );

  const deleteCustomSteering = vscode.commands.registerCommand(
    'agentic-reviewer.deleteCustomSteering',
    async (item?: SteeringItem) => {
      await deleteCustomSteeringCommand(fileSystem, item);
      steeringTreeProvider.refresh();
    }
  );

  const exportCustomSteering = vscode.commands.registerCommand(
    'agentic-reviewer.exportCustomSteering',
    async (item?: SteeringItem) => {
      await exportCustomSteeringCommand(item);
    }
  );

  // Workspace commands
  const initializeWorkspace = vscode.commands.registerCommand(
    'agentic-reviewer.initializeWorkspace',
    async () => {
      await initializeWorkspaceCommand(context, fileSystem, frameworkManager);
    }
  );

  const searchFrameworks = vscode.commands.registerCommand(
    'agentic-reviewer.searchFrameworks',
    async () => {
      await searchFrameworksCommand(referenceManager);
    }
  );

  const viewFrameworkReference = vscode.commands.registerCommand(
    'agentic-reviewer.viewFrameworkReference',
    async (referenceFileName: string) => {
      await viewFrameworkReferenceCommand(referenceManager, referenceFileName);
    }
  );

  const initializeFrameworksDirectory = vscode.commands.registerCommand(
    'agentic-reviewer.initializeFrameworksDirectory',
    async () => {
      try {
        await referenceManager.initializeFrameworksDirectory();
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to initialize frameworks directory: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  const refreshSteeringTree = vscode.commands.registerCommand(
    'agentic-reviewer.refreshSteeringTree',
    () => {
      steeringTreeProvider.refresh();
    }
  );

  const openSteeringDocument = vscode.commands.registerCommand(
    'agentic-reviewer.openSteeringDocument',
    async (item: { resourceUri?: string }) => {
      if (item && item.resourceUri) {
        const uri = vscode.Uri.file(item.resourceUri);
        await vscode.window.showTextDocument(uri);
      }
    }
  );

  const revealSteeringDocument = vscode.commands.registerCommand(
    'agentic-reviewer.revealSteeringDocument',
    async (item: { resourceUri?: string }) => {
      if (item && item.resourceUri) {
        const uri = vscode.Uri.file(item.resourceUri);
        await vscode.commands.executeCommand('revealFileInOS', uri);
      }
    }
  );

  // Add all commands to subscriptions
  context.subscriptions.push(
    browseFrameworks,
    installFramework,
    updateFramework,
    updateAllFrameworks,
    removeFramework,
    createCustomSteering,
    validateSteering,
    renameCustomSteering,
    deleteCustomSteering,
    exportCustomSteering,
    initializeWorkspace,
    searchFrameworks,
    viewFrameworkReference,
    initializeFrameworksDirectory,
    refreshSteeringTree,
    openSteeringDocument,
    revealSteeringDocument
  );
}

/**
 * Register tree view providers
 */
function registerTreeViews(
  context: vscode.ExtensionContext,
  steeringTreeProvider: SteeringTreeProvider,
  fileSystem: FileSystemOperations
): void {
  // Register steering tree view
  const treeView = vscode.window.createTreeView('agenticReviewer.steeringTree', {
    treeDataProvider: steeringTreeProvider,
    showCollapseAll: true
  });

  context.subscriptions.push(treeView);

  // Set up file system watcher for .kiro/steering/ changes
  setupFileSystemWatcher(context, steeringTreeProvider, fileSystem);
}

/**
 * Register language feature providers (code lens, hover, etc.)
 */
function registerLanguageProviders(
  context: vscode.ExtensionContext,
  fileSystem: FileSystemOperations
): void {
  // Register code lens provider for steering documents
  const codeLensProvider = new FrameworkReferenceCodeLensProvider(fileSystem);
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    { scheme: 'file', pattern: '**/.kiro/steering/*.md' },
    codeLensProvider
  );
  context.subscriptions.push(codeLensDisposable);

  // Register hover provider for steering documents
  const hoverProvider = new FrameworkHoverProvider(fileSystem);
  const hoverDisposable = vscode.languages.registerHoverProvider(
    { scheme: 'file', pattern: '**/.kiro/steering/*.md' },
    hoverProvider
  );
  context.subscriptions.push(hoverDisposable);
}

/**
 * Set up file system watcher for .kiro/steering/ directory
 */
function setupFileSystemWatcher(
  context: vscode.ExtensionContext,
  steeringTreeProvider: SteeringTreeProvider,
  fileSystem: FileSystemOperations
): void {
  try {
    const steeringPath = fileSystem.getSteeringPath();
    
    // Create file system watcher for markdown files in steering directory
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(steeringPath, '*.md')
    );

    // Debounce refresh to avoid excessive updates
    let refreshTimeout: NodeJS.Timeout | undefined;
    const debouncedRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(() => {
        steeringTreeProvider.refresh();
      }, 500); // 500ms debounce
    };

    // Refresh tree view on file changes (debounced)
    watcher.onDidCreate(debouncedRefresh);
    watcher.onDidChange(debouncedRefresh);
    watcher.onDidDelete(debouncedRefresh);

    context.subscriptions.push(watcher);
  } catch (error) {
    // No workspace or .kiro directory - watcher will be set up when workspace is initialized
    console.log('File system watcher not set up: no .kiro/steering/ directory');
  }
}

/**
 * Show welcome message on first activation
 */
function showWelcomeMessage(context: vscode.ExtensionContext): void {
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome', false);
  
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'Welcome to Agentic Reviewer! Use "Browse Frameworks" to get started.',
      'Browse Frameworks',
      'Dismiss'
    ).then(selection => {
      if (selection === 'Browse Frameworks') {
        vscode.commands.executeCommand('agentic-reviewer.browseFrameworks');
      }
    });
    
    context.globalState.update('hasShownWelcome', true);
  }
}

/**
 * Check for framework updates on activation
 */
async function checkForFrameworkUpdates(frameworkManager: FrameworkManager): Promise<void> {
  try {
    const updates = await frameworkManager.checkForUpdates();
    
    if (updates.length > 0) {
      const message = updates.length === 1
        ? `1 framework update available`
        : `${updates.length} framework updates available`;
      
      vscode.window.showInformationMessage(
        message,
        'View Updates',
        'Dismiss'
      ).then(selection => {
        if (selection === 'View Updates') {
          showUpdatesList(updates, frameworkManager);
        }
      });
    }
  } catch (error) {
    // Silently fail - don't interrupt activation with update check errors
    console.error('Failed to check for framework updates:', error);
  }
}

/**
 * Show list of available updates
 */
async function showUpdatesList(updates: FrameworkUpdate[], frameworkManager: FrameworkManager): Promise<void> {
  const items = updates.map(update => ({
    label: update.frameworkId,
    description: `${update.currentVersion} → ${update.latestVersion}`,
    detail: update.changes.join(', '),
    update
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select a framework to update',
    canPickMany: false
  });

  if (selected) {
    try {
      await frameworkManager.updateFramework(selected.update.frameworkId);
      vscode.window.showInformationMessage(`Framework updated: ${selected.update.frameworkId}`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to update framework: ${error}`);
    }
  }
}
