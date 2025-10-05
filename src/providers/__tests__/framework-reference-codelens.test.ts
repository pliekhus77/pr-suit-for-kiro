/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';
import { FrameworkReferenceCodeLensProvider } from '../framework-reference-codelens';
import { FileSystemOperations } from '../../utils/file-system';

// Mock vscode module
jest.mock('vscode');

describe('FrameworkReferenceCodeLensProvider', () => {
  let provider: FrameworkReferenceCodeLensProvider;
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockDocument: jest.Mocked<vscode.TextDocument>;

  beforeEach(() => {
    // Create mock file system
    mockFileSystem = {
      getSteeringPath: jest.fn().mockReturnValue('/workspace/.kiro/steering'),
      getWorkspacePath: jest.fn().mockReturnValue('/workspace'),
      getKiroPath: jest.fn().mockReturnValue('/workspace/.kiro'),
      getFrameworksPath: jest.fn().mockReturnValue('/workspace/frameworks'),
      getMetadataPath: jest.fn().mockReturnValue('/workspace/.kiro/.metadata'),
      ensureDirectory: jest.fn(),
      directoryExists: jest.fn(),
      listFiles: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      copyFile: jest.fn(),
      deleteFile: jest.fn(),
      fileExists: jest.fn()
    } as any;

    // Create mock document
    mockDocument = {
      uri: {
        fsPath: '/workspace/.kiro/steering/strategy-tdd-bdd.md'
      },
      getText: jest.fn(),
      lineAt: jest.fn(),
      lineCount: 100
    } as any;

    provider = new FrameworkReferenceCodeLensProvider(mockFileSystem);
  });

  describe('provideCodeLenses', () => {
    it('should provide code lens for steering documents', () => {
      const codeLenses = provider.provideCodeLenses(mockDocument, {} as any) as vscode.CodeLens[];
      
      expect(codeLenses).toHaveLength(1);
      expect(codeLenses[0].command?.title).toBe('📖 View Framework Reference');
      expect(codeLenses[0].command?.command).toBe('agentic-reviewer.viewFrameworkReference');
      expect(codeLenses[0].command?.arguments).toEqual(['test-driven-development.md']);
    });

    it('should not provide code lens for non-steering documents', () => {
      const nonSteeringDoc = {
        uri: { fsPath: '/workspace/README.md' },
        getText: jest.fn(),
        lineAt: jest.fn(),
        lineCount: 100
      } as any;
      
      const codeLenses = provider.provideCodeLenses(nonSteeringDoc, {} as any) as vscode.CodeLens[];
      
      expect(codeLenses).toHaveLength(0);
    });

    it('should not provide code lens for steering documents without reference mapping', () => {
      const customDoc = {
        uri: { fsPath: '/workspace/.kiro/steering/custom-doc.md' },
        getText: jest.fn(),
        lineAt: jest.fn(),
        lineCount: 100
      } as any;
      
      const codeLenses = provider.provideCodeLenses(customDoc, {} as any) as vscode.CodeLens[];
      
      expect(codeLenses).toHaveLength(0);
    });

    it('should provide code lens for strategy-security.md', () => {
      const securityDoc = {
        uri: { fsPath: '/workspace/.kiro/steering/strategy-security.md' },
        getText: jest.fn(),
        lineAt: jest.fn(),
        lineCount: 100
      } as any;
      
      const codeLenses = provider.provideCodeLenses(securityDoc, {} as any) as vscode.CodeLens[];
      
      expect(codeLenses).toHaveLength(1);
      expect(codeLenses[0].command?.arguments).toEqual(['sabsa-framework.md']);
    });

    it('should provide code lens for strategy-c4-model.md', () => {
      const c4Doc = {
        uri: { fsPath: '/workspace/.kiro/steering/strategy-c4-model.md' },
        getText: jest.fn(),
        lineAt: jest.fn(),
        lineCount: 100
      } as any;
      
      const codeLenses = provider.provideCodeLenses(c4Doc, {} as any) as vscode.CodeLens[];
      
      expect(codeLenses).toHaveLength(1);
      expect(codeLenses[0].command?.arguments).toEqual(['c4-model.md']);
    });

    it('should provide code lens at top of document (line 0)', () => {
      const codeLenses = provider.provideCodeLenses(mockDocument, {} as any) as vscode.CodeLens[];
      
      expect(codeLenses[0].range.start.line).toBe(0);
      expect(codeLenses[0].range.start.character).toBe(0);
      expect(codeLenses[0].range.end.line).toBe(0);
      expect(codeLenses[0].range.end.character).toBe(0);
    });
  });
});
