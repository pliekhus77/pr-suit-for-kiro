import * as vscode from 'vscode';
import { FileSystemOperations } from '../utils/file-system';
import { FrameworkManager } from '../services/framework-manager';
import { FrameworkReferenceManager, SearchResult } from '../services/framework-reference-manager';

/**
 * Initialize Workspace Command
 * DEPRECATED: Removed from extension - kept for reference only
 * Creates .kiro/ directory structure and optionally installs recommended frameworks
 */
/* istanbul ignore next */
async function _initializeWorkspaceCommand_DEPRECATED(
  context: vscode.ExtensionContext,
  fileSystem: FileSystemOperations,
  frameworkManager: FrameworkManager
): Promise<void> {
  try {
    // Check if workspace is open
    const workspacePath = fileSystem.getWorkspacePath();
    if (!workspacePath) {
      vscode.window.showErrorMessage('No workspace folder open. Please open a folder first.');
      return;
    }

    // Check if .kiro/ directory already exists
    const kiroPath = `${workspacePath}/.kiro`;
    const kiroExists = await fileSystem.directoryExists(kiroPath);
    
    if (kiroExists) {
      const choice = await vscode.window.showWarningMessage(
        'Workspace is already initialized with .kiro/ directory. Do you want to continue?',
        'Continue',
        'Cancel'
      );
      
      if (choice !== 'Continue') {
        return;
      }
    }

    // Create directory structure with progress
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Initializing workspace...',
        cancellable: false
      },
      async (progress) => {
        // Create .kiro/ directory structure
        progress.report({ message: 'Creating directory structure...', increment: 20 });
        await createDirectoryStructure(fileSystem, workspacePath);
        
        // Prompt for recommended frameworks installation
        progress.report({ message: 'Preparing framework installation...', increment: 20 });
        const installChoice = await promptForFrameworkInstallation();
        
        if (installChoice === 'Yes') {
          // Install recommended frameworks
          progress.report({ message: 'Installing recommended frameworks...', increment: 30 });
          await installRecommendedFrameworks(frameworkManager);
        } else if (installChoice === 'Custom') {
          // Show framework browser
          progress.report({ message: 'Opening framework browser...', increment: 30 });
          await vscode.commands.executeCommand('agentic-reviewer.browseFrameworks');
        }
        
        progress.report({ message: 'Finalizing...', increment: 30 });
      }
    );

    // Show welcome message with next steps
    await showWelcomeMessage(context);
    
    // Trigger extension activation (refresh tree view, etc.)
    await vscode.commands.executeCommand('agentic-reviewer.refreshSteeringTree');
    
    // Set activation context
    await vscode.commands.executeCommand('setContext', 'agenticReviewer.activated', true);
    
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to initialize workspace: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Create .kiro/ directory structure
 */
async function createDirectoryStructure(
  fileSystem: FileSystemOperations,
  workspacePath: string
): Promise<void> {
  // Create main .kiro/ directory
  const kiroPath = `${workspacePath}/.kiro`;
  await fileSystem.ensureDirectory(kiroPath);
  
  // Create subdirectories
  await fileSystem.ensureDirectory(`${kiroPath}/steering`);
  await fileSystem.ensureDirectory(`${kiroPath}/specs`);
  await fileSystem.ensureDirectory(`${kiroPath}/settings`);
  await fileSystem.ensureDirectory(`${kiroPath}/.metadata`);
  
  // Optionally create frameworks/ directory
  const frameworksPath = `${workspacePath}/frameworks`;
  await fileSystem.ensureDirectory(frameworksPath);
}

/**
 * Prompt user for framework installation preference
 */
async function promptForFrameworkInstallation(): Promise<string | undefined> {
  const choice = await vscode.window.showInformationMessage(
    'Would you like to install recommended framework steering documents?',
    { modal: true, detail: 'Recommended frameworks: TDD/BDD, C4 Model, DevOps, 4D SDLC + SAFe' },
    'Yes',
    'Custom',
    'Skip'
  );
  
  return choice;
}

/**
 * Install recommended frameworks
 */
