/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';
import { FrameworkHoverProvider } from '../framework-hover-provider';
import { FileSystemOperations } from '../../utils/file-system';

// Mock vscode module
jest.mock('vscode');

describe('FrameworkHoverProvider', () => {
  let provider: FrameworkHoverProvider;
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
      getText: jest.fn().mockReturnValue('This is about TDD and BDD'),
      getWordRangeAtPosition: jest.fn(),
      lineAt: jest.fn(),
      lineCount: 100
    } as any;

    provider = new FrameworkHoverProvider(mockFileSystem);
  });

  describe('provideHover', () => {
    it('should provide hover for TDD term', () => {
      const position = new vscode.Position(0, 15);
      const wordRange = new vscode.Range(0, 14, 0, 17);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(wordRange);
      mockDocument.getText = jest.fn().mockReturnValue('TDD');

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeDefined();
      expect(hover).toBeInstanceOf(vscode.Hover);
      expect((hover as vscode.Hover).contents[0]).toContain('Test-Driven Development');
    });

    it('should provide hover for BDD term', () => {
      const position = new vscode.Position(0, 23);
      const wordRange = new vscode.Range(0, 22, 0, 25);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(wordRange);
      mockDocument.getText = jest.fn().mockReturnValue('BDD');

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeDefined();
      expect((hover as vscode.Hover).contents[0]).toContain('Behavior-Driven Development');
    });

    it('should provide hover for C4 Model term', () => {
      const position = new vscode.Position(0, 10);
      const wordRange = new vscode.Range(0, 8, 0, 16);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(wordRange);
      mockDocument.getText = jest.fn().mockReturnValue('C4 Model');

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeDefined();
      expect((hover as vscode.Hover).contents[0]).toContain('hierarchical set of software architecture diagrams');
    });

    it('should provide hover for STRIDE term', () => {
      const position = new vscode.Position(0, 10);
      const wordRange = new vscode.Range(0, 8, 0, 14);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(wordRange);
      mockDocument.getText = jest.fn().mockReturnValue('STRIDE');

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeDefined();
      expect((hover as vscode.Hover).contents[0]).toContain('threat modeling framework');
    });

    it('should not provide hover for unknown terms', () => {
      const position = new vscode.Position(0, 10);
      const wordRange = new vscode.Range(0, 8, 0, 16);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(wordRange);
      mockDocument.getText = jest.fn().mockReturnValue('unknown');

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeNull();
    });

    it('should not provide hover for non-steering documents', () => {
      const nonSteeringDoc = {
        uri: { fsPath: '/workspace/README.md' },
        getText: jest.fn().mockReturnValue('TDD'),
        getWordRangeAtPosition: jest.fn().mockReturnValue(new vscode.Range(0, 8, 0, 11)),
        lineAt: jest.fn(),
        lineCount: 100
      } as any;
      const position = new vscode.Position(0, 10);

      const hover = provider.provideHover(nonSteeringDoc, position, {} as any);

      expect(hover).toBeNull();
    });

    it('should handle case-insensitive matching', () => {
      const position = new vscode.Position(0, 10);
      const wordRange = new vscode.Range(0, 8, 0, 11);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(wordRange);
      mockDocument.getText = jest.fn().mockReturnValue('tdd');

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeDefined();
      expect((hover as vscode.Hover).contents[0]).toContain('Test-Driven Development');
    });

    it('should return null when no word range at position', () => {
      const position = new vscode.Position(0, 10);
      mockDocument.getWordRangeAtPosition = jest.fn().mockReturnValue(undefined);

      const hover = provider.provideHover(mockDocument, position, {} as any);

      expect(hover).toBeNull();
    });
  });
});
