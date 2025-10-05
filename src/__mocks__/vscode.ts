// Mock for VS Code API
export const workspace = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workspaceFolders: undefined as any,
  openTextDocument: jest.fn(),
  fs: {
    stat: jest.fn()
  }
};

export const Uri = {
  file: (path: string) => ({ fsPath: path }),
  joinPath: jest.fn((base, ...paths) => ({ 
    fsPath: `${base.fsPath}/${paths.join('/')}` 
  }))
};

export const window = {
  showErrorMessage: jest.fn(),
  showInformationMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showQuickPick: jest.fn(),
  showTextDocument: jest.fn(),
  withProgress: jest.fn()
};

export const commands = {
  registerCommand: jest.fn(),
  executeCommand: jest.fn()
};

export const ExtensionContext = jest.fn();

export enum QuickPickItemKind {
  Separator = -1,
  Default = 0
}

export enum ProgressLocation {
  SourceControl = 1,
  Window = 10,
  Notification = 15
}

export enum TreeItemCollapsibleState {
  None = 0,
  Collapsed = 1,
  Expanded = 2
}

export enum DiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}

export class Range {
  start: Position;
  end: Position;

  constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number) {
    this.start = new Position(startLine, startCharacter);
    this.end = new Position(endLine, endCharacter);
  }
}

export class Position {
  line: number;
  character: number;

  constructor(line: number, character: number) {
    this.line = line;
    this.character = character;
  }
}

export class Diagnostic {
  range: Range;
  message: string;
  severity: DiagnosticSeverity;
  code?: string | number;
  source?: string;

  constructor(range: Range, message: string, severity?: DiagnosticSeverity) {
    this.range = range;
    this.message = message;
    this.severity = severity ?? DiagnosticSeverity.Error;
  }
}

export const languages = {
  createDiagnosticCollection: jest.fn(() => ({
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    dispose: jest.fn()
  }))
};

export class EventEmitter {
  private listeners: Array<(e: unknown) => void> = [];
  public readonly event: (listener: (e: unknown) => void) => { dispose: () => void };

  constructor() {
    // Initialize event property in constructor to ensure it's available immediately
    this.event = (listener: (e: unknown) => void) => {
      this.listeners.push(listener);
      return {
        dispose: () => {
          const index = this.listeners.indexOf(listener);
          if (index > -1) {
            this.listeners.splice(index, 1);
          }
        }
      };
    };
  }

  fire(data?: unknown): void {
    this.listeners.forEach(listener => listener(data));
  }

  dispose(): void {
    this.listeners = [];
  }
}

export class TreeItem {
  label: string;
  resourceUri: unknown;
  command: unknown;
  contextValue: string | undefined;
  iconPath: unknown;
  tooltip: string | undefined;
  collapsibleState: TreeItemCollapsibleState;

  constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
    this.label = label;
    this.collapsibleState = collapsibleState ?? TreeItemCollapsibleState.None;
    this.resourceUri = undefined;
    this.command = undefined;
    this.contextValue = undefined;
    this.iconPath = undefined;
    this.tooltip = undefined;
  }
}

export class ThemeIcon {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class CodeLens {
  range: Range;
  command?: { title: string; command: string; arguments?: unknown[] };
  isResolved: boolean;

  constructor(range: Range, command?: { title: string; command: string; arguments?: unknown[] }) {
    this.range = range;
    if (command) {
      this.command = {
        title: command.title,
        command: command.command,
        arguments: command.arguments
      };
    }
    this.isResolved = !!command;
  }
}

export class Hover {
  contents: unknown[];
  range?: Range;

  constructor(contents: unknown | unknown[], range?: Range) {
    this.contents = Array.isArray(contents) ? contents : [contents];
    this.range = range;
  }
}

export class MarkdownString {
  value: string;
  isTrusted?: boolean;

  constructor(value?: string) {
    this.value = value || '';
  }
}