async function installRecommendedFrameworks(
  frameworkManager: FrameworkManager
): Promise<void> {
  const recommendedFrameworks = [
    'tdd-bdd-strategy',
    'c4-model-strategy',
    'devops-strategy',
    '4d-safe-strategy'
  ];
  
  let successCount = 0;
  let failureCount = 0;
  const failures: string[] = [];
  
  for (const frameworkId of recommendedFrameworks) {
    try {
      await frameworkManager.installFramework(frameworkId);
      successCount++;
    } catch (error) {
      failureCount++;
      failures.push(`${frameworkId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Show summary
  if (failureCount === 0) {
    vscode.window.showInformationMessage(
      `Successfully installed ${successCount} recommended framework${successCount === 1 ? '' : 's'}`
    );
  } else if (successCount === 0) {
    vscode.window.showErrorMessage(
      `Failed to install recommended frameworks:\n${failures.join('\n')}`
    );
  } else {
    vscode.window.showWarningMessage(
      `Installed ${successCount} framework${successCount === 1 ? '' : 's'}, ${failureCount} failed:\n${failures.join('\n')}`
    );
  }
}

/**
 * Show welcome message with next steps
 */
async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
  const message = `Welcome to Agentic Reviewer!

Your workspace has been initialized with the following structure:
• .kiro/steering/ - Framework steering documents
• .kiro/specs/ - Feature specifications
• .kiro/settings/ - Extension settings
• frameworks/ - Framework reference documentation

Next steps:
1. Browse and install framework steering documents
2. Create your first feature spec
3. Configure MCP servers for enhanced functionality

Would you like to browse available frameworks now?`;

  const choice = await vscode.window.showInformationMessage(
    message,
    'Browse Frameworks',
    'Dismiss'
  );
  
  if (choice === 'Browse Frameworks') {
    await vscode.commands.executeCommand('agentic-reviewer.browseFrameworks');
  }
  
  // Mark that welcome has been shown
  await context.globalState.update('hasShownWelcome', true);
}

/**
 * Search Frameworks Command
 * Full-text search across all framework reference documents
 */
export async function searchFrameworksCommand(
  referenceManager: FrameworkReferenceManager
): Promise<void> {
  try {
    // Check if frameworks directory exists
    const exists = await referenceManager.frameworksDirectoryExists();
    
    if (!exists) {
      const choice = await vscode.window.showInformationMessage(
        'Framework reference documentation not found. Would you like to initialize the frameworks directory?',
        'Initialize',
        'Cancel'
      );

      if (choice === 'Initialize') {
        await referenceManager.initializeFrameworksDirectory();
      } else {
        return;
      }
    }

    // Prompt for search query
    const query = await vscode.window.showInputBox({
      prompt: 'Search framework reference documentation',
      placeHolder: 'Enter search term (e.g., "aggregate", "STRIDE", "blue-green")',
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please enter a search term';
        }
        if (value.trim().length < 2) {
          return 'Search term must be at least 2 characters';
        }
        return null;
      }
    });

    if (!query) {
      return;
    }

    // Perform search with progress indicator
    const results = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Searching framework references...',
        cancellable: false
      },
      async () => {
        return await referenceManager.searchFrameworkReferences(query);
      }
    );

    if (results.length === 0) {
      vscode.window.showInformationMessage(
        `No results found for "${query}"`
      );
      return;
    }

    // Show results in quick pick
    await showSearchResults(results, query);

  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to search frameworks: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Show search results in quick pick
 */
async function showSearchResults(results: SearchResult[], query: string): Promise<void> {
  const items = results.map(result => ({
    label: `$(file) ${result.fileName}`,
    description: `Line ${result.lineNumber}`,
    detail: result.matchedText,
    result
  }));

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: `${results.length} result${results.length === 1 ? '' : 's'} found for "${query}"`,
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (selected) {
    // Open the file at the specific line
    const uri = vscode.Uri.file(selected.result.filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document, { preview: false });
    
    // Move cursor to the line with the match
    const line = selected.result.lineNumber - 1;
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(
      new vscode.Range(position, position),
      vscode.TextEditorRevealType.InCenter
    );
  }
}

/**
 * View Framework Reference Command
 * Opens the framework reference document for a steering document
 */
export async function viewFrameworkReferenceCommand(
  referenceManager: FrameworkReferenceManager,
  referenceFileName: string
): Promise<void> {
  try {
    await referenceManager.openFrameworkReference(referenceFileName);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to open framework reference: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
